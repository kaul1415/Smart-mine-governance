@echo off
title CoalGov - Stop All Services
color 0C

echo =====================================================================
echo                COALGOV - STOPPING ALL SERVICES
echo =====================================================================
echo.

echo Stopping Node.js Backend & Vite servers (Port 5000, 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Stopping ML FastAPI Service (Port 8001)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8001" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo All CoalGov services (Frontend, Backend, ML Service) have been stopped.
echo (Ollama service remains available in background).
echo.
pause
exit /b 0
