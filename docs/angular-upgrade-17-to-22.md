# Angular 17 to 22 technical migration

## Baseline (2026-07-18)

- Application: Angular `17.3.12`; Angular CLI `17.3.12`; TypeScript `5.4.5`.
- Runtime used for the baseline: Node.js `20.17.0`; npm `10.8.2`.
- Command: `npm audit --omit=dev --json`.
- Production audit result: 11 vulnerable packages (1 critical, 9 high, 1 moderate).
- The critical finding was in `@angular/ssr`; high findings affected Angular framework,
  compiler, forms, browser, router and server packages. The audit offered only major-version
  Angular upgrades for these findings.
- Formatting, lint and all tests passed: 65 Karma tests and 33 Node tests.
- Production build passed and prerendered all 8 configured routes.
- Initial bundle: 327.26 kB raw / 91.83 kB estimated transfer (budget: 475 kB warning,
  600 kB error).
- Lighthouse 12.8.2 against the locally served production artifact: performance 85,
  accessibility 100, best practices 100, SEO 69. SEO is intentionally reduced by the required
  production `noindex` policy. FCP was 3162 ms, LCP 3455 ms, TBT 37 ms and CLS 0.

## Supported target and update path

Angular 22 is the current actively supported major. Angular 21 and 20 are in LTS, while Angular
19 and earlier are no longer supported. The update followed the official requirement to update
one major at a time with `ng update`:

- [Angular release support](https://angular.dev/reference/releases)
- [Angular version compatibility](https://angular.dev/reference/versions)
- [Angular CLI update command](https://angular.dev/cli/update)
- [Application builder migration](https://angular.dev/tools/cli/build-system-migration)

Angular 22 requires Node.js `^22.22.3 || ^24.15.0 || ^26.0.0` and TypeScript `>=6.0 <6.1`.
The local and Docker production build uses Node.js `22.22.3`; the pinned Cloud Build browser
image uses the also-supported Node.js `24.15.0`.

## Sequential migrations

| Step | Final framework / CLI | Required migrations and compatibility work | Production bundle |
| --- | --- | --- | --- |
| 17 → 18 | Angular 18.2.14 / CLI 18.2.21 | SSR `BootstrapContext`, TypeScript interop settings, application-builder migration check | 341.56 kB / 95.33 kB transfer |
| 18 → 19 | Angular 19.2.25 / CLI 19.2.27 | Removed redundant `standalone: true` because standalone became the default; TypeScript 5.8 and Zone.js 0.15 | 342.92 kB / 96.55 kB transfer |
| 19 → 20 | Angular 20.3.26 / CLI 20.3.32 | Migrated builders to `@angular/build`, switched module resolution to `bundler`, updated SSR and `DOCUMENT` imports | 349.83 kB / 98.64 kB transfer |
| 20 → 21 | Angular 21.2.18 / CLI 21.2.19 | Required control-flow migration from `*ngIf`/`*ngFor` to `@if`/`@for`; explicit zone change-detection providers; TypeScript 5.9 | 353.57 kB / 99.33 kB transfer |
| 21 → 22 | Angular 22.0.7 / CLI 22.0.7 | Explicit `ChangeDetectionStrategy.Eager` to retain behavior; `withXhr()` in tests; Angular extended-diagnostic compatibility; TypeScript 6.0 | 358.74 kB / 100.95 kB transfer |

Every step completed `npm ci`, `npm ls --all`, all tests and a production build with all 8
configured routes prerendered. No `npm audit fix --force` was used. Optional migrations to
Vitest and router API refactors were deliberately not combined with the framework migration.

Additional compatibility fixes:

- Removed the unused and deprecated `@angular/platform-browser-dynamic` dependency.
- Removed the unused TypeScript `baseUrl` setting instead of suppressing its TypeScript 6
  deprecation error.
- Updated `@typescript-eslint` to the TypeScript 6-compatible 8.64 line.
- Removed the obsolete `@angular-devkit/build-angular` framework/plugin from the CI Karma
  configuration; the `@angular/build:karma` application builder now supplies Angular assets and
  polyfills.
- Updated the frontend Docker build and Cloud Build checks to supported Node versions. The
  Cypress browser image is pinned by its multi-platform manifest digest.

## Final verification

- Formatting and lint: passed locally and in the Linux Cloud Build browser image.
- Frontend tests: 65 Karma tests and 33 Node tests passed on Windows/Node 22 and Linux/Node
  24.15/Chrome 148.
- Production build: passed; 8 static routes prerendered, including the dedicated `/404`
  artifact. All existing production artifact, legal configuration and SEO validators passed.
- Container smoke: all 7 public routes returned HTTP 200, an unknown route returned a real HTTP
  404, and `X-Robots-Tag: noindex, follow` remained active.
- Production dependency audit: 0 findings (0 critical, high, moderate or low), down from 11
  vulnerable production packages.
- Full dependency audit: one low-severity development-only `esbuild` advisory nested under the
  Vite version pinned by `@angular/build`; there are no high or critical findings. Angular
  22.0.7 was the latest available patch during the migration.
- Final initial bundle: 358.74 kB raw / 100.95 kB estimated transfer. This is +31.48 kB raw and
  +9.12 kB transfer after five framework majors, with no feature or UX additions. Existing
  budgets were not increased (475 kB warning / 600 kB error).
- Lighthouse 12.8.2: performance 83, accessibility 100, best practices 100, SEO 69; FCP 3319 ms,
  LCP 3621 ms, TBT 46 ms and CLS 0. Relative to the baseline this is -2 performance points,
  unchanged accessibility/best-practices/SEO, +157 ms FCP and +166 ms LCP, which is within normal
  local-run variance and not a material regression.
- Deployment guard tests: 21 deployment-contract and 19 Cloud Build YAML tests passed. Backend
  regression gates also passed (Ruff, formatting, 61 tests, Docker build and `/health` plus
  `/ready` container smoke).

Standalone components, lazy route loading, reactive forms, focus management, canonical/OG/
JSON-LD generation, legal configuration and the production noindex contract remain covered by
the existing tests and artifact validators. No copy, UX, bundle budget or indexing policy was
changed. Nothing was deployed or pushed.

## Known follow-up risks

- Karma remains in place to avoid an unrelated test-runner migration. Angular 22 offers an
  optional Vitest migration that can be evaluated separately.
- ESLint 8 remains the repository's configured linter and is upstream end-of-life. Its parser
  was updated for TypeScript 6 and lint is green; moving to ESLint flat config is a separate
  tooling migration.
- The one low-severity development-server advisory is transitive through the current Angular
  build toolchain and does not appear in `npm audit --omit=dev`; track a patched Angular build
  release instead of forcing an override.
- The required Angular 21 control-flow migration and Angular 22 eager change-detection migration
  touch many templates/components. Unit, prerender, artifact, container and Lighthouse checks
  passed, but the repository has no pixel-diff visual regression suite.
