@echo off
echo ========================================
echo Building and Installing Android App
echo ========================================
echo.

REM Setup ADB path - try common locations
set "ANDROID_SDK=%LOCALAPPDATA%\Android\Sdk"
if not exist "%ANDROID_SDK%\platform-tools\adb.exe" (
    set "ANDROID_SDK=C:\Program Files\Android\Android Studio\sdk"
)
if not exist "%ANDROID_SDK%\platform-tools\adb.exe" (
    set "ANDROID_SDK=C:\Program Files (x86)\Android\android-sdk"
)

if exist "%ANDROID_SDK%\platform-tools\adb.exe" (
    set "PATH=%PATH%;%ANDROID_SDK%\platform-tools"
    echo Android SDK found at: %ANDROID_SDK%
) else (
    echo WARNING: Android SDK platform-tools not found
    echo Trying to continue without ADB...
)
echo.

REM Check if device is connected
echo Checking for connected devices...
adb devices
echo.

REM Build and install
echo Starting Gradle build...
echo.
call gradlew.bat app:installDebug

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESSFUL - App installed!
    echo ========================================
    echo.
    echo Check your device for the app icon.
    echo.
) else (
    echo.
    echo ========================================
    echo BUILD FAILED
    echo ========================================
    echo.
    echo Check the errors above for details.
    echo.
    pause
)
