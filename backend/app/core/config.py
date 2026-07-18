import json
from functools import lru_cache
from pathlib import Path

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
        if self.app_env.strip().lower() == "production":
            expected_origin = _production_contract()["CORS_ALLOWED_ORIGINS"]
            if self.allowed_origins != [expected_origin]:
                raise ValueError(
                    f"Production CORS_ALLOWED_ORIGINS must be exactly {expected_origin}"
                )
        return self

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


@lru_cache
def _production_contract() -> dict[str, str]:
    local_copy = Path(__file__).with_name("production-contract.json")
    repository_copy = Path(__file__).resolve().parents[3] / "infra/gcp/production-contract.json"
    contract_path = local_copy if local_copy.is_file() else repository_copy
    try:
        contract = json.loads(contract_path.read_text(encoding="utf-8"))
        if contract["schema_version"] != 1:
            raise ValueError("unsupported schema_version")
        invariants = contract["invariants"]
        if not isinstance(invariants, dict):
            raise TypeError("invariants must be an object")
        return {str(key): str(value) for key, value in invariants.items()}
    except (OSError, json.JSONDecodeError, KeyError, TypeError, ValueError) as exc:
        raise RuntimeError(f"Cannot load production deployment contract: {exc}") from exc
