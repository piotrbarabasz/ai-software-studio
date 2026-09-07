# Resume State

## Current branch
`fix/audit-p0-stability-accessibility`

## Last completed task
No task has all acceptance criteria completed, including production verification. P0 has local evidence.

## Current task
UX-003/004 central offer model and contact intent. P0 local verification complete; production gates remain B-006.

## Current hypothesis / root cause
Angular 22 enables incremental hydration/event replay by default. `withNoIncrementalHydration()` preserves hydration without executable inline scripts. Mobile expanded navigation before bootstrap caused remaining CLS 0.621; CSS scripting media preserves initial geometry and real no-JS navigation. Dynamic DOM inside noscript caused hydration TypeError; stable DOM with scripting CSS fixes it. Home CTA styles overrode dark semantic colors.

## Files currently involved
* app.config.ts, shell/contact HTML and SCSS, home SCSS
* frontend/scripts/*csp*, script-attributes.cjs
* implementation-evidence/ (persistent results)
* shell focusMainContent and styles.scss focus color: follow-up in progress

## Tests already passed
* npm ci, lint, npm test: 204 Angular tests plus Node suites.
* Production npm build: 16 prerender routes, CSP/SEO/legal/artifact validators.
* Python 3.12 backend venv: dev lock + editable install, ruff check/format, pytest 75.
* Deployment contract unittest 60, Cloud Build YAML unittest 23.
* Both images built: aisoftware-studio-api:local, aisoftware-studio-web:audit.
* 12 cold runs (home, demo, RAG, contact x3): 390x844, CPU x4, fresh contexts/cache disabled, local server without network throttling. CLS 0, no zero main or hydration errors. Raw results in implementation-evidence.
* Home axe at 320/360/390/430/768/921/1024/1440 reduced motion: zero violations and overflow. Real javaScriptEnabled:false verifies menu and email. Skip and Escape work.
* Browser invalid contact focuses error summary; fields have errors. Hover CTA colors are readable. Focus outline needed lighter dark-section color.

## Tests still required
* Final lint/format/tests/build after follow-up; anchor scroll check (focus used to undo it).
* Comparable LCP baseline: local timings cannot be compared directly to production Lighthouse.
* Backend real container health smoke and resolved production contract need real SMTP non-secret vars (B-006).
* New production build verification not performed; do not mark merge ready.

## Known failing test / command
No currently failing local check. Full suite 204 passed; shell suite passed after scroll offset; production build passed. Fragment/form/focus browser checks passed. Original audit Lighthouse versus local timings are not directly comparable. Default Python is Anaconda 3.9; use backend/.venv/Scripts/python.exe (3.12).

## Exact next action
1. UX-003/004: central neutral first-stage definitions, distinct simulation/presentation/production, service contact context and correct Voice/agent topics; preserve manual topic changes.
2. Verify changed content/contact behavior, production build and desktop/mobile; checkpoint.
3. UX-005/006 hub/navigation, then UX-007/008 home/simulation, UX-009 proof registry; proceed through all 28 tasks without waiting for owner blockers.

## Do not redo
* Full audit already read. Do not audit from scratch.
* Do not re-enable event replay or automatically hash executable inline JS.
* No fabricated legal config, pricing, provider results, customer proof or SMTP.
* Restore generated environment.prod.ts and index.html from master after builds before committing.
* PowerShell piping non-ASCII into Python needs UTF-8 OutputEncoding; prefer apply_patch for source edits.

## Last known good commit
`6bb3e90` for local P0 behavior only; not merge ready.

## Uncommitted work
None after checkpoint; always inspect git status.

Local tools: tmp/audit-implementation/build.ps1, serve.cjs (port 4400), measure.cjs, a11y.cjs, interactions.cjs. Server session may need restart. Logs in that directory. Build uses production contract public values and an exact copy of currently published legal text (build 8386de6), not invented input. This is not verification against Secret Manager or legal approval. Never use frontend/.public-legal-config.json: pre-existing fake administrator and corrupted strings.
