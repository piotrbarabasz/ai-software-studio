const { loadEnvironment, writeSeoArtifacts } = require('./site-build-utils.cjs');

const mode = process.argv[2] === 'production' ? 'production' : 'development';
writeSeoArtifacts(loadEnvironment(mode));
