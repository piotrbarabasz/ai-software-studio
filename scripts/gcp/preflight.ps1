param(
  [string]$BackendPath = (Join-Path $PSScriptRoot '..\..\backend'),
  [string]$FrontendPath = (Join-Path $PSScriptRoot '..\..\frontend'),

  [Parameter(Mandatory = $true)]
  [string]$PublicLegalConfigPath,

  [Parameter(Mandatory = $true)]
  [string]$ApiUrl,

  [Parameter(Mandatory = $true)]
  [string]$PublicSiteUrl,

  [bool]$EnableIndexing = $false
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Invoke-Checked {
  param(
    [string]$Label,
    [scriptblock]$ScriptBlock
  )

  Write-Host "==> $Label"
  & $ScriptBlock
  if ($LASTEXITCODE -ne 0) {
    throw "$Label failed with exit code $LASTEXITCODE"
  }
}

$backendRoot = (Resolve-Path -LiteralPath $BackendPath).Path
$frontendRoot = (Resolve-Path -LiteralPath $FrontendPath).Path
$legalConfigPath = (Resolve-Path -LiteralPath $PublicLegalConfigPath).Path

Invoke-Checked -Label 'Deployment contract CLI tests' -ScriptBlock {
  Push-Location (Split-Path $backendRoot -Parent)
  try {
    & py -3.12 -m unittest discover -s infra/gcp/tests -p 'test_deployment*.py'
  } finally {
    Pop-Location
  }
}

Invoke-Checked -Label 'Backend: ruff check, ruff format --check, pytest' -ScriptBlock {
  Push-Location $backendRoot
  try {
    & ruff check .
    if ($LASTEXITCODE -ne 0) { throw 'backend ruff check failed' }

    & ruff format --check .
    if ($LASTEXITCODE -ne 0) { throw 'backend ruff format --check failed' }

    & pytest
    if ($LASTEXITCODE -ne 0) { throw 'backend pytest failed' }
  } finally {
    Pop-Location
  }
}

Invoke-Checked -Label 'Frontend: lint, format check, tests, build' -ScriptBlock {
  Push-Location $frontendRoot
  try {
    & npm ci
    if ($LASTEXITCODE -ne 0) { throw 'frontend npm ci failed' }

    & npm run lint
    if ($LASTEXITCODE -ne 0) { throw 'frontend npm run lint failed' }

    & npm run format:check
    if ($LASTEXITCODE -ne 0) { throw 'frontend npm run format:check failed' }

    & npm test
    if ($LASTEXITCODE -ne 0) { throw 'frontend npm test failed' }

    $previousLegalConfigPath = $env:PUBLIC_LEGAL_CONFIG_PATH
    $previousApiUrl = $env:API_URL
    $previousPublicSiteUrl = $env:PUBLIC_SITE_URL
    $previousPublicSiteIndexing = $env:PUBLIC_SITE_INDEXING
    try {
      $env:PUBLIC_LEGAL_CONFIG_PATH = $legalConfigPath
      $env:API_URL = $ApiUrl
      $env:PUBLIC_SITE_URL = $PublicSiteUrl
      $env:PUBLIC_SITE_INDEXING = $EnableIndexing.ToString().ToLowerInvariant()
      & npm run build
      if ($LASTEXITCODE -ne 0) { throw 'frontend npm run build failed' }
    } finally {
      $env:PUBLIC_LEGAL_CONFIG_PATH = $previousLegalConfigPath
      $env:API_URL = $previousApiUrl
      $env:PUBLIC_SITE_URL = $previousPublicSiteUrl
      $env:PUBLIC_SITE_INDEXING = $previousPublicSiteIndexing
    }
  } finally {
    Pop-Location
  }
}

Write-Host 'Preflight complete.'
