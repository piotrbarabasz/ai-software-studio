const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium, expect } = require('@playwright/test');
const output = path.resolve(__dirname, '../../tmp/audit-implementation/verification');
const baseUrl = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4400';

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (/Content Security Policy|Refused to/.test(message.text())) errors.push(message.text());
    });
    const cases = [];
    for (const route of ['/studio', '/kontakt']) {
      for (const width of [320, 360, 390, 430, 768, 921, 1024, 1440]) {
        await page.setViewportSize({ width, height: 844 });
        assert.equal(
          (await page.goto(baseUrl + route, { waitUntil: 'networkidle' })).status(),
          200,
        );
        assert.equal(await page.locator('h1').count(), 1);
        const geometry = await page.evaluate(() => ({
          height: document.documentElement.scrollHeight,
          visibleWords: document.querySelector('main').innerText.trim().split(/\s+/).length,
          allWords: document.querySelector('main').textContent.trim().split(/\s+/).length,
          firstInput: document.querySelector('#name')?.getBoundingClientRect().top,
          firstEvidence: document.querySelector('.evidence-card')?.getBoundingClientRect().top,
          overflow: document.documentElement.scrollWidth > innerWidth,
        }));
        assert.equal(geometry.overflow, false);
        if (route === '/kontakt') {
          if (width === 390) assert.ok(geometry.firstInput <= 450, JSON.stringify(geometry));
          assert.match(await page.locator('#message-hint').innerText(), /Minimum 20 znaków/);
          assert.equal(await page.locator('#company').getAttribute('required'), null);
          assert.equal(await page.locator('#name').getAttribute('autocomplete'), 'name');
          assert.equal(await page.locator('#email').getAttribute('autocomplete'), 'email');
        } else {
          assert.equal(await page.locator('.evidence-card').count(), 4);
          assert.match(await page.locator('.evidence-card h3').first().innerText(), /Protolume/);
        }
        const summary = page.locator(
          route === '/studio' ? '.owner-background summary' : '.contact-next summary',
        );
        await summary.focus();
        await page.keyboard.press('Enter');
        await expect(summary.locator('..')).toHaveAttribute('open', '');
        await page.evaluate(fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8'));
        const violations = await page.evaluate(async () =>
          (
            await axe.run(document, {
              runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
            })
          ).violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
        );
        assert.deepEqual(violations, [], JSON.stringify({ route, width, violations }));
        await page.keyboard.press('Enter');
        if ([390, 1440].includes(width)) {
          await page.evaluate(() => {
            document.activeElement?.blur();
            scrollTo(0, 0);
          });
          await page.screenshot({
            path: path.join(output, 'focused-' + route.slice(1) + '-' + width + '.png'),
            fullPage: true,
          });
          await page.screenshot({
            path: path.join(output, 'focused-' + route.slice(1) + '-' + width + '-top.png'),
          });
        }
        cases.push({ route, width, ...geometry, violations });
      }
      const native = await browser.newPage({
        javaScriptEnabled: false,
        viewport: { width: 390, height: 844 },
      });
      await native.goto(baseUrl + route, { waitUntil: 'networkidle' });
      const summary = native.locator(
        route === '/studio' ? '.owner-background summary' : '.contact-next summary',
      );
      await summary.click();
      await expect(summary.locator('..')).toHaveAttribute('open', '');
      if (route === '/kontakt')
        await expect(native.locator('.no-script-contact a[href^="mailto:"]')).toBeVisible();
      else {
        await native.locator('a[href="/studio#evidence-title"]').click();
        await expect
          .poll(async () => (await native.locator('#evidence-title').boundingBox()).y)
          .toBeLessThan(422);
        await expect
          .poll(async () => (await native.locator('#evidence-title').boundingBox()).y)
          .toBeGreaterThanOrEqual(0);
      }
      await native.close();
    }
    // Every request is intercepted before dispatch; no contact reaches a real API.
    let responseStatus = 422;
    let count = 0;
    await page.route('**/api/contact', async (route) => {
      count++;
      if (responseStatus === 0) return route.abort('failed');
      return route.fulfill({
        status: responseStatus,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': baseUrl },
        body: JSON.stringify(
          responseStatus === 202
            ? { status: 'accepted', message: 'ok' }
            : { detail: 'Controlled browser test' },
        ),
      });
    });
    await page.goto(baseUrl + '/kontakt', { waitUntil: 'networkidle' });
    await page.locator('#name').fill('Test lokalny');
    await page.locator('#email').fill('browser-check@example.test');
    await page.locator('#projectType').selectOption('custom_web_app');
    const message = 'Lokalny test zachowania formularza. Nie wysyłaj tego opisu do odbiorcy.';
    await page.locator('#message').fill(message);
    await page.locator('#consent').check();
    const failures = [];
    for (const status of [422, 429, 503, 0]) {
      responseStatus = status;
      const before = count;
      await page.locator('button[type="submit"]').click();
      await expect.poll(() => count).toBe(before + 1);
      await expect(page.locator('#contact-form-error-summary')).toBeFocused();
      assert.equal(await page.locator('#message').inputValue(), message);
      assert.equal(await page.locator('#name').inputValue(), 'Test lokalny');
      assert.equal(await page.locator('#company').inputValue(), '');
      failures.push({ status, messagePreserved: true, focusOnSummary: true });
    }
    responseStatus = 202;
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.contact-success')).toBeFocused();
    assert.equal(await page.locator('.contact-form').count(), 0);
    assert.deepEqual(errors, []);
    fs.writeFileSync(
      path.join(output, 'studio-contact-browser.json'),
      JSON.stringify(
        {
          recordedAt: new Date().toISOString(),
          browser: browser.version(),
          baseUrl,
          cases,
          failures,
          success: true,
          noJs: true,
          errors,
          externalContactRequestsSent: 0,
        },
        null,
        2,
      ),
    );
    console.log(
      'Studio/contact: 16 widths, axe, keyboard, native no-JS, 422/429/503/network and success passed.',
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
