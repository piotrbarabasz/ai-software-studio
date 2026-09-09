# UX-024/026 — decyzje potrzebne do oferty i rozmów

Stan: przygotowane do decyzji właściciela; bez aktywacji kalendarza i bez nowego cennika. Dokument jest wewnętrzny. Nie stanowi oferty dla klienta.

## Koszt pierwszego etapu

Obecne źródło treści to `frontend/src/app/core/content/first-stage.pl.ts`, używane przez wspólny komponent na home i stronie demo. Użytkownik widzi wycenę przed startem, brak rozpoczęcia płatnej realizacji przez formularz, czynniki kosztu oraz osobne usługi zewnętrzne i utrzymanie. Formularz nadal ma opcjonalny budżet. Development dodaje konkretny zakres odbioru; nie wprowadza kwot.

Do zamknięcia UX-003/026 potrzebna jest jedna decyzja dla każdego wiersza:

| Pytanie | Materiał do decyzji | Zmiana po decyzji |
| --- | --- | --- |
| Co jest bezpłatne: rozmowa, pokaz istniejącego materiału, przygotowanie? | Faktyczny sposób pracy i ostatnie uzgodnienia | Jednoznaczne nazwy etapów we wspólnym źródle |
| Kiedy zaczyna się siedem dni i co jest warunkiem startu? | Dostępy, dane, termin, sposób akceptacji | Termin i warunki bez automatycznej obietnicy od wysłania formularza |
| Jaki rezultat, liczba iteracji i zakres należą do etapu? | Rzeczywiście dostępny pakiet pracy | Jeden opis wyniku i kryteriów odbioru |
| Kwota, widełki czy wycena indywidualna? | Anonimowe rzeczywiste wyceny porównywalnego zakresu | Tylko zatwierdzona opcja; jednostka, waluta, VAT, zakres i wyłączenia |
| Co dzieje się przy dodatkowym teście lub NO-GO? | Faktyczne zasady rozliczenia i przekazania wyników | Warunki bez domniemania zwrotu pieniędzy |
| Kto ponosi koszt API, integracji i utrzymania? | Dostawcy, wolumen, konta, okres i odpowiedzialność | Rozdzielenie jednorazowej pracy, zużycia usług i dalszej obsługi |

Arkusz materiału wejściowego do decyzji (jeden wiersz na rzeczywiste porównywalne zlecenie): data, anonimowy identyfikator wewnętrzny, zakres, źródła danych, integracje, kryterium odbioru, godziny pracy, kwota i waluta, sposób rozliczenia podatku, wyłączenia, późniejsze utrzymanie, odchylenie od pierwotnego zakresu. Źródła przechowywać prywatnie; żadna wycena nie trafia automatycznie do publicznych danych.

Cena „od” jest dopuszczalna tylko dla faktycznie dostępnego, opisanego zakresu. Do czasu decyzji zostaje obecny opis czynników; nie publikujemy cen konkurentów ani liczbowych założeń audytu jako cennika Protolume.

Weryfikacja wpływu: porównywać rozumienie momentu płatności w badaniu oraz ręcznie ocenioną jakość zapytań według RESEARCH_AND_MEASUREMENT_PLAN.md. Sam wzrost kliknięć nie oznacza lepszych leadów.

## Opcjonalny kalendarz

Decyzja nie została podjęta. Mailto i formularz pozostają kompletnymi drogami kontaktu. Nie dodano martwego linku, embedu, cookies ani automatycznego przekazania danych do zewnętrznej usługi.

Przed decyzją przejrzeć rzeczywiste zapytania: ile osób pyta o termin rozmowy, ile spraw wymaga opisu przed rozmową, ile czasu zajmuje ręczne ustalenie terminu oraz czy Piotr może utrzymać dostępne sloty. To badanie potrzeby, nie założenie, że kalendarz poprawi konwersję.

Warunki aktywacji:

1. Potwierdzony dostawca/konto, czas rozmowy, dostępne terminy, bufor i możliwość obsługi. Etykieta „20-minutowa” dopiero przy rzeczywistym slocie tej długości.
2. Sprawdzony odnośnik, jawna strefa czasowa, podsumowanie przed rezerwacją, potwierdzenie, zmiana/anulowanie. Sprawdzić przejście czasu letniego w wybranej strefie; nie zakładać stałego UTC.
3. DATA_FLOW_MAP.md uzupełniona o dane wymagane przez dostawcę, odbiorców, lokalizację, retencję i przegląd prawny. Nie ustawiać zgód ani podstaw przez domysł.
4. Lekki link przy e-mailu na kontakcie i ewentualnie u partnerów; żadnego automatycznego otwierania aplikacji. Zachować powrót do formularza i opis zewnętrznego dostawcy.
5. Do URL nie kopiować imienia, e-maila, treści, budżetu ani pól formularza. Nie ładować dostawcy przed świadomym kliknięciem.
6. Lokalny test na desktop/mobile/klawiaturze; uzgodniony rzeczywisty test rezerwacji dopiero na przeznaczonym do tego koncie. Ręcznie oceniać odbyte rozmowy, no-show i jakość; nie mierzyć sukcesu samym kliknięciem.

Odrzucenie kalendarza jest poprawnym rozstrzygnięciem UX-024. Brak decyzji nie blokuje pozostałych zmian strony.
