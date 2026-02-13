# ChatGPT Apps Playground

A multi-app playground for learning and experimenting with ChatGPT MCP Apps. Build, test, and deploy multiple interactive ChatGPT apps from one repository.

## 🎮 What's This?

This is a learning playground that demonstrates the MCP (Model Context Protocol) Apps architecture for ChatGPT. Instead of just one app, you can build and run **multiple apps** independently or together, making it easy to experiment with different tools and UI patterns.

**Currently includes:**
- 🔊 **Echo App** - Text echo with character/word counts (purple gradient UI)
- 🧮 **Calculator App** - Arithmetic operations: add, subtract, multiply, divide (blue/green gradient UI)
- 📦 **App Template** - Scaffolding for creating new apps in ~5 minutes

## 🎯 Purpose

Learn how to build ChatGPT apps using the modern MCP Apps SDK (January 2026):
- Multi-app architecture with shared infrastructure
- MCP server implementation with tool registration
- UI components in iframes communicating via JSON-RPC
- Three-part response architecture (structuredContent, content, _meta)
- Single-file HTML bundling for simplified deployment
- App scaffolding and automation

## 🏗️ Architecture

```
ChatGPT ←→ MCP Server ←→ UI Component
   ↓         (HTTP /mcp)      (iframe)
   │                              ↓
   └──────── JSON-RPC ─────────→ App Bridge
            (postMessage)
```

**Key Components:**
- **Apps** - Self-contained ChatGPT apps (echo, calculator, etc.)
- **Infrastructure** - Shared, reusable MCP server code
- **Scripts** - Automation for building, running, and creating apps

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (project uses v24.8.0, locked via `.nvmrc`)
- npm 7+
- ngrok (install: `brew install ngrok/ngrok/ngrok`)
- ChatGPT Plus/Pro with Developer Mode enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/januxprobe/chatgpt_apps_playground.git
cd chatgpt_apps_playground

# Use correct Node.js version (if using nvm)
nvm use

