import React, { useState, useRef } from 'react';
import { 
  Camera, Upload, Sparkles, AlertCircle, CheckCircle2, 
  Info, History, ArrowRight, Utensils, RefreshCw, X, Image as ImageIcon,
  ChevronDown, ChevronUp, Tag, ShieldCheck
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

// Campus Departments for Attribution
const DEPARTMENTS = [
  { code: 'CSE', label: 'Computer Science & Engg' },
  { code: 'ME', label: 'Mechanical Engineering' },
  { code: 'MBA', label: 'Management Studies (MBA)' },
  { code: 'HOSTEL', label: 'Central Hostel Dining Council' },
];

interface AuditResult {
  status: string;
  timestamp: string;
  audit: {
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
    source: 'GEMINI_VISION' | string;
    department: string;
  };
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

interface PlateScannerProps {
  apiFetch?: typeof fetch;
  lockedDepartment?: string;
}

export const PlateScanner: React.FC<PlateScannerProps> = ({ apiFetch = fetch, lockedDepartment }) => {
  const [selectedDept, setSelectedDept] = useState<string>('Central Hostel Dining Council');
  const [customServingWeight, setCustomServingWeight] = useState<string>('');
  
  // Real Image State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Submission & Result States
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [showMethodology, setShowMethodology] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<AuditHistoryItem[]>([]);

  // Refs for hidden inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const processFile = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setScanError('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setScanError('Image file is too large. Maximum supported size is 10MB.');
      return;
    }

    setScanError(null);
    setErrorCode(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSelectedImage(base64);
      setImageFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        type: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    setResult(null);
    setScanError(null);
    setErrorCode(null);
  };

  // Run Real Audit
  const handleRunAudit = async () => {
    if (analyzing) return;

    if (!selectedImage) {
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
        imageBase64: selectedImage,
        mimeType: imageFile?.type || 'image/jpeg',
        originalServingWeightGrams: parsedWeight,
        mode: 'IMAGE',
        department: lockedDepartment || selectedDept,
        submissionId,
      };

      const res = await apiFetch(API_ENDPOINTS.scanPlate, {
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
      const title = data.audit?.visibleFoodItems?.slice(0, 2).join(', ') || 'AI Photo Audit';

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F5E9] border border-[#DCEBDD] text-[#166534]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            Low Visual Uncertainty
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
            High Visual Uncertainty
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5FBF5] border border-[#DCEBDD] text-[#166534]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635]" />
            Moderate Visual Uncertainty
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Section A: Page Heading ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#14532D] leading-tight">
            Food Waste Photo Audit
          </h2>
          <p className="text-sm text-[#64748B] mt-1">
            Analyze leftover food from dining plate photos using Gemini Vision decision support.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-[#166534] bg-white border border-[#DCEBDD] px-3 py-1.5 rounded-xl self-start sm:self-auto shadow-2xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
            Gemini Vision AI Core · +5 pts participation reward
          </span>
        </div>
      </div>

      {/* ── Section B: Real Photo Upload Card ───────────────────────────── */}
      <div className="bg-white border border-[#DCEBDD] rounded-3xl p-5 sm:p-6 shadow-card space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#14532D]">Select or Capture Plate Photo</h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Upload a clear photo of the dining plate or tray after your meal.
            </p>
          </div>
          {selectedImage && (
            <button
              type="button"
              onClick={handleClearImage}
              className="text-xs text-[#B45309] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
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

        {/* Drag & Drop Upload Zone */}
        {!selectedImage ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-[#166534] bg-[#E8F5E9]'
                : 'border-[#22C55E]/60 hover:border-[#166534] bg-[#F5FBF5]'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-white text-[#166534] border border-[#DCEBDD] flex items-center justify-center shadow-2xs">
              <ImageIcon className="w-6 h-6 stroke-[1.8]" />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#1F2937]">
                Drag and drop your plate photo here
              </p>
              <p className="text-xs text-[#64748B] mt-0.5">
                Supports JPEG, PNG, or WebP up to 10MB
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="px-4 py-2.5 min-h-[44px] bg-[#166534] hover:bg-[#14532D] text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Take Photo with Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 min-h-[44px] bg-white hover:bg-[#E8F5E9] border border-[#DCEBDD] text-[#166534] text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <Upload className="w-4 h-4" />
                <span>Browse Device Files</span>
              </button>
            </div>
          </div>
        ) : (
          /* Selected Image Preview */
          <div className="border border-[#DCEBDD] rounded-2xl p-4 bg-[#F5FBF5] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-[#DCEBDD] shrink-0 bg-black">
                  <img
                    src={selectedImage}
                    alt="Uploaded food plate"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1F2937] truncate">{imageFile?.name}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{imageFile?.size} · Ready for AI audit</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#166534] mt-1 bg-[#E8F5E9] px-2 py-0.5 rounded-md border border-[#DCEBDD]">
                    <CheckCircle2 className="w-3 h-3 text-[#22C55E]" /> Valid image format
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-[#166534] font-semibold px-3.5 py-2 rounded-xl border border-[#DCEBDD] bg-white hover:bg-[#E8F5E9] transition cursor-pointer min-h-[38px]"
                >
                  Replace Photo
                </button>
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="text-xs text-[#B45309] font-semibold px-3.5 py-2 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] hover:bg-[#FEF3C7] transition cursor-pointer min-h-[38px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Optional Meal Serving Weight & Department Attribution */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#DCEBDD]">
          {/* Optional Original Serving Weight */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1">
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
                className="w-full px-3 py-2 pr-12 rounded-xl border border-[#DCEBDD] bg-white text-sm text-[#1F2937] font-mono focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              />
              <span className="absolute right-3 top-2.5 text-xs text-[#64748B]">grams</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">
              Reference baseline: 380g standard thali. Used to compute approximate leftover mass.
            </p>
          </div>

          {/* Department Attribution */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1">
              Submitting Department
            </label>
            <select
              value={lockedDepartment || selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              disabled={Boolean(lockedDepartment)}
              className="w-full px-3 py-2 rounded-xl border border-[#DCEBDD] bg-white text-xs sm:text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#22C55E] min-h-[42px]"
            >
              {DEPARTMENTS.map(d => (
                <option key={d.code} value={d.label}>
                  {d.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#64748B] mt-1">
              +5 Green Credits will be credited using the authenticated account scope.
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-3 border-t border-[#DCEBDD] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-[#64748B]">
            Visual estimate relative to reference serving. No personal data or faces logged.
          </p>
          <button
            type="button"
            onClick={handleRunAudit}
            disabled={analyzing || !selectedImage}
            className="w-full sm:w-auto px-7 py-3.5 min-h-[48px] bg-[#166534] hover:bg-[#14532D] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer touch-manipulation focus:ring-2 focus:ring-[#22C55E]"
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

      {/* ── Section C: Error State ───────────────────────────────────────── */}
      {scanError && (
        <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-[#78350F]">Audit Unsuccessful</p>
            <p className="leading-relaxed">{scanError}</p>
          </div>
        </div>
      )}

      {/* ── Section D: Audit Results Display ─────────────────────────────── */}
      {result && (
        <div className="bg-white border border-[#DCEBDD] rounded-3xl p-5 sm:p-6 shadow-card space-y-5 animate-in fade-in-50 duration-200">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#DCEBDD]">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif text-lg font-bold text-[#14532D]">Audit Findings & Remnants Assessment</h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E8F5E9] border border-[#DCEBDD] text-[#166534]">
                  <Sparkles className="w-3 h-3 text-[#22C55E]" />
                  Gemini Vision AI Analysis
                </span>
                {getUncertaintyBadge(result.audit.uncertainty)}
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                Decision-support visual estimate · Not a certified physical scale measurement
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-xs text-[#64748B] block">Participation Points</span>
              <span className="text-base font-mono font-bold text-[#166534]">
                +{result.audit.greenCreditsEarned} pts
              </span>
              <span className="text-[11px] text-[#64748B] block">
                {result.audit.department}
              </span>
            </div>
          </div>

          {/* Uploaded Image & Identified Food Remnants */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {selectedImage && (
              <div className="md:col-span-4 rounded-2xl overflow-hidden border border-[#DCEBDD] bg-[#F5FBF5]">
                <img
                  src={selectedImage}
                  alt="Audited Plate"
                  className="w-full h-44 object-cover"
                />
                <p className="text-[11px] text-[#64748B] p-2 text-center bg-white border-t border-[#DCEBDD]">
                  Audited Image Frame
                </p>
              </div>
            )}

            <div className={selectedImage ? "md:col-span-8 space-y-3" : "md:col-span-12 space-y-3"}>
              <div>
                <span className="text-xs font-semibold text-[#166534] uppercase tracking-wider block mb-1.5">
                  Identified Food Remnants
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.audit.visibleFoodItems.length > 0 ? (
                    result.audit.visibleFoodItems.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-[#F5FBF5] border border-[#DCEBDD] text-[#14532D]"
                      >
                        <Tag className="w-3 h-3 text-[#22C55E]" />
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#64748B]">No distinct food items identified.</span>
                  )}
                </div>
              </div>

              {/* Plain-English Observation */}
              <div className="p-4 rounded-2xl bg-[#F5FBF5] border border-[#DCEBDD]">
                <p className="text-xs font-semibold text-[#14532D] mb-1">Visual Observations</p>
                <p className="text-xs text-[#1F2937]/80 leading-relaxed">
                  {result.audit.visualObservations}
                </p>
              </div>

              {/* Visual Limitations */}
              {result.audit.limitations && (
                <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[11px] text-[#92400E]">
                  <strong>Inspection Note:</strong> {result.audit.limitations}
                </div>
              )}
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Remaining Portion % */}
            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#FDE68A]">
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
            <div className="p-4 rounded-2xl bg-[#F5FBF5] border border-[#DCEBDD]">
              <span className="text-xs text-[#166534] font-medium block mb-1">
                Estimated Leftover Mass
              </span>
              <p className="text-2xl font-mono font-bold text-[#14532D]">
                {result.audit.estimatedLeftoverWeightGrams !== null ? `~${result.audit.estimatedLeftoverWeightGrams}g` : 'Omitted'}
              </p>
              <p className="text-[11px] text-[#64748B] mt-1 truncate" title={result.audit.servingWeightAssumption}>
                {result.audit.servingWeightAssumption}
              </p>
            </div>

            {/* 3. Participation Reward */}
            <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#DCEBDD]">
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
          <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#DCEBDD] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
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
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#166534] hover:text-[#14532D] border border-[#DCEBDD] bg-white hover:bg-[#E8F5E9] transition cursor-pointer"
            >
              Audit Another Plate
            </button>
          </div>
        </div>
      )}

      {/* ── Section F: Methodology & Audit Principles Disclosure ────────── */}
      <div className="bg-white border border-[#DCEBDD] rounded-3xl overflow-hidden shadow-card">
        <button
          type="button"
          onClick={() => setShowMethodology(v => !v)}
          className="w-full px-5 py-4 min-h-[44px] flex items-center justify-between text-left hover:bg-[#F5FBF5] transition cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-[#166534]">
            <Info className="w-4 h-4 shrink-0 text-[#22C55E]" />
            <span>How are these estimates derived? (Audit Methodology & Principles)</span>
          </div>
          {showMethodology ? <ChevronUp className="w-4 h-4 text-[#64748B] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#64748B] shrink-0" />}
        </button>

        {showMethodology && (
          <div className="px-5 pb-5 pt-1 space-y-4 border-t border-[#DCEBDD] text-xs text-[#64748B] leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#F5FBF5] border border-[#DCEBDD] space-y-1.5">
                <p className="font-semibold text-[#14532D]">Vision AI Estimation Principles</p>
                <p>• <strong>Visual Fraction:</strong> The AI model evaluates visible tray remnants relative to a standard full single serving.</p>
                <p>• <strong>No False Precision:</strong> Pixels alone cannot establish physical mass. Gram estimates rely on the stated serving assumption.</p>
                <p>• <strong>Uncertainty Tagging:</strong> Estimates are qualitatively labeled with low, medium, or high uncertainty based on lighting, depth, and item overlap.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5FBF5] border border-[#DCEBDD] space-y-1.5">
                <p className="font-semibold text-[#14532D]">Participation & Reward Rules</p>
                <p>• <strong>Participation Credit:</strong> Submitting a valid plate audit awards +5 Green Credits to your department for accountability.</p>
                <p>• <strong>Honest Outcomes:</strong> Photo audits do not claim to reduce food waste on their own; credits reward conscientiousness and data collection.</p>
                <p>• <strong>Duplicate Prevention:</strong> Resubmissions of identical plate photos are identified and prevent double-awarding credits.</p>
              </div>
            </div>

            <p className="text-[11px] text-[#64748B]">
              Disclaimer: This system provides decision-support estimates to raise awareness and support mess preparation planning. It does not replace certified laboratory calorimetry or legal trade weighing.
            </p>
          </div>
        )}
      </div>

      {/* Session Audit History */}
      {historyList.length > 0 && (
        <div className="bg-white border border-[#DCEBDD] rounded-3xl p-5 sm:p-6 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-[#166534]" />
            <h3 className="font-serif text-base font-bold text-[#14532D]">Recent Audits (This Session)</h3>
          </div>
          <div className="divide-y divide-[#DCEBDD]">
            {historyList.map(item => (
              <div key={item.id} className="py-3 flex flex-col xs:flex-row xs:items-center justify-between text-xs gap-1">
                <div>
                  <span className="font-semibold text-[#1F2937]">{item.title}</span>
                  <span className="text-[#64748B] ml-1.5 text-[11px]">at {item.timestamp}</span>
                  <span className="text-[10px] ml-1.5 px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#166534] font-semibold">
                    AI Vision
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px] sm:text-xs">
                  <span className="text-[#B45309]">
                    {item.wastedGrams !== null ? `~${item.wastedGrams}g` : ''} ({item.leftoverPct}%)
                  </span>
                  <span className="text-[#166534] font-bold">+{item.creditsEarned} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
