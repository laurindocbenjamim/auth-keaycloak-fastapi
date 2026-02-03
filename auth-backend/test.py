import os
print("Testing environment variables:")
print(f"DATABASE_URL: {os.getenv('DATABASE_URL')}")
print(f"KEYCLOAK_URL: {os.getenv('KEYCLOAK_URL')}")

# Test SQLAlchemy URL parsing
from sqlalchemy.engine.url import make_url
try:
    url = make_url(os.getenv('DATABASE_URL', 'sqlite:////tmp/app.db'))
    print(f"URL parsed successfully: {url}")
except Exception as e:
    print(f"Error parsing URL: {e}")