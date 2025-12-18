# Start Metro bundler (after ensuring port is free)
Write-Host "Checking if port 8081 is available..." -ForegroundColor Cyan

$portInUse = netstat -ano | findstr :8081
if ($portInUse) {
    Write-Host "Port 8081 is in use. Running stop-metro.ps1 first..." -ForegroundColor Yellow
    & "$PSScriptRoot\stop-metro.ps1"
    Start-Sleep -Seconds 2
}

Write-Host "Starting Metro bundler (without opening Android)..." -ForegroundColor Green
Write-Host "Keep this terminal open. In another terminal, run: cd ..\android-native && gradlew.bat app:installDebug" -ForegroundColor Yellow
pnpm start

