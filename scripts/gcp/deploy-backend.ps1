param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectId,

  [string]$Region = 'europe-central2',

  [Parameter(Mandatory = $true)]
  [string]$ArtifactRepo,

  [string]$ServiceName = 'aisoftware-studio-api',

  [Parameter(Mandatory = $true)]
  [string]$PublicSiteUrl,

  [string]$AppEnv = 'production',

  [string]$ContactDeliveryMode = 'email',

  [string]$ContactRecipientEmail = 'owner@example.com',

  [string]$ContactFromEmail = 'noreply@example.com',

  [string]$SmtpHost = 'smtp.example.com',

  [string]$SmtpPort = '587',

  [string]$SmtpUsername = 'smtp-user@example.com',

  [string]$SmtpUseTls = 'true',

  [string]$ContactRateLimitPerMinute = '30',

  [Parameter(Mandatory = $true)]
  [string]$SmtpPasswordSecret = 'aisoftware-studio-smtp-password',

  [string]$ImageTag = ''
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\')).Path
$configPath = Join-Path $repoRoot 'infra/gcp/cloudbuild.backend.yaml'

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
  "_IMAGE_NAME=aisoftware-studio-api",
  "_MIN_INSTANCES=0",
  "_APP_ENV=$AppEnv",
  "_CORS_ALLOWED_ORIGINS=$PublicSiteUrl",
  "_CONTACT_DELIVERY_MODE=$ContactDeliveryMode",
  "_CONTACT_RECIPIENT_EMAIL=$ContactRecipientEmail",
  "_CONTACT_FROM_EMAIL=$ContactFromEmail",
  "_SMTP_HOST=$SmtpHost",
  "_SMTP_PORT=$SmtpPort",
  "_SMTP_USERNAME=$SmtpUsername",
  "_SMTP_USE_TLS=$SmtpUseTls",
  "_CONTACT_RATE_LIMIT_PER_MINUTE=$ContactRateLimitPerMinute",
  "_SMTP_PASSWORD_SECRET=$SmtpPasswordSecret",
  "_IMAGE_TAG=$ImageTag"
) -join ','

Write-Host "Submitting backend deployment for $ServiceName in $Region."
& gcloud builds submit $repoRoot --project $ProjectId --config $configPath --substitutions $substitutions
if ($LASTEXITCODE -ne 0) {
  throw 'Backend deployment submission failed.'
}

Write-Host 'Backend deployment submitted.'
