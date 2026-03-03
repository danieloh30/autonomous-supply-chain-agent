@echo off
REM Autonomous Supply Chain Agent - Development Startup Script (Windows)
REM This script starts both the Quarkus backend and React frontend

echo.
echo Starting Autonomous Supply Chain Agent...
echo.

echo Starting Quarkus backend...
start "Quarkus Backend" cmd /k "mvnw.cmd quarkus:dev"

echo Waiting for Quarkus to start...
timeout /t 10 /nobreak >nul

echo Starting React frontend...
cd src\main\webui
start "React Frontend" cmd /k "npm install && npm run dev"
cd ..\..\..

echo.
echo Services started successfully!
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:3000
echo.
echo Close the terminal windows to stop the services
echo.

pause

@REM Made with Bob
