@echo off
echo ================================
echo Your Computer's IP Addresses:
echo ================================
echo.
ipconfig | findstr /i "IPv4"
echo.
echo ================================
echo Current Backend Configuration:
echo ================================
echo Mobile App connects to: http://10.226.167.131:5000/api/
echo.
echo Make sure your phone is on the same Wi-Fi network!
echo.
pause
