# PowerShell script to push CodeMentor AI to GitHub
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Pushing CodeMentor AI to GitHub" -ForegroundColor Cyan
Write-Host "Repository: https://github.com/udithrpoojary04/AI-Code-Reviewer-and-Mentor.git" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Set-Location -Path $PSScriptRoot

Write-Host "`n[1/5] Initializing Git repository..." -ForegroundColor Yellow
git init

Write-Host "`n[2/5] Staging files..." -ForegroundColor Yellow
git add .

Write-Host "`n[3/5] Committing project..." -ForegroundColor Yellow
git commit -m "feat: complete CodeMentor AI platform with token-free GitHub integration & live metrics"

Write-Host "`n[4/5] Setting main branch & remote origin..." -ForegroundColor Yellow
git branch -M main
git remote remove origin 2>$null
git remote add origin https://github.com/udithrpoojary04/AI-Code-Reviewer-and-Mentor.git

Write-Host "`n[5/5] Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nRepository may have initial commits on GitHub. Pulling with rebase and retrying push..." -ForegroundColor Yellow
    git pull origin main --rebase
    git push -u origin main
}

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "Done! Check your repository at:" -ForegroundColor Green
Write-Host "https://github.com/udithrpoojary04/AI-Code-Reviewer-and-Mentor" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
