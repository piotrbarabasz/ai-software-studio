const fs = require('node:fs');
const path = require('node:path');

const {
  PRODUCTION_MODE,
  parsePublicLegalConfig,
  readAndValidatePublicLegalConfig,
  validatePublicLegalConfig,
  formatValidationErrors,
} = require('./validate-public-legal-config.cjs');

const outputPath = path.resolve(
  __dirname,
  '../src/app/core/legal/public-legal.config.generated.ts',
);

function parseAndValidatePublicLegalConfig(source) {
  const configuration = parsePublicLegalConfig(source, 'Publiczna konfiguracja prawna');
  const errors = validatePublicLegalConfig(configuration, { mode: PRODUCTION_MODE });
  if (errors.length > 0) {
    throw new Error(
      `Nieprawidłowa publiczna konfiguracja prawna:\n${formatValidationErrors(errors)}`,
    );
  }
  return configuration;
}

function writeLegalConfigModule(configuration, mode, destination = outputPath) {
  const source = [
    "import type { PublicLegalConfiguration } from './public-legal.types';",
    '',
    `export const publicLegalConfigMode: 'production' | 'local-test' = ${JSON.stringify(mode)};`,
    '',
    `export const publicLegalConfig = ${JSON.stringify(configuration, null, 2)} as const satisfies PublicLegalConfiguration;`,
    '',
  ].join('\n');

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, source, 'utf8');
}

function main() {
  const inputPath = process.env.PUBLIC_LEGAL_CONFIG_PATH;
  if (!inputPath?.trim()) {
    throw new Error(
      'Brak PUBLIC_LEGAL_CONFIG_PATH. Produkcyjny build nie korzysta z konfiguracji lokalnej ani z fallbacku.',
    );
  }

  const configuration = readAndValidatePublicLegalConfig(inputPath, { mode: PRODUCTION_MODE });
  writeLegalConfigModule(configuration, PRODUCTION_MODE);
}

if (require.main === module) {
  main();
}

module.exports = {
  parseAndValidatePublicLegalConfig,
  writeLegalConfigModule,
};
