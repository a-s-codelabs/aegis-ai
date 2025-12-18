# Stop Metro bundler and clear cache
Write-Host "Stopping Metro bundler processes..." -ForegroundColor Cyan

# Find and kill processes using port 8081
$processes = netstat -ano | findstr :8081 | ForEach-Object {
    if ($_ -match '\s+(\d+)$') {
        $matches[1]
    }
} | Select-Object -Unique

foreach ($pid in $processes) {
    if ($pid) {
        Write-Host "Killing process PID: $pid" -ForegroundColor Yellow
        taskkill /F /PID $pid 2>$null
    }
}

# Kill any Node processes that might be Metro
Get-Process | Where-Object {
    $_.ProcessName -eq "node" -and
    $_.Path -like "*mobile*"
} | ForEach-Object {
    Write-Host "Killing Node process: $($_.Id)" -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

# Clear Metro cache
Write-Host "Clearing Metro cache..." -ForegroundColor Cyan
Remove-Item -Path ".metro" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue

# Verify port is free
Start-Sleep -Seconds 1
$stillInUse = netstat -ano | findstr :8081
if ($stillInUse) {
    Write-Host "Warning: Port 8081 is still in use" -ForegroundColor Red
} else {
    Write-Host "Port 8081 is now free. You can start Metro with: pnpm start" -ForegroundColor Green
}

