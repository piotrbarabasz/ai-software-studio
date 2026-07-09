# Data Model: Premium Marketing Website Upgrade

## Landing Page Content

Represents the complete Polish-first content object rendered by the upgraded landing page.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `seo` | SeoMetadata | Yes | Updated premium AI demo positioning |
| `navigation` | NavigationItem[] | Yes | Anchors for required sections |
| `hero` | HeroContent | Yes | First-screen positioning and CTAs |
| `demoPromise` | DemoPromise | Yes | "Demo AI w 7 dni" value proposition |
| `offers` | ProductizedOffer[] | Yes | Six productized service categories |
| `showcases` | ProductShowcase[] | Yes | Product storytelling sections |
| `demoSprint` | DemoSprintStep[] | Yes | 7-day process steps |
| `trust` | TrustContent | Yes | Technology/trust signals |
| `packages` | StartingPackage[] | Yes | Pricing or starting packages |
| `faq` | FaqItem[] | Yes | Buyer objections and scope boundaries |
| `contact` | ContactContent | Yes | Existing contact flow copy/options |

## ProductizedOffer

Represents one productized service category.

| Field | Type | Required | Validation/Rules |
|-------|------|----------|------------------|
| `id` | string | Yes | Stable anchor-safe identifier |
| `title` | string | Yes | Polish display title |
| `shortLabel` | string | Yes | Short label for compact UI |
| `summary` | string | Yes | Business-oriented explanation |
| `businessOutcome` | string | Yes | Concrete buyer outcome |
| `useCases` | string[] | Yes | At least 2 examples |
| `demoArtifact` | string | Yes | What the 7-day demo may show |
| `scopeBoundary` | string | Yes | Clarifies demo/presentation boundary |
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

Represents a narrative section with a product-style visual preview.

| Field | Type | Required | Validation/Rules |
|-------|------|----------|------------------|
| `id` | string | Yes | Stable section anchor |
| `eyebrow` | string | Yes | Short category label |
| `title` | string | Yes | Section heading |
| `lead` | string | Yes | Plain-language value proposition |
| `workflowSteps` | string[] | Yes | 3-5 conceptual workflow steps |
| `proofPoints` | string[] | Yes | Trust or business benefits |
| `visualKind` | enum | Yes | Selects the presentation component |
| `presentationLabel` | string | Yes | Must identify visual as a demo concept or preview |

Rules:

- A showcase must not imply live integration or production readiness unless the copy says that a later production scope is required.
- Any visual that resembles software must include presentation-only labeling.

## PresentationVisual

Represents a frontend-only product preview component.

| Field | Type | Required | Validation/Rules |
|-------|------|----------|------------------|
| `kind` | enum | Yes | `rag`, `voice`, `whatsapp`, `email`, `panel`, `hero` |
| `accessibleName` | string | Yes | Used for `aria-label` or visible heading |
| `description` | string | Yes | Explains what the visual represents |
| `disclaimer` | string | Yes | States preview/demo/presentation boundary |
| `statusItems` | string[] | No | Fake states shown as labels |
| `metrics` | object[] | No | Fake metrics, clearly presentation-only |

Rules:

- Visuals cannot collect user input.
- Fake metrics must not be presented as real client outcomes.
- Motion must be non-essential and disabled under reduced motion.

## DemoPromise

Represents the "Demo AI w 7 dni" value proposition.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | Yes | Promise heading |
| `summary` | string | Yes | Explains practical demo outcome |
| `startsAfter` | string[] | Yes | Scope confirmation and client materials |
| `included` | string[] | Yes | What the demo sprint includes |
| `notIncluded` | string[] | Yes | Production exclusions |
| `ctaLabel` | string | Yes | Contact prompt |

## DemoSprintStep

Represents one stage of the 7-day demo process.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `dayRange` | string | Yes | e.g. `Dzien 1`, `Dni 2-5` |
| `title` | string | Yes | Stage name |
| `description` | string | Yes | What happens |
| `clientInput` | string | No | What the client must provide |
| `deliverable` | string | Yes | What the client receives |

## StartingPackage

Represents a pricing or starting package entry.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Stable identifier |
| `name` | string | Yes | Package label |
| `priceLabel` | string | Yes | Starting price/range/contact-for-scope copy |
| `bestFor` | string | Yes | Buyer fit |
| `includes` | string[] | Yes | Included outcomes |
| `assumptions` | string[] | Yes | Scope assumptions |
| `ctaLabel` | string | Yes | Contact CTA |

Rule: Package copy must say final scope is confirmed before the sprint starts.

## FaqItem

Represents one FAQ disclosure.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Stable identifier |
| `question` | string | Yes | Polish question |
| `answer` | string | Yes | Polish answer |
| `category` | enum | Yes | `scope`, `materials`, `timeline`, `integrations`, `production`, `contact` |

Required topics:

- Demo scope
- Required client materials
- Timeline start conditions
- Production exclusions
- Integrations
- Ownership or handoff expectations
- Contact next steps

## Contact Inquiry

Uses the existing MVP contact inquiry shape. The payload remains:

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Trimmed, 2-120 characters |
| `email` | string | Yes | Valid email format, max 254 characters |
| `company` | string or null | No | Trimmed, max 160 characters |
| `projectType` | enum | Yes | One allowed project type |
| `budgetRange` | enum | Yes | One allowed budget range |
| `message` | string | Yes | Trimmed, 20-4000 characters |
| `consent` | boolean | Yes | Must be `true` |

Additional project type values planned for this feature:

- `rag_chatbot_demo`
- `website_seo`
- `voice_agent_demo`
- `whatsapp_agent_management`
- `email_automation`
- `agent_management_panel`

Existing broad values may remain accepted for backward compatibility.

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

- `initial_visible_or_pending`: content is either immediately visible because reduced motion/fallback applies, or waiting for viewport entry.
- `revealed`: content has entered the viewport and the visible class is applied.
