# Implementation Plan: Autonomous Loop v2

**Branch**: `007-autonomous-loop` | **Date**: 2026-07-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/007-autonomous-loop/spec.md`

**Planning boundary**: This plan originally defined the future implementation. Implementation was subsequently authorized under `tasks.md`; this artifact still does not itself authorize commit, push, merge, deployment, or changes under `frontend/` or `backend/`.

**Implementation reconciliation (2026-07-13)**: The current tree implements a substantial safe local slice and isolated publication/recovery services, with some implementation filenames consolidated into `controller.py`, `lifecycle.py`, and flat tests rather than the planned module tree. [`reconciliation.md`](reconciliation.md) preserves those mappings and the remaining scope instead of rewriting this plan. The release remains blocked because the CLI does not compose push/Draft PR/checks, resume/stop and event recovery are incomplete, approved/committed schemas drift, and GitHub's Windows/Ubuntu workflow has not yet run.

## Summary

Build a deterministic local Python 3.11+ controller under `tools/studio_loop/` that converts one request into one isolated feature workflow and stops at a Draft PR ready for manual review. The controller owns state transitions, task scheduling, trusted validation, Git, `gh`, recovery, and policy. Planner, Implementer, Reviewer, and failure-only Debugger run as separate untrusted `codex exec` subprocesses whose final responses must satisfy role-specific JSON Schemas and semantic checks.

Committed policy and schema files live under `.studio-loop/`; disposable state, JSONL events, invocation artifacts, and locks live under ignored `.automation/state/`. Future feature tasks are canonical in `specs/<feature>/tasks.json`; `tasks.md` is a deterministic generated view. V1 runs tasks sequentially in one locked Git worktree per feature and exposes only `dry-run`, `local`, and `draft-pr`. It never merges or deploys.

## Technical Context

**Language/Version**: Python `>=3.11,<4` for the standalone controller. The controller is independent of the FastAPI backend and Angular frontend. Release validation on 2026-07-13 used Python 3.12.5; CI is configured for Python 3.11 on Windows and Ubuntu.

**Primary Dependencies**:

- Runtime: `pydantic>=2,<3` for typed internal boundary models; `jsonschema>=4.18,<5` with Draft 2020-12 for committed external schemas; Python 3.11 standard-library `tomllib`, `argparse`, `subprocess`, `pathlib`, `hashlib`, `json`, `logging`, `secrets`, and `os`. No `tomli` backport is required at the supported runtime floor.
- External executables: Git with required worktree and porcelain support; Codex CLI with `exec`, `--output-schema`, `--json`, `--output-last-message`, `--sandbox`, and `--ephemeral`; GitHub CLI `gh` for `draft-pr` mode.
- Development: `pytest`, `pytest-cov`, `hypothesis`, `ruff`, `mypy`, `pip-tools`, and type stubs only where required.
- Dependency ranges are constrained in `tools/studio_loop/pyproject.toml` and resolved with hashes into committed `tools/studio_loop/requirements.lock` during implementation. No dependency may add an agent framework, database, queue, web server, or shell-command DSL.

**Storage**:

- Durable source of truth: feature artifacts, Git refs/objects/trailers, expected/observed remote SHA, and GitHub Draft PR/check state.
- Committed policy: TOML plus JSON Schema under `.studio-loop/`.
- Rebuildable local cache: atomic JSON snapshots and append-only JSONL events under `.automation/state/<feature-id>/`.
- No database, queue, daemon, or cloud storage in V1.

**Testing**: `pytest` unit, contract, property, integration, recovery/fault-injection, and smoke suites. Real Git tests use temporary repositories and bare remotes; `codex` and `gh` are normally fake executables with deterministic fixtures. A separately marked opt-in end-to-end suite may use installed/authenticated CLIs but must never target production repositories.

**Target Platform**: Local Windows, macOS, and Linux developer workstations with Python 3.11+, Git, and Codex CLI. `draft-pr` additionally requires `gh` authenticated to the configured GitHub host. Paths, subprocess invocation, file locking, and atomic replacement must be cross-platform.

**Project Type**: A third, repository-local developer tool that orchestrates work on the existing separated web applications but is neither application runtime nor deployment infrastructure.

**Performance Goals**:

- Validate and select the next task for a 200-task local fixture with warm filesystem cache within 2 seconds on the reference minimum of 4 logical CPU cores, 8 GB RAM, and local SSD, excluding network and agent invocation.
- Status/dry-run reads SHOULD complete within 2 seconds excluding explicitly reported external CLI probes.
- Stream subprocess output without unbounded memory growth; enforce configured byte and time limits.
- Event append and snapshot persistence occur at each privileged-effect boundary before another task is dispatched.

**Constraints**:

- One request → one feature branch → one locked feature worktree → zero or one Draft PR.
- One writing task → one logical controller-created commit; read-only task → no commit.
- One executor may write at a time; V1 has no parallel task execution.
- Agents have no Git/GitHub/deployment authority and never receive secrets.
- Planner selects only named trusted validation/model profiles; no agent supplies arbitrary commands.
- Controller uses argument arrays with shell disabled for all privileged subprocesses.
- `tasks.json` is canonical for controller-managed future features. Feature 007 is the bootstrap specification and retains Spec Kit's human-authored `tasks.md` until the controller exists.
- `dry-run` is strictly read-only: it creates no feature/runtime file, lock, branch, worktree, commit, remote ref, or PR. Its number/identity proposal is advisory and must be revalidated under the repository lock when a mutating mode starts.
- Hooks/rules are defense in depth only; Stop hooks never continue the loop.
- Runtime cache loss must not prevent reconstruction or cause duplicate privileged effects.

**Scale/Scope**: One active controller writer per repository, one sequential feature execution per worktree, up to 200 tasks per feature, bounded attempts/output/log sizes, and one GitHub repository/host per feature. Multi-repository orchestration, forks, submodules, LFS-specific automation, parallel writers, server mode, GUI, auto-merge, and deployment are deferred.

## Constitution Check

*GATE: PASS before Phase 0; PASS after Phase 1 design.*

| Principle / gate | Pre-research | Post-design evidence |
|---|---|---|
| I. Business outcomes first | PASS | `spec.md` ties repeatable delivery to trust/service clarity; SC-001–SC-010 are measurable. |
| II. Production-ready engineering | PASS | Typed Python, schema contracts, lint/type/test gates, recovery tests, quickstart, and lock-file task are planned. |
| III. Simple MVP before complexity | PASS | File/event cache, sequential scheduler, CLI, and subprocesses are the smallest safe design; no DB, queue, daemon, agent framework, auto-merge, or deployment. |
| IV. Separated frontend/backend | PASS | Neither application is modified or coupled; controller is repository tooling with explicit boundaries. |
| V. Angular frontend | NOT APPLICABLE | No frontend behavior or source changes. |
| VI. FastAPI backend | NOT APPLICABLE | No backend endpoint or source changes. Python controller is not a backend service. |
| VII. Explicit API contracts | PASS | No HTTP API impact. Local public interfaces are documented as CLI, task/config/event/state, and role-output contracts. |
| VIII. Independent GCP deployment | PASS | No deployment change. Controller explicitly cannot deploy and does not alter either application artifact. |
| IX. Accessible, fast UX | PASS | No visitor UI; operator output is concise, machine-readable, and does not rely on color. Performance targets are explicit. |
| X. Clear structure/scripts/instructions | PASS | Exact repository layout, validation commands, quickstart, config reference, and future Polish-first skills are planned. |
| XI. Security/resilience | PASS | Secrets excluded/redacted; commands, paths, diffs, environment, network, Git, and GitHub effects are allowlisted and tested. |
| XII. Polish-first/i18n-ready | PASS | Operator docs/skills are Polish-first; identifiers/contracts remain language-neutral and allow English docs later. |

### Gate conclusions

- No constitution violation requires exception approval.
- The standalone tool is justified by the feature purpose and does not weaken frontend/backend separation.
- V1 persistence is local file/event evidence rather than prohibited application infrastructure.
- No API, GCP, CMS, authentication, application database, or visitor-content change exists.

## Design Decisions

Full alternatives and sources are captured in [research.md](research.md). The binding design is:

1. **Controller core**: explicit state machine and use-case services; no agent framework or implicit workflow engine.
2. **Boundaries**: port/adaptor interfaces for clock, IDs, filesystem, processes, Git, Codex, and GitHub make policy testable and fault-injectable.
3. **Contracts**: JSON Schema Draft 2020-12, `additionalProperties: false`, a required `schema_version`, separate role schemas, and controller-side semantic checks.
4. **State**: write-ahead effect intentions in an append-only JSONL log plus atomic snapshot projection; corrupted snapshots are disposable and rebuilt.
5. **Feature allocation**: repository lock plus rescan immediately before branch creation; no reliance on branch name alone.
6. **Isolation**: `git worktree list --porcelain -z`, non-forced add/lock/remove, canonical paths, and verified branch/HEAD/cleanliness.
7. **Scheduling**: validate DAG once on load; choose the earliest ready task by its stable canonical array index to remain deterministic.
8. **Commands**: fixed argument vectors, `shell=False`, controlled cwd/env/stdin/time/output/network, executable identity checks, and no command fragments from agents.
9. **Diff guard**: NUL-safe Git porcelain/raw parsing, pre/post snapshots, canonical path checks, submodule/symlink/protected-path rejection, and stage ownership checks.
10. **Commits**: stage only accepted paths, compare staged tree to accepted diff, verify parent/identity, commit with task trailers, then record observed SHA.
11. **GitHub**: controller pushes with explicit refspec and lease expectation; `gh pr list/view/create --json` reconciles one Draft PR; `gh pr checks --required --json` is polled by the controller rather than using `--watch` as state authority.
12. **Recovery**: reconcile artifacts → local Git/worktree → remote SHA → Draft PR/checks; ambiguity blocks and requests an operator decision.

## Lifecycle and Privileged-Effect Protocol

Every privileged or externally visible effect follows the same protocol:

1. Validate current state, mode capability, artifact digests, worktree identity, expected SHA, budgets, and policy.
2. Append and flush an `effect_intended` event with a deterministic idempotency key and redacted arguments.
3. Execute exactly one bounded adapter operation.
4. Observe the resulting filesystem/Git/GitHub fact independently of agent claims.
5. Append and flush `effect_succeeded`, `effect_failed`, or `effect_ambiguous` with evidence references.
6. Atomically replace the runtime snapshot derived from the event stream and durable facts.
7. Dispatch no next task until reconciliation proves the effect outcome.

Privileged effects are branch creation, worktree creation/removal, agent write invocation, validation command, staging, commit, push, Draft PR create/edit, and check observation that changes controller state. Merge, rebase, reset-hard, clean, PR-ready conversion, approval, and deployment have no adapter method in V1.

## Project Structure

### Documentation (this feature)

```text
specs/007-autonomous-loop/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── tasks.md
├── checklists/
│   └── requirements.md
└── contracts/
    ├── cli.md
    ├── state-machine.md
    ├── config.schema.json
    ├── tasks.schema.json
    ├── event.schema.json
    ├── runtime-snapshot.schema.json
    ├── planner-output.schema.json
    ├── implementer-output.schema.json
    ├── reviewer-output.schema.json
    └── debugger-output.schema.json
