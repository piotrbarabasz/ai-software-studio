#!/usr/bin/env node
// A dependency-free static build. No FastAPI, SSR process, or API keys on the client.
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { readAndValidatePublicLegalConfig } = require('../frontend/scripts/validate-public-legal-config.cjs');
const here = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(here, '..');
const output = join(here, 'dist');
const publicOrigin = 'https://protolume.pl';
const contactAddress = 'kontakt@protolume.pl';

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function listSection(title, items) {
  return '<section><h2>' + escapeHtml(title) + '</h2><ul>' +
    items.map((item) => '<li>' + escapeHtml(item) + '</li>').join('') +
    '</ul></section>';
}

function legalDocument(config, production) {
  const summary = config
    ? 'Informacje dotyczące danych przesłanych przez formularz kontaktowy na stronie Protolume.'
    : 'Wersja robocza do przeglądu. Przed publikacją konieczna jest zweryfikowana konfiguracja prawna.';
  const contents = config ? [
    '<section><h2>Administrator danych</h2><p>' + escapeHtml(config.administrator.name) +
      '</p><p>Adres korespondencyjny: ' + escapeHtml(config.administrator.correspondenceAddress) + '</p></section>',
    '<section><h2>Zakres danych</h2><p>Imię, adres e-mail i treść wiadomości, jeśli została podana. Dostawca formularza może przetwarzać także dane techniczne niezbędne do obsługi i ochrony zgłoszenia.</p></section>',
    listSection('Cele przetwarzania', config.processing.purposes),
    listSection('Podstawy prawne', config.processing.legalBases),
    listSection('Odbiorcy danych', config.processing.recipients),
    listSection('Dostawcy infrastruktury', config.processing.infrastructureProviders),
    listSection('Dostawcy poczty', config.processing.emailProviders),
    listSection('Okresy przechowywania', config.processing.retention),
    listSection('Twoje prawa', config.processing.dataSubjectRights),
    '<section><h2>Kontakt w sprawie danych</h2><p><a href="mailto:' + contactAddress + '">' + contactAddress + '</a></p></section>',
    '<p>Ostatnia aktualizacja: ' + escapeHtml(config.updatedAt) + '</p>',
  ].join('\n') : '<p class="legal-notice">Ta strona nie jest polityką prywatności przeznaczoną do publikacji. Wymaga uzupełnienia rzeczywistych danych administratora, odbiorców i podstaw przetwarzania.</p>';
  const robots = production ? 'index, follow' : 'noindex, nofollow';
  return '<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<meta name="robots" content="' + robots + '">' +
    '<title>Polityka prywatności — Protolume</title><meta name="description" content="' + escapeHtml(summary) + '">' +
    '<link rel="canonical" href="' + publicOrigin + '/polityka-prywatnosci/">' +
    '<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">' +
    '<link rel="stylesheet" href="/styles.css"></head><body><div class="page">' +
    '<header class="header"><a href="/" aria-label="Powrót na stronę główną"><img class="brand" src="/assets/protolume-logo-horizontal-dark.svg" alt="Protolume" width="180" height="36"></a></header>' +
    '<main id="main-content" class="legal-page"><h1>Polityka prywatności</h1><p>' + escapeHtml(summary) + '</p>' +
    contents + '</main><footer class="footer"><span>© Protolume</span><a href="/">Strona główna</a>' +
    '<a href="mailto:' + contactAddress + '">' + contactAddress + '</a></footer></div></body></html>';
}

export function build(mode = 'preview', config = process.env) {
  if (!['preview', 'production'].includes(mode)) throw new Error('Unsupported mode');
  const production = mode === 'production';
  const endpoint = (config.FORM_ENDPOINT || '').trim();
  const isBackendContact = endpoint === '/api/contact/brief';

  if (endpoint && !isBackendContact && !/^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(endpoint)) {
    throw new Error('FORM_ENDPOINT must be /api/contact/brief or an HTTPS Formspree form URL.');
  }
  if (production && !endpoint) throw new Error('Production build requires FORM_ENDPOINT.');
  if (endpoint && !config.PUBLIC_LEGAL_CONFIG_PATH) {
    throw new Error('A configured contact form requires PUBLIC_LEGAL_CONFIG_PATH, including in preview.');
  }
  const legal = endpoint
    ? readAndValidatePublicLegalConfig(config.PUBLIC_LEGAL_CONFIG_PATH, { mode: 'production' })
    : null;

  if (endpoint && !isBackendContact) {
    const suppliers = [
      ...legal.processing.recipients,
      ...legal.processing.infrastructureProviders,
      ...legal.processing.emailProviders,
    ].join(' ');
    if (!/formspree/i.test(suppliers)) {
      throw new Error('Legal configuration must identify Formspree as a form data recipient/provider.');
    }
  }

  rmSync(output, { recursive: true, force: true });
  mkdirSync(join(output, 'assets'), { recursive: true });
  mkdirSync(join(output, 'polityka-prywatnosci'), { recursive: true });

  let index = readFileSync(join(here, 'index.html'), 'utf8');
  index = index
    .replace('__FORM_ACTION__', escapeHtml(endpoint || '#'))
    .replace('__FORM_ENDPOINT__', escapeHtml(endpoint))
    .replace('__FORM_DISABLED__', endpoint ? '' : 'disabled')
    .replace('__ROBOTS__', production ? 'index, follow' : 'noindex, nofollow')
    .replace('__BUILD_SHA__', escapeHtml(config.PUBLIC_BUILD_SHA || (production ? 'unknown' : 'preview')));
  writeFileSync(join(output, 'index.html'), index);
  cpSync(join(here, 'styles.css'), join(output, 'styles.css'));
  cpSync(join(here, 'motion.css'), join(output, 'motion.css'));
  cpSync(join(here, 'form.js'), join(output, 'form.js'));
  cpSync(join(here, 'motion.js'), join(output, 'motion.js'));
  // Local Lucide SVG sprite and ISC license; no external CDN, runtime dependency or CSP change.
  cpSync(join(here, 'icons.svg'), join(output, 'assets', 'icons.svg'));
  cpSync(join(here, 'LUCIDE-LICENSE.txt'), join(output, 'assets', 'LUCIDE-LICENSE.txt'));
  for (const asset of ['protolume-logo-horizontal-dark.svg', 'favicon.svg']) {
    cpSync(join(repositoryRoot, 'frontend', 'src', 'assets', asset), join(output, 'assets', asset));
  }
  writeFileSync(join(output, 'polityka-prywatnosci', 'index.html'), legalDocument(legal, production));
  writeFileSync(join(output, 'robots.txt'),
    production ? 'User-agent: *\nAllow: /\nSitemap: ' + publicOrigin + '/sitemap.xml\n'
      : 'User-agent: *\nDisallow: /\n');
  writeFileSync(join(output, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    '<url><loc>' + publicOrigin + '/</loc></url>' +
    '<url><loc>' + publicOrigin + '/polityka-prywatnosci/</loc></url>' +
    '</urlset>\n');
  return output;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = process.argv.includes('--production') ? 'production' : 'preview';
  try {
    console.log('Static Protolume v3 build: ' + build(mode));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
