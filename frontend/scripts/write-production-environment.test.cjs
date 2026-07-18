const assert = require('node:assert/strict');
const test = require('node:test');

const { productionEnvironment } = require('./write-production-environment.cjs');

test('defaults staging and preview builds to noindex', () => {
  assert.equal(
    productionEnvironment({
      API_URL: 'https://api.preview.invalid',
      PUBLIC_SITE_URL: 'https://preview.invalid',
      PUBLIC_SALES_EMAIL: 'sales@preview.invalid',
      PUBLIC_PRIVACY_EMAIL: 'privacy@preview.invalid',
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
      PUBLIC_SALES_EMAIL: 'sales@production.invalid',
      PUBLIC_PRIVACY_EMAIL: 'privacy@production.invalid',
    }).indexingEnabled,
    true,
  );
  assert.throws(
    () => productionEnvironment({ PUBLIC_SITE_INDEXING: 'yes' }),
    /PUBLIC_SITE_INDEXING/,
  );
});

test('writes distinct public sales and privacy addresses', () => {
  const environment = productionEnvironment({
    PUBLIC_SALES_EMAIL: 'sales@contact.test',
    PUBLIC_PRIVACY_EMAIL: 'privacy@contact.test',
  });

  assert.equal(environment.publicSalesEmail, 'sales@contact.test');
  assert.equal(environment.publicPrivacyEmail, 'privacy@contact.test');
});
