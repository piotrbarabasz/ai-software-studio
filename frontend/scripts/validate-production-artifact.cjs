const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {
  PRODUCTION_MODE,
  readAndValidatePublicLegalConfig,
} = require('./validate-public-legal-config.cjs');

const DEFAULT_ARTIFACT_ROOT = path.resolve(__dirname, '../dist/aisoftware-studio/browser');
const PRIVACY_DOCUMENT = path.join('polityka-prywatnosci', 'index.html');
const TEXT_EXTENSIONS = new Set(['.css', '.html', '.js', '.json', '.mjs', '.txt', '.xml']);

const GLOBAL_FORBIDDEN_PATTERNS = [
  { label: 'Testowa 5', pattern: /Testowa\s+5/i },
  { label: 'znany testowy e-mail', pattern: /ai\.korepetycje3@gmail\.com/i },
  { label: 'WPISZ', pattern: /\bWPISZ\b/ },
  { label: 'LEGAL_REQUIRED', pattern: /LEGAL_REQUIRED/i },
];

const PRIVACY_FORBIDDEN_PATTERNS = [
  ...GLOBAL_FORBIDDEN_PATTERNS,
  { label: 'example', pattern: /\bexample\b/i },
  { label: 'sample/dummy/fixture', pattern: /\b(?:sample|dummy|fixture|configured)\b/i },
  { label: 'przykładowa wartość', pattern: /\bprzyk(?:ład|ladow)/i },
  { label: 'placeholder', pattern: /\bplaceholder\b/i },
  { label: 'testowa wartość', pattern: /\btestow(?:a|y|e|ego|ej|emu|ym|ych|ymi|ą)\b/i },
];

function listTextFiles(root) {
  const result = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const absolutePath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      result.push(...listTextFiles(absolutePath));
    } else if (TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      result.push(absolutePath);
    }
  }
  return result;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function configuredValues(configuration) {
  return [
    configuration.administrator.name,
    configuration.administrator.correspondenceAddress,
    ...Object.values(configuration.processing).flat(),
    configuration.updatedAt,
  ];
}

function scanProductionArtifact(artifactRoot, configuration) {
  const resolvedRoot = path.resolve(artifactRoot);
  if (!fs.existsSync(resolvedRoot) || !fs.statSync(resolvedRoot).isDirectory()) {
    throw new Error(`Nie znaleziono produkcyjnego artefaktu frontendu: ${resolvedRoot}`);
  }

  const privacyPath = path.join(resolvedRoot, PRIVACY_DOCUMENT);
  if (!fs.existsSync(privacyPath)) {
    throw new Error(`Brak prerenderowanej polityki prywatności: ${privacyPath}`);
  }

  const violations = [];
  for (const filePath of listTextFiles(resolvedRoot)) {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const forbidden of GLOBAL_FORBIDDEN_PATTERNS) {
      if (forbidden.pattern.test(content)) {
        violations.push(`${path.relative(resolvedRoot, filePath)}: ${forbidden.label}`);
      }
    }
  }

  const privacyDocument = fs.readFileSync(privacyPath, 'utf8');
  for (const forbidden of PRIVACY_FORBIDDEN_PATTERNS) {
    if (forbidden.pattern.test(privacyDocument)) {
      violations.push(`${PRIVACY_DOCUMENT}: ${forbidden.label}`);
    }
  }

  for (const value of configuredValues(configuration)) {
    const trimmedValue = value.trim();
    if (
      !privacyDocument.includes(trimmedValue) &&
      !privacyDocument.includes(escapeHtml(trimmedValue))
    ) {
      violations.push(
        `${PRIVACY_DOCUMENT}: brak wartości z konfiguracji produkcyjnej: ${JSON.stringify(trimmedValue)}`,
      );
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `Produkcyjny artefakt zawiera zabronione lub niespójne dane prawne:\n${violations
        .map((violation) => `- ${violation}`)
        .join('\n')}`,
    );
  }

  const digest = crypto.createHash('sha256').update(JSON.stringify(configuration)).digest('hex');
  fs.writeFileSync(path.join(resolvedRoot, '.legal-config-validated'), `${digest}\n`, 'utf8');
}

function main() {
  const configPath = process.env.PUBLIC_LEGAL_CONFIG_PATH;
  if (!configPath?.trim()) {
    throw new Error(
      'Brak PUBLIC_LEGAL_CONFIG_PATH. Kontrola artefaktu wymaga tej samej konfiguracji JSON co build.',
    );
  }

  const configuration = readAndValidatePublicLegalConfig(configPath, { mode: PRODUCTION_MODE });
  scanProductionArtifact(DEFAULT_ARTIFACT_ROOT, configuration);
  console.log('Produkcyjny artefakt nie zawiera zabronionych danych prawnych.');
}

if (require.main === module) {
  main();
}

module.exports = { scanProductionArtifact };
