const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const { generatedDirectory, loadEnvironment } = require('./site-build-utils.cjs');

const TEMPLATE_PATH = path.resolve(__dirname, '../nginx-security-headers.conf');
const OUTPUT_PATH = path.join(generatedDirectory(), 'nginx-security-headers.conf');
const DEFAULT_ARTIFACT_ROOT = path.resolve(__dirname, '../dist/aisoftware-studio/browser');

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

function hashInlineScript(content) {
  return `'sha256-${crypto.createHash('sha256').update(content).digest('base64')}'`;
}

function collectInlineScriptHashes(artifactRoot = DEFAULT_ARTIFACT_ROOT) {
  if (!fs.existsSync(artifactRoot)) {
    throw new Error(`Brak artefaktu HTML wymaganego do wygenerowania CSP: ${artifactRoot}`);
  }

  const hashes = new Set();
  for (const filePath of listHtmlFiles(artifactRoot)) {
    const html = fs.readFileSync(filePath, 'utf8');
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      const attributes = match[1];
      if (/\bsrc\s*=/i.test(attributes)) {
        continue;
      }
      if (!/\btype=["']application\/ld\+json["']/i.test(attributes)) {
        throw new Error(
          `Niedozwolony skrypt inline w ${path.relative(artifactRoot, filePath)}. ` +
            'CSP dopuszcza wyłącznie hashowany JSON-LD.',
        );
      }
      hashes.add(hashInlineScript(match[2]));
    }
  }

  if (hashes.size === 0) {
    throw new Error('Prerenderowany artefakt nie zawiera oczekiwanego JSON-LD.');
  }
  return [...hashes].sort();
}

function renderSecurityHeaders(environment, template, inlineScriptHashes) {
  const apiOrigin = new URL(environment.apiUrl).origin;
  const robotsHeader = environment.indexingEnabled ? '' : 'noindex, follow';
  const scriptHashes = inlineScriptHashes.join(' ');

  return template
    .replaceAll('__CSP_CONNECT_SRC__', apiOrigin)
    .replaceAll('__CSP_SCRIPT_HASHES__', scriptHashes)
    .replaceAll('__ROBOTS_HEADER__', robotsHeader);
}

function writeSecurityHeaders(
  environment = loadEnvironment('production'),
  artifactRoot = DEFAULT_ARTIFACT_ROOT,
) {
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const rendered = renderSecurityHeaders(
    environment,
    template,
    collectInlineScriptHashes(artifactRoot),
  );

  if (/__[A-Z0-9_]+__/.test(rendered)) {
    throw new Error('Wygenerowane nagłówki Nginx nadal zawierają placeholder.');
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, rendered, 'utf8');
}

if (require.main === module) {
  writeSecurityHeaders();
}

module.exports = {
  collectInlineScriptHashes,
  hashInlineScript,
  renderSecurityHeaders,
  writeSecurityHeaders,
};
