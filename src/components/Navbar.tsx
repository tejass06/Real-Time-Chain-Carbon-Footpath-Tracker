import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Leaf, Truck, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = ["Home", "Dashboard", "Profile", "Records", "Optimization", "Supplier Reports"];

const getNavHref = (link: string) => {
  if (link === "Dashboard") {
    return "/dashboard";
  }
  if (link === "Profile") {
    return "/profile";
  }
  if (link === "Records") {
    return "/records";
  }
  if (link === "Optimization") {
    return "/optimization";
  }
  if (link === "Supplier Reports") {
    return "/supplier-reports";
  }
  return `#${link.toLowerCase()}`;
};

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isSupplierReports = location.pathname.startsWith("/supplier-reports");
  const isProfile = location.pathname.startsWith("/profile");
  const isRecords = location.pathname.startsWith("/records");
  const isOptimization = location.pathname.startsWith("/optimization");
  const visibleLinks = navLinks.filter((link) => !((isDashboard || isSupplierReports || isProfile || isRecords || isOptimization) && link === "Home"));

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-card shadow-soft py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
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
          
          {user ? (
            <div className="flex items-center gap-2 ml-4 border-l border-emerald/20 pl-4">
              <span className={`text-sm font-medium ${scrolled ? "text-foreground" : "text-primary-foreground/80"}`}>
                {user.email}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/login")}
                className={scrolled ? "" : "text-primary-foreground hover:text-primary-foreground"}
              >
                Log In
              </Button>
              <Button 
                variant="hero" 
                size="sm"
                onClick={() => navigate("/signup")}
              >
                Get Started
              </Button>
            </div>
          )}
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
          
          {user ? (
            <div className="mt-4 pt-4 border-t border-emerald/20">
              <p className="px-4 py-2 text-sm text-muted-foreground">
                Logged in as: {user.email}
              </p>
              <Button 
                variant="ghost" 
                className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" /> Log Out
              </Button>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-emerald/20 space-y-2">
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => {
                  navigate("/login");
                  setMobileOpen(false);
                }}
              >
                Log In
              </Button>
              <Button 
                variant="hero" 
                className="w-full"
                onClick={() => {
                  navigate("/signup");
                  setMobileOpen(false);
                }}
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
