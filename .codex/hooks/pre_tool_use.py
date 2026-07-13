"""Stateless PreToolUse guard for Codex roles launched by Studio Loop.

It is intentionally conservative and has no ability to dispatch, resume, or
mutate controller state. The controller independently verifies every diff.
"""

from __future__ import annotations

import fnmatch
import json
import os
import re
import sys
from pathlib import PurePosixPath
from typing import Any

GIT_WRITE = re.compile(
    r"\bgit(?:\.exe)?\b[^\r\n]{0,512}\b(?:add|commit|push|merge|rebase|reset|clean|branch|"
    r"checkout|switch|tag|cherry-pick|revert|restore|stash|worktree)\b",
    re.IGNORECASE,
)
DEPLOYMENT = re.compile(
    r"\bgcloud(?:\.cmd|\.exe)?\b[^\r\n]{0,256}\b(?:run\s+deploy|builds\s+submit)\b",
    re.IGNORECASE,
)
GH_MUTATION = re.compile(
    r"\bgh(?:\.exe)?\b[^\r\n]{0,256}\bpr\s+(?:merge|close|ready)\b", re.IGNORECASE
)
SECRET_DUMP = re.compile(
    r"(?:^|[;&|\n]\s*)(?:env|printenv|set)\b|"
    r"(?:get-childitem|dir)\s+env:|"
    r"(?:cat|get-content|type)\s+(?:[^\n;&|]*[\\/])?\.env(?:\.|\s|$)|"
    r"(?:cat|get-content|type)\s+[^\n;&|]*(?:secret|credential|\.pem|\.pfx|\.key)\b",
    re.IGNORECASE,
)
WRITE_SHELL = re.compile(
    r"(?:set-content|add-content|out-file|new-item|copy-item|move-item|remove-item|"
    r"\b(?:cp|mv|rm|touch|mkdir)\b|(?<![=<>])>{1,2})",
    re.IGNORECASE,
)
PATCH_PATH = re.compile(r"^(?:\+\+\+ b/|--- a/|\*\*\* (?:Add|Delete|Update) File: )(.+)$", re.MULTILINE)
SECRET_PATH = re.compile(
    r"(?:^|/)(?:\.env(?:\.[^/]*)?|secrets?(?:/|\.|$)|credentials?(?:/|\.|$))|"
    r"\.(?:pem|p12|pfx|key)$",
    re.IGNORECASE,
)


def _deny(reason: str) -> None:
    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "deny",
                    "permissionDecisionReason": reason,
                }
            }
        )
    )


def _normalise(path: str) -> str | None:
    candidate = path.strip().strip('"\'').replace("\\", "/")
    if not candidate or candidate == "/dev/null" or candidate.startswith("/"):
        return None
    pure = PurePosixPath(candidate)
    if any(part in {"", ".", ".."} for part in pure.parts) or re.match(r"^[A-Za-z]:", candidate):
        return None
    return pure.as_posix()


def _allowed(path: str, patterns: list[str]) -> bool:
    folded = path.casefold() if os.name == "nt" else path
    for raw in patterns:
        normal = _normalise(raw)
        if normal is None:
            continue
        expected = normal.casefold() if os.name == "nt" else normal
        if any(token in expected for token in "*?["):
            if fnmatch.fnmatchcase(folded, expected):
                return True
        elif folded == expected or folded.startswith(expected.rstrip("/") + "/"):
            return True
    return False


def _paths_from_patch(command: str) -> list[str | None]:
    return [_normalise(value) for value in PATCH_PATH.findall(command)]


def _load_paths() -> list[str]:
    raw = os.environ.get("STUDIO_LOOP_ALLOWED_WRITE_PATHS", "[]")
    try:
        value = json.loads(raw)
    except json.JSONDecodeError:
        return []
    return value if isinstance(value, list) and all(isinstance(item, str) for item in value) else []


def main() -> int:
    try:
        event: dict[str, Any] = json.load(sys.stdin)
    except (json.JSONDecodeError, OSError):
        _deny("Studio Loop hook received malformed tool metadata")
        return 0

    role = os.environ.get("STUDIO_LOOP_ROLE", "")
    if role not in {"planner", "implementer", "reviewer", "debugger"}:
        return 0
    tool = str(event.get("tool_name", ""))
    tool_input = event.get("tool_input")
    command = (
        tool_input.get("command", tool_input.get("patch", ""))
        if isinstance(tool_input, dict)
        else ""
    )
    if not isinstance(command, str):
        _deny("Studio Loop only accepts string command metadata")
        return 0

    if tool in {"Bash", "Shell", "shell"}:
        if GIT_WRITE.search(command):
            _deny("LLM roles cannot perform Git writes; the Python controller owns Git effects")
        elif GH_MUTATION.search(command) or DEPLOYMENT.search(command):
            _deny("GitHub mutation and deployment commands are forbidden for LLM roles")
        elif SECRET_DUMP.search(command):
            _deny("commands that reveal environment or secret material are forbidden")
        elif WRITE_SHELL.search(command):
            _deny("LLM shell writes are not permitted; use the bounded edit tool instead")
        return 0

    if tool == "apply_patch":
        if role in {"planner", "reviewer"}:
            _deny(f"{role} is read-only")
            return 0
        paths = _paths_from_patch(command)
        if not paths or any(path is None for path in paths):
            _deny("cannot prove that an edit remains inside the allowed worktree")
            return 0
        allowed_paths = _load_paths()
        for path in paths:
            assert path is not None
            if path.startswith((".git/", ".automation/", ".studio-loop/", ".codex/")):
                _deny("controller and Codex control paths are protected")
                return 0
            if SECRET_PATH.search(path):
                _deny("secret-bearing paths are protected")
                return 0
            if not _allowed(path, allowed_paths):
                _deny("edit path is outside task allowed_write_paths")
                return 0
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
