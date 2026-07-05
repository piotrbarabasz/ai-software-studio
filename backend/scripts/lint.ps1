$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$ruff = Join-Path $root '.venv\Scripts\ruff.exe'

Push-Location $root
try {
    if (Test-Path -LiteralPath $ruff) {
        & $ruff check .
    } else {
        ruff check .
    }
} finally {
    Pop-Location
}
