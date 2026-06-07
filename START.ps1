#!/bin/bash
# CardWise AI — Quick Start Script

echo "╔════════════════════════════════════════╗"
echo "║      CardWise AI — Quick Setup         ║"
echo "╚════════════════════════════════════════╝"
echo ""

# 1. Start PostgreSQL
echo "▶ Starting PostgreSQL via Docker..."
cd cardwise-api
docker-compose up -d
echo "  Waiting for DB to be ready..."
Start-Sleep -Seconds 4

# 2. Install Python deps & seed
echo "▶ Installing Python dependencies..."
pip install -r requirements.txt

echo "▶ Seeding database with 8 cards..."
python seed.py

# 3. Start FastAPI
echo "▶ Starting FastAPI backend on port 8000..."
Start-Process powershell -ArgumentList "uvicorn main:app --reload --host 0.0.0.0 --port 8000"

# 4. Start Next.js
echo "▶ Starting Next.js dashboard on port 3000..."
cd ../cardwise-dashboard
Start-Process powershell -ArgumentList "npm run dev"

echo ""
echo "✅ All services started!"
echo "   API:       http://localhost:8000"
echo "   Dashboard: http://localhost:3000"
echo "   Docs:      http://localhost:8000/docs"
echo ""
echo "▶ Now load cardwise-extension in Chrome:"
echo "   chrome://extensions → Load unpacked → Select cardwise-extension folder"
