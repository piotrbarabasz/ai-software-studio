const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  PRODUCTION_SITE_ORIGIN,
  publicPrerenderRoutes,
  loadProductionContract,
  validateProductionSiteConfig,
  validateSeoArtifacts,
  writeSeoArtifacts,
} = require('./site-build-utils.cjs');

const configuredEnvironment = {
  production: true,
  apiUrl: 'https://aisoftware-studio-api-technical.run.app',
  publicSiteUrl: PRODUCTION_SITE_ORIGIN,
  indexingEnabled: true,
  publicSalesEmail: 'kontakt@protolume.pl',
  publicPrivacyEmail: 'kontakt@protolume.pl',
};

function productionContract() {
  return {
    schema_version: 1,
    invariants: {
      PUBLIC_SITE_URL: PRODUCTION_SITE_ORIGIN,
      PUBLIC_SITE_INDEXING: 'true',
      PUBLIC_SALES_EMAIL: 'kontakt@protolume.pl',
      PUBLIC_PRIVACY_EMAIL: 'kontakt@protolume.pl',
      CORS_ALLOWED_ORIGINS: PRODUCTION_SITE_ORIGIN,
      BACKEND_URL: 'https://aisoftware-studio-api-175725977490.europe-central2.run.app',
    },
  };
}

function writeContract(root, relativePath, contract) {
  const contractPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(contractPath), { recursive: true });
  fs.writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`, 'utf8');
  return contractPath;
}

test('rejects placeholder and localhost production origins', () => {
  assert.deepEqual(
    validateProductionSiteConfig({
      production: true,
      apiUrl: 'http://localhost:8000',
      publicSiteUrl: '__PUBLIC_CONFIG_REQUIRED__:publicSiteUrl',
      indexingEnabled: true,
      publicSalesEmail: 'kontakt@protolume.pl',
      publicPrivacyEmail: 'kontakt@protolume.pl',
    }),
    ['publicSiteUrl', 'apiUrl'],
  );
});

test('accepts only the Protolume production origin with indexing and a technical API URL', () => {
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

  assert.deepEqual(validateProductionSiteConfig(configuredEnvironment), []);
});

test('generates sitemap and robots from every non-404 prerender route', () => {
  writeSeoArtifacts(configuredEnvironment);

  assert.deepEqual(validateSeoArtifacts(configuredEnvironment, { production: true }), []);
  const sitemap = require('node:fs').readFileSync('generated/sitemap.xml', 'utf8');
  const robots = require('node:fs').readFileSync('generated/robots.txt', 'utf8');
  assert.match(sitemap, /<loc>https:\/\/protolume\.pl<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/protolume\.pl\/przyklad-demo<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/protolume\.pl\/rozwiazania\/chatbot-ai-dla-firm<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/protolume\.pl\/kontakt<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/protolume\.pl\/dla-software-house<\/loc>/);
  assert.doesNotMatch(sitemap, /<loc>[^<]*\/404<\/loc>/);
  assert.doesNotMatch(sitemap, /<loc>[^<]*\/demo-w-7-dni<\/loc>/);
  assert.match(robots, /^Sitemap: https:\/\/protolume\.pl\/sitemap\.xml$/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.doesNotMatch(robots, /^Disallow: \/$/m);
  assert.deepEqual(publicPrerenderRoutes(), [
    '/',
    '/demo-ai',
    '/przyklad-demo',
    '/rozwiazania',
    '/rozwiazania/chatbot-ai-dla-firm',
    '/rozwiazania/voice-ai-dla-firm',
    '/rozwiazania/automatyzacja-procesow',
    '/rozwiazania/integracje-whatsapp-crm',
    '/rozwiazania/systemy-agentowe',
    '/dla-software-house',
    '/development',
    '/studio',
    '/rd',
    '/kontakt',
    '/polityka-prywatnosci',
  ]);
});

test('rejects altered sitemap and robots discovery contracts', (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-artifacts-contract-'));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  const validate = () =>
    validateSeoArtifacts(configuredEnvironment, {
      production: true,
      artifactDirectory: root,
    });
  const reset = () => writeSeoArtifacts(configuredEnvironment, { outputDirectory: root });
  const mutate = (fileName, update) => {
    const filePath = path.join(root, fileName);
    fs.writeFileSync(filePath, update(fs.readFileSync(filePath, 'utf8')), 'utf8');
  };

  reset();
  mutate('sitemap.xml', (content) =>
    content.replace('</urlset>', '  <url><loc>https://protolume.pl/404</loc></url>\n</urlset>'),
  );
  assert.ok(validate().includes('sitemap routes do not match prerender routes'));

  reset();
  mutate('sitemap.xml', (content) =>
    content.replace(
      '</urlset>',
      '  <url><loc>https://protolume.pl/demo-w-7-dni</loc></url>\n</urlset>',
    ),
  );
  assert.ok(validate().includes('sitemap routes do not match prerender routes'));

  reset();
  mutate('sitemap.xml', (content) =>
    content.replace(
      '</urlset>',
      '  <url><loc>https://protolume.pl/dla-software-house</loc></url>\n</urlset>',
    ),
  );
  assert.ok(validate().includes('sitemap contains duplicate canonical URLs'));

  reset();
  mutate('sitemap.xml', (content) => content.replace('&amp;', '&'));
  if (validate().length === 0) {
    mutate('sitemap.xml', (content) => content.replace('</loc>', '?a=1&b=2</loc>', 1));
  }
  assert.ok(validate().includes('sitemap routes do not match prerender routes'));

  reset();
  mutate('robots.txt', (content) => content.replace('User-agent: *\n', ''));
  assert.ok(validate().includes('robots.txt must target User-agent: *'));

  reset();
  mutate('robots.txt', (content) => content.replace('Allow: /', 'Disallow: /'));
  const disallowErrors = validate();
  assert.ok(disallowErrors.includes('robots.txt must allow crawling with Allow: /'));
  assert.ok(disallowErrors.includes('robots.txt must not disallow / in production'));

  reset();
  mutate('robots.txt', (content) => content.replace('protolume.pl', 'www.protolume.pl'));
  assert.ok(validate().includes('robots sitemap URL does not match publicSiteUrl'));
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

test('loads the production contract from either the repo layout or the Docker layout', (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'production-contract-loader-'));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  const repoContractPath = writeContract(
    root,
    path.join('infra', 'gcp', 'production-contract.json'),
    productionContract(),
  );
  const dockerContractPath = writeContract(root, 'production-contract.json', productionContract());

  assert.deepEqual(
    loadProductionContract([repoContractPath]).PUBLIC_SITE_URL,
    PRODUCTION_SITE_ORIGIN,
  );
  assert.deepEqual(
    loadProductionContract([dockerContractPath]).PUBLIC_SITE_URL,
    PRODUCTION_SITE_ORIGIN,
  );
});

test('rejects missing and invalid production contracts without fallback', (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'production-contract-loader-invalid-'));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  const invalidVersionPath = writeContract(root, 'invalid-version.json', {
    schema_version: 2,
    invariants: productionContract().invariants,
  });
  const missingObjectPath = writeContract(root, 'missing-object.json', { schema_version: 1 });

  assert.throws(
    () => loadProductionContract([path.join(root, 'does-not-exist.json')]),
    /Brak infra\/gcp\/production-contract\.json/,
  );
  assert.throws(() => loadProductionContract([invalidVersionPath]), /Nieobs/);
  assert.throws(() => loadProductionContract([missingObjectPath]), /Nieobs/);
});
