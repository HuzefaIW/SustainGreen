import {
  validateImageBuffer,
  computeImageHash,
  checkDuplicateSubmission,
  recordProcessedSubmission,
  analyzeFoodPlateImage,
  getCalibratedPresetAudit,
  FoodAuditAnalysis,
} from './geminiVision.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASSED: ${message}`);
    passedTests++;
  } else {
    console.error(`❌ FAILED: ${message}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('\n--- Running EcoPulse Gemini Vision & Image Validation Unit Tests ---\n');

  // ── Suite 1: Magic Bytes & Image Format Validation ──────────
  console.log('[Suite 1: Magic Bytes & Format Validation]');
  
  // Valid JPEG header
  const jpegHeader = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(50)]);
  const jpegResult = validateImageBuffer(jpegHeader);
  assert(jpegResult.valid === true, 'Valid JPEG buffer recognized');
  assert(jpegResult.mimeType === 'image/jpeg', 'JPEG MIME type correctly identified');

  // Valid PNG header
  const pngHeader = Buffer.concat([Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), Buffer.alloc(50)]);
  const pngResult = validateImageBuffer(pngHeader);
  assert(pngResult.valid === true, 'Valid PNG buffer recognized');
  assert(pngResult.mimeType === 'image/png', 'PNG MIME type correctly identified');

  // Valid WebP header: RIFF + 4 bytes + WEBP
  const webpHeader = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([0x00, 0x00, 0x00, 0x00]),
    Buffer.from('WEBP', 'ascii'),
    Buffer.alloc(30)
  ]);
  const webpResult = validateImageBuffer(webpHeader);
  assert(webpResult.valid === true, 'Valid WebP buffer recognized');
  assert(webpResult.mimeType === 'image/webp', 'WebP MIME type correctly identified');

  // Non-image text buffer
  const textBuffer = Buffer.from('This is a text string masquerading as an image upload.');
  const textResult = validateImageBuffer(textBuffer);
  assert(textResult.valid === false, 'Text buffer masquerading as image is rejected');
  assert(textResult.error?.includes('Unsupported image format') === true, 'Descriptive error returned for invalid magic bytes');

  // Corrupt / tiny buffer
  const tinyBuffer = Buffer.from([0xFF, 0xD8]);
  const tinyResult = validateImageBuffer(tinyBuffer);
  assert(tinyResult.valid === false, 'Buffer under 32 bytes is rejected as corrupt');

  // Oversized buffer (>10MB)
  const oversizedBuffer = Buffer.alloc(11 * 1024 * 1024);
  const oversizedResult = validateImageBuffer(oversizedBuffer);
  assert(oversizedResult.valid === false, 'Buffer over 10MB is rejected');
  assert(oversizedResult.error?.includes('exceeds maximum allowable size') === true, 'Oversized error states 10MB limit');

  // ── Suite 2: SHA-256 Fingerprinting & Duplicate Protection ──────────
  console.log('\n[Suite 2: SHA-256 Fingerprinting & Duplicate Protection]');

  const testBuffer = Buffer.concat([jpegHeader, Buffer.from('unique-test-plate-data-123')]);
  const hash1 = computeImageHash(testBuffer);
  const hash2 = computeImageHash(testBuffer);
  assert(hash1 === hash2, 'SHA-256 image hash is deterministic');
  assert(hash1.length === 64, 'SHA-256 produces 64-character hex string');

  // Unprocessed hash returns null
  assert(checkDuplicateSubmission(hash1) === null, 'Unprocessed image hash returns null from duplicate check');

  // Record submission
  const dummyAudit: FoodAuditAnalysis = {
    isFoodImage: true,
    visibleFoodItems: ['Rice', 'Dal'],
    remainingPortionPercent: 20,
    estimatedLeftoverWeightGrams: 76,
    servingWeightAssumption: '380g standard thali reference',
    visualObservations: 'Plate inspected.',
    uncertainty: 'low',
    limitations: null,
    greenCreditsEarned: 5,
    isDuplicate: false,
    source: 'GEMINI_VISION',
  };
  recordProcessedSubmission(hash1, dummyAudit);

  // Subsequent check recognizes duplicate
  const duplicateRecord = checkDuplicateSubmission(hash1);
  assert(duplicateRecord !== null, 'Recorded submission is identified as duplicate');
  assert(duplicateRecord?.isDuplicate === true, 'Duplicate flag is true on repeated check');
  assert(duplicateRecord?.greenCreditsEarned === 0, 'Zero points awarded on duplicate submission');

  // ── Suite 3: Missing API Key & Error Handling ──────────
  console.log('\n[Suite 3: Missing API Key & Error Handling]');

  const origKey = process.env.GEMINI_API_KEY;
  const origGoogleKey = process.env.GOOGLE_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.GOOGLE_API_KEY;

  const missingKeyBuffer = Buffer.concat([jpegHeader, Buffer.from('fresh-plate-data-456')]);
  const missingKeyRes = await analyzeFoodPlateImage({
    imageBuffer: missingKeyBuffer,
    mimeType: 'image/jpeg',
  });

  assert(missingKeyRes.success === false, 'Call fails gracefully when GEMINI_API_KEY is missing');
  assert(missingKeyRes.code === 'MISSING_API_KEY', 'Error code is MISSING_API_KEY');
  assert(missingKeyRes.error?.includes('GEMINI_API_KEY') === true, 'Error message instructs user to configure key');

  // Restore env
  if (origKey) process.env.GEMINI_API_KEY = origKey;
  if (origGoogleKey) process.env.GOOGLE_API_KEY = origGoogleKey;

  // ── Suite 4: Calibrated Preset Simulation Mode ──────────
  console.log('\n[Suite 4: Calibrated Preset Simulation Mode]');

  const cleanAudit = getCalibratedPresetAudit('CLEAN_TRAY', 380);
  assert(cleanAudit.source === 'CALIBRATED_PRESET_SIMULATION', 'Preset source is CALIBRATED_PRESET_SIMULATION');
  assert(cleanAudit.remainingPortionPercent === 5, 'CLEAN_TRAY has 5% leftover benchmark');
  assert(cleanAudit.estimatedLeftoverWeightGrams === 19, '5% of 380g is 19g');
  assert(cleanAudit.greenCreditsEarned === 5, 'Participation points is 5');

  const normalAudit = getCalibratedPresetAudit('NORMAL_TRAY', 380);
  assert(normalAudit.remainingPortionPercent === 24, 'NORMAL_TRAY has 24% leftover benchmark');
  assert(normalAudit.estimatedLeftoverWeightGrams === 91, '24% of 380g is 91g');

  const heavyAudit = getCalibratedPresetAudit('HEAVY_WASTE', 500); // with custom 500g meal
  assert(heavyAudit.remainingPortionPercent === 42, 'HEAVY_WASTE has 42% leftover benchmark');
  assert(heavyAudit.estimatedLeftoverWeightGrams === 210, '42% of 500g is 210g');
  assert(heavyAudit.servingWeightAssumption.includes('500g'), 'Assumption specifies 500g custom weight');

  // ── Summary ──────────
  console.log('\n==========================================');
  console.log(`Test Results: ${passedTests} Passed, ${failedTests} Failed`);
  console.log('==========================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test runner error:', e);
  process.exit(1);
});
