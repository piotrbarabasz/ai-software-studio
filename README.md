# AISoftware Studio

Professional Polish-first marketing website MVP for a solo software development and AI automation service brand.

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
py -3.12 -m pip install -e ".[dev]"
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

```bash
cd frontend
npm install
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
.\scripts\gcp\preflight.ps1
```

## Autonomous Loop

`tools/studio_loop` to lokalny Python controller dla jednej izolowanej funkcji naraz. Codex roles nie sterują stanem ani Git writes; `tasks.json` przyszłej funkcji jest źródłem prawdy, a jej `tasks.md` generowanym widokiem. Tryb `local` ma przetestowany przepływ z lokalnymi commitami w repozytorium tymczasowym. Usługi push/Draft PR/checks mają testy izolowane, lecz nie są jeszcze skomponowane w CLI, więc release pozostaje zablokowany przed prawdziwym smoke testem. Merge i deployment nie istnieją jako możliwości controllera.

- [Architektura](docs/autonomous-loop-architecture.md)
- [Runbook](docs/autonomous-loop-runbook.md)
- [Troubleshooting](docs/autonomous-loop-troubleshooting.md)
- [Quickstart i wymagania pierwszego smoke testu](specs/007-autonomous-loop/quickstart.md)
- [Dedykowany workflow CI](.github/workflows/autonomous-loop-ci.yml)
