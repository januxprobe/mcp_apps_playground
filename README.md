# MCP Apps Playground

A multi-app playground for learning and experimenting with MCP Apps. Build, test, and deploy multiple interactive MCP apps from one repository - works on both **ChatGPT** and **Claude Desktop**.

## 🎮 What's This?

This is a learning playground that demonstrates the MCP (Model Context Protocol) Apps architecture. Instead of just one app, you can build and run **multiple apps** independently or together on both **ChatGPT** and **Claude Desktop**, making it easy to experiment with different tools and UI patterns.

**Currently includes:**
- 🔊 **Echo App** - Text echo with character/word counts (purple gradient UI)
- 🧮 **Calculator App** - Arithmetic operations: add, subtract, multiply, divide (blue/green gradient UI)
- 🏥 **Hospi-Copilot** - Production-ready multilingual (EN/NL/FR) hospitalization journey with dropdowns, date picker, insurance data, validation (healthcare UI)
- 📄 **PDF Generator** - Server-side PDF generation with multiple templates, canvas rendering, and downloadable output (purple gradient UI)
- 📁 **File Processor** - Secure file upload with validation, magic number verification, and analysis (purple gradient UI)
- 📦 **App Template** - Scaffolding for creating new apps in ~5 minutes
- 🌐 **Dual-Platform** - Same apps work on ChatGPT and Claude Desktop
- ✅ **ChatGPT Ready** - All apps include CSP and domain configuration for app submission

## 🎯 Purpose

Learn how to build MCP apps using the modern MCP Apps SDK (January 2026) that work on both ChatGPT and Claude Desktop:
- Multi-app architecture with shared infrastructure
- MCP server implementation with tool registration
- UI components in iframes communicating via JSON-RPC
- Three-part response architecture (structuredContent, content, _meta)
- Single-file HTML bundling for simplified deployment
- App scaffolding and automation

## 🏗️ Architecture

**Dual-Platform Design:**
```
ChatGPT (HTTP)  ┐
                ├──→ MCP Server ←→ UI Component (iframe)
Claude (STDIO)  ┘      ↓                ↓
                   JSON-RPC ────────→ App Bridge
                                   (postMessage)
```

**Key Components:**
- **Apps** - Self-contained MCP apps (echo, calculator, etc.)
- **Infrastructure** - Shared, reusable MCP server code (HTTP + STDIO transports)
- **Scripts** - Automation for building, running, and creating apps
- **Unified Standard** - Same codebase works on both ChatGPT and Claude Desktop

## 🚀 Quick Start

### Prerequisites

**For ChatGPT:**
- Node.js 18+ (project uses v24.8.0, locked via `.nvmrc`)
- npm 7+
- ngrok (install: `brew install ngrok/ngrok/ngrok`)
- ChatGPT Plus/Pro with Developer Mode enabled

