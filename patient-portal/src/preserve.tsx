import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  computePreservationScore,
  createSampleVoiceWavBase64,
  type FaceLikenessData,
  type PreservedTurn,
  type VoicePersonaData,
} from './preserve-math';
import { PreserveAvatarStage } from './preserve-stage';
import type { PortalHostBridge } from './types';

const FACE_STORE_KEY = 'mx-preserve-face-v1';
const PHOTO_STORE_KEY = 'mx-preserve-photo-v1';
const PHOTO_COUNT_KEY = 'mx-preserve-photo-count-v1';
const VOICE_STORE_KEY = 'mx-preserve-voice-v1';
const MEMORIES_STORE_KEY = 'mx-preserve-memories-v1';
const TURNS_STORE_KEY = 'mx-preserve-turns-v1';
const WAITLIST_KEY = 'mx-preserve-interest';

const VITE_ASK_URL: string =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_ASK_URL) || '';

function resolveApiUrl(path: string, hostApiBase?: string): string {
  const base = (VITE_ASK_URL || hostApiBase || '').replace(/\/$/, '');
  return `${base}${path}`;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('Could not read file'));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(blob);
  });
}

function stripDataUrlPrefix(dataUrl: string): string {
  const idx = dataUrl.indexOf(',');
  return idx >= 0 ? dataUrl.slice(idx + 1) : dataUrl;
}

/**
 * Downscales large uploaded photos to max 512px JPEG so 3D texture loading and
 * localStorage persistence stay fast and well within browser storage limits.
 */
function resizeImageToDataUrl(fileOrBlob: Blob, maxDim = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objUrl = URL.createObjectURL(fileOrBlob);
    img.onload = () => {
      URL.revokeObjectURL(objUrl);
      const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
      const w = Math.max(64, Math.round(img.width * scale));
      const h = Math.max(64, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.86));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objUrl);
      reject(new Error('Invalid image file'));
    };
    img.src = objUrl;
  });
}

