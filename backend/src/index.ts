import express from 'express';
import cors from 'cors';
import { CampusEnergySimulator } from './simulator/energySimulator.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const simulator = new CampusEnergySimulator();

// Department Green Credits State
interface DepartmentScore {
  rank: number;
  department: string;
  code: string;
  greenCredits: number;
  kwhSaved: number;
  auditsCompleted: number;
}

let departmentLeaderboard: DepartmentScore[] = [
  { rank: 1, department: 'Computer Science & Engg (Main Block)', code: 'CSE', greenCredits: 4420, kwhSaved: 365, auditsCompleted: 28 },
  { rank: 2, department: 'Mechanical Engineering (Mech Block)', code: 'ME', greenCredits: 3980, kwhSaved: 310, auditsCompleted: 22 },
  { rank: 3, department: 'Management Studies (MBA Block)', code: 'MBA', greenCredits: 3450, kwhSaved: 245, auditsCompleted: 19 },
  { rank: 4, department: 'Information Technology (Main Block)', code: 'IT', greenCredits: 2980, kwhSaved: 195, auditsCompleted: 14 },
  { rank: 5, department: 'Central Hostel Dining Council', code: 'HOSTEL', greenCredits: 2710, kwhSaved: 170, auditsCompleted: 35 },
];

// 1. Campus Status & NILM Telemetry
// Single snapshot per request — getStatus() adds random jitter on every call,
// so deriving totals from separate calls produces contradictory readings.
app.get('/api/campus-status', (_req, res) => {
  const snapshot = simulator.getStatus();
  res.json({
    timestamp: new Date().toISOString(),
    blocks: snapshot,
    totalActiveWatts: snapshot.reduce((sum, b) => sum + b.activePowerWatts, 0),
    activeGhostLeaksCount: snapshot.filter((b) => b.hasGhostLeak).length,
    campusTotalPowerFactor: 0.96,
  });
});

// 2. Resolve Leak Endpoint (Remote load cut-off simulation)
app.post('/api/resolve-leak', (req, res) => {
  const { blockId } = req.body;
  if (!blockId) {
    res.status(400).json({ error: 'blockId is required' });
    return;
  }
  const result = simulator.resolveLeak(blockId);
  if (result.success && result.log) {
    // Correctly attribute credits to the block's actual department
    const blockDept = result.log.department.toLowerCase();
    const dept = departmentLeaderboard.find((d) => 
      d.department.toLowerCase().includes(blockDept) ||
      blockDept.includes(d.code.toLowerCase())
    ) || departmentLeaderboard[0];

    if (dept) {
      dept.greenCredits += 50;
      dept.kwhSaved += Math.round(result.log.kwhPrevented || 4);
      departmentLeaderboard.sort((a, b) => b.greenCredits - a.greenCredits);
      departmentLeaderboard.forEach((d, idx) => (d.rank = idx + 1));
    }
  }
  res.json({
    success: result.success,
    message: result.success ? 'Simulated leak resolved & load returned to baseline.' : 'Leak not found or already resolved.',
    log: result.log,
  });
});

// 3. Trigger Demo Leak (For Live Hackathon Demos)
app.post('/api/trigger-demo-leak', (req, res) => {
  const { blockId = 'svvv-blk-a-cs-lab-2' } = req.body;
  const success = simulator.triggerDemoLeak(blockId);
  res.json({ success, message: 'Simulated Ghost Leak triggered for demonstration.' });
});

// 4. 24-Hour Telemetry History
app.get('/api/campus-history', (_req, res) => {
  res.json({
    history: simulator.get24HourTelemetry(),
  });
});

// 5. Verifiable Audit Trail
app.get('/api/audit-logs', (_req, res) => {
  res.json({
    logs: simulator.getAuditLogs(),
  });
});

// 6. Department Leaderboard
app.get('/api/leaderboard', (_req, res) => {
  res.json({
    standings: departmentLeaderboard,
  });
});

