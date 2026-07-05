$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$pytest = Join-Path $root '.venv\Scripts\pytest.exe'

Push-Location $root
try {
    if (Test-Path -LiteralPath $pytest) {
        & $pytest
    } else {
        pytest
    }
} finally {
    Pop-Location
}
