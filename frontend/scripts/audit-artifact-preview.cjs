// Mechanical UI tests only. Silence and trace fixtures are not Voice AI/agent proof.
const path = require('node:path');
process.chdir(path.resolve(__dirname, '../..'));
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const output = 'tmp/audit-implementation/verification';
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const errors = [],
      cspErrors = [],
      cases = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (/Content Security Policy|Refused to/.test(message.text())) cspErrors.push(message.text());
    });
    for (const width of [320, 360, 390, 430, 768, 921, 1024, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      const mediaRequests = [];
      const record = (request) => {
        if (request.url().endsWith('.wav')) mediaRequests.push(request.url());
      };
      page.on('request', record);
      await page.goto('http://127.0.0.1:4402/', { waitUntil: 'networkidle' });
      assert.deepEqual(mediaRequests, [], `preloaded media ${width}`);
      const audio = page.locator('audio');
      assert.equal(await audio.getAttribute('preload'), 'none');
      assert.equal(await audio.getAttribute('autoplay'), null);
      await page.locator('app-voice-example summary').first().focus();
      await page.keyboard.press('Enter');
      assert.ok(await page.locator('app-voice-example details p').isVisible());
      for (const summary of await page.locator('app-agent-trace summary').all()) {
        assert.ok((await summary.boundingBox()).height >= 44);
        await summary.focus();
        await page.keyboard.press('Enter');
      }
      assert.equal(await page.locator('.trace-steps details[open]').count(), 5);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      await page.evaluate(fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8'));
      const violations = await page.evaluate(async () =>
        (
          await axe.run(document, {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
          })
        ).violations.map((v) => ({ id: v.id, targets: v.nodes.map((node) => node.target) })),
      );
      assert.deepEqual(violations, [], JSON.stringify({ width, violations }));
      if ([390, 1440].includes(width)) {
        await page.evaluate(() => {
          document.activeElement?.blur();
          scrollTo(0, 0);
        });
        await page.screenshot({ path: `${output}/artifact-preview-${width}.png`, fullPage: true });
      }
      if (width === 390) {
        await audio.focus();
        await page.keyboard.press('Space');
        await page.waitForFunction(() => {
          const a = document.querySelector('audio');
          return a.duration === 1 && a.currentTime > 0 && !a.paused;
        });
        await page.keyboard.press('Space');
        assert.equal(await audio.evaluate((a) => a.paused), true);
        await audio.evaluate((a) => {
          a.currentTime = 0.5;
        });
        await page.keyboard.press('Space');
        await page.waitForFunction(() => document.querySelector('audio').ended);
        assert.ok(mediaRequests.some((url) => url.endsWith('player-silence.wav')));
        await page.getByRole('button', { name: 'Brakujący plik audio' }).click();
        await page.waitForFunction(() =>
          document.querySelector('audio').getAttribute('src').endsWith('missing.wav'),
        );
        await audio.evaluate(async (a) => {
          try {
            await a.play();
          } catch {
            /* Real 404 is the expected failure. */
          }
        });
        await page.getByRole('status').waitFor();
        assert.ok(await page.locator('.transcript').isVisible());
        assert.match(await page.getByRole('status').innerText(), /Pełna transkrypcja/);
        await page.getByRole('button', { name: 'Przywróć fixture' }).click();
        await page.getByRole('status').waitFor({ state: 'detached' });
        for (const [name, label] of [
          ['Stan timeoutu', 'Przekroczono czas'],
          ['Stan limitu budżetu', 'Przekroczono budżet'],
        ]) {
          await page.getByRole('button', { name }).click();
          await page.waitForFunction(
            (label) =>
              document
                .querySelector('app-agent-trace .artifact-result')
                .textContent.includes(label),
            label,
          );
          assert.match(
            await page.locator('app-agent-trace .artifact-result').innerText(),
            new RegExp(label),
          );
          assert.match(await page.locator('.trace-steps').innerText(), /Pominięto/);
        }
      }
      page.off('request', record);
      cases.push({ width, initialMediaRequests: 0, violations, overflow: false });
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(cspErrors, []);
    fs.writeFileSync(
      `${output}/artifact-preview-browser.json`,
      JSON.stringify(
        {
          recordedAt: new Date().toISOString(),
          browser: browser.version(),
          axe: require('axe-core/package.json').version,
          scope: 'private mechanical fixtures; 1 second silence, no speech or model execution',
          cases,
          keyboardPlayPause: true,
          seekingAndEnd: true,
          missingAudioTranscriptFallback: true,
          timeoutAndBudgetPresentation: true,
          errors,
          cspErrors,
        },
        null,
        2,
      ),
    );
    console.log(
      'Private artifact preview passed: 8 widths, axe, keyboard media controls, seek/end, fallback and trace states.',
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
