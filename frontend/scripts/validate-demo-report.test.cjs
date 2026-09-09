const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { validateDemoReport } = require('./validate-demo-report.cjs');
const { readReportSource } = require('./demo-report-source.cjs');
const source = path.resolve(__dirname, '../src/assets/evidence');
test('downloaded report is tied to the current content, not a stale print export', () => {
  assert.deepEqual(validateDemoReport(source), []);
  const content = readReportSource();
  content.scenarios[0].demoBehavior += ' Changed meaning.';
  assert.ok(
    validateDemoReport(source, content).some((issue) => issue.includes('current page content')),
  );
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'demo-report-'));
  try {
    for (const name of ['demo-report-manifest.json', 'protolume-raport-demo.pdf'])
      fs.copyFileSync(path.join(source, name), path.join(root, name));
    fs.appendFileSync(path.join(root, 'protolume-raport-demo.pdf'), 'tamper');
    assert.ok(validateDemoReport(root).some((issue) => issue.includes('changed')));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
