# Protolume

Publiczna, polskojęzyczna strona Protolume — studio wdrożeń AI i automatyzacji, prowadzone przez Piotra Barabasza.

## Repository Structure

```text
frontend/   Angular single-page marketing website
backend/    FastAPI contact intake API
docs/       Local development and deployment notes
infra/      Future infrastructure notes only
specs/      Spec Kit artifacts and API contract
```

## Local Development

Run the frontend and backend independently.

```bash
cd backend
py -3.12 -m pip install -r requirements-dev.lock
py -3.12 -m pip install --no-deps --no-build-isolation -e .
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

```bash
cd frontend
npm ci
npm start
```

The Angular dev server uses `http://localhost:4200`; the backend API uses `http://127.0.0.1:8000`.

## Quality Commands

Frontend:

```bash
cd frontend
npm run lint
npm run format
npm test
npm run build
```

Backend:

```bash
cd backend
.\scripts\lint.ps1
.\scripts\format.ps1 -Check
.\scripts\test.ps1
```

No database, authentication, CMS, admin panel, payments, blog, queue, or production GCP resources are part of this MVP.

## Production Deployment

Production deployment to Google Cloud Platform is documented separately:

- [docs/gcp-cicd.md](docs/gcp-cicd.md)
- [docs/gcp-deployment.md](docs/gcp-deployment.md)
- [docs/gcp-runbook.md](docs/gcp-runbook.md)
- [infra/gcp/README.md](infra/gcp/README.md)

Run the local deployment preflight first:

```powershell
.\scripts\gcp\preflight.ps1 `
  -PublicLegalConfigPath "C:\bezpieczna-lokalizacja\public-legal.json" `
  -ApiUrl $env:BACKEND_URL `
  -PublicSiteUrl "https://protolume.pl" `
  -EnableIndexing $false
```
