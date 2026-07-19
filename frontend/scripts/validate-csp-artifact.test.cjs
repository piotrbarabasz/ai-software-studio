const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { hashInlineScript } = require('./generate-nginx-security-headers.cjs');
const { validateCspArtifact } = require('./validate-csp-artifact.cjs');

function withArtifact(html, callback) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'protolume-csp-'));
  try {
    fs.writeFileSync(path.join(root, 'index.html'), html, 'utf8');
    callback(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function headersFor(jsonLd, overrides = '') {
  const hash = hashInlineScript(jsonLd);
  return `add_header Content-Security-Policy "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self' ${hash}; script-src-attr 'none'; style-src 'self' 'unsafe-inline'; ${overrides}" always;`;
}

test('accepts extracted CSS, hashed JSON-LD and Angular prerender styles', () => {
  const jsonLd = '{"@context":"https://schema.org"}';
  const html = `<link rel="stylesheet" href="styles.css"><style ng-app-id="ng">p{color:red}</style><script type="application/ld+json">${jsonLd}</script><script src="main.js" type="module"></script>`;

  withArtifact(html, (root) => {
    assert.deepEqual(validateCspArtifact(root, headersFor(jsonLd)), []);
  });
});

test('detects the former asynchronous stylesheet onload violation', () => {
  const jsonLd = '{}';
  const html = `<link rel="stylesheet" href="styles.css" media="print" onload="this.media='all'"><script type="application/ld+json">${jsonLd}</script>`;

  withArtifact(html, (root) => {
    assert.match(validateCspArtifact(root, headersFor(jsonLd)).join('\n'), /inline event handler/);
  });
});

test('detects unhashed inline scripts and rejects unsafe-inline in script-src', () => {
  const html = '<link rel="stylesheet" href="styles.css"><script>alert(1)</script>';
  const headers = `add_header Content-Security-Policy "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self' 'unsafe-inline'; script-src-attr 'none'; style-src 'self'" always;`;

  withArtifact(html, (root) => {
    const errors = validateCspArtifact(root, headers).join('\n');
    assert.match(errors, /must not contain 'unsafe-inline'/);
    assert.match(errors, /executable inline script is not allowed/);
  });
});

test('detects a missing JSON-LD hash and a fictitious reporting endpoint', () => {
  const jsonLd = '{"name":"Protolume"}';
  const headers = headersFor('{}', 'report-uri /csp-report;');

  withArtifact(
    `<link rel="stylesheet" href="styles.css"><script type="application/ld+json">${jsonLd}</script>`,
    (root) => {
      const errors = validateCspArtifact(root, headers).join('\n');
      assert.match(errors, /JSON-LD hash/);
      assert.match(errors, /unimplemented reporting endpoint/);
    },
  );
});

test('requires the narrow style exception when prerendered styles are inline', () => {
  const jsonLd = '{}';
  const headers = headersFor(jsonLd).replace(
    "style-src 'self' 'unsafe-inline'",
    "style-src 'self'",
  );

  withArtifact(
    `<link rel="stylesheet" href="styles.css"><style>p{color:red}</style><script type="application/ld+json">${jsonLd}</script>`,
    (root) => {
      assert.match(validateCspArtifact(root, headers).join('\n'), /prerender styles require/);
    },
  );
});
