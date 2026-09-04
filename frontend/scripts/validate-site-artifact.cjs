const fs = require('node:fs');
const path = require('node:path');

const {
  loadEnvironment,
  normalizeOrigin,
  publicPrerenderRoutes,
  validateSeoArtifacts,
} = require('./site-build-utils.cjs');
const publicBrandManifest = require('../config/public-brand.json');

const DEFAULT_ARTIFACT_ROOT = path.resolve(__dirname, '../dist/aisoftware-studio/browser');
const PUBLIC_BRAND_NAME = 'Protolume';
const RETIRED_PUBLIC_BRAND_PATTERN = /AISoftware Studio|AI Software Studio/i;
const PRIMARY_NAVIGATION_ROUTES = [
  '/rozwiazania',
  '/demo-ai',
  '/development',
  '/dla-software-house',
  '/studio',
  '/kontakt',
];
const REQUIRED_BRAND_ASSETS = [
  'favicon.svg',
  'protolume-logo-horizontal-dark.svg',
  'protolume-logo-horizontal-light.svg',
  'protolume-symbol.svg',
  'protolume-symbol-mono.svg',
];
const socialPreviewPath = publicBrandManifest.assets.socialPreviewPath;
const socialPreviewType = publicBrandManifest.assets.socialPreviewType;
const socialPreviewName = path.basename(socialPreviewPath);
REQUIRED_BRAND_ASSETS.push(socialPreviewName);
const SOCIAL_PREVIEW_WIDTH = 1200;
const SOCIAL_PREVIEW_HEIGHT = 630;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const IMAGE_EXTENSIONS_BY_MIME = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/svg+xml': '.svg',
};
const BUILD_SHA_PATTERN = /^[0-9a-f]{7,64}$/;
const FORBIDDEN_COPY_PHRASES = [
  'publiczny kod',
  'publicznie widoczny kod',
  'repozytorium projektu',
  'zobacz kod demonstracji',
  'zobacz kod aplikacji i wdrożenia',
];
const FORBIDDEN_PRODUCTION_VALUE_PATTERN =
  /__PUBLIC_CONFIG_REQUIRED__|\blocalhost\b|\.example\.com\b/i;

function matchingTags(html, tagName, identifyingAttribute, identifyingValue) {
  const tags = html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'gi')) ?? [];
  const identifyingPattern = new RegExp(
    `\\b${identifyingAttribute}\\s*=\\s*(["'])${identifyingValue}\\1`,
    'i',
  );
  return tags.filter((candidate) => identifyingPattern.test(candidate));
}

