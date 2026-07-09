# Feature Specification: GitHub-to-GCP CI/CD Automation

**Feature Branch**: `004-gcp-cicd`

**Created**: 2026-07-09

**Status**: Draft

**Input**: User description: "Create a new Spec Kit feature for GitHub-to-GCP CI/CD automation. Push to main triggers automatic production deployment to Google Cloud Run. Pull requests to main trigger validation only. Cloud Build trigger setup is documented clearly enough for Google Cloud Console or Cloud Shell. No secrets are committed. Existing manual GCP deployment files remain valid."

## Clarifications

### Session 2026-07-09

- Q: Production branch? → A: Use `main` as the production deployment branch. Use `002-gcp-deployment` only for temporary trigger testing.
- Q: Trigger model? → A: Use Cloud Build triggers connected to the GitHub repository only. Do not add GitHub Actions.
- Q: Deployment pipeline? → A: Add one combined production pipeline file, `infra/gcp/cloudbuild.deploy.yaml`, that deploys backend and frontend sequentially in one Cloud Build execution.
- Q: PR validation? → A: Use existing `infra/gcp/cloudbuild.pr-checks.yaml` for pull request validation, and it must not deploy.
- Q: Manual deployment compatibility? → A: Keep `infra/gcp/cloudbuild.backend.yaml` and `infra/gcp/cloudbuild.frontend.yaml` valid for manual deployments.
- Q: Image tag behavior? → A: Triggered builds can use `SHORT_SHA`; manual builds must not fail with an empty image tag. Provide a safe default or explicit docs/scripts that pass `SHORT_SHA` manually.
- Q: Known production URLs? → A: Use substitutions, not hardcoded values, for `_BACKEND_URL` and `_FRONTEND_URL`. Docs may show the current example values.
- Q: Runtime config? → A: Use trigger substitutions for `_PROJECT_ID`, `_REGION`, `_ARTIFACT_REPO`, `_BACKEND_SERVICE`, `_FRONTEND_SERVICE`, `_BACKEND_IMAGE_NAME`, `_FRONTEND_IMAGE_NAME`, `_BACKEND_URL`, `_FRONTEND_URL`, `_SMTP_PASSWORD_SECRET`, `_CONTACT_RATE_LIMIT_PER_MINUTE`, and placeholder SMTP/contact email values.
- Q: Secrets? → A: Do not commit secret values. `SMTP_PASSWORD` must remain in Secret Manager.
- Q: IAM? → A: Document Cloud Build permissions for Cloud Run deployment and Artifact Registry push, plus Cloud Run runtime service account access to the SMTP secret.
- Q: Trigger creation? → A: Prefer Google Cloud Console instructions because GitHub connection usually requires interactive authorization. Optional `gcloud` or Cloud Shell scripts can come after the repository is already connected.
- Q: Scope? → A: No Terraform, no GitHub Actions, no database, no auth, no CMS, no admin panel, no queue, and no payment.

## Business Context *(mandatory)*

**Primary Business Outcome**: Trust building and lead generation by making production releases repeatable, safer, and less dependent on manual deployment commands.

**Target Visitor**: Polish-speaking potential client using the public AISoftware Studio website, plus the solo site owner/developer responsible for keeping the production site and contact API available.

**Conversion or Trust Signal**: A visitor can access the current production website and contact backend after changes are merged, while the site owner can prove that pull requests are validated before production deployment and production rollback remains documented.

**Localization Scope**: Public website content remains Polish-first. CI/CD documentation may be written in English for developer operations, and must preserve future English-ready public content structure by avoiding hard-coded production copy changes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deploy on Production Push (Priority: P1)

The site owner pushes or merges approved code to the production branch and the backend and frontend are automatically deployed to Google Cloud Run without manual build submission commands.

**Why this priority**: This is the primary outcome. Production releases must become repeatable and low-friction while keeping the existing Cloud Run deployment model.

**Independent Test**: Configure a production push trigger for the repository, push to the production branch, and confirm one production deployment pipeline completes with backend deployment before frontend deployment.

