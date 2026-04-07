@echo off
echo ========================================
echo Bus Pass Management System - Setup
echo ========================================
echo.

echo [1/4] Installing Backend Dependencies...
cd backend
npm install
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Installing Frontend Dependencies...
cd ..\frontend
npm install
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo [3/4] Initializing Database...
cd ..\backend
npm run init-db
if %ERRORLEVEL% NEQ 0 (
    echo Warning: Database initialization failed. Make sure MongoDB is running.
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application:
echo.
echo Terminal 1 - Start Backend:
echo   cd backend
echo   npm start
echo.
echo Terminal 2 - Start Frontend:
echo   cd frontend
echo   npm start
echo.
echo Open browser: http://localhost:3001
echo.
echo Admin Login:
echo   Email: admin@buspass.com
echo   Password: admin123
echo.
pause
