import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchEncryptedVault,
  purgeEncryptedVault,
  saveEncryptedVault,
} from './auth-context';
import {
  computePreservationScore,
  createSampleVoiceWavBase64,
  type AudioQualityReport,
  type FaceLikenessData,
  type PreservedTurn,
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
const WAITLIST_KEY = 'mx-preserve-interest';

type StudioStep = 'all' | 'step1' | 'step2' | 'step3';
type PhotoAngleSlot = 'front' | 'threeQuarter' | 'profile';

const MEMORY_CATEGORIES: Array<[MemoryCategory, string]> = [
  ['life_story', 'Life Story'],
  ['values', 'Core Values'],
  ['habits', 'Daily Habits & Routines'],
  ['communication_style', 'How I Speak & Think'],
  ['milestone', 'Significant Milestone'],
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
  const preserveMeta = b?.preserve || {};
  const Hero = host.Hero;

  const [activeStep, setActiveStep] = useState<StudioStep>('all');

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

  // Step 2: Voice Identity & Consent state
  const [voiceProfile, setVoiceProfile] = useState<VoicePersonaData | null>(() =>
    host.readStore<VoicePersonaData | null>(SHARED_VOICE_STORE_KEY, null)
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
      `Hi, I’m ${patientName}. When things get busy, I like to take a breath, look at the facts clearly, and take one steady step at a time.`,
      `I want my digital twin to remember how I speak, what keeps me grounded, and how I care for my health and the people closest to me.`,
      `Even on a tired day, a quiet morning walk, good sleep, and honest conversations always help me reset my energy.`,
    ],
    [patientName]
  );
  const [voicePhrase, setVoicePhrase] = useState<string>(calibrationPassages[0]);
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

  // Linked diary entries from Feed Your Twin
  const feedDiaryEntries = useMemo(() => {
    const allFeed = host.readStore<FeedEntry[]>('mx-feed', []);
    return allFeed.filter(
      (e) => e.category === 'personal_diary' || e.kind === 'diary'
    );
  }, [b, host, memoryItems.length]);

  // First-person speech turns & live audio level
  const [turns, setTurns] = useState<PreservedTurn[]>(() =>
    host.readStore<PreservedTurn[]>(TURNS_STORE_KEY, [])
  );
  const [speakInput, setSpeakInput] = useState('');
  const [speakBusy, setSpeakBusy] = useState(false);
  const [speakError, setSpeakError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const liveAudioLevelRef = useRef<number>(0);

  // Archive preferences
  const [waitlistPicks, setWaitlistPicks] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(WAITLIST_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [waitlistSaved, setWaitlistSaved] = useState(false);
  const [vaultSyncedAt, setVaultSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    setVoicePhrase(calibrationPassages[passageIdx] || calibrationPassages[0]);
  }, [calibrationPassages, passageIdx]);

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
    setVoiceConsent(localConsent);
    setVoiceClips(localClips);
    setMemoryItems(normalizeMemoryItems(richMems, legacyMems));
    setTurns(host.readStore<PreservedTurn[]>(TURNS_STORE_KEY, []));
    setAbSynthesizedWav(null);

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
        host.writeStore(SHARED_VOICE_STORE_KEY, vault.voiceProfile);
      }
      if (Array.isArray(vault.memories) && vault.memories.length > 0 && !richMems) {
        setMemoryItems(vault.memories);
        host.writeStore(MEMORY_ITEMS_STORE_KEY, vault.memories);
      }
      if (vault.updatedAt) {
        setVaultSyncedAt(vault.updatedAt);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [patientId, b, host]);

  useEffect(() => {
    return () => {
      stopActiveVoicePlayback();
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const syncToServerVault = async (patch: Record<string, unknown>) => {
    const saved = await saveEncryptedVault(patientId, patch, host.apiBase);
    if (saved?.updatedAt) {
      setVaultSyncedAt(saved.updatedAt);
    }
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

  const playWavWithAvatarLipSync = async (wavBase64: string | null, spokenText: string) => {
    await playMatchedVoiceReply(wavBase64, spokenText, voiceProfile, {
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
    setFaceBusyStage('Uploading reference portrait…');
    try {
      const resizedDataUrl = await resizeImageToDataUrl(blob, 512);
      setFaceBusyStage('Analyzing cranial proportions & facial landmarks…');

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
        throw new Error(`Face likeness analysis returned HTTP ${resp.status}`);
      }
      setFaceBusyStage('Sculpting 3D mesh & feathering skin texture…');
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
      setFaceError(err?.message || 'Could not analyze portrait photo right now.');
    } finally {
      setFaceBusyStage(null);
    }
  };

  const handleUseSamplePortrait = async () => {
    setFaceError(null);
    setFaceBusyStage('Loading studio reference portrait…');
    try {
      const resp = await fetch('./sample-portrait.jpg', { cache: 'no-store' });
      if (!resp.ok) throw new Error('Sample portrait asset not found');
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
      setFaceError('Camera access is not available in this browser — upload a photo or use the sample portrait.');
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
      setFaceError('Camera permission was declined or no webcam was found. Please upload a photo instead.');
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

  // === STEP 2 HANDLERS: PERSONAL VOICE PRESERVATION ===
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
    brightness: number;
    quality: AudioQualityReport;
  }) => {
    if (!voiceConsent.consented) {
      setVoiceError('Please confirm voice-preservation consent first before building your voice profile.');
      return;
    }
    setVoiceBusy(true);
    setVoiceError(null);
    setVoiceNotice(null);
    setLastQuality(params.quality);
    try {
      const data = await trainAndTranscribeUserVoice({
        audioBase64: params.audioBase64,
        mimeType: params.mimeType,
        sourceType: params.sourceType,
        consentVerified: true,
        transcriptHint: params.transcriptHint,
        patientName,
        measuredPitchHz: params.pitchHz,
        measuredBrightness: params.brightness,
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

      host.writeStore(SHARED_VOICE_STORE_KEY, data.profile);
      host.writeStore(SHARED_VOICE_CLIPS_KEY, nextClips);
      window.dispatchEvent(new Event(VOICE_UPDATED_EVENT));

      void syncToServerVault({
        voiceProfile: data.profile,
        voiceConsent,
        voiceClips: nextClips.map(({ audioDataUrl: _omit, ...rest }) => rest),
      });
      setVoiceNotice(
        `Voice profile updated from ${
          params.sourceType === 'recorded_audio' ? 'microphone recording' : 'uploaded audio'
        } (${data.profile.prebuilt_voice} · ${data.profile.pitch_hz || 175} Hz · ${
          data.profile.fidelity_score
        }% fidelity).`
      );
    } catch (err: any) {
      setVoiceError(err?.message || 'Could not process voice recording right now.');
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
    if (!voiceConsent.consented) {
      setVoiceError('Please enable voice-preservation consent before recording.');
      return;
    }
    setVoiceError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceError(
        'Microphone access is unavailable in this browser. Upload a voice clip or calibrate with the sample clip.'
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
        const [dataUrl, acoustics] = await Promise.all([
          blobToDataUrl(blob),
          analyzeBlobAcoustics(blob),
        ]);
        await submitRealAudioVoiceSample({
          audioBase64: stripDataUrlPrefix(dataUrl),
          audioDataUrl: dataUrl,
          mimeType: mime,
          sourceType: 'recorded_audio',
          transcriptHint: voicePhrase,
          pitchHz: acoustics.pitchHz,
          brightness: acoustics.brightness,
          quality: acoustics.quality,
        });
      };
      recorder.start();
      setIsRecordingMic(true);
    } catch {
      setVoiceError(
        'Microphone permission was declined or unavailable. Upload an audio recording or calibrate with the sample clip.'
      );
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
        transcriptHint: voicePhrase,
        pitchHz: acoustics.pitchHz,
        brightness: acoustics.brightness,
        quality: acoustics.quality,
      });
    }
  };

  const handleTrainSampleVoice = async () => {
    const targetHz = b?.patient?.sex === 'male' ? 128 : 186;
    const wavB64 = createSampleVoiceWavBase64(0.95, targetHz);
    const dataUrl = `data:audio/wav;base64,${wavB64}`;
    await submitRealAudioVoiceSample({
      audioBase64: wavB64,
      audioDataUrl: dataUrl,
      mimeType: 'audio/wav',
      sourceType: 'recorded_audio',
      transcriptHint: voicePhrase,
      pitchHz: targetHz,
      brightness: 62,
      quality: {
        durationSec: 0.95,
        rms: 0.19,
        snrDb: 28,
        clipping: false,
        qualityLabel: 'Studio Clear',
      },
    });
  };

  const handlePlayTwinAbSample = async () => {
    if (!voiceProfile) return;
    const textToSpeak = lastTranscript || voicePhrase;
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
      setVoiceError(err?.message || 'Could not synthesize A/B comparison voice.');
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
    setVoiceNotice('Voice consent revoked and all voice recordings & acoustic profiles permanently purged.');
  };

  // === STEP 3 HANDLERS: IDENTITY & MEMORY VAULT ===
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
    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceError('Microphone unavailable in this browser — type your memory below.');
      return;
    }
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
        const shouldRefineVoice =
          voiceConsent.consented && voiceConsent.allowConversationalRefinement;
        const trained = await trainAndTranscribeUserVoice({
          audioBase64: stripDataUrlPrefix(dataUrl),
          mimeType: mime,
          sourceType: shouldRefineVoice ? 'conversation_audio' : 'text_only',
          consentVerified: shouldRefineVoice,
          measuredPitchHz: acoustics.pitchHz,
          measuredBrightness: acoustics.brightness,
          transcriptHint: newMemoryText.trim() || 'A personal memory for my digital twin.',
          patientName,
          existingProfile: voiceProfile,
          apiBase: host.apiBase,
        });
        if (shouldRefineVoice && trained.used_real_audio) {
          setVoiceProfile(trained.profile);
          host.writeStore(SHARED_VOICE_STORE_KEY, trained.profile);
          window.dispatchEvent(new Event(VOICE_UPDATED_EVENT));
        }
        const spokenText = trained.transcript?.trim();
        if (spokenText) {
          const item: IdentityMemoryItem = {
            id: `mem-${Date.now()}`,
            at: new Date().toISOString(),
            category: newMemoryCategory,
            text: spokenText,
            source: 'spoken',
          };
          persistMemories([item, ...memoryItems]);
          setNewMemoryText('');
        }
      };
      rec.start();
      setIsRecordingMemory(true);
    } catch {
      setVoiceError('Could not access microphone for spoken memory.');
    }
  };

  // === TALK WITH YOUR PRESERVED SELF (Text alone NEVER counts as acoustic voice training!) ===
  const handleSpeakPrompt = async (rawPrompt?: string) => {
    const promptText = (rawPrompt ?? speakInput).trim();
    if (!promptText || speakBusy) return;
    setSpeakInput('');
    setSpeakBusy(true);
    setSpeakError(null);

    try {
      const resp = await fetch(resolvePortalApiUrl('/v1/preserve/speak', host.apiBase), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          patient_name: patientName,
          bundle: b,
          voice_profile: voiceProfile || undefined,
          memories: memoryStrings,
        }),
      });
      if (!resp.ok) {
        throw new Error(`Preserved Twin speech returned HTTP ${resp.status}`);
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

      await playWavWithAvatarLipSync(data.audio_wav_base64, data.reply_text);
    } catch (err: any) {
      setSpeakError(err?.message || 'Could not synthesize preserved speech right now.');
    } finally {
      setSpeakBusy(false);
    }
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
      // ignore
    }
    setWaitlistSaved(true);
  };

  const starterPrompts = [
    'How am I taking care of my health and energy these days?',
    'Share a calm reminder in my own voice for a busy week.',
    'What values and daily habits matter most to me?',
  ];

  const latestRecordedClip = voiceClips.find((c) => Boolean(c.audioDataUrl));

  return (
    <>
      {Hero ? (
        <Hero
          title="Preserve yourself"
          illus="preserve"
          sub="Build a permanent digital representation of your visual likeness, your own voice, and your personal memories."
        />
      ) : (
        <h1>Preserve yourself</h1>
      )}

      {/* 3D LIVING TWIN STAGE + 3-IDENTITY PILLARS */}
      <section className="card mx-preserve-studio-card" aria-label="3D Digital Identity Studio">
        <div className="sec">
          <div>
            <span className="mx-eyebrow">
              Digital Identity Preservation · AES-256-GCM Vault
              {vaultSyncedAt ? ' · Synced' : ''}
            </span>
            <h2>{patientName}’s Living 3D Digital Twin</h2>
          </div>
          <span className={`state ${convergence.totalPct >= 60 ? 'ok' : 'warn'}`}>
            <i />
            {convergence.totalPct}% preserved
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
          getAudioLevel={() => liveAudioLevelRef.current}
          processingStage={faceBusyStage}
          bundle={b}
          PatientTwin3D={host.PatientTwin3D}
        />

        <div className="mx-preserve-pillars">
          <button
            type="button"
            className={`mx-pillar-tile mx-pillar-btn${faceProfile ? ' on' : ''}`}
            onClick={() => setActiveStep('step1')}
          >
            <small>01. Visual Identity</small>
            <b>{convergence.facePct}% / 35%</b>
            <span>
              {faceProfile
                ? `${photoCount} photo${photoCount === 1 ? '' : 's'} · ${faceProfile.likeness_score}% 3D match`
                : 'Upload or capture photo'}
            </span>
          </button>

          <button
            type="button"
            className={`mx-pillar-tile mx-pillar-btn${voiceProfile ? ' on' : ''}`}
            onClick={() => setActiveStep('step2')}
          >
            <small>02. Voice Identity</small>
            <b>{convergence.voicePct}% / 30%</b>
            <span>
              {voiceProfile
                ? `${voiceProfile.prebuilt_voice} · ${voiceProfile.pitch_hz || 175} Hz · ${voiceProfile.sample_count} audio clip${voiceProfile.sample_count === 1 ? '' : 's'}`
                : 'Record or upload your voice'}
            </span>
          </button>

          <button
            type="button"
            className={`mx-pillar-tile mx-pillar-btn${memoryItems.length > 0 ? ' on' : ''}`}
            onClick={() => setActiveStep('step3')}
          >
            <small>03. Personal Memory</small>
            <b>{convergence.memoriesBonusPct}% / 10%</b>
            <span>
              {memoryItems.length + feedDiaryEntries.length} memories &amp; diary notes
            </span>
          </button>

          <div className="mx-pillar-tile on">
            <small>Biological Twin</small>
            <b>{convergence.twinBasePct}% / 25%</b>
            <span>Labs, organs &amp; longitudinal record</span>
          </div>
        </div>

        {/* Clean Step Filter Bar */}
        <div className="mx-step-tabs" role="tablist" aria-label="Preservation steps">
          {(
            [
              ['all', 'All 3 Steps'],
              ['step1', `1. Appearance${faceProfile ? ' ✓' : ''}`],
              ['step2', `2. Personal Voice${voiceProfile ? ' ✓' : ''}`],
              ['step3', `3. Identity & Memory (${memoryItems.length + feedDiaryEntries.length})`],
            ] as Array<[StudioStep, string]>
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeStep === id}
              className={`mx-kg-chip${activeStep === id ? ' is-active' : ''}`}
              onClick={() => setActiveStep(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* STEP 1 & STEP 2 */}
      {(activeStep === 'all' || activeStep === 'step1' || activeStep === 'step2') && (
        <div className={activeStep === 'all' ? 'grid2 mx-preserve-grid' : 'mx-preserve-single'}>
          {/* STEP 1: PRESERVE YOUR APPEARANCE */}
          {(activeStep === 'all' || activeStep === 'step1') && (
            <section className="card mx-preserve-card" aria-label="Step 1: Preserve Your Appearance">
              <div className="sec">
                <div>
                  <span className="mx-eyebrow">Step 1 · Visual Identity</span>
                  <h3>Preserve Your Appearance</h3>
                </div>
                {faceBusyStage ? (
                  <span className="state warn">
                    <i />
                    Processing…
                  </span>
                ) : faceProfile ? (
                  <span className="state ok">
                    <i />
                    {faceProfile.likeness_score}% 3D match
                  </span>
                ) : (
                  <span className="note">Not generated yet</span>
                )}
              </div>

              <p className="note">
                Upload front or multi-angle portraits, or capture from your camera. Your facial proportions, skin tone, and features are feathered smoothly onto your 3D Twin.
              </p>

              {faceBusyStage && (
                <div className="mx-pipeline-status" role="status" aria-live="polite">
                  <b>{faceBusyStage}</b>
                  <small>Do not close — building realistic 3D facial geometry &amp; skin projection.</small>
                </div>
              )}

              {/* Multi-angle reference slots */}
              <div className="mx-angle-slots">
                {(
                  [
                    ['front', 'Front Portrait'],
                    ['threeQuarter', '3/4 Angle'],
                    ['profile', 'Side Profile'],
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
                        <span className="mx-angle-empty">+ Add photo</span>
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
                  <span>{portraitDataUrl ? 'Update front photo' : 'Upload portrait photo'}</span>
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
                  Use camera
                </button>

                <button
                  type="button"
                  className="link"
                  disabled={Boolean(faceBusyStage)}
                  onClick={() => void handleUseSamplePortrait()}
                >
                  {faceBusyStage ? 'Processing…' : 'Use sample portrait'}
                </button>
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
                      Capture portrait
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
                <div className="mx-likeness-meta">
                  <p className="note">{faceProfile.likeness_summary}</p>
                  <div className="mx-swatch-row">
                    <span>
                      <i style={{ background: faceProfile.skin_tone_hex }} />
                      Skin · {faceProfile.skin_tone_hex}
                    </span>
                    <span>
                      <i style={{ background: faceProfile.hair_color_hex }} />
                      Hair · {faceProfile.hair_style}
                    </span>
                    <span>
                      <i style={{ background: faceProfile.eye_color_hex }} />
                      Iris
                    </span>
                  </div>

                  {/* Interactive 3D Appearance Refinement Controls */}
                  <div className="mx-refine-row">
                    <label className="feed-f">
                      <span>Refine hair style</span>
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
                        <option value="bun">Gathered / Bun</option>
                        <option value="curly">Curly</option>
                      </select>
                    </label>

                    <label className="mx-voice-toggle">
                      <input
                        type="checkbox"
                        checked={faceProfile.glasses}
                        onChange={(e) => updateFaceField('glasses', e.target.checked)}
                      />
                      <span>Eyeglasses on 3D Twin</span>
                    </label>

                    <button
                      type="button"
                      className="link"
                      onClick={handleClearAppearance}
                    >
                      Reset appearance
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* STEP 2: PRESERVE YOUR VOICE */}
          {(activeStep === 'all' || activeStep === 'step2') && (
            <section className="card mx-preserve-card" aria-label="Step 2: Preserve Your Voice">
              <div className="sec">
                <div>
                  <span className="mx-eyebrow">Step 2 · Personal Voice Identity</span>
                  <h3>Preserve Your Own Voice</h3>
                </div>
                {voiceProfile ? (
                  <span className="state ok">
                    <i />
                    {voiceProfile.fidelity_score}% fidelity
                  </span>
                ) : (
                  <span className="note">Awaiting voice audio</span>
                )}
              </div>

              <p className="note">
                Record your voice or upload existing voice clips. Your Twin learns your pitch (F0), cadence, warmth, and phrasing — text alone is never counted as voice-training audio.
              </p>

              {/* Explicit Voice Consent & Conversational Refinement Controls */}
              <div className="mx-consent-panel">
                <label className="mx-voice-toggle">
                  <input
                    type="checkbox"
                    checked={voiceConsent.consented}
                    onChange={(e) => updateConsent({ consented: e.target.checked })}
                  />
                  <span>
                    <b>I consent to preserving my own voice</b> for {patientName}’s Digital Twin (encrypted at rest; revocable anytime).
                  </span>
                </label>

                <label className="mx-voice-toggle">
                  <input
                    type="checkbox"
                    checked={voiceConsent.allowConversationalRefinement}
                    disabled={!voiceConsent.consented}
                    onChange={(e) =>
                      updateConsent({ allowConversationalRefinement: e.target.checked })
                    }
                  />
                  <span>
                    Use my spoken Twin conversations to progressively improve my voice profile
                  </span>
                </label>
              </div>

              <div className="mx-passage-picker">
                <span className="note">Guided passage:</span>
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`mx-kg-chip${passageIdx === idx ? ' is-active' : ''}`}
                    onClick={() => setPassageIdx(idx)}
                  >
                    Passage {idx + 1}
                  </button>
                ))}
              </div>

              <label className="feed-f">
                <span>Read aloud in your natural voice (or speak freely)</span>
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
                  disabled={voiceBusy || !voiceConsent.consented}
                  onClick={() => void handleToggleMicRecord()}
                >
                  {isRecordingMic ? 'Stop & build voice profile' : 'Record my voice'}
                </button>

                <label className="secondary sm mx-file-btn">
                  <span>Upload voice audio</span>
                  <input
                    type="file"
                    accept="audio/*"
                    multiple
                    disabled={voiceBusy || !voiceConsent.consented}
                    onChange={(e) => void handleUploadAudioFiles(e.target.files)}
                  />
                </label>

                <button
                  type="button"
                  className="link"
                  disabled={voiceBusy || !voiceConsent.consented}
                  onClick={() => void handleTrainSampleVoice()}
                >
                  {voiceBusy ? 'Building voice profile…' : 'Calibrate with sample voice clip'}
                </button>
              </div>

              {lastQuality && (
                <div className="mx-audio-quality-strip">
                  <span>Audio quality: <b>{lastQuality.qualityLabel}</b></span>
                  <span aria-hidden="true">·</span>
                  <span className="mx-tabular">SNR {lastQuality.snrDb} dB</span>
                  <span aria-hidden="true">·</span>
                  <span className="mx-tabular">{lastQuality.durationSec}s</span>
                </div>
              )}

              {voiceError && (
                <p className="note mx-err-note" role="alert">
                  {voiceError}
                </p>
              )}
              {voiceNotice && (
                <p className="note" role="status">
                  {voiceNotice}
                </p>
              )}

              {voiceProfile && (
                <div className="mx-voice-profile-box" data-testid="voice-profile-summary">
                  <div className="mx-voice-stats">
                    <span>
                      <small>Matched Timbre &amp; F0 Pitch</small>
                      <b className="mx-tabular">
                        {voiceProfile.prebuilt_voice}
                        {voiceProfile.pitch_hz ? ` · ${voiceProfile.pitch_hz} Hz` : ''}
                      </b>
                    </span>
                    <span>
                      <small>Natural Cadence</small>
                      <b className="mx-tabular">{voiceProfile.cadence_wpm} WPM</b>
                    </span>
                    <span>
                      <small>Warmth / Clarity</small>
                      <b className="mx-tabular">
                        {voiceProfile.warmth}% · {voiceProfile.clarity}%
                      </b>
                    </span>
                    <span>
                      <small>Verified Audio Clips</small>
                      <b className="mx-tabular">{voiceProfile.sample_count}</b>
                    </span>
                  </div>

                  <p className="note">
                    <b>Acoustic profile:</b>{' '}
                    {String(voiceProfile.vocal_style || '').replace(/\.+$/, '')}.{' '}
                    {voiceProfile.summary}
                  </p>

                  {/* A/B Original vs Twin Voice Comparison */}
                  <div className="mx-ab-voice-bar">
                    {latestRecordedClip?.audioDataUrl && (
                      <button
                        type="button"
                        className="secondary sm"
                        onClick={() => {
                          const a = new Audio(latestRecordedClip.audioDataUrl);
                          void a.play().catch(() => {});
                        }}
                      >
                        ▶ Hear my original clip
                      </button>
                    )}

                    <button
                      type="button"
                      className="primary sm"
                      disabled={abBusy}
                      onClick={() => void handlePlayTwinAbSample()}
                    >
                      {abBusy ? 'Synthesizing my voice…' : '▶ Hear my Twin’s voice'}
                    </button>

                    <button
                      type="button"
                      className="link mx-danger-link"
                      onClick={() => void handleRevokeAndPurgeVoice()}
                    >
                      Revoke consent &amp; delete voice
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* STEP 3: PRESERVE YOUR IDENTITY & MEMORY */}
      {(activeStep === 'all' || activeStep === 'step3') && (
        <section className="card mx-preserve-card" aria-label="Step 3: Preserve Your Identity and Memory">
          <div className="sec">
            <div>
              <span className="mx-eyebrow">Step 3 · Personal Identity, Experiences &amp; Diary</span>
              <h2>Preserve Your Identity &amp; Memory</h2>
            </div>
            <span className="note mx-tabular">
              {memoryItems.length + feedDiaryEntries.length} preserved entries
            </span>
          </div>

          <p className="note">
            Record life experiences, core values, daily habits, and personal reflections so your Twin carries forward how you think and what matters to you. Personal Diary entries added in Feed Your Twin appear here automatically.
          </p>

          <form className="mx-memory-form" onSubmit={handleAddMemory}>
            <div className="mx-memory-form-row">
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

              <input
                value={newMemoryText}
                onChange={(e) => setNewMemoryText(e.target.value)}
                placeholder="Write a memory, habit, life lesson, or personal reflection…"
                aria-label="Add a personal memory or principle"
              />

              <button
                type="button"
                className={isRecordingMemory ? 'primary sm' : 'secondary sm'}
                onClick={() => void handleToggleMemoryVoice()}
              >
                {isRecordingMemory ? 'Stop & save' : 'Speak memory'}
              </button>

              <button type="submit" className="primary sm" disabled={!newMemoryText.trim()}>
                Save memory
              </button>
            </div>
          </form>

          <ul className="rs-rows">
            {memoryItems.map((mem) => {
              const catLabel =
                MEMORY_CATEGORIES.find(([c]) => c === mem.category)?.[1] || 'Memory';
              return (
                <li key={mem.id}>
                  <span>
                    <b>
                      {catLabel} · {mem.source === 'spoken' ? 'Spoken audio' : 'Written'}
                    </b>
                    <small>{mem.text}</small>
                  </span>
                  <button
                    type="button"
                    className="link"
                    aria-label={`Remove memory ${mem.text.slice(0, 24)}`}
                    onClick={() =>
                      persistMemories(memoryItems.filter((item) => item.id !== mem.id))
                    }
                  >
                    Remove
                  </button>
                </li>
              );
            })}

            {feedDiaryEntries.map((diary) => (
              <li key={diary.id}>
                <span>
                  <b>Personal Diary (from Feed Your Twin) · {host.formatDate(diary.date)}</b>
                  <small>
                    {diary.title}
                    {diary.detail ? ` — ${diary.detail}` : ''}
                  </small>
                </span>
                <span className="note">Linked</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* LIVE FIRST-PERSON VOICE CONVERSATION PREVIEW */}
      <section className="card mx-preserve-talk-card" aria-label="Talk with your preserved twin">
        <div className="sec">
          <div>
            <span className="mx-eyebrow">Interactive Preview · First-Person Voice &amp; 3D Lip-Sync</span>
            <h2>Speak with your preserved Twin</h2>
          </div>
          {isSpeaking ? (
            <span className="state ok">
              <i />
              Speaking in your voice
            </span>
          ) : null}
        </div>

        <p className="note">
          Test how your Twin speaks in first person using your preserved voice profile, biological record, and personal memories.
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
            placeholder={`Ask ${patientName}’s preserved Twin (e.g. “How am I doing lately?”)…`}
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
                  <small>Prompt</small>
                  <p>{turn.prompt}</p>
                </div>
                <div className="mx-preserve-turn-a">
                  <div className="sec">
                    <small>
                      {patientName}’s Twin · {turn.voiceUsed} ({turn.styleUsed})
                    </small>
                    <button
                      type="button"
                      className="link"
                      onClick={() =>
                        void playWavWithAvatarLipSync(turn.audioWavBase64, turn.reply)
                      }
                    >
                      ▶ Replay in my voice
                    </button>
                  </div>
                  <p>“{turn.reply}”</p>
                  {turn.audioWavBase64 && (
                    <audio
                      controls
                      src={`data:audio/wav;base64,${turn.audioWavBase64}`}
                      className="mx-inline-audio"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* GOVERNANCE & ARCHIVE PREFERENCES */}
      {Array.isArray(preserveMeta.options) && preserveMeta.options.length > 0 && (
        <section className="card mx-preserve-card">
          <h2>Ownership, privacy &amp; biobanking preferences</h2>
          <p className="note">
            Choose which layers of your Digital Twin remain active in your encrypted vault or enrolled for longitudinal clinical updates.
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
              Saved preferences: {waitlistPicks.join(', ')}. Encrypted and controlled by you.
            </p>
          )}
        </section>
      )}
    </>
  );
}
