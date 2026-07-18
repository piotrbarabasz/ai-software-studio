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

function artifactWith(content) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'legal-artifact-'));
  const privacyDirectory = path.join(root, 'polityka-prywatnosci');
  fs.mkdirSync(privacyDirectory, { recursive: true });
  fs.writeFileSync(path.join(privacyDirectory, 'index.html'), content, 'utf8');
  return root;
}

test('accepts an artifact containing every validated configuration value', (context) => {
  const config = configuration();
  const root = artifactWith(
    `<main>${[
      config.administrator.name,
      config.administrator.correspondenceAddress,
      ...Object.values(config.processing).flat(),
      config.updatedAt,
    ].join(' ')}</main>`,
  );
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  assert.doesNotThrow(() => scanProductionArtifact(root, config));
  assert.equal(fs.existsSync(path.join(root, '.legal-config-validated')), true);
});

test('rejects a forbidden value in the prerendered privacy document', (context) => {
  const config = configuration();
  const root = artifactWith(
    `<main>${Object.values(config.processing).flat().join(' ')} Testowa 5</main>`,
  );
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  assert.throws(() => scanProductionArtifact(root, config), /Testowa 5/);
});

test('allows the public brand outside the configured administrator field', (context) => {
  const config = configuration();
  const root = artifactWith(
    `<header>Protolume</header><main>${[
      config.administrator.name,
      config.administrator.correspondenceAddress,
      ...Object.values(config.processing).flat(),
      config.updatedAt,
    ].join(' ')}</main>`,
  );
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));

  assert.doesNotThrow(() => scanProductionArtifact(root, config));
});