export function PreserveScreen({
  b,
  host,
}: {
  b: any;
  host: PortalHostBridge;
}) {
  const patientName: string = b?.patient?.preferred_name || 'Member';
  const preserveMeta = b?.preserve || {};
  const Hero = host.Hero;

  const [faceProfile, setFaceProfile] = useState<FaceLikenessData | null>(() =>
    host.readStore<FaceLikenessData | null>(FACE_STORE_KEY, null)
  );
  const [portraitDataUrl, setPortraitDataUrl] = useState<string | null>(() =>
    host.readStore<string | null>(PHOTO_STORE_KEY, null)
  );
  const [photoCount, setPhotoCount] = useState<number>(() =>
    host.readStore<number>(PHOTO_COUNT_KEY, 0)
  );
  const [voiceProfile, setVoiceProfile] = useState<VoicePersonaData | null>(() =>
    host.readStore<VoicePersonaData | null>(VOICE_STORE_KEY, null)
  );
  const [memories, setMemories] = useState<string[]>(() =>
    host.readStore<string[]>(MEMORIES_STORE_KEY, [
      `I value calm, clear thinking, long walks outdoors, and taking steady care of my family and long-term health.`,
    ])
  );
  const [turns, setTurns] = useState<PreservedTurn[]>(() =>
    host.readStore<PreservedTurn[]>(TURNS_STORE_KEY, [])
  );

  // Sync patient-scoped store when switching patients
  useEffect(() => {
    setFaceProfile(host.readStore<FaceLikenessData | null>(FACE_STORE_KEY, null));
    setPortraitDataUrl(host.readStore<string | null>(PHOTO_STORE_KEY, null));
    setPhotoCount(host.readStore<number>(PHOTO_COUNT_KEY, 0));
    setVoiceProfile(host.readStore<VoicePersonaData | null>(VOICE_STORE_KEY, null));
    setMemories(
      host.readStore<string[]>(MEMORIES_STORE_KEY, [
        `I value calm, clear thinking, long walks outdoors, and taking steady care of my family and long-term health.`,
      ])
    );
    setTurns(host.readStore<PreservedTurn[]>(TURNS_STORE_KEY, []));
  }, [b, host]);

  // Photo state
  const [faceBusy, setFaceBusy] = useState(false);
  const [faceError, setFaceError] = useState<string | null>(null);

  // Voice training state
  const [voiceBusy, setVoiceBusy] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [lastTranscript, setLastTranscript] = useState<string>('');
  const [voicePhrase, setVoicePhrase] = useState<string>(
    `Hi, I’m ${patientName}. When things get busy, I like to take a breath, look at the facts clearly, and take one steady step at a time.`
  );
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Conversation / TTS playback state
  const [speakInput, setSpeakInput] = useState('');
  const [speakBusy, setSpeakBusy] = useState(false);
  const [speakError, setSpeakError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Memories & Waitlist state
  const [newMemory, setNewMemory] = useState('');
  const [waitlistPicks, setWaitlistPicks] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(WAITLIST_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [waitlistSaved, setWaitlistSaved] = useState(false);

  // Web Audio lip-sync analyser refs
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const freqBinsRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const fallbackSpeakTimerRef = useRef<number>(0);

  useEffect(() => {
    setVoicePhrase(
      `Hi, I’m ${patientName}. When things get busy, I like to take a breath, look at the facts clearly, and take one steady step at a time.`
    );
  }, [patientName]);

  useEffect(() => {
    return () => {
      window.clearTimeout(fallbackSpeakTimerRef.current);
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        void audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const getAudioLevel = (): number => {
    const analyser = analyserRef.current;
    const bins = freqBinsRef.current;
    if (!analyser || !bins) return 0;
    analyser.getByteFrequencyData(bins);
    let sum = 0;
    const count = Math.min(36, bins.length);
    for (let i = 1; i < count; i++) {
      sum += bins[i];
    }
    return count > 1 ? sum / ((count - 1) * 255) : 0;
  };

  const playWavBase64WithLipSync = async (
    wavBase64: string | null,
    replyText: string
  ) => {
    window.clearTimeout(fallbackSpeakTimerRef.current);
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current = null;
    }

    const estDurationMs = Math.max(
      2600,
      Math.min(14000, replyText.split(/\s+/).length * 380)
    );

    if (!wavBase64) {
      setIsSpeaking(true);
      fallbackSpeakTimerRef.current = window.setTimeout(() => {
        setIsSpeaking(false);
      }, estDurationMs);
      return;
    }

    try {
      const audio = new Audio(`data:audio/wav;base64,${wavBase64}`);
      audioElRef.current = audio;

      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
          audioCtxRef.current = new AudioCtx();
        }
        if (audioCtxRef.current.state === 'suspended') {
          await audioCtxRef.current.resume().catch(() => {});
        }
        const sourceNode = audioCtxRef.current.createMediaElementSource(audio);
        const analyser = audioCtxRef.current.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.65;
        sourceNode.connect(analyser);
        analyser.connect(audioCtxRef.current.destination);
        analyserRef.current = analyser;
        freqBinsRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
      }

      audio.onended = () => {
        setIsSpeaking(false);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
      };

      setIsSpeaking(true);
      await audio.play();
    } catch {
      // If autoplay/audio hardware is restricted in headless browser, still animate speech duration
      setIsSpeaking(true);
      fallbackSpeakTimerRef.current = window.setTimeout(() => {
        setIsSpeaking(false);
      }, estDurationMs);
    }
  };

  const convergence = useMemo(
    () =>
      computePreservationScore({
        hasTwinRecord: Boolean(b?.patient),
        faceLikenessScore: faceProfile?.likeness_score ?? 0,
        voiceFidelityScore: voiceProfile?.fidelity_score ?? 0,
        memoriesCount: memories.length,
      }),
    [b, faceProfile, voiceProfile, memories.length]
  );

  // === Handlers: 1. Photo & 3D Face Likeness ===
  const processPortraitBlob = async (blob: Blob) => {
    setFaceBusy(true);
    setFaceError(null);
    try {
      const resizedDataUrl = await resizeImageToDataUrl(blob, 512);
      const nextCount = photoCount + 1;
      const resp = await fetch(
        resolveApiUrl('/v1/preserve/face-analyze', host.apiBase),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_base64: stripDataUrlPrefix(resizedDataUrl),
            mime_type: 'image/jpeg',
            photo_count: nextCount,
          }),
        }
      );
      if (!resp.ok) {
        throw new Error(`Face likeness analysis returned ${resp.status}`);
      }
      const data = (await resp.json()) as FaceLikenessData;
      setPortraitDataUrl(resizedDataUrl);
      setFaceProfile(data);
      setPhotoCount(nextCount);
      host.writeStore(PHOTO_STORE_KEY, resizedDataUrl);
      host.writeStore(FACE_STORE_KEY, data);
      host.writeStore(PHOTO_COUNT_KEY, nextCount);
    } catch (err: any) {
      setFaceError(err?.message || 'Could not analyze portrait photo right now.');
    } finally {
      setFaceBusy(false);
    }
  };

  const handleUseSamplePortrait = async () => {
    setFaceBusy(true);
    setFaceError(null);
    try {
      const resp = await fetch('./sample-portrait.jpg', { cache: 'no-store' });
      if (!resp.ok) throw new Error('Sample portrait asset not found');
      const blob = await resp.blob();
      await processPortraitBlob(blob);
    } catch (err: any) {
      setFaceBusy(false);
      setFaceError(err?.message || 'Could not load sample portrait.');
    }
  };

  // === Handlers: 2. AI Voice Persona Training ===
  const submitVoiceSample = async (
    audioBase64: string | undefined,
    mimeType: string | undefined,
    transcriptHint: string
  ) => {
    setVoiceBusy(true);
    setVoiceError(null);
    try {
      const nextSamples = (voiceProfile?.sample_count || 0) + 1;
      const resp = await fetch(
        resolveApiUrl('/v1/preserve/voice-train', host.apiBase),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audio_base64: audioBase64,
            mime_type: mimeType,
            transcript_hint: transcriptHint,
            patient_name: patientName,
            sample_count: nextSamples,
            existing_profile: voiceProfile || undefined,
          }),
        }
      );
      if (!resp.ok) {
        throw new Error(`Voice model training returned ${resp.status}`);
      }
      const data = (await resp.json()) as {
        transcript: string;
        profile: VoicePersonaData;
      };
      setLastTranscript(data.transcript || transcriptHint);
      setVoiceProfile(data.profile);
      host.writeStore(VOICE_STORE_KEY, data.profile);
    } catch (err: any) {
      setVoiceError(err?.message || 'Could not train voice persona right now.');
    } finally {
      setVoiceBusy(false);
    }
  };

  const handleToggleMicRecord = async () => {
    if (isRecordingMic && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecordingMic(false);
      return;
    }
    setVoiceError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceError(
        'Microphone access is unavailable in this browser. Upload an audio clip or use the sample voice clip.'
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          recordedChunksRef.current.push(ev.data);
        }
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const mime = recorder.mimeType || 'audio/webm';
        const blob = new Blob(recordedChunksRef.current, { type: mime });
        const dataUrl = await blobToDataUrl(blob);
        await submitVoiceSample(
          stripDataUrlPrefix(dataUrl),
          mime,
          voicePhrase
        );
      };
      recorder.start();
      setIsRecordingMic(true);
    } catch {
      setVoiceError(
        'Microphone permission was declined or unavailable. Try uploading audio or calibrating with the sample clip.'
      );
    }
  };

  const handleTrainSampleVoice = async () => {
    const wavB64 = createSampleVoiceWavBase64(0.85);
    await submitVoiceSample(wavB64, 'audio/wav', voicePhrase);
  };

  // === Handlers: 3. Talk With Your Preserved Self ===
  const handleSpeakPrompt = async (rawPrompt?: string) => {
    const promptText = (rawPrompt ?? speakInput).trim();
    if (!promptText || speakBusy) return;
    setSpeakInput('');
    setSpeakBusy(true);
    setSpeakError(null);

    try {
      const resp = await fetch(resolveApiUrl('/v1/preserve/speak', host.apiBase), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          patient_name: patientName,
          bundle: b,
          voice_profile: voiceProfile || undefined,
          memories,
        }),
      });
      if (!resp.ok) {
        throw new Error(`Preserved Twin speech returned ${resp.status}`);
      }
      const data = (await resp.json()) as {
        reply_text: string;
        audio_wav_base64: string | null;
        voice_used: string;
        style_used: string;
        updated_fidelity: number;
      };

      const newTurn: PreservedTurn = {
        id: `pt-${Date.now()}`,
        at: new Date().toISOString(),
        prompt: promptText,
        reply: data.reply_text,
        voiceUsed: data.voice_used,
        styleUsed: data.style_used,
        audioWavBase64: data.audio_wav_base64,
      };
      const updatedTurns = [newTurn, ...turns].slice(0, 8);
      setTurns(updatedTurns);
      host.writeStore(TURNS_STORE_KEY, updatedTurns);

      // Every conversation turn progressively refines the user's voice & persona fidelity!
      const baseVoice: VoicePersonaData = voiceProfile || {
        vocal_style: data.style_used || 'warm, calm, conversational',
        prebuilt_voice:
          (data.voice_used as VoicePersonaData['prebuilt_voice']) || 'Kore',
        cadence_wpm: 148,
        warmth: 84,
        clarity: 88,
        signature_phrases: ['take one steady step at a time'],
        sample_count: 0,
        fidelity_score: 48,
        summary: `Conversational voice persona calibrated from ${patientName}'s speech turns.`,
      };
      const nextVoice: VoicePersonaData = {
        ...baseVoice,
        sample_count: baseVoice.sample_count + 1,
        fidelity_score: Math.max(
          baseVoice.fidelity_score,
          data.updated_fidelity || baseVoice.fidelity_score + 5
        ),
      };
      setVoiceProfile(nextVoice);
      host.writeStore(VOICE_STORE_KEY, nextVoice);

      await playWavBase64WithLipSync(data.audio_wav_base64, data.reply_text);
    } catch (err: any) {
      setSpeakError(
        err?.message || 'Could not synthesize preserved speech right now.'
      );
    } finally {
      setSpeakBusy(false);
    }
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMemory.trim();
    if (!trimmed) return;
    const next = [trimmed, ...memories];
    setMemories(next);
    host.writeStore(MEMORIES_STORE_KEY, next);
    setNewMemory('');
  };

  const toggleWaitlistOption = (opt: string) => {
    setWaitlistPicks((prev) =>
      prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]
    );
    setWaitlistSaved(false);
  };

  const saveWaitlist = () => {
    try {
      localStorage.setItem(WAITLIST_KEY, JSON.stringify(waitlistPicks));
    } catch {
      // ignore storage quota errors
    }
    setWaitlistSaved(true);
  };

  const starterPrompts = [
    'How am I taking care of my health and energy these days?',
    'Share a calm reminder in my voice for a stressful week.',
    'What matters most to me as I look ahead?',
  ];

  return (
    <>
      {Hero ? (
        <Hero
          title="Preserve yourself"
          illus="preserve"
          sub="Train your AI voice model, project your portrait into 3D, and build a living likeness that speaks and looks like you."
        />
      ) : (
        <h1>Preserve yourself</h1>
      )}

      {/* 3D LIVING SELF STAGE + CONVERGENCE BREAKDOWN */}
      <section className="card mx-preserve-studio-card" aria-label="3D Preserved Self Studio">
        <div className="sec">
          <div>
            <span className="mx-eyebrow">Gemini Voice + Vision + Three.js 3D</span>
            <h2>{patientName}’s Living 3D Digital Self</h2>
          </div>
          <span className={`state ${convergence.totalPct >= 60 ? 'ok' : 'warn'}`}>
            <i />
            {convergence.totalPct}% converged
          </span>
        </div>

        <PreserveAvatarStage
          patientName={patientName}
          convergencePct={convergence.totalPct}
          stageLabel={convergence.stageLabel}
          faceProfile={faceProfile}
          portraitDataUrl={portraitDataUrl}
          isSpeaking={isSpeaking}
          cadenceWpm={voiceProfile?.cadence_wpm || 148}
          getAudioLevel={getAudioLevel}
        />

        <div className="mx-preserve-pillars">
          <div className="mx-pillar-tile on">
            <small>Biological Twin</small>
            <b>{convergence.twinBasePct}% / 25%</b>
            <span>Labs, organs &amp; health history active</span>
          </div>
          <div className={`mx-pillar-tile${faceProfile ? ' on' : ''}`}>
            <small>3D Face Likeness</small>
            <b>{convergence.facePct}% / 35%</b>
            <span>
              {faceProfile
                ? `${photoCount} photo${photoCount === 1 ? '' : 's'} · ${faceProfile.likeness_score}% match`
                : 'Add portrait photo to sculpt'}
            </span>
          </div>
          <div className={`mx-pillar-tile${voiceProfile ? ' on' : ''}`}>
            <small>AI Voice Persona</small>
            <b>{convergence.voicePct}% / 35%</b>
            <span>
              {voiceProfile
                ? `${voiceProfile.prebuilt_voice} · ${voiceProfile.fidelity_score}% fidelity`
                : 'Record or train voice model'}
            </span>
          </div>
          <div className={`mx-pillar-tile${memories.length > 0 ? ' on' : ''}`}>
            <small>Memories &amp; Values</small>
            <b>{convergence.memoriesBonusPct}% / 5%</b>
            <span>
              {memories.length} personal note{memories.length === 1 ? '' : 's'} stored
            </span>
          </div>
        </div>
      </section>

      {/* TWO-COLUMN TRAINING STUDIO: PHOTO 3D LIKENESS + AI VOICE MODEL */}
      <div className="grid2 mx-preserve-grid">
        {/* 1. PHOTO & 3D LIKENESS */}
        <section className="card mx-preserve-card">
          <div className="sec">
            <div>
              <span className="mx-eyebrow">Step 1 · Visual Likeness</span>
              <h3>3D Face &amp; Portrait Model</h3>
            </div>
            {faceProfile ? (
              <span className="state ok">
                <i />
                {faceProfile.likeness_score}% likeness
              </span>
            ) : null}
          </div>

          <p className="note">
            Upload a front-facing photo. Gemini Vision extracts your cranial proportions, skin/eye/hair palette, and projects your portrait onto the 3D mesh.
          </p>

          <div className="mx-preserve-photo-row">
            {portraitDataUrl ? (
              <img
                src={portraitDataUrl}
                alt={`${patientName} uploaded portrait`}
                className="mx-preserve-thumb"
              />
            ) : (
              <div className="mx-preserve-thumb placeholder" aria-hidden="true">
                3D
              </div>
            )}

            <div className="mx-preserve-photo-actions">
              <label className="secondary sm mx-file-btn">
                <span>{portraitDataUrl ? 'Add another photo' : 'Upload portrait photo'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={faceBusy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void processPortraitBlob(f);
                  }}
                />
              </label>

              <button
                type="button"
                className="link"
                disabled={faceBusy}
                onClick={() => void handleUseSamplePortrait()}
              >
                {faceBusy ? 'Analyzing likeness…' : 'Use sample portrait'}
              </button>
            </div>
          </div>

          {faceError && (
            <p className="note mx-err-note" role="alert">
              {faceError}
            </p>
          )}

          {faceProfile && (
            <div className="mx-likeness-meta">
              <p className="note">{faceProfile.likeness_summary}</p>
              <div className="mx-swatch-row">
                <span>
                  <i style={{ background: faceProfile.skin_tone_hex }} />
                  Skin
                </span>
                <span>
                  <i style={{ background: faceProfile.hair_color_hex }} />
                  Hair ({faceProfile.hair_style})
                </span>
                <span>
                  <i style={{ background: faceProfile.eye_color_hex }} />
                  Iris
                </span>
              </div>
            </div>
          )}
        </section>

        {/* 2. AI VOICE PERSONA TRAINER */}
        <section className="card mx-preserve-card">
          <div className="sec">
            <div>
              <span className="mx-eyebrow">Step 2 · Gemini Audio + TTS</span>
              <h3>AI Voice Model Trainer</h3>
            </div>
            {voiceProfile ? (
              <span className="state ok">
                <i />
                {voiceProfile.fidelity_score}% fidelity
              </span>
            ) : null}
          </div>

          <p className="note">
            Speak or upload a short clip. Gemini 3.5 Transcribe + Gemini 4 analyze your cadence, warmth, and phrasing so your twin talks like you.
          </p>

          <label className="feed-f">
            <span>Calibration passage (read aloud or customize)</span>
            <textarea
              rows={2}
              value={voicePhrase}
              onChange={(e) => setVoicePhrase(e.target.value)}
            />
          </label>

          <div className="mx-voice-btn-row">
            <button
              type="button"
              className={isRecordingMic ? 'primary sm' : 'secondary sm'}
              disabled={voiceBusy}
              onClick={() => void handleToggleMicRecord()}
            >
              {isRecordingMic ? '■ Stop & train' : '● Record voice'}
            </button>

            <label className="secondary sm mx-file-btn">
              <span>Upload audio</span>
              <input
                type="file"
                accept="audio/*"
                disabled={voiceBusy}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const dataUrl = await blobToDataUrl(f);
                  await submitVoiceSample(
                    stripDataUrlPrefix(dataUrl),
                    f.type || 'audio/wav',
                    voicePhrase
                  );
                }}
              />
            </label>

            <button
              type="button"
              className="link"
              disabled={voiceBusy}
              onClick={() => void handleTrainSampleVoice()}
            >
              {voiceBusy ? 'Training voice model…' : 'Calibrate with sample voice clip'}
            </button>
          </div>

          {voiceError && (
            <p className="note mx-err-note" role="alert">
              {voiceError}
            </p>
          )}

          {voiceProfile && (
            <div className="mx-voice-profile-box" data-testid="voice-profile-summary">
              <div className="mx-voice-stats">
                <span>
                  <small>Matched Timbre</small>
                  <b>{voiceProfile.prebuilt_voice}</b>
                </span>
                <span>
                  <small>Cadence</small>
                  <b>{voiceProfile.cadence_wpm} WPM</b>
                </span>
                <span>
                  <small>Warmth / Clarity</small>
                  <b>
                    {voiceProfile.warmth}% · {voiceProfile.clarity}%
                  </b>
                </span>
                <span>
                  <small>Voice Samples</small>
                  <b>{voiceProfile.sample_count}</b>
                </span>
              </div>
              <p className="note">
                <b>Learned style:</b> {voiceProfile.vocal_style}. {voiceProfile.summary}
              </p>
              {lastTranscript && (
                <p className="note">
                  <b>Latest transcript:</b> “{lastTranscript}”
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      {/* 3. TALK WITH YOUR PRESERVED SELF */}
      <section className="card mx-preserve-talk-card" aria-label="Talk with your preserved twin">
        <div className="sec">
          <div>
            <span className="mx-eyebrow">Step 3 · Live First-Person Synthesis</span>
            <h2>Speak with your preserved self</h2>
          </div>
          {isSpeaking ? (
            <span className="state ok">
              <i />
              Voice active
            </span>
          ) : null}
        </div>

        <p className="note">
          Ask your preserved twin anything. Each conversation refines your vocal persona and speaks back in first person with synchronized 3D lip movement.
        </p>

        <form
          className="ask-in mx-preserve-ask"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSpeakPrompt();
          }}
        >
          <input
            value={speakInput}
            onChange={(e) => setSpeakInput(e.target.value)}
            placeholder={`Say something to ${patientName}’s preserved twin…`}
            aria-label="Prompt your preserved twin"
          />
          <button
            type="submit"
            className="primary sm"
            disabled={!speakInput.trim() || speakBusy}
          >
            {speakBusy ? 'Synthesizing…' : 'Speak'}
          </button>
        </form>

        <div className="suggest">
          {starterPrompts.map((p) => (
            <button
              key={p}
              type="button"
              disabled={speakBusy}
              onClick={() => void handleSpeakPrompt(p)}
            >
              {p}
            </button>
          ))}
        </div>

        {speakError && (
          <p className="note mx-err-note" role="alert">
            {speakError}
          </p>
        )}

        {turns.length > 0 && (
          <div className="mx-preserve-turns">
            {turns.map((turn) => (
              <div key={turn.id} className="mx-preserve-turn">
                <div className="mx-preserve-turn-q">
                  <small>You asked</small>
                  <p>{turn.prompt}</p>
                </div>
                <div className="mx-preserve-turn-a">
                  <div className="sec">
                    <small>
                      {patientName}’s Preserved Twin · {turn.voiceUsed} ({turn.styleUsed})
                    </small>
                    <button
                      type="button"
                      className="link"
                      onClick={() =>
                        void playWavBase64WithLipSync(turn.audioWavBase64, turn.reply)
                      }
                    >
                      ▶ Replay voice
                    </button>
                  </div>
                  <p>“{turn.reply}”</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. PERSONAL MEMORIES & STORIES VAULT */}
      <section className="card mx-preserve-card">
        <div className="sec">
          <div>
            <span className="mx-eyebrow">Autobiographical Context</span>
            <h2>Memories, stories &amp; life principles</h2>
          </div>
          <span className="note">{memories.length} saved</span>
        </div>
        <p className="note">
          Add stories, lessons, or personal habits you want your preserved twin to carry forward.
        </p>

        <form className="ask-in" onSubmit={handleAddMemory}>
          <input
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            placeholder="e.g. Every Sunday morning I call my parents after a walk…"
            aria-label="Add a personal memory or principle"
          />
          <button type="submit" className="secondary sm" disabled={!newMemory.trim()}>
            Save memory
          </button>
        </form>

        <ul className="rs-rows">
          {memories.map((mem, idx) => (
            <li key={`${idx}-${mem.slice(0, 18)}`}>
              <span>
                <b>Memory #{memories.length - idx}</b>
                <small>{mem}</small>
              </span>
              <button
                type="button"
                className="link"
                aria-label={`Remove memory ${memories.length - idx}`}
                onClick={() => {
                  const next = memories.filter((_, i) => i !== idx);
                  setMemories(next);
                  host.writeStore(MEMORIES_STORE_KEY, next);
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. PRESERVATION CONSENT & ARCHIVE PREFERENCES */}
      {Array.isArray(preserveMeta.options) && preserveMeta.options.length > 0 && (
        <section className="card mx-preserve-card">
          <h2>Long-term preservation preferences</h2>
          <p className="note">
            Choose which layers of your preserved profile remain active on this device or enrolled for clinical biobanking updates.
          </p>
          <div className="pcards">
            {preserveMeta.options.map((opt: string) => (
              <label key={opt}>
                <input
                  type="checkbox"
                  checked={waitlistPicks.includes(opt)}
                  onChange={() => toggleWaitlistOption(opt)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
          <button
            type="button"
            className="primary"
            disabled={!waitlistPicks.length}
            onClick={saveWaitlist}
          >
            Save preservation preferences
          </button>
          {waitlistSaved && (
            <p className="note" role="status">
              Saved preferences for: {waitlistPicks.join(', ')}. Stored locally under your control.
            </p>
          )}
        </section>
      )}
    </>
  );
}
