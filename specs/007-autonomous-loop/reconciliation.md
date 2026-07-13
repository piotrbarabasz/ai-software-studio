# Autonomous Loop task reconciliation — 2026-07-13

This is release-review evidence for feature `007`; it is not runtime state. Future-feature
`tasks.json` remains canonical and its `tasks.md` remains generated. The test column records the
closest test actually executed in the 156-test controller suite (150 passed, 6 platform skips).
`PASS partial` means the observed slice passed but the task's full named test/criteria or a
dependency is still missing. No task is completed merely because a file exists.

| Task | Before | After | Implementing files | Tests actually run | Individual rationale / blocker |
|---|---|---|---|---|---|
| T001 | `[X]` | `[X]` | `pyproject.toml`, `__init__.py`, `__main__.py` | `test_package_metadata.py` PASS; CLI help PASS | Python >=3.11 package and both entrypoints work; isolated from application code; no blocker. |
| T002 | `[ ]` | `[ ]` | `pyproject.toml`, `tools/studio_loop/README.md` | package metadata PASS partial; clean editable install PASS | No hashed `requirements.lock`; Hypothesis, pip-tools and coverage contract/lock-drift gate are absent. |
| T003 | `[ ]` | `[ ]` | `.studio-loop/*.json` alternatives | TOML parse gate PASS only for files that exist | Required four TOML configuration skeletons do not exist. |
| T004 | `[ ]` | `[ ]` | `.gitignore`, write/protected-path guards | path/guard tests PASS partial | No `.studio-loop/policies.toml` semantics or exact `git check-ignore` layout test. |
| T005 | `[ ]` | `[ ]` | `.studio-loop/schemas/*.json`, `contracts/*.schema.json` | `test_schemas.py` PASS metaschema | Committed schemas are not a complete byte/semantic synchronization of approved config/task/event/snapshot/four-role contracts. |
| T006 | `[ ]` | `[ ]` | `models.py` | `test_models.py` PASS partial | Task/run models exist, but the complete versioned config/feature/artifact/evidence model and durable-vs-cache distinction do not. |
| T007 | `[ ]` | `[ ]` | `state_machine.py`, `models.py` | `test_state_machine.py` PASS partial | Transition graph exists, but the full entity/effect/budget invariant model and property proof are absent. |
| T008 | `[ ]` | `[ ]` | Pydantic validation in `models.py`; schema checks in lifecycle/runner | schema/model tests PASS partial | No central `schema_validation.py`, duplicate-key/size/domain validation layer or complete stable-redacted error fixtures. |
| T009 | `[ ]` | `[ ]` | `state_store.py` | `test_state_store.py` PASS partial | Append/fsync exists, but digest chaining and byte-boundary tail quarantine/corruption rules are not implemented. |
| T010 | `[ ]` | `[ ]` | `state_store.py`, `recovery.py` | state/recovery tests PASS partial | Atomic state replacement and Git rebuild slices exist; full event replay, stale snapshot/digest conflict recovery does not. |
| T011 | `[ ]` | `[ ]` | tests in flat `tests/` | model/state tests PASS partial | Required fixtures/property suite and randomized one-writer/budget/digest/snapshot proofs are absent. |
| T012 | `[ ]` | `[ ]` | `models.py`, `task_graph.py` | model/task-pipeline tests PASS partial | No `task_store.py`, duplicate JSON-key detection or canonical digest/unknown-profile validation at the requested boundary. |
| T013 | `[ ]` | `[ ]` | `task_graph.py` | `test_task_pipeline.py` PASS partial | Deterministic graph checks exist, but required generated DAG/cycle property diagnostics are absent; T012 remains open. |
| T014 | `[ ]` | `[ ]` | `task_scheduler.py` | scheduler cases in `test_task_pipeline.py`/controller PASS partial | No stop-aware 200-task scheduler contract and required standalone test; upstream task model remains open. |
| T015 | `[ ]` | `[ ]` | `task_renderer.py`, CLI render check | renderer/drift cases PASS partial | Renderer exists, but requested warning/schema/generator/source digest, full coverage counts and golden round-field test are incomplete. |
| T016 | `[ ]` | `[ ]` | `test_task_pipeline.py` | PASS partial | No 200-task twice-run integration and complete malformed-fixture executor non-dispatch proof. |
| T017 | `[ ]` | `[ ]` | JSON role/validation loaders | configuration tests PASS partial | Required TOML loader, cross-file semantic references, capability narrowing and stable configuration digest are absent. |
| T018 | `[ ]` | `[ ]` | CLI repository/GitHub preflight, `GhCli.capability` | CLI preflight cases PASS partial | No unified Python/Git/Codex/config/root/ignored-state diagnostic collector or old-tool matrix. |
| T019 | `[ ]` | `[ ]` | `cli.py`, `errors.py` | CLI JSON/dry-run tests and help PASS partial | Implemented command set drifts from `contracts/cli.md` (`stop`/events/doctor absent); full exit/flag contract is unmet. |
| T020 | `[ ]` | `[ ]` | `test_cli_feature_git.py`, guard tests | PASS partial | Missing unsupported Python/config/schema subprocess matrix and complete canary/no-mutation preflight fixture. |
| T021 | `[ ]` | `[ ]` | `locking.py`, `feature_numbering.py` | `test_locking.py`, numbering cases PASS partial | Shared lock/allocation exists, but two-process allocation race plus stale/local/remote ambiguity acceptance proof is incomplete. |
| T022 | `[ ]` | `[ ]` | `adapters/git_cli.py`, feature/worktree services | Git CLI tests PASS partial | Safe argv/non-force creation exists; requested port/complete remote-ref and dirty-source matrix remains absent. |
| T023 | `[ ]` | `[ ]` | `worktrees.py`, `adapters/git_cli.py` | worktree cases PASS partial | Create/lock/verify exists, but full porcelain-z ownership/removal, submodule/prunable/symlink matrix is incomplete. |
| T024 | `[ ]` | `[ ]` | `cli.py`, `lifecycle.py` | dry-run/local CLI E2E PASS | Core behavior exists, but runtime evidence/recovery boundaries and exact use-case contract are incomplete; T018/T023 blockers remain. |
| T025 | `[ ]` | `[ ]` | initialization tests in `test_cli_feature_git.py` | PASS partial | No every-boundary crash suite or Windows/POSIX + bare-remote acceptance evidence. |
| T026 | `[ ]` | `[ ]` | `adapters/git_cli.py`, `diff_guard.py` | Git/diff tests PASS partial | Readers do not yet prove every change kind/unusual filename/rename/mode/symlink with the requested NUL-safe typed matrix. |
| T027 | `[ ]` | `[ ]` | `git_service.py`, `adapters/git_cli.py` | Git policy tests PASS partial | Allowlisted facade is safer and has no forbidden verbs, but all effects do not share a complete durable intention/observation protocol. |
| T028 | `[ ]` | `[ ]` | controller crash tests | commit recovery cases PASS partial | No fault injection before/after every allowed branch/worktree/stage/commit/push effect or unrelated-index matrix. |
| T029 | `[ ]` | `[ ]` | `adapters/subprocesses.py`, `redaction.py` | process-runner suite PASS with one Windows skip | Shell-free, bounded output/timeout/redaction exist; network policy and POSIX child-signal evidence are incomplete. |
| T030 | `[ ]` | `[ ]` | `codex_runner.py` | `test_codex_runner.py` PASS with one symlink skip | Fresh structured invocation exists; requested adapter/port contract and complete size/schema/identity boundaries are not all present. |
| T031 | `[ ]` | `[ ]` | `roles.py`, prompts, controller semantic gates | role/config/controller tests PASS partial | Context packages and Reviewer coverage checks exist; full forged-evidence/profile/debugger semantic matrix is incomplete. |
| T032 | `[ ]` | `[ ]` | Codex/role/guard tests | PASS partial | No four-process isolation/secret-canary integration fixture with full capability-log comparison. |
| T033 | `[ ]` | `[ ]` | feature metadata, task packages, renderer | artifact-related tests PASS partial | No authoritative artifact inventory/digest aggregation module or complete request-canary/Markdown-authority tests. |
| T034 | `[ ]` | `[ ]` | `lifecycle.py` planner composition | local CLI E2E PASS partial | Controller-owned planner artifacts work, but validation/profile/unsafe-path/drift acceptance matrix and planned use-case boundary are incomplete. |
| T035 | `[ ]` | `[ ]` | local CLI E2E | PASS partial | No independent US1 deterministic repeated journey with complete byte-preservation evidence. |
| T036 | `[ ]` | `[ ]` | `controller.py`, `lifecycle.py` | controller suite PASS partial | Sequential controller exists, but complete stop-aware authoritative replay/effect protocol is not implemented. |
| T037 | `[ ]` | `[ ]` | controller state/retry accounting | retry/crash tests PASS partial | Attempts count durably, but read-only/restart/no-progress lifecycle matrix and upstream state contract remain incomplete. |
| T038 | `[ ]` | `[ ]` | controller integration tests | PASS partial | No twice-reconstructed exact transition/dispatch/effect comparison and no durable stop case. |
| T039 | `[ ]` | `[ ]` | `write_surface.py`, hook path guard | traversal/junction tests PASS; 4 symlink cases skipped on Windows | Case collisions/submodules and actual POSIX symlink evidence are missing; skipped escape tests cannot establish completion. |
| T040 | `[ ]` | `[ ]` | `diff_guard.py`, controller | real-Git diff guard tests PASS partial | Real diffs are used and no auto-revert occurs; full rename/delete/mode/symlink/case quarantine matrix is incomplete. |
| T041 | `[ ]` | `[ ]` | `validation_runner.py`, profile JSON | validation tests PASS partial | Literal fixed argv/redaction exists; complete executable substitution/network denial/diff-binding matrix is absent. |
| T042 | `[ ]` | `[ ]` | guard/validation/controller tests | PASS partial | No consolidated acceptance matrix proving refs/index/unrelated files unchanged for every forbidden fixture. |
| T043 | `[ ]` | `[ ]` | Reviewer logic in `controller.py` | reviewer coverage/failed-validation tests PASS | Reviewer cannot override validation and must cover requirements, but full scope/security/maintainability and Reviewer-write matrix is incomplete. |
| T044 | `[ ]` | `[ ]` | debugger packaging/controller | debugger/retry tests PASS partial | Failure-only same-task flow exists; complete minimized-context, failure-signature and scope/profile-expansion tests are absent. |
| T045 | `[ ]` | `[ ]` | `retry_policy.py`, `controller.py` | retry suite PASS partial | Budgets/full-gate replay exist, but durable identical no-progress signatures and complete restart matrix are missing. |
| T046 | `[ ]` | `[ ]` | controller retry tests | PASS partial | No complete schema/diff/validation/review failure matrix with traceable repair/no-progress outcomes. |
| T047 | `[ ]` | `[ ]` | `git_service.py`, controller commit gate | real temp-Git commit tests PASS partial | Explicit staging/parent/trailers/hooks protection exists; schema/config/artifact trailer binding and full unrelated-index/tree matrix do not. |
| T048 | `[ ]` | `[ ]` | `git_service.py`, `recovery.py` | crash tests and real-trailer recovery PASS partial | Zero/one conflict slices exist; every object/ref/event boundary and tree/trailer ambiguity without cache is not covered. |
| T049 | `[ ]` | `[ ]` | local controller/CLI integration tests | local E2E PASS partial | Happy path creates local commits/no push; dependent/read-only/restart/full-gate acceptance mapping is incomplete. |
| T050 | `[ ]` | `[ ]` | `adapters/gh_cli.py` | fake argv/JSON and exact create argv PASS partial | Noninteractive bounded adapter exists, but the requested port and full auth/field-change argv contract are incomplete. |
| T051 | `[ ]` | `[ ]` | `publishing.py`, `git_service.py`, Git adapter | real bare-remote push + no-hook test PASS partial | Expected-SHA and protected branch gates exist; lost-response intention/recovery matrix is incomplete. |
| T052 | `[ ]` | `[ ]` | `pull_requests.py`, `GhCli` | PR service tests PASS partial | Create/reuse/blocking behavior exists; lost response/closed/full wrong-state acceptance matrix remains incomplete. |
| T053 | `[ ]` | `[ ]` | `checks.py` | all check classifications, stale SHA and timeout tests PASS partial | Polling is bounded/head-bound, but durable observation/policy and complete renamed/stop evidence are incomplete. |
| T054 | `[ ]` | `[ ]` | `ci_repair.py` | CI repair tests PASS partial | Mapping/budget slices exist; repair is not re-entered through the complete lifecycle gates/new push composition. |
| T055 | `[ ]` | `[ ]` | mocked draft services E2E | mocked E2E PASS | Service composition is mocked only; CLI cannot reach manual-review readiness and full bare-remote/fake-gh history suite is absent. |
| T056 | `[ ]` | `[ ]` | `recovery.py` | recovery conflict + real-trailer tests PASS partial | Fixed-order local/remote/PR slices exist, but checks/effects/full cache-deleted published rebuild are incomplete. |
| T057 | `[ ]` | `[ ]` | CLI `status --rebuild`/`resume`, lifecycle | CLI/recovery tests PASS partial | Status rebuild exists; resume blocks valid completed/blocked boundaries and does not fully revalidate config/budgets/mode transitions. |
| T058 | `[ ]` | `[ ]` | Stop hook only | hook test PASS partial | No controller `stop` command, durable stop request or safe-boundary dispatch enforcement. |
| T059 | `[ ]` | `[ ]` | CLI abort marker | CLI abort case PASS partial | Abort preserves artifacts, but ownership/reconciliation and optional clean non-forced worktree removal matrix are absent. |
| T060 | `[ ]` | `[ ]` | state events and sanitized evidence | redaction/state tests PASS partial | No bounded event/status audit command, filters/correlation or JSONL inspection surface. |
| T061 | `[ ]` | `[ ]` | recovery/crash tests | PASS partial | Stop is absent and full privileged-boundary/snapshot-present-deleted-corrupt acceptance matrix is missing. |
| T062 | `[ ]` | `[ ]` | `.codex/rules/studio-loop.rules` | real `codex execpolicy check` tests PASS | Rules meet the isolated behavior, but dependency tasks T027/T029/T031 remain incomplete; full controller-independent matrix is open. |
| T063 | `[ ]` | `[ ]` | `.codex/hooks.json`, `.codex/hooks/*.py` | hook tests including real Edit/Write payloads PASS | Hooks fail closed and never continue, but dependency T058 (durable controller stop) is absent. |
| T064 | `[ ]` | `[ ]` | controller guards + project-guard tests | guard tests PASS partial | No complete protections-on/off mode/effect matrix; upstream enforcement tasks remain incomplete. |
| T065 | `[ ]` | `[ ]` | architecture/runbook/troubleshooting | links/skills tests PASS partial | Docs now state actual boundaries, but requested profile/exit/stop coverage and dedicated documentation test are incomplete because `stop` does not exist. |
| T066 | `[ ]` | `[ ]` | `studio-new-feature`, `studio-status` skills | skills guidance test PASS partial | Safe CLI guidance exists; exact comprehensive frontmatter/mode/effect suite and dependency T065 remain open. |
| T067 | `[ ]` | `[ ]` | `studio-resume`, `studio-abort` skills | skills guidance test PASS partial | Skills preserve evidence, but complete reconciliation/stop cases cannot pass while controller stop/resume is incomplete. |
| T068 | `[ ]` | `[ ]` | root `AGENTS.md` | guidance/skills test PASS partial | Core invariants are documented, but policy/docs prerequisites are not complete and no dedicated negative guidance contract exists. |
| T069 | `[ ]` | `[ ]` | dispersed CLI/controller/service tests | PASS partial | No exhaustive command/effect × three-mode matrix; draft-pr CLI composition and stop are missing. |
| T070 | `[ ]` | `[ ]` | temp-repository local CLI/controller tests | local E2E PASS | Uninterrupted local flow passes, but restart/stop at every phase and exact final evidence comparison are absent. |
| T071 | `[ ]` | `[ ]` | `test_draft_pr_services.py` | mocked draft E2E + bare remote PASS partial | Service-level fake flow passes; no idempotent lifecycle composition across lost response/head movement/repair. |
| T072 | `[ ]` | `[ ]` | guard/path/process/controller tests | adversarial slices PASS; symlink skips remain | No consolidated canary scan of prompt/log/artifact/commit/PR evidence and no POSIX run yet. |
| T073 | `[ ]` | `[ ]` | `.github/workflows/autonomous-loop-ci.yml`, `test_ci_workflow.py` | local workflow policy test PASS; local equivalent gates PASS | Required matrix and action pinning are configured, but actual GitHub Windows/Ubuntu results are not observed; dependencies remain open. |
| T074 | `[ ]` | `[ ]` | `quickstart.md`, tool README | documented command subset executed PASS | No `doctor`/`stop`, smoke-doc test, usability protocol or 9/10 participant evidence. |
| T075 | `[ ]` | `[ ]` | none | deliberately not run | Disposable real-GitHub test is absent and explicitly unauthorized for this review. |
| T076 | `[ ]` | `[ ]` | schema tests + this reconciliation | local quality gates PASS partial | No complete FR implementation traceability, schema synchronization or canonical-view drift test; application source was not changed. |
| T077 | `[ ]` | `[ ]` | release review and quickstart evidence | no-mutation audit in progress/PASS partial | Draft-pr CLI, completed-boundary resume, cross-platform CI and T075/T076 are blockers, so readiness criteria are not met. |

## Scope-drift assignment

Implemented slices were assigned to their existing outcome tasks even where filenames differ:
`controller.py`/`lifecycle.py` map to T034/T036-T049, `write_surface.py` maps to T039/T042,
the flat draft service tests map to T050-T056/T071, and the dedicated workflow requested by the
release review maps to T073. These assignments do not rewrite the original paths or hide the
unimplemented portions; therefore no additional reconciliation task was added.
