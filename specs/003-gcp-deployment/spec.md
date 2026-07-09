# Feature Specification: GCP Deployment for AISoftware Studio MVP

**Feature Branch**: `003-gcp-deployment`

**Created**: 2026-07-09

**Status**: Draft

**Input**: User description: "Create a new feature specification for production deployment of the existing AISoftware Studio repository to Google Cloud Platform. The existing MVP marketing site has an Angular 17 frontend, FastAPI backend, completed MVP artifacts, and deferred infrastructure. Add production-ready GCP deployment without changing MVP business scope. Provide repeatable deployment for the Angular frontend as a production static web container, the FastAPI backend as a Cloud Run service, GCP configuration documentation and scripts sufficient for first manual deployment and later CI/CD. Preserve exclusions: no database, authentication, CMS, payments, admin panels, queues, persistent lead storage, Terraform or real secrets."

## Business Context *(mandatory)*

**Primary Business Outcome**: Lead generation and trust building by making the public AISoftware Studio marketing website and contact intake API reliably available in production.

**Target Visitor**: Polish-speaking potential client visiting the public website, plus the site owner/developer responsible for releasing the MVP to production.

**Conversion or Trust Signal**: A visitor can open the deployed site and submit a contact inquiry, while the site owner can verify the release through documented smoke tests and repeatable deployment steps.

**Localization Scope**: Public website content remains Polish-first. Deployment documentation and operational runbooks may be written in English for developer clarity, but they must preserve the Polish-first public experience and avoid requiring public copy changes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deploy Backend Contact API (Priority: P1)

The site owner deploys the existing FastAPI backend to Google Cloud Run so the production contact API and health endpoint are publicly reachable.

**Why this priority**: The contact endpoint is the core conversion path. Without a reachable backend, the production site cannot accept inquiries.

**Independent Test**: The backend deployment can be tested by building the backend image, running it locally with production-like settings, deploying it to Cloud Run, and confirming the health endpoint responds successfully.

**Acceptance Scenarios**:

1. **Given** the backend deployment prerequisites are configured, **When** the site owner builds and deploys the backend service, **Then** the Cloud Run service starts successfully and exposes the existing health endpoint.
2. **Given** the backend container runs in a Cloud Run environment, **When** the platform provides a runtime port, **Then** the backend listens on that port and serves requests.
3. **Given** production CORS origins are configured, **When** the deployed frontend calls the backend, **Then** allowed origins succeed and unapproved origins are not treated as trusted.
4. **Given** SMTP configuration is needed for contact delivery, **When** production values are configured, **Then** sensitive values are supplied through environment variables or managed secret references without repository exposure.

---

### User Story 2 - Deploy Frontend Website (Priority: P2)

The site owner deploys the existing Angular marketing frontend to Google Cloud Run as a production static web container.

**Why this priority**: The frontend is the public entry point for potential clients and must be independently deployable from the backend.

**Independent Test**: The frontend deployment can be tested by building the frontend image, running it locally, opening the site, and confirming route fallback works before deploying to Cloud Run.

**Acceptance Scenarios**:

1. **Given** the frontend deployment prerequisites are configured, **When** the site owner builds and deploys the frontend service, **Then** the public marketing website is reachable from its Cloud Run URL.
2. **Given** a visitor opens a direct Angular route, **When** the frontend service receives the request, **Then** it serves the application through SPA fallback instead of returning a missing page.
3. **Given** the backend service URL differs by environment, **When** the frontend is built or configured for production, **Then** the public contact form uses the configured backend API URL.

---

### User Story 3 - Configure Production Safely (Priority: P3)

The site owner configures production environment variables, secrets, service names, region, and project-specific values without committing private credentials.

**Why this priority**: Production deployment must be safe and repeatable. Secret leakage or hard-coded project values would undermine trust and make reuse difficult.

**Independent Test**: A reviewer can inspect committed files and confirm that all production-specific values are placeholders or documented configuration inputs, while sensitive values are represented as environment variables or managed secrets.

**Acceptance Scenarios**:

1. **Given** the deployment files are committed, **When** a reviewer searches the repository, **Then** no real SMTP passwords, API keys, private credentials, project IDs, or other secrets are present.
2. **Given** the site owner follows setup documentation, **When** they prepare a clean GCP project, **Then** the required APIs, artifact registry, Cloud Run services, secret values, CORS origins, and deployment variables are clear.
3. **Given** a deployment command or script needs project-specific values, **When** the site owner reads or runs it, **Then** placeholders make project ID, region, service names, domain names, and secret names explicit.

---

### User Story 4 - Run Repeatable Deployment and Preflight Checks (Priority: P4)

The site owner uses documented validation steps and Cloud Build configuration to avoid broken production releases and support later CI/CD.

**Why this priority**: A solo developer needs a low-friction path from local validation to repeatable production deployment without adding unnecessary infrastructure complexity.

