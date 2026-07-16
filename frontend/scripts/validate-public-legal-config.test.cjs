const assert = require('node:assert/strict');
const test = require('node:test');

const {
  loadPublicLegalConfig,
  validatePublicLegalConfig,
} = require('./validate-public-legal-config.cjs');

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

test('reports every development placeholder with its exact field path', () => {
  const errors = validatePublicLegalConfig(loadPublicLegalConfig());

  assert.deepEqual(errors, [
    'administrator.name',
    'administrator.correspondenceAddress',
    'administrator.privacyContact',
    'processing.purposes[0]',
    'processing.legalBases[0]',
    'processing.retention[0]',
    'processing.recipients[0]',
    'processing.emailProviders[0]',
    'processing.dataSubjectRights[0]',
    'updatedAt',
  ]);
});

test('accepts a complete configuration without placeholders', () => {
  assert.deepEqual(validatePublicLegalConfig(completeConfiguration()), []);
});

test('rejects empty list entries as production configuration errors', () => {
  const configuration = completeConfiguration();
  configuration.processing.recipients = [''];

  assert.deepEqual(validatePublicLegalConfig(configuration), ['processing.recipients[0]']);
});