**Acceptance Scenarios**:

1. **Given** the production trigger is enabled and configured for `main`, **When** code is pushed or merged to `main`, **Then** the backend and frontend deploy to their configured Cloud Run services in one sequential production pipeline.
2. **Given** the backend deployment step succeeds, **When** the frontend image is built, **Then** it uses the configured production backend URL as the frontend API URL.
3. **Given** the production pipeline completes, **When** the site owner verifies production, **Then** the public frontend URL and backend health endpoint are reachable.
4. **Given** the production trigger is disabled, **When** code is pushed to `main`, **Then** no automatic production deployment starts.

---

### User Story 2 - Validate Pull Requests Without Deploying (Priority: P2)

The site owner opens a pull request targeting the production branch and receives validation results without deploying unmerged code to production.

**Why this priority**: Pull requests need confidence-building checks while preserving production safety.

**Independent Test**: Open or update a pull request targeting `main` and confirm the validation trigger runs checks only and does not update Cloud Run services.

**Acceptance Scenarios**:

1. **Given** a pull request targets `main`, **When** the pull request trigger runs, **Then** validation checks run without deploying backend or frontend services to production.
2. **Given** a pull request targets another branch, **When** trigger filters are evaluated, **Then** the production validation behavior is not incorrectly applied to unrelated branch workflows.
3. **Given** validation fails, **When** the site owner reviews the result, **Then** the failure is visible before merge and production remains unchanged.

---

### User Story 3 - Configure Cloud Build Triggers (Priority: P3)

The site owner follows repository documentation to connect GitHub to Cloud Build and configure production and pull request triggers with the required substitutions.

**Why this priority**: The feature must be usable by a solo developer without hidden console settings or tribal knowledge.

**Independent Test**: Starting from the documented prerequisites, a reviewer can create the triggers through Google Cloud Console or Cloud Shell using the documented names, branch filters, event types, configuration files, and substitutions.

**Acceptance Scenarios**:

1. **Given** the GitHub repository is connected to Cloud Build, **When** the site owner follows the trigger settings documentation, **Then** they can create a production push trigger for `main`.
2. **Given** the GitHub repository is connected to Cloud Build, **When** the site owner follows the trigger settings documentation, **Then** they can create a pull request validation trigger for pull requests to `main`.
3. **Given** environment-specific values differ between projects or services, **When** the site owner configures substitutions, **Then** project ID, region, artifact repository, service names, image names, backend URL, frontend URL, SMTP secret name, contact rate limit, and placeholder contact email values are supplied without editing source code.
4. **Given** the site owner wants to test safely before production, **When** they read the trigger documentation, **Then** the temporary test branch strategy and production `main` strategy are both clear.
5. **Given** the repository is not yet connected to Cloud Build, **When** the site owner follows the setup guide, **Then** the documentation makes clear which steps are interactive in the Google Cloud Console and which optional scripts can be used after connection.

---

### User Story 4 - Preserve Manual Deployment and Safe Configuration (Priority: P4)

The site owner keeps the existing manual deployment path while adding CI/CD automation that does not commit secrets or hard-code sensitive values.

**Why this priority**: CI/CD must improve operations without breaking the current deployment fallback or weakening repository security.

**Independent Test**: Inspect existing manual deployment documentation and configs after the CI/CD files are added, run manual build guidance with non-empty image tags, and search committed files for real credentials or private keys.

**Acceptance Scenarios**:

1. **Given** existing manual deployment files are present, **When** the CI/CD feature is added, **Then** backend, frontend, and pull request manual Cloud Build configs remain valid.
2. **Given** a manual build is run outside a source-triggered context, **When** image tags are resolved, **Then** the documented or configured behavior prevents empty Docker image tags.
3. **Given** production runtime values are required, **When** the site owner configures the deployment trigger, **Then** values are supplied through Cloud Build substitutions or managed runtime configuration without committing secrets.
4. **Given** the repository is reviewed, **When** committed CI/CD files are inspected, **Then** no service account keys, SMTP passwords, tokens, API keys, or equivalent secrets are present.

