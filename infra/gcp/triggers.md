# Cloud Build trigger contract

The remote default branch was verified from `git ls-remote --symref origin HEAD` as `master`. The production trigger is `deploy-prod` (`901333cb-1c13-4929-90e5-6df070eb647e`) in trigger location `global`, on push branch `^master$`, using `infra/gcp/cloudbuild.deploy.yaml`. Its deployment region remains independently fixed to `europe-central2` by `production-contract.json`.

The YAML uses built-in `$SHORT_SHA` directly. `_IMAGE_TAG` is not a production trigger substitution. The minimal target trigger contains only the six real environment-specific values: `_CONTACT_RECIPIENT_EMAIL`, `_CONTACT_FROM_EMAIL`, `_SMTP_HOST`, `_SMTP_PORT`, `_SMTP_USERNAME` and `_SMTP_USE_TLS`.

Audit the active trigger by exact ID without changing GCP:

```powershell
.\scripts\gcp\create-triggers.ps1 -ProjectId ai-software-studio-501918 -TriggerLocation global -TriggerId 901333cb-1c13-4929-90e5-6df070eb647e
```

The historical `create-triggers` name is read-only. Exact migration values and the manual checklist are in `docs/gcp-cicd.md`.

The PR trigger is named `pr-checks`, targets pull requests whose base branch matches `^master$`, uses `infra/gcp/cloudbuild.pr-checks.yaml`, has no trigger substitutions or secrets, and never builds, pushes, or deploys a container. Its preview build remains explicitly noindex.

Audit both trigger contracts without changing GCP:

```powershell
.\scripts\gcp\create-triggers.ps1 -ProjectId ai-software-studio-501918 -TriggerKind production -TriggerId 901333cb-1c13-4929-90e5-6df070eb647e
.\scripts\gcp\create-triggers.ps1 -ProjectId ai-software-studio-501918 -TriggerKind pull-request -TriggerName pr-checks
```
