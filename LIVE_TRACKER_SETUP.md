# Live Truck Tracker Setup Guide

## 🚀 Features Added

### 1. **Truck Model & Database**
   - New `Truck` table with truck details
   - Fields: truck_id, driver_name, start/end coordinates, vehicle_type, status

### 2. **Live Tracker Component**
   - Modal-based interface in navbar
   - Two tabs: Truck Number & GPS ID
   - Real-time truck location on map
   - CO2 emissions tracking

### 3. **Backend API Endpoints**
   - `POST /trucks` - Create new truck
   - `GET /trucks/{truck_id}` - Get truck details
   - `GET /trucks` - List all trucks
   - `POST /trucks/{truck_id}/start-tracking` - Start live tracking
   - `GET /gps/history/{truck_id}` - Get GPS points

---

## 📋 Setup Instructions

### Step 1: Initialize Database Tables

When you start the backend, it automatically creates tables. But to ensure Truck table is created, run:

```bash
cd Fast_API
python -c "from database import Base, engine; from models import *; Base.metadata.create_all(bind=engine)"
```

### Step 2: Seed Truck Data

Run the seed script to add the two trucks:

```bash
cd Fast_API
python seed_live_trucks.py
```

Expected output:
```
✅ Added truck: 123 - Siddharth Lokhande
✅ Added truck: 124 - Gurpreet Singh

✅ Trucks seeded successfully!
```

### Step 3: Start Services

**Terminal 1 - Backend:**
```bash
cd Fast_API
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd Carbon_Emmision
npm run dev
```

---

## 🎯 Using Live Tracker

### 1. Open Live Tracker
   - Click **"Live Track"** button in navbar
   - Modal opens with two tabs

### 2. Track by Truck Number

**Tab: "Truck Number"**
   - Enter truck ID: `123` or `124`
   - Click "Start Tracking"
   - Watch truck move on map in real-time
   - See CO2 emissions update every 5 seconds

**Truck 1 (ID: 123)**
   - Driver: Siddharth Lokhande
   - Start: Mumbai (72.8321, 18.9582)
   - End: Aurangabad (73.8786, 18.5246)

**Truck 2 (ID: 124)**
   - Driver: Gurpreet Singh
   - Start: Pune (73.9448, 18.5346)
   - End: Bhopal (79.0882, 21.1458)

### 3. Track by GPS ID

**Tab: "GPS ID"**
   - Shows "Currently under development"
   - Future feature for GPS device tracking

---

## 📊 What You'll See

### On Map:
- 🚚 Truck marker showing current location
- Blue dashed line showing traveled path
- Popup with:
  - Truck ID & Driver name
  - Current coordinates
  - Segment CO2 emissions
  - Total CO2 emitted

### Truck Details Panel Shows:
- Truck ID
- Driver name
- Vehicle type
- Total CO2 emitted (kg)
- Number of GPS points tracked

---

## 🔄 Data Flow

```
1. User clicks "Live Track" → LiveTracker modal opens
2. User enters truck ID (e.g., "123")
3. Frontend fetches truck details from `/trucks/{id}`
4. Calls `/trucks/{id}/start-tracking` to start simulation
5. Backend starts GPS simulation thread for that truck
6. Frontend polls `/gps/history/{truck_id}` every 5 seconds
7. GPS points update, truck marker moves on map
8. CO2 calculations display in real-time
```

---

## 📲 API Response Examples

### Get Truck Details
```bash
GET /trucks/123

Response:
{
  "id": 1,
  "truck_id": "123",
  "driver_name": "Siddharth Lokhande",
  "start_lat": 72.8321,
  "start_lng": 18.9582,
  "end_lat": 73.8786,
  "end_lng": 18.5246,
  "vehicle_type": "diesel",
  "status": "active",
  "created_at": "2026-02-22T10:30:00"
}
```

### Start Tracking
```bash
POST /trucks/123/start-tracking

Response:
{
  "message": "Truck tracking started",
  "truck_id": "123",
  "driver_name": "Siddharth Lokhande",
  "total_distance_km": 45.23,
  "status": "tracking"
}
```

### Get GPS History
```bash
GET /gps/history/123?limit=100

Response:
{
  "vehicle_id": "123",
  "total_points": 8,
  "points": [
    {
      "id": 1,
      "lat": 72.8321,
      "lng": 18.9582,
      "distance_segment": 2.34,
      "co2_segment": 0.6318,
      "timestamp": "2026-02-22T10:30:05"
    },
    ...
  ]
}
```

---

## 🐛 Troubleshooting

### Truck Not Found
- Verify seed script ran successfully
- Check database for truck records:
  ```sql
  SELECT * FROM trucks;
  ```

### No GPS Update
- Check backend logs for errors
- Verify database connection
- Ensure simulation thread started

### Map Not Loading
- Verify Mapbox token in `.env`
- Check browser console for errors
- Clear cache and reload

### GPS Points Not Moving
- Check if polling is working
- Verify `/gps/history` endpoint returns new points
- Look for network errors in DevTools

---

## 📝 Database Check

View trucks in database:
```sql
SELECT truck_id, driver_name, status FROM trucks;
```

View GPS tracking data:
```sql
SELECT vehicle_id, latitude, longitude, co2_segment, timestamp 
FROM gps_tracking 
WHERE vehicle_id = '123' 
ORDER BY timestamp DESC 
LIMIT 10;
```

---

## 🎓 Files Modified

**Backend:**
- `Fast_API/models.py` - Added Truck model
- `Fast_API/schemas.py` - Added TruckCreate, TruckResponse schemas
- `Fast_API/main.py` - Added truck endpoints
- `Fast_API/seed_live_trucks.py` - New seed script

**Frontend:**
- `src/components/LiveTracker.tsx` - New live tracker component
- `src/components/Navbar.tsx` - Added tracker button and integration

---

## ✅ Testing Checklist

- [ ] Database tables created
- [ ] Seed script ran successfully
- [ ] Backend running on port 8000
- [ ] Frontend running and accessible
- [ ] "Live Track" button visible in navbar
- [ ] Can enter truck ID (123 or 124)
- [ ] Truck details load correctly
- [ ] Truck marker appears on map
- [ ] GPS points update every 5 seconds
- [ ] CO2 emissions display correctly
- [ ] GPS ID tab shows "under development"
