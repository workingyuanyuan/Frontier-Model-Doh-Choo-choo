@echo off
setlocal

cd /d "%~dp0"
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-bench-review.ps1"

if errorlevel 1 (
  echo.
  echo LLM Bench could not be started. Check the message above.
  pause
)

endlocal
