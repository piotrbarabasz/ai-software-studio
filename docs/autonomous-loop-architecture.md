# Autonomous Loop — architektura

Autonomous Loop jest lokalnym narzędziem Python `studio-loop`. Jedna prośba użytkownika prowadzi do jednej izolowanej funkcji; controller, a nie model językowy, jest jedynym właścicielem przejść stanu i uprzywilejowanych efektów.

## Granice odpowiedzialności

| Element | Odpowiedzialność | Nie jest źródłem prawdy |
| --- | --- | --- |
| Python controller | stan, kolejność, retry, kontrolowane procesy Git, walidacja i evidence | odpowiedź agenta |
| `tasks.json` | kanoniczna definicja i status zadań | `tasks.md` |
| `tasks.md` | generowany widok dla człowieka | stan runtime |
| Codex role | ograniczona analiza lub zmiana w dozwolonych ścieżkach | harmonogram, Git writes, evidence |
| Hooki i rules | dodatkowe blokady mechaniczne | orkiestracja lub resume |

W danej chwili controller dispatchuje zero albo jedno zadanie zapisujące. Planner, Implementer, Reviewer i Debugger są osobnymi procesami `codex exec`; Reviewer jest read-only. Role otrzymują model i reasoning effort z [`.studio-loop/roles.json`](../.studio-loop/roles.json). Nie traktuj nazw modeli jako obietnicy dostępności: controller klasyfikuje brak modelu lub niepoprawny reasoning effort jako błąd procesu.

## Maszyna stanów

```text
proposed -> initialized -> active -> validating -> reviewing
                              |          |             |
                              +----------+-------------+-> locally_complete
                              |
                              +-> stop_requested -> stopped
                              +-> abort_requested -> aborted
                              +-> reconciliation_required -> blocked
```

Rzeczywiste przejścia są kontraktem w [`specs/007-autonomous-loop/contracts/state-machine.md`](../specs/007-autonomous-loop/contracts/state-machine.md). `dry-run` tworzy tylko projekcję efektów; `local` może utworzyć branch i worktree; obecna implementacja `draft-pr` kończy się na bezpiecznej inicjalizacji i preflight GitHub, bez publikacji. Merge i deployment nie są przejściami tej maszyny.

## Izolacja i bezpieczeństwo

Controller tworzy feature branch oraz osobny worktree. Każdy agent otrzymuje ograniczony sandbox i task package z `allowed_read_paths` oraz `allowed_write_paths`. Po zakończeniu controller ponownie obserwuje Git i diff; twierdzenie modelu o zmienionych plikach nie wystarcza.

`.codex/rules/studio-loop.rules` odmawia LLM-om poleceń Git write, mutacji PR, deploymentów oraz typowych prób ujawnienia sekretów. `.codex/hooks.json` dodaje PreToolUse, PostToolUse i Stop. Hook Stop zwraca `continue: false`, dlatego nie może uruchomić kolejnej Feature Loop; wznowienie należy wyłącznie do controllera. Ochrony są celowo dodatkowe: controller pozostaje bezpieczny również, gdy hooki są wyłączone.

Controllerowe logi i evidence należą do ignorowanego `.automation/state/`. Codex jest uruchamiany z `--json`; controller zachowuje jedynie zsanityzowane, ograniczone evidence, bez reasoning i sekretów. `gh` może być wykrywane dla `draft-pr`, ale obecny CLI nie wykonuje push, merge, close PR ani deploy.
