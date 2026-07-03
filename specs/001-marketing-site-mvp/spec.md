# Feature Specification: Marketing Website MVP

**Feature Branch**: `001-marketing-site-mvp`

**Created**: 2026-07-03

**Status**: Draft

**Input**: User description: "Build the MVP of a professional marketing website
for AISoftware Studio, a solo software development and AI automation service
brand. The website should help potential clients understand services and
encourage them to contact me. Target clients include small and medium
businesses, companies needing custom web applications, companies wanting AI
automations, internal tools, integrations, dashboards, workflow automation, and
early-stage businesses needing MVP development. The site must include homepage,
services, process, technology, case-study-style examples, about, and contact
sections. The contact form must collect name, email, company, project type,
budget range, message, and consent, send data to the backend API, and the
backend must validate submissions and expose a health endpoint. The MVP excludes
authentication, admin panel, payment, blog, CMS, and database. The site must be
responsive, fast, SEO-friendly, professional, written in Polish, and structured
so GCP deployment can be added later."

## Business Context *(mandatory)*

**Primary Business Outcome**: Lead generation, trust building, and clear service
explanation.

**Target Visitor**: Polish-speaking small or medium business owner, operations
leader, founder, or decision maker looking for custom software, AI automation,
internal tools, integrations, dashboards, workflow automation, or MVP delivery.

**Conversion or Trust Signal**: A qualified contact form submission, a clear
understanding of the service offer, and increased confidence that AISoftware
Studio can act as a technical partner.

**Localization Scope**: All public website copy must be in Polish for the MVP.
Content structure must allow future English support without redesigning the
information architecture.

## Clarifications

### Session 2026-07-04

- Q: Exact MVP page scope? -> A: Single professional landing page with anchor
  sections: hero, services, process, technology, examples, about, contact.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Understand Offer and Start Contact (Priority: P1)

A potential client lands on the website, quickly understands what AISoftware
Studio does, sees a clear value proposition, and can move directly toward
contacting the studio.

**Why this priority**: The homepage, value proposition, and CTA are the primary
lead-generation path and must make the offer understandable before supporting
sections are explored.

**Independent Test**: A Polish-speaking business visitor can identify the main
services and locate the contact CTA from the first screen without using search
or external context.

**Acceptance Scenarios**:

1. **Given** a first-time visitor opens the website, **When** the homepage
   loads, **Then** the visitor sees the AISoftware Studio brand, a concise
   Polish value proposition, and a primary CTA leading to contact.
2. **Given** a visitor wants to assess fit quickly, **When** they scan the hero
   and trust-building copy, **Then** they can understand that the studio builds
   custom web applications, AI automations, internal tools, integrations,
   dashboards, workflow automations, and MVPs.
3. **Given** a visitor is ready to inquire, **When** they activate the primary
   CTA, **Then** they are taken to the contact section without losing context.

---

### User Story 2 - Evaluate Services and Cooperation Model (Priority: P2)

A potential client reviews the services and process sections to decide whether
their project type fits AISoftware Studio's offer and cooperation style.

**Why this priority**: Service clarity and a predictable process reduce buyer
uncertainty and improve the quality of inquiries.

**Independent Test**: A visitor can match at least one of their needs to a
service category and understand the cooperation flow from discovery to delivery.

**Acceptance Scenarios**:

1. **Given** a visitor has a business problem, **When** they read the services
   section, **Then** they see at least these service categories: custom web
   application development, AI automations and AI assistants, backend/API
   development, business process automation, external system integrations, and
   MVP/prototype development.
2. **Given** a visitor wants to understand delivery risk, **When** they read the
   process section, **Then** they see a clear sequence from discovery through
   scope definition, implementation, validation, delivery, and support handoff.
3. **Given** a visitor is unsure which service fits, **When** they compare the
   service descriptions, **Then** each service includes a concise business
   outcome or example use case.

---

### User Story 3 - Build Trust Before Inquiry (Priority: P3)

A potential client reviews technology, case-study-style examples, and the about
section to assess credibility and decide whether the studio is a serious
technical partner.

**Why this priority**: Trust-building content supports conversion for visitors
who need more proof before making contact.

