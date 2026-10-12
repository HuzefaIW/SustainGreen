import React, { useState } from 'react';
import {
  Zap, AlertTriangle, CheckCircle2, RefreshCw,
  ChevronRight, X, SlidersHorizontal, Activity,
  Building2, TrendingDown, Leaf
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';

// ─── Shared Types (re-exported so App.tsx can import CampusBlock) ─────────────
export interface ApplianceLoad {
  id: string;
  name: string;
  type: string;
  ratedWatts: number;
  status: string;
}

export interface CampusBlock {
  id: string;
  code: string;
  name: string;
  building?: string;
  floor?: number;
  roomNumber?: string;
  department: string;
  category: string;
  capacity: number;
  wiFiClientCount: number;
  scheduledClass: string | null;
  isOccupied: boolean;
  occupancyConfidence: number;
  voltageRms: number;
  activePowerWatts: number;
  baselineIdleWatts: number;
  hasGhostLeak: boolean;
  ghostLeakSeverity: number;
  leakDescription: string | null;
  wastedCostPerHourInr: number;
  wastedCo2KgPerHour: number;
  appliances: ApplianceLoad[];
}

interface CampusMapProps {
  blocks: CampusBlock[];
  onResolveLeak: (blockId: string) => void;
  onTriggerDemoLeak: (blockId: string) => void;
  history: Array<{ hour: string; actualKwh: number; baselineKwh: number; ghostWasteKwh: number }>;
  resolvingId: string | null;
  totalActiveWatts: number;
  activeGhostLeaksCount: number;
  canResolveEnergy?: boolean;
  canTriggerDemoLeak?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const kw = (watts: number) => (watts / 1000).toFixed(2);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ hasLeak: boolean }> = ({ hasLeak }) => (
  hasLeak ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
      Leak Detected
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E8F5E9] border border-[#DCEBDD] text-[#166534]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
      Normal
    </span>
  )
);

