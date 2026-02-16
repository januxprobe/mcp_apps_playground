/**
 * File Upload and Validation Utilities
 *
 * Provides secure file handling patterns for MCP apps including:
 * - MIME type validation
 * - Magic number verification (file signature checking)
 * - Size limit enforcement
 * - Base64 encoding/decoding
 * - File metadata extraction
 * - Security validation
 */

export interface FileUploadOptions {
  /** Maximum file size in bytes */
  maxSizeBytes: number;

  /** Allowed MIME types (e.g., ['image/png', 'image/jpeg']) */
  allowedMimeTypes: string[];

  /** Whether to verify file signature (magic numbers) */
  requireMagicNumberCheck: boolean;

  /** Custom validation function (optional) */
  customValidator?: (file: UploadedFile) => Promise<ValidationResult>;
}

export interface UploadedFile {
  /** Original filename */
  filename: string;

  /** MIME type (from client) */
  mimeType: string;

  /** File size in bytes */
  sizeBytes: number;

  /** Base64-encoded file content */
  base64Content: string;

  /** File metadata */
  metadata?: {
    uploadedAt?: string;
    checksum?: string;
    [key: string]: any;
  };
}

export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;

  /** Error message if validation failed */
  error?: string;

  /** Additional validation details */
  details?: {
    detectedMimeType?: string;
    actualSize?: number;
    [key: string]: any;
  };
}

/**
 * Magic number signatures for common file types
 * Reference: https://en.wikipedia.org/wiki/List_of_file_signatures
 */
const MAGIC_NUMBERS: Array<{ bytes: number[]; mimeType: string; extension: string }> = [
  // Images
  { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], mimeType: 'image/png', extension: 'png' },
  { bytes: [0xFF, 0xD8, 0xFF], mimeType: 'image/jpeg', extension: 'jpg' },
  { bytes: [0x47, 0x49, 0x46, 0x38], mimeType: 'image/gif', extension: 'gif' },
  { bytes: [0x42, 0x4D], mimeType: 'image/bmp', extension: 'bmp' },
  { bytes: [0x49, 0x49, 0x2A, 0x00], mimeType: 'image/tiff', extension: 'tif' },
  { bytes: [0x4D, 0x4D, 0x00, 0x2A], mimeType: 'image/tiff', extension: 'tif' },

  // Documents
  { bytes: [0x25, 0x50, 0x44, 0x46], mimeType: 'application/pdf', extension: 'pdf' },
  { bytes: [0x50, 0x4B, 0x03, 0x04], mimeType: 'application/zip', extension: 'zip' },
  { bytes: [0xD0, 0xCF, 0x11, 0xE0], mimeType: 'application/msword', extension: 'doc' },

  // Text
  { bytes: [0xEF, 0xBB, 0xBF], mimeType: 'text/plain', extension: 'txt' }, // UTF-8 BOM

  // Archives
  { bytes: [0x1F, 0x8B], mimeType: 'application/gzip', extension: 'gz' },
  { bytes: [0x52, 0x61, 0x72, 0x21], mimeType: 'application/x-rar-compressed', extension: 'rar' },

  // Audio/Video
  { bytes: [0x49, 0x44, 0x33], mimeType: 'audio/mpeg', extension: 'mp3' },
  { bytes: [0x66, 0x74, 0x79, 0x70], mimeType: 'video/mp4', extension: 'mp4' },
];

/**
 * Validates an uploaded file against security and format requirements
 */
