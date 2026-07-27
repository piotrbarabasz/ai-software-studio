const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { scanProductionArtifact } = require('./validate-production-artifact.cjs');

function configuration() {
  return {
    administrator: {
      name: 'Administrator Walidacji Artefaktu',
      correspondenceAddress: 'Adres Walidacji 7, 00-001 Miasto',
    },
    processing: {
      purposes: ['Obsługa zapytań'],
      legalBases: ['Podstawa zatwierdzona przez właściciela'],
      retention: ['Okres zatwierdzony przez właściciela'],
      recipients: ['Zatwierdzona kategoria odbiorców'],
      infrastructureProviders: ['Zatwierdzony dostawca infrastruktury'],
      emailProviders: ['Zatwierdzony dostawca poczty'],
      dataSubjectRights: ['Zatwierdzona informacja o prawach'],
    },
    updatedAt: '2026-07-17',
  };
}

function privacyValues(config) {
  return [
    config.administrator.name,
    config.administrator.correspondenceAddress,
    ...Object.values(config.processing).flat(),
    config.updatedAt,
  ];
}

function privacyDocument(config, { footer = '', mainExtras = '' } = {}) {
  return `<html><body><main>${privacyValues(config).join(' ')}${mainExtras}</main><footer>${footer}</footer></body></html>`;
}

function artifactWith(content) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'legal-artifact-'));
  const privacyDirectory = path.join(root, 'polityka-prywatnosci');
  fs.mkdirSync(privacyDirectory, { recursive: true });
  fs.writeFileSync(path.join(privacyDirectory, 'index.html'), content, 'utf8');
  return root;
}

function markerPath(root) {
  return path.join(root, '.legal-config-validated');
}

test('accepts an artifact containing every validated configuration value and a public footer link', (context) => {
  const config = configuration();
  const root = artifactWith(
    privacyDocument(config, {
      footer:
        '<a href="/przyklad-demo">Przykładowy raport</a><p>Przykładowe kryteria i przykładowego raportu</p>',
    }),
  );
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  assert.doesNotThrow(() => scanProductionArtifact(root, config));
  assert.equal(fs.existsSync(markerPath(root)), true);
});

test('rejects a forbidden value in the prerendered privacy document', (context) => {
  const config = configuration();
  const root = artifactWith(privacyDocument(config, { mainExtras: ' Testowa 5' }));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  assert.throws(() => scanProductionArtifact(root, config), /Testowa 5/);
});

test('rejects the production development notice', (context) => {
  const config = configuration();
  const root = artifactWith(
    privacyDocument(config, {
      mainExtras: ' Konfiguracja demonstracyjna dla środowiska deweloperskiego.',
    }),
  );
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  assert.throws(
    () => scanProductionArtifact(root, config),
    /Konfiguracja demonstracyjna dla środowiska deweloperskiego/,
  );
});

test('rejects common placeholder labels with the correct error label', (context) => {
  const cases = [
    ['Przykładowa wartość', 'przykładowa wartość'],
    ['przykladowa wartosc', 'przykładowa wartość'],
    ['WPISZ', 'WPISZ'],
    ['LEGAL_REQUIRED', 'LEGAL_REQUIRED'],
    ['example', 'example'],
    ['sample', 'sample/dummy/fixture'],
    ['dummy', 'sample/dummy/fixture'],
    ['fixture', 'sample/dummy/fixture'],
    ['placeholder', 'placeholder'],
    ['Testowa 5', 'Testowa 5'],
    ['ai.korepetycje3@gmail.com', 'znany testowy e-mail'],
  ];

  for (const [value, label] of cases) {
    const root = artifactWith(privacyDocument(configuration(), { mainExtras: ` ${value}` }));
    context.after(() => fs.rmSync(root, { recursive: true, force: true }));

    assert.throws(
      () => scanProductionArtifact(root, configuration()),
      (error) =>
        error.message.includes(`${path.join('polityka-prywatnosci', 'index.html')}: ${label}`),
    );
  }
});

test('reports a missing configured value and does not create the validation marker', (context) => {
  const config = configuration();
  const missingValue = config.updatedAt;
  const root = artifactWith(
    `<html><body><main>${privacyValues(config)
      .filter((value) => value !== missingValue)
      .join(' ')}</main></body></html>`,
  );
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  assert.throws(
    () => scanProductionArtifact(root, config),
    /brak wartości z konfiguracji produkcyjnej/,
  );
  assert.equal(fs.existsSync(markerPath(root)), false);
});

test('fails closed when the privacy document has no main content', (context) => {
  const config = configuration();
  const root = artifactWith('<html><body><footer>Brak main</footer></body></html>');
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  assert.throws(
    () => scanProductionArtifact(root, config),
    /Brak głównej treści w prerenderowanej polityce prywatności/,
  );
  assert.equal(fs.existsSync(markerPath(root)), false);
});

test('allows the public brand outside the configured administrator field', (context) => {
  const config = configuration();
  const root = artifactWith(`<header>Protolume</header>${privacyDocument(config)}`);
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  assert.doesNotThrow(() => scanProductionArtifact(root, config));
});
