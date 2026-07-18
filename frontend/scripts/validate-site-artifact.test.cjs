const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { publicPrerenderRoutes } = require('./site-build-utils.cjs');
const { validateSiteArtifact } = require('./validate-site-artifact.cjs');

function writeArtifact(root, environment, injectedText = '') {
  const origin = environment.publicSiteUrl;
  for (const route of [...publicPrerenderRoutes(), '/404']) {
    const directory = route === '/' ? root : path.join(root, route.slice(1));
    fs.mkdirSync(directory, { recursive: true });
    const url = `${origin}${route === '/' ? '' : route}`;
    const robots =
      route === '/404' || !environment.indexingEnabled ? 'noindex, follow' : 'index, follow';
    fs.writeFileSync(
      path.join(directory, 'index.html'),
      `<title>Strona | Protolume</title><meta name="description" content="Opis Protolume"><link rel="canonical" href="${url}"><meta property="og:url" content="${url}"><meta property="og:title" content="Strona | Protolume"><meta property="og:description" content="Opis Protolume"><meta property="og:image" content="${origin}/assets/protolume-social-preview.png"><meta property="og:image:type" content="image/png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Strona | Protolume"><meta name="twitter:description" content="Opis Protolume"><meta name="twitter:image" content="${origin}/assets/protolume-social-preview.png"><meta name="robots" content="${robots}"><script type="application/ld+json">{"website":"${origin}#website","service":"${origin}#professional-service","name":"Protolume"}</script><body>Protolume${injectedText}</body>`,
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
