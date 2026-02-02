from typing import Generator
from fastapi import Request
from ..db.session import SessionLocal

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(request: Request):
    """
    Retrieves the user object injected by the Keycloak middleware.
    """
    return getattr(request.state, "user", None)
