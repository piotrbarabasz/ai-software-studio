"""Bounded, shell-free subprocess boundary for controller-owned executions."""

from __future__ import annotations

import subprocess
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from pathlib import Path


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


class SubprocessExecutor:
    """Execute literal argv without a shell and cap retained process output."""

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
        try:
            process = subprocess.Popen(  # noqa: S603 - argv is controller-built, never a shell
                literal_argv,
                cwd=cwd,
                env=dict(environment),
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                shell=False,
            )
        except FileNotFoundError as error:
            raise ProcessExecutableNotFound(literal_argv[0]) from error

        try:
            stdout, stderr = process.communicate(input=stdin, timeout=timeout_seconds)
        except subprocess.TimeoutExpired:
            process.kill()
            stdout, stderr = process.communicate()
            return ProcessResult(
                argv=literal_argv,
                exit_code=None,
                stdout=stdout[:max_output_bytes],
                stderr=stderr[:max_output_bytes],
                timed_out=True,
                output_truncated=len(stdout) > max_output_bytes or len(stderr) > max_output_bytes,
            )

        return ProcessResult(
            argv=literal_argv,
            exit_code=process.returncode,
            stdout=stdout[:max_output_bytes],
            stderr=stderr[:max_output_bytes],
            output_truncated=len(stdout) > max_output_bytes or len(stderr) > max_output_bytes,
        )
