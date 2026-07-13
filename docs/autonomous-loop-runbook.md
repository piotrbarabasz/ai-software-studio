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
| `draft-pr` | planning/task push, jeden Draft PR, checks i bounded CI repair | ręczna ocena PR; jawne `--allow-mode-upgrade` przy resume z `local` |

Merge, deployment oraz zamknięcie PR są zabronione we wszystkich trybach.

## Nowa funkcja

Przykład tworzy tylko propozycję. Plik request jest tymczasowy i nie trafia do repozytorium:

```powershell
$request = Join-Path $env:TEMP 'studio-loop-example.md'
Set-Content -LiteralPath $request -Encoding utf8 -Value 'Dodaj stronę statusu kontaktu.'
studio-loop start --request-file $request --base 007-autonomous-loop --mode dry-run --json
```

Po ręcznej ocenie proposal uruchom ponownie z `--mode local` albo `--mode draft-pr`.
Drugi wariant wymaga zalogowanego `gh` i publikuje wyłącznie feature branch. Zapisz
`feature_id` zwrócony przez CLI; identyfikuje branch oraz worktree.

## Operacje CLI

```powershell
studio-loop status --feature <feature-id> --json
studio-loop validate-tasks --feature <feature-id> --json
studio-loop render-tasks --feature <feature-id> --check --json
studio-loop status --feature <feature-id> --rebuild --json
studio-loop resume --feature <feature-id> --mode local --json
studio-loop resume --feature <feature-id> --mode draft-pr --json
studio-loop abort --feature <feature-id> --reason 'opis decyzji' --json
```

`status` jest odczytowy; `--rebuild` rekonstruuje obserwowany stan po awarii. `resume`
ponownie sprawdza artefakty, Git, remote i Draft PR przed kontynuacją. Brakujący lub uszkodzony
cache jest zachowywany jako backup i odbudowywany tylko wtedy, gdy trwałe evidence jest
jednoznaczne. Wynik `BLOCKED` wymaga ręcznej reconciliation. `abort` zachowuje branch, worktree,
zmiany, remote, PR i evidence; nie resetuje ich, nie usuwa i nie zamyka PR. Aktualne CLI nie
udostępnia komendy `stop`.

## Retry i recovery

Nie powtarzaj ręcznie poleceń Git dla funkcji. Gdy controller wskaże błąd retryable, zachowaj
jego evidence, uruchom `status --rebuild`, usuń przyczynę poza historią Git i dopiero wtedy użyj
`resume`. Controller rekoncyliuje utraconą odpowiedź po commicie, pushu, utworzeniu PR, pollingu
CI i naprawie Debuggera. Niejednoznaczny SHA, commit, numer PR albo wiele pasujących PR jest
blokerem do ręcznej decyzji, nie sygnałem do force resetu.

## Logi

Controller utrzymuje własne zsanityzowane evidence w `.automation/state/`. Uruchomienia Codexa używają JSONL i nie zapisują reasoning. Dla diagnozy CLI GitHub użyj ręcznie `gh --version` oraz `gh auth status`; nie wklejaj tokenów do ticketów, promptów lub logów. PostToolUse hook może zapisać wyłącznie nazwę narzędzia, exit code, listę plików i czas, gdy controller jawnie poda bezpieczną ścieżkę audytu.

## First real smoke test prerequisites

Rzeczywistego smoke testu nie uruchamiaj, dopóki niezależnie nie potwierdzisz:

- czystego worktree źródłowego;
- zainstalowanego Codex CLI;
- poprawnego logowania Codexa;
- zainstalowanego `gh`;
- poprawnego wyniku `gh auth status`;
- dostępu operatora do remote;
- ręcznie wypchniętego przez użytkownika brancha `007-autonomous-loop`;
- wyniku PASS wszystkich testów lokalnych;
- wyniku PASS GitHub Actions na Windows i Ubuntu;
- braku niezwiązanych zmian;
- jawnej zgody użytkownika na jeden testowy branch i jeden Draft PR.

Spełnienie listy nie jest zgodą na operację GitHub. Prawdziwy smoke test nadal wymaga osobnej,
jawnej zgody na dokładnie jeden testowy branch i jeden Draft PR. Controller nigdy nie wykonuje
approve, merge, close PR ani deploymentu.
