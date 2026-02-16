/**
 * File Processor Widget
 *
 * Handles file uploads and displays processing results
 */

import { App } from "@modelcontextprotocol/ext-apps";

// Initialize the MCP App bridge
const app = new App({
  name: "File Processor Widget",
  version: "1.0.0",
});

// Connect to the host
app.connect();

// Get DOM elements
const uploadArea = document.getElementById('upload-area')!;
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const fileSelected = document.getElementById('file-selected')!;
const selectedFilename = document.getElementById('selected-filename')!;
const selectedSize = document.getElementById('selected-size')!;
const selectedType = document.getElementById('selected-type')!;
const operationSelect = document.getElementById('operation-select') as HTMLSelectElement;
const processBtn = document.getElementById('process-btn') as HTMLButtonElement;
const loading = document.getElementById('loading')!;
const resultDiv = document.getElementById('result')!;

// State
let currentFile: File | null = null;
let currentBase64: string | null = null;

/**
 * Convert File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Handle file selection
 */
async function handleFileSelect(file: File) {
  currentFile = file;

  // Show file info
  selectedFilename.textContent = file.name;
  selectedSize.textContent = formatFileSize(file.size);
  selectedType.textContent = file.type || 'unknown';

  // Convert to base64
  try {
    currentBase64 = await fileToBase64(file);

    // Show file selected section
    fileSelected.classList.remove('hidden');
    resultDiv.classList.add('hidden');

    console.log('File selected:', file.name, formatFileSize(file.size));
  } catch (error) {
    console.error('Error reading file:', error);
    showError('Failed to read file');
  }
}

/**
 * Show error message
 */
function showError(message: string) {
  resultDiv.innerHTML = `
    <div class="error">
      <strong>❌ Error:</strong> ${escapeHtml(message)}
    </div>
  `;
  resultDiv.classList.remove('hidden');
}

/**
 * Show success message
 */
function showSuccess(message: string) {
  resultDiv.innerHTML = `
    <div class="success">
      <strong>✅ Success:</strong> ${escapeHtml(message)}
    </div>
  `;
  resultDiv.classList.remove('hidden');
}

/**
 * Display processing result
 */
function displayResult(data: any) {
  if (!data.success) {
    showError(data.error || 'Processing failed');
    return;
  }

  const { operation, filename, result } = data;

  let html = `
    <div class="result-section">
      <div class="result-title">
        ✅ ${operation.charAt(0).toUpperCase() + operation.slice(1)} Results
      </div>
  `;

  if (operation === 'validate') {
    html += `
      <div class="success">
        ✅ File passed all validation checks
      </div>
    `;
  } else if (operation === 'metadata') {
    html += `
      <div class="file-info">
        <span class="info-label">Filename:</span>
        <span class="info-value">${escapeHtml(result.filename)}</span>

        <span class="info-label">Size:</span>
        <span class="info-value">${result.size} (${result.sizeBytes.toLocaleString()} bytes)</span>

        <span class="info-label">MIME Type:</span>
        <span class="info-value">${escapeHtml(result.mimeType)}</span>

        <span class="info-label">Detected Type:</span>
        <span class="info-value">${escapeHtml(result.detectedMimeType)}</span>

        <span class="info-label">SHA-256:</span>
        <span class="info-value" style="font-family: monospace; font-size: 11px;">${result.checksum}</span>

        <span class="info-label">Uploaded:</span>
        <span class="info-value">${new Date(result.uploadedAt).toLocaleString()}</span>
      </div>
    `;
  } else if (operation === 'analyze') {
    html += `
      <div class="result-content">${JSON.stringify(result, null, 2)}</div>
    `;
  }

  html += `</div>`;

  resultDiv.innerHTML = html;
  resultDiv.classList.remove('hidden');
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Process the selected file
 */
async function processFile() {
  if (!currentFile || !currentBase64) {
    showError('No file selected');
    return;
  }

  const operation = operationSelect.value;

  // Show loading
  loading.classList.remove('hidden');
  resultDiv.classList.add('hidden');
  processBtn.disabled = true;

  try {
    console.log('Processing file:', currentFile.name, 'operation:', operation);

    // Call server tool
    const result = await app.callServerTool({
      name: 'process_file',
      arguments: {
        filename: currentFile.name,
        mimeType: currentFile.type || 'application/octet-stream',
        base64Content: currentBase64,
        operation,
      },
    });

    console.log('Processing result:', result);

    // Handle result directly (ontoolresult may not be called for widget-initiated calls)
    if (result.structuredContent) {
      displayResult(result.structuredContent);
    } else {
      showError('Invalid response from server');
    }

  } catch (error) {
    console.error('Error processing file:', error);
    showError(error instanceof Error ? error.message : 'Unknown error');
  } finally {
    // Always hide loading and re-enable button
    loading.classList.add('hidden');
    processBtn.disabled = false;
  }
}

// Handle tool result from server
app.ontoolresult = (result) => {
  console.log('Received tool result:', result);

  loading.classList.add('hidden');
  processBtn.disabled = false;

  if (result.structuredContent) {
    displayResult(result.structuredContent);
  } else {
    showError('Invalid response from server');
  }
};

// File input change event
fileInput.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    handleFileSelect(file);
  }
});

// Upload area click - trigger file input
uploadArea.addEventListener('click', () => {
  fileInput.click();
});

// Drag and drop support
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');

  const file = e.dataTransfer?.files[0];
  if (file) {
    handleFileSelect(file);
  }
});

// Process button click
processBtn.addEventListener('click', processFile);

console.log('File Processor widget initialized');
