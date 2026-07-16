const fs = require('node:fs');
const path = require('node:path');

const frontendRoot = path.resolve(__dirname, '..');
const nginx = fs.readFileSync(path.join(frontendRoot, 'nginx.conf'), 'utf8');
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

if (errors.length > 0) {
  console.error('Błąd konfiguracji tras statycznych:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
}
