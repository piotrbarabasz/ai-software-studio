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
| UX-010 | PARTIAL | RAG checkpoint | 28 focused / 112 backend tests; lexical observation 10/12 with both failures; no model calls | B-002/B-005: dormant boundary, no real provider/API/currency budget; RAG_FOUNDATION.md |
| UX-011 | PARTIAL | RAG checkpoint | Manual source example; one corpus; native section links; three FAQ; browser checks in RESUME.md | B-002: real proof and remote loading/error/retry remain open; B-005 physical screen reader; B-006 |
| UX-012 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-013 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-014 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-015 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-016 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-017 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-018 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-019 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-020 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-021 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-022 | IN_PROGRESS | Current checkpoint | Static Polish hero, no invented payload; no-JS header no longer blocks content | Remaining FAQ/zoom/all-route checks and physical screen reader B-005 |
| UX-023 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-024 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-025 | PARTIAL | RAG checkpoint | Code-backed DATA_FLOW_MAP.md; no new external flow or consent change | B-005/B-006: owner/legal review, current settings/contracts, approved notice |
| UX-026 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-027 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-028 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
