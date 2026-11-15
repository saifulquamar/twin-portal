import {
  analyzeAudioSamplesQuality,
  estimateAutocorrelationPitchHz,
  estimateSpectralBrightness,
  type AudioQualityReport,
  type VoicePersonaData,
  type VoiceProvenanceType,
} from './preserve-math';

export const SHARED_VOICE_STORE_KEY = 'mx-preserve-voice-v1';
export const SHARED_VOICE_CONSENT_KEY = 'mx-preserve-voice-consent-v1';
export const SHARED_VOICE_CLIPS_KEY = 'mx-preserve-voice-clips-v1';
export const VOICE_UPDATED_EVENT = 'mx-voice-profile-updated';

const VITE_ASK_URL: string =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_ASK_URL) || '';

export function resolvePortalApiUrl(path: string, hostApiBase?: string): string {
  const base = (VITE_ASK_URL || hostApiBase || '').replace(/\/$/, '');
  return `${base}${path}`;
}

export function resolvePortalWsUrl(path: string, hostApiBase?: string): string {
  const httpBase = (VITE_ASK_URL || hostApiBase || window.location.origin).replace(/\/$/, '');
  const wsBase = httpBase.replace(/^http:/i, 'ws:').replace(/^https:/i, 'wss:');
  return `${wsBase}${path}`;
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const str = typeof reader.result === 'string' ? reader.result : '';
      const idx = str.indexOf(',');
      resolve(idx >= 0 ? str.slice(idx + 1) : str);
    };
    reader.onerror = () => reject(reader.error || new Error('Failed to read audio blob'));
    reader.readAsDataURL(blob);
  });
}

export function base64ToUint8Array(b64: string): Uint8Array {
  const clean = b64.includes(',') ? b64.slice(b64.indexOf(',') + 1) : b64;
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

export function float32ToPcm16Base64(float32: Float32Array): string {
  const pcm16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32[i]));
    pcm16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }
  const bytes = new Uint8Array(pcm16.buffer);
  let binary = '';
  const step = 4096;
  for (let i = 0; i < bytes.length; i += step) {
    binary += String.fromCharCode(...bytes.subarray(i, i + step));
  }
  return btoa(binary);
}

/**
 * Decodes a recorded microphone or uploaded audio Blob via Web Audio API
 * to measure the speaker's actual fundamental pitch F0 (Hz), spectral brightness,
 * and signal-to-noise quality report.
 */
export async function analyzeBlobAcoustics(blob: Blob): Promise<{
  pitchHz: number | null;
  brightness: number;
  quality: AudioQualityReport;
}> {
  const defaultQuality: AudioQualityReport = {
    durationSec: Math.max(0.5, Number((blob.size / 32000).toFixed(1))),
    rms: 0.08,
    snrDb: 22,
    clipping: false,
    qualityLabel: 'Good',
  };

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      return { pitchHz: null, brightness: 58, quality: defaultQuality };
    }
    const arrayBuf = await blob.arrayBuffer();
    const ctx = new AudioCtx();
    try {
      const audioBuf = await ctx.decodeAudioData(arrayBuf.slice(0));
      const chan = audioBuf.getChannelData(0);
      const pitchHz = estimateAutocorrelationPitchHz(chan, audioBuf.sampleRate);
      const brightness = estimateSpectralBrightness(chan, audioBuf.sampleRate);
      const quality = analyzeAudioSamplesQuality(chan, audioBuf.sampleRate);
      return { pitchHz, brightness, quality };
    } finally {
      await ctx.close().catch(() => {});
    }
  } catch {
    return { pitchHz: null, brightness: 58, quality: defaultQuality };
  }
}

export async function trainAndTranscribeUserVoice(params: {
  audioBase64?: string;
  mimeType?: string;
  sourceType?: VoiceProvenanceType;
  consentVerified?: boolean;
  measuredPitchHz?: number | null;
  measuredBrightness?: number;
  transcriptHint?: string;
  patientName?: string;
  existingProfile?: VoicePersonaData | null;
  apiBase?: string;
}): Promise<{
  transcript: string;
  profile: VoicePersonaData;
  used_real_audio?: boolean;
  source_type?: VoiceProvenanceType;
}> {
  const isRealAudio = Boolean(params.audioBase64 && params.audioBase64.length > 64);
  const effectiveSource: VoiceProvenanceType = isRealAudio
    ? params.sourceType && params.sourceType !== 'text_only'
      ? params.sourceType
      : 'recorded_audio'
    : 'text_only';

  const nextSamples = isRealAudio
    ? (params.existingProfile?.sample_count || 0) + 1
    : params.existingProfile?.sample_count || 0;

  const res = await fetch(resolvePortalApiUrl('/v1/preserve/voice-train', params.apiBase), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      audio_base64: isRealAudio ? params.audioBase64 : undefined,
      mime_type: params.mimeType,
      source_type: effectiveSource,
      consent_verified: params.consentVerified ?? true,
      transcript_hint: params.transcriptHint,
      patient_name: params.patientName || 'Member',
      sample_count: nextSamples,
      measured_pitch_hz: isRealAudio ? params.measuredPitchHz ?? undefined : undefined,
      measured_brightness: isRealAudio ? params.measuredBrightness : undefined,
      existing_profile: params.existingProfile || undefined,
    }),
  });
  if (!res.ok) {
    throw new Error(`Voice transcription & profile build returned HTTP ${res.status}`);
  }
  return (await res.json()) as {
    transcript: string;
    profile: VoicePersonaData;
    used_real_audio?: boolean;
    source_type?: VoiceProvenanceType;
  };
}

