# Protolume development and release rules

- Supported frontend: static `landing/` (HTML/CSS/JS + Nginx), **not Angular/Firebase**.
- Supported backend: `backend/` FastAPI with `POST /api/contact/brief` and SMTP Secret Manager.
- Preserve `landing/scripts/validate-public-legal-config.cjs`, the real legal-config secret and all security headers. Never commit passwords, legal source files, or actual user submissions.
- Preview `landing/nginx.cloudrun.conf` must have `noindex`; production `landing/nginx.production.conf` must NOT send `noindex` and must have 301 redirects.
- Production releases: `infra/gcp/cloudbuild.deploy.yaml` on master, testing production artifact/image before promoting traffic; keep `v3-review` tagged at zero traffic.
- Do not use `deploy-prod` for backend updates. Backend release is independent and requires explicit authorization.
- Run Node tests (`node --test landing/*.test.mjs scripts/*.test.mjs`), Python backend lint/format/pytest, YAML config tests, and Docker/HTTP smoke before merging.
- Maintain a valid rollback path in Cloud Run revisions and keep non-production previews isolated.
