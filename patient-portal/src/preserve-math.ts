export type VoiceProvenanceType =
  | 'recorded_audio'
  | 'uploaded_audio'
  | 'conversation_audio'
  | 'text_only';

export type VocalRegister = 'deep' | 'warm_mid' | 'clear_mid' | 'bright_high';

export type VoiceAccent =
  | 'neutral'
  | 'indian_english'
  | 'british'
  | 'american'
  | 'european'
  | 'australian';

export type SpeakingPace = 'calm' | 'natural' | 'brisk';

export interface FormantBandProfile {
  low: number; // 80-320 Hz chest resonance (0..100)
  mid: number; // 320-1200 Hz vowel body (0..100)
  presence: number; // 1200-3400 Hz clarity/articulation (0..100)
  air: number; // 3400-7500 Hz breath/brilliance (0..100)
}

export interface VoicePersonaData {
  vocal_style: string;
  prebuilt_voice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  cadence_wpm: number;
  warmth: number;
  clarity: number;
  pitch_hz?: number;
  pitch_range_hz?: number;
  brightness?: number;
  vocal_register?: VocalRegister;
  accent?: VoiceAccent;
  speaking_pace?: SpeakingPace;
  formant_bands?: FormantBandProfile;
  signature_phrases: string[];
  sample_count: number;
  audio_sample_count?: number;
  completed_passages?: number[];
  fidelity_score: number;
  summary: string;
  consent_verified?: boolean;
  used_real_audio?: boolean;
}

export interface FaceLikenessData {
  skin_tone_hex: string;
  hair_color_hex: string;
  eye_color_hex: string;
  lip_color_hex: string;
  face_width_ratio: number;
  jaw_taper: number;
  cheek_prominence: number;
  brow_arch: number;
  nose_bridge_height?: number;
  hair_style: 'short' | 'medium' | 'long' | 'bun' | 'curly';
  glasses: boolean;
  likeness_score: number;
  likeness_summary: string;
}

export interface PreservedTurn {
  id: string;
  at: string;
  prompt: string;
  reply: string;
  voiceUsed: string;
  styleUsed: string;
  audioWavBase64: string | null;
}

export interface PreservationConvergence {
  twinBasePct: number;
  facePct: number;
  voicePct: number;
  memoriesBonusPct: number;
  totalPct: number;
  stageLabel: string;
}

export interface TwinCompletenessSummary {
  clinicalPct: number;
  identityPct: number;
  totalPct: number;
  assessedDomains: number;
  totalDomains: number;
  hasFace: boolean;
  hasVoice: boolean;
  memoriesCount: number;
  feedCount: number;
  statusLabel: string;
}

