"""Check an operator-reviewed local package; never publish or contact a provider."""

import argparse
import json
from pathlib import Path

from app.crm.artifacts import CrmArtifact, publication_issues
from pydantic import ValidationError


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("manifest", type=Path)
    args = parser.parse_args()
    try:
        with args.manifest.open("rb") as source:
            data = source.read(64 * 1024 + 1)
        if len(data) > 64 * 1024:
            raise ValueError("Manifest exceeds size limit")
        artifact = CrmArtifact.model_validate_json(data)
        issues = publication_issues(artifact, args.manifest.parent)
    except (OSError, ValueError, ValidationError):
        # Do not echo potentially private input or absolute file paths.
        issues = ("invalid_or_unavailable_manifest",)
    print(json.dumps({"eligibleForManualReview": not issues, "issues": issues}))
    return 1 if issues else 0


if __name__ == "__main__":
    raise SystemExit(main())
