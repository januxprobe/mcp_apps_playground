#!/bin/bash

# Echo ChatGPT App Startup Script
# This script builds and starts the MCP server with ngrok for ChatGPT integration

set -e  # Exit on error

# Change to project root directory (parent of scripts/)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_ROOT"

echo "🚀 Starting Echo ChatGPT App..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verify we're in the project root
if [ ! -f "package.json" ]; then
    echo "❌ Error: Could not find project root directory"
    exit 1
fi

# Check dependencies
echo "📋 Checking dependencies..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi
echo "✅ Node.js $(node -v)"

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi
echo "✅ npm $(npm -v)"

if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok not found. Please install ngrok first (brew install ngrok/ngrok/ngrok)"
    exit 1
fi
echo "✅ ngrok installed"

echo ""

# Kill any existing processes on port 3001
echo "🧹 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
pkill -f "ngrok" 2>/dev/null || true
sleep 2

# Build the project
echo "🔨 Building project..."
npm run build
echo ""

# Start the server in background
echo "🌐 Starting MCP server on port 3001..."
npm start > server.log 2>&1 &
SERVER_PID=$!
sleep 5

# Check if server started successfully
if ! lsof -ti:3001 > /dev/null; then
    echo "❌ Server failed to start. Check server.log for details."
    cat server.log
    exit 1
fi
echo "✅ MCP server running (PID: $SERVER_PID)"
echo ""

# Start ngrok in background
echo "🌍 Starting ngrok tunnel..."
ngrok http 3001 > ngrok.log 2>&1 &
NGROK_PID=$!
sleep 3

# Get ngrok URL
NGROK_URL=""
for i in {1..10}; do
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)
    if [ ! -z "$NGROK_URL" ]; then
        break
    fi
    sleep 1
done

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL. Check ngrok.log for details."
    exit 1
fi

echo -e "${GREEN}✅ ngrok tunnel created${NC}"
echo ""

# Display setup instructions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Echo ChatGPT App is ready!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}📋 ChatGPT Configuration:${NC}"
echo ""
echo "1. Open ChatGPT → Settings → Connectors → Create"
echo "2. Enter the following details:"
echo ""
echo -e "   ${YELLOW}Name:${NC}        Echo MCP App"
echo -e "   ${YELLOW}Description:${NC} Interactive echo tool with widget"
echo -e "   ${YELLOW}URL:${NC}         ${GREEN}${NGROK_URL}/mcp${NC}"
echo ""
echo "3. Save and enable Developer Mode (if not already enabled)"
echo "4. Start a new chat and ask:"
echo -e "   ${YELLOW}\"Echo back 'Hello from my ChatGPT app!'\"${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}📊 Server Information:${NC}"
echo "   • MCP Server: http://localhost:3001/mcp"
echo "   • ngrok URL:  ${NGROK_URL}"
echo "   • Server PID: ${SERVER_PID}"
echo "   • ngrok PID:  ${NGROK_PID}"
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo "   • Server: tail -f server.log"
echo "   • ngrok:  tail -f ngrok.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    ./scripts/stop.sh
    exit 0
}

# Set trap for Ctrl+C
trap cleanup INT TERM

# Keep script running and check if processes are still alive
while true; do
    if ! kill -0 $SERVER_PID 2>/dev/null; then
        echo "❌ Server stopped unexpectedly"
        cleanup
    fi
    if ! kill -0 $NGROK_PID 2>/dev/null; then
        echo "❌ ngrok stopped unexpectedly"
        cleanup
    fi
    sleep 2
done
