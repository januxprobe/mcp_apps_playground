/**
 * Simple PDF Generation Test
 *
 * This demonstrates how pdfkit works before we integrate it into an MCP app.
 * We'll generate a simple PDF and save it to see the result.
 */

import PDFDocument from 'pdfkit';
import fs from 'node:fs';

console.log('🔨 Generating test PDF...\n');

// Step 1: Create a new PDF document
const doc = new PDFDocument({
  size: 'A4',           // Paper size (A4, Letter, etc.)
  layout: 'portrait',   // Portrait or landscape
});

// Step 2: Set up a write stream to save the PDF to disk
const outputPath = './test-output.pdf';
const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Step 3: Add content to the PDF

// Title
doc
  .fontSize(20)              // Set font size
  .text('My First PDF!', 50, 50);  // Text, X position, Y position

// Subtitle
doc
  .fontSize(12)
  .text('Generated with pdfkit', 50, 80);

// Body text
doc
  .fontSize(10)
  .text('This is a test PDF created to understand how pdfkit works.', 50, 120);

// Add some metadata
doc
  .fontSize(8)
  .text(`Generated at: ${new Date().toLocaleString()}`, 50, 750);

// Step 4: Finalize the PDF (important!)
doc.end();

// Step 5: Wait for file to be written
writeStream.on('finish', () => {
  console.log('✅ PDF generated successfully!');
  console.log(`📄 File saved to: ${outputPath}`);
  console.log('\n💡 Open the file to see your first PDF!\n');
});

writeStream.on('error', (err) => {
  console.error('❌ Error generating PDF:', err);
});
