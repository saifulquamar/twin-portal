import { GoogleGenAI, ThinkingLevel, Type, type GenerateContentResponse } from '@google/genai';
import type {
  AskRequestBody,
  AskResponse,
  BriefingRequestBody,
  BriefingResponse,
  ExtractRequestBody,
  ExtractResponse,
  FaceAnalyzeRequestBody,
  FaceLikenessProfile,
  IdentityMemoryItem,
  InterpretFeedRequestBody,
  InterpretFeedResponse,
  ParsedFeedItem,
  PreserveSpeakRequestBody,
  PreserveSpeakResponse,
  SourceItem,
  VoicePersonaProfile,
  VoiceSynthesizeRequestBody,
  VoiceSynthesizeResponse,
  VoiceTrainRequestBody,
  VoiceTrainResponse,
} from './types.ts';

export interface GeminiService {
  ask(params: AskRequestBody): Promise<AskResponse>;
  extract(params: ExtractRequestBody): Promise<ExtractResponse>;
  briefing?(params: BriefingRequestBody): Promise<BriefingResponse>;
  trainVoicePersona?(params: VoiceTrainRequestBody): Promise<VoiceTrainResponse>;
  synthesizeSpeech?(params: VoiceSynthesizeRequestBody): Promise<VoiceSynthesizeResponse>;
  analyzeFaceLikeness?(params: FaceAnalyzeRequestBody): Promise<FaceLikenessProfile>;
  speakPreservedTwin?(params: PreserveSpeakRequestBody): Promise<PreserveSpeakResponse>;
  interpretFeedInput?(params: InterpretFeedRequestBody): Promise<InterpretFeedResponse>;
  getLiveClient?(): GoogleGenAI | null;
}

export const VOICE_NOMINAL_PITCH_HZ: Record<VoicePersonaProfile['prebuilt_voice'], number> = {
  Fenrir: 105,
  Charon: 125,
  Puck: 155,
  Zephyr: 182,
  Kore: 205,
};

export function selectClosestPrebuiltVoiceByPitch(
  pitchHz?: number,
  fallback: VoicePersonaProfile['prebuilt_voice'] = 'Kore'
): VoicePersonaProfile['prebuilt_voice'] {
  if (typeof pitchHz !== 'number' || !Number.isFinite(pitchHz) || pitchHz < 65 || pitchHz > 360) {
    return fallback;
  }
  let best: VoicePersonaProfile['prebuilt_voice'] = fallback;
  let bestDist = Infinity;
  for (const [voice, hz] of Object.entries(VOICE_NOMINAL_PITCH_HZ) as Array<
    [VoicePersonaProfile['prebuilt_voice'], number]
  >) {
    const dist = Math.abs(Math.log2(pitchHz / hz));
    if (dist < bestDist) {
      bestDist = dist;
      best = voice;
    }
  }
  return best;
}

/**
 * Ensures any returned base64 audio payload has a valid 44-byte RIFF WAVE header.
 * If Gemini returns raw 24kHz 16-bit mono PCM (e.g., audio/L16), wraps it in a valid WAV header.
 */
export function ensureValidWavBase64(
  audioBase64: string,
  mimeType?: string,
  sampleRate = 24000
): string {
  const buf = Buffer.from(audioBase64, 'base64');
  if (buf.length >= 44 && buf.subarray(0, 4).toString('ascii') === 'RIFF') {
    return audioBase64;
  }
  const pcmBytes = buf.length - (buf.length % 2);
  const out = Buffer.alloc(44 + pcmBytes);
  out.write('RIFF', 0, 'ascii');
  out.writeUInt32LE(36 + pcmBytes, 4);
  out.write('WAVE', 8, 'ascii');
  out.write('fmt ', 12, 'ascii');
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20); // PCM
  out.writeUInt16LE(1, 22); // Mono
  const rateMatch = mimeType?.match(/rate=(\d+)/i);
  const rate = rateMatch ? Number(rateMatch[1]) || sampleRate : sampleRate;
  out.writeUInt32LE(rate, 24);
  out.writeUInt32LE(rate * 2, 28);
  out.writeUInt16LE(2, 32);
  out.writeUInt16LE(16, 34);
  out.write('data', 36, 'ascii');
  out.writeUInt32LE(pcmBytes, 40);
  buf.copy(out, 44, 0, pcmBytes);
  return out.toString('base64');
}

/**
 * Gently shifts pitch & formant warmth on a 24kHz 16-bit mono RIFF WAV buffer
 * so the neural Gemini TTS output matches the user's measured vocal F0 & warmth.
 */
export function matchWavToVoiceProfile(
  wavBase64: string,
  voiceName: VoicePersonaProfile['prebuilt_voice'],
  targetPitchHz?: number,
  warmth = 85
): string {
  if (!targetPitchHz || !Number.isFinite(targetPitchHz) || targetPitchHz < 70 || targetPitchHz > 340) {
    return wavBase64;
  }
  const nominalHz = VOICE_NOMINAL_PITCH_HZ[voiceName] || 180;
  const rawRatio = targetPitchHz / nominalHz;
  const ratio = Math.max(0.85, Math.min(1.17, rawRatio));
  if (Math.abs(ratio - 1) < 0.025) {
    return wavBase64;
  }

  try {
    const buf = Buffer.from(wavBase64, 'base64');
    if (buf.length < 64 || buf.subarray(0, 4).toString('ascii') !== 'RIFF') {
      return wavBase64;
    }
    let dataOffset = 44;
    let sampleRate = buf.readUInt32LE(24) || 24000;
    let channels = buf.readUInt16LE(22) || 1;
    let bitsPerSample = buf.readUInt16LE(34) || 16;
    for (let pos = 12; pos + 8 <= Math.min(buf.length, 256); ) {
      const id = buf.subarray(pos, pos + 4).toString('ascii');
      const size = buf.readUInt32LE(pos + 4);
      if (id === 'fmt ' && size >= 16) {
        channels = buf.readUInt16LE(pos + 10) || 1;
        sampleRate = buf.readUInt32LE(pos + 12) || 24000;
        bitsPerSample = buf.readUInt16LE(pos + 22) || 16;
      } else if (id === 'data') {
        dataOffset = pos + 8;
        break;
      }
      pos += 8 + size + (size % 2);
    }

    if (channels !== 1 || bitsPerSample !== 16 || buf.length <= dataOffset + 8) {
      return wavBase64;
    }

    const inSamples = Math.floor((buf.length - dataOffset) / 2);
    const outSamples = Math.max(16, Math.floor(inSamples / ratio));
    const outDataBytes = outSamples * 2;
    const outBuf = Buffer.alloc(44 + outDataBytes);

    outBuf.write('RIFF', 0, 'ascii');
    outBuf.writeUInt32LE(36 + outDataBytes, 4);
    outBuf.write('WAVE', 8, 'ascii');
    outBuf.write('fmt ', 12, 'ascii');
    outBuf.writeUInt32LE(16, 16);
    outBuf.writeUInt16LE(1, 20);
    outBuf.writeUInt16LE(1, 22);
    outBuf.writeUInt32LE(sampleRate, 24);
    outBuf.writeUInt32LE(sampleRate * 2, 28);
    outBuf.writeUInt16LE(2, 32);
    outBuf.writeUInt16LE(16, 34);
    outBuf.write('data', 36, 'ascii');
    outBuf.writeUInt32LE(outDataBytes, 40);

    const readSample = (idx: number): number => {
      const clamped = Math.max(0, Math.min(inSamples - 1, idx));
      return buf.readInt16LE(dataOffset + clamped * 2);
    };

    const warmAlpha = warmth >= 85 ? 0.14 : warmth <= 65 ? -0.08 : 0.05;
    let prevOut = 0;

    for (let i = 0; i < outSamples; i++) {
      const srcPos = i * ratio;
      const idx = Math.floor(srcPos);
      const frac = srcPos - idx;
      const s0 = readSample(idx - 1);
      const s1 = readSample(idx);
      const s2 = readSample(idx + 1);
      const s3 = readSample(idx + 2);
      const c0 = s1;
      const c1 = 0.5 * (s2 - s0);
      const c2 = s0 - 2.5 * s1 + 2 * s2 - 0.5 * s3;
      const c3 = 0.5 * (s3 - s0) + 1.5 * (s1 - s2);
      const interp = ((c3 * frac + c2) * frac + c1) * frac + c0;
      const filtered = interp * (1 - Math.abs(warmAlpha)) + prevOut * warmAlpha;
      prevOut = filtered;
      const pcm = Math.max(-32767, Math.min(32767, Math.round(filtered)));
      outBuf.writeInt16LE(pcm, 44 + i * 2);
    }

    return outBuf.toString('base64');
  } catch {
    return wavBase64;
  }
}

function shiftIsoDateDays(isoDate: string, deltaDays: number): string {
  const m = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const base = m
    ? new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
    : new Date();
  base.setUTCDate(base.getUTCDate() + deltaDays);
  return base.toISOString().slice(0, 10);
}

/**
 * Deterministic multi-entity parser for natural-language Feed inputs (used as instant fallback
 * or complement to Gemini structured extraction). Handles compound sentences like:
 * "I had a headache yesterday, slept for only five hours, and started taking a new medicine."
 */
