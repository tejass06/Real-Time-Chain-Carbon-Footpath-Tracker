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