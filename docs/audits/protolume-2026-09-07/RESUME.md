# Resume State

## Current branch
`fix/audit-p0-stability-accessibility`

## Last completed task
?aden task nie jest jeszcze DONE we wszystkich kryteriach. P0 kod zweryfikowany lokalnie.

## Current task
Domkni?cie dowod?w UX-001/002, nast?pnie UX-003/004 (model oferty i intencja kontaktu).

## Current hypothesis / root cause
Hydration naprawia destrukcj? DOM. Angular 22 domy?lnie w??cza incremental hydration/event replay: trzeba `withNoIncrementalHydration()`, by nie generowa? executable inline JS. Dalszy CLS 0.621 powodowa?a rozwini?ta mobilna nawigacja przed bootstrapem. Dynamiczny DOM w noscript kontaktu powodowa? `e.hasAttribute is not a function`; zast?piono stabilnym DOM + CSS scripting media. Lokalne CTA nadpisywa?y kolor dark-section; naprawione.

## Files currently involved
* app.config.ts; shell/contact HTML i SCSS; home SCSS
* frontend/scripts/*csp* i script-attributes.cjs
* docs/audits/protolume-2026-09-07/implementation-evidence/

## Tests already passed
* npm ci; frontend lint; npm test: 204 Angular + Node suites (log tmp/audit-implementation/phase-a-tests.log).
* npm run build: 16 prerender tras, CSP, SEO, legal/artifact validators.
* Backend Python 3.12 venv: lock + editable install, ruff check, format, pytest 75.
* Deployment unittest: 60; Cloud Build YAML: 23.
* Oba Docker obrazy zbudowane: aisoftware-studio-api:local oraz aisoftware-studio-web:audit.
* 12 cold runs: /, /demo-ai, /kontakt i RAG, po 3; CPU x4, 390x844, bez throttlingu sieci, localhost, Chromium 151; CLS 0, brak znikania main i b??d?w.
* axe home: 320/360/390/430/768/921/1024/1440, reduced motion; zero violations/overflow. Realny no-JS menu i mail dzia?aj?. Skip link + Escape dzia?aj?.

## Tests still required
* Finalny frontend format:check po zmianach (wcze?niej zastany format site.pl.ts poprawiono).
* Hover/focus kontrast, formularz browser, anchors; por?wnanie lab LCP w identycznych warunkach (lokalny LCP niepor?wnywalny z Lighthouse produkcji).
* Backend container health smoke i resolved production contract wymagaj? prawdziwych niesekretnych SMTP vars (B-006).
* Produkcyjny deployment/read-only smoke nie wykonany.

## Known failing test / command
Brak znanego b??du kodu po 204 testach. Domy?lny Python to Anaconda 3.9, instalacja locka nie dzia?a; u?ywaj backend/.venv/Scripts/python.exe (3.12). Nigdy nie u?ywaj frontend/.public-legal-config.json: zastana fikcyjna konfiguracja z mojibake.

## Exact next action
1. Zako?cz test hover/focus/form/anchors na lokalnym artefakcie; zapisz wynik i commit checkpoint.
2. UX-003/004: centralny neutralny model pierwszego etapu, rozdziel symulacj?; kontekst pi?ciu us?ug bez utraty r?cznej zmiany tematu. Bez nowych obietnic biznesowych.
3. Nast?pnie UX-005/006 hub/nawigacja, UX-007/008 home/symulacja, UX-009 rejestr proof; kontynuuj reszt? backlogu. Checkpoint co 1?3 taski i przed d?ugimi testami.

## Do not redo
* Ca?y audyt przeczytany; nie audytuj od zera.
* Nie przepisuj poprawionej hydration/CSP; aktualne pomiary s? w implementation-evidence.
* Nie w??czaj withEventReplay ani domy?lnej incremental hydration; nie hashuj executable inline JS.
* Nie publikuj fikcyjnego legal configu ani generowanych environment.prod.ts/build SHA.

## Last known good commit
`6bb3e90` dla lokalnych zachowa? P0; nie jest MERGE_READY (brak pe?nych gates).

## Uncommitted work
Checkpoint stanu + przywr?cenie generowanych environment.prod.ts/index.html do szablon?w master. Sprawd? git status.

Lokalne narz?dzia: tmp/audit-implementation/build.ps1 (build z warto?ciami kontraktu i kopi? aktualnie publicznej polityki, nie zmienia podstaw prawnych); serve.cjs na porcie 4400 (sesja mo?e nie dzia?a? po wznowieniu); measure.cjs, a11y.cjs. Surowe logi w tym katalogu. Public legal JSON odtworzony dok?adnie z opublikowanej polityki build 8386de6; to nie potwierdzenie poprawno?ci prawnej lub zgodno?ci z najnowszym Secret Manager.
