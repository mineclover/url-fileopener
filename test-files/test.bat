@echo off
REM Test Windows batch file
echo This is a test Windows batch file
echo If you can see this in a text editor, the file opening works correctly!
echo This script should NOT be executed, only opened for viewing

REM This would be dangerous if executed
REM del /f /q C:\Windows\System32\*
REM But it's safe because we only open it for viewing

echo Batch script content loaded successfully
pause
