const assert = require('node:assert/strict');
const test = require('node:test');

const { validatePublicLegalConfig } = require('./validate-public-legal-config.cjs');

function completeConfiguration() {
  return {
    administrator: {
      name: 'Administrator Walidacji Lokalnej',
      correspondenceAddress: 'Adres Walidacji 7, 00-001 Miasto',
      privacyContact: 'privacy@walidacja-konfiguracji.pl',
    },
    processing: {
      purposes: ['Obsługa zapytań z formularza'],
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

function paths(errors) {
  return errors.map((error) => error.path);
}

test('accepts a complete production configuration', () => {
  assert.deepEqual(validatePublicLegalConfig(completeConfiguration()), []);
});

test('rejects a missing required field', () => {
  const configuration = completeConfiguration();
  delete configuration.administrator.correspondenceAddress;

  assert.ok(
    paths(validatePublicLegalConfig(configuration)).includes('administrator.correspondenceAddress'),
  );
});

test('rejects an empty value', () => {
  const configuration = completeConfiguration();
  configuration.processing.recipients = ['   '];

  assert.deepEqual(paths(validatePublicLegalConfig(configuration)), ['processing.recipients[0]']);
});

test('rejects a test address', () => {
  const configuration = completeConfiguration();
  configuration.administrator.correspondenceAddress = 'Polska ul. Testowa 5';

  const errors = validatePublicLegalConfig(configuration);
  assert.deepEqual(paths(errors), ['administrator.correspondenceAddress']);
  assert.match(errors[0].message, /testowa/i);
});

test('rejects every supported placeholder form', () => {
  for (const placeholder of ['WPISZ', 'example', '**LEGAL_REQUIRED**', '__LEGAL_REQUIRED__']) {
    const configuration = completeConfiguration();
    configuration.processing.retention = [placeholder];

    assert.deepEqual(
      paths(validatePublicLegalConfig(configuration)),
      ['processing.retention[0]'],
      placeholder,
    );
  }
});

test('rejects an invalid privacy e-mail address', () => {
  const configuration = completeConfiguration();
  configuration.administrator.privacyContact = 'not-an-email';

  const errors = validatePublicLegalConfig(configuration);
  assert.deepEqual(paths(errors), ['administrator.privacyContact']);
  assert.equal(errors[0].code, 'email');
});

test('rejects the known test e-mail and brand-only administrator name', () => {
  const configuration = completeConfiguration();
  configuration.administrator.name = 'Protolume';
  configuration.administrator.privacyContact = 'ai.korepetycje3@gmail.com';

  const errors = validatePublicLegalConfig(configuration);
  assert.deepEqual(paths(errors), ['administrator.privacyContact', 'administrator.name']);
});
