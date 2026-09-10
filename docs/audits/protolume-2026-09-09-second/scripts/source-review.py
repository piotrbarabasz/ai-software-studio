import hashlib
import json
import re
import subprocess
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parents[1] / 'evidence'
MASTER = '8ccc20c23c11f32f54d3e677455330e14f4eac3c'
SOURCE = ROOT / 'tmp/protolume-second/master-source'


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT).decode('utf-8')


def category(name):
    if name.startswith('docs/') or name.startswith('output/'):
        return 'documentation_and_evidence'
    if any(part in name for part in ['/tests/', '.spec.ts', '.test.cjs']):
        return 'tests'
    if name.startswith('frontend/src/assets/') or name.endswith(('.ttf', '.wav')):
        return 'assets_and_fixtures'
    if name.startswith(('frontend/scripts/', 'backend/scripts/')):
        return 'authoring_and_validation_scripts'
    if name.startswith('frontend/src/'):
        return 'frontend_source'
    if name.startswith('backend/app/'):
        return 'backend_source'
    return 'config_and_other'


def inventory(ref):
    paths = git('ls-tree', '-r', '--name-only', ref).splitlines()
    return {'totalFiles': len(paths), 'byPurpose': dict(Counter(category(p) for p in paths))}


result = {'reviewedMaster': MASTER, 'originalProduction': inventory('8386de6'), 'beforePr57': inventory('0d38ef8'), 'master': inventory(MASTER)}
for base, name in [('8386de6', 'sinceOriginalAuditProduction'), ('0d38ef8', 'inPr57')]:
    rows = [line.split('\t') for line in git('diff', '--numstat', base, MASTER).splitlines()]
    added = git('diff', '--name-only', '--diff-filter=A', base, MASTER).splitlines()
    result[name] = {'changedFiles': len(rows), 'newFiles': len(added), 'newFilesByPurpose': dict(Counter(category(p) for p in added)), 'textLinesAdded': sum(int(r[0]) for r in rows if r[0].isdigit()), 'textLinesRemoved': sum(int(r[1]) for r in rows if r[1].isdigit()), 'binaryFilesChanged': sum(r[0]=='-' for r in rows)}
paths = git('ls-tree', '-r', '--name-only', MASTER).splitlines()
result['frontEndScripts'] = [p for p in paths if p.startswith('frontend/scripts/') and p.endswith(('.cjs', '.mjs', '.py'))]
result['auditDocumentation'] = [p for p in paths if p.startswith('docs/audits/protolume-2026-09-07/') and p.endswith('.md')]
result['dormantAreas'] = {}
for directory in ['backend/app/rag', 'backend/app/crm', 'frontend/src/preview', 'frontend/src/testing']:
    files = [p for p in paths if p.startswith(directory+'/')]
    result['dormantAreas'][directory] = {'files': len(files), 'textLines': sum(len((SOURCE/p).read_text('utf-8').splitlines()) for p in files if not p.endswith('.wav'))}
result['keyFileLines'] = {p: len((SOURCE/p).read_text('utf-8').splitlines()) for p in ['frontend/src/app/core/content/site.pl.ts', 'frontend/src/app/core/content/site-content.types.ts', 'frontend/src/app/core/content/demo-artifacts.ts', 'frontend/src/app/core/content/evidence.pl.ts', 'frontend/scripts/build_demo_report.py', 'frontend/scripts/build_engineering_artifact.py', 'frontend/scripts/build_research_artifact.py']}
patterns = [rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----', rb'gh[pousr]_[A-Za-z0-9]{30,}', rb'AIza[0-9A-Za-z_-]{35}', rb'sk-(?:proj-)?[0-9A-Za-z_-]{40,}']
suspects = []
for p in paths:
    file = SOURCE/p
    if p.startswith(('frontend/src/', 'backend/app/', 'infra/gcp/')) and file.suffix in {'.ts','.py','.json','.yaml','.yml','.txt','.html'}:
        if any(re.search(pattern, file.read_bytes()) for pattern in patterns):
            suspects.append(p)
result['credentialPatternCandidates'] = suspects
result['secretScanLimit'] = 'Selected key formats in current application/config files only; not a full history or secret-manager audit.'
result['sourceFilesSha256'] = {p: hashlib.sha256((SOURCE/p).read_bytes()).hexdigest() for p in result['keyFileLines']}
(OUT/'source-review.json').write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n', encoding='utf-8', newline='\n')
print(json.dumps({k:v for k,v in result.items() if k not in {'frontEndScripts','auditDocumentation','sourceFilesSha256'}},ensure_ascii=False,indent=2))