export async function validateUploadedFile(
  file: UploadedFile,
  options: FileUploadOptions
): Promise<ValidationResult> {
  // Size validation
  if (file.sizeBytes > options.maxSizeBytes) {
    return {
      valid: false,
      error: `File size ${formatFileSize(file.sizeBytes)} exceeds limit of ${formatFileSize(options.maxSizeBytes)}`,
      details: { actualSize: file.sizeBytes },
    };
  }

  // MIME type validation
  if (!options.allowedMimeTypes.includes(file.mimeType)) {
    return {
      valid: false,
      error: `MIME type '${file.mimeType}' not allowed. Allowed types: ${options.allowedMimeTypes.join(', ')}`,
    };
  }

  // Magic number verification (optional but recommended)
  if (options.requireMagicNumberCheck) {
    const buffer = base64ToBuffer(file.base64Content);
    const detectedMime = getMimeTypeFromMagicNumber(buffer);

    if (detectedMime !== file.mimeType && detectedMime !== 'application/octet-stream') {
      return {
        valid: false,
        error: `MIME type mismatch: claimed '${file.mimeType}', but file signature indicates '${detectedMime}'`,
        details: { detectedMimeType: detectedMime },
      };
    }
  }

  // Custom validation (if provided)
  if (options.customValidator) {
    const customResult = await options.customValidator(file);
    if (!customResult.valid) {
      return customResult;
    }
  }

  // All validations passed
  return { valid: true };
}

/**
 * Detects MIME type from file's magic number (first bytes)
 */
export function getMimeTypeFromMagicNumber(buffer: Buffer): string {
  for (const magic of MAGIC_NUMBERS) {
    if (matchesMagicNumber(buffer, magic.bytes)) {
      return magic.mimeType;
    }
  }

  // Unknown file type
  return 'application/octet-stream';
}

/**
 * Checks if buffer starts with the given magic number bytes
 */
function matchesMagicNumber(buffer: Buffer, magicBytes: number[]): boolean {
  if (buffer.length < magicBytes.length) {
    return false;
  }

  return magicBytes.every((byte, index) => buffer[index] === byte);
}

/**
 * Calculates SHA-256 checksum of file content
 */
export async function calculateChecksum(base64Content: string): Promise<string> {
  const crypto = await import('crypto');
  const buffer = base64ToBuffer(base64Content);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Converts base64 string to Buffer
 */
export function base64ToBuffer(base64: string): Buffer {
  return Buffer.from(base64, 'base64');
}

/**
 * Converts Buffer to base64 string
 */
export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}

/**
 * Extracts file extension from filename
 */
export function getFileExtension(filename: string): string {
  const match = filename.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : '';
}

/**
 * Validates filename for security (prevents path traversal, etc.)
 */
export function isValidFilename(filename: string): boolean {
  // Prevent path traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false;
  }

  // Prevent null bytes
  if (filename.includes('\0')) {
    return false;
  }

  // Require non-empty filename
  if (filename.trim().length === 0) {
    return false;
  }

  // Reasonable length limit
  if (filename.length > 255) {
    return false;
  }

  return true;
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Sanitizes filename by removing/replacing unsafe characters
 */
export function sanitizeFilename(filename: string): string {
  const sanitized = filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe chars with underscore
    .replace(/_{2,}/g, '_')            // Collapse multiple underscores
    .replace(/^_+|_+$/g, '')           // Trim underscores from ends
    .substring(0, 255);                // Enforce length limit

  // If result is empty or just an extension, provide a fallback
  // This prevents hidden files (Unix) and ensures valid filename
  if (sanitized.length === 0 || sanitized.startsWith('.')) {
    return 'file' + sanitized;
  }

  return sanitized;
}

/**
 * Common file upload configurations
 */
export const FILE_UPLOAD_PRESETS = {
  /** Images only (PNG, JPEG, GIF) - 5MB limit */
  IMAGES: {
    maxSizeBytes: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif'],
    requireMagicNumberCheck: true,
  } as FileUploadOptions,

  /** Documents (PDF, DOC, TXT) - 10MB limit */
  DOCUMENTS: {
    maxSizeBytes: 10 * 1024 * 1024,
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    requireMagicNumberCheck: true,
  } as FileUploadOptions,

  /** Any file type - 50MB limit (use with caution) */
  PERMISSIVE: {
    maxSizeBytes: 50 * 1024 * 1024,
    allowedMimeTypes: ['*'],
    requireMagicNumberCheck: false,
  } as FileUploadOptions,
};
