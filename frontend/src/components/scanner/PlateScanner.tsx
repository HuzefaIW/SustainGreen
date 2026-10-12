import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Upload, Sparkles, AlertCircle, Award, Droplets, 
  Flame, IndianRupee, RefreshCw, CheckCircle, Eye, ShieldAlert,
  Sliders, Info, Scan
} from 'lucide-react';

interface VisionMetrics {
  plateSurfaceAreaMm2: number;
  segmentedFoodAreaMm2: number;
  estimatedFoodVolumeCm3: number;
  foodRemnantClass: string;
  detectionConfidence: number;
}

interface ScanAuditResult {
  leftoverPercentage: number;
  estimatedFoodWastedGrams: number;
  co2eEmittedKg: number;
  methaneEquivalentGrams: number;
  virtualWaterWastedLiters: number;
  financialLossInr: number;
  greenCreditsEarned: number;
  statusBadge: string;
  badgeColor: string;
}

interface ScanResponse {
  status: string;
  timestamp: string;
  visionMetrics: VisionMetrics;
  audit: ScanAuditResult;
  recommendation: string;
}

export const PlateScanner: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<'NORMAL_TRAY' | 'HEAVY_WASTE' | 'CLEAN_TRAY'>('NORMAL_TRAY');
  const [useWebcam, setUseWebcam] = useState(false);
  const [result, setResult] = useState<ScanResponse | null>(null);
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
    setAnalyzing(true);
    try {
      const res = await fetch('/api/scan-plate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulatedPlateType: selectedPreset }),
      });
      const data: ScanResponse = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Failed to run plate audit:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Scan className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">AI Computer Vision Plate Waste Scanner</h3>
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold rounded-full border border-amber-300">
              OPENCV & VOLUMETRIC HUD
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Monocular depth approximation & IPCC AR6 / DEFRA climate accounting
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setSelectedPreset('CLEAN_TRAY')}
            className={`px-3 py-1.5 rounded-lg transition font-bold cursor-pointer ${
              selectedPreset === 'CLEAN_TRAY'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Zero-Waste Tray
          </button>
          <button
            onClick={() => setSelectedPreset('NORMAL_TRAY')}
            className={`px-3 py-1.5 rounded-lg transition font-bold cursor-pointer ${
              selectedPreset === 'NORMAL_TRAY'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Average Thali
          </button>
          <button
            onClick={() => setSelectedPreset('HEAVY_WASTE')}
            className={`px-3 py-1.5 rounded-lg transition font-bold cursor-pointer ${
              selectedPreset === 'HEAVY_WASTE'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            High Waste Tray
          </button>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Viewfinder Column (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                <Camera className="w-4 h-4 text-amber-600" />
                <span>Mess Dining Tray Viewfinder</span>
              </span>
              <button
                onClick={() => setUseWebcam(!useWebcam)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition underline underline-offset-4 cursor-pointer"
              >
                {useWebcam ? 'Switch to Preset Tray Graphic' : 'Enable Live Device Webcam'}
              </button>
            </div>

            {/* Viewfinder Box with HUD Overlay */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center group shadow-md">
              {useWebcam ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center">
                  {/* Visual Tray Simulation Graphic */}
                  <div className="w-56 h-36 rounded-2xl border-2 border-dashed border-amber-400/50 bg-slate-900/90 p-3.5 flex flex-col justify-between relative shadow-xl">
                    <div className="flex justify-between">
                      <div className={`w-12 h-12 rounded-full border ${selectedPreset === 'CLEAN_TRAY' ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-amber-500/50 bg-amber-500/20'} flex items-center justify-center text-[10px] text-amber-300 font-mono font-bold`}>
                        Dal
                      </div>
                      <div className={`w-12 h-12 rounded-full border ${selectedPreset === 'CLEAN_TRAY' ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-amber-500/50 bg-amber-500/20'} flex items-center justify-center text-[10px] text-amber-300 font-mono font-bold`}>
                        Sabzi
                      </div>
                    </div>
                    <div className={`w-full h-14 rounded-xl border ${selectedPreset === 'CLEAN_TRAY' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : selectedPreset === 'HEAVY_WASTE' ? 'border-rose-500/60 bg-rose-500/30 text-rose-200' : 'border-amber-500/50 bg-amber-500/20 text-amber-200'} flex items-center justify-center text-xs font-mono font-bold`}>
                      {selectedPreset === 'CLEAN_TRAY' ? 'Clean Plate Surface (Zero Remnants)' : selectedPreset === 'HEAVY_WASTE' ? 'Heavy Rice & Bread Waste Detected' : 'Standard Mess Rice & Roti Portions'}
                    </div>

                    {/* HUD Target Reticle */}
                    <div className="absolute inset-0 border border-amber-400/30 pointer-events-none rounded-2xl animate-pulse" />
                  </div>

                  <span className="text-[11px] text-slate-400 mt-4 font-mono font-medium">
                    Calibration: Stainless Steel 5-Compartment Tray (350×250mm)
                  </span>
                </div>
              )}

              {/* HUD Target Overlay Reticles */}
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-950/80 backdrop-blur rounded-lg text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>AI VISION READY</span>
              </div>

              <div className="absolute top-3 right-3 px-2.5 py-1 bg-slate-950/80 backdrop-blur rounded-lg text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30 shadow-xs">
                REF: 350x250mm TRAY
              </div>

              {/* Bottom Target Bounding Box Label */}
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-[10px] font-mono font-bold text-slate-300 bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-800">
                <span>VOLUMETRIC SURFACE RESOLUTION: 1080p</span>
                <span>FOCAL: MONOCULAR DEPTH ESTIMATE</span>
              </div>
            </div>
          </div>

          {/* Trigger Button */}
          <div className="mt-5">
            <button
              onClick={handleRunAudit}
              disabled={analyzing}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-amber-500/25 flex items-center justify-center space-x-2 cursor-pointer"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Computing OpenCV Contours & Food Density...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                  <span>Execute AI Tray Audit & Carbon Calculation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Column (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Tray Audit & Climate Impact Card</span>
              </h4>
              {result && (
                <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  CONF: {(result.visionMetrics.detectionConfidence * 100).toFixed(1)}%
                </span>
              )}
            </div>

            {result ? (
              <div className="space-y-4">
                {/* Status Hero Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase">CLASSIFICATION</span>
                    <h5 className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {result.audit.statusBadge}
                    </h5>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase">GREEN CREDITS</span>
                    <span className="text-xl font-extrabold font-mono text-emerald-700">
                      +{result.audit.greenCreditsEarned} pts
                    </span>
                  </div>
                </div>

                {/* 4 Metric Badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Food Leftover</span>
                    <span className="text-base font-extrabold font-mono text-amber-950 mt-0.5 block">
                      {result.audit.leftoverPercentage}% ({result.audit.estimatedFoodWastedGrams}g)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block flex items-center space-x-1">
                      <Flame className="w-3.5 h-3.5 text-rose-600" />
                      <span>CO2e Footprint</span>
                    </span>
                    <span className="text-base font-extrabold font-mono text-rose-950 mt-0.5 block">
                      {result.audit.co2eEmittedKg} kg
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block flex items-center space-x-1">
                      <Droplets className="w-3.5 h-3.5 text-blue-600" />
                      <span>Virtual Water</span>
                    </span>
                    <span className="text-base font-extrabold font-mono text-blue-950 mt-0.5 block">
                      {result.audit.virtualWaterWastedLiters} Liters
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block flex items-center space-x-1">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Financial Loss</span>
                    </span>
                    <span className="text-base font-extrabold font-mono text-emerald-950 mt-0.5 block">
                      ₹{result.audit.financialLossInr}
                    </span>
                  </div>
                </div>

                {/* Volumetric Breakdown */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Plate Segmented Surface:</span>
                    <span className="text-slate-900 font-bold">{result.visionMetrics.segmentedFoodAreaMm2} mm²</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Estimated 3D Volume:</span>
                    <span className="text-slate-900 font-bold">{result.visionMetrics.estimatedFoodVolumeCm3} cm³</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Detected Food Type:</span>
                    <span className="text-slate-900 font-bold">{result.visionMetrics.foodRemnantClass}</span>
                  </div>
                </div>

                {/* Behavioral Advice */}
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 font-medium leading-relaxed flex items-start space-x-2.5">
                  <CheckCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>{result.recommendation}</span>
                </div>
              </div>
            ) : (
              <div className="h-64 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Sparkles className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">No Tray Scan Executed Yet</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Choose a preset or live camera feed, then click "Execute AI Tray Audit".
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between items-center font-medium">
            <span>DEFRA & IPCC AR6 Standard Factors</span>
            <span>SVVV Mess Ledger Integrated</span>
          </div>
        </div>
      </div>
    </div>
  );
};
