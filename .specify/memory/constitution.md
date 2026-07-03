<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Placeholder principles -> AI Software Studio project principles I-XII
Added sections:
- Technology & Architecture Standards
- Development Workflow & Quality Gates
Removed sections:
- Placeholder Section 2
- Placeholder Section 3
Templates requiring updates:
- .specify/templates/plan-template.md: updated
- .specify/templates/spec-template.md: updated
- .specify/templates/tasks-template.md: updated
- .specify/templates/commands/*.md: not present
Runtime guidance docs:
- README.md / docs/quickstart.md / agent guidance: not present
Follow-up TODOs: None
-->

# AI Software Studio Constitution

## Core Principles

### I. Business Outcomes First
Every feature MUST support at least one explicit business outcome: lead
generation, trust building, or clear explanation of AI Software Studio services.
Feature specs MUST state the target visitor, the intended conversion or trust
signal, and measurable success criteria. Work that is only decorative or
technology-driven MUST NOT be accepted without a documented business rationale.

Rationale: This project is a professional marketing website for a solo software
development and AI automation service brand.

### II. Production-Ready Engineering
All generated code MUST be clean, typed, testable, and deployable from the first
implementation. Frontend and backend code MUST include linting, formatting,
automated tests appropriate to the risk, and local scripts that a new maintainer
can run without hidden setup steps. Temporary prototype shortcuts MUST be
tracked as explicit follow-up tasks before merge.

Rationale: The site represents a professional services brand and cannot rely on
throwaway implementation practices.

### III. Simple MVP Before Complexity
Features MUST choose the simplest architecture that satisfies the current
business requirement. A CMS, authentication system, database, queue, background
worker, or other persistent infrastructure MUST NOT be introduced unless the
feature specification proves it is required. Any added complexity MUST include a
simpler alternative considered and rejected.

Rationale: The initial product is a focused marketing site, not a platform.

### IV. Separated Frontend and Backend
The frontend and backend MUST be separate applications with independent source
trees, build commands, tests, configuration, and deployment paths. The frontend
MUST communicate with the backend only through documented HTTP APIs. Runtime
coupling, shared process assumptions, and hidden cross-application dependencies
MUST be rejected.

Rationale: Independent deployment and clear ownership reduce operational risk.

### V. Angular Frontend Standard
The frontend MUST use Angular. Angular code MUST use typed models or interfaces
for API data, framework-native routing and forms, accessible component patterns,
and environment-based configuration. User-facing pages MUST be responsive and
fast on mobile and desktop viewports.

Rationale: A single frontend framework standard keeps the MVP coherent and easy
to maintain.

### VI. FastAPI Backend Standard
The backend MUST use FastAPI. Backend code MUST validate all inputs with typed
schemas, expose predictable error responses, isolate configuration in
environment-driven settings, and include tests for API behavior and validation
boundaries. Backend implementation MUST remain minimal unless a feature requires
additional infrastructure.

Rationale: FastAPI provides typed request handling and OpenAPI generation that
fit the project contract requirements.

### VII. Explicit API Contracts
Every backend endpoint MUST be represented in the generated OpenAPI schema.
Contract changes MUST be reviewed against frontend usage, documented in the
feature plan, and covered by contract or integration tests. Frontend integration
MUST use typed request and response shapes derived from or checked against the
API contract whenever practical.

Rationale: The frontend/backend split is only reliable when API behavior is
explicit and testable.

### VIII. Independent Google Cloud Deployment
The frontend and backend MUST be deployable independently to Google Cloud
Platform-compatible targets. Each application MUST own its runtime
configuration, build output, health or smoke-check path, and deployment
instructions. A change to one application MUST NOT require redeploying the other
unless the API contract intentionally changes.

Rationale: Independent deployment keeps releases small and operationally clear.

### IX. Modern, Accessible, Fast UX
The UX MUST be modern, responsive, accessible, and suitable for a software house
and AI automation agency. Pages MUST prioritize clear service explanation,
credible proof, and direct contact paths. Accessibility, Core Web Vitals, and
mobile usability MUST be treated as release criteria, not polish afterthoughts.

Rationale: Trust and conversion depend on clarity, speed, and inclusive access.

### X. Clear Structure, Scripts, and Local Instructions
Generated code MUST include an obvious folder structure, package scripts, and
local development instructions for frontend, backend, testing, and deployment
preparation. Any required environment variable MUST be documented with a safe
example value. New features MUST update instructions when setup or commands
change.

Rationale: The project must remain easy to run, review, and deploy by one
developer or a small external team.

### XI. Security and Contact Endpoint Resilience
Secrets MUST NOT be committed. Runtime secrets and environment-specific values
MUST come from environment variables or managed secret stores. CORS MUST be
restricted to approved origins outside local development. Public inputs MUST be
validated, errors MUST avoid leaking sensitive data, and the contact endpoint
MUST be designed for rate limiting and abuse protection even if the first MVP
uses a simple implementation.

Rationale: A public marketing site needs basic security controls from day one.

### XII. Polish-First, Internationalization-Ready Content
Initial user-facing content MUST be in Polish. Content architecture, route
planning, and component design MUST allow English language support later without
rewriting the application. Hard-coded strings in reusable UI or service logic
MUST be avoided when they would block later localization.

Rationale: The initial market is Polish, while the brand architecture must not
close the door on English support.

## Technology & Architecture Standards

The default repository structure MUST separate `frontend/` for Angular and
`backend/` for FastAPI. Shared documentation and generated API contracts MAY
live in `docs/`, `contracts/`, or feature-specific `specs/` directories when
the plan names the exact path.

The backend MUST expose OpenAPI documentation through FastAPI. The plan for any
API-bearing feature MUST name the relevant endpoints, validation schemas, error
responses, and frontend consumers. Contact or lead-capture features MUST include
input validation, spam/abuse considerations, and a rate-limit-ready boundary.

The MVP MUST avoid CMS, authentication, databases, and persistent background
systems until a feature specification proves they are necessary. If storage is
required, the plan MUST state the data lifecycle, security implications, and
deployment impact before tasks are generated.

Deployment design MUST assume Google Cloud Platform and independent deployable
artifacts for frontend and backend. Environment variables, CORS origins, build
commands, smoke checks, and rollback considerations MUST be documented before a
feature is considered production-ready.

## Development Workflow & Quality Gates

Feature specifications MUST describe business value, user journeys, acceptance
criteria, measurable outcomes, localization expectations, and security or privacy
implications. Plans MUST pass the Constitution Check before implementation tasks
are generated.

Implementation tasks MUST preserve independent frontend/backend delivery,
explicit OpenAPI contracts, typed code, validation, accessibility, and local
developer instructions. Tests MUST cover API contracts, validation boundaries,
critical frontend journeys, and any business-critical lead generation path.

Reviews MUST verify that new complexity is justified, no secrets are committed,
CORS remains restricted, user-facing Polish content remains coherent, and any
English-language readiness decisions are documented. A feature that violates the
constitution MUST include a Complexity Tracking entry and cannot proceed without
explicit approval.

## Governance

This constitution supersedes conflicting project practices, generated templates,
and feature-level preferences. Amendments MUST be made by updating this file,
including a Sync Impact Report, and propagating changes to affected templates or
runtime guidance.

Versioning follows semantic versioning:
- MAJOR: removes or redefines principles in a backward-incompatible way.
- MINOR: adds a principle or materially expands governance requirements.
- PATCH: clarifies wording without changing required behavior.

Every feature plan MUST include a Constitution Check. Every task list MUST
preserve the gates defined here. Compliance review is required before accepting
implementation work, before deployment preparation, and whenever a feature adds
API surface, public input handling, storage, or deployment infrastructure.

**Version**: 1.0.0 | **Ratified**: 2026-07-03 | **Last Amended**: 2026-07-03