export interface AudioQualityReport {
  durationSec: number;
  rms: number;
  snrDb: number;
  clipping: boolean;
  qualityLabel: 'Studio Clear' | 'Good' | 'Low Signal — Move Closer' | 'Clipped — Speak Softer';
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export const VOCAL_REGISTER_LABELS: Record<VocalRegister, string> = {
  deep: 'Deep (85–130 Hz)',
  warm_mid: 'Warm Mid (125–165 Hz)',
  clear_mid: 'Clear Mid (160–200 Hz)',
  bright_high: 'Bright (195–255 Hz)',
};

export const VOICE_ACCENT_LABELS: Record<VoiceAccent, string> = {
  neutral: 'Neutral International',
  indian_english: 'Indian English',
  british: 'British',
  american: 'North American',
  european: 'Continental European',
  australian: 'Australian / NZ',
};

export const SPEAKING_PACE_LABELS: Record<SpeakingPace, string> = {
  calm: 'Calm (~122 wpm)',
  natural: 'Natural (~142 wpm)',
  brisk: 'Brisk (~162 wpm)',
};

export function inferRegisterFromPitchHz(pitchHz?: number | null): VocalRegister {
  if (!pitchHz || !Number.isFinite(pitchHz)) return 'clear_mid';
  if (pitchHz < 126) return 'deep';
  if (pitchHz < 164) return 'warm_mid';
  if (pitchHz < 198) return 'clear_mid';
  return 'bright_high';
}

export function nominalPitchForRegister(reg?: VocalRegister): number {
  switch (reg) {
    case 'deep':
      return 112;
    case 'warm_mid':
      return 146;
    case 'bright_high':
      return 212;
    case 'clear_mid':
    default:
      return 180;
  }
}

export function nominalWpmForPace(pace?: SpeakingPace): number {
  switch (pace) {
    case 'calm':
      return 122;
    case 'brisk':
      return 162;
    case 'natural':
    default:
      return 142;
  }
}

/**
 * Computes the overall 0-100% Digital Self Preservation Convergence score:
 * - Biological Twin Record: up to 25%
 * - 3D Facial & Photo Likeness: up to 35%
 * - Personal Voice Profile (requires real audio samples): up to 30%
 * - Personal Identity & Memory Vault: up to 10%
 */
export function computePreservationScore(params: {
  hasTwinRecord: boolean;
  faceLikenessScore?: number | null;
  voiceFidelityScore?: number | null;
  memoriesCount?: number;
}): PreservationConvergence {
  const twinBasePct = params.hasTwinRecord ? 25 : 10;
  const rawFace = clamp(Number(params.faceLikenessScore || 0), 0, 100);
  const rawVoice = clamp(Number(params.voiceFidelityScore || 0), 0, 100);
  const memCount = Math.max(0, Math.floor(params.memoriesCount || 0));

  const facePct = Math.round((rawFace / 100) * 35);
  const voicePct = Math.round((rawVoice / 100) * 30);
  const memoriesBonusPct = Math.min(10, memCount * 2);

  const totalPct = clamp(twinBasePct + facePct + voicePct + memoriesBonusPct, 0, 100);

  let stageLabel = 'Biological Foundation';
  if (totalPct >= 82) {
    stageLabel = 'High-Fidelity Living Self';
  } else if (totalPct >= 58) {
    stageLabel = 'Converging Likeness & Voice';
  } else if (totalPct >= 34) {
    stageLabel = 'Early Persona Calibration';
  }

  return {
    twinBasePct,
    facePct,
    voicePct,
    memoriesBonusPct,
    totalPct,
    stageLabel,
  };
}

/**
 * Computes real data-driven Twin Completeness across ANY of the 12 patient bundles
 * combining clinical domain coverage, longitudinal Feed contributions, and Identity Preservation.
 */
export function computeTwinCompleteness(params: {
  bundle: any;
  feedCount?: number;
  hasFace?: boolean;
  hasVoice?: boolean;
  memoriesCount?: number;
}): TwinCompletenessSummary {
  const domains: any[] = Array.isArray(params.bundle?.domains) ? params.bundle.domains : [];
  const totalDomains = Math.max(1, domains.length || 8);
  const assessedDomains = domains.filter((d) => d && d.status && d.status !== 'none').length;
  const domainRatio = clamp(assessedDomains / totalDomains, 0, 1);

  const labsCount = Object.keys(params.bundle?.labs || {}).length;
  const labBonus = Math.min(0.15, labsCount * 0.015);
  const feedCount = Math.max(0, params.feedCount || 0);
  const feedBonus = Math.min(0.1, feedCount * 0.02);

  const clinicalPct = Math.round(clamp((domainRatio * 0.8 + labBonus + feedBonus) * 60, 12, 60));

  const hasFace = Boolean(params.hasFace);
  const hasVoice = Boolean(params.hasVoice);
  const memoriesCount = Math.max(0, params.memoriesCount || 0);
  const identityPct = clamp(
    (hasFace ? 15 : 0) + (hasVoice ? 15 : 0) + Math.min(10, memoriesCount * 3),
    0,
    40
  );

  const totalPct = clamp(clinicalPct + identityPct, 12, 100);
  let statusLabel = 'Clinical baseline active';
  if (hasFace && hasVoice) {
    statusLabel = '3D likeness & personal voice preserved';
  } else if (hasFace || hasVoice) {
    statusLabel = hasVoice ? 'Personal voice active · add 3D photo' : '3D likeness active · add voice';
  } else if (memoriesCount > 0 || feedCount > 0) {
    statusLabel = 'Growing twin · preserve face & voice';
  }

  return {
    clinicalPct,
    identityPct,
    totalPct,
    assessedDomains,
    totalDomains,
    hasFace,
    hasVoice,
    memoriesCount,
    feedCount,
    statusLabel,
  };
}

/**
 * Generates first-person self-perspective prompts ("How am I doing?", never "How are you doing?")
 * dynamically tailored to any of the 12 patient profiles' conditions, labs, medicines, and memories.
 */
export function buildSelfPerspectivePrompts(
  bundle: any,
  feedCount = 0,
  memoriesCount = 0
): string[] {
  const prompts: string[] = [
    'How am I doing overall right now?',
    'What has changed in my health recently?',
  ];

  const meds: string[] = Array.isArray(bundle?.patient?.medicines) ? bundle.patient.medicines : [];
  const supplements: string[] = Array.isArray(bundle?.patient?.supplements)
    ? bundle.patient.supplements
    : [];
  if (meds.length > 0 || supplements.length > 0) {
    prompts.push('What medicines and supplements am I taking, and anything to watch?');
  }

  const le8: any[] = Array.isArray(bundle?.le8) ? bundle.le8 : [];
  if (le8.some((x) => /sleep/i.test(String(x?.name || '')))) {
    prompts.push('How have I been sleeping and recovering?');
  }

  if (feedCount > 0) {
    prompts.push('What symptoms or daily updates have I reported recently?');
  } else {
    const topOrganEntry = Object.entries(bundle?.organs || {}).find(
      ([, v]: [string, any]) => v?.state === 'attention'
    );
    if (topOrganEntry) {
      const label = String((topOrganEntry[1] as any)?.label || topOrganEntry[0]).toLowerCase();
      prompts.push(`What is happening with my ${label} and what should I check next?`);
    }
  }

  prompts.push('What should I focus on next for my health?');
  if (memoriesCount > 0) {
    prompts.push('What do you remember about my personal values and daily routines?');
  } else {
    prompts.push('What is still unmeasured in my twin right now?');
  }

  return Array.from(new Set(prompts)).slice(0, 7);
}

/**
 * Analyzes PCM audio samples to provide real-time recording quality feedback
 * (SNR estimate in dB, RMS level, clipping check, and duration).
 */
export function analyzeAudioSamplesQuality(
  samples: Float32Array,
  sampleRate: number
): AudioQualityReport {
  if (!samples || samples.length === 0 || sampleRate <= 0) {
    return {
      durationSec: 0,
      rms: 0,
      snrDb: 0,
      clipping: false,
      qualityLabel: 'Low Signal — Move Closer',
    };
  }

  const durationSec = Number((samples.length / sampleRate).toFixed(2));
  let sumSq = 0;
  let clippedSamples = 0;

  const frameLen = Math.max(128, Math.floor(sampleRate * 0.025));
  const frameRms: number[] = [];

  for (let i = 0; i < samples.length; i += frameLen) {
    const end = Math.min(samples.length, i + frameLen);
    let fSq = 0;
    for (let j = i; j < end; j++) {
      const s = samples[j];
      sumSq += s * s;
      fSq += s * s;
      if (Math.abs(s) >= 0.985) clippedSamples++;
    }
    frameRms.push(Math.sqrt(fSq / Math.max(1, end - i)));
  }

  const rms = Math.sqrt(sumSq / samples.length);
  const clipping = clippedSamples / samples.length > 0.005;

  const sortedFrames = [...frameRms].sort((a, b) => a - b);
  const noiseFloor = Math.max(0.0005, sortedFrames[Math.floor(sortedFrames.length * 0.15)] || 0.001);
  const speechPeak = Math.max(noiseFloor * 1.2, sortedFrames[Math.floor(sortedFrames.length * 0.88)] || rms);
  const snrDb = clamp(Math.round(20 * Math.log10(speechPeak / noiseFloor)), 4, 46);

  let qualityLabel: AudioQualityReport['qualityLabel'] = 'Good';
  if (clipping) {
    qualityLabel = 'Clipped — Speak Softer';
  } else if (rms < 0.012 || snrDb < 10) {
    qualityLabel = 'Low Signal — Move Closer';
  } else if (snrDb >= 20) {
    qualityLabel = 'Studio Clear';
  }

  return {
    durationSec,
    rms: Number(rms.toFixed(4)),
    snrDb,
    clipping,
    qualityLabel,
  };
}

/**
 * Generates a valid 16kHz 16-bit mono PCM WAV base64 payload (warm speech-band
 * harmonic envelope) so sample calibration works cleanly in mic-less environments.
 */
export function createSampleVoiceWavBase64(durationSec = 0.85, baseF0 = 182): string {
  const sampleRate = 16000;
  const numSamples = Math.max(1600, Math.floor(sampleRate * durationSec));
  const dataSize = numSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.sin(Math.PI * (i / numSamples)) * (0.65 + 0.35 * Math.sin(2 * Math.PI * 4.2 * t));
    const f0 = baseF0 + 14 * Math.sin(2 * Math.PI * 2.5 * t);
    const sig =
      0.55 * Math.sin(2 * Math.PI * f0 * t) +
      0.28 * Math.sin(2 * Math.PI * f0 * 2 * t) +
      0.12 * Math.sin(2 * Math.PI * f0 * 3 * t);
    const pcm = clamp(Math.round(sig * env * 12000), -32767, 32767);
    view.setInt16(44 + i * 2, pcm, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 4096;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return typeof btoa === 'function'
    ? btoa(binary)
    : Buffer.from(bytes).toString('base64');
}

/**
 * Deterministic syllable-cadence lip-sync level (0..1) used when speaking text
 * if Web Audio AnalyserNode output is silent or muted by browser autoplay policy.
 */
export function computeSyntheticSpeechMouthOpen(elapsedSec: number, wpm = 148): number {
  const syllableHz = clamp((wpm / 60) * 1.45, 2.2, 5.2);
  const carrier = Math.max(0, Math.sin(elapsedSec * Math.PI * 2 * syllableHz));
  const modulation = 0.55 + 0.45 * Math.sin(elapsedSec * Math.PI * 2 * 1.35 + 0.6);
  const pauseGate = Math.sin(elapsedSec * 2.1) > -0.78 ? 1 : 0.12;
  return clamp(carrier * modulation * pauseGate, 0, 1);
}

/**
 * Estimates the speaker's fundamental vocal pitch F0 (Hz) and pitch range
 * from PCM samples using normalized autocorrelation across human voiced range (75..310 Hz).
 */
export function estimateAutocorrelationPitchStats(
  samples: Float32Array,
  sampleRate: number
): { medianHz: number | null; rangeHz: number | null } {
  if (!samples || samples.length < 1024 || sampleRate < 4000) {
    return { medianHz: null, rangeHz: null };
  }

  const minLag = Math.max(8, Math.floor(sampleRate / 310));
  const maxLag = Math.min(samples.length >> 1, Math.ceil(sampleRate / 75));
  if (maxLag <= minLag) return { medianHz: null, rangeHz: null };

  const frameSize = Math.min(2048, samples.length - maxLag - 1);
  if (frameSize < 512) return { medianHz: null, rangeHz: null };

  const detectedF0s: number[] = [];
  const step = Math.max(512, Math.floor(samples.length / 10));

  for (let offset = 0; offset + frameSize + maxLag < samples.length; offset += step) {
    let rms = 0;
    for (let i = 0; i < frameSize; i++) {
      const s = samples[offset + i];
      rms += s * s;
    }
    rms = Math.sqrt(rms / frameSize);
    if (rms < 0.012) continue;

    let bestCorr = 0;
    let bestLag = -1;

    for (let lag = minLag; lag <= maxLag; lag++) {
      let num = 0;
      let denA = 0;
      let denB = 0;
      for (let i = 0; i < frameSize; i += 2) {
        const a = samples[offset + i];
        const b = samples[offset + i + lag];
        num += a * b;
        denA += a * a;
        denB += b * b;
      }
      const denom = Math.sqrt(denA * denB);
      const corr = denom > 1e-8 ? num / denom : 0;
      if (corr > bestCorr) {
        bestCorr = corr;
        bestLag = lag;
      }
    }

    if (bestLag > 0 && bestCorr >= 0.45) {
      detectedF0s.push(sampleRate / bestLag);
    }
  }

  if (detectedF0s.length === 0) return { medianHz: null, rangeHz: null };
  detectedF0s.sort((a, b) => a - b);
  const medianHz = Math.round(detectedF0s[Math.floor(detectedF0s.length / 2)]);
  const p15 = detectedF0s[Math.floor(detectedF0s.length * 0.15)];
  const p85 = detectedF0s[Math.min(detectedF0s.length - 1, Math.floor(detectedF0s.length * 0.85))];
  const rangeHz = Math.max(8, Math.round(p85 - p15));
  return { medianHz, rangeHz };
}

export function estimateAutocorrelationPitchHz(
  samples: Float32Array,
  sampleRate: number
): number | null {
  return estimateAutocorrelationPitchStats(samples, sampleRate).medianHz;
}

/**
 * Estimates vocal brightness (0..100) from zero-crossing density.
 */
export function estimateSpectralBrightness(
  samples: Float32Array,
  sampleRate = 16000
): number {
  if (!samples || samples.length < 256) return 58;
  let crossings = 0;
  let prev = samples[0];
  for (let i = 1; i < samples.length; i++) {
    const cur = samples[i];
    if ((prev >= 0 && cur < 0) || (prev < 0 && cur >= 0)) {
      crossings++;
    }
    prev = cur;
  }
  const zcrHz = (crossings / samples.length) * (sampleRate / 2);
  const normalized = Math.round(35 + Math.min(60, (zcrHz / 1600) * 55));
  return Math.max(25, Math.min(95, normalized));
}

/**
 * Estimates a 4-band vocal formant/timbre envelope (low chest, vowel mid, presence, air)
 * using lightweight single-pole cascaded IIR band splits on voiced frames.
 */
export function estimateFormantBands(
  samples: Float32Array,
  sampleRate = 16000
): FormantBandProfile {
  if (!samples || samples.length < 512 || sampleRate <= 0) {
    return { low: 62, mid: 68, presence: 64, air: 52 };
  }
  const a320 = Math.exp((-2 * Math.PI * 320) / sampleRate);
  const a1200 = Math.exp((-2 * Math.PI * 1200) / sampleRate);
  const a3400 = Math.exp((-2 * Math.PI * 3400) / sampleRate);

  let lp320 = 0;
  let lp1200 = 0;
  let lp3400 = 0;

  let eLow = 0;
  let eMid = 0;
  let ePres = 0;
  let eAir = 0;

  const stride = samples.length > 64000 ? 2 : 1;
  for (let i = 0; i < samples.length; i += stride) {
    const x = samples[i];
    lp320 = (1 - a320) * x + a320 * lp320;
    lp1200 = (1 - a1200) * x + a1200 * lp1200;
    lp3400 = (1 - a3400) * x + a3400 * lp3400;

    const bLow = lp320;
    const bMid = lp1200 - lp320;
    const bPres = lp3400 - lp1200;
    const bAir = x - lp3400;

    eLow += bLow * bLow;
    eMid += bMid * bMid;
    ePres += bPres * bPres;
    eAir += bAir * bAir;
  }

  const total = Math.max(1e-9, eLow + eMid + ePres + eAir);
  const norm = (v: number, scale: number, base: number) =>
    clamp(Math.round(base + Math.sqrt(v / total) * scale), 25, 96);

  return {
    low: norm(eLow, 72, 28),
    mid: norm(eMid, 68, 32),
    presence: norm(ePres, 85, 30),
    air: norm(eAir, 95, 26),
  };
}

/**
 * Estimates natural speaking cadence (words per minute) from syllable energy peaks
 * across voiced segments.
 */
export function estimateSyllableCadenceWpm(
  samples: Float32Array,
  sampleRate = 16000
): number {
  if (!samples || samples.length < Math.floor(sampleRate * 0.6) || sampleRate <= 0) {
    return 140;
  }
  const win = Math.max(160, Math.floor(sampleRate * 0.04)); // 40ms envelope frames
  const env: number[] = [];
  for (let i = 0; i < samples.length; i += win) {
    const end = Math.min(samples.length, i + win);
    let sq = 0;
    for (let j = i; j < end; j++) sq += samples[j] * samples[j];
    env.push(Math.sqrt(sq / Math.max(1, end - i)));
  }
  const maxEnv = Math.max(...env, 0.001);
  const thresh = Math.max(0.014, maxEnv * 0.28);

  let activeSpeechFrames = 0;
  let silenceRun = 999;
  const maxConsonantDipFrames = 8; // 8 * 40ms = 320ms inter-syllable gap bridged
  let peaks = 0;
  let lastPeakIdx = -4;

  for (let i = 0; i < env.length; i++) {
    if (env[i] >= thresh * 0.45) {
      if (silenceRun > 0 && silenceRun <= maxConsonantDipFrames) {
        activeSpeechFrames += silenceRun;
      }
      activeSpeechFrames++;
      silenceRun = 0;
    } else {
      silenceRun++;
    }
    if (
      i > 0 &&
      i < env.length - 1 &&
      env[i] > thresh &&
      env[i] >= env[i - 1] &&
      env[i] >= env[i + 1] &&
      i - lastPeakIdx >= 3
    ) {
      peaks++;
      lastPeakIdx = i;
    }
  }
  const speechSec = Math.max(0.5, (activeSpeechFrames * win) / sampleRate);
  const syllablesPerSec = clamp(peaks / speechSec, 2.4, 5.6);
  // English / conversational average ~1.48 syllables per word
  return clamp(Math.round((syllablesPerSec / 1.48) * 60), 108, 178);
}
