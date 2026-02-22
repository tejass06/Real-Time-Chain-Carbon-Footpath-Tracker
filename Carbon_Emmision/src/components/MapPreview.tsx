import { useState } from "react";
import { apiFetchJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LiveTruckResponse = {
  vehicle_id: string;
  current_location: {
    lat: number;
    lng: number;
  };
  co2_emitted_so_far: number;
  message?: string;
};

const MapPreview = () => {
  const [vehicleId, setVehicleId] = useState("TRUCK-001");
  const [liveData, setLiveData] = useState<LiveTruckResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchLive = async (id: string) => {
    if (!id.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await apiFetchJson<LiveTruckResponse>(`/gps/live/${encodeURIComponent(id)}`);

      if (data.message) {
        setLiveData(null);
        setErrorMessage(data.message);
      } else {
        setLiveData(data);
      }
    } catch (error) {
      setErrorMessage("Unable to load live tracking data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-24 px-4" id="map">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <span className="text-emerald font-semibold text-sm uppercase tracking-wider">Live Map</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 text-foreground">
            Route Emission Visualization
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            See real-time emission data overlaid on interactive maps with color-coded route severity.
          </p>
        </div>

        <div className="mx-auto mb-6 flex max-w-4xl flex-col gap-3 rounded-2xl border border-emerald/10 bg-white/70 p-4 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Live vehicle lookup</h3>
            <p className="text-xs text-muted-foreground">Enter a vehicle ID to track its latest location.</p>
          </div>
          <form
            className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              fetchLive(vehicleId);
            }}
          >
            <Input
              value={vehicleId}
              onChange={(event) => setVehicleId(event.target.value)}
              placeholder="Vehicle ID"
              className="sm:w-56"
            />
            <Button type="submit" variant="heroOutline" disabled={isLoading}>
              {isLoading ? "Loading..." : "Track"}
            </Button>
          </form>
        </div>

        <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-border">
          {/* Mock Map */}
          <div className="aspect-video bg-gradient-to-br from-navy to-navy-light relative">
            {/* Grid lines */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(152, 60%, 40%)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Routes */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 450">
              {/* Green route */}
              <path d="M 100 350 Q 200 200 350 250 Q 450 280 500 180" fill="none" stroke="hsl(152, 60%, 50%)" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 4" />
              {/* Orange route */}
              <path d="M 150 380 Q 300 320 400 340 Q 500 360 600 280" fill="none" stroke="hsl(35, 90%, 55%)" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 4" />
              {/* Red route */}
              <path d="M 200 100 Q 350 150 500 120 Q 600 100 700 200" fill="none" stroke="hsl(0, 70%, 55%)" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 4" />

              {/* Dots */}
              <circle cx="100" cy="350" r="6" fill="hsl(152, 60%, 50%)" />
              <circle cx="500" cy="180" r="6" fill="hsl(152, 60%, 50%)" />
              <circle cx="150" cy="380" r="6" fill="hsl(35, 90%, 55%)" />
              <circle cx="600" cy="280" r="6" fill="hsl(35, 90%, 55%)" />
              <circle cx="200" cy="100" r="6" fill="hsl(0, 70%, 55%)" />
              <circle cx="700" cy="200" r="6" fill="hsl(0, 70%, 55%)" />
            </svg>

            {/* Tooltip cards */}
            <div className="absolute top-16 right-16 glass-card-dark rounded-xl px-4 py-3 text-primary-foreground text-xs">
              <div className="font-semibold text-sm mb-1">Live Vehicle</div>
              {liveData ? (
                <div className="space-y-1">
                  <div>ID: {liveData.vehicle_id}</div>
                  <div>
                    {liveData.current_location.lat.toFixed(4)}, {liveData.current_location.lng.toFixed(4)}
                  </div>
                  <div>{liveData.co2_emitted_so_far.toFixed(3)} kg CO₂</div>
                </div>
              ) : (
                <div className="text-primary-foreground/70">{errorMessage ?? "No live data loaded."}</div>
              )}
            </div>

            <div className="absolute bottom-20 left-16 glass-card-dark rounded-xl px-4 py-3 text-primary-foreground text-xs">
              <div className="font-semibold text-sm mb-1">Status</div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: liveData ? "hsl(152, 60%, 50%)" : "hsl(35, 90%, 55%)" }}
                />
                <span>{liveData ? "Tracking active" : "Awaiting data"}</span>
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 glass-card-dark rounded-lg px-3 py-2 flex items-center gap-4 text-xs text-primary-foreground/80">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald" /> Low</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "hsl(35, 90%, 55%)" }} /> Medium</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "hsl(0, 70%, 55%)" }} /> High</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapPreview;
