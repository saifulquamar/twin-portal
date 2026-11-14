export interface VoicePersonaData {
  vocal_style: string;
  prebuilt_voice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  cadence_wpm: number;
  warmth: number;
  clarity: number;
  signature_phrases: string[];
  sample_count: number;
  fidelity_score: number;
  summary: string;
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

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Computes the overall 0-100% Digital Self Preservation Convergence score:
 * - Biological Twin Record: up to 25%
 * - 3D Facial & Photo Likeness: up to 35%
 * - AI Voice Persona Model: up to 35%
 * - Personal Memories & Stories: up to 5%
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
  const voicePct = Math.round((rawVoice / 100) * 35);
  const memoriesBonusPct = Math.min(5, memCount * 2);

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
 * Generates a valid 16kHz 16-bit mono PCM WAV base64 payload (0.8s warm speech-band
 * harmonic envelope) so sample voice calibration works cleanly in headless or mic-less environments.
 */
export function createSampleVoiceWavBase64(durationSec = 0.8): string {
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
    const f0 = 185 + 14 * Math.sin(2 * Math.PI * 2.5 * t);
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
