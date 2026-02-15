# PDF Generation Pattern for MCP Apps

This document explains how to generate PDFs server-side and deliver them to widgets using Base64 data URLs.

## Overview

MCP apps can generate PDFs on the server and display them in widgets without saving files to disk. This pattern uses in-memory generation and Base64 encoding.

## Architecture

```
User → LLM → Tool Call → Server
                           ↓
                    Generate PDF (pdfkit)
                           ↓
                    Convert to Base64
                           ↓
                    Return data URL
                           ↓
Widget ← Receives ← structuredContent
  ↓
Display in <iframe>
  ↓
Download as file
```

## Why Base64 Data URLs?

Instead of saving PDFs to disk and serving via URL:

**Traditional approach (not used):**
```typescript
// ❌ Don't do this
fs.writeFileSync('invoice.pdf', pdfBuffer);
return { url: 'https://server.com/invoice.pdf' };
```

**MCP Apps approach (recommended):**
```typescript
// ✅ Do this
const base64 = pdfBuffer.toString('base64');
return { pdfDataUrl: `data:application/pdf;base64,${base64}` };
```

**Benefits:**
- ✅ Works in sandboxed iframes (no external resources)
- ✅ No server-side file storage required
- ✅ No CSP domains needed (self-contained)
- ✅ Download works without popup blockers
- ✅ Simpler architecture

## How PDFKit Works

### Stream-Based Generation

PDFKit generates PDFs as a stream of chunks:

```typescript
const doc = new PDFDocument();

// Chunks are emitted as events
doc.on('data', (chunk: Buffer) => {
  // Each chunk is a piece of the PDF
  console.log(`Received ${chunk.length} bytes`);
});

doc.on('end', () => {
  // All chunks received, PDF is complete
});
```

**Why chunks?** Large PDFs are generated incrementally to save memory.

### In-Memory Generation

To keep PDF in memory (not disk):

```typescript
async function generatePDF(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument();

    // Collect chunks in array
    doc.on('data', (chunk) => chunks.push(chunk));

    // When done, combine all chunks
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(pdfBuffer);
    });

    doc.on('error', reject);

    // Add content
    doc.fontSize(20).text('Hello PDF!', 50, 50);

    // Must call end() to finalize
    doc.end();
  });
}
```

**Key points:**
1. Collect chunks in an array
2. Use `Promise` to wait for completion
3. Combine chunks with `Buffer.concat()`
4. Always call `doc.end()` to finalize

### Base64 Conversion

Convert Buffer to Base64 string:

```typescript
const pdfBuffer = await generatePDF();
const base64 = pdfBuffer.toString('base64');

console.log(base64);
// Output: JVBERi0xLjMKJf////8KNyAwIG9iago8PAovVHlwZSAv...
```

### Data URL Format

Create a data URL for the widget:

```typescript
const dataUrl = `data:application/pdf;base64,${base64}`;

// Format: data:<mimetype>;base64,<encoded-data>
// Example: data:application/pdf;base64,JVBERi0xLjMK...
```

## Server Implementation

### Tool Handler Pattern

```typescript
registerAppTool(
  server,
  "generate_pdf",
  {
    title: "Generate PDF",
    description: "Generates a PDF document from data",
    inputSchema: {
      template: z.enum(["invoice", "report"]),
      data: z.object({
        title: z.string(),
        content: z.any(),
      }),
    },
    _meta: {
      ui: { resourceUri: "ui://pdf-generator/widget.html" }
    },
  },
  async ({ template, data }) => {
    // 1. Generate PDF
    const pdfBuffer = await generatePDF(template, data);

    // 2. Convert to Base64
    const base64 = pdfBuffer.toString('base64');
    const pdfDataUrl = `data:application/pdf;base64,${base64}`;

    // 3. Return to widget
    return {
      structuredContent: {
        pdfDataUrl,
        filename: `${data.title}.pdf`,
        sizeKB: (pdfBuffer.length / 1024).toFixed(2),
      },
      content: [{
        type: "text",
        text: `Generated ${template} PDF: ${data.title}`
      }],
    };
  }
);
```

## Widget Implementation

### Display PDF in Iframe

```typescript
import { App } from "@modelcontextprotocol/ext-apps";

const app = new App({ name: "PDF Generator", version: "1.0.0" });
app.connect();

const iframe = document.getElementById('pdf-preview') as HTMLIFrameElement;

app.ontoolresult = (result) => {
  const { pdfDataUrl, filename } = result.structuredContent;

  // Display PDF in iframe
  iframe.src = pdfDataUrl;

  // Update UI
  document.getElementById('filename').textContent = filename;
};
```

### Download Button

```typescript
const downloadBtn = document.getElementById('download-btn');

downloadBtn.onclick = () => {
  const { pdfDataUrl, filename } = currentResult;

  // Create temporary link and click it
  const link = document.createElement('a');
  link.href = pdfDataUrl;
  link.download = filename;
  link.click();
};
```

### Print Button

```typescript
const printBtn = document.getElementById('print-btn');

printBtn.onclick = () => {
  // Access iframe's window and trigger print
  iframe.contentWindow?.print();
};
```

