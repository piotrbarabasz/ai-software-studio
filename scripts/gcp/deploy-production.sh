#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: deploy-production.sh --project-id PROJECT \
  --contact-recipient-email EMAIL --contact-from-email EMAIL \
  --smtp-host HOST --smtp-port PORT --smtp-username USER --smtp-use-tls true|false

Submits the combined production pipeline. The working tree must be clean; both images use the
current commit SHA. SMTP_PASSWORD and the public legal JSON remain Secret Manager references.
EOF
}

project_id=""
contact_recipient_email=""
contact_from_email=""
smtp_host=""
smtp_port=""
smtp_username=""
smtp_use_tls=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-id) project_id="${2:-}"; shift 2 ;;
    --contact-recipient-email) contact_recipient_email="${2:-}"; shift 2 ;;
    --contact-from-email) contact_from_email="${2:-}"; shift 2 ;;
    --smtp-host) smtp_host="${2:-}"; shift 2 ;;
    --smtp-port) smtp_port="${2:-}"; shift 2 ;;
    --smtp-username) smtp_username="${2:-}"; shift 2 ;;
    --smtp-use-tls) smtp_use_tls="${2:-}"; shift 2 ;;
    --help|-h) usage; exit 0 ;;
    *) printf 'Error: unknown argument: %s\n' "$1" >&2; usage >&2; exit 2 ;;
  esac
done

required_values=(
  "$project_id"
  "$contact_recipient_email"
  "$contact_from_email"
  "$smtp_host"
  "$smtp_port"
  "$smtp_username"
  "$smtp_use_tls"
)
for value in "${required_values[@]}"; do
  if [[ -z "$value" ]]; then
    printf 'Error: every production argument is required.\n' >&2
    usage >&2
    exit 2
  fi
  if [[ "$value" == *","* ]]; then
    printf 'Error: production substitution values must not contain commas.\n' >&2
    exit 2
  fi
done

if [[ "$smtp_use_tls" != "true" && "$smtp_use_tls" != "false" ]]; then
  printf 'Error: --smtp-use-tls must be true or false.\n' >&2
  exit 2
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/../.." && pwd)"
if [[ -n "$(git -C "$repo_root" status --porcelain)" ]]; then
  printf 'Error: commit or stash all changes before tagging and submitting production source.\n' >&2
  exit 1
fi

image_tag="$(git -C "$repo_root" rev-parse --short=12 HEAD)"
if [[ ! "$image_tag" =~ ^[0-9a-f]{7,64}$ ]]; then
  printf 'Error: git did not resolve a valid lowercase hexadecimal commit tag.\n' >&2
  exit 1
fi

substitutions="SHORT_SHA=$image_tag,_CONTACT_RECIPIENT_EMAIL=$contact_recipient_email"
substitutions+=",_CONTACT_FROM_EMAIL=$contact_from_email,_SMTP_HOST=$smtp_host"
substitutions+=",_SMTP_PORT=$smtp_port,_SMTP_USERNAME=$smtp_username,_SMTP_USE_TLS=$smtp_use_tls"

printf 'Submitting the combined production pipeline for commit %s.\n' "$image_tag"
gcloud builds submit "$repo_root" \
  --project "$project_id" \
  --config "$repo_root/infra/gcp/cloudbuild.deploy.yaml" \
  --substitutions "$substitutions"

