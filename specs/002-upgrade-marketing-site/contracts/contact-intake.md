# Contract: Contact Intake Compatibility

The premium marketing upgrade reuses the existing contact intake endpoint.

## Endpoint

`POST /api/contact`

## Contract Stability

The request and response shapes remain compatible with the MVP:

- `name`
- `email`
- `company`
- `projectType`
- `budgetRange`
- `message`
- `consent`

No authentication, database persistence, payment, billing, CMS, admin backend, RAG backend, chatbot runtime, voice runtime, WhatsApp integration, or real cost tracking endpoint is added.

## Planned Project Type Values

The frontend contact select should expose productized-service options. If these values are submitted to the backend, they must be accepted by the backend enum and documented in the OpenAPI schema:

- `rag_chatbot_demo`
- `website_seo`
- `voice_agent_demo`
- `whatsapp_agent_management`
- `email_automation`
- `agent_management_panel`

Existing MVP values may remain accepted for compatibility:

- `custom_web_app`
- `ai_automation`
- `backend_api`
- `business_process_automation`
- `external_integration`
- `dashboard_internal_tool`
- `mvp_prototype`
- `other`

## Enum Drift Rule

The implementation must keep these three sources aligned when the backend uses a strict enum:

- frontend contact select values in `frontend/src/app/core/content/contact-options.pl.ts`
- frontend request type values in `frontend/src/app/services/contact-api.types.ts`
- backend accepted values in `backend/app/schemas/contact.py`

The generated FastAPI OpenAPI schema for `POST /api/contact` must expose the same allowed `projectType` values. The feature-specific checkpoint artifact is `specs/002-upgrade-marketing-site/contracts/openapi-contact.yaml`.

If implementation changes the backend to accept free text instead of a strict enum, the implementation must document that decision here and include a validation step proving enum drift no longer applies.

## Implementation Verification

The backend remains enum-based. `backend/app/schemas/contact.py` defines a strict `ProjectType` enum, and the frontend select values in `frontend/src/app/core/content/contact-options.pl.ts` plus the frontend request union in `frontend/src/app/services/contact-api.types.ts` must match that enum exactly.

Verified accepted values for this feature:

- `rag_chatbot_demo`
- `website_seo`
- `voice_agent_demo`
- `whatsapp_agent_management`
- `email_automation`
- `agent_management_panel`
- `custom_web_app`
- `ai_automation`
- `backend_api`
- `business_process_automation`
- `external_integration`
- `dashboard_internal_tool`
- `mvp_prototype`
- `other`

The feature-specific OpenAPI checkpoint in `specs/002-upgrade-marketing-site/contracts/openapi-contact.yaml` mirrors the same `ProjectType` enum. Backend contract tests validate that the generated FastAPI OpenAPI schema for `POST /api/contact` references and exposes the same enum values.

## Response Expectations

- Valid requests return the existing accepted response with HTTP 202.
- Invalid requests return HTTP 422 with validation details.
- Rate-limited requests return HTTP 429 with the existing error shape.
- Delivery failures return HTTP 503 with the existing error shape.

## Tests

- Frontend contact form test must verify at least one productized option is rendered and submitted in the existing payload shape.
- Backend schema/unit test must accept at least one new project type if enum values are added.
- Backend contract test must continue proving invalid project types are rejected.
- Contract validation must fail if frontend project type values drift from backend accepted values.
- OpenAPI validation must fail if backend enum values are missing from the generated `POST /api/contact` schema.
