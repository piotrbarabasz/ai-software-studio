import logging
import smtplib
from email.message import EmailMessage

from app.core.brand import public_brand
from app.core.config import Settings
from app.schemas.contact import ContactInquiry

logger = logging.getLogger("aisoftware_studio.contact")


class DeliveryError(Exception):
    """Raised when the owner notification cannot be delivered."""


class EmailContactDelivery:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def send(self, inquiry: ContactInquiry) -> None:
        if not self._has_required_config():
            raise DeliveryError("Email delivery is not configured.")

        message = EmailMessage()
        message["Subject"] = f"Nowe zapytanie z {public_brand['name']}"
        message["From"] = str(self._settings.contact_from_email)
        message["To"] = str(self._settings.contact_recipient_email)
        message.set_content(self._build_email_body(inquiry))

        try:
            with smtplib.SMTP(
                self._settings.smtp_host,
                self._settings.smtp_port,
                timeout=10,
            ) as smtp:
                if self._settings.smtp_use_tls:
                    smtp.starttls()
                if self._settings.smtp_username:
                    password = (
                        self._settings.smtp_password.get_secret_value()
                        if self._settings.smtp_password
                        else ""
                    )
                    smtp.login(self._settings.smtp_username, password)
                smtp.send_message(message)
        except Exception as exc:  # pragma: no cover - exact SMTP failures vary by provider
            logger.warning(
                "contact.delivery_failed",
                extra={"event": "contact_delivery_failed", "reason": exc.__class__.__name__},
            )
            raise DeliveryError("Email delivery failed.") from exc

    def _has_required_config(self) -> bool:
        return bool(
            self._settings.contact_recipient_email
            and self._settings.contact_from_email
            and self._settings.smtp_host
        )

    @staticmethod
    def _build_email_body(inquiry: ContactInquiry) -> str:
        company = inquiry.company or "Nie podano"
        return (
            f"Nowe zapytanie z formularza {public_brand['name']}\n\n"
            f"Imię i nazwisko: {inquiry.name}\n"
            f"Email: {inquiry.email}\n"
            f"Firma: {company}\n"
            f"Typ projektu: {inquiry.project_type.value}\n"
            f"Budżet: {inquiry.budget_range.value}\n"
            f"Zgoda: {'tak' if inquiry.consent else 'nie'}\n"
            f"Czas zgłoszenia: {inquiry.submitted_at.isoformat()}\n\n"
            "Wiadomość:\n"
            f"{inquiry.message}\n"
        )
