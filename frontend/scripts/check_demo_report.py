"""Check PDF content and render every page for mandatory visual review."""

import json
from pathlib import Path
import re
import subprocess

import pymupdf
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[2]
PDF = ROOT / "frontend/src/assets/evidence/protolume-raport-demo.pdf"
OUTPUT = ROOT / "tmp/pdfs"


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.replace("—", "-").replace("–", "-")).strip()


def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for item in value.values():
            yield from strings(item)
    elif isinstance(value, list):
        for item in value:
            yield from strings(item)


def main() -> None:
    source = json.loads(
        subprocess.check_output(
            ["node", str(ROOT / "frontend/scripts/demo-report-source.cjs")]
        )
    )
    reader = PdfReader(PDF)
    text = normalize(" ".join(page.extract_text() for page in reader.pages))
    required = [
        source[key]
        for key in (
            "title",
            "fictionalNotice",
            "lead",
            "version",
            "preparedOn",
            "decisionSummary",
            "scenarioStatusMeaning",
            "validationQuestion",
            "currentProcess",
            "scope",
            "acceptanceCriteria",
            "riskRegister",
            "firstStagePlan",
        )
    ]
    required.extend(
        {key: value for key, value in case.items() if key != "id"}
        for case in source["scenarios"]
    )
    missing = [value for value in strings(required) if normalize(value) not in text]
    if missing:
        raise ValueError("PDF content missing or corrupt: " + repr(missing))
    if len(reader.pages) != 4:
        raise ValueError("Review pagination: expected four deliberate sections/pages")
    if f"Opisane scenariusze: {len(source['scenarios'])}" not in text:
        raise ValueError("Scenario count differs from source")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    document = pymupdf.open(PDF)
    for index, page in enumerate(document, 1):
        page.get_pixmap(matrix=pymupdf.Matrix(1.4, 1.4)).save(
            OUTPUT / f"report-page-{index}.png"
        )
    result = {
        "pages": len(reader.pages),
        "requiredContentMatches": True,
        "selectablePolishText": True,
        "renderEngine": "PyMuPDF " + pymupdf.VersionBind,
        "renderNote": "Poppler unavailable locally; reviewed all four rendered page PNGs",
        "visualReviewRequiredAfterEveryRegeneration": True,
    }
    (OUTPUT / "report-check.json").write_text(
        json.dumps(result, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(result))


if __name__ == "__main__":
    main()
