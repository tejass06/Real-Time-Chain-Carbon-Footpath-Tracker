# OptimizationPage - Architecture & Data Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   React Frontend (Vite)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  OptimizationPage Component                           │  │
│  │  ┌────────────────┐          ┌──────────────────┐    │  │
│  │  │ Form Inputs    │          │ State Management │    │  │
│  │  │ - Start coords │          │ - Loading        │    │  │
│  │  │ - End coords   │          │ - Error          │    │  │
│  │  │ - Vehicle type │          │ - Result         │    │  │
│  │  └────────────────┘          │ - Distance       │    │  │
│  │                              └──────────────────┘    │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Mapbox GL JS Map                             │  │  │
│  │  │  - Green marker (start)                        │  │  │
│  │  │  - Red marker (end)                            │  │  │
│  │  │  - Colored polyline (route)                    │  │  │
│  │  │  - Navigation controls                         │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP POST /optimize
                          │
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  /optimize Endpoint                                   │  │
│  │  - Calculate emissions (distance × multiplier)        │  │
│  │  - Compare vehicle types                              │  │
│  │  - Return suggestions with CO₂ savings                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ JSON Response
                          ▼
                    Show Results
```

---

## User Interaction Flow

```
START
  │
  ├─► User clicks "Optimization" link in navbar
  │         │
  │         └─► /optimization route loaded
  │
  ├─► Page displays form with input fields
  │
  ├─► User enters coordinates
  │   ├─ Start Lat: 28.7041
  │   ├─ Start Lon: 77.1025
  │   ├─ End Lat: 28.5355
  │   ├─ End Lon: 77.3910
  │   └─ Vehicle: diesel
  │
  ├─► Console shows calculated distance: 25.5 km
  │
  ├─► User clicks "Get Optimization Suggestions"
  │   │
  │   ├─► Form validates all inputs ✓
  │   ├─► Distance calculated (Haversine) ✓
  │   └─► API request sent with:
  │       {
  │         distance_km: 25.5,
  │         current_vehicle: "diesel"
  │       }
  │
  ├─► Loading spinner shows...
  │
  ├─► API response received
  │   {
  │     current_vehicle: "diesel",
  │     current_emission: 40.5,
  │     suggestions: [
  │       { better_vehicle: "electric", 
  │         new_emission: 3, 
  │         co2_saved: 37.5 }
  │     ]
  │   }
  │
  ├─► Results displayed below form
  │
  ├─► Map updates:
  │   ├─ Adds green start marker at (77.1025, 28.7041)
  │   ├─ Adds red end marker at (77.3910, 28.5355)
  │   ├─ Draws polyline between points
  │   ├─ Route color changes to: Red (diesel) → Green (electric suggestion)
  │   └─ Auto-centers and zooms to fit route
  │
  └─► User can view results and map visualization
         │
         └─► Can modify inputs and try again
             or navigate to another page
```

---

## Component Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  User Input (Form)                                          │
│  startLat, startLon, endLat, endLon, vehicle               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Validation Logic                                           │
│  - Check all fields filled                                  │
│  - Validate coordinate ranges                               │
│  - Check minimum distance                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
              ✓ Valid        ✗ Invalid
                    │             │
                    ▼             ▼
          Calculate Distance   Show Error
                    │             │
                    └──────┬──────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Distance Calculation (Haversine Formula)                   │
│  Uses: lat1, lon1, lat2, lon2                              │
│  Returns: distance in kilometers                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  API Request                                                │
│  POST /optimize                                             │
│  Body: { distance_km, current_vehicle }                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
                 ✓ Success   ✗ Error
                    │             │
                    ▼             ▼
            Parse Response      Show Error
            (OptimizationResult)   Message
                    │             │
                    └──────┬──────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Update Map                                                 │
│  - Clear previous markers                                   │
│  - Add new markers (green start, red end)                  │
│  - Draw polyline with route color                          │
│  - Auto-fit bounds                                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Display Results                                            │
│  - Current emission                                         │
│  - Suggested vehicles                                       │
│  - CO₂ savings for each                                     │
│  - Percentage reduction                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## State Management Diagram

```
OptimizationPage Component State
│
├─── Form State
│    ├─ startLat: string
│    ├─ startLon: string
│    ├─ endLat: string
│    ├─ endLon: string
│    └─ vehicle: "diesel" | "petrol" | "electric"
│
├─── UI State
│    ├─ isLoading: boolean
│    ├─ error: string | null
│    ├─ result: OptimizationResult | null
│    └─ distance: number | null
│
└─── Map State
     ├─ mapContainer: HTMLDivElement ref
     ├─ map: mapboxgl.Map ref
     ├─ markersRef: mapboxgl.Marker[]
     └─ lineSourceRef: boolean
```

---

## Map Update Lifecycle

```
Component Mount
    │
    ├─► Initialize Mapbox
    │   ├─ Set access token
    │   ├─ Create map with dark theme
    │   ├─ Center at [0, 0], zoom 2
    │   └─ Add navigation controls
    │
    └─► Ready for user input


User Changes Coordinates
    │
    ├─► useEffect triggered (dependency: coords)
    │   │
    │   ├─ Check if map exists
    │   ├─ Parse latitude/longitude values
    │   │
    │   ├─► Clear existing markers
    │   │   └─ forEach marker.remove()
    │   │
    │   ├─► Add new markers
    │   │   ├─ Green marker at start [lon1, lat1]
    │   │   └─ Red marker at end [lon2, lat2]
    │   │
    │   ├─► Update map bounds
    │   │   └─ fitBounds with padding
    │   │
    │   └─► Add/Update route line
    │       ├─ If first time: addSource + addLayer
    │       └─ If exists: setData on source
    │
    └─► Map shows route with markers


