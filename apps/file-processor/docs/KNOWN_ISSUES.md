# Known Issues - File Processor

## Claude Desktop Compatibility

**Status:** ❌ Not working on Claude Desktop (STDIO mode)

**Works on:** ✅ ChatGPT (HTTP mode)

### Issue Description

The file-processor app does not function correctly in Claude Desktop when using STDIO transport mode. The widget loads but file upload does not work as expected.

### Verified Working

- ✅ ChatGPT (HTTP mode via ngrok)
- ✅ File upload via drag-and-drop in ChatGPT
- ✅ File upload via file picker in ChatGPT
- ✅ All three operations (analyze, validate, metadata) in ChatGPT
- ✅ Multiple file uploads in sequence in ChatGPT
- ✅ Body size limit (15MB) properly configured for Base64-encoded files

### Testing Details

**Tested on ChatGPT:**
- Date: 2026-02-16
- File: Screenshot (725 KB PNG)
- Result: ✅ All operations work correctly
- Operations tested:
  - ✅ Metadata extraction with SHA-256 checksum
  - ✅ File validation
  - ✅ Full analysis with type-specific insights

**Tested on Claude Desktop:**
- Date: 2026-02-16
- Result: ❌ File upload does not work
- Widget loads but functionality incomplete

### Workaround

Use ChatGPT for file upload and processing features until Claude Desktop compatibility is resolved.

### Related

Similar issue exists with pdf-generator app (see `apps/pdf-generator/docs/KNOWN_ISSUES.md`). Both apps work perfectly on ChatGPT but have issues on Claude Desktop, suggesting a potential platform-specific limitation with certain MCP Apps patterns.

### Future Investigation

Potential areas to investigate:
- STDIO transport handling of large payloads (Base64-encoded files)
- Widget-initiated tool calls in Claude Desktop vs ChatGPT
- File API availability in Claude Desktop's iframe environment
- Body parser configuration differences between HTTP and STDIO modes
