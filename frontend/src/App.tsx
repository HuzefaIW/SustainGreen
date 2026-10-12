import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Camera, Utensils, Trophy, AlertTriangle, 
  Leaf, CheckCircle2, ArrowLeft, ChevronDown, LayoutGrid
} from 'lucide-react';
import { CampusMap, CampusBlock } from './components/campus-map/CampusMap';
import { PlateScanner } from './components/scanner/PlateScanner';
import { MessPredictor } from './components/mess/MessPredictor';
import { Leaderboard } from './components/leaderboard/Leaderboard';
import { LandingPage } from './components/landing/LandingPage';
import { FunctionalitySelection } from './components/selection/FunctionalitySelection';
import { 
  BotanicalJournalTexture, 
  HeroBotanicalFramingRight, 
  SproutingSeedling 
} from './components/common/BotanicalElements';
import { API_ENDPOINTS } from './config/api';

// ─── Module Dropdown ──────────────────────────────────────────────────────────
interface ModuleDropdownProps {
  activeTab: 'MAP' | 'SCANNER' | 'MESS' | 'LEADERBOARD';
  onChange: (tab: 'MAP' | 'SCANNER' | 'MESS' | 'LEADERBOARD') => void;
}

const MODULE_OPTIONS: { tab: 'MAP' | 'SCANNER' | 'MESS' | 'LEADERBOARD'; label: string; icon: React.ReactNode }[] = [
  { tab: 'MAP',         label: 'Campus Energy',              icon: <Zap      className="w-3.5 h-3.5" /> },
  { tab: 'SCANNER',     label: 'Food Waste Audit',           icon: <Camera   className="w-3.5 h-3.5" /> },
  { tab: 'MESS',        label: 'Smart Mess Predictor',       icon: <Utensils className="w-3.5 h-3.5" /> },
  { tab: 'LEADERBOARD', label: 'Green Cup & Activity Ledger',icon: <Trophy   className="w-3.5 h-3.5" /> },
];

