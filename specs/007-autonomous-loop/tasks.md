# Tasks: Autonomous Loop v2

**Input**: Design artifacts in `specs/007-autonomous-loop/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`  
**Bootstrap note**: This feature predates the controller, so this Spec Kit `tasks.md` is the implementation plan. Once implemented, `tasks.json` becomes canonical for future features and `tasks.md` is generated. This document is specification, not runtime state.

**Release reconciliation (2026-07-13)**: Per-task implementation/test/blocker evidence is recorded in [`reconciliation.md`](reconciliation.md). Checkboxes below were evaluated individually; partial implementation and passing partial tests do not satisfy a task's complete `Done when` contract.

**Execution rule**: Tasks are dependency-ordered and V1 work is sequential. Only one executor may write at a time. No task authorizes commit, push, merge, rebase, reset-hard, clean, or deployment during the current specification phase.

## Task record format

Each checklist line follows `[ID] [Story?] outcome with exact paths`. Its metadata is mandatory:

- **Depends on**: prerequisite task IDs or `None`.
- **Writes**: whether implementation changes repository files.
- **Requirements**: mapped `spec.md` functional requirement IDs.
- **Done when**: concrete completion criteria.
- **Tests**: required verification, even for documentation/policy tasks.

## Phase 1: Package and contract setup

**Purpose**: Establish the independent Python tool without touching application source.

- [X] T001 Scaffold the standalone Python package in `tools/studio_loop/pyproject.toml`, `tools/studio_loop/src/studio_loop/__init__.py`, and `tools/studio_loop/src/studio_loop/__main__.py`
  - **Depends on**: None
  - **Writes**: Yes
  - **Requirements**: FR-047, FR-057, FR-058
  - **Done when**: The initial scaffold requires Python 3.11+, has a console/module entrypoint, introduces no controller behavior in this task, and has no dependency on `frontend/`/`backend/`.
  - **Tests**: `tools/studio_loop/tests/contract/test_package_metadata.py` verifies interpreter bounds, entrypoint import, and source-tree isolation.

- [ ] T002 Configure pinned runtime/dev dependency ranges and quality tools in `tools/studio_loop/pyproject.toml`, `tools/studio_loop/requirements.lock`, and `tools/studio_loop/README.md`
  - **Depends on**: T001
  - **Writes**: Yes
  - **Requirements**: FR-057, FR-060
  - **Done when**: Pydantic v2, jsonschema Draft 2020-12 support, pytest, Hypothesis, Ruff, MyPy, pip-tools, and coverage commands are declared; a hashed lock resolves them with no DB/queue/agent-framework dependency.
  - **Tests**: Package metadata test asserts dependency families/ranges and `pip-compile --generate-hashes` produces no lock drift; clean-environment locked install/import is exercised in CI later by T073.

- [ ] T003 Add committed configuration skeletons in `.studio-loop/config.toml`, `.studio-loop/models.toml`, `.studio-loop/policies.toml`, and `.studio-loop/validations.toml`
  - **Depends on**: T001
  - **Writes**: Yes
  - **Requirements**: FR-002, FR-024, FR-029, FR-034, FR-045, FR-047, FR-060
  - **Done when**: Only `dry-run`, `local`, and `draft-pr` capabilities exist; role/model/validation/budget/check policies are named; no secret or arbitrary shell field is present.
  - **Tests**: `tools/studio_loop/tests/contract/test_committed_config.py` parses all TOML and asserts forbidden capabilities/fields are absent.

- [ ] T004 Reserve ignored runtime and protected control paths in `.gitignore` and `.studio-loop/policies.toml`
  - **Depends on**: T003
  - **Writes**: Yes
  - **Requirements**: FR-026, FR-047, FR-048, FR-053
  - **Done when**: `.automation/state/` is ignored; `.git`, `.studio-loop`, controller schemas, and runtime/secret paths have explicit protection semantics; unrelated ignore rules remain unchanged.
  - **Tests**: `tools/studio_loop/tests/contract/test_repository_layout.py` invokes `git check-ignore` on runtime fixtures and asserts committed control files are not ignored.

- [ ] T005 Copy and version the approved schemas in `.studio-loop/schemas/` from `specs/007-autonomous-loop/contracts/*.schema.json`
  - **Depends on**: T003
  - **Writes**: Yes
  - **Requirements**: FR-013, FR-021, FR-047, FR-060
  - **Done when**: Config, task, event, snapshot, and four role schemas have stable IDs/versions, closed objects, and an explicit documented source relationship to the approved contracts.
  - **Tests**: `tools/studio_loop/tests/contract/test_schema_metaschema.py` validates every file against Draft 2020-12 and checks unique `$id` values.

**Checkpoint**: Standalone package/config/schema boundaries exist; no runtime behavior is enabled.

---

## Phase 2: Data models, JSON Schema, and state store

**Purpose**: Implement typed boundaries and crash-safe, rebuildable local state before any orchestration.

- [ ] T006 Implement versioned configuration, feature, artifact, and evidence models in `tools/studio_loop/src/studio_loop/models.py`
  - **Depends on**: T002, T005
  - **Writes**: Yes
  - **Requirements**: FR-012, FR-014, FR-022, FR-047, FR-060
  - **Done when**: Models reject unknown fields/versions, canonicalize identifiers/digests, distinguish durable evidence from cached projections, and serialize deterministically.
  - **Tests**: `tools/studio_loop/tests/unit/test_models.py` covers positive/negative boundaries, canonical serialization, and version rejection.

- [ ] T007 Implement feature, run, task, attempt, invocation, effect, and transition enums/invariants in `tools/studio_loop/src/studio_loop/state_machine.py`
  - **Depends on**: T006
  - **Writes**: Yes
  - **Requirements**: FR-001, FR-003, FR-005, FR-006, FR-018, FR-034, FR-049, FR-051
  - **Done when**: Only transitions from `contracts/state-machine.md` exist, one active task is enforced, budgets cannot reset, and merge/deployment states are unrepresentable.
  - **Tests**: `tools/studio_loop/tests/property/test_state_machine.py` enumerates legal transitions and proves every illegal/terminal transition is rejected.

- [ ] T008 Implement schema loading plus structural and semantic validation in `tools/studio_loop/src/studio_loop/schema_validation.py`
  - **Depends on**: T005, T006
  - **Writes**: Yes
  - **Requirements**: FR-015, FR-021, FR-022, FR-060
  - **Done when**: Schemas self-validate once, instances have size/duplicate-key/version checks, formats are supplemented by domain validators, and errors are stable/redacted.
  - **Tests**: `tools/studio_loop/tests/contract/test_schema_validation.py` covers every accepted/rejected fixture and unknown schema/version/property.

- [ ] T009 Implement append-only event writing, digest chaining, flush, and tail validation in `tools/studio_loop/src/studio_loop/events.py` and `tools/studio_loop/src/studio_loop/state_store.py`
  - **Depends on**: T006, T007, T008
  - **Writes**: Yes
  - **Requirements**: FR-034, FR-049, FR-052, FR-053
  - **Done when**: Sequences/digests are enforced, writes flush before effects advance, one incomplete tail can be quarantined, and complete/middle corruption fails closed.
  - **Tests**: `tools/studio_loop/tests/recovery/test_event_journal.py` injects truncation/corruption at every byte boundary and verifies the documented repair rule.

- [ ] T010 Implement atomic snapshot projection and replay in `tools/studio_loop/src/studio_loop/state_store.py` and `tools/studio_loop/src/studio_loop/recovery.py`
  - **Depends on**: T009
  - **Writes**: Yes
  - **Requirements**: FR-048, FR-049, FR-050
  - **Done when**: Snapshot replacement is same-directory/atomic, never adds unsupported facts, deletion/corruption triggers replay, and evidence conflicts produce reconciliation-required.
  - **Tests**: `tools/studio_loop/tests/recovery/test_snapshot_rebuild.py` covers interrupted temp writes, stale snapshots, event replay, and conflicting digests.

