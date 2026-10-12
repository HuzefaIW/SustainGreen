import React from 'react';
import { Leaf, ArrowLeft, ArrowRight } from 'lucide-react';
import { 
  BotanicalJournalTexture, 
  HeroBotanicalFramingLeft, 
  HeroBotanicalFramingRight,
  WildflowerSprig,
  SproutingSeedling
} from '../common/BotanicalElements';

interface FunctionalitySelectionProps {
  onSelectOption: (tab: 'MAP' | 'SCANNER' | 'MESS') => void;
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
    <circle cx="90" cy="90" r="72" stroke="#E2EADF" strokeWidth="1" strokeDasharray="3 3" />
    
    {/* Intertwined electricity path */}
    <path
      d="M96 28 L72 82 L98 82 L82 148 L122 78 L94 78 Z"
      fill="#FDF8E4"
      stroke="#C99826"
      strokeWidth="2.2"
      strokeLinejoin="round"
      strokeLinecap="round"
      className="drop-shadow-xs"
    />

    {/* Primary leafy branch curving through and wrapping the lightning */}
    <path
      d="M42 144 C55 118, 70 85, 90 60 C110 35, 128 25, 142 20"
      stroke="#2D4626"
      strokeWidth="2.4"
      strokeLinecap="round"
    />

    {/* Leaves wrapping around electricity */}
    {/* Leaf 1 */}
    <path
      d="M56 122 C42 115, 34 125, 30 134 C42 136, 52 130, 56 122 Z"
      fill="#AECDA7"
      stroke="#2D4626"
      strokeWidth="1.2"
    />
    {/* Leaf 2 */}
    <path
      d="M70 102 C68 85, 54 82, 46 88 C48 100, 60 105, 70 102 Z"
      fill="#9EC296"
      stroke="#2D4626"
      strokeWidth="1.2"
    />
    {/* Leaf 3 crossing behind upper bolt */}
    <path
      d="M86 72 C80 56, 68 54, 62 62 C70 70, 80 72, 86 72 Z"
      fill="#BED8BA"
      stroke="#2D4626"
      strokeWidth="1.2"
    />
    {/* Leaf 4 curving outward */}
    <path
      d="M102 50 C118 36, 134 42, 140 52 C125 60, 110 58, 102 50 Z"
      fill="#AECDA7"
      stroke="#2D4626"
      strokeWidth="1.2"
    />
    {/* Leaf 5 at the apex */}
    <path
      d="M125 30 C138 18, 152 22, 156 30 C144 38, 132 36, 125 30 Z"
      fill="#CBE0C7"
      stroke="#2D4626"
      strokeWidth="1.1"
    />

    {/* Tiny floral sprig bud */}
    <circle cx="118" cy="22" r="3" fill="#F8EFA6" stroke="#C4A832" strokeWidth="0.8" />
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
    {/* Subtle circular botanical halo */}
    <circle cx="90" cy="90" r="72" stroke="#E2EADF" strokeWidth="1" strokeDasharray="3 3" />

    {/* Elegant plate rims */}
    <circle cx="90" cy="90" r="58" fill="#FFFFFF" stroke="#D3DFCF" strokeWidth="2" />
    <circle cx="90" cy="90" r="44" stroke="#E3ECE0" strokeWidth="1.2" strokeDasharray="2 2" />

    {/* Delicate Rosemary / Thyme herb sprig resting on plate */}
    <path
      d="M50 125 C65 105, 82 85, 110 65 C124 55, 136 50, 145 46"
      stroke="#2D4626"
      strokeWidth="2.2"
      strokeLinecap="round"
    />

