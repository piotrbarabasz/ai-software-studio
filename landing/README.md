# Protolume v3 — prosty landing z konkretnymi obszarami automatyzacji

Ten katalog zawiera niezależną, **statyczną stronę Protolume**. Jest to pojedynczy, przewijany landing z pięcioma sekcjami:

1. Hero — jasna informacja o AI, automatyzacjach i aplikacjach, dwa odnośniki do sekcji strony.
2. Co można zautomatyzować — sześć krótkich obszarów z przykładami problemów.
3. Jak wygląda współpraca — trzy proste kroki.
4. Co tworzymy — cztery typy rozwiązań.
5. Kontakt — imię lub firma, e-mail i opcjonalny krótki opis.

Strona ma **lekki, przyklejony do górnej krawędzi navbar** z czterema kotwicami (Obszary, Współpraca, Rozwiązania, Kontakt). Na telefonach nawigacja zawija się pod logo, a przewijanie do sekcji uwzględnia wysokość nagłówka oraz preferencję ograniczonego ruchu.

Ikony pochodzą z biblioteki **[Lucide](https://lucide.dev)** (licencja ISC). W repozytorium jest lekki zestaw SVG `landing/icons.svg` oraz `landing/LUCIDE-LICENSE.txt`; generator kopiuje oba pliki do `landing/dist/assets/`, bez CDN i bez dodatkowych zależności runtime. Użyte strzałki w CTA, ikony obszarów automatyzacji i typów rozwiązań należą do jednego zestawu.

Komunikacja publiczna jest spójna w imieniu marki Protolume („Projektujemy”, „Co tworzymy?”, „Napisz do nas”, „Opowiedz nam”). **Nie ma osobnej sekcji o właścicielu / zaufaniu**, portfolio, demo ani nawigacji do wielu podstron. Jedyną dodatkową stroną jest polityka prywatności.

Strona wykorzystuje logo marki, ma dostępne pola i stany formularza, nie zawiera Angular runtime, backendu ani analityki śledzącej. W trybie preview formularz otwiera klienta pocztowego; produkcyjny build wymaga skonfigurowanej usługi Formspree i zatwierdzonych danych prawnych.

**Ważne:** zmiana samego landingu nie przełącza ruchu produkcyjnego. Istniejący Cloud Build `deploy-prod` nadal publikuje Angular / FastAPI. Testowa rewizja v3 z `v3-review` jest wdrażana osobnym, ręcznym pipeline'em z 0% ruchu produkcyjnego.

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

- Pięć sekcji w kolejności: hero → obszary → współpraca → typy rozwiązań → kontakt.
- Nawigacja do czterech sekcji z czytelnymi stanami focus, zachowaniem responsive i przewijaniem przy sticky header.
- Ikony wyłącznie z lokalnie dostarczanego pakietu Lucide; brak emoji i zewnętrznych zależności CDN.
- Spójne brzmienie w imieniu marki Protolume, bez pierwszej osoby liczby pojedynczej.
- Dokładnie sześć obszarów, trzy kroki i cztery typy rozwiązań — bez rozbudowanego katalogu.
- Brak osobnego bloku zaufania, portfolio, case studies i nawigacji wielostronicowej.
- Działa responsywnie; widoczne focus states, semantyczne nagłówki i komunikaty dostępne dla czytników.
- Formularz nie uznaje wysyłki za sukces przed odpowiedzią 2xx usługi; bez integracji jasno otwiera klienta e-mail.
- Polityka prywatności z zatwierdzonej konfiguracji, bez fikcyjnych danych w buildzie produkcyjnym.
- Obecna produkcja pozostaje bez zmian do osobnego review i zgody na publikację v3.


## UI-001 — Figma V3: design system, header i hero

Pierwszy etap redesignu odtwarza górną część strony według makiet [desktop 1440](https://www.figma.com/design/m2LeessPiyWNgREo4RG9jR?node-id=11-28) oraz [mobile 390](https://www.figma.com/design/m2LeessPiyWNgREo4RG9jR?node-id=12-67).

- Semantyczne tokeny kolorów i zaokrągleń w CSS.
- Hero zachowuje ten sam przekaz, pojedynczy H1, dwa CTA i kotwice do istniejących sekcji.
- Dekoracyjny diagram „dane wejściowe → AI → rezultat” oparty wyłącznie na HTML/CSS i lokalnym sprite Lucide; diagram jest \`aria-hidden\`, bo odzwierciedla treść widoczną tekstowo.
- Mobilny navbar ogranicza widoczne linki do kontaktu; pozostałe sekcje są dostępne przez przewijanie i CTA w Hero.
- Wszystkie dalsze sekcje, formularz i bezpieczeństwo preview pozostają bez zmian do kolejnych PR.
- Scroll reveal i zaawansowane animacje zostaną dodane w MOTION-001. W UI-001 są tylko lekkie reakcje hover respektujące preferencję reduced motion.
- Brak dodatkowych bibliotek JavaScript, CDN, emoji i nowego backendu.

