# Protolume V3 — operacje

## System

- Strona: `protolume.pl` → Cloud Run `aisoftware-studio-web`, obraz Nginx produkcyjny z `landing/`.
- API kontaktu: `aisoftware-studio-api` — `POST /api/contact/brief`, SMTP Gmail + Secret Manager.
- Podgląd: osobna rewizja usługi web, tag `v3-review`, 0% ruchu produkcyjnego, `noindex`.
- Region: `europe-central2`, projekt: `ai-software-studio-501918`.

## Wdrożenie i kontrola

1. Po merge na master sprawdź, czy GCP Cloud Build `deploy-prod` w ogóle wystartował (GitHub merge sam tego nie potwierdza).
2. Pipeline waliduje SHA, sekrety prawne, stronę, politykę, obraz Nginx i dopiero potem promuje rewizję na 100%.
3. Potwierdź `https://protolume.pl/`, `robots.txt`, `polityka-prywatnosci/`, przekierowania starych URL-i oraz brak nagłówka `X-Robots-Tag: noindex`.
4. Sprawdź `protolume-build-sha` w HTML i wykonaj jedno własne testowe zgłoszenie, potwierdzając odbiór.
5. Zostaw `v3-review` na 0% i `noindex`.

## Rollback

GCP -> Cloud Run -> `aisoftware-studio-web` -> Manage traffic -> wybierz poprzednią gotową rewizję i ustaw 100%. Nie kasuj historii obrazów, dopóki nowa wersja nie działa stabilnie.

## Aktualizacja backendu

Publikacja V3 **nie** wdraża automatycznie FastAPI. Weryfikacja backendu: `cd backend`, zainstaluj `requirements-dev.lock`, uruchom Ruff i pytest. Dla backendu używaj odrębnego pipeline’u i zachowaj konfigurację `SMTP_PASSWORD` w Secret Manager. Nigdy nie umieszczaj wartości sekretów w repo.