---

### User Story 5 - Roll Back After Failed Deployment (Priority: P5)

The site owner can manually roll back or disable automation when an automatic production deployment fails.

**Why this priority**: MVP automation needs a simple operational escape path before advanced release strategies are introduced.

**Independent Test**: Follow the rollback and disablement documentation to identify the previous service revision, restore it manually, and disable the production trigger quickly.

**Acceptance Scenarios**:

1. **Given** an automatic deployment fails or causes a production issue, **When** the site owner consults the CI/CD documentation, **Then** rollback steps identify how to restore a previous Cloud Run revision.
2. **Given** automation must be stopped quickly, **When** the site owner follows the trigger disablement instructions, **Then** the production trigger can be disabled without deleting repository code.
3. **Given** rollback is complete, **When** the site owner verifies production, **Then** frontend availability and backend health checks are included in the verification path.

### Edge Cases

- A pull request trigger accidentally matches push events and risks deploying unmerged changes.
- A production trigger is configured for a temporary test branch and must later be switched to `main`.
- Cloud Build runs without required permissions for Artifact Registry, Cloud Run deployment, or runtime service account usage.
- Runtime service accounts lack permissions required by the existing backend behavior.
- A required substitution is missing, malformed, or still set to a placeholder value.
- The production backend URL changes and the frontend must be rebuilt with the updated API URL.
- A source-triggered build provides commit metadata, while a manual build does not provide a non-empty short commit tag.
- Cloud Run deployment succeeds for the backend but fails for the frontend.
- Cloud Run min instances need to remain at 0 by default for MVP cost control.
- The GitHub repository is not yet connected to Cloud Build, making trigger creation partially manual.
- Automation must be disabled quickly during an incident.
- Existing deployment docs remain available and must not be contradicted by new CI/CD docs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a single production deployment Cloud Build configuration named `infra/gcp/cloudbuild.deploy.yaml` that deploys backend and frontend in one sequential pipeline.
- **FR-002**: The production deployment pipeline MUST build and publish the backend container image before deploying the backend Cloud Run service.
- **FR-003**: The production deployment pipeline MUST deploy the configured backend Cloud Run service before building the production frontend image.
- **FR-004**: The production deployment pipeline MUST build the frontend image using the configured production backend URL as the frontend API URL.
- **FR-005**: The production deployment pipeline MUST publish the frontend container image before deploying the configured frontend Cloud Run service.
- **FR-006**: The production deployment pipeline MUST deploy the configured frontend Cloud Run service after the backend deployment step has completed successfully.
- **FR-007**: CI/CD configuration MUST use Cloud Build substitutions for `_PROJECT_ID`, `_REGION`, `_ARTIFACT_REPO`, `_BACKEND_SERVICE`, `_FRONTEND_SERVICE`, `_BACKEND_IMAGE_NAME`, `_FRONTEND_IMAGE_NAME`, `_BACKEND_URL`, `_FRONTEND_URL`, `_SMTP_PASSWORD_SECRET`, `_CONTACT_RATE_LIMIT_PER_MINUTE`, and placeholder SMTP/contact email values, plus any other project/service/environment-specific values needed by the deployment.
- **FR-008**: CI/CD configuration MUST default production deployment to the `main` branch.
- **FR-009**: CI/CD configuration MUST support a production push trigger that deploys only for pushes to `main`.
- **FR-010**: CI/CD configuration MUST support a pull request validation trigger that runs checks for pull requests targeting `main` and does not deploy to production.
- **FR-011**: CI/CD documentation MUST explain how to connect the GitHub repository to Cloud Build, with Google Cloud Console as the primary path and optional Cloud Shell or script-based trigger creation only after repository connection is established.
- **FR-012**: CI/CD documentation MUST include exact trigger settings for the production push trigger, including event type, branch filter, configuration file, substitutions, and intended production branch.
- **FR-013**: CI/CD documentation MUST include exact trigger settings for the pull request validation trigger, including event type, branch target, validation configuration, and the no-deploy expectation.
- **FR-014**: CI/CD documentation MUST explain where Cloud Build substitutions are set and how production runtime values can be updated without editing source code.
- **FR-015**: CI/CD documentation MUST explain the difference between using a temporary testing branch and using `main` for production.
- **FR-016**: CI/CD documentation MUST explain how to disable a trigger quickly.
- **FR-017**: CI/CD documentation MUST explain required IAM permissions for Cloud Build and Cloud Run runtime service accounts.
- **FR-018**: CI/CD documentation MUST explain how to verify production deployment after a push, including frontend availability and backend health checks.
- **FR-019**: CI/CD documentation MUST include rollback instructions for manual recovery from a failed automatic deployment.
- **FR-020**: Repository documentation MUST link to the CI/CD documentation from the README.
- **FR-021**: Trigger settings MUST be documented in `infra/gcp/triggers.md`.
- **FR-022**: User-facing CI/CD setup documentation MUST be documented in `docs/gcp-cicd.md`.
- **FR-023**: Cloud Shell trigger creation support MUST be provided through `scripts/gcp/create-triggers.sh`, or the documentation MUST explain which trigger creation steps remain manual because repository connection requires interactive authorization.
- **FR-024**: Local PowerShell trigger creation support MUST be provided through `scripts/gcp/create-triggers.ps1`, or the documentation MUST explain which trigger creation steps remain manual because repository connection requires interactive authorization.
- **FR-025**: Existing manual deployment configurations and documentation MUST remain valid, including backend deployment, frontend deployment, pull request checks, deployment guide, runbook, and preflight scripts.
- **FR-026**: Manual build behavior MUST prevent empty Docker image tags when source-trigger metadata such as `SHORT_SHA` is unavailable, either by supplying a safe fallback tag or by documenting the exact manual value to pass.
- **FR-027**: CI/CD artifacts MUST NOT commit real secrets, service account keys, SMTP passwords, tokens, API keys, or equivalent private values.
- **FR-028**: Production deployment MUST use Cloud Run min instances 0 by default unless the site owner explicitly overrides it through documented configuration.
- **FR-029**: The CI/CD feature MUST NOT introduce Terraform, Pulumi, database, authentication, CMS, admin panel, payment, queue, or persistent lead storage.
- **FR-030**: Existing frontend and backend local development behavior MUST remain unchanged.
- **FR-031**: The CI/CD feature MUST use Cloud Build triggers and MUST NOT introduce GitHub Actions.

