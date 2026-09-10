const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium, expect } = require('@playwright/test');
const output = path.resolve(__dirname, '../../tmp/audit-implementation/verification');
const baseUrl = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4400';
const routes = [
  { path: '/development', topic: 'custom_web_app', later: '#scope-title' },
  { path: '/dla-software-house', topic: 'software_house_partnership', later: '#models-title' },
];
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (/Content Security Policy|Refused to/.test(message.text())) errors.push(message.text());
    });
    const cases = [];
    for (const route of routes) {
      for (const width of [320, 360, 390, 430, 768, 921, 1024, 1440]) {
        await page.setViewportSize({ width, height: 844 });
        const response = await page.goto(baseUrl + route.path, { waitUntil: 'networkidle' });
        assert.equal(response.status(), 200);
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.locator('#przyklad-techniczny').count(), 1);
        assert.equal(await page.locator('app-engineering-artifact .artifact-files a').count(), 6);
        assert.equal(await page.locator('app-voice-example,app-agent-trace').count(), 0);
        const geometry = await page.evaluate(
          (later) => ({
            height: document.documentElement.scrollHeight,
            proofTop: document.querySelector('#przyklad-techniczny').getBoundingClientRect().top,
            laterTop: document.querySelector(later).getBoundingClientRect().top,
            overflow: document.documentElement.scrollWidth > innerWidth,
            duplicateIds: [...document.querySelectorAll('[id]')]
              .map((el) => el.id)
              .filter((id, i, list) => list.indexOf(id) !== i),
          }),
          route.later,
        );
        assert.equal(geometry.overflow, false);
        assert.deepEqual(geometry.duplicateIds, []);
        assert.ok(geometry.proofTop < geometry.laterTop);
        const summary = page.locator('app-engineering-artifact .source-files summary');
        await summary.focus();
        await page.keyboard.press('Enter');
        assert.equal(await page.locator('app-engineering-artifact details[open]').count(), 1);
        await page.evaluate(fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8'));
        const violations = await page.evaluate(async () =>
          (
            await axe.run(document, {
              runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
            })
          ).violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
        );
        assert.deepEqual(violations, [], JSON.stringify({ path: route.path, width, violations }));
        await page.keyboard.press('Enter');
        if ([390, 1440].includes(width)) {
          await page.evaluate(() => {
            document.activeElement?.blur();
            scrollTo(0, 0);
          });
          await page.screenshot({
            path: path.join(output, `engineering-${route.path.slice(1)}-${width}.png`),
            fullPage: true,
          });
        }
        await page.locator(`.hero-actions a[href="${route.path}#przyklad-techniczny"]`).click();
        await page.waitForURL(`**${route.path}#przyklad-techniczny`);
        await page.waitForFunction(() => {
          const y = document.querySelector('#przyklad-techniczny').getBoundingClientRect().top;
          return y >= 0 && y < innerHeight / 2;
        });
        cases.push({ path: route.path, width, ...geometry, violations, proofAnchor: true });
      }
      const downloadResponse = await page.request.get(
        baseUrl + '/assets/evidence/protolume-engineering.md',
      );
      assert.equal(downloadResponse.status(), 200);
      assert.equal(
        await downloadResponse.text(),
        fs.readFileSync(
          path.resolve(__dirname, '../src/assets/evidence/protolume-engineering.md'),
          'utf8',
        ),
      );
      const paths = await page
        .locator('app-engineering-artifact a')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
      await Promise.all(
        paths.map(async (asset) => {
          assert.match(asset, /^\/assets\/evidence\//);
          const response = await page.request.get(baseUrl + asset);
          assert.equal(response.status(), 200, asset);
          assert.deepEqual(
            await response.body(),
            fs.readFileSync(path.resolve(__dirname, '../src', '.' + asset)),
          );
          if (asset.endsWith('.txt'))
            assert.match(response.headers()['content-type'], /text\/plain/);
        }),
      );
      await page.locator(`.hero-actions a[href="/kontakt?projectType=${route.topic}"]`).click();
      await page.waitForURL(`**/kontakt?projectType=${route.topic}`);
      assert.equal(await page.locator('#projectType').inputValue(), route.topic);
      const native = await browser.newPage({
        javaScriptEnabled: false,
        viewport: { width: 390, height: 844 },
      });
      await native.goto(baseUrl + route.path, { waitUntil: 'networkidle' });
      assert.equal(await native.locator('app-engineering-artifact .artifact-files a').count(), 6);
      await native.locator(`.hero-actions a[href="${route.path}#przyklad-techniczny"]`).click();
      assert.ok(new URL(native.url()).hash === '#przyklad-techniczny');
      await expect
        .poll(async () => (await native.locator('#przyklad-techniczny').boundingBox()).y)
        .toBeGreaterThanOrEqual(0);
      await expect
        .poll(async () => (await native.locator('#przyklad-techniczny').boundingBox()).y)
        .toBeLessThan(422);
      await native.locator('app-engineering-artifact .source-files summary').click();
      assert.equal(await native.locator('app-engineering-artifact details[open]').count(), 1);
      await native.close();
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(
      path.join(output, 'engineering-browser.json'),
      JSON.stringify(
        {
          recordedAt: new Date().toISOString(),
          browser: browser.version(),
          baseUrl,
          cases,
          errors,
          downloadMatchesSource: true,
          nativeNoJs: true,
          contactContext: true,
        },
        null,
        2,
      ),
    );
    console.log(
      'Engineering pages passed: 16 viewport cases, axe, anchors, native details, no-JS, download and contact context.',
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
