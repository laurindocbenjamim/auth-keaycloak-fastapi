import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi_keycloak_middleware import KeycloakConfiguration, KeycloakMiddleware, setup_keycloak_middleware

app = FastAPI(title="FastAPI Keycloak Integration")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Keycloak Configuration from environment variables
# Note: In a real scenario, these would point to your Keycloak instance.
KEYCLOAK_URL = os.getenv("KEYCLOAK_URL", "http://localhost:8080")
REALM = os.getenv("KEYCLOAK_REALM", "elinara-realm")
CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID", "elinara-client")
CLIENT_SECRET = os.getenv("KEYCLOAK_CLIENT_SECRET", "your-client-secret")


keycloak_config = KeycloakConfiguration(
    url=KEYCLOAK_URL, # Uses the full URL from environment
    realm=REALM,
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,


    claims_mapper={
        "sub": "user_id",
        "name": "full_name",
        "email": "email",
        "preferred_username": "username",
        "realm_access": "roles",
        "phone_number": "phone_number"
    }
)

# Initialize Middleware
setup_keycloak_middleware(app, keycloak_config)

@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI Keycloak Integrated Backend"}

@app.get("/items")
async def read_items():
    """
    Accessible to any authenticated user.
    The middleware handles the validation.
    """
    return {"message": "This is a protected route accessible to any authenticated user.", "items": ["Item 1", "Item 2"]}

@app.get("/admin")
async def read_admin(user=Depends()): # Middleware injects the user object
    """
    Restricted to users with the 'admin' role.
    """
    # Assuming roles are in user.roles or similar based on claims_mapper
    # For fastapi-keycloak-middleware, the user object contains user information
    if "admin" not in getattr(user, "roles", []):
         return {"error": "Forbidden", "message": "You do not have the admin role."}
    
    return {"message": "Welcome Admin! This route is restricted to the admin role.", "user": user}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
