import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import type { Request, Response } from "express";

/**
 * Starts the MCP server with HTTP transport for remote access (ChatGPT)
 */
export async function startStreamableHTTPServer(
  createServerFn: () => McpServer
): Promise<void> {
  const port = parseInt(process.env.PORT ?? "3001", 10);
  const app = createMcpExpressApp({ host: "0.0.0.0" });

  // Enable CORS for ChatGPT access
  app.use(cors());

  // Health check endpoint for ChatGPT connector validation
  app.get("/", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      service: "MCP Apps Server",
      endpoints: {
        mcp: "/mcp"
      }
    });
  });

  // MCP endpoint at /mcp
  app.all("/mcp", async (req: Request, res: Response) => {
    const server = createServerFn();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    // Cleanup on connection close
    res.on("close", () => {
      transport.close().catch(() => {});
      server.close().catch(() => {});
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("MCP error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  const httpServer = app.listen(port, (err?: Error) => {
    if (err) {
      console.error("Failed to start server:", err);
      process.exit(1);
    }
    console.log(`✅ MCP server listening on http://localhost:${port}/mcp`);
    console.log(`📝 Use ngrok to expose: ngrok http ${port}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log("\n🛑 Shutting down...");
    httpServer.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

/**
 * Starts the MCP server with STDIO transport for local access (Claude Desktop, MCP Inspector)
 */
export async function startStdioServer(
  createServerFn: () => McpServer
): Promise<void> {
  // Note: In STDIO mode, stdout is used for JSON-RPC communication
  // All logging must go to stderr
  console.error("🔍 Starting MCP server in STDIO mode (for Claude Desktop/MCP Inspector)");
  await createServerFn().connect(new StdioServerTransport());
}

// Note: This file exports generic infrastructure functions.
// Individual apps should create their own entry point that imports
// these functions and calls them with app-specific createServer functions.
