const assert = require('node:assert/strict');
const test = require('node:test');

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  collectInlineScriptHashes,
  hashInlineScript,
  renderSecurityHeaders,
} = require('./generate-nginx-security-headers.cjs');

const template = [
  'connect-src __CSP_CONNECT_SRC__;',
  'script-src __CSP_SCRIPT_HASHES__;',
  'add_header X-Robots-Tag "__ROBOTS_HEADER__" always;',
].join('\n');

function stripRobotsHeader(rendered) {
  return rendered.replace(/add_header X-Robots-Tag ".*?" always;\n?/, '');
}

test('restricts CSP connections to the configured API origin', () => {
  const rendered = renderSecurityHeaders(
    {
      apiUrl: 'https://api.site.invalid/v1/contact',
      indexingEnabled: true,
    },
    template,
    ["'sha256-inline-json-ld'"],
  );

  assert.match(rendered, /connect-src https:\/\/api\.site\.invalid;/);
  assert.match(rendered, /script-src 'sha256-inline-json-ld';/);
  assert.match(rendered, /X-Robots-Tag ""/);
});

test('adds a noindex response header for staging by default', () => {
  const rendered = renderSecurityHeaders(
    {
      apiUrl: 'https://api.preview.invalid',
      indexingEnabled: false,
    },
    template,
    ["'sha256-inline-json-ld'"],
  );

  assert.match(rendered, /X-Robots-Tag "noindex, follow"/);
});

test('leaves the production standard header file indexable while the 404 variant is noindex', () => {
  const environment = {
    apiUrl: 'https://api.site.invalid',
    indexingEnabled: true,
  };
  const rendered = renderSecurityHeaders(environment, template, ["'sha256-inline-json-ld'"]);
  const noindexRendered = renderSecurityHeaders(
    environment,
    template,
    ["'sha256-inline-json-ld'"],
    'noindex, follow',
  );

  assert.match(rendered, /X-Robots-Tag ""/);
  assert.match(noindexRendered, /X-Robots-Tag "noindex, follow"/);
  assert.equal(stripRobotsHeader(rendered), stripRobotsHeader(noindexRendered));
});

test('preview standard header file keeps noindex while the dedicated 404 variant also stays noindex', () => {
  const environment = {
    apiUrl: 'https://api.preview.invalid',
    indexingEnabled: false,
  };
  const rendered = renderSecurityHeaders(environment, template, ["'sha256-inline-json-ld'"]);
  const noindexRendered = renderSecurityHeaders(
    environment,
    template,
    ["'sha256-inline-json-ld'"],
    'noindex, follow',
  );

  assert.match(rendered, /X-Robots-Tag "noindex, follow"/);
  assert.match(noindexRendered, /X-Robots-Tag "noindex, follow"/);
  assert.equal(stripRobotsHeader(rendered), stripRobotsHeader(noindexRendered));
});

test('collects unique hashes for prerendered JSON-LD', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'protolume-csp-hashes-'));
  const nested = path.join(root, 'kontakt');
  fs.mkdirSync(nested);
  const jsonLd = '{"name":"Protolume"}';
  const document = `<script type="application/ld+json">${jsonLd}</script><script src="main.js"></script>`;
  fs.writeFileSync(path.join(root, 'index.html'), document, 'utf8');
  fs.writeFileSync(path.join(nested, 'index.html'), document, 'utf8');

  try {
    assert.deepEqual(collectInlineScriptHashes(root), [hashInlineScript(jsonLd)]);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('rejects executable inline scripts instead of authorizing them by hash', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'protolume-csp-script-'));
  fs.writeFileSync(path.join(root, 'index.html'), '<script>alert(1)</script>', 'utf8');

  try {
    assert.throws(() => collectInlineScriptHashes(root), /Niedozwolony skrypt inline/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
