#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: create-triggers.sh --project-id PROJECT --repo-name REPO [options]

Required:
  --project-id                Google Cloud project ID
  --repo-name                 Connected GitHub repository name

Optional:
  --region                    Cloud Build region (default: europe-central2)
  --repo-owner                GitHub repository owner; derived from git remote when possible
  --branch                    Production branch name or regex (default: master)
  --backend-url               Backend Cloud Run URL
  --public-site-url           Public frontend URL used by canonical and CORS
  --contact-recipient-email   Production contact recipient placeholder
  --contact-from-email        Production contact from placeholder
  --smtp-host                 SMTP host placeholder
  --smtp-port                 SMTP port placeholder
  --smtp-username             SMTP username placeholder
  --smtp-use-tls              SMTP TLS flag placeholder
  --contact-rate-limit        Contact rate limit (default: 30)
  --smtp-password-secret      Secret Manager secret name (default: aisoftware-studio-smtp-password)
  --public-legal-config-secret Secret Manager legal JSON secret name
  --help                      Show this message

This helper creates the push triggers only after the GitHub repository is already connected in Cloud Build.
Create the PR validation trigger in the Cloud Console using infra/gcp/cloudbuild.pr-checks.yaml and a base branch regex of ^master$.
EOF
}

fail() {
  printf 'Error: %s\n' "$1" >&2
  exit 1
}

PROJECT_ID=""
REGION="europe-central2"
REPO_OWNER=""
REPO_NAME=""
BRANCH="master"
BACKEND_URL=""
PUBLIC_SITE_URL=""
CONTACT_RECIPIENT_EMAIL="owner@example.com"
CONTACT_FROM_EMAIL="noreply@example.com"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USERNAME="smtp-user@example.com"
SMTP_USE_TLS="true"
CONTACT_RATE_LIMIT_PER_MINUTE="30"
SMTP_PASSWORD_SECRET="aisoftware-studio-smtp-password"
PUBLIC_LEGAL_CONFIG_SECRET="aisoftware-studio-public-legal-config"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-id) PROJECT_ID="${2:-}"; shift 2 ;;
    --region) REGION="${2:-}"; shift 2 ;;
    --repo-owner) REPO_OWNER="${2:-}"; shift 2 ;;
    --repo-name) REPO_NAME="${2:-}"; shift 2 ;;
    --branch) BRANCH="${2:-}"; shift 2 ;;
    --backend-url) BACKEND_URL="${2:-}"; shift 2 ;;
    --public-site-url) PUBLIC_SITE_URL="${2:-}"; shift 2 ;;
    --contact-recipient-email) CONTACT_RECIPIENT_EMAIL="${2:-}"; shift 2 ;;
    --contact-from-email) CONTACT_FROM_EMAIL="${2:-}"; shift 2 ;;
    --smtp-host) SMTP_HOST="${2:-}"; shift 2 ;;
    --smtp-port) SMTP_PORT="${2:-}"; shift 2 ;;
    --smtp-username) SMTP_USERNAME="${2:-}"; shift 2 ;;
    --smtp-use-tls) SMTP_USE_TLS="${2:-}"; shift 2 ;;
    --contact-rate-limit) CONTACT_RATE_LIMIT_PER_MINUTE="${2:-}"; shift 2 ;;
    --smtp-password-secret) SMTP_PASSWORD_SECRET="${2:-}"; shift 2 ;;
    --public-legal-config-secret) PUBLIC_LEGAL_CONFIG_SECRET="${2:-}"; shift 2 ;;
    --help|-h) usage; exit 0 ;;
    *) fail "Unknown argument: $1" ;;
  esac
done

[[ -n "$PROJECT_ID" ]] || fail "Missing --project-id."
[[ -n "$REPO_NAME" ]] || fail "Missing --repo-name."
[[ -n "$BACKEND_URL" ]] || fail "Missing --backend-url."
[[ -n "$PUBLIC_SITE_URL" ]] || fail "Missing --public-site-url."

