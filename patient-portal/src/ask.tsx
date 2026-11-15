import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BRIEFING_STORAGE_KEY } from './feed';
import { KnowledgeGraphCard } from './kg-graph';
import { usePortalNavigation } from './navigation-context';
import {
  FACE_STORE_KEY,
  MEMORIES_STORE_KEY,
  PHOTO_STORE_KEY,
} from './preserve';
import {
  buildSelfPerspectivePrompts,
  computePreservationScore,
  createSampleVoiceWavBase64,
  type FaceLikenessData,
  type VoicePersonaData,
} from './preserve-math';
import { PreserveAvatarStage } from './preserve-stage';
import type {
  AskSource,
  FeedEntry,
  PortalHostBridge,
  StoredBriefing,
  VoiceConsentData,
} from './types';
import {
  analyzeBlobAcoustics,
  blobToBase64,
  LiveTwinVoiceClient,
  playMatchedVoiceReply,
  requestMatchedVoiceSynthesis,
  resolvePortalApiUrl,
  SHARED_VOICE_CONSENT_KEY,
  SHARED_VOICE_STORE_KEY,
  stopActiveVoicePlayback,
  trainAndTranscribeUserVoice,
  VOICE_UPDATED_EVENT,
} from './voice-engine';

const SOURCE_LABELS: Record<string, string> = {
  web: 'Google Search',
  kg: 'Medical evidence',
  record: 'Your record',
  finding: 'Finding for you',
};

function extractDomain(url?: string): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

interface ChatTurn {
  me: string;
  a: string;
  links: string[];
  sources?: AskSource[];
  audioWavBase64?: string | null;
  voiceUsed?: string;
  live?: boolean;
  liveVoice?: boolean;
  cdss?: boolean;
  pending?: boolean;
  crisis?: boolean;
}

