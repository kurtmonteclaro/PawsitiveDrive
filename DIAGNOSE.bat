@echo off
echo ========================================
echo Pawsitive Drive - System Diagnostics
echo ========================================
echo.

echo [1] Checking Java installation...
java -version 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Java is not installed or not in PATH!
) else (
    echo ✓ Java is installed
)
echo.

echo [2] Checking MySQL on port 3306...
netstat -ano | findstr :3306 >nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ MySQL is running on port 3306
) else (
    echo ✗ MySQL is NOT running on port 3306
    echo   Please start MySQL in XAMPP!
)
echo.

echo [3] Checking Backend on port 8080...
netstat -ano | findstr :8080 >nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Backend is running on port 8080
    netstat -ano | findstr :8080
) else (
    echo ✗ Backend is NOT running on port 8080
    echo   Please run START_BACKEND.bat to start it
)
echo.

echo [4] Checking if database exists...
cd /d "%~dp0"
cd C:\xampp\mysql\bin 2>nul
if %ERRORLEVEL% EQU 0 (
    .\mysql.exe -u root -e "USE pawsitivedrive_db;" 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo ✓ Database 'pawsitivedrive_db' exists
    ) else (
        echo ✗ Database 'pawsitivedrive_db' does NOT exist
        echo   Run: mysql -u root -e "CREATE DATABASE pawsitivedrive_db;"
    )
) else (
    echo ? Could not check database (MySQL bin not found in default location)
)
echo.

echo [5] Checking if roles exist in database...
cd C:\xampp\mysql\bin 2>nul
if %ERRORLEVEL% EQU 0 (
    .\mysql.exe -u root -e "USE pawsitivedrive_db; SELECT COUNT(*) as role_count FROM roles;" 2>nul | findstr /C:"role_count" /C:"1" /C:"2"
    if %ERRORLEVEL% EQU 0 (
        echo ✓ Roles table has data
    ) else (
        echo ? Could not verify roles (this is OK if backend hasn't started yet)
    )
)
echo.

echo ========================================
echo Diagnostics complete!
echo ========================================
pause


