import React, { useId } from 'react';

/**
 * Animated Botanical Background for EcoPulse.
 * Lightweight, high-performance SVG leaves drifting and floating gently,
 * accompanied by soft organic green gradients and edge silhouettes.
 * Strictly non-interactive (pointer-events-none, z-0, aria-hidden).
 */

interface BotanicalBackgroundProps {
  variant?: 'landing' | 'dashboard' | 'selection';
  className?: string;
}

export const BotanicalBackground: React.FC<BotanicalBackgroundProps> = ({
  variant = 'dashboard',
  className = '',
}) => {
  const maskId = useId();

  return (
    <div
      className={`fixed inset-0 pointer-events-none select-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    >
      {/* ── 1. Soft Translucent Organic Gradient Blobs ──────────────────────── */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-[#22C55E]/10 via-[#A3E635]/8 to-transparent blur-3xl animate-organic-glow" />
      <div 
        className="absolute top-1/3 -right-36 w-[420px] h-[420px] rounded-full bg-gradient-to-bl from-[#166534]/8 via-[#22C55E]/7 to-transparent blur-3xl animate-organic-glow"
        style={{ animationDelay: '-5s' }}
      />
      <div 
        className="absolute -bottom-32 left-1/4 w-[480px] h-[480px] rounded-full bg-gradient-to-t from-[#E8F5E9]/60 via-[#A3E635]/6 to-transparent blur-3xl animate-organic-glow"
        style={{ animationDelay: '-8s' }}
      />

      {/* ── 2. Subtle Botanical Dot Pattern ───────────────────────────────── */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(#166534 1px, transparent 1px), radial-gradient(#22C55E 1px, #F5FBF5 1px)`,
          backgroundSize: '28px 28px',
          backgroundPosition: '0 0, 14px 14px',
        }}
      />

      {/* ── 3. Subtle Leaf Silhouettes Anchored to Margins ─────────────────── */}
      {/* Top-Right Corner Silhouette */}
      <svg
        viewBox="0 0 240 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute -top-6 -right-6 w-52 sm:w-72 h-auto opacity-[0.22] text-[#166534]"
      >
        <path
          d="M260 -20 C180 40, 120 120, 95 210 C80 265, 110 300, 150 320 C170 270, 190 200, 215 130 C235 70, 250 20, 260 -20 Z"
          fill="currentColor"
        />
        <path
          d="M240 60 C170 100, 110 170, 75 250 C95 260, 125 240, 145 220 C180 180, 215 130, 240 60 Z"
          fill="#22C55E"
          opacity="0.4"
        />
        <path
          d="M270 140 C210 180, 150 230, 120 300 C140 315, 170 295, 195 270 C225 235, 255 190, 270 140 Z"
          fill="#A3E635"
          opacity="0.3"
        />
      </svg>

      {/* Left Margin Silhouette */}
      <svg
        viewBox="0 0 200 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-1/4 -left-10 w-44 sm:w-60 h-auto opacity-[0.18] text-[#166534]"
      >
        <path
          d="M-30 0 C30 50, 70 120, 85 200 C95 250, 75 295, 45 330 C30 290, 15 220, 5 150 C-5 90, -20 40, -30 0 Z"
          fill="currentColor"
        />
        <path
          d="M-20 80 C40 120, 85 180, 105 260 C85 270, 60 255, 45 235 C20 195, 0 140, -20 80 Z"
          fill="#22C55E"
          opacity="0.4"
        />
      </svg>

      {/* Bottom-Right Edge Accent */}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute -bottom-8 -right-8 w-40 sm:w-56 h-auto opacity-[0.16] text-[#22C55E]"
      >
        <path
          d="M220 220 C160 180, 110 130, 80 70 C70 120, 90 170, 130 200 Z"
          fill="currentColor"
        />
        <path
          d="M200 160 C150 130, 110 90, 85 40 C75 80, 90 120, 120 150 Z"
          fill="#A3E635"
          opacity="0.5"
        />
      </svg>

      {/* ── 4. Drifting & Floating Botanical Leaves (Varying Trajectories) ─── */}

      {/* Leaf 1: Drifting gently down from left (Eucalyptus leaf) */}
      <div 
        className="absolute top-0 left-[8%] animate-leaf-drift-1"
        style={{ animationDuration: '24s', animationDelay: '0s' }}
      >
        <svg viewBox="0 0 42 24" fill="none" className="w-6 h-4 opacity-35">
          <path
            d="M2 12 C12 2, 28 2, 40 12 C28 22, 12 22, 2 12 Z"
            fill="#22C55E"
          />
          <path d="M4 12 C16 12, 28 12, 38 12" stroke="#166534" strokeWidth="0.8" opacity="0.6" />
        </svg>
      </div>

      {/* Leaf 2: Drifting down middle-right (Slender willow/olive leaf) */}
      <div 
        className="absolute top-0 left-[72%] animate-leaf-drift-2"
        style={{ animationDuration: '28s', animationDelay: '4s' }}
      >
        <svg viewBox="0 0 48 18" fill="none" className="w-7 h-3.5 opacity-30">
          <path
            d="M2 9 C15 1, 32 1, 46 9 C32 17, 15 17, 2 9 Z"
            fill="#166534"
          />
          <path d="M4 9 L44 9" stroke="#A3E635" strokeWidth="0.7" opacity="0.7" />
        </svg>
      </div>

      {/* Leaf 3: Drifting down left-center (Tender lime leaf) */}
      <div 
        className="absolute top-0 left-[26%] animate-leaf-drift-1"
        style={{ animationDuration: '22s', animationDelay: '9s' }}
      >
        <svg viewBox="0 0 32 22" fill="none" className="w-5 h-3.5 opacity-35">
          <path
            d="M2 11 C8 2, 22 2, 30 11 C22 20, 8 20, 2 11 Z"
            fill="#A3E635"
          />
          <path d="M4 11 C12 11, 20 11, 28 11" stroke="#166534" strokeWidth="0.8" opacity="0.5" />
        </svg>
      </div>

      {/* Leaf 4: Drifting down right edge (Small fern leaflet) */}
      <div 
        className="absolute top-0 left-[88%] animate-leaf-drift-2"
        style={{ animationDuration: '25s', animationDelay: '14s' }}
      >
        <svg viewBox="0 0 36 20" fill="none" className="w-5 h-3 opacity-25">
          <path
            d="M2 10 C10 3, 24 3, 34 10 C24 17, 10 17, 2 10 Z"
            fill="#22C55E"
          />
          <path d="M4 10 L32 10" stroke="#166534" strokeWidth="0.6" opacity="0.6" />
        </svg>
      </div>

      {/* Leaf 5: Floating softly in mid-ground margin (Gentle sway) */}
      <div 
        className="absolute top-[45%] left-[3%] animate-leaf-float"
        style={{ animationDuration: '9s', animationDelay: '1s' }}
      >
        <svg viewBox="0 0 38 24" fill="none" className="w-6 h-4 opacity-30">
          <path
            d="M2 12 C10 3, 26 3, 36 12 C26 21, 10 21, 2 12 Z"
            fill="#22C55E"
          />
          <path d="M4 12 Q20 9 34 12" stroke="#14532D" strokeWidth="0.7" opacity="0.6" />
        </svg>
      </div>

      {/* Leaf 6: Floating softly in right margin (Gentle sway) */}
      <div 
        className="absolute top-[60%] right-[4%] animate-leaf-float"
        style={{ animationDuration: '11s', animationDelay: '3s' }}
      >
        <svg viewBox="0 0 34 20" fill="none" className="w-5 h-3 opacity-28">
          <path
            d="M2 10 C9 2, 23 2, 32 10 C23 18, 9 18, 2 10 Z"
            fill="#A3E635"
          />
          <path d="M4 10 L30 10" stroke="#166534" strokeWidth="0.6" opacity="0.5" />
        </svg>
      </div>

      {/* ── 5. Very Occasional Subtle Green Spores / Micro-Particles ───────── */}
      <div 
        className="absolute left-[15%] w-1.5 h-1.5 rounded-full bg-[#A3E635] blur-[0.5px] animate-spore"
        style={{ animationDuration: '18s', animationDelay: '2s' }}
      />
      <div 
        className="absolute left-[45%] w-1 h-1 rounded-full bg-[#22C55E] blur-[0.5px] animate-spore"
        style={{ animationDuration: '22s', animationDelay: '7s' }}
      />
      <div 
        className="absolute left-[80%] w-1.5 h-1.5 rounded-full bg-[#A3E635] blur-[0.5px] animate-spore"
        style={{ animationDuration: '20s', animationDelay: '12s' }}
      />
    </div>
  );
};
