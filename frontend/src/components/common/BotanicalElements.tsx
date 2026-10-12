import React from 'react';

/**
 * Modern Botanical Editorial Elements for EcoPulse.
 * Multi-layered greenery, large framing branches, feature-specific plant emblems,
 * and delicate flowering sprigs.
 * Strictly non-interactive (pointer-events-none, aria-hidden).
 */

interface BotanicalProps {
  className?: string;
  opacity?: number;
}

// 1. Large Layered Botanical Framing - Top-Left Corner & Edge
export const HeroBotanicalFramingLeft: React.FC<BotanicalProps> = ({
  className = '',
  opacity = 0.85,
}) => (
  <svg
    viewBox="0 0 380 440"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pointer-events-none select-none ${className}`}
    style={{ opacity }}
    aria-hidden="true"
  >
    {/* LAYER 1: Large Pale Sage Silhouette in the background */}
    <g opacity="0.45">
      {/* Broad eucalyptus leaf silhouette */}
      <path
        d="M-40 -20 C20 40, 60 120, 80 210 C95 270, 70 330, 40 370 C20 330, 10 250, 0 170 C-10 100, -30 40, -40 -20 Z"
        fill="#D6E6D2"
      />
      {/* Upper pale fern leaf silhouette */}
      <path
        d="M20 -30 C90 10, 150 70, 190 150 C170 160, 140 140, 120 120 C90 80, 50 40, 20 -30 Z"
        fill="#E0ECE0"
      />
    </g>

    {/* LAYER 2: Midground Olive & Fern foliage */}
    <g opacity="0.75">
      {/* Fern Rachis */}
      <path
        d="M-20 60 C40 100, 110 160, 155 240 C170 270, 180 310, 185 350"
        stroke="#4E6845"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Fern Leaflets */}
      <path d="M25 90 C45 78, 65 82, 75 92 C60 100, 40 98, 25 90 Z" fill="#C5DDC0" stroke="#486340" strokeWidth="1" />
      <path d="M48 115 C75 102, 98 108, 110 120 C90 130, 65 126, 48 115 Z" fill="#B7D2B1" stroke="#486340" strokeWidth="1" />
      <path d="M72 145 C105 130, 130 138, 142 152 C120 162, 95 158, 72 145 Z" fill="#C5DDC0" stroke="#486340" strokeWidth="1" />
      <path d="M96 180 C132 165, 160 174, 172 190 C148 200, 120 195, 96 180 Z" fill="#B7D2B1" stroke="#486340" strokeWidth="1.1" />
      <path d="M118 220 C154 205, 180 215, 192 232 C168 242, 140 236, 118 220 Z" fill="#C5DDC0" stroke="#486340" strokeWidth="1.1" />
      <path d="M138 265 C170 252, 195 262, 204 278 C182 288, 158 280, 138 265 Z" fill="#B7D2B1" stroke="#486340" strokeWidth="1.1" />

      {/* Downward branch */}
      <path
        d="M60 130 C40 180, 15 240, -10 290"
        stroke="#5A7550"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M45 160 C25 155, 10 165, 5 178 C20 180, 35 172, 45 160 Z" fill="#CBE0C7" stroke="#486340" strokeWidth="0.9" />
      <path d="M30 200 C10 195, -5 205, -10 218 C5 220, 20 212, 30 200 Z" fill="#BED8BA" stroke="#486340" strokeWidth="0.9" />
    </g>

    {/* LAYER 3: Sharp foreground botanical branch with delicate blossoms */}
    <g>
      {/* Arching foreground stem */}
      <path
        d="M-30 10 C50 30, 140 70, 210 140 C255 190, 280 250, 295 320"
        stroke="#2D4626"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Leaf Pair 1 (Top) */}
      <path
        d="M40 25 C60 5, 90 8, 100 24 C85 38, 55 35, 40 25 Z"
        fill="#AECDA7"
        stroke="#2D4626"
        strokeWidth="1.2"
      />
      <path d="M40 25 C65 18, 85 18, 100 24" stroke="#2D4626" strokeWidth="0.8" />

      {/* Leaf Pair 2 */}
      <path
        d="M95 50 C125 30, 155 38, 168 58 C148 72, 115 68, 95 50 Z"
        fill="#9EC296"
        stroke="#2D4626"
        strokeWidth="1.3"
      />
      <path d="M95 50 C128 44, 150 48, 168 58" stroke="#2D4626" strokeWidth="0.9" />

      {/* Leaf Pair 3 (Lower edge) */}
      <path
        d="M130 82 C135 110, 120 135, 100 142 C92 125, 105 98, 130 82 Z"
        fill="#AECDA7"
        stroke="#2D4626"
        strokeWidth="1.2"
      />

      {/* Outward leafy cluster */}
      <path
        d="M165 105 C205 85, 240 96, 254 120 C230 136, 190 130, 165 105 Z"
        fill="#9EC296"
        stroke="#2D4626"
        strokeWidth="1.4"
      />
      <path d="M165 105 C205 98, 230 106, 254 120" stroke="#2D4626" strokeWidth="0.9" />

      {/* Side twig with delicate wildflowers */}
      <path
        d="M205 136 C240 140, 275 160, 298 185"
        stroke="#3F5A37"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Butter-yellow wild blossom */}
      <g transform="translate(300, 188)">
        <circle cx="0" cy="-6" r="4.5" fill="#FBF3BE" stroke="#D1BE5E" strokeWidth="0.8" />
        <circle cx="-6" cy="-1" r="4.2" fill="#FCE9EB" stroke="#CCA0A6" strokeWidth="0.8" />
        <circle cx="6" cy="-1" r="4.2" fill="#FCE9EB" stroke="#CCA0A6" strokeWidth="0.8" />
        <circle cx="-4" cy="5" r="4" fill="#FBF3BE" stroke="#D1BE5E" strokeWidth="0.8" />
        <circle cx="4" cy="5" r="4" fill="#FBF3BE" stroke="#D1BE5E" strokeWidth="0.8" />
        <circle cx="0" cy="0" r="2.8" fill="#E8D56A" stroke="#9A8528" strokeWidth="0.8" />
      </g>

      {/* Mid-stem leaf */}
      <path
        d="M232 170 C272 175, 298 205, 302 225 C275 235, 245 212, 232 170 Z"
        fill="#A6C89E"
        stroke="#2D4626"
        strokeWidth="1.3"
      />

      {/* Lower flower bud */}
      <g transform="translate(265, 250)">
        <circle cx="0" cy="0" r="3.2" fill="#FBF3BE" stroke="#D1BE5E" strokeWidth="0.7" />
        <circle cx="-3" cy="-2" r="2.5" fill="#FCE9EB" stroke="#D19DA3" strokeWidth="0.6" />
      </g>

      {/* Leaf near bottom */}
      <path
        d="M260 210 C290 230, 310 265, 308 288 C285 290, 268 260, 260 210 Z"
        fill="#94BB8C"
        stroke="#2D4626"
        strokeWidth="1.3"
      />
      <path
        d="M280 270 C310 300, 320 338, 312 355 C295 348, 285 320, 280 270 Z"
        fill="#A6C89E"
        stroke="#2D4626"
        strokeWidth="1.2"
      />
    </g>
  </svg>
);

// 2. Large Layered Botanical Framing - Top-Right Corner & Edge
export const HeroBotanicalFramingRight: React.FC<BotanicalProps> = ({
  className = '',
  opacity = 0.85,
}) => (
  <svg
    viewBox="0 0 380 440"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pointer-events-none select-none ${className}`}
    style={{ opacity }}
    aria-hidden="true"
  >
    {/* LAYER 1: Large Pale Sage Silhouettes */}
    <g opacity="0.45">
      <path
        d="M420 -30 C340 20, 260 80, 210 160 C170 230, 160 310, 190 380 C240 330, 300 240, 350 150 C380 90, 410 20, 420 -30 Z"
        fill="#D6E6D2"
      />
      <path
        d="M340 -40 C280 30, 220 90, 140 130 C160 145, 200 135, 230 115 C280 80, 320 20, 340 -40 Z"
        fill="#E0ECE0"
      />
    </g>

    {/* LAYER 2: Midground Foliage */}
    <g opacity="0.75">
      <path
        d="M380 40 C310 90, 230 160, 170 240 C140 280, 120 330, 110 380"
        stroke="#4E6845"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M330 75 C305 60, 280 65, 268 76 C285 86, 310 84, 330 75 Z" fill="#C5DDC0" stroke="#486340" strokeWidth="1" />
      <path d="M295 110 C265 92, 235 100, 220 114 C245 125, 275 122, 295 110 Z" fill="#B7D2B1" stroke="#486340" strokeWidth="1.1" />
      <path d="M255 150 C218 132, 185 142, 170 158 C200 170, 232 165, 255 150 Z" fill="#C5DDC0" stroke="#486340" strokeWidth="1.1" />
      <path d="M215 198 C175 180, 140 192, 124 210 C154 222, 190 216, 215 198 Z" fill="#B7D2B1" stroke="#486340" strokeWidth="1.1" />
      <path d="M175 250 C140 232, 110 245, 96 264 C124 275, 154 268, 175 250 Z" fill="#C5DDC0" stroke="#486340" strokeWidth="1.1" />
    </g>

    {/* LAYER 3: Sharp Foreground Branch with Wildflowers */}
    <g>
      <path
        d="M400 0 C320 25, 220 80, 140 160 C90 220, 60 290, 45 365"
        stroke="#2D4626"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Leaf 1 */}
      <path
        d="M340 18 C315 -2, 280 2, 270 20 C288 32, 320 30, 340 18 Z"
        fill="#AECDA7"
        stroke="#2D4626"
        strokeWidth="1.2"
      />
      {/* Leaf 2 */}
      <path
        d="M285 45 C250 22, 215 32, 200 54 C222 68, 260 62, 285 45 Z"
        fill="#9EC296"
        stroke="#2D4626"
        strokeWidth="1.3"
      />
      <path d="M285 45 C250 38, 225 42, 200 54" stroke="#2D4626" strokeWidth="0.8" />

      {/* Leaf 3 */}
      <path
        d="M245 78 C238 108, 255 132, 278 138 C285 120, 270 92, 245 78 Z"
        fill="#AECDA7"
        stroke="#2D4626"
        strokeWidth="1.2"
      />

      {/* Leaf 4 */}
      <path
        d="M208 102 C165 80, 125 92, 110 118 C135 134, 180 126, 208 102 Z"
        fill="#9EC296"
        stroke="#2D4626"
        strokeWidth="1.4"
      />

      {/* Flowering side twig */}
      <path
        d="M165 140 C125 145, 85 168, 58 195"
        stroke="#3F5A37"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Delicate floral cluster */}
      <g transform="translate(56, 198)">
        <circle cx="0" cy="-6" r="4.5" fill="#FBF3BE" stroke="#D1BE5E" strokeWidth="0.8" />
        <circle cx="-6" cy="-1" r="4.2" fill="#FCE9EB" stroke="#CCA0A6" strokeWidth="0.8" />
        <circle cx="6" cy="-1" r="4.2" fill="#FCE9EB" stroke="#CCA0A6" strokeWidth="0.8" />
        <circle cx="-4" cy="5" r="4" fill="#FBF3BE" stroke="#D1BE5E" strokeWidth="0.8" />
        <circle cx="4" cy="5" r="4" fill="#FBF3BE" stroke="#D1BE5E" strokeWidth="0.8" />
        <circle cx="0" cy="0" r="2.8" fill="#E8D56A" stroke="#9A8528" strokeWidth="0.8" />
      </g>

      {/* Lower leaves */}
      <path
        d="M135 178 C92 185, 62 216, 58 238 C88 246, 120 220, 135 178 Z"
        fill="#A6C89E"
        stroke="#2D4626"
        strokeWidth="1.3"
      />
      <path
        d="M105 230 C72 252, 50 288, 54 312 C78 312, 98 280, 105 230 Z"
        fill="#94BB8C"
        stroke="#2D4626"
        strokeWidth="1.3"
      />
    </g>
  </svg>
);

