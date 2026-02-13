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

### Local Testing

```bash
# Start development server with hot reload
npm start

# In another terminal, test with MCP Inspector
npm run inspector
```

### ChatGPT Integration

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
npm run build      # Build server + UI
npm start          # Dev mode with watch
npm run inspector  # Test with MCP Inspector
```

### Testing Flow

1. **MCP Inspector** - Test tools and UI locally
2. **ngrok** - Expose local server via HTTPS
3. **ChatGPT** - End-to-end testing with real model

## 📚 Resources

- [MCP Apps Documentation](https://developers.openai.com/apps-sdk/)
- [MCP Inspector Tool](https://modelcontextprotocol.io/docs/tools/inspector)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Developer Mode Guide](https://help.openai.com/en/articles/12584461-developer-mode-apps-and-full-mcp-connectors-in-chatgpt-beta)

## 📝 License

MIT

## 🤝 Contributing

This is a learning project. Feel free to fork and experiment!
