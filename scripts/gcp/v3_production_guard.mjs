#!/usr/bin/env node
// Fail closed before any production V3 image is created or traffic is touched.
export function validateProductionEnvironment(env) {
  const errors = [];
  if (env.DEPLOY_PROJECT_ID !== 'ai-software-studio-501918')
    errors.push('Production project mismatch');
  if (env.DEPLOY_REGION !== 'europe-central2')
    errors.push('Production region mismatch');
  if (env.DEPLOY_FRONTEND_SERVICE !== 'aisoftware-studio-web')
    errors.push('Production Cloud Run service mismatch');
  if (env.DEPLOY_SITE_URL !== 'https://protolume.pl')
    errors.push('Production domain mismatch');
  if (env.DEPLOY_INDEXING !== 'true')
    errors.push('Production indexing must be enabled');
  if (env.DEPLOY_FORM_ENDPOINT !== '/api/contact/brief')
    errors.push('Production form must reuse the existing same-origin FastAPI');
  if (!/^[0-9a-f]{7,40}$/.test(env.DEPLOY_BUILD_SHA || ''))
    errors.push('A verified commit SHA is required');
  return errors;
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  const errors = validateProductionEnvironment(process.env);
  if (errors.length) {
    console.error('BLOCKED: unsafe Protolume V3 production configuration: ' + errors.join('; '));
    process.exitCode = 1;
  } else {
    console.log('PASS: production V3 target, indexing, contact route and build SHA verified.');
  }
}
