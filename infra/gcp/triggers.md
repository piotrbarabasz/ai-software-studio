# Cloud Build — niezależne ścieżki Protolume V3

Projekt: `ai-software-studio-501918`; triggery Cloud Build w `global`, Cloud Run w `europe-central2`.

## Zasady

| Trigger | Zdarzenie i filtr | Działanie |
| --- | --- | --- |
| `deploy-prod` | push do `master`, pliki z `frontend.included_files` w `component-triggers.json` | Landing V3: build → smoke → 0% → digest-verified 100% → live smoke |
| `backend-ci` | push do `master`, pliki z `backend.included_files` | FastAPI: testy → Docker build → smoke → Artifact Registry. **Bez deployu API** |
| `pr-checks` | PR do `master` | Testy backendu i frontendu oraz infrastruktury; niezależne kroki testowe mogą działać równolegle |
| `protolume-v3-preview-manual` | ręczny | Preview web 0% ruchu domeny, `noindex` |

Zmiana w `landing/` uruchamia tylko frontend; zmiana w `backend/` tylko backend-ci. Wspólny `production-contract.json` lub `.dockerignore` może uruchomić obydwie ścieżki. Zmiana samego README nie powinna uruchamiać żadnego produkcyjnego pipeline'u. Filtry stosuje **usługa Cloud Build**, nie pliki YAML i nie GitHub Actions. Szczegóły: `infra/gcp/component-triggers.json`.

**Nie utożsamiaj backend-ci z deploymentem produkcyjnego API.** Ręczne wydanie API musi uwzględniać istniejące zmienne środowiskowe, Secret Manager, SMTP, health/ready i bezpieczny rollback. Istniejący `cloudbuild.backend.yaml` również tylko buduje/publikuje obraz.

## Aktywacja po review/merge

Zmiany w repo **nie aktualizują automatycznie konfiguracji triggerów w GCP**. Samo scalenie PR nie zapewnia filtrowania ścieżek. Wymagane jest świadome uruchomienie operacji w GCP przez właściciela.

1. `python scripts/gcp/configure_component_triggers.py` — plan offline, bez odczytu GCP i bez zmian.
2. Po weryfikacji uprawnień GCP: `python scripts/gcp/configure_component_triggers.py --apply` — walidacja istniejącego `deploy-prod`, utworzenie lub aktualizacja `backend-ci`, dopiero potem ustawienie filtrów `deploy-prod`; na końcu odczyt obu triggerów i potwierdzenie filtrów.
3. `python scripts/gcp/audit_trigger.py --project ai-software-studio-501918 --trigger-kind production --trigger-location global` — dodatkowy audyt read-only.
4. Sprawdź w Cloud Build niezależne uruchomienia: zmiana tylko `landing/`, tylko `backend/`, wspólny kontrakt oraz zmiana tylko w dokumentacji. Testowe commity nie powinny celowo zmieniać zachowania strony.
5. Potwierdź, że `deploy-prod` nadal publikuje działające V3, `backend-ci` nie dotyka usługi `aisoftware-studio-api`, a `v3-review` ma 0% ruchu i noindex.

`--apply` **zmienia konfigurację Cloud Build**; nie uruchamiaj go przed zatwierdzeniem PR. Skrypt kończy się błędem przy niespodziewanym repo, branchu, nazwie, pliku konfiguracji, istniejącym `ignoredFiles` lub niezgodnych filtrach. Przy nowym `backend-ci` próbuje odziedziczyć Cloud Build service account z istniejącego `deploy-prod`. Jeśli konto/role nie wystarczą do pushowania obrazów, konfigurację IAM trzeba poprawić świadomie, bez poszerzania uprawnień automatycznie.

**Ważne:** nowy trigger może zostać utworzony poprawnie, a następny krok aktualizacji drugiego triggera może się nie udać. W takim wypadku sprawdź oba triggery w konsoli, zanim ponowisz `--apply`; operacja jest projektowana pod ponowne uruchomienie, nie jest transakcją GCP.

Historyczny identyfikator `deploy-prod`: `901333cb-1c13-4929-90e5-6df070eb647e` (`global`), skrypt go weryfikuje. Wdrożenie frontendu i rollback są opisane w `docs/operations.md`.
