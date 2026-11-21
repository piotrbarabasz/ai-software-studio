# Google Cloud — Protolume

Projekt: `ai-software-studio-501918`, region: `europe-central2`.

| Plik | Rola |
| --- | --- |
| `cloudbuild.deploy.yaml` | `deploy-prod`: statyczna strona V3 -> Cloud Run, indexable, 100% ruchu po smoke obrazu |
| `cloudbuild.landing-cloudrun-preview.yaml` | ręczny tagged preview `v3-review`, 0% ruchu i noindex |
| `cloudbuild.pr-checks.yaml` | PR: backend FastAPI i statyczny frontend v3 |
| `cloudbuild.backend.yaml` | manualna budowa/smoke/push obrazu API, bez automatycznej zmiany ruchu |
| `cloudbuild.backend-ci.yaml` | automatyczny build/test/smoke/push obrazu API po zmianach backendu, bez wdrożenia Cloud Run |
| `component-triggers.json` | zakresy ścieżek i kontrakt triggerów frontend/backend |
| `production-contract.json` | kontrakt środowiska produkcyjnego dla FastAPI i narzędzi GCP |

Frontend i backend są osobnymi serwisami: `aisoftware-studio-web` oraz `aisoftware-studio-api`. Trasa formularza `POST /api/contact/brief` jest proxowana przez frontend. Konfiguracja SMTP i Google Secret Manager znajdują się wyłącznie przy API.

Po aktywacji filtrów (patrz `triggers.md`), `deploy-prod` reaguje tylko na zmianę landing/shared, a `backend-ci` tylko na backend/shared. Oba buildy mogą działać równolegle. **Backend-ci nie wdraża Cloud Run**: kontrola wersji API i SMTP pozostaje osobnym, świadomym release. Sam PR nie zmienia istniejących triggerów GCP.

Rollback frontendu: Cloud Run -> `aisoftware-studio-web` -> Manage traffic -> poprzednia sprawdzona rewizja 100%. Nie usuwać starych rewizji ani obrazów dopóki V3 nie zostanie zaakceptowane.

Historia migracji Angular / Firebase pozostaje w Git, a nie w aktywnym katalogu źródeł.
