import {
  calculateMessForecast,
  normalizeDayOfWeek,
  aggregateAuditLogs,
  getForecastHistory,
  recordActualDiners,
  DEFAULT_HOSTEL_STUDENTS,
} from './messForecastEngine.js';
import { AuditLogEntry } from '../simulator/energySimulator.js';

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

function runTests() {
  console.log('\n--- Running EcoPulse Smart Mess Forecast Engine Unit Tests ---\n');

  // ── Suite 1: Day of Week Attendance Factors & Elasticity ──────────
  console.log('[Suite 1: Day of Week Attendance Factors & Elasticity]');

  // Monday baseline: 1200 * 0.92 = 1104 diners
  const mon = calculateMessForecast({ day: 'Monday', weather: 'Sunny', isExam: false });
  assert(mon.expectedDiners === 1104, 'Monday baseline gives 1104 expected diners (92% of 1200)');
  assert(mon.turnoutPercentage === 92, 'Monday turnout is 92.0%');

  // Friday baseline: 1200 * 0.70 = 840 diners
  const fri = calculateMessForecast({ day: 'Friday', weather: 'Sunny', isExam: false });
  assert(fri.expectedDiners === 840, 'Friday baseline gives 840 expected diners (70% of 1200)');
  assert(fri.turnoutPercentage === 70, 'Friday turnout is 70.0%');

  // Saturday baseline: 1200 * 0.62 = 744 diners
  const sat = calculateMessForecast({ day: 'Saturday', weather: 'Sunny', isExam: false });
  assert(sat.expectedDiners === 744, 'Saturday baseline gives 744 expected diners (62% of 1200)');

  // Friday + Rain (+6%): 70% + 6% = 76% => 1200 * 0.76 = 912 diners
  const friRain = calculateMessForecast({ day: 'Friday', weather: 'Rainy', isExam: false });
  assert(friRain.expectedDiners === 912, 'Friday + Rainy weather adds +6% (912 diners)');

  // Friday + Rain + Exams (+8%): 76% + 8% = 84% => 1200 * 0.84 = 1008 diners
  const friRainExam = calculateMessForecast({ day: 'Friday', weather: 'Rainy', isExam: true });
  assert(friRainExam.expectedDiners === 1008, 'Friday + Rainy + Exams adds +14% total (1008 diners)');

  // ── Suite 2: Configurable Population & Input Normalization ──────────
  console.log('\n[Suite 2: Configurable Population & Input Normalization]');

  // Day normalization
  assert(normalizeDayOfWeek('FRIDAY') === 'Friday', 'Normalizes uppercase day to Friday');
  assert(normalizeDayOfWeek('tuesday') === 'Tuesday', 'Normalizes lowercase day to Tuesday');
  assert(normalizeDayOfWeek('invalid-day') === 'Friday', 'Defaults invalid day to Friday');

  // Configurable population: 800 students on Friday (70% = 560 diners)
  const customPop = calculateMessForecast({ day: 'Friday', weather: 'Sunny', totalHostelStudents: 800 });
  assert(customPop.expectedDiners === 560, 'Custom population 800 scales to 560 diners');
  assert(customPop.parameters.totalHostelStudents === 800, 'Parameters record custom 800 capacity');

  // Negative / zero population clamped safely
  const clampedPop = calculateMessForecast({ totalHostelStudents: -50 });
  assert(clampedPop.parameters.totalHostelStudents === 10, 'Negative population is safely clamped to 10 minimum');

  // ── Suite 3: Cooking Quantities & 5% Safety Buffer ──────────
  console.log('\n[Suite 3: Cooking Quantities & 5% Safety Buffer]');

  // 1200 diners blind conventional cooking at 380g per head = 456 kg
  assert(fri.conventionalCookKg === 456.0, 'Conventional blind cooking is 456.0 kg (1200 * 0.380)');

  // Recommended cooking for 840 diners with 5% safety buffer:
  // 840 * 0.360 * 1.05 = 317.5 kg
  assert(fri.recommendedCookKg === 317.5, 'Recommended cooking includes 5% safety buffer (317.5 kg)');

  // Projected avoidable overproduction: 456.0 - 317.5 = 138.5 kg
  assert(fri.projectedAvoidableOverproductionKg === 138.5, 'Avoidable overproduction is 138.5 kg');

  // Cost avoided at ₹85/kg: 138.5 * 85 = 11773 ₹
  assert(fri.projectedCostAvoidedInr === 11773, 'Projected cost avoided is ₹11,773');

  // Embodied CO2e: 138.5 * 2.5 = 346.3 kg CO2e
  assert(fri.projectedCo2eAvoidedKg === 346.3, 'Projected CO2e avoided is 346.3 kg');

  // Recipe BOM components
  assert(fri.bom.grainRiceKg === 100.8, 'Basmati Rice is 100.8 kg (840 * 0.12)');
  assert(fri.bom.dalPulsesKg === 42.0, 'Dal is 42.0 kg (840 * 0.05)');
  assert(fri.bom.wheatFlourAttaKg === 75.6, 'Atta is 75.6 kg (840 * 0.09)');
  assert(fri.bom.freshVegetablesKg === 117.6, 'Vegetables is 117.6 kg (840 * 0.14)');
  assert(fri.bom.cookingOilLiters === 16.8, 'Oil is 16.8 L (840 * 0.02)');

  // ── Suite 4: Audit Data Integration & Thresholding ──────────
  console.log('\n[Suite 4: Audit Data Integration & Thresholding]');

  // Case A: 0 audits -> Insufficient data (Baseline Mode)
  const auditZero = aggregateAuditLogs([]);
  assert(auditZero.isIntegrated === false, 'Zero audits is marked as not integrated');
  assert(auditZero.averageLeftoverPercent === null, 'Average leftover is null when audits < 3');
  assert(auditZero.note.includes('Insufficient audit history'), 'Audit note explains baseline mode');

  // Case B: 2 audits -> still under threshold (<3)
  const mockAudits2: AuditLogEntry[] = [
    {
      id: 'a1', timestamp: new Date().toISOString(), blockId: 'mess', blockName: 'Mess',
      action: 'Plate audit logged: 91g leftover (24% of 380g meal).', resolvedBy: 'User',
      department: 'Hostel', costSavedInr: 0, creditsAwarded: 5, type: 'FOOD_AUDIT'
    },
    {
      id: 'a2', timestamp: new Date().toISOString(), blockId: 'mess', blockName: 'Mess',
      action: 'Plate audit logged: 76g leftover (20% of 380g meal).', resolvedBy: 'User',
      department: 'Hostel', costSavedInr: 0, creditsAwarded: 5, type: 'FOOD_AUDIT'
    }
  ];
  const auditTwo = aggregateAuditLogs(mockAudits2);
  assert(auditTwo.isIntegrated === false, '2 audits is still below threshold (requires 3)');

  // Case C: 3 audits -> threshold reached (integrated!)
  const mockAudits3: AuditLogEntry[] = [
    ...mockAudits2,
    {
      id: 'a3', timestamp: new Date().toISOString(), blockId: 'mess', blockName: 'Mess',
      action: 'AI Photo Audit: Rice, Dal (~28% remaining portion estimate).', resolvedBy: 'User',
      department: 'Hostel', costSavedInr: 0, creditsAwarded: 5, type: 'FOOD_AUDIT'
    }
  ];
  const auditThree = aggregateAuditLogs(mockAudits3);
  assert(auditThree.isIntegrated === true, '3 audits reaches threshold and is integrated');
  // avg of 24%, 20%, 28% = 72 / 3 = 24%
  assert(auditThree.averageLeftoverPercent === 24, 'Average leftover percent across 3 audits is 24%');

  // Full forecast with audit integration
  const forecastWithAudits = calculateMessForecast({ day: 'Monday' }, mockAudits3);
  assert(forecastWithAudits.auditData.isIntegrated === true, 'Forecast reflects integrated audit data');
  assert(forecastWithAudits.auditData.auditCount === 3, 'Audit count in forecast is 3');

  // ── Suite 5: Qualitative Uncertainty Assessment ──────────
  console.log('\n[Suite 5: Qualitative Uncertainty Assessment]');

  // Weekend has high uncertainty
  assert(fri.uncertainty === 'high', 'Friday has high qualitative uncertainty due to weekend departures');
  assert(fri.uncertaintyReason.includes('Weekend transition'), 'Uncertainty reason mentions weekend transition');

  // Rainy weekday has medium uncertainty
  const monRain = calculateMessForecast({ day: 'Monday', weather: 'Rainy' });
  assert(monRain.uncertainty === 'medium', 'Rainy Monday has medium uncertainty');

  // Clear Monday has low uncertainty
  assert(mon.uncertainty === 'low', 'Sunny Monday has low uncertainty');

  // Verify NO fake confidence interval is present
  assert((mon as any).confidenceIntervalPct === undefined, 'No fake confidenceIntervalPct exists in forecast output');

  // ── Suite 6: Forecast History & Actual Counts ──────────
  console.log('\n[Suite 6: Forecast History & Actual Counts]');

  const history = getForecastHistory();
  assert(history.length > 0, 'Forecasts are recorded in history');
  const latestForecast = history[0];
  assert(typeof latestForecast.id === 'string' && latestForecast.id.startsWith('fc-'), 'Forecast ID has fc- prefix');
  assert(latestForecast.actualDiners === null, 'Actual diners is initially null');

  // Record actual diner count
  const recorded = recordActualDiners(latestForecast.id, 832, 312.0);
  assert(recorded === true, 'Successfully recorded actual diner turnout');
  assert(latestForecast.actualDiners === 832, 'Actual diners updated to 832');
  assert(latestForecast.actualCookedKg === 312.0, 'Actual cooked kg updated to 312.0');

  // Attempt to record on non-existent ID fails gracefully
  assert(recordActualDiners('invalid-id', 500) === false, 'Non-existent forecast ID returns false');

  // ── Summary ──────────
  console.log('\n==========================================');
  console.log(`Test Results: ${passedTests} Passed, ${failedTests} Failed`);
  console.log('==========================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
