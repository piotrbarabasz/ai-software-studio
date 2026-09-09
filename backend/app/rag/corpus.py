"""A bounded local corpus; this module never downloads user-provided URLs."""

import json
import re
from dataclasses import dataclass
from pathlib import Path

SOURCE_PATH = "/rozwiazania/chatbot-ai-dla-firm"
MAX_CORPUS_BYTES = 64 * 1024


@dataclass(frozen=True)
class Passage:
    id: str
    title: str
    text: str
    source_url: str


@dataclass(frozen=True)
class Corpus:
    id: str
    version: str
    reviewed_on: str
    passages: tuple[Passage, ...]


def load_corpus(path: Path) -> Corpus:
    """Load an operator-selected local file, never a request parameter or remote URL."""
    with path.open("rb") as source:
        raw = source.read(MAX_CORPUS_BYTES + 1)
    if len(raw) > MAX_CORPUS_BYTES:
        raise ValueError("Corpus exceeds size limit")
    data = json.loads(raw)
    if (
        not isinstance(data, dict)
        or data.get("schemaVersion") != 1
        or data.get("sourcePath") != SOURCE_PATH
    ):
        raise ValueError("Unsupported corpus schema or source path")
    for field in ("id", "version", "reviewedOn", "title", "provenance"):
        if not isinstance(data.get(field), str) or not data[field].strip():
            raise ValueError(f"Missing corpus metadata: {field}")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", data["reviewedOn"]):
        raise ValueError("Invalid corpus review date")
    sections = data.get("sections")
    if not isinstance(sections, list) or not 1 <= len(sections) <= 32:
        raise ValueError("Corpus must have 1..32 sections")
    passages = []
    seen = set()
    for section in sections:
        if not isinstance(section, dict):
            raise ValueError("Invalid section")
        passage_id = section.get("id", "")
        if not isinstance(passage_id, str) or not re.fullmatch(
            r"rag-source-[a-z0-9-]+", passage_id
        ):
            raise ValueError("Invalid section identifier")
        if passage_id in seen:
            raise ValueError("Duplicate section identifier")
        seen.add(passage_id)
        for field, maximum in (("title", 200), ("text", 3000)):
            value = section.get(field)
            if not isinstance(value, str) or not 1 <= len(value.strip()) <= maximum:
                raise ValueError(f"Invalid section {field}")
        passages.append(
            Passage(passage_id, section["title"], section["text"], f"{SOURCE_PATH}#{passage_id}")
        )
    return Corpus(data["id"], data["version"], data["reviewedOn"], tuple(passages))