**Independent Test**: The site owner can execute the documented frontend and backend validation commands, then trigger or inspect Cloud Build configurations for both deployable services.

**Acceptance Scenarios**:

1. **Given** the repository is ready for deployment, **When** the site owner runs documented preflight checks, **Then** frontend lint/test/build and backend lint/test validations are covered before release.
2. **Given** Cloud Build is available in the target project, **When** backend deployment is triggered from the documented configuration, **Then** the backend image is built and deployed to the configured Cloud Run service.
3. **Given** Cloud Build is available in the target project, **When** frontend deployment is triggered from the documented configuration, **Then** the frontend image is built and deployed to the configured Cloud Run service.
4. **Given** a later CI/CD process is added, **When** it uses the deployment configuration, **Then** the existing manual deployment path remains understandable and repeatable.

---

### User Story 5 - Verify Public Visitor Contact Flow (Priority: P5)

A potential client opens the deployed website and submits the contact form successfully against the deployed backend.

**Why this priority**: Deployment succeeds only if the public website and contact API work together for the business-critical inquiry journey.

**Independent Test**: A smoke test can open the deployed frontend, verify backend health, confirm CORS behavior, and submit a safe contact inquiry through the production configuration.

**Acceptance Scenarios**:

1. **Given** both services are deployed, **When** a visitor opens the public frontend URL, **Then** the marketing website loads without local-development dependencies.
2. **Given** a visitor submits a valid contact inquiry, **When** the frontend sends it to the deployed backend, **Then** the existing contact API behavior succeeds and the visitor sees the expected confirmation.
3. **Given** the site owner verifies the release, **When** they follow the production smoke-test instructions, **Then** frontend availability, backend health, CORS configuration, and contact API behavior are checked.
4. **Given** a release has a deployment issue, **When** the site owner consults the runbook, **Then** rollback and troubleshooting guidance is available without requiring a new infrastructure platform.

### Edge Cases

- A Cloud Run service starts with a platform-provided port rather than a hard-coded development port.
- A direct frontend route is requested before the Angular application has loaded.
- The frontend is deployed before the final backend URL is known.
- The backend receives a request from an origin that is not listed in production CORS settings.
- Required production environment variables or secrets are missing during service startup.
- SMTP credentials are needed in production but must not appear in committed files, logs, or example commands.
- A developer runs deployment commands from a clean GCP project that has not enabled required APIs.
- Cloud Build runs with missing permissions for Artifact Registry, Cloud Run, or Secret Manager references.
- The public frontend is reachable, but the contact API is not reachable or rejects requests because of CORS.
- Local development must keep working without production-only secrets or Cloud Run dependencies.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a production deployment path for the existing FastAPI backend to Google Cloud Run.
- **FR-002**: System MUST provide a production deployment path for the existing Angular frontend to Google Cloud Run as a static web container.
- **FR-003**: The backend runtime MUST honor the platform-provided port for production hosting.
- **FR-004**: The frontend runtime MUST serve Angular application routes with SPA fallback to the application entry page.
- **FR-005**: The production frontend MUST support a configurable backend API URL without requiring source-code edits for each deployment target.
- **FR-006**: The backend MUST support production CORS allowed origins configured through environment-specific values.
- **FR-007**: SMTP credentials, SMTP passwords, private keys, API keys, and equivalent sensitive values MUST NOT be committed to the repository.
- **FR-008**: Sensitive production values MUST be documented as environment variables or managed secret references.
- **FR-009**: Cloud Build configuration MUST support building and deploying the backend service to the configured Cloud Run target.
- **FR-010**: Cloud Build configuration MUST support building and deploying the frontend service to the configured Cloud Run target.
- **FR-011**: Deployment scripts, commands, and examples MUST use placeholders for GCP project ID, region, service names, domain names, image names, and secret names.
- **FR-012**: Deployment documentation MUST explain first-time GCP setup, required services, artifact storage, Cloud Run service creation or update, secret configuration, Cloud Build usage, CORS setup, and smoke testing.
- **FR-013**: Operational documentation MUST include production smoke tests for frontend availability, backend health, CORS behavior, and contact API behavior.
- **FR-014**: Operational documentation MUST include rollback or troubleshooting guidance for common deployment failures.
- **FR-015**: Deployment preparation MUST include validation commands for frontend linting, frontend tests, frontend production build, backend linting, and backend tests.
- **FR-016**: Deployment artifacts MUST preserve independent frontend and backend deployment paths so one service can be released without redeploying the other unless an intentional API contract change requires coordination.
- **FR-017**: The deployment feature MUST preserve current MVP boundaries: no database, authentication, CMS, admin panel, payment flow, queue, or persistent lead storage.
- **FR-018**: The deployment feature MUST NOT introduce real production secrets, private credentials, real project IDs, or other private environment values.
- **FR-019**: The deployment feature MUST avoid Terraform, Pulumi, or similar infrastructure automation unless a later plan explicitly documents why simple Cloud Build configuration, container definitions, scripts, and docs are insufficient.
- **FR-020**: Local development behavior MUST remain unchanged for both frontend and backend.
- **FR-021**: Backend production logs MUST avoid exposing submitted contact details, credentials, secret names with values, or other sensitive operational data.
- **FR-022**: Docker images and runtime commands MUST be production-oriented and MUST NOT depend on development servers for production serving.
- **FR-023**: Deployment documentation MUST default to the `europe-central2` GCP region while allowing the site owner to override the region.
- **FR-024**: The deployment feature MUST remain compatible with the existing Angular frontend and FastAPI backend structure.
- **FR-025**: The public visitor contact journey MUST work end to end after deployment using the deployed frontend and deployed backend.

