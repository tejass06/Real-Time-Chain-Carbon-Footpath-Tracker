import { Leaf, Truck, Github, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="gradient-navy py-16 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative">
                <Leaf className="h-6 w-6 text-emerald" />
                <Truck className="absolute -bottom-1 -right-1 h-3 w-3 text-emerald-light" />
              </div>
              <span className="text-lg font-bold text-primary-foreground">CarbonTrack</span>
            </div>
            <p className="text-primary-foreground/50 text-sm leading-relaxed">
              Making supply chains sustainable, one route at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4 text-sm">Product</h4>
            <ul className="space-y-2">
              {["Dashboard", "Route Optimization", "Analytics", "Reports"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-primary-foreground/50 hover:text-emerald text-sm transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4 text-sm">Company</h4>
            <ul className="space-y-2">
              {["About Us", "Careers", "Blog", "Press"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-primary-foreground/50 hover:text-emerald text-sm transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4 text-sm">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-primary-foreground/50 text-sm">
                <Mail className="h-4 w-4 text-emerald" /> hello@carbontrack.io
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/50 text-sm">
                <Phone className="h-4 w-4 text-emerald" /> +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/50 text-sm">
                <MapPin className="h-4 w-4 text-emerald" /> San Francisco, CA
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/40 text-sm">
            © 2026 CarbonTrack. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[Twitter, Linkedin, Github].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="h-9 w-9 rounded-lg flex items-center justify-center text-primary-foreground/40 hover:text-emerald hover:bg-emerald/10 transition-all"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
