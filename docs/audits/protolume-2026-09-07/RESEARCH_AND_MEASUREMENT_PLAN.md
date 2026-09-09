# UX-028 — plan badania decyzji i pomiaru lejka

Status: plan do uzgodnienia, bez uruchomionego trackera, identyfikatorów użytkownika ani wysyłki zdarzeń. Nie ma wyniku konwersji. Oddzielamy: lokalne testy techniczne, obserwacje rzeczywistych użytkowników i wyniki sprzedażowe.

## Zdarzenia i ich znaczenie

| Zdarzenie | Warunek | Co mierzy / czego nie dowodzi |
| --- | --- | --- |
| proof_view | Co najmniej połowa bloku dowodu widoczna przez ciągłą sekundę w aktywnej karcie; raz na artefakt w danym wyświetleniu strony | Ekspozycja, nie przeczytanie ani zaufanie |
| proof_interaction | Świadome użycie kontrolki: wybór pytania, rozwinięcie śladu lub uruchomienie zatwierdzonego audio | Użycie; nie sam hover ani scroll |
| source_open | Kliknięcie odnośnika do dokumentu/kodu/raportu z ustalonego katalogu | Zamiar sprawdzenia źródła; klik nie potwierdza przeczytania |
| artifact_download | Kliknięcie pobrania pliku; odrębnie od otwarcia źródła | Zamiar pobrania, nie potwierdzone zapisanie pliku przez przeglądarkę |
| contact_start | Pierwsza świadoma zmiana pola formularza; raz w pamięci komponentu | Rozpoczęcie; sam focus lub wejście na stronę nie wystarcza |
| contact_error | Nieudana próba; kategoria z zamkniętej listy: validation, rate_limit, unavailable, server_error | Tarcie; bez wartości pól, tekstu błędu dostawcy ani surowego body |
| contact_success | Poprawna odpowiedź API potwierdzająca przyjęcie, po zakończeniu requestu | Przyjęcie przez interfejs/API; nie klik przycisku, dostarczenie do skrzynki ani kwalifikowany lead |

Ruch bota/honeypot może dostać pozorną odpowiedź accepted. Dlatego sprzedażowy mianownik nie pochodzi wyłącznie ze zdarzenia klienta; faktyczne zgłoszenia należy rozliczać zgodnie z uzgodnionym stanem intake/dostarczenia, bez ujawniania mechanizmu antyspamowego użytkownikowi.

Proponowana zamknięta lista właściwości: wersja schematu zdarzeń, nazwa zdarzenia, kanoniczna ścieżka bez query/hash, allowlistowany identyfikator usługi/artefaktu i jego wersja, typ interakcji, kategoria wyniku, przedział szerokości ekranu. Wartości wyłącznie z katalogów aplikacji. Nie wysyłać imienia, adresu e-mail, firmy, pytania, treści wiadomości, budżetu, promptu, URL referrera, pełnego URL, identyfikatora rekordu CRM, surowego wyjątku ani dowolnej etykiety DOM.

Nie dodawać trwałego identyfikatora ani fingerprintingu dla samej analizy lejka. Sposób agregacji, deduplikacji, retencji, zgód i dopuszczalnych danych musi zostać wybrany z dostawcą po przeglądzie DATA_FLOW_MAP.md. Obecny build odrzuca niedozwolone skrypty analytics; nie osłabiać tego gate bez osobnego wdrożenia i uzgodnionego przepływu.

## Ręczna kwalifikacja zgłoszeń

Proponowana definicja do akceptacji Piotra: zapytanie opisuje rzeczywisty problem w organizacji, pasuje do oferowanego rodzaju pracy, ma możliwego właściciela następnego kroku i pozwala ustalić konkretny zakres dalszej rozmowy. Budżet może pozostać nieznany. Nie używać wielkości firmy lub gotowości do konkretnej technologii jako domyślnego warunku.

