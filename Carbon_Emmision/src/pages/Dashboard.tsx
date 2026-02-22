import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import heroBg from "@/assets/hero-bg.jpg";
import { apiFetchJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const VEHICLE_COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];

// CO2 emission factors per km
const EMISSION_FACTORS: Record<string, number> = {
  diesel: 0.27,
  petrol: 0.24,
  electric: 0.02,
};

// Idle emission factors per hour
const IDLE_FACTORS: Record<string, number> = {
  diesel: 0.15,
  petrol: 0.12,
  electric: 0.01,
};

type DailyEmission = {
  date: string;
  co2: number;
};

type RouteEmission = {
  route: string;
  total_co2: number;
};

type VehicleEmission = {
  vehicle: string;
  total_co2: number;
};

type StatsData = {
  total_trips: number;
  total_routes: number;
  active_vehicles: number;
  total_co2_today: number;
  total_co2_month: number;
  total_co2_all: number;
};

type RecentTrip = {
  id: number;
  vehicle_type: string;
  start_location: string;
  end_location: string;
  distance_km: number;
  co2_kg: number;
  created_at: string;
};

type InsightsData = {
  top_route: { route: string; total_co2: number } | null;
  top_vehicle: { vehicle: string; total_co2: number } | null;
  latest_trip: {
    vehicle: string;
    route: string;
    distance_km: number;
    co2_kg: number;
    created_at: string;
  } | null;
};

type StatCardProps = {
  label: string;
  value: string;
  delta: string;
};

const StatCard = ({ label, value, delta }: StatCardProps) => (
  <div className="glass-card rounded-2xl p-6 shadow-soft hover-lift border border-emerald/10">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
    <p className="mt-2 text-sm text-emerald">{delta}</p>
  </div>
);

