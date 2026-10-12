import crypto from 'crypto';
import { GoogleGenAI, Type } from '@google/genai';

export interface FoodAuditInput {
  imageBuffer: Buffer;
  mimeType: string;
  originalServingWeightGrams?: number | null;
  submissionId?: string;
  department?: string;
}

export interface FoodAuditAnalysis {
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
}

export interface ImageValidationResult {
  valid: boolean;
  mimeType?: string;
  error?: string;
}

// In-memory submission cache to prevent duplicate point awards (recent SHA-256 hashes)
const processedSubmissions = new Map<string, { timestamp: number; result: FoodAuditAnalysis }>();

/**
 * Validates image buffer magic bytes and size constraints.
 * Supports JPEG, PNG, WebP, and HEIC.
 */
export function validateImageBuffer(buffer: Buffer): ImageValidationResult {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    return { valid: false, error: 'No image buffer provided or payload is invalid.' };
  }

  // Max 10MB
  const MAX_SIZE_BYTES = 10 * 1024 * 1024;
  if (buffer.length > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `Image file exceeds maximum allowable size of 10MB (${(buffer.length / (1024 * 1024)).toFixed(1)}MB provided).`
    };
  }

  // Min size check for valid image header
  if (buffer.length < 32) {
    return { valid: false, error: 'Image file is too small or corrupt.' };
  }

  // 1. JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { valid: true, mimeType: 'image/jpeg' };
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0D &&
    buffer[5] === 0x0A &&
    buffer[6] === 0x1A &&
    buffer[7] === 0x0A
  ) {
    return { valid: true, mimeType: 'image/png' };
  }

  // 3. WebP: RIFF .... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { valid: true, mimeType: 'image/webp' };
  }

  // 4. HEIC / HEIF: ....ftyp (heic, mif1, etc.)
  if (
    buffer.subarray(4, 8).toString('ascii') === 'ftyp' &&
    (buffer.subarray(8, 12).toString('ascii').startsWith('he') ||
     buffer.subarray(8, 12).toString('ascii').startsWith('mi'))
  ) {
    return { valid: true, mimeType: 'image/heic' };
  }

  return {
    valid: false,
    error: 'Unsupported image format. Please upload a valid JPEG, PNG, or WebP photo.'
  };
}

/**
 * Computes a SHA-256 fingerprint for deduplication.
 */
export function computeImageHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Checks if this image hash or submissionId was already processed and awarded points.
 */
export function checkDuplicateSubmission(fingerprint: string): FoodAuditAnalysis | null {
  const existing = processedSubmissions.get(fingerprint);
  if (!existing) return null;
  // Expire after 1 hour to allow fresh audits on new sessions if needed
  if (Date.now() - existing.timestamp > 3600000) {
    processedSubmissions.delete(fingerprint);
    return null;
  }
  return existing.result;
}

/**
 * Records a completed audit submission fingerprint.
 */
export function recordProcessedSubmission(fingerprint: string, result: FoodAuditAnalysis): void {
  processedSubmissions.set(fingerprint, {
    timestamp: Date.now(),
    result: { ...result, isDuplicate: true, greenCreditsEarned: 0 }
  });
}

/**
 * Executes structured food waste analysis via Google GenAI SDK (Gemini Vision).
 */
