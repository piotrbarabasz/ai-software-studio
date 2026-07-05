# Data Model: Marketing Website MVP

## Contact Inquiry

Represents a project inquiry submitted from the public contact form. It is
validated and delivered by notification email, but not persisted in a database.
The notification email may include the submitted name, email, optional company,
project type, budget range, message, consent confirmation, and server timestamp
so the owner can respond. Backend logs must not include the full message body,
secrets, or sensitive contact payloads.

### Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Trimmed, 2-120 characters |
| `email` | string | Yes | Valid email format, max 254 characters |
| `company` | string or null | No | Trimmed, max 160 characters |
| `projectType` | enum | Yes | One allowed project type |
| `budgetRange` | enum | Yes | One allowed budget range |
| `message` | string | Yes | Trimmed, 20-4000 characters |
| `consent` | boolean | Yes | Must be `true` |
| `submittedAt` | datetime | Server-set | ISO timestamp for notification/receipt context |

### Consent and Privacy Boundary

The public consent checkbox copy must be in Polish and explain that the inquiry
data is sent by email to the site owner for the purpose of responding to the
message. The MVP does not persist contact inquiries in a database. Operational
logs may record non-sensitive outcome metadata such as accepted, rejected,
rate-limited, delivery failed, and health checked, but must not contain the full
message body.

### Project Type Values

- `custom_web_app`
- `ai_automation`
- `backend_api`
- `business_process_automation`
- `external_integration`
- `dashboard_internal_tool`
- `mvp_prototype`
- `other`

### Budget Range Values

- `under_10k_pln`
- `10k_25k_pln`
- `25k_50k_pln`
- `50k_100k_pln`
- `over_100k_pln`
- `not_sure`

### State Transitions

```text
draft -> client_valid -> submitted
submitted -> accepted -> notification_sent
submitted -> rejected
accepted -> notification_failed
```

- `draft`: form is being edited in the browser.
- `client_valid`: frontend validation passes.
- `submitted`: backend receives the request.
- `accepted`: backend validation passes.
- `notification_sent`: owner notification succeeds.
- `rejected`: backend validation or abuse checks fail.
- `notification_failed`: delivery cannot be completed; caller receives a
  controlled failure response.

## Service Offering

Represents a public service section item.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | Yes | Polish display title |
| `summary` | string | Yes | Business-oriented service explanation |
| `outcomes` | string[] | Yes | Expected business outcomes or use cases |
| `anchorId` | string | Yes | Stable page anchor |

Required offerings:
- Custom web application development
- AI automations and AI assistants
- Backend/API development
- Business process automation
- External system integrations
- MVP/prototype development

## Process Step

Represents a cooperation stage shown on the landing page.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `order` | number | Yes | Display order |
| `title` | string | Yes | Polish stage name |
| `description` | string | Yes | What happens in the stage |
| `clientOutcome` | string | Yes | What the client receives or decides |

Minimum stages:
1. Discovery
2. Scope and proposal
3. Implementation
4. Validation and feedback
5. Delivery and handoff

## Technology Capability

Represents a technology or capability used as a trust signal.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | Yes | Technology or capability label |
| `category` | enum | Yes | `frontend`, `backend`, `cloud`, `data`, `ai`, `integration` |
| `businessUse` | string | Yes | Why it matters for client outcomes |

Required capabilities include Angular, FastAPI, Python, cloud, GCP, APIs,
databases, AI/RAG/LLM tools, integrations, and automation.

## Placeholder Case Study

Represents a clearly labeled example that can later be replaced by a real case
study.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `label` | string | Yes | Must identify the item as an example/placeholder |
| `problem` | string | Yes | Client-like business problem |
| `approach` | string | Yes | High-level solution approach |
| `outcome` | string | Yes | Plausible business outcome |
| `serviceTags` | string[] | Yes | Related service categories |

Rule: Placeholder examples must not imply real client work, named clients, or
measured results from actual projects.

## SEO Metadata

Represents metadata for the public landing page.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | Yes | Includes brand and service category |
| `description` | string | Yes | Polish summary for search/link previews |
| `canonicalPath` | string | Yes | Public page path |
| `language` | string | Yes | `pl` for MVP |
| `openGraphTitle` | string | Yes | Social preview title |
| `openGraphDescription` | string | Yes | Social preview summary |
