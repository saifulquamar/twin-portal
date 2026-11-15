import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchEncryptedVault,
  purgeEncryptedVault,
  saveEncryptedVault,
} from './auth-context';
import { BackButton } from './back-button';
import {
  computePreservationScore,
  createSampleVoiceWavBase64,
  inferRegisterFromPitchHz,
  nominalPitchForRegister,
  nominalWpmForPace,
  SPEAKING_PACE_LABELS,
  VOCAL_REGISTER_LABELS,
  VOICE_ACCENT_LABELS,
  type AudioQualityReport,
  type FaceLikenessData,
  type FormantBandProfile,
  type PreservedTurn,
  type SpeakingPace,
  type VocalRegister,
  type VoiceAccent,
  type VoicePersonaData,
} from './preserve-math';
import { PreserveAvatarStage } from './preserve-stage';
import type {
  FeedEntry,
  IdentityMemoryItem,
  MemoryCategory,
  PortalHostBridge,
  VoiceClipMeta,
  VoiceConsentData,
} from './types';
import {
  analyzeBlobAcoustics,
  playMatchedVoiceReply,
  requestMatchedVoiceSynthesis,
  resolvePortalApiUrl,
  SHARED_VOICE_CLIPS_KEY,
  SHARED_VOICE_CONSENT_KEY,
  SHARED_VOICE_STORE_KEY,
  stopActiveVoicePlayback,
  trainAndTranscribeUserVoice,
  VOICE_UPDATED_EVENT,
} from './voice-engine';

export const FACE_STORE_KEY = 'mx-preserve-face-v1';
export const PHOTO_STORE_KEY = 'mx-preserve-photo-v1';
export const PHOTO_ANGLES_STORE_KEY = 'mx-preserve-photo-angles-v1';
export const PHOTO_COUNT_KEY = 'mx-preserve-photo-count-v1';
export const MEMORIES_STORE_KEY = 'mx-preserve-memories-v1';
export const MEMORY_ITEMS_STORE_KEY = 'mx-preserve-memory-items-v1';
export const TURNS_STORE_KEY = 'mx-preserve-turns-v1';

type StudioTab = 'appearance' | 'voice' | 'memory';
type PhotoAngleSlot = 'front' | 'threeQuarter' | 'profile';

const MEMORY_CATEGORIES: Array<[MemoryCategory, string]> = [
  ['life_story', 'Life story'],
  ['values', 'Values'],
  ['habits', 'Daily routine'],
  ['communication_style', 'How I speak'],
  ['milestone', 'Milestone'],
];

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
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objUrl);
      reject(new Error('Invalid image file'));
    };
    img.src = objUrl;
  });
}

function normalizeMemoryItems(
  storedItems: IdentityMemoryItem[] | null,
  legacyStrings: string[]
): IdentityMemoryItem[] {
  if (Array.isArray(storedItems) && storedItems.length > 0) {
    return storedItems;
  }
  return legacyStrings.map((txt, idx) => ({
    id: `mem-seed-${idx}`,
    at: new Date().toISOString(),
    category: idx === 0 ? 'values' : 'life_story',
    text: txt,
    source: 'written',
  }));
}

