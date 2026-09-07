# Dowody i metodologia audytu Protolume

Powiązane dokumenty: [audyt](AUDYT.md) i [28 zadań](BACKLOG.md).

**Data pomiarów:** 7 września 2026. Wszystkie testy witryny wykonano na https://protolume.pl, w izolowanych sesjach headless Chromium **151.0.7922.34**. Nie testowano aktywnej sesji użytkownika. Dane w tej paczce to publiczna treść witryny i wyniki diagnostyczne.

## Wersja produkcji a repozytorium

Wszystkie 15 publicznych stron i 404 miały meta `protolume-build-sha=8386de6`. Lokalny HEAD: `2ff41c3` (`ux update 4`). Diff zawiera 25 plików, 493 dodane i 181 usuniętych linii, m.in. kontekst `dark-section`, warianty kart i komponent `home-proof-visual`.

**Wniosek:** produkcyjnego kontrastu i liczby wizualizacji nie można oceniać wyłącznie na podstawie lokalnego HEAD. Audyt dotyczy widocznej produkcji. Sprawdzając mechanizm demo i bootstrapu porównano także kod odpowiadający produkcyjnemu commitowi. Nie wykonano deploymentu.

## Pokrycie stron

Wysokość jest w CSS px i obejmuje stopkę. Desktop 1440 × 1000; mobile 390 × 844. Wszystkie strony mają polski język dokumentu. Kontrole 360, 430, 921 i 1024 px obejmowały dodatkowo geometrię wszystkich 15 stron. Nie wykryto poziomego overflow dokumentu. Nie jest to test fizycznej klawiatury ekranowej, Safari ani wszystkich możliwych stanów aplikacji.

| Trasa | HTTP | Desktop wysokość | Mobile wysokość | Pierwszy ekran |
|---|---:|---:|---:|---|
| `/` | 200 | 10 382 | 10 839 | [desktop](evidence/home-1440-top.png) · [mobile](evidence/home-390-top.png) |
| `/rozwiazania` | 200 | 8159 | 10 358 | [desktop](evidence/rozwiazania-1440-top.png) · [mobile](evidence/rozwiazania-390-top.png) |
| `/rozwiazania/chatbot-ai-dla-firm` | 200 | 4928 | 6029 | [desktop](evidence/rozwiazania_chatbot-ai-dla-firm-1440-top.png) · [mobile](evidence/rozwiazania_chatbot-ai-dla-firm-390-top.png) |
| `/rozwiazania/voice-ai-dla-firm` | 200 | 4886 | 6027 | [desktop](evidence/rozwiazania_voice-ai-dla-firm-1440-top.png) · [mobile](evidence/rozwiazania_voice-ai-dla-firm-390-top.png) |
| `/rozwiazania/automatyzacja-procesow` | 200 | 4947 | 5876 | [desktop](evidence/rozwiazania_automatyzacja-procesow-1440-top.png) · [mobile](evidence/rozwiazania_automatyzacja-procesow-390-top.png) |
| `/rozwiazania/integracje-whatsapp-crm` | 200 | 4858 | 6058 | [desktop](evidence/rozwiazania_integracje-whatsapp-crm-1440-top.png) · [mobile](evidence/rozwiazania_integracje-whatsapp-crm-390-top.png) |
| `/rozwiazania/systemy-agentowe` | 200 | 4809 | 5836 | [desktop](evidence/rozwiazania_systemy-agentowe-1440-top.png) · [mobile](evidence/rozwiazania_systemy-agentowe-390-top.png) |
| `/demo-ai` | 200 | 4625 | 5213 | [desktop](evidence/demo-ai-1440-top.png) · [mobile](evidence/demo-ai-390-top.png) |
| `/development` | 200 | 5964 | 6993 | [desktop](evidence/development-1440-top.png) · [mobile](evidence/development-390-top.png) |
| `/dla-software-house` | 200 | 4384 | 5122 | [desktop](evidence/dla-software-house-1440-top.png) · [mobile](evidence/dla-software-house-390-top.png) |
| `/studio` | 200 | 6962 | 8906 | [desktop](evidence/studio-1440-top.png) · [mobile](evidence/studio-390-top.png) |
| `/rd` | 200 | 3394 | 4172 | [desktop](evidence/rd-1440-top.png) · [mobile](evidence/rd-390-top.png) |
| `/przyklad-demo` | 200 | 7906 | 12 812 | [desktop](evidence/przyklad-demo-1440-top.png) · [mobile](evidence/przyklad-demo-390-top.png) |
| `/kontakt` | 200 | 1737 | 2689 | [desktop](evidence/kontakt-1440-top.png) · [mobile](evidence/kontakt-390-top.png) |
| `/polityka-prywatnosci` | 200 | 3291 | 3457 | [desktop](evidence/polityka-prywatnosci-1440-top.png) · [mobile](evidence/polityka-prywatnosci-390-top.png) |
| Losowy nieistniejący adres | 404 | 1268 | 1537 | [desktop](evidence/audyt-nieistniejaca-strona-20260907-1440-top.png) · [mobile](evidence/audyt-nieistniejaca-strona-20260907-390-top.png) |