- [ ] T011 Complete state-model contract fixtures and invariant tests in `tools/studio_loop/tests/contract/fixtures/` and `tools/studio_loop/tests/property/test_state_invariants.py`
  - **Depends on**: T007, T008, T009, T010
  - **Writes**: Yes
  - **Requirements**: FR-005, FR-021, FR-048, FR-049, FR-050, FR-052, FR-060
  - **Done when**: Every entity/state/effect enum has positive and negative fixtures and property tests prove one-writer, monotonic budget, digest-chain, and snapshot-derivation invariants.
  - **Tests**: Run the contract/property/recovery files created in T006-T011 with 100 randomized examples per property minimum.

**Checkpoint**: Local state is inspectable, versioned, crash-aware, and explicitly non-authoritative.

---

## Phase 3: Task parser, dependency graph, scheduler, and renderer

**Purpose**: Establish `tasks.json` authority and deterministic sequential selection.

- [ ] T012 Implement canonical task parsing and semantic validation in `tools/studio_loop/src/studio_loop/task_store.py`
  - **Depends on**: T008
  - **Writes**: Yes
  - **Requirements**: FR-013, FR-014, FR-015, FR-026
  - **Done when**: Duplicate IDs/keys, unknown requirements/profiles, invalid write/path declarations, unsupported versions, and over-200 task sets fail before scheduling.
  - **Tests**: `tools/studio_loop/tests/unit/test_task_store.py` covers every rejection and canonical digest stability.

- [ ] T013 Implement dependency graph construction and cycle/missing-edge validation in `tools/studio_loop/src/studio_loop/task_graph.py`
  - **Depends on**: T012
  - **Writes**: Yes
  - **Requirements**: FR-015, FR-017, FR-018
  - **Done when**: Graph/reverse graph are deterministic; self/missing/cyclic dependencies and invalid dependent states fail with exact task IDs.
  - **Tests**: `tools/studio_loop/tests/property/test_task_graph.py` generates DAGs/cycles and verifies stable topology and complete cycle diagnostics.

- [ ] T014 Implement the sequential ready-task scheduler in `tools/studio_loop/src/studio_loop/scheduler.py`
  - **Depends on**: T007, T013
  - **Writes**: Yes
  - **Requirements**: FR-006, FR-017, FR-018, SC-007
  - **Done when**: Same graph/state returns the same zero/one task, only completed dependencies unlock work, and blocked/failed/aborted dependencies never do.
  - **Tests**: `tools/studio_loop/tests/unit/test_scheduler.py` covers ties, no-ready, failure propagation, stop flag, and 200-task selection under two seconds.

- [ ] T015 Implement deterministic `tasks.md` rendering and drift checks in `tools/studio_loop/src/studio_loop/task_renderer.py`
  - **Depends on**: T012, T013
  - **Writes**: Yes
  - **Requirements**: FR-013, FR-016
  - **Done when**: View includes warning/schema/generator/source digest, all canonical fields, coverage/counts, stable order, and check mode never writes.
  - **Tests**: `tools/studio_loop/tests/golden/test_task_renderer.py` uses golden output, round-field comparison, repeat rendering, and intentional manual drift.

- [ ] T016 Add graph/parser/scheduler/renderer integration tests in `tools/studio_loop/tests/integration/test_task_pipeline.py`
  - **Depends on**: T012, T013, T014, T015
  - **Writes**: Yes
  - **Requirements**: FR-013, FR-014, FR-015, FR-016, FR-017, FR-018, SC-003
  - **Done when**: A valid 200-task fixture parses/renders/schedules deterministically and every malformed fixture blocks before an executor starts.
  - **Tests**: The new integration suite runs twice and asserts identical digests/order/output apart from no allowed variable fields.

**Checkpoint**: Canonical task artifacts and a deterministic sequential scheduler are independently usable.

---

## Phase 4: CLI and committed configuration

**Purpose**: Expose safe, stable operator commands and prerequisite diagnostics.

- [ ] T017 Implement TOML loading, cross-file references, capability narrowing, and configuration digest in `tools/studio_loop/src/studio_loop/config.py`
  - **Depends on**: T003, T006, T008
  - **Writes**: Yes
  - **Requirements**: FR-002, FR-024, FR-029, FR-034, FR-045, FR-047, FR-060
  - **Done when**: Parsed config validates against schema plus mode/role/profile semantics, cannot add forbidden capability, and produces one stable digest.
  - **Tests**: `tools/studio_loop/tests/unit/test_config.py` covers references, mode truth table, unsafe command fields, digest stability, and version mismatch.

- [ ] T018 Implement version/tool/repository/auth preflight diagnostics in `tools/studio_loop/src/studio_loop/preflight.py`
  - **Depends on**: T017
  - **Writes**: Yes
  - **Requirements**: FR-002, FR-010, FR-042, FR-057, FR-059
  - **Done when**: Python/Git/Codex flags, ignored state, writable safe roots, and mode-specific `gh` presence/auth are classified without unintended mutation.
  - **Tests**: `tools/studio_loop/tests/unit/test_preflight.py` fakes missing/old tools, absent `gh`, wrong repo, unsafe roots, and verifies all safe diagnostics are reported.

- [ ] T019 Implement the CLI parser, stable exits, human/JSON output, and dry-run capability table in `tools/studio_loop/src/studio_loop/cli.py` and `tools/studio_loop/src/studio_loop/errors.py`
  - **Depends on**: T014, T015, T017, T018
  - **Writes**: Yes
  - **Requirements**: FR-002, FR-003, FR-004, FR-011, FR-051, FR-059
  - **Done when**: Commands/flags match `contracts/cli.md`, no merge/deploy command exists, JSON is closed/stable, output is noninteractive/color-independent, and dry-run performs no declared effect.
  - **Tests**: `tools/studio_loop/tests/contract/test_cli.py` covers every command/flag/exit category, invalid mode, non-TTY output, and absence of forbidden commands.

- [ ] T020 Add CLI/config/preflight end-to-end contract fixtures in `tools/studio_loop/tests/integration/test_cli_preflight.py`
  - **Depends on**: T017, T018, T019
  - **Writes**: Yes
  - **Requirements**: FR-002, FR-011, FR-024, FR-029, FR-042, FR-057, FR-059, FR-060
  - **Done when**: Dry-run/local work without `gh`, draft-pr fails precisely without it, unsupported Python/config/schema fail before mutation, and stdout/stderr contain no canary secrets.
  - **Tests**: Invoke the module in subprocess fixtures and assert filesystem/Git snapshots are unchanged for all failing/dry-run cases.

**Checkpoint**: Operator can validate configuration and see safe plans, but no feature mutation exists yet.

---

## Phase 5: User Story 1 — Feature numbering, branch, and worktree

**Goal**: Safely initialize one uniquely numbered isolated feature without changing unrelated work.

**Independent Test**: Initialize dry-run/local fixtures with competing number allocation, existing branches/worktrees, and unrelated changes; verify exact proposal or blocker and zero overwrite.

- [ ] T021 [US1] Implement repository/feature locks and sequential number allocation in `tools/studio_loop/src/studio_loop/locking.py` and `tools/studio_loop/src/studio_loop/feature_numbering.py`
  - **Depends on**: T009, T017, T018
  - **Writes**: Yes
  - **Requirements**: FR-001, FR-007, FR-010
  - **Done when**: Lock + rescan covers specs/local/remote branch evidence, reserves the lowest unused three-digit number, rejects stale ambiguity, and never relies on time alone.
  - **Tests**: `tools/studio_loop/tests/integration/test_feature_numbering.py` races two processes and verifies one winner/one exact conflict with no duplicate number.

