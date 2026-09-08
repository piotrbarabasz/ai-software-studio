// Development-only server for inspecting the built artifact with its generated CSP.
// Production HTTP status, nginx headers and redirects still require the container gates.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '../dist/aisoftware-studio/browser');
const headers = fs.readFileSync(
  path.resolve(__dirname, '../generated/nginx-security-headers.conf'),
  'utf8',
);
const csp = headers.match(/add_header Content-Security-Policy "([^"]+)"/)?.[1];
if (!csp || !fs.existsSync(path.join(root, 'index.html')))
  throw new Error('Build the production artifact before starting the audit server.');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.pdf': 'application/pdf',
};
http
  .createServer((request, response) => {
    try {
      const url = decodeURIComponent(new URL(request.url, 'http://127.0.0.1:4400').pathname);
      let target = path.resolve(root, '.' + url);
      const relative = path.relative(root, target);
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        response.writeHead(403);
        response.end();
        return;
      }
      if (fs.existsSync(target) && fs.statSync(target).isDirectory())
        target = path.join(target, 'index.html');
      if (!fs.existsSync(target)) {
        response.statusCode = 404;
        target = path.join(root, '404/index.html');
      }
      response.setHeader('Content-Type', types[path.extname(target)] ?? 'application/octet-stream');
      response.setHeader('Cache-Control', 'no-store');
      response.setHeader('Content-Security-Policy', csp);
      response.end(fs.readFileSync(target));
    } catch {
      response.writeHead(400);
      response.end();
    }
  })
  .listen(4400, '127.0.0.1', () => console.log('Audit artifact: http://127.0.0.1:4400'));
