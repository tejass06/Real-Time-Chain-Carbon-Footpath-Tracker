import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";

import MapPreview from "@/components/MapPreview";
import WhyChooseUs from "@/components/WhyChooseUs";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      
      <MapPreview />
      <WhyChooseUs />
      <Footer />
    </div>
  );
};

export default Index;
