# Dowody i metodologia drugiego audytu

Raport główny: [AUDYT.md](AUDYT.md). Wszystkie nowe wyniki poniżej pochodzą z tego audytu. Wyniki wcześniejszej implementacji są wyraźnie opisane jako historyczne.

## Wersje i źródła

- Aktualny sprawdzony `origin/master`: `8ccc20c23c11f32f54d3e677455330e14f4eac3c`, merge PR #57. [Commit](https://github.com/piotrbarabasz/ai-software-studio/commit/8ccc20c23c11f32f54d3e677455330e14f4eac3c).
- Home HTTP 200, 2026-09-09 21:00:44 UTC: publiczne meta `protolume-build-sha=8ccc20c`. Ten sam skrót na wszystkich 15 trasach i w API `/health`.
- Drzewo mastera: `6e3ffb0a4fece7e60689b25bdbf0223d8787440c`; takie samo jak implementacyjnego commita `c39801c`.
- Checkout użytkownika w głównym katalogu: starsze `0d38ef8037ce28a0ae4f8a3f3f3df4af4a8524c5`. Przejrzano aktualny kod w `tmp/protolume-second/master-source`, bez przestawiania checkoutu użytkownika.
- Pierwszy audyt mierzył produkcję `8386de6`. Wysokości i dawne metryki zaczerpnięto z [DOWODY poprzedniego audytu](../protolume-2026-09-07/DOWODY.md); oceny z [AUDYT](../protolume-2026-09-07/AUDYT.md).
- Przeczytano także AGENTS, BACKLOG, IMPLEMENTATION_STATUS, RESUME, BLOCKERS, FINAL_IMPLEMENTATION_REPORT, EVIDENCE_INVENTORY, dokumenty RAG/CRM/Voice/engineering/research/report i odpowiednie dane implementation-evidence. Aktualne reguły deploymentu zachowano.

Dowody wersji: [versions.json](evidence/versions.json), [crawl.json](evidence/crawl.json), [interactions.json](evidence/interactions.json). Hashy pobieranych materiałów nie oparto na starym lokalnym checkoutcie: porównano je z `git show <master SHA>:<ścieżka>`.

Końcowe potwierdzenie po wznowieniu pracy 10 września, 09:10:50 UTC: `git ls-remote origin refs/heads/master` nadal wskazuje `8ccc20c23c11f32f54d3e677455330e14f4eac3c`, a HTML produkcyjnego home jest identyczny bajtowo z pierwotnym pobraniem tego audytu. [final-version-check.json](evidence/final-version-check.json).

Uzupełnienie z 10 września: publiczny obraz OG odpowiada HTTP 200, PNG 1200×630, 328 101 bajtów. GET API `/health` z nagłówkiem Origin dopuszcza dokładnie sprawdzony origin Protolume; obcy testowy origin nie otrzymuje nagłówka allow-origin. Test nie obejmuje wszystkich metod/preflight. [metadata-review.json](evidence/metadata-review.json).

## Zakres nowej weryfikacji

