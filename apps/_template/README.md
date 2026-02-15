# MCP App Template

This template helps you quickly create a new MCP app in the playground that works on both ChatGPT and Claude Desktop.

## Using This Template

**Automated (Recommended):**
```bash
./scripts/new-app.sh <app-id>
```

This script will:
1. Copy this template to `apps/<app-id>/`
2. Prompt you for app details
3. Replace all placeholders automatically
4. Add build scripts to package.json
5. Make your app ready to run

**Manual:**
1. Copy this directory to `apps/<your-app-id>/`
2. Rename template files (remove `.template` extension)
3. Replace the following placeholders:

### Placeholders

| Placeholder | Description | Example |
|------------|-------------|---------|
| `{{APP_ID}}` | App identifier (folder name, lowercase) | `weather` |
| `{{APP_NAME}}` | Human-readable app name | `Weather App` |
| `{{TOOL_NAME}}` | First tool name (snake_case) | `get_weather` |
| `{{TOOL_TITLE}}` | Tool display title | `Get Weather` |
| `{{TOOL_DESCRIPTION}}` | Tool description for AI model | `Gets current weather for a location` |

## Next Steps

After creating from template:

1. **Implement your tool logic** in `server.ts`
   - Add more tools if needed
   - Define proper Zod schemas for inputs
   - Return structured content for the UI

2. **Design your UI** in `widget/<app-id>-widget.html`
   - Customize colors and layout
   - Add any UI elements you need

3. **Add UI logic** in `widget/<app-id>-widget.ts`
   - Handle tool results
   - Add interactive elements
   - Connect buttons to tool calls

4. **Test your app**
   ```bash
   npm run build:<app-id>
   ./scripts/start-app.sh <app-id>
   ```

## Security Configuration (CSP and Domain)

**Required for ChatGPT app submission** - the template includes default CSP configuration.

### What is CSP?

Content Security Policy (CSP) controls which external resources your widget can access. It's a security feature required by ChatGPT.

### Default Configuration (Self-Contained App)

Most MCP apps don't need external resources - everything is bundled by Vite:

```typescript
_meta: {
  ui: {
    domain: "{{APP_ID}}-app",  // Your unique domain identifier
    csp: {
      connectDomains: [],       // No external API calls
      resourceDomains: [],      // No external assets
    }
  }
}
```

**This default is already configured in the template** and works for most apps.

### When to Modify CSP

Only modify if your app needs external resources:

**External API calls:**
```typescript
csp: {
  connectDomains: ["https://api.weather.com"],  // Add API domains here
  resourceDomains: [],
}
```

**External assets (images, fonts, scripts):**
```typescript
csp: {
  connectDomains: [],
  resourceDomains: ["https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
}
```

### Testing CSP

1. Build your app: `npm run build:<app-id>`
2. Test in ChatGPT Developer Mode
3. Open browser DevTools → Console
4. Look for CSP violation errors
5. Add blocked domains to your CSP configuration
6. Rebuild and retest

### Important Notes

- **Domain is NOT a real DNS domain** - it's just a string identifier
- **Claude Desktop ignores CSP** - this only applies to ChatGPT
- **Start with empty arrays** - add domains only as needed
- **HTTPS only** - all domains must use HTTPS
- **Avoid iframes** - they're discouraged and subject to review

## File Structure

```
<app-id>/
├── server.ts              # MCP server with tool registration
├── standalone.ts          # Entry point for running independently
└── widget/
    ├── <app-id>-widget.html  # UI template
    └── <app-id>-widget.ts    # UI logic
```

## Tips

- Start simple - one tool, basic UI
- Look at `echo` and `calculator` apps for examples
- Use console.error() for logging (stdout reserved for JSON-RPC in STDIO mode)
- Test with MCP Inspector or either platform before deploying
- Version your resourceUri when making breaking changes
- Apps automatically work on both ChatGPT and Claude Desktop

## Optional: Multilingual Support

The template includes commented examples for building multilingual apps. To enable:

1. **Server-side** (`server.ts`):
   - Uncomment the `Language` type and `TRANSLATIONS` object
   - Add language parameter to your tool's `inputSchema`
   - Use translations in your tool responses
   - Pass `language` in `structuredContent` to the widget

2. **Widget-side** (`widget.ts`):
   - Uncomment the `TRANSLATIONS` object and `getT()` function
   - Extract language from `result.structuredContent`
   - Call `updateHeader(language)` to translate header
   - Use translations throughout your UI rendering

3. **See complete example**: `apps/hospi-copilot/`

4. **Reusable utilities**: `infrastructure/server/i18n.ts`

**Best practices:**
- Let the LLM detect language from user's prompt (no manual selection needed)
- Add schema description: "Detect from user's prompt language"
- Translate all UI text: titles, labels, buttons, validation messages
- Update header dynamically based on language

## Resources

- [MCP Apps Documentation](https://developers.openai.com/apps-sdk/)
- [Echo App Example](../echo/)
- [Calculator App Example](../calculator/)
- [Hospi-Copilot (Multilingual)](../hospi-copilot/)
