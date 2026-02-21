import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import heroBg from "@/assets/hero-bg.jpg";
import { apiFetchJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const fallbackDailyEmissions = [
  { date: "2026-03-01", co2: 45 },
  { date: "2026-03-02", co2: 51 },
  { date: "2026-03-03", co2: 40 },
  { date: "2026-03-04", co2: 58 },
  { date: "2026-03-05", co2: 49 },
  { date: "2026-03-06", co2: 62 },
  { date: "2026-03-07", co2: 55 },
];

const fallbackRouteEmissions = [
  { route: "Pune - Mumbai", total_co2: 40 },
  { route: "Delhi - Jaipur", total_co2: 32 },
  { route: "Chennai - Bengalu", total_co2: 28 },
  { route: "Hyderabad - Nagpur", total_co2: 22 },
  { route: "Kolkata - Patna", total_co2: 18 },
];

const fallbackVehicleEmissions = [
  { vehicle: "Diesel Truck", total_co2: 120 },
  { vehicle: "CNG Truck", total_co2: 72 },
  { vehicle: "Hybrid Carrier", total_co2: 56 },
];

const VEHICLE_COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];

type DailyFootprint = {
  date: string;
  total_co2: number;
};

type DailyTrendPoint = {
  date: string;
  total_co2: number;
};

type StatsSummary = {
  total_trips: number;
  total_routes: number;
  active_vehicles: number;
  total_co2_today: number;
  total_co2_month: number;
  total_co2_all: number;
};

