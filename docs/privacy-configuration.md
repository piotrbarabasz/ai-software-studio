# Konfiguracja informacji o prywatności

Ten dokument opisuje techniczną konfigurację publicznej strony polityki prywatności. Nie jest poradą prawną. Przed publikacją właściciel powinien potwierdzić treść względem rzeczywistej działalności, umów i dostawców.

## Jedno źródło danych

Publiczne dane są w `frontend/src/app/core/legal/public-legal.config.ts`. Są celowo oddzielone od tekstów interfejsu oraz od sekretów SMTP.

W repozytorium plik zawiera wyłącznie placeholdery. Produkcyjny Cloud Build pobiera zweryfikowany obiekt JSON z Secret Managera, waliduje go i zapisuje do tego samego modułu tylko w efemerycznym workspace builda. To mechanizm dostarczenia konfiguracji do CI, a nie deklaracja, że publiczne dane są tajne; nie należy wstawiać ich do substitutions ani logów Cloud Build.

Należy uzupełnić wszystkie pola oznaczone `__LEGAL_REQUIRED__`:

- pełną nazwę albo imię i nazwisko administratora;
- adres korespondencyjny administratora;
- kontakt w sprawach danych osobowych;
- cele oraz podstawy przetwarzania, które właściciel zweryfikował;
- okres lub kryteria przechowywania;
- kategorie odbiorców;
- faktycznego dostawcę poczty SMTP;
- informacje o prawach użytkownika;
- datę aktualizacji dokumentu.

`Google Cloud Platform (Cloud Run)` pozostaje w konfiguracji, ponieważ repozytorium i dokumentacja wdrożeniowa potwierdzają tę infrastrukturę. Repozytorium nie potwierdza nazwy dostawcy SMTP, danych administratora ani retencji — tych wartości nie wolno zgadywać.

## Walidacja i build

W katalogu `frontend` uruchom:

```powershell
npm run validate:legal:production
npm run build
```

Walidator sprawdza puste wartości i placeholdery. Jeśli konfiguracja jest niepełna, kończy się błędem oraz wypisuje dokładne ścieżki pól, na przykład `administrator.privacyContact` albo `processing.retention[0]`. Skrypt `npm run build` zawsze wykonuje tę walidację przed buildem produkcyjnym.

Do pracy lokalnej bez danych produkcyjnych użyj:

```powershell
npm run build:development
```

Strona prywatności pokaże wtedy komunikat o konfiguracji demonstracyjnej. Nie jest to wersja do publikacji.

## Cloud Build

Przed produkcyjnym deploymentem utwórz wersjonowany sekret Secret Manager zawierający **wyłącznie poprawny JSON** odpowiadający strukturze `PublicLegalConfiguration`. Nazwę sekretu ustaw jako `_PUBLIC_LEGAL_CONFIG_SECRET` w Cloud Build (domyślnie `aisoftware-studio-public-legal-config`).

Krok `frontend-public-legal-config` przekazuje zawartość jako `PUBLIC_LEGAL_CONFIG_JSON` do skryptu przygotowującego plik builda. Następnie Docker uruchamia `write-production-legal-config.cjs`, który ponownie waliduje wszystkie pola przed `npm run build`. Brak sekretu, niepoprawny JSON, puste wartości i `__LEGAL_REQUIRED__` kończą build z listą wymagających uzupełnienia pól.

Cloud Build service account potrzebuje `Secret Manager Secret Accessor` zarówno dla `SMTP_PASSWORD`, jak i dla konfiguracji prawnej.

## Kontrola przed wdrożeniem

1. Uzupełnij konfigurację publicznymi, potwierdzonymi danymi.
2. Uruchom `npm run validate:legal:production` i `npm run build`.
3. Otwórz prerenderowaną trasę `/polityka-prywatnosci` i sprawdź administratora, zakres danych, sposób przesyłania, odbiorców, dostawców, retencję, prawa, kontakt i datę aktualizacji.
4. Potwierdź, że link przy zgodzie formularza nadal prowadzi do `/polityka-prywatnosci` i nie opisuje zgody marketingowej.
5. Przed wdrożeniem porównaj listę dostawców z rzeczywistą konfiguracją Cloud Run i SMTP. Zmiana dostawcy, odbiorcy lub sposobu obsługi zgłoszeń wymaga aktualizacji konfiguracji oraz ponownej weryfikacji treści.