    {/* Slender herb leaves */}
    <path d="M68 108 C60 102, 54 108, 52 114 C62 116, 68 112, 68 108 Z" fill="#9EC296" stroke="#2D4626" strokeWidth="1.1" />
    <path d="M78 96 C84 88, 92 90, 94 96 C88 100, 80 98, 78 96 Z" fill="#B7D2B1" stroke="#2D4626" strokeWidth="1.1" />
    <path d="M90 84 C80 78, 74 84, 72 90 C82 92, 88 88, 90 84 Z" fill="#9EC296" stroke="#2D4626" strokeWidth="1.1" />
    <path d="M102 74 C110 66, 118 68, 120 74 C112 78, 104 76, 102 74 Z" fill="#B7D2B1" stroke="#2D4626" strokeWidth="1.1" />
    <path d="M118 62 C110 56, 106 60, 104 66 C114 68, 118 64, 118 62 Z" fill="#9EC296" stroke="#2D4626" strokeWidth="1.1" />
    <path d="M130 54 C136 46, 144 48, 146 54 C138 58, 132 56, 130 54 Z" fill="#CBE0C7" stroke="#2D4626" strokeWidth="1" />

    {/* Secondary curving mint/sage sprig */}
    <path
      d="M72 130 C76 112, 82 95, 96 82"
      stroke="#3F5A37"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path d="M80 114 C88 108, 92 114, 90 120 C82 122, 78 118, 80 114 Z" fill="#A8C9A2" stroke="#3F5A37" strokeWidth="1" />
    <path d="M88 98 C96 92, 102 96, 100 102 C92 104, 88 100, 88 98 Z" fill="#C5DDC0" stroke="#3F5A37" strokeWidth="1" />

    {/* Delicate blush wildflower accent */}
    <g transform="translate(142, 48)">
      <circle cx="0" cy="-4" r="2.8" fill="#FCE9EB" stroke="#CCA0A6" strokeWidth="0.6" />
      <circle cx="-4" cy="0" r="2.8" fill="#FCE9EB" stroke="#CCA0A6" strokeWidth="0.6" />
      <circle cx="4" cy="0" r="2.8" fill="#FCE9EB" stroke="#CCA0A6" strokeWidth="0.6" />
      <circle cx="0" cy="4" r="2.8" fill="#FCE9EB" stroke="#CCA0A6" strokeWidth="0.6" />
      <circle cx="0" cy="0" r="2" fill="#F6E79D" stroke="#A8943B" strokeWidth="0.6" />
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
    {/* Subtle circular botanical halo */}
    <circle cx="90" cy="90" r="72" stroke="#E2EADF" strokeWidth="1" strokeDasharray="3 3" />

    {/* Harvest grain ear stalk */}
    <path
      d="M58 145 C75 125, 95 95, 116 55 C122 42, 128 32, 134 22"
      stroke="#686333"
      strokeWidth="2.2"
      strokeLinecap="round"
    />

    {/* Golden Wheat Spikelets */}
    <path d="M82 115 C72 108, 70 96, 80 94 C90 98, 88 110, 82 115 Z" fill="#ECD58E" stroke="#7A7032" strokeWidth="1.2" />
    <path d="M92 104 C104 106, 110 96, 106 88 C96 92, 92 100, 92 104 Z" fill="#DFBE6F" stroke="#7A7032" strokeWidth="1.2" />
    <path d="M96 90 C86 82, 84 72, 94 70 C104 74, 102 86, 96 90 Z" fill="#ECD58E" stroke="#7A7032" strokeWidth="1.2" />
    <path d="M106 80 C118 82, 122 72, 118 64 C108 68, 104 76, 106 80 Z" fill="#DFBE6F" stroke="#7A7032" strokeWidth="1.2" />
    <path d="M112 66 C102 58, 102 48, 110 46 C120 50, 118 62, 112 66 Z" fill="#ECD58E" stroke="#7A7032" strokeWidth="1.2" />
    <path d="M120 54 C130 56, 134 46, 130 38 C120 42, 118 50, 120 54 Z" fill="#F4E2A8" stroke="#7A7032" strokeWidth="1.2" />
    {/* Wheat terminal awns */}
    <path d="M134 22 L146 10" stroke="#7A7032" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M130 26 L144 20" stroke="#7A7032" strokeWidth="1" strokeLinecap="round" />

