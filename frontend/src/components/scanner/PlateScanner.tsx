import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Utensils, AlertCircle, Award, Droplets, 
  Flame, IndianRupee, RefreshCw, CheckCircle2, ChevronDown, 
  ChevronUp, Info, History, Sparkles, Leaf
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

interface ScanAuditResult {
  leftoverPercentage: number;
  estimatedFoodWastedGrams: number;
  estimatedFoodConsumedGrams: number;
  standardMealWeightGrams: number;
  co2eEmittedKg: number;
  virtualWaterWastedLiters: number;
  financialLossInr: number;
  greenCreditsEarned: number;
  statusBadge: string;
  badgeColor: string;
  foodRemnantClass: string;
}

interface ScanResponse {
  status: string;
  timestamp: string;
  audit: ScanAuditResult;
  recommendation: string;
}

interface AuditHistoryItem {
  id: string;
  timestamp: string;
  preset: string;
  wastedGrams: number;
  leftoverPct: number;
  creditsEarned: number;
}

export const PlateScanner: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<'CLEAN_TRAY' | 'NORMAL_TRAY' | 'HEAVY_WASTE'>('NORMAL_TRAY');
  const [useWebcam, setUseWebcam] = useState(false);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);
  const [historyList, setHistoryList] = useState<AuditHistoryItem[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Manage Webcam
  useEffect(() => {
    if (useWebcam) {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Webcam not accessible, reverting to preset mode:', err);
          setUseWebcam(false);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [useWebcam]);

  const handleRunAudit = async () => {
    if (analyzing) return;
    setAnalyzing(true);
    setScanError(null);

    try {
      let capturedImage: string | null = null;
      if (useWebcam && videoRef.current) {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          capturedImage = canvas.toDataURL('image/jpeg', 0.8);
        }
      }

      const res = await fetch(API_ENDPOINTS.scanPlate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageBase64: capturedImage,
          isWebcam: useWebcam,
          simulatedPlateType: selectedPreset,
          department: 'Central Hostel Dining Council'
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.status === 'error') {
        setScanError(data.error || 'Unable to complete food plate audit.');
        setResult(null);
      } else {
        setResult(data);
        setScanError(null);

        // Record in local session history
        const newHistoryItem: AuditHistoryItem = {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          preset: selectedPreset === 'CLEAN_TRAY' ? 'Zero-Waste Tray' : selectedPreset === 'NORMAL_TRAY' ? 'Average Thali' : 'High Waste Tray',
          wastedGrams: data.audit.estimatedFoodWastedGrams,
          leftoverPct: data.audit.leftoverPercentage,
          creditsEarned: data.audit.greenCreditsEarned,
        };
        setHistoryList(prev => [newHistoryItem, ...prev.slice(0, 4)]);
      }
    } catch (err: any) {
      console.error('Failed to run plate audit:', err);
      setScanError(err.message || 'Network error while contacting the audit service.');
    } finally {
      setAnalyzing(false);
    }
  };

  const PRESETS = [
    {
      key: 'CLEAN_TRAY' as const,
      label: 'Zero-Waste Tray',
      description: 'Clean plate surface with minimal traces (~5% leftovers)',
      badge: '~19g waste',
      color: 'border-[#BBF7D0] bg-[#F0FDF4]',
    },
    {
      key: 'NORMAL_TRAY' as const,
      label: 'Average Thali',
      description: 'Typical dining portion with small leftover carb or gravy (~24%)',
      badge: '~91g waste',
      color: 'border-[#D8E4D2] bg-white',
    },
    {
      key: 'HEAVY_WASTE' as const,
      label: 'High Waste Tray',
      description: 'Substantial unfinished rice, bread, or side portions (~42%)',
      badge: '~160g waste',
      color: 'border-[#FDE68A] bg-[#FFFDF7]',
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Section A: Page Heading ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#191C1A] leading-tight">
            Food Waste Audit
          </h2>
          <p className="text-sm text-[#486340] mt-1">
            Estimate leftover food and understand its potential environmental impact.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-[#8E9789] bg-[#F5F7F0] border border-[#E0E8DA] px-2.5 py-1.5 rounded-lg self-start sm:self-auto">
          <Leaf className="w-3.5 h-3.5 text-[#486340]" />
          Rule-based simulation · 380g standard thali
        </span>
      </div>

      {/* ── Section B: Plate Preset Selection ─────────────────────────────── */}
      <div className="bg-white border border-[#D8E4D2] rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="text-sm font-semibold text-[#191C1A]">1. Choose a Plate Preset</h3>
            <p className="text-xs text-[#8E9789] mt-0.5">
              Select a representative tray condition to calibrate the audit estimate.
            </p>
          </div>
          <button
            onClick={() => setUseWebcam(prev => !prev)}
            className="text-xs text-[#486340] hover:text-[#1B3826] font-medium transition flex items-center gap-1 underline underline-offset-2"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{useWebcam ? 'Switch to Preset Diagram' : 'Use Device Camera Feed'}</span>
          </button>
        </div>

        {/* 3 Preset Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESETS.map((p) => {
            const isSelected = selectedPreset === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setSelectedPreset(p.key)}
                className={`text-left p-4 rounded-xl border-2 transition-all relative ${
                  isSelected
                    ? 'border-[#1B3826] bg-[#F2F7F0] shadow-2xs ring-1 ring-[#1B3826]/10'
                    : 'border-[#E0E8DA] hover:border-[#CADBC4] bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-sm font-semibold ${isSelected ? 'text-[#1B3826]' : 'text-[#191C1A]'}`}>
                    {p.label}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white border border-[#D8E4D2] text-[#486340]">
                    {p.badge}
                  </span>
                </div>
                <p className="text-xs text-[#6B7B68] leading-relaxed">
                  {p.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Optional Webcam Preview (if user enabled it) */}
        {useWebcam && (
          <div className="mt-4 p-3 bg-[#F5F7F0] border border-[#D8E4D2] rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#486340] flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                Live Viewfinder Feed
              </span>
              <span className="text-[11px] text-[#8E9789]">
                Reference: 350×250mm standard steel tray
              </span>
            </div>
            <div className="relative aspect-video max-h-56 w-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="mt-5 pt-4 border-t border-[#EDF0E9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-[#8E9789]">
            Audits calculate food weight left on plate relative to standard 380g thali serving.
          </p>
          <button
            type="button"
            onClick={handleRunAudit}
            disabled={analyzing}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#1B3826] hover:bg-[#254D36] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Estimating Plate Leftovers…</span>
              </>
            ) : (
              <>
                <Utensils className="w-4 h-4" />
                <span>Run Food Waste Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error state */}
      {scanError && (
        <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#78350F]">Audit Unsuccessful</p>
            <p className="mt-0.5">{scanError}</p>
          </div>
        </div>
      )}

      {/* ── Section C: Audit Result Summary ──────────────────────────────── */}
      {result && (
        <div className="bg-white border border-[#D8E4D2] rounded-2xl p-5 shadow-2xs space-y-5 animate-in fade-in-50 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EDF0E9]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#191C1A]">2. Audit Summary & Environmental Impact</h3>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  result.audit.leftoverPercentage <= 10
                    ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                    : result.audit.leftoverPercentage <= 25
                    ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]'
                    : 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]'
                }`}>
                  {result.audit.statusBadge}
                </span>
              </div>
              <p className="text-xs text-[#8E9789] mt-0.5">
                Classified remnants: {result.audit.foodRemnantClass}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-[#8E9789] block">Sustainability Points</span>
              <span className="text-base font-mono font-bold text-[#1B3826]">
                +{result.audit.greenCreditsEarned} pts
              </span>
            </div>
          </div>

          {/* Core Consumption vs. Leftover Distinction */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Leftover Food */}
            <div className="p-4 rounded-xl bg-[#FFFDF7] border border-[#FDE68A]">
              <span className="text-xs text-[#B45309] font-medium block mb-1">
                Food Left Over
              </span>
              <p className="text-2xl font-mono font-bold text-[#B45309]">
                {result.audit.estimatedFoodWastedGrams}g
              </p>
              <p className="text-xs text-[#92400E] mt-1">
                {result.audit.leftoverPercentage}% of standard meal
              </p>
            </div>

            {/* Food Consumed */}
            <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
              <span className="text-xs text-[#166534] font-medium block mb-1">
                Food Consumed
              </span>
              <p className="text-2xl font-mono font-bold text-[#166534]">
                {result.audit.estimatedFoodConsumedGrams}g
              </p>
              <p className="text-xs text-[#15803D] mt-1">
                {(100 - result.audit.leftoverPercentage)}% finished by diner
              </p>
            </div>

            {/* Meal Portion Baseline */}
            <div className="p-4 rounded-xl bg-[#F5F7F0] border border-[#D8E4D2]">
              <span className="text-xs text-[#486340] font-medium block mb-1">
                Standard Portion Size
              </span>
              <p className="text-2xl font-mono font-bold text-[#191C1A]">
                {result.audit.standardMealWeightGrams}g
              </p>
              <p className="text-xs text-[#8E9789] mt-1">
                Mess standard thali serving
              </p>
            </div>
          </div>

          {/* Environmental & Financial Impact Strip */}
          <div className="p-4 bg-[#FAF8F5] border border-[#E0E8DA] rounded-xl">
            <h4 className="text-xs font-semibold text-[#486340] uppercase tracking-wider mb-3">
              Estimated Resource Footprint of Leftovers
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-xs text-[#8E9789] mb-1">
                  <Flame className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>Embodied CO₂e</span>
                </div>
                <p className="text-base sm:text-lg font-mono font-bold text-[#191C1A]">
                  {result.audit.co2eEmittedKg} kg
                </p>
                <p className="text-[11px] text-[#8E9789] mt-0.5">IPCC factor</p>
              </div>

              <div>
                <div className="flex items-center justify-center gap-1 text-xs text-[#8E9789] mb-1">
                  <Droplets className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Virtual Water</span>
                </div>
                <p className="text-base sm:text-lg font-mono font-bold text-[#191C1A]">
                  {result.audit.virtualWaterWastedLiters} L
                </p>
                <p className="text-[11px] text-[#8E9789] mt-0.5">embedded irrigation</p>
              </div>

              <div>
                <div className="flex items-center justify-center gap-1 text-xs text-[#8E9789] mb-1">
                  <IndianRupee className="w-3.5 h-3.5 text-[#166534]" />
                  <span>Food Value</span>
                </div>
                <p className="text-base sm:text-lg font-mono font-bold text-[#191C1A]">
                  ₹{result.audit.financialLossInr.toFixed(2)}
                </p>
                <p className="text-[11px] text-[#8E9789] mt-0.5">prep cost</p>
              </div>
            </div>
          </div>

          {/* Behavioral Recommendation */}
          <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#166534]">Diner Recommendation</p>
              <p className="text-xs text-[#15803D] mt-0.5 leading-relaxed">
                {result.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Section D: Methodology & Session History Disclosures ────────── */}
      <div className="bg-white border border-[#D8E4D2] rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowMethodology(v => !v)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-[#F9F7F2] transition"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-[#486340]">
            <Info className="w-4 h-4" />
            <span>Audit Methodology & Conversion Assumptions</span>
          </div>
          {showMethodology ? <ChevronUp className="w-4 h-4 text-[#8E9789]" /> : <ChevronDown className="w-4 h-4 text-[#8E9789]" />}
        </button>

        {showMethodology && (
          <div className="px-5 pb-5 pt-1 space-y-4 border-t border-[#EDF0E9] text-xs text-[#6B7B68] leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA] space-y-1.5">
                <p className="font-semibold text-[#191C1A]">Baseline Meal Parameters</p>
                <p>• Standard Thali Serving: 380 grams (120g rice, 50g dal, 90g wheat roti, 100g vegetables, 20g oil).</p>
                <p>• Meal Preparation Value: ₹85.00 per kilogram of prepared food.</p>
                <p>• Clean Plate Baseline: Leftovers &lt;10% are considered negligible plate loss.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA] space-y-1.5">
                <p className="font-semibold text-[#191C1A]">Environmental Conversion Factors</p>
                <p>• Greenhouse Gases: 2.5 kg CO₂e per kilogram of discarded food (composite agricultural index).</p>
                <p>• Virtual Water: 1,200 Liters of water consumed per kg of mixed grain and legume preparation.</p>
                <p>• Conscientiousness Credits: 10 to 50 Green Credits awarded to dining hall standings per logged audit.</p>
              </div>
            </div>

            <p className="text-[11px] text-[#8E9789]">
              Disclaimer: This module provides decision-support estimates calibrated against benchmark mess dining trays. It does not replace certified laboratory waste calorimetry.
            </p>
          </div>
        )}
      </div>

      {/* Session Audit History (if any audits were run this session) */}
      {historyList.length > 0 && (
        <div className="bg-white border border-[#D8E4D2] rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-[#486340]" />
            <h3 className="text-sm font-semibold text-[#191C1A]">Recent Audits (This Session)</h3>
          </div>
          <div className="divide-y divide-[#EDF0E9]">
            {historyList.map(item => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-[#191C1A]">{item.preset}</span>
                  <span className="text-[#8E9789] ml-2">at {item.timestamp}</span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-[#B45309]">{item.wastedGrams}g ({item.leftoverPct}%)</span>
                  <span className="text-[#166534] font-semibold">+{item.creditsEarned} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
