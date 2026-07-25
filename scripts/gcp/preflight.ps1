param(
  [string]$BackendPath = $null,
  [string]$FrontendPath = $null,

  [Parameter(Mandatory = $true)]
  [string]$PublicLegalConfigPath,

  [Parameter(Mandatory = $true)]
  [string]$ApiUrl,

  [Parameter(Mandatory = $true)]
  [string]$PublicSiteUrl,

  [string]$EnableIndexing = $null,
  [string]$BuildSha = $null,
  [string]$PublicSalesEmail = 'kontakt@protolume.pl',

  [string]$PublicPrivacyEmail = 'kontakt@protolume.pl'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if ([string]::IsNullOrWhiteSpace($BackendPath)) {
  $BackendPath = Join-Path $PSScriptRoot '..\..\backend'
}
if ([string]::IsNullOrWhiteSpace($FrontendPath)) {
  $FrontendPath = Join-Path $PSScriptRoot '..\..\frontend'
}

function Get-RepositoryRoot {
  $root = (& git -C $PSScriptRoot rev-parse --show-toplevel 2>$null).Trim()
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($root)) {
    throw 'Repository root could not be resolved with git rev-parse --show-toplevel.'
  }
  return $root
}

function Get-HeadBuildSha {
  param([string]$RepositoryRoot)

  $headSha = (& git -C $RepositoryRoot rev-parse HEAD 2>$null).Trim()
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($headSha)) {
    throw 'Git HEAD SHA could not be resolved.'
  }
  if ($headSha -notmatch '^[0-9a-f]{7,64}$' -or $headSha -in @('unknown', 'local', 'test')) {
    throw "Git HEAD SHA $headSha is not a valid lowercase hexadecimal build SHA."
  }
  return $headSha
}

function Assert-BuildSha {
  param(
    [string]$Value,
    [string]$RepositoryHead
  )

  $candidate = $Value.Trim()
  if ($candidate -notmatch '^[0-9a-f]{7,64}$' -or $candidate -in @('unknown', 'local', 'test')) {
    throw "BuildSha must be a 7-64 character lowercase hexadecimal SHA and not a placeholder."
  }
  if ($candidate -ne $RepositoryHead) {
    throw "BuildSha must match the current git HEAD $RepositoryHead."
  }
  return $candidate
}

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

$repoRoot = Get-RepositoryRoot
$backendRoot = (Resolve-Path -LiteralPath $BackendPath).Path
$frontendRoot = (Resolve-Path -LiteralPath $FrontendPath).Path
$contractPath = (Resolve-Path -LiteralPath (Join-Path $repoRoot 'infra/gcp/production-contract.json')).Path
$legalConfigPath = (Resolve-Path -LiteralPath $PublicLegalConfigPath).Path
$contract = Get-Content -LiteralPath $contractPath -Raw | ConvertFrom-Json
$expectedPublicSiteUrl = [string]$contract.invariants.PUBLIC_SITE_URL
$expectedPublicSiteIndexing = [string]$contract.invariants.PUBLIC_SITE_INDEXING
$headBuildSha = Get-HeadBuildSha -RepositoryRoot $repoRoot

if ([string]::IsNullOrWhiteSpace($BuildSha)) {
  $BuildSha = $headBuildSha
} else {
  $BuildSha = Assert-BuildSha -Value $BuildSha -RepositoryHead $headBuildSha
}

if ($PublicSiteUrl.TrimEnd('/') -ne $expectedPublicSiteUrl) {
  throw "PublicSiteUrl must match the production contract origin $expectedPublicSiteUrl."
}

if ([string]::IsNullOrWhiteSpace($EnableIndexing)) {
  $EnableIndexing = $expectedPublicSiteIndexing
} elseif ($EnableIndexing.Trim().ToLowerInvariant() -notin @('true', 'false')) {
  throw "EnableIndexing must be true or false."
} elseif ($EnableIndexing.Trim().ToLowerInvariant() -ne $expectedPublicSiteIndexing) {
  throw "EnableIndexing must match production-contract.json for $expectedPublicSiteUrl."
}

Invoke-Checked -Label 'Deployment contract CLI tests' -ScriptBlock {
  Push-Location $repoRoot
  try {
    & py -3.12 -m unittest discover -s infra/gcp/tests -p 'test_deployment*.py'
  } finally {
    Pop-Location
  }
}

