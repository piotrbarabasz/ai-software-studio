# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`

**Created**: [DATE]

**Status**: Draft

**Input**: User description: "$ARGUMENTS"

## Business Context *(mandatory)*

<!--
  ACTION REQUIRED: Tie every feature to the constitution. At least one business
  outcome must be explicit: lead generation, trust building, or service
  explanation.
-->

**Primary Business Outcome**: [lead generation / trust building / service explanation / NEEDS CLARIFICATION]

**Target Visitor**: [e.g., Polish SME founder, operations manager, agency buyer, or NEEDS CLARIFICATION]

**Conversion or Trust Signal**: [e.g., contact request, consultation CTA, case-study credibility, clearer service understanding]

**Localization Scope**: Polish-first content required; note any English-ready structure or deferred translation work.

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when [boundary condition]?
- How does system handle [error scenario]?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST [specific visitor-facing capability tied to the business outcome]
- **FR-002**: System MUST provide Polish-first user-facing content for this feature
- **FR-003**: System MUST preserve English-ready content or routing structure where reusable
- **FR-004**: System MUST validate all public inputs involved in this feature
- **FR-005**: System MUST keep frontend and backend behavior separated through explicit API contracts when an API is involved
- **FR-006**: System MUST expose backend behavior through OpenAPI when an endpoint is added or changed
- **FR-007**: System MUST document required environment variables without committing secrets
- **FR-008**: System MUST avoid CMS, authentication, database, or persistent infrastructure unless justified below

*Example of marking unclear requirements:*

- **FR-009**: System MUST send contact submissions via [NEEDS CLARIFICATION: delivery mechanism not specified - email provider, webhook, CRM?]
- **FR-010**: System MUST retain lead/contact data for [NEEDS CLARIFICATION: retention period and storage location not specified]

### Constitution Constraints *(mandatory)*

- **Complexity Justification**: [State "None" or justify any CMS/auth/database/queue/storage]
- **API Contract Impact**: [State "None" or list endpoints and OpenAPI changes required]
- **Security Impact**: [Public inputs, CORS origins, rate-limit-ready contact paths, secret handling]
- **Deployment Impact**: [Frontend-only / backend-only / both independently deployable]
- **Accessibility & Performance Impact**: [Responsive behavior, accessibility criteria, speed expectations]

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]
- **SC-005**: [Business metric, e.g., "Increase qualified contact clicks/submissions by X%" or "Visitor understands service offer within Y seconds"]

## Assumptions

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right assumptions based on reasonable defaults
  chosen when the feature description did not specify certain details.
-->

- [Assumption about target users, e.g., "Users have stable internet connectivity"]
- [Assumption about scope boundaries, e.g., "Mobile support is out of scope for v1"]
- [Assumption about data/environment, e.g., "Existing authentication system will be reused"]
- [Dependency on existing system/service, e.g., "Requires access to the existing user profile API"]
