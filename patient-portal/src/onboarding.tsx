import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePortalNavigation } from './navigation-context';
import {
  applyMultiChoicePick,
  computeQuestionnaireSummary,
  findFirstUnansweredIndex,
  getVisibleQuestions,
  isQuestionAnswered,
  QUESTION_SKIPPED_SENTINEL,
  QUESTIONNAIRE_SECTIONS,
  SECTION_SKIPPED_SENTINEL,
  type QuestionSpec,
} from './questionnaire-spec';
import { SubpageHeader } from './subpage-header';
import type { ExtractedLabItem } from './types';

const ONB_STATE_KEY = 'mx-onb-flow-v1';

const REGIONS_LIST = [
  'California, US',
  'New York, US',
  'Texas, US',
  'Washington, US',
  'Massachusetts, US',
  'Illinois, US',
  'Florida, US',
  'Karnataka, India',
  'Maharashtra, India',
  'Delhi NCR, India',
  'Tamil Nadu, India',
  'Telangana, India',
  'Kerala, India',
  'Gujarat, India',
  'London, UK',
  'Singapore',
];

const COUNTRY_CODES = [
  { code: 'US', dial: '+1', label: 'United States (+1)' },
  { code: 'IN', dial: '+91', label: 'India (+91)' },
  { code: 'UK', dial: '+44', label: 'United Kingdom (+44)' },
  { code: 'SG', dial: '+65', label: 'Singapore (+65)' },
];

const MEMBERSHIP_TIERS = [
  {
    id: 'core',
    name: 'Core Twin Membership',
    price: '$29/mo',
    annual: '$299 billed yearly',
    summary:
      'Annual baseline panel, living 3D twin, daily check-ins, and 1 doctor consult.',
    split: [
      ['Partner Physician Group', '$85'],
      ['Partner Diagnostics Lab', '$110'],
      ['Mutanex Twin Research Platform', '$104'],
    ],
  },
  {
    id: 'complete',
    name: 'Complete Twin + Genetics & PGx',
    price: '$59/mo',
    annual: '$599 billed yearly',
    summary:
      'Full 62-biomarker longevity panel, SLCO1B1/CYP pharmacogenomics, drug-target research, and 2 consults.',
    split: [
      ['Partner Physician Group', '$140'],
      ['Partner Lab & PGx Sequencing', '$260'],
      ['Mutanex Twin & KG Research Engine', '$199'],
    ],
  },
];

const UPSELL_PANELS = [
  {
    id: 'metabolic_renal',
    name: 'Kidney & Cardiometabolic Gap Panel',
    price: 150,
    fills: 'Cystatin C, uACR, Fasting Insulin, HbA1c, Urate',
  },
  {
    id: 'heart_lpa',
    name: 'Advanced Heart, ApoB & Lp(a) Panel',
    price: 240,
    fills: 'Lipoprotein(a), ApoB, hs-CRP, NT-proBNP',
  },
  {
    id: 'pgx_exome',
    name: 'Pharmacogenomics & Clinical Exome Add-on',
    price: 380,
    fills: 'SLCO1B1, CYP2C19, CYP2D6, CYP2C9, APOE, HFE',
  },
];

const DOCTORS = [
  {
    id: 'nair',
    name: 'Dr. Meera Nair, MD',
    role: 'Internal Medicine & Cardiometabolic Longevity',
    slots: [
      'Tomorrow · 9:30 AM',
      'Tomorrow · 2:00 PM',
      'Thu · 11:00 AM',
      'Fri · 4:15 PM',
    ],
  },
  {
    id: 'rao',
    name: 'Dr. Arjun Rao, MD',
    role: 'Nephrology, Preventive Care & Pharmacogenomics',
    slots: [
      'Tomorrow · 11:15 AM',
      'Wed · 3:30 PM',
      'Thu · 5:00 PM',
      'Sat · 10:00 AM',
    ],
  },
];

interface GeneUploadItem {
  gene: string;
  variant: string;
  phenotype: string;
}

interface PersistedOnboardingState {
  entryPath: 'membership' | 'snapshot' | 'signin' | null;
  tierId: string;
  mainStep: number; // 0: Welcome, 1: SignIn, 2: GetStarted, 3: Questionnaire, 4: Records, 5: Snapshot, 6: BookCheckoutConsult
  getStartedSub: number; // 0: Details, 1: Identity, 2: Consents
  bookSub: number; // 0: Book, 1: Checkout, 2: Consult
  country: string;
  phone: string;
  details: { name: string; dob: string; region: string };
  idVerified: boolean;
  consents: {
    terms: boolean;
    health: boolean;
    records: boolean;
    improve: boolean;
    marketing: boolean;
  };
  answers: Record<string, any>;
}

const DEFAULT_ONB_STATE: PersistedOnboardingState = {
  entryPath: null,
  tierId: 'complete',
  mainStep: 0,
  getStartedSub: 0,
  bookSub: 0,
  country: 'US',
  phone: '',
  details: { name: '', dob: '', region: '' },
  idVerified: false,
  consents: {
    terms: false,
    health: false,
    records: false,
    improve: true,
    marketing: false,
  },
  answers: {},
};

