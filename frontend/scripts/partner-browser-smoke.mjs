import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.resolve(__dirname, '../dist/aisoftware-studio/browser');
const desktopWidths = [921, 960, 1024, 1200];
const mobileWidths = [320, 390];
const auditedRoutes = [
  '/',
  '/rozwiazania',
  '/rozwiazania/chatbot-ai-dla-firm',
  '/rozwiazania/voice-ai-dla-firm',
  '/rozwiazania/automatyzacja-procesow',
  '/rozwiazania/integracje-whatsapp-crm',
  '/rozwiazania/systemy-agentowe',
  '/demo-ai',
  '/przyklad-demo',
  '/dla-software-house',
  '/studio',
  '/kontakt',
  '/polityka-prywatnosci',
  '/audyt-nieistniejacej-trasy',
];
const auditedViewports = [
  { width: 320, height: 800 },
  { width: 360, height: 800 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 920, height: 900 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];
const expectedCtas = new Map([
  ['/', ['/kontakt?projectType=mvp_prototype', '/demo-ai']],
  ['/rozwiazania/chatbot-ai-dla-firm', ['/kontakt?projectType=rag_chatbot_demo']],
  ['/rozwiazania/voice-ai-dla-firm', ['/kontakt?projectType=custom_web_app']],
  ['/rozwiazania/automatyzacja-procesow', ['/kontakt?projectType=business_process_automation']],
  ['/rozwiazania/integracje-whatsapp-crm', ['/kontakt?projectType=backend_api']],
  ['/rozwiazania/systemy-agentowe', ['/kontakt?projectType=custom_web_app']],
  ['/dla-software-house', ['/kontakt?projectType=software_house_partnership']],
]);

function contentType(filePath) {
  return (
    {
      '.css': 'text/css; charset=utf-8',
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.xml': 'application/xml; charset=utf-8',
    }[path.extname(filePath)] ?? 'application/octet-stream'
  );
}

async function startServer() {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://local').pathname);
      const relativePath = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
      let filePath = path.resolve(distDirectory, `.${relativePath}`);
      if (!filePath.startsWith(`${distDirectory}${path.sep}`)) {
        response.writeHead(403).end();
        return;
      }
      try {
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
          filePath = path.join(filePath, 'index.html');
        }
        response.writeHead(200, { 'Content-Type': contentType(filePath) });
        response.end(await fs.readFile(filePath));
      } catch {
        const notFoundPath = path.join(distDirectory, '404', 'index.html');
        response.writeHead(404, { 'Content-Type': contentType(notFoundPath) });
        response.end(await fs.readFile(notFoundPath));
      }
    } catch {
      response.writeHead(500).end();
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Nie udało się uruchomić serwera smoke testu.');
  }
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  };
}

