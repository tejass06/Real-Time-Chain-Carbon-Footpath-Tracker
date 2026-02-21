from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta, datetime

from database import Base, engine, get_db
from models import Trip, GPSTrack, Company, CarbonCredit
from schemas import (
    TripCreate,
    GPSUpdate,
    OptimizationRequest,
    CompanyCreate,
    CompanyProfile,
    CarbonCreditRedemption,
    CarbonCreditsResponse,
    CarbonCreditRecord,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

EMISSION_FACTORS = {
    "diesel": 0.27,
    "petrol": 0.24,
    "electric": 0.02
}

# Test endpoint
@app.get("/health")
def health_check():
    return {"status": "ok"}

# -------------------------
# Create Trip + CO2
# -------------------------
@app.post("/trips")
def create_trip(trip: TripCreate, db: Session = Depends(get_db)):
    factor = EMISSION_FACTORS[trip.vehicle_type.lower()]
    co2 = trip.distance_km * factor

    new_trip = Trip(
        vehicle_type=trip.vehicle_type,
        start_location=trip.start_location,
        end_location=trip.end_location,
        distance_km=trip.distance_km,
        co2_kg=co2,
        company_id=1
    )

    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)

    # Auto-award carbon credits for eco-friendly vehicles
    credit_multipliers = {
        "electric": 10,
        "petrol": 3,
        "diesel": 1
    }
    
    vehicle_lower = trip.vehicle_type.lower()
    multiplier = credit_multipliers.get(vehicle_lower, 1)
    credits_earned = trip.distance_km * multiplier
    
    # Record credit transaction
    credit_record = CarbonCredit(
        company_id=1,
        trip_id=new_trip.id,
        credits=credits_earned,
        reason=f"Trip: {trip.start_location} to {trip.end_location} ({vehicle_lower})",
        redeemed=False
    )
    
    db.add(credit_record)
    
    # Update company credits
    company = db.query(Company).filter(Company.id == 1).first()
    if not company:
        company = Company(name="Default Company", industry="Logistics")
        db.add(company)
        db.flush()
    
    company.carbon_credits += credits_earned
    db.commit()

    return {
        "message": "Trip recorded successfully",
        "co2_emission": round(co2, 2),
        "credits_earned": round(credits_earned, 2)
    }


# -------------------------
# Daily Footprint
# -------------------------
@app.get("/footprint/daily")
def daily_footprint(db: Session = Depends(get_db)):
    today = date.today()

    total = db.query(func.sum(Trip.co2_kg))\
              .filter(func.date(Trip.created_at) == today)\
              .scalar()

    return {
        "date": str(today),
        "total_co2": round(total or 0, 2)
    }

# -------------------------
# Daily Trend (Last 7 Days)
# -------------------------
@app.get("/footprint/daily/trend")
def daily_trend(db: Session = Depends(get_db)):
    today = date.today()
    start_date = today - timedelta(days=6)

    results = db.query(
        func.date(Trip.created_at).label("day"),
        func.sum(Trip.co2_kg).label("total_co2")
    ).filter(
        func.date(Trip.created_at) >= start_date
    ).group_by(
        func.date(Trip.created_at)
    ).all()

    totals_by_day = {
        str(row.day): round(row.total_co2 or 0, 2)
        for row in results
    }

    trend = []
    for offset in range(7):
        current_day = start_date + timedelta(days=offset)
        day_str = str(current_day)
        trend.append({
            "date": day_str,
            "total_co2": totals_by_day.get(day_str, 0)
        })

    return trend

# -------------------------
# Monthly Footprint
# -------------------------
@app.get("/footprint/monthly")
def monthly_footprint(db: Session = Depends(get_db)):
    today = date.today()

    total = db.query(func.sum(Trip.co2_kg))\
              .filter(func.extract("month", Trip.created_at) == today.month)\
              .filter(func.extract("year", Trip.created_at) == today.year)\
              .scalar()

    return {
        "month": today.month,
        "year": today.year,
        "total_co2": round(total or 0, 2)
    }

# -------------------------
# Stats Summary
# -------------------------
@app.get("/stats/summary")
def stats_summary(db: Session = Depends(get_db)):
    today = date.today()
    now = datetime.utcnow()
    day_start = datetime.combine(today, datetime.min.time())
    month_start = datetime(today.year, today.month, 1)

    total_trips = db.query(func.count(Trip.id)).scalar() or 0

    total_routes = db.query(
        func.count(func.distinct(func.concat(Trip.start_location, " - ", Trip.end_location)))
    ).scalar() or 0

    active_vehicles = db.query(
        func.count(func.distinct(GPSTrack.vehicle_id))
    ).filter(
        GPSTrack.timestamp >= now - timedelta(hours=24)
    ).scalar() or 0

    total_co2_today = db.query(func.sum(Trip.co2_kg))\
        .filter(Trip.created_at >= day_start)\
        .scalar() or 0

    total_co2_month = db.query(func.sum(Trip.co2_kg))\
        .filter(Trip.created_at >= month_start)\
        .scalar() or 0

    total_co2_all = db.query(func.sum(Trip.co2_kg)).scalar() or 0

    return {
        "total_trips": int(total_trips),
        "total_routes": int(total_routes),
        "active_vehicles": int(active_vehicles),
        "total_co2_today": round(total_co2_today, 2),
        "total_co2_month": round(total_co2_month, 2),
        "total_co2_all": round(total_co2_all, 2),
    }

