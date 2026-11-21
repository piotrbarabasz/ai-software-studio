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

Strona wykorzystuje logo marki, ma dostępne pola i stany formularza, **nie wymaga Angulara ani nowego backendu**. Formularz korzysta z istniejącej usługi FastAPI / SMTP: `POST /api/contact/brief` przez same-origin reverse proxy Nginx na Cloud Run. Dzięki temu nie udostępniamy danych SMTP frontendowi ani nie potrzebujemy osobnego konta Formspree. Wysyłanie jest włączane tylko w buildach z zatwierdzoną publiczną polityką prywatności. Bez endpointu przycisk pozostaje nieaktywny.

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

W podglądzie robots.txt i metadata mają **noindex**. Bez `FORM_ENDPOINT` lokalny przycisk wysyłania pozostaje wyłączony i nie uruchamia aplikacji pocztowej. Cloud Build konfiguruje ten endpoint automatycznie po odczytaniu zweryfikowanej polityki; bez poprawnego sekretu build się zatrzyma.

## Formularz V3 — istniejący FastAPI / SMTP

- Na starej stronie Angular wysyłał JSON do `POST /api/contact`; ten kontrakt nadal istnieje i wymaga wielu pól.
- Dla uproszczonego V3 dodano `POST /api/contact/brief`, który wymaga tylko imienia/nazwy i e-maila; opis jest opcjonalny. Honeypot oraz obecne zabezpieczenia SMTP / limit zgłoszeń pozostały.
- W przeglądarce `POST /api/contact/brief` idzie do tej samej domeny v3. Nginx przekazuje **tylko ten endpoint** do istniejącego `aisoftware-studio-api`, bez rozszerzania CORS.
- Cloud Build preview ma domyślnie `_FORM_ENDPOINT=/api/contact/brief` i pobiera istniejącą zatwierdzoną konfigurację publicznej polityki z Secret Manager `aisoftware-studio-public-legal-config`. Gdy sekret jest nieobecny / nieprawidłowy, build **kończy się błędem przed deployem**, zamiast udawać działający formularz.
- Przełączenie ruchu `protolume.pl` na v3 jest osobnym etapem; `deploy-prod` nadal buduje Angular. Po merge i udanym deploymentcie API trzeba ręcznie uruchomić pipeline `protolume-v3-preview-manual`, sprawdzić 0% produkcyjnego ruchu, a następnie wysłać **własną wiadomość testową** i sprawdzić odbiór na `kontakt@protolume.pl`.

Dla lokalnego podglądu z aktywnym formularzem musisz podać zatwierdzony plik prawny:

```powershell
$env:FORM_ENDPOINT = "/api/contact/brief"
$env:PUBLIC_LEGAL_CONFIG_PATH = "C:\\sciezka\\do\\zatwierdzonej-polityki.json"
node landing/build.mjs --preview
```

Serwer `python -m http.server` obsługuje tylko pliki statyczne — **nie proxy do API**. Prawdziwą wysyłkę testuj na Cloud Run albo przez lokalny Nginx z konfiguracją proxy. Nie uruchamiaj testowych POST do produkcyjnego API w automatycznym smoke.

Historyczna ścieżka Formspree w starych plikach Firebase pozostaje kompatybilna, ale **nie jest rekomendowanym ani domyślnym formularzem v3 Cloud Run**.

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
- Formularz nie uznaje wysyłki za sukces przed odpowiedzią 2xx usługi; bez integracji jednoznacznie wyłącza wysyłanie i wyświetla adres kontaktowy.
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



## UI-002 — karty obszarów, proces i typy rozwiązań

