"""Reproducible lexical-retrieval observation. Never calls a generation provider."""

import argparse
import hashlib
import json
from datetime import UTC, datetime
from pathlib import Path

from app.rag.corpus import load_corpus
from app.rag.retrieval import retrieve

ROOT = Path(__file__).resolve().parents[2]
CORPUS = ROOT / "frontend/src/assets/rag/protolume-materials-v1.json"
CASES = ROOT / "backend/tests/fixtures/rag_retrieval_cases.json"


def evaluate() -> dict:
    corpus = load_corpus(CORPUS)
    cases = json.loads(CASES.read_text(encoding="utf-8"))
    results = []
    for case in cases:
        hits = retrieve(case["question"], corpus)
        first = hits[0].passage.id if hits else None
        results.append(
            {
                **case,
                "actualFirst": first,
                "matchedExpectation": first == case["expectedFirst"],
                "retrieved": [
                    {"id": hit.passage.id, "sharedTerms": hit.shared_terms} for hit in hits
                ],
            }
        )
    failures = [case["id"] for case in results if not case["matchedExpectation"]]
    return {
        "recordedAt": datetime.now(UTC).isoformat(),
        "method": (
            "lexical-baseline-v1; first-hit correctness or empty result; author-written cases"
        ),
        "corpusId": corpus.id,
        "corpusSha256": hashlib.sha256(CORPUS.read_bytes()).hexdigest(),
        "casesSha256": hashlib.sha256(CASES.read_bytes()).hexdigest(),
        "sampleSize": len(results),
        "matchingCases": len(results) - len(failures),
        "failureIds": failures,
        "modelCalls": 0,
        "limits": [
            "Not a real RAG/provider quality evaluation or an independent dataset.",
            "Lexical overlap can select irrelevant passages or miss paraphrases.",
            "Model relevance, conflict recognition and injection resistance are untested.",
            "Provider contract tests use doubles; they do not establish monetary cost bounds.",
        ],
        "results": results,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    report = evaluate()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(
        f"Retrieval observations: {report['matchingCases']}/{report['sampleSize']}; model calls: 0"
    )
    print("Failures: " + ", ".join(report["failureIds"]))
    # An observation report includes failures; it is not a production readiness gate.


if __name__ == "__main__":
    main()