const LineChartComponent = ({ data }: { data: DailyEmission[] }) => (
  <div className="glass-card rounded-2xl p-6 shadow-soft hover-lift">
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-foreground">Daily Emissions Trend</h2>
      <p className="text-sm text-muted-foreground">CO2 output for the last 7 days.</p>
    </div>
    <div className="h-72 w-full rounded-xl bg-white/60 p-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#10b981" }} />
          <Legend />
          <Line
            type="monotone"
            dataKey="co2"
            name="CO2 (kg)"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const BarChartComponent = ({ data }: { data: RouteEmission[] }) => (
  <div className="glass-card rounded-2xl p-6 shadow-soft hover-lift">
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-foreground">Emissions by Route</h2>
      <p className="text-sm text-muted-foreground">Highest emitting logistics corridors.</p>
    </div>
    <div className="h-72 w-full rounded-xl bg-white/60 p-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="route"
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            interval={0}
            tickMargin={8}
            height={50}
          />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#34d399" }} />
          <Legend />
          <Bar dataKey="total_co2" name="CO2 (kg)" fill="#34d399" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const PieChartComponent = ({ data }: { data: VehicleEmission[] }) => (
  <div className="glass-card rounded-2xl p-6 shadow-soft hover-lift">
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-foreground">Emissions by Vehicle Type</h2>
      <p className="text-sm text-muted-foreground">Distribution across fleet categories.</p>
    </div>
    <div className="h-72 w-full rounded-xl bg-white/60 p-2">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#10b981" }} />
          <Legend />
          <Pie
            data={data}
            dataKey="total_co2"
            nameKey="vehicle"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={entry.vehicle} fill={VEHICLE_COLORS[index % VEHICLE_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const Dashboard = () => {
  const { toast } = useToast();
  const [dailyEmissions, setDailyEmissions] = useState<DailyEmission[]>([]);
  const [routeEmissions, setRouteEmissions] = useState<RouteEmission[]>([]);
  const [vehicleEmissions, setVehicleEmissions] = useState<VehicleEmission[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentTrips, setRecentTrips] = useState<RecentTrip[]>([]);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vehicleTypeCount, setVehicleTypeCount] = useState(0);

  // Log Trip form state
  const [vehicleType, setVehicleType] = useState("diesel");
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [idleTime, setIdleTime] = useState("");
  const [calculatedCO2, setCalculatedCO2] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all dashboard data in parallel
      const [dailyData, routeData, vehicleData, statsData, tripsData, insightsData] = await Promise.all([
        apiFetchJson<DailyEmission[]>("/footprint/daily/trend"),
        apiFetchJson<RouteEmission[]>("/charts/routes?limit=10"),
        apiFetchJson<VehicleEmission[]>("/charts/vehicles"),
        apiFetchJson<StatsData>("/stats/summary"),
        apiFetchJson<RecentTrip[]>("/trips/recent?limit=8"),
        apiFetchJson<InsightsData>("/insights/summary"),
      ]);

      setDailyEmissions(dailyData);
      setRouteEmissions(routeData);
      setVehicleEmissions(vehicleData);
      setStats(statsData);
      setRecentTrips(tripsData);
      setInsights(insightsData);
      setVehicleTypeCount(vehicleData.length);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCO2 = () => {
    const dist = parseFloat(distance);
    const idle = parseFloat(idleTime) || 0;
    
    if (isNaN(dist) || dist <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid distance",
        variant: "destructive",
      });
      return;
    }

    const emissionFactor = EMISSION_FACTORS[vehicleType] || 0.27;
    const idleFactor = IDLE_FACTORS[vehicleType] || 0.15;
    
    // Formula: CO₂ = distance × factor + time × idle factor
    const co2 = dist * emissionFactor + idle * idleFactor;
    setCalculatedCO2(co2);
  };

  const handleLogTrip = async () => {
    if (!startLocation || !endLocation || !distance) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (calculatedCO2 === null) {
      toast({
        title: "Calculate CO2 First",
        description: "Please calculate emissions before logging the trip",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetchJson("/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle_type: vehicleType,
          start_location: startLocation,
          end_location: endLocation,
          distance_km: parseFloat(distance),
          idle_time_hours: parseFloat(idleTime) || 0,
        }),
      });

      toast({
        title: "Trip Logged Successfully",
        description: `CO2 emissions: ${calculatedCO2.toFixed(2)} kg`,
      });

      // Reset form
      setStartLocation("");
      setEndLocation("");
      setDistance("");
      setIdleTime("");
      setCalculatedCO2(null);

      // Refresh data
      fetchDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log trip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative min-h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 gradient-hero opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent" />

        <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald/30 bg-emerald/10 px-4 py-2 text-xs font-semibold text-emerald">
              <span className="h-2 w-2 rounded-full bg-emerald animate-pulse-glow" />
              Updated moments ago
            </div>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold text-primary-foreground">
              Real-Time Carbon Footprint Tracker
            </h1>
            <p className="mt-3 text-lg text-primary-foreground/70">
              Live emissions monitoring, operational insights, and eco performance trends.
            </p>
          </div>

          {/* 6 Stat Cards */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard 
              label="Total CO2 Today" 
              value={`${stats?.total_co2_today.toFixed(2) || 0} tCO2e`} 
              delta="Live emissions" 
            />
            <StatCard 
              label="Total CO2 This Month" 
              value={`${stats?.total_co2_month.toFixed(2) || 0} tCO2e`} 
              delta="Month to date" 
            />
            <StatCard 
              label="Total Trips" 
              value={stats?.total_trips.toString() || "0"} 
              delta="Trips logged" 
            />
            <StatCard 
              label="Active Vehicles" 
              value={stats?.active_vehicles.toString() || "0"} 
              delta="Active in last 24h" 
            />
            <StatCard 
              label="Routes Tracked" 
              value={stats?.total_routes.toString() || "0"} 
              delta="Active corridors" 
            />
            <StatCard 
              label="Vehicle Types" 
              value={vehicleTypeCount.toString()} 
              delta="Fleet mix" 
            />
          </div>

          {/* Log a Trip & Optimization Suggestions */}
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {/* Log a Trip */}
            <div className="glass-card rounded-2xl p-6 shadow-soft hover-lift">
              <h2 className="text-lg font-semibold text-foreground">Log a Trip</h2>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Capture new trips and instantly calculate emissions.
              </p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="vehicle-type" className="text-foreground">Vehicle Type</Label>
                  <Select value={vehicleType} onValueChange={setVehicleType}>
                    <SelectTrigger id="vehicle-type" className="bg-white/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-location" className="text-foreground">From</Label>
                    <Input
                      id="start-location"
                      placeholder="Mumbai"
                      value={startLocation}
                      onChange={(e) => setStartLocation(e.target.value)}
                      className="bg-white/80"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-location" className="text-foreground">To</Label>
                    <Input
                      id="end-location"
                      placeholder="Delhi"
                      value={endLocation}
                      onChange={(e) => setEndLocation(e.target.value)}
                      className="bg-white/80"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="distance" className="text-foreground">Distance (km)</Label>
                    <Input
                      id="distance"
                      type="number"
                      placeholder="0"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      className="bg-white/80"
                    />
                  </div>
                  <div>
                    <Label htmlFor="idle-time" className="text-foreground">Idle Time (hrs)</Label>
                    <Input
                      id="idle-time"
                      type="number"
                      placeholder="0"
                      value={idleTime}
                      onChange={(e) => setIdleTime(e.target.value)}
                      className="bg-white/80"
                    />
                  </div>
                </div>

                {calculatedCO2 !== null && (
                  <div className="p-4 rounded-xl bg-emerald/10 border border-emerald/30">
                    <p className="text-sm text-muted-foreground">Estimated CO₂ Emissions</p>
                    <p className="text-2xl font-bold text-emerald">{calculatedCO2.toFixed(2)} kg</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Formula: CO₂ = {distance} × {EMISSION_FACTORS[vehicleType]} + {idleTime || 0} × {IDLE_FACTORS[vehicleType]}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={calculateCO2}
                    variant="outline"
                    className="flex-1"
                  >
                    Calculate CO₂
                  </Button>
                  <Button
                    onClick={handleLogTrip}
                    disabled={isSubmitting || calculatedCO2 === null}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isSubmitting ? "Logging..." : "Log Trip"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Optimization Suggestions */}
            <div className="glass-card rounded-2xl p-6 shadow-soft hover-lift">
              <h2 className="text-lg font-semibold text-foreground">Optimization Suggestions</h2>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Compare vehicle swaps for cleaner delivery runs.
              </p>

              <div className="space-y-4">
                {insights?.top_route && (
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                    <p className="text-sm font-semibold text-foreground">Top route: {insights.top_route.route}</p>
                    <p className="text-lg font-bold text-blue-400">{insights.top_route.total_co2.toFixed(2)} kg</p>
                  </div>
                )}

                {insights?.top_vehicle && (
                  <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                    <p className="text-sm font-semibold text-foreground">Highest emitting vehicle: {insights.top_vehicle.vehicle}</p>
                    <p className="text-lg font-bold text-orange-400">{insights.top_vehicle.total_co2.toFixed(2)} kg</p>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-emerald/10 border border-emerald/30">
                  <p className="text-sm font-semibold text-emerald">💡 Suggestion</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Consider switching high-emission routes to electric or hybrid vehicles to reduce your carbon footprint.
                  </p>
                </div>

                <Button variant="hero" className="w-full" onClick={() => window.location.href = "/optimization"}>
                  Go to Optimization Tool
                </Button>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <LineChartComponent data={dailyEmissions} />
            <BarChartComponent data={routeEmissions} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <PieChartComponent data={vehicleEmissions} />
            <div className="glass-card rounded-2xl p-6 shadow-soft hover-lift border border-emerald/10">
              <h2 className="text-lg font-semibold text-foreground">Operational Insights</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Key signals from your network to keep carbon down and deliveries on time.
              </p>
              <div className="mt-4 rounded-xl bg-emerald/10 px-4 py-3 text-xs font-semibold text-emerald">
                Network pulse: {stats?.total_co2_all.toFixed(2) || 0} kg CO2 logged
              </div>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                {insights?.top_route && (
                  <li>Top route: {insights.top_route.route} ({insights.top_route.total_co2.toFixed(2)} kg)</li>
                )}
                {insights?.top_vehicle && (
                  <li>Highest emitting vehicle: {insights.top_vehicle.vehicle} ({insights.top_vehicle.total_co2.toFixed(2)} kg)</li>
                )}
              </ul>
            </div>
          </div>

          {/* Recent Trips */}
          <div className="mt-10">
            <div className="glass-card rounded-2xl p-6 shadow-soft hover-lift">
              <h2 className="text-lg font-semibold text-foreground mb-2">Recent Trips</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Latest routes captured in the system.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-emerald/20">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">ROUTE</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">VEHICLE</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">DISTANCE (KM)</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">CO2 (KG)</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrips.map((trip) => (
                      <tr key={trip.id} className="border-b border-emerald/10 hover:bg-emerald/5">
                        <td className="py-3 px-4 text-sm text-foreground">
                          {trip.start_location} - {trip.end_location}
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground capitalize">{trip.vehicle_type}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{trip.distance_km.toFixed(1)}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{trip.co2_kg.toFixed(2)}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(trip.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>
    </div>
  );
};

export default Dashboard;