Pełne dane geometrii, title, description, canonical, OG, nagłówków, linków, pól i statusów: [pages.json](evidence/pages.json). W tym zbiorze `innerText` i geometria zamkniętych kontrolek nie oznaczają, że ukryta treść FAQ jest treścią widoczną. Nie używano liczby słów ze snapshotu jako pełnej długości artykułu.

Zrzuty całych stron oraz surowe odpowiedzi HTML zebrano również lokalnie w `tmp/protolume-audit/`; pakiet audytu zawiera pierwsze ekrany, najważniejsze stany i snapshoty tekstowe. To celowe ograniczenie objętości, nie brak przeglądu dalszych sekcji.

## Lighthouse — sześć pomiarów

**Wersja 13.4.1. Mobile:** 412 × 823, DPR 1,75, symulacja throttlingu: RTT 150 ms, przepustowość 1638,4 Kbps, CPU ×4; pełne ustawienia w JSON. Nowe profile przeglądarki między uruchomieniami. **Desktop:** własna konfiguracja 1440 × 1000, DPR 1, RTT 40 ms, przepustowość 10240 Kbps, CPU ×1, `throttlingMethod=simulate`; nie przedstawiać tego jako domyślnego desktopowego preset Lighthouse.

| Pomiar | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | Transfer |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| [Home mobile 1](evidence/home-1.lighthouse.html) | 73 | 96 | 100 | 100 | 2,042 s | 0,916 | 65,5 ms | 191 KiB |
| [Home mobile 2](evidence/home-2.lighthouse.html) | 73 | 96 | 100 | 100 | 2,004 s | 0,916 | 57 ms | 191 KiB |
| [Home mobile 3](evidence/home-3.lighthouse.html) | 87 | 96 | 100 | 100 | 1,946 s | 0 | 442 ms | 191 KiB |
| [Kontakt mobile](evidence/contact.lighthouse.html) | 74 | 100 | 100 | 100 | 1,948 s | 0,916 | 59 ms | 183 KiB |
| [RAG mobile](evidence/rag.lighthouse.html) | 75 | 100 | 100 | 100 | 1,766 s | 0,916 | 39 ms | 170 KiB |
| [Home desktop](evidence/home-desktop.lighthouse.html) | 90 | 96 | 100 | 100 | 0,497 s | 0 | 4,5 ms | 191 KiB |

Mobile home: mediana Performance **73**, LCP **2,004 s**, CLS **0,916**, TBT **65,5 ms**. Rozrzut jest istotny: jeden przebieg nie zarejestrował CLS, za to miał większy TBT. To nie dowodzi występowania problemu u każdego odwiedzającego; dowodzi możliwości odtworzenia go w kilku niezależnych wejściach. Desktop miał Speed Index około 5,1 s pomimo niskiego LCP, co może być związane z ruchomym obszarem hero. Nie wyciągnięto z tego samodzielnego wniosku o realnej szybkości odbioru przez klienta.