- [ ] T022 [US1] Implement safe branch inspection and non-forced creation in `tools/studio_loop/src/studio_loop/adapters/git_cli.py` and `tools/studio_loop/src/studio_loop/ports/git.py`
  - **Depends on**: T021
  - **Writes**: Yes
  - **Requirements**: FR-008, FR-010, FR-038
  - **Done when**: Controller uses explicit argv, verifies repository/base/ref ownership, creates one branch at expected SHA, and exposes no rebase/reset/clean/merge method.
  - **Tests**: `tools/studio_loop/tests/integration/test_branch_service.py` covers existing local/remote refs, invalid names, unexpected base SHA, dirty main tree, and forbidden-method absence.

- [ ] T023 [US1] Implement linked worktree create/lock/verify/remove-safe operations in `tools/studio_loop/src/studio_loop/worktrees.py` and `tools/studio_loop/src/studio_loop/adapters/git_cli.py`
  - **Depends on**: T022
  - **Writes**: Yes
  - **Requirements**: FR-009, FR-010, FR-026, FR-051
  - **Done when**: Porcelain `-z` parsing verifies canonical parent/path/branch/HEAD/lock/cleanliness, rejects symlink/submodule/prunable conflicts, and never uses force.
  - **Tests**: `tools/studio_loop/tests/integration/test_worktrees.py` covers spaces/unicode, wrong branch, missing path, dirty tree, symlink escape, lock, and non-forced removal refusal.

- [ ] T024 [US1] Implement `init` dry-run/local orchestration in `tools/studio_loop/src/studio_loop/use_cases/initialize.py` and `tools/studio_loop/src/studio_loop/cli.py`
  - **Depends on**: T019, T021, T022, T023
  - **Writes**: Yes
  - **Requirements**: FR-001, FR-002, FR-007, FR-008, FR-009, FR-010, FR-011
  - **Done when**: One request maps to one identity, dry-run lists but performs no effects, local creates only verified branch/worktree/runtime evidence, and the operator's current branch/unrelated changes remain untouched.
  - **Tests**: `tools/studio_loop/tests/integration/test_initialize.py` compares full repository snapshots across dry-run/blockers and verifies exact local-mode effects.

- [ ] T025 [US1] Complete initialization acceptance and recovery-boundary tests in `tools/studio_loop/tests/integration/test_initialize_acceptance.py`
  - **Depends on**: T021, T022, T023, T024
  - **Writes**: Yes
  - **Requirements**: FR-001, FR-007, FR-008, FR-009, FR-010, FR-011, FR-049, FR-050
  - **Done when**: User Story 1 initialization scenarios and every branch/worktree intention crash point pass without duplicate/overwrite and ambiguous evidence blocks.
  - **Tests**: Run acceptance suite against temporary repo plus bare remote on Windows/POSIX path fixtures.

**Checkpoint**: US1 can safely allocate and isolate a feature; application files remain untouched.

---

## Phase 6: Safe Git read/mutation service

**Purpose**: Centralize all Git facts and allowed controller-only mutations before agent execution.

- [ ] T026 Implement NUL-safe Git repository/status/diff/ref/trailer readers in `tools/studio_loop/src/studio_loop/adapters/git_cli.py`
  - **Depends on**: T022, T023
  - **Writes**: Yes
  - **Requirements**: FR-027, FR-033, FR-041, FR-048
  - **Done when**: Typed observations cover staged/unstaged/untracked/rename/delete/mode/symlink/worktree/ref/commit evidence without locale or whitespace ambiguity.
  - **Tests**: `tools/studio_loop/tests/integration/test_git_observations.py` exercises unusual names, every change kind, staged ownership, detached HEAD, and trailers.

- [ ] T027 Implement the allowlisted Git mutation facade in `tools/studio_loop/src/studio_loop/git_service.py`
  - **Depends on**: T007, T009, T026
  - **Writes**: Yes
  - **Requirements**: FR-003, FR-038, FR-041, FR-049
  - **Done when**: Only explicitly planned branch/worktree/stage/commit/push methods exist, each uses intention/observation protocol, and forbidden Git verbs/refspecs are structurally unavailable.
  - **Tests**: `tools/studio_loop/tests/unit/test_git_service_policy.py` table-tests state/mode/effect authorization and introspects the public facade for forbidden methods.

- [ ] T028 Add safe Git fault-injection integration tests in `tools/studio_loop/tests/recovery/test_git_effects.py`
  - **Depends on**: T026, T027
  - **Writes**: Yes
  - **Requirements**: FR-003, FR-027, FR-033, FR-038, FR-041, FR-048, FR-049, FR-050
  - **Done when**: Failures/lost responses before and after each permitted Git effect reconcile correctly and never touch unrelated index/worktree state.
  - **Tests**: Temporary repo tests assert expected parent/ref/tree after each injected boundary and exact reconciliation-required cases.

**Checkpoint**: All future Git use must pass through one policy/evidence boundary.

---

## Phase 7: Codex runner and four roles

**Purpose**: Invoke untrusted roles as separate, least-privileged, schema-bound processes.

- [ ] T029 Implement bounded shell-free subprocess execution and redacted capture in `tools/studio_loop/src/studio_loop/adapters/subprocesses.py` and `tools/studio_loop/src/studio_loop/redaction.py`
  - **Depends on**: T009, T017
  - **Writes**: Yes
  - **Requirements**: FR-025, FR-030, FR-053
  - **Done when**: Argv/cwd/env/stdin/time/output/network policy is explicit, streams are bounded, canaries are removed before persistence, and no `shell=True` path exists.
  - **Tests**: `tools/studio_loop/tests/security/test_process_runner.py` injects metacharacters, env secrets, timeout, oversized output, child processes, and verifies literal argv/redaction.
  - **Hardening evidence (2026-07-13)**: `tools/studio_loop/tests/test_process_runner.py` verifies partial stdout/stderr retention across timeout, final-capture deduplication, output caps, child-process termination, empty/large/near-timeout/success cases, and literal argv with `shell=False`. The broader task remains open until its planned security-suite path and full validation/network/redaction matrix are complete.

- [ ] T030 Implement Codex CLI adapter with fresh ephemeral structured invocations in `tools/studio_loop/src/studio_loop/adapters/codex_cli.py` and `tools/studio_loop/src/studio_loop/ports/codex.py`
  - **Depends on**: T008, T029
  - **Writes**: Yes
  - **Requirements**: FR-019, FR-020, FR-021, FR-023, FR-025, SC-006
  - **Done when**: Each call has explicit role/profile/sandbox/cwd/schema/JSONL/last-message path, uses stdin, never resumes sessions, and validates size/JSON/schema/identity before return.
  - **Tests**: `tools/studio_loop/tests/contract/test_codex_adapter.py` uses a fake executable to assert argv/env/process separation and rejects malformed/extra/mismatched/oversized outputs.

- [ ] T031 Implement role-specific bounded context and semantic validators in `tools/studio_loop/src/studio_loop/roles.py` and `tools/studio_loop/src/studio_loop/prompts.py`
  - **Depends on**: T006, T008, T017, T030
  - **Writes**: Yes
  - **Requirements**: FR-019, FR-020, FR-022, FR-023, FR-024, FR-025, FR-035
  - **Done when**: Planner/Implementer/Reviewer/Debugger receive only allowed context, IDs/paths/decisions are cross-checked, Reviewer is read-only, and Debugger requires same-task recorded failure.
  - **Tests**: `tools/studio_loop/tests/unit/test_roles.py` covers role capability matrix, forged IDs/evidence, profile injection, hidden conversation/session reuse, and debugger precondition.

