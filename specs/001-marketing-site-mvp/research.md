# Research: Marketing Website MVP

## Decision: Single-page Angular landing app

**Decision**: Build the MVP as one Angular application route with anchor
sections for hero, services, process, technology, example case studies, about,
and contact.

**Rationale**: The clarified scope is a single professional landing page. This
keeps the MVP simple, improves delivery speed, and still supports the primary
business goals: service explanation, trust building, and lead generation.

**Alternatives considered**:
- Multi-page marketing site: rejected for MVP because it adds routing, copy,
  metadata, and QA surface without adding required business value now.
- Static HTML without Angular: rejected because the constitution and user stack
  require Angular.

## Decision: Angular standalone components with routing and reactive forms

**Decision**: Use standalone Angular components, Angular routing, and reactive
forms for the contact form. Keep styling in a simple SCSS or CSS architecture
with mobile-first responsive rules.

**Rationale**: Standalone components reduce module boilerplate, reactive forms
make validation testable, and Angular routing preserves future English-language
or detail-page expansion without building those pages in the MVP.

**Alternatives considered**:
- Template-driven forms: rejected because reactive forms provide clearer
  validation state, testability, and typed form models for the contact flow.
- A component library: rejected for MVP unless implementation discovers a
  strong accessibility or speed benefit; custom lightweight components are
  enough for the required sections.

## Decision: Static-friendly SEO metadata without full SSR deployment

**Decision**: Provide SEO-friendly title, description, canonical metadata,
semantic headings, and crawlable primary content in the Angular build. Do not
implement full SSR or GCP deployment in this feature.

**Rationale**: The MVP has one public page and the user explicitly deferred full
deployment. Strong metadata and semantic content meet the immediate SEO need
without introducing server-side rendering infrastructure.

**Alternatives considered**:
- Angular SSR/prerender now: deferred because it adds build and deployment
  complexity that is not necessary for the initial single-page MVP.
- SEO as a later task only: rejected because page metadata and semantic
  structure are low-cost and required from the start.

## Decision: FastAPI backend with explicit OpenAPI contract

**Decision**: Build a separate FastAPI backend with `GET /health` and
`POST /api/contact`. Use Pydantic schemas for validation and FastAPI-generated
OpenAPI as the live API documentation.

**Rationale**: This satisfies the required backend stack, keeps the frontend and
backend separated, and provides a contract that can be tested and consumed by
the Angular frontend.

**Alternatives considered**:
- Frontend-only contact form: rejected because the feature requires backend
  validation and an API endpoint.
- Serverless form provider only: rejected for MVP because it would weaken the
  explicit FastAPI/API contract requirement.

## Decision: Email notification delivery with no database

**Decision**: Accepted contact inquiries are validated by the backend and
delivered to the site owner through an email notification adapter configured by
environment variables. No contact inquiries are persisted in a database. Failed
email delivery returns a clear non-sensitive error response and is logged by the
backend without logging sensitive message content.

**Rationale**: This makes the form useful while preserving the no-database MVP
constraint. If email delivery is not configured or fails, the backend must not
pretend success; it should return a controlled service-unavailable response and
record enough operational context to diagnose the failure.

**Alternatives considered**:
- Database storage: rejected by explicit MVP scope.
- Validate-only endpoint: rejected because it would not produce an actionable
  lead.
- CRM/webhook delivery: viable later, but email is the simplest owner-facing
  notification path for this MVP.

## Decision: Rate-limit-ready boundary without persistent throttling store

**Decision**: Design the contact endpoint so rate limiting can be added without
changing the contract: isolate request metadata, keep validation and delivery in
services, and define `429` in the API contract. The MVP may use a simple
in-process guard for local abuse protection, but no external rate-limit store is
required.

**Rationale**: The constitution requires rate-limit readiness, while the MVP
forbids unnecessary persistence. This keeps the architecture ready for Cloud
Run or edge-level throttling later.

**Alternatives considered**:
- Redis or database-backed throttling: rejected as unnecessary infrastructure
  for the MVP.
- No rate-limit consideration: rejected because public contact endpoints need an
  explicit abuse-control path.

## Decision: Health endpoint reports application reachability only

**Decision**: `GET /health` reports whether the backend application is reachable
and able to respond. It does not verify SMTP/email provider readiness in the
MVP.

**Rationale**: Application health and external provider readiness are different
operational signals. Keeping `/health` lightweight supports local development
and future Cloud Run readiness without coupling basic health to a third-party
email provider.

**Alternatives considered**:
- Check email provider readiness in `/health`: rejected for MVP because it
  makes the basic health signal dependent on external configuration and network
  availability.
- Add a separate readiness endpoint now: deferred because current scope only
  requires application reachability; a readiness endpoint can be added as a
  later deployment/operations feature.

## Decision: Measurable MVP performance and accessibility targets

**Decision**: The MVP targets Lighthouse Performance >= 90 and Lighthouse
Accessibility >= 90 for the production build on desktop, WCAG 2.2 AA-aligned
requirements for core interactions, and local contact API processing under 1
second excluding external email provider latency.

**Rationale**: These thresholds make "fast" and "accessible" objectively
reviewable while staying realistic for a single-page marketing MVP. They also
align with the constitution's requirement that UX quality is a release
criterion, not post-launch polish.

**Alternatives considered**:
- No numeric thresholds: rejected because the analyze report flagged the prior
  wording as ambiguous.
- Strict mobile Lighthouse thresholds in MVP: deferred because the MVP does not
  yet define a production hosting environment or network profile.

## Decision: Ruff for backend linting and formatting

**Decision**: Configure backend linting and formatting through Ruff in
`backend/pyproject.toml`, alongside pytest configuration and documented backend
commands for lint, format, and test.

**Rationale**: Ruff gives one fast tool for Python lint and formatting checks,
which satisfies the constitution's production-ready requirement without adding
multiple backend formatting tools.

**Alternatives considered**:
- Separate Black, isort, and flake8 stack: rejected for MVP because Ruff covers
  the required lint/format surface with less configuration.
- No backend formatting tool: rejected because the constitution explicitly
  requires linting and formatting.

## Decision: Polish content now, English-ready structure later

**Decision**: Store public section copy through structured content objects or
constants scoped to Polish. Do not add a full i18n framework until English
content is required.

**Rationale**: Polish copy is required now. A structured content boundary avoids
scattering strings while keeping the MVP simpler than a full localization setup.

**Alternatives considered**:
- Angular i18n now: deferred because only one language ships in MVP.
- Hard-coded strings everywhere: rejected because it would make future English
  support more expensive and conflicts with the constitution.

## Decision: GCP-ready shape, no deployment implementation

**Decision**: Keep `frontend/` and `backend/` independently buildable and add
documentation notes for future GCP deployment. Do not create Cloud Run services,
Cloud Build pipelines, Terraform, or production deployment scripts in this
feature.

**Rationale**: The user explicitly wants GCP deployment to be addable later, not
implemented now. The project structure and configuration should not block that
future feature.

**Alternatives considered**:
- Implement full GCP deployment now: rejected as outside MVP scope.
- Ignore deployment shape: rejected because frontend/backend independence is a
  constitutional requirement.
