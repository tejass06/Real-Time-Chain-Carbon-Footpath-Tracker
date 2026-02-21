# Optimization Page - Implementation Guide

## ✅ What Was Created

### 1. **OptimizationPage Component** (`src/pages/Optimization.tsx`)
A full-featured route optimization tool with Mapbox GL JS integration.

### 2. **Navigation Integration**
- Added "Optimization" link to Navbar that routes to `/optimization`
- Updated `src/components/Navbar.tsx` with proper routing
- Updated `src/App.tsx` with the new route

### 3. **Environment Configuration**
- Created `.env.local` with Mapbox token and API base URL
- `VITE_MAPBOX_TOKEN` - Mapbox access token for map rendering
- `VITE_API_BASE_URL` - FastAPI backend URL

---

## 🎯 Features Implemented

### Form Inputs
- **Start Location**: Latitude and Longitude inputs
- **End Location**: Latitude and Longitude inputs  
- **Vehicle Type**: Dropdown selector (diesel, petrol, electric)
- **Auto-Distance Calculation**: Haversine formula calculates distance between points

### Map Visualization (Mapbox GL JS)
- Interactive dark-themed map
- **Green marker** at start location
- **Red marker** at end location
- **Colored polyline** showing the route:
  - 🟢 **Green** for electric vehicles
  - 🟠 **Orange** for petrol vehicles
  - 🔴 **Red** for diesel vehicles
- Navigation controls (zoom, pan, rotation)
- Auto-center and zoom to fit both markers

### Optimization Results
Displays API response with:
- Current emission (CO₂ kg)
- Suggested better vehicle options
- CO₂ saved with percentage reduction
- New emission amounts

### Error Handling
- Validates latitude (-90 to 90) and longitude (-180 to 180)
- Checks minimum distance (0.1 km)
- Shows user-friendly error messages with icon
- API error handling with fallback messages

---

## 🔧 How It Works

### 1. **Distance Calculation**
```typescript
// Haversine formula calculates great-circle distance
calculateHaversineDistance(lat1, lon1, lat2, lon2)
// Returns distance in kilometers
```

### 2. **API Integration**
When user clicks "Get Optimization Suggestions":
```
POST /optimize
{
  "distance_km": 25.5,
  "current_vehicle": "diesel"
}
```

API returns optimization suggestions comparing vehicle types.

### 3. **Map Updates**
- Clears existing markers and routes
- Adds new markers at coordinates
- Creates/updates polyline with route color based on vehicle type
- Automatically centers and zooms map

---

## 🎨 UI Design Features

- **Glass-morphism cards** with emerald theme
- **Responsive layout**: Form on left, map on right (stacks on mobile)
- **Smooth hover effects** on suggestion cards  
- **Loading states** during API calls
- **Color-coded vehicles**: Matches emission severity
- **Icons** from lucide-react for visual clarity (Zap, TrendingDown, MapPin, AlertCircle)

---

## 📱 Responsive Behavior

- **Desktop (lg+)**: Two-column layout (form + map side-by-side)
- **Tablet/Mobile**: Stacked layout (form above map)
- Map height: 600px on tablet, auto-fill on desktop

---

## 🚀 Testing Guide

### Test Case 1: Basic Optimization
1. Navigate to `/optimization` 
2. Enter:
   - Start: Lat `28.7041`, Lon `77.1025` (Delhi, India)
   - End: Lat `28.5355`, Lon `77.3910` (Noida, India)
   - Vehicle: `diesel`
3. Click "Get Optimization Suggestions"
4. Expected: Shows ~25 km route with optimization results

### Test Case 2: Different Vehicles
1. Try same route with `petrol` and `electric`
2. Observe different route colors on map
3. Compare CO₂ emissions and savings

### Test Case 3: Error Handling
1. Try invalid latitude (e.g., `91`)
2. Try points too close together
3. Verify error messages display correctly

---

## 📦 Dependencies Added

```bash
npm install mapbox-gl
```

This adds:
- `mapbox-gl` - Map visualization library
- `mapbox-gl.css` - Styling for the map

---

## 🔐 Environment Variables Required

Update `.env.local`:
```
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_MAPBOX_TOKEN=YOUR_MAPBOX_TOKEN_HERE
```

**Get Mapbox Token**:
1. Sign up at https://www.mapbox.com/
2. Get free token from Account > Tokens
3. Paste in `.env.local`

---

## 📂 Files Modified/Created

```
✅ Created:
- src/pages/Optimization.tsx (340 lines)
- .env.local (environment variables)

✅ Updated:
- src/App.tsx (added import & route)
- src/components/Navbar.tsx (added Optimization routing)
```

---

## 🎓 Code Quality

- ✅ TypeScript fully typed
- ✅ Functional components with React hooks
- ✅ Error boundaries and error handling
- ✅ Modular utility functions (distance calculation, color mapping)
- ✅ Accessible form inputs with labels
- ✅ No console errors or type issues
- ✅ Responsive design with Tailwind CSS
- ✅ Consistent with existing codebase style

---

## 🔗 API Endpoint Expected

**Backend must have** `/optimize` endpoint:
```python
@app.post("/optimize")
async def optimize_route(
    distance_km: float,
    current_vehicle: str
):
    # Returns optimization suggestions
    return {
        "current_vehicle": str,
        "current_emission": float,
        "suggestions": [
            {
                "better_vehicle": str,
                "new_emission": float,
                "co2_saved": float
            }
        ]
    }
```

---

## 🎯 Next Steps

1. **Update Mapbox Token**: Replace placeholder in `.env.local` with real token
2. **Test the form**: Try entering coordinates and submitting
3. **Verify backend**: Ensure `/optimize` endpoint is working
4. **Deploy**: Component is ready for production use

---

## 💡 Tips

- Use decimal coordinates (e.g., `28.7041` not `28°42'14.76"`)
- Larger distances (50+ km) show more significant savings
- Electric vehicles always produce lowest emissions
- Route color updates after optimization results arrive
