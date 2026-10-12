import { 
  CampusEnergySimulator, 
  DEMO_TARIFF_INR_PER_KWH, 
  GRID_EMISSION_FACTOR_KG_PER_KWH, 
  LEAK_RESOLUTION_POINTS,
  calculateExcessPowerKW,
  calculateEstimatedEnergyKWh,
  calculateEstimatedCostINR,
  calculateEstimatedCo2Kg
} from './energySimulator.js';
import { findLeaderboardDepartment } from '../index.js';

let failedTests = 0;
let passedTests = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failedTests++;
  } else {
    console.log(`✅ PASSED: ${message}`);
    passedTests++;
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    console.error(`❌ FAILED: ${message} (Expected: ${expected}, Got: ${actual})`);
    failedTests++;
  } else {
    console.log(`✅ PASSED: ${message}`);
    passedTests++;
  }
}

console.log('--- Running EcoPulse Campus Energy Simulator Unit Tests ---');

// Test Suite 1: Formulas and Calculations
console.log('\n[Suite 1: Power, Energy & Cost Formulas]');
assertEqual(calculateExcessPowerKW(2680, 140), 2.54, 'Excess power for 2680W vs 140W baseline is 2.54 kW');
assertEqual(calculateExcessPowerKW(140, 140), 0, 'Excess power for normal baseline 140W vs 140W is 0 kW');
assertEqual(calculateExcessPowerKW(100, 140), 0, 'Excess power is clamped at 0 when below baseline');

const energy1Hr = calculateEstimatedEnergyKWh(2.54, 1);
assertEqual(energy1Hr, 2.54, 'Estimated energy avoided over 1 hour is 2.54 kWh');

const cost = calculateEstimatedCostINR(2.54, DEMO_TARIFF_INR_PER_KWH);
assertEqual(cost, 21.59, 'Cost at ₹8.50/kWh for 2.54 kWh is ₹21.59');

const co2 = calculateEstimatedCo2Kg(2.54, GRID_EMISSION_FACTOR_KG_PER_KWH);
assertEqual(co2, 2.08, 'CO2 emission for 2.54 kWh at 0.82 kg/kWh is 2.08 kg');

// Test Suite 2: Snapshot Consistency
console.log('\n[Suite 2: Snapshot Consistency & Single Source of Truth]');
const sim = new CampusEnergySimulator();
const snapshot1 = sim.getSnapshot();

const calculatedWatts = snapshot1.blocks.reduce((sum, b) => sum + b.activePowerWatts, 0);
assertEqual(snapshot1.totalActiveWatts, calculatedWatts, 'Snapshot totalActiveWatts matches sum of building activePowerWatts');

const calculatedActiveLeaks = snapshot1.blocks.filter((b) => b.hasGhostLeak).length;
assertEqual(snapshot1.activeGhostLeaksCount, calculatedActiveLeaks, 'Snapshot activeGhostLeaksCount matches count of leaking buildings');
assertEqual(snapshot1.systemStatus, 'ATTENTION_REQUIRED', 'Initial campus status is ATTENTION_REQUIRED with 3 leaks');

const snapshot2 = sim.getSnapshot();
assertEqual(snapshot1.totalActiveWatts, snapshot2.totalActiveWatts, 'Repeated getSnapshot() calls produce identical deterministic totalActiveWatts');
assertEqual(snapshot1.activeGhostLeaksCount, snapshot2.activeGhostLeaksCount, 'Repeated getSnapshot() calls produce identical activeGhostLeaksCount');

// Test Suite 3: Successful Leak Resolution
console.log('\n[Suite 3: Successful Leak Resolution Workflow]');
const initialLogCount = sim.getAuditLogs().length;
const resolveResult = sim.resolveLeak('main-blk-fl2-r204', 'Energy Auditor');

assert(resolveResult.success === true, 'Resolution on MB-204 succeeds');
assert(resolveResult.resolution !== undefined, 'Resolution payload is present');
assertEqual(resolveResult.resolution?.powerBeforeWatts, 2680, 'Power before was 2680 W');
assertEqual(resolveResult.resolution?.powerAfterWatts, 140, 'Power after is baseline 140 W');
assertEqual(resolveResult.resolution?.powerReductionKW, 2.54, 'Power reduction is 2.54 kW');
assertEqual(resolveResult.resolution?.pointsAwarded, 50, 'Points awarded is 50');
assertEqual(resolveResult.resolution?.department, 'Computer Science & Engg', 'Department is Computer Science & Engg');

const postResolveSnapshot = sim.getSnapshot();
assertEqual(postResolveSnapshot.activeGhostLeaksCount, 2, 'Active leak count decreased from 3 to 2');
assertEqual(sim.getAuditLogs().length, initialLogCount + 1, 'Exactly one audit log entry was added');

