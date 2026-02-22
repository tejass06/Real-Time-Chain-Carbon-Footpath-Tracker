from database import Base, engine, SessionLocal
from models import Truck

# Create tables
Base.metadata.create_all(bind=engine)
print("✅ All tables created")

# Check trucks
db = SessionLocal()
trucks = db.query(Truck).all()
print(f"✅ Found {len(trucks)} trucks in database")
for truck in trucks:
    print(f"  - Truck {truck.truck_id}: {truck.driver_name}")
db.close()
