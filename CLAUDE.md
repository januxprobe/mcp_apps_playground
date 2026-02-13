# Echo ChatGPT App - Claude Instructions

## Project Overview
This is a learning project demonstrating the MCP Apps architecture for ChatGPT. It implements a simple "echo" tool that takes text input and displays it in an interactive UI widget.

## Architecture
- **MCP Server** (main.ts, server.ts): Exposes `/mcp` endpoint, registers tools and resources
- **UI Component** (echo-widget.html, src/echo-widget.ts): Runs in iframe, communicates via JSON-RPC
- **Tool Flow**: ChatGPT → MCP Server → UI rendering

## Tech Stack
- **Runtime**: Node.js (version locked via .nvmrc)
- **Language**: TypeScript
- **MCP SDK**: @modelcontextprotocol/ext-apps + @modelcontextprotocol/sdk
- **Server**: Express with CORS
- **UI Bundler**: Vite with vite-plugin-singlefile
- **Transport**: StreamableHTTPServerTransport (HTTP) + StdioServerTransport (local testing)

## Development Workflow

### Setup
```bash
nvm use              # Switch to project's Node.js version
npm install          # Install dependencies
```

### Development
```bash
npm run build        # Build server + UI
npm start            # Start dev server with hot reload
```

### Testing
```bash
# Local testing with MCP Inspector
npm run inspector

# Remote testing (separate terminals)
npm start            # Terminal 1: Start server
ngrok http 3001      # Terminal 2: Create tunnel
```

## Key Files
- `server.ts`: Tool registration, handlers, resource serving
- `main.ts`: HTTP/STDIO transport setup
- `src/echo-widget.ts`: UI bridge logic with App class
- `vite.config.ts`: Single-file HTML bundling config

## MCP Apps Patterns

### Tool Registration
```typescript
registerAppTool(server, "tool_name", {
  title: "Human Title",
  inputSchema: { param: z.string() },
  _meta: { ui: { resourceUri: "ui://path" } }
}, async (args) => ({
  structuredContent: { /* model + UI data */ },
  content: [{ type: "text", text: "narrative" }],
  _meta: { /* UI-only data */ }
}));
```

### UI Bridge Communication
```typescript
const app = new App({ name: "Widget", version: "1.0.0" });
app.ontoolresult = (result) => { /* handle data */ };
await app.callServerTool({ name: "tool", arguments: {} });
app.connect();
```

### Resource Serving
```typescript
registerAppResource(server, "name", resourceUri,
  { mimeType: RESOURCE_MIME_TYPE },
  async () => ({
    contents: [{ uri, mimeType, text: html }]
  })
);
```

## Important Conventions
- **resourceUri versioning**: Change URI (e.g., `ui://echo/v2`) for breaking UI changes
- **No manifest file**: Metadata embedded in tool `_meta` (modern MCP Apps pattern)
- **Three-part response**: `structuredContent` (model+UI), `content` (model narrative), `_meta` (UI only)
- **Single HTML bundle**: All CSS/JS inlined for simplified deployment
- **Idempotent handlers**: Tools must handle retries safely

## Testing Checklist
- ✅ Server starts on port 3001
- ✅ MCP Inspector lists tools and resources
- ✅ Tool calls return expected data structure
- ✅ Widget renders in Inspector iframe
- ✅ Interactive elements (buttons) work
- ✅ ChatGPT connector configured via ngrok
- ✅ End-to-end: ChatGPT prompt → tool call → UI render

## Common Issues
- **CORS errors**: Ensure `app.use(cors())` in main.ts
- **Widget blank**: Verify MIME type is `text/html;profile=mcp-app`
- **Tool not called**: Improve tool description/title for model understanding
- **Stale UI**: Version resourceUri after changes

## Useful Commands
```bash
nvm use                    # Switch to project Node version
npm run build              # Full build (TypeScript + Vite)
npm start                  # Dev mode with watch
npm run inspector          # Test with MCP Inspector
npx @modelcontextprotocol/inspector node dist/main.js --stdio  # Full inspector command
ngrok http 3001            # Expose local server
```

## Resources
- [MCP Apps Docs](https://developers.openai.com/apps-sdk/)
- [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector)
- [Repository](https://github.com/januxprobe/chatgpt_apps_playground)
