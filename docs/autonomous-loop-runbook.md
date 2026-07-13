# Autonomous Loop — runbook operatora

## Instalacja i kontrola wersji

W PowerShell zainstaluj narzędzie lokalnie, a potem sprawdź dostępne flagi w zainstalowanej wersji:

```powershell
cd tools/studio_loop
py -3.11 -m pip install -e ".[dev]"
studio-loop --help
codex --version
codex exec --help
```

Przy aktualizacji Codexa wykonaj ją ręcznie zgodnie z lokalną instalacją (`codex update`, gdy ta komenda jest dostępna), następnie ponownie sprawdź `codex exec --help` i uruchom testy safeguards. Flagi Codexa mogą się zmieniać; nie kopiuj flag z historii ani ze starych skryptów. Aktualna integracja wymaga obsługiwanych `--sandbox`, `--ephemeral`, `--output-schema`, `--output-last-message` i `--json`.

## Tryby i human gates

| Tryb | Efekt | Bramka człowieka |
| --- | --- | --- |
| `dry-run` | tylko plan efektów | przed `local` |
| `local` | branch, worktree i lokalne artefakty | przed każdą zmianą trybu lub ręczną oceną |
| `draft-pr` | obecnie preflight/inicjalizacja, bez remote write | jawne `--allow-mode-upgrade` przy resume |

Merge, deployment oraz zamknięcie PR są zabronione we wszystkich trybach.

## Nowa funkcja

Przykład tworzy tylko propozycję. Plik request jest tymczasowy i nie trafia do repozytorium:

```powershell
$request = Join-Path $env:TEMP 'studio-loop-example.md'
Set-Content -LiteralPath $request -Encoding utf8 -Value 'Dodaj stronę statusu kontaktu.'
studio-loop start --request-file $request --base 007-autonomous-loop --mode dry-run --json
```

Po ręcznej ocenie proposal uruchom ponownie z `--mode local`. Zapisz `feature_id` zwrócony przez CLI; identyfikuje branch oraz worktree.

## Operacje CLI

```powershell
studio-loop status --feature <feature-id> --json
studio-loop validate-tasks --feature <feature-id> --json
studio-loop render-tasks --feature <feature-id> --check --json
studio-loop status --feature <feature-id> --rebuild --json
studio-loop resume --feature <feature-id> --mode local --json
studio-loop abort --feature <feature-id> --reason 'opis decyzji' --json
```

`status` jest odczytowy; `--rebuild` rekonstruuje obserwowany stan po awarii. `resume` wykonuj dopiero po poprawnym wyniku rekonstrukcji. `abort` zachowuje branch, worktree, zmiany i evidence; nie resetuje ich, nie usuwa i nie zamyka PR.

## Retry i recovery

Nie powtarzaj ręcznie poleceń Git dla funkcji. Gdy controller wskaże błąd retryable, zachowaj jego evidence, uruchom `status --rebuild`, usuń przyczynę poza historią Git i dopiero wtedy użyj `resume`. Niejednoznaczny stan jest blokerem do ręcznej decyzji, nie sygnałem do force resetu.

## Logi

Controller utrzymuje własne zsanityzowane evidence w `.automation/state/`. Uruchomienia Codexa używają JSONL i nie zapisują reasoning. Dla diagnozy CLI GitHub użyj ręcznie `gh --version` oraz `gh auth status`; nie wklejaj tokenów do ticketów, promptów lub logów. PostToolUse hook może zapisać wyłącznie nazwę narzędzia, exit code, listę plików i czas, gdy controller jawnie poda bezpieczną ścieżkę audytu.
