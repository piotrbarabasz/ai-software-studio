---
name: studio-resume
description: Odtwarza obserwowany stan funkcji i wznawia ją wyłącznie przez CLI studio-loop.
compatibility: Wymaga zainstalowanego polecenia studio-loop oraz istniejącego feature ID.
---

## Cel

Najpierw zbierz `feature ID` i ewentualny tryb. Nie odtwarzaj stanu z rozmowy ani z `tasks.md`.

## Wykonanie

Uruchom rekonstrukcję i przedstaw jej wynik przed wznowieniem:

```powershell
studio-loop status --feature <feature-id> --rebuild --json
```

Jeżeli wynik nie jest zablokowany i operator potwierdzi kontynuację, uruchom:

```powershell
studio-loop resume --feature <feature-id> --mode <local|draft-pr> --json
```

Przy zmianie do `draft-pr` wymagaj jawnego `--allow-mode-upgrade`. Nie próbuj naprawiać konfliktów przez Git ani nie uruchamiaj automatycznej kontynuacji.
