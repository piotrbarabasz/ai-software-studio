# GCP Deployment Assets

This directory contains the production deployment artifacts for AISoftware Studio.

## Files

- `cloudbuild.backend.yaml`: build, push, and deploy the FastAPI backend service
- `cloudbuild.frontend.yaml`: build, push, and deploy the Angular frontend service
- `cloudbuild.deploy.yaml`: combined sequential production deployment pipeline
- `cloudbuild.pr-checks.yaml`: non-deploying quality gates for backend and frontend
- `production-contract.json`: versioned non-secret production invariants and validation scopes
- `triggers.md`: exact trigger settings and operator notes
- `env.example`: non-secret template with fixed invariants and blank required operational values

## Notes

- Cloud Build YAML defaults are intentionally invalid; active triggers must provide resolved substitutions that pass `scripts/gcp/deployment_contract.py`.
- Do not commit real secrets, service account keys, or private project values.
- Contract v1 fixes the production region to `europe-central2`, both service/image names, the sole public origin, indexing `false`, and min instances `0`.