**Independent Test**: A visitor can identify the studio's technology focus,
understand example project types, and perceive the owner as a technical partner
rather than only a freelance implementer.

**Acceptance Scenarios**:

1. **Given** a technically aware visitor reviews the technology section,
   **When** they scan the content, **Then** they see Angular, FastAPI, Python,
   cloud, GCP, APIs, databases, AI/RAG/LLM tools, and related capability
   framing.
2. **Given** a visitor wants proof of project thinking, **When** they read the
   case-study-style section, **Then** they see clearly labeled placeholder
   examples that can later be replaced with real projects.
3. **Given** a visitor wants to assess cooperation fit, **When** they read the
   about section, **Then** they see AISoftware Studio presented as a technical
   partner focused on business outcomes, maintainable delivery, and automation
   expertise.

---

### User Story 4 - Submit a Qualified Project Inquiry (Priority: P4)

A potential client completes the contact form with enough structured
information for the owner to assess the opportunity and respond.

**Why this priority**: The form turns website interest into an actionable lead
while keeping the MVP free of accounts, admin panels, payment, CMS, and database
features.

**Independent Test**: A visitor can submit a valid inquiry and receives clear
confirmation, while invalid or incomplete submissions are rejected with helpful
Polish messages.

**Acceptance Scenarios**:

1. **Given** a visitor fills in valid contact details, project type, budget
   range, message, and consent, **When** they submit the form, **Then** the
   submission is accepted and the visitor sees a confirmation in Polish.
2. **Given** a visitor omits a required field or enters an invalid email,
   **When** they submit the form, **Then** the form identifies the issue in
   Polish and does not submit invalid data.
3. **Given** a visitor does not grant required consent, **When** they try to
   submit the form, **Then** the submission is blocked and the consent
   requirement is explained.
4. **Given** the site owner needs to verify that contact intake is available,
   **When** the operational health check is requested, **Then** the system
   reports whether the contact backend is reachable.

### Edge Cases

- The visitor opens the site on a narrow mobile viewport.
- The visitor navigates using only keyboard controls.
- The visitor uses a screen reader and needs labels for navigation, CTA, and
  form controls.
- The visitor enters an invalid email address, a too-short message, or a message
  that exceeds the allowed length.
- The visitor submits the form multiple times in a short period.
- The visitor leaves the optional company field blank.
- The visitor selects a budget range but describes a project that may not match
  the selected range.
- The submission service is temporarily unavailable.
- Placeholder case-study content could be mistaken for real client work if not
  clearly labeled.
- A search engine or link preview reads the page without user interaction.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST present a professional Polish homepage for
  AISoftware Studio as a single landing page with anchor sections for hero,
  services, process, technology, examples, about, and contact.
- **FR-002**: System MUST include a services section covering custom web
  application development, AI automations and AI assistants, backend/API
  development, business process automation, external system integrations, and
  MVP/prototype development.
- **FR-003**: System MUST describe each service with a business-oriented outcome
  or example use case relevant to the target clients.
- **FR-004**: System MUST include a process section explaining cooperation from
  discovery to delivery in clear, non-technical Polish.
- **FR-005**: System MUST include a technology section presenting Angular,
  FastAPI, Python, cloud, GCP, APIs, databases, AI/RAG/LLM tools, and related
  capability areas as service credibility signals.
- **FR-006**: System MUST include a case-study-style section with placeholder
  examples that are explicitly labeled as examples or placeholders until
  replaced by real projects.
- **FR-007**: System MUST include an about section presenting AISoftware Studio
  as a technical partner focused on business outcomes, quality delivery, and AI
  automation expertise.
- **FR-008**: System MUST include a contact section with a form that displays
  fields for name, email, company, project type, budget range, message, and a
  consent checkbox.
- **FR-009**: System MUST require name, valid email, project type, budget range,
  message, and consent before accepting a contact submission.
- **FR-010**: System MUST allow the company field to be left blank while still
  collecting it when provided.
- **FR-011**: System MUST send valid contact submissions to the backend contact
  intake service and show a Polish success confirmation after acceptance.
- **FR-012**: System MUST validate contact submissions on the backend and reject
  missing, malformed, abusive, or oversized input with non-sensitive error
  responses.
