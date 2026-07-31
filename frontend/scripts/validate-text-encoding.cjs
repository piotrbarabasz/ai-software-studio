const fs = require('node:fs');
const path = require('node:path');

const FRONTEND_ROOT = path.resolve(__dirname, '..');

function resolveRepositoryRoot(frontendRoot, existsSync = fs.existsSync) {
  const repositoryCandidate = path.resolve(frontendRoot, '..');
  const nestedFrontendManifest = path.join(repositoryCandidate, 'frontend', 'package.json');

  return existsSync(nestedFrontendManifest) ? repositoryCandidate : frontendRoot;
}

const REPOSITORY_ROOT = resolveRepositoryRoot(FRONTEND_ROOT);
const UTF8_BOM = Buffer.from([0xef, 0xbb, 0xbf]);
const UTF8_DECODER = new TextDecoder('utf-8', { fatal: true });
const TEXT_EXTENSIONS = new Set([
  '.cjs',
  '.conf',
  '.css',
  '.csv',
  '.html',
  '.ini',
  '.js',
  '.json',
  '.jsonc',
  '.lock',
  '.md',
  '.mjs',
  '.ps1',
  '.py',
  '.pyi',
  '.scss',
  '.sh',
  '.svg',
  '.toml',
  '.ts',
  '.txt',
  '.xml',
  '.yaml',
  '.yml',
]);
const TEXT_FILE_NAMES = new Set([
  '.dockerignore',
  '.editorconfig',
  '.eslintignore',
  '.gitattributes',
  '.gitignore',
  '.prettierignore',
  'dockerfile',
  'makefile',
  'procfile',
]);
const EXCLUDED_DIRECTORY_NAMES = new Set([
  '.angular',
  '.cache',
  '.codex',
  '.git',
  '.mypy_cache',
  '.pytest_cache',
  '.ruff_cache',
  '.venv',
  '__pycache__',
  'coverage',
  'dist',
  'generated',
  'node_modules',
  'playwright-report',
  'test-results',
  'tmp',
  'venv',
]);
const EXCLUDED_REPOSITORY_FILES = new Set([
  'frontend/.public-legal-config.json',
  'frontend/src/app/core/legal/public-legal.config.generated.ts',
]);
const REPLACEMENT_CHARACTER_PATTERN = /\ufffd/u;
const KNOWN_MOJIBAKE_PATTERN = /(?:\u00c3|\u00c2|\u00c4|\u00c5|\u0139|\u00e2\u20ac)/u;
const EMBEDDED_QUESTION_MARK_PATTERN = /\p{L}\?+\p{L}/u;
const URL_PATTERN =
  /(?:https?:\/\/|mailto:)[^\s"'<>`]+|\/[A-Za-z0-9._~!$&'()*+,;=:@%/-]*\?[A-Za-z0-9._~!$&'()*+,;=:@%/?-]*/gu;

function normalizedRepositoryPath(filePath) {
  return path.relative(REPOSITORY_ROOT, filePath).replaceAll('\\', '/');
}

function isExcludedDirectory(name) {
  return EXCLUDED_DIRECTORY_NAMES.has(name) || name.startsWith('pytest-cache-files-');
}

function isTextFile(filePath) {
  const name = path.basename(filePath).toLowerCase();
  return TEXT_FILE_NAMES.has(name) || TEXT_EXTENSIONS.has(path.extname(name));
}

function isExcludedFile(filePath) {
  return EXCLUDED_REPOSITORY_FILES.has(normalizedRepositoryPath(filePath));
}

function collectTextFiles(scanRoots) {
  const files = [];
  const pending = [...scanRoots.map((root) => path.resolve(root))];

  while (pending.length > 0) {
    const current = pending.pop();
    if (!fs.existsSync(current)) {
      throw new Error(`Ścieżka skanowania nie istnieje: ${current}`);
    }

    const stats = fs.lstatSync(current);
    if (stats.isSymbolicLink()) {
      continue;
    }
    if (stats.isFile()) {
      if (isTextFile(current) && !isExcludedFile(current)) {
        files.push(current);
      }
      continue;
    }
    if (!stats.isDirectory() || isExcludedDirectory(path.basename(current))) {
      continue;
    }

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) {
        continue;
      }
      if (entry.isDirectory() && isExcludedDirectory(entry.name)) {
        continue;
      }
      pending.push(path.join(current, entry.name));
    }
  }

  return [...new Set(files)].sort();
}

