# WEB-005 — SEO, pomiar konwersji i końcowy QA

**Data:** 18 listopada 2026  
**Status:** implementacja w PR; bez merge i bez deployu produkcyjnego.  
**Repo:** `piotrbarabasz/ai-software-studio`

## 1. Podsumowanie

WEB-005 domyka techniczną warstwę SEO i release QA po WEB-001–WEB-004. Nie jest to redesign treści ani uruchomienie analityki marketingowej.

W istniejącym kodzie SEO jest już zbudowane: 15 publicznych tras prerenderowanych, unikalne metadane route-level, canonical, Open Graph/Twitter, JSON-LD, sitemap, robots, prawdziwe 404 oraz walidacja artefaktu. Dodatkowo deploy ma read-only smoke test całego serwisu.

Najważniejsza luka znaleziona w aktualnym masterze: test po wdrożeniu nadal oczekiwał poprzedniej nawigacji (sześć linków, w tym Kontakt, oraz stare etykiety „Wdrożenia”, „Dla partnerów”, „O Protolume”) i starej struktury strony rozwiązań. Aktualny Angular ma pięć linków nawigacji i osobne CTA „Opisz proces”; Home ma trzy filary, a katalog rozwiązań ma pięć kart usług. Ta rozbieżność mogła powodować fałszywą awarię smoke testu po deployu.

## 2. Zmiany w WEB-005

### A. Synchronizacja deployment smoke z aktualnym interfejsem
- Zaktualizowano kontrakt nawigacji do pięciu linków z `site.pl.ts`; CTA pozostaje osobnym elementem i zachowuje `projectType=mvp_prototype`.
- Smoke test sprawdza trzy filary Home, aktualne etykiety oraz pięć ścieżek usług na `/rozwiazania`.
- Dodano kontrolę rzeczywistych identyfikatorów sekcji zamiast szukania starych anchor-linków.
- Test jednostkowy porównuje listę nawigacji smoke z tablicą `primaryNavigation` w Angularze i sprawdza kontrakt CTA w `site-shell.component.html`. Zmiana menu ma teraz wymagać aktualizacji smoke testu w tym samym PR.

### B. Mocniejsza read-only kontrola SEO produkcji
Rozszerzono `scripts/gcp/seo_live_check.py`. Dla każdej publicznej trasy wymaga:
- dokładnie jednego niepustego `<title>`, jednego H1, jednego meta description i jednego canonical;
- unikalnych title oraz description pomiędzy trasami;
- zgodnych wartości Open Graph i Twitter Card: title, description, canonical URL, zatwierdzony obraz 1200×630 i typ PNG;
- `index, follow`, zgodności z originem `https://protolume.pl`, poprawnych danych JSON-LD i braku niezweryfikowanych danych typu rating/price;
- spójnego build SHA, robots.txt i sitemap.xml.

Testy pokrywają brakujący H1, duplikaty title/description i błędne Open Graph URL.

### C. Release gate
- Cloud Build po istniejącym `deployment-read-only-smoke` uruchamia nowy `production-seo-live-check` z oczekiwanym `$SHORT_SHA`.
- Testy `test_live_seo_check.py` są dodane do kroku testów kontraktów wdrożeniowych.
- Kontrola jest read-only: GET do stron, robots, sitemap; bez POST, bez wysyłania formularza i bez modyfikacji Search Console.
- Bramka raportuje błąd release po deployu, ale nie wykonuje automatycznego rollbacku rewizji. W razie błędu trzeba sprawdzić logi i podjąć kontrolowaną decyzję o revert/redeploy.
- `docs/seo-indexing-runbook.md` opisuje ręczne uruchomienie kontroli dla faktycznie wdrożonego SHA.

## 3. Analityka — decyzja świadomie odroczona

W repozytorium nie znaleziono aktywnego GA4, GTM, gtag ani pipeline'u zdarzeń. Build produkcyjny odrzuca niezatwierdzone skrypty analytics. Dokument `docs/audits/protolume-2026-09-07/DATA_FLOW_MAP.md` stwierdza, że nie ma aktywnego pipeline'u analytics; `RESEARCH_AND_MEASUREMENT_PLAN.md` opisuje plan, a nie wdrożenie.

**Nie dodano trackera i nie osłabiono bramki CSP/artefaktu.** Nie ma potwierdzonego dostawcy, ID pomiarowego, zatwierdzonego przepływu danych, retencji ani rozstrzygniętej warstwy zgód. Wdrożenie GA4/GTM bez tych ustaleń byłoby nieuzasadnione.

