#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: create-triggers.sh --project-id PROJECT [--trigger-location LOCATION]
                          [--trigger-id ID | --trigger-name NAME]

Historical filename retained for compatibility. The command now performs a read-only audit and
never creates or updates a trigger. Apply drift manually in Cloud Console, then rerun this audit.
EOF
}

project_id=""
trigger_location="global"
trigger_id=""
trigger_name="deploy-prod"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-id) project_id="${2:-}"; shift 2 ;;
    --trigger-location) trigger_location="${2:-}"; shift 2 ;;
    --trigger-id) trigger_id="${2:-}"; trigger_name=""; shift 2 ;;
    --trigger-name) trigger_name="${2:-}"; trigger_id=""; shift 2 ;;
    --help|-h) usage; exit 0 ;;
    *) printf 'Error: unknown argument: %s\n' "$1" >&2; usage >&2; exit 2 ;;
  esac
done

if [[ -z "$project_id" ]]; then
  printf 'Error: missing --project-id.\n' >&2
  exit 2
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
audit_args=(--project "$project_id" --trigger-location "$trigger_location")
if [[ -n "$trigger_id" ]]; then
  audit_args+=(--trigger-id "$trigger_id")
else
  audit_args+=(--trigger-name "$trigger_name")
fi
if command -v python3 >/dev/null 2>&1; then
  python3 "$script_dir/audit_trigger.py" "${audit_args[@]}"
else
  python "$script_dir/audit_trigger.py" "${audit_args[@]}"
fi
