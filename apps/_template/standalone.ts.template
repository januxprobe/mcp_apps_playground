import { startStreamableHTTPServer, startStdioServer } from "../../infrastructure/server/main.js";
import { createServer } from "./server.js";

/**
 * Standalone entry point for this app
 * Can run in HTTP mode (for ChatGPT) or STDIO mode (for Claude Desktop/MCP Inspector)
 */
async function main() {
  if (process.argv.includes("--stdio")) {
    // STDIO mode for Claude Desktop and MCP Inspector
    await startStdioServer(createServer);
  } else {
    // HTTP mode for ChatGPT
    await startStreamableHTTPServer(createServer);
  }
}

main().catch((e) => {
  console.error("❌ Fatal error:", e);
  process.exit(1);
});
