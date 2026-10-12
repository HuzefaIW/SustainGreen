import React, { useState, useEffect } from 'react';
import { 
  Utensils, CloudRain, Sun, Calendar, TrendingDown, 
  IndianRupee, Leaf, Flame, AlertCircle, CheckCircle2,
  Package, Info, RefreshCw, Users
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
      <div className="bg-white border border-[#D8E4D2] rounded-2xl p-5 shadow-2xs space-y-4">
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
              className="w-full bg-[#FAF8F5] border border-[#D8E4D2] rounded-xl px-3 py-2 text-xs text-[#191C1A] font-medium focus:outline-none focus:border-[#1B3826] transition cursor-pointer"
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
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition flex items-center justify-center gap-1.5 cursor-pointer ${
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
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition flex items-center justify-center gap-1.5 cursor-pointer ${
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
              className={`w-full py-2 px-3 rounded-xl text-xs font-medium border transition flex items-center justify-between cursor-pointer ${
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
          <div className="bg-white border border-[#D8E4D2] rounded-2xl p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-[#8E9789] uppercase tracking-wider block">
                  Projected Diners
                </span>
                <p className="text-3xl font-mono font-bold text-[#191C1A] mt-0.5">
                  {forecast.expectedDiners}
                  <span className="text-sm font-normal text-[#8E9789] ml-2">
                    students ({Math.round((forecast.expectedDiners / forecast.totalHostelStudents) * 100)}% of 1,200)
                  </span>
                </p>
                <p className="text-xs text-[#6B7B68] mt-2 leading-relaxed">
                  {getFactorExplanation()}
                </p>
              </div>

              <div className="text-xs text-[#8E9789] bg-[#FAF8F5] border border-[#E0E8DA] p-3 rounded-xl max-w-xs shrink-0">
                <span className="font-semibold text-[#191C1A] block mb-0.5">Rule-Based Estimation</span>
                <span>Calibrated from historical weekend decay rates and weather attendance adjustments.</span>
              </div>
            </div>
          </div>

          {/* Preparation Recommendation Comparison */}
          <div className="bg-white border border-[#D8E4D2] rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF0E9]">
              <div>
                <h3 className="text-sm font-semibold text-[#191C1A]">Kitchen Preparation Calibration</h3>
                <p className="text-xs text-[#8E9789] mt-0.5">
                  Comparing blind full-capacity preparation against demand-matched recommendation.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#166534] bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-1 rounded-lg">
                {forecast.savedFoodKg} kg Overproduction Avoided
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="pt-3 border-t border-[#EDF0E9] grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA]">
                <span className="text-xs text-[#8E9789] block">Food Waste Avoided</span>
                <span className="text-lg font-mono font-bold text-[#191C1A] mt-0.5 block">
                  {forecast.savedFoodKg} kg
                </span>
                <span className="text-[11px] text-[#8E9789]">raw food saved</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA]">
                <span className="text-xs text-[#8E9789] block">Budget Impact</span>
                <span className="text-lg font-mono font-bold text-[#166534] mt-0.5 block">
                  ₹{forecast.costSavedInr.toLocaleString()}
                </span>
                <span className="text-[11px] text-[#8E9789]">at ₹85/kg food cost</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA]">
                <span className="text-xs text-[#8E9789] block">Embodied CO₂e</span>
                <span className="text-lg font-mono font-bold text-[#191C1A] mt-0.5 block">
                  {forecast.co2eSavedKg} kg
                </span>
                <span className="text-[11px] text-[#8E9789]">emissions prevented</span>
              </div>
            </div>
          </div>

          {/* Recipe Bill of Materials (BOM) */}
          <div className="bg-white border border-[#D8E4D2] rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF0E9]">
              <div>
                <h3 className="text-sm font-semibold text-[#191C1A]">Kitchen Ingredient Requirements</h3>
                <p className="text-xs text-[#8E9789] mt-0.5">
                  Raw ingredient dispatch breakdown for {forecast.expectedDiners} projected diners.
                </p>
              </div>
              <span className="text-xs text-[#8E9789] flex items-center gap-1">
                <Package className="w-3.5 h-3.5" />
                Standard Portions
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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

            <p className="text-[11px] text-[#8E9789] pt-2">
              Note: Quantities are rule-based estimates derived from standard institutional catering norms (380g cooked meal per diner).
            </p>
          </div>

        </div>
      )}

    </div>
  );
};
