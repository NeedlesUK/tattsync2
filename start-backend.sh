#!/bin/bash

# Function to kill process on port 3003
kill_port_3003() {
    echo "🔍 Checking for processes on port 3003..."
    PID=$(lsof -ti:3003)
    if [ ! -z "$PID" ]; then
        echo "⚠️  Port 3003 is in use by process $PID. Terminating..."
        kill -9 $PID 2>/dev/null
        sleep 2
        echo "✅ Process terminated"
    else
        echo "✅ Port 3003 is available"
    fi
}

echo "🚀 Starting TattSync Backend Server..."
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "❌ Error: backend directory not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found in backend directory"
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo ""
    echo "📝 Please edit backend/.env and add your actual Supabase credentials:"
    echo "   - SUPABASE_URL (from your Supabase project dashboard)"
    echo "   - SUPABASE_ANON_KEY (anon public key)"
    echo "   - SUPABASE_SERVICE_ROLE_KEY (service role secret key)"
    echo ""
    echo "After updating the .env file, run this script again."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
    echo ""
fi

# Kill any existing process on port 3003
kill_port_3003

# Start the server
export PORT=3003
echo "🔥 Starting backend server on port 3003..."
echo "📊 Health check will be available at: http://localhost:3003/api/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start