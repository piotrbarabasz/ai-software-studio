const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '../../../..');
const { chromium } = require(path.join(root, 'frontend/node_modules/@playwright/test'));
const out = path.resolve(__dirname, '../evidence');
const raw = path.join(root, 'tmp/protolume-second');
const origin = 'https://protolume.pl';
const slug = (route) => route === '/' ? 'home' : route.slice(1).replaceAll('/', '_');
const save = (name, value) => fs.writeFileSync(path.join(out, name), JSON.stringify(value, null, 2) + '\n');
const sha = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

(async () => {
  fs.mkdirSync(out, { recursive: true });
  fs.mkdirSync(path.join(raw, 'screenshots'), { recursive: true });
  const browser = await chromium.launch();
  const result = { startedAt: new Date().toISOString(), browser: browser.version(), source: origin, pages: [], layout: [], axe: [], errors: [], blockedWrites: [], downloads: [] };
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await context.route('**/*', async (route) => {
    if (!['GET', 'HEAD'].includes(route.request().method())) {
      result.blockedWrites.push({ method: route.request().method(), url: route.request().url() });
      await route.abort();
    } else await route.continue();
  });
  const page = await context.newPage();
  const native = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  page.on('pageerror', e => result.errors.push({ url: page.url(), type: 'pageerror', text: e.message }));
  page.on('console', m => { if (m.type() === 'error' || /Content Security Policy|Refused to/.test(m.text())) result.errors.push({ url: page.url(), type: 'console', text: m.text() }); });
  try {
    const home = await context.request.get(origin + '/');
    const homeHtml = await home.text();
    const version = { recordedAt: new Date().toISOString(), status: home.status(), productionDeclaredSha: homeHtml.match(/name="protolume-build-sha" content="([^"]+)/)?.[1], masterSha: cp.execFileSync('git', ['rev-parse', 'origin/master'], { cwd: root }).toString().trim(), localSha: cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root }).toString().trim(), masterTree: cp.execFileSync('git', ['rev-parse', 'origin/master^{tree}'], { cwd: root }).toString().trim(), localTree: cp.execFileSync('git', ['rev-parse', 'HEAD^{tree}'], { cwd: root }).toString().trim(), homeSha256: sha(Buffer.from(homeHtml)), headers: home.headers() };
    save('versions.json', version);
    console.log('VERSIONS ' + JSON.stringify(version));
    const sitemap = await context.request.get(origin + '/sitemap.xml');
    fs.writeFileSync(path.join(out, 'sitemap.xml'), await sitemap.body());
    const robots = await context.request.get(origin + '/robots.txt');
    fs.writeFileSync(path.join(out, 'robots.txt'), await robots.body());
    const routes = [...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname);
    for (const route of routes) {
      const response = await native.goto(origin + route, { waitUntil: 'networkidle' });
      fs.writeFileSync(path.join(raw, slug(route) + '.html'), await response.body());
      const metadata = await native.evaluate(() => {
        const meta = name => document.querySelector(`meta[name="${name}"],meta[property="${name}"]`)?.content;
        return { title: document.title, description: meta('description'), sha: meta('protolume-build-sha'), canonical: document.querySelector('link[rel="canonical"]')?.href, robots: meta('robots'), ogUrl: meta('og:url'), ogImage: meta('og:image'), lang: document.documentElement.lang, h1: [...document.querySelectorAll('h1')].map(e => e.textContent.trim()), ids: [...document.querySelectorAll('[id]')].map(e => e.id), schema: [...document.querySelectorAll('script[type="application/ld+json"]')].map(e => JSON.parse(e.textContent)), links: [...document.querySelectorAll('a[href]')].map(e => ({ text: e.textContent.trim(), href: e.href })), noJsMainText: document.querySelector('main')?.innerText, scripts: [...document.scripts].map(e => ({ type: e.type, src: e.src, inlineLength: e.textContent.length })) };
      });
      fs.writeFileSync(path.join(out, slug(route) + '.txt'), metadata.noJsMainText + '\n');
      result.pages.push({ route, status: response.status(), headers: response.headers(), ...metadata });
      for (const width of [360, 390, 430, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
        await page.goto(origin + route, { waitUntil: 'networkidle' });
        const geometry = await page.evaluate(() => {
          const visible = e => e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[hidden]');
          const box = e => { const r = e.getBoundingClientRect(); return { text: e.innerText?.trim(), tag: e.tagName, id: e.id, x: r.x, y: r.y + scrollY, width: r.width, height: r.height }; };
          const main = document.querySelector('main');
          return { height: document.documentElement.scrollHeight, scrollWidth: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth > innerWidth, visibleWords: main.innerText.trim().split(/\s+/).length, headerHeight: document.querySelector('header')?.getBoundingClientRect().height, h1: box(document.querySelector('h1')), headings: [...main.querySelectorAll('h2,h3')].filter(visible).map(box), contactCtas: [...main.querySelectorAll('a[href*="/kontakt"]')].filter(visible).map(e => ({ ...box(e), href: e.getAttribute('href') })), details: [...main.querySelectorAll('details')].map(e => ({ summary: e.querySelector('summary')?.innerText, open: e.open, height: e.getBoundingClientRect().height })), smallTargets: [...document.querySelectorAll('button,a,summary,input,select')].filter(visible).filter(e => e.getBoundingClientRect().height < 44).map(box), firstInput: document.querySelector('#name')?.getBoundingClientRect().top, media: [...main.querySelectorAll('audio,video')].map(e => ({ tag: e.tagName, src: e.currentSrc, controls: e.controls })), animations: document.getAnimations().map(a => ({ state: a.playState, iterations: a.effect?.getTiming().iterations })), disclaimerSentences: main.innerText.split(/(?<=[.!?])\s+|\n/).filter(t => /symulac|fikcyjn|nie test|nie jest|nie potwier|bez połączenia|nie przedstawia|nie wykonano/i.test(t)) };
        });
        result.layout.push({ route, width, ...geometry });
        if ([390, 1440].includes(width)) {
          await page.screenshot({ path: path.join(raw, 'screenshots', slug(route) + '-' + width + '.png'), fullPage: true });
          await page.screenshot({ path: path.join(out, slug(route) + '-' + width + '-top.png') });
          await page.evaluate(fs.readFileSync(path.join(root, 'frontend/node_modules/axe-core/axe.min.js'), 'utf8'));
          const axe = await page.evaluate(async () => { const a = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } }); return { violations: a.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map(n => ({ target: n.target, failureSummary: n.failureSummary, html: n.html })) })), incomplete: a.incomplete.map(v => ({ id: v.id, count: v.nodes.length })), passes: a.passes.length }; });
          result.axe.push({ route, width, ...axe });
        }
      }
      save('crawl.json', result);
      console.log(route + ': six widths, two axe scans, native HTML, screenshots');
    }
    const assets = new Set(result.pages.flatMap(p => p.links).map(l => l.href).filter(h => h.startsWith(origin + '/assets/evidence/')));
    for (const url of assets) {
      const response = await context.request.get(url);
      const bytes = await response.body();
      const source = cp.execFileSync('git', ['show', version.masterSha + ':frontend/src' + new URL(url).pathname], { cwd: root });
      result.downloads.push({ url, status: response.status(), contentType: response.headers()['content-type'], bytes: bytes.length, sha256: sha(bytes), matchesMasterSource: sha(source) === sha(bytes) });
      if (url.endsWith('.pdf')) fs.writeFileSync(path.join(raw, 'production-report.pdf'), bytes);
    }
    const missing = await native.goto(origin + '/audyt-drugi-nieistniejaca-20260909', { waitUntil: 'networkidle' });
    result.notFound = { status: missing.status(), robots: await native.locator('meta[name="robots"]').getAttribute('content'), canonical: await native.locator('link[rel="canonical"]').getAttribute('href') };
    result.cookies = await context.cookies();
    result.storage = await page.evaluate(() => ({ localKeys: Object.keys(localStorage), sessionKeys: Object.keys(sessionStorage) }));
    result.completedAt = new Date().toISOString();
    save('crawl.json', result);
    console.log('DONE ' + JSON.stringify({ pages: result.pages.length, layouts: result.layout.length, axeScans: result.axe.length, violations: result.axe.filter(a => a.violations.length), errors: result.errors, downloads: result.downloads.length }));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
