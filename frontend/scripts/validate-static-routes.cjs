const fs = require('node:fs');
const path = require('node:path');

const frontendRoot = path.resolve(__dirname, '..');
const nginx = fs.readFileSync(path.join(frontendRoot, 'nginx.conf'), 'utf8');
const securityHeaders = fs.readFileSync(
  path.join(frontendRoot, 'nginx-security-headers.conf'),
  'utf8',
);
const routes = fs
  .readFileSync(path.join(frontendRoot, 'src/prerender-routes.txt'), 'utf8')
  .split(/\r?\n/)
  .map((route) => route.trim())
  .filter(Boolean);
const errors = [];

for (const route of routes) {
  if (route === '/404') {
    continue;
  }

  const filePath = route === '/' ? '/index.html' : `${route}/index.html`;
  if (!nginx.includes(`location = ${route} {`) || !nginx.includes(`try_files ${filePath} =404;`)) {
    errors.push(`Nginx does not serve the prerendered route: ${route}`);
  }
}

for (const artifact of ['/robots.txt', '/sitemap.xml']) {
  if (!nginx.includes(`location = ${artifact} {`)) {
    errors.push(`Nginx does not serve generated ${artifact}`);
  }
}

if (/\.run\.app|localhost/i.test(nginx)) {
  errors.push('Nginx contains a technical or local public origin');
}

for (const directive of [
  'gzip on;',
  'gzip_vary on;',
  'public, max-age=31536000, immutable',
  'no-cache, max-age=0, must-revalidate',
  'no-store, no-cache, must-revalidate, proxy-revalidate',
]) {
  if (!nginx.includes(directive)) {
    errors.push(`Nginx is missing hosting directive: ${directive}`);
  }
}

for (const header of [
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Permissions-Policy',
  'X-Frame-Options',
  'Strict-Transport-Security',
  'Content-Security-Policy',
]) {
  if (!securityHeaders.includes(header)) {
    errors.push(`Nginx is missing security header: ${header}`);
  }
}

if (!securityHeaders.includes('__CSP_CONNECT_SRC__')) {
  errors.push('CSP does not have a build-time API origin placeholder');
}

if (!securityHeaders.includes('__CSP_SCRIPT_HASHES__')) {
  errors.push('CSP does not have build-time hashes for prerendered inline scripts');
}

if (securityHeaders.includes('Content-Security-Policy-Report-Only')) {
  errors.push('CSP is not enforced');
}

if (/script-src[^;]*'unsafe-inline'/.test(securityHeaders)) {
  errors.push("script-src must not contain 'unsafe-inline'");
}

if ((nginx.match(/add_header X-Robots-Tag/g) ?? []).length > 0) {
  errors.push('Nginx route configuration duplicates the generated X-Robots-Tag header');
}

if (errors.length > 0) {
  console.error('Błąd konfiguracji tras statycznych:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
}