function pathForFileName(route) {
  return route === '/' ? 'home' : route.replace(/^\//, '').replaceAll('/', '-');
}

async function captureDiagnostic(page, route, viewport) {
  const directory = path.resolve(process.cwd(), 'tmp', 'browser-audit');
  await fs.mkdir(directory, { recursive: true });
  const screenshotPath = path.join(
    directory,
    `${pathForFileName(route)}-${viewport.width}x${viewport.height}.png`,
  );
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshotPath;
}

async function pageAuditState(page, route) {
  return page.evaluate(
    ({ currentRoute, requiredCtas }) => {
      const visible = (element) => {
        if (!(element instanceof HTMLElement)) return false;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0;
      };
      const clipped = (element) => {
        const rect = element.getBoundingClientRect();
        return rect.left < -1 || rect.right > window.innerWidth + 1 || rect.width <= 0;
      };
      const main = document.querySelector('main');
      const headings = Array.from(main?.querySelectorAll('h1, h2, h3, h4, h5, h6') ?? []);
      const headingLevels = headings.map((heading) => Number(heading.tagName.slice(1)));
      const headingSkips = headingLevels
        .map((level, index) => ({ from: headingLevels[index - 1], index, level }))
        .filter(({ from, index, level }) => index > 0 && level > from + 1);
      const interactiveSelector =
        'a[href], button, input:not([type="hidden"]), select, textarea, details > summary';
      const interactive = Array.from(document.querySelectorAll(interactiveSelector));
      const nestedInteractive = interactive.filter((element) =>
        element.parentElement?.closest(interactiveSelector),
      );
      const imageIssues = Array.from(document.querySelectorAll('img')).flatMap((image) => {
        const issues = [];
        if (!image.hasAttribute('alt')) issues.push(`${image.src}: missing alt`);
        if (
          !(Number(image.getAttribute('width')) > 0) ||
          !(Number(image.getAttribute('height')) > 0)
        ) {
          issues.push(`${image.src}: missing intrinsic dimensions`);
        }
        return issues;
      });
      const visibleCtas = Array.from(
        main?.querySelectorAll(
          'a.primary-action, a.secondary-action, a.contact-cta, button.submit-button, button.print-action',
        ) ?? [],
      ).filter((element) => visible(element) && !element.closest('.solution-carousel'));
      const invalidLinks = Array.from(document.querySelectorAll('a[href]'))
        .map((link) => link.getAttribute('href') ?? '')
        .filter(
          (href) =>
            !href || /__PUBLIC_CONFIG_REQUIRED__|\.example\.com|\bTODO\b|^javascript:/i.test(href),
        );
      const allH2 = Array.from(main?.querySelectorAll('h2') ?? []);
      const bodyText = document.body.innerText;
      const unsupportedClaimPatterns = [
        ['percentage', /\d+(?:[.,]\d+)?\s*%/],
        ['savings', /oszczęd/i],
        ['guarantee', /gwarant/i],
        ['best', /najleps/i],
        ['delivered', /wdrożyliśmy/i],
        ['our-team', /nasz zespół/i],
        ['nda', /\bNDA\b/i],
        ['always-on', /24\s*\/\s*7/i],
      ];
      const actualCtas = new Set(
        Array.from(main?.querySelectorAll('a[href]') ?? []).map(
          (link) => link.getAttribute('href') ?? '',
        ),
      );
      const navigationPath = [
        '/rozwiazania',
        '/demo-ai',
        '/development',
        '/dla-software-house',
        '/studio',
        '/kontakt',
      ].includes(currentRoute);

      return {
        documentOverflow:
          document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        bodyOverflow: document.body.scrollWidth > document.body.clientWidth + 1,
        headerOverflow:
          (document.querySelector('.site-header')?.scrollWidth ?? 0) >
          (document.querySelector('.site-header')?.clientWidth ?? 0) + 1,
        semanticCounts: {
          header: document.querySelectorAll('header').length,
          nav: document.querySelectorAll('nav').length,
          main: document.querySelectorAll('main').length,
          footer: document.querySelectorAll('footer').length,
        },
        skipLinkValid:
          document.querySelector('.skip-link')?.getAttribute('href') === '#main-content',
        h1Count: document.querySelectorAll('h1').length,
        h1Text: document.querySelector('h1')?.textContent?.trim() ?? '',
        h1Clipped: Array.from(document.querySelectorAll('h1')).some(clipped),
        emptyH2: allH2.some((heading) => !heading.textContent?.trim()),
        headingSkips,
        logoClipped: Array.from(document.querySelectorAll('.brand img')).some(clipped),
        ctaClipped: visibleCtas.some(clipped),
        invalidLinks,
        missingCtas: requiredCtas.filter((href) => !actualCtas.has(href)),
        imageIssues,
        socialPreviewInContent: !!document.querySelector(
          'main img[src*="protolume-social-preview"]',
        ),
        nestedInteractiveCount: nestedInteractive.length,
        mojibake:
          /\uFFFD|\u00C3|\u00C2|\u00C4|\u00C5|\u0139|\u00E2\u20AC|\u00E2\u20AC\u201C|\u00E2\u20AC\u201D/.test(
            bodyText,
          ),
        unsupportedClaims: unsupportedClaimPatterns
          .filter(([, pattern]) => pattern.test(bodyText))
          .map(([name]) => name),
        ariaCurrentCount: document.querySelectorAll('#primary-navigation a[aria-current="page"]')
          .length,
        expectedAriaCurrentCount: navigationPath ? 1 : 0,
        menuExpanded: document.querySelector('.menu-toggle')?.getAttribute('aria-expanded'),
        notFoundLooksLikeHome:
          currentRoute === '/audyt-nieistniejacej-trasy' &&
          (!!document.querySelector('.home-page') || !/nie znaleźliśmy/i.test(bodyText)),
      };
    },
    { currentRoute: route, requiredCtas: expectedCtas.get(route) ?? [] },
  );
}

function auditProblems(state, route, viewport, responseStatus) {
  const problems = [];
  if (state.documentOverflow || state.bodyOverflow || state.headerOverflow) {
    problems.push('horizontal overflow');
  }
  if (
    state.semanticCounts.header < 1 ||
    state.semanticCounts.nav < 1 ||
    state.semanticCounts.main !== 1 ||
    state.semanticCounts.footer < 1
  ) {
    problems.push(`semantic shell mismatch: ${JSON.stringify(state.semanticCounts)}`);
  }
  if (!state.skipLinkValid) problems.push('missing or invalid skip link');
  if (state.h1Count !== 1 || !state.h1Text) problems.push(`expected one h1, got ${state.h1Count}`);
  if (state.h1Clipped || state.logoClipped || state.ctaClipped)
    problems.push('clipped h1, logo or CTA');
  if (state.emptyH2 || state.headingSkips.length > 0) problems.push('illogical heading hierarchy');
  if (state.invalidLinks.length > 0 || state.missingCtas.length > 0) {
    problems.push(
      `invalid or missing href: ${JSON.stringify({ invalid: state.invalidLinks, missing: state.missingCtas })}`,
    );
  }
  if (state.imageIssues.length > 0 || state.socialPreviewInContent) {
    problems.push(`image contract failed: ${JSON.stringify(state.imageIssues)}`);
  }
  if (state.nestedInteractiveCount > 0) problems.push('nested interactive element');
  if (state.mojibake) problems.push('mojibake visible in page text');
  if (state.unsupportedClaims.length > 0) {
    problems.push(`unsupported claims: ${state.unsupportedClaims.join(', ')}`);
  }
  if (state.ariaCurrentCount !== state.expectedAriaCurrentCount) {
    problems.push('aria-current does not match the current route');
  }
  if (viewport.width <= 920 && state.menuExpanded !== 'false') {
    problems.push('mobile menu does not expose aria-expanded=false');
  }
  if (viewport.width > 920 && state.menuExpanded !== null) {
    problems.push('desktop menu unexpectedly exposes aria-expanded');
  }
  if (
    state.notFoundLooksLikeHome ||
    (route.endsWith('nieistniejacej-trasy') && responseStatus !== 404)
  ) {
    problems.push('404 behaves like the homepage');
  }
  return problems;
}

async function assertMobileMenu(page, baseUrl, viewport) {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const toggle = page.locator('.menu-toggle');
  await toggle.click();
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') {
    throw new Error(`Menu did not open at ${viewport.width}px`);
  }
  await page.keyboard.press('Escape');
  if (
    (await toggle.getAttribute('aria-expanded')) !== 'false' ||
    !(await toggle.evaluate((node) => node === document.activeElement))
  ) {
    throw new Error(`Escape did not close the menu and restore focus at ${viewport.width}px`);
  }
  await toggle.click();
  await page.locator('#primary-navigation a[href="/rozwiazania"]').click();
  await page.waitForURL(/\/rozwiazania$/);
  const navigationClosed =
    (await page.locator('.menu-toggle').getAttribute('aria-expanded')) === 'false';
  const mainFocused = await page
    .locator('#main-content')
    .evaluate((node) => node === document.activeElement);
  if (!navigationClosed || !mainFocused) {
    throw new Error(`Route selection did not close the menu and focus main at ${viewport.width}px`);
  }
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const skipLink = page.locator('.skip-link');
  const focusState = await skipLink.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      focused: node === document.activeElement,
      visible: node.getBoundingClientRect().top >= 0,
      outline: Number.parseFloat(style.outlineWidth) > 0,
    };
  });
  if (!focusState.focused || !focusState.visible || !focusState.outline) {
    throw new Error(`Skip-link focus is not visible at ${viewport.width}px`);
  }
}