| Kontrola | Zakres i wynik | Plik |
| --- | --- | --- |
| Przegląd tras | 15 publicznych tras, status, HTML bez JS, tekst, nagłówki, metadane, JSON-LD, linki i skrypty | [crawl.json](evidence/crawl.json) |
| Układ | 15 × 6 szerokości = 90; 360, 390, 430, 768, 1024, 1440; brak wykrytego poziomego overflow | [crawl.json](evidence/crawl.json) |
| Axe | 30 skanów: 390 i 1440; zero violations, ale obecne incomplete wymagające ręcznej oceny | [crawl.json](evidence/crawl.json), [szczegóły incomplete](evidence/accessibility-followup.json) |
| Performance | 3 × home mobile, kontakt mobile, RAG mobile, home desktop; 6 ukończonych przebiegów | [performance.json](evidence/performance.json) |
| Zimny start | Po 3 świeże konteksty home/kontakt/RAG, CPU ×4; brak utraty H1/zerowego main po pojawieniu treści, CLS 0 | [interactions.json](evidence/interactions.json) |
| Menu i skip link | Klawiatura, Escape, fokus, aria-expanded/inert; menu 360/390/430/768 | [interactions.json](evidence/interactions.json) |
| Kontakt | 7 mapowań tematu, zmiana ręczna, nieznane query, globalny header, canonical | [interactions.json](evidence/interactions.json), [followup.json](evidence/followup.json) |
| Formularz | Walidacja pustych pól, 422/429/503/błąd sieci i 202; wszystkie 5 żądań przechwycone lokalnie | [interactions.json](evidence/interactions.json) |
| Symulacja/RAG UI | Gotowa odpowiedź, brak danych, reset, fokus, otwarcie i zamknięcie dokumentu; bez żądań modelu | [interactions.json](evidence/interactions.json) |
| Bez JS | Treść wszystkich tras, natywne details źródeł, źródło tekstowe, e-mail, honeypot | [crawl.json](evidence/crawl.json), [followup.json](evidence/followup.json) |
| Pliki publiczne | 15 plików evidence HTTP 200; każdy identyczny z masterem według SHA-256 | [crawl.json](evidence/crawl.json) |
| PDF | Rzeczywiste pobranie z przeglądarki; wszystkie 4 strony wyrenderowane i obejrzane, tekst polski i numeracja poprawne | [pdf-review.json](evidence/pdf-review.json) |
| R&D | Ponowne uruchomienie dostarczonej paczki: 10/12, te same dwa błędy, zero model calls | [research-rerun.json](evidence/research-rerun.json) |
| API | GET `/health` i `/ready` HTTP 200, backend SHA 8ccc20c; bez testowania poczty | [interactions.json](evidence/interactions.json) |
| Kod | Przegląd aktualnego mastera, klasyfikacja plików i ograniczony skan wzorców sekretów | [source-review.json](evidence/source-review.json) |
| 404/indexing | Nieistniejąca trasa HTTP 404, noindex/follow; 15 tras index/follow; sitemap i robots | [crawl.json](evidence/crawl.json), [sitemap](evidence/sitemap.xml), [robots](evidence/robots.txt) |

Przegląd wizualny obejmował reprezentatywne widoki desktop/mobile, pełny układ kluczowych tras, stany interakcji i wszystkie strony PDF. Automatyczne objęcie 90 układów nie oznacza 90 osobnych testów na fizycznych urządzeniach. Zrzuty pierwszych ekranów 390/1440 są w `evidence/`; pełne obrazy tras pozostały w ignorowanym `tmp/protolume-second/screenshots`.

## Ustawienia i ograniczenia pomiaru

- Playwright z Chromium 151.0.7922.34; axe-core 4.13.0. Desktop viewport 1440×1000, pozostałe kontrole geometrii z wysokością 844 CSS px.
- Lighthouse 13.4.1. Mobile: emulacja 412×823, DPR 1,75, symulowane RTT 150 ms, throughput 1638,4 Kbps, spowolnienie CPU ×4. Desktop: 1440×1000, DPR 1, RTT 40 ms, throughput 10240 Kbps, CPU ×1 — własne ustawienia porównawcze, nie domyślny preset desktop.
- Lighthouse nie był uruchamiany równolegle z pozostałymi pomiarami przeglądarkowymi. Każdy przebieg miał osobny profil. Pełne raporty HTML są w evidence, surowe Lighthouse JSON w `tmp/protolume-second/performance`.
- Dodatkowe starty sprawdzają rAF/PerformanceObserver przy CPU ×4 i świeżym kontekście, lecz bez ograniczenia sieci. Nie są to pomiary terenowe ani wydajność konkretnego telefonu.
- `noJsMainText` i pliki tras `.txt` pochodzą z `innerText` dokumentu bez JS. Zamknięte details mogą nie być uwzględnione w widocznym tekście; ich istotną treść sprawdzano w źródłach i interakcjach. Liczników widocznych słów nie należy utożsamiać z całym tekstem DOM.
- `smallTargets` oznacza wysokość poniżej 44 px, nie automatyczne naruszenie WCAG AA. Wskazane przez axe incomplete nie zostały zamienione na wynik pass.
- Poppler nie był dostępny; próba instalacji `pdftopng` nie powiodła się na Windows (błąd budowania zależności). Pełny przegląd obrazów wykonano dostępnym PyMuPDF 1.28.2, skala renderu 1,25. Pliku produkcyjnego nie edytowano ani nie eksportowano ponownie.
- Publiczne `/ready` sprawdza skonfigurowaną gotowość kontaktu, nie połączenie SMTP ani odbiór wiadomości. Nie wysłano żadnego rzeczywistego kontaktu, nie uruchomiono modelu/CRM i nie wykonywano deployu.
- Nie uruchamiano ponownie całej historycznej walidacji backend/frontend/Docker: to audyt bez zmiany aplikacji. Wyniki 150 pytest, 221 Angular i pozostałych bramek w FINAL_IMPLEMENTATION_REPORT są wynikami wcześniejszej implementacji, nie nowymi wynikami tego audytu. Odczyt wrappera GitHub workflow nie zwrócił przebiegów i nie stanowi potwierdzenia bieżącego CI.
- Brak danych GSC, RUM/CrUX, rzeczywistych leadów, fizycznego NVDA/VoiceOver, PDF/UA i pełnego przeglądu prawnego. Nie deklarowano zmierzonego wzrostu konwersji, field CWV ani pełnej zgodności WCAG.

