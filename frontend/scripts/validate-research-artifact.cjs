const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const revision = '9bbe8d5d9e7e1f539683647deda7751e695301ef';
const expectedFiles = ['README.md', 'lexical-experiment.zip', 'observation.json'];

function validateResearchArtifact(root) {
  const issues = [];
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
    if (manifest.revision !== revision) issues.push('Unreviewed research source revision');
    if (
      !Array.isArray(manifest.files) ||
      JSON.stringify(manifest.files.map((item) => item.file).sort()) !==
        JSON.stringify(expectedFiles)
    ) {
      return ['Research file inventory differs from the reviewed package'];
    }
    for (const item of manifest.files) {
      const actual = crypto
        .createHash('sha256')
        .update(fs.readFileSync(path.join(root, item.file)))
        .digest('hex');
      if (actual !== item.sha256) issues.push('Research checksum mismatch: ' + item.file);
    }
    const report = JSON.parse(fs.readFileSync(path.join(root, 'observation.json'), 'utf8'));
    if (
      report.sourceRevision !== revision ||
      report.modelCalls !== 0 ||
      !Array.isArray(report.results) ||
      report.sampleSize !== report.results.length ||
      report.matchingCases !== report.results.filter((item) => item.matchedExpectation).length ||
      report.results.some(
        (item) => item.matchedExpectation !== (item.expectedFirst === item.actualFirst),
      ) ||
      JSON.stringify(report.failureIds) !==
        JSON.stringify(
          report.results.filter((item) => !item.matchedExpectation).map((item) => item.id),
        )
    ) {
      issues.push('Research observation is inconsistent');
    }
  } catch {
    issues.push('Research artifact is missing or invalid');
  }
  return issues;
}
if (require.main === module) {
  const issues = validateResearchArtifact(
    path.resolve(__dirname, '../dist/aisoftware-studio/browser/assets/evidence/retrieval-9bbe8d5'),
  );
  if (issues.length) {
    console.error(issues.join('\n'));
    process.exitCode = 1;
  } else console.log('Research observation and downloads match the reviewed package.');
}
module.exports = { validateResearchArtifact };