### Constitution Constraints *(mandatory)*

- **Complexity Justification**: CI/CD automation is required to make the existing GCP deployment repeatable and production-ready. No CMS, authentication, database, queue, persistent lead storage, admin panel, payment flow, Terraform, Pulumi, custom domain automation, blue/green deployment, canary deployment, or advanced monitoring dashboard is justified for this feature.
- **API Contract Impact**: No new public backend API capability is required. Existing backend health and contact behavior must remain available, and CI/CD configuration must not change the public contact API contract.
- **Security Impact**: No real secrets may be committed. Runtime and project-specific values must be provided through substitutions, environment variables, managed secret references, or service account bindings. Documentation must cover required IAM permissions and avoid exposing private values.
- **Deployment Impact**: Both frontend and backend remain independently deployable through existing manual paths, while production automation adds a sequential combined deployment path for pushes to `main` and a no-deploy validation path for pull requests to `main`.
- **Accessibility & Performance Impact**: Public frontend accessibility, mobile usability, and performance expectations from the MVP remain release criteria. CI/CD must preserve the existing Polish-first public experience and support verification after deployment.

### Key Entities *(include if feature involves data)*

- **Production Deployment Pipeline**: The repeatable release process that validates, builds, publishes, and deploys backend and frontend services to production in the required order.
- **Pull Request Validation Pipeline**: The no-deploy validation process that runs checks for pull requests targeting the production branch.
- **Cloud Build Trigger**: A repository-connected automation rule with an event type, branch or pull request filter, build configuration, substitutions, and enabled/disabled state.
- **Trigger Substitution**: A configurable value supplied to a trigger or build, such as project ID, region, service name, backend URL, image tag, min instances value, or service account.
- **Runtime Service Account**: The identity used by a deployed Cloud Run service at runtime, with permissions documented separately from build-time permissions.
- **Build Service Account**: The identity used by Cloud Build to build images, push artifacts, deploy Cloud Run services, and attach runtime service accounts where permitted.
- **Manual Deployment Fallback**: Existing documented deployment commands and Cloud Build configurations that remain usable if automation is disabled or unavailable.
- **Rollback Procedure**: Documented manual recovery steps for restoring a previous Cloud Run revision and verifying production after recovery.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A push or merge to `main` can trigger one production deployment pipeline that deploys both backend and frontend without the site owner running manual build submission commands.
- **SC-002**: A pull request targeting `main` can trigger validation checks with zero production Cloud Run deployments.
- **SC-003**: A reviewer can create or verify both required repository automation triggers from the documented settings in 30 minutes or less after the repository is connected to the build service.
- **SC-004**: 100% of project-specific deployment values needed by the production trigger are represented as documented substitutions or runtime configuration values, not source-code edits.
- **SC-005**: 100% of committed CI/CD configuration, scripts, and documentation contain no real secrets, private keys, SMTP passwords, tokens, or API keys.
- **SC-006**: A reviewer can identify the production branch, temporary testing branch guidance, trigger disablement steps, required substitutions, required IAM permissions, and verification steps from the CI/CD documentation in 15 minutes or less.
- **SC-007**: Existing manual backend, frontend, and pull request Cloud Build paths remain documented and usable after the CI/CD feature is added.
- **SC-008**: Manual build documentation or configuration prevents empty Docker image tags when source-trigger metadata is unavailable.
- **SC-009**: Production deployment verification covers public website availability, backend health, and the configured website-to-backend connection after every automatic deployment.
- **SC-010**: Rollback documentation enables the site owner to identify and restore a previous production revision without introducing advanced release infrastructure.
- **SC-011**: The CI/CD feature adds no database, authentication, CMS, admin panel, payment, queue, persistent lead storage, Terraform, Pulumi, custom domain automation, or advanced monitoring dashboard.
- **SC-012**: Production hosting defaults to zero always-on idle instances unless explicitly overridden by documented configuration.

