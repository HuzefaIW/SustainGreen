import React, { useState, useEffect } from 'react';
import { 
  Zap, Camera, Utensils, Trophy, AlertTriangle, 
  ShieldCheck, Leaf, Building2, CheckCircle2,
  ArrowLeft, Grid, SlidersHorizontal
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
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Failed to fetch campus history:', err);
    }
  };

  // Sync with initial URL hash
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('selection')) {
        setCurrentView('SELECTION');
      } else if (hash.includes('scanner')) {
        setCurrentView('DASHBOARD');
        setActiveTab('SCANNER');
      } else if (hash.includes('mess')) {
        setCurrentView('DASHBOARD');
        setActiveTab('MESS');
      } else if (hash.includes('leaderboard')) {
        setCurrentView('DASHBOARD');
        setActiveTab('LEADERBOARD');
      } else if (hash.includes('dashboard') || hash.includes('map')) {
        setCurrentView('DASHBOARD');
        setActiveTab('MAP');
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

  const handleBackToSelection = () => {
    window.location.hash = '#selection';
    setCurrentView('SELECTION');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#191C1A] flex flex-col font-sans selection:bg-[#284635] selection:text-white relative overflow-x-hidden">
      {/* Subtle Botanical Journal Texture */}
      <BotanicalJournalTexture />

      {/* Top Campus Operations Dashboard Header */}
      <header className="sticky top-0 z-50 bg-[#FAF6EE]/96 backdrop-blur-md border-b border-[#D8E4D2] shadow-xs relative">
        {/* Subtle decorative branch in outer margin */}
        <HeroBotanicalFramingRight 
          className="absolute -top-6 -right-6 w-60 sm:w-72 h-auto pointer-events-none z-0" 
          opacity={0.32} 
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Branding & Back Links */}
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <button
                onClick={handleBackToSelection}
                className="p-2 sm:p-2.5 rounded-xl bg-[#FFFFFF] border border-[#CADBC4] text-[#203D1F] hover:bg-[#F0EBE0] transition-colors flex items-center justify-center text-xs sm:text-sm font-semibold space-x-1.5 shadow-2xs"
                title="Return to selection screen"
              >
                <Grid className="w-4 h-4" />
                <span className="hidden sm:inline">Choose Area</span>
              </button>

              <button
                onClick={handleBackToLanding}
                className="p-2 sm:p-2.5 rounded-xl bg-[#FFFFFF] border border-[#CADBC4] text-[#203D1F] hover:bg-[#F0EBE0] transition-colors flex items-center justify-center text-xs sm:text-sm font-semibold space-x-1.5 shadow-2xs"
                title="Return to EcoPulse Landing Page"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </button>

              <div className="w-10 h-10 rounded-xl bg-[#1B3826] text-[#E8EFE5] flex items-center justify-center shadow-xs">
                <Leaf className="w-5 h-5 stroke-[2.2]" />
              </div>

              <div>
                <div className="flex items-center space-x-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#191C1A]">
                    EcoPulse
                  </h1>
                  <span className="text-xs font-semibold tracking-wide uppercase bg-[#EAF2E7] text-[#203D1F] px-2.5 py-0.5 rounded-full border border-[#BFDBB7]">
                    Operations Dashboard
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#486340] font-medium flex items-center space-x-1.5">
                  <span>Campus Sustainability Monitoring &amp; Decision Support System</span>
                  <SproutingSeedling className="w-3.5 h-3.5 text-[#355C2A]" opacity={0.75} />
                </p>
              </div>
            </div>

            {/* Grounded Live Status Metrics */}
            <div className="flex items-center flex-wrap gap-2.5">
              {/* Simulate Anomaly Button */}
              <button
                onClick={() => handleTriggerDemoLeak('svvv-blk-a-cs-lab-2')}
                className="text-xs font-medium text-[#203D1F] hover:text-[#1B3826] bg-white hover:bg-[#F0EBE0] border border-[#CADBC4] hover:border-[#A8C9A0] px-3 py-1.5 rounded-xl transition shadow-2xs flex items-center space-x-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#486340]" />
                <span>Simulate Anomaly</span>
              </button>

              {/* Metric 1: Total Power */}
              <div className="bg-[#FFFFFF] border border-[#CADBC4] px-4 py-2 rounded-xl flex items-center space-x-2.5 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-[#EAF2E7] text-[#1B3826] flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#55694F] uppercase tracking-wider block">
                    Simulated Power Draw
                  </span>
                  <span className="text-sm sm:text-base font-bold font-mono text-[#191C1A]">
                    {(totalActiveWatts / 1000).toFixed(2)} kW
                  </span>
                </div>
              </div>

              {/* Metric 2: Ghost Leaks */}
              <div className={`px-4 py-2 rounded-xl border flex items-center space-x-2.5 shadow-2xs transition-colors ${
                activeGhostLeaksCount > 0 
                  ? 'bg-[#FEF7EC] border-[#EFD5B2] text-[#874D00]' 
                  : 'bg-[#FFFFFF] border-[#CADBC4] text-[#203D1F]'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeGhostLeaksCount > 0 ? 'bg-[#FBE9CE] text-[#874D00]' : 'bg-[#EAF2E7] text-[#1B3826]'
                }`}>
                  {activeGhostLeaksCount > 0 ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider block opacity-90">
                    Energy Leaks
                  </span>
                  <span className="text-sm sm:text-base font-bold font-mono">
                    {activeGhostLeaksCount > 0 ? `${activeGhostLeaksCount} Anomaly Active` : '0 Leaks (Nominal)'}
                  </span>
                </div>
              </div>

              {/* Metric 3: System Status */}
              <div className="bg-[#FFFFFF] border border-[#CADBC4] px-4 py-2 rounded-xl flex items-center space-x-2.5 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-[#EAF2E7] text-[#1B3826] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#55694F] uppercase tracking-wider block">
                    System
                  </span>
                  <span className="text-sm font-bold font-mono text-[#191C1A] flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1B3826] inline-block" />
                    <span>Nominal</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Tab Navigation */}
          <div className="flex space-x-2 mt-3.5 pt-3 border-t border-[#D8E4D2] overflow-x-auto pb-0.5">
            <button
              onClick={() => {
                setActiveTab('MAP');
                window.location.hash = '#map';
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center space-x-2 shrink-0 ${
                activeTab === 'MAP'
                  ? 'bg-[#1B3826] text-white shadow-xs'
                  : 'bg-[#FFFFFF] hover:bg-[#F2EFE6] text-[#485E40] border border-[#CADBC4]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Campus Energy Map</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('SCANNER');
                window.location.hash = '#scanner';
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center space-x-2 shrink-0 ${
                activeTab === 'SCANNER'
                  ? 'bg-[#1B3826] text-white shadow-xs'
                  : 'bg-[#FFFFFF] hover:bg-[#F2EFE6] text-[#485E40] border border-[#CADBC4]'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Food Waste Audit</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('MESS');
                window.location.hash = '#mess';
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center space-x-2 shrink-0 ${
                activeTab === 'MESS'
                  ? 'bg-[#1B3826] text-white shadow-xs'
                  : 'bg-[#FFFFFF] hover:bg-[#F2EFE6] text-[#485E40] border border-[#CADBC4]'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Mess Planning &amp; Logistics</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('LEADERBOARD');
                window.location.hash = '#leaderboard';
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center space-x-2 shrink-0 ${
                activeTab === 'LEADERBOARD'
                  ? 'bg-[#1B3826] text-white shadow-xs'
                  : 'bg-[#FFFFFF] hover:bg-[#F2EFE6] text-[#485E40] border border-[#CADBC4]'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Department Standings &amp; Audit Ledger</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
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

      {/* Grounded Clean Footer */}
      <footer className="border-t border-[#D8E4D2] bg-[#FAF6EE] py-4 text-xs sm:text-sm text-[#55694F] mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-[#1B3826]" />
            <span className="font-semibold text-[#191C1A]">EcoPulse Campus Decision Support</span>
            <span className="text-[#8E9789]">•</span>
            <span>Simulated Telemetry Sandbox</span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-xs text-[#486340]">
            <button 
              onClick={handleBackToSelection}
              className="text-[#1B3826] font-semibold hover:underline"
            >
              ← Choose Area
            </button>
            <button 
              onClick={handleBackToLanding}
              className="text-[#1B3826] font-semibold hover:underline"
            >
              ← Overview
            </button>
            <span className="bg-[#FFFFFF] text-[#203D1F] px-3 py-0.5 rounded-full border border-[#CADBC4]">
              Telemetry Interval: 3s
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
