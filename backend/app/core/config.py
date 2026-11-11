from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    environment: str = "development"
    database_url: str = "postgresql+psycopg://rawi:rawi@localhost:5432/rawi"
    jwt_secret: str = "change-me-in-local-env-only"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 720
    cors_origins: str = "http://localhost:5173"
    admin_email: str | None = None
    admin_password: str | None = None
    admin_name: str = "Administrateur RAWI"

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
