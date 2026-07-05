# Frontend

Angular single-page marketing website for AISoftware Studio.

## Commands

```bash
npm install
npm start
npm run lint
npm run format
npm test
npm run build
```

`npm start` serves the app at `http://localhost:4200`.

## Environment

The API URL is configured in:

- `src/environments/environment.ts` for local development
- `src/environments/environment.prod.ts` for production builds

Local default:

```text
apiUrl=http://127.0.0.1:8000
```

Production deployments should replace the placeholder API URL with the independently deployed backend URL.

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
- `npm run build` creates the production build.