export async function analyzeFoodPlateImage(input: FoodAuditInput): Promise<{
  success: boolean;
  analysis?: FoodAuditAnalysis;
  error?: string;
  code?: 'MISSING_API_KEY' | 'INVALID_IMAGE' | 'NOT_FOOD_IMAGE' | 'GEMINI_ERROR' | 'VALIDATION_FAILED';
}> {
  // 1. Validate image buffer
  const validation = validateImageBuffer(input.imageBuffer);
  if (!validation.valid || !validation.mimeType) {
    return {
      success: false,
      code: 'INVALID_IMAGE',
      error: validation.error || 'Invalid image buffer.'
    };
  }

  // 2. Check for duplicate submission
  const imageHash = computeImageHash(input.imageBuffer);
  const duplicateKey = input.submissionId || imageHash;
  const existing = checkDuplicateSubmission(duplicateKey);
  if (existing) {
    return {
      success: true,
      analysis: {
        ...existing,
        isDuplicate: true,
        greenCreditsEarned: 0,
      }
    };
  }

  // 3. Verify Gemini API Key configuration
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return {
      success: false,
      code: 'MISSING_API_KEY',
      error: 'Google Gemini API key is not configured. Set GEMINI_API_KEY in backend/.env to run live AI audits, or use Calibrated Preset mode for offline demonstration.'
    };
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  try {
    const ai = new GoogleGenAI({ apiKey });

    const promptText = `You are a food-waste and institutional dining hall auditor assisting EcoPulse.
Analyze this photo of a dining tray, plate, or food container to assess remaining food remnants.

Instructions:
1. Inspect ONLY what is visibly present in the image.
2. Distinguish directly observed food items from assumptions.
3. If the image does NOT depict food, dining plates, bowls, trays, or meal remnants (e.g. human selfies, office items, landscapes, animals, blank/blurred frames), set "isFoodImage" to false, leave "visibleFoodItems" empty, set "remainingPortionPercent" to 0, and describe what is visible in "visualObservations".
4. If food is present, set "isFoodImage" to true.
5. Estimate "remainingPortionPercent" strictly as a percentage from 0 to 100 relative to a reference full single-person serving:
   - 0-5%: Negligible remnants / essentially clean plate surface.
   - 6-20%: Minor leftover scraps (e.g. small pool of curry or bread crust).
   - 21-50%: Substantial leftover portion (e.g. half-eaten rice or unfinished vegetable dish).
   - >50%: Majority of meal uneaten.
6. Do NOT claim exact pixel-to-gram mass measurements.
7. Assess qualitative uncertainty as "low", "medium", or "high" based on lighting, camera angle, and item overlap.
8. Note any relevant limitations (e.g. deep container obscuring volume, mixed sauce concealing items, angle occlusion) in "limitations".
9. Never output fake precision or claim certified scale measurements.`;

    // Call Gemini with strict structured schema
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        promptText,
        {
          inlineData: {
            mimeType: validation.mimeType,
            data: input.imageBuffer.toString('base64'),
          },
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isFoodImage: {
              type: Type.BOOLEAN,
              description: 'Whether the image plausibly depicts food, dining trays, or meal leftovers.',
            },
            visibleFoodItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Identifiable food items visibly present on the plate.',
            },
            remainingPortionPercent: {
              type: Type.NUMBER,
              description: 'Estimated remaining food percentage relative to a reference full serving (0 to 100).',
            },
            visualObservations: {
              type: Type.STRING,
              description: 'Clear, factual plain-English observation of what remains visible.',
            },
            uncertainty: {
              type: Type.STRING,
              description: 'Qualitative uncertainty assessment: low, medium, or high.',
            },
            limitations: {
              type: Type.STRING,
              description: 'Relevant visual limitations such as container depth, angle, or lighting.',
            },
          },
          required: [
            'isFoodImage',
            'visibleFoodItems',
            'remainingPortionPercent',
            'visualObservations',
            'uncertainty',
          ],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      return {
        success: false,
        code: 'GEMINI_ERROR',
        error: 'Gemini Vision returned an empty response. Please try again.'
      };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      return {
        success: false,
        code: 'VALIDATION_FAILED',
        error: 'Failed to parse structured response from Gemini Vision.'
      };
    }

    // Server-side validation of response schema
    if (typeof parsed.isFoodImage !== 'boolean') {
      return {
        success: false,
        code: 'VALIDATION_FAILED',
        error: 'Model response missing valid isFoodImage boolean.'
      };
    }

    // Rejection of non-food images
    if (!parsed.isFoodImage) {
      return {
        success: false,
        code: 'NOT_FOOD_IMAGE',
        error: `No food or dining plate detected in the uploaded photo. (${parsed.visualObservations || 'Please point camera at a food plate or tray.'})`
      };
    }

    // Validate and clamp percentage
    let rawPercent = typeof parsed.remainingPortionPercent === 'number' ? parsed.remainingPortionPercent : 0;
    const remainingPortionPercent = Math.min(100, Math.max(0, Math.round(rawPercent)));

    const visibleFoodItems: string[] = Array.isArray(parsed.visibleFoodItems)
      ? parsed.visibleFoodItems.filter((i: any) => typeof i === 'string' && i.trim().length > 0)
      : [];

    const visualObservations: string = typeof parsed.visualObservations === 'string' && parsed.visualObservations.trim().length > 0
      ? parsed.visualObservations.trim()
      : 'Visual inspection completed.';

    const uncertaintyRaw = typeof parsed.uncertainty === 'string' ? parsed.uncertainty.toLowerCase() : 'medium';
    const uncertainty: 'low' | 'medium' | 'high' =
      uncertaintyRaw === 'low' || uncertaintyRaw === 'high' ? uncertaintyRaw : 'medium';

    const limitations: string | null = typeof parsed.limitations === 'string' && parsed.limitations.trim().length > 0
      ? parsed.limitations.trim()
      : null;

    // Weight estimate derivation:
    // If user provided custom originalServingWeightGrams, use that.
    // If not, benchmark against 380g standard hostel thali.
    let estimatedLeftoverWeightGrams: number | null = null;
    let servingWeightAssumption: string;

    if (typeof input.originalServingWeightGrams === 'number' && input.originalServingWeightGrams > 0) {
      estimatedLeftoverWeightGrams = Math.round((remainingPortionPercent / 100) * input.originalServingWeightGrams);
      servingWeightAssumption = `Estimated from user-specified ${input.originalServingWeightGrams}g original portion.`;
    } else {
      estimatedLeftoverWeightGrams = Math.round((remainingPortionPercent / 100) * 380);
      servingWeightAssumption = 'Derived from reference 380g standard mess thali baseline (visual estimate, not physically weighed).';
    }

    const auditResult: FoodAuditAnalysis = {
      isFoodImage: true,
      visibleFoodItems,
      remainingPortionPercent,
      estimatedLeftoverWeightGrams,
      servingWeightAssumption,
      visualObservations,
      uncertainty,
      limitations,
      greenCreditsEarned: 5, // Exactly +5 participation points per audit
      isDuplicate: false,
      source: 'GEMINI_VISION',
    };

    // Record submission to avoid double credit on immediate resubmission
    recordProcessedSubmission(duplicateKey, auditResult);

    return {
      success: true,
      analysis: auditResult,
    };
  } catch (err: any) {
    console.error('Gemini Vision analysis error:', err);
    const msg = err?.message || 'Unknown vision error';
    
    if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
      return {
        success: false,
        code: 'MISSING_API_KEY',
        error: 'The configured GEMINI_API_KEY is invalid. Please check your Google AI Studio key in backend/.env.'
      };
    }
    if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
      return {
        success: false,
        code: 'GEMINI_ERROR',
        error: 'Gemini API quota exceeded or rate-limited. Please try again in a few moments.'
      };
    }

    return {
      success: false,
      code: 'GEMINI_ERROR',
      error: `Gemini Vision service error: ${msg}`
    };
  }
}

