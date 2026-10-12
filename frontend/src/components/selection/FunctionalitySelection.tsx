import React from 'react';
import { Leaf, ArrowLeft, ArrowRight, Trophy } from 'lucide-react';
import { 
  BotanicalJournalTexture, 
  HeroBotanicalFramingLeft, 
  HeroBotanicalFramingRight,
  WildflowerSprig,
  SproutingSeedling,
  BotanicalBackground
} from '../common/BotanicalElements';

interface FunctionalitySelectionProps {
  onSelectOption: (tab: 'MAP' | 'SCANNER' | 'MESS' | 'LEADERBOARD') => void;
  onBackToHome: () => void;
}

// 1. Campus Energy Motif: Leafy branch intertwined with subtle electricity bolt
const CampusEnergyMotif: React.FC = () => (
  <svg
    viewBox="0 0 180 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-32 h-32 sm:w-36 sm:h-36 mx-auto group-hover:scale-105 transition-transform duration-300"
    aria-hidden="true"
  >
    {/* Subtle circular botanical halo */}
    <circle cx="90" cy="90" r="72" stroke="#DCEBDD" strokeWidth="1" strokeDasharray="3 3" />
    
    {/* Intertwined electricity path */}
    <path
      d="M96 28 L72 82 L98 82 L82 148 L122 78 L94 78 Z"
      fill="#FDF8E4"
      stroke="#D97706"
      strokeWidth="2.2"
      strokeLinejoin="round"
      strokeLinecap="round"
      className="drop-shadow-xs"
    />

    {/* Primary leafy branch curving through and wrapping the lightning */}
    <path
      d="M42 144 C55 118, 70 85, 90 60 C110 35, 128 25, 142 20"
      stroke="#166534"
      strokeWidth="2.4"
      strokeLinecap="round"
    />

    {/* Leaves wrapping around electricity */}
    <path
      d="M56 122 C42 115, 34 125, 30 134 C42 136, 52 130, 56 122 Z"
      fill="#22C55E"
      stroke="#166534"
      strokeWidth="1.2"
      opacity="0.9"
    />
    <path
      d="M70 102 C68 85, 54 82, 46 88 C48 100, 60 105, 70 102 Z"
      fill="#A3E635"
      stroke="#166534"
      strokeWidth="1.2"
      opacity="0.9"
    />
    <path
      d="M86 72 C80 56, 68 54, 62 62 C70 70, 80 72, 86 72 Z"
      fill="#22C55E"
      stroke="#166534"
      strokeWidth="1.2"
    />
    <path
      d="M102 50 C118 36, 134 42, 140 52 C125 60, 110 58, 102 50 Z"
      fill="#A3E635"
      stroke="#166534"
      strokeWidth="1.2"
    />
    <path
      d="M125 30 C138 18, 152 22, 156 30 C144 38, 132 36, 125 30 Z"
      fill="#22C55E"
      stroke="#166534"
      strokeWidth="1.1"
    />

    {/* Tiny floral sprig bud */}
    <circle cx="118" cy="22" r="3" fill="#A3E635" stroke="#166534" strokeWidth="0.8" />
  </svg>
);

