import React, { useState, useEffect } from 'react';
import { 
  Utensils, CloudRain, Sun, Calendar, TrendingDown, 
  IndianRupee, Leaf, Flame, AlertCircle, CheckCircle2,
  Package, Info, RefreshCw, Users, ChevronDown, ChevronUp,
  ShieldAlert, Clock, Sparkles, SlidersHorizontal, Check,
  History, ArrowRight, CornerDownRight
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

interface BomBreakdown {
  grainRiceKg: number;
  dalPulsesKg: number;
  wheatFlourAttaKg: number;
  freshVegetablesKg: number;
  cookingOilLiters: number;
}

interface AuditAggregateData {
  auditCount: number;
  averageLeftoverPercent: number | null;
  periodCovered: string;
  isIntegrated: boolean;
  note: string;
}

interface MessForecastData {
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
  bom: BomBreakdown;
  uncertainty: 'low' | 'medium' | 'high';
  uncertaintyReason: string;
  explanation: string;
  auditData: AuditAggregateData;
  recommendations: string[];
  dataFreshness: string;
  limitations: string;
  actualDiners: number | null;
  actualCookedKg: number | null;
  // Aliases for compatibility
  day: string;
  weather: string;
  isExam: boolean;
  totalHostelStudents: number;
  savedFoodKg: number;
  costSavedInr: number;
  co2eSavedKg: number;
  waterSavedLiters: number;
}

export const MessPredictor: React.FC = () => {
  const [day, setDay] = useState<string>('Friday');
  const [weather, setWeather] = useState<string>('Sunny');
  const [isExam, setIsExam] = useState<boolean>(false);
  const [studentCapacity, setStudentCapacity] = useState<number>(1200);
  const [forecast, setForecast] = useState<MessForecastData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showMethodology, setShowMethodology] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyItems, setHistoryItems] = useState<MessForecastData[]>([]);

  // Actual Diner Entry State
  const [actualInputMap, setActualInputMap] = useState<Record<string, string>>({});
  const [loggingId, setLoggingId] = useState<string | null>(null);

  const fetchForecast = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const query = `?day=${day}&weather=${weather}&isExam=${isExam}&totalStudents=${studentCapacity}`;
      const res = await fetch(API_ENDPOINTS.messForecast(query));
      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      const data: MessForecastData = await res.json();
      setForecast(data);
    } catch (err: any) {
      console.error('Failed to load mess forecast:', err);
      setFetchError('Unable to retrieve forecast data from server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.messForecastHistory);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.history)) {
          setHistoryItems(data.history);
        }
      }
    } catch (e) {
      console.warn('Failed to load forecast history:', e);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [day, weather, isExam, studentCapacity]);

  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory]);

  const handleRecordActual = async (forecastId: string) => {
    const rawVal = actualInputMap[forecastId];
    if (!rawVal || isNaN(Number(rawVal))) return;

    setLoggingId(forecastId);
    try {
      const res = await fetch(API_ENDPOINTS.messForecastActual, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forecastId,
          actualDiners: Number(rawVal),
        }),
      });

      if (res.ok) {
        await fetchHistory();
        if (forecast && forecast.id === forecastId) {
          setForecast(prev => prev ? { ...prev, actualDiners: Number(rawVal) } : null);
        }
      }
    } catch (e) {
      console.error('Failed to log actual diners:', e);
    } finally {
      setLoggingId(null);
    }
  };

  const getUncertaintyBadge = (uncertainty: 'low' | 'medium' | 'high') => {
    switch (uncertainty) {
      case 'low':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            Low Demand Volatility
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            High Demand Volatility
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
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
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#191C1A] leading-tight">
            Smart Mess Predictor
          </h2>
          <p className="text-sm text-[#486340] mt-1">
            Institutional attendance forecasting and kitchen preparation calibration.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-[#8E9789] bg-[#F5F7F0] border border-[#E0E8DA] px-2.5 py-1.5 rounded-lg self-start sm:self-auto">
            <Users className="w-3.5 h-3.5 text-[#486340]" />
            <span>Enrolled context: {studentCapacity.toLocaleString()} registered diners</span>
          </span>
        </div>
      </div>

      {/* ── Section B: Forecast Parameters & Configurable Capacity ───────── */}
      <div className="bg-white border border-[#D8E4D2] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[#191C1A]">Forecast Parameters</h3>
            <p className="text-xs text-[#8E9789] mt-0.5">
              Attendance curve elasticity based on day of week, precipitation, and academic events.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowHistory(v => !v)}
            className="text-xs text-[#486340] hover:text-[#1B3826] font-semibold flex items-center gap-1.5 underline underline-offset-2 cursor-pointer self-start sm:self-auto"
          >
            <History className="w-3.5 h-3.5" />
            <span>{showHistory ? 'Hide Forecast History' : 'View Session Forecast History'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Day of Week */}
          <div>
            <label className="text-xs font-medium text-[#486340] block mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#8E9789]" />
              <span>Day of the Week</span>
            </label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#D8E4D2] rounded-xl px-3 py-2.5 min-h-[44px] text-xs text-[#191C1A] font-medium focus:outline-none focus:border-[#1B3826] transition cursor-pointer touch-manipulation"
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
            <label className="text-xs font-medium text-[#486340] block mb-1.5 flex items-center gap-1.5">
              {weather === 'Sunny' ? <Sun className="w-3.5 h-3.5 text-[#F59E0B]" /> : <CloudRain className="w-3.5 h-3.5 text-[#0284C7]" />}
              <span>Weather Condition</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWeather('Sunny')}
                className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-medium border transition flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#1B3826] ${
                  weather === 'Sunny'
                    ? 'bg-[#1B3826] border-[#1B3826] text-white shadow-2xs'
                    : 'bg-[#FAF8F5] border-[#D8E4D2] text-[#486340] hover:bg-[#F2F7F0]'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Sunny</span>
              </button>
              <button
                type="button"
                onClick={() => setWeather('Rainy')}
                className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-medium border transition flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#1B3826] ${
                  weather === 'Rainy'
                    ? 'bg-[#1B3826] border-[#1B3826] text-white shadow-2xs'
                    : 'bg-[#FAF8F5] border-[#D8E4D2] text-[#486340] hover:bg-[#F2F7F0]'
                }`}
              >
                <CloudRain className="w-3 h-3" />
                <span>Rain (+6%)</span>
              </button>
            </div>
          </div>

          {/* Exam Period Toggle */}
          <div>
            <label className="text-xs font-medium text-[#486340] block mb-1.5">
              Academic Schedule
            </label>
            <button
              type="button"
              onClick={() => setIsExam(!isExam)}
              className={`w-full min-h-[44px] py-2.5 px-3.5 rounded-xl text-xs font-medium border transition flex items-center justify-between cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#1B3826] ${
                isExam
                  ? 'bg-[#1B3826] border-[#1B3826] text-white shadow-2xs'
                  : 'bg-[#FAF8F5] border-[#D8E4D2] text-[#486340] hover:bg-[#F2F7F0]'
              }`}
            >
              <span>Mid-Term Exam Week</span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                isExam ? 'bg-white/20 text-white' : 'bg-[#EAF2E7] text-[#1B3826]'
              }`}>
                {isExam ? 'ACTIVE (+8%)' : 'OFF'}
              </span>
            </button>
          </div>

          {/* Configurable Enrolled Student Population */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#486340] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#8E9789]" />
                <span>Enrolled Population</span>
              </label>
              {studentCapacity !== 1200 && (
                <button
                  type="button"
                  onClick={() => setStudentCapacity(1200)}
                  className="text-[11px] text-[#B45309] hover:underline cursor-pointer"
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
              className="w-full bg-[#FAF8F5] border border-[#D8E4D2] rounded-xl px-3 py-2.5 min-h-[44px] text-xs text-[#191C1A] font-mono font-bold focus:outline-none focus:border-[#1B3826] transition"
            />
          </div>
        </div>
      </div>

      {/* Error state */}
      {fetchError && (
        <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#F59E0B]" />
          <span>{fetchError}</span>
        </div>
      )}

      {/* ── Section C: Forecast Results & Recommendations ─────────────── */}
      {forecast && (
        <div className="space-y-6">

          {/* Expected Demand Banner with Uncertainty Assessment & Audit Integration Notice */}
          <div className="bg-white border border-[#D8E4D2] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs text-[#8E9789] uppercase tracking-wider font-semibold">
                    Projected Diners
                  </span>
                  {getUncertaintyBadge(forecast.uncertainty)}
                </div>
                <p className="text-3xl font-mono font-bold text-[#191C1A]">
                  {forecast.expectedDiners}
                  <span className="text-sm font-normal text-[#8E9789] ml-2 block xs:inline font-sans">
                    attendees ({forecast.turnoutPercentage}% of {studentCapacity.toLocaleString()} registered)
                  </span>
                </p>
                <p className="text-xs text-[#486340] mt-2 leading-relaxed">
                  {forecast.explanation}
                </p>
              </div>

              {/* Audit Data Integration Indicator */}
              <div className="text-xs p-3 rounded-xl max-w-sm shrink-0 border bg-[#FAF8F5] border-[#E0E8DA] self-start space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#191C1A]">
                  <Leaf className="w-3.5 h-3.5 text-[#166534]" />
                  <span>
                    {forecast.auditData.isIntegrated ? 'Informed by Food Waste Audits' : 'Institutional Baseline Model'}
                  </span>
                </div>
                <p className="text-[#6B7B68] text-[11px] leading-relaxed">
                  {forecast.auditData.note}
                </p>
              </div>
            </div>

            {/* Uncertainty Context Callout */}
            <div className="pt-3 border-t border-[#EDF0E9] flex items-start gap-2 text-xs text-[#6B7B68]">
              <ShieldAlert className="w-4 h-4 text-[#486340] shrink-0 mt-0.5" />
              <p>
                <strong>Uncertainty Note:</strong> {forecast.uncertaintyReason}
              </p>
            </div>
          </div>

          {/* Preparation Recommendation Comparison */}
          <div className="bg-white border border-[#D8E4D2] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EDF0E9]">
              <div>
                <h3 className="text-sm font-semibold text-[#191C1A]">Kitchen Preparation Calibration</h3>
                <p className="text-xs text-[#8E9789] mt-0.5">
                  Comparing blind full-capacity preparation against demand-matched recommendation.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#166534] bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-1 rounded-lg self-start sm:self-auto shrink-0">
                {forecast.projectedAvoidableOverproductionKg} kg Projected Overproduction Avoided
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Conventional Blind Prep */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA]">
                <span className="text-xs text-[#8E9789] uppercase tracking-wider block mb-1">
                  Conventional Full-Capacity Prep
                </span>
                <p className="text-2xl font-mono font-bold text-[#191C1A]">
                  {forecast.conventionalCookKg} kg
                </p>
                <p className="text-xs text-[#6B7B68] mt-1.5 leading-relaxed">
                  Kitchen cooks blindly for 100% capacity ({studentCapacity.toLocaleString()} diners × 380g standard thali), creating surplus when attendance drops.
                </p>
                <div className="mt-3 pt-2.5 border-t border-[#E0E8DA] text-xs text-[#B45309] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Estimated ~{forecast.projectedAvoidableOverproductionKg} kg surplus food if uncalibrated</span>
                </div>
              </div>

              {/* Recommended Prep */}
              <div className="p-4 rounded-xl bg-[#F0FDF4] border-2 border-[#1B3826] shadow-2xs relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#1B3826] font-semibold uppercase tracking-wider">
                    Recommended Prep Quantity
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#1B3826] text-white font-medium">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-2xl font-mono font-bold text-[#1B3826]">
                  {forecast.recommendedCookKg} kg
                </p>
                <p className="text-xs text-[#15803D] mt-1.5 leading-relaxed">
                  Calibrated for {forecast.expectedDiners} projected diners with an explicit <strong>5% safety buffer</strong> to guard against sudden surges.
                </p>
                <div className="mt-3 pt-2.5 border-t border-[#BBF7D0] text-xs text-[#166534] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Curbs avoidable surplus by {forecast.projectedAvoidableOverproductionKg} kg</span>
                </div>
              </div>
            </div>

            {/* Practical Actionable Kitchen Advice */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA] space-y-2">
              <span className="text-xs font-semibold text-[#191C1A] uppercase tracking-wider block">
                Supervisor Action Plan
              </span>
              <ul className="space-y-1.5 text-xs text-[#486340]">
                {forecast.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#1B3826] font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Projected Avoidable Resource Footprint Strip */}
            <div className="pt-3 border-t border-[#EDF0E9]">
              <span className="text-[11px] text-[#8E9789] block mb-2 text-center uppercase tracking-wider font-semibold">
                Projected Avoidable Overproduction (Decision-Support Model · Not Achieved Savings)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-center">
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA] flex sm:flex-col items-center justify-between sm:justify-center text-left sm:text-center">
                  <div>
                    <span className="text-xs text-[#8E9789] block">Overproduction Curtailed</span>
                    <span className="text-[11px] text-[#8E9789] hidden sm:block">unneeded raw batch</span>
                  </div>
                  <div className="text-right sm:text-center">
                    <span className="text-base sm:text-lg font-mono font-bold text-[#191C1A] block">
                      {forecast.projectedAvoidableOverproductionKg} kg
                    </span>
                    <span className="text-[10px] text-[#8E9789] sm:hidden">unneeded batch</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA] flex sm:flex-col items-center justify-between sm:justify-center text-left sm:text-center">
                  <div>
                    <span className="text-xs text-[#8E9789] block">Projected Cost Avoided</span>
                    <span className="text-[11px] text-[#8E9789] hidden sm:block">at ₹85/kg food cost</span>
                  </div>
                  <div className="text-right sm:text-center">
                    <span className="text-base sm:text-lg font-mono font-bold text-[#166534] block">
                      ₹{forecast.projectedCostAvoidedInr.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#8E9789] sm:hidden">at ₹85/kg cost</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA] flex sm:flex-col items-center justify-between sm:justify-center text-left sm:text-center">
                  <div>
                    <span className="text-xs text-[#8E9789] block">Embodied CO₂e</span>
                    <span className="text-[11px] text-[#8E9789] hidden sm:block">emissions prevented</span>
                  </div>
                  <div className="text-right sm:text-center">
                    <span className="text-base sm:text-lg font-mono font-bold text-[#191C1A] block">
                      {forecast.projectedCo2eAvoidedKg} kg
                    </span>
                    <span className="text-[10px] text-[#8E9789] sm:hidden">IPCC factor</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recipe Bill of Materials (BOM) */}
          <div className="bg-white border border-[#D8E4D2] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF0E9]">
              <div>
                <h3 className="text-sm font-semibold text-[#191C1A]">Kitchen Ingredient Dispatch (BOM)</h3>
                <p className="text-xs text-[#8E9789] mt-0.5">
                  Recommended raw ingredient allocation for {forecast.expectedDiners} projected diners.
                </p>
              </div>
              <span className="text-xs text-[#8E9789] flex items-center gap-1 shrink-0">
                <Package className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Standard Portions</span>
              </span>
            </div>

            {/* Mobile View: Readable Vertical List with Names on Left and Quantities on Right */}
            <div className="sm:hidden divide-y divide-[#EDF0E9] border border-[#E0E8DA] rounded-xl overflow-hidden bg-[#FAF8F5]">
              {[
                { name: 'Basmati Rice', qty: `${forecast.bom.grainRiceKg} kg`, norm: '120g / diner' },
                { name: 'Dal & Pulses', qty: `${forecast.bom.dalPulsesKg} kg`, norm: '50g / diner' },
                { name: 'Wheat Atta (Roti)', qty: `${forecast.bom.wheatFlourAttaKg} kg`, norm: '90g / diner' },
                { name: 'Fresh Vegetables', qty: `${forecast.bom.freshVegetablesKg} kg`, norm: '140g / diner' },
                { name: 'Cooking Oil', qty: `${forecast.bom.cookingOilLiters} L`, norm: '20ml / diner' },
              ].map((item) => (
                <div key={item.name} className="px-3.5 py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-[#191C1A] block truncate">{item.name}</span>
                    <span className="text-[11px] text-[#8E9789]">{item.norm}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-mono font-bold text-[#191C1A]">{item.qty}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tablet & Desktop View: 5-column grid */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA]">
                <span className="text-xs text-[#8E9789] block">Basmati Rice</span>
                <span className="text-base font-mono font-bold text-[#191C1A] mt-0.5 block">
                  {forecast.bom.grainRiceKg} kg
                </span>
                <span className="text-[11px] text-[#8E9789]">120g / head</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA]">
                <span className="text-xs text-[#8E9789] block">Dal & Pulses</span>
                <span className="text-base font-mono font-bold text-[#191C1A] mt-0.5 block">
                  {forecast.bom.dalPulsesKg} kg
                </span>
                <span className="text-[11px] text-[#8E9789]">50g / head</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA]">
                <span className="text-xs text-[#8E9789] block">Wheat Atta (Roti)</span>
                <span className="text-base font-mono font-bold text-[#191C1A] mt-0.5 block">
                  {forecast.bom.wheatFlourAttaKg} kg
                </span>
                <span className="text-[11px] text-[#8E9789]">90g / head</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA]">
                <span className="text-xs text-[#8E9789] block">Fresh Vegetables</span>
                <span className="text-base font-mono font-bold text-[#191C1A] mt-0.5 block">
                  {forecast.bom.freshVegetablesKg} kg
                </span>
                <span className="text-[11px] text-[#8E9789]">140g / head</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA]">
                <span className="text-xs text-[#8E9789] block">Cooking Oil</span>
                <span className="text-base font-mono font-bold text-[#191C1A] mt-0.5 block">
                  {forecast.bom.cookingOilLiters} L
                </span>
                <span className="text-[11px] text-[#8E9789]">20ml / head</span>
              </div>
            </div>
          </div>

          {/* ── Section D: Forecast History & Actual Outcome Logging ───────── */}
          {showHistory && (
            <div className="bg-white border border-[#D8E4D2] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EDF0E9]">
                <div>
                  <h3 className="text-sm font-semibold text-[#191C1A]">Recent Forecast Records</h3>
                  <p className="text-xs text-[#8E9789] mt-0.5">
                    Track predicted demand and log actual observed turnouts for audit accountability.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchHistory}
                  className="text-xs text-[#486340] hover:text-[#1B3826] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>

              {historyItems.length === 0 ? (
                <p className="text-xs text-[#8E9789] py-4 text-center">
                  No forecast records available in this session.
                </p>
              ) : (
                <div className="divide-y divide-[#EDF0E9]">
                  {historyItems.slice(0, 5).map((item) => {
                    const hasActual = typeof item.actualDiners === 'number';
                    const diff = hasActual ? (item.actualDiners! - item.expectedDiners) : 0;
                    return (
                      <div key={item.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#191C1A]">
                              {item.parameters.day} ({item.parameters.weather})
                            </span>
                            {item.parameters.isExam && (
                              <span className="text-[10px] bg-[#EAF2E7] text-[#1B3826] px-1.5 py-0.2 rounded font-semibold">
                                Exam
                              </span>
                            )}
                            <span className="text-[11px] text-[#8E9789]">
                              at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[#6B7B68]">
                            Predicted: <strong>{item.expectedDiners} diners</strong> · Recommended: <strong>{item.recommendedCookKg} kg</strong>
                          </p>
                          {hasActual && (
                            <p className="text-[#166534] font-medium flex items-center gap-1 pt-0.5">
                              <Check className="w-3.5 h-3.5" />
                              <span>Observed Turnout: <strong>{item.actualDiners} diners</strong> ({diff >= 0 ? `+${diff}` : diff} variance)</span>
                            </p>
                          )}
                        </div>

                        {/* Log Actual Turnout form */}
                        {!hasActual && (
                          <div className="flex items-center gap-2 self-start md:self-auto">
                            <input
                              type="number"
                              min="0"
                              placeholder="Actual diners"
                              value={actualInputMap[item.id] || ''}
                              onChange={(e) => setActualInputMap({ ...actualInputMap, [item.id]: e.target.value })}
                              className="w-28 px-2.5 py-1.5 text-xs rounded-lg border border-[#D8E4D2] bg-[#FAF8F5] focus:outline-none focus:border-[#1B3826]"
                            />
                            <button
                              type="button"
                              onClick={() => handleRecordActual(item.id)}
                              disabled={loggingId === item.id || !actualInputMap[item.id]}
                              className="px-2.5 py-1.5 rounded-lg bg-[#1B3826] hover:bg-[#254D36] disabled:opacity-50 text-white text-xs font-medium cursor-pointer"
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

          {/* ── Section E: Collapsible Methodology & Assumptions Accordion ──────── */}
          <div className="bg-white border border-[#D8E4D2] rounded-2xl overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setShowMethodology(v => !v)}
              className="w-full px-4 sm:px-5 py-3.5 min-h-[44px] flex items-center justify-between text-left hover:bg-[#F9F7F2] transition cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#1B3826]"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-[#486340]">
                <Info className="w-4 h-4 shrink-0" />
                <span>How is this estimated? (Methodology, Serving Standards & Buffer Policy)</span>
              </div>
              {showMethodology ? <ChevronUp className="w-4 h-4 text-[#8E9789] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#8E9789] shrink-0" />}
            </button>

            {showMethodology && (
              <div className="px-4 sm:px-5 pb-5 pt-1 space-y-4 border-t border-[#EDF0E9] text-xs text-[#6B7B68] leading-relaxed">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA] space-y-1.5">
                    <p className="font-semibold text-[#191C1A]">Attendance Estimation Heuristics</p>
                    <p>• <strong>Turnout Multiplier:</strong> Weekday base attendance is 84–92%, while weekend attendance drops to 62–70% due to local departures.</p>
                    <p>• <strong>Weather Signal:</strong> Monsoon precipitation retains ~6% more students on-campus.</p>
                    <p>• <strong>Academic Calendar:</strong> Examination schedules concentrate ~8% additional students in hostel dining.</p>
                    <p>• <strong>Bounds:</strong> Turnout factor is clamped between 40% and 100% to prevent impossible projections.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA] space-y-1.5">
                    <p className="font-semibold text-[#191C1A]">Kitchen Safety Buffer & Portion Norms</p>
                    <p>• <strong>Portion Standard:</strong> 360g base cooked thali per attendee (120g rice, 50g dal, 90g roti, 140g vegetables, 20ml oil).</p>
                    <p>• <strong>5% Safety Buffer:</strong> Added over point estimate to prevent kitchen run-outs during demand variance.</p>
                    <p>• <strong>Food Cost:</strong> Evaluated at ₹85.00/kg subsidized institutional preparation cost.</p>
                    <p>• <strong>Embodied Carbon:</strong> Evaluated at 2.5 kg CO₂e / kg food waste (IPCC AR6).</p>
                  </div>
                </div>

                <p className="text-[11px] text-[#8E9789]">
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