**For Claude Desktop:**
- Node.js 18+
- npm 7+
- Claude Desktop installed ([download](https://claude.ai/download))
- Claude Pro, Team, or Enterprise subscription

### Installation

```bash
# Clone the repository
git clone https://github.com/januxprobe/mcp-apps-playground.git
cd mcp-apps-playground

# Use correct Node.js version (if using nvm)
nvm use

# Install dependencies
npm install
```

### Choose Your Platform

**Option 1: ChatGPT (HTTP Mode)**

Start the calculator app:
```bash
./scripts/start-app.sh calculator
```

This script will:
- ✅ Build the app
- ✅ Start the MCP server on port 3001
- ✅ Start ngrok tunnel automatically
- ✅ Display the ChatGPT configuration URL

Then:
1. Copy the ngrok URL from the output
2. Open ChatGPT → Settings → Connectors → Create
3. Enter the details shown in the script output
4. Start chatting and try the app's tools!

**To stop:** Press `Ctrl+C` or run `./scripts/stop.sh`

---

**Option 2: Claude Desktop (STDIO Mode)**

Configure all apps for Claude Desktop:
```bash
./scripts/claude-desktop-config.sh
```

Then:
1. **Completely restart Claude Desktop** (quit and reopen)
2. Open Connectors panel (hammer icon)
3. Verify apps appear: `echo`, `calculator`
4. Start chatting and try the apps!

---

**Example prompts (both platforms):**
- Calculator: `"Add 15 and 27"` or `"Divide 100 by 5"`
- Echo: `"Echo back 'Hello from my playground!'"`

## 🌐 Platform Support

This playground supports **both ChatGPT and Claude Desktop** using the MCP Apps unified standard. The same apps work on both platforms without code changes.

### ChatGPT (HTTP Mode - Default)

Run apps via ngrok tunnel for ChatGPT access:

```bash
./scripts/start-app.sh echo
```

This provides:
- Remote access via ngrok public URL
- Hot reload for development
- Server logs for debugging

**Setup:**
1. Run the start script
2. Copy the ngrok URL from output
3. Configure connector in ChatGPT Settings → Connectors
4. Start using the app in conversations

### Claude Desktop (STDIO Mode)

Configure apps as local MCP servers for Claude Desktop:

```bash
./scripts/claude-desktop-config.sh
```

This will:
- ✅ Build all available apps
- ✅ Backup existing Claude Desktop config
- ✅ Add apps to `claude_desktop_config.json`
- ✅ Validate configuration

**Then:**
1. **Completely restart Claude Desktop** (quit and reopen)
2. Open Connectors panel (hammer icon)
3. Verify apps appear: `echo`, `calculator`, `hospi-copilot`
4. Test in a conversation

**Test prompts:**
- Echo: `"Echo back 'Hello Claude!'"`
- Calculator: `"What is 42 times 17?"`
- Hospi-Copilot: `"Start a hospital admission for myself"`

**Requirements:**
- Claude Desktop installed ([download here](https://claude.ai/download))
- Claude Pro, Team, or Enterprise subscription (MCP Apps feature)

### Platform Comparison

| Feature | ChatGPT | Claude Desktop |
|---------|---------|----------------|
| **Transport** | HTTP (remote) | STDIO (local subprocess) |
| **Setup** | One-time ngrok config | JSON config file |
| **Development** | Hot reload with watch mode | Rebuild + restart required |
| **Debugging** | Server logs + ngrok inspector | stderr logs only |
| **Connection** | Public internet required | Local process only |
| **Performance** | Network latency | Near-instant |
| **Security** | Tunneled via ngrok | Isolated local process |

### Verification

Check if Claude Desktop is properly configured:

```bash
./scripts/verify-claude-desktop.sh
```

This verifies:
- Claude Desktop installation
- Configuration file validity
- App files exist
- Build artifacts present
- STDIO mode functionality

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

### 🏥 Hospi-Copilot

Production-ready hospitalization journey assistant for insurance declarations with professional UX.

**Tools:**
- `hospital_journey` - Guide users through a 7-step admission process

**Features:**
- Professional healthcare insurance UI (blue/green theme)
- **Multilingual support** - Full UI in English, Dutch (Nederlands), or French (Français) with automatic language detection
- **Hospital dropdown** - 15 Belgian hospitals with custom option
- **Date picker** - HTML5 date input with constraints (today to +1 year)
- **Full insurance demo data** - Member number, coverage details, third-party payment info
- **Progress indicator** - Visual progress bar showing "Step X of 5"
- **Input validation** - Real-time validation with error messages
- **Tooltips** - Explanations for insurance terms
- **Back navigation** - Navigate backward while preserving state
- State machine with data accumulation
- Demo data generation:
  - Declaration ID (HSP-XXXXXX format)
  - Belgian NISS-style member number
  - Coverage percentage badges (100% or 75%)
  - Third-party payment details
  - Prior authorization flags
  - Additional notes and instructions

**Journey Steps:**
1. **Select Member** - Patient name (auto-filled from context when possible)
2. **Hospital Selection** - Dropdown with 15 Belgian hospitals or custom entry
3. **Admission Details** - Date picker, reason, accident checkbox
4. **Room Type** - Multi-person (100% coverage), single (75%), or day admission
5. **Review** - Complete insurance data with coverage badges and payment details
6. **Submitted** - Declaration ID and full insurance confirmation

**Start:** `./scripts/start-app.sh hospi-copilot`

**Example prompts (in any language):**
- English: "Start a hospital admission for myself"
- Dutch: "Start een ziekenhuisopname voor mezelf"
- French: "Commencer une hospitalisation pour moi-même"
- "I need to declare a hospitalization at UZ Leuven"
- "Hospital admission for knee surgery"

---

### 📄 PDF Generator

Generate professional PDF documents from templates with server-side rendering and interactive preview.

**Tools:**
- `generate_pdf` - Creates PDF from template and data

**Features:**
- **Server-side PDF generation** using pdfkit
- **Multiple templates** - Simple document and invoice layouts
- **PDF.js canvas rendering** - View PDFs with page navigation
- **Multi-page support** - Previous/Next navigation buttons
- **Download workflow** - Copy blob URL to browser to view/download
- **File metadata display** - Filename, size, template info
- **Base64 data transmission** - Secure PDF delivery to widget
- **CSP-compliant** - PDF.js worker loaded from CDN

**Templates:**
- **Simple** - Basic document with title, content, and footer
- **Invoice** - Line items with amounts and total calculation

**Start:** `./scripts/start-app.sh pdf-generator`

**Example prompts:**
- "Generate a simple PDF titled 'Meeting Notes' with content 'Discussed Q4 objectives'"
- "Create an invoice PDF for Project XYZ with 3 items"
- "Generate a PDF document called 'Report' with some example text"

**Note:** Currently works in ChatGPT. Claude Desktop support under investigation (see `apps/pdf-generator/docs/KNOWN_ISSUES.md`).

---

### 📁 File Processor

Secure file upload and processing with comprehensive validation and analysis.

**Tools:**
- `process_file` - Validates and processes uploaded files

**Features:**
- **Secure file validation** - MIME type and magic number verification
- **Multiple file format support** - Images (PNG, JPEG, GIF), PDFs, text files, CSV, JSON
- **Magic number detection** - 15+ file signature patterns to prevent file type spoofing
- **Drag-and-drop upload** - Modern HTML5 File API with drag events
- **Three processing operations**:
  - **Analyze** - Full file analysis with type-specific insights
  - **Validate** - Security checks only
  - **Metadata** - Extract file info, size, checksum
- **SHA-256 checksums** - Content integrity verification
- **Filename sanitization** - Path traversal prevention, unsafe character removal
- **File size limits** - Configurable max size (10MB default)
- **Base64 transmission** - Secure file content delivery
- **Real-time feedback** - Loading states, error messages, success indicators

**Security measures:**
- ✅ MIME type validation against whitelist
- ✅ Magic number verification (actual file signature)
- ✅ File size limit enforcement
- ✅ Filename sanitization (no path traversal, null bytes)
- ✅ Content integrity via SHA-256
- ✅ No server-side file storage

**Start:** `./scripts/start-app.sh file-processor`

**Example prompts:**
- "Process this image file" (then upload via drag-and-drop)
- "Validate my PDF document" (select from file picker)
- "Analyze this text file and show me the metadata"

**Documentation:** See `apps/file-processor/docs/file-upload-patterns.md` for comprehensive implementation guide.

**Note:** Currently works in ChatGPT. Claude Desktop support under investigation (see `apps/file-processor/docs/KNOWN_ISSUES.md`).

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
mcp-apps-playground/
├── docs/                          # General documentation
│   └── CLAUDE_DESKTOP_COMPATIBILITY.md
├── apps/                          # All applications
│   ├── echo/
│   │   ├── server.ts              # Echo MCP server
│   │   ├── standalone.ts          # Entry point
│   │   ├── docs/                  # Echo-specific docs
│   │   └── widget/
│   │       ├── echo-widget.html
│   │       └── echo-widget.ts
│   ├── calculator/
│   │   ├── server.ts              # Calculator MCP server
│   │   ├── standalone.ts
│   │   ├── docs/                  # Calculator-specific docs
│   │   └── widget/
│   │       ├── calculator-widget.html
│   │       └── calculator-widget.ts
│   ├── hospi-copilot/
│   │   ├── server.ts              # Hospitalization journey MCP server
│   │   ├── standalone.ts
│   │   ├── docs/                  # Hospi-specific docs
│   │   └── widget/
│   │       ├── hospi-copilot-widget.html
│   │       └── hospi-copilot-widget.ts
│   ├── pdf-generator/
│   │   ├── server.ts              # PDF generation MCP server
│   │   ├── standalone.ts
│   │   ├── docs/                  # PDF generator-specific docs
│   │   │   └── KNOWN_ISSUES.md    # Claude Desktop compatibility notes
│   │   └── widget/
│   │       ├── pdf-generator-widget.html
│   │       └── pdf-generator-widget.ts
│   ├── file-processor/
│   │   ├── server.ts              # File upload/processing MCP server
│   │   ├── standalone.ts
│   │   ├── docs/                  # File processor-specific docs
│   │   │   └── file-upload-patterns.md  # Complete file upload guide
│   │   ├── tests/                 # File handling tests
│   │   │   └── file-handling.test.ts
│   │   └── widget/
│   │       ├── file-processor-widget.html
│   │       └── file-processor-widget.ts
│   └── _template/                 # Template for new apps
│       ├── README.md
│       ├── server.ts.template
│       ├── standalone.ts.template
│       └── widget/
├── infrastructure/                # Shared infrastructure
│   └── server/
│       ├── main.ts                # Generic HTTP/STDIO server
│       ├── types.ts               # TypeScript interfaces
│       ├── i18n.ts                # Internationalization utilities
│       └── utils/
│           └── file-handling.ts   # File upload & validation utilities
├── scripts/
│   ├── start-app.sh               # Start any app
│   ├── new-app.sh                 # Create new app
│   ├── build-app.sh               # Build specific app
│   └── stop.sh                    # Stop all services
├── dist/                          # Build output
│   ├── infrastructure/
│   ├── echo/
│   ├── calculator/
│   ├── hospi-copilot/
│   └── pdf-generator/
├── vite.app.config.ts             # Widget build config
├── tsconfig.json                  # Base TypeScript config
├── tsconfig.app.json              # App compilation
├── tsconfig.infrastructure.json   # Infrastructure compilation
└── package.json                   # Dependencies and scripts
```

## 🛠️ Development

### Build Commands

```bash
npm run build                    # Build all apps + infrastructure
npm run build:echo               # Build echo app only
npm run build:calculator         # Build calculator app only
npm run build:hospi-copilot      # Build hospi-copilot app only
npm run build:pdf-generator      # Build pdf-generator app only
npm run build:file-processor     # Build file-processor app only
npm run build:infrastructure     # Build infrastructure only
```

### Development Mode (with hot reload)

```bash
npm run start:echo               # Echo app dev mode
npm run start:calculator         # Calculator app dev mode
npm run start:hospi-copilot      # Hospi-copilot app dev mode
npm run start:pdf-generator      # PDF generator app dev mode
npm run start:file-processor     # File processor app dev mode
```

### Testing with MCP Inspector

```bash
npm run inspector:echo           # Test echo with MCP Inspector
npm run inspector:calculator     # Test calculator with MCP Inspector
npm run inspector:hospi-copilot  # Test hospi-copilot with MCP Inspector
npm run inspector:pdf-generator  # Test pdf-generator with MCP Inspector
npm run inspector:file-processor # Test file-processor with MCP Inspector
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
- Internationalization utilities (`infrastructure/server/i18n.ts`)
- Build system (Vite, TypeScript configs)

### Multilingual Support

Build apps that automatically adapt to the user's language:

```typescript
// Server-side: Add language parameter to tool schema
language: z.enum(["en", "nl", "fr"]).optional().default("en")
  .describe("Detect from user's prompt language")

// Widget-side: Use translations
const TRANSLATIONS = {
  en: { welcome: "Welcome" },
  nl: { welcome: "Welkom" },
  fr: { welcome: "Bienvenue" },
};
```

**Features:**
- Automatic language detection by LLM from user's prompt
- Reusable utilities in `infrastructure/server/i18n.ts`
- Template includes commented multilingual examples
- Complete example: `apps/hospi-copilot`

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

### Security & Submission (CSP)

All apps are **ChatGPT submission-ready** with Content Security Policy (CSP) and domain configuration:

```typescript
_meta: {
  ui: {
    domain: "app-unique-id",  // Unique identifier for sandboxing
    csp: {
      connectDomains: [],     // External API domains
      resourceDomains: [],    // External asset domains (CDN, fonts, images)
    }
  }
}
```

**Current apps status:**
- ✅ **echo** - Domain: `echo-mcp-app`, Self-contained CSP
- ✅ **calculator** - Domain: `calculator-mcp-app`, Self-contained CSP
- ✅ **hospi-copilot** - Domain: `hospi-copilot`, Self-contained CSP
- ✅ **pdf-generator** - Domain: `pdf-generator`, CDN CSP for PDF.js worker
- ✅ **file-processor** - Domain: `file-processor`, Self-contained CSP
- ✅ **Tested & Verified** - No CSP warnings in ChatGPT

All apps use self-contained CSP (empty arrays) because assets are bundled by Vite. See `CLAUDE.md` for detailed CSP documentation.

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

### Claude Desktop Issues

**Apps not appearing in Connectors panel:**
- Verify config syntax: `jq . ~/Library/Application\ Support/Claude/claude_desktop_config.json`
- Check absolute paths to `.ts` files are correct
- **Completely restart Claude Desktop** (quit and reopen, not just refresh)
- Ensure Claude Pro/Team/Enterprise subscription (MCP Apps require paid plan)

**Tool executes but widget doesn't render:**
- Verify widget was built: `ls dist/echo/widget/`
- Check widget HTML file exists and is not empty
- Look for console errors in Claude Desktop logs
- Ensure using latest Claude Desktop version

**STDIO errors or connection failures:**
- Verify `tsx` is available: `npx -y tsx --version`
- Check Node.js version: `node -v` (should be 18+)
- Ensure `--stdio` flag is present in config args
- Review startup logs with: `./scripts/verify-claude-desktop.sh`

**Configuration issues:**
- Restore backup: `cp ~/Library/Application\ Support/Claude/claude_desktop_config.json.backup-* ~/Library/Application\ Support/Claude/claude_desktop_config.json`
- Regenerate config: `./scripts/claude-desktop-config.sh`
- Validate JSON: `jq . ~/Library/Application\ Support/Claude/claude_desktop_config.json`

**Testing between platforms:**

If an app works on ChatGPT but not Claude Desktop:
1. Test STDIO mode with inspector: `npm run inspector:echo`
2. Check for stdout logging (must use `console.error()` only)
3. Verify widget loads as single HTML file
4. Compare behavior with verification script

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
