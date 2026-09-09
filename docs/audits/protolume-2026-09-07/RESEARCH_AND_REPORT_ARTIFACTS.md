# UX-019/021 — odtwarzalna obserwacja i rzeczywisty PDF

## R&D

Strona /rd pokazuje wynik istniejącego testu `lexical-baseline-v1`, z kodu 9bbe8d5d9e7e1f539683647deda7751e695301ef. Pierwotny pomiar z 8 września 2026 odtworzono 9 września z przypiętych źródeł w odizolowanym katalogu, używając wyłącznie standardowej biblioteki Pythona. Wszystkie pola wyniku poza czasem uruchomienia były identyczne.

Z 12 autorskich pytań 10 odpowiada oczekiwaniu: 7/9 wskazań źródła i 3/3 pustych wyników poza zakresem. Oba błędy parafrazy pozostają widoczne. To mały, autorski zestaw używany również do opracowania algorytmu; nie jest niezależną oceną jakości RAG. Nie wywołano modelu ani nie zmierzono czasu/kosztu infrastruktury. Porównanie z wyszukiwaniem semantycznym pozostaje następnym eksperymentem.

Widok liczy wyniki i listę błędów bezpośrednio z JSON. ZIP zawiera pytania, korpus, oryginalny kod i prosty launcher. README opisuje próg 40%, normalizację, ranking, metrykę, ograniczenia i odtworzenie. Weryfikator buildu sprawdza kompletność paczki, hashe i zgodność liczników/identyfikatorów z wynikami. Pozostałe kierunki R&D są oznaczone jako plany; usunięto niepoparte pomiarem oznaczenie „Zweryfikowane wewnętrznie”.

Regeneracja po npm ci, z katalogu głównego:

```powershell
backend/.venv/Scripts/python.exe frontend/scripts/build_research_artifact.py
```

Paczka działa po rozpakowaniu przez `python run.py --output rerun.json` (Python 3.11+, sprawdzono 3.12). Pole sourceRevision jest metadanymi publikacji, nie częścią nowego wyniku skryptu. Ten pomiar jest odrębną notatką R&D; rejestr czterech materiałów landingów/home/studia nie został rozszerzony o fikcyjne wdrożenie.

## Raport WWW i PDF

Jedno źródło: `frontend/src/app/core/content/demo-report.pl.ts`. Strona importuje ten obiekt, a generator PDF odczytuje go przez TypeScript i izolowany kontekst Node bez aplikacji/konfiguracji produkcyjnej. Raport nie jest wynikiem wykonania systemu. Wszystkie trzy scenariusze mają ten sam status „ścieżka opisana w przykładzie” z definicją; licznik pochodzi z tablicy. Nie występuje „2/3 potwierdzono”.

WWW ma jedną rekomendację przy hero, warunki pod natywnym rozwinięciem, spis treści i scenariusze przed rejestrem ryzyk. PDF jest osobnym plikiem do pobrania; druk systemowy pozostaje dostępny. Metadane CreativeWork korzystają z aktualnego tytułu i informacji o fikcyjnym charakterze. Wspólny rekord demo-report wskazuje wersję decision-report-v2.

PDF: cztery świadomie rozplanowane strony A4, polski tekst możliwy do zaznaczenia, data/wersja, fikcyjny charakter i numeracja na każdej stronie. Użyto ReportLab 5.0.1, lokalnej biblioteki pypdf 6.18.0 i renderera PyMuPDF 1.28.2; Poppler nie był dostępny. Przejrzano wszystkie cztery PNG po końcowej regeneracji. DejaVu Sans jest dołączony do narzędzi generatora z oryginalną licencją. Pierwsza próba z Vera ujawniła brak polskich znaków i nie jest plikiem publikowanym.

Zależności PDF są lokalnymi narzędziami autora, nie zależnościami API ani produkcyjnego obrazu frontendu. Powtarzalny workflow:

```powershell
# Jednorazowo: osobne środowisko narzędzi, poza backendem produkcyjnym.
backend/.venv/Scripts/python.exe -m venv tmp/pdfs/.venv
tmp/pdfs/.venv/Scripts/python.exe -m pip install reportlab==5.0.1 pypdf==6.18.0 pymupdf==1.28.2

tmp/pdfs/.venv/Scripts/python.exe frontend/scripts/build_demo_report.py
tmp/pdfs/.venv/Scripts/python.exe frontend/scripts/check_demo_report.py
# Następnie obejrzeć wszystkie tmp/pdfs/report-page-*.png.
```

Generator zapisuje plik do output/pdf oraz kopię pod /assets/evidence. Automatyczna kontrola porównuje wszystkie merytoryczne pola źródła z tekstem PDF i wymaga czterech stron. Build Node/Docker nie potrzebuje Pythona do ponownego generowania: sprawdza zgodność gotowego PDF z treścią, rendererem i fontami przez manifest SHA-256. Zmiana treści lub generatora wymaga regeneracji i ponownego przeglądu wizualnego, zamiast publikowania starego pliku.

Hashe dowodzą zgodności plików, nie wykonania scenariuszy ani przeprowadzenia przez automat przeglądu wizualnego. Materiały są statyczne i nie wprowadzają modelu, embedu, poczty ani analytics.
