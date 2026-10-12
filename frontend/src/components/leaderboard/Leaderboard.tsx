import React, { useState, useEffect } from 'react';
import { 
  Trophy, Zap, Utensils, ShieldCheck, Clock, 
  ChevronRight, ChevronDown, ChevronUp, AlertCircle, 
  CheckCircle2, RefreshCw, Leaf, Award
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

interface DepartmentStanding {
  rank: number;
  department: string;
  code: string;
  greenCredits: number;
  kwhSaved: number;
  auditsCompleted: number;
}

interface AuditLog {
  id: string;
  timestamp: string;
  blockId: string;
  blockName: string;
  action: string;
  resolvedBy: string;
  department: string;
  kwhPrevented?: number;
  foodSavedKg?: number;
  costSavedInr: number;
  creditsAwarded: number;
  isSeeded?: boolean;
  type?: 'ENERGY' | 'FOOD_AUDIT';
}

export const Leaderboard: React.FC = () => {
  const [standings, setStandings] = useState<DepartmentStanding[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [resStandings, resLogs] = await Promise.all([
        fetch(API_ENDPOINTS.leaderboard),
        fetch(API_ENDPOINTS.auditLogs),
      ]);
      if (!resStandings.ok || !resLogs.ok) throw new Error('API request failed');
      const dataStandings = await resStandings.json();
      const dataLogs = await resLogs.json();
      setStandings(dataStandings.standings || []);
      setAuditLogs(dataLogs.logs || []);
    } catch (err) {
      console.error('Failed to load leaderboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">

      {/* ── Section A: Department Standings (Green Cup) ──────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#14532D] leading-tight">
              Green Cup
            </h2>
            <p className="text-sm text-[#64748B] mt-1">
              Compare departmental contributions to campus sustainability.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#166534] bg-white border border-[#DCEBDD] px-3 py-1.5 rounded-xl self-start sm:self-auto shadow-2xs font-semibold">
            <Trophy className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Campus sustainability standings</span>
          </div>
        </div>

        {/* Standings List */}
        <div className="bg-white border border-[#DCEBDD] rounded-3xl overflow-hidden shadow-card">
          <div className="px-5 py-3.5 border-b border-[#DCEBDD] bg-[#F5FBF5]/60 flex items-center justify-between text-xs text-[#64748B] font-semibold uppercase tracking-wider">
            <div className="flex-1 min-w-0 pr-4">
              <span>Department & Block</span>
            </div>
            <div className="flex items-center shrink-0">
              <span className="hidden sm:inline-block w-28 sm:w-32 text-right whitespace-nowrap">Energy Avoided</span>
              <span className="hidden sm:inline-block w-24 sm:w-28 text-right whitespace-nowrap">Audits Logged</span>
              <span className="inline-block w-28 sm:w-32 text-right whitespace-nowrap">Green Credits</span>
            </div>
          </div>

          <div className="divide-y divide-[#DCEBDD]">
            {standings.map((dept) => {
              const isFirst = dept.rank === 1;

              return (
                <div
                  key={dept.code}
                  className={`px-5 py-4 flex items-center justify-between transition-colors ${
                    isFirst ? 'bg-[#E8F5E9]/40' : 'hover:bg-[#F5FBF5]'
                  }`}
                >
                  {/* Left: Rank + Department */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        isFirst
                          ? 'bg-[#166534] text-[#A3E635] border border-[#22C55E] shadow-2xs ring-2 ring-[#A3E635]/30'
                          : 'bg-[#F5FBF5] text-[#166534] border border-[#DCEBDD]'
                      }`}
                    >
                      #{dept.rank}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm sm:text-base text-[#1F2937] leading-snug break-words">
                          {dept.department}
                        </span>
                        {isFirst && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#166534] bg-[#E8F5E9] border border-[#22C55E]/40 px-2.5 py-0.5 rounded-full shrink-0 shadow-2xs">
                            <Leaf className="w-3 h-3 text-[#22C55E]" />
                            <span className="text-[#14532D]">Leading Rank</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[#64748B] font-mono">
                        <span>{dept.code}</span>
                        <span className="sm:hidden text-[#166534] font-sans font-medium">
                          · {dept.kwhSaved} kWh avoided
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Metrics */}
                  <div className="flex items-center shrink-0">
                    <div className="hidden sm:block w-28 sm:w-32 text-right font-mono text-xs">
                      <span className="font-bold text-[#1F2937] block">{dept.kwhSaved} kWh</span>
                      <span className="text-[11px] text-[#64748B] block">prevented</span>
                    </div>

                    <div className="hidden sm:block w-24 sm:w-28 text-right font-mono text-xs">
                      <span className="font-bold text-[#1F2937] block">{dept.auditsCompleted || 0}</span>
                      <span className="text-[11px] text-[#64748B] block">plate audits</span>
                    </div>

                    <div className="w-28 sm:w-32 text-right font-mono">
                      <span className={`text-sm sm:text-base font-bold block whitespace-nowrap ${
                        isFirst ? 'text-[#166534]' : 'text-[#1F2937]'
                      }`}>
                        {dept.greenCredits.toLocaleString()} pts
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {loading && standings.length === 0 && (
            <div className="p-10 text-center text-xs text-[#64748B]">
              <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-[#22C55E]" />
              Loading department standings…
            </div>
          )}
        </div>
      </div>

      {/* ── Section B: Recent Actions (Activity Ledger) ──────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#14532D] leading-tight">
              Recent Actions
            </h2>
            <p className="text-sm text-[#64748B] mt-1">
              Logged energy leak resolutions and plate audits across campus.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#166534] bg-white border border-[#DCEBDD] px-3 py-1.5 rounded-xl self-start sm:self-auto shadow-2xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Tamper-evident session log</span>
          </div>
        </div>

        {/* Ledger List */}
        <div className="bg-white border border-[#DCEBDD] rounded-3xl overflow-hidden shadow-card">
          <div className="px-5 py-3.5 border-b border-[#DCEBDD] bg-[#F5FBF5]/60 flex items-center justify-between text-xs text-[#64748B] font-medium">
            <span>Tap any record to inspect logged details</span>
            <span className="font-mono">{auditLogs.length} events</span>
          </div>

          <div className="divide-y divide-[#DCEBDD]">
            {auditLogs.map((log) => {
              const isSelected = selectedLogId === log.id;
              const isSessionEvent = !log.isSeeded;

              return (
                <div key={log.id} className="transition-colors">
                  <button
                    type="button"
                    onClick={() => setSelectedLogId(isSelected ? null : log.id)}
                    className={`w-full text-left px-5 py-4 flex items-start sm:items-center justify-between gap-3 transition-colors cursor-pointer touch-manipulation min-h-[50px] focus:outline-none focus:ring-2 focus:ring-[#22C55E] ${
                      isSelected ? 'bg-[#E8F5E9]/50' : 'hover:bg-[#F5FBF5]'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-2xs ${
                        log.type === 'FOOD_AUDIT'
                          ? 'bg-[#E8F5E9] text-[#166534] border border-[#DCEBDD]'
                          : 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
                      }`}>
                        {log.type === 'FOOD_AUDIT' ? (
                          <Utensils className="w-4 h-4 text-[#22C55E]" />
                        ) : (
                          <Zap className="w-4 h-4 text-[#D97706]" />
                        )}
                      </div>

                      <div className="min-w-0">
                        {/* Context + Seeded Tag */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-xs sm:text-sm text-[#1F2937]">
                            {log.blockName}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                            isSessionEvent
                              ? 'bg-[#E8F5E9] text-[#166534] border border-[#22C55E]/40'
                              : 'bg-[#F5FBF5] text-[#64748B] border border-[#DCEBDD]'
                          }`}>
                            {isSessionEvent ? 'Live Session' : 'Seeded'}
                          </span>
                        </div>

                        {/* Action description */}
                        <p className="text-xs text-[#64748B] leading-tight mt-0.5">
                          {log.action}
                        </p>

                        {/* Mobile attribution & impact subtitle */}
                        <div className="sm:hidden flex items-center gap-2 mt-1 text-[11px] text-[#64748B]">
                          <span className="truncate">{log.department}</span>
                          <span>·</span>
                          <span className="text-[#166534] font-semibold font-mono shrink-0">
                            {log.kwhPrevented ? `${log.kwhPrevented} kWh curbed` : `₹${log.costSavedInr}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Credits & Toggle */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0 font-mono text-xs pt-0.5 sm:pt-0">
                      <span className="font-bold text-[#166534] whitespace-nowrap text-sm">
                        +{log.creditsAwarded} pts
                      </span>
                      {isSelected ? (
                        <ChevronUp className="w-4 h-4 text-[#166534]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#64748B]" />
                      )}
                    </div>
                  </button>

                  {/* Expandable Details Panel */}
                  {isSelected && (
                    <div className="px-5 py-4 bg-[#F5FBF5] border-t border-[#DCEBDD] text-xs text-[#64748B] space-y-2.5">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px]">
                        <div>
                          <span className="text-[#64748B] block">Department</span>
                          <span className="font-semibold text-[#1F2937] break-words">{log.department}</span>
                        </div>
                        <div>
                          <span className="text-[#64748B] block">Attributed To</span>
                          <span className="font-semibold text-[#1F2937] break-words">{log.resolvedBy}</span>
                        </div>
                        <div>
                          <span className="text-[#64748B] block">Timestamp</span>
                          <span className="font-semibold text-[#1F2937]">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#64748B] block">Estimated Impact</span>
                          <span className="font-semibold text-[#166534]">
                            {log.kwhPrevented ? `${log.kwhPrevented} kWh prevented` : `₹${log.costSavedInr} value`}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#64748B] pt-2 border-t border-[#DCEBDD]">
                        Action recorded in memory for this demonstration session. Points contributed to {log.department}.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {auditLogs.length === 0 && (
            <div className="p-10 text-center text-xs text-[#64748B]">
              No logged actions yet. Resolve a simulated energy leak or run a plate audit to log events.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
