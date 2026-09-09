# Eksperyment: wyszukiwanie po wspólnych słowach

Materiał własny Protolume. To pomiar prostego wyszukiwania, bez generowania odpowiedzi przez AI.

Źródło kodu: 9bbe8d5d9e7e1f539683647deda7751e695301ef.
Pierwotny pomiar: 8 września 2026, 12:58:27 UTC.
Odtworzenie z przypiętych źródeł: 9 września 2026; wyniki identyczne poza datą uruchomienia.

## Odtworzenie

Rozpakuj archiwum. W jego katalogu głównym uruchom:

```text
python run.py --output rerun.json
```

Wymagany Python 3.11 lub nowszy; sprawdzono Python 3.12. Nie trzeba instalować bibliotek, ustawiać kluczy ani łączyć się z siecią. Skrypt korzysta tylko z biblioteki standardowej i plików w paczce.

Porównaj `rerun.json` z `observation.json`. Pole `recordedAt` zmieni się, a `sourceRevision` występuje tylko w opublikowanym raporcie. Pozostałe pola powinny być identyczne. Wynik zawiera oba niepowodzenia; kod wyjścia 0 oznacza zapis obserwacji, nie gotowość produkcyjną.

## Pytanie i hipoteza

Czy wspólne słowa wystarczą, aby wskazać właściwy fragment krótkiego dokumentu także po przeformułowaniu pytania? Test sprawdza najprostszy punkt odniesienia przed rozważeniem wyszukiwania semantycznego.

## Dane i metoda

Trzy fragmenty publicznego dokumentu Protolume opisują symulację, fikcyjny raport i formularz. Autor przygotował 12 pytań: 9 z oczekiwanym fragmentem i 3 spoza zakresu, z oczekiwanym brakiem wyniku. To mały, autorski zestaw, bez niezależnego podziału na trening/test.

Algorytm normalizuje wielkość liter i znaki diakrytyczne, usuwa słowa z jawnej listy oraz sprowadza wybrane początki wyrazów do wspólnej postaci. Fragment musi pokryć co najmniej 40% słów zapytania po normalizacji. Ranking wykorzystuje liczbę wspólnych słów; remis rozstrzyga identyfikator fragmentu. Zwracane są maksymalnie 2 fragmenty.

Przypadek jest zgodny z oczekiwaniem, gdy pierwszy identyfikator jest równy oczekiwanemu albo oba wyniki są puste. Ta mieszana metryka nie jest miarą jakości odpowiedzi AI ani Recall@k.

## Obserwacja

Zgodne: 10 z 12 przypadków. W pytaniach z oczekiwanym źródłem: 7 z 9. W pytaniach spoza zakresu: 3 z 3 poprawne braki wyniku.

Nie znaleziono źródła dla dwóch pytań:

- „Czy te odpowiedzi generuje sztuczna inteligencja?” — oczekiwano `rag-source-simulation`.
- „Czy pokazujecie prawdziwy sukces przedsiębiorstwa?” — oczekiwano `rag-source-report`.

Pełne pytania, oczekiwania, wyniki, wspólne słowa i sumy kontrolne korpusu/zestawu są w `observation.json`.

## Koszt, wniosek i ograniczenia

Wywołania modelu: 0. Koszt infrastruktury, czas wykonania i koszt pracy nie były mierzone. Brak wywołań modelu nie oznacza zerowego całkowitego kosztu.

W tym zestawie dopasowanie słów nie wystarczyło dla dwóch parafraz. Następny eksperyment powinien porównać je z wyszukiwaniem semantycznym na osobnym zestawie pytań i jawnej metryce. Takie porównanie nie zostało tu wykonane. Nie sprawdzono generowania, rozpoznawania sprzeczności, odporności na instrukcje w dokumentach ani jakości wdrożenia u klienta.
