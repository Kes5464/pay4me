# Test if pay4me.com.ng DNS is ready
# Run this every few hours to check DNS propagation

Write-Host "Testing pay4me.com.ng DNS resolution..." -ForegroundColor Yellow
Write-Host ""

try {
    $result = Resolve-DnsName -Name "pay4me.com.ng" -Type A -ErrorAction Stop
    Write-Host "✅ SUCCESS! pay4me.com.ng is resolving to:" -ForegroundColor Green
    foreach ($record in $result) {
        Write-Host "   IP: $($record.IPAddress)" -ForegroundColor Green
    }
    Write-Host ""
    Write-Host "🎉 Your domain is ready! You can now:" -ForegroundColor Green
    Write-Host "   1. Enable custom domain in GitHub Pages settings" -ForegroundColor White
    Write-Host "   2. Visit https://pay4me.com.ng" -ForegroundColor White
}
catch {
    Write-Host "❌ DNS not ready yet. Current status:" -ForegroundColor Red
    Write-Host "   Domain: pay4me.com.ng" -ForegroundColor White
    Write-Host "   Status: Not resolving" -ForegroundColor Red
    Write-Host "   Action: Check Smartweb DNS settings" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Make sure you added the A records:" -ForegroundColor Yellow
    Write-Host "   185.199.108.153" -ForegroundColor White
    Write-Host "   185.199.109.153" -ForegroundColor White  
    Write-Host "   185.199.110.153" -ForegroundColor White
    Write-Host "   185.199.111.153" -ForegroundColor White
}

Write-Host ""
Write-Host "🔄 Run this script again in 2-4 hours to recheck" -ForegroundColor Cyan