- [ ] T032 Add role isolation, schema, sandbox, and secret-canary integration tests in `tools/studio_loop/tests/integration/test_codex_roles.py`
  - **Depends on**: T029, T030, T031
  - **Writes**: Yes
  - **Requirements**: FR-019, FR-020, FR-021, FR-022, FR-023, FR-024, FR-025, FR-035, FR-053
  - **Done when**: Four fake role processes cannot share session state, mutate Git/GitHub, escape paths, select arbitrary model flags, or leak canaries; Debugger runs only after injected failure.
  - **Tests**: Run all role fixtures and compare process/evidence logs to the expected capability matrix.

**Checkpoint**: Roles can propose bounded results but own no workflow or privileged effect.

---

## Phase 8: User Story 1 — Specification and canonical task generation

**Goal**: Generate recoverable feature artifacts and validated canonical tasks in the isolated worktree.

**Independent Test**: A fake Planner creates allowed artifacts/tasks; malformed, drifting, or out-of-path output blocks with no commit/push.

- [ ] T033 [US1] Implement authoritative artifact inventory, digesting, and request sanitization in `tools/studio_loop/src/studio_loop/artifacts.py`
  - **Depends on**: T006, T012, T015, T023
  - **Writes**: Yes
  - **Requirements**: FR-012, FR-013, FR-023, FR-048, FR-053
  - **Done when**: Required artifacts/digests are explicit, raw request/conversation is not runtime authority/log content, and future task JSON/Markdown authority is enforced.
  - **Tests**: `tools/studio_loop/tests/unit/test_artifacts.py` covers missing/changed/unsupported artifacts, digest aggregation, request canaries, and Markdown drift.

- [ ] T034 [US1] Implement Planner artifact generation and validation use case in `tools/studio_loop/src/studio_loop/use_cases/plan_feature.py`
  - **Depends on**: T024, T031, T033
  - **Writes**: Yes
  - **Requirements**: FR-012, FR-013, FR-014, FR-015, FR-016, FR-020, FR-024, FR-029
  - **Done when**: Separate Planner invocation writes only declared feature artifacts, selects only trusted profiles, task graph/view validate, and state advances to ready without Git commit.
  - **Tests**: `tools/studio_loop/tests/integration/test_plan_feature.py` covers valid output, schema failure, unsafe path, arbitrary command/profile, invalid graph, and drift.

- [ ] T035 [US1] Complete the independently testable US1 prepare-feature journey in `tools/studio_loop/tests/integration/test_us1_prepare_feature.py`
  - **Depends on**: T025, T032, T033, T034
  - **Writes**: Yes
  - **Requirements**: FR-001, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-016, FR-023, SC-002
  - **Done when**: One request yields one isolated feature with valid spec/task artifacts in dry-run/local fixtures while unrelated user changes remain byte-identical.
  - **Tests**: Run US1 acceptance scenarios and assert deterministic repeated dry runs plus exact task/view agreement.

**Checkpoint**: User Story 1 is independently complete; it can prepare, validate, and inspect a feature without executing tasks.

---

## Phase 9: User Story 2 — Sequential execution loop

**Goal**: Execute one eligible task at a time under controller state and policy.

**Independent Test**: A two-task fixture dispatches only ready work, blocks dependents on failure, and never permits two writers.

- [ ] T036 [US2] Implement deterministic feature/task execution orchestration in `tools/studio_loop/src/studio_loop/loop.py`
  - **Depends on**: T014, T027, T031, T034
  - **Writes**: Yes
  - **Requirements**: FR-005, FR-006, FR-017, FR-018, FR-023, FR-033
  - **Done when**: Loop derives next action from authoritative state, dispatches zero/one task, uses explicit effect protocol, and controller observations override agent claims.
  - **Tests**: `tools/studio_loop/tests/unit/test_loop.py` covers no-ready, dependency ordering, one-writer, stop check, forged claims, and deterministic replay.

- [ ] T037 [US2] Implement read-only/write attempt lifecycle and durable budget accounting in `tools/studio_loop/src/studio_loop/execution.py`
  - **Depends on**: T007, T009, T031, T036
  - **Writes**: Yes
  - **Requirements**: FR-006, FR-018, FR-028, FR-034, FR-036, FR-037
  - **Done when**: Attempts count before start, read-only changes fail, failed work leaves no completion/commit, and exhaustion/no-progress becomes durable blocked/failed.
  - **Tests**: `tools/studio_loop/tests/recovery/test_attempts.py` interrupts before/after count/invocation and proves budget survives restart and read-only diffs fail.

- [ ] T038 [US2] Add scheduler-to-role execution integration tests in `tools/studio_loop/tests/integration/test_execution_loop.py`
  - **Depends on**: T036, T037
  - **Writes**: Yes
  - **Requirements**: FR-005, FR-006, FR-017, FR-018, FR-020, FR-023, FR-028, FR-034, FR-037
  - **Done when**: Sequential fixture executes eligible tasks only, records exact transitions/attempts, and no failure permits a dependent or second writer.
  - **Tests**: Run deterministic fixture twice from reconstructed state and compare dispatch/effect sequence.

---

## Phase 10: User Story 2 — Allowed paths, diff guard, and trusted validation

**Goal**: Enforce task file/command boundaries independently of agent claims.

**Independent Test**: Inject traversal/symlink/protected/untracked/rename/mode changes and arbitrary commands; every forbidden case stops before review/commit.

- [ ] T039 [US2] Implement canonical repository-path containment and protected-path policy in `tools/studio_loop/src/studio_loop/paths.py`
  - **Depends on**: T017, T023
  - **Writes**: Yes
  - **Requirements**: FR-026, FR-053
  - **Done when**: Absolute/traversal/control/case collision/symlink/reparse/submodule/protected escapes fail on Windows and POSIX semantics.
  - **Tests**: `tools/studio_loop/tests/property/test_paths.py` generates hostile paths and validates containment against real temp symlinks/reparse-capable fixtures.
  - **Hardening evidence (2026-07-13)**: `tools/studio_loop/src/studio_loop/write_surface.py`, controller integration, and `tools/studio_loop/tests/test_write_surface.py` now reject absolute/traversal and external symlink/reparse write surfaces before Implementer/Debugger dispatch, including a Windows junction fixture. This task remains open because the planned shared `paths.py` policy, case-collision, submodule, and full property matrix are broader than this fix.

- [ ] T040 [US2] Implement pre/post repository snapshots and full diff guard in `tools/studio_loop/src/studio_loop/diff_guard.py`
  - **Depends on**: T026, T037, T039
  - **Writes**: Yes
  - **Requirements**: FR-027, FR-028, FR-031, FR-033
  - **Done when**: All tracked/untracked/staged/rename/delete/mode/symlink changes are compared to allowed writes; violations quarantine evidence and never auto-revert possible user work.
  - **Tests**: `tools/studio_loop/tests/integration/test_diff_guard.py` covers every Git change kind, pre-existing change, read-only task, case/path edge, and forged claimed path.

- [ ] T041 [US2] Implement fixed-profile validation execution in `tools/studio_loop/src/studio_loop/validation.py`
  - **Depends on**: T017, T029, T040
  - **Writes**: Yes
  - **Requirements**: FR-029, FR-030, FR-031, FR-033, FR-053
  - **Done when**: Only literal committed argv/profile/cwd/env/time/output/network policy runs; exact accepted diff/profile results are recorded and failure blocks review.
  - **Tests**: `tools/studio_loop/tests/security/test_validation_runner.py` covers shell fragments, executable substitution, cwd escape, env leak, timeout/output cap, network denial, and exit mapping.

- [ ] T042 [US2] Add path/diff/validation acceptance tests in `tools/studio_loop/tests/integration/test_execution_guards.py`
  - **Depends on**: T039, T040, T041
  - **Writes**: Yes
  - **Requirements**: FR-026, FR-027, FR-028, FR-029, FR-030, FR-031, FR-033, FR-053, FR-054
  - **Done when**: Allowed fixture proceeds to review; every forbidden path/command/diff/secret fixture stops before stage/commit and redacts suspected values.
  - **Tests**: Assert Git refs/index and unrelated files are unchanged for every rejected case.