# Install dependencies
npm install
```

### Run an App (Recommended)

**Start the calculator app:**
```bash
./scripts/start-app.sh calculator
```

**Or start the echo app:**
```bash
./scripts/start-app.sh echo
```

This script will:
- ✅ Build the app
- ✅ Start the MCP server on port 3001
- ✅ Start ngrok tunnel automatically
- ✅ Display the ChatGPT configuration URL

**Then:**
1. Copy the ngrok URL from the output
2. Open ChatGPT → Settings → Connectors → Create
3. Enter the details shown in the script output
4. Start chatting and try the app's tools!

**Example prompts:**
- Calculator: `"Add 15 and 27"` or `"Divide 100 by 5"`
- Echo: `"Echo back 'Hello from my playground!'"`

**To stop:** Press `Ctrl+C` or run `./scripts/stop.sh`

## 🎮 Available Apps

### 🔊 Echo App
Simple text echo with metadata display.

**Tools:**
- `echo` - Echoes text with character and word counts

**Features:**
- Purple gradient UI
- Character and word count
- Timestamp display
- "Echo Again" interactive button

**Start:** `./scripts/start-app.sh echo`

---

### 🧮 Calculator App
Basic arithmetic operations with interactive UI.

**Tools:**
- `add` - Add two numbers
- `subtract` - Subtract two numbers
- `multiply` - Multiply two numbers
- `divide` - Divide two numbers (with zero-division handling)

**Features:**
- Blue/green gradient UI
- Operation display with equation
- Interactive buttons for each operation
- Error handling

**Start:** `./scripts/start-app.sh calculator`

---

## 🛠️ Creating Your Own App

### Quick Method (5 minutes)

```bash
./scripts/new-app.sh myapp
```

This will:
1. Copy the template to `apps/myapp/`
2. Prompt for app details (name, tool name, etc.)
3. Replace all placeholders automatically
4. Add build scripts to `package.json`
5. Create a working skeleton ready to customize

**Then:**
1. Edit `apps/myapp/server.ts` - Implement your tool logic
2. Edit `apps/myapp/widget/myapp-widget.html` - Design your UI
3. Edit `apps/myapp/widget/myapp-widget.ts` - Add UI logic
4. Test: `./scripts/start-app.sh myapp`

### Manual Method

See the template documentation: `apps/_template/README.md`

## 📁 Project Structure

```
chatgpt_apps_playground/
├── apps/                           # All applications
│   ├── echo/
│   │   ├── server.ts              # Echo MCP server
│   │   ├── standalone.ts          # Entry point
│   │   └── widget/
│   │       ├── echo-widget.html
│   │       └── echo-widget.ts
│   ├── calculator/
│   │   ├── server.ts              # Calculator MCP server
│   │   ├── standalone.ts
│   │   └── widget/
│   │       ├── calculator-widget.html
│   │       └── calculator-widget.ts
│   └── _template/                 # Template for new apps
│       ├── README.md
│       ├── server.ts.template
│       ├── standalone.ts.template
│       └── widget/
├── infrastructure/                # Shared infrastructure
│   └── server/
│       ├── main.ts               # Generic HTTP/STDIO server
│       ├── types.ts              # TypeScript interfaces
│       ├── multi-app.ts          # Multi-app server (WIP)
│       └── multi-app-entry.ts
├── scripts/
│   ├── start-app.sh              # Start any app
│   ├── new-app.sh                # Create new app
│   ├── build-app.sh              # Build specific app
│   ├── start-multi.sh            # Start all apps (WIP)
│   └── stop.sh                   # Stop all services
├── dist/                         # Build output
│   ├── infrastructure/
│   ├── echo/
│   └── calculator/
├── vite.app.config.ts            # Widget build config
├── tsconfig.json                 # Base TypeScript config
├── tsconfig.app.json             # App compilation
├── tsconfig.infrastructure.json  # Infrastructure compilation
└── package.json                  # Dependencies and scripts
```

## 🛠️ Development

### Build Commands

```bash
npm run build                # Build all apps + infrastructure
npm run build:echo           # Build echo app only
npm run build:calculator     # Build calculator app only
npm run build:infrastructure # Build infrastructure only
```

### Development Mode (with hot reload)

```bash
npm run start:echo           # Echo app dev mode
npm run start:calculator     # Calculator app dev mode
```

### Testing with MCP Inspector

```bash
npm run inspector:echo       # Test echo with MCP Inspector
npm run inspector:calculator # Test calculator with MCP Inspector
```

⚠️ **Note:** MCP Inspector has limited support for MCP Apps with UI components. For full testing, use ChatGPT via ngrok.

### Scripts

```bash
./scripts/start-app.sh <app>    # Start app with ngrok
./scripts/build-app.sh <app>    # Build specific app
./scripts/new-app.sh <app-id>   # Create new app from template
./scripts/stop.sh               # Stop all services
```

## 🔑 Key Concepts

### Multi-App Architecture

Each app is **self-contained** with its own:
- `server.ts` - MCP server with tool registration
- `standalone.ts` - Entry point for running independently
- `widget/` - UI component (HTML + TypeScript)

Apps share the **infrastructure**:
- Generic HTTP/STDIO transport (`infrastructure/server/main.ts`)
- Type definitions (`infrastructure/server/types.ts`)
- Build system (Vite, TypeScript configs)

### No Separate Manifest

Modern MCP Apps don't use manifest files. UI links are embedded in tool definitions:
```typescript
_meta: { ui: { resourceUri: "ui://calculator/widget.html" } }
```

### Three-Part Response

Tool handlers return:
- `structuredContent` - Data for **both** model and UI (guaranteed to reach widget)
- `content` - Optional narrative for the model
- `_meta` - UI-only data (may not be passed by ChatGPT)

**Important:** Always put critical data in `structuredContent`, not just `_meta`!

### Single HTML Bundle

Vite with `vite-plugin-singlefile` bundles HTML, CSS, and JavaScript into one file for simplified deployment.

## 🔧 Troubleshooting

### Port Already in Use

```bash
lsof -ti:3001 | xargs kill -9
```

Or use the stop script:
```bash
./scripts/stop.sh
```

### STDIO Mode Logging

In STDIO mode, `stdout` is reserved for JSON-RPC communication. All logging must use `console.error()` (stderr) instead of `console.log()`.

### Widget Not Updating

After making changes to UI code:
1. Rebuild: `npm run build:<app-name>`
2. Restart the server
3. **Refresh the connector in ChatGPT settings** to pick up changes

### MCP Inspector Issues

If you encounter "sandbox not loaded" errors or widgets showing "Loading..." indefinitely:
- This is a known limitation of the MCP Inspector with MCP Apps
- Use ChatGPT via ngrok for full testing instead

### Browser Extensions

Browser extensions like Grammarly can interfere with JSON-RPC validation. Disable extensions when testing widgets in the browser.

## 📚 Resources

- [MCP Apps Documentation](https://developers.openai.com/apps-sdk/)
- [MCP Apps Quickstart](https://developers.openai.com/apps-sdk/quickstart/)
- [Build MCP Server Guide](https://developers.openai.com/apps-sdk/build/mcp-server/)
- [MCP Inspector Tool](https://modelcontextprotocol.io/docs/tools/inspector)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Developer Mode Guide](https://help.openai.com/en/articles/12584461-developer-mode-apps-and-full-mcp-connectors-in-chatgpt-beta)

## 💡 Examples & Inspiration

Looking for ideas for your next app? Try building:

- 🌤️ **Weather App** - Get weather for locations
- 📝 **Note Taker** - Save and retrieve notes
- 🎲 **Dice Roller** - RPG dice with custom rules
- 📊 **Data Visualizer** - Charts from data
- 🔍 **Search Tool** - Custom search with filters
- 🎨 **Color Picker** - Color scheme generator
- 📅 **Calendar Helper** - Date calculations
- 🔢 **Unit Converter** - Convert between units

Use `./scripts/new-app.sh <app-name>` to get started!

## 📝 License

MIT

## 🤝 Contributing

This is a learning project - feel free to fork and experiment! Pull requests welcome.

## 🙏 Acknowledgments

Built with:
- [MCP SDK](https://github.com/modelcontextprotocol/sdk) - Model Context Protocol
- [Vite](https://vitejs.dev/) - Fast build tool
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Express](https://expressjs.com/) - HTTP server
- [Zod](https://zod.dev/) - Schema validation
