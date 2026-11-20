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