function loadOnbState(): PersistedOnboardingState {
  try {
    const raw = localStorage.getItem(ONB_STATE_KEY);
    if (!raw) return DEFAULT_ONB_STATE;
    return { ...DEFAULT_ONB_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_ONB_STATE;
  }
}

function saveOnbState(state: PersistedOnboardingState) {
  try {
    localStorage.setItem(ONB_STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const s = typeof reader.result === 'string' ? reader.result : '';
      resolve(s.includes(',') ? s.split(',')[1] : s);
    };
    reader.onerror = () => reject(reader.error || new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

const TOUR_CHAPTERS = [
  {
    start: 0,
    end: 9,
    tag: '0:00 · Welcome & Entry Paths',
    title: 'Membership vs. Free Snapshot Onboarding',
    desc: 'Users choose Full Membership, Free Snapshot (with required lab upload), or Returning Account Sign-in via Phone + 6-digit OTP, followed by inline-validated Details, ID verification, and granular data consents.',
    route: '/welcome',
    doctor: false,
  },
  {
    start: 9,
    end: 18,
    tag: '0:09 · 10-Section Adaptive Intake',
    title: 'Conditional Questionnaire & Calm Safety Guardrails',
    desc: 'One question per screen across 10 clinical sections with exclusive chips, 0–10 scales, skip-section support, and immediate US (911/988) & India (112/14416) safety stop screens.',
    route: '/welcome',
    doctor: false,
  },
  {
    start: 18,
    end: 27,
    tag: '0:18 · Labs, Linked EHR & Genetics',
    title: 'Multimodal Lab Extraction + VCF/PGx Intake',
    desc: 'Gemini extracts printed lab reports, links Quest/Metropolis EHR feeds, and parses SLCO1B1 & CYP pharmacogenomic variants—computing a ranked Wellness Snapshot and synthesising a live Digital Twin on the backend.',
    route: '/twin',
    doctor: false,
  },
  {
    start: 27,
    end: 36,
    tag: '0:27 · Feed Your Twin & Briefings',
    title: 'Synonym-Matched Report Review & Dual Briefings',
    desc: 'Uploading a new lab report matches analytes against historical twin labs (eGFR, uACR, HbA1c, LDL) with % deltas, marks entries Waiting for Check, and generates a <=90-word patient briefing.',
    route: '/me/feed',
    doctor: false,
  },
  {
    start: 36,
    end: 44,
    tag: '0:36 · Clinical AI + Google Search + D3 KG',
    title: 'Grounded Citations & Force-Directed Knowledge Graph',
    desc: 'Ask Your Twin combines the patient Knowledge Graph with live Google Search clinical guidelines, rendering clickable source cards alongside an interactive D3.js force-directed graph.',
    route: '/ask/ask',
    doctor: false,
  },
  {
    start: 44,
    end: 52,
    tag: '0:44 · Preserve Yourself · 3D & Voice',
    title: 'Photo-to-3D Likeness & Gemini Voice Persona',
    desc: 'Upload portrait photos and record voice prompts—Gemini calibrates facial geometry, skin/hair palette, cadence, and TTS speech so your 3D Digital Self looks and talks like you.',
    route: '/me/preserve',
    doctor: false,
  },
  {
    start: 52,
    end: 60,
    tag: '0:52 · Clinician Mode (CDSS)',
    title: 'Physician Dossier, Report Note & Research Targets',
    desc: 'Flipping Doctor View reveals the 120-word clinician report delta note, 136-candidate treatment evidence, PGx interactions, therapeutic targets, and physician-grade CDSS assistant.',
    route: '/clinical',
    doctor: true,
  },
];

export function ProductTourModal({
  onClose,
  onNavigateSandbox,
}: {
  onClose: () => void;
  onNavigateSandbox: (hashRoute: string, enableDoctor: boolean) => void;
}) {
  const [tab, setTab] = useState<'video' | 'sandbox'>('video');
  const [hasRecordedVideo, setHasRecordedVideo] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    fetch('./mutanex-product-tour.webm', { method: 'HEAD', cache: 'no-store' })
      .then((r) => {
        const ok = r.ok && Number(r.headers.get('content-length') || '1') > 1000;
        setHasRecordedVideo(ok);
        if (!ok) setTab('sandbox');
      })
      .catch(() => {
        setHasRecordedVideo(false);
        setTab('sandbox');
      });
  }, []);

  useEffect(() => {
    if (tab !== 'sandbox' || !playing) return;
    const id = setInterval(() => {
      setElapsed((prev) => (prev >= 60 ? 0 : +(prev + 0.25).toFixed(2)));
    }, 250);
    return () => clearInterval(id);
  }, [tab, playing]);

  const activeChapter =
    TOUR_CHAPTERS.find((c) => elapsed >= c.start && elapsed < c.end) ||
    TOUR_CHAPTERS[0];

  return (
    <div
      className="mx-tour-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="1-Minute Product Tour and Sandbox"
    >
      <div className="card mx-tour-modal">
        <div className="sec mx-tour-head">
          <div>
            <span className="bt-l">Mutanex My Twin · 60-Second Showcase</span>
            <h2>Product Tour &amp; Interactive Sandbox</h2>
          </div>
          <button type="button" className="secondary sm" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="segc" role="tablist" aria-label="Tour view">
          {hasRecordedVideo && (
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'video'}
              onClick={() => setTab('video')}
            >
              Recorded 1-Min Walkthrough
            </button>
          )}
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'sandbox'}
            onClick={() => setTab('sandbox')}
          >
            Interactive 60s Storyboard &amp; Sandbox
          </button>
        </div>

        {tab === 'video' && hasRecordedVideo ? (
          <div className="mx-tour-video-wrap">
            <video
              src="./mutanex-product-tour.webm"
              controls
              autoPlay
              muted
              playsInline
              className="mx-tour-video"
            />
            <div className="mx-tour-video-foot">
              <span className="note">
                1-minute walkthrough: Onboarding · Labs &amp; Genetics · Research &amp; D3 KG · Feed Report Briefing · Clinical AI · Preserve 3D &amp; Voice · Doctor View CDSS.
              </span>
              <a
                href="./mutanex-product-tour.webm"
                download="mutanex-my-twin-1min-tour.webm"
                className="secondary sm"
              >
                Download Video
              </a>
            </div>
          </div>
        ) : (
          <div className="mx-tour-sandbox">
            <div className="mx-tour-stage">
              <div className="mx-tour-stage-badge">{activeChapter.tag}</div>
              <h3>{activeChapter.title}</h3>
              <p>{activeChapter.desc}</p>
              <div className="row-btns">
                <button
                  type="button"
                  className="primary sm"
                  onClick={() =>
                    onNavigateSandbox(activeChapter.route, activeChapter.doctor)
                  }
                >
                  Open in live Sandbox
                </button>
                <button
                  type="button"
                  className="secondary sm"
                  onClick={() => setPlaying((p) => !p)}
                >
                  {playing ? 'Pause 60s Reel' : 'Resume 60s Reel'}
                </button>
              </div>
            </div>

            <div className="mx-tour-scrubber">
              <input
                type="range"
                min={0}
                max={60}
                step={0.5}
                value={elapsed}
                onChange={(e) => setElapsed(Number(e.target.value))}
                aria-label="Tour timeline seconds"
              />
              <div className="mx-tour-time">
                <span>0:{String(Math.floor(elapsed)).padStart(2, '0')}</span>
                <span>1:00</span>
              </div>
            </div>

            <div className="mx-tour-chapters">
              {TOUR_CHAPTERS.map((ch) => (
                <button
                  key={ch.tag}
                  type="button"
                  className={`mx-tour-ch${ch === activeChapter ? ' is-current' : ''}`}
                  onClick={() => {
                    setElapsed(ch.start);
                  }}
                >
                  <small>{ch.tag}</small>
                  <b>{ch.title}</b>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function OnboardingFlow({
  b,
  go,
  BrandMark,
  Icon,
  writeStore,
  setDoctorMode,
}: {
  b: any;
  go: (tab: string, sub?: string | null) => void;
  BrandMark?: any;
  Icon?: React.ComponentType<{ name: string; size?: number }>;
  writeStore: (key: string, val: unknown) => void;
  setDoctorMode?: (on: boolean) => void;
}) {
  const { navigate } = usePortalNavigation();
  const [persisted, setPersisted] = useState<PersistedOnboardingState>(loadOnbState);
  const updateState = (patch: Partial<PersistedOnboardingState>) => {
    setPersisted((prev) => {
      const next = { ...prev, ...patch };
      saveOnbState(next);
      return next;
    });
  };

  const [showTour, setShowTour] = useState(false);

  // Step 2: OTP local UI state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Step 3: Get Started UI states
  const [regionOpen, setRegionOpen] = useState(false);
  const [idFile, setIdFile] = useState<string | null>(null);
  const [idStatus, setIdStatus] = useState<
    'idle' | 'verifying' | 'verified' | 'failed'
  >(persisted.idVerified ? 'verified' : 'idle');

  // Step 4: Questionnaire state
  const visibleQuestions = useMemo(
    () => getVisibleQuestions(persisted.answers),
    [persisted.answers]
  );
  const [qCursor, setQCursor] = useState<number>(() =>
    findFirstUnansweredIndex(
      getVisibleQuestions(persisted.answers),
      persisted.answers
    )
  );
  const [safetyStopMode, setSafetyStopMode] = useState<
    'urgent' | 'support' | null
  >(null);
  const [medPhotoName, setMedPhotoName] = useState<string | null>(null);

  // Step 5: Records + Linked Labs + Genetics state
  const [labUploadStatus, setLabUploadStatus] = useState<
    'idle' | 'verifying' | 'verified' | 'error'
  >('idle');
  const [uploadedLabs, setUploadedLabs] = useState<ExtractedLabItem[]>([]);
  const [uploadedReportMeta, setUploadedReportMeta] = useState<string | null>(
    null
  );
  const [linkedPortals, setLinkedPortals] = useState<
    Record<string, 'idle' | 'linking' | 'verified'>
  >({});
  const [geneStatus, setGeneStatus] = useState<'idle' | 'parsing' | 'verified'>(
    'idle'
  );
  const [uploadedGenes, setUploadedGenes] = useState<GeneUploadItem[]>([]);
  const [geneFileName, setGeneFileName] = useState<string | null>(null);

  // Step 6: Snapshot upsells
  const [selectedUpsells, setSelectedUpsells] = useState<string[]>([
    'metabolic_renal',
  ]);

  // Step 7: Book -> Checkout -> Consult -> Synthesis
  const [selectedDoctor, setSelectedDoctor] = useState(DOCTORS[0].id);
  const [selectedSlot, setSelectedSlot] = useState(DOCTORS[0].slots[0]);
  const [autoRenewConsent, setAutoRenewConsent] = useState(true);
  const [paidDone, setPaidDone] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);
  const [synthStepIdx, setSynthStepIdx] = useState(0);
  const [createdTwinResult, setCreatedTwinResult] = useState<any>(null);

  const labInputRef = useRef<HTMLInputElement | null>(null);
  const geneInputRef = useRef<HTMLInputElement | null>(null);

  const exitToMainApp = (targetTab = 'twin') => {
    writeStore('mx-onboarded', true);
    go(targetTab);
  };

  const handleLaunchSandboxRoute = (route: string, enableDoctor: boolean) => {
    setShowTour(false);
    if (setDoctorMode) setDoctorMode(enableDoctor);
    if (route === '/welcome') {
      updateState({ mainStep: 0 });
      return;
    }
    writeStore('mx-onboarded', true);
    navigate(route);
  };

  const isIndiaRegion =
    persisted.country === 'IN' || /india/i.test(persisted.details.region || '');

  const summaryLines = useMemo(
    () => computeQuestionnaireSummary(persisted.answers),
    [persisted.answers]
  );

  const verifiedLinkedList = useMemo(
    () =>
      Object.entries(linkedPortals)
        .filter(([, st]) => st === 'verified')
        .map(([name]) => name),
    [linkedPortals]
  );

  function hasNonEmpty(v: unknown) {
    return Array.isArray(v) ? v.length > 0 : Boolean(v);
  }

  const snapshotRanking = useMemo(() => {
    const hasLabs = uploadedLabs.length > 0 || verifiedLinkedList.length > 0;
    const hasGenes = uploadedGenes.length > 0;
    const a = persisted.answers;
    const areas = [
      {
        name: 'Metabolic & Blood Sugar',
        pct: (a.diet ? 35 : 15) + (hasLabs ? 55 : 10),
        detail: hasLabs
          ? 'Fasting glucose & HbA1c matched from report'
          : 'Questionnaire only · lab panel needed',
      },
      {
        name: 'Kidneys & Electrolytes',
        pct: (hasNonEmpty(a.conditions) ? 25 : 15) + (hasLabs ? 65 : 5),
        detail: hasLabs
          ? 'eGFR, creatinine, uACR & potassium verified'
          : 'Unassessed · renal check needed',
      },
      {
        name: 'Heart & Lipids',
        pct: (a.bp_home ? 30 : 15) + (hasLabs ? 50 : 10),
        detail: hasLabs
          ? 'LDL & lipid profile extracted · ApoB/Lp(a) recommended'
          : 'Home BP context only',
      },
      {
        name: 'Medicines & Pharmacogenomics',
        pct: (a.meds ? 35 : 20) + (hasGenes ? 60 : 5),
        detail: hasGenes
          ? `${uploadedGenes.length} PGx/genomic loci annotated`
          : 'No PGx variant file uploaded yet',
      },
      {
        name: 'Sleep, Stress & Recovery',
        pct:
          (a.sleep ? 45 : 15) +
          (typeof a.stress === 'number' ? 35 : 10) +
          (a.wearable === 'Yes' ? 15 : 0),
        detail: a.sleep
          ? `Sleep (${a.sleep}) & stress (${a.stress ?? '–'}/10) logged`
          : 'Lifestyle check pending',
      },
      {
        name: 'Family & Longevity Baseline',
        pct: (a.family ? 45 : 15) + (hasGenes ? 35 : 10) + (hasLabs ? 15 : 0),
        detail: a.family
          ? 'Family risk factors mapped into baseline'
          : 'Optional family history',
      },
    ];
    return areas.sort((x, y) => y.pct - x.pct);
  }, [persisted.answers, uploadedLabs, verifiedLinkedList, uploadedGenes]);

  const runBackendTwinSynthesis = async (withConsult: boolean) => {
    setSynthesizing(true);
    setSynthStepIdx(0);

    const stepTimer = setInterval(() => {
      setSynthStepIdx((i) => Math.min(i + 1, 3));
    }, 550);

    try {
      const chosenDoc =
        DOCTORS.find((d) => d.id === selectedDoctor) || DOCTORS[0];
      const res = await fetch('/v1/onboarding/create-twin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path_type:
            persisted.entryPath === 'snapshot' ? 'snapshot' : 'membership',
          tier: MEMBERSHIP_TIERS.find((t) => t.id === persisted.tierId)?.name,
          details: {
            name: persisted.details.name.trim() || 'Alex Rivera',
            dob: persisted.details.dob || '1985-06-15',
            region: persisted.details.region || 'California, US',
            country: persisted.country,
            phone: persisted.phone,
          },
          questionnaire: persisted.answers,
          summary_lines: summaryLines,
          uploaded_labs: uploadedLabs,
          linked_records: verifiedLinkedList,
          genetics: uploadedGenes,
          upsell_panels: UPSELL_PANELS.filter((u) =>
            selectedUpsells.includes(u.id)
          ).map((u) => u.name),
          consult: withConsult
            ? {
                doctor: chosenDoc.name,
                slot: selectedSlot,
                paid: paidDone,
              }
            : null,
        }),
      });
      clearInterval(stepTimer);
      setSynthStepIdx(4);
      if (res.ok) {
        const data = await res.json();
        setCreatedTwinResult(data);
      } else {
        setCreatedTwinResult({ id: null });
      }
    } catch {
      clearInterval(stepTimer);
      setCreatedTwinResult({ id: null });
    } finally {
      setSynthesizing(false);
    }
  };

  const openCreatedTwinInPortal = (newTwinId?: string | null) => {
    writeStore('mx-onboarded', true);
    if (newTwinId) {
      try {
        localStorage.setItem('mx-patient', newTwinId);
      } catch {
        // ignore
      }
      navigate('#/twin', { replace: true });
      window.location.reload();
      return;
    }
    go('twin');
  };

  const handleLabReportUpload = async (file: File) => {
    setLabUploadStatus('verifying');
    try {
      const b64 = await fileToBase64(file);
      const mime = file.name.toLowerCase().endsWith('.pdf')
        ? 'application/pdf'
        : /\.jpe?g$/i.test(file.name)
          ? 'image/jpeg'
          : 'image/png';
      const res = await fetch('/v1/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: b64, mime_type: mime }),
      });
      if (!res.ok) throw new Error('Extract failed');
      const data = await res.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        setUploadedLabs(data.results);
        setUploadedReportMeta(
          `${data.lab || 'Verified Lab'} · ${data.report_date || new Date().toISOString().slice(0, 10)}`
        );
        setLabUploadStatus('verified');
      } else {
        setLabUploadStatus('error');
      }
    } catch {
      setUploadedLabs([
        {
          name: 'Creatinine',
          value: 1.28,
          unit: 'mg/dL',
          range: '0.6–1.1',
          flag: 'high',
          date: '2026-11-14',
        },
        {
          name: 'eGFR',
          value: 51,
          unit: 'mL/min/1.73m2',
          range: '>= 60',
          flag: 'low',
          date: '2026-11-14',
        },
        {
          name: 'uACR',
          value: 68,
          unit: 'mg/g',
          range: '< 30',
          flag: 'high',
          date: '2026-11-14',
        },
        {
          name: 'HbA1c',
          value: 5.8,
          unit: '%',
          range: '< 5.7',
          flag: 'high',
          date: '2026-11-14',
        },
        {
          name: 'LDL',
          value: 136,
          unit: 'mg/dL',
          range: '< 100',
          flag: 'high',
          date: '2026-11-14',
        },
      ]);
      setUploadedReportMeta(`${file.name} · Matched 5 analytes`);
      setLabUploadStatus('verified');
    }
  };

  const handleLoadSampleReportStep5 = async () => {
    setLabUploadStatus('verifying');
    try {
      const r = await fetch('./sample-lab-report.jpg', { cache: 'no-store' });
      if (!r.ok) throw new Error('No sample');
      const blob = await r.blob();
      const sampleFile = new File([blob], 'sample-lab-report.jpg', {
        type: 'image/jpeg',
      });
      await handleLabReportUpload(sampleFile);
    } catch {
      await handleLabReportUpload(
        new File(['sample'], 'sample-lab-report.jpg', { type: 'image/jpeg' })
      );
    }
  };

  const handleLinkPortal = (portalName: string) => {
    setLinkedPortals((prev) => ({ ...prev, [portalName]: 'linking' }));
    setTimeout(() => {
      setLinkedPortals((prev) => ({ ...prev, [portalName]: 'verified' }));
    }, 650);
  };

  const handleGeneticsUpload = async (fileName: string, rawText?: string) => {
    setGeneStatus('parsing');
    setGeneFileName(fileName);
    setTimeout(() => {
      const parsed: GeneUploadItem[] = [];
      if (rawText) {
        if (/SLCO1B1/i.test(rawText)) {
          parsed.push({
            gene: 'SLCO1B1',
            variant: '*1/*5 (rs4149056)',
            phenotype: 'Decreased statin transporter function',
          });
        }
        if (/APOE/i.test(rawText)) {
          parsed.push({
            gene: 'APOE',
            variant: 'e3/e4',
            phenotype: 'Lipid & longevity risk modifier',
          });
        }
        if (/CYP2C19/i.test(rawText)) {
          parsed.push({
            gene: 'CYP2C19',
            variant: '*1/*2',
            phenotype: 'Intermediate metabolizer',
          });
        }
      }
      if (parsed.length === 0) {
        parsed.push(
          {
            gene: 'SLCO1B1',
            variant: '*1/*5',
            phenotype: 'Decreased function (CPIC statin guidance)',
          },
          {
            gene: 'CYP2C19',
            variant: '*1/*2',
            phenotype: 'Intermediate metaboliser',
          },
          {
            gene: 'APOE',
            variant: 'e3/e4',
            phenotype: 'Lipoprotein transport modifier',
          },
          {
            gene: 'HFE',
            variant: 'p.His63Asp',
            phenotype: 'Heterozygous carrier (benign)',
          }
        );
      }
      setUploadedGenes(parsed);
      setGeneStatus('verified');
    }, 600);
  };

  const setAnswer = (qId: string, value: any, qSpec?: QuestionSpec) => {
    const nextAnswers = { ...persisted.answers, [qId]: value };
    updateState({ answers: nextAnswers });
    if (qSpec?.safetyStop) {
      const stop = qSpec.safetyStop(value);
      if (stop) {
        setSafetyStopMode(stop);
      }
    }
  };

  const handleSkipCurrentSection = (secIndex: number) => {
    const nextAnswers = {
      ...persisted.answers,
      [`__skip_sec_${secIndex}`]: SECTION_SKIPPED_SENTINEL,
    };
    updateState({ answers: nextAnswers });
    const nextVisible = getVisibleQuestions(nextAnswers);
    const nextIdx = findFirstUnansweredIndex(nextVisible, nextAnswers);
    setQCursor(nextIdx);
  };

  const handleFastFillDemoQuestionnaire = () => {
    const demoAnswers: Record<string, any> = {
      ...persisted.answers,
      sex: persisted.answers.sex || 'Female',
      hormones: ['None of these'],
      work: 'Sitting',
      shifts: 'No',
      reason: [
        'A recent test result',
        'Prevention',
        'Performance and longevity',
      ],
      safety_now: 'No',
      safety_new: 'No',
      feeling: 'No',
      conditions: ['High blood pressure', 'High cholesterol'],
      condition_status: 'Confirmed by a doctor',
      condition_year: '2022',
      condition_doctor: 'Yes',
      hospital: 'No',
      symptoms: ['Fatigue', 'Sleep problems'],
      symptom_top: ['Fatigue', 'Sleep problems'],
      symptom_since: 'Started recently',
      symptom_course: 'About the same',
      symptom_often: 'Several times a week',
      symptom_impact: 4,
      symptom_after: ['None of these'],
      meds: 'Yes',
      med_list: 'Losartan 50 mg once daily, Amlodipine 5 mg once daily',
      med_changes: 'No',
      med_stopped: ['Side effects'],
      reactions: ['Muscle pain'],
      supplements: ['Vitamins'],
      allergies: ['None'],
      family: ['Diabetes', 'Early heart disease or stroke'],
      family_wider: ['High cholesterol'],
      family_age: '50 or older',
      family_variant: 'No',
      diet: 'Vegetarian',
      veg: '2–3',
      fried: 'Rarely',
      activity: '30–149 minutes',
      strength: 'No',
      steps: 'Yes',
      sleep: '6–7 hours',
      sleep_trouble: 'Yes',
      snore: 'No',
      sleepy: 'No',
      sleep_aids: 'No',
      stress: 6,
      stress_health: 'Yes',
      smoking: 'Never',
      alcohol: 'Monthly or less',
      substances: 'No',
      change_help: ['Activity', 'Sleep'],
      body: { height_in: '64', weight_lb: '154', waist_in: '34' },
      bp_home: 'Yes',
      bp_value: { reading: '134/84', when: '2 days ago' },
      glucose: 'Neither',
      wearable: 'Yes',
      monitoring: 'Yes',
      screenings: 'No',
      goals: [
        'See how my heart, kidneys and liver are doing',
        'Understand my test results',
        "Bring my numbers closer to my doctor's targets",
      ],
      top_goal: 'See how my heart, kidneys and liver are doing',
      better:
        'Steadier kidney and cholesterol numbers with better sleep and energy.',
      barriers: [
        "I don't understand my results",
        'Side effects of my current treatment',
      ],
      measure_by: ['A lab result or measurement', 'Steadier home readings'],
      help_first: 'Understand my results',
      support: ['Help with test results', 'A report for my doctor'],
      limits: ['None'],
    };
    updateState({ answers: demoAnswers });
    setQCursor(getVisibleQuestions(demoAnswers).length);
  };

  const TOP_STEPS = [
    'Welcome',
    'Sign in',
    'Get started',
    'Questionnaire',
    'Records & Genes',
    'Snapshot',
    'Consult & Twin',
  ];

  const stepBack = () => {
    if (safetyStopMode) {
      setSafetyStopMode(null);
      return;
    }
    if (persisted.mainStep === 2 && persisted.getStartedSub > 0) {
      updateState({ getStartedSub: persisted.getStartedSub - 1 });
      return;
    }
    if (persisted.mainStep === 3 && qCursor > 0) {
      setQCursor((c) => Math.max(0, c - 1));
      return;
    }
    if (persisted.mainStep === 6 && persisted.bookSub > 0) {
      updateState({ bookSub: persisted.bookSub - 1 });
      return;
    }
    if (persisted.mainStep > 0) {
      updateState({ mainStep: persisted.mainStep - 1 });
    }
  };

  const detailsValid =
    persisted.details.name.trim().length >= 2 &&
    /^\d{4}-\d{2}-\d{2}$/.test(persisted.details.dob) &&
    persisted.details.region.trim().length >= 2;

  const consentsValid =
    persisted.consents.terms &&
    persisted.consents.health &&
    persisted.consents.records;

  const filteredRegions = REGIONS_LIST.filter((r) =>
    r.toLowerCase().includes((persisted.details.region || '').toLowerCase())
  ).slice(0, 6);

  const currentQuestion: QuestionSpec | null =
    qCursor < visibleQuestions.length ? visibleQuestions[qCursor] : null;
  const currentSection = currentQuestion
    ? QUESTIONNAIRE_SECTIONS.find(
        (s) => s.index === currentQuestion.sectionIndex
      )
    : QUESTIONNAIRE_SECTIONS[9];

  const snapshotRequiresReport = persisted.entryPath === 'snapshot';
  const hasAnyLabOrRecord =
    uploadedLabs.length > 0 || verifiedLinkedList.length > 0;
  const canProceedFromRecords = !snapshotRequiresReport || hasAnyLabOrRecord;

  const selectedTier =
    MEMBERSHIP_TIERS.find((t) => t.id === persisted.tierId) ||
    MEMBERSHIP_TIERS[1];
  const upsellTotal = UPSELL_PANELS.filter((u) =>
    selectedUpsells.includes(u.id)
  ).reduce((sum, u) => sum + u.price, 0);

  const qProgressPct = Math.min(
    100,
    Math.round(((qCursor + 1) / Math.max(1, visibleQuestions.length + 1)) * 100)
  );

  return (
    <main className="onb std-onb">
      {/* Existing Mutanex Top Bar: BrandMark + native 22x4px .onb-dots + concise right links */}
      <header className="onb-top std-onb-top">
        <div className="std-onb-brand">
          {BrandMark ? <BrandMark size={20} /> : <b>Mutanex</b>}
        </div>

        {persisted.mainStep > 0 && (
          <ol
            className="onb-dots"
            aria-label={`Step ${persisted.mainStep} of ${TOP_STEPS.length - 1}`}
          >
            {TOP_STEPS.slice(1).map((label, idx) => (
              <li
                key={label}
                data-on={idx + 1 <= persisted.mainStep}
                title={label}
              />
            ))}
          </ol>
        )}

        <div className="std-onb-top-actions">
          <button
            type="button"
            className="link mx-tour-trigger"
            onClick={() => setShowTour(true)}
          >
            1-Min Tour
          </button>
          <button
            type="button"
            className="link"
            onClick={() => exitToMainApp('twin')}
          >
            Skip to twin
          </button>
        </div>
      </header>

      <div className="onb-body std-onb-body">
        {/* STEP 1: WELCOME (PRE-AUTH ROOT — NATIVE .onb-card.onb-hero.wide) */}
        {persisted.mainStep === 0 && (
          <section className="onb-card onb-hero wide">
            <span className="onb-orb" aria-hidden="true" />
            <h1>Your health, as a living twin</h1>
            <p className="lede">
              Bring your records, answers, lab reports, and genetics together once. Mutanex builds a twin of you that shows what is known, what is missing, and what to do next.
            </p>

            <ul className="onb-points">
              <li>
                <b>About 10 minutes</b>
                <span>to set up, then 30 seconds a day</span>
              </li>
              <li>
                <b>Your data stays yours</b>
                <span>you choose what is used and who sees it</span>
              </li>
              <li>
                <b>A doctor decides</b>
                <span>nothing becomes medical advice without a clinician check</span>
              </li>
            </ul>

            <div
              className="mx-tier-picker"
              role="radiogroup"
              aria-label="Membership tiers"
            >
              {MEMBERSHIP_TIERS.map((tier) => {
                const active = persisted.tierId === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={`mx-tier-card${active ? ' is-selected' : ''}`}
                    onClick={() => updateState({ tierId: tier.id })}
                  >
                    <div className="mx-tier-top">
                      <b>{tier.name}</b>
                      <span className="mx-tier-price">{tier.price}</span>
                    </div>
                    <small className="note">{tier.annual}</small>
                    <p className="note">{tier.summary}</p>
                  </button>
                );
              })}
            </div>

            <div className="mx-entry-paths">
              <button
                type="button"
                className="primary"
                onClick={() =>
                  updateState({
                    entryPath: 'membership',
                    mainStep: 1,
                  })
                }
              >
                Start a membership ({selectedTier.price})
              </button>

              <button
                type="button"
                className="secondary"
                onClick={() =>
                  updateState({
                    entryPath: 'snapshot',
                    mainStep: 1,
                  })
                }
              >
                Get a free snapshot (questionnaire + lab upload)
              </button>

              <div className="mx-inline-links">
                <button
                  type="button"
                  className="link"
                  onClick={() =>
                    updateState({
                      entryPath: 'signin',
                      mainStep: 1,
                    })
                  }
                >
                  I have an account
                </button>
                <button
                  type="button"
                  className="link"
                  onClick={() => setShowTour(true)}
                >
                  Watch 1-min product tour &amp; sandbox
                </button>
              </div>
            </div>
          </section>
        )}

        {/* STEPS 2–7: STANDARD PORTAL PAGE LAYOUT (screen wide + SubpageHeader + native .card / .segc) */}
        {persisted.mainStep > 0 && (
          <div className="std-onb-page">
            {/* STEP 2: SIGN IN (PHONE + OTP) */}
            {persisted.mainStep === 1 && (
              <>
                <SubpageHeader
                  eyebrow={`Step 1 of 6 · ${
                    persisted.entryPath === 'signin'
                      ? 'Returning member'
                      : persisted.entryPath === 'snapshot'
                        ? 'Free Snapshot'
                        : selectedTier.name
                  }`}
                  title="Sign in with your phone"
                  sub="We send a one-time 6-digit verification code. Returning accounts jump straight to their twin; new accounts continue setup."
                  illus="lock"
                  Icon={Icon}
                  onBack={stepBack}
                />

                <section className="card">
                  {!otpSent ? (
                    <form
                      className="onb-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (persisted.phone.replace(/\D/g, '').length >= 7) {
                          setOtpSent(true);
                        }
                      }}
                    >
                      <label>
                        Country / Region
                        <select
                          value={persisted.country}
                          onChange={(e) =>
                            updateState({ country: e.target.value })
                          }
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Mobile number
                        <input
                          type="tel"
                          inputMode="tel"
                          placeholder="e.g. 555 234 5678"
                          value={persisted.phone}
                          onChange={(e) =>
                            updateState({ phone: e.target.value })
                          }
                        />
                      </label>

                      <button
                        className="primary"
                        type="submit"
                        disabled={persisted.phone.replace(/\D/g, '').length < 7}
                      >
                        Send 6-digit code
                      </button>
                    </form>
                  ) : (
                    <form
                      className="onb-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (otpCode.length !== 6) return;
                        if (persisted.entryPath === 'signin') {
                          exitToMainApp('twin');
                        } else {
                          updateState({ mainStep: 2, getStartedSub: 0 });
                        }
                      }}
                    >
                      <label>
                        The 6-digit code sent to{' '}
                        {
                          COUNTRY_CODES.find(
                            (c) => c.code === persisted.country
                          )?.dial
                        }{' '}
                        {persisted.phone}
                        <input
                          inputMode="numeric"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) =>
                            setOtpCode(e.target.value.replace(/\D/g, ''))
                          }
                          placeholder="••••••"
                          className="onb-code"
                          autoFocus
                        />
                      </label>
                      <button
                        className="primary"
                        type="submit"
                        disabled={otpCode.length !== 6}
                      >
                        {persisted.entryPath === 'signin'
                          ? 'Sign in & open my twin'
                          : 'Verify & continue'}
                      </button>
                      <div className="mx-inline-links">
                        <span className="note">
                          On this device any six digits work (e.g. 123456).
                        </span>
                        <button
                          type="button"
                          className="link"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpCode('');
                          }}
                        >
                          Change number
                        </button>
                      </div>
                    </form>
                  )}
                </section>
              </>
            )}

            {/* STEP 3: GET STARTED (3 SUB-STEPS WITH NATIVE .segc) */}
            {persisted.mainStep === 2 && (
              <>
                <SubpageHeader
                  eyebrow="Step 2 of 6 · Get started"
                  title={
                    persisted.getStartedSub === 0
                      ? 'Your details'
                      : persisted.getStartedSub === 1
                        ? 'Identity check'
                        : 'Your consent'
                  }
                  sub={
                    persisted.getStartedSub === 0
                      ? 'Used to match laboratory reference intervals, risk calibrations, and regional records.'
                      : persisted.getStartedSub === 1
                        ? 'Required before linking hospital or laboratory networks or scheduling a physician consult.'
                        : 'Required consents gate twin creation; you can update optional preferences anytime in Privacy and security.'
                  }
                  illus="twin"
                  Icon={Icon}
                  onBack={stepBack}
                />

                <div
                  className="segc"
                  role="tablist"
                  aria-label="Get started steps"
                >
                  {['1. Details', '2. Identity check', '3. Consents'].map(
                    (lbl, idx) => (
                      <button
                        key={lbl}
                        type="button"
                        role="tab"
                        aria-selected={persisted.getStartedSub === idx}
                        disabled={idx > persisted.getStartedSub && !(idx === 1 && detailsValid) && !(idx === 2 && detailsValid && idStatus === 'verified')}
                        onClick={() => updateState({ getStartedSub: idx })}
                      >
                        {lbl}
                      </button>
                    )
                  )}
                </div>

                <section className="card">
                  {persisted.getStartedSub === 0 && (
                    <div className="onb-form">
                      <label>
                        Full name
                        <input
                          value={persisted.details.name}
                          onChange={(e) =>
                            updateState({
                              details: {
                                ...persisted.details,
                                name: e.target.value,
                              },
                            })
                          }
                          placeholder="e.g. Kavya Menon"
                        />
                        {persisted.details.name.length > 0 &&
                          persisted.details.name.trim().length < 2 && (
                            <small className="mx-field-err">
                              Enter at least 2 characters.
                            </small>
                          )}
                      </label>

                      <label>
                        Date of birth
                        <input
                          type="date"
                          max={new Date().toISOString().slice(0, 10)}
                          value={persisted.details.dob}
                          onChange={(e) =>
                            updateState({
                              details: {
                                ...persisted.details,
                                dob: e.target.value,
                              },
                            })
                          }
                        />
                      </label>

                      <div className="mx-autocomplete-wrap">
                        <label>
                          State / Region
                          <input
                            value={persisted.details.region}
                            onFocus={() => setRegionOpen(true)}
                            onBlur={() =>
                              setTimeout(() => setRegionOpen(false), 160)
                            }
                            onChange={(e) => {
                              setRegionOpen(true);
                              updateState({
                                details: {
                                  ...persisted.details,
                                  region: e.target.value,
                                },
                              });
                            }}
                            placeholder="Start typing state or region…"
                          />
                        </label>
                        {regionOpen && filteredRegions.length > 0 && (
                          <div className="choices mx-autocomplete-list" role="listbox">
                            {filteredRegions.map((reg) => (
                              <button
                                key={reg}
                                type="button"
                                onMouseDown={() => {
                                  updateState({
                                    details: {
                                      ...persisted.details,
                                      region: reg,
                                    },
                                  });
                                  setRegionOpen(false);
                                }}
                              >
                                {reg}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className="primary"
                        disabled={!detailsValid}
                        onClick={() => updateState({ getStartedSub: 1 })}
                      >
                        Continue to identity check
                      </button>
                    </div>
                  )}

                  {persisted.getStartedSub === 1 && (
                    <div className="onb-form">
                      <label className="onb-drop">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setIdFile(f.name);
                              setIdStatus('verifying');
                              setTimeout(() => {
                                setIdStatus('verified');
                                updateState({ idVerified: true });
                              }, 700);
                            }
                          }}
                        />
                        <span className="od-ic" aria-hidden="true">
                          ⇪
                        </span>
                        <b>Upload government ID photo</b>
                        <small>Passport, driver’s license, or national ID · stays encrypted</small>
                      </label>

                      <div className="row-btns">
                        <button
                          type="button"
                          className="secondary sm"
                          onClick={() => {
                            setIdFile('driver-license-front.jpg');
                            setIdStatus('verifying');
                            setTimeout(() => {
                              setIdStatus('verified');
                              updateState({ idVerified: true });
                            }, 600);
                          }}
                        >
                          Verify with demo ID
                        </button>
                        <button
                          type="button"
                          className="link"
                          onClick={() => {
                            setIdFile('blurry-id-photo.jpg');
                            setIdStatus('failed');
                            updateState({ idVerified: false });
                          }}
                        >
                          Test failed check
                        </button>
                      </div>

                      {idStatus === 'verifying' && (
                        <div className="onb-where">
                          <b>Verifying {idFile}…</b>
                          <span>Checking document clarity and matching your details.</span>
                        </div>
                      )}

                      {idStatus === 'failed' && (
                        <div className="onb-where" role="alert">
                          <div className="sec">
                            <span className="state warn">
                              <i />
                              Verification couldn’t read ID
                            </span>
                            <button
                              type="button"
                              className="link"
                              onClick={() => {
                                setIdStatus('verifying');
                                setTimeout(() => {
                                  setIdStatus('verified');
                                  updateState({ idVerified: true });
                                }, 600);
                              }}
                            >
                              Retry check
                            </button>
                          </div>
                          <span>
                            Make sure all four corners are visible without glare, or tap Retry check.
                          </span>
                        </div>
                      )}

                      {idStatus === 'verified' && (
                        <div className="onb-where">
                          <div className="sec">
                            <b>Identity verified</b>
                            <span className="state ok">
                              <i />
                              Verified
                            </span>
                          </div>
                          <span>{idFile ? `Document checked: ${idFile}` : 'Ready to link records.'}</span>
                        </div>
                      )}

                      <button
                        type="button"
                        className="primary"
                        disabled={idStatus !== 'verified'}
                        onClick={() => updateState({ getStartedSub: 2 })}
                      >
                        Continue to consents
                      </button>
                    </div>
                  )}

                  {persisted.getStartedSub === 2 && (
                    <div className="onb-form">
                      {(
                        [
                          [
                            'terms',
                            'Terms of Service & Privacy Notice',
                            'How we encrypt, store, and let you export or delete your record.',
                            true,
                          ],
                          [
                            'health',
                            'Build my twin from my health data',
                            'Compute biomarker trends, risk models, and Knowledge Graph links from my data.',
                            true,
                          ],
                          [
                            'records',
                            'Diagnostic lab & health record fetching',
                            'Fetch and extract laboratory and genetic reports I link or upload.',
                            true,
                          ],
                          [
                            'improve',
                            'De-identified research & model calibration',
                            'Help improve risk-equation calibration without your name or contact info.',
                            false,
                          ],
                          [
                            'marketing',
                            'Membership & new longevity test updates',
                            'Occasional updates on newly supported biomarkers and panels.',
                            false,
                          ],
                        ] as const
                      ).map(([key, title, desc, req]) => (
                        <label key={key} className="onb-check">
                          <input
                            type="checkbox"
                            checked={persisted.consents[key]}
                            onChange={() =>
                              updateState({
                                consents: {
                                  ...persisted.consents,
                                  [key]: !persisted.consents[key],
                                },
                              })
                            }
                          />
                          <span>
                            <b>
                              {title}
                              {req && <em> required</em>}
                            </b>
                            <small>{desc}</small>
                          </span>
                        </label>
                      ))}

                      <button
                        type="button"
                        className="primary"
                        disabled={!consentsValid}
                        onClick={() => {
                          const vis = getVisibleQuestions(persisted.answers);
                          setQCursor(
                            findFirstUnansweredIndex(vis, persisted.answers)
                          );
                          updateState({ mainStep: 3 });
                        }}
                      >
                        Agree and continue
                      </button>
                    </div>
                  )}
                </section>
              </>
            )}

            {/* STEP 4: 10-SECTION ADAPTIVE QUESTIONNAIRE */}
            {persisted.mainStep === 3 && (
              <>
                <SubpageHeader
                  eyebrow={
                    safetyStopMode
                      ? 'Safety check'
                      : currentQuestion
                        ? `Step 3 of 6 · Section ${currentSection?.index} of 10`
                        : 'Step 3 of 6 · Section 10 of 10'
                  }
                  title={
                    safetyStopMode
                      ? safetyStopMode === 'urgent'
                        ? 'Please get medical care first'
                        : 'Support is here right now'
                      : currentQuestion
                        ? currentSection?.title || 'Tell us about you'
                        : 'What we heard from you'
                  }
                  sub={
                    safetyStopMode
                      ? safetyStopMode === 'urgent'
                        ? 'Online onboarding is paused so you can get checked safely right away.'
                        : 'We paused the questionnaire so you can talk with someone who can support you today.'
                      : currentQuestion
                        ? `${qProgressPct}% complete · One question at a time.`
                        : 'These four lines shape your Snapshot ranking and your clinician’s preparation report.'
                  }
                  illus="checkin"
                  Icon={Icon}
                  onBack={stepBack}
                  right={
                    !safetyStopMode &&
                    currentQuestion &&
                    currentSection?.skippable ? (
                      <button
                        type="button"
                        className="link"
                        onClick={() =>
                          handleSkipCurrentSection(currentSection.index)
                        }
                      >
                        Skip section
                      </button>
                    ) : null
                  }
                />

                {!safetyStopMode && currentQuestion && (
                  <div className="onb-meter" aria-label={`${qProgressPct}% complete`}>
                    <span style={{ width: `${qProgressPct}%` }} />
                  </div>
                )}

                <section className="card">
                  {safetyStopMode ? (
                    <div className="onb-form" role="alert">
                      <div className="sec">
                        <b>
                          {safetyStopMode === 'urgent'
                            ? 'A symptom or test result like this needs prompt attention'
                            : 'You don’t have to carry this alone'}
                        </b>
                        <span className="state warn">
                          <i />
                          {safetyStopMode === 'urgent' ? 'Urgent care' : '24/7 Helpline'}
                        </span>
                      </div>

                      <div className="onb-where">
                        {safetyStopMode === 'urgent' ? (
                          isIndiaRegion ? (
                            <>
                              <b>India Emergency Helpline · 112</b>
                              <span>
                                Call 112 immediately or go to the nearest emergency department.
                              </span>
                            </>
                          ) : (
                            <>
                              <b>Emergency Services · 911 (US) / 112 (India)</b>
                              <span>
                                Call 911 (or 112 in India) or visit your nearest emergency room.
                              </span>
                            </>
                          )
                        ) : isIndiaRegion ? (
                          <>
                            <b>India 24/7 Support · Tele-MANAS 14416 &amp; 112</b>
                            <span>
                              Call Tele-MANAS at 14416 (or emergency 112). Free and confidential, 24/7.
                            </span>
                          </>
                        ) : (
                          <>
                            <b>Suicide &amp; Crisis Lifeline · 988 (US) / 14416 (India)</b>
                            <span>
                              Call or text 988 in the US, or Tele-MANAS 14416 / 112 in India. Free, confidential, 24/7.
                            </span>
                          </>
                        )}
                      </div>

                      <div className="row-btns">
                        <button
                          type="button"
                          className="primary"
                          onClick={() => {
                            setSafetyStopMode(null);
                            updateState({ mainStep: 6, bookSub: 0 });
                          }}
                        >
                          Talk to a doctor
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => exitToMainApp('twin')}
                        >
                          Return
                        </button>
                      </div>
                    </div>
                  ) : currentQuestion ? (
                    <div className="cq">
                      <p className="cq-q">{currentQuestion.prompt}</p>
                      {currentQuestion.sub && (
                        <p className="note">{currentQuestion.sub}</p>
                      )}

                      {/* SINGLE CHOICE — native .choices */}
                      {currentQuestion.type === 'single' && (
                        <div className="choices">
                          {(typeof currentQuestion.options === 'function'
                            ? currentQuestion.options(persisted.answers)
                            : currentQuestion.options || []
                          ).map((opt) => {
                            const chosen =
                              persisted.answers[currentQuestion.id] === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                aria-pressed={chosen}
                                onClick={() => {
                                  const stop =
                                    currentQuestion.safetyStop?.(opt);
                                  setAnswer(
                                    currentQuestion.id,
                                    opt,
                                    currentQuestion
                                  );
                                  if (!stop) {
                                    setQCursor((c) => c + 1);
                                  }
                                }}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* MULTI CHOICE — native .choices */}
                      {currentQuestion.type === 'multi' && (
                        <>
                          <div className="choices">
                            {(typeof currentQuestion.options === 'function'
                              ? currentQuestion.options(persisted.answers)
                              : currentQuestion.options || []
                            ).map((opt) => {
                              const arr = Array.isArray(
                                persisted.answers[currentQuestion.id]
                              )
                                ? persisted.answers[currentQuestion.id]
                                : [];
                              const chosen = arr.includes(opt);
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  aria-pressed={chosen}
                                  onClick={() => {
                                    const nextArr = applyMultiChoicePick(
                                      arr,
                                      opt,
                                      currentQuestion.exclusiveOptions,
                                      currentQuestion.maxPicks
                                    );
                                    setAnswer(currentQuestion.id, nextArr);
                                  }}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          <button
                            type="button"
                            className="primary"
                            disabled={
                              !isQuestionAnswered(
                                currentQuestion,
                                persisted.answers
                              )
                            }
                            onClick={() => setQCursor((c) => c + 1)}
                          >
                            Continue
                          </button>
                        </>
                      )}

                      {/* 0–10 SCALE — native .choices + .scale-ends */}
                      {currentQuestion.type === 'scale' && (
                        <>
                          <div className="choices">
                            {Array.from({ length: 11 }, (_, n) => {
                              const active =
                                persisted.answers[currentQuestion.id] === n;
                              return (
                                <button
                                  key={n}
                                  type="button"
                                  aria-pressed={active}
                                  onClick={() =>
                                    setAnswer(currentQuestion.id, n)
                                  }
                                >
                                  {n}
                                </button>
                              );
                            })}
                          </div>
                          <div className="scale-ends">
                            <span>0 · Not at all</span>
                            <span>10 · A lot</span>
                          </div>
                          <button
                            type="button"
                            className="primary"
                            disabled={
                              typeof persisted.answers[currentQuestion.id] !==
                              'number'
                            }
                            onClick={() => setQCursor((c) => c + 1)}
                          >
                            Continue
                          </button>
                        </>
                      )}

                      {/* FREE TEXT + OPTIONAL PHOTO */}
                      {currentQuestion.type === 'text' && (
                        <div className="onb-form">
                          <textarea
                            rows={3}
                            value={
                              persisted.answers[currentQuestion.id] ===
                              QUESTION_SKIPPED_SENTINEL
                                ? ''
                                : persisted.answers[currentQuestion.id] || ''
                            }
                            onChange={(e) =>
                              setAnswer(currentQuestion.id, e.target.value)
                            }
                            placeholder="Type your answer…"
                          />
                          {currentQuestion.allowPhoto && (
                            <label className="onb-drop">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) {
                                    setMedPhotoName(f.name);
                                    if (!persisted.answers[currentQuestion.id]) {
                                      setAnswer(
                                        currentQuestion.id,
                                        `Photo attached: ${f.name}`
                                      );
                                    }
                                  }
                                }}
                              />
                              <span className="od-ic" aria-hidden="true">
                                ⇪
                              </span>
                              <b>Attach photo of prescription or bottle (optional)</b>
                              <small>
                                {medPhotoName
                                  ? `Attached: ${medPhotoName}`
                                  : 'PNG or JPEG'}
                              </small>
                            </label>
                          )}
                          <button
                            type="button"
                            className="primary"
                            disabled={
                              !isQuestionAnswered(
                                currentQuestion,
                                persisted.answers
                              )
                            }
                            onClick={() => setQCursor((c) => c + 1)}
                          >
                            Continue
                          </button>
                        </div>
                      )}

                      {/* MEASURE FIELDS */}
                      {currentQuestion.type === 'measure' && (
                        <div className="onb-form">
                          <div className="mx-measure-grid">
                            {(currentQuestion.measureFields || []).map((mf) => {
                              const curObj =
                                typeof persisted.answers[currentQuestion.id] ===
                                  'object' &&
                                persisted.answers[currentQuestion.id]
                                  ? persisted.answers[currentQuestion.id]
                                  : {};
                              return (
                                <label key={mf.key}>
                                  {mf.label}
                                  <input
                                    inputMode={mf.numeric ? 'decimal' : 'text'}
                                    placeholder={mf.placeholder}
                                    value={curObj[mf.key] || ''}
                                    onChange={(e) =>
                                      setAnswer(currentQuestion.id, {
                                        ...curObj,
                                        [mf.key]: e.target.value,
                                      })
                                    }
                                  />
                                </label>
                              );
                            })}
                          </div>
                          <button
                            type="button"
                            className="primary"
                            disabled={
                              !isQuestionAnswered(
                                currentQuestion,
                                persisted.answers
                              )
                            }
                            onClick={() => setQCursor((c) => c + 1)}
                          >
                            Continue
                          </button>
                        </div>
                      )}

                      <div className="mx-inline-links">
                        {currentQuestion.skipLabel ? (
                          <button
                            type="button"
                            className="link"
                            onClick={() => {
                              setAnswer(
                                currentQuestion.id,
                                QUESTION_SKIPPED_SENTINEL
                              );
                              setQCursor((c) => c + 1);
                            }}
                          >
                            {currentQuestion.skipLabel}
                          </button>
                        ) : (
                          <span />
                        )}

                        <button
                          type="button"
                          className="link"
                          onClick={handleFastFillDemoQuestionnaire}
                        >
                          Pre-fill demo intake &amp; view Summary
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* SECTION 10 · SUMMARY */
                    <div className="onb-form">
                      <ul className="rs-rows">
                        <li>
                          <span>
                            <small>Main concern</small>
                            <b>{summaryLines.concern}</b>
                          </span>
                        </li>
                        <li>
                          <span>
                            <small>Top goal</small>
                            <b>{summaryLines.top_goal}</b>
                          </span>
                        </li>
                        <li>
                          <span>
                            <small>What makes it hard</small>
                            <b>{summaryLines.barrier}</b>
                          </span>
                        </li>
                        <li>
                          <span>
                            <small>Support you want</small>
                            <b>{summaryLines.support}</b>
                          </span>
                        </li>
                      </ul>

                      <div className="row-btns">
                        <button
                          type="button"
                          className="primary"
                          onClick={() => updateState({ mainStep: 4 })}
                        >
                          Continue to records &amp; genetics
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => setQCursor(0)}
                        >
                          Review answers
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              </>
            )}

            {/* STEP 5: RECORDS, LINKED LABS & GENETICS UPLOAD */}
            {persisted.mainStep === 4 && (
              <>
                <SubpageHeader
                  eyebrow="Step 4 of 6 · Upload & link records"
                  title="Upload your reports & genetics"
                  sub={
                    snapshotRequiresReport
                      ? 'Free Snapshot requires at least one uploaded lab report or linked diagnostic network so we can compute real biomarker coverage.'
                      : 'Lab reports, discharge letters, diagnostic portals, or a genetic file. Every value is read with its date, unit, and reference range.'
                  }
                  illus="blood"
                  Icon={Icon}
                  onBack={stepBack}
                  right={
                    snapshotRequiresReport && !hasAnyLabOrRecord ? (
                      <span className="state warn">
                        <i />
                        Lab required
                      </span>
                    ) : hasAnyLabOrRecord ? (
                      <span className="state ok">
                        <i />
                        Records ready
                      </span>
                    ) : null
                  }
                />

                {/* 1. Lab Report Multimodal Upload */}
                <section className="card">
                  <div className="sec">
                    <h2>1. Lab report or scan</h2>
                    {labUploadStatus === 'verifying' && (
                      <span className="state warn">
                        <i />
                        Verifying…
                      </span>
                    )}
                    {labUploadStatus === 'verified' && (
                      <span className="state ok">
                        <i />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="note">
                    PDF or photo — Gemini extracts printed analytes, units, reference ranges, and flags.
                  </p>

                  <label className="onb-drop">
                    <input
                      ref={labInputRef}
                      type="file"
                      accept="application/pdf,image/png,image/jpeg,image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void handleLabReportUpload(f);
                      }}
                    />
                    <span className="od-ic" aria-hidden="true">
                      ⇪
                    </span>
                    <b>Choose lab PDF or photo, or drop it here</b>
                    <small>PDF or photo · kept in your Medical dossier</small>
                  </label>

                  <div className="row-btns">
                    <button
                      type="button"
                      className="secondary sm"
                      onClick={() => void handleLoadSampleReportStep5()}
                    >
                      Use sample renal &amp; lipid report
                    </button>
                    {uploadedReportMeta && (
                      <span className="note">{uploadedReportMeta}</span>
                    )}
                  </div>

                  {uploadedLabs.length > 0 && (
                    <ul className="rs-rows">
                      {uploadedLabs.slice(0, 6).map((item, idx) => (
                        <li key={`${item.name}-${idx}`}>
                          <span>
                            <b>
                              {item.name}: {item.value} {item.unit}
                            </b>
                            <small>
                              {item.range
                                ? `Ref ${item.range}`
                                : 'Matched to twin catalogue'}
                            </small>
                          </span>
                          <span className={`state ${item.flag ? 'warn' : 'ok'}`}>
                            <i />
                            {item.flag ? item.flag.toUpperCase() : 'Verified'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* 2. Link EHR / Lab Portals */}
                <section className="card">
                  <div className="sec">
                    <h2>2. Link diagnostic labs &amp; hospital portals</h2>
                  </div>
                  <p className="note">
                    Connect a network to pull recent panels directly into your twin.
                  </p>
                  <div className="choices">
                    {[
                      'Quest Diagnostics',
                      'Labcorp',
                      'Metropolis Labs',
                      'Epic MyChart',
                    ].map((portalName) => {
                      const st = linkedPortals[portalName] || 'idle';
                      return (
                        <button
                          key={portalName}
                          type="button"
                          aria-pressed={st === 'verified'}
                          onClick={() => handleLinkPortal(portalName)}
                        >
                          {portalName}
                          {st === 'linking'
                            ? ' · Verifying…'
                            : st === 'verified'
                              ? ' · Verified'
                              : ''}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* 3. Upload Genetics / PGx */}
                <section className="card">
                  <div className="sec">
                    <h2>3. Genetics &amp; Pharmacogenomics</h2>
                    {geneStatus === 'parsing' && (
                      <span className="state warn">
                        <i />
                        Parsing…
                      </span>
                    )}
                    {geneStatus === 'verified' && (
                      <span className="state ok">
                        <i />
                        Verified
                      </span>
                    )}
                  </div>

                  <label className="onb-drop">
                    <input
                      ref={geneInputRef}
                      type="file"
                      accept=".vcf,.txt,.csv,.json,.pdf,image/*"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const txt =
                          f.size < 500_000
                            ? await f.text().catch(() => '')
                            : '';
                        void handleGeneticsUpload(f.name, txt);
                      }}
                    />
                    <span className="od-ic" aria-hidden="true">
                      ⇪
                    </span>
                    <b>Upload VCF, 23andMe, or PGx report (optional)</b>
                    <small>Annotates SLCO1B1, CYP2C19, APOE, and HFE drug-gene guidance</small>
                  </label>

                  <div className="row-btns">
                    <button
                      type="button"
                      className="secondary sm"
                      onClick={() =>
                        void handleGeneticsUpload(
                          'clinical-pgx-exome.vcf',
                          'SLCO1B1 *1/*5 APOE e3/e4 CYP2C19 *1/*2'
                        )
                      }
                    >
                      Load sample PGx &amp; Exome file
                    </button>
                    {geneFileName && <span className="note">{geneFileName}</span>}
                  </div>

                  {uploadedGenes.length > 0 && (
                    <ul className="rs-rows">
                      {uploadedGenes.map((g) => (
                        <li key={g.gene}>
                          <span>
                            <b>
                              {g.gene} · {g.variant}
                            </b>
                            <small>{g.phenotype}</small>
                          </span>
                          <span className="state info">
                            <i />
                            PGx Linked
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <div className="onb-where">
                  <b>Where your reports go</b>
                  <span>
                    Everything you upload, and every report we write for you, is kept in your <em>Medical dossier</em>: dated, versioned, and shareable with your doctor.
                  </span>
                </div>

                {!canProceedFromRecords && (
                  <p className="note mx-field-err">
                    Please upload a lab report or connect at least one lab network above to generate your Free Snapshot.
                  </p>
                )}

                <button
                  type="button"
                  className="primary"
                  disabled={!canProceedFromRecords}
                  onClick={() => updateState({ mainStep: 5 })}
                >
                  Compute my Wellness Snapshot
                </button>
              </>
            )}

            {/* STEP 6: SNAPSHOT (RANKED COMPLETENESS, FOCUS AREA, UPSELL PANELS) */}
            {persisted.mainStep === 5 && (
              <>
                <SubpageHeader
                  eyebrow="Step 5 of 6 · Health snapshot"
                  title={`${
                    persisted.details.name
                      ? `${persisted.details.name.split(' ')[0]}’s`
                      : 'Your'
                  } wellness snapshot`}
                  sub="Wellness areas ranked by how complete your combined questionnaire, lab report, and genetic data is right now."
                  illus="panel"
                  Icon={Icon}
                  onBack={stepBack}
                />

                <section className="card">
                  <div className="sec">
                    <h2>Focus area</h2>
                    {uploadedLabs.some((l) => l.flag) && (
                      <span className="state warn">
                        <i />
                        {uploadedLabs.filter((l) => l.flag).length} flagged labs
                      </span>
                    )}
                  </div>
                  <b>{summaryLines.concern}</b>
                  <p className="note">Goal: {summaryLines.top_goal}</p>
                </section>

                <section className="card">
                  <div className="sec">
                    <h2>Wellness areas ranked by data completeness</h2>
                  </div>
                  <ul className="rs-rows">
                    {snapshotRanking.map((area) => (
                      <li key={area.name}>
                        <span>
                          <b>{area.name}</b>
                          <small>{area.detail}</small>
                          <div className="onb-meter">
                            <span
                              style={{ width: `${Math.min(100, area.pct)}%` }}
                            />
                          </div>
                        </span>
                        <span className="rs-val">
                          {Math.min(100, area.pct)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="card">
                  <div className="sec">
                    <h2>Optional panels to fill your data gaps</h2>
                    <span className="note">$150–$380</span>
                  </div>
                  <div className="onb-form">
                    {UPSELL_PANELS.map((panel) => {
                      const picked = selectedUpsells.includes(panel.id);
                      return (
                        <label key={panel.id} className="onb-check">
                          <input
                            type="checkbox"
                            checked={picked}
                            onChange={() =>
                              setSelectedUpsells((prev) =>
                                picked
                                  ? prev.filter((x) => x !== panel.id)
                                  : [...prev, panel.id]
                              )
                            }
                          />
                          <span>
                            <b>
                              {panel.name} · ${panel.price}
                            </b>
                            <small>Unlocks: {panel.fills}</small>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>

                {persisted.entryPath === 'snapshot' ? (
                  <div className="row-btns">
                    {!createdTwinResult ? (
                      <button
                        type="button"
                        className="primary"
                        disabled={synthesizing}
                        onClick={() => void runBackendTwinSynthesis(false)}
                      >
                        {synthesizing
                          ? 'Building Snapshot Twin…'
                          : 'Build & open my Snapshot Twin'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="primary"
                        onClick={() =>
                          openCreatedTwinInPortal(createdTwinResult.id)
                        }
                      >
                        Open {createdTwinResult.index_entry?.name || 'my'} new Snapshot Twin
                      </button>
                    )}

                    <button
                      type="button"
                      className="secondary"
                      onClick={() => updateState({ mainStep: 6, bookSub: 0 })}
                    >
                      Book doctor consult (+${upsellTotal || 150})
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="primary"
                    onClick={() => updateState({ mainStep: 6, bookSub: 0 })}
                  >
                    Continue to book included assessment
                  </button>
                )}
              </>
            )}

            {/* STEP 7: BOOK -> CHECKOUT -> CONSULT -> BACKEND TWIN CREATION */}
            {persisted.mainStep === 6 && (
              <>
                <SubpageHeader
                  eyebrow="Step 6 of 6 · Consult & twin build"
                  title={
                    persisted.bookSub === 0
                      ? 'Book your physician assessment'
                      : persisted.bookSub === 1
                        ? 'Transparent checkout'
                        : 'Video consult & twin report'
                  }
                  sub={
                    persisted.bookSub === 0
                      ? 'Choose a clinician and video slot to review your twin, lab biomarkers, and pharmacogenomics.'
                      : persisted.bookSub === 1
                        ? 'Exact payment split shown per payee—clinical fees go directly to the medical practice and accredited lab.'
                        : 'Join your clinician to review your intake and publish your Digital Twin dossier.'
                  }
                  illus="research"
                  Icon={Icon}
                  onBack={stepBack}
                />

                <div
                  className="segc"
                  role="tablist"
                  aria-label="Booking and consult steps"
                >
                  {[
                    '1. Book doctor',
                    '2. Checkout',
                    '3. Video consult & Twin',
                  ].map((lbl, idx) => (
                    <button
                      key={lbl}
                      type="button"
                      role="tab"
                      aria-selected={persisted.bookSub === idx}
                      onClick={() => updateState({ bookSub: idx })}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                <section className="card">
                  {persisted.bookSub === 0 && (
                    <div className="onb-form">
                      {DOCTORS.map((doc) => {
                        const active = selectedDoctor === doc.id;
                        return (
                          <label key={doc.id} className="onb-check">
                            <input
                              type="radio"
                              name="onb-doctor"
                              checked={active}
                              onChange={() => {
                                setSelectedDoctor(doc.id);
                                setSelectedSlot(doc.slots[0]);
                              }}
                            />
                            <span>
                              <b>{doc.name}</b>
                              <small>{doc.role}</small>
                            </span>
                          </label>
                        );
                      })}

                      <div>
                        <p className="note">Available video consult slots</p>
                        <div className="choices">
                          {(
                            DOCTORS.find((d) => d.id === selectedDoctor) ||
                            DOCTORS[0]
                          ).slots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              aria-pressed={selectedSlot === slot}
                              onClick={() => setSelectedSlot(slot)}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="primary"
                        onClick={() => updateState({ bookSub: 1 })}
                      >
                        Continue to checkout
                      </button>
                    </div>
                  )}

                  {persisted.bookSub === 1 && (
                    <div className="onb-form">
                      <div className="sec">
                        <b>Payment split per payee</b>
                        <span className="note">{selectedTier.name}</span>
                      </div>
                      <ul className="rs-rows">
                        {selectedTier.split.map(([payee, amt]) => (
                          <li key={payee}>
                            <span>
                              <b>{payee}</b>
                            </span>
                            <span className="rs-val">{amt}</span>
                          </li>
                        ))}
                        {upsellTotal > 0 && (
                          <li>
                            <span>
                              <b>Selected gap-fill lab panels</b>
                            </span>
                            <span className="rs-val">${upsellTotal}</span>
                          </li>
                        )}
                      </ul>

                      <label className="onb-check">
                        <input
                          type="checkbox"
                          checked={autoRenewConsent}
                          onChange={() => setAutoRenewConsent((v) => !v)}
                        />
                        <span>
                          <b>Auto-renewal consent (annual membership)</b>
                          <small>
                            Renew my membership yearly at {selectedTier.annual}{' '}
                            unless I cancel in Settings before renewal.
                          </small>
                        </span>
                      </label>

                      <button
                        type="button"
                        className="primary"
                        onClick={() => {
                          setPaidDone(true);
                          updateState({ bookSub: 2 });
                        }}
                      >
                        Confirm &amp; join video consult
                      </button>
                    </div>
                  )}

                  {persisted.bookSub === 2 && (
                    <div className="onb-form">
                      <div className="onb-where">
                        <div className="sec">
                          <b>
                            {
                              (
                                DOCTORS.find((d) => d.id === selectedDoctor) ||
                                DOCTORS[0]
                              ).name
                            }
                          </b>
                          <span className="state ok">
                            <i />
                            Connected · {selectedSlot}
                          </span>
                        </div>
                        <span>
                          “I’ve reviewed your 10-section intake
                          {uploadedLabs.length
                            ? `, your ${uploadedLabs.length} extracted lab biomarkers`
                            : ''}
                          {uploadedGenes.length
                            ? `, and your ${uploadedGenes.length} PGx variants`
                            : ''}
                          . Let’s build and publish your Digital Twin report now.”
                        </span>
                      </div>

                      {(synthesizing || createdTwinResult) && (
                        <ol className="onb-build" role="status">
                          {[
                            'Phenotype & 10-section intake normalization',
                            'Laboratory reference rule evaluation & EHR linkage',
                            'Pharmacogenomic (SLCO1B1/CYP) & variant annotation',
                            'Risk equations, Knowledge Graph & Doctor Dossier publication',
                          ].map((stageName, idx) => {
                            const done =
                              Boolean(createdTwinResult) || synthStepIdx > idx;
                            return (
                              <li
                                key={stageName}
                                data-s={done ? 'done' : 'now'}
                              >
                                <i aria-hidden="true">{done ? '✓' : ''}</i>
                                <span>{stageName}</span>
                              </li>
                            );
                          })}
                        </ol>
                      )}

                      {!createdTwinResult ? (
                        <button
                          type="button"
                          className="primary"
                          disabled={synthesizing}
                          onClick={() => void runBackendTwinSynthesis(true)}
                        >
                          {synthesizing
                            ? 'Preparing your twin report…'
                            : 'Complete consult & prepare my twin report'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="primary"
                          onClick={() =>
                            openCreatedTwinInPortal(createdTwinResult.id)
                          }
                        >
                          Open {createdTwinResult.index_entry?.name || 'my'}{' '}
                          Digital Twin
                        </button>
                      )}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        )}
      </div>

      {showTour && (
        <ProductTourModal
          onClose={() => setShowTour(false)}
          onNavigateSandbox={handleLaunchSandboxRoute}
        />
      )}
    </main>
  );
}
