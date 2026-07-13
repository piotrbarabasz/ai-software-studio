# Autonomous Loop — troubleshooting

## Codex odrzuca konfigurację, rule lub hook

Sprawdź lokalną wersję i składnię, a następnie przeprowadź test policy bez uruchamiania modelu:

```powershell
codex --version
codex execpolicy check --rules .codex/rules/studio-loop.rules git commit -m test
```

Projektowe `.codex/config.toml`, rules oraz hooki działają tylko w zaufanym repozytorium. Hooki wymagają jednorazowego review/trust przez Codex; controller nie zależy od ich dostępności. Na Windows hooki startują `py -3` przez `powershell.exe` i wyznaczają root przez `git rev-parse --show-toplevel`, więc ścieżki ze spacjami pozostają pojedynczym argumentem.

## `studio-loop` lub Python nie jest dostępny

Uruchom instalację z [runbooka](autonomous-loop-runbook.md#instalacja-i-kontrola-wersji). Jeśli używasz innego interpretera Python 3.11+, zamień tylko prefiks `py -3.11`; polecenia `studio-loop` pozostają takie same.

## Brudny worktree lub konflikt rekonstrukcji

`local` celowo odmawia inicjalizacji z brudnego worktree źródłowego. Nie używaj `git reset --hard`, `git clean`, rebase ani usuwania brancha. Zabezpiecz zmiany w sposób zatwierdzony przez właściciela repozytorium, a następnie powtórz dry-run. Przy przerwanym runie użyj `studio-loop status --feature <feature-id> --rebuild --json`; stan `blocked` wymaga ręcznego rozstrzygnięcia.

## Codex model, sandbox albo reasoning effort nie działa

Źródłem konfiguracji ról jest `.studio-loop/roles.json`. Sprawdź `codex exec --help` po aktualizacji Codexa i nie zamieniaj flag na podstawie pamięci. Nie włączaj Ultra ani równoległych zapisujących agentów: [`.codex/config.toml`](../.codex/config.toml) utrzymuje `max_threads = 1` i `max_depth = 1`.

## GitHub i deployment

`draft-pr` może wymagać dostępnego oraz zalogowanego `gh`, ale aktualny controller nie wykonuje remote write. `gh pr merge`, `gh pr close`, `gcloud run deploy` i `gcloud builds submit` są blokowane dla LLM. Merge i deployment pozostają osobnymi, ręcznymi procesami poza Autonomous Loop.

## Sekrety i zbyt szczegółowe logi

Nie uruchamiaj `env`, `printenv`, odczytu `.env` ani plików credentials z roli Codexa. Rules i hooki blokują typowe warianty, a controller redaguje znane wartości przed zapisaniem evidence. Jeśli sekret mógł trafić do terminala, przerwij run przez `studio-loop abort`, wykonaj obowiązującą procedurę rotacji i nie kopiuj wartości do zgłoszenia.
