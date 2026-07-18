# Deployment change rules

- Backend validation: `cd backend && python -m pip install -r requirements-dev.lock && python -m pip install --no-deps --no-build-isolation -e . && python -m ruff check . && python -m ruff format --check . && python -m pytest`.
- Deployment validation: `python -m unittest discover -s infra/gcp/tests -p "test_deployment*.py"` and, after installing the backend dev lock, `python -m unittest discover -s infra/gcp/tests -p "test_cloudbuild_yaml.py"`.
- Frontend validation: `cd frontend && npm ci && npm run lint && npm run format:check && npm test`; the production Docker build is also required for deployment changes.
- Build the backend from the repository root: `docker build -f backend/Dockerfile -t aisoftware-studio-api:local .`. Backend or environment changes are not done until `scripts/gcp/smoke-backend-image.sh aisoftware-studio-api:local` passes with the production non-secret variables and its explicit test SMTP password.
- Adding or changing an environment variable requires updating `Settings`, `infra/gcp/production-contract.json`, every applicable Cloud Build file, validator tests, smoke inputs, and deployment documentation.
- Never put secret values, unresolved placeholders, localhost, or example domains in production configuration. Keep secrets as Secret Manager reference names only.
- Do not finish deployment-affecting work without backend lint/format/tests, frontend lint/tests/build, contract CLI tests, Cloud Build YAML validation, backend Docker build, real container `/health` smoke, and syntax checks for changed scripts.
- Deployment work is done only when both images build before the first deploy, the resolved production contract passes, `PUBLIC_SITE_INDEXING=false`, CORS is exactly the contract origin, and the final diff contains no secrets or weakened gates.
