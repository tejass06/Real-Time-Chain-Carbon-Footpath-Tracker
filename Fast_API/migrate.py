from database import SessionLocal, engine
from sqlalchemy import text

def migrate():
    try:
        with engine.connect() as conn:
            # Add company_id column to trips if it doesn't exist
            conn.execute(text("""
                ALTER TABLE trips
                ADD COLUMN IF NOT EXISTS company_id INTEGER DEFAULT 1;
            """))
            
            # Create companies table if it doesn't exist
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS companies (
                    id INTEGER PRIMARY KEY,
                    name VARCHAR UNIQUE,
                    industry VARCHAR,
                    carbon_credits FLOAT DEFAULT 0.0,
                    carbon_credits_redeemed FLOAT DEFAULT 0.0,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            # Create carbon_credits table if it doesn't exist
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS carbon_credits (
                    id SERIAL PRIMARY KEY,
                    company_id INTEGER REFERENCES companies(id),
                    trip_id INTEGER REFERENCES trips(id),
                    credits FLOAT,
                    reason VARCHAR,
                    redeemed BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            # Create default company if it doesn't exist
            conn.execute(text("""
                INSERT INTO companies (id, name, industry, carbon_credits, carbon_credits_redeemed)
                VALUES (1, 'Default Company', 'Logistics', 0.0, 0.0)
                ON CONFLICT (name) DO NOTHING;
            """))
            
            conn.commit()
            print("Migration completed successfully!")
    except Exception as e:
        print(f"Migration error: {e}")

if __name__ == "__main__":
    migrate()
