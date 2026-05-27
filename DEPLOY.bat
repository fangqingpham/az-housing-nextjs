@echo off
cd /d "C:\Soft\az-housing-nextjs\az-housing"
echo.
echo =========================================
echo   A-Z Housing Solutions — Deploy Script
echo =========================================
echo.
echo [1/3] Staging all changes...
git add -A
echo.
echo [2/3] Committing...
git commit -m "fix: move LanguageProvider JSX to .tsx file to fix build error"
echo.
echo [3/3] Pushing to GitHub (Vercel auto-deploys on push)...
git push origin main
echo.
echo =========================================
echo   Done! Vercel will deploy in ~60 seconds
echo   Live at: https://www.azhouse.ca
echo =========================================
echo.
pause
