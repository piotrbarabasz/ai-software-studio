#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: create-triggers.sh --project-id PROJECT [--region REGION] [--trigger NAME]

Historical filename retained for compatibility. The command now performs a read-only audit and
never creates or updates a trigger. Apply drift manually in Cloud Console, then rerun this audit.
EOF
}

project_id=""
region="europe-central2"
trigger="deploy-prod"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-id) project_id="${2:-}"; shift 2 ;;
    --region) region="${2:-}"; shift 2 ;;
    --trigger) trigger="${2:-}"; shift 2 ;;
    --help|-h) usage; exit 0 ;;
    *) printf 'Error: unknown argument: %s\n' "$1" >&2; usage >&2; exit 2 ;;
  esac
done

if [[ -z "$project_id" ]]; then
  printf 'Error: missing --project-id.\n' >&2
  exit 2
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if command -v python3 >/dev/null 2>&1; then
  python3 "$script_dir/audit_trigger.py" --project "$project_id" --region "$region" --trigger "$trigger"
else
  python "$script_dir/audit_trigger.py" --project "$project_id" --region "$region" --trigger "$trigger"
fi
