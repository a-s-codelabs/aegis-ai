# Helper script to find and set JAVA_HOME for Android development
# Run this in PowerShell: .\set-java-home.ps1

Write-Host "Searching for Java installations..." -ForegroundColor Cyan

# Common JDK locations
$possiblePaths = @(
    "$env:ProgramFiles\Eclipse Adoptium\jdk-17*",
    "$env:ProgramFiles\Eclipse Adoptium\jdk-21*",
    "$env:ProgramFiles\Java\jdk-17*",
    "$env:ProgramFiles\Java\jdk-21*",
    "$env:ProgramFiles\Android\Android Studio\jbr",
    "$env:LOCALAPPDATA\Android\Sdk\jbr",
    "$env:ProgramFiles\Microsoft\jdk-17*",
    "$env:ProgramFiles\Microsoft\jdk-21*"
)

$foundJava = $null

foreach ($pathPattern in $possiblePaths) {
    $paths = Get-ChildItem -Path $pathPattern -ErrorAction SilentlyContinue | Where-Object { $_.PSIsContainer }
    foreach ($path in $paths) {
        $javaExe = Join-Path $path.FullName "bin\java.exe"
        if (Test-Path $javaExe) {
            $foundJava = $path.FullName
            Write-Host "Found Java at: $foundJava" -ForegroundColor Green
            break
        }
    }
    if ($foundJava) { break }
}

if (-not $foundJava) {
    Write-Host "`nJava not found in common locations." -ForegroundColor Red
    Write-Host "Please install JDK 17 or higher:" -ForegroundColor Yellow
    Write-Host "  - Eclipse Adoptium: https://adoptium.net/temurin/releases/?version=17" -ForegroundColor Yellow
    Write-Host "  - Or use: choco install openjdk17" -ForegroundColor Yellow
    exit 1
}

# Set JAVA_HOME for current session
$env:JAVA_HOME = $foundJava
Write-Host "`nJAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Green

# Verify
Write-Host "`nVerifying Java installation..." -ForegroundColor Cyan
& "$foundJava\bin\java.exe" -version

Write-Host "`nTo make this permanent:" -ForegroundColor Yellow
Write-Host "  1. Open System Properties → Advanced → Environment Variables" -ForegroundColor Yellow
Write-Host "  2. Add new System variable: JAVA_HOME = $foundJava" -ForegroundColor Yellow
Write-Host "  3. Add to Path: %JAVA_HOME%\bin" -ForegroundColor Yellow
Write-Host "`nFor now, JAVA_HOME is set for this PowerShell session." -ForegroundColor Green

