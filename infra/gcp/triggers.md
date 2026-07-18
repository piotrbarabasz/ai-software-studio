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
- `_BACKEND_URL=https://<BACKEND_CLOUD_RUN_URL>`
- `_PUBLIC_SITE_URL=https://protolume.pl`
- `_PUBLIC_SITE_INDEXING=false`
- `_PUBLIC_LEGAL_CONFIG_SECRET=aisoftware-studio-public-legal-config`
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

- Name: `pr-checks-master`
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

Cloud Build service account also needs Secret Manager Secret Accessor on `_PUBLIC_LEGAL_CONFIG_SECRET` for the frontend build configuration. A binding on the frontend Cloud Run runtime account is not a substitute because the legal page is prerendered during the build.

## Operator Notes

- Use Cloud Build logs to verify the trigger fired and the deploy steps ran in order.
- Keep `https://protolume.pl` as the only public production origin. The `www` and `.com` variants only redirect and must not be added to CORS.
- Keep indexing disabled until the explicit final migration stage. Verify `noindex, follow` in both HTML and `X-Robots-Tag`.
- Use `https://protolume.pl` to verify the frontend, canonical URL, sitemap and robots; use the backend URL for health checks.
- Disable or delete triggers when they are no longer needed.
- Roll back by redeploying the previous known-good revision or image tag.
