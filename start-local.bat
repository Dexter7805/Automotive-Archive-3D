@echo off
setlocal
cd /d "%~dp0"
set "CODEX_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%CODEX_NODE%" goto run_codex_node
where node >nul 2>nul
if %errorlevel%==0 goto run_system_node
where py >nul 2>nul
if %errorlevel%==0 goto run_python
where python >nul 2>nul
if %errorlevel%==0 goto run_python_cmd
echo Node.js or Python was not found. Keep this folder on the computer where Codex created it.
pause
exit /b 1

:run_codex_node
start "Automotive Archive Server" /min "%CODEX_NODE%" "%~dp0server.cjs"
goto open_site

:run_system_node
start "Automotive Archive Server" /min node "%~dp0server.cjs"
goto open_site

:run_python
start "Automotive Archive Server" /min py -m http.server 8007 --bind 127.0.0.1 --directory "%~dp0"
goto open_site

:run_python_cmd
start "Automotive Archive Server" /min python -m http.server 8007 --bind 127.0.0.1 --directory "%~dp0"

:open_site
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8007/"
exit /b 0