const ModuleDropdown: React.FC<ModuleDropdownProps> = ({ activeTab, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = MODULE_OPTIONS.find(m => m.tab === activeTab)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        id="module-dropdown-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white border border-[#CADBC4] text-[#1B3826] text-sm font-semibold hover:bg-[#F0EBE0] transition-colors shadow-2xs"
      >
        <LayoutGrid className="w-4 h-4 text-[#486340]" />
        <span className="hidden sm:inline">{active.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#486340] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Module selection"
          className="absolute left-0 top-full mt-1.5 w-56 bg-white border border-[#D8E4D2] rounded-xl shadow-elevated z-50 py-1 overflow-hidden"
        >
          {MODULE_OPTIONS.map(opt => (
            <button
              key={opt.tab}
              role="option"
              aria-selected={opt.tab === activeTab}
              onClick={() => { onChange(opt.tab); setOpen(false); }}
              className={`w-full text-left flex items-center space-x-2.5 px-3.5 py-2.5 text-sm transition-colors ${
                opt.tab === activeTab
                  ? 'bg-[#EAF2E7] text-[#1B3826] font-semibold'
                  : 'text-[#374939] hover:bg-[#F5F7F2]'
              }`}
            >
              <span className={opt.tab === activeTab ? 'text-[#1B3826]' : 'text-[#6B8F63]'}>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
export function App() {
  const [currentView, setCurrentView] = useState<'LANDING' | 'SELECTION' | 'DASHBOARD'>('LANDING');
  const [activeTab, setActiveTab] = useState<'MAP' | 'SCANNER' | 'MESS' | 'LEADERBOARD'>('MAP');
  const [blocks, setBlocks] = useState<CampusBlock[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [totalActiveWatts, setTotalActiveWatts] = useState<number>(0);
  const [activeGhostLeaksCount, setActiveGhostLeaksCount] = useState<number>(0);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Poll Campus Telemetry
  const fetchCampusStatus = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.campusStatus);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
      const res = await fetch(API_ENDPOINTS.campusHistory);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Failed to fetch campus history:', err);
    }
  };

  // Sync with URL hash
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('selection')) {
        setCurrentView('SELECTION');
      } else if (hash.includes('scanner')) {
        setCurrentView('DASHBOARD'); setActiveTab('SCANNER');
      } else if (hash.includes('mess')) {
        setCurrentView('DASHBOARD'); setActiveTab('MESS');
      } else if (hash.includes('leaderboard')) {
        setCurrentView('DASHBOARD'); setActiveTab('LEADERBOARD');
      } else if (hash.includes('dashboard') || hash.includes('map')) {
        setCurrentView('DASHBOARD'); setActiveTab('MAP');
      } else {
        setCurrentView('LANDING');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    fetchCampusStatus();
    fetchCampusHistory();
    const interval = setInterval(fetchCampusStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleResolveLeak = async (blockId: string) => {
    setResolvingId(blockId);
    try {
      const res = await fetch(API_ENDPOINTS.resolveLeak, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchCampusStatus();
      await fetchCampusHistory();
    } catch (err) {
      console.error('Failed to resolve leak:', err);
    } finally {
      setResolvingId(null);
    }
  };

  const handleTriggerDemoLeak = async (blockId: string) => {
    try {
      await fetch(API_ENDPOINTS.triggerDemoLeak, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId }),
      });
      await fetchCampusStatus();
    } catch (err) {
      console.error('Failed to trigger demo leak:', err);
    }
  };

  const handleOpenDashboard = (tab?: 'MAP' | 'SCANNER' | 'MESS' | 'LEADERBOARD') => {
    if (tab) {
      setActiveTab(tab);
      window.location.hash = `#${tab.toLowerCase()}`;
      setCurrentView('DASHBOARD');
    } else {
      window.location.hash = '#selection';
      setCurrentView('SELECTION');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFromSelection = (tab: 'MAP' | 'SCANNER' | 'MESS') => {
    setActiveTab(tab);
    window.location.hash = `#${tab.toLowerCase()}`;
    setCurrentView('DASHBOARD');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanding = () => {
    window.location.hash = '';
    setCurrentView('LANDING');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: 'MAP' | 'SCANNER' | 'MESS' | 'LEADERBOARD') => {
    setActiveTab(tab);
    window.location.hash = `#${tab.toLowerCase()}`;
  };

  // ── Landing & Selection views ──────────────────────────────────────────────
  if (currentView === 'LANDING') {
    return (
      <LandingPage
        onOpenDashboard={handleOpenDashboard}
        blocks={blocks}
        totalActiveWatts={totalActiveWatts}
        activeGhostLeaksCount={activeGhostLeaksCount}
        onResolveLeak={handleResolveLeak}
        resolvingId={resolvingId}
      />
    );
  }

  if (currentView === 'SELECTION') {
    return (
      <FunctionalitySelection
        onSelectOption={handleSelectFromSelection}
        onBackToHome={handleBackToLanding}
      />
    );
  }

  // ── Dashboard view ────────────────────────────────────────────────────────
  const systemNormal = activeGhostLeaksCount === 0;

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#191C1A] flex flex-col font-sans selection:bg-[#284635] selection:text-white relative overflow-x-hidden">
      <BotanicalJournalTexture />

      {/* ── Slim Dashboard Header ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#FAF6EE]/96 backdrop-blur-md border-b border-[#D8E4D2] relative">
        <HeroBotanicalFramingRight
          className="absolute -top-4 -right-4 w-48 sm:w-60 h-auto pointer-events-none z-0"
          opacity={0.28}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3 relative z-10">

          {/* Left: Logo + Back + Module Dropdown */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Back to home */}
            <button
              onClick={handleBackToLanding}
              className="p-2 rounded-lg bg-white border border-[#CADBC4] text-[#203D1F] hover:bg-[#F0EBE0] transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0"
              title="Back to EcoPulse overview"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </button>

            {/* Wordmark */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-[#1B3826] text-[#E8EFE5] flex items-center justify-center">
                <Leaf className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-base font-bold text-[#191C1A] hidden sm:block tracking-tight">EcoPulse</span>
            </div>

            <span className="text-[#CADBC4] text-sm hidden sm:block">/</span>

            {/* Module Dropdown */}
            <ModuleDropdown activeTab={activeTab} onChange={handleTabChange} />
          </div>

          {/* Right: Status + Simulated badge */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Current draw */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#CADBC4] rounded-lg text-xs">
              <Zap className="w-3.5 h-3.5 text-[#486340]" />
              <span className="font-mono font-bold text-[#191C1A]">{(totalActiveWatts / 1000).toFixed(2)} kW</span>
              <span className="text-[#8E9789] text-[11px]">draw</span>
            </div>

            {/* System status pill */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
              systemNormal
                ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                : 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]'
            }`}>
              {systemNormal
                ? <CheckCircle2 className="w-3.5 h-3.5" />
                : <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />}
              <span className="hidden sm:inline">{systemNormal ? 'Normal' : `${activeGhostLeaksCount} Leak${activeGhostLeaksCount > 1 ? 's' : ''}`}</span>
            </div>

            {/* Simulated badge */}
            <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-[#8E9789] bg-[#F5F7F0] border border-[#E0E8DA] px-2 py-1 rounded-md">
              <SproutingSeedling className="w-3 h-3 text-[#8E9789]" opacity={0.7} />
              Simulated
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {activeTab === 'MAP' && (
          <CampusMap
            blocks={blocks}
            onResolveLeak={handleResolveLeak}
            onTriggerDemoLeak={handleTriggerDemoLeak}
            history={history}
            resolvingId={resolvingId}
            totalActiveWatts={totalActiveWatts}
            activeGhostLeaksCount={activeGhostLeaksCount}
          />
        )}
        {activeTab === 'SCANNER'     && <PlateScanner />}
        {activeTab === 'MESS'        && <MessPredictor />}
        {activeTab === 'LEADERBOARD' && <Leaderboard />}
      </main>

      {/* ── Minimal Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-[#D8E4D2] py-3 text-xs text-[#8E9789] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span>EcoPulse · Campus Sustainability · Simulated telemetry sandbox</span>
          <span className="font-mono">3s refresh</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
