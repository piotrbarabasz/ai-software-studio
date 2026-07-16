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
publicSiteOrigin=http://localhost:4200
```

Production Docker builds receive `API_URL` and `PUBLIC_SITE_ORIGIN` as build arguments. The committed production environment deliberately contains placeholders; `npm run build` rejects placeholders, local origins, example domains and non-HTTPS values before Angular compiles. The same origin generates canonical URLs, Open Graph URLs, JSON-LD, `robots.txt` and `sitemap.xml`.

See [`../docs/public-origin-deployment.md`](../docs/public-origin-deployment.md) for the custom-domain, CORS and post-deployment checks.

## Public privacy configuration

Production builds validate public privacy data from `src/app/core/legal/public-legal.config.ts`. The committed configuration contains explicit development placeholders, so `npm run build` intentionally fails until the owner provides verified public data. Use `npm run build:development` for a local build with the clearly marked demonstration configuration.

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
- `npm run build` validates the public origin and legal configuration, generates SEO artifacts and creates the production build.
- `npm run check` runs format verification, linting, tests and the production build without formatting files.
- `npm run build:development` generates local SEO artifacts and creates a development build without publishing-ready legal data.
