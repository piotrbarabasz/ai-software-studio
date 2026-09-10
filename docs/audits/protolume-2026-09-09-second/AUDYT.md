# Drugi niezależny audyt Protolume

Przegląd produkcji z 9 września 2026, uzupełniony 10 września czasu polskiego. Raport zamknięty 10 września. Zakres: UX/UI, CRO, oferta, wiarygodność, kod i publiczne materiały. To ocena obecnego stanu, bez implementacji kolejnej przebudowy.

## Executive summary

**Protolume wygląda dziś jak wiarygodne, małe studio inżynierskie prowadzone przez jedną odpowiedzialną osobę. Można rozważyć powierzenie mu ograniczonego etapu lub modułu. Strona nadal daje za mało dowodów, aby na jej podstawie powierzyć mu krytyczny proces AI od początku do końca.**

Największy postęp dotyczy działania strony i porządkowania decyzji. Zniknął odtworzony wcześniej problem hydration/CLS. Home i hub są znacznie krótsze, formularz jest wyżej, Development i oferta partnerska pokazują rzeczywisty kod, a PDF jest faktycznym, czytelnym plikiem. To poprawa doświadczenia nowego klienta, niezależna od liczby zamkniętych zadań.

Największe ograniczenia sprzedaży to nadal: brak wykonanego przepływu AI/integracji, niezamknięte warunki „demo w 7 dni” oraz zbyt podobne, opisowe landingi. Dodatkowo najlepszy istniejący dowód techniczny jest słabiej eksponowany na home niż dwie symulacje. Nie rekomenduję kolejnego redesignu, nowych kategorii ani dalszej rozbudowy infrastruktury do prezentowania materiałów, których jeszcze nie ma.

**Wersje sprawdzone niezależnie:** `origin/master` = `8ccc20c23c11f32f54d3e677455330e14f4eac3c`; wszystkie 15 stron produkcyjnych deklarowało `8ccc20c`; API `/health` zwróciło ten sam skrót. Wszystkie 15 podlinkowanych plików evidence pobranych z produkcji ma identyczne SHA-256 jak źródła tego mastera. To potwierdza publikację objętych przeglądem zmian. Nie oznacza potwierdzenia dostarczenia poczty ani kompletnego audytu infrastruktury. [Wersje](evidence/versions.json), [crawl](evidence/crawl.json), [API i interakcje](evidence/interactions.json).

Lokalny checkout użytkownika wskazywał starsze `0d38ef8`; nie uznałem go za aktualny master. Kod aktualnego mastera przejrzałem w osobnym, odłączonym worktree. Starsze zdania „nie wdrożono” w dokumentacji implementacji są zapisami wcześniejszego pomiaru, a nie opisem obecnej produkcji. Końcowy odczyt 10 września o 09:10:50 UTC ponownie potwierdził ten sam zdalny master i identyczną treść HTML home według SHA-256. [Kontrola końcowa](evidence/final-version-check.json). Szczegóły zakresu i ograniczeń: [DOWODY.md](DOWODY.md).

## Previous audit vs current state

Statusy poniżej dotyczą problemu widzianego przez klienta. Nie są automatycznym przepisaniem statusów 28 tasków: zadanie może mieć niezamknięte kryterium operacyjne, mimo że jego część UX już działa.

| Poprzedni problem / zadania | Status | Obecny stan |
| --- | --- | --- |
| Kontrast sekcji proof, UX-001 | SOLVED | Dawne nagłówki około 1,07–1,27:1 są czytelne: obecnie około 17,35:1 dla H2 i 15,00:1 dla nagłówków kart. Dotyczy wskazanego problemu, nie certyfikacji całego serwisu. |
| Hydration, znikanie treści, CLS; UX-002 | SOLVED | 6 nowych pomiarów Lighthouse z CLS 0; dodatkowo 9 zimnych startów bez utraty H1 ani zerowej wysokości main po pojawieniu treści. |
| Oferta pierwszego etapu i koszt; UX-003/026 | PARTIALLY_SOLVED | Jest wspólna definicja rezultatu i wycena przed pracą. Nadal brakuje decyzji o płatności, początku siedmiu dni i znaczeniu NO-GO; pozostaje sprzeczne copy. |
| CTA i temat kontaktu; UX-004 | IMPROVED | CTA w treści siedmiu ścieżek zachowują temat. Globalny header nadal ustawia ogólne `mvp_prototype`, a etykieta źródła kontaktu nie zmienia się po ręcznej zmianie tematu. |
| Hub wyboru; UX-005 | SOLVED | Pięć krótkich kategorii zamiast wielokrotnego katalogu. Pierwsza kategoria na mobile około y=339 px. |
| Nawigacja i nazwy usług; UX-006 | IMPROVED | Aplikacje oddzielone od usług AI. „Rozmowy w CRM” nie mówi od razu o WhatsApp; różnica automatyzacji i agentów wymaga dopowiedzenia. |
| Długość home i PRZED/PO; UX-007 | IMPROVED | Home 390 px: 10 839 → 6545 px. PRZED/PO czytelne, ale nadal jest ilustracją, podobną do schematu w hero. |
| Publiczna symulacja; UX-008 | IMPROVED | Uczciwa nazwa, brak fałszywej pewności/czasu, działający fallback, reset i fokus. Nie staje się przez to działającym AI. |
| System proof; UX-009 | PARTIALLY_SOLVED | Klasyfikacja i źródła istnieją. Rejestr porządkuje twierdzenia, lecz nie wytwarza dowodów produktu ani klienta. |
| Rzeczywisty RAG; UX-010 | NOT_SOLVED | Jest lokalne wyszukiwanie i nieaktywny kontrakt dostawcy. Brak publicznego query → retrieval → LLM → citations. |
| Landing RAG; UX-011 | IMPROVED | Wcześnie dostępny dokument, cytat i brak informacji. Cytaty są przypisane ręcznie, nie pochodzą z rzeczywistego retrieval. |
| Automatyzacja i WhatsApp/CRM; UX-012/014 | NOT_SOLVED | Foundation istnieje, ale klient nadal nie widzi prawdziwego zapisu ani odczytu stanu CRM. |
| Voice; UX-013 | NOT_SOLVED | Brak publicznego nagrania. Prywatny komponent z plikiem ciszy nie zmienia tej oceny. |
| Agenci; UX-015 | NOT_SOLVED | Brak dowodu rzeczywistego wykonania. Prywatny trace ze stanami zadanymi ręcznie jest narzędziem prezentacji. |
| Development; UX-016 | IMPROVED | Konkretniejsze rezultaty, kod własny, API/testy/PR do sprawdzenia. Część szczegółów nadal wyprzedza korzyść biznesową. |
| Software house; UX-017 | IMPROVED | Repo, PR, review, odbiór i handover są czytelne. Dowód dotyczy własnego formularza/API, nie dostarczonego modułu AI. |
| Studio; UX-018 | IMPROVED | Nazwana osoba, jedna sekcja współpracy, własny projekt na początku proof, bio schowane w details. 8906 → 4236 px na mobile. |
| R&D; UX-019 | IMPROVED | Jeden odtwarzalny eksperyment i oba błędy zamiast samych deklaracji. Nadal mała próba i prosta metoda. |
| Kontakt; UX-020 | IMPROVED | Pierwsze pole 681 → 419 px; firma/budżet opcjonalne, minimum opisu jawne, błędy zachowują dane. Z kontekstem usługi pole jest na y=504 px. |
| Raport; UX-021 | IMPROVED | Jedna warunkowa decyzja, rzeczywisty czterostronicowy PDF, prawdziwe znaczenie statusów. WWW wciąż bardzo długie. |
| Mobile i accessibility; UX-022 | IMPROVED | 90 układów bez overflow, działająca klawiatura/menu. Pozostają drobny błąd numeracji, niepełne rozstrzygnięcia axe i testy fizycznych technologii asystujących. |
| SEO; UX-023 | IMPROVED | Spójne, unikalne metadane, canonical, prawdziwe 404. Podobieństwo intencji usług pozostaje ryzykiem treściowym, nie udowodnioną kanibalizacją. |
| Kalendarz; UX-024 | NOT_SOLVED | Nie dodano, istnieje e-mail i formularz. Nie uznaję braku kalendarza za potwierdzoną przeszkodę sprzedażową. |
| Prywatność; UX-025 | PARTIALLY_SOLVED | Techniczna mapa przepływu jest bogatsza. Publiczny dokument nadal wymaga potwierdzenia faktów właściciela. |
| Case studies; UX-027 | NOT_SOLVED | Szablon zbierania materiału nie zastępuje zgody klienta i wyniku rzeczywistego wdrożenia. |
| Pomiar i badania; UX-028 | NOT_SOLVED | Plan istnieje; w tym audycie nie otrzymano wyników lejka, GSC, wywiadów ani badań użytkowników. |
| Dawny brak publikacji obecnego kodu | NO_LONGER_RELEVANT | Publiczny frontend, API i pobierane materiały odpowiadają najnowszemu sprawdzonemu masterowi. Pozostałych bramek historycznych nie zamykam na podstawie samego SHA. |
| Nowa ilustracja home: numer 02 | REGRESSION | Na 390 px liczba łamie się na 0 i 2. Lokalny defekt nowego komponentu, bez blokowania zadania użytkownika. |

