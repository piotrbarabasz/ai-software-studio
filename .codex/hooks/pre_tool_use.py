"""Stateless PreToolUse guard for Codex roles launched by Studio Loop.

It is intentionally conservative and has no ability to dispatch, resume, or
mutate controller state. The controller independently verifies every diff.
"""

from __future__ import annotations

import fnmatch
import json
import os
import re
import stat
import sys
from pathlib import Path, PurePosixPath
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
PATCH_PATH = re.compile(
    r"^(?:\+\+\+ b/|--- a/|\*\*\* (?:Add|Delete|Update) File: |\*\*\* Move to: )"
    r"(.+?)\r?$",
    re.MULTILINE,
)
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


def _allow() -> None:
    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "allow",
                }
            }
        )
    )


def _normalise(path: str) -> str | None:
    candidate = path.strip().strip("\"'").replace("\\", "/")
    if not candidate or candidate == "/dev/null" or candidate.startswith("/"):
        return None
    pure = PurePosixPath(candidate)
    if any(part in {"", ".", ".."} for part in pure.parts) or re.match(
        r"^[A-Za-z]:", candidate
    ):
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
    return [
        _normalise(value)
        for value in PATCH_PATH.findall(command)
        if value.strip() != "/dev/null"
    ]


def _paths_from_write_tool(tool: str, tool_input: Any) -> list[str | None]:
    if not isinstance(tool_input, dict):
        return []
    if tool == "apply_patch":
        command = tool_input.get("command")
        return _paths_from_patch(command) if isinstance(command, str) else []
    file_path = tool_input.get("file_path")
    if not isinstance(file_path, str):
        return []
    if tool == "Edit":
        if not isinstance(tool_input.get("old_string"), str) or not isinstance(
            tool_input.get("new_string"), str
        ):
            return []
        replace_all = tool_input.get("replace_all", False)
        if not isinstance(replace_all, bool):
            return []
    elif tool == "Write":
        if not isinstance(tool_input.get("content"), str):
            return []
    else:
        return []
    return [_normalise(file_path)]


def _load_paths() -> list[str]:
    raw = os.environ.get("STUDIO_LOOP_ALLOWED_WRITE_PATHS", "[]")
    try:
        value = json.loads(raw)
    except json.JSONDecodeError:
        return []
    return (
        value
        if isinstance(value, list) and all(isinstance(item, str) for item in value)
        else []
    )


def _is_reparse_point(details: os.stat_result) -> bool:
    if os.name != "nt":
        return False
    attributes = getattr(details, "st_file_attributes", 0)
    reparse_flag = getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0x400)
    return bool(attributes & reparse_flag)


def _inside(root: Path, candidate: Path) -> bool:
    try:
        candidate.relative_to(root)
    except ValueError:
        return False
    return True


def _resolve_target(root: Path, path: str) -> tuple[str | None, str | None]:
    current = root
    parts = PurePosixPath(path).parts
    for index, part in enumerate(parts):
        current = current / part
        try:
            details = os.lstat(current)
        except FileNotFoundError:
            break
        except OSError:
            return None, "cannot inspect the target path safely"
        is_link = stat.S_ISLNK(details.st_mode)
        is_reparse = _is_reparse_point(details)
        try:
            resolved = current.resolve(strict=True)
        except (OSError, RuntimeError):
            return None, "cannot resolve an existing symlink or reparse point safely"
        if not _inside(root, resolved):
            kind = (
                "symlink or reparse point" if is_link or is_reparse else "path element"
            )
            return None, f"target {kind} escapes the active worktree"
        if index < len(parts) - 1 and not resolved.is_dir():
            return None, "an existing parent path element is not a directory"

    try:
        resolved_target = root.joinpath(*parts).resolve(strict=False)
        relative = resolved_target.relative_to(root).as_posix()
    except (OSError, RuntimeError, ValueError):
        return None, "target resolves outside the active worktree"
    return relative, None


def _worktree(event: dict[str, Any]) -> Path | None:
    cwd = event.get("cwd")
    if not isinstance(cwd, str) or not cwd:
        return None
    try:
        root = Path(cwd).resolve(strict=True)
    except (OSError, RuntimeError):
        return None
    return root if root.is_dir() else None


def _protected(path: str) -> bool:
    return any(
        path == prefix or path.startswith(prefix + "/")
        for prefix in (".git", ".automation", ".studio-loop", ".codex")
    )


def main() -> int:
    try:
        event: dict[str, Any] = json.load(sys.stdin)
    except (json.JSONDecodeError, OSError):
        _deny("Studio Loop hook received malformed tool metadata")
        return 0

    role = os.environ.get("STUDIO_LOOP_ROLE", "")
    if role not in {"planner", "implementer", "reviewer", "debugger"}:
        _allow()
        return 0
    tool = str(event.get("tool_name", ""))
    tool_input = event.get("tool_input")

    if tool in {"Bash", "Shell", "shell"}:
        command = tool_input.get("command") if isinstance(tool_input, dict) else None
        if not isinstance(command, str):
            _deny("Studio Loop cannot validate this shell tool payload format")
            return 0
        if GIT_WRITE.search(command):
            _deny(
                "LLM roles cannot perform Git writes; the Python controller owns Git effects"
            )
        elif GH_MUTATION.search(command) or DEPLOYMENT.search(command):
            _deny("GitHub mutation and deployment commands are forbidden for LLM roles")
        elif SECRET_DUMP.search(command):
            _deny("commands that reveal environment or secret material are forbidden")
        elif WRITE_SHELL.search(command):
            _deny(
                "LLM shell writes are not permitted; use the bounded edit tool instead"
            )
        else:
            _allow()
        return 0

    if tool in {"apply_patch", "Edit", "Write"}:
        if role in {"planner", "reviewer"}:
            _deny(f"{role} is read-only")
            return 0
        root = _worktree(event)
        if root is None:
            _deny("cannot identify the active worktree for this write")
            return 0
        paths = _paths_from_write_tool(tool, tool_input)
        if not paths or any(path is None for path in paths):
            _deny("cannot prove that an edit remains inside the allowed worktree")
            return 0
        allowed_paths = _load_paths()
        for path in paths:
            assert path is not None
            resolved_path, resolution_error = _resolve_target(root, path)
            if resolution_error is not None or resolved_path is None:
                _deny(resolution_error or "cannot resolve the target path safely")
                return 0
            if _protected(path) or _protected(resolved_path):
                _deny("controller and Codex control paths are protected")
                return 0
            if SECRET_PATH.search(path) or SECRET_PATH.search(resolved_path):
                _deny("secret-bearing paths are protected")
                return 0
            if not _allowed(path, allowed_paths):
                _deny("edit path is outside task allowed_write_paths")
                return 0
        _allow()
        return 0

    _allow()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
