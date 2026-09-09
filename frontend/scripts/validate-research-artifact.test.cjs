const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { validateResearchArtifact } = require('./validate-research-artifact.cjs');
const source = path.resolve(__dirname, '../src/assets/evidence/retrieval-9bbe8d5');
test('research package requires exact reviewed files and consistent observations', () => {
  assert.deepEqual(validateResearchArtifact(source), []);
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'research-package-'));
  try {
    fs.cpSync(source, root, { recursive: true });
    fs.appendFileSync(path.join(root, 'lexical-experiment.zip'), 'tampered');
    assert.ok(validateResearchArtifact(root).some((issue) => issue.includes('checksum')));
    const reportPath = path.join(root, 'observation.json');
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    report.matchingCases++;
    fs.writeFileSync(reportPath, JSON.stringify(report));
    assert.ok(validateResearchArtifact(root).some((issue) => issue.includes('inconsistent')));
    const manifestPath = path.join(root, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.files[0].file = '../observation.json';
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
    assert.ok(validateResearchArtifact(root).some((issue) => issue.includes('inventory')));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