Największe zmiany geometryczne, przy tych samych szerokościach:

| Strona | Mobile 390: wcześniej → teraz | Desktop 1440: wcześniej → teraz |
| --- | --- | --- |
| Home | 10 839 → 6545 px (−40%) | 10 382 → 5471 px (−47%) |
| Rozwiązania | 10 358 → 3293 px (−68%) | 8159 → 2594 px (−68%) |
| Development | 6993 → 6163 px (−12%) | 5964 → 4832 px (−19%) |
| Studio | 8906 → 4236 px (−52%) | 6962 → 2668 px (−62%) |
| Raport | 12 812 → 11 267 px (−12%) | 7906 → 7046 px (−11%) |

RAG i strona partnerska urosły po dodaniu dowodów. Sam wzrost długości nie jest regresją; oceniam wartość dodanej treści. Pełna tabela 15 tras jest w DOWODY.md.

## Scores

Oceny eksperckie, nie wyniki badania rynku ani zmierzona konwersja. Overall jest oceną całości, nie średnią arytmetyczną. Wcześniejszy audyt nie wystawił osobnych ocen /10 dla accessibility, performance i proof quality.

| Kategoria | Poprzednio | Teraz | Uzasadnienie |
| --- | ---: | ---: | --- |
| Overall | 6,3 | **7,4** | Solidna strona małego studia; ograniczenia przesunęły się z podstaw UX na ofertę i dowody. |
| UX | 6,5 | 7,7 | Znacznie prostsze wejścia, lepszy kontakt; nadal powtarzane sekcje usług. |
| UI | 7,2 | 8,0 | Spójna typografia i hierarchia, naprawiony proof; kilka drobnych usterek. |
| Clarity | 6,0 | 7,1 | Zrozumiały problem i rezultat, nieostre warunki pierwszego etapu. |
| Trust | 6,0 | 6,9 | Nazwana osoba i sprawdzalny kod; brak klienta i wykonanej integracji AI. |
| Conversion | 5,8 | 6,6 | Mniej tarcia, nadal niepewność „co kupuję i co faktycznie działa?”. Ocena potencjału. |
| Technical credibility | 5,5 | 7,6 | Źródła, testy i odtwarzalność dają realną podstawę rozmowy technicznej. |
| Mobile | 6,2 | 7,9 | Brak wykrytego overflow i CLS, krótsze kluczowe trasy; długie landingi. |
| SEO | 7,0 | 7,6 | Technicznie uporządkowane; unikalność dowodów/intencji nadal ograniczona. |
| Accessibility | — | 7,6 | Lepsze interakcje i kontrast wskazanego bloku; część kontroli ręcznych otwarta. |
| Performance | — | 9,0 | Bardzo dobre nowe wyniki laboratoryjne, bez danych field CWV. |
| Proof quality | — | **5,2** | Dobry dowód procesu inżynierskiego; słaby dowód działania oferowanych produktów AI. |

## Top 10 remaining issues

P1 = największa przeszkoda w decyzji zakupowej; P2 = kolejność po niej; P3 = drobne porządki. Effort to orientacyjny nakład, nie zobowiązanie handlowe. Pewność dotyczy obserwacji; wpływ na konwersję wymaga pomiaru.

### 1. Oferta pięciu usług AI nie ma jeszcze dowodu wykonania

- **Problem:** Klient ogląda przede wszystkim opisy i symulacje.
- **Evidence:** Brak audio/video na publicznych trasach; RAG przypisuje gotowe cytaty; CRM/Voice/agent pozostają nieaktywne lub w prywatnym preview. Nowo odtworzony eksperyment ma `modelCalls: 0`. [Źródła i liczby](evidence/source-review.json), [R&D](evidence/research-rerun.json).
- **Impact:** Największy skok zaufania nadal wymaga rozmowy i wiary w obietnicę. Kod formularza nie rozstrzyga jakości AI.
- **Recommendation:** Jeden rzeczywisty, ograniczony przepływ z wejściem, wynikiem, błędem i weryfikacją. Domyślnie wiadomość → propozycja → zgoda → sandbox CRM → odczyt rekordu, ponieważ wspiera home, automatyzację i integracje. Zmienić kolejność na RAG, jeżeli kwalifikowane zapytania wskazują ten popyt.
- **Priority:** P1. **Confidence:** wysoka co do luki, średnia co do wyboru pierwszej usługi. **Effort:** kilka dni do 1–2 tygodni po uzyskaniu dostępów; zależne od zakresu i praw publikacji.

### 2. „Demo w 7 dni” nadal nie jest jednoznacznym produktem startowym

- **Problem:** Symulacja, prezentacja i płatny/bezpłatny pierwszy etap nie składają się w całkowicie jasną sekwencję.
- **Evidence:** `/demo-ai`, sekcja „Co otrzymujesz po siedmiu dniach”, nadal proponuje potem „przygotować pierwszy etap”. Fallback symulacji obiecuje pokaz na materiałach firmy podczas bezpłatnej prezentacji, chociaż wspólna definicja prezentacji mówi o istniejącym materiale. Nie określono dni roboczych/kalendarzowych ani punktu startu.
- **Impact:** Użytkownik nie wie, czy zamawia rozmowę, widok interfejsu czy wykonany, sprawdzony scenariusz.
- **Recommendation:** Właściciel zatwierdza jeden opis warunków; następnie podmienić sprzeczne zdania. Zachować „wycena przed rozpoczęciem” i brak zobowiązania przy formularzu. Nie publikować wymyślonej ceny.
- **Priority:** P1. **Confidence:** wysoka. **Effort:** 1–2 godziny decyzji właściciela i około pół dnia redakcji.

### 3. Cztery landingi nadal sprzedają bardzo podobny opis procesu

- **Problem:** Voice, automatyzacja, integracje i agenci powtarzają układ problem → pięć kroków → cztery grupy zakresu → integracje → bezpieczeństwo → pięć FAQ.
- **Evidence:** Każdy ma ponad 6100 px wysokości na 390 px; tylko RAG otrzymał odrębny sprawdzalny element. Agentowy warunek „czy wynik nie sugeruje pełnej autonomii” ocenia wrażenie, nie poprawność zadania.
- **Impact:** Trudniejszy wybór usługi i scroll bez nowej informacji. Podobieństwo intencji osłabia odrębność landingów.
- **Recommendation:** Usunąć powtórzone punkty procesu i FAQ; zostawić unikalne pytania zakupowe. Nie tworzyć pięciu nowych layoutów. Zróżnicować rodzaj dowodu dopiero wraz z realnym materiałem; w integracjach nie przedstawiać agenta jako koniecznego składnika prostego workflow.
- **Priority:** P1. **Confidence:** wysoka co do powtórzeń, średnia co do utraty leadów. **Effort:** 1–2 dni redakcji, bez nowego systemu komponentów.

