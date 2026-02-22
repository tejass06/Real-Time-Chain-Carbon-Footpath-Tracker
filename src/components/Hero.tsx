import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3 } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 gradient-hero opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent" />

      <div className="relative z-10 container mx-auto px-4 text-center pt-20">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 opacity-0 animate-fade-up-delay-1 max-w-4xl mx-auto">
          <span className="text-primary-foreground">Track, Analyze & Reduce Your Supply Chain </span>
          <span className="text-gradient-green">Carbon Emissions</span>
          <span className="text-primary-foreground"> in Real-Time</span>
        </h1>

        <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10 opacity-0 animate-fade-up-delay-2">
          Smart logistics monitoring with live carbon analytics and route optimization.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-up-delay-3">
          <Button 
            variant="hero" 
            size="lg" 
            className="text-base px-8 py-6"
            onClick={() => navigate("/signup")}
          >
            Get Started <ArrowRight className="ml-1 h-5 w-5" />
          </Button>
          <Button 
            variant="heroOutline" 
            size="lg" 
            className="text-base px-8 py-6"
            onClick={() => navigate("/dashboard")}
          >
            <BarChart3 className="mr-1 h-5 w-5" /> View Dashboard
          </Button>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
