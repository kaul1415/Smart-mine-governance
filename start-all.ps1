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

# 1. Check Ollama
Write-Host "[1/4] Checking Ollama Service (gemma3:1b)..." -ForegroundColor Cyan
try {
    $ollamaCheck = Invoke-RestMethod -Uri "http://${OfflineServer}:11434/api/tags" -Method Get -TimeoutSec 2 -ErrorAction Stop
    Write-Host "      ✓ Ollama is online. Models available: $(($ollamaCheck.models | ForEach-Object { $_.name }) -join ', ')" -ForegroundColor Green
} catch {
    if ($OfflineServer -eq "127.0.0.1" -or $OfflineServer -eq "localhost") {
        Write-Host "      ⚠ Local Ollama not responding. Attempting to start ollama serve..." -ForegroundColor Yellow
        Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden
        Start-Sleep -Seconds 3
    } else {
        Write-Host "      ❌ Could not connect to offline Ollama server at http://${OfflineServer}:11434" -ForegroundColor Red
    }
}

# 2. Start ML FastAPI Service
Write-Host "[2/4] Starting ML FastAPI Service (Port 8001)..." -ForegroundColor Cyan
$mlVenvPython = Join-Path $rootDir "ML\venv\Scripts\python.exe"
if (Test-Path $mlVenvPython) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:HF_HUB_OFFLINE='1'; cd '$rootDir\ML'; & '$mlVenvPython' -m uvicorn main:app --host 0.0.0.0 --port 8001" -WindowStyle Normal
    Write-Host "      ✓ ML Service started in separate window (http://localhost:8001)" -ForegroundColor Green
} else {
    Write-Host "      ❌ ML virtualenv not found at ML\venv. Run: python -m venv ML\venv && pip install -r ML\requirements.txt" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# 3. Start Node.js Backend
Write-Host "[3/4] Starting Backend Service (Port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\Backend'; node src/index.js" -WindowStyle Normal
Write-Host "      ✓ Node.js Backend started (http://localhost:5000)" -ForegroundColor Green

Start-Sleep -Seconds 2

# 4. Start React Frontend
Write-Host "[4/4] Starting React Frontend (Port 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\Frontend'; npm run dev" -WindowStyle Normal
Write-Host "      ✓ React Vite Frontend started (http://localhost:5173)" -ForegroundColor Green

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Green
Write-Host " All services are running!" -ForegroundColor White
Write-Host " - Frontend UI:    http://localhost:5173" -ForegroundColor Cyan
Write-Host " - AI Copilot:     http://localhost:5173/copilot" -ForegroundColor Yellow
Write-Host " - Backend API:    http://localhost:5000" -ForegroundColor Cyan
Write-Host " - ML & RAG API:   http://localhost:8001/docs" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Green

if (-not $NoBrowser) {
    Start-Process "http://localhost:5173/copilot"
}
