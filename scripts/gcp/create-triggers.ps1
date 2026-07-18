param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectId,

  [string]$TriggerLocation = 'global',

  [string]$TriggerName = 'deploy-prod',

  [string]$TriggerId = ''
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# Kept under the historical filename for compatibility. This command is intentionally read-only.
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\')).Path
$auditScript = Join-Path $PSScriptRoot 'audit_trigger.py'
$python = Get-Command py -ErrorAction SilentlyContinue

$auditArguments = @($auditScript, '--project', $ProjectId, '--trigger-location', $TriggerLocation)
if ([string]::IsNullOrWhiteSpace($TriggerId)) {
  $auditArguments += @('--trigger-name', $TriggerName)
} else {
  $auditArguments += @('--trigger-id', $TriggerId)
}

if ($python) {
  & py -3.12 @auditArguments
} else {
  & python @auditArguments
}

if ($LASTEXITCODE -ne 0) {
  throw 'Production trigger audit failed. No GCP resources were modified.'
}

Write-Host "Read-only trigger audit complete for repository $repoRoot. No GCP resources were modified."