### 4. Home eksponuje słabsze dowody i kilka razy objaśnia ich ograniczenia

- **Problem:** Sekcja „Zobacz zamiast czytać” zawiera dwie symulacje. Własny kod nie jest jednym z jej dwóch głównych materiałów.
- **Evidence:** Każda karta ma etykietę i osobny opis ograniczeń, pod nimi kolejne zdanie o braku case study. Wcześniej hero i PRZED/PO dwukrotnie pokazują zbliżony przepływ wiadomości. [Widok po zakończeniu animacji](evidence/home-proof-settled-1440.png).
- **Impact:** Nowy klient może zapamiętać przede wszystkim listę tego, czego nie potwierdzono.
- **Recommendation:** Jedno krótkie oznaczenie pochodzenia i istotne ograniczenie przy każdym materiale; szczegóły pod rozwinięciem. Zastąpić jedną z dwóch równorzędnych kart istniejącym projektem własnym lub przenieść do niego wyraźny link. Nie dodawać trzeciej sekcji ani nie ukrywać fikcyjnego charakteru raportu.
- **Priority:** P2. **Confidence:** wysoka co do hierarchii, średnia co do wyniku CRO. **Effort:** pół dnia; wybór karty sprawdzić w krótkim badaniu.

### 5. Fakty operacyjne i formalne nie domykają zaufania do większego projektu

- **Problem:** Znana jest osoba odpowiedzialna, lecz mniej wiadomo o dostępności, ciągłości pracy i aktualności publicznych informacji prawnych.
- **Evidence:** Privacy z datą 2026-07-17 podaje „Polska, Wrocław” jako adres korespondencyjny. Checkbox mówi o zgodzie na kontakt, a polityka wskazuje również podstawę przedkontraktową i uzasadniony interes. Publiczne `/ready` potwierdza gotowość konfiguracji, nie odbiór konkretnego e-maila.
- **Impact:** Ostrożny klient B2B musi doprecyzować dane strony umowy, odpowiedzialność po wdrożeniu i kontakt operacyjny.
- **Recommendation:** Właściciel potwierdza fakty, prawnik właściwą treść informacji/checkboxa; opisać faktyczną dostępność, handover i utrzymanie w ofercie/rozmowie. Sprawdzić prawdziwą dostawę wiadomości w uzgodnionym teście. Nie obiecywać zespołu zastępczego ani SLA, jeśli ich nie ma.
- **Priority:** P2. **Confidence:** wysoka co do braków informacji, bez rozstrzygnięcia prawnego. **Effort:** krótka praca właściciela i przegląd prawny, zależne od faktów.

### 6. Kontekst kontaktu jest spójny w treści usług, ale nie w całej nawigacji

- **Problem:** Różne wejścia z tej samej strony ustawiają różny temat; zmiana tematu nie zmienia etykiety „Wybrana usługa”.
- **Evidence:** Na Voice header „Opisz proces” ma `/kontakt?projectType=mvp_prototype`, a CTA strony ustawia `voice_agent_demo&service=voice`. Po ręcznej zmianie na aplikację label nadal opisuje Voice. [Test uzupełniający](evidence/followup.json), [interakcje](evidence/interactions.json).
- **Impact:** Drobne, ale niepotrzebne tarcie i niejednoznaczność danych kontaktu. Nie stwierdzono utraty treści ani niemożności zmiany wyboru.
- **Recommendation:** Jedna reguła zachowania kontekstu w headerze i CTA strony. Jeśli label opisuje źródło wejścia, nazwać go „Przechodzisz ze strony…”, a nie aktualnie wybraną usługą. Skrócić komunikat kontekstowy.
- **Priority:** P2. **Confidence:** wysoka. **Effort:** pół dnia z kontrolą siedmiu ścieżek.

### 7. Development pokazuje protokół techniczny trochę za wcześnie

- **Problem:** Biznesowy klient widzi formularz/API/SMTP i trzy formaty pobrania przed pełniejszym opisem rezultatu swojej aplikacji.
- **Evidence:** Na mobile przykład kodu zaczyna się około y=923 px; blok rezultatów około y=1992 px. Sześć plików już jest schowane w natywnym details, lecz ZIP, MD i PATCH pozostają równorzędnymi linkami.
- **Impact:** Materiał zwiększa zaufanie CTO, ale część odbiorców może uznać, że oferta dotyczy głównie prostych formularzy.
- **Recommendation:** Zostawić dostęp do kodu. Na Development skrócić opis do wartości dowodu i jednej akcji; MD/PATCH przenieść do istniejących szczegółów. Na stronie partnerskiej zachować głębię techniczną. Nie budować nowego code viewera.
- **Priority:** P2. **Confidence:** średnia — kolejność wymaga walidacji z obiema grupami. **Effort:** pół dnia po krótkim teście.

### 8. Infrastruktura proof zaczyna wyprzedzać rzeczywiste materiały

- **Problem:** Kilka warstw typów, walidacji, generatorów i jednorazowych skryptów audytu obsługuje małą liczbę rzeczywistych dowodów.
- **Evidence:** Od wersji pierwszego audytu przybyło 239 plików, z czego 141 to dokumentacja/evidence; liczba skryptów autorskich/walidacyjnych wzrosła z 21 do 44. RAG/CRM mają łącznie około 731 linii nieaktywnego backendu. Istnieją osobne serwery i skrypty przeglądu wielu stron. [Klasyfikacja](evidence/source-review.json).
- **Impact:** Koszt utrzymania i aktualizacji rośnie szybciej niż wartość sprzedażowa. Liczba testów nie dowodzi wykonania produktu.
- **Recommendation:** Zamrozić rozbudowę foundation do czasu realnego scenariusza. Przy następnej zmianie zebrać powtarzane kontrole przeglądarkowe we wspólny harness, rozdzielić archiwalne wyniki od jednego bieżącego statusu. Zweryfikować sens całkowitego zakazu linków GitHub; ewentualna lista dopuszczonych, przejrzanych repo/commitów może uprościć dostęp do źródeł. Zachować bramki CSP, konfiguracji, prywatności i zgodności plików.
- **Priority:** P2. **Confidence:** wysoka co do duplikacji, średnia co do oszczędności refaktoru. **Effort:** wstrzymanie rozbudowy od razu; porządki do jednego dnia przy najbliższej potrzebie, bez osobnego dużego projektu.

### 9. Zostały małe usterki i niezamknięte kontrole dostępności

- **Problem:** „02” łamie się na mobile; część grup linków ma `aria-label` na zwykłym div; gradienty uniemożliwiają axe rozstrzygnięcie części kontrastu.
- **Evidence:** Stabilny zrzut 390 px, kod `.step-number` bez zabezpieczenia przed ściskaniem; `aria-prohibited-attr` w sekcji incomplete, m.in. `.hero-actions`. [Przegląd uzupełniający](evidence/accessibility-followup.json).
- **Impact:** Głównie dopracowanie formy i wiarygodności oceny accessibility; brak wykazanego blokera całego formularza czy menu.
- **Recommendation:** Zapobiec zawijaniu numeru; usunąć niepotrzebne etykiety divów lub zastosować uzasadnioną semantykę. Ręcznie sprawdzić kontrast stanów na gradientach, rzeczywisty zoom i NVDA/VoiceOver. Nie deklarować zgodności całej witryny na podstawie „axe: 0”.
- **Priority:** P3 dla numeracji/etykiet, P2 dla brakującego odbioru a11y. **Confidence:** wysoka dla widocznych usterek; zakres problemów SR nieznany. **Effort:** drobne poprawki poniżej pół dnia, osobna sesja z technologią asystującą.

### 10. Nadal brakuje danych pozwalających wybrać następną inwestycję CRO

