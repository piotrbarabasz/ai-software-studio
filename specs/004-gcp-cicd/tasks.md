# Tasks: GitHub-to-GCP CI/CD Automation

**Input**: Design documents from `/specs/004-gcp-cicd/`

**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Include YAML sanity checks, existing preflight checks, and documentation verification tasks because the feature explicitly depends on safe deployment configuration, trigger behavior, and no-secrets compliance.

**Organization**: Tasks are grouped by the requested implementation phases so each phase can be implemented and verified independently.

---

## Phase 1: Audit Current Deployment

**Purpose**: Confirm the current Cloud Build, deployment docs, and production URLs so the new CI/CD work stays compatible with the existing manual deployment path.

**Independent Test**: The current deployment files and docs are reviewed, and the production service names/URLs are confirmed to be examples or documented runtime values only.

- [X] T001 Review `infra/gcp/cloudbuild.backend.yaml`, `infra/gcp/cloudbuild.frontend.yaml`, and `infra/gcp/cloudbuild.pr-checks.yaml` to record current build/deploy inputs, substitutions, and manual deployment behavior.
- [X] T002 Review `docs/gcp-deployment.md`, `docs/gcp-runbook.md`, and `README.md` to record where the current deployment path and Cloud Run URLs are documented.
- [X] T003 Confirm the documented production service names and URLs in `docs/gcp-deployment.md` and `docs/gcp-runbook.md` are examples or runtime values only, not fixed deployment constants.

---

## Phase 2: Combined Production Pipeline

**Purpose**: Add one combined production Cloud Build pipeline that deploys backend and frontend sequentially with substitutions, Secret Manager, min instances `0`, and no real secrets.

**Independent Test**: `infra/gcp/cloudbuild.deploy.yaml` exists, is readable as multi-line YAML, and performs backend build/push/deploy before frontend build/push/deploy with all environment-specific values supplied through substitutions.

- [X] T004 Create `infra/gcp/cloudbuild.deploy.yaml` with a sequential backend-then-frontend production pipeline using Cloud Build YAML.
- [X] T005 Wire backend build and push steps in `infra/gcp/cloudbuild.deploy.yaml` to `backend/Dockerfile` with Artifact Registry image references derived from substitutions.
- [X] T006 Wire backend deploy steps in `infra/gcp/cloudbuild.deploy.yaml` to Cloud Run with `_APP_ENV=production`, `_CORS_ALLOWED_ORIGINS=$_FRONTEND_URL`, `_CONTACT_DELIVERY_MODE=email`, `_CONTACT_RECIPIENT_EMAIL`, `_CONTACT_FROM_EMAIL`, `_SMTP_HOST`, `_SMTP_PORT`, `_SMTP_USERNAME`, `_SMTP_USE_TLS`, `_CONTACT_RATE_LIMIT_PER_MINUTE`, `SMTP_PASSWORD` from Secret Manager, `min instances = 0`, and unauthenticated access.
- [X] T007 Wire frontend build and push steps in `infra/gcp/cloudbuild.deploy.yaml` to `frontend/Dockerfile` with `API_URL=$_BACKEND_URL` and Artifact Registry image references derived from substitutions.
- [X] T008 Wire frontend deploy steps in `infra/gcp/cloudbuild.deploy.yaml` to Cloud Run with `min instances = 0` and unauthenticated access.
- [X] T009 Define all production substitutions in `infra/gcp/cloudbuild.deploy.yaml` for `_PROJECT_ID`, `_REGION`, `_ARTIFACT_REPO`, `_BACKEND_SERVICE`, `_FRONTEND_SERVICE`, `_BACKEND_IMAGE_NAME`, `_FRONTEND_IMAGE_NAME`, `_BACKEND_URL`, `_FRONTEND_URL`, `_SMTP_PASSWORD_SECRET`, `_CONTACT_RATE_LIMIT_PER_MINUTE`, and placeholder SMTP/contact email values.
- [X] T010 Verify `infra/gcp/cloudbuild.deploy.yaml` contains no real secrets, service account keys, or hard-coded production URLs.

---

## Phase 3: Manual Build Image Tag Hardening

**Purpose**: Prevent empty image tags when `SHORT_SHA` is unavailable for manual `gcloud builds submit` runs.

**Independent Test**: Manual backend and frontend build paths produce a non-empty image tag without relying on trigger-only metadata.

