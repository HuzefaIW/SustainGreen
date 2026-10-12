import React, { useState, useEffect } from 'react';
import { 
  Utensils, CloudRain, Sun, Calendar, TrendingDown, 
  IndianRupee, Leaf, Droplets, CheckCircle, PackageCheck, AlertCircle,
  Sparkles, ChefHat
} from 'lucide-react';

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
      const res = await fetch(`/api/mess-forecast?day=${day}&weather=${weather}&isExam=${isExam}`);
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
      {/* Top Controller Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
                <ChefHat className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Predictive Mess Kitchen Engine</h3>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-mono font-bold rounded-full border border-blue-300">
                MULTIVARIATE DEMAND AI
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Automated kitchen prep optimization eliminating over-cooking using attendance decay and weather telemetry
            </p>
          </div>

          <div className="text-right bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Hostel Capacity</span>
            <span className="text-sm font-extrabold text-slate-900 font-mono">1,200 Registered Diners</span>
          </div>
        </div>

        {/* Dynamic Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          {/* Day of Week */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Day of the Week</span>
            </label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
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
            <label className="text-xs font-bold text-slate-800 block mb-1.5 flex items-center space-x-1.5">
              {weather === 'Sunny' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <CloudRain className="w-3.5 h-3.5 text-blue-600" />}
              <span>Weather Condition</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWeather('Sunny')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  weather === 'Sunny'
                    ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs ring-1 ring-amber-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                <span>Sunny</span>
              </button>
              <button
                type="button"
                onClick={() => setWeather('Rainy')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  weather === 'Rainy'
                    ? 'bg-blue-100 border-blue-300 text-blue-900 shadow-xs ring-1 ring-blue-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                <span>Rain (+6%)</span>
              </button>
            </div>
          </div>

          {/* Exam Period Toggle */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              Academic Exam Schedule
            </label>
            <button
              type="button"
              onClick={() => setIsExam(!isExam)}
              className={`w-full py-2 px-3.5 rounded-xl text-xs font-bold border transition flex items-center justify-between cursor-pointer ${
                isExam
                  ? 'bg-purple-100 border-purple-300 text-purple-900 ring-1 ring-purple-400 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Mid-Term Exam Period</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${isExam ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
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
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center justify-between pb-3 border-b border-slate-100">
              <span>Cooking Volume Calibration</span>
              <span className="text-xs text-blue-700 font-mono font-bold bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                AI Confidence: {forecast.confidenceIntervalPct}%
              </span>
            </h4>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Conventional Blind Prep */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Conventional Blind Cooking
                </span>
                <span className="text-3xl font-extrabold font-mono text-slate-800 block mb-2">
                  {forecast.conventionalCookKg} kg
                </span>
                <p className="text-slate-600 text-xs font-medium leading-relaxed">
                  Cooks assume 100% capacity regardless of weekend departures or weather.
                </p>
                <div className="mt-3.5 pt-2.5 border-t border-slate-200 text-rose-700 text-xs font-bold flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>Avg {forecast.savedFoodKg} kg food discarded daily</span>
                </div>
              </div>

              {/* EcoPulse Demand-Driven Prep */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-300 text-xs relative overflow-hidden shadow-xs">
                <div className="absolute top-3 right-3 px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-mono font-bold rounded-md">
                  RECOMMENDED
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                  EcoPulse AI Prep Volume
                </span>
                <span className="text-3xl font-extrabold font-mono text-emerald-900 block mb-2">
                  {forecast.optimizedCookKg} kg
                </span>
                <p className="text-emerald-950 text-xs font-medium leading-relaxed">
                  Calibrated for <strong className="text-emerald-900 font-bold">{forecast.expectedDiners} projected diners</strong> with dynamic safety stock.
                </p>
                <div className="mt-3.5 pt-2.5 border-t border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Prevents {forecast.savedFoodKg} kg kitchen overprep</span>
                </div>
              </div>
            </div>

            {/* Savings Hero Grid */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Food Waste Averted</span>
                <span className="text-xl font-extrabold font-mono text-amber-950 mt-1 block">
                  {forecast.savedFoodKg} kg
                </span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Budget Saved Today</span>
                <span className="text-xl font-extrabold font-mono text-emerald-950 mt-1 block">
                  ₹{forecast.costSavedInr.toLocaleString()}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">CO2e Prevented</span>
                <span className="text-xl font-extrabold font-mono text-blue-950 mt-1 block">
                  {forecast.co2eSavedKg} kg
                </span>
              </div>
            </div>
          </div>

          {/* Raw Ingredient BOM (Bill of Materials) (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                  <span>Kitchen Raw Ingredient BOM</span>
                </h4>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  DISPATCH PACK
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">
                Direct raw procurement dispatch for kitchen head chef based on {forecast.expectedDiners} diners:
              </p>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-800 font-bold">Grain Rice (Basmati / Sona Masoori)</span>
                  <span className="font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {forecast.bom.grainRiceKg} kg
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-800 font-bold">Dal & Lentil Pulses (Toor/Moong)</span>
                  <span className="font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {forecast.bom.dalPulsesKg} kg
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-800 font-bold">Whole Wheat Atta (Roti dough)</span>
                  <span className="font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {forecast.bom.wheatFlourAttaKg} kg
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-800 font-bold">Fresh Seasonal Vegetables</span>
                  <span className="font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {forecast.bom.freshVegetablesKg} kg
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-800 font-bold">Refined Cooking Oil</span>
                  <span className="font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {forecast.bom.cookingOilLiters} Liters
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-500 font-medium flex justify-between items-center">
              <span>Virtual Water Saved: {forecast.waterSavedLiters.toLocaleString()} L</span>
              <span className="text-emerald-700 font-bold">SVVV Mess Approved</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
