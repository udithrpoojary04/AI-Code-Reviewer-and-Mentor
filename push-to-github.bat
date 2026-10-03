@echo off
echo ========================================================
echo Pushing CodeMentor AI to GitHub
echo Repository: https://github.com/udithrpoojary04/AI-Code-Reviewer-and-Mentor.git
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/5] Initializing Git repository...
git init

echo.
echo [2/5] Staging files...
git add .

echo.
echo [3/5] Committing project...
git commit -m "feat: complete CodeMentor AI platform with token-free GitHub integration & live metrics"

echo.
echo [4/5] Setting main branch & remote origin...
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/udithrpoojary04/AI-Code-Reviewer-and-Mentor.git

echo.
echo [5/5] Pushing to GitHub...
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ----------------------------------------------------
    echo If GitHub rejected due to existing files (e.g. README/License),
    echo syncing remote changes with rebase and retrying:
    echo ----------------------------------------------------
    git pull origin main --rebase
    git push -u origin main
)

echo.
echo ========================================================
echo Done! Please check your repository:
echo https://github.com/udithrpoojary04/AI-Code-Reviewer-and-Mentor
echo ========================================================
pause
