import React from 'react';

// Member 2: Inter-Department Green Leaderboard
export const Leaderboard = () => {
  const standings = [
    { rank: 1, name: "Computer Science & Engg", credits: 4250, kwhSaved: 340, streak: 12 },
    { rank: 2, name: "Mechanical Engineering", credits: 3890, kwhSaved: 295, streak: 8 },
    { rank: 3, name: "Civil Engineering", credits: 3120, kwhSaved: 210, streak: 5 },
    { rank: 4, name: "Electronics & Comm (ECE)", credits: 2840, kwhSaved: 180, streak: 4 },
  ];

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-sky-400">Department Sustainability Cup</h2>
          <p className="text-slate-400 text-sm">Rankings based on waste reduction & energy cutoff actions</p>
        </div>
        <span className="text-xs bg-sky-500/20 text-sky-300 px-3 py-1 rounded-full border border-sky-500/30">
          Week 6 Standings
        </span>
      </div>

      <div className="space-y-3">
        {standings.map((dept) => (
          <div 
            key={dept.rank}
            className={`p-3 rounded-lg flex items-center justify-between border ${
              dept.rank === 1 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/40 border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                dept.rank === 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-700 text-slate-300'
              }`}>
                #{dept.rank}
              </span>
              <div>
                <p className="font-semibold text-sm">{dept.name}</p>
                <p className="text-xs text-slate-400">{dept.kwhSaved} kWh Energy Conserved • 🔥 {dept.streak}d streak</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-emerald-400">{dept.credits.toLocaleString()} pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
