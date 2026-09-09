const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { validateEngineeringArtifact } = require('./validate-engineering-artifact.cjs');
test('download gate rejects altered archives, missing sources and unreviewed revisions', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'protolume-engineering-'));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(root).startsWith('protolume-engineering-'));
    fs.rmSync(root, { recursive: true, force: true });
  });
  fs.cpSync(path.resolve(__dirname, '../src/assets/evidence/engineering-0d38ef8'), root, {
    recursive: true,
  });
  assert.deepEqual(validateEngineeringArtifact(root), []);
  fs.appendFileSync(path.join(root, 'protolume-api.zip'), 'changed');
  assert.ok(validateEngineeringArtifact(root).some((issue) => issue.includes('checksum mismatch')));
  fs.unlinkSync(path.join(root, 'pr-56-hydration.patch'));
  assert.ok(validateEngineeringArtifact(root).some((issue) => issue.includes('missing source')));
  const manifestPath = path.join(root, 'source-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.revision = 'unreviewed';
  manifest.previews[0].file = '../outside.txt';
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  assert.ok(validateEngineeringArtifact(root).includes('unreviewed source revision'));
  assert.ok(validateEngineeringArtifact(root).includes('invalid source filename'));
});
