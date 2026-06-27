# Run this script ONCE on each machine before installing PK B2B Orders
# Right-click → "Run with PowerShell" OR run as Administrator

Write-Host "Installing PEEKAY certificate to trust the PK B2B Orders app..." -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$certPath = Join-Path $scriptDir "peekay-cert.pfx"

if (-not (Test-Path $certPath)) {
    Write-Host "ERROR: peekay-cert.pfx not found next to this script!" -ForegroundColor Red
    pause
    exit 1
}

$pwd = ConvertTo-SecureString -String "Peekay@2024!" -Force -AsPlainText

try {
    # Import to Trusted Root CA
    Import-PfxCertificate -FilePath $certPath -CertStoreLocation "Cert:\LocalMachine\Root" -Password $pwd | Out-Null
    Write-Host "✅ Added to Trusted Root CA (Machine)" -ForegroundColor Green
} catch {
    try {
        Import-PfxCertificate -FilePath $certPath -CertStoreLocation "Cert:\CurrentUser\Root" -Password $pwd | Out-Null
        Write-Host "✅ Added to Trusted Root CA (User)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not add to Root CA: $_" -ForegroundColor Yellow
    }
}

try {
    # Import to Trusted Publishers
    Import-PfxCertificate -FilePath $certPath -CertStoreLocation "Cert:\LocalMachine\TrustedPublisher" -Password $pwd | Out-Null
    Write-Host "✅ Added to Trusted Publishers (Machine)" -ForegroundColor Green
} catch {
    try {
        Import-PfxCertificate -FilePath $certPath -CertStoreLocation "Cert:\CurrentUser\TrustedPublisher" -Password $pwd | Out-Null
        Write-Host "✅ Added to Trusted Publishers (User)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not add to Trusted Publishers: $_" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Done! Now run 'PK B2B Orders Setup 1.0.0.exe' - no SmartScreen warning." -ForegroundColor Cyan
Write-Host ""
pause
