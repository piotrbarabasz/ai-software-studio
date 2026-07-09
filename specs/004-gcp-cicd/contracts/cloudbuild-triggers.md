# Contract: Cloud Build Triggers And Substitutions

This contract defines the build-time values and trigger behaviors required by the CI/CD feature.

## Shared Substitutions

| Name | Applies To | Notes |
|------|------------|-------|
| `_PROJECT_ID` | all deploy triggers | GCP project ID placeholder or operator-provided value |
| `_REGION` | all deploy triggers | Default `europe-central2`, override allowed |
| `_ARTIFACT_REPO` | all deploy triggers | Artifact Registry repository name |
| `_BACKEND_SERVICE` | production deploy | Backend Cloud Run service name |
| `_FRONTEND_SERVICE` | production deploy | Frontend Cloud Run service name |
| `_BACKEND_IMAGE_NAME` | production deploy | Backend container image name |
| `_FRONTEND_IMAGE_NAME` | production deploy | Frontend container image name |
| `_BACKEND_URL` | production deploy, frontend build | Backend Cloud Run URL used by frontend |
| `_FRONTEND_URL` | production deploy, backend CORS | Frontend Cloud Run URL used by backend CORS |
| `_SMTP_PASSWORD_SECRET` | production deploy | Secret Manager secret name, not value |
| `_CONTACT_RATE_LIMIT_PER_MINUTE` | production deploy | Default `30` |
| SMTP and contact email placeholders | production deploy | Non-sensitive placeholder values only |
| image tag substitution | all build paths | Must be non-empty even when `SHORT_SHA` is absent |

## Production Trigger: `deploy-prod`

**Event**: push  
**Branch regex**: `^main$`  
**Config file**: `infra/gcp/cloudbuild.deploy.yaml`

**Expected behavior**

- Builds and deploys backend first.
- Builds and deploys frontend second.
- Uses `SHORT_SHA` or an equivalent safe image tag value.
- Uses substitutions only for project-specific values.

## Temporary Test Trigger

**Event**: push  
**Branch regex**: `^002-gcp-deployment$`  
**Config file**: `infra/gcp/cloudbuild.deploy.yaml`

**Expected behavior**

- Used only for temporary trigger testing.
- Must be disabled or deleted after testing.
- Must never become the long-term production trigger.

## Pull Request Validation Trigger

**Event**: pull request  
**Base branch regex**: `^main$`  
**Config file**: `infra/gcp/cloudbuild.pr-checks.yaml`

**Expected behavior**

- Runs validation only.
- Does not deploy backend or frontend services.
- Uses no production URL or secret substitutions.

## Validation Rules

- Trigger documentation must distinguish temporary test usage from production usage.
- Production values must remain substitutions, not hard-coded source constants.
- Manual builds must have a safe image tag path if `SHORT_SHA` is unavailable.
- Secret values must never be committed.
