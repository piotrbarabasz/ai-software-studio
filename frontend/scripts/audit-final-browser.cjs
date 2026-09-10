const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium, expect } = require('@playwright/test');
const baseUrl = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4400';
assert.ok(
  ['127.0.0.1', 'localhost'].includes(new URL(baseUrl).hostname),
  'Audit only a loopback artifact',
);
const output = path.resolve(__dirname, '../../tmp/audit-implementation/verification');

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const nojs = await browser.newPage({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (/Content Security Policy|Refused to/.test(m.text())) errors.push(m.text());
    });
    const sitemap = await page.request.get(baseUrl + '/sitemap.xml');
    assert.equal(sitemap.status(), 200);
    const routes = [...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(
      (m) => new URL(m[1]).pathname,
    );
    assert.equal(routes.length, 15);
    assert.equal(new Set(routes).size, 15);
    const pages = [],
      layout = [],
      ids = new Map(),
      links = new Set(),
      images = new Set();
    for (const route of routes) {
      assert.equal((await nojs.goto(baseUrl + route, { waitUntil: 'networkidle' })).status(), 200);
      const metadata = await nojs.evaluate(() => {
        const meta = (name) =>
          document.querySelector('meta[name="' + name + '"],meta[property="' + name + '"]')
            ?.content;
        return {
          title: document.title,
          description: meta('description'),
          canonical: document.querySelector('link[rel="canonical"]')?.href,
          robots: meta('robots'),
          og: meta('og:url'),
          image: meta('og:image'),
          h1: [...document.querySelectorAll('h1')].map((el) => el.textContent.trim()),
          ids: [...document.querySelectorAll('[id]')].map((el) => el.id),
          links: [...document.querySelectorAll('a[href]')].map((el) => el.href),
          schema: [...document.querySelectorAll('script[type="application/ld+json"]')].map((el) =>
            JSON.parse(el.textContent),
          ),
          words: document.querySelector('main').textContent.trim().length,
        };
      });
      assert.equal(metadata.h1.length, 1, route);
      assert.ok(metadata.words > 100, route);
      assert.equal(metadata.canonical, 'https://protolume.pl' + (route === '/' ? '/' : route));
      assert.equal(new URL(metadata.og).href, metadata.canonical);
      assert.equal(metadata.robots, 'index, follow');
      assert.ok(metadata.description?.length > 25 && metadata.schema.length > 0);
      assert.equal(new Set(metadata.ids).size, metadata.ids.length, route);
      assert.doesNotMatch(metadata.description, /Protolume\. Protolume\.|z Piotr Barabasz/);
      ids.set(route, new Set(metadata.ids));
      for (const href of metadata.links) links.add(href);
      images.add(metadata.image);
      pages.push({ route, ...metadata, ids: undefined, links: undefined });
      for (const width of [320, 360, 390, 430, 768, 921, 1024, 1440]) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(baseUrl + route, { waitUntil: 'networkidle' });
        const geometry = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth,
          height: document.documentElement.scrollHeight,
          shortSummaries: [...document.querySelectorAll('summary')]
            .filter(
              (el) =>
                el.getBoundingClientRect().height > 0 && el.getBoundingClientRect().height < 44,
            )
            .map((el) => el.textContent.trim()),
        }));
        assert.equal(geometry.overflow, false, JSON.stringify({ route, width, geometry }));
        assert.deepEqual(geometry.shortSummaries, [], JSON.stringify({ route, width, geometry }));
        if ([320, 390, 1440].includes(width)) {
          await page.evaluate(fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8'));
          const violations = await page.evaluate(async () =>
            (
              await axe.run(document, {
                runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
              })
            ).violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
          );
          assert.deepEqual(violations, [], JSON.stringify({ route, width, violations }));
        }
        if (['/rd', '/przyklad-demo'].includes(route) && [390, 1440].includes(width)) {
          await page.screenshot({
            path: path.join(output, 'final-' + route.slice(1) + '-' + width + '.png'),
            fullPage: true,
          });
          await page.screenshot({
            path: path.join(output, 'final-' + route.slice(1) + '-' + width + '-top.png'),
          });
        }
        layout.push({ route, width, ...geometry });
      }
    }
    assert.equal(new Set(pages.map((p) => p.title)).size, 15);
    assert.equal(new Set(pages.map((p) => p.description)).size, 15);
    const checked = [];
    for (const href of new Set([...links, ...images])) {
      const url = new URL(href);
      if (![new URL(baseUrl).origin, 'https://protolume.pl'].includes(url.origin)) continue;
      if (ids.has(url.pathname)) {
        if (url.hash)
          assert.ok(
            ids.get(url.pathname).has(decodeURIComponent(url.hash.slice(1))),
            'Missing anchor ' + href,
          );
      } else assert.equal((await page.request.get(baseUrl + url.pathname)).status(), 200, href);
      checked.push(url.pathname + url.search + url.hash);
    }
    await nojs.goto(baseUrl + '/kontakt?projectType=custom_web_app', { waitUntil: 'networkidle' });
    assert.equal(
      await nojs.locator('link[rel="canonical"]').getAttribute('href'),
      'https://protolume.pl/kontakt',
    );
    assert.equal(
      (
        await nojs.goto(baseUrl + '/nieistniejaca-strona-audytu', { waitUntil: 'networkidle' })
      ).status(),
      404,
    );
    assert.equal(
      await nojs.locator('meta[name="robots"]').getAttribute('content'),
      'noindex, follow',
    );
    for (const route of [
      '/rd#eksperyment-wyszukiwania',
      '/przyklad-demo#scenarios-title',
      '/studio#evidence-title',
      '/development#przyklad-techniczny',
    ]) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(baseUrl + route.split('#')[0], { waitUntil: 'networkidle' });
      await page
        .locator('a[href="' + route + '"]')
        .first()
        .click();
      await expect
        .poll(() =>
          page.evaluate((hash) => {
            const target = document.getElementById(hash).getBoundingClientRect();
            const header = document.querySelector('.site-header').getBoundingClientRect();
            return target.top - header.bottom;
          }, route.split('#')[1]),
        )
        .toBeGreaterThanOrEqual(8);
    }
    const reflow = [];
    const zoom = await browser.newPage({
      viewport: { width: 720, height: 450 },
      deviceScaleFactor: 2,
      reducedMotion: 'reduce',
    });
    for (const route of routes) {
      await zoom.goto(baseUrl + route, { waitUntil: 'networkidle' });
      const overflow = await zoom.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      assert.equal(overflow, false, route);
      reflow.push({ route, cssViewport: 720, deviceScaleFactor: 2, overflow });
    }
    await zoom.close();
    const pdf = await page.request.get(baseUrl + '/assets/evidence/protolume-raport-demo.pdf');
    assert.equal(pdf.status(), 200);
    assert.match(pdf.headers()['content-type'], /^application\/pdf/);
    assert.deepEqual(
      await pdf.body(),
      fs.readFileSync(path.resolve(__dirname, '../src/assets/evidence/protolume-raport-demo.pdf')),
    );
    await page.goto(baseUrl + '/przyklad-demo', { waitUntil: 'networkidle' });
    const downloadPromise = page.waitForEvent('download');
    await page.locator('a[download="protolume-raport-demo.pdf"]').first().click();
    assert.equal((await downloadPromise).suggestedFilename(), 'protolume-raport-demo.pdf');
    const hidden = await page.locator('.summary-card details').getAttribute('open');
    assert.equal(hidden, null);
    await page.locator('.summary-card summary').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.summary-card details')).toHaveAttribute('open', '');
    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.locator('.site-header').isVisible(), false);
    assert.equal(await page.locator('.site-footer').isVisible(), false);
    assert.equal(await page.locator('button.print-action').isVisible(), false);
    assert.deepEqual(errors, []);
    fs.writeFileSync(
      path.join(output, 'final-browser.json'),
      JSON.stringify(
        {
          recordedAt: new Date().toISOString(),
          browser: browser.version(),
          baseUrl,
          pages,
          layout,
          checkedInternalLinks: checked,
          reflow,
          errors,
          pdfDownload: true,
          true404: true,
          nativeMetadata: true,
          limitations: [
            'Emulated twofold pixel density and 720 CSS px, not physical browser zoom or a screen reader certification.',
            'No real contact message, calendar event, model call or deployment performed.',
          ],
        },
        null,
        2,
      ),
    );
    console.log(
      'Final browser audit passed: 15 prerendered routes, 120 widths, 45 axe scans, internal links, 404, PDF and emulated reflow.',
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
