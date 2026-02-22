import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiFetchJson } from "@/lib/api";
import { AlertCircle, CheckCircle2, FileText, TrendingUp, AlertTriangle, Map } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type SupplierReport = {
  id: number;
  supplier_name: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  reported_distance: number;
  reported_time: number;
  verified_distance: number;
  verified_time: number;
  vehicle_type: string;
  weight: number;
  reported_co2: number;
  verified_co2: number;
  verification_status: "verified" | "warning" | "flagged";
  created_at: string;
};

type SupplierReportCreate = {
  supplier_name: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  reported_distance: number;
  reported_time: number;
  vehicle_type: string;
  weight: number;
};

type RouteData = {
  distance_km: number;
  duration_hours: number;
  geometry: any;
};

const VEHICLE_TYPES = ["diesel", "petrol", "electric"];

const SupplierReports = () => {
  const [reports, setReports] = useState<SupplierReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<SupplierReport | null>(null);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Form state
  const [formData, setFormData] = useState<SupplierReportCreate>({
    supplier_name: "",
    start_lat: 0,
    start_lng: 0,
    end_lat: 0,
    end_lng: 0,
    reported_distance: 0,
    reported_time: 0,
    vehicle_type: "diesel",
    weight: 0,
  });

  const loadReports = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await apiFetchJson<SupplierReport[]>("/supplier/reports");
      setReports(data);
    } catch (error) {
      console.error("Failed to load reports:", error);
      setErrorMessage("Unable to load supplier reports. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize Mapbox map
  useEffect(() => {
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [0, 20],
      zoom: 2,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Update map when a report is selected
  useEffect(() => {
    if (!map.current || !selectedReport) return;

    // Remove existing layers and sources
    if (map.current.getLayer("route")) {
      map.current.removeLayer("route");
    }
    if (map.current.getSource("route")) {
      map.current.removeSource("route");
    }

    // Remove existing markers
    const markers = document.querySelectorAll(".mapboxgl-marker");
    markers.forEach((marker) => marker.remove());

    // Fetch route data from backend
    const fetchRoute = async () => {
      try {
        const routeData = await apiFetchJson<RouteData>(
          `/supplier/route?start_lat=${selectedReport.start_lat}&start_lng=${selectedReport.start_lng}&end_lat=${selectedReport.end_lat}&end_lng=${selectedReport.end_lng}`
        );

        if (routeData.geometry && map.current) {
          // Add route line to map
          map.current.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: routeData.geometry,
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
              "line-color": "#10b981",
              "line-width": 4,
              "line-opacity": 0.8,
            },
          });
        }

        // Add start marker (green)
        new mapboxgl.Marker({ color: "#10b981" })
          .setLngLat([selectedReport.start_lng, selectedReport.start_lat])
          .setPopup(new mapboxgl.Popup().setHTML("<strong>Start</strong>"))
          .addTo(map.current!);

        // Add end marker (red)
        new mapboxgl.Marker({ color: "#ef4444" })
          .setLngLat([selectedReport.end_lng, selectedReport.end_lat])
          .setPopup(new mapboxgl.Popup().setHTML("<strong>End</strong>"))
          .addTo(map.current!);

        // Fit map to route bounds
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([selectedReport.start_lng, selectedReport.start_lat]);
        bounds.extend([selectedReport.end_lng, selectedReport.end_lat]);
        map.current.fitBounds(bounds, { padding: 50 });
      } catch (error) {
        console.error("Failed to load route:", error);
      }
    };

    fetchRoute();
  }, [selectedReport]);

  useEffect(() => {
    loadReports();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);
    setErrorMessage(null);

    // Validation
    if (!formData.supplier_name.trim()) {
      setErrorMessage("Supplier name is required");
      return;
    }

    if (formData.start_lat < -90 || formData.start_lat > 90) {
      setErrorMessage("Start latitude must be between -90 and 90");
      return;
    }

    if (formData.start_lng < -180 || formData.start_lng > 180) {
      setErrorMessage("Start longitude must be between -180 and 180");
      return;
    }

    if (formData.end_lat < -90 || formData.end_lat > 90) {
      setErrorMessage("End latitude must be between -90 and 90");
      return;
    }

    if (formData.end_lng < -180 || formData.end_lng > 180) {
      setErrorMessage("End longitude must be between -180 and 180");
      return;
    }

    if (formData.reported_distance <= 0) {
      setErrorMessage("Distance must be greater than 0");
      return;
    }

    if (formData.reported_time <= 0) {
      setErrorMessage("Time must be greater than 0");
      return;
    }

    if (formData.weight <= 0) {
      setErrorMessage("Weight must be greater than 0");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiFetchJson<SupplierReport>("/supplier/report", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setSubmitStatus(
        `Report submitted successfully! Status: ${response.verification_status.toUpperCase()}`
      );

      // Reset form
      setFormData({
        supplier_name: "",
        start_lat: 0,
        start_lng: 0,
        end_lat: 0,
        end_lng: 0,
        reported_distance: 0,
        reported_time: 0,
        vehicle_type: "diesel",
        weight: 0,
      });

      // Reload reports
      await loadReports();
    } catch (error) {
      console.error("Failed to submit report:", error);
      setErrorMessage("Failed to submit report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warning
          </Badge>
        );
      case "flagged":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            Flagged
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const calculateDifference = (reported: number, verified: number) => {
    const diff = ((Math.abs(reported - verified) / verified) * 100).toFixed(1);
    return `${diff}%`;
  };

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
              <FileText className="w-10 h-10 text-emerald-400" />
              Supplier Verification
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Real-time verification of supplier trip data using Mapbox Directions API
            </p>
          </div>

          {/* Submit Form */}
          <Card className="bg-black/40 backdrop-blur-md border-emerald/20 shadow-soft p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              Submit Supplier Report
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sample Data Helper */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-black/30 border-emerald/30 text-emerald-400 hover:bg-emerald/10"
                  onClick={() => {
                    setFormData({
                      supplier_name: "Mumbai Logistics Co.",
                      start_lat: 19.0760,
                      start_lng: 72.8777,
                      end_lat: 18.5204,
                      end_lng: 73.8567,
                      reported_distance: 150,
                      reported_time: 3,
                      vehicle_type: "diesel",
                      weight: 10,
                    });
                  }}
                >
                  Load Sample: Mumbai → Pune
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-black/30 border-emerald/30 text-emerald-400 hover:bg-emerald/10"
                  onClick={() => {
                    setFormData({
                      supplier_name: "Delhi Express",
                      start_lat: 28.7041,
                      start_lng: 77.1025,
                      end_lat: 26.9124,
                      end_lng: 75.7873,
                      reported_distance: 280,
                      reported_time: 5,
                      vehicle_type: "petrol",
                      weight: 15,
                    });
                  }}
                >
                  Load Sample: Delhi → Jaipur
                </Button>
              </div>

              {/* Grid Layout for Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Supplier Name */}
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-emerald-400 mb-2">
                    Supplier Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter supplier name"
                    value={formData.supplier_name}
                    onChange={(e) =>
                      setFormData({ ...formData, supplier_name: e.target.value })
                    }
                    className="bg-black/30 border-emerald/30 text-white placeholder:text-muted-foreground"
                  />
                </div>

                {/* Start Coordinates */}
                <div>
                  <label className="block text-sm font-medium text-emerald-400 mb-2">
                    Start Latitude
                  </label>
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder="28.7041"
                    value={formData.start_lat || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, start_lat: parseFloat(e.target.value) || 0 })
                    }
                    className="bg-black/30 border-emerald/30 text-white placeholder:text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-400 mb-2">
                    Start Longitude
                  </label>
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder="77.1025"
                    value={formData.start_lng || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, start_lng: parseFloat(e.target.value) || 0 })
                    }
                    className="bg-black/30 border-emerald/30 text-white placeholder:text-muted-foreground"
                  />
                </div>

                {/* End Coordinates */}
                <div>
                  <label className="block text-sm font-medium text-emerald-400 mb-2">
                    End Latitude
                  </label>
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder="19.0760"
                    value={formData.end_lat || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, end_lat: parseFloat(e.target.value) || 0 })
                    }
                    className="bg-black/30 border-emerald/30 text-white placeholder:text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-400 mb-2">
                    End Longitude
                  </label>
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder="72.8777"
                    value={formData.end_lng || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, end_lng: parseFloat(e.target.value) || 0 })
                    }
                    className="bg-black/30 border-emerald/30 text-white placeholder:text-muted-foreground"
                  />
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-sm font-medium text-emerald-400 mb-2">
                    Vehicle Type
                  </label>
                  <Select
                    value={formData.vehicle_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, vehicle_type: value })
                    }
                  >
                    <SelectTrigger className="bg-black/30 border-emerald/30 text-white">
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

                {/* Reported Distance */}
                <div>
                  <label className="block text-sm font-medium text-emerald-400 mb-2">
                    Reported Distance (km)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="150.5"
                    value={formData.reported_distance || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reported_distance: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="bg-black/30 border-emerald/30 text-white placeholder:text-muted-foreground"
                  />
                </div>

                {/* Reported Time */}
                <div>
                  <label className="block text-sm font-medium text-emerald-400 mb-2">
                    Reported Time (hours)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="2.5"
                    value={formData.reported_time || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reported_time: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="bg-black/30 border-emerald/30 text-white placeholder:text-muted-foreground"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-medium text-emerald-400 mb-2">
                    Weight (tons)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="10.5"
                    value={formData.weight || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weight: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="bg-black/30 border-emerald/30 text-white placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Status Messages */}
              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {errorMessage}
                </div>
              )}

              {submitStatus && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  {submitStatus}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3"
              >
                {isLoading ? "Submitting..." : "Submit Report"}
              </Button>
            </form>
          </Card>

          {/* Map Visualization */}
          <Card className="bg-black/40 backdrop-blur-md border-emerald/20 shadow-soft p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <Map className="w-6 h-6 text-emerald-400" />
              Route Visualization
            </h2>
            
            {selectedReport && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-black/30 p-4 rounded-lg border border-emerald/20">
                  <p className="text-sm text-emerald-400 mb-1">Supplier</p>
                  <p className="text-white font-semibold">{selectedReport.supplier_name}</p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg border border-emerald/20">
                  <p className="text-sm text-emerald-400 mb-1">Verified Distance</p>
                  <p className="text-white font-semibold">{selectedReport.verified_distance.toFixed(2)} km</p>
                  <p className="text-xs text-muted-foreground mt-1">Reported: {selectedReport.reported_distance.toFixed(2)} km</p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg border border-emerald/20">
                  <p className="text-sm text-emerald-400 mb-1">Verified Time</p>
                  <p className="text-white font-semibold">{selectedReport.verified_time.toFixed(2)} hrs</p>
                  <p className="text-xs text-muted-foreground mt-1">Reported: {selectedReport.reported_time.toFixed(2)} hrs</p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg border border-emerald/20">
                  <p className="text-sm text-emerald-400 mb-1">Status</p>
                  <div>{getStatusBadge(selectedReport.verification_status)}</div>
                </div>
              </div>
            )}
            
            {!selectedReport && (
              <div className="text-center py-12 text-muted-foreground mb-4">
                Click on a report in the table below to visualize the route
              </div>
            )}
            
            <div
              ref={mapContainer}
              className="w-full h-[500px] rounded-lg"
              style={{ position: "relative" }}
            />
          </Card>

          {/* Reports Table */}
          <Card className="bg-black/40 backdrop-blur-md border-emerald/20 shadow-soft p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Recent Reports ({reports.length})
            </h2>

            {isLoading && reports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading reports...
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No reports submitted yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-white">
                  <thead className="text-xs uppercase text-emerald-400 border-b border-emerald/20">
                    <tr>
                      <th className="py-3 pr-4">Supplier</th>
                      <th className="py-3 pr-4">Vehicle</th>
                      <th className="py-3 pr-4">Reported Dist.</th>
                      <th className="py-3 pr-4">Verified Dist.</th>
                      <th className="py-3 pr-4">Reported Time</th>
                      <th className="py-3 pr-4">Verified Time</th>
                      <th className="py-3 pr-4">Dist. Diff.</th>
                      <th className="py-3 pr-4">Reported CO₂</th>
                      <th className="py-3 pr-4">Verified CO₂</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3">Date</th>
                      <th className="py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr 
                        key={report.id} 
                        className={`border-t border-emerald/10 cursor-pointer hover:bg-emerald/5 transition-colors ${
                          selectedReport?.id === report.id ? "bg-emerald/10" : ""
                        }`}
                        onClick={() => setSelectedReport(report)}
                      >
                        <td className="py-3 pr-4 font-medium">{report.supplier_name}</td>
                        <td className="py-3 pr-4 capitalize">{report.vehicle_type}</td>
                        <td className="py-3 pr-4">{report.reported_distance.toFixed(1)} km</td>
                        <td className="py-3 pr-4">{report.verified_distance.toFixed(1)} km</td>
                        <td className="py-3 pr-4">{report.reported_time.toFixed(2)} hrs</td>
                        <td className="py-3 pr-4">{report.verified_time.toFixed(2)} hrs</td>
                        <td className="py-3 pr-4">
                          {calculateDifference(
                            report.reported_distance,
                            report.verified_distance
                          )}
                        </td>
                        <td className="py-3 pr-4">{report.reported_co2.toFixed(2)} kg</td>
                        <td className="py-3 pr-4">{report.verified_co2.toFixed(2)} kg</td>
                        <td className="py-3 pr-4">{getStatusBadge(report.verification_status)}</td>
                        <td className="py-3 pr-4">
                          {new Date(report.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-emerald-600/20 hover:bg-emerald-600/30 border-emerald-500/30 text-emerald-400 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReport(report);
                            }}
                          >
                            View Map
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupplierReports;