## Template System

### Simple Template

```typescript
function renderSimpleTemplate(doc: PDFKit.PDFDocument, data: any) {
  // Title
  doc.fontSize(20).text(data.title, 50, 50);

  // Content
  doc.fontSize(12).text(data.content, 50, 100);

  // Footer
  doc.fontSize(10).text(
    `Generated: ${new Date().toLocaleDateString()}`,
    50,
    doc.page.height - 50
  );
}
```

### Invoice Template

```typescript
function renderInvoiceTemplate(doc: PDFKit.PDFDocument, data: any) {
  // Header
  doc.fontSize(20).text('INVOICE', 50, 50);
  doc.fontSize(10).text(`Date: ${data.date}`, 50, 80);

  // Items
  let y = 120;
  doc.fontSize(12).text('Item', 50, y);
  doc.text('Amount', 400, y);

  y += 30;
  data.items.forEach((item: any) => {
    doc.fontSize(10);
    doc.text(item.description, 50, y);
    doc.text(`$${item.amount.toFixed(2)}`, 400, y);
    y += 20;
  });

  // Total
  const total = data.items.reduce((sum: number, item: any) =>
    sum + item.amount, 0
  );
  doc.fontSize(14).text(`Total: $${total.toFixed(2)}`, 400, y + 20);
}
```

## Common Patterns

### Page Size Options

```typescript
new PDFDocument({
  size: 'A4',      // Standard sizes: A4, Letter, Legal
  layout: 'portrait',  // or 'landscape'
})
```

### Custom Page Size

```typescript
new PDFDocument({
  size: [595.28, 841.89],  // Width, height in points (A4)
})
```

### Multiple Pages

```typescript
// Content flows automatically to new pages
doc.text('Page 1 content...');

// Or explicitly add page
doc.addPage();
doc.text('Page 2 content...');
```

### Images

```typescript
doc.image('logo.png', 50, 50, { width: 100 });
```

### Shapes and Lines

```typescript
// Line
doc.moveTo(50, 100).lineTo(500, 100).stroke();

// Rectangle
doc.rect(50, 120, 200, 100).stroke();

// Circle
doc.circle(150, 200, 50).fill('blue');
```

## Security Considerations

### File Size Limits

PDFs can get large. Set reasonable limits:

```typescript
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

if (pdfBuffer.length > MAX_PDF_SIZE) {
  throw new Error(`PDF too large: ${pdfBuffer.length} bytes`);
}
```

### Input Validation

Validate all user-provided data before including in PDF:

```typescript
// Sanitize strings
const title = data.title.substring(0, 100);

// Validate numbers
if (isNaN(data.amount)) {
  throw new Error('Invalid amount');
}
```

### No User-Provided Code

Never execute user-provided JavaScript or templates:

```typescript
// ❌ Dangerous
eval(data.template);

// ✅ Safe
switch (templateName) {
  case 'invoice': renderInvoice(); break;
  case 'report': renderReport(); break;
}
```

## Performance Tips

### Reuse Fonts

```typescript
// ❌ Creates new font each time
doc.fontSize(12).text('Hello');
doc.fontSize(12).text('World');

// ✅ Set once
doc.fontSize(12);
doc.text('Hello');
doc.text('World');
```

### Limit Image Quality

```typescript
doc.image('photo.jpg', {
  width: 200,
  quality: 75,  // Lower quality = smaller file
});
```

## Testing PDFs

### Quick Test

```typescript
const pdfBuffer = await generatePDF('invoice', testData);
fs.writeFileSync('test.pdf', pdfBuffer);
// Open test.pdf to verify
```

### Automated Testing

```typescript
import { describe, it, expect } from 'vitest';

describe('PDF Generation', () => {
  it('should generate valid PDF', async () => {
    const buffer = await generatePDF('simple', { title: 'Test' });

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);

    // Check PDF magic number (first 4 bytes)
    expect(buffer.toString('utf8', 0, 4)).toBe('%PDF');
  });
});
```

## Troubleshooting

### PDF is Empty/Blank

**Cause:** Forgot to call `doc.end()`

**Fix:**
```typescript
doc.text('Content');
doc.end();  // ← Must call this!
```

### "Cannot read property 'length' of undefined"

**Cause:** Promise not awaited

**Fix:**
```typescript
const buffer = await generatePDF();  // ← await!
```

### Widget Shows "Failed to load PDF"

**Cause:** Base64 string is incomplete or corrupted

**Fix:** Check that all chunks are collected:
```typescript
doc.on('data', (chunk) => chunks.push(chunk));
```

## References

- **pdfkit Documentation**: http://pdfkit.org/
- **Base64 Encoding**: https://developer.mozilla.org/en-US/docs/Glossary/Base64
- **Data URLs**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs

## Examples

See working examples in:
- `apps/pdf-generator/` - Full MCP app implementation
- `test-pdf-generation.ts` - Simple file generation
- `test-pdf-base64.ts` - In-memory Base64 pattern

---

*Last updated: February 2026*
