import React, { useState, useEffect } from 'react';
import { 
  Utensils, Users, Calendar, CloudRain, Sun, 
  TrendingDown, AlertCircle, CheckCircle2, History,
  ChevronDown, ChevronUp, Info, Package, ShieldAlert,
  ArrowRight, RefreshCw, Check, Leaf
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

interface BomItem {
  grainRiceKg: number;
  dalPulsesKg: number;
  wheatFlourAttaKg: number;
  freshVegetablesKg: number;
  cookingOilLiters: number;
}

interface ForecastData {
  expectedDiners: number;
  turnoutPercentage: number;
  conventionalCookKg: number;
  recommendedCookKg: number;
  safetyBufferKg: number;
  projectedAvoidableOverproductionKg: number;
  projectedCostAvoidedInr: number;
  projectedCo2eAvoidedKg: number;
  explanation: string;
  uncertainty: 'low' | 'medium' | 'high';
  uncertaintyReason: string;
  auditData: {
    isIntegrated: boolean;
    averageLeftoverPercent: number | null;
    auditsCount: number;
    timeframe: string | null;
    note: string;
  };
  recommendations: string[];
  bom: BomItem;
  forecastId: string;
}

interface ForecastHistoryItem {
  id: string;
  timestamp: string;
  parameters: {
    day: string;
    weather: string;
    isExam: boolean;
    capacity: number;
  };
  expectedDiners: number;
  recommendedCookKg: number;
  actualDiners: number | null;
  actualCookKg: number | null;
  auditInformed: boolean;
}

interface MessPredictorProps {
  apiFetch?: typeof fetch;
  canRecordActuals?: boolean;
}

export const MessPredictor: React.FC<MessPredictorProps> = ({ apiFetch = fetch, canRecordActuals = true }) => {
  const [day, setDay] = useState<string>('Friday');
  const [weather, setWeather] = useState<string>('Sunny');
  const [isExam, setIsExam] = useState<boolean>(false);
  const [studentCapacity, setStudentCapacity] = useState<number>(1200);

  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showMethodology, setShowMethodology] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyItems, setHistoryItems] = useState<ForecastHistoryItem[]>([]);
  const [actualInputMap, setActualInputMap] = useState<Record<string, string>>({});
  const [loggingId, setLoggingId] = useState<string | null>(null);

  // Fetch Forecast from Backend Engine
  const fetchForecast = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const query = `?day=${encodeURIComponent(day)}&weather=${encodeURIComponent(weather)}&isExam=${isExam}&eligiblePopulation=${studentCapacity}&totalStudents=${studentCapacity}`;
      const url = API_ENDPOINTS.messForecast(query);

      const res = await apiFetch(url);

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      
      const fc = data.forecast || data;

      const expectedDiners = Number(fc.attendance?.expectedDiners ?? fc.expectedDiners ?? Math.round(studentCapacity * 0.7));
      const turnoutPercentage = Number(fc.attendance?.predictedAttendancePct ?? fc.turnoutPercentage ?? 70);
      const conventionalCookKg = Number(fc.preparation?.conventionalPreparationKg ?? fc.conventionalCookKg ?? Number((studentCapacity * 0.38).toFixed(1)));
      const recommendedCookKg = Number(fc.preparation?.recommendedPreparationKg ?? fc.recommendedCookKg ?? Number((expectedDiners * 0.36 * 1.05).toFixed(1)));
      const safetyBufferKg = Number(fc.preparation?.safetyBufferKg ?? fc.safetyBufferKg ?? Number((expectedDiners * 0.36 * 0.05).toFixed(1)));
      const projectedAvoidableOverproductionKg = Number(fc.preparation?.avoidableOverproductionKg ?? fc.projectedAvoidableOverproductionKg ?? Math.max(0, conventionalCookKg - recommendedCookKg));
      const projectedCostAvoidedInr = Number(fc.financialAndEcological?.projectedCostAvoided ?? fc.projectedCostAvoidedInr ?? Math.round(projectedAvoidableOverproductionKg * 85));
      const projectedCo2eAvoidedKg = Number(fc.financialAndEcological?.projectedCo2eAvoidedKg ?? fc.projectedCo2eAvoidedKg ?? Number((projectedAvoidableOverproductionKg * 2.5).toFixed(1)));

      const explanation = fc.explanation || `Forecast demand for ${day} under ${weather} conditions.`;
      const uncertainty = (typeof fc.uncertainty === 'string' ? fc.uncertainty : fc.uncertainty?.level) || 'low';
      const uncertaintyReason = fc.uncertaintyReason || fc.uncertainty?.reason || 'Standard demand pattern.';

      const auditData = {
        isIntegrated: Boolean(fc.auditData?.isIntegrated ?? fc.auditDataIntegration?.hasIntegratedAuditData),
        averageLeftoverPercent: fc.auditData?.averageLeftoverPercent ?? fc.auditDataIntegration?.averagePlateLeftoverPercent ?? null,
        auditsCount: fc.auditData?.auditCount ?? fc.auditDataIntegration?.auditsInformingCount ?? 0,
        timeframe: fc.auditData?.timeframe ?? fc.auditDataIntegration?.timeframe ?? null,
        note: fc.auditData?.note ?? fc.auditDataIntegration?.notes ?? 'Baseline institutional demand model.',
      };

      const bomRice = Number(fc.bom?.grainRiceKg ?? (fc.recipeBreakdown?.find((r: any) => r.item?.includes('Rice'))?.quantityKg) ?? Number((expectedDiners * 0.12).toFixed(1)));
      const bomDal = Number(fc.bom?.dalPulsesKg ?? (fc.recipeBreakdown?.find((r: any) => r.item?.includes('Dal'))?.quantityKg) ?? Number((expectedDiners * 0.05).toFixed(1)));
      const bomAtta = Number(fc.bom?.wheatFlourAttaKg ?? (fc.recipeBreakdown?.find((r: any) => r.item?.includes('Atta'))?.quantityKg) ?? Number((expectedDiners * 0.09).toFixed(1)));
      const bomVeg = Number(fc.bom?.freshVegetablesKg ?? (fc.recipeBreakdown?.find((r: any) => r.item?.includes('Vegetables'))?.quantityKg) ?? Number((expectedDiners * 0.14).toFixed(1)));
      const bomOil = Number(fc.bom?.cookingOilLiters ?? (fc.recipeBreakdown?.find((r: any) => r.item?.includes('Oil'))?.quantityKg) ?? Number((expectedDiners * 0.02).toFixed(1)));

      const recommendations = Array.isArray(fc.recommendations) && fc.recommendations.length > 0
        ? fc.recommendations
        : [
            `Batch 1 (Opening service): Prepare ~${Math.round(recommendedCookKg * 0.65)} kg (${Math.round(expectedDiners * 0.65)} portions).`,
            `Batch 2 (Buffer demand): Prepare remaining ~${Math.round(recommendedCookKg * 0.35)} kg based on actual headcount arrivals.`,
            `Maintain ${safetyBufferKg} kg (5%) hot kitchen buffer to avoid student food run-outs.`
          ];

      const forecastId = fc.id || fc.forecastId || fc.forecast?.forecastId || `fc-${Date.now()}`;

      const mapped: ForecastData = {
        expectedDiners,
        turnoutPercentage,
        conventionalCookKg,
        recommendedCookKg,
        safetyBufferKg,
        projectedAvoidableOverproductionKg,
        projectedCostAvoidedInr,
        projectedCo2eAvoidedKg,
        explanation,
        uncertainty,
        uncertaintyReason,
        auditData,
        recommendations,
        bom: {
          grainRiceKg: bomRice,
          dalPulsesKg: bomDal,
          wheatFlourAttaKg: bomAtta,
          freshVegetablesKg: bomVeg,
          cookingOilLiters: bomOil,
        },
        forecastId,
      };

      setForecast(mapped);
      setFetchError(null);
    } catch (err: any) {
      console.error('Failed to load mess forecast:', err);
      setFetchError('Failed to fetch forecast from server. Please verify backend connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await apiFetch(API_ENDPOINTS.messForecastHistory);
      if (!res.ok) return;
      const data = await res.json();
      setHistoryItems(data.history || []);
    } catch (err) {
      console.error('Failed to fetch forecast history:', err);
    }
  };

  useEffect(() => {
    fetchForecast();
    fetchHistory();
  }, [day, weather, isExam, studentCapacity]);

  const handleRecordActual = async (forecastId: string) => {
    const inputVal = actualInputMap[forecastId];
    if (!inputVal || isNaN(Number(inputVal))) return;

    setLoggingId(forecastId);
    try {
      const res = await apiFetch(API_ENDPOINTS.messForecastActual, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forecastId,
          actualDiners: Number(inputVal),
        }),
      });
      if (res.ok) {
        await fetchHistory();
        setActualInputMap(prev => {
          const next = { ...prev };
          delete next[forecastId];
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to record actual diners:', err);
    } finally {
      setLoggingId(null);
    }
  };

  const getUncertaintyBadge = (uncertainty: 'low' | 'medium' | 'high') => {
    switch (uncertainty) {
      case 'low':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F5E9] border border-[#DCEBDD] text-[#166534]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            Low Demand Volatility
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
            High Demand Volatility
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5FBF5] border border-[#DCEBDD] text-[#166534]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635]" />
            Moderate Demand Volatility
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Section A: Page Heading ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#14532D] leading-tight">
            Smart Mess Predictor
          </h2>
          <p className="text-sm text-[#64748B] mt-1">
            Institutional attendance forecasting and kitchen preparation calibration.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-[#166534] bg-white border border-[#DCEBDD] px-3 py-1.5 rounded-xl self-start sm:self-auto shadow-2xs font-semibold">
            <Users className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Enrolled context: {studentCapacity.toLocaleString()} registered diners</span>
          </span>
        </div>
      </div>

      {/* ── Section B: Forecast Parameters & Configurable Capacity ───────── */}
      <div className="bg-white border border-[#DCEBDD] rounded-3xl p-5 sm:p-6 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#14532D]">Forecast Parameters</h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Attendance curve elasticity based on day of week, precipitation, and academic events.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowHistory(v => !v)}
            className="text-xs text-[#166534] hover:text-[#14532D] font-semibold flex items-center gap-1.5 underline underline-offset-2 cursor-pointer self-start sm:self-auto"
          >
            <History className="w-3.5 h-3.5" />
            <span>{showHistory ? 'Hide Forecast History' : 'View Session Forecast History'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Day of Week */}
          <div>
            <label className="text-xs font-semibold text-[#1F2937] block mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#166534]" />
              <span>Day of the Week</span>
            </label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full bg-[#F5FBF5] border border-[#DCEBDD] rounded-xl px-3 py-2.5 min-h-[44px] text-xs text-[#1F2937] font-semibold focus:outline-none focus:ring-2 focus:ring-[#22C55E] transition cursor-pointer touch-manipulation"
            >
              <option value="Monday">Monday (~92% Turnout)</option>
              <option value="Tuesday">Tuesday (~90% Turnout)</option>
              <option value="Wednesday">Wednesday (~88% Turnout)</option>
              <option value="Thursday">Thursday (~84% Turnout)</option>
              <option value="Friday">Friday (~70% Turnout - Weekend departures)</option>
              <option value="Saturday">Saturday (~62% Turnout)</option>
              <option value="Sunday">Sunday (~68% Turnout)</option>
            </select>
          </div>

          {/* Weather Simulation */}
          <div>
            <label className="text-xs font-semibold text-[#1F2937] block mb-1.5 flex items-center gap-1.5">
              {weather === 'Sunny' ? <Sun className="w-3.5 h-3.5 text-[#D97706]" /> : <CloudRain className="w-3.5 h-3.5 text-[#0284C7]" />}
              <span>Weather Condition</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWeather('Sunny')}
                className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#22C55E] ${
                  weather === 'Sunny'
                    ? 'bg-[#166534] border-[#166534] text-white shadow-2xs'
                    : 'bg-[#F5FBF5] border-[#DCEBDD] text-[#166534] hover:bg-[#E8F5E9]'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Sunny</span>
              </button>
              <button
                type="button"
                onClick={() => setWeather('Rainy')}
                className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#22C55E] ${
                  weather === 'Rainy'
                    ? 'bg-[#166534] border-[#166534] text-white shadow-2xs'
                    : 'bg-[#F5FBF5] border-[#DCEBDD] text-[#166534] hover:bg-[#E8F5E9]'
                }`}
              >
                <CloudRain className="w-3 h-3" />
                <span>Rain (+6%)</span>
              </button>
            </div>
          </div>

          {/* Exam Period Toggle */}
          <div>
            <label className="text-xs font-semibold text-[#1F2937] block mb-1.5">
              Academic Schedule
            </label>
            <button
              type="button"
              onClick={() => setIsExam(!isExam)}
              className={`w-full min-h-[44px] py-2.5 px-3.5 rounded-xl text-xs font-semibold border transition flex items-center justify-between cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#22C55E] ${
                isExam
                  ? 'bg-[#166534] border-[#166534] text-white shadow-2xs'
                  : 'bg-[#F5FBF5] border-[#DCEBDD] text-[#166534] hover:bg-[#E8F5E9]'
              }`}
            >
              <span>Mid-Term Exam Week</span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-bold ${
                isExam ? 'bg-white/20 text-white' : 'bg-[#E8F5E9] text-[#166534]'
              }`}>
                {isExam ? 'ACTIVE (+8%)' : 'OFF'}
              </span>
            </button>
          </div>

          {/* Configurable Enrolled Student Population */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#166534]" />
                <span>Enrolled Population</span>
              </label>
              {studentCapacity !== 1200 && (
                <button
                  type="button"
                  onClick={() => setStudentCapacity(1200)}
                  className="text-[11px] text-[#B45309] hover:underline cursor-pointer font-semibold"
                >
                  Reset (1,200)
                </button>
              )}
            </div>
            <input
              type="number"
              min="10"
              max="5000"
              value={studentCapacity}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) setStudentCapacity(val);
              }}
              className="w-full bg-[#F5FBF5] border border-[#DCEBDD] rounded-xl px-3 py-2.5 min-h-[44px] text-xs text-[#14532D] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#22C55E] transition"
            />
          </div>
        </div>
      </div>

      {/* Error state */}
      {fetchError && (
        <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#D97706]" />
          <span>{fetchError}</span>
        </div>
      )}

      {/* ── Section C: Forecast Results & Recommendations ─────────────── */}
      {forecast && (
        <div className="space-y-6">

          {/* Expected Demand Banner */}
          <div className="bg-white border border-[#DCEBDD] rounded-3xl p-5 sm:p-6 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs text-[#64748B] uppercase tracking-wider font-semibold">
                    Projected Diners
                  </span>
                  {getUncertaintyBadge(forecast.uncertainty)}
                </div>
                <p className="text-3xl font-mono font-bold text-[#14532D]">
                  {forecast.expectedDiners}
                  <span className="text-sm font-normal text-[#64748B] ml-2 block xs:inline font-sans">
                    attendees ({forecast.turnoutPercentage}% of {studentCapacity.toLocaleString()} registered)
                  </span>
                </p>
                <p className="text-xs text-[#1F2937]/80 mt-2 leading-relaxed">
                  {forecast.explanation}
                </p>
              </div>

              {/* Audit Data Integration Indicator */}
              <div className="text-xs p-3.5 rounded-2xl max-w-sm shrink-0 border bg-[#F5FBF5] border-[#DCEBDD] self-start space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#14532D]">
                  <Leaf className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>
                    {forecast.auditData.isIntegrated ? 'Informed by Food Waste Audits' : 'Institutional Baseline Model'}
                  </span>
                </div>
                <p className="text-[#64748B] text-[11px] leading-relaxed">
                  {forecast.auditData.note}
                </p>
              </div>
            </div>

            {/* Uncertainty Context Callout */}
            <div className="pt-3 border-t border-[#DCEBDD] flex items-start gap-2 text-xs text-[#64748B]">
              <ShieldAlert className="w-4 h-4 text-[#166534] shrink-0 mt-0.5" />
              <p>
                <strong className="text-[#1F2937]">Uncertainty Note:</strong> {forecast.uncertaintyReason}
              </p>
            </div>
          </div>

          {/* Preparation Recommendation Comparison */}
          <div className="bg-white border border-[#DCEBDD] rounded-3xl p-5 sm:p-6 shadow-card space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-[#DCEBDD]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#14532D]">Kitchen Preparation Calibration</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Comparing blind full-capacity preparation against demand-matched recommendation.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#166534] bg-[#E8F5E9] border border-[#DCEBDD] px-3 py-1 rounded-xl self-start sm:self-auto shrink-0 shadow-2xs">
                {forecast.projectedAvoidableOverproductionKg} kg Projected Overproduction Avoided
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Conventional Blind Prep */}
              <div className="p-5 rounded-2xl bg-[#F5FBF5] border border-[#DCEBDD]">
                <span className="text-xs text-[#64748B] uppercase tracking-wider block mb-1 font-semibold">
                  Conventional Full-Capacity Prep
                </span>
                <p className="text-2xl font-mono font-bold text-[#1F2937]">
                  {forecast.conventionalCookKg} kg
                </p>
                <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                  Kitchen cooks blindly for 100% capacity ({studentCapacity.toLocaleString()} diners × 380g standard thali), creating surplus when attendance drops.
                </p>
                <div className="mt-3.5 pt-2.5 border-t border-[#DCEBDD] text-xs text-[#B45309] flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Estimated ~{forecast.projectedAvoidableOverproductionKg} kg surplus food if uncalibrated</span>
                </div>
              </div>

              {/* Recommended Prep */}
              <div className="p-5 rounded-2xl bg-[#E8F5E9]/50 border-2 border-[#166534] shadow-card relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#166534] font-bold uppercase tracking-wider">
                    Recommended Prep Quantity
                  </span>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#166534] text-white font-bold">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-2xl font-mono font-bold text-[#166534]">
                  {forecast.recommendedCookKg} kg
                </p>
                <p className="text-xs text-[#14532D] mt-1.5 leading-relaxed">
                  Calibrated for {forecast.expectedDiners} projected diners with an explicit <strong>5% safety buffer</strong> to guard against sudden surges.
                </p>
                <div className="mt-3.5 pt-2.5 border-t border-[#DCEBDD] text-xs text-[#166534] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#22C55E]" />
                  <span>Curbs avoidable surplus by {forecast.projectedAvoidableOverproductionKg} kg</span>
                </div>
              </div>
            </div>

            {/* Practical Actionable Kitchen Advice */}
            <div className="p-4 rounded-2xl bg-[#F5FBF5] border border-[#DCEBDD] space-y-2">
              <span className="text-xs font-semibold text-[#14532D] uppercase tracking-wider block">
                Supervisor Action Plan
              </span>
              <ul className="space-y-1.5 text-xs text-[#1F2937]/80">
                {forecast.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#22C55E] font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Projected Avoidable Resource Footprint Strip */}
            <div className="pt-3 border-t border-[#DCEBDD]">
              <span className="text-[11px] text-[#64748B] block mb-2 text-center uppercase tracking-wider font-semibold">
                Projected Avoidable Overproduction (Decision-Support Model · Not Achieved Savings)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-[#F5FBF5] border border-[#DCEBDD] flex sm:flex-col items-center justify-between sm:justify-center text-left sm:text-center">
                  <div>
                    <span className="text-xs text-[#64748B] block">Overproduction Curtailed</span>
                    <span className="text-[11px] text-[#64748B] hidden sm:block">unneeded raw batch</span>
                  </div>
                  <div className="text-right sm:text-center">
                    <span className="text-base sm:text-lg font-mono font-bold text-[#14532D] block">
                      {forecast.projectedAvoidableOverproductionKg} kg
                    </span>
                    <span className="text-[10px] text-[#64748B] sm:hidden">unneeded batch</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F5FBF5] border border-[#DCEBDD] flex sm:flex-col items-center justify-between sm:justify-center text-left sm:text-center">
                  <div>
                    <span className="text-xs text-[#64748B] block">Projected Cost Avoided</span>
                    <span className="text-[11px] text-[#64748B] hidden sm:block">at ₹85/kg food cost</span>
                  </div>
                  <div className="text-right sm:text-center">
                    <span className="text-base sm:text-lg font-mono font-bold text-[#166534] block">
                      ₹{forecast.projectedCostAvoidedInr.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#64748B] sm:hidden">at ₹85/kg cost</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F5FBF5] border border-[#DCEBDD] flex sm:flex-col items-center justify-between sm:justify-center text-left sm:text-center">
                  <div>
                    <span className="text-xs text-[#64748B] block">Embodied CO₂e</span>
                    <span className="text-[11px] text-[#64748B] hidden sm:block">emissions prevented</span>
                  </div>
                  <div className="text-right sm:text-center">
                    <span className="text-base sm:text-lg font-mono font-bold text-[#14532D] block">
                      {forecast.projectedCo2eAvoidedKg} kg
                    </span>
                    <span className="text-[10px] text-[#64748B] sm:hidden">IPCC factor</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recipe Bill of Materials (BOM) */}
          <div className="bg-white border border-[#DCEBDD] rounded-3xl p-5 sm:p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#DCEBDD]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#14532D]">Kitchen Ingredient Dispatch (BOM)</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Recommended raw ingredient allocation for {forecast.expectedDiners} projected diners.
                </p>
              </div>
              <span className="text-xs text-[#166534] flex items-center gap-1 shrink-0 font-semibold bg-[#E8F5E9] px-2.5 py-1 rounded-xl border border-[#DCEBDD]">
                <Package className="w-3.5 h-3.5 text-[#22C55E]" />
                <span className="hidden xs:inline">Standard Portions</span>
              </span>
            </div>

            {/* Mobile View */}
            <div className="sm:hidden divide-y divide-[#DCEBDD] border border-[#DCEBDD] rounded-2xl overflow-hidden bg-[#F5FBF5]">
              {[
                { name: 'Basmati Rice', qty: `${forecast.bom.grainRiceKg} kg`, norm: '120g / diner' },
                { name: 'Dal & Pulses', qty: `${forecast.bom.dalPulsesKg} kg`, norm: '50g / diner' },
                { name: 'Wheat Atta (Roti)', qty: `${forecast.bom.wheatFlourAttaKg} kg`, norm: '90g / diner' },
                { name: 'Fresh Vegetables', qty: `${forecast.bom.freshVegetablesKg} kg`, norm: '140g / diner' },
                { name: 'Cooking Oil', qty: `${forecast.bom.cookingOilLiters} L`, norm: '20ml / diner' },
              ].map((item) => (
                <div key={item.name} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-[#1F2937] block truncate">{item.name}</span>
                    <span className="text-[11px] text-[#64748B]">{item.norm}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-mono font-bold text-[#14532D]">{item.qty}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tablet & Desktop View */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-[#F5FBF5] border border-[#DCEBDD]">
                <span className="text-xs text-[#64748B] block font-medium">Basmati Rice</span>
                <span className="text-lg font-mono font-bold text-[#14532D] mt-0.5 block">
                  {forecast.bom.grainRiceKg} kg
                </span>
                <span className="text-[11px] text-[#64748B]">120g / head</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5FBF5] border border-[#DCEBDD]">
                <span className="text-xs text-[#64748B] block font-medium">Dal & Pulses</span>
                <span className="text-lg font-mono font-bold text-[#14532D] mt-0.5 block">
                  {forecast.bom.dalPulsesKg} kg
                </span>
                <span className="text-[11px] text-[#64748B]">50g / head</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5FBF5] border border-[#DCEBDD]">
                <span className="text-xs text-[#64748B] block font-medium">Wheat Atta (Roti)</span>
                <span className="text-lg font-mono font-bold text-[#14532D] mt-0.5 block">
                  {forecast.bom.wheatFlourAttaKg} kg
                </span>
                <span className="text-[11px] text-[#64748B]">90g / head</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5FBF5] border border-[#DCEBDD]">
                <span className="text-xs text-[#64748B] block font-medium">Fresh Vegetables</span>
                <span className="text-lg font-mono font-bold text-[#14532D] mt-0.5 block">
                  {forecast.bom.freshVegetablesKg} kg
                </span>
                <span className="text-[11px] text-[#64748B]">140g / head</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5FBF5] border border-[#DCEBDD]">
                <span className="text-xs text-[#64748B] block font-medium">Cooking Oil</span>
                <span className="text-lg font-mono font-bold text-[#14532D] mt-0.5 block">
                  {forecast.bom.cookingOilLiters} L
                </span>
                <span className="text-[11px] text-[#64748B]">20ml / head</span>
              </div>
            </div>
          </div>

          {/* ── Section D: Forecast History & Actual Outcome Logging ───────── */}
          {showHistory && (
            <div className="bg-white border border-[#DCEBDD] rounded-3xl p-5 sm:p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#DCEBDD]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#14532D]">Recent Forecast Records</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Track predicted demand and log actual observed turnouts for audit accountability.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchHistory}
                  className="text-xs text-[#166534] hover:text-[#14532D] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>

              {historyItems.length === 0 ? (
                <p className="text-xs text-[#64748B] py-6 text-center">
                  No forecast records available in this session.
                </p>
              ) : (
                <div className="divide-y divide-[#DCEBDD]">
                  {historyItems.slice(0, 5).map((item) => {
                    const hasActual = typeof item.actualDiners === 'number';
                    const diff = hasActual ? (item.actualDiners! - item.expectedDiners) : 0;
                    return (
                      <div key={item.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#1F2937]">
                              {item.parameters.day} ({item.parameters.weather})
                            </span>
                            {item.parameters.isExam && (
                              <span className="text-[10px] bg-[#E8F5E9] text-[#166534] px-2 py-0.5 rounded-md font-bold">
                                Exam
                              </span>
                            )}
                            <span className="text-[11px] text-[#64748B]">
                              at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[#64748B]">
                            Predicted: <strong>{item.expectedDiners} diners</strong> · Recommended: <strong>{item.recommendedCookKg} kg</strong>
                          </p>
                          {hasActual && (
                            <p className="text-[#166534] font-medium flex items-center gap-1 pt-0.5">
                              <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                              <span>Observed Turnout: <strong>{item.actualDiners} diners</strong> ({diff >= 0 ? `+${diff}` : diff} variance)</span>
                            </p>
                          )}
                        </div>

                        {/* Log Actual Turnout form */}
                        {!hasActual && canRecordActuals && (
                          <div className="flex items-center gap-2 self-start md:self-auto">
                            <input
                              type="number"
                              min="0"
                              placeholder="Actual diners"
                              value={actualInputMap[item.id] || ''}
                              onChange={(e) => setActualInputMap({ ...actualInputMap, [item.id]: e.target.value })}
                              className="w-28 px-3 py-1.5 text-xs rounded-xl border border-[#DCEBDD] bg-[#F5FBF5] focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                            />
                            <button
                              type="button"
                              onClick={() => handleRecordActual(item.id)}
                              disabled={loggingId === item.id || !actualInputMap[item.id]}
                              className="px-3 py-1.5 rounded-xl bg-[#166534] hover:bg-[#14532D] disabled:opacity-50 text-white text-xs font-semibold cursor-pointer shadow-2xs"
                            >
                              {loggingId === item.id ? 'Saving…' : 'Log'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Section E: Collapsible Methodology Accordion ──────────────── */}
          <div className="bg-white border border-[#DCEBDD] rounded-3xl overflow-hidden shadow-card">
            <button
              type="button"
              onClick={() => setShowMethodology(v => !v)}
              className="w-full px-5 py-4 min-h-[44px] flex items-center justify-between text-left hover:bg-[#F5FBF5] transition cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-[#166534]">
                <Info className="w-4 h-4 shrink-0 text-[#22C55E]" />
                <span>How is this estimated? (Methodology, Serving Standards & Buffer Policy)</span>
              </div>
              {showMethodology ? <ChevronUp className="w-4 h-4 text-[#64748B] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#64748B] shrink-0" />}
            </button>

            {showMethodology && (
              <div className="px-5 pb-5 pt-1 space-y-4 border-t border-[#DCEBDD] text-xs text-[#64748B] leading-relaxed">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#F5FBF5] border border-[#DCEBDD] space-y-1.5">
                    <p className="font-semibold text-[#14532D]">Attendance Estimation Heuristics</p>
                    <p>• <strong>Turnout Multiplier:</strong> Weekday base attendance is 84–92%, while weekend attendance drops to 62–70% due to local departures.</p>
                    <p>• <strong>Weather Signal:</strong> Monsoon precipitation retains ~6% more students on-campus.</p>
                    <p>• <strong>Academic Calendar:</strong> Examination schedules concentrate ~8% additional students in hostel dining.</p>
                    <p>• <strong>Bounds:</strong> Turnout factor is clamped between 40% and 100% to prevent impossible projections.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F5FBF5] border border-[#DCEBDD] space-y-1.5">
                    <p className="font-semibold text-[#14532D]">Kitchen Safety Buffer & Portion Norms</p>
                    <p>• <strong>Portion Standard:</strong> 360g base cooked thali per attendee (120g rice, 50g dal, 90g roti, 140g vegetables, 20ml oil).</p>
                    <p>• <strong>5% Safety Buffer:</strong> Added over point estimate to prevent kitchen run-outs during demand variance.</p>
                    <p>• <strong>Food Cost:</strong> Evaluated at ₹85.00/kg subsidized institutional preparation cost.</p>
                    <p>• <strong>Embodied Carbon:</strong> Evaluated at 2.5 kg CO₂e / kg food waste (IPCC AR6).</p>
                  </div>
                </div>

                <p className="text-[11px] text-[#64748B]">
                  Disclaimer: Demand forecasts are simulated operational decision-support aids based on institutional dining decay curves and plate audit statistics. Kitchen supervisors should inspect batch tickets before dispatch.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
