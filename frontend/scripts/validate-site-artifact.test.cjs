const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { publicPrerenderRoutes } = require('./site-build-utils.cjs');
const { validateSiteArtifact } = require('./validate-site-artifact.cjs');
const publicBrandManifest = require('../config/public-brand.json');

const socialPreviewName = path.basename(publicBrandManifest.assets.socialPreviewPath);
const socialPreviewFixture =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><defs><linearGradient id="brandGradient"><stop offset="0" stop-color="#7c5cff"/></linearGradient></defs><rect width="1200" height="630" fill="url(#brandGradient)"/></svg>';

test('public component styles do not reintroduce legacy green or orange colors', () => {
  const sourceRoot = path.resolve(__dirname, '../src');
  const legacyPatterns = [
    /#17201b/i,
    /#223027/i,
    /rgba?\(197\s*,\s*106\s*,\s*20/i,
    /#eef2ec/i,
    /#eef7f4/i,
  ];
  const files = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(entryPath);
      else if (/\.(scss|css|html)$/.test(entry.name)) files.push(entryPath);
    }
  };
  visit(sourceRoot);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const pattern of legacyPatterns) {
      assert.doesNotMatch(
        content,
        pattern,
        `${path.relative(sourceRoot, file)} reintroduced ${pattern}`,
      );
    }
  }
});

function writeArtifact(root, environment, injectedText = '') {
  const origin = environment.publicSiteUrl;
  fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
  for (const asset of [
    'favicon.svg',
    'protolume-logo-horizontal-dark.svg',
    'protolume-logo-horizontal-light.svg',
    'protolume-symbol.svg',
    'protolume-symbol-mono.svg',
  ]) {
    fs.writeFileSync(path.join(root, 'assets', asset), '<svg></svg>', 'utf8');
  }
  fs.writeFileSync(path.join(root, 'assets', socialPreviewName), socialPreviewFixture, 'utf8');
  const primaryRoutes = ['/demo-ai', '/development', '/studio', '/kontakt'];
  for (const route of [...publicPrerenderRoutes(), '/404']) {
    const directory = route === '/' ? root : path.join(root, route.slice(1));
    fs.mkdirSync(directory, { recursive: true });
    const url = `${origin}${route === '/' ? '' : route}`;
    const robots =
      route === '/404' || !environment.indexingEnabled ? 'noindex, follow' : 'index, follow';
    const navigation = primaryRoutes
      .map(
        (navigationRoute) =>
          `<a href="${navigationRoute}"${route === navigationRoute ? ' aria-current="page"' : ''}>Link</a>`,
      )
      .join('');
    fs.writeFileSync(
      path.join(directory, 'index.html'),
      `<title>Strona | Protolume</title><meta name="description" content="Opis Protolume"><link rel="canonical" href="${url}"><meta property="og:url" content="${url}"><meta property="og:title" content="Strona | Protolume"><meta property="og:description" content="Opis Protolume"><meta property="og:image" content="${origin}${publicBrandManifest.assets.socialPreviewPath}"><meta property="og:image:type" content="${publicBrandManifest.assets.socialPreviewType}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Strona | Protolume"><meta name="twitter:description" content="Opis Protolume"><meta name="twitter:image" content="${origin}${publicBrandManifest.assets.socialPreviewPath}"><meta name="robots" content="${robots}"><script type="application/ld+json">{"website":"${origin}#website","service":"${origin}#professional-service","name":"Protolume"}</script><body><a class="skip-link" href="#main-content">Skip</a><nav id="primary-navigation">${navigation}</nav><main id="main-content" tabindex="-1">Protolume${injectedText}</main></body>`,
      'utf8',
    );
  }
  fs.writeFileSync(path.join(root, 'sitemap.xml'), `<loc>${origin}</loc>`, 'utf8');
  fs.writeFileSync(path.join(root, 'robots.txt'), `Sitemap: ${origin}/sitemap.xml`, 'utf8');
}

test('accepts Protolume production metadata with noindex in every document', (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-artifact-'));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const environment = {
    publicSiteUrl: 'https://protolume.pl',
    indexingEnabled: false,
  };
  writeArtifact(root, environment);

  assert.deepEqual(validateSiteArtifact(root, environment), []);
  for (const route of [...publicPrerenderRoutes(), '/404']) {
    const documentPath =
      route === '/' ? path.join(root, 'index.html') : path.join(root, route.slice(1), 'index.html');
    const html = fs.readFileSync(documentPath, 'utf8');
    const expectedUrl = `https://protolume.pl${route === '/' ? '' : route}`;
    assert.match(html, new RegExp(`rel="canonical" href="${expectedUrl}"`));
    assert.match(html, new RegExp(`property="og:url" content="${expectedUrl}"`));
    assert.match(html, /name="robots" content="noindex, follow"/);
  }
});

test('rejects a production artifact without the favicon', (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-artifact-'));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const environment = {
    publicSiteUrl: 'https://protolume.pl',
    indexingEnabled: false,
  };
  writeArtifact(root, environment);
  fs.rmSync(path.join(root, 'assets', 'favicon.svg'));

  assert.ok(
    validateSiteArtifact(root, environment).includes(
      'missing brand asset in production artifact: /assets/favicon.svg',
    ),
  );
});