W prywatnym rejestrze: odebrane / duplikat lub spam / wymaga doprecyzowania / pasuje do zakresu / poza zakresem / uzgodniony kolejny krok / odbyte spotkanie / rozpoczęta współpraca. Powód z krótkiej zamkniętej listy; to robocza propozycja, nie aktualnie obowiązujący proces sprzedaży. Raport publiczny lub analytics otrzymuje co najwyżej uzgodnione agregaty, bez danych kontaktowych i łączenia z identyfikatorami wizyty.

## Badanie jakościowe przed A/B

Pierwsza runda: planowana próba ośmiu osób, po cztery z rolą biznesową i techniczną, które odpowiadają za podobne decyzje. To badanie wykrywania problemów, bez estymacji częstości w populacji. Uzgodnić rekrutację, zakres danych i dobrowolną zgodę na ewentualne nagranie; nikogo jeszcze nie zaproszono.

1. **Test 10 sekund.** Pokazać początek właściwej strony na urządzeniu uczestnika, potem ukryć. „Czym zajmuje się ta firma?”, „Co możesz tu otrzymać?”, „Co zrobiłbyś dalej?”. Nie podpowiadać automatyzacji ani siedmiu dni.
2. **Wybór usługi.** „Zespół przepisuje informacje z wiadomości do systemu. Znajdź miejsce, od którego zacząłbyś sprawdzanie pomocy”. Obserwować wybór, uzasadnienie i powroty; scenariusze rotować między uczestnikami.
3. **Sprawdzenie dowodu.** „Co możesz samodzielnie sprawdzić? Co ten materiał potwierdza, a czego nie?”. Przejść przez symulację, źródło kodu i fikcyjny raport; zmieniać kolejność.
4. **Zrozumienie płatności.** „Co wydarzy się po wysłaniu opisu? W którym momencie podjąłbyś zobowiązanie?”. Nie przedstawiać niepotwierdzonych zasad jako faktu.
5. **Kontakt.** W lokalnym środowisku i na danych testowych opisać potrzebę, zobaczyć kontrolowany błąd i ponowić próbę. Nie generować prawdziwego leada.
6. **Zakończenie.** „Jakiej informacji zabrakło do podjęcia następnego kroku?”. Kalendarz sprawdzać jako potrzebę, nie jako sugerowane rozwiązanie.

Zapis obserwacji: identyfikator badania bez danych osobowych, rola, urządzenie, zadanie, ukończenie, moment zawahania, błędne rozumienie, dosłowna anonimowa wypowiedź za zgodą i wniosek z poziomem pewności. Oddzielić obserwację od interpretacji. Kryteria: wybór adekwatnej usługi, poprawne odróżnienie symulacji/eksperymentu/realizacji, rozumienie następnego kroku i możliwość odzyskania formularza po błędzie.

## GSC i porównania po publikacji

Po dostępie do właściwości domenowej: sprawdzić indeksowanie, kanoniczne URL-e i zapytania/strony/urządzenia w porównywalnych okresach, uwzględniając datę wdrożenia, sezonowość i małe liczebności. Query kontaktu nie jest osobną stroną w raporcie. Nakładanie się zapytań nie wystarcza do stwierdzenia kanibalizacji ani zmiany canonical. Dane GSC, field CWV i wyniki z lokalnego Chromium raportować osobno.

## Warunki przyszłego A/B

Przed uruchomieniem zapisać hipotezę, jedną główną metrykę, jednostkę losowania, baseline, minimalny istotny biznesowo efekt (MDE), poziom błędu, moc, liczebność na wariant, okres i regułę zakończenia. Nie ma obecnie danych pozwalających ustalić liczebność lub obiecać datę końca.

Guardrails: błędy formularza, dostępność, jakość leadów, spam, czas odpowiedzi operacyjnej i wydajność strony. Nie kończyć testu po pierwszym korzystnym odczycie; uwzględnić wielokrotne porównania, jeśli zaplanowano kilka wyników. Przy ruchu niewystarczającym do uzgodnionej liczebności wybrać badanie jakościowe i opisową obserwację, bez deklaracji istotności.

Wszystkie zewnętrzne integracje i kontakt z uczestnikami wymagają odrębnej decyzji i autoryzacji. Ten dokument nie aktywuje żadnej usługi ani kampanii.
