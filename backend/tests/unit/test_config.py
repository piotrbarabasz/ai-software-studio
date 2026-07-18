import pytest
from app.core.config import Settings
from pydantic import ValidationError


def test_production_accepts_exact_protolume_cors_origin() -> None:
    settings = Settings(
        app_env="production",
        cors_allowed_origins="https://protolume.pl",
    )

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
        Settings(app_env="production", cors_allowed_origins=origins)