- **Problem:** Priorytety handlowe usług i moment rezygnacji są hipotezami.
- **Evidence:** Dokument pomiaru/badań istnieje, ale brak udostępnionych wyników GSC, lejka, jakości leadów i badań odbiorców. W badanej sesji nie było cookies ani storage analityki; to nie dowód braku jakichkolwiek logów po stronie serwera.
- **Impact:** Ryzyko kolejnego kosztownego cyklu zmian, który nie odpowiada na realny powód rezygnacji.
- **Recommendation:** Cztery krótkie sesje zadaniowe z personami poniżej i prosty rejestr kwalifikowanych zapytań. Mierzyć temat, źródło i przejście do rozmowy/oferty, bez treści wiadomości w analityce. A/B dopiero przy uzasadnionym ruchu i hipotezie.
- **Priority:** P2. **Confidence:** wysoka co do braku danych w audycie; nie dowodzi słabej obecnej konwersji. **Effort:** około dnia badań plus rekrutacja, później regularny przegląd zapytań.

## Route-by-route review

### Home `/`

Hero w 5–10 sekund komunikuje powtarzalny proces, ograniczony scenariusz i termin. „Pokaż nam proces” jest łatwym pierwszym krokiem. CTA jest widoczne również przy 360 px; wieloliniowy H1 jest duży, ale nadal czytelny. Przeszkodą jest precyzja oferty, nie potrzeba nowego sloganu.

PRZED/PO pokazuje zmianę pracy: ręczne czytanie i przepisywanie → propozycja → decyzja pracownika. Działa jako wyjaśnienie. Schemat hero przedstawia niemal tę samą logikę, więc należy skrócić powtórzenie, a nie dodawać kolejną animację. Nie przypisywać temu panelowi oszczędności czasu bez pomiaru.

Nagłówek materiałów pojawia się na mobile około y=1831 px, wcześniej około y=5815 px. Proof jest już dostatecznie wcześnie. Problemem jest jego jakość i dobór: dwie symulacje nie wykorzystują w pełni istniejącego projektu własnego. Kolejność problem → przykład → wybór usługi → pierwszy etap → osoba → kontakt jest logiczna. 6545 px nadal wymaga przewijania, ale nie uzasadnia kolejnego cięcia o połowę.

Disclaimery należy kompresować, zachowując przy samym materiale rodzaj źródła i kluczowe ograniczenie. Przykład: „Symulacja interfejsu: gotowe odpowiedzi, bez modelu AI” oraz rozwijane „Zakres przykładu”. Samo słowo „symulacja” byłoby za mało precyzyjne. Zdanie pod kartami wspomina projekt własny, choć obie główne karty są symulacjami — poprawić dobór lub opis.

### Hub `/rozwiazania`

To jedna z najbardziej udanych zmian. Pięć kategorii daje szybki wybór, nie zmusza do czytania całego portfolio. „Wiadomości i dokumenty”, „Wiedza firmy” i telefony są jasne; „Rozmowy w CRM” nie nazywa kanału ani wyniku integracji; „Zadania wieloetapowe” jest lepsze od samego żargonu agentowego.

Zostawić osobny landing WhatsApp/CRM dla intencji kanału i integracji. W hubie dopowiedzieć kanał w krótkim opisie. Automatyzacja może być pojęciem nadrzędnym w wyjaśnieniu oferty, ale nie powinna teraz zastępować pięciu czytelnych wejść jednym ogromnym katalogiem. Krótkie rozróżnienie „stałe reguły → workflow; zmienny dobór narzędzi → agent” dać przy odpowiednim wyborze; obecnie wyjaśnienie jest niżej. Development jest prawidłowo oddzielony.

### RAG `/rozwiazania/chatbot-ai-dla-firm`

Najbardziej zróżnicowany landing. Już około y=849 px jest odpowiedź, otwierany fragment dokumentu i przypadek braku danych. Cytat można sprawdzić; po zamknięciu wraca fokus. To wiarygodny dowód zaprojektowania interakcji ze źródłem. Nie jest dowodem retrievalu ani generowania, co jest poprawnie oznaczone.

H1 nadal łączy chatbot i asystenta wiedzy, ale treść dostatecznie zawęża kontekst dokumentów firmowych. Trzy FAQ są rozsądne. W pierwszej kolejności rozwinąć dowód działania, nie dopisywać kolejnych zalet RAG. Osobny model interakcji: własne ograniczone pytanie → wyszukane fragmenty → odpowiedź modelu → cytaty, z autentycznym przypadkiem braku odpowiedzi. W otwartym dokumencie odnośnik „Projekt własny” prowadzi do kontaktu; przy porządkach skierować go do właściwego dowodu kodu.

### Voice `/rozwiazania/voice-ai-dla-firm`

Intencja telefoniczna jest jasna. Drugie CTA w hero odnosi się do zakresu pierwszego etapu, a nie do niezwiązanego raportu — dobra zmiana. Nadal nie można usłyszeć sposobu mówienia, opóźnień, przerwania ani przekazania rozmowy człowiekowi. **Brak realnego audio pozostaje największym problemem tej konkretnej usługi.**

Potrzebne krótkie autentyczne nagranie, zgodna transkrypcja i wynik jednej rozmowy, z informacją o cięciach i pochodzeniu. Jeśli materiał jest syntetyczny lub demonstracyjny, jawnie tak go opisać; nie zastępować przykładu wdrożenia wygenerowanym lektorem. Native audio plus transkrypcja wystarczy. Nie tworzyć efektownego waveformu przed nagraniem. FAQ skrócić do pytań o kanał, zakres i handoff, które nie mają już odpowiedzi wyżej.

### Automatyzacja `/rozwiazania/automatyzacja-procesow`

Jasny punkt wejścia dla ręcznej pracy, ale nadal głównie opis. Oczekiwany dowód to stan przed i po rzeczywistym wykonaniu: wiadomość, reguła/propozycja, zmieniony rekord, walidacja. Jeden zapis CRM z potwierdzonym odczytem byłby tu bardziej przekonujący niż kolejny diagram.

Oddzielić kroki deterministyczne od tych, gdzie potrzebny jest model. Kryteria odbioru powinny mówić o poprawności zmiany, duplikatach, braku zgody i obsłudze awarii. Konkretne progi jakości i oszczędności ustalać dopiero na danych procesu.

### WhatsApp/CRM `/rozwiazania/integracje-whatsapp-crm`

Osobna strona ma sens dla osoby szukającej integracji konkretnego kanału. Obecna treść rozszerza się na e-mail/formularz i znów „agenta”, dlatego granica względem automatyzacji jest mniej czytelna. Nie każde przekazanie kontaktu z rozmowy wymaga AI.

Odrębny visual powinien pokazywać rozmowę i faktyczny rekord obok siebie; interakcja — zatwierdzenie i sprawdzenie zapisu. Używać autoryzowanego kanału/sandboxa. Nie nazywać materiału „WhatsApp proof”, jeśli wykonanie dotyczyło wyłącznie fikcyjnego wejścia albo innego kanału. Nie kasować URL przed analizą zapytań i popytu.

### Agenci `/rozwiazania/systemy-agentowe`

„Systemy agentowe” w H1 pozostaje bardziej techniczne niż biznesowy nagłówek hubu. Pomaga eyebrow „zadania wieloetapowe”; warto połączyć nazwę z konkretnym wynikiem zadania. Pięciostopniowy schemat i powtarzanie kontroli człowieka nie pokazują jeszcze, dlaczego zwykły workflow jest niewystarczający.

Trace jest wiarygodny dopiero jako zapis rzeczywistego wykonania. Powinien zawierać wejście, narzędzia, zależności, zgodę przed zapisem, rezultat i autentyczny błąd/limit. Ręcznie narysowane kroki mają wartość objaśniającą, ale nie dowodową. Nie publikować prywatnego fixture jako kolejnej „realizacji”.

### Development `/development`

Oferta aplikacji, API i panelu stała się konkretniejsza. Klient z gotowymi wymaganiami może rozpocząć od przeglądu, bez obowiązkowej ścieżki demo. Role i funkcje opisane jako planowany zakres nie są podszywaniem się pod już wdrożone uprawnienia.

**Progressive disclosure już istnieje:** sześć źródeł oraz wersja/zasięg przykładu są w natywnych details, działających bez JS. Nie rekomenduję tworzenia go od nowa. Zmiana o potencjalnym sensie to skrócenie widocznego wstępu i przeniesienie pomocniczego MD/PATCH pod to samo rozwinięcie. Jeden wyraźny dowód kodu powinien zostać wysoko; jego treść musi powiedzieć, czego dowodzi poza wykonaniem formularza.

