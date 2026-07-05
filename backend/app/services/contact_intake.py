import logging
import time
from dataclasses import dataclass, field

from app.core.config import Settings
from app.schemas.contact import ContactInquiry
from app.services.contact_delivery import DeliveryError, EmailContactDelivery

logger = logging.getLogger("aisoftware_studio.contact")


class RateLimitExceeded(Exception):
    """Raised when a contact source exceeds the configured in-memory limit."""


@dataclass
class InMemoryRateLimiter:
    attempts: dict[str, list[float]] = field(default_factory=dict)

    def allow(self, key: str, limit: int, window_seconds: int = 60) -> bool:
        now = time.monotonic()
        recent = [stamp for stamp in self.attempts.get(key, []) if now - stamp < window_seconds]
        if len(recent) >= limit:
            self.attempts[key] = recent
            return False
        recent.append(now)
        self.attempts[key] = recent
        return True


class ContactIntakeService:
    def __init__(
        self,
        delivery: EmailContactDelivery,
        rate_limiter: InMemoryRateLimiter,
        settings: Settings,
    ) -> None:
        self._delivery = delivery
        self._rate_limiter = rate_limiter
        self._settings = settings

    def submit(self, inquiry: ContactInquiry, client_key: str) -> None:
        if not self._rate_limiter.allow(
            client_key,
            self._settings.contact_rate_limit_per_minute,
        ):
            logger.info(
                "contact.rate_limited",
                extra={
                    "event": "contact_rate_limited",
                    "client_key": self._safe_client_key(client_key),
                },
            )
            raise RateLimitExceeded

        try:
            self._delivery.send(inquiry)
        except DeliveryError:
            logger.warning(
                "contact.delivery_failed",
                extra={
                    "event": "contact_delivery_failed",
                    "project_type": inquiry.project_type.value,
                    "budget_range": inquiry.budget_range.value,
                    "has_company": bool(inquiry.company),
                },
            )
            raise

        logger.info(
            "contact.accepted",
            extra={
                "event": "contact_accepted",
                "project_type": inquiry.project_type.value,
                "budget_range": inquiry.budget_range.value,
                "has_company": bool(inquiry.company),
            },
        )

    @staticmethod
    def _safe_client_key(client_key: str) -> str:
        return "unknown" if not client_key else "present"
