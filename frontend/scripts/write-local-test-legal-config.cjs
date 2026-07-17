const path = require('node:path');

const {
  LOCAL_TEST_MODE,
  readAndValidatePublicLegalConfig,
} = require('./validate-public-legal-config.cjs');
const { writeLegalConfigModule } = require('./write-production-legal-config.cjs');

const inputPath = path.resolve(
  __dirname,
  '../config/local-test/public-legal.config.local-test.json',
);

const configuration = readAndValidatePublicLegalConfig(inputPath, { mode: LOCAL_TEST_MODE });
writeLegalConfigModule(configuration, LOCAL_TEST_MODE);
