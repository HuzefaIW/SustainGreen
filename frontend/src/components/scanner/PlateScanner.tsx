import React, { useState } from 'react';

// Member 2: Food Waste Scanner Card
export const PlateScanner = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSimulateScan = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResult({
        leftover: 28,
        grams: 112,
        co2: 0.28,
        inr: 22.4,
        credits: 20
      });
    }, 1200);
  };

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800">
      <h2 className="text-2xl font-bold text-amber-400 mb-1">AI Plate Waste Scanner</h2>
      <p className="text-slate-400 text-sm mb-4">Scan post-meal tray to calculate carbon impact & earn credits</p>

      <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-amber-400/50 transition cursor-pointer mb-4 bg-slate-800/30">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 mb-3 text-2xl">
          📸
        </div>
        <p className="text-sm font-medium text-slate-300">Click to capture tray photo via webcam or drop image</p>
        <p className="text-xs text-slate-500 mt-1">Supports mess lunch/dinner tray formats</p>
      </div>

      <button 
        onClick={handleSimulateScan}
        disabled={analyzing}
        className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg transition"
      >
        {analyzing ? 'Analyzing Plate with AI...' : 'Run Plate Audit'}
      </button>

      {result && (
        <div className="mt-4 p-4 rounded-lg bg-slate-800 border border-slate-700 animate-fadeIn">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-2 bg-slate-900 rounded">
              <span className="text-xs text-slate-400">Leftover Waste</span>
              <p className="text-lg font-bold text-amber-400">{result.leftover}% ({result.grams}g)</p>
            </div>
            <div className="p-2 bg-slate-900 rounded">
              <span className="text-xs text-slate-400">CO2 Equivalent</span>
              <p className="text-lg font-bold text-red-400">{result.co2} kg</p>
            </div>
            <div className="p-2 bg-slate-900 rounded">
              <span className="text-xs text-slate-400">Financial Loss</span>
              <p className="text-lg font-bold text-rose-400">₹{result.inr}</p>
            </div>
            <div className="p-2 bg-slate-900 rounded">
              <span className="text-xs text-slate-400">Green Credits</span>
              <p className="text-lg font-bold text-emerald-400">+{result.credits} pts</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