// 3. Feature-Specific Botanical Accents

// A. Campus Energy: Leafy Fern & Oak Branch Accent
export const CampusEnergyBotanical: React.FC<BotanicalProps> = ({ className = '' }) => (
  <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M14 62 C26 48, 42 32, 60 14" stroke="#33522C" strokeWidth="2.2" strokeLinecap="round" />
    {/* Fern pinnae */}
    <path d="M24 50 C18 42, 20 32, 28 30 C30 38, 28 46, 24 50 Z" fill="#B3D1AC" stroke="#33522C" strokeWidth="1.2" />
    <path d="M35 40 C42 46, 50 44, 52 38 C44 34, 38 36, 35 40 Z" fill="#9FC297" stroke="#33522C" strokeWidth="1.2" />
    <path d="M36 36 C28 28, 30 18, 40 16 C42 24, 40 32, 36 36 Z" fill="#B3D1AC" stroke="#33522C" strokeWidth="1.2" />
    <path d="M48 26 C55 30, 62 28, 64 22 C56 20, 50 22, 48 26 Z" fill="#9FC297" stroke="#33522C" strokeWidth="1.2" />
    {/* Fresh sprouting tip */}
    <path d="M60 14 C62 8, 68 8, 68 12 C66 16, 62 16, 60 14 Z" fill="#D2E8CB" stroke="#33522C" strokeWidth="1" />
  </svg>
);

