import React, { useState } from 'react';
import { 
  Zap, AlertTriangle, ShieldCheck, Wifi, Clock, 
  Cpu, Thermometer, RefreshCw, Activity, ArrowRight,
  TrendingDown, CheckCircle2, SlidersHorizontal, Layers,
  Building, Radio, Check
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
  const [selectedBlockId, setSelectedBlockId] = useState<string>(blocks[0]?.id || 'svvv-blk-a-cs-lab-2');
  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || blocks[0];

  const totalGhostLeaks = blocks.filter((b) => b.hasGhostLeak).length;
  const totalWastedCostPerHour = blocks.reduce((sum, b) => sum + (b.hasGhostLeak ? b.wastedCostPerHourInr : 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if Leaks Exist */}
      {totalGhostLeaks > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-red-50 to-orange-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-xs animate-bounce">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-rose-900 text-sm flex items-center space-x-2">
                <span>NILM Anomaly: {totalGhostLeaks} Active Ghost Energy Leaks on Campus</span>
                <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full font-mono">
                  CRITICAL
                </span>
              </h4>
              <p className="text-xs text-rose-800/80 font-medium mt-0.5">
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
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-rose-600/20 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
          >
            <span>Auto-Isolate Highest Leak</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Campus 2.5D Isometric Map + Selected Room Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Interactive Campus Blocks (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <div>
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <Building className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Campus Digital Twin Grid</h3>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-full border border-emerald-300">
                  LIVE TELEMETRY
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Zero-Hardware Wi-Fi AP Telemetry & Non-Intrusive Load Monitoring (NILM)
              </p>
            </div>

            <button
              onClick={() => onTriggerDemoLeak('svvv-blk-a-cs-lab-2')}
              className="text-xs font-bold px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl border border-amber-300 transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
              title="Trigger a test ghost leak for judges"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
              <span>Simulate Leak</span>
            </button>
          </div>

          {/* Interactive Block Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {blocks.map((block) => {
              const isSelected = block.id === selectedBlockId;
              return (
                <div
                  key={block.id}
                  onClick={() => setSelectedBlockId(block.id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border relative overflow-hidden ${
                    isSelected
                      ? 'ring-2 ring-emerald-500 border-emerald-400 shadow-md bg-emerald-50/20'
                      : 'hover:border-slate-300 hover:shadow-xs bg-white'
                  } ${
                    block.hasGhostLeak
                      ? 'bg-rose-50/60 border-rose-300 hover:bg-rose-50'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Status Indicator Pill */}
                  <div className="flex justify-between items-start mb-2.5">
                    <span className="text-[11px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                      {block.code}
                    </span>
                    {block.hasGhostLeak ? (
                      <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full border border-rose-300 flex items-center space-x-1.5 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                        <span>Ghost Leak</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300 flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>Nominal</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 mb-0.5 line-clamp-1">{block.name}</h4>
                  <p className="text-[11px] font-medium text-slate-500 mb-3">{block.department}</p>

                  {/* Power & Occupancy Summary */}
                  <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Draw</span>
                      <span className={`font-mono text-sm font-extrabold ${block.hasGhostLeak ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {block.activePowerWatts.toLocaleString()} W
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Wi-Fi Devices</span>
                      <span className="font-mono text-slate-700 font-bold flex items-center space-x-1 text-xs">
                        <Wifi className="w-3.5 h-3.5 text-blue-600" />
                        <span>{block.wiFiClientCount} active</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 24-Hour Telemetry Curve */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>24-Hour Campus Consumption & Ghost Waste Curve</span>
              </span>
              <div className="flex items-center space-x-3 text-[11px] font-medium">
                <span className="flex items-center space-x-1 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Total Load</span>
                </span>
                <span className="flex items-center space-x-1 text-rose-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Ghost Waste</span>
                </span>
              </div>
            </div>
            <div className="h-40 w-full bg-slate-50/50 rounded-xl p-2 border border-slate-100">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.02}/>
                    </linearGradient>
                    <linearGradient id="wasteGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  />
                  <Area type="monotone" dataKey="actualKwh" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#actualGrad)" name="Total kWh" />
                  <Area type="monotone" dataKey="ghostWasteKwh" stroke="#e11d48" strokeWidth={2} fillOpacity={1} fill="url(#wasteGrad)" name="Ghost Waste kWh" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Col: Deep NILM Room Inspector Card (5 cols) */}
        {selectedBlock && (
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
                    {selectedBlock.code}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1.5">{selectedBlock.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedBlock.department}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">NILM Load</span>
                  <span className={`text-2xl font-mono font-extrabold ${selectedBlock.hasGhostLeak ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {selectedBlock.activePowerWatts} W
                  </span>
                </div>
              </div>

              {/* Zero-Hardware Sensor Fusion Telemetry */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-4 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-between border-b border-slate-200 pb-2">
                  <span>Sensor Fusion Telemetry</span>
                  <span className="text-[11px] text-blue-700 font-mono font-bold bg-blue-100 px-2 py-0.5 rounded-md">
                    Bayesian Conf: {(selectedBlock.occupancyConfidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center space-x-2.5 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <Wifi className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Wi-Fi Clients</span>
                      <span className="font-extrabold text-slate-900">{selectedBlock.wiFiClientCount} Devices</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Timetable Slot</span>
                      <span className="font-extrabold text-slate-900 line-clamp-1">
                        {selectedBlock.scheduledClass ? 'Scheduled Class' : 'No Scheduled Class'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Voltage RMS</span>
                      <span className="font-extrabold font-mono text-slate-900">{selectedBlock.voltageRms} V</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <Cpu className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Idle Baseline</span>
                      <span className="font-extrabold font-mono text-slate-900">{selectedBlock.baselineIdleWatts} W</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appliance-Level Disaggregation */}
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-800 mb-2.5 flex items-center justify-between">
                  <span>NILM Appliance Disaggregation</span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Harmonic Step Match</span>
                </h4>
                <div className="space-y-2">
                  {selectedBlock.appliances.map((app) => (
                    <div
                      key={app.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          app.status === 'ACTIVE' 
                            ? selectedBlock.hasGhostLeak ? 'bg-rose-500 ring-2 ring-rose-200' : 'bg-emerald-500 ring-2 ring-emerald-200' 
                            : 'bg-slate-400'
                        }`} />
                        <span className="text-slate-800 font-semibold">{app.name}</span>
                      </div>
                      <span className="font-mono text-slate-700 font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                        {app.ratedWatts} W
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ghost Leak Callout */}
              {selectedBlock.hasGhostLeak && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-red-50 border border-rose-300 text-xs mb-4 shadow-xs">
                  <div className="font-extrabold text-rose-900 mb-1 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Ghost Energy Drain Identified!</span>
                  </div>
                  <p className="text-rose-900/90 text-xs mb-2.5 leading-relaxed font-medium">
                    {selectedBlock.leakDescription}
                  </p>
                  <div className="flex justify-between text-xs font-mono font-bold text-rose-800 pt-2 border-t border-rose-200">
                    <span>Wasting ₹{selectedBlock.wastedCostPerHourInr}/hr</span>
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
                  className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-rose-600/30 transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {resolvingId === selectedBlock.id ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Transmitting IoT Relay Breaker Command...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white/20" />
                      <span>Cut Off Idle Ghost Load & Claim 50 Green Credits</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center flex items-center justify-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Optimal Operation — Zero Idle Leaks Detected</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
