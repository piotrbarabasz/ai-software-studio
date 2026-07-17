const fs = require('node:fs');
const path = require('node:path');

const PRODUCTION_MODE = 'production';
const LOCAL_TEST_MODE = 'local-test';

const REQUIRED_SHAPE = {
  administrator: ['name', 'correspondenceAddress', 'privacyContact'],
  processing: [
    'purposes',
    'legalBases',
    'retention',
    'recipients',
    'infrastructureProviders',
    'emailProviders',
    'dataSubjectRights',
  ],
};

const FORBIDDEN_VALUE_PATTERNS = [
  { label: 'LEGAL_REQUIRED', pattern: /LEGAL_REQUIRED/i },
  { label: 'WPISZ', pattern: /\bwpisz\b/i },
  { label: 'example', pattern: /\bexample\b/i },
  { label: 'sample/dummy/fixture', pattern: /\b(?:sample|dummy|fixture|configured)\b/i },
  { label: 'przykładowa wartość', pattern: /\bprzyk(?:ład|ladow)/i },
  { label: 'placeholder', pattern: /\bplaceholder\b/i },
  { label: 'TODO/TBD', pattern: /\b(?:todo|tbd)\b/i },
  { label: 'uzupełnij', pattern: /\buzupełnij\b/i },
  { label: 'wartość testowa', pattern: /\btestow(?:a|y|e|ego|ej|emu|ym|ych|ymi|ą)\b/i },
  { label: 'znacznik w nawiasach ostrych', pattern: /<[^<>]+>/ },
  { label: 'znany testowy e-mail', pattern: /ai\.korepetycje3@gmail\.com/i },
];

const EMAIL_PATTERN = /^[^\s@]+@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,63}$/i;

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function addError(errors, pathName, code, message) {
  errors.push({ path: pathName, code, message });
}

function validateObject(value, pathName, allowedKeys, errors) {
  if (!isPlainObject(value)) {
    addError(errors, pathName, 'type', 'wymagany jest obiekt');
    return false;
  }

  for (const key of Object.keys(value)) {
    if (!allowedKeys.includes(key)) {
      addError(errors, `${pathName}.${key}`, 'unknown', 'pole nie należy do kontraktu');
    }
  }

  return true;
}

function findForbiddenValue(value) {
  return FORBIDDEN_VALUE_PATTERNS.find(({ pattern }) => pattern.test(value));
}

function validateText(value, fieldPath, errors, mode) {
  if (typeof value !== 'string') {
    addError(errors, fieldPath, 'type', 'wymagany jest tekst');
    return;
  }

  const normalized = value.trim();
  if (!normalized) {
    addError(errors, fieldPath, 'empty', 'wartość nie może być pusta');
    return;
  }

  if (mode === PRODUCTION_MODE) {
    const forbidden = findForbiddenValue(normalized);
    if (forbidden) {
      addError(
        errors,
        fieldPath,
        'placeholder',
        `wartość zawiera zabroniony placeholder: ${forbidden.label}`,
      );
    }
  }
}

function validateList(value, fieldPath, errors, mode) {
  if (!Array.isArray(value) || value.length === 0) {
    addError(errors, fieldPath, 'list', 'wymagana jest niepusta lista');
    return;
  }

  value.forEach((item, index) => validateText(item, `${fieldPath}[${index}]`, errors, mode));
}

