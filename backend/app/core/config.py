import json
import os
from pathlib import Path
from typing import Annotated
from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration."""
    
    # App settings
    APP_NAME: str = "Asset Management System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./asset_db.sqlite"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: Annotated[
        list[str],
        NoDecode,
    ] = ["http://localhost:3000", "http://localhost:5173"]
    
    # RBAC Roles
    ROLES: dict[str, list[str]] = {
        "admin": ["create", "read", "update", "delete", "manage_users"],
        "manager": ["create", "read", "update"],
        "asset_manager": ["create", "read", "update"],
        "agency_admin": ["create", "read", "update", "delete", "manage_users"],
        "staff": ["read"],
        "viewer": ["read"],
    }
    
    # AI/ML Settings
    MODEL_PATH: str = "./app/ai/models"
    PREDICTION_THRESHOLD: float = 0.7

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> object:
        """Accept JSON arrays and comma-separated origins from environment values."""
        if isinstance(value, str):
            value = value.strip()
            if not value:
                return []
            if value.startswith("["):
                return json.loads(value)
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parents[2] / ".env")
    )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
