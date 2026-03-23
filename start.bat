@echo off
echo Starting Bus Pass Management System...
echo.

echo Starting Backend on port 5000...
start "Backend Server" cmd /k "cd /d "%~dp0backend" && npm start"

timeout /t 3 /nobreak > nul

echo Starting Frontend on port 3000...
start "Frontend Server" cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
