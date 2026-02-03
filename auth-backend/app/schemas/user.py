from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    username: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    user_id: str
    email: Optional[EmailStr] = None

class UserUpdate(UserBase):
    pass

class UserInDBBase(UserBase):
    id: Optional[int] = None
    user_id: Optional[str] = None

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass
