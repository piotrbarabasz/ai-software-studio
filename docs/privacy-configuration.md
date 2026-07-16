# Konfiguracja informacji o prywatności

Ten dokument opisuje techniczną konfigurację publicznej strony polityki prywatności. Nie jest poradą prawną. Przed publikacją właściciel powinien potwierdzić treść względem rzeczywistej działalności, umów i dostawców.

## Jedno źródło danych

Publiczne dane są w `frontend/src/app/core/legal/public-legal.config.ts`. Są celowo oddzielone od tekstów interfejsu oraz od sekretów SMTP.

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

## Kontrola przed wdrożeniem

1. Uzupełnij konfigurację publicznymi, potwierdzonymi danymi.
2. Uruchom `npm run validate:legal:production` i `npm run build`.
3. Otwórz prerenderowaną trasę `/polityka-prywatnosci` i sprawdź administratora, zakres danych, sposób przesyłania, odbiorców, dostawców, retencję, prawa, kontakt i datę aktualizacji.
4. Potwierdź, że link przy zgodzie formularza nadal prowadzi do `/polityka-prywatnosci` i nie opisuje zgody marketingowej.
5. Przed wdrożeniem porównaj listę dostawców z rzeczywistą konfiguracją Cloud Run i SMTP. Zmiana dostawcy, odbiorcy lub sposobu obsługi zgłoszeń wymaga aktualizacji konfiguracji oraz ponownej weryfikacji treści.
