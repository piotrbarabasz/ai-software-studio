"""Bounded, shell-free subprocess boundary for controller-owned executions."""

from __future__ import annotations

import os
import signal
import subprocess
import tempfile
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

_TERMINATION_GRACE_SECONDS = 0.75
_FINAL_COMMUNICATE_SECONDS = 5.0
_MAX_OVERLAP_SCAN_BYTES = 65_536


class _BinaryCapture(Protocol):
    def flush(self) -> None: ...

    def seek(self, offset: int, whence: int = 0) -> int: ...

    def read(self, size: int = -1) -> bytes: ...


@dataclass(frozen=True)
class ProcessResult:
    argv: tuple[str, ...]
    exit_code: int | None
    stdout: bytes
    stderr: bytes
    timed_out: bool = False
    output_truncated: bool = False


class ProcessExecutableNotFound(FileNotFoundError):
    """Raised when the configured executable cannot be started."""


def _bytes(value: bytes | str | None) -> bytes:
    if value is None:
        return b""
    return value if isinstance(value, bytes) else value.encode("utf-8", errors="replace")


def _suffix_prefix_overlap(first: bytes, second: bytes) -> int:
    """Return the longest retained suffix/prefix overlap in linear time."""

    length = min(len(first), len(second), _MAX_OVERLAP_SCAN_BYTES)
    if length == 0:
        return 0
    pattern = second[:length]
    prefix = [0] * len(pattern)
    matched = 0
    for index in range(1, len(pattern)):
        while matched and pattern[index] != pattern[matched]:
            matched = prefix[matched - 1]
        if pattern[index] == pattern[matched]:
            matched += 1
        prefix[index] = matched
    matched = 0
    retained_tail = first[-length:]
    for index, byte in enumerate(retained_tail):
        while matched and byte != pattern[matched]:
            matched = prefix[matched - 1]
        if byte == pattern[matched]:
            matched += 1
            if matched == len(pattern):
                if index == len(retained_tail) - 1:
                    return matched
                matched = prefix[matched - 1]
    return matched


def _merge_retained(
    partial: bytes | str | None,
    final: bytes | str | None,
    max_output_bytes: int,
) -> tuple[bytes, bool]:
    """Merge timeout/final capture without duplicate prefixes and cap retention."""

    first = _bytes(partial)
    second = _bytes(final)
    if max_output_bytes == 0:
        return b"", bool(first or second)

    # Work only on a bounded prefix so combining the timeout and final captures
    # never duplicates more than the configured cap in memory.
    bounded_first = first[:max_output_bytes]
    bounded_second = second[:max_output_bytes]
    if second.startswith(first):
        retained_source = bounded_second
        merged_length = len(second)
    elif first.startswith(second):
        retained_source = bounded_first
        merged_length = len(first)
    else:
        overlap = _suffix_prefix_overlap(bounded_first, bounded_second)
        remaining = max_output_bytes - len(bounded_first)
        retained_source = bounded_first + bounded_second[overlap : overlap + max(0, remaining)]
        merged_length = len(first) + len(second) - overlap
    return retained_source[:max_output_bytes], merged_length > max_output_bytes


def _read_capture(stream: _BinaryCapture, max_output_bytes: int) -> tuple[bytes, bool]:
    stream.flush()
    stream.seek(0)
    captured = stream.read(max_output_bytes + 1)
    return captured[:max_output_bytes], len(captured) > max_output_bytes


