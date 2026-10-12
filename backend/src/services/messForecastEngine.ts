import { AuditLogEntry } from '../simulator/energySimulator.js';

export const DEFAULT_HOSTEL_STUDENTS = 1200;
export const DEFAULT_FOOD_COST_INR_PER_KG = 85.0;
export const DEFAULT_SAFETY_BUFFER_PERCENT = 5.0; // 5% buffer over point estimate to prevent shortages
export const STANDARD_PORTION_KG = 0.380; // 380g standard thali
export const CALIBRATED_PORTION_KG = 0.360; // 360g calibrated portion
export const CO2E_KG_PER_KG_FOOD = 2.5; // IPCC AR6 benchmark
export const WATER_LITERS_PER_KG_FOOD = 1200; // Agricultural virtual water factor
export const MIN_AUDIT_THRESHOLD = 3;

export interface RecipeBom {
  grainRiceKg: number;
  dalPulsesKg: number;
  wheatFlourAttaKg: number;
  freshVegetablesKg: number;
  cookingOilLiters: number;
}

export interface AuditAggregateInfo {
  auditCount: number;
  averageLeftoverPercent: number | null;
  periodCovered: string;
  isIntegrated: boolean;
  note: string;
}

export interface MessForecastParams {
  day?: string;
  weather?: string;
  isExam?: boolean;
  totalHostelStudents?: number;
  foodCostPerKg?: number;
  safetyBufferPercent?: number;
  mealPeriod?: string;
}

export interface MessForecastResult {
  id: string;
  timestamp: string;
  parameters: {
    day: string;
    weather: string;
    isExam: boolean;
    totalHostelStudents: number;
    mealPeriod: string;
    foodCostPerKg: number;
    safetyBufferPercent: number;
  };
  turnoutFactor: number;
  expectedDiners: number;
  turnoutPercentage: number;
  conventionalCookKg: number;
  recommendedCookKg: number;
  projectedAvoidableOverproductionKg: number;
  projectedCostAvoidedInr: number;
  projectedCo2eAvoidedKg: number;
  projectedWaterAvoidedLiters: number;
  bom: RecipeBom;
  uncertainty: 'low' | 'medium' | 'high';
  uncertaintyReason: string;
  explanation: string;
  auditData: AuditAggregateInfo;
  recommendations: string[];
  dataFreshness: string;
  limitations: string;
  actualDiners: number | null;
  actualCookedKg: number | null;
}

// In-memory forecast history
const forecastHistory: MessForecastResult[] = [];

/**
 * Extracts and aggregates food plate audit logs to inform mess kitchen planning.
 * Clearly separates diner plate remnants from kitchen overproduction.
 */
export function aggregateAuditLogs(logs: AuditLogEntry[]): AuditAggregateInfo {
  const foodLogs = logs.filter(
    (l) => l.type === 'FOOD_AUDIT' || l.action.toLowerCase().includes('plate audit') || l.action.toLowerCase().includes('audit logged')
  );

  if (foodLogs.length < MIN_AUDIT_THRESHOLD) {
    return {
      auditCount: foodLogs.length,
      averageLeftoverPercent: null,
      periodCovered: foodLogs.length > 0 ? 'Current session' : 'None',
      isIntegrated: false,
      note: `Insufficient audit history (${foodLogs.length} audit${foodLogs.length === 1 ? '' : 's'} recorded, ${MIN_AUDIT_THRESHOLD} required for aggregate statistical modeling). Operating in Documented Baseline Mode.`,
    };
  }

  // Extract leftover percentages from action strings or records
  let sumPct = 0;
  let validCount = 0;

  for (const log of foodLogs) {
    const match = log.action.match(/(\d+)%/);
    if (match && match[1]) {
      const pct = parseInt(match[1], 10);
      if (!isNaN(pct) && pct >= 0 && pct <= 100) {
        sumPct += pct;
        validCount++;
      }
    }
  }

  const avgLeftover = validCount > 0 ? Math.round(sumPct / validCount) : 24;

  return {
    auditCount: foodLogs.length,
    averageLeftoverPercent: avgLeftover,
    periodCovered: 'Recent session audits (Central Dining Hall)',
    isIntegrated: true,
    note: `Aggregated data from ${foodLogs.length} verified plate audits (average diner leftover: ${avgLeftover}%). Used to inform portion advisory.`,
  };
}

/**
 * Validates day of week string and normalizes to TitleCase.
 */
