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
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const kw = (watts: number) => (watts / 1000).toFixed(2);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ hasLeak: boolean }> = ({ hasLeak }) => (
  hasLeak ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
      Leak Detected
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534]">
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
}

const DetailPanel: React.FC<DetailPanelProps> = ({ block, onClose, onResolveLeak, resolvingId, resolvedId }) => {
  const isResolving = resolvingId === block.id;
  const wasJustResolved = resolvedId === block.id;
  const diffWatts = block.activePowerWatts - block.baselineIdleWatts;
  const diffKw = (diffWatts / 1000).toFixed(2);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={`Building detail: ${block.name}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#191C1A]/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md h-full bg-[#FAF6EE] border-l border-[#D8E4D2] shadow-elevated flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[#D8E4D2]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-[#8E9789] bg-[#F0EBE0] px-1.5 py-0.5 rounded">{block.code}</span>
              <StatusBadge hasLeak={block.hasGhostLeak} />
            </div>
            <h3 className="font-serif text-lg font-medium text-[#191C1A] leading-snug">{block.name}</h3>
            <p className="text-sm text-[#486340] mt-0.5">{block.department}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 shrink-0 p-1.5 rounded-lg hover:bg-[#E8E4DA] text-[#486340] transition-colors"
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Metrics */}
        <div className="p-5 space-y-4">
          {/* Power readings */}
          <div className="bg-white border border-[#D8E4D2] rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-[#486340] uppercase tracking-wider">Power Readings</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-[#8E9789] uppercase tracking-wide mb-0.5">Current</p>
                <p className={`text-lg font-mono font-bold ${block.hasGhostLeak ? 'text-[#B45309]' : 'text-[#191C1A]'}`}>
                  {kw(block.activePowerWatts)}<span className="text-xs font-normal ml-0.5">kW</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#8E9789] uppercase tracking-wide mb-0.5">Baseline</p>
                <p className="text-lg font-mono font-bold text-[#191C1A]">
                  {kw(block.baselineIdleWatts)}<span className="text-xs font-normal ml-0.5">kW</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#8E9789] uppercase tracking-wide mb-0.5">Excess</p>
                <p className={`text-lg font-mono font-bold ${diffWatts > 0 ? 'text-[#B45309]' : 'text-[#166534]'}`}>
                  {diffWatts > 0 ? '+' : ''}{diffKw}<span className="text-xs font-normal ml-0.5">kW</span>
                </p>
              </div>
            </div>
          </div>

          {/* Leak description (only when leak is active) */}
          {block.hasGhostLeak && (
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <h4 className="text-sm font-semibold text-[#78350F]">Simulated Energy Leak</h4>
              </div>
              <p className="text-sm text-[#92400E] leading-relaxed mb-3">
                {block.leakDescription}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-[#FDE68A] text-sm text-[#B45309] font-mono">
                <span>Est. cost: <strong>₹{block.wastedCostPerHourInr.toFixed(2)}/hour</strong></span>
                <span>{block.wastedCo2KgPerHour.toFixed(2)} kg CO₂/hr</span>
              </div>
              <p className="text-xs text-[#D97706] mt-1.5">
                Based on ₹8.50/kWh tariff. Estimated only — this is a simulation.
              </p>
            </div>
          )}

          {/* Normal state */}
          {!block.hasGhostLeak && (
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#166534]">Operating normally</p>
                <p className="text-xs text-[#4ADE80] mt-0.5 text-[#15803D]">
                  Power draw is within the expected baseline range. No simulated leaks detected.
                </p>
              </div>
            </div>
          )}

          {/* Success feedback */}
          {wasJustResolved && !block.hasGhostLeak && (
            <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-xl p-4 flex items-start gap-3">
              <Leaf className="w-4 h-4 text-[#1B3826] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#1B3826]">Simulated leak resolved</p>
                <p className="text-xs text-[#166534] mt-0.5">
                  The simulation has been reset to baseline. The action has been logged in the Activity Ledger.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action footer */}
        <div className="mt-auto p-5 border-t border-[#D8E4D2]">
          {block.hasGhostLeak ? (
            <button
              onClick={() => onResolveLeak(block.id)}
              disabled={isResolving}
              className="w-full py-3 px-4 bg-[#1B3826] hover:bg-[#254D36] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              {isResolving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Resolving simulation…</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Resolve Simulated Leak</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full py-3 rounded-xl bg-[#F5F7F0] border border-[#D8E4D2] text-xs text-[#8E9789] text-center font-medium">
              No action needed — building is nominal
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Energy Trend Chart ───────────────────────────────────────────────────────
interface EnergyChartProps {
  history: Array<{ hour: string; actualKwh: number; baselineKwh: number; ghostWasteKwh: number }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#D8E4D2] rounded-xl px-3 py-2.5 shadow-elevated text-xs">
      <p className="font-semibold text-[#191C1A] mb-1.5">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="flex items-center gap-1.5 mb-0.5" style={{ color: entry.color }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: entry.color }} />
          {entry.name}: <strong>{entry.value?.toFixed(1)} kWh</strong>
        </p>
      ))}
    </div>
  );
};

const EnergyChart: React.FC<EnergyChartProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-6 h-6 text-[#CADBC4] mx-auto mb-2" />
          <p className="text-sm text-[#8E9789]">Loading energy data…</p>
        </div>
      </div>
    );
  }

  const hasValidData = history.some(
    d => typeof d.actualKwh === 'number' && !isNaN(d.actualKwh)
  );

  if (!hasValidData) {
    return (
      <div className="h-44 flex items-center justify-center">
        <p className="text-sm text-[#8E9789]">No energy data available for the past 24 hours.</p>
      </div>
    );
  }

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#1B3826" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#1B3826" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="gradWaste" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.30} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8EFE4" vertical={false} />
          <XAxis
            dataKey="hour"
            stroke="#C5D5BF"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#8E9789' }}
          />
          <YAxis
            stroke="#C5D5BF"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#8E9789' }}
            tickFormatter={(v) => `${v}`}
            unit=" kWh"
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="actualKwh"
            stroke="#1B3826"
            strokeWidth={1.8}
            fillOpacity={1}
            fill="url(#gradTotal)"
            name="Total Load"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="ghostWasteKwh"
            stroke="#F59E0B"
            strokeWidth={1.5}
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

const BuildingRow: React.FC<BuildingRowProps> = ({ block, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-[#EDF0E9] transition-colors last:border-b-0 ${
      isSelected
        ? 'bg-[#EAF2E7]'
        : block.hasGhostLeak
          ? 'bg-[#FFFDF7] hover:bg-[#FFF8E6]'
          : 'hover:bg-[#F5F7F0]'
    }`}
    aria-selected={isSelected}
  >
    {/* Status dot */}
    <span className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${
      block.hasGhostLeak ? 'bg-[#F59E0B] animate-pulse' : 'bg-[#22C55E]'
    }`} />

    {/* Name + dept */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-[#191C1A] truncate leading-snug">{block.name}</p>
      <p className="text-xs text-[#8E9789] truncate">{block.department}</p>
    </div>

    {/* Power readings */}
    <div className="hidden sm:flex flex-col items-end shrink-0 text-right">
      <span className={`text-base font-mono font-bold ${block.hasGhostLeak ? 'text-[#B45309]' : 'text-[#191C1A]'}`}>
        {kw(block.activePowerWatts)} kW
      </span>
      <span className="text-xs text-[#8E9789] font-mono">base {kw(block.baselineIdleWatts)} kW</span>
    </div>

    {/* Status badge */}
    <div className="shrink-0 hidden md:block">
      <StatusBadge hasLeak={block.hasGhostLeak} />
    </div>

    {/* Arrow */}
    <ChevronRight className={`w-4 h-4 shrink-0 transition-colors ${
      isSelected ? 'text-[#1B3826]' : 'text-[#CADBC4]'
    }`} />
  </button>
);

// ─── Main CampusMap Component ────────────────────────────────────────────────
export const CampusMap: React.FC<CampusMapProps> = ({
  blocks,
  onResolveLeak,
  onTriggerDemoLeak,
  history,
  resolvingId,
  totalActiveWatts,
  activeGhostLeaksCount,
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
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#191C1A] leading-tight">
            Campus Energy
          </h2>
          <p className="text-sm text-[#486340] mt-1">
            Monitor building consumption and identify avoidable energy waste.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-[#8E9789] bg-[#F5F7F0] border border-[#E0E8DA] px-2.5 py-1.5 rounded-lg self-start sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CADBC4]" />
          Simulated readings — not real sensor data
        </span>
      </div>

      {/* ── B. Three Compact Status Indicators ──────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {/* 1 — Current Power Draw */}
        <div className="bg-white border border-[#D8E4D2] rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <Zap className="w-4 h-4 text-[#486340]" />
            <span className="text-xs text-[#8E9789] font-medium">Current Draw</span>
          </div>
          <p className="text-xl sm:text-2xl font-mono font-bold text-[#191C1A]">
            {(totalActiveWatts / 1000).toFixed(2)}<span className="text-sm font-normal ml-1 text-[#8E9789]">kW</span>
          </p>
          <p className="text-xs text-[#8E9789] mt-0.5">campus-wide</p>
        </div>

        {/* 2 — Active Energy Leaks */}
        <div className={`border rounded-xl p-3.5 ${
          activeGhostLeaksCount > 0
            ? 'bg-[#FFFBEB] border-[#FDE68A]'
            : 'bg-white border-[#D8E4D2]'
        }`}>
          <div className="flex items-center gap-2 mb-1.5">
            <AlertTriangle className={`w-4 h-4 ${activeGhostLeaksCount > 0 ? 'text-[#F59E0B]' : 'text-[#CADBC4]'}`} />
            <span className="text-xs text-[#8E9789] font-medium">Active Leaks</span>
          </div>
          <p className={`text-xl sm:text-2xl font-mono font-bold ${
            activeGhostLeaksCount > 0 ? 'text-[#B45309]' : 'text-[#191C1A]'
          }`}>
            {activeGhostLeaksCount}
            <span className="text-sm font-normal ml-1 text-[#8E9789]">building{activeGhostLeaksCount !== 1 ? 's' : ''}</span>
          </p>
          <p className="text-xs text-[#8E9789] mt-0.5">simulated</p>
        </div>

        {/* 3 — System Status */}
        <div className={`border rounded-xl p-3.5 ${
          systemNormal
            ? 'bg-white border-[#D8E4D2]'
            : 'bg-[#FFFBEB] border-[#FDE68A]'
        }`}>
          <div className="flex items-center gap-2 mb-1.5">
            {systemNormal
              ? <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              : <AlertTriangle className="w-4 h-4 text-[#F59E0B] animate-pulse" />}
            <span className="text-xs text-[#8E9789] font-medium">System Status</span>
          </div>
          <p className={`text-base sm:text-lg font-semibold ${
            systemNormal ? 'text-[#166534]' : 'text-[#B45309]'
          }`}>
            {systemNormal ? 'Normal' : 'Attention'}
          </p>
          <p className="text-[11px] text-[#8E9789] mt-0.5">
            {systemNormal ? 'All buildings nominal' : `${activeGhostLeaksCount} leak${activeGhostLeaksCount > 1 ? 's' : ''} active`}
          </p>
        </div>
      </div>

      {/* ── C. Building List ─────────────────────────────────────────────── */}
      <div className="bg-white border border-[#D8E4D2] rounded-2xl overflow-hidden">
        {/* List header: filter + demo button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-[#EDF0E9]">
          {/* Block filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Building2 className="w-3.5 h-3.5 text-[#8E9789]" />
            {BLOCK_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setSelectedBuilding(f.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedBuilding === f.key
                    ? 'bg-[#1B3826] text-white'
                    : 'bg-[#F5F7F0] hover:bg-[#EAF2E7] text-[#486340] border border-[#D8E4D2]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Demo control */}
          <button
            onClick={() => onTriggerDemoLeak('main-blk-fl2-r204')}
            className="flex items-center gap-1.5 text-xs text-[#486340] font-medium bg-[#F5F7F0] hover:bg-[#EAF2E7] border border-[#D8E4D2] hover:border-[#CADBC4] px-3 py-1.5 rounded-lg transition-colors shrink-0"
            title="Inject a simulated energy leak for demonstration"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Simulate Leak
          </button>
        </div>

        {/* Rows */}
        {filteredBlocks.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-[#8E9789]">No buildings match the current filter.</p>
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
          <div className="px-4 py-10 text-center">
            <RefreshCw className="w-5 h-5 text-[#CADBC4] mx-auto mb-2 animate-spin" />
            <p className="text-sm text-[#8E9789]">Loading building data…</p>
          </div>
        )}
      </div>

      {/* ── D. Energy Trend Chart ────────────────────────────────────────── */}
      <div className="bg-white border border-[#D8E4D2] rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Activity className="w-4 h-4 text-[#486340]" />
              <h3 className="text-sm font-semibold text-[#191C1A]">24-Hour Consumption Profile</h3>
            </div>
            <p className="text-sm text-[#8E9789]">
              Simulated campus energy consumption over the past 24 hours.
            </p>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 text-[11px] text-[#8E9789] shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#1B3826] inline-block rounded" />
              Total Load
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#F59E0B] inline-block rounded border-dashed" style={{borderTopWidth: 1, borderTopStyle: 'dashed', borderColor: '#F59E0B', background: 'none'}} />
              <span className="w-4 border-t border-dashed border-[#F59E0B]" />
              Avoidable Load (simulated)
            </span>
          </div>
        </div>

        <EnergyChart history={history} />

        <p className="text-[11px] text-[#8E9789] mt-3 flex items-center gap-1">
          <TrendingDown className="w-3 h-3" />
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
        />
      )}
    </div>
  );
};