    {/* Tender fresh green seedling shoot emerging from the base */}
    <path
      d="M58 145 C64 125, 66 108, 66 98"
      stroke="#2D4626"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Left rounded cotyledon */}
    <path
      d="M66 104 C52 98, 44 104, 42 114 C52 118, 62 114, 66 104 Z"
      fill="#A8C9A2"
      stroke="#2D4626"
      strokeWidth="1.2"
    />
    {/* Right cotyledon */}
    <path
      d="M66 100 C76 90, 88 92, 90 102 C80 106, 72 102, 66 100 Z"
      fill="#96BD8F"
      stroke="#2D4626"
      strokeWidth="1.2"
    />
    {/* Tender shoot tip */}
    <path
      d="M66 98 C64 90, 66 84, 68 80 C70 86, 68 94, 66 98 Z"
      fill="#D2E8CB"
      stroke="#2D4626"
      strokeWidth="1"
    />
  </svg>
);

export const FunctionalitySelection: React.FC<FunctionalitySelectionProps> = ({
  onSelectOption,
  onBackToHome,
}) => {
  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#191C1A] flex flex-col relative overflow-x-hidden selection:bg-[#284635] selection:text-white">
      {/* Subtle Botanical Paper Journal Texture */}
      <BotanicalJournalTexture />

      {/* Decorative Botanical Framing in the Margins */}
      <HeroBotanicalFramingLeft 
        className="absolute -top-12 -left-12 sm:-left-6 w-64 sm:w-80 lg:w-[420px] h-auto pointer-events-none z-0" 
        opacity={0.7} 
      />
      <HeroBotanicalFramingRight 
        className="absolute -top-12 -right-12 sm:-right-6 w-64 sm:w-80 lg:w-[420px] h-auto pointer-events-none z-0" 
        opacity={0.7} 
      />

      {/* Top Header Bar: Logo & Simple Back-to-Home */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-2 text-left group cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#1B3826] rounded-lg p-1"
            title="Return to EcoPulse Home"
          >
            <div className="w-8 h-8 rounded-xl bg-[#1B3826] text-[#E8EFE5] flex items-center justify-center shadow-xs">
              <Leaf className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-[#191C1A]">
              EcoPulse
            </span>
          </button>
        </div>

        <button
          onClick={onBackToHome}
          className="inline-flex items-center space-x-2 text-sm font-medium text-[#486340] hover:text-[#1B3826] px-3.5 py-1.5 rounded-xl border border-[#D5E0D2] bg-[#FFFFFF]/80 hover:bg-[#F2EFE5] transition-colors shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-[#1B3826]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>
      </header>

      {/* Main Spacious Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-14 flex flex-col justify-center relative z-10">
        
        {/* Title Section */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#E5EFE2] border border-[#BFDBB7] text-[#24421E] text-xs sm:text-sm font-medium shadow-2xs">
            <SproutingSeedling className="w-3.5 h-3.5 text-[#355C2A]" opacity={0.9} />
            <span>Workspace Selection</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-[#191C1A] tracking-tight leading-[1.12]">
            What would you like to improve?
          </h1>

          <p className="text-base sm:text-lg text-[#4E6148] leading-relaxed">
            Choose an area to explore your campus’s sustainability.
          </p>
        </div>

        {/* 3-Column Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          
          {/* Option 1: Campus Energy */}
          <button
            onClick={() => onSelectOption('MAP')}
            className="group text-left p-7 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#CADBC4] hover:border-[#6C9461] hover:shadow-lg focus:ring-3 focus:ring-[#1B3826] focus:outline-hidden transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 cursor-pointer relative overflow-hidden"
            aria-label="Campus Energy: Find simulated energy leaks and estimate avoidable consumption"
          >
            {/* Subtle top indicator bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#86B07E] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              {/* Botanical Illustration */}
              <div className="mb-6 p-4 rounded-2xl bg-[#F7F5EC] border border-[#E5EBDD] flex items-center justify-center">
                <CampusEnergyMotif />
              </div>

              {/* Title & Description */}
              <div className="space-y-2 mb-6">
                <h2 className="font-serif text-2xl sm:text-[26px] font-bold text-[#1B3826] group-hover:text-[#112318] transition-colors leading-tight">
                  Campus Energy
                </h2>
                <p className="text-sm sm:text-base text-[#465540] leading-relaxed">
                  Find simulated energy leaks and estimate avoidable consumption.
                </p>
              </div>
            </div>

            {/* Bottom Action Indicator */}
            <div className="pt-4 border-t border-[#EEF4EC] flex items-center justify-between text-xs sm:text-sm font-semibold text-[#1B3826] group-hover:text-[#142C1E]">
              <span>Explore Energy Monitor</span>
              <div className="w-8 h-8 rounded-full bg-[#EAF2E7] group-hover:bg-[#1B3826] group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>

          {/* Option 2: Food Waste Audit */}
          <button
            onClick={() => onSelectOption('SCANNER')}
            className="group text-left p-7 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#CADBC4] hover:border-[#6C9461] hover:shadow-lg focus:ring-3 focus:ring-[#1B3826] focus:outline-hidden transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 cursor-pointer relative overflow-hidden"
            aria-label="Food Waste Audit: Estimate leftover food and its environmental impact"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#86B07E] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              {/* Botanical Illustration */}
              <div className="mb-6 p-4 rounded-2xl bg-[#F7F5EC] border border-[#E5EBDD] flex items-center justify-center">
                <FoodWastePlateMotif />
              </div>

              {/* Title & Description */}
              <div className="space-y-2 mb-6">
                <h2 className="font-serif text-2xl sm:text-[26px] font-bold text-[#1B3826] group-hover:text-[#112318] transition-colors leading-tight">
                  Food Waste Audit
                </h2>
                <p className="text-sm sm:text-base text-[#465540] leading-relaxed">
                  Estimate leftover food and its environmental impact.
                </p>
              </div>
            </div>

            {/* Bottom Action Indicator */}
            <div className="pt-4 border-t border-[#EEF4EC] flex items-center justify-between text-xs sm:text-sm font-semibold text-[#1B3826] group-hover:text-[#142C1E]">
              <span>Run Plate Audit</span>
              <div className="w-8 h-8 rounded-full bg-[#EAF2E7] group-hover:bg-[#1B3826] group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>

          {/* Option 3: Smart Mess Predictor */}
          <button
            onClick={() => onSelectOption('MESS')}
            className="group text-left p-7 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#CADBC4] hover:border-[#6C9461] hover:shadow-lg focus:ring-3 focus:ring-[#1B3826] focus:outline-hidden transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 cursor-pointer relative overflow-hidden"
            aria-label="Smart Mess Predictor: Forecast meal demand and estimate avoidable overproduction"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#86B07E] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              {/* Botanical Illustration */}
              <div className="mb-6 p-4 rounded-2xl bg-[#F7F5EC] border border-[#E5EBDD] flex items-center justify-center">
                <MessPredictorSeedlingMotif />
              </div>

              {/* Title & Description */}
              <div className="space-y-2 mb-6">
                <h2 className="font-serif text-2xl sm:text-[26px] font-bold text-[#1B3826] group-hover:text-[#112318] transition-colors leading-tight">
                  Smart Mess Predictor
                </h2>
                <p className="text-sm sm:text-base text-[#465540] leading-relaxed">
                  Forecast meal demand and estimate avoidable overproduction.
                </p>
              </div>
            </div>

            {/* Bottom Action Indicator */}
            <div className="pt-4 border-t border-[#EEF4EC] flex items-center justify-between text-xs sm:text-sm font-semibold text-[#1B3826] group-hover:text-[#142C1E]">
              <span>Open Mess Predictor</span>
              <div className="w-8 h-8 rounded-full bg-[#EAF2E7] group-hover:bg-[#1B3826] group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>

        </div>

      </main>

      {/* Minimal Bottom Margin */}
      <footer className="py-6 text-center text-xs text-[#6B7E65] relative z-10">
        <p>EcoPulse • Campus Sustainability Decision Support System</p>
      </footer>
    </div>
  );
};