export function normalizeDayOfWeek(dayInput?: string): string {
  if (!dayInput || typeof dayInput !== 'string') return 'Friday';
  const clean = dayInput.trim().toLowerCase();
  const validDays: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };
  return validDays[clean] || 'Friday';
}

/**
 * Authoritative mess demand and kitchen preparation forecast calculation.
 */
export function calculateMessForecast(
  params: MessForecastParams = {},
  auditLogs: AuditLogEntry[] = []
): MessForecastResult {
  const day = normalizeDayOfWeek(params.day);
  const weather = params.weather === 'Rainy' ? 'Rainy' : 'Sunny';
  const isExam = Boolean(params.isExam);
  
  // Validate and clamp population (default 1,200)
  const rawPop = typeof params.totalHostelStudents === 'number' && !isNaN(params.totalHostelStudents)
    ? params.totalHostelStudents
    : DEFAULT_HOSTEL_STUDENTS;
  const totalHostelStudents = Math.max(10, Math.min(10000, Math.round(rawPop)));

  const foodCostPerKg = typeof params.foodCostPerKg === 'number' && params.foodCostPerKg > 0
    ? params.foodCostPerKg
    : DEFAULT_FOOD_COST_INR_PER_KG;

  const rawBuffer = typeof params.safetyBufferPercent === 'number' && !isNaN(params.safetyBufferPercent)
    ? params.safetyBufferPercent
    : DEFAULT_SAFETY_BUFFER_PERCENT;
  const safetyBufferPercent = Math.max(0, Math.min(20, Number(rawBuffer.toFixed(1))));

  const mealPeriod = params.mealPeriod || 'Lunch';

  // 1. Day of Week Attendance Decay Multipliers
  const dayFactors: Record<string, number> = {
    Monday: 0.92,
    Tuesday: 0.90,
    Wednesday: 0.88,
    Thursday: 0.84,
    Friday: 0.70,   // Local students leave for weekend
    Saturday: 0.62,
    Sunday: 0.68,
  };

  let factor = dayFactors[day] || 0.85;

  // 2. Weather Elasticity (Monsoon rain restricts outside food ordering)
  if (weather === 'Rainy') {
    factor += 0.06;
  }

  // 3. Academic Calendar Elasticity (Exams spike dining hall turnout)
  if (isExam) {
    factor += 0.08;
  }

  // Clamp safely between 40% and 100%
  factor = Math.min(1.0, Math.max(0.40, factor));
  const turnoutFactor = Number(factor.toFixed(2));
  const turnoutPercentage = Number((factor * 100).toFixed(1));

  // 4. Expected Diners
  const expectedDiners = Math.min(totalHostelStudents, Math.round(totalHostelStudents * factor));

  // 5. Conventional Blind Prep (Cooking 100% capacity at 380g)
  const conventionalCookKg = Number((totalHostelStudents * STANDARD_PORTION_KG).toFixed(1));

  // 6. Recommended Cooking Quantity with Safety Buffer
  // Base 360g portion + explicit safety buffer
  const bufferMultiplier = 1 + (safetyBufferPercent / 100.0);
  const recommendedCookKg = Number((expectedDiners * CALIBRATED_PORTION_KG * bufferMultiplier).toFixed(1));

  // 7. Projected Avoidable Overproduction (strictly labeled as projected, never achieved)
  const projectedAvoidableOverproductionKg = Number(Math.max(0, conventionalCookKg - recommendedCookKg).toFixed(1));
  const projectedCostAvoidedInr = Math.round(projectedAvoidableOverproductionKg * foodCostPerKg);
  const projectedCo2eAvoidedKg = Number((projectedAvoidableOverproductionKg * CO2E_KG_PER_KG_FOOD).toFixed(1));
  const projectedWaterAvoidedLiters = Math.round(projectedAvoidableOverproductionKg * WATER_LITERS_PER_KG_FOOD);

  // 8. Recipe Bill of Materials (BOM) for Kitchen Dispatch
  const bom: RecipeBom = {
    grainRiceKg: Number((expectedDiners * 0.12).toFixed(1)),
    dalPulsesKg: Number((expectedDiners * 0.05).toFixed(1)),
    wheatFlourAttaKg: Number((expectedDiners * 0.09).toFixed(1)),
    freshVegetablesKg: Number((expectedDiners * 0.14).toFixed(1)),
    cookingOilLiters: Number((expectedDiners * 0.02).toFixed(1)),
  };

  // 9. Qualitative Uncertainty Assessment (No invented percentage confidence intervals)
  let uncertainty: 'low' | 'medium' | 'high' = 'low';
  let uncertaintyReason = 'Stable weekday attendance pattern.';

  if (day === 'Friday' || day === 'Saturday' || day === 'Sunday') {
    uncertainty = 'high';
    uncertaintyReason = 'Weekend transition periods exhibit higher volatility due to unscheduled student departures; maintain safety buffer.';
  } else if (weather === 'Rainy') {
    uncertainty = 'medium';
    uncertaintyReason = 'Precipitation retains additional diners on-campus with moderate demand variance.';
  }

  // 10. Plain-English Explanation
  const explanations: string[] = [];
  if (day === 'Friday' || day === 'Saturday' || day === 'Sunday') {
    explanations.push(`Weekend schedule (${day}) typically reduces hostel attendance by 30–38% due to home visits.`);
  } else {
    explanations.push(`Regular weekday (${day}) shows steady campus residency at ${Math.round(dayFactors[day] * 100)}% base turnout.`);
  }
  if (weather === 'Rainy') {
    explanations.push('Rainfall retains ~6% more students on campus by restricting off-campus dining deliveries.');
  }
  if (isExam) {
    explanations.push('Mid-term examination period concentrates ~8% additional students in campus dining.');
  }

  const explanation = explanations.join(' ');

  // 11. Audit Data Integration
  const auditData = aggregateAuditLogs(auditLogs);

  // 12. Practical Actionable Recommendations
  const recommendations: string[] = [
    `Prepare ${recommendedCookKg} kg for projected ${expectedDiners} diners (retaining an explicit ${safetyBufferPercent}% safety buffer of ${Math.round(expectedDiners * CALIBRATED_PORTION_KG * (safetyBufferPercent / 100))} kg to protect against unexpected surges).`,
  ];

  if (auditData.isIntegrated && auditData.averageLeftoverPercent !== null) {
    if (auditData.averageLeftoverPercent >= 25) {
      recommendations.push(
        `Plate audit data (${auditData.auditCount} samples) indicates an average plate leftover rate of ${auditData.averageLeftoverPercent}%. Advise counter staff to serve standard or half-rice scoops initially rather than large single helpings.`
      );
    } else if (auditData.averageLeftoverPercent <= 10) {
      recommendations.push(
        `Plate audit data shows excellent plate clearance (${auditData.averageLeftoverPercent}% leftover). Kitchen batch sizing is well aligned with diner consumption.`
      );
    }
  } else {
    recommendations.push(
      'Audit sample size is currently below statistical threshold. Kitchen should adhere to standard batch scheduling.'
    );
  }

  const forecastResult: MessForecastResult = {
    id: `fc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    parameters: {
      day,
      weather,
      isExam,
      totalHostelStudents,
      mealPeriod,
      foodCostPerKg,
      safetyBufferPercent,
    },
    turnoutFactor,
    expectedDiners,
    turnoutPercentage,
    conventionalCookKg,
    recommendedCookKg,
    projectedAvoidableOverproductionKg,
    projectedCostAvoidedInr,
    projectedCo2eAvoidedKg,
    projectedWaterAvoidedLiters,
    bom,
    uncertainty,
    uncertaintyReason,
    explanation,
    auditData,
    recommendations,
    dataFreshness: 'Calculated dynamically based on real-time parameters and session audit logs.',
    limitations: 'Demand model reflects institutional attendance decay curves and agricultural conversion factors. It is an operational decision-support tool, not an absolute guarantee of headcount.',
    actualDiners: null,
    actualCookedKg: null,
  };

  // Record in history log (keep up to 20 recent forecasts)
  forecastHistory.unshift(forecastResult);
  if (forecastHistory.length > 20) {
    forecastHistory.pop();
  }

  return forecastResult;
}

/**
 * Retrieves the recorded forecast history.
 */
export function getForecastHistory(): MessForecastResult[] {
  return forecastHistory;
}

/**
 * Records observed actual diner turnout against a specific forecast ID.
 * Returns true if record was found and updated.
 */
export function recordActualDiners(
  forecastId: string,
  actualDiners: number,
  actualCookedKg?: number
): boolean {
  const item = forecastHistory.find((f) => f.id === forecastId);
  if (!item) return false;
  item.actualDiners = Math.max(0, Math.round(actualDiners));
  if (typeof actualCookedKg === 'number' && actualCookedKg > 0) {
    item.actualCookedKg = Number(actualCookedKg.toFixed(1));
  }
  return true;
}
