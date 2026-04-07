@echo off
echo Starting Bus Pass Management System...
echo.

echo Starting Backend on port 5001...
start "Backend Server" cmd /k "cd /d "%~dp0backend" && set PORT=5001 && npm start"

timeout /t 3 /nobreak > nul

echo Starting Frontend on port 3001...
start "Frontend Server" cmd /k "cd /d "%~dp0frontend" && set PORT=3001 && npm start"

echo.
echo 