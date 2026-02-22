# 🚀 QUICK FIX - Run This Command

You already have a valid Mapbox token configured! The issue is just that `python-dotenv` isn't installed yet.

## Run this command in your Fast_API folder:

```bash
pip install python-dotenv
```

Then **restart your FastAPI server**:

1. Stop current server (Ctrl+C)
2. Start again:
```bash
python -m uvicorn main:app --reload
```

That's it! The map should now work.

## What was happening?

- ✅ Your Mapbox token exists in `.env` file
- ❌ But `python-dotenv` wasn't installed to load it
- ❌ So the code used a hardcoded placeholder token (which is invalid)

## After the fix:

The terminal should show this when you submit a report:
```
INFO: 127.0.0.1:50552 - "POST /supplier/report HTTP/1.1" 200 OK
```

And **NO** "Mapbox API error: 401" message!

Then you can click "View Map" on any report and see the route visualization. 🗺️
