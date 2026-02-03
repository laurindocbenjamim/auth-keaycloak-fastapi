"""
Database migration script to add role and status columns to existing users table.
Run this inside the Docker container.
"""
import sqlite3
import os

db_path = "/app/data/users.db"

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check if columns already exist
cursor.execute("PRAGMA table_info(users)")
columns = [col[1] for col in cursor.fetchall()]

# Add role column if it doesn't exist
if 'role' not in columns:
    print("Adding 'role' column...")
    cursor.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'")
    print("✓ 'role' column added")
else:
    print("'role' column already exists")

# Add status column if it doesn't exist
if 'status' not in columns:
    print("Adding 'status' column...")
    cursor.execute("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'unverified'")
    print("✓ 'status' column added")
else:
    print("'status' column already exists")

conn.commit()
conn.close()

print("\n✅ Database migration completed successfully!")
