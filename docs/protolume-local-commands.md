# Protolume v3 — lokalne .env i polecenia

**Aktualny kierunek: istniejący Cloud Run, nie Firebase Hosting.**
Zatwierdzony projekt z logów produkcyjnego deployu: ai-software-studio-501918, usługa aisoftware-studio-web, region europe-central2.

## Pierwsze uruchomienie w PowerShell

    cd D:\Projects\ai-software-studio
    git pull origin master
    if (!(Test-Path .env)) { Copy-Item .env.example .env }
    notepad .env

Przykładowa konfiguracja (bez danych tajnych):

    GCP_PROJECT_ID=ai-software-studio-501918
    GCP_ACCOUNT=kontakt@protolume.pl
    GCP_REGION=europe-central2
    CLOUD_RUN_PREVIEW_TAG=v3-review
    FORM_ENDPOINT=
    PUBLIC_LEGAL_CONFIG_PATH=

**Ważne:** jeśli twój lokalny plik .env pochodzi z poprzedniego PR i ma jeszcze FIREBASE_PREVIEW_CHANNEL, usuń tę linię i wpisz CLOUD_RUN_PREVIEW_TAG=v3-review. Runner zachowuje domyślny v3-review również dla starego lokalnego .env.

GCP_ACCOUNT musi wskazywać konto **mające prawo uruchamiać Cloud Build w tym projekcie**. Sam plik .env nie nadaje IAM. Jeżeli kontakt@protolume.pl nadal nie ma dostępu, najpierw nadaj minimalne role uprawnionemu użytkownikowi lub użyj już uprawnionego konta.

## Krótkie komendy

| GNU Make | Bez Make (Windows/PowerShell) | Działanie |
| --- | --- | --- |
| make check | node scripts/protolume.mjs check | Testy bez GCP |
| make preview-local | node scripts/protolume.mjs preview-local | Lokalny katalog landing/dist |
| make doctor | node scripts/protolume.mjs doctor | Read-only projekt i bucket Cloud Build |
| make preview | node scripts/protolume.mjs preview | Ręczny build + Cloud Run v3 w oddzielnej rewizji **0% ruchu** |
| make build-production | node scripts/protolume.mjs build-production | Tylko lokalny build wymagający legal JSON i Formspree |
| make release | node scripts/protolume.mjs release | **ZABLOKOWANE** do osobnej akceptacji produkcyjnej |

Nie musisz przełączać aktywnego gcloud project przy zmianie pracy między Tripse i Protolume; skrypt do każdego `gcloud` przekazuje jawne `--project` i `--account`.

## Ochrona

- .env jest ignorowany przez Git oraz wykluczony ze źródłowego uploadu Cloud Build. Nie przechowuj tam tokenów, haseł ani JSON ze szczegółami prawnymi.
- make preview nie dotyka Firebase Hosting, domeny ani ruchu prod; Cloud Build wdraża nową rewizję usługi z `--no-traffic --tag=v3-review` i weryfikuje stan.
- Główny trigger deploy-prod pozostaje pod starym Angular/FastAPI; merge kodu na master uruchamia jego dotychczasową ścieżkę.
- make release nie publikuje do Firebase ani Cloud Run. Formspree + RODO + cutover będą osobnym krokiem.

Szczegóły operacyjne: docs/protolume-v3-cloudrun-preview.md.
