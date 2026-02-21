import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { apiFetchJson } from "@/lib/api";
import { AlertCircle, MapPin, TrendingDown, Zap } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type OptimizationResult = {
  current_vehicle: string;
  current_emission: number;
  suggestions: Array<{
    better_vehicle: string;
    new_emission: number;
    co2_saved: number;
  }>;
};

type MapboxGLModule = typeof mapboxgl;

const VEHICLE_TYPES = ["diesel", "petrol", "electric"];

/**
 * Calculate distance between two lat/lng points using Haversine formula
 * Returns distance in kilometers
 */
const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Get route color based on vehicle type
 */
const getRouteColor = (vehicle: string): string => {
  switch (vehicle.toLowerCase()) {
    case "electric":
      return "#10b981"; // emerald green
    case "petrol":
      return "#f97316"; // orange
    case "diesel":
      return "#ef4444"; // red
    default:
      return "#6b7280"; // gray
  }
};

const Optimization = () => {
  // Form state
  const [startLat, setStartLat] = useState<string>("");
  const [startLon, setStartLon] = useState<string>("");
  const [endLat, setEndLat] = useState<string>("");
  const [endLon, setEndLon] = useState<string>("");
  const [vehicle, setVehicle] = useState<string>("diesel");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  // Map references
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const lineSourceRef = useRef<boolean>(false);

  // Mapbox token from environment variable
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  /**
   * Initialize Mapbox map
   */
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) {
      console.error("Mapbox token not found in environment variables");
      return;
    }

    // Dynamically set Mapbox access token
    (mapboxgl as MapboxGLModule).accessToken = mapboxToken;

    // Create map instance
    map.current = new (mapboxgl as MapboxGLModule).Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [0, 0],
      zoom: 2,
    });

    // Add navigation controls
    map.current.addControl(new (mapboxgl as MapboxGLModule).NavigationControl());

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxToken]);

  /**
   * Update map with route when form changes or result is available
   */
  useEffect(() => {
    if (!map.current || !startLat || !startLon || !endLat || !endLon) return;

    try {
      const sLat = parseFloat(startLat);
      const sLon = parseFloat(startLon);
      const eLat = parseFloat(endLat);
      const eLon = parseFloat(endLon);

      if (isNaN(sLat) || isNaN(sLon) || isNaN(eLat) || isNaN(eLon)) return;

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Add start marker
      const startMarker = new (mapboxgl as MapboxGLModule).Marker({
        color: "#10b981",
      })
        .setLngLat([sLon, sLat])
        .addTo(map.current);
      markersRef.current.push(startMarker);

      // Add end marker
      const endMarker = new (mapboxgl as MapboxGLModule).Marker({
        color: "#ef4444",
      })
        .setLngLat([eLon, eLat])
        .addTo(map.current);
      markersRef.current.push(endMarker);

      // Center map and zoom
      const bounds = new (mapboxgl as any).LngLatBounds(
        [sLon, sLat],
        [eLon, eLat]
      );
      map.current.fitBounds(bounds, { padding: 50 });

      // Add or update line source
      if (!lineSourceRef.current) {
        map.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [[sLon, sLat], [eLon, eLat]],
            },
            properties: {},
          },
        });

        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": result ? getRouteColor(result.current_vehicle) : "#6b7280",
            "line-width": 4,
            "line-opacity": 0.8,
          },
        });

        lineSourceRef.current = true;
      } else {
        // Update existing line
        const source = map.current.getSource("route") as any;
        if (source) {
          source.setData({
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [[sLon, sLat], [eLon, eLat]],
            },
            properties: {},
          });

          const layer = map.current.getLayer("route");
          if (layer) {
            map.current.setPaintProperty(
              "route",
              "line-color",
              result ? getRouteColor(result.current_vehicle) : "#6b7280"
            );
          }
        }
      }
    } catch (err) {
      console.error("Map update error:", err);
    }
  }, [startLat, startLon, endLat, endLon, result]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    // Validate inputs
    const sLat = parseFloat(startLat);
    const sLon = parseFloat(startLon);
    const eLat = parseFloat(endLat);
    const eLon = parseFloat(endLon);

    if (
      isNaN(sLat) ||
      isNaN(sLon) ||
      isNaN(eLat) ||
      isNaN(eLon) ||
      !vehicle
    ) {
      setError("Please fill in all fields with valid coordinates.");
      return;
    }

    if (
      sLat < -90 ||
      sLat > 90 ||
      eLat < -90 ||
      eLat > 90 ||
      sLon < -180 ||
      sLon > 180 ||
      eLon < -180 ||
      eLon > 180
    ) {
      setError("Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.");
      return;
    }

    // Calculate distance
    const calculatedDistance = calculateHaversineDistance(sLat, sLon, eLat, eLon);
    setDistance(calculatedDistance);

    if (calculatedDistance < 0.1) {
      setError("Start and end points are too close. Please enter points that are at least 0.1 km apart.");
      return;
    }

    // Call optimization API
    setIsLoading(true);

    try {
      const optimizationResult = await apiFetchJson<OptimizationResult>("/optimize", {
        method: "POST",
        body: JSON.stringify({
          distance_km: calculatedDistance,
          current_vehicle: vehicle,
        }),
      });

      setResult(optimizationResult);
    } catch (err) {
      setError("Failed to get optimization suggestions. Please try again.");
      console.error("Optimization error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-12 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground">Route Optimization</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Find the most eco-friendly vehicle option for your route
            </p>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left Panel: Form */}
            <div className="flex flex-col">
              <Card className="glass-card border border-emerald/10 p-6 shadow-soft flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-6">Route Details</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Start Location */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Start Location</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Latitude</label>
                        <Input
                          type="number"
                          placeholder="e.g., 28.7041"
                          value={startLat}
                          onChange={(e) => setStartLat(e.target.value)}
                          step="0.0001"
                          min="-90"
                          max="90"
                          className="bg-accent/50 border-emerald/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Longitude</label>
                        <Input
                          type="number"
                          placeholder="e.g., 77.1025"
                          value={startLon}
                          onChange={(e) => setStartLon(e.target.value)}
                          step="0.0001"
                          min="-180"
                          max="180"
                          className="bg-accent/50 border-emerald/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* End Location */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">End Location</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Latitude</label>
                        <Input
                          type="number"
                          placeholder="e.g., 28.5355"
                          value={endLat}
                          onChange={(e) => setEndLat(e.target.value)}
                          step="0.0001"
                          min="-90"
                          max="90"
                          className="bg-accent/50 border-emerald/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Longitude</label>
                        <Input
                          type="number"
                          placeholder="e.g., 77.3910"
                          value={endLon}
                          onChange={(e) => setEndLon(e.target.value)}
                          step="0.0001"
                          min="-180"
                          max="180"
                          className="bg-accent/50 border-emerald/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Current Vehicle Type</label>
                    <Select value={vehicle} onValueChange={setVehicle}>
                      <SelectTrigger className="bg-accent/50 border-emerald/20">
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        {VEHICLE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Distance Display */}
                  {distance !== null && (
                    <div className="p-4 rounded-lg bg-emerald/10 border border-emerald/20">
                      <p className="text-sm text-muted-foreground">Calculated Distance</p>
                      <p className="text-xl font-bold text-emerald mt-1">{distance.toFixed(2)} km</p>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Analyzing Route..." : "Get Optimization Suggestions"}
                  </Button>
                </form>
              </Card>

              {/* Results Card */}
              {result && (
                <Card className="glass-card border border-emerald/10 p-6 shadow-soft mt-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">Optimization Results</h3>

                  {/* Current Emission */}
                  <div className="p-4 rounded-lg bg-accent/50 border border-emerald/10 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Current Emission</p>
                        <p className="text-2xl font-bold text-amber-500">
                          {result.current_emission.toFixed(2)} kg CO₂
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                          {result.current_vehicle} vehicle
                        </p>
                      </div>
                      <Zap className="h-8 w-8 text-amber-500 opacity-50" />
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="space-y-3">
                    {result.suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-emerald/10 border border-emerald/20 hover-lift transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Better Option</p>
                            <p className="text-lg font-bold text-foreground capitalize">
                              {suggestion.better_vehicle} Vehicle
                            </p>
                          </div>
                          <TrendingDown className="h-5 w-5 text-emerald" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-muted-foreground">New Emission:</span>
                            <p className="font-bold text-emerald">
                              {suggestion.new_emission.toFixed(2)} kg CO₂
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">CO₂ Saved:</span>
                            <p className="font-bold text-emerald">
                              {suggestion.co2_saved.toFixed(2)} kg
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-emerald font-semibold">
                          {((suggestion.co2_saved / result.current_emission) * 100).toFixed(1)}% reduction
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Right Panel: Map */}
            <div className="h-[600px] lg:h-[700px] rounded-2xl overflow-hidden border border-emerald/10 shadow-soft">
              <div
                ref={mapContainer}
                className="w-full h-full"
                style={{ position: "relative" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Optimization;