- [X] T011 Update `infra/gcp/cloudbuild.backend.yaml` so manual builds do not fail when `SHORT_SHA` is unavailable, using a safe fallback tag or documented substitution path.
- [X] T012 Update `infra/gcp/cloudbuild.frontend.yaml` so manual builds do not fail when `SHORT_SHA` is unavailable, using a safe fallback tag or documented substitution path.
- [X] T013 Update `scripts/gcp/deploy-backend.ps1` to pass a safe image tag or documented fallback value when invoking `gcloud builds submit` for manual backend deployments.
- [X] T014 Update `scripts/gcp/deploy-frontend.ps1` to pass a safe image tag or documented fallback value when invoking `gcloud builds submit` for manual frontend deployments.
- [X] T015 Update `docs/gcp-deployment.md` to document the manual image-tag fallback behavior and explain how to supply a non-empty tag when `SHORT_SHA` is not available.

---

## Phase 4: Trigger Documentation

**Purpose**: Document the GitHub repository connection, exact Cloud Build trigger settings, substitutions, IAM requirements, verification, and rollback steps.

**Independent Test**: A reviewer can follow `docs/gcp-cicd.md` and `infra/gcp/triggers.md` to understand the production trigger, temporary test trigger, PR validation trigger, required substitutions, required IAM, verification flow, and rollback path.

- [X] T016 Create `docs/gcp-cicd.md` as the user-facing guide for GitHub-to-GCP CI/CD setup and operations.
- [X] T017 Create `infra/gcp/triggers.md` with exact Cloud Build trigger settings, substitutions, and operator notes.
- [X] T018 Document the one-time GitHub repository connection to Cloud Build in `docs/gcp-cicd.md`, using Google Cloud Console as the primary path.
- [X] T019 Document the production push trigger in `docs/gcp-cicd.md` and `infra/gcp/triggers.md` with `deploy-prod`, push event, `^main$`, and `infra/gcp/cloudbuild.deploy.yaml`.
- [X] T020 Document the temporary test trigger in `docs/gcp-cicd.md` and `infra/gcp/triggers.md` with `^002-gcp-deployment$` and explicit disable/delete guidance after testing.
- [X] T021 Document the PR validation trigger in `docs/gcp-cicd.md` and `infra/gcp/triggers.md` with pull request event, `^main$` base branch, and `infra/gcp/cloudbuild.pr-checks.yaml` with no deploy.
- [X] T022 Document the required substitutions in `docs/gcp-cicd.md` and `infra/gcp/triggers.md`, including project, region, service names, URLs, secret name, rate limit, and placeholder SMTP/contact email values.
- [X] T023 Document required IAM permissions in `docs/gcp-cicd.md` and `infra/gcp/triggers.md` for the Cloud Build service account and runtime Cloud Run service account.
- [X] T024 Document deployment verification and rollback steps in `docs/gcp-cicd.md` and `infra/gcp/triggers.md`, including Cloud Build logs, Cloud Run URLs, trigger disablement, and revision rollback.

---

## Phase 5: Trigger Helper Scripts

**Purpose**: Add optional helper scripts that create trigger definitions only after the GitHub repository is already connected to Cloud Build.

**Independent Test**: Both scripts fail clearly when repository connection is missing and otherwise accept parameters for project, region, repo, branch, URLs, and secret name without storing credentials.

- [X] T025 Create `scripts/gcp/create-triggers.sh` as an optional Cloud Shell helper for trigger creation after GitHub-to-Cloud-Build connection exists.
- [X] T026 Create `scripts/gcp/create-triggers.ps1` as an optional local PowerShell helper for trigger creation after GitHub-to-Cloud-Build connection exists.
- [X] T027 [P] Add parameter handling in `scripts/gcp/create-triggers.sh` for `ProjectId`, `Region`, `RepoName`, `Branch`, URLs, and `SmtpPasswordSecret`, and fail with helpful instructions when repository connection is missing.
- [X] T028 [P] Add parameter handling in `scripts/gcp/create-triggers.ps1` for `ProjectId`, `Region`, `RepoName`, `Branch`, URLs, and `SmtpPasswordSecret`, and fail with helpful instructions when repository connection is missing.
- [X] T029 Verify `scripts/gcp/create-triggers.sh` and `scripts/gcp/create-triggers.ps1` do not store or echo credentials, service account keys, or secret values.

---

## Phase 6: README And Runbook Updates

**Purpose**: Point repository users to the CI/CD docs and keep deployment/runbook guidance aligned with triggered deployment troubleshooting.

**Independent Test**: `README.md`, `docs/gcp-runbook.md`, and `docs/gcp-deployment.md` point to the CI/CD docs and explain triggered deployment troubleshooting without contradicting the existing manual path.

- [X] T030 Update `README.md` with links to `docs/gcp-cicd.md`, `docs/gcp-deployment.md`, and `docs/gcp-runbook.md`.
- [X] T031 Update `docs/gcp-runbook.md` with triggered deployment troubleshooting, including Cloud Build logs, trigger disablement, rollback, and Cloud Run URL verification.
- [X] T032 Update `docs/gcp-deployment.md` to point readers to `docs/gcp-cicd.md` for trigger-based deployment setup while preserving the manual deployment path.