function validatePublicLegalConfig(config, options = {}) {
  const mode = options.mode ?? PRODUCTION_MODE;
  if (![PRODUCTION_MODE, LOCAL_TEST_MODE].includes(mode)) {
    throw new Error(`Nieobsługiwany tryb walidacji konfiguracji prawnej: ${mode}`);
  }

  const errors = [];
  if (!validateObject(config, '$', ['administrator', 'processing', 'updatedAt'], errors)) {
    return errors;
  }

  const administratorValid = validateObject(
    config.administrator,
    'administrator',
    REQUIRED_SHAPE.administrator,
    errors,
  );
  const processingValid = validateObject(
    config.processing,
    'processing',
    REQUIRED_SHAPE.processing,
    errors,
  );

  if (administratorValid) {
    validateText(config.administrator.name, 'administrator.name', errors, mode);
    validateText(
      config.administrator.correspondenceAddress,
      'administrator.correspondenceAddress',
      errors,
      mode,
    );
    validateText(config.administrator.privacyContact, 'administrator.privacyContact', errors, mode);

    if (
      typeof config.administrator.privacyContact === 'string' &&
      config.administrator.privacyContact.trim() &&
      !EMAIL_PATTERN.test(config.administrator.privacyContact.trim())
    ) {
      addError(
        errors,
        'administrator.privacyContact',
        'email',
        'wymagany jest poprawny adres e-mail',
      );
    }

    if (
      mode === PRODUCTION_MODE &&
      typeof config.administrator.name === 'string' &&
      config.administrator.name.trim().toLocaleLowerCase('pl-PL') === 'ai software studio'
    ) {
      addError(
        errors,
        'administrator.name',
        'incomplete',
        'sama nazwa marki „AI Software Studio” nie potwierdza pełnej nazwy administratora',
      );
    }
  }

  if (processingValid) {
    for (const fieldName of REQUIRED_SHAPE.processing) {
      validateList(config.processing[fieldName], `processing.${fieldName}`, errors, mode);
    }
  }

  validateText(config.updatedAt, 'updatedAt', errors, mode);
  if (
    typeof config.updatedAt === 'string' &&
    config.updatedAt.trim() &&
    !/^\d{4}-\d{2}-\d{2}$/.test(config.updatedAt.trim())
  ) {
    addError(errors, 'updatedAt', 'date', 'wymagany jest format daty RRRR-MM-DD');
  }

  return errors;
}

function parsePublicLegalConfig(source, sourceLabel = 'konfiguracja prawna') {
  let configuration;
  try {
    configuration = JSON.parse(source);
  } catch {
    throw new Error(`${sourceLabel} musi zawierać poprawny obiekt JSON.`);
  }

  if (!isPlainObject(configuration)) {
    throw new Error(`${sourceLabel} musi zawierać obiekt JSON.`);
  }

  return configuration;
}

function formatValidationErrors(errors) {
  return errors.map((error) => `- ${error.path}: ${error.message}`).join('\n');
}

function readAndValidatePublicLegalConfig(configPath, options = {}) {
  const resolvedPath = path.resolve(configPath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Nie znaleziono pliku publicznej konfiguracji prawnej: ${resolvedPath}`);
  }

  const configuration = parsePublicLegalConfig(fs.readFileSync(resolvedPath, 'utf8'), resolvedPath);
  const errors = validatePublicLegalConfig(configuration, options);
  if (errors.length > 0) {
    throw new Error(
      `Nieprawidłowa publiczna konfiguracja prawna:\n${formatValidationErrors(errors)}`,
    );
  }

  return configuration;
}

function main() {
  const configPath = process.env.PUBLIC_LEGAL_CONFIG_PATH;
  if (!configPath?.trim()) {
    throw new Error(
      'Brak PUBLIC_LEGAL_CONFIG_PATH. Produkcyjna walidacja wymaga jawnej ścieżki do zweryfikowanego pliku JSON.',
    );
  }

  readAndValidatePublicLegalConfig(configPath, { mode: PRODUCTION_MODE });
  console.log('Publiczna konfiguracja prawna jest poprawna dla trybu produkcyjnego.');
}

if (require.main === module) {
  main();
}

module.exports = {
  LOCAL_TEST_MODE,
  PRODUCTION_MODE,
  formatValidationErrors,
  parsePublicLegalConfig,
  readAndValidatePublicLegalConfig,
  validatePublicLegalConfig,
};
