"""Optional, sanitized PostToolUse audit record for Studio Loop.

The hook only writes when the controller explicitly provides an audit path. It
never reads reasoning, prompts, command output, or environment values.
"""

from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path
from typing import Any


def _exit_code(response: Any) -> int | None:
    if not isinstance(response, dict):
        return None
    for key in ("exit_code", "exitCode", "returncode"):
        value = response.get(key)
        if isinstance(value, int):
            return value
    return None


def _changed_files(response: Any) -> list[str]:
    if not isinstance(response, dict):
        return []
    values = response.get("changed_files", response.get("changedFiles", []))
    if not isinstance(values, list):
        return []
    return [item for item in values if isinstance(item, str)][:100]


def _duration_ms(response: Any) -> int | None:
    if not isinstance(response, dict):
        return None
    value = response.get("duration_ms", response.get("durationMs"))
    return value if isinstance(value, int) and value >= 0 else None


def main() -> int:
    try:
        event: dict[str, Any] = json.load(sys.stdin)
    except (json.JSONDecodeError, OSError):
        return 0
    destination = os.environ.get("STUDIO_LOOP_HOOK_AUDIT_PATH")
    if not destination:
        return 0
    path = Path(destination).resolve()
    root = Path(str(event.get("cwd", "."))).resolve()
    try:
        path.relative_to(root)
    except ValueError:
        return 0
    response = event.get("tool_response")
    record = {
        "timestamp_unix_ms": time.time_ns() // 1_000_000,
        "tool": str(event.get("tool_name", "")),
        "exit_code": _exit_code(response),
        "changed_files": _changed_files(response),
        "duration_ms": _duration_ms(response),
    }
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("a", encoding="utf-8", newline="\n") as stream:
            stream.write(
                json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n"
            )
    except OSError:
        return 0
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
