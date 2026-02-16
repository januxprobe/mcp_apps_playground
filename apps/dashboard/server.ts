/**
 * Dashboard MCP App - System Metrics Monitoring
 *
 * Demonstrates real-time data visualization with Chart.js
 */

import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, "..", "..", "dist", "dashboard");

// Detect transport mode: STDIO (Claude Desktop) vs HTTP (ChatGPT)
const isStdio = process.argv.includes("--stdio");

export const APP_NAME = "Dashboard";
export const APP_VERSION = "1.0.0";

/**
 * Calculate CPU usage percentage
 */
function calculateCPUUsage(cpus: os.CpuInfo[]): { usage: string; cores: number; model: string } {
  const usage = cpus.reduce((acc, cpu) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    const idle = cpu.times.idle;
    return acc + ((total - idle) / total) * 100;
  }, 0) / cpus.length;

  return {
    usage: usage.toFixed(2),
    cores: cpus.length,
    model: cpus[0].model,
  };
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes: number): string {
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: APP_NAME,
    version: APP_VERSION,
  });

  const resourceUri = "ui://dashboard/widget.html";

  // Register system metrics tool
  registerAppTool(
    server,
    "get_system_metrics",
    {
      title: "Get System Metrics",
      description: "Retrieves current system metrics (CPU, memory, disk usage) with optional auto-refresh",
      inputSchema: {
        metrics: z.array(z.enum(["cpu", "memory", "disk"]))
          .default(["cpu", "memory"])
          .describe("Which metrics to retrieve"),
        refreshInterval: z.number()
          .min(1000)
          .max(60000)
          .default(5000)
          .describe("Auto-refresh interval in milliseconds (1000-60000)"),
      },
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        ui: {
          resourceUri,
        },
      },
    },
    async ({ metrics, refreshInterval }) => {
      console.error(`get_system_metrics called: metrics=${metrics.join(',')}, refresh=${refreshInterval}ms`);

      const data: any = {
        timestamp: new Date().toISOString(),
        metrics: {},
      };

      // CPU metrics
      if (metrics.includes('cpu')) {
        const cpus = os.cpus();
        data.metrics.cpu = calculateCPUUsage(cpus);
      }

      // Memory metrics
      if (metrics.includes('memory')) {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;

        data.metrics.memory = {
          total: formatBytes(totalMem),
          used: formatBytes(usedMem),
          free: formatBytes(freeMem),
          usagePercent: ((usedMem / totalMem) * 100).toFixed(2),
          totalBytes: totalMem,
          usedBytes: usedMem,
          freeBytes: freeMem,
        };
      }

      // Disk metrics (placeholder - would need platform-specific implementation)
      if (metrics.includes('disk')) {
        data.metrics.disk = {
          note: "Disk metrics require platform-specific implementation",
          uptime: os.uptime(),
          uptimeFormatted: `${Math.floor(os.uptime() / 3600)}h ${Math.floor((os.uptime() % 3600) / 60)}m`,
        };
      }

      return {
        structuredContent: {
          ...data,
          refreshInterval,
        },
        content: [
          {
            type: "text",
            text: `System Metrics: ${
              data.metrics.cpu
                ? `CPU ${data.metrics.cpu.usage}%`
                : ''
            }${
              data.metrics.memory
                ? `, Memory ${data.metrics.memory.usagePercent}%`
                : ''
            }`,
          },
        ],
      };
    }
  );

  // Register widget resource
  registerAppResource(
    server,
    "dashboard-widget",
    resourceUri,
    {
      mimeType: RESOURCE_MIME_TYPE,
    },
    async () => {
      const html = await fs.readFile(
        path.join(DIST_DIR, "widget", "apps", "dashboard", "widget", "dashboard-widget.html"),
        "utf-8"
      );

      return {
        contents: [
          {
            uri: resourceUri,
            mimeType: RESOURCE_MIME_TYPE,
            text: html,
            _meta: {
              ui: {
                // Only include domain for remote connectors (ChatGPT)
                // Claude Desktop (local STDIO) doesn't support domain field
                ...(isStdio ? {} : { domain: "dashboard" }),
                csp: {
                  connectDomains: [],
                  resourceDomains: ["https://cdn.jsdelivr.net"], // Chart.js CDN
                },
              },
            },
          },
        ],
      };
    }
  );

  console.error(`${APP_NAME} server created`);
  return server;
}
