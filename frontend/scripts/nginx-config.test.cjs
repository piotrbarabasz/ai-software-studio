const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

function balancedBlock(source, openingBraceIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  let comment = false;

  for (let index = openingBraceIndex; index < source.length; index += 1) {
    const character = source[index];

    if (comment) {
      if (character === '\n') {
        comment = false;
      }
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === quote) {
        quote = null;
      }
      continue;
    }
    if (character === '#') {
      comment = true;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '{') {
      depth += 1;
    } else if (character === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(openingBraceIndex + 1, index);
      }
    }
  }

  throw new Error('Niedomknięty blok konfiguracji Nginx.');
}

function sitemapLocationBlocks(source) {
  const matcher = /\blocation\s*=\s*\/sitemap\.xml\s*\{/g;
  const blocks = [];
  let match;

  while ((match = matcher.exec(source)) !== null) {
    const openingBraceIndex = source.indexOf('{', match.index);
    blocks.push(balancedBlock(source, openingBraceIndex));
  }

  return blocks;
}

function validateSitemapLocation(source) {
  const blocks = sitemapLocationBlocks(source);
  if (blocks.length !== 1) {
    return [`expected exactly one sitemap.xml location, received ${blocks.length}`];
  }

  const block = blocks[0];
  const errors = [];
  if (!/\btypes\s*\{[^{}]*\bapplication\/xml\s+xml\s*;[^{}]*\}/s.test(block)) {
    errors.push('sitemap.xml must map the xml extension to application/xml');
  }
  if (!/\btry_files\s+\$uri\s+=404\s*;/.test(block)) {
    errors.push('sitemap.xml must use try_files $uri =404');
  }
  if (/\badd_header\s+Content-Type\b/i.test(block)) {
    errors.push('sitemap.xml must not set Content-Type through add_header');
  }
  if (/\bindex\.html\b/i.test(block)) {
    errors.push('sitemap.xml must not fall back to HTML');
  }
  return errors;
}

const validBlock = `
location = /sitemap.xml {
  include /etc/nginx/security-headers.conf;
  types {
    application/xml xml;
  }
  add_header Cache-Control "no-cache" always;
  try_files $uri =404;
}
`;

test('production Nginx has one strict sitemap.xml location', () => {
  const nginx = fs.readFileSync(path.join(__dirname, '../nginx.conf'), 'utf8');

  assert.deepEqual(validateSitemapLocation(nginx), []);
});

test('accepts an application/xml MIME mapping without relying on exact formatting', () => {
  const differentlyFormatted = validBlock.replace(
    'types {\n    application/xml xml;\n  }',
    'types { application/xml   xml ; }',
  );

  assert.deepEqual(validateSitemapLocation(differentlyFormatted), []);
});

test('rejects a sitemap location without an explicit MIME mapping', () => {
  const source = validBlock.replace(/\s*types\s*\{[^{}]*\}/s, '');

  assert.ok(validateSitemapLocation(source).some((error) => error.includes('application/xml')));
});

test('rejects text/html as the sitemap MIME mapping', () => {
  const source = validBlock.replace('application/xml xml;', 'text/html xml;');

  assert.ok(validateSitemapLocation(source).some((error) => error.includes('application/xml')));
});

test('rejects add_header Content-Type even alongside the correct MIME mapping', () => {
  const source = validBlock.replace(
    'add_header Cache-Control',
    'add_header Content-Type application/xml;\n  add_header Cache-Control',
  );

  assert.ok(validateSitemapLocation(source).some((error) => error.includes('add_header')));
});

test('rejects duplicate sitemap locations and HTML fallbacks', () => {
  assert.ok(validateSitemapLocation(validBlock + validBlock)[0].includes('exactly one'));
  assert.ok(
    validateSitemapLocation(validBlock.replace('$uri =404', '$uri /index.html')).some((error) =>
      error.includes('HTML'),
    ),
  );
});
