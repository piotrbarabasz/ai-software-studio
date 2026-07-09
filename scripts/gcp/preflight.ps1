param(
  [string]$BackendPath = (Join-Path $PSScriptRoot '..\..\backend'),
  [string]$FrontendPath = (Join-Path $PSScriptRoot '..\..\frontend')
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
    & npm run lint
    if ($LASTEXITCODE -ne 0) { throw 'frontend npm run lint failed' }

    & npm run format:check
    if ($LASTEXITCODE -ne 0) { throw 'frontend npm run format:check failed' }

    & npm test
    if ($LASTEXITCODE -ne 0) { throw 'frontend npm test failed' }

    & npm run build
    if ($LASTEXITCODE -ne 0) { throw 'frontend npm run build failed' }
  } finally {
    Pop-Location
  }
}

Write-Host 'Preflight complete.'
