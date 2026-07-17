const fs = require('node:fs');
const path = require('node:path');

const {
  PRODUCTION_MODE,
  parsePublicLegalConfig,
  validatePublicLegalConfig,
  formatValidationErrors,
} = require('./validate-public-legal-config.cjs');

const source = process.env.PUBLIC_LEGAL_CONFIG_JSON;
const outputPath = path.resolve(__dirname, '../.public-legal-config.json');

if (!source?.trim()) {
  throw new Error(
    'Brak PUBLIC_LEGAL_CONFIG_JSON. Cloud Build musi odczytać publiczną konfigurację prawną z Secret Managera podczas builda.',
  );
}

const configuration = parsePublicLegalConfig(source, 'PUBLIC_LEGAL_CONFIG_JSON');
const errors = validatePublicLegalConfig(configuration, { mode: PRODUCTION_MODE });
if (errors.length > 0) {
  throw new Error(
    `PUBLIC_LEGAL_CONFIG_JSON nie spełnia kontraktu produkcyjnego:\n${formatValidationErrors(errors)}`,
  );
}

fs.writeFileSync(outputPath, `${JSON.stringify(configuration, null, 2)}\n`, {
  encoding: 'utf8',
  mode: 0o600,
});