function buildShaMetaValues(html) {
  return (html.match(/<meta\b[^>]*>/gi) ?? [])
    .filter(
      (tag) =>
        tag.match(/\bname\s*=\s*(["'])(.*?)\1/i)?.[2]?.toLowerCase() === 'protolume-build-sha',
    )
    .map((tag) => tag.match(/\bcontent\s*=\s*(["'])(.*?)\1/i)?.[2] ?? null);
}

function validateSocialPreviewAsset(assetPath, mimeType) {
  const errors = [];
  const expectedExtension = IMAGE_EXTENSIONS_BY_MIME[mimeType];
  const actualExtension = path.extname(assetPath).toLowerCase();
  if (!expectedExtension) {
    errors.push(`social preview uses unsupported MIME type ${mimeType}`);
    return errors;
  }
  if (actualExtension !== expectedExtension) {
    errors.push(
      `social preview extension ${actualExtension || '(none)'} does not match MIME type ${mimeType}`,
    );
  }
  if (mimeType !== 'image/png') {
    errors.push(`social preview must use image/png, received ${mimeType}`);
    return errors;
  }

  const png = fs.readFileSync(assetPath);
  const hasPngHeader =
    png.length >= 24 &&
    png.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE) &&
    png.toString('ascii', 12, 16) === 'IHDR';
  if (!hasPngHeader) {
    errors.push('social preview PNG has an invalid PNG header');
    return errors;
  }

  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  if (width !== SOCIAL_PREVIEW_WIDTH || height !== SOCIAL_PREVIEW_HEIGHT) {
    errors.push(
      `social preview PNG must be ${SOCIAL_PREVIEW_WIDTH}x${SOCIAL_PREVIEW_HEIGHT}, received ${width}x${height}`,
    );
  }
  return errors;
}

function extractAttribute(html, tagName, identifyingAttribute, identifyingValue, resultAttribute) {
  const resultPattern = new RegExp(`\\b${resultAttribute}=["']([^"']+)["']`, 'i');
  const tag = matchingTags(html, tagName, identifyingAttribute, identifyingValue)[0];
  return tag?.match(resultPattern)?.[1];
}

function routeDocumentPath(root, route) {
  return route === '/'
    ? path.join(root, 'index.html')
    : path.join(root, route.slice(1), 'index.html');
}

function collectHtmlFiles(root) {
  const htmlFiles = [];
  const pendingDirectories = [root];
  while (pendingDirectories.length > 0) {
    const directory = pendingDirectories.pop();
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        pendingDirectories.push(entryPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
        htmlFiles.push(entryPath);
      }
    }
  }
  return htmlFiles;
}

function visibleTextFromHtml(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function validatePublicCopy(html, documentLabel) {
  const errors = [];
  const visibleText = visibleTextFromHtml(html).toLowerCase();
  if (/<[^>]+\bhref=["'][^"']*github\.com[^"']*["']/i.test(html)) {
    errors.push(`${documentLabel}: github.com links are not allowed in the public artifact`);
  }
  for (const phrase of FORBIDDEN_COPY_PHRASES) {
    if (visibleText.includes(phrase)) {
      errors.push(`${documentLabel}: public copy must not contain ${phrase}`);
    }
  }
  return errors;
}

function validateSiteArtifact(artifactRoot, environment) {
  const root = path.resolve(artifactRoot);
  const origin = normalizeOrigin(environment.publicSiteUrl);
  const errors = [];
  for (const asset of REQUIRED_BRAND_ASSETS) {
    if (!fs.existsSync(path.join(root, 'assets', asset))) {
      errors.push(`missing brand asset in production artifact: /assets/${asset}`);
    }
  }
  const socialPreviewAsset = path.join(root, 'assets', socialPreviewName);
  if (fs.existsSync(socialPreviewAsset)) {
    errors.push(...validateSocialPreviewAsset(socialPreviewAsset, socialPreviewType));
  }
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
    const canonicalTags = matchingTags(html, 'link', 'rel', 'canonical');
    const descriptionTags = matchingTags(html, 'meta', 'name', 'description');
    const robotsTags = matchingTags(html, 'meta', 'name', 'robots');
    const openGraphUrlTags = matchingTags(html, 'meta', 'property', 'og:url');
    const charsetTags = html.match(/<meta\b[^>]*\bcharset\s*=\s*(["'])utf-8\1[^>]*>/gi) ?? [];
    const titleTags = html.match(/<title\b[^>]*>[\s\S]*?<\/title>/gi) ?? [];

    if (route === '/') {
      const buildShaValues = buildShaMetaValues(html);
      const expectedBuildSha = environment.buildSha;
      if (!BUILD_SHA_PATTERN.test(expectedBuildSha ?? '')) {
        errors.push('public route /: environment.buildSha must be a deployed SHA');
      } else if (buildShaValues.length !== 1 || buildShaValues[0] !== expectedBuildSha) {
        errors.push(
          'public route /: protolume-build-sha meta tag must match environment.buildSha exactly once',
        );
      }
      if (!/\bdata-hero-visual(?:\s|=|>)/i.test(html)) {
        errors.push('public route /: prerendered hero must contain the lightweight workflow');
      }
      if (/<spline-viewer\b/i.test(html)) {
        errors.push('public route /: prerendered hero must not instantiate the Spline viewer');
      }
    }

    if (canonical !== expectedUrl) {
      errors.push(`${route}: canonical does not match PUBLIC_SITE_URL`);
    }
    if (canonicalTags.length !== 1) {
      errors.push(`${route}: expected exactly one canonical, received ${canonicalTags.length}`);
    }
    if (openGraphUrl !== expectedUrl) {
      errors.push(`${route}: og:url does not match PUBLIC_SITE_URL`);
    }
    if (openGraphUrlTags.length !== 1) {
      errors.push(`${route}: expected exactly one og:url, received ${openGraphUrlTags.length}`);
    }
    if (robots !== expectedRobots) {
      errors.push(`${route}: robots must be ${expectedRobots}`);
    }
    if (robotsTags.length !== 1) {
      errors.push(`${route}: expected exactly one robots meta tag, received ${robotsTags.length}`);
    }
    if (!/<html\b[^>]*\blang\s*=\s*(["'])pl\1[^>]*>/i.test(html)) {
      errors.push(`${route}: html lang must be pl`);
    }
    if (charsetTags.length !== 1) {
      errors.push(
        `${route}: expected exactly one utf-8 charset meta tag, received ${charsetTags.length}`,
      );
    }
    if (titleTags.length !== 1 || !title?.trim()) {
      errors.push(`${route}: expected exactly one non-empty title`);
    }
    if (descriptionTags.length !== 1 || !description?.trim()) {
      errors.push(`${route}: expected exactly one non-empty description`);
    }
    if (FORBIDDEN_PRODUCTION_VALUE_PATTERN.test(html)) {
      errors.push(`${route}: prerendered document contains localhost or a placeholder value`);
    }
    if (!html.includes(PUBLIC_BRAND_NAME)) {
      errors.push(`${route}: prerendered document must show ${PUBLIC_BRAND_NAME}`);
    }
    if (RETIRED_PUBLIC_BRAND_PATTERN.test(html)) {
      errors.push(`${route}: prerendered document contains a retired public brand name`);
    }
    if (
      ![title, openGraphTitle, twitterTitle].every((value) => value?.includes(PUBLIC_BRAND_NAME))
    ) {
      errors.push(`${route}: titles must identify ${PUBLIC_BRAND_NAME}`);
    }
    if (![description, openGraphDescription, twitterDescription].every(Boolean)) {
      errors.push(`${route}: descriptions must be present`);
    }
    const socialPreviewUrl = `${origin}${socialPreviewPath}`;
    if (
      openGraphImage !== socialPreviewUrl ||
      twitterImage !== socialPreviewUrl ||
      openGraphImageType !== socialPreviewType ||
      twitterCard !== 'summary_large_image'
    ) {
      errors.push(
        `${route}: social preview metadata must use ${socialPreviewPath} (${socialPreviewType})`,
      );
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
    if (route === '/rozwiazania') {
      for (const fragment of [
        '#asystent-wiedzy',
        '#automatyzacja-wiadomosci-i-dokumentow',
        '#panel-operacyjny',
      ]) {
        if (!new RegExp(`<a\\b[^>]*\\bhref=["']${fragment}["']`, 'i').test(html)) {
          errors.push(`${route}: missing native anchor link to ${fragment}`);
        }
      }
      for (const projectType of [
        'rag_chatbot_demo',
        'business_process_automation',
        'custom_web_app',
      ]) {
        if (!html.includes(`/kontakt?projectType=${projectType}`)) {
          errors.push(`${route}: missing contact CTA with projectType=${projectType}`);
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

  for (const documentPath of collectHtmlFiles(root)) {
    const html = fs.readFileSync(documentPath, 'utf8');
    const relativePath = path.relative(root, documentPath) || path.basename(documentPath);
    errors.push(...validatePublicCopy(html, relativePath));
  }

  errors.push(
    ...validateSeoArtifacts(environment, {
      production: true,
      artifactDirectory: root,
    }),
  );

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

module.exports = { validateSiteArtifact, validateSocialPreviewAsset };
