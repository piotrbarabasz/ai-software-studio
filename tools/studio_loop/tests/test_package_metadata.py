from __future__ import annotations

from pathlib import Path

import studio_loop


def test_package_requires_python_311_and_imports_without_application_dependencies() -> None:
    project = Path(__file__).parents[1] / "pyproject.toml"
    metadata = project.read_text(encoding="utf-8")
    assert 'requires-python = ">=3.11"' in metadata
    assert studio_loop.__version__ == "0.1.0"
    assert "frontend/" not in metadata
    assert "backend/" not in metadata
