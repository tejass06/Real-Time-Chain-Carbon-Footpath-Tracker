"""
Seed script to add live tracking trucks to the database
"""
from database import SessionLocal
from models import Truck

def seed_trucks():
    db = SessionLocal()
    
    trucks_data = [
        {
            "truck_id": "123",
            "driver_name": "Siddharth Lokhande",
            "start_lat": 72.8321,
            "start_lng": 18.9582,
            "end_lat": 73.8786,
            "end_lng": 18.5246,
            "vehicle_type": "diesel",
            "status": "active"
        },
        {
            "truck_id": "124",
            "driver_name": "Gurpreet Singh",
            "start_lat": 73.9448,
            "start_lng": 18.5346,
            "end_lat": 79.0882,
            "end_lng": 21.1458,
            "vehicle_type": "diesel",
            "status": "active"
        }
    ]
    
    for truck_data in trucks_data:
        # Check if truck already exists
        existing = db.query(Truck).filter(Truck.truck_id == truck_data["truck_id"]).first()
        if not existing:
            truck = Truck(**truck_data)
            db.add(truck)
            print(f"✅ Added truck: {truck_data['truck_id']} - {truck_data['driver_name']}")
        else:
            print(f"⏭️  Truck {truck_data['truck_id']} already exists")
    
    db.commit()
    db.close()
    print("\n✅ Trucks seeded successfully!")

if __name__ == "__main__":
    seed_trucks()
