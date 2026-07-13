from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any

import pytest

from studio_loop.adapters.subprocesses import (
    ProcessExecutableNotFound,
    ProcessResult,
)
from studio_loop.codex_runner import CodexPolicyError, CodexRunner
from studio_loop.ports.codex import CodexExitCategory
from studio_loop.roles import RoleConfigurationError, load_role_profiles


class FakeExecutor:
    def __init__(self, responses: list[dict[str, Any]]) -> None:
        self.responses = responses
        self.calls: list[dict[str, Any]] = []

    def execute(self, argv: object, **kwargs: Any) -> ProcessResult:
        literal = tuple(argv)  # type: ignore[arg-type]
        self.calls.append({"argv": literal, **kwargs})
        response = self.responses.pop(0)
        if response.get("missing"):
            raise ProcessExecutableNotFound("codex")
        output_path = Path(literal[literal.index("--output-last-message") + 1])
        if "output" in response:
            value = response["output"]
            output_path.write_text(
                value if isinstance(value, str) else json.dumps(value), encoding="utf-8"
            )
        return ProcessResult(
            argv=literal,
            exit_code=response.get("exit_code", 0),
            stdout=response.get("stdout", b""),
            stderr=response.get("stderr", b""),
            timed_out=response.get("timed_out", False),
        )


@pytest.fixture
def repository(tmp_path: Path) -> Path:
    root = tmp_path / "repo with spaces"
    source = Path(__file__).parents[3] / ".studio-loop"
    (root / ".studio-loop").mkdir(parents=True)
    shutil.copytree(source / "prompts", root / ".studio-loop" / "prompts")
    shutil.copytree(source / "schemas", root / ".studio-loop" / "schemas")
    shutil.copy2(source / "roles.json", root / ".studio-loop" / "roles.json")
    return root


@pytest.fixture
def task_package(repository: Path) -> Path:
    path = repository / "runtime packages" / "task T123.json"
    path.parent.mkdir()
    path.write_text(
        json.dumps(
            {
                "task_id": "T123",
                "recorded_failure": {"summary": "test failed"},
                "allowed_write_paths": ["tools/studio_loop"],
            }
        ),
        encoding="utf-8",
    )
    return path


def implementer_output(**overrides: Any) -> dict[str, Any]:
    payload = {
        "status": "implemented",
        "task_id": "T123",
        "summary": "implemented safely",
        "claimed_changed_files": ["tools/studio_loop/example.py"],
        "commands_requested": ["python-unit"],
        "blocking_issues": [],
    }
    payload.update(overrides)
    return payload


def run_with(
    repository: Path,
    task_package: Path,
    responses: list[dict[str, Any]],
    **kwargs: Any,
) -> tuple[object, FakeExecutor]:
    executor = FakeExecutor(responses)
    runner = CodexRunner(
        repository,
        executor=executor,  # type: ignore[arg-type]
        evidence_directory=repository / "evidence",
        **kwargs,
    )
    return runner.run("implementer", task_package, invocation_id="invocation-123"), executor


def test_valid_structured_output_uses_supported_flags_and_windows_paths(
    repository: Path, task_package: Path
) -> None:
    result, executor = run_with(repository, task_package, [{"output": implementer_output()}])
    assert result.category is CodexExitCategory.SUCCESS  # type: ignore[attr-defined]
    call = executor.calls[0]
    argv = call["argv"]
    assert argv[argv.index("--cd") + 1] == str(repository.resolve())
    assert argv[argv.index("--output-schema") + 1].endswith("implementer-output.schema.json")
    assert argv[argv.index("--sandbox") + 1] == "workspace-write"
    assert argv[argv.index("--model") + 1] == "gpt-5.6-terra"
    assert 'model_reasoning_effort="high"' in argv
    assert argv[1:3] == ("--ask-for-approval", "never")
    assert "sandbox_workspace_write.network_access=false" in argv
    assert 'web_search="disabled"' in argv
    assert "features.apps=false" in argv
    assert "features.multi_agent=false" in argv
    assert "--ephemeral" in argv and "--json" in argv and argv[-1] == "-"
    assert str(task_package.resolve()).encode() in call["stdin"]
    assert call["cwd"] == repository.resolve()
    assert all('"' not in item for item in (argv[argv.index("--cd") + 1],))
    assert call["environment"]["STUDIO_LOOP_ROLE"] == "implementer"
    assert call["environment"]["STUDIO_LOOP_ALLOWED_WRITE_PATHS"] == '["tools/studio_loop"]'


@pytest.mark.parametrize(
    ("response", "reason"),
    [
        ({"output": "not json"}, "invalid JSON"),
        ({"output": implementer_output(extra=True)}, "schema violation"),
    ],
)
def test_invalid_json_and_schema_violation_are_retried_then_rejected(
    repository: Path, task_package: Path, response: dict[str, Any], reason: str
) -> None:
    result, executor = run_with(repository, task_package, [response.copy(), response.copy()])
    assert result.category is CodexExitCategory.INVALID_OUTPUT  # type: ignore[attr-defined]
    assert result.attempts == 2  # type: ignore[attr-defined]
    assert len(executor.calls) == 2
    assert reason in executor.calls[1]["stdin"].decode()


