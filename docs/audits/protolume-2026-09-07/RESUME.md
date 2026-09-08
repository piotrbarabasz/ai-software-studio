# Resume State

## Current branch

`fix/audit-rag-foundation`, continuing from `9bbe8d5`; master baseline `0d38ef8` is the user's PR #56 merge. No push, PR, merge or deployment in the CRM checkpoint. Last observed production SHA was 8386de6; the current deployment is unverified.

## Last completed task

Independent UX-012/014 scaffolding and UX-025 data-map update. These tasks are PARTIAL, not actual CRM proof. Previous UX-010/011 checkpoint is `9bbe8d5`; its RAG is still a labelled manual simulation plus a dormant backend boundary.

## Current task

Close the CRM checkpoint and continue the remaining backlog. No implementation defect is intentionally deferred within the completed local scope.

## Current hypothesis / root cause

Real CRM/channel execution is absent because B-003 lacks the selected sandbox, official channel and permissions. Test-only adapters establish control logic, not integration. Actor labels do not authenticate approval; sandbox metadata does not enforce network isolation; process memory does not provide durable idempotency.

## Files currently involved

* `backend/app/crm/{models,workflow,artifacts}.py`: normalized bounded input; version-bound approval, replay/conflict handling, one in-flight write, uncertain result/readback and offline evidence checks. Default adapter absent; no endpoint/env/credentials.
* `backend/scripts/validate_crm_artifact.py`, `backend/tests/unit/test_crm_{workflow,artifacts}.py`: private package integrity/metadata gate and 38 new tests with fixture adapters.
* `frontend/src/app/shared/crm-run-result.component.*`: unmounted read-only three-step result scaffold, explicit missing/uncertain/local-test states; no public actions or API calls.
* `CRM_FOUNDATION.md`, `DATA_FLOW_MAP.md`, status/blockers/inventory and `implementation-evidence/crm-checkpoint.json`: implemented scope, real-provider setup, unverified criteria and test observations.

## Tests already passed

* Backend dev lock/editable install, ruff lint/format, full pytest: **150 passed**. New CRM coverage: missing fields, revision approval, rejection, replay/conflicts/namespacing, concurrency, cancellation/timeout, ambiguous write readback, definite-no-write retry, matching receipts, artifact paths/hashes/metadata and sanitized CLI failures.
* Fresh frontend npm ci, lint, format and all Node suites + **203 Angular tests**. Component tests verify escaping, missing/uncertain state and fixture-success labelling.
* Production npm build and all enforced CSP/SEO/legal/artifact validators passed. Neither the unused CRM component nor fixture markers appear in emitted HTML/JS.
* Deployment contract **60** and Cloud Build YAML **23** tests passed. Both Docker images built successfully. Python CLI syntax covered by lint/import/tests; no deployment scripts changed.
* Prior RAG checkpoint: eight-width browser/axe, native no-JS and source focus; nginx 200 for landing/JSON and real 404 `noindex, follow`. No public-page layout changed in the CRM checkpoint, so those browser suites were not repeated.

## Tests still required

Actual CRM/official-channel execution, sandbox isolation and atomic idempotency across restart/workers, authenticated approval, extraction/customer/owner mapping, reviewed recordings/traces and mounted result browser/physical accessibility. B-003/B-005.

Backend production container `/health` and `/ready` smoke remains B-006: missing actual non-secret SMTP settings. Final resolved production contract, verified Secret Manager legal input and deployed-version verification remain open. Local build uses the exact previously published privacy text copy; this is not legal approval. Not merge/deployment ready.

## Known failing test / command

No current failing local check. Required backend production smoke has not been run with guessed SMTP. No external messages or CRM records were sent/written. Real RAG observation still retains its two lexical paraphrase failures (10/12), separately from passing unit tests.

## Exact next action

1. Inspect Git status/history; finish this checkpoint only if subsequent uncommitted changes remain. Preserve unrelated work.
2. Read UX-013/015 acceptance criteria. Where B-004 audio/rights and B-002 provider are absent, implement only useful independent artifact/trace interfaces, gates, accessible presentation and setup guidance; never publish empty players or fake agent traces. Do not duplicate the CRM approval machinery or the existing RAG provider boundary without a concrete need.
3. Then proceed to UX-016/017, which can use the real public-site repository/CI as an own-project artifact, followed by remaining UX-018..028. Keep owner questions in BLOCKERS.md and checkpoints every 1–3 coherent tasks. The final comprehensive report follows all 28 tasks.

## Do not redo

* Earlier home, navigation, original simulation and RAG source fixes are committed. Preserve the four-record evidence registry (home displays two) and honest classification. No CRM proof record exists.
* Preserve strict executable inline-JS rejection, `withNoIncrementalHydration()`, stable prebootstrap/no-JS navigation, non-sticky no-JS header, stable contact fallback DOM and fragment-aware focus/scroll offsets. RAG citations need the full landing path because of Angular's root base URL.
* Never use `frontend/.public-legal-config.json` (pre-existing invented/corrupt values). Local child build: `powershell -NoProfile -File tmp/audit-implementation/build.ps1`. Do not run it concurrently with npm test/lint; they share generated legal content. Restore only generated env/index templates from the starting commit before committing.
* Use `backend/.venv/Scripts/python.exe` (3.12), not default Anaconda 3.9. Docker Desktop may need starting. Current local image build labels use base 9bbe8d5 plus uncommitted checkpoint source, not a deployed revision.
* Browser scripts and loopback server are documented in BROWSER_VERIFICATION.md; restart only the verified audit server on port 4400 after builds to reload CSP. Logs/results are under ignored `tmp/audit-implementation`.
* Prior engineering metrics are preserved in committed evidence: home 390px 11808 -> 6545px height, proof section 5761 -> 1106px; hub 10285 -> 3293px, first card 1443 -> 318px; prior 12 local cold runs CLS 0. These are not production/conversion results or comparable LCP measurements.
* Never guess commercial/legal facts, secrets, provider settings, real recordings or client outcomes. No new environment variable was introduced in these two checkpoints.

## Last known good commit

`9bbe8d5` for the preceding checkpoint; the following CRM checkpoint is identified by Git history. Current tests are recorded above and in `implementation-evidence/crm-checkpoint.json`.

## Uncommitted work

CRM checkpoint source/tests/docs are intended to be committed together. Generated env/index templates were restored. Check Git status for any changes added after this note.
