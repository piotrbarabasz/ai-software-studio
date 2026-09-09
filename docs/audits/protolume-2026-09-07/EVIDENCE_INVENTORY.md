# Evidence inventory and publication rules

Source: `frontend/src/app/core/content/evidence.pl.ts`. Home and Studio render the same records and shared classification/limitation component. Review date means source inspection, not a deployment or customer study.

| Record | Classification | Existing target | Confirmed scope | Not established |
| --- | --- | --- | --- | --- |
| knowledge-demo | Simulation | /demo-ai#interactive-demo | Local prepared responses, matching, fallback and reset | Retrieval, model quality, live document citations |
| demo-report | Simulation | /przyklad-demo | Fictional decision-report structure | Executed CRM integration, customer delivery or measured savings |
| studio-application | Own project | /development#przyklad-techniczny | Source pinned to 0d38ef8: six code previews, actual PR #56 fragment, API/test ZIP, instructions and checksums | Current CI result, production mail delivery, client outcomes |
| rag-source-example | Simulation | /rozwiazania/chatbot-ai-dla-firm#rag-source-example | Three manually prepared selections, exact quotations and inspectable public document sections | Real provider generation, semantic retrieval or model-quality evaluation |

Studio lists all four published records. Home deliberately retains its two compact material cards. The new source example uses the same registry label and the corpus metadata; its existence does not satisfy real RAG proof. See RAG_FOUNDATION.md for the offline 12-case observation and its failures.

No performance or commercial metric is published in these records. Internal browser timings in implementation-evidence are engineering observations, not customer outcome claims. R&D directions are not an evidence record and no longer appear as a working artifact on home.

## Publication gate

`publishedEvidence` filters by `canPublishEvidence`. Missing destinations, drafts, missing provenance/version/scope/limitation, and customer records without a rights reference are excluded. Metrics need a finite value, unit, nonzero integer sample size, observation period, method and source. This validates metadata completeness; it cannot establish truth or legal permission. Review the source artifact and permission record before setting publication to published. Never fill a missing field with sample numbers from the audit.

For each new record:

1. Verify the real target, version and data origin. Open it on desktop and mobile; check links/anchors without JavaScript where applicable.
2. Describe only the demonstrated scope and its material limitation. Keep experiment results separate from deployment outcomes.
3. Attach the measurement method, all failures, denominator, period and source before adding any metric.
4. For client content, obtain and record publication rights covering names, logos, data, screenshots, recordings and claims. Do not place personal/secret source material in the public bundle.
5. Use the shared record wherever the artifact appears. A description or planned experiment cannot substitute for an absent recording, trace or integration.

## Absent artifacts

Real RAG/provider evaluation (UX-010/011), CRM sandbox write (UX-012), Voice recording and rights (UX-013), official WhatsApp-to-CRM integration (UX-014), executed agent trace (UX-015), genuine owner photo (UX-018), and approved customer case studies (UX-027) are not established by this inventory. See BLOCKERS.md. Their absence must not generate a public proof button. The own-project engineering artifact is implemented for UX-016/017; the reproducible lexical research note is implemented separately on /rd (see RESEARCH_AND_REPORT_ARTIFACTS.md).

CRM checkpoint: the dormant workflow, test-only adapter and unmounted result component are engineering scaffolds, not a fifth public evidence record. `backend/scripts/validate_crm_artifact.py` checks a future operator-reviewed package for metadata completeness, local files and hashes; passing it does not verify a write, media content or rights. Inspect the actual sandbox record and original channel event before adding a published artifact. No such package currently exists.

Voice/agent checkpoint: private mechanical preview uses one second of silence and manually assigned trace steps. Publication checks reject fixture evidence; a production isolation gate rejects the preview/assets in deployed output. No public evidence record was added. Studio continues to show the same four records, with the inspectable own project first.

The report record now uses decision-report-v2 and the 2026-09-09 review. Its PDF and webpage share canonical content and a stale-file gate. The R&D observation has its own source JSON/ZIP/manifest and computed counts; it is a real offline lexical observation, not a fifth claimed customer/model integration. Two failures and all 12 author-written cases remain public in the downloadable data.
