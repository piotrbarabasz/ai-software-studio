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
| UX-007 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-008 | PARTIAL | Current checkpoint | 207 tests; production build; 8 browser cases, no question requests; axe | B-005 physical screen reader; B-006 deployment; focus single announcement by design |
| UX-009 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-010 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-011 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
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
| UX-022 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-023 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-024 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-025 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-026 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-027 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
| UX-028 | NOT_STARTED | - | Acceptance criteria read | See BLOCKERS.md |
