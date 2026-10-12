import React, { useState, useRef } from 'react';
import { 
  Camera, Utensils, AlertCircle, Award, Droplets, 
  Flame, IndianRupee, RefreshCw, CheckCircle2, ChevronDown, 
  ChevronUp, Info, History, Sparkles, Leaf, Upload, X,
  SlidersHorizontal, ShieldCheck, Image as ImageIcon,
  Tag, HelpCircle
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

interface FoodAuditResult {
  isFoodImage: boolean;
  visibleFoodItems: string[];
  remainingPortionPercent: number;
  estimatedLeftoverWeightGrams: number | null;
  servingWeightAssumption: string;
  visualObservations: string;
  uncertainty: 'low' | 'medium' | 'high';
  limitations: string | null;
  greenCreditsEarned: number;
  isDuplicate: boolean;
  source: 'GEMINI_VISION' | 'CALIBRATED_PRESET_SIMULATION';
  department: string;
  // Backwards-compatible fields
  standardMealWeightGrams: number;
  estimatedFoodWastedGrams: number;
  leftoverPercentage: number;
  foodRemnantClass: string;
}

interface ScanResponse {
  status: string;
  timestamp: string;
  audit: FoodAuditResult;
  recommendation: string;
}

interface AuditHistoryItem {
  id: string;
  timestamp: string;
  title: string;
  wastedGrams: number | null;
  leftoverPct: number;
  creditsEarned: number;
  source: string;
}

export const PlateScanner: React.FC = () => {
  // Mode selection: Real Photo Audit (default) vs Calibrated Preset Simulation
  const [auditMode, setAuditMode] = useState<'PHOTO' | 'PRESET'>('PHOTO');
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<'CLEAN_TRAY' | 'NORMAL_TRAY' | 'HEAVY_WASTE'>('NORMAL_TRAY');

  // Real Image Input State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Optional user serving weight input (in grams)
  const [customServingWeight, setCustomServingWeight] = useState<string>('380');

  // Submitting Department
  const [selectedDept, setSelectedDept] = useState<string>('Central Hostel Dining Council');

  // Audit Result & Error States
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);
  const [historyList, setHistoryList] = useState<AuditHistoryItem[]>([]);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const DEPARTMENTS = [
    { label: 'Central Hostel Dining Council', code: 'HOSTEL' },
    { label: 'Computer Science & Engg', code: 'CSE' },
    { label: 'Mechanical Engineering', code: 'ME' },
    { label: 'Management Studies (MBA)', code: 'MBA' },
    { label: 'Information Technology', code: 'IT' },
  ];

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

  // Helper to process uploaded file
  const handleProcessFile = (file: File) => {
    // Validate MIME type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp|heic)$/i)) {
      setScanError('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setScanError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 10MB limit.`);
      return;
    }

    setScanError(null);
    setErrorCode(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setSelectedImage(dataUrl);
      setImageFile({
        name: file.name,
        size: file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
          : `${Math.round(file.size / 1024)} KB`,
        type: file.type || 'image/jpeg',
      });
      setResult(null);
    };
    reader.onerror = () => {
      setScanError('Failed to read the selected image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleProcessFile(files[0]);
    }
    // Reset file input value so re-selecting same file triggers onChange
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    setScanError(null);
    setErrorCode(null);
  };

  const handleRunAudit = async () => {
    if (analyzing) return;

    if (auditMode === 'PHOTO' && !selectedImage) {
      setScanError('Please upload or take a photo of a food plate first.');
      return;
    }

    setAnalyzing(true);
    setScanError(null);
    setErrorCode(null);

    try {
      const parsedWeight = customServingWeight && !isNaN(Number(customServingWeight))
        ? Number(customServingWeight)
        : null;

      const submissionId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const payload = {
        imageBase64: auditMode === 'PHOTO' ? selectedImage : null,
        mimeType: imageFile?.type || 'image/jpeg',
        originalServingWeightGrams: parsedWeight,
        simulatedPlateType: selectedPreset,
        mode: auditMode === 'PHOTO' ? 'IMAGE' : 'PRESET',
        department: selectedDept,
        submissionId,
      };

      const res = await fetch(API_ENDPOINTS.scanPlate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.status === 'error') {
        const msg = data?.error || `Server returned HTTP ${res.status}`;
        setScanError(msg);
        setErrorCode(data?.code || 'ERROR');
        setResult(null);
        return;
      }

      setResult(data);
      setScanError(null);

      // Record in session audit history
      const title = data.audit.source === 'GEMINI_VISION'
        ? (data.audit.visibleFoodItems.slice(0, 2).join(', ') || 'AI Photo Audit')
        : (selectedPreset === 'CLEAN_TRAY' ? 'Zero-Waste Tray' : selectedPreset === 'NORMAL_TRAY' ? 'Average Thali' : 'High Waste Tray');

      const newHistoryItem: AuditHistoryItem = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title,
        wastedGrams: data.audit.estimatedLeftoverWeightGrams,
        leftoverPct: data.audit.remainingPortionPercent,
        creditsEarned: data.audit.greenCreditsEarned,
        source: data.audit.source,
      };
      setHistoryList(prev => [newHistoryItem, ...prev.slice(0, 4)]);
    } catch (err: any) {
      console.error('Failed to run plate audit:', err);
      setScanError(err.message || 'Network error while contacting the audit service.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getUncertaintyBadge = (uncertainty: 'low' | 'medium' | 'high') => {
    switch (uncertainty) {
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            Low Visual Uncertainty
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            High Visual Uncertainty
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
            Moderate Visual Uncertainty
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Section A: Page Heading & Botanical Context ─────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#191C1A] leading-tight">
            Food Waste Photo Audit
          </h2>
          <p className="text-sm text-[#486340] mt-1">
            Analyze leftover food from dining plate photos using Gemini Vision decision support.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-[#8E9789] bg-[#F5F7F0] border border-[#E0E8DA] px-2.5 py-1.5 rounded-lg self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-[#1B3826]" />
            Gemini Vision AI Core · +5 pts participation reward
          </span>
        </div>
      </div>

      {/* ── Section B: Mode Tabs (Photo Audit vs Calibrated Preset) ─────── */}
      <div className="flex items-center gap-2 border-b border-[#D8E4D2] pb-3">
        <button
          type="button"
          onClick={() => {
            setAuditMode('PHOTO');
            setScanError(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
            auditMode === 'PHOTO'
              ? 'bg-[#1B3826] text-white shadow-xs'
              : 'bg-white text-[#486340] hover:bg-[#F2F7F0] border border-[#D8E4D2]'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Photo Audit (Gemini Vision)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAuditMode('PRESET');
            setScanError(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
            auditMode === 'PRESET'
              ? 'bg-[#1B3826] text-white shadow-xs'
              : 'bg-white text-[#486340] hover:bg-[#F2F7F0] border border-[#D8E4D2]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Calibrated Preset (Simulation)</span>
        </button>
      </div>

      {/* ── Section C: Real Photo Upload Card (when auditMode === 'PHOTO') ── */}
      {auditMode === 'PHOTO' && (
        <div className="bg-white border border-[#D8E4D2] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#191C1A]">1. Select or Capture Plate Photo</h3>
              <p className="text-xs text-[#8E9789] mt-0.5">
                Upload a clear photo of the dining plate or tray after your meal.
              </p>
            </div>
            {selectedImage && (
              <button
                type="button"
                onClick={handleClearImage}
                className="text-xs text-[#B45309] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove photo</span>
              </button>
            )}
          </div>

          {/* Hidden inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {/* Drag & Drop Upload Zone (when no image selected) */}
          {!selectedImage ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-[#1B3826] bg-[#F2F7F0]'
                  : 'border-[#CADBC4] hover:border-[#1B3826] bg-[#FAF8F5]'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-[#EAF2E7] text-[#1B3826] flex items-center justify-center">
                <ImageIcon className="w-6 h-6 stroke-[1.8]" />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#191C1A]">
                  Drag and drop your plate photo here
                </p>
                <p className="text-xs text-[#8E9789] mt-0.5">
                  Supports JPEG, PNG, or WebP up to 10MB
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                {/* Mobile Camera Button */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-4 py-2.5 min-h-[44px] bg-[#1B3826] hover:bg-[#254D36] text-white text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Photo with Camera</span>
                </button>

                {/* File Picker Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 min-h-[44px] bg-white hover:bg-[#F2F7F0] border border-[#CADBC4] text-[#486340] text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>Browse Device Files</span>
                </button>
              </div>
            </div>
          ) : (
            /* Selected Image Preview */
            <div className="border border-[#D8E4D2] rounded-xl p-3 sm:p-4 bg-[#FAF8F5] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-[#CADBC4] shrink-0 bg-black">
                    <img
                      src={selectedImage}
                      alt="Uploaded food plate"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#191C1A] truncate">{imageFile?.name}</p>
                    <p className="text-xs text-[#8E9789] mt-0.5">{imageFile?.size} · Ready for AI audit</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#166534] mt-1 bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#BBF7D0]">
                      <CheckCircle2 className="w-3 h-3" /> Valid image format
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[#486340] hover:text-[#1B3826] font-semibold px-3 py-1.5 rounded-lg border border-[#CADBC4] hover:bg-white transition cursor-pointer min-h-[36px]"
                  >
                    Replace Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="text-xs text-[#B45309] hover:bg-[#FEF3C7] font-semibold px-3 py-1.5 rounded-lg border border-[#FDE68A] transition cursor-pointer min-h-[36px]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Optional Meal Serving Weight & Department Attribution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#EDF0E9]">
            {/* Optional Original Serving Weight */}
            <div>
              <label className="block text-xs font-semibold text-[#191C1A] mb-1">
                Original Serving Weight (optional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="50"
                  max="2000"
                  value={customServingWeight}
                  onChange={(e) => setCustomServingWeight(e.target.value)}
                  placeholder="380"
                  className="w-full px-3 py-2 pr-12 rounded-xl border border-[#D8E4D2] bg-white text-sm text-[#191C1A] font-mono focus:outline-none focus:ring-2 focus:ring-[#1B3826]"
                />
                <span className="absolute right-3 top-2.5 text-xs text-[#8E9789]">grams</span>
              </div>
              <p className="text-[11px] text-[#8E9789] mt-1">
                Reference baseline: 380g standard thali. Used to compute approximate leftover mass.
              </p>
            </div>

            {/* Department Attribution */}
            <div>
              <label className="block text-xs font-semibold text-[#191C1A] mb-1">
                Submitting Department
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D8E4D2] bg-white text-xs sm:text-sm text-[#191C1A] focus:outline-none focus:ring-2 focus:ring-[#1B3826] min-h-[42px]"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d.code} value={d.label}>
                    {d.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#8E9789] mt-1">
                +5 Green Credits will be credited to this department upon successful audit.
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-3 border-t border-[#EDF0E9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-[#8E9789]">
              Visual estimate relative to reference serving. No personal data or faces logged.
            </p>
            <button
              type="button"
              onClick={handleRunAudit}
              disabled={analyzing || !selectedImage}
              className="w-full sm:w-auto px-6 py-3 min-h-[48px] bg-[#1B3826] hover:bg-[#254D36] active:bg-[#142A1D] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#1B3826]"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Food Remnants with Gemini Vision…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Plate Photo · +5 pts</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Section C2: Calibrated Preset Mode Card (when auditMode === 'PRESET') ── */}
      {auditMode === 'PRESET' && (
        <div className="bg-white border border-[#D8E4D2] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[#191C1A]">1. Choose a Calibrated Preset</h3>
            <p className="text-xs text-[#8E9789] mt-0.5">
              Select a representative tray condition for quick demonstration without camera access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
            {PRESETS.map((p) => {
              const isSelected = selectedPreset === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setSelectedPreset(p.key)}
                  className={`text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all relative cursor-pointer min-h-[58px] active:scale-[0.99] touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#1B3826] ${
                    isSelected
                      ? 'border-[#1B3826] bg-[#F2F7F0] shadow-2xs ring-1 ring-[#1B3826]/10'
                      : 'border-[#E0E8DA] hover:border-[#CADBC4] bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-sm font-semibold ${isSelected ? 'text-[#1B3826]' : 'text-[#191C1A]'}`}>
                      {p.label}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white border border-[#D8E4D2] text-[#486340] shrink-0">
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

          <div className="pt-3 border-t border-[#EDF0E9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-[#8E9789]">
              Simulated institutional meal benchmark · Standard 380g thali portion.
            </p>
            <button
              type="button"
              onClick={handleRunAudit}
              disabled={analyzing}
              className="w-full sm:w-auto px-6 py-3 min-h-[48px] bg-[#1B3826] hover:bg-[#254D36] text-white text-sm font-semibold rounded-xl transition shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Calculating Benchmark…</span>
                </>
              ) : (
                <>
                  <Utensils className="w-4 h-4" />
                  <span>Run Calibrated Preset Audit · +5 pts</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Section D: Error State ───────────────────────────────────────── */}
      {scanError && (
        <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-[#78350F]">Audit Unsuccessful</p>
            <p className="leading-relaxed">{scanError}</p>
            {errorCode === 'MISSING_API_KEY' && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuditMode('PRESET');
                    setScanError(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-white font-medium text-xs transition cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Switch to Calibrated Preset Mode (No API Key Required)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Section E: Audit Results Display ─────────────────────────────── */}
      {result && (
        <div className="bg-white border border-[#D8E4D2] rounded-2xl p-5 shadow-2xs space-y-5 animate-in fade-in-50 duration-200">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDF0E9]">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-[#191C1A]">2. Audit Findings & Remnants Assessment</h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EAF2E7] border border-[#CADBC4] text-[#1B3826]">
                  {result.audit.source === 'GEMINI_VISION' ? (
                    <>
                      <Sparkles className="w-3 h-3 text-[#1B3826]" />
                      Gemini Vision AI Analysis
                    </>
                  ) : (
                    <>
                      <SlidersHorizontal className="w-3 h-3 text-[#1B3826]" />
                      Calibrated Simulation
                    </>
                  )}
                </span>
                {getUncertaintyBadge(result.audit.uncertainty)}
              </div>
              <p className="text-xs text-[#8E9789] mt-1">
                Decision-support visual estimate · Not a certified physical scale measurement
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-xs text-[#8E9789] block">Participation Points</span>
              <span className="text-base font-mono font-bold text-[#1B3826]">
                +{result.audit.greenCreditsEarned} pts
              </span>
              <span className="text-[11px] text-[#486340] block">
                {result.audit.department}
              </span>
            </div>
          </div>

          {/* Uploaded Image & Identified Food Remnants */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {selectedImage && result.audit.source === 'GEMINI_VISION' && (
              <div className="md:col-span-4 rounded-xl overflow-hidden border border-[#D8E4D2] bg-[#FAF8F5]">
                <img
                  src={selectedImage}
                  alt="Audited Plate"
                  className="w-full h-44 object-cover"
                />
                <p className="text-[11px] text-[#8E9789] p-2 text-center bg-white border-t border-[#EDF0E9]">
                  Audited Image Frame
                </p>
              </div>
            )}

            <div className={selectedImage && result.audit.source === 'GEMINI_VISION' ? "md:col-span-8 space-y-3" : "md:col-span-12 space-y-3"}>
              <div>
                <span className="text-xs font-semibold text-[#486340] uppercase tracking-wider block mb-1.5">
                  Identified Food Remnants
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.audit.visibleFoodItems.length > 0 ? (
                    result.audit.visibleFoodItems.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F5F7F0] border border-[#D8E4D2] text-[#191C1A]"
                      >
                        <Tag className="w-3 h-3 text-[#486340]" />
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#8E9789]">No distinct food items identified.</span>
                  )}
                </div>
              </div>

              {/* Plain-English Observation */}
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA]">
                <p className="text-xs font-semibold text-[#191C1A] mb-1">Visual Observations</p>
                <p className="text-xs text-[#486340] leading-relaxed">
                  {result.audit.visualObservations}
                </p>
              </div>

              {/* Visual Limitations (if reported) */}
              {result.audit.limitations && (
                <div className="p-2.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[11px] text-[#92400E]">
                  <strong>Inspection Note:</strong> {result.audit.limitations}
                </div>
              )}
            </div>
          </div>

          {/* Metric Cards: Remaining Portion % & Estimated Grams */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Remaining Portion % */}
            <div className="p-4 rounded-xl bg-[#FFFDF7] border border-[#FDE68A]">
              <span className="text-xs text-[#B45309] font-medium block mb-1">
                Estimated Remaining Portion
              </span>
              <p className="text-2xl font-mono font-bold text-[#B45309]">
                ~{result.audit.remainingPortionPercent}%
              </p>
              <p className="text-[11px] text-[#92400E] mt-1">
                Relative to reference single serving
              </p>
            </div>

            {/* 2. Estimated Leftover Mass */}
            <div className="p-4 rounded-xl bg-[#F5F7F0] border border-[#D8E4D2]">
              <span className="text-xs text-[#486340] font-medium block mb-1">
                Estimated Leftover Mass
              </span>
              <p className="text-2xl font-mono font-bold text-[#191C1A]">
                {result.audit.estimatedLeftoverWeightGrams !== null ? `~${result.audit.estimatedLeftoverWeightGrams}g` : 'Omitted'}
              </p>
              <p className="text-[11px] text-[#8E9789] mt-1 truncate" title={result.audit.servingWeightAssumption}>
                {result.audit.servingWeightAssumption}
              </p>
            </div>

            {/* 3. Participation Reward */}
            <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
              <span className="text-xs text-[#166534] font-medium block mb-1">
                Audit Participation Credit
              </span>
              <p className="text-2xl font-mono font-bold text-[#166534]">
                +{result.audit.greenCreditsEarned} pts
              </p>
              <p className="text-[11px] text-[#15803D] mt-1">
                {result.audit.isDuplicate ? 'Already credited for this plate' : 'Credited to department leaderboard'}
              </p>
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

          {/* Reset button */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setSelectedImage(null);
                setImageFile(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#486340] hover:text-[#1B3826] border border-[#CADBC4] hover:bg-[#F2F7F0] transition cursor-pointer"
            >
              Audit Another Plate
            </button>
          </div>
        </div>
      )}

      {/* ── Section F: Methodology & Audit Principles Disclosure ────────── */}
      <div className="bg-white border border-[#D8E4D2] rounded-2xl overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setShowMethodology(v => !v)}
          className="w-full px-4 sm:px-5 py-3.5 min-h-[44px] flex items-center justify-between text-left hover:bg-[#F9F7F2] transition cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#1B3826]"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-[#486340]">
            <Info className="w-4 h-4 shrink-0" />
            <span>How are these estimates derived? (Audit Methodology & Principles)</span>
          </div>
          {showMethodology ? <ChevronUp className="w-4 h-4 text-[#8E9789] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#8E9789] shrink-0" />}
        </button>

        {showMethodology && (
          <div className="px-4 sm:px-5 pb-5 pt-1 space-y-4 border-t border-[#EDF0E9] text-xs text-[#6B7B68] leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA] space-y-1.5">
                <p className="font-semibold text-[#191C1A]">Vision AI Estimation Principles</p>
                <p>• <strong>Visual Fraction:</strong> The AI model evaluates visible tray remnants relative to a standard full single serving.</p>
                <p>• <strong>No False Precision:</strong> Pixels alone cannot establish physical mass. Gram estimates rely on the stated serving assumption.</p>
                <p>• <strong>Uncertainty Tagging:</strong> Estimates are qualitatively labeled with low, medium, or high uncertainty based on lighting, depth, and item overlap.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E0E8DA] space-y-1.5">
                <p className="font-semibold text-[#191C1A]">Participation & Reward Rules</p>
                <p>• <strong>Participation Credit:</strong> Submitting a valid plate audit awards +5 Green Credits to your department for accountability.</p>
                <p>• <strong>Honest Outcomes:</strong> Photo audits do not claim to reduce food waste on their own; credits reward conscientiousness and data collection.</p>
                <p>• <strong>Duplicate Prevention:</strong> Resubmissions of identical plate photos are identified and prevent double-awarding credits.</p>
              </div>
            </div>

            <p className="text-[11px] text-[#8E9789]">
              Disclaimer: This system provides decision-support estimates to raise awareness and support mess preparation planning. It does not replace certified laboratory calorimetry or legal trade weighing.
            </p>
          </div>
        )}
      </div>

      {/* Session Audit History (if any audits were run this session) */}
      {historyList.length > 0 && (
        <div className="bg-white border border-[#D8E4D2] rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-[#486340]" />
            <h3 className="text-sm font-semibold text-[#191C1A]">Recent Audits (This Session)</h3>
          </div>
          <div className="divide-y divide-[#EDF0E9]">
            {historyList.map(item => (
              <div key={item.id} className="py-2.5 flex flex-col xs:flex-row xs:items-center justify-between text-xs gap-1">
                <div>
                  <span className="font-medium text-[#191C1A]">{item.title}</span>
                  <span className="text-[#8E9789] ml-1.5 text-[11px]">at {item.timestamp}</span>
                  <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-[#F0EBE0] text-[#486340] font-mono">
                    {item.source === 'GEMINI_VISION' ? 'AI Vision' : 'Preset'}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px] sm:text-xs">
                  <span className="text-[#B45309]">
                    {item.wastedGrams !== null ? `~${item.wastedGrams}g` : ''} ({item.leftoverPct}%)
                  </span>
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
