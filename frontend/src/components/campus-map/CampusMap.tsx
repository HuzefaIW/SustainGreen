import React, { useState } from 'react';
import { 
  Zap, AlertTriangle, ShieldCheck, Wifi, Clock, 
  Cpu, RefreshCw, Activity, ArrowRight,
  TrendingDown, CheckCircle2, SlidersHorizontal, Layers,
  Building, Radio, Check, Server, Filter
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
}

export const CampusMap: React.FC<CampusMapProps> = ({
  blocks,
  onResolveLeak,
  onTriggerDemoLeak,
  history,
  resolvingId,
}) => {
  const [selectedBuilding, setSelectedBuilding] = useState<string>('ALL');
  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');
  const [selectedBlockId, setSelectedBlockId] = useState<string>(blocks[0]?.id || 'main-blk-fl2-r204');

  // Filter blocks based on user's 3-block 3-floor hierarchy
  const filteredBlocks = blocks.filter((b) => {
    const matchesBuilding = selectedBuilding === 'ALL' || b.building === selectedBuilding;
    const matchesFloor = selectedFloor === 'ALL' || b.floor === selectedFloor;
    return matchesBuilding && matchesFloor;
  });

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || filteredBlocks[0] || blocks[0];
  const totalGhostLeaks = blocks.filter((b) => b.hasGhostLeak).length;
  const totalWastedCostPerHour = blocks.reduce((sum, b) => sum + (b.hasGhostLeak ? b.wastedCostPerHourInr : 0), 0);

  return (
    <div className="space-y-6">
      {/* Vercel-Style Alert Banner if Leaks Exist */}
      {totalGhostLeaks > 0 && (
        <div className="p-3.5 rounded-xl bg-white border border-rose-200 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-zinc-900 text-xs">
                  NILM Anomaly: {totalGhostLeaks} Unoccupied Rooms Drawing Heavy Power
                </span>
                <span className="text-[10px] font-mono bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-semibold">
                  GHOST LEAK
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Current waste velocity: approximately ₹{totalWastedCostPerHour.toFixed(2)}/hour in empty classrooms and laboratories.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const leakBlock = blocks.find((b) => b.hasGhostLeak);
              if (leakBlock) onResolveLeak(leakBlock.id);
            }}
            disabled={resolvingId !== null}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-md transition shadow-xs flex items-center space-x-1.5 whitespace-nowrap cursor-pointer shrink-0"
          >
            <span>Isolate Highest Leak</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* College Block & Floor Filter Ribbon */}
      <div className="bg-white border border-zinc-200/90 rounded-xl p-3.5 shadow-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        {/* Block Selector */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-zinc-400 font-mono text-[11px] mr-1 flex items-center space-x-1">
            <Building className="w-3.5 h-3.5 text-zinc-500" />
            <span>CAMPUS BLOCK:</span>
          </span>
          <button
            onClick={() => setSelectedBuilding('ALL')}
            className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
              selectedBuilding === 'ALL'
                ? 'bg-zinc-900 text-white shadow-2xs'
                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200/70'
            }`}
          >
            All Blocks
          </button>
          <button
            onClick={() => setSelectedBuilding('Main Block')}
            className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
              selectedBuilding === 'Main Block'
                ? 'bg-zinc-900 text-white shadow-2xs'
                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200/70'
            }`}
          >
            Main Block
          </button>
          <button
            onClick={() => setSelectedBuilding('Mechanical Engg Block')}
            className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
              selectedBuilding === 'Mechanical Engg Block'
                ? 'bg-zinc-900 text-white shadow-2xs'
                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200/70'
            }`}
          >
            Mechanical Block
          </button>
          <button
            onClick={() => setSelectedBuilding('MBA Block')}
            className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
              selectedBuilding === 'MBA Block'
                ? 'bg-zinc-900 text-white shadow-2xs'
                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200/70'
            }`}
          >
            MBA Block
          </button>
        </div>

        {/* Floor Selector (101 - 126, 201 - 226, 301 - 326) */}
        <div className="flex items-center space-x-1.5 border-t lg:border-t-0 pt-2 lg:pt-0 border-zinc-100">
          <span className="text-zinc-400 font-mono text-[11px] mr-1 flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-zinc-500" />
            <span>FLOOR:</span>
          </span>
          <button
            onClick={() => setSelectedFloor('ALL')}
            className={`px-2 py-0.5 rounded font-mono text-[11px] transition cursor-pointer ${
              selectedFloor === 'ALL'
                ? 'bg-zinc-800 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All Floors
          </button>
          <button
            onClick={() => setSelectedFloor(1)}
            className={`px-2 py-0.5 rounded font-mono text-[11px] transition cursor-pointer ${
              selectedFloor === 1
                ? 'bg-zinc-800 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            1st (101–126)
          </button>
          <button
            onClick={() => setSelectedFloor(2)}
            className={`px-2 py-0.5 rounded font-mono text-[11px] transition cursor-pointer ${
              selectedFloor === 2
                ? 'bg-zinc-800 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            2nd (201–226)
          </button>
          <button
            onClick={() => setSelectedFloor(3)}
            className={`px-2 py-0.5 rounded font-mono text-[11px] transition cursor-pointer ${
              selectedFloor === 3
                ? 'bg-zinc-800 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            3rd (301–326)
          </button>
        </div>
      </div>

      {/* Main Grid: Campus Blocks + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Campus Nodes (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-zinc-200/90 rounded-xl p-5 shadow-subtle">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-100">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-zinc-900">
                  {selectedBuilding === 'ALL' ? 'SVVV Campus Overview' : selectedBuilding}
                </h3>
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                  {filteredBlocks.length} Active Nodes
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Showing {selectedFloor === 'ALL' ? 'all 3 floors' : `Floor ${selectedFloor}`} telemetry feeds
              </p>
            </div>

            <button
              onClick={() => onTriggerDemoLeak('main-blk-fl2-r204')}
              className="text-xs font-medium text-zinc-700 hover:text-black bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-md transition flex items-center space-x-1 cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3 text-zinc-400" />
              <span>Simulate Leak</span>
            </button>
          </div>

          {/* Interactive Block Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredBlocks.map((block) => {
              const isSelected = block.id === selectedBlockId;
              return (
                <div
                  key={block.id}
                  onClick={() => setSelectedBlockId(block.id)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all border text-left ${
                    isSelected
                      ? 'border-zinc-900 ring-1 ring-zinc-900 bg-zinc-50/70 shadow-xs'
                      : 'border-zinc-200/90 hover:border-zinc-300 hover:bg-zinc-50/40 bg-white'
                  } ${
                    block.hasGhostLeak
                      ? 'border-rose-200 bg-rose-50/20'
                      : ''
                  }`}
                >
                  {/* Top Bar: Code & Pill */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-mono font-medium text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                        {block.code}
                      </span>
                      {block.floor && (
                        <span className="text-[10px] font-mono text-zinc-400">
                          Fl {block.floor}
                        </span>
                      )}
                    </div>
                    {block.hasGhostLeak ? (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-medium rounded-full border border-rose-200 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                        <span>Ghost Drain</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded-full border border-emerald-200 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>Nominal</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-semibold text-xs text-zinc-900 line-clamp-1">{block.name}</h4>
                  <p className="text-[11px] text-zinc-500 mb-3">{block.department}</p>

                  {/* Power & Devices Footer */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-mono block">ACTIVE DRAW</span>
                      <span className={`font-mono text-xs font-bold ${block.hasGhostLeak ? 'text-rose-600' : 'text-zinc-900'}`}>
                        {block.activePowerWatts.toLocaleString()} W
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-mono block">WI-FI CLIENTS</span>
                      <span className="font-mono text-zinc-700 text-xs flex items-center space-x-1">
                        <Wifi className="w-3 h-3 text-zinc-400" />
                        <span>{block.wiFiClientCount} active</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 24-Hour Telemetry Curve */}
          <div className="mt-6 pt-4 border-t border-zinc-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-medium text-zinc-700 flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-zinc-400" />
                <span>24-Hour Campus Consumption Profile</span>
              </span>
              <div className="flex items-center space-x-3 text-[11px] font-mono text-zinc-500">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-zinc-900" />
                  <span>Total Load</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Ghost Drain</span>
                </span>
              </div>
            </div>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="actualGradVercel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#18181b" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#18181b" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="wasteGradVercel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" stroke="#a1a1aa" fontSize={10} tickLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '8px', fontSize: '11px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                  />
                  <Area type="monotone" dataKey="actualKwh" stroke="#18181b" strokeWidth={1.5} fillOpacity={1} fill="url(#actualGradVercel)" name="Total kWh" />
                  <Area type="monotone" dataKey="ghostWasteKwh" stroke="#e11d48" strokeWidth={1.5} fillOpacity={1} fill="url(#wasteGradVercel)" name="Ghost Drain kWh" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Deep NILM Room Inspector (5 cols) */}
        {selectedBlock && (
          <div className="lg:col-span-5 bg-white border border-zinc-200/90 rounded-xl p-5 shadow-subtle flex flex-col justify-between">
            <div>
              {/* Node Header */}
              <div className="flex justify-between items-start mb-4 pb-3 border-b border-zinc-100">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono font-medium text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                      {selectedBlock.code}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {selectedBlock.building || 'CAMPUS NODE'}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900 mt-1">{selectedBlock.name}</h3>
                  <p className="text-[11px] text-zinc-500">{selectedBlock.department}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-zinc-400 block">TELEMETRY</span>
                  <span className={`text-xl font-mono font-bold ${selectedBlock.hasGhostLeak ? 'text-rose-600' : 'text-zinc-900'}`}>
                    {selectedBlock.activePowerWatts} W
                  </span>
                </div>
              </div>

              {/* Sensor Fusion Grid */}
              <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200/80 mb-4 space-y-2.5">
                <div className="text-xs font-medium text-zinc-700 flex items-center justify-between border-b border-zinc-200/80 pb-1.5">
                  <span>Bayesian Sensor Fusion</span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Confidence: {(selectedBlock.occupancyConfidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2 rounded-md border border-zinc-200/60 shadow-2xs">
                    <span className="text-[10px] text-zinc-400 block font-mono">WI-FI AP CLIENTS</span>
                    <span className="font-semibold text-zinc-800">{selectedBlock.wiFiClientCount} Connected</span>
                  </div>

                  <div className="bg-white p-2 rounded-md border border-zinc-200/60 shadow-2xs">
                    <span className="text-[10px] text-zinc-400 block font-mono">TIMETABLE ERP</span>
                    <span className="font-semibold text-zinc-800 line-clamp-1">
                      {selectedBlock.scheduledClass ? 'Scheduled Class' : 'Empty Slot'}
                    </span>
                  </div>

                  <div className="bg-white p-2 rounded-md border border-zinc-200/60 shadow-2xs">
                    <span className="text-[10px] text-zinc-400 block font-mono">RMS VOLTAGE</span>
                    <span className="font-semibold font-mono text-zinc-800">{selectedBlock.voltageRms} V</span>
                  </div>

                  <div className="bg-white p-2 rounded-md border border-zinc-200/60 shadow-2xs">
                    <span className="text-[10px] text-zinc-400 block font-mono">BASELINE IDLE</span>
                    <span className="font-semibold font-mono text-zinc-800">{selectedBlock.baselineIdleWatts} W</span>
                  </div>
                </div>
              </div>

              {/* Appliance Disaggregation List */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-semibold text-zinc-800">NILM Appliance Disaggregation</h4>
                  <span className="text-[10px] font-mono text-zinc-400">Step Matching</span>
                </div>
                <div className="space-y-1.5">
                  {selectedBlock.appliances.map((app) => (
                    <div
                      key={app.id}
                      className="p-2 rounded-md bg-zinc-50 border border-zinc-200/70 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${
                          app.status === 'ACTIVE' 
                            ? selectedBlock.hasGhostLeak ? 'bg-rose-500' : 'bg-emerald-500' 
                            : 'bg-zinc-300'
                        }`} />
                        <span className="text-zinc-700 font-medium">{app.name}</span>
                      </div>
                      <span className="font-mono text-zinc-500 text-[11px]">
                        {app.ratedWatts} W
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ghost Leak Callout */}
              {selectedBlock.hasGhostLeak && (
                <div className="p-3.5 rounded-lg bg-rose-50/60 border border-rose-200 text-xs mb-4">
                  <div className="font-semibold text-rose-900 mb-1 flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Ghost Drain Signature Identified</span>
                  </div>
                  <p className="text-rose-800 text-[11px] mb-2 leading-relaxed">
                    {selectedBlock.leakDescription}
                  </p>
                  <div className="flex justify-between text-[11px] font-mono text-rose-700 pt-1.5 border-t border-rose-200/80">
                    <span>Loss rate: ₹{selectedBlock.wastedCostPerHourInr}/hr</span>
                    <span>{selectedBlock.wastedCo2KgPerHour} kg CO2e/hr</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="pt-2">
              {selectedBlock.hasGhostLeak ? (
                <button
                  onClick={() => onResolveLeak(selectedBlock.id)}
                  disabled={resolvingId === selectedBlock.id}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs rounded-lg shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {resolvingId === selectedBlock.id ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Transmitting IoT Relay Breaker Command...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Trip Breaker & Cut Off Ghost Load (+50 Credits)</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="w-full py-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-500 text-xs font-medium text-center flex items-center justify-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Nominal Operation — Zero Ghost Leaks</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
