const { loadEnvironment, validateProductionSiteConfig } = require('./site-build-utils.cjs');

const errors = validateProductionSiteConfig(loadEnvironment('production'));

if (errors.length > 0) {
  console.error('Błąd publicznej konfiguracji produkcyjnej. Uzupełnij pola w:');
  console.error('src/environments/environment.prod.ts');
  errors.forEach((field) => console.error(`- ${field}`));
  process.exitCode = 1;
}
