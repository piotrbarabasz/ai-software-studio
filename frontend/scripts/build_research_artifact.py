"""Reproduce and package the recorded lexical observation without network/provider calls."""

import hashlib
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[2]
REVISION = "9bbe8d5d9e7e1f539683647deda7751e695301ef"
OUTPUT = ROOT / "frontend/src/assets/evidence/retrieval-9bbe8d5"
SOURCE_PATHS = (
    "backend/app/__init__.py",
    "backend/app/rag/__init__.py",
    "backend/app/rag/corpus.py",
    "backend/app/rag/retrieval.py",
    "backend/scripts/evaluate_rag.py",
    "backend/tests/fixtures/rag_retrieval_cases.json",
    "frontend/src/assets/rag/protolume-materials-v1.json",
)
RUNNER = """import runpy
import sys
from pathlib import Path

root = Path(__file__).resolve().parent
sys.path.insert(0, str(root / 'backend'))
runpy.run_path(str(root / 'backend/scripts/evaluate_rag.py'), run_name='__main__')
"""


def main() -> None:
    files = {
        name: subprocess.check_output(["git", "show", f"{REVISION}:{name}"], cwd=ROOT)
        for name in SOURCE_PATHS
    }
    recorded = json.loads(
        (
            ROOT
            / "docs/audits/protolume-2026-09-07/implementation-evidence/rag-retrieval-baseline.json"
        ).read_text(encoding="utf-8")
    )
    files["run.py"] = RUNNER.encode()
    with tempfile.TemporaryDirectory(prefix="protolume-retrieval-") as temp:
        directory = Path(temp)
        for name, body in files.items():
            target = directory / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(body)
        subprocess.run(
            [sys.executable, "run.py", "--output", "rerun.json"],
            cwd=directory,
            check=True,
        )
        actual = json.loads((directory / "rerun.json").read_text(encoding="utf-8"))
        if {k: v for k, v in actual.items() if k != "recordedAt"} != {
            k: v for k, v in recorded.items() if k != "recordedAt"
        }:
            raise ValueError("Pinned source did not reproduce the recorded observation")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    report = {**recorded, "sourceRevision": REVISION}
    (OUTPUT / "observation.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    subprocess.run(
        [
            "node",
            str(ROOT / "frontend/node_modules/prettier/bin/prettier.cjs"),
            "--write",
            str(OUTPUT / "observation.json"),
        ],
        cwd=ROOT,
        check=True,
    )
    files["README.md"] = (OUTPUT / "README.md").read_bytes()
    files["observation.json"] = (OUTPUT / "observation.json").read_bytes()
    archive = io.BytesIO()
    with zipfile.ZipFile(
        archive, "w", zipfile.ZIP_DEFLATED, compresslevel=9
    ) as package:
        for name, body in sorted(files.items()):
            entry = zipfile.ZipInfo(name, date_time=(2026, 9, 9, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            entry.external_attr = 0o100644 << 16
            package.writestr(entry, body)
    (OUTPUT / "lexical-experiment.zip").write_bytes(archive.getvalue())
    manifest = {
        "revision": REVISION,
        "files": [
            {
                "file": name,
                "sha256": hashlib.sha256((OUTPUT / name).read_bytes()).hexdigest(),
            }
            for name in ("observation.json", "README.md", "lexical-experiment.zip")
        ],
        "sourceFiles": list(SOURCE_PATHS),
    }
    (OUTPUT / "manifest.json").write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )
    print(
        "Recorded observation reproduced exactly, excluding run date; zero provider calls."
    )


if __name__ == "__main__":
    main()