@pytest.mark.parametrize(
    ("response", "category"),
    [
        ({"exit_code": 2, "stderr": b"ordinary model failure"}, CodexExitCategory.MODEL_FAILURE),
        (
            {"exit_code": 1, "stderr": b"401 Unauthorized: login required"},
            CodexExitCategory.AUTH_FAILURE,
        ),
        (
            {"exit_code": 1, "stderr": b"Model gpt-x is unavailable"},
            CodexExitCategory.MODEL_UNAVAILABLE,
        ),
        (
            {"exit_code": 1, "stderr": b"unknown reasoning effort"},
            CodexExitCategory.INVALID_REASONING_EFFORT,
        ),
        ({"timed_out": True}, CodexExitCategory.TIMEOUT),
        ({"missing": True}, CodexExitCategory.CLI_NOT_FOUND),
    ],
)
def test_process_failure_categories(
    repository: Path,
    task_package: Path,
    response: dict[str, Any],
    category: CodexExitCategory,
) -> None:
    result, _ = run_with(repository, task_package, [response])
    assert result.category is category  # type: ignore[attr-defined]


def test_unknown_reasoning_effort_is_rejected_before_process_start(
    repository: Path, task_package: Path
) -> None:
    config_path = repository / ".studio-loop" / "roles.json"
    config = json.loads(config_path.read_text(encoding="utf-8"))
    config["roles"]["implementer"]["reasoning_effort"] = "ultra"
    config_path.write_text(json.dumps(config), encoding="utf-8")
    executor = FakeExecutor([])
    runner = CodexRunner(
        repository,
        executor=executor,
        evidence_directory=repository / "evidence",  # type: ignore[arg-type]
    )
    result = runner.run("implementer", task_package, invocation_id="invalid-effort")
    assert result.category is CodexExitCategory.INVALID_REASONING_EFFORT
    assert executor.calls == []


def test_each_role_uses_canonical_least_privilege_and_never_unsafe_flags(repository: Path) -> None:
    profiles = load_role_profiles(repository)
    runner = CodexRunner(repository, evidence_directory=repository / "evidence")
    expected = {
        "planner": ("gpt-5.6-sol", "read-only"),
        "implementer": ("gpt-5.6-terra", "workspace-write"),
        "reviewer": ("gpt-5.6-sol", "read-only"),
        "debugger": ("gpt-5.6-terra", "workspace-write"),
    }
    for role, (model, sandbox) in expected.items():
        argv = runner.build_argv(profiles[role], repository / f"{role}.json")  # type: ignore[index]
        assert argv[argv.index("--model") + 1] == model
        assert argv[argv.index("--sandbox") + 1] == sandbox
        assert "danger-full-access" not in argv
        assert "--full-auto" not in argv
        assert "--search" not in argv
        assert "--ignore-rules" not in argv
        assert "--dangerously-bypass-hook-trust" not in argv
        assert "--dangerously-bypass-approvals-and-sandbox" not in argv
        assert "resume" not in argv


def test_secrets_are_redacted_and_reasoning_content_is_never_persisted(
    repository: Path, task_package: Path
) -> None:
    secret = "ghp_abcdefghijklmnopqrstuvwx"
    output = implementer_output(summary=f"used {secret}")
    event = json.dumps(
        {
            "type": "item.completed",
            "timestamp": "2026-07-12T00:00:00Z",
            "reasoning": "private chain",
            "content": f"hidden {secret}",
            "thread_id": "thread-secret",
        }
    ).encode()
    result, _ = run_with(
        repository,
        task_package,
        [{"output": output, "stdout": event}],
        environment={"PATH": "test", "MY_SECRET": secret},
    )
    persisted = "\n".join(
        path.read_text(encoding="utf-8") for path in (repository / "evidence").glob("*")
    )
    assert result.category is CodexExitCategory.SUCCESS  # type: ignore[attr-defined]
    assert secret not in persisted
    assert "private chain" not in persisted
    assert "thread-secret" not in persisted
    assert "[REDACTED]" in persisted


def test_debugger_requires_recorded_failure(repository: Path, task_package: Path) -> None:
    task_package.write_text(json.dumps({"task_id": "T123"}), encoding="utf-8")
    runner = CodexRunner(
        repository,
        executor=FakeExecutor([]),
        evidence_directory=repository / "evidence",  # type: ignore[arg-type]
    )
    with pytest.raises(CodexPolicyError, match="recorded failure"):
        runner.run("debugger", task_package, invocation_id="debugger-123")


def test_role_policy_paths_cannot_escape_or_use_symlinks(repository: Path, tmp_path: Path) -> None:
    config_path = repository / ".studio-loop" / "roles.json"
    config = json.loads(config_path.read_text(encoding="utf-8"))
    config["roles"]["reviewer"]["prompt_template"] = "../outside.md"
    config_path.write_text(json.dumps(config), encoding="utf-8")
    with pytest.raises(RoleConfigurationError, match="repository-relative"):
        load_role_profiles(repository)

    config["roles"]["reviewer"]["prompt_template"] = ".studio-loop/prompts/link.md"
    config_path.write_text(json.dumps(config), encoding="utf-8")
    target = tmp_path / "outside.md"
    target.write_text("outside", encoding="utf-8")
    try:
        (repository / ".studio-loop" / "prompts" / "link.md").symlink_to(target)
    except OSError as error:
        pytest.skip(f"symlinks are unavailable: {error}")
    with pytest.raises(RoleConfigurationError, match="symlink"):
        load_role_profiles(repository)
