from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import deps
from ...models.user import User as DBUser
from ...schemas.user import User as UserSchema

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
def read_users(
    db: Session = Depends(deps.get_db),
    user_info: Any = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve all users (Synchronized from Keycloak).
    """
    users = db.query(DBUser).all()
    return users

@router.post("/sync", response_model=UserSchema)
def sync_user(
    *,
    db: Session = Depends(deps.get_db),
    user_info: Any = Depends(deps.get_current_user),
) -> Any:
    """
    Sync currently logged-in user with local database.
    """
    db_user = db.query(DBUser).filter(DBUser.user_id == user_info.user_id).first()
    
    # Process address (often comes as a dict or string)
    addr = user_info.address
    if isinstance(addr, dict):
        addr_str = addr.get("formatted", str(addr))
    else:
        addr_str = str(addr) if addr else None

    if db_user:
        # Update existing user
        db_user.full_name = user_info.full_name
        db_user.email = user_info.email
        db_user.username = user_info.username
        db_user.phone_number = user_info.phone_number
        db_user.address = addr_str
    else:
        # Create new user
        db_user = DBUser(
            user_id=user_info.user_id,
            email=user_info.email,
            full_name=user_info.full_name,
            username=user_info.username,
            phone_number=user_info.phone_number,
            address=addr_str
        )
        db.add(db_user)
    
    db.commit()
    db.refresh(db_user)
    return db_user
