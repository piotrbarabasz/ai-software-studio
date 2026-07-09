# Tasks: GCP Deployment for AISoftware Studio MVP

**Input**: Design documents from `/specs/003-gcp-deployment/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Validation tasks are included before or next to implementation tasks where useful. No new frontend/backend behavior tests are required unless implementation changes runtime configuration behavior beyond deployment packaging.

**Organization**: Tasks are grouped by required deployment phase and mapped to user stories for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because the task touches different files and has no dependency on another incomplete task
- **[Story]**: Maps task to the user story served by the task
- Every task includes an exact file path

## Phase 1: Setup And Repo Audit (Shared Infrastructure)

**Purpose**: Confirm current repo behavior and prepare deployment directories without adding implementation risk.

- [x] T001 Audit backend package metadata and startup target in `backend/pyproject.toml` and `backend/app/main.py`
- [x] T002 [P] Audit backend configuration names and CORS behavior in `backend/app/core/config.py` and `backend/app/core/cors.py`
- [x] T003 [P] Audit frontend production environment handling in `frontend/src/environments/environment.prod.ts` and `frontend/src/app/app.config.ts`
- [x] T004 [P] Audit current frontend build output path in `frontend/angular.json`
- [x] T005 Create GCP infrastructure directory `infra/gcp/`
- [x] T006 Create deployment script directory `scripts/gcp/`
- [x] T007 Checkpoint: record audit conclusions and any required behavior-change tests in `specs/003-gcp-deployment/tasks.md`

**Checkpoint**: Repo audit complete; deployment files can be added without changing local development assumptions.

---

## Phase 2: Backend Cloud Run Containerization (User Story 1 - P1)

**Goal**: Package the existing FastAPI backend as a production Cloud Run container for `aisoftware-studio-api`.

**Independent Test**: Build the backend image, run it locally with placeholder-safe env vars and `PORT=8080`, then request `/health` successfully.

### Validation Before/Alongside Backend Implementation

- [x] T008 [P] [US1] Add backend Docker context exclusions in `backend/.dockerignore`
- [x] T009 [US1] If backend `PORT` startup requires code support, add focused tests in `backend/tests/unit/test_settings.py`
- [x] T010 [US1] If production CORS parsing changes, add or update tests in `backend/tests/integration/test_cors.py`

### Backend Container Implementation

- [x] T011 [US1] Add production backend container definition in `backend/Dockerfile`
- [x] T012 [US1] Ensure `backend/Dockerfile` installs the package from `backend/pyproject.toml` without copying `.env`, caches, or local virtual environments
- [x] T013 [US1] Ensure `backend/Dockerfile` starts `uvicorn app.main:app --host 0.0.0.0 --port ${PORT}` or an equivalent shell-safe `PORT` command
- [x] T014 [US1] Ensure `backend/Dockerfile` uses a non-root runtime user where practical
- [x] T015 [US1] Update backend README container notes only if needed in `backend/README.md`
- [x] T016 [US1] Run backend quality command `cd backend && ruff check . && ruff format --check . && pytest` for `backend/`
- [ ] T017 [US1] Run backend Docker build command for `backend/Dockerfile`
- [ ] T018 [US1] Run backend local container smoke test and document `/health` result in `specs/003-gcp-deployment/tasks.md`

**Checkpoint**: Backend container can be built and smoke-tested locally without real secrets.

---

## Phase 3: Frontend Cloud Run Containerization (User Story 2 - P2)

**Goal**: Package the existing Angular frontend as an Nginx static Cloud Run container for `aisoftware-studio-web`.

**Independent Test**: Build the frontend image with a placeholder/local API URL, run it locally on port 8080, request `/`, and request a direct Angular route that falls back to `index.html`.

### Validation Before/Alongside Frontend Implementation

- [x] T019 [P] [US2] Add frontend Docker context exclusions in `frontend/.dockerignore`
- [x] T020 [US2] If production API URL behavior changes, add or update API config tests in `frontend/src/app/services/contact-api.service.spec.ts`
- [x] T021 [US2] If production API URL behavior changes, add or update environment tests in `frontend/src/app/app.config.spec.ts`

### Frontend Container Implementation

- [x] T022 [US2] Add Nginx static serving configuration with SPA fallback in `frontend/nginx.conf`
- [x] T023 [US2] Add production multi-stage frontend container definition in `frontend/Dockerfile`
- [x] T024 [US2] Ensure `frontend/Dockerfile` runs `npm ci` and `npm run build` in the Node build stage
- [x] T025 [US2] Ensure `frontend/Dockerfile` serves built Angular browser assets with Nginx on port `8080`
- [x] T026 [US2] Ensure `frontend/Dockerfile` accepts configurable API URL input without hard-coding a real production URL
- [x] T027 [US2] Update `frontend/src/environments/environment.prod.ts` only if required for safe build-time API URL configuration
- [x] T028 [US2] Run frontend quality command `cd frontend && npm run lint && npm run format:check && npm test && npm run build` for `frontend/`
- [ ] T029 [US2] Run frontend Docker build command for `frontend/Dockerfile`
- [ ] T030 [US2] Run frontend local container smoke test for `/` and a direct route, then document the result in `specs/003-gcp-deployment/tasks.md`

**Checkpoint**: Frontend container can be built and smoke-tested locally without `ng serve`.

---

## Phase 4: GCP Configuration And Cloud Build (User Stories 3 and 4 - P3/P4)

**Goal**: Provide placeholder-safe GCP configuration and repeatable Cloud Build definitions for production deployment.

**Independent Test**: Inspect Cloud Build YAML and env examples to confirm placeholders/substitutions, no real private values, Secret Manager usage, min instances `0`, and separate frontend/backend deployment paths.

### GCP Configuration Tasks

- [x] T031 [P] [US3] Add safe production configuration placeholders in `infra/gcp/env.example`
- [x] T032 [US3] Ensure `infra/gcp/env.example` includes `APP_ENV`, `CORS_ALLOWED_ORIGINS`, `CONTACT_DELIVERY_MODE`, `CONTACT_RECIPIENT_EMAIL`, `CONTACT_FROM_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_USE_TLS`, `CONTACT_RATE_LIMIT_PER_MINUTE`, and `SMTP_PASSWORD` as a Secret Manager reference only
- [x] T033 [P] [US4] Add backend Cloud Build deployment config in `infra/gcp/cloudbuild.backend.yaml`
- [x] T034 [P] [US4] Add frontend Cloud Build deployment config in `infra/gcp/cloudbuild.frontend.yaml`
- [x] T035 [P] [US4] Add non-deploying quality-gate Cloud Build config in `infra/gcp/cloudbuild.pr-checks.yaml`
- [x] T036 [US4] Ensure `infra/gcp/cloudbuild.backend.yaml` builds, pushes, and deploys `aisoftware-studio-api` with `_PROJECT_ID`, `_REGION`, Artifact Registry substitutions, Cloud Run min instances `0`, restricted CORS substitution, non-sensitive env vars, and Secret Manager binding for `SMTP_PASSWORD`
- [x] T037 [US4] Ensure `infra/gcp/cloudbuild.frontend.yaml` builds with configurable API URL, pushes, and deploys `aisoftware-studio-web` with `_PROJECT_ID`, `_REGION`, Artifact Registry substitutions, and Cloud Run min instances `0`
- [x] T038 [US4] Ensure `infra/gcp/cloudbuild.pr-checks.yaml` runs backend Ruff/pytest and frontend lint/format/test/build without deploying
- [x] T039 [US3] Review `infra/gcp/cloudbuild.backend.yaml`, `infra/gcp/cloudbuild.frontend.yaml`, `infra/gcp/cloudbuild.pr-checks.yaml`, and `infra/gcp/env.example` for real project IDs, tokens, private credentials, service account JSON key paths, and wildcard production CORS
- [x] T040 [US4] Checkpoint: document Cloud Build substitution coverage against `specs/003-gcp-deployment/contracts/cloudbuild-substitutions.md`

**Checkpoint**: GCP config files are placeholder-safe and define repeatable backend/frontend Cloud Build flows.

---

## Phase 5: PowerShell Deployment Helpers (User Stories 3 and 4 - P3/P4)

**Goal**: Provide safe local helper scripts for preflight checks and Cloud Build submission.

**Independent Test**: Run script help/parameter validation locally and confirm scripts fail fast with helpful messages when required parameters or tools are missing.

### Script Implementation Tasks

- [x] T041 [P] [US4] Add local validation wrapper in `scripts/gcp/preflight.ps1`
- [x] T042 [P] [US4] Add backend Cloud Build submit wrapper in `scripts/gcp/deploy-backend.ps1`
- [x] T043 [P] [US4] Add frontend Cloud Build submit wrapper in `scripts/gcp/deploy-frontend.ps1`
- [x] T044 [US4] Ensure `scripts/gcp/preflight.ps1` runs backend `ruff check .`, `ruff format --check .`, `pytest`, frontend `npm run lint`, `npm run format:check`, `npm test`, and `npm run build`
- [x] T045 [US3] Ensure `scripts/gcp/deploy-backend.ps1` accepts `ProjectId`, `Region`, `ArtifactRepo`, `ServiceName`, `FrontendUrl`, and secret/env substitution parameters without printing secret values
- [x] T046 [US3] Ensure `scripts/gcp/deploy-frontend.ps1` accepts `ProjectId`, `Region`, `ArtifactRepo`, `ServiceName`, and `ApiUrl` without hard-coding private URLs
- [x] T047 [US4] Ensure `scripts/gcp/preflight.ps1`, `scripts/gcp/deploy-backend.ps1`, and `scripts/gcp/deploy-frontend.ps1` default `Region` to `europe-central2`, use service defaults `aisoftware-studio-api` and `aisoftware-studio-web` where relevant, and print actionable next steps for missing `gcloud`, auth, APIs, repository, or secret references
- [x] T048 [US4] Run syntax/parameter validation for `scripts/gcp/preflight.ps1`, `scripts/gcp/deploy-backend.ps1`, and `scripts/gcp/deploy-frontend.ps1`

**Checkpoint**: Helper scripts are parameterized, fail fast, and do not expose secrets.

---

## Phase 6: Documentation And Runbook (User Stories 3, 4, and 5 - P3/P4/P5)

**Goal**: Provide first-deployment documentation, GCP file map, operational smoke tests, rollback, and troubleshooting guidance.

**Independent Test**: A reviewer can follow docs from a clean GCP project using placeholders and can identify all required smoke tests and rollback steps.

### Documentation Tasks

- [x] T049 [P] [US3] Add GCP infrastructure overview and file map in `infra/gcp/README.md`
- [x] T050 [P] [US3] Update infrastructure root notes and no-Terraform/no-secret boundaries in `infra/README.md`
- [x] T051 [P] [US3] Add deployment guide skeleton and prerequisites in `docs/gcp-deployment.md`
- [x] T052 [US3] Add required GCP APIs, `gcloud` auth, Artifact Registry creation, and Secret Manager secret creation steps in `docs/gcp-deployment.md`
- [x] T053 [US3] Add backend deployment, frontend deployment, and CORS update order steps in `docs/gcp-deployment.md`
- [x] T054 [US4] Add Cloud Build trigger setup, custom domain manual notes, and cost notes with min instances `0` in `docs/gcp-deployment.md`
- [x] T055 [P] [US5] Add runbook skeleton and release checklist in `docs/gcp-runbook.md`
- [x] T056 [US5] Add frontend URL, backend `/health`, CORS, and contact API smoke tests in `docs/gcp-runbook.md`
- [x] T057 [US5] Add rollback, Cloud Run logs, common failures, secret rotation, CORS troubleshooting, and contact form troubleshooting in `docs/gcp-runbook.md`
- [x] T058 [US3] Review `docs/gcp-deployment.md`, `docs/gcp-runbook.md`, `infra/gcp/README.md`, and `infra/README.md` for real project IDs, SMTP credentials, tokens, service account JSON keys, and private values

**Checkpoint**: Deployment and operation docs are sufficient for first manual deployment and post-release verification.

---

## Phase 7: README Updates (Cross-Cutting)

**Purpose**: Make production deployment discoverable from the repository entry point while preserving current local development guidance.

- [x] T059 Update repository deployment section in `README.md` with links to `docs/gcp-deployment.md`, `docs/gcp-runbook.md`, `infra/gcp/README.md`, and `scripts/gcp/preflight.ps1`
- [x] T060 Ensure `README.md` keeps existing local development commands unchanged for `backend/` and `frontend/`
- [x] T061 Ensure `README.md` states that this feature adds no database, authentication, CMS, admin panel, payment, queue, persistent lead storage, real secrets, Terraform, Pulumi, or GitHub Actions

**Checkpoint**: Repository README points operators to deployment docs without changing local development workflow.

---

## Phase 8: Validation And Smoke-Test Checklist (Final Verification)

**Purpose**: Run final local validations and document deployment smoke-test readiness.

- [x] T062 Run backend validation command `cd backend && ruff check . && ruff format --check . && pytest` for `backend/`
- [x] T063 Run frontend validation command `cd frontend && npm run lint && npm run format:check && npm test && npm run build` for `frontend/`
- [ ] T064 Run backend Docker image build for `backend/Dockerfile`
- [ ] T065 Run backend container from `backend/Dockerfile` with placeholder-safe env vars and request `/health`
- [ ] T066 Run frontend Docker image build for `frontend/Dockerfile`
- [ ] T067 Run frontend container from `frontend/Dockerfile` and request `/` plus a direct Angular route
- [x] T068 Review changed files under `backend/`, `frontend/`, `infra/gcp/`, `scripts/gcp/`, `docs/`, and `README.md` for committed secrets, service account JSON keys, real project IDs, tokens, private SMTP credentials, and wildcard production CORS
- [x] T069 Validate deployment checklist coverage in `specs/003-gcp-deployment/checklists/deployment.md`
- [x] T070 Record final validation outcomes and any commands not run in `specs/003-gcp-deployment/tasks.md` (Docker build/run smoke tests were not run here because Docker is unavailable in this environment; run T064-T067 locally.)

**Checkpoint**: Feature is ready for `/speckit-analyze` and implementation review.

---

## Phase 9: Convergence

**Purpose**: Capture the remaining Docker-capable verification work that could not be completed in this environment.

- [ ] T071 Run the backend Docker build and `/health` container smoke test in a Docker-capable environment per `T017-T018` (missing)
- [ ] T072 Run the frontend Docker build and SPA fallback container smoke test in a Docker-capable environment per `T029-T030` and `T064-T067` (missing)

**Checkpoint**: Remaining verification work is explicitly tracked for completion outside this environment.

---
## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup and Repo Audit**: No dependencies; starts immediately.
- **Phase 2 Backend Containerization**: Depends on backend audit tasks T001-T002.
- **Phase 3 Frontend Containerization**: Depends on frontend audit tasks T003-T004.
- **Phase 4 GCP Configuration and Cloud Build**: Depends on Phase 2 and Phase 3 file/interface decisions.
- **Phase 5 PowerShell Deployment Helpers**: Depends on Phase 4 Cloud Build file names and substitutions.
- **Phase 6 Documentation and Runbook**: Can start after Phase 4 draft substitutions exist; final pass depends on Phase 5 script parameters.
- **Phase 7 README Updates**: Depends on Phase 6 documentation paths.
- **Phase 8 Final Verification**: Depends on all implementation/documentation phases.

### User Story Dependencies

- **US1 Deploy Backend Contact API (P1)**: Can start after backend audit; no dependency on frontend implementation.
- **US2 Deploy Frontend Website (P2)**: Can start after frontend audit; no dependency on backend implementation except final API URL examples.
- **US3 Configure Production Safely (P3)**: Depends on knowing backend/frontend runtime configuration; can proceed in parallel with Cloud Build docs once containers are defined.
- **US4 Run Repeatable Deployment and Preflight Checks (P4)**: Depends on container file paths and validation commands.
- **US5 Verify Public Visitor Contact Flow (P5)**: Depends on backend/frontend deployment docs and smoke-test scripts/docs.

### Parallel Opportunities

- T002, T003, and T004 can run in parallel after T001 begins because they inspect different files.
- T008 can run in parallel with T009-T010 because it touches `backend/.dockerignore` while tests touch `backend/tests/`.
- T019 can run in parallel with T020-T021 because it touches `frontend/.dockerignore` while tests touch `frontend/src/app/`.
- T031, T033, T034, and T035 can run in parallel because they create different files under `infra/gcp/`.
- T041, T042, and T043 can run in parallel because they create different files under `scripts/gcp/`.
- T049, T051, and T052 can run in parallel because they create different documentation files.

---

## Parallel Example: User Story 1

```text
Task: "T008 [P] [US1] Add backend Docker context exclusions in backend/.dockerignore"
Task: "T009 [US1] If backend PORT startup requires code support, add focused tests in backend/tests/unit/test_settings.py"
Task: "T010 [US1] If production CORS parsing changes, add or update tests in backend/tests/integration/test_cors.py"
```

## Parallel Example: User Story 2

```text
Task: "T019 [P] [US2] Add frontend Docker context exclusions in frontend/.dockerignore"
Task: "T020 [US2] If production API URL behavior changes, add or update API config tests in frontend/src/app/services/contact-api.service.spec.ts"
Task: "T021 [US2] If production API URL behavior changes, add or update environment tests in frontend/src/app/app.config.spec.ts"
```

## Parallel Example: User Stories 3 and 4

```text
Task: "T031 [P] [US3] Add safe production configuration placeholders in infra/gcp/env.example"
Task: "T033 [P] [US4] Add backend Cloud Build deployment config in infra/gcp/cloudbuild.backend.yaml"
Task: "T034 [P] [US4] Add frontend Cloud Build deployment config in infra/gcp/cloudbuild.frontend.yaml"
Task: "T035 [P] [US4] Add non-deploying quality-gate Cloud Build config in infra/gcp/cloudbuild.pr-checks.yaml"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup and backend audit tasks T001-T002.
2. Complete Phase 2 tasks T008-T018.
3. Stop and validate backend image build plus `/health` smoke test.
4. Continue only after backend container behavior is stable and secret-free.

### Incremental Delivery

1. Add backend Cloud Run containerization (US1).
2. Add frontend Cloud Run containerization (US2).
3. Add safe configuration and Cloud Build substitutions (US3/US4).
4. Add scripts and documentation for first deployment and smoke tests (US4/US5).
5. Finish README and final verification.

### AI Agent Safety Notes

- Do not commit real GCP project IDs, SMTP credentials, service account JSON keys, access tokens, private API URLs, or real secret values.
- Use placeholders and examples only in docs, scripts, YAML, and env files.
- Do not add Terraform, Pulumi, GitHub Actions, database, authentication, CMS, admin panel, payment, queue, or persistent lead storage.
- Preserve existing local development commands and application behavior unless a task explicitly requires a small compatibility change.
- Mark a task complete only after its file-specific change and relevant validation are done.



