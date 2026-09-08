# Resume State

## Branch and current scope
`fix/audit-p0-stability-accessibility`. Implement all UX-001..028; document owner/credential/artifact blockers without inventing evidence. No deployment. Production remains 8386de6.

## Last completed local work
UX-001..006 have local implementations. Commercial conditions (UX-003) and deployment verification remain blocked; see BLOCKERS.md. UX-005/006 follow-up verifies five native service links, six legacy fragment targets and one native contact CTA. Contact current-page semantics ignore topic query parameters.

## Verification
* Latest full frontend: 207 Angular tests plus Node suites; lint and format passed. Targeted shell rerun after contact active-link options.
* Latest production build: 16 prerender routes, enforced CSP/SEO/legal/artifact validators passed.
* hub-browser.json: eight widths 320..1440, no overflow/nav overlap/hydration errors; UI/schema breadcrumbs, section-active state, real no-JS links. At 390px hub height 10285 -> 3293px, first card top 1443 -> 318px.
* Offer browser: all five service intents/manual topic override, seven widths passed.
* Backend Python 3.12 venv: dev lock/editable install, ruff/format and 84 pytest passed after allowlisted optional serviceContext.
* Deployment contract 60 and Cloud Build YAML 23 tests passed before latest UI changes.
* Both Docker images built at P0. Final rebuilds and real backend health smoke still required after backend changes. Real SMTP config unavailable (B-006).
* P0: 12 cold local runs CLS 0, no zero main/hydration errors; home axe eight widths and real no-JS passed. Local LCP not comparable to original network-throttled Lighthouse.

## Exact next action
1. Check git and finish UX-005/006 checkpoint if uncommitted.
2. UX-008: remove simulated latency/confidence, align DOM input/result sequence, mobile result focus with one accessible update; retain local-only matching/fallback/reset, categories and three initial examples.
3. UX-009: central evidence registry/provenance/limits/publication gating. Then UX-007 shorten home, move evidence before repeated process descriptions, measure before/after.
4. Continue UX-010..028 from BACKLOG.md. Commit every 1-3 coherent tasks with evidence/status updates.

## Known failures / remaining gates
No known failing local check. No deployment, final production-contract resolution, real container health smoke or comparable Lighthouse rerun. Default python is Anaconda 3.9: use backend/.venv/Scripts/python.exe (3.12). Not merge ready.

## Do not redo or regress
* Audit already read. Preserve executable inline JS rejection. Angular22 needs withNoIncrementalHydration() to disable default replay while hydrating.
* CSS scripting media stabilizes prebootstrap menu and preserves no-JS. Contact fallback uses stable DOM, not Angular content in noscript.
* Route main focus uses preventScroll; ViewportScroller offsets fragments for header.
* Never use frontend/.public-legal-config.json (pre-existing fake administrator/corrupt strings). Ignored published-legal.json is exact current public text, not legal approval/Secret Manager verification.
* Run build via child powershell -NoProfile -File tmp/audit-implementation/build.ps1 to avoid changing caller cwd. Do not run build and npm test/lint concurrently: shared generated legal module.
* Restore ONLY generated environment.prod.ts and index.html from master before commits. Preserve user changes.
* PowerShell non-ASCII pipes need UTF-8 OutputEncoding; prefer apply_patch.

## Tools and evidence
Ignored tmp/audit-implementation: build.ps1, serve.cjs (127.0.0.1:4400), measure.cjs, a11y.cjs, interactions.cjs, phase-b.cjs, hub-browser.cjs and logs. Server may need restart. Committed results: implementation-evidence/. Preserve reusable tracked browser harness in final verification.

## Last known good local commit
3984faa offer/contact passed 211 frontend + 84 backend tests, build/browser. e901b63 hub required validator follow-up; current checkpoint closes that failure. No production/merge approval.
