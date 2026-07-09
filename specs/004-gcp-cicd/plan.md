# Implementation Plan: GitHub-to-GCP CI/CD Automation

**Branch**: `004-gcp-cicd` | **Date**: 2026-07-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-gcp-cicd/spec.md`

## Summary

Add GitHub-to-GCP CI/CD automation for the existing Cloud Run deployment. The plan introduces one combined production Cloud Build pipeline for sequential backend-then-frontend deployment on pushes to `main`, a no-deploy pull request validation trigger targeting `main`, trigger documentation for Google Cloud Console and optional post-connection scripts, and a safe manual build tag strategy so source-triggered `SHORT_SHA` builds and manual builds both work.

The implementation keeps existing manual deployment configs valid, keeps secrets in Secret Manager, uses Cloud Build substitutions for all project-specific values, defaults Cloud Run min instances to `0`, and does not introduce GitHub Actions, Terraform, Pulumi, databases, authentication, CMS, admin panels, queues, or payment flows.

## Technical Context

**Language/Version**: YAML for Cloud Build and trigger configuration, Markdown for operator docs, PowerShell for Windows scripts, Bash for Cloud Shell scripts, TypeScript for the Angular frontend, Python 3.12+ for the FastAPI backend.

**Primary Dependencies**: Existing Angular/npm frontend stack, existing FastAPI/Pydantic backend stack, Cloud Build, Cloud Run, Artifact Registry, Secret Manager, `gcloud`, PowerShell, Bash, and the existing Nginx-based frontend container.

**Storage**: No new application storage. Artifact Registry stores built images and Secret Manager stores `SMTP_PASSWORD`; neither introduces lead persistence or business data storage.

**Testing**: YAML syntax sanity checks, existing backend and frontend preflight checks, Cloud Build manual submission validation, and documented trigger verification through logs and Cloud Run URLs.

**Target Platform**: Google Cloud Run and Cloud Build in `europe-central2` with repository-connected GitHub triggers.

**Project Type**: Marketing website with separate Angular frontend and FastAPI backend plus deployment automation and operator documentation.

**Performance Goals**: Production deploys must remain sequential and deterministic, Cloud Run min instances stay at `0` by default, and the validation path must avoid production deployment entirely.

**Constraints**: `main` is the production branch, `002-gcp-deployment` is only a temporary trigger test branch, no GitHub Actions, no real secrets in repo, no hard-coded production URLs in source, `SHORT_SHA` must not break manual builds, and manual deployment configs must remain valid.

**Scale/Scope**: One combined production deployment pipeline, one PR validation pipeline, one temporary test trigger, two optional trigger-creation scripts, and documentation updates for release and rollback operations.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Business value**: PASS. The feature makes releases repeatable and safer, which supports trust building and lead generation through a stable public site.
- **MVP simplicity**: PASS. The plan adds only deployment automation and documentation, while keeping all excluded platform complexity out of scope.
- **Architecture separation**: PASS. Frontend and backend remain separate services with distinct build and deploy paths, and the combined pipeline preserves that boundary.
- **API contract**: PASS. No new public application API is added. Existing backend health and contact behavior remain the public contract used for verification.
- **UX and localization**: PASS. Public Polish-first content is unaffected; deployment docs are operational and do not alter public-facing UX.
- **Security**: PASS. Secrets remain in Secret Manager, substitutions carry non-sensitive runtime values, and documentation calls out required IAM permissions.
- **Developer readiness**: PASS. The plan names the files, scripts, trigger settings, manual fallback behavior, and validation flow needed for implementation.

**Post-design re-check**: PASS. The design artifacts preserve manual deployment compatibility, keep `SHORT_SHA` safe for manual runs, and leave no unresolved scope or security questions.

## Project Structure

### Documentation (this feature)

```text
specs/004-gcp-cicd/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- deployment-interfaces.md
|   `-- cloudbuild-triggers.md
`-- checklists/
    `-- requirements.md
```

### Source Code (repository root)

```text
infra/gcp/
|-- cloudbuild.backend.yaml
|-- cloudbuild.frontend.yaml
|-- cloudbuild.pr-checks.yaml
|-- cloudbuild.deploy.yaml
|-- triggers.md
|-- env.example
`-- README.md