async function assertAutomationBento(page, baseUrl) {
  const expectedRoutes = [
    '/rozwiazania/chatbot-ai-dla-firm',
    '/rozwiazania/voice-ai-dla-firm',
    '/rozwiazania/automatyzacja-procesow',
    '/rozwiazania/systemy-agentowe',
    '/rozwiazania/integracje-whatsapp-crm',
  ];

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    const state = await page.locator('.automation-bento').evaluate((bento) => {
      const cards = Array.from(bento.querySelectorAll('.automation-bento-card'));
      const boxes = cards.map((card) => card.getBoundingClientRect());
      return {
        cardCount: cards.length,
        darkCardCount: cards.filter((card) => card.classList.contains('is-dark')).length,
        headingCount: cards.filter((card) => card.querySelector('h3')).length,
        interactiveCounts: cards.map(
          (card) => card.querySelectorAll('a, button, input, select, textarea').length,
        ),
        visualInteractiveCount: bento.querySelectorAll(
          'app-automation-bento-visual a, app-automation-bento-visual button, app-automation-bento-visual input, app-automation-bento-visual select, app-automation-bento-visual textarea',
        ).length,
        decorativeVisualCount: bento.querySelectorAll(
          'app-automation-bento-visual [aria-hidden="true"]',
        ).length,
        routes: cards.map((card) => card.querySelector('a')?.getAttribute('href') ?? ''),
        boxes: boxes.map(({ top, width }) => ({ top, width })),
      };
    });

    const basicContractFailed =
      state.cardCount !== 5 ||
      state.darkCardCount !== 1 ||
      state.headingCount !== 5 ||
      state.decorativeVisualCount !== 5 ||
      state.visualInteractiveCount !== 0 ||
      state.interactiveCounts.some((count) => count !== 1) ||
      JSON.stringify(state.routes) !== JSON.stringify(expectedRoutes);
    const [first, second, third, fourth, fifth] = state.boxes;
    const layoutFailed =
      viewport.width === 390
        ? state.boxes.some((box) => Math.abs(box.width - first.width) > 2) ||
          state.boxes.some((box, index) => index > 0 && box.top <= state.boxes[index - 1].top)
        : viewport.width === 768
          ? Math.abs(first.top - second.top) > 2 ||
            third.width < first.width * 1.8 ||
            Math.abs(fourth.top - fifth.top) > 2
          : !(
              first.width < second.width &&
              third.width > fourth.width &&
              fifth.width > second.width
            );

    if (basicContractFailed || layoutFailed) {
      throw new Error(
        `Automation bento audit failed at ${viewport.width}px: ${JSON.stringify(state)}`,
      );
    }
  }
}

