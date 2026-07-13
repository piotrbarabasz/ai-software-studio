# Autonomous Loop: zasady operacyjne

Pythonowy `studio-loop` controller jest jedynym orkiestratorem Autonomous Loop. To on wyznacza następne działanie, uruchamia role, waliduje ich wynik i zapisuje stan.

- Agenci Codexa nie sterują stanem, harmonogramem ani kontynuacją pracy. Rozmowa, reasoning, hooki i Spec Kit nie są runtime state.
- `tasks.json` jest źródłem prawdy o zadaniach; `tasks.md` jest wyłącznie generowanym widokiem.
- W danej chwili może zapisywać tylko jeden wykonawca. Planner i Reviewer są read-only; Reviewer nie może wprowadzać zmian.
- Agenci nie wykonują Git writes: nie wolno im wykonywać `git add`, `commit`, `push`, `merge`, `rebase`, resetów, clean ani destrukcyjnych zmian gałęzi. Dozwolone, kontrolowane operacje Git wykonuje wyłącznie proces nadrzędny Python controller.
- Evidence testów pochodzi z obserwacji i uruchomień controllera, nie z deklaracji agenta.
- Merge i deployment są zabronione. Draft PR, jeśli zostanie kiedyś obsłużony przez controller, pozostaje do ręcznej oceny.
- Hooki i command rules są wyłącznie dodatkową ochroną. Nie mogą tworzyć stanu pętli, wywoływać `run`/`resume` ani zastępować controllerowego sprawdzania diffów.
- Nie wolno odtwarzać usuniętego starego manager loopa na podstawie historii, dokumentów ani pamięci rozmowy.
- Prawdziwy smoke test remote wymaga osobnej, jawnej zgody użytkownika na dokładnie jeden testowy branch i jeden Draft PR. Samo istnienie adapterów `git`/`gh` nie otwiera tej bramki.
- Obecna kompozycja CLI kończy `draft-pr` jako `BLOCKED` przed publikacją. Nie wolno obchodzić tej granicy przez bezpośrednie uruchamianie adapterów.

Przed zmianą contractów, policy, konfiguracji ról lub dokumentacji loopa uruchom testy narzędzia z `tools/studio_loop`. Nie wykonuj commita ani pusha w imieniu użytkownika.
