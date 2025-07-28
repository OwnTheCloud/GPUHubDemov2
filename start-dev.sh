#!/bin/bash

echo "🚀 Starting GPU Hub Development Environment"
echo ""

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "simple-api-server.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 1

# Start API server in background
echo "🔌 Starting API Server on port 3333..."
node simple-api-server.js &
API_PID=$!

# Wait for API server to be ready
sleep 2

# Test API server
echo "🔍 Testing API server..."
if curl -s http://localhost:3333/api/health > /dev/null; then
    echo "✅ API Server is running and healthy"
else
    echo "❌ API Server failed to start"
    kill $API_PID 2>/dev/null
    exit 1
fi

# Start Vite dev server
echo "🌐 Starting Vite dev server on port 3000..."
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 API: http://localhost:3333"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start Vite (this will be the foreground process)
npm run dev

# Clean up when Vite exits
echo "🧹 Stopping API server..."
kill $API_PID 2>/dev/null
echo "✅ Cleanup complete"