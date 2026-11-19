import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseEnv, validateConfig, buildGcloudArgs } from './protolume.mjs';

const valid = {
  GCP_PROJECT_ID: 'ai-software-studio-501918',
  GCP_ACCOUNT: 'kontakt@protolume.pl',
  GCP_REGION: 'europe-central2',
  FIREBASE_PREVIEW_CHANNEL: 'protolume-v3-review',
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

test('preview command binds Protolume account, project and channel explicitly', () => {
  assert.deepEqual(validateConfig(valid), []);
  const args = buildGcloudArgs('preview', valid);
  assert.ok(args.includes('--account=kontakt@protolume.pl'));
  assert.ok(args.includes('--project=ai-software-studio-501918'));
  assert.ok(args.includes('--config=infra/gcp/cloudbuild.landing-preview.yaml'));
  assert.ok(args.some((a) => a.includes('_CHANNEL_ID=protolume-v3-review')));
  assert.ok(!args.some((a) => a.includes('landing-release')));
  assert.ok(!args.some((a) => a.includes('PUBLISH_PROTOLUME')));
});

test('invalid config is rejected instead of falling back to active Tripse account/project', () => {
  assert.ok(validateConfig({ ...valid, GCP_PROJECT_ID: 'tripse-ai', GCP_ACCOUNT: '' }).length);
  assert.ok(validateConfig({ ...valid, GCP_ACCOUNT: 'name & whoami' }).length);
  assert.ok(validateConfig({ ...valid, FIREBASE_PREVIEW_CHANNEL: 'preview & rm -rf' }).length);
  assert.ok(validateConfig({ ...valid, FORM_ENDPOINT: 'http://formspree.io/f/test' }).length);
});

test('live command requires form endpoint and preserves separate approval gate', () => {
  assert.ok(validateConfig(valid, { release: true }).length);
  assert.throws(() => buildGcloudArgs('release', valid), /FORM_ENDPOINT/);
  const args = buildGcloudArgs('release', {
    ...valid, FORM_ENDPOINT: 'https://formspree.io/f/abcDEF123',
  });
  assert.ok(args.includes('--config=infra/gcp/cloudbuild.landing-release.yaml'));
  assert.ok(args.some((a) => a.includes('_RELEASE_APPROVAL=PUBLISH_PROTOLUME_V3_LIVE')));
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