Drugi etap redesignu zgodnego z [Figmą V3 Desktop](https://www.figma.com/design/m2LeessPiyWNgREo4RG9jR?node-id=11-28) i [Mobile](https://www.figma.com/design/m2LeessPiyWNgREo4RG9jR?node-id=12-67):

- 6 obszarów automatyzacji: jasne karty, numery \`01–06\` (dekoracyjne i ukryte dla technologii asystujących), oryginalne ikony Lucide i **niezmienione teksty**.
- 3 kroki współpracy: kontrastowy ciemny panel i osobne kafelki. Semantyka listy numerowanej pozostaje.
- 4 typy rozwiązań: dwa rzędy kafelków na desktopie, jedna kolumna na wąskich ekranach; ikony Lucide i dyskretna numeracja.
- Tablet do 1050 px: proces pionowy dla czytelności. Mobile: prostsze wymiary, typografia i spacing.
- Styl podpięty do tokenów kolorów i zaokrągleń z UI-001. Bez nowych bibliotek, emoji, JS, niezweryfikowanych obietnic biznesowych ani animacji scroll reveal.
- Hero, formularz, backend i konfiguracja release nie zostały zmienione.

Testy automatyczne w \`landing/build.test.mjs\` weryfikują liczbę i numerację elementów, referencje do Lucide, breakpointy, zachowanie formularza i nawigacji.



## MOTION-001 — dostępne i lekkie animacje V3

Animacje powstają według [Figma V3 Desktop](https://www.figma.com/design/m2LeessPiyWNgREo4RG9jR?node-id=11-28) i [Mobile](https://www.figma.com/design/m2LeessPiyWNgREo4RG9jR?node-id=12-67). Są **progresywnym ulepszeniem**, a nie warunkiem wyświetlenia treści.

- \`motion.css\`: skończone animacje wejścia Hero (nagłówek, lead, wizualizacja AI, kartki wejścia/rezultatu), hover tylko dla \`hover: hover\` i \`pointer: fine\`, obsługa \`prefers-reduced-motion: reduce\`.
- \`motion.js\`: natywne Web Animations API + \`IntersectionObserver\` dla sześciu kart obszarów, trzech kroków współpracy, czterech kafelków rozwiązań i formularza; opóźnienia między elementami.
- Strona jest **zawsze widoczna domyślnie** — bez klas ukrywających elementy przed inicjalizacją JS; przeglądarki bez API pokazują wszystkie treści. Przy przełączeniu preferencji reduced-motion trwające animacje są anulowane.
- Kotwice są natywne, nie przechwytujemy scrollowania JavaScriptem. Płynne przewijanie działa wyłącznie, jeżeli system nie prosi o ograniczenie ruchu.
- Assety CSS/JS są samodzielnie hostowane w \`landing/dist\`, bez bibliotek zewnętrznych, CDN, nowych ikon ani zmian backendu.
- \`motion.test.mjs\` testuje mechanikę reveal i degradację bez API; \`node scripts/protolume.mjs check\` uruchamia również te testy.
- Formularz zachowuje dotychczasową obsługę i ograniczenia preview; Motion **nie** symuluje powodzenia wysyłki.



## CONTACT-001 + QA-001 — formularz z Figmy i testy zachowania

Sekcja \`#kontakt\` odwzorowuje [V3 Desktop](https://www.figma.com/design/m2LeessPiyWNgREo4RG9jR?node-id=11-28) oraz [Mobile](https://www.figma.com/design/m2LeessPiyWNgREo4RG9jR?node-id=12-67): jasnofioletowe tło, krótki opis i prosty formularz. Pozostawiamy **tylko trzy pola**, z czego opis jest opcjonalny. Dekoracyjna ikona pochodzi z lokalnego sprite Lucide, a nie z emoji.

- **Preview, bez \`FORM_ENDPOINT\`:** przycisk „Wyślij wiadomość” jest nieaktywny, a status wyjaśnia brak dostępności formularza i pokazuje adres kontaktowy. Nie uruchamiamy aplikacji pocztowej i nie udajemy sukcesu.
- **Formspree (po jawnej konfiguracji i zatwierdzeniu polityki):** dane są normalizowane przez \`trim()\`, opcjonalna wiadomość otrzymuje neutralną treść, a wysyłka następuje dopiero po poprawnej walidacji. Pola nie są resetowane w przypadku błędu.
- Wbudowana walidacja HTML jest zachowana. Sprawdzamy ponadto imię/nazwę firmy po usunięciu białych znaków, obsługujemy atrybut \`aria-invalid\`, a błędne pola mogą otrzymać fokus. Wskaźnik \`aria-busy\` i blokada przycisku zapobiegają ponownemu kliknięciu podczas wysyłania.
- **Antyspam:** pole \`_gotcha\` jest nadal obecne, a wypełniony honeypot jest ignorowany bez wysyłki.
- Responsywność: mobile ma jeden słupek i formularz o szerokości kontenera; zachowujemy focus-visible, semantyczne etykiety, live region statusu i \`prefers-reduced-motion\`.
- **Testy:** \`landing/form.test.mjs\` sprawdza obydwa tryby, obsługę błędów, trim, double submit, opcjonalny opis i honeypot. Nowy test struktury w \`landing/build.test.mjs\` sprawdza HTML, CSS, liczbę sekcji, kotwice, ikony i konfigurację. Polecenie \`node scripts/protolume.mjs check\` uruchamia testy formularza razem z dotychczasowymi.

Nie zmieniamy backendu, endpointu, danych prawnych, trybu produkcyjnego ani Cloud Run. \`make release\` pozostaje zablokowane. Przed mergem obowiązuje lokalne \`node scripts/protolume.mjs check\`, ręczny przegląd na urządzeniach oraz test formularza po skonfigurowaniu **właściwego, zatwierdzonego** odbiorcy w odrębnym procesie release.


## CONTACT-002 — wysyłanie bez otwierania poczty użytkownika

**Ważne:** Sam e-mail \`kontakt@protolume.pl\` nie jest endpointem HTTP. Formspree realizuje przesłanie wiadomości ze strony i opcjonalne powiadomienie e-mail. Docelowy adres trzeba połączyć i zweryfikować w panelu Formspree; sam kod nie może tego potwierdzić.

1. W [Formspree](https://formspree.io/) utwórz formularz „Protolume — Kontakt”, dodaj **kontakt@protolume.pl** do zweryfikowanych odbiorców i w Workflow włącz akcję **Send Email** na ten adres. Skopiuj faktyczny endpoint w formacie \`https://formspree.io/f/ID\`.
2. Zatwierdź publiczną politykę prywatności obejmującą Formspree, cele przetwarzania, retencję i odbiorców. Umieść poprawny publiczny JSON w istniejącym sekrecie GCP \`aisoftware-studio-public-legal-config\` (Secret Manager) — nie w repo ani w rozmowie.
3. W lokalnym \`.env\` ustaw **publiczny** \`FORM_ENDPOINT=https://formspree.io/f/ID\`. Endpoint nie jest tokenem dostępu. Użyj \`node scripts/protolume.mjs preview\` do ręcznego Cloud Build z tagiem \`v3-review\`.
4. Cloud Build pobierze zweryfikowaną politykę z Secret Manager. Build nie przejdzie bez poprawnej konfiguracji lub uprawnień \`secretmanager.versions.access\` konta Cloud Build. Przy braku endpointu powstanie zwykły, nieaktywny podgląd.
5. Na adresie tagowanej rewizji wypełnij formularz **danymi testowymi**, wyślij wiadomość, sprawdź jej status w Formspree i **potwierdź faktyczne otrzymanie** wiadomości w \`kontakt@protolume.pl\` (również folder Spam). Dopiero wtedy uznaj integrację za działającą.

Cała ścieżka preview nadal jest \`noindex\`, \`--no-traffic\`, bez modyfikacji produkcji. Gdy nie podano endpointu, formularz jest wyraźnie nieaktywny, a nie magicznie dostarczany. Release produkcyjny pozostaje zablokowany.

