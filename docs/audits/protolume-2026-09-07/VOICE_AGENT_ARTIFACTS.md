# UX-013/015 — prepared presentation, no real recording or agent execution

This checkpoint adds typed artifact contracts, consistency/publication gates and accessible presentation components. They are not mounted on any public route. No Voice AI recording, transcript of a real conversation, provider run or agent trace has been obtained or executed. B-004 (audio/system/rights), B-002 (provider/scenario/budget) and B-005 (data review) remain open.

## Voice material

`VoiceExample` in `frontend/src/app/core/content/demo-artifacts.ts` contains origin, version/date, provenance/limitations, local audio path, SHA-256, duration, editing note, rights/review references, playback/extraction review, timed transcript segments, extracted fields with segment IDs and an optional handoff with its source segment. Validation checks bounded counts, IDs, timestamps and references; it does not establish the truth of a transcript or compare the declared hash to a file.

`VoiceExampleComponent` uses native audio controls with `preload="none"` and no autoplay or microphone access. Transcript/result remain in the DOM after a real audio error. Source details link each result to the exact text/timestamp through the shared segment data; handoff has the same linkage. Desktop uses two columns; narrow screens place result after audio/transcript. Invalid or absent data yields no player. Recorded material also requires publication review/rights flags. Fixtures may render only as explicitly labelled technical tests and are never publishable evidence.

Before public activation:

1. Obtain an actual demonstrational system and permission for the voice/recording, synthetic scenario participants and all captured material. Record the provenance, date and editing performed. Do not manufacture a customer or testimonial.
2. Record a normal scenario and a separate difficult event, including the actual handoff where it occurs. Retain a reviewed source copy privately. Prepare a transcript from the recording, verify timestamps and result fields by listening, and document limitations.
3. After privacy/rights review, place the approved file under the allowed local `/assets/demo-evidence/` path; compute and compare its SHA-256 and measured duration. Set review flags only from actual checks. The TypeScript gate is a completeness check, not a rights or media verifier.
4. Mount the reviewed item on the existing Voice landing and use the evidence registry for a real proof CTA. Do not add a player/link while the file or rights are absent. Verify actual codecs, HTTP MIME/range behavior and decode/playback, desktop/mobile controls, no autoplay/preload, error fallback, physical keyboard/screen-reader use and correspondence of transcript/results.
5. Recheck production CSP/artifact/SEO and deployment gates. Existing CSP already permits same-origin media; do not widen it to arbitrary media hosts.

## Agent trace

`AgentTrace` is an immutable presentation contract for a captured run, not an execution engine. It records the task/result, reason AI was needed, execution/timing references, optional measured cost with source, final state and bounded ordered steps. Each step records kind, state, dependencies, time offsets, summary, external-change flag and approval reference.

Validation rejects duplicate/unknown or forward dependencies, incompatible times, missing approval before a recorded external change, and a successful final outcome without successful steps and a terminal verification depending on all operations. At least two dependent model/tool operations are required. Failure, timeout, budget-exceeded and rejection outcomes must appear in the steps; downstream steps may be skipped. Cost is omitted unless its value, currency and source are valid. These are consistency checks on supplied data, not proof that tools ran, authorization happened, budget was enforced or a measured value is accurate.

`AgentTraceComponent` shows the result before a native expandable list of recorded steps. Dependencies and approval are readable text; it does not generate a decorative graph or execute actions. Measurement references are optional details; absent cost says it was not measured. Invalid data or unreviewed recorded material is hidden. Fixtures explicitly state that no agent ran.

Before real activation:

1. Agree a scenario with two genuinely dependent operations and explain why an AI decision is required. Choose provider/model, technical budget, retention, approved tools and permissions (B-002/B-005). A deterministic workflow should not be labelled an agent merely to fit the page.
2. Reuse the existing RAG/provider boundary where appropriate and CRM approval/reconciliation machinery for an approved CRM write. Those remain dormant; actor labels and process memory do not replace authenticated approval, durable state or real provider idempotency. Do not create a second permission system in the trace renderer.
3. Instrument the actual operations at the execution boundary. Generate steps from executed results/errors, capture timing from a declared clock, cost from actual usage/billing records and verification from real readback. Enforce timeouts/cost limits server-side before tools run; rendering `budget_exceeded` does not enforce a budget.
4. Exercise success, failure, timeout, budget exhaustion, rejected/stale approval and ambiguous write recovery. Record every failure. Ensure human approval precedes external mutation and use only approved test resources. Nothing in this checkpoint authorizes outbound messages or production changes.
5. Redact secrets, customer data, prompts, raw tool bodies and identifying references from the proposed public trace; review the actual source record before setting origin/review metadata. This contract is not a secret/PII scanner. Do not expose raw provider logs in the renderer.
6. Publish only reviewed real execution data through the existing evidence registry; mount on the agent landing, then verify mobile/native details, keyboard/screen reader and all production gates. Neither successful fixtures nor graph structure are proof of orchestration.

## Isolated mechanical preview

The separate Angular target `artifact-preview` uses `src/preview/main.ts`, `tsconfig.preview.json` and its own `dist/artifact-preview` output. It imports fixtures from `src/testing/`, which are outside production entry points/assets. The production build now runs `validate:preview-isolation`; its tests verify output/entry separation and reject preview markers or the silence file in deployed HTML/JS/assets. The existing production entry, SSR, route list, CSP and legal gates remain intact.

```powershell
# In frontend:
npm run build:artifact-preview
npm run serve:artifact-preview
# In a second shell:
npm run smoke:artifact-preview
```

The preview server binds only `127.0.0.1:4402`, sends `noindex, nofollow`, disables connections and allows same-origin scripts/media. Its fixed style nonce is local test infrastructure, not a production nonce policy. Stop only this verified preview process after use.

`src/testing/fixtures/player-silence.wav` is exactly one second of mono 8 kHz, 16-bit zero PCM samples; SHA-256 `56d4af65701c26df20bd4021eda95b6e830348ce3a746086079fe89285548dc9`. It has no voice. Its text describes silence rather than inventing a transcript. Trace fixtures use manually assigned time offsets, no model/tool execution and no cost. None is a public evidence record.

Browser checks cover eight widths (320–1440), axe, keyboard native play/pause, seeking/end, actual 404 audio fallback, preserved transcript, keyboard details, timeout/budget presentation and no media requests before playback. The harness waits for Angular input changes before testing the new media source. Reviewed screenshots/JSON are in implementation-evidence; they document component mechanics only. Physical devices/readers, real media, SSR/no-JS after mounting and actual runtime controls remain unverified.
