# Deployment Notes

Full GCP deployment is intentionally outside this MVP feature.

The implementation keeps the future deployment path clear:

- `frontend/` builds independently as static assets and can later be hosted on a static hosting target or containerized.
- `backend/` runs independently as an ASGI app and is shaped for a future Cloud Run service.
- Runtime configuration is environment-based.
- CORS origins are configured independently from frontend code.
- No production secrets, Cloud Build pipeline, Terraform, database, queue, or GCP resources are created in this feature.

## Explicit MVP Exclusions

This implementation does not add:

- database or persistent contact storage
- authentication or user accounts
- CMS or admin panel
- payment flow
- blog engine
- queue or background worker
- Cloud Build configuration
- Terraform or production GCP resources

## Future GCP Direction

Recommended future deployment split:

- Frontend: static hosting or containerized Angular build artifact.
- Backend: Cloud Run-ready FastAPI container with `/health` as the application reachability check.
- Secrets: SMTP credentials from Secret Manager or equivalent managed secret source.
- CORS: exact production frontend origin configured through `CORS_ALLOWED_ORIGINS`.
- Readiness: add a separate readiness endpoint later if email-provider checks become operationally required.
