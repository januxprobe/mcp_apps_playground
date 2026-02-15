/**
 * Content Security Policy (CSP) configuration for MCP app widgets.
 *
 * CSP and domain configuration is REQUIRED for ChatGPT app submission.
 * These settings control which external resources your widget can access.
 *
 * Note: Claude Desktop (STDIO mode) ignores these settings - they only apply
 * to ChatGPT's sandboxed widget environment.
 */

/**
 * Content Security Policy configuration for MCP app widgets.
 *
 * Defines which external domains your widget can access. Most MCP apps are
 * self-contained and don't need external resources (empty arrays).
 *
 * @example Self-contained app (most common)
 * ```typescript
 * const csp: AppCspConfig = {
 *   connectDomains: [],
 *   resourceDomains: [],
 * };
 * ```
 *
 * @example App with external API and CDN resources
 * ```typescript
 * const csp: AppCspConfig = {
 *   connectDomains: ["https://api.weather.com"],
 *   resourceDomains: ["https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
 * };
 * ```
 */
export interface AppCspConfig {
  /**
   * Domains for network requests (fetch, XMLHttpRequest, WebSocket).
   *
   * Add domains here if your widget makes API calls or opens WebSocket connections.
   * All domains must use HTTPS.
   *
   * @example
   * ```typescript
   * connectDomains: ["https://api.example.com", "https://ws.example.com"]
   * ```
   */
  connectDomains?: string[];

  /**
   * Domains for static assets (images, fonts, scripts, stylesheets).
   *
   * Add domains here if your widget loads external resources.
   * Most apps bundle everything with Vite and don't need this.
   * All domains must use HTTPS.
   *
   * @example
   * ```typescript
   * resourceDomains: ["https://cdn.jsdelivr.net", "https://fonts.googleapis.com"]
   * ```
   */
  resourceDomains?: string[];

  /**
   * Domains for embedded iframes (DISCOURAGED).
   *
   * Iframes are subject to higher review scrutiny and should be avoided.
   * Consider alternative patterns before using iframes.
   * All domains must use HTTPS.
   *
   * @example
   * ```typescript
   * frameDomains: ["https://trusted-embed.example.com"]
   * ```
   */
  frameDomains?: string[];
}

/**
 * Widget UI metadata including CSP and domain.
 *
 * This metadata is required for ChatGPT app submission and is included
 * in the resource registration's `_meta` field.
 */
export interface AppResourceMetadata {
  /**
   * Content Security Policy configuration.
   * Defines which external domains the widget can access.
   */
  csp: AppCspConfig;

  /**
   * Unique domain identifier for this app.
   *
   * This is NOT a real DNS domain - it's just a string identifier.
   * ChatGPT uses it to create a sandboxed subdomain like:
   * `{domain}.web-sandbox.oaiusercontent.com`
   *
   * Requirements:
   * - Must be unique across all your apps
   * - Should be descriptive and memorable
   * - Use kebab-case (e.g., "my-app", "echo-mcp-app")
   * - No special characters or spaces
   *
   * @example
   * ```typescript
   * domain: "echo-mcp-app"
   * domain: "calculator-widget"
   * domain: "hospi-copilot"
   * ```
   */
  domain: string;
}

/**
 * Preset CSP configuration for self-contained apps (no external resources).
 *
 * Most MCP apps fit this pattern - all assets are bundled by Vite and
 * no external API calls are made.
 *
 * Use this preset for apps that:
 * - Don't make HTTP/WebSocket requests to external APIs
 * - Don't load external images, fonts, or scripts
 * - Don't embed iframes
 *
 * @example
 * ```typescript
 * const metadata = createResourceMeta("my-app", SELF_CONTAINED_CSP);
 * ```
 */
export const SELF_CONTAINED_CSP: AppCspConfig = {
  connectDomains: [],
  resourceDomains: [],
};

/**
 * Helper function to create resource metadata with CSP and domain.
 *
 * This provides type safety and consistent structure for all apps.
 *
 * @param domain - Unique domain identifier for the app (e.g., "echo-mcp-app")
 * @param csp - CSP configuration (defaults to SELF_CONTAINED_CSP)
 * @returns Metadata object to include in resource registration's `_meta` field
 *
 * @example Self-contained app
 * ```typescript
 * const metadata = createResourceMeta("echo-mcp-app");
 * // Uses default SELF_CONTAINED_CSP
 * ```
 *
 * @example App with external resources
 * ```typescript
 * const metadata = createResourceMeta("weather-app", {
 *   connectDomains: ["https://api.weather.com"],
 *   resourceDomains: ["https://cdn.jsdelivr.net"],
 * });
 * ```
 */
export function createResourceMeta(
  domain: string,
  csp: AppCspConfig = SELF_CONTAINED_CSP
): { ui: AppResourceMetadata } {
  return {
    ui: {
      domain,
      csp,
    },
  };
}
