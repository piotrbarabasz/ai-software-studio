# Reproducing the local browser checks

These checks operate only on a local production artifact: the audit server at `http://127.0.0.1:4400` or production nginx container at `http://127.0.0.1:4403`. They do not deploy, submit contact messages or establish production delivery. Browser automation uses the repository's Playwright version and pinned axe-core 4.13.0 dev dependency.

1. In frontend, run `npm ci` and ensure Playwright Chromium is installed (`npx playwright install chromium`).
2. Build the production artifact using the required public configuration and a verified legal source, following existing deployment documentation. Never substitute an invented administrator or pricing. Local tests may use the already published privacy text as documented in RESUME.md, but that is not Secret Manager verification or legal approval.
3. Start `npm run serve:browser:ux` in frontend. It serves the artifact with the generated, enforced CSP on loopback only. Stop any prior process on this port that belongs to this audit before starting it. Restart after rebuilding so it reads the current CSP.
4. In another shell in frontend, run `npm run smoke:browser:ux`.
5. For the RAG source example, also run `npm run smoke:browser:rag`.

Results and screenshots are written under ignored `tmp/audit-implementation/verification/`. Reviewed checkpoint snapshots are stored under `implementation-evidence/`; running the harness does not overwrite those baselines.

| Script | Scope |
| --- | --- |
| audit-hub-browser.cjs | Eight widths; first mobile card; navigation bounds/overlap; native no-JS contact; active-page semantics; visible/schema breadcrumb presence |
| audit-simulation-browser.cjs | Four widths x two motion preferences; three questions; result focus/visibility; category/reset/fallback; one CTA; no requests during questions; component axe in reduced-motion cases |
| audit-home-browser.cjs | Eight widths; page/evidence geometry; zero hero animations; page axe; screenshot snapshots; expandable plan; deep link; Studio artifact targets; real no-JS plan and service links |
| audit-rag-browser.cjs | Eight widths; exact document/quote matching; source and return focus; missing-information state; no interaction requests; axe; downloaded JSON equality; contact intent; fresh citation fragments with/without JavaScript; native no-JS citation |

The simulation script also records current home geometry. The original before-home-change values are preserved in `implementation-evidence/simulation-browser.json` and must not be replaced by a later rerun.

The local server is not nginx: production redirects, caching and final HTTP/security headers still require the production-container checks. axe and focus assertions do not replace a physical screen reader test. Local timings are not comparable to the audit's network-throttled Lighthouse run. Engineering timings do not prove business savings or conversion uplift.

## Private Voice/agent component preview

`npm run build:artifact-preview`, `npm run serve:artifact-preview` (loopback 4402), then `npm run smoke:artifact-preview`. This is a separate non-production build, not a public route. It contains one second of silent PCM and explicitly labelled trace fixtures; no voice conversation, AI call or external operation is executed. Production isolation is enforced by `validate:preview-isolation` in the normal build. See VOICE_AGENT_ARTIFACTS.md for all limits.

`audit-artifact-preview.cjs` checks eight widths, keyboard play/pause, seeking/end, zero initial media requests, a real missing-file error with preserved transcript, keyboard native details, timeout/budget states, axe and overflow. It writes `artifact-preview-browser.json` and desktop/mobile screenshots under the same ignored verification directory. The preview's fixed style nonce is test-only; production CSP is not changed.


## Own-project source, studio and contact checkpoint

After a production build, restart the verified loopback artifact server to load its new CSP. Run `npm run smoke:browser:engineering` and `node scripts/audit-studio-contact-browser.cjs` from frontend. `AUDIT_BASE_URL` can target a locally running production nginx image; it is a test-harness input, not an application/deployment variable.

The engineering harness covers both routes at 320/360/390/430/768/921/1024/1440, one H1/unique IDs/overflow, axe, native keyboard details, JS and no-JS anchors, exact first-party download bytes and plain-text MIME, and contact topic preservation. No-JS position is polled from Playwright; it does not depend on page timers. The source list starts collapsed to keep the downloadable example compact.

The studio/contact harness checks the same eight widths, axe, keyboard/native details and mailto without JavaScript. It measures first-input position at 390 × 844 and tests form 422/429/503/network failure and success with route interception before dispatch. Entered data and error-summary focus must survive every failure. No real lead is sent.

Results and reviewed screenshots are copied to `implementation-evidence`. Studio at 390px changed from 8903 to 4236px; first evidence from y=2511 to y=1195. Initial visible word count fell from 642 to 285; total DOM text from 633 to 453. These are local layout/copy observations, not conversion evidence; closed native details remain available to users and assistive technology. Real physical-device/screen-reader checks remain B-005.

## Final route, report and R&D review

`node scripts/audit-final-browser.cjs` checks the 15 routes from the real sitemap at eight widths (120 layout cases), with axe at 320/390/1440 (45 scans). It reads each page without JavaScript to verify HTML content, one H1, unique metadata, canonical/OG, JSON-LD and IDs. It follows same-origin links/anchors/assets, checks the contact-query canonical, true 404/noindex, PDF MIME/bytes/native download, print visibility and four fragment targets below the sticky header.

The reflow check uses 720 CSS pixels with deviceScaleFactor 2. This approximates the available layout width at 200% on a 1440px display; it does not certify actual browser UI zoom, a physical device or assistive technology. Those checks remain explicitly open.

For production-hosting behavior run the harness against a local nginx container using `AUDIT_BASE_URL=http://127.0.0.1:4403`. It refuses non-loopback origins. This is a test input only. A passing frontend container does not replace the required backend production health/readiness smoke or a resolved production contract.

Final run on 2026-09-09: all-route, engineering and studio/contact harnesses passed against the current nginx image, finishing at 13:24 UTC. PDF download/print also passed the existing report smoke. JSON and reviewed snapshots were copied without replacing the original home/hub/simulation baselines. At 390px, the first contact input moved from y=681.25px to y=418.80px. See final-independent-checkpoint.json for image ids and exact evidence inventory.
