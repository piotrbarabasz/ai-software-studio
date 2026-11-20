import { existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), 'dist');

function readIfExists(root, name) {
  const path = join(root, name);
  return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

export function verifyArtifact(mode, root = defaultRoot) {
  const problems = [];
  if (!['preview', 'production'].includes(mode)) return ['Unsupported artifact mode'];
  const index = readIfExists(root, 'index.html');
  const privacy = readIfExists(root, 'polityka-prywatnosci/index.html');
  const robots = readIfExists(root, 'robots.txt');
  const sitemap = readIfExists(root, 'sitemap.xml');
  const files = [
    'styles.css', 'form.js', 'assets/favicon.svg',
    'assets/protolume-logo-horizontal-dark.svg', 'assets/icons.svg',
    'assets/LUCIDE-LICENSE.txt',
  ];
  for (const name of files) {
    if (!existsSync(join(root, name))) problems.push('Missing static asset: ' + name);
  }
  if (!index) problems.push('Missing index.html');
  if (!privacy) problems.push('Missing privacy policy HTML');
  if (!robots) problems.push('Missing robots.txt');
  if (!sitemap) problems.push('Missing sitemap.xml');
  if (!index || !privacy || !robots || !sitemap) return problems;

  if ((index.match(/<h1\b/g) || []).length !== 1) problems.push('The landing page must have one H1');
  if (!index.includes('Protolume')) problems.push('Brand identity is missing');
  const sprite = readIfExists(root, 'assets/icons.svg');
  if (sprite) {
    for (const match of index.matchAll(/href="\/assets\/icons\.svg#(icon-[a-z0-9-]+)"/g)) {
      if (!sprite.includes('id="' + match[1] + '"')) {
        problems.push('Lucide icon missing from bundled sprite: ' + match[1]);
      }
    }
  }
  for (const section of ['obszary', 'wspolpraca', 'rozwiazania', 'kontakt']) {
    if (!index.includes('href="#' + section + '"') || !index.includes('id="' + section + '"')) {
      problems.push('Navigation section is missing or broken: ' + section);
    }
  }
  if (!index.includes('name="email"') || !index.includes('name="name"') ||
      !index.includes('name="message"')) problems.push('Required contact form fields are missing');
  if (!index.includes('href="/polityka-prywatnosci/"')) problems.push('Missing privacy policy link');
  if (/__FORM_|__ROBOTS__/.test(index)) problems.push('Unresolved build placeholders');
  if (!sitemap.includes('https://protolume.pl/')) problems.push('Wrong sitemap origin');
  if (mode === 'preview') {
    if (!index.includes('name="robots" content="noindex, nofollow"')) problems.push('Preview landing page is indexable');
    if (!privacy.includes('noindex, nofollow')) problems.push('Preview privacy page is indexable');
    if (!robots.includes('Disallow: /')) problems.push('Preview robots do not disallow indexing');
    if (!index.includes('data-endpoint=""')) problems.push('Preview is unexpectedly connected to a live form');
  } else {
    if (!index.includes('name="robots" content="index, follow"')) problems.push('Production landing page is noindex');
    if (!privacy.includes('index, follow')) problems.push('Production privacy page is noindex');
    if (!robots.includes('Allow: /')) problems.push('Production robots disallow indexing');
    if (!/data-endpoint="https:\/\/formspree\.io\/f\/[A-Za-z0-9]+"/.test(index))
      problems.push('Production form endpoint is missing');
    if (!privacy.includes('Formspree')) problems.push('Production privacy policy does not disclose Formspree');
    if (/Wersja robocza|nie jest polityką prywatności przeznaczoną do publikacji/.test(privacy))
      problems.push('Draft privacy policy in production');
  }
  return problems;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = process.argv.includes('--production') ? 'production' : 'preview';
  const problems = verifyArtifact(mode);
  if (problems.length) {
    console.error('Protolume artifact validation failed:\n' + problems.map(s => '- ' + s).join('\n'));
    process.exitCode = 1;
  } else {
    console.log('Protolume v3 ' + mode + ' artifacts verified.');
  }
}
