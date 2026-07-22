const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const FRONTEND_ROOT = path.resolve(__dirname, '..');
const PLACEHOLDER_PATTERN = /__PUBLIC_CONFIG_REQUIRED__|<[^>]+>|localhost|\.example(?:\.com)?/i;

function loadProductionContract() {
  const candidates = [
    path.join(FRONTEND_ROOT, 'production-contract.json'),
    path.resolve(FRONTEND_ROOT, '../infra/gcp/production-contract.json'),
  ];
  const contractPath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!contractPath) {
    throw new Error('Brak infra/gcp/production-contract.json dla produkcyjnego builda.');
  }
  const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  if (contract.schema_version !== 1 || typeof contract.invariants !== 'object') {
    throw new Error('Nieobsługiwana wersja kontraktu produkcyjnego.');
  }
  return contract.invariants;
}

const PRODUCTION_CONTRACT = loadProductionContract();
const PRODUCTION_SITE_ORIGIN = PRODUCTION_CONTRACT.PUBLIC_SITE_URL;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function environmentPath(mode) {
  return path.join(
    FRONTEND_ROOT,
    'src/environments',
    mode === 'production' ? 'environment.prod.ts' : 'environment.ts',
  );
}

function loadEnvironment(mode) {
  const filePath = environmentPath(mode);
  const source = fs.readFileSync(filePath, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filePath,
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, { module, exports: module.exports }, { filename: filePath });
  return module.exports.environment;
}

function normalizeOrigin(origin) {
  return typeof origin === 'string' ? origin.replace(/\/$/, '') : '';
}

function validateProductionSiteConfig(environment) {
  const errors = [];
  const origin = normalizeOrigin(environment?.publicSiteUrl);
  const apiUrl = typeof environment?.apiUrl === 'string' ? environment.apiUrl : '';

  if (!origin || PLACEHOLDER_PATTERN.test(origin) || origin !== PRODUCTION_SITE_ORIGIN) {
    errors.push('publicSiteUrl');
  } else {
    try {
      const url = new URL(origin);
      if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash) {
        errors.push('publicSiteUrl');
      }
    } catch {
      errors.push('publicSiteUrl');
    }
  }

  if (!apiUrl || PLACEHOLDER_PATTERN.test(apiUrl)) {
    errors.push('apiUrl');
  } else {
    try {
      const url = new URL(apiUrl);
      if (url.protocol !== 'https:') {
        errors.push('apiUrl');
      }
    } catch {
      errors.push('apiUrl');
    }
  }

  if (String(environment?.indexingEnabled) !== PRODUCTION_CONTRACT.PUBLIC_SITE_INDEXING) {
    errors.push('indexingEnabled');
  }

  for (const [field, invariant] of [
    ['publicSalesEmail', 'PUBLIC_SALES_EMAIL'],
    ['publicPrivacyEmail', 'PUBLIC_PRIVACY_EMAIL'],
  ]) {
    const value = typeof environment?.[field] === 'string' ? environment[field] : '';
    if (
      !value ||
      PLACEHOLDER_PATTERN.test(value) ||
      !EMAIL_PATTERN.test(value) ||
      value !== PRODUCTION_CONTRACT[invariant]
    ) {
      errors.push(field);
    }
  }

  return errors;
}

function publicPrerenderRoutes() {
  const routes = fs
    .readFileSync(path.join(FRONTEND_ROOT, 'src/prerender-routes.txt'), 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return routes.filter((route) => route !== '/404');
}

function escapeXml(value) {
  return value.replace(/[<>&'\"]/g, (character) => {
    return { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[character];
  });
}

function generatedDirectory() {
  return path.join(FRONTEND_ROOT, 'generated');
}

function writeSeoArtifacts(environment) {
  const origin = normalizeOrigin(environment.publicSiteUrl);
  const routes = publicPrerenderRoutes();
  const outputDirectory = generatedDirectory();
  fs.mkdirSync(outputDirectory, { recursive: true });

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...routes.map(
      (route) => `  <url><loc>${escapeXml(`${origin}${route === '/' ? '' : route}`)}</loc></url>`,
    ),
    '</urlset>',
    '',
  ].join('\n');
  const robots = ['User-agent: *', 'Allow: /', '', `Sitemap: ${origin}/sitemap.xml`, ''].join('\n');

  fs.writeFileSync(path.join(outputDirectory, 'sitemap.xml'), sitemap, 'utf8');
  fs.writeFileSync(path.join(outputDirectory, 'robots.txt'), robots, 'utf8');
}

function validateSeoArtifacts(environment, { production = false } = {}) {
  const origin = normalizeOrigin(environment.publicSiteUrl);
  const expectedRoutes = publicPrerenderRoutes();
  const sitemapPath = path.join(generatedDirectory(), 'sitemap.xml');
  const robotsPath = path.join(generatedDirectory(), 'robots.txt');
  const errors = [];

  if (!fs.existsSync(sitemapPath) || !fs.existsSync(robotsPath)) {
    return ['generated SEO artifacts are missing'];
  }

  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const robots = fs.readFileSync(robotsPath, 'utf8');
  const locations = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]);
  const expectedLocations = expectedRoutes.map((route) => `${origin}${route === '/' ? '' : route}`);

  if (
    locations.length !== expectedLocations.length ||
    locations.some((location, index) => location !== expectedLocations[index])
  ) {
    errors.push('sitemap routes do not match prerender routes');
  }
  if (/__PUBLIC_CONFIG_REQUIRED__|\.example(?:\.com)?/i.test(sitemap + robots)) {
    errors.push('SEO artifacts contain a placeholder origin');
  }
  if (production && /localhost/i.test(sitemap + robots)) {
    errors.push('production SEO artifacts contain a localhost origin');
  }
  if (!robots.includes(`Sitemap: ${origin}/sitemap.xml`)) {
    errors.push('robots sitemap URL does not match publicSiteUrl');
  }
  if (!/^Allow:\s*\/$/m.test(robots)) {
    errors.push('robots.txt must allow crawling with Allow: /');
  }
  if (/^Disallow:\s*\/$/m.test(robots)) {
    errors.push('robots.txt must not disallow / in production');
  }

  return errors;
}

module.exports = {
  FRONTEND_ROOT,
  PRODUCTION_CONTRACT,
  PRODUCTION_SITE_ORIGIN,
  generatedDirectory,
  loadEnvironment,
  normalizeOrigin,
  publicPrerenderRoutes,
  validateProductionSiteConfig,
  validateSeoArtifacts,
  writeSeoArtifacts,
};