Źródło maszynowe, w tym warnings, ustawienia, metryki i wskazane elementy: [performance.json](evidence/performance.json). Wszystkie sześć zapisanych raportów zakończyło pomiar bez `runtimeError` i bez `runWarnings`. Dwa wcześniejsze zatrzymania skryptu dotyczyły sprzątania profilu Windows po zapisaniu wyniku, a nie błędu pomiaru strony; kolejne uruchomienia wznowiono z zapisanymi wynikami i osobnymi profilami.

Nie pozyskano danych CrUX/RUM ani INP użytkowników. Accessibility/SEO 100 w Lighthouse nie oznaczają pełnej zgodności WCAG ani wysokiej skuteczności organicznej. Nie wykonano PageSpeed Insights z danymi field.

## Dowód przebudowy DOM

Niezależny test: mobile 390 × 844, CPU ×4 przez CDP, MutationObserver i PerformanceObserver uruchomione przed skryptami aplikacji. Żadnych zmian HTML aplikacji ani ukrywania elementów na potrzeby testu.

| Moment | H1 w `main` | Wysokość `main` | Położenie stopki |
|---|---|---:|---:|
| około 216 ms | Tak | 8745,9 px | Treść prerenderowana |
| około 1363,8 ms | Nie | **0 px** | **69 px** od góry viewportu |
| około 1502,9 ms | Tak | 9915,5 px | 9984,5 px |

Zarejestrowany layout shift około 1551,7 ms: **0,918**, bez `hadRecentInput`, element stopki. Ta wartość pochodzi z osobnej próby i nie powinna być mylona z medianą Lighthouse. Dane: [followup.json](evidence/followup.json). Mocna hipoteza przyczyny: destrukcja/przebudowa prerenderowanego DOM bez client hydration; do potwierdzenia przez zmianę implementacji i ponowny pomiar.

Wstępny crawler miał pomocniczy observer sumy layout shifts, którego rejestracje kumulowały się przy nawigacji. **Te liczby zostały wyłączone z dostarczonych metryk i nie są podstawą żadnej oceny.** Dane performance pochodzą wyłącznie z Lighthouse i opisanego niezależnego testu. To ważne rozróżnienie między diagnostyką a wiarygodnym pomiarem.

## Dostępność i interakcje

**axe:** 15 stron, 390 × 844, `reducedMotion=reduce`, tagi WCAG 2 A/AA, 2.1 AA i 2.2 AA. W stanie początkowym jedna reguła zgłoszona na home, dotycząca trzech elementów:

| Element | Tekst / tło | Kontrast | Próg dla badanego tekstu |
|---|---|---:|---:|
| `#evidence-teaser-title` | `#11131a` / `#171b26` | 1,07:1 | 3:1 |
| Pierwszy H3 `.evidence-teaser-card` | `#11131a` / `#242936` | 1,27:1 | 3:1 |
| Drugi H3 `.evidence-teaser-card` | `#11131a` / `#242936` | 1,27:1 | 3:1 |

[Kontrast desktop](evidence/proof-contrast-1440.png) · [kontrast mobile](evidence/proof-contrast-390.png).

Brak zgłoszonych violations na pozostałych 14 stronach nie jest pełnym audytem zgodności. Axe wskazał też elementy do ręcznej oceny (`incomplete`), szczególnie złożone tła/kontrast i semantykę. Nie przebadano czytnikiem ekranu wszystkich stanów.

**Potwierdzone działania:**

