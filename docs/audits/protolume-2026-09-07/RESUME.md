# Resume State

## Current branch and baseline

`fix/audit-rag-foundation`, created from clean `master` at `0d38ef8` (user's merge of PR #56). Previous home/evidence work is `2d50720`; local simulation `2fb4c67`. No push, PR, merge or deployment performed during this checkpoint. Last observed production was 8386de6; current deployment after the user merge is unverified.

## Current checkpoint: UX-010/011/025

* Shared public corpus with three actual document sections; bounded offline lexical retrieval and an explicitly disabled provider boundary. No RAG endpoint, adapter, credentials or new environment variable. Call reservations and exact retrieved-quote validation are implemented, but do not establish monetary cost control or model quality.
* Fixed 12-case retrieval observation: 10 matched expectations; two paraphrase failures retained with per-case detail and file hashes. Zero model calls. The 28 boundary tests use doubles only. RAG_FOUNDATION.md separates implemented behavior from every open real-provider criterion.
* RAG landing now has three manually prepared questions, a missing-information answer, exact source quotes, a real expandable document and JSON download. Two desktop columns, source/return focus on mobile, three topic-specific FAQ and compact scope. Clearly labelled simulation. Shared evidence registry now has four records in Studio; home keeps two.
* Native citation links include the landing path: bare fragments resolved against Angular's root base and broke no-JS navigation; browser testing found this and the link was corrected.
* DATA_FLOW_MAP.md inventories contact/API/SMTP/hosting/logs/limiter/simulations and prospective RAG/calendar/analytics. Public privacy text and consent/API remain unchanged pending actual owner/legal decisions.

## Verification

* Backend dev lock/editable install, ruff check/format and 112 pytest cases passed (28 focused RAG tests).
* Fresh frontend npm ci, lint, format, Node suites and 200 Angular tests passed. After the native citation fix, all three source-component tests passed again.
* Production npm build passed after the citation correction: prerendered routes and enforced CSP/SEO/legal/artifact validators. Build inputs use the previously published privacy text copy, not verified Secret Manager data or legal approval.
* Contract CLI 60 and Cloud Build YAML 23 tests passed. Both Docker images built successfully, including a frontend rebuild after the native citation correction. The running nginx container returned 200 for the landing and matching JSON, enforced CSP, and true 404 with `noindex, follow`. The temporary container was stopped after inspection.
* Existing `smoke:browser:ux` passed: hub, original simulation, home, four Studio targets and native no-JS. New `smoke:browser:rag` passed eight widths, opening/return focus, no interaction requests, absent-information state, axe with zero violations, source JSON equality, contact intent and fragment links with/without JavaScript. Desktop/mobile screenshots reviewed; mobile focused passage begins at 110px, below the header. See checkpoint evidence and BROWSER_VERIFICATION.md.
* No backend production health/readiness smoke: actual non-secret SMTP settings are still missing (B-006). No final resolved production contract or deployed-version verification. Not merge/deployment ready.

## Exact next action

1. Confirm git status/history and finish this checkpoint only if subsequent uncommitted changes remain. Preserve unrelated work; restore only generated env/index templates before committing.
2. Proceed to UX-012/014 and update UX-025 for the proposed CRM/channel flow. Read their BACKLOG.md criteria first. B-003 lacks the CRM sandbox and official channel: implement the independent domain model, approval/idempotency boundaries and deterministic adapter tests using test-only doubles; prepare setup instructions and an artifact publication gate. Do not expose fake writes, customer conversations, empty proof pages or fabricated screenshots as an integration.
3. Continue UX-013/015..028 with safe independent work when real artifacts/owner answers are absent. Collect owner questions in BLOCKERS.md. Keep checkpoints every 1–3 coherent tasks; the final comprehensive report follows all 28 tasks.
4. Revisit all routes, unused visual primitives/content, copy, performance, SEO, physical accessibility and full container/deployment gates at final review. UX-001..009 remain partial where production or real-artifact criteria are open.

## Preserved earlier observations

Home 390px: 11808 -> 6545px height; evidence section 5761 -> 1106px, actual cards 1987px, primary CTA bottom 482px. Hub 390px: 10285 -> 3293px, first card 1443 -> 318px. Earlier 12 local cold runs: CLS 0, no zero main/hydration errors. These engineering observations are not current production, conversion results or comparable to the original network-throttled Lighthouse LCP.

## Tools and precautions

* `frontend/scripts/audit-*-browser.cjs`, `serve-audit-artifact.cjs`; npm `serve:browser:ux`, `smoke:browser:ux`, `smoke:browser:rag`. Loopback 4400; restart the verified audit process after rebuilding to reload CSP. Results/logs go to ignored `tmp/audit-implementation`; reviewed snapshots in `implementation-evidence/`.
* Use Python `backend/.venv/Scripts/python.exe` (3.12), not default Anaconda 3.9. Docker Desktop may need starting. Local image build SHA is the base commit 0d38ef8 plus uncommitted checkpoint source; it is not a deployed revision.
* Invoke local build in a child process: `powershell -NoProfile -File tmp/audit-implementation/build.ps1`. Its legal input is an exact copy of previously published text. Never use `frontend/.public-legal-config.json` (pre-existing invented/corrupt values).
* Do not run npm build concurrently with npm test/lint: they share generated legal content. Restore only generated `frontend/src/environments/environment.prod.ts` and `frontend/src/index.html` from master before commit.
* Preserve strict executable inline-JS rejection and `withNoIncrementalHydration()`. Keep CSS scripting media for stable prebootstrap/no-JS navigation, non-sticky no-JS header, stable contact fallback DOM and fragment-aware focus/scroll offsets.
* PowerShell non-ASCII pipes require UTF-8 OutputEncoding; prefer apply_patch for Polish. Never guess SMTP, secrets, legal facts, commercial terms or real artifact outcomes.

## Remaining blockers

B-001 commercial rules; B-002 provider/budget/retention; B-003 CRM/channel sandbox; B-004 audio/photo/customer rights; B-005 privacy/calendar/research/physical screen reader; B-006 production non-secret SMTP, verified legal configuration and deployment/container verification. These do not block the independent next checkpoint.
