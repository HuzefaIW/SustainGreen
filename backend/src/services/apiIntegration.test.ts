import express from 'express';
import cors from 'cors';
import { CampusEnergySimulator } from '../simulator/energySimulator.js';
import {
  analyzeFoodPlateImage,
  getCalibratedPresetAudit,
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

async function runApiIntegrationTests() {
  console.log('\n--- Running EcoPulse /api/scan-plate API Integration Tests ---\n');

  // Set up mock test app matching Express implementation in index.ts
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  const simulator = new CampusEnergySimulator();
  let departmentLeaderboard = [
    { rank: 1, department: 'Computer Science & Engg (Main Block)', code: 'CSE', greenCredits: 4420, kwhSaved: 365, auditsCompleted: 28 },
    { rank: 2, department: 'Mechanical Engineering (Mech Block)', code: 'ME', greenCredits: 3980, kwhSaved: 310, auditsCompleted: 22 },
    { rank: 3, department: 'Central Hostel Dining Council', code: 'HOSTEL', greenCredits: 2710, kwhSaved: 170, auditsCompleted: 35 },
  ];

  function findLeaderboardDepartment(deptName: string) {
    const norm = deptName.toLowerCase();
    if (norm.includes('hostel') || norm.includes('dining')) return departmentLeaderboard.find(d => d.code === 'HOSTEL');
    if (norm.includes('computer') || norm.includes('cse')) return departmentLeaderboard.find(d => d.code === 'CSE');
    return departmentLeaderboard[0];
  }

  app.post('/api/scan-plate', async (req, res) => {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      originalServingWeightGrams,
      simulatedPlateType = 'NORMAL_TRAY',
      mode,
      department = 'Central Hostel Dining Council',
      submissionId,
    } = req.body;

    const targetDept = findLeaderboardDepartment(department) || departmentLeaderboard[0];
    const hasImage = typeof imageBase64 === 'string' && imageBase64.trim().length > 0;

    if (hasImage && mode !== 'PRESET') {
      try {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, '').trim();
        const imageBuffer = Buffer.from(cleanBase64, 'base64');

        const result = await analyzeFoodPlateImage({
          imageBuffer,
          mimeType,
          originalServingWeightGrams: typeof originalServingWeightGrams === 'number' && originalServingWeightGrams > 0 ? originalServingWeightGrams : null,
          submissionId,
          department,
        });

        if (!result.success || !result.analysis) {
          const httpStatus = result.code === 'MISSING_API_KEY' ? 503 : result.code === 'NOT_FOOD_IMAGE' ? 422 : 400;
          res.status(httpStatus).json({
            status: 'error',
            error: result.error || 'Failed to analyze food plate image.',
            code: result.code || 'UNKNOWN_ERROR',
          });
          return;
        }

        const { analysis } = result;

        if (!analysis.isDuplicate && targetDept) {
          targetDept.greenCredits += analysis.greenCreditsEarned;
          targetDept.auditsCompleted = (targetDept.auditsCompleted || 0) + 1;
        }

        res.status(200).json({
          status: 'success',
          audit: { ...analysis, department: targetDept.department },
        });
        return;
      } catch (err: any) {
        res.status(500).json({ status: 'error', error: 'Internal server error' });
        return;
      }
    }

    // Preset mode
    const servingGrams = typeof originalServingWeightGrams === 'number' && originalServingWeightGrams > 0 ? originalServingWeightGrams : 380;
    const presetAudit = getCalibratedPresetAudit(simulatedPlateType, servingGrams);

    if (targetDept) {
      targetDept.greenCredits += presetAudit.greenCreditsEarned;
      targetDept.auditsCompleted = (targetDept.auditsCompleted || 0) + 1;
    }

    res.status(200).json({
      status: 'success',
      audit: { ...presetAudit, department: targetDept.department },
    });
  });

  const server = app.listen(0);
  const address = server.address() as any;
  const baseUrl = `http://localhost:${address.port}`;

  try {
    // Test 1: Calibrated Preset Audit credits +5 points
    const hostelBefore = departmentLeaderboard.find(d => d.code === 'HOSTEL')!.greenCredits;
    const hostelAuditsBefore = departmentLeaderboard.find(d => d.code === 'HOSTEL')!.auditsCompleted;

    const presetRes = await fetch(`${baseUrl}/api/scan-plate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'PRESET',
        simulatedPlateType: 'NORMAL_TRAY',
        department: 'Central Hostel Dining Council',
      }),
    });
    const presetData = await presetRes.json() as any;

    assert(presetRes.status === 200, 'Preset scan endpoint returns HTTP 200');
    assert(presetData.status === 'success', 'Response status is success');
    assert(presetData.audit.source === 'CALIBRATED_PRESET_SIMULATION', 'Audit source is CALIBRATED_PRESET_SIMULATION');
    assert(presetData.audit.greenCreditsEarned === 5, 'Audit awards exactly +5 participation credits');
    
    const hostelAfter = departmentLeaderboard.find(d => d.code === 'HOSTEL')!.greenCredits;
    const hostelAuditsAfter = departmentLeaderboard.find(d => d.code === 'HOSTEL')!.auditsCompleted;
    assert(hostelAfter === hostelBefore + 5, 'Leaderboard department greenCredits incremented by +5');
    assert(hostelAuditsAfter === hostelAuditsBefore + 1, 'Leaderboard department auditsCompleted incremented by 1');

    // Test 2: Invalid text disguised as base64 image rejected with HTTP 400
    const fakeBase64 = Buffer.from('Plain text fake image content masquerading as a photograph file.').toString('base64');
    const fakeRes = await fetch(`${baseUrl}/api/scan-plate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'IMAGE',
        imageBase64: `data:image/jpeg;base64,${fakeBase64}`,
      }),
    });
    const fakeData = await fakeRes.json() as any;

    assert(fakeRes.status === 400, 'Fake image buffer rejected with HTTP 400');
    assert(fakeData.code === 'INVALID_IMAGE', 'Error code is INVALID_IMAGE');
    assert(fakeData.error?.includes('Unsupported image format'), 'Returns clear unsupported image format explanation');

    // Test 3: Missing API key handling returns HTTP 503 without crashing
    const validJpegBytes = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(100)]);
    const validBase64 = validJpegBytes.toString('base64');

    const origKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_API_KEY;

    const noKeyRes = await fetch(`${baseUrl}/api/scan-plate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'IMAGE',
        imageBase64: `data:image/jpeg;base64,${validBase64}`,
      }),
    });
    const noKeyData = await noKeyRes.json() as any;

    assert(noKeyRes.status === 503, 'Missing API key returns HTTP 503');
    assert(noKeyData.code === 'MISSING_API_KEY', 'Error code is MISSING_API_KEY');
    assert(noKeyData.error?.includes('GEMINI_API_KEY'), 'Explains how to set GEMINI_API_KEY');

    if (origKey) process.env.GEMINI_API_KEY = origKey;

    // Test 4: Custom serving weight derivation
    const customWeightRes = await fetch(`${baseUrl}/api/scan-plate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'PRESET',
        simulatedPlateType: 'CLEAN_TRAY',
        originalServingWeightGrams: 500,
      }),
    });
    const customWeightData = await customWeightRes.json() as any;
    assert(customWeightData.audit.estimatedLeftoverWeightGrams === 25, '5% of 500g is derived as 25g');
    assert(customWeightData.audit.servingWeightAssumption.includes('500g'), 'Assumption specifies 500g meal');

  } finally {
    server.close();
  }

  console.log('\n==========================================');
  console.log(`Integration Test Results: ${passedTests} Passed, ${failedTests} Failed`);
  console.log('==========================================\n');

  if (failedTests > 0) process.exit(1);
}

runApiIntegrationTests().catch((e) => {
  console.error('Fatal API integration test error:', e);
  process.exit(1);
});
