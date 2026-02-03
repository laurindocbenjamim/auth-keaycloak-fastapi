from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Request
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
    Automatically cleans up legacy bad data.
    """
    # Cleanup: Remove any user with email="N/A" that was created by previous bugs
    bad_users = db.query(DBUser).filter(DBUser.email == "N/A").all()
    if bad_users:
        print(f"CLEANUP: Removing {len(bad_users)} users with 'N/A' email.")
        for bu in bad_users:
            db.delete(bu)
        db.commit()

    users = db.query(DBUser).all()
    return users

@router.post("/sync", response_model=UserSchema)
def sync_user(
    *,
    db: Session = Depends(deps.get_db),
    user_info: Any = Depends(deps.get_current_user),
    request: Request
) -> Any:
    """
    Sync currently logged-in user with local database.
    """
    # 1. Try manual claims first (most reliable source we have now)
    manual_claims = getattr(user_info, "manual_claims", {}) if not isinstance(user_info, dict) else user_info
    
    user_id = manual_claims.get("sub") or getattr(user_info, "user_id", None) or getattr(user_info, "identity", None)
    email = manual_claims.get("email") or getattr(user_info, "email", None)
    full_name = manual_claims.get("name") or getattr(user_info, "full_name", None) or getattr(user_info, "display_name", None)
    username = manual_claims.get("preferred_username") or getattr(user_info, "username", None)
    phone_number = manual_claims.get("phone_number") or getattr(user_info, "phone_number", None)
    addr = manual_claims.get("address") or getattr(user_info, "address", None)

    # 2. Re-check identity
    if not user_id:
        print(f"ERROR: Sync attempted but identity (sub) still missing. Claims: {manual_claims}")
        raise HTTPException(status_code=401, detail="User Identity missing from token.")

    print(f"DEBUG: Syncing user {email or 'N/A'} (ID: {user_id})")
    
    db_user = db.query(DBUser).filter(DBUser.user_id == user_id).first()
    
    # Process address (often comes as a dict or string)
    if isinstance(addr, dict):
        addr_str = addr.get("formatted", str(addr))
    else:
        addr_str = str(addr) if addr else None

    if db_user:
        # Update existing user
        db_user.full_name = full_name
        db_user.email = email
        db_user.username = username
        db_user.phone_number = phone_number
        db_user.address = addr_str
    else:
        # Create new user
        db_user = DBUser(
            user_id=user_id,
            email=email,
            full_name=full_name,
            username=username,
            phone_number=phone_number,
            address=addr_str
        )
        db.add(db_user)
    
    db.commit()
    db.refresh(db_user)
    return db_user
