# Publiczna konfiguracja danych prawnych

Ten dokument opisuje mechanizm techniczny, nie stanowi porady prawnej. Właściciel musi zatwierdzić dane i treść przed publikacją. Repozytorium nie zawiera i nie zgaduje rzeczywistych danych administratora.

## Dlaczego konfiguracja jest potrzebna podczas builda

Polityka prywatności jest prerenderowana do statycznego HTML. Z tego powodu konfiguracja musi zostać dostarczona podczas produkcyjnego builda frontendu. Zmienna lub sekret podpięty dopiero do kontenera Cloud Run nie zmieni HTML znajdującego się już w obrazie.

Jedynym wejściem produkcyjnym dla danych administratora i treści prawnych jest obiekt JSON wskazany przez `PUBLIC_LEGAL_CONFIG_PATH`; publiczny e-mail privacy jest osobnym, jawnym wejściem `PUBLIC_PRIVACY_EMAIL`. W Cloud Build zawartość sekretu `_PUBLIC_LEGAL_CONFIG_SECRET` jest walidowana, zapisywana do efemerycznego pliku i przekazywana do Docker BuildKit jako build secret. Plik nie jest kopiowany do kontekstu ani warstw obrazu. Generator tworzy tymczasowy, ignorowany przez Git moduł `public-legal.config.generated.ts`; komponent polityki łączy go wyłącznie ze zweryfikowanym `PUBLIC_PRIVACY_EMAIL`.

Konfiguracja lokalna jest oddzielona w `frontend/config/local-test/public-legal.config.local-test.json`. Nazwa i zawartość jednoznacznie oznaczają ją jako testową, a `.dockerignore` wyklucza cały katalog `config/local-test` z produkcyjnego builda.

## Dokładny kontrakt JSON

