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
CREATED -> PREFLIGHT -> WORKTREE_CREATED -> SPECIFICATION -> PLANNING
  -> TASK_GENERATION -> SPEC_VALIDATION -> PUSHING -> DRAFT_PR_CREATED
  -> TASK_SELECTED -> IMPLEMENTING -> VALIDATING -> REVIEWING -> COMMITTING
  -> PUSHING -> CI_PENDING -> (TASK_SELECTED | REPAIRING | FEATURE_VALIDATION)
  -> CI_PENDING -> READY_FOR_REVIEW

Każda aktywna granica może przejść do BLOCKED albo ABORTED.
```

Rzeczywiste przejścia są egzekwowane w `state_machine.py`. `dry-run` tworzy tylko projekcję
efektów; `local` może utworzyć branch, worktree i lokalne commity; `draft-pr` dodaje kontrolowane
pushe feature brancha, jeden Draft PR, exact-SHA checks i bounded CI repair. Stan
`READY_FOR_REVIEW` oznacza gotowość controllera do ręcznej oceny; nie konwertuje PR z Draft.
Merge i deployment nie są przejściami tej maszyny.

## Izolacja i bezpieczeństwo

Controller tworzy feature branch oraz osobny worktree. Każdy agent otrzymuje ograniczony sandbox i task package z `allowed_read_paths` oraz `allowed_write_paths`. Bezpośrednio przed każdym wywołaniem Implementera lub Debuggera controller normalizuje wszystkie dozwolone ścieżki zapisu, odrzuca ścieżki absolutne i traversal, sprawdza istniejące elementy oraz rozwiązuje symlinki i Windows reparse points względem aktywnego worktree. Naruszenie zapisuje kontrolowany failure package i kończy run jako `BLOCKED` z bramką dla człowieka, bez uruchomienia roli i bez automatycznego cofania lub usuwania zmian. Po zakończeniu roli controller nadal obserwuje Git i diff; twierdzenie modelu o zmienionych plikach nie wystarcza.

Kontrola ścieżki i późniejsze otwarcie pliku nie są jedną atomową operacją. Pre-execution guard zmniejsza okno TOCTOU, ale go nie eliminuje: stan systemu plików może zmienić się po sprawdzeniu. Dlatego sandbox, PreToolUse oraz post-execution `DiffGuard` pozostają niezależnymi warstwami; wykrytego naruszenia controller nie próbuje naprawiać kosztem możliwej pracy użytkownika.

`.codex/rules/studio-loop.rules` odmawia LLM-om poleceń Git write, mutacji PR, deploymentów oraz typowych prób ujawnienia sekretów. `.codex/hooks.json` dodaje PreToolUse, PostToolUse i Stop. PreToolUse rozumie rzeczywiste payloady Codexa: `apply_patch` (`tool_input.command`), `Edit` (`file_path`, `old_string`, `new_string`, `replace_all`) i `Write` (`file_path`, `content`). Hook rozwiązuje docelową ścieżkę względem `cwd`, blokuje wyjście poza worktree, taskowe `allowed_write_paths`, `.git`, stan runtime, pliki kontrolne i potencjalne sekrety; nieznany format operacji zapisującej jest odrzucany. Hook Stop zwraca `continue: false`, dlatego nie może uruchomić kolejnej Feature Loop; wznowienie należy wyłącznie do controllera. Ochrony są celowo dodatkowe: controller pozostaje bezpieczny również, gdy hooki są wyłączone.

Controllerowe logi i evidence należą do ignorowanego `.automation/state/`. Codex jest uruchamiany z `--json`; controller zachowuje jedynie zsanityzowane, ograniczone evidence, bez reasoning i sekretów. Po timeout proces i jego potomkowie są kończeni mechanizmem właściwym dla platformy, a częściowy i końcowy stdout/stderr są łączone bez powielania wspólnego prefiksu i ograniczane limitem retencji. Każda obserwacja i mutacja Git najpierw odrzuca lokalną konfigurację zdolną uruchomić proces (`filter`, fsmonitor, sshCommand, external diff/merge driver i alias); kontrolowane mutacje używają argv bez shella, ograniczonego środowiska i pustego `core.hooksPath`. Hook lub filter repozytorium nie może więc zamienić lokalnego commita, checkoutu worktree lub pushu w niejawny efekt. Transport `gh` udostępnia wyłącznie wykrywanie/reconciliation Draft PR, edycję zarządzanej sekcji opisu i obserwację checks; nie ma ścieżki merge, approve, close PR ani deploy.
