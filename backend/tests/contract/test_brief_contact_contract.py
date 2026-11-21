"""Contract checks for the simplified V3 contact form on the existing SMTP backend."""

import logging

import pytest
from app.core.config import Settings
from app.main import create_app
from app.schemas.contact import BriefContactInquiry
from app.services.contact_delivery import DeliveryError, EmailContactDelivery
from app.services.contact_intake import ContactIntakeService, InMemoryRateLimiter
from fastapi.testclient import TestClient


class RecordingDelivery:
    def __init__(self) -> None:
        self.received: list[BriefContactInquiry] = []

    def send(self, inquiry: BriefContactInquiry) -> None:
        self.received.append(inquiry)


class FailingDelivery:
    def send(self, inquiry: BriefContactInquiry) -> None:
        raise DeliveryError("SMTP unavailable")


def make_client(settings: Settings, delivery: object) -> TestClient:
    app = create_app(settings)
    app.state.contact_intake = ContactIntakeService(
        delivery=delivery, rate_limiter=InMemoryRateLimiter(), settings=settings
    )
    return TestClient(app)


def test_brief_contact_accepts_minimal_data_and_uses_existing_delivery(settings: Settings) -> None:
    delivery = RecordingDelivery()
    with make_client(settings, delivery) as client:
        response = client.post(
            "/api/contact/brief",
            json={"name": " Firma ABC ", "email": " biuro@example.com ", "message": "  "},
        )

    assert response.status_code == 202
    assert response.json()["status"] == "accepted"
    assert len(delivery.received) == 1
    assert delivery.received[0].name == "Firma ABC"
    assert str(delivery.received[0].email) == "biuro@example.com"
    assert delivery.received[0].message == "Proszę o kontakt."


def test_brief_contact_is_independent_of_legacy_discovery_fields(client: TestClient) -> None:
    response = client.post(
        "/api/contact/brief",
        json={"name": "Alicja", "email": "alicja@example.com"},
    )
    assert response.status_code == 202


@pytest.mark.parametrize(
    "payload",
    [
        {"name": "A", "email": "x@example.com"},
        {"name": "Firma", "email": "invalid"},
        {"name": "Firma", "email": "x@example.com", "message": "x" * 4001},
        {"name": "Firma", "email": "x@example.com", "projectType": "ai_automation"},
        {"name": "Firma", "email": "x@example.com", "consent": True},
    ],
)
def test_brief_contact_rejects_invalid_or_unexpected_values(
    client: TestClient, payload: dict[str, object]
) -> None:
    response = client.post("/api/contact/brief", json=payload)
    assert response.status_code == 422
    assert "x@example.com" not in response.text


def test_brief_contact_honeypot_is_accepted_without_sending(settings: Settings) -> None:
    delivery = RecordingDelivery()
    with make_client(settings, delivery) as client:
        response = client.post(
            "/api/contact/brief",
            json={
                "name": "Firma",
                "email": "x@example.com",
                "website": "https://spam.invalid",
            },
        )
    assert response.status_code == 202
    assert delivery.received == []


def test_brief_contact_shares_rate_limiter(settings: Settings) -> None:
    settings.contact_rate_limit_per_minute = 1
    delivery = RecordingDelivery()
    with make_client(settings, delivery) as client:
        first = client.post(
            "/api/contact/brief", json={"name": "Firma", "email": "x@example.com"}
        )
        second = client.post(
            "/api/contact/brief", json={"name": "Firma", "email": "x@example.com"}
        )
    assert first.status_code == 202
    assert second.status_code == 429
    assert second.json()["code"] == "rate_limited"
    assert len(delivery.received) == 1


def test_brief_contact_smtp_failure_is_safe(settings: Settings) -> None:
    with make_client(settings, FailingDelivery()) as client:
        response = client.post(
            "/api/contact/brief",
            json={"name": "Firma", "email": "x@example.com"},
        )
    assert response.status_code == 503
    assert response.json()["code"] == "delivery_failed"
    assert "SMTP" not in response.text


def test_brief_contact_rejects_large_payload(client: TestClient) -> None:
    response = client.post(
        "/api/contact/brief",
        json={"name": "Firma", "email": "x@example.com", "message": "a" * 18000},
    )
    assert response.status_code == 413


def test_brief_contact_rejects_unapproved_cors_origin(client: TestClient) -> None:
    response = client.options(
        "/api/contact/brief",
        headers={
            "Origin": "https://unauthorized.example",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers


def test_brief_email_body_does_not_fabricate_budget_or_consent() -> None:
    inquiry = BriefContactInquiry(name="Firma ABC", email="test@example.com")
    body = EmailContactDelivery._build_email_body(inquiry)
    assert "Imię lub firma: Firma ABC" in body
    assert "Email: test@example.com" in body
    assert "Wiadomość:\nProszę o kontakt." in body
    assert "Budżet" not in body
    assert "Zgoda" not in body
    assert "Typ projektu" not in body


def test_brief_acceptance_logs_no_personal_data(settings: Settings, caplog) -> None:
    caplog.set_level(logging.INFO, logger="aisoftware_studio.contact")
    with make_client(settings, RecordingDelivery()) as client:
        response = client.post(
            "/api/contact/brief",
            json={"name": "Prywatny Klient", "email": "private@example.com"},
        )
    assert response.status_code == 202
    assert "Prywatny Klient" not in caplog.text
    assert "private@example.com" not in caplog.text
