const path = require('node:path');
process.chdir(path.resolve(__dirname, '../..'));
const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const assert = require('node:assert/strict');
fs.mkdirSync('tmp/audit-implementation/verification', { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const metadata = {
    recordedAt: new Date().toISOString(),
    browser: browser.version(),
    axeInstalledVersion: require('axe-core/package.json').version,
  };
  const results = [];
  const homeBefore = [];
  for (const reducedMotion of ['reduce', 'no-preference'])
    for (const width of [360, 390, 430, 1024]) {
      const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion });
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto('http://127.0.0.1:4400/demo-ai#interactive-demo', {
        waitUntil: 'networkidle',
      });
      const requests = [];
      page.on('request', (r) => requests.push(r.url()));
      assert.equal(await page.locator('.question-button').count(), 3);
      await page.locator('.question-button').first().click();
      await page.waitForFunction(
        () => document.activeElement?.id === 'knowledge-demo-answer-title',
      );
      const answer = await page.locator('#knowledge-demo-answer-title').boundingBox();
      assert.ok(answer.y >= 76 && answer.y < 300, JSON.stringify({ width, answer }));
      assert.equal(await page.locator('.contact-cta').count(), 1);
      assert.equal(await page.locator('.checking-state,.confidence,[aria-live]').count(), 0);
      await page.locator('.reset-button').click();
      await page.waitForFunction(() => document.activeElement?.id === 'demo-category');
      await page.locator('#demo-category').selectOption('wiedza');
      assert.equal(await page.locator('.question-button').count(), 3);
      await page.locator('#custom-question').fill('Czy na Marsie pada deszcz?');
      await page.locator('.custom-question-form button').click();
      await page.waitForFunction(
        () => document.activeElement?.id === 'knowledge-demo-answer-title',
      );
      assert.ok((await page.locator('.answer-card').innerText()).includes('To pytanie wykracza'));
      assert.equal(await page.locator('.contact-cta').count(), 1);
      assert.deepEqual(requests, []);
      assert.deepEqual(errors, []);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      assert.equal(overflow, false);
      if (reducedMotion === 'reduce') {
        await page.evaluate(fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8'));
        const violations = await page.evaluate(async () =>
          (await axe.run(document.querySelector('#interactive-demo'))).violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            targets: v.nodes.map((n) => n.target),
          })),
        );
        assert.deepEqual(violations, []);
      }
      results.push({
        width,
        reducedMotion,
        answerTop: answer.y,
        requests: [...requests],
        errors: [...errors],
        overflow,
      });
      if (reducedMotion === 'reduce') {
        await page.goto('http://127.0.0.1:4400/', { waitUntil: 'networkidle' });
        homeBefore.push({
          width,
          ...(await page.evaluate(() => ({
            height: document.documentElement.scrollHeight,
            proofTop: document
              .querySelector('[data-home-section="evidence"]')
              .getBoundingClientRect().top,
            ctaBottom: document
              .querySelector('.hero-actions .primary-action')
              .getBoundingClientRect().bottom,
          }))),
        });
      }
      await page.close();
    }
  fs.writeFileSync(
    'tmp/audit-implementation/verification/simulation-browser.json',
    JSON.stringify({ metadata, results, homeBefore }, null, 2),
  );
  console.log({ results, homeBefore });
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
