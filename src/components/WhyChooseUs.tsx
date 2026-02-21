import { DollarSign, Wifi, Zap, Plug } from "lucide-react";

const reasons = [
  {
    icon: DollarSign,
    title: "Cost-Effective Solution",
    description: "Reduce operational costs with optimized routes and lower carbon penalties.",
  },
  {
    icon: Wifi,
    title: "No IoT Required",
    description: "Works with existing logistics data — no expensive hardware installations needed.",
  },
  {
    icon: Zap,
    title: "Real-Time Insights",
    description: "Get instant carbon metrics and actionable recommendations as shipments move.",
  },
  {
    icon: Plug,
    title: "Easy Integration",
    description: "Connects seamlessly with ERP, TMS, and existing logistics platforms via API.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-24 px-4 bg-muted/50" id="why">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <span className="text-emerald font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 text-foreground">
            Built for Modern Supply Chains
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="text-center p-8 rounded-2xl bg-card shadow-soft hover-lift"
            >
              <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-5">
                <reason.icon className="h-7 w-7 text-emerald" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{reason.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