// 2. Food Waste Audit Motif: Ceramic plate with delicate herb sprigs
const FoodWastePlateMotif: React.FC = () => (
  <svg
    viewBox="0 0 180 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-32 h-32 sm:w-36 sm:h-36 mx-auto group-hover:scale-105 transition-transform duration-300"
    aria-hidden="true"
  >
    <circle cx="90" cy="90" r="72" stroke="#DCEBDD" strokeWidth="1" strokeDasharray="3 3" />
    <circle cx="90" cy="90" r="58" fill="#FFFFFF" stroke="#DCEBDD" strokeWidth="2" />
    <circle cx="90" cy="90" r="44" stroke="#E8F5E9" strokeWidth="1.2" strokeDasharray="2 2" />

    {/* Herb sprig resting on plate */}
    <path
      d="M50 125 C65 105, 82 85, 110 65 C124 55, 136 50, 145 46"
      stroke="#166534"
      strokeWidth="2.2"
      strokeLinecap="round"
    />

    <path d="M68 108 C60 102, 54 108, 52 114 C62 116, 68 112, 68 108 Z" fill="#22C55E" stroke="#166534" strokeWidth="1.1" />
    <path d="M78 96 C84 88, 92 90, 94 96 C88 100, 80 98, 78 96 Z" fill="#A3E635" stroke="#166534" strokeWidth="1.1" />
    <path d="M90 84 C80 78, 74 84, 72 90 C82 92, 88 88, 90 84 Z" fill="#22C55E" stroke="#166534" strokeWidth="1.1" />
    <path d="M102 74 C110 66, 118 68, 120 74 C112 78, 104 76, 102 74 Z" fill="#A3E635" stroke="#166534" strokeWidth="1.1" />
    <path d="M118 62 C110 56, 106 60, 104 66 C114 68, 118 64, 118 62 Z" fill="#22C55E" stroke="#166534" strokeWidth="1.1" />
    <path d="M130 54 C136 46, 144 48, 146 54 C138 58, 132 56, 130 54 Z" fill="#A3E635" stroke="#166534" strokeWidth="1" />

    <path
      d="M72 130 C76 112, 82 95, 96 82"
      stroke="#14532D"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path d="M80 114 C88 108, 92 114, 90 120 C82 122, 78 118, 80 114 Z" fill="#22C55E" stroke="#14532D" strokeWidth="1" />
    <path d="M88 98 C96 92, 102 96, 100 102 C92 104, 88 100, 88 98 Z" fill="#A3E635" stroke="#14532D" strokeWidth="1" />

    <g transform="translate(142, 48)">
      <circle cx="0" cy="-4" r="2.8" fill="#FCE9EB" stroke="#CCA0A6" strokeWidth="0.6" />
      <circle cx="-4" cy="0" r="2.8" fill="#FCE9EB" stroke="#CCA0A6" strokeWidth="0.6" />
      <circle cx="4" cy="0" r="2.8" fill="#FCE9EB" stroke="#CCA0A6" strokeWidth="0.6" />
      <circle cx="0" cy="4" r="2.8" fill="#FCE9EB" stroke="#CCA0A6" strokeWidth="0.6" />
      <circle cx="0" cy="0" r="2" fill="#A3E635" stroke="#166534" strokeWidth="0.6" />
    </g>
  </svg>
);

// 3. Smart Mess Predictor Motif: Harvest grain stalk with emerging tender seedling
const MessPredictorSeedlingMotif: React.FC = () => (
  <svg
    viewBox="0 0 180 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-32 h-32 sm:w-36 sm:h-36 mx-auto group-hover:scale-105 transition-transform duration-300"
    aria-hidden="true"
  >
    <circle cx="90" cy="90" r="72" stroke="#DCEBDD" strokeWidth="1" strokeDasharray="3 3" />

    <path
      d="M58 145 C75 125, 95 95, 116 55 C122 42, 128 32, 134 22"
      stroke="#166534"
      strokeWidth="2.2"
      strokeLinecap="round"
    />

    <path d="M82 115 C72 108, 70 96, 80 94 C90 98, 88 110, 82 115 Z" fill="#ECD58E" stroke="#166534" strokeWidth="1.2" />
    <path d="M92 104 C104 106, 110 96, 106 88 C96 92, 92 100, 92 104 Z" fill="#DFBE6F" stroke="#166534" strokeWidth="1.2" />
    <path d="M96 90 C86 82, 84 72, 94 70 C104 74, 102 86, 96 90 Z" fill="#ECD58E" stroke="#166534" strokeWidth="1.2" />
    <path d="M106 80 C118 82, 122 72, 118 64 C108 68, 104 76, 106 80 Z" fill="#DFBE6F" stroke="#166534" strokeWidth="1.2" />
    <path d="M112 66 C102 58, 102 48, 110 46 C120 50, 118 62, 112 66 Z" fill="#ECD58E" stroke="#166534" strokeWidth="1.2" />
    <path d="M120 54 C130 56, 134 46, 130 38 C120 42, 118 50, 120 54 Z" fill="#F4E2A8" stroke="#166534" strokeWidth="1.2" />
    <path d="M134 22 L146 10" stroke="#166534" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M130 26 L144 20" stroke="#166534" strokeWidth="1" strokeLinecap="round" />

    <path
      d="M58 145 C64 125, 66 108, 66 98"
      stroke="#166534"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M66 104 C52 98, 44 104, 42 114 C52 118, 62 114, 66 104 Z"
      fill="#22C55E"
      stroke="#166534"
      strokeWidth="1.2"
    />
    <path
      d="M66 100 C76 90, 88 92, 90 102 C80 106, 72 102, 66 100 Z"
      fill="#A3E635"
      stroke="#166534"
      strokeWidth="1.2"
    />
    <path
      d="M66 98 C64 90, 66 84, 68 80 C70 86, 68 94, 66 98 Z"
      fill="#22C55E"
      stroke="#166534"
      strokeWidth="1"
    />
  </svg>
);

