from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_keycloak_middleware import setup_keycloak_middleware
from .core.config import settings
from .db.session import engine
from .db.base_class import Base
from .api.endpoints import auth, users

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# Keycloak Middleware
setup_keycloak_middleware(app, settings.keycloak_config)

# CORS Middleware (Outermost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, set this to specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}
