# Google Cloud — Protolume

Projekt: `ai-software-studio-501918`, region: `europe-central2`.

| Plik | Rola |
| --- | --- |
| `cloudbuild.deploy.yaml` | `deploy-prod`: statyczna strona V3 -> Cloud Run, indexable, 100% ruchu po smoke obrazu |
| `cloudbuild.landing-cloudrun-preview.yaml` | ręczny tagged preview `v3-review`, 0% ruchu i noindex |
| `cloudbuild.pr-checks.yaml` | PR: backend FastAPI i statyczny frontend v3 |
| `cloudbuild.backend.yaml` | manualna budowa/smoke/push obrazu API, bez automatycznej zmiany ruchu |
| `production-contract.json` | kontrakt środowiska produkcyjnego dla FastAPI i narzędzi GCP |

Frontend i backend są osobnymi serwisami: `aisoftware-studio-web` oraz `aisoftware-studio-api`. Trasa formularza `POST /api/contact/brief` jest proxowana przez frontend. Konfiguracja SMTP i Google Secret Manager znajdują się wyłącznie przy API.

Po mergu zmian frontendowych `deploy-prod` wdraża nowy obraz statyczny. Backend jest niezależny i **nie jest wdrażany automatycznie** przez ten trigger. Wdrożenia API należy wykonywać świadomie przez osobny pipeline, gdy wymagają tego zmiany backendu.

Rollback frontendu: Cloud Run -> `aisoftware-studio-web` -> Manage traffic -> poprzednia sprawdzona rewizja 100%. Nie usuwać starych rewizji ani obrazów dopóki V3 nie zostanie zaakceptowane.

Historia migracji Angular / Firebase pozostaje w Git, a nie w aktywnym katalogu źródeł.
