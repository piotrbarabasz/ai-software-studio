param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectId,

  [string]$Region = 'europe-central2',

  [Parameter(Mandatory = $true)]
  [string]$RepoName,

  [string]$RepoOwner = '',

  [string]$Branch = 'main',

  [string]$BackendUrl = 'https://aisoftware-studio-api-k6wldgptjq-lm.a.run.app',

  [string]$FrontendUrl = 'https://aisoftware-studio-web-k6wldgptjq-lm.a.run.app',

  [string]$ContactRecipientEmail = 'owner@example.com',

  [string]$ContactFromEmail = 'noreply@example.com',

  [string]$SmtpHost = 'smtp.example.com',

  [string]$SmtpPort = '587',

  [string]$SmtpUsername = 'smtp-user@example.com',

  [string]$SmtpUseTls = 'true',

  [string]$ContactRateLimitPerMinute = '30',

  [string]$SmtpPasswordSecret = 'aisoftware-studio-smtp-password'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Write-Fatal {
  param([string]$Message)
  throw $Message
}

function Normalize-BranchPattern {
  param([string]$Value)
  if ($Value -match '^\^.*\$$') {
    return $Value
  }

  return "^$Value$"
}

function Get-RepoIdentityFromGit {
  param([string]$RepoRoot)

  if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    return $null
  }

  try {
    $remoteUrl = (& git -C $RepoRoot remote get-url origin 2>$null).Trim()
  } catch {
    return $null
  }

  if ([string]::IsNullOrWhiteSpace($remoteUrl)) {
    return $null
  }

  if ($remoteUrl -match 'github\.com[:/](?<owner>[^/]+)/(?<repo>[^/.]+?)(?:\.git)?$') {
    return [pscustomobject]@{
      Owner = $Matches.owner
      Repo  = $Matches.repo
    }
  }

  return $null
}

function Assert-GCloudRepoConnection {
  param(
    [string]$ProjectId,
    [string]$Region,
    [string]$RepoName
  )

  if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Fatal 'gcloud is not installed or not on PATH.'
  }

  $repoOutput = & gcloud builds repositories list --project $ProjectId --region $Region --format 'value(name)' 2>$null
  if ($LASTEXITCODE -ne 0 -or -not $repoOutput) {
    Write-Fatal "Cloud Build repository connection for '$RepoName' was not found. Connect the GitHub repository in Cloud Console first, then rerun this script."
  }

  if (($repoOutput | Where-Object { $_.Trim() -like "*$RepoName*" }).Count -eq 0) {
    Write-Fatal "Cloud Build repository connection for '$RepoName' was not found. Connect the GitHub repository in Cloud Console first, then rerun this script."
  }
}

function New-Trigger {
  param(
    [string]$Name,
    [string]$BranchPattern,
    [string]$Substitutions
  )

  $args = @(
    'builds', 'triggers', 'create', 'github',
    "--name=$Name",
    "--project=$ProjectId",
    "--region=$Region",
    "--repo-owner=$RepoOwner",
    "--repo-name=$RepoName",
    "--branch-pattern=$BranchPattern",
    '--build-config=infra/gcp/cloudbuild.deploy.yaml',
    '--include-logs-with-status',
    "--substitutions=$Substitutions"
  )

  & gcloud @args
  if ($LASTEXITCODE -ne 0) {
    throw "Creating trigger '$Name' failed."
  }
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\')).Path
Assert-GCloudRepoConnection -ProjectId $ProjectId -Region $Region -RepoName $RepoName

if ([string]::IsNullOrWhiteSpace($RepoOwner)) {
  $repoIdentity = Get-RepoIdentityFromGit -RepoRoot $repoRoot
  if ($null -ne $repoIdentity) {
    $RepoOwner = $repoIdentity.Owner
    if ([string]::IsNullOrWhiteSpace($RepoName)) {
      $RepoName = $repoIdentity.Repo
    }
  }
}

if ([string]::IsNullOrWhiteSpace($RepoOwner)) {
  throw 'Could not determine RepoOwner. Pass -RepoOwner explicitly or run from a GitHub remote.'
}

$substitutions = @(
  "_PROJECT_ID=$ProjectId",
  "_REGION=$Region",
  "_ARTIFACT_REPO=aisoftware-studio",
  "_BACKEND_SERVICE=aisoftware-studio-api",
  "_FRONTEND_SERVICE=aisoftware-studio-web",
  "_BACKEND_IMAGE_NAME=aisoftware-studio-api",
  "_FRONTEND_IMAGE_NAME=aisoftware-studio-web",
  "_BACKEND_URL=$BackendUrl",
  "_FRONTEND_URL=$FrontendUrl",
  "_SMTP_PASSWORD_SECRET=$SmtpPasswordSecret",
  "_CONTACT_RATE_LIMIT_PER_MINUTE=$ContactRateLimitPerMinute",
  "_CONTACT_RECIPIENT_EMAIL=$ContactRecipientEmail",
  "_CONTACT_FROM_EMAIL=$ContactFromEmail",
  "_SMTP_HOST=$SmtpHost",
  "_SMTP_PORT=$SmtpPort",
  "_SMTP_USERNAME=$SmtpUsername",
  "_SMTP_USE_TLS=$SmtpUseTls",
  "_CONTACT_DELIVERY_MODE=email",
  "_APP_ENV=production",
  "_MIN_INSTANCES=0",
  '_IMAGE_TAG=$SHORT_SHA'
) -join ','

$prodBranchPattern = Normalize-BranchPattern -Value $Branch

Write-Host "Creating production trigger deploy-prod for branch $prodBranchPattern"
New-Trigger -Name 'deploy-prod' -BranchPattern $prodBranchPattern -Substitutions $substitutions

Write-Host 'Creating temporary test trigger deploy-test-002-gcp-deployment for branch ^002-gcp-deployment$'
New-Trigger -Name 'deploy-test-002-gcp-deployment' -BranchPattern '^002-gcp-deployment$' -Substitutions $substitutions

Write-Host 'Create the PR validation trigger in Cloud Console: event pull request, base branch ^main$, config infra/gcp/cloudbuild.pr-checks.yaml, no deploy.'
