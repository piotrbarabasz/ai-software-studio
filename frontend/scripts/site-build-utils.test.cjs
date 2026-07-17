const assert = require('node:assert/strict');
const test = require('node:test');

const {
  publicPrerenderRoutes,
  validateProductionSiteConfig,
  validateSeoArtifacts,
  writeSeoArtifacts,
} = require('./site-build-utils.cjs');

const configuredEnvironment = {
  production: true,
  apiUrl: 'https://www.iana.org',
  publicSiteUrl: 'https://www.iana.org',
  indexingEnabled: true,
};

test('rejects placeholder and localhost production origins', () => {
  assert.deepEqual(
    validateProductionSiteConfig({
      production: true,
      apiUrl: 'http://localhost:8000',
      publicSiteUrl: '__PUBLIC_CONFIG_REQUIRED__:publicSiteUrl',
      indexingEnabled: false,
    }),
    ['publicSiteUrl', 'apiUrl'],
  );
});

test('accepts an HTTPS public origin and API URL without placeholders', () => {
  assert.deepEqual(validateProductionSiteConfig(configuredEnvironment), []);
});

test('generates sitemap and robots from every non-404 prerender route', () => {
  writeSeoArtifacts(configuredEnvironment);

  assert.deepEqual(validateSeoArtifacts(configuredEnvironment, { production: true }), []);
  assert.deepEqual(publicPrerenderRoutes(), [
    '/',
    '/demo-ai',
    '/development',
    '/studio',
    '/rd',
    '/kontakt',
    '/polityka-prywatnosci',
  ]);
});

test('allows a localhost origin only for development artifacts', () => {
  const developmentEnvironment = {
    production: false,
    apiUrl: 'http://localhost:8000',
    publicSiteUrl: 'http://localhost:4200',
    indexingEnabled: false,
  };

  writeSeoArtifacts(developmentEnvironment);
  assert.deepEqual(validateSeoArtifacts(developmentEnvironment), []);
  assert.deepEqual(validateSeoArtifacts(developmentEnvironment, { production: true }), [
    'production SEO artifacts contain a localhost origin',
  ]);
});