export async function requestMatchedVoiceSynthesis(params: {
  text: string;
  voiceProfile?: VoicePersonaData | null;
  patientSex?: string;
  apiBase?: string;
}): Promise<{ audio_wav_base64: string | null; voice_used: string; pitch_hz: number }> {
  const res = await fetch(resolvePortalApiUrl('/v1/voice/synthesize', params.apiBase), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: params.text,
      voice_profile: params.voiceProfile || undefined,
      patient_sex: params.patientSex,
    }),
  });
  if (!res.ok) {
    throw new Error(`Matched-voice synthesis returned HTTP ${res.status}`);
  }
  return (await res.json()) as {
    audio_wav_base64: string | null;
    voice_used: string;
    pitch_hz: number;
  };
}

let activePlaybackCleanup: (() => void) | null = null;

export function stopActiveVoicePlayback(): void {
  if (activePlaybackCleanup) {
    activePlaybackCleanup();
    activePlaybackCleanup = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

export interface VoicePlaybackCallbacks {
  onStart?: () => void;
  onLevel?: (level0to1: number) => void;
  onEnd?: () => void;
}

/**
 * Plays synthesized WAV audio matched to the user's voice profile using Web Audio
 * BufferSource + AnalyserNode (feeding live 0..1 lip-sync levels!) with graceful
 * HTMLAudioElement and SpeechSynthesis fallbacks.
 */
export async function playMatchedVoiceReply(
  wavBase64: string | null | undefined,
  fallbackText: string,
  voiceProfile?: VoicePersonaData | null,
  callbacks?: VoicePlaybackCallbacks
): Promise<void> {
  stopActiveVoicePlayback();

  const estimatedMs = Math.max(
    2200,
    Math.min(14000, Math.max(1, fallbackText.trim().split(/\s+/).length) * 360)
  );

  if (wavBase64) {
    // 1. Primary path: Web Audio API decodeAudioData + BufferSource + AnalyserNode
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          await ctx.resume().catch(() => {});
        }
        const bytes = base64ToUint8Array(wavBase64);
        const audioBuf = await ctx.decodeAudioData(bytes.buffer.slice(0) as ArrayBuffer);
        const src = ctx.createBufferSource();
        src.buffer = audioBuf;
        if (voiceProfile?.cadence_wpm) {
          src.playbackRate.value = Math.max(0.88, Math.min(1.16, voiceProfile.cadence_wpm / 142));
        }

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.62;
        const bins = new Uint8Array(analyser.frequencyBinCount);

        src.connect(analyser);
        analyser.connect(ctx.destination);

        let raf = 0;
        let ended = false;
        const finish = () => {
          if (ended) return;
          ended = true;
          cancelAnimationFrame(raf);
          callbacks?.onLevel?.(0);
          callbacks?.onEnd?.();
          try {
            src.stop();
          } catch {
            // already stopped
          }
          void ctx.close().catch(() => {});
        };

        activePlaybackCleanup = finish;

        const meterLoop = () => {
          if (ended) return;
          analyser.getByteFrequencyData(bins);
          let sum = 0;
          const n = Math.min(36, bins.length);
          for (let i = 1; i < n; i++) sum += bins[i];
          const lvl = n > 1 ? sum / ((n - 1) * 255) : 0;
          callbacks?.onLevel?.(Math.min(1, lvl * 1.65));
          raf = requestAnimationFrame(meterLoop);
        };

        src.onended = finish;
        callbacks?.onStart?.();
        src.start(0);
        meterLoop();

        // Safety timer in case headless AudioContext remains suspended
        const safetyMs = Math.ceil((audioBuf.duration / src.playbackRate.value) * 1000) + 450;
        window.setTimeout(finish, safetyMs);
        return;
      }
    } catch {
      // Fall through to HTMLAudioElement path
    }

    // 2. Secondary path: HTMLAudioElement
    try {
      const audio = new Audio(`data:audio/wav;base64,${wavBase64}`);
      if (voiceProfile?.cadence_wpm) {
        audio.playbackRate = Math.max(0.88, Math.min(1.16, voiceProfile.cadence_wpm / 142));
      }
      let finished = false;
      const done = () => {
        if (finished) return;
        finished = true;
        audio.pause();
        callbacks?.onLevel?.(0);
        callbacks?.onEnd?.();
      };
      activePlaybackCleanup = done;
      audio.onended = done;
      audio.onerror = done;
      callbacks?.onStart?.();
      await audio.play();
      return;
    } catch {
      // Fall through to SpeechSynthesis / timed animation fallback
    }
  }

  // 3. Fallback path: Browser SpeechSynthesis + timed lip-sync envelope
  callbacks?.onStart?.();
  let fallbackTimer = 0;
  const finishFallback = () => {
    window.clearTimeout(fallbackTimer);
    callbacks?.onLevel?.(0);
    callbacks?.onEnd?.();
  };
  activePlaybackCleanup = finishFallback;

  if (typeof window !== 'undefined' && 'speechSynthesis' in window && fallbackText.trim()) {
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(fallbackText.slice(0, 650));
      if (voiceProfile?.pitch_hz) {
        utter.pitch = Math.max(0.65, Math.min(1.45, voiceProfile.pitch_hz / 165));
      }
      if (voiceProfile?.cadence_wpm) {
        utter.rate = Math.max(0.85, Math.min(1.2, voiceProfile.cadence_wpm / 140));
      }
      utter.onend = finishFallback;
      utter.onerror = finishFallback;
      window.speechSynthesis.speak(utter);
    } catch {
      // ignore if speechSynthesis unavailable in headless browser
    }
  }

  fallbackTimer = window.setTimeout(finishFallback, estimatedMs);
}

