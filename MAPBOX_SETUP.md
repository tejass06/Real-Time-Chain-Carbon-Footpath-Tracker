# 🗺️ Mapbox Setup Guide for Supplier Verification

## Current Issue
You're seeing this error because the Mapbox API token is not configured:
```
401 Client Error: Unauthorized for url: https://api.mapbox.com/directions/v5/...
```

## Quick Fix (5 minutes)

### Step 1: Get Your Free Mapbox Token

1. **Sign up for Mapbox** (completely free):
   - Go to: https://www.mapbox.com/
   - Click "Sign up" in the top right
   - Create a free account (no credit card required)

2. **Get Your Access Token**:
   - After signing in, go to: https://account.mapbox.com/access-tokens/
   - You'll see a **"Default public token"** - copy this entire token
   - It should look like: `pk.eyJ1Ijoi...` (starts with `pk.`)

### Step 2: Configure Your Backend

1. **Open this file**:
   ```
   Fast_API/.env
   ```

2. **Replace the placeholder**:
   ```bash
   # Before:
   MAPBOX_TOKEN=your_mapbox_token_here
   
   # After (paste your actual token):
   MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsc...
   ```

3. **Save the file**

### Step 3: Install python-dotenv (if needed)

Open terminal in `Fast_API` folder and run:
```bash
pip install python-dotenv
```

### Step 4: Restart Your Backend Server

1. **Stop the current server** (Ctrl+C in terminal)
2. **Start it again**:
   ```bash
   python -m uvicorn main:app --reload
   ```

### Step 5: Test It!

1. Go to **Supplier Reports** page
2. Click **"Load Sample: Mumbai → Pune"**
3. Click **Submit**
4. Click on the report row to **View Map**
5. You should now see the actual route on the map! 🎉

---

## What This Enables

✅ **Real road distance** instead of straight-line calculation  
✅ **Actual driving time** from Mapbox  
✅ **Visual route** on interactive map  
✅ **Start/end markers** with popups  
✅ **Accurate verification** of supplier reports  

---

## Fallback Behavior

**Don't have time to set up Mapbox right now?**

The system automatically falls back to:
- Haversine formula for distance (straight-line)
- Estimated time based on 60 km/h average
- ⚠️ Map visualization won't work

But verification still functions - just less accurate!

---

## Troubleshooting

### Still getting 401 error?
- Make sure token starts with `pk.` (public token)
- No spaces before/after token in .env file
- Restart FastAPI server after changing .env

### Map not showing?
- Check browser console (F12) for errors
- Verify frontend .env.local also has token:
  ```
  VITE_MAPBOX_TOKEN=pk.your_token_here
  ```

### Token format:
```bash
# ✅ Correct
MAPBOX_TOKEN=pk.eyJ1IjoiY2FyYm9udHJhY2siLCJhIjoiY2xiM3R5...

# ❌ Wrong (has quotes)
MAPBOX_TOKEN="pk.eyJ1IjoiY2FyYm9udHJhY2siLCJhIjoiY2xiM3R5..."

# ❌ Wrong (has spaces)
MAPBOX_TOKEN= pk.eyJ1IjoiY2FyYm9udHJhY2siLCJhIjoiY2xiM3R5...
```

---

## Free Tier Limits

Mapbox free tier includes:
- **50,000 requests/month** for Directions API
- **100,000 map loads/month**
- More than enough for development and testing!

---

## Need Help?

If you're still having issues:
1. Check that `.env` file exists in `Fast_API/` folder
2. Verify token copied correctly (no extra characters)
3. Restart backend server completely
4. Check terminal for the warning message:
   ```
   ⚠️  MAPBOX_TOKEN not configured. Using Haversine fallback.
   ```

If you see this warning, the token isn't being loaded properly.
