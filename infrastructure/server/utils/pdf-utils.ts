/**
 * PDF Generation Utilities
 *
 * Reusable functions for generating PDFs server-side using pdfkit.
 * PDFs are generated in memory and returned as Buffers for Base64 encoding.
 *
 * See docs/pdf-generation-pattern.md for detailed explanation.
 */

import PDFDocument from 'pdfkit';

/**
 * Template data interfaces
 */
export interface SimplePDFData {
  title: string;
  content: string;
}

export interface InvoicePDFData {
  title: string;
  date?: string;
  items: Array<{
    description: string;
    amount: number;
  }>;
}

/**
 * PDF generation options
 */
export interface PDFOptions {
  pageSize?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
}

/**
 * Generates a PDF from a template and data.
 *
 * IMPORTANT: This function generates PDFs in MEMORY (not saved to disk).
 * The PDF is returned as a Buffer which can be converted to Base64.
 *
 * @param template - Template name to use
 * @param data - Data to render in the template
 * @param options - PDF generation options
 * @returns PDF as Buffer
 *
 * @example
 * ```typescript
 * const pdfBuffer = await generatePDF('simple', {
 *   title: 'My Document',
 *   content: 'Hello World'
 * });
 *
 * const base64 = pdfBuffer.toString('base64');
 * const dataUrl = `data:application/pdf;base64,${base64}`;
 * ```
 */
export async function generatePDF(
  template: string,
  data: SimplePDFData | InvoicePDFData,
  options?: PDFOptions
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // Collect PDF chunks as they're generated
    const chunks: Buffer[] = [];

    // Create PDF document
    const doc = new PDFDocument({
      size: options?.pageSize || 'A4',
      layout: options?.orientation || 'portrait',
    });

    // Listen for data chunks (generated incrementally)
    doc.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    // When PDF is complete, combine all chunks
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(pdfBuffer);
    });

    // Error handling
    doc.on('error', reject);

    // Apply the requested template
    try {
      switch (template) {
        case 'simple':
          renderSimpleTemplate(doc, data as SimplePDFData);
          break;
        case 'invoice':
          renderInvoiceTemplate(doc, data as InvoicePDFData);
          break;
        default:
          reject(new Error(`Unknown template: ${template}`));
          return;
      }
    } catch (error) {
      reject(error);
      return;
    }

    // Finalize the PDF (CRITICAL - without this, PDF won't be complete!)
    doc.end();
  });
}

/**
 * Simple Template - Basic title and content
 *
 * Use this for simple documents with just a title and text.
 */
function renderSimpleTemplate(doc: PDFKit.PDFDocument, data: SimplePDFData) {
  // Title at top
  doc
    .fontSize(20)
    .text(data.title, 50, 50);

  // Content below title
  doc
    .fontSize(12)
    .text(data.content, 50, 100);

  // Footer with generation date
  doc
    .fontSize(10)
    .text(
      `Generated on ${new Date().toLocaleDateString()}`,
      50,
      doc.page.height - 50
    );
}

/**
 * Invoice Template - Professional invoice layout
 *
 * Includes header, line items table, and total calculation.
 */
function renderInvoiceTemplate(doc: PDFKit.PDFDocument, data: InvoicePDFData) {
  // Header
  doc.fontSize(20).text(data.title, 50, 50);

  // Date
  const invoiceDate = data.date || new Date().toLocaleDateString();
  doc.fontSize(10).text(`Date: ${invoiceDate}`, 50, 80);

  // Table header
  let y = 120;
  doc.fontSize(12).text('Item', 50, y);
  doc.text('Amount', 400, y);

  // Draw line under header
  y += 20;
  doc
    .moveTo(50, y)
    .lineTo(500, y)
    .stroke();

  // Line items
  y += 10;
  data.items.forEach((item) => {
    doc.fontSize(10);
    doc.text(item.description, 50, y);
    doc.text(`$${item.amount.toFixed(2)}`, 400, y);
    y += 20;
  });

  // Total
  y += 10;
  doc
    .moveTo(50, y)
    .lineTo(500, y)
    .stroke();

  const total = data.items.reduce((sum, item) => sum + item.amount, 0);
  doc.fontSize(14).text(`Total: $${total.toFixed(2)}`, 400, y + 10);

  // Footer
  doc
    .fontSize(8)
    .text(
      `Generated on ${new Date().toLocaleDateString()}`,
      50,
      doc.page.height - 30
    );
}

/**
 * Utility: Calculate page count from PDF buffer
 *
 * Estimates page count by looking for page objects in PDF.
 * Note: This is a rough estimate.
 */
export function estimatePageCount(pdfBuffer: Buffer): number {
  const pdfString = pdfBuffer.toString('utf8');
  const pageMatches = pdfString.match(/\/Type\s*\/Page[^s]/g);
  return pageMatches ? pageMatches.length : 1;
}

/**
 * Utility: Check if buffer is a valid PDF
 *
 * PDFs start with magic number: %PDF
 */
export function isValidPDF(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  return buffer.toString('utf8', 0, 4) === '%PDF';
}

/**
 * Utility: Get PDF file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
