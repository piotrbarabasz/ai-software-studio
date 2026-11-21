import json
from pathlib import Path
from typing import TypedDict


class PublicBrandOwner(TypedDict):
    name: str
    role: str


class PublicBrand(TypedDict):
    name: str
    descriptor: str
    owner: PublicBrandOwner


def _load_public_brand() -> PublicBrand:
    config_path = Path(__file__).with_name("public-brand.json")
    try:
        configuration = json.loads(config_path.read_text(encoding="utf-8"))
        name = configuration["name"]
        descriptor = configuration["descriptor"]
        owner = configuration["owner"]
        if (
            not isinstance(name, str)
            or not name.strip()
            or not isinstance(descriptor, str)
            or not descriptor.strip()
            or not isinstance(owner, dict)
            or not isinstance(owner.get("name"), str)
            or not isinstance(owner.get("role"), str)
        ):
            raise ValueError("invalid public brand shape")
        return {"name": name, "descriptor": descriptor, "owner": owner}
    except (OSError, json.JSONDecodeError, KeyError, TypeError, ValueError) as exc:
        raise RuntimeError(f"Cannot load public brand configuration: {exc}") from exc


public_brand = _load_public_brand()
