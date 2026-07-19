from app.services.contact_intake import InMemoryRateLimiter


class Clock:
    def __init__(self) -> None:
        self.now = 0.0

    def __call__(self) -> float:
        return self.now


def test_rate_limiter_enforces_window_and_allows_after_expiry() -> None:
    clock = Clock()
    limiter = InMemoryRateLimiter(clock=clock)

    assert limiter.allow("source", limit=2, window_seconds=60) is True
    assert limiter.allow("source", limit=2, window_seconds=60) is True
    assert limiter.allow("source", limit=2, window_seconds=60) is False

    clock.now = 60
    assert limiter.allow("source", limit=2, window_seconds=60) is True


def test_rate_limiter_removes_inactive_keys_after_ttl() -> None:
    clock = Clock()
    limiter = InMemoryRateLimiter(
        clock=clock,
        key_ttl_seconds=10,
        cleanup_interval_seconds=1,
    )
    limiter.allow("old", limit=2, window_seconds=5)

    clock.now = 11
    limiter.allow("new", limit=2, window_seconds=5)

    assert set(limiter.attempts) == {"new"}
    assert set(limiter.last_seen) == {"new"}


def test_rate_limiter_evicts_oldest_key_at_hard_capacity() -> None:
    clock = Clock()
    limiter = InMemoryRateLimiter(
        max_keys=2,
        key_ttl_seconds=300,
        cleanup_interval_seconds=30,
        clock=clock,
    )
    limiter.allow("oldest", limit=2)
    clock.now = 1
    limiter.allow("newer", limit=2)
    clock.now = 2
    limiter.allow("newest", limit=2)

    assert len(limiter.attempts) == 2
    assert set(limiter.attempts) == {"newer", "newest"}
