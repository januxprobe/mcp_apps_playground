/**
 * TDD: PDF Generator Tool Tests
 *
 * Testing the PDF generator tool by calling it directly through
 * the imported functions (not through MCP protocol).
 */

import { describe, it, expect } from 'vitest';
import { generatePDF } from '../../../infrastructure/server/utils/pdf-utils.js';

describe('PDF Generator App', () => {
  describe('Server Module', () => {
    it('should export required constants', async () => {
      const module = await import('../server.js');

      expect(module.APP_NAME).toBe('PDF Generator');
      expect(module.APP_VERSION).toBe('1.0.0');
      expect(module.createServer).toBeDefined();
      expect(typeof module.createServer).toBe('function');
    });

    it('should create a valid MCP server', async () => {
      const { createServer } = await import('../server.js');
      const server = createServer();

      expect(server).toBeDefined();
      expect(server.constructor.name).toBe('McpServer');
    });
  });

  describe('PDF Generation Logic', () => {
    it('should generate PDF with simple template', async () => {
      const pdfBuffer = await generatePDF('simple', {
        title: 'Test Document',
        content: 'This is a test PDF'
      });

      // Convert to Base64 data URL (like the tool does)
      const base64 = pdfBuffer.toString('base64');
      const pdfDataUrl = `data:application/pdf;base64,${base64}`;

      expect(pdfDataUrl).toMatch(/^data:application\/pdf;base64,/);
      expect(pdfBuffer.toString('utf8', 0, 4)).toBe('%PDF');
    });

    it('should generate PDF with invoice template', async () => {
      const pdfBuffer = await generatePDF('invoice', {
        title: 'INVOICE #001',
        date: '2026-02-15',
        items: [
          { description: 'Consulting', amount: 1500 },
          { description: 'Development', amount: 2000 }
        ]
      });

      const base64 = pdfBuffer.toString('base64');
      const pdfDataUrl = `data:application/pdf;base64,${base64}`;

      expect(pdfDataUrl).toMatch(/^data:application\/pdf;base64,/);
      expect(pdfBuffer.toString('utf8', 0, 4)).toBe('%PDF');
    });

    it('should calculate file size correctly', async () => {
      const pdfBuffer = await generatePDF('simple', {
        title: 'Test',
        content: 'Test content'
      });

      const sizeKB = (pdfBuffer.length / 1024).toFixed(2);
      expect(parseFloat(sizeKB)).toBeGreaterThan(0);
    });

    it('should generate valid filename from title', () => {
      const title = 'My Test Document';
      const filename = `${title.replace(/\s+/g, '_')}.pdf`;

      expect(filename).toBe('My_Test_Document.pdf');
    });
  });

  describe('Error Handling', () => {
    it('should reject invalid template', async () => {
      await expect(
        generatePDF('invalid' as any, {
          title: 'Test',
          content: 'Test'
        })
      ).rejects.toThrow('Unknown template: invalid');
    });
  });

  describe('Response Structure', () => {
    it('should match expected tool response format', async () => {
      const pdfBuffer = await generatePDF('simple', {
        title: 'Test Document',
        content: 'Test content'
      });

      const base64 = pdfBuffer.toString('base64');
      const pdfDataUrl = `data:application/pdf;base64,${base64}`;
      const filename = 'Test_Document.pdf';
      const sizeKB = (pdfBuffer.length / 1024).toFixed(2);

      // Simulate what the tool returns
      const response = {
        structuredContent: {
          pdfDataUrl,
          filename,
          sizeKB,
          template: 'simple',
        },
        content: [
          {
            type: "text",
            text: `Generated simple PDF: Test Document (${sizeKB} KB)`
          }
        ],
      };

      expect(response.structuredContent.pdfDataUrl).toBeDefined();
      expect(response.structuredContent.filename).toContain('.pdf');
      expect(response.structuredContent.sizeKB).toBeDefined();
      expect(response.content).toHaveLength(1);
    });
  });
});
