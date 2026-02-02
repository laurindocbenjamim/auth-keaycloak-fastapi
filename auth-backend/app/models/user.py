from sqlalchemy import Column, String, Integer
from ..db.base_class import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True) # Keycloak SUB
    email = Column(String, index=True)
    full_name = Column(String)
    username = Column(String)
    phone_number = Column(String, nullable=True)
    address = Column(String, nullable=True)
