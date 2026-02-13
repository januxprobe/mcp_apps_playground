# ChatGPT Apps Playground - Claude Instructions

## Project Overview
This is a multi-app learning playground demonstrating the MCP Apps architecture for ChatGPT. It allows you to build, test, and run **multiple independent ChatGPT apps** from a single repository, making it easy to experiment with different tools and UI patterns.

**Currently includes:**
- 🔊 **Echo App** - Text echo with character/word counts
- 🧮 **Calculator App** - Arithmetic operations (add, subtract, multiply, divide)
- 📦 **App Template** - Scaffolding for creating new apps in ~5 minutes

## Multi-App Architecture

### Core Principle
**Infrastructure is generic, apps are self-contained.**

```
chatgpt_apps_playground/
├── apps/                    # Self-contained ChatGPT apps
│   ├── echo/               # Echo app
│   ├── calculator/         # Calculator app
│   └── _template/          # Template for new apps
├── infrastructure/         # Shared, reusable code
│   └── server/
│       ├── main.ts        # Generic HTTP/STDIO transport
│       ├── types.ts       # TypeScript interfaces
│       └── multi-app.ts   # Multi-app server (WIP)
├── scripts/               # Automation
│   ├── start-app.sh      # Start single app
│   ├── new-app.sh        # Create new app
│   └── build-app.sh      # Build specific app
└── dist/                 # Build output
    ├── echo/
    ├── calculator/
    └── infrastructure/
```

### App Structure Pattern
Each app is self-contained with:
- **server.ts** - MCP server with tool registration
- **standalone.ts** - Entry point for running independently
- **widget/** - UI component (HTML + TypeScript)

Apps export a standard interface:
```typescript
export const APP_NAME = "My App";
export const APP_VERSION = "1.0.0";
export function createServer(): McpServer { /* ... */ }
```

### Infrastructure Layer
The infrastructure is **generic and reusable**:
- `main.ts` - Accepts a `createServer()` callback, provides HTTP/STDIO transport
- `types.ts` - Shared TypeScript interfaces (AppServerModule, AppConfig)
- `multi-app.ts` - Multi-app server composer (work in progress)

**Key insight:** `infrastructure/server/main.ts` is completely app-agnostic. It never imports app-specific code.

## Tech Stack
- **Runtime**: Node.js 18+ (locked via .nvmrc)
- **Language**: TypeScript
- **MCP SDK**: @modelcontextprotocol/ext-apps + @modelcontextprotocol/sdk
- **Server**: Express with CORS
- **UI Bundler**: Vite with vite-plugin-singlefile
- **Transport**: StreamableHTTPServerTransport (HTTP) + StdioServerTransport (local testing)
- **Validation**: Zod for tool input schemas

## Development Workflow

### Setup
```bash
nvm use              # Switch to project's Node.js version
npm install          # Install dependencies
```

### Build Commands
```bash
npm run build                    # Build all apps + infrastructure
npm run build:echo               # Build echo app only
npm run build:calculator         # Build calculator app only
npm run build:infrastructure     # Build infrastructure only
```

### Running Apps

**Start a single app:**
```bash
./scripts/start-app.sh echo          # Start echo app
./scripts/start-app.sh calculator    # Start calculator app
```
This script automatically:
- Builds the app
- Starts the MCP server on port 3001
- Creates ngrok tunnel
- Displays ChatGPT configuration URL

**Development mode (with hot reload):**
```bash
npm run start:echo           # Echo app dev mode
npm run start:calculator     # Calculator app dev mode
```

**Test with MCP Inspector:**
```bash
npm run inspector:echo       # Test echo with Inspector
npm run inspector:calculator # Test calculator with Inspector
```

**Multi-app server (WIP):**
```bash
npm run start:multi          # Start all apps on one server
```

### Creating a New App

**Quick Method (5 minutes):**
```bash
./scripts/new-app.sh myapp
```

This will:
1. Copy template to `apps/myapp/`
2. Prompt for app details (name, tool name, etc.)
3. Replace all placeholders automatically
4. Add build scripts to package.json
5. Create a working skeleton ready to customize

**Then customize:**
1. Edit `apps/myapp/server.ts` - Implement your tool logic
2. Edit `apps/myapp/widget/myapp-widget.html` - Design your UI
3. Edit `apps/myapp/widget/myapp-widget.ts` - Add UI logic
4. Test: `./scripts/start-app.sh myapp`

**Manual Method:**
See template documentation: `apps/_template/README.md`

## Key Files

### Infrastructure (Reusable)
- `infrastructure/server/main.ts` - Generic HTTP/STDIO server
- `infrastructure/server/types.ts` - Shared TypeScript interfaces
- `infrastructure/server/multi-app.ts` - Multi-app server composer
- `tsconfig.infrastructure.json` - Infrastructure compilation config

### Per-App Files
- `apps/{app}/server.ts` - Tool registration, handlers, resource serving
- `apps/{app}/standalone.ts` - Entry point (HTTP or STDIO)
- `apps/{app}/widget/{app}-widget.html` - UI structure
- `apps/{app}/widget/{app}-widget.ts` - UI bridge logic

### Build System
- `vite.app.config.ts` - Widget bundling (uses APP env var)
- `tsconfig.app.json` - App compilation config
- `package.json` - Per-app build scripts

### Automation
- `scripts/start-app.sh` - One-command app startup with ngrok
- `scripts/new-app.sh` - App scaffolding automation
- `scripts/build-app.sh` - Build specific app
- `scripts/stop.sh` - Stop all services

## MCP Apps Patterns

### Tool Registration
```typescript
registerAppTool(server, "tool_name", {
  title: "Human-Readable Title",
  description: "Clear description for the model",
  inputSchema: {
    param: z.string().describe("Parameter description"),
  },
  annotations: {
    readOnlyHint: true,      // No side effects
    openWorldHint: false,    // Bounded to this app
    destructiveHint: false,  // Non-destructive
  },
  _meta: {
    ui: { resourceUri: "ui://app/widget.html" }
  }
}, async (args) => ({
  structuredContent: {
    // Data for BOTH model and UI (guaranteed to reach widget)
    result: args.param,
  },
  content: [
    { type: "text", text: "Narrative for the model" }
  ],
  _meta: {
    // UI-only data (may not be passed by ChatGPT - use sparingly)
  }
}));
```

**Important:** Always put critical data in `structuredContent`, not just `_meta`. ChatGPT may not pass `_meta` to the widget.

### UI Bridge Communication
```typescript
import { App } from "@modelcontextprotocol/ext-apps/client";