Invoke-Checked -Label 'Cloud Build YAML validation' -ScriptBlock {
  Push-Location $repoRoot
  try {
    & py -3.12 -m unittest discover -s infra/gcp/tests -p 'test_cloudbuild_yaml.py'
  } finally {
    Pop-Location
  }
}

Invoke-Checked -Label 'Backend: ruff check, ruff format --check, pytest' -ScriptBlock {
  Push-Location $backendRoot
  try {
    & python -m ruff check .
    if ($LASTEXITCODE -ne 0) { throw 'backend ruff check failed' }

    & python -m ruff format --check .
    if ($LASTEXITCODE -ne 0) { throw 'backend ruff format --check failed' }

    & python -m pytest
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

    & npm run format:check
    if ($LASTEXITCODE -ne 0) { throw 'frontend npm run format:check failed' }

    & npm run lint
    if ($LASTEXITCODE -ne 0) { throw 'frontend npm run lint failed' }

    & npm test
    if ($LASTEXITCODE -ne 0) { throw 'frontend npm test failed' }

    $previousLegalConfigPath = $env:PUBLIC_LEGAL_CONFIG_PATH
    $previousApiUrl = $env:API_URL
    $previousPublicSiteUrl = $env:PUBLIC_SITE_URL
    $previousPublicSiteIndexing = $env:PUBLIC_SITE_INDEXING
    $previousPublicSalesEmail = $env:PUBLIC_SALES_EMAIL
    $previousPublicPrivacyEmail = $env:PUBLIC_PRIVACY_EMAIL
    $previousPublicBuildSha = $env:PUBLIC_BUILD_SHA
    try {
      $env:PUBLIC_LEGAL_CONFIG_PATH = $legalConfigPath
      $env:API_URL = $ApiUrl
      $env:PUBLIC_SITE_URL = $PublicSiteUrl
      $env:PUBLIC_SITE_INDEXING = $EnableIndexing.Trim().ToLowerInvariant()
      $env:PUBLIC_SALES_EMAIL = $PublicSalesEmail
      $env:PUBLIC_PRIVACY_EMAIL = $PublicPrivacyEmail
      $env:PUBLIC_BUILD_SHA = $BuildSha
      Invoke-Checked -Label 'Frontend production build' -ScriptBlock {
        & npm run build
        if ($LASTEXITCODE -ne 0) { throw 'frontend npm run build failed' }
      }
      Invoke-Checked -Label 'Frontend validate:site:production' -ScriptBlock {
        & npm run validate:site:production
        if ($LASTEXITCODE -ne 0) { throw 'frontend npm run validate:site:production failed' }
      }
      Invoke-Checked -Label 'Frontend validate:legal:production' -ScriptBlock {
        & npm run validate:legal:production
        if ($LASTEXITCODE -ne 0) { throw 'frontend npm run validate:legal:production failed' }
      }
      Invoke-Checked -Label 'Frontend validate:seo:production' -ScriptBlock {
        & npm run validate:seo:production
        if ($LASTEXITCODE -ne 0) { throw 'frontend npm run validate:seo:production failed' }
      }
      Invoke-Checked -Label 'Frontend validate:csp:production' -ScriptBlock {
        & npm run validate:csp:production
        if ($LASTEXITCODE -ne 0) { throw 'frontend npm run validate:csp:production failed' }
      }
      Invoke-Checked -Label 'Frontend validate:site-artifact:production' -ScriptBlock {
        & npm run validate:site-artifact:production
        if ($LASTEXITCODE -ne 0) { throw 'frontend npm run validate:site-artifact:production failed' }
      }
      Invoke-Checked -Label 'Frontend validate:artifact:production' -ScriptBlock {
        & npm run validate:artifact:production
        if ($LASTEXITCODE -ne 0) { throw 'frontend npm run validate:artifact:production failed' }
      }
    } finally {
      $env:PUBLIC_LEGAL_CONFIG_PATH = $previousLegalConfigPath
      $env:API_URL = $previousApiUrl
      $env:PUBLIC_SITE_URL = $previousPublicSiteUrl
      $env:PUBLIC_SITE_INDEXING = $previousPublicSiteIndexing
      $env:PUBLIC_SALES_EMAIL = $previousPublicSalesEmail
      $env:PUBLIC_PRIVACY_EMAIL = $previousPublicPrivacyEmail
      $env:PUBLIC_BUILD_SHA = $previousPublicBuildSha
    }
  } finally {
    Pop-Location
  }
}

Write-Host "Preflight complete for build SHA $BuildSha."
