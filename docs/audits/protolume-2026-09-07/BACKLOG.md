# Protolume — backlog po audycie z 7 września 2026

Integralna część [pełnego audytu](AUDYT.md). **28 zadań do późniejszej implementacji.** W tym audycie nie zmieniono aplikacji i nie wdrożono rekomendacji.

## Zasady realizacji

Badana produkcja ma build `8386de6`, a lokalne repozytorium `2ff41c3`. Przed każdym zadaniem sprawdzić stan aktualnego kodu i zakres już wykonanych zmian. Szczególnie UX-001 i części UX-007/UX-022 mają elementy przygotowane lokalnie. Nie nadpisywać ich nowym redesignem.

P0 oznacza pilną usterkę produkcyjną, P1 istotne tarcie sprzedażowe/UX, P2 rozwój, P3 opcję wymagającą potwierdzenia. S/M/L poniżej to orientacyjna względna wielkość pracy, nie wycena ani obietnica terminu: S = lokalna zmiana; M = kilka komponentów lub treści; L = nowy działający system lub przekrojowa zmiana.

**Dla zmian publikacyjnych obowiązuje [AGENTS.md](../../../AGENTS.md):** backend lint/format/testy po instalacji locka i pakietu; frontend `npm ci`, lint, format, testy i build; testy kontraktu deploymentu i YAML Cloud Build; oba obrazy przed pierwszym deployem; backend zbudowany z root; rzeczywisty container `/health` smoke z właściwymi produkcyjnymi wartościami niesekretnymi i jawnym testowym hasłem SMTP; syntax checks zmienionych skryptów. Zmiana env wymaga Settings, production-contract, właściwych Cloud Build, testów, smoke i dokumentacji. Zachować Secret Manager, `PUBLIC_SITE_INDEXING=true`, dokładny CORS z kontraktu i prawdziwe 404 `noindex, follow`. Nie traktować przejścia unit testów jako całej walidacji deploymentu.

W każdym zadaniu dotyczącym materiałów: **brak artefaktu blokuje publikację twierdzenia o jego działaniu**, nie blokuje niezależnego przygotowania struktury. Nie publikować pustych przycisków, liczb z briefu, fikcyjnych klientów, nieprzetestowanych integracji ani obietnic cenowych. Dane referencyjne i nagrania oznaczać zgodnie z pochodzeniem.

**Jak czytać zależności:** odwołania do współdzielonego artefaktu, konsultacji lub późniejszego pomiaru nie oznaczają obowiązku zamknięcia całego powiązanego zadania przed rozpoczęciem pracy. Badania z UX-028 zaczynają się przed zmianą hubu i decyzją cenową; późniejszy etap domyka analitykę. UX-025 jest przeglądem aktualizowanym przed uruchomieniem każdego nowego przepływu danych. Pełna walidacja SEO następuje po zmianach IA, ale nie blokuje wcześniejszej poprawy celu CTA.

## UX-001 — Przywrócić kontrast produkcyjnej sekcji proof

**Priorytet:** P0 · S/M · pewność HIGH.

**Problem:** H2 i dwa H3 w `.evidence-teaser` mają kontrast około 1,07:1 i 1,27:1. Nowszy commit zawiera zmianę kontekstu kolorów, której nie ma na badanej produkcji.

**Zakres zmiany:** przejrzeć diff `8386de6..2ff41c3` w home i `styles.scss`; zweryfikować istniejącą poprawkę zamiast pisać ją od nowa. W razie potrzeby poprawić semantyczne kolory nagłówków, kart, linków i focusu w ciemnych sekcjach.

**Desktop:** proof i końcowe CTA czytelne przy 1024/1440 px, także na hover/focus.

**Mobile:** te same kolory przy 360/390/430 px i ustawieniu reduced motion.

**Copy:** zachować obecne znaczenie; nie zwiększać kontrastu przez usunięcie informacji.

**Acceptance criteria:** zwykły tekst ≥4,5:1, duży ≥3:1; potwierdzenie pomiarem computed colors i zrzutem; axe nie zgłasza wskazanych naruszeń; brak regresji na jasnych kartach i w stopce; po publikacji sprawdzony build i wygląd produkcji.

**Nie zmieniać:** logo, palety jako całości, treści disclaimerów, bramek deploymentu.

**Zależności:** brak; istniejący commit to materiał do weryfikacji, nie automatycznie spełnione kryterium. Pełne gates publikacji.

## UX-002 — Usunąć znikanie treści i skoki układu przy starcie

**Priorytet:** P0 · M/L · pewność HIGH dla usterki.

**Problem:** podczas bootstrapu treść `main` znika, stopka podjeżdża pod header; mobilny CLS osiąga 0,916. W obu sprawdzonych commitach brak konfiguracji client hydration.

**Zakres zmiany:** `app.config.ts`, konfiguracja serwera i renderowania, root/shell, lazy routes oraz zgodność dyrektyw z hydration. Zweryfikować wykorzystanie istniejącego HTML zgodnie z dokumentacją Angular. Nie maskować objawu stałą wielką wysokością.

**Desktop:** pierwsze wejście i nawigacja między trasami zachowują treść, położenie oraz obsługę menu.

**Mobile:** zimne wejścia i CPU ×4; brak chwilowej stopki na pierwszym ekranie.

**Copy:** bez zmian.

**Acceptance criteria:** obserwacja DOM nie pokazuje przejścia `mainHeight` do zera podczas bootstrapu; brak hydration errors; trzy kolejne zimne pomiary na home, RAG i kontakcie z CLS ≤0,1; LCP bez istotnej regresji względem zapisanej próby; klawiatura, formularz, reduced motion i kotwice nadal działają. Osobno zapisać ustawienia lab, nie deklarować naprawy field CWV bez danych.

**Nie zmieniać:** prerenderu jako źródła treści SEO, canonical, HTTP statusów, funkcji formularza, CSP poprzez poluzowanie reguł.

**Zależności:** brak; testować także aktualne komponenty z HEAD. Pełne gates publikacji.