// 7. Predictive Mess Kitchen Engine
app.get('/api/mess-forecast', (req, res) => {
  const day = (req.query.day as string) || 'Monday';
  const weather = (req.query.weather as string) || 'Sunny'; // Sunny | Rainy
  const isExam = req.query.isExam === 'true';
  const totalHostelStudents = 1200;

  const dayFactors: Record<string, number> = {
    Monday: 0.92,
    Tuesday: 0.90,
    Wednesday: 0.88,
    Thursday: 0.84,
    Friday: 0.70, // Weekend departures
    Saturday: 0.62,
    Sunday: 0.68,
  };

  let factor = dayFactors[day] || 0.85;
  if (weather === 'Rainy') factor += 0.06; // Rain keeps students on-campus
  if (isExam) factor += 0.08;             // Exams spike hostel dining

  const expectedDiners = Math.min(totalHostelStudents, Math.round(totalHostelStudents * factor));
  const conventionalCookKg = Math.round(totalHostelStudents * 0.38); // 380g per head
  const optimizedCookKg = Math.round(expectedDiners * 0.36);
  const savedFoodKg = Math.max(0, conventionalCookKg - optimizedCookKg);
  const costSavedInr = Math.round(savedFoodKg * 85);
  const co2eSavedKg = Number((savedFoodKg * 2.5).toFixed(1));
  const waterSavedLiters = savedFoodKg * 1200;

  // Recipe Bill of Materials (BOM) Decomposition
  const bom = {
    grainRiceKg: Math.round(expectedDiners * 0.12),
    dalPulsesKg: Math.round(expectedDiners * 0.05),
    wheatFlourAttaKg: Math.round(expectedDiners * 0.09),
    freshVegetablesKg: Math.round(expectedDiners * 0.14),
    cookingOilLiters: Math.round(expectedDiners * 0.02),
  };

  res.json({
    day,
    weather,
    isExam,
    totalHostelStudents,
    expectedDiners,
    conventionalCookKg,
    optimizedCookKg,
    savedFoodKg,
    costSavedInr,
    co2eSavedKg,
    waterSavedLiters,
    bom,
  });
});

