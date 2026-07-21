const fs = require('node:fs');
const path = require('node:path');
const BUILD_SHA_PATTERN = /^[0-9a-f]{7,64}$/;

function replaceBuildShaMeta(html, buildSha) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const matchingTags = metaTags.filter((tag) => {
    const name = tag.match(/\bname\s*=\s*(["'])(.*?)\1/i)?.[2];
    return name?.toLowerCase() === 'protolume-build-sha';
  });
  if (matchingTags.length !== 1) {
    throw new Error(
      `Expected exactly one protolume-build-sha meta tag, found ${matchingTags.length}.`,
    );
  }
  const tag = matchingTags[0];
  if (!/\bcontent\s*=\s*(["'])[^"']*\1/i.test(tag)) {
    throw new Error('protolume-build-sha meta tag is missing its content attribute.');
  }
  const updatedTag = tag.replace(/(\bcontent\s*=\s*)(["'])[^"']*\2/i, `$1$2${buildSha}$2`);
  if (updatedTag === tag) {
    const currentContent = tag.match(/\bcontent\s*=\s*(["'])(.*?)\1/i)?.[2];
    if (currentContent !== buildSha) {
      throw new Error('protolume-build-sha meta tag content was not replaced.');
    }
    return html;
  }
  const updatedHtml = html.replace(tag, updatedTag);
  if (
    !updatedHtml.includes(`content="${buildSha}"`) &&
    !updatedHtml.includes(`content='${buildSha}'`)
  ) {
    throw new Error('Updated HTML does not contain the expected build SHA meta value.');
  }
  return updatedHtml;
}

function productionEnvironment(source = process.env) {
  const apiUrl = source.API_URL ?? '__PUBLIC_CONFIG_REQUIRED__:apiUrl';
  const publicSiteUrl = source.PUBLIC_SITE_URL ?? '__PUBLIC_CONFIG_REQUIRED__:publicSiteUrl';
  const rawIndexingEnabled = source.PUBLIC_SITE_INDEXING ?? 'false';
  const publicSalesEmail =
    source.PUBLIC_SALES_EMAIL ?? '__PUBLIC_CONFIG_REQUIRED__:publicSalesEmail';
  const publicPrivacyEmail =
    source.PUBLIC_PRIVACY_EMAIL ?? '__PUBLIC_CONFIG_REQUIRED__:publicPrivacyEmail';
  const hasExplicitBuildSha =
    source.PUBLIC_BUILD_SHA !== undefined && source.PUBLIC_BUILD_SHA !== '';
  const buildSha = hasExplicitBuildSha ? source.PUBLIC_BUILD_SHA : 'unknown';
  if (hasExplicitBuildSha && !BUILD_SHA_PATTERN.test(buildSha)) {
    throw new Error('PUBLIC_BUILD_SHA must be 7-64 lowercase hexadecimal characters.');
  }
  if (!['true', 'false'].includes(rawIndexingEnabled)) {
    throw new Error('PUBLIC_SITE_INDEXING musi mieć wartość true albo false.');
  }

  return {
    production: true,
    apiUrl,
    publicSiteUrl,
    indexingEnabled: rawIndexingEnabled === 'true',
    publicSalesEmail,
    publicPrivacyEmail,
    buildSha,
  };
}

function writeProductionEnvironment(source = process.env) {
  const outputPath = path.resolve(__dirname, '../src/environments/environment.prod.ts');
  const environment = productionEnvironment(source);
  fs.writeFileSync(
    outputPath,
    `export const environment = ${JSON.stringify(environment, null, 2)} as const;\n`,
    'utf8',
  );
  const indexPath = path.resolve(__dirname, '../src/index.html');
  const index = fs.readFileSync(indexPath, 'utf8');
  const updatedIndex = replaceBuildShaMeta(index, environment.buildSha);
  fs.writeFileSync(indexPath, updatedIndex, 'utf8');
  const writtenIndex = fs.readFileSync(indexPath, 'utf8');
  if (
    !writtenIndex.includes(`content="${environment.buildSha}"`) &&
    !writtenIndex.includes(`content='${environment.buildSha}'`)
  ) {
    throw new Error('Production index.html does not contain the expected build SHA.');
  }
}

if (require.main === module) {
  writeProductionEnvironment();
}

module.exports = { productionEnvironment, replaceBuildShaMeta, writeProductionEnvironment };
