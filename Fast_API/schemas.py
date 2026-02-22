from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TripCreate(BaseModel):
    vehicle_type: str
    start_location: str
    end_location: str
    distance_km: float


class GPSUpdate(BaseModel):
    vehicle_id: str
    latitude: float
    longitude: float
    distance_segment: float


class OptimizationRequest(BaseModel):
    distance_km: float
    current_vehicle: str


class CompanyCreate(BaseModel):
    name: str
    industry: str


class CompanyProfile(BaseModel):
    id: int
    name: str
    industry: str
    carbon_credits: float
    carbon_credits_redeemed: float
    created_at: datetime

    class Config:
        from_attributes = True


class CarbonCreditRecord(BaseModel):
    id: int
    company_id: int
    trip_id: Optional[int]
    credits: float
    reason: str
    redeemed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CarbonCreditRedemption(BaseModel):
    credits_to_redeem: float


class CarbonCreditsResponse(BaseModel):
    available_credits: float
    redeemed_credits: float
    total_available: float
    recent_credits: list[CarbonCreditRecord]


class SupplierReportCreate(BaseModel):
    supplier_name: str
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    reported_distance: float
    reported_time: float
    vehicle_type: str
    weight: float


class SupplierReportResponse(BaseModel):
    id: int
    supplier_name: str
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    reported_distance: float
    reported_time: float
    verified_distance: float
    verified_time: float
    vehicle_type: str
    weight: float
    reported_co2: float
    verified_co2: float
    verification_status: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserSignup(BaseModel):
    email: str
    password: str
    company_name: str
    industry: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    company_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    user: UserResponse
    message: str


class GPSSimulationRequest(BaseModel):
    truck_id: str
    start_lat: float
    start_lon: float
    end_lat: float
    end_lon: float
    vehicle_type: str


class GPSSimulationResponse(BaseModel):
    message: str
    truck_id: str
    total_route_distance_km: float
    waypoints: int
    update_interval_seconds: int
    vehicle_type: str
    status: str


class TruckCreate(BaseModel):
    truck_id: str
    driver_name: str
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    vehicle_type: str = "diesel"


class TruckResponse(BaseModel):
    id: int
    truck_id: str
    driver_name: str
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    vehicle_type: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True