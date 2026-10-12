import React from 'react';

// Member 1: Campus Digital Twin & Ghost Energy Leak Component
export const CampusMap = () => {
  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-emerald-400">Campus Digital Twin</h2>
          <p className="text-slate-400 text-sm">Real-time room occupancy vs power dissipation</p>
        </div>
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30">
          Telemetry Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Sample Room Card 1 (Ghost Leak Detected) */}
        <div className="p-4 rounded-lg bg-red-950/30 border border-red-500/50 hover:border-red-500 transition">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">CS Lab 2 (Block A)</h3>
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded font-medium">
              🚨 Ghost Leak
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-3">Schedule: Unoccupied | Running Load: 2,400W</p>
          <div className="text-xs text-red-300 mb-4 bg-red-900/30 p-2 rounded">
            AC & 12 PCs active with 0 students inside (₹19.2/hr waste)
          </div>
          <button className="w-full py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded transition shadow-md">
            Cut Off Idle Load & Claim 50 Credits
          </button>
        </div>

        {/* Sample Room Card 2 (Normal Usage) */}
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">Lecture Hall 101</h3>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded font-medium">
              Optimal
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-3">Schedule: Ongoing Class (64 Students) | 1,200W</p>
          <div className="text-xs text-slate-400 mb-4 bg-slate-800 p-2 rounded">
            All devices running within nominal green efficiency bounds.
          </div>
          <button className="w-full py-2 bg-slate-700 text-slate-300 text-xs font-semibold rounded cursor-not-allowed" disabled>
            Optimal Operation
          </button>
        </div>
      </div>
    </div>
  );
};
