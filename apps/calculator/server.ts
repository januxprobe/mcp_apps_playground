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

const DIST_DIR = path.join(__dirname, "..", "..", "dist", "calculator");

// Export constants for multi-app integration
export const APP_NAME = "Calculator MCP App";
export const APP_VERSION = "1.0.0";

/**
 * Creates and configures the MCP server with calculator tools and UI resource
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: APP_NAME,
    version: APP_VERSION,
  });

  // Define UI resource URI (acts as cache key)
  const resourceUri = "ui://calculator/widget.html";

  // Common input schema for all calculator operations
  const calculatorInputSchema = {
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  };

  // Register Add tool
  registerAppTool(
    server,
    "add",
    {
      title: "Add Numbers",
      description: "Adds two numbers together and displays the result in a calculator widget",
      inputSchema: calculatorInputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        ui: { resourceUri },
      },
    },
    async ({ a, b }) => {
      const result = a + b;
      console.error(`Add: ${a} + ${b} = ${result}`);

      return {
        structuredContent: {
          operation: "add",
          symbol: "+",
          operand1: a,
          operand2: b,
          result,
          equation: `${a} + ${b} = ${result}`,
          timestamp: new Date().toISOString(),
        },
        content: [
          {
            type: "text",
            text: `${a} + ${b} = ${result}`,
          },
        ],
      };
    }
  );

  // Register Subtract tool
  registerAppTool(
    server,
    "subtract",
    {
      title: "Subtract Numbers",
      description: "Subtracts the second number from the first and displays the result",
      inputSchema: calculatorInputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        ui: { resourceUri },
      },
    },
    async ({ a, b }) => {
      const result = a - b;
      console.error(`Subtract: ${a} - ${b} = ${result}`);

      return {
        structuredContent: {
          operation: "subtract",
          symbol: "-",
          operand1: a,
          operand2: b,
          result,
          equation: `${a} - ${b} = ${result}`,
          timestamp: new Date().toISOString(),
        },
        content: [
          {
            type: "text",
            text: `${a} - ${b} = ${result}`,
          },
        ],
      };
    }
  );

  // Register Multiply tool
  registerAppTool(
    server,
    "multiply",
    {
      title: "Multiply Numbers",
      description: "Multiplies two numbers together and displays the result",
      inputSchema: calculatorInputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        ui: { resourceUri },
      },
    },
    async ({ a, b }) => {
      const result = a * b;
      console.error(`Multiply: ${a} × ${b} = ${result}`);

      return {
        structuredContent: {
          operation: "multiply",
          symbol: "×",
          operand1: a,
          operand2: b,
          result,
          equation: `${a} × ${b} = ${result}`,
          timestamp: new Date().toISOString(),
        },
        content: [
          {
            type: "text",
            text: `${a} × ${b} = ${result}`,
          },
        ],
      };
    }
  );

  // Register Divide tool
  registerAppTool(
    server,
    "divide",
    {
      title: "Divide Numbers",
      description: "Divides the first number by the second and displays the result",
      inputSchema: calculatorInputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        ui: { resourceUri },
      },
    },
    async ({ a, b }) => {
      if (b === 0) {
        console.error(`Divide: Division by zero attempted`);
        return {
          structuredContent: {
            operation: "divide",
            symbol: "÷",
            operand1: a,
            operand2: b,
            result: null,
            error: "Division by zero",
            equation: `${a} ÷ ${b} = Error`,
            timestamp: new Date().toISOString(),
          },
          content: [
            {
              type: "text",
              text: `Error: Cannot divide ${a} by zero`,
            },
          ],
        };
      }

      const result = a / b;
      console.error(`Divide: ${a} ÷ ${b} = ${result}`);

      return {
        structuredContent: {
          operation: "divide",
          symbol: "÷",
          operand1: a,
          operand2: b,
          result,
          equation: `${a} ÷ ${b} = ${result}`,
          timestamp: new Date().toISOString(),
        },
        content: [
          {
            type: "text",
            text: `${a} ÷ ${b} = ${result}`,
          },
        ],
      };
    }
  );

  // Register the UI resource
  registerAppResource(
    server,
    "calculator-widget",
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => {
      const htmlPath = path.join(DIST_DIR, "widget", "apps", "calculator", "widget", "calculator-widget.html");
      console.error(`Serving UI resource from: ${htmlPath}`);

      const html = await fs.readFile(htmlPath, "utf-8");

      return {
        contents: [
          {
            uri: resourceUri,
            mimeType: RESOURCE_MIME_TYPE,
            text: html,
            _meta: {
              ui: {
                domain: "calculator-mcp-app",
                csp: {
                  connectDomains: [],
                  resourceDomains: [],
                },
              },
            },
          },
        ],
      };
    }
  );

  console.error("Calculator MCP server created with 4 tools and 1 resource");

  return server;
}