- Pierwszy Tab trafia na „Przejdź do treści”; Enter ustawia focus w `main-content`.
- Otwarcie mobile menu przenosi focus do pierwszego linku, ustawia `aria-expanded=true`, blokuje scroll i treść w tle. Escape zamyka menu i oddaje focus do przycisku. [Zrzut menu](evidence/menu-390.png).
- FAQ otwiera się klawiszem Enter; natywna semantyka `details/summary` działa.
- Niepoprawny formularz pokazuje błędy z `aria-describedby` i alertem. Po wykonaniu zaplanowanego callbacku focus trafia na `contact-form-error-summary` w widocznym obszarze. Nie wysłano POST; testowa sesja dodatkowo blokowała wszystkie próby POST.
- Temat z CTA Voice AI jest faktycznie `custom_web_app`; to błędne dopasowanie semantyczne, nie błąd odczytu query.
- Po pytaniu o koszt chatbota w symulacji nie wysłano żądań modelu/retrievalu. Odpowiedź oraz źródła są przygotowanymi tekstami.
- Pytanie „Czy Protolume sprzedaje części do rowerów?” wyświetla fallback i informację o granicach symulacji, także bez requestu.
- Po wyborze pytania na mobile góra wyniku była **961,8 px poniżej górnej krawędzi viewportu** o wysokości 844 px; użytkownik pozostawał przy kontrolkach pytań. [Zrzut po kliknięciu](evidence/demo-after-click-390.png).

Szczegóły i teksty odpowiedzi: [diagnostics.json](evidence/diagnostics.json). Potwierdzenie fokusu po callbacku, FAQ, mobile result i startu DOM: [followup.json](evidence/followup.json). W `diagnostics.json` szybki pierwszy odczyt fokusu po submit może pokazywać pusty id; miarodajna jest późniejsza, zweryfikowana próbka z followup.

## SEO, indeksowanie i sieć

- 15 publicznych tras HTTP 200; nieistniejąca trasa HTTP 404.
- Jeden H1 i treść w surowym HTML każdej trasy. JSON-LD obecne przed wykonaniem JavaScriptu.
- Publiczne strony: `index, follow`; 404: `noindex, follow`, canonical `/404`.
- [robots.txt](evidence/robots.txt) pozwala na crawling i wskazuje [sitemap.xml](evidence/sitemap.xml) z 15 trasami.
- Wszystkie sprawdzone lokalne linki z kotwicami miały odpowiadające id w zapisanym HTML. Nie deklaruje to sprawności dowolnego zewnętrznego linku ani przyszłych URL-i.
- Nie zarejestrowano requestów do fontów, sceny Spline ani zewnętrznych trackerów przy odwiedzaniu 15 stron. Brak cookies, kluczy localStorage i sessionStorage w badanych sesjach. Formularza nie wysłano, więc sieciowa ścieżka API/SMTP nie jest tu testem dostarczenia wiadomości.
- Production CSP pozwala na rzeczywisty backend kontaktowy; obecność restrykcyjnych nagłówków jest faktem technicznym, nie dowodem pełnego bezpieczeństwa systemu.

## Źródła interpretacji

Wnioski o witrynie opierają się na własnych obserwacjach oraz kodzie repozytorium. Normatywne i techniczne interpretacje sprawdzono w źródłach pierwotnych:

- Przyczyna możliwego migotania prerenderu: [Angular — Hydration](https://angular.dev/guide/hydration).
- Kryteria kontrastu, targetów i ruchu: [WCAG Contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).
- Rozdzielenie lab/field i progi CWV: [Web Vitals](https://web.dev/articles/vitals).
- Canonical i dane biznesowe: [Google — canonicalization](https://developers.google.com/search/docs/crawling-indexing/canonicalization), [LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business).
- Zmiany wsparcia FAQ: [Google Search — dokumentacja i aktualizacje](https://developers.google.com/search/updates).
- Ramy konsultacji prywatności: [RODO, art. 12–13 — EUR-Lex](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng/).

Wzorce benchmarku oceniono na [thoughtbot](https://thoughtbot.com/), [jego case studies](https://thoughtbot.com/case-studies) oraz [Evil Martians](https://evilmartians.com/). Ich deklarowanych wyników, skali i cen nie przeniesiono na Protolume.

## Granice wyniku

Nie wykonano zmian w aplikacji, wysyłki kontaktu, publikacji, zlecenia płatnej usługi ani generowania materiałów udających istniejące wdrożenia. Nie było dostępu do rzeczywistych rozmów sprzedażowych i danych konwersji. Nie wykonano pełnej kontroli prawnej, testu czytników ekranu lub realnych telefonów. Każde z tych ograniczeń ma wskazany dalszy sposób weryfikacji w audycie i backlogu.
