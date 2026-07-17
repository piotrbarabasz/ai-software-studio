const fs = require('node:fs');
const path = require('node:path');

const { generatedDirectory, loadEnvironment } = require('./site-build-utils.cjs');

const TEMPLATE_PATH = path.resolve(__dirname, '../nginx-security-headers.conf');
const OUTPUT_PATH = path.join(generatedDirectory(), 'nginx-security-headers.conf');

function renderSecurityHeaders(environment, template) {
  const apiOrigin = new URL(environment.apiUrl).origin;
  const robotsHeader = environment.indexingEnabled ? '' : 'noindex, follow';

  return template
    .replaceAll('__CSP_CONNECT_SRC__', apiOrigin)
    .replaceAll('__ROBOTS_HEADER__', robotsHeader);
}

function writeSecurityHeaders(environment = loadEnvironment('production')) {
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const rendered = renderSecurityHeaders(environment, template);

  if (/__[A-Z0-9_]+__/.test(rendered)) {
    throw new Error('Wygenerowane nagłówki Nginx nadal zawierają placeholder.');
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, rendered, 'utf8');
}

if (require.main === module) {
  writeSecurityHeaders();
}

module.exports = { renderSecurityHeaders, writeSecurityHeaders };