- **FR-013**: System MUST provide an operational health check for the contact
  backend.
- **FR-014**: System MUST deliver accepted inquiries to the site owner through a
  no-database notification path defined during planning.
- **FR-015**: System MUST NOT include authentication, admin panel, payment, blog,
  CMS, or database behavior in the MVP.
- **FR-016**: System MUST be responsive across mobile, tablet, and desktop
  viewport sizes.
- **FR-017**: System MUST support SEO-friendly discovery with meaningful page
  title, description, headings, and crawlable primary content.
- **FR-018**: System MUST keep all public copy in Polish while preserving a
  content structure that can support English later.
- **FR-019**: System MUST make the contact path reachable from the homepage,
  services, process, and final contact areas.
- **FR-020**: System MUST be structured so Google Cloud Platform deployment can
  be planned as a separate future feature without changing the MVP scope.

### Constitution Constraints *(mandatory)*

- **Complexity Justification**: None. The MVP explicitly excludes CMS,
  authentication, admin panel, payment, blog, and database functionality.
- **API Contract Impact**: Adds contact submission behavior and an operational
  health check. Planning must define the contract for accepted contact fields,
  validation errors, success response, and health status.
- **Security Impact**: Public input requires consent capture, server-side
  validation, non-sensitive errors, no secrets in the repository, restricted
  cross-origin access outside local development, and a rate-limit-ready contact
  boundary.
- **Deployment Impact**: Both public website and contact backend behavior are in
  scope for the MVP, but GCP deployment itself is deferred to a separate feature.
- **Accessibility & Performance Impact**: The website must be responsive,
  keyboard accessible, screen-reader understandable, fast on common mobile and
  desktop connections, and readable without layout shifts that block contact.

### Key Entities *(include if feature involves data)*

- **Contact Inquiry**: A submitted lead containing name, email, optional company,
  project type, budget range, message, consent confirmation, and submission
  timestamp or equivalent receipt metadata.
- **Service Offering**: A public description of a service category, its business
  outcome, and representative use cases.
- **Process Step**: A stage in cooperation from discovery to delivery, including
  what the client can expect and what decision or artifact results.
- **Technology Capability**: A technology or capability area shown to build
  trust, such as Angular, FastAPI, Python, cloud, GCP, APIs, databases, and
  AI/RAG/LLM tools.
- **Placeholder Case Study**: A clearly labeled example project with problem,
  approach, and outcome fields that can later be replaced by a real case study.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of test visitors can state what AISoftware Studio
  offers and who it serves within 30 seconds of landing on the homepage.
- **SC-002**: At least 90% of test visitors can find a contact CTA from the
  first screen and from the final section without external instructions.
- **SC-003**: A visitor can complete and submit a valid inquiry in under 2
  minutes.
- **SC-004**: 100% of invalid contact submissions in validation tests are
  rejected with a clear Polish explanation and without accepting invalid data.
- **SC-005**: 100% of required public sections are present: homepage, services,
  process, technology, case-study-style examples, about, and contact.
- **SC-006**: 100% of primary interactive elements are keyboard reachable and
  have understandable labels for assistive technology.
- **SC-007**: The primary content and contact CTA remain usable without
  horizontal scrolling on common mobile, tablet, and desktop viewport widths.
- **SC-008**: Search and link previews can identify the brand, service category,
  and Polish description from page metadata and headings.

## Assumptions

- The MVP is delivered as one cohesive landing page with section navigation, not
  as a multi-page site.
- Public copy is Polish; internal implementation documentation may remain in
  English unless a later feature requires otherwise.
- The company field is displayed but optional to avoid blocking founders or
  early-stage leads who do not yet operate under a formal company name.
- Contact delivery to the owner does not require a database; planning may choose
  an email or equivalent notification path configured outside the repository.
- Placeholder case studies are not presented as real client outcomes.
- GCP deployment implementation is out of scope for this feature, but the MVP
  must avoid choices that would make independent future deployment difficult.
- The website does not require authentication, user accounts, online payment,
  admin editing, CMS-managed content, blog publishing, or persistent lead
  storage.
