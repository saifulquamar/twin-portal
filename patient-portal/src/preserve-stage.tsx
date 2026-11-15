import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  computeSyntheticSpeechMouthOpen,
  type FaceLikenessData,
} from './preserve-math';

type CameraFraming = 'full' | 'portrait';
type TwinLayer = 'skin' | 'bones' | 'organs' | 'vessels';

function parseHexRgb01(hex: string | undefined, fallback: [number, number, number]): [number, number, number] {
  if (!hex || typeof hex !== 'string') return fallback;
  const clean = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return fallback;
  const n = parseInt(clean, 16);
  return [
    ((n >> 16) & 255) / 255,
    ((n >> 8) & 255) / 255,
    (n & 255) / 255,
  ];
}

function mixRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

const CLINICAL_CORE_RGB: [number, number, number] = [0xf2 / 255, 0xf9 / 255, 0xf9 / 255];
const CLINICAL_EDGE_RGB: [number, number, number] = [0x3f / 255, 0x87 / 255, 0x94 / 255];

const LAYER_LABELS: Array<[TwinLayer, string]> = [
  ['skin', 'Skin silhouette'],
  ['bones', 'Skeleton'],
  ['organs', 'Organs'],
  ['vessels', 'Blood vessels'],
];

/**
 * PreserveAvatarStage — Renders the exact #/twin anatomical 3D Twin (`PatientTwin3D` / `<mx-patient-twin>`)
 * inside `.twin-view`, enhanced with:
 * - Subtle personal subsurface skin warmth calibrated from `faceProfile.skin_tone_hex`
 * - Crisp studio Portrait Medallion with live vocal-cadence aura when a portrait is preserved
 * - Real-time vocal resonance & syllable pulsing on the 3D Twin when speaking or listening
 * - Full #/twin layer controls (Skin, Skeleton, Organs, Blood vessels, Front/Back, Head focus)
 */
