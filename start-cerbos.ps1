$version = "0.34.0"
$zipFile = "cerbos.zip"
$destDir = "$PSScriptRoot\cerbos"
$binaryPath = "$destDir\cerbos.exe"

if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir | Out-Null
}

if (-not (Test-Path $binaryPath)) {
    Write-Host "Cerbos binary not found locally." -ForegroundColor Yellow
    Write-Host "Downloading Cerbos v$version for Windows..." -ForegroundColor Cyan
    $url = "https://github.com/cerbos/cerbos/releases/download/v$version/cerbos_${version}_windows_amd64.zip"
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $zipFile -ErrorAction Stop
        Write-Host "Extracting archive..." -ForegroundColor Cyan
        Expand-Archive -Path $zipFile -DestinationPath $destDir -Force
        Remove-Item -Path $zipFile -Force
        Write-Host "Cerbos successfully downloaded and extracted." -ForegroundColor Green
    } catch {
        Write-Error "Failed to download Cerbos: $_"
        exit 1
    }
}

Write-Host "Starting Cerbos Server..." -ForegroundColor Green
Write-Host "Policies directory: $destDir\policies" -ForegroundColor Cyan
& $binaryPath server --set=storage.disk.directory="$destDir\policies"
