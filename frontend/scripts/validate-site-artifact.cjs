const fs = require('node:fs');
const path = require('node:path');

const {
  loadEnvironment,
  normalizeOrigin,
  publicPrerenderRoutes,
} = require('./site-build-utils.cjs');

const DEFAULT_ARTIFACT_ROOT = path.resolve(__dirname, '../dist/aisoftware-studio/browser');
const PUBLIC_BRAND_NAME = 'Protolume';
const RETIRED_PUBLIC_BRAND_PATTERN = /AISoftware Studio|AI Software Studio/i;
const PRIMARY_NAVIGATION_ROUTES = ['/demo-ai', '/development', '/studio', '/kontakt'];

function extractAttribute(html, tagName, identifyingAttribute, identifyingValue, resultAttribute) {
  const tags = html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'gi')) ?? [];
  const identifyingPattern = new RegExp(
    `\\b${identifyingAttribute}=["']${identifyingValue}["']`,
    'i',
  );
  const resultPattern = new RegExp(`\\b${resultAttribute}=["']([^"']+)["']`, 'i');
  const tag = tags.find((candidate) => identifyingPattern.test(candidate));
  return tag?.match(resultPattern)?.[1];
}

function routeDocumentPath(root, route) {
  return route === '/'
    ? path.join(root, 'index.html')
    : path.join(root, route.slice(1), 'index.html');
}

