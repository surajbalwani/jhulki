Write-Host "Starting Jhulki Luxury App (Next.js Backend + Angular Frontend)..." -ForegroundColor Yellow

# Start Next.js Backend API
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\nextjs-backend'; npm run dev"

# Start Angular Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run start"

Write-Host "Services Launching:" -ForegroundColor Green
Write-Host "  -> Next.js API: http://localhost:5292" -ForegroundColor Cyan
Write-Host "  -> Angular UI:  http://localhost:4200" -ForegroundColor Cyan
