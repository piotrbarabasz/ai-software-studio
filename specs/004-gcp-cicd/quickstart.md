# Quickstart: GitHub-to-GCP CI/CD Validation

This guide validates the eventual implementation of the CI/CD feature. It is operator-focused and uses placeholders only.

## Prerequisites

- Access to the repository and the `specs/004-gcp-cicd` plan artifacts.
- Google Cloud CLI installed and authenticated.
- Cloud Build GitHub repository connection already created in the Google Cloud Console.
- Required GCP APIs enabled for Cloud Build, Cloud Run, Artifact Registry, Secret Manager, and IAM.
- No real secrets committed to the repository.

## 1. Run Local Preflight

```powershell
.\scripts\gcp\preflight.ps1
```

Expected result: existing backend and frontend quality gates pass before deployment is attempted.

## 2. Verify The Combined Production Pipeline File Exists

Confirm that `infra/gcp/cloudbuild.deploy.yaml` is present and readable as multi-line YAML.

Expected result: the file defines backend build, backend deploy, frontend build, and frontend deploy steps in that order.

## 3. Create Or Verify The Triggers

Use the documented settings in `infra/gcp/triggers.md` or `docs/gcp-cicd.md` to confirm:

- `deploy-prod` uses push events on `^main$`.
- The temporary test trigger uses `^002-gcp-deployment$`.
- The PR validation trigger uses pull request events and targets `^main$`.

Expected result: production deploy and validation triggers are distinct and use the correct config files.

## 4. Validate Manual Build Tag Safety

Run the manual deployment helper scripts with explicit parameters and a safe fallback tag strategy.

Expected result: manual builds do not fail when `SHORT_SHA` is unavailable and do not produce empty image tags.

## 5. Verify Triggered Deployment Evidence

After a test push to the temporary trigger branch or `main` in a non-production window:

- Check Cloud Build logs for backend then frontend execution order.
- Confirm backend and frontend Cloud Run URLs are updated.
- Confirm the frontend uses the configured backend URL.
- Confirm the backend accepts the frontend origin in CORS.

Expected result: one sequential production deployment path is visible in the build logs.

## 6. Verify PR Validation

Open a pull request targeting `main` and confirm the PR validation trigger runs checks only.

Expected result: backend and frontend are validated, and no Cloud Run deployment occurs.

## 7. Verify Rollback And Disablement

Use the runbook and trigger docs to:

- Disable the production trigger.
- Restore a previous Cloud Run revision.
- Verify the frontend URL and backend health endpoint again.

Expected result: rollback and trigger shutdown can be performed without changing source code.
