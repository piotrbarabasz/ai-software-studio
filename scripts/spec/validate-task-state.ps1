param(
  [string]$TasksPath = (Join-Path $PSScriptRoot '..\..\specs\006-service-model-ux-repositioning\tasks.md'),
  [string]$QuickstartPath = (Join-Path $PSScriptRoot '..\..\specs\006-service-model-ux-repositioning\quickstart.md'),
  [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Fail {
  param([string]$Message)
  Write-Error $Message
  exit 1
}

function Get-TaskStateMap {
  param([string[]]$Lines)

  $tasks = @{}
  foreach ($line in $Lines) {
    if ($line -match '^- \[(?<state>[ Xx])\] (?<id>T\d{3})\b') {
      $tasks[$Matches.id] = [pscustomobject]@{
        Id    = $Matches.id
        State = if ($Matches.state.ToUpperInvariant() -eq 'X') { 'X' } else { ' ' }
        Line  = $line
      }
    }
  }

  return $tasks
}

function Test-ContainsAllPatterns {
  param(
    [string]$Path,
    [string[]]$Patterns
  )

  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    return $false
  }

  $content = Get-Content -LiteralPath $Path -Raw
  foreach ($pattern in $Patterns) {
    if ($content -notmatch [regex]::Escape($pattern)) {
      return $false
    }
  }

  return $true
}

$taskLines = Get-Content -LiteralPath $TasksPath
$tasks = Get-TaskStateMap -Lines $taskLines

$phaseRanges = @(
  @{ Name = 'Phase 1'; Start = 1; End = 5 },
  @{ Name = 'Phase 2'; Start = 6; End = 14 },
  @{ Name = 'Phase 3'; Start = 15; End = 24 },
  @{ Name = 'Phase 4'; Start = 25; End = 33 },
  @{ Name = 'Phase 5'; Start = 34; End = 41 },
  @{ Name = 'Phase 6'; Start = 42; End = 51 },
  @{ Name = 'Phase 7'; Start = 52; End = 60 },
  @{ Name = 'Phase 8'; Start = 61; End = 68 }
)

$violations = New-Object System.Collections.Generic.List[string]

foreach ($phase in $phaseRanges) {
  $phaseTaskIds = $phase.Start..$phase.End | ForEach-Object { 'T{0:000}' -f $_ }
  $laterPhaseIds = @()
  foreach ($laterPhase in $phaseRanges) {
    if ($laterPhase.Start -gt $phase.End) {
      $laterPhaseIds += ($laterPhase.Start..$laterPhase.End | ForEach-Object { 'T{0:000}' -f $_ })
    }
  }

  $hasOpenTask = $phaseTaskIds | Where-Object { $tasks.ContainsKey($_) -and $tasks[$_].State -ne 'X' }
  if ($hasOpenTask) {
    $closedLaterTasks = $laterPhaseIds | Where-Object { $tasks.ContainsKey($_) -and $tasks[$_].State -eq 'X' }
    if ($closedLaterTasks) {
      $violations.Add((
          '{0} has open tasks ({1}) while later tasks are closed ({2}).' -f
          $phase.Name,
          ($hasOpenTask -join ', '),
          ($closedLaterTasks -join ', ')
        ))
    }
  }
}

$evidenceChecks = @{
  T028 = @{ Path = (Join-Path $RepoRoot 'frontend/src/app/core/content/site.pl.ts'); Patterns = @('Zbuduj produkt', 'frontend, backend i API', 'AI, integracje, testy i monitoring') }
  T029 = @{ Path = (Join-Path $RepoRoot 'frontend/src/app/features/home/home.component.html'); Patterns = @('/kontakt', 'custom_web_app') }
  T030 = @{ Path = (Join-Path $RepoRoot 'frontend/src/app/core/content/site.pl.ts'); Patterns = @('AISoftware Studio - Validate i Build dla AI', 'Studio, proces i R&D') }
  T031 = @{ Path = (Join-Path $RepoRoot 'frontend/src/app/features/shell/site-shell.component.ts'); Patterns = @('primaryCtaLabel', 'Om') }
  T032 = @{ Path = (Join-Path $RepoRoot 'frontend/src/app/features/home/home.component.html'); Patterns = @('tracks-title', 'solutions-title') }
  T033 = @{ Path = (Join-Path $RepoRoot 'frontend/src/app/features/home/home.component.scss'); Patterns = @('hero-actions', 'solution-grid') }
  T046 = @{ Path = (Join-Path $RepoRoot 'frontend/src/app/features/products/products-page.component.html'); Patterns = @('Kategorie wed', 'selector-rail') }
  T061 = @{ Path = $QuickstartPath; Patterns = @('npm run lint') }
  T062 = @{ Path = $QuickstartPath; Patterns = @('npm test -- --watch=false') }
  T063 = @{ Path = $QuickstartPath; Patterns = @('npm run build') }
  T064 = @{ Path = $QuickstartPath; Patterns = @('Manual review covered') }
  T065 = @{ Path = $QuickstartPath; Patterns = @('Manual keyboard review') }
  T068 = @{ Path = $QuickstartPath; Patterns = @('Implementation Notes', 'No backend changes') }
}

foreach ($taskId in $evidenceChecks.Keys) {
  if (-not $tasks.ContainsKey($taskId) -or $tasks[$taskId].State -ne 'X') {
    continue
  }

  $check = $evidenceChecks[$taskId]
  if (-not (Test-ContainsAllPatterns -Path $check.Path -Patterns $check.Patterns)) {
    $violations.Add("Task $taskId is marked complete but required evidence is missing from $($check.Path).")
  }
}

if ($violations.Count -gt 0) {
  Write-Host 'Task state validation failed.'
  $violations | ForEach-Object { Write-Host "- $_" }
  exit 1
}

Write-Host 'Task state validation passed.'
