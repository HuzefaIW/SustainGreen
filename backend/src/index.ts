import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { AuditLogEntry, CampusEnergySimulator } from './simulator/energySimulator.js';
import {
  analyzeFoodPlateImage,
  getCalibratedPresetAudit,
} from './services/geminiVision.js';
import {
  calculateMessForecast,
  getForecastHistory,
  recordActualDiners,
} from './services/messForecastEngine.js';
import {
  authenticateDevAccount,
  canAccessBlock,
  findDevAccountByEmail,
  getDevAccounts,
  hasPermission,
  isDevelopmentAuthEnabled,
  SafeAccount,
  sanitizeAccount,
  validateSvvvEmail,
} from './services/devAccounts.js';
import {
  authenticate,
  AuthenticatedRequest,
  createSessionToken,
  enforceLoginRateLimit,
  getBearerToken,
  requireBlockAccess,
  requirePermission,
  resetLoginRateLimit,
  revokeToken,
} from './services/auth.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const simulator = new CampusEnergySimulator();

function writeActivity(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'costSavedInr' | 'creditsAwarded'> & Partial<Pick<AuditLogEntry, 'costSavedInr' | 'creditsAwarded'>>): AuditLogEntry {
  const log: AuditLogEntry = {
    id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    costSavedInr: 0,
    creditsAwarded: 0,
    ...entry,
  };
  simulator.addAuditLog(log);
  return log;
}

function filterSnapshotForUser(user: SafeAccount) {
  const snapshot = simulator.getSnapshot();
  const blocks = hasPermission(user, 'blocks.read_all')
    ? snapshot.blocks
    : snapshot.blocks.filter((block) => canAccessBlock(user, block.id));
  const totalActiveWatts = blocks.reduce((sum, block) => sum + block.activePowerWatts, 0);
  const totalBaselineWatts = blocks.reduce((sum, block) => sum + block.baselineIdleWatts, 0);
  const activeGhostLeaksCount = blocks.filter((block) => block.hasGhostLeak).length;

  return {
    ...snapshot,
    blocks,
    totalActiveWatts,
    totalActivePowerKW: Number((totalActiveWatts / 1000).toFixed(2)),
    totalBaselinePowerKW: Number((totalBaselineWatts / 1000).toFixed(2)),
    totalExcessPowerKW: Number((Math.max(0, totalActiveWatts - totalBaselineWatts) / 1000).toFixed(2)),
    activeGhostLeaksCount,
    systemStatus: activeGhostLeaksCount === 0 ? 'NORMAL' : 'ATTENTION_REQUIRED',
    scope: hasPermission(user, 'blocks.read_all') ? 'campus' : 'assigned_blocks',
  };
}

function filterActivityForUser(user: SafeAccount, logs: AuditLogEntry[]): AuditLogEntry[] {
  if (hasPermission(user, 'activity.read_all')) {
    return logs;
  }
  return logs.filter((log) => {
    if (log.type === 'FOOD_AUDIT' || log.type === 'MESS_FORECAST' || log.type === 'MESS_ACTUAL') {
      return user.role === 'CANTEEN_ADMIN' || log.department === user.department;
    }
    if (log.type === 'AUTH') {
      return log.resolvedBy === user.email;
    }
    return canAccessBlock(user, log.blockId);
  });
}

// Development account metadata is protected and disabled in production.
app.get('/api/dev-accounts', authenticate, requirePermission('users.read'), (_req, res) => {
  if (!isDevelopmentAuthEnabled()) {
    res.status(404).json({ success: false, error: 'Development accounts are disabled.' });
    return;
  }
  res.json({
    source: 'local-dev-seed',
    domain: 'svvv.in',
    accounts: getDevAccounts(),
  });
});

app.get('/api/dev-accounts/:email', authenticate, requirePermission('users.read'), (req, res) => {
  if (!isDevelopmentAuthEnabled()) {
    res.status(404).json({ success: false, error: 'Development accounts are disabled.' });
    return;
  }
  const email = String(req.params.email || '');
  if (!validateSvvvEmail(email)) {
    res.status(400).json({
      success: false,
      error: 'Only @svvv.in dev accounts are allowed.',
    });
    return;
  }

  const account = findDevAccountByEmail(email);
  if (!account) {
    res.status(404).json({
      success: false,
      error: `No seeded dev account found for "${email}".`,
    });
    return;
  }

  res.json({
    success: true,
    account: sanitizeAccount(account),
  });
});

