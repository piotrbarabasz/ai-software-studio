---
name: studio-status
description: Odczytuje status funkcji przez CLI studio-loop bez zmiany brancha, worktree lub zadań.
compatibility: Wymaga zainstalowanego polecenia studio-loop oraz istniejącego feature ID.
---

## Cel

Jest to skill read-only. Zbierz `feature ID` i uruchom wyłącznie:

```powershell
studio-loop status --feature <feature-id> --json
```

Gdy operator wyraźnie prosi o rekonstrukcję po przerwaniu procesu, użyj `--rebuild`. Nie uruchamiaj `resume`, `abort`, Git, GitHub CLI, merge ani deployment.
