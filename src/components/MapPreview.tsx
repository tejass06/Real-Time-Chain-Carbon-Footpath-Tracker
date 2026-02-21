const MapPreview = () => {
  return (
    <section className="py-24 px-4" id="map">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <span className="text-emerald font-semibold text-sm uppercase tracking-wider">Live Map</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 text-foreground">
            Route Emission Visualization
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            See real-time emission data overlaid on interactive maps with color-coded route severity.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-border">
          {/* Mock Map */}
          <div className="aspect-video bg-gradient-to-br from-navy to-navy-light relative">
            {/* Grid lines */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(152, 60%, 40%)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Routes */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 450">
              {/* Green route */}
              <path d="M 100 350 Q 200 200 350 250 Q 450 280 500 180" fill="none" stroke="hsl(152, 60%, 50%)" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 4" />
              {/* Orange route */}
              <path d="M 150 380 Q 300 320 400 340 Q 500 360 600 280" fill="none" stroke="hsl(35, 90%, 55%)" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 4" />
              {/* Red route */}
              <path d="M 200 100 Q 350 150 500 120 Q 600 100 700 200" fill="none" stroke="hsl(0, 70%, 55%)" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 4" />

              {/* Dots */}
              <circle cx="100" cy="350" r="6" fill="hsl(152, 60%, 50%)" />
              <circle cx="500" cy="180" r="6" fill="hsl(152, 60%, 50%)" />
              <circle cx="150" cy="380" r="6" fill="hsl(35, 90%, 55%)" />
              <circle cx="600" cy="280" r="6" fill="hsl(35, 90%, 55%)" />
              <circle cx="200" cy="100" r="6" fill="hsl(0, 70%, 55%)" />
              <circle cx="700" cy="200" r="6" fill="hsl(0, 70%, 55%)" />
            </svg>

            {/* Tooltip cards */}
            <div className="absolute top-16 right-16 glass-card-dark rounded-xl px-4 py-3 text-primary-foreground text-xs">
              <div className="font-semibold text-sm mb-1">Route A-42</div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald" />
                <span>12.4 kg CO₂ · Low</span>
              </div>
            </div>

            <div className="absolute bottom-20 left-16 glass-card-dark rounded-xl px-4 py-3 text-primary-foreground text-xs">
              <div className="font-semibold text-sm mb-1">Route B-17</div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: "hsl(35, 90%, 55%)" }} />
                <span>34.8 kg CO₂ · Medium</span>
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 glass-card-dark rounded-lg px-3 py-2 flex items-center gap-4 text-xs text-primary-foreground/80">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald" /> Low</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "hsl(35, 90%, 55%)" }} /> Medium</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "hsl(0, 70%, 55%)" }} /> High</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapPreview;