### Partnerzy `/dla-software-house`

Repo → PR/review/CI → odbiór i handover tworzą dobrą odpowiedź dla CTO. NDA, własność i odpowiedzialność za deployment są przedstawione jako ustalenia przed pracą, a nie niepoparte zapewnienia. Pierwszoosobowy język ogranicza agencyjność. Rozwinięcie MSP w hero jest pomocne.

Słabszy punkt: ten sam dowód formularza i API nie pokazuje jeszcze dostarczenia modułu AI do cudzego repo. Następny prawdziwy materiał partnerski może być niewielkim wydzielonym modułem, z PR, testem, instrukcją przejęcia i opisem granic odpowiedzialności. Nie potrzeba wymyślonego dużego case study. Z pięciu FAQ skrócić powtórzenia pracy w repo, przekazania i white-label już opisanych wyżej.

### Studio `/studio`

Wrażenie: **małe studio / engineering boutique prowadzone przez foundera**, nie duży software house. To właściwe pozycjonowanie przy obecnych materiałach. Właściciel z nazwiska, bezpośredni kontakt i odpowiedzialność zwiększają zaufanie. Dla większych projektów ograniczeniem będzie nie liczba użyć „ja”, lecz niepotwierdzona dostępność, ciągłość pracy i przejęcie utrzymania.

Bio jest już w rozwinięciu, dlatego zdanie „praca dyplomowa jest ukończona i oczekuje na obronę” nie obciąża głównej ścieżki. Nie daje istotnej wartości kupującemu. Po potwierdzeniu aktualności danych proponuję: **„Ukończyłem studia inżynierskie z mechatroniki oraz program studiów w obszarze zaufanej sztucznej inteligencji na Politechnice Wrocławskiej.”** To zachowuje rozróżnienie programu i tytułu; nie przypisuje tytułu magistra. Jeśli właściciel nie potwierdzi zdania, usunąć administracyjny szczegół bez zastępowania go nowym osiągnięciem.

Nie stawiam autentycznego zdjęcia ponad dowodem wykonania. „Dane i kod pozostają prywatne” można przy redakcji doprecyzować jako dane i kod klienta. Pokazany projekt własny jest publiczny, co nie jest samo w sobie sprzecznością z poufnością prac klienta.

### R&D `/rd`

To już nie tylko lista zamiarów. Nowe uruchomienie dostarczonej paczki odtworzyło **10/12**, w tym **7/9** pytań ze źródłem i **3/3** prawidłowych braków wyniku. Obie nieudane parafrazy są jawne. Próba liczy 12 pytań autorskich i trzy fragmenty dokumentu; to nie niezależny benchmark, accuracy LLM ani dowód jakości RAG.

„Wyszukiwanie bez modelu AI” jest zrozumiałym objaśnieniem. Surowe `modelCalls: 0` nie jest dominującym hasłem hero; jest właściwą informacją metodyczną. Nie oznacza zerowego kosztu pracy/infrastruktury. Poziom eksperymentu jest podstawowy, lecz uczciwy i odtwarzalny — to buduje techniczną wiarygodność. Biznesowy wniosek można skrócić do: „Zmiana sformułowania może ukryć istniejącą odpowiedź; przed pilotażem trzeba sprawdzić parafrazy”. Techniczne identyfikatory błędów przenieść do szczegółów. Cztery dalsze kierunki poprawnie pozostają planami.

### Demo i pierwszy etap `/demo-ai`

Rozróżnienie symulacji i systemu produkcyjnego jest dużo lepsze. Gotowe pytania, odpowiedź poza zakresem, reset i przejście do kontaktu działają. W obserwacji wyboru/wpisania pytania nie wystąpiły żadne żądania sieciowe. To bezpieczny przykład interfejsu, nie próba modelu.

Pozostają trzy znaczenia demo: lokalna symulacja, omawiany materiał podczas prezentacji, wykonanie scenariusza dla firmy. Warunki pierwszego etapu są centralnie zapisane, ale stare sformułowania jeszcze je rozmywają. Szczególnie trzeba usunąć pętlę „po siedmiu dniach przygotuj pierwszy etap” oraz obietnicę pracy na materiałach firmy w bezpłatnej prezentacji, o ile faktycznie nie jest to jej zakres.

### Raport `/przyklad-demo` i PDF

Executive summary ma jedną warunkową decyzję i następny krok. **GO dotyczy uzgodnienia danych, sandboxa i akceptacji, nie udowodnionej gotowości produkcyjnej.** Trzy scenariusze są opisami oczekiwanego przebiegu; strona nie powinna podnosić ich rangi do zaliczonych testów.

Wersja WWW ma nadal 11 267 px na 390 px. Skrócić powtarzane objaśnienia fikcyjności i dublujące się listy, zachować spis treści, streszczenie, ryzyka i pobranie. Na mobile status decyzji zaczyna się około y=757 px, więc pierwszy ekran niemal cały zajmuje kontekst raportu. Można przenieść identyfikator `decision-report-v2` do szczegółów i skrócić notę o pochodzeniu.

**PDF jest wystarczająco profesjonalny jako przykład formy dokumentu wysyłanego klientowi.** Obejrzano wszystkie cztery strony: spójne marginesy, polskie znaki, czytelna numeracja, bez obcięcia i nakładania tekstu. Strona ryzyk jest gęstsza, ale mieści się poprawnie. Nie trzeba dekoracyjnego redesignu. Jako raport z wykonanego etapu nadal wymaga realnych testów, ustalonych kryteriów i decyzji klienta. Przy rzeczywistym materiale trzeba zachować dostępny tekst; ten audyt nie certyfikuje PDF/UA ani odczytu PDF czytnikiem ekranu.

### Kontakt `/kontakt`

Pierwsze pole jest obecnie na y=419 px zamiast 681 px (390×844). Przy wejściu z jednej z pięciu usług AI kontekst zwiększa tę wartość do y=504 px; aplikacje i partnerzy pozostają przy 419 px. To nadal znacznie lepiej. Firma jest opcjonalna; budżet w opcjonalnych dodatkowych danych nie blokuje wysłania. Wymagany temat ma także odpowiedź „Nie wiem / inny temat”. Minimum 20 i maksimum 4000 znaków opisu jest widoczne.

Honeypot pozostaje poza kolejnością tabulacji i ukryty przed technologią asystującą. Puste wymagane pola otrzymują `aria-invalid` i powiązanie z opisem błędu; fokus trafia do podsumowania. Przechwycone 422/429/503/błąd sieci zachowują treść, 202 przenosi fokus do potwierdzenia. E-mail jest dostępny także bez JavaScriptu. Nie obiecywać terminów odpowiedzi bez decyzji właściciela.

| Źródło CTA w treści | `projectType` | `service` |
| --- | --- | --- |
| RAG | `rag_chatbot_demo` | `rag` |
| Voice | `voice_agent_demo` | `voice` |
| WhatsApp/CRM | `whatsapp_agent_management` | `whatsapp` |
| Automatyzacja | `business_process_automation` | `automation` |
| Agenci | `ai_automation` | `agents` |
| Development | `custom_web_app` | brak |
| Software house | `software_house_partnership` | brak |

Wszystkie siedem mapowań sprawdzono na produkcji. Nieznana wartość query bezpiecznie ustawia „other”, bez zmyślonej etykiety usługi. Canonical pozostaje `/kontakt` bez parametrów. Niespójności headera i ręcznej zmiany tematu opisano w problemie 6. Testy potwierdzenia używają lokalnego przechwycenia odpowiedzi: **zero rzeczywistych zgłoszeń, brak dowodu dostarczenia przez SMTP**.

### Prywatność `/polityka-prywatnosci`

