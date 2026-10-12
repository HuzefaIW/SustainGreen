import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Zap, Camera, Utensils, Trophy, AlertTriangle, 
  Leaf, CheckCircle2, ArrowLeft, ChevronDown, LogOut
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
  SproutingSeedling,
  BotanicalBackground
} from './components/common/BotanicalElements';
import { API_ENDPOINTS } from './config/api';
import { LoginPage } from './components/auth/LoginPage';
import {
  AuthSession,
  can,
  clearStoredSession,
  createAuthorizedFetch,
  getStoredSession,
  logout,
  restoreSession,
} from './config/auth';

type TabKey = 'MAP' | 'SCANNER' | 'MESS' | 'LEADERBOARD';

// ─── Module Dropdown ──────────────────────────────────────────────────────────
interface ModuleDropdownProps {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  allowedTabs: TabKey[];
}

const MODULE_OPTIONS: { tab: TabKey; label: string; shortLabel: string; icon: React.ReactNode }[] = [
  { tab: 'MAP',         label: 'Campus Energy',              shortLabel: 'Energy',      icon: <Zap      className="w-4 h-4" /> },
  { tab: 'SCANNER',     label: 'Food Waste Audit',           shortLabel: 'Food Audit',  icon: <Camera   className="w-4 h-4" /> },
  { tab: 'MESS',        label: 'Smart Mess Predictor',       shortLabel: 'Mess',        icon: <Utensils className="w-4 h-4" /> },
  { tab: 'LEADERBOARD', label: 'Green Cup & Activity Ledger',shortLabel: 'Green Cup',   icon: <Trophy   className="w-4 h-4" /> },
];