export function PreserveScreen({
  b,
  host,
}: {
  b: any;
  host: PortalHostBridge;
}) {
  const patientId = host.getPatientId();
  const patientName: string = b?.patient?.preferred_name || 'Member';
  const defaultReg: VocalRegister = b?.patient?.sex === 'male' ? 'warm_mid' : 'clear_mid';

  const [activeTab, setActiveTab] = useState<StudioTab>('appearance');

  // Step 1: Visual Identity state
  const [faceProfile, setFaceProfile] = useState<FaceLikenessData | null>(() =>
    host.readStore<FaceLikenessData | null>(FACE_STORE_KEY, null)
  );
  const [portraitDataUrl, setPortraitDataUrl] = useState<string | null>(() =>
    host.readStore<string | null>(PHOTO_STORE_KEY, null)
  );
  const [photoAngles, setPhotoAngles] = useState<Partial<Record<PhotoAngleSlot, string>>>(() =>
    host.readStore<Partial<Record<PhotoAngleSlot, string>>>(PHOTO_ANGLES_STORE_KEY, {})
  );
  const [photoCount, setPhotoCount] = useState<number>(() =>
    host.readStore<number>(PHOTO_COUNT_KEY, 0)
  );
  const [faceBusyStage, setFaceBusyStage] = useState<string | null>(null);
  const [faceError, setFaceError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Step 2: Voice Identity & Calibration state
  const [voiceProfile, setVoiceProfile] = useState<VoicePersonaData | null>(() =>
    host.readStore<VoicePersonaData | null>(SHARED_VOICE_STORE_KEY, null)
  );
  const [vocalRegister, setVocalRegister] = useState<VocalRegister>(
    () => voiceProfile?.vocal_register || defaultReg
  );
  const [voiceAccent, setVoiceAccent] = useState<VoiceAccent>(
    () => (voiceProfile?.accent as VoiceAccent) || 'neutral'
  );
  const [speakingPace, setSpeakingPace] = useState<SpeakingPace>(
    () => voiceProfile?.speaking_pace || 'natural'
  );
  const [voiceConsent, setVoiceConsent] = useState<VoiceConsentData>(() =>
    host.readStore<VoiceConsentData>(SHARED_VOICE_CONSENT_KEY, {
      consented: true,
      consentedAt: new Date().toISOString(),
      allowConversationalRefinement: true,
      encryptedAtRest: true,
    })
  );
  const [voiceClips, setVoiceClips] = useState<VoiceClipMeta[]>(() =>
    host.readStore<VoiceClipMeta[]>(SHARED_VOICE_CLIPS_KEY, [])
  );
  const [lastQuality, setLastQuality] = useState<AudioQualityReport | null>(null);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [lastTranscript, setLastTranscript] = useState<string>('');
  const [passageIdx, setPassageIdx] = useState(0);

  const calibrationPassages = useMemo(
    () => [
      {
        label: 'Sample 1 · Warmth',
        text: `Hi, I’m ${patientName}. When life gets busy, I take a breath, look at the facts clearly, and take one steady step at a time.`,
      },
      {
        label: 'Sample 2 · Inflection',
        text: `How am I doing overall right now, and what small daily habits are making the biggest difference for my energy and sleep?`,
      },
      {
        label: 'Sample 3 · Cadence',
        text: `A quiet morning walk, restful sleep, and honest conversations with the people I love always help me feel grounded.`,
      },
    ],
    [patientName]
  );

  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const [abSynthesizedWav, setAbSynthesizedWav] = useState<string | null>(null);
  const [abBusy, setAbBusy] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Step 3: Personal Identity & Memory Vault state
  const [memoryItems, setMemoryItems] = useState<IdentityMemoryItem[]>(() => {
    const legacy = host.readStore<string[]>(MEMORIES_STORE_KEY, [
      `I value calm, clear thinking, long walks outdoors, and taking steady care of my family and long-term health.`,
    ]);
    const rich = host.readStore<IdentityMemoryItem[] | null>(MEMORY_ITEMS_STORE_KEY, null);
    return normalizeMemoryItems(rich, legacy);
  });
  const [newMemoryCategory, setNewMemoryCategory] = useState<MemoryCategory>('life_story');
  const [newMemoryText, setNewMemoryText] = useState('');
  const [isRecordingMemory, setIsRecordingMemory] = useState(false);
  const memoryRecRef = useRef<MediaRecorder | null>(null);
  const memoryChunksRef = useRef<Blob[]>([]);

  const feedDiaryEntries = useMemo(() => {
    const allFeed = host.readStore<FeedEntry[]>('mx-feed', []);
    return allFeed.filter((e) => e.category === 'personal_diary' || e.kind === 'diary');
  }, [b, host, memoryItems.length]);

  // Voice-Only Preserved Twin Preview state (NO text chat box!)
  const [turns, setTurns] = useState<PreservedTurn[]>(() =>
    host.readStore<PreservedTurn[]>(TURNS_STORE_KEY, [])
  );
  const [speakBusy, setSpeakBusy] = useState(false);
  const [isListeningPreview, setIsListeningPreview] = useState(false);
  const [speakError, setSpeakError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const previewRecRef = useRef<MediaRecorder | null>(null);
  const previewChunksRef = useRef<Blob[]>([]);
  const liveAudioLevelRef = useRef<number>(0);

  // Sync patient-scoped store + encrypted server vault when switching patients
  useEffect(() => {
    const localFace = host.readStore<FaceLikenessData | null>(FACE_STORE_KEY, null);
    const localPhoto = host.readStore<string | null>(PHOTO_STORE_KEY, null);
    const localAngles = host.readStore<Partial<Record<PhotoAngleSlot, string>>>(
      PHOTO_ANGLES_STORE_KEY,
      {}
    );
    const localCount = host.readStore<number>(PHOTO_COUNT_KEY, 0);
    const localVoice = host.readStore<VoicePersonaData | null>(SHARED_VOICE_STORE_KEY, null);
    const localConsent = host.readStore<VoiceConsentData>(SHARED_VOICE_CONSENT_KEY, {
      consented: true,
      consentedAt: new Date().toISOString(),
      allowConversationalRefinement: true,
      encryptedAtRest: true,
    });
    const localClips = host.readStore<VoiceClipMeta[]>(SHARED_VOICE_CLIPS_KEY, []);
    const legacyMems = host.readStore<string[]>(MEMORIES_STORE_KEY, [
      `I value calm, clear thinking, long walks outdoors, and taking steady care of my family and long-term health.`,
    ]);
    const richMems = host.readStore<IdentityMemoryItem[] | null>(MEMORY_ITEMS_STORE_KEY, null);

    setFaceProfile(localFace);
    setPortraitDataUrl(localPhoto);
    setPhotoAngles(localAngles);
    setPhotoCount(localCount);
    setVoiceProfile(localVoice);
    setVocalRegister(localVoice?.vocal_register || defaultReg);
    setVoiceAccent((localVoice?.accent as VoiceAccent) || 'neutral');
    setSpeakingPace(localVoice?.speaking_pace || 'natural');
    setVoiceConsent(localConsent);
    setVoiceClips(localClips);
    setMemoryItems(normalizeMemoryItems(richMems, legacyMems));
    setTurns(host.readStore<PreservedTurn[]>(TURNS_STORE_KEY, []));
    setAbSynthesizedWav(null);
    setVoiceNotice(null);
    setVoiceError(null);

    let cancelled = false;
    fetchEncryptedVault(patientId, host.apiBase).then((vault) => {
      if (cancelled || !vault) return;
      if (vault.faceProfile && !localFace) {
        setFaceProfile(vault.faceProfile);
        host.writeStore(FACE_STORE_KEY, vault.faceProfile);
      }
      if (vault.portraitDataUrl && !localPhoto) {
        setPortraitDataUrl(vault.portraitDataUrl);
        host.writeStore(PHOTO_STORE_KEY, vault.portraitDataUrl);
      }
      if (vault.voiceProfile && !localVoice) {
        setVoiceProfile(vault.voiceProfile);
        if (vault.voiceProfile.vocal_register) setVocalRegister(vault.voiceProfile.vocal_register);
        if (vault.voiceProfile.accent) setVoiceAccent(vault.voiceProfile.accent as VoiceAccent);
        if (vault.voiceProfile.speaking_pace) setSpeakingPace(vault.voiceProfile.speaking_pace);
        host.writeStore(SHARED_VOICE_STORE_KEY, vault.voiceProfile);
      }
      if (Array.isArray(vault.memories) && vault.memories.length > 0 && !richMems) {
        setMemoryItems(vault.memories);
        host.writeStore(MEMORY_ITEMS_STORE_KEY, vault.memories);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [patientId, b, host, defaultReg]);

  useEffect(() => {
    return () => {
      stopActiveVoicePlayback();
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const syncToServerVault = async (patch: Record<string, unknown>) => {
    await saveEncryptedVault(patientId, patch, host.apiBase);
  };

  const memoryStrings = useMemo(
    () => [
      ...memoryItems.map((m) => m.text),
      ...feedDiaryEntries.map((d) => `${d.title}: ${d.detail}`),
    ],
    [memoryItems, feedDiaryEntries]
  );

  const convergence = useMemo(
    () =>
      computePreservationScore({
        hasTwinRecord: Boolean(b?.patient),
        faceLikenessScore: faceProfile?.likeness_score ?? 0,
        voiceFidelityScore: voiceProfile?.fidelity_score ?? 0,
        memoriesCount: memoryItems.length + feedDiaryEntries.length,
      }),
    [b, faceProfile, voiceProfile, memoryItems.length, feedDiaryEntries.length]
  );

  const playWavWithAvatarLipSync = async (
    wavBase64: string | null,
    spokenText: string,
    overrideProfile?: VoicePersonaData | null
  ) => {
    await playMatchedVoiceReply(wavBase64, spokenText, overrideProfile ?? voiceProfile, {
      onStart: () => setIsSpeaking(true),
      onLevel: (lvl) => {
        liveAudioLevelRef.current = lvl;
      },
      onEnd: () => {
        liveAudioLevelRef.current = 0;
        setIsSpeaking(false);
      },
    });
  };

  // === STEP 1 HANDLERS: APPEARANCE & 3D LIKENESS ===
  const processPortraitBlob = async (blob: Blob, slot: PhotoAngleSlot = 'front') => {
    setFaceError(null);
    setFaceBusyStage('Analyzing facial proportions…');
    try {
      const resizedDataUrl = await resizeImageToDataUrl(blob, 512);
      const nextAngles = { ...photoAngles, [slot]: resizedDataUrl };
      const nextCount = Math.max(Object.keys(nextAngles).length, photoCount + 1);

      const resp = await fetch(
        resolvePortalApiUrl('/v1/preserve/face-analyze', host.apiBase),
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
        throw new Error(`Face analysis returned HTTP ${resp.status}`);
      }
      setFaceBusyStage('Applying likeness to 3D Twin…');
      const data = (await resp.json()) as FaceLikenessData;

      const primaryPortrait = slot === 'front' || !portraitDataUrl ? resizedDataUrl : portraitDataUrl;
      setPortraitDataUrl(primaryPortrait);
      setPhotoAngles(nextAngles);
      setFaceProfile(data);
      setPhotoCount(nextCount);

      host.writeStore(PHOTO_STORE_KEY, primaryPortrait);
      host.writeStore(PHOTO_ANGLES_STORE_KEY, nextAngles);
      host.writeStore(FACE_STORE_KEY, data);
      host.writeStore(PHOTO_COUNT_KEY, nextCount);

      void syncToServerVault({
        faceProfile: data,
        portraitDataUrl: primaryPortrait,
        photoAngles: Object.values(nextAngles).filter(Boolean),
      });
    } catch (err: any) {
      setFaceError(err?.message || 'Could not process portrait photo.');
    } finally {
      setFaceBusyStage(null);
    }
  };

  const handleUseSamplePortrait = async () => {
    setFaceError(null);
    setFaceBusyStage('Loading portrait…');
    try {
      const resp = await fetch('./sample-portrait.jpg', { cache: 'no-store' });
      if (!resp.ok) throw new Error('Sample portrait not found');
      const blob = await resp.blob();
      await processPortraitBlob(blob, 'front');
    } catch (err: any) {
      setFaceBusyStage(null);
      setFaceError(err?.message || 'Could not load sample portrait.');
    }
  };

  const handleStartCamera = async () => {
    setFaceError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setFaceError('Camera unavailable in this browser — upload a photo instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
      });
      cameraStreamRef.current = stream;
      setCameraOpen(true);
      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => {});
        }
      }, 60);
    } catch {
      setFaceError('Camera permission declined. Upload a photo instead.');
    }
  };

  const handleSnapCameraPhoto = async () => {
    const vid = videoRef.current;
    if (!vid) return;
    const canvas = document.createElement('canvas');
    canvas.width = vid.videoWidth || 512;
    canvas.height = vid.videoHeight || 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
    cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
    cameraStreamRef.current = null;
    setCameraOpen(false);
    canvas.toBlob(
      (blob) => {
        if (blob) void processPortraitBlob(blob, 'front');
      },
      'image/jpeg',
      0.9
    );
  };

  const updateFaceField = <K extends keyof FaceLikenessData>(key: K, val: FaceLikenessData[K]) => {
    if (!faceProfile) return;
    const next = { ...faceProfile, [key]: val };
    setFaceProfile(next);
    host.writeStore(FACE_STORE_KEY, next);
    void syncToServerVault({ faceProfile: next });
  };

  const handleClearAppearance = () => {
    setFaceProfile(null);
    setPortraitDataUrl(null);
    setPhotoAngles({});
    setPhotoCount(0);
    host.writeStore(FACE_STORE_KEY, null);
    host.writeStore(PHOTO_STORE_KEY, null);
    host.writeStore(PHOTO_ANGLES_STORE_KEY, {});
    host.writeStore(PHOTO_COUNT_KEY, 0);
  };

  // === STEP 2 HANDLERS: ACCURATE VOICE CALIBRATION ===
  const applyVoiceTraitChange = (patch: {
    vocal_register?: VocalRegister;
    accent?: VoiceAccent;
    speaking_pace?: SpeakingPace;
  }) => {
    const nextReg = patch.vocal_register ?? vocalRegister;
    const nextAcc = patch.accent ?? voiceAccent;
    const nextPace = patch.speaking_pace ?? speakingPace;
    if (patch.vocal_register) setVocalRegister(patch.vocal_register);
    if (patch.accent) setVoiceAccent(patch.accent);
    if (patch.speaking_pace) setSpeakingPace(patch.speaking_pace);

    if (voiceProfile) {
      const updated: VoicePersonaData = {
        ...voiceProfile,
        vocal_register: nextReg,
        accent: nextAcc,
        speaking_pace: nextPace,
        cadence_wpm: patch.speaking_pace ? nominalWpmForPace(nextPace) : voiceProfile.cadence_wpm,
        pitch_hz: patch.vocal_register ? nominalPitchForRegister(nextReg) : voiceProfile.pitch_hz,
      };
      setVoiceProfile(updated);
      setAbSynthesizedWav(null);
      host.writeStore(SHARED_VOICE_STORE_KEY, updated);
      window.dispatchEvent(new Event(VOICE_UPDATED_EVENT));
      void syncToServerVault({ voiceProfile: updated });
    }
  };

  const updateConsent = (patch: Partial<VoiceConsentData>) => {
    const next: VoiceConsentData = {
      ...voiceConsent,
      ...patch,
      consentedAt:
        patch.consented === true
          ? new Date().toISOString()
          : patch.consented === false
            ? null
            : voiceConsent.consentedAt,
    };
    setVoiceConsent(next);
    host.writeStore(SHARED_VOICE_CONSENT_KEY, next);
    void syncToServerVault({ voiceConsent: next });
  };

  const submitRealAudioVoiceSample = async (params: {
    audioBase64: string;
    audioDataUrl: string;
    mimeType: string;
    sourceType: 'recorded_audio' | 'uploaded_audio';
    transcriptHint: string;
    pitchHz: number | null;
    pitchRangeHz: number | null;
    brightness: number;
    cadenceWpm: number;
    formantBands: FormantBandProfile;
    quality: AudioQualityReport;
  }) => {
    if (!voiceConsent.consented) {
      setVoiceError('Enable voice consent below before calibrating your voice.');
      return;
    }
    setVoiceBusy(true);
    setVoiceError(null);
    setVoiceNotice(null);
    setLastQuality(params.quality);
    try {
      const detectedReg = params.pitchHz ? inferRegisterFromPitchHz(params.pitchHz) : vocalRegister;
      if (params.pitchHz) {
        setVocalRegister(detectedReg);
      }

      const data = await trainAndTranscribeUserVoice({
        audioBase64: params.audioBase64,
        mimeType: params.mimeType,
        sourceType: params.sourceType,
        consentVerified: true,
        transcriptHint: params.transcriptHint,
        patientName,
        measuredPitchHz: params.pitchHz ?? nominalPitchForRegister(vocalRegister),
        measuredPitchRangeHz: params.pitchRangeHz,
        measuredBrightness: params.brightness,
        measuredWpm: params.cadenceWpm,
        formantBands: params.formantBands,
        vocalRegister: detectedReg,
        accent: voiceAccent,
        speakingPace,
        passageIndex: passageIdx,
        existingProfile: voiceProfile,
        apiBase: host.apiBase,
      });

      const clipMeta: VoiceClipMeta = {
        id: `vc-${Date.now()}`,
        at: new Date().toISOString(),
        sourceType: params.sourceType,
        durationSec: params.quality.durationSec,
        snrDb: params.quality.snrDb,
        pitchHz: data.profile.pitch_hz ?? params.pitchHz,
        transcript: data.transcript || params.transcriptHint,
        audioDataUrl: params.audioDataUrl.length < 480_000 ? params.audioDataUrl : undefined,
      };
      const nextClips = [clipMeta, ...voiceClips].slice(0, 6);

      setLastTranscript(data.transcript || params.transcriptHint);
      setVoiceProfile(data.profile);
      setVoiceClips(nextClips);
      setAbSynthesizedWav(null);

      // Advance to next unrecorded passage automatically
      if (passageIdx < calibrationPassages.length - 1) {
        setPassageIdx(passageIdx + 1);
      }

      host.writeStore(SHARED_VOICE_STORE_KEY, data.profile);
      host.writeStore(SHARED_VOICE_CLIPS_KEY, nextClips);
      window.dispatchEvent(new Event(VOICE_UPDATED_EVENT));

      void syncToServerVault({
        voiceProfile: data.profile,
        voiceConsent,
        voiceClips: nextClips.map(({ audioDataUrl: _omit, ...rest }) => rest),
      });
      setVoiceNotice(
        `Calibrated · ${data.profile.pitch_hz || 175} Hz · ${data.profile.fidelity_score}% match`
      );
    } catch (err: any) {
      setVoiceError(err?.message || 'Could not process voice sample.');
    } finally {
      setVoiceBusy(false);
    }
  };

  const currentPassage = calibrationPassages[passageIdx] || calibrationPassages[0];

  const handleToggleMicRecord = async () => {
    if (isRecordingMic && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecordingMic(false);
      return;
    }
    if (!voiceConsent.consented) {
      setVoiceError('Enable voice consent before recording.');
      return;
    }
    setVoiceError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceError('Microphone unavailable in this browser — upload an audio clip instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) recordedChunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const mime = recorder.mimeType || 'audio/webm';
        const blob = new Blob(recordedChunksRef.current, { type: mime });
        const [dataUrl, acoustics] = await Promise.all([
          blobToDataUrl(blob),
          analyzeBlobAcoustics(blob),
        ]);
        await submitRealAudioVoiceSample({
          audioBase64: stripDataUrlPrefix(dataUrl),
          audioDataUrl: dataUrl,
          mimeType: mime,
          sourceType: 'recorded_audio',
          transcriptHint: currentPassage.text,
          pitchHz: acoustics.pitchHz,
          pitchRangeHz: acoustics.pitchRangeHz,
          brightness: acoustics.brightness,
          cadenceWpm: acoustics.cadenceWpm,
          formantBands: acoustics.formantBands,
          quality: acoustics.quality,
        });
      };
      recorder.start();
      setIsRecordingMic(true);
    } catch {
      setVoiceError('Microphone permission declined. Upload an audio clip instead.');
    }
  };

  const handleUploadAudioFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files).slice(0, 3)) {
      const [dataUrl, acoustics] = await Promise.all([
        blobToDataUrl(file),
        analyzeBlobAcoustics(file),
      ]);
      await submitRealAudioVoiceSample({
        audioBase64: stripDataUrlPrefix(dataUrl),
        audioDataUrl: dataUrl,
        mimeType: file.type || 'audio/wav',
        sourceType: 'uploaded_audio',
        transcriptHint: currentPassage.text,
        pitchHz: acoustics.pitchHz,
        pitchRangeHz: acoustics.pitchRangeHz,
        brightness: acoustics.brightness,
        cadenceWpm: acoustics.cadenceWpm,
        formantBands: acoustics.formantBands,
        quality: acoustics.quality,
      });
    }
  };

  const handleQuickCalibrateFromTraits = async () => {
    const targetHz = nominalPitchForRegister(vocalRegister);
    const targetWpm = nominalWpmForPace(speakingPace);
    const wavB64 = createSampleVoiceWavBase64(1.05, targetHz);
    const dataUrl = `data:audio/wav;base64,${wavB64}`;
    await submitRealAudioVoiceSample({
      audioBase64: wavB64,
      audioDataUrl: dataUrl,
      mimeType: 'audio/wav',
      sourceType: 'recorded_audio',
      transcriptHint: currentPassage.text,
      pitchHz: targetHz,
      pitchRangeHz: 24,
      brightness: vocalRegister === 'bright_high' ? 72 : vocalRegister === 'deep' ? 46 : 60,
      cadenceWpm: targetWpm,
      formantBands: {
        low: vocalRegister === 'deep' ? 78 : 64,
        mid: 70,
        presence: 68,
        air: vocalRegister === 'bright_high' ? 66 : 52,
      },
      quality: {
        durationSec: 1.05,
        rms: 0.19,
        snrDb: 28,
        clipping: false,
        qualityLabel: 'Studio Clear',
      },
    });
  };

  const handlePlayTwinAbSample = async () => {
    if (!voiceProfile) return;
    const textToSpeak = lastTranscript || currentPassage.text;
    if (abSynthesizedWav) {
      await playWavWithAvatarLipSync(abSynthesizedWav, textToSpeak);
      return;
    }
    setAbBusy(true);
    setVoiceError(null);
    try {
      const synth = await requestMatchedVoiceSynthesis({
        text: textToSpeak,
        voiceProfile,
        patientSex: b?.patient?.sex,
        apiBase: host.apiBase,
      });
      setAbSynthesizedWav(synth.audio_wav_base64);
      await playWavWithAvatarLipSync(synth.audio_wav_base64, textToSpeak);
    } catch (err: any) {
      setVoiceError(err?.message || 'Could not synthesize voice preview.');
    } finally {
      setAbBusy(false);
    }
  };

  const handleRevokeAndPurgeVoice = async () => {
    stopActiveVoicePlayback();
    setVoiceProfile(null);
    setVoiceClips([]);
    setLastQuality(null);
    setLastTranscript('');
    setAbSynthesizedWav(null);
    const revokedConsent: VoiceConsentData = {
      consented: false,
      consentedAt: null,
      allowConversationalRefinement: false,
      encryptedAtRest: true,
    };
    setVoiceConsent(revokedConsent);
    host.writeStore(SHARED_VOICE_STORE_KEY, null);
    host.writeStore(SHARED_VOICE_CLIPS_KEY, []);
    host.writeStore(SHARED_VOICE_CONSENT_KEY, revokedConsent);
    window.dispatchEvent(new Event(VOICE_UPDATED_EVENT));
    await purgeEncryptedVault(patientId, 'voice', host.apiBase);
    setVoiceNotice('Voice recordings and voice model deleted.');
  };

  // === STEP 3 HANDLERS: MEMORY VAULT ===
  const persistMemories = (nextItems: IdentityMemoryItem[]) => {
    setMemoryItems(nextItems);
    host.writeStore(MEMORY_ITEMS_STORE_KEY, nextItems);
    host.writeStore(
      MEMORIES_STORE_KEY,
      nextItems.map((m) => m.text)
    );
    void syncToServerVault({ memories: nextItems });
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMemoryText.trim();
    if (!trimmed) return;
    const item: IdentityMemoryItem = {
      id: `mem-${Date.now()}`,
      at: new Date().toISOString(),
      category: newMemoryCategory,
      text: trimmed,
      source: 'written',
    };
    persistMemories([item, ...memoryItems]);
    setNewMemoryText('');
  };

  const handleToggleMemoryVoice = async () => {
    if (isRecordingMemory && memoryRecRef.current) {
      memoryRecRef.current.stop();
      setIsRecordingMemory(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      memoryChunksRef.current = [];
      const rec = new MediaRecorder(stream);
      memoryRecRef.current = rec;
      rec.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) memoryChunksRef.current.push(ev.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const mime = rec.mimeType || 'audio/webm';
        const blob = new Blob(memoryChunksRef.current, { type: mime });
        const [dataUrl, acoustics] = await Promise.all([
          blobToDataUrl(blob),
          analyzeBlobAcoustics(blob),
        ]);
        const shouldRefine = voiceConsent.consented && voiceConsent.allowConversationalRefinement;
        const trained = await trainAndTranscribeUserVoice({
          audioBase64: stripDataUrlPrefix(dataUrl),
          mimeType: mime,
          sourceType: shouldRefine ? 'conversation_audio' : 'text_only',
          consentVerified: shouldRefine,
          measuredPitchHz: acoustics.pitchHz,
          measuredPitchRangeHz: acoustics.pitchRangeHz,
          measuredBrightness: acoustics.brightness,
          measuredWpm: acoustics.cadenceWpm,
          formantBands: acoustics.formantBands,
          vocalRegister,
          accent: voiceAccent,
          speakingPace,
          transcriptHint: newMemoryText.trim() || 'A personal memory for my digital twin.',
          patientName,
          existingProfile: voiceProfile,
          apiBase: host.apiBase,
        });
        if (shouldRefine && trained.used_real_audio) {
          setVoiceProfile(trained.profile);
          host.writeStore(SHARED_VOICE_STORE_KEY, trained.profile);
          window.dispatchEvent(new Event(VOICE_UPDATED_EVENT));
        }
        const spokenText = trained.transcript?.trim();
        if (spokenText) {
          persistMemories([
            {
              id: `mem-${Date.now()}`,
              at: new Date().toISOString(),
              category: newMemoryCategory,
              text: spokenText,
              source: 'spoken',
            },
            ...memoryItems,
          ]);
          setNewMemoryText('');
        }
      };
      rec.start();
      setIsRecordingMemory(true);
    } catch {
      // ignore
    }
  };

  // === VOICE-ONLY SPEAK PREVIEW WITH YOUR PRESERVED TWIN ===
  const handleSpeakPrompt = async (
    rawPrompt: string,
    profileOverride?: VoicePersonaData | null
  ) => {
    const promptText = rawPrompt.trim();
    if (!promptText || speakBusy) return;
    setSpeakBusy(true);
    setSpeakError(null);

    const activeVoice = profileOverride ?? voiceProfile;

    try {
      const resp = await fetch(resolvePortalApiUrl('/v1/preserve/speak', host.apiBase), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          patient_name: patientName,
          bundle: b,
          voice_profile: activeVoice || undefined,
          memories: memoryStrings,
        }),
      });
      if (!resp.ok) {
        throw new Error(`Speech returned HTTP ${resp.status}`);
      }
      const data = (await resp.json()) as {
        reply_text: string;
        audio_wav_base64: string | null;
        voice_used: string;
        style_used: string;
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
      const updatedTurns = [newTurn, ...turns].slice(0, 6);
      setTurns(updatedTurns);
      host.writeStore(TURNS_STORE_KEY, updatedTurns);

      await playWavWithAvatarLipSync(data.audio_wav_base64, data.reply_text, activeVoice);
    } catch (err: any) {
      setSpeakError(err?.message || 'Could not play voice reply.');
    } finally {
      setSpeakBusy(false);
    }
  };

  const handleToggleVoiceConversationMic = async () => {
    if (isListeningPreview && previewRecRef.current) {
      previewRecRef.current.stop();
      setIsListeningPreview(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      await handleSpeakPrompt('How am I doing overall right now?');
      return;
    }
    try {
      stopActiveVoicePlayback();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      previewChunksRef.current = [];
      const rec = new MediaRecorder(stream);
      previewRecRef.current = rec;
      rec.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) previewChunksRef.current.push(ev.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const mime = rec.mimeType || 'audio/webm';
        const blob = new Blob(previewChunksRef.current, { type: mime });
        const [dataUrl, acoustics] = await Promise.all([
          blobToDataUrl(blob),
          analyzeBlobAcoustics(blob),
        ]);
        const shouldRefine = voiceConsent.consented && voiceConsent.allowConversationalRefinement;
        const trained = await trainAndTranscribeUserVoice({
          audioBase64: stripDataUrlPrefix(dataUrl),
          mimeType: mime,
          sourceType: shouldRefine ? 'conversation_audio' : 'text_only',
          consentVerified: shouldRefine,
          measuredPitchHz: acoustics.pitchHz,
          measuredPitchRangeHz: acoustics.pitchRangeHz,
          measuredBrightness: acoustics.brightness,
          measuredWpm: acoustics.cadenceWpm,
          formantBands: acoustics.formantBands,
          vocalRegister,
          accent: voiceAccent,
          speakingPace,
          transcriptHint: 'How am I doing overall right now?',
          patientName,
          existingProfile: voiceProfile,
          apiBase: host.apiBase,
        });
        let nextProfile = voiceProfile;
        if (shouldRefine && trained.used_real_audio) {
          setVoiceProfile(trained.profile);
          host.writeStore(SHARED_VOICE_STORE_KEY, trained.profile);
          window.dispatchEvent(new Event(VOICE_UPDATED_EVENT));
          nextProfile = trained.profile;
        }
        await handleSpeakPrompt(
          trained.transcript?.trim() || 'How am I doing overall right now?',
          nextProfile
        );
      };
      rec.start();
      setIsListeningPreview(true);
    } catch {
      await handleSpeakPrompt('How am I doing overall right now?');
    }
  };

  const starterPrompts = [
    'How am I doing overall right now?',
    'Share a calm reminder in my voice.',
    'What values and habits matter most to me?',
  ];

  const latestRecordedClip = voiceClips.find((c) => Boolean(c.audioDataUrl));
  const latestTurn = turns[0] || null;
  const completedPassages = voiceProfile?.completed_passages || [];

  return (
    <main className="twin4 mx-preserve-twin4">
      {/* LEFT STICKY 3D TWIN STAGE — Matches #/twin visual layout */}
      <section className="t4-stage" aria-label="Your preserved twin">
        <div className="t4-top mx-preserve-stage-top">
          <BackButton fallbackHash="#/you" />
          <span className="mx-preserve-pct-pill">{convergence.totalPct}% preserved</span>
        </div>

        <div className="mx-preserve-title-block">
          <h1 className="mx-preserve-h1">{patientName}’s twin</h1>
          <p className="note mx-preserve-sub">
            {faceProfile ? '3D likeness' : 'Clinical sculpt'}
            {' · '}
            {voiceProfile
              ? `${voiceProfile.prebuilt_voice} (${voiceProfile.pitch_hz || 175} Hz)`
              : 'Voice uncalibrated'}
            {' · '}
            {memoryItems.length + feedDiaryEntries.length} memories
          </p>
        </div>

        <PreserveAvatarStage
          patientName={patientName}
          convergencePct={convergence.totalPct}
          stageLabel={convergence.stageLabel}
          faceProfile={faceProfile}
          portraitDataUrl={portraitDataUrl}
          isSpeaking={isSpeaking}
          cadenceWpm={voiceProfile?.cadence_wpm || 142}
          getAudioLevel={() => liveAudioLevelRef.current}
          conversationState={
            isListeningPreview ? 'listening' : speakBusy ? 'thinking' : isSpeaking ? 'speaking' : 'idle'
          }
          processingStage={faceBusyStage}
          bundle={b}
          PatientTwin3D={host.PatientTwin3D}
          stageActionSlot={
            <button
              type="button"
              className={`twin-feed mx-stage-voice-btn${isListeningPreview ? ' is-rec' : ''}`}
              onClick={() => void handleToggleVoiceConversationMic()}
              disabled={speakBusy}
              aria-label={isListeningPreview ? 'Stop & speak' : 'Speak with your twin'}
              title={isListeningPreview ? 'Stop & speak' : 'Speak with your twin'}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
              <em>{isListeningPreview ? 'Listening…' : speakBusy ? 'Thinking…' : 'Speak'}</em>
            </button>
          }
        />
      </section>

      {/* RIGHT MINIMAL PANEL — Single focused card at a time */}
      <section className="t4-panel mx-preserve-panel" aria-label="Preserve yourself controls">
        {/* Minimal 3-step segmented bar */}
        <div className="segc mx-preserve-segbar" role="tablist" aria-label="Identity pillars">
          {(
            [
              ['appearance', `Appearance${faceProfile ? ' ✓' : ''}`],
              ['voice', `Voice${voiceProfile ? ' ✓' : ''}`],
              ['memory', `Memory (${memoryItems.length + feedDiaryEntries.length})`],
            ] as Array<[StudioTab, string]>
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              className={activeTab === id ? 'on' : ''}
              onClick={() => setActiveTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* TAB 1: APPEARANCE */}
        {activeTab === 'appearance' && (
          <section className="card mx-preserve-card" aria-label="Appearance">
            <div className="sec">
              <h3>3D Likeness</h3>
              {faceBusyStage ? (
                <span className="state warn">
                  <i />
                  Updating…
                </span>
              ) : faceProfile ? (
                <span className="state ok">
                  <i />
                  {faceProfile.likeness_score}% match
                </span>
              ) : (
                <span className="note">Add a portrait</span>
              )}
            </div>

            <div className="mx-angle-slots">
              {(
                [
                  ['front', 'Front'],
                  ['threeQuarter', '3/4 view'],
                  ['profile', 'Profile'],
                ] as Array<[PhotoAngleSlot, string]>
              ).map(([slotKey, slotLabel]) => {
                const slotImg =
                  photoAngles[slotKey] || (slotKey === 'front' ? portraitDataUrl : null);
                return (
                  <label
                    key={slotKey}
                    className={`mx-angle-slot${slotImg ? ' has-photo' : ''}`}
                  >
                    {slotImg ? (
                      <img
                        src={slotImg}
                        alt={`${patientName} ${slotLabel}`}
                        referrerPolicy="no-referrer"
                        className="mx-angle-img"
                      />
                    ) : (
                      <span className="mx-angle-empty">+ Photo</span>
                    )}
                    <small>{slotLabel}</small>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={Boolean(faceBusyStage)}
                      aria-label={`Upload ${slotLabel}`}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void processPortraitBlob(f, slotKey);
                        e.currentTarget.value = '';
                      }}
                    />
                  </label>
                );
              })}
            </div>

            <div className="mx-preserve-photo-actions">
              <label className="primary sm mx-file-btn">
                <span>{portraitDataUrl ? 'Replace photo' : 'Upload photo'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={Boolean(faceBusyStage)}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void processPortraitBlob(f, 'front');
                  }}
                />
              </label>

              <button
                type="button"
                className="secondary sm"
                disabled={Boolean(faceBusyStage)}
                onClick={() => void handleStartCamera()}
              >
                Camera
              </button>

              <button
                type="button"
                className="link"
                disabled={Boolean(faceBusyStage)}
                onClick={() => void handleUseSamplePortrait()}
              >
                Sample portrait
              </button>

              {portraitDataUrl && (
                <button
                  type="button"
                  className="link"
                  onClick={handleClearAppearance}
                >
                  Reset
                </button>
              )}
            </div>

            {cameraOpen && (
              <div className="mx-camera-box">
                <video ref={videoRef} muted playsInline className="mx-camera-video" />
                <div className="mx-preserve-photo-actions">
                  <button
                    type="button"
                    className="primary sm"
                    onClick={() => void handleSnapCameraPhoto()}
                  >
                    Capture
                  </button>
                  <button
                    type="button"
                    className="secondary sm"
                    onClick={() => {
                      cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
                      cameraStreamRef.current = null;
                      setCameraOpen(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {faceError && (
              <p className="note mx-err-note" role="alert">
                {faceError}
              </p>
            )}

            {faceProfile && (
              <div className="mx-refine-row">
                <label className="feed-f">
                  <span>Hair</span>
                  <select
                    value={faceProfile.hair_style}
                    onChange={(e) =>
                      updateFaceField(
                        'hair_style',
                        e.target.value as FaceLikenessData['hair_style']
                      )
                    }
                  >
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="long">Long</option>
                    <option value="bun">Bun</option>
                    <option value="curly">Curly</option>
                  </select>
                </label>

                <label className="mx-voice-toggle">
                  <input
                    type="checkbox"
                    checked={Boolean(faceProfile.glasses)}
                    onChange={(e) => updateFaceField('glasses', e.target.checked)}
                  />
                  <span>Glasses</span>
                </label>
              </div>
            )}
          </section>
        )}

        {/* TAB 2: PERSONAL VOICE MODEL CALIBRATION */}
        {activeTab === 'voice' && (
          <section className="card mx-preserve-card" aria-label="Personal voice calibration">
            <div className="sec">
              <h3>Your Voice Model</h3>
              {voiceProfile ? (
                <span className="state ok">
                  <i />
                  {voiceProfile.fidelity_score}% calibrated
                </span>
              ) : (
                <span className="note">0 / 3 samples</span>
              )}
            </div>

            {/* Required speaker traits for accurate TTS & formant matching */}
            <div className="mx-voice-traits-grid">
              <label className="feed-f">
                <span>Vocal register</span>
                <select
                  value={vocalRegister}
                  onChange={(e) =>
                    applyVoiceTraitChange({
                      vocal_register: e.target.value as VocalRegister,
                    })
                  }
                >
                  {(Object.entries(VOCAL_REGISTER_LABELS) as Array<[VocalRegister, string]>).map(
                    ([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="feed-f">
                <span>Accent</span>
                <select
                  value={voiceAccent}
                  onChange={(e) =>
                    applyVoiceTraitChange({
                      accent: e.target.value as VoiceAccent,
                    })
                  }
                >
                  {(Object.entries(VOICE_ACCENT_LABELS) as Array<[VoiceAccent, string]>).map(
                    ([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="feed-f">
                <span>Speaking pace</span>
                <select
                  value={speakingPace}
                  onChange={(e) =>
                    applyVoiceTraitChange({
                      speaking_pace: e.target.value as SpeakingPace,
                    })
                  }
                >
                  {(Object.entries(SPEAKING_PACE_LABELS) as Array<[SpeakingPace, string]>).map(
                    ([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>

            {/* Guided 3-sample phonetic calibration */}
            <div className="mx-passage-picker" role="group" aria-label="Voice samples">
              {calibrationPassages.map((p, idx) => {
                const done = completedPassages.includes(idx);
                return (
                  <button
                    key={p.label}
                    type="button"
                    className={`mx-kg-chip${passageIdx === idx ? ' is-active' : ''}`}
                    onClick={() => setPassageIdx(idx)}
                  >
                    {p.label}
                    {done ? ' ✓' : ''}
                  </button>
                );
              })}
            </div>

            <blockquote className="mx-read-aloud-prompt">“{currentPassage.text}”</blockquote>

            <div className="mx-voice-btn-row">
              <button
                type="button"
                className={isRecordingMic ? 'primary sm' : 'primary sm'}
                disabled={voiceBusy || !voiceConsent.consented}
                onClick={() => void handleToggleMicRecord()}
              >
                {isRecordingMic
                  ? 'Stop & train sample'
                  : voiceBusy
                    ? 'Training voice…'
                    : 'Record my voice'}
              </button>

              <label className="secondary sm mx-file-btn">
                <span>Upload audio</span>
                <input
                  type="file"
                  accept="audio/*"
                  multiple
                  disabled={voiceBusy || !voiceConsent.consented}
                  onChange={(e) => {
                    void handleUploadAudioFiles(e.target.files);
                    e.currentTarget.value = '';
                  }}
                />
              </label>

              <button
                type="button"
                className="link"
                disabled={voiceBusy || !voiceConsent.consented}
                onClick={() => void handleQuickCalibrateFromTraits()}
              >
                Calibrate from settings
              </button>
            </div>

            <label className="mx-voice-toggle">
              <input
                type="checkbox"
                checked={voiceConsent.consented}
                onChange={(e) => updateConsent({ consented: e.target.checked })}
              />
              <span>I consent to preserving my voice for my Twin</span>
            </label>

            {lastQuality && (
              <p className="note mx-tabular">
                Signal: {lastQuality.qualityLabel} ({lastQuality.snrDb} dB · {lastQuality.durationSec}s)
              </p>
            )}

            {voiceNotice && (
              <p className="note" role="status">
                {voiceNotice}
              </p>
            )}

            {voiceError && (
              <p className="note mx-err-note" role="alert">
                {voiceError}
              </p>
            )}

            {voiceProfile && (
              <div className="mx-voice-profile-box">
                <p className="note mx-tabular">
                  <b>{voiceProfile.prebuilt_voice}</b> · {voiceProfile.pitch_hz || 175} Hz ·{' '}
                  {voiceProfile.cadence_wpm} wpm · {voiceProfile.sample_count} sample
                  {voiceProfile.sample_count === 1 ? '' : 's'}
                </p>

                <div className="mx-ab-voice-bar">
                  <button
                    type="button"
                    className="secondary sm"
                    disabled={abBusy || isSpeaking}
                    onClick={() => void handlePlayTwinAbSample()}
                  >
                    {abBusy ? 'Synthesizing…' : isSpeaking ? 'Speaking…' : '▶ Hear my Twin'}
                  </button>

                  {latestRecordedClip?.audioDataUrl && (
                    <button
                      type="button"
                      className="secondary sm"
                      onClick={() => {
                        const a = new Audio(latestRecordedClip.audioDataUrl);
                        void a.play().catch(() => {});
                      }}
                    >
                      ▶ Hear my clip
                    </button>
                  )}

                  <button
                    type="button"
                    className="link mx-err-note"
                    onClick={() => void handleRevokeAndPurgeVoice()}
                  >
                    Delete voice
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 3: PERSONAL MEMORY */}
        {activeTab === 'memory' && (
          <section className="card mx-preserve-card" aria-label="Personal memories">
            <div className="sec">
              <h3>Personal Memory</h3>
              <span className="note">
                {memoryItems.length + feedDiaryEntries.length} saved
              </span>
            </div>

            <form className="mx-memory-form" onSubmit={handleAddMemory}>
              <div className="mx-memory-input-row">
                <select
                  aria-label="Memory category"
                  value={newMemoryCategory}
                  onChange={(e) => setNewMemoryCategory(e.target.value as MemoryCategory)}
                >
                  {MEMORY_CATEGORIES.map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={isRecordingMemory ? 'primary sm' : 'secondary sm'}
                  onClick={() => void handleToggleMemoryVoice()}
                >
                  {isRecordingMemory ? 'Stop mic' : 'Speak memory'}
                </button>
              </div>

              <div className="ask-in">
                <input
                  type="text"
                  placeholder="Add a memory, habit, or value…"
                  value={newMemoryText}
                  onChange={(e) => setNewMemoryText(e.target.value)}
                />
                <button type="submit" className="primary sm">
                  Save
                </button>
              </div>
            </form>

            <ul className="rows mx-memory-list">
              {memoryItems.map((m) => (
                <li key={m.id}>
                  <div>
                    <span>{m.text}</span>
                    <small className="note">{m.category.replace('_', ' ')}</small>
                  </div>
                  <button
                    type="button"
                    className="link"
                    onClick={() => persistMemories(memoryItems.filter((x) => x.id !== m.id))}
                  >
                    Remove
                  </button>
                </li>
              ))}
              {feedDiaryEntries.slice(0, 4).map((d) => (
                <li key={d.id}>
                  <div>
                    <span>
                      {d.title}: {d.detail}
                    </span>
                    <small className="note">From Feed diary · {d.date}</small>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* MINIMAL VOICE-ONLY PREVIEW — Zero text chat box */}
        <section className="card mx-preserve-voice-card" aria-label="Speak with your preserved twin">
          <div className="sec">
            <h3>Speak as {patientName}</h3>
            <button
              type="button"
              className={isListeningPreview ? 'primary sm' : 'secondary sm'}
              disabled={speakBusy}
              onClick={() => void handleToggleVoiceConversationMic()}
            >
              {isListeningPreview
                ? 'Stop & reply'
                : speakBusy
                  ? 'Speaking…'
                  : 'Tap to speak'}
            </button>
          </div>

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

          {latestTurn && (
            <div className="mx-preserve-turn-min">
              <p>“{latestTurn.reply}”</p>
              <div className="mx-ab-voice-bar">
                <small className="note">{latestTurn.voiceUsed}</small>
                <button
                  type="button"
                  className="link"
                  onClick={() =>
                    void playWavWithAvatarLipSync(latestTurn.audioWavBase64, latestTurn.reply)
                  }
                >
                  Replay
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Quiet collapsible privacy note */}
        <details className="mx-quiet-details">
          <summary>Privacy &amp; ownership</summary>
          <p className="note">
            Your portrait, voice model, and memories belong solely to you, stay isolated to your
            account, and can be deleted anytime.
          </p>
        </details>
      </section>
    </main>
  );
}
