const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function readReportSource() {
  const source = fs.readFileSync(
    path.resolve(__dirname, '../src/app/core/content/demo-report.pl.ts'),
    'utf8',
  );
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const sandbox = { exports: {} };
  vm.runInNewContext(javascript, sandbox, { timeout: 1000 });
  return sandbox.exports.demoReportContent;
}
if (require.main === module) process.stdout.write(JSON.stringify(readReportSource()));
module.exports = { readReportSource };