```

### Planned implementation (repository root)

```text
.studio-loop/
├── config.toml
├── models.toml
├── policies.toml
├── validations.toml
└── schemas/
    ├── config.schema.json
    ├── tasks.schema.json
    ├── event.schema.json
    ├── runtime-snapshot.schema.json
    └── agent/
        ├── planner-output.schema.json
        ├── implementer-output.schema.json
        ├── reviewer-output.schema.json
        └── debugger-output.schema.json

tools/studio_loop/
├── pyproject.toml
├── requirements.lock
├── README.md
├── src/studio_loop/
│   ├── __init__.py
│   ├── __main__.py
│   ├── cli.py
│   ├── errors.py
│   ├── models.py
│   ├── policy.py
│   ├── state_machine.py
│   ├── scheduler.py
│   ├── task_store.py
│   ├── task_renderer.py
│   ├── state_store.py
│   ├── events.py
│   ├── redaction.py
│   ├── paths.py
│   ├── diff_guard.py
│   ├── validation.py
│   ├── recovery.py
│   ├── loop.py
│   ├── ports/
│   │   ├── processes.py
│   │   ├── git.py
│   │   ├── codex.py
│   │   └── github.py
│   └── adapters/
│       ├── subprocesses.py
│       ├── git_cli.py
│       ├── codex_cli.py
│       └── gh_cli.py
└── tests/
    ├── unit/
    ├── contract/
    ├── property/
    ├── integration/
    ├── recovery/
    ├── smoke/
    └── fixtures/

