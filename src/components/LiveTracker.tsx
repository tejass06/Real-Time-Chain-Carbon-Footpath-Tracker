import { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetchJson } from "@/lib/api";
import { AlertCircle, MapPin, Loader, X } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

type GPSPoint = {
  id: number;
  lat: number;
  lng: number;
  distance_segment: number;
  co2_segment: number;
  timestamp: string;
};

type TruckData = {
  id: number;
  truck_id: string;
  driver_name: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  vehicle_type: string;
  status: string;
  created_at: string;
};

type MapboxGLModule = typeof mapboxgl;

interface LiveTrackerProps {
  isOpen: boolean;
  onClose: () => void;
}

const LiveTracker = ({ isOpen, onClose }: LiveTrackerProps) => {
  const [activeTab, setActiveTab] = useState<"truck" | "gps">("truck");
  const [truckNumber, setTruckNumber] = useState("");
  const [gpsId, setGpsId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [truckData, setTruckData] = useState<TruckData | null>(null);
  const [gpsPoints, setGpsPoints] = useState<GPSPoint[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [totalCO2, setTotalCO2] = useState(0);
  const [isTracking, setIsTracking] = useState(false);

  // Map references
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const truckMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !isOpen) {
      return;
    }

    (mapboxgl as MapboxGLModule).accessToken = mapboxToken;

    if (!map.current) {
      map.current = new (mapboxgl as MapboxGLModule).Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [77, 28],
        zoom: 6,
      });

      map.current.addControl(new (mapboxgl as MapboxGLModule).NavigationControl());
    }

    return () => {
      // Don't remove map on unmount - just keep it
    };
  }, [isOpen, mapboxToken]);

  // Fetch truck details
  const handleTrackTruck = async () => {
    if (!truckNumber.trim()) {
      setError("Please enter a truck number");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get truck details
      const truck = await apiFetchJson<TruckData>(`/trucks/${truckNumber}`, {
        method: "GET",
      });

      setTruckData(truck);

      // Start tracking
      const startResponse = await apiFetchJson(`/trucks/${truckNumber}/start-tracking`, {
        method: "POST",
      });

      console.log("Tracking started:", startResponse);
      setIsTracking(true);
      setGpsPoints([]);
      setCurrentLocation(null);
      setTotalCO2(0);

      // Start polling GPS data
      const fetchData = async () => {
        try {
          const response = await apiFetchJson<{
            vehicle_id: string;
            total_points: number;
            points: GPSPoint[];
          }>(`/gps/history/${truckNumber}?limit=100`, {
            method: "GET",
          });

          if (response.points.length > 0) {
            setGpsPoints(response.points);
            const lastPoint = response.points[response.points.length - 1];
            setCurrentLocation({ lat: lastPoint.lat, lng: lastPoint.lng });

            const totalCO2Calc = response.points.reduce((sum, p) => sum + p.co2_segment, 0);
            setTotalCO2(totalCO2Calc);
          }
        } catch (err) {
          console.error("Failed to fetch GPS data:", err);
        }
      };

      // Initial fetch with delay
      setTimeout(async () => {
        await fetchData();

        // Set up polling
        const interval = setInterval(fetchData, 5000);
        trackingIntervalRef.current = interval;
      }, 1000);
    } catch (err) {
      setError("Truck not found or tracking failed");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update truck marker on map
  useEffect(() => {
    if (!map.current || !currentLocation || !truckData) return;

    // Remove old marker
    if (truckMarkerRef.current) {
      truckMarkerRef.current.remove();
    }

    // Create truck marker
    const truckElement = document.createElement("div");
    truckElement.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        background-color: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-size: 20px;
      ">
        🚚
      </div>
    `;

    const lastGPSPoint = gpsPoints.length > 0 ? gpsPoints[gpsPoints.length - 1] : null;

    truckMarkerRef.current = new (mapboxgl as MapboxGLModule).Marker({
      element: truckElement,
    })
      .setLngLat([currentLocation.lng, currentLocation.lat])
      .setPopup(
        new (mapboxgl as MapboxGLModule).Popup({ offset: 25 }).setHTML(`
          <div style="padding: 10px; font-family: system-ui; min-width: 220px;">
            <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #1f2937;">
              🚚 Truck #${truckData.truck_id}
            </h4>
            <p style="margin: 4px 0; font-size: 12px; color: #4b5563;">
              <strong>Driver:</strong> ${truckData.driver_name}
            </p>
            <div style="background-color: #f0fdf4; border-left: 3px solid #10b981; padding: 8px; margin: 8px 0; border-radius: 4px;">
              <p style="margin: 4px 0; font-size: 12px; color: #15803d;"><strong>Location:</strong></p>
              <p style="margin: 4px 0; font-size: 11px; color: #1f2937; font-family: monospace;">
                ${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}
              </p>
            </div>
            <div style="background-color: #dbeafe; border-left: 3px solid #3b82f6; padding: 8px; margin: 8px 0; border-radius: 4px;">
              <p style="margin: 4px 0; font-size: 12px; color: #0c4a6e;"><strong>Segment CO₂:</strong></p>
              <p style="margin: 4px 0; font-size: 13px; font-weight: bold; color: #1e40af;">
                ${lastGPSPoint ? lastGPSPoint.co2_segment.toFixed(4) : '0.0000'} kg
              </p>
            </div>
            <div style="background-color: #ecfdf5; border-left: 3px solid #14b8a6; padding: 8px; border-radius: 4px;">
              <p style="margin: 4px 0; font-size: 12px; color: #0d9488;"><strong>Total CO₂:</strong></p>
              <p style="margin: 4px 0; font-size: 13px; font-weight: bold; color: #0d7377;">
                ${totalCO2.toFixed(3)} kg
              </p>
            </div>
          </div>
        `)
      )
      .addTo(map.current);

    truckMarkerRef.current.togglePopup();

    // Fit map to truck location
    map.current.flyTo({
      center: [currentLocation.lng, currentLocation.lat],
      zoom: 10,
      duration: 1500,
    });
  }, [currentLocation, truckData, gpsPoints, totalCO2]);

  // Cleanup on close
  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
      if (truckMarkerRef.current) {
        truckMarkerRef.current.remove();
      }
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-black/95 border-emerald/30">
        <DialogHeader className="border-b border-emerald/20 pb-4">
          <DialogTitle className="text-emerald-400 text-2xl flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            Live Truck Tracker
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px] overflow-y-auto">
          {/* Left Panel: Controls */}
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "truck" | "gps")}>
              <TabsList className="grid w-full grid-cols-2 bg-black/50 border border-emerald/30">
                <TabsTrigger value="truck" className="text-emerald-400">
                  Truck Number
                </TabsTrigger>
                <TabsTrigger value="gps" className="text-emerald-400">
                  GPS ID
                </TabsTrigger>
              </TabsList>

              {/* Truck Number Tab */}
              <TabsContent value="truck" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-emerald-400">Enter Truck Number</label>
                  <Input
                    placeholder="e.g., 123"
                    value={truckNumber}
                    onChange={(e) => setTruckNumber(e.target.value)}
                    className="bg-black/30 border-emerald/30 text-white"
                    disabled={isLoading || isTracking}
                  />
                </div>

                <Button
                  onClick={handleTrackTruck}
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Tracking...
                    </>
                  ) : (
                    "Start Tracking"
                  )}
                </Button>

                {isTracking && truckData && (
                  <Card className="bg-black/40 border-emerald/20 p-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Truck ID</p>
                        <p className="text-lg font-bold text-emerald-400">#{truckData.truck_id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Driver</p>
                        <p className="text-sm text-white">{truckData.driver_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Vehicle Type</p>
                        <p className="text-sm capitalize text-white">{truckData.vehicle_type}</p>
                      </div>
                      <div className="pt-2 border-t border-emerald/20">
                        <p className="text-xs text-muted-foreground mb-1">Total CO₂ Emitted</p>
                        <p className="text-2xl font-bold text-emerald-400">{totalCO2.toFixed(3)} kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">GPS Points</p>
                        <p className="text-sm text-white">{gpsPoints.length} tracked</p>
                      </div>
                    </div>
                  </Card>
                )}
              </TabsContent>

              {/* GPS ID Tab */}
              <TabsContent value="gps" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-emerald-400">Enter GPS ID</label>
                  <Input
                    placeholder="e.g., GPS-001"
                    value={gpsId}
                    onChange={(e) => setGpsId(e.target.value)}
                    className="bg-black/30 border-emerald/30 text-white"
                  />
                </div>

                <Button disabled className="w-full bg-gray-600">
                  Coming Soon
                </Button>

                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-400">
                    This feature is currently under development. Check back soon!
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Right Panel: Map */}
          <div>
            <div
              ref={mapContainer}
              className="w-full h-full rounded-lg border border-emerald/20 overflow-hidden"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveTracker;
