const fs = require('node:fs');
const path = require('node:path');

const source = process.env.PUBLIC_LEGAL_CONFIG_JSON;
const outputPath = path.resolve(__dirname, '../.public-legal-config.json');

if (!source?.trim()) {
  throw new Error(
    'Brak PUBLIC_LEGAL_CONFIG_JSON. Cloud Build musi przekazać zweryfikowaną publiczną konfigurację prawną.',
  );
}

try {
  const configuration = JSON.parse(source);
  if (!configuration || typeof configuration !== 'object' || Array.isArray(configuration)) {
    throw new Error('PUBLIC_LEGAL_CONFIG_JSON musi być obiektem JSON.');
  }
  fs.writeFileSync(outputPath, `${JSON.stringify(configuration, null, 2)}\n`, 'utf8');
} catch (error) {
  if (error instanceof Error && error.message.includes('musi być obiektem')) {
    throw error;
  }
  throw new Error('PUBLIC_LEGAL_CONFIG_JSON musi być poprawnym obiektem JSON.');
}
