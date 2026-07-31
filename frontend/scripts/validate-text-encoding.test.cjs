const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const { resolveRepositoryRoot, validateTextFile } = require('./validate-text-encoding.cjs');

function temporaryFile(context, name, content) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'text-encoding-'));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const filePath = path.join(root, name);
  fs.writeFileSync(filePath, content);
  return filePath;
}

test('accepts valid UTF-8 with Polish characters', (context) => {
  const filePath = temporaryFile(
    context,
    'valid.txt',
    Buffer.from('Zażółć gęślą jaźń. Ą ć ę ł ń ó ś ź ż.', 'utf8'),
  );

  assert.deepEqual(validateTextFile(filePath), []);
});

test('uses the monorepo root when the frontend is nested in the repository', (context) => {
  const repositoryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'text-encoding-repository-'));
  context.after(() => fs.rmSync(repositoryRoot, { recursive: true, force: true }));
  const frontendRoot = path.join(repositoryRoot, 'frontend');
  fs.mkdirSync(frontendRoot);
  fs.writeFileSync(path.join(frontendRoot, 'package.json'), '{}');

  assert.equal(resolveRepositoryRoot(frontendRoot), repositoryRoot);
});

test('uses the application root when the frontend is copied directly into a container', (context) => {
  const applicationRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'text-encoding-app-'));
  context.after(() => fs.rmSync(applicationRoot, { recursive: true, force: true }));
  fs.writeFileSync(path.join(applicationRoot, 'package.json'), '{}');

  assert.equal(resolveRepositoryRoot(applicationRoot), applicationRoot);
});

test('detects a UTF-8 BOM', (context) => {
  const filePath = temporaryFile(
    context,
    'bom.txt',
    Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from('Treść', 'utf8')]),
  );

  assert.ok(validateTextFile(filePath).some((issue) => issue.reason.includes('UTF-8 BOM')));
});

test('detects invalid UTF-8 bytes', (context) => {
  const filePath = temporaryFile(context, 'invalid.txt', Buffer.from([0xc3, 0x28]));

  assert.ok(
    validateTextFile(filePath).some((issue) =>
      issue.reason.includes('niepoprawna sekwencja bajtów UTF-8'),
    ),
  );
});

test('detects a known mojibake sequence', (context) => {
  const brokenText = `Nieobs${String.fromCodePoint(0x0139, 0x201a)}ugiwana`;
  const filePath = temporaryFile(context, 'mojibake.txt', Buffer.from(brokenText, 'utf8'));

  assert.ok(validateTextFile(filePath).some((issue) => issue.reason.includes('mojibake')));
});

test('detects the Unicode replacement character', (context) => {
  const filePath = temporaryFile(
    context,
    'replacement.txt',
    Buffer.from(`Uszkodzony znak: ${String.fromCodePoint(0xfffd)}`, 'utf8'),
  );

  assert.ok(validateTextFile(filePath).some((issue) => issue.reason.includes('U+FFFD')));
});

test('accepts an ordinary question mark in a valid sentence', (context) => {
  const filePath = temporaryFile(
    context,
    'question.txt',
    Buffer.from('Czy wdrożenie działa poprawnie?', 'utf8'),
  );

  assert.deepEqual(validateTextFile(filePath), []);
});

test('CLI exits with code 1 and reports a damaged temporary file', (context) => {
  const filePath = temporaryFile(
    context,
    'damaged.txt',
    Buffer.from(`Automatyzacja proces${String.fromCharCode(0x3f)}w`, 'utf8'),
  );
  const validatorPath = path.resolve(__dirname, 'validate-text-encoding.cjs');
  const result = spawnSync(process.execPath, [validatorPath, path.dirname(filePath)], {
    encoding: 'utf8',
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /damaged\.txt:1/);
  assert.match(result.stderr, /znak zapytania wewnątrz słowa/);
});

test('check and production build run encoding validation first', () => {
  const packageManifest = require('../package.json');

  assert.match(packageManifest.scripts.check, /^npm run validate:encoding &&/);
  assert.match(packageManifest.scripts.build, /^npm run validate:encoding &&/);
});
