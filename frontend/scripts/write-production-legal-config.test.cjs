const assert = require('node:assert/strict');
const test = require('node:test');

const { parseAndValidatePublicLegalConfig } = require('./write-production-legal-config.cjs');

function completeConfiguration() {
  return {
    administrator: {
      name: 'Administrator Walidacji Lokalnej',
      correspondenceAddress: 'Adres Walidacji 7, 00-001 Miasto',
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

test('accepts a complete JSON public legal configuration', () => {
  assert.deepEqual(
    parseAndValidatePublicLegalConfig(JSON.stringify(completeConfiguration())),
    completeConfiguration(),
  );
});

test('reports the exact path of a forbidden production value', () => {
  const configuration = completeConfiguration();
  configuration.administrator.correspondenceAddress = 'owner@example.com';

  assert.throws(
    () => parseAndValidatePublicLegalConfig(JSON.stringify(configuration)),
    /administrator\.correspondenceAddress.*example/s,
  );
});

test('rejects invalid JSON and non-object JSON', () => {
  assert.throws(() => parseAndValidatePublicLegalConfig('{'), /poprawny obiekt JSON/);
  assert.throws(() => parseAndValidatePublicLegalConfig('[]'), /obiekt JSON/);
});
