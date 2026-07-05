from collections.abc import Generator

import pytest
from app.core.config import Settings
from app.main import create_app
from app.schemas.contact import ContactInquiry
from app.services.contact_intake import ContactIntakeService, InMemoryRateLimiter
from fastapi.testclient import TestClient


class SuccessfulDelivery:
    def __init__(self) -> None:
        self.sent = 0

    def send(self, inquiry: ContactInquiry) -> None:
        self.sent += 1


@pytest.fixture
def settings() -> Settings:
    return Settings(
        cors_allowed_origins="http://localhost:4200",
        contact_recipient_email="owner@example.com",
        contact_from_email="noreply@example.com",
        smtp_host="smtp.example.com",
        smtp_username="smtp-user",
        smtp_password="smtp-password",
        contact_rate_limit_per_minute=5,
    )


@pytest.fixture
def client(settings: Settings) -> Generator[TestClient, None, None]:
    app = create_app(settings)
    app.state.contact_intake = ContactIntakeService(
        delivery=SuccessfulDelivery(),
        rate_limiter=InMemoryRateLimiter(),
        settings=settings,
    )
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def valid_contact_payload() -> dict[str, object]:
    return {
        "name": "Jan Kowalski",
        "email": "jan@example.com",
        "company": "Firma Testowa",
        "projectType": "ai_automation",
        "budgetRange": "25k_50k_pln",
        "message": "Potrzebujemy automatyzacji procesu obsługi zapytań od klientów.",
        "consent": True,
    }
