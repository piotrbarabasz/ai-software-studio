const fs = require('node:fs');
const path = require('node:path');

const apiUrl = process.env.API_URL ?? '__PUBLIC_CONFIG_REQUIRED__:apiUrl';
const publicSiteOrigin =
  process.env.PUBLIC_SITE_ORIGIN ?? '__PUBLIC_CONFIG_REQUIRED__:publicSiteOrigin';
const outputPath = path.resolve(__dirname, '../src/environments/environment.prod.ts');

fs.writeFileSync(
  outputPath,
  `export const environment = ${JSON.stringify(
    { production: true, apiUrl, publicSiteOrigin },
    null,
    2,
  )} as const;\n`,
  'utf8',
);