export const FunctionalitySelection: React.FC<FunctionalitySelectionProps> = ({
  onSelectOption,
  onBackToHome,
}) => {
  return (
    <div className="min-h-screen bg-[#F5FBF5] text-[#1F2937] flex flex-col relative overflow-x-hidden selection:bg-[#166534] selection:text-white">
      {/* Animated Botanical Background */}
      <BotanicalBackground variant="selection" />
      <BotanicalJournalTexture />

      {/* Decorative Botanical Framing in Margins */}
      <HeroBotanicalFramingLeft 
        className="absolute -top-12 -left-12 sm:-left-6 w-64 sm:w-80 lg:w-[420px] h-auto pointer-events-none z-0" 
        opacity={0.7} 
      />
      <HeroBotanicalFramingRight 
        className="absolute -top-12 -right-12 sm:-right-6 w-64 sm:w-80 lg:w-[420px] h-auto pointer-events-none z-0" 
        opacity={0.7} 
      />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-2 text-left group cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#22C55E] rounded-xl p-1"
            title="Return to EcoPulse Home"
          >
            <div className="w-9 h-9 rounded-xl bg-[#166534] text-white flex items-center justify-center shadow-xs">
              <Leaf className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#14532D]">
              EcoPulse
            </span>
          </button>
        </div>

        <button
          onClick={onBackToHome}
          className="inline-flex items-center space-x-2 text-xs sm:text-sm font-semibold text-[#166534] hover:text-[#14532D] px-4 py-2 min-h-[44px] rounded-xl border border-[#DCEBDD] bg-white hover:bg-[#E8F5E9] transition-all shadow-2xs focus:ring-2 focus:ring-[#22C55E] cursor-pointer touch-manipulation"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>
      </header>

      {/* Main Spacious Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center relative z-10">
        
        {/* Title Section */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3 animate-hero-entrance">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#E8F5E9] border border-[#DCEBDD] text-[#166534] text-xs sm:text-sm font-semibold shadow-2xs">
            <SproutingSeedling className="w-3.5 h-3.5 text-[#22C55E]" opacity={0.9} />
            <span>Workspace Selection</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-[#14532D] tracking-tight leading-[1.12]">
            What would you like to improve?
          </h1>

          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
            Choose an area to explore your campus’s sustainability workflows.
          </p>
        </div>

        {/* 3-Column Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          
          {/* Option 1: Campus Energy */}
          <button
            onClick={() => onSelectOption('MAP')}
            className="group text-left p-7 sm:p-8 rounded-3xl bg-white border border-[#DCEBDD] hover:border-[#22C55E] hover:shadow-card hover:-translate-y-1.5 focus:ring-3 focus:ring-[#22C55E] focus:outline-hidden transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
            aria-label="Campus Energy: Find simulated energy leaks and estimate avoidable consumption"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#22C55E] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              <div className="mb-6 p-5 rounded-2xl bg-[#F5FBF5] border border-[#DCEBDD] flex items-center justify-center">
                <CampusEnergyMotif />
              </div>

              <div className="space-y-2 mb-6">
                <h2 className="font-serif text-2xl sm:text-[26px] font-bold text-[#14532D] group-hover:text-[#166534] transition-colors leading-tight">
                  Campus Energy
                </h2>
                <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                  Find simulated energy leaks, estimate avoidable consumption, and resolve off-hours draw.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#DCEBDD] flex items-center justify-between text-xs sm:text-sm font-semibold text-[#166534] group-hover:text-[#14532D]">
              <span>Explore Energy Monitor</span>
              <div className="w-8 h-8 rounded-full bg-[#E8F5E9] group-hover:bg-[#166534] group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>

          {/* Option 2: Food Waste Audit */}
          <button
            onClick={() => onSelectOption('SCANNER')}
            className="group text-left p-7 sm:p-8 rounded-3xl bg-white border border-[#DCEBDD] hover:border-[#22C55E] hover:shadow-card hover:-translate-y-1.5 focus:ring-3 focus:ring-[#22C55E] focus:outline-hidden transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
            aria-label="Food Waste Audit: Estimate leftover food and its environmental impact"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#22C55E] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              <div className="mb-6 p-5 rounded-2xl bg-[#F5FBF5] border border-[#DCEBDD] flex items-center justify-center">
                <FoodWastePlateMotif />
              </div>

              <div className="space-y-2 mb-6">
                <h2 className="font-serif text-2xl sm:text-[26px] font-bold text-[#14532D] group-hover:text-[#166534] transition-colors leading-tight">
                  Food Waste Audit
                </h2>
                <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                  Upload plate photos or select presets to analyze food leftovers with Gemini Vision.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#DCEBDD] flex items-center justify-between text-xs sm:text-sm font-semibold text-[#166534] group-hover:text-[#14532D]">
              <span>Run Plate Audit</span>
              <div className="w-8 h-8 rounded-full bg-[#E8F5E9] group-hover:bg-[#166534] group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>

          {/* Option 3: Smart Mess Predictor */}
          <button
            onClick={() => onSelectOption('MESS')}
            className="group text-left p-7 sm:p-8 rounded-3xl bg-white border border-[#DCEBDD] hover:border-[#22C55E] hover:shadow-card hover:-translate-y-1.5 focus:ring-3 focus:ring-[#22C55E] focus:outline-hidden transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
            aria-label="Smart Mess Predictor: Forecast meal demand and estimate avoidable overproduction"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#22C55E] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              <div className="mb-6 p-5 rounded-2xl bg-[#F5FBF5] border border-[#DCEBDD] flex items-center justify-center">
                <MessPredictorSeedlingMotif />
              </div>

              <div className="space-y-2 mb-6">
                <h2 className="font-serif text-2xl sm:text-[26px] font-bold text-[#14532D] group-hover:text-[#166534] transition-colors leading-tight">
                  Smart Mess Predictor
                </h2>
                <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                  Forecast hostel meal turnout and adjust cooking with a 5% kitchen safety margin.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#DCEBDD] flex items-center justify-between text-xs sm:text-sm font-semibold text-[#166534] group-hover:text-[#14532D]">
              <span>Open Mess Predictor</span>
              <div className="w-8 h-8 rounded-full bg-[#E8F5E9] group-hover:bg-[#166534] group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>

        </div>

        {/* Supporting Module: Green Cup & Activity Ledger */}
        <div className="mt-8 sm:mt-10 max-w-xl mx-auto w-full text-center">
          <button
            onClick={() => onSelectOption('LEADERBOARD')}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-white border border-[#DCEBDD] hover:border-[#22C55E] hover:bg-[#E8F5E9]/50 text-xs sm:text-sm font-semibold text-[#166534] transition-all shadow-2xs group cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-[#22C55E] group-hover:scale-110 transition-transform" />
            <span>View Department Green Cup Standings & Activity Ledger</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </main>

      {/* Minimal Bottom Margin */}
      <footer className="py-6 text-center text-xs text-[#64748B] relative z-10">
        <p>EcoPulse • Campus Sustainability Decision Support System</p>
      </footer>
    </div>
  );
};
