"""Application configuration using Pydantic settings."""

from __future__ import annotations

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )
    
    # App settings
    APP_NAME: str = "MCU Redefined API"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    APP_SECRET_KEY: str = "your-secret-key"
    LOG_LEVEL: str = "INFO"  # DEBUG, INFO, WARNING, ERROR, CRITICAL
    
    # Turso (SQLite) Database for content
    TURSO_DATABASE_URL: str = ""
    TURSO_AUTHTOKEN: str = ""
    
    # PostgreSQL Database for users
    PG_DB_HOST: str = "localhost"
    PG_DB_PORT: str = "5432"
    PG_DB_NAME: str = "mcu_redefined"
    PG_DB_USER: str = "postgres"
    PG_DB_PASSWORD: str = ""
    
    # Cloudflare R2 Storage
    R2_ACCOUNT_ID: Optional[str] = None
    R2_ACCESS_KEY_ID: Optional[str] = None
    R2_SECRET_ACCESS_KEY: Optional[str] = None
    R2_BUCKET_NAME: str = "mcuredefined"
    R2_PUBLIC_URL: Optional[str] = None
    
    # CORS
    CORS_ORIGINS: list[str] = ["*"]
    
    @property
    def turso_url(self) -> str:
        """Construct Turso database URL."""
        return f"sqlite+{self.TURSO_DATABASE_URL}/?authToken={self.TURSO_AUTHTOKEN}"
    
    @property
    def postgres_url(self) -> str:
        """Construct PostgreSQL database URL for async."""
        return f"postgresql+asyncpg://{self.PG_DB_USER}:{self.PG_DB_PASSWORD}@{self.PG_DB_HOST}:{self.PG_DB_PORT}/{self.PG_DB_NAME}"
    
    @property
    def postgres_sync_url(self) -> str:
        """Construct PostgreSQL database URL for sync operations."""
        return f"postgresql://{self.PG_DB_USER}:{self.PG_DB_PASSWORD}@{self.PG_DB_HOST}:{self.PG_DB_PORT}/{self.PG_DB_NAME}"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
