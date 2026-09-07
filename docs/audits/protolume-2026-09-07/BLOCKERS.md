# Blockers

## B-001 - Commercial rules
**Blocks:** UX-003/026. **Missing:** paid/free Demo and presentation, start and meaning of seven days, NO-GO terms, actual pricing evidence. **Does not block:** IA, CTA, neutral terminology. **Can proceed:** central offer model, deliverables and estimate factors, without new prices/promises.

## B-002 - RAG / agent provider
**Blocks:** UX-010/011/015 and relevant UX-019 experiment. **Missing:** approved provider/model, budget, retention, credential references. **Does not block:** UX-008 and landing layout. **Can proceed:** interfaces, disabled adapter, explicit corpus/retrieval, evaluation harness, citation/trace schemas. No mocked success presented as actual model output.

## B-003 - CRM and official channel sandbox
**Blocks:** UX-012/014 and real UX-007 proof. **Missing:** CRM sandbox, official test channel, permissions/config. **Does not block:** hub/home. **Can proceed:** domain model, approval/idempotency, adapters, deterministic tests with test-only doubles, result UI and setup docs.

## B-004 - Real artifacts and owner facts
**Blocks:** UX-013 (real audio/transcript/rights), UX-018 (authentic photo/current education status), UX-027 (customer data/consent). **Does not block:** UI/schema/checklists; UX-016/017 can show public site repo as own project. **Can proceed:** gated player/data model and case study template without empty public pages or fake proof.

## B-005 - Privacy, calendar, external measurement
**Blocks:** UX-025 (confirmed purpose/basis/retention/transfers/contracts/address), UX-024 (calendar/slots decision), UX-028 (GSC, lead definition, participants), part of UX-023 (GSC), UX-022 (physical mobile/screen reader). **Does not block:** technical SEO, browser accessibility, data-flow inventory and research plan. **Can proceed:** documentation and disabled analytics integration without PII. Preserve consent/API until legal basis decided.

## B-006 - Production deployment gates
**Blocks:** full DONE UX-001/002 and MERGE_READY. **Missing:** actual non-secret CONTACT_RECIPIENT_EMAIL, CONTACT_FROM_EMAIL, SMTP_HOST/PORT/USERNAME/USE_TLS; current public legal config from Secret Manager; verification of newly deployed build. **Does not block:** local images/browser/backend tests and remaining backlog. **Can proceed:** all independent gates; record smoke pending. Do not guess SMTP. Pre-existing frontend/.public-legal-config.json contains invented local values and must not be used. Exact copy of published privacy text in tmp is only a local build input, not legal approval.