# -------------------------
# Insights Summary
# -------------------------
@app.get("/insights/summary")
def insights_summary(db: Session = Depends(get_db)):
    top_route = db.query(
        Trip.start_location,
        Trip.end_location,
        func.sum(Trip.co2_kg).label("total_co2")
    ).group_by(
        Trip.start_location,
        Trip.end_location
    ).order_by(func.sum(Trip.co2_kg).desc()).first()

    top_vehicle = db.query(
        Trip.vehicle_type,
        func.sum(Trip.co2_kg).label("total_co2")
    ).group_by(
        Trip.vehicle_type
    ).order_by(func.sum(Trip.co2_kg).desc()).first()

    last_trip = db.query(Trip).order_by(Trip.created_at.desc()).first()

    return {
        "top_route": None if not top_route else {
            "route": f"{top_route.start_location} - {top_route.end_location}",
            "total_co2": round(top_route.total_co2, 2)
        },
        "top_vehicle": None if not top_vehicle else {
            "vehicle": top_vehicle.vehicle_type,
            "total_co2": round(top_vehicle.total_co2, 2)
        },
        "latest_trip": None if not last_trip else {
            "vehicle": last_trip.vehicle_type,
            "route": f"{last_trip.start_location} - {last_trip.end_location}",
            "distance_km": last_trip.distance_km,
            "co2_kg": round(last_trip.co2_kg, 2),
            "created_at": last_trip.created_at.isoformat()
        }
    }

# -------------------------
# Recent Trips
# -------------------------
@app.get("/trips/recent")
def recent_trips(limit: int = 8, db: Session = Depends(get_db)):
    trips = db.query(Trip).order_by(Trip.created_at.desc()).limit(limit).all()

    return [
        {
            "id": trip.id,
            "vehicle_type": trip.vehicle_type,
            "start_location": trip.start_location,
            "end_location": trip.end_location,
            "distance_km": trip.distance_km,
            "co2_kg": round(trip.co2_kg, 2),
            "created_at": trip.created_at.isoformat()
        }
        for trip in trips
    ]

# -------------------------
# Route Chart API
# -------------------------
@app.get("/charts/routes")
def route_wise_emission(db: Session = Depends(get_db)):
    results = db.query(
        Trip.start_location,
        Trip.end_location,
        func.sum(Trip.co2_kg).label("total_co2")
    ).group_by(
        Trip.start_location,
        Trip.end_location
    ).all()

    return [
        {
            "route": f"{r.start_location} - {r.end_location}",
            "total_co2": round(r.total_co2, 2)
        }
        for r in results
    ]

# -------------------------
# Vehicle Chart API
# -------------------------
@app.get("/charts/vehicles")
def vehicle_wise_emission(db: Session = Depends(get_db)):
    results = db.query(
        Trip.vehicle_type,
        func.sum(Trip.co2_kg).label("total_co2")
    ).group_by(
        Trip.vehicle_type
    ).all()

    return [
        {
            "vehicle": r.vehicle_type,
            "total_co2": round(r.total_co2, 2)
        }
        for r in results
    ]

# -------------------------
# GPS Update
# -------------------------
@app.post("/gps/update")
def update_gps(data: GPSUpdate, db: Session = Depends(get_db)):
    factor = EMISSION_FACTORS["diesel"]

    co2 = data.distance_segment * factor

    gps = GPSTrack(
        vehicle_id=data.vehicle_id,
        latitude=data.latitude,
        longitude=data.longitude,
        distance_segment=data.distance_segment,
        co2_segment=co2
    )

    db.add(gps)
    db.commit()

    return {
        "message": "GPS updated",
        "co2_added": round(co2, 3)
    }

# -------------------------
# LIVE Truck Status
# -------------------------
@app.get("/gps/live/{vehicle_id}")
def live_truck(vehicle_id: str, db: Session = Depends(get_db)):

    last_point = db.query(GPSTrack)\
        .filter(GPSTrack.vehicle_id == vehicle_id)\
        .order_by(GPSTrack.timestamp.desc())\
        .first()

    total_co2 = db.query(func.sum(GPSTrack.co2_segment))\
        .filter(GPSTrack.vehicle_id == vehicle_id)\
        .scalar()

    if not last_point:
        return {"message": "No tracking data yet"}

    return {
        "vehicle_id": vehicle_id,
        "current_location": {
            "lat": last_point.latitude,
            "lng": last_point.longitude
        },
        "co2_emitted_so_far": round(total_co2 or 0, 3)
    }

