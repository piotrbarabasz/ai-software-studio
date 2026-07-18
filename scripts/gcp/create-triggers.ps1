param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectId,

  [string]$TriggerLocation = 'global',

  [ValidateSet('production', 'pull-request')]
  [string]$TriggerKind = 'production',

  [string]$TriggerName = '',

  [string]$TriggerId = ''
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# Kept under the historical filename for compatibility. This command is intentionally read-only.
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\')).Path
$auditScript = Join-Path $PSScriptRoot 'audit_trigger.py'
$python = Get-Command py -ErrorAction SilentlyContinue

$auditArguments = @(
  $auditScript,
  '--project',
  $ProjectId,
  '--trigger-location',
  $TriggerLocation,
  '--trigger-kind',
  $TriggerKind
)
if (-not [string]::IsNullOrWhiteSpace($TriggerId)) {
  $auditArguments += @('--trigger-id', $TriggerId)
} elseif (-not [string]::IsNullOrWhiteSpace($TriggerName)) {
  $auditArguments += @('--trigger-name', $TriggerName)
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