## UX-003 — Ustalić i spójnie opisać ofertę pierwszego etapu

**Priorytet:** P1 · M · pewność HIGH.

**Problem:** działająca automatyzacja, klikalny prototyp, bezpłatna prezentacja i publiczna symulacja mają wspólną nazwę demo.

**Zakres zmiany:** jeden opis oferty w `site.pl.ts` i typach treści; home, `/demo-ai`, FAQ, raport, studio i kontakt korzystają z tych samych definicji. Ustalić z właścicielem deliverable, liczenie dni, warunki startu, płatność prezentacji/demo i rezultat NO-GO.

**Desktop:** hero i karta etapu pozwalają odczytać rezultat bez szukania w FAQ.

**Mobile:** krótka informacja przy obietnicy; szczegóły po rozwinięciu lub na stronie etapu.

**Copy:** rekomendacja „W 7 dni pokażemy działające demo Twojego procesu”; „klikalny prototyp” jako odrębny wariant UX, jeżeli ma pozostać. Nie dodawać samodzielnie określenia „roboczych” ani ceny.

**Acceptance criteria:** oferta ma jedną definicję w całej witrynie; symulacja/prezentacja/płatny etap/produkcja mają różne nazwy; wiadomo co otrzymuje klient, kiedy rusza termin i co oznacza NO-GO; zero sprzecznych obietnic w FAQ; pytania testu zrozumienia z części 10 gotowe do użycia.

**Nie zmieniać:** koncepcji szybkiego etapu, uczciwych granic i braku automatycznego zamówienia przez formularz.

**Zależności:** decyzje właściciela o ofercie; nie wymagają wstrzymywania UX-001/002/004. Z UX-026 uzgodnić informacje o cenie.

## UX-004 — Spójny system CTA i zachowanie intencji kontaktu

**Priorytet:** P1 · M · pewność HIGH.

**Problem:** CTA Voice/agentów ustawia „Aplikacja albo panel”; „Zobacz demo” prowadzi do strony usługi zamiast demonstracji; kilka dolnych CTA prowadzi w to samo miejsce.

**Zakres zmiany:** macierz CTA w treści, service pages, shell i contact-options; oddzielić temat formularza od identyfikatora usługi/źródła. Dla nowych pól payloadu zaktualizować typy i backend schema. Zachować mapowanie historycznych query parametrów.

**Desktop:** jeden primary i jeden secondary na blok; pozostałe linki tekstowe.

**Mobile:** pełne, wygodne etykiety bez obcięcia; kontekst usługi widoczny przy formularzu.

**Copy:** biznes „Opisz proces”, development „Opisz projekt”, partner „Opisz moduł”; proof nazwany zgodnie z czynnością. Obecny przykład AI nazywać symulacją.

**Acceptance criteria:** tabela route → CTA → cel → widoczny temat ma test pokrywający pięć usług i partnera; Voice nie jest przedstawiany jako panel; po ręcznej zmianie tematu query nie nadpisuje wyboru; parametry nie zawierają PII; kontakt canonical bez query; brak martwych kotwic i podwójnych primary.

**Nie zmieniać:** jednego formularza i istniejących linków bez kompatybilności; nie wprowadzać nowych env dla samego kontekstu.

**Zależności:** UX-003 dla docelowych nazw; bezpieczne poprawki celu mogą powstać wcześniej. Zachować aktualny canonical; końcową kontrolę linkowania i canonical wykonać w UX-023 po zmianach IA.

## UX-005 — Zamienić rozwiązania w jeden hub wyboru

**Priorytet:** P1 · M · pewność HIGH.

**Problem:** dwa katalogi, niezgodność Voice/panel, rozbudowane treści sprzedażowe na stronie wyboru.

**Zakres zmiany:** `solutions-page`, treść katalogu, wspólna lista usług i ItemList. Pięć kart problemów prowadzących do istniejących landingów. Panel operacyjny jako ścieżka do developmentu. Uporządkować stare kotwice.

**Desktop:** krótki hub, porównywalne karty; problem i rezultat w każdej bez długich list danych i ograniczeń.

**Mobile:** pięć opcji w jednej kolumnie, bez karuzeli. Pierwsza opcja widoczna na pierwszym ekranie 390 × 844 przy standardowym tekście.

**Copy:** „Który proces chcesz usprawnić?”; nazwy biznesowe zgodne z częścią 4 audytu.

**Acceptance criteria:** dokładnie jeden katalog główny; Voice i agent mają właściwe landingi; panel nie udaje szóstego produktu AI; każda karta prowadzi do szczegółów; ItemList/metadata/UI pochodzą z tej samej macierzy; stara kotwica ma cel lub świadomie poprawione wszystkie odwołania; tekst główny krótszy minimum o około połowę bez utraty ścieżek.

**Nie zmieniać:** istniejących URL-i usług, globalnej palety, ścieżki pomocy „Opisz proces”.

**Zależności:** UX-003, UX-004; test wyboru w UX-028.

## UX-006 — Uczytelnić nawigację dla firmy i software house’u

**Priorytet:** P1 · S/M · pewność MEDIUM.

**Problem:** „Wdrożenia” i „Dla partnerów” słabo objaśniają zawartość; Kontakt i primary CTA dublują się.

**Zakres zmiany:** nazwy w menu/stopce, aktywna sekcja usług, widoczne breadcrumbs na landingach. R&D pozostaje przy studio i w stopce. Nie zmieniać URL tylko dla zgodności z etykietą.

**Desktop:** sprawdzić dopasowanie etykiet przy 921, 1024 i 1440 px, szczególnie granicę breakpointu.

**Mobile:** zachować focus, inert, Escape i blokadę scrolla; kolejność jak w desktop. CTA kontaktu w menu.

**Copy:** „Aplikacje i integracje”, „Dla software house’ów”; MSP rozwinąć, jeżeli pozostaje w ofercie.

