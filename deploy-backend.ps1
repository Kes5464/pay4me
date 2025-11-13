# 🚀 Pay4me Backend Deployment Script
# Automated setup for ClubKonnect API integration

Write-Host "🚀 Setting up Pay4me Backend with ClubKonnect..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Initialize Vercel project
Write-Host "📦 Initializing Vercel project..." -ForegroundColor Yellow
vercel login
vercel

# Step 2: Add ClubKonnect API Key
Write-Host ""
Write-Host "🔑 Adding ClubKonnect API Key..." -ForegroundColor Green
Write-Host "Please enter your ClubKonnect API key when prompted:" -ForegroundColor White
vercel env add CLUBKONNECT_API_KEY

# Step 3: Add Authentication Secret
Write-Host ""
Write-Host "🔐 Setting up authentication..." -ForegroundColor Green
$jwtSecret = [System.Web.Security.Membership]::GeneratePassword(64, 0)
Write-Host "Generated JWT Secret: $jwtSecret" -ForegroundColor Cyan
echo $jwtSecret | vercel env add JWT_SECRET

# Step 4: Add optional email/SMS providers
Write-Host ""
Write-Host "📧 Optional: Add email provider for verification" -ForegroundColor Yellow
Write-Host "Press Enter to skip, or enter your SendGrid API key:" -ForegroundColor White
$sendgridKey = Read-Host
if ($sendgridKey) {
    echo $sendgridKey | vercel env add SENDGRID_API_KEY
}

Write-Host ""
Write-Host "📱 Optional: Add SMS provider for verification" -ForegroundColor Yellow
Write-Host "Press Enter to skip, or enter your Termii API key:" -ForegroundColor White
$termiiKey = Read-Host
if ($termiiKey) {
    echo $termiiKey | vercel env add TERMII_API_KEY
}

# Step 5: Deploy
Write-Host ""
Write-Host "🚀 Deploying to production..." -ForegroundColor Green
vercel --prod

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Your Pay4me backend is now live with ClubKonnect integration!" -ForegroundColor Cyan
Write-Host "🔗 Backend URL will be displayed above" -ForegroundColor White
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update your frontend API_BASE URL with the new backend URL" -ForegroundColor White
Write-Host "2. Test the authentication system" -ForegroundColor White  
Write-Host "3. Test ClubKonnect recharge functionality" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Ready to process real transactions!" -ForegroundColor Magenta