async function assertHeroThreeDimensionalEnhancement(page, baseUrl) {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    const hero = page.locator('.hero');
    const initialHeight = (await hero.boundingBox())?.height ?? 0;
    await page.waitForTimeout(600);
    const settledHeight = (await hero.boundingBox())?.height ?? 0;
    const state = await hero.evaluate((section) => {
      const fallback = section.querySelector('[data-hero-fallback]');
      const fallbackStyle = fallback ? getComputedStyle(fallback) : null;
      const actions = Array.from(section.querySelectorAll('.hero-actions a'));
      return {
        actionCount: actions.length,
        actionsVisible: actions.every((action) => {
          const box = action.getBoundingClientRect();
          return box.width > 0 && box.height >= 44;
        }),
        documentOverflow:
          document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        fallbackExists: Boolean(fallback),
        fallbackVisible:
          fallbackStyle?.display !== 'none' && Number.parseFloat(fallbackStyle?.opacity ?? '0') > 0,
        h1Visible: Boolean(section.querySelector('h1')?.getBoundingClientRect().height),
        splineContainerCount: section.querySelectorAll('[data-hero-spline]').length,
        splineViewerCount: section.querySelectorAll('spline-viewer').length,
      };
    });

    const fallbackOnlyViewport = viewport.width < 1024;
    if (
      !state.h1Visible ||
      state.actionCount !== 2 ||
      !state.actionsVisible ||
      !state.fallbackExists ||
      (!state.fallbackVisible && state.splineViewerCount === 0) ||
      state.documentOverflow ||
      Math.abs(initialHeight - settledHeight) > 1 ||
      (fallbackOnlyViewport &&
        (state.splineContainerCount !== 0 || state.splineViewerCount !== 0)) ||
      state.splineViewerCount > 1
    ) {
      throw new Error(
        `Hero 3D progressive enhancement failed at ${viewport.width}px: ${JSON.stringify({ ...state, initialHeight, settledHeight })}`,
      );
    }
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await page.locator('.hero-actions a[href="/demo-ai"]').click();
  await page.waitForURL(/\/demo-ai$/);
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await page.locator('.hero-actions a[href="/kontakt?projectType=mvp_prototype"]').click();
  await page.waitForURL(/\/kontakt\?projectType=mvp_prototype$/);
}

