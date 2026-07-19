const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_ARTIFACT_ROOT = path.resolve(__dirname, '../dist/aisoftware-studio/browser');
const DEFAULT_HEADERS_PATH = path.resolve(__dirname, '../generated/nginx-security-headers.conf');

function listHtmlFiles(root) {
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...listHtmlFiles(entryPath));
    } else if (entry.name.endsWith('.html')) {
      files.push(entryPath);
    }
  }
  return files;
}

function extractPolicy(headers, headerName = 'Content-Security-Policy') {
  const escapedHeaderName = headerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return headers.match(new RegExp(`add_header\\s+${escapedHeaderName}\\s+"([^"]+)"`, 'i'))?.[1];
}

function parseDirectives(policy) {
  const directives = new Map();
  for (const rawDirective of policy.split(';')) {
    const tokens = rawDirective.trim().split(/\s+/).filter(Boolean);
    if (tokens.length > 0) {
      directives.set(tokens[0], tokens.slice(1));
    }
  }
  return directives;
}

function scriptHash(content) {
  return `'sha256-${crypto.createHash('sha256').update(content).digest('base64')}'`;
}

function validateCspArtifact(artifactRoot, headers) {
  const root = path.resolve(artifactRoot);
  const errors = [];
  const policy = extractPolicy(headers);

  if (!policy) {
    return ['missing enforced Content-Security-Policy header'];
  }
  if (extractPolicy(headers, 'Content-Security-Policy-Report-Only')) {
    errors.push('obsolete Content-Security-Policy-Report-Only header is still present');
  }

  const directives = parseDirectives(policy);
  const requiredDirectives = new Map([
    ['default-src', ["'self'"]],
    ['base-uri', ["'self'"]],
    ['form-action', ["'self'"]],
    ['frame-ancestors', ["'none'"]],
    ['object-src', ["'none'"]],
    ['script-src-attr', ["'none'"]],
  ]);
  for (const [directive, expectedSources] of requiredDirectives) {
    const actualSources = directives.get(directive);
    if (!actualSources || expectedSources.some((source) => !actualSources.includes(source))) {
      errors.push(`${directive} is missing required sources: ${expectedSources.join(' ')}`);
    }
  }

  const scriptSources = directives.get('script-src') ?? [];
  const styleSources = directives.get('style-src') ?? [];
  if (scriptSources.includes("'unsafe-inline'")) {
    errors.push("script-src must not contain 'unsafe-inline'");
  }
  if (!scriptSources.includes("'self'")) {
    errors.push("script-src must allow 'self' for Angular bundles");
  }
  if (!styleSources.includes("'self'")) {
    errors.push("style-src must allow 'self' for the extracted stylesheet");
  }
  for (const reportingDirective of ['report-uri', 'report-to']) {
    if (directives.has(reportingDirective)) {
      errors.push(`${reportingDirective} must not point to an unimplemented reporting endpoint`);
    }
  }

  for (const filePath of listHtmlFiles(root)) {
    const relativePath = path.relative(root, filePath);
    const html = fs.readFileSync(filePath, 'utf8');
    if (/\son[a-z0-9_-]+\s*=/i.test(html)) {
      errors.push(`${relativePath}: inline event handler violates script-src-attr 'none'`);
    }

    const stylesheetLinks = [...html.matchAll(/<link\b(?=[^>]*\brel=["']stylesheet["'])[^>]*>/gi)];
    if (stylesheetLinks.length === 0) {
      errors.push(`${relativePath}: missing extracted stylesheet`);
    }
    for (const match of stylesheetLinks) {
      if (!/\bhref=["'][^"']+["']/i.test(match[0])) {
        errors.push(`${relativePath}: stylesheet is missing href`);
      }
    }

    const hasInlineStyles = /<style\b/i.test(html) || /\sstyle\s*=/i.test(html);
    if (hasInlineStyles && !styleSources.includes("'unsafe-inline'")) {
      errors.push(`${relativePath}: Angular prerender styles require style-src 'unsafe-inline'`);
    }

    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      const attributes = match[1];
      if (/\bsrc\s*=/i.test(attributes)) {
        continue;
      }
      if (!/\btype=["']application\/ld\+json["']/i.test(attributes)) {
        errors.push(`${relativePath}: executable inline script is not allowed`);
        continue;
      }
      const hash = scriptHash(match[2]);
      if (!scriptSources.includes(hash)) {
        errors.push(`${relativePath}: JSON-LD hash ${hash} is missing from script-src`);
      }
    }
  }

  return errors;
}

function main() {
  const headers = fs.readFileSync(DEFAULT_HEADERS_PATH, 'utf8');
  const errors = validateCspArtifact(DEFAULT_ARTIFACT_ROOT, headers);
  if (errors.length > 0) {
    throw new Error(
      `Naruszenia CSP w artefakcie produkcyjnym:\n${errors.map((error) => `- ${error}`).join('\n')}`,
    );
  }
  console.log('Wymuszany CSP pokrywa skrypty, style i zasoby prerenderowanych stron.');
}

if (require.main === module) {
  main();
}

module.exports = { extractPolicy, parseDirectives, validateCspArtifact };
