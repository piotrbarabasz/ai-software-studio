const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { publicPrerenderRoutes } = require('./site-build-utils.cjs');
const { validateSiteArtifact } = require('./validate-site-artifact.cjs');

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
  fs.writeFileSync(
    path.join(root, 'assets', 'protolume-social-preview.png'),
    Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    'binary',
  );
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
      `<title>Strona | Protolume</title><meta name="description" content="Opis Protolume"><link rel="canonical" href="${url}"><meta property="og:url" content="${url}"><meta property="og:title" content="Strona | Protolume"><meta property="og:description" content="Opis Protolume"><meta property="og:image" content="${origin}/assets/protolume-social-preview.png"><meta property="og:image:type" content="image/png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Strona | Protolume"><meta name="twitter:description" content="Opis Protolume"><meta name="twitter:image" content="${origin}/assets/protolume-social-preview.png"><meta name="robots" content="${robots}"><script type="application/ld+json">{"website":"${origin}#website","service":"${origin}#professional-service","name":"Protolume"}</script><body><a class="skip-link" href="#main-content">Skip</a><nav id="primary-navigation">${navigation}</nav><main id="main-content" tabindex="-1">Protolume${injectedText}</main></body>`,
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