const app = new App({
  name: "My Widget",
  version: "1.0.0",
});

// Handle tool results from server
app.ontoolresult = (result) => {
  const data = result.structuredContent;
  // Update UI with data
};

// Call server tools from UI
async function callTool() {
  const result = await app.callServerTool({
    name: "tool_name",
    arguments: { param: "value" },
  });
  // Handle result
}

// Connect to ChatGPT
app.connect();
```

### Resource Serving
```typescript
registerAppResource(
  server,
  "widget-name",
  resourceUri,  // Must match tool's resourceUri
  { mimeType: RESOURCE_MIME_TYPE },
  async () => {
    const html = await fs.readFile(htmlPath, "utf-8");
    return {
      contents: [{
        uri: resourceUri,
        mimeType: RESOURCE_MIME_TYPE,
        text: html
      }]
    };
  }
);
```

### Standalone Entry Point Pattern
Every app has a `standalone.ts` that supports both HTTP and STDIO:
```typescript
import { startStreamableHTTPServer, startStdioServer } from "../../infrastructure/server/main.js";
import { createServer } from "./server.js";

async function main() {
  if (process.argv.includes("--stdio")) {
    await startStdioServer(createServer);
  } else {
    await startStreamableHTTPServer(createServer);
  }
}

main().catch((e) => {
  console.error("❌ Fatal error:", e);
  process.exit(1);
});
```

## Important Conventions

### Multi-App Conventions
- **App isolation**: Each app is fully independent and can run standalone
- **Shared infrastructure**: Never duplicate server transport logic
- **Standard exports**: All apps export APP_NAME, APP_VERSION, createServer()
- **Consistent naming**: `{app-id}-widget.html`, `{app-id}-widget.ts`

### MCP Apps Conventions
- **resourceUri versioning**: Change URI (e.g., `ui://echo/widget-v2.html`) for breaking UI changes
- **No manifest file**: Metadata embedded in tool `_meta` (modern MCP Apps pattern)
- **Three-part response**: `structuredContent` (model+UI), `content` (model narrative), `_meta` (UI only)
- **Single HTML bundle**: All CSS/JS inlined via vite-plugin-singlefile
- **Idempotent handlers**: Tools must handle retries safely
- **STDIO logging**: Use `console.error()` for logs, not `console.log()` (stdout reserved for JSON-RPC)

