import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Leaf, Truck, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = ["Home", "Dashboard", "Profile", "Records", "Optimization", "Reports", "Login"];

const getNavHref = (link: string) => {
  if (link === "Dashboard") {
    return "/dashboard";
  }
  if (link === "Profile") {
    return "/profile";
  }
  if (link === "Optimization") {
    return "/optimization";
  }
  if (link === "Login") {
    return "/login";
  }
  return `#${link.toLowerCase()}`;
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const visibleLinks = navLinks.filter((link) => !(isDashboard && link === "Home"));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-card shadow-soft py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Leaf className="h-7 w-7 text-emerald" />
            <Truck className="absolute -bottom-1 -right-1 h-4 w-4 text-emerald-light" />
          </div>
          <span className={`text-lg font-bold transition-colors ${scrolled ? "text-foreground" : "text-primary-foreground"}`}>
            CarbonTrack
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {visibleLinks.map((link) => (
            <a
              key={link}
              href={getNavHref(link)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-emerald/10 hover:text-emerald ${
                scrolled ? "text-foreground" : "text-primary-foreground/80 hover:text-primary-foreground"
              }`}
            >
              {link}
            </a>
          ))}
          <Button variant="hero" size="sm" className="ml-2">
            Get Started
          </Button>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-emerald"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass-card mt-2 mx-4 rounded-xl p-4 animate-fade-up">
          {visibleLinks.map((link) => (
            <a
              key={link}
              href={getNavHref(link)}
              className="block px-4 py-3 text-sm font-medium text-foreground hover:text-emerald hover:bg-accent rounded-lg transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link}
            </a>
          ))}
          <Button variant="hero" className="w-full mt-2">Get Started</Button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
