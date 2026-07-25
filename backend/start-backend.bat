@echo off
set DB_URL=jdbc:postgresql://localhost:5455/insteip_db
set DB_USERNAME=insteip_user
if "%DB_PASSWORD%"=="" (
  echo Define DB_PASSWORD antes de iniciar el backend.
  exit /b 1
)
cd /d "%~dp0"
start /B .\mvnw.cmd spring-boot:run -q > ..\run-logs\backend-current.out.log 2> ..\run-logs\backend-current.err.log
echo Backend iniciado en segundo plano.