# -------------------------
# 🌱 OPTIMIZATION SUGGESTION ENGINE (NEW)
# -------------------------
@app.post("/optimize")
def optimize_route(data: OptimizationRequest):

    distance = data.distance_km
    current = data.current_vehicle.lower()

    current_emission = distance * EMISSION_FACTORS[current]

    suggestions = []

    for vehicle, factor in EMISSION_FACTORS.items():
        new_emission = distance * factor

        if new_emission < current_emission:
            saved = current_emission - new_emission
            suggestions.append({
                "better_vehicle": vehicle,
                "new_emission": round(new_emission, 2),
                "co2_saved": round(saved, 2)
            })

    return {
        "current_vehicle": current,
        "current_emission": round(current_emission, 2),
        "suggestions": suggestions
    }

# -------------------------
# 🏢 COMPANY & CARBON CREDITS
# -------------------------
@app.get("/company/profile/{company_id}")
def get_company_profile(company_id: int, db: Session = Depends(get_db)):
    try:
        company = db.query(Company).filter(Company.id == company_id).first()
        
        if not company:
            # Create default company with explicit ID
            company = Company(id=company_id, name="Default Company", industry="Logistics", carbon_credits=0.0, carbon_credits_redeemed=0.0)
            db.add(company)
            db.commit()
            db.refresh(company)
        
        return {
            "id": company.id,
            "name": company.name,
            "industry": company.industry,
            "carbon_credits": round(company.carbon_credits or 0, 2),
            "carbon_credits_redeemed": round(company.carbon_credits_redeemed or 0, 2),
            "created_at": company.created_at.isoformat() if company.created_at else datetime.utcnow().isoformat()
        }
    except Exception as e:
        print(f"Error in get_company_profile: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

@app.get("/carbon-credits/{company_id}")
def get_carbon_credits(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    
    if not company:
        return {"available_credits": 0, "redeemed_credits": 0, "total_available": 0, "recent_credits": []}
    
    unredeemed = db.query(CarbonCredit).filter(
        CarbonCredit.company_id == company_id,
        CarbonCredit.redeemed == False
    ).order_by(CarbonCredit.created_at.desc()).limit(10).all()
    
    recent_credits = [
        {
            "id": c.id,
            "company_id": c.company_id,
            "trip_id": c.trip_id,
            "credits": round(c.credits, 2),
            "reason": c.reason,
            "redeemed": c.redeemed,
            "created_at": c.created_at.isoformat()
        }
        for c in unredeemed
    ]
    
    available = db.query(func.sum(CarbonCredit.credits)).filter(
        CarbonCredit.company_id == company_id,
        CarbonCredit.redeemed == False
    ).scalar() or 0
    
    return {
        "available_credits": round(available, 2),
        "redeemed_credits": round(company.carbon_credits_redeemed, 2),
        "total_available": round(company.carbon_credits, 2),
        "recent_credits": recent_credits
    }

@app.post("/carbon-credits/{company_id}/redeem")
def redeem_carbon_credits(company_id: int, data: CarbonCreditRedemption, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    
    if not company:
        return {"error": "Company not found"}
    
    available = db.query(func.sum(CarbonCredit.credits)).filter(
        CarbonCredit.company_id == company_id,
        CarbonCredit.redeemed == False
    ).scalar() or 0
    
    if data.credits_to_redeem > available:
        return {"error": f"Insufficient credits. Available: {available}"}
    
    credits_remaining = data.credits_to_redeem
    credits_to_redeem = db.query(CarbonCredit).filter(
        CarbonCredit.company_id == company_id,
        CarbonCredit.redeemed == False
    ).order_by(CarbonCredit.created_at.asc()).all()
    
    for credit in credits_to_redeem:
        if credits_remaining <= 0:
            break
        
        if credit.credits <= credits_remaining:
            credit.redeemed = True
            credits_remaining -= credit.credits
        else:
            remaining_credit = CarbonCredit(
                company_id=company_id,
                trip_id=credit.trip_id,
                credits=credit.credits - credits_remaining,
                reason=credit.reason,
                redeemed=False
            )
            db.add(remaining_credit)
            credit.redeemed = True
            credits_remaining = 0
    
    company.carbon_credits_redeemed += data.credits_to_redeem
    db.commit()
    
    return {
        "message": f"Redeemed {data.credits_to_redeem} carbon credits successfully",
        "remaining_credits": round(available - data.credits_to_redeem, 2)
    }

@app.post("/carbon-credits/{company_id}/award")
def award_carbon_credits(company_id: int, credits: float, reason: str = "Manual award", db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    
    if not company:
        company = Company(name="Default Company", industry="Logistics")
        db.add(company)
        db.flush()
    
    credit_record = CarbonCredit(
        company_id=company.id,
        trip_id=None,
        credits=credits,
        reason=reason,
        redeemed=False
    )
    
    db.add(credit_record)
    company.carbon_credits += credits
    db.commit()
    
    return {
        "message": "Credits awarded successfully",
        "credits_awarded": round(credits, 2),
        "total_credits": round(company.carbon_credits, 2)
    }
