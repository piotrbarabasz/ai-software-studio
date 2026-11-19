# Protolume v3 — jedna wizytówka

Ten katalog zawiera nową, niezależną **statyczną** stronę Protolume:
- jeden ekran informacyjno-kontaktowy (na telefonach naturalnie przewijany),
- logo z istniejących zasobów marki,
- krótka informacja o Piotrze Barabaszu,
- trzy pola: imię, e-mail i opcjonalna wiadomość,
- polityka prywatności budowana z istniejącej, zatwierdzonej konfiguracji,
- brak własnego backendu, bazy danych, Angular runtime, CMS i analityki śledzącej.

Stary frontend/, backend/ i obecny Cloud Build/Cloud Run **nie są przełączane ani kasowane w tym PR**. Implementacja nowej strony jest odseparowana, aby można ją było przetestować przed migracją ruchu i wyłączeniem starego API.

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

## Hosting i migracja — oddzielne działanie po zatwierdzeniu

Plik firebase.json w głównym katalogu opisuje nową witrynę na Firebase Hosting, nagłówki bezpieczeństwa oraz przekierowania starych URL-i na /.

1. Potwierdź dostęp do Firebase Hosting w wybranym projekcie GCP i dodaj docelową domenę.
2. Zweryfikuj ręcznie wygląd na desktop/mobile, formularz, politykę prywatności, CSP i wszystkie przekierowania.
3. Sprawdź w Search Console ruch do historycznych URL-i. Jeśli jakiś adres ma istotny ruch, oceń skutki przekierowania na stronę główną (zamiast mechanicznego 301).
4. Przetestuj produkcyjny build i realną dostawę co najmniej dwóch zapytań: pusty opis i wypełniony opis, plus błędny e-mail i błąd dostawcy.
5. Dopiero po odrębnej zgodzie wykonaj zmianę DNS/hostingu. Obecny trigger Cloud Build na push do master wdraża **stare** usługi Cloud Run — trzeba go wyłączyć/przestawić przed zmianą sposobu publikacji; samo zmergowanie kodu strony nie przełącza hostingu.
6. Po potwierdzeniu ruchu i dostaw kontaktowych usuń starą usługę FastAPI, zbędne sekrety SMTP/konfigurację wdrożenia i osierocone testy oraz stare komponenty ze starego frontendu w osobnym porządkującym PR.

**Ten PR nie wykonuje merge, deploymentu, migracji domeny ani usuwania zasobów.**

## Akceptacja

- Jedna strona, bez nawigacji, kart usług, portfolio, dodatkowych CTA i wymyślonych dowodów.
- Działa responsywnie; widoczne focus states i komunikaty dostępne dla czytników.
- Formularz nie uznaje wysyłki za sukces przed odpowiedzią 2xx usługi.
- Bez integracji użytkownika: jawne przejście na e-mail, nie fałszywe wysłanie.
- Polityka prywatności z zatwierdzonego konfiguratora, bez fikcyjnych danych w buildzie produkcyjnym.
- Obecne produkcyjne środowisko pozostaje bez zmian do osobnej decyzji.
