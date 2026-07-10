# Data Model: Demo AI w 7 dni Landing Page Upgrade

## LandingPageContent

Represents the complete Polish-first content object rendered by the upgraded landing page.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `seo` | SeoMetadata | Yes | Title and description for the new positioning |
| `navigation` | NavigationItem[] | Yes | Simplified anchors, capped at 5-6 items |
| `hero` | HeroContent | Yes | First-screen business promise and CTA copy |
| `demoPromise` | DemoPromise | Yes | The 7-day validation promise |
| `offers` | ProductizedOffer[] | Yes | Three main offer families |
| `showcases` | ProductShowcase[] | Yes | Presentation sections and visuals |
| `demoSprint` | DemoSprintStep[] | Yes | 7-day process explanation |
| `packages` | StartingPackage[] | Yes | Pricing or package framing |
| `faq` | FaqItem[] | Yes | Concise buyer objections and answers |
| `contact` | ContactContent | Yes | Existing contact flow copy/options |

## NavigationItem

| Field | Type | Required | Validation/Rules |
|-------|------|----------|------------------|
| `label` | string | Yes | Business-friendly anchor label |
| `anchor` | string | Yes | Must map to a real page section |

Rules:

- Navigation should stay short and clear.
- Labels must make sense to a non-technical business visitor.

## ProductizedOffer

Represents one of the three main business-facing offer families.

| Field | Type | Required | Validation/Rules |
|-------|------|----------|------------------|
| `id` | string | Yes | Stable anchor-safe identifier |
| `title` | string | Yes | Polish display title |
| `shortLabel` | string | Yes | Compact label for cards or chips |
| `summary` | string | Yes | Business-oriented explanation |
| `businessOutcome` | string | Yes | Concrete value for the buyer |
| `useCases` | string[] | Yes | At least 2 examples |
| `demoArtifact` | string | Yes | What the 7-day demo shows |
| `scopeBoundary` | string | Yes | Clarifies demo and production limits |
| `visualKind` | enum | Yes | `rag`, `websiteSeo`, `voice`, `whatsapp`, `email`, `panel` |
| `ctaLabel` | string | Yes | Contact prompt copy |

Required offer IDs:

- `rag_chatbot_demo`
- `website_seo`
- `voice_agent_demo`
- `whatsapp_agent_management`
- `email_automation`
- `agent_management_panel`

## ProductShowcase

Represents a narrative section paired with a presentation-only visual.

| Field | Type | Required | Validation/Rules |
|-------|------|----------|------------------|
| `id` | string | Yes | Stable section anchor |
| `eyebrow` | string | Yes | Short category label |
| `title` | string | Yes | Section heading |
| `lead` | string | Yes | Plain-language value proposition |
| `workflowSteps` | string[] | Yes | 3-5 conceptual workflow steps |
| `proofPoints` | string[] | Yes | Business benefits or trust cues |
| `visualKind` | enum | Yes | Selects the matching presentation component |
| `presentationLabel` | string | Yes | Must identify the visual as a demo concept or preview |

Rules:

- Showcase copy must not imply live integration or production readiness.
- Any software-like visual must be explicitly labeled as a presentation element.

## DemoPromise

Represents the "Demo AI w 7 dni" business promise.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | Yes | Promise heading |
| `lead` | string | Yes | Explains the practical demo outcome |
| `startsAfter` | string[] | Yes | Scope confirmation and client materials |
| `includes` | string[] | Yes | What the demo sprint includes |
| `notIncluded` | string[] | Yes | What stays out of scope |
| `ctaLabel` | string | Yes | Contact prompt |

## DemoSprintStep

Represents one stage of the 7-day process.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `dayRange` | string | Yes | Example: `Dzien 1` or `Dni 2-5` |
| `title` | string | Yes | Stage name |
| `description` | string | Yes | What happens |
| `clientInput` | string | No | What the client provides |
| `deliverable` | string | Yes | What the client receives |

## StartingPackage

Represents entry-level pricing or package framing.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Stable identifier |
| `name` | string | Yes | Package label |
| `priceLabel` | string | Yes | Starting price, range, or contact-for-scope copy |
| `bestFor` | string | Yes | Buyer fit |
| `includes` | string[] | Yes | Included outcomes |
| `assumptions` | string[] | Yes | Scope assumptions |
| `ctaLabel` | string | Yes | Contact CTA |

Rule: package copy must state that final scope is confirmed before the sprint starts.

## FaqItem

Represents one short FAQ disclosure.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Stable identifier |
| `question` | string | Yes | Polish question |
| `answer` | string | Yes | Polish answer |
| `category` | enum | Yes | `scope`, `materials`, `timeline`, `integrations`, `production`, `contact` |

Required FAQ topics:

- Demo scope
- Required client materials
- Timeline start conditions
- Production exclusions
- Integrations
- Ownership or handoff expectations
- Contact next steps

## ContactContent

Uses the existing MVP contact inquiry shape.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | Contact section title |
| `lead` | string | Yes | Plain-language explanation of how to start |
| `consent` | string | Yes | Existing consent copy |
| `submit` | string | Yes | Submit button copy |
| `submitting` | string | Yes | Submitting state copy |
| `messages` | object | Yes | Existing success/error messages |
| `projectTypes` | SelectOption[] | Yes | Existing project type options |
| `budgetRanges` | SelectOption[] | Yes | Existing budget range options |

## Contact Inquiry

The backend payload shape stays the same unless a later implementation decision requires an explicit contract update.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Trimmed, 2-120 characters |
| `email` | string | Yes | Valid email format, max 254 characters |
| `company` | string or null | No | Trimmed, max 160 characters |
| `projectType` | enum | Yes | One allowed project type |
| `budgetRange` | enum | Yes | One allowed budget range |
| `message` | string | Yes | Trimmed, 20-4000 characters |
| `consent` | boolean | Yes | Must be `true` |

## State Transitions

### Contact Inquiry

```text
draft -> client_valid -> submitted
submitted -> accepted -> notification_sent
submitted -> rejected
accepted -> notification_failed
```

### Presentation Reveal

```text
initial_visible_or_pending -> revealed
```

- `initial_visible_or_pending`: content is either immediately visible because reduced-motion fallback applies or waiting for viewport entry.
- `revealed`: the visible class has been applied.