**Acceptance criteria:** odbiorca rozpoznaje segment bez otwierania strony; linki działają z JS i odpowiednim fallbackiem; breadcrumbs UI/schema zgodne; aktywna sekcja ma właściwe `aria-current` tam, gdzie odpowiada bieżącej stronie; brak zawijania menu na siebie; wszystkie dotychczasowe trasy osiągalne.

**Nie zmieniać:** dostępnego menu na własny niestandardowy mechanizm; nie dodawać megamenu i branż.

**Zależności:** UX-005. Breadcrumbs wdrożyć zgodnie z docelową IA, a ich przekrojową kontrolę wykonać później w UX-023.

## UX-007 — Skrócić home i zastąpić powtarzany proces przykładem PRZED/PO

**Priorytet:** P1 · M · pewność HIGH dla powtórzeń.

**Problem:** home 10,4–10,8 tys. px, proof po kilku długich opisach tego samego przepływu.

**Zakres zmiany:** home, business-flow, bento i siedmiodniowy etap. Sześć sekcji z części 5 audytu. Wykorzystać nowsze miniwizualizacje tylko jako ilustracje, dopóki nie reprezentują rzeczywistego artefaktu.

**Desktop:** jeden panel przed/po zastępuje sześciokrokowy scrollytelling; proof przed rozbudowanym harmonogramem.

**Mobile:** wejście → wynik → decyzja w jednej kolumnie; zwięzła wizualizacja hero i czytelne etykiety. Primary CTA nadal na pierwszym ekranie przy 390 × 844.

**Copy:** biznesowe czynności i rezultat; brak wymyślonych minut, procentów i „4 → 1” jako stwierdzonego wyniku.

**Acceptance criteria:** obecna długa narracja procesu usunięta lub scalona, nie zachowana pod nową; przykład/proof pojawia się przed harmonogramem i wielokrotnymi zasadami; wyraźnie odróżniono ilustrację od działającego systemu; wysokość całej strony i droga do proof są zmierzone przed/po; zachowana czytelność przy zoomie i brak overflow 360–430 px.

**Nie zmieniać:** logo, palety, głównej koncepcji pierwszego etapu, uczciwych etykiet materiałów.

**Zależności:** UX-003, UX-005, UX-009. Prawdziwy artefakt dostarcza UX-012; strukturę można przygotować wcześniej, bez udawania gotowego proof.

## UX-008 — Uczciwa, wygodna publiczna symulacja

**Priorytet:** P1 · M · pewność HIGH.

**Problem:** statyczna „pewność”, pozorowane sprawdzanie materiałów, nadmiar wyborów, wynik poza ekranem mobile i zduplikowane CTA fallbacku.

**Zakres zmiany:** `knowledge-demo` i strona demo; uporządkować kolejność DOM i prezentacji; trzy przykłady, jasne źródło treści; bezpośrednia kotwica z CTA.

**Desktop:** wejście i wynik blisko siebie; brak pozorowanej latencji.

**Mobile:** po świadomym wybraniu pytania użytkownik widzi początek odpowiedzi. Przewinięcie respektuje reduced motion, focus pozostaje logiczny i nie ginie.

**Copy:** „Symulacja — przygotowane przykłady, bez połączenia z modelem AI”. Usunąć statyczny „Poziom pewności”; źródła nazwać materiałami przykładowymi, jeśli nie są dokumentami do otwarcia.

**Acceptance criteria:** kliknięcie przykładu daje widoczną odpowiedź przy 360/390/430 px; czytnik otrzymuje jedną zrozumiałą aktualizację; fallback nie dubluje CTA; brak zapytań sieciowych z pytaniem; reset i kategorie działają; wejście przez kotwicę omija opis oferty; nie zmieniono symulacji potajemnie w usługę AI.

**Nie zmieniać:** obecnej ochrony lokalności pytań, prawidłowej obsługi nieznanego pytania, dostępności formularza pytania.

**Zależności:** UX-003, UX-004. Niezależne od budowy realnego RAG.

## UX-009 — Rejestr proof i zasady publikowania twierdzeń

**Priorytet:** P1 · M · pewność HIGH.

**Problem:** ten sam materiał jest przedstawiany w różnych kontekstach jako dowód nieodpowiadających mu usług.

**Zakres zmiany:** model danych evidence w core/content i komponent etykiety; inwentaryzacja istniejących artefaktów. Pola: id, typ, usługa, pochodzenie danych, data/wersja, URL, potwierdzony zakres, ograniczenie, metryka z metodą, status publikacji.

**Desktop:** mała czytelna etykieta przy materiale, bez wielkiego panelu disclaimerów.

**Mobile:** etykieta i najważniejsze ograniczenie widoczne bez hovera.

**Copy:** rozdzielić „symulacja”, „projekt własny”, „eksperyment” i „wdrożenie klienta”.

**Acceptance criteria:** każdy publikowany proof ma działający cel i prawdziwą klasyfikację; żadne pole liczbowe nie jest wypełniane przykładem z briefu; brak materiału nie generuje przycisku „zobacz”; dane klienta wymagają potwierdzonego prawa publikacji; strony korzystają z jednego rekordu, nie sprzecznych kopii.

**Nie zmieniać:** uczciwości oznaczenia obecnego raportu; nie dodawać klientów/logo.

**Zależności:** inwentaryzacja z właścicielem; bezpośrednia podstawa UX-010–UX-019/UX-027.

## UX-010 — Zbudować małe prawdziwe demo RAG

**Priorytet:** P2 · L · cel techniczny, nie istniejący wynik.

**Problem:** publiczna symulacja nie dowodzi retrievalu i generacji odpowiedzi ze źródłami.

**Zakres zmiany:** ograniczony korpus publicznych materiałów Protolume; retrieval, generacja, odpowiedź z cytowaniami; backendowy endpoint z limitami, timeoutami i kontrolą kosztów. Przed implementacją ustalić dostawcę/model, budżet, retencję pytań i metodę ewaluacji.

**Desktop:** odpowiedź i źródło można sprawdzić obok siebie; szczegóły techniczne opcjonalne.