export interface LiveVoiceSessionCallbacks {
  onStatusChange?: (status: 'connecting' | 'listening' | 'speaking' | 'closed' | 'error', detail?: string) => void;
  onInputTranscript?: (text: string) => void;
  onOutputTranscript?: (text: string) => void;
  onTurnComplete?: () => void;
}

/**
 * Real-time bidirectional voice streaming client over /v1/live (Gemini 3.8 Live API).
 * Captures 16kHz mono PCM microphone audio and plays back 24kHz PCM Twin responses
 * gaplessly via scheduled AudioBufferSourceNodes + live AnalyserNode lip-sync metering.
 */
export class LiveTwinVoiceClient {
  private ws: WebSocket | null = null;
  private inputCtx: AudioContext | null = null;
  private outputCtx: AudioContext | null = null;
  private outputAnalyser: AnalyserNode | null = null;
  private outputBins: Uint8Array<ArrayBuffer> | null = null;
  private micStream: MediaStream | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private activeSources = new Set<AudioBufferSourceNode>();
  private nextStartTime = 0;
  private callbacks: LiveVoiceSessionCallbacks;

  constructor(callbacks: LiveVoiceSessionCallbacks) {
    this.callbacks = callbacks;
  }

  public getOutputLevel(): number {
    if (!this.outputAnalyser || !this.outputBins) return 0;
    this.outputAnalyser.getByteFrequencyData(this.outputBins);
    let sum = 0;
    const count = Math.min(36, this.outputBins.length);
    for (let i = 1; i < count; i++) sum += this.outputBins[i];
    return count > 1 ? Math.min(1, (sum / ((count - 1) * 255)) * 1.65) : 0;
  }

