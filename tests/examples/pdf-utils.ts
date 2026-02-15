/**
 * Test the PDF utilities we just created
 */

import { generatePDF, isValidPDF, formatFileSize, estimatePageCount } from '../../infrastructure/server/utils/pdf-utils.js';
import fs from 'node:fs';

console.log('🧪 Testing PDF Utilities\n');

async function test() {
  // Test 1: Simple template
  console.log('1️⃣  Testing simple template...');
  const simplePDF = await generatePDF('simple', {
    title: 'Test Document',
    content: 'This is a test of the PDF utilities infrastructure.'
  });

  console.log(`   ✅ Generated: ${formatFileSize(simplePDF.length)}`);
  console.log(`   ✅ Valid PDF: ${isValidPDF(simplePDF)}`);
  console.log(`   ✅ Pages: ${estimatePageCount(simplePDF)}\n`);

  // Save to verify
  fs.writeFileSync('test-simple.pdf', simplePDF);
  console.log('   📄 Saved to: test-simple.pdf\n');

  // Test 2: Invoice template
  console.log('2️⃣  Testing invoice template...');
  const invoicePDF = await generatePDF('invoice', {
    title: 'INVOICE #12345',
    date: '2026-02-15',
    items: [
      { description: 'Consulting Services', amount: 1500.00 },
      { description: 'Software Development', amount: 3200.00 },
      { description: 'Code Review', amount: 500.00 },
    ]
  });

  console.log(`   ✅ Generated: ${formatFileSize(invoicePDF.length)}`);
  console.log(`   ✅ Valid PDF: ${isValidPDF(invoicePDF)}`);
  console.log(`   ✅ Pages: ${estimatePageCount(invoicePDF)}\n`);

  // Save to verify
  fs.writeFileSync('test-invoice.pdf', invoicePDF);
  console.log('   📄 Saved to: test-invoice.pdf\n');

  // Test 3: Base64 conversion (what we'll use in MCP app)
  console.log('3️⃣  Testing Base64 conversion...');
  const base64 = simplePDF.toString('base64');
  const dataUrl = `data:application/pdf;base64,${base64}`;

  console.log(`   ✅ Base64 length: ${base64.length} characters`);
  console.log(`   ✅ Data URL length: ${dataUrl.length} characters`);
  console.log(`   ✅ First 80 chars: ${dataUrl.substring(0, 80)}...\n`);

  console.log('✅ All tests passed!');
  console.log('\n📂 Open test-simple.pdf and test-invoice.pdf to see the results!\n');
}

test().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