class SubprocessExecutor:
    """Execute literal argv without a shell and cap retained process output."""

    @staticmethod
    def _kill_process_group(process_id: int, signal_number: int) -> None:
        killpg = getattr(os, "killpg", None)
        if killpg is None:
            raise OSError("process groups are unavailable on this platform")
        killpg(process_id, signal_number)

    @staticmethod
    def _force_process_tree(process: subprocess.Popen[bytes]) -> None:
        if os.name == "nt":
            try:
                subprocess.run(  # noqa: S603 - fixed Windows process-tree command
                    ["taskkill.exe", "/PID", str(process.pid), "/T", "/F"],
                    stdin=subprocess.DEVNULL,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    timeout=2,
                    shell=False,
                    check=False,
                )
            except (FileNotFoundError, subprocess.TimeoutExpired):
                pass
        else:
            try:
                SubprocessExecutor._kill_process_group(
                    process.pid, getattr(signal, "SIGKILL", signal.SIGTERM)
                )
            except (ProcessLookupError, PermissionError):
                pass
        if process.poll() is None:
            try:
                process.kill()
            except OSError:
                pass

    def _terminate_process_tree(self, process: subprocess.Popen[bytes]) -> None:
        if process.poll() is not None:
            return
        try:
            if os.name == "nt":
                process.send_signal(signal.CTRL_BREAK_EVENT)
            else:
                self._kill_process_group(process.pid, signal.SIGTERM)
        except (OSError, ProcessLookupError, PermissionError, ValueError):
            try:
                process.terminate()
            except OSError:
                pass
        try:
            process.wait(timeout=_TERMINATION_GRACE_SECONDS)
        except subprocess.TimeoutExpired:
            pass
        # Always follow with a tree-aware hard stop. The parent may have handled
        # the graceful signal while a descendant still owns an inherited pipe.
        self._force_process_tree(process)

    def _final_communicate(
        self,
        process: subprocess.Popen[bytes],
        max_output_bytes: int,
    ) -> tuple[bytes, bytes, bool]:
        try:
            stdout, stderr = process.communicate(timeout=_FINAL_COMMUNICATE_SECONDS)
            return _bytes(stdout), _bytes(stderr), False
        except subprocess.TimeoutExpired as error:
            partial_stdout = _bytes(error.stdout)
            partial_stderr = _bytes(error.stderr)
            self._force_process_tree(process)
            try:
                stdout, stderr = process.communicate(timeout=_FINAL_COMMUNICATE_SECONDS)
            except subprocess.TimeoutExpired as final_error:
                self._force_process_tree(process)
                stdout = _bytes(final_error.stdout)
                stderr = _bytes(final_error.stderr)
                for stream in (process.stdout, process.stderr):
                    if stream is not None:
                        stream.close()
            merged_stdout, stdout_truncated = _merge_retained(
                partial_stdout, stdout, max_output_bytes
            )
            merged_stderr, stderr_truncated = _merge_retained(
                partial_stderr, stderr, max_output_bytes
            )
            return merged_stdout, merged_stderr, stdout_truncated or stderr_truncated

    def execute(
        self,
        argv: Sequence[str],
        *,
        cwd: Path,
        stdin: bytes,
        environment: Mapping[str, str],
        timeout_seconds: int,
        max_output_bytes: int,
    ) -> ProcessResult:
        literal_argv = tuple(str(item) for item in argv)
        if max_output_bytes < 0:
            raise ValueError("max_output_bytes must be non-negative")
        with (
            tempfile.TemporaryFile(mode="w+b") as stdout_capture,
            tempfile.TemporaryFile(mode="w+b") as stderr_capture,
        ):
            try:
                process = subprocess.Popen(  # noqa: S603 - argv is controller-built, never a shell
                    literal_argv,
                    cwd=cwd,
                    env=dict(environment),
                    stdin=subprocess.PIPE,
                    stdout=stdout_capture,
                    stderr=stderr_capture,
                    shell=False,
                    creationflags=(subprocess.CREATE_NEW_PROCESS_GROUP if os.name == "nt" else 0),
                    start_new_session=os.name != "nt",
                )
            except FileNotFoundError as error:
                raise ProcessExecutableNotFound(literal_argv[0]) from error

            try:
                communicated_stdout, communicated_stderr = process.communicate(
                    input=stdin, timeout=timeout_seconds
                )
            except subprocess.TimeoutExpired as error:
                partial_stdout = _bytes(error.stdout)
                partial_stderr = _bytes(error.stderr)
                self._terminate_process_tree(process)
                final_stdout, final_stderr, final_truncated = self._final_communicate(
                    process, max_output_bytes
                )
                captured_stdout, captured_stdout_truncated = _read_capture(
                    stdout_capture, max_output_bytes
                )
                captured_stderr, captured_stderr_truncated = _read_capture(
                    stderr_capture, max_output_bytes
                )
                final_stdout, stdout_capture_merge_truncated = _merge_retained(
                    final_stdout, captured_stdout, max_output_bytes
                )
                final_stderr, stderr_capture_merge_truncated = _merge_retained(
                    final_stderr, captured_stderr, max_output_bytes
                )
                stdout, stdout_truncated = _merge_retained(
                    partial_stdout, final_stdout, max_output_bytes
                )
                stderr, stderr_truncated = _merge_retained(
                    partial_stderr, final_stderr, max_output_bytes
                )
                return ProcessResult(
                    argv=literal_argv,
                    exit_code=None,
                    stdout=stdout,
                    stderr=stderr,
                    timed_out=True,
                    output_truncated=(
                        final_truncated
                        or captured_stdout_truncated
                        or captured_stderr_truncated
                        or stdout_capture_merge_truncated
                        or stderr_capture_merge_truncated
                        or stdout_truncated
                        or stderr_truncated
                    ),
                )

            captured_stdout, captured_stdout_truncated = _read_capture(
                stdout_capture, max_output_bytes
            )
            captured_stderr, captured_stderr_truncated = _read_capture(
                stderr_capture, max_output_bytes
            )
            retained_stdout, stdout_truncated = _merge_retained(
                communicated_stdout, captured_stdout, max_output_bytes
            )
            retained_stderr, stderr_truncated = _merge_retained(
                communicated_stderr, captured_stderr, max_output_bytes
            )
            return ProcessResult(
                argv=literal_argv,
                exit_code=process.returncode,
                stdout=retained_stdout,
                stderr=retained_stderr,
                output_truncated=(
                    captured_stdout_truncated
                    or captured_stderr_truncated
                    or stdout_truncated
                    or stderr_truncated
                ),
            )