---

## Phase 7: Validation

**Purpose**: Validate YAML, preflight behavior, no-secrets compliance, branch usage, trigger behavior, and the combined production pipeline.

**Independent Test**: The final artifact set can be inspected and validated against the spec without introducing secrets, GitHub Actions, Terraform, database, auth, CMS, admin, payment, queue, or persistent storage.

- [X] T033 Validate `infra/gcp/cloudbuild.deploy.yaml`, `infra/gcp/cloudbuild.backend.yaml`, `infra/gcp/cloudbuild.frontend.yaml`, `infra/gcp/cloudbuild.pr-checks.yaml`, `infra/gcp/triggers.md`, `docs/gcp-cicd.md`, `scripts/gcp/create-triggers.sh`, and `scripts/gcp/create-triggers.ps1` for YAML/syntax sanity and readable formatting where applicable.
- [ ] T034 Run `scripts/gcp/preflight.ps1` and confirm the existing backend and frontend quality gates still pass in the current environment.
- [X] T035 Search `infra/gcp/`, `docs/`, `scripts/gcp/`, and `README.md` to confirm no real secrets, service account keys, SMTP passwords, tokens, or API keys were added.
- [X] T036 Confirm `docs/gcp-cicd.md` and `infra/gcp/triggers.md` describe `main` as the production branch and `002-gcp-deployment` as temporary test-only.
- [X] T037 Confirm `docs/gcp-cicd.md` and `infra/gcp/triggers.md` state that the PR validation trigger uses `infra/gcp/cloudbuild.pr-checks.yaml` and does not deploy.
- [X] T038 Confirm `docs/gcp-cicd.md` and `infra/gcp/triggers.md` state that the production push trigger deploys through `infra/gcp/cloudbuild.deploy.yaml`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: Can start immediately.
- **Phase 2**: Depends on Phase 1 being complete enough to confirm existing paths and values.
- **Phase 3**: Depends on Phase 2 because image-tag hardening must align with the deployment YAML and manual flow.
- **Phase 4**: Depends on Phases 2 and 3 because trigger docs must describe the actual production pipeline and safe manual behavior.
- **Phase 5**: Depends on Phase 4 because helper scripts must match the documented trigger settings.
- **Phase 6**: Depends on Phases 4 and 5 because repository-facing docs should match the trigger docs and helper scripts.
- **Phase 7**: Depends on all prior phases.

### Task Dependencies

- `T004` depends on `T001`-`T003`.
- `T005`-`T010` can proceed in parallel after `T004` starts, but `T006` and `T008` should follow the branch/service values confirmed in `T009`.
- `T011`-`T015` should follow `T004` so manual tag behavior is aligned with the pipeline structure.
- `T016`-`T024` should follow `T004` and `T009` so docs reflect the actual trigger values and deployment contract.
- `T025`-`T029` should follow `T016`-`T024` because the scripts mirror the documented trigger settings.
- `T030`-`T032` should follow `T016`-`T029` so README and runbook links do not drift.
- `T033`-`T038` should run last.

### Parallel Opportunities

- `T002` and `T003` can run in parallel.
- `T005`, `T006`, `T007`, `T008`, and `T009` can run in parallel once `T004` exists because they touch different sections of `infra/gcp/cloudbuild.deploy.yaml`.
- `T011` and `T012` can run in parallel because they touch different manual build files.
- `T013` and `T014` can run in parallel because they touch different PowerShell scripts.
- `T018`-`T024` can run in parallel because they touch different documentation sections and files.
- `T027` and `T028` can run in parallel because they touch different trigger helper scripts.
- `T030`-`T032` can run in parallel because they touch different docs files.

## Implementation Strategy

### MVP First

1. Finish Phase 1 audit.
2. Build Phase 2 combined production pipeline.
3. Harden manual build tags in Phase 3.
4. Validate the production path with Phase 7 checks as soon as the main pipeline is in place.

### Incremental Delivery

1. Audit existing deployment files and docs.
2. Add the combined production pipeline.
3. Fix manual build tag safety.
4. Add trigger docs.
5. Add optional helper scripts.
6. Update README and runbook links.
7. Validate the final artifact set.

### Suggested MVP Scope

Start with Phase 2 plus the minimum Phase 3 updates required to keep manual builds safe. That delivers the core business value: automatic production deployment on `main` with a safe manual fallback.

## Notes

- All tasks use exact file paths.
- `[P]` marks only tasks that can run in parallel because they touch different files and have no direct dependency on an unfinished task.
- No task introduces Terraform, GitHub Actions, database, auth, CMS, admin panel, payment, queue, or persistent storage.