type InsightsSummary = {
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

type RecentTrip = {
  id: number;
  vehicle_type: string;
  start_location: string;
  end_location: string;
  distance_km: number;
  co2_kg: number;
  created_at: string;
};

type TripCreateResponse = {
  message: string;
  co2_emission: number;
};

type OptimizationSuggestion = {
  better_vehicle: string;
  new_emission: number;
  co2_saved: number;
};

type OptimizationResponse = {
  current_vehicle: string;
  current_emission: number;
  suggestions: OptimizationSuggestion[];
};

type MonthlyFootprint = {
  month: number;
  year: number;
  total_co2: number;
};

type RouteEmission = {
  route: string;
  total_co2: number;
};

type VehicleEmission = {
  vehicle: string;
  total_co2: number;
};

const titleCase = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return value;
  return trimmed[0].toUpperCase() + trimmed.slice(1);
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

const LineChartComponent = ({ data }: { data: { date: string; co2: number }[] }) => (
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
            name="CO2 (t)"
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
          <Bar dataKey="total_co2" name="CO2 (t)" fill="#34d399" radius={[8, 8, 0, 0]} />
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
  const [dailyFootprint, setDailyFootprint] = useState<DailyFootprint | null>(null);
  const [dailyTrend, setDailyTrend] = useState<DailyTrendPoint[]>([]);
  const [monthlyFootprint, setMonthlyFootprint] = useState<MonthlyFootprint | null>(null);
  const [routeEmissions, setRouteEmissions] = useState<RouteEmission[]>([]);
  const [vehicleEmissions, setVehicleEmissions] = useState<VehicleEmission[]>([]);
  const [statsSummary, setStatsSummary] = useState<StatsSummary | null>(null);
  const [insightsSummary, setInsightsSummary] = useState<InsightsSummary | null>(null);
  const [recentTrips, setRecentTrips] = useState<RecentTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tripVehicle, setTripVehicle] = useState("diesel");
  const [tripStart, setTripStart] = useState("");
  const [tripEnd, setTripEnd] = useState("");
  const [tripDistance, setTripDistance] = useState("" as string | number);
  const [tripStatus, setTripStatus] = useState<string | null>(null);
  const [tripSubmitting, setTripSubmitting] = useState(false);
  const [optVehicle, setOptVehicle] = useState("diesel");
  const [optDistance, setOptDistance] = useState("" as string | number);
  const [optResult, setOptResult] = useState<OptimizationResponse | null>(null);
  const [optSubmitting, setOptSubmitting] = useState(false);
  const [optError, setOptError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [daily, trend, monthly, routes, vehicles, stats, insights, trips] = await Promise.all([
        apiFetchJson<DailyFootprint>("/footprint/daily"),
        apiFetchJson<DailyTrendPoint[]>("/footprint/daily/trend"),
        apiFetchJson<MonthlyFootprint>("/footprint/monthly"),
        apiFetchJson<RouteEmission[]>("/charts/routes"),
        apiFetchJson<VehicleEmission[]>("/charts/vehicles"),
        apiFetchJson<StatsSummary>("/stats/summary"),
        apiFetchJson<InsightsSummary>("/insights/summary"),
        apiFetchJson<RecentTrip[]>("/trips/recent?limit=8"),
      ]);

      setDailyFootprint(daily);
      setDailyTrend(trend);
      setMonthlyFootprint(monthly);
      setRouteEmissions(routes);
      setVehicleEmissions(vehicles);
      setStatsSummary(stats);
      setInsightsSummary(insights);
      setRecentTrips(trips);
      console.log("✅ Dashboard data loaded successfully");
    } catch (error) {
      console.error("❌ Dashboard API error:", error);
      setErrorMessage("Unable to connect to the backend. Using sample data. Make sure the API server is running.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      loadDashboard();
    }

    return () => {
      isMounted = false;
    };
  }, [loadDashboard]);

  const handleTripSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTripStatus(null);

    const distance = Number(tripDistance);
    if (!tripStart.trim() || !tripEnd.trim() || Number.isNaN(distance) || distance <= 0) {
      setTripStatus("Please provide valid trip details.");
      return;
    }

    setTripSubmitting(true);

    try {
      const payload = {
        vehicle_type: tripVehicle,
        start_location: tripStart.trim(),
        end_location: tripEnd.trim(),
        distance_km: distance,
      };

      const response = await apiFetchJson<TripCreateResponse>("/trips", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setTripStatus(`${response.message}. CO2: ${response.co2_emission.toFixed(2)} kg`);
      setTripStart("");
      setTripEnd("");
      setTripDistance("");
      await loadDashboard();
    } catch (error) {
      setTripStatus("Unable to record trip right now.");
    } finally {
      setTripSubmitting(false);
    }
  };

  const handleOptimize = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOptError(null);
    setOptResult(null);

    const distance = Number(optDistance);
    if (Number.isNaN(distance) || distance <= 0) {
      setOptError("Please enter a valid distance.");
      return;
    }

    setOptSubmitting(true);

    try {
      const response = await apiFetchJson<OptimizationResponse>("/optimize", {
        method: "POST",
        body: JSON.stringify({
          distance_km: distance,
          current_vehicle: optVehicle,
        }),
      });

      setOptResult(response);
    } catch (error) {
      setOptError("Unable to load optimization suggestions.");
    } finally {
      setOptSubmitting(false);
    }
  };

  const chartDaily = useMemo(() => {
    // Only use fallback data if there's an error AND no real data
    if (errorMessage && dailyTrend.length === 0) return fallbackDailyEmissions;
    return dailyTrend.map((entry) => ({
      date: entry.date,
      co2: entry.total_co2,
    }));
  }, [dailyTrend, errorMessage]);

  const chartRoutes = useMemo(() => {
    // Only use fallback data if there's an error AND no real data
    if (errorMessage && routeEmissions.length === 0) return fallbackRouteEmissions;
    return routeEmissions;
  }, [routeEmissions, errorMessage]);

  const chartVehicles = useMemo(() => {
    // Only use fallback data if there's an error AND no real data
    if (errorMessage && vehicleEmissions.length === 0) return fallbackVehicleEmissions;
    return vehicleEmissions.map((entry) => ({
      ...entry,
      vehicle: titleCase(entry.vehicle),
    }));
  }, [vehicleEmissions, errorMessage]);

  // Use fallback counts only when there's an error
  const totalRoutes = statsSummary?.total_routes ?? (errorMessage ? fallbackRouteEmissions.length : routeEmissions.length);
  const totalVehicleTypes = errorMessage && vehicleEmissions.length === 0 ? fallbackVehicleEmissions.length : vehicleEmissions.length;

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

          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total CO2 Today"
              value={
                statsSummary
                  ? `${statsSummary.total_co2_today.toFixed(2)} tCO2e`
                  : dailyFootprint
                    ? `${dailyFootprint.total_co2.toFixed(2)} tCO2e`
                    : "--"
              }
              delta={isLoading ? "Loading live data" : "Live emissions"}
            />
            <StatCard
              label="Total CO2 This Month"
              value={
                statsSummary
                  ? `${statsSummary.total_co2_month.toFixed(2)} tCO2e`
                  : monthlyFootprint
                    ? `${monthlyFootprint.total_co2.toFixed(2)} tCO2e`
                    : "--"
              }
              delta={isLoading ? "Loading live data" : "Month to date"}
            />
            <StatCard
              label="Total Trips"
              value={
                statsSummary ? statsSummary.total_trips.toLocaleString() : "--"
              }
              delta={isLoading ? "Loading live data" : "Trips logged"}
            />
            <StatCard
              label="Active Vehicles"
              value={
                statsSummary ? statsSummary.active_vehicles.toLocaleString() : "--"
              }
              delta={isLoading ? "Loading live data" : "Active in last 24h"}
            />
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <StatCard
              label="Routes Tracked"
              value={totalRoutes.toLocaleString()}
              delta={isLoading ? "Loading live data" : "Active corridors"}
            />
            <StatCard
              label="Vehicle Types"
              value={totalVehicleTypes.toLocaleString()}
              delta={isLoading ? "Loading live data" : "Fleet mix"}
            />
          </div>

          {errorMessage ? (
            <div className="mt-6 rounded-xl border border-amber-300/40 bg-amber-100/40 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-900">
                  ⚠️ {errorMessage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadDashboard()}
                  className="ml-4"
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : null}

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="glass-card rounded-2xl p-6 shadow-soft hover-lift border border-emerald/10">
              <h2 className="text-lg font-semibold text-foreground">Log a Trip</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Capture new trips and instantly calculate emissions.
              </p>
              <form className="mt-4 space-y-3" onSubmit={handleTripSubmit}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    value={tripStart}
                    onChange={(event) => setTripStart(event.target.value)}
                    placeholder="Start location"
                  />
                  <Input
                    value={tripEnd}
                    onChange={(event) => setTripEnd(event.target.value)}
                    placeholder="End location"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    value={tripDistance}
                    onChange={(event) => setTripDistance(event.target.value)}
                    placeholder="Distance (km)"
                    type="number"
                    min="0"
                    step="0.1"
                  />
                  <select
                    value={tripVehicle}
                    onChange={(event) => setTripVehicle(event.target.value)}
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                  >
                    <option value="diesel">Diesel</option>
                    <option value="petrol">Petrol</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>
                <Button type="submit" variant="hero" disabled={tripSubmitting}>
                  {tripSubmitting ? "Saving..." : "Record Trip"}
                </Button>
                {tripStatus ? (
                  <p className="text-sm text-muted-foreground">{tripStatus}</p>
                ) : null}
              </form>
            </div>

            <div className="glass-card rounded-2xl p-6 shadow-soft hover-lift border border-emerald/10">
              <h2 className="text-lg font-semibold text-foreground">Optimization Suggestions</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Compare vehicle swaps for cleaner delivery runs.
              </p>
              <form className="mt-4 space-y-3" onSubmit={handleOptimize}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    value={optDistance}
                    onChange={(event) => setOptDistance(event.target.value)}
                    placeholder="Distance (km)"
                    type="number"
                    min="0"
                    step="0.1"
                  />
                  <select
                    value={optVehicle}
                    onChange={(event) => setOptVehicle(event.target.value)}
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                  >
                    <option value="diesel">Diesel</option>
                    <option value="petrol">Petrol</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>
                <Button type="submit" variant="heroOutline" disabled={optSubmitting}>
                  {optSubmitting ? "Analyzing..." : "Optimize"}
                </Button>
              </form>
              {optError ? <p className="mt-3 text-sm text-amber-600">{optError}</p> : null}
              {optResult ? (
                <div className="mt-4 rounded-xl border border-emerald/20 bg-emerald/10 p-4 text-sm text-foreground">
                  <div className="font-semibold">Current: {titleCase(optResult.current_vehicle)}</div>
                  <div className="text-muted-foreground">
                    Emission: {optResult.current_emission.toFixed(2)} kg CO2
                  </div>
                  <div className="mt-3 space-y-2">
                    {optResult.suggestions.length > 0 ? (
                      optResult.suggestions.map((suggestion) => (
                        <div key={suggestion.better_vehicle} className="flex items-center justify-between">
                          <span>{titleCase(suggestion.better_vehicle)}</span>
                          <span className="text-emerald">
                            Save {suggestion.co2_saved.toFixed(2)} kg
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-muted-foreground">No greener alternatives found.</span>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <LineChartComponent data={chartDaily} />
            <BarChartComponent data={chartRoutes} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <PieChartComponent data={chartVehicles} />
            <div className="glass-card rounded-2xl p-6 shadow-soft hover-lift border border-emerald/10">
              <h2 className="text-lg font-semibold text-foreground">Operational Insights</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Key signals from your network to keep carbon down and deliveries on time.
              </p>
              <div className="mt-4 rounded-xl bg-emerald/10 px-4 py-3 text-xs font-semibold text-emerald">
                Network pulse: {statsSummary ? statsSummary.total_co2_all.toFixed(2) : "--"} kg CO2 logged
              </div>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                <li>
                  Top route: {insightsSummary?.top_route?.route ?? "--"} ({insightsSummary?.top_route?.total_co2.toFixed(2) ?? "--"} kg)
                </li>
                <li>
                  Highest emitting vehicle: {insightsSummary?.top_vehicle?.vehicle ? titleCase(insightsSummary.top_vehicle.vehicle) : "--"} ({insightsSummary?.top_vehicle?.total_co2.toFixed(2) ?? "--"} kg)
                </li>
                <li>
                  Latest trip: {insightsSummary?.latest_trip?.route ?? "--"} ({insightsSummary?.latest_trip?.co2_kg.toFixed(2) ?? "--"} kg)
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 glass-card rounded-2xl p-6 shadow-soft hover-lift border border-emerald/10">
            <h2 className="text-lg font-semibold text-foreground">Recent Trips</h2>
            <p className="mt-2 text-sm text-muted-foreground">Latest routes captured in the system.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4">Route</th>
                    <th className="py-2 pr-4">Vehicle</th>
                    <th className="py-2 pr-4">Distance (km)</th>
                    <th className="py-2 pr-4">CO2 (kg)</th>
                    <th className="py-2">Time</th>
                  </tr>
                </thead>
                <tbody className="text-foreground">
                  {recentTrips.length > 0 ? (
                    recentTrips.map((trip) => (
                      <tr key={trip.id} className="border-t border-emerald/10">
                        <td className="py-3 pr-4">{trip.start_location} - {trip.end_location}</td>
                        <td className="py-3 pr-4">{titleCase(trip.vehicle_type)}</td>
                        <td className="py-3 pr-4">{trip.distance_km.toFixed(1)}</td>
                        <td className="py-3 pr-4">{trip.co2_kg.toFixed(2)}</td>
                        <td className="py-3">
                          {new Date(trip.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-sm text-muted-foreground">
                        No trips yet. Add one to see it here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>
    </div>
  );
};

export default Dashboard;
