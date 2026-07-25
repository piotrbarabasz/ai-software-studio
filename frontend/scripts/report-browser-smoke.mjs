import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist', 'aisoftware-studio', 'browser');
const reportRoute = '/przyklad-demo';
const previewRoute = '/demo-ai';
const viewportSizes = [390, 768, 1024, 1440];

function contentType(filePath) {
  switch (path.extname(filePath)) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.js':
      return 'text/javascript; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.xml':
      return 'application/xml; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.ico':
      return 'image/x-icon';
    case '.map':
      return 'application/json; charset=utf-8';
    case '.txt':
      return 'text/plain; charset=utf-8';
    case '.woff':
      return 'font/woff';
    case '.woff2':
      return 'font/woff2';
    default:
      return 'application/octet-stream';
  }
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function fileOrDirectoryResponse(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const normalizedPath = cleanPath.replace(/^\/+/, '');
  const candidates = [];

  if (cleanPath === '/' || cleanPath === '') {
    candidates.push(path.join(distDir, 'index.html'));
  } else {
    const directPath = path.join(distDir, normalizedPath);
    candidates.push(directPath);
    candidates.push(path.join(distDir, normalizedPath, 'index.html'));
    candidates.push(path.join(distDir, `${normalizedPath}.html`));
  }

  for (const candidate of candidates) {
    if ((await exists(candidate)) && (await fs.stat(candidate)).isFile()) {
      return { filePath: candidate, status: 200 };
    }
  }

  const fallback = path.join(distDir, '404', 'index.html');
  if (await exists(fallback)) {
    return { filePath: fallback, status: 404 };
  }

  return null;
}

async function startServer() {
  const server = createServer(async (req, res) => {
    const requestUrl = req.url ?? '/';
    const mapped = await fileOrDirectoryResponse(requestUrl);

    if (!mapped) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }

    try {
      const body = await fs.readFile(mapped.filePath);
      res.statusCode = mapped.status;
      res.setHeader('Content-Type', contentType(mapped.filePath));
      res.end(body);
    } catch (error) {
      res.statusCode = 500;
      res.end(String(error));
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to start local server');
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}

function rectSummary(rect) {
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    top: Math.round(rect.top),
    right: Math.round(rect.right),
    bottom: Math.round(rect.bottom),
    left: Math.round(rect.left),
  };
}

function intersects(a, b) {
  return !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
}

async function gatherReportState(page) {
  return page.evaluate(() => {
    const select = (selector) => document.querySelector(selector);
    const shell = select('app-site-shell');
    const header = select('.site-header');
    const footer = select('.site-footer');
    const hero = select('.report-hero');
    const title = select('#demo-example-title');
    const status = select('.status-pill');
    const actions = select('.hero-actions');
    const cards = Array.from(document.querySelectorAll('.four-column-grid article'));
    const planList = select('.plan-list');
    const planItems = Array.from(document.querySelectorAll('.plan-list li'));
    const scenarios = select('.scenario-grid');
    const risks = select('.risk-grid');
    const ctaButton = select('.print-action');

    const readRect = (element) => {
      if (!element) {
        return null;
      }
      const rect = element.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
      };
    };

    const visible = (element) => {
      if (!element) {
        return false;
      }
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        rect.width > 0 &&
        rect.height > 0
      );
    };

    return {
      reportRouteClass: shell?.classList.contains('is-report-route') ?? false,
      headerVisible: visible(header),
      footerVisible: visible(footer),
      heroVisible: visible(hero),
      titleVisible: visible(title),
      statusVisible: visible(status),
      actionsVisible: visible(actions),
      ctaVisible: visible(ctaButton),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      bodyClientWidth: document.body.clientWidth,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      heroRect: readRect(hero),
      titleRect: readRect(title),
      statusRect: readRect(status),
      actionsRect: readRect(actions),
      cardRects: cards.map(readRect),
      cardCount: cards.length,
      planListVisible: visible(planList),
      planItemRects: planItems.map(readRect),
      scenarioRect: readRect(scenarios),
      riskRect: readRect(risks),
      planGridColumns: planList ? getComputedStyle(planList).gridTemplateColumns : '',
      fourGridColumns: cards.length
        ? getComputedStyle(cards[0].parentElement).gridTemplateColumns
        : '',
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '',
      h1Text: title?.textContent?.trim() ?? '',
      statusText: status?.textContent?.trim() ?? '',
    };
  });
}

