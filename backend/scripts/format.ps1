param(
    [switch]$Check
)

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$ruff = Join-Path $root '.venv\Scripts\ruff.exe'

Push-Location $root
try {
    if (Test-Path -LiteralPath $ruff) {
        if ($Check) {
            & $ruff format --check .
        } else {
            & $ruff format .
        }
    } else {
        if ($Check) {
            ruff format --check .
        } else {
            ruff format .
        }
    }
} finally {
    Pop-Location
}
