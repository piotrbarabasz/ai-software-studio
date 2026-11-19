# Protolume v3 — jedna wizytówka

Ten katalog zawiera nową, niezależną **statyczną** stronę Protolume:
- jeden ekran informacyjno-kontaktowy (na telefonach naturalnie przewijany),
- logo z istniejących zasobów marki,
- krótka informacja o Piotrze Barabaszu,
- trzy pola: imię, e-mail i opcjonalna wiadomość,
- polityka prywatności budowana z istniejącej, zatwierdzonej konfiguracji,
- brak własnego backendu, bazy danych, Angular runtime, CMS i analityki śledzącej.

Stary frontend/, backend/ i obecny Cloud Build/Cloud Run **nie są przełączane ani kasowane w tym PR**. Implementacja nowej strony jest odseparowana, aby można ją było przetestować przed migracją ruchu i wyłączeniem starego API.

## Krótkie komendy na Windows i Linux

Skopiuj .env.example do lokalnego .env i używaj Makefile lub bezpośrednio Node:

    make check
    make preview-local
    make doctor
    make preview

Bez GNU Make na Windows: `node scripts/protolume.mjs preview`.
Pełna instrukcja i kwestie uprawnień: docs/protolume-local-commands.md.

## Podgląd lokalny

Z katalogu głównego repozytorium:

    node landing/build.mjs --preview
    node --test landing/build.test.mjs

Udostępnij katalog landing/dist lokalnym serwerem plików, np.:

    python -m http.server 8080 -d landing/dist

Otwórz http://localhost:8080.

W podglądzie robots.txt i metadata mają **noindex**. Przycisk formularza **otwiera program pocztowy**, nie wysyła danych do nieistniejącego API. Wysyłka jest zatwierdzana dopiero przez użytkownika w jego aplikacji pocztowej. Komunikat nie udaje sukcesu.

## Konfiguracja przed produkcyjnym buildem

1. Utwórz formularz w **Formspree** i skonfiguruj odbiorcę kontakt@protolume.pl, reguły antyspamowe, powiadomienia i politykę retencji. Potwierdź rzeczywistą dostarczalność testową. Endpoint nie jest sekretem; nie dodawaj tokenów API do frontendu.
2. Przejrzyj umowę i wymagania RODO dla procesora formularza. Zaktualizuj istniejący plik legal JSON: prawdziwy administrator, adres, cele/podstawy, retencja, odbiorcy, dostawcy infrastruktury i poczty, prawa. **Formspree musi być jawnie wymienione w odbiorcach lub dostawcach**.
3. Przekaż te wartości do builda, nie zapisuj danych prawnych w kodzie ani prywatnych sekretów w repo.

PowerShell:

    $env:FORM_ENDPOINT = "https://formspree.io/f/TWOJ_ID"
    $env:PUBLIC_LEGAL_CONFIG_PATH = "C:\bezpieczna-lokalizacja\public-legal.json"
    node landing/build.mjs --production

Linux/macOS:

    FORM_ENDPOINT=https://formspree.io/f/TWOJ_ID PUBLIC_LEGAL_CONFIG_PATH=/secure/public-legal.json node landing/build.mjs --production

**Fail-closed:** produkcyjny build kończy się błędem bez obu konfiguracji, przy niewłaściwym endpointcie HTTPS lub nieprawidłowych danych prawnych.

## Cloud Run Preview na istniejącym hostingu

Obecna architektura to Cloud Run, usługa `aisoftware-studio-web` w projekcie `ai-software-studio-501918`. Nie tworzymy nowego Firebase ani nie zmieniamy DNS.

Po review tego PR: `make preview` (na Windows bez GNU Make: `node scripts/protolume.mjs preview`) buduje testową rewizję z **0% ruchu**, tagiem `v3-review` i osobnym URL. Nie wykonuje deploymentu produkcyjnego v3.

Przeczytaj `docs/protolume-v3-cloudrun-preview.md` przed uruchomieniem. Użyj konta z uprawnieniami do tego projektu — lokalny `.env` nie nadaje IAM.

Starszy plan Firebase i pliki `firebase.json` / `cloudbuild.landing-preview.yaml` pozostają jako historyczna alternatywa, nie są aktualną ścieżką release. `make release` jest zablokowane do czasu osobnej akceptacji formularza, polityki prywatności i planu cutover.

## Akceptacja

- Jedna strona, bez nawigacji, kart usług, portfolio, dodatkowych CTA i wymyślonych dowodów.
- Działa responsywnie; widoczne focus states i komunikaty dostępne dla czytników.
- Formularz nie uznaje wysyłki za sukces przed odpowiedzią 2xx usługi.
- Bez integracji użytkownika: jawne przejście na e-mail, nie fałszywe wysłanie.
- Polityka prywatności z zatwierdzonego konfiguratora, bez fikcyjnych danych w buildzie produkcyjnym.
- Obecne produkcyjne środowisko pozostaje bez zmian do osobnej decyzji.
