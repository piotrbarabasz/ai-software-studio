param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectId,

  [Parameter(Mandatory = $true)]
  [string]$ContactRecipientEmail,

  [Parameter(Mandatory = $true)]
  [string]$ContactFromEmail,

  [Parameter(Mandatory = $true)]
  [string]$SmtpHost,

  [Parameter(Mandatory = $true)]
  [string]$SmtpPort,

  [Parameter(Mandatory = $true)]
  [string]$SmtpUsername,

  [Parameter(Mandatory = $true)]
  [ValidateSet('true', 'false')]
  [string]$SmtpUseTls
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$configPath = Join-Path $repoRoot 'infra\gcp\cloudbuild.deploy.yaml'
$values = @(
  $ProjectId,
  $ContactRecipientEmail,
  $ContactFromEmail,
  $SmtpHost,
  $SmtpPort,
  $SmtpUsername,
  $SmtpUseTls
)
foreach ($value in $values) {
  if ([string]::IsNullOrWhiteSpace($value)) {
    throw 'Every production argument must contain a resolved value.'
  }
  if ($value.Contains(',')) {
    throw 'Production substitution values must not contain commas.'
  }
}

$workingTree = (& git -C $repoRoot status --porcelain)
if ($LASTEXITCODE -ne 0) {
  throw 'Git status failed; production source cannot be verified.'
}
if ($workingTree) {
  throw 'Commit or stash all changes before tagging and submitting production source.'
}

$imageTag = (& git -C $repoRoot rev-parse --short=12 HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or $imageTag -notmatch '^[0-9a-f]{7,64}$') {
  throw 'Git did not resolve a valid lowercase hexadecimal commit tag.'
}

$substitutions = @(
  "SHORT_SHA=$imageTag",
  "_CONTACT_RECIPIENT_EMAIL=$ContactRecipientEmail",
  "_CONTACT_FROM_EMAIL=$ContactFromEmail",
  "_SMTP_HOST=$SmtpHost",
  "_SMTP_PORT=$SmtpPort",
  "_SMTP_USERNAME=$SmtpUsername",
  "_SMTP_USE_TLS=$SmtpUseTls"
) -join ','

Write-Host "Submitting the combined production pipeline for commit $imageTag."
& gcloud builds submit $repoRoot `
  --project $ProjectId `
  --config $configPath `
  --substitutions $substitutions
if ($LASTEXITCODE -ne 0) {
  throw 'Combined production pipeline submission failed.'
}

