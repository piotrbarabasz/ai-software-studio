param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectId,

  [string]$Region = 'europe-central2',

  [Parameter(Mandatory = $true)]
  [string]$ArtifactRepo,

  [string]$ServiceName = 'aisoftware-studio-web',

  [Parameter(Mandatory = $true)]
  [string]$ApiUrl,

  [string]$ImageTag = ''
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\')).Path
$configPath = Join-Path $repoRoot 'infra/gcp/cloudbuild.frontend.yaml'

if ([string]::IsNullOrWhiteSpace($ImageTag)) {
  if (Get-Command git -ErrorAction SilentlyContinue) {
    try {
      $resolvedTag = (& git -C $repoRoot rev-parse --short HEAD 2>$null).Trim()
      if (-not [string]::IsNullOrWhiteSpace($resolvedTag)) {
        $ImageTag = $resolvedTag
      }
    } catch {
      $ImageTag = ''
    }
  }

  if ([string]::IsNullOrWhiteSpace($ImageTag)) {
    $ImageTag = 'manual-local'
  }
}

$substitutions = @(
  "_PROJECT_ID=$ProjectId",
  "_REGION=$Region",
  "_ARTIFACT_REPO=$ArtifactRepo",
  "_SERVICE_NAME=$ServiceName",
  "_IMAGE_NAME=aisoftware-studio-web",
  "_MIN_INSTANCES=0",
  "_API_URL=$ApiUrl",
  "_IMAGE_TAG=$ImageTag"
) -join ','

Write-Host "Submitting frontend deployment for $ServiceName in $Region."
& gcloud builds submit $repoRoot --project $ProjectId --config $configPath --substitutions $substitutions
if ($LASTEXITCODE -ne 0) {
  throw 'Frontend deployment submission failed.'
}

Write-Host 'Frontend deployment submitted.'
