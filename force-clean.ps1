# Force Clean Script - Closes Electron and cleans dist folder
Write-Host "=== Force Clean Script ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill all Electron processes
Write-Host "Step 1: Closing Electron processes..." -ForegroundColor Yellow
$electronProcesses = Get-Process | Where-Object {
    $_.ProcessName -like "*electron*" -or 
    $_.ProcessName -like "*PK B2B*" -or
    $_.MainWindowTitle -like "*PK B2B*" -or
    $_.MainWindowTitle -like "*ORDERS*"
}

if ($electronProcesses) {
    Write-Host "Found $($electronProcesses.Count) Electron process(es)" -ForegroundColor Yellow
    $electronProcesses | ForEach-Object {
        Write-Host "  Killing: $($_.ProcessName) (PID: $($_.Id))" -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "✓ Electron processes closed" -ForegroundColor Green
} else {
    Write-Host "✓ No Electron processes found" -ForegroundColor Green
}

# Wait a moment for files to unlock
Start-Sleep -Seconds 2

# Step 2: Clean dist folder
Write-Host ""
Write-Host "Step 2: Cleaning dist folder..." -ForegroundColor Yellow

$distPath = "C:\Projects\PEEKAY\PKB2B_FRONTEND\dist"

if (Test-Path $distPath) {
    try {
        # Try to remove with force
        Remove-Item $distPath -Recurse -Force -ErrorAction Stop
        Write-Host "✓ dist folder deleted successfully" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Some files couldn't be deleted" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Trying alternative method..." -ForegroundColor Yellow
        
        # Alternative: Use cmd rmdir
        cmd /c "rmdir /s /q `"$distPath`"" 2>$null
        
        if (Test-Path $distPath) {
            Write-Host "⚠ dist folder still exists" -ForegroundColor Red
            Write-Host ""
            Write-Host "MANUAL ACTION REQUIRED:" -ForegroundColor Red
            Write-Host "1. Open File Explorer" -ForegroundColor White
            Write-Host "2. Navigate to: C:\Projects\PEEKAY\PKB2B_FRONTEND\" -ForegroundColor White
            Write-Host "3. Delete the 'dist' folder manually" -ForegroundColor White
            Write-Host "4. If it says 'file in use', restart your computer" -ForegroundColor White
        } else {
            Write-Host "✓ dist folder deleted" -ForegroundColor Green
        }
    }
} else {
    Write-Host "✓ dist folder doesn't exist (already clean)" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Cleanup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now run: npm run dist" -ForegroundColor Green
Write-Host ""
