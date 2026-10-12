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
  foodSavedKg: number;
  streakDays: number;
  activeWarriors: number;
}

let departmentLeaderboard: DepartmentScore[] = [
  { rank: 1, department: 'Computer Science & Engg (Main Block)', code: 'CSE', greenCredits: 4420, kwhSaved: 365, foodSavedKg: 84.5, streakDays: 14, activeWarriors: 142 },
  { rank: 2, department: 'Mechanical Engineering (Mech Block)', code: 'ME', greenCredits: 3980, kwhSaved: 310, foodSavedKg: 71.0, streakDays: 9, activeWarriors: 98 },
  { rank: 3, department: 'Management Studies (MBA Block)', code: 'MBA', greenCredits: 3450, kwhSaved: 245, foodSavedKg: 62.0, streakDays: 7, activeWarriors: 75 },
  { rank: 4, department: 'Information Technology (Main Block)', code: 'IT', greenCredits: 2980, kwhSaved: 195, foodSavedKg: 46.8, streakDays: 5, activeWarriors: 58 },
  { rank: 5, department: 'Central Hostel Dining Council', code: 'HOSTEL', greenCredits: 2710, kwhSaved: 170, foodSavedKg: 40.2, streakDays: 4, activeWarriors: 52 },
];

// 1. Campus Status & NILM Telemetry
app.get('/api/campus-status', (_req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    blocks: simulator.getStatus(),
    totalActiveWatts: simulator.getStatus().reduce((sum, b) => sum + b.activePowerWatts, 0),
    activeGhostLeaksCount: simulator.getStatus().filter((b) => b.hasGhostLeak).length,
    campusTotalPowerFactor: 0.96,
  });
});

// 2. Resolve Leak Endpoint (Remote load cut-off)
app.post('/api/resolve-leak', (req, res) => {
  const { blockId, userDept = 'Computer Science & Engg' } = req.body;
  if (!blockId) {
    res.status(400).json({ error: 'blockId is required' });
    return;
  }
  const result = simulator.resolveLeak(blockId);
  if (result.success) {
    // Award 50 credits to the department
    const dept = departmentLeaderboard.find((d) => d.department === userDept);
    if (dept) {
      dept.greenCredits += 50;
      dept.kwhSaved += result.log?.kwhPrevented || 3;
      departmentLeaderboard.sort((a, b) => b.greenCredits - a.greenCredits);
      departmentLeaderboard.forEach((d, idx) => (d.rank = idx + 1));
    }
  }
  res.json({
    success: result.success,
    message: result.success ? 'NILM Ghost load isolated & load dropped to baseline.' : 'Leak not found or already resolved.',
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
    confidenceIntervalPct: 94.8,
    bom,
  });
});

// 8. Deep Tech Computer Vision Food Waste Volumetric & GHG Analyzer
app.post('/api/scan-plate', (req, res) => {
  const { imageBase64, simulatedPlateType = 'NORMAL_TRAY' } = req.body;

  // Deep Tech Volumetric Heuristic Model (Simulating Edge OpenCV Contour Area & Depth)
  // If simulatedPlateType provided, calibrates with typical student tray waste
  let leftoverPct: number;
  let foodCategory: string;

  if (simulatedPlateType === 'HEAVY_WASTE') {
    leftoverPct = Math.floor(Math.random() * 12) + 38; // 38% - 50%
    foodCategory = 'Rice + Dal + Bread remnants';
  } else if (simulatedPlateType === 'CLEAN_TRAY') {
    leftoverPct = Math.floor(Math.random() * 5) + 3; // 3% - 8% (Zero Waste hero)
    foodCategory = 'Negligible crust remnants';
  } else {
    leftoverPct = Math.floor(Math.random() * 15) + 18; // 18% - 33%
    foodCategory = 'Carb (Rice) + Gravy surplus';
  }

  const standardMealWeightGrams = 380.0;
  const wastedGrams = Number(((leftoverPct / 100.0) * standardMealWeightGrams).toFixed(1));
  const co2eEmittedKg = Number(((wastedGrams / 1000.0) * 2.5).toFixed(3)); // IPCC 2.5 kg CO2e / kg food
  const methaneEquivalentGrams = Number((wastedGrams * 0.045).toFixed(2));
  const virtualWaterWastedLiters = Math.round((wastedGrams / 1000.0) * 1200);
  const financialLossInr = Number(((wastedGrams / 1000.0) * 85.0).toFixed(2));

  // Dynamic Gamification Algorithm
  let greenCreditsEarned = 10;
  let statusBadge = 'Needs Improvement';
  let badgeColor = 'text-amber-400';

  if (leftoverPct <= 10) {
    greenCreditsEarned = 60;
    statusBadge = '🌟 Zero-Waste Green Champion (+60 pts)';
    badgeColor = 'text-emerald-400';
  } else if (leftoverPct <= 22) {
    greenCreditsEarned = 35;
    statusBadge = '🌿 Moderate Portion Conscientious (+35 pts)';
    badgeColor = 'text-sky-400';
  } else {
    greenCreditsEarned = 10;
    statusBadge = '⚠️ High Leftover Waste Alert (+10 pts)';
    badgeColor = 'text-rose-400';
  }

  // Update top leaderboard department on successful scan
  const topDept = departmentLeaderboard[0];
  if (topDept) {
    topDept.greenCredits += greenCreditsEarned;
    topDept.foodSavedKg += Number(((standardMealWeightGrams - wastedGrams) / 1000).toFixed(2));
  }

  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    visionMetrics: {
      plateSurfaceAreaMm2: 78500, // Normalized 35x25cm tray
      segmentedFoodAreaMm2: Math.round(78500 * (leftoverPct / 100)),
      estimatedFoodVolumeCm3: Math.round(wastedGrams * 1.15), // Average food density ~0.87 g/cm3
      foodRemnantClass: foodCategory,
      detectionConfidence: 0.942,
    },
    audit: {
      leftoverPercentage: leftoverPct,
      estimatedFoodWastedGrams: wastedGrams,
      co2eEmittedKg,
      methaneEquivalentGrams,
      virtualWaterWastedLiters,
      financialLossInr,
      greenCreditsEarned,
      statusBadge,
      badgeColor,
    },
    recommendation:
      leftoverPct <= 10
        ? 'Outstanding effort! Your plate clean index qualifies for SVVV Green Honour Roll.'
        : leftoverPct <= 25
        ? 'Noticeable carb waste. Request mess staff for 1 less roti or half rice cup next meal.'
        : 'Critical waste! More than 100g of nutrient-rich food discarded. Please take smaller initial servings.',
  });
});

app.listen(PORT, () => {
  console.log(`[EcoPulse Deep-Tech Gateway] running on http://localhost:${PORT}`);
});
