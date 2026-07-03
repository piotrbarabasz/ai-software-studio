# Implementation Plan: Marketing Website MVP

**Branch**: `001-marketing-site-mvp` | **Date**: 2026-07-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-marketing-site-mvp/spec.md`

## Summary

Build a single-page, Polish-first professional marketing website for AISoftware
Studio with anchor sections for hero, services, process, technology, example
case studies, about, and contact. The frontend will be an Angular application
using standalone components, Angular routing, reactive forms, mobile-first
responsive styling, SEO metadata, and environment-based API URL configuration.
The backend will be a separate FastAPI application exposing `GET /health` and
`POST /api/contact`, validating contact inquiries with Pydantic, applying CORS
configuration, delivering accepted inquiries by email notification without a
database, and including pytest coverage for validation and endpoints.

## Technical Context

**Language/Version**: TypeScript for Angular frontend; Python 3.11+ for FastAPI backend

**Primary Dependencies**: Angular, Angular Router, Angular Reactive Forms,
TypeScript, SCSS or CSS, FastAPI, Pydantic, pytest, ASGI server for local
development, provider-agnostic email delivery adapter configured by environment
variables

**Storage**: None for MVP. No CMS, authentication, admin panel, payment, blog,
database, queue, or persistent lead storage.

**Testing**: Angular unit/component tests for navigation, rendering, metadata,
and reactive contact form behavior; pytest tests for FastAPI health endpoint,
contact validation, contact delivery success/failure, CORS behavior, and
OpenAPI availability

**Target Platform**: Local Angular dev server plus local FastAPI dev server for
development. Future deployment must allow frontend and backend to ship
independently on Google Cloud Platform. Backend should be Cloud Run-ready;
frontend should be buildable as static assets or containerized later.

**Project Type**: Marketing website with separate Angular frontend and FastAPI
backend.

**Performance Goals**: Single-page website remains usable on mobile, tablet,
and desktop without horizontal scrolling; primary content and contact CTA are
available quickly on common mobile connections; production build should avoid
unnecessary runtime dependencies and large nonessential assets.

**Constraints**: Polish public copy; future English support through structured
content and routing decisions; no secrets in repo; environment-based
configuration; restricted CORS outside local development; explicit OpenAPI
contract; contact endpoint validates public input and is rate-limit-ready; no
full GCP deployment work in this feature.

**Scale/Scope**: Solo-service professional marketing site MVP focused on lead
generation, trust building, and service explanation. One public landing page,
one contact API endpoint, one health endpoint, no persistence.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Business value**: PASS. The feature directly supports lead generation,
  trust building, and clear service explanation with measurable conversion and
  comprehension criteria.
- **MVP simplicity**: PASS. The plan excludes CMS, authentication, admin panel,
  payment, blog, database, queues, and persistent lead storage.
- **Architecture separation**: PASS. Source code is separated into
  `frontend/` and `backend/`, each independently buildable, testable,
  configurable, and deployable later.
- **API contract**: PASS. FastAPI exposes OpenAPI for `GET /health` and
  `POST /api/contact`; the contract is captured in
  `contracts/openapi.yaml`.
- **UX and localization**: PASS. The plan requires responsive, accessible,
  Polish-first UI and structured content that can support English later.
- **Security**: PASS. Contact inputs are validated server-side, secrets are
  environment-driven, CORS is restricted, delivery failure is not hidden, and
  the contact endpoint is designed for future rate limiting.
- **Developer readiness**: PASS. The plan includes clear folders, local dev
  commands, tests, environment variables, and GCP-oriented deployment notes
  without implementing deployment.

**Post-design re-check**: PASS. Phase 1 artifacts preserve the same boundaries:
no database, no authentication, explicit contracts, local validation guide, and
independent frontend/backend structure.

## Project Structure

### Documentation (this feature)

```text
specs/001-marketing-site-mvp/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- openapi.yaml
`-- checklists/
    `-- requirements.md
```

### Source Code (repository root)

```text
frontend/
|-- package.json
|-- angular.json
|-- src/
|   |-- app/
|   |   |-- app.config.ts
|   |   |-- app.routes.ts
|   |   |-- core/
|   |   |-- features/
|   |   |   |-- landing/
|   |   |   `-- contact/
|   |   |-- shared/
|   |   `-- services/
|   |-- assets/
|   `-- environments/
`-- README.md or documented frontend commands

backend/
|-- requirements.txt or pyproject.toml
|-- app/
|   |-- main.py
|   |-- api/
|   |   |-- health.py
|   |   `-- contact.py
|   |-- core/
|   |   |-- config.py
|   |   `-- cors.py
|   |-- schemas/
|   |   `-- contact.py
|   `-- services/
|       `-- contact_delivery.py
|-- tests/
|   |-- contract/
|   |-- integration/
|   `-- unit/
`-- README.md or documented backend commands

infra/
`-- README.md               # Placeholder direction only; no GCP deployment implementation

docs/
|-- local-development.md
`-- deployment-notes.md     # GCP direction, not active deployment code
```

**Structure Decision**: Use separated `frontend/`, `backend/`, `infra/`,
`docs/`, and `specs/` directories. The frontend and backend must not share a
runtime process. The frontend calls the backend through the configured API URL.
`infra/` remains documentation-only for this feature.

## Complexity Tracking

No constitution violations. The MVP intentionally avoids database, CMS,
authentication, admin panel, payment, blog, queue, and full GCP deployment.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
