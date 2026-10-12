import React, { useState, useEffect } from 'react';
import { 
  Utensils, CloudRain, Sun, Calendar, TrendingDown, 
  IndianRupee, Leaf, Droplets, CheckCircle, PackageCheck, AlertCircle,
  Sparkles, ChefHat
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
  confidenceIntervalPct: number;
  bom: BomBreakdown;
}

export const MessPredictor: React.FC = () => {
  const [day, setDay] = useState<string>('Friday');
  const [weather, setWeather] = useState<string>('Sunny');
  const [isExam, setIsExam] = useState<boolean>(false);
  const [forecast, setForecast] = useState<MessForecastData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.messForecast(`?day=${day}&weather=${weather}&isExam=${isExam}`));
      const data: MessForecastData = await res.json();
      setForecast(data);
    } catch (err) {
      console.error('Failed to load mess forecast:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [day, weather, isExam]);

  return (
    <div className="space-y-6">
      {/* Vercel Header Card */}
      <div className="bg-white border border-zinc-200/90 rounded-xl p-5 shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-zinc-900">Predictive Mess Kitchen Engine</h3>
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                DEMAND MULTIVARIATE REGRESSION
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Automated kitchen prep quantity optimization using attendance decay and weather telemetry
            </p>
          </div>

          <div className="text-right text-xs font-mono">
            <span className="text-zinc-400 block text-[10px]">HOSTEL POPULATION</span>
            <span className="font-semibold text-zinc-800">1,200 Registered Diners</span>
          </div>
        </div>

        {/* Minimal Controls Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-100">
          {/* Day of Week */}
          <div>
            <label className="text-xs font-medium text-zinc-700 block mb-1.5 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Day of the Week</span>
            </label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-800 font-medium focus:outline-none focus:border-zinc-400 transition cursor-pointer"
            >
              <option value="Monday">Monday (92% Turnout)</option>
              <option value="Tuesday">Tuesday (90% Turnout)</option>
              <option value="Wednesday">Wednesday (88% Turnout)</option>
              <option value="Thursday">Thursday (84% Turnout)</option>
              <option value="Friday">Friday (70% - Weekend Outing)</option>
              <option value="Saturday">Saturday (62% Turnout)</option>
              <option value="Sunday">Sunday (68% Turnout)</option>
            </select>
          </div>

          {/* Weather Simulation */}
          <div>
            <label className="text-xs font-medium text-zinc-700 block mb-1.5 flex items-center space-x-1.5">
              {weather === 'Sunny' ? <Sun className="w-3.5 h-3.5 text-zinc-400" /> : <CloudRain className="w-3.5 h-3.5 text-zinc-400" />}
              <span>Weather Condition</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWeather('Sunny')}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  weather === 'Sunny'
                    ? 'bg-zinc-900 border-zinc-900 text-white shadow-2xs'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Sunny</span>
              </button>
              <button
                type="button"
                onClick={() => setWeather('Rainy')}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  weather === 'Rainy'
                    ? 'bg-zinc-900 border-zinc-900 text-white shadow-2xs'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <CloudRain className="w-3 h-3" />
                <span>Rain (+6%)</span>
              </button>
            </div>
          </div>

          {/* Exam Period Toggle */}
          <div>
            <label className="text-xs font-medium text-zinc-700 block mb-1.5">
              Academic Exam Schedule
            </label>
            <button
              type="button"
              onClick={() => setIsExam(!isExam)}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium border transition flex items-center justify-between cursor-pointer ${
                isExam
                  ? 'bg-zinc-900 border-zinc-900 text-white shadow-2xs'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <span>Mid-Term Exam Period</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${isExam ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-zinc-600'}`}>
                {isExam ? 'ACTIVE (+8%)' : 'OFF'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Results Grid */}
      {forecast && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Comparison Cards (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-zinc-200/90 rounded-xl p-5 shadow-subtle space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h4 className="text-sm font-semibold text-zinc-900">Cooking Volume Calibration</h4>
              <span className="text-[10px] font-mono text-zinc-500">
                Confidence Interval: {forecast.confidenceIntervalPct}%
              </span>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Conventional Blind Prep */}
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                  Conventional Blind Cooking
                </span>
                <span className="text-2xl font-bold font-mono text-zinc-800 block mb-2">
                  {forecast.conventionalCookKg} kg
                </span>
                <p className="text-zinc-500 text-[11px] leading-relaxed">
                  Cooks assume 100% capacity regardless of weekend departures or exam trends.
                </p>
                <div className="mt-3 pt-2 border-t border-zinc-200 text-rose-600 text-[11px] font-medium flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Avg {forecast.savedFoodKg} kg food discarded</span>
                </div>
              </div>

              {/* EcoPulse Demand-Driven Prep */}
              <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 text-xs relative">
                <div className="absolute top-2.5 right-2.5 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-medium rounded">
                  RECOMMENDED
                </div>
                <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-wider block mb-1">
                  EcoPulse AI Prep Volume
                </span>
                <span className="text-2xl font-bold font-mono text-emerald-700 block mb-2">
                  {forecast.optimizedCookKg} kg
                </span>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  Calibrated for <strong className="text-zinc-900">{forecast.expectedDiners} projected diners</strong> with dynamic safety buffer.
                </p>
                <div className="mt-3 pt-2 border-t border-emerald-200/80 text-emerald-700 text-[11px] font-medium flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Prevents {forecast.savedFoodKg} kg overprep</span>
                </div>
              </div>
            </div>

            {/* Savings Hero Grid */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-zinc-100">
              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/60 text-center">
                <span className="text-[10px] text-zinc-400 font-mono block">FOOD SAVED</span>
                <span className="text-base font-bold font-mono text-zinc-900 mt-0.5 block">
                  {forecast.savedFoodKg} kg
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/60 text-center">
                <span className="text-[10px] text-zinc-400 font-mono block">BUDGET SAVED</span>
                <span className="text-base font-bold font-mono text-zinc-900 mt-0.5 block">
                  ₹{forecast.costSavedInr.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/60 text-center">
                <span className="text-[10px] text-zinc-400 font-mono block">CO2e PREVENTED</span>
                <span className="text-base font-bold font-mono text-zinc-900 mt-0.5 block">
                  {forecast.co2eSavedKg} kg
                </span>
              </div>
            </div>
          </div>

          {/* Raw Ingredient BOM (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-zinc-200/90 rounded-xl p-5 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-zinc-100">
                <h4 className="text-sm font-semibold text-zinc-900 flex items-center space-x-2">
                  <PackageCheck className="w-4 h-4 text-zinc-400" />
                  <span>Kitchen Raw Ingredient BOM</span>
                </h4>
                <span className="text-[10px] font-mono text-zinc-400">DISPATCH PACK</span>
              </div>

              <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
                Procurement dispatch for head chef based on {forecast.expectedDiners} diners:
              </p>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/70 flex items-center justify-between">
                  <span className="text-zinc-700">Grain Rice (Basmati)</span>
                  <span className="font-bold text-zinc-900">{forecast.bom.grainRiceKg} kg</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/70 flex items-center justify-between">
                  <span className="text-zinc-700">Dal & Lentil Pulses</span>
                  <span className="font-bold text-zinc-900">{forecast.bom.dalPulsesKg} kg</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/70 flex items-center justify-between">
                  <span className="text-zinc-700">Wheat Atta (Roti)</span>
                  <span className="font-bold text-zinc-900">{forecast.bom.wheatFlourAttaKg} kg</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/70 flex items-center justify-between">
                  <span className="text-zinc-700">Seasonal Vegetables</span>
                  <span className="font-bold text-zinc-900">{forecast.bom.freshVegetablesKg} kg</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/70 flex items-center justify-between">
                  <span className="text-zinc-700">Refined Cooking Oil</span>
                  <span className="font-bold text-zinc-900">{forecast.bom.cookingOilLiters} L</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 mt-4 text-[11px] text-zinc-400 font-mono flex justify-between items-center">
              <span>Virtual Water: {forecast.waterSavedLiters.toLocaleString()} L</span>
              <span>SVVV Mess Approved</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
