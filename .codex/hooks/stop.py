"""Explicitly decline automatic continuation; only the controller may resume."""

from __future__ import annotations

import json


print(json.dumps({"continue": False, "stopReason": "Continuation belongs to the Python controller."}))
