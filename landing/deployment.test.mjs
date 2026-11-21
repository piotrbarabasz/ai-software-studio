import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { verifyArtifact } from './verify-dist.mjs';

const repoFile = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('deploy-prod permanently builds V3 production, not the old Angular frontend', () => {
  const production = repoFile('infra/gcp/cloudbuild.deploy.yaml');
  assert.match(production, /id: v3-production-preflight/);
  assert.match(production, /id: approved-legal-config/);
  assert.match(production, /id: v3-production-checks/);
  assert.match(production, /landing\/build\.mjs --production/);
  assert.match(production, /landing\/verify-dist\.mjs --production/);
  assert.match(production, /landing\/Dockerfile\.cloudrun/);
  assert.match(production, /NGINX_CONFIG=landing\/nginx\.production\.conf/);
  assert.match(production, /id: v3-production-image-smoke/);
  assert.match(production, /id: v3-production-deploy-zero-traffic/);
  assert.match(production, /id: v3-production-promote-traffic/);
  assert.match(production, /id: v3-production-live-smoke/);
  assert.match(production, /--no-traffic/);
  assert.doesNotMatch(production, /frontend\/Dockerfile|npm ci|--allow-unauthenticated|firebase deploy/);
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
