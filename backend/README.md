# Backend

FastAPI contact intake API for the AISoftware Studio marketing website MVP.

## Setup

```bash
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.lock
.\.venv\Scripts\python.exe -m pip install --no-deps --no-build-isolation -e .
```

## Environment Variables

```text
APP_ENV=development
CORS_ALLOWED_ORIGINS=http://localhost:4200
CONTACT_DELIVERY_MODE=email
CONTACT_RECIPIENT_EMAIL=owner@example.com
CONTACT_FROM_EMAIL=noreply@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=example-user
SMTP_PASSWORD=example-password
SMTP_USE_TLS=true
CONTACT_RATE_LIMIT_PER_MINUTE=5
```

Secrets must come from local environment files ignored by git, shell environment variables, or a future managed secret store. Do not commit real SMTP credentials.

## Run

```bash
.\.venv\Scripts\uvicorn.exe app.main:app --reload --host 127.0.0.1 --port 8000
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```

`GET /health` reports backend application reachability only. It does not check SMTP or email provider readiness in the MVP.

## Scripts

```bash
.\scripts\lint.ps1
.\scripts\format.ps1
.\scripts\format.ps1 -Check
.\scripts\test.ps1
```

The scripts use `backend/.venv` when it exists and otherwise expect `ruff` or `pytest` on `PATH`.

## Dependency lock maintenance

`requirements.lock` contains the production dependency graph used by the Dockerfile. `requirements-dev.lock` contains the same graph plus test/lint tools. Regenerate both from `pyproject.toml` and `requirements-build.in`; do not hand-edit pins:

```powershell
py -3.12 -m pip install uv==0.11.26
cd backend
uv pip compile pyproject.toml requirements-build.in --universal --python-version 3.12 --output-file requirements.lock
uv pip compile pyproject.toml requirements-build.in --extra dev --universal --python-version 3.12 --output-file requirements-dev.lock
```

Keep uv's default index set to `https://pypi.org/simple` and clear machine-specific extra indexes while generating. Universal resolution is required: it retains the pinned Linux-only `uvloop` dependency with a platform marker while keeping local Windows installation valid.

Review the generated diff, reinstall from `requirements-dev.lock`, run all backend checks, rebuild the image from the repository root, and run the container smoke test before accepting an update.

## Contact Delivery

`POST /api/contact` validates the inquiry, applies a rate-limit-ready boundary, and sends an email notification to the configured owner address. The MVP does not persist inquiries in a database.

Failed email delivery returns a clear `503` response and logs a non-sensitive operational event without full message bodies, secrets, email addresses, contact payloads, or environment variables.
