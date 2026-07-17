param(
  [string]$BaseUrl = 'http://127.0.0.1:8080'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Invoke-CurlHeaders {
  param(
    [Parameter(Mandatory = $true)][string]$Url,
    [string[]]$Headers = @()
  )

  $arguments = @('--silent', '--show-error', '--dump-header', '-', '--output', [System.IO.Path]::GetTempFileName())
  foreach ($header in $Headers) {
    $arguments += @('--header', $header)
  }
  $arguments += $Url

  $outputPath = $arguments[5]
  try {
    return (& curl.exe @arguments) -join "`n"
  } finally {
    Remove-Item -LiteralPath $outputPath -Force -ErrorAction SilentlyContinue
  }
}

function Assert-Matches {
  param(
    [Parameter(Mandatory = $true)][string]$Value,
    [Parameter(Mandatory = $true)][string]$Pattern,
    [Parameter(Mandatory = $true)][string]$Message
  )

  if ($Value -notmatch $Pattern) {
    throw "$Message`n$Value"
  }
}

$htmlPath = [System.IO.Path]::GetTempFileName()
try {
  & curl.exe --silent --show-error --output $htmlPath "$BaseUrl/"
  if ($LASTEXITCODE -ne 0) {
    throw 'curl could not fetch the home page.'
  }
  $html = Get-Content -Raw -LiteralPath $htmlPath
  $mainMatch = [regex]::Match($html, 'src="(?<path>main-[A-Z0-9]+\.js)"', 'IgnoreCase')
  if (-not $mainMatch.Success) {
    throw 'The hashed main-*.js file was not found in HTML.'
  }

  $htmlHeaders = Invoke-CurlHeaders -Url "$BaseUrl/" -Headers @('Accept-Encoding: gzip')
  Assert-Matches $htmlHeaders '(?im)^HTTP/\S+ 200\b' 'The home page did not return HTTP 200.'
  Assert-Matches $htmlHeaders '(?im)^Content-Encoding:\s*gzip\s*$' 'HTML was not compressed with gzip.'
  Assert-Matches $htmlHeaders '(?im)^Cache-Control:\s*no-cache, max-age=0, must-revalidate\s*$' 'HTML has an invalid cache policy.'
  Assert-Matches $htmlHeaders '(?im)^Content-Security-Policy-Report-Only:' 'CSP Report-Only is missing.'

  $assetHeaders = Invoke-CurlHeaders -Url "$BaseUrl/$($mainMatch.Groups['path'].Value)" -Headers @('Accept-Encoding: gzip')
  Assert-Matches $assetHeaders '(?im)^Content-Encoding:\s*gzip\s*$' 'JavaScript was not compressed with gzip.'
  Assert-Matches $assetHeaders '(?im)^Cache-Control:\s*public, max-age=31536000, immutable\s*$' 'Hashed JavaScript does not have immutable cache.'

  $hstsHeaders = Invoke-CurlHeaders -Url "$BaseUrl/" -Headers @('X-Forwarded-Proto: https')
  Assert-Matches $hstsHeaders '(?im)^Strict-Transport-Security:\s*max-age=31536000\s*$' 'HSTS is missing for HTTPS traffic.'

  $notFoundHeaders = Invoke-CurlHeaders -Url "$BaseUrl/definitely-missing"
  Assert-Matches $notFoundHeaders '(?im)^HTTP/\S+ 404\b' 'An unknown route did not return a real HTTP 404.'
  Assert-Matches $notFoundHeaders '(?im)^Cache-Control:\s*no-store' 'The 404 response does not have no-store.'
  Assert-Matches $notFoundHeaders '(?im)^X-Robots-Tag:\s*noindex, follow\s*$' 'The 404 response does not have noindex.'

  $redirectHeaders = Invoke-CurlHeaders -Url "$BaseUrl/demo-w-7-dni"
  Assert-Matches $redirectHeaders '(?im)^HTTP/\S+ 301\b' 'The legacy route did not return HTTP 301.'
  Assert-Matches $redirectHeaders '(?im)^Location:\s*/demo-ai\s*$' 'The legacy redirect is not origin-independent.'

  Write-Host 'Headers, gzip, cache, HSTS and the 404 status are correct.'
} finally {
  Remove-Item -LiteralPath $htmlPath -Force -ErrorAction SilentlyContinue
}
