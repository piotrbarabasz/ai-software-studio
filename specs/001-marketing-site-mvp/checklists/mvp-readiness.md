# MVP Readiness Checklist: Marketing Website MVP

**Purpose**: Validate whether the feature requirements and plan are clear,
complete, and consistent enough to move into implementation tasks.
**Created**: 2026-07-04
**Feature**: [spec.md](../spec.md)

**Note**: This checklist tests the quality of the requirements and planning
artifacts. It does not test implementation behavior.

## Requirement Completeness

- [ ] CHK001 Are all single-page landing sections explicitly listed with their required purpose and content boundaries? [Completeness, Spec FR-001]
- [ ] CHK002 Are all required service categories documented with enough business context to guide Polish copywriting? [Completeness, Spec FR-002, Spec FR-003]
- [ ] CHK003 Are process section requirements complete enough to distinguish discovery, scoping, implementation, validation, delivery, and support handoff? [Completeness, Spec FR-004]
- [ ] CHK004 Are technology section requirements complete enough to explain each capability as a trust signal rather than only naming tools? [Completeness, Spec FR-005]
- [ ] CHK005 Are placeholder case-study requirements complete enough to prevent accidental claims of real client outcomes? [Completeness, Spec FR-006]
- [ ] CHK006 Are about-section requirements complete enough to define "technical partner" positioning in measurable copy terms? [Gap, Spec FR-007]
- [ ] CHK007 Are contact form field requirements complete, including required and optional fields, consent, field lengths, and allowed values? [Completeness, Spec FR-008 to FR-010, Data Model Contact Inquiry]

## Requirement Clarity

- [ ] CHK008 Is the exact MVP exclusion boundary unambiguous for authentication, admin panel, payment, blog, CMS, database, queue, and full GCP deployment? [Clarity, Spec FR-015, Plan Complexity Tracking]
- [ ] CHK009 Is "professional" defined through concrete content, UX, accessibility, and trust-building requirements rather than subjective taste? [Ambiguity, Spec FR-001]
- [ ] CHK010 Is "fast" quantified with measurable Lighthouse, dependency-size, and contact API response expectations suitable for acceptance criteria? [Clarity, Spec SC-009 to SC-010, Plan Performance Goals]
- [ ] CHK011 Is "SEO-friendly" specified with required metadata fields, heading rules, language metadata, and social preview expectations? [Clarity, Spec FR-017, Data Model SEO Metadata]
- [ ] CHK012 Is "English-ready" clarified enough to guide whether copy is stored in content objects, route structure, metadata, or a later i18n framework? [Clarity, Spec FR-018, Research Polish content decision]
- [ ] CHK013 Is the no-database contact delivery requirement clear about email notification success, delivery failure, and no persistent storage? [Clarity, Spec FR-014, Research Email notification decision]

## Requirement Consistency

- [ ] CHK014 Are the spec, plan, and research consistent that the MVP is one landing page, not a multi-page site? [Consistency, Spec Clarifications, Plan Summary, Research Single-page decision]
- [ ] CHK015 Are the spec and plan consistent that GCP deployment is future-ready documentation only, with no active deployment implementation now? [Consistency, Spec FR-020, Plan Target Platform, Research GCP-ready decision]
- [ ] CHK016 Are API requirements consistent between the spec, plan, data model, and OpenAPI contract for `GET /health` and `POST /api/contact`? [Consistency, Spec API Contract Impact, Plan API contract, Contract openapi.yaml]
- [ ] CHK017 Are no-database requirements consistent across contact inquiry data, delivery flow, notification failure, and assumptions? [Consistency, Spec Assumptions, Data Model Contact Inquiry, Research Email notification decision]
- [ ] CHK018 Are Polish-first content requirements consistent across public copy, metadata, validation messages, and future English support? [Consistency, Spec Localization Scope, Spec FR-018]

## Acceptance Criteria Quality