---

## Phase 11: User Story 2 — Review, Debugger, and retry

**Goal**: Require independent read-only review and bounded failure-only diagnosis.

**Independent Test**: Review accepts/rejects fixtures; retry only occurs for classified failure within durable budgets, and all gates repeat.

- [ ] T043 [US2] Implement read-only Reviewer gate and controller conflict handling in `tools/studio_loop/src/studio_loop/review.py`
  - **Depends on**: T031, T040, T041
  - **Writes**: Yes
  - **Requirements**: FR-031, FR-032, FR-033
  - **Done when**: Reviewer covers requirements/tests/scope/security/maintainability, produces no diff, and cannot accept over failed controller evidence.
  - **Tests**: `tools/studio_loop/tests/integration/test_review.py` covers accept/changes/blocked, missing requirement finding, Reviewer write, forged tests, and controller conflict.

- [ ] T044 [US2] Implement failure-only Debugger context and repair decision in `tools/studio_loop/src/studio_loop/debugging.py`
  - **Depends on**: T031, T037, T040, T041
  - **Writes**: Yes
  - **Requirements**: FR-019, FR-034, FR-035, FR-037
  - **Done when**: Debugger requires retryable recorded failure, sees sanitized same-task context/paths/budget, and proposed scope/profile expansion is rejected.
  - **Tests**: `tools/studio_loop/tests/unit/test_debugging.py` covers invocation precondition, context minimization, budget, failure signature, and path/profile expansion.

- [ ] T045 [US2] Implement retry/no-progress orchestration with full gate replay in `tools/studio_loop/src/studio_loop/retry.py`
  - **Depends on**: T037, T043, T044
  - **Writes**: Yes
  - **Requirements**: FR-034, FR-035, FR-036, FR-037
  - **Done when**: Retry classification/budgets survive restart, every attempt repeats schema/diff/validation/review, identical no-progress signatures stop, and exhausted outcome is actionable/durable.
  - **Tests**: `tools/studio_loop/tests/recovery/test_retry_budget.py` injects failures/restarts and proves no budget reset/gate bypass.

- [ ] T046 [US2] Add review-debug-retry integration tests in `tools/studio_loop/tests/integration/test_review_retry.py`
  - **Depends on**: T043, T044, T045
  - **Writes**: Yes
  - **Requirements**: FR-019, FR-031, FR-032, FR-033, FR-034, FR-035, FR-036, FR-037
  - **Done when**: Accepted retry reaches commit eligibility, non-retryable/exhausted paths do not, Debugger appears only after failure, and evidence is fully traceable.
  - **Tests**: Run schema/diff/validation/review failure matrix with one repair and repeated no-progress cases.

---

## Phase 12: User Story 2 — Controller-owned local commits

**Goal**: Convert one accepted writing task into exactly one traceable logical commit.

**Independent Test**: Accepted write creates one expected-parent/tree/trailer commit; failures/read-only tasks create none; interruption reconciles without duplication.

- [ ] T047 [US2] Implement explicit staging and task commit protocol in `tools/studio_loop/src/studio_loop/commits.py` and `tools/studio_loop/src/studio_loop/git_service.py`
  - **Depends on**: T027, T040, T041, T043
  - **Writes**: Yes
  - **Requirements**: FR-038, FR-039, FR-040, FR-041
  - **Done when**: Only accepted paths stage, cached tree/diff/parent match evidence, deterministic message/trailers bind feature/task/attempt/schema/config/artifacts, and read-only tasks never commit.
  - **Tests**: `tools/studio_loop/tests/integration/test_task_commits.py` covers unrelated index, partial stage, parent move, hooks/prompts, trailer/tree mismatch, write/read-only outcomes.

- [ ] T048 [US2] Implement commit observation and crash reconciliation in `tools/studio_loop/src/studio_loop/recovery.py`
  - **Depends on**: T009, T010, T026, T047
  - **Writes**: Yes
  - **Requirements**: FR-039, FR-040, FR-048, FR-049, FR-050, SC-005
  - **Done when**: Zero/one/multiple/conflicting task commits are distinguished from Git facts/trailers/tree, lost response never duplicates a commit, and ambiguity blocks.
  - **Tests**: `tools/studio_loop/tests/recovery/test_commit_recovery.py` interrupts at intention/object/ref/event/snapshot boundaries and deletes runtime cache.

- [ ] T049 [US2] Complete the independently testable local execution journey in `tools/studio_loop/tests/integration/test_us2_local_feature.py`
  - **Depends on**: T038, T042, T046, T047, T048
  - **Writes**: Yes
  - **Requirements**: FR-005, FR-006, FR-017, FR-018, FR-019, FR-020, FR-021, FR-022, FR-023, FR-024, FR-025, FR-026, FR-027, FR-028, FR-029, FR-030, FR-031, FR-032, FR-033, FR-034, FR-035, FR-036, FR-037, FR-038, FR-039, FR-040
  - **Done when**: Local fixture completes dependent tasks sequentially, enforces all gates/retries, creates one commit per successful write task, no commit per read-only task, and performs no push/PR.
  - **Tests**: Run full US2 acceptance matrix and assert exact commit/task/effect mapping after snapshot deletion.

**Checkpoint**: User Story 2 is independently complete in local mode.

---

## Phase 13: User Story 3 — GitHub Draft PR and CI

**Goal**: Publish only an eligible feature branch, reconcile exactly one Draft PR, and stop after required checks for manual review.

**Independent Test**: Fake GitHub/bare remote fixtures cover push/PR/check success, lost responses, head movement, duplicates, CI failure/repair, and no merge/deploy.

- [ ] T050 [US3] Implement noninteractive `gh` auth/repository/PR/check JSON adapter in `tools/studio_loop/src/studio_loop/adapters/gh_cli.py` and `tools/studio_loop/src/studio_loop/ports/github.py`
  - **Depends on**: T018, T029
  - **Writes**: Yes
  - **Requirements**: FR-042, FR-043, FR-045, FR-053
  - **Done when**: Explicit host/repo/JSON fields/flags are used, prompts/forks/implicit pushes are impossible, output is bounded/redacted, and no merge/ready/review method exists.
  - **Tests**: `tools/studio_loop/tests/contract/test_gh_adapter.py` asserts exact fake argv/JSON parsing, auth failure, prompt prevention, field changes, and forbidden-method absence.

- [ ] T051 [US3] Implement verified feature-branch push with expected remote SHA in `tools/studio_loop/src/studio_loop/publishing.py` and `tools/studio_loop/src/studio_loop/git_service.py`
  - **Depends on**: T027, T048, T050
  - **Writes**: Yes
  - **Requirements**: FR-038, FR-041, FR-044, FR-049, FR-050
  - **Done when**: Draft-pr mode alone can push explicit refspec after clean/history checks, unexpected remote movement blocks, and lost responses reconcile via remote observation.
  - **Tests**: `tools/studio_loop/tests/recovery/test_push_recovery.py` uses bare remote for absent/expected/moved refs and every intention/response boundary.

- [ ] T052 [US3] Implement idempotent one-Draft-PR reconciliation in `tools/studio_loop/src/studio_loop/pull_requests.py`
  - **Depends on**: T050, T051
  - **Writes**: Yes
  - **Requirements**: FR-001, FR-004, FR-042, FR-043, FR-044
  - **Done when**: Repo/base/head/body metadata identify zero/one PR, create uses explicit `--draft`, matching PR is reused, and multiple/non-draft/wrong-head/base states block.
  - **Tests**: `tools/studio_loop/tests/integration/test_draft_pr.py` covers create/lost-response/reuse/duplicates/closed/non-draft/head movement and asserts never ready/merge.

