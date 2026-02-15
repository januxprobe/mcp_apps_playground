/**
 * PDF Generation - Base64 Pattern
 *
 * This demonstrates how to generate a PDF in MEMORY (not saved to disk)
 * and convert it to Base64 - the pattern we'll use in our MCP app.
 */

import PDFDocument from 'pdfkit';

console.log('🔨 Generating PDF in memory...\n');

/**
 * Generate PDF and return as Buffer (in memory)
 */
async function generatePDF(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // Array to collect PDF chunks as they're generated
    const chunks: Buffer[] = [];

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'portrait',
    });

    // Collect chunks in memory (instead of writing to disk)
    doc.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
      console.log(`  📦 Received chunk: ${chunk.length} bytes`);
    });

    // When done, combine all chunks into single Buffer
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      console.log(`  ✅ PDF complete: ${pdfBuffer.length} bytes total\n`);
      resolve(pdfBuffer);
    });

    // Error handling
    doc.on('error', reject);

    // Add content
    doc
      .fontSize(20)
      .text('PDF in Memory!', 50, 50);

    doc
      .fontSize(12)
      .text('This PDF was never saved to disk.', 50, 80);

    doc
      .fontSize(10)
      .text('It exists only as a Buffer in memory, ready to be converted to Base64.', 50, 120);

    // Finalize
    doc.end();
  });
}

// Test it!
async function test() {
  // Step 1: Generate PDF in memory
  const pdfBuffer = await generatePDF();

  // Step 2: Convert to Base64
  const base64 = pdfBuffer.toString('base64');
  console.log('📝 Base64 string (first 100 chars):');
  console.log(`   ${base64.substring(0, 100)}...\n`);

  // Step 3: Create data URL (what we'll return to the widget)
  const dataUrl = `data:application/pdf;base64,${base64}`;
  console.log('🔗 Data URL (first 150 chars):');
  console.log(`   ${dataUrl.substring(0, 150)}...\n`);

  console.log('✅ Success! This is the pattern we\'ll use in the MCP app:\n');
  console.log('   1. Generate PDF → Buffer');
  console.log('   2. Convert to Base64 string');
  console.log('   3. Return data URL to widget');
  console.log('   4. Widget displays in <iframe>\n');
}

test().catch(console.error);
