@echo off
REM Test Database Persistence Script
REM This script loads environment variables from .env and runs persistence tests

echo Loading environment variables from .env...
for /f "tokens=1,2 delims==" %%a in (.env) do set %%a=%%b

echo.
echo Running database persistence test...
echo.

npm run test:persistence

echo.
echo Test complete!
echo.
echo To run the full test (requires pgcrypto extension enabled):
echo   npm run test:persistence:full
echo.
pause
