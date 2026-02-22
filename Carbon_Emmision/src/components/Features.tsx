import {
  Activity,
  MapPin,
  Truck,
  Lightbulb,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Real-Time Carbon Calculation",
    description: "Instantly compute carbon emissions for every route and shipment across your supply chain.",
  },
  {
    icon: MapPin,
    title: "Interactive Route Mapping",
    description: "Visualize routes with color-coded emission intensity and explore greener alternatives.",
  },
  {
    icon: Truck,
    title: "Vehicle Emission Tracking",
    description: "Monitor per-vehicle CO₂ output with detailed logs and historical trend data.",
  },
  {
    icon: Lightbulb,
    title: "Optimization Suggestions",
    description: "AI-powered recommendations to reduce fuel usage, costs, and carbon footprint.",
  },
  {
    icon: BarChart3,
    title: "Live Analytics Charts",
    description: "Dynamic dashboards with real-time charts tracking emission KPIs and savings.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Record Management",
    description: "Tamper-proof records for compliance reporting and audit-ready documentation.",
  },
];

const Features = () => {
  return (
    <section className="py-24 px-4" id="features">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <span className="text-emerald font-semibold text-sm uppercase tracking-wider">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 text-foreground">
            Everything You Need to Go Green
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Comprehensive tools for monitoring, analyzing, and reducing your supply chain carbon emissions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="glass-card rounded-2xl p-7 hover-lift group cursor-default"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="h-12 w-12 rounded-xl gradient-emerald flex items-center justify-center mb-5 group-hover:animate-pulse-glow transition-all">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