**Mobile:** pytanie → odpowiedź → źródło; stany loading/error zachowują pozycję i możliwość ponowienia.

**Copy:** „Nie znajduję tej informacji w udostępnionych materiałach” tylko gdy brak podstaw. Jasna informacja o zewnętrznym przetwarzaniu przed wpisaniem pytania, jeśli występuje.

**Acceptance criteria:** pytanie rzeczywiście uruchamia retrieval i model; cytowania wskazują istniejące fragmenty korpusu; brak podmieniania nieznanych pytań na marketingową odpowiedź; zestaw jawnych testów obejmuje pytania w zakresie, parafrazy, brak danych, sprzeczność, nieistniejące źródło, prompt injection, timeout, 429 i limit kosztów; zapisany raport jakości zawiera liczebność, metodę i wszystkie niepowodzenia. Klucze wyłącznie po stronie backendu; bez dowolnego fetchowania URL użytkownika; limity egzekwowane serwerowo.

**Nie zmieniać:** polityki prywatności przez samą deklarację bez mapy danych; nie wysyłać pytań pozostawiając stare copy o lokalności; nie dodawać procentowej pewności.

**Zależności:** UX-003, UX-009, UX-025; decyzje dostawcy i budżetu. Każdy nowy env przechodzi pełny kontrakt deploymentu z AGENTS.md.

## UX-011 — Własny landing RAG ze sprawdzalnym dokumentem

**Priorytet:** P2 · M · pewność HIGH dla luki.

**Problem:** landing RAG wygląda jak pozostałe usługi i prowadzi do raportu o e-mailach.

**Zakres zmiany:** własny komponent demonstracji i układ z części 6; otwierane źródło, fragment i stan braku odpowiedzi; zachowanie wspólnych bazowych komponentów.

**Desktop:** dokument i odpowiedź w dwóch kolumnach.

**Mobile:** źródło w dostępnej sekcji po odpowiedzi; zamknięcie wraca do odpowiedniego odnośnika.

**Copy:** najpierw rezultat wiedzy firmy, potem chatbot/RAG jako termin; trzy pytania FAQ właściwe dla źródeł, aktualizacji i dostępu.

**Acceptance criteria:** primary proof pasuje do usługi; źródło faktycznie się otwiera; numer strony/sekcja odpowiada treści; stan braku danych i błędu działa; nie powiela czterech osobnych bloków zakresu/ograniczeń; tytuł, H1 i linkowanie zachowują intencję RAG.

**Nie zmieniać:** URL i pochodzenia przykładu; nie publikować nowego `/demo/...` z pustą treścią.

**Zależności:** UX-004, UX-009, UX-010. Wariant tymczasowy może linkować do jawnej symulacji z UX-008, ale nie spełnia kryterium realnego proof.

## UX-012 — Wykonać przykład automatyzacji wiadomość → CRM

**Priorytet:** P1 · L · najważniejszy nowy materiał biznesowy.

**Problem:** strona opisuje automatyzację, ale nie pokazuje rzeczywistego wyniku w systemie.

**Zakres zmiany:** jeden działający proces na danych demonstracyjnych i sandboxie; wejście, odczyt pól, propozycja zmiany, akceptacja, zapis/status. Krótkie nagranie lub kontrolowany interaktywny przebieg i zrzuty do home/landingu.

**Desktop:** wejście i wynik porównywalne na jednym ekranie; log pomocniczy.

**Mobile:** trzy zwarte kroki; bez miniaturowego dashboardu.

**Copy:** nazwać wykonywane czynności i rolę pracownika. Nie przypisywać oszczędności bez porównywalnego pomiaru.

**Acceptance criteria:** zapis w sandboxie rzeczywiście zachodzi; istnieje przykład brakującego pola i duplikatu; akceptacja jest egzekwowana, a nie tylko narysowana; powtórzenie nie tworzy niezamierzonych rekordów; artefakt opisuje datę, dane, wykonany zakres i ograniczenia; brak kontaktu z klientami/produkcyjnym CRM w publicznym demo.

**Nie zmieniać:** rzeczywistych danych klientów; nie stosować atrap jako dowodu integracji.

**Zależności:** UX-009 i wybór rzeczywiście dostępnego sandboxa; UX-025 dla przepływów danych. Zasób wspólny UX-007 i landingu automatyzacji.

## UX-013 — Voice AI: nagranie, transkrypcja i rezultat

**Priorytet:** P2 · L · wymagany prawdziwy materiał audio.

**Problem:** tekstowy landing nie pozwala ocenić głosu i przebiegu rozmowy.

**Zakres zmiany:** nagrać działający system w demonstracyjnym scenariuszu; przygotować player, transkrypcję, wynik ekstrakcji i moment przekazania. Osobne krótkie trudniejsze zdarzenie zamiast wyłącznie idealnej rozmowy.

**Desktop:** audio/transkrypcja obok wyniku dla pracownika.

**Mobile:** duży play/pause, czas i przewijanie; transkrypcja czytelna bez audio i bez mikrofonu.

**Copy:** „Posłuchaj rozmowy demonstracyjnej”; zaznaczyć montaż i pochodzenie danych zgodnie z prawdą.

**Acceptance criteria:** plik istnieje i odtwarza się; brak autoplay; pola rezultatu odpowiadają nagraniu; przy błędzie pozostaje transkrypcja; controls obsługiwane klawiaturą; audio nie pobiera się w całości przy wejściu na home; są prawa do użycia głosu/nagrania; nie ma pustego CTA przed przygotowaniem materiału.

**Nie zmieniać:** numerów/konfiguracji telefonii klientów; nie syntetyzować testimonialu ani udawać prawdziwego klienta.

**Zależności:** UX-004, UX-009, UX-025 i rzeczywisty system do nagrania.

## UX-014 — Integracje: konwersacja i stan CRM

**Priorytet:** P2 · L · wymagany sandbox integracji.

**Problem:** WhatsApp i CRM nie mają własnego proof; strona pokrywa się z automatyzacją.

