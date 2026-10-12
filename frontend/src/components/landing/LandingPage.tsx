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
  BotanicalJournalTexture
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
    id: 'svvv-blk-a-cs-lab-2',
    name: 'CS Lab 2 (Ground Floor)',
    department: 'Computer Science & Engg',
    activePowerWatts: 3820,
    baselineIdleWatts: 420,
    wastedCostPerHourInr: 27.2,
    leakDescription: '18 idle desktops + server rack running post-hours',
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#191C1A] flex flex-col selection:bg-[#284635] selection:text-white relative overflow-x-hidden">
      {/* Subtle Paper Journal Texture overlay */}
      <BotanicalJournalTexture />

      {/* 1. Header */}
      <header className="sticky top-0 z-50 bg-[#FAF6EE]/94 backdrop-blur-md border-b border-[#D8E4D2] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#1B3826] text-[#E8EFE5] flex items-center justify-center shadow-xs">
              <Leaf className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex items-baseline space-x-2.5">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#191C1A]">EcoPulse</span>
              <span className="text-xs sm:text-sm font-medium text-[#486340] hidden sm:inline">
                Campus Sustainability System
              </span>
            </div>
          </div>

          <nav className="flex items-center space-x-7 text-sm sm:text-base font-semibold text-[#485E40]">
            <button 
              onClick={() => scrollToSection('overview')}
              className="hover:text-[#1B3826] transition-colors"
            >
              Overview
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-[#1B3826] transition-colors"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('impact')}
              className="hover:text-[#1B3826] transition-colors"
            >
              Impact
            </button>
          </nav>

          <div>
            <button
              onClick={() => onOpenDashboard()}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#1B3826] hover:bg-[#142C1E] text-white text-xs sm:text-sm font-semibold tracking-wide transition-colors shadow-xs"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section - Visibly Framed with Large Layered Botanical Foliage */}
      <section id="overview" className="border-b border-[#D8E4D2] py-16 sm:py-24 relative overflow-hidden bg-gradient-to-b from-[#FAF6EE] via-[#F4F1E4] to-[#FAF6EE]">
        {/* Large Botanical Illustration - Left Frame */}
        <HeroBotanicalFramingLeft 
          className="absolute -top-8 -left-10 sm:-left-4 w-72 sm:w-96 lg:w-[460px] h-auto pointer-events-none z-0" 
          opacity={0.88} 
        />

        {/* Large Botanical Illustration - Right Frame */}
        <HeroBotanicalFramingRight 
          className="absolute -top-8 -right-10 sm:-right-4 w-72 sm:w-96 lg:w-[460px] h-auto pointer-events-none z-0" 
          opacity={0.88} 
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Direct Pitch with Botanical Highlights */}
            <div className="lg:col-span-6 space-y-7">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#E5EFE2] border border-[#BFDBB7] text-[#24421E] text-xs sm:text-sm font-medium shadow-2xs">
                <SproutingSeedling className="w-4 h-4 text-[#355C2A]" opacity={0.95} />
                <span>Campus Operations & Decision Support</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-[#191C1A] leading-[1.12]">
                Find waste. Fix it. Measure the impact.
              </h1>

              <p className="text-lg sm:text-xl text-[#3E4E38] leading-relaxed max-w-xl">
                EcoPulse helps campus teams understand energy waste, audit food waste, and plan mess preparation with less guesswork.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <button
                  onClick={() => onOpenDashboard()}
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#1B3826] hover:bg-[#142C1E] text-white text-sm sm:text-base font-semibold tracking-wide transition-colors shadow-sm"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-[#FFFFFF] hover:bg-[#F2EFE6] text-[#203D1F] text-sm sm:text-base font-semibold border border-[#CADBC4] transition-colors shadow-2xs"
                >
                  <span>See How It Works</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Lower Hero Specifications */}
              <div className="pt-2">
                <div className="text-xs sm:text-sm text-[#4E6148] flex flex-wrap items-center gap-4 border-t border-[#DCE8D8] pt-3.5">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#355C2A] inline-block" />
                    <span>Rule-based energy simulation</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#355C2A] inline-block" />
                    <span>Calibrated plate presets</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#355C2A] inline-block" />
                    <span>Attendance factor forecasts</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Grounded Interface Preview */}
            <div className="lg:col-span-6 relative">
              {/* Overlapping Wildflower Sprig near edge */}
              <WildflowerSprig 
                className="absolute -bottom-8 -right-6 w-24 sm:w-28 h-auto pointer-events-none z-20" 
                opacity={0.85} 
              />

              <div className="bg-[#FFFFFF]/98 border border-[#CADBC4] rounded-2xl shadow-sm overflow-hidden relative z-10">
                {/* Preview Window Chrome */}
                <div className="px-4 py-3 bg-[#F2EFE5] border-b border-[#D8E4D2] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#203D1F]" />
                    <span className="font-semibold text-[#203D1F] text-xs sm:text-sm">System Status Console</span>
                  </div>
                  <span className="font-mono text-[11px] sm:text-xs text-[#52664B] uppercase tracking-wider bg-[#FFFFFF] px-2.5 py-0.5 rounded border border-[#D8E4D2]">
                    Demo Telemetry Preview
                  </span>
                </div>

                {/* Preview Grid Cards */}
                <div className="p-4 sm:p-5 space-y-4 bg-[#FDFCF8]">
                  {/* Row 1: Energy & Active Leak */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="p-3.5 rounded-xl bg-[#F7F4EB] border border-[#DEE9DA]">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-[#55694F] mb-1">
                        <span className="font-medium">Campus Energy Status</span>
                        <Zap className="w-4 h-4 text-[#203D1F]" />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-[#191C1A]">
                        {(totalActiveWatts / 1000).toFixed(2)} kW
                      </div>
                      <div className="text-xs text-[#697C63] mt-0.5">
                        Baseline idle: 0.85 kW
                      </div>
                    </div>

                    <div className={`p-3.5 rounded-xl border ${
                      activeGhostLeaksCount > 0 
                        ? 'bg-[#FEF7EC] border-[#EFD5B2]' 
                        : 'bg-[#F7F4EB] border-[#DEE9DA]'
                    }`}>
                      <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
                        <span className={`font-medium ${activeGhostLeaksCount > 0 ? 'text-[#874D00]' : 'text-[#55694F]'}`}>
                          Simulated Energy Leaks
                        </span>
                        {activeGhostLeaksCount > 0 ? (
                          <AlertTriangle className="w-4 h-4 text-[#B45309]" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-[#203D1F]" />
                        )}
                      </div>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-[#191C1A]">
                        {activeGhostLeaksCount > 0 ? `${activeGhostLeaksCount} Anomaly` : '0 Active'}
                      </div>
                      <div className={`text-xs mt-0.5 ${activeGhostLeaksCount > 0 ? 'text-[#874D00]' : 'text-[#697C63]'}`}>
                        {activeGhostLeaksCount > 0 ? 'Off-hours idle draw detected' : 'All blocks nominal'}
                      </div>
                    </div>
                  </div>

                  {/* Active Leak Operational Callout */}
                  {activeGhostLeaksCount > 0 && (
                    <div className="p-3.5 rounded-xl bg-[#FCF6E9] border border-[#EFD5B2] text-xs sm:text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-[#874D00] text-sm flex items-center space-x-1.5">
                            <span>{activeLeakBlock.name}</span>
                            <span className="font-normal text-[#9A6214] font-mono">({activeLeakBlock.department})</span>
                          </div>
                          <p className="text-xs sm:text-sm text-[#714102] mt-0.5 leading-snug">
                            {activeLeakBlock.leakDescription || 'Idle equipment left on post-schedule.'}
                          </p>
                          <p className="text-xs font-mono text-[#9A6214] mt-1">
                            Estimated avoidable cost: ₹{activeLeakBlock.wastedCostPerHourInr}/hr
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
                          className="px-3 py-1.5 rounded-lg bg-[#874D00] hover:bg-[#6D3E00] text-white font-medium text-xs shrink-0 transition-colors shadow-xs"
                        >
                          {resolvingId === activeLeakBlock.id ? 'Resolving...' : 'Simulate Fix'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Row 2: Mess Forecast & Audit Trail Snippet */}
                  <div className="grid grid-cols-2 gap-3.5 pt-1">
                    <div className="p-3.5 rounded-xl bg-[#F7F4EB] border border-[#DEE9DA]">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-[#55694F] mb-1">
                        <span className="font-medium">Mess Forecast Preview</span>
                        <Utensils className="w-4 h-4 text-[#203D1F]" />
                      </div>
                      <div className="text-lg sm:text-xl font-bold text-[#191C1A]">
                        840 / 1,200
                      </div>
                      <div className="text-xs text-[#697C63] mt-0.5">
                        Predicted diners (Friday factor 0.70)
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F4EB] border border-[#DEE9DA]">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-[#55694F] mb-1">
                        <span className="font-medium">Audit Record Log</span>
                        <Clock className="w-4 h-4 text-[#203D1F]" />
                      </div>
                      <div className="text-sm font-semibold text-[#191C1A] truncate">
                        CSE Dept • +50 Pts
                      </div>
                      <div className="text-xs text-[#697C63] mt-0.5 truncate">
                        Action logged in tamper ledger
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Button to Open Selection Screen */}
                  <div className="pt-1">
                    <button
                      onClick={() => onOpenDashboard()}
                      className="w-full py-3 px-3.5 rounded-xl bg-[#F0EBE0] hover:bg-[#E8E2D4] text-[#203D1F] text-xs sm:text-sm font-semibold border border-[#CADBC4] flex items-center justify-center space-x-2 transition-colors shadow-2xs"
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

      {/* 3. Section Transition Vine */}
      <BotanicalVineTransition title="What EcoPulse Handles" />

      {/* 3. What EcoPulse Handles with Individual Plant Emblems */}
      <section className="py-14 sm:py-20 border-b border-[#D8E4D2] bg-[#FAF6EE] relative">
        <BotanicalAmbientFoliage side="left" className="top-12" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="mb-12">
            <span className="text-xs sm:text-sm font-bold text-[#203D1F] uppercase tracking-wider block">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#191C1A] mt-1">
              What EcoPulse handles
            </h2>
            <p className="text-base sm:text-lg text-[#465540] mt-2 max-w-2xl leading-relaxed">
              Targeted monitoring tools focused on three practical avenues of campus resource waste.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1: Campus Energy (Leafy Branch & Fern Accent) */}
            <div className="border border-[#CADBC4] rounded-2xl p-7 bg-[#FFFFFF] hover:border-[#86B07E] hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#EAF2E7] text-[#1B3826] flex items-center justify-center border border-[#BFDBB7]">
                    <Zap className="w-6 h-6 stroke-[2]" />
                  </div>
                  {/* Distinct Botanical Accent */}
                  <CampusEnergyBotanical className="w-11 h-11 group-hover:scale-110 transition-transform" />
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[#191C1A] mb-2.5 flex items-center justify-between">
                  <span>Campus Energy</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#355C2A]" />
                </h3>
                <p className="text-sm sm:text-base text-[#465540] leading-relaxed">
                  Spot simulated energy leaks, estimate avoidable consumption, and record corrective actions.
                </p>
              </div>

              <div className="pt-6 mt-5 border-t border-[#EDF4EB]">
                <button
                  onClick={() => onOpenDashboard('MAP')}
                  className="inline-flex items-center space-x-2 text-sm sm:text-base font-semibold text-[#1B3826] hover:text-[#112318] group-hover:translate-x-0.5 transition-all"
                >
                  <span>View Energy Digital Twin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Feature 2: Food Waste Audit (Culinary Herb Sprig Accent) */}
            <div className="border border-[#CADBC4] rounded-2xl p-7 bg-[#FFFFFF] hover:border-[#86B07E] hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#EAF2E7] text-[#1B3826] flex items-center justify-center border border-[#BFDBB7]">
                    <Camera className="w-6 h-6 stroke-[2]" />
                  </div>
                  {/* Distinct Botanical Accent */}
                  <FoodWasteBotanical className="w-11 h-11 group-hover:scale-110 transition-transform" />
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[#191C1A] mb-2.5 flex items-center justify-between">
                  <span>Food Waste Audit</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#355C2A]" />
                </h3>
                <p className="text-sm sm:text-base text-[#465540] leading-relaxed">
                  Estimate leftover food from a selected plate preset and show its estimated impact.
                </p>
              </div>

              <div className="pt-6 mt-5 border-t border-[#EDF4EB]">
                <button
                  onClick={() => onOpenDashboard('SCANNER')}
                  className="inline-flex items-center space-x-2 text-sm sm:text-base font-semibold text-[#1B3826] hover:text-[#112318] group-hover:translate-x-0.5 transition-all"
                >
                  <span>Run Plate Waste Audit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Feature 3: Mess Planning (Harvest Grain & Wheat Accent) */}
            <div className="border border-[#CADBC4] rounded-2xl p-7 bg-[#FFFFFF] hover:border-[#86B07E] hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#F7F2E2] text-[#686333] flex items-center justify-center border border-[#E0D4A5]">
                    <Utensils className="w-6 h-6 stroke-[2]" />
                  </div>
                  {/* Distinct Botanical Accent */}
                  <MessPredictorBotanical className="w-11 h-11 group-hover:scale-110 transition-transform" />
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[#191C1A] mb-2.5 flex items-center justify-between">
                  <span>Mess Planning</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7A7032]" />
                </h3>
                <p className="text-sm sm:text-base text-[#465540] leading-relaxed">
                  Estimate expected diners and adjust food preparation to reduce overproduction.
                </p>
              </div>

              <div className="pt-6 mt-5 border-t border-[#EDF4EB]">
                <button
                  onClick={() => onOpenDashboard('MESS')}
                  className="inline-flex items-center space-x-2 text-sm sm:text-base font-semibold text-[#1B3826] hover:text-[#112318] group-hover:translate-x-0.5 transition-all"
                >
                  <span>Review Kitchen Logistics</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section Transition Vine */}
      <BotanicalVineTransition title="Four-Step Cycle" />

      {/* 4. How It Works */}
      <section id="how-it-works" className="py-14 sm:py-20 border-b border-[#D8E4D2] bg-[#FAF6EE] relative">
        <BotanicalAmbientFoliage side="right" className="top-12" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="mb-12">
            <span className="text-xs sm:text-sm font-bold text-[#203D1F] uppercase tracking-wider block">
              Operational Cycle
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#191C1A] mt-1">
              How it works
            </h2>
            <p className="text-base sm:text-lg text-[#465540] mt-2 max-w-2xl leading-relaxed">
              A straightforward four-step cycle connecting observation with verifiable campus follow-up.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 relative">
            {/* Step 1: Monitor */}
            <div className="p-6 rounded-2xl border border-[#CADBC4] bg-[#FFFFFF] relative hover:border-[#86B07E] hover:shadow-xs transition-all">
              <div className="flex items-center justify-between mb-3.5">
                <span className="font-mono text-sm font-bold text-[#203D1F] bg-[#EAF2E7] px-3 py-1 rounded-md border border-[#BFDBB7]">
                  01
                </span>
                <span className="text-xs font-semibold text-[#55694F] uppercase tracking-wider">
                  Phase
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#191C1A] mb-2">
                Monitor
              </h3>
              <p className="text-sm text-[#465540] leading-relaxed">
                Review campus energy status or enter a food-waste audit.
              </p>
            </div>

            {/* Step 2: Estimate */}
            <div className="p-6 rounded-2xl border border-[#CADBC4] bg-[#FFFFFF] relative hover:border-[#86B07E] hover:shadow-xs transition-all">
              <div className="flex items-center justify-between mb-3.5">
                <span className="font-mono text-sm font-bold text-[#203D1F] bg-[#EAF2E7] px-3 py-1 rounded-md border border-[#BFDBB7]">
                  02
                </span>
                <span className="text-xs font-semibold text-[#55694F] uppercase tracking-wider">
                  Phase
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#191C1A] mb-2">
                Estimate
              </h3>
              <p className="text-sm text-[#465540] leading-relaxed">
                Calculate the likely waste and associated impact.
              </p>
            </div>

            {/* Step 3: Act */}
            <div className="p-6 rounded-2xl border border-[#CADBC4] bg-[#FFFFFF] relative hover:border-[#86B07E] hover:shadow-xs transition-all">
              <div className="flex items-center justify-between mb-3.5">
                <span className="font-mono text-sm font-bold text-[#203D1F] bg-[#EAF2E7] px-3 py-1 rounded-md border border-[#BFDBB7]">
                  03
                </span>
                <span className="text-xs font-semibold text-[#55694F] uppercase tracking-wider">
                  Phase
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#191C1A] mb-2">
                Act
              </h3>
              <p className="text-sm text-[#465540] leading-relaxed">
                Resolve a simulated energy leak or use the mess forecast to guide preparation.
              </p>
            </div>

            {/* Step 4: Track */}
            <div className="p-6 rounded-2xl border border-[#CADBC4] bg-[#FFFFFF] relative hover:border-[#86B07E] hover:shadow-xs transition-all">
              <div className="flex items-center justify-between mb-3.5">
                <span className="font-mono text-sm font-bold text-[#203D1F] bg-[#EAF2E7] px-3 py-1 rounded-md border border-[#BFDBB7]">
                  04
                </span>
                <span className="text-xs font-semibold text-[#55694F] uppercase tracking-wider">
                  Phase
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#191C1A] mb-2">
                Track
              </h3>
              <p className="text-sm text-[#465540] leading-relaxed">
                Review activity logs and departmental sustainability points.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section Transition Vine */}
      <BotanicalVineTransition title="Accountability & Trust" />

      {/* 5. Impact & Accountability with Botanical Emblem */}
      <section id="impact" className="py-14 sm:py-20 border-b border-[#D8E4D2] bg-[#FAF6EE] relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Clear Accountability Statement with Laurel Emblem */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center space-x-3.5">
                <GreenCupBotanical className="w-14 h-14 text-[#24421E]" />
                <span className="text-xs sm:text-sm font-bold text-[#203D1F] uppercase tracking-wider block">
                  Accountability & Verification
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#191C1A]">
                Turning individual actions into visible records and departmental progress.
              </h2>
              <p className="text-sm sm:text-base text-[#465540] leading-relaxed">
                EcoPulse replaces vague conservation appeals with clear, timestamped action logs. When an anomaly is resolved or dining adjustments are made, points are attributed to the responsible department.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onOpenDashboard('LEADERBOARD')}
                  className="inline-flex items-center space-x-2 text-sm sm:text-base font-semibold text-[#1B3826] hover:text-[#112318] group"
                >
                  <span>Explore Department Leaderboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Column: Defensible Metrics & Data Classification Matrix */}
            <div className="lg:col-span-7">
              <div className="border border-[#CADBC4] rounded-2xl overflow-hidden bg-[#FFFFFF] shadow-xs">
                <div className="px-5 py-4 bg-[#F2EFE5] border-b border-[#CADBC4] text-sm sm:text-base font-semibold text-[#191C1A] flex items-center justify-between">
                  <span>Data Classification & Methodology</span>
                  <SproutingSeedling className="w-4 h-4 text-[#355C2A]" opacity={0.8} />
                </div>
                <div className="divide-y divide-[#EEF4EC] text-xs sm:text-sm">
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="sm:w-1/3">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#EAF2E7] text-[#1B3826] border border-[#BFDBB7]">
                        MEASURED / RECORDED
                      </span>
                    </div>
                    <div className="sm:w-2/3 text-[#465540] leading-relaxed">
                      <strong className="text-[#191C1A] block font-semibold text-sm sm:text-base mb-0.5">Audit Logs & Department Credits</strong>
                      Timestamped ledger entries generated upon corrective user actions (e.g. leak resolution, logged plate audits) and accumulated department standings.
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="sm:w-1/3">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#EAF0F6] text-[#255284] border border-[#CCDCEE]">
                        ESTIMATED / FACTOR-BASED
                      </span>
                    </div>
                    <div className="sm:w-2/3 text-[#465540] leading-relaxed">
                      <strong className="text-[#191C1A] block font-semibold text-sm sm:text-base mb-0.5">Food Waste & Dining Demand</strong>
                      Calculated from selectable plate presets and rule-based meal attendance factors (day of week, weather conditions, exam schedule).
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="sm:w-1/3">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FEF6E4] text-[#8C5E13] border border-[#FDEAC1]">
                        SIMULATED / PRESETS
                      </span>
                    </div>
                    <div className="sm:w-2/3 text-[#465540] leading-relaxed">
                      <strong className="text-[#191C1A] block font-semibold text-sm sm:text-base mb-0.5">Campus Energy Leaks</strong>
                      Real-time simulated telemetry for demonstration. Simulates off-hours equipment draws and remote resolution workflows.
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Final Action - Framed Botanical Closing */}
      <section className="py-16 sm:py-24 bg-[#F4F1E4] border-b border-[#D8E4D2] text-center relative overflow-hidden">
        <BotanicalAmbientFoliage side="left" className="top-0" />
        <BotanicalAmbientFoliage side="right" className="top-0" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4 relative z-10">
          <SproutingSeedling className="w-7 h-7 mx-auto text-[#355C2A]" opacity={0.9} />
          
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight text-[#191C1A]">
            Make campus resource use easier to understand.
          </h2>
          <p className="text-base sm:text-lg text-[#465540] max-w-lg mx-auto leading-relaxed">
            Explore the live prototype, simulate energy anomaly resolutions, and test meal preparation forecasts.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onOpenDashboard()}
              className="inline-flex items-center space-x-2.5 px-7 py-3.5 rounded-xl bg-[#1B3826] hover:bg-[#142C1E] text-white text-sm sm:text-base font-semibold tracking-wide transition-colors shadow-sm"
            >
              <span>Explore EcoPulse</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-9 bg-[#FAF6EE] text-sm sm:text-base text-[#55694F] border-t border-[#D8E4D2] relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded bg-[#1B3826] text-white flex items-center justify-center shadow-xs">
              <Leaf className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="font-bold text-[#191C1A]">EcoPulse</span>
            <span className="text-[#8E9789]">•</span>
            <span>Campus sustainability monitoring & decision support</span>
          </div>

          <div className="flex items-center space-x-5 text-sm sm:text-base font-semibold">
            <button
              onClick={() => onOpenDashboard('MAP')}
              className="hover:text-[#1B3826] transition-colors"
            >
              Campus Energy
            </button>
            <button
              onClick={() => onOpenDashboard('SCANNER')}
              className="hover:text-[#1B3826] transition-colors"
            >
              Plate Scanner
            </button>
            <button
              onClick={() => onOpenDashboard('MESS')}
              className="hover:text-[#1B3826] transition-colors"
            >
              Mess Predictor
            </button>
            <button
              onClick={() => onOpenDashboard('LEADERBOARD')}
              className="hover:text-[#1B3826] transition-colors"
            >
              Leaderboard
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