## Example Apps

### Echo App (Learning Example)
**Purpose:** Simplest possible app to understand the architecture
**Tools:** `echo` - Echoes text with character/word counts
**UI:** Purple gradient with metadata display
**Pattern:** One tool, one widget, minimal complexity

### Calculator App (Multi-Tool Example)
**Purpose:** Demonstrates multiple tools sharing one widget
**Tools:** `add`, `subtract`, `multiply`, `divide`
**UI:** Blue/green gradient with operation history
**Pattern:** Multiple tools, one widget, state management

### Template (Scaffolding Base)
**Purpose:** Starting point for new apps
**Placeholders:** `{{APP_ID}}`, `{{APP_NAME}}`, `{{TOOL_NAME}}`, etc.
**Usage:** `./scripts/new-app.sh myapp`
**Pattern:** TODO comments guide implementation

## Testing Checklist

### Build Testing
- ✅ `npm run build` succeeds for all apps
- ✅ `dist/{app}/widget/{app}-widget.html` exists
- ✅ Widget HTML is single-file bundle (all CSS/JS inlined)

### Single-App Testing
- ✅ `./scripts/start-app.sh {app}` starts successfully
- ✅ Server listens on port 3001
- ✅ ngrok tunnel created and URL displayed
- ✅ ChatGPT connector configured via ngrok
- ✅ Tool calls work end-to-end
- ✅ Widget renders and displays data correctly
- ✅ Interactive buttons trigger tool calls

### MCP Inspector Testing
- ✅ `npm run inspector:{app}` connects
- ✅ Tools listed with correct schemas
- ✅ Can invoke tools and see responses
- ✅ Widget loads (may have limitations in Inspector)

### Multi-App Testing (WIP)
- ✅ `npm run start:multi` starts
- ✅ All app tools available
- ✅ No tool name conflicts
- ✅ Both widgets render correctly

## Common Issues

### Build Issues
- **TypeScript errors**: Check tsconfig.app.json includes DOM libs for widget code
- **Vite fails**: Ensure APP environment variable is set
- **Missing dist files**: Run full `npm run build` before testing

### Runtime Issues
- **Port 3001 in use**: Run `./scripts/stop.sh` or `lsof -ti:3001 | xargs kill -9`
- **CORS errors**: Ensure `app.use(cors())` in main.ts
- **Widget blank**: Verify MIME type is `text/html;profile=mcp-app`
- **Tool not called**: Improve tool description/title for model understanding
- **Stale UI**: Rebuild app and refresh connector in ChatGPT settings

### MCP Inspector Issues
- **Sandbox not loaded**: Known limitation, use ChatGPT via ngrok instead
- **Widget shows "Loading..."**: Inspector has limited MCP Apps support

### Development Issues
- **Changes not reflected**: Restart server or use dev mode (`npm run start:{app}`)
- **Browser extensions interfere**: Disable Grammarly etc. when testing

## Useful Commands

### Build & Run
```bash
npm run build                       # Build all
npm run build:{app}                 # Build specific app
npm run start:{app}                 # Dev mode with watch
./scripts/start-app.sh {app}        # Full startup with ngrok
./scripts/stop.sh                   # Stop all services
```

### Testing
```bash
npm run inspector:{app}             # MCP Inspector testing
./scripts/start-app.sh {app}        # ChatGPT testing (recommended)
```

### App Management
```bash
./scripts/new-app.sh {app-id}       # Create new app from template
./scripts/build-app.sh {app}        # Build specific app
ls apps/                            # List all apps
```

### Debugging
```bash
lsof -ti:3001 | xargs kill -9       # Kill port 3001
pkill -f ngrok                      # Kill ngrok
tail -f /tmp/{app}-start.log        # View startup logs
```

## Resources
- [MCP Apps Documentation](https://developers.openai.com/apps-sdk/)
- [MCP Apps Quickstart](https://developers.openai.com/apps-sdk/quickstart/)
- [Build MCP Server Guide](https://developers.openai.com/apps-sdk/build/mcp-server/)
- [MCP Inspector Tool](https://modelcontextprotocol.io/docs/tools/inspector)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Developer Mode Guide](https://help.openai.com/en/articles/12584461-developer-mode-apps-and-full-mcp-connectors-in-chatgpt-beta)
- [Repository](https://github.com/januxprobe/chatgpt_apps_playground)