- [ ] CHK019 Are success criteria tied to the primary business outcomes of lead generation, trust building, and service explanation? [Acceptance Criteria, Spec Business Context, Spec SC-001 to SC-008]
- [ ] CHK020 Are contact form success and failure criteria measurable enough to derive tests for valid submission, validation errors, consent rejection, and backend delivery failure? [Acceptance Criteria, Spec User Story 4, Spec SC-004]
- [ ] CHK021 Are accessibility success criteria specific enough to cover WCAG 2.2 AA, keyboard reachability, screen-reader labels, focus visibility, contrast, and error association? [Clarity, Spec FR-022, Spec SC-011, Quickstart Accessibility]
- [ ] CHK022 Are SEO success criteria measurable enough to evaluate title, description, headings, language, canonical URL, and preview metadata? [Gap, Spec SC-008, Data Model SEO Metadata]
- [ ] CHK023 Are responsive layout criteria specific enough to cover mobile, tablet, desktop, and no horizontal scrolling without requiring design guesswork? [Clarity, Spec SC-007]

## Scenario Coverage

- [ ] CHK024 Are primary visitor journeys covered from first impression through service evaluation, trust building, and inquiry submission? [Coverage, Spec User Stories 1-4]
- [ ] CHK025 Are alternate visitor journeys specified for unsure visitors comparing services or scanning technology credibility before contact? [Coverage, Spec User Stories 2-3]
- [ ] CHK026 Are exception flows specified for invalid contact data, missing consent, repeated submissions, and unavailable contact delivery? [Coverage, Spec Edge Cases, Contract 422/429/503]
- [ ] CHK027 Are recovery requirements defined for backend delivery failure, including user-facing message expectations and non-sensitive backend logging? [Clarity, Spec FR-021, Research Email notification decision]
- [ ] CHK028 Are operational health requirements defined clearly enough to separate backend reachability from email delivery readiness? [Clarity, Spec FR-013, Contract HealthResponse]

## Non-Functional Requirements

- [ ] CHK029 Are accessibility requirements aligned with WCAG 2.2 AA and Lighthouse Accessibility >= 90 for the MVP? [Clarity, Spec FR-022, Spec Accessibility & Performance Impact]
- [ ] CHK030 Are performance requirements quantified for Lighthouse Performance, initial dependency weight, and local contact API response expectations? [Clarity, Spec SC-009 to SC-010, Plan Performance Goals]
- [ ] CHK031 Are security requirements complete for public form input, consent handling, CORS, secrets, non-sensitive errors, and abuse throttling readiness? [Completeness, Spec Security Impact, Research Rate-limit-ready decision]
- [ ] CHK032 Are observability requirements defined for contact submission outcomes, validation failures, delivery failures, and health checks without logging sensitive message content? [Gap, Plan Technical Context]
- [ ] CHK033 Are privacy requirements defined for what contact data is transmitted by email, how consent text is worded, and what is not stored? [Gap, Spec Contact Inquiry, Data Model Contact Inquiry]

## Dependencies & Assumptions

- [ ] CHK034 Are environment variable requirements complete for frontend API URL, backend CORS origins, contact recipient, email provider credentials, and local development defaults? [Completeness, Quickstart Backend Setup, Quickstart Frontend Setup]
- [ ] CHK035 Are external email provider assumptions documented well enough to plan failure modes without locking the MVP to a vendor? [Assumption, Research Email notification decision]
- [ ] CHK036 Are future deployment assumptions documented without accidentally requiring Cloud Run, Cloud Build, Terraform, or production secrets in this feature? [Assumption, Plan Target Platform, Research GCP-ready decision]
- [ ] CHK037 Are local development assumptions complete for running the Angular dev server and FastAPI dev server with CORS enabled for the local frontend origin? [Completeness, Quickstart Backend Setup, Quickstart Frontend Setup]

## Traceability & Task Readiness

- [ ] CHK038 Is every major section requirement traceable from spec to plan and likely task groups for frontend, backend, docs, and tests? [Traceability, Spec FR-001 to FR-020, Plan Project Structure]
- [ ] CHK039 Are API schema fields traceable from contact form requirements to data model fields and OpenAPI request properties? [Traceability, Spec FR-008 to FR-012, Data Model Contact Inquiry, Contract ContactInquiryRequest]
- [ ] CHK040 Are task-generation boundaries clear enough to avoid creating database, authentication, admin, blog, payment, or full deployment tasks? [Traceability, Spec FR-015, Plan Complexity Tracking]

## Notes

- Use this checklist before `/speckit-tasks` to identify requirement wording
  that should be tightened before tasks are generated.
- Items marked `[Gap]`, `[Ambiguity]`, or `[Assumption]` are candidates for
  spec or plan refinement if they would affect task scope.
