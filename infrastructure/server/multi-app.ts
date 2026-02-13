import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AppServerModule } from "./types.js";

/**
 * Creates a single MCP server that hosts multiple apps
 * All tools are available on one endpoint
 *
 * Note: This requires apps to support a shared server pattern where
 * createServer() can optionally accept an existing server instance.
 */
export function createMultiAppServer(apps: AppServerModule[]): McpServer {
  const server = new McpServer({
    name: "MCP Apps Playground",
    version: "1.0.0",
  });

  console.error(`🎮 Creating multi-app server with ${apps.length} apps:`);

  for (const app of apps) {
    console.error(`   - ${app.APP_NAME} (${app.APP_VERSION})`);

    // For now, each app creates its own server
    // In the future, we could modify apps to accept an existing server
    // and register their tools on it
    // TODO: Implement shared server pattern or tool proxying
  }

  console.error("⚠️  Multi-app server is a work in progress");
  console.error("   For now, please run apps individually with ./scripts/start-app.sh");

  return server;
}
