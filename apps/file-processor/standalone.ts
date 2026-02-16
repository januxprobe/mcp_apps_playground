/**
 * File Processor MCP App - Standalone Entry Point
 *
 * Supports both HTTP (ChatGPT) and STDIO (Claude Desktop) transports.
 */

import { startStreamableHTTPServer, startStdioServer } from "../../infrastructure/server/main.js";
import { createServer } from "./server.js";

async function main() {
  if (process.argv.includes("--stdio")) {
    // STDIO mode for Claude Desktop / MCP Inspector
    await startStdioServer(createServer);
  } else {
    // HTTP mode for ChatGPT (default)
    await startStreamableHTTPServer(createServer);
  }
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
