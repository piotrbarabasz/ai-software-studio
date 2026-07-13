from __future__ import annotations

import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

import pytest

import studio_loop.adapters.subprocesses as subprocess_adapter
from studio_loop.adapters.subprocesses import SubprocessExecutor, _merge_retained


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


def test_subprocess_executor_retains_stdout_before_timeout(tmp_path: Path) -> None:
    result = SubprocessExecutor().execute(
        [
            sys.executable,
            "-c",
            "import time; print('stdout-before-timeout', flush=True); time.sleep(10)",
        ],
        cwd=tmp_path,
        stdin=b"",
        environment={},
        timeout_seconds=1,
        max_output_bytes=4096,
    )
    assert result.timed_out is True
    assert result.stdout.replace(b"\r\n", b"\n") == b"stdout-before-timeout\n"


def test_subprocess_executor_retains_stderr_before_timeout(tmp_path: Path) -> None:
    result = SubprocessExecutor().execute(
        [
            sys.executable,
            "-c",
            "import sys,time; print('stderr-before-timeout', file=sys.stderr, flush=True); time.sleep(10)",
        ],
        cwd=tmp_path,
        stdin=b"",
        environment={},
        timeout_seconds=1,
        max_output_bytes=4096,
    )
    assert result.timed_out is True
    assert b"stderr-before-timeout" in result.stderr


@pytest.mark.skipif(
    os.name == "nt",
    reason="Windows process-tree termination does not guarantee delivery to Python signal handlers",
)
def test_subprocess_executor_retains_output_before_and_after_posix_termination_signal(
    tmp_path: Path,
) -> None:
    script = (
        "import signal,sys,time\n"
        "def stopped(*_args):\n"
        " print('stdout-after-signal', flush=True)\n"
        " print('stderr-after-signal', file=sys.stderr, flush=True)\n"
        " raise SystemExit(0)\n"
        "signal.signal(signal.SIGBREAK if hasattr(signal, 'SIGBREAK') else signal.SIGTERM, stopped)\n"
        "print('stdout-before-signal', flush=True)\n"
        "print('stderr-before-signal', file=sys.stderr, flush=True)\n"
        "time.sleep(10)\n"
    )
    result = SubprocessExecutor().execute(
        [sys.executable, "-c", script],
        cwd=tmp_path,
        stdin=b"",
        environment={},
        timeout_seconds=1,
        max_output_bytes=4096,
    )
    assert result.timed_out is True
    assert result.stdout.count(b"stdout-before-signal") == 1
    assert result.stdout.count(b"stdout-after-signal") == 1
    assert result.stderr.count(b"stderr-before-signal") == 1
    assert result.stderr.count(b"stderr-after-signal") == 1


def test_timeout_merges_exception_and_final_communicate_output_without_duplicates(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    class FakeProcess:
        returncode: int | None = None

        def __init__(self) -> None:
            self.communications = 0

        def communicate(self, **_kwargs: Any) -> tuple[bytes, bytes]:
            self.communications += 1
            if self.communications == 1:
                raise subprocess.TimeoutExpired(
                    cmd=("fake",),
                    timeout=1,
                    output=b"stdout-before\n",
                    stderr=b"stderr-before\n",
                )
            return b"stdout-before\nstdout-after\n", b"stderr-after\n"

    process = FakeProcess()
    monkeypatch.setattr(subprocess_adapter.subprocess, "Popen", lambda *_args, **_kwargs: process)
    executor = SubprocessExecutor()
    monkeypatch.setattr(executor, "_terminate_process_tree", lambda _process: None)

    result = executor.execute(
        ["fake"],
        cwd=tmp_path,
        stdin=b"",
        environment={},
        timeout_seconds=1,
        max_output_bytes=4096,
    )

    assert result.timed_out is True
    assert result.stdout == b"stdout-before\nstdout-after\n"
    assert result.stdout.count(b"stdout-before") == 1
    assert result.stderr == b"stderr-before\nstderr-after\n"


def test_subprocess_executor_caps_very_large_stdout_and_stderr(tmp_path: Path) -> None:
    result = SubprocessExecutor().execute(
        [
            sys.executable,
            "-c",
            "import sys,time; sys.stdout.write('o'*2000000); sys.stdout.flush(); "
            "sys.stderr.write('e'*2000000); sys.stderr.flush(); time.sleep(10)",
        ],
        cwd=tmp_path,
        stdin=b"",
        environment={},
        timeout_seconds=1,
        max_output_bytes=1024,
    )
    assert result.timed_out is True
    assert result.output_truncated is True
    assert result.stdout == b"o" * 1024
    assert result.stderr == b"e" * 1024


def test_subprocess_executor_process_finishing_before_timeout_is_not_timed_out(
    tmp_path: Path,
) -> None:
    result = SubprocessExecutor().execute(
        [sys.executable, "-c", "import time; time.sleep(0.1); print('done', flush=True)"],
        cwd=tmp_path,
        stdin=b"",
        environment={},
        timeout_seconds=1,
        max_output_bytes=4096,
    )
    assert result.exit_code == 0
    assert result.timed_out is False
    assert result.stdout.strip() == b"done"


def test_subprocess_executor_timeout_without_output_returns_bytes(tmp_path: Path) -> None:
    result = SubprocessExecutor().execute(
        [sys.executable, "-c", "import time; time.sleep(10)"],
        cwd=tmp_path,
        stdin=b"",
        environment={},
        timeout_seconds=1,
        max_output_bytes=4096,
    )
    assert result.timed_out is True
    assert result.stdout == b""
    assert result.stderr == b""
    assert result.output_truncated is False


def test_subprocess_executor_success_preserves_stdout_and_stderr(tmp_path: Path) -> None:
    result = SubprocessExecutor().execute(
        [
            sys.executable,
            "-c",
            "import sys; print('stdout-ok'); print('stderr-ok', file=sys.stderr)",
        ],
        cwd=tmp_path,
        stdin=b"",
        environment={},
        timeout_seconds=10,
        max_output_bytes=4096,
    )
    assert result.exit_code == 0
    assert result.timed_out is False
    assert result.output_truncated is False
    assert result.stdout.strip() == b"stdout-ok"
    assert result.stderr.strip() == b"stderr-ok"


def test_timeout_terminates_descendant_processes(tmp_path: Path) -> None:
    marker = tmp_path / "descendant-survived"
    child = "import pathlib,sys,time; time.sleep(2); pathlib.Path(sys.argv[1]).write_text('bad')"
    parent = (
        "import subprocess,sys,time; "
        f"subprocess.Popen([sys.executable, '-c', {child!r}, sys.argv[1]]); "
        "time.sleep(10)"
    )
    result = SubprocessExecutor().execute(
        [sys.executable, "-c", parent, str(marker)],
        cwd=tmp_path,
        stdin=b"",
        environment={},
        timeout_seconds=1,
        max_output_bytes=4096,
    )
    assert result.timed_out is True
    time.sleep(2.25)
    assert not marker.exists()


def test_timeout_output_merge_deduplicates_complete_and_remainder_captures() -> None:
    complete, complete_truncated = _merge_retained(b"before", b"before-after", 100)
    remainder, remainder_truncated = _merge_retained(b"before-", b"after", 100)
    capped, capped_truncated = _merge_retained(b"before-", b"after", 5)

    assert complete == b"before-after"
    assert complete_truncated is False
    assert remainder == b"before-after"
    assert remainder_truncated is False
    assert capped == b"befor"
    assert capped_truncated is True