if [[ -z "$REPO_OWNER" ]]; then
  if command -v git >/dev/null 2>&1; then
    remote_url="$(git remote get-url origin 2>/dev/null || true)"
    remote_path="${remote_url#*github.com/}"
    if [[ "$remote_path" == "$remote_url" ]]; then
      remote_path="${remote_url#*github.com:}"
    fi
    remote_path="${remote_path%.git}"
    if [[ "$remote_path" == */* ]]; then
      REPO_OWNER="${remote_path%%/*}"
      if [[ -z "$REPO_NAME" ]]; then
        REPO_NAME="${remote_path#*/}"
      fi
    fi
  fi
fi

[[ -n "$REPO_OWNER" ]] || fail "Could not determine --repo-owner. Pass --repo-owner explicitly or run from a GitHub remote."

if ! command -v gcloud >/dev/null 2>&1; then
  fail "gcloud is not installed or not on PATH."
fi

if ! gcloud builds repositories list --project="$PROJECT_ID" --region="$REGION" --format="value(name)" 2>/dev/null | grep -Fq "$REPO_NAME"; then
  fail "Cloud Build repository connection for '$REPO_NAME' was not found. Connect the GitHub repository in Cloud Console first, then rerun this script."
fi

normalize_branch_pattern() {
  local value="$1"
  if [[ "$value" =~ ^\^.*\$$ ]]; then
    printf '%s' "$value"
  else
    printf '^%s$' "$value"
  fi
}

create_trigger() {
  local trigger_name="$1"
  local branch_pattern="$2"
  local substitutions="$3"

  gcloud builds triggers create github \
    --name="$trigger_name" \
    --project="$PROJECT_ID" \
    --region="$REGION" \
    --repo-owner="$REPO_OWNER" \
    --repo-name="$REPO_NAME" \
    --branch-pattern="$branch_pattern" \
    --build-config="infra/gcp/cloudbuild.deploy.yaml" \
    --include-logs-with-status \
    --substitutions="$substitutions"
}

SUBSTITUTIONS="_PROJECT_ID=$PROJECT_ID,_REGION=$REGION,_ARTIFACT_REPO=aisoftware-studio,_BACKEND_SERVICE=aisoftware-studio-api,_FRONTEND_SERVICE=aisoftware-studio-web,_BACKEND_IMAGE_NAME=aisoftware-studio-api,_FRONTEND_IMAGE_NAME=aisoftware-studio-web,_BACKEND_URL=$BACKEND_URL,_PUBLIC_SITE_URL=$PUBLIC_SITE_URL,_PUBLIC_SITE_INDEXING=true,_PUBLIC_LEGAL_CONFIG_SECRET=$PUBLIC_LEGAL_CONFIG_SECRET,_SMTP_PASSWORD_SECRET=$SMTP_PASSWORD_SECRET,_CONTACT_RATE_LIMIT_PER_MINUTE=$CONTACT_RATE_LIMIT_PER_MINUTE,_CONTACT_RECIPIENT_EMAIL=$CONTACT_RECIPIENT_EMAIL,_CONTACT_FROM_EMAIL=$CONTACT_FROM_EMAIL,_SMTP_HOST=$SMTP_HOST,_SMTP_PORT=$SMTP_PORT,_SMTP_USERNAME=$SMTP_USERNAME,_SMTP_USE_TLS=$SMTP_USE_TLS,_CONTACT_DELIVERY_MODE=email,_APP_ENV=production,_MIN_INSTANCES=0,_IMAGE_TAG=\$SHORT_SHA"

PROD_BRANCH_PATTERN="$(normalize_branch_pattern "$BRANCH")"

printf 'Creating production trigger deploy-prod for branch %s\n' "$PROD_BRANCH_PATTERN"
create_trigger "deploy-prod" "$PROD_BRANCH_PATTERN" "$SUBSTITUTIONS"

printf 'Creating temporary test trigger deploy-test-002-gcp-deployment for branch ^002-gcp-deployment$\n'
TEST_SUBSTITUTIONS="${SUBSTITUTIONS/_PUBLIC_SITE_INDEXING=true/_PUBLIC_SITE_INDEXING=false}"
create_trigger "deploy-test-002-gcp-deployment" "^002-gcp-deployment$" "$TEST_SUBSTITUTIONS"

cat <<EOF
Trigger creation complete.

Create the PR validation trigger in Cloud Console:
- Event: pull request
- Base branch regex: ^master$
- Config file: infra/gcp/cloudbuild.pr-checks.yaml
- Deploy: disabled
EOF
