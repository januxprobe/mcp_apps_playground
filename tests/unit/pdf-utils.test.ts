/**
 * Unit tests for PDF utilities
 *
 * These are proper unit tests using vitest.
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest';
import {
  generatePDF,
  isValidPDF,
  formatFileSize,
  estimatePageCount,
} from '../../infrastructure/server/utils/pdf-utils.js';

describe('PDF Utils', () => {
  describe('generatePDF', () => {
    it('should generate a valid PDF with simple template', async () => {
      const pdfBuffer = await generatePDF('simple', {
        title: 'Test Document',
        content: 'Test content',
      });

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect(isValidPDF(pdfBuffer)).toBe(true);
    });

    it('should generate a valid PDF with invoice template', async () => {
      const pdfBuffer = await generatePDF('invoice', {
        title: 'INVOICE #001',
        date: '2026-02-15',
        items: [
          { description: 'Item 1', amount: 100 },
          { description: 'Item 2', amount: 200 },
        ],
      });

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect(isValidPDF(pdfBuffer)).toBe(true);
    });

    it('should reject unknown template', async () => {
      await expect(
        generatePDF('unknown' as any, { title: 'Test', content: 'Test' })
      ).rejects.toThrow('Unknown template: unknown');
    });

    it('should support custom PDF options', async () => {
      const pdfBuffer = await generatePDF(
        'simple',
        { title: 'Test', content: 'Test' },
        { pageSize: 'Letter', orientation: 'landscape' }
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(isValidPDF(pdfBuffer)).toBe(true);
    });
  });

  describe('isValidPDF', () => {
    it('should return true for valid PDF buffer', async () => {
      const pdfBuffer = await generatePDF('simple', {
        title: 'Test',
        content: 'Test',
      });

      expect(isValidPDF(pdfBuffer)).toBe(true);
    });

    it('should return false for invalid buffer', () => {
      const invalidBuffer = Buffer.from('not a pdf');
      expect(isValidPDF(invalidBuffer)).toBe(false);
    });

    it('should return false for empty buffer', () => {
      const emptyBuffer = Buffer.from('');
      expect(isValidPDF(emptyBuffer)).toBe(false);
    });

    it('should check PDF magic number (%PDF)', async () => {
      const pdfBuffer = await generatePDF('simple', {
        title: 'Test',
        content: 'Test',
      });

      const magicNumber = pdfBuffer.toString('utf8', 0, 4);
      expect(magicNumber).toBe('%PDF');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(512)).toBe('512 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB');
      expect(formatFileSize(2048)).toBe('2.00 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
      expect(formatFileSize(5 * 1024 * 1024)).toBe('5.00 MB');
    });
  });

  describe('estimatePageCount', () => {
    it('should estimate page count for simple PDF', async () => {
      const pdfBuffer = await generatePDF('simple', {
        title: 'Test',
        content: 'Test',
      });

      const pageCount = estimatePageCount(pdfBuffer);
      expect(pageCount).toBeGreaterThan(0);
    });

    it('should estimate page count for invoice PDF', async () => {
      const pdfBuffer = await generatePDF('invoice', {
        title: 'INVOICE',
        items: [{ description: 'Item', amount: 100 }],
      });

      const pageCount = estimatePageCount(pdfBuffer);
      expect(pageCount).toBeGreaterThan(0);
    });
  });

  describe('Base64 conversion', () => {
    it('should convert PDF to Base64', async () => {
      const pdfBuffer = await generatePDF('simple', {
        title: 'Test',
        content: 'Test',
      });

      const base64 = pdfBuffer.toString('base64');

      expect(base64).toBeTruthy();
      expect(base64.length).toBeGreaterThan(0);
      expect(typeof base64).toBe('string');
    });

    it('should create valid data URL', async () => {
      const pdfBuffer = await generatePDF('simple', {
        title: 'Test',
        content: 'Test',
      });

      const base64 = pdfBuffer.toString('base64');
      const dataUrl = `data:application/pdf;base64,${base64}`;

      expect(dataUrl).toMatch(/^data:application\/pdf;base64,/);
      expect(dataUrl.length).toBeGreaterThan(50);
    });

    it('should be reversible (Base64 back to Buffer)', async () => {
      const originalBuffer = await generatePDF('simple', {
        title: 'Test',
        content: 'Test',
      });

      const base64 = originalBuffer.toString('base64');
      const decodedBuffer = Buffer.from(base64, 'base64');

      expect(decodedBuffer.equals(originalBuffer)).toBe(true);
      expect(isValidPDF(decodedBuffer)).toBe(true);
    });
  });
});
