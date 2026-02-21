from datetime import datetime, timedelta

from database import SessionLocal
from models import Trip

EMISSION_FACTORS = {
    "diesel": 0.27,
    "petrol": 0.24,
    "electric": 0.02,
}

SAMPLE_TRIPS = [
    {"vehicle_type": "diesel", "start_location": "Pune", "end_location": "Mumbai", "distance_km": 150},
    {"vehicle_type": "petrol", "start_location": "Delhi", "end_location": "Jaipur", "distance_km": 280},
    {"vehicle_type": "electric", "start_location": "Chennai", "end_location": "Bengaluru", "distance_km": 350},
    {"vehicle_type": "diesel", "start_location": "Hyderabad", "end_location": "Nagpur", "distance_km": 510},
    {"vehicle_type": "petrol", "start_location": "Kolkata", "end_location": "Patna", "distance_km": 575},
    {"vehicle_type": "diesel", "start_location": "Ahmedabad", "end_location": "Surat", "distance_km": 265},
    {"vehicle_type": "electric", "start_location": "Mumbai", "end_location": "Goa", "distance_km": 590},
    {"vehicle_type": "diesel", "start_location": "Jaipur", "end_location": "Udaipur", "distance_km": 400},
    {"vehicle_type": "petrol", "start_location": "Bhopal", "end_location": "Indore", "distance_km": 195},
    {"vehicle_type": "electric", "start_location": "Pune", "end_location": "Nashik", "distance_km": 210},
]


def seed_trips() -> None:
    session = SessionLocal()
    try:
        existing = session.query(Trip).count()
        if existing > 0:
            return

        today = datetime.utcnow().date()

        for index, trip in enumerate(SAMPLE_TRIPS):
            factor = EMISSION_FACTORS[trip["vehicle_type"]]
            co2_kg = trip["distance_km"] * factor
            created_at = datetime.combine(today - timedelta(days=index % 7), datetime.min.time())

            session.add(
                Trip(
                    vehicle_type=trip["vehicle_type"],
                    start_location=trip["start_location"],
                    end_location=trip["end_location"],
                    distance_km=trip["distance_km"],
                    co2_kg=co2_kg,
                    created_at=created_at,
                )
            )

        session.commit()
    finally:
        session.close()


if __name__ == "__main__":
    seed_trips()
