@echo off
chcp 65001 >nul
echo ================================================
echo   Ui.Vision RPA - Wind Terminal Automation
echo ================================================

set "EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
set "MACRO_PATH=%~dp0src\tests\wind\stock-browser-macro.csv"
set "LOG_PATH=%~dp0report-output\rpa-log.txt"

if not exist "%EDGE_PATH%" (
    echo ERROR: Edge not found at default location
    echo Please modify EDGE_PATH to your Edge installation path
    pause
    exit /b 1
)

if not exist "%MACRO_PATH%" (
    echo ERROR: Macro file not found: %MACRO_PATH%
    pause
    exit /b 1
)

echo Macro file: %MACRO_PATH%
echo Log file: %LOG_PATH%
echo.

echo Starting Ui.Vision RPA...
"%EDGE_PATH%" "file:///C:/Users/gyy/AppData/Local/Microsoft/Edge/User Data/Default/Extensions/gcbalfbdmfieckjlnblleoemohcganoc/9.6.0_0/html/index.html?direct=1&file=%MACRO_PATH%&storage=file&savelog=%LOG_PATH%"

echo RPA started successfully!
echo Please ensure Wind Terminal is open and in foreground
echo.
echo ================================================