// Test Suite 4: Duplicate Submission & No-Leak Rejection
console.log('\n[Suite 4: Duplicate Resolution & Nominal Building Safety]');
const duplicateResult = sim.resolveLeak('main-blk-fl2-r204', 'Double Click User');
assertEqual(duplicateResult.success, false, 'Second resolution attempt on same building fails');
assertEqual(duplicateResult.reason, 'NO_ACTIVE_LEAK', 'Failure reason is NO_ACTIVE_LEAK');
assertEqual(sim.getAuditLogs().length, initialLogCount + 1, 'No duplicate audit log entry added on failed attempt');

const nominalResult = sim.resolveLeak('main-blk-fl1-r108', 'Auditor');
assertEqual(nominalResult.success, false, 'Resolution attempt on nominal building MB-108 fails');
assertEqual(nominalResult.reason, 'NO_ACTIVE_LEAK', 'Failure reason is NO_ACTIVE_LEAK');

const notFoundResult = sim.resolveLeak('non-existent-building', 'Auditor');
assertEqual(notFoundResult.success, false, 'Resolution attempt on non-existent building fails');
assertEqual(notFoundResult.reason, 'BLOCK_NOT_FOUND', 'Failure reason is BLOCK_NOT_FOUND');

// Test Suite 5: Repeatable Demo Leak Injection
console.log('\n[Suite 5: Repeatable Demo Leak Injection]');
const demoTriggerResult = sim.triggerDemoLeak('main-blk-fl2-r204');
assert(demoTriggerResult.success === true, 'triggerDemoLeak on MB-204 succeeds');

const postTriggerSnapshot = sim.getSnapshot();
assertEqual(postTriggerSnapshot.activeGhostLeaksCount, 3, 'Active leak count returns to 3');
const retriggeredBlock = postTriggerSnapshot.blocks.find((b) => b.id === 'main-blk-fl2-r204');
assertEqual(retriggeredBlock?.hasGhostLeak, true, 'MB-204 hasGhostLeak is true after demo trigger');
assertEqual(retriggeredBlock?.activePowerWatts, 2680, 'MB-204 activePowerWatts is restored to 2680 W');

// Test Suite 6: Department Attribution Helper
console.log('\n[Suite 6: Department Attribution Matching]');
const dummyLeaderboard = [
  { rank: 1, department: 'Computer Science & Engg (Main Block)', code: 'CSE', greenCredits: 4420, kwhSaved: 365, auditsCompleted: 28 },
  { rank: 2, department: 'Mechanical Engineering (Mech Block)', code: 'ME', greenCredits: 3980, kwhSaved: 310, auditsCompleted: 22 },
  { rank: 3, department: 'Management Studies (MBA Block)', code: 'MBA', greenCredits: 3450, kwhSaved: 245, auditsCompleted: 19 },
  { rank: 4, department: 'Information Technology (Main Block)', code: 'IT', greenCredits: 2980, kwhSaved: 195, auditsCompleted: 14 },
  { rank: 5, department: 'Central Hostel Dining Council', code: 'HOSTEL', greenCredits: 2710, kwhSaved: 170, auditsCompleted: 35 },
];

const cseMatch = findLeaderboardDepartment('Computer Science & Engg', dummyLeaderboard);
assertEqual(cseMatch?.code, 'CSE', 'Correctly matches Computer Science & Engg to CSE');

const meMatch = findLeaderboardDepartment('Mechanical Engineering', dummyLeaderboard);
assertEqual(meMatch?.code, 'ME', 'Correctly matches Mechanical Engineering to ME');

const mbaMatch = findLeaderboardDepartment('Management Studies (MBA)', dummyLeaderboard);
assertEqual(mbaMatch?.code, 'MBA', 'Correctly matches Management Studies (MBA) to MBA');

const hostelMatch = findLeaderboardDepartment('Hostel Administration', dummyLeaderboard);
assertEqual(hostelMatch?.code, 'HOSTEL', 'Correctly matches Hostel Administration to HOSTEL');

// Test Suite 7: 24-Hour Telemetry Stability
console.log('\n[Suite 7: 24-Hour Telemetry History Stability]');
const history1 = sim.get24HourTelemetry();
const history2 = sim.get24HourTelemetry();
assertEqual(history1.length, 12, 'History has 12 two-hour intervals covering 24 hours');
assertEqual(history1[0].actualKwh, history2[0].actualKwh, 'History is deterministic and reproducible across repeated calls');

console.log(`\n==========================================`);
console.log(`Test Results: ${passedTests} Passed, ${failedTests} Failed`);
console.log(`==========================================`);

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