const ModuleDropdown: React.FC<ModuleDropdownProps> = ({ activeTab, onChange, allowedTabs }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const options = MODULE_OPTIONS.filter(m => allowedTabs.includes(m.tab));
  const active = options.find(m => m.tab === activeTab) || options[0] || MODULE_OPTIONS[0];

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
        className="flex items-center space-x-1.5 sm:space-x-2 px-3 py-2 min-h-[44px] rounded-xl bg-white border border-[#DCEBDD] text-[#166534] text-xs sm:text-sm font-semibold hover:bg-[#E8F5E9] hover:border-[#22C55E] transition-all shadow-2xs cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
      >
        <span className="text-[#166534] shrink-0">{active.icon}</span>
        <span className="inline sm:hidden font-semibold">{active.shortLabel}</span>
        <span className="hidden sm:inline font-semibold">{active.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#166534] transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* Mobile backdrop for easy dismissal */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs sm:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div
            role="listbox"
            aria-label="Module selection"
            className="fixed sm:absolute top-16 sm:top-full left-3 sm:left-0 right-3 sm:right-auto sm:w-64 bg-white border border-[#DCEBDD] rounded-2xl shadow-elevated z-50 p-1.5 overflow-hidden"
          >
            <div className="px-3 py-1.5 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider border-b border-[#DCEBDD] mb-1 sm:hidden">
              Switch Module
            </div>
            {options.map(opt => (
              <button
                key={opt.tab}
                role="option"
                aria-selected={opt.tab === activeTab}
                onClick={() => { onChange(opt.tab); setOpen(false); }}
                className={`w-full text-left flex items-center space-x-3 px-3.5 py-3 sm:py-2.5 min-h-[44px] rounded-xl text-sm transition-colors cursor-pointer ${
                  opt.tab === activeTab
                    ? 'bg-[#E8F5E9] text-[#166534] font-semibold'
                    : 'text-[#1F2937] hover:bg-[#F5FBF5]'
                }`}
              >
                <span className={opt.tab === activeTab ? 'text-[#166534]' : 'text-[#64748B]'}>{opt.icon}</span>
                <span className="flex-1">{opt.label}</span>
                {opt.tab === activeTab && (
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
export function App() {
  const [currentView, setCurrentView] = useState<'LANDING' | 'SELECTION' | 'DASHBOARD'>('LANDING');
  const [activeTab, setActiveTab] = useState<TabKey>('MAP');
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession());
  const [authChecked, setAuthChecked] = useState(false);
  const [blocks, setBlocks] = useState<CampusBlock[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [totalActiveWatts, setTotalActiveWatts] = useState<number>(0);
  const [activeGhostLeaksCount, setActiveGhostLeaksCount] = useState<number>(0);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const account = session?.account || null;
  const allowedTabs = useMemo<TabKey[]>(() => {
    if (!account) return [];
    const tabs: TabKey[] = [];
    if (can(account, 'energy.read')) tabs.push('MAP');
    if (can(account, 'food_audit.create') || can(account, 'food_audit.read')) tabs.push('SCANNER');
    if (can(account, 'mess_forecast.create') || can(account, 'mess_forecast.read')) tabs.push('MESS');
    if (can(account, 'leaderboard.read') || can(account, 'activity.read')) tabs.push('LEADERBOARD');
    return tabs.length > 0 ? tabs : ['LEADERBOARD'];
  }, [account]);

  const handleUnauthorized = useCallback(() => {
    clearStoredSession();
    setSession(null);
    setCurrentView('LANDING');
    setActiveTab('MAP');
  }, []);

  const apiFetch = useMemo(() => createAuthorizedFetch(session, handleUnauthorized), [session, handleUnauthorized]);

  useEffect(() => {
    let cancelled = false;
    const stored = getStoredSession();
    if (!stored) {
      setAuthChecked(true);
      return;
    }
    restoreSession(stored)
      .then((restored) => {
        if (!cancelled) setSession(restored);
      })
      .catch(() => {
        if (!cancelled) setSession(null);
      })
      .finally(() => {
        if (!cancelled) setAuthChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (account && !allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0]);
      if (currentView === 'DASHBOARD') {
        window.location.hash = `#${allowedTabs[0].toLowerCase()}`;
      }
    }
  }, [account, allowedTabs, activeTab, currentView]);

  // Poll Campus Telemetry
  const fetchCampusStatus = async () => {
    if (!session || !can(account, 'campus.read')) return;
    try {
      const res = await apiFetch(API_ENDPOINTS.campusStatus);
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
    if (!session || !can(account, 'energy.read')) return;
    try {
      const res = await apiFetch(API_ENDPOINTS.campusHistory);
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
    if (!session) return;
    fetchCampusStatus();
    fetchCampusHistory();
    const interval = setInterval(fetchCampusStatus, 3000);
    return () => clearInterval(interval);
  }, [session, apiFetch, account]);

  const handleResolveLeak = async (blockId: string) => {
    setResolvingId(blockId);
    try {
      const res = await apiFetch(API_ENDPOINTS.resolveLeak, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
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
      await apiFetch(API_ENDPOINTS.triggerDemoLeak, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId }),
      });
      await fetchCampusStatus();
      await fetchCampusHistory();
    } catch (err) {
      console.error('Failed to trigger demo leak:', err);
    }
  };

  const handleOpenDashboard = (tab?: TabKey) => {
    const targetTab = tab && allowedTabs.includes(tab) ? tab : allowedTabs[0];
    if (targetTab) {
      setActiveTab(targetTab);
      window.location.hash = `#${targetTab.toLowerCase()}`;
      setCurrentView('DASHBOARD');
    } else {
      window.location.hash = '#selection';
      setCurrentView('SELECTION');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFromSelection = (tab: TabKey) => {
    const targetTab = allowedTabs.includes(tab) ? tab : allowedTabs[0];
    setActiveTab(targetTab);
    window.location.hash = `#${targetTab.toLowerCase()}`;
    setCurrentView('DASHBOARD');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanding = () => {
    window.location.hash = '';
    setCurrentView('LANDING');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: TabKey) => {
    if (!allowedTabs.includes(tab)) return;
    setActiveTab(tab);
    window.location.hash = `#${tab.toLowerCase()}`;
  };

  const handleLogout = async () => {
    await logout(session);
    setSession(null);
    setBlocks([]);
    setHistory([]);
    setTotalActiveWatts(0);
    setActiveGhostLeaksCount(0);
    window.location.hash = '';
    setCurrentView('LANDING');
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#F5FBF5] flex items-center justify-center text-sm text-[#166534] font-semibold">
        Restoring EcoPulse session...
      </div>
    );
  }

  if (!session || !account) {
    return <LoginPage onAuthenticated={setSession} />;
  }

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
    <div className="min-h-screen bg-[#F5FBF5] text-[#1F2937] flex flex-col font-sans selection:bg-[#166534] selection:text-white relative overflow-x-hidden">
      {/* Animated Botanical Background */}
      <BotanicalBackground variant="dashboard" />
      <BotanicalJournalTexture />

      {/* ── Slim Dashboard Header ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#DCEBDD] relative">
        <HeroBotanicalFramingRight
          className="absolute -top-4 -right-4 w-28 sm:w-48 lg:w-60 h-auto pointer-events-none z-0"
          opacity={0.16}
        />
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2 sm:gap-3 relative z-10">

          {/* Left: Logo + Back + Module Dropdown */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            {/* Back to home */}
            <button
              onClick={handleBackToLanding}
              className="px-2.5 py-2 min-h-[44px] min-w-[40px] rounded-xl bg-white border border-[#DCEBDD] text-[#166534] hover:bg-[#E8F5E9] hover:border-[#22C55E] transition-all flex items-center justify-center gap-1 text-xs font-semibold shrink-0 cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              title="Back to EcoPulse overview"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Home</span>
            </button>

            {/* Wordmark (compact on narrow screens) */}
            <div className="hidden xs:flex items-center gap-1.5 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-[#166534] text-white flex items-center justify-center">
                <Leaf className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="font-serif text-lg font-bold text-[#14532D] hidden sm:block tracking-tight">EcoPulse</span>
            </div>

            <span className="text-[#DCEBDD] text-sm hidden sm:block font-bold">/</span>

            {/* Module Dropdown */}
            <ModuleDropdown activeTab={activeTab} onChange={handleTabChange} allowedTabs={allowedTabs} />
          </div>

          {/* Right: Status + Simulated badge */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Current draw (visible on sm+) */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#DCEBDD] rounded-xl text-xs shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-[#166534]" />
              <span className="font-mono font-bold text-[#14532D]">{(totalActiveWatts / 1000).toFixed(2)} kW</span>
              <span className="text-[#64748B] text-[11px] hidden md:inline">draw</span>
            </div>

            {/* System status pill */}
            <div className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-xl border text-xs font-semibold shadow-2xs ${
              systemNormal
                ? 'bg-[#E8F5E9] border-[#DCEBDD] text-[#166534]'
                : 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]'
            }`}>
              {systemNormal
                ? <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                : <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] shrink-0 animate-pulse" />}
              <span>{systemNormal ? 'Normal' : `${activeGhostLeaksCount} Leak${activeGhostLeaksCount > 1 ? 's' : ''}`}</span>
            </div>

            {/* Simulated badge */}
            <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-[#64748B] bg-[#E8F5E9]/50 border border-[#DCEBDD] px-2.5 py-1 rounded-lg">
              <SproutingSeedling className="w-3 h-3 text-[#22C55E]" opacity={0.8} />
              {account.role.replace(/_/g, ' ')}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[38px] rounded-xl border border-[#DCEBDD] bg-white text-xs font-semibold text-[#166534] hover:bg-[#E8F5E9]"
              title={`Sign out ${account.email}`}
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
        {activeTab === 'MAP' && (
          <CampusMap
            blocks={blocks}
            onResolveLeak={handleResolveLeak}
            onTriggerDemoLeak={handleTriggerDemoLeak}
            history={history}
            resolvingId={resolvingId}
            totalActiveWatts={totalActiveWatts}
            activeGhostLeaksCount={activeGhostLeaksCount}
            canResolveEnergy={can(account, 'energy.resolve_leak')}
            canTriggerDemoLeak={can(account, 'energy.demo_trigger')}
          />
        )}
        {activeTab === 'SCANNER'     && <PlateScanner apiFetch={apiFetch} lockedDepartment={account.role === 'SUPER_ADMIN' ? undefined : account.department} />}
        {activeTab === 'MESS'        && <MessPredictor apiFetch={apiFetch} canRecordActuals={can(account, 'mess_actuals.record')} />}
        {activeTab === 'LEADERBOARD' && <Leaderboard apiFetch={apiFetch} />}
      </main>

      {/* ── Minimal Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-[#DCEBDD] py-3 text-xs text-[#64748B] bg-white/70 relative z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <span>EcoPulse · Campus Sustainability Decision Support · Simulated sandbox</span>
          <span className="font-mono text-[11px] text-[#166534] font-medium">3s live refresh</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
