const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const DEFAULT_CONFIG_PATH = path.resolve(__dirname, '../src/app/core/legal/public-legal.config.ts');
const PLACEHOLDER_PATTERN = /__LEGAL_REQUIRED__:/;

function loadPublicLegalConfig(configPath = DEFAULT_CONFIG_PATH) {
  const source = fs.readFileSync(configPath, 'utf8');
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: configPath,
    reportDiagnostics: true,
  });

  if (result.diagnostics?.length) {
    throw new Error(`Nie można odczytać konfiguracji danych prawnych: ${configPath}`);
  }

  const module = { exports: {} };
  vm.runInNewContext(
    result.outputText,
    { module, exports: module.exports },
    { filename: configPath },
  );

  return module.exports.publicLegalConfig;
}

function validateText(value, fieldPath, errors) {
  if (typeof value !== 'string' || !value.trim() || PLACEHOLDER_PATTERN.test(value)) {
    errors.push(fieldPath);
  }
}

function validateList(value, fieldPath, errors) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(fieldPath);
    return;
  }

  value.forEach((item, index) => validateText(item, `${fieldPath}[${index}]`, errors));
}

function validatePublicLegalConfig(config) {
  const errors = [];
  const administrator = config?.administrator;
  const processing = config?.processing;

  validateText(administrator?.name, 'administrator.name', errors);
  validateText(administrator?.correspondenceAddress, 'administrator.correspondenceAddress', errors);
  validateText(administrator?.privacyContact, 'administrator.privacyContact', errors);
  validateList(processing?.purposes, 'processing.purposes', errors);
  validateList(processing?.legalBases, 'processing.legalBases', errors);
  validateList(processing?.retention, 'processing.retention', errors);
  validateList(processing?.recipients, 'processing.recipients', errors);
  validateList(processing?.infrastructureProviders, 'processing.infrastructureProviders', errors);
  validateList(processing?.emailProviders, 'processing.emailProviders', errors);
  validateList(processing?.dataSubjectRights, 'processing.dataSubjectRights', errors);
  validateText(config?.updatedAt, 'updatedAt', errors);

  return errors;
}

function main() {
  const errors = validatePublicLegalConfig(loadPublicLegalConfig());

  if (errors.length > 0) {
    console.error('Błąd konfiguracji danych prawnych. Uzupełnij pola w:');
    console.error('src/app/core/legal/public-legal.config.ts');
    errors.forEach((fieldPath) => console.error(`- ${fieldPath}`));
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = { loadPublicLegalConfig, validatePublicLegalConfig };
