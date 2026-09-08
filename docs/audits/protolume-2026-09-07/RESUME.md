# Resume State

## Current branch
`fix/audit-p0-stability-accessibility`

## Last completed local work
UX-001..009 have local implementations; none is a verified new production deployment. UX-022 also has the static Polish hero and non-sticky no-JS header fix. See IMPLEMENTATION_STATUS.md and BLOCKERS.md for incomplete acceptance criteria. Production remains 8386de6.

UX-005/006: one service catalog, native links/legacy fragments, section-active state and breadcrumbs; validator updated for the single native contact CTA (18aee28).
UX-008: immediate local prepared responses, compact category select, three examples, one CTA, focus at answer heading and reset at category; no confidence/latency simulation (2fb4c67).
UX-007/009 current checkpoint: six home sections, static illustrated hero, compact before/after, earlier evidence, five native service rows, deliverables before expandable timeline. Shared evidence registry/labels/provenance and publication gate; no unsupported R&D proof card. No-JS expanded header scrolls with content instead of blocking it.

## Current verification
* Fresh npm ci, lint, format and all Node suites + 197 Angular tests passed. Removed obsolete tests for deleted animations/scrollytelling, retained content/accessibility constraints and added publication gates.
* Production npm build passed after fresh install: 16 prerendered routes and all enforced CSP/SEO/legal/artifact validators.
* npm run smoke:browser:ux passed via committed scripts and local enforced-CSP server: hub eight widths, simulation eight width/motion cases, home eight widths, axe, real no-JS and native details, fragment link and existing Studio artifact targets. Browser/tool versions are in checkpoint JSON metadata.
* At 390px home height 11808 -> 6545px (about 45% shorter), example/evidence section starts 5761 -> 1106px; actual material cards now start at 1987px; hero primary CTA bottom 482px. Baseline simulation-browser.json is preserved. New home-browser.json and screenshots are reviewed.
* At 390px hub height 10285 -> 3293px; first card 1443 -> 318px. Simulation answer heading top ~110px, no question requests/errors/overflow. Physical screen reader remains B-005.
* Earlier backend: Python 3.12 venv lock/editable install, ruff/format, 84 pytest tests passed after optional allowlisted serviceContext. Earlier deployment contract 60 and Cloud Build YAML 23 tests passed.
* P0 earlier 12 local cold runs: CLS 0, no zero main/hydration errors. Repeat final performance checks after remaining edits. Local LCP cannot be compared to original network-throttled Lighthouse.

## Exact next action
1. Inspect git status and finish current UX-007/009 checkpoint if still uncommitted; generated env/index templates must be restored before commit.
2. Read UX-010/011 acceptance criteria and UX-025 data-flow dependencies. Provider/model/budget/retention/credentials remain B-002: implement safe disabled provider interfaces, bounded public corpus/retrieval, citation schema and evaluation harness without a public AI endpoint or invented model results. Record each untested provider criterion explicitly. The user authorized safe independent scaffolding under blockers.
3. UX-011 may improve source-specific layout and use the honest simulation link; actual RAG proof remains blocked until UX-010 can run. Then continue UX-012..028. Do not stop the backlog just because provider, CRM, recording or owner inputs are absent.
4. Keep checkpoints every 1-3 coherent tasks. Final review must revisit all routes, copy, dead code (old unused bento/business-flow/proof visual primitives and content remain), performance, SEO, physical accessibility, Docker and deployment gates.

## Known failures / remaining gates
No known failing current local check. No deployment or final production contract/container health smoke. Final Docker rebuilds required after all backend/frontend changes. Non-secret SMTP values and verified current legal Secret Manager data remain B-006. Commercial rules B-001, real CRM proof B-003, owner/photo/audio/customer rights B-004, privacy/calendar/research participants B-005. Not merge ready.

## Files and reproducible tools
BROWSER_VERIFICATION.md documents committed frontend/scripts/audit-*-browser.cjs and serve-audit-artifact.cjs. Frontend npm commands: serve:browser:ux (127.0.0.1:4400), smoke:browser:ux. axe-core 4.13.0 pinned as a dev dependency; unrelated lockfile deduplication was reverted. Results go to ignored tmp/audit-implementation/verification and do not overwrite committed baselines.

EVIDENCE_INVENTORY.md maps existing materials to confirmed claims and absent proof. Shared source is frontend/src/app/core/content/evidence.pl.ts. The metadata gate verifies completeness, not truth or legal permission.

Ignored build.ps1 uses an exact copy of current published privacy text, not legal approval/Secret Manager verification. Invoke in child PowerShell: powershell -NoProfile -File tmp/audit-implementation/build.ps1. Local server may need restart after builds to reload CSP. Logs in tmp/audit-implementation. Default Python is Anaconda 3.9; use backend/.venv/Scripts/python.exe (3.12).

## Do not regress
* Preserve executable inline JS rejection. Angular22 needs withNoIncrementalHydration() to disable default replay while keeping hydration.
* CSS scripting media stabilizes prebootstrap menu and retains genuine no-JS. No-JS header must not remain sticky over expanded navigation. Contact fallback is stable DOM rather than Angular content in noscript.
* Main focus preserves fragment scrolling; ViewportScroller accounts for sticky header.
* Never use frontend/.public-legal-config.json: it contains pre-existing invented/corrupt local legal values.
* Do not run npm build concurrently with npm test/lint (shared generated legal module).
* Restore ONLY generated environment.prod.ts and index.html from master before commit; preserve user changes.
* PowerShell non-ASCII pipes require UTF-8 OutputEncoding; prefer apply_patch.

## Last known good local commits
18aee28 hub/navigation, 2fb4c67 local simulation. Current home/evidence checkpoint is fully locally checked as above. No production or merge approval.

## Uncommitted work
The checkpoint includes UX-007/009 source, test harness, dev dependency, evidence and status files. No pending implementation fix is intentionally left outside it. Confirm git status for later changes; generated env/index templates were restored before committing.
