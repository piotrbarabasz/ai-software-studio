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

function writeArtifact(root, environment, injectedText = '', extraFiles = []) {
  const origin = environment.publicSiteUrl;
  const buildSha = environment.buildSha ?? 'abc1234';
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

  const primaryRoutes = ['/rozwiazania', '/demo-ai', '/development', '/studio', '/kontakt'];
  const routeBodies = {
    '/':
      '<section class="hero"><h1>AI i automatyzacje dla firm</h1><p>Sprawdź jeden proces.</p></section>' +
      '<section class="trust-strip"><p>Materiały, dane i kod klienta pozostają prywatne...</p><div id="client-confidentiality">Prywatność danych i kodu klienta</div></section>' +
      '<section class="evidence-teaser"><p>Sprawdzalne przykłady</p><h2>Sprawdź działające elementy i jasno opisane granice</h2><p>Uruchom demonstrację, przejrzyj przykładowy rezultat i zobacz, co każdy materiał faktycznie potwierdza.</p></section>' +
      '<section class="use-cases"><article class="use-case-card">One</article><article class="use-case-card">Two</article><article class="use-case-card">Three</article><article class="use-case-card">Four</article><article class="use-case-card">Five</article></section>',
    '/demo-ai':
      '<h1>Zobacz jeden scenariusz swojej firmy w działającym demo</h1><div class="interactive-demo">Demo</div><p>Uruchom przykładowe demo</p>',
    '/przyklad-demo':
      '<h1>Od zapytania produktowego do odpowiedzi z kontrolą człowieka</h1><p>Fikcyjny scenariusz demonstracyjny.</p><p>Poza zakresem</p>',
    '/rozwiazania':
      '<h1>Pięć sposobów na uporządkowanie konkretnego procesu</h1><a href="#asystent-wiedzy">Asystent</a><a href="#automatyzacja-wiadomosci-i-dokumentow">Automatyzacja</a><a href="#panel-operacyjny">Panel</a><a href="#system-agentowy">Agent</a><a href="#integracje-kanalow">Kanały</a><a href="/kontakt?projectType=rag_chatbot_demo">Kontakt</a><a href="/kontakt?projectType=business_process_automation">Kontakt</a><a href="/kontakt?projectType=custom_web_app">Kontakt</a><a href="/kontakt?projectType=backend_api">Kontakt</a>',
    '/development': '<h1>Wdrożenia</h1>',
    '/studio':
      '<section class="hero"><h1>Jedna odpowiedzialna osoba od analizy do realizacji</h1><p>O Protolume</p><p>Materiały, dane i kod klienta pozostają prywatne...</p></section>',
    '/rd': '<h1>R&D i eksperymenty</h1>',
    '/kontakt':
      '<h1>Kontakt i rozmowa wstępna</h1><form><input name="name"><input name="email"><input name="projectType"><textarea name="message"></textarea><input name="consent"></form>',
    '/polityka-prywatnosci': '<h1>Polityka prywatności</h1><p>kontakt@protolume.pl</p>',
    '/404': '<h1>404</h1>',
  };

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
    const body = routeBodies[route] ?? '';
    fs.writeFileSync(
      path.join(directory, 'index.html'),
      `<title>Strona | Protolume</title><meta name="description" content="Opis Protolume"><link rel="canonical" href="${url}"><meta property="og:url" content="${url}"><meta property="og:title" content="Strona | Protolume"><meta property="og:description" content="Opis Protolume"><meta property="og:image" content="${origin}${publicBrandManifest.assets.socialPreviewPath}"><meta property="og:image:type" content="${publicBrandManifest.assets.socialPreviewType}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Strona | Protolume"><meta name="twitter:description" content="Opis Protolume"><meta name="twitter:image" content="${origin}${publicBrandManifest.assets.socialPreviewPath}"><meta name="robots" content="${robots}">${route === '/' ? `<meta name="protolume-build-sha" content="${buildSha}" />` : ''}<script type="application/ld+json">{"website":"${origin}#website","service":"${origin}#professional-service","name":"Protolume"}</script><body><a class="skip-link" href="#main-content">Skip</a><nav id="primary-navigation">${navigation}</nav><main id="main-content" tabindex="-1">Protolume${body}${injectedText}</main></body>`,
      'utf8',
    );
  }

  for (const { relativePath, content } of extraFiles) {
    const filePath = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
  }

  fs.writeFileSync(path.join(root, 'sitemap.xml'), `<loc>${origin}</loc>`, 'utf8');
  fs.writeFileSync(path.join(root, 'robots.txt'), `Sitemap: ${origin}/sitemap.xml`, 'utf8');
}

