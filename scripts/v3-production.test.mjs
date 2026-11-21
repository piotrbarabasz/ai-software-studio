import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateProductionEnvironment } from './gcp/v3_production_guard.mjs';

const file = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const accepted = {
  DEPLOY_PROJECT_ID: 'ai-software-studio-501918',
  DEPLOY_REGION: 'europe-central2',
  DEPLOY_FRONTEND_SERVICE: 'aisoftware-studio-web',
  DEPLOY_SITE_URL: 'https://protolume.pl',
  DEPLOY_INDEXING: 'true',
  DEPLOY_FORM_ENDPOINT: '/api/contact/brief',
  DEPLOY_BUILD_SHA: '9f1a7bb',
};

test('production guard refuses wrong routing, endpoint, indexing and build SHA', () => {
  assert.deepEqual(validateProductionEnvironment(accepted), []);
  for (const [key, value] of Object.entries({
    DEPLOY_PROJECT_ID: 'tripse-ai',
    DEPLOY_REGION: 'us-central1',
    DEPLOY_FRONTEND_SERVICE: 'another-service',
    DEPLOY_SITE_URL: 'http://protolume.pl',
    DEPLOY_INDEXING: 'false',
    DEPLOY_FORM_ENDPOINT: 'https://formspree.io/f/example',
    DEPLOY_BUILD_SHA: 'latest',
  })) {
    assert.ok(validateProductionEnvironment({ ...accepted, [key]: value }).length, key);
  }
  assert.ok(validateProductionEnvironment({}).length >= 5);
});

test('deploy-prod builds production static V3 from approved legal source', () => {
  const pipeline = file('infra/gcp/cloudbuild.deploy.yaml');
  const required = [
    'id: v3-production-preflight',
    'id: approved-legal-config',
    'id: v3-production-checks',
    'landing/build.mjs --production',
    'landing/verify-dist.mjs --production',
    'id: v3-production-image-build',
    'NGINX_CONFIG=landing/nginx.production.conf',
    'id: v3-production-image-smoke',
    'id: v3-production-deploy-zero-traffic',
    'id: v3-production-promote-traffic',
    'id: v3-production-live-smoke',
    '--no-traffic',
    'scripts/gcp/promote_angular_cloud_run.py',
    'scripts/gcp/smoke_v3_production.py',
    'PUBLIC_LEGAL_CONFIG_PATH=landing/.public-legal-config.json',
    'FORM_ENDPOINT=/api/contact/brief',
    'PUBLIC_BUILD_SHA=$SHORT_SHA',
  ];
  for (const item of required) assert.ok(pipeline.includes(item), item);
  assert.doesNotMatch(pipeline, /frontend\/Dockerfile|npm ci|firebase deploy|--allow-unauthenticated/);
  assert.doesNotMatch(pipeline, /id: backend-deploy|--set-secrets=SMTP_PASSWORD/);
});

test('preview Nginx stays noindex while public Nginx is indexable', () => {
  const preview = file('landing/nginx.cloudrun.conf');
  const prod = file('landing/nginx.production.conf');
  const docker = file('landing/Dockerfile.cloudrun');
  assert.match(preview, /X-Robots-Tag "noindex, nofollow" always/);
  assert.doesNotMatch(prod, /X-Robots-Tag.*noindex/);
  assert.match(prod, /connect-src 'self'; form-action 'self'/);
  assert.match(prod, /return 301/);
  assert.match(prod, /location = \/api\/contact\/brief/);
  assert.match(prod, /proxy_ssl_verify on/);
  assert.match(docker, /ARG NGINX_CONFIG=landing\/nginx\.cloudrun\.conf/);
  assert.match(docker, /COPY \$\{NGINX_CONFIG\}/);
});

test('master PR checks no longer run Angular and still validate the backend', () => {
  const pipeline = file('infra/gcp/cloudbuild.pr-checks.yaml');
  assert.match(pipeline, /id: backend-checks/);
  assert.match(pipeline, /python -m pytest/);
  assert.match(pipeline, /id: v3-static-checks/);
  assert.match(pipeline, /id: production-helper-tests/);
  assert.match(pipeline, /id: preview-traffic-guard-tests/);
  assert.doesNotMatch(pipeline, /npm ci|karma|cypress\/browsers/);
});

test('production and preview container smokes have different SEO and redirect expectations', () => {
  const prod = file('scripts/gcp/smoke-v3-production-image.sh');
  const preview = file('scripts/gcp/smoke-v3-preview-image.sh');
  assert.match(prod, /name="robots" content="index, follow"/);
  assert.match(prod, /Allow: \//);
  assert.match(prod, / = "301"/);
  assert.match(prod, /data-endpoint="\/api\/contact\/brief"/);
  assert.match(preview, /name="robots" content="noindex, nofollow"/);
  assert.match(preview, /Disallow: \//);
  assert.match(preview, / = "302"/);
});
