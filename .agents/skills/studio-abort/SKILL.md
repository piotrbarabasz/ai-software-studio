---
name: studio-abort
description: Bezpiecznie przerywa funkcję przez CLI studio-loop, zachowując branch, worktree i zmiany.
compatibility: Wymaga zainstalowanego polecenia studio-loop, feature ID i uzasadnienia abortu.
---

## Cel

Zbierz `feature ID` oraz niepuste uzasadnienie. Potwierdź, że abort nie usuwa brancha ani worktree, nie resetuje zmian i nie zamyka PR.

Następnie uruchom tylko:

```powershell
studio-loop abort --feature <feature-id> --reason <powod> --json
```

Nie wykonuj `git clean`, resetu, usuwania gałęzi, `gh pr close`, merge ani deployment.
