"""Narrow GitHub boundary; V1 is implemented by :mod:`gh_cli` only."""

from __future__ import annotations

from typing import Protocol


class GitHubPort(Protocol):
    def capability(self, *, owner: str, repository: str) -> object: ...
    def find_pull_requests(
        self, *, owner: str, repository: str, head: str, base: str
    ) -> tuple[object, ...]: ...
    def create_draft_pull_request(
        self, *, owner: str, repository: str, base: str, head: str, title: str, body_file: str
    ) -> object: ...
    def update_pull_request_body(
        self, *, owner: str, repository: str, number: int, body_file: str
    ) -> None: ...
    def checks(self, *, owner: str, repository: str, number: int) -> tuple[object, ...]: ...
