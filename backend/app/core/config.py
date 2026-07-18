import json
import re
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import EmailStr, Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: Literal["development", "test", "production"] = "development"
    cors_allowed_origins: str = "http://localhost:4200"
    contact_delivery_mode: Literal["email"] | None = None
    contact_recipient_email: EmailStr | None = None
    contact_from_email: EmailStr | None = None
    smtp_host: str | None = None
    smtp_port: int | None = Field(default=None, ge=1, le=65535)
    smtp_username: str | None = None
    smtp_password: SecretStr | None = None
    smtp_use_tls: bool | None = None
    contact_rate_limit_per_minute: int = Field(default=5, ge=1, le=120)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @model_validator(mode="after")
    def validate_production_configuration(self) -> "Settings":
        if self.app_env == "production":
            expected_origin = _production_contract()["CORS_ALLOWED_ORIGINS"]
            if self.allowed_origins != [expected_origin]:
                raise ValueError(
                    f"Production CORS_ALLOWED_ORIGINS must be exactly {expected_origin}"
                )
            missing = self.missing_contact_delivery_fields
            if missing:
                raise ValueError(
                    "Production contact delivery configuration is incomplete: " + ", ".join(missing)
                )
            unsafe = self.unsafe_production_fields
            if unsafe:
                raise ValueError(
                    "Production contact delivery configuration contains a placeholder or "
                    "example value: " + ", ".join(unsafe)
                )
        return self

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_allowed_origins.split(",") if origin.strip()]

    @property
    def missing_contact_delivery_fields(self) -> list[str]:
        required: dict[str, object] = {
            "CONTACT_DELIVERY_MODE": self.contact_delivery_mode,
            "CONTACT_RECIPIENT_EMAIL": self.contact_recipient_email,
            "CONTACT_FROM_EMAIL": self.contact_from_email,
            "SMTP_HOST": self.smtp_host,
            "SMTP_PORT": self.smtp_port,
            "SMTP_USERNAME": self.smtp_username,
            "SMTP_PASSWORD": self.smtp_password,
            "SMTP_USE_TLS": self.smtp_use_tls,
        }
        return [name for name, value in required.items() if value is None or value == ""]

    @property
    def unsafe_production_fields(self) -> list[str]:
        values = {
            "CONTACT_RECIPIENT_EMAIL": str(self.contact_recipient_email or ""),
            "CONTACT_FROM_EMAIL": str(self.contact_from_email or ""),
            "SMTP_HOST": self.smtp_host or "",
            "SMTP_USERNAME": self.smtp_username or "",
            "SMTP_PASSWORD": (
                self.smtp_password.get_secret_value() if self.smtp_password is not None else ""
            ),
        }
        return [name for name, value in values.items() if _is_unsafe_production_value(value)]

    @property
    def contact_delivery_ready(self) -> bool:
        return not self.missing_contact_delivery_fields


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


_PLACEHOLDER_PATTERN = re.compile(
    r"<[^>]+>|\[[^\]]*(?:required|placeholder|todo|tbd)[^\]]*\]|"
    r"__[^\s]*required[^\s]*__|\$(?:\{[^}]+\}|[A-Z_][A-Z0-9_]*)|"
    r"\b(?:example|placeholder|changeme|todo|tbd|required)\b",
    re.IGNORECASE,
)


def _is_unsafe_production_value(value: str) -> bool:
    normalized = value.strip().lower()
    return bool(
        not normalized
        or _PLACEHOLDER_PATTERN.search(value)
        or "example.com" in normalized
        or normalized.endswith(".example")
        or ".example." in normalized
        or "localhost" in normalized
        or normalized in {"127.0.0.1", "::1"}
    )
