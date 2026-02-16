/**
 * File Processor MCP App
 *
 * Demonstrates secure file upload and processing patterns.
 */

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
import {
  validateUploadedFile,
  calculateChecksum,
  formatFileSize,
  getMimeTypeFromMagicNumber,
  base64ToBuffer,
  FILE_UPLOAD_PRESETS,
  type UploadedFile,
} from "../../infrastructure/server/utils/file-handling.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, "..", "..", "dist", "file-processor");

// Detect transport mode: STDIO (Claude Desktop) vs HTTP (ChatGPT)
const isStdio = process.argv.includes("--stdio");

// Export constants for multi-app integration
export const APP_NAME = "File Processor";
export const APP_VERSION = "1.0.0";

/**
 * Creates and configures the MCP server with file processing tool
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: APP_NAME,
    version: APP_VERSION,
  });

  // Define UI resource URI
  const resourceUri = "ui://file-processor/widget.html";

  // Register the process_file tool
  registerAppTool(
    server,
    "process_file",
    {
      title: "Process Uploaded File",
      description: "Processes an uploaded file with validation and analysis. Supports images, documents, and text files up to 10MB.",
      inputSchema: {
        filename: z.string().describe("Original filename"),
        mimeType: z.string().describe("MIME type of the file"),
        base64Content: z.string().describe("Base64-encoded file content"),
        operation: z.enum(["analyze", "validate", "metadata"])
          .describe("Operation to perform: analyze (full analysis), validate (check only), metadata (extract info)"),
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
    async (args) => {
      const { filename, mimeType, base64Content, operation } = args;

      console.error(`process_file called: ${filename} (${operation})`);

      // Create uploaded file object
      const file: UploadedFile = {
        filename,
        mimeType,
        base64Content,
        sizeBytes: Math.ceil((base64Content.length * 3) / 4), // Approximate size from base64
        metadata: {
          uploadedAt: new Date().toISOString(),
        },
      };

      try {
        // Validate file with permissive settings (accepts most file types)
        const validation = await validateUploadedFile(file, {
          maxSizeBytes: 10 * 1024 * 1024, // 10MB
          allowedMimeTypes: [
            'image/png',
            'image/jpeg',
            'image/gif',
            'application/pdf',
            'text/plain',
            'text/csv',
            'application/json',
          ],
          requireMagicNumberCheck: true,
        });

        if (!validation.valid) {
          return {
            structuredContent: {
              success: false,
              error: validation.error,
              filename,
              operation,
            },
            content: [{
              type: "text",
              text: `❌ File validation failed: ${validation.error}`
            }],
          };
        }

        // Perform requested operation
        let result: any = {};

        switch (operation) {
          case "validate":
            result = {
              valid: true,
              message: "File passed all validation checks",
            };
            break;

          case "metadata":
            const buffer = base64ToBuffer(base64Content);
            const detectedMime = getMimeTypeFromMagicNumber(buffer);
            const checksum = await calculateChecksum(base64Content);

            result = {
              filename,
              mimeType,
              detectedMimeType: detectedMime,
              size: formatFileSize(file.sizeBytes),
              sizeBytes: file.sizeBytes,
              checksum,
              uploadedAt: file.metadata?.uploadedAt,
            };
            break;

          case "analyze":
          default:
            const analysisBuffer = base64ToBuffer(base64Content);
            const analysisDetectedMime = getMimeTypeFromMagicNumber(analysisBuffer);
            const analysisChecksum = await calculateChecksum(base64Content);

            // Perform analysis based on file type
            const analysis: any = {
              basic: {
                filename,
                mimeType,
                detectedMimeType: analysisDetectedMime,
                size: formatFileSize(file.sizeBytes),
                sizeBytes: file.sizeBytes,
                checksum: analysisChecksum,
              },
            };

            // Type-specific analysis
            if (mimeType.startsWith('image/')) {
              analysis.imageInfo = {
                type: "image",
                format: mimeType.split('/')[1],
                note: "Image file detected"
              };
            } else if (mimeType === 'application/pdf') {
              analysis.documentInfo = {
                type: "PDF document",
                note: "PDF file detected"
              };
            } else if (mimeType.startsWith('text/')) {
              const textContent = analysisBuffer.toString('utf8', 0, Math.min(1000, analysisBuffer.length));
              analysis.textInfo = {
                type: "text file",
                preview: textContent.substring(0, 200),
                lineCount: (textContent.match(/\n/g) || []).length + 1,
              };
            }

            result = analysis;
            break;
        }

        return {
          structuredContent: {
            success: true,
            operation,
            filename,
            result,
            uploadedAt: file.metadata?.uploadedAt,
          },
          content: [{
            type: "text",
            text: `✅ Successfully processed ${filename} (${operation})`
          }],
        };

      } catch (error) {
        console.error("Error processing file:", error);
        return {
          structuredContent: {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            filename,
            operation,
          },
          content: [{
            type: "text",
            text: `❌ Error processing file: ${error instanceof Error ? error.message : "Unknown error"}`
          }],
        };
      }
    }
  );

  // Register the UI resource (widget)
  registerAppResource(
    server,
    "file-processor-widget",
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => {
      const htmlPath = path.join(DIST_DIR, "widget", "apps", "file-processor", "widget", "file-processor-widget.html");
      console.error(`Serving UI resource from: ${htmlPath}`);

      // Read the built widget HTML
      const html = await fs.readFile(htmlPath, "utf-8");

      return {
        contents: [
          {
            uri: resourceUri,
            mimeType: RESOURCE_MIME_TYPE,
            text: html,
            _meta: {
              ui: {
                ...(isStdio ? {} : { domain: "file-processor" }),
                csp: {
                  connectDomains: [],
                  resourceDomains: [], // Self-contained
                },
              },
            },
          },
        ],
      };
    }
  );

  console.error("File Processor MCP server created with 1 tool and 1 resource");

  return server;
}
