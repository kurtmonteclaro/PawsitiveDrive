@echo off
echo Checking if backend is running on port 8080...
echo.
netstat -ano | findstr :8080
echo.
if %ERRORLEVEL% EQU 0 (
    echo Backend is RUNNING on port 8080!
) else (
    echo Backend is NOT running. Please start it using START_BACKEND.bat
)
echo.
pause


