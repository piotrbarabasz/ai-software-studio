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
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const measurements = [];
  for (const width of [320, 360, 390, 430, 768, 921, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('http://127.0.0.1:4400/', { waitUntil: 'networkidle' });
    const measure = await page.evaluate(() => ({
      height: document.documentElement.scrollHeight,
      proofTop: document.querySelector('[data-home-section="evidence"]').getBoundingClientRect()
        .top,
      materialTop: document.querySelector('.evidence-teaser-card').getBoundingClientRect().top,
      ctaBottom: document.querySelector('.hero-actions .primary-action').getBoundingClientRect()
        .bottom,
      overflow: document.documentElement.scrollWidth > innerWidth,
      heroAnimations: document.querySelector('[data-hero-visual]').getAnimations({ subtree: true })
        .length,
    }));
    assert.equal(measure.overflow, false, `overflow ${width}`);
    assert.equal(measure.heroAnimations, 0);
    if (width === 390) assert.ok(measure.ctaBottom < 844);
    await page.evaluate(fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8'));
    const violations = await page.evaluate(async () =>
      (
        await axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
        })
      ).violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        targets: v.nodes.map((n) => n.target),
      })),
    );
    assert.deepEqual(violations, [], JSON.stringify({ width, violations }));
    measurements.push({ width, ...measure, violations });
    if ([390, 1440].includes(width)) {
      await page.evaluate(() => {
        document.activeElement?.blur();
        window.scrollTo(0, 0);
      });
      await page.screenshot({
        path: `tmp/audit-implementation/verification/home-${width}.png`,
        fullPage: true,
      });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4400/', { waitUntil: 'networkidle' });
  await page.locator('.stage-plan summary').click();
  assert.ok(await page.locator('.demo-milestone').first().isVisible());
  const afterExpand = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.equal(afterExpand, false);
  await page.locator('.hero-secondary-action').click();
  await page.waitForURL('**/demo-ai#interactive-demo');
  assert.ok((await page.locator('#interactive-demo').boundingBox()).y < 200);
  await page.goto('http://127.0.0.1:4400/studio', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.evidence-card app-evidence-label').count(), 3);
  for (const link of await page.locator('.evidence-card a').all()) {
    const href = await link.getAttribute('href');
    const response = await page.request.get('http://127.0.0.1:4400' + href);
    assert.equal(response.status(), 200);
  }
  const nojs = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  await nojs.goto('http://127.0.0.1:4400/');
  assert.equal(await nojs.locator('.home-service-list a').count(), 5);
  await nojs.locator('.stage-plan summary').click();
  assert.ok(await nojs.locator('.demo-milestone').first().isVisible());
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    'tmp/audit-implementation/verification/home-browser.json',
    JSON.stringify({ metadata, measurements, errors, noJsDetails: true }, null, 2),
  );
  console.log(measurements.map(({ violations, ...m }) => m));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
