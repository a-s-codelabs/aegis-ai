@echo off
REM Setup ADB path for this session
REM This adds Android SDK platform-tools to PATH temporarily

REM Common Android SDK locations
set "ANDROID_SDK=%LOCALAPPDATA%\Android\Sdk"
if not exist "%ANDROID_SDK%\platform-tools\adb.exe" (
    set "ANDROID_SDK=C:\Program Files\Android\Android Studio\sdk"
)
if not exist "%ANDROID_SDK%\platform-tools\adb.exe" (
    set "ANDROID_SDK=C:\Program Files (x86)\Android\android-sdk"
)

if exist "%ANDROID_SDK%\platform-tools\adb.exe" (
    echo Found Android SDK at: %ANDROID_SDK%
    set PATH=%PATH%;%ANDROID_SDK%\platform-tools
    echo.
    echo ADB added to PATH for this session
    echo.
    adb devices
) else (
    echo.
    echo ERROR: Android SDK platform-tools not found!
    echo.
    echo Please install Android SDK or add platform-tools to your PATH:
    echo   1. Install Android Studio
    echo   2. Or download Android SDK command-line tools
    echo   3. Add <SDK_PATH>\platform-tools to your system PATH
    echo.
    pause
)

