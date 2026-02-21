from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from database import Base
from datetime import datetime

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    industry = Column(String)
    carbon_credits = Column(Float, default=0.0)
    carbon_credits_redeemed = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), default=1)
    vehicle_type = Column(String)
    start_location = Column(String)
    end_location = Column(String)
    distance_km = Column(Float)
    co2_kg = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)


class CarbonCredit(Base):
    __tablename__ = "carbon_credits"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=True)
    credits = Column(Float)
    reason = Column(String)
    redeemed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class GPSTrack(Base):
    __tablename__ = "gps_tracking"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    distance_segment = Column(Float)
    co2_segment = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)