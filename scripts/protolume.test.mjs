import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseEnv, validateConfig, buildGcloudArgs } from './protolume.mjs';

const valid = {
  GCP_PROJECT_ID: 'ai-software-studio-501918',
  GCP_ACCOUNT: 'kontakt@protolume.pl',
  GCP_REGION: 'europe-central2',
  CLOUD_RUN_PREVIEW_TAG: 'v3-review',
  FORM_ENDPOINT: '',
};

test('reads standard .env format and preserves quoted values', () => {
  const parsed = parseEnv([
    '# comment',
    'GCP_PROJECT_ID=ai-software-studio-501918',
    'GCP_ACCOUNT = kontakt@protolume.pl',
    'PUBLIC_LEGAL_CONFIG_PATH="C:\\Program Files\\Protolume\\legal.json"',
    'FORM_ENDPOINT=',
  ].join('\r\n'));
  assert.equal(parsed.GCP_PROJECT_ID, valid.GCP_PROJECT_ID);
  assert.equal(parsed.GCP_ACCOUNT, valid.GCP_ACCOUNT);
  assert.equal(parsed.PUBLIC_LEGAL_CONFIG_PATH, 'C:\\Program Files\\Protolume\\legal.json');
  assert.equal(parsed.FORM_ENDPOINT, '');
});

test('rejects ambiguous duplicate dotenv keys and malformed lines', () => {
  assert.throws(() => parseEnv('X=a\nX=b'), /Powtórzona/);
  assert.throws(() => parseEnv('no separator'), /Nieprawidłowa/);
  assert.throws(() => parseEnv('X="unterminated'), /Niedomknięty/);
});

test('preview command binds existing Cloud Run project and zero-traffic workflow', () => {
  assert.deepEqual(validateConfig(valid), []);
  const args = buildGcloudArgs('preview', valid);
  assert.ok(args.includes('--account=kontakt@protolume.pl'));
  assert.ok(args.includes('--project=ai-software-studio-501918'));
  assert.ok(args.includes('--config=infra/gcp/cloudbuild.landing-cloudrun-preview.yaml'));
  assert.ok(args.some((a) => a.includes('_PREVIEW_TAG=v3-review')));
  assert.ok(args.some((a) => a.includes('_REGION=europe-central2')));
  assert.ok(!args.some((a) => a.includes('landing-release')));
  assert.ok(!args.some((a) => a.includes('PUBLISH_PROTOLUME')));
});

test('invalid config is rejected instead of falling back to active Tripse account/project', () => {
  assert.ok(validateConfig({ ...valid, GCP_PROJECT_ID: 'tripse-ai', GCP_ACCOUNT: '' }).length);
  assert.ok(validateConfig({ ...valid, GCP_ACCOUNT: 'name & whoami' }).length);
  assert.ok(validateConfig({ ...valid, CLOUD_RUN_PREVIEW_TAG: 'preview & rm -rf' }).length);
  assert.throws(() => buildGcloudArgs('preview', { ...valid, GCP_PROJECT_ID: 'tripse-ai' }), /istniejącym projekcie/);
  assert.ok(validateConfig({ ...valid, FORM_ENDPOINT: 'http://formspree.io/f/test' }).length);
});

test('obsolete Firebase live command is hard-disabled', () => {
  assert.ok(validateConfig(valid, { release: true }).length);
  assert.throws(() => buildGcloudArgs('release', { ...valid, FORM_ENDPOINT: 'https://formspree.io/f/abcDEF123' }), /Brak ścieżki release/);
});

test('git ignores the real .env and tracks the .env.example template', () => {
  const ignore = readFileSync(new URL('../.gitignore', import.meta.url), 'utf8');
  const template = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
  assert.match(ignore, /^\.env$/m);
  assert.match(template, /GCP_ACCOUNT=kontakt@protolume\.pl/);
  assert.doesNotMatch(template, /password\s*=|secret\s*=|api_key\s*=/i);
});

test('Cloud Build staging explicitly excludes .env and generated legal files', () => {
  const ignore = readFileSync(new URL('../.gcloudignore', import.meta.url), 'utf8');
  assert.match(ignore, /#!include:\.gitignore/);
  assert.match(ignore, /^\.env$/m);
  assert.match(ignore, /^\.env\.\*$/m);
  assert.match(ignore, /frontend\/\.public-legal-config\.json/);
});
