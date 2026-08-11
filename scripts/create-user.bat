@echo off
setlocal

set "PROJECT_ROOT=%~dp0.."
pushd "%PROJECT_ROOT%" >nul 2>&1
if errorlevel 1 (
  echo Could not open the project directory.
  pause
  exit /b 1
)

set /p "TASK_ATLAS_ADMIN_USERNAME=Username: "
if not defined TASK_ATLAS_ADMIN_USERNAME (
  echo Username is required.
  popd
  pause
  exit /b 1
)

powershell -NoProfile -Command "$securePassword = Read-Host 'Password' -AsSecureString; $env:TASK_ATLAS_ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', $securePassword).Password; & npm.cmd run user:create -- $env:TASK_ATLAS_ADMIN_USERNAME; $exitCode = $LASTEXITCODE; if ($exitCode -eq 2) { $answer = Read-Host 'Account exists. Overwrite password? (Y/N)'; if ($answer -match '^[Yy]$') { & npm.cmd run user:create -- $env:TASK_ATLAS_ADMIN_USERNAME --reset; $exitCode = $LASTEXITCODE } else { $exitCode = 3 } }; exit $exitCode"
set "CREATE_USER_EXIT_CODE=%ERRORLEVEL%"

if "%CREATE_USER_EXIT_CODE%"=="0" (
  echo.
  echo Account setup completed.
) else if "%CREATE_USER_EXIT_CODE%"=="3" (
  echo.
  echo Account already exists. Password was not changed.
  set "CREATE_USER_EXIT_CODE=0"
) else (
  echo.
  echo Account creation failed. Review the message above.
)

pause
popd
endlocal & exit /b %CREATE_USER_EXIT_CODE%