Do późniejszej decyzji zachowujemy istniejący, źródłowy kontrakt pomiarowy:
- `proof_view` — co najmniej połowa sekcji widoczna przez sekundę w aktywnej karcie;
- `proof_interaction` — świadoma interakcja z materiałem;
- `source_open`, `artifact_download`;
- `contact_start` — pierwsza świadoma zmiana pola;
- `contact_error` — wyłącznie kategoria błędu z zamkniętej listy;
- `contact_success` — API przyjęło zgłoszenie, co nie dowodzi dostarczenia e-maila ani jakości leada.

Nie wysyłać imienia, e-maila, firmy, wiadomości, budżetu, promptów, surowych wyjątków, pełnego URL/referrera ani identyfikatorów CRM. Nie tworzyć trwałego ID użytkownika ani fingerprintingu. Ewentualny wybór dostawcy wymaga oddzielnej decyzji właściciela, przeglądu DATA_FLOW_MAP, retencji, dostępu i podstaw/zgód.

Wynik biznesowy nadal trzeba odróżniać od zdarzenia przeglądarkowego: faktyczne zgłoszenia i ich kwalifikację mierzyć w uzgodnionym procesie intake, a nie liczbą kliknięć lub samym `contact_success`.

## 4. Co jest już potwierdzone, a czego nie mamy

### Potwierdzone w repo
- 15 tras publicznych w `frontend/src/prerender-routes.txt`.
- Unikalne route metadata, canonical, OG/Twitter, JSON-LD oraz generowanie robots/sitemap.
- Build waliduje artefakty SEO i nie dopuszcza niezatwierdzonych skryptów analitycznych.
- Deploy ma już smoke API, CORS, tras, nawigacji, formularza, 404 i plików odkrywania.

### Historyczne wyniki — nie są pomiarem nowej wersji
Audyt z 9 września dokumentuje 15 tras, 90 kombinacji szerokości bez wykrytego overflow, 30 skanów axe bez violations (ale z unresolved/incomplete wymagającymi oceny ręcznej) i sześć przebiegów Lighthouse z CLS 0. Nie należy traktować tego jako nowego audytu po WEB-004 ani jako danych field Core Web Vitals.

### Brakujące źródła danych
- Brak dostępnych wyników Google Search Console, CrUX/RUM i INP użytkowników.
- Brak zatwierdzonego dostawcy analytics i identyfikatora GA4/GTM.
- Brak aktualnego baseline'u leadów, ich jakości, ofert i konwersji do współpracy.
- Nie potwierdzono produkcyjnej dostawy testowego e-maila w tej sesji.
- Nie wykonano fizycznych testów NVDA/VoiceOver ani pełnego przeglądu prawnego.

## 5. Końcowa checklista release

- [ ] PR WEB-005 przechodzi format, lint, frontend tests, backend tests i build.
- [ ] PR review oraz merge do master.
- [ ] Zatwierdzony deploy produkcyjny.
- [ ] Cloud Build kończy oba read-only smoke: deployment i SEO live check.
- [ ] Potwierdzić 15 tras, canonical, robots, sitemap, JSON-LD, OG/Twitter i wspólny build SHA.
- [ ] W Google Search Console sprawdzić własność domeny, sitemap i raport Pages/Indexing; nie traktować wysłania URL jako gwarancji indeksacji.
- [ ] Wykonać porównywalny Lighthouse mobile/desktop; wyniki lab oddzielić od CrUX/RUM.
- [ ] Ręcznie sprawdzić klawiaturę, powiększenie, kontrast, formularz i czytnik ekranu na fizycznym urządzeniu.
- [ ] Wykonać kontrolowany test dostarczenia e-maila po uzgodnieniu adresu i odbiorcy.
- [ ] Dopiero po decyzji właściciela i przeglądzie danych zaplanować osobny PR na wybraną analitykę.

## 6. Poza zakresem

- Brak merge/deploy, zmian GCP/IAM, aktywacji Google Analytics/GTM, cookies/consent banner, Search Console API, A/B testów lub zmian treści SEO.
- Brak deklaracji wzrostu konwersji, pozycji Google, field CWV, pełnej zgodności WCAG albo dostarczania e-maili.

## 7. Następny krok

Po merge i udanym release należy wykonać ręczne GSC/UX/lead QA. Dopiero po tych danych można podjąć decyzję, czy wdrażać analytics, jaki system wybrać i jaki minimalny zestaw zdarzeń jest potrzebny.
