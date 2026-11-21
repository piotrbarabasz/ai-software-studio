# Aktywne i ręczne workflow Cloud Build

Projekt: `ai-software-studio-501918`; Cloud Run region `europe-central2`.

- `deploy-prod` — trigger zmian `master`, konfiguracja `infra/gcp/cloudbuild.deploy.yaml`, buduje i publikuje statyczny landing V3 do istniejącego `aisoftware-studio-web`. Zmiany ruchu następują dopiero po image smoke i weryfikacji Ready + SHA.
- `pr-checks` — waliduje wspierany landing V3 oraz FastAPI, bez publikacji.
- `protolume-v3-preview-manual` — ręczny test `infra/gcp/cloudbuild.landing-cloudrun-preview.yaml`, 0% domeny, tag `v3-review`, noindex.
- `infra/gcp/cloudbuild.backend.yaml` — osobny manualny build obrazu FastAPI, bez automatycznego deploymentu. Dla zmian API przygotować osobny świadomy release.

Zweryfikuj w konsoli GCP, czy trigger `deploy-prod` nadal wskazuje właściwy plik i branch. Sam merge GitHub nie dowodzi wykonania Cloud Build.

Historyczny identyfikator triggera `deploy-prod`: `901333cb-1c13-4929-90e5-6df070eb647e` (lokalizacja `global`; potwierdź przed użyciem).

Przełączenie produkcji może zmienić tylko nową rewizję `aisoftware-studio-web`; **nie usuwa** backendu i jego sekretów. Rollback przez Cloud Run -> Manage traffic -> poprzednia rewizja.
