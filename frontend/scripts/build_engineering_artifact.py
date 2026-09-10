"""Rebuild first-party downloads from a reviewed local Git revision. No network calls."""

import hashlib
import io
import json
from pathlib import Path
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[2]
REVISION = "0d38ef8037ce28a0ae4f8a3f3f3df4af4a8524c5"
ASSETS = ROOT / "frontend/src/assets/evidence"
OUTPUT = ASSETS / "engineering-0d38ef8"
PREVIEWS = (
    "frontend/src/app/features/contact/contact-form.component.ts",
    "backend/app/api/contact.py",
    "backend/tests/integration/test_contact_delivery.py",
    "backend/Dockerfile",
    "infra/gcp/cloudbuild.pr-checks.yaml",
    "docs/gcp-runbook.md",
)
PACKAGE_PATHS = (
    "frontend/config/public-brand.json",
    "frontend/src/app/core/content/contact-options.pl.ts",
    "frontend/src/app/services/contact-api.types.ts",
    "backend/app",
    "backend/pyproject.toml",
    "backend/requirements-dev.lock",
    "backend/requirements.lock",
    "backend/Dockerfile",
    "backend/tests/conftest.py",
    "backend/tests/contract/test_contact_contract.py",
    "backend/tests/integration/test_contact_delivery.py",
)


def git(*args: str) -> bytes:
    return subprocess.check_output(["git", *args], cwd=ROOT)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    sources = set(
        git("ls-tree", "-r", "--name-only", REVISION, "--", *PACKAGE_PATHS)
        .decode()
        .splitlines()
    )
    sources.update(PREVIEWS)
    files = {name: git("show", f"{REVISION}:{name}") for name in sorted(sources)}
    previews = []
    for name in PREVIEWS:
        filename = name.replace("/", "--") + ".txt"
        (OUTPUT / filename).write_bytes(files[name])
        previews.append(
            {
                "sourcePath": name,
                "file": filename,
                "sha256": hashlib.sha256(files[name]).hexdigest(),
            }
        )
    patch = git(
        "diff", f"{REVISION}^1", REVISION, "--", "frontend/src/app/app.config.ts"
    )
    if not patch.strip():
        raise ValueError("Expected actual hydration diff from merged PR #56")
    (OUTPUT / "pr-56-hydration.patch").write_bytes(patch)
    archive = io.BytesIO()
    with zipfile.ZipFile(
        archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9
    ) as package:
        entries = {
            **files,
            "README.md": (ASSETS / "protolume-engineering.md").read_bytes(),
            "pr-56-hydration.patch": patch,
        }
        for name, content in sorted(entries.items()):
            info = zipfile.ZipInfo(name, date_time=(2026, 9, 9, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            package.writestr(info, content)
    archive_bytes = archive.getvalue()
    (OUTPUT / "protolume-api.zip").write_bytes(archive_bytes)
    manifest = {
        "revision": REVISION,
        "reviewedOn": "2026-09-09",
        "origin": "Own project: piotrbarabasz/ai-software-studio, merged PR #56",
        "scope": "Runnable API tests and selected project source files; no credentials or live SMTP test",
        "previews": previews,
        "patch": {
            "file": "pr-56-hydration.patch",
            "sha256": hashlib.sha256(patch).hexdigest(),
        },
        "archive": {
            "file": "protolume-api.zip",
            "sha256": hashlib.sha256(archive_bytes).hexdigest(),
            "sourceFiles": sorted(files),
        },
    }
    (OUTPUT / "source-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    subprocess.run(
        [
            "node",
            str(ROOT / "frontend/node_modules/prettier/bin/prettier.cjs"),
            "--write",
            str(OUTPUT / "source-manifest.json"),
        ],
        cwd=ROOT,
        check=True,
    )
    print(
        f"Prepared {len(previews)} exact source previews, PR fragment and {len(archive_bytes)}-byte API package."
    )


if __name__ == "__main__":
    main()
