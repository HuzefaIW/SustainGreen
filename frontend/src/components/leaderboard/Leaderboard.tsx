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
      {/* Vercel Header Card */}
      <div className="bg-white border border-zinc-200/90 rounded-xl p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-zinc-900">Inter-Department Sustainability Cup</h3>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
              WEEK 6 ACTIVE SEASON
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Carbon mitigation standings earned through remote ghost load shutdowns and zero-waste tray audits
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-zinc-600 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg">
          <Medal className="w-3.5 h-3.5 text-zinc-400" />
          <span>Prize: ₹25,000 Campus Green Innovation Grant</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* League Table (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-zinc-200/90 rounded-xl p-5 shadow-subtle">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100">
            <h4 className="text-sm font-semibold text-zinc-900">Department Standings</h4>
            <span className="text-[10px] font-mono text-zinc-400">UPDATED LIVE</span>
          </div>

          <div className="space-y-2.5">
            {standings.map((dept) => {
              const isFirst = dept.rank === 1;

              return (
                <div
                  key={dept.code}
                  className={`p-3.5 rounded-xl border transition-all text-xs ${
                    isFirst
                      ? 'bg-zinc-50 border-zinc-900/40 shadow-xs'
                      : 'bg-white border-zinc-200/80 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          isFirst
                            ? 'bg-zinc-900 text-white'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        #{dept.rank}
                      </div>

                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h5 className="font-semibold text-zinc-900">{dept.department}</h5>
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 px-1 py-0.2 rounded">
                            {dept.code}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center space-x-3 font-mono">
                          <span className="flex items-center space-x-1">
                            <Zap className="w-3 h-3 text-zinc-400" />
                            <span>{dept.kwhSaved} kWh</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Utensils className="w-3 h-3 text-zinc-400" />
                            <span>{dept.foodSavedKg} kg food</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Flame className="w-3 h-3 text-rose-500" />
                            <span>{dept.streakDays}d streak</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-sm font-bold text-zinc-900 block">
                        {dept.greenCredits.toLocaleString()} pts
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {dept.activeWarriors} active
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verifiable Action Audit Ledger (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-zinc-200/90 rounded-xl p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-zinc-100">
              <h4 className="text-sm font-semibold text-zinc-900 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-zinc-400" />
                <span>Verifiable Action Audit Ledger</span>
              </h4>
              <span className="text-[10px] font-mono text-zinc-400">IMMUTABLE</span>
            </div>

            <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
              Real-time audit log of automated breaker cutoffs, interventions, and tray audits:
            </p>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/70 text-xs space-y-1"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-zinc-900 line-clamp-1">{log.blockName}</span>
                    <span className="text-zinc-900 font-mono font-bold shrink-0 ml-2 bg-white px-1.5 py-0.2 rounded border border-zinc-200 text-[11px]">
                      +{log.creditsAwarded} pts
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-snug">{log.action}</p>
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono pt-1 border-t border-zinc-200/60">
                    <span>{log.resolvedBy}</span>
                    <span>Prevented ₹{log.costSavedInr}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 mt-4 text-[11px] text-zinc-400 font-mono flex justify-between items-center">
            <span>SVVV Decarbonization Registry</span>
            <span>Zero-Trust Log</span>
          </div>
        </div>
      </div>
    </div>
  );
};
