import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Zap, Utensils, ShieldCheck, Clock, Users, ArrowUpRight, Medal } from 'lucide-react';

interface DepartmentStanding {
  rank: number;
  department: string;
  code: string;
  greenCredits: number;
  kwhSaved: number;
  foodSavedKg: number;
  streakDays: number;
  activeWarriors: number;
}

interface AuditLog {
  id: string;
  timestamp: string;
  blockId: string;
  blockName: string;
  action: string;
  resolvedBy: string;
  department: string;
  kwhPrevented: number;
  costSavedInr: number;
  creditsAwarded: number;
}

export const Leaderboard: React.FC = () => {
  const [standings, setStandings] = useState<DepartmentStanding[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const fetchData = async () => {
    try {
      const [resStandings, resLogs] = await Promise.all([
        fetch('/api/leaderboard'),
        fetch('/api/audit-logs'),
      ]);
      const dataStandings = await resStandings.json();
      const dataLogs = await resLogs.json();
      setStandings(dataStandings.standings || []);
      setAuditLogs(dataLogs.logs || []);
    } catch (err) {
      console.error('Failed to load leaderboard data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-purple-100 text-purple-800">
              <Trophy className="w-4 h-4 text-purple-700" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Inter-Department Sustainability Cup</h3>
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-mono font-bold rounded-full border border-purple-300">
              WEEK 6 ACTIVE SEASON
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time campus decarbonization rankings earned through remote ghost load shutdowns and zero-waste tray scans
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center space-x-2 shadow-xs font-bold">
            <Medal className="w-4 h-4 text-amber-600" />
            <span>Prize: ₹25,000 Campus Green Innovation Grant</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* League Table (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h4 className="text-sm font-extrabold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>Department Standings</span>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Updated Live
            </span>
          </h4>

          <div className="space-y-3">
            {standings.map((dept) => {
              const isFirst = dept.rank === 1;
              const isSecond = dept.rank === 2;
              const isThird = dept.rank === 3;

              return (
                <div
                  key={dept.code}
                  className={`p-4 rounded-2xl border transition-all ${
                    isFirst
                      ? 'bg-gradient-to-r from-amber-50/80 to-yellow-50/40 border-amber-300 shadow-xs ring-1 ring-amber-300'
                      : isSecond
                      ? 'bg-slate-50/80 border-slate-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shadow-xs ${
                          isFirst
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : isSecond
                            ? 'bg-slate-300 text-slate-800'
                            : isThird
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        #{dept.rank}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h5 className="font-extrabold text-sm text-slate-900">{dept.department}</h5>
                          <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {dept.code}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1 flex items-center space-x-3">
                          <span className="flex items-center space-x-1 text-emerald-700 font-bold">
                            <Zap className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{dept.kwhSaved} kWh</span>
                          </span>
                          <span className="flex items-center space-x-1 text-amber-700 font-bold">
                            <Utensils className="w-3.5 h-3.5 text-amber-600" />
                            <span>{dept.foodSavedKg} kg</span>
                          </span>
                          <span className="flex items-center space-x-1 text-rose-600 font-bold">
                            <Flame className="w-3.5 h-3.5 text-rose-500" />
                            <span>{dept.streakDays}d Streak</span>
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold font-mono text-emerald-700 block">
                        {dept.greenCredits.toLocaleString()} pts
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold flex items-center justify-end space-x-1 mt-0.5">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>{dept.activeWarriors} Active</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verifiable Action Audit Ledger (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verifiable Green Audit Ledger</span>
              </h4>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                IMMUTABLE AUDIT
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">
              Transparent audit trail of every automated load cutoff, student intervention, and dining scan:
            </p>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 shadow-2xs"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-slate-900 line-clamp-1">{log.blockName}</span>
                    <span className="text-emerald-700 font-mono font-extrabold shrink-0 ml-2 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      +{log.creditsAwarded} pts
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug font-medium">{log.action}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono font-bold pt-1.5 border-t border-slate-200">
                    <span className="text-slate-700">{log.resolvedBy}</span>
                    <span className="text-emerald-700">Saved ₹{log.costSavedInr}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-400 font-medium flex justify-between items-center">
            <span>SVVV Decarbonization Registry</span>
            <span className="text-emerald-700 font-bold">Zero-Trust Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