## Korekty narzędzi audytowych

W `interactions.json` zachowano dwa pierwsze wyniki `passed: false`, aby nie nadpisywać historii:

1. Kontrola kontaktu RAG próbowała kliknąć także odnośnik źródłowy „Projekt własny”, schowany w zamkniętym dokumencie, zamiast ograniczyć się do widocznych CTA sprzedażowych. Poprawiony zakres w `followup.json` potwierdza prawidłowe CTA RAG. Ukryty link do samego kontaktu jest osobnym szczegółem redakcyjnym.
2. Test pobrania wywołał `response.body()` po zamknięciu kontekstu przeglądarki, powodując „Response has been disposed”. Powtórzenie pobiera dane przed zamknięciem i potwierdza plik oraz natywne details/no-JS/PDF.

Uzupełniający skrypt accessibility początkowo wybierał wszystkie `header`, zamiast `.site-header`; skorygowano selektor i ukończono test. To błędy harnessu, nie trzy awarie strony. Podobnie zrzut wykonany natychmiast po przewinięciu może uchwycić trwające reveal; wnioski o sekcji proof oparto na `home-proof-settled-1440.png`, po zakończeniu animacji.

## Źródła kodu do najważniejszych ustaleń

Wszystkie poniższe linki przypinają sprawdzony commit, aby lokalna zmiana gałęzi nie zmieniała znaczenia odniesienia.

