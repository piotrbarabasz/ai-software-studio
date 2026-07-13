"""Non-interactive CLI for the safe local feature lifecycle slice."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Never, cast

from .adapters.gh_cli import GhCli
from .adapters.git_cli import GitCli
from .errors import EXIT_CODES, CommandError, ExitCategory
from .feature_numbering import FeatureProposal, FeatureService
from .git_service import GitService
from .locking import RepositoryLock
from .models import FEATURE_ID
from .recovery import RecoveryService
from .task_graph import TaskGraph
from .task_renderer import render_tasks
from .validation_runner import ValidationPolicyError, ValidationRunner
from .worktrees import WorktreeService

CONTRACT_VERSION = "1.0.0"
MODES = ("dry-run", "local", "draft-pr")


class StudioArgumentParser(argparse.ArgumentParser):
    """Turn parser failures into the same stable contract as command failures."""

    def error(self, message: str) -> Never:
        raise CommandError("INVALID_ARGUMENTS", message, ExitCategory.USAGE)


def _response(
    *,
    ok: bool,
    category: str,
    feature_id: str | None = None,
    mode: str | None = None,
    state: str | None = None,
    effects: list[str] | None = None,
    next_action: str | None = None,
    diagnostics: list[dict[str, Any]] | None = None,
    data: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return {
        "contract_version": CONTRACT_VERSION,
        "ok": ok,
        "exit_category": category,
        "feature_id": feature_id,
        "run_id": None,
        "feature_state": state,
        "mode": mode,
        "effects_performed": effects or [],
        "next_safe_action": next_action,
        "diagnostics": diagnostics or [],
        "data": data or {},
    }


def _diagnostic(error: CommandError) -> dict[str, Any]:
    return {
        "code": error.code,
        "category": error.category,
        "summary": error.summary,
        "retryable": False,
        "evidence": [],
    }


def _emit(payload: dict[str, Any], *, json_output: bool) -> None:
    if json_output:
        print(json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(",", ":")))
        return
    label = "OK" if payload["ok"] else "ERROR"
    print(f"{label} [{payload['exit_category']}]")
    for diagnostic in payload["diagnostics"]:
        print(f"{diagnostic['code']}: {diagnostic['summary']}", file=sys.stderr)
    for key, value in payload["data"].items():
        print(f"{key}: {value}")


def _repository(path: str | None) -> GitCli:
    return GitCli.discover(Path(path or Path.cwd()))


def _feature_metadata_path(git: GitCli, feature_id: str) -> Path:
    if not FEATURE_ID.fullmatch(feature_id):
        raise CommandError(
            "FEATURE_ID_INVALID", "feature must match NNN-safe-slug", ExitCategory.USAGE
        )
    for record in git.worktrees():
        if record.branch == feature_id:
            candidate = record.path / "specs" / feature_id / "feature.json"
            if candidate.exists():
                return candidate
    local = git.repository_root() / "specs" / feature_id / "feature.json"
    if local.exists():
        return local
    raise CommandError(
        "FEATURE_NOT_FOUND", f"feature metadata not found: {feature_id}", ExitCategory.PREFLIGHT
    )


def _validate_metadata(path: Path, feature_id: str) -> dict[str, Any]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise CommandError(
            "FEATURE_METADATA_INVALID", "feature.json is unreadable", ExitCategory.RECONCILIATION
        ) from error
    required = {
        "feature_id",
        "number",
        "slug",
        "branch",
        "directory",
        "base_branch",
        "base_sha",
        "request_sha256",
    }
    if set(payload) != required or payload["feature_id"] != feature_id:
        raise CommandError(
            "FEATURE_METADATA_INVALID",
            "feature.json has an unsupported shape",
            ExitCategory.RECONCILIATION,
        )
    number = payload.get("number")
    slug = payload.get("slug")
    base_branch = payload.get("base_branch")
    base_sha = payload.get("base_sha")
    request_sha = payload.get("request_sha256")
    if (
        not isinstance(number, int)
        or isinstance(number, bool)
        or not 1 <= number <= 999
        or not isinstance(slug, str)
        or re.fullmatch(r"[a-z0-9][a-z0-9-]{0,62}", slug) is None
        or not isinstance(base_branch, str)
        or not base_branch
        or base_branch in {feature_id, "HEAD"}
        or not isinstance(base_sha, str)
        or re.fullmatch(r"[0-9a-f]{40,64}", base_sha) is None
        or not isinstance(request_sha, str)
        or re.fullmatch(r"[0-9a-f]{64}", request_sha) is None
    ):
        raise CommandError(
            "FEATURE_METADATA_INVALID",
            "feature.json contains invalid identity or digest fields",
            ExitCategory.RECONCILIATION,
        )
    expected = f"{number:03d}-{slug}"
    if (
        expected != feature_id
        or payload["branch"] != feature_id
        or payload["directory"] != f"specs/{feature_id}"
    ):
        raise CommandError(
            "FEATURE_IDENTITY_MISMATCH",
            "number, slug, branch and directory must agree",
            ExitCategory.RECONCILIATION,
        )
    return cast(dict[str, Any], payload)


def _proposed_data(
    proposal: FeatureProposal, worktree_root: Path, base_branch: str, base_sha: str
) -> dict[str, Any]:
    return {
        "number": proposal.number,
        "slug": proposal.slug,
        "feature_id": proposal.feature_id,
        "branch": proposal.branch,
        "directory": proposal.directory,
        "worktree": str((worktree_root / proposal.branch).resolve()),
        "base_branch": base_branch,
        "base_sha": base_sha,
        "evidence_numbers": list(proposal.evidence_numbers),
        "planned_effects": ["create_branch", "create_worktree", "write_feature_metadata"],
    }


def _github_identity(git: GitCli) -> tuple[str, str]:
    url = git.remote_url("origin")
    match = re.fullmatch(r"(?:git@)?github\.com(?::|/)([^/\s]+)/([^/\s]+?)(?:\.git)?", url)
    if match is None:
        raise CommandError(
            "GITHUB_REMOTE_INVALID",
            "origin must identify a GitHub owner/repository",
            ExitCategory.PREFLIGHT,
        )
    return match.group(1), match.group(2)


def _draft_pr_preflight(git: GitCli) -> tuple[str, str]:
    owner, repository = _github_identity(git)
    capability = GhCli(git.repository_root()).capability(owner=owner, repository=repository)
    if not capability.available:
        raise CommandError("GH_NOT_FOUND", "GitHub CLI gh is not available", ExitCategory.PREFLIGHT)
    if not capability.authenticated:
        raise CommandError(
            "GH_AUTH_REQUIRED",
            "GitHub CLI authentication is required for draft-pr",
            ExitCategory.PREFLIGHT,
        )
    if capability.owner != owner or capability.repository != repository:
        raise CommandError(
            "GH_PERMISSION_DENIED",
            capability.detail or "GitHub access is insufficient",
            ExitCategory.PREFLIGHT,
        )
    return owner, repository


def start(arguments: argparse.Namespace) -> dict[str, Any]:
    git = _repository(arguments.repo)
    if arguments.mode == "draft-pr":
        _draft_pr_preflight(git)
    request = Path(arguments.request_file).read_bytes()
    if not request:
        raise CommandError("EMPTY_REQUEST", "request file must not be empty", ExitCategory.USAGE)
    service = FeatureService(git.repository_root(), git)
    slug = arguments.slug or Path(arguments.request_file).stem
    proposal = service.propose(slug)
    worktrees = WorktreeService(git.repository_root(), git)
    root = (
        Path(arguments.worktree_root).resolve()
        if arguments.worktree_root
        else worktrees.default_base_directory()
    )
    base_ref = arguments.base or git.current_branch()
    base_sha = git.resolve_commit(base_ref)
    data = _proposed_data(proposal, root, base_ref, base_sha)
    if arguments.mode == "dry-run":
        return _response(
            ok=True,
            category=ExitCategory.SUCCESS,
            feature_id=proposal.feature_id,
            mode=arguments.mode,
            state="proposed",
            next_action="start --mode local",
            data=data,
        )
    with RepositoryLock.for_repository(git.repository_root(), name="initialization"):
        if not git.is_clean():
            raise CommandError(
                "SOURCE_WORKTREE_DIRTY",
                "source worktree must be clean before local initialization",
                ExitCategory.POLICY,
            )
        # The dry-run proposal is advisory. Recompute under the exclusive lock so
        # two initializers can never claim the same feature number.
        proposal = service.propose(slug)
        base_sha = git.resolve_commit(base_ref)
        data = _proposed_data(proposal, root, base_ref, base_sha)
        service.ensure_available(proposal)
        git.create_branch(proposal.branch, base_sha)
        result = worktrees.ensure(proposal.branch, base_directory=root, expected_head_sha=base_sha)
        metadata_path = result.path / proposal.directory / "feature.json"
        metadata_path.parent.mkdir(parents=True, exist_ok=False)
        metadata = {
            "feature_id": proposal.feature_id,
            "number": proposal.number,
            "slug": proposal.slug,
            "branch": proposal.branch,
            "directory": proposal.directory,
            "base_branch": base_ref,
            "base_sha": base_sha,
            "request_sha256": hashlib.sha256(request).hexdigest(),
        }
        metadata_path.write_text(
            json.dumps(metadata, sort_keys=True, indent=2) + "\n", encoding="utf-8"
        )
    data["worktree"] = str(result.path)
    return _response(
        ok=True,
        category=ExitCategory.SUCCESS,
        feature_id=proposal.feature_id,
        mode=arguments.mode,
        state="initialized",
        effects=["branch_created", "worktree_created", "feature_metadata_written"],
        next_action="plan",
        data=data,
    )


def status(arguments: argparse.Namespace) -> dict[str, Any]:
    git = _repository(arguments.repo)
    metadata_path = _feature_metadata_path(git, arguments.feature)
    metadata = _validate_metadata(metadata_path, arguments.feature)
    if arguments.rebuild:
        worktree = metadata_path.parents[2]
        recovered = RecoveryService(GitService(worktree)).rebuild(
            feature_metadata=metadata_path,
            tasks_path=metadata_path.parent / "tasks.json",
            runtime_state=None,
        )
        return _response(
            ok=recovered.state != "BLOCKED",
            category=ExitCategory.SUCCESS
            if recovered.state != "BLOCKED"
            else ExitCategory.RECONCILIATION,
            feature_id=arguments.feature,
            mode="local",
            state=recovered.state,
            next_action="resume"
            if recovered.state != "BLOCKED"
            else "resolve reconciliation blocker",
            diagnostics=[]
            if recovered.reason is None
            else [
                {
                    "code": "RECOVERY_BLOCKED",
                    "category": ExitCategory.RECONCILIATION,
                    "summary": recovered.reason,
                    "retryable": False,
                    "evidence": [],
                }
            ],
            data={
                "metadata": metadata,
                "local_sha": recovered.local_sha,
                "remote_sha": recovered.remote_sha,
            },
        )
    return _response(
        ok=True,
        category=ExitCategory.SUCCESS,
        feature_id=arguments.feature,
        mode="local",
        state="initialized",
        next_action="resume",
        data={"metadata": metadata},
    )


def resume(arguments: argparse.Namespace) -> dict[str, Any]:
    git = _repository(arguments.repo)
    _validate_metadata(_feature_metadata_path(git, arguments.feature), arguments.feature)
    mode = arguments.mode or "local"
    if mode == "draft-pr":
        if not arguments.allow_mode_upgrade:
            raise CommandError(
                "MODE_UPGRADE_REQUIRES_FLAG",
                "draft-pr resume requires --allow-mode-upgrade",
                ExitCategory.POLICY,
            )
        _draft_pr_preflight(git)
    return _response(
        ok=True,
        category=ExitCategory.SUCCESS,
        feature_id=arguments.feature,
        mode=mode,
        state="initialized",
        next_action="planner is not implemented; no executor was started",
    )


def abort(arguments: argparse.Namespace) -> dict[str, Any]:
    git = _repository(arguments.repo)
    path = _feature_metadata_path(git, arguments.feature)
    _validate_metadata(path, arguments.feature)
    marker = path.parents[2] / ".automation" / "state" / arguments.feature / "abort.json"
    marker.parent.mkdir(parents=True, exist_ok=True)
    marker.write_text(
        json.dumps(
            {
                "feature_id": arguments.feature,
                "reason": arguments.reason,
                "aborted_at": datetime.now(UTC).isoformat(),
            }
        )
        + "\n",
        encoding="utf-8",
    )
    return _response(
        ok=True,
        category=ExitCategory.SUCCESS,
        feature_id=arguments.feature,
        mode="local",
        state="aborted",
        effects=["abort_recorded"],
        next_action="worktree and branch were preserved",
    )


def validate(arguments: argparse.Namespace) -> dict[str, Any]:
    git = _repository(arguments.repo)
    path = _feature_metadata_path(git, arguments.feature)
    metadata = _validate_metadata(path, arguments.feature)
    tasks_path = path.parent / "tasks.json"
    if not tasks_path.is_file():
        raise CommandError(
            "TASKS_NOT_FOUND", "canonical tasks.json was not found", ExitCategory.PREFLIGHT
        )
    from .models import TaskCollection

    try:
        collection = TaskCollection.model_validate_json(tasks_path.read_text(encoding="utf-8"))
        graph = TaskGraph(collection)
        ValidationRunner(path.parents[2]).ensure_known(
            tuple(task.validation_profile for task in collection.tasks)
        )
    except ValidationPolicyError as error:
        raise CommandError("TASK_PROFILE_INVALID", str(error), ExitCategory.POLICY) from error
    except Exception as error:
        raise CommandError(
            "TASKS_INVALID",
            "canonical tasks.json failed structural or graph validation",
            ExitCategory.POLICY,
        ) from error
    view_path = path.parent / "tasks.md"
    if view_path.exists() and view_path.read_text(encoding="utf-8") != render_tasks(collection):
        raise CommandError(
            "TASKS_DRIFT",
            "generated tasks.md differs from canonical tasks.json",
            ExitCategory.POLICY,
        )
    return _response(
        ok=True,
        category=ExitCategory.SUCCESS,
        feature_id=arguments.feature,
        mode="local",
        state="validated",
        next_action="render-tasks --check",
        data={
            "metadata": metadata,
            "tasks": len(collection.tasks),
            "topological_order": list(graph.topological_order),
        },
    )


def render(arguments: argparse.Namespace) -> dict[str, Any]:
    git = _repository(arguments.repo)
    metadata_path = _feature_metadata_path(git, arguments.feature)
    _validate_metadata(metadata_path, arguments.feature)
    directory = metadata_path.parent
    task_source = directory / "tasks.json"
    if not task_source.exists():
        raise CommandError(
            "TASKS_NOT_FOUND", "canonical tasks.json was not found", ExitCategory.PREFLIGHT
        )
    from .models import TaskCollection

    try:
        collection = TaskCollection.model_validate_json(task_source.read_text(encoding="utf-8"))
    except Exception as error:
        raise CommandError(
            "TASKS_INVALID", "canonical tasks.json failed validation", ExitCategory.POLICY
        ) from error
    rendered = render_tasks(collection)
    output = directory / "tasks.md"
    current = output.read_text(encoding="utf-8") if output.exists() else None
    if arguments.check:
        if current != rendered:
            raise CommandError(
                "TASKS_DRIFT",
                "generated tasks.md differs from canonical tasks.json",
                ExitCategory.POLICY,
            )
        effects: list[str] = []
    else:
        output.write_text(rendered, encoding="utf-8")
        effects = ["tasks_rendered"]
    return _response(
        ok=True,
        category=ExitCategory.SUCCESS,
        feature_id=arguments.feature,
        mode="local",
        state="validated",
        effects=effects,
        next_action="resume",
        data={"tasks_path": str(output)},
    )


def build_parser() -> argparse.ArgumentParser:
    parser = StudioArgumentParser(prog="studio-loop", allow_abbrev=False)
    parser.add_argument("--repo")
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--no-color", action="store_true")
    commands = parser.add_subparsers(
        dest="command", required=True, parser_class=StudioArgumentParser
    )
    for command in ("start", "init"):
        sub = commands.add_parser(command, allow_abbrev=False)
        sub.add_argument("--request-file", required=True)
        sub.add_argument("--slug")
        sub.add_argument("--base")
        sub.add_argument("--mode", choices=MODES, default="dry-run")
        sub.add_argument("--worktree-root")
    for command in ("status", "resume", "abort", "validate", "validate-tasks", "render-tasks"):
        sub = commands.add_parser(command, allow_abbrev=False)
        sub.add_argument("--feature", required=True)
        if command == "resume":
            sub.add_argument("--mode", choices=MODES)
            sub.add_argument("--allow-mode-upgrade", action="store_true")
        if command == "status":
            sub.add_argument("--rebuild", action="store_true")
        if command == "abort":
            sub.add_argument("--reason", required=True)
        if command == "render-tasks":
            sub.add_argument("--check", action="store_true")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    raw_args = list(sys.argv[1:] if argv is None else argv)
    json_output = "--json" in raw_args
    try:
        # argparse accepts global options before subcommands.  Operators naturally
        # put them last, so normalize only these harmless presentation/repository flags.
        globals_before: list[str] = []
        normalized: list[str] = []
        index = 0
        while index < len(raw_args):
            value = raw_args[index]
            if value in {"--json", "--no-color"}:
                globals_before.append(value)
            elif value == "--repo":
                if index + 1 >= len(raw_args):
                    raise CommandError("MISSING_REPO", "--repo requires a path", ExitCategory.USAGE)
                globals_before.extend([value, raw_args[index + 1]])
                index += 1
            else:
                normalized.append(value)
            index += 1
        arguments = parser.parse_args([*globals_before, *normalized])
        handlers = {
            "start": start,
            "init": start,
            "status": status,
            "resume": resume,
            "abort": abort,
            "validate": validate,
            "validate-tasks": validate,
            "render-tasks": render,
        }
        payload = handlers[arguments.command](arguments)
    except CommandError as error:
        payload = _response(ok=False, category=error.category, diagnostics=[_diagnostic(error)])
    except OSError as error:
        command_error = CommandError("IO_ERROR", str(error), ExitCategory.EXTERNAL)
        payload = _response(
            ok=False, category=command_error.category, diagnostics=[_diagnostic(command_error)]
        )
    _emit(payload, json_output=json_output)
    return EXIT_CODES[payload["exit_category"]]