**Zakres zmiany:** pokazać jedno rzeczywiste zdarzenie z oficjalnego kanału testowego do sandboxa CRM, mapowanie klienta/pól, właściciela, status i obsługę ponownego zdarzenia. Nie obiecywać zgodności z każdym CRM.

**Desktop:** rozmowa obok rekordu; techniczny payload pod rozwinięciem.

**Mobile:** rozmowa nad rekordem, czytelne pola; brak poziomego overflow strony.

**Copy:** „Po rozmowie sprawa ma właściciela i status w CRM”; nazwy integracji zgodne z testowanym dostawcą.

**Acceptance criteria:** istnieje wykonany zapis z identyfikatorem zdarzenia i zanonimizowanym wynikiem; sprawdzono retry/duplikat; nagranie/UI nie sugeruje automatycznego wysyłania wiadomości, jeśli nie jest częścią testu; informacja o danych i ograniczeniach jest aktualna; primary proof nie prowadzi do ogólnego raportu e-mailowego.

**Nie zmieniać:** istniejącego URL, prywatnych konwersacji, uprawnień produkcyjnych klientów.

**Zależności:** UX-009, UX-012 dla współdzielonego sandboxa jeśli pasuje; dostęp do testowego kanału; UX-025.

## UX-015 — Systemy agentowe: zadanie, wykonanie i kontrola

**Priorytet:** P2 · L · wymagany rzeczywisty przebieg.

**Problem:** nie widać różnicy względem zwykłego workflow; brak trace i wyniku wieloetapowego zadania.

**Zakres zmiany:** jeden rzeczywisty scenariusz z co najmniej dwiema zależnymi operacjami, weryfikacją wyniku, punktem akceptacji i obsługą błędu. Z trace generować timeline i ewentualnie graf.

**Desktop:** wynik zadania nad grafem; węzły otwierają faktycznie wykonane kroki.

**Mobile:** lista etapów z rozwinięciami, bez rozległego grafu na 360 px.

**Copy:** problem wieloetapowej pracy przed terminem agent; opisać, dlaczego ten przypadek wymaga AI, jeśli zwykłe reguły nie wystarczają.

**Acceptance criteria:** trace odpowiada wykonaniu; narzędzia i wynik są rzeczywiste; timeout/błąd i przekroczenie budżetu mają kontrolowaną ścieżkę; akceptacja poprzedza zewnętrzną zmianę; metryki koszt/czas mają źródło pomiaru; brak sekretów i danych klienta w logu publicznym.

**Nie zmieniać:** granic uprawnień; nie pokazywać przypadkowego grafu jako faktycznej orkiestracji.

**Zależności:** UX-004, UX-009, UX-025; zaakceptowany scenariusz i budżet techniczny.

## UX-016 — Development: pokazać dostarczane kompetencje

**Priorytet:** P1 · M · pewność HIGH.

**Problem:** opis planowania dominuje nad tym, co firma potrafi zbudować i przekazać.

**Zakres zmiany:** development page i treść; usunąć identyczny lead, scalić zasady; dodać capability areas powiązane z wykonanym projektem. Przygotować bezpieczny, udostępnialny fragment własnego delivery: UI/API/testy/Docker/README/architektura.

**Desktop:** artefakt na początku, trzy typy projektów i konkretne przekazanie dalej.

**Mobile:** krótszy H1, rezultat przed zasadami; repo jako lista plików z opisem, nie drobny obraz terminala.

**Copy:** „Aplikacje i integracje do codziennej pracy zespołu”; nazwy technologii tylko w kontekście funkcji i sprawdzonego wykonania.

**Acceptance criteria:** identyczny lead występuje raz; nie ma osobnych powtarzających się bloków zasad/wyceny/kryteriów; minimum jeden realny artefakt powiązany z kompetencją; zakres „gotowy projekt” prowadzi do kontaktu bez wymuszania demo; auth/RAG/vector DB nie pojawiają się jako wykonane tylko z inicjatywy autora copy.

**Nie zmieniać:** URL, możliwości wdrożeń niestandardowych, uczciwego zakresu maintenance.

**Zależności:** UX-003, UX-009; artefakt może być współdzielony z UX-017/018. Udostępnienie prywatnego kodu wymaga świadomej decyzji właściciela.

## UX-017 — Partnerzy: PR, CI i przykładowe przekazanie modułu

**Priorytet:** P1 · M · pewność HIGH.

**Problem:** white-label i repo już są opisane, ale proces techniczny nie jest pokazany.

**Zakres zmiany:** partner page; paczka przykładowego modułu i fragment faktycznego PR/CI; workflow wejścia do repo, review, testów, przekazania. Doprecyzować MSP i uzgodnienia NDA/ownership.

**Desktop:** zachować dobry podział hero/dopasowanie; dowód techniczny przed długimi formalnościami.

**Mobile:** czytelne pliki i checks; długi diff opcjonalnie; jedna akcja kontaktu.

**Copy:** usunąć zdanie podkreślające brak logotypów klientów; „Zobacz przykładowe przekazanie”; kontakt „Opisz moduł”.

**Acceptance criteria:** pokazany projekt można uruchomić według instrukcji; testy i checks odpowiadają faktycznemu stanowi, nie rysunkowi; white-label, repo, odpowiedzialność za deploy i handover są czytelne przed FAQ; brak fałszywych zapewnień o NDA lub przeniesieniu praw; kontakt zachowuje kontekst partnera.

**Nie zmieniać:** rozdzielenia klienta końcowego i partnera, rzeczywistych zasad poufności i własności.

**Zależności:** UX-004, UX-009, UX-016 dla wspólnej paczki; potwierdzenie faktycznego sposobu pracy.

## UX-018 — Studio: osoba, wykonana praca i odpowiedzialność

**Priorytet:** P1 · M · pewność MEDIUM/HIGH.

**Problem:** strona długo powtarza odpowiedzialność, a słabo pokazuje człowieka i kompetencję.

