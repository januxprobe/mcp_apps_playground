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

## Resources

- [MCP Apps Documentation](https://developers.openai.com/apps-sdk/)
- [Echo App Example](../echo/)
- [Calculator App Example](../calculator/)
