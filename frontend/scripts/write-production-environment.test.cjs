const assert = require('node:assert/strict');
const test = require('node:test');

const {
  productionEnvironment,
  replaceBuildShaMeta,
} = require('./write-production-environment.cjs');

test('replaces a self-closing build SHA meta tag', () => {
  const html = '<meta name="protolume-build-sha" content="unknown" />';
  assert.equal(
    replaceBuildShaMeta(html, 'abc1234'),
    '<meta name="protolume-build-sha" content="abc1234" />',
  );
});

test('replaces flexible build SHA meta tag forms without changing other metadata', () => {
  const cases = [
    '<meta name="protolume-build-sha" content="unknown">',
    '<meta\n  name="protolume-build-sha"\n  content="unknown"\n/>',
    '<meta content="unknown" name="protolume-build-sha" />',
    "<meta name='protolume-build-sha' content='unknown' />",
  ];
  for (const html of cases) {
    const result = replaceBuildShaMeta(
      `<meta name="description" content="keep" />${html}`,
      'abc1234',
    );
    assert.match(result, /name="description" content="keep"/);
    assert.match(result, /(?:content="abc1234"|content='abc1234')/);
  }
});

test('requires exactly one build SHA meta tag with content', () => {
  assert.throws(
    () => replaceBuildShaMeta('<meta name="description" content="x">', 'abc1234'),
    /exactly one/,
  );
  assert.throws(
    () =>
      replaceBuildShaMeta(
        '<meta name="protolume-build-sha" content="x"><meta name="protolume-build-sha" content="y">',
        'abc1234',
      ),
    /exactly one/,
  );
  assert.throws(
    () => replaceBuildShaMeta('<meta name="protolume-build-sha">', 'abc1234'),
    /missing its content/,
  );
});

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

test('enables indexing only for the production origin', () => {
  assert.equal(
    productionEnvironment({
      API_URL: 'https://aisoftware-studio-api.example',
      PUBLIC_SITE_URL: 'https://protolume.pl',
      PUBLIC_SITE_INDEXING: 'true',
      PUBLIC_SALES_EMAIL: 'sales@protolume.pl',
      PUBLIC_PRIVACY_EMAIL: 'privacy@protolume.pl',
    }).indexingEnabled,
    true,
  );
  assert.throws(
    () =>
      productionEnvironment({
        PUBLIC_SITE_URL: 'https://production.invalid',
        PUBLIC_SITE_INDEXING: 'true',
      }),
    /PUBLIC_SITE_INDEXING/,
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

test('uses a safe build SHA fallback and accepts the deployment SHA', () => {
  assert.equal(productionEnvironment({}).buildSha, 'unknown');
  assert.equal(productionEnvironment({ PUBLIC_BUILD_SHA: 'abc1234' }).buildSha, 'abc1234');
  assert.doesNotMatch(productionEnvironment({}).buildSha, /__PUBLIC_CONFIG_REQUIRED__/);
});

test('rejects an explicitly supplied invalid build SHA', () => {
  for (const value of ['unknown', 'manual-local', 'ABC1234', 'abc123']) {
    assert.throws(() => productionEnvironment({ PUBLIC_BUILD_SHA: value }), /PUBLIC_BUILD_SHA/);
  }
  assert.equal(productionEnvironment({ PUBLIC_BUILD_SHA: 'abc1234' }).buildSha, 'abc1234');
  assert.equal(
    productionEnvironment({ PUBLIC_BUILD_SHA: 'd90d4c36a46692f98ff9874eb16da45537fe2daf' })
      .buildSha,
    'd90d4c36a46692f98ff9874eb16da45537fe2daf',
  );
});