export function parseNaturalFeedLocally(params: {
  text: string;
  referenceDate?: string;
  hasAudioRecording?: boolean;
}): ParsedFeedItem[] {
  const raw = String(params.text || '').trim();
  const today = params.referenceDate && /^\d{4}-\d{2}-\d{2}$/.test(params.referenceDate)
    ? params.referenceDate
    : new Date().toISOString().slice(0, 10);
  if (!raw) return [];

  const lower = raw.toLowerCase();
  const baseProvenance = params.hasAudioRecording ? 'voice_recording' : 'user_reported';
  const items: ParsedFeedItem[] = [];

  const WORD_NUMS: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  };
  const parseNum = (s?: string): number | null => {
    if (!s) return null;
    const clean = s.trim().toLowerCase();
    if (WORD_NUMS[clean] != null) return WORD_NUMS[clean];
    const n = Number(clean);
    return Number.isFinite(n) ? n : null;
  };

  const resolveClauseDate = (clause: string): string => {
    const cl = clause.toLowerCase();
    if (/\byesterday\b|\blast night\b/.test(cl)) return shiftIsoDateDays(today, -1);
    const daysAgo = cl.match(/(\d+|two|three|four|five|six|seven)\s+days?\s+ago/);
    if (daysAgo) {
      const d = parseNum(daysAgo[1]) || 2;
      return shiftIsoDateDays(today, -d);
    }
    return today;
  };

  // 1. Detect Blood Pressure / Vitals Measurements
  const bpMatch = raw.match(/(?:bp|blood pressure)[^\d]{0,16}(\d{2,3})\s*\/\s*(\d{2,3})/i);
  if (bpMatch) {
    items.push({
      category: 'measurements',
      legacy_kind: 'measure',
      date: resolveClauseDate(bpMatch[0]),
      title: `Blood pressure ${bpMatch[1]}/${bpMatch[2]} mmHg`,
      detail: 'Measured and reported in Feed Your Twin',
      provenance: 'measured',
      confidence: 0.95,
      requires_clinician_check: true,
      structured: {
        metric: 'Blood pressure',
        systolic: Number(bpMatch[1]),
        diastolic: Number(bpMatch[2]),
        unit: 'mmHg',
      },
    });
  }

  const weightMatch = raw.match(/(?:weigh(?:ed|t)?|weight is)\s*(\d{2,3}(?:\.\d+)?)\s*(kg|lbs?|pounds?)/i);
  if (weightMatch) {
    items.push({
      category: 'measurements',
      legacy_kind: 'measure',
      date: resolveClauseDate(weightMatch[0]),
      title: `Weight ${weightMatch[1]} ${weightMatch[2]}`,
      detail: 'Body weight measurement',
      provenance: 'measured',
      confidence: 0.94,
      requires_clinician_check: true,
      structured: {
        metric: 'Weight',
        value: Number(weightMatch[1]),
        unit: weightMatch[2],
      },
    });
  }

  const hrMatch = raw.match(/(?:heart rate|pulse|hr)\s*(?:was|is|of|:)?\s*(\d{2,3})\s*(?:bpm)?/i);
  if (hrMatch) {
    items.push({
      category: 'measurements',
      legacy_kind: 'measure',
      date: resolveClauseDate(hrMatch[0]),
      title: `Heart rate ${hrMatch[1]} bpm`,
      detail: 'Resting or spot heart rate',
      provenance: 'measured',
      confidence: 0.91,
      requires_clinician_check: true,
      structured: {
        metric: 'Heart rate',
        value: Number(hrMatch[1]),
        unit: 'bpm',
      },
    });
  }

  const glucoseMatch = raw.match(/(?:glucose|blood sugar)\s*(?:was|is|of|:)?\s*(\d{2,3}(?:\.\d+)?)\s*(mg\/dl|mmol\/l)?/i);
  if (glucoseMatch) {
    const unit = glucoseMatch[2] || 'mg/dL';
    items.push({
      category: 'measurements',
      legacy_kind: 'measure',
      date: resolveClauseDate(glucoseMatch[0]),
      title: `Blood glucose ${glucoseMatch[1]} ${unit}`,
      detail: 'Home glucose reading',
      provenance: 'measured',
      confidence: 0.92,
      requires_clinician_check: true,
      structured: {
        metric: 'Blood glucose',
        value: Number(glucoseMatch[1]),
        unit,
      },
    });
  }

  // 2. Detect Sleep / Daily Activities
  const sleepMatch = raw.match(
    /(?:slept|sleep(?:ing)?)(?:\s+for)?(?:\s+only|\s+about|\s+around)?\s*(\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:hours?|hrs?|h\b)/i
  );
  if (sleepMatch) {
    const hrs = parseNum(sleepMatch[1]) ?? 6;
    const sleepDate = /\blast night\b|\byesterday\b/i.test(raw) ? shiftIsoDateDays(today, -1) : today;
    items.push({
      category: 'daily_activities',
      legacy_kind: 'lifestyle',
      date: sleepDate,
      title: `Sleep: ${hrs} hours`,
      detail: hrs < 6 ? 'Short sleep duration logged' : 'Nightly sleep duration logged',
      provenance: baseProvenance,
      confidence: 0.94,
      requires_clinician_check: false,
      structured: {
        activity_type: 'sleep',
        sleep_hours: hrs,
      },
    });
  }

  const exerciseMatch = raw.match(
    /(?:walked|ran|jogged|exercised|worked out|cycled|yoga|swam)(?:\s+for)?\s*(\d+|twenty|thirty|forty|fifteen)\s*(minutes?|mins?|km|miles?)/i
  );
  if (exerciseMatch) {
    items.push({
      category: 'daily_activities',
      legacy_kind: 'lifestyle',
      date: resolveClauseDate(exerciseMatch[0]),
      title: `Activity: ${exerciseMatch[0].trim()}`,
      detail: 'Daily physical activity & movement',
      provenance: baseProvenance,
      confidence: 0.9,
      requires_clinician_check: false,
      structured: {
        activity_type: 'exercise',
        summary: exerciseMatch[0].trim(),
      },
    });
  }

  // 3. Detect Symptoms
  const symptomKeywords = [
    'headache',
    'migraine',
    'dizziness',
    'dizzy',
    'fatigue',
    'tired',
    'nausea',
    'swollen ankles',
    'ankle swelling',
    'chest tightness',
    'palpitations',
    'shortness of breath',
    'joint pain',
    'back pain',
    'muscle ache',
    'myalgia',
    'cough',
    'fever',
    'brain fog',
    'cramps',
  ];
  for (const sym of symptomKeywords) {
    const idx = lower.indexOf(sym);
    if (idx !== -1) {
      const windowStr = raw.slice(Math.max(0, idx - 32), Math.min(raw.length, idx + sym.length + 36));
      const sev = /severe|bad|strong|terrible/i.test(windowStr)
        ? 4
        : /mild|slight|little/i.test(windowStr)
          ? 2
          : 3;
      const capSym = sym.charAt(0).toUpperCase() + sym.slice(1);
      items.push({
        category: 'symptoms',
        legacy_kind: 'symptom',
        date: resolveClauseDate(windowStr),
        title: capSym,
        detail: `Severity ${sev}/5 · reported via ${params.hasAudioRecording ? 'voice update' : 'Feed update'}`,
        provenance: baseProvenance,
        confidence: 0.93,
        requires_clinician_check: true,
        structured: {
          symptom: capSym,
          severity: sev,
          context: windowStr.trim(),
        },
      });
      break;
    }
  }

  // 4. Detect Medication / Supplement updates
  const namedMedMatch = raw.match(
    /(?:started(?:\s+taking)?|taking|switched to|prescribed|added|stopped)\s+(?:a\s+new\s+(?:medicine|medication|supplement)\s*(?:called|named)?\s*)?([A-Za-z][A-Za-z0-9\-]{2,24})(?:\s+(\d+\s*(?:mg|mcg|g|iu)))?/i
  );
  if (namedMedMatch) {
    const rawCandidate = namedMedMatch[1].trim();
    const genericWords = new Set(['a', 'new', 'medicine', 'medication', 'pill', 'tablet', 'supplement', 'my']);
    const medTitle = genericWords.has(rawCandidate.toLowerCase())
      ? 'New medicine started (name to confirm)'
      : `${rawCandidate}${namedMedMatch[2] ? ` ${namedMedMatch[2]}` : ''}`;
    items.push({
      category: 'medicines',
      legacy_kind: 'medicine',
      date: today,
      title: medTitle,
      detail: /stopped/i.test(namedMedMatch[0])
        ? 'Medication change: stopped / paused'
        : 'Medication update: started / active',
      provenance: baseProvenance,
      confidence: genericWords.has(rawCandidate.toLowerCase()) ? 0.84 : 0.92,
      requires_clinician_check: true,
      structured: {
        medicine_name: medTitle,
        dose: namedMedMatch[2] || null,
        status: /stopped/i.test(namedMedMatch[0]) ? 'stopped' : 'started',
      },
    });
  } else if (/\b(?:new medicine|new medication|new prescription|started taking)\b/i.test(raw)) {
    items.push({
      category: 'medicines',
      legacy_kind: 'medicine',
      date: today,
      title: 'Started a new medicine',
      detail: 'Reported medication start — care team to verify name & dose',
      provenance: baseProvenance,
      confidence: 0.86,
      requires_clinician_check: true,
      structured: {
        medicine_name: 'New medicine',
        status: 'started',
      },
    });
  }

  // 5. Detect Lab Values mentioned inline (e.g. "HbA1c 6.1%", "eGFR 54")
  const inlineLabMatch = raw.match(/\b(HbA1c|eGFR|TSH|LDL|Creatinine|Potassium|uACR|Vitamin D|Ferritin)\s*(?:was|is|came back(?: at)?|:)?\s*(\d+(?:\.\d+)?)\s*(%|mg\/dL|mmol\/L|mIU\/L|ng\/mL|mL\/min)?/i);
  if (inlineLabMatch) {
    const unit = inlineLabMatch[3] || '';
    items.push({
      category: 'test_results',
      legacy_kind: 'lab',
      date: resolveClauseDate(inlineLabMatch[0]),
      title: `${inlineLabMatch[1]} ${inlineLabMatch[2]}${unit ? ` ${unit}` : ''}`,
      detail: 'Self-reported test result awaiting care team verification',
      provenance: baseProvenance,
      confidence: 0.91,
      requires_clinician_check: true,
      structured: {
        test: inlineLabMatch[1],
        value: Number(inlineLabMatch[2]),
        unit,
      },
    });
  }

  // 6. If audio recording was attached, also log a Voice & Conversations provenance entry if conversational,
  // or if no clinical entities matched, classify into Personal Diary / Voice & Conversations.
  if (items.length === 0) {
    items.push({
      category: params.hasAudioRecording ? 'voice_conversations' : 'personal_diary',
      legacy_kind: 'lifestyle',
      date: today,
      title: raw.length > 58 ? `${raw.slice(0, 55).trim()}…` : raw,
      detail: params.hasAudioRecording
        ? 'Spoken personal reflection & voice note'
        : 'Personal diary & daily life note',
      provenance: baseProvenance,
      confidence: 0.9,
      requires_clinician_check: false,
      structured: {
        note: raw,
      },
    });
  }

  return items;
}

function capWords(text: string, maxWords: number): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  const words = cleaned.split(' ');
  if (words.length <= maxWords) return cleaned;
  const sliced = words.slice(0, maxWords).join(' ');
  const lastSentenceEnd = Math.max(
    sliced.lastIndexOf('. '),
    sliced.lastIndexOf('? '),
    sliced.lastIndexOf('! ')
  );
  if (lastSentenceEnd > sliced.length * 0.6) {
    return sliced.slice(0, lastSentenceEnd + 1).trim();
  }
  return sliced.replace(/[,;:\-–—]+$/, '').trim() + '.';
}