app.post('/api/auth/dev-login', (req, res) => {
  if (!isDevelopmentAuthEnabled()) {
    res.status(404).json({ success: false, error: 'Development login is disabled.' });
    return;
  }

  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({
      success: false,
      error: 'email and password are required.',
    });
    return;
  }

  if (!enforceLoginRateLimit(email)) {
    res.status(429).json({
      success: false,
      error: 'Too many login attempts. Please retry shortly.',
    });
    return;
  }

  if (!validateSvvvEmail(email)) {
    res.status(400).json({
      success: false,
      error: 'Only @svvv.in dev accounts are allowed.',
    });
    return;
  }

  const account = authenticateDevAccount(email, password);
  if (!account) {
    res.status(401).json({
      success: false,
      error: 'Invalid email or password.',
    });
    return;
  }

  resetLoginRateLimit(email);
  const safeAccount = sanitizeAccount(account);
  const session = createSessionToken(safeAccount);
  writeActivity({
    blockId: 'auth-session',
    blockName: 'Authentication',
    action: 'Development account login succeeded.',
    resolvedBy: safeAccount.email,
    department: safeAccount.department,
    type: 'AUTH',
  });

  res.json({
    success: true,
    tokenType: 'Bearer',
    token: session.token,
    expiresAt: session.expiresAt,
    expiresInSeconds: session.expiresInSeconds,
    account: safeAccount,
  });
});

app.get('/api/auth/me', authenticate, (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    account: req.user,
    permissions: req.user?.permissions || [],
  });
});

app.post('/api/auth/logout', authenticate, (req: AuthenticatedRequest, res) => {
  const token = getBearerToken(req);
  if (token) revokeToken(token);
  if (req.user) {
    writeActivity({
      blockId: 'auth-session',
      blockName: 'Authentication',
      action: 'Development account logout succeeded.',
      resolvedBy: req.user.email,
      department: req.user.department,
      type: 'AUTH',
    });
  }
  res.json({ success: true });
});

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

// Helper: Match building department to leaderboard score entry
export function findLeaderboardDepartment(deptName: string, leaderboard: DepartmentScore[]): DepartmentScore | undefined {
  const norm = deptName.toLowerCase();

  // 1. High-precision department keyword matching
  if (norm.includes('mba') || norm.includes('management')) {
    return leaderboard.find((d) => d.code === 'MBA');
  }
  if (norm.includes('computer') || norm.includes('cse')) {
    return leaderboard.find((d) => d.code === 'CSE');
  }
  if (norm.includes('mechanical') || norm.includes('mech')) {
    return leaderboard.find((d) => d.code === 'ME');
  }
  if (norm.includes('information') || norm.includes('analytics')) {
    return leaderboard.find((d) => d.code === 'IT');
  }
  if (norm.includes('hostel') || norm.includes('dining') || norm.includes('mess')) {
    return leaderboard.find((d) => d.code === 'HOSTEL');
  }

  // 2. Direct full-name inclusion fallback
  return leaderboard.find((d) => {
    const dName = d.department.toLowerCase();
    return dName.includes(norm) || norm.includes(dName);
  });
}

// 1. Campus Status & NILM Telemetry
// Single snapshot per request derived in a single pass from the simulator source of truth.
app.get('/api/campus-status', authenticate, requirePermission('campus.read'), (req: AuthenticatedRequest, res) => {
  res.json(filterSnapshotForUser(req.user!));
});

// 2. Resolve Leak Endpoint (Remote load cut-off simulation)
app.post('/api/resolve-leak', authenticate, requirePermission('energy.resolve_leak'), requireBlockAccess((req) => req.body.blockId), (req: AuthenticatedRequest, res) => {
  const { blockId } = req.body;
  const resolvedBy = req.user!.email;
  if (!blockId || typeof blockId !== 'string') {
    res.status(400).json({ 
      success: false, 
      error: 'blockId is required and must be a string' 
    });
    return;
  }

  const result = simulator.resolveLeak(blockId, resolvedBy);
  if (!result.success) {
    if (result.reason === 'BLOCK_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: `Building with ID "${blockId}" not found in campus inventory.`,
      });
      return;
    }
    // Already resolved or no leak
    res.status(409).json({
      success: false,
      error: `Building "${blockId}" has no active simulated leak or was already resolved.`,
    });
    return;
  }

  // Credit 50 points to the building's exact department in leaderboard
  if (result.resolution && result.log) {
    const dept = findLeaderboardDepartment(result.resolution.department, departmentLeaderboard) || departmentLeaderboard[0];
    if (dept) {
      dept.greenCredits += result.resolution.pointsAwarded;
      dept.kwhSaved += Math.round(result.resolution.estimatedEnergyAvoidedKWh);
      departmentLeaderboard.sort((a, b) => b.greenCredits - a.greenCredits);
      departmentLeaderboard.forEach((d, idx) => (d.rank = idx + 1));
    }
  }

  res.status(200).json({
    success: true,
    message: 'Simulated leak resolved & load returned to baseline.',
    resolution: result.resolution,
    log: result.log,
      source: 'SIMULATED_ENERGY_ACTION',
  });
});