**Zakres zmiany:** studio page; jeden blok zasad zamiast kilku; krótkie bio, prawdziwe zdjęcie, sprawdzone projekty, pomocnicza edukacja i lata. Własna strona jako przykład konkretnego delivery, nie ogólny dowód zaawansowanego AI.

**Desktop:** osoba i przykłady pracy blisko siebie; mniej kart o tej samej treści.

**Mobile:** nazwisko, rola, CTA i jeden dowód przed długą historią; zdjęcie o umiarkowanej wysokości.

**Copy:** pierwsza osoba i prosty język; brak przypisywania uzyskanego stopnia bez potwierdzenia; nie wymyślać historii foundera.

**Acceptance criteria:** pełna informacja o odpowiedzialności występuje w jednym miejscu, odnośniki mogą ją streszczać; edukacja zgodna z aktualnym statusem; zdjęcie autentyczne i użyte za zgodą; linki do projektów działają; treść krótsza około 40% przy zachowaniu istotnych faktów; nie sugeruje nieistniejącego zespołu/dyżurów.

**Nie zmieniać:** jawnej tożsamości Piotra i oznaczenia projektów własnych.

**Zależności:** UX-009, UX-016/017 i materiały od właściciela; brak zdjęcia nie uzasadnia wygenerowanego portretu innej osoby.

## UX-019 — R&D: jeden odtwarzalny eksperyment

**Priorytet:** P2 · L · zależne od realnej pracy badawczej.

**Problem:** opisy eksperymentów nie zawierają wyników, metody i artefaktów.

**Zakres zmiany:** research page i model notatki; wyróżniony eksperyment z hipotezą, baseline, setupem, zbiorem, metryką, wynikiem, kosztem, wnioskiem, statusem, datą i linkiem. Pozostałe tematy mogą zostać krótkimi planami.

**Desktop:** wynik i porównanie jako główny element; metoda niżej.

**Mobile:** wynik w kilku wartościach z definicjami; szerokie tabele zastąpione czytelnym układem.

**Copy:** konkretne pytanie badawcze; ograniczenie przy wyniku zamiast osobnego manifestu.

**Acceptance criteria:** wynik da się powiązać z raportem/uruchomieniem; opisano zbiór i ograniczenia; wartości z briefu nie zostały użyte jako wyniki; podano niepowodzenia i metodę oceny; status „zweryfikowane” ma datę i uzasadnienie; nowy URL tylko z samodzielną treścią.

**Nie zmieniać:** planów w „ukończone projekty” samą zmianą etykiety; nie deklarować produkcyjnej skuteczności z eksperymentu.

**Zależności:** UX-009; może korzystać z ewaluacji UX-010/015. Potrzebny czas i materiał na eksperyment.

## UX-020 — Skrócić wstęp kontaktu i poprawić drobne tarcie pól

**Priorytet:** P1 · S/M · pewność HIGH.

**Problem:** pierwszy input mobile dopiero około y=681, minimum 20 znaków nie jest komunikowane, intro wielokrotnie zapowiada następny krok.

**Zakres zmiany:** contact page/form copy i układ; skrócenie wstępu, wskazanie minimum opisu, zachowanie opcjonalnego budżetu. Rozważyć pole Imię zgodnie z realną potrzebą danych.

**Desktop:** zachować dwie kolumny i wielkość pól.

**Mobile:** pierwszy input wyraźnie wcześniej, docelowo do y=450 przy 390 × 844; tekst nie może zostać ukryty przed czytnikiem tylko dla pozornego skrócenia.

**Copy:** „Wystarczą 2–3 zdania…”; jeden prawdziwy termin odpowiedzi po potwierdzeniu; „Wyślij opis”.

**Acceptance criteria:** brak utraty wpisanego tekstu przy błędzie; minimum opisu widoczne przed wysłaniem; errors powiązane i focus po callbacku na podsumowaniu; budżet opcjonalny; firma bez wymogu; zachowane autocomplete; testy 422/429/awarii API i sukcesu na środowisku testowym; produkcyjna wysyłka tylko jako uzgodniony test, nie przypadkowy lead.

**Nie zmieniać:** endpointu/ochrony antyspamowej bez potrzeby, mailto, pól na obowiązkowe, semantyki „zapytanie, nie zamówienie”.

**Zależności:** UX-004 dla tematu; UX-025 dla checkboxa. Termin odpowiedzi wymaga potwierdzenia Piotra, ale resztę UI można poprawić wcześniej.

## UX-021 — Raport: streszczenie, spójne statusy i rzeczywisty PDF

**Priorytet:** P1 · M · pewność HIGH.

**Problem:** summary istnieje, ale jest rozproszone; trzeci scenariusz ma niejasny status; PDF to wyłącznie druk systemowy.

**Zakres zmiany:** demo-example page/content/print; połączyć hero ze streszczeniem, poprawić semantykę statusów, scalić powtórzenia, dodać spis treści. PDF z tego samego źródła danych i etykietą fikcyjnego przykładu.

**Desktop:** decyzja, scenariusze i następny krok przed rejestrem ryzyk; szczegóły nadal dostępne.

**Mobile:** krótkie summary w pierwszej warstwie; raport szczegółowy pod rozwinięciami lub niżej. Pobranie bez dialogu drukowania.

**Copy:** rozdzielić „pokazano ścieżkę” od „zweryfikowano jakość”; nie publikować „2/3 potwierdzono” bez określenia kryterium.

**Acceptance criteria:** wszystkie statusy mają objaśnienie i są zgodne z opisanym testem; brak dwóch pełnych sekcji tej samej rekomendacji; licznik scenariuszy wyliczony z danych; URL PDF odpowiada `application/pdf` i pobiera plik; PDF wizualnie sprawdzony, z polskimi znakami, datą, tekstem możliwym do zaznaczenia i disclaimerem; WWW/PDF nie rozchodzą się treścią. Druk systemowy pozostaje opcją.

**Nie zmieniać:** materiału w case study; nie publikować go jako wyniku zbudowanego systemu z innego scenariusza.

