# GCP Deployment Assets

This directory contains the production deployment artifacts for AISoftware Studio.

## Files

- `cloudbuild.backend.yaml`: build, push, and deploy the FastAPI backend service
- `cloudbuild.frontend.yaml`: build, push, and deploy the Angular frontend service
- `cloudbuild.pr-checks.yaml`: non-deploying quality gates for backend and frontend
- `env.example`: placeholder-only production configuration values

## Notes

- Use placeholders for project ID, region, service names, backend URL, frontend URL, and secret names.
- Do not commit real secrets, service account keys, or private project values.
- Region defaults to `europe-central2`, but scripts and docs should allow override.
- Cloud Run min instances default to `0` for the MVP cost posture.
