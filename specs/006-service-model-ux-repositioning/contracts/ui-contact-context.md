# UI Contract: Contact Context and Route-Backed Repositioning

This feature does not add a backend endpoint. This contract defines frontend-visible behavior that must remain compatible with the existing contact API.

## Public Routes

Routes that must remain available:

- `/`
- `/produkty`
- `/produkty/asystent-wiedzy-rag`
- `/produkty/strony-seo`
- `/produkty/voice-agent`
- `/produkty/whatsapp-ai`
- `/produkty/automatyzacja-email`
- `/produkty/panel-agentow`
- `/demo-w-7-dni`
- `/studio`
- `/kontakt`

Forbidden route:

- `/lab`

## Route Metadata Contract

Each public route must provide:

- unique title
- unique meta description
- canonical path equal to the public route
- route kind
- product ID for product routes only

The Angular shell remains responsible for applying title, meta description, Open Graph fields, and canonical link from route data.

## Contact Query Parameter Contract

Supported parameter:

```text
/kontakt?projectType=<allowed-value>
```

Rules:

- The only accepted query parameter for form preselection is `projectType`.
- `projectType` must be checked against the frontend `projectTypeOptions` allowlist.
- Invalid, missing, or unsupported values must leave the form in the default unselected state.
- URL values must not be copied into free text fields.
- URL values must not add new keys to the backend payload.
- Product-specific CTAs may map to the closest allowed `projectType` value.

## Existing Backend Payload Contract

The frontend must continue submitting:

```ts
interface ContactInquiryRequest {
  readonly name: string;
  readonly email: string;
  readonly company: string | null;
  readonly projectType: ProjectType;
  readonly budgetRange: BudgetRange;
  readonly message: string;
  readonly consent: true;
}
```

No additional payload key is planned for this feature.

## Required Contact Intents

The UI must let visitors indicate:

- demo or quick validation
- MVP
- full development
- automation or AI solution
- technology consultation

These labels may map to existing backend-compatible `ProjectType` values. If implementation discovers that the backend enum cannot represent a required intent safely, the task must stop and introduce an explicit backend contract change task rather than silently extending payloads.

## Product Selector Contract

Product selection must be derived from Angular Router state:

- `/produkty` renders the catalog with a default selected product for detail context.
- Direct product routes select the product matching the URL.
- Browser back/forward updates selected product and active state.
- Active product link exposes `aria-current="page"`.

## Accessibility Contract

- Main navigation, product/category selectors, CTAs, mobile menu, and contact controls must be keyboard reachable.
- The mobile menu must expose an accessible expanded/collapsed state.
- Links must have descriptive visible text.
- Form controls must have labels and validation messages.
- Reduced-motion users must not lose content.