// 3. Trigger Demo Leak (For Live Hackathon Demos)
app.post('/api/trigger-demo-leak', authenticate, requirePermission('energy.demo_trigger'), requireBlockAccess((req) => req.body.blockId || 'main-blk-fl2-r204'), (req: AuthenticatedRequest, res) => {
  const { blockId = 'main-blk-fl2-r204' } = req.body;
  const result = simulator.triggerDemoLeak(blockId);
  if (!result.success) {
    res.status(404).json({ 
      success: false, 
      error: `Building "${blockId}" not found in campus inventory.` 
    });
    return;
  }
  res.status(200).json({ 
    success: true, 
    message: `Simulated Ghost Leak triggered in ${result.block?.name || blockId} for demonstration.`,
    block: result.block,
    source: 'SIMULATED_DEMO_EVENT',
  });
});

// 4. 24-Hour Telemetry History
app.get('/api/campus-history', authenticate, requirePermission('energy.read'), (_req, res) => {
  res.json({
    history: simulator.get24HourTelemetry(),
    source: 'SIMULATED_TELEMETRY_HISTORY',
  });
});

// 5. Verifiable Audit Trail
app.get('/api/audit-logs', authenticate, requirePermission('activity.read'), (req: AuthenticatedRequest, res) => {
  res.json({
    logs: filterActivityForUser(req.user!, simulator.getAuditLogs()),
  });
});

// 6. Department Leaderboard
app.get('/api/leaderboard', authenticate, requirePermission('leaderboard.read'), (_req, res) => {
  res.json({
    standings: departmentLeaderboard,
    source: 'SESSION_GREEN_CUP_TOTALS',
  });
});

// 7. Predictive Mess Kitchen Engine
app.get('/api/mess-forecast', authenticate, requirePermission('mess_forecast.create'), (req: AuthenticatedRequest, res) => {
  try {
    const day = req.query.day as string | undefined;
    const weather = req.query.weather as string | undefined;
    const isExam = req.query.isExam === 'true';
    const rawPop = (req.query.totalStudents || req.query.eligiblePopulation || req.query.studentCapacity) as string | undefined;
    const totalHostelStudents = rawPop ? parseInt(rawPop, 10) : undefined;
    const foodCostPerKg = req.query.costPerKg ? parseFloat(req.query.costPerKg as string) : undefined;
    const safetyBufferPercent = req.query.buffer ? parseFloat(req.query.buffer as string) : undefined;
    const mealPeriod = (req.query.meal as string) || 'Lunch';

    const auditLogs = simulator.getAuditLogs();
    const forecast = calculateMessForecast({
      day,
      weather,
      isExam,
      totalHostelStudents,
      foodCostPerKg,
      safetyBufferPercent,
      mealPeriod,
    }, auditLogs);

    writeActivity({
      blockId: 'central-hostel-mess',
      blockName: 'Central Hostel Mess & Food Preparation Hall',
      action: `Mess forecast generated for ${forecast.parameters.mealPeriod} (${forecast.parameters.day}, ${forecast.parameters.weather}).`,
      resolvedBy: req.user!.email,
      department: req.user!.department,
      type: 'MESS_FORECAST',
    });

    const safetyBufferKg = Number((forecast.expectedDiners * 0.36 * (forecast.parameters.safetyBufferPercent / 100)).toFixed(1));

    res.json({
      ...forecast,
      safetyBufferKg,
      forecast: {
        ...forecast,
        safetyBufferKg,
        attendance: {
          expectedDiners: forecast.expectedDiners,
          predictedAttendancePct: forecast.turnoutPercentage,
        },
        preparation: {
          conventionalPreparationKg: forecast.conventionalCookKg,
          recommendedPreparationKg: forecast.recommendedCookKg,
          safetyBufferKg,
          avoidableOverproductionKg: forecast.projectedAvoidableOverproductionKg,
        },
        financialAndEcological: {
          projectedCostAvoided: forecast.projectedCostAvoidedInr,
          projectedCo2eAvoidedKg: forecast.projectedCo2eAvoidedKg,
          projectedWaterAvoidedLiters: forecast.projectedWaterAvoidedLiters,
        },
        uncertainty: {
          level: forecast.uncertainty,
          reason: forecast.uncertaintyReason,
        },
        auditDataIntegration: {
          hasIntegratedAuditData: forecast.auditData.isIntegrated,
          averagePlateLeftoverPercent: forecast.auditData.averageLeftoverPercent,
          auditsInformingCount: forecast.auditData.auditCount,
          timeframe: forecast.auditData.periodCovered,
          notes: forecast.auditData.note,
        },
        forecastId: forecast.id,
      },
      // Backwards-compatible aliases for existing consumers
      day: forecast.parameters.day,
      weather: forecast.parameters.weather,
      isExam: forecast.parameters.isExam,
      totalHostelStudents: forecast.parameters.totalHostelStudents,
      savedFoodKg: forecast.projectedAvoidableOverproductionKg,
      costSavedInr: forecast.projectedCostAvoidedInr,
      co2eSavedKg: forecast.projectedCo2eAvoidedKg,
      waterSavedLiters: forecast.projectedWaterAvoidedLiters,
    });
  } catch (err: any) {
    console.error('Failed to generate mess forecast:', err);
    res.status(500).json({ error: 'Failed to generate mess forecast' });
  }
});

