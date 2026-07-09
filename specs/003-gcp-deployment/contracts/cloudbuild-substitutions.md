# Contract: Cloud Build Substitutions

All Cloud Build YAML files must use placeholders/substitutions and must not commit real project IDs, secrets, tokens, or service account key paths.

## Shared Substitutions

| Name | Applies To | Default/Example | Notes |
|------|------------|-----------------|-------|
| `_PROJECT_ID` | backend, frontend | `<PROJECT_ID>` | Operator-provided project placeholder or mapped from Cloud Build project context; must not be hard-coded |
| `_REGION` | backend, frontend | `europe-central2` | Must be overrideable |
| `_ARTIFACT_REPO` | backend, frontend | `aisoftware-studio` | Artifact Registry repository name |
| `_MIN_INSTANCES` | backend, frontend | `0` | MVP cost default |

## Backend Deploy Substitutions

| Name | Required | Example | Notes |
|------|----------|---------|-------|
| `_SERVICE_NAME` | Yes | `aisoftware-studio-api` | Backend Cloud Run service |
| `_IMAGE_NAME` | Yes | `aisoftware-studio-api` | Backend container image name |
| `_APP_ENV` | Yes | `production` | Production only for this feature |
| `_CORS_ALLOWED_ORIGINS` | Yes | `https://aisoftware-studio-web-...run.app` | Must not be `*` |
| `_CONTACT_DELIVERY_MODE` | Yes | `email` | Existing backend setting |
| `_CONTACT_RECIPIENT_EMAIL` | Yes | `owner@example.com` | Safe placeholder only |
| `_CONTACT_FROM_EMAIL` | Yes | `noreply@example.com` | Safe placeholder only |
| `_SMTP_HOST` | Yes | `smtp.example.com` | Safe placeholder only |
| `_SMTP_PORT` | Yes | `587` | Non-sensitive |
| `_SMTP_USERNAME` | Yes | `smtp-user@example.com` | Safe placeholder only |
| `_SMTP_USE_TLS` | Yes | `true` | Non-sensitive |
| `_CONTACT_RATE_LIMIT_PER_MINUTE` | Yes | `5` | Existing rate-limit setting |
| `_SMTP_PASSWORD_SECRET` | Yes | `aisoftware-studio-smtp-password` | Secret Manager secret name, not value |

## Frontend Deploy Substitutions

| Name | Required | Example | Notes |
|------|----------|---------|-------|
| `_SERVICE_NAME` | Yes | `aisoftware-studio-web` | Frontend Cloud Run service |
| `_IMAGE_NAME` | Yes | `aisoftware-studio-web` | Frontend container image name |
| `_API_URL` | Yes | `https://aisoftware-studio-api-...run.app` | Build/deployment-time backend URL |

## PR Checks Substitutions

PR checks should not require production URLs or secrets and must not deploy. Optional substitutions may tune image names or cache settings, but the workflow must run local quality gates only.

## Validation Rules

- `_CORS_ALLOWED_ORIGINS` must never be `*` in production examples or defaults.
- `_API_URL` examples must be placeholders or generated service URLs, never a private hard-coded production URL.
- Secret names may be shown; secret values must not.
- Project IDs are provided through `_PROJECT_ID`, Cloud Build project context, or script parameters; committed YAML must not hard-code a real project ID.
