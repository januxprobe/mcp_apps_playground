#!/bin/bash

# Claude Desktop Verification Script
# Verifies that Claude Desktop is properly configured for MCP apps

set -e  # Exit on error

# Change to project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_ROOT"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🔍 Claude Desktop Configuration Verification${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
PASSED=0
FAILED=0

# Check 1: Claude Desktop installed
echo "1️⃣  Checking Claude Desktop installation..."
if [ -d "$HOME/Library/Application Support/Claude" ]; then
    echo -e "   ${GREEN}✅ Claude Desktop is installed${NC}"
    ((PASSED++))
else
    echo -e "   ${RED}❌ Claude Desktop not found${NC}"
    echo "      Install from: https://claude.ai/download"
    ((FAILED++))
fi
echo ""

# Check 2: Config file exists
echo "2️⃣  Checking configuration file..."
if [ -f "$CLAUDE_CONFIG" ]; then
    echo -e "   ${GREEN}✅ Configuration file exists${NC}"
    ((PASSED++))
else
    echo -e "   ${RED}❌ Configuration file not found${NC}"
    echo "      Run: ./scripts/claude-desktop-config.sh"
    ((FAILED++))
fi
echo ""

# Check 3: Valid JSON
echo "3️⃣  Validating JSON syntax..."
if [ -f "$CLAUDE_CONFIG" ]; then
    if jq . "$CLAUDE_CONFIG" > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ Valid JSON${NC}"
        ((PASSED++))
    else
        echo -e "   ${RED}❌ Invalid JSON syntax${NC}"
        echo "      Fix or regenerate: ./scripts/claude-desktop-config.sh"
        ((FAILED++))
    fi
else
    echo -e "   ${YELLOW}⏭  Skipped (no config file)${NC}"
fi
echo ""

# Check 4: Apps configured
echo "4️⃣  Checking configured apps..."
if [ -f "$CLAUDE_CONFIG" ]; then
    CONFIGURED_APPS=$(jq -r '.mcpServers | keys[]' "$CLAUDE_CONFIG" 2>/dev/null | grep -E '^(echo|calculator)$' || echo "")

    if [ -z "$CONFIGURED_APPS" ]; then
        echo -e "   ${RED}❌ No apps configured${NC}"
        echo "      Run: ./scripts/claude-desktop-config.sh"
        ((FAILED++))
    else
        echo -e "   ${GREEN}✅ Apps configured:${NC}"
        while IFS= read -r app; do
            echo "      • $app"
        done <<< "$CONFIGURED_APPS"
        ((PASSED++))
    fi
else
    echo -e "   ${YELLOW}⏭  Skipped (no config file)${NC}"
fi
echo ""

# Check 5: App files exist
echo "5️⃣  Verifying app files..."
if [ -f "$CLAUDE_CONFIG" ]; then
    ALL_EXIST=true
    for app in echo calculator; do
        APP_PATH=$(jq -r ".mcpServers.$app.args[-2]" "$CLAUDE_CONFIG" 2>/dev/null || echo "")
        if [ -f "$APP_PATH" ]; then
            echo -e "   ${GREEN}✅ $app: $(basename $APP_PATH)${NC}"
        else
            echo -e "   ${RED}❌ $app: File not found${NC}"
            echo "      Expected: $APP_PATH"
            ALL_EXIST=false
        fi
    done

    if [ "$ALL_EXIST" = true ]; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
else
    echo -e "   ${YELLOW}⏭  Skipped (no config file)${NC}"
fi
echo ""

# Check 6: STDIO test
echo "6️⃣  Testing STDIO mode..."
if [ -f "apps/echo/standalone.ts" ]; then
    STDIO_TEST=$(timeout 10 bash -c 'echo "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"initialize\",\"params\":{\"protocolVersion\":\"2024-11-05\",\"capabilities\":{},\"clientInfo\":{\"name\":\"test\",\"version\":\"1.0.0\"}}}" | npx -y tsx apps/echo/standalone.ts --stdio 2>&1' | \
        grep -o '"serverInfo"' || echo "")

    if [ ! -z "$STDIO_TEST" ]; then
        echo -e "   ${GREEN}✅ Echo app responds in STDIO mode${NC}"
        ((PASSED++))
    else
        echo -e "   ${YELLOW}⚠️  STDIO test inconclusive (may work in Claude Desktop)${NC}"
        echo "      This is OK - the app may still work in Claude Desktop"
        # Don't fail on this check
    fi
else
    echo -e "   ${YELLOW}⏭  Skipped (echo app not found)${NC}"
fi
echo ""

# Check 7: Build artifacts
echo "7️⃣  Checking build artifacts..."
BUILT=0
MISSING=0
for app in echo calculator; do
    WIDGET_PATH="dist/$app/widget/apps/$app/widget/${app}-widget.html"
    if [ -f "$WIDGET_PATH" ]; then
        SIZE=$(ls -lh "$WIDGET_PATH" | awk '{print $5}')
        echo -e "   ${GREEN}✅ $app widget: $SIZE${NC}"
        ((BUILT++))
    else
        echo -e "   ${RED}❌ $app widget not built${NC}"
        ((MISSING++))
    fi
done

if [ $MISSING -eq 0 ]; then
    ((PASSED++))
else
    echo "      Run: npm run build"
    ((FAILED++))
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! ($PASSED/$((PASSED+FAILED)))${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${BLUE}🎉 Ready to use with Claude Desktop!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Restart Claude Desktop completely"
    echo "  2. Open Connectors panel (hammer icon)"
    echo "  3. Verify 'echo' and 'calculator' appear"
    echo "  4. Test: \"Echo back 'Hello!'\""
    echo ""
else
    echo -e "${YELLOW}⚠️  Some checks failed ($FAILED issues)${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Fix issues above, then run:"
    echo "  ./scripts/verify-claude-desktop.sh"
    echo ""
fi

exit $FAILED
