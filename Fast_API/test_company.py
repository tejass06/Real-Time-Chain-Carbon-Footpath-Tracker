from database import SessionLocal
from models import Company

session = SessionLocal()
try:
    company = session.query(Company).filter(Company.id == 1).first()
    if company:
        print(f"Company found: {company.name}, Credits: {company.carbon_credits}")
    else:
        print("No company found with ID 1")
        # Create one
        company = Company(id=1, name="Default Company", industry="Logistics", carbon_credits=0.0, carbon_credits_redeemed=0.0)
        session.add(company)
        session.commit()
        print("Company created successfully")
except Exception as e:
    print(f"Error: {e}")
finally:
    session.close()
