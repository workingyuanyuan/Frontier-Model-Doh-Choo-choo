param(
  [int]$Port = 4000
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$reviewUrl = "http://localhost:$Port"

function Test-ReviewSite {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Url
  )

  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -Method Get -TimeoutSec 2
    return $response.StatusCode -ge 200 -and $response.StatusCode -lt 400
  } catch {
    return $false
  }
}

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  throw 'pnpm was not found on PATH. Install pnpm or open a terminal with pnpm available, then retry.'
}

Set-Location $repoRoot

# Reuse an already-running review server instead of starting a second one.
if (Test-ReviewSite -Url $reviewUrl) {
  Write-Host "LLM Bench is already running at $reviewUrl"
  Start-Process $reviewUrl
  exit 0
}

$env:PORT = $Port.ToString()

$serverCommand = '& pnpm --filter @llm-bench/bench dev'
Start-Process `
  -FilePath 'powershell.exe' `
  -ArgumentList @(
    '-NoLogo'
    '-NoProfile'
    '-ExecutionPolicy'
    'Bypass'
    '-NoExit'
    '-Command'
    $serverCommand
  ) `
  -WorkingDirectory $repoRoot | Out-Null

Write-Host "Starting LLM Bench on $reviewUrl ..."

$maxAttempts = 60
for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
  Start-Sleep -Seconds 1

  if (Test-ReviewSite -Url $reviewUrl) {
    Write-Host "LLM Bench is ready at $reviewUrl"
    Start-Process $reviewUrl
    exit 0
  }
}

throw "LLM Bench did not become available at $reviewUrl within $maxAttempts seconds. Check the dev server window for details."
