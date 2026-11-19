import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateReleaseInputs, APPROVAL_PHRASE, PROJECT_ID } from '../scripts/gcp/landing_release_preflight.mjs';
import { verifyArtifact } from './verify-dist.mjs';

const repoFile = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('release guard is fail-closed by default and refuses trigger-based release', () => {
  assert.notEqual(validateReleaseInputs({}).length, 0);
  const valid = {
    DEPLOY_PROJECT_ID: PROJECT_ID,
    RELEASE_APPROVAL: APPROVAL_PHRASE,
    FORM_ENDPOINT: 'https://formspree.io/f/abcDEF123',
  };
  assert.deepEqual(validateReleaseInputs(valid), []);
  assert.ok(validateReleaseInputs({ ...valid, DEPLOY_PROJECT_ID: 'wrong-project' }).length);
  assert.ok(validateReleaseInputs({ ...valid, RELEASE_APPROVAL: 'NOT_APPROVED' }).length);
  assert.ok(validateReleaseInputs({ ...valid, FORM_ENDPOINT: 'https://wrong.example/f/abc' }).length);
  assert.ok(validateReleaseInputs({ ...valid, BUILD_TRIGGER_ID: 'some-trigger' }).length);
});

test('new Cloud Build configs do not alter the existing Cloud Run production pipeline', () => {
  const preview = repoFile('infra/gcp/cloudbuild.landing-preview.yaml');
  const release = repoFile('infra/gcp/cloudbuild.landing-release.yaml');
  const legacy = repoFile('infra/gcp/cloudbuild.deploy.yaml');
  assert.match(preview, /hosting:channel:deploy/);
  assert.match(preview, /--expires=7d/);
  assert.doesNotMatch(preview, /--only=hosting|firebase deploy|publish-firebase-live/);
  assert.match(release, /block-unapproved-live-release/);
  assert.match(release, /landing_release_preflight\.mjs/);
  assert.match(release, /verified-legal|validated-legal-config/);
  assert.match(release, /PUBLIC_LEGAL_CONFIG_JSON/);
  assert.match(release, /landing\/verify-dist\.mjs --production/);
  assert.match(release, /--only=hosting/);
  assert.match(legacy, /backend-deploy/);
  assert.match(legacy, /frontend-deploy/);
  assert.doesNotMatch(legacy, /cloudbuild\.landing-release/);
});

test('Firebase Hosting keeps legacy redirects but not the legal policy', () => {
  const config = JSON.parse(repoFile('firebase.json'));
  const redirects = config.hosting.redirects;
  assert.equal(config.hosting.public, 'landing/dist');
  assert.ok(redirects.some(x => x.source === '/kontakt' && x.destination === '/' && x.type === 301));
  assert.ok(!redirects.some(x => x.source.startsWith('/polityka-prywatnosci')));
  const headers = config.hosting.headers.flatMap(x => x.headers);
  assert.ok(headers.some(x => x.key === 'Content-Security-Policy' && x.value.includes('https://formspree.io')));
});

test('artifact verifier rejects incomplete or dangerously indexable preview', () => {
  const root = mkdtempSync(join(tmpdir(), 'protolume-verify-'));
  try {
    assert.ok(verifyArtifact('preview', root).length);
    mkdirSync(join(root, 'polityka-prywatnosci'), { recursive: true });
    mkdirSync(join(root, 'assets'), { recursive: true });
    for (const name of ['styles.css', 'form.js', 'assets/favicon.svg', 'assets/protolume-logo-horizontal-dark.svg']) {
      writeFileSync(join(root, name), '');
    }
    writeFileSync(join(root, 'sitemap.xml'), '<loc>https://protolume.pl/</loc>');
    writeFileSync(join(root, 'robots.txt'), 'User-agent: *\nAllow: /\n');
    writeFileSync(join(root, 'polityka-prywatnosci/index.html'), '<meta name="robots" content="index, follow">');
    writeFileSync(join(root, 'index.html'), '<h1>Hello</h1>');
    const errors = verifyArtifact('preview', root);
    assert.ok(errors.some(e => e.includes('indexable')));
    assert.ok(errors.some(e => e.includes('robots')));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
