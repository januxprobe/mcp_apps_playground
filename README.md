# Echo ChatGPT App

A learning project demonstrating the MCP (Model Context Protocol) Apps architecture for ChatGPT. This app implements a simple "echo" tool that takes text input and displays it in an interactive UI widget within ChatGPT.

## 🎯 Purpose

Learn how to build ChatGPT apps using the modern MCP Apps SDK (January 2026), understanding:
- MCP server implementation with tool registration
- UI components in iframes communicating via JSON-RPC
- Three-part response architecture (structuredContent, content, _meta)
- Single-file HTML bundling for simplified deployment

## 🏗️ Architecture

```
ChatGPT ←→ MCP Server ←→ UI Component
   ↓         (HTTP /mcp)      (iframe)
   │                              ↓
   └──────── JSON-RPC ─────────→ App Bridge
            (postMessage)
```

**Components:**
1. **MCP Server** (`main.ts`, `server.ts`) - Exposes tools via `/mcp` endpoint
2. **UI Widget** (`echo-widget.html`, `src/echo-widget.ts`) - Interactive interface in ChatGPT
3. **ChatGPT Model** - Orchestrates tool calls based on user prompts

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (project uses v24.8.0)
- npm 7+
- ChatGPT Plus/Pro (for testing with Developer Mode)

### Installation

```bash
# Clone the repository
git clone https://github.com/januxprobe/chatgpt_apps_playground.git
cd chatgpt_apps_playground

# Install dependencies
npm install

# Build the project
npm run build
```

### Quick Start with Automated Script (Recommended)

```bash
./start-chatgpt-app.sh
```

This script will:
- ✅ Build the project
- ✅ Start the MCP server on port 3001
- ✅ Start ngrok tunnel automatically
- ✅ Display the ChatGPT configuration URL

Then follow the on-screen instructions to configure ChatGPT!

**To stop:** Press `Ctrl+C` or run `./stop-chatgpt-app.sh`

### Manual Setup (Alternative)

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Create ngrok tunnel:**
   ```bash
   ngrok http 3001
   ```

3. **Configure ChatGPT:**
   - Open ChatGPT → Settings → Connectors → Create
   - Name: "Echo MCP App"
   - URL: `https://[your-ngrok-id].ngrok.app/mcp`
   - Enable Developer Mode in Advanced settings

4. **Test:**
   - Ask ChatGPT: "Echo back 'Hello from ChatGPT!'"
   - The widget should render with your text and metadata

## 📁 Project Structure

```
chatgpt_apps_playground/
├── main.ts                   # Server entry point (HTTP + STDIO)
├── server.ts                 # Tool & resource registration
├── echo-widget.html          # UI entry point
├── src/
│   └── echo-widget.ts        # UI logic with MCP bridge
├── vite.config.ts            # Single-file HTML bundler
├── tsconfig.json             # TypeScript base config
├── tsconfig.server.json      # Server compilation config
└── package.json              # Dependencies and scripts
```

## 🔑 Key Concepts

### No Separate Manifest
Modern MCP Apps don't use manifest files. UI links are embedded in tool definitions:
```typescript
_meta: { ui: { resourceUri: "ui://echo/widget.html" } }
```

### Three-Part Response
Tool handlers return:
- `structuredContent` - Data for both model and UI
- `content` - Optional narrative for the model
- `_meta` - Sensitive/large data only for UI

### Single HTML Bundle
Vite bundles HTML, CSS, and JavaScript into one file for simplified deployment and faster loading.

## 🛠️ Development

### Commands

```bash
npm run build      # Build server + UI (TypeScript + Vite)
npm start          # Start dev server with hot reload (port 3001)
npm run inspector  # Launch MCP Inspector (limited MCP Apps support)
```

**Note:** For full widget testing, use ChatGPT via ngrok instead of the inspector.

### Testing Flow

**Primary Method: ChatGPT via ngrok**
1. Start the server: `npm start`
2. Expose via ngrok: `ngrok http 3001`
3. Configure ChatGPT connector with ngrok URL
4. Test end-to-end with the real model

**Alternative: MCP Inspector (Limited Support)**

⚠️ **Note:** The MCP Inspector has limited support for MCP Apps with UI components. It can:
- ✅ Connect to the server and list tools
- ✅ Load the widget UI in sandbox
- ❌ Properly execute tools and send results to widgets

For full testing of the echo widget and interactive features, use ChatGPT via ngrok.

## 🔧 Troubleshooting

### STDIO Mode Logging
In STDIO mode, `stdout` is reserved for JSON-RPC communication. All logging must use `console.error()` (stderr) instead of `console.log()`. This is already configured correctly in the codebase.

### Browser Extensions
Browser extensions like Grammarly can interfere with JSON-RPC validation by adding extra properties to messages. Disable extensions when testing the widget in the browser.

### MCP Inspector Issues
If you encounter "sandbox not loaded" errors or widgets showing "Loading..." indefinitely:
- This is a known limitation of the MCP Inspector with MCP Apps
- Use ChatGPT via ngrok for full testing instead

### Port Already in Use
If port 3001 is already in use:
```bash
lsof -ti:3001 | xargs kill -9
```

## 📚 Resources

- [MCP Apps Documentation](https://developers.openai.com/apps-sdk/)
- [MCP Inspector Tool](https://modelcontextprotocol.io/docs/tools/inspector)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Developer Mode Guide](https://help.openai.com/en/articles/12584461-developer-mode-apps-and-full-mcp-connectors-in-chatgpt-beta)

## 📝 License

MIT

## 🤝 Contributing

This is a learning project. Feel free to fork and experiment!
