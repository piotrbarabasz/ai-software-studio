from __future__ import annotations

import sys
from pathlib import Path

from studio_loop.adapters.subprocesses import SubprocessExecutor


def test_subprocess_executor_passes_metacharacters_literally_without_shell(tmp_path: Path) -> None:
    marker = tmp_path / "must not exist"
    literal = f"value;touch {marker}"
    result = SubprocessExecutor().execute(
        [sys.executable, "-c", "import sys; print(sys.argv[1])", literal],
        cwd=tmp_path,
        stdin=b"",
        environment={},
        timeout_seconds=10,
        max_output_bytes=4096,
    )
    assert result.exit_code == 0
    assert result.stdout.decode().strip() == literal
    assert not marker.exists()


def test_subprocess_executor_reports_timeout_and_caps_retained_output(tmp_path: Path) -> None:
    result = SubprocessExecutor().execute(
        [sys.executable, "-c", "import time; print('x' * 10000, flush=True); time.sleep(5)"],
        cwd=tmp_path,
        stdin=b"",
        environment={},
        timeout_seconds=1,
        max_output_bytes=100,
    )
    assert result.timed_out is True
    assert result.output_truncated is True
    assert len(result.stdout) == 100
