from typing import Generator, Dict, Any, Optional
from fastapi import Request, HTTPException
from jose import jwt
from ..db.session import SessionLocal

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(request: Request) -> Any:
    """
    Retrieves the user data. Uses middleware as primary source
    but supplements with manual JWT decoding to ensure identity (sub/email) is captured.
    """
    # 1. Get user object from middleware
    user = getattr(request.state, "user", None) or request.scope.get("user")
    
    # 2. Extract raw claims from Authorization header (Fallback)
    claims = {}
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        try:
            token = auth_header.split(" ")[1]
            # Validation is handled by middleware, we just need to read the claims
            claims = jwt.get_unverified_claims(token)
        except Exception as e:
            print(f"DEBUG: Manual claim extraction failed: {e}")

    # Attach claims to the user object if they exist, or return a combined structure
    # To avoid breaking other endpoints, we'll try to add it as an attribute
    if user:
        setattr(user, "manual_claims", claims)
        return user
    
    # If middleware didn't find a user, but we have claims (unlikely with middleware active),
    # return the claims as a dict (sync_user will handle this)
    return claims if claims else None