// ─── Detail Panel ─────────────────────────────────────────────────────────────
interface DetailPanelProps {
  block: CampusBlock;
  onClose: () => void;
  onResolveLeak: (id: string) => void;
  resolvingId: string | null;
  resolvedId: string | null;
  canResolveEnergy: boolean;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ block, onClose, onResolveLeak, resolvingId, resolvedId, canResolveEnergy }) => {
  const isResolving = resolvingId === block.id;
  const wasJustResolved = resolvedId === block.id;
  const diffWatts = block.activePowerWatts - block.baselineIdleWatts;
  const diffKw = (diffWatts / 1000).toFixed(2);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-start justify-center sm:justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={`Building detail: ${block.name}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1F2937]/40 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Panel / Bottom sheet on mobile */}
      <div className="relative z-10 w-full sm:max-w-md h-[92vh] sm:h-full bg-white border-t sm:border-t-0 sm:border-l border-[#DCEBDD] rounded-t-3xl sm:rounded-none shadow-elevated flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/98 backdrop-blur-md flex items-start justify-between p-4 sm:p-5 border-b border-[#DCEBDD]">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold text-[#166534] bg-[#E8F5E9] border border-[#DCEBDD] px-2 py-0.5 rounded-md">{block.code}</span>
              <StatusBadge hasLeak={block.hasGhostLeak} />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#14532D] leading-snug">{block.name}</h3>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5 truncate">{block.department}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-[#E8F5E9] text-[#64748B] hover:text-[#166534] transition-colors cursor-pointer"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metrics */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Power readings */}
          <div className="bg-[#F5FBF5] border border-[#DCEBDD] rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-[#166534] uppercase tracking-wider">Power Telemetry</h4>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
              <div>
                <p className="text-xs text-[#64748B] uppercase tracking-wide mb-0.5">Current</p>
                <p className={`text-base sm:text-lg font-mono font-bold ${block.hasGhostLeak ? 'text-[#B45309]' : 'text-[#14532D]'}`}>
                  {kw(block.activePowerWatts)}<span className="text-xs font-normal ml-0.5">kW</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] uppercase tracking-wide mb-0.5">Baseline</p>
                <p className="text-base sm:text-lg font-mono font-bold text-[#14532D]">
                  {kw(block.baselineIdleWatts)}<span className="text-xs font-normal ml-0.5">kW</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] uppercase tracking-wide mb-0.5">Excess</p>
                <p className={`text-base sm:text-lg font-mono font-bold ${diffWatts > 0 ? 'text-[#B45309]' : 'text-[#166534]'}`}>
                  {diffWatts > 0 ? '+' : ''}{diffKw}<span className="text-xs font-normal ml-0.5">kW</span>
                </p>
              </div>
            </div>
          </div>

          {/* Plain-Language Explanation & Estimated Impact (only when leak is active) */}
          {block.hasGhostLeak && (
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                <h4 className="text-sm font-semibold text-[#78350F]">Simulated Energy Leak</h4>
              </div>

              <p className="text-xs text-[#92400E] leading-relaxed">
                The <strong>{block.name}</strong> is drawing <strong>{diffKw} kW</strong> above its configured baseline ({kw(block.activePowerWatts)} kW current vs {kw(block.baselineIdleWatts)} kW baseline).
              </p>

              {block.leakDescription && (
                <p className="text-xs text-[#78350F] bg-white/90 p-2.5 rounded-xl border border-[#FDE68A] leading-relaxed">
                  {block.leakDescription}
                </p>
              )}

              <div className="pt-2 border-t border-[#FDE68A] space-y-1 text-xs text-[#92400E]">
                <div className="flex items-center justify-between font-mono">
                  <span>Avoidable Power Drain:</span>
                  <span className="font-bold text-[#B45309]">+{diffKw} kW</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span>Estimated Waste (1 hour):</span>
                  <span className="font-bold text-[#B45309]">~{diffKw} kWh</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span>Estimated Cost Impact:</span>
                  <span className="font-bold text-[#B45309]">~₹{(Number(diffKw) * 8.50).toFixed(2)}/hr</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px] text-[#A16207]">
                  <span>Carbon Footprint:</span>
                  <span>~{(Number(diffKw) * 0.82).toFixed(2)} kg CO₂/hr</span>
                </div>
              </div>

              <p className="text-[11px] text-[#64748B] pt-1">
                * Projections assume 1 hour of unmanaged operation at ₹8.50/kWh demonstration tariff (simulated decision-support data).
              </p>
            </div>
          )}

          {/* Normal state */}
          {!block.hasGhostLeak && !wasJustResolved && (
            <div className="bg-[#E8F5E9] border border-[#DCEBDD] rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#166534]">Operating normally</p>
                <p className="text-xs text-[#15803D] mt-0.5 leading-relaxed">
                  Building load ({kw(block.activePowerWatts)} kW) matches configured baseline ({kw(block.baselineIdleWatts)} kW). No simulated leaks detected.
                </p>
              </div>
            </div>
          )}

          {/* Just resolved confirmation */}
          {wasJustResolved && (
            <div className="bg-[#E8F5E9] border border-[#22C55E] rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#166534]">Leak resolved successfully</p>
                <p className="text-xs text-[#15803D] mt-0.5 leading-relaxed">
                  Off-hours load returned to idle baseline ({kw(block.baselineIdleWatts)} kW). <strong>+50 Green Credits</strong> awarded to {block.department}.
                </p>
              </div>
            </div>
          )}

          {/* Connected equipment list */}
          <div className="bg-white border border-[#DCEBDD] rounded-2xl p-4 space-y-2.5">
            <h4 className="text-xs font-semibold text-[#166534] uppercase tracking-wider">
              Connected Equipment ({block.appliances?.length || 0})
            </h4>
            <div className="divide-y divide-[#DCEBDD]">
              {(block.appliances || []).map(app => (
                <div key={app.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-[#1F2937]">{app.name}</span>
                    <span className="text-[#64748B] ml-1.5 font-mono text-[11px]">{app.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#64748B]">{app.ratedWatts} W</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      app.status === 'RUNNING' || app.status === 'OVERRIDE'
                        ? 'bg-[#D97706]'
                        : 'bg-[#22C55E]'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action button at bottom */}
        <div className="mt-auto p-4 sm:p-5 border-t border-[#DCEBDD] bg-white">
          {block.hasGhostLeak && canResolveEnergy ? (
            <button
              onClick={() => onResolveLeak(block.id)}
              disabled={isResolving}
              className="w-full py-3.5 px-4 min-h-[44px] rounded-xl bg-[#166534] hover:bg-[#14532D] disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer touch-manipulation focus:ring-2 focus:ring-[#22C55E]"
            >
              {isResolving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Resolving Anomaly…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Resolve Simulated Leak · +50 Green Credits</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 px-4 min-h-[44px] rounded-xl bg-[#F5FBF5] hover:bg-[#E8F5E9] text-[#166534] font-semibold text-sm border border-[#DCEBDD] transition-colors cursor-pointer touch-manipulation"
            >
              Close Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── 24-Hour Telemetry Chart ──────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#DCEBDD] rounded-xl shadow-elevated p-2.5 text-xs font-mono space-y-1">
      <p className="font-semibold text-[#1F2937] font-sans">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-[#64748B] font-sans">{p.name}:</span>
          <span className="font-bold text-[#14532D]">{p.value} kWh</span>
        </div>
      ))}
    </div>
  );
};

const EnergyChart: React.FC<{ history: Array<{ hour: string; actualKwh: number; baselineKwh: number; ghostWasteKwh: number }> }> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="h-44 sm:h-52 flex items-center justify-center text-xs text-[#64748B]">
        Loading consumption history…
      </div>
    );
  }

  return (
    <div className="h-48 sm:h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#166534" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradWaste" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D97706" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#D97706" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#DCEBDD" vertical={false} />
          <XAxis
            dataKey="hour"
            stroke="#64748B"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748B' }}
          />
          <YAxis
            stroke="#64748B"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748B' }}
            tickFormatter={(v) => `${v}`}
            unit=" kWh"
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="actualKwh"
            stroke="#166534"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#gradTotal)"
            name="Total Load"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="ghostWasteKwh"
            stroke="#D97706"
            strokeWidth={1.8}
            strokeDasharray="4 2"
            fillOpacity={1}
            fill="url(#gradWaste)"
            name="Avoidable Load"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// ─── Building List Row ────────────────────────────────────────────────────────
interface BuildingRowProps {
  block: CampusBlock;
  isSelected: boolean;
  onClick: () => void;
}

const BuildingRow: React.FC<BuildingRowProps> = ({ block, isSelected, onClick }) => {
  const excessWatts = Math.max(0, block.activePowerWatts - block.baselineIdleWatts);
  const excessKw = (excessWatts / 1000).toFixed(2);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-3 border-b border-[#DCEBDD] transition-all last:border-b-0 cursor-pointer min-h-[52px] ${
        isSelected
          ? 'bg-[#E8F5E9]'
          : block.hasGhostLeak
            ? 'bg-[#FFFDF7] hover:bg-[#FFF8E6]'
            : 'hover:bg-[#F5FBF5]'
      }`}
      aria-selected={isSelected}
    >
      {/* Status dot */}
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 ${
        block.hasGhostLeak ? 'bg-[#D97706] animate-pulse' : 'bg-[#22C55E]'
      }`} />

      {/* Name + dept + mobile power reading */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#1F2937] truncate leading-snug">{block.name}</p>
          {/* Mobile current draw */}
          <div className="sm:hidden text-right shrink-0 font-mono">
            <span className={`text-xs font-bold block ${block.hasGhostLeak ? 'text-[#B45309]' : 'text-[#14532D]'}`}>
              {kw(block.activePowerWatts)} kW
            </span>
            {block.hasGhostLeak && (
              <span className="text-[10px] text-[#B45309] font-medium block">
                +{excessKw} kW excess
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-1.5 mt-0.5">
          <p className="text-xs text-[#64748B] truncate">{block.department}</p>
          {/* Mobile status pill */}
          <span className="sm:hidden shrink-0">
            <StatusBadge hasLeak={block.hasGhostLeak} />
          </span>
        </div>
      </div>

      {/* Desktop power readings */}
      <div className="hidden sm:flex flex-col items-end shrink-0 text-right font-mono">
        <span className={`text-base font-bold ${block.hasGhostLeak ? 'text-[#B45309]' : 'text-[#14532D]'}`}>
          {kw(block.activePowerWatts)} kW
        </span>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#64748B]">base {kw(block.baselineIdleWatts)} kW</span>
          {block.hasGhostLeak && (
            <span className="text-[#B45309] font-semibold">
              (+{excessKw} kW excess)
            </span>
          )}
        </div>
      </div>

      {/* Desktop status badge */}
      <div className="shrink-0 hidden md:block">
        <StatusBadge hasLeak={block.hasGhostLeak} />
      </div>

      {/* Arrow */}
      <ChevronRight className={`w-4 h-4 shrink-0 transition-colors ${
        isSelected ? 'text-[#166534]' : 'text-[#DCEBDD]'
      }`} />
    </button>
  );
};

// ─── Main CampusMap Component ────────────────────────────────────────────────
export const CampusMap: React.FC<CampusMapProps> = ({
  blocks,
  onResolveLeak,
  onTriggerDemoLeak,
  history,
  resolvingId,
  totalActiveWatts,
  activeGhostLeaksCount,
  canResolveEnergy = true,
  canTriggerDemoLeak = true,
}) => {
  const [selectedBuilding, setSelectedBuilding] = useState<string>('ALL');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [resolvedId, setResolvedId] = useState<string | null>(null);

  const filteredBlocks = blocks.filter(b =>
    selectedBuilding === 'ALL' || b.building === selectedBuilding
  );

  const selectedBlock = selectedBlockId
    ? blocks.find(b => b.id === selectedBlockId) ?? null
    : null;

  const systemNormal = activeGhostLeaksCount === 0;

  const handleResolveLeak = async (blockId: string) => {
    setResolvedId(blockId);
    onResolveLeak(blockId);
  };

  const BLOCK_FILTERS = [
    { key: 'ALL',                  label: 'All Buildings' },
    { key: 'Main Block',           label: 'Main Block' },
    { key: 'Mechanical Engg Block',label: 'Mechanical' },
    { key: 'MBA Block',            label: 'MBA Block' },
  ];

  return (
    <div className="space-y-6">

      {/* ── A. Page Heading ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#14532D] leading-tight">
            Campus Energy
          </h2>
          <p className="text-sm text-[#64748B] mt-1">
            Monitor building consumption and identify avoidable energy waste.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-[#64748B] bg-white border border-[#DCEBDD] px-3 py-1.5 rounded-xl self-start sm:self-auto shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
          Simulated telemetry — decisions support sandbox
        </span>
      </div>

      {/* ── B. Three Compact Status Indicators ──────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* 1 — Current Power Draw */}
        <div className="bg-white border border-[#DCEBDD] rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Zap className="w-4 h-4 text-[#166534] shrink-0" />
            <span className="text-xs text-[#64748B] font-medium">Current Draw</span>
          </div>
          <p className="text-xl sm:text-2xl font-mono font-bold text-[#14532D]">
            {(totalActiveWatts / 1000).toFixed(2)}<span className="text-sm font-normal ml-1 text-[#64748B]">kW</span>
          </p>
          <p className="text-xs text-[#64748B] mt-0.5">campus-wide real-time</p>
        </div>

        {/* 2 — Active Energy Leaks */}
        <div className={`border rounded-2xl p-4 shadow-card ${
          activeGhostLeaksCount > 0
            ? 'bg-[#FFFBEB] border-[#FDE68A]'
            : 'bg-white border-[#DCEBDD]'
        }`}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertTriangle className={`w-4 h-4 shrink-0 ${activeGhostLeaksCount > 0 ? 'text-[#D97706] animate-pulse' : 'text-[#22C55E]'}`} />
            <span className="text-xs text-[#64748B] font-medium">Active Leaks</span>
          </div>
          <p className={`text-xl sm:text-2xl font-mono font-bold ${
            activeGhostLeaksCount > 0 ? 'text-[#B45309]' : 'text-[#14532D]'
          }`}>
            {activeGhostLeaksCount}
            <span className="text-sm font-normal ml-1 text-[#64748B]">building{activeGhostLeaksCount !== 1 ? 's' : ''}</span>
          </p>
          <p className="text-xs text-[#64748B] mt-0.5">simulated anomalies</p>
        </div>

        {/* 3 — System Status */}
        <div className={`col-span-2 sm:col-span-1 border rounded-2xl p-4 shadow-card ${
          systemNormal
            ? 'bg-white border-[#DCEBDD]'
            : 'bg-[#FFFBEB] border-[#FDE68A]'
        }`}>
          <div className="flex items-center gap-1.5 mb-1.5">
            {systemNormal
              ? <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
              : <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 animate-pulse" />}
            <span className="text-xs text-[#64748B] font-medium">System Status</span>
          </div>
          <p className={`text-base sm:text-lg font-bold ${
            systemNormal ? 'text-[#166534]' : 'text-[#B45309]'
          }`}>
            {systemNormal ? 'Normal' : 'Attention Required'}
          </p>
          <p className="text-[11px] sm:text-xs text-[#64748B] mt-0.5">
            {systemNormal ? 'All buildings operating nominal' : `${activeGhostLeaksCount} simulated leak${activeGhostLeaksCount > 1 ? 's' : ''} active`}
          </p>
        </div>
      </div>

      {/* ── C. Building List ─────────────────────────────────────────────── */}
      <div className="bg-white border border-[#DCEBDD] rounded-3xl overflow-hidden shadow-card">
        {/* List header: filter + demo button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-5 sm:py-3.5 border-b border-[#DCEBDD] bg-[#F5FBF5]/50">
          {/* Block filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Building2 className="w-3.5 h-3.5 text-[#64748B] shrink-0 mr-0.5" />
            {BLOCK_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setSelectedBuilding(f.key)}
                className={`px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedBuilding === f.key
                    ? 'bg-[#166534] text-white shadow-2xs'
                    : 'bg-white hover:bg-[#E8F5E9] text-[#166534] border border-[#DCEBDD]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Demo control */}
          {canTriggerDemoLeak && (
            <button
              onClick={() => {
                setResolvedId(null);
                onTriggerDemoLeak('main-blk-fl2-r204');
              }}
              className="flex items-center justify-center gap-1.5 text-xs text-[#166534] font-semibold bg-white hover:bg-[#E8F5E9] border border-[#DCEBDD] hover:border-[#22C55E] px-3.5 py-2 min-h-[36px] rounded-xl transition-all shrink-0 w-full sm:w-auto cursor-pointer shadow-2xs"
              title="Inject a simulated energy leak for demonstration"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Simulate Leak
            </button>
          )}
        </div>

        {/* Rows */}
        {filteredBlocks.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-[#64748B]">No buildings match the current filter.</p>
          </div>
        ) : (
          <div>
            {filteredBlocks.map(block => (
              <BuildingRow
                key={block.id}
                block={block}
                isSelected={selectedBlockId === block.id}
                onClick={() => setSelectedBlockId(
                  selectedBlockId === block.id ? null : block.id
                )}
              />
            ))}
          </div>
        )}

        {/* Loading state */}
        {blocks.length === 0 && (
          <div className="px-4 py-12 text-center">
            <RefreshCw className="w-5 h-5 text-[#22C55E] mx-auto mb-2 animate-spin" />
            <p className="text-sm text-[#64748B]">Loading building data…</p>
          </div>
        )}
      </div>

      {/* ── D. Energy Trend Chart ────────────────────────────────────────── */}
      <div className="bg-white border border-[#DCEBDD] rounded-3xl p-5 sm:p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Activity className="w-4 h-4 text-[#166534] shrink-0" />
              <h3 className="font-serif text-lg font-bold text-[#14532D]">24-Hour Consumption Profile</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Simulated campus energy consumption over the past 24 hours.
            </p>
          </div>
          {/* Legend */}
          <div className="flex items-center flex-wrap gap-4 text-xs text-[#64748B] shrink-0 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#166534] inline-block rounded" />
              Total Load
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 border-t-2 border-dashed border-[#D97706]" />
              Avoidable Load (simulated)
            </span>
          </div>
        </div>

        <EnergyChart history={history} />

        <p className="text-xs text-[#64748B] mt-3 flex items-center gap-1.5">
          <TrendingDown className="w-3.5 h-3.5 text-[#166534]" />
          kWh values are regenerated each session. "Avoidable Load" represents simulated ghost drains above baseline.
        </p>
      </div>

      {/* ── Building Detail Panel (drawer) ──────────────────────────────── */}
      {selectedBlock && (
        <DetailPanel
          block={selectedBlock}
          onClose={() => setSelectedBlockId(null)}
          onResolveLeak={handleResolveLeak}
          resolvingId={resolvingId}
          resolvedId={resolvedId}
          canResolveEnergy={canResolveEnergy}
        />
      )}
    </div>
  );
};
