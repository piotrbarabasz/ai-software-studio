import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from './build.mjs';

function read(path) {
  return readFileSync(new URL('./dist/' + path, import.meta.url), 'utf8');
}

test('preview is a single page with a non-deceptive mailto fallback', () => {
  build('preview', {});
  const html = read('index.html');
  const policy = read('polityka-prywatnosci/index.html');
  const robots = read('robots.txt');

  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /Sprawdźmy, jak/);
  assert.match(html, /Piotr Barabasz/);
  assert.match(html, /id="contact-form"/);
  assert.match(html, /name="message"/);
  assert.match(html, /data-endpoint=""/);
  assert.match(html, /action="#"/);
  assert.match(html, /noindex, nofollow/);
  assert.doesNotMatch(html, /__FORM_|__ROBOTS__/);
  assert.doesNotMatch(html, /demo w 7 dni|nasza oferta|portfolio|CRM|FastAPI/i);
  assert.match(policy, /Wersja robocza/);
  assert.match(policy, /noindex, nofollow/);
  assert.match(robots, /Disallow: \//);
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
      name: 'Firma Testowa Jan Kowalski',
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
    assert.match(read('polityka-prywatnosci/index.html'), /Firma Testowa Jan Kowalski/);
    assert.match(read('robots.txt'), /Allow: \//);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
    build('preview', {});
  }
});
