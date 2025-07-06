@echo off
echo 🚀 Starting TattSync Backend Server...
echo.

REM Check if we're in the right directory
if not exist "backend" (
    echo ❌ Error: backend directory not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

REM Navigate to backend directory
cd backend

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  Warning: .env file not found in backend directory
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo.
    echo 📝 Please edit backend\.env and add your actual Supabase credentials:
    echo    - SUPABASE_URL ^(from your Supabase project dashboard^)
    echo    - SUPABASE_ANON_KEY ^(anon public key^)
    echo    - SUPABASE_SERVICE_ROLE_KEY ^(service role secret key^)
    echo.
    echo After updating the .env file, run this script again.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    npm install
    echo.
)

REM Start the server
echo 🔥 Starting backend server on port 3003...
echo 📊 Health check will be available at: http://localhost:3003/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

npm start