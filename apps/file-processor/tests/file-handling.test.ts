/**
 * Unit tests for file handling utilities
 */

import { describe, it, expect } from 'vitest';
import {
  validateUploadedFile,
  getMimeTypeFromMagicNumber,
  calculateChecksum,
  base64ToBuffer,
  bufferToBase64,
  getFileExtension,
  isValidFilename,
  sanitizeFilename,
  formatFileSize,
  FILE_UPLOAD_PRESETS,
  type UploadedFile,
} from '../../../infrastructure/server/utils/file-handling.js';

describe('File Handling Utilities', () => {
  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extension', () => {
      expect(getFileExtension('document.pdf')).toBe('pdf');
      expect(getFileExtension('image.PNG')).toBe('png');
      expect(getFileExtension('file.tar.gz')).toBe('gz');
    });

    it('should return empty string for no extension', () => {
      expect(getFileExtension('README')).toBe('');
    });
  });

  describe('isValidFilename', () => {
    it('should accept valid filenames', () => {
      expect(isValidFilename('document.pdf')).toBe(true);
      expect(isValidFilename('image_2024.png')).toBe(true);
      expect(isValidFilename('file-name.txt')).toBe(true);
    });

    it('should reject path traversal attempts', () => {
      expect(isValidFilename('../../../etc/passwd')).toBe(false);
      expect(isValidFilename('subdir/file.txt')).toBe(false);
      expect(isValidFilename('..\\windows\\system32')).toBe(false);
    });

    it('should reject null bytes', () => {
      expect(isValidFilename('file\0.txt')).toBe(false);
    });

    it('should reject empty filenames', () => {
      expect(isValidFilename('')).toBe(false);
      expect(isValidFilename('   ')).toBe(false);
    });

    it('should reject overly long filenames', () => {
      const longName = 'a'.repeat(256) + '.txt';
      expect(isValidFilename(longName)).toBe(false);
    });
  });

  describe('sanitizeFilename', () => {
    it('should sanitize unsafe characters', () => {
      expect(sanitizeFilename('my file!.pdf')).toBe('my_file_.pdf');
      expect(sanitizeFilename('файл.txt')).toBe('file.txt');
    });

    it('should collapse multiple underscores', () => {
      expect(sanitizeFilename('file___name.pdf')).toBe('file_name.pdf');
    });

    it('should trim underscores', () => {
      expect(sanitizeFilename('_file_.txt')).toBe('file_.txt');
    });

    it('should enforce length limit', () => {
      const longName = 'a'.repeat(300) + '.txt';
      const result = sanitizeFilename(longName);
      expect(result.length).toBeLessThanOrEqual(255);
    });
  });

  describe('base64ToBuffer and bufferToBase64', () => {
    it('should convert base64 to buffer and back', () => {
      const original = 'Hello, World!';
      const buffer = Buffer.from(original, 'utf8');
      const base64 = bufferToBase64(buffer);
      const decoded = base64ToBuffer(base64);

      expect(decoded.toString('utf8')).toBe(original);
    });

    it('should handle binary data', () => {
      const binaryData = Buffer.from([0x89, 0x50, 0x4E, 0x47]);
      const base64 = bufferToBase64(binaryData);
      const decoded = base64ToBuffer(base64);

      expect(decoded).toEqual(binaryData);
    });
  });

  describe('getMimeTypeFromMagicNumber', () => {
    it('should detect PNG files', () => {
      const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      expect(getMimeTypeFromMagicNumber(pngHeader)).toBe('image/png');
    });

    it('should detect JPEG files', () => {
      const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      expect(getMimeTypeFromMagicNumber(jpegHeader)).toBe('image/jpeg');
    });

    it('should detect PDF files', () => {
      const pdfHeader = Buffer.from([0x25, 0x50, 0x44, 0x46]);
      expect(getMimeTypeFromMagicNumber(pdfHeader)).toBe('application/pdf');
    });

    it('should return octet-stream for unknown types', () => {
      const unknownHeader = Buffer.from([0x00, 0x00, 0x00, 0x00]);
      expect(getMimeTypeFromMagicNumber(unknownHeader)).toBe('application/octet-stream');
    });
  });

  describe('calculateChecksum', () => {
    it('should generate consistent SHA-256 checksums', async () => {
      const content = 'Hello, World!';
      const base64 = Buffer.from(content, 'utf8').toString('base64');

      const checksum1 = await calculateChecksum(base64);
      const checksum2 = await calculateChecksum(base64);

      expect(checksum1).toBe(checksum2);
      expect(checksum1).toHaveLength(64); // SHA-256 hex length
    });

    it('should generate different checksums for different content', async () => {
      const base641 = Buffer.from('Content A', 'utf8').toString('base64');
      const base642 = Buffer.from('Content B', 'utf8').toString('base64');

      const checksum1 = await calculateChecksum(base641);
      const checksum2 = await calculateChecksum(base642);

      expect(checksum1).not.toBe(checksum2);
    });
  });

  describe('validateUploadedFile', () => {
    it('should accept valid files', async () => {
      const file: UploadedFile = {
        filename: 'test.png',
        mimeType: 'image/png',
        sizeBytes: 1024,
        base64Content: bufferToBase64(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])),
      };

      const result = await validateUploadedFile(file, {
        maxSizeBytes: 5 * 1024 * 1024,
        allowedMimeTypes: ['image/png', 'image/jpeg'],
        requireMagicNumberCheck: true,
      });

      expect(result.valid).toBe(true);
    });

    it('should reject files exceeding size limit', async () => {
      const file: UploadedFile = {
        filename: 'large.png',
        mimeType: 'image/png',
        sizeBytes: 20 * 1024 * 1024, // 20MB
        base64Content: 'dummy',
      };

      const result = await validateUploadedFile(file, {
        maxSizeBytes: 10 * 1024 * 1024, // 10MB limit
        allowedMimeTypes: ['image/png'],
        requireMagicNumberCheck: false,
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds limit');
    });

    it('should reject disallowed MIME types', async () => {
      const file: UploadedFile = {
        filename: 'script.js',
        mimeType: 'application/javascript',
        sizeBytes: 1024,
        base64Content: 'dummy',
      };

      const result = await validateUploadedFile(file, {
        maxSizeBytes: 5 * 1024 * 1024,
        allowedMimeTypes: ['image/png', 'image/jpeg'],
        requireMagicNumberCheck: false,
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('should detect MIME type mismatches with magic numbers', async () => {
      // Claim it's a PNG but provide JPEG header
      const file: UploadedFile = {
        filename: 'fake.png',
        mimeType: 'image/png',
        sizeBytes: 100,
        base64Content: bufferToBase64(Buffer.from([0xFF, 0xD8, 0xFF, 0xE0])), // JPEG header
      };

      const result = await validateUploadedFile(file, {
        maxSizeBytes: 5 * 1024 * 1024,
        allowedMimeTypes: ['image/png', 'image/jpeg'],
        requireMagicNumberCheck: true,
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('MIME type mismatch');
    });
  });

  describe('FILE_UPLOAD_PRESETS', () => {
    it('should have IMAGES preset', () => {
      expect(FILE_UPLOAD_PRESETS.IMAGES).toBeDefined();
      expect(FILE_UPLOAD_PRESETS.IMAGES.allowedMimeTypes).toContain('image/png');
      expect(FILE_UPLOAD_PRESETS.IMAGES.requireMagicNumberCheck).toBe(true);
    });

    it('should have DOCUMENTS preset', () => {
      expect(FILE_UPLOAD_PRESETS.DOCUMENTS).toBeDefined();
      expect(FILE_UPLOAD_PRESETS.DOCUMENTS.allowedMimeTypes).toContain('application/pdf');
    });

    it('should have PERMISSIVE preset', () => {
      expect(FILE_UPLOAD_PRESETS.PERMISSIVE).toBeDefined();
      expect(FILE_UPLOAD_PRESETS.PERMISSIVE.requireMagicNumberCheck).toBe(false);
    });
  });
});