test('accepts the configured social preview SVG', (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-artifact-'));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const environment = { publicSiteUrl: 'https://protolume.pl', indexingEnabled: false };
  writeArtifact(root, environment);
  assert.deepEqual(validateSiteArtifact(root, environment), []);
});

test('rejects invalid social preview SVG variants', (context) => {
  const cases = [
    [
      'missing',
      null,
      `missing brand asset in production artifact: ${publicBrandManifest.assets.socialPreviewPath}`,
    ],
    ['empty', '<svg></svg>', 'social preview SVG is an empty placeholder'],
    [
      'viewBox',
      '<svg viewBox="0 0 10 10"><rect/></svg>',
      'social preview SVG must use viewBox 0 0 1200 630',
    ],
    [
      'script',
      '<svg viewBox="0 0 1200 630"><script/></svg>',
      'social preview SVG contains script or event handler',
    ],
    [
      'handler',
      '<svg viewBox="0 0 1200 630" onclick="x"><rect/></svg>',
      'social preview SVG contains script or event handler',
    ],
    [
      'external',
      '<svg viewBox="0 0 1200 630"><image href="https://evil.test/a"/></svg>',
      'social preview SVG contains a forbidden embedded or external resource',
    ],
  ];
  for (const [name, content, expected] of cases) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), `site-artifact-${name}-`));
    context.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const environment = { publicSiteUrl: 'https://protolume.pl', indexingEnabled: false };
    writeArtifact(root, environment);
    const asset = path.join(root, 'assets', socialPreviewName);
    if (content === null) fs.rmSync(asset);
    else fs.writeFileSync(asset, content, 'utf8');
    assert.ok(
      validateSiteArtifact(root, environment).some((error) => error.includes(expected)),
      name,
    );
  }
});

test('rejects resource URLs but accepts local SVG references', (context) => {
  const cases = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><image href="data:image/png;base64,abc"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><use href="https://evil.test/file.svg#icon"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><style>@import url("https://evil.test/style.css");</style></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect style="fill:url(https://evil.test/a.svg)"/></svg>',
  ];
  for (const content of cases) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-artifact-resource-'));
    context.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const environment = { publicSiteUrl: 'https://protolume.pl', indexingEnabled: false };
    writeArtifact(root, environment);
    fs.writeFileSync(path.join(root, 'assets', socialPreviewName), content, 'utf8');
    assert.ok(
      validateSiteArtifact(root, environment).some((error) =>
        error.includes('forbidden embedded or external resource'),
      ),
    );
  }
});

test('rejects mismatched social preview metadata', (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-artifact-'));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const environment = { publicSiteUrl: 'https://protolume.pl', indexingEnabled: false };
  writeArtifact(root, environment);
  const htmlPath = path.join(root, 'index.html');
  const html = fs
    .readFileSync(htmlPath, 'utf8')
    .replaceAll(publicBrandManifest.assets.socialPreviewPath, '/assets/wrong.svg')
    .replaceAll(publicBrandManifest.assets.socialPreviewType, 'image/jpeg');
  fs.writeFileSync(htmlPath, html, 'utf8');
  assert.ok(
    validateSiteArtifact(root, environment).some((error) =>
      error.includes('social preview metadata'),
    ),
  );
});

test('rejects leaked run.app URLs from a Protolume production artifact', (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-artifact-'));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const environment = {
    publicSiteUrl: 'https://protolume.pl',
    indexingEnabled: false,
  };
  writeArtifact(root, environment, '<p>https://old-service.run.app</p>');

  assert.ok(
    validateSiteArtifact(root, environment).some((error) =>
      error.includes('unexpected run.app URL'),
    ),
  );
});

test('rejects a retired public brand name from any prerendered document', (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-artifact-'));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const environment = {
    publicSiteUrl: 'https://protolume.pl',
    indexingEnabled: false,
  };
  writeArtifact(root, environment, '<p>AISoftware Studio</p>');

  assert.ok(
    validateSiteArtifact(root, environment).some((error) =>
      error.includes('retired public brand name'),
    ),
  );
});

test('rejects inert content in a prerendered document', (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-artifact-'));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const environment = {
    publicSiteUrl: 'https://protolume.pl',
    indexingEnabled: false,
  };
  writeArtifact(root, environment, '<section inert>Blocked content</section>');

  assert.ok(
    validateSiteArtifact(root, environment).some((error) =>
      error.includes('must not contain inert content'),
    ),
  );
});

test('rejects prerendered navigation without native links and focus targets', (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-artifact-'));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const environment = {
    publicSiteUrl: 'https://protolume.pl',
    indexingEnabled: false,
  };
  writeArtifact(root, environment);

  const homePath = path.join(root, 'index.html');
  const inaccessibleHtml = fs
    .readFileSync(homePath, 'utf8')
    .replace('<a href="/kontakt">Link</a>', '<span>Kontakt</span>')
    .replace('href="#main-content"', 'href="#missing"')
    .replace('tabindex="-1"', '');
  fs.writeFileSync(homePath, inaccessibleHtml, 'utf8');

  const errors = validateSiteArtifact(root, environment);
  assert.ok(errors.some((error) => error.includes('native link to /kontakt')));
  assert.ok(errors.some((error) => error.includes('working skip link')));
  assert.ok(errors.some((error) => error.includes('focusable main target')));
});
