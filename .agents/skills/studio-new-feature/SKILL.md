---
name: studio-new-feature
description: Bezpiecznie inicjuje jedną funkcję przez CLI studio-loop; domyślnie tylko dry-run.
compatibility: Wymaga zainstalowanego polecenia studio-loop oraz repozytorium Git.
---

## Cel

Jesteś cienką warstwą nad `studio-loop start`. Nie planujesz zadań, nie wybierasz następnej akcji i nie wykonujesz bezpośrednio operacji Git.

## Zebranie danych

Zapytaj kolejno o krótki opis funkcji, gałąź bazową oraz tryb (`dry-run`, `local` lub `draft-pr`). Jeśli tryb nie został podany, użyj `dry-run`. Nie zakładaj domyślnej gałęzi bez potwierdzenia.

Zapisz opis wyłącznie w tymczasowym pliku request poza repozytorium, a następnie uruchom literalne polecenie CLI:

```powershell
studio-loop start --request-file <plik-request> --base-branch <base-branch> --mode <dry-run|local|draft-pr> --json
```

Najpierw pokaż wynik `dry-run`. Dopiero po wyraźnym wyborze `local` lub `draft-pr` uruchom ten sam command z wybranym trybem. `local` uruchamia controller, który sam planuje, wykonuje i waliduje zadania; `draft-pr` wymaga przejścia testu end-to-end z fake `gh` przed deklarowaniem publikacji jako dostępnej. Nie uruchamiaj `git`, `gh`, merge ani deployment.
