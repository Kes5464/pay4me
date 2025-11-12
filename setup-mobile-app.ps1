# Capacitor Setup Script for Pay4me Mobile App
# Run this in PowerShell to convert your PWA to mobile apps

Write-Host "🚀 Setting up Pay4me for Mobile App Stores" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org" -ForegroundColor Red
    Write-Host "   Download the LTS version and install it first." -ForegroundColor Yellow
    exit 1
}

# Navigate to project directory
$projectPath = "C:\Users\KES\Desktop\utility bill"
Set-Location $projectPath

# Initialize npm if package.json doesn't exist
if (-not (Test-Path "package.json")) {
    Write-Host "📦 Creating package.json..." -ForegroundColor Yellow
    npm init -y
}

Write-Host "📱 Installing Capacitor..." -ForegroundColor Yellow
npm install -g @capacitor/cli @capacitor/core

Write-Host "🔧 Initializing Capacitor project..." -ForegroundColor Yellow
npx cap init Pay4me ng.com.pay4me --web-dir="."

Write-Host "📱 Adding Android platform..." -ForegroundColor Yellow
npx cap add android

Write-Host "📊 Copying web assets..." -ForegroundColor Yellow
npx cap copy

Write-Host ""
Write-Host "✅ SETUP COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Install Android Studio from: https://developer.android.com/studio" -ForegroundColor White
Write-Host "2. Run: npx cap open android" -ForegroundColor White
Write-Host "3. Build APK in Android Studio" -ForegroundColor White
Write-Host "4. Upload to Google Play Console" -ForegroundColor White
Write-Host ""
Write-Host "💡 For iOS (requires macOS):" -ForegroundColor Cyan
Write-Host "1. Run: npx cap add ios" -ForegroundColor White
Write-Host "2. Run: npx cap open ios" -ForegroundColor White
Write-Host "3. Build in Xcode and upload to App Store" -ForegroundColor White
Write-Host ""

# Create Capacitor config
$capacitorConfig = @'
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ng.com.pay4me',
  appName: 'Pay4me',
  webDir: '.',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#667eea",
      showSpinner: false,
      androidSplashResourceName: "splash",
      iosSplashResourceName: "Default"
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#667eea"
    }
  }
};

export default config;
'@

$capacitorConfig | Out-File -FilePath "capacitor.config.ts" -Encoding UTF8
Write-Host "✅ Created capacitor.config.ts" -ForegroundColor Green