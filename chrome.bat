@echo off
set PORT=8000
cd /d "%~dp0"

rem Try to start a simple HTTP server in a new window using py or python
where py >nul 2>&1 && (
  start "MMU Server" cmd /k "py -3 -m http.server %PORT%"
) || (
  where python >nul 2>&1 && start "MMU Server" cmd /k "python -m http.server %PORT%" || (
    echo Python not found. Will fall back to opening file:// URL.
  )
)

timeout /t 1 >nul

rem Open Chrome to the local server (fallback to default browser)
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
  start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:%PORT%"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
  start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "http://localhost:%PORT%"
) else (
  rem no Chrome found — open default browser to server or file
  if "%ERRORLEVEL%"=="0" (
    start "" "http://localhost:%PORT%"
  ) else (
    start "" "file:///%~dp0index.html"
  )
)

exit
@echo off
setlocal
set PORT=8000
cd /d "%~dp0"

rem Start a simple HTTP server in a new window using py or python
where py >nul 2>&1 && (
  start "MMU Server" cmd /k "py -3 -m http.server %PORT%"
) || (
  where python >nul 2>&1 && (
    start "MMU Server" cmd /k "python -m http.server %PORT%"
  ) || (
    echo Python not found. Will open index.html directly with default browser.
    timeout /t 1 >nul
    start "" "file:///%~dp0index.html"
    exit /b
  )
)

rem Wait briefly for server to bind
timeout /t 1 >nul

rem Try to open Chrome to the local server (fall back to default browser)
set CHROME1=C:\Program Files\Google\Chrome\Application\chrome.exe
set CHROME2=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe

if exist "%CHROME1%" (
  start "" "%CHROME1%" "http://localhost:%PORT%/"
) else if exist "%CHROME2%" (
  start "" "%CHROME2%" "http://localhost:%PORT%/"
) else (
  start "" "http://localhost:%PORT%/"
)

exit /