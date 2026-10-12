import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Upload, Sparkles, AlertCircle, Award, Droplets, 
  Flame, IndianRupee, RefreshCw, CheckCircle, Eye, ShieldAlert,
  Sliders, Info, Scan, Terminal
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
      {/* Vercel Header Card */}
      <div className="bg-white border border-zinc-200/90 rounded-xl p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-zinc-900">AI Computer Vision Plate Waste Scanner</h3>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
              OPENCV & VOLUMETRIC HUD
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Monocular depth contour analysis & IPCC AR6 / DEFRA climate accounting
          </p>
        </div>

        {/* Clean Segmented Control */}
        <div className="flex items-center space-x-1 bg-zinc-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setSelectedPreset('CLEAN_TRAY')}
            className={`px-3 py-1.5 rounded-md transition font-medium cursor-pointer ${
              selectedPreset === 'CLEAN_TRAY'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Zero-Waste Tray
          </button>
          <button
            onClick={() => setSelectedPreset('NORMAL_TRAY')}
            className={`px-3 py-1.5 rounded-md transition font-medium cursor-pointer ${
              selectedPreset === 'NORMAL_TRAY'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Average Thali
          </button>
          <button
            onClick={() => setSelectedPreset('HEAVY_WASTE')}
            className={`px-3 py-1.5 rounded-md transition font-medium cursor-pointer ${
              selectedPreset === 'HEAVY_WASTE'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            High Waste Tray
          </button>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Viewfinder (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-zinc-200/90 rounded-xl p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-medium text-zinc-700 flex items-center space-x-1.5">
                <Camera className="w-3.5 h-3.5 text-zinc-400" />
                <span>Mess Dining Tray Viewfinder</span>
              </span>
              <button
                onClick={() => setUseWebcam(!useWebcam)}
                className="text-xs text-zinc-600 hover:text-zinc-900 transition underline underline-offset-4 cursor-pointer font-medium"
              >
                {useWebcam ? 'Switch to Preset Graphic' : 'Enable Live Device Webcam'}
              </button>
            </div>

            {/* Viewfinder Window */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center group shadow-subtle">
              {useWebcam ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 flex flex-col items-center justify-center p-6 text-center">
                  {/* Visual Tray Simulation Graphic */}
                  <div className="w-56 h-36 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/90 p-3.5 flex flex-col justify-between relative shadow-lg">
                    <div className="flex justify-between">
                      <div className={`w-11 h-11 rounded-lg border ${selectedPreset === 'CLEAN_TRAY' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-zinc-700 bg-zinc-800 text-zinc-400'} flex items-center justify-center text-[10px] font-mono`}>
                        Dal
                      </div>
                      <div className={`w-11 h-11 rounded-lg border ${selectedPreset === 'CLEAN_TRAY' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-zinc-700 bg-zinc-800 text-zinc-400'} flex items-center justify-center text-[10px] font-mono`}>
                        Sabzi
                      </div>
                    </div>
                    <div className={`w-full h-12 rounded-lg border ${selectedPreset === 'CLEAN_TRAY' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : selectedPreset === 'HEAVY_WASTE' ? 'border-rose-500/40 bg-rose-500/20 text-rose-300' : 'border-zinc-700 bg-zinc-800 text-zinc-300'} flex items-center justify-center text-xs font-mono font-medium`}>
                      {selectedPreset === 'CLEAN_TRAY' ? 'Clean Plate Surface (Zero Remnants)' : selectedPreset === 'HEAVY_WASTE' ? 'Heavy Rice & Bread Waste Detected' : 'Standard Mess Rice & Roti Portions'}
                    </div>

                    {/* HUD Target Reticle */}
                    <div className="absolute inset-0 border border-zinc-600/40 pointer-events-none rounded-xl" />
                  </div>

                  <span className="text-[11px] text-zinc-500 mt-4 font-mono">
                    Target Reference: Stainless Steel 5-Compartment Tray (350×250mm)
                  </span>
                </div>
              )}

              {/* Status Overlay Chips */}
              <div className="absolute top-3 left-3 px-2 py-0.5 bg-zinc-900/90 backdrop-blur rounded text-[10px] font-mono font-medium text-emerald-400 border border-zinc-700 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>AI VISION READY</span>
              </div>

              <div className="absolute top-3 right-3 px-2 py-0.5 bg-zinc-900/90 backdrop-blur rounded text-[10px] font-mono font-medium text-zinc-400 border border-zinc-700">
                REF: 350x250mm
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-[10px] font-mono text-zinc-400 bg-zinc-900/90 backdrop-blur px-2.5 py-1 rounded-md border border-zinc-800">
                <span>VOLUMETRIC SURFACE RESOLUTION: 1080p</span>
                <span>FOCAL: MONOCULAR DEPTH</span>
              </div>
            </div>
          </div>

          {/* Vercel Primary Button */}
          <div className="mt-4">
            <button
              onClick={handleRunAudit}
              disabled={analyzing}
              className="w-full py-2.5 bg-zinc-900 hover:bg-black text-white font-medium text-xs rounded-lg transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                  <span>Computing OpenCV Contours & Food Density...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Execute AI Tray Audit & Carbon Calculation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Results Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-zinc-200/90 rounded-xl p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-100">
              <h4 className="text-sm font-semibold text-zinc-900 flex items-center space-x-2">
                <Award className="w-4 h-4 text-zinc-400" />
                <span>Tray Audit & Climate Receipt</span>
              </h4>
              {result && (
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                  CONF: {(result.visionMetrics.detectionConfidence * 100).toFixed(1)}%
                </span>
              )}
            </div>

            {result ? (
              <div className="space-y-3.5">
                {/* Status Hero Card */}
                <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-mono">CLASSIFICATION</span>
                    <h5 className="text-xs font-semibold text-zinc-900 mt-0.5">
                      {result.audit.statusBadge}
                    </h5>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block font-mono">GREEN CREDITS</span>
                    <span className="text-base font-bold font-mono text-emerald-600">
                      +{result.audit.greenCreditsEarned} pts
                    </span>
                  </div>
                </div>

                {/* 4 Metric Badges */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-lg bg-white border border-zinc-200 shadow-2xs">
                    <span className="text-[10px] text-zinc-400 font-mono block">FOOD LEFTOVER</span>
                    <span className="text-sm font-bold font-mono text-zinc-900 mt-0.5 block">
                      {result.audit.leftoverPercentage}% ({result.audit.estimatedFoodWastedGrams}g)
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-zinc-200 shadow-2xs">
                    <span className="text-[10px] text-zinc-400 font-mono block flex items-center space-x-1">
                      <Flame className="w-3 h-3 text-rose-500" />
                      <span>CO2e FOOTPRINT</span>
                    </span>
                    <span className="text-sm font-bold font-mono text-zinc-900 mt-0.5 block">
                      {result.audit.co2eEmittedKg} kg
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-zinc-200 shadow-2xs">
                    <span className="text-[10px] text-zinc-400 font-mono block flex items-center space-x-1">
                      <Droplets className="w-3 h-3 text-blue-500" />
                      <span>VIRTUAL WATER</span>
                    </span>
                    <span className="text-sm font-bold font-mono text-zinc-900 mt-0.5 block">
                      {result.audit.virtualWaterWastedLiters} Liters
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-zinc-200 shadow-2xs">
                    <span className="text-[10px] text-zinc-400 font-mono block flex items-center space-x-1">
                      <IndianRupee className="w-3 h-3 text-emerald-600" />
                      <span>FINANCIAL LOSS</span>
                    </span>
                    <span className="text-sm font-bold font-mono text-zinc-900 mt-0.5 block">
                      ₹{result.audit.financialLossInr}
                    </span>
                  </div>
                </div>

                {/* Volumetric Breakdown */}
                <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/70 text-xs space-y-1 font-mono">
                  <div className="flex justify-between text-zinc-500 text-[11px]">
                    <span>Plate Segmented Surface:</span>
                    <span className="text-zinc-800 font-medium">{result.visionMetrics.segmentedFoodAreaMm2} mm²</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 text-[11px]">
                    <span>Estimated 3D Volume:</span>
                    <span className="text-zinc-800 font-medium">{result.visionMetrics.estimatedFoodVolumeCm3} cm³</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 text-[11px]">
                    <span>Detected Food Remnant:</span>
                    <span className="text-zinc-800 font-medium">{result.visionMetrics.foodRemnantClass}</span>
                  </div>
                </div>

                {/* Behavioral Advice */}
                <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 leading-relaxed flex items-start space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                  <span>{result.recommendation}</span>
                </div>
              </div>
            ) : (
              <div className="h-64 rounded-lg border border-dashed border-zinc-200 flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                <Sparkles className="w-6 h-6 text-zinc-300 mb-2" />
                <p className="text-xs font-medium text-zinc-600">No Tray Scan Executed Yet</p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Choose a preset or live camera feed, then click "Execute AI Tray Audit".
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-100 text-[11px] text-zinc-400 flex justify-between items-center font-mono">
            <span>DEFRA & IPCC AR6</span>
            <span>SVVV Mess Ledger</span>
          </div>
        </div>
      </div>
    </div>
  );
};