/**
 * Returns a deterministic calibrated preset simulation when user runs preset mode.
 * Clearly marked as CALIBRATED_PRESET_SIMULATION.
 */
export function getCalibratedPresetAudit(preset: 'CLEAN_TRAY' | 'NORMAL_TRAY' | 'HEAVY_WASTE', servingGrams: number = 380): FoodAuditAnalysis {
  let remainingPortionPercent: number;
  let items: string[];
  let observations: string;
  let uncertainty: 'low' | 'medium' | 'high' = 'low';

  if (preset === 'CLEAN_TRAY') {
    remainingPortionPercent = 5;
    items = ['Negligible rice grains', 'Dal sheen'];
    observations = 'Clean stainless tray with minimal edible trace remaining.';
  } else if (preset === 'HEAVY_WASTE') {
    remainingPortionPercent = 42;
    items = ['Steamed Rice portion', 'Dal surplus', 'Roti piece'];
    observations = 'Substantial unfinished grain and pulse portions left on plate.';
    uncertainty = 'medium';
  } else {
    remainingPortionPercent = 24;
    items = ['Steamed Rice remnant', 'Curry residue'];
    observations = 'Typical dining portion with small leftover carb or gravy residue.';
  }

  const estimatedLeftoverWeightGrams = Math.round((remainingPortionPercent / 100) * servingGrams);

  return {
    isFoodImage: true,
    visibleFoodItems: items,
    remainingPortionPercent,
    estimatedLeftoverWeightGrams,
    servingWeightAssumption: `Calibrated preset model (${servingGrams}g standard reference).`,
    visualObservations: observations,
    uncertainty,
    limitations: 'Calibrated preset simulation — no live camera feed analyzed.',
    greenCreditsEarned: 5,
    isDuplicate: false,
    source: 'CALIBRATED_PRESET_SIMULATION',
  };
}
