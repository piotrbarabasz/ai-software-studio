import logging
import time

import pytest
from app.core.config import Settings
from app.schemas.contact import ContactInquiry
from app.services.contact_delivery import DeliveryError, EmailContactDelivery
from app.services.contact_intake import ContactIntakeService, InMemoryRateLimiter


class RecordingDelivery:
    def __init__(self) -> None:
        self.sent = 0

    def send(self, inquiry: ContactInquiry) -> None:
        self.sent += 1


class FailingDelivery:
    def send(self, inquiry: ContactInquiry) -> None:
        raise DeliveryError("provider unavailable")


def _inquiry(payload: dict[str, object]) -> ContactInquiry:
    return ContactInquiry.model_validate(payload)


def test_contact_delivery_success_logs_non_sensitive_outcome(
    settings: Settings,
    valid_contact_payload: dict[str, object],
    caplog,
) -> None:
    delivery = RecordingDelivery()
    service = ContactIntakeService(delivery, InMemoryRateLimiter(), settings)
    caplog.set_level(logging.INFO)
    inquiry = _inquiry(valid_contact_payload)

    start = time.perf_counter()
    service.submit(inquiry, "127.0.0.1")
    elapsed = time.perf_counter() - start

    assert delivery.sent == 1
    assert elapsed < 1
    assert "contact.accepted" in caplog.text
    assert str(inquiry.email) not in caplog.text
    assert inquiry.name not in caplog.text
    assert inquiry.message not in caplog.text


def test_contact_delivery_failure_logs_without_payload(
    settings: Settings,
    valid_contact_payload: dict[str, object],
    caplog,
) -> None:
    service = ContactIntakeService(FailingDelivery(), InMemoryRateLimiter(), settings)
    inquiry = _inquiry(valid_contact_payload)
    caplog.set_level(logging.WARNING)

    with pytest.raises(DeliveryError):
        service.submit(inquiry, "127.0.0.1")

    assert "contact.delivery_failed" in caplog.text
    assert str(inquiry.email) not in caplog.text
    assert inquiry.name not in caplog.text
    assert inquiry.message not in caplog.text


def test_email_adapter_requires_email_configuration() -> None:
    adapter = EmailContactDelivery(Settings(contact_recipient_email=None, contact_from_email=None))
    inquiry = ContactInquiry.model_validate(
        {
            "name": "Jan Kowalski",
            "email": "jan@example.com",
            "projectType": "ai_automation",
            "budgetRange": "25k_50k_pln",
            "message": "Potrzebujemy automatyzacji obsługi dokumentów i raportowania.",
            "consent": True,
        }
    )

    with pytest.raises(DeliveryError):
        adapter.send(inquiry)


def test_email_adapter_uses_verified_sender_and_user_reply_to(
    settings: Settings,
    valid_contact_payload: dict[str, object],
    monkeypatch,
) -> None:
    sent_messages = []

    class RecordingSmtp:
        def __init__(self, *args, **kwargs) -> None:
            pass

        def __enter__(self):
            return self

        def __exit__(self, *args) -> None:
            return None

        def starttls(self) -> None:
            pass

        def login(self, username: str, password: str) -> None:
            pass

        def send_message(self, message) -> None:
            sent_messages.append(message)

    monkeypatch.setattr("app.services.contact_delivery.smtplib.SMTP", RecordingSmtp)
    inquiry = _inquiry(valid_contact_payload)

    EmailContactDelivery(settings).send(inquiry)

    assert len(sent_messages) == 1
    assert sent_messages[0]["From"] == str(settings.contact_from_email)
    assert sent_messages[0]["To"] == str(settings.contact_recipient_email)
    assert sent_messages[0]["Reply-To"] == str(inquiry.email)
