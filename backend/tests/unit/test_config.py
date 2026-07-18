import pytest
from app.core.config import Settings
from pydantic import ValidationError


def production_configuration(**overrides: object) -> dict[str, object]:
    configuration: dict[str, object] = {
        "app_env": "production",
        "cors_allowed_origins": "https://protolume.pl",
        "contact_delivery_mode": "email",
        "contact_recipient_email": "recipient@fixtures.protolume.pl",
        "contact_from_email": "sender@fixtures.protolume.pl",
        "smtp_host": "smtp.fixtures.protolume.pl",
        "smtp_port": 587,
        "smtp_username": "fixture-user",
        "smtp_password": "fixture-password",
        "smtp_use_tls": True,
    }
    configuration.update(overrides)
    return configuration


def test_production_accepts_exact_protolume_cors_origin() -> None:
    settings = Settings(**production_configuration())

    assert settings.allowed_origins == ["https://protolume.pl"]


@pytest.mark.parametrize(
    "origins",
    [
        "",
        "https://aisoftware-studio-web.run.app",
        "https://www.protolume.pl",
        "https://protolume.com",
        "https://www.protolume.com",
        "https://protolume.pl,https://untrusted.invalid",
    ],
)
def test_production_rejects_any_other_cors_configuration(origins: str) -> None:
    with pytest.raises(ValidationError, match="CORS_ALLOWED_ORIGINS"):
        Settings(**production_configuration(cors_allowed_origins=origins))


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("smtp_host", "<REQUIRED_SMTP_HOST>"),
        ("smtp_username", "placeholder"),
        ("smtp_password", "__SMTP_REQUIRED__"),
        ("smtp_host", "smtp.example.com"),
    ],
)
def test_production_rejects_placeholder_smtp_configuration(field: str, value: str) -> None:
    with pytest.raises(ValidationError, match=field.upper()):
        Settings(**production_configuration(**{field: value}))


def test_production_accepts_complete_contact_delivery_configuration() -> None:
    settings = Settings(**production_configuration())

    assert settings.contact_delivery_ready is True


@pytest.mark.parametrize(
    "field",
    [
        "contact_delivery_mode",
        "contact_recipient_email",
        "contact_from_email",
        "smtp_host",
        "smtp_port",
        "smtp_username",
        "smtp_password",
        "smtp_use_tls",
    ],
)
def test_production_rejects_missing_contact_delivery_configuration(field: str) -> None:
    with pytest.raises(ValidationError, match=field.upper()):
        Settings(**production_configuration(**{field: None}))


def test_invalid_delivery_mode_is_rejected() -> None:
    with pytest.raises(ValidationError, match="contact_delivery_mode"):
        Settings(**production_configuration(contact_delivery_mode="log"))


def test_invalid_environment_name_cannot_bypass_production_validation() -> None:
    with pytest.raises(ValidationError, match="app_env"):
        Settings(app_env="prodution")


@pytest.mark.parametrize("field", ["contact_recipient_email", "contact_from_email"])
def test_production_rejects_invalid_email_addresses(field: str) -> None:
    with pytest.raises(ValidationError, match=field):
        Settings(**production_configuration(**{field: "not-an-email"}))
