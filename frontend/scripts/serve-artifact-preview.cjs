// Isolated loopback preview; never use this server or fixed nonce for production hosting.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '../dist/artifact-preview/browser');
const csp =
  "default-src 'none'; script-src 'self'; style-src 'self' 'nonce-local-artifact-preview'; media-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'";
if (!fs.existsSync(path.join(root, 'index.html')))
  throw new Error('Run npm run build:artifact-preview first.');
http
  .createServer((request, response) => {
    try {
      const url = decodeURIComponent(new URL(request.url, 'http://127.0.0.1:4402').pathname);
      const target = path.resolve(root, '.' + (url === '/' ? '/index.html' : url));
      const relative = path.relative(root, target);
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        response.writeHead(403);
        response.end();
        return;
      }
      response.setHeader('Content-Security-Policy', csp);
      response.setHeader('X-Robots-Tag', 'noindex, nofollow');
      response.setHeader('Cache-Control', 'no-store');
      if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
        response.writeHead(404);
        response.end();
        return;
      }
      const types = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.wav': 'audio/wav',
        '.woff2': 'font/woff2',
      };
      response.setHeader('Content-Type', types[path.extname(target)] ?? 'application/octet-stream');
      response.end(fs.readFileSync(target));
    } catch {
      response.writeHead(400);
      response.end();
    }
  })
  .listen(4402, '127.0.0.1', () => console.log('Private artifact preview: http://127.0.0.1:4402'));
