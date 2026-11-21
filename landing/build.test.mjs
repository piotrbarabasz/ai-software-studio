import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from './build.mjs';

function read(path) {
  return readFileSync(new URL('./dist/' + path, import.meta.url), 'utf8');
}

test('preview is a minimal one-page offer with clear areas and honest contact fallback', () => {
  build('preview', {});
  const html = read('index.html');
  const policy = read('polityka-prywatnosci/index.html');
  const robots = read('robots.txt');

  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /Automatyzacje AI dla firm, które tracą czas/);
  assert.match(html, /<main id="main-content"/);
  assert.match(html, /id="obszary"/);
  assert.match(html, /id="wspolpraca"/);
  assert.match(html, /id="rozwiazania"/);
  assert.match(html, /id="kontakt"/);

  // Six concrete automation areas, three collaboration steps, four deliverable types.
  assert.equal((html.match(/<article class="area-card">/g) || []).length, 6);
  assert.equal((html.match(/<li class="step">/g) || []).length, 3);
  assert.equal((html.match(/<li class="solution-item">/g) || []).length, 4);
  assert.match(html, /Obsługa zapytań i wiadomości/);
  assert.match(html, /Leady i zgłoszenia/);
  assert.match(html, /Dokumenty i dane/);
  assert.match(html, /Zadania wieloetapowe/);
  assert.match(html, /Integracje i kanały/);
  assert.match(html, /Wiedza firmy/);
  assert.match(html, /Dedykowane aplikacje/);

  assert.match(html, /href="#obszary"/);
  assert.match(html, /href="#kontakt"/);
  assert.doesNotMatch(html, /class="identity"|zaufani[ae]|case stud(?:y|ies)|portfolio|demo w 7 dni/i);
  assert.match(html, /<nav class="site-nav" aria-label="Nawigacja po stronie">/);
  assert.match(html, /Napisz do nas/);
  assert.match(html, /Co tworzymy\?/);

  assert.match(html, /id="contact-form"/);
  assert.match(html, /name="name"/);
  assert.match(html, /name="email"/);
  assert.match(html, /name="message"/);
  assert.match(html, /data-endpoint=""/);
  assert.match(html, /action="#"/);
  assert.match(html, /id="contact-submit" type="submit" disabled/);
  assert.doesNotMatch(read('form.js'), /window\.location\.href/);
  assert.match(html, /noindex, nofollow/);
  assert.doesNotMatch(html, /__FORM_|__ROBOTS__/);
  assert.match(policy, /Wersja robocza/);
  assert.match(policy, /noindex, nofollow/);
  assert.match(robots, /Disallow: \//);
});

test('sticky section navigation and self-hosted Lucide icons use consistent brand voice', () => {
  build('preview', {});
  const html = read('index.html');
  const sprite = read('assets/icons.svg');
  const license = read('assets/LUCIDE-LICENSE.txt');
  const css = read('styles.css');

  for (const target of ['obszary', 'wspolpraca', 'rozwiazania', 'kontakt']) {
    assert.match(html, new RegExp('<a[^>]+href="#' + target + '"'));
    assert.match(html, new RegExp('id="' + target + '"'));
  }
  assert.equal((html.match(/<nav\b/g) || []).length, 1);
  assert.match(css, /\.header\s*\{[^}]*position: sticky/);
  assert.match(css, /scroll-padding-top/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media \(max-width: 540px\)/);

  const referenced = [...html.matchAll(/href="\/assets\/icons\.svg#(icon-[a-z0-9-]+)"/g)]
    .map((match) => match[1]);
  assert.ok(referenced.length >= 14, 'Expected icons in CTA, cards, navigation, and solutions');
  for (const id of referenced) {
    assert.ok(sprite.includes('id="' + id + '"'), 'Unbundled Lucide icon: ' + id);
  }
  assert.match(license, /ISC License/);
  assert.match(license, /Lucide Icons and Contributors/);
  assert.doesNotMatch(html, /Projektuję|Napisz do mnie|Co mogę stworzyć|Pokaż mi proces/i);
  assert.doesNotMatch(html, /Piotr Barabasz|<span aria-hidden="true">[↗↓]/);
  assert.match(html, /Projektujemy rozwiązania/);
  assert.match(html, /Opowiedz nam, co zabiera czas/);
  assert.match(html, /Wyślij wiadomość/);
});

