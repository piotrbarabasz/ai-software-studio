#!/usr/bin/env python3
"""Plan or explicitly apply safe path filters to Protolume's GCP Cloud Build triggers.

Without --apply this tool prints a plan and does not contact GCP.
Backend CI builds, tests and pushes an image; it never changes Cloud Run traffic.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

MANIFEST = Path(__file__).resolve().parents[2] / "infra/gcp/component-triggers.json"


class TriggerConfigurationError(Exception):
    """Refuse an unverified trigger mutation."""


def load_manifest(path: Path = MANIFEST) -> dict[str, Any]:
    config = json.loads(path.read_text(encoding="utf-8"))
    if (
        config.get("schema_version") != 1
        or config.get("project") != "ai-software-studio-501918"
        or config.get("trigger_location") != "global"
        or config.get("branch_pattern") != "^master$"
        or config.get("repository_owner") != "piotrbarabasz"
        or config.get("repository_name") != "ai-software-studio"
        or config["frontend"]["name"] != "deploy-prod"
        or config["frontend"]["id"] != "901333cb-1c13-4929-90e5-6df070eb647e"
        or config["frontend"]["config"] != "infra/gcp/cloudbuild.deploy.yaml"
        or config["backend"]["name"] != "backend-ci"
        or config["backend"]["config"] != "infra/gcp/cloudbuild.backend-ci.yaml"
    ):
        raise TriggerConfigurationError("Unexpected repository, branch or production trigger contract.")
    for component in ("frontend", "backend"):
        paths = config[component].get("included_files")
        if not isinstance(paths, list) or not paths or len(paths) != len(set(paths)):
            raise TriggerConfigurationError(f"{component}: nonempty unique included_files required.")
        if not all(isinstance(path, str) and path and not path.startswith("/") and
                   ".." not in path.split("/") for path in paths):
            raise TriggerConfigurationError(f"{component}: invalid included_files path.")
    return config


def cloud_base(config: dict[str, Any]) -> list[str]:
    return [
        f"--project={config['project']}",
        f"--region={config['trigger_location']}",
    ]


def included(component: dict[str, Any]) -> str:
    return "--included-files=" + ",".join(component["included_files"])


def frontend_update(config: dict[str, Any]) -> list[str]:
    return [
        "gcloud", "builds", "triggers", "update", "github",
        config["frontend"]["id"],
        *cloud_base(config), included(config["frontend"]),
    ]


def backend_create(config: dict[str, Any], service_account: str = "") -> list[str]:
    command = [
        "gcloud", "builds", "triggers", "create", "github",
        f"--name={config['backend']['name']}",
        f"--repo-owner={config['repository_owner']}",
        f"--repo-name={config['repository_name']}",
        f"--branch-pattern={config['branch_pattern']}",
        f"--build-config={config['backend']['config']}",
        *cloud_base(config), included(config["backend"]),
    ]
    if service_account:
        command.append(f"--service-account={service_account}")
    return command


def backend_update(config: dict[str, Any], trigger_id: str) -> list[str]:
    return [
        "gcloud", "builds", "triggers", "update", "github",
        trigger_id, *cloud_base(config), included(config["backend"]),
    ]


def run_json(command: list[str]) -> Any:
    result = subprocess.run(command, capture_output=True, text=True, check=False)
    if result.returncode:
        raise TriggerConfigurationError(
            f"gcloud command failed with code {result.returncode}; inspect GCP permissions and trigger state."
        )
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as error:
        raise TriggerConfigurationError("gcloud returned invalid JSON.") from error


def run_write(command: list[str]) -> None:
    result = subprocess.run(command, capture_output=True, text=True, check=False)
    if result.returncode:
        raise TriggerConfigurationError(
            f"Cloud Build trigger update failed with code {result.returncode}; inspect GCP before retrying."
        )


def read_frontend(config: dict[str, Any]) -> dict[str, Any]:
    trigger = run_json([
        "gcloud", "builds", "triggers", "describe", config["frontend"]["id"],
        *cloud_base(config), "--format=json",
    ])
    validate_trigger(config, "frontend", trigger)
    return trigger


def read_backend(config: dict[str, Any]) -> dict[str, Any] | None:
    payload = run_json([
        "gcloud", "builds", "triggers", "list", *cloud_base(config),
        f"--filter=name={config['backend']['name']}", "--format=json",
    ])
    if not isinstance(payload, list):
        raise TriggerConfigurationError("Expected a list of Cloud Build triggers.")
    matches = [item for item in payload if item.get("name") == config["backend"]["name"]]
    if len(matches) > 1:
        raise TriggerConfigurationError("Multiple backend-ci triggers found; refusing changes.")
    if matches:
        validate_trigger(config, "backend", matches[0])
    return matches[0] if matches else None


def validate_trigger(config: dict[str, Any], component: str, trigger: Any) -> None:
    expected = config[component]
    if not isinstance(trigger, dict) or trigger.get("name") != expected["name"]:
        raise TriggerConfigurationError(f"{component}: unexpected trigger name.")
    if trigger.get("disabled"):
        raise TriggerConfigurationError(f"{component}: trigger is disabled.")
    if trigger.get("filename") != expected["config"]:
        raise TriggerConfigurationError(f"{component}: unexpected build config path.")
    github = trigger.get("github")
    if not isinstance(github, dict) or github.get("push", {}).get("branch") != config["branch_pattern"]:
        raise TriggerConfigurationError(f"{component}: expected GitHub master push event.")
    if github.get("owner") and github["owner"] != config["repository_owner"]:
        raise TriggerConfigurationError(f"{component}: repository owner mismatch.")
    if github.get("name") and github["name"] != config["repository_name"]:
        raise TriggerConfigurationError(f"{component}: repository name mismatch.")
    if component == "frontend" and trigger.get("id") != expected["id"]:
        raise TriggerConfigurationError("Frontend trigger ID mismatch.")


def verify_filters(config: dict[str, Any], component: str, trigger: dict[str, Any]) -> None:
    if set(trigger.get("includedFiles", [])) != set(config[component]["included_files"]):
        raise TriggerConfigurationError(f"{component}: includedFiles differ from the manifest.")
    if trigger.get("ignoredFiles"):
        raise TriggerConfigurationError(f"{component}: unexpected ignoredFiles may suppress changes.")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true",
                        help="Modify Cloud Build triggers; without this only print a plan.")
    args = parser.parse_args()
    try:
        config = load_manifest()
        if not args.apply:
            print("PLAN ONLY: no GCP changes.")
            print("1. Create or verify master backend-ci trigger (tests, build, smoke, push; no Cloud Run deploy).")
            print("2. Filter existing master deploy-prod trigger to V3 frontend and shared inputs.")
            print("3. Verify exact includedFiles and no ignoredFiles on both triggers.")
            print("Frontend paths:", ", ".join(config["frontend"]["included_files"]))
            print("Backend paths:", ", ".join(config["backend"]["included_files"]))
            return 0
        if not shutil.which("gcloud"):
            raise TriggerConfigurationError("gcloud is required for --apply.")
        frontend = read_frontend(config)
        if frontend.get("ignoredFiles"):
            raise TriggerConfigurationError("Existing frontend ignoredFiles need manual review.")
        backend = read_backend(config)
        if backend and backend.get("ignoredFiles"):
            raise TriggerConfigurationError("Existing backend ignoredFiles need manual review.")
        service_account = str(frontend.get("serviceAccount") or "")
        # Configure backend first: a failed create cannot accidentally restrict live frontend deploys.
        if backend:
            run_write(backend_update(config, str(backend["id"])))
        else:
            run_write(backend_create(config, service_account))
        updated_backend = read_backend(config)
        if not updated_backend:
            raise TriggerConfigurationError("Backend trigger creation was not verified.")
        verify_filters(config, "backend", updated_backend)
        run_write(frontend_update(config))
        verify_filters(config, "frontend", read_frontend(config))
        print("PASS: independent Cloud Build trigger filters installed and verified.")
        print("Backend deploy still requires a separate explicit production release.")
        return 0
    except (OSError, ValueError, KeyError, TriggerConfigurationError) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
