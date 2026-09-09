"""Small lexical baseline, not an embedding model or semantic-quality claim."""

import re
import unicodedata
from dataclasses import dataclass

from app.rag.corpus import Corpus, Passage

# Explicit normalization only. Its recall limitations are reported by the evaluation harness.
STOP_WORDS = frozenset(
    [
        "czy",
        "jak",
        "jaka",
        "jakie",
        "jaki",
        "jest",
        "sa",
        "sie",
        "nie",
        "na",
        "do",
        "od",
        "po",
        "ze",
        "dla",
        "ten",
        "to",
        "oraz",
        "albo",
        "protolume",
        "publiczna",
        "publiczny",
        "przykladowy",
        "przykladowa",
        "demo",
        "materialy",
        "moge",
        "mozna",
    ]
)
STEMS = ("symulac", "model", "pytan", "odpow", "przeglad", "raport", "klient", "formularz")


def terms(text: str) -> frozenset[str]:
    folded = unicodedata.normalize("NFKD", text.casefold().replace("ł", "l"))
    folded = "".join(char for char in folded if not unicodedata.combining(char))
    tokens = re.findall(r"[a-z0-9]+", folded)
    return frozenset(
        next((stem for stem in STEMS if token.startswith(stem)), token)
        for token in tokens
        if len(token) >= 3 and token not in STOP_WORDS
    )


@dataclass(frozen=True)
class SearchHit:
    passage: Passage
    shared_terms: tuple[str, ...]


def retrieve(question: str, corpus: Corpus, *, limit: int = 2) -> tuple[SearchHit, ...]:
    if not 1 <= limit <= 3:
        raise ValueError("Retrieval limit must be 1..3")
    if not question.strip() or len(question) > 300:
        raise ValueError("Question must contain 1..300 characters")
    query = terms(question)
    ranked = []
    for passage in corpus.passages:
        shared = query & terms(passage.title + " " + passage.text)
        # No marketing fallback when the lexical baseline has insufficient support.
        if shared and len(shared) / max(len(query), 1) >= 0.4:
            ranked.append(SearchHit(passage, tuple(sorted(shared))))
    ranked.sort(key=lambda hit: (-len(hit.shared_terms), hit.passage.id))
    return tuple(ranked[:limit])
