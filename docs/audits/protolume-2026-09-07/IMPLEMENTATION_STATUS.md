# Implementation Status

Local implementation is not a production deployment. See RESUME.md and BLOCKERS.md.

| Task | Status | Commit | Verification | Blocker / Notes |
| ---- | ------ | ------ | ------------ | --------------- |
| UX-001 | PARTIAL | 2ff41c3, 6bb3e90 | axe at 8 widths, screenshots/computed colors; 204 Angular tests | B-006: publication not verified; hover/focus checked locally |
| UX-002 | PARTIAL | 6bb3e90 | 12 cold runs: CLS 0, no zero main, no hydration errors; real no-JS | B-006: production gates; fragments/form/no-JS verified locally |
| UX-003 | PARTIAL | 3984faa | Central terms and shared component; 211 frontend tests | B-001; production build and seven-width browser passed |
| UX-004 | PARTIAL | 3984faa | Five route-to-topic tests; manual choice preserved; 84 backend tests | Five service CTA browser tests + seven widths passed; B-006 |
| UX-005 | PARTIAL | e901b63 + follow-up | 207 Angular tests; production artifact; eight-width browser | 390px: height 10285 -> 3293, first card 1443 -> 318; B-006 |
| UX-006 | PARTIAL | e901b63 + follow-up | No overlap at 921/1024/1440; breadcrumbs; native no-JS CTA | Local acceptance passed; B-006 |
| UX-007 | PARTIAL | 2d50720 | Six sections; 8 widths axe/overflow; 390px height 11808 -> 6545 | Real CRM proof remains B-003; deployment B-006 |
| UX-008 | PARTIAL | 2fb4c67 | Production build; 8 browser cases, no question requests; axe | B-005 physical screen reader; B-006 deployment; focus single announcement by design |
| UX-009 | PARTIAL | 2d50720 + RAG checkpoint | Shared evidence registry/labels, provenance, publication gates; four current targets open | EVIDENCE_INVENTORY.md; owner/real-artifact inventory B-004; deployment B-006 |
| UX-010 | PARTIAL | 9bbe8d5 | 28 focused / 112 backend tests; lexical observation 10/12 with both failures; no model calls | B-002/B-005: dormant boundary, no real provider/API/currency budget; RAG_FOUNDATION.md |
| UX-011 | PARTIAL | 9bbe8d5 | Manual source example; one corpus; native section links; three FAQ; eight-width browser evidence | B-002: real proof and remote loading/error/retry remain open; B-005 physical screen reader; B-006 |
| UX-012 | PARTIAL | CRM checkpoint | Revision-bound approval, missing fields, replay/concurrency/uncertain-write handling; 38 new backend cases; unmounted result view | B-003/B-005/B-006: no real CRM adapter/write, durable/authenticated execution or reviewed artifact; CRM_FOUNDATION.md |
| UX-013 | PARTIAL | artifact checkpoint | Typed reviewed-data contract, publication checks, native player/transcript; private eight-width browser preview | B-004/B-005: no real voice recording or rights; not mounted on public routes |
| UX-014 | PARTIAL | CRM checkpoint | Channel/account/event namespacing; receipt matching and readback; offline artifact completeness/integrity gate | B-003: official channel verification, customer mapping and real sandbox evidence still absent |
| UX-015 | PARTIAL | artifact checkpoint | Dependency/approval/timing validation; native trace presentation and failure/timeout/budget fixtures | B-002/B-005: no executed agent, provider, measured cost or public trace |
| UX-016 | PARTIAL | engineering checkpoint | Inspectable own-project source, actual PR fragment, downloadable API; 33 tests from extracted ZIP; eight-width browser | Production B-006; code/tests do not establish live SMTP or client outcomes |
| UX-017 | PARTIAL | engineering checkpoint | Shared handover package, repo/PR/review/acceptance flow; eight-width browser and contact topic | B-006; commercial/white-label terms require project-specific agreement |
| UX-018 | PARTIAL | studio checkpoint | Named owner, one cooperation block, own-project first; eight-width browser and native details | B-004 current education/photo; B-006. Mobile height 8903 -> 4236; visible words 642 -> 285, total text 633 -> 453 |
| UX-019 | PARTIAL | R&D checkpoint | Pinned-source rerun reproduces 10/12; computed 7/9 and 3/3, both failures, standalone code/data ZIP and hash gate | No provider/model quality claim; production B-006; RESEARCH_AND_REPORT_ARTIFACTS.md |
| UX-020 | PARTIAL | contact checkpoint | Short intro, visible 20-character minimum, optional company/budget retained; first input at 390px: y=681 -> 419; intercepted 422/429/503/network/success | B-005/B-006: actual response time, legal review and production mail smoke; no real inquiry sent |
| UX-021 | PARTIAL | report checkpoint | One typed source for WWW/PDF; 4 visually reviewed pages, full text comparison, Polish glyphs, stale-PDF gate | Local browser download/MIME passed; final production B-006 |
| UX-022 | PARTIAL | Current checkpoint | FAQ rows >=44px; 120 local layout cases, 45 axe scans, anchors below header and emulated 720 CSS px at 2x density | B-005 physical mobile, real browser zoom and NVDA/VoiceOver; not a WCAG certificate |
| UX-023 | PARTIAL | Current checkpoint | 15 prerendered routes: unique metadata, JSON-LD, sitemap, OG, links/anchors; query canonical and true 404 | B-005 GSC/field cannibalization; final production B-006 |
| UX-024 | PARTIAL | Decision document | Calendar decision criteria, real-slot/provider/data prerequisites and validation plan | Optional; B-005 owner decision. No calendar activated |
| UX-025 | PARTIAL | 9bbe8d5 + CRM checkpoint | DATA_FLOW_MAP.md includes dormant CRM inputs/state, future adapter and private evidence package; no new external flow or consent change | B-005/B-006: owner/legal review, current settings/contracts, approved notice |
| UX-026 | PARTIAL | First-stage model + decision document | Shared price factors, timing/consent-to-work boundary, separate services and maintenance; real-quote intake template | B-001 actual paid/free stages, prices, seven-day start and NO-GO terms |
| UX-027 | PARTIAL | Case-study template | Full intake, metric provenance/denominators, human role, costs, permissions and publication workflow | B-004 actual project data/customer approval; no client material invented |
| UX-028 | PARTIAL | Research/measurement plan | Seven event definitions, no-PII allowlist, manual lead proposal, neutral user tasks, GSC and pre-test A/B criteria | B-005 provider/legal/lead definition, access and participants; no analytics or outreach activated |
