@echo off
title Pawsitive Drive Backend Server
color 0A
echo ========================================
echo   Pawsitive Drive Backend Server
echo ========================================
echo.

REM Change to the backend directory
cd /d "%~dp0backend\backend"

REM Check if we're in the right directory
if not exist ".\mvnw.cmd" (
    echo [ERROR] mvnw.cmd not found!
    echo.
    echo Current directory: %CD%
    echo Expected location: backend\backend\mvnw.cmd
    echo.
    echo Please make sure you're running this from the project root.
    pause
    exit /b 1
)

echo [OK] Found mvnw.cmd
echo Current directory: %CD%
echo.

REM Check Java
echo Checking Java...
java -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java is not installed or not in PATH!
    pause
    exit /b 1
)
echo [OK] Java is installed
echo.

REM Check MySQL
echo Checking MySQL connection...
netstat -ano | findstr :3306 >nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] MySQL might not be running on port 3306
    echo           Make sure MySQL is started in XAMPP!
    echo.
) else (
    echo [OK] MySQL is running on port 3306
    echo.
)

echo ========================================
echo Starting Spring Boot Application...
echo ========================================
echo.
echo This will take 30-60 seconds to compile and start.
echo Please wait for "Started BackendApplication" message.
echo.
echo DO NOT CLOSE THIS WINDOW while using the app!
echo.
echo ========================================
echo.

REM Run Maven
call .\mvnw.cmd spring-boot:run

REM If we get here, the backend stopped
echo.
echo ========================================
echo Backend has stopped.
echo ========================================
pause

