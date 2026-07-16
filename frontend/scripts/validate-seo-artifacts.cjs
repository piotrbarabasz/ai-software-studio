const { loadEnvironment, validateSeoArtifacts } = require('./site-build-utils.cjs');

const mode = process.argv[2] === 'production' ? 'production' : 'development';
const errors = validateSeoArtifacts(loadEnvironment(mode), { production: mode === 'production' });

if (errors.length > 0) {
  console.error('Błąd artefaktów SEO:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
}
