import time

from app.core.config import Settings
from app.main import create_app
from app.schemas.contact import ContactInquiry
from app.services.contact_delivery import DeliveryError
from app.services.contact_intake import ContactIntakeService, InMemoryRateLimiter
from fastapi.testclient import TestClient


class FailingDelivery:
    def send(self, inquiry: ContactInquiry) -> None:
        raise DeliveryError("failed")


def test_contact_accepts_valid_payload(
    client: TestClient,
    valid_contact_payload: dict[str, object],
) -> None:
    response = client.post("/api/contact", json=valid_contact_payload)

    assert response.status_code == 202
    assert response.json()["status"] == "accepted"


def test_contact_rejects_invalid_payload(
    client: TestClient,
    valid_contact_payload: dict[str, object],
) -> None:
    payload = {**valid_contact_payload, "email": "not-an-email", "consent": False}

    response = client.post("/api/contact", json=payload)

    assert response.status_code == 422
    assert "detail" in response.json()
    assert "not-an-email" not in response.text


def test_contact_returns_rate_limit_response(
    settings: Settings,
    valid_contact_payload: dict[str, object],
) -> None:
    app = create_app(settings)
    settings.contact_rate_limit_per_minute = 1
    rate_limiter = InMemoryRateLimiter()
    rate_limiter.attempts["testclient"] = [time.monotonic()]
    app.state.contact_intake = ContactIntakeService(
        delivery=FailingDelivery(),
        rate_limiter=rate_limiter,
        settings=settings,
    )

    with TestClient(app) as client:
        response = client.post("/api/contact", json=valid_contact_payload)

    assert response.status_code == 429
    assert response.json()["code"] == "rate_limited"


def test_contact_returns_delivery_failure(
    settings: Settings,
    valid_contact_payload: dict[str, object],
) -> None:
    app = create_app(settings)
    app.state.contact_intake = ContactIntakeService(
        delivery=FailingDelivery(),
        rate_limiter=InMemoryRateLimiter(),
        settings=settings,
    )

    with TestClient(app) as client:
        response = client.post("/api/contact", json=valid_contact_payload)

    assert response.status_code == 503
    assert response.json()["code"] == "delivery_failed"