- [Hydration i inicjalizacja](https://github.com/piotrbarabasz/ai-software-studio/blob/8ccc20c23c11f32f54d3e677455330e14f4eac3c/frontend/src/app/app.config.ts).
- [Definicja pierwszego etapu](https://github.com/piotrbarabasz/ai-software-studio/blob/8ccc20c23c11f32f54d3e677455330e14f4eac3c/frontend/src/app/core/content/first-stage.pl.ts).
- [Rejestr materiałów](https://github.com/piotrbarabasz/ai-software-studio/blob/8ccc20c23c11f32f54d3e677455330e14f4eac3c/frontend/src/app/core/content/evidence.pl.ts).
- [Widok źródeł, details i pobrań](https://github.com/piotrbarabasz/ai-software-studio/blob/8ccc20c23c11f32f54d3e677455330e14f4eac3c/frontend/src/app/shared/engineering-artifact.component.html).
- [Kontrakty Voice/agent](https://github.com/piotrbarabasz/ai-software-studio/blob/8ccc20c23c11f32f54d3e677455330e14f4eac3c/frontend/src/app/core/content/demo-artifacts.ts).
- [Granica RAG](https://github.com/piotrbarabasz/ai-software-studio/blob/8ccc20c23c11f32f54d3e677455330e14f4eac3c/backend/app/rag/service.py), [workflow CRM](https://github.com/piotrbarabasz/ai-software-studio/blob/8ccc20c23c11f32f54d3e677455330e14f4eac3c/backend/app/crm/workflow.py), [health/readiness](https://github.com/piotrbarabasz/ai-software-studio/blob/8ccc20c23c11f32f54d3e677455330e14f4eac3c/backend/app/api/health.py).
- [Bramka publikacji i zakaz GitHub href](https://github.com/piotrbarabasz/ai-software-studio/blob/8ccc20c23c11f32f54d3e677455330e14f4eac3c/frontend/scripts/validate-site-artifact.cjs), [walidacja PDF](https://github.com/piotrbarabasz/ai-software-studio/blob/8ccc20c23c11f32f54d3e677455330e14f4eac3c/frontend/scripts/validate-demo-report.cjs).

## Odtworzenie

Skrypty tego audytu są w `scripts/`; nie są dodane do produkcyjnego builda ani CI. Uruchamiać z repo z zainstalowanymi zależnościami testowymi frontend. Skrypty zapisują własne pliki evidence, więc przy porównywaniu kolejnej wersji wskazać osobny katalog, aby zachować ten pomiar. `source-review.py` analizuje przypięte rewizje. `performance.mjs` korzysta z lokalnego narzędzia Lighthouse w `tmp/protolume-audit/tooling` i istniejącego Chromium.

Eksperyment R&D uruchomiono Pythonem 3.12 po sprawdzeniu kodu i bezpiecznym rozpakowaniu ZIP z kontrolą ścieżek, poleceniem `python run.py --output <plik>`. Wynik jest identyczny z opublikowanym `observation.json` po pominięciu daty uruchomienia i dodatkowego pola wersji źródłowej. Publiczna paczka ma hash identyczny ze sprawdzonym plikiem mastera.

## Pełne pomiary porównawcze

Tabele poniżej wygenerowano bezpośrednio z nowych plików JSON i jawnie przepisanej tabeli bazowej poprzedniego audytu. Wysokość to `document.documentElement.scrollHeight`; nie jest miarą konwersji.

### Wysokości wszystkich 15 tras

| Trasa | 390 dawniej | 390 obecnie | 1440 dawniej | 1440 obecnie |
| --- | ---: | ---: | ---: | ---: |
| `/` | 10839 | 6545 | 10382 | 5471 |
| `/demo-ai` | 5213 | 5299 | 4625 | 4654 |
| `/przyklad-demo` | 12812 | 11267 | 7906 | 7046 |
| `/rozwiazania` | 10358 | 3293 | 8159 | 2594 |
| `/rozwiazania/chatbot-ai-dla-firm` | 6029 | 6400 | 4928 | 5860 |
| `/rozwiazania/voice-ai-dla-firm` | 6027 | 6328 | 4886 | 5405 |
| `/rozwiazania/automatyzacja-procesow` | 5876 | 6177 | 4947 | 5466 |
| `/rozwiazania/integracje-whatsapp-crm` | 6058 | 6359 | 4858 | 5417 |
| `/rozwiazania/systemy-agentowe` | 5836 | 6137 | 4809 | 5356 |
| `/dla-software-house` | 5122 | 5870 | 4384 | 4823 |
| `/development` | 6993 | 6163 | 5964 | 4832 |
| `/studio` | 8906 | 4236 | 6962 | 2668 |
| `/rd` | 4172 | 4228 | 3394 | 3081 |
| `/kontakt` | 2689 | 2566 | 1737 | 1861 |
| `/polityka-prywatnosci` | 3457 | 3474 | 3291 | 3291 |

### Sześć nowych przebiegów Lighthouse

| Przebieg | Performance | LCP ms | CLS | TBT ms | Transfer KiB |
| --- | ---: | ---: | ---: | ---: | ---: |
| home-1 | 98 | 1686.8 | 0.000 | 126.5 | 191.8 |
| home-2 | 98 | 1661.1 | 0.000 | 112.5 | 192.1 |
| home-3 | 98 | 1660.8 | 0.000 | 108.0 | 191.2 |
| contact | 99 | 1662.1 | 0.000 | 72.0 | 196.2 |
| rag | 97 | 1811.3 | 0.000 | 165.0 | 187.8 |
| home-desktop | 100 | 371.3 | 0.000 | 0.0 | 191.8 |

### Ręcznie obliczony kontrast dawnego problemu

- H2: tekst RGB(247,247,250), tło RGB(16,19,28): **17,35:1**.
- H3 kart: ten sam tekst, tło RGB(28,33,48): **15,00:1**.
- Wartości dotyczą tych nieprzezroczystych powierzchni, nie wszystkich stanów gradientów/nawigacji. Dane CSS są w `followup.json`.

### Integralność pobranego PDF

SHA-256 pobranego pliku: `72210db10b313bdc5065407f62eed685b0a1e37541119c0b0d16268e00f41aa2`.

## Przygotowanie do commita

Przy zapisie w Git ujednolicono końce linii plików tekstowych do LF i usunięto końcowe białe znaki w sześciu wygenerowanych raportach Lighthouse HTML. Dane pomiarów nie zostały zmienione. Manifest SHA-256 odpowiada plikom po tej normalizacji.
