"""Secret redaction used before any Codex process evidence is persisted."""

from __future__ import annotations

import re
from collections.abc import Iterable, Mapping

REDACTED = "[REDACTED]"
_SECRET_NAME = re.compile(r"(?:token|secret|password|passwd|api[_-]?key|credential)", re.I)
_TOKEN_PATTERNS = (
    re.compile(r"\b(?:sk|ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_-]{12,}\b"),
    re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    re.compile(r"(?i)\bBearer\s+[A-Za-z0-9._~+/-]{12,}=*"),
    re.compile(r"(?i)(token|secret|password|api[_-]?key)\s*[:=]\s*[^\s,;]+"),
)


def known_secrets(environment: Mapping[str, str]) -> tuple[str, ...]:
    """Return only plausible secret values, never their names or values in logs."""

    return tuple(
        value
        for name, value in environment.items()
        if _SECRET_NAME.search(name) and len(value) >= 8
    )


def redact(value: str, secrets: Iterable[str] = ()) -> str:
    """Replace exact known values and high-confidence credential patterns."""

    result = value
    for secret in sorted(set(secrets), key=len, reverse=True):
        if secret:
            result = result.replace(secret, REDACTED)
    for pattern in _TOKEN_PATTERNS:
        result = pattern.sub(REDACTED, result)
    return result