async function assertProcessStory(page, baseUrl) {
  const desktop = { width: 1440, height: 900 };
  await page.setViewportSize(desktop);
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const desktopState = await page.locator('.business-flow').evaluate((section) => {
    const visualColumn = section.querySelector('.business-flow-visual-column');
    const visual = section.querySelector('.process-visual');
    const cta = section.querySelector('a.primary-action');
    const visualBox = visual?.getBoundingClientRect();
    return {
      ctaHref: cta?.getAttribute('href') ?? '',
      documentOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      headingCount: section.querySelectorAll('h2').length,
      stepCount: section.querySelectorAll('.business-flow-step').length,
      stepHeadingCount: section.querySelectorAll('.business-flow-step h3').length,
      stickyPosition: visualColumn ? getComputedStyle(visualColumn).position : '',
      stickyTop: visualColumn ? Number.parseFloat(getComputedStyle(visualColumn).top) : 0,
      visualHeight: visualBox?.height ?? 0,
      visualHidden: visual?.getAttribute('aria-hidden') === 'true',
      visualInteractiveCount:
        visual?.querySelectorAll('a, button, input, select, textarea').length ?? -1,
    };
  });
  if (
    desktopState.stepCount !== 5 ||
    desktopState.stepHeadingCount !== 5 ||
    desktopState.headingCount !== 1 ||
    desktopState.stickyPosition !== 'sticky' ||
    desktopState.stickyTop < 70 ||
    desktopState.visualHeight > desktop.height - desktopState.stickyTop + 1 ||
    !desktopState.visualHidden ||
    desktopState.visualInteractiveCount !== 0 ||
    desktopState.ctaHref !== '/kontakt?projectType=backend_api' ||
    desktopState.documentOverflow
  ) {
    throw new Error(`Desktop process story contract failed: ${JSON.stringify(desktopState)}`);
  }

  for (const step of [1, 3, 5]) {
    await page.locator(`[data-flow-step="${step}"]`).evaluate((node) => {
      node.scrollIntoView({ block: 'center', behavior: 'instant' });
    });
    await page.waitForFunction(
      (expectedStep) =>
        document.querySelector('.business-flow')?.getAttribute('data-active-step') === expectedStep,
      String(step),
    );
  }

  await page.locator('.business-flow a.primary-action').click();
  await page.waitForURL(/\/kontakt\?projectType=backend_api$/);

  for (const viewport of [
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    const state = await page.locator('.business-flow').evaluate((section) => {
      const steps = Array.from(section.querySelectorAll('.business-flow-step'));
      const visual = section.querySelector('.business-flow-visual-column');
      const visualBox = visual?.getBoundingClientRect();
      const firstStepBox = steps[0]?.getBoundingClientRect();
      return {
        activeStep: section.getAttribute('data-active-step'),
        documentOverflow:
          document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        hiddenSteps: steps.filter((step) => getComputedStyle(step).display === 'none').length,
        position: visual ? getComputedStyle(visual).position : '',
        stepCount: steps.length,
        visualBeforeSteps: (visualBox?.top ?? 0) < (firstStepBox?.top ?? 0),
      };
    });

    if (
      state.stepCount !== 5 ||
      state.hiddenSteps !== 0 ||
      state.position === 'sticky' ||
      !state.visualBeforeSteps ||
      state.activeStep !== '1' ||
      state.documentOverflow
    ) {
      throw new Error(
        `Static process story failed at ${viewport.width}px: ${JSON.stringify(state)}`,
      );
    }
  }
}

async function assertSevenDayDemo(page, baseUrl) {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    const state = await page.locator('.seven-day-demo').evaluate((section) => {
      const milestones = Array.from(section.querySelectorAll('.demo-milestone'));
      const milestoneBoxes = milestones.map((milestone) => milestone.getBoundingClientRect());
      const markerBoxes = Array.from(section.querySelectorAll('.milestone-marker'), (marker) =>
        marker.getBoundingClientRect(),
      );
      const resultPanel = section.querySelector('.result-panel');
      const inputPanel = section.querySelector('.client-inputs');
      const cta = section.querySelector('a.primary-action');
      const conversion = section.querySelector('.demo-conversion');
      const sectionBox = section.getBoundingClientRect();
      const resultBox = resultPanel?.getBoundingClientRect();
      const inputBox = inputPanel?.getBoundingClientRect();
      const ctaBox = cta?.getBoundingClientRect();
      const conversionBox = conversion?.getBoundingClientRect();
      const flow = section.querySelector('.timeline-flow');
      return {
        ctaCount: section.querySelectorAll('a.primary-action').length,
        ctaHeight: ctaBox?.height ?? 0,
        ctaHref: cta?.getAttribute('href') ?? '',
        ctaWidth: ctaBox?.width ?? 0,
        conversionWidth: conversionBox?.width ?? 0,
        documentOverflow:
          document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        flowDisplay: flow ? getComputedStyle(flow).display : '',
        headingCount: section.querySelectorAll('h2').length,
        hiddenMilestones: milestones.filter(
          (milestone) => getComputedStyle(milestone).display === 'none',
        ).length,
        inputCount: section.querySelectorAll('.input-list li').length,
        inputInside:
          !!inputBox &&
          inputBox.left >= sectionBox.left - 1 &&
          inputBox.right <= sectionBox.right + 1,
        markerLefts: markerBoxes.map((box) => box.left),
        milestoneCount: milestones.length,
        milestonePeriods: milestones.map(
          (milestone) => milestone.querySelector('.milestone-period')?.textContent?.trim() ?? '',
        ),
        milestoneTops: milestoneBoxes.map((box) => box.top),
        orderedTimeline: section.querySelector('.demo-timeline')?.tagName === 'OL',
        resultCount: section.querySelectorAll('.result-list li').length,
        resultInside:
          !!resultBox &&
          resultBox.left >= sectionBox.left - 1 &&
          resultBox.right <= sectionBox.right + 1,
        resultVisible: !!resultBox && resultBox.width > 0 && resultBox.height > 0,
        sectionWidth: sectionBox.width,
      };
    });

    const commonFailure =
      state.milestoneCount !== 4 ||
      state.hiddenMilestones !== 0 ||
      !state.orderedTimeline ||
      state.headingCount !== 1 ||
      state.resultCount !== 4 ||
      state.inputCount !== 4 ||
      !state.resultVisible ||
      !state.resultInside ||
      !state.inputInside ||
      state.ctaCount !== 1 ||
      state.ctaHref !== '/kontakt?projectType=mvp_prototype' ||
      state.ctaHeight < 44 ||
      state.documentOverflow ||
      JSON.stringify(state.milestonePeriods) !==
        JSON.stringify(['Dzień 1', 'Dni 2–3', 'Dni 4–5', 'Dni 6–7']);
    const horizontalFailure =
      viewport.width === 1440 &&
      (state.flowDisplay === 'none' ||
        state.milestoneTops.some((top) => Math.abs(top - state.milestoneTops[0]) > 2));
    const verticalFailure =
      viewport.width < 1100 &&
      (state.flowDisplay !== 'none' ||
        state.markerLefts.some((left) => Math.abs(left - state.markerLefts[0]) > 2) ||
        state.milestoneTops.some(
          (top, index) => index > 0 && top <= state.milestoneTops[index - 1],
        ));
    const mobileCtaFailure = viewport.width === 390 && state.ctaWidth < state.conversionWidth - 2;

    if (commonFailure || horizontalFailure || verticalFailure || mobileCtaFailure) {
      throw new Error(
        `Seven-day demo audit failed at ${viewport.width}px: ${JSON.stringify(state)}`,
      );
    }
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await page.locator('.seven-day-demo a.primary-action').click();
  await page.waitForURL(/\/kontakt\?projectType=mvp_prototype$/);
}

async function assertContactContexts(page, baseUrl) {
  const scenarios = [
    { query: '', value: '', guidance: 'Co jest dziś wykonywane ręcznie?' },
    {
      query: '?projectType=mvp_prototype',
      value: 'mvp_prototype',
      guidance: 'Co jest dziś wykonywane ręcznie?',
    },
    {
      query: '?projectType=software_house_partnership',
      value: 'software_house_partnership',
      guidance: 'Jaki moduł lub etap chcesz zlecić?',
    },
  ];
  for (const scenario of scenarios) {
    await page.goto(`${baseUrl}/kontakt${scenario.query}`, { waitUntil: 'networkidle' });
    if ((await page.locator('#projectType').inputValue()) !== scenario.value) {
      throw new Error(`Contact context did not select ${scenario.value || 'an empty value'}`);
    }
    await page.getByText(scenario.guidance, { exact: true }).waitFor();
    const details = page.locator('details.additional-information');
    if (await details.evaluate((node) => node.hasAttribute('open'))) {
      throw new Error('Optional budget details should be collapsed initially');
    }
  }

  await page.goto(`${baseUrl}/kontakt`, { waitUntil: 'networkidle' });
  await page.locator('button[type="submit"]').click();
  await page.locator('#contact-form-error-summary').waitFor();
  if (
    !(await page
      .locator('#contact-form-error-summary')
      .evaluate((node) => node === document.activeElement))
  ) {
    throw new Error('Invalid form did not focus the error summary');
  }

  await page.route('**/api/contact', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'accepted', message: 'accepted' }),
    });
  });
  await page.locator('#name').fill('Jan Kowalski');
  await page.locator('#email').fill('jan@example.net');
  await page.locator('#projectType').selectOption('mvp_prototype');
  await page.locator('#message').fill('Opis ręcznego procesu z wystarczającą liczbą szczegółów.');
  await page.locator('#consent').check();
  await page.locator('button[type="submit"]').click();
  await page.locator('.contact-success').waitFor();
  if (
    !(await page.locator('.contact-success').evaluate((node) => node === document.activeElement))
  ) {
    throw new Error('Successful form did not focus the success summary');
  }
  await page.getByRole('button', { name: 'Wyślij kolejne zapytanie' }).click();
  if ((await page.locator('#projectType').inputValue()) !== '') {
    throw new Error('Success reset did not restore an empty general contact form');
  }
}

