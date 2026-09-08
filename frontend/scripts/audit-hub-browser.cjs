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
    await page.goto('http://127.0.0.1:4400/rozwiazania', { waitUntil: 'networkidle' });
    const metric = await page.evaluate(() => {
      const nav = [...document.querySelectorAll('.nav-links a, .primary-cta')].map((a) => {
        const r = a.getBoundingClientRect();
        return { x: r.x, right: r.right, top: r.top, bottom: r.bottom };
      });
      return {
        height: document.documentElement.scrollHeight,
        firstCard: document.querySelector('.solution-card').getBoundingClientRect().top,
        overflow: document.documentElement.scrollWidth > innerWidth,
        nav,
      };
    });
    measurements.push({ width, ...metric });
    assert.equal(metric.overflow, false, `overflow ${width}`);
    if (width <= 430) assert.ok(metric.firstCard < 844, `first card ${width}`);
    if (width >= 921) {
      assert.ok(
        metric.nav.every((r) => r.right <= width && r.x >= 0),
        `nav bounds ${width}`,
      );
      assert.ok(
        metric.nav.slice(1).every((r, i) => r.x >= metric.nav[i].right),
        `nav overlap ${width}`,
      );
    }
  }
  await page.goto('http://127.0.0.1:4400/rozwiazania/chatbot-ai-dla-firm', {
    waitUntil: 'networkidle',
  });
  const breadcrumbs = await page.locator('.breadcrumbs').innerText();
  const schema = await page.locator('script[type="application/ld+json"]').allTextContents();
  assert.ok(breadcrumbs.includes('Rozwiązania'));
  assert.ok(schema.some((s) => s.includes('BreadcrumbList') && s.includes('"position":3')));
  assert.equal(
    await page.locator('.nav-links .is-section-active').getAttribute('href'),
    '/rozwiazania',
  );
  assert.equal(await page.locator('.nav-links [aria-current="page"]').count(), 0);
  await page.goto('http://127.0.0.1:4400/kontakt', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.primary-cta').getAttribute('aria-current'), 'page');
  const nojs = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  await nojs.goto('http://127.0.0.1:4400/rozwiazania');
  assert.ok(await nojs.locator('.primary-cta').isVisible());
  assert.equal(await nojs.locator('.solution-card h2 a').count(), 5);
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    'tmp/audit-implementation/verification/hub-browser.json',
    JSON.stringify({ metadata, measurements, errors, breadcrumbs, noJs: true }, null, 2),
  );
  console.log(
    measurements.map(({ width, height, firstCard, overflow }) => ({
      width,
      height,
      firstCard,
      overflow,
    })),
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
