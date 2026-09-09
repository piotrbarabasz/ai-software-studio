const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { readReportSource } = require('./demo-report-source.cjs');
const sha = (value) => crypto.createHash('sha256').update(value).digest('hex');

function validateDemoReport(root, content = readReportSource()) {
  const issues = [];
  try {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(root, 'demo-report-manifest.json'), 'utf8'),
    );
    if (manifest.pdf !== 'protolume-raport-demo.pdf') return ['Unexpected report file'];
    const pdf = fs.readFileSync(path.join(root, manifest.pdf));
    if (!pdf.subarray(0, 5).equals(Buffer.from('%PDF-')) || sha(pdf) !== manifest.pdfSha256)
      issues.push('Report PDF is missing, invalid or changed');
    if (
      manifest.contentSha256 !== sha(JSON.stringify(content)) ||
      manifest.version !== content.version ||
      manifest.preparedOn !== content.preparedOn
    )
      issues.push('Report PDF must be regenerated from current page content');
    if (
      manifest.rendererSha256 !== sha(fs.readFileSync(path.join(__dirname, 'build_demo_report.py')))
    )
      issues.push('Report renderer changed; regenerate and review PDF');
    for (const name of ['DejaVuSans.ttf', 'DejaVuSans-Bold.ttf']) {
      if (manifest.fonts?.[name] !== sha(fs.readFileSync(path.join(__dirname, 'pdf-fonts', name))))
        issues.push('Report font changed; regenerate and review PDF');
    }
  } catch {
    issues.push('Report PDF or manifest unavailable');
  }
  return issues;
}
if (require.main === module) {
  const issues = validateDemoReport(
    path.resolve(__dirname, '../dist/aisoftware-studio/browser/assets/evidence'),
  );
  if (issues.length) {
    console.error(issues.join('\n'));
    process.exitCode = 1;
  } else console.log('Downloadable PDF matches the current report content, renderer and fonts.');
}
module.exports = { validateDemoReport };
