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
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#191C1A] leading-tight">
              Green Cup
            </h2>
            <p className="text-sm text-[#486340] mt-1">
              Compare departmental contributions to campus sustainability.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#8E9789] bg-[#F5F7F0] border border-[#E0E8DA] px-2.5 py-1.5 rounded-lg self-start sm:self-auto">
            <Trophy className="w-3.5 h-3.5 text-[#1B3826]" />
            <span>Campus sustainability standings</span>
          </div>
        </div>

        {/* Standings List */}
        <div className="bg-white border border-[#D8E4D2] rounded-2xl overflow-hidden shadow-2xs">
          <div className="px-5 py-3.5 border-b border-[#EDF0E9] flex items-center justify-between text-xs text-[#8E9789] font-medium">
            <span>Department & Block</span>
            <div className="flex items-center gap-6">
              <span className="hidden sm:inline">Energy Prevented</span>
              <span className="hidden sm:inline">Audits Logged</span>
              <span className="text-right">Sustainability Points</span>
            </div>
          </div>

          <div className="divide-y divide-[#EDF0E9]">
            {standings.map((dept) => {
              const isFirst = dept.rank === 1;

              return (
                <div
                  key={dept.code}
                  className={`px-5 py-3.5 flex items-center justify-between transition-colors ${
                    isFirst ? 'bg-[#F2F7F0]/60' : 'hover:bg-[#FAF8F5]'
                  }`}
                >
                  {/* Left: Rank + Department */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        isFirst
                          ? 'bg-[#1B3826] text-white shadow-2xs'
                          : 'bg-[#F0EBE0] text-[#486340]'
                      }`}
                    >
                      #{dept.rank}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#191C1A] truncate">
                          {dept.department}
                        </span>
                        {isFirst && (
                          <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-[#166534] bg-[#F0FDF4] border border-[#BBF7D0] px-2 py-0.5 rounded-full">
                            <Leaf className="w-3 h-3" />
                            Leading
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#8E9789] font-mono">{dept.code}</span>
                    </div>
                  </div>

                  {/* Right: Metrics */}
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="hidden sm:flex flex-col items-end text-right font-mono text-xs">
                      <span className="font-bold text-[#191C1A]">{dept.kwhSaved} kWh</span>
                      <span className="text-[11px] text-[#8E9789]">curbed</span>
                    </div>

                    <div className="hidden sm:flex flex-col items-end text-right font-mono text-xs">
                      <span className="font-bold text-[#191C1A]">{dept.auditsCompleted || 0}</span>
                      <span className="text-[11px] text-[#8E9789]">audits</span>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-base font-bold text-[#1B3826] block">
                        {dept.greenCredits.toLocaleString()} pts
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {loading && standings.length === 0 && (
            <div className="p-8 text-center text-xs text-[#8E9789]">
              <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-[#CADBC4]" />
              Loading department standings…
            </div>
          )}
        </div>
      </div>

      {/* ── Section B: Recent Actions (Activity Ledger) ──────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#191C1A] leading-tight">
              Recent Actions
            </h2>
            <p className="text-sm text-[#486340] mt-1">
              Logged energy leak resolutions and plate audits across campus.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#8E9789] bg-[#F5F7F0] border border-[#E0E8DA] px-2.5 py-1.5 rounded-lg self-start sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-[#486340]" />
            <span>In-memory session log</span>
          </div>
        </div>

        {/* Ledger List */}
        <div className="bg-white border border-[#D8E4D2] rounded-2xl overflow-hidden shadow-2xs">
          <div className="px-5 py-3 border-b border-[#EDF0E9] flex items-center justify-between text-xs text-[#8E9789]">
            <span>Click any record to inspect logged assumptions</span>
            <span>{auditLogs.length} total events</span>
          </div>

          <div className="divide-y divide-[#EDF0E9]">
            {auditLogs.map((log) => {
              const isSelected = selectedLogId === log.id;
              const isSessionEvent = !log.isSeeded;

              return (
                <div key={log.id} className="transition-colors">
                  <button
                    type="button"
                    onClick={() => setSelectedLogId(isSelected ? null : log.id)}
                    className={`w-full text-left px-5 py-3.5 flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-[#F2F7F0]' : 'hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        log.type === 'FOOD_AUDIT'
                          ? 'bg-[#EBF5FB] text-[#0284C7]'
                          : 'bg-[#FAF3E0] text-[#B45309]'
                      }`}>
                        {log.type === 'FOOD_AUDIT' ? (
                          <Utensils className="w-4 h-4" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[#191C1A] truncate">
                            {log.blockName}
                          </span>
                          {/* Seeded vs Session Tag */}
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium ${
                            isSessionEvent
                              ? 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]'
                              : 'bg-[#F5F7F0] text-[#8E9789] border border-[#E0E8DA]'
                          }`}>
                            {isSessionEvent ? 'Live Session' : 'Seeded'}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B7B68] truncate mt-0.5">
                          {log.action}
                        </p>
                      </div>
                    </div>

                    {/* Right: Credits & Toggle */}
                    <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                      <span className="font-bold text-[#1B3826]">
                        +{log.creditsAwarded} pts
                      </span>
                      {isSelected ? (
                        <ChevronUp className="w-4 h-4 text-[#8E9789]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#CADBC4]" />
                      )}
                    </div>
                  </button>

                  {/* Expandable Details Panel */}
                  {isSelected && (
                    <div className="px-5 py-3.5 bg-[#FAF8F5] border-t border-[#EDF0E9] text-xs text-[#6B7B68] space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px]">
                        <div>
                          <span className="text-[#8E9789] block">Department</span>
                          <span className="font-semibold text-[#191C1A]">{log.department}</span>
                        </div>
                        <div>
                          <span className="text-[#8E9789] block">Attributed To</span>
                          <span className="font-semibold text-[#191C1A]">{log.resolvedBy}</span>
                        </div>
                        <div>
                          <span className="text-[#8E9789] block">Timestamp</span>
                          <span className="font-semibold text-[#191C1A]">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#8E9789] block">Estimated Impact</span>
                          <span className="font-semibold text-[#166534]">
                            {log.kwhPrevented ? `${log.kwhPrevented} kWh prevented` : `₹${log.costSavedInr} value`}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#8E9789] pt-1 border-t border-[#E0E8DA]">
                        Action recorded in memory for this demonstration session. Points contributed to {log.department}.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {auditLogs.length === 0 && (
            <div className="p-8 text-center text-xs text-[#8E9789]">
              No logged actions yet. Resolve a simulated energy leak or run a plate audit to log events.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
