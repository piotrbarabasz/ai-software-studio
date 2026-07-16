const assert = require('node:assert/strict');
const test = require('node:test');

const { parseAndValidatePublicLegalConfig } = require('./write-production-legal-config.cjs');

function completeConfiguration() {
  return {
    administrator: {
      name: 'configured administrator',
      correspondenceAddress: 'configured correspondence address',
      privacyContact: 'configured privacy contact',
    },
    processing: {
      purposes: ['configured purpose'],
      legalBases: ['configured legal basis'],
      retention: ['configured retention criterion'],
      recipients: ['configured recipient category'],
      infrastructureProviders: ['configured infrastructure provider'],
      emailProviders: ['configured email provider'],
      dataSubjectRights: ['configured rights information'],
    },
    updatedAt: 'configured update date',
  };
}

test('accepts a complete JSON public legal configuration', () => {
  assert.deepEqual(
    parseAndValidatePublicLegalConfig(JSON.stringify(completeConfiguration())),
    completeConfiguration(),
  );
});

test('reports missing fields from a production JSON public legal configuration', () => {
  const configuration = completeConfiguration();
  configuration.administrator.privacyContact = '__LEGAL_REQUIRED__:administrator.privacyContact';

  assert.throws(
    () => parseAndValidatePublicLegalConfig(JSON.stringify(configuration)),
    /administrator\.privacyContact/,
  );
});
