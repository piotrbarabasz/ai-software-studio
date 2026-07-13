from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

from studio_loop.validation_runner import ValidationPolicyError, ValidationRunner


def test_committed_validation_profiles_cover_repository_commands() -> None:
    repository = Path(__file__).parents[3]
    runner = ValidationRunner(repository)
    assert set(runner.profiles) == {
        "backend-tests",
        "backend-lint",
        "backend-format-check",
        "frontend-tests",
        "frontend-lint",
        "frontend-build",
        "studio-loop-tests",
        "studio-loop-lint",
    }
    assert runner.profiles["backend-tests"].argv == ("python", "-m", "pytest")
    assert runner.profiles["frontend-build"].argv == ("npm", "run", "build")
    assert runner.profiles["studio-loop-lint"].working_directory == "tools/studio_loop"


def test_validation_report_is_bounded_and_contains_controller_observations(tmp_path: Path) -> None:
    repository = tmp_path / "repo"
    repository.mkdir()
    config = repository / "profiles.json"
    config.write_text(
        json.dumps(
            {
                "schema_version": "1.0.0",
                "profiles": {
                    "bounded": {
                        "argv": [sys.executable, "-c", "print('x' * 3000)"],
                        "working_directory": ".",
                        "max_output_bytes": 1024,
                        "timeout_seconds": 10,
                    }
                },
            }
        ),
        encoding="utf-8",
    )
    runner = ValidationRunner(repository, config_path=config)
    report = runner.run("bounded")
    assert report.profile == "bounded"
    assert report.argv[0] == sys.executable
    assert report.working_directory == "."
    assert report.started_at < report.ended_at
    assert report.exit_code == 0
    assert len(report.stdout.encode()) == 1024
    assert report.stderr == ""
    assert report.truncated is True
    assert report.truncation_marker == "[output truncated to 1024 bytes]"
    assert report.status == "PASS"


def test_profile_cannot_add_shell_fields_or_escape_worktree(tmp_path: Path) -> None:
    repository = tmp_path / "repo"
    repository.mkdir()
    config = repository / "profiles.json"
    config.write_text(
        json.dumps(
            {
                "schema_version": "1.0.0",
                "profiles": {
                    "unsafe": {
                        "argv": ["echo", "unsafe"],
                        "working_directory": "..",
                        "shell": True,
                    }
                },
            }
        ),
        encoding="utf-8",
    )
    with pytest.raises(ValidationPolicyError, match="unsupported command fields"):
        ValidationRunner(repository, config_path=config)


def test_validation_evidence_redacts_known_and_pattern_secrets(tmp_path: Path) -> None:
    repository = tmp_path / "repo"
    repository.mkdir()
    config = repository / "profiles.json"
    known = "known-secret-value-12345"
    token = "ghp_abcdefghijklmnopqrstuvwx"
    config.write_text(
        json.dumps(
            {
                "schema_version": "1.0.0",
                "profiles": {
                    "secret-output": {
                        "argv": [
                            sys.executable,
                            "-c",
                            f"import sys; print('{known}'); print('{token}', file=sys.stderr)",
                        ],
                        "working_directory": ".",
                    }
                },
            }
        ),
        encoding="utf-8",
    )
    evidence = repository / "evidence"
    report = ValidationRunner(
        repository,
        config_path=config,
        evidence_directory=evidence,
        environment={"PATH": "test", "API_SECRET": known},
    ).run("secret-output")
    persisted = "\n".join(path.read_text(encoding="utf-8") for path in evidence.iterdir())
    assert known not in report.stdout and token not in report.stderr
    assert known not in persisted and token not in persisted
    assert "[REDACTED]" in persisted