**Zależności:** UX-003, UX-009; generowanie dokumentu według właściwego workflow PDF. Dla pliku PDF nie ma potrzeby nowego backendu, jeśli wystarczy artefakt statyczny z buildu.

## UX-022 — Wspólne detale mobile i dostępności

**Priorytet:** P2; kontrola ruchu P1 · M · pewność HIGH/MEDIUM.

**Problem:** 10-sekundowa automatyczna pętla hero bez kontroli, drobny mikrotekst, 27-pikselowe summary i niespójna gęstość hero/kart.

**Zakres zmiany:** wykorzystać nowe tokeny i warianty kart z HEAD; dać statyczny hero lub świadome uruchomienie/pauzę; wygodne FAQ; reflow nowych artefaktów i tekstów.

**Desktop:** kontrola ruchu i focus bez zmiany położenia elementu pod kursorem; utrzymać szerokość czytelną dla treści.

**Mobile:** min. 44 px aktywnego wiersza FAQ jako cel wygody, nie fałszywy cytat WCAG AA; padding zwykle 16–24 px; żadnego sticky elementu zasłaniającego pola/klawiaturę systemową.

**Copy:** etykiety biznesowe po polsku; duże nagłówki skracać semantycznie, nie przez agresywne zmniejszenie fontu.

**Acceptance criteria:** keyboard-only menu/FAQ/demo/form; reduced motion bez pętli; widoczny focus niezasłonięty nagłówkiem; reflow 360/390/430/921/1024/1440 i zoom 200%, dodatkowa kontrola przy efektywnej szerokości 320 px; brak poziomego scrolla poza świadomie opisanym technicznym regionem; NVDA/VoiceOver i fizyczny mobile sprawdzone w uzgodnionym zakresie; wyniki nie są nazywane pełnym certyfikatem WCAG.

**Nie zmieniać:** natywnych kontrolek na custom tylko dla wyglądu; nie dodawać globalnego sticky CTA bez wykazanego problemu.

**Zależności:** UX-001/002/007/008 oraz nowe komponenty. Podstawową kontrolę ruchu wykonać wcześniej niż końcowy polish.

## UX-023 — Spójność SEO, linkowania i metadanych

**Priorytet:** P2; dwa błędy copy S do fazy 1 · M · pewność HIGH dla konkretnych błędów.

**Problem:** powtórzona marka w description hubu, zła odmiana nazwiska, niespójny katalog schema i płytkie breadcrumbs.

**Zakres zmiany:** route metadata, SEO generator/shell, hub ItemList, breadcrumbs; przegląd intencji i anchorów. Obraz OG nadal prawdziwy i dostępny.

**Desktop:** widoczne breadcrumbs nie konkurują z H1.

**Mobile:** breadcrumbs mogą zawijać się czytelnie; nie przewijają całej strony w poziomie.

**Copy:** poprawić „Protolume. Protolume.” i „z Piotr Barabasz”; title/description każdej strony odpowiada jej roli z audytu.

**Acceptance criteria:** 15 istniejących tras ma prawidłowy status, jeden H1, unikalny title/description, właściwy canonical i OG; HTML przed JS zawiera treść i JSON-LD; schema odzwierciedla aktualny UI; link checker nie znajduje martwych kotwic; sitemap zawiera wyłącznie publiczne kanoniczne strony; query kontaktu nie tworzy kopii; 404 pozostaje 404 z `noindex, follow`. Kanibalizacja oceniona dopiero z GSC, bez automatycznych cross-canonical.

**Nie zmieniać:** `PUBLIC_SITE_INDEXING=true`, istniejących URL-i, schema na fikcyjne dane/adres/oceny, FAQ w masowe landingowe wypełniacze.

**Zależności:** UX-005/006/021; odrębny dostęp do GSC dla części analitycznej.

## UX-024 — Opcjonalna ścieżka krótkiej rozmowy

**Priorytet:** P3 · S/M · pewność LOW/MEDIUM co do wpływu.

**Problem:** część zainteresowanych może chcieć od razu umówić rozmowę, ale nie wiemy, czy kalendarz jest potrzebny.

**Zakres zmiany:** najpierw ocena zapytań i możliwości slotów; jeśli decyzja pozytywna, link do 20-minutowej rozmowy przy kontakcie i partnerach. Preferować link nad ciężkim embedem.

**Desktop:** opcja obok e-maila, nie drugi konkurencyjny lejek w każdym hero.

**Mobile:** czytelny link; bez automatycznego otwierania aplikacji i bez zasłaniania formularza.

**Copy:** „Umów 20-minutową rozmowę” tylko przy rzeczywistej dostępności i takiej długości slotu.

**Acceptance criteria:** sloty faktycznie dostępne; jasna strefa czasowa i potwierdzenie; można wrócić do formularza; znane dane/dostawca zewnętrzny; brak automatycznego przekazywania treści wiadomości w URL; mierzony no-show i jakość odbytych rozmów.

**Nie zmieniać:** formularza i mailto w obowiązkowy kalendarz; nie publikować pustych slotów jako aktywnej oferty.

**Zależności:** decyzja Piotra, UX-025, UX-028. Bez tej decyzji zadanie pozostaje opcjonalne, a reszta backlogu postępuje.

## UX-025 — Prywatność zgodna z rzeczywistymi przepływami danych

**Priorytet:** P1 · M · wymaga ustaleń operacyjnych i prawnych.

**Problem:** dokument formularza nie opisuje w pełni witryny, a checkbox zgody i podstawy przetwarzania nie są spójnie wyjaśnione.

**Zakres zmiany:** mapa danych formularz/API/SMTP/hosting/logi/rate limit/demo/analityka/kalendarz; administrator, adres kontaktowy, odbiorcy, transfery, podstawy, retencja i prawa. Po przeglądzie prawnym zaktualizować dokument, copy i ewentualnie wymóg consent we frontendzie/backendzie.

**Desktop:** czytelna kolumna i prosty spis treści przy dłuższym dokumencie.

