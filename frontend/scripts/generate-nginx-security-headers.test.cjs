const assert = require('node:assert/strict');
const test = require('node:test');

const { renderSecurityHeaders } = require('./generate-nginx-security-headers.cjs');

const template = [
  'connect-src __CSP_CONNECT_SRC__;',
  'add_header X-Robots-Tag "__ROBOTS_HEADER__" always;',
].join('\n');

test('restricts CSP connections to the configured API origin', () => {
  const rendered = renderSecurityHeaders(
    {
      apiUrl: 'https://api.site.invalid/v1/contact',
      indexingEnabled: true,
    },
    template,
  );

  assert.match(rendered, /connect-src https:\/\/api\.site\.invalid;/);
  assert.match(rendered, /X-Robots-Tag ""/);
});

test('adds a noindex response header for staging by default', () => {
  const rendered = renderSecurityHeaders(
    {
      apiUrl: 'https://api.preview.invalid',
      indexingEnabled: false,
    },
    template,
  );

  assert.match(rendered, /X-Robots-Tag "noindex, follow"/);
});