export function CitationsList({
  sources,
  openFinding,
  insights,
}: {
  sources: AskSource[];
  openFinding?: (id: string) => void;
  insights: any[];
}) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mx-citations-block" aria-label="Grounded sources and citations">
      <span className="mx-citations-heading">Sources &amp; Grounded Citations</span>
      <ul className="ask-src mx-ask-src">
        {sources.slice(0, 8).map((src, idx) => {
          const badge = SOURCE_LABELS[src.kind] || src.kind;
          const domain = extractDomain(src.url);
          const canOpenFinding =
            Boolean(src.finding_id) &&
            Boolean(openFinding) &&
            insights.some((ins) => ins.id === src.finding_id);

          if (src.url) {
            return (
              <li key={`${src.title}-${idx}`} data-k={src.kind}>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-citation-link"
                >
                  <span className="mx-citation-top">
                    <i>{badge}</i>
                    {domain && <small className="mx-citation-host">{domain} ↗</small>}
                  </span>
                  <span className="mx-citation-title">{src.title}</span>
                  {src.detail && <small className="mx-citation-detail">{src.detail}</small>}
                </a>
              </li>
            );
          }

          if (canOpenFinding) {
            return (
              <li key={`${src.title}-${idx}`} data-k="finding">
                <button
                  type="button"
                  className="mx-citation-btn"
                  onClick={() => openFinding!(src.finding_id!)}
                >
                  <span className="mx-citation-top">
                    <i>{badge}</i>
                    <small className="mx-citation-host">Open finding →</small>
                  </span>
                  <span className="mx-citation-title">{src.title}</span>
                  {src.detail && <small className="mx-citation-detail">{src.detail}</small>}
                </button>
              </li>
            );
          }

          return (
            <li key={`${src.title}-${idx}`} data-k={src.kind}>
              <span className="mx-citation-static">
                <span className="mx-citation-top">
                  <i>{badge}</i>
                </span>
                <span className="mx-citation-title">{src.title}</span>
                {src.detail && <small className="mx-citation-detail">{src.detail}</small>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AskPanel({
  b,
  openFinding,
  embedded = false,
  initial,
  host,
}: {
  b: any;
  openFinding: (id: string) => void;
  embedded?: boolean;
  initial?: string;
  host: PortalHostBridge;
}) {
  const { navigate } = usePortalNavigation();
  const [question, setQuestion] = useState('');
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [serverLive, setServerLive] = useState(true);
  const [showKg, setShowKg] = useState(false);
  const [doctorDoc, setDoctorDoc] = useState<any>(null);

  // Personal 3D likeness & voice state for visual speaking Twin
  const [faceProfile, setFaceProfile] = useState<FaceLikenessData | null>(() =>
    host.readStore<FaceLikenessData | null>(FACE_STORE_KEY, null)
  );
  const [portraitDataUrl, setPortraitDataUrl] = useState<string | null>(() =>
    host.readStore<string | null>(PHOTO_STORE_KEY, null)
  );
  const [memories, setMemories] = useState<string[]>(() =>
    host.readStore<string[]>(MEMORIES_STORE_KEY, [])
  );
  const [voiceProfile, setVoiceProfile] = useState<VoicePersonaData | null>(() =>
    host.readStore<VoicePersonaData | null>(SHARED_VOICE_STORE_KEY, null)
  );
  const [voiceConsent, setVoiceConsent] = useState<VoiceConsentData>(() =>
    host.readStore<VoiceConsentData>(SHARED_VOICE_CONSENT_KEY, {
      consented: false,
      consentedAt: null,
      allowConversationalRefinement: true,
      encryptedAtRest: true,
    })
  );

  // Voice-first by default for patient Ask Your Twin
  const [autoSpeakReply, setAutoSpeakReply] = useState<boolean>(true);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceStatusMsg, setVoiceStatusMsg] = useState<string | null>(null);
  const [speakingTurnIdx, setSpeakingTurnIdx] = useState<number | null>(null);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [convState, setConvState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>(
    'idle'
  );

  // Real-time bidirectional Live Voice WebSocket session (/v1/live)
  const [liveModeActive, setLiveModeActive] = useState(false);
  const [liveStatusDetail, setLiveStatusDetail] = useState<string | null>(null);
  const liveClientRef = useRef<LiveTwinVoiceClient | null>(null);
  const liveInputAccRef = useRef<string>('');
  const liveOutputAccRef = useRef<string>('');
  const liveAudioLevelRef = useRef<number>(0);

  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const isDoctor = host.useDoctor ? host.useDoctor() : false;
  const patientName = b?.patient?.preferred_name || 'Member';
  const pendingFeed = host.readStore<FeedEntry[]>('mx-feed', []);

  const convergence = useMemo(
    () =>
      computePreservationScore({
        hasTwinRecord: Boolean(b?.patient),
        faceLikenessScore: faceProfile?.likeness_score ?? 0,
        voiceFidelityScore: voiceProfile?.used_real_audio ? voiceProfile.fidelity_score : 0,
        memoriesCount: memories.length,
      }),
    [b?.patient, faceProfile?.likeness_score, voiceProfile, memories.length]
  );

  useEffect(() => {
    if (host.checkHealth) {
      host.checkHealth().then(setServerLive).catch(() => setServerLive(false));
    }
  }, [host]);

  useEffect(() => {
    if (isDoctor && host.loadDoctorDoc) {
      host.loadDoctorDoc().then(setDoctorDoc).catch(() => setDoctorDoc(null));
    }
  }, [isDoctor, host]);

  // Re-read per-patient identity state whenever patient switches or voice updates
  useEffect(() => {
    const syncIdentity = () => {
      setVoiceProfile(host.readStore<VoicePersonaData | null>(SHARED_VOICE_STORE_KEY, null));
      setFaceProfile(host.readStore<FaceLikenessData | null>(FACE_STORE_KEY, null));
      setPortraitDataUrl(host.readStore<string | null>(PHOTO_STORE_KEY, null));
      setMemories(host.readStore<string[]>(MEMORIES_STORE_KEY, []));
      setVoiceConsent(
        host.readStore<VoiceConsentData>(SHARED_VOICE_CONSENT_KEY, {
          consented: false,
          consentedAt: null,
          allowConversationalRefinement: true,
          encryptedAtRest: true,
        })
      );
    };
    syncIdentity();
    window.addEventListener(VOICE_UPDATED_EVENT, syncIdentity);
    return () => window.removeEventListener(VOICE_UPDATED_EVENT, syncIdentity);
  }, [host, b?.patient?.preferred_name]);

  useEffect(() => {
    return () => {
      stopActiveVoicePlayback();
      liveClientRef.current?.disconnect();
      liveClientRef.current = null;
    };
  }, []);

  const persistVoiceProfile = (profile: VoicePersonaData) => {
    setVoiceProfile(profile);
    host.writeStore(SHARED_VOICE_STORE_KEY, profile);
    window.dispatchEvent(new Event(VOICE_UPDATED_EVENT));
  };

  const playWithAvatarSync = async (
    wavBase64: string | null | undefined,
    text: string,
    profile?: VoicePersonaData | null
  ) => {
    await playMatchedVoiceReply(wavBase64, text, profile ?? voiceProfile, {
      onStart: () => {
        setIsAvatarSpeaking(true);
        setConvState('speaking');
      },
      onLevel: (lvl) => {
        liveAudioLevelRef.current = lvl;
      },
      onEnd: () => {
        liveAudioLevelRef.current = 0;
        setIsAvatarSpeaking(false);
        setConvState(liveModeActive ? 'listening' : 'idle');
      },
    });
  };

  const localFallbackAnswer = (q: string): ChatTurn => {
    const qLow = q.toLowerCase();
    if (/how am i doing|overall|summary/i.test(qLow)) {
      const topInsights = (b?.insights || [])
        .slice(0, 2)
        .map((x: any) => x.title)
        .join('; ');
      const feedLine =
        pendingFeed.length > 0
          ? ` You have also logged ${pendingFeed.length} personal update${pendingFeed.length === 1 ? '' : 's'} in Feed Your Twin.`
          : '';
      return {
        me: q,
        a: isDoctor
          ? `${patientName}'s record includes ${(b?.insights || []).length} prioritized findings (${topInsights || 'baseline reviewed'}).${feedLine}`
          : `Looking across my Twin right now, my key tracked priorities are: ${topInsights || 'my baseline clinical markers'}.${feedLine} Everything else measured is stable, and any unmeasured domains remain clearly marked rather than guessed.`,
        links: (b?.insights || []).slice(0, 2).map((x: any) => x.id),
        sources: [{ kind: 'record', title: `${patientName} longitudinal Twin record` }],
      };
    }

    let best: any = null;
    let bestScore = 0;
    for (const item of b?.ask || []) {
      const score = (item.keys || []).reduce(
        (acc: number, k: string) => acc + (qLow.includes(k) ? k.length : 0),
        0
      );
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }
    if (best) {
      return {
        me: q,
        a: best.a,
        links: best.insights || [],
        sources: [{ kind: 'record', title: `${patientName} record` }],
      };
    }
    return {
      me: q,
      a: isDoctor
        ? "That specific analyte or history item isn't in this patient's record yet."
        : "That isn't in my record yet, so I won't guess. You can add it in Feed Your Twin or review it with your care team.",
      links: [],
    };
  };

  const askQuestion = async (
    rawQ: string,
    opts?: { forceSpeak?: boolean; profileOverride?: VoicePersonaData | null }
  ) => {
    const trimmed = rawQ.trim();
    if (!trimmed) return;

    if (host.crisisRegex && host.crisisRegex.test(trimmed)) {
      setTurns((prev) => [...prev, { me: trimmed, a: '', links: [], crisis: true }]);
      return;
    }

    // If Live Voice WebSocket is open and user submits text, stream it over the live channel too!
    if (liveModeActive && liveClientRef.current && !isDoctor) {
      liveClientRef.current.sendTextTurn(trimmed);
      setTurns((prev) => [
        ...prev,
        {
          me: trimmed,
          a: 'Speaking live…',
          links: [],
          liveVoice: true,
          pending: true,
        },
      ]);
      return;
    }

    setConvState('thinking');
    setTurns((prev) => [...prev, { me: trimmed, a: '', links: [], pending: true }]);

    const currentFeed = host.readStore<FeedEntry[]>('mx-feed', []);
    const latestBriefing = host.readStore<StoredBriefing | null>(BRIEFING_STORAGE_KEY, null);
    const currentMemories = host.readStore<string[]>(MEMORIES_STORE_KEY, []);
    const enrichedBundle = {
      ...b,
      pending_feed: currentFeed,
      latest_briefing: latestBriefing,
    };

    const patientId =
      String(host.getPatientId() || 'patient').replace(/[^A-Za-z0-9_-]/g, '') || 'patient';

    let clinicalDoc = doctorDoc;
    if (isDoctor && !clinicalDoc && host.loadDoctorDoc) {
      clinicalDoc = await host.loadDoctorDoc();
      setDoctorDoc(clinicalDoc);
    }

    const activeVoice = opts?.profileOverride ?? voiceProfile;
    const shouldSpeak = Boolean(!isDoctor && (opts?.forceSpeak || autoSpeakReply));

    let resolvedTurn: ChatTurn;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 45000);
      const res = await fetch(resolvePortalApiUrl('/v1/ask', host.apiBase), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          patient_id: patientId,
          question: trimmed,
          bundle: enrichedBundle,
          synthesize_audio: shouldSpeak,
          voice_profile: activeVoice || undefined,
          self_perspective: !isDoctor,
          identity_memories: currentMemories,
          ...(isDoctor ? { mode: 'cdss', clinical: clinicalDoc } : {}),
        }),
      });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const sources: AskSource[] = Array.isArray(data.sources) ? data.sources : [];
      const insightsList: any[] = Array.isArray(b?.insights) ? b.insights : [];
      const matchedFindingLinks = Array.from(
        new Set(
          sources
            .map((s) => s.finding_id)
            .filter((fid): fid is string => Boolean(fid) && insightsList.some((i) => i.id === fid))
        )
      );

      resolvedTurn = {
        me: trimmed,
        a: data.answer || '',
        links: matchedFindingLinks,
        sources,
        audioWavBase64: data.audio_wav_base64 ?? null,
        voiceUsed: data.voice_used,
        live: true,
        cdss: isDoctor,
      };
    } catch {
      resolvedTurn = localFallbackAnswer(trimmed);
      if (shouldSpeak && resolvedTurn.a) {
        try {
          const synth = await requestMatchedVoiceSynthesis({
            text: resolvedTurn.a,
            voiceProfile: activeVoice,
            patientSex: b?.patient?.sex,
            apiBase: host.apiBase,
          });
          resolvedTurn.audioWavBase64 = synth.audio_wav_base64;
          resolvedTurn.voiceUsed = synth.voice_used;
        } catch {
          // fallback speech handled by playWithAvatarSync
        }
      }
    }

    setTurns((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((item) => item.pending && item.me === trimmed);
      if (idx >= 0) {
        copy[idx] = resolvedTurn;
      } else {
        copy.push(resolvedTurn);
      }
      return copy;
    });

    if (shouldSpeak && resolvedTurn.a) {
      await playWithAvatarSync(resolvedTurn.audioWavBase64, resolvedTurn.a, activeVoice);
    } else {
      setConvState('idle');
    }
  };

  const handleToggleLiveVoice = async () => {
    if (liveModeActive && liveClientRef.current) {
      liveClientRef.current.disconnect();
      liveClientRef.current = null;
      setLiveModeActive(false);
      setLiveStatusDetail(null);
      setConvState('idle');
      setIsAvatarSpeaking(false);
      return;
    }

    stopActiveVoicePlayback();
    liveInputAccRef.current = '';
    liveOutputAccRef.current = '';

    const client = new LiveTwinVoiceClient({
      onStatusChange: (status, detail) => {
        if (detail) setLiveStatusDetail(detail);
        if (status === 'listening') {
          setConvState('listening');
          setIsAvatarSpeaking(false);
        } else if (status === 'speaking') {
          setConvState('speaking');
          setIsAvatarSpeaking(true);
        } else if (status === 'closed' || status === 'error') {
          setLiveModeActive(false);
          setConvState('idle');
          setIsAvatarSpeaking(false);
        }
      },
      onInputTranscript: (chunk) => {
        liveInputAccRef.current = `${liveInputAccRef.current} ${chunk}`.trim();
      },
      onOutputTranscript: (chunk) => {
        liveOutputAccRef.current = `${liveOutputAccRef.current}${chunk}`;
        const curOut = liveOutputAccRef.current.trim();
        const curIn = liveInputAccRef.current.trim() || 'Spoken live to Twin';
        setTurns((prev) => {
          const copy = [...prev];
          const lastIdx = copy.length - 1;
          if (lastIdx >= 0 && copy[lastIdx].liveVoice && copy[lastIdx].pending) {
            copy[lastIdx] = {
              ...copy[lastIdx],
              me: copy[lastIdx].me || curIn,
              a: curOut,
            };
          } else {
            copy.push({
              me: curIn,
              a: curOut,
              links: [],
              liveVoice: true,
              pending: true,
              sources: [{ kind: 'record', title: `${patientName} Live Voice Twin` }],
            });
          }
          return copy;
        });
      },
      onTurnComplete: () => {
        setTurns((prev) =>
          prev.map((item, idx) =>
            idx === prev.length - 1 && item.liveVoice
              ? { ...item, pending: false, live: true }
              : item
          )
        );
        liveInputAccRef.current = '';
        liveOutputAccRef.current = '';
      },
    });

    liveClientRef.current = client;
    setLiveModeActive(true);
    try {
      await client.connect({
        patientName,
        bundle: {
          ...b,
          pending_feed: pendingFeed,
        },
        voiceProfile,
        memories,
        apiBase: host.apiBase,
        enableMic: true,
      });
    } catch (err: any) {
      setLiveModeActive(false);
      setConvState('idle');
      setLiveStatusDetail(
        err?.message || 'Live voice WebSocket unavailable — use Speak Question below.'
      );
    }
  };

  const handleVoiceAudioBlob = async (blob: Blob, fallbackHint?: string) => {
    const canRefineProfile = Boolean(
      voiceConsent.consented && voiceConsent.allowConversationalRefinement
    );
    setConvState('thinking');
    setVoiceStatusMsg(
      canRefineProfile
        ? 'Transcribing spoken question & refining your consented voice profile…'
        : 'Transcribing your spoken question…'
    );
    try {
      const [acoustics, b64] = await Promise.all([
        analyzeBlobAcoustics(blob),
        blobToBase64(blob),
      ]);
      const trained = await trainAndTranscribeUserVoice({
        audioBase64: b64,
        mimeType: blob.type || 'audio/wav',
        sourceType: 'conversation_audio',
        consentVerified: canRefineProfile,
        measuredPitchHz: acoustics.pitchHz,
        measuredBrightness: acoustics.brightness,
        transcriptHint:
          fallbackHint || question.trim() || 'How am I doing overall right now?',
        patientName,
        existingProfile: voiceProfile,
        apiBase: host.apiBase,
      });

      let nextProfile = voiceProfile;
      if (canRefineProfile && trained.used_real_audio) {
        persistVoiceProfile(trained.profile);
        nextProfile = trained.profile;
      }

      setAutoSpeakReply(true);
      const askedText =
        trained.transcript?.trim() || question.trim() || 'How am I doing overall right now?';
      setQuestion('');
      setVoiceStatusMsg(
        nextProfile
          ? `Speaking answer in your voice (${nextProfile.prebuilt_voice} · ${
              nextProfile.pitch_hz || acoustics.pitchHz || 178
            } Hz · SNR ${acoustics.quality.snrDb} dB)`
          : 'Spoken question transcribed — enable Voice Preservation in Preserve Yourself to save your personal voice.'
      );
      await askQuestion(askedText, {
        forceSpeak: true,
        profileOverride: nextProfile,
      });
    } catch (err: any) {
      setConvState('idle');
      setVoiceStatusMsg(err?.message || 'Could not process voice recording.');
    }
  };

  const handleToggleMicQuestion = async () => {
    if (isRecordingVoice && mediaRecRef.current) {
      mediaRecRef.current.stop();
      setIsRecordingVoice(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceStatusMsg('Microphone unavailable here — upload an audio clip or try Sample voice.');
      return;
    }
    try {
      stopActiveVoicePlayback();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const rec = new MediaRecorder(stream);
      mediaRecRef.current = rec;
      rec.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const mime = rec.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mime });
        await handleVoiceAudioBlob(blob);
      };
      rec.start();
      setIsRecordingVoice(true);
      setConvState('listening');
      setVoiceStatusMsg('Listening… ask "How am I doing?" aloud, then click Stop & Ask.');
    } catch {
      setConvState('idle');
      setVoiceStatusMsg('Microphone permission declined — upload an audio clip or try Sample voice.');
    }
  };

  const handleSampleVoiceAsk = async () => {
    const promptToAsk = question.trim() || 'How am I doing overall right now?';
    setConvState('thinking');
    setVoiceStatusMsg('Calibrating your vocal timbre & synthesizing spoken self-perspective answer…');
    try {
      const sampleWav = createSampleVoiceWavBase64(0.85, b?.patient?.sex === 'male' ? 128 : 184);
      const trained = await trainAndTranscribeUserVoice({
        audioBase64: sampleWav,
        mimeType: 'audio/wav',
        sourceType: 'recorded_audio',
        consentVerified: true,
        measuredPitchHz: b?.patient?.sex === 'male' ? 128 : 184,
        measuredBrightness: 60,
        transcriptHint: promptToAsk,
        patientName,
        existingProfile: voiceProfile,
        apiBase: host.apiBase,
      });
      persistVoiceProfile(trained.profile);
      setAutoSpeakReply(true);
      setQuestion('');
      setVoiceStatusMsg(
        `Voice matched (${trained.profile.prebuilt_voice} · ${
          trained.profile.pitch_hz || 184
        } Hz) — speaking as your Twin`
      );
      await askQuestion(promptToAsk, {
        forceSpeak: true,
        profileOverride: trained.profile,
      });
    } catch (err: any) {
      setConvState('idle');
      setVoiceStatusMsg(err?.message || 'Sample voice run failed.');
    }
  };

  const handleSpeakTurn = async (turnIdx: number) => {
    const turn = turns[turnIdx];
    if (!turn || !turn.a || speakingTurnIdx !== null) return;
    if (turn.audioWavBase64) {
      await playWithAvatarSync(turn.audioWavBase64, turn.a, voiceProfile);
      return;
    }
    setSpeakingTurnIdx(turnIdx);
    try {
      const synth = await requestMatchedVoiceSynthesis({
        text: turn.a,
        voiceProfile,
        patientSex: b?.patient?.sex,
        apiBase: host.apiBase,
      });
      setTurns((prev) =>
        prev.map((item, idx) =>
          idx === turnIdx
            ? {
                ...item,
                audioWavBase64: synth.audio_wav_base64,
                voiceUsed: synth.voice_used,
              }
            : item
        )
      );
      await playWithAvatarSync(synth.audio_wav_base64, turn.a, voiceProfile);
    } finally {
      setSpeakingTurnIdx(null);
    }
  };

  useEffect(() => {
    if (initial && initial.trim()) {
      void askQuestion(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const submitCurrent = () => {
    if (!question.trim()) return;
    const q = question.trim();
    setQuestion('');
    void askQuestion(q);
  };

  const CrisisBanner = host.CrisisBanner;
  const cdssSuggestions = host.cdssPrompts || [
    'What should we check next?',
    'Treatment options and their evidence',
    'Drug interactions to review',
    'Results outside range',
  ];

  // Strictly first-person self-perspective prompts ("How am I doing?", never "How are you doing?")
  const patientSuggestions = useMemo(
    () => buildSelfPerspectivePrompts(b, pendingFeed.length, memories.length),
    [b, pendingFeed.length, memories.length]
  );

  const getCombinedAudioLevel = () => {
    if (liveModeActive && liveClientRef.current) {
      return Math.max(liveAudioLevelRef.current, liveClientRef.current.getOutputLevel());
    }
    return liveAudioLevelRef.current;
  };

  const content = (
    <>
      {!embedded && <h1>{isDoctor ? 'Clinical assistant' : 'Speak with your twin'}</h1>}
      <p className="lede">
        {isDoctor
          ? `Clinical decision support: grounded in ${patientName}’s Knowledge Graph, uploaded lab reports, and live Google Search clinical guidelines. For physician review; never diagnoses or prescribes.`
          : serverLive
            ? 'Speak naturally as yourself — ask "How am I doing?" and your Twin answers in first person using your preserved voice, 3D likeness, longitudinal health data, and grounded medical evidence.'
            : 'Your Twin answers strictly from your longitudinal health record, personal updates, and verified medical evidence.'}
      </p>

      {/* Visual Speaking 3D Twin Presence for Patient Self-Perspective Mode */}
      {!isDoctor && (
        <section className="card mx-ask-twin-presence" aria-label="Visual speaking Twin">
          <PreserveAvatarStage
            patientName={patientName}
            convergencePct={convergence.totalPct}
            stageLabel={convergence.stageLabel}
            faceProfile={faceProfile}
            portraitDataUrl={portraitDataUrl}
            isSpeaking={isAvatarSpeaking}
            cadenceWpm={voiceProfile?.cadence_wpm || 148}
            getAudioLevel={getCombinedAudioLevel}
            compact
            conversationState={convState}
            bundle={b}
            PatientTwin3D={host.PatientTwin3D}
          />

          <div className="mx-ask-presence-bar">
            <div className="mx-ask-presence-actions">
              <button
                type="button"
                className={liveModeActive ? 'primary sm' : 'secondary sm'}
                onClick={() => void handleToggleLiveVoice()}
              >
                {liveModeActive ? 'End Live Voice Call' : 'Start Live Voice Conversation'}
              </button>

              <button
                type="button"
                className={isRecordingVoice ? 'primary sm' : 'secondary sm'}
                onClick={() => void handleToggleMicQuestion()}
              >
                {isRecordingVoice ? 'Stop & Ask ("How am I doing?")' : 'Speak Question'}
              </button>

              <button
                type="button"
                className="secondary sm"
                onClick={() => void handleSampleVoiceAsk()}
              >
                Demo My Voice ("How am I doing?")
              </button>
            </div>

            <div className="mx-ask-presence-meta">
              <span className="note mx-tabular">
                {voiceProfile?.used_real_audio
                  ? `Your voice active: ${voiceProfile.prebuilt_voice} · ${
                      voiceProfile.pitch_hz || 175
                    } Hz (${voiceProfile.fidelity_score}% match)`
                  : 'Baseline voice · calibrate your real voice in Preserve Yourself'}
              </span>
              <button
                type="button"
                className="link"
                onClick={() => navigate('#/you/preserve')}
              >
                Customize 3D &amp; Voice →
              </button>
            </div>
          </div>

          {liveStatusDetail && (
            <p className="note" role="status">
              {liveStatusDetail}
            </p>
          )}
        </section>
      )}

      <div className="mx-kg-toggle-row">
        <button
          type="button"
          className="secondary sm mx-kg-toggle-btn"
          onClick={() => setShowKg((v) => !v)}
          aria-expanded={showKg}
        >
          {showKg ? 'Hide Knowledge Graph' : 'Show Twin Knowledge Graph'}
        </button>
        <span className="note">
          {isDoctor
            ? 'Clinical Knowledge Graph + Google Search grounding'
            : 'First-person Twin memory + Knowledge Graph + Personal Voice'}
        </span>
      </div>

      {showKg && (
        <div className="mx-ask-kg-wrap">
          <KnowledgeGraphCard
            b={b}
            doc={doctorDoc}
            readStore={host.readStore}
            openFinding={openFinding}
            compact={embedded}
          />
        </div>
      )}

      <div className="ask-box">
        <textarea
          aria-label="Your question"
          placeholder={
            isDoctor
              ? 'Ask about next tests, treatment options, interactions, genes, or recent report changes...'
              : 'Ask yourself: "How am I doing overall right now?", "What changed in my health recently?", or "How have I been sleeping?"'
          }
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submitCurrent();
            }
          }}
        />
        <button className="primary" onClick={submitCurrent}>
          {liveModeActive && !isDoctor ? 'Send Live' : 'Ask'}
        </button>
      </div>

      {/* Voice Upload & Auto-Speak Controls */}
      <div className="mx-voice-bar">
        <div className="mx-voice-bar-btns">
          <label className="secondary sm mx-file-btn">
            <span>Upload voice question</span>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleVoiceAudioBlob(f);
                e.currentTarget.value = '';
              }}
            />
          </label>

          {isAvatarSpeaking && (
            <button
              type="button"
              className="secondary sm"
              onClick={() => {
                stopActiveVoicePlayback();
                setIsAvatarSpeaking(false);
                setConvState(liveModeActive ? 'listening' : 'idle');
              }}
            >
              Stop speaking
            </button>
          )}
        </div>

        {!isDoctor && (
          <label className="mx-voice-toggle">
            <input
              type="checkbox"
              checked={autoSpeakReply}
              onChange={(e) => setAutoSpeakReply(e.target.checked)}
            />
            <span>
              Speak replies aloud in my voice
              {voiceProfile
                ? ` (${voiceProfile.prebuilt_voice} · ${voiceProfile.pitch_hz || 175} Hz)`
                : ''}
            </span>
          </label>
        )}
      </div>

      {voiceStatusMsg && (
        <p className="note" role="status">
          {voiceStatusMsg}
        </p>
      )}

      {turns.length === 0 && (
        <div className="suggest" aria-label="Suggested questions for your Twin">
          {(isDoctor ? cdssSuggestions : patientSuggestions).map((prompt) => (
            <button key={prompt} type="button" onClick={() => void askQuestion(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="mx-turns-stack">
        {turns.map((turn, idx) => (
          <div key={`${turn.me}-${idx}`} className="mx-turn-pair">
            <div className="bubble me">{turn.me}</div>

            {turn.crisis && CrisisBanner ? (
              <CrisisBanner />
            ) : turn.pending && !turn.a ? (
              <div className="bubble ask-pending">
                <span className="ap-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                Checking your Twin record, longitudinal updates &amp; medical evidence…
              </div>
            ) : (
              <div className="bubble mx-answer-bubble">
                <div className="mx-answer-top-bar">
                  {turn.cdss ? (
                    <span className="ask-live">Clinical decision support · Grounded</span>
                  ) : turn.liveVoice ? (
                    <span className="ask-live">Live bidirectional voice · Personal Twin</span>
                  ) : turn.live ? (
                    <span className="ask-live">Self-perspective · KG + Google Search</span>
                  ) : (
                    <span className="ask-live">Grounded in your Twin record</span>
                  )}

                  <button
                    type="button"
                    className="secondary sm"
                    disabled={speakingTurnIdx === idx}
                    onClick={() => void handleSpeakTurn(idx)}
                  >
                    {speakingTurnIdx === idx
                      ? 'Synthesizing voice…'
                      : turn.audioWavBase64
                        ? 'Replay in my voice'
                        : 'Speak in my voice'}
                  </button>
                </div>

                <p className="mx-answer-text">{turn.a}</p>

                {turn.audioWavBase64 && (
                  <div className="mx-matched-audio-controls">
                    <audio
                      controls
                      src={`data:audio/wav;base64,${turn.audioWavBase64}`}
                      className="mx-inline-audio"
                      onPlay={() => {
                        setIsAvatarSpeaking(true);
                        setConvState('speaking');
                      }}
                      onPause={() => {
                        setIsAvatarSpeaking(false);
                        setConvState('idle');
                      }}
                      onEnded={() => {
                        setIsAvatarSpeaking(false);
                        setConvState('idle');
                      }}
                    />
                    {turn.voiceUsed && <small className="note">{turn.voiceUsed}</small>}
                  </div>
                )}

                {turn.sources && turn.sources.length > 0 && (
                  <CitationsList
                    sources={turn.sources}
                    openFinding={openFinding}
                    insights={b?.insights || []}
                  />
                )}

                {turn.links.length > 0 && (
                  <div className="suggest mx-insight-links">
                    {turn.links.map((fid) => (
                      <button key={fid} type="button" onClick={() => openFinding(fid)}>
                        Read: {b?.insights?.find((x: any) => x.id === fid)?.title || fid}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {turns.length > 0 && (
        <div className="suggest">
          {(isDoctor ? cdssSuggestions : patientSuggestions)
            .filter((q) => !turns.some((t) => t.me === q))
            .slice(0, 4)
            .map((q) => (
              <button key={q} type="button" onClick={() => void askQuestion(q)}>
                {q}
              </button>
            ))}
        </div>
      )}
    </>
  );

  if (embedded) {
    return <div className="ask-wrap">{content}</div>;
  }
  return <main className="screen">{content}</main>;
}
