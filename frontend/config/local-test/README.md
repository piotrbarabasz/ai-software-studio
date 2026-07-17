# Dane wyłącznie lokalne/testowe

Pliki w tym katalogu nie zawierają rzeczywistych danych firmy i nie mogą być użyte do wdrożenia. `.dockerignore` wyklucza cały katalog z kontekstu produkcyjnego.

- `public-legal.config.local-test.json` zasila `npm start` i `npm run build:development`; celowo zawiera rozpoznawalne dane testowe.
- `public-legal.config.valid-fixture.json` jest syntetycznym fixture'em do testu dodatniego walidatora i lokalnej weryfikacji produkcyjnego builda.
