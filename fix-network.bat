@echo off
echo ========================================
echo Bus Pass App - Network Configuration Fix
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo Right-click this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo Step 1: Adding Windows Firewall Rule...
netsh advfirewall firewall delete rule name="Bus Pass Backend" >nul 2>&1
netsh advfirewall firewall add rule name="Bus Pass Backend" dir=in action=allow protocol=TCP localport=5000
echo [OK] Firewall rule added for port 5000
echo.

echo Step 2: Your Computer's IP Addresses:
echo ----------------------------------------
ipconfig | findstr /i "IPv4"
echo ----------------------------------------
echo.

echo Step 3: Current Mobile App Configuration:
echo Mobile app connects to: http://10.226.167.131:5000/api/
echo.

echo Step 4: What to do next:
echo 1. Look at the IP addresses above
echo 2. Find the one that matches your network (usually 192.168.x.x or 10.x.x.x)
echo 3. If it's NOT 10.226.167.131, you need to update the mobile app!
echo.

echo Step 5: Test if backend is accessible:
echo Try opening this in your phone's browser:
echo http://10.226.167.131:5000/api/routes
echo.
echo If it shows JSON data, the network is working!
echo If it fails, the IP address might be wrong.
echo.

echo [DONE] Firewall configured!
echo.
pause
