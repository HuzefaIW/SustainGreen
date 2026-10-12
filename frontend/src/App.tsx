import React, { useState, useEffect } from 'react';
import { 
  Zap, Camera, Utensils, Trophy, Activity, AlertTriangle, 
  ShieldCheck, Leaf, Sparkles, Building2, Radio, CheckCircle2,
  TrendingUp, ArrowUpRight, BarChart3, ChevronRight, Terminal,
  ExternalLink, Layers, Search, RefreshCw, Slash, SlidersHorizontal
} from 'lucide-react';
import { CampusMap, CampusBlock } from './components/campus-map/CampusMap';
import { PlateScanner } from './components/scanner/PlateScanner';
import { MessPredictor } from './components/mess/MessPredictor';
import { Leaderboard } from './components/leaderboard/Leaderboard';

export function App() {
  const [activeTab, setActiveTab] = useState<'MAP' | 'SCANNER' | 'MESS' | 'LEADERBOARD'>('MAP');
  const [blocks, setBlocks] = useState<CampusBlock[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [totalActiveWatts, setTotalActiveWatts] = useState<number>(0);
  const [activeGhostLeaksCount, setActiveGhostLeaksCount] = useState<number>(0);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Poll Campus Telemetry
  const fetchCampusStatus = async () => {
    try {
      const res = await fetch('/api/campus-status');
      const data = await res.json();
      setBlocks(data.blocks || []);
      setTotalActiveWatts(data.totalActiveWatts || 0);
      setActiveGhostLeaksCount(data.activeGhostLeaksCount || 0);
    } catch (err) {
      console.error('Failed to fetch campus status:', err);
    }
  };

  const fetchCampusHistory = async () => {
    try {
      const res = await fetch('/api/campus-history');
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Failed to fetch campus history:', err);
    }
  };

  useEffect(() => {
    fetchCampusStatus();
    fetchCampusHistory();
    const interval = setInterval(fetchCampusStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleResolveLeak = async (blockId: string) => {
    setResolvingId(blockId);
    try {
      const res = await fetch('/api/resolve-leak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId }),
      });
      await res.json();
      await fetchCampusStatus();
    } catch (err) {
      console.error('Failed to resolve leak:', err);
    } finally {
      setResolvingId(null);
    }
  };

  const handleTriggerDemoLeak = async (blockId: string) => {
    try {
      await fetch('/api/trigger-demo-leak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId }),
      });
      await fetchCampusStatus();
    } catch (err) {
      console.error('Failed to trigger demo leak:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      {/* Vercel-Style Global Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            {/* Left: Vercel Breadcrumbs */}
            <div className="flex items-center space-x-2.5 text-sm">
              <div className="w-6 h-6 bg-black text-white rounded-md flex items-center justify-center font-bold text-xs shadow-xs">
                ▲
              </div>
              <span className="font-semibold text-zinc-900">svvv-campus</span>
              <span className="text-zinc-300">/</span>
              <div className="flex items-center space-x-1.5 font-medium text-zinc-600 hover:text-zinc-900 transition cursor-pointer">
                <span>ecopulse</span>
                <span className="text-[10px] font-mono uppercase bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded font-semibold border border-zinc-200">
                  PS-04
                </span>
              </div>
            </div>

            {/* Right: Actions & Live Beacon */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 text-xs text-zinc-500 font-mono bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>NILM Telemetry Live</span>
              </div>

              <button
                onClick={() => handleTriggerDemoLeak('svvv-blk-a-cs-lab-2')}
                className="text-xs font-medium text-zinc-700 hover:text-black bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 px-3 py-1.5 rounded-md transition shadow-subtle flex items-center space-x-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
                <span>Simulate Anomaly</span>
              </button>

              <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-semibold shadow-xs">
                SV
              </div>
            </div>
          </div>

          {/* Vercel Subnav Tabs */}
          <div className="flex space-x-1 -mb-px overflow-x-auto text-xs font-medium">
            <button
              onClick={() => setActiveTab('MAP')}
              className={`pb-3 pt-2 px-3.5 border-b-2 transition flex items-center space-x-2 shrink-0 cursor-pointer ${
                activeTab === 'MAP'
                  ? 'border-zinc-900 text-zinc-900 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Digital Twin & NILM</span>
              {activeGhostLeaksCount > 0 && (
                <span className="ml-1.5 bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {activeGhostLeaksCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('SCANNER')}
              className={`pb-3 pt-2 px-3.5 border-b-2 transition flex items-center space-x-2 shrink-0 cursor-pointer ${
                activeTab === 'SCANNER'
                  ? 'border-zinc-900 text-zinc-900 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>AI Plate Waste Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab('MESS')}
              className={`pb-3 pt-2 px-3.5 border-b-2 transition flex items-center space-x-2 shrink-0 cursor-pointer ${
                activeTab === 'MESS'
                  ? 'border-zinc-900 text-zinc-900 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Predictive Mess Logistics</span>
            </button>

            <button
              onClick={() => setActiveTab('LEADERBOARD')}
              className={`pb-3 pt-2 px-3.5 border-b-2 transition flex items-center space-x-2 shrink-0 cursor-pointer ${
                activeTab === 'LEADERBOARD'
                  ? 'border-zinc-900 text-zinc-900 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Sustainability Cup & Ledger</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Vercel Header Metric Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Power */}
          <div className="bg-white border border-zinc-200/90 rounded-xl p-4 shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-500 text-xs mb-2">
              <span className="font-medium">Active Campus Power</span>
              <Zap className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-zinc-900">
                {(totalActiveWatts / 1000).toFixed(2)}
              </span>
              <span className="text-xs text-zinc-500 font-mono">kW</span>
            </div>
            <div className="mt-2 text-[11px] text-zinc-500 flex items-center space-x-1 font-mono">
              <span className="text-emerald-600 font-semibold">cos φ = 0.96</span>
              <span>• Feeder RMS 231V</span>
            </div>
          </div>

          {/* Card 2: Ghost Leaks */}
          <div className={`rounded-xl p-4 border shadow-subtle flex flex-col justify-between transition-colors ${
            activeGhostLeaksCount > 0 
              ? 'bg-rose-50/40 border-rose-200' 
              : 'bg-white border-zinc-200/90'
          }`}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className={`font-medium ${activeGhostLeaksCount > 0 ? 'text-rose-800' : 'text-zinc-500'}`}>
                Ghost Energy Drains
              </span>
              <Radio className={`w-4 h-4 ${activeGhostLeaksCount > 0 ? 'text-rose-600 animate-pulse' : 'text-zinc-400'}`} />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-bold font-mono tracking-tight ${
                activeGhostLeaksCount > 0 ? 'text-rose-700' : 'text-zinc-900'
              }`}>
                {activeGhostLeaksCount}
              </span>
              <span className={`text-xs ${activeGhostLeaksCount > 0 ? 'text-rose-600 font-medium' : 'text-zinc-500'}`}>
                {activeGhostLeaksCount > 0 ? 'anomalies active' : 'leaks detected'}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-zinc-500 flex items-center space-x-1 font-mono">
              {activeGhostLeaksCount > 0 ? (
                <span className="text-rose-700 font-semibold">Leak rate ~₹36.7/hr</span>
              ) : (
                <span className="text-emerald-600 font-semibold">100% nominal baselines</span>
              )}
            </div>
          </div>

          {/* Card 3: Sensor Fusion */}
          <div className="bg-white border border-zinc-200/90 rounded-xl p-4 shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-500 text-xs mb-2">
              <span className="font-medium">Sensor Fusion Engine</span>
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-bold tracking-tight text-zinc-900">
                Zero Hardware
              </span>
            </div>
            <div className="mt-2 text-[11px] text-zinc-500 flex items-center space-x-1 font-mono">
              <span className="text-blue-600 font-medium">Wi-Fi AP SNMP</span>
              <span>+ Timetable ERP</span>
            </div>
          </div>

          {/* Card 4: Environmental Abatement */}
          <div className="bg-white border border-zinc-200/90 rounded-xl p-4 shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-500 text-xs mb-2">
              <span className="font-medium">Total Decarbonization</span>
              <Leaf className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-zinc-900">
                1.84
              </span>
              <span className="text-xs text-zinc-500 font-mono">Tonnes CO2e</span>
            </div>
            <div className="mt-2 text-[11px] text-zinc-500 flex items-center space-x-1 font-mono">
              <span className="text-emerald-600 font-medium">+12.4% vs last week</span>
            </div>
          </div>
        </div>

        {/* Dynamic Tab Body */}
        {activeTab === 'MAP' && (
          <CampusMap
            blocks={blocks}
            onResolveLeak={handleResolveLeak}
            onTriggerDemoLeak={handleTriggerDemoLeak}
            history={history}
            resolvingId={resolvingId}
          />
        )}

        {activeTab === 'SCANNER' && <PlateScanner />}

        {activeTab === 'MESS' && <MessPredictor />}

        {activeTab === 'LEADERBOARD' && <Leaderboard />}
      </main>

      {/* Vercel-Style Minimal Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 text-xs text-zinc-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-zinc-700 font-medium">EcoPulse Decarbonization Engine</span>
            <span>•</span>
            <span>SVVV Indore KAUSHAL 8.0 (PS-04)</span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px] text-zinc-400">
            <span>SHA-256 Verified Telemetry</span>
            <span>•</span>
            <span>Node: gateway-svvv-01</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
