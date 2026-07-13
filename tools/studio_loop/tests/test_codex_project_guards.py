from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

import pytest

ROOT = Path(__file__).parents[3]
RULES = ROOT / ".codex" / "rules" / "studio-loop.rules"
HOOKS = ROOT / ".codex" / "hooks"


def _hook(
    name: str, event: dict[str, Any], *, environment: dict[str, str] | None = None
) -> dict[str, Any]:
    env = dict(os.environ)
    env.update(environment or {})
    completed = subprocess.run(
        [sys.executable, str(HOOKS / name)],
        input=json.dumps(event),
        text=True,
        capture_output=True,
        check=True,
        env=env,
    )
    return json.loads(completed.stdout) if completed.stdout.strip() else {}


def _pretool(command: str, *, role: str = "implementer") -> dict[str, Any]:
    return _hook(
        "pre_tool_use.py",
        {"tool_name": "Bash", "tool_input": {"command": command}},
        environment={"STUDIO_LOOP_ROLE": role, "STUDIO_LOOP_ALLOWED_WRITE_PATHS": '["tools/**"]'},
    )


def _decision(result: dict[str, Any]) -> str | None:
    output = result.get("hookSpecificOutput", {})
    return output.get("permissionDecision") if isinstance(output, dict) else None


@pytest.mark.skipif(shutil.which("codex") is None, reason="Codex CLI is not installed")
@pytest.mark.parametrize(
    "command",
    [
        ("git", "add", "file.txt"),
        ("git", "commit", "-m", "test"),
        ("git", "push"),
        ("git", "merge", "main"),
        ("git", "rebase", "main"),
        ("git", "reset", "--hard", "HEAD"),
        ("git", "clean", "-fd"),
        ("git", "branch", "-D", "topic"),
        ("gh", "pr", "merge", "1"),
        ("gh", "pr", "close", "1"),
        ("gcloud", "run", "deploy", "service"),
        ("gcloud", "builds", "submit"),
        ("env",),
    ],
)
def test_execpolicy_forbids_llm_mutations_and_secret_dumping(command: tuple[str, ...]) -> None:
    completed = subprocess.run(
        ["codex", "execpolicy", "check", "--rules", str(RULES), *command],
        text=True,
        capture_output=True,
        check=True,
    )
    assert json.loads(completed.stdout)["decision"] == "forbidden"


@pytest.mark.skipif(shutil.which("codex") is None, reason="Codex CLI is not installed")
def test_execpolicy_does_not_block_ordinary_tests() -> None:
    completed = subprocess.run(
        ["codex", "execpolicy", "check", "--rules", str(RULES), "npm", "test"],
        text=True,
        capture_output=True,
        check=True,
    )
    assert json.loads(completed.stdout)["matchedRules"] == []


def test_pretool_denies_git_deployment_and_secret_commands() -> None:
    for command in (
        "git commit -m test",
        "powershell -Command git push --force origin main",
        "git -c alias.x=push x --force origin main",
        "gcloud run deploy app",
        "Get-Content .env",
    ):
        assert _decision(_pretool(command)) == "deny"


def test_pretool_enforces_role_and_allowed_write_paths() -> None:
    patch = "*** Begin Patch\n*** Update File: tools/example.py\n*** End Patch\n"
    allowed = _hook(
        "pre_tool_use.py",
        {"tool_name": "apply_patch", "tool_input": {"command": patch}},
        environment={
            "STUDIO_LOOP_ROLE": "implementer",
            "STUDIO_LOOP_ALLOWED_WRITE_PATHS": '["tools"]',
        },
    )
    assert allowed == {}

    protected = _hook(
        "pre_tool_use.py",
        {"tool_name": "apply_patch", "tool_input": {"command": "*** Update File: .env\n"}},
        environment={
            "STUDIO_LOOP_ROLE": "implementer",
            "STUDIO_LOOP_ALLOWED_WRITE_PATHS": '["**"]',
        },
    )
    assert _decision(protected) == "deny"

    readonly = _hook(
        "pre_tool_use.py",
        {"tool_name": "apply_patch", "tool_input": {"command": patch}},
        environment={
            "STUDIO_LOOP_ROLE": "reviewer",
            "STUDIO_LOOP_ALLOWED_WRITE_PATHS": '["tools"]',
        },
    )
    assert _decision(readonly) == "deny"


def test_stop_hook_explicitly_refuses_continuation() -> None:
    result = _hook("stop.py", {"hook_event_name": "Stop"})
    assert result["continue"] is False
    assert "controller" in result["stopReason"].lower()


def test_posttool_audit_is_opt_in_and_sanitized(tmp_path: Path) -> None:
    audit = tmp_path / "repo with spaces" / ".automation" / "hook-audit.jsonl"
    result = _hook(
        "post_tool_use.py",
        {
            "cwd": str(audit.parents[1]),
            "tool_name": "Bash",
            "tool_response": {
                "exit_code": 0,
                "changed_files": ["tools/example.py"],
                "duration_ms": 12,
                "stdout": "never written",
            },
        },
        environment={"STUDIO_LOOP_HOOK_AUDIT_PATH": str(audit)},
    )
    assert result == {}
    record = json.loads(audit.read_text(encoding="utf-8"))
    assert record == {
        "timestamp_unix_ms": record["timestamp_unix_ms"],
        "tool": "Bash",
        "exit_code": 0,
        "changed_files": ["tools/example.py"],
        "duration_ms": 12,
    }


def test_project_hook_configuration_supports_windows_paths_with_spaces() -> None:
    hooks = json.loads((ROOT / ".codex" / "hooks.json").read_text(encoding="utf-8"))
    handlers = hooks["hooks"]["PreToolUse"][0]["hooks"]
    command = handlers[0]["commandWindows"]
    assert "Join-Path $root" in command
    assert ".codex\\hooks\\pre_tool_use.py" in command


def test_skills_and_guidance_match_the_cli_and_safety_contract() -> None:
    expected = {
        "studio-new-feature": "studio-loop start",
        "studio-resume": "studio-loop resume",
        "studio-status": "studio-loop status",
        "studio-abort": "studio-loop abort",
    }
    for skill, command in expected.items():
        content = (ROOT / ".agents" / "skills" / skill / "SKILL.md").read_text(encoding="utf-8")
        assert content.startswith("---\nname: ")
        assert command in content
        assert not any(
            line.lstrip().startswith(("git ", "gh ", "gcloud ")) for line in content.splitlines()
        )
    guidance = (ROOT / "AGENTS.md").read_text(encoding="utf-8")
    for invariant in (
        "jedynym orkiestratorem",
        "tasks.json",
        "tasks.md",
        "Merge i deployment są zabronione",
    ):
        assert invariant in guidance


def test_docs_reference_only_supported_studio_loop_commands_and_no_secrets() -> None:
    documents = [
        ROOT / "docs" / "autonomous-loop-architecture.md",
        ROOT / "docs" / "autonomous-loop-runbook.md",
        ROOT / "docs" / "autonomous-loop-troubleshooting.md",
        ROOT / "README.md",
    ]
    content = "\n".join(path.read_text(encoding="utf-8") for path in documents)
    allowed = {"start", "status", "validate-tasks", "render-tasks", "resume", "abort", "--help"}
    for line in content.splitlines():
        if line.strip().startswith("studio-loop "):
            command = line.strip().split()[1]
            assert command in allowed
    assert "speckit" + "-implement" not in content
    assert "ghp_" not in content and "sk-" not in content