export function PreserveAvatarStage({
  patientName,
  convergencePct,
  stageLabel,
  faceProfile,
  portraitDataUrl,
  isSpeaking,
  cadenceWpm = 144,
  getAudioLevel,
  compact = false,
  conversationState = 'idle',
  processingStage = null,
  bundle,
  PatientTwin3D,
  defaultFraming = 'full',
  stageActionSlot,
}: {
  patientName: string;
  convergencePct: number;
  stageLabel: string;
  faceProfile: FaceLikenessData | null;
  portraitDataUrl: string | null;
  isSpeaking: boolean;
  cadenceWpm?: number;
  getAudioLevel?: () => number;
  compact?: boolean;
  conversationState?: 'idle' | 'listening' | 'thinking' | 'speaking';
  processingStage?: string | null;
  bundle?: any;
  PatientTwin3D?: any;
  defaultFraming?: CameraFraming;
  stageActionSlot?: React.ReactNode;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [framing, setFraming] = useState<CameraFraming>(defaultFraming);
  const [layers, setLayers] = useState<TwinLayer[]>(['skin', 'bones', 'organs', 'vessels']);
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [personalWarmth, setPersonalWarmth] = useState<boolean>(true);
  const [layersOpen, setLayersOpen] = useState<boolean>(false);
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [resetCount, setResetCount] = useState<number>(0);
  const [voiceMeter, setVoiceMeter] = useState<number>(0);

  const safeBundle = useMemo(
    () => bundle || { organs: {} },
    [bundle]
  );

  const organsAttrJson = useMemo(() => {
    const entries = Object.entries(safeBundle?.organs || {}).map(([k, v]: [string, any]) => [
      k,
      { label: v?.label || k, state: v?.state || 'none' },
    ]);
    return JSON.stringify(Object.fromEntries(entries));
  }, [safeBundle]);

  // Apply camera framing (Full standing Twin vs Head & Vocal Tract focus) directly on <mx-patient-twin>
  useEffect(() => {
    const applyFraming = () => {
      const twinEl = stageRef.current?.querySelector('mx-patient-twin') as any;
      if (!twinEl || !twinEl._camT) return false;
      if (framing === 'portrait') {
        if (twinEl._root) {
          twinEl._root.rotation.set(0, 0, 0);
        }
        twinEl._vel = 0;
        twinEl._turnTarget = null;
        twinEl._camT.x = 0;
        twinEl._camT.y = 1.18;
        twinEl._camT.z = Math.max(2.15, (twinEl._fit || 7) * 0.37);
        twinEl._zoomed = true;
      } else {
        twinEl.resetView?.();
      }
      return true;
    };

    if (!applyFraming()) {
      const timer = window.setTimeout(applyFraming, 160);
      return () => window.clearTimeout(timer);
    }
  }, [framing, resetCount]);

  // Live subsurface skin calibration & real-time speech resonance on <mx-patient-twin>
  const liveRef = useRef({
    faceProfile,
    personalWarmth,
    isSpeaking,
    conversationState,
    cadenceWpm,
    getAudioLevel,
  });
  liveRef.current = {
    faceProfile,
    personalWarmth,
    isSpeaking,
    conversationState,
    cadenceWpm,
    getAudioLevel,
  };

  useEffect(() => {
    let rafId = 0;
    let lastUiMeterCommit = 0;
    const startMs = performance.now();

    const tick = (now: number) => {
      rafId = window.requestAnimationFrame(tick);
      const st = liveRef.current;
      const twinEl = stageRef.current?.querySelector('mx-patient-twin') as any;

      const activeVoice =
        st.isSpeaking || st.conversationState === 'speaking' || st.conversationState === 'listening';

      let level = 0;
      if (activeVoice) {
        const measured = st.getAudioLevel ? st.getAudioLevel() : 0;
        if (measured > 0.02) {
          level = Math.min(1, measured * 1.45);
        } else if (st.isSpeaking || st.conversationState === 'speaking') {
          level = computeSyntheticSpeechMouthOpen((now - startMs) / 1000, st.cadenceWpm) * 0.82;
        } else {
          level = 0.16 + 0.12 * Math.sin(now / 210);
        }
      }

      if (now - lastUiMeterCommit > 65) {
        lastUiMeterCommit = now;
        setVoiceMeter((prev) => (Math.abs(prev - level) > 0.025 ? level : prev));
      }

      if (!twinEl || !twinEl._skinMat?.uniforms) return;
      const u = twinEl._skinMat.uniforms;

      if (st.faceProfile && st.personalWarmth) {
        const skinRgb = parseHexRgb01(st.faceProfile.skin_tone_hex, [0.84, 0.65, 0.54]);
        const warmCore = mixRgb(CLINICAL_CORE_RGB, skinRgb, 0.24);
        const warmEdge = mixRgb(CLINICAL_EDGE_RGB, skinRgb, 0.34);
        u.cCore?.value?.setRGB(warmCore[0], warmCore[1], warmCore[2]);
        u.cEdge?.value?.setRGB(warmEdge[0], warmEdge[1], warmEdge[2]);
        if (u.uCore) u.uCore.value = 0.1 + level * 0.05;
        if (u.uEdge) u.uEdge.value = 0.76 + level * 0.14;
      } else {
        u.cCore?.value?.setRGB(CLINICAL_CORE_RGB[0], CLINICAL_CORE_RGB[1], CLINICAL_CORE_RGB[2]);
        u.cEdge?.value?.setRGB(CLINICAL_EDGE_RGB[0], CLINICAL_EDGE_RGB[1], CLINICAL_EDGE_RGB[2]);
        if (u.uCore) u.uCore.value = 0.025 + level * 0.04;
        if (u.uEdge) u.uEdge.value = 0.7 + level * 0.14;
      }

      if (u.uSel) {
        u.uSel.value = activeVoice ? 0.14 + level * 0.48 : 0;
      }

      // Pulse anatomical vocal-tract / larynx halo at (0, 1.13, 0.05) while speaking or listening
      const vocalHalo = twinEl._halos?.thyroid;
      if (vocalHalo && activeVoice) {
        vocalHalo.visible = true;
        vocalHalo.scale.setScalar(1.05 + level * 0.95);
        if (vocalHalo.material) {
          vocalHalo.material.color?.setHex(0x05b7b9);
          vocalHalo.material.opacity = 0.16 + level * 0.32;
        }
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const toggleLayer = (layer: TwinLayer) => {
    setLayers((prev) =>
      prev.includes(layer)
        ? prev.length > 1
          ? prev.filter((l) => l !== layer)
          : prev
        : [...prev, layer]
    );
  };

  const isVoiceActive =
    isSpeaking || conversationState === 'speaking' || conversationState === 'listening';

  const statusText = processingStage
    ? processingStage
    : conversationState === 'listening'
      ? 'Listening to your voice…'
      : conversationState === 'thinking'
        ? 'Thinking…'
        : isSpeaking || conversationState === 'speaking'
          ? `Speaking as ${patientName}…`
          : faceProfile
            ? `3D likeness calibrated · ${convergencePct}% preserved`
            : `${stageLabel} · ${convergencePct}% preserved`;

  const selectedOrganData = selectedOrgan ? safeBundle?.organs?.[selectedOrgan] : null;

  return (
    <div
      ref={stageRef}
      className={`twin-view mx-preserve-twin-view${compact ? ' is-compact' : ''}`}
      data-testid="preserve-3d-stage"
      data-framing={framing}
      data-has-likeness={faceProfile ? 'true' : 'false'}
    >
      {PatientTwin3D ? (
        <PatientTwin3D
          bundle={safeBundle}
          selected={selectedOrgan}
          onSelect={(org: string | null) => setSelectedOrgan(org)}
          side={side}
          layers={layers.join(',')}
          focus={null}
          reset={resetCount}
        />
      ) : (
        React.createElement('mx-patient-twin', {
          organs: organsAttrJson,
          layers: layers.join(','),
          role: 'img',
          'aria-label': `${patientName}'s 3D twin`,
          style: { display: 'block', width: '100%', height: '100%' },
        })
      )}

      {/* Preserved Portrait Medallion — crisp human likeness without uncanny 3D decal distortion */}
      {portraitDataUrl && (
        <button
          type="button"
          className={`mx-stage-portrait-dock${isVoiceActive ? ' is-speaking' : ''}`}
          onClick={() => setFraming((f) => (f === 'portrait' ? 'full' : 'portrait'))}
          title={framing === 'portrait' ? 'Show full 3D twin' : 'Focus head & voice tract'}
          aria-label={
            framing === 'portrait'
              ? `${patientName} portrait likeness — tap for full body`
              : `${patientName} portrait likeness — tap to focus head`
          }
        >
          <span className="mx-stage-portrait-ring-wrap">
            <img
              src={portraitDataUrl}
              alt={`${patientName} preserved portrait`}
              referrerPolicy="no-referrer"
              className="mx-stage-portrait-img"
            />
            {isVoiceActive && <span className="mx-stage-portrait-pulse" aria-hidden="true" />}
          </span>
          <span className="mx-stage-portrait-meta">
            <b>{patientName}</b>
            <small>
              {faceProfile ? `${faceProfile.likeness_score}% match` : 'Portrait saved'}
            </small>
          </span>
        </button>
      )}

      {/* Top-left Layers button — identical to #/twin */}
      <button
        type="button"
        className="twin-ic twin-layers"
        onClick={() => setLayersOpen((v) => !v)}
        aria-expanded={layersOpen}
        aria-label="View & layers"
        title="Layers"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3l9 5-9 5-9-5 9-5z" />
          <path d="M3 13l9 5 9-5" />
        </svg>
      </button>

      {/* Top-right Reset / Head-Focus toggle — matches #/twin */}
      <button
        type="button"
        className="twin-ic twin-reset"
        onClick={() => {
          if (framing === 'portrait') {
            setFraming('full');
            setResetCount((c) => c + 1);
            setSide('front');
            setSelectedOrgan(null);
          } else {
            setFraming('portrait');
          }
        }}
        aria-label={framing === 'portrait' ? 'Reset full body view' : 'Focus head & voice'}
        title={framing === 'portrait' ? 'Reset full body view' : 'Focus head & voice'}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {framing === 'portrait' ? (
            <>
              <path d="M4 12a8 8 0 1 0 2.3-5.6L4 8.5" />
              <path d="M4 4v4.5h4.5" />
            </>
          ) : (
            <>
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4 4" />
            </>
          )}
        </svg>
      </button>

      {layersOpen && (
        <div className="layer-pop" role="group" aria-label="Twin view options">
          {LAYER_LABELS.map(([key, label]) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={layers.includes(key)}
                onChange={() => toggleLayer(key)}
              />
              <span>{label}</span>
            </label>
          ))}
          {faceProfile && (
            <label>
              <input
                type="checkbox"
                checked={personalWarmth}
                onChange={(e) => setPersonalWarmth(e.target.checked)}
              />
              <span>Personal skin warmth</span>
            </label>
          )}
          <div className="seg sm" style={{ marginTop: 6 }}>
            <button
              type="button"
              className={side === 'front' ? 'on' : ''}
              onClick={() => setSide('front')}
            >
              Front
            </button>
            <button
              type="button"
              className={side === 'back' ? 'on' : ''}
              onClick={() => setSide('back')}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Tapped organ status chip */}
      {selectedOrganData && (
        <div className="mx-stage-organ-pill" role="status">
          <span>
            <b>{selectedOrganData.label}</b>
            {selectedOrganData.summary ? ` · ${selectedOrganData.summary}` : ''}
          </span>
          <button
            type="button"
            className="link"
            onClick={() => setSelectedOrgan(null)}
            aria-label="Close organ summary"
          >
            ✕
          </button>
        </div>
      )}

      {/* Bottom-left live status & vocal waveform key */}
      <div className="twin-key mx-stage-live-key" aria-live="polite">
        {isVoiceActive && (
          <span className="mx-live-wave-bars" aria-hidden="true">
            {[0.55, 1.0, 0.78, 0.92, 0.6].map((w, idx) => (
              <i
                key={idx}
                style={{
                  height: `${Math.round(5 + Math.max(0.18, voiceMeter) * 13 * w)}px`,
                }}
              />
            ))}
          </span>
        )}
        <span>{statusText}</span>
      </div>

      {/* Optional bottom-right action button (e.g. Speak button on Preserve) */}
      {stageActionSlot}
    </div>
  );
}
