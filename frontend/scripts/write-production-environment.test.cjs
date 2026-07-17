const assert = require('node:assert/strict');
const test = require('node:test');

const { productionEnvironment } = require('./write-production-environment.cjs');

test('defaults staging and preview builds to noindex', () => {
  assert.equal(
    productionEnvironment({
      API_URL: 'https://api.preview.invalid',
      PUBLIC_SITE_URL: 'https://preview.invalid',
    }).indexingEnabled,
    false,
  );
});

test('enables indexing only through an explicit true value', () => {
  assert.equal(
    productionEnvironment({
      API_URL: 'https://api.production.invalid',
      PUBLIC_SITE_URL: 'https://production.invalid',
      PUBLIC_SITE_INDEXING: 'true',
    }).indexingEnabled,
    true,
  );
  assert.throws(
    () => productionEnvironment({ PUBLIC_SITE_INDEXING: 'yes' }),
    /PUBLIC_SITE_INDEXING/,
  );
});