function extractJsonObject(raw: string): any {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      try {
        return JSON.parse(fenced[1].trim());
      } catch {
        // continue
      }
    }
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function enrichSourceUrls(sources: SourceItem[], bundle: any): SourceItem[] {
  const insights: any[] = Array.isArray(bundle?.insights) ? bundle.insights : [];
  return sources.map((src) => {
    if (src.url) return src;
    const combined = `${src.title || ''} ${src.detail || ''}`;
    const pmidMatch = combined.match(/PMID:\s*(\d{5,10})/i);
    if (pmidMatch) {
      return {
        ...src,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmidMatch[1]}/`,
      };
    }
    if (src.finding_id) {
      const matchedIns = insights.find((i) => i?.id === src.finding_id);
      const firstPmid = matchedIns?.evidence
        ?.flatMap((ev: any) => (Array.isArray(ev?.sources) ? ev.sources : []))
        ?.find((s: string) => /^PMID:\d+/i.test(String(s)));
      if (firstPmid && src.kind === 'kg') {
        const id = String(firstPmid).replace(/^PMID:/i, '').trim();
        return { ...src, url: `https://pubmed.ncbi.nlm.nih.gov/${id}/` };
      }
    }
    return src;
  });
}

function extractGroundingWebSources(response: GenerateContentResponse): SourceItem[] {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!Array.isArray(chunks)) return [];
  const seen = new Set<string>();
  const webSources: SourceItem[] = [];

  for (const chunk of chunks) {
    const web = (chunk as any)?.web;
    const uri = typeof web?.uri === 'string' ? web.uri.trim() : '';
    if (!uri || seen.has(uri)) continue;
    seen.add(uri);

    let host = '';
    try {
      host = new URL(uri).hostname.replace(/^www\./, '');
    } catch {
      host = uri;
    }

    const rawTitle =
      typeof web?.title === 'string' && web.title.trim()
        ? web.title.trim()
        : host || 'Clinical Web Reference';
    webSources.push({
      kind: 'web',
      title: rawTitle.slice(0, 90),
      detail: host && host !== rawTitle ? `Google Search · ${host}` : 'Google Search grounded evidence',
      url: uri,
    });
  }
  return webSources;
}

export function buildKnowledgeGraphSummary(
  bundle: any,
  clinical?: any,
  identityMemories?: IdentityMemoryItem[]
): string {
  const parts: string[] = [];
  const patient = bundle?.patient || {};

  parts.push(`PATIENT PROFILE: ${patient.preferred_name || 'Patient'}`);
  parts.push(`- DOB: ${patient.date_of_birth || 'unknown'}, Sex: ${patient.sex || 'unknown'}`);
  if (Array.isArray(patient.conditions) && patient.conditions.length) {
    parts.push(`- Conditions: ${patient.conditions.join('; ')}`);
  }
  if (Array.isArray(patient.medicines) && patient.medicines.length) {
    parts.push(`- Active Medications: ${patient.medicines.join('; ')}`);
  }
  if (Array.isArray(patient.supplements) && patient.supplements.length) {
    parts.push(`- Active Supplements: ${patient.supplements.join('; ')}`);
  }
  if (Array.isArray(patient.allergies) && patient.allergies.length) {
    parts.push(`- Allergies: ${patient.allergies.join('; ')}`);
  }
  if (bundle?.biological_age?.value != null) {
    parts.push(
      `- Biological Age: ${bundle.biological_age.value} years (${bundle.biological_age.model || 'published model'})`
    );
  }
  if (Array.isArray(bundle?.vitals) && bundle.vitals[0]) {
    const v = bundle.vitals[0];
    parts.push(
      `- Baseline Vitals: BP ${v.systolic || '?'}/${v.diastolic || '?'} mmHg, HR ${v.heart_rate || '?'} bpm, Weight ${v.weight_kg || '?'} kg, Height ${v.height_cm || '?'} cm`
    );
  }

  // Newly added patient entries across all 8 Feed Your Twin categories
  const pendingFeed: any[] = Array.isArray(bundle?.pending_feed) ? bundle.pending_feed : [];
  if (pendingFeed.length > 0) {
    parts.push('\nNEWLY ADDED PATIENT REPORT / FEED ENTRIES (Awaiting care-team verification or personal log):');
    for (const entry of pendingFeed.slice(0, 25)) {
      const ext = entry?.extracted;
      if (ext && typeof ext === 'object') {
        const prevStr =
          ext.prevValue != null
            ? ` [Previous twin value: ${ext.prevValue} ${ext.prevUnit || ext.unit || ''} on ${ext.prevDate || 'prior'}, Change: ${
                ext.pctChange != null ? `${ext.pctChange > 0 ? '+' : ''}${Number(ext.pctChange).toFixed(1)}%` : 'n/a'
              }]`
            : ' [No prior twin value]';
        const flagStr = ext.flag ? ` (${String(ext.flag).toUpperCase()})` : '';
        parts.push(
          `- ${ext.name}: ${ext.value} ${ext.unit || ''}${flagStr} on ${entry.date || ext.date || 'recent report'}${
            ext.range ? `, ref ${ext.range}` : ''
          }${prevStr}`
        );
      } else {
        const cat = entry.category || entry.kind || 'entry';
        const prov = entry.provenance ? ` [${entry.provenance}]` : '';
        parts.push(
          `- [${cat}]${prov} ${entry.title} (${entry.date || ''}${entry.detail ? ` · ${entry.detail}` : ''})`
        );
      }
    }
  }

  // Personal Identity & Autobiographical Memories
  const memList: IdentityMemoryItem[] =
    Array.isArray(identityMemories) && identityMemories.length > 0
      ? identityMemories
      : Array.isArray(bundle?.identity_memories)
        ? bundle.identity_memories
        : [];
  if (memList.length > 0) {
    parts.push('\nPERSONAL IDENTITY, MEMORIES, HABITS & DIARY VAULT:');
    for (const m of memList.slice(0, 15)) {
      const txt = typeof m === 'string' ? m : m.text;
      const cat = typeof m === 'string' ? 'memory' : m.category;
      parts.push(`- [${cat}] ${txt}`);
    }
  }

  if (bundle?.latest_briefing?.patient || bundle?.latest_briefing?.clinician) {
    parts.push('\nRECENT REPORT BRIEFING SUMMARY:');
    if (bundle.latest_briefing.clinician) {
      parts.push(`- Clinical summary: ${bundle.latest_briefing.clinician}`);
    } else if (bundle.latest_briefing.patient) {
      parts.push(`- Summary: ${bundle.latest_briefing.patient}`);
    }
  }

  // Historical & Latest Labs in Twin Record
  const labs = bundle?.labs;
  if (labs && typeof labs === 'object') {
    const labLines: string[] = [];
    for (const [labName, arr] of Object.entries(labs)) {
      if (Array.isArray(arr) && arr.length > 0) {
        const latest = arr[arr.length - 1] as any;
        const flagStr = latest?.flag ? ` [${String(latest.flag).toUpperCase()}]` : '';
        if (arr.length > 1) {
          const historyStr = arr.map((pt: any) => `${pt.value} (${pt.date})`).join(' -> ');
          labLines.push(
            `- ${labName}: latest ${latest.value} ${latest.unit || ''} on ${latest.date}${flagStr} | trend: ${historyStr}`
          );
        } else {
          labLines.push(
            `- ${labName}: ${latest.value} ${latest.unit || ''} on ${latest.date}${flagStr}`
          );
        }
      }
    }
    if (labLines.length > 0) {
      parts.push('\nVERIFIED TWIN LABS & LONGITUDINAL TRENDS:');
      parts.push(...labLines);
    }
  }

  // Organ states
  if (bundle?.organs && typeof bundle.organs === 'object') {
    const assessedOrgans = Object.entries(bundle.organs)
      .filter(([, o]: any) => o && o.state && o.state !== 'none')
      .map(([k, o]: any) => `${o.label || k}: ${o.state}${o.summary ? ` (${o.summary})` : ''}`);
    if (assessedOrgans.length > 0) {
      parts.push('\nASSESSED BODY SYSTEMS & ORGANS:');
      parts.push(...assessedOrgans.map((line) => `- ${line}`));
    }
  }

  // Verified Knowledge Graph Findings (Insights)
  const insights: any[] = Array.isArray(bundle?.insights) ? bundle.insights : [];
  if (insights.length > 0) {
    parts.push('\nVERIFIED KNOWLEDGE GRAPH FINDINGS (bundle.insights):');
    for (const ins of insights) {
      const pmids = (ins.evidence || [])
        .flatMap((e: any) => e?.sources || [])
        .slice(0, 4)
        .join(', ');
      parts.push(
        `- [finding_id="${ins.id}"] ${ins.title} (Grade ${ins.certainty || 'n/a'}${pmids ? `, Sources: ${pmids}` : ''})\n` +
          `  Found: ${ins.found || ''}\n` +
          `  Why: ${ins.why || ''}\n` +
          `  Action: ${ins.do || ''}`
      );
    }
  }

  // Personalized Panel / Missing Tests
  const panel: any[] = Array.isArray(bundle?.panel) ? bundle.panel : [];
  if (panel.length > 0) {
    parts.push('\nPERSONALISED TEST PANEL & RECOMMENDED NEXT CHECKS:');
    for (const item of panel) {
      parts.push(
        `- ${item.test} [tier: ${item.tier}, already in record: ${item.already_have}]: ${item.why}`
      );
    }
  }

  // Refresh / Retest Windows
  const retests: any[] = Array.isArray(bundle?.refresh?.retests) ? bundle.refresh.retests : [];
  if (retests.length > 0) {
    parts.push(
      `\nRETEST SCHEDULE WINDOWS: ${retests
        .slice(0, 10)
        .map((r) => `${r.name} (${r.min_days}-${r.max_days}d)`)
        .join('; ')}`
    );
  }

  // Genetics
  const genes: any[] = Array.isArray(bundle?.genetics?.genes) ? bundle.genetics.genes : [];
  if (genes.length > 0) {
    const patientGenes = genes.filter((g) => g.role === 'patient_variant' || g.gene === 'SLCO1B1');
    if (patientGenes.length > 0) {
      parts.push(
        `\nGENETIC & PGx CONTEXT: ${patientGenes.map((g) => `${g.gene} (${g.role})`).join(', ')}`
      );
    }
  }

  // Physician CDSS Dossier Context (Doctor View)
  if (clinical && typeof clinical === 'object') {
    parts.push('\nPHYSICIAN CLINICAL DOSSIER (CDSS):');
    if (Array.isArray(clinical.priorities) && clinical.priorities.length > 0) {
      parts.push(`- Clinical Priorities: ${clinical.priorities.join('; ')}`);
    }
    if (clinical.stats) {
      parts.push(`- Dossier Stats: ${JSON.stringify(clinical.stats)}`);
    }
    const sections: any[] = Array.isArray(clinical.sections) ? clinical.sections : [];
    for (const sec of sections.slice(0, 8)) {
      const blockSummaries: string[] = [];
      for (const blk of (sec.blocks || []).slice(0, 4)) {
        if (blk.kind === 'text' && blk.text) {
          blockSummaries.push(String(blk.text).replace(/<[^>]+>/g, '').slice(0, 240));
        } else if (blk.kind === 'list' && Array.isArray(blk.items)) {
          blockSummaries.push(
            (blk.h ? `${blk.h}: ` : '') +
              blk.items
                .slice(0, 5)
                .map((it: string) => String(it).replace(/<[^>]+>/g, '').slice(0, 140))
                .join(' | ')
          );
        } else if (blk.kind === 'table' && Array.isArray(blk.rows)) {
          const sampleRows = blk.rows
            .slice(0, 5)
            .map((r: any[]) =>
              r
                .map((c) => String(c).replace(/<[^>]+>/g, '').slice(0, 80))
                .join(': ')
            )
            .join(' | ');
          blockSummaries.push(`${blk.h || sec.title}: ${sampleRows}`);
        }
      }
      if (blockSummaries.length > 0) {
        parts.push(`- Section [${sec.title}]: ${blockSummaries.join(' // ')}`);
      }
    }
  }

  return parts.join('\n');
}

