#!/bin/bash

# Claude Desktop Configuration Script
# Automatically configures Claude Desktop to use MCP apps from this project

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
echo -e "${BLUE}🔧 Claude Desktop MCP Apps Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Detect Claude Desktop config location
CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"

# Check if Claude Desktop is installed
if [ ! -d "$HOME/Library/Application Support/Claude" ]; then
    echo -e "${RED}❌ Claude Desktop not found${NC}"
    echo ""
    echo "Please install Claude Desktop from:"
    echo "  https://claude.ai/download"
    echo ""
    echo "Note: Claude Pro, Team, or Enterprise subscription required for MCP Apps"
    exit 1
fi

echo -e "${GREEN}✅ Claude Desktop installation detected${NC}"
echo ""

# Detect available apps (excluding _template and files)
echo "📋 Detecting available apps..."
APPS=()
for app_dir in apps/*/; do
    app_name=$(basename "$app_dir")
    # Skip template and non-directories
    if [ "$app_name" != "_template" ] && [ -f "$app_dir/standalone.ts" ]; then
        APPS+=("$app_name")
        echo "   • Found: $app_name"
    fi
done

if [ ${#APPS[@]} -eq 0 ]; then
    echo -e "${RED}❌ No apps found in apps/ directory${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Found ${#APPS[@]} app(s)${NC}"
echo ""

# Build all apps
echo "🔨 Building all apps..."
for app_name in "${APPS[@]}"; do
    echo "   • Building $app_name..."
    npm run build:$app_name > /dev/null 2>&1
done
echo -e "${GREEN}✅ All apps built successfully${NC}"
echo ""

# Backup existing config if it exists
if [ -f "$CLAUDE_CONFIG" ]; then
    BACKUP_FILE="${CLAUDE_CONFIG}.backup-$(date +%Y%m%d-%H%M%S)"
    echo "💾 Backing up existing config..."
    cp "$CLAUDE_CONFIG" "$BACKUP_FILE"
    echo -e "${GREEN}✅ Backup saved: $BACKUP_FILE${NC}"
    echo ""

    # Read existing config to preserve other servers
    EXISTING_SERVERS=$(jq -r '.mcpServers | keys[]' "$CLAUDE_CONFIG" 2>/dev/null || echo "")
else
    echo "📝 Creating new Claude Desktop config..."
    echo ""
    EXISTING_SERVERS=""
fi

# Generate new config
echo "⚙️  Generating MCP server configuration..."

# Start with existing config or empty structure
if [ -f "$CLAUDE_CONFIG" ]; then
    CONFIG=$(cat "$CLAUDE_CONFIG")
else
    CONFIG='{"mcpServers":{},"preferences":{}}'
fi

# Add each app to the config
for app_name in "${APPS[@]}"; do
    APP_PATH="$PROJECT_ROOT/apps/$app_name/standalone.ts"

    # Add or update the app in mcpServers
    CONFIG=$(echo "$CONFIG" | jq \
        --arg name "$app_name" \
        --arg path "$APP_PATH" \
        '.mcpServers[$name] = {
            "command": "npx",
            "args": ["-y", "tsx", $path, "--stdio"]
        }')

    echo "   • Added: $app_name"
done

# Write the updated config
echo "$CONFIG" | jq . > "$CLAUDE_CONFIG"

echo -e "${GREEN}✅ Configuration written${NC}"
echo ""

# Validate JSON
if jq . "$CLAUDE_CONFIG" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Configuration validated (valid JSON)${NC}"
else
    echo -e "${RED}❌ Configuration validation failed${NC}"
    echo "Restoring backup..."
    if [ -f "$BACKUP_FILE" ]; then
        cp "$BACKUP_FILE" "$CLAUDE_CONFIG"
    fi
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Configuration Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}📋 Configured MCP Servers:${NC}"
for app_name in "${APPS[@]}"; do
    echo "   • $app_name"
done
echo ""
echo -e "${YELLOW}⚠️  Next Steps:${NC}"
echo ""
echo "1. ${YELLOW}Completely restart Claude Desktop${NC}"
echo "   (Quit and reopen the application)"
echo ""
echo "2. Check the Connectors panel (hammer icon)"
echo "   You should see: ${GREEN}${APPS[*]}${NC}"
echo ""
echo "3. Test the apps in a conversation:"
for app_name in "${APPS[@]}"; do
    case "$app_name" in
        echo)
            echo "   • Echo: \"Echo back 'Hello Claude!'\""
            ;;
        calculator)
            echo "   • Calculator: \"What is 42 times 17?\""
            ;;
        *)
            echo "   • $app_name: Try using its tools"
            ;;
    esac
done
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}📝 Troubleshooting:${NC}"
echo ""
echo "If apps don't appear:"
echo "  • Verify config: jq . \"$CLAUDE_CONFIG\""
echo "  • Check Claude Desktop logs"
echo "  • Ensure you have Claude Pro/Team/Enterprise subscription"
echo ""
echo "To restore previous config:"
if [ -f "$BACKUP_FILE" ]; then
    echo "  cp \"$BACKUP_FILE\" \"$CLAUDE_CONFIG\""
fi
echo ""
echo "For help:"
echo "  • GitHub: https://github.com/januxprobe/mcp-apps-playground"
echo "  • MCP Docs: https://modelcontextprotocol.io/"
echo ""
