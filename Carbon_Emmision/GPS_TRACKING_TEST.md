# GPS Tracking Testing Guide

## What Was Added

### Backend (Fast_API/main.py)
1. **GPS Simulation Functions**
   - `generate_gps_points()` - Creates 20 waypoints between start/end
   - `gps_simulation_task_wrapper()` - Thread wrapper with persistent DB session
   - `gps_simulation_task()` - Runs in background, updates DB every 5 seconds

2. **New API Endpoints**
   - `POST /gps/simulate` - Start GPS demo simulation
   - `GET /gps/history/{vehicle_id}` - Get all GPS tracking points
   - `GET /gps/simulation-status/{truck_id}` - Check simulation status
   - `POST /gps/simulation-stop/{truck_id}` - Stop simulation

### Frontend (Carbon_Emmision/src/pages/Optimization.tsx)
1. **Live GPS Tracking Features**
   - Truck marker (🚚) moves on map
   - Blue dashed line shows traveled path
   - Real-time location display
   - CO₂ emissions counter
   - Updates every 5 seconds

## Testing Steps

### 1. Start Backend
```bash
cd Fast_API
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start Frontend
```bash
cd Carbon_Emmision
npm run dev
```

### 3. Use the Optimization Page
1. Navigate to Route Optimization page
2. Enter coordinates:
   - **Start**: 28.7041, 77.1025 (Delhi, India)
   - **End**: 28.5355, 77.3910 (Noida, India)
3. Select vehicle type: `diesel`
4. Click "Get Optimization Suggestions"

### 4. Watch for:
- ✅ GPS simulation card appears with "Live GPS Tracking"
- ✅ Truck location updates (lat/lng change)
- ✅ CO₂ counter increases
- ✅ Blue truck marker moves on map
- ✅ Blue dashed line traces the path
- ✅ Tracking points count increases

## Debugging

### Check Browser Console
```javascript
// Look for logs like:
"Starting GPS simulation for truck: truck_1708607600000"
"GPS points fetched: 3"
"GPS points fetched: 6"
```

### Check Backend Console
```
GPS point saved for truck_1708607600000: 28.7041, 77.1025
GPS point saved for truck_1708607600000: 28.6850, 77.2104
GPS simulation completed for truck_1708607600000
```

### Test API Directly
```bash
# Start simulation
curl -X POST http://localhost:8000/gps/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "truck_id": "test_truck_1",
    "start_lat": 28.7041,
    "start_lon": 77.1025,
    "end_lat": 28.5355,
    "end_lon": 77.3910,
    "vehicle_type": "diesel"
  }'

# Get GPS history
curl http://localhost:8000/gps/history/test_truck_1

# Get simulation status
curl http://localhost:8000/gps/simulation-status/test_truck_1
```

## Expected Behavior Timeline

| Time | Event |
|------|-------|
| 0s | Simulation starts, GPS card appears |
| 5s | First point fetched, truck appears on map |
| 10s | Second point, moved slightly, CO₂ increased |
| 15s | Third point, continued movement |
| 100s | Simulation completes, 20+ points recorded |

## Troubleshooting

### GPS Card Not Appearing
- Check browser console for errors
- Verify optimization suggestions loaded first
- Check if `isSimulating` state is true

### Truck Not Moving
- Check if GPS points are being fetched (check logs)
- Verify map is fully loaded
- Clear browser cache

### No Data in Console
- Check backend is running on port 8000
- Verify CORS is configured correctly
- Check database connection

## Database Check

Connect to database and verify GPS data:
```sql
SELECT * FROM gps_tracking 
WHERE vehicle_id LIKE 'truck_1%' 
ORDER BY timestamp DESC 
LIMIT 20;
```
