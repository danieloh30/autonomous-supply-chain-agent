#!/bin/bash

# Autonomous Supply Chain Agent - Development Startup Script
# This script starts both the Quarkus backend and React frontend

echo "🚀 Starting Autonomous Supply Chain Agent..."
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $QUARKUS_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start Quarkus in the background
echo "📦 Starting Quarkus backend..."
./mvnw quarkus:dev &
QUARKUS_PID=$!

# Wait for Quarkus to start
echo "⏳ Waiting for Quarkus to start..."
sleep 10

# Start frontend in the background
echo "🎨 Starting React frontend..."
cd src/main/webui
npm install
npm run dev &
FRONTEND_PID=$!
cd ../../..

echo ""
echo "✅ Services started successfully!"
echo ""
echo "📍 Backend:  http://localhost:8080"
echo "📍 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for both processes
wait $QUARKUS_PID $FRONTEND_PID

# Made with Bob
