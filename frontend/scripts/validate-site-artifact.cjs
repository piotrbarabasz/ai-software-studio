const fs = require('node:fs');
const path = require('node:path');

const {
  loadEnvironment,
  normalizeOrigin,
  publicPrerenderRoutes,
} = require('./site-build-utils.cjs');

const DEFAULT_ARTIFACT_ROOT = path.resolve(__dirname, '../dist/aisoftware-studio/browser');

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

    if (canonical !== expectedUrl) {
      errors.push(`${route}: canonical does not match PUBLIC_SITE_URL`);
    }
    if (openGraphUrl !== expectedUrl) {
      errors.push(`${route}: og:url does not match PUBLIC_SITE_URL`);
    }
    if (robots !== expectedRobots) {
      errors.push(`${route}: robots must be ${expectedRobots}`);
    }
    if (!html.includes(`${origin}#website`) || !html.includes(`${origin}#professional-service`)) {
      errors.push(`${route}: structured data does not match PUBLIC_SITE_URL`);
    }
    if (/googletagmanager\.com|google-analytics\.com|\bgtag\s*\(/i.test(html)) {
      errors.push(`${route}: analytics must not load without an approved integration`);
    }
    if (!origin.includes('.run.app') && /\.run\.app/i.test(html)) {
      errors.push(`${route}: artifact contains an unexpected run.app URL`);
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