- [ ] T053 [US3] Implement bounded required-check polling and head-bound normalization in `tools/studio_loop/src/studio_loop/checks.py`
  - **Depends on**: T050, T052
  - **Writes**: Yes
  - **Requirements**: FR-045
  - **Done when**: Required names/policy, pass/fail/pending/cancel/missing/indeterminate, exit 8, timeout/stop, and current PR head SHA are durably observed without `--watch` authority.
  - **Tests**: `tools/studio_loop/tests/unit/test_checks.py` covers every state, renamed/missing checks, stale-head results, polling limits, and stop.

- [ ] T054 [US3] Implement bounded CI failure mapping and repair re-entry in `tools/studio_loop/src/studio_loop/ci_repair.py`
  - **Depends on**: T045, T051, T053
  - **Writes**: Yes
  - **Requirements**: FR-034, FR-035, FR-036, FR-037, FR-046
  - **Done when**: Check maps to task only by committed metadata/path evidence, unmapped ambiguity blocks, repairs use normal gates/new commit/push, and no amend/force-push occurs.
  - **Tests**: `tools/studio_loop/tests/integration/test_ci_repair.py` covers mapped/unmapped failures, budget/no-progress, successful repair, stale check, and normal-gate enforcement.

- [ ] T055 [US3] Complete the independently testable Draft PR journey in `tools/studio_loop/tests/integration/test_us3_draft_pr_feature.py`
  - **Depends on**: T049, T050, T051, T052, T053, T054
  - **Writes**: Yes
  - **Requirements**: FR-001, FR-003, FR-004, FR-038, FR-041, FR-042, FR-043, FR-044, FR-045, FR-046, SC-009
  - **Done when**: One feature branch/one Draft PR reaches ready-for-manual-review only for matching passing head; all failures remain draft/unmerged and no deployment command is observed.
  - **Tests**: Fake `gh` + bare remote acceptance suite snapshots every command/ref/PR/check/effect and asserts no forbidden action.

**Checkpoint**: User Story 3 is independently complete; automation ends at a Draft PR ready for manual review.

---

## Phase 14: User Story 4 — Recovery, resume, stop, abort, and audit

**Goal**: Rebuild from durable evidence and preserve explicit operator control across interruption.

**Independent Test**: Delete cache and interrupt every privileged boundary; resume is idempotent, conflicts block, stop is safe, abort preserves evidence.

- [ ] T056 [US4] Implement ordered artifact/Git/remote/GitHub reconciliation in `tools/studio_loop/src/studio_loop/recovery.py`
  - **Depends on**: T048, T051, T052, T053
  - **Writes**: Yes
  - **Requirements**: FR-044, FR-048, FR-049, FR-050
  - **Done when**: Recovery ignores snapshot authority, reconstructs task/commit/push/PR/check facts in fixed order, queries intended effects before retry, and blocks every contradiction.
  - **Tests**: `tools/studio_loop/tests/recovery/test_full_rebuild.py` deletes all runtime cache and rebuilds valid local/published fixtures plus every conflict.

- [ ] T057 [US4] Implement `status --rebuild` and `resume` use cases in `tools/studio_loop/src/studio_loop/use_cases/status.py`, `tools/studio_loop/src/studio_loop/use_cases/resume.py`, and `tools/studio_loop/src/studio_loop/cli.py`
  - **Depends on**: T019, T036, T056
  - **Writes**: Yes
  - **Requirements**: FR-048, FR-050, FR-059
  - **Done when**: Status is read-only except cache projection, resume revalidates mode/artifacts/config/budgets before dispatch, and ambiguity returns stable reconciliation exit.
  - **Tests**: `tools/studio_loop/tests/integration/test_status_resume.py` covers every safe state, missing/corrupt cache, same/narrowed mode, valid `--mode draft-pr --allow-mode-upgrade`, every invalid upgrade combination, fresh preflight failure, and conflict output.

- [ ] T058 [US4] Implement durable safe-boundary stop requests in `tools/studio_loop/src/studio_loop/control.py` and `tools/studio_loop/src/studio_loop/use_cases/stop.py`
  - **Depends on**: T009, T029, T036, T057
  - **Writes**: Yes
  - **Requirements**: FR-051, FR-055
  - **Done when**: Stop is visible across processes, prevents new dispatch, lets current atomic adapter operation resolve, records stopped state, and never auto-resumes/cleans.
  - **Tests**: `tools/studio_loop/tests/recovery/test_stop.py` requests stop during each agent/validation/commit/push/PR/check boundary and verifies no next dispatch.

- [ ] T059 [US4] Implement conservative abort and optional clean owned-worktree removal in `tools/studio_loop/src/studio_loop/use_cases/abort.py`
  - **Depends on**: T023, T056, T058
  - **Writes**: Yes
  - **Requirements**: FR-003, FR-051
  - **Done when**: Abort requires reason/reconciliation, preserves artifacts/branch/commits/remote/PR/log, optional removal is non-forced and clean/owned only, and no history/ref cleanup occurs.
  - **Tests**: `tools/studio_loop/tests/integration/test_abort.py` covers clean/dirty/unowned/in-flight worktrees and preservation of every durable evidence class.

- [ ] T060 [US4] Implement sanitized event/status audit output in `tools/studio_loop/src/studio_loop/use_cases/events.py` and `tools/studio_loop/src/studio_loop/cli.py`
  - **Depends on**: T009, T019, T056
  - **Writes**: Yes
  - **Requirements**: FR-052, FR-053, FR-059
  - **Done when**: Event chain/filter/correlation/evidence refs are inspectable in human/JSONL form without raw prompts, secret values, or unbounded output.
  - **Tests**: `tools/studio_loop/tests/security/test_audit_output.py` seeds canaries/raw diagnostics and asserts only sanitized bounded correlated evidence is exposed.

- [ ] T061 [US4] Complete interruption/resume/stop/abort acceptance matrix in `tools/studio_loop/tests/recovery/test_us4_recovery.py`
  - **Depends on**: T056, T057, T058, T059, T060
  - **Writes**: Yes
  - **Requirements**: FR-034, FR-044, FR-048, FR-049, FR-050, FR-051, FR-052, FR-053, FR-055, FR-059, SC-004
  - **Done when**: Every privileged boundary recovers without duplicate commit/push/PR, conflicting facts stop, budgets persist, stop is resumable, and abort preserves evidence.
  - **Tests**: Parameterized fault suite runs with snapshot present/deleted/corrupt and validates final Git/remote/PR/event facts.

**Checkpoint**: User Story 4 is independently complete and runtime memory/cache can be lost safely.

---

## Phase 15: Rules and hooks defense in depth

**Purpose**: Add secondary protection without moving scheduling/state into hooks or rules.

- [ ] T062 Add agent command-deny rules for Git/GitHub/deployment operations in `.codex/rules/studio-loop.rules`
  - **Depends on**: T027, T030, T050
  - **Writes**: Yes
  - **Requirements**: FR-038, FR-055
  - **Done when**: Agent contexts deny commit/push/merge/rebase/reset/clean/`gh` mutation/deployment commands while controller adapters remain separately testable; rules contain no loop state.
  - **Tests**: `tools/studio_loop/tests/security/test_command_rules.py` checks each forbidden command family and confirms rules are defense only, not required for controller policy tests.