// B. Food Waste Audit: Culinary Herb Sprig (Rosemary/Sage)
export const FoodWasteBotanical: React.FC<BotanicalProps> = ({ className = '' }) => (
  <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    {/* Herb stem */}
    <path d="M36 65 C36 45, 36 28, 36 12" stroke="#33522C" strokeWidth="2.2" strokeLinecap="round" />
    {/* Paired herb leaves */}
    <path d="M36 50 C22 45, 14 48, 12 55 C22 57, 30 54, 36 50 Z" fill="#A8C9A2" stroke="#33522C" strokeWidth="1.2" />
    <path d="M36 48 C50 43, 58 46, 60 53 C50 55, 42 52, 36 48 Z" fill="#96BD8F" stroke="#33522C" strokeWidth="1.2" />
    <path d="M36 34 C24 30, 18 34, 16 40 C25 41, 31 38, 36 34 Z" fill="#A8C9A2" stroke="#33522C" strokeWidth="1.2" />
    <path d="M36 32 C48 28, 54 32, 56 38 C47 39, 41 36, 36 32 Z" fill="#96BD8F" stroke="#33522C" strokeWidth="1.2" />
    {/* Tender top leaf pair */}
    <path d="M36 18 C28 14, 25 17, 24 22 C30 23, 34 21, 36 18 Z" fill="#BFE0B9" stroke="#33522C" strokeWidth="1.1" />
    <path d="M36 17 C44 13, 47 16, 48 21 C42 22, 38 20, 36 17 Z" fill="#A8C9A2" stroke="#33522C" strokeWidth="1.1" />
    {/* Tiny flowering bud */}
    <circle cx="36" cy="9" r="2.8" fill="#FCE5E8" stroke="#CF929A" strokeWidth="0.8" />
  </svg>
);