// 8. Food Waste Audit (Calibrated Plate Preset & Inspection Simulation)
app.post('/api/scan-plate', (req, res) => {
  const { imageBase64, isWebcam = false, simulatedPlateType = 'NORMAL_TRAY', department = 'Central Hostel Dining Council' } = req.body;

  // Real Camera Image Validation:
  // If user turned on camera, verify frame has illumination and content
  if (isWebcam && imageBase64) {
    try {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      if (buffer.length < 5000) {
        res.status(400).json({
          status: 'error',
          error: 'Camera frame underexposed or blurred. Please hold tray steady.',
        });
        return;
      }

      let warmFoodBytes = 0;
      let coolRoomBytes = 0;
      const step = Math.max(1, Math.floor(buffer.length / 5000));
      for (let i = 0; i < buffer.length; i += step * 3) {
        const r = buffer[i] || 0;
        const g = buffer[i + 1] || 0;
        const b = buffer[i + 2] || 0;
        
        if (r > b + 25 && g > b) {
          warmFoodBytes++;
        } else if (b > r + 15 || (r < 60 && g < 60 && b < 60)) {
          coolRoomBytes++;
        }
      }

      const warmFoodRatio = warmFoodBytes / (warmFoodBytes + coolRoomBytes + 1);

      if (warmFoodRatio < 0.22) {
        res.json({
          status: 'error',
          error: 'No food plate detected in frame. Point camera at food tray or use calibrated preset.',
          recommendation: 'Place a dining tray or food plate within the camera view.',
        });
        return;
      }
    } catch (e) {
      console.warn('Frame inspection warning:', e);
    }
  }

  // Calibrated Plate Preset Estimation
  let leftoverPct: number;
  let foodCategory: string;

  if (simulatedPlateType === 'HEAVY_WASTE') {
    leftoverPct = 42; // ~42% leftover
    foodCategory = 'Rice + Dal + Roti remnants';
  } else if (simulatedPlateType === 'CLEAN_TRAY') {
    leftoverPct = 5; // ~5% leftover (minimal remnants)
    foodCategory = 'Negligible remnants';
  } else {
    leftoverPct = 24; // ~24% leftover
    foodCategory = 'Rice portion + Gravy surplus';
  }

  const standardMealWeightGrams = 380.0;
  const wastedGrams = Number(((leftoverPct / 100.0) * standardMealWeightGrams).toFixed(1));
  const consumedGrams = Number((standardMealWeightGrams - wastedGrams).toFixed(1));
  const co2eEmittedKg = Number(((wastedGrams / 1000.0) * 2.5).toFixed(2)); // IPCC standard 2.5 kg CO2e / kg food waste
  const virtualWaterWastedLiters = Math.round((wastedGrams / 1000.0) * 1200); // ~1,200 L / kg grain/pulse mix
  const financialLossInr = Number(((wastedGrams / 1000.0) * 85.0).toFixed(2)); // Estimated ₹85/kg preparation cost

  // Conscientiousness Credits
  let greenCreditsEarned = 10;
  let statusBadge = 'High Leftover Alert';
  let badgeColor = 'amber';

  if (leftoverPct <= 10) {
    greenCreditsEarned = 50;
    statusBadge = 'Zero-Waste Achiever (+50 pts)';
    badgeColor = 'green';
  } else if (leftoverPct <= 25) {
    greenCreditsEarned = 25;
    statusBadge = 'Moderate Leftovers (+25 pts)';
    badgeColor = 'sky';
  } else {
    greenCreditsEarned = 10;
    statusBadge = 'High Leftover Alert (+10 pts)';
    badgeColor = 'amber';
  }

  // Attribute credits to the relevant department (Hostel Council or user dept)
  const targetDept = departmentLeaderboard.find((d) =>
    d.department.toLowerCase().includes(department.toLowerCase()) ||
    d.code.toLowerCase() === department.toLowerCase()
  ) || departmentLeaderboard.find((d) => d.code === 'HOSTEL') || departmentLeaderboard[0];

  if (targetDept) {
    targetDept.greenCredits += greenCreditsEarned;
    targetDept.auditsCompleted = (targetDept.auditsCompleted || 0) + 1;
    departmentLeaderboard.sort((a, b) => b.greenCredits - a.greenCredits);
    departmentLeaderboard.forEach((d, idx) => (d.rank = idx + 1));
  }

  // Record audit log for verifiable activity ledger
  simulator.addAuditLog({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    blockId: 'central-hostel-mess',
    blockName: 'Central Hostel Dining Hall',
    action: `Plate audit logged: ${wastedGrams}g leftover (${leftoverPct}% of ${standardMealWeightGrams}g meal).`,
    resolvedBy: 'Plate Waste Audit User',
    department: targetDept.department.split(' (')[0],
    costSavedInr: financialLossInr,
    creditsAwarded: greenCreditsEarned,
    isSeeded: false,
    type: 'FOOD_AUDIT',
  });

  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    audit: {
      leftoverPercentage: leftoverPct,
      estimatedFoodWastedGrams: wastedGrams,
      estimatedFoodConsumedGrams: consumedGrams,
      standardMealWeightGrams,
      co2eEmittedKg,
      virtualWaterWastedLiters,
      financialLossInr,
      greenCreditsEarned,
      statusBadge,
      badgeColor,
      foodRemnantClass: foodCategory,
    },
    recommendation:
      leftoverPct <= 10
        ? 'Excellent plate clearance. Remnants are well within baseline tolerance.'
        : leftoverPct <= 25
        ? 'Noticeable leftovers. Request a smaller rice or roti serving if not finishing portions.'
        : 'Substantial leftovers (>150g). Consider requesting half-portions at the counter to minimize waste.',
  });
});

app.listen(PORT, () => {
  console.log(`[EcoPulse Deep-Tech Gateway] running on http://localhost:${PORT}`);
});
