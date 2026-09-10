const path = require('node:path');
process.chdir(path.resolve(__dirname, '../..'));
const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const base = 'http://127.0.0.1:4400';
const route = '/rozwiazania/chatbot-ai-dla-firm';
const corpus = JSON.parse(fs.readFileSync('frontend/src/assets/rag/protolume-materials-v1.json'));
const output = 'tmp/audit-implementation/verification';
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const cases = [];
    for (const width of [320, 360, 390, 430, 768, 921, 1024, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(base + route, { waitUntil: 'networkidle' });
      await page.locator('.hero a[href$="#rag-source-example"]').click();
      const requests = [];
      const record = (request) => requests.push(request.url());
      page.on('request', record);
      for (const [index, section] of corpus.sections.slice(0, 2).entries()) {
        await page.locator('.rag-question-list button').nth(index).click();
        await page.waitForFunction(() => document.activeElement?.id === 'rag-answer-title');
        assert.equal(
          (await page.locator('#rag-answer blockquote').innerText()).trim(),
          section.text,
        );
        const answerTop = (await page.locator('#rag-answer-title').boundingBox()).y;
        assert.ok(answerTop >= 80 && answerTop < 200, `answer position ${width}: ${answerTop}`);
        await page.locator('#rag-source-link').click();
        await page.waitForFunction((id) => document.activeElement?.id === id, section.id);
        assert.ok(await page.locator('#' + section.id).isVisible());
        assert.equal(
          (await page.locator('#' + section.id + ' p').innerText()).trim(),
          section.text,
        );
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          false,
        );
        if (index === 0 && [390, 1440].includes(width)) {
          await page.screenshot({ path: `${output}/rag-source-${width}.png`, fullPage: true });
        }
        await page.locator('.rag-close-source').click();
        await page.waitForFunction(() => document.activeElement?.id === 'rag-source-link');
        assert.equal(await page.locator('#rag-source-document').getAttribute('open'), null);
      }
      await page.locator('.rag-question-list button').nth(2).click();
      await page.waitForFunction(() => document.activeElement?.id === 'rag-answer-title');
      assert.equal(await page.locator('#rag-source-link').count(), 0);
      assert.match(await page.locator('#rag-answer').innerText(), /Brak informacji/);
      page.off('request', record);
      assert.deepEqual(requests, [], `unexpected interaction requests at ${width}`);
      await page.locator('#rag-source-document summary').click();
      await page.evaluate(fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8'));
      const violations = await page.evaluate(async () =>
        (
          await axe.run(document, {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
          })
        ).violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
      );
      assert.deepEqual(violations, [], JSON.stringify({ width, violations }));
      cases.push({
        width,
        reducedMotion: 'reduce',
        violations,
        interactionRequests: requests.length,
      });
    }
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + route, { waitUntil: 'networkidle' });
    await page.locator('.rag-question-list button').nth(1).click();
    await page.waitForFunction(() => document.activeElement?.id === 'rag-answer-title');
    await page.locator('.hero a[href*="/kontakt"]').click();
    await page.waitForURL('**/kontakt?projectType=rag_chatbot_demo&service=rag');
    await page.goto(base + '/rozwiazania/systemy-agentowe', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('app-rag-source-example').count(), 0);
    const response = await page.request.get(base + '/assets/rag/protolume-materials-v1.json');
    assert.equal(response.status(), 200);
    assert.match(response.headers()['content-type'], /application\/json/);
    assert.deepEqual(await response.json(), corpus);
    for (const javaScriptEnabled of [false, true]) {
      const fragmentPage = await browser.newPage({
        javaScriptEnabled,
        viewport: { width: 390, height: 844 },
      });
      await fragmentPage.goto(base + route + '#rag-source-report', { waitUntil: 'networkidle' });
      assert.ok(
        await fragmentPage.locator('#rag-source-report').isVisible(),
        `direct fragment JS=${javaScriptEnabled}`,
      );
      await fragmentPage.goto(base + route, { waitUntil: 'networkidle' });
      if (!javaScriptEnabled) {
        assert.equal(await fragmentPage.locator('.rag-question-list button:visible').count(), 0);
        await fragmentPage.locator('#rag-source-link').click();
        assert.ok(await fragmentPage.locator('#rag-source-simulation').isVisible());
      }
      await fragmentPage.close();
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(
      `${output}/rag-browser.json`,
      JSON.stringify(
        {
          metadata: {
            recordedAt: new Date().toISOString(),
            browser: browser.version(),
            axe: require('axe-core/package.json').version,
          },
          cases,
          errors,
          directFragmentsWithAndWithoutJs: true,
          jsonMatches: true,
          contactIntent: true,
        },
        null,
        2,
      ),
    );
    console.log(
      'RAG source example: 8 widths, source/return focus, missing info, no requests, axe, fragments and no-JS passed.',
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
