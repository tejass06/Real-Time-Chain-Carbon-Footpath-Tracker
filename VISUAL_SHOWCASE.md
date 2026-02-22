# 🎨 OptimizationPage - Visual Showcase & UI Documentation

## 🖼️ Page Layout

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│  🌿 CarbonTrack  | Home | Dashboard | Profile | Optimization | Reports   │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  📍 Route Optimization                                                    │
│  Find the most eco-friendly vehicle option for your route                 │
│                                                                            │
├─────────────────────────────────────┬──────────────────────────────────────┤
│                                     │                                      │
│  📋 Route Details                   │  🗺️  Mapbox Map                     │
│  ┌─────────────────────────────┐    │  ┌──────────────────────────────┐  │
│  │ Start Location              │    │  │                              │  │
│  │ Latitude:     [28.7041]     │    │  │     🟢 Start Marker          │  │
│  │ Longitude:    [77.1025]     │    │  │                              │  │
│  │                             │    │  │  ╱─────────────────────╲     │  │
│  │ End Location                │    │  │ ╱  Route Line (Colored) ╲    │  │
│  │ Latitude:     [28.5355]     │    │  ││                         │   │  │
│  │ Longitude:    [77.3910]     │    │  │ ╲    🔴 End Marker      ╱   │  │
│  │                             │    │  │  ╲─────────────────────╱     │  │
│  │ Current Vehicle Type        │    │  │     (Zoom + Pan Controls)    │  │
│  │ [diesel ▼]                  │    │  │                              │  │
│  │                             │    │  └──────────────────────────────┘  │
│  │ Calculated Distance         │    │                                      │
│  │ 25.52 km                    │    │                                      │
│  │                             │    │                                      │
│  │ [Get Optimization...] ▶️     │    │                                      │
│  └─────────────────────────────┘    │                                      │
│                                     │                                      │
│  ✨ Optimization Results            │                                      │
│  ┌─────────────────────────────┐    │                                      │
│  │ Current Emission            │    │                                      │
│  │ 40.50 kg CO₂ (Diesel) ⚡    │    │                                      │
│  │                             │    │                                      │
│  │ 🟢 Electric Vehicle         │    │                                      │
│  │ New Emission: 3 kg CO₂      │    │                                      │
│  │ CO₂ Saved: 37.50 kg (92%) ↓ │    │                                      │
│  │                             │    │                                      │
│  │ 🟠 Petrol Vehicle           │    │                                      │
│  │ New Emission: 12.15 kg CO₂  │    │                                      │
│  │ CO₂ Saved: 28.35 kg (70%) ↓ │    │                                      │
│  └─────────────────────────────┘    │                                      │
│                                     │                                      │
└─────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 🎯 Form Inputs Detail

### Start Location Section
```
┌─────────────────────────────────────────┐
│ Start Location                          │
├─────────────────────────────────────────┤
│ Latitude              │  Longitude       │
│ ┌──────────────────┐  │ ┌──────────────┐│
│ │ e.g., 28.7041   │  │ │ e.g., 77.1025││
│ └──────────────────┘  │ └──────────────┘│
└─────────────────────────────────────────┘
```

### Vehicle Type Dropdown
```
Current Vehicle Type
┌─────────────────────────┐
│ diesel          ▼       │
├─────────────────────────┤
│ diesel         ✓       │
│ petrol                 │
│ electric               │
└─────────────────────────┘
```

### Distance Display (After Input)
```
┌────────────────────────────────┐
│ Calculated Distance            │
│ 25.52 km                       │ ← Shows after inputs are entered
└────────────────────────────────┘
```

### Error Message Display
```
┌────────────────────────────────────────┐
│ ⚠️  Invalid coordinates. Latitude      │
│ must be between -90 and 90...          │
└────────────────────────────────────────┘
      ↑ Red background
      Appears only when error exists
```

---

## 📊 Results Card Display