## Assumptions

- The production branch is `main`; the current `002-gcp-deployment` branch is a temporary development or testing branch, not the long-term production trigger branch.
- The existing GCP project is `ai-software-studio-501918`, the default region is `europe-central2`, and the existing Artifact Registry repository is `aisoftware-studio`.
- The existing Cloud Run services are `aisoftware-studio-api` for the backend and `aisoftware-studio-web` for the frontend.
- The currently known backend URL is `https://aisoftware-studio-api-k6wldgptjq-lm.a.run.app` and the currently known frontend URL is `https://aisoftware-studio-web-k6wldgptjq-lm.a.run.app`; these are treated as configurable runtime/deployment values, not permanent source constants.
- The GitHub repository is `https://github.com/piotrbarabasz/ai-software-studio`.
- Cloud Build GitHub repository connection may require manual Google Cloud Console steps before scripted trigger creation can succeed.
- Existing manual deployment files remain the baseline fallback: `infra/gcp/cloudbuild.backend.yaml`, `infra/gcp/cloudbuild.frontend.yaml`, `infra/gcp/cloudbuild.pr-checks.yaml`, `docs/gcp-deployment.md`, `docs/gcp-runbook.md`, `scripts/gcp/deploy-backend.ps1`, `scripts/gcp/deploy-frontend.ps1`, and `scripts/gcp/preflight.ps1`.
- The feature automates deployment only; it does not change website content, contact API behavior, storage model, authentication, or production domain strategy.
- Documentation may show the current backend and frontend production URLs as examples, but the spec requires those values to remain substitutions rather than hardcoded deployment constants.