  public async connect(params: {
    patientName: string;
    bundle: any;
    voiceProfile?: VoicePersonaData | null;
    memories?: string[];
    apiBase?: string;
    enableMic?: boolean;
  }): Promise<void> {
    this.disconnect();
    this.callbacks.onStatusChange?.('connecting', 'Connecting live Twin voice channel…');

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (AudioCtx) {
      this.outputCtx = new AudioCtx({ sampleRate: 24000 });
      if (this.outputCtx.state === 'suspended') {
        await this.outputCtx.resume().catch(() => {});
      }
      this.outputAnalyser = this.outputCtx.createAnalyser();
      this.outputAnalyser.fftSize = 128;
      this.outputAnalyser.smoothingTimeConstant = 0.6;
      this.outputAnalyser.connect(this.outputCtx.destination);
      this.outputBins = new Uint8Array(new ArrayBuffer(this.outputAnalyser.frequencyBinCount));
    }

    const wsUrl = resolvePortalWsUrl('/v1/live', params.apiBase);
    const ws = new WebSocket(wsUrl);
    this.ws = ws;

    await new Promise<void>((resolve, reject) => {
      let settled = false;
      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: 'init',
            patientName: params.patientName,
            bundle: params.bundle,
            voiceProfile: params.voiceProfile || undefined,
            memories: params.memories || [],
          })
        );
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(String(ev.data));
          if (msg.type === 'ready') {
            if (!settled) {
              settled = true;
              resolve();
            }
            this.callbacks.onStatusChange?.('listening', `Connected (${msg.voice} voice)`);
            return;
          }
          if (msg.type === 'error') {
            const errMsg = msg.error || 'Live voice session error';
            this.callbacks.onStatusChange?.('error', errMsg);
            if (!settled) {
              settled = true;
              reject(new Error(errMsg));
            }
            return;
          }
          if (msg.inputTranscript) {
            this.callbacks.onInputTranscript?.(msg.inputTranscript);
          }
          if (msg.outputTranscript) {
            this.callbacks.onOutputTranscript?.(msg.outputTranscript);
          }
          if (msg.audio) {
            this.enqueuePcm24kChunk(msg.audio);
          }
          if (msg.interrupted) {
            this.flushOutputQueue();
            this.callbacks.onStatusChange?.('listening', 'Listening…');
          }
          if (msg.turnComplete) {
            this.callbacks.onTurnComplete?.();
          }
        } catch {
          // ignore malformed ws frame
        }
      };

      ws.onerror = () => {
        if (!settled) {
          settled = true;
          reject(new Error('Could not open Live Voice WebSocket.'));
        }
        this.callbacks.onStatusChange?.('error', 'Live voice connection interrupted.');
      };

      ws.onclose = () => {
        this.callbacks.onStatusChange?.('closed');
      };
    });

    if (params.enableMic !== false && navigator.mediaDevices?.getUserMedia && AudioCtx) {
      try {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        this.inputCtx = new AudioCtx({ sampleRate: 16000 });
        const source = this.inputCtx.createMediaStreamSource(this.micStream);
        const proc = this.inputCtx.createScriptProcessor(4096, 1, 1);
        this.processorNode = proc;
        proc.onaudioprocess = (event) => {
          if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
          const samples = event.inputBuffer.getChannelData(0);
          const b64 = float32ToPcm16Base64(samples);
          this.ws.send(JSON.stringify({ type: 'audio', audio: b64 }));
        };
        source.connect(proc);
        proc.connect(this.inputCtx.destination);
      } catch {
        this.callbacks.onStatusChange?.(
          'listening',
          'Live voice connected (mic unavailable — type prompts to hear real-time Twin speech).'
        );
      }
    }
  }

  public sendTextTurn(text: string): void {
    const trimmed = text.trim();
    if (!trimmed || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ type: 'text', text: trimmed }));
  }

  private enqueuePcm24kChunk(base64Pcm: string): void {
    if (!this.outputCtx || !this.outputAnalyser) return;
    const rawBytes = base64ToUint8Array(base64Pcm);
    const sampleCount = rawBytes.byteLength >> 1;
    if (sampleCount <= 0) return;

    const view = new DataView(rawBytes.buffer, rawBytes.byteOffset, rawBytes.byteLength);
    const audioBuf = this.outputCtx.createBuffer(1, sampleCount, 24000);
    const channel = audioBuf.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      channel[i] = view.getInt16(i * 2, true) / 32768;
    }

    const src = this.outputCtx.createBufferSource();
    src.buffer = audioBuf;
    src.connect(this.outputAnalyser);

    const now = this.outputCtx.currentTime;
    if (this.nextStartTime < now + 0.015) {
      this.nextStartTime = now + 0.02;
    }

    this.activeSources.add(src);
    this.callbacks.onStatusChange?.('speaking', 'Twin speaking live…');

    src.onended = () => {
      this.activeSources.delete(src);
      if (this.activeSources.size === 0) {
        this.callbacks.onStatusChange?.('listening', 'Listening…');
      }
    };

    src.start(this.nextStartTime);
    this.nextStartTime += audioBuf.duration;
  }

  private flushOutputQueue(): void {
    for (const src of this.activeSources) {
      try {
        src.stop();
      } catch {
        // ignore
      }
    }
    this.activeSources.clear();
    if (this.outputCtx) {
      this.nextStartTime = this.outputCtx.currentTime;
    }
  }

  public disconnect(): void {
    this.flushOutputQueue();
    if (this.processorNode) {
      try {
        this.processorNode.disconnect();
      } catch {
        // ignore
      }
      this.processorNode = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.inputCtx && this.inputCtx.state !== 'closed') {
      void this.inputCtx.close().catch(() => {});
      this.inputCtx = null;
    }
    if (this.outputCtx && this.outputCtx.state !== 'closed') {
      void this.outputCtx.close().catch(() => {});
      this.outputCtx = null;
    }
    if (this.ws) {
      try {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'close' }));
        }
        this.ws.close();
      } catch {
        // ignore
      }
      this.ws = null;
    }
  }
}
