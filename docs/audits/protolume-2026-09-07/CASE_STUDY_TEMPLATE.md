# UX-027 — szablon i proces prawdziwego case study

Status szablonu: wewnętrzny, nie do publikacji. Nie opisuje klienta ani wykonanej realizacji. Wszystkie pola należy uzupełnić na podstawie istniejącego projektu; brak danych oznacza otwarte kryterium, a nie zgodę na estymację.

## Karta materiału

| Pole | Wymagane źródło |
| --- | --- |
| Identyfikator, właściciel materiału, data i wersja | Prywatny rejestr projektu |
| Nazwa klienta lub zatwierdzony opis anonimowy | Decyzja klienta; bez kombinacji szczegółów pozwalającej go rozpoznać |
| Problem i sytuacja przed zmianą | Opis procesu oraz próbka lub zapis pomiaru |
| Zakres Protolume | Wykonane elementy, integracje i decyzje; osobno wkład klienta i innych dostawców |
| Użytkownicy i rola człowieka | Kto sprawdza, zatwierdza, obsługuje wyjątki i utrzymuje system |
| Wersja rozwiązania i środowisko | Repozytorium/release, test czy produkcja, okres używania |
| Punkt wyjścia i wynik po zmianie | Porównywalna metoda, populacja, okres, wolumen, mianownik i źródło każdej liczby |
| Jakość i niepowodzenia | Błędy, wyjątki, próby odrzucone, ręczne poprawki i brakujące dane |
| Czas | Osobno aktywna praca operatora, czas oczekiwania i całkowity czas procesu |
| Koszt | Jednorazowa realizacja, zużycie usług, utrzymanie; okres, waluta i zakres kosztu |
| Ograniczenia wniosku | Inne zmiany, sezonowość, różnice prób, niewystarczający pomiar i niezmierzone skutki |
| Materiał wizualny | Rzeczywisty ekran/wykres z opisem tekstowym, wersja, data, redakcja danych i źródło |
| Cytat | Dokładny tekst, autor/rola oraz zgoda na brzmienie i przypisanie |
| Zgoda na publikację | Prywatna referencja obejmująca nazwę, logo, tekst, liczby, cytat, obrazy i kanały publikacji |

## Karta pojedynczej metryki

Wymagane: nazwa i znaczenie, wartość, jednostka, kierunek poprawy, okres przed/po, liczebność obu prób, mianownik, metoda zbierania, kryteria włączenia/wyłączenia, źródło danych, właściciel, zakres niepewności i ograniczenia. Przy procencie podać licznik i mianownik; przy czasie wskazać średnią/medianę/inny agregat. Oszacowania oznaczać jako oszacowania i opisać sposób ich wyliczenia. Nie wyliczać ROI z niepotwierdzonego kosztu pracy.

Nie porównywać czasu ręcznej pracy z czasem kalendarzowym automatyzacji. Nie pomijać ręcznych poprawek ani przypadków, w których system nie zadziałał. Brak pomiaru skuteczności opisujemy wprost.

## Układ przyszłej publikacji

1. Problem, konkretny zakres wykonania i wynik wraz ze źródłem oraz okresem.
2. Rzeczywisty ekran z opisem działania i roli człowieka.
3. Proces przed i po, pomiar, metoda oraz wyjątki.
4. Wkład Protolume, użyte integracje, granice rozwiązania i koszt.
5. Zatwierdzony cytat, jeśli istnieje; następny krok właściwy dla podobnego procesu.

Na mobile wynik i kontekst są przed szczegółami, a wykres ma równoważny opis tekstowy. Nie tworzyć strony realizacji, pustej sekcji logo ani odnośnika „zobacz wdrożenie”, dopóki materiał jest niekompletny.

## Przegląd i publikacja

1. Właściciel projektu zbiera oryginalny materiał prywatnie i sprawdza spójność wartości z raportem.
2. Osoba techniczna potwierdza zakres i wersję; osoba odpowiedzialna za dane sprawdza redakcję, możliwość identyfikacji i zakres zgody.
3. Klient zatwierdza dokładną wersję do publikacji oraz użyte cytaty i obrazy. Zgoda na współpracę nie jest automatycznie zgodą na publikację.
4. Dopiero wtedy uzupełnić rzeczywisty rekord `client-deployment` w rejestrze dowodów z `rightsReference`, datą, źródłami i ograniczeniem. Obecny gate sprawdza kompletność metadanych, nie prawdziwość danych ani ważność zgody.
5. Przejrzeć desktop/mobile, kontrast, alternatywy tekstowe, linki i pobrania. Nowy URL wymaga pełnej samodzielnej treści i kontroli SEO/produkcji.
6. Zapisać opublikowaną wersję i datę przeglądu; po zmianie materiału ponownie potwierdzić zakres zgody i źródeł.

W tym zadaniu nie zebrano danych klienta, nie uzyskano zgód i nie wysłano prośby o referencję. Fikcyjny raport oraz projekty własne zachowują dotychczasową klasyfikację.
