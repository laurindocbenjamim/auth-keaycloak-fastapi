from typing import Any
from fastapi import APIRouter, Depends
from .. import deps

router = APIRouter()

@router.get("/protected")
def read_protected(user: Any = Depends(deps.get_current_user)) -> Any:
    """
    Test authenticated gateway connection.
    """
    return {"message": "Authenticated successfully! Gateway connection active.", "status": "online"}

@router.get("/admin")
def read_admin(user: Any = Depends(deps.get_current_user)) -> Any:
    """
    Restricted to users with the 'admin' role.
    """
    if not user or "admin" not in getattr(user, "roles", []):
         return {"error": "Forbidden", "message": "You do not have the admin role."}
    return {"message": "Welcome Admin!", "user": user}
