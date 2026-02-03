import os
from pydantic_settings import BaseSettings
from fastapi_keycloak_middleware import KeycloakConfiguration

class Settings(BaseSettings):
    PROJECT_NAME: str = "Elinara Auth Backend"
    
    # Keycloak Configuration
    KEYCLOAK_URL: str = os.getenv("KEYCLOAK_URL", "http://localhost:8080")
    KEYCLOAK_REALM: str = os.getenv("KEYCLOAK_REALM", "elinara-realm")
    KEYCLOAK_CLIENT_ID: str = os.getenv("KEYCLOAK_CLIENT_ID", "elinara-client")
    KEYCLOAK_CLIENT_SECRET: str = os.getenv("KEYCLOAK_CLIENT_SECRET", "your-client-secret")

    # Metadata for Keycloak claims mapping
    CLAIMS_MAPPER: dict = {
        "sub": "user_id",
        "name": "full_name",
        "email": "email",
        "preferred_username": "username",
        "realm_access": "roles",
        "phone_number": "phone_number",
        "address": "address"
    }

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./data/users.db")

    @property
    def keycloak_config(self) -> KeycloakConfiguration:
        return KeycloakConfiguration(
            url=self.KEYCLOAK_URL,
            realm=self.KEYCLOAK_REALM,
            client_id=self.KEYCLOAK_CLIENT_ID,
            client_secret=self.KEYCLOAK_CLIENT_SECRET,
            claims_mapper=self.CLAIMS_MAPPER
        )

settings = Settings()
