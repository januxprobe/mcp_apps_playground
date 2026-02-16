/**
 * Dashboard App - Standalone Entry Point
 *
 * Supports both HTTP (ChatGPT) and STDIO (Claude Desktop) transports
 */

import { startStreamableHTTPServer, startStdioServer } from "../../infrastructure/server/main.js";
import { createServer } from "./server.js";

async function main() {
  if (process.argv.includes("--stdio")) {
    // STDIO mode for Claude Desktop
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
