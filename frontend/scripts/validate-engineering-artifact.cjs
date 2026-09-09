const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const revision = '0d38ef8037ce28a0ae4f8a3f3f3df4af4a8524c5';
function validateEngineeringArtifact(root) {
  const issues = [];
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'source-manifest.json'), 'utf8'));
    if (manifest.revision !== revision) issues.push('unreviewed source revision');
    if (!Array.isArray(manifest.previews) || manifest.previews.length !== 6)
      return ['invalid source map'];
    for (const entry of [...manifest.previews, manifest.patch, manifest.archive]) {
      if (!entry || !/^[a-zA-Z0-9._-]+$/.test(entry.file) || entry.file === '..') {
        issues.push('invalid source filename');
        continue;
      }
      const file = path.join(root, entry.file);
      if (!fs.existsSync(file)) {
        issues.push(`missing source: ${entry.file}`);
        continue;
      }
      const actual = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
      if (actual !== entry.sha256) issues.push(`source checksum mismatch: ${entry.file}`);
    }
  } catch {
    issues.push('source manifest unavailable or invalid');
  }
  return issues;
}
if (require.main === module) {
  const issues = validateEngineeringArtifact(
    path.resolve(
      __dirname,
      '../dist/aisoftware-studio/browser/assets/evidence/engineering-0d38ef8',
    ),
  );
  if (issues.length) {
    console.error(issues.join('\n'));
    process.exitCode = 1;
  } else console.log('Engineering downloads match the reviewed source manifest.');
}
module.exports = { validateEngineeringArtifact };
