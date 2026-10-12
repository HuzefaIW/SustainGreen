import React from 'react';
import { 
  Leaf, Zap, Camera, Utensils, ArrowRight, ShieldCheck, 
  AlertTriangle, CheckCircle2, ChevronRight, Activity, Clock, 
  Layers, ExternalLink, Calendar, BarChart2, Award
} from 'lucide-react';
import { CampusBlock } from '../campus-map/CampusMap';
import { 
  HeroBotanicalFramingLeft,
  HeroBotanicalFramingRight,
  CampusEnergyBotanical,
  FoodWasteBotanical,
  MessPredictorBotanical,
  GreenCupBotanical,
  BotanicalVineTransition,
  BotanicalAmbientFoliage,
  WildflowerSprig,
  SproutingSeedling,
  BotanicalJournalTexture,
  BotanicalBackground
} from '../common/BotanicalElements';

interface LandingPageProps {
  onOpenDashboard: (tab?: 'MAP' | 'SCANNER' | 'MESS' | 'LEADERBOARD') => void;
  blocks?: CampusBlock[];
  totalActiveWatts?: number;
  activeGhostLeaksCount?: number;
  onResolveLeak?: (blockId: string) => void;
  resolvingId?: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenDashboard,
  blocks = [],
  totalActiveWatts = 4250,
  activeGhostLeaksCount = 1,
  onResolveLeak,
  resolvingId,
}) => {
  const activeLeakBlock = blocks.find((b) => b.hasGhostLeak) || {
    id: 'main-blk-fl2-r204',
    name: 'Advanced AI & Computing Lab (Room 204)',
    department: 'Computer Science & Engg',
    activePowerWatts: 2680,
    baselineIdleWatts: 140,
    wastedCostPerHourInr: 21.59,
    leakDescription: 'Heavy cassette AC & workstation clusters left powered with 0 room occupants',
  };

  const totalBaselineWatts = blocks.length > 0
    ? blocks.reduce((sum, b) => sum + (b.baselineIdleWatts || 0), 0)
    : 770;
  const baselineKw = (totalBaselineWatts / 1000).toFixed(2);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FBF5] text-[#1F2937] flex flex-col selection:bg-[#166534] selection:text-white relative overflow-x-hidden">
      {/* Animated Botanical Background with Drifting Leaves & Organic Glows */}
      <BotanicalBackground variant="landing" />
      <BotanicalJournalTexture />

      {/* ── 1. Header ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#DCEBDD] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#166534] text-white flex items-center justify-center shadow-xs">
              <Leaf className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#14532D]">EcoPulse</span>
              <span className="text-xs font-semibold text-[#166534] bg-[#E8F5E9] px-2 py-0.5 rounded-full border border-[#DCEBDD] hidden sm:inline">
                Campus Sustainability
              </span>
            </div>
          </div>

          <nav className="flex items-center space-x-6 text-sm font-semibold text-[#1F2937]/80">
            <button 
              onClick={() => scrollToSection('overview')}
              className="hover:text-[#166534] transition-colors cursor-pointer"
            >
              Overview
            </button>
            <button 
              onClick={() => scrollToSection('impact')}
              className="hover:text-[#166534] transition-colors cursor-pointer"
            >
              Impact
            </button>
          </nav>
        </div>
      </header>

      {/* ── 2. Hero Section ─────────────────────────────────────────────────── */}
      <section id="overview" className="border-b border-[#DCEBDD] py-16 sm:py-24 relative overflow-hidden bg-gradient-to-b from-[#F5FBF5] via-[#E8F5E9]/40 to-[#F5FBF5]">
        {/* Large Botanical Illustration Framing */}
        <HeroBotanicalFramingLeft 
          className="absolute -top-8 -left-10 sm:-left-4 w-72 sm:w-96 lg:w-[460px] h-auto pointer-events-none z-0" 
          opacity={0.8} 
        />
        <HeroBotanicalFramingRight 
          className="absolute -top-8 -right-10 sm:-right-4 w-72 sm:w-96 lg:w-[460px] h-auto pointer-events-none z-0" 
          opacity={0.8} 
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Direct Pitch with Restrained Entrance Animation */}
            <div className="lg:col-span-6 space-y-6 animate-hero-entrance">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#E8F5E9] border border-[#DCEBDD] text-[#166534] text-xs sm:text-sm font-semibold shadow-2xs">
                <SproutingSeedling className="w-4 h-4 text-[#22C55E]" opacity={0.95} />
                <span>Campus Operations & Decision Support</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-[#14532D] leading-[1.12]">
                Find waste. Fix it. Measure the impact.
              </h1>

              <p className="text-lg sm:text-xl text-[#1F2937]/80 leading-relaxed max-w-xl">
                EcoPulse helps campus teams understand energy waste, audit food waste, and plan mess preparation with less guesswork.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <button
                  onClick={() => onOpenDashboard()}
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#166534] hover:bg-[#14532D] text-white text-sm sm:text-base font-semibold tracking-wide transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer touch-manipulation focus:ring-2 focus:ring-[#22C55E]"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-xl bg-white hover:bg-[#E8F5E9] text-[#166534] text-sm sm:text-base font-semibold border border-[#DCEBDD] transition-colors shadow-2xs cursor-pointer touch-manipulation focus:ring-2 focus:ring-[#166534]"
                >
                  <span>See How It Works</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Lower Hero Specifications */}
              <div className="pt-2">
                <div className="text-xs sm:text-sm text-[#64748B] flex flex-wrap items-center gap-4 border-t border-[#DCEBDD] pt-4">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] inline-block" />
                    <span className="font-medium text-[#1F2937]">Rule-based energy simulation</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] inline-block" />
                    <span className="font-medium text-[#1F2937]">Calibrated plate presets</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] inline-block" />
                    <span className="font-medium text-[#1F2937]">Attendance factor forecasts</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Clean White Interface Preview */}
            <div className="lg:col-span-6 relative">
              <WildflowerSprig 
                className="absolute -bottom-8 -right-6 w-24 sm:w-28 h-auto pointer-events-none z-20" 
                opacity={0.85} 
              />

              <div className="bg-white border border-[#DCEBDD] rounded-3xl shadow-card overflow-hidden relative z-10">
                {/* Preview Window Chrome */}
                <div className="px-5 py-3.5 bg-[#E8F5E9]/60 border-b border-[#DCEBDD] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                    <span className="font-semibold text-[#14532D] text-xs sm:text-sm">System Status Console</span>
                  </div>
                  <span className="font-mono text-[11px] sm:text-xs text-[#166534] uppercase tracking-wider bg-white px-2.5 py-0.5 rounded-md border border-[#DCEBDD] font-semibold">
                    Live Telemetry Preview
                  </span>
                </div>

                {/* Preview Grid Cards */}
                <div className="p-5 sm:p-6 space-y-4 bg-white">
                  {/* Row 1: Energy & Active Leak */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="p-4 rounded-2xl bg-[#F5FBF5] border border-[#DCEBDD]">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-[#64748B] mb-1">
                        <span className="font-medium">Campus Energy Draw</span>
                        <Zap className="w-4 h-4 text-[#166534]" />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-[#14532D]">
                        {(totalActiveWatts / 1000).toFixed(2)} kW
                      </div>
                      <div className="text-xs text-[#64748B] mt-0.5">
                        Baseline idle: {baselineKw} kW
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl border ${
                      activeGhostLeaksCount > 0 
                        ? 'bg-[#FFFBEB] border-[#FDE68A]' 
                        : 'bg-[#F5FBF5] border-[#DCEBDD]'
                    }`}>
                      <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
                        <span className={`font-medium ${activeGhostLeaksCount > 0 ? 'text-[#B45309]' : 'text-[#64748B]'}`}>
                          Simulated Leaks
                        </span>
                        {activeGhostLeaksCount > 0 ? (
                          <AlertTriangle className="w-4 h-4 text-[#D97706] animate-pulse" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                        )}
                      </div>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-[#14532D]">
                        {activeGhostLeaksCount > 0 ? `${activeGhostLeaksCount} Anomaly` : '0 Active'}
                      </div>
                      <div className={`text-xs mt-0.5 ${activeGhostLeaksCount > 0 ? 'text-[#B45309]' : 'text-[#22C55E]'}`}>
                        {activeGhostLeaksCount > 0 ? 'Off-hours idle draw detected' : 'All blocks nominal'}
                      </div>
                    </div>
                  </div>

                  {/* Active Leak Operational Callout */}
                  {activeGhostLeaksCount > 0 && (
                    <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-xs sm:text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-[#B45309] text-sm leading-snug">
                            <span>{activeLeakBlock.name}</span>{' '}
                            <span className="font-normal text-[#92400E] font-mono whitespace-nowrap">({activeLeakBlock.department})</span>
                          </div>
                          <p className="text-xs sm:text-sm text-[#78350F] mt-0.5 leading-snug">
                            {activeLeakBlock.leakDescription || 'Idle equipment left on post-schedule.'}
                          </p>
                          <p className="text-xs font-mono text-[#92400E] mt-1 font-semibold">
                            Estimated avoidable cost: ~₹{Number(activeLeakBlock.wastedCostPerHourInr).toFixed(2)}/hr
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (onResolveLeak) {
                              onResolveLeak(activeLeakBlock.id);
                            } else {
                              onOpenDashboard('MAP');
                            }
                          }}
                          disabled={resolvingId === activeLeakBlock.id}
                          className="px-3 py-1.5 min-h-[36px] rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-xs shrink-0 transition-colors shadow-xs cursor-pointer"
                        >
                          {resolvingId === activeLeakBlock.id ? 'Resolving...' : 'Resolve · +50 pts'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Row 2: Mess Forecast & Audit Trail Snippet */}
                  <div className="grid grid-cols-2 gap-3.5 pt-1">
                    <div className="p-4 rounded-2xl bg-[#F5FBF5] border border-[#DCEBDD]">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-[#64748B] mb-1">
                        <span className="font-medium">Mess Forecast</span>
                        <Utensils className="w-4 h-4 text-[#166534]" />
                      </div>
                      <div className="text-lg sm:text-xl font-bold text-[#14532D]">
                        840 / 1,200
                      </div>
                      <div className="text-xs text-[#64748B] mt-0.5">
                        Predicted diners (Friday factor 0.70)
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F5FBF5] border border-[#DCEBDD]">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-[#64748B] mb-1">
                        <span className="font-medium">Audit Record Log</span>
                        <Clock className="w-4 h-4 text-[#166534]" />
                      </div>
                      <div className="text-sm font-semibold text-[#14532D] truncate">
                        CSE Dept • +50 Pts
                      </div>
                      <div className="text-xs text-[#64748B] mt-0.5 truncate">
                        Action logged in tamper ledger
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Button to Open Selection Screen */}
                  <div className="pt-1">
                    <button
                      onClick={() => onOpenDashboard()}
                      className="w-full py-3 px-3.5 min-h-[44px] rounded-xl bg-[#E8F5E9] hover:bg-[#DCEBDD] text-[#166534] text-xs sm:text-sm font-semibold border border-[#DCEBDD] flex items-center justify-center space-x-2 transition-colors shadow-2xs cursor-pointer"
                    >
                      <span>Open Full Operational Dashboard</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. What EcoPulse Handles ────────────────────────────────────────── */}
      <BotanicalVineTransition title="What EcoPulse Handles" />

      <section className="py-14 sm:py-20 border-b border-[#DCEBDD] bg-[#F5FBF5] relative">
        <BotanicalAmbientFoliage side="left" className="top-12" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="mb-12">
            <span className="text-xs sm:text-sm font-bold text-[#166534] uppercase tracking-wider block">
              Core Capabilities
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-[#14532D] mt-1">
              What EcoPulse handles
            </h2>
            <p className="text-base sm:text-lg text-[#64748B] mt-2 max-w-2xl leading-relaxed">
              Targeted monitoring tools focused on three practical avenues of campus resource waste.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1: Campus Energy */}
            <div className="border border-[#DCEBDD] rounded-3xl p-7 bg-white hover:border-[#22C55E] hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#166534] flex items-center justify-center border border-[#DCEBDD]">
                    <Zap className="w-6 h-6 stroke-[2]" />
                  </div>
                  <CampusEnergyBotanical className="w-11 h-11 group-hover:scale-110 transition-transform" />
                </div>

                <h3 className="font-serif text-2xl font-bold text-[#14532D] mb-2.5 flex items-center justify-between">
                  <span>Campus Energy</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                </h3>
                <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                  Spot simulated energy leaks, estimate avoidable consumption, and record corrective actions.
                </p>
              </div>

              <div className="pt-6 mt-5 border-t border-[#DCEBDD]">
                <button
                  onClick={() => onOpenDashboard('MAP')}
                  className="inline-flex items-center space-x-2 text-sm sm:text-base font-semibold text-[#166534] hover:text-[#14532D] group-hover:translate-x-0.5 transition-all cursor-pointer"
                >
                  <span>View Energy Digital Twin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Feature 2: Food Waste Audit */}
            <div className="border border-[#DCEBDD] rounded-3xl p-7 bg-white hover:border-[#22C55E] hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#166534] flex items-center justify-center border border-[#DCEBDD]">
                    <Camera className="w-6 h-6 stroke-[2]" />
                  </div>
                  <FoodWasteBotanical className="w-11 h-11 group-hover:scale-110 transition-transform" />
                </div>

                <h3 className="font-serif text-2xl font-bold text-[#14532D] mb-2.5 flex items-center justify-between">
                  <span>Food Waste Audit</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                </h3>
                <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                  Estimate leftover food from plate photos with Gemini Vision and show verified sustainability points.
                </p>
              </div>

              <div className="pt-6 mt-5 border-t border-[#DCEBDD]">
                <button
                  onClick={() => onOpenDashboard('SCANNER')}
                  className="inline-flex items-center space-x-2 text-sm sm:text-base font-semibold text-[#166534] hover:text-[#14532D] group-hover:translate-x-0.5 transition-all cursor-pointer"
                >
                  <span>Run Plate Waste Audit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Feature 3: Mess Planning */}
            <div className="border border-[#DCEBDD] rounded-3xl p-7 bg-white hover:border-[#22C55E] hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#166534] flex items-center justify-center border border-[#DCEBDD]">
                    <Utensils className="w-6 h-6 stroke-[2]" />
                  </div>
                  <MessPredictorBotanical className="w-11 h-11 group-hover:scale-110 transition-transform" />
                </div>

                <h3 className="font-serif text-2xl font-bold text-[#14532D] mb-2.5 flex items-center justify-between">
                  <span>Mess Planning</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A3E635]" />
                </h3>
                <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                  Estimate expected diners, adjust preparation with a 5% safety buffer, and track food waste trends.
                </p>
              </div>

              <div className="pt-6 mt-5 border-t border-[#DCEBDD]">
                <button
                  onClick={() => onOpenDashboard('MESS')}
                  className="inline-flex items-center space-x-2 text-sm sm:text-base font-semibold text-[#166534] hover:text-[#14532D] group-hover:translate-x-0.5 transition-all cursor-pointer"
                >
                  <span>Review Kitchen Logistics</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. How It Works ─────────────────────────────────────────────────── */}
      <BotanicalVineTransition title="Four-Step Cycle" />

      <section id="how-it-works" className="py-14 sm:py-20 border-b border-[#DCEBDD] bg-[#F5FBF5] relative">
        <BotanicalAmbientFoliage side="right" className="top-12" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="mb-12">
            <span className="text-xs sm:text-sm font-bold text-[#166534] uppercase tracking-wider block">
              Operational Cycle
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-[#14532D] mt-1">
              How it works
            </h2>
            <p className="text-base sm:text-lg text-[#64748B] mt-2 max-w-2xl leading-relaxed">
              A straightforward four-step cycle connecting observation with verifiable campus follow-up.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 relative">
            {/* Step 1: Monitor */}
            <div className="p-6 rounded-3xl border border-[#DCEBDD] bg-white relative hover:border-[#22C55E] hover:shadow-card transition-all">
              <div className="flex items-center justify-between mb-3.5">
                <span className="font-mono text-sm font-bold text-[#166534] bg-[#E8F5E9] px-3 py-1 rounded-lg border border-[#DCEBDD]">
                  01
                </span>
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Phase
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#14532D] mb-2">
                Monitor
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Review campus energy status or enter a food-waste audit.
              </p>
            </div>

            {/* Step 2: Estimate */}
            <div className="p-6 rounded-3xl border border-[#DCEBDD] bg-white relative hover:border-[#22C55E] hover:shadow-card transition-all">
              <div className="flex items-center justify-between mb-3.5">
                <span className="font-mono text-sm font-bold text-[#166534] bg-[#E8F5E9] px-3 py-1 rounded-lg border border-[#DCEBDD]">
                  02
                </span>
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Phase
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#14532D] mb-2">
                Estimate
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Calculate likely waste, greenhouse impact, and costs avoided.
              </p>
            </div>

            {/* Step 3: Act */}
            <div className="p-6 rounded-3xl border border-[#DCEBDD] bg-white relative hover:border-[#22C55E] hover:shadow-card transition-all">
              <div className="flex items-center justify-between mb-3.5">
                <span className="font-mono text-sm font-bold text-[#166534] bg-[#E8F5E9] px-3 py-1 rounded-lg border border-[#DCEBDD]">
                  03
                </span>
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Phase
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#14532D] mb-2">
                Act
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Resolve a simulated energy leak or use the mess forecast to guide preparation.
              </p>
            </div>

            {/* Step 4: Track */}
            <div className="p-6 rounded-3xl border border-[#DCEBDD] bg-white relative hover:border-[#22C55E] hover:shadow-card transition-all">
              <div className="flex items-center justify-between mb-3.5">
                <span className="font-mono text-sm font-bold text-[#166534] bg-[#E8F5E9] px-3 py-1 rounded-lg border border-[#DCEBDD]">
                  04
                </span>
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Phase
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#14532D] mb-2">
                Track
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Review tamper-evident logs and departmental Green Cup standings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Impact & Accountability ───────────────────────────────────────── */}
      <BotanicalVineTransition title="Accountability & Trust" />

      <section id="impact" className="py-14 sm:py-20 border-b border-[#DCEBDD] bg-[#F5FBF5] relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Clear Accountability Statement with Laurel Emblem */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center space-x-3.5">
                <GreenCupBotanical className="w-14 h-14 text-[#166534]" />
                <span className="text-xs sm:text-sm font-bold text-[#166534] uppercase tracking-wider block">
                  Accountability & Verification
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-[#14532D]">
                Turning individual actions into visible records and departmental progress.
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                EcoPulse replaces vague conservation appeals with clear, timestamped action logs. When an anomaly is resolved or dining adjustments are made, points are attributed to the responsible department.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onOpenDashboard('LEADERBOARD')}
                  className="inline-flex items-center space-x-2 text-sm sm:text-base font-semibold text-[#166534] hover:text-[#14532D] group cursor-pointer"
                >
                  <span>Explore Department Leaderboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Column: Data Classification Matrix */}
            <div className="lg:col-span-7">
              <div className="border border-[#DCEBDD] rounded-3xl overflow-hidden bg-white shadow-card">
                <div className="px-6 py-4 bg-[#E8F5E9]/60 border-b border-[#DCEBDD] text-sm sm:text-base font-semibold text-[#14532D] flex items-center justify-between">
                  <span>Data Classification & Methodology</span>
                  <SproutingSeedling className="w-4 h-4 text-[#22C55E]" opacity={0.8} />
                </div>
                <div className="divide-y divide-[#DCEBDD] text-xs sm:text-sm">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="sm:w-1/3">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#166534] border border-[#DCEBDD]">
                        MEASURED / RECORDED
                      </span>
                    </div>
                    <div className="sm:w-2/3 text-[#64748B] leading-relaxed">
                      <strong className="text-[#1F2937] block font-semibold text-sm sm:text-base mb-0.5">Audit Logs & Department Credits</strong>
                      Timestamped ledger entries generated upon corrective user actions (e.g. leak resolution, logged plate audits) and accumulated department standings.
                    </div>
                  </div>

                  <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="sm:w-1/3">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
                        ESTIMATED / FACTOR-BASED
                      </span>
                    </div>
                    <div className="sm:w-2/3 text-[#64748B] leading-relaxed">
                      <strong className="text-[#1F2937] block font-semibold text-sm sm:text-base mb-0.5">Food Waste & Dining Demand</strong>
                      Calculated from selectable plate presets, Gemini Vision estimates, and rule-based meal attendance factors (day of week, weather, exam schedule).
                    </div>
                  </div>

                  <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="sm:w-1/3">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                        SIMULATED / PRESETS
                      </span>
                    </div>
                    <div className="sm:w-2/3 text-[#64748B] leading-relaxed">
                      <strong className="text-[#1F2937] block font-semibold text-sm sm:text-base mb-0.5">Campus Energy Leaks</strong>
                      Real-time simulated telemetry for demonstration. Simulates off-hours equipment draws and remote resolution workflows.
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 6. Final Call to Action ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-[#E8F5E9]/50 to-[#F5FBF5] border-b border-[#DCEBDD] text-center relative overflow-hidden">
        <BotanicalAmbientFoliage side="left" className="top-0" />
        <BotanicalAmbientFoliage side="right" className="top-0" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4 relative z-10">
          <SproutingSeedling className="w-8 h-8 mx-auto text-[#22C55E]" opacity={0.9} />
          
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-[#14532D]">
            Make campus resource use easier to understand.
          </h2>
          <p className="text-base sm:text-lg text-[#64748B] max-w-lg mx-auto leading-relaxed">
            Explore the live prototype, simulate energy anomaly resolutions, and test meal preparation forecasts.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onOpenDashboard()}
              className="inline-flex items-center space-x-2.5 px-8 py-4 rounded-xl bg-[#166534] hover:bg-[#14532D] text-white text-sm sm:text-base font-semibold tracking-wide transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer touch-manipulation focus:ring-2 focus:ring-[#22C55E]"
            >
              <span>Explore EcoPulse</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── 7. Footer ──────────────────────────────────────────────────────── */}
      <footer className="py-9 bg-white text-sm text-[#64748B] border-t border-[#DCEBDD] relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-lg bg-[#166534] text-white flex items-center justify-center shadow-xs">
              <Leaf className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="font-serif font-bold text-lg text-[#14532D]">EcoPulse</span>
            <span className="text-[#DCEBDD]">•</span>
            <span>Campus sustainability monitoring & decision support</span>
          </div>

          <div className="flex items-center space-x-5 text-sm font-semibold">
            <button
              onClick={() => onOpenDashboard('MAP')}
              className="hover:text-[#166534] transition-colors cursor-pointer"
            >
              Campus Energy
            </button>
            <button
              onClick={() => onOpenDashboard('SCANNER')}
              className="hover:text-[#166534] transition-colors cursor-pointer"
            >
              Plate Scanner
            </button>
            <button
              onClick={() => onOpenDashboard('MESS')}
              className="hover:text-[#166534] transition-colors cursor-pointer"
            >
              Mess Predictor
            </button>
            <button
              onClick={() => onOpenDashboard('LEADERBOARD')}
              className="hover:text-[#166534] transition-colors cursor-pointer"
            >
              Leaderboard
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