### Constitution Constraints *(mandatory)*

- **Complexity Justification**: Production deployment infrastructure is required by Constitution Principle VIII. No database, authentication, CMS, queue, persistent lead storage, admin backend, payment flow, Terraform, or advanced infrastructure automation is justified for this feature.
- **API Contract Impact**: No new public API capability is required. Existing backend health and contact behavior must remain available, and any deployment-related configuration must not change the public contact API contract.
- **Security Impact**: Production secrets must come from environment variables or managed secret references; committed examples must use placeholders only. CORS must be restricted to approved production origins. Logs and documentation must avoid exposing private values.
- **Deployment Impact**: Both frontend and backend become independently deployable to Google Cloud Run with documented preflight checks, deployment commands, Cloud Build configuration, runtime configuration, and smoke tests.
- **Accessibility & Performance Impact**: Public frontend accessibility and performance requirements from the MVP remain release criteria. Production serving must avoid development servers and must support fast, reliable access to the existing Polish-first marketing experience.

### Key Entities *(include if feature involves data)*

- **Deployment Target**: A deployable production service for either frontend or backend, identified by service name, region, image, runtime configuration, public URL, and smoke-check expectations.
- **Runtime Configuration**: Environment-specific values required by a deployed service, including public backend URL, allowed origins, service port behavior, SMTP settings, and secret references.
- **Secret Reference**: A managed production secret identifier or environment binding that allows sensitive values to be used at runtime without storing those values in source control.
- **Cloud Build Deployment Configuration**: A repeatable build-and-deploy definition for one deployable service, parameterized by project, region, image, service name, and required runtime values.
- **Smoke Test**: A documented post-release verification step that confirms frontend availability, backend health, CORS behavior, and contact submission behavior.
- **Deployment Runbook**: Operator-facing documentation covering first deployment, validation, troubleshooting, rollback considerations, and known operational checks.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A site owner can follow the documented path from a clean GCP project to deployed frontend and backend services without needing undocumented setup steps.
- **SC-002**: Backend image build and local container verification complete successfully, and the backend health endpoint responds before production deployment.
- **SC-003**: Frontend image build and local container verification complete successfully, and the frontend serves the application with SPA fallback before production deployment.
- **SC-004**: Both backend and frontend Cloud Build deployment configurations are present, documented, and parameterized for project, region, service, image, and secret-specific values.
- **SC-005**: 100% of committed deployment commands, scripts, configuration examples, and documentation use placeholders or safe sample values instead of real credentials or private project-specific values.
- **SC-006**: A reviewer can confirm within 10 minutes that Secret Manager or equivalent managed secret usage is documented for SMTP password or equivalent sensitive production values.
- **SC-007**: A site owner can complete documented preflight checks for frontend and backend before deployment.
- **SC-008**: A site owner can complete documented production smoke tests covering frontend availability, backend health, CORS behavior, and contact API behavior after deployment.
- **SC-009**: A visitor can open the deployed public frontend and submit a valid contact inquiry through the deployed backend.
- **SC-010**: Existing frontend and backend test suites continue to pass after deployment artifacts are added.
- **SC-011**: The deployment feature adds no database, authentication, CMS, admin panel, payment, queue, or persistent lead storage behavior.
- **SC-012**: Local development startup and test commands continue to work without requiring production Cloud Run, GCP credentials, or real production secrets.

## Assumptions

- The completed MVP remains the functional baseline and this feature only adds production deployment capability.
- Google Cloud Run is the required production runtime for both frontend and backend in this feature.
- The default deployment region is `europe-central2`, with a documented override for other regions.
- The frontend can be served from a production static web container without introducing a separate CDN or load balancer in this feature.
- The backend contact API continues to send inquiries without adding persistent lead storage.
- SMTP password or equivalent sensitive values will be configured through a managed secret or runtime environment binding by the site owner.
- Cloud Build configuration is sufficient for first manual deployment and can later be reused by CI/CD.
- Terraform and custom domain automation are intentionally out of scope for this feature.
- Local development remains based on the existing frontend and backend commands and should not require production deployment setup.
