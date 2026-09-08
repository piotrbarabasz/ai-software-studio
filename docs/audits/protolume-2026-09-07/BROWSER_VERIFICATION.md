# Reproducing the local browser checks

These checks operate only on the local production artifact at `http://127.0.0.1:4400`. They do not deploy, submit contact messages or establish production delivery. Browser automation uses the repository's Playwright version and pinned axe-core 4.13.0 dev dependency.

1. In frontend, run `npm ci` and ensure Playwright Chromium is installed (`npx playwright install chromium`).
2. Build the production artifact using the required public configuration and a verified legal source, following existing deployment documentation. Never substitute an invented administrator or pricing. Local tests may use the already published privacy text as documented in RESUME.md, but that is not Secret Manager verification or legal approval.
3. Start `npm run serve:browser:ux` in frontend. It serves the artifact with the generated, enforced CSP on loopback only. Stop any prior process on this port that belongs to this audit before starting it. Restart after rebuilding so it reads the current CSP.
4. In another shell in frontend, run `npm run smoke:browser:ux`.

Results and screenshots are written under ignored `tmp/audit-implementation/verification/`. Reviewed checkpoint snapshots are stored under `implementation-evidence/`; running the harness does not overwrite those baselines.

| Script | Scope |
| --- | --- |
| audit-hub-browser.cjs | Eight widths; first mobile card; navigation bounds/overlap; native no-JS contact; active-page semantics; visible/schema breadcrumb presence |
| audit-simulation-browser.cjs | Four widths x two motion preferences; three questions; result focus/visibility; category/reset/fallback; one CTA; no requests during questions; component axe in reduced-motion cases |
| audit-home-browser.cjs | Eight widths; page/evidence geometry; zero hero animations; page axe; screenshot snapshots; expandable plan; deep link; Studio artifact targets; real no-JS plan and service links |

The simulation script also records current home geometry. The original before-home-change values are preserved in `implementation-evidence/simulation-browser.json` and must not be replaced by a later rerun.

The local server is not nginx: production redirects, caching and final HTTP/security headers still require the production-container checks. axe and focus assertions do not replace a physical screen reader test. Local timings are not comparable to the audit's network-throttled Lighthouse run. Engineering timings do not prove business savings or conversion uplift.
