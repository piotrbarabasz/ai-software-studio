const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repositoryRoot = path.resolve(__dirname, '../..');

function readConfig(name) {
  return fs.readFileSync(path.join(repositoryRoot, 'infra/gcp', name), 'utf8');
}

test('production Cloud Build uses Protolume for frontend SEO and backend CORS', () => {
  const deploy = readConfig('cloudbuild.deploy.yaml');

  assert.match(deploy, /^  _PUBLIC_SITE_URL: "https:\/\/protolume\.pl"$/m);
  assert.match(deploy, /^  _PUBLIC_SITE_INDEXING: "false"$/m);
  assert.match(deploy, /CORS_ALLOWED_ORIGINS=\$_PUBLIC_SITE_URL/);
  assert.match(deploy, /PUBLIC_SITE_URL=\$_PUBLIC_SITE_URL/);
  assert.match(deploy, /PUBLIC_SITE_INDEXING=\$_PUBLIC_SITE_INDEXING/);
  assert.doesNotMatch(deploy, /^  _PUBLIC_SITE_INDEXING: "true"$/m);
});

test('manual frontend and backend builds keep the same production origin policy', () => {
  const frontend = readConfig('cloudbuild.frontend.yaml');
  const backend = readConfig('cloudbuild.backend.yaml');

  assert.match(frontend, /^  _PUBLIC_SITE_URL: "https:\/\/protolume\.pl"$/m);
  assert.match(frontend, /^  _PUBLIC_SITE_INDEXING: "false"$/m);
  assert.match(backend, /^  _CORS_ALLOWED_ORIGINS: "https:\/\/protolume\.pl"$/m);
  assert.doesNotMatch(backend, /www\.protolume|protolume\.com/);
});