function validateSiteArtifact(artifactRoot, environment) {
  const root = path.resolve(artifactRoot);
  const origin = normalizeOrigin(environment.publicSiteUrl);
  const errors = [];
  const routes = [...publicPrerenderRoutes(), '/404'];

  for (const route of routes) {
    const documentPath = routeDocumentPath(root, route);
    if (!fs.existsSync(documentPath)) {
      errors.push(`missing prerendered document: ${route}`);
      continue;
    }

    const html = fs.readFileSync(documentPath, 'utf8');
    const expectedUrl = `${origin}${route === '/' ? '' : route}`;
    const expectedRobots =
      route === '/404' || !environment.indexingEnabled ? 'noindex, follow' : 'index, follow';
    const canonical = extractAttribute(html, 'link', 'rel', 'canonical', 'href');
    const openGraphUrl = extractAttribute(html, 'meta', 'property', 'og:url', 'content');
    const robots = extractAttribute(html, 'meta', 'name', 'robots', 'content');
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
    const description = extractAttribute(html, 'meta', 'name', 'description', 'content');
    const openGraphTitle = extractAttribute(html, 'meta', 'property', 'og:title', 'content');
    const openGraphDescription = extractAttribute(
      html,
      'meta',
      'property',
      'og:description',
      'content',
    );
    const openGraphImage = extractAttribute(html, 'meta', 'property', 'og:image', 'content');
    const openGraphImageType = extractAttribute(
      html,
      'meta',
      'property',
      'og:image:type',
      'content',
    );
    const twitterCard = extractAttribute(html, 'meta', 'name', 'twitter:card', 'content');
    const twitterTitle = extractAttribute(html, 'meta', 'name', 'twitter:title', 'content');
    const twitterDescription = extractAttribute(
      html,
      'meta',
      'name',
      'twitter:description',
      'content',
    );
    const twitterImage = extractAttribute(html, 'meta', 'name', 'twitter:image', 'content');
    const primaryNavigation = html.match(
      /<nav\b(?=[^>]*\bid=["']primary-navigation["'])[^>]*>[\s\S]*?<\/nav>/i,
    )?.[0];

    if (canonical !== expectedUrl) {
      errors.push(`${route}: canonical does not match PUBLIC_SITE_URL`);
    }
    if (openGraphUrl !== expectedUrl) {
      errors.push(`${route}: og:url does not match PUBLIC_SITE_URL`);
    }
    if (robots !== expectedRobots) {
      errors.push(`${route}: robots must be ${expectedRobots}`);
    }
    if (!html.includes(PUBLIC_BRAND_NAME)) {
      errors.push(`${route}: prerendered document must show ${PUBLIC_BRAND_NAME}`);
    }
    if (RETIRED_PUBLIC_BRAND_PATTERN.test(html)) {
      errors.push(`${route}: prerendered document contains a retired public brand name`);
    }
    if (
      ![
        title,
        description,
        openGraphTitle,
        openGraphDescription,
        twitterTitle,
        twitterDescription,
      ].every((value) => value?.includes(PUBLIC_BRAND_NAME))
    ) {
      errors.push(`${route}: titles and descriptions must identify ${PUBLIC_BRAND_NAME}`);
    }
    const socialPreviewUrl = `${origin}/assets/protolume-social-preview.png`;
    if (
      openGraphImage !== socialPreviewUrl ||
      twitterImage !== socialPreviewUrl ||
      openGraphImageType !== 'image/png' ||
      twitterCard !== 'summary_large_image'
    ) {
      errors.push(`${route}: social preview metadata must use the Protolume PNG`);
    }
    if (!html.includes(`${origin}#website`) || !html.includes(`${origin}#professional-service`)) {
      errors.push(`${route}: structured data does not match PUBLIC_SITE_URL`);
    }
    if (!html.includes(`\"name\":\"${PUBLIC_BRAND_NAME}\"`)) {
      errors.push(`${route}: structured data must identify ${PUBLIC_BRAND_NAME}`);
    }
    if (/googletagmanager\.com|google-analytics\.com|\bgtag\s*\(/i.test(html)) {
      errors.push(`${route}: analytics must not load without an approved integration`);
    }
    if (!origin.includes('.run.app') && /\.run\.app/i.test(html)) {
      errors.push(`${route}: artifact contains an unexpected run.app URL`);
    }
    if (/\binert(?:\s|=|>)/i.test(html)) {
      errors.push(`${route}: prerendered document must not contain inert content`);
    }
    if (!primaryNavigation) {
      errors.push(`${route}: prerendered document is missing primary navigation`);
    } else {
      for (const navigationRoute of PRIMARY_NAVIGATION_ROUTES) {
        const escapedRoute = navigationRoute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (!new RegExp(`<a\\b[^>]*\\bhref=["']${escapedRoute}["']`, 'i').test(primaryNavigation)) {
          errors.push(
            `${route}: primary navigation is missing a native link to ${navigationRoute}`,
          );
        }
      }

      if (PRIMARY_NAVIGATION_ROUTES.includes(route)) {
        const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const activeLinkPattern = new RegExp(
          `<a\\b(?=[^>]*\\bhref=["']${escapedRoute}["'])(?=[^>]*\\baria-current=["']page["'])[^>]*>`,
          'i',
        );
        if (!activeLinkPattern.test(primaryNavigation)) {
          errors.push(`${route}: active primary navigation link must have aria-current="page"`);
        }
      }
    }
    if (
      !/<a\b(?=[^>]*\bclass=["'][^"']*\bskip-link\b[^"']*["'])(?=[^>]*\bhref=["']#main-content["'])[^>]*>/i.test(
        html,
      )
    ) {
      errors.push(`${route}: prerendered document is missing a working skip link`);
    }
    if (
      !/<main\b(?=[^>]*\bid=["']main-content["'])(?=[^>]*\btabindex=["']-1["'])[^>]*>/i.test(html)
    ) {
      errors.push(`${route}: prerendered document is missing the focusable main target`);
    }
  }

  for (const artifactName of ['sitemap.xml', 'robots.txt']) {
    const artifactPath = path.join(root, artifactName);
    if (!fs.existsSync(artifactPath)) {
      errors.push(`missing ${artifactName}`);
      continue;
    }
    const content = fs.readFileSync(artifactPath, 'utf8');
    if (!content.includes(origin)) {
      errors.push(`${artifactName}: missing PUBLIC_SITE_URL`);
    }
    if (!origin.includes('.run.app') && /\.run\.app/i.test(content)) {
      errors.push(`${artifactName}: contains an unexpected run.app URL`);
    }
  }

  return errors;
}

function main() {
  const errors = validateSiteArtifact(DEFAULT_ARTIFACT_ROOT, loadEnvironment('production'));
  if (errors.length > 0) {
    throw new Error(
      `Błąd metadanych w artefakcie produkcyjnym:\n${errors.map((error) => `- ${error}`).join('\n')}`,
    );
  }
  console.log('Metadane, indeksowanie i publiczny URL artefaktu są spójne.');
}

if (require.main === module) {
  main();
}

module.exports = { validateSiteArtifact };
