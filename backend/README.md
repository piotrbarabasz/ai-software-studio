# Backend

FastAPI contact intake API for the AISoftware Studio marketing website MVP.

## Setup

```bash
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -e ".[dev]"
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

## Contact Delivery

`POST /api/contact` validates the inquiry, applies a rate-limit-ready boundary, and sends an email notification to the configured owner address. The MVP does not persist inquiries in a database.

Failed email delivery returns a clear `503` response and logs a non-sensitive operational event without full message bodies, secrets, email addresses, contact payloads, or environment variables.

