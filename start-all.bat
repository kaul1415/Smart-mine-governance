@echo off
title CoalGov - Launcher
color 0A

echo =====================================================================
echo           COALGOV - SMART MINE GOVERNANCE PLATFORM
echo               (Offline Local LLM + RAG + Copilot)
echo =====================================================================
echo.

:: Store root path (no trailing slash)
set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"

:: 1. Ollama
echo [1/4] Checking Ollama (Local LLM)...
curl -s http://127.0.0.1:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo       Ollama not running - starting it...
    start "Ollama Server" /min cmd /c "ollama serve"
) else (
    echo       Ollama already running.
)

:: 2. ML Service
echo [2/4] Starting ML Service on port 8001...
netstat -ano | findstr /r /c:":8001 .*LISTENING" >nul
if errorlevel 1 (
    start "CoalGov - ML Service :8001" cmd /k "cd /d ""%ROOT%\ML"" && set HF_HUB_OFFLINE=1 && call venv\Scripts\activate.bat && python -m uvicorn main:app --host 0.0.0.0 --port 8001"
) else (
    echo       ML Service is already running.
)

:: 3. Node.js Backend
echo [3/4] Starting Backend on port 5000...
netstat -ano | findstr /r /c:":5000 .*LISTENING" >nul
if errorlevel 1 (
    start "CoalGov - Backend :5000" cmd /k "cd /d ""%ROOT%\Backend"" && node src\index.js"
) else (
    echo       Backend is already running.
)

:: 4. React Frontend (Vite)
echo [4/4] Starting Frontend on port 5173...
netstat -ano | findstr /r /c:":5173 .*LISTENING" >nul
if errorlevel 1 (
    start "CoalGov - Frontend :5173" cmd /k "cd /d ""%ROOT%\Frontend"" && node node_modules\vite\bin\vite.js"
) else (
    echo       Frontend is already running.
)

echo.
echo =====================================================================
echo  All services launched!
echo.
echo   Frontend  -^>  http://localhost:5173
echo   Copilot   -^>  http://localhost:5173/copilot
echo   Backend   -^>  http://localhost:5000
echo   ML / RAG  -^>  http://localhost:8001/docs
echo   Ollama    -^>  http://localhost:11434
echo.
echo   To stop all services, run:  stop-all.bat
echo =====================================================================
echo.

start "" http://localhost:5173/copilot
exit /b 0