async function assertReportLayout(page, width) {
  const state = await gatherReportState(page);
  const problems = [];

  if (!state.reportRouteClass) {
    problems.push('missing is-report-route class');
  }

  if (
    state.scrollWidth > state.clientWidth + 1 ||
    state.bodyScrollWidth > state.bodyClientWidth + 1
  ) {
    problems.push(`horizontal overflow detected (${state.scrollWidth}/${state.clientWidth})`);
  }

  if (!state.heroVisible || !state.titleVisible || !state.statusVisible) {
    problems.push('hero/title/status is not visible');
  }

  if (!state.ctaVisible) {
    problems.push('print CTA is not visible before print');
  }

  if (state.cardCount !== 5) {
    problems.push(`expected 5 starting-point cards, got ${state.cardCount}`);
  }

  if (width >= 1024 && state.cardRects.length === 5) {
    const firstRowTop = state.cardRects[0]?.top;
    const secondRow = state.cardRects.filter(
      (rect) => Math.abs((rect?.top ?? 0) - (firstRowTop ?? 0)) > 1,
    );
    if (secondRow.length < 2) {
      problems.push('starting-point grid is not balanced into a conscious second row');
    }
  }

  if (width >= 1024 && state.planItemRects.length > 0) {
    const narrowPlanItem = Math.min(...state.planItemRects.map((rect) => rect?.width ?? 0));
    if (narrowPlanItem < 160) {
      problems.push(`plan items are too narrow (${Math.round(narrowPlanItem)}px)`);
    }
  }

  const overlapPairs = [
    ['hero', state.heroRect, state.scenarioRect],
    ['hero', state.heroRect, state.riskRect],
  ];
  for (const [label, left, right] of overlapPairs) {
    if (left && right && intersects(left, right)) {
      problems.push(`unexpected overlap between ${label} section and following content`);
    }
  }

  if (state.actionsRect && state.heroRect && state.actionsRect.bottom > state.heroRect.bottom + 1) {
    problems.push('hero actions overflow the hero block');
  }

  if (state.h1Text.length < 5 || state.statusText.length < 3) {
    problems.push('h1/status text looks incomplete');
  }

  return { state, problems };
}

