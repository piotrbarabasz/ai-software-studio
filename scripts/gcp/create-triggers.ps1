param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectId,

  [string]$Region = 'europe-central2',

  [string]$TriggerName = 'deploy-prod'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# Kept under the historical filename for compatibility. This command is intentionally read-only.
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\')).Path
$auditScript = Join-Path $PSScriptRoot 'audit_trigger.py'
$python = Get-Command py -ErrorAction SilentlyContinue

if ($python) {
  & py -3.12 $auditScript --project $ProjectId --region $Region --trigger $TriggerName
} else {
  & python $auditScript --project $ProjectId --region $Region --trigger $TriggerName
}

if ($LASTEXITCODE -ne 0) {
  throw 'Production trigger audit failed. No GCP resources were modified.'
}

Write-Host "Read-only trigger audit complete for repository $repoRoot. No GCP resources were modified."