- [ ] T063 Add optional policy/stop hooks that never continue execution in `.codex/hooks.json` and `.codex/hooks/`
  - **Depends on**: T058, T062
  - **Writes**: Yes
  - **Requirements**: FR-055
  - **Done when**: Hooks can request stop/check policy only, contain no `run`/`resume`/manager state, and are safe when absent/disabled; no removed manager loop is restored.
  - **Tests**: `tools/studio_loop/tests/test_codex_project_guards.py` statically and behaviorally proves Stop hook cannot dispatch/continue and controller tests pass with hooks disabled.
  - **Hardening evidence (2026-07-13)**: PreToolUse tests use the current Codex canonical `apply_patch` payload for Edit/Write matcher aliases and cover resolved worktree/allowed-path containment, symlink/reparse escape, read-only roles, `.git`, runtime state, secrets, and fail-closed unknown payloads. The task remains open pending its declared dependencies and the complete hooks-disabled controller matrix in T064.

- [ ] T064 Verify controller enforcement remains complete without hooks/rules in `tools/studio_loop/tests/test_codex_project_guards.py`
  - **Depends on**: T062, T063
  - **Writes**: Yes
  - **Requirements**: FR-038, FR-055
  - **Done when**: Removing hook/rule fixtures does not enable any forbidden transition/effect; enabling them blocks agent command attempts without changing controller state ownership.
  - **Tests**: Run full capability/forbidden-action matrix with protections on and off.

---

## Phase 16: Skills and Polish-first documentation

**Purpose**: Make safe operation, boundaries, and recovery understandable without turning documentation into runtime state.

- [ ] T065 Write architecture, security, modes, artifacts, recovery, and manual-review documentation in `docs/autonomous-loop-architecture.md`, `docs/autonomous-loop-runbook.md`, and `docs/autonomous-loop-troubleshooting.md`
  - **Depends on**: T055, T061, T064
  - **Writes**: Yes
  - **Requirements**: FR-003, FR-004, FR-012, FR-038, FR-042, FR-047, FR-048, FR-051, FR-053, FR-056, FR-060
  - **Done when**: Polish-first docs explain setup/config/profiles/tasks/paths/validation/modes/status/recovery/stop/abort/security/exit codes and that merge/deploy remain manual/outside scope.
  - **Tests**: `tools/studio_loop/tests/docs/test_documentation.py` validates commands/paths/links, required topics, no secret examples, and no auto-merge/deploy instruction.

- [ ] T066 Create Polish-first new-feature and status skills in `.agents/skills/studio-new-feature/SKILL.md` and `.agents/skills/studio-status/SKILL.md`
  - **Depends on**: T019, T024, T034, T057, T065
  - **Writes**: Yes
  - **Requirements**: FR-005, FR-023, FR-056
  - **Done when**: Skills only call documented CLI, default to dry-run/read-only status, explain effects, and contain no scheduler/runtime/model-memory authority.
  - **Tests**: `tools/studio_loop/tests/docs/test_skills.py` validates frontmatter, commands, safe defaults, exact mode wording, and absence of direct Git/GitHub/deploy operations.

- [ ] T067 Create Polish-first resume and abort skills in `.agents/skills/studio-resume/SKILL.md` and `.agents/skills/studio-abort/SKILL.md`
  - **Depends on**: T057, T058, T059, T065
  - **Writes**: Yes
  - **Requirements**: FR-050, FR-051, FR-055, FR-056
  - **Done when**: Resume requires reconciliation output; stop never continues; abort explains preservation/terminal effect; skills do not delete/clean/merge/deploy.
  - **Tests**: Extend `tools/studio_loop/tests/docs/test_skills.py` with recovery/conflict/stop/abort cases and forbidden continuation tokens.

- [ ] T068 Replace the temporary root guidance with tested architecture guidance in `AGENTS.md` only after controller policy/docs are complete
  - **Depends on**: T062, T063, T064, T065, T066, T067
  - **Writes**: Yes
  - **Requirements**: FR-005, FR-023, FR-038, FR-055, FR-056
  - **Done when**: `AGENTS.md` documents controller ownership, one writer, agent prohibitions, artifacts versus runtime state, Stop behavior, and manual review boundary without embedding mutable state or recreating old manager loop.
  - **Tests**: `tools/studio_loop/tests/docs/test_agent_guidance.py` checks required invariants and rejects manager-history, auto-continue, agent Git/GitHub, merge, and deployment instructions.

**Checkpoint**: Operators have Polish-first, tested guidance; documents/skills remain clients of the controller.

---

## Phase 17: Integration and cross-cutting safety tests

**Purpose**: Prove mode, security, recovery, and platform claims across the assembled controller.

- [ ] T069 Add complete mode-capability and forbidden-action matrix tests in `tools/studio_loop/tests/integration/test_mode_matrix.py`
  - **Depends on**: T055, T061, T064
  - **Writes**: Yes
  - **Requirements**: FR-002, FR-003, FR-004, FR-011, FR-038, FR-041, FR-042, FR-055
  - **Done when**: Every command/effect is exercised in all three modes and no code path/method/argv enables auto-merge, rebase, force cleanup, PR-ready conversion, or deployment.
  - **Tests**: The matrix itself runs against fakes/temp Git and asserts zero forbidden effect events.

- [ ] T070 Add full local-mode temporary-repository integration suite in `tools/studio_loop/tests/integration/test_local_loop.py`
  - **Depends on**: T049, T057, T058
  - **Writes**: Yes
  - **Requirements**: FR-001, FR-005, FR-006, FR-007, FR-008, FR-009, FR-013, FR-017, FR-019, FR-027, FR-031, FR-039, FR-048, FR-050, FR-051
  - **Done when**: Init→plan→sequential execute→validate→review→commit→local completion works with restart/stop and leaves remote/PR untouched.
  - **Tests**: Run once uninterrupted and once with fault/stop at every major phase; compare final task/commit/evidence state.

- [ ] T071 Add full fake-transport draft-pr integration suite in `tools/studio_loop/tests/integration/test_draft_pr_loop.py`
  - **Depends on**: T055, T056, T069
  - **Writes**: Yes
  - **Requirements**: FR-001, FR-004, FR-041, FR-042, FR-043, FR-044, FR-045, FR-046, FR-050
  - **Done when**: Local completion→push→one Draft PR→checks→bounded repair→manual-review readiness is idempotent across lost responses/head movement/failure.
  - **Tests**: Bare remote + fake `gh` suite verifies exact ref/PR/check/effect history and zero merge/deploy.

- [ ] T072 Add adversarial secret/path/command/forged-output tests in `tools/studio_loop/tests/security/test_end_to_end_security.py`
  - **Depends on**: T042, T049, T055, T060, T064
  - **Writes**: Yes
  - **Requirements**: FR-021, FR-022, FR-025, FR-026, FR-027, FR-029, FR-030, FR-033, FR-038, FR-053, FR-054, FR-055, SC-001
  - **Done when**: Every attack is stopped before prohibited effect; canaries appear in no prompt/log/artifact/commit/PR body; suspected secret value is never printed.
  - **Tests**: Parameterized malicious fixture corpus plus scan of all runtime/feature/Git/fake-GitHub evidence.

- [ ] T073 Add Windows/POSIX controller CI quality workflow in `.github/workflows/studio-loop-ci.yml`
  - **Depends on**: T002, T011, T016, T020, T069, T070, T071, T072
  - **Writes**: Yes
  - **Requirements**: FR-030, FR-057, FR-060
  - **Done when**: Python 3.11+ matrix runs schema, Ruff, MyPy, unit/contract/property/integration/recovery/security/docs tests with fake transports and never deploys or targets production repos.
  - **Tests**: Validate workflow syntax/action pinning, run equivalent local matrix, and assert no cloud/deployment/merge permissions or commands.

**Checkpoint**: All automated safety and recovery claims pass on supported platforms with deterministic transports.

---

## Phase 18: Final smoke and implementation-readiness closure

**Purpose**: Validate documented operation, optional real transport, traceability, and the manual-review boundary.

