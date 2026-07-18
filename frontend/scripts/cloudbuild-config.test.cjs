const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repositoryRoot = path.resolve(__dirname, '../..');

function readConfig(name) {
  return fs.readFileSync(path.join(repositoryRoot, 'infra/gcp', name), 'utf8');
}

function readContract() {
  return JSON.parse(
    fs.readFileSync(path.join(repositoryRoot, 'infra/gcp/production-contract.json'), 'utf8'),
  );
}

test('production contract owns the frontend origin, CORS and indexing invariants', () => {
  const contract = readContract();
  const deploy = readConfig('cloudbuild.deploy.yaml');

  assert.equal(contract.schema_version, 1);
  assert.equal(contract.invariants.PUBLIC_SITE_URL, 'https://protolume.pl');
  assert.equal(contract.invariants.CORS_ALLOWED_ORIGINS, 'https://protolume.pl');
  assert.equal(contract.invariants.PUBLIC_SITE_INDEXING, 'false');
  assert.match(deploy, /DEPLOY_CORS_ALLOWED_ORIGINS=\$_PUBLIC_SITE_URL/);
  assert.match(deploy, /PUBLIC_SITE_URL=\$_PUBLIC_SITE_URL/);
  assert.match(deploy, /PUBLIC_SITE_INDEXING=\$_PUBLIC_SITE_INDEXING/);
  assert.doesNotMatch(deploy, /manual-local/);
});

test('all deployment configs invoke a real preflight before building', () => {
  const deploy = readConfig('cloudbuild.deploy.yaml');
  const frontend = readConfig('cloudbuild.frontend.yaml');
  const backend = readConfig('cloudbuild.backend.yaml');

  assert.match(deploy, /deployment-contract-preflight/);
  assert.match(frontend, /manual-frontend-preflight/);
  assert.match(backend, /manual-backend-preflight/);
  assert.match(frontend, /deployment_contract\.py/);
  assert.match(backend, /deployment_contract\.py/);
  assert.doesNotMatch(`${deploy}${frontend}${backend}`, /manual-local/);
});