Sekret ma zawierać wyłącznie jeden obiekt JSON, bez wrappera, komentarzy i kodowania base64. Poniższy JSON Schema opisuje kontrakt 1:1:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "additionalProperties": false,
  "required": ["administrator", "processing", "updatedAt"],
  "properties": {
    "administrator": {
      "type": "object",
      "additionalProperties": false,
      "required": ["name", "correspondenceAddress"],
      "properties": {
        "name": { "type": "string", "minLength": 1 },
        "correspondenceAddress": { "type": "string", "minLength": 1 }
      }
    },
    "processing": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "purposes",
        "legalBases",
        "retention",
        "recipients",
        "infrastructureProviders",
        "emailProviders",
        "dataSubjectRights"
      ],
      "properties": {
        "purposes": { "$ref": "#/$defs/nonEmptyStringList" },
        "legalBases": { "$ref": "#/$defs/nonEmptyStringList" },
        "retention": { "$ref": "#/$defs/nonEmptyStringList" },
        "recipients": { "$ref": "#/$defs/nonEmptyStringList" },
        "infrastructureProviders": { "$ref": "#/$defs/nonEmptyStringList" },
        "emailProviders": { "$ref": "#/$defs/nonEmptyStringList" },
        "dataSubjectRights": { "$ref": "#/$defs/nonEmptyStringList" }
      }
    },
    "updatedAt": {
      "type": "string",
      "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"
    }
  },
  "$defs": {
    "nonEmptyStringList": {
      "type": "array",
      "minItems": 1,
      "items": { "type": "string", "minLength": 1 }
    }
  }
}
```

Znaczenie pól:

- `administrator.name`: pełna, zatwierdzona nazwa administratora albo imię i nazwisko; sama marka `Protolume` jest odrzucana;
- `administrator.correspondenceAddress`: zatwierdzony adres korespondencyjny;
- `PUBLIC_PRIVACY_EMAIL`: publiczny adres do spraw danych osobowych, walidowany osobno od sekretu JSON i wstrzykiwany podczas builda;
- `processing.*`: zatwierdzone cele, podstawy, retencja, odbiorcy, dostawcy infrastruktury i poczty oraz informacje o prawach;
- `updatedAt`: data aktualizacji w formacie `RRRR-MM-DD`.

Każdy tekst jest przycinany i nie może być pusty. Produkcja odrzuca między innymi `Testowa`, `WPISZ`, `example`, `sample`, `dummy`, `fixture`, `configured`, `placeholder`, `TODO`, `TBD`, `uzupełnij`, `LEGAL_REQUIRED`, `**LEGAL_REQUIRED**`, `__LEGAL_REQUIRED__`, znany testowy e-mail oraz wartości w nawiasach ostrych. Nie ma fallbacku.

## Walidacja lokalna

Konfiguracja lokalna/testowa:

```powershell
cd frontend
npm run build:development
```

Produkcyjna walidacja zatwierdzonego pliku bez budowania:

```powershell
cd frontend
$env:PUBLIC_LEGAL_CONFIG_PATH = (Resolve-Path "C:\bezpieczna-lokalizacja\public-legal.json").Path
npm run validate:legal:production
Remove-Item Env:PUBLIC_LEGAL_CONFIG_PATH
```

Pełny produkcyjny build i kontrola prerenderowanego artefaktu:

```powershell
$env:PUBLIC_LEGAL_CONFIG_PATH = (Resolve-Path "C:\bezpieczna-lokalizacja\public-legal.json").Path
$env:API_URL = $env:BACKEND_URL
$env:PUBLIC_SITE_URL = "https://protolume.pl"
$env:PUBLIC_SITE_INDEXING = "false"
$env:PUBLIC_SALES_EMAIL = "kontakt@protolume.pl"
$env:PUBLIC_PRIVACY_EMAIL = "kontakt@protolume.pl"
npm run build
npm run validate:artifact:production
Remove-Item Env:PUBLIC_LEGAL_CONFIG_PATH
Remove-Item Env:API_URL
Remove-Item Env:PUBLIC_SITE_URL
Remove-Item Env:PUBLIC_SITE_INDEXING
Remove-Item Env:PUBLIC_SALES_EMAIL
Remove-Item Env:PUBLIC_PRIVACY_EMAIL
```

Build sprawdza ponownie JSON, generuje moduł, prerenderuje stronę, skanuje cały artefakt pod kątem znanych zabronionych wartości i potwierdza, że każda wartość z JSON znajduje się w `polityka-prywatnosci/index.html`. Tworzy też marker `.legal-config-validated`; entrypoint Nginx wymaga markera i ponownie skanuje politykę przy starcie kontenera.

## Cloud Build i Secret Manager

Wymagany przepływ:

1. `_PUBLIC_LEGAL_CONFIG_SECRET` wskazuje nazwę sekretu, domyślnie `aisoftware-studio-public-legal-config`.
2. Konto usługi wykonujące Cloud Build ma rolę `roles/secretmanager.secretAccessor` do tego sekretu.
3. Krok `frontend-public-legal-config` pobiera wersję `latest` jako `PUBLIC_LEGAL_CONFIG_JSON` i waliduje ją przed uruchomieniem Dockera.
4. Docker otrzymuje efemeryczny plik przez `--secret id=public_legal_config`; brak sekretu zatrzymuje build.
5. Cloud Run otrzymuje dopiero gotowy, sprawdzony obraz. Frontend nie potrzebuje runtime bindingu tego sekretu.

Publiczne dane prawne nie są danymi tajnymi po publikacji, ale Secret Manager zapobiega trzymaniu danych wdrożeniowych w repozytorium i substitutions/logach.

## Kontrola po wdrożeniu

Po późniejszym, autoryzowanym wdrożeniu należy otworzyć `/polityka-prywatnosci`, sprawdzić wszystkie pola względem zatwierdzonego JSON i upewnić się w Cloud Build logs, że przeszły kroki walidacji artefaktu. Zmiana wersji sekretu sama nie aktualizuje działającej strony: konieczny jest nowy build obrazu i nowa rewizja Cloud Run.
