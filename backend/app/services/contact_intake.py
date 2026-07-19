import logging
import threading
import time
from collections import deque
from collections.abc import Callable
from dataclasses import dataclass, field

from app.core.config import Settings
from app.schemas.contact import ContactInquiry
from app.services.contact_delivery import DeliveryError, EmailContactDelivery

logger = logging.getLogger("aisoftware_studio.contact")


class RateLimitExceeded(Exception):
    """Raised when a contact source exceeds the configured in-memory limit."""


@dataclass
class InMemoryRateLimiter:
    """Bounded, per-process abuse limiter; it is not global across Cloud Run instances."""

    max_keys: int = 10_000
    key_ttl_seconds: int = 300
    cleanup_interval_seconds: int = 30
    clock: Callable[[], float] = field(default=time.monotonic, repr=False)
    attempts: dict[str, deque[float]] = field(default_factory=dict, init=False)
    last_seen: dict[str, float] = field(default_factory=dict, init=False)
    _last_cleanup: float = field(default=0.0, init=False, repr=False)
    _lock: threading.Lock = field(default_factory=threading.Lock, init=False, repr=False)

    def __post_init__(self) -> None:
        if self.max_keys < 1 or self.key_ttl_seconds < 1 or self.cleanup_interval_seconds < 1:
            raise ValueError("Rate limiter bounds and TTL values must be positive")

    def allow(self, key: str, limit: int, window_seconds: int = 60) -> bool:
        if limit < 1 or window_seconds < 1:
            raise ValueError("Rate limit and window must be positive")

        now = self.clock()
        with self._lock:
            if (
                now - self._last_cleanup >= self.cleanup_interval_seconds
                or key not in self.attempts
                and len(self.attempts) >= self.max_keys
            ):
                self._cleanup(now, window_seconds)

            if key not in self.attempts and len(self.attempts) >= self.max_keys:
                oldest_key = min(self.last_seen, key=self.last_seen.__getitem__)
                self.attempts.pop(oldest_key, None)
                self.last_seen.pop(oldest_key, None)

            recent = self.attempts.setdefault(key, deque())
            while recent and now - recent[0] >= window_seconds:
                recent.popleft()
            self.last_seen[key] = now
            if len(recent) >= limit:
                return False
            recent.append(now)
            return True

    def _cleanup(self, now: float, window_seconds: int) -> None:
        retention_seconds = max(window_seconds, self.key_ttl_seconds)
        expired_keys = [
            key for key, last_seen in self.last_seen.items() if now - last_seen >= retention_seconds
        ]
        for key in expired_keys:
            self.attempts.pop(key, None)
            self.last_seen.pop(key, None)
        self._last_cleanup = now


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
                extra={"event": "contact_rate_limited"},
            )
            raise RateLimitExceeded

        try:
            self._delivery.send(inquiry)
        except DeliveryError:
            logger.warning(
                "contact.delivery_failed",
                extra={"event": "contact_delivery_failed"},
            )
            raise

        logger.info(
            "contact.accepted",
            extra={"event": "contact_accepted"},
        )
