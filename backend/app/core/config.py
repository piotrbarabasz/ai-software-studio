from functools import lru_cache

from pydantic import EmailStr, Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    cors_allowed_origins: str = "http://localhost:4200"
    contact_delivery_mode: str = "email"
    contact_recipient_email: EmailStr | None = None
    contact_from_email: EmailStr | None = None
    smtp_host: str | None = None
    smtp_port: int = Field(default=587, ge=1, le=65535)
    smtp_username: str | None = None
    smtp_password: SecretStr | None = None
    smtp_use_tls: bool = True
    contact_rate_limit_per_minute: int = Field(default=5, ge=1, le=120)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @model_validator(mode="after")
    def validate_production_cors(self) -> "Settings":
        if self.app_env.strip().lower() == "production" and self.allowed_origins != [
            "https://protolume.pl"
        ]:
            raise ValueError("Production CORS_ALLOWED_ORIGINS must be exactly https://protolume.pl")
        return self

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
