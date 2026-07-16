const fs = require('node:fs');
const path = require('node:path');

const { validatePublicLegalConfig } = require('./validate-public-legal-config.cjs');

const inputPath = path.resolve(__dirname, '../.public-legal-config.json');
const outputPath = path.resolve(__dirname, '../src/app/core/legal/public-legal.config.ts');

function parseAndValidatePublicLegalConfig(source) {
  let configuration;

  try {
    configuration = JSON.parse(source);
  } catch {
    throw new Error('.public-legal-config.json musi zawierać poprawny obiekt JSON.');
  }

  const errors = validatePublicLegalConfig(configuration);
  if (errors.length > 0) {
    throw new Error(
      `Niepełna publiczna konfiguracja prawna:\n${errors.map((field) => `- ${field}`).join('\n')}`,
    );
  }

  return configuration;
}

function writeProductionLegalConfig(configuration, destination = outputPath) {
  const source = [
    "import type { PublicLegalConfiguration } from './public-legal.types';",
    '',
    `export const publicLegalConfig = ${JSON.stringify(configuration, null, 2)} as const satisfies PublicLegalConfiguration;`,
    '',
  ].join('\n');

  fs.writeFileSync(destination, source, 'utf8');
}

function main() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(
      'Brak .public-legal-config.json. Cloud Build musi przygotować go z PUBLIC_LEGAL_CONFIG_JSON.',
    );
  }

  writeProductionLegalConfig(parseAndValidatePublicLegalConfig(fs.readFileSync(inputPath, 'utf8')));
}

if (require.main === module) {
  main();
}

module.exports = { parseAndValidatePublicLegalConfig, writeProductionLegalConfig };
