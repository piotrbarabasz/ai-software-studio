# Protolume — audyt UX, oferty, wiarygodności i konwersji

**Data: 7 września 2026. Badana witryna: https://protolume.pl/.**

**Wniosek:** Protolume potrzebuje przede wszystkim lepszej drogi od obietnicy do dowodu działania. Identyfikacja wizualna jest wystarczająco dobra, żeby ją rozwijać. Największy potencjał mają: naprawa usterek startu strony, uproszczenie katalogu, doprecyzowanie pierwszego płatnego etapu oraz pokazanie rzeczywiście wykonanej pracy właściwej dla każdej usługi.

**Nawigacja po raporcie:**

1. [Executive summary i oceny](#część-1--executive-summary)
2. [Problemy strategiczne i wszystkie 35 hipotez](#część-2--problemy-strategiczne-i-weryfikacja-hipotez)
3. [Audyt każdej strony](#część-3--audyt-strona-po-stronie)
4. [Docelowa architektura informacji](#część-4--docelowa-information-architecture)
5. [Homepage sekcja po sekcji](#część-5--docelowa-struktura-homepage)
6. [Siedem struktur landingów](#część-6--system-landingów-o-różnych-strukturach)
7. [System dowodów działania](#część-7--architektura-proof)
8. [Copy, CTA, SEO i zasady treści](#część-8--copy-cta-oraz-reguły-treści)
9. [28 zadań do implementacji](BACKLOG.md)
10. [Fazy wdrożenia i plan badań](#część-10--kolejność-wdrożenia-i-weryfikacja-wpływu)

Pomiary, zrzuty i ograniczenia metodologii: [DOWODY.md](DOWODY.md).

## Jak czytać raport i co faktycznie sprawdzono

To audyt aktualnej produkcji, a następnie projekt rekomendowanych zmian. Nie jest to raport z wdrożenia tych rekomendacji.

- Otworzono wszystkie **15 tras z publicznej sitemap**, pięć landingów rozwiązań, politykę prywatności i dodatkowy nieistniejący adres. Sprawdzono HTTP, HTML przed JavaScriptem, treść po uruchomieniu aplikacji, metadane, nagłówki, linki, obrazy i żądania sieciowe.
- Wykonano zrzuty całych stron i pierwszego ekranu przy **1440 × 1000** oraz **390 × 844 CSS px**. Dodatkowo sprawdzono geometrię 15 stron przy **360, 430, 921 i 1024 px**. To emulacja w Chromium 151, nie test na fizycznym iPhonie lub Androidzie.
- Wykonano axe na 15 stronach w szerokości 390 px z ograniczonym ruchem. Sprawdzono klawiaturą skip link, otwarcie i zamknięcie menu, FAQ, niepoprawny formularz i dwa scenariusze demo. Nie wysłano wiadomości kontaktowej. Sukces SMTP nie został potwierdzony w produkcji.
- Wykonano Lighthouse **13.4.1**: trzy zimne wejścia mobile na home, po jednym na kontakt i RAG oraz jedno desktop na home. Szczegółowe ustawienia i wyniki są w [pakiecie dowodowym](DOWODY.md). Wyniki laboratoryjne nie są danymi Core Web Vitals użytkowników.
- Porównano produkcję z repozytorium. **Produkcja deklaruje build `8386de6`; HEAD repozytorium to `2ff41c3`**. Późniejszy commit zmienia 25 plików i zawiera m.in. poprawki semantycznych kolorów oraz miniwizualizacje proof. Dlatego stan produkcji i gotowość kodu opisano osobno. Nowszego commita nie uznano automatycznie za przetestowane rozwiązanie problemów produkcyjnych.
- Nie było dostępu do analytics, Search Console, CrUX, danych sprzedażowych, listy klientów, kalendarza, umów z dostawcami ani wyników projektów. Nie oszacowano rzeczywistego współczynnika konwersji, ROI ani pozycji w Google.

**Oznaczenia:** FAKT — pomiar lub bezpośrednio sprawdzona treść; OBSERWACJA — ocena interfejsu; HIPOTEZA — możliwy wpływ wymagający badania; REKOMENDACJA — projekt zmiany. HIGH oznacza mocny dowód występowania problemu, a nie pewność wzrostu sprzedaży. P0 — pilna usterka produkcyjna; P1 — istotne tarcie lub brak wiarygodności; P2 — rozwój; P3 — opcjonalne ulepszenie.

## Część 1 — Executive summary

### Oceny

Oceny są oceną ekspercką obecnej witryny, nie wynikiem badań ilościowych. Skala: 5 = użyteczne, ale z istotnymi brakami; 8 = mocne i przekonujące; 10 = wyjątkowe oraz zweryfikowane w użyciu.

| Obszar | Ocena / 10 | Uzasadnienie |
|---|---:|---|
| Cała witryna | **6,3** | Dobry fundament i spójna intencja sprzedażowa; słabsza demonstracja kompetencji i długa droga do dowodu. |
| UX | 6,5 | Czytelne akcje, sprawne podstawy formularza i nawigacji; nadmiar warstw, powtórzeń i przewijania. |
| UI | 7,2 | Rozpoznawalna paleta, typografia i kontrolowane komponenty; krytyczny kontrast w sekcji proof oraz monotonia części landingów. |
| Clarity | 6,0 | Wiadomo, że chodzi o automatyzację; nie jest równie jasne, co dokładnie kupuje się w pierwszym etapie. |
| Trust | 6,0 | Jawny właściciel, brak fikcyjnych klientów, realistyczne granice; mało niezależnie sprawdzalnych artefaktów. |
| Conversion potential | 5,8 | Jest sensowny początek lejka, ale kolejne ekrany częściej opisują współpracę niż zwiększają pewność decyzji. |
| Technical credibility | 5,5 | Technologia jest opisywana; mało kodu, działających integracji, pomiarów i technicznych rezultatów na stronie. To ocena komunikacji, nie umiejętności Piotra. |
| Mobile | 6,2 | Dobry reflow i duże główne CTA; bardzo długie strony, niewidoczny wynik demo po kliknięciu i niestabilność startu. |
| SEO/content | 7,0 | Mocne techniczne podstawy; słabsze rozdzielenie intencji i niewiele unikalnego materiału na landingach. |

### Pięć największych mocnych stron

1. **Jeden proces jako punkt startu.** To zrozumiała jednostka rozmowy, łatwiejsza do kupienia niż ogólna „transformacja AI”.
2. **Jawna odpowiedzialność Piotra Barabasza.** Klient nie musi zgadywać, kto wykona pracę. Founder-led positioning już istnieje i warto je uprościć, nie wynajdywać ponownie.
3. **Uczciwe oznaczanie materiałów demonstracyjnych.** Raport jest fikcyjny i tak opisany; symulacja ma własne oznaczenie. Nie ma wymyślonych wdrożeń ani liczników sukcesu.
4. **Dobry fundament formularza i dostępności.** Etykiety, autocomplete, powiązane błędy, opcjonalny budżet, skip link, Escape w menu i focus po błędzie rzeczywiście działają.
5. **Rozsądne podstawy publikacji.** Każda sprawdzona strona ma jeden H1, własny title, canonical i HTML z treścią przed JS. Sitemap obejmuje publiczne trasy, a nieistniejący adres zwraca prawdziwe 404 z `noindex, follow`.

### Dziesięć największych problemów

1. **P0 — migotanie i duży skok układu przy uruchomieniu aplikacji.** Dwa z trzech mobilnych pomiarów home: CLS 0,916; kontakt i RAG również 0,916. W niezależnej obserwacji `main` na moment ma wysokość 0.
2. **P0 — ciemne nagłówki na ciemnym tle w sekcji proof.** Kontrast H2 około 1,07:1, dwóch H3 około 1,27:1. Nowszy kod zawiera kierunkową poprawkę, której nie ma w badanej produkcji.
3. **P1 — kilka znaczeń słowa „demo”.** Symulacja UX, bezpłatna prezentacja, klikalny prototyp, działająca automatyzacja i płatny etap siedmiodniowy są zbyt blisko siebie.
4. **P1 — jeden raport zastępuje proof pięciu różnych usług.** Wszystkie pięć landingów prowadzi w hero do raportu o e-mailach; Voice AI nie daje odsłuchać głosu, RAG nie daje sprawdzić retrievalu.
5. **P1 — dwie niespójne taksonomie na `/rozwiazania`.** Różnica nie jest wyłącznie językowa: Voice AI występuje w linkach do landingów, a panel operacyjny w drugim katalogu.
6. **P1 — nadmiar procesu przed rezultatem.** Na desktop home nagłówek proof zaczyna się około 6280 px; na mobile około 5815 px. Dużą część dystansu zajmuje powtórzenie procesu pokazanego już w hero.
7. **P1 — słaba demonstracja engineeringu i wtórna treść landingów.** Powtarzalne sekcje o zakresie nie zastępują kodu, UI, wyniku testu lub integracji.
8. **P1 — utrata intencji kontaktu.** CTA Voice AI i systemów agentowych w hero ustawiają temat formularza na „Aplikacja albo panel”. „Zobacz demo” prowadzi zaś najpierw do strony sprzedażowej.
9. **P1 — mobilne demo odpowiada poza widocznym ekranem.** Po wybraniu pytania wynik zaczynał się około 962 px poniżej górnej krawędzi viewportu o wysokości 844 px. Użytkownik zostaje przy przyciskach pytań.
10. **P1 — niedokończona warstwa prywatności i zasad kontaktu.** Polityka dotyczy głównie formularza; checkbox używa zgody, podstawy opisują inne przesłanki, a pozostałe przepływy danych nie są wyjaśnione. Wymaga to doprecyzowania operacyjnego i prawnego.

### Co klient rozumie w 10 i 60 sekund

**W 10 sekund:** rozumie „automatyzacja + 7 dni + opisz proces”. Z subhero może zrozumieć, że chodzi o demo. Słabiej odpowie na „dla jakiej firmy?”, „czy to faktycznie działa?” oraz „czy pierwszy etap jest płatny?”. Na mobile główne CTA home jest widoczne bez przewijania, około y=476 px — nie trzeba naprawiać czegoś, co już działa.

**W 30–60 sekund:** może rozpoznać swój problem w wiadomościach, dokumentach i wiedzy firmy. Trudniej sprawdzić kompetencje, porównać usługi i znaleźć namacalny rezultat. To hipoteza z przebiegu ścieżek, do weryfikacji przez 5–8 osób z grupy kupujących.

## Część 2 — Problemy strategiczne i weryfikacja hipotez

### S1. Niestabilny start strony

**Problem / dlaczego:** początkowo wyrenderowana treść jest usuwana i tworzona ponownie. Nawet szybkie pobranie małych plików nie zapewnia stabilnego interfejsu.

**Dowód:** Lighthouse oraz obserwacja DOM. Przy CPU ×4: H1 obecny około 216 ms; około 1364 ms H1 znika, `mainHeight=0`, stopka y=69; około 1503 ms treść wraca. Konfiguracja obu sprawdzonych commitów nie zawiera `provideClientHydration`. [Angular opisuje taki mechanizm ponownego renderowania bez hydration](https://angular.dev/guide/hydration).

**Wpływ:** migotanie, chwilowo zmienione położenie treści i możliwe utrudnienie szybkiej interakcji. Dokładny wpływ na porzucenia nie jest zmierzony.

**Rekomendacja:** zweryfikować i wdrożyć poprawne wykorzystanie HTML z prerenderu; sprawdzić zgodność DOM, inicjalizację nawigacji i dyrektyw animacji. Przyczyna jest mocno wskazana, ale ostateczne rozwiązanie trzeba potwierdzić pomiarem po zmianie. Nie maskować problemu sztuczną minimalną wysokością stopki.

**Priorytet P0; pewność HIGH dla usterki, MEDIUM–HIGH dla przyczyny. Task UX-002.**

### S2. Design system nie zapewnia czytelności najważniejszej sekcji

**Problem / dlaczego:** light-theme kolor nagłówków przecieka do ciemnego panelu dowodów. To usterka funkcjonalna, nie kwestia gustu.

**Dowód:** `#evidence-teaser-title` i H3 obu `.evidence-teaser-card`; pomiar axe oraz [zrzut sekcji](evidence/proof-contrast-1440.png). Dla tych dużych/pogrubionych nagłówków potrzeba co najmniej 3:1, a zwykłego tekstu 4,5:1. [WCAG — kontrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

**Wpływ:** informacja o dowodach jest trudna do odczytania właśnie wtedy, gdy ma zwiększać zaufanie.

**Rekomendacja:** wykorzystać istniejący kierunek poprawek z `2ff41c3`, sprawdzić wynik przy zwykłym i ograniczonym ruchu oraz dostarczyć poprawkę z pełną walidacją publikacji. Nie rozpoczynać kolejnego refaktoru kart przed weryfikacją tego commita.

**Priorytet P0; pewność HIGH. Task UX-001.**

### S3. Obietnica jest doprecyzowana, ale nie ma jednego kontraktu znaczeniowego

**Problem / dlaczego:** hero obiecuje działanie, subhero mówi o demo, a `/demo-ai` dopuszcza „klikalne lub działające demo”. To nie ten sam deliverable. Projekt interfejsu może potwierdzić doświadczenie użytkownika, ale nie wykonalność integracji lub jakość AI.

**Dowód:** home hero, `/demo-ai` → „Jak powstaje demo jednego scenariusza”, porównanie demo z produkcją, „Umów bezpłatną prezentację” w symulacji.

**Wpływ:** potencjalny klient może oczekiwać automatyzacji wykonywanej na danych albo bezpłatnego prototypu, choć oferta opisuje różne warianty pierwszego etapu.

**Rekomendacja:** ustalić cztery oddzielne pojęcia: publiczna symulacja, prezentacja, płatne demo jednego procesu, wdrożenie produkcyjne. Na stronie sprzedażowej podać rezultat, moment rozpoczęcia liczenia siedmiu dni, zasady wyceny i co dzieje się przy wyniku NO-GO. Dopiero po decyzji operacyjnej publikować obietnicę konkretnych dni roboczych lub kalendarzowych.

**Priorytet P1; pewność HIGH dla niespójności, MEDIUM dla błędnego oczekiwania klientów. Taski UX-003, UX-008, UX-026.**

### S4. Proof opisuje doświadczenie, lecz bywa przedstawiany jak dowód skuteczności systemu

**Problem / dlaczego:** interaktywność nie potwierdza retrievalu, generowania odpowiedzi ani integracji. Raport nie dowodzi jakości Voice AI.

**Dowód:** pięć hero → `/przyklad-demo`; `/demo-ai` wybiera odpowiedzi lokalnie, nie wysyła żądań po pytaniu; źródła są tekstowymi opisami scenariusza, a poziom pewności jest zapisanym tekstem. To zostało potwierdzone w działaniu i kodzie.

**Wpływ:** użytkownik techniczny szybko zauważa różnicę między deklaracją i demonstracją. Biznesowy może nie wiedzieć, co właśnie zweryfikował.

**Rekomendacja:** każdy materiał powinien mieć krótką etykietę pochodzenia oraz wskazanie, co pokazuje. Rozdzielić dowód UX, techniczny i biznesowy. Najpierw zbudować dwa prawdziwe artefakty: automatyzację mail → sandbox CRM oraz mały RAG; nie produkować pięciu nowych makiet i nazywać ich działającym software’em.

**Priorytet P1; pewność HIGH. Taski UX-009–UX-015, UX-027.**

### S5. Oferta miesza problemy, technologię i formę dostarczenia

**Problem / dlaczego:** „automatyzacja” jest celem biznesowym, „system agentowy” sposobem wykonania, „WhatsApp” kanałem, a „panel” interfejsem. Równorzędna lista bez objaśnienia obciąża klienta wyborem technologii.

**Dowód:** podwójna lista `/rozwiazania`, trzy problemy home, szeroki zakres `/development` pokrywający katalog.

**Wpływ:** klient może uznać, że są różne produkty, choć część prac składa się na jeden proces.

**Rekomendacja:** automatyzacja procesów jako nadrzędna obietnica, a hub jako wybór według problemu. Pięć istniejących URL-i pozostaje użytecznych. WhatsApp zachować jako dedykowany landing i opcję dla klientów z konkretnym kanałem, bez sztucznego kreowania oddzielnej linii produktowej. Panel operacyjny przypisać do aplikacji i integracji.

**Priorytet P1; pewność HIGH dla niespójności; MEDIUM dla najlepszego modelu wyboru. Taski UX-005, UX-006.**

### S6. Dużo miejsca przeznaczono na wyjaśnianie oczywistego procesu

**Problem / dlaczego:** pojedyncza informacja o kontroli człowieka jest wartościowa, lecz kilkanaście podobnych zdań przestaje dostarczać nowych argumentów.

**Dowód:** hero → trzy wizualizowane problemy → sześciostopniowy proces home; CSS ustawia wysokość desktopowego kroku procesu do 32 rem. `/studio` powtarza odpowiedzialność w hero, faktach, zasadach, współpracy i sposobie pracy. `/development` powtarza identyczny lead.

**Wpływ:** niska ilość nowej informacji na ekran. Mobile cierpi nawet przy poprawnym reflow.

**Rekomendacja:** zastąpić długą narrację procesu jednym przypadkiem PRZED → PO. Połączyć zasady, zakres, dane i kryteria w kartę pierwszego etapu. Cel redakcyjny dla przestrzeni głównego landingu: około 40% rezultat, 25% proof, 20% proces i dostarczenie, 10% ograniczenia, 5% bezpieczeństwo. To robocza proporcja treści, nie udowodniona recepta CRO; przy danych wrażliwych bezpieczeństwo musi być bliżej decyzji.

**Priorytet P1; pewność HIGH dla powtórzeń, MEDIUM dla efektu konwersji. Taski UX-007, UX-016–UX-018, UX-022.**

### S7. CTA nie zawsze zachowuje sens kliknięcia

**Problem / dlaczego:** jednolite brzmienie nie wystarczy, jeśli przycisk prowadzi do innego rodzaju działania. Z drugiej strony wymuszenie „Opisz proces” na partnerze technicznym też byłoby sztuczne.

**Dowód:** `Zobacz demo` → góra strony o usłudze; Voice AI i systemy agentowe → `projectType=custom_web_app`; dolne CTA usług zawierają kilka podobnych dróg do tego samego kontaktu. W hero RAG brak bezpośredniego przejścia do asystenta.

**Wpływ:** dodatkowe poszukiwanie i poczucie niedopasowania. Źródło leada nie jest równoważne wybranemu tematowi formularza.

**Rekomendacja:** spójność intencji, nie jedna etykieta wszędzie. Biznes: „Opisz proces”; partner: „Opisz moduł”; development: „Opisz projekt”; proof: czynność właściwa dla artefaktu. Zachować kontekst usługi także wtedy, gdy główny temat formularza jest szerszy.

**Priorytet P1; pewność HIGH. Task UX-004.**

### S8. Founder-led studio jest komunikowane bardziej administracyjnie niż osobiście

**Problem / dlaczego:** wielokrotne zapewnienie o jednej osobie może zacząć uwypuklać zależność od tej osoby, jeśli obok nie ma dowodu kompetencji i sposobu przekazania pracy.

**Dowód:** `/studio` — silny hero, potem rozbudowane deklaracje, status obrony pracy i projekt własnej strony jako jeden z trzech głównych dowodów. Brak zdjęcia i publicznego artefaktu engineeringowego.

**Wpływ:** wrażenie odpowiedzialnego wykonawcy, lecz słabsza pewność, że można powierzyć mu krytyczny proces na dłużej.

**Rekomendacja:** „AI/software engineering studio prowadzone przez Piotra Barabasza”. Krótka historia, prawdziwe zdjęcie, udokumentowane kompetencje i sposób przekazania rozwiązania. Cztery lata jako fakt pomocniczy, nie centralny dowód. Nie sugerować większego zespołu ani dyżurów, których nie ma.

**Priorytet P1/P2; pewność MEDIUM. Taski UX-016–UX-018.**

### S9. R&D i bezpieczeństwo są obszarami deklaracji zamiast wyników

**Problem / dlaczego:** status „zweryfikowane wewnętrznie” bez metody, daty i rezultatu jest trudny do oceny. Sama obecność człowieka w procesie nie opisuje ochrony danych, uprawnień i kosztów.

**Dowód:** cztery wpisy `/rd` zawierają problem, cel, wartość i granicę zastosowania. Nie zawierają setupu, metryk ani artefaktów. Sekcje bezpieczeństwa usług często ograniczają się do human handoffu i niepublikowania danych.

**Wpływ:** język techniczny nie buduje proporcjonalnie większego zaufania. Może brzmieć jak automatycznie wygenerowany katalog możliwości.

**Rekomendacja:** jeden ukończony eksperyment z porównaniem i odtwarzalnym wynikiem jest więcej wart niż cztery rozbudowane plany. Przy usługach pokazać konkretne mechanizmy adekwatne do rozwiązania, jako ustalane lub wykonane — zgodnie ze stanem faktycznym.

**Priorytet P2; pewność HIGH dla braku publicznych wyników. Taski UX-009, UX-019, UX-027.**

### S10. Prywatność wymaga mapy przepływów, nie dłuższego regulaminowego tekstu

**Problem / dlaczego:** użytkownik powinien rozumieć, gdzie trafia wiadomość i kto odpowiada za dane. Obecna informacja koncentruje się na API i SMTP, a słabiej wyjaśnia zakres całej witryny.

**Dowód:** polityka wymienia GCP i Google Workspace, opisuje formularz, ma ogólny okres przechowywania i adres „Polska, Wrocław”. Nie wyjaśnia logów infrastruktury, cookies/analytics, ewentualnych transferów ani statusu pytań z demo. Formularz wymaga „zgody na kontakt”; podstawy opisują działania przedumowne i uzasadniony interes. Kod API wymaga `consent=true`.

**Wpływ:** niespójna informacja i zbędne tarcie checkboxa, jeśli zgoda nie jest właściwą podstawą. Nie przesądza to automatycznie o bezprawności przetwarzania.

**Rekomendacja:** sprawdzić rzeczywiste przepływy, podstawy, odbiorców, retencję, transfery i obowiązki informacyjne. Dopiero potem dostosować treść i kontrakt formularza. Nie dodawać bannera cookies z samego przyzwyczajenia: w badanych sesjach nie odnotowano zewnętrznych trackerów, cookies ani kluczy localStorage. To nie wyklucza logów serwera. Zakres konsultacji opierać na [art. 12–13 RODO](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng/), nie na domysłach.

**Priorytet P1; pewność HIGH dla luk w informacji, MEDIUM dla konsekwencji prawnych. Task UX-025.**

### S11. Cena, kalendarz i branże są decyzjami do sprawdzenia

**Problem / dlaczego:** bez danych nie wiadomo, czy brakuje ceny, czy dowodu wartości. Dodanie cennika, kalendarza i wielu branż może utrwalić złą ofertę.

**Dowód:** stały zakres i wycena przed startem już są na home; budżet jest opcjonalny. Nie ma publicznej kwoty, realnych case studies branżowych ani potwierdzonej dostępności do rozmów.

**Wpływ:** część klientów może nie wysłać kontaktu z obawy o budżet; inni oczekują wyceny indywidualnej. Skali nie znamy.

**Rekomendacja:** teraz wyjaśnić, co jest bezpłatne i co płatne. Widełki pierwszego etapu opublikować dopiero po porównaniu rzeczywistych wycen i marży. Kalendarz wdrażać jako opcję przy e-mailu/formularzu, jeśli Piotr chce utrzymywać sloty. Nawigacja według problemu jest dziś lepiej uzasadniona niż branżowa. To hipotezy do testów opisanych w części 10.

**Priorytet P2/P3; pewność MEDIUM. Taski UX-024, UX-026, UX-028.**

### Weryfikacja wszystkich 35 hipotez

| Nr | Werdykt | Konkluzja |
|---|---|---|
| 1 | Potwierdzona | Defensywność dominuje zwłaszcza na usługach, studio, development i R&D. Na hero home bilans jest lepszy. |
| 2 | Częściowo potwierdzona | Subhero już ustawia oczekiwanie demo. Problem pogłębia dopuszczenie klikalnego prototypu na `/demo-ai`. |
| 3 | Potwierdzona z korektą | Home już zaczyna od problemów. Brakuje jednego konkretnego before/after; nie kolejnej ogólnej sekcji o problemach. |
| 4 | Potwierdzona | Produkcja ma schematy i tekstowe karty; brakuje artefaktów faktycznego software’u. Nowszy lokalny commit dodaje makiety, nie realne integracje. |
| 5 | Potwierdzona mocniej | To dwie różne listy, nie tylko synonimy. Voice AI i panel operacyjny nie odpowiadają sobie. |
| 6 | Potwierdzona | Pięć usług korzysta z tej samej sekwencji i wspólnego komponentu. Wyróżnienie powinno wynikać z rodzaju wyniku. |
| 7 | Kierunek dobry; „92%” odrzucone | Cytat i dokument tak. Procent pewności bez definicji i kalibracji sugerowałby nieistniejący pomiar. |
| 8 | Potwierdzona | Nie znaleziono audio na Voice AI. Odsłuch plus transkrypcja lepiej demonstrują produkt. |
| 9 | Warunkowo potwierdzona | Automatyzacja jest dobrym nadrzędnym celem. Nie oznacza usunięcia landingów o konkretnych intencjach. |
| 10 | Landing zachować | WhatsApp/CRM jest konkretnym przypadkiem i intencją wyszukiwania; nie musi być odrębnym filarem marki. |
| 11 | Częściowo potwierdzona | Eyebrow już mówi o wieloetapowych zadaniach, ale H1 nadal wymaga technicznego słownika. |
| 12 | Potwierdzona | Wszystkie pięć usług ma ten sam raport jako secondary CTA hero. |
| 13 | Potwierdzona technicznie; ryzyko złagodzone | Symulacja lokalna bez modelu i retrievalu. Jest jawnie oznaczona, więc nie nazywam jej ukrytą atrapą AI. Problemem pozostają zapowiedzi proof i statyczna pewność. |
| 14 | Częściowo potwierdzona | Development zawiera już aplikację, backend/API, testy i monitoring. Brakuje konkretnego artefaktu i wyraźnych kompetencji, nie samych słów. |
| 15 | Częściowo potwierdzona | White-label, podwykonawstwo, repo, własność i deployment już występują. PR/review/CI i przykładowa paczka nie są pokazane. |
| 16 | Częściowo potwierdzona | Founder i kontakt bezpośredni są mocno wyeksponowane. Problem to powtarzalny język i niewiele osobistego, sprawdzalnego kontekstu. |
| 17 | Potwierdzona z warunkiem | Status obrony obciąża skanowanie. Skrócić, nie sugerując uzyskania stopnia, którego jeszcze nie ma. |
| 18 | Potwierdzona | Lata zostawić pomocniczo; kompetencje powiązać z wykonanym zakresem i dowodem. |
| 19 | Formularz zasadniczo dobry | Do poprawy mobile intro, kontekst tematu, minimum 20 znaków i copy. Termin odpowiedzi oraz kalendarz wymagają realnej możliwości obsługi. |
| 20 | Częściowo odrzucona | Executive summary już istnieje. Trzeba je skondensować i powiązać ze scenariuszami. Jest druk do PDF, brak bezpośredniego pliku. |
| 21 | Potwierdzona | Brak publicznych wyników, setupu i artefaktów eksperymentów. |
| 22 | Potwierdzona w zakresie publikacji | Nie znaleziono publicznych case studies klientów. Nie wynika z tego brak klientów lub wykonanych prac. |
| 23 | Nierozstrzygnięta | Brak ceny może być tarciem; nie ma danych, by zalecić określone kwoty albo cennik wdrożeń. |
| 24 | Problem-first preferowane | Wynika z obecnej oferty przekrojowej i braku dowodów specjalizacji branżowej. Weryfikować testem wyboru. |
| 25 | Potwierdzona | Angielskie etykiety dominują w wizualizacji home. Techniczne skróty zostawić tam, gdzie pomagają kupującemu. |
| 26 | Częściowo potwierdzona | Spójny system tak; przymus jednego tekstu dla biznesu, development i partnerów — nie. |
| 27 | Potwierdzone konkretne problemy | Długość, drobne etykiety flow, wynik demo poza ekranem; nie potwierdzono poziomego overflow w badanych szerokościach. |
| 28 | Częściowo potwierdzona | Menu jest obsługiwalne, a R&D już ma niższą hierarchię. Nazwy „Wdrożenia” i „Dla partnerów” są zbyt ogólne. |
| 29 | Solidna technika, słabsza treść | Metadane i indeksowalność istnieją. Dwa konkretne błędy descriptions, niespójny ItemList; kanibalizacja wymaga GSC. |
| 30 | Fundament dobry, są wyjątki | Kontrast proof i niekontrolowana pętla ruchu; menu, formularz i FAQ mają działające podstawy. Axe nie jest certyfikatem WCAG. |
| 31 | Potwierdzona usterka startu | Główne ryzyko to przebudowa DOM/CLS. Brak podstaw do kosztownej optymalizacji fontów lub 3D. |
| 32 | Częściowo potwierdzona | Dane formularza opisane, ale potrzebna spójność podstaw i opis realnych przepływów. Ocena prawna należy do prawnika. |
| 33 | Preferowany positioning trafny | Małe studio AI/software engineering z bezpośrednią odpowiedzialnością jest bliższe stanowi faktycznemu niż product company lub duży software house. |
| 34 | Potwierdzona strategicznie | „Pokazujemy działanie przed większą inwestycją” jest trwalszym rdzeniem. „7 dni” powinno być nazwą i parametrem pierwszego etapu. |
| 35 | Zachować kierunek | Nowe wizualizacje tylko do wyjaśniania procesu i pokazywania wyniku; bez dekoracyjnego rebrandingu. |

### Benchmark: co warto przejąć jako zasadę

To porównanie sposobu komunikacji, nie ranking skuteczności ani porównanie skali firm.

| Źródło | Zaobserwowany wzorzec | Zastosowanie dla Protolume |
|---|---|---|
| [thoughtbot — home](https://thoughtbot.com/) | Wyróżnione case study wcześnie, powiązanie usług z etapem projektu i widoczna osoba przy referencji. | Proof przed rozbudowanym procesem; wynik opisać z kontekstem i odpowiedzialnością. |
| [thoughtbot — case studies](https://thoughtbot.com/case-studies) | Projekty pozwalają przejść od problemu do konkretnej realizacji. | Docelowo jedna mocna realizacja i sensowne linkowanie do usług, zamiast obszernej pustej galerii. |
| [Evil Martians](https://evilmartians.com/) | Kompetencje powiązane z produktami, open source i namacalnymi obszarami engineeringu. | Pokazać własny artefakt, test lub narzędzie przy kompetencji. Nie przejmować skali, stawek ani cudzych wyników. |

## Część 3 — Audyt strona po stronie

Wysokości obejmują całą stronę ze stopką, przy zamkniętych FAQ i stanie początkowym demo. To dokumentacja aktualnego układu, nie docelowe limity długości. Szczegółowe metadane są w [dowodach](DOWODY.md).

### `/` — [strona główna](https://protolume.pl/)

**Co jest dobre:** mocna obietnica jednego procesu; subhero wyjaśnia demo; czytelne główne CTA; trzy realne problemy biznesowe; właściciel podpisany imieniem i nazwiskiem.

**Co jest złe:** proof zbyt późno, nieczytelne nagłówki na ciemnym tle, trzy kolejne wersje opisu przepływu. Angielski „LIVE PROCESS” może sugerować działanie w czasie rzeczywistym, choć to animowana ilustracja. Napis „Approve” wygląda jak akcja, ale jest elementem ilustracji.

**Co usunąć:** osobną, długą sześciokrokową narrację „Od wejścia do wyniku” w obecnej formie. Informacje zachować w before/after i szczegółach przykładu. Usunąć powtórzone punkty „stały zakres / kontrola człowieka”, jeśli zostają tuż obok.

**Co skrócić:** o około 30–40% tekst wyjaśniający proces; przede wszystkim skrócić wysokość sekcji, nie font. Harmonogram siedmiu dni do czterech etapów z krótkim wynikiem każdego.

**Co zmienić:** obietnicę „działającej automatyzacji” powiązać bezpośrednio z działającym demo jednego scenariusza. Proof umieścić po krótkim rozpoznaniu problemu. Naprawić start aplikacji.

**Co dodać:** jeden wykonany przypadek z wejściem, ekranem wyniku i decyzją operatora; do tego mała karta „co otrzymujesz po pierwszym etapie”.

**Kolejność:** hero → przykład przed/po i proof → wybór problemu → pierwszy etap → kompetencje/odpowiedzialność → CTA. Szczegóły w części 5.

**Desktop:** 10 382 px. Sekwencja procesu pochłania około 3,9 tys. px między nagłówkiem procesu a proof. Duży ekran nie uzasadnia takiej ilości przewijania.

**Mobile:** 10 839 px. CTA już widoczne na pierwszym ekranie. Wizualizacja hero zaczyna się około y=611 i wydłuża hero ponad jeden ekran; mikrotekst mapy jest zbyt drobny do odczytu. Wyświetlać krótkie wejście i wynik, a pełne kroki po rozwinięciu.

**CTA:** „Opisz proces” pozostawić. „Zobacz demo” kierować do faktycznie widocznego przykładu; do czasu prawdziwego AI nazywać go symulacją.

**Proof:** dzisiaj animowany schemat + lokalna symulacja + fikcyjny raport. Żaden z nich nie potwierdza efektu biznesowego klienta.

**Copy:** „AI i automatyzacje dla firm” jest czytelniejszą etykietą niż „AI AUTOMATION STUDIO”. „Jasny handoff” → „Wiadomo, kto przejmuje sprawę”.

**SEO:** tytuł „Automatyzacje AI dla firm” odpowiada roli nadrzędnej strony. Nie przepisywać home pod wszystkie pięć fraz usług. Zachować metadane, prerender i canonical.

### `/rozwiazania` — [katalog rozwiązań](https://protolume.pl/rozwiazania)

**Co jest dobre:** pięć użytecznych kierunków, linki do usług, opis odbiorcy i danych wejściowych. Pomoc dla osób, które nie wiedzą, co wybrać.

**Co jest złe:** dwie listy i długie sekcje niemal landingowe; hub zaczyna się od wyjaśnienia, czego firma nie sprzedaje. Karty prowadzą głównie do kontaktu, zamiast pomagać wybrać właściwy landing.

**Co usunąć:** drugą taksonomię; osobne, rozbudowane bloki zakresu demo i produkcji dla każdej pozycji w hubie. Ich miejsce jest na stronach usług.

**Co skrócić:** treść główną o około 50–60%, zachowując wszystkie sensowne ścieżki. Jedna karta = problem, rezultat, przykład, link.

**Co zmienić:** H1 na „Który proces chcesz usprawnić?”. Jeden katalog używany przez UI, linkowanie i ItemList. Panel operacyjny przekierowuje logicznie do `/development`, Voice AI otrzymuje własną kartę.

**Co dodać:** jedno zdanie pomagające wybrać między zwykłą automatyzacją a AI do zadań wieloetapowych. Bez konfiguratora wymagającego wielu kliknięć.

**Kolejność:** krótkie intro → pięć kart problemów → ścieżka aplikacji/panelu → pomoc w wyborze. Dane i kryteria po przejściu na usługę.

**Desktop:** 8159 px to za dużo dla ekranu wyboru. Hero wykorzystuje dużą kartę z małą ilością informacji i znacznymi odstępami.

**Mobile:** 10 358 px; pierwszy szczegółowy opis rozwiązania około y=1493. Użytkownik powinien wcześniej widzieć różnice między opcjami.

**CTA:** na kartach „Zobacz asystenta wiedzy”, „Zobacz obsługę telefonów” itd.; ogólne „Opisz proces” tylko jako pomoc, nie główne działanie każdej karty.

**Proof:** miniatura rzeczywistego artefaktu przy karcie lub jego zwięzły opis. Nie pięć nowych ozdobnych grafik.

**Copy:** pozbyć się leadu rozpoczynającego się od odmowy. Nazwy biznesowe jako główne; RAG i systemy agentowe w opisie pomocniczym.

**SEO:** description zawiera powtórzenie „Protolume. Protolume.” i starą listę z panelem. ItemList odzwierciedla drugi katalog. To błąd spójności treści, nie awaria parsera schema.

### `/rozwiazania/chatbot-ai-dla-firm` — [Chatbot / RAG](https://protolume.pl/rozwiazania/chatbot-ai-dla-firm)

**Co jest dobre:** korzyść szukania odpowiedzi, wskazywanie źródeł i scenariusz braku danych. Własny URL odpowiada intencji wyszukiwania.

**Co jest złe:** brak działającego pytania i otwieranego źródła; hero prowadzi do e-mailowego raportu. Dwa kroki „kontrola” i „człowiek” mówią częściowo to samo.

**Co usunąć:** powtórzony opis usługi pod CTA; ogólny lead integracji o nieobiecywaniu gotowości. Nie usuwać zachowania przy braku źródła.

**Co skrócić:** „kiedy ma sens” do trzech sytuacji; zakres/kryteria/dane/ograniczenia połączyć w kartę testu.

**Co zmienić:** hero „Odpowiedzi z wiedzy firmy, ze źródłem do sprawdzenia”. Zachować nazwę chatbot/RAG w tytule i pierwszym akapicie.

**Co dodać:** pytanie → odpowiedź → klikane źródło → wskazany fragment dokumentu; drugi przykład z prawidłową odmową. Bez procentu pewności udającego pomiar.

**Kolejność:** problem i przykład → działanie/źródło → dopasowanie → pierwszy etap → aktualizacja danych i uprawnienia → FAQ → kontakt.

**Desktop:** 4928 px; prosta typografia, ale dominują listy. Widok dokumentu obok odpowiedzi wnosi więcej niż kolejna karta procesu.

**Mobile:** 6029 px; odpowiedź i źródło pokazywać kolejno. Źródło otwierać w dostępnej sekcji, z możliwością powrotu do pytania. FAQ ma część aktywnych wierszy około 27 px — zgodność minimalnego targetu nie jest równoznaczna z wygodą.

**CTA:** „Sprawdź odpowiedź ze źródłem”; po przykładzie „Opisz proces”. Do czasu prawdziwego RAG: „Zobacz symulację odpowiedzi”.

**Proof:** właściwy jest realny retrieval na publicznych materiałach, nie statycznie wpisane „Wykorzystane źródła”.

**Copy:** tłumaczyć źródła i aktualność; nie mówić, że system jest pewny tylko dlatego, że odpowiedź należy do scenariusza.

**SEO:** zachować intencję „chatbot AI dla firm / asystent wiedzy RAG”. Pytania o aktualizację bazy i dostęp pracowników dadzą więcej unikalnej treści niż wspólne FAQ o tym, czy demo jest produkcją.

### `/rozwiazania/voice-ai-dla-firm` — [Voice AI](https://protolume.pl/rozwiazania/voice-ai-dla-firm)

**Co jest dobre:** konkretna potrzeba telefonów, kwalifikacja i wynik dla pracownika; brak obietnicy zastąpienia całego działu obsługi.

**Co jest złe:** nie można usłyszeć rozmowy. Strona nie pozwala ocenić naturalności, opóźnień, przerwania wypowiedzi ani przekazania rozmowy. CTA ustawia niewłaściwy temat formularza.

**Co usunąć:** raport e-mailowy z roli podstawowego proof; powtarzanie „jawnego przekazania” w wielu sekcjach.

**Co skrócić:** pięciostopniowy opis rozmowy zastąpić jednym zsynchronizowanym przykładem; do trzech pytań kwalifikujących, kiedy telefoniczna automatyzacja ma sens.

**Co zmienić:** pokazać obsługę przychodzącego połączenia jako główny przypadek; inne modele telefonii omawiać dopiero, gdy są faktycznie oferowane.

**Co dodać:** odtwarzacz z nagraniem prawdziwego systemu na danych demonstracyjnych, transkrypcję, pola z rozmowy i następną akcję. Brak nagrania oznacza zadanie stworzenia materiału, nie przycisk bez działającego pliku.

**Kolejność:** korzyść → odsłuch → wynik w panelu → wyjątek/przekazanie → integracje i dane → pierwszy etap → FAQ.

**Desktop:** 4886 px. Audio i wynik w dwóch kolumnach dają charakter właściwy usłudze bez zmiany palety.

**Mobile:** 6027 px. Duży przycisk play, czas nagrania, przewijanie, transkrypcja pod spodem. Bez autoplay, żądania mikrofonu i wymogu dzwonienia z telefonu.

**CTA:** „Posłuchaj rozmowy” oraz „Opisz proces”. Zachować kontekst „Obsługa telefonów / Voice AI” w formularzu.

**Proof:** prawdziwe audio, nie wykres fali udający nagranie; zaznaczyć, czy materiał był skracany.

**Copy:** „Po rozmowie pracownik dostaje temat, dane i kolejne zadanie” jest bardziej konkretne niż opis, że model porządkuje sprawę.

**SEO:** tytuł może doprecyzować „Voice AI — obsługa telefonów dla firm”. Treść o przekazaniu, operatorze i rezultacie odróżni ją od pozostałych usług.

### `/rozwiazania/automatyzacja-procesow` — [automatyzacja](https://protolume.pl/rozwiazania/automatyzacja-procesow)

**Co jest dobre:** najbardziej zrozumiała korzyść biznesowa; ręczne kopiowanie, statusy i reguły są bliskie codziennej pracy klienta.

**Co jest złe:** narracja techniczna nadal wyprzedza namacalny wynik. Nie pokazano rzeczywistego wejścia i zapisu do systemu. Strona może zlewać się znaczeniowo z home i integracjami.

**Co usunąć:** ogólne zapewnienia o kontrolowanym przepływie powtarzane w hero, procesie i CTA. Zostawić konkretny opis wyjątku.

**Co skrócić:** listy dopasowania i ograniczeń; zachować tylko zależności wpływające na start.

**Co zmienić:** uczynić tę stronę głównym przykładem operacyjnym oferty. „Wiadomość trafia do CRM bez ręcznego przepisywania” jako pierwszy scenariusz.

**Co dodać:** wiadomość, wydobyte pola, podgląd zmiany rekordu, zatwierdzenie i zapis w sandboxie; drugi scenariusz brakującego pola lub duplikatu.

**Kolejność:** przed/po → działanie → zakres systemów → wyjątki → test pierwszego etapu → FAQ → kontakt.

**Desktop:** 4947 px; zamiast pięciu opisowych kroków jeden panel pracy i obok przed/po.

**Mobile:** 5876 px. Wejście, proponowana zmiana i status jako trzy krótkie sekcje; nie przeskalowana miniatura całego diagramu.

**CTA:** „Zobacz wiadomość → CRM” i „Opisz proces”. Istniejący projektType automatyzacji jest sensowny.

**Proof:** rzeczywisty zapis i log wykonania mają większą wartość niż sama animacja przemieszczających się kart.

**Copy:** wskazać, które kroki przejmuje system, które pozostają ręczne. Nie podawać oszczędności czasu bez pomiaru.

**SEO:** intencja operacyjna „automatyzacja procesów biznesowych”. Home przedstawia markę; ten landing opisuje konkretny sposób usprawniania pracy. Kanibalizację badać w GSC, nie zgadywać z podobieństwa nazw.

### `/rozwiazania/integracje-whatsapp-crm` — [WhatsApp / CRM](https://protolume.pl/rozwiazania/integracje-whatsapp-crm)

**Co jest dobre:** zrozumiałe zgubione zapytania i ręczne przepisywanie; wskazanie oficjalnego kanału i zależności od systemów klienta.

**Co jest złe:** podobny opis do automatyzacji; „agent” jest wprowadzany nawet tam, gdzie integracja może potrzebować zwykłych reguł. Brak przykładu powiązania konwersacji z rekordem.

**Co usunąć:** AI jako obowiązkowy krok każdego połączenia; e-mailowy raport jako podstawową demonstrację tej usługi.

**Co skrócić:** osobne listy o niegotowości integracji połączyć z krótką sekcją „co musi być dostępne przed testem”.

**Co zmienić:** prezentować problem „rozmowa nie trafia do CRM”; jasna różnica między routingiem, mapowaniem i generowaniem odpowiedzi.

**Co dodać:** konwersacja → rozpoznanie klienta → mapowanie pól → rekord/status/właściciel. Pokazać przypadek ponownego zdarzenia, aby dowieść braku podwójnego zapisu.

**Kolejność:** konwersacja i wynik → obsługiwany przypadek → wyjątki → wymagane dostępy → pierwszy etap → FAQ.

**Desktop:** 4858 px. Dwie rzeczywiste powierzchnie UI: rozmowa i rekord CRM. Nie nowy katalog kilkunastu logo.

**Mobile:** 6058 px. Konwersacja nad rekordem, etykiety pól czytelne bez poziomego przewijania; log techniczny pod rozwinięciem.

**CTA:** „Zobacz rozmowę w CRM”; kontakt zachowuje system/kanał. „Integracja lub API” jest dopuszczalnym tematem nadrzędnym, jeśli wybrana usługa pozostaje widoczna.

**Proof:** widoczny efekt zdarzenia w sandboxie, nie tylko makieta WhatsAppa.

**Copy:** „Po rozmowie sprawa ma właściciela i status w CRM” zamiast „handoff w przewidywalnym ciągu”.

**SEO:** zachować URL i intencję WhatsApp–CRM. Nie przenosić automatycznie treści do ogólnej automatyzacji; to osobna potrzeba wyszukiwania, mimo wspólnej kategorii biznesowej.

### `/rozwiazania/systemy-agentowe` — [zadania wieloetapowe](https://protolume.pl/rozwiazania/systemy-agentowe)

**Co jest dobre:** wskazanie zależnych kroków, narzędzi i kontroli kosztów w szerszym katalogu; eyebrow już mówi o zadaniach.

**Co jest złe:** „system agentowy” nadal wymaga wyjaśnienia; brakuje przekonującej różnicy względem zwykłego workflow. Kryterium „nie sugeruje pełnej autonomii” ocenia narrację, nie wykonanie zadania.

**Co usunąć:** kryteria dotyczące tego, czy demo sprawia właściwe wrażenie, jako substytut kryteriów poprawności. Dublowanie kroków kontroli.

**Co skrócić:** opis agentów do tego, co robią w wybranym przypadku; unikać katalogu abstrakcyjnych ról.

**Co zmienić:** H1 „AI do zadań wymagających kilku kroków i systemów”; termin techniczny w podtytule. Wyjaśnić, kiedy wystarcza regułowa automatyzacja.

**Co dodać:** rzeczywisty przebieg zadania: wejście, wywołanie narzędzia, wynik, sprawdzenie, akceptacja; koszt i status błędu, jeśli zmierzone.

**Kolejność:** zadanie i rezultat → przebieg wykonania → granica zwykłego workflow/agenta → kontrola kosztów i uprawnień → pierwszy etap → FAQ.

**Desktop:** 4809 px. Graf może pomagać technicznemu kupującemu, ale ma być zbudowany z prawdziwego trace, nie dekoracyjnych węzłów.

**Mobile:** 5836 px. Lista kroków z rozwijanymi szczegółami zastępuje rozległy graf. Wynik zadania przed logiem.

**CTA:** „Prześledź wykonanie zadania” i „Opisz proces”. Naprawić temat „Aplikacja albo panel”.

**Proof:** udokumentowany tool call i działający punkt akceptacji; sam opis ról agentów tego nie dowodzi.

**Copy:** „Zbiera dane z dwóch źródeł i przygotowuje decyzję” jest lepsze niż „kilka kontrolowanych kroków może współpracować”. Konkretne źródła dopiero po wykonaniu przykładu.

**SEO:** zachować frazę „systemy agentowe AI” w title i treści, ale wyjaśniać intencję wieloetapowej pracy. Nie rozszerzać strony na wszystkie ogólne frazy AI automation.

### `/demo-ai` — [pierwszy etap i symulacja](https://protolume.pl/demo-ai)

**Co jest dobre:** dostępny interaktywny element, jawne oznaczenie symulacji, brak wysyłania pytania, fallback dla pytania poza katalogiem. Są sekcje dla kogo, przebiegu i różnicy między demo a produkcją.

**Co jest złe:** strona łączy ofertę płatnego etapu i bezpłatną ilustrację rozmowy. Brak rzeczywistego retrievalu; poziom pewności i „źródła” są statyczne. Po kliknięciu na mobile odpowiedź może nie wejść w widoczny ekran.

**Co usunąć:** pozorowany etap „Sprawdzam materiały…” oraz „Poziom pewności” z lokalnej symulacji; nie udają realnego pomiaru, jeśli ich nie ma. Usunąć duplikat CTA prezentacji w stanie fallback, jeżeli oba są widoczne.

**Co skrócić:** kilka poziomów wyboru obszaru i pytania. Na start trzy reprezentatywne pytania, w tym brak odpowiedzi, wystarczą lepiej niż marketingowy podział na ofertę i prezentację.

**Co zmienić:** jednoznacznie oznaczyć ofertę „Demo jednego procesu w 7 dni”. Publiczny przykład udostępnić bezpośrednią kotwicą. „Klikalny prototyp” sprzedawać osobno jako sprawdzenie UX, jeśli taki wariant ma pozostać.

**Co dodać:** później mały realny RAG na publicznych materiałach. Przed nim kontrakt danych, limit kosztów, mierzalne testy odpowiedzi i czytelne źródła. Nie wysyłać pytań do modelu, zostawiając obecne zapewnienie o lokalności.

**Kolejność:** dla osoby oglądającej przykład: wyjaśnienie trybu → pytanie → odpowiedź/źródło → CTA. Dla osoby kupującej etap: rezultat → materiał przykładowy → dane/start/wycena → przebieg → kontakt.

**Desktop:** 4625 px. Początek symulacji dopiero po dwóch sekcjach. Dwie kolumny mogą mieścić wejście i wynik w jednym widoku.

**Mobile:** 5213 px. Nagłówek symulacji około y=1686; własne pytanie około y=2581. Po akcji pokazać początek odpowiedzi i zachować logiczny focus; nie wymagać szukania wyniku pod kolejnymi kontrolkami.

**CTA:** „Zobacz symulację” dla obecnego elementu; „Opisz proces” dla pierwszego etapu; „Umów prezentację” dopiero po wyjaśnieniu, czy dotyczy istniejącego materiału czy przygotowania pod klienta.

**Proof:** obecnie dowód UX i lokalnej obsługi scenariuszy. Nie dowód jakości AI. W realnym RAG liczbę źródeł pokazać jako pomoc w sprawdzeniu odpowiedzi, a chunk count/model/debug przenieść do szczegółów.

**Copy:** aktualne „nie łączy się z produkcyjną bazą” nie oznacza wprost „nie korzysta z modelu”. Napisać krócej i jednoznacznie, co ten przykład robi.

**SEO:** URL już reprezentuje ofertę etapu. Zachować go; oddzielny URL prawdziwego demo tworzyć dopiero z gotowym, wartościowym materiałem. Nie indeksować pustego playgroundu.

### `/development` — [aplikacje i integracje](https://protolume.pl/development)

**Co jest dobre:** trzy rezultaty już pokazują punkt wyjścia i docelową pracę; są elementy backend/API, testów, dokumentacji i monitoringu. Wyłączenia z wyceny mogą pomóc w kwalifikacji.

**Co jest złe:** hero i kolejna sekcja powtarzają ten sam lead. Obok hero zamiast przykładu stoją zasady współpracy. Odbiorca dowiaduje się więcej o ustalaniu etapu niż o jakości wykonania.

**Co usunąć:** identyczny lead i osobny panel zasad w pierwszym ekranie; treść zasad scalić dalej z zakresem przekazania.

**Co skrócić:** „co ustalamy”, „zakres i wycena”, „proces” połączyć tak, aby informacja o kryteriach i maintenance wystąpiła raz. Cel 30–40% redukcji opisowego tekstu.

**Co zmienić:** nazwa w menu „Aplikacje i integracje”. Hero: „Aplikacje i integracje do codziennej pracy zespołu”. Wyjaśnić, że klient z gotowym zakresem może przejść bez obowiązkowego demo.

**Co dodać:** realny artefakt własnego projektu: frontend, API, test, Docker, instrukcja uruchomienia i model publikacji. Kompetencje auth/vector DB/RAG wymieniać jako wykonane dopiero z dowodem; repo strony ich wszystkich nie potwierdza.

**Kolejność:** rezultat + artefakt → trzy typy projektów → obszary engineeringu → co przekazujemy → proces i utrzymanie → kontakt.

**Desktop:** 5964 px; ograniczyć pustą przestrzeń kart i nadmiernie duże nagłówki. Własny panel i notatki techniczne powinny wypełniać funkcję dowodu.

**Mobile:** 6993 px. Obecny H1 zajmuje około siedmiu wierszy przy 390 px. Skrócić znaczenie, nie tylko rozmiar liter; pierwszy konkretny przykład przed blokiem zasad.

**CTA:** „Opisz projekt”, a dla materiału „Zobacz, co przekazujemy”.

**Proof:** działający moduł i publicznie udostępniona lub zanonimizowana paczka przykładowa. Nie oznaczać planowanego repo jako już dostępnego.

**Copy:** capabilities w formie „co budujemy → co otrzymuje zespół → jak sprawdzamy”, nie logo wall.

**SEO:** osobna intencja tworzenia aplikacji, API i integracji; nie kolejny landing ogólnych automatyzacji AI. Zachować obecny URL bez kosmetycznego przenoszenia.

### `/dla-software-house` — [partnerzy techniczni](https://protolume.pl/dla-software-house)

**Co jest dobre:** rozpoznawalny odbiorca, pierwsza osoba, white-label, podwykonawstwo, moduł, discovery, repozytorium i przekazanie kodu. To jeden z lepiej ustawionych segmentów.

**Co jest złe:** realia pracy w repo są schowane w FAQ; brak przykładowego PR, CI i review. „MSP” może oznaczać Managed Service Provider albo zostać odczytane jako MŚP. „Dla partnerów” w menu jest mniej precyzyjne niż strona docelowa.

**Co usunąć:** zdanie podkreślające brak logo klientów i niepotwierdzonych wyników — eksponuje brak zamiast pokazywać kompetencję. Usunąć biznesowy raport jako główny proof techniczny.

**Co skrócić:** kilka wariantów „ograniczonego zakresu” do jednego opisu modułu i zasad jego odbioru.

**Co zmienić:** nazwa menu „Dla software house’ów”; MSP wyjaśnić albo usunąć, jeśli nie jest osobnym segmentem sprzedaży. Sposób pracy z istniejącym repo pokazać przed formalnymi zasadami.

**Co dodać:** wykonany przykład `API + tests + Dockerfile + README + architecture notes + deployment guide`; model branch → PR → review → CI → handover, tylko w zakresie faktycznie oferowanym. NDA jako uzgadniany dokument, bez dopisywania nieistniejących zobowiązań.

**Kolejność:** dopasowanie i moduł → artefakt → workflow repo → modele współpracy → własność/poufność/deployment → FAQ → kontakt.

**Desktop:** 4384 px. Układ hero i dopasowania obok siebie jest dobry. Zachować; kartę proof zaprojektować jako mały fragment dostarczanego projektu.

**Mobile:** 5122 px. Foldery i checks jako czytelna lista; duży diff opcjonalnie, bez poziomego przewijania całej strony.

**CTA:** „Opisz moduł” lub obecne „Porozmawiaj o współpracy”; secondary „Zobacz przykładowe przekazanie”. Nie wymuszać „Opisz proces”.

**Proof:** repo/PR i wynik CI mają tu większą moc niż konsumenckie demo chatbota.

**Copy:** „Wejście do istniejącego repo po przeglądzie kodu i zasad pracy” zachowuje uczciwy warunek, ale mówi wprost o oferowanej usłudze.

**SEO:** utrzymać intencję podwykonawstwa AI i white-label dla software house’ów. Wewnętrzne linkowanie z home i development powinno jednoznacznie identyfikować segment.

### `/studio` — [Piotr i studio](https://protolume.pl/studio)

**Co jest dobre:** już w hero wiadomo, kto jest właścicielem i że prowadzi cały uzgodniony zakres. Nie trzeba dopiero „dodać foundera”. Oddzielono projekt własny od pracy klienta.

**Co jest złe:** historia osoby ginie w administracyjnym języku, długości i pięciu podobnych opisach odpowiedzialności. Trzy karty dowodów powtarzają granice zamiast dawać mocne artefakty. Strona wskazuje siebie samą jako przykład aplikacji.

**Co usunąć:** samodzielny blok „jak zweryfikować sposób pracy”, jeśli tylko odsyła ponownie do tych samych trzech materiałów. Nie usuwać ich etykiet pochodzenia. Status obrony przenieść z głównej listy sprzedażowej do krótkiej noty edukacyjnej.

**Co skrócić:** o 40–50% sekcje zasad/współpracy/sposobu pracy; jeden blok odpowiedzialności wystarczy.

**Co zmienić:** hero w pierwszej osobie, krótka opowieść o rodzajach pracy i powodzie założenia studia. Faktów biograficznych nie uzupełniać domysłami.

**Co dodać:** prawdziwe zdjęcie Piotra, 2–3 sprawdzalne przykłady techniczne, odnośnik do własnych projektów lub udostępnionej notatki R&D. Dostępność i przekazanie projektu opisać praktycznie, zgodnie z realnym sposobem działania.

**Kolejność:** osoba → kompetencje poparte pracą → dlaczego taki model współpracy → jak przekazujemy rozwiązanie → krótka edukacja → kontakt.

**Desktop:** 6962 px; może być znacznie krótsza. Nie potrzebuje corporate timeline ani siatki fikcyjnego zespołu.

**Mobile:** 8906 px. W pierwszym ekranie nazwisko jest, ale CTA wypada za zasadami. Przenieść link kontaktu przy krótkiej wypowiedzi foundera.

**CTA:** „Porozmawiaj z Piotrem” z zachowaniem ogólnego kontekstu projektu; proof bez dodatkowego etapu instrukcji oglądania proof.

**Proof:** „4+ lata” pomocniczo. Opis kompetencji ma wskazać co zrobiono i co można obejrzeć. Sama obecność repo nie dowodzi skali projektów klientów.

**Copy:** nie publikować skrótu edukacji sugerującego tytuł magistra, dopóki status tego nie potwierdza. Możliwa wersja: „Politechnika Wrocławska — program Zaufana Sztuczna Inteligencja; ukończone studia inżynierskie z mechatroniki”, po potwierdzeniu aktualnego brzmienia przez Piotra.

**SEO:** description ma błąd „z Piotr Barabasz”; poprawić na „z Piotrem Barabaszem”. Title osoby jest właściwy; uzupełniać dane Person tylko sprawdzonymi profilami i informacjami.

### `/rd` — [R&D](https://protolume.pl/rd)

**Co jest dobre:** obszary kosztów agentów, jakości RAG i oceny odpowiedzi rzeczywiście pasują do wiarygodnego engineering studio. Etykiety statusu są użyteczne.

**Co jest złe:** nie widać wyników. Wszystkie wpisy opisują potencjał i granice. „Zweryfikowane wewnętrznie” nie mówi, co uznano za sukces.

**Co usunąć:** końcową, osobną sekcję powtarzającą, że eksperyment nie jest produktem. Ograniczenia umieścić przy wyniku danego eksperymentu.

**Co skrócić:** cztery plany do krótkiej listy tematów, jeśli brak materiałów. Nie rozbudowywać pustych kart przez dodanie pól bez danych.

**Co zmienić:** jeden wyróżniony ukończony eksperyment, pozostałe jako plan/prototyp. Stan i data muszą odpowiadać dokumentacji.

**Co dodać:** hipoteza, wykonany system, setup, zbiór testowy, baseline, metryka, wynik, koszt, wniosek, ograniczenia, data, repo/raport. Wszystkie liczby dopiero po pomiarze.

**Kolejność:** wynik wyróżniony → metoda i artefakt → czego dowiedzieliśmy się dla wdrożeń → pozostałe kierunki → kontakt techniczny.

**Desktop:** 3394 px. Obecna karta hero jest wąska i pozostawia sporo pustego miejsca; notatka z wykresem/porównaniem lepiej wykorzysta szerokość.

**Mobile:** 4172 px mimo niewielkiej treści. Tabela pomiaru w układzie etykieta–wartość, szczegóły metodologii pod rozwinięciem.

**CTA:** „Zobacz metodę i wyniki”; kontakt techniczny jako dalsza opcja, nie pierwszy obowiązkowy krok.

**Proof:** reproducible experiment, nie podane przez brief przykładowe „120 pytań / 91% / 88%”. Te liczby nie są wynikami Protolume.

**Copy:** headline o konkretnym pytaniu badawczym, np. porównaniu dwóch sposobów wyszukiwania — dopiero po rzeczywistym przeprowadzeniu pracy.

**SEO:** zachować stronę jako zaplecze marki. Osobne URL-e eksperymentów tylko przy samodzielnej, unikalnej treści; bez automatycznego noindex całego R&D.

### `/przyklad-demo` — [przykładowy raport](https://protolume.pl/przyklad-demo)

**Co jest dobre:** raport **już ma executive summary**, decyzję, kryteria, ryzyka, scenariusze i plan dalszego etapu. Jego fikcyjny charakter jest jawny.

**Co jest złe:** decyzja i disclaimer powtarzają się; długi wstęp opóźnia konkrety. Trzeci scenariusz opisuje oczekiwany handoff jako pokazany, a jednocześnie ma status wymagający walidacji — nie wyjaśnia, co dokładnie pozostało niezweryfikowane.

**Co usunąć:** meta-komentarz o tym, że „najpierw pokazano wartość”, oraz powtórzone pełne akapity disclaimerów. Etykieta „fikcyjny przykład” musi pozostać przy podsumowaniu i w eksporcie.

**Co skrócić:** wprowadzenie i dwie sekcje rekomendacji scalić; długi rejestr ryzyk jako warstwa szczegółowa. Cel 30–40% mniej tekstu w domyślnym widoku.

**Co zmienić:** hero połączyć ze streszczeniem. Pokazać decyzję, zakres, statusy scenariuszy, dwie niewiadome i następny krok. Nie wstawiać „2/3 potwierdzono” bez objaśnienia trzeciego statusu.

**Co dodać:** spis treści i jednoznaczną legendę wyniku. Pobieralny PDF jako wygodę przekazania interesariuszowi, generowany z tych samych danych co WWW.

**Kolejność:** krótki opis materiału + decyzja → statusy scenariuszy → następny krok → szczegółowy raport → końcowy kontakt.

**Desktop:** 7906 px; rejestr ryzyk może być tabelą, jeśli poprawia porównanie. Szczegółowość sama w sobie nie jest wadą dla odbiorcy technicznego.

**Mobile:** 12 812 px, około 15,2 ekranu po 844 px. Nie trzeba zmuszać osoby chcącej poznać decyzję do oglądania pełnego dokumentu. Summary powinno być wcześniej; dzisiaj zaczyna się około y=906.

**CTA:** „Pobierz przykładowy raport PDF”, „Opisz podobny proces”. Drukowanie zostawić jako dodatkową możliwość, nie fałszywie przemianowywać przycisku bez pliku.

**Proof:** materiał pokazuje sposób raportowania i myślenia o ryzyku. Nie może stać się case study przez zmianę nagłówka.

**Copy:** przy trzecim scenariuszu oddzielić pokazanie ścieżki UX od testu jakości na niewidzianych danych.

**SEO:** title i CreativeWork są sensowne; treść powinno się odnajdywać jako przykład deliverable, nie wynik wdrożenia klienta. Wersja PDF z datą i odpowiednią relacją do strony głównej raportu.

### `/kontakt` — [kontakt](https://protolume.pl/kontakt)

**Co jest dobre:** cztery wymagane pola merytoryczne (imię i nazwisko, e-mail, temat, opis) oraz wymagany checkbox; firma i budżet opcjonalne. Budżet pod rozwinięciem. E-mail alternatywny, brak telefonu jako obowiązkowego pola, instrukcja opisu, działająca walidacja i focus na komunikacie błędu.

**Co jest złe:** mobile najpierw pokazuje długie wyjaśnienie, a pierwszy input zaczyna się około y=681. Nie podano z góry minimum 20 znaków opisu. Kontekst Voice/agentów jest mylący. Prywatność i tekst zgody wymagają wspólnego przeglądu.

**Co usunąć:** powtórzenia o ustalaniu następnego kroku i braku zamówienia w kilku miejscach. Nie dodawać numeru telefonu ani obowiązkowego budżetu.

**Co skrócić:** trzy kroki przed formularzem do jednej konkretnej informacji o odpowiedzi i dalszym kontakcie. Firma może pozostać opcjonalna; jej usunięcie testować, nie zakładać korzyści.

**Co zmienić:** opis procesu wcześniej, sensownie rozpoznany temat, czytelne minimum długości i błędy. Rozważyć „Imię” zamiast „Imię i nazwisko”, jeśli pełne nazwisko nie jest potrzebne do pierwszego kontaktu.

**Co dodać:** „Odpowiadam zwykle w ciągu 1 dnia roboczego” tylko jeśli Piotr potwierdzi taką praktykę. Alternatywnie konkretny, prawdziwy termin. Kalendarz opcjonalny po weryfikacji popytu.

**Kolejność:** nagłówek + jedno zdanie → formularz → e-mail i zasady dalszej rozmowy. Desktop może zachować dwie kolumny.

**Desktop:** 1737 px ze stopką; dobry podział treści i pól. Nie wymaga nowego layoutu.

**Mobile:** 2689 px. Wysokość pól około 49–54 px i checkboxa 44 px jest wygodna. Obszar opisu ma około 185 px. Główne tarcie to treść nad nim, nie zbyt małe inputy.

**CTA:** „Wyślij opis”; przycisk informuje o wysyłaniu. Nie zamieniać na „Zamawiam demo”, bo formularz nie jest zamówieniem.

**Proof:** konkretny następny krok i tożsamość odpowiadającej osoby mają większy sens niż kolejne ogólne zapewnienia bezpieczeństwa.

**Copy:** komunikaty błędów i zachowanie tekstu przy awarii zachować. Po błędzie focus na podsumowaniu potwierdzono; początkowy szybki odczyt przed callbackiem dawał mylny brak fokusu, dlatego wykonano dodatkową weryfikację.

**SEO:** canonical powinien pozostać bez query. Parametry kontekstu nie mogą tworzyć indeksowanych kopii kontaktu. Nie mierzyć zapytań przez zapisywanie danych osobowych do analytics.

### `/polityka-prywatnosci` — [prywatność](https://protolume.pl/polityka-prywatnosci)

**Co jest dobre:** czytelne sekcje, administrator i e-mail, rzeczywiści nazwani dostawcy, zakres pól zgodny z formularzem, cel i prawa użytkownika, data aktualizacji.

**Co jest złe:** polityka obejmuje głównie formularz; opis „API → SMTP” jest bardziej implementacyjny niż potrzebny użytkownikowi. „Polska, Wrocław” jako adres korespondencyjny nie umożliwia doręczenia listu. Retencja jest bardzo ogólna.

**Co usunąć:** zbędny szczegół protokołu pocztowego z głównego wyjaśnienia. Nie usuwać rzeczywistej informacji o odbiorcach.

**Co skrócić:** lead i techniczny opis przepływu; nie skracać kosztem obowiązków informacyjnych.

**Co zmienić:** nazwać dokument zgodnie z realnym zakresem całej witryny i kontaktu. Wyjaśnić pola obowiązkowe, dobrowolność i skutki niepodania, podstawy dla poszczególnych celów, okresy lub precyzyjne kryteria retencji.

**Co dodać:** opis faktycznych logów/ochrony przed nadużyciami, trybu demo, cookies/analytics i transferów — po ustaleniu, co występuje. Sprawdzić prawa właściwe dla zastosowanych podstaw, m.in. przenoszenie i cofnięcie zgody, jeśli dotyczą danego procesu.

**Kolejność:** kto odpowiada → jakie dane i po co → gdzie trafiają i jak długo → prawa/kontakt → informacje techniczne i aktualizacja.

**Desktop:** 3291 px; czytelna kolumna tekstowa. Nie wymaga kart marketingowych.

**Mobile:** 3457 px; akapity nie wychodzą poza ekran. Spis treści może pomóc po rozszerzeniu dokumentu.

**CTA:** e-mail do spraw danych, powrót do kontaktu. Nie wstawiać sprzedażowego CTA pomiędzy prawa użytkownika.

**Proof:** jasne, aktualne dane administratora i zgodność dokumentu z działaniem witryny.

**Copy:** prosty język, np. „Wiadomość trafia do systemu formularza, a następnie do skrzynki kontaktowej obsługiwanej przez Google Workspace”.

**SEO:** istniejące title i canonical wystarczają. Nie ma potrzeby pozycjonowania dokumentu prawnego. Zakres zgodności ocenić z prawnikiem; audyt UX nie jest opinią prawną.

### Nieistniejąca trasa / 404

**Co jest dobre:** sprawdzony losowy adres zwraca HTTP 404 oraz `noindex, follow`, z czytelną informacją i drogą wyjścia. **Co jest złe:** nie wykryto osobnej istotnej usterki; nadal dotyczy go wspólny start aplikacji. **Usunąć/skrócić/dodać:** brak potrzeby dodatkowego marketingu. **Zmienić:** tylko w ramach ogólnych poprawek. **Kolejność:** komunikat → powrót/rozwiązania. **Desktop/mobile:** 1268/1537 px ze stopką, bez overflow. **CTA:** powrót do serwisu. **Proof:** nie dotyczy. **Copy:** prosty komunikat zachować. **SEO:** nie zmieniać na soft 404, HTTP 200 ani `index`.

## Część 4 — Docelowa information architecture

### Pozycjonowanie i zasada podziału

**Rekomendowane pozycjonowanie:** małe studio AI/software engineering prowadzone przez Piotra Barabasza, które buduje automatyzacje i integracje, a ryzyko większej inwestycji zmniejsza przez szybki, sprawdzalny pierwszy etap.

**Rdzeń marki:** „Pokazujemy działanie przed większą inwestycją”. To mocniejsze i trwalsze niż sama szybkość. Siedem dni jest konkretnym formatem współpracy, nie dowodem przewagi. Przewaga powstaje dopiero z połączenia: działający artefakt, czytelny wynik testu, bezpośrednia odpowiedzialność i możliwość dalszego rozwoju.

**Odbiór obecny:** odpowiedzialny, techniczny wykonawca lub małe studio konsultingowo-wdrożeniowe. Momentami strona przypomina katalog możliwości agencji AI. Nie ma podstaw, by przedstawiać Protolume jako product company: usługi są dopasowywane, nie sprzedawane jako gotowe produkty z ustaloną funkcjonalnością.

Founder-led jest zaletą przy szybkim podejmowaniu decyzji, komunikacji i ograniczonym module. Przy procesach krytycznych pojawia się pytanie o ciągłość: dostęp do repo, dokumentację, przekazanie, maintenance i odpowiedzialność podczas nieobecności. Te odpowiedzi powinny wynikać z rzeczywistego modelu pracy. Nie kreować pozornego zespołu ani deklaracji 24/7.

### Nawigacja główna

**Rozwiązania · Demo w 7 dni · Aplikacje i integracje · Dla software house’ów · Studio · [Opisz proces]**

- „Kontakt” może zniknąć jako osobna pozycja obok CTA prowadzącego do kontaktu. E-mail i link Kontakt pozostają w stopce.
- „Wdrożenia” zmienia się na „Aplikacje i integracje”, ponieważ obecna nazwa nie wyjaśnia różnicy wobec rozwiązań AI.
- „Dla partnerów” zmienia się na nazwę odbiorcy. To rozdzielenie dwóch sposobów kupowania, nie druga marka.
- „Studio” jest krótsze od „O Protolume”. Nie trzeba jednak zmieniać tej etykiety, jeśli test nie wykaże problemu — ważniejsza jest treść strony.
- R&D pozostaje w stopce i przy kompetencjach/studio. Już dziś nie zajmuje miejsca w głównym menu; nie dopisywać fikcyjnego zadania jego przenoszenia.
- Mobile zachowuje dostępne menu, Escape, blokadę treści w tle i powrót fokusu. Kolejność pozycji taka sama jak desktop. Nie dodawać megamenu przy tej liczbie usług.

### Sitemap — stan docelowy bez niepotrzebnych migracji URL

```text
/                                  Marka, problem, sprawdzalny przykład, pierwszy etap
├─ /rozwiazania                     Jeden hub według problemu
│  ├─ /rozwiazania/automatyzacja-procesow
│  │                                Wiadomości i dokumenty → dane w systemie
│  ├─ /rozwiazania/chatbot-ai-dla-firm
│  │                                Wiedza firmy → odpowiedź ze źródłem
│  ├─ /rozwiazania/voice-ai-dla-firm
│  │                                Telefony → zebrana i przekazana sprawa
│  ├─ /rozwiazania/integracje-whatsapp-crm
│  │                                Konwersacje → CRM i właściciel
│  └─ /rozwiazania/systemy-agentowe
│                                   Wieloetapowe zadania → sprawdzony wynik
├─ /demo-ai                         Oferta pierwszego etapu
│  └─ #interactive-demo             Bezpośrednie wejście do obecnej symulacji
├─ /development                     Aplikacje, API, panele, integracje
├─ /dla-software-house              Podwykonawstwo, moduł, repo, przekazanie
├─ /studio                          Osoba, wykonana praca, odpowiedzialność
│  └─ link do /rd                   Istniejący URL, logiczne zaplecze kompetencji
├─ /rd                              Eksperymenty i wyniki
├─ /przyklad-demo                   Przykład raportu + PDF
├─ /kontakt                         Jeden formularz z zachowaniem intencji
└─ /polityka-prywatnosci             Dane i kontakt

Dopiero po powstaniu materiałów:
/demo/asystent-wiedzy               Realny RAG + źródła + opis zakresu
/rd/[temat-eksperymentu]            Pełna metoda i wynik
/realizacje/[opis-procesu]          Zatwierdzone case study klienta
```

Logiczne zagnieżdżenie nie wymaga fizycznej zmiany wszystkich adresów. Usunięcie podwójnej listy nie oznacza przekierowania istniejących landingów. Aktualne linki z kotwicami trzeba utrzymać lub świadomie przepiąć. Nowe strony nie powinny powstawać jako puste zapowiedzi.

### Problem-first a industry-first

Teraz lepsza jest nawigacja według problemu. Wiadomości, dokumenty, wiedza, telefony i CRM pasują do wielu branż i wymagają niewielkiego tłumaczenia. Branże takie jak e-commerce czy usługi są zbyt szerokie bez osobnych przykładów, wiedzy domenowej i wyników.

Warstwa branżowa staje się zasadna, gdy występują powtarzalne zapytania i co najmniej jeden mocny artefakt lub projekt dla danej branży. Wtedy nie jest dodatkową siatką pustych landingów SEO, lecz stroną łączącą konkretny proces, systemy i dowód. Hipotezę testować wyborem rozwiązania przez użytkowników i danymi zapytań z GSC.

## Część 5 — Docelowa struktura homepage

Najpierw usunąć powtórzenia, potem uzupełnić brakujące dowody. Poniższa struktura ma sześć sekcji; nie jest poleceniem dołożenia ich pod obecne dziewięć bloków.

### 1. Hero — oferta i pierwszy krok

**Cel:** w kilka sekund odpowiedzieć, co robimy, dla kogo i co dostaje klient na start.

**Proponowany headline:** „Pokaż nam proces. W 7 dni pokażemy jego działające demo.”

**Subhero:** „Automatyzujemy powtarzalną pracę z wiadomościami, dokumentami i systemami firmy. Zaczynamy od jednego scenariusza, żeby sprawdzić jego działanie przed pełnym wdrożeniem.”

To copy zakłada, że pierwszy etap rzeczywiście zawiera działający przebieg, nie wyłącznie klikalną makietę. Jeśli oba warianty mają zostać w ofercie, wymagają różnych nazw i kryteriów odbioru. Pod hero krótka informacja o tym, od czego liczy się termin; brzmienie po decyzji operacyjnej, bez samowolnego dodawania „dni roboczych”.

**UI:** obecny podział tekst–wizualizacja i paleta. Zamiast automatycznej pętli „LIVE PROCESS” mały podgląd rzeczywistego wyniku albo jawnie oznaczony przykład przepływu. Nazwy danych po polsku. Bez zwiększania wysokości hero.

**CTA:** primary „Opisz proces”; secondary „Zobacz przykład działania”, prowadzące do odpowiedniej sekcji. Gdy jest tylko symulacja — użyć słowa symulacja.

**Proof:** widoczne wejście i wynik z etykietą „Projekt demonstracyjny · dane testowe”. Jeśli to jedynie ilustracja, tak ją nazwać.

**Mobile:** headline najlepiej do 4–5 krótkich wierszy, CTA po leadzie, potem kompaktowy wynik. Liczba wierszy to cel projektowy, nie wymóg łamania tekstu ręcznymi `<br>` na każdym urządzeniu.

### 2. Jeden proces PRZED → PO, połączony z dowodem

**Cel:** zastąpić ogólne wyjaśnianie technologii obrazem pracy człowieka.

**Headline:** „Tak może zmienić się obsługa jednego zapytania”.

**Przekaz:** poniżej projekt przykładu, nie stwierdzony wynik Protolume:

| PRZED — zadania pracownika | PO — działanie systemu i decyzja człowieka |
|---|---|
| Odczytuje wiadomość i rozpoznaje temat. | System odbiera wiadomość i proponuje typ sprawy. |
| Szuka danych i przepisuje je do rekordu. | System wydobywa pola i pokazuje ich źródło. |
| Przygotowuje aktualizację CRM i odpowiedź. | Operator widzi propozycję zmiany i szkic odpowiedzi. |
| Aktualizuje status i przekazuje sprawę. | Po zatwierdzeniu system zapisuje zmianę i właściciela. |

Nie pisać „4 kroki → 1” jako wyniku, dopóki działający scenariusz rzeczywiście nie przejmuje trzech kroków. Nie dopisywać minut, procentów ani miesięcznych oszczędności.

**UI:** wejściowa wiadomość i wynik obok siebie; krótka lista czynności. Dwa przyciski przykładu: poprawne dane i brak pola. Pokazać zmianę statusu tylko po wykonaniu scenariusza.

**CTA:** „Prześledź przykład” i po wyniku „Sprawdź podobny proces”.

**Proof:** ekran z działającej aplikacji, rzeczywisty sandbox CRM, krótki log oraz jawna informacja o pochodzeniu danych. Jeżeli materiał nie istnieje, etap pierwszy to wykonanie go.

**Mobile:** kolejno wejście → proponowana zmiana → status. Nie porównanie w dwóch kolumnach po 160 px.

### 3. Wybór problemu

**Cel:** szybkie samodopasowanie w 30–60 sekund.

**Headline:** „Gdzie Twój zespół wykonuje powtarzalną pracę?”

**Przekaz:** wiadomości i dokumenty, wiedza firmy, telefony, rozmowy w CRM, zadania wieloetapowe.

**UI:** pięć krótkich pozycji; pierwsza może być wizualnie mocniejsza, bo automatyzacja jest propozycją nadrzędną. Każda pozycja opisuje sytuację i rezultat, bez osobnego procesu wdrożenia. Zamiast kolejnej rozbudowanej siatki można zachować trzy obecne problemy i link do pełnego hubu, jeśli test wyboru potwierdzi czytelność.

**CTA:** link właściwy dla problemu; osobno „Nie wiesz, co wybrać? Opisz proces”.

**Proof:** miniatura już istniejącego artefaktu lub krótki typ wyniku, nie deklaracja skuteczności.

**Mobile:** jedna kolumna, pełny aktywny wiersz, bez karuzeli ukrywającej oferty. Nie rozciągać każdej karty do wysokości ekranu.

### 4. Co otrzymujesz po siedmiu dniach

**Cel:** zamienić obietnicę w konkretny pierwszy zakup.

**Headline:** „Pierwszy etap kończy się demo i decyzją, co dalej”.

**Przekaz:** działający scenariusz, wynik uzgodnionych testów, lista potrzebnych integracji i rekomendacja GO / warunkowe GO / NO-GO. Części te muszą wynikać z przyjętej oferty, nie z samego projektu strony.

**UI:** karta rezultatu + cztery etapy: ustalenie → budowa → test → omówienie. Dane wejściowe i wycena obok, w kilku zdaniach. Jedna sekcja szczegółów zamiast czterech list ograniczeń.

**CTA:** „Zobacz zakres pierwszego etapu”; kontakt „Opisz proces”.

**Proof:** miniatura i link do przykładowego raportu z jednoznacznym oznaczeniem jego fikcyjnego charakteru. Nie udawać, że wynik raportu dotyczy procesu oglądanego w poprzedniej sekcji, jeśli to inny materiał.

**Mobile:** rezultat przed harmonogramem. Etapy w zwartej liście, bez wielkiego dekoracyjnego „7”.

### 5. Kto odpowiada i co potrafi dowieźć

**Cel:** odpowiedzieć „dlaczego zaufać temu wykonawcy?”.

**Headline:** „Od pierwszej rozmowy pracujesz z osobą, która buduje rozwiązanie”.

**Przekaz:** Piotr Barabasz, rola techniczna, rodzaje wykonanej pracy, jasne przekazanie projektu.

**UI:** prawdziwe zdjęcie i 60–90 słów bio; obok 2–3 kompetencje połączone z artefaktami. „4+ lata” jako pomocniczy fakt. Dla software house’ów krótki link do osobnej ścieżki.

**CTA:** „Poznaj Piotra i przykłady pracy”; „Szukasz wsparcia modułu AI?” → landing partnerski.

**Proof:** konkretne repo/notatka/raport techniczny. Gdy kod jest prywatny, zanonimizowany fragment lub publiczny projekt własny, po rzeczywistym przygotowaniu materiału.

**Mobile:** zdjęcie nie musi zajmować całego ekranu; nazwisko, rola i jeden dowód przed dłuższym bio.

### 6. Domknięcie kontaktu

**Cel:** obniżyć koszt wykonania pierwszego kroku.

**Headline:** „Opisz proces, który dziś robicie ręcznie”.

**Przekaz:** „Wystarczą 2–3 zdania: co uruchamia pracę, gdzie trafiają dane i co ma być wynikiem.”

**UI:** krótki blok z jednym mocnym przyciskiem oraz e-mailem. Obecny ciemny styl może zostać po naprawie kontrastu.

**CTA:** „Opisz proces”.

**Proof:** podpis odpowiadającej osoby i rzeczywisty termin odpowiedzi, jeżeli został potwierdzony. Nie potrzeba nowej sekcji zapewnień o zaufaniu.

## Część 6 — System landingów o różnych strukturach

### Co jest wspólne

Wspólne pozostają: typografia, kolory, odstępy, przyciski, dostępne kontrolki, zasady stanu loading/error, etykieta pochodzenia artefaktu, karta pierwszego etapu i kontakt z kontekstem. Nie muszą być wspólne kolejność wszystkich sekcji, liczba kart, pięć kroków procesu i taki sam proof.

W obecnym `service-landing-page.component` warto wydzielić bazę i slot na właściwy przykład. Nie tworzyć siedmiu całkowicie niezależnych systemów UI. Nie dopisywać kilkudziesięciu warunków do jednego ogromnego szablonu, jeśli treść usług przestaje mieć tę samą strukturę.

| Landing | Sekwencja docelowa | Co go wyróżnia |
|---|---|---|
| Chatbot / RAG | Pytanie i odpowiedź → źródło → przykład braku danych → odbiorcy i materiały → aktualizacja/uprawnienia → pierwszy etap → FAQ | Dokument obok odpowiedzi, możliwość sprawdzenia konkretnego fragmentu. |
| Voice AI | Odsłuch → transkrypcja → zebrane pola i zadanie → trudniejszy fragment/przekazanie → integracja telefonii → pierwszy etap | Audio jako główny element, zsynchronizowany rezultat pracy. |
| Automatyzacja | PRZED/PO → wiadomość/dokument → propozycja zmiany → zapis → wyjątek → zakres i pierwszy etap | Faktyczny rekord lub status przed i po wykonaniu. |
| WhatsApp / CRM | Rozmowa → klient/rekord → właściciel/status → ponowne zdarzenie → wymagania API → etap wdrożenia | Powiązanie rozmowy z systemem i obsługa powtórzeń/duplikatów. |
| Systemy agentowe | Zadanie i wynik → timeline wykonania → wywołania narzędzi → zatwierdzenie → błąd/budżet → dopasowanie | Przebieg wieloetapowego zadania, koszt i kontrola wykonania. |
| Development | Gotowy moduł/UI → architektura → capability areas → paczka przekazania → odbiór i maintenance | To, co dostaje zespół: działające funkcje, kod, testy i instrukcje. |
| Software house | Moduł i model współpracy → przykładowy PR → CI/review → integracja z repo → ownership/NDA/handover | Sposób pracy w istniejącym zespole oraz konkretny standard przekazania. |

### RAG: czego nie pokazywać jako „pewności”

Rekomendowana powierzchnia dla klienta:

```text
Pytanie
[pytanie do opublikowanych materiałów demonstracyjnych]

Odpowiedź
[wynik rzeczywistego systemu]

Sprawdź podstawę odpowiedzi
[1] Nazwa dokumentu · sekcja / strona
    [otwórz fragment]

Nie znalazłem informacji w udostępnionych materiałach.
[gdy nie ma podstaw do odpowiedzi]

Szczegóły działania ▾
wersja materiałów · czas wykonania · identyfikator testu
```

Liczba źródeł może być pomocnicza. Nie jest wynikiem jakości. `chunks retrieved`, nazwa modelu i retrieval scores są przydatne do diagnostyki, ale nie do pierwszej decyzji biznesowej. Groundedness prezentować w raporcie ewaluacyjnym z metodą oceny, nie jako arbitralny procent przy każdej odpowiedzi. Przykład z umową i stroną 12 można wykorzystać wyłącznie, gdy istnieje demonstracyjny dokument o takiej treści. Prościej zacząć od niespornych publicznych informacji o zakresie współpracy.

Prawdziwe demo powinno wykonać retrieval przed odpowiedzią i zwrócić cytowania do istniejących dokumentów. Pytanie bez podstaw nie może zostać dopasowane do marketingowej odpowiedzi wyłącznie przez wspólne słowo „koszt”. Potrzebne są też testy parafraz, sprzecznych źródeł, pustego zapytania, niedostępności usługi i prób zmiany instrukcji przez treść pytania/dokumentu.

### Voice AI: konkretny UX

1. Widoczny czas i etykieta „Rozmowa demonstracyjna, dane testowe”. Play uruchamia prawdziwy plik po kliknięciu.
2. Podczas odsłuchu opcjonalne zaznaczenie aktualnej wypowiedzi; transkrypcja dostępna również bez audio.
3. Pod spodem „Co otrzymał pracownik”: temat, termin, dane kontaktu demonstracyjnego, następna akcja. Pola pochodzą z tego nagrania.
4. Drugi krótki fragment pokazuje przerwanie, brak danych lub przekazanie człowiekowi. Nie wszystkie ograniczenia w jednym przeciążonym nagraniu.
5. Szczegóły techniczne i wymagania operatora po rozwinięciu. Nie żądać mikrofonu, kiedy użytkownik chce tylko odsłuchać przykład.
6. Na błędzie pliku wyświetlić komunikat i transkrypcję; nie zostawiać pozornie działającego playera.

### Development: capability areas jako dostarczane elementy

| Obszar | Co ma zobaczyć klient | Dowód, zanim napiszemy „potrafimy” |
|---|---|---|
| Frontend | Formularze, panel, walidacja, stany błędów, dostępność | Działający widok, scenariusz błędu, wynik testu. |
| Backend / API | Kontrakt, walidacja danych, obsługa błędów | Endpoint, schemat i test kontraktowy. |
| Integracje / webhooki | Zdarzenie, mapowanie, zapis, retry/duplikaty | Wykonany przebieg w sandboxie. |
| AI / RAG | Źródła, odpowiedź, test jakości, ograniczenia | Zbudowany system oraz raport ewaluacji. |
| Dostarczenie | Kontener, pipeline, konfiguracja, health i instrukcja | Dockerfile, checks, instrukcja deploymentu, rzeczywisty smoke. |
| Eksploatacja | Logi, alerty, odtworzenie, przekazanie | Zrealizowany zakres obserwowalności i runbook. |

Repozytorium tej witryny daje podstawę do pokazania Angulara, FastAPI, walidacji, testów, kontenerów i konfiguracji GCP jako **projektu własnego**. Nie potwierdza automatycznie auth, baz wektorowych, produkcyjnego RAG, wysokiej dostępności ani skali klientów. Te kompetencje wymagają osobnego artefaktu lub informacji od Piotra.

## Część 7 — Architektura proof

### Trzy poziomy dowodu

1. **Doświadczenie użytkownika:** makieta, symulacja, nagranie interfejsu. Pokazuje logikę interakcji; nie jakość modelu.
2. **Działanie techniczne:** wykonane zapytanie, pobranie źródła, zapis do sandboxa, test kontraktu, mierzalny eksperyment. Pokazuje określone zachowanie w opisanych warunkach.
3. **Efekt biznesowy:** prawdziwe wdrożenie, okres obserwacji, wolumen, wynik i rola klienta. Wymaga danych oraz prawa do publikacji.

Nie trzeba mieć od razu trzeciego poziomu, żeby wiarygodnie sprzedawać. Trzeba natomiast unikać przedstawiania poziomu pierwszego jako trzeciego.

### Matryca produktu i dowodu

| Usługa | Najlepsza demonstracja | Artefakt | Metryka po wykonaniu pomiaru | CTA | Umiejscowienie |
|---|---|---|---|---|---|
| RAG | Pytanie → retrieval → odpowiedź → otwierane źródło | Zestaw dokumentów, fragment, raport testów | Trafność cytowań, poprawne odmowy, answer correctness; Recall@k pomocniczo | Sprawdź odpowiedź ze źródłem | Hero landingu, własne demo, skrót na home |
| Voice AI | Prawdziwa rozmowa + przekazanie | Audio, transkrypcja, wyodrębnione pola | Poprawność pól, ukończenie scenariusza, latencja p50/p95, przekazania | Posłuchaj rozmowy | Pierwszy ekran landingu; teaser bez autoplay |
| Automatyzacja | Wejście → propozycja → akceptacja → zapis | Wiadomość, rekord CRM, log | Poprawność pól/zapisu, czas ręcznej obsługi na porównywalnej próbie, błędy | Zobacz wiadomość → CRM | Home i landing automatyzacji |
| Integracje | Konwersacja → rekord i właściciel | Zdarzenie, mapowanie, sandbox CRM | Poprawnie zsynchronizowane zdarzenia, duplikaty, czas dostarczenia | Zobacz rozmowę w CRM | Landing, karta hubu |
| Agenci | Jedno wieloetapowe zadanie i wyjątek | Timeline/graf z rzeczywistego trace | Ukończone zadania, koszt/zadanie, liczba przejęć, błędy narzędzi | Prześledź wykonanie zadania | Landing; szczegóły w R&D |
| Development | Działający moduł plus przekazanie | UI/API, tests, Dockerfile, README, diagram | Wynik testów kryteriów, czas odtworzenia według instrukcji; nie sam coverage | Zobacz przykładowy moduł | Hero lub druga sekcja, studio |
| Software house | PR → review → checks → handover | Przykładowy PR, CI i paczka przekazania | Kryteria spełnione, odtwarzalność testów/builda | Zobacz przykładowe przekazanie | Zaraz po dopasowaniu współpracy |
| R&D | Hipoteza → baseline → eksperyment → wniosek | Repo/notebook, dataset, raport | Metryka właściwa hipotezie, koszt i zakres niepewności | Zobacz metodę i wynik | `/rd`, odnośnik przy usłudze |

### Kontrakt materiału dowodowego

Każdy materiał powinien mieć: identyfikator, typ dowodu, powiązaną usługę, pochodzenie danych, datę i wersję, działający link, krótkie „co pokazuje”, istotne ograniczenie oraz podstawę każdej liczby. Materiał klienta dodatkowo wymaga zgody na publikację i zatwierdzenia zakresu danych.

Przykładowa etykieta: **„Projekt własny · dane demonstracyjne · aktualizacja 2026-09-07”** — data w tym przykładzie nie oznacza, że artefakt już powstał. W publikacji użyć rzeczywistej daty.

Nie mnożyć disclaimerów wewnątrz każdej karty. Jedna widoczna etykieta i ograniczenie odnoszące się do danego dowodu wystarczą lepiej niż powtarzany manifest. Link nazwany „Zobacz działanie” musi prowadzić do działania albo uczciwie opisanego nagrania.

### Jak wyglądać przed pierwszym case study

- Użyć nazwy „Przykłady działania” lub „Projekty własne”. Nie tworzyć pustego bloku „Zaufali nam”.
- Pokazać dwa mocne, ukończone materiały. Jeden biznesowy przepływ i jeden przykład techniczny są lepsze niż siedem niedokończonych pokazów.
- Podać datę i zakres testu. Publikować błąd lub poprawną odmowę obok poprawnego przypadku, zamiast sugerować nieomylność.
- Pokazać osobę odpowiedzialną i sposób przekazania kodu. To praktyczna odpowiedź na ryzyko małego wykonawcy.
- Nie używać własnej witryny jako centralnego dowodu zaawansowanych automatyzacji. Może być przykładem konkretnego delivery, jeśli ujawniono adekwatne artefakty.

### Docelowe case study

**Nagłówek:** proces i osiągnięty rezultat, dopiero po potwierdzeniu danych.

**Sekwencja:** kontekst klienta → ręczna praca przed zmianą → zakres wykonany przez Protolume → diagram i UI → rola człowieka → wynik pomiaru → czego pomiar nie obejmuje → utrzymanie i następny krok.

**Dane:** okres, wolumen, liczba obserwowanych spraw, definicja błędu i czasu obsługi, koszty utrzymania, źródło porównania. Rozdzielić czas pracy operatora od czasu kalendarzowego oczekiwania. Nie przypisywać całej zmiany biznesowej samemu AI bez podstaw.

Przykładowe pola „4 ręczne kroki / 1 krok / 300 spraw miesięcznie” są **pustym schematem danych do zebrania**, nie liczbami do publikacji. Do referencji dodać imię, rolę i zgodę osoby; w anonimowym case study jawnie opisać anonimizację, bez wymyślania branży czy logotypu.

### R&D jako przewaga techniczna

Najbardziej użyteczne są pytania powiązane z zakupem: kiedy RAG poprawnie odmawia, jak zmienia się koszt zadania po dodaniu kroku weryfikacji, jak integracja reaguje na duplikat. Każdy eksperyment powinien doprowadzić do wniosku projektowego, np. „dla takiej klasy pytań wybieramy inne źródło lub dodatkowe sprawdzenie”.

Nie publikować rankingu modeli bez setupu ani wyników z próby użytej do dostrajania jako niezależnej ewaluacji. R&D buduje przewagę przez odtwarzalność i jakość decyzji, nie przez samą liczbę artykułów.

## Część 8 — Copy, CTA oraz reguły treści

### Konkretne poprawki

Poniższe fragmenty sprawdzono w produkcji i odpowiadającym jej kodzie treści. Zamienniki są propozycjami redakcyjnymi; nowe obietnice wymagają potwierdzenia modelu usługi.

| Miejsce / rodzaj problemu | Obecny fragment lub konstrukcja | Propozycja |
|---|---|---|
| Home — nieprecyzyjny deliverable | „W 7 dni pokażemy działającą automatyzację” | „W 7 dni pokażemy działające demo Twojego procesu” — przy rzeczywistym wykonaniu procesu. |
| Hub — defensywny początek | „Nie sprzedajemy jednego gotowego systemu z półki” | „Dobieramy rozwiązanie do pracy, którą chcesz usprawnić.” |
| Hub — przeciążenie zakresami | Lead, osobny scope notice, zakres demo i zakres produkcji przy każdej pozycji | Na karcie: problem + rezultat; szczegóły pierwszego etapu na landingu. |
| RAG — nadmiar ostrożności | „Budujemy ograniczone demo oparte na wybranych materiałach” | „Sprawdź odpowiedzi na pytania do wybranych materiałów firmy.” |
| RAG — abstrakcyjna kontrola | „sprawa nie jest domykana automatycznie” | „Gdy brakuje informacji, asystent przekazuje pytanie wskazanej osobie.” |
| Agenci — techniczna nazwa | „Systemy agentowe” | „AI do zadań wymagających kilku kroków” + techniczna nazwa w podtytule. |
| Agenci — negatywna deklaracja | „bez obietnicy pełnej autonomii” | „Widzisz wykonane kroki i zatwierdzasz ważną decyzję.” |
| Integracje — niekonkretna asekuracja | „Nie zakładamy gotowości wszystkich połączeń” | „Przed testem sprawdzamy dostęp do API Twojego CRM i kanału wiadomości.” |
| Development — przeładowany H1 | Długi H1 o aplikacjach, API, integracjach i jasno ustalonym pierwszym etapie | „Aplikacje i integracje do codziennej pracy zespołu”. |
| Development — dosłowne powtórzenie | Identyczny lead w hero i „Kiedy wdrożenie ma sens” | Zachować jedną wersję; w drugiej sekcji pokazać przykład projektu. |
| Partnerzy — eksponowanie braku | „bez logotypów klientów ani niepotwierdzonych wyników” | „Przejrzyj przykład modułu, testy i sposób przekazania kodu” — gdy istnieje materiał. |
| Studio — korporacyjna rola | „Właściciel i odpowiedzialny partner techniczny” | „Piotr Barabasz — założyciel i inżynier prowadzący projekt”. |
| Studio — powtarzanie odpowiedzialności | Kilka bloków o kontakcie, analizie, realizacji i odbiorze | „Rozmawiasz ze mną od pierwszej rozmowy do przekazania rozwiązania.” |
| Studio — status administracyjny | Długi opis studiów i oczekiwania na obronę | Krótka nota o programie i kompetencjach, z prawdziwym statusem edukacji. |
| Demo — udawana czynność | „Sprawdzam materiały…” przy timerze i gotowej odpowiedzi | Usunąć opóźnienie albo „Pokazuję przykładową odpowiedź”. |
| Demo — statyczna pewność | „Poziom pewności: Wysoka…” | W symulacji usunąć; w realnym RAG pokazać źródło do samodzielnego sprawdzenia. |
| Demo — fallback sprzedażowy | Długi opis tego, czego demo nie robi, oraz zaproszenie na prezentację | „Ta symulacja nie ma odpowiedzi na to pytanie. Wybierz przykład albo opisz swój proces.” |
| Raport — komentarz o pisaniu raportu | „Najpierw pokazano, jaką wartość i rezultat…” | Usunąć. Następna lista już tę informację przedstawia. |
| Raport — niejasny status | Handoff opisany jako wykonany, status nadal „wymaga walidacji” | „Ścieżkę przekazania pokazano. Trafność rozpoznawania braku danych nie była jeszcze testowana.” — tylko jeśli to zamierzony sens przykładu. |
| Kontakt — ogólny następny krok | „wskażemy właściwy kolejny krok” w kilku miejscach | Jedna informacja kto odpowie, kiedy i czy potrzebne będzie doprecyzowanie danych. |
| Kontakt — zbędnie formalny disclaimer | Długi akapit o zamówieniu, wycenie i płatnej realizacji | „Najpierw ustalimy zakres i wycenę. Wysłanie opisu nie rozpoczyna płatnych prac.” |
| Prywatność — żargon | „API przekazuje wiadomość … przez usługę SMTP” | Wyjaśnienie o systemie formularza i skrzynce kontaktowej, z nazwą dostawcy w sekcji odbiorców. |

### Język w interfejsie

| Obecnie | Na stronie biznesowej | Gdzie można zachować angielski |
|---|---|---|
| LIVE PROCESS | Przykład przepływu / Działanie demonstracyjne | Rzeczywisty monitor procesu, jeśli faktycznie live |
| HUMAN CONTROL / Human review | Zatwierdzenie przez pracownika | Oryginalny fragment technicznego narzędzia z objaśnieniem |
| INPUT / DATA / RESULT | Wejście / Odczytane dane / Wynik | Schemat API lub dokumentacja dla partnera |
| Active / Complete / Done | W toku / Zakończono / Gotowe | Zrzut narzędzia, którego nie tłumaczymy ręcznie |
| handoff | Przekazanie sprawy | Dokumentacja techniczna po zdefiniowaniu terminu |
| extraction | Odczyt danych / Wyodrębnione pola | W kodzie, nazwie testu lub integracji |
| PR, API, CI/CD, Docker, RAG | Zostawić i wyjaśnić funkcję, jeśli potrzebna | Development, partnerzy, szczegóły R&D |

Nie tłumaczyć nazw produktów i protokołów na sztuczny polski. Nie mieszać „my”, „ja” i bezosobowych konstrukcji bez intencji: marka może mówić „budujemy”, a Piotr w bio „prowadzę”. W kontakcie i opisie odpowiedzialności pierwsza osoba daje najwięcej jasności.

### Pełny system CTA

| Kontekst | Główna akcja | Druga akcja | Reguła celu |
|---|---|---|---|
| Home / hub / usługa biznesowa | Opisz proces | Zobacz właściwy przykład | Kontakt z usługą w kontekście; przykład dostępny bez szukania |
| RAG | Opisz proces | Sprawdź odpowiedź ze źródłem | Realne demo lub uczciwie nazwana symulacja |
| Voice | Opisz proces | Posłuchaj rozmowy | Uruchomienie playera lub przejście do widocznego audio |
| Automatyzacja | Opisz proces | Zobacz wiadomość → CRM | Ten sam przykład co w zapowiedzi |
| Integracje | Opisz proces | Zobacz rozmowę w CRM | Zachowane znaczenie kanału |
| Agenci | Opisz proces | Prześledź wykonanie zadania | Wynik i trace, nie ogólny raport |
| Development | Opisz projekt | Zobacz przykładowy moduł | Formularz projektu, bez przymusowego demo |
| Software house | Opisz moduł | Zobacz przykładowe przekazanie | Kontekst współpracy partnerskiej |
| Oferta 7 dni | Opisz proces | Zobacz przykładowy raport | Wyjaśniony zakres płatnego etapu |
| Studio | Porozmawiaj z Piotrem | Zobacz przykłady pracy | Ta sama osoba i informacje na kontakcie |
| R&D | Zobacz metodę i wynik | Omów problem techniczny | Pierwszeństwo materiału, kontakt jako dalszy krok |
| Kontakt | Wyślij opis | Napisz e-mail | Akcja zgodna z wysłaniem zapytania, bez języka zamówienia |

W pojedynczym bloku jedna mocna akcja i najwyżej jedna równoległa pomocnicza. Dalsze linki mogą pozostać tekstowe. Nie ujednolicać przycisków odsłuchu, pobrania i kontaktu do ogólnego „Dowiedz się więcej”.

### Pricing: rekomendacja na teraz i warianty

**Teraz:** zachować indywidualną wycenę wdrożeń, ale jawnie rozdzielić bezpłatną rozmowę/prezentację od płatnego przygotowania demo, jeśli taki jest model. Wyjaśnić, czy wynik NO-GO nadal stanowi płatny rezultat analizy. Wycena pierwszego etapu przed startem już jest dobrą praktyką na stronie.

| Wariant | Korzyść | Koszt / ryzyko | Kiedy ma sens |
|---|---|---|---|
| Cena „od” | Prosty próg kwalifikacji | Kotwiczy na najniższym wariancie; łatwo wywołać rozczarowanie | Gdy minimalny zakres jest rzeczywiście powtarzalny i dostępny |
| Typowe widełki pierwszego etapu | Zmniejszają lęk o budżet, zostawiają przestrzeń na zakres | Muszą wynikać z danych; wymagają wyjaśnienia integracji i kosztów zewnętrznych | Najbardziej obiecujący wariant po ustandaryzowaniu demo |
| Pakiety | Łatwo porównać rezultaty | Sugerują gotowy produkt i generują wyjątki | Gdy trzy warianty są faktycznie dostarczane regularnie |
| Bez kwot, z zasadami wyceny | Pasuje do prac niestandardowych | Nie odpowiada na pytanie, czy klienta stać | Obecnie rozsądne dla produkcyjnego developmentu i integracji |

Nie rekomenduję publikowania losowych kwot z rynku. Zebrać istniejące lub kolejne wyceny: rodzaj procesu, czas pracy, liczbę integracji, koszt usług, marżę i przyczynę utraty leada. Następnie testować zrozumienie widełek i jakość kontaktów. Nie mylić mniejszej liczby zgłoszeń z gorszą sprzedażą, jeśli wzrasta ich dopasowanie.

### Kalendarz i termin odpowiedzi

Kalendarz może pomóc leadom o wysokiej intencji oraz partnerom technicznym. Może też dodać zewnętrzną usługę, puste sloty, nieobecności i spotkania z niedopasowanymi klientami. Najpierw mierzyć, ile kontaktów prosi od razu o rozmowę. Jeżeli wdrożyć, wystarczy link „Umów 20-minutową rozmowę” przy e-mailu lub po obejrzeniu proof, z zachowaniem formularza. Osadzony kalendarz nie jest konieczny.

Termin odpowiedzi publikować jako realny standard, nie ozdobny trust badge. Dostępność slotów i odpowiedź w dzień roboczy muszą odzwierciedlać sposób pracy jednej osoby.

### SEO, dostępność i performance — zalecenia przekrojowe

**SEO:** nie stwierdzono pustych metadata, braku sitemap ani blokady indeksowania. Na wszystkich badanych stronach jest jeden H1. W JSON-LD występują Person, ProfessionalService i WebSite; zależnie od strony także Service, ItemList, BreadcrumbList i CreativeWork. Nie dodawać struktury danych tylko po to, aby mieć jej więcej.

- Poprawić description hubu i odmianę nazwiska w studio; rozdzielić intencje home, automatyzacji, integracji i developmentu.
- BreadcrumbList landingów dziś pomija poziom hubu. Po wprowadzeniu widocznych breadcrumbs uzgodnić oba przebiegi, np. Home → Rozwiązania → Voice AI.
- Jedna macierz nazw powinna sterować hubem, breadcrumbs, schema i kontekstem kontaktu.
- Powtarzalny szablon nie jest dowodem na karę za duplikację. Problemem jest brak samodzielnej wartości i potencjalne pokrycie intencji. Dla kanibalizacji sprawdzić w GSC pary zapytanie–URL, zmiany strony rankującej, CTR i indeksację; nie stosować cross-canonical między różnymi usługami jako domyślnej naprawy. [Google — canonicalization](https://developers.google.com/search/docs/crawling-indexing/canonicalization).
- OG image i Twitter card istnieją. Własne miniatury usług są P3, po stworzeniu rzeczywistych artefaktów. Obraz powinien nadal być dostępny pod publicznym URL i odpowiadać treści.
- ProfessionalService ma dane marki i kontakt, ale nie adres. Nie wymyślać adresu ani punktu obsługi w celu uzyskania rich result. Sprawdzić prawdziwe dane biznesowe i zasadność typu wobec [wymagań Google dla LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business).
- Nie dodawać FAQ schema jako obietnicy rozszerzonego wyniku: aktualna dokumentacja Google informuje o wyłączeniu FAQ rich results. FAQ na stronie ma odpowiadać na pytania kupującego. [Google Search — aktualizacje dokumentacji](https://developers.google.com/search/updates).

**Dostępność:** podstawy są dobre. Oprócz kontrastu naprawić mobilną ekspozycję odpowiedzi demo i zapewnić kontrolę nad automatyczną dziesięciosekundową pętlą hero. `prefers-reduced-motion` jest obsługiwane, ale nie zastępuje kontroli ruchu dla każdego użytkownika. Można wybrać statyczny wynik lub uruchomienie animacji na żądanie. [WCAG — Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).

Docelowo klikalny wiersz FAQ ma co najmniej 44 px wysokości dla wygody. Nie nazywać obecnego 27-pikselowego `summary` automatycznym naruszeniem WCAG 2.2 AA: minimum kryterium target size to 24 × 24 CSS px lub odpowiednie odstępy/wyjątki. [WCAG — Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). Podnieść komfort, zachowując natywny `details/summary` i klawiaturę.

Dekoracyjne SVG/ikony mogą pozostawać ukryte dla czytnika, o ile informacja jest dostępna w tekście. Obecna grafika hero jest `aria-hidden`; po zmianie w dowód produktu musi mieć równoważny opis wejścia i wyniku. Nowe audio potrzebuje transkrypcji, a wykresy i zrzuty czytelnych opisów. Test na NVDA/VoiceOver oraz fizycznym telefonie pozostaje do wykonania.

**Performance:** mobilna mediana trzech pomiarów home to Performance 73, LCP około 2,00 s i CLS 0,916. TBT wynosił 57–442 ms; nie wolno z tego wyprowadzać rzeczywistego INP. Jeden pomiar home nie pokazał CLS, co wskazuje zależność od momentu renderowania, a nie dowód naprawy.

Pobrane zasoby home w Lighthouse to około 191 KiB transferu. Nie odnotowano pobierania fontów ani sceny 3D. Obecność Spline w zależnościach projektu nie dowodzi kosztu sieciowego na stronie. Lazy routing i HTML z prerenderu zachować. Najpierw naprawić przebudowę DOM, potem ponownie zmierzyć.

Dla docelowych danych użytkowników oceniać LCP ≤2,5 s, CLS ≤0,1 i INP ≤200 ms na 75. percentylu, z podziałem na mobile i desktop; to progi „good”, nie gwarancja konwersji. [Web Vitals](https://web.dev/articles/vitals). Zbieranie RUM wymaga świadomej decyzji o danych i prywatności. Nowe audio ładować na żądanie, screenshotom nadać wymiary i warianty responsywne, materiałów poniżej pierwszego ekranu nie preloadować bez powodu.

### Co może wyglądać jak AI-generated website

Nie da się wiarygodnie ustalić autorstwa strony po wyglądzie. Można wskazać konkretne wzorce obniżające indywidualny charakter: identyczna anatomia pięciu landingów, wielokrotne „najpierw ustalamy zakres”, ogólne „jawne granice odpowiedzialności”, meta-komentarz w raporcie o kolejności prezentowania wartości, fikcyjne Acme i angielskie statusy w polskim kontekście. Nie jest problemem sam fiolet, zaokrąglenia lub użycie kart.

Najlepszą zmianą jest unikalny artefakt i konkretne zdanie o wykonanej pracy. Nie potrzeba „bardziej ludzkich” błędów ani nowych dekoracji. Wrażenie premium wynika tu z czytelności, jakości detalu, stabilności i sprawdzalnej kompetencji. Obecny wygląd może wspierać sprzedaż projektu za kilka lub kilkanaście tysięcy; przy większej odpowiedzialności luka proof i ciągłości pracy staje się bardziej istotna. To ocena jakości argumentacji, nie prognoza akceptowanych cen.

## Część 9 — Backlog do przekazania agentowi codingowemu

Komplet **28 zadań**, każde z priorytetem, problemem, zakresem, desktop/mobile, copy, kryteriami akceptacji, elementami do zachowania i zależnościami, znajduje się w [BACKLOG.md](BACKLOG.md). To integralna część audytu.

Zadania oznaczone jako wymagające materiałów nie są zgodą na wymyślanie dowodów. Coding agent może przygotować strukturę, ale publikacja claims musi zależeć od faktycznego artefaktu. W każdym tasku trzeba sprawdzić nowszy kod `2ff41c3`, aby nie odtwarzać już wykonanych zmian.

## Część 10 — Kolejność wdrożenia i weryfikacja wpływu

### Faza 1 — największy wpływ / najmniejszy koszt

**UX-001, UX-002, UX-003, UX-004, UX-008, UX-020 oraz rozpoczęcie UX-025.**

Naprawa kontrastu z uwzględnieniem istniejącej poprawki, stabilnego startu, znaczenia demo, kontekstu CTA, widoczności wyniku symulacji i najprostszego tarcia formularza. Uporządkować meta descriptions w UX-023 równolegle z redakcją. UX-002 może wymagać więcej pracy, ale pilność uzasadnia rozpoczęcie go od razu, zamiast odkładania performance na koniec.

**Warunek przejścia:** potwierdzona oferta pierwszego etapu; czytelny proof; brak chwilowego znikania `main`; klient trafia do właściwego kontaktu; wiadomo, że obecny przykład jest symulacją. Konsultacja prawna nie musi zatrzymywać niezależnych zmian UI.

### Faza 2 — architektura i proof

**UX-005, UX-006, UX-007, UX-009, UX-016, UX-017, UX-018, UX-021, UX-026, UX-027.**

Jeden katalog, wyraźne ścieżki B2B/partner, krótsza homepage i studio, przeprojektowany raport, inwentaryzacja materiałów oraz techniczna paczka pokazująca faktyczną pracę. Najpierw wykorzystać prawdziwe istniejące artefakty. Jeśli nie ma materiału do before/after, opublikować krótszą strukturę z jawną ilustracją i nie oznaczać jej jako nowego proof.

**Warunek przejścia:** każda usługa ma zdefiniowany typ dowodu i jasno nazwany brak materiału; hub ma jeden model danych; żaden nowy claim nie wynika tylko z makiety. Decyzja o cenie oparta na realnym modelu dostarczania, nie zapożyczonych stawkach.

### Faza 3 — większe nowe komponenty i działające przykłady

**UX-010, UX-011, UX-012, UX-013, UX-014, UX-015, UX-019 oraz opcjonalne UX-024.**

Najpierw działająca automatyzacja i RAG, później audio Voice AI, integracja kanału i wieloetapowe zadanie. Zasób proof może być współdzielony między home i landingiem; nie budować nowej aplikacji na każdą kartę. Wyniki R&D publikować po pomiarze. Kalendarz tylko po decyzji o dostępności i realnej potrzebie.

**Warunek przejścia:** każdy dostępny przycisk uruchamia właściwy materiał; są źródła, stany błędów, kontrola kosztów, właściwa informacja o danych i odpowiednia walidacja publikacji.

### Faza 4 — polish, SEO, accessibility, performance

**Domknięcie UX-022, UX-023, UX-025, UX-028 oraz ponowne pomiary nowych komponentów.**

To etap sprawdzenia spójności wszystkich zmian, nie miejsce odkładania P0. Testy fizycznego mobile, czytnika ekranu, zawijania treści, wysokości kontrolki FAQ, breadcrumbs, schema, wydajności audio/screenshotów i lejka. Następnie pierwsze iteracje oparte na obserwacji użytkowników.

Plan badań z UX-028 przygotować już w fazie 1; test wyboru wykonać przed zamknięciem hubu, a rozmowy o cenie przed decyzją w UX-026. Faza 4 domyka pomiar po wdrożeniu. Podstawową kontrolę animacji z UX-022 wykonać przy pierwszej zmianie hero, a przegląd nowych przepływów danych z UX-025 zawsze przed ich uruchomieniem.

### Plan testów, zamiast domyślnego A/B wszystkiego

| Decyzja | Najlepszy sposób sprawdzenia | Sukces / dane do zebrania |
|---|---|---|
| Czy wiadomo, co kupuje się po 7 dniach? | Test 10 sekund + pytania kontrolne, 5–8 osób kupujących | Potrafią podać rezultat, moment startu, płatność i różnicę wobec produkcji; nie oceniają „ładności”. |
| Czy hub pomaga wybrać? | Test zadań / tree test | Osoba z problemem dokumentów, wiedzy, telefonów i modułu wybiera właściwą ścieżkę bez objaśnień moderatora. |
| Czy proof zwiększa zaufanie? | Test z użytkownikami + analiza kliknięć/wyświetleń materiału | Użytkownik potrafi powiedzieć, co wykonano, na jakich danych i czego wynik nie dowodzi. |
| Który hero / before–after konwertuje? | A/B dopiero przy dostatecznej liczbie kwalifikowanych kontaktów | Główna miara: kwalifikowane zapytania, nie sam CTR przycisku. Przed startem określić MDE, liczebność, czas i guardrails. |
| Czy cena pomaga? | Najpierw rozmowy i analiza wycen; potem test wariantu | Dopasowanie budżetu, odsetek przejść do rozmowy/oferty, marża i jakość leadów. |
| Czy potrzebny jest kalendarz? | Analiza pytań o spotkanie i test opcjonalnego linku | Liczba odbytych wartościowych rozmów, no-show, obciążenie Piotra. |
| Czy strony konkurują o te same frazy? | Search Console | Zapytania/URL, indeksacja, CTR i zmiany rankującego URL. Sam wspólny szablon nie daje odpowiedzi. |
| Czy start i nowe media są stabilne? | Lighthouse, trace, potem RUM/CrUX jeśli dostępne | Powtarzalny brak znikania treści; LCP/CLS/INP z poprawnym rozdzieleniem lab i field. |
| Czy informacja o danych jest właściwa? | Mapa danych + konsultacja prawna | Spójność formularza, API, dostawców, retencji, demo i dokumentu prywatności. |

Przy małym ruchu testy A/B mogą długo nie dawać wiarygodnej odpowiedzi. Wtedy lepsze są obserwowane zadania, przegląd rozmów sprzedażowych i porównanie jakości leadów po kolejnych zmianach — z zaznaczeniem, że porównanie przed/po nie izoluje przyczynowo wpływu redesignu.

### Minimalny model pomiaru lejka

Zdarzenia do rozważenia: `solution_open`, `proof_view`, `proof_interaction`, `source_open`, `contact_start`, `contact_validation_error`, `contact_submit_success`. Parametry: identyfikator strony/usługi/artefaktu i typ kontrolki. **Nie zapisywać** treści pytania, wiadomości, e-maila, nazwiska ani swobodnych parametrów URL jako danych analitycznych.

Kliknięcie „Wyślij” nie jest sukcesem. Sukces UI to przyjęcie przez API; dalszym wynikiem biznesowym jest wartościowa rozmowa, oferta i wdrożenie. Kwalifikację można początkowo prowadzić ręcznie, bez nowego CRM lub rozbudowanej analityki. Narzędzie i podstawę prawną pomiaru dobrać do faktycznie zbieranych danych.

### Czego nie zmieniać w kolejnej iteracji

Logo, podstawowej palety, czytelnych natywnych pól, opcjonalnego budżetu, obsługi klawiatury, bezpośredniej tożsamości Piotra, uczciwego oznaczania projektów własnych, istniejących URL-i bez potrzeby, prerenderu, canonical, indeksowalności i prawdziwego 404. Nie dodawać dekoracyjnego 3D, fałszywych klientów, liczników i wyników, automatycznie każdej branży ani cen nieopartych na rzeczywistym sposobie pracy.