function collectHtmlFiles(root) {
  const htmlFiles = [];
  const pending = [root];
  while (pending.length > 0) {
    const directory = pending.pop();
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) pending.push(entryPath);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html'))
        htmlFiles.push(entryPath);
    }
  }
  return htmlFiles;
}

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

test('accepts a realistic Protolume artifact without legacy public-code copy', (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-artifact-public-copy-'));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const environment = {
    publicSiteUrl: 'https://protolume.pl',
    indexingEnabled: true,
    buildSha: 'abc1234',
  };
  writeArtifact(root, environment);

  const publicHtml = collectHtmlFiles(root)
    .map((documentPath) => fs.readFileSync(documentPath, 'utf8'))
    .join('\n');

  for (const forbidden of [
    /github\.com/i,
    /GitHub/i,
    /publiczny kod/i,
    /publicznie widoczny kod/i,
    /repozytorium projektu/i,
    /zobacz kod demonstracji/i,
    /zobacz kod aplikacji i wdrożenia/i,
  ]) {
    assert.doesNotMatch(publicHtml, forbidden);
  }

  assert.deepEqual(validateSiteArtifact(root, environment), []);
});

test('rejects a github.com href anywhere in the prerendered artifact', (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-artifact-github-'));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const environment = { publicSiteUrl: 'https://protolume.pl', indexingEnabled: false };
  writeArtifact(root, environment, '', [
    {
      relativePath: 'audit/report.html',
      content:
        '<html><body><a href="https://github.com/piotrbarabasz/ai-software-studio">GitHub</a></body></html>',
    },
  ]);

  assert.ok(
    validateSiteArtifact(root, environment).some((error) => error.includes('github.com links')),
  );
});

test('rejects forbidden marketing copy anywhere in the prerendered artifact', (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-artifact-copy-'));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const environment = { publicSiteUrl: 'https://protolume.pl', indexingEnabled: false };
  writeArtifact(root, environment, '', [
    {
      relativePath: 'audit/report.html',
      content:
        '<html><body><p>Możesz samodzielnie otworzyć demonstrację i repozytorium projektu.</p></body></html>',
    },
    {
      relativePath: 'audit/secondary.html',
      content: '<html><body><p>Zobacz kod aplikacji i wdrożenia</p></body></html>',
    },
  ]);

  const errors = validateSiteArtifact(root, environment);
  assert.ok(errors.some((error) => error.includes('repozytorium projektu')));
  assert.ok(errors.some((error) => error.includes('zobacz kod aplikacji i wdrożenia')));
});

test('accepts the privacy notice for client confidentiality in the prerendered artifact', (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-artifact-privacy-'));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const environment = {
    publicSiteUrl: 'https://protolume.pl',
    indexingEnabled: false,
    buildSha: 'abc1234',
  };
  writeArtifact(root, environment);

  assert.deepEqual(validateSiteArtifact(root, environment), []);
});

test('rejects a production artifact without the favicon', (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-artifact-'));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const environment = { publicSiteUrl: 'https://protolume.pl', indexingEnabled: false };
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
  const environment = {
    publicSiteUrl: 'https://protolume.pl',
    indexingEnabled: false,
    buildSha: 'abc1234',
  };
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

test('validates the homepage build SHA against the environment', (context) => {
  const cases = [
    ['unknown', 'protolume-build-sha meta tag must match environment.buildSha'],
    ['missing', 'protolume-build-sha meta tag must match environment.buildSha'],
    ['duplicate', 'protolume-build-sha meta tag must match environment.buildSha'],
  ];
  for (const [name, expected] of cases) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), `site-artifact-sha-${name}-`));
    context.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const environment = {
      publicSiteUrl: 'https://protolume.pl',
      indexingEnabled: false,
      buildSha: 'abc1234',
    };
    writeArtifact(root, environment);
    const htmlPath = path.join(root, 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');
    if (name === 'unknown') html = html.replace('content="abc1234"', 'content="unknown"');
    if (name === 'missing') html = html.replace(/<meta name="protolume-build-sha"[^>]*>/, '');
    if (name === 'duplicate')
      html = html.replace(
        '</body>',
        '<meta name="protolume-build-sha" content="abc1234" /></body>',
      );
    fs.writeFileSync(htmlPath, html, 'utf8');
    assert.ok(
      validateSiteArtifact(root, environment).some((error) => error.includes(expected)),
      name,
    );
  }
});

test('rejects leaked run.app URLs from a Protolume production artifact', (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-artifact-'));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const environment = { publicSiteUrl: 'https://protolume.pl', indexingEnabled: false };
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
  const environment = { publicSiteUrl: 'https://protolume.pl', indexingEnabled: false };
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
  const environment = { publicSiteUrl: 'https://protolume.pl', indexingEnabled: false };
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
  const environment = { publicSiteUrl: 'https://protolume.pl', indexingEnabled: false };
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
