import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildGcloudArgs } from './protolume.mjs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

const env = {
  GCP_PROJECT_ID: 'ai-software-studio-501918',
  GCP_REGION: 'europe-central2',
  GCP_ACCOUNT: 'kontakt@protolume.pl',
  CLOUD_RUN_PREVIEW_TAG: 'v3-review',
};

test('manual pipeline deploys a tagged revision to the existing Cloud Run service with zero traffic', () => {
  const yaml = read('infra/gcp/cloudbuild.landing-cloudrun-preview.yaml');
  assert.match(yaml, /_PROJECT_ID: "ai-software-studio-501918"/);
  assert.match(yaml, /_FRONTEND_SERVICE: "aisoftware-studio-web"/);
  assert.match(yaml, /_REGION: "europe-central2"/);
  assert.match(yaml, /_PREVIEW_TAG: "v3-review"/);
  assert.match(yaml, /id: existing-service-baseline/);
  assert.match(yaml, /v3_cloudrun_preview_guard.py/);
  assert.match(yaml, /id: v3-preview-container-smoke/);
  assert.match(yaml, /id: v3-preview-deploy-zero-traffic/);
  assert.match(yaml, /--no-traffic/);
  assert.match(yaml, /"--tag=\$_PREVIEW_TAG"/);
  assert.match(yaml, /id: verify-live-traffic-unchanged/);
  assert.doesNotMatch(yaml, /--to-latest|--to-revisions|--allow-unauthenticated|--set-secrets|firebase deploy/);
  const positions = [
    'id: existing-service-baseline',
    'id: v3-preview-image-build',
    'id: v3-preview-container-smoke',
    'id: v3-preview-image-push',
    'id: v3-preview-deploy-zero-traffic',
    'id: verify-live-traffic-unchanged',
  ].map((word) => yaml.indexOf(word));
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
});

test('preview image serves previously verified artifacts; direct sending requires approved legal data', () => {
  const dockerfile = read('landing/Dockerfile.cloudrun');
  const nginx = read('landing/nginx.cloudrun.conf');
  const yaml = read('infra/gcp/cloudbuild.landing-cloudrun-preview.yaml');
  const ignore = read('.dockerignore');

  assert.match(dockerfile, /COPY landing\/dist\//);
  assert.doesNotMatch(dockerfile, /COPY frontend\/|--production|PUBLIC_LEGAL_CONFIG_PATH/);
  assert.match(dockerfile, /EXPOSE 8080/);
  assert.match(nginx, /X-Robots-Tag "noindex, nofollow" always/);
  assert.match(nginx, /connect-src 'self'/);
  assert.match(nginx, /location = \/api\/contact\/brief/);
  assert.match(nginx, /limit_except POST/);
  assert.match(nginx, /proxy_ssl_verify on/);
  assert.match(nginx, /proxy_pass https:\/\/aisoftware-studio-api-175725977490\.europe-central2\.run\.app/);
  assert.match(nginx, /form-action 'self' https:\/\/formspree\.io/);
  assert.doesNotMatch(nginx, /form-action [^;]*mailto:/);
  assert.match(nginx, /location = \/polityka-prywatnosci/);
  assert.match(nginx, /location \^~ \/polityka-prywatnosci\//);
  assert.match(nginx, /return 302 \/;/);
  assert.doesNotMatch(nginx, /fastcgi_pass|proxy_pass \$|proxy_pass http:\/\//);
  assert.match(ignore, /^!landing\/dist\/\*\*$/m);
  assert.match(ignore, /^\*\*\/\.public-legal-config\.json$/m);

  assert.match(yaml, /_FORM_ENDPOINT: "\/api\/contact\/brief"/);
  assert.match(yaml, /id: prepare-preview-contact/);
  assert.match(yaml, /secrets versions access latest/);
  assert.match(yaml, /aisoftware-studio-public-legal-config/);
  assert.match(yaml, /PUBLIC_LEGAL_CONFIG_PATH=frontend\/\.public-legal-config\.json/);
  assert.match(yaml, /node landing\/verify-dist\.mjs --preview/);
  assert.match(yaml, /--no-traffic/);
});

test('deploy-prod uses production V3 Nginx while manual preview remains isolated', () => {
  const production = read('infra/gcp/cloudbuild.deploy.yaml');
  const preview = read('infra/gcp/cloudbuild.landing-cloudrun-preview.yaml');
  const prodNginx = read('landing/nginx.production.conf');
  const previewNginx = read('landing/nginx.cloudrun.conf');
  const dockerfile = read('landing/Dockerfile.cloudrun');
  assert.match(production, /NGINX_CONFIG=landing\/nginx\.production\.conf/);
  assert.match(production, /node landing\/build\.mjs --production/);
  assert.match(production, /--no-traffic/);
  assert.match(preview, /--no-traffic/);
  assert.match(previewNginx, /X-Robots-Tag "noindex, nofollow"/);
  assert.doesNotMatch(prodNginx, /X-Robots-Tag "noindex, nofollow"/);
  assert.match(prodNginx, /return 301/);
  assert.match(prodNginx, /location = \/api\/contact\/brief/);
  assert.match(dockerfile, /ARG NGINX_CONFIG=landing\/nginx\.cloudrun\.conf/);
});

test('local Make preview now targets Cloud Run and obsolete Firebase release is disabled', () => {
  const args = buildGcloudArgs('preview', env);
  assert.ok(args.includes('--config=infra/gcp/cloudbuild.landing-cloudrun-preview.yaml'));
  assert.ok(args.some((value) => value.includes('_PREVIEW_TAG=v3-review')));
  assert.ok(!args.some((value) => value.includes('landing-preview.yaml')));
  assert.throws(() => buildGcloudArgs('release', env), /Brak ścieżki release/);
  const backend = buildGcloudArgs('preview', {
    ...env,
    FORM_ENDPOINT: '/api/contact/brief',
  });
  assert.ok(backend.some((value) => value.includes('_FORM_ENDPOINT=/api/contact/brief')));
  const configured = buildGcloudArgs('preview', {
    ...env,
    FORM_ENDPOINT: 'https://formspree.io/f/abcDEF123',
  });
  assert.ok(configured.some((value) => value.includes('_FORM_ENDPOINT=https://formspree.io/f/abcDEF123')));
  assert.ok(!args.some((value) => value.includes('_FORM_ENDPOINT=')));

  const source = read('scripts/protolume.mjs');
  assert.match(source, /Release Cloud Run v3 jest obecnie ZABLOKOWANY/);
  const template = read('.env.example');
  assert.match(template, /CLOUD_RUN_PREVIEW_TAG=v3-review/);
  assert.doesNotMatch(template, /^FIREBASE_PREVIEW_CHANNEL=/m);
});

test('smoke verifies container HTTP behavior including 404, privacy and nonindexing', () => {
  const smoke = read('scripts/gcp/smoke-v3-preview-image.sh');
  assert.match(smoke, /X-Robots-Tag: noindex, nofollow/);
  assert.match(smoke, /data-endpoint=""/);
  assert.match(smoke, /polityka-prywatnosci/);
  assert.match(smoke, /robots\.txt/);
  assert.match(smoke, /\[ "\$\(status "\$work_dir\/missing.headers"\)" = "404" \]/);
});
