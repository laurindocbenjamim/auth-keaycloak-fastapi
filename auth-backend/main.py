import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi_keycloak_middleware import KeycloakConfiguration, KeycloakMiddleware, setup_keycloak_middleware

app = FastAPI(title="FastAPI Keycloak Integration")

# Keycloak Configuration from environment variables
KEYCLOAK_URL = os.getenv("KEYCLOAK_URL", "http://localhost:8080")
REALM = os.getenv("KEYCLOAK_REALM", "elinara-realm")
CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID", "elinara-client")
CLIENT_SECRET = os.getenv("KEYCLOAK_CLIENT_SECRET", "your-client-secret")

keycloak_config = KeycloakConfiguration(
    url=KEYCLOAK_URL,
    realm=REALM,
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    claims_mapper={
        "sub": "user_id",
        "name": "full_name",
        "email": "email",
        "preferred_username": "username",
        "realm_access": "roles",
        "phone_number": "phone_number",
        "address": "address"
    }
)

# Initialize Keycloak Middleware first so CORS can wrap it
setup_keycloak_middleware(app, keycloak_config)

# Configure CORS last so it's the outermost middleware (added last = executed first)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