- [ ] T074 Execute and reconcile local quickstart and usability scenarios in `specs/007-autonomous-loop/quickstart.md`, `docs/validation/studio-loop-usability.md`, and `tools/studio_loop/README.md`
  - **Depends on**: T065, T066, T067, T068, T070, T073
  - **Writes**: Yes
  - **Requirements**: FR-056, FR-057, FR-059, SC-008
  - **Done when**: Fresh maintainer can install, doctor, dry-run, initialize, validate/render, run local, status, stop, resume, abort, and interpret failures exactly as documented; an anonymized protocol records at least 9 of 10 first-time maintainers identifying state/action/failure/effects within five minutes.
  - **Tests**: `tools/studio_loop/tests/smoke/test_quickstart.py` executes copy-safe documented commands against a temporary repository; `docs/validation/studio-loop-usability.md` defines the fixed scenario, timer, four required answers, participant eligibility, anonymized result table, and 9/10 pass gate.

- [ ] T075 Implement and run the opt-in disposable GitHub Draft PR smoke test in `tools/studio_loop/tests/smoke/test_disposable_github.py`
  - **Depends on**: T071, T073, T074
  - **Writes**: Yes
  - **Requirements**: FR-003, FR-004, FR-042, FR-043, FR-044, FR-045
  - **Done when**: Test refuses production repo by identity, requires explicit opt-in, creates exactly one feature branch/open Draft PR, observes checks, and leaves it draft/unmerged with no deployment.
  - **Tests**: Run only under separately authorized disposable GitHub fixture; otherwise assert a clear skip/refusal with no remote mutation.

- [ ] T076 Verify full requirement/task/schema/view traceability and quality gates in `tools/studio_loop/tests/contract/test_traceability.py`
  - **Depends on**: T069, T070, T071, T072, T073, T074
  - **Writes**: Yes
  - **Requirements**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-016, FR-017, FR-018, FR-019, FR-020, FR-021, FR-022, FR-023, FR-024, FR-025, FR-026, FR-027, FR-028, FR-029, FR-030, FR-031, FR-032, FR-033, FR-034, FR-035, FR-036, FR-037, FR-038, FR-039, FR-040, FR-041, FR-042, FR-043, FR-044, FR-045, FR-046, FR-047, FR-048, FR-049, FR-050, FR-051, FR-052, FR-053, FR-054, FR-055, FR-056, FR-057, FR-058, FR-059, FR-060, SC-010
  - **Done when**: Every FR maps to implementation and test evidence, committed schemas match approved contracts, generated task views do not drift, all static/test/security gates pass, and no application source changed unintentionally.
  - **Tests**: Run traceability/schema-digest/view-drift checks plus full CI-equivalent suite and inspect `git status --short`.

- [ ] T077 Perform the final no-mutation readiness audit against `specs/007-autonomous-loop/spec.md`, `specs/007-autonomous-loop/plan.md`, and `specs/007-autonomous-loop/quickstart.md`
  - **Depends on**: T075, T076
  - **Writes**: No
  - **Requirements**: FR-003, FR-004, FR-038, FR-048, FR-055, FR-058
  - **Done when**: Controller ends at local-complete or Draft-PR-ready-for-manual-review as mode dictates; runtime rebuild succeeds; no merge/deploy/agent Git authority exists; frontend/backend and unrelated user changes are untouched.
  - **Tests**: Independently review full evidence, final Git/remote/PR states, command/event logs, and Constitution Check; report any mismatch as blocker rather than changing files.

**Final checkpoint**: Implementation is eligible for manual review only. Merge and deployment remain outside scope.

---

## Dependencies and execution order

### Phase dependencies

| Phase | Depends on | Task count |
|---|---|---:|
| 1. Package and contract setup | None | 5 |
| 2. Models/schema/state store | Phase 1 | 6 |
| 3. Task parser/graph/scheduler/renderer | Phase 2 schema/model core | 5 |
| 4. CLI/configuration | Phases 1-3 | 4 |
| 5. US1 numbering/branch/worktree | Phase 4 plus state store | 5 |
| 6. Safe Git service | Phase 5 Git/worktree base | 3 |
| 7. Codex runner/roles | Phase 2 and Phase 4 config/process base | 4 |
| 8. US1 artifact/task generation | Phases 3, 5, 7 | 3 |
| 9. US2 execution loop | Phases 3, 6, 7, 8 | 3 |
| 10. US2 diff/validation | Phases 6, 9 | 4 |
| 11. US2 review/debug/retry | Phases 7, 9, 10 | 4 |
| 12. US2 commits | Phases 6, 10, 11 | 3 |
| 13. US3 GitHub/CI | Phase 12 | 6 |
| 14. US4 recovery/control/audit | Phases 12-13 | 6 |
| 15. Rules/hooks | Phases 7, 13-14 | 3 |
| 16. Skills/documentation | Phases 13-15 | 4 |
| 17. Integration/cross-cutting tests | Phases 12-16 | 5 |
| 18. Final smoke/readiness | Phases 16-17 | 4 |
| **Total** |  | **77** |

### User story task counts

| Story | Directly labeled tasks | Count | Independent completion boundary |
|---|---|---:|---|
| US1 Safe feature preparation | T021-T025, T033-T035 | 8 | Valid isolated feature with canonical artifacts/tasks; no execution required. |
| US2 Controlled local execution/review | T036-T049 | 14 | Sequential locally-complete tasks with guarded diffs, validations, review/retry, and logical commits; no remote effect. |
| US3 Draft PR/CI handoff | T050-T055 | 6 | One Draft PR at matching head with checks, still draft/unmerged. |
| US4 Resume/stop/audit | T056-T061 | 6 | Cache-independent recovery and safe operator control at every boundary. |
| Shared/cross-cutting | T001-T020, T026-T032, T062-T077 | 43 | Foundation, privilege boundaries, documentation, integration, and smoke gates. |

### Critical dependency chain

`T001 → T005 → T008 → T009 → T010 → T012 → T013 → T014 → T017 → T019 → T021 → T024 → T026 → T027 → T029 → T030 → T031 → T034 → T036 → T037 → T040 → T041 → T043 → T045 → T047 → T048 → T049 → T050 → T051 → T052 → T053 → T054 → T055 → T056 → T057 → T058 → T061 → T064 → T065 → T068 → T070 → T071 → T073 → T074 → T076 → T077`

### Parallel opportunities

There are **0 approved parallel writing opportunities** in this plan. Some test/design files are dependency-independent in theory, but repository guidance and V1 policy allow only one writing executor, so implementation proceeds sequentially. Read-only review may happen concurrently only if it cannot mutate files or runtime state and the future controller explicitly supports it; V1 does not schedule such concurrency.

## Implementation strategy

### MVP boundary

The smallest safe MVP is Phases 1-8 and User Story 1: deterministic configuration/state/task models, CLI preflight, isolated feature initialization, and validated Planner artifacts/tasks. It intentionally stops before implementation agents, commits, push, or PR.

### Incremental delivery

1. **US1 preparation**: Complete Phases 1-8 and validate independently.
2. **US2 local loop**: Add Phases 9-12; validate controlled local commits with no remote effects.
3. **US3 Draft PR**: Add Phase 13; validate fake transports before any opt-in disposable remote.
4. **US4 recovery/control**: Complete Phase 14 and fault matrix before calling V1 safe.
5. **Defense/docs/integration**: Complete Phases 15-18; only then declare ready for manual review.

Privileged capability is introduced only after its policy, evidence, negative tests, and recovery behavior exist. No phase ends in deployment, and no task instructs manual commit/push/merge while those operations remain disabled by repository guidance.

## Format validation rules

- All 77 tasks start with a Markdown checkbox and sequential `T001`-`T077` ID.
- Story-phase tasks carry `[US1]`-`[US4]`; shared/final tasks do not.
- Every checklist line contains at least one exact repository path.
- Every task records dependencies, write flag, requirements, completion criteria, and tests.
- No `[P]` marker is used because one-writer/sequential execution is mandatory.
