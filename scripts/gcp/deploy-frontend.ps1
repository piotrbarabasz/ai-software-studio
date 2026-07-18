param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectId,

  [string]$Region = 'europe-central2',

  [Parameter(Mandatory = $true)]
  [string]$ArtifactRepo,

  [string]$ServiceName = 'aisoftware-studio-web',

  [Parameter(Mandatory = $true)]
  [string]$ApiUrl,

  [Parameter(Mandatory = $true)]
  [string]$PublicSiteUrl,

  [bool]$EnableIndexing = $false,

  [string]$PublicSalesEmail = 'kontakt@protolume.pl',

  [string]$PublicPrivacyEmail = 'kontakt@protolume.pl',

  [string]$PublicLegalConfigSecret = 'aisoftware-studio-public-legal-config',

  [string]$ImageTag = ''
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\')).Path
$configPath = Join-Path $repoRoot 'infra/gcp/cloudbuild.frontend.yaml'
$workingTree = (& git -C $repoRoot status --porcelain)
if ($LASTEXITCODE -ne 0) {
  throw 'Git status failed; component image source cannot be verified.'
}
if ($workingTree) {
  throw 'Commit or stash all changes before tagging and submitting a component image.'
}
$headCommit = (& git -C $repoRoot rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or $headCommit -notmatch '^[0-9a-f]{40,64}$') {
  throw 'Git did not resolve the source commit.'
}

if ([string]::IsNullOrWhiteSpace($ImageTag)) {
  if (Get-Command git -ErrorAction SilentlyContinue) {
    try {
      $resolvedTag = (& git -C $repoRoot rev-parse --short=12 HEAD 2>$null).Trim()
      if (-not [string]::IsNullOrWhiteSpace($resolvedTag)) {
        $ImageTag = $resolvedTag
      }
    } catch {
      $ImageTag = ''
    }
  }

  if ([string]::IsNullOrWhiteSpace($ImageTag)) {
    throw 'A commit-derived ImageTag is required; git could not resolve HEAD and manual-local is forbidden.'
  }
}
if ($ImageTag -notmatch '^[0-9a-f]{7,64}$' -or -not $headCommit.StartsWith($ImageTag)) {
  throw 'ImageTag must be a lowercase hexadecimal prefix of the submitted HEAD commit.'
}

$substitutions = @(
  "_PROJECT_ID=$ProjectId",
  "_REGION=$Region",
  "_ARTIFACT_REPO=$ArtifactRepo",
  "_SERVICE_NAME=$ServiceName",
  "_IMAGE_NAME=aisoftware-studio-web",
  "_MIN_INSTANCES=0",
  "_API_URL=$ApiUrl",
  "_PUBLIC_SITE_URL=$PublicSiteUrl",
  "_PUBLIC_SITE_INDEXING=$($EnableIndexing.ToString().ToLowerInvariant())",
  "_PUBLIC_SALES_EMAIL=$PublicSalesEmail",
  "_PUBLIC_PRIVACY_EMAIL=$PublicPrivacyEmail",
  "_PUBLIC_LEGAL_CONFIG_SECRET=$PublicLegalConfigSecret",
  "_IMAGE_TAG=$ImageTag"
) -join ','

Write-Warning 'This compatibility script only builds and publishes a frontend image. It never deploys Cloud Run.'
Write-Host "Submitting frontend component image pipeline for $ServiceName in $Region."
& gcloud builds submit $repoRoot --project $ProjectId --config $configPath --substitutions $substitutions
if ($LASTEXITCODE -ne 0) {
  throw 'Frontend component image submission failed.'
}

Write-Host 'Frontend component image pipeline submitted; no service deployment was requested.'
