// Explicit approval for a separate, manual production pipeline. Never used by PR/preview builds.
export const PROJECT_ID = 'ai-software-studio-501918';
export const APPROVAL_PHRASE = 'PUBLISH_PROTOLUME_V3_LIVE';

export function validateReleaseInputs(env) {
  const errors = [];
  if (env.DEPLOY_PROJECT_ID !== PROJECT_ID) {
    errors.push('Deployment project must be the verified Protolume GCP project.');
  }
  if (env.RELEASE_APPROVAL !== APPROVAL_PHRASE) {
    errors.push('Explicit manual release approval is missing.');
  }
  if (!/^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(env.FORM_ENDPOINT || '')) {
    errors.push('Configured Formspree HTTPS endpoint is required.');
  }
  // A Cloud Build trigger must never accidentally make this a prod deploy.
  if (env.BUILD_TRIGGER_ID || env.TRIGGER_NAME) {
    errors.push('This release pipeline must be run manually, not from a build trigger.');
  }
  return errors;
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  const errors = validateReleaseInputs(process.env);
  if (errors.length) {
    console.error('Blocked Protolume v3 production release:\n' + errors.map((s) => '- ' + s).join('\n'));
    process.exitCode = 1;
  } else {
    console.log('Manual release guard passed. Legal and site validation still required.');
  }
}
