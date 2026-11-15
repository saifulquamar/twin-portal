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
  memory: 'Memory vault',
  feed: 'Feed update',
};

function extractDomain(url?: string): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

interface SpokenTurn {
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
  const [cdssQuery, setCdssQuery] = useState('');
  const [turns, setTurns] = useState<SpokenTurn[]>([]);
  const [showKg, setShowKg] = useState(false);
  const [doctorDoc, setDoctorDoc] = useState<any>(null);

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
        voiceFidelityScore: voiceProfile?.fidelity_score ?? 0,
        memoriesCount: memories.length,
      }),
    [b?.patient, faceProfile?.likeness_score, voiceProfile?.fidelity_score, memories.length]
  );

  useEffect(() => {
    if (isDoctor && host.loadDoctorDoc) {
      host.loadDoctorDoc().then(setDoctorDoc).catch(() => setDoctorDoc(null));
    }
  }, [isDoctor, host]);

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

  const localFallbackAnswer = (q: string): SpokenTurn => {
    const qLow = q.toLowerCase();
    if (/how am i doing|overall|summary/i.test(qLow)) {
      const topInsights = (b?.insights || [])
        .slice(0, 2)
        .map((x: any) => x.title)
        .join('; ');
      const feedLine =
        pendingFeed.length > 0
          ? ` I have also logged ${pendingFeed.length} recent update${pendingFeed.length === 1 ? '' : 's'} in Feed Your Twin.`
          : '';
      return {
        me: q,
        a: isDoctor
          ? `${patientName}'s record includes ${(b?.insights || []).length} prioritized findings (${topInsights || 'baseline reviewed'}).${feedLine}`
          : `Looking across my Twin right now, my main focus areas are: ${topInsights || 'my baseline clinical markers'}.${feedLine} Everything else measured is steady, and anything unmeasured stays clearly marked rather than guessed.`,
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
        : "That isn't in my record yet, so I won't guess. I can add it in Feed Your Twin or review it with my doctor.",
      links: [],
    };
  };

  const askQuestion = async (
    rawQ: string,
    opts?: { profileOverride?: VoicePersonaData | null }
  ) => {
    const trimmed = rawQ.trim();
    if (!trimmed) return;

    if (host.crisisRegex && host.crisisRegex.test(trimmed)) {
      setTurns((prev) => [...prev, { me: trimmed, a: '', links: [], crisis: true }]);
      return;
    }

    if (liveModeActive && liveClientRef.current && !isDoctor) {
      liveClientRef.current.sendSpokenPromptTurn(trimmed);
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
    const shouldSpeak = !isDoctor;

    let resolvedTurn: SpokenTurn;
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
          // SpeechSynthesis fallback handled by playWithAvatarSync
        }
      }
    }

    setTurns((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((item) => item.pending && item.me === trimmed);
      if (idx >= 0) copy[idx] = resolvedTurn;
      else copy.push(resolvedTurn);
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
        const curIn = liveInputAccRef.current.trim() || 'Spoken live';
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
        patientSex: b?.patient?.sex,
        bundle: {
          ...b,
          pending_feed: pendingFeed,
        },
        voiceProfile,
        memories,
        apiBase: host.apiBase,
        enableMic: true,
      });
    } catch {
      setLiveModeActive(false);
      setConvState('idle');
      setLiveStatusDetail('Live stream unavailable — tap the microphone button to speak.');
    }
  };

  const handleVoiceAudioBlob = async (blob: Blob) => {
    const canRefineProfile = Boolean(
      voiceConsent.consented && voiceConsent.allowConversationalRefinement
    );
    setConvState('thinking');
    setVoiceStatusMsg('Listening to your question…');
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
        measuredPitchRangeHz: acoustics.pitchRangeHz,
        measuredBrightness: acoustics.brightness,
        measuredWpm: acoustics.cadenceWpm,
        formantBands: acoustics.formantBands,
        transcriptHint: 'How am I doing overall right now?',
        patientName,
        existingProfile: voiceProfile,
        apiBase: host.apiBase,
      });

      let nextProfile = voiceProfile;
      if (canRefineProfile && trained.used_real_audio) {
        persistVoiceProfile(trained.profile);
        nextProfile = trained.profile;
      }

      const askedText = trained.transcript?.trim() || 'How am I doing overall right now?';
      setVoiceStatusMsg(null);
      await askQuestion(askedText, { profileOverride: nextProfile });
    } catch (err: any) {
      setConvState('idle');
      setVoiceStatusMsg(err?.message || 'Could not process voice audio.');
    }
  };

  const handleToggleMicQuestion = async () => {
    if (isAvatarSpeaking) {
      stopActiveVoicePlayback();
      setIsAvatarSpeaking(false);
      setConvState('idle');
      return;
    }
    if (isRecordingVoice && mediaRecRef.current) {
      mediaRecRef.current.stop();
      setIsRecordingVoice(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      await askQuestion('How am I doing overall right now?');
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
      setVoiceStatusMsg('Listening… tap again when finished speaking.');
    } catch {
      setConvState('idle');
      setVoiceStatusMsg('Microphone unavailable — tap a spoken prompt below or upload audio.');
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

  const CrisisBanner = host.CrisisBanner;
  const cdssSuggestions = host.cdssPrompts || [
    'What should we check next?',
    'Treatment options and their evidence',
    'Drug interactions to review',
    'Results outside range',
  ];

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

  // === PHYSICIAN CDSS VIEW (Doctor Mode only) ===
  if (isDoctor) {
    const submitCdss = () => {
      if (!cdssQuery.trim()) return;
      const q = cdssQuery.trim();
      setCdssQuery('');
      void askQuestion(q);
    };

    const cdssBody = (
      <>
        {!embedded && <h1>Clinical assistant</h1>}
        <p className="lede">
          Grounded in {patientName}’s Knowledge Graph, lab trends, and clinical guidelines. For
          physician review.
        </p>

        <div className="ask-box">
          <textarea
            aria-label="Clinical question"
            placeholder="Ask about next tests, treatment options, interactions, genes, or recent report changes…"
            value={cdssQuery}
            onChange={(e) => setCdssQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitCdss();
              }
            }}
          />
          <button className="primary" onClick={submitCdss}>
            Ask
          </button>
        </div>

        {turns.length === 0 && (
          <div className="suggest">
            {cdssSuggestions.map((prompt) => (
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
              {turn.pending && !turn.a ? (
                <div className="bubble ask-pending">Checking record &amp; clinical guidelines…</div>
              ) : (
                <div className="bubble mx-answer-bubble">
                  <p className="mx-answer-text">{turn.a}</p>
                  {turn.sources && turn.sources.length > 0 && (
                    <CitationsList
                      sources={turn.sources}
                      openFinding={openFinding}
                      insights={b?.insights || []}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    );

    return embedded ? <div className="ask-wrap">{cdssBody}</div> : <main className="screen">{cdssBody}</main>;
  }

  // === PATIENT MODE: PURE VOICE-ONLY SPEAKING TWIN (ZERO TEXT CHAT BOX) ===
  const activeTurn = turns.length > 0 ? turns[turns.length - 1] : null;
  const activeTurnIdx = turns.length - 1;

  const voiceOnlyContent = (
    <div className="mx-voice-only-studio" data-testid="voice-only-ask">
      {!embedded && (
        <div className="mx-voice-head">
          <h1>Speak with your twin</h1>
          <p className="note">
            Ask “How am I doing?” aloud — your Twin answers in your own voice.
          </p>
        </div>
      )}

      {/* Visual 3D Speaking Twin Stage */}
      <PreserveAvatarStage
        patientName={patientName}
        convergencePct={convergence.totalPct}
        stageLabel={convergence.stageLabel}
        faceProfile={faceProfile}
        portraitDataUrl={portraitDataUrl}
        isSpeaking={isAvatarSpeaking}
        cadenceWpm={voiceProfile?.cadence_wpm || 144}
        getAudioLevel={getCombinedAudioLevel}
        compact
        conversationState={convState}
        bundle={b}
        PatientTwin3D={host.PatientTwin3D}
      />

      {/* Tactile Voice Orb & Live Stream Controls — ZERO text input box */}
      <div className="mx-voice-orb-dock">
        <button
          type="button"
          className={`mx-mic-orb state-${convState}${isRecordingVoice ? ' is-rec' : ''}`}
          onClick={() => void handleToggleMicQuestion()}
          aria-label={
            isAvatarSpeaking
              ? 'Stop speaking'
              : isRecordingVoice
                ? 'Stop and ask'
                : 'Tap to speak with your twin'
          }
        >
          <span className="mx-mic-orb-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          </span>
          <b>
            {isAvatarSpeaking
              ? 'Speaking… tap to stop'
              : isRecordingVoice
                ? 'Listening… tap to send'
                : convState === 'thinking'
                  ? 'Thinking…'
                  : 'Tap to speak'}
          </b>
        </button>

        <div className="mx-voice-secondary-controls">
          <button
            type="button"
            className={liveModeActive ? 'primary sm' : 'secondary sm'}
            onClick={() => void handleToggleLiveVoice()}
          >
            {liveModeActive ? 'End live call' : 'Live conversation'}
          </button>

          <label className="secondary sm mx-file-btn">
            <span>Upload audio</span>
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

          <button
            type="button"
            className="link"
            onClick={() => navigate('#/you/preserve')}
          >
            {voiceProfile
              ? `${voiceProfile.prebuilt_voice} · ${voiceProfile.pitch_hz || 175} Hz`
              : 'Calibrate my voice →'}
          </button>
        </div>

        {(voiceStatusMsg || liveStatusDetail) && (
          <p className="note" role="status">
            {voiceStatusMsg || liveStatusDetail}
          </p>
        )}
      </div>

      {/* Active Spoken Response Caption */}
      {activeTurn && (
        <section className="card mx-spoken-response-card" aria-live="polite">
          <small className="note">You asked: “{activeTurn.me}”</small>

          {activeTurn.crisis && CrisisBanner ? (
            <CrisisBanner />
          ) : activeTurn.pending && !activeTurn.a ? (
            <p className="note">Checking your Twin record &amp; evidence…</p>
          ) : (
            <>
              <p className="mx-spoken-reply-text">{activeTurn.a}</p>

              <div className="mx-ab-voice-bar">
                <button
                  type="button"
                  className="secondary sm"
                  disabled={speakingTurnIdx === activeTurnIdx}
                  onClick={() => void handleSpeakTurn(activeTurnIdx)}
                >
                  {speakingTurnIdx === activeTurnIdx ? 'Synthesizing…' : '▶ Replay in my voice'}
                </button>
                {activeTurn.voiceUsed && <small className="note">{activeTurn.voiceUsed}</small>}
              </div>

              {activeTurn.links.length > 0 && (
                <div className="suggest mx-insight-links">
                  {activeTurn.links.map((fid) => (
                    <button key={fid} type="button" onClick={() => openFinding(fid)}>
                      {b?.insights?.find((x: any) => x.id === fid)?.title || fid} →
                    </button>
                  ))}
                </div>
              )}

              {activeTurn.sources && activeTurn.sources.length > 0 && (
                <details className="mx-quiet-details">
                  <summary>Sources ({activeTurn.sources.length})</summary>
                  <CitationsList
                    sources={activeTurn.sources}
                    openFinding={openFinding}
                    insights={b?.insights || []}
                  />
                </details>
              )}
            </>
          )}
        </section>
      )}

      {/* One-Tap Self-Perspective Spoken Prompts */}
      <div className="suggest mx-voice-prompts" aria-label="Spoken prompts">
        {patientSuggestions.slice(0, 5).map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={convState === 'thinking'}
            onClick={() => void askQuestion(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Quiet Knowledge Graph toggle */}
      <div className="mx-kg-toggle-row">
        <button
          type="button"
          className="link"
          onClick={() => setShowKg((v) => !v)}
          aria-expanded={showKg}
        >
          {showKg ? 'Hide Twin Knowledge Graph' : 'View Twin Knowledge Graph'}
        </button>
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
    </div>
  );

  if (embedded) {
    return <div className="ask-wrap">{voiceOnlyContent}</div>;
  }
  return <main className="screen">{voiceOnlyContent}</main>;
}

/**
 * Replaces the legacy bottom text chat input bar (`f_`) on #/twin with a clean,
 * voice-only floating launcher button that opens the Speaking Twin sheet.
 */
export function FloatingVoiceLauncher({
  b,
  go,
  show,
  doctor,
  Sheet,
  AskComp,
}: {
  b: any;
  go: (tab: string, sub?: string) => void;
  show: boolean;
  doctor: boolean;
  Sheet: any;
  AskComp: any;
}) {
  const [open, setOpen] = useState(false);

  if (!show) return null;

  return (
    <>
      <div className="mx-floating-voice-wrap">
        <button
          type="button"
          className="mx-floating-voice-pill"
          onClick={() => setOpen(true)}
          aria-label={doctor ? 'Open clinical assistant' : 'Speak with your twin'}
        >
          <svg
            viewBox="0 0 24 24"
            width="17"
            height="17"
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
          <span>{doctor ? 'Clinical assistant' : 'Speak with your twin'}</span>
        </button>
      </div>

      {open && Sheet && AskComp && (
        <Sheet
          title={doctor ? 'Clinical assistant' : 'Speak with your twin'}
          center
          onClose={() => {
            stopActiveVoicePlayback();
            setOpen(false);
          }}
        >
          <AskComp
            b={b}
            embedded
            openFinding={(fid: string) => {
              stopActiveVoicePlayback();
              setOpen(false);
              go('research', `f:${fid}`);
            }}
          />
        </Sheet>
      )}
    </>
  );
}