test('UI-001 matches Figma V3 hero structure while retaining static build guarantees', () => {
  build('preview', {});
  const html = read('index.html');
  const css = read('styles.css');
  const icons = read('assets/icons.svg');

  assert.match(html, /class="header-brand"/);
  assert.match(html, /class="hero-copy"/);
  assert.match(html, /class="hero-visual" aria-hidden="true"/);
  assert.match(html, /class="hero-visual__card hero-visual__card--input"/);
  assert.match(html, /class="hero-visual__card hero-visual__card--output"/);
  assert.match(html, /Dane wejściowe/);
  assert.match(html, /Mniej ręcznej pracy/);
  assert.match(html, /class="hero-note"/);
  assert.match(html, /src="\/assets\/protolume-logo-horizontal-dark\.svg"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /href="#obszary"/);
  assert.match(html, /href="#kontakt"/);
  assert.match(icons, /id="icon-file-text"/);
  assert.match(icons, /id="icon-zap"/);
  assert.match(css, /--color-brand:\s*#6946f5/);
  assert.match(css, /--color-page:\s*#f9fafd/);
  assert.match(css, /\.hero\s*\{[^}]*display:\s*grid/);
  assert.match(css, /@media \(max-width: 540px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(html, /<script[^>]+(?:three|gsap)(?:\.min)?\.js/i);
});


test('UI-002 preserves all 6+3+4 content items with semantic numbering and Lucide icons', () => {
  build('preview', {});
  const html = read('index.html');
  const css = read('styles.css');
  const sprite = read('assets/icons.svg');

  const areas = [...html.matchAll(/<article class="area-card">([\s\S]*?)<\/article>/g)];
  const steps = [...html.matchAll(/<li class="step">([\s\S]*?)<\/li>/g)];
  const solutions = [...html.matchAll(/<li class="solution-item">([\s\S]*?)<\/li>/g)];

  assert.equal(areas.length, 6);
  assert.equal(steps.length, 3);
  assert.equal(solutions.length, 4);

  for (const [i, item] of areas.entries()) {
    const number = String(i + 1).padStart(2, '0');
    assert.ok(item[1].includes('class="area-index" aria-hidden="true">' + number + '</span>'));
    assert.match(item[1], /class="area-icon" aria-hidden="true"/);
    assert.match(item[1], /href="\/assets\/icons\.svg#icon-/);
  }
  for (const [i, item] of steps.entries()) {
    const number = String(i + 1).padStart(2, '0');
    assert.ok(item[1].includes('class="step-number" aria-hidden="true">' + number + '</span>'));
    assert.match(item[1], /<h3>/);
    assert.match(item[1], /<p>/);
  }
  for (const [i, item] of solutions.entries()) {
    const number = String(i + 1).padStart(2, '0');
    assert.ok(item[1].includes('class="solution-index" aria-hidden="true">' + number + '</span>'));
    assert.match(item[1], /class="solution-icon" aria-hidden="true"/);
    assert.match(item[1], /href="\/assets\/icons\.svg#icon-/);
  }

  assert.match(css, /\.area-card\s*\{[^}]*display:\s*flex/);
  assert.match(css, /\.area-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,/);
  assert.match(css, /\.process-section\s*\{[^}]*background:\s*var\(--color-dark\)/);
  assert.match(css, /\.solutions-list\s*\{[^}]*grid-template-columns:\s*repeat\(2,/);
  assert.match(css, /@media \(max-width: 1050px\)/);
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /@media \(max-width: 540px\)/);

  assert.match(html, /id="contact-form"/);
  assert.match(html, /name="name"/);
  assert.match(html, /name="email"/);
  assert.match(html, /name="message"/);
  assert.match(html, /href="#obszary"/);
  assert.match(html, /href="#wspolpraca"/);
  assert.match(html, /href="#rozwiazania"/);
  assert.match(html, /href="#kontakt"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);

  // All visual icons are bundled Lucide SVG references, never emoji.
  for (const match of html.matchAll(/href="\/assets\/icons\.svg#(icon-[a-z0-9-]+)"/g)) {
    assert.ok(sprite.includes('id="' + match[1] + '"'), 'Missing Lucide icon: ' + match[1]);
  }
  assert.doesNotMatch(html, /[\u{1F300}-\u{1FAFF}]/u);
});


test('MOTION-001 bundles local animated enhancements without changing the static content', () => {
  build('preview', {});
  const html = read('index.html');
  const motionStyles = read('motion.css');
  const motionScript = read('motion.js');
  const baseStyles = read('styles.css');

  assert.match(html, /<link rel="stylesheet" href="\/motion.css">/);
  assert.match(html, /<script src="\/motion.js" defer><\/script>/);
  assert.match(html, /<script src="\/form.js" defer><\/script>/);
  assert.doesNotMatch(html, /https?:\/\/[^"']+\.(?:js|css)/);
  assert.match(motionStyles, /@keyframes hero-rise/);
  assert.match(motionStyles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(motionScript, /IntersectionObserver/);
  assert.match(motionScript, /animation\.cancel\(\)/);
  assert.match(motionScript, /fill: 'none'/);
  assert.match(baseStyles, /scroll-padding-top/);
  assert.match(html, /id="contact-form"/);
  assert.equal((html.match(/<article class="area-card">/g) || []).length, 6);
  assert.equal((html.match(/<li class="step">/g) || []).length, 3);
  assert.equal((html.match(/<li class="solution-item">/g) || []).length, 4);
});


test('CONTACT-001 keeps a minimal accessible form and preserves existing contact contract', () => {
  build('preview', {});
  const html = read('index.html');
  const css = read('styles.css');
  const formJS = read('form.js');
  const sprite = read('assets/icons.svg');

  assert.match(html, /<section id="kontakt" class="contact content-section" aria-labelledby="contact-title">/);
  assert.match(html, /class="contact-description"/);
  assert.match(html, /class="contact-note"/);
  assert.match(html, /href="\/assets\/icons\.svg#icon-sparkles"/);
  assert.match(html, /<form id="contact-form"[^>]*aria-labelledby="contact-form-title"/);
  assert.match(html, /<h3 id="contact-form-title">Napisz do nas<\/h3>/);
  assert.match(html, /name="name" type="text"[^>]*minlength="2"[^>]*required/);
  assert.match(html, /name="email" type="email"[^>]*maxlength="254"[^>]*required/);
  assert.match(html, /name="message" rows="4" maxlength="4000"/);
  assert.match(html, /name="_gotcha"/);
  assert.match(html, /<span data-submit-label>Wyślij wiadomość<\/span>/);
  assert.match(html, /id="contact-status" class="status" role="status" aria-live="polite"/);
  assert.match(html, /href="\/polityka-prywatnosci\/"/);
  assert.match(html, /<noscript>/);
  assert.match(sprite, /id="icon-sparkles"/);
  assert.match(css, /\.contact\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*\.91fr\)/);
  assert.match(css, /\.contact-note\s*\{[^}]*display:\s*flex/);
  assert.match(css, /#contact-form\s*\{[^}]*display:\s*grid/);
  assert.match(css, /#contact-form input\[aria-invalid="true"\]/);
  assert.match(css, /@media \(max-width: 930px\)/);
  assert.match(css, /@media \(max-width: 540px\)/);
  assert.match(formJS, /form\.setAttribute\('aria-busy', 'true'\)/);
  assert.match(formJS, /if \(button\.disabled\) return/);
  assert.match(formJS, /nameField\.setCustomValidity/);
  assert.doesNotMatch(formJS, /window\.location\.href|mailto:/);
  assert.match(formJS, /if \(!endpoint\) \{/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.equal((html.match(/<article class="area-card">/g) || []).length, 6);
  assert.equal((html.match(/<li class="step">/g) || []).length, 3);
  assert.equal((html.match(/<li class="solution-item">/g) || []).length, 4);
});

test('configured preview refuses collection without approved legal configuration', () => {
  assert.throws(
    () => build('preview', { FORM_ENDPOINT: 'https://formspree.io/f/abcxyz123' }),
    /PUBLIC_LEGAL_CONFIG_PATH/,
  );
  assert.throws(
    () => build('preview', { FORM_ENDPOINT: 'https://example.com/steal' }),
    /Formspree/,
  );
});

test('backend contact can be enabled only with verified legal data and stays noindex in preview', () => {
  assert.throws(
    () => build('preview', { FORM_ENDPOINT: '/api/contact/brief' }),
    /PUBLIC_LEGAL_CONFIG_PATH/,
  );

  const tmp = mkdtempSync(join(tmpdir(), 'protolume-fastapi-v3-'));
  const path = join(tmp, 'approved-legal.json');
  const legal = {
    administrator: {
      name: 'Firma Testowa Jan Kowalski',
      correspondenceAddress: 'Ulica Długa 3, 00-001 Warszawa',
    },
    processing: {
      purposes: ['Odpowiedź na zapytanie'],
      legalBases: ['Działania na żądanie osoby kontaktującej się'],
      retention: ['Do zakończenia korespondencji'],
      recipients: ['Osoba prowadząca obsługę kontaktu'],
      infrastructureProviders: ['Dostawca hostingu'],
      emailProviders: ['Dostawca serwera pocztowego'],
      dataSubjectRights: ['Prawo dostępu do danych'],
    },
    updatedAt: '2026-11-21',
  };
  try {
    writeFileSync(path, JSON.stringify(legal));
    build('preview', {
      FORM_ENDPOINT: '/api/contact/brief',
      PUBLIC_LEGAL_CONFIG_PATH: path,
    });
    const html = read('index.html');
    const policy = read('polityka-prywatnosci/index.html');
    assert.match(html, /data-endpoint="\/api\/contact\/brief"/);
    assert.match(html, /action="\/api\/contact\/brief"/);
    assert.doesNotMatch(html, /id="contact-submit" type="submit" disabled/);
    assert.match(html, /noindex, nofollow/);
    assert.match(policy, /Administrator danych/);
    assert.doesNotMatch(policy, /Wersja robocza|Formspree/);

    build('production', {
      FORM_ENDPOINT: '/api/contact/brief',
      PUBLIC_LEGAL_CONFIG_PATH: path,
    });
    assert.match(read('index.html'), /data-endpoint="\/api\/contact\/brief"/);
    assert.match(read('index.html'), /index, follow/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
    build('preview', {});
  }
});

test('production build rejects missing contact and legal provider configuration', () => {
  assert.throws(() => build('production', {}), /FORM_ENDPOINT/);
  assert.throws(() => build('production', { FORM_ENDPOINT: 'https://example.org/collect' }), /Formspree/);
  assert.throws(
    () => build('production', { FORM_ENDPOINT: 'https://formspree.io/f/abcdef' }),
    /PUBLIC_LEGAL_CONFIG_PATH/,
  );
});

test('production build includes verified legal details and configured form endpoint', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'protolume-v3-'));
  const configPath = join(tmp, 'legal.json');
  const legal = {
    administrator: {
      name: 'Firma Ćwiczeniowa Jan Kowalski',
      correspondenceAddress: 'Ulica Długa 3, 00-001 Warszawa',
    },
    processing: {
      purposes: ['Odpowiedź na zapytanie'],
      legalBases: ['Działania na żądanie osoby kontaktującej się'],
      retention: ['Do zakończenia korespondencji'],
      recipients: ['Formspree - obsługa formularza'],
      infrastructureProviders: ['Dostawca hostingu witryny'],
      emailProviders: ['Dostawca poczty'],
      dataSubjectRights: ['Prawo dostępu do danych'],
    },
    updatedAt: '2026-11-19',
  };
  try {
    writeFileSync(configPath, JSON.stringify(legal));
    // A noindex preview can collect real submissions only with validated policy.
    build('preview', {
      FORM_ENDPOINT: 'https://formspree.io/f/abcxyz123',
      PUBLIC_LEGAL_CONFIG_PATH: configPath,
    });
    assert.match(read('index.html'), /data-endpoint="https:\/\/formspree.io\/f\/abcxyz123"/);
    assert.doesNotMatch(read('index.html'), /id="contact-submit" type="submit" disabled/);
    assert.match(read('index.html'), /noindex, nofollow/);
    assert.match(read('polityka-prywatnosci/index.html'), /Formspree/);
    assert.doesNotMatch(read('polityka-prywatnosci/index.html'), /Wersja robocza/);
    build('production', {
      FORM_ENDPOINT: 'https://formspree.io/f/abcxyz123',
      PUBLIC_LEGAL_CONFIG_PATH: configPath,
    });
    assert.match(read('index.html'), /https:\/\/formspree.io\/f\/abcxyz123/);
    assert.match(read('index.html'), /index, follow/);
    assert.match(read('polityka-prywatnosci/index.html'), /Formspree/);
    assert.match(read('polityka-prywatnosci/index.html'), /Firma Ćwiczeniowa Jan Kowalski/);
    assert.match(read('robots.txt'), /Allow: \//);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
    build('preview', {});
  }
});