docs/
|-- gcp-deployment.md
|-- gcp-runbook.md
`-- gcp-cicd.md

scripts/gcp/
|-- preflight.ps1
|-- deploy-backend.ps1
|-- deploy-frontend.ps1
|-- create-triggers.sh
`-- create-triggers.ps1

README.md
```

**Structure Decision**: Keep the existing separated `frontend/` and `backend/` applications untouched. Add the combined production pipeline and trigger documentation under `infra/gcp/`, user-facing CI/CD guidance under `docs/`, and optional trigger helpers under `scripts/gcp/`. Update the existing deployment docs and helper scripts only where required to preserve manual deployment compatibility and safe manual image tags.

## Files To Add

- `infra/gcp/cloudbuild.deploy.yaml`: Combined sequential production deployment pipeline for backend then frontend.
- `infra/gcp/triggers.md`: Exact trigger settings, substitutions, and operational notes for Cloud Build repository triggers.
- `docs/gcp-cicd.md`: User-facing CI/CD setup guide covering repository connection, trigger creation, verification, and rollback.
- `scripts/gcp/create-triggers.sh`: Optional Cloud Shell trigger helper, usable only after GitHub is already connected to Cloud Build.
- `scripts/gcp/create-triggers.ps1`: Optional local PowerShell trigger helper, usable only after Cloud Build auth and repository connection are already in place.
- `specs/004-gcp-cicd/research.md`: Phase 0 research decisions and tradeoff notes.
- `specs/004-gcp-cicd/data-model.md`: Deployment configuration entities and validation rules.
- `specs/004-gcp-cicd/quickstart.md`: Validation guide for the eventual implementation.
- `specs/004-gcp-cicd/contracts/deployment-interfaces.md`: Deployment and script interface contract.
- `specs/004-gcp-cicd/contracts/cloudbuild-triggers.md`: Trigger and substitution contract.

## Files To Update

- `infra/gcp/cloudbuild.backend.yaml`: Only if needed to make manual image tags safe when `SHORT_SHA` is absent.
- `infra/gcp/cloudbuild.frontend.yaml`: Only if needed to make manual image tags safe when `SHORT_SHA` is absent.
- `scripts/gcp/deploy-backend.ps1`: Only if needed to pass a safe image tag or related fallback explicitly for manual builds.
- `scripts/gcp/deploy-frontend.ps1`: Only if needed to pass a safe image tag or related fallback explicitly for manual builds.
- `docs/gcp-deployment.md`: Add links and context for CI/CD without breaking the existing manual deployment guide.
- `docs/gcp-runbook.md`: Add rollback and trigger-disable notes for CI/CD operations.
- `README.md`: Link to the new CI/CD documentation.

## Summary of Design Decisions

- Use Cloud Build triggers connected to the GitHub repository, not GitHub Actions.
- Make `main` the production deployment branch and treat `002-gcp-deployment` only as a temporary trigger test branch.
- Use one combined production pipeline file so backend deployment completes before frontend deployment begins.
- Keep the PR validation path on `infra/gcp/cloudbuild.pr-checks.yaml` and ensure it never deploys.
- Use substitutions for all project, service, region, runtime, secret-name, and URL values.
- Make manual builds safe by using a user-controlled fallback tag when `SHORT_SHA` is not available.
- Prefer Google Cloud Console instructions for connecting GitHub because that step is interactive; optional scripts come after connection exists.

## Testing Strategy

- Validate `infra/gcp/cloudbuild.deploy.yaml`, `infra/gcp/cloudbuild.backend.yaml`, `infra/gcp/cloudbuild.frontend.yaml`, and trigger/script docs for YAML and substitution consistency.
- Verify the combined production pipeline performs backend build/push/deploy before frontend build/push/deploy.
- Verify the PR validation trigger points at `infra/gcp/cloudbuild.pr-checks.yaml` and does not deploy.
- Verify manual build docs or script defaults prevent empty image tags when `SHORT_SHA` is unavailable.
- Verify documentation still preserves existing manual deployment paths and the existing preflight script.

## Complexity Tracking

No constitution violations. The feature adds only build/deploy automation, trigger docs, and helper scripts required to make the existing Cloud Run deployment repeatable and safer.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