Czytelny, krótki dokument, zachowana dostępność i kontakt. Mapa danych w repo obejmuje więcej szczegółów operacyjnych niż publiczna treść. Właściciel powinien potwierdzić aktualne dane administratora, odpowiedni kontakt, cele/podstawy, odbiorców, retencję i ewentualne transfery. Rozstrzygnięcie zgodności checkboxa i informacji należy oprzeć na faktycznym procesie; audyt UX nie stwierdza naruszenia prawa. Zakres informacji dla osoby opisują art. 12–13 [RODO](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng).

Nie dopisywać nieaktywnych dostawców RAG/CRM jako obecnych odbiorców i nie dodawać automatycznie bannera cookies. Brak cookies/storage w obserwowanych sesjach nie wyłącza przetwarzania zapytań i logów serwera.

## Product proof review

| Materiał | Co rzeczywiście potwierdza | Czego nie potwierdza |
| --- | --- | --- |
| Symulacja wiedzy | Projekt interakcji, odpowiedzi przygotowane, fallback | Retrieval, generowanie, jakość odpowiedzi na dokumentach klienta |
| Ręcznie przypisane cytaty RAG | Możliwość sprawdzenia cytatu i otwarcia źródła | Wybór źródła przez system i wierność generowania |
| Fikcyjny raport/PDF | Sposób planowania zakresu i przedstawienia decyzji | Wykonane testy, wdrożenie, efekt ekonomiczny |
| Kod własnego formularza/API, testy, PR | Realna implementacja, obsługa błędów, sposób przekazania kodu | Produkcyjne AI ani wynik klienta; sama paczka nie potwierdza bieżącego CI |
| Eksperyment lexical retrieval | Odtwarzalny pomiar prostej metody i dwóch porażek | Skuteczność realnego RAG, semantycznego retrieval czy modelu |
| Foundation RAG/CRM | Przemyślane kontrakty i lokalne stany kontrolne | Połączenie z dostawcą, trwałe wykonanie, autoryzowany zapis |
| Voice player / agent trace | Prywatny komponent gotowy przyjąć materiał | Autentyczne nagranie/wykonanie, zgody na publikację |
| Evidence registry | Pochodzenie, wersje, zakres twierdzeń | Prawdziwość wyniku tylko dlatego, że typ i walidator go zaakceptowały |

**Proof techniczny jest już realny. Proof produktu AI jest nadal niewystarczający. Proof klienta nie został przedstawiony.** Projekt własny może być pełnowartościowym dowodem produktu, jeśli faktycznie działa i ma jawne dane/metodę; nie trzeba czekać na wielką markę klienta. Nie należy jednak nazywać go wdrożeniem klienta.

Realny RAG ma sens jako ograniczony, powtarzalny test, nie otwarty chatbot bez limitu kosztów. Zapisać wersje korpusu/modelu, pytanie, trafienia, wynik i cytaty; zachować błędne i nieobsługiwane pytania. CRM warto pokazać jako prawdziwy sandbox write z odczytem, zgodą i sprawdzeniem duplikatu. Voice wymaga rzeczywistego audio, a trace rzeczywistego uruchomienia. Jeden uczciwy materiał ma większą wartość niż uruchomienie czterech pokazów z udawanymi stanami.

## Conversion review

To eksperckie przejścia przez działające trasy, nie sesje badawcze z realnymi uczestnikami.

| Persona | Pierwsza informacja i proof | CTA i tarcie | Moment decyzji / możliwa rezygnacja |
| --- | --- | --- | --- |
| A: właściciel firmy, ręczny proces | Home: pokaż proces, w 7 dni demo; PRZED/PO, następnie dwie symulacje | „Opisz proces”, krótki formularz; nie wie jeszcze, co będzie płatne i jaki wynik dostanie | Przed podaniem danych: „czy oni już wykonali taki przepływ i co kupię po rozmowie?”. |
| B: head of operations | Hub szybko kieruje do wiadomości/CRM; landing opisuje kontrolę i integracje | CTA zachowuje temat; wymagany opis jest rozsądny. Brakuje zmiany stanu w systemie, obsługi wyjątku i ustalonego odbioru | Przy porównaniu rozwiązania z własnym procesem. Rezygnacja, jeśli opis nie przechodzi w sprawdzalny rezultat. |
| C: CTO software house | Konkretny moduł, własny kod, PR i paczka testów | „Opisz moduł” ustawia partnerstwo. Repo/handover są jasne; ZIP/MD/PATCH wymagają dodatkowego pobrania/otwarcia | Po oględzinach kodu: „czy przejmie ten moduł i odda go zespołowi w naszym standardzie?”. Najlepsza obecnie ścieżka techniczna. |
| D: wejście z Google na RAG | H1 pasuje do asystenta wiedzy; szybko można otworzyć dokument i cytat | CTA zachowuje RAG. Użytkownik może oczekiwać działania na nowych pytaniach, a dostaje ręczny przykład | Przy odkryciu granicy symulacji. Potrzebny rzeczywisty mały flow lub uczciwy następny krok do jego sprawdzenia. |

Nie ma podstaw do ogłoszenia procentowego wzrostu konwersji. Mniej CLS i krótszy hub usuwają wykazane tarcie; wzrost liczby dobrych rozmów trzeba dopiero zmierzyć. Przy małym ruchu lepsze od A/B będą zadaniowe sesje z czterema profilami i rozmowy z faktycznymi leadami.

## Technical/code review

### Performance i mobile

Nowy Lighthouse 13.4.1, porównywalne ustawienia z pierwszym audytem:

| Pomiar | Performance poprzednio → teraz | LCP poprzednio → teraz | CLS poprzednio → teraz |
| --- | --- | --- | --- |
| Home mobile, mediana 3 | 73 → **98** | 2,00 → **1,66 s** | 0,916 → **0** |
| Kontakt mobile | 74 → 99 | 1,95 → 1,66 s | 0,916 → 0 |
| RAG mobile | 75 → 97 | 1,77 → 1,81 s | 0,916 → 0 |
| Home desktop | 90 → 100 | 0,50 → 0,37 s | 0 → 0 |

Nie każdy parametr poprawił się: TBT home wzrosło z mediany 65,5 do 112,5 ms; pojedynczy RAG ma nieco wyższe LCP/TBT. Nie uzasadnia to kolejnego refaktoru przy tych wynikach. CLS 0, stabilny H1 i brak pustego main potwierdzają naprawę zaobserwowanego błędu startu. Transfer home wynosi około 192 KiB. Nie uruchamiano ciężkich mediów ani zewnętrznego modelu.

Sprawdzono 15 tras × 360/390/430/768/1024/1440 px. Brak wykrytego poziomego overflow. Menu działa na czterech szerokościach mobilnych, Escape zamyka je i oddaje fokus; przy otwarciu treść jest inert. Sticky header zachowuje miejsce; animacje wejścia kończą się, a wariant reduced-motion zachowuje treść. Wysokość serwisu i późne CTA na landingach są dziś większym problemem mobile niż wydajność.

