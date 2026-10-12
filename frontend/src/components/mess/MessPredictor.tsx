import React, { useState, useEffect } from 'react';
import { 
  Utensils, CloudRain, Sun, Calendar, TrendingDown, 
  IndianRupee, Leaf, Flame, AlertCircle, CheckCircle2,
  Package, Info, RefreshCw, Users, ChevronDown, ChevronUp
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

interface BomBreakdown {
  grainRiceKg: number;
  dalPulsesKg: number;
  wheatFlourAttaKg: number;
  freshVegetablesKg: number;
  cookingOilLiters: number;
}

interface MessForecastData {
  day: string;
  weather: string;
  isExam: boolean;
  totalHostelStudents: number;
  expectedDiners: number;
  conventionalCookKg: number;
  optimizedCookKg: number;
  savedFoodKg: number;
  costSavedInr: number;
  co2eSavedKg: number;
  waterSavedLiters: number;
  bom: BomBreakdown;
}

export const MessPredictor: React.FC = () => {
  const [day, setDay] = useState<string>('Friday');
  const [weather, setWeather] = useState<string>('Sunny');
  const [isExam, setIsExam] = useState<boolean>(false);
  const [forecast, setForecast] = useState<MessForecastData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showMethodology, setShowMethodology] = useState<boolean>(false);

  const fetchForecast = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(API_ENDPOINTS.messForecast(`?day=${day}&weather=${weather}&isExam=${isExam}`));
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

  useEffect(() => {
    fetchForecast();
  }, [day, weather, isExam]);

  // Contextual Factor Narrative
  const getFactorExplanation = () => {
    const explanations: string[] = [];
    if (day === 'Friday' || day === 'Saturday' || day === 'Sunday') {
      explanations.push(`Weekend schedules typically reduce hostel presence by 25–35%`);
    } else {
      explanations.push(`Weekday attendance averages 85–92% of enrolled hostel students`);
    }

    if (weather === 'Rainy') {
      explanations.push(`Rainfall retains ~6% more students on campus for meals`);
    }

    if (isExam) {
      explanations.push(`Exam period increases hostel dining by ~8% as outside outings drop`);
    }

    return explanations.join('. ') + '.';
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
            Estimate meal demand and prepare closer to the number of students expected.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs text-[#8E9789] bg-[#F5F7F0] border border-[#E0E8DA] px-2.5 py-1.5 rounded-lg self-start sm:self-auto">
          <Users className="w-3.5 h-3.5 text-[#486340]" />
          <span>Hostel context: 1,200 enrolled diners</span>
        </div>
      </div>

      {/* ── Section B: Forecast Inputs ────────────────────────────────────── */}
      <div className="bg-white border border-[#D8E4D2] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-[#191C1A]">Forecast Parameters</h3>
          <p className="text-xs text-[#8E9789] mt-0.5">
            Adjust variables to update expected student turnout and meal quantities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
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
              <span>Mid-Term Exam Period</span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                isExam ? 'bg-white/20 text-white' : 'bg-[#EAF2E7] text-[#1B3826]'
              }`}>
                {isExam ? 'ACTIVE (+8%)' : 'OFF'}
              </span>
            </button>
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

      {/* ── Section C & D: Forecast Results & Recommendations ─────────────── */}
      {forecast && (
        <div className="space-y-6">

          {/* Expected Demand Banner */}
          <div className="bg-white border border-[#D8E4D2] rounded-2xl p-4 sm:p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <span className="text-xs text-[#8E9789] uppercase tracking-wider block">
                  Projected Diners
                </span>
                <p className="text-3xl font-mono font-bold text-[#191C1A] mt-0.5">
                  {forecast.expectedDiners}
                  <span className="text-sm font-normal text-[#8E9789] ml-2 block xs:inline">
                    students ({Math.round((forecast.expectedDiners / forecast.totalHostelStudents) * 100)}% of 1,200 enrolled)
                  </span>
                </p>
                <p className="text-xs text-[#6B7B68] mt-2 leading-relaxed">
                  {getFactorExplanation()}
                </p>
              </div>

              <div className="text-xs text-[#8E9789] bg-[#FAF8F5] border border-[#E0E8DA] p-3 rounded-xl max-w-xs shrink-0 self-start">
                <span className="font-semibold text-[#191C1A] block mb-0.5">Demand Model</span>
                <span>Calibrated from historical weekend decay rates and weather attendance adjustments.</span>
              </div>
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
                {forecast.savedFoodKg} kg Overproduction Avoided
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
                  Kitchen prepares for 100% capacity (1,200 diners × 380g standard portion), discarding excess when attendance dips.
                </p>
                <div className="mt-3 pt-2.5 border-t border-[#E0E8DA] text-xs text-[#B45309] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Estimated ~{forecast.savedFoodKg} kg discarded food if uncalibrated</span>
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
                  {forecast.optimizedCookKg} kg
                </p>
                <p className="text-xs text-[#15803D] mt-1.5 leading-relaxed">
                  Calibrated for {forecast.expectedDiners} projected diners with a 5% dynamic buffer to prevent shortages.
                </p>
                <div className="mt-3 pt-2.5 border-t border-[#BBF7D0] text-xs text-[#166534] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Reduces overproduction by {forecast.savedFoodKg} kg</span>
                </div>
              </div>
            </div>

            {/* Impact Strip */}
            <div className="pt-3 border-t border-[#EDF0E9] grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-center">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA] flex sm:flex-col items-center justify-between sm:justify-center text-left sm:text-center">
                <div>
                  <span className="text-xs text-[#8E9789] block">Food Waste Avoided</span>
                  <span className="text-[11px] text-[#8E9789] hidden sm:block">raw food saved</span>
                </div>
                <div className="text-right sm:text-center">
                  <span className="text-base sm:text-lg font-mono font-bold text-[#191C1A] block">
                    {forecast.savedFoodKg} kg
                  </span>
                  <span className="text-[10px] text-[#8E9789] sm:hidden">raw food saved</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA] flex sm:flex-col items-center justify-between sm:justify-center text-left sm:text-center">
                <div>
                  <span className="text-xs text-[#8E9789] block">Budget Impact</span>
                  <span className="text-[11px] text-[#8E9789] hidden sm:block">at ₹85/kg food cost</span>
                </div>
                <div className="text-right sm:text-center">
                  <span className="text-base sm:text-lg font-mono font-bold text-[#166534] block">
                    ₹{forecast.costSavedInr.toLocaleString()}
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
                    {forecast.co2eSavedKg} kg
                  </span>
                  <span className="text-[10px] text-[#8E9789] sm:hidden">emissions prevented</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recipe Bill of Materials (BOM) */}
          <div className="bg-white border border-[#D8E4D2] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF0E9]">
              <div>
                <h3 className="text-sm font-semibold text-[#191C1A]">Kitchen Ingredient Requirements</h3>
                <p className="text-xs text-[#8E9789] mt-0.5">
                  Raw ingredient dispatch breakdown for {forecast.expectedDiners} projected diners.
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

            <p className="text-[11px] text-[#8E9789] pt-1">
              Note: Quantities are rule-based estimates derived from standard institutional catering norms (380g cooked meal per diner).
            </p>
          </div>

          {/* ── Section F: Collapsible Methodology & Assumptions Accordion ──────── */}
          <div className="bg-white border border-[#D8E4D2] rounded-2xl overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setShowMethodology(v => !v)}
              className="w-full px-4 sm:px-5 py-3.5 min-h-[44px] flex items-center justify-between text-left hover:bg-[#F9F7F2] transition cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#1B3826]"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-[#486340]">
                <Info className="w-4 h-4 shrink-0" />
                <span>How is this predicted? (Methodology & Serving Standards)</span>
              </div>
              {showMethodology ? <ChevronUp className="w-4 h-4 text-[#8E9789] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#8E9789] shrink-0" />}
            </button>

            {showMethodology && (
              <div className="px-4 sm:px-5 pb-5 pt-1 space-y-4 border-t border-[#EDF0E9] text-xs text-[#6B7B68] leading-relaxed">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA] space-y-1.5">
                    <p className="font-semibold text-[#191C1A]">Demand Estimation Norms</p>
                    <p>• Baseline Capacity: 1,200 registered hostel students on central meal plans.</p>
                    <p>• Weekend Attendance Factor: Attendance drops to 62–70% on Friday–Sunday due to home visits.</p>
                    <p>• Weather Adjustment: Heavy rain adds ~6% retention as off-campus dining reduces.</p>
                    <p>• Exam Surge: Mid-term examination schedules concentrate ~8% additional students in campus dining.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA] space-y-1.5">
                    <p className="font-semibold text-[#191C1A]">Kitchen Safety Buffer & Calculations</p>
                    <p>• Standard Thali Serving: 380 grams total cooked food per attendee.</p>
                    <p>• Buffer Factor: A 5% dynamic buffer is added over projected diners to prevent kitchen shortages.</p>
                    <p>• Food Cost Benchmark: ₹85.00 per kilogram of raw ingredient dispatch.</p>
                    <p>• Emissions Factor: 2.5 kg CO₂e avoided per kilogram of overproduction prevented.</p>
                  </div>
                </div>

                <p className="text-[11px] text-[#8E9789]">
                  Disclaimer: Demand forecasts are simulated decision-support aids based on institutional dining decay curves. Kitchen supervisors should inspect batch tickets before dispatch.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