// 7b. Mess Forecast History Log
app.get('/api/mess-forecast/history', authenticate, requirePermission('mess_forecast.read'), (_req, res) => {
  res.json({
    history: getForecastHistory(),
  });
});

// 7c. Record Actual Diner Attendance (Optional comparison)
app.post('/api/mess-forecast/actual', authenticate, requirePermission('mess_actuals.record'), (req: AuthenticatedRequest, res) => {
  const { forecastId, actualDiners, actualCookedKg } = req.body;
  if (!forecastId || typeof actualDiners !== 'number') {
    res.status(400).json({ error: 'forecastId and actualDiners (number) are required' });
    return;
  }
  const updated = recordActualDiners(forecastId, actualDiners, actualCookedKg);
  if (!updated) {
    res.status(404).json({ error: `Forecast "${forecastId}" not found in session history.` });
    return;
  }
  writeActivity({
    blockId: 'central-hostel-mess',
    blockName: 'Central Hostel Mess & Food Preparation Hall',
    action: `Actual diner count recorded for forecast ${forecastId}: ${actualDiners} diners.`,
    resolvedBy: req.user!.email,
    department: req.user!.department,
    type: 'MESS_ACTUAL',
  });
  res.json({ success: true, message: 'Actual diner count recorded against forecast.' });
});

