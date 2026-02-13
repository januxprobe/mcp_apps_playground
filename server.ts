import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, "dist");

/**
 * Creates and configures the MCP server with echo tool and UI resource
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "Echo ChatGPT App",
    version: "1.0.0",
  });

  // Define UI resource URI (acts as cache key)
  const resourceUri = "ui://echo/widget.html";

  // Register the echo tool
  registerAppTool(
    server,
    "echo",  // Machine-readable tool name
    {
      title: "Echo Text",  // Human-readable title shown in ChatGPT
      description: "Echoes back the provided text in an interactive widget with character and word count",
      inputSchema: {
        text: z.string().describe("The text to echo back"),
      },
      annotations: {
        readOnlyHint: true,     // This tool has no side effects
        openWorldHint: false,   // This tool is bounded to this app
        destructiveHint: false, // This tool is non-destructive
      },
      _meta: {
        ui: {
          resourceUri,  // Links this tool to the UI component
        },
      },
    },
    async (args) => {
      // Handler receives validated args from Zod schema
      const { text } = args;

      console.error(`Echo tool called with text: "${text}"`);

      return {
        // Structured data for both model and UI consumption
        structuredContent: {
          originalText: text,
          echoedText: text,
          timestamp: new Date().toISOString(),
        },
        // Optional narrative for the model's response
        content: [
          {
            type: "text",
            text: `Echoing: "${text}"`,
          },
        ],
        // Large/sensitive data exclusively for the UI (not sent to model)
        _meta: {
          characterCount: text.length,
          wordCount: text.split(/\s+/).filter(Boolean).length,
        },
      };
    }
  );

  // Register the UI resource
  registerAppResource(
    server,
    "echo-widget",  // Resource name
    resourceUri,    // Must match the tool's resourceUri
    { mimeType: RESOURCE_MIME_TYPE },  // text/html;profile=mcp-app
    async () => {
      console.error(`Serving UI resource from: ${DIST_DIR}/echo-widget.html`);

      // Read the bundled HTML from dist directory
      const html = await fs.readFile(
        path.join(DIST_DIR, "echo-widget.html"),
        "utf-8"
      );

      return {
        contents: [
          {
            uri: resourceUri,
            mimeType: RESOURCE_MIME_TYPE,
            text: html,
          },
        ],
      };
    }
  );

  console.error("Echo MCP server created with 1 tool and 1 resource");

  return server;
}
