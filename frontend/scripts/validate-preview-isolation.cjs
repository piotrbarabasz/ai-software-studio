const fs = require('node:fs');
const path = require('node:path');
const markers = [
  'app-artifact-preview',
  'local-artifact-preview',
  'fixture-only-no-execution',
  'player-silence.wav',
];
function validatePreviewIsolation(root) {
  if (!fs.existsSync(path.join(root, 'index.html'))) return ['production index missing'];
  const issues = [];
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else {
        const relative = path.relative(root, absolute);
        if (entry.name === 'player-silence.wav') issues.push(`private audio fixture: ${relative}`);
        if (/\.(?:html|js|mjs|json|txt|map)$/.test(entry.name)) {
          const content = fs.readFileSync(absolute, 'utf8');
          if (markers.some((marker) => content.includes(marker)))
            issues.push(`private preview content: ${relative}`);
        }
      }
    }
  }
  visit(root);
  return issues;
}
if (require.main === module) {
  const issues = validatePreviewIsolation(
    path.resolve(__dirname, '../dist/aisoftware-studio/browser'),
  );
  if (issues.length) {
    console.error(issues.join('\n'));
    process.exitCode = 1;
  } else
    console.log('Private preview and mechanical fixtures are absent from the production artifact.');
}
module.exports = { validatePreviewIsolation };