async function assertPrintLayout(page) {
  await page.emulateMedia({ media: 'print' });
  const reportState = await gatherReportState(page);
  const previewState = await page.evaluate(() => {
    const shell = document.querySelector('app-site-shell');
    const header = document.querySelector('.site-header');
    const footer = document.querySelector('.site-footer');
    const buttons = Array.from(document.querySelectorAll('button'));
    const pageRoot = document.querySelector('.demo-example-page');
    const cards = Array.from(document.querySelectorAll('.four-column-grid article'));

    return {
      shellClass: shell?.classList.contains('is-report-route') ?? false,
      headerVisible:
        !!header &&
        getComputedStyle(header).display !== 'none' &&
        header.getBoundingClientRect().height > 0,
      footerVisible:
        !!footer &&
        getComputedStyle(footer).display !== 'none' &&
        footer.getBoundingClientRect().height > 0,
      buttonsVisible: buttons.some((button) => {
        const style = getComputedStyle(button);
        const rect = button.getBoundingClientRect();
        return style.display !== 'none' && rect.width > 0 && rect.height > 0;
      }),
      pageWidth: pageRoot?.getBoundingClientRect().width ?? 0,
      cardRects: cards.map((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
      }),
      printPageSize:
        getComputedStyle(document.documentElement).getPropertyValue('--report-page-size') ?? '',
    };
  });

  const problems = [];
  if (reportState.headerVisible || reportState.footerVisible) {
    problems.push('report header/footer still visible in print media');
  }
  if (reportState.actionsVisible || reportState.ctaVisible) {
    problems.push('print CTA/buttons still visible in print media');
  }
  if (!reportState.reportRouteClass || !previewState.shellClass) {
    problems.push('report route class missing during print media');
  }
  if (reportState.scrollWidth > reportState.clientWidth + 1) {
    problems.push('print media created horizontal overflow');
  }
  if (previewState.buttonsVisible) {
    problems.push('buttons are visible in print media');
  }

  const pageShot = path.join(process.cwd(), 'tmp');
  await fs.mkdir(pageShot, { recursive: true });
  await page.screenshot({
    path: path.join(pageShot, 'przyklad-demo-print.png'),
    fullPage: true,
  });

  return {
    state: reportState,
    previewState,
    problems,
    screenshotPath: path.join(pageShot, 'przyklad-demo-print.png'),
  };
}

async function main() {
  const distExists = await exists(distDir);
  if (!distExists) {
    throw new Error(`Missing build output at ${distDir}. Run npm run build:development first.`);
  }

  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  try {
    for (const width of viewportSizes) {
      await page.setViewportSize({ width, height: 1600 });
      await page.goto(`${server.baseUrl}${reportRoute}`, { waitUntil: 'networkidle' });
      const { state, problems } = await assertReportLayout(page, width);
      results.push({
        viewport: width,
        route: reportRoute,
        problems,
        grid: state.fourGridColumns,
        plan: state.planGridColumns,
      });
      if (problems.length > 0) {
        throw new Error(`${reportRoute} @ ${width}px failed: ${problems.join('; ')}`);
      }
    }

    await page.setViewportSize({ width: 1280, height: 1600 });
    await page.goto(`${server.baseUrl}${reportRoute}`, { waitUntil: 'networkidle' });
    const printReport = await assertPrintLayout(page);
    results.push({
      viewport: 'print',
      route: reportRoute,
      problems: printReport.problems,
      screenshotPath: printReport.screenshotPath,
    });
    if (printReport.problems.length > 0) {
      throw new Error(`print media failed: ${printReport.problems.join('; ')}`);
    }

    await page.emulateMedia({ media: 'screen' });
    await page.goto(`${server.baseUrl}${previewRoute}`, { waitUntil: 'networkidle' });
    const previewState = await page.evaluate(() => {
      const shell = document.querySelector('app-site-shell');
      const header = document.querySelector('.site-header');
      const footer = document.querySelector('.site-footer');
      return {
        shellClass: shell?.classList.contains('is-report-route') ?? false,
        headerVisible:
          !!header &&
          getComputedStyle(header).display !== 'none' &&
          header.getBoundingClientRect().height > 0,
        footerVisible:
          !!footer &&
          getComputedStyle(footer).display !== 'none' &&
          footer.getBoundingClientRect().height > 0,
      };
    });
    results.push({
      viewport: 'preview-screen',
      route: previewRoute,
      shellClass: previewState.shellClass,
      headerVisible: previewState.headerVisible,
      footerVisible: previewState.footerVisible,
    });

    if (previewState.shellClass) {
      throw new Error(`${previewRoute} should not receive the report route class`);
    }

    if (!previewState.headerVisible || !previewState.footerVisible) {
      throw new Error(`${previewRoute} lost its normal shell chrome in screen media`);
    }

    console.log('Browser smoke results:');
    for (const result of results) {
      console.log(JSON.stringify(result));
    }
    console.log('Browser smoke passed.');
  } finally {
    await page.close();
    await browser.close();
    await server.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
