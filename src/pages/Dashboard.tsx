import Navbar from "@/components/Navbar";
import heroBg from "@/assets/hero-bg.jpg";
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

const dailyEmissions = [
  { date: "2026-03-01", co2: 45 },
  { date: "2026-03-02", co2: 51 },
  { date: "2026-03-03", co2: 40 },
  { date: "2026-03-04", co2: 58 },
  { date: "2026-03-05", co2: 49 },
  { date: "2026-03-06", co2: 62 },
  { date: "2026-03-07", co2: 55 },
];

const routeEmissions = [
  { route: "Pune - Mumbai", emission: 40 },
  { route: "Delhi - Jaipur", emission: 32 },
  { route: "Chennai - Bengalu", emission: 28 },
  { route: "Hyderabad - Nagpur", emission: 22 },
  { route: "Kolkata - Patna", emission: 18 },
];

const vehicleEmissions = [
  { type: "Diesel Truck", emission: 120 },
  { type: "CNG Truck", emission: 72 },
  { type: "Hybrid Carrier", emission: 56 },
];

const VEHICLE_COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];

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

const LineChartComponent = () => (
  <div className="glass-card rounded-2xl p-6 shadow-soft hover-lift">
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-foreground">Daily Emissions Trend</h2>
      <p className="text-sm text-muted-foreground">CO2 output for the last 7 days.</p>
    </div>
    <div className="h-72 w-full rounded-xl bg-white/60 p-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dailyEmissions} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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

const BarChartComponent = () => (
  <div className="glass-card rounded-2xl p-6 shadow-soft hover-lift">
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-foreground">Emissions by Route</h2>
      <p className="text-sm text-muted-foreground">Highest emitting logistics corridors.</p>
    </div>
    <div className="h-72 w-full rounded-xl bg-white/60 p-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={routeEmissions} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
          <Bar dataKey="emission" name="CO2 (t)" fill="#34d399" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const PieChartComponent = () => (
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
            data={vehicleEmissions}
            dataKey="emission"
            nameKey="type"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
          >
            {vehicleEmissions.map((entry, index) => (
              <Cell key={entry.type} fill={VEHICLE_COLORS[index % VEHICLE_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const Dashboard = () => {
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
            <StatCard label="Total CO2 Today" value="12.4 tCO2e" delta="-6% vs yesterday" />
            <StatCard label="Total CO2 This Month" value="328 tCO2e" delta="-12% vs last month" />
            <StatCard label="Total Trips" value="1,284" delta="+4% week over week" />
            <StatCard label="Active Vehicles" value="86" delta="12 currently in transit" />
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <LineChartComponent />
            <BarChartComponent />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <PieChartComponent />
            <div className="glass-card rounded-2xl p-6 shadow-soft hover-lift border border-emerald/10">
              <h2 className="text-lg font-semibold text-foreground">Operational Insights</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Key signals from your network to keep carbon down and deliveries on time.
              </p>
              <div className="mt-4 rounded-xl bg-emerald/10 px-4 py-3 text-xs font-semibold text-emerald">
                Eco Impact Score: 82 / 100
              </div>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                <li>Route 18 emitted 4% above target. Suggesting greener carrier swap.</li>
                <li>EV fleet utilization improved 12% after auto-optimization.</li>
                <li>Highest monthly emissions remain in west corridor lanes.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>
    </div>
  );
};

export default Dashboard;
