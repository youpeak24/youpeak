# ============================================================
#  YouPeak — Local Development Startup Script
#  Run this script to start ALL 3 services at once
# ============================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  YouPeak Local Dev Environment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Path configurations
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$adminBackendPath = Join-Path $scriptDir "admin\backend"
$adminFrontendPath = Join-Path $scriptDir "admin\frontend"
$flutterBackendPath = Join-Path $scriptDir "functions\backend"

# Check if serviceAccountKey.json exists
$serviceAccountKey = Join-Path $scriptDir "serviceAccountKey.json"
if (-not (Test-Path $serviceAccountKey)) {
    Write-Host "⚠️  WARNING: serviceAccountKey.json not found!" -ForegroundColor Yellow
    Write-Host "   Firebase Admin SDK requires this file to connect to Firestore." -ForegroundColor Yellow
    Write-Host "   Follow these steps to get it:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   1. Go to: https://console.firebase.google.com" -ForegroundColor White
    Write-Host "   2. Select your project (youpeak-9ff65)" -ForegroundColor White
    Write-Host "   3. Project Settings → Service Accounts" -ForegroundColor White
    Write-Host "   4. Click 'Generate new private key'" -ForegroundColor White
    Write-Host "   5. Save as 'serviceAccountKey.json' in: $scriptDir" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Continue without Firebase? (Services may fail) [y/N]"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "Exiting. Please add serviceAccountKey.json and try again." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ serviceAccountKey.json found!" -ForegroundColor Green
    # Copy to both backend folders so they can use it
    Copy-Item $serviceAccountKey (Join-Path $adminBackendPath "serviceAccountKey.json") -Force
    Copy-Item $serviceAccountKey (Join-Path $flutterBackendPath "serviceAccountKey.json") -Force
    
    # Set GOOGLE_APPLICATION_CREDENTIALS environment variable for this session
    $env:GOOGLE_APPLICATION_CREDENTIALS = $serviceAccountKey
    Write-Host "✅ Firebase credentials configured!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Cyan
Write-Host ""

# ---- 1. Start Admin Backend (Port 5000) ----
Write-Host "🔧 Starting Admin Backend (Port 5000)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$adminBackendPath'; `$env:GOOGLE_APPLICATION_CREDENTIALS='$serviceAccountKey'; Write-Host 'Admin Backend Starting...' -ForegroundColor Cyan; npm run dev"
) -WindowStyle Normal

Start-Sleep -Seconds 3

# ---- 2. Start Flutter Client API Backend (Port 5001) ----
Write-Host "📱 Starting Flutter API Backend (Port 5001)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$flutterBackendPath'; `$env:GOOGLE_APPLICATION_CREDENTIALS='$serviceAccountKey'; Write-Host 'Flutter API Backend Starting...' -ForegroundColor Magenta; npm run dev"
) -WindowStyle Normal

Start-Sleep -Seconds 3

# ---- 3. Start Admin Frontend (Port 3000) ----
Write-Host "🖥️  Starting Admin Frontend (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$adminFrontendPath'; Write-Host 'Admin React Panel Starting...' -ForegroundColor Green; npm start"
) -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All Services Starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Admin Panel:        http://localhost:3000" -ForegroundColor White
Write-Host "🔧 Admin Backend:      http://localhost:5000" -ForegroundColor White
Write-Host "📱 Flutter API:        http://localhost:5001" -ForegroundColor White
Write-Host ""
Write-Host "👑 Super Admin Login:" -ForegroundColor Yellow
Write-Host "   Email:    youpeak24@gmail.com" -ForegroundColor White
Write-Host "   Password: 12345678" -ForegroundColor White
Write-Host ""
Write-Host "🏢 Agency Admin: Create via Super Admin → Agency Management" -ForegroundColor Yellow
Write-Host ""
Write-Host "📱 Flutter (Android Emulator):" -ForegroundColor Yellow
Write-Host "   Run: flutter run --debug" -ForegroundColor White
Write-Host "   API: http://10.0.2.2:5001 (emulator auto-routes to localhost)" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Wait ~10 seconds for all services to initialize..." -ForegroundColor DarkGray
Write-Host ""
