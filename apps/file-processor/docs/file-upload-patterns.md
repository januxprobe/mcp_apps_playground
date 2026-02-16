# File Upload Patterns

## Overview

The file-processor app demonstrates secure file upload and validation patterns for MCP apps. This document covers the complete architecture from client-side upload through server-side processing.

## Architecture

```
User selects file
    ↓
Widget converts to Base64
    ↓
Tool call with Base64 content
    ↓
Server validates file
    ↓
Server processes file
    ↓
Results returned to widget
```

## Security Layers

### 1. File Type Validation

**MIME Type Checking:**
- Client declares MIME type from File API
- Server validates against whitelist

**Magic Number Verification:**
- Reads first bytes of file (magic numbers/file signature)
- Verifies actual file type matches claimed MIME type
- Prevents file type spoofing attacks

**Supported File Signatures:**
- Images: PNG, JPEG, GIF, BMP, TIFF
- Documents: PDF, ZIP, DOC
- Text: UTF-8 BOM
- Archives: GZIP, RAR
- Media: MP3, MP4

### 2. Size Limits

- Configurable max size in bytes
- Validation before processing
- Human-readable error messages

### 3. Filename Sanitization

**Security measures:**
- Path traversal prevention (no `..`, `/`, `\`)
- Null byte prevention
- Non-ASCII character handling
- Length limits (255 chars)

**Sanitization process:**
```typescript
'my file!.pdf' → 'my_file_.pdf'
'файл.txt'     → 'file.txt'
'../../../etc' → Invalid (rejected)
```

### 4. Content Integrity

**SHA-256 Checksums:**
- Generated for all uploaded files
- Verifies content integrity
- Enables deduplication

## Client-Side Implementation

### File Selection

```typescript
// File input
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*,.pdf,.txt';

fileInput.onchange = async (e) => {
  const file = e.target.files[0];
  await handleFileSelect(file);
};

// Drag and drop
uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  const file = e.dataTransfer?.files[0];
  if (file) {
    handleFileSelect(file);
  }
});
```

### Base64 Conversion

```typescript
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Remove "data:image/png;base64," prefix
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

### Calling Server Tool

```typescript
const base64Content = await fileToBase64(file);

const result = await app.callServerTool({
  name: 'process_file',
  arguments: {
    filename: file.name,
    mimeType: file.type || 'application/octet-stream',
    base64Content,
    operation: 'analyze', // or 'validate', 'metadata'
  },
});
```

## Server-Side Implementation

### File Validation

```typescript
import {
  validateUploadedFile,
  type UploadedFile,
} from '../../../infrastructure/server/utils/file-handling.js';

const file: UploadedFile = {
  filename: args.filename,
  mimeType: args.mimeType,
  base64Content: args.base64Content,
  sizeBytes: Math.ceil((args.base64Content.length * 3) / 4),
};

const validation = await validateUploadedFile(file, {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'image/png',
    'image/jpeg',
    'application/pdf',
    'text/plain',
  ],
  requireMagicNumberCheck: true,
});

if (!validation.valid) {
  return {
    structuredContent: {
      success: false,
      error: validation.error,
    },
  };
}
```

### File Processing

```typescript
import {
  base64ToBuffer,
  getMimeTypeFromMagicNumber,
  calculateChecksum,
} from '../../../infrastructure/server/utils/file-handling.js';

// Convert to buffer for processing
const buffer = base64ToBuffer(args.base64Content);

// Verify actual file type
const detectedMime = getMimeTypeFromMagicNumber(buffer);

// Calculate integrity checksum
const checksum = await calculateChecksum(args.base64Content);

// Type-specific processing
if (args.mimeType.startsWith('image/')) {
  // Image analysis
} else if (args.mimeType === 'application/pdf') {
  // PDF processing
} else if (args.mimeType.startsWith('text/')) {
  const textContent = buffer.toString('utf8');
  // Text processing
}
```

## Preset Configurations

### Images Only

```typescript
import { FILE_UPLOAD_PRESETS } from '../../../infrastructure/server/utils/file-handling.js';

const validation = await validateUploadedFile(file, FILE_UPLOAD_PRESETS.IMAGES);
// maxSizeBytes: 5MB
// allowedMimeTypes: PNG, JPEG, GIF
// requireMagicNumberCheck: true
```

### Documents Only

```typescript
const validation = await validateUploadedFile(file, FILE_UPLOAD_PRESETS.DOCUMENTS);
// maxSizeBytes: 10MB
// allowedMimeTypes: PDF, DOC, DOCX, TXT
// requireMagicNumberCheck: true
```

### Permissive (Any File)

```typescript
const validation = await validateUploadedFile(file, FILE_UPLOAD_PRESETS.PERMISSIVE);
// maxSizeBytes: 50MB
// allowedMimeTypes: All types
// requireMagicNumberCheck: false
```

### Custom Configuration

```typescript
const validation = await validateUploadedFile(file, {
  maxSizeBytes: 20 * 1024 * 1024, // 20MB
  allowedMimeTypes: ['application/json', 'application/xml'],
  requireMagicNumberCheck: false,
  customValidator: async (file) => {
    // Custom validation logic
    if (file.filename.endsWith('.config.json')) {
      return { valid: false, error: 'Config files not allowed' };
    }
    return { valid: true };
  },
});
```

## Operations

The file-processor app supports three operations:

### 1. Analyze (Full Analysis)

```typescript
operation: 'analyze'
```

