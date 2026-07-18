const fs = require('node:fs');
const path = require('node:path');

function productionEnvironment(source = process.env) {
  const apiUrl = source.API_URL ?? '__PUBLIC_CONFIG_REQUIRED__:apiUrl';
  const publicSiteUrl = source.PUBLIC_SITE_URL ?? '__PUBLIC_CONFIG_REQUIRED__:publicSiteUrl';
  const rawIndexingEnabled = source.PUBLIC_SITE_INDEXING ?? 'false';
  const publicSalesEmail =
    source.PUBLIC_SALES_EMAIL ?? '__PUBLIC_CONFIG_REQUIRED__:publicSalesEmail';
  const publicPrivacyEmail =
    source.PUBLIC_PRIVACY_EMAIL ?? '__PUBLIC_CONFIG_REQUIRED__:publicPrivacyEmail';
  if (!['true', 'false'].includes(rawIndexingEnabled)) {
    throw new Error('PUBLIC_SITE_INDEXING musi mieć wartość true albo false.');
  }

  return {
    production: true,
    apiUrl,
    publicSiteUrl,
    indexingEnabled: rawIndexingEnabled === 'true',
    publicSalesEmail,
    publicPrivacyEmail,
  };
}

function writeProductionEnvironment(source = process.env) {
  const outputPath = path.resolve(__dirname, '../src/environments/environment.prod.ts');
  fs.writeFileSync(
    outputPath,
    `export const environment = ${JSON.stringify(productionEnvironment(source), null, 2)} as const;\n`,
    'utf8',
  );
}

if (require.main === module) {
  writeProductionEnvironment();
}

module.exports = { productionEnvironment, writeProductionEnvironment };
