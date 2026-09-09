# Protolume — mapa kodu i instrukcja weryfikacji

Projekt własny Protolume. Przegląd publicznych źródeł: 2026-09-09.
Repozytorium źródłowe: piotrbarabasz/ai-software-studio.
Wersja: `0d38ef8037ce28a0ae4f8a3f3f3df4af4a8524c5`, scalona w PR #56.

## Co zawiera paczka

Paczka zawiera kod API FastAPI, zależności i wybrane testy, które można uruchomić bez kont dostawców. Dołączone pliki formularza Angular, Dockerfile, CI i runbook pokazują kontekst większego projektu. Archiwum nie zawiera kompletnej aplikacji frontendowej ani całego środowiska CI.

Formularz przekazuje dane do API. API waliduje dane, stosuje limit żądań i przekazuje zapytanie do warstwy dostarczenia. Testy używają adapterów testowych i atrap SMTP: sprawdzają sukces, błąd dostarczenia i brak treści zgłoszenia w logach. Nie wysyłają wiadomości i nie potwierdzają działania produkcyjnej poczty. Konfiguracja CI jest kodem, nie raportem udanego przebiegu. Ten projekt własny nie dokumentuje realizacji klienta ani wyników biznesowych.

## Mapa plików w archiwum

| Obszar | Plik |
| --- | --- |
| Formularz | `frontend/src/app/features/contact/contact-form.component.ts` |
| API | `backend/app/api/contact.py` |
| Model danych | `backend/app/schemas/contact.py` |
| Przyjęcie i ograniczanie zapytań | `backend/app/services/contact_intake.py` |
| Dostarczenie | `backend/app/services/contact_delivery.py` |
| Testy API | `backend/tests/contract/test_contact_contract.py` |
| Testy dostarczenia | `backend/tests/integration/test_contact_delivery.py` |
| Obraz API | `backend/Dockerfile` |
| Definicja CI | `infra/gcp/cloudbuild.pr-checks.yaml` |
| Utrzymanie | `docs/gcp-runbook.md` |
| Fragment rzeczywistego PR #56 | `pr-56-hydration.patch` |

Patch zawiera zmianę konfiguracji hydration z faktycznego porównania PR #56 z pierwszym rodzicem commita scalającego. To wybrany fragment, nie cały PR ani dowód niezależnego code review.

## Uruchom testy API bez kont dostawców

Wymagania: Python 3.12, połączenie do pobrania zależności i nowy katalog roboczy. Pobierz `protolume-api.zip` z sekcji przykładu technicznego. Poniżej PowerShell na Windows; na Linux/macOS użyj odpowiedniego rozpakowania i interpretera `.venv/bin/python`.

```powershell
Expand-Archive -LiteralPath .\protolume-api.zip -DestinationPath .\protolume-api
cd protolume-api/backend
py -3.12 -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements-dev.lock
.venv/Scripts/python.exe -m pip install --no-deps --no-build-isolation -e .
.venv/Scripts/python.exe -m pytest tests/contract/test_contact_contract.py tests/integration/test_contact_delivery.py
```

Ta komenda uruchamia testy, nie serwer produkcyjny. Nie wymaga prawdziwego hasła SMTP. Wynik oceń z raportu pytest; nie zakładaj sukcesu na podstawie samej instrukcji. Do uruchomienia rzeczywistej obsługi wiadomości potrzebna jest osobna konfiguracja oraz test dostarczenia.

Pliki CI i runbook są materiałem do przeglądu w kontekście pełnego projektu. Nie uruchamiaj z paczki wdrożenia: nie zawiera wszystkich jego zależności, konfiguracji ani uprawnień.

## Sprawdź zgodność źródeł

W sekcji „Wersja źródeł i zakres przykładu” dostępny jest manifest z wersją, pochodzeniem i sumami SHA-256 paczki oraz pojedynczych plików. Podglądy plików są kopiami bajtów z przypiętej wersji. Sumę pobranego archiwum można porównać poleceniem `Get-FileHash -Algorithm SHA256 .\protolume-api.zip`.

## Co uzgadniamy przy przekazaniu modułu

Zakres kodu i praw, kryteria odbioru, zależności, sposób uruchomienia, zmienne konfiguracyjne bez sekretów, wyniki testów, instrukcje publikacji i wycofania oraz osobę odpowiedzialną za utrzymanie. Są to punkty do uzgodnienia w konkretnym projekcie; przykład nie deklaruje zawartej umowy, gwarancji wsparcia ani przeniesienia praw.
