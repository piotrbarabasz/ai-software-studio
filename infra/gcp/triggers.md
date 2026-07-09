# Cloud Build Triggers

This file records the exact trigger settings for the GitHub-connected Cloud Build deployment.

## Repository Connection

Connect the GitHub repository in Google Cloud Console before creating triggers.
The repository connection is a one-time interactive setup.

## Production Trigger

- Name: `deploy-prod`
- Event: push
- Branch regex: `^main$`
- Config file: `infra/gcp/cloudbuild.deploy.yaml`
- Purpose: production deployment to Cloud Run

Use these substitutions:

- `_PROJECT_ID=ai-software-studio-501918`
- `_REGION=europe-central2`
- `_ARTIFACT_REPO=aisoftware-studio`
- `_BACKEND_SERVICE=aisoftware-studio-api`
- `_FRONTEND_SERVICE=aisoftware-studio-web`
- `_BACKEND_IMAGE_NAME=aisoftware-studio-api`
- `_FRONTEND_IMAGE_NAME=aisoftware-studio-web`
- `_BACKEND_URL=https://aisoftware-studio-api-k6wldgptjq-lm.a.run.app`
- `_FRONTEND_URL=https://aisoftware-studio-web-k6wldgptjq-lm.a.run.app`
- `_SMTP_PASSWORD_SECRET=aisoftware-studio-smtp-password`
- `_CONTACT_RATE_LIMIT_PER_MINUTE=30`
- `_CONTACT_RECIPIENT_EMAIL=<placeholder>`
- `_CONTACT_FROM_EMAIL=<placeholder>`
- `_SMTP_HOST=<placeholder>`
- `_SMTP_PORT=<placeholder>`
- `_SMTP_USERNAME=<placeholder>`
- `_SMTP_USE_TLS=<placeholder>`
- `_CONTACT_DELIVERY_MODE=email`
- `_APP_ENV=production`
- `_MIN_INSTANCES=0`
- `_IMAGE_TAG=$SHORT_SHA`

## Temporary Test Trigger

- Name: `deploy-test-002-gcp-deployment`
- Event: push
- Branch regex: `^002-gcp-deployment$`
- Config file: `infra/gcp/cloudbuild.deploy.yaml`
- Purpose: verify trigger wiring before production use

Delete or disable this trigger after testing.

## PR Validation Trigger

- Name: `pr-checks-main`
- Event: pull request
- Base branch regex: `^main$`
- Config file: `infra/gcp/cloudbuild.pr-checks.yaml`
- Purpose: validation only

This trigger must not deploy.

## Manual Build Compatibility

The manual Cloud Build files remain valid:

- `infra/gcp/cloudbuild.backend.yaml`
- `infra/gcp/cloudbuild.frontend.yaml`

Both files use `_IMAGE_TAG` with a safe default value so manual `gcloud builds submit` runs do not rely on `SHORT_SHA`.

## Required IAM

Cloud Build service account:

- Cloud Run Admin
- Artifact Registry Writer
- Service Account User

Runtime Cloud Run service account:

- Secret Manager Secret Accessor on `aisoftware-studio-smtp-password`

## Operator Notes

- Use Cloud Build logs to verify the trigger fired and the deploy steps ran in order.
- Use the Cloud Run URLs to verify the deployed services.
- Disable or delete triggers when they are no longer needed.
- Roll back by redeploying the previous known-good revision or image tag.