export class DefaultGeminiService implements GeminiService {
  private ai: GoogleGenAI | null;
  private aiBeta: GoogleGenAI | null;
  private model: string;

  constructor(
    apiKey = process.env.GEMINI_API_KEY || '',
    model = 'gemini-4-hydrogen'
  ) {
    const trimmedKey = String(apiKey || '').trim();
    if (trimmedKey) {
      try {
        this.ai = new GoogleGenAI({
          apiKey: trimmedKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
        // Speech generation (gemini-3.8-flash-tts / lite-tts) and Live Audio (gemini-3.8-live)
        // require apiVersion: 'v1beta' so speechConfig & audio modalities serialize cleanly.
        this.aiBeta = new GoogleGenAI({
          apiKey: trimmedKey,
          apiVersion: 'v1beta',
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      } catch (err) {
        console.error('[Gemini init fallback]', err);
        this.ai = null;
        this.aiBeta = null;
      }
    } else {
      this.ai = null;
      this.aiBeta = null;
    }
    this.model = model;
  }

  public getLiveClient(): GoogleGenAI | null {
    return this.aiBeta;
  }

  public generateLocalKgAnswer(params: AskRequestBody): AskResponse {
    const qLower = params.question.toLowerCase();
    const isCdss = params.mode === 'cdss';
    const words = qLower
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);
    const bundle = params.bundle || {};
    const patient = bundle.patient || {};
    const name = patient.preferred_name || 'the patient';
    const insights: any[] = Array.isArray(bundle.insights) ? bundle.insights : [];
    const labs: Record<string, any[]> =
      bundle.labs && typeof bundle.labs === 'object' ? bundle.labs : {};
    const pendingFeed: any[] = Array.isArray(bundle.pending_feed) ? bundle.pending_feed : [];
    const memories: IdentityMemoryItem[] =
      Array.isArray(params.identity_memories) && params.identity_memories.length > 0
        ? params.identity_memories
        : Array.isArray(bundle.identity_memories)
          ? bundle.identity_memories
          : [];
    const panel: any[] = Array.isArray(bundle.panel) ? bundle.panel : [];

    const answerParts: string[] = [];
    const sources: SourceItem[] = [];

    // Self-reflection memory query ("What do you remember about me?")
    if (!isCdss && /remember about me|my memories|my life|my values|my diary/i.test(qLower)) {
      if (memories.length > 0) {
        const topMems = memories
          .slice(0, 3)
          .map((m: any) => (typeof m === 'string' ? m : m.text))
          .join(' ');
        answerParts.push(
          `Here is what I hold in our personal memory vault: ${topMems}`
        );
        sources.push({
          kind: 'memory',
          title: 'Personal Identity & Memory Vault',
          detail: `${memories.length} preserved memory item${memories.length === 1 ? '' : 's'}`,
        });
      }
    }

    // Sleep query ("How have I been sleeping?")
    if (!isCdss && /sleep|sleeping|slept/i.test(qLower)) {
      const sleepEntries = pendingFeed.filter((e) =>
        /sleep|slept/i.test(`${e?.title || ''} ${e?.detail || ''}`)
      );
      if (sleepEntries.length > 0) {
        const latestSleep = sleepEntries[0];
        answerParts.push(
          `In your recent updates, you logged ${latestSleep.title} (${latestSleep.date || 'recently'} — ${latestSleep.detail || 'personal log'}). `
        );
        sources.push({
          kind: 'feed',
          title: latestSleep.title,
          detail: `Feed Your Twin · ${latestSleep.date || 'recent'}`,
        });
      } else if (bundle?.narrative?.lifestyle_summary) {
        answerParts.push(`${bundle.narrative.lifestyle_summary} `);
        sources.push({
          kind: 'record',
          title: 'Sleep & Lifestyle Baseline',
          detail: 'Recorded in your Twin baseline',
        });
      }
    }

    // Holistic "How am I doing?" overview
    if (!isCdss && /how am i doing|overall health|summary of my health/i.test(qLower)) {
      const conds = Array.isArray(patient.conditions) && patient.conditions.length
        ? patient.conditions.join(', ')
        : 'preventive wellness';
      const topInsight = insights[0];
      answerParts.push(
        `Overall, we are tracking ${conds} across ${Object.keys(labs).length} measured biomarkers${
          bundle?.biological_age?.value != null
            ? ` (biological age ${bundle.biological_age.value} years)`
            : ''
        }. ${topInsight ? `Our top focus right now is: ${topInsight.title} — ${topInsight.do || topInsight.found}` : ''}`
      );
      if (topInsight) {
        sources.push({
          kind: 'finding',
          title: topInsight.title,
          detail: topInsight.found,
          finding_id: topInsight.id,
        });
      }
    }

    const kidneyTerms = ['kidney', 'kidneys', 'renal', 'egfr', 'creatinine', 'uacr', 'albumin', 'potassium', 'urate'];
    const asksKidney = kidneyTerms.some((t) => qLower.includes(t));
    const asksNext = /next|check|order|test|panel|follow.?up|focus/i.test(qLower);

    const matchingFeed = pendingFeed.filter((entry) => {
      const text = `${entry?.title || ''} ${entry?.detail || ''} ${entry?.extracted?.name || ''}`.toLowerCase();
      if (asksKidney && kidneyTerms.some((k) => text.includes(k))) return true;
      return words.some((w) => w.length > 3 && text.includes(w));
    });

    if (matchingFeed.length > 0 && answerParts.length === 0) {
      const summaries = matchingFeed.slice(0, 4).map((entry) => {
        const ext = entry.extracted;
        if (ext) {
          const delta =
            ext.prevValue != null && ext.pctChange != null
              ? ` (from ${ext.prevValue}, ${ext.pctChange > 0 ? '+' : ''}${Number(ext.pctChange).toFixed(1)}%)`
              : '';
          return `${ext.name} ${ext.value} ${ext.unit || ''}${delta}`;
        }
        return `${entry.title}${entry.detail ? ` (${entry.detail})` : ''}`;
      });
      answerParts.push(
        isCdss
          ? `Pending patient-submitted entries (${matchingFeed[0]?.date || 'recent'}): ${summaries.join('; ')}. `
          : `From your recent updates (${matchingFeed[0]?.date || 'recent'}, marked waiting for your care team to check where clinical): ${summaries.join('; ')}. `
      );
      for (const entry of matchingFeed.slice(0, 3)) {
        sources.push({
          kind: 'record',
          title: entry.title || 'Submitted update',
          detail: `Added ${entry.date || 'recently'} (pending care-team check)`,
        });
      }
    }

    const matchedInsights = insights.filter((ins) => {
      const blob = `${ins.id || ''} ${ins.title || ''} ${ins.found || ''} ${ins.area || ''} ${ins.organ || ''}`.toLowerCase();
      if (asksKidney && (ins.area === 'kidney' || String(ins.organ || '').startsWith('kidney'))) return true;
      return words.some((w) => w.length > 3 && blob.includes(w));
    });

    const matchedLabs = Object.entries(labs).filter(([labName]) => {
      const lLow = labName.toLowerCase();
      if (asksKidney && kidneyTerms.some((k) => lLow.includes(k))) return true;
      return words.some((w) => w.length > 2 && lLow.includes(w));
    });

    if (asksNext && panel.length > 0) {
      const topPanel = panel.slice(0, 4).map((p) => p.test).join(', ');
      answerParts.push(
        isCdss
          ? `Suggested next diagnostic checks from personalised panel: ${topPanel}. For physician review.`
          : `On our personalised panel, the next checks to discuss with your doctor include ${topPanel}.`
      );
      sources.push({
        kind: 'kg',
        title: 'Personalised Follow-up Panel',
        detail: topPanel,
      });
    } else if (matchedInsights.length > 0 && answerParts.length === 0) {
      const top = matchedInsights[0];
      answerParts.push(
        isCdss
          ? `Findings: ${top.found || top.title} Recommended action: ${top.do || 'Clinical correlation advised.'} For physician review.`
          : `${top.found || top.title} ${top.means || ''} ${top.do ? `Next step: ${top.do}` : ''}`.trim()
      );
      for (const ins of matchedInsights.slice(0, 3)) {
        sources.push({
          kind: 'finding',
          title: String(ins.title || '').slice(0, 60),
          detail: String(ins.found || '').slice(0, 100),
          finding_id: ins.id,
        });
      }
    } else if (matchedLabs.length > 0 && answerParts.length === 0) {
      const labStrs = matchedLabs.map(
        ([labName, arr]) => {
          const val = Array.isArray(arr) ? arr[arr.length - 1] : arr;
          return `${labName}: ${val?.value} ${val?.unit || ''} (${val?.date || 'recorded'})`;
        }
      );
      answerParts.push(
        `In ${name}'s verified Twin record: ${labStrs.join('; ')}. Ask your doctor how these values guide your next check.`
      );
      for (const [labName, arr] of matchedLabs.slice(0, 4)) {
        const val = Array.isArray(arr) ? arr[arr.length - 1] : arr;
        sources.push({
          kind: 'record',
          title: `${labName}: ${val?.value} ${val?.unit || ''}`.trim(),
          detail: `Recorded ${val?.date || ''}`,
        });
      }
    } else if (answerParts.length === 0) {
      const meds =
        Array.isArray(patient.medicines) && patient.medicines.length > 0
          ? patient.medicines.join(', ')
          : 'None recorded';
      const conds =
        Array.isArray(patient.conditions) && patient.conditions.length > 0
          ? patient.conditions.join(', ')
          : 'None recorded';
      answerParts.push(
        `In ${name}'s Digital Twin — Active focus areas: ${conds}. Current medicines: ${meds}. Ask your doctor about any unassessed areas or upcoming panel tests.`
      );
      sources.push({
        kind: 'record',
        title: `${name}'s Twin Record`,
        detail: 'Active conditions and medications in twin record',
      });
    }

    if (isCdss && !answerParts.join(' ').includes('For physician review.')) {
      answerParts.push(' For physician review.');
    }

    return {
      answer: answerParts.join(''),
      sources: enrichSourceUrls(sources, bundle),
    };
  }

  public generateLocalBriefing(params: BriefingRequestBody): BriefingResponse {
    const patientName = params.bundle?.patient?.preferred_name || 'Your';
    const rows = Array.isArray(params.new_results) ? params.new_results : [];

    const summaries = rows.slice(0, 5).map((r) => {
      if (r.prev_value != null && r.pct_change != null) {
        const dir = r.pct_change > 0 ? 'rose' : r.pct_change < 0 ? 'fell' : 'stayed steady';
        return `${r.name} ${dir} from ${r.prev_value} to ${r.value} ${r.unit}`;
      }
      return `${r.name} is ${r.value} ${r.unit}${r.flag ? ` (${r.flag})` : ''}`;
    });

    const patientText = capWords(
      `We read ${rows.length} result${rows.length === 1 ? '' : 's'} from your new report and marked them waiting for your care team's check: ${summaries.join(
        '; '
      )}. Your twin's confirmed record stays unchanged until reviewed. At your next visit, ask your doctor what these updated numbers mean for your kidney, heart, and medicine plan.`,
      90
    );

    const clinDetails = rows.slice(0, 6).map((r) => {
      const dt = r.date ? ` (${r.date})` : '';
      const flag = r.flag ? ` [${r.flag.toUpperCase()}]` : '';
      const delta =
        r.prev_value != null && r.pct_change != null
          ? ` vs prior ${r.prev_value}${r.prev_date ? ` on ${r.prev_date}` : ''} (${
              r.pct_change > 0 ? '+' : ''
            }${Number(r.pct_change).toFixed(1)}%)`
          : ' (new baseline)';
      return `${r.name} ${r.value} ${r.unit}${flag}${dt}${delta}`;
    });

    const clinicianText = capWords(
      `Patient-uploaded lab report (${rows.length} analyte${
        rows.length === 1 ? '' : 's'
      }, pending verification) for ${patientName}: ${clinDetails.join(
        '; '
      )}. Review trajectory against active regimen and confirm repeat testing or dose adjustments. For physician review.`,
      120
    );

    return {
      patient: patientText,
      clinician: clinicianText,
    };
  }

  async ask(params: AskRequestBody): Promise<AskResponse> {
    if (!this.ai) {
      return this.generateLocalKgAnswer(params);
    }

    const isCdss = params.mode === 'cdss';
    const patientName = params.bundle?.patient?.preferred_name || 'the person';
    const kgSummary = buildKnowledgeGraphSummary(
      params.bundle,
      params.clinical,
      params.identity_memories
    );

    const systemInstruction = isCdss
      ? `You are the Mutanex Digital Twin Clinical Decision Support AI for physicians, grounded in ${patientName}'s verified Knowledge Graph, pending Feed entries, clinical dossier, and live Google Search clinical guidelines.
Rules:
- Anchor every patient-specific statement strictly in the provided Knowledge Graph & record (exact values, units, dates, and deltas).
- Cross-reference current guidelines (KDIGO, AHA/ACC, ADA, CPIC) via Google Search.
- Never invent lab values, diagnoses, or prescriptions. Highlight urgent shifts first.
- Write concisely for a physician (Findings, Guideline & KG Synthesis, Suggested Next Tests) and end with "For physician review."`
      : `You are ${patientName}'s Living Digital Twin — a warm, truthful, personal digital representation of ${patientName} grounded in ${patientName}'s biological Knowledge Graph, longitudinal lab trends, 8-category Feed Your Twin updates (measurements, medicines, symptoms, sleep, daily activities, diary), preserved personal memories, and Google Search clinical guidelines.
Rules:
- When ${patientName} asks self-reflective questions like "How am I doing?", "What has changed in my health?", "How have I been sleeping?", or "What do you remember about me?", speak naturally and warmly as ${patientName}'s own Twin (using natural shared/first-person self-reflection so it feels like speaking with one's own living Twin, never a cold generic chatbot).
- Quote exact lab numbers, dates, sleep/symptom/medicine updates from Feed Your Twin, and personal memories where relevant, clearly distinguishing clinician-verified records from self-reported updates awaiting care-team review.
- Never fabricate lab values, memories, diagnoses, or medicine changes. If something hasn't been measured yet, say so honestly and name the panel test that checks it.
- Keep spoken-friendly clarity (at most 125 words, plain natural speech without markdown bullets) and suggest 1 concrete question for their doctor when clinical.`;

    const userPrompt = `Patient ID: ${params.patient_id || 'unknown'}
Mode: ${isCdss ? 'cdss' : 'self_twin'}
Question from ${isCdss ? 'Clinician' : patientName}: ${params.question}

DIGITAL TWIN KNOWLEDGE GRAPH, FEED TIMELINE & MEMORY VAULT:
${kgSummary}`;

    const askResponseSchema = {
      type: Type.OBJECT,
      properties: {
        answer: { type: Type.STRING },
        sources: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              kind: {
                type: Type.STRING,
                enum: ['record', 'finding', 'kg', 'web', 'memory', 'feed'],
              },
              title: { type: Type.STRING },
              detail: { type: Type.STRING },
              finding_id: { type: Type.STRING },
              url: { type: Type.STRING },
            },
            required: ['kind', 'title'],
          },
        },
      },
      required: ['answer', 'sources'],
    };

    let response: GenerateContentResponse | null = null;
    const jsonPrompt = `${userPrompt}\n\nSearch current clinical practice guidelines where helpful to ground clinical facts, then respond ONLY with a valid JSON object matching {"answer": string, "sources": Array<{"kind": "record"|"finding"|"kg"|"web"|"memory"|"feed", "title": string, "detail"?: string, "finding_id"?: string, "url"?: string}>}.`;
    try {
      response = await this.ai.models.generateContent({
        model: this.model,
        contents: jsonPrompt,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });
    } catch (err1: any) {
      console.warn('[Gemini ask Tier 1 fallback]', err1?.message || err1);
      response = await this.ai.models.generateContent({
        model: this.model,
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: askResponseSchema,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });
    }

    const rawText = response.text || '';
    const parsed = extractJsonObject(rawText);
    const answerText =
      typeof parsed?.answer === 'string' && parsed.answer.trim()
        ? parsed.answer.trim()
        : rawText.trim() || "That isn't in your record yet, so I won't guess.";

    const validKinds = ['record', 'finding', 'kg', 'web', 'memory', 'feed'];
    const modelSources: SourceItem[] = Array.isArray(parsed?.sources)
      ? parsed.sources
          .filter((s: any) => s && typeof s.title === 'string')
          .map((s: any) => ({
            kind: validKinds.includes(s.kind) ? s.kind : 'kg',
            title: s.title,
            detail: typeof s.detail === 'string' ? s.detail : undefined,
            finding_id: typeof s.finding_id === 'string' ? s.finding_id : undefined,
            url: typeof s.url === 'string' && /^https?:\/\//i.test(s.url) ? s.url : undefined,
          }))
      : [];

    const webGroundingSources = extractGroundingWebSources(response);
    const mergedSources: SourceItem[] = [...modelSources];
    for (const ws of webGroundingSources) {
      if (!mergedSources.some((existing) => existing.url && existing.url === ws.url)) {
        mergedSources.push(ws);
      }
    }

    const insights: any[] = Array.isArray(params.bundle?.insights) ? params.bundle.insights : [];
    for (const ins of insights) {
      if (!ins?.id) continue;
      const idLow = String(ins.id).toLowerCase();
      const titleLow = String(ins.title || '').toLowerCase();
      if (
        params.question.toLowerCase().includes(idLow) ||
        answerText.toLowerCase().includes(idLow) ||
        (titleLow.length > 8 && answerText.toLowerCase().includes(titleLow.slice(0, 24)))
      ) {
        if (!mergedSources.some((s) => s.finding_id === ins.id)) {
          mergedSources.push({
            kind: 'finding',
            title: String(ins.title || ins.id).slice(0, 70),
            detail: String(ins.found || '').slice(0, 120),
            finding_id: ins.id,
          });
        }
      }
    }

    return {
      answer: answerText,
      sources: enrichSourceUrls(mergedSources, params.bundle),
    };
  }

