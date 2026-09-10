# UX-010/011 — source example and dormant RAG foundation

The public landing provides a **manually prepared simulation** with exact quotations, an expandable document, section links, return focus and an explicit missing-information example. It does not call the Python service or a model. This improves UX-011 without establishing real RAG proof.

## One inspectable corpus

`frontend/src/assets/rag/protolume-materials-v1.json` contains three sections describing existing public Protolume materials. Both the landing and the offline Python loader read this source. It contains no client results, pricing or private files. Its provenance, version and review date are visible beside the document; the downloadable JSON and citation section IDs correspond to rendered text.

The loader accepts only an operator-selected local file, at most 64 KiB, schema 1, 1–32 uniquely identified sections and bounded text. Citation URLs are constructed from the fixed landing path plus validated section IDs. Neither questions nor provider responses can choose a URL to fetch. The corpus is not packaged into the backend image because no runtime API consumes it; packaging an approved runtime corpus remains part of provider activation.

Update the version/review date and evidence metadata when changing the content; rerun the evaluation and browser checks. Source review means inspection of public materials, not owner verification of commercial facts.

## Boundary already implemented

`backend/app/rag/` is absent from the API router. `RagService` refuses to run without an explicitly supplied provider and call budget. There is no provider implementation, API route, credential or new deployment variable.

Retrieval is a deterministic lexical baseline with accent normalization, selected word stems, a minimum query-term coverage and at most two returned passages by default. It is not semantic retrieval. Empty/out-of-range questions are rejected; absent context returns `not_found` without spending a call.

A provider receives only the bounded question/context, output-token instruction and an untrusted-data instruction. The service accepts only supported states and exact quotations from retrieved passages. Server-side source IDs determine citation URLs; invented, absent and non-retrieved citations are rejected. `conflict` requires two distinct cited sections. Source containment does not establish answer relevance, completeness, contradiction recognition or robustness against prompt injection.

The per-instance, thread-safe lifetime call cap reserves before invocation and keeps the reservation after timeout/failure. It is **not a currency budget or a distributed rate limiter**. There are no retries. Async timeout assumes a cooperatively cancelling adapter; real transport timeouts/cancellation and provider token accounting must also be enforced by the future adapter.

## Reproducible observations

From repository root:

```powershell
backend/.venv/Scripts/python.exe backend/scripts/evaluate_rag.py --output docs/audits/protolume-2026-09-07/implementation-evidence/rag-retrieval-baseline.json
backend/.venv/Scripts/python.exe -m pytest backend/tests/unit/test_rag_foundation.py
```

The fixed, author-written 12-question dataset covers direct questions, paraphrases, absent information and unrelated questions. **10/12 matched the expected first section or expected absence.** `simulation-paraphrase` and `report-paraphrase` failed to retrieve the intended source. Every input, expected/actual ID, failure, corpus/case SHA-256 and method is in the JSON report. Zero model calls occurred. This small development dataset is not held-out user research or a model-quality result. The evaluator records observations and exits successfully even when cases fail; it is not a readiness gate.

The 28 focused unit cases cover corpus bounds, retrieval, default-disabled API, exact-source validation, malformed/unknown citations, missing information, fixture conflict states, a malicious-instruction fixture, timeout, mapped 429 without retry and concurrent call reservations. Provider doubles exist only in tests. Passing them establishes boundary behavior, not model quality, actual conflict detection or cost enforcement by a provider.

## Criteria still open before activation

* B-002: approved provider/model, credential reference, monetary budget and enforcement, question retention and adapter/transport behavior. Add any environment variables through the entire production contract and all required gates.
* B-005: confirm the new data flow and disclosure before free-text collection; see DATA_FLOW_MAP.md. No local-only statement may remain on a transmitting interface.
* Implement the real endpoint with distributed abuse controls and an approved runtime corpus, real provider generation, server-enforced token/currency bounds and sanitized failure mapping.
* Add actual loading/error/retry UI preserving entered text and position. The current local selection has no remote operation or artificial loading/error state.
* Run and report real provider evaluations for direct/paraphrased/missing/conflicting questions, invented sources, injection, timeout, 429 and budget exhaustion. Preserve all failures; do not promote fixture output as evidence.
* Validate citation opening, mobile/focus behavior and physical screen-reader use with real responses, then complete production/container gates. Until then UX-010 and UX-011 remain PARTIAL.
