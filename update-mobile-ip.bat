@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Update Mobile App Backend IP Address
echo ========================================
echo.
echo Current IP in mobile app: 10.226.167.131
echo.
echo Your computer's IP addresses:
ipconfig | findstr /i "IPv4"
echo.

set /p NEW_IP="Enter the correct IP address (e.g., 192.168.1.100): "

if "%NEW_IP%"=="" (
    echo ERROR: No IP address entered!
    pause
    exit /b 1
)

echo.
echo Updating mobile app configuration to: %NEW_IP%
echo.

REM Backup the original file
copy /Y "mobile-app\app\src\main\java\com\buspass\management\utils\ApiClient.java" "mobile-app\app\src\main\java\com\buspass\management\utils\ApiClient.java.backup" >nul

REM Update the IP address using PowerShell
powershell -Command "(Get-Content 'mobile-app\app\src\main\java\com\buspass\management\utils\ApiClient.java') -replace '10\.226\.167\.131', '%NEW_IP%' | Set-Content 'mobile-app\app\src\main\java\com\buspass\management\utils\ApiClient.java'"

echo [OK] IP address updated!
echo.
echo Now rebuilding the mobile app...
echo This may take 1-2 minutes...
echo.

cd mobile-app
call gradlew.bat assembleDebug

if %errorLevel% equ 0 (
    echo.
    echo ========================================
    echo [SUCCESS] App rebuilt successfully!
    echo ========================================
    echo.
    echo New APK location:
    echo mobile-app\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo Install this on your phone and try again!
    echo.
) else (
    echo.
    echo [ERROR] Build failed! Restoring original file...
    copy /Y "mobile-app\app\src\main\java\com\buspass\management\utils\ApiClient.java.backup" "mobile-app\app\src\main\java\com\buspass\management\utils\ApiClient.java" >nul
    echo.
)

pause
