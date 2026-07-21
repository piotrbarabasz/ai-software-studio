const assert = require('node:assert/strict');
const test = require('node:test');

const {
  PRODUCTION_SITE_ORIGIN,
  publicPrerenderRoutes,
  validateProductionSiteConfig,
  validateSeoArtifacts,
  writeSeoArtifacts,
} = require('./site-build-utils.cjs');

const configuredEnvironment = {
  production: true,
  apiUrl: 'https://aisoftware-studio-api-technical.run.app',
  publicSiteUrl: PRODUCTION_SITE_ORIGIN,
  indexingEnabled: false,
  publicSalesEmail: 'kontakt@protolume.pl',
  publicPrivacyEmail: 'kontakt@protolume.pl',
};

test('rejects placeholder and localhost production origins', () => {
  assert.deepEqual(
    validateProductionSiteConfig({
      production: true,
      apiUrl: 'http://localhost:8000',
      publicSiteUrl: '__PUBLIC_CONFIG_REQUIRED__:publicSiteUrl',
      indexingEnabled: false,
      publicSalesEmail: 'kontakt@protolume.pl',
      publicPrivacyEmail: 'kontakt@protolume.pl',
    }),
    ['publicSiteUrl', 'apiUrl'],
  );
});

test('accepts only the Protolume production origin with noindex and a technical API URL', () => {
  assert.deepEqual(validateProductionSiteConfig(configuredEnvironment), []);
});

test('rejects invalid, placeholder or mismatched public contact addresses', () => {
  assert.deepEqual(
    validateProductionSiteConfig({
      ...configuredEnvironment,
      publicSalesEmail: '<REQUIRED_EMAIL>',
      publicPrivacyEmail: 'privacy@example.com',
    }),
    ['publicSalesEmail', 'publicPrivacyEmail'],
  );
});

test('rejects run.app, redirect-only variants and enabled indexing as production config', () => {
  for (const publicSiteUrl of [
    'https://aisoftware-studio-web.run.app',
    'https://www.protolume.pl',
    'https://protolume.com',
    'https://www.protolume.com',
    'https://untrusted.invalid',
  ]) {
    assert.ok(
      validateProductionSiteConfig({ ...configuredEnvironment, publicSiteUrl }).includes(
        'publicSiteUrl',
      ),
    );
  }

  assert.deepEqual(
    validateProductionSiteConfig({ ...configuredEnvironment, indexingEnabled: true }),
    ['indexingEnabled'],
  );
});

test('generates sitemap and robots from every non-404 prerender route', () => {
  writeSeoArtifacts(configuredEnvironment);

  assert.deepEqual(validateSeoArtifacts(configuredEnvironment, { production: true }), []);
  const sitemap = require('node:fs').readFileSync('generated/sitemap.xml', 'utf8');
  const robots = require('node:fs').readFileSync('generated/robots.txt', 'utf8');
  assert.match(sitemap, /<loc>https:\/\/protolume\.pl<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/protolume\.pl\/kontakt<\/loc>/);
  assert.match(robots, /^Sitemap: https:\/\/protolume\.pl\/sitemap\.xml$/m);
  assert.deepEqual(publicPrerenderRoutes(), [
    '/',
    '/demo-ai',
    '/przyklad-demo',
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