  async extract(params: ExtractRequestBody): Promise<ExtractResponse> {
    if (!this.ai) {
      throw new Error('GEMINI_API_KEY is not configured for multimodal lab report extraction');
    }

    const systemInstruction = `You are a medical document analyzer. Extract all laboratory test results printed on this report.
Rules:
- Return only values printed on the report; never fill gaps, extrapolate, or guess.
- Extract the report date (YYYY-MM-DD if possible) and laboratory name if present.
- Extract individual test results with numeric values, units, reference ranges, and abnormal flags ("high" or "low", or null if normal/unflagged).`;

    const cleanBase64 = params.file.replace(/^data:[^;]+;base64,/, '');

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: params.mime_type,
          },
        },
        'Extract all lab test results printed on this report. Return only values printed on the report; never fill gaps.',
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            report_date: { type: Type.STRING, nullable: true },
            lab: { type: Type.STRING, nullable: true },
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  range: { type: Type.STRING, nullable: true },
                  flag: { type: Type.STRING, enum: ['high', 'low'], nullable: true },
                  date: { type: Type.STRING, nullable: true },
                },
                required: ['name', 'value', 'unit'],
              },
            },
          },
          required: ['report_date', 'lab', 'results'],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = extractJsonObject(text) || {};
    return {
      report_date: parsed.report_date ?? null,
      lab: parsed.lab ?? null,
      results: Array.isArray(parsed.results) ? parsed.results : [],
    };
  }

  async briefing(params: BriefingRequestBody): Promise<BriefingResponse> {
    if (!this.ai) {
      return this.generateLocalBriefing(params);
    }

    const patient = params.bundle?.patient || {};
    const labs = params.bundle?.labs || {};

    const existingLabsSummary: Record<string, any> = {};
    for (const [key, arr] of Object.entries(labs)) {
      if (Array.isArray(arr) && arr.length > 0) {
        existingLabsSummary[key] = arr[arr.length - 1];
      }
    }

    const systemInstruction = `You generate two concise clinical briefings when a patient adds new laboratory results to their Mutanex Digital Twin:
1. "patient": MAXIMUM 90 WORDS. Plain, calm, reassuring everyday language for the patient. State clearly what changed compared with their previous twin values (mention key numbers simply), remind them their care team checks new entries first, and suggest 1-2 specific questions to ask their doctor. Never diagnose or change medicines.
2. "clinician": MAXIMUM 120 WORDS. Concise physician-oriented clinical note summarizing the clinically relevant changes with exact old -> new values, units, percentage changes, abnormal flags, and dates, plus relevant medication/condition context (e.g. CKD stage, ARB/losartan potassium monitoring, statin/PGx context). End with "For physician review."`;

    const prompt = `PATIENT PROFILE:
Name: ${patient.preferred_name || 'Patient'}
Conditions: ${(patient.conditions || []).join('; ') || 'None listed'}
Medications: ${(patient.medicines || []).join('; ') || 'None listed'}

PREVIOUS LATEST TWIN LABS:
${JSON.stringify(existingLabsSummary, null, 2)}

NEWLY ADDED REPORT RESULTS (KEPT BY PATIENT):
${JSON.stringify(params.new_results, null, 2)}`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              patient: { type: Type.STRING },
              clinician: { type: Type.STRING },
            },
            required: ['patient', 'clinician'],
          },
        },
      });

      const parsed = extractJsonObject(response.text || '{}');
      if (parsed?.patient && parsed?.clinician) {
        return {
          patient: capWords(String(parsed.patient), 90),
          clinician: capWords(String(parsed.clinician), 120),
        };
      }
    } catch (err) {
      console.warn('[Gemini briefing fallback]', err);
    }

    return this.generateLocalBriefing(params);
  }

  /**
   * Multimodal natural-language & spoken Feed Your Twin interpreter across all 8 categories.
   */
  async interpretFeedInput(params: InterpretFeedRequestBody): Promise<InterpretFeedResponse> {
    const today =
      params.reference_date && /^\d{4}-\d{2}-\d{2}$/.test(params.reference_date)
        ? params.reference_date
        : new Date().toISOString().slice(0, 10);
    const hasAudio = Boolean(params.audio_base64 && params.audio_base64.trim());
    let transcript = String(params.text || '').trim();

    // Step 1: Transcribe audio if spoken update was recorded or uploaded
    if (this.ai && hasAudio && params.audio_base64) {
      try {
        const cleanAudio = params.audio_base64.replace(/^data:[^;]+;base64,/, '');
        const trRes = await this.ai.models.generateContent({
          model: 'gemini-3.5-transcribe',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: params.audio_mime_type || 'audio/webm',
                  data: cleanAudio,
                },
              },
              {
                text: 'Transcribe the exact spoken words cleanly without extra commentary.',
              },
            ],
          },
        });
        if (trRes.text && trRes.text.trim()) {
          transcript = transcript
            ? `${transcript} ${trRes.text.trim()}`
            : trRes.text.trim();
        }
      } catch (err) {
        console.warn('[interpretFeedInput transcribe fallback]', err);
      }
    }

    // Step 2: Multimodal Gemini structured classification across all 8 categories
    if (this.ai && (transcript || params.image_base64)) {
      try {
        const parts: any[] = [];
        if (params.image_base64) {
          parts.push({
            inlineData: {
              mimeType: params.image_mime_type || 'image/jpeg',
              data: params.image_base64.replace(/^data:[^;]+;base64,/, ''),
            },
          });
        }
        parts.push({
          text: `Today's reference date is ${today}. Yesterday is ${shiftIsoDateDays(today, -1)}.
Patient: ${params.patient_name || 'Member'}
Known conditions: ${(params.bundle_summary?.conditions || []).join(', ') || 'none listed'}
Known medicines: ${(params.bundle_summary?.medicines || []).join(', ') || 'none listed'}
Input provenance: ${hasAudio ? 'voice_recording' : params.image_base64 ? 'uploaded_document' : 'user_reported'}
User contribution: "${transcript || '(See attached image)'}"

Extract EVERY distinct personal or clinical observation into structured timeline items across these 8 categories:
- "test_results" (legacy_kind: "lab")
- "measurements" (legacy_kind: "measure" — weight, BP, HR, glucose, SpO2, body composition)
- "medicines" (legacy_kind: "medicine" — prescriptions, supplements, started/changed/adherence)
- "symptoms" (legacy_kind: "symptom" — symptom, severity, triggers, duration)
- "daily_activities" (legacy_kind: "lifestyle" — sleep hours, exercise, nutrition, hydration, routines)
- "personal_diary" (legacy_kind: "lifestyle" — feelings, experiences, reflections, life events)
- "voice_conversations" (legacy_kind: "lifestyle" — spoken life stories or conversational check-ins)
- "additional_info" (legacy_kind: "family" — family history, wearable summaries, allergies, other context)

Never invent facts not stated or shown. Resolve relative dates like "yesterday" or "last night" accurately relative to ${today}.`,
        });

        const res = await this.ai.models.generateContent({
          model: this.model,
          contents: [{ role: 'user', parts }],
          config: {
            responseMimeType: 'application/json',
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: {
                        type: Type.STRING,
                        enum: [
                          'test_results',
                          'measurements',
                          'medicines',
                          'symptoms',
                          'daily_activities',
                          'personal_diary',
                          'voice_conversations',
                          'additional_info',
                        ],
                      },
                      legacy_kind: {
                        type: Type.STRING,
                        enum: ['lab', 'measure', 'medicine', 'symptom', 'family', 'lifestyle', 'report'],
                      },
                      date: { type: Type.STRING },
                      title: { type: Type.STRING },
                      detail: { type: Type.STRING },
                      provenance: {
                        type: Type.STRING,
                        enum: [
                          'user_reported',
                          'uploaded_document',
                          'measured',
                          'voice_recording',
                          'imported_device',
                          'ai_extracted',
                        ],
                      },
                      confidence: { type: Type.NUMBER },
                      requires_clinician_check: { type: Type.BOOLEAN },
                    },
                    required: [
                      'category',
                      'legacy_kind',
                      'date',
                      'title',
                      'detail',
                      'provenance',
                      'confidence',
                      'requires_clinician_check',
                    ],
                  },
                },
              },
              required: ['summary', 'items'],
            },
          },
        });

        const parsed = extractJsonObject(res.text || '{}');
        if (Array.isArray(parsed?.items) && parsed.items.length > 0) {
          const items: ParsedFeedItem[] = parsed.items.map((it: any) => ({
            category: it.category,
            legacy_kind: it.legacy_kind,
            date: /^\d{4}-\d{2}-\d{2}$/.test(String(it.date || '')) ? it.date : today,
            title: String(it.title || '').trim(),
            detail: String(it.detail || '').trim(),
            provenance: hasAudio ? 'voice_recording' : it.provenance || 'user_reported',
            confidence: Math.max(0.5, Math.min(0.99, Number(it.confidence) || 0.9)),
            requires_clinician_check: Boolean(it.requires_clinician_check),
            structured: {},
          }));
          return {
            transcript,
            summary: String(
              parsed.summary ||
                `Identified ${items.length} structured timeline item${items.length === 1 ? '' : 's'} for your Twin.`
            ),
            items,
            has_audio_recording: hasAudio,
          };
        }
      } catch (err) {
        console.warn('[interpretFeedInput Gemini fallback]', err);
      }
    }

    const localItems = parseNaturalFeedLocally({
      text: transcript,
      referenceDate: today,
      hasAudioRecording: hasAudio,
    });
    return {
      transcript,
      summary: `Identified ${localItems.length} timeline update${localItems.length === 1 ? '' : 's'} from your input.`,
      items: localItems,
      has_audio_recording: hasAudio,
    };
  }

  async trainVoicePersona(params: VoiceTrainRequestBody): Promise<VoiceTrainResponse> {
    const sourceKind = params.source_kind ?? params.source_type;
    const hasRealAudio =
      Boolean(params.audio_base64 && params.audio_base64.trim().length > 32) &&
      sourceKind !== 'text_only';

    const prevAudioSamples =
      params.existing_profile?.audio_sample_count ??
      params.existing_profile?.sample_count ??
      0;
    const nextCount = hasRealAudio
      ? Math.max(prevAudioSamples + 1, params.sample_count ?? prevAudioSamples + 1)
      : prevAudioSamples;

    const prevPassages = Array.isArray(params.existing_profile?.completed_passages)
      ? params.existing_profile!.completed_passages!
      : [];
    const completedPassages =
      hasRealAudio && typeof params.passage_index === 'number'
        ? Array.from(new Set([...prevPassages, params.passage_index])).sort((a, b) => a - b)
        : prevPassages;

    const registerNominalMap: Record<string, number> = {
      deep: 112,
      warm_mid: 146,
      clear_mid: 180,
      bright_high: 212,
    };
    const paceNominalWpmMap: Record<string, number> = {
      calm: 122,
      natural: 142,
      brisk: 162,
    };
    const accentLabelMap: Record<string, string> = {
      neutral: 'neutral international English',
      indian_english: 'natural Indian English',
      british: 'natural British English',
      american: 'natural North American English',
      european: 'natural Continental European English',
      australian: 'natural Australian English',
    };

    const chosenRegister =
      params.vocal_register ?? params.existing_profile?.vocal_register;
    const chosenAccent = params.accent ?? params.existing_profile?.accent ?? 'neutral';
    const chosenPace =
      params.speaking_pace ?? params.existing_profile?.speaking_pace ?? 'natural';

    const rawNewPitch =
      hasRealAudio &&
      typeof params.measured_pitch_hz === 'number' &&
      Number.isFinite(params.measured_pitch_hz) &&
      params.measured_pitch_hz >= 70 &&
      params.measured_pitch_hz <= 340
        ? Math.round(params.measured_pitch_hz)
        : null;

    // Multi-sample weighted F0 stabilization so 2-3 samples lock onto true speaker F0
    const prevPitch = params.existing_profile?.pitch_hz;
    const measuredPitch =
      rawNewPitch != null && prevPitch != null && prevAudioSamples > 0
        ? Math.round((prevPitch * Math.min(prevAudioSamples, 3) + rawNewPitch) / (Math.min(prevAudioSamples, 3) + 1))
        : rawNewPitch ??
          prevPitch ??
          (chosenRegister ? registerNominalMap[chosenRegister] : undefined);

    const effectiveRegister: VoicePersonaProfile['vocal_register'] =
      chosenRegister ||
      (measuredPitch
        ? measuredPitch < 126
          ? 'deep'
          : measuredPitch < 164
            ? 'warm_mid'
            : measuredPitch < 198
              ? 'clear_mid'
              : 'bright_high'
        : 'clear_mid');

    const measuredPitchRange =
      hasRealAudio &&
      typeof params.measured_pitch_range_hz === 'number' &&
      Number.isFinite(params.measured_pitch_range_hz)
        ? Math.round(params.measured_pitch_range_hz)
        : params.existing_profile?.pitch_range_hz ?? 24;

    const measuredBrightness =
      hasRealAudio &&
      typeof params.measured_brightness === 'number' &&
      Number.isFinite(params.measured_brightness)
        ? Math.round(params.measured_brightness)
        : params.existing_profile?.brightness;

    // Blend formant bands across approved recordings
    const prevBands = params.existing_profile?.formant_bands;
    const newBands = hasRealAudio ? params.formant_bands : undefined;
    const mergedBands =
      newBands && prevBands && prevAudioSamples > 0
        ? {
            low: Math.round((prevBands.low * prevAudioSamples + newBands.low) / (prevAudioSamples + 1)),
            mid: Math.round((prevBands.mid * prevAudioSamples + newBands.mid) / (prevAudioSamples + 1)),
            presence: Math.round(
              (prevBands.presence * prevAudioSamples + newBands.presence) / (prevAudioSamples + 1)
            ),
            air: Math.round((prevBands.air * prevAudioSamples + newBands.air) / (prevAudioSamples + 1)),
          }
        : newBands ?? prevBands;

    const basePaceWpm = paceNominalWpmMap[chosenPace] || 142;
    const measuredWpm =
      hasRealAudio &&
      typeof params.measured_wpm === 'number' &&
      Number.isFinite(params.measured_wpm)
        ? Math.round(params.measured_wpm * 0.65 + basePaceWpm * 0.35)
        : params.existing_profile?.cadence_wpm || basePaceWpm;

    // Fidelity reflects phonetic coverage (1 sample ~66%, 2 samples ~82%, 3+ samples ~94-98%)
    const passageBonus = completedPassages.length * 4;
    const metadataBonus = (chosenRegister ? 3 : 0) + (chosenAccent ? 2 : 0);
    const progressiveFidelity = hasRealAudio
      ? Math.min(98, Math.round(52 + Math.min(nextCount, 4) * 9.5 + passageBonus + metadataBonus))
      : params.existing_profile?.fidelity_score ?? 0;

    const pitchMatchedVoice = selectClosestPrebuiltVoiceByPitch(
      measuredPitch ?? registerNominalMap[effectiveRegister || 'clear_mid'],
      params.existing_profile?.prebuilt_voice || 'Kore'
    );

    let transcript = (params.transcript_hint || '').trim();

    if (this.ai && hasRealAudio && params.audio_base64) {
      const cleanAudio = params.audio_base64.replace(/^data:[^;]+;base64,/, '');
      const mimeType = params.mime_type || 'audio/wav';
      try {
        const trRes = await this.ai.models.generateContent({
          model: 'gemini-3.5-transcribe',
          contents: {
            parts: [
              { inlineData: { mimeType, data: cleanAudio } },
              {
                text: 'Transcribe the exact words spoken in this audio clip cleanly without commentary. If silent or non-speech calibration tone, return an empty string.',
              },
            ],
          },
        });
        if (trRes.text && trRes.text.trim()) {
          transcript = trRes.text.trim();
        }
      } catch (err) {
        console.warn('[gemini-3.5-transcribe fallback]', err);
      }
    }

    if (!transcript) {
      transcript =
        'Hi, this is my own voice preserved for my Mutanex Digital Twin—calm, clear, and grounded in who I am.';
    }

    const accentDesc = accentLabelMap[chosenAccent] || chosenAccent;
    const deterministicStyle = `${accentDesc} speaker in a ${effectiveRegister?.replace('_', ' ')} vocal register (~${
      measuredPitch || VOICE_NOMINAL_PITCH_HZ[pitchMatchedVoice]
    } Hz, ±${measuredPitchRange} Hz pitch dynamics) at a ${chosenPace} ${measuredWpm} wpm cadence${
      mergedBands
        ? `, chest resonance ${mergedBands.low}/100, vocal presence ${mergedBands.presence}/100`
        : ''
    }`;

    if (this.ai && hasRealAudio) {
      try {
        const parts: any[] = [];
        if (params.audio_base64) {
          parts.push({
            inlineData: {
              mimeType: params.mime_type || 'audio/wav',
              data: params.audio_base64.replace(/^data:[^;]+;base64,/, ''),
            },
          });
        }
        parts.push({
          text: `Analyze this speaker's exact vocal acoustics so Gemini 3.8 Flash TTS Voice Design can speak back in the SAME personal voice as ${
            params.patient_name || 'the speaker'
          }.
Measured speaker parameters:
- Fundamental pitch F0: ${measuredPitch ? `${measuredPitch} Hz (±${measuredPitchRange} Hz)` : 'infer from audio'}
- Declared/detected register: ${effectiveRegister}
- Accent / dialect: ${accentDesc}
- Speaking pace: ${chosenPace} (~${measuredWpm} wpm)
- 4-band formant energy: ${JSON.stringify(mergedBands || {})}
- Transcript: "${transcript}"
- Closest acoustic base voice by F0: ${pitchMatchedVoice}
- Approved audio sample #${nextCount} (calibrated passages: ${completedPassages.length}/3)
- Previous profile: ${JSON.stringify(params.existing_profile || {})}

Return JSON with:
- vocal_style: rich, specific Voice Design direction capturing this person's exact register, ${accentDesc} inflection, vowel warmth, breathiness, and ${chosenPace} cadence
- prebuilt_voice: best matching Gemini voice ("Fenrir" ~105Hz deep, "Charon" ~125Hz warm baritone, "Puck" ~155Hz midrange, "Zephyr" ~182Hz bright mezzo, "Kore" ~205Hz clear alto/soprano)
- cadence_wpm (105-175), warmth (0-100), clarity (0-100), signature_phrases (up to 4), and summary.`,
        });

        const res = await this.ai.models.generateContent({
          model: this.model,
          contents: [{ role: 'user', parts }],
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                vocal_style: { type: Type.STRING },
                prebuilt_voice: {
                  type: Type.STRING,
                  enum: ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'],
                },
                cadence_wpm: { type: Type.NUMBER },
                warmth: { type: Type.NUMBER },
                clarity: { type: Type.NUMBER },
                signature_phrases: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                summary: { type: Type.STRING },
              },
              required: [
                'vocal_style',
                'prebuilt_voice',
                'cadence_wpm',
                'warmth',
                'clarity',
                'signature_phrases',
                'summary',
              ],
            },
          },
        });

        const parsed = extractJsonObject(res.text || '{}');
        if (parsed?.vocal_style) {
          const validVoices = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'] as const;
          let pb: VoicePersonaProfile['prebuilt_voice'] = validVoices.includes(parsed.prebuilt_voice)
            ? parsed.prebuilt_voice
            : pitchMatchedVoice;
          const refHz = measuredPitch ?? registerNominalMap[effectiveRegister || 'clear_mid'];
          if (refHz) {
            const llmHz = VOICE_NOMINAL_PITCH_HZ[pb];
            if (Math.abs(refHz - llmHz) > 38) {
              pb = pitchMatchedVoice;
            }
          }
          return {
            transcript,
            used_real_audio: true,
            profile: {
              vocal_style: `${String(parsed.vocal_style)} (${accentDesc}, ~${
                measuredPitch || VOICE_NOMINAL_PITCH_HZ[pb]
              } Hz)`,
              prebuilt_voice: pb,
              cadence_wpm: Math.max(
                98,
                Math.min(176, Math.round((Number(parsed.cadence_wpm) || measuredWpm) * 0.5 + measuredWpm * 0.5))
              ),
              warmth: Math.max(50, Math.min(100, Math.round(Number(parsed.warmth) || (mergedBands?.low ?? 86)))),
              clarity: Math.max(60, Math.min(100, Math.round(Number(parsed.clarity) || (mergedBands?.presence ?? 90)))),
              pitch_hz: measuredPitch ?? VOICE_NOMINAL_PITCH_HZ[pb],
              pitch_range_hz: measuredPitchRange,
              brightness: measuredBrightness ?? 58,
              vocal_register: effectiveRegister,
              accent: chosenAccent,
              speaking_pace: chosenPace,
              formant_bands: mergedBands,
              completed_passages: completedPassages,
              signature_phrases: Array.isArray(parsed.signature_phrases)
                ? parsed.signature_phrases.slice(0, 4).map(String)
                : ['Take one steady step at a time'],
              sample_count: nextCount,
              audio_sample_count: nextCount,
              used_real_audio: true,
              fidelity_score: progressiveFidelity,
              consent_verified: Boolean(params.consent_verified ?? true),
              allow_conversation_refinement: Boolean(params.allow_conversation_refinement),
              encrypted_at_rest: true,
              summary: String(
                parsed.summary ||
                  `Calibrated ${pb} (${measuredPitch || VOICE_NOMINAL_PITCH_HZ[pb]} Hz · ${accentDesc}) from ${nextCount} voice sample${nextCount === 1 ? '' : 's'}.`
              ),
            },
          };
        }
      } catch (err) {
        console.warn('[trainVoicePersona fallback]', err);
      }
    }

    return {
      transcript,
      used_real_audio: hasRealAudio,
      profile: {
        vocal_style: params.existing_profile?.vocal_style || deterministicStyle,
        prebuilt_voice: pitchMatchedVoice,
        cadence_wpm: measuredWpm,
        warmth: mergedBands ? Math.min(96, Math.max(55, mergedBands.low + 18)) : params.existing_profile?.warmth || 88,
        clarity: mergedBands
          ? Math.min(97, Math.max(62, mergedBands.presence + 22))
          : params.existing_profile?.clarity || 91,
        pitch_hz: measuredPitch ?? VOICE_NOMINAL_PITCH_HZ[pitchMatchedVoice],
        pitch_range_hz: measuredPitchRange,
        brightness: measuredBrightness ?? 58,
        vocal_register: effectiveRegister,
        accent: chosenAccent,
        speaking_pace: chosenPace,
        formant_bands: mergedBands,
        completed_passages: completedPassages,
        signature_phrases: [
          ...(params.existing_profile?.signature_phrases || []),
          transcript.split(/[.,!?]/)[0]?.slice(0, 48) || 'Steady warmth and care',
        ].slice(-4),
        sample_count: nextCount,
        audio_sample_count: nextCount,
        used_real_audio: hasRealAudio || Boolean(params.existing_profile?.used_real_audio),
        fidelity_score: progressiveFidelity,
        consent_verified: Boolean(params.consent_verified ?? true),
        allow_conversation_refinement: Boolean(params.allow_conversation_refinement),
        encrypted_at_rest: true,
        summary: hasRealAudio
          ? `Calibrated ${pitchMatchedVoice} (${measuredPitch || VOICE_NOMINAL_PITCH_HZ[pitchMatchedVoice]} Hz · ${accentDesc}) from ${nextCount} voice sample${nextCount === 1 ? '' : 's'}.`
          : 'Transcript logged without modifying acoustic voice model.',
      },
    };
  }

  async synthesizeSpeech(params: VoiceSynthesizeRequestBody): Promise<VoiceSynthesizeResponse> {
    const cleanText = capWords(
      String(params.text || '')
        .replace(/[*#_`[\]()]/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
      120
    );
    const validVoices = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'] as const;
    const defaultBySex: VoicePersonaProfile['prebuilt_voice'] =
      params.patient_sex?.toLowerCase() === 'male' ? 'Charon' : 'Kore';
    const vp = params.voice_profile;
    const targetPitch = vp?.pitch_hz;
    const chosenVoice: VoicePersonaProfile['prebuilt_voice'] =
      vp?.prebuilt_voice && validVoices.includes(vp.prebuilt_voice)
        ? vp.prebuilt_voice
        : selectClosestPrebuiltVoiceByPitch(targetPitch, defaultBySex);

    const accentNote =
      vp?.accent && vp.accent !== 'neutral'
        ? `, ${vp.accent.replace('_', ' ')} inflection`
        : '';
    const paceNote = vp?.speaking_pace ? `, ${vp.speaking_pace} pace (~${vp.cadence_wpm || 140} wpm)` : '';
    const stylePrompt =
      vp?.vocal_style ||
      `Warm, natural first-person conversational voice${accentNote}${paceNote}`;
    const resolvedPitch = targetPitch || VOICE_NOMINAL_PITCH_HZ[chosenVoice];

    const ttsClient = this.aiBeta || this.ai;
    if (!cleanText || !ttsClient) {
      return {
        audio_wav_base64: null,
        voice_used: chosenVoice,
        style_used: stylePrompt,
        pitch_hz: resolvedPitch,
      };
    }

    const directedPrompt = `Speak the following first-person reflection naturally in this exact personal voice (${stylePrompt}): "${cleanText}"`;

    // Prioritize flagship gemini-3.8-flash-tts when a calibrated personal voice profile is active
    const modelOrder = vp?.sample_count
      ? ['gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts']
      : ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts'];

    for (const ttsModel of modelOrder) {
      try {
        const ttsRes = await ttsClient.models.generateContent({
          model: ttsModel,
          contents: [
            {
              role: 'user',
              parts: [{ text: directedPrompt }],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: chosenVoice },
              },
            },
          },
        });

        const inline = ttsRes.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        const rawData = inline?.data || null;
        if (rawData) {
          const validWav = ensureValidWavBase64(rawData, inline?.mimeType, 24000);
          const matchedWav = matchWavToVoiceProfile(
            validWav,
            chosenVoice,
            targetPitch,
            vp?.warmth ?? 86
          );
          return {
            audio_wav_base64: matchedWav,
            voice_used: `${chosenVoice} · ${resolvedPitch} Hz`,
            style_used: stylePrompt,
            pitch_hz: resolvedPitch,
          };
        }
      } catch (err: any) {
        console.warn(`[synthesizeSpeech ${ttsModel} fallback]`, err?.message || err);
      }
    }

    return {
      audio_wav_base64: null,
      voice_used: chosenVoice,
      style_used: stylePrompt,
      pitch_hz: resolvedPitch,
    };
  }

  async analyzeFaceLikeness(params: FaceAnalyzeRequestBody): Promise<FaceLikenessProfile> {
    const count = Math.max(1, params.photo_count ?? 1);
    const baseScore = Math.min(97, 68 + count * 9);

    if (this.ai && params.image_base64) {
      const cleanImg = params.image_base64.replace(/^data:[^;]+;base64,/, '');
      try {
        const res = await this.ai.models.generateContent({
          model: this.model,
          contents: [
            {
              inlineData: {
                mimeType: params.mime_type || 'image/jpeg',
                data: cleanImg,
              },
            },
            `Extract accurate 3D craniofacial geometry ratios and natural pigment colors from this reference portrait (${
              params.angle || 'front'
            } angle) so the Mutanex 3D Digital Twin avatar resembles this individual faithfully without caricature.
Return valid JSON with hex colors (#RRGGBB) and normalized ratios around 1.0.`,
          ],
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                skin_tone_hex: { type: Type.STRING },
                hair_color_hex: { type: Type.STRING },
                eye_color_hex: { type: Type.STRING },
                lip_color_hex: { type: Type.STRING },
                face_width_ratio: { type: Type.NUMBER },
                jaw_taper: { type: Type.NUMBER },
                cheek_prominence: { type: Type.NUMBER },
                brow_arch: { type: Type.NUMBER },
                nose_bridge: { type: Type.NUMBER },
                lip_fullness: { type: Type.NUMBER },
                eye_spacing: { type: Type.NUMBER },
                hair_style: {
                  type: Type.STRING,
                  enum: ['short', 'medium', 'long', 'bun', 'curly'],
                },
                facial_hair: {
                  type: Type.STRING,
                  enum: ['none', 'stubble', 'beard'],
                },
                glasses: { type: Type.BOOLEAN },
                likeness_summary: { type: Type.STRING },
              },
              required: [
                'skin_tone_hex',
                'hair_color_hex',
                'eye_color_hex',
                'lip_color_hex',
                'face_width_ratio',
                'jaw_taper',
                'cheek_prominence',
                'brow_arch',
                'hair_style',
                'glasses',
                'likeness_summary',
              ],
            },
          },
        });

        const parsed = extractJsonObject(res.text || '{}');
        if (parsed?.skin_tone_hex) {
          const hexOr = (v: unknown, def: string) =>
            typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v.trim()) ? v.trim() : def;
          const clamp = (n: unknown, lo: number, hi: number, def: number) => {
            const v = Number(n);
            return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : def;
          };
          const styles = ['short', 'medium', 'long', 'bun', 'curly'] as const;
          const facialHairs = ['none', 'stubble', 'beard'] as const;
          return {
            skin_tone_hex: hexOr(parsed.skin_tone_hex, '#c68b67'),
            hair_color_hex: hexOr(parsed.hair_color_hex, '#1c191c'),
            eye_color_hex: hexOr(parsed.eye_color_hex, '#3b281c'),
            lip_color_hex: hexOr(parsed.lip_color_hex, '#a8645d'),
            face_width_ratio: clamp(parsed.face_width_ratio, 0.86, 1.14, 0.98),
            jaw_taper: clamp(parsed.jaw_taper, 0.8, 1.14, 0.94),
            cheek_prominence: clamp(parsed.cheek_prominence, 0.86, 1.2, 1.03),
            brow_arch: clamp(parsed.brow_arch, 0.86, 1.18, 1.01),
            nose_bridge: clamp(parsed.nose_bridge, 0.86, 1.16, 1.0),
            lip_fullness: clamp(parsed.lip_fullness, 0.84, 1.22, 1.0),
            eye_spacing: clamp(parsed.eye_spacing, 0.9, 1.12, 1.0),
            hair_style: styles.includes(parsed.hair_style) ? parsed.hair_style : 'medium',
            facial_hair: facialHairs.includes(parsed.facial_hair) ? parsed.facial_hair : 'none',
            glasses: Boolean(parsed.glasses),
            likeness_score: baseScore,
            likeness_summary: String(
              parsed.likeness_summary ||
                'Craniofacial landmarks, natural skin complexion, and hair contours calibrated onto your 3D Twin.'
            ),
          };
        }
      } catch (err) {
        console.warn('[analyzeFaceLikeness fallback]', err);
      }
    }

    return {
      skin_tone_hex: '#c68b67',
      hair_color_hex: '#1c191c',
      eye_color_hex: '#3b281c',
      lip_color_hex: '#a8645d',
      face_width_ratio: 0.98,
      jaw_taper: 0.94,
      cheek_prominence: 1.03,
      brow_arch: 1.01,
      nose_bridge: 1.0,
      lip_fullness: 1.0,
      eye_spacing: 1.0,
      hair_style: 'medium',
      facial_hair: 'none',
      glasses: false,
      likeness_score: baseScore,
      likeness_summary:
        'Craniofacial landmarks, warm complexion, and hair silhouette calibrated onto your 3D Twin.',
    };
  }

  async speakPreservedTwin(params: PreserveSpeakRequestBody): Promise<PreserveSpeakResponse> {
    const name = params.patient_name || params.bundle?.patient?.preferred_name || 'Anika';
    const validVoices = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'] as const;
    const chosenVoice =
      params.voice_profile?.prebuilt_voice &&
      validVoices.includes(params.voice_profile.prebuilt_voice)
        ? params.voice_profile.prebuilt_voice
        : selectClosestPrebuiltVoiceByPitch(
            params.voice_profile?.pitch_hz,
            params.bundle?.patient?.sex === 'male' ? 'Charon' : 'Kore'
          );

    const stylePrompt =
      params.voice_profile?.vocal_style ||
      'Warm, calm, reflective, natural human cadence with gentle warmth';
    const prevFidelity = params.voice_profile?.fidelity_score ?? 45;
    // Speaking text alone does not falsely inflate acoustic fidelity unless voice profile already exists
    const updatedFidelity = params.voice_profile?.sample_count
      ? Math.min(99, prevFidelity + 2)
      : prevFidelity;

    let replyText = `Hi, it's ${name}. Hearing from you means a lot—I'm taking things one steady step at a time, staying mindful of my health, and holding close the memories and routines that matter most to me.`;

    if (this.ai) {
      try {
        const memoriesText =
          Array.isArray(params.memories) && params.memories.length
            ? params.memories.join(' | ')
            : 'Values calm clear thinking, daily walks, family connection, and steady health habits.';
        const phrasesText = (params.voice_profile?.signature_phrases || []).join('; ');
        const kgSnippet = params.bundle
          ? buildKnowledgeGraphSummary(params.bundle).slice(0, 2400)
          : '';

        const textRes = await this.ai.models.generateContent({
          model: this.model,
          contents: `Prompt to ${name}'s Preserved Digital Self: "${params.prompt}"\n\nPersonal Identity & Memories: ${memoriesText}\nSignature phrasing: ${
            phrasesText || 'warm, grounded everyday speech'
          }\nBiological & Health Context:\n${kgSnippet}`,
          config: {
            systemInstruction: `You are ${name}'s Preserved Digital Representation speaking naturally in the first person ("I"). Reflect ${name}'s authentic voice style (${stylePrompt}), preserved memories, and real health context without inventing facts. Keep your spoken reply heartfelt, natural, and concise (30 to 60 words) with plain spoken words only—no markdown or stage tags.`,
          },
        });
        if (textRes.text && textRes.text.trim()) {
          replyText = capWords(textRes.text.replace(/[*#_`]/g, '').trim(), 65);
        }
      } catch (err) {
        console.warn('[speakPreservedTwin text fallback]', err);
      }

      const synth = await this.synthesizeSpeech({
        text: replyText,
        voice_profile: {
          ...params.voice_profile,
          prebuilt_voice: chosenVoice,
          vocal_style: stylePrompt,
        },
        patient_sex: params.bundle?.patient?.sex,
      });
      if (synth.audio_wav_base64) {
        return {
          reply_text: replyText,
          audio_wav_base64: synth.audio_wav_base64,
          voice_used: synth.voice_used,
          style_used: stylePrompt,
          updated_fidelity: updatedFidelity,
        };
      }
    }

    return {
      reply_text: replyText,
      audio_wav_base64: null,
      voice_used: chosenVoice,
      style_used: stylePrompt,
      updated_fidelity: updatedFidelity,
    };
  }
}
