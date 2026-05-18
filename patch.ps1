# VGN VHUB Keyboard Auto-Patcher Launcher
# Run this script to automatically patch the VGN VHUB application to support the ATK N75 PRO.

$ErrorActionPreference = "Stop"

# 1. Check for Administrative Privileges and Relaunch if Needed
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Requesting Administrator privileges..." -ForegroundColor Cyan
    try {
        Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    } catch {
        Write-Host "Administrator privileges denied. Patcher cannot run." -ForegroundColor Red
        Pause
    }
    Exit
}

Write-Host "=========================================" -ForegroundColor Green
Write-Host "   VGN VHUB KEYBOARD AUTO-PATCHER TOOL   " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

# 2. Define target installation directory
$vgnDir = "C:\Program Files\VGN VHUB"
$exePath = Join-Path $vgnDir "VGN VHUB.exe"

if (-not (Test-Path $exePath)) {
    Write-Host "[WARNING] Could not find VGN VHUB.exe at standard directory: $vgnDir" -ForegroundColor Yellow
    # Allow the user to input a custom path if they installed it elsewhere
    $customDir = Read-Host "Please enter the custom installation directory (or press Enter to exit)"
    if ([string]::IsNullOrWhiteSpace($customDir)) {
        Write-Host "Exiting patcher." -ForegroundColor Red
        Pause
        Exit
    }
    $vgnDir = $customDir.Trim()
    $exePath = Join-Path $vgnDir "VGN VHUB.exe"
    if (-not (Test-Path $exePath)) {
        Write-Host "[ERROR] Could not find VGN VHUB.exe in: $vgnDir" -ForegroundColor Red
        Pause
        Exit
    }
}

# 3. Terminate VGN VHUB if it is currently running
$vgnProcess = Get-Process -Name "VGN VHUB" -ErrorAction SilentlyContinue
if ($vgnProcess) {
    Write-Host "VGN VHUB is currently running. Stopping application to apply patches..." -ForegroundColor Yellow
    try {
        Stop-Process -Name "VGN VHUB" -Force
        Start-Sleep -Seconds 2
        Write-Host "Application stopped successfully." -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Failed to stop VGN VHUB process. Please close the app manually first." -ForegroundColor Red
        Pause
        Exit
    }
}

# 4. Invoke the Node.js Patcher script
$patcherJs = Join-Path $PSScriptRoot "patcher.js"
Write-Host "Invoking Node.js patching engine..." -ForegroundColor Cyan
try {
    node "$patcherJs" "$vgnDir"
} catch {
    Write-Host ""
    Write-Host "[FATAL ERROR] An unexpected error occurred while running the patcher script." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Pause
    Exit
}

# 5. Relaunch VGN VHUB
if (Test-Path $exePath) {
    Write-Host "Patching successful! Relaunching VGN VHUB..." -ForegroundColor Green
    try {
        Start-Process -FilePath $exePath -WorkingDirectory $vgnDir
        Write-Host "VGN VHUB restarted successfully!" -ForegroundColor Green
    } catch {
        Write-Host "[WARNING] Could not relaunch VGN VHUB automatically. Please start it manually." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "            PATCHER FINISHED             " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Press any key to close..."
$null = [Console]::ReadKey($true)