.automation/state/                 # ignored; never committed
└── <feature-id>/
    ├── snapshot.json
    ├── events.jsonl
    ├── feature.lock
    ├── invocations/
    ├── command-output/
    └── quarantine/

.agents/skills/
├── studio-new-feature/SKILL.md
├── studio-status/SKILL.md
├── studio-resume/SKILL.md
└── studio-abort/SKILL.md

docs/
└── autonomous-loop-v2.md
```

**Structure Decision**: Add a self-contained Python tool and committed policy root. Do not place controller logic in `backend/`, because it is not an HTTP service and must not couple application deployment to repository automation. Do not change `frontend/` or `backend/` while implementing feature 007 unless the specification is explicitly amended.

**Complete module inventory**: In addition to the compact tree above, implementation tasks define these exact controller modules under `tools/studio_loop/src/studio_loop/`: `schema_validation.py`, `task_graph.py`, `config.py`, `preflight.py`, `locking.py`, `feature_numbering.py`, `worktrees.py`, `git_service.py`, `prompts.py`, `roles.py`, `artifacts.py`, `execution.py`, `review.py`, `debugging.py`, `retry.py`, `commits.py`, `publishing.py`, `pull_requests.py`, `checks.py`, `ci_repair.py`, `control.py`, and the `use_cases/` package for initialize, plan, status, resume, stop, abort, and events. Test-only directories additionally include `tests/golden/`, `tests/security/`, and `tests/docs/`. Defense/documentation delivery adds `.codex/hooks.json`, `.codex/rules/studio-loop.rules`, `.github/workflows/studio-loop-ci.yml`, and `docs/validation/studio-loop-usability.md`. These paths are planned outputs, not files to create during specification.

## Delivery Phases

1. Contract-first models, schemas, state/event store, and failure taxonomy.
2. Canonical task parser, graph validation, deterministic scheduler, and Markdown renderer.
3. CLI/configuration and environment/preflight diagnostics.
4. Feature numbering, branch/worktree isolation, and safe Git read/mutation service.
5. Codex role runner, profiles, sandboxes, output validation, and secret boundaries.
6. Sequential execution loop, path/diff guard, trusted validation, review, debug, and retry.
7. Controller-owned logical commits with trailers and crash recovery.
8. Explicit push, Draft PR reconciliation, required checks, and bounded CI repair.
9. Stop/abort/resume/rebuild, rules/hooks defense, user skills, and Polish-first docs.
10. Integration, fault injection, cross-platform checks, and final end-to-end smoke test.

Tasks MUST keep each phase independently testable and MUST not enable later privileged modes before their policy and recovery gates exist.

## Test Strategy and Quality Gates

- **Schema/contract**: validate every positive and negative fixture against the committed dialect; reject unknown properties/versions and test semantic validation separately.
- **Property**: arbitrary task graphs, paths, event truncation points, and state transitions; assert determinism, cycle rejection, path containment, and no illegal transition.
- **Git integration**: temporary repo + bare remote; dirty/untracked/rename/symlink/worktree conflicts, expected-parent commits, trailers, push lease, interruption before/after each mutation.
- **Codex contract**: fake executable records argv/env/stdin and emits fixture JSON/JSONL; assert separate processes, sandbox/profile flags, no secrets, timeout/output limits, and no agent Git authority.
- **GitHub contract**: fake `gh` for auth, PR list/view/create, and checks JSON; duplicate/reordered responses, missing checks, exit 8 pending, failures, lost responses, and unexpected head SHA.
- **Recovery**: remove/corrupt snapshot and truncate only the last incomplete event line; reconstruct from events/artifacts/Git/remote/PR without duplicate effects; block contradictory evidence.
- **Mode capability**: every command/action table-tested for dry-run/local/draft-pr; no code path or adapter method for merge/deployment.
- **Security**: malicious paths, symlinks, shell metacharacters, environment leaks, log/prompt secret canaries, forged agent evidence, and protected-file changes.
- **Cross-platform**: Windows and POSIX path/locking/subprocess behavior in CI; no shell-specific command composition.
- **Static gates**: Ruff format/check, MyPy strict for controller package, pytest with risk-based coverage thresholds, schema validation, generated-view drift check, and secret scan.

## Recovery Invariants

- Runtime snapshot is never sole evidence and may be deleted.
- A completed task requires accepted artifact digest, completed validations/review, one matching commit trailer/tree, and consistent event evidence.
- A published revision requires local commit reachability plus matching recorded and observed remote SHA.
- A Draft PR identity requires matching repository, base, head ref, draft status, and observed head SHA.
- If an intended effect lacks a conclusive result, resume queries the effect target before retrying.
- An effect is retried only when absence is proven or the operation is inherently idempotent under the same key.
- Any unexpected commit, remote movement, non-draft PR, missing artifact version, corrupt non-tail event, or conflicting identity yields `reconciliation_required`.

## Documentation and Skill Plan

- `docs/autonomous-loop-v2.md`: architecture, trust boundaries, modes, artifact authority, troubleshooting, and manual review boundary.
- `tools/studio_loop/README.md`: installation, supported CLI versions, commands, exit categories, configuration, and development/test workflow.
- Polish-first skills: start/initialize, status/inspect, resume/recover, and stop/abort. Skills invoke the controller CLI only; they never implement loop state or Git/GitHub effects themselves.
- Root `AGENTS.md` is intentionally not replaced during specification. Its future architecture update is a dedicated implementation task after controller rules and docs are testable.
- Stop hooks may request a safe stop only. No hook invokes `run`/`resume` automatically.

## Complexity Tracking

No constitution violations. The following complexity is essential and bounded:

| Design element | Why needed | Simpler alternative rejected because |
|---|---|---|
| Third repository-local tool | Git/Codex/GitHub orchestration is neither frontend nor backend runtime | Putting it in FastAPI would couple automation to deployment and expand attack surface. |
| JSONL event log + JSON snapshot | Crash-safe effect reconciliation and rebuildable status | Snapshot alone cannot distinguish an interrupted effect or prove idempotency. |
| Separate Git/Codex/GitHub adapters | Privilege containment and fault-injectable tests | Ad-hoc subprocess calls make allowlists and recovery inconsistent. |
| Multiple role schemas | Least authority and precise validation per role | A permissive common schema would accept fields/decisions irrelevant to a role. |

## Planning Completion

- Phase 0 research resolves all technical unknowns in [research.md](research.md).
- Phase 1 entities and transitions are defined in [data-model.md](data-model.md).
- CLI, state-machine, configuration, task, event, runtime, and role outputs are defined under [contracts/](contracts/).
- End-to-end validation scenarios and environment gaps are documented in [quickstart.md](quickstart.md).
- Agent context update script is absent in this Spec Kit installation. It was not recreated. Root `AGENTS.md` explicitly says the target architecture document will be generated later, so context update is deferred to a named implementation/documentation task.
- Constitution Check remains PASS after design.