Returns:
- Basic metadata (filename, MIME type, size, checksum)
- Type-specific analysis:
  - **Images**: Format, dimensions note
  - **PDFs**: Document type note
  - **Text**: Preview (first 200 chars), line count

### 2. Validate (Check Only)

```typescript
operation: 'validate'
```

Returns:
- Validation result (pass/fail)
- No file processing

### 3. Metadata (Extract Info)

```typescript
operation: 'metadata'
```

Returns:
- Filename
- MIME type (claimed)
- Detected MIME type (from magic number)
- Size (formatted and bytes)
- SHA-256 checksum
- Upload timestamp

## Error Handling

### Client-Side Errors

```typescript
try {
  const base64Content = await fileToBase64(file);
  const result = await app.callServerTool({ ... });
} catch (error) {
  showError(`Upload failed: ${error.message}`);
}
```

### Server-Side Errors

```typescript
try {
  const validation = await validateUploadedFile(file, options);

  if (!validation.valid) {
    return {
      structuredContent: {
        success: false,
        error: validation.error,
      },
      content: [{
        type: 'text',
        text: `❌ File validation failed: ${validation.error}`
      }],
    };
  }

  // Process file...
} catch (error) {
  console.error('Error processing file:', error);
  return {
    structuredContent: {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    },
    content: [{
      type: 'text',
      text: `❌ Error processing file: ${error.message}`
    }],
  };
}
```

## UI/UX Best Practices

### Loading States

```typescript
// Show loading during upload/processing
loading.classList.remove('hidden');
processBtn.disabled = true;

try {
  const result = await app.callServerTool({ ... });
} finally {
  loading.classList.add('hidden');
  processBtn.disabled = false;
}
```

### File Preview

```typescript
// Show selected file details before processing
selectedFilename.textContent = file.name;
selectedSize.textContent = formatFileSize(file.size);
selectedType.textContent = file.type || 'unknown';
```

### Error Display

```typescript
function showError(message: string) {
  resultDiv.innerHTML = `
    <div class="error">
      <strong>❌ Error:</strong> ${escapeHtml(message)}
    </div>
  `;
}
```

### Result Display

```typescript
app.ontoolresult = (result) => {
  if (!result.structuredContent.success) {
    showError(result.structuredContent.error);
    return;
  }

  displayResult(result.structuredContent);
};
```

## Performance Considerations

### File Size Limits

Base64 encoding increases size by ~33%, so:
- 10MB file → ~13.3MB Base64 string
- Consider lower limits for production
- Show warnings for large files

### Memory Usage

```typescript
// Large files held in memory during processing
// Clean up after processing
buffer = null;
```

### Processing Time

```typescript
// Provide feedback for long operations
setTimeout(() => {
  if (stillProcessing) {
    showMessage('Still processing large file...');
  }
}, 2000);
```

## Security Checklist

- ✅ MIME type validation
- ✅ Magic number verification
- ✅ File size limits
- ✅ Filename sanitization
- ✅ Path traversal prevention
- ✅ Null byte prevention
- ✅ Content integrity (checksums)
- ✅ Error message sanitization
- ✅ No server-side file storage (Base64 transport)
- ✅ Proper error handling

## Testing

See `apps/file-processor/tests/file-handling.test.ts` for comprehensive test coverage:

- ✅ File size validation
- ✅ MIME type validation
- ✅ Magic number detection
- ✅ Filename sanitization
- ✅ Path traversal prevention
- ✅ Base64 encoding/decoding
- ✅ Checksum calculation
- ✅ Edge cases (empty files, malformed data)

## Common Pitfalls

### 1. Forgetting Magic Number Check

❌ **Wrong:**
```typescript
await validateUploadedFile(file, {
  maxSizeBytes: 10MB,
  allowedMimeTypes: ['image/png'],
  requireMagicNumberCheck: false, // Unsafe!
});
```

✅ **Correct:**
```typescript
await validateUploadedFile(file, {
  maxSizeBytes: 10MB,
  allowedMimeTypes: ['image/png'],
  requireMagicNumberCheck: true, // Verifies actual file type
});
```

### 2. Not Sanitizing Filenames

❌ **Wrong:**
```typescript
const outputPath = `/uploads/${file.filename}`; // Path traversal risk!
```

✅ **Correct:**
```typescript
import { sanitizeFilename } from '../../../infrastructure/server/utils/file-handling.js';
const safeName = sanitizeFilename(file.filename);
const outputPath = `/uploads/${safeName}`;
```

### 3. Missing Error Handling

❌ **Wrong:**
```typescript
const base64 = await fileToBase64(file); // May throw
await app.callServerTool({ ... }); // May fail
```

✅ **Correct:**
```typescript
try {
  const base64 = await fileToBase64(file);
  const result = await app.callServerTool({ ... });
} catch (error) {
  showError(error.message);
}
```

## Related Files

- **Utilities**: `infrastructure/server/utils/file-handling.ts`
- **Server**: `apps/file-processor/server.ts`
- **Widget**: `apps/file-processor/widget/file-processor-widget.ts`
- **Widget HTML**: `apps/file-processor/widget/file-processor-widget.html`
- **Tests**: `apps/file-processor/tests/file-handling.test.ts`
- **Documentation**: This file

## Further Reading

- [File API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/File_API)
- [FileReader - MDN](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)
- [List of File Signatures - Wikipedia](https://en.wikipedia.org/wiki/List_of_file_signatures)
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