**Mobile:** krótkie akapity i działające linki, bez marketingowych kart między obowiązkami informacyjnymi.

**Copy:** prosty opis faktycznych przepływów; nie twierdzić, że brak cookies oznacza brak przetwarzania danych.

**Acceptance criteria:** dokument i aplikacja opisują ten sam stan; każda przesłanka przypisana do celu; wymagane dane i konsekwencje niepodania wyjaśnione; adres korespondencyjny rzeczywiście użyteczny, jeśli tak opisany; retencja/transfery potwierdzone z konfiguracją i umowami; zmiana checkboxa obejmuje API/tests, nie tylko HTML; realny RAG nie zachowuje komunikatu „pytanie nie jest wysyłane”; brak bannera cookies, jeśli analiza nie wykazała potrzeby.

**Nie zmieniać:** podstaw prawnych przez zgadywanie; nie usuwać ochrony antyspamowej ani przechowywać treści kontaktów w analytics.

**Zależności:** dane od administratora i konsultacja prawnika. Nowe przepływy z UX-010/024/028 wymagają aktualizacji przed uruchomieniem.

## UX-026 — Wyjaśnić koszt pierwszego etapu bez fikcyjnego cennika

**Priorytet:** P2 · S/M · pewność MEDIUM.

**Problem:** niejasne rozdzielenie bezpłatnej prezentacji i płatnego przygotowania; brak kontekstu inwestycji.

**Zakres zmiany:** zebrać rzeczywiste wyceny i model pracy; ustalić cenę od/widełki/pakiety albo świadomie brak kwot. W UI opisać rezultat i co wpływa na wycenę, w jednym miejscu zamiast rozproszenia.

**Desktop:** zwięzła karta pierwszego etapu, bez tabeli pakietów, jeśli nie są realną ofertą.

**Mobile:** rezultat i płatność przed szczegółami zależności; proste warunki bez mikrotekstu.

**Copy:** bezpłatna rozmowa/prezentacja i płatne demo zgodnie z decyzją UX-003; kwoty tylko potwierdzone przez właściciela, z jednostką, VAT i zakresem tam, gdzie właściwe.

**Acceptance criteria:** klient wie, kiedy pojawia się płatność i wycena; cena minimalna odpowiada rzeczywiście dostępnemu zakresowi; koszty integracji/usług i utrzymania rozróżnione; NO-GO opisane zgodnie z zasadami etapu; żadne widełki nie zostały wymyślone przez agenta; hipoteza wpływu ma plan weryfikacji jakości leadów.

**Nie zmieniać:** opcjonalnego budżetu w obowiązkowy; nie publikować konkurencyjnych stawek jako cennika Protolume.

**Zależności:** UX-003, dane wycen i decyzja właściciela, UX-028.

## UX-027 — Przygotować proces pozyskiwania prawdziwych case studies

**Priorytet:** P2 · M · poza samym kodem.

**Problem:** brak publicznego biznesowego proof; ryzyko zastępowania go przykładami prezentowanymi zbyt mocno.

**Zakres zmiany:** formularz zbierania dowodu projektu: problem/przed/zakres/po/wolumen/okres/metryka/rola człowieka/koszt/ograniczenia/zgoda. Szablon case study i proces zatwierdzenia; do tego czasu sekcja projektów własnych.

**Desktop:** wynik z kontekstem, ekran systemu i opis zakresu; nie ogromny pusty logo wall.

**Mobile:** wynik i źródło pomiaru przed detalami; wykres ma opis tekstowy.

**Copy:** referencje i liczby z zatwierdzonych danych; anonimowy projekt opisany jako anonimowy. Nie mylić czasu pracy operatora z czasem kalendarzowym procesu.

**Acceptance criteria:** istnieje szablon i lista danych potrzebnych od projektu; każda publikowana liczba ma podstawę, okres i mianownik; potwierdzona zgoda klienta na materiał; rola Protolume oddzielona od reszty projektu; nowy `/realizacje/...` tylko z pełnym materiałem; brak przykładów „300 spraw” jako faktycznej metryki.

**Nie zmieniać:** fikcyjnego raportu w case study; nie wymyślać klientów, cytatów ani branż.

**Zależności:** UX-009 i rzeczywisty projekt/zgoda. Sam szablon można przygotować wcześniej.

## UX-028 — Pomiar lejka i badania decyzji użytkownika

**Priorytet:** P2 · M · potrzebne do oceny CRO.

**Problem:** brak danych do oceny konwersji, ceny, kalendarza i kanibalizacji; sam audyt ekspercki nie dowodzi efektu zmian.

**Zakres zmiany:** plan zdarzeń i kwalifikacji leadów, test 10 sekund, zadania wyboru usługi, test proof; analiza GSC. Dopiero później świadomie dobrane narzędzie analytics i ewentualne A/B.

**Desktop:** mierzyć te same intencje co mobile; nie traktować hovera jako obejrzenia dowodu.

**Mobile:** odróżnić wyświetlenie sekcji od użycia demo i rozpoczęcia formularza; test na realnym urządzeniu.

**Copy:** pytania badawcze neutralne, bez sugerowania „lepszej” wersji lub konieczności AI.

**Acceptance criteria:** definicje `proof_view`, `proof_interaction`, `source_open`, `contact_start`, błędu i sukcesu opisane; sukces po odpowiedzi API, nie po kliknięciu; brak PII i treści zapytań w eventach; kwalifikowany lead ma uzgodnioną definicję i może być oceniany ręcznie; A/B ma MDE/liczebność/okres/guardrails przed startem; przy zbyt małym ruchu badania jakościowe zamiast pozornej istotności. Raport rozdziela wyniki lab, field i sprzedażowe.

**Nie zmieniać:** witryny w ciężki zestaw trackerów; nie publikować zmyślonego wzrostu konwersji na podstawie oceny eksperckiej.

**Zależności:** UX-025 dla wdrożenia pomiaru, dostęp do GSC/analytics i możliwość rozmów z użytkownikami. Plan badań można przygotować bez tych dostępów.
