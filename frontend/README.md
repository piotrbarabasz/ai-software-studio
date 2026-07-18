# Frontend

Angular single-page marketing website for AISoftware Studio.

## Commands

```bash
npm install
npm start
npm run lint
npm run format
npm test
npm run check
npm run build
npm run build:development
```

`npm start` serves the app at `http://localhost:4200`.

## Environment

The API URL and public origin are configured in:

- `src/environments/environment.ts` for local development
- `src/environments/environment.prod.ts` for production builds

Local default:

```text
apiUrl=http://127.0.0.1:8000
publicSiteUrl=http://localhost:4200
indexingEnabled=false
```

Production Docker builds receive `API_URL`, `PUBLIC_SITE_URL` and `PUBLIC_SITE_INDEXING` as build arguments. The committed production environment deliberately contains placeholders; `npm run build` requires `PUBLIC_SITE_URL=https://protolume.pl`, rejects non-HTTPS or placeholder API URLs, and requires indexing to remain `false` at this migration stage. The same public origin generates canonical URLs, Open Graph URLs, JSON-LD, `robots.txt` and `sitemap.xml`; Nginx and HTML remain `noindex, follow`. `API_URL` may remain a technical Cloud Run URL.

See [`../docs/public-origin-deployment.md`](../docs/public-origin-deployment.md) for the custom-domain, CORS and post-deployment checks.
See [`../docs/frontend-hosting.md`](../docs/frontend-hosting.md) for gzip, cache, security headers, CSP staging and container smoke tests.

## Public privacy configuration

Production builds require `PUBLIC_LEGAL_CONFIG_PATH` pointing to a verified JSON file. They generate an ignored TypeScript module, validate the JSON before compilation, and scan the prerendered artifact afterwards. There is no committed production configuration and no fallback. Use `npm run build:development` for the explicitly named local-test configuration under `config/local-test/`; Docker excludes that directory.

See [`../docs/privacy-configuration.md`](../docs/privacy-configuration.md) for required fields, validation, and the pre-deployment check.

## Structure

```text
src/app/core/              shared configuration and Polish content
src/app/features/landing/  landing page sections and tests
src/app/features/contact/  reactive contact form and tests
src/app/services/          typed backend API client
src/assets/                local visual assets
src/environments/          environment-based API URL configuration
```

## Quality Gates

- `npm run lint` checks TypeScript with ESLint.
- `npm run format` applies Prettier formatting.
- `npm test` runs Angular unit/component tests in Chrome Headless.
- `npm run build` requires `PUBLIC_LEGAL_CONFIG_PATH`, validates the public origin and legal JSON, generates SEO artifacts, creates the production build, and scans the result.
- `npm run check` runs format verification, linting, tests and the production build without formatting files.
- `npm run build:development` generates local SEO artifacts and creates a development build without publishing-ready legal data.
