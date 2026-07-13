"""Bounded current-head CI observation; never uses `gh --watch`."""

from __future__ import annotations

import time
from collections.abc import Callable
from dataclasses import dataclass
from enum import StrEnum
from typing import Protocol

from .adapters.gh_cli import Check, PullRequest


class CheckState(StrEnum):
    PENDING = "pending"
    PASSED = "passed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    SKIPPED = "skipped"
    MISSING = "missing"
    TIMEOUT = "timeout"


@dataclass(frozen=True)
class CheckObservation:
    head_sha: str
    state: CheckState
    checks: tuple[Check, ...]
    diagnostics: tuple[str, ...] = ()


class _CheckTransport(Protocol):
    def find_pull_requests(
        self, *, owner: str, repository: str, head: str, base: str
    ) -> tuple[PullRequest, ...]: ...
    def checks(self, *, owner: str, repository: str, number: int) -> tuple[Check, ...]: ...


def _normalise(value: str) -> CheckState:
    state = value.casefold().replace(" ", "_")
    if state in {"success", "passed", "pass"}:
        return CheckState.PASSED
    if state in {"failure", "failed", "error", "timed_out", "timeout"}:
        return CheckState.FAILED
    if state in {"cancelled", "canceled"}:
        return CheckState.CANCELLED
    if state in {"skipped", "neutral"}:
        return CheckState.SKIPPED
    return CheckState.PENDING


class CiObserver:
    def __init__(
        self,
        github: _CheckTransport,
        *,
        clock: Callable[[], float] = time.monotonic,
        sleep: Callable[[float], None] = time.sleep,
    ) -> None:
        self.github, self.clock, self.sleep = github, clock, sleep

    def observe_once(
        self,
        *,
        owner: str,
        repository: str,
        pull_request: PullRequest,
        expected_head_sha: str,
        required: tuple[str, ...],
    ) -> CheckObservation:
        current, diagnostic = self._current_pull_request(
            owner=owner,
            repository=repository,
            pull_request=pull_request,
            expected_head_sha=expected_head_sha,
        )
        if current is None:
            return CheckObservation(expected_head_sha, CheckState.MISSING, (), (diagnostic,))
        if not required:
            return CheckObservation(
                expected_head_sha,
                CheckState.MISSING,
                (),
                ("required check policy is empty",),
            )
        if current.head_sha != expected_head_sha:
            return CheckObservation(
                expected_head_sha, CheckState.MISSING, (), ("PR head SHA is stale",)
            )
        checks = tuple(
            self.github.checks(owner=owner, repository=repository, number=current.number)
        )
        after, diagnostic = self._current_pull_request(
            owner=owner,
            repository=repository,
            pull_request=current,
            expected_head_sha=expected_head_sha,
        )
        if after is None:
            return CheckObservation(expected_head_sha, CheckState.MISSING, (), (diagnostic,))
        if not checks:
            return CheckObservation(
                expected_head_sha,
                CheckState.MISSING,
                (),
                ("no checks reported for current head SHA",),
            )
        names = [check.name for check in checks]
        duplicates = sorted({name for name in names if names.count(name) > 1})
        if duplicates:
            return CheckObservation(
                expected_head_sha,
                CheckState.MISSING,
                (),
                tuple(f"duplicate required check identity: {name}" for name in duplicates),
            )
        by_name = {check.name: check for check in checks}
        missing = tuple(name for name in required if name not in by_name)
        selected = tuple(by_name[name] for name in required if name in by_name)
        states = tuple(_normalise(check.state) for check in selected)
        if missing:
            return CheckObservation(
                expected_head_sha,
                CheckState.MISSING,
                selected,
                tuple(f"missing required check: {name}" for name in missing),
            )
        if any(state is CheckState.FAILED for state in states):
            return CheckObservation(expected_head_sha, CheckState.FAILED, selected)
        if any(state is CheckState.CANCELLED for state in states):
            return CheckObservation(expected_head_sha, CheckState.CANCELLED, selected)
        if any(state is CheckState.SKIPPED for state in states):
            return CheckObservation(expected_head_sha, CheckState.SKIPPED, selected)
        if any(state is CheckState.PENDING for state in states):
            return CheckObservation(expected_head_sha, CheckState.PENDING, selected)
        return CheckObservation(expected_head_sha, CheckState.PASSED, selected)

    def _current_pull_request(
        self,
        *,
        owner: str,
        repository: str,
        pull_request: PullRequest,
        expected_head_sha: str,
    ) -> tuple[PullRequest | None, str]:
        items = self.github.find_pull_requests(
            owner=owner,
            repository=repository,
            head=pull_request.head_ref,
            base=pull_request.base_ref,
        )
        if len(items) != 1:
            return None, "current Draft PR identity is missing or ambiguous"
        current = items[0]
        if (
            current.number != pull_request.number
            or not current.is_draft
            or current.state.casefold() != "open"
            or current.head_sha != expected_head_sha
        ):
            return None, "PR identity or head SHA changed while observing checks"
        return current, ""

    def poll(
        self,
        *,
        owner: str,
        repository: str,
        pull_request: PullRequest,
        expected_head_sha: str,
        required: tuple[str, ...],
        interval_seconds: float,
        timeout_seconds: float,
        interrupted: Callable[[], bool] = lambda: False,
    ) -> CheckObservation:
        started = self.clock()
        while True:
            if interrupted():
                return CheckObservation(
                    expected_head_sha, CheckState.CANCELLED, (), ("CI polling interrupted",)
                )
            result = self.observe_once(
                owner=owner,
                repository=repository,
                pull_request=pull_request,
                expected_head_sha=expected_head_sha,
                required=required,
            )
            if result.state is not CheckState.PENDING:
                return result
            if self.clock() - started >= timeout_seconds:
                return CheckObservation(
                    expected_head_sha, CheckState.TIMEOUT, result.checks, ("CI polling timeout",)
                )
            self.sleep(max(0.001, interval_seconds))