async function assertBrandContrast(page, baseUrl) {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const ratios = await page.evaluate(() => {
    const parseRgb = (value) => (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    const luminance = (value) => {
      const channels = parseRgb(value).map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };
    const ratio = (foreground, background) => {
      const values = [luminance(foreground), luminance(background)].sort(
        (left, right) => right - left,
      );
      return (values[0] + 0.05) / (values[1] + 0.05);
    };
    const sample = document.createElement('span');
    sample.style.color = 'var(--color-primary)';
    sample.style.backgroundColor = 'var(--color-surface)';
    document.body.append(sample);
    const primaryStyle = getComputedStyle(sample);
    const primary = ratio(primaryStyle.color, primaryStyle.backgroundColor);
    sample.style.color = 'var(--text-on-dark)';
    sample.style.backgroundColor = 'var(--color-primary)';
    const actionStyle = getComputedStyle(sample);
    const action = ratio(actionStyle.color, actionStyle.backgroundColor);
    sample.remove();
    return { action, primary };
  });
  if (ratios.primary < 4.5 || ratios.action < 4.5) {
    throw new Error(`Brand contrast is below 4.5:1: ${JSON.stringify(ratios)}`);
  }
}

async function assertReducedMotion(page, baseUrl) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const state = await page.evaluate(() => {
    const reveal = document.querySelector('.reveal');
    const style = reveal ? getComputedStyle(reveal) : null;
    const flowSignalStyles = Array.from(document.querySelectorAll('.motion-flow-signal')).map(
      (signal) => getComputedStyle(signal),
    );
    const bentoCards = Array.from(document.querySelectorAll('.automation-bento-card'));
    const processNodes = Array.from(document.querySelectorAll('.process-node'));
    const demoMilestones = Array.from(document.querySelectorAll('.demo-milestone'));
    const demoSignal = document.querySelector('.timeline-flow .motion-flow-signal');
    const heroFallback = document.querySelector('[data-hero-fallback]');
    const heroFallbackStyle = heroFallback ? getComputedStyle(heroFallback) : null;
    return {
      animationDuration: style?.animationDuration ?? '',
      bentoVisible: bentoCards.every((card) => {
        const cardStyle = getComputedStyle(card);
        return cardStyle.opacity === '1' && cardStyle.transform === 'none';
      }),
      demoSignalStatic: !demoSignal || getComputedStyle(demoSignal).animationName === 'none',
      demoVisible:
        demoMilestones.length === 4 &&
        demoMilestones.every((milestone) => {
          const milestoneStyle = getComputedStyle(milestone);
          return (
            milestoneStyle.display !== 'none' &&
            milestoneStyle.opacity === '1' &&
            milestoneStyle.transform === 'none'
          );
        }),
      flowAnimationDurations: flowSignalStyles.map((signalStyle) => signalStyle.animationDuration),
      heroActionCount: document.querySelectorAll('.hero-actions a').length,
      heroContentVisible: Boolean(
        document.querySelector('.hero h1')?.getBoundingClientRect().height,
      ),
      heroFallbackVisible:
        heroFallbackStyle?.display !== 'none' &&
        Number.parseFloat(heroFallbackStyle?.opacity ?? '0') > 0,
      processStatic: processNodes.every((node) => getComputedStyle(node).transform === 'none'),
      processTransitionDurations: processNodes.map(
        (node) => getComputedStyle(node).transitionDuration,
      ),
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      splineViewerCount: document.querySelectorAll('spline-viewer').length,
      transitionDuration: style?.transitionDuration ?? '',
    };
  });
  const durationInMilliseconds = (value) =>
    Math.max(
      ...value.split(',').map((duration) => {
        const normalized = duration.trim();
        return normalized.endsWith('ms')
          ? Number.parseFloat(normalized)
          : Number.parseFloat(normalized) * 1000;
      }),
    );
  if (
    state.scrollBehavior !== 'auto' ||
    !state.bentoVisible ||
    !state.demoVisible ||
    !state.demoSignalStatic ||
    state.heroActionCount !== 2 ||
    !state.heroContentVisible ||
    !state.heroFallbackVisible ||
    state.splineViewerCount !== 0 ||
    !state.processStatic ||
    state.processTransitionDurations.some((duration) => durationInMilliseconds(duration) > 10) ||
    durationInMilliseconds(state.animationDuration) > 10 ||
    state.flowAnimationDurations.some((duration) => durationInMilliseconds(duration) > 10) ||
    durationInMilliseconds(state.transitionDuration) > 10
  ) {
    throw new Error(`Reduced-motion contract failed: ${JSON.stringify(state)}`);
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
}

async function navigationState(page) {
  return page.evaluate(() => {
    const header = document.querySelector('.site-header');
    const navigation = document.querySelector('#primary-navigation');
    const navLinks = document.querySelector('.nav-links');
    const menuToggle = document.querySelector('.menu-toggle');
    return {
      documentOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      headerOverflow: (header?.scrollWidth ?? 0) > (header?.clientWidth ?? 0) + 1,
      linkCount: document.querySelectorAll('.nav-links a').length,
      h1Count: document.querySelectorAll('h1').length,
      menuDisplay: menuToggle ? getComputedStyle(menuToggle).display : '',
      navigationDisplay: navigation ? getComputedStyle(navigation).display : '',
      navigationRight: navigation?.getBoundingClientRect().right ?? 0,
      headerRight: header?.getBoundingClientRect().right ?? 0,
      linksHeight: navLinks?.getBoundingClientRect().height ?? 0,
    };
  });
}

async function main() {
  await fs.access(path.join(distDirectory, 'dla-software-house', 'index.html'));
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ hasTouch: true });
  const page = await context.newPage();
  const matrix = [];

  try {
    for (const viewport of auditedViewports) {
      await page.setViewportSize(viewport);
      for (const route of auditedRoutes) {
        const response = await page.goto(`${server.baseUrl}${route}`, { waitUntil: 'networkidle' });
        const state = await pageAuditState(page, route);
        const problems = auditProblems(state, route, viewport, response?.status());
        const result = {
          route,
          viewport: `${viewport.width}x${viewport.height}`,
          status: problems.length === 0 ? 'PASS' : 'FAIL',
          problems,
        };
        matrix.push(result);
        if (problems.length > 0) {
          const screenshot = await captureDiagnostic(page, route, viewport);
          throw new Error(`${JSON.stringify(result)}; diagnostic screenshot: ${screenshot}`);
        }
      }
      if (viewport.width <= 920) {
        await assertMobileMenu(page, server.baseUrl, viewport);
      }
    }

    for (const width of [...mobileWidths, ...desktopWidths]) {
      await page.setViewportSize({ width, height: 1200 });
      await page.goto(`${server.baseUrl}/dla-software-house/`, { waitUntil: 'networkidle' });
      const state = await navigationState(page);
      if (
        state.documentOverflow ||
        state.headerOverflow ||
        state.linkCount !== 6 ||
        state.h1Count !== 1
      ) {
        throw new Error(`Partner navigation regression at ${width}px: ${JSON.stringify(state)}`);
      }
      if (
        desktopWidths.includes(width) &&
        (state.menuDisplay !== 'none' ||
          state.navigationDisplay !== 'flex' ||
          state.navigationRight > state.headerRight + 1 ||
          state.linksHeight > 46)
      ) {
        throw new Error(`Partner header overflow at ${width}px: ${JSON.stringify(state)}`);
      }
      if (mobileWidths.includes(width) && state.menuDisplay === 'none') {
        throw new Error(`Partner mobile menu is hidden at ${width}px: ${JSON.stringify(state)}`);
      }
    }

    await assertHeroThreeDimensionalEnhancement(page, server.baseUrl);
    await assertAutomationBento(page, server.baseUrl);
    await assertProcessStory(page, server.baseUrl);
    await assertSevenDayDemo(page, server.baseUrl);
    await assertContactContexts(page, server.baseUrl);
    await assertBrandContrast(page, server.baseUrl);
    await assertReducedMotion(page, server.baseUrl);

    await page.setViewportSize({ width: 1200, height: 1200 });
    await page.goto(`${server.baseUrl}/dla-software-house/`, { waitUntil: 'networkidle' });
    await page.locator('a[href="/kontakt?projectType=software_house_partnership"]').first().click();
    await page.waitForURL(/\/kontakt\?projectType=software_house_partnership$/);
    const contactPreselection = await page.locator('#projectType').inputValue();
    if (contactPreselection !== 'software_house_partnership') {
      throw new Error(`Formularz wybrał niepoprawny typ: ${contactPreselection}`);
    }

    console.log(JSON.stringify({ matrix, contactPreselection }));
    console.log(`Site browser smoke passed: ${matrix.length} route/viewport checks.`);
  } finally {
    await page.close();
    await context.close();
    await browser.close();
    await server.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