// C. Mess Predictor: Harvest Wheat & Grain Sprig
export const MessPredictorBotanical: React.FC<BotanicalProps> = ({ className = '' }) => (
  <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M20 62 C32 50, 42 36, 52 14" stroke="#686333" strokeWidth="2.2" strokeLinecap="round" />
    {/* Grains / Wheat spikelets */}
    <path d="M30 48 C22 44, 22 36, 28 34 C34 38, 32 46, 30 48 Z" fill="#ECD58E" stroke="#7A7032" strokeWidth="1.2" />
    <path d="M36 42 C44 44, 48 38, 46 32 C38 34, 36 40, 36 42 Z" fill="#DFBE6F" stroke="#7A7032" strokeWidth="1.2" />
    <path d="M38 34 C30 30, 30 22, 36 20 C42 24, 40 32, 38 34 Z" fill="#ECD58E" stroke="#7A7032" strokeWidth="1.2" />
    <path d="M44 28 C52 30, 56 24, 54 18 C46 20, 44 26, 44 28 Z" fill="#DFBE6F" stroke="#7A7032" strokeWidth="1.2" />
    {/* Terminal grain with awn */}
    <path d="M52 14 C48 10, 50 6, 56 6 C58 10, 54 14, 52 14 Z" fill="#F4E2A8" stroke="#7A7032" strokeWidth="1.2" />
    <path d="M56 6 L64 2" stroke="#7A7032" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

// D. Green Cup: Botanical Laurel Wreath Emblem
export const GreenCupBotanical: React.FC<BotanicalProps> = ({ className = '' }) => (
  <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    {/* Left branch */}
    <path d="M36 60 C24 56, 14 44, 14 30 C14 20, 22 14, 30 10" stroke="#33522C" strokeWidth="2" strokeLinecap="round" />
    {/* Right branch */}
    <path d="M36 60 C48 56, 58 44, 58 30 C58 20, 50 14, 42 10" stroke="#33522C" strokeWidth="2" strokeLinecap="round" />
    {/* Leaves on left */}
    <path d="M18 42 C12 38, 14 32, 20 32 C22 38, 20 42, 18 42 Z" fill="#A8C9A2" stroke="#33522C" strokeWidth="1" />
    <path d="M14 28 C8 26, 12 20, 18 22 C18 26, 16 28, 14 28 Z" fill="#96BD8F" stroke="#33522C" strokeWidth="1" />
    <path d="M22 18 C18 12, 24 8, 28 12 C26 16, 24 18, 22 18 Z" fill="#A8C9A2" stroke="#33522C" strokeWidth="1" />
    {/* Leaves on right */}
    <path d="M54 42 C60 38, 58 32, 52 32 C50 38, 52 42, 54 42 Z" fill="#A8C9A2" stroke="#33522C" strokeWidth="1" />
    <path d="M58 28 C64 26, 60 20, 54 22 C54 26, 56 28, 58 28 Z" fill="#96BD8F" stroke="#33522C" strokeWidth="1" />
    <path d="M50 18 C54 12, 48 8, 44 12 C46 16, 48 18, 50 18 Z" fill="#A8C9A2" stroke="#33522C" strokeWidth="1" />
    {/* Center golden seed */}
    <circle cx="36" cy="60" r="3.2" fill="#E8D56A" stroke="#7A7032" strokeWidth="1" />
  </svg>
);

// 4. Botanical Vine Section Transition
export const BotanicalVineTransition: React.FC<{ title?: string; className?: string }> = ({
  title,
  className = '',
}) => (
  <div className={`relative py-6 sm:py-8 flex items-center justify-center overflow-hidden ${className}`} aria-hidden="true">
    {/* Left flowing vine with leaves */}
    <div className="flex-1 max-w-sm hidden sm:block">
      <svg viewBox="0 0 320 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-8">
        <path d="M0 18 C80 10, 160 26, 240 16 C280 12, 310 18, 320 18" stroke="#688460" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M80 14 C70 6, 55 10, 50 18 C65 20, 78 18, 80 14 Z" fill="#B3D1AC" stroke="#486840" strokeWidth="1" />
        <path d="M150 22 C160 30, 175 28, 180 20 C165 18, 154 20, 150 22 Z" fill="#9FC297" stroke="#486840" strokeWidth="1" />
        <path d="M220 15 C212 8, 200 12, 196 18 C208 20, 218 18, 220 15 Z" fill="#B3D1AC" stroke="#486840" strokeWidth="1" />
        {/* Tiny blossom */}
        <circle cx="270" cy="14" r="3" fill="#FBF3BE" stroke="#D1BE5E" strokeWidth="0.8" />
        <circle cx="268" cy="12" r="2.2" fill="#FCE9EB" stroke="#CCA0A6" strokeWidth="0.6" />
      </svg>
    </div>

    {/* Center badge */}
    <div className="mx-4 flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EAF2E7] border border-[#C5DDC0] text-[#2D4626] shadow-xs">
      <span className="w-2 h-2 rounded-full bg-[#486840]" />
      {title && (
        <span className="text-[11px] font-bold tracking-wide uppercase font-mono">
          {title}
        </span>
      )}
      <span className="w-2 h-2 rounded-full bg-[#486840]" />
    </div>

    {/* Right flowing vine with leaves */}
    <div className="flex-1 max-w-sm hidden sm:block">
      <svg viewBox="0 0 320 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-8 scale-x-[-1]">
        <path d="M0 18 C80 10, 160 26, 240 16 C280 12, 310 18, 320 18" stroke="#688460" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M80 14 C70 6, 55 10, 50 18 C65 20, 78 18, 80 14 Z" fill="#B3D1AC" stroke="#486840" strokeWidth="1" />
        <path d="M150 22 C160 30, 175 28, 180 20 C165 18, 154 20, 150 22 Z" fill="#9FC297" stroke="#486840" strokeWidth="1" />
        <path d="M220 15 C212 8, 200 12, 196 18 C208 20, 218 18, 220 15 Z" fill="#B3D1AC" stroke="#486840" strokeWidth="1" />
        <circle cx="270" cy="14" r="3" fill="#FBF3BE" stroke="#D1BE5E" strokeWidth="0.8" />
        <circle cx="268" cy="12" r="2.2" fill="#FCE9EB" stroke="#CCA0A6" strokeWidth="0.6" />
      </svg>
    </div>
  </div>
);

// 5. Oversized Ambient Botanical Foliage for Outer Margins
export const BotanicalAmbientFoliage: React.FC<{ side: 'left' | 'right'; className?: string }> = ({
  side,
  className = '',
}) => {
  if (side === 'left') {
    return (
      <svg
        viewBox="0 0 280 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`pointer-events-none select-none absolute -left-12 w-64 sm:w-80 h-auto ${className}`}
        style={{ opacity: 0.35 }}
        aria-hidden="true"
      >
        <path
          d="M-40 0 C40 60, 100 160, 120 270 C135 360, 90 440, 20 480 C0 420, -10 320, -20 220 C-30 140, -40 60, -40 0 Z"
          fill="#D0E3CC"
        />
        <path
          d="M-20 80 C80 130, 160 210, 200 320 C170 330, 130 310, 100 280 C60 230, 10 160, -20 80 Z"
          fill="#E0EDE0"
        />
        <path
          d="M-60 180 C20 220, 80 290, 110 380 C80 400, 40 380, 10 350 C-20 310, -50 250, -60 180 Z"
          fill="#C4DEC0"
        />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 280 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none absolute -right-12 w-64 sm:w-80 h-auto ${className}`}
      style={{ opacity: 0.35 }}
      aria-hidden="true"
    >
      <path
        d="M320 0 C240 60, 180 160, 160 270 C145 360, 190 440, 260 480 C280 420, 290 320, 300 220 C310 140, 320 60, 320 0 Z"
        fill="#D0E3CC"
      />
      <path
        d="M300 80 C200 130, 120 210, 80 320 C110 330, 150 310, 180 280 C220 230, 270 160, 300 80 Z"
        fill="#E0EDE0"
      />
      <path
        d="M340 180 C260 220, 200 290, 170 380 C200 400, 240 380, 270 350 C300 310, 330 250, 340 180 Z"
        fill="#C4DEC0"
      />
    </svg>
  );
};

// 6. Delicate Wildflower Sprig
export const WildflowerSprig: React.FC<BotanicalProps> = ({ className = '', opacity = 0.85 }) => (
  <svg
    viewBox="0 0 110 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pointer-events-none select-none ${className}`}
    style={{ opacity }}
    aria-hidden="true"
  >
    <path d="M30 135 C38 105, 52 75, 62 38 C64 30, 68 20, 72 14" stroke="#3F5A37" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M44 95 C30 90, 18 95, 12 102 C24 107, 36 103, 44 95 Z" fill="#B3D1AC" stroke="#33522C" strokeWidth="1" />
    <path d="M54 68 C68 60, 80 64, 86 72 C74 76, 62 74, 54 68 Z" fill="#9FC297" stroke="#33522C" strokeWidth="1" />
    
    {/* Blossom */}
    <g transform="translate(72, 14)">
      <circle cx="0" cy="-6" r="4.2" fill="#FDF3E7" stroke="#D9BA9B" strokeWidth="0.8" />
      <circle cx="-6" cy="-2" r="4" fill="#FCECEE" stroke="#CCA0A6" strokeWidth="0.8" />
      <circle cx="6" cy="-2" r="4" fill="#FCECEE" stroke="#CCA0A6" strokeWidth="0.8" />
      <circle cx="-4" cy="5" r="3.8" fill="#FDF3E7" stroke="#D9BA9B" strokeWidth="0.8" />
      <circle cx="4" cy="5" r="3.8" fill="#FDF3E7" stroke="#D9BA9B" strokeWidth="0.8" />
      <circle cx="0" cy="0" r="2.6" fill="#F6E79D" stroke="#A8943B" strokeWidth="0.8" />
    </g>
  </svg>
);

// 7. Sprouting Seedling
export const SproutingSeedling: React.FC<BotanicalProps> = ({ className = '', opacity = 0.9 }) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pointer-events-none select-none inline-block ${className}`}
    style={{ opacity }}
    aria-hidden="true"
  >
    <path d="M20 36 C20 28, 20 20, 20 14" stroke="#33522C" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M20 18 C13 13, 5 16, 4 23 C10 25, 17 22, 20 18 Z" fill="#A8C9A2" stroke="#33522C" strokeWidth="1.2" />
    <path d="M20 16 C26 10, 35 12, 36 19 C30 22, 23 19, 20 16 Z" fill="#96BD8F" stroke="#33522C" strokeWidth="1.2" />
    <path d="M20 14 C19 9, 20 5, 21 3 C22 6, 21 11, 20 14 Z" fill="#D2E8CB" stroke="#33522C" strokeWidth="1" />
  </svg>
);

// 8. Refined Paper & Botanical Texture Background Overlay
export const BotanicalJournalTexture: React.FC = () => (
  <div 
    className="pointer-events-none fixed inset-0 z-0 opacity-[0.045] mix-blend-multiply"
    style={{
      backgroundImage: `radial-gradient(#1B3826 0.9px, transparent 0.9px), radial-gradient(#486840 0.9px, #FAF6EE 0.9px)`,
      backgroundSize: '24px 24px',
      backgroundPosition: '0 0, 12px 12px',
    }}
    aria-hidden="true"
  />
);