To dane laboratoryjne. Nie otrzymano CrUX/RUM ani INP realnych użytkowników; nie stwierdzam zaliczenia field CWV. [Definicja i pomiar Web Vitals](https://web.dev/articles/vitals), [surowe podsumowania](evidence/performance.json).

### Accessibility

30 skanów axe (390 i 1440 px) nie wykazało violations. **Wynik ma istotne incomplete:** gradienty/pseudoelementy blokują automatyczne rozstrzygnięcie części kontrastu, a niektóre zwykłe divy mają nieobsługiwane semantycznie nazwy `aria-label`. To nie jest kompletne „30/30 WCAG pass”. Naprawa dawnego ciemnego proof jest potwierdzona dodatkowo obliczeniem kontrastu z rzeczywistych kolorów i oględzinami.

Sprawdzono skip link, obsługę menu klawiaturą, fokus odpowiedzi/cytatu/formularza, natywne details, źródła i kontakt bez JS, hierarchię H1 oraz czytelność PDF. Główne kontrolki mają wygodne rozmiary; linki stopki około 36 px i tekstowe linki 20–21 px nie są automatycznie naruszeniem AA. WCAG 2.2 wymaga co do zasady 24×24 CSS px lub spełnienia odpowiedniego wyjątku/odstępów; 44 px jest dobrym celem wygody, nie uniwersalnym minimum AA. [W3C: wielkość celu](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [W3C: kontrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

Pozostają fizyczny NVDA/VoiceOver, prawdziwe powiększenie przeglądarki, urządzenia dotykowe i kompletna ręczna kontrola kontrastu stanów. Publiczna strona nie zawiera audio UI, więc brak problemów odtwarzania na produkcji nie jest jego odbiorem. Starszy test prywatnego playera potwierdza działanie komponentu, nie dostępność przyszłego autentycznego nagrania.

### SEO

15 tras HTTP 200 ma unikalne titles i descriptions, jeden H1, canonical bez query, polski język, metadane OG oraz parsowalne JSON-LD. Dane strukturalne rozróżniają usługę, osobę i stronę; raport pozostaje fikcyjnym przykładem. Sitemap obejmuje trasy publiczne, robots nie blokuje indeksacji. Nieistniejąca ścieżka zwraca rzeczywiste HTTP 404 i `noindex, follow`. Kontrola wewnętrznych kotwic nie wykazała brakujących celów.

To dobra baza techniczna, nie dowód indeksacji i pozycji. Największe ryzyko treściowe dotyczy podobnego opisu automatyzacji, integracji i agentów. RAG ma intencję dokumentów/wiedzy, Voice telefonu, WhatsApp kanału i CRM, automatyzacja stałych procesów, agenci zadań wymagających doboru narzędzi. Utrwalić różnicę w pierwszym akapicie, dowodzie i unikalnych FAQ. Nie kasować landingów ani nie ustawiać cross-canonical tylko dlatego, że używają tego samego template. Canonical jest sygnałem preferowanej wersji treści, nie narzędziem zastępującym różnicowanie oferty. [Google Search Central](https://developers.google.com/search/docs/crawling-indexing/canonicalization).

Bez GSC nie stwierdzam kanibalizacji ani spadku ruchu. Najpierw sprawdzić zapytania, strony wejścia i pozyskane rozmowy.

### Security i granice aktywacji

CSP produkcji nie zezwala na `unsafe-eval` ani `unsafe-inline` dla skryptów; są `script-src-attr 'none'`, ograniczony connect-src, blokada ramek/obiektów i nagłówki HSTS/nosniff. Dla stylów nadal istnieje `style-src 'unsafe-inline'` — nie należy opisywać polityki jako braku wszelkiego inline. Hydration używa `withNoIncrementalHydration()`; brak zaobserwowanych błędów CSP/bootstrap. Uzupełniający odczyt `/health` 10 września zwraca CORS dla dokładnego origin `https://protolume.pl` i nie zwraca allow-origin dla obcego origin testowego. To kontrola odpowiedzi GET, nie pełny test wszystkich endpointów/preflight. Zachować obecne bramki i stabilny prerender.

RAG operuje na ograniczonym lokalnym korpusie. Nie ma aktywnego publicznego endpointu ani skonfigurowanego dostawcy. Walidacja cytatu sprawdza źródło/fragment, nie semantyczną prawdziwość, odporność na prompt injection ani wierność całej odpowiedzi. Limit wywołań per instancja nie jest limitem pieniężnym ani globalnym limitem wielu instancji. Przed aktywacją potrzebne są rzeczywisty adapter, decyzje o danych/kosztach i testy tych granic.

CRM rozdziela propozycję, akceptację i wynik zapisu oraz uwzględnia niepewny wynik operacji. To wartościowy projekt kontroli. Stan w pamięci procesu nie jest trwałym dziennikiem, string aktora nie jest uwierzytelnieniem, a etykieta sandbox nie izoluje sieci. Brakuje rzeczywistego adaptera, uprawnień i trwałego wykonania. Nie podłączać publicznego kontaktu do tych modułów jako skrótu do demonstracji.

W ograniczonym przeglądzie wzorców sekretów w aktualnym kodzie/konfiguracji nie wykryto kandydatów. Nie był to pełny skan historii ani infrastruktury. Konfiguracji produkcji i treści prawnych nie zmieniano; nie odczytywano wartości sekretów. Walidatory publikacji i hashy zapobiegają części przypadkowych wycieków/starych plików, ale nie potwierdzają praw publikacji i realnego wykonania tylko na podstawie pól boolean.

### Czy repo jest przeinżynierowane?

**Częściowo na poziomie obsługi dowodów i procesu audytu; nie ma podstaw do wyrzucenia architektury aplikacji.** Od pierwszej produkcji liczba śledzonych plików wzrosła 303 → 542. Z 239 nowych plików 141 to dokumentacja/evidence, 20 materiały/fixtures, 31 źródła frontendu, 8 backendu, 23 skrypty i 15 testy, 1 pozostała konfiguracja. Nie należy przedstawiać całej różnicy jako rozrostu kodu produkcyjnego. Duże liczby dodanych linii obejmują raporty Lighthouse i JSON.

Wartościowe: jeden katalog usług, spójny model pierwszego etapu, niewielki registry pochodzenia, wspólny obiekt danych WWW/PDF, kontrola zgodności plików, testy obsługi błędów i izolacja prywatnych fixtures. Trzy generatory mają osobne rzeczywiste wyniki: paczka kodu, paczka eksperymentu, PDF. To nie są trzy implementacje tej samej funkcji.

Ciężar: szeroki plik `site-content.types.ts` (około 840 linii), `site.pl.ts` (około 1059), dodatkowe kontrakty materiałów (233), powtarzane reguły metadanych w TS i walidatorach CJS/Python oraz kilka podobnych skryptów przeglądarkowych. Backend domain schema i frontend presentation schema mogą celowo się różnić; nie scalać ich mechanicznie. Wyodrębnić wspólne reguły dopiero tam, gdzie faktycznie występuje rozbieżność lub powtarzana zmiana. Nie dodawać osobnego frameworka schematów dla samych czterech planowanych materiałów.

Szczególny kandydat do uproszczenia: `validate-site-artifact.cjs` odrzuca każdy publiczny href z `github.com`. To istniejący constraint, który wymusił własne kopie źródeł/patcha. Zamiast znosić wszystkie zasady publikacji można rozważyć dopuszczenie konkretnego przejrzanego repo/commita. ZIP ma nadal sens jako samodzielny handover. Osobny rozbudowany portal kodu nie ma teraz uzasadnienia.

Historyczne evidence należy zachować z datą i SHA. Jeden bieżący indeks powinien mówić, że publikacja `8ccc20c` jest już potwierdzona; nie przepisywać dawnych raportów tak, jakby testowano późniejsze wdrożenie. Również pliki niniejszego audytu są archiwum pomiaru, a nie nową obowiązkową warstwą builda. Dalsze dopisywanie validatorów dla przyszłych Voice/agentów miałoby dziś mniejszą wartość niż wykonanie jednego prawdziwego procesu.

## What to remove

| Element | Decyzja | Konkretna zmiana |
| --- | --- | --- |
| Odesłanie do „przygotowania pierwszego etapu” po jego siedmiu dniach | **Usuń** | Zastąpić uzgodnioną decyzją: dalsza budowa / dodatkowy test / zatrzymanie. |
| Powtórne ogólne zastrzeżenie pod dwiema już oznaczonymi kartami home | **Skróć/usuń** | Zostawić pochodzenie i najważniejsze ograniczenie przy każdej karcie. |
| Schemat wiadomość → propozycja → decyzja pokazany w hero i PRZED/PO | **Skróć** | Hero jako miniatura; pełniejszy sens biznesowy tylko w PRZED/PO. |
| Te same odpowiedzi w procesie i FAQ usług/partnera | **Usuń** | FAQ ma odpowiadać na niezaspokojoną obiekcję, nie powtarzać procesu. |
| „Kontrola” i „kontrola człowieka” jako osobne ogólne kroki | **Połącz/skróć** | Jeden rzeczywisty punkt akceptacji z konsekwencją decyzji. |
| ZIP + instrukcja MD + fragment PATCH na Development | **Przenieś** | Jedna główna akcja, pozostałe w istniejących szczegółach. |
| Wersja `decision-report-v2` na początku raportu WWW | **Przenieś** | Do metadanych/szczegółów; datę i pochodzenie zachować. |
| Identyfikatory typu `rag-source-simulation` w biznesowym omówieniu R&D | **Przenieś** | Do metody/JSON; pozostawić pytanie i konsekwencję błędu. |
| Zdanie o oczekiwaniu na obronę | **Usuń/zastąp po potwierdzeniu** | Neutralne fakty o ukończonym programie bez nadawania tytułu. |
| Dwie pokrewne karty symulacji wiedzy w zestawie Studio | **Skróć** | Jeśli badanie potwierdzi redundancję, jedna karta z linkiem do źródła. Nie usuwać samego interaktywnego dokumentu. |
| Informacje o braku prawdziwych testów w raporcie | **Zostaw** | Kompresja języka nie może zmienić znaczenia GO ani scenariuszy. |
| Testy/kontrakty bezpieczeństwa i integralności publikowanych plików | **Zostaw** | Porządkować powtarzanie kodu, nie osłabiać warunków publikacji. |

## What to keep

1. Obecny kierunek wizualny, logo, kolory i typografię — bez rebrandingu.
2. Hero zaczynające od procesu klienta i ograniczonego pierwszego kroku.
3. Krótki, problemowy hub pięciu usług.
4. Oddzielną ścieżkę aplikacji/integracji i partnerstwa dla software house.
5. Wyraźne CTA „Opisz proces” oraz e-mail jako alternatywę.
6. Układ PRZED/PO z rzeczywistą rolą akceptacji człowieka, przy krótszym powtórzeniu w hero.
7. Otwierany cytat RAG, dokument i uczciwy stan braku danych.
8. Jawne rozróżnienie symulacji, eksperymentu, projektu własnego i klienta.
9. Rzeczywisty kod/PR oraz samodzielną paczkę API do sprawdzenia.
10. Natywne details i kontakt bez JavaScriptu.
11. Foundera z nazwiska, pierwszoosobową odpowiedzialność i krótkie Studio.
12. Opcjonalną firmę/budżet, zachowanie wpisanej treści po błędzie i dostępne komunikaty formularza.
13. Jeden odtwarzalny eksperyment wraz z oboma niepowodzeniami.
14. Czterostronicowy PDF, wspólne źródło danych i kontrolę zgodności WWW/pliku.
15. Stabilną hydration, brak ciężkiego startu, reduced-motion, klawiaturę i skip link.
16. CSP, kontrakt konfiguracji, izolację prywatnych materiałów i prawdziwe 404.

## Owner decisions required

To lista decyzji do kolejnego etapu, nie prośba o zgodę na wykonanie tego audytu. Żadnej z poniższych odpowiedzi nie przyjęto za fakt.

| Decyzja | Co dokładnie trzeba ustalić |
| --- | --- |
| Oferta startowa | Co jest bezpłatną prezentacją; co jest zamawianą pracą; rezultat siedmiu dni: interfejs czy wykonany/testowany przepływ; zasady wyceny i płatności. |
| Siedem dni | Robocze czy kalendarzowe; od jakiego momentu; wymagane dane/dostępy; postępowanie przy opóźnieniu po stronie klienta. |
| NO-GO | Co klient otrzymuje i jak rozliczany jest etap, kiedy wynik prowadzi do zatrzymania; brak obowiązku dalszego wdrożenia. |
| Pierwszy rzeczywisty dowód | Priorytet usługi, konkretne dane/sandbox, budżet/dostawca, zakres akceptacji, osoba odpowiedzialna, prawa publikacji. |
| Wiarygodność operacyjna | Aktualne dane właściciela i bio, realna dostępność i czas odpowiedzi, handover/utrzymanie, aktualność informacji prawnych. |
| Badania i pomiar | Dostęp do istniejących danych GSC/leadów, kryterium kwalifikowanego zapytania, uczestnicy; dopiero potem zasadność kalendarza/trackera/A/B. |

Zdjęcie, referencje i case study wymagają prawdziwego materiału oraz zgody. Brak zgody nie jest powodem do publikacji wygenerowanej historii klienta.

## Top 5 next actions

Gdyby można było zrobić tylko pięć rzeczy:

1. **Zamknąć warunki pierwszego etapu i usunąć sprzeczne zdania.** Jeden krótki opis rezultatu, początku terminu, płatności i NO-GO, używany konsekwentnie na home, demo i kontakcie.
2. **Wykonać jeden rzeczywisty proces i udokumentować także granicę/błąd.** Domyślnie sandbox CRM z odczytem rezultatu; RAG jako pierwszy, jeśli wynika to z realnych zapytań. Nie uruchamiać równolegle czterech pozornych pokazów.
3. **Jedna mała redakcja istniejących stron.** Skrócić powtarzane FAQ/disclaimery, lepiej wskazać własny projekt, zachować kontekst CTA i poprawić numerację. Bez nowych sekcji i systemu designu.
4. **Potwierdzić fakty operacyjne oraz kontakt.** Aktualna informacja prawna, dane właściciela, realne warunki współpracy/utrzymania i uzgodniony test dostarczenia e-maila.
5. **Sprawdzić decyzje z czterema personami i rejestrować jakość zapytań.** Najpierw zrozumienie oferty, wybór usługi, wiarygodność dowodu i decyzja o kontakcie; dopiero później optymalizacja liczbą kliknięć.

### DO NOW — maksymalnie pięć

1. Decyzja właściciela o pierwszym etapie oraz ujednolicenie nazw bez dodawania nowych obietnic.
2. Usunięcie jednoznacznych powtórzeń i sprzeczności; drobne poprawki kontekstu/formy, bez przestawiania całego serwisu.
3. Wybór i przygotowanie jednego rzeczywistego scenariusza dowodowego; wykonanie po potwierdzeniu dostępów i granic.
4. Aktualizacja faktów operacyjnych/prawnych oraz kontrolowany odbiór kontaktu z właścicielem.
5. Krótkie badania odbiorców i prosty pomiar kwalifikowanych zapytań.

### DO AFTER REAL ARTIFACTS

Podmienić właściwe symulacje na nagrania/ślady rzeczywistego działania, zachowując pochodzenie i ograniczenia. Wypełnić odrębne interakcje RAG/Voice/CRM/agent tylko tam, gdzie istnieje materiał. Następnie opracować case study z danymi klienta i jego zgodą; raport z etapu powinien pokazywać wyniki faktycznie wykonanych testów.

### VALIDATE FIRST

Wybór pierwszego produktu, zamiana karty proof na home, kolejność dowodu na Development, uproszczenie „Rozmowy w CRM”, korzyść z kalendarza i stawianie ceny w hero. GSC przed konsolidacją landingów; hipoteza i odpowiedni ruch przed A/B; rzeczywiste technologie asystujące przed deklaracją pełnej dostępności.

### DO NOT DO

Kolejny rebranding/redesign; nowe ogólne landing pages bez odrębnego popytu; sztuczne metryki, client logos lub case study; publikacja ciszy/fixture jako Voice; trace udający wykonanie; otwarty LLM bez ograniczeń; rozbudowa foundation i własnej platformy evidence bez materiału; mechaniczne wyrzucanie validators, prywatności albo no-JS dla „odchudzenia”; usuwanie wszystkich disclaimerów; przebudowa PDF tylko dla ozdobniejszej formy.

## Final verdict

**STRONG_SITE_NEEDS_REAL_PROOF**

Protolume ma już spójną, sprawnie działającą stronę i wiarygodny głos małego studia inżynierskiego. Można na jej podstawie rozpocząć rozmowę o ograniczonym etapie lub module, szczególnie z odbiorcą technicznym. Nadal za mało pokazuje, że oferowane AI i integracje wykonały realne zadanie biznesowe, a warunki siedmiodniowego etapu pozostają niedomknięte. Największy zwrot da teraz jedno rzeczywiste wykonanie, jednoznaczna oferta i krótka redakcja istniejącej treści — nie kolejna przebudowa serwisu.
