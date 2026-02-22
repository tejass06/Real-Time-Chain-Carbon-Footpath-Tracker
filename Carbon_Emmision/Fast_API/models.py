from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
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


class SupplierReport(Base):
    __tablename__ = "supplier_reports"

    id = Column(Integer, primary_key=True, index=True)
    supplier_name = Column(String, index=True)
    start_lat = Column(Float)
    start_lng = Column(Float)
    end_lat = Column(Float)
    end_lng = Column(Float)
    reported_distance = Column(Float)
    reported_time = Column(Float)
    verified_distance = Column(Float)
    verified_time = Column(Float)
    vehicle_type = Column(String)
    weight = Column(Float)
    reported_co2 = Column(Float)
    verified_co2 = Column(Float)
    verification_status = Column(String)  # verified / flagged / warning
    created_at = Column(DateTime, default=datetime.utcnow)


class Truck(Base):
    __tablename__ = "trucks"

    id = Column(Integer, primary_key=True, index=True)
    truck_id = Column(String, unique=True, index=True)
    driver_name = Column(String, index=True)
    start_lat = Column(Float)
    start_lng = Column(Float)
    end_lat = Column(Float)
    end_lng = Column(Float)
    vehicle_type = Column(String, default="diesel")
    status = Column(String, default="active")  # active, inactive, completed
    created_at = Column(DateTime, default=datetime.utcnow)