User Gets Optimization Result
    │
    ├─► useEffect triggered (dependency: result)
    │   │
    │   └─► Update route color
    │       └─ setPaintProperty with getRouteColor(vehicle)
    │
    └─► Map shows colored route based on vehicle type
```

---

## Distance Calculation Mathematical Flow

```
Input Points:
  Start: (lat₁, lon₁) = (28.7041, 77.1025)
  End:   (lat₂, lon₂) = (28.5355, 77.3910)

Step 1: Convert to radians
  dLat = (lat₂ - lat₁) × π/180
  dLon = (lon₂ - lon₁) × π/180

Step 2: Haversine formula
  a = sin²(dLat/2) + cos(lat₁) × cos(lat₂) × sin²(dLon/2)
  c = 2 × atan2(√a, √(1-a))

Step 3: Calculate distance
  distance = R × c
  where R = 6371 km (Earth's radius)

Result: ~25.5 km
```

---

## API Request/Response Cycle

```
Frontend Sends:
┌──────────────────────────────────────┐
│ POST /optimize                        │
│ Body:                                │
│ {                                    │
│   "distance_km": 25.5,              │
│   "current_vehicle": "diesel"        │
│ }                                    │
└──────────────────────────────────────┘
              │
              │ (HTTP request)
              ▼
┌──────────────────────────────────────┐
│ FastAPI Backend                       │
│ /optimize endpoint processes:         │
│ 1. Calculate current emission:        │
│    - diesel: 25.5 × 1.588 = 40.5 CO₂│
│ 2. Calculate alternatives:            │
│    - electric: 25.5 × 0.117 = 3 CO₂ │
│    - petrol: 25.5 × 0.476 = 12.15 CO₂
│ 3. Calculate savings:                 │
│    - vs electric: 40.5 - 3 = 37.5 kg │
│    - vs petrol: 40.5 - 12.15 = 28.35 │
└──────────────────────────────────────┘
              │
              │ (HTTP response)
              ▼
Backend Returns:
┌──────────────────────────────────────┐
│ {                                    │
│   "current_vehicle": "diesel",       │
│   "current_emission": 40.5,          │
│   "suggestions": [                   │
│     {                                │
│       "better_vehicle": "electric",  │
│       "new_emission": 3,             │
│       "co2_saved": 37.5              │
│     },                               │
│     {                                │
│       "better_vehicle": "petrol",    │
│       "new_emission": 12.15,         │
│       "co2_saved": 28.35             │
│     }                                │
│   ]                                  │
│ }                                    │
└──────────────────────────────────────┘
              │
              │ (Parse & display)
              ▼
┌──────────────────────────────────────┐
│ Frontend displays:                    │
│ - Current: 40.5 kg CO₂ (diesel)     │
│ - Best: Electric → -37.5 kg (92.6%)  │
│ - Good: Petrol → -28.35 kg (70%)    │
└──────────────────────────────────────┘
```

---

## Responsive Layout Breakpoints

```
Mobile (< md: 768px)
┌─────────────────┐
│     Form        │ 100% width
├─────────────────┤
│ Results (if any)│ 100% width
├─────────────────┤
│                 │
│      Map        │ 600px height, 100% width
│                 │
└─────────────────┘

Tablet (md: 768px to lg: 1024px)
┌──────────────────────────┐
│      Form + Results      │
│      50% width           │
├───────┬──────────────────┤
│       │                  │
│ Map   │     Map          │
│ 50%   │   50% width      │
│       │                  │
└───────┴──────────────────┘

Desktop (lg: 1024px+)
┌────────────────┬──────────────────┐
│ Form + Results │                  │
│   40% width    │       Map        │
│                │    60% width     │
│                │ Auto height      │
└────────────────┴──────────────────┘
```

---

## Environment & Configuration

```
.env.local
├─ VITE_API_BASE_URL = "http://127.0.0.1:8000"
│  └─ Used by apiFetchJson in /optimize POST call
│
└─ VITE_MAPBOX_TOKEN = "pk.eyJ1..."
   └─ Set as mapboxgl.accessToken before map initialization
```

---

## Error Handling Tree

```
Optimization Flow
│
├─► Validate Inputs
│   ├─ Empty fields? → "Please fill in all fields..."
│   ├─ Invalid numbers? → "Please fill in all fields..."
│   └─ Out of range? → "Invalid coordinates..."
│
├─► Check Distance
│   └─ Too small (< 0.1 km)? → "Start and end points are too close..."
│
├─► Call API
│   └─ Network error? → "Failed to get optimization suggestions..."
│
├─► Missing Token
│   └─ No VITE_MAPBOX_TOKEN? → Console error (doesn't crash app)
│
└─► Map Rendering
    └─ Invalid coordinates? → Try-catch logs error, map doesn't update
```

---

## Component Lifecycle

```
1. MOUNT
   ├─ Parse environment tokens
   ├─ Initialize Mapbox map
   └─ Set up event listeners

2. USER INPUT
   ├─ Capture form changes
   ├─ Update component state
   └─ Trigger map update effects

3. SUBMIT
   ├─ Validate inputs
   ├─ Call API
   ├─ Update state with results
   └─ Trigger map color update

4. DISPLAY
   ├─ Show results if available
   ├─ Show errors if any
   └─ Display colored map route

5. UNMOUNT
   ├─ Remove map instance
   └─ Clean up event listeners
```

---

This comprehensive documentation provides complete visibility into the OptimizationPage architecture and data flow!
