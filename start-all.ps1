# CoalGov - Unified Offline App & AI Launcher
# Supports:
# 1. Local Device Mode (Default): Runs Ollama, ML service, Backend, and Frontend locally.
# 2. Offline Server Mode: Points ML_SERVICE_URL or OLLAMA_BASE_URL to an offline LAN server.

param(
    [string]$OfflineServer = "127.0.0.1",
    [switch]$NoBrowser
)

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "          COALGOV - SMART MINE GOVERNANCE PLATFORM" -ForegroundColor White
Write-Host "            (Offline AI Copilot + Local RAG System)" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Test-ListeningPort([int]$Port) {
    return [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Start-ServiceWindow([string]$Title, [string]$Command) {
    Start-Process powershell -ArgumentList '-NoExit', '-Command', $Command -WindowStyle Normal
    Write-Host "      ✓ $Title started in a separate window" -ForegroundColor Green
}

# 1. Check Ollama
Write-Host "[1/4] Checking Ollama Service (gemma3:1b)..." -ForegroundColor Cyan
try {
    $ollamaCheck = Invoke-RestMethod -Uri "http://${OfflineServer}:11434/api/tags" -Method Get -TimeoutSec 2 -ErrorAction Stop
    Write-Host "      ✓ Ollama is online. Models available: $(($ollamaCheck.models | ForEach-Object { $_.name }) -join ', ')" -ForegroundColor Green
} catch {
    if ($OfflineServer -eq "127.0.0.1" -or $OfflineServer -eq "localhost") {
        Write-Host "      ⚠ Local Ollama not responding. Attempting to start ollama serve..." -ForegroundColor Yellow
        Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden
    } else {
        Write-Host "      ❌ Could not connect to offline Ollama server at http://${OfflineServer}:11434" -ForegroundColor Red
    }
}

# 2. Start ML FastAPI Service
Write-Host "[2/4] Starting ML FastAPI Service (Port 8001)..." -ForegroundColor Cyan
$mlVenvPython = Join-Path $rootDir "ML\venv\Scripts\python.exe"
if (Test-ListeningPort 8001) {
    Write-Host "      ✓ ML Service already running (http://localhost:8001)" -ForegroundColor Green
} elseif (Test-Path $mlVenvPython) {
    Start-ServiceWindow 'ML Service (http://localhost:8001)' "`$env:HF_HUB_OFFLINE='1'; Set-Location '$rootDir\ML'; & '$mlVenvPython' -m uvicorn main:app --host 0.0.0.0 --port 8001"
} else {
    Write-Host "      ❌ ML virtualenv not found at ML\venv. Run: python -m venv ML\venv && pip install -r ML\requirements.txt" -ForegroundColor Red
}

# 3. Start Node.js Backend
Write-Host "[3/4] Starting Backend Service (Port 5000)..." -ForegroundColor Cyan
if (Test-ListeningPort 5000) {
    Write-Host "      ✓ Backend already running (http://localhost:5000)" -ForegroundColor Green
} else {
    Start-ServiceWindow 'Backend (http://localhost:5000)' "Set-Location '$rootDir\Backend'; node src/index.js"
}

# 4. Start React Frontend
Write-Host "[4/4] Starting React Frontend (Port 5173)..." -ForegroundColor Cyan
if (Test-ListeningPort 5173) {
    Write-Host "      ✓ Frontend already running (http://localhost:5173)" -ForegroundColor Green
} else {
    Start-ServiceWindow 'Frontend (http://localhost:5173)' "Set-Location '$rootDir\Frontend'; node node_modules\vite\bin\vite.js"
}

Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Green
Write-Host " All services are running!" -ForegroundColor White
Write-Host " - Frontend UI:    http://localhost:5173" -ForegroundColor Cyan
Write-Host " - AI Copilot:     http://localhost:5173/copilot" -ForegroundColor Yellow
Write-Host " - Backend API:    http://localhost:5000" -ForegroundColor Cyan
Write-Host " - ML & RAG API:   http://localhost:8001/docs" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Green

if (-not $NoBrowser) {
    Start-Process "http://localhost:5173/field"
}