function lineNumberAt(text, index) {
  return text.slice(0, index).split('\n').length;
}

function codePointLabel(value) {
  return [...value]
    .map((character) => `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`)
    .join(' ');
}

function maskUrls(text) {
  return text.replace(URL_PATTERN, (match) => ' '.repeat(match.length));
}

function validateTextBuffer(filePath, buffer) {
  const issues = [];
  if (buffer.subarray(0, UTF8_BOM.length).equals(UTF8_BOM)) {
    issues.push({ filePath, line: 1, reason: 'wykryto UTF-8 BOM' });
  }

  let text;
  try {
    text = UTF8_DECODER.decode(buffer);
  } catch {
    issues.push({ filePath, reason: 'niepoprawna sekwencja bajtów UTF-8' });
    return issues;
  }

  if (text.includes('\0')) {
    issues.push({ filePath, reason: 'plik tekstowy zawiera bajt NUL' });
  }

  const replacementMatch = REPLACEMENT_CHARACTER_PATTERN.exec(text);
  if (replacementMatch) {
    issues.push({
      filePath,
      line: lineNumberAt(text, replacementMatch.index),
      reason: 'wykryto replacement character U+FFFD',
    });
  }

  const mojibakeMatch = KNOWN_MOJIBAKE_PATTERN.exec(text);
  if (mojibakeMatch) {
    issues.push({
      filePath,
      line: lineNumberAt(text, mojibakeMatch.index),
      reason: `wykryto sekwencję mojibake (${codePointLabel(mojibakeMatch[0])})`,
    });
  }

  const textWithoutUrls = maskUrls(text);
  const questionMarkMatch = EMBEDDED_QUESTION_MARK_PATTERN.exec(textWithoutUrls);
  if (questionMarkMatch) {
    issues.push({
      filePath,
      line: lineNumberAt(text, questionMarkMatch.index),
      reason: 'wykryto znak zapytania wewnątrz słowa',
    });
  }

  return issues;
}

function validateTextFile(filePath) {
  return validateTextBuffer(path.resolve(filePath), fs.readFileSync(filePath));
}

function validateTextEncoding(scanRoots = [REPOSITORY_ROOT]) {
  return collectTextFiles(scanRoots).flatMap((filePath) => validateTextFile(filePath));
}

function displayPath(filePath) {
  const relativePath = normalizedRepositoryPath(filePath);
  return relativePath.startsWith('../') ? filePath : relativePath;
}

function main(args = process.argv.slice(2)) {
  const scanRoots = args.length > 0 ? args : [REPOSITORY_ROOT];
  const issues = validateTextEncoding(scanRoots);

  if (issues.length > 0) {
    process.stderr.write('Błędy kodowania tekstu:\n');
    for (const issue of issues) {
      const location = issue.line
        ? `${displayPath(issue.filePath)}:${issue.line}`
        : displayPath(issue.filePath);
      process.stderr.write(`- ${location}: ${issue.reason}\n`);
    }
    process.exitCode = 1;
    return;
  }

  process.stdout.write(
    'Kodowanie kontrolowanych plików tekstowych jest poprawnym UTF-8 bez BOM i mojibake.\n',
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  collectTextFiles,
  resolveRepositoryRoot,
  validateTextBuffer,
  validateTextEncoding,
  validateTextFile,
};
