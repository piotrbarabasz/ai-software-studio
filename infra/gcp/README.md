# GCP Deployment Assets

This directory contains the production deployment artifacts for Protolume.

## Files

- `cloudbuild.backend.yaml`: manual build, container smoke, and push of one backend image; never deploys
- `cloudbuild.frontend.yaml`: manual production build and push of one frontend image; never deploys
- `cloudbuild.deploy.yaml`: combined sequential production deployment pipeline
- `cloudbuild.pr-checks.yaml`: non-deploying, noindex quality gates for backend and frontend
- `production-contract.json`: versioned non-secret production invariants and validation scopes
- `triggers.md`: exact trigger settings and operator notes
- `env.example`: non-secret template with fixed invariants and blank required operational values

## Notes

- Production defaults are the non-secret contract invariants; only real SMTP/e-mail environment values remain trigger inputs. Manual component YAMLs use parse-safe sentinels that deliberately fail `scripts/gcp/deployment_contract.py`.
- `cloudbuild.deploy.yaml` is the only configuration allowed to deploy Cloud Run. Both component images are built and pushed before its first deploy step.
- Do not commit real secrets, service account keys, or private project values.
- Contract v1 fixes the production project, deployment region `europe-central2`, service/image names, backend URL, sole public origin, indexing `false`, secret reference names, delivery settings and min instances `0`.
