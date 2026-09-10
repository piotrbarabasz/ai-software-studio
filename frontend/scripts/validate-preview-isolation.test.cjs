const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { validatePreviewIsolation } = require('./validate-preview-isolation.cjs');
test('private preview markup and binary audio cannot enter production', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'protolume-preview-gate-'));
  t.after(() => {
    const resolved = path.resolve(root);
    assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith('protolume-preview-gate-'));
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  assert.deepEqual(validatePreviewIsolation(root), ['production index missing']);
  fs.writeFileSync(path.join(root, 'index.html'), '<main>Public content</main>');
  assert.deepEqual(validatePreviewIsolation(root), []);
  fs.writeFileSync(path.join(root, 'main.js'), 'const id="fixture-only-no-execution";');
  fs.writeFileSync(path.join(root, 'player-silence.wav'), Buffer.from([0, 1]));
  assert.equal(validatePreviewIsolation(root).length, 2);
});
test('preview target does not replace production entry, output or asset inputs', () => {
  const targets = require('../angular.json').projects['aisoftware-studio'].architect;
  assert.notEqual(targets['artifact-preview'].options.outputPath, targets.build.options.outputPath);
  assert.equal(targets.build.options.browser, 'src/main.ts');
  assert.equal(targets.build.options.server, 'src/main.server.ts');
  assert.ok(!JSON.stringify(targets.build.options.assets).match(/testing|preview/));
  assert.ok(require('../package.json').scripts.build.includes('validate:preview-isolation'));
});