// 8. Food Waste Audit (Real Gemini Vision Image Analysis & Calibrated Simulation)
app.post('/api/scan-plate', authenticate, requirePermission('food_audit.create'), async (req: AuthenticatedRequest, res) => {
  const {
    imageBase64,
    mimeType = 'image/jpeg',
    originalServingWeightGrams,
    simulatedPlateType = 'NORMAL_TRAY',
    mode,
    submissionId,
  } = req.body;
  const department = req.user!.role === 'SUPER_ADMIN' && typeof req.body.department === 'string'
    ? req.body.department
    : req.user!.department;

  // Department resolution
  const targetDept = findLeaderboardDepartment(department, departmentLeaderboard)
    || departmentLeaderboard.find((d) => d.code === 'HOSTEL')
    || departmentLeaderboard[0];

  const hasImage = typeof imageBase64 === 'string' && imageBase64.trim().length > 0;

  // Case A: Real Image Upload via Gemini Vision
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

      // Award +5 participation points only if this submission was not already rewarded
      if (!analysis.isDuplicate && targetDept) {
        targetDept.greenCredits += analysis.greenCreditsEarned;
        targetDept.auditsCompleted = (targetDept.auditsCompleted || 0) + 1;
        departmentLeaderboard.sort((a, b) => b.greenCredits - a.greenCredits);
        departmentLeaderboard.forEach((d, idx) => (d.rank = idx + 1));

        // Record audit entry
        simulator.addAuditLog({
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          blockId: 'central-hostel-mess',
          blockName: 'Central Hostel Dining Hall',
          action: `AI Photo Audit: ${analysis.visibleFoodItems.slice(0, 3).join(', ') || 'Leftover remnants'} (~${analysis.remainingPortionPercent}% remaining portion estimate).`,
          resolvedBy: req.user!.email,
          department: targetDept.department.split(' (')[0],
          costSavedInr: 0,
          creditsAwarded: analysis.greenCreditsEarned,
          isSeeded: false,
          type: 'FOOD_AUDIT',
        });
      }

      res.status(200).json({
        status: 'success',
        timestamp: new Date().toISOString(),
        audit: {
          isFoodImage: analysis.isFoodImage,
          visibleFoodItems: analysis.visibleFoodItems,
          remainingPortionPercent: analysis.remainingPortionPercent,
          estimatedLeftoverWeightGrams: analysis.estimatedLeftoverWeightGrams,
          servingWeightAssumption: analysis.servingWeightAssumption,
          visualObservations: analysis.visualObservations,
          uncertainty: analysis.uncertainty,
          limitations: analysis.limitations,
          greenCreditsEarned: analysis.greenCreditsEarned,
          isDuplicate: analysis.isDuplicate,
          source: analysis.source,
          department: targetDept.department.split(' (')[0],
          // Backwards-compatible fields for UI
          standardMealWeightGrams: originalServingWeightGrams || 380,
          estimatedFoodWastedGrams: analysis.estimatedLeftoverWeightGrams || 0,
          leftoverPercentage: analysis.remainingPortionPercent,
          foodRemnantClass: analysis.visibleFoodItems.join(', ') || 'Mixed food leftovers',
        },
        recommendation:
          analysis.remainingPortionPercent <= 10
            ? 'Excellent plate clearance. Negligible leftovers remaining.'
            : analysis.remainingPortionPercent <= 25
            ? 'Minor leftovers visible. Consider requesting smaller initial helpings at the counter.'
            : 'Substantial unfinished portion visible. Asking for customized portions helps curtail mess waste.',
      });
      return;
    } catch (err: any) {
      console.error('Unhandled scan-plate error:', err);
      res.status(500).json({
        status: 'error',
        error: 'Internal server error while processing image audit.',
        code: 'INTERNAL_ERROR',
      });
      return;
    }
  }

  // Case B: Calibrated Preset Simulation Mode
  const servingGrams = typeof originalServingWeightGrams === 'number' && originalServingWeightGrams > 0 ? originalServingWeightGrams : 380;
  const presetAudit = getCalibratedPresetAudit(simulatedPlateType, servingGrams);

  if (targetDept) {
    targetDept.greenCredits += presetAudit.greenCreditsEarned;
    targetDept.auditsCompleted = (targetDept.auditsCompleted || 0) + 1;
    departmentLeaderboard.sort((a, b) => b.greenCredits - a.greenCredits);
    departmentLeaderboard.forEach((d, idx) => (d.rank = idx + 1));

    simulator.addAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      blockId: 'central-hostel-mess',
      blockName: 'Central Hostel Dining Hall',
      action: `Preset Audit Simulation: ${simulatedPlateType} (~${presetAudit.remainingPortionPercent}% leftover benchmark).`,
      resolvedBy: req.user!.email,
      department: targetDept.department.split(' (')[0],
      costSavedInr: 0,
      creditsAwarded: presetAudit.greenCreditsEarned,
      isSeeded: false,
      type: 'FOOD_AUDIT',
    });
  }

  res.status(200).json({
    status: 'success',
    timestamp: new Date().toISOString(),
    audit: {
      isFoodImage: presetAudit.isFoodImage,
      visibleFoodItems: presetAudit.visibleFoodItems,
      remainingPortionPercent: presetAudit.remainingPortionPercent,
      estimatedLeftoverWeightGrams: presetAudit.estimatedLeftoverWeightGrams,
      servingWeightAssumption: presetAudit.servingWeightAssumption,
      visualObservations: presetAudit.visualObservations,
      uncertainty: presetAudit.uncertainty,
      limitations: presetAudit.limitations,
      greenCreditsEarned: presetAudit.greenCreditsEarned,
      isDuplicate: false,
      source: presetAudit.source,
      department: targetDept.department.split(' (')[0],
      standardMealWeightGrams: servingGrams,
      estimatedFoodWastedGrams: presetAudit.estimatedLeftoverWeightGrams || 0,
      leftoverPercentage: presetAudit.remainingPortionPercent,
      foodRemnantClass: presetAudit.visibleFoodItems.join(', '),
    },
    recommendation:
      presetAudit.remainingPortionPercent <= 10
        ? 'Excellent plate clearance. Remnants are well within baseline tolerance.'
        : presetAudit.remainingPortionPercent <= 25
        ? 'Noticeable leftovers. Request smaller servings if not finishing portions.'
        : 'Substantial leftovers. Consider requesting half-portions at the counter to minimize waste.',
  });
});

app.listen(PORT, () => {
  console.log(`[EcoPulse Deep-Tech Gateway] running on http://localhost:${PORT}`);
});
