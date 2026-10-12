import React, { useState, useEffect } from 'react';
import { 
  Zap, Camera, Utensils, Trophy, Activity, AlertTriangle, 
  ShieldCheck, Leaf, Sparkles, Building2, Radio, CheckCircle2,
  TrendingUp, ArrowUpRight, BarChart3, ChevronRight
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Professional Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Branding & Institutional Pill */}
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/25 text-white">
                <Leaf className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 bg-clip-text text-transparent">
                    EcoPulse
                  </h1>
                  <span className="text-[11px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-xs">
                    KAUSHAL 8.0 • PS-04
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  AI Zero-Hardware Campus Decarbonization & Waste Intelligence • SVVV Indore
                </p>
              </div>
            </div>

            {/* Bright KPI Metrics Bar */}
            <div className="flex items-center flex-wrap gap-2.5">
              {/* Metric 1: Total Power */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-200/80 px-3.5 py-2 rounded-xl flex items-center space-x-2.5 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <Zap className="w-4 h-4 fill-white/20" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Live Campus Draw</span>
                  <span className="text-sm font-extrabold font-mono text-emerald-950">
                    {(totalActiveWatts / 1000).toFixed(2)} kW
                  </span>
                </div>
              </div>

              {/* Metric 2: Ghost Leaks */}
              <div className={`px-3.5 py-2 rounded-xl border flex items-center space-x-2.5 shadow-xs transition-colors ${
                activeGhostLeaksCount > 0 
                  ? 'bg-gradient-to-br from-rose-50 to-red-50/60 border-rose-200 text-rose-900' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div className={`w-8 h-8 rounded-lg text-white flex items-center justify-center shadow-xs ${
                  activeGhostLeaksCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-600'
                }`}>
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">Ghost Leaks</span>
                  <span className="text-sm font-extrabold font-mono">
                    {activeGhostLeaksCount > 0 ? `${activeGhostLeaksCount} Anomaly Active` : '0 Leaks (Nominal)'}
                  </span>
                </div>
              </div>

              {/* Metric 3: Zero-Hardware Fusion Tag */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-200/80 px-3.5 py-2 rounded-xl hidden sm:flex items-center space-x-2.5 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Telemetry Fusion</span>
                  <span className="text-xs font-bold text-blue-950">
                    Wi-Fi AP + NILM
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Bright Executive Tab Navigation */}
          <div className="flex space-x-2 mt-4 pt-3 border-t border-slate-200/80 overflow-x-auto pb-0.5">
            <button
              onClick={() => setActiveTab('MAP')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 shadow-xs ${
                activeTab === 'MAP'
                  ? 'bg-emerald-600 text-white shadow-emerald-600/25 ring-2 ring-emerald-600/30'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Campus Digital Twin & NILM</span>
            </button>

            <button
              onClick={() => setActiveTab('SCANNER')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 shadow-xs ${
                activeTab === 'SCANNER'
                  ? 'bg-amber-500 text-slate-950 shadow-amber-500/25 ring-2 ring-amber-500/30'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>AI Plate Waste Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab('MESS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 shadow-xs ${
                activeTab === 'MESS'
                  ? 'bg-blue-600 text-white shadow-blue-600/25 ring-2 ring-blue-600/30'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Predictive Mess Kitchen Logistics</span>
            </button>

            <button
              onClick={() => setActiveTab('LEADERBOARD')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 shadow-xs ${
                activeTab === 'LEADERBOARD'
                  ? 'bg-purple-600 text-white shadow-purple-600/25 ring-2 ring-purple-600/30'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Department Green Cup & Audit Ledger</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      {/* Bright Professional Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-slate-700">EcoPulse Campus Intelligence</span>
            <span className="text-slate-400">• SVVV Indore KAUSHAL 8.0</span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px] text-slate-600">
            <span>Node: SVVV-GATEWAY-ONLINE</span>
            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
              Sub-second Telemetry Active
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
