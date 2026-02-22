import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import heroBg from "@/assets/hero-bg.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { apiFetchJson } from "@/lib/api";
import { AlertCircle, MapPin, TrendingDown, Zap, Map, Truck } from "lucide-react";
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

type GPSPoint = {
  id: number;
  lat: number;
  lng: number;
  distance_segment: number;
  co2_segment: number;
  timestamp: string;
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

  // GPS Tracking state
  const [isSimulating, setIsSimulating] = useState(false);
  const [gpsPoints, setGpsPoints] = useState<GPSPoint[]>([]);
  const [currentTruckLocation, setCurrentTruckLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [totalCO2Emitted, setTotalCO2Emitted] = useState(0);
  const truckMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const truckIdRef = useRef<string | null>(null);

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

      // Start GPS simulation
      try {
        const truckId = `truck_${Date.now()}`;
        truckIdRef.current = truckId;
        console.log("Starting GPS simulation for truck:", truckId);
        
        const simResponse = await apiFetchJson("/gps/simulate", {
          method: "POST",
          body: JSON.stringify({
            truck_id: truckId,
            start_lat: sLat,
            start_lon: sLon,
            end_lat: eLat,
            end_lon: eLon,
            vehicle_type: vehicle,
          }),
        });

        console.log("GPS simulation started:", simResponse);
        setIsSimulating(true);
        setGpsPoints([]);
        setCurrentTruckLocation(null);
        setTotalCO2Emitted(0);

        // Function to fetch GPS data
        const fetchGpsData = async () => {
          try {
            const response = await apiFetchJson<{ vehicle_id: string; total_points: number; points: GPSPoint[] }>(`/gps/history/${truckId}?limit=100`, {
              method: "GET",
            });

            console.log("GPS points fetched:", response.points.length);

            if (response.points.length > 0) {
              setGpsPoints(response.points);
              const lastPoint = response.points[response.points.length - 1];
              setCurrentTruckLocation({ lat: lastPoint.lat, lng: lastPoint.lng });

              // Calculate total CO2
              const totalCO2 = response.points.reduce((sum, p) => sum + p.co2_segment, 0);
              setTotalCO2Emitted(totalCO2);

              // Check if simulation is complete (20 waypoints generated)
              if (response.points.length >= 20) {
                console.log("Simulation complete!");
                setIsSimulating(false);
                return false; // Stop polling
              }
            }
            return true; // Continue polling
          } catch (err) {
            console.error("Failed to fetch GPS history:", err);
            return true; // Continue polling even on error
          }
        };

        // Fetch immediately first time with a small delay
        setTimeout(async () => {
          await fetchGpsData();

          // Then set up interval for subsequent fetches
          const interval = setInterval(async () => {
            const shouldContinue = await fetchGpsData();
            if (!shouldContinue) {
              clearInterval(interval);
            }
          }, 5000);

          simulationIntervalRef.current = interval;
        }, 1000);
      } catch (err) {
        console.error("Failed to start GPS simulation:", err);
      }
    } catch (err) {
      setError("Failed to get optimization suggestions. Please try again.");
      console.error("Optimization error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update truck marker position on map
   */
  useEffect(() => {
    if (!map.current || !currentTruckLocation) return;

    // Remove old truck marker
    if (truckMarkerRef.current) {
      truckMarkerRef.current.remove();
    }

    // Create truck marker with custom HTML
    const truckElement = document.createElement("div");
    truckElement.innerHTML = `
      <div style="
        width: 32px;
        height: 32px;
        background-color: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-size: 18px;
      ">
        🚚
      </div>
    `;

    // Get the latest GPS point for CO2 info
    const lastPoint = gpsPoints.length > 0 ? gpsPoints[gpsPoints.length - 1] : null;

    truckMarkerRef.current = new (mapboxgl as MapboxGLModule).Marker({
      element: truckElement,
    })
      .setLngLat([currentTruckLocation.lng, currentTruckLocation.lat])
      .setPopup(
        new (mapboxgl as MapboxGLModule).Popup({ offset: 25 }).setHTML(`
          <div style="padding: 10px; font-family: system-ui; min-width: 200px;">
            <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #1f2937;">
              🚚 Live Truck Location
            </h4>
            <div style="background-color: #f0fdf4; border-left: 3px solid #10b981; padding: 8px; margin-bottom: 8px; border-radius: 4px;">
              <p style="margin: 4px 0; font-size: 12px; color: #15803d;"><strong>Coordinates:</strong></p>
              <p style="margin: 4px 0; font-size: 11px; color: #1f2937; font-family: monospace;">
                ${currentTruckLocation.lat.toFixed(6)}, ${currentTruckLocation.lng.toFixed(6)}
              </p>
            </div>
            <div style="background-color: #dbeafe; border-left: 3px solid #3b82f6; padding: 8px; margin-bottom: 8px; border-radius: 4px;">
              <p style="margin: 4px 0; font-size: 12px; color: #0c4a6e;"><strong>Segment CO₂:</strong></p>
              <p style="margin: 4px 0; font-size: 14px; font-weight: bold; color: #1e40af;">
                ${lastPoint ? lastPoint.co2_segment.toFixed(4) : '0.0000'} kg
              </p>
            </div>
            <div style="background-color: #ecfdf5; border-left: 3px solid #14b8a6; padding: 8px; border-radius: 4px;">
              <p style="margin: 4px 0; font-size: 12px; color: #0d9488;"><strong>Total CO₂ So Far:</strong></p>
              <p style="margin: 4px 0; font-size: 14px; font-weight: bold; color: #0d7377;">
                ${totalCO2Emitted.toFixed(3)} kg
              </p>
            </div>
          </div>
        `)
      )
      .addTo(map.current);

    // Open popup by default
    truckMarkerRef.current.togglePopup();

    // Update GPS path polyline
    if (gpsPoints.length > 1) {
      const coordinates = gpsPoints.map((p) => [p.lng, p.lat]);

      const source = map.current.getSource("gps-path") as any;
      if (source) {
        source.setData({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: coordinates,
          },
          properties: {},
        });
      } else {
        // Add GPS path layer
        map.current.addSource("gps-path", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: coordinates,
            },
            properties: {},
          },
        });

        map.current.addLayer({
          id: "gps-path",
          type: "line",
          source: "gps-path",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3b82f6",
            "line-width": 3,
            "line-opacity": 0.6,
            "line-dasharray": [2, 2],
          },
        });
      }
    }
  }, [currentTruckLocation, gpsPoints]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
      if (truckMarkerRef.current) {
        truckMarkerRef.current.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div
        className="relative min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-black/90" />

        <div className="relative container mx-auto px-4 pt-24 pb-12 max-w-7xl">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center gap-3">
              <MapPin className="w-10 h-10 text-emerald-400" />
              Route Optimization
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Find the most eco-friendly vehicle option for your route
            </p>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Left Panel: Form */}
            <div className="flex flex-col">
              <Card className="bg-black/40 backdrop-blur-md border-emerald/20 shadow-soft p-6 flex-1">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                  <TrendingDown className="w-6 h-6 text-emerald-400" />
                  Route Details
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Start Location */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-emerald-400">Start Location</label>
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
                          className="bg-black/30 border-emerald/30 text-white placeholder:text-muted-foreground"
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
                          className="bg-black/30 border-emerald/30 text-white placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  {/* End Location */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-emerald-400">End Location</label>
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
                          className="bg-black/30 border-emerald/30 text-white placeholder:text-muted-foreground"
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
                          className="bg-black/30 border-emerald/30 text-white placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-emerald-400">Current Vehicle Type</label>
                    <Select value={vehicle} onValueChange={setVehicle}>
                      <SelectTrigger className="bg-black/30 border-emerald/30 text-white">
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-emerald/30">
                        {VEHICLE_TYPES.map((type) => (
                          <SelectItem key={type} value={type} className="text-white">
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Distance Display */}
                  {distance !== null && (
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald/20">
                      <p className="text-xs text-emerald-400 mb-2">Calculated Distance</p>
                      <p className="text-2xl font-bold text-emerald-400">{distance.toFixed(2)} km</p>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex gap-3">
                      <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3"
                  >
                    {isLoading ? "Analyzing Route..." : "Get Optimization Suggestions"}
                  </Button>
                </form>
              </Card>

              {/* Results Card */}
              {result && (
                <Card className="bg-black/40 backdrop-blur-md border-emerald/20 shadow-soft p-6 mt-8">
                  <h3 className="text-xl font-semibold text-white mb-5 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-emerald-400" />
                    Optimization Results
                  </h3>

                  {/* Current Emission */}
                  <div className="p-4 rounded-lg bg-black/30 border border-emerald/20 mb-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Current Emission</p>
                        <p className="text-2xl font-bold text-emerald-400">
                          {result.current_emission.toFixed(2)} kg CO₂
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 capitalize">
                          {result.current_vehicle} vehicle
                        </p>
                      </div>
                      <Zap className="h-8 w-8 text-emerald-400/30" />
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="space-y-3">
                    {result.suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-emerald/10 border border-emerald/20 hover:bg-emerald/20 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Better Option</p>
                            <p className="text-lg font-semibold text-white capitalize">
                              {suggestion.better_vehicle} Vehicle
                            </p>
                          </div>
                          <TrendingDown className="h-5 w-5 text-emerald-400" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-muted-foreground">New Emission:</span>
                            <p className="font-bold text-emerald-400">
                              {suggestion.new_emission.toFixed(2)} kg CO₂
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">CO₂ Saved:</span>
                            <p className="font-bold text-emerald-400">
                              {suggestion.co2_saved.toFixed(2)} kg
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-emerald-400 font-semibold">
                          {((suggestion.co2_saved / result.current_emission) * 100).toFixed(1)}% reduction
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* GPS Tracking Card */}
              {isSimulating && (
                <Card className="bg-black/40 backdrop-blur-md border-emerald/20 shadow-soft p-6 mt-8">
                  <h3 className="text-xl font-semibold text-white mb-5 flex items-center gap-2 animate-pulse">
                    <Truck className="w-6 h-6 text-blue-400" />
                    Live GPS Tracking
                  </h3>

                  <div className="space-y-4">
                    {/* Current Location */}
                    {currentTruckLocation && (
                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <p className="text-xs text-muted-foreground mb-2">Current Location</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Latitude</p>
                            <p className="text-sm font-mono text-blue-400">{currentTruckLocation.lat.toFixed(6)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Longitude</p>
                            <p className="text-sm font-mono text-blue-400">{currentTruckLocation.lng.toFixed(6)}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CO2 Emitted */}
                    <div className="p-4 rounded-lg bg-emerald/10 border border-emerald/20">
                      <p className="text-xs text-muted-foreground mb-1">Total CO₂ Emitted</p>
                      <p className="text-2xl font-bold text-emerald-400">{totalCO2Emitted.toFixed(3)} kg</p>
                      <p className="text-xs text-muted-foreground mt-2">{gpsPoints.length} tracking points</p>
                    </div>

                    {/* Status */}
                    <div className="p-3 rounded-lg bg-black/30 border border-emerald/20">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        <p className="text-sm text-muted-foreground">Truck in motion... Updates every 5 seconds</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Right Panel: Map */}
            <div>
              <Card className="bg-black/40 backdrop-blur-md border-emerald/20 shadow-soft overflow-hidden h-[600px] lg:h-[700px]">
                <div className="flex items-center justify-center h-full p-6">
                  <div
                    ref={mapContainer}
                    className="w-full h-full rounded-lg"
                    style={{ position: "relative" }}
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Optimization;