### When API Returns Data
```
┌─────────────────────────────────────────┐
│ ✨ Optimization Results                 │
├─────────────────────────────────────────┤
│                                         │
│ Current Emission                        │
│ ┌─────────────────────────────────────┐ │
│ │ 40.50 kg CO₂               ⚡        │ │
│ │ Diesel vehicle                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Better Options:                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🟢 Electric Vehicle          [↓]     │ │
│ │                                      │ │
│ │ New Emission: 3.00 kg CO₂            │ │
│ │ CO₂ Saved: 37.50 kg                  │ │
│ │ 92.6% reduction                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🟠 Petrol Vehicle           [↓]     │ │
│ │                                      │ │
│ │ New Emission: 12.15 kg CO₂           │ │
│ │ CO₂ Saved: 28.35 kg                  │ │
│ │ 70.0% reduction                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🗺️ Mapbox Map Features

### Map Styling
- **Base Style**: Dark theme (mapbox://styles/mapbox/dark-v11)
- **Markers**: Draggable, removable
- **Polyline**: 4px width, 80% opacity
- **Controls**: Top-right corner (zoom, pan, rotate)

### Route Colors by Vehicle Type

```
Diesel   → 🔴 Red     (#ef4444)
          ├─ Highest emissions
          └─ Most carbon-intensive

Petrol   → 🟠 Orange  (#f97316)
          ├─ Medium emissions
          └─ Moderate impact

Electric → 🟢 Green   (#10b981)
          ├─ Lowest emissions
          └─ Most eco-friendly
```

### Marker Customization
```
Start Marker: 🟢 Green
├─ Color: #10b981 (emerald)
├─ Position: [startLon, startLat]
└─ Label: Draggable on map

End Marker: 🔴 Red
├─ Color: #ef4444 (red)
├─ Position: [endLon, endLat]
└─ Label: Draggable on map
```

---

## 🎨 Color Scheme

### Primary Colors (Sustainability Theme)
```
Emerald Green:  #10b981  ← Eco-friendly, primary action
Emerald Light:  #d1fae5  ← Soft backgrounds
Dark Background:#0f172a  ← Dark theme
```

### Vehicle-Related Colors
```
Electric: #10b981  ← Green (best choice)
Petrol:   #f97316  ← Orange (medium)
Diesel:   #ef4444  ← Red (worst choice)
```

### UI Components
```
Cards:      Glass-morphism with shadows
Borders:    Emerald/10 opacity
Backgrounds: Accent with transparency
Text:       Foreground on dark background
```

---

## 📱 Responsive Breakpoints

### Mobile (< 768px)
```
Full width, vertical stack
┌──────────────────────┐
│       Navbar         │
├──────────────────────┤
│  Form Inputs         │
│  - All inputs        │
│  - Vehicle select    │
│  - Submit button     │
├──────────────────────┤
│  Results (if any)    │
│  - Current emission  │
│  - Suggestions       │
├──────────────────────┤
│  Map (600px height)  │
│  - Markers           │
│  - Route             │
└──────────────────────┘
```

### Tablet (768px - 1024px)
```
Two column, some responsiveness
┌─────────────┬─────────────┐
│Form+Results │    Map      │
│   50%       │    50%      │
└─────────────┴─────────────┘
```

### Desktop (1024px+)
```
Optimized two column
┌──────────────────┬────────────────┐
│ Form + Results   │     Map        │
│    40%           │     60%        │
│                  │   Auto height  │
└──────────────────┴────────────────┘
```

---

## ✨ Interactive Elements

### Hover States

#### Button Hover
```
Normal: [Get Optimization...] 
Hover:  [Get Optimization...] ← Highlighted
```

#### Suggestion Card Hover
```
Normal:  ┌─────────────────────┐
         │ 🟢 Electric Vehicle │
         └─────────────────────┘

Hover:   ┌─────────────────────┐  ← Card lifts up
         │ 🟢 Electric Vehicle │  ← Subtle shadow
         └─────────────────────┘
```

#### Input Focus
```
Normal:  [Input field with border]
Focus:   [Input field] ← Green border glow
```

---

## 🎯 Form Validation States

### Valid State
```
✅ All fields filled
✅ Coordinates in range
✅ Distance > 0.1 km
→ Submit button enabled
```

### Invalid State
```
❌ Missing field
❌ Invalid coordinate
❌ Distance too small
→ Error message shown
→ Submit button disabled (metaphorically)
```

### Loading State
```
[Analyzing Route...] ← Button text changes
← Spinner animation
← Input disabled
```

---

## 📊 Data Display Examples

### Example 1: Delhi to Noida
```
Start:       New Delhi (28.7041°N, 77.1025°E)
End:         Noida (28.5355°N, 77.3910°E)
Distance:    25.52 km
Vehicle:     Diesel

Results:
Current:     40.50 kg CO₂
Electric:    3.00 kg CO₂ (-37.50 kg, -92.6%)
Petrol:      12.15 kg CO₂ (-28.35 kg, -70.0%)
```

### Example 2: Cross-Country
```
Start:       New York (40.7128°N, -74.0060°W)
End:         Boston (42.3601°N, -71.0589°W)
Distance:    349 km
Vehicle:     Petrol

Results:
Current:     1095 kg CO₂
Electric:    100 kg CO₂ (-995 kg, -91%)
Diesel:      349 kg CO₂ (-746 kg, -68%)
```

---

## 🔔 Loading & Error States

### Loading State
```
┌────────────────────────────┐
│ [Analyzing Route...]       │
│                            │
│ ⏳ Spinner animation       │
│                            │
└────────────────────────────┘
```

### Error State
```
┌────────────────────────────────────┐
│ ⚠️  Invalid coordinates.            │
│ Latitude must be between -90 and 90 │
│                                     │
│ [Dismiss / Try Again]               │
└────────────────────────────────────┘
```

### Success State
```
┌────────────────────────────────────┐
│ ✅ Data loaded successfully!       │
│                                     │
│ Results showing below...            │
│ Map updated with markers and route  │
└────────────────────────────────────┘
```

---

## 🎯 Icons Used

From **lucide-react** icon library:

| Icon | Where | Meaning |
|------|-------|---------|
| `Zap` ⚡ | Current emission card | Energy/Power |
| `TrendingDown` ↓ | Suggestions | Decreased emissions |
| `AlertCircle` ⚠️ | Error messages | Warning |
| `MapPin` 📍 | Map markers | Location |
| `Leaf` 🌿 | Navbar/Branding | Sustainability |
| `Truck` 🚛 | Navbar/Branding | Transport |

---

## 🎨 Tailwind CSS Classes Used

### Layout Classes
```
grid grid-cols-1 lg:grid-cols-2  ← Responsive two-column
container mx-auto px-4          ← Centered content
flex items-center justify-between ← Alignment
space-y-6                        ← Vertical spacing
gap-4                            ← Gap between items
```

### Styling Classes
```
glass-card                      ← Glass-morphism effect
rounded-2xl                     ← Large border radius
border border-emerald/10        ← Subtle border
shadow-soft                     ← Soft shadow
hover-lift                      ← Hover elevation
bg-accent/50                    ← Transparent background
text-foreground                 ← Primary text color
text-muted-foreground          ← Secondary text color
```

### State Classes
```
disabled:opacity-50            ← Disabled state
focus:ring-2                   ← Focus state
hover:bg-emerald/10           ← Hover background
transition-all duration-300   ← Animation
```

---

## 📋 Component Props & Configuration

### SelectTrigger (Vehicle Type)
```typescript
<SelectTrigger className="bg-accent/50 border-emerald/20">
  <SelectValue placeholder="Select vehicle type" />
</SelectTrigger>
```

### Button (Submit)
```typescript
<Button
  type="submit"
  variant="hero"      // Custom emerald styling
  size="lg"          // Large size
  className="w-full" // Full width
  disabled={isLoading}
>
  {isLoading ? "Analyzing Route..." : "Get Optimization Suggestions"}
</Button>
```

### Card (Results)
```typescript
<Card className="glass-card border border-emerald/10 p-6 shadow-soft">
  {/* Content */}
</Card>
```

---

## 🚀 Animation & Transitions

### Page Load
```
Elements fade in
Cards slide up slightly
Map renders smoothly
```

### Button Click
```
Button opacity changes
Loading spinner animates
Results fade in when ready
```

### Map Updates
```
Markers appear smoothly
Polyline draws instantly
Map pans to fit bounds
Zoom animates over 1 second
```

---

## ♿ Accessibility Features

### Form Labels
```
<label className="text-sm font-semibold">Start Location</label>
<label className="text-xs text-muted-foreground">Latitude</label>
```

### Input Attributes
```
type="number"
placeholder="e.g., 28.7041"
min="-90"
max="90"
step="0.0001"
```

### Color Contrast
```
✅ Text on background meets WCAG AA
✅ Icons accompanied by text labels
✅ Error messages in red (with text)
✅ All interactive elements keyboard accessible
```

---

## 📐 Spacing & Typography

### Heading Sizes
```
h1 (Page Title):     text-4xl font-bold
h2 (Section):        text-3xl font-bold
h3 (Subsection):     text-xl font-bold
```

### Text Sizes
```
Labels:              text-sm font-semibold
Help text:           text-xs text-muted-foreground
Body text:           text-sm (default)
Large numbers:       text-2xl or text-3xl font-bold
```

### Spacing
```
Component padding:   p-4 to p-6
Section margins:     mb-4 to mb-12
Grid gaps:          gap-4 to gap-6
Input spacing:      space-y-2 to space-y-6
```

---

## 🎬 Visual Flow Sequence

```
1. User loads page
   └─ See form, blank map

2. User enters coordinates
   └─ Map shows markers + route in gray

3. User selects vehicle
   └─ Display updates

4. User clicks submit
   └─ Loading animation starts

5. API responds
   └─ Results appear
   └─ Map route changes color

6. User sees results
   └─ Can modify and resubmit
```

---

This comprehensive visual documentation shows exactly how the OptimizationPage looks and behaves!
