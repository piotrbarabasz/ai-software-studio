from __future__ import annotations

import os
import subprocess
from pathlib import Path

import pytest

from studio_loop.write_surface import WriteSurfaceGuard


def _symlink_or_skip(target: Path, link: Path, *, directory: bool) -> None:
    try:
        os.symlink(target, link, target_is_directory=directory)
    except OSError as error:
        kind = "directory" if directory else "file"
        pytest.skip(f"{kind} symlink creation is unavailable on this platform: {error}")


def _remove_link(link: Path) -> None:
    if link.is_symlink():
        link.unlink()
    elif link.exists():
        os.rmdir(link)


def test_file_symlink_outside_worktree_is_rejected(tmp_path: Path) -> None:
    worktree = tmp_path / "worktree"
    worktree.mkdir()
    outside = tmp_path / "outside.txt"
    outside.write_text("outside\n", encoding="utf-8")
    _symlink_or_skip(outside, worktree / "file-link", directory=False)

    assessment = WriteSurfaceGuard(worktree).assess(("file-link",))

    assert assessment.passed is False
    assert "symlink or reparse point" in " ".join(assessment.violations)
    assert outside.read_text(encoding="utf-8") == "outside\n"


def test_directory_symlink_outside_worktree_is_rejected(tmp_path: Path) -> None:
    worktree = tmp_path / "worktree"
    worktree.mkdir()
    outside = tmp_path / "outside"
    outside.mkdir()
    _symlink_or_skip(outside, worktree / "directory-link", directory=True)

    assessment = WriteSurfaceGuard(worktree).assess(("directory-link/new.txt",))

    assert assessment.passed is False
    assert "outside the active worktree" in " ".join(assessment.violations)


def test_symlink_that_resolves_inside_worktree_is_allowed(tmp_path: Path) -> None:
    worktree = tmp_path / "worktree"
    target = worktree / "real"
    target.mkdir(parents=True)
    _symlink_or_skip(target, worktree / "internal-link", directory=True)

    assessment = WriteSurfaceGuard(worktree).assess(("internal-link/new.txt",))

    assert assessment.passed is True
    assert assessment.normalized_paths == ("internal-link/new.txt",)


def test_nested_symlink_escape_is_rejected(tmp_path: Path) -> None:
    worktree = tmp_path / "worktree"
    nested = worktree / "nested"
    nested.mkdir(parents=True)
    outside = tmp_path / "outside"
    outside.mkdir()
    _symlink_or_skip(outside, nested / "link", directory=True)

    assessment = WriteSurfaceGuard(worktree).assess(("nested/link/new.txt",))

    assert assessment.passed is False
    assert "nested/link/new.txt" in " ".join(assessment.violations)


@pytest.mark.parametrize(
    "path",
    ["../outside.txt", "safe/../../outside.txt", "safe/./file.txt", "."],
)
def test_path_traversal_is_rejected(tmp_path: Path, path: str) -> None:
    worktree = tmp_path / "worktree"
    worktree.mkdir()

    assessment = WriteSurfaceGuard(worktree).assess((path,))

    assert assessment.passed is False
    assert "traversal" in " ".join(assessment.violations)


@pytest.mark.parametrize(
    "path",
    ["/tmp/outside.txt", "C:/outside.txt", r"C:\\outside.txt", "//server/share/file.txt"],
)
def test_absolute_path_is_rejected(tmp_path: Path, path: str) -> None:
    worktree = tmp_path / "worktree"
    worktree.mkdir()

    assessment = WriteSurfaceGuard(worktree).assess((path,))

    assert assessment.passed is False
    assert "repository-relative" in " ".join(assessment.violations)


@pytest.mark.skipif(os.name != "nt", reason="Windows junctions are Windows-specific")
def test_windows_junction_outside_worktree_is_rejected(tmp_path: Path) -> None:
    worktree = tmp_path / "worktree"
    worktree.mkdir()
    outside = tmp_path / "outside"
    outside.mkdir()
    junction = worktree / "junction"
    created = subprocess.run(
        ["cmd.exe", "/d", "/c", "mklink", "/J", str(junction), str(outside)],
        text=True,
        capture_output=True,
        shell=False,
        check=False,
    )
    if created.returncode != 0:
        pytest.skip(f"Windows junction creation is unavailable: {created.stderr.strip()}")

    try:
        assessment = WriteSurfaceGuard(worktree).assess(("junction/new.txt",))
        assert assessment.passed is False
        assert "reparse point" in " ".join(assessment.violations)
    finally:
        _remove_link(junction)


def test_missing_symlink_privilege_skips_only_symlink_fixture(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    worktree = tmp_path / "worktree"
    worktree.mkdir()

    def unavailable(*_args: object, **_kwargs: object) -> None:
        raise OSError("simulated missing symlink privilege")

    monkeypatch.setattr(os, "symlink", unavailable)
    with pytest.raises(pytest.skip.Exception, match="symlink creation is unavailable"):
        _symlink_or_skip(tmp_path / "target", worktree / "link", directory=False)

    traversal = WriteSurfaceGuard(worktree).assess(("../outside.txt",))
    assert traversal.passed is False
