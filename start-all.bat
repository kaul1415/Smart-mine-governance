@echo off
title CoalGov - Start All Services (Offline AI & App)
color 0A

echo =====================================================================
echo           COALGOV - SMART MINE GOVERNANCE PLATFORM
echo               (Offline Local LLM + RAG + Copilot)
echo =====================================================================
echo.

set ROOT_DIR=%~dp0
cd /d "%ROOT_DIR%"

:: 1. Check / Start Ollama
echo [1/4] Checking Ollama service (Local LLM)...
curl -s http://127.0.0.1:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo     Ollama is not running. Starting Ollama in background...
    start "Ollama Server" /min ollama serve
    timeout /t 3 /nobreak >nul
) else (
    echo     Ollama is running and ready.
)

:: 2. Start ML FastAPI Service (Port 8001)
echo [2/4] Starting ML FastAPI Service on port 8001...
start "CoalGov ML Service (Port 8001)" cmd /k "cd /d \"%ROOT_DIR%ML\" && set HF_HUB_OFFLINE=1 && call venv\Scripts\activate.bat && python -m uvicorn main:app --host 0.0.0.0 --port 8001"

:: Wait for ML Service to be ready
timeout /t 2 /nobreak >nul

:: 3. Start Node.js Backend (Port 5000)
echo [3/4] Starting Node.js Backend on port 5000...
start "CoalGov Backend (Port 5000)" cmd /k "cd /d \"%ROOT_DIR%Backend\" && node src/index.js"

:: Wait for Backend
timeout /t 2 /nobreak >nul

:: 4. Start React Vite Frontend (Port 5173)
echo [4/4] Starting React Frontend on port 5173...
start "CoalGov Frontend (Port 5173)" cmd /k "cd /d \"%ROOT_DIR%Frontend\" && npm run dev"

:: Wait for Frontend to initialize then open browser
timeout /t 4 /nobreak >nul

echo.
echo =====================================================================
echo  All services started successfully!
echo.
echo  - Frontend:   http://localhost:5173
echo  - AI Copilot: http://localhost:5173/copilot
echo  - Backend:    http://localhost:5000
echo  - ML Service: http://localhost:8001 (Docs: http://localhost:8001/docs)
echo  - Ollama:     http://localhost:11434 (gemma3:1b, nomic-embed-text)
echo.
echo  Opening browser to AI Copilot...
echo  (To stop all services, run stop-all.bat)
echo =====================================================================

start http://localhost:5173/copilot
exit /b 0
