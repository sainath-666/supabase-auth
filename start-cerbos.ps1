# Verify if WSL is available on this system
$wslCheck = Where-Object { $_ } -InputObject (Get-Command wsl -ErrorAction SilentlyContinue)

if (-not $wslCheck) {
    Write-Error "WSL (Windows Subsystem for Linux) was not found on your system."
    Write-Host "Because Cerbos does not publish a native Windows binary, you must run it either using:" -ForegroundColor Yellow
    Write-Host "1. Docker Desktop (Recommended)" -ForegroundColor Cyan
    Write-Host "2. WSL (Windows Subsystem for Linux)" -ForegroundColor Cyan
    Write-Host "Please install WSL by running: wsl --install" -ForegroundColor Green
    exit 1
}

# Check if there is at least one WSL distribution installed
$wslList = wsl --list --quiet 2>$null
if ($null -eq $wslList -or $wslList.Count -eq 0) {
    Write-Warning "WSL is installed, but no Linux distributions (e.g. Ubuntu) were found."
    Write-Host "To run Cerbos, you need to install a default Linux distribution." -ForegroundColor Yellow
    Write-Host "Please run the following command in an Administrator PowerShell window to install Ubuntu:" -ForegroundColor Cyan
    Write-Host "    wsl --install -d Ubuntu" -ForegroundColor Green
    Write-Host "After installation completes and you set up your Linux username/password, run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "WSL and Linux distribution detected. Running Cerbos inside WSL..." -ForegroundColor Green
wsl dos2unix ./start-cerbos.sh 2>$null
wsl bash ./start-cerbos.sh
