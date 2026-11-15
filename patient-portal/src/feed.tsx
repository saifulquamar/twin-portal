import React, { useEffect, useMemo, useRef, useState } from 'react';
import { saveEncryptedVault } from './auth-context';
import { FEED_CATEGORIES, inferCategoryFromEntry } from './feed-categories';
import { cleanLabUnit, matchExtractedResultsToTwin } from './lab-matching';
import { usePortalNavigation } from './navigation-context';
import type { VoicePersonaData } from './preserve-math';
import { MEMORY_ITEMS_STORE_KEY, MEMORIES_STORE_KEY } from './preserve';
import type {
  BriefingResultPayload,
  ExtractApiResponse,
  FeedCategory,
  FeedEntry,
  FeedInterpretResponse,
  FeedKind,
  FeedProvenance,
  IdentityMemoryItem,
  MatchedLabRow,
  ParsedFeedItem,
  PortalHostBridge,
  StoredBriefing,
  VoiceConsentData,
} from './types';
import {
  analyzeBlobAcoustics,
  blobToBase64,
  resolvePortalApiUrl,
  SHARED_VOICE_CONSENT_KEY,
  SHARED_VOICE_STORE_KEY,
  trainAndTranscribeUserVoice,
  VOICE_UPDATED_EVENT,
} from './voice-engine';

const FEED_STORAGE_KEY = 'mx-feed';
export const BRIEFING_STORAGE_KEY = 'mx-briefing';
export const BRIEFING_EVENT = 'mx-briefing-updated';
export const FEED_EVENT = 'mx-feed-updated';
export { FEED_CATEGORIES, inferCategoryFromEntry };

const PROVENANCE_LABELS: Record<FeedProvenance, string> = {
  user_reported: 'User reported',
  imported_record: 'Imported record',
  measured_device: 'Measured value',
  voice_spoken: 'Spoken voice',
  ai_extracted: 'AI structured',
};

const MEASURE_UNITS: Array<[string, string]> = [
  ['Blood pressure', 'mmHg'],
  ['Weight', 'kg'],
  ['Height', 'cm'],
  ['Heart rate', 'bpm'],
  ['Blood glucose', 'mg/dL'],
  ['Sleep duration', 'hours'],
  ['Body fat', '%'],
  ['Waist', 'cm'],
  ['Oxygen saturation', '%'],
];

const RELATIVES = [
  'Self / Personal context',
  'Mother',
  'Father',
  'Sister',
  'Brother',
  'Grandmother',
  'Grandfather',
  'Child',
];

const todayIso = () => new Date().toISOString().slice(0, 10);

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="feed-f">
      <span>{label}</span>
      {children}
    </label>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = typeof reader.result === 'string' ? reader.result : '';
      const base64 = res.includes(',') ? res.split(',')[1] : res;
      if (!base64) {
        reject(new Error('Empty file content'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function inferMimeType(file: File): 'image/png' | 'image/jpeg' | 'application/pdf' {
  const t = (file.type || '').toLowerCase();
  if (t === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return 'application/pdf';
  }
  if (t === 'image/jpeg' || t === 'image/jpg' || /\.jpe?g$/i.test(file.name)) {
    return 'image/jpeg';
  }
  return 'image/png';
}

type ExtractUiState = 'idle' | 'reading' | 'ready' | 'empty' | 'unreachable';

interface ReportScanFormProps {
  bundle: any;
  defaultDate: string;
  apiBase?: string;
  onAddKeptRows: (
    entries: Array<Omit<FeedEntry, 'id' | 'at'>>,
    briefingRows: BriefingResultPayload[],
    reportMeta: { reportDate: string; labName: string | null }
  ) => void;
}

export function ReportScanForm({
  bundle,
  defaultDate,
  apiBase,
  onAddKeptRows,
}: ReportScanFormProps) {
  const [reportDate, setReportDate] = useState<string>(defaultDate);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractState, setExtractState] = useState<ExtractUiState>('idle');
  const [labName, setLabName] = useState<string | null>(null);
  const [rows, setRows] = useState<MatchedLabRow[]>([]);
  const [loadingSample, setLoadingSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const runExtraction = async (file: File) => {
    setSelectedFile(file);
    setExtractState('reading');
    setRows([]);
    setLabName(null);

    let base64 = '';
    try {
      base64 = await fileToBase64(file);
    } catch {
      setExtractState('empty');
      return;
    }

    const mimeType = inferMimeType(file);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 45000);
      const response = await fetch(resolvePortalApiUrl('/v1/extract', apiBase), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          file: base64,
          mime_type: mimeType,
        }),
      });
      clearTimeout(timer);

      if (!response.ok) {
        setExtractState('unreachable');
        return;
      }

      const data = (await response.json()) as ExtractApiResponse;
      const effectiveDate = data.report_date || reportDate || todayIso();
      if (data.report_date) {
        setReportDate(data.report_date);
      }
      setLabName(data.lab || null);

      if (!Array.isArray(data.results) || data.results.length === 0) {
        setExtractState('empty');
        return;
      }

      const matched = matchExtractedResultsToTwin(data.results, bundle?.labs, effectiveDate);
      setRows(matched);
      setExtractState('ready');
    } catch {
      setExtractState('unreachable');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      void runExtraction(file);
    }
  };

  const handleLoadSampleReport = async () => {
    setLoadingSample(true);
    try {
      const res = await fetch('./sample-lab-report.jpg', { cache: 'no-store' });
      if (!res.ok) throw new Error('Sample report missing');
      const blob = await res.blob();
      const sampleFile = new File([blob], 'sample-lab-report.jpg', { type: 'image/jpeg' });
      await runExtraction(sampleFile);
    } catch {
      setExtractState('unreachable');
    } finally {
      setLoadingSample(false);
    }
  };

  const toggleRow = (id: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, kept: !r.kept } : r)));
  };

  const keptRows = useMemo(() => rows.filter((r) => r.kept), [rows]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (extractState !== 'ready' || keptRows.length === 0) return;

    const entries: Array<Omit<FeedEntry, 'id' | 'at'>> = keptRows.map((row) => {
      const effectiveDate = row.date || reportDate || todayIso();
      const cleanUnit = row.unit ? row.unit.trim() : '';
      return {
        kind: 'lab',
        category: 'test_results',
        provenance: 'imported_record',
        confidence: 0.96,
        reviewStatus: 'pending_review',
        date: effectiveDate,
        title: `${row.name.trim()} ${row.value}${cleanUnit ? ` ${cleanUnit}` : ''}`.trim(),
        detail: `${labName ? `${labName} · ` : ''}from report (${effectiveDate})`,
        extracted: {
          name: row.name.trim(),
          value: row.value,
          unit: cleanUnit,
          range: row.range,
          flag: row.flag,
          date: effectiveDate,
          prevValue: row.prevValue,
          prevUnit: row.prevUnit,
          prevDate: row.prevDate,
          pctChange: row.pctChange,
        },
      };
    });

    const briefingPayload: BriefingResultPayload[] = keptRows.map((row) => ({
      name: row.name.trim(),
      value: row.value,
      unit: row.unit,
      range: row.range,
      flag: row.flag,
      date: row.date || reportDate || todayIso(),
      prev_value: row.prevValue,
      prev_unit: row.prevUnit,
      prev_date: row.prevDate,
      pct_change: row.pctChange != null ? Number(row.pctChange.toFixed(1)) : null,
    }));

    onAddKeptRows(entries, briefingPayload, {
      reportDate: reportDate || todayIso(),
      labName,
    });
  };

  return (
    <form className="feed-form" onSubmit={handleSubmit}>
      <FieldLabel label="Upload report (PDF, photo, genomic or imaging sheet)">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/*"
          onChange={handleFileChange}
        />
      </FieldLabel>

      <div className="mx-sample-bar">
        <button
          type="button"
          className="secondary sm mx-sample-btn"
          disabled={extractState === 'reading' || loadingSample}
          onClick={handleLoadSampleReport}
        >
          {loadingSample ? 'Loading sample…' : 'Use sample report'}
        </button>
        {selectedFile && (
          <span className="note mx-file-pill" title={selectedFile.name}>
            {selectedFile.name}
          </span>
        )}
      </div>

      <FieldLabel label="Report date">
        <input
          type="date"
          max={todayIso()}
          value={reportDate}
          onChange={(e) => setReportDate(e.target.value)}
        />
      </FieldLabel>

      {extractState === 'reading' && (
        <div className="card mx-extract-status" role="status" aria-live="polite">
          <b>Reading the report…</b>
          <p className="note">
            Extracting test names, values, reference ranges, and comparing them longitudinally against your Twin without overwriting prior history.
          </p>
        </div>
      )}

      {extractState === 'empty' && (
        <div className="card mx-extract-status" role="status">
          <b>No structured lab values found</b>
          <p className="note">
            Try a clearer report photo/PDF, or switch to manual single-test entry above.
          </p>
        </div>
      )}

      {extractState === 'unreachable' && (
        <div className="card mx-extract-status" role="alert">
          <div className="sec">
            <b>Report reader unreachable</b>
            {selectedFile && (
              <button
                type="button"
                className="link"
                onClick={() => void runExtraction(selectedFile)}
              >
                Try again
              </button>
            )}
          </div>
          <p className="note">Please verify localhost:3000 is running and retry.</p>
        </div>
      )}

      {extractState === 'ready' && rows.length > 0 && (
        <section className="card mx-review-card" aria-label="Extracted results review">
          <div className="sec mx-review-head">
            <div>
              <h3>Review extracted results</h3>
              <p className="note">
                {labName ? `${labName} · ` : ''}
                {reportDate} · {keptRows.length} of {rows.length} selected
              </p>
            </div>
            <span className="state warn">
              <i />
              Pending care-team check
            </span>
          </div>

          <div className="mx-review-table-wrap">
            <ul className="rs-rows mx-review-rows">
              {rows.map((row) => {
                const displayUnit = cleanLabUnit(row.unit);
                const prevDisplayUnit = cleanLabUnit(row.prevUnit || row.unit);
                const flagTone = row.flag === 'high' || row.flag === 'low' ? 'warn' : 'ok';
                const pctFormatted =
                  row.pctChange != null
                    ? `${row.arrow || ''} ${row.pctChange > 0 ? '+' : ''}${row.pctChange.toFixed(1)}%`.trim()
                    : null;

                return (
                  <li
                    key={row.id}
                    className={`mx-review-row${row.kept ? '' : ' is-unticked'}`}
                  >
                    <label className="mx-review-check">
                      <input
                        type="checkbox"
                        checked={row.kept}
                        onChange={() => toggleRow(row.id)}
                        aria-label={`Include ${row.name}`}
                      />
                      <span className="mx-review-main">
                        <span className="mx-review-title-line">
                          <b>{row.name}</b>
                          <span className="mx-review-newval">
                            {row.value} {displayUnit}
                          </span>
                        </span>
                        <small className="mx-review-sub">
                          Range: {row.range || 'not printed'}
                          {row.flag ? ` · Flag: ${row.flag}` : ' · Within range'}
                        </small>
                        <small className="mx-review-twin">
                          {row.prevValue != null ? (
                            <>
                              Twin prior ({row.matchedLabKey || row.name}):{' '}
                              <strong>
                                {row.prevValue} {prevDisplayUnit}
                              </strong>
                              {pctFormatted && (
                                <span
                                  className={`mx-delta-badge${
                                    row.flag ? ' is-flagged' : ''
                                  }`}
                                >
                                  {pctFormatted}
                                </span>
                              )}
                            </>
                          ) : (
                            <span>New analyte for your Twin</span>
                          )}
                        </small>
                      </span>
                    </label>
                    <span className={`state ${flagTone}`}>
                      <i />
                      {row.flag ? row.flag.toUpperCase() : 'Normal'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      <button
        className="primary"
        type="submit"
        disabled={extractState !== 'ready' || keptRows.length === 0}
      >
        Add selected results to my twin
      </button>
    </form>
  );
}

function CategoryEntryForm({
  category,
  bundle,
  host,
  onSave,
  onAddReportRows,
}: {
  category: FeedCategory;
  bundle: any;
  host: PortalHostBridge;
  onSave: (entry: Omit<FeedEntry, 'id' | 'at'>, alsoSaveToMemories?: string) => void;
  onAddReportRows: ReportScanFormProps['onAddKeptRows'];
}) {
  const [testSubMode, setTestSubMode] = useState<'scan' | 'manual'>('scan');
  const [form, setForm] = useState<Record<string, string>>({
    date: todayIso(),
    measure: 'Blood pressure',
    medKind: 'Current prescription',
    adherence: 'Taking as prescribed',
    severity: '3',
    duration: 'Since yesterday',
    mood: 'Calm & steady',
    infoSubType: 'Family history',
    relative: 'Mother',
    trainVoiceToo: 'yes',
  });
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const setField =
    (field: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const labSuggestions = useMemo(() => Object.keys(bundle?.labs ?? {}), [bundle]);
  const measureUnit = MEASURE_UNITS.find(([m]) => m === form.measure)?.[1] ?? '';
  const isNumeric = (v?: string) =>
    v != null && v.trim() !== '' && !Number.isNaN(Number(v));

  if (category === 'test_results') {
    return (
      <div className="mx-cat-sheet-body">
        <div className="mx-tour-tabs">
          <button
            type="button"
            className={`mx-kg-chip${testSubMode === 'scan' ? ' is-active' : ''}`}
            onClick={() => setTestSubMode('scan')}
          >
            Upload PDF / Photo Report
          </button>
          <button
            type="button"
            className={`mx-kg-chip${testSubMode === 'manual' ? ' is-active' : ''}`}
            onClick={() => setTestSubMode('manual')}
          >
            Enter Single Result
          </button>
        </div>

        {testSubMode === 'scan' ? (
          <ReportScanForm
            bundle={bundle}
            defaultDate={todayIso()}
            apiBase={host.apiBase}
            onAddKeptRows={onAddReportRows}
          />
        ) : (
          <form
            className="feed-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.test?.trim() || !isNumeric(form.value)) return;
              onSave({
                kind: 'lab',
                category: 'test_results',
                provenance: 'user_reported',
                confidence: 0.95,
                reviewStatus: 'pending_review',
                date: form.date || todayIso(),
                title: `${form.test.trim()} ${form.value} ${form.unit ?? ''}`.trim(),
                detail: [form.testType || 'Lab test', form.lab?.trim()]
                  .filter(Boolean)
                  .join(' · '),
              });
            }}
          >
            <FieldLabel label="Investigation type">
              <select value={form.testType ?? 'Blood / Urine Lab'} onChange={setField('testType')}>
                <option>Blood / Urine Lab</option>
                <option>Genomic / Pharmacogenomic Test</option>
                <option>Imaging / Ultrasound / MRI</option>
                <option>Diagnostic / Specialist Test</option>
              </select>
            </FieldLabel>
            <FieldLabel label="Test or biomarker name">
              <input
                list="feed-labs"
                value={form.test ?? ''}
                onChange={setField('test')}
                placeholder="e.g. HbA1c, eGFR, ApoB, Vitamin D"
              />
              <datalist id="feed-labs">
                {labSuggestions.map((k) => (
                  <option key={k} value={k} />
                ))}
              </datalist>
            </FieldLabel>
            <div className="feed-row">
              <FieldLabel label="Value">
                <input
                  inputMode="decimal"
                  value={form.value ?? ''}
                  onChange={setField('value')}
                />
              </FieldLabel>
              <FieldLabel label="Unit">
                <input
                  value={form.unit ?? ''}
                  onChange={setField('unit')}
                  placeholder="e.g. %, mg/dL"
                />
              </FieldLabel>
            </div>
            <FieldLabel label="Date">
              <input
                type="date"
                max={todayIso()}
                value={form.date ?? todayIso()}
                onChange={setField('date')}
              />
            </FieldLabel>
            <FieldLabel label="Laboratory or clinic (optional)">
              <input value={form.lab ?? ''} onChange={setField('lab')} />
            </FieldLabel>
            <button
              className="primary"
              type="submit"
              disabled={!form.test?.trim() || !isNumeric(form.value)}
            >
              Add test result to my twin
            </button>
          </form>
        )}
      </div>
    );
  }

  if (category === 'voice_conversations') {
    const handleVoiceCapture = async () => {
      if (voiceRecording && recRef.current) {
        recRef.current.stop();
        setVoiceRecording(false);
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunksRef.current = [];
        const rec = new MediaRecorder(stream);
        recRef.current = rec;
        rec.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
        };
        rec.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          setVoiceBusy(true);
          try {
            const mime = rec.mimeType || 'audio/webm';
            const blob = new Blob(chunksRef.current, { type: mime });
            const [b64, acoustics] = await Promise.all([
              blobToBase64(blob),
              analyzeBlobAcoustics(blob),
            ]);
            const consent = host.readStore<VoiceConsentData | null>(
              SHARED_VOICE_CONSENT_KEY,
              null
            );
            const allowTrain =
              form.trainVoiceToo === 'yes' && (consent?.consented ?? true);
            const existingVoice = host.readStore<VoicePersonaData | null>(
              SHARED_VOICE_STORE_KEY,
              null
            );
            const trained = await trainAndTranscribeUserVoice({
              audioBase64: b64,
              mimeType: mime,
              sourceType: allowTrain ? 'conversation_audio' : 'text_only',
              consentVerified: allowTrain,
              measuredPitchHz: acoustics.pitchHz,
              measuredBrightness: acoustics.brightness,
              transcriptHint: form.voiceTopic || 'Spoken personal update for my twin.',
              patientName: bundle?.patient?.preferred_name || 'Member',
              existingProfile: existingVoice,
              apiBase: host.apiBase,
            });
            if (allowTrain && trained.used_real_audio) {
              host.writeStore(SHARED_VOICE_STORE_KEY, trained.profile);
              window.dispatchEvent(new Event(VOICE_UPDATED_EVENT));
            }
            setForm((prev) => ({ ...prev, voiceNoteText: trained.transcript || '' }));
          } finally {
            setVoiceBusy(false);
          }
        };
        rec.start();
        setVoiceRecording(true);
      } catch {
        // ignore
      }
    };

    return (
      <form
        className="feed-form"
        onSubmit={(e) => {
          e.preventDefault();
          const text = (form.voiceNoteText || '').trim();
          if (!text) return;
          onSave(
            {
              kind: 'voice_note',
              category: 'voice_conversations',
              provenance: 'voice_spoken',
              confidence: 0.94,
              reviewStatus: 'personal_context',
              date: form.date || todayIso(),
              title: form.voiceTopic?.trim() || 'Spoken personal update',
              detail: text,
            },
            text
          );
        }}
      >
        <FieldLabel label="Topic or title">
          <input
            value={form.voiceTopic ?? ''}
            onChange={setField('voiceTopic')}
            placeholder="e.g. Weekly energy check-in, story from today"
          />
        </FieldLabel>

        <div className="mx-voice-btn-row">
          <button
            type="button"
            className={voiceRecording ? 'primary sm' : 'secondary sm'}
            disabled={voiceBusy}
            onClick={() => void handleVoiceCapture()}
          >
            {voiceRecording ? 'Stop recording' : voiceBusy ? 'Transcribing…' : 'Record spoken update'}
          </button>

          <label className="secondary sm mx-file-btn">
            <span>Upload voice file</span>
            <input
              type="file"
              accept="audio/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setVoiceBusy(true);
                try {
                  const [b64, acoustics] = await Promise.all([
                    blobToBase64(f),
                    analyzeBlobAcoustics(f),
                  ]);
                  const existingVoice = host.readStore<VoicePersonaData | null>(
                    SHARED_VOICE_STORE_KEY,
                    null
                  );
                  const allowTrain = form.trainVoiceToo === 'yes';
                  const trained = await trainAndTranscribeUserVoice({
                    audioBase64: b64,
                    mimeType: f.type || 'audio/wav',
                    sourceType: allowTrain ? 'uploaded_audio' : 'text_only',
                    consentVerified: allowTrain,
                    measuredPitchHz: acoustics.pitchHz,
                    measuredBrightness: acoustics.brightness,
                    transcriptHint: form.voiceTopic || f.name,
                    patientName: bundle?.patient?.preferred_name || 'Member',
                    existingProfile: existingVoice,
                    apiBase: host.apiBase,
                  });
                  if (allowTrain && trained.used_real_audio) {
                    host.writeStore(SHARED_VOICE_STORE_KEY, trained.profile);
                    window.dispatchEvent(new Event(VOICE_UPDATED_EVENT));
                  }
                  setForm((prev) => ({
                    ...prev,
                    voiceTopic: prev.voiceTopic || f.name,
                    voiceNoteText: trained.transcript || '',
                  }));
                } finally {
                  setVoiceBusy(false);
                }
              }}
            />
          </label>
        </div>

        <label className="mx-voice-toggle">
          <input
            type="checkbox"
            checked={form.trainVoiceToo === 'yes'}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                trainVoiceToo: e.target.checked ? 'yes' : 'no',
              }))
            }
          />
          <span>Use real audio from this recording to refine my Twin’s voice profile</span>
        </label>

        <FieldLabel label="Spoken transcript / conversation summary">
          <textarea
            rows={3}
            value={form.voiceNoteText ?? ''}
            onChange={setField('voiceNoteText')}
            placeholder="Record audio above or summarize a conversation you want your Twin to remember…"
          />
        </FieldLabel>

        <button
          className="primary"
          type="submit"
          disabled={!(form.voiceNoteText || '').trim()}
        >
          Save to my twin
        </button>
      </form>
    );
  }

  let valid = Boolean(form.date);
  let fields: React.ReactNode = null;
  let buildPayload = (): {
    entry: Omit<FeedEntry, 'id' | 'at'>;
    memorySync?: string;
  } => ({
    entry: {
      kind: 'personal_info',
      category,
      provenance: 'user_reported',
      confidence: 0.95,
      reviewStatus: 'pending_review',
      date: form.date || todayIso(),
      title: '',
      detail: '',
    },
  });

  switch (category) {
    case 'measurements': {
      const isBp = form.measure === 'Blood pressure';
      valid = valid && (isBp ? isNumeric(form.sys) && isNumeric(form.dia) : isNumeric(form.value));
      fields = (
        <>
          <FieldLabel label="Measurement">
            <select value={form.measure} onChange={setField('measure')}>
              {MEASURE_UNITS.map(([m]) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </FieldLabel>
          {isBp ? (
            <div className="feed-row">
              <FieldLabel label="Systolic (mmHg)">
                <input inputMode="numeric" value={form.sys ?? ''} onChange={setField('sys')} />
              </FieldLabel>
              <FieldLabel label="Diastolic (mmHg)">
                <input inputMode="numeric" value={form.dia ?? ''} onChange={setField('dia')} />
              </FieldLabel>
            </div>
          ) : (
            <FieldLabel label={`Value (${measureUnit})`}>
              <input inputMode="decimal" value={form.value ?? ''} onChange={setField('value')} />
            </FieldLabel>
          )}
          <div className="feed-row">
            <FieldLabel label="Source">
              <select value={form.source ?? 'Home monitor'} onChange={setField('source')}>
                <option>Home monitor</option>
                <option>Wearable / smartwatch</option>
                <option>Clinic visit</option>
              </select>
            </FieldLabel>
            <FieldLabel label="Date">
              <input type="date" max={todayIso()} value={form.date} onChange={setField('date')} />
            </FieldLabel>
          </div>
        </>
      );
      buildPayload = () => ({
        entry: {
          kind: 'measure',
          category: 'measurements',
          provenance:
            form.source === 'Wearable / smartwatch' || form.source === 'Home monitor'
              ? 'measured_device'
              : 'user_reported',
          confidence: 0.96,
          reviewStatus: 'pending_review',
          date: form.date,
          title: `${form.measure} ${isBp ? `${form.sys}/${form.dia}` : form.value} ${measureUnit}`,
          detail: form.source || 'Home measurement',
        },
      });
      break;
    }

    case 'medicines': {
      valid = valid && Boolean(form.name?.trim());
      fields = (
        <>
          <div className="feed-row">
            <FieldLabel label="Category">
              <select value={form.medKind} onChange={setField('medKind')}>
                <option>Current prescription</option>
                <option>Supplement / vitamin</option>
                <option>Dose change</option>
                <option>Historical / stopped medicine</option>
              </select>
            </FieldLabel>
            <FieldLabel label="Adherence">
              <select value={form.adherence} onChange={setField('adherence')}>
                <option>Taking as prescribed</option>
                <option>Just started</option>
                <option>Occasionally missed</option>
                <option>Paused / discontinued</option>
              </select>
            </FieldLabel>
          </div>
          <FieldLabel label="Medicine or supplement name">
            <input
              value={form.name ?? ''}
              onChange={setField('name')}
              placeholder="e.g. Losartan, Magnesium glycinate"
            />
          </FieldLabel>
          <div className="feed-row">
            <FieldLabel label="Dosage">
              <input value={form.dose ?? ''} onChange={setField('dose')} placeholder="e.g. 50 mg" />
            </FieldLabel>
            <FieldLabel label="Frequency">
              <input
                value={form.freq ?? ''}
                onChange={setField('freq')}
                placeholder="e.g. once daily in morning"
              />
            </FieldLabel>
          </div>
          <FieldLabel label="Effective date">
            <input type="date" max={todayIso()} value={form.date} onChange={setField('date')} />
          </FieldLabel>
        </>
      );
      buildPayload = () => ({
        entry: {
          kind: 'medicine',
          category: 'medicines',
          provenance: 'user_reported',
          confidence: 0.95,
          reviewStatus: 'pending_review',
          date: form.date,
          title: [form.name.trim(), form.dose].filter(Boolean).join(' '),
          detail: [form.medKind, form.freq, form.adherence].filter(Boolean).join(' · '),
        },
      });
      break;
    }

    case 'symptoms': {
      valid = valid && Boolean(form.what?.trim());
      fields = (
        <>
          <FieldLabel label="Symptom">
            <input
              value={form.what ?? ''}
              onChange={setField('what')}
              placeholder="e.g. Temporal headache, ankle swelling, afternoon fatigue"
            />
          </FieldLabel>
          <FieldLabel label={`Severity: ${form.severity} of 5`}>
            <input
              type="range"
              min="1"
              max="5"
              value={form.severity}
              onChange={setField('severity')}
            />
          </FieldLabel>
          <div className="feed-row">
            <FieldLabel label="Duration / frequency">
              <input
                value={form.duration ?? ''}
                onChange={setField('duration')}
                placeholder="e.g. 3 hours, intermittent"
              />
            </FieldLabel>
            <FieldLabel label="Suspected trigger (optional)">
              <input
                value={form.triggers ?? ''}
                onChange={setField('triggers')}
                placeholder="e.g. poor sleep, dehydration"
              />
            </FieldLabel>
          </div>
          <FieldLabel label="Date">
            <input type="date" max={todayIso()} value={form.date} onChange={setField('date')} />
          </FieldLabel>
        </>
      );
      buildPayload = () => ({
        entry: {
          kind: 'symptom',
          category: 'symptoms',
          provenance: 'user_reported',
          confidence: 0.95,
          reviewStatus: 'pending_review',
          date: form.date,
          title: `${form.what.trim()} (severity ${form.severity}/5)`,
          detail: [
            form.duration,
            form.triggers ? `trigger: ${form.triggers}` : '',
          ]
            .filter(Boolean)
            .join(' · '),
        },
      });
      break;
    }

    case 'daily_activities': {
      valid =
        valid &&
        Boolean(
          form.exercise?.trim() ||
            form.sleep?.trim() ||
            form.nutrition?.trim() ||
            form.hydration?.trim()
        );
      fields = (
        <>
          <div className="feed-row">
            <FieldLabel label="Sleep last night (hours)">
              <input
                inputMode="decimal"
                value={form.sleep ?? ''}
                onChange={setField('sleep')}
                placeholder="e.g. 7.5"
              />
            </FieldLabel>
            <FieldLabel label="Hydration (liters / glasses)">
              <input
                value={form.hydration ?? ''}
                onChange={setField('hydration')}
                placeholder="e.g. 2.2 L water"
              />
            </FieldLabel>
          </div>
          <FieldLabel label="Exercise & physical activity">
            <input
              value={form.exercise ?? ''}
              onChange={setField('exercise')}
              placeholder="e.g. 35 min brisk walk + mobility"
            />
          </FieldLabel>
          <FieldLabel label="Nutrition & routine notes">
            <input
              value={form.nutrition ?? ''}
              onChange={setField('nutrition')}
              placeholder="e.g. Low-sodium home-cooked dinner, early bedtime"
            />
          </FieldLabel>
          <FieldLabel label="Date">
            <input type="date" max={todayIso()} value={form.date} onChange={setField('date')} />
          </FieldLabel>
        </>
      );
      buildPayload = () => ({
        entry: {
          kind: 'lifestyle',
          category: 'daily_activities',
          provenance: 'user_reported',
          confidence: 0.95,
          reviewStatus: 'personal_context',
          date: form.date,
          title: form.exercise?.trim()
            ? `Activity: ${form.exercise.trim()}`
            : form.sleep?.trim()
              ? `Sleep: ${form.sleep.trim()} hours`
              : 'Daily lifestyle update',
          detail: [
            form.sleep && `${form.sleep}h sleep`,
            form.hydration && `hydration: ${form.hydration}`,
            form.nutrition,
          ]
            .filter(Boolean)
            .join(' · '),
        },
      });
      break;
    }

    case 'personal_diary': {
      valid = valid && Boolean(form.diaryText?.trim());
      fields = (
        <>
          <div className="feed-row">
            <FieldLabel label="Headline or moment">
              <input
                value={form.diaryTitle ?? ''}
                onChange={setField('diaryTitle')}
                placeholder="e.g. Quiet Sunday reflection"
              />
            </FieldLabel>
            <FieldLabel label="How I felt">
              <select value={form.mood} onChange={setField('mood')}>
                <option>Calm &amp; steady</option>
                <option>Energized &amp; grateful</option>
                <option>Reflective</option>
                <option>Stretched / tired</option>
                <option>Stressed / anxious</option>
              </select>
            </FieldLabel>
          </div>
          <FieldLabel label="Personal reflection, experience, or note for your Twin">
            <textarea
              rows={4}
              value={form.diaryText ?? ''}
              onChange={setField('diaryText')}
              placeholder="Write about your day, feelings, meaningful events, or something you want your Digital Twin to always remember…"
            />
          </FieldLabel>
          <FieldLabel label="Date">
            <input type="date" max={todayIso()} value={form.date} onChange={setField('date')} />
          </FieldLabel>
        </>
      );
      buildPayload = () => {
        const title = form.diaryTitle?.trim() || `Diary · ${form.mood}`;
        const body = form.diaryText.trim();
        return {
          entry: {
            kind: 'diary',
            category: 'personal_diary',
            provenance: 'user_reported',
            confidence: 0.98,
            reviewStatus: 'personal_context',
            date: form.date,
            title,
            detail: body,
          },
          memorySync: `${title}: ${body}`,
        };
      };
      break;
    }

    case 'additional_personal_info': {
      valid = valid && Boolean(form.infoDetail?.trim());
      fields = (
        <>
          <div className="feed-row">
            <FieldLabel label="Information type">
              <select value={form.infoSubType} onChange={setField('infoSubType')}>
                <option>Family history</option>
                <option>Allergy or sensitivity</option>
                <option>Past procedure or surgery</option>
                <option>Connected health device</option>
                <option>Work, travel or life environment</option>
              </select>
            </FieldLabel>
            <FieldLabel label="Applies to">
              <select value={form.relative} onChange={setField('relative')}>
                {RELATIVES.map((rel) => (
                  <option key={rel}>{rel}</option>
                ))}
              </select>
            </FieldLabel>
          </div>
          <FieldLabel label="Details">
            <textarea
              rows={3}
              value={form.infoDetail ?? ''}
              onChange={setField('infoDetail')}
              placeholder="e.g. Father diagnosed with hypertension at 52; or connected Apple Watch sleep & HRV sync…"
            />
          </FieldLabel>
        </>
      );
      buildPayload = () => ({
        entry: {
          kind: form.infoSubType === 'Family history' ? 'family' : 'personal_info',
          category: 'additional_personal_info',
          provenance: 'user_reported',
          confidence: 0.95,
          reviewStatus: 'pending_review',
          date: form.date || todayIso(),
          title: `${form.infoSubType}${
            form.relative && form.relative !== 'Self / Personal context'
              ? ` (${form.relative})`
              : ''
          }`,
          detail: form.infoDetail.trim(),
        },
      });
      break;
    }
  }

  return (
    <form
      className="feed-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        const built = buildPayload();
        onSave(built.entry, built.memorySync);
      }}
    >
      {fields}
      <button className="primary" type="submit" disabled={!valid}>
        Add to my twin
      </button>
      <p className="note">
        Historical records are preserved chronologically — adding new updates never overwrites prior entries.
      </p>
    </form>
  );
}

export function FeedScreen({
  b,
  host,
}: {
  b: any;
  host: PortalHostBridge;
}) {
  const { navigate } = usePortalNavigation();
  const patientId = host.getPatientId();
  const [entries, setEntries] = useState<FeedEntry[]>(() =>
    host.readStore<FeedEntry[]>(FEED_STORAGE_KEY, [])
  );
  const [activeCategory, setActiveCategory] = useState<FeedCategory | null>(null);
  const [timelineFilter, setTimelineFilter] = useState<'all' | FeedCategory>('all');
  const [briefing, setBriefing] = useState<StoredBriefing | null>(() =>
    host.readStore<StoredBriefing | null>(BRIEFING_STORAGE_KEY, null)
  );
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [briefingError, setBriefingError] = useState(false);

  // Multimodal AI Quick-Capture bar state
  const [freeformText, setFreeformText] = useState('');
  const [interpreting, setInterpreting] = useState(false);
  const [interpretError, setInterpretError] = useState<string | null>(null);
  const [parsedSummary, setParsedSummary] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<Array<ParsedFeedItem & { id: string; kept: boolean }>>([]);
  const [isRecordingQuickVoice, setIsRecordingQuickVoice] = useState(false);
  const quickVoiceRecRef = useRef<MediaRecorder | null>(null);
  const quickVoiceChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setEntries(host.readStore<FeedEntry[]>(FEED_STORAGE_KEY, []));
    setBriefing(host.readStore<StoredBriefing | null>(BRIEFING_STORAGE_KEY, null));
    setParsedItems([]);
    setParsedSummary(null);
  }, [patientId, host]);

  const categoryTitle = (catId: FeedCategory) =>
    FEED_CATEGORIES.find((c) => c.id === catId)?.title ?? catId;

  const persistEntries = (next: FeedEntry[]) => {
    setEntries(next);
    host.writeStore(FEED_STORAGE_KEY, next);
    window.dispatchEvent(new Event(FEED_EVENT));
  };

  const appendMemoryNoteIfPresent = (noteText?: string) => {
    if (!noteText?.trim()) return;
    const existingRich = host.readStore<IdentityMemoryItem[]>(MEMORY_ITEMS_STORE_KEY, []);
    const item: IdentityMemoryItem = {
      id: `mem-feed-${Date.now()}`,
      at: new Date().toISOString(),
      category: 'diary',
      text: noteText.trim(),
      source: 'diary_sync',
    };
    const nextRich = [item, ...existingRich];
    host.writeStore(MEMORY_ITEMS_STORE_KEY, nextRich);
    host.writeStore(
      MEMORIES_STORE_KEY,
      nextRich.map((m) => m.text)
    );
    void saveEncryptedVault(patientId, { memories: nextRich }, host.apiBase);
  };

  const handleSaveSingle = (
    entry: Omit<FeedEntry, 'id' | 'at'>,
    alsoSaveToMemories?: string
  ) => {
    const now = new Date().toISOString();
    const created: FeedEntry = {
      ...entry,
      id: `${Date.now()}`,
      at: now,
    };
    persistEntries([created, ...entries]);
    appendMemoryNoteIfPresent(alsoSaveToMemories);
    setActiveCategory(null);
  };

  const handleInterpretMultimodal = async (opts?: {
    overrideText?: string;
    audioBase64?: string;
    audioMime?: string;
    imageBase64?: string;
    imageMime?: string;
  }) => {
    const textInput = (opts?.overrideText ?? freeformText).trim();
    if (!textInput && !opts?.audioBase64 && !opts?.imageBase64) return;

    setInterpreting(true);
    setInterpretError(null);
    try {
      const res = await fetch(resolvePortalApiUrl('/v1/feed/interpret', host.apiBase), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textInput || undefined,
          audio_base64: opts?.audioBase64,
          audio_mime_type: opts?.audioMime,
          image_base64: opts?.imageBase64,
          image_mime_type: opts?.imageMime,
          today_iso: todayIso(),
          bundle: b,
        }),
      });
      if (!res.ok) {
        throw new Error(`Interpretation returned HTTP ${res.status}`);
      }
      const data = (await res.json()) as FeedInterpretResponse;
      if (data.transcript && !freeformText.trim()) {
        setFreeformText(data.transcript);
      }
      setParsedSummary(data.summary || 'Structured into Twin timeline items.');
      setParsedItems(
        (data.items || []).map((item, i) => ({
          ...item,
          id: `pi-${Date.now()}-${i}`,
          kept: true,
        }))
      );
    } catch (err: any) {
      setInterpretError(err?.message || 'Could not interpret input right now.');
    } finally {
      setInterpreting(false);
    }
  };

  const handleCommitParsedItems = () => {
    const selected = parsedItems.filter((p) => p.kept);
    if (selected.length === 0) return;

    const nowIso = new Date().toISOString();
    const baseTs = Date.now();
    const newEntries: FeedEntry[] = selected.map((item, idx) => ({
      id: `${baseTs}-${idx}`,
      at: nowIso,
      kind: item.kind,
      category: item.category,
      provenance: item.provenance,
      confidence: item.confidence,
      reviewStatus:
        item.category === 'personal_diary' ||
        item.category === 'daily_activities' ||
        item.category === 'voice_conversations'
          ? 'personal_context'
          : 'pending_review',
      date: item.effective_date || todayIso(),
      title: item.title,
      detail: item.detail,
      structured: item.structured,
    }));

    persistEntries([...newEntries, ...entries]);

    for (const item of selected) {
      if (item.category === 'personal_diary') {
        appendMemoryNoteIfPresent(`${item.title}: ${item.detail}`);
      }
    }

    setParsedItems([]);
    setParsedSummary(null);
    setFreeformText('');
  };

  const handleToggleQuickVoice = async () => {
    if (isRecordingQuickVoice && quickVoiceRecRef.current) {
      quickVoiceRecRef.current.stop();
      setIsRecordingQuickVoice(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setInterpretError('Microphone unavailable in this browser — type or upload a file instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      quickVoiceChunksRef.current = [];
      const rec = new MediaRecorder(stream);
      quickVoiceRecRef.current = rec;
      rec.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) quickVoiceChunksRef.current.push(ev.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const mime = rec.mimeType || 'audio/webm';
        const blob = new Blob(quickVoiceChunksRef.current, { type: mime });
        const [b64, acoustics] = await Promise.all([
          blobToBase64(blob),
          analyzeBlobAcoustics(blob),
        ]);

        // Also refine voice profile if user opted into conversational voice learning
        const consent = host.readStore<VoiceConsentData | null>(SHARED_VOICE_CONSENT_KEY, null);
        if (consent?.consented && consent.allowConversationalRefinement) {
          const existingVoice = host.readStore<VoicePersonaData | null>(
            SHARED_VOICE_STORE_KEY,
            null
          );
          trainAndTranscribeUserVoice({
            audioBase64: b64,
            mimeType: mime,
            sourceType: 'conversation_audio',
            consentVerified: true,
            measuredPitchHz: acoustics.pitchHz,
            measuredBrightness: acoustics.brightness,
            patientName: b?.patient?.preferred_name || 'Member',
            existingProfile: existingVoice,
            apiBase: host.apiBase,
          })
            .then((trained) => {
              if (trained.used_real_audio) {
                host.writeStore(SHARED_VOICE_STORE_KEY, trained.profile);
                window.dispatchEvent(new Event(VOICE_UPDATED_EVENT));
              }
            })
            .catch(() => {});
        }

        await handleInterpretMultimodal({ audioBase64: b64, audioMime: mime });
      };
      rec.start();
      setIsRecordingQuickVoice(true);
    } catch {
      setInterpretError('Could not start microphone recording.');
    }
  };

  const handleAddReportRows = async (
    newEntries: Array<Omit<FeedEntry, 'id' | 'at'>>,
    briefingRows: BriefingResultPayload[],
    reportMeta: { reportDate: string; labName: string | null }
  ) => {
    const baseTs = Date.now();
    const nowIso = new Date().toISOString();
    const stamped: FeedEntry[] = newEntries.map((item, idx) => ({
      ...item,
      id: `${baseTs}-${idx}`,
      at: nowIso,
    }));

    const updated = [...stamped, ...entries];
    persistEntries(updated);
    setActiveCategory(null);

    setBriefingLoading(true);
    setBriefingError(false);
    try {
      const res = await fetch(resolvePortalApiUrl('/v1/briefing', host.apiBase), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bundle: b,
          new_results: briefingRows,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const savedBriefing: StoredBriefing = {
        patient: String(data.patient || '').trim(),
        clinician: String(data.clinician || '').trim(),
        date: reportMeta.reportDate,
        at: nowIso,
        labName: reportMeta.labName,
        count: briefingRows.length,
      };
      setBriefing(savedBriefing);
      host.writeStore(BRIEFING_STORAGE_KEY, savedBriefing);
      window.dispatchEvent(new Event(BRIEFING_EVENT));
    } catch {
      setBriefingError(true);
    } finally {
      setBriefingLoading(false);
    }
  };

  const handleRemove = (id: string) => {
    persistEntries(entries.filter((e) => e.id !== id));
  };

  const filteredEntries = useMemo(() => {
    if (timelineFilter === 'all') return entries;
    return entries.filter((e) => inferCategoryFromEntry(e) === timelineFilter);
  }, [entries, timelineFilter]);

  const Hero = host.Hero;
  const InfoBanner = host.InfoBanner;
  const Sheet = host.Sheet;
  const Icon = host.Icon;
  const AskQuestions = host.AskQuestions;
  const patientAsks = (b?.info_needed ?? []).filter((x: any) => x.from === 'you');

  const exampleSentence =
    'I had a headache yesterday, slept for only five hours, and started taking a new medicine.';

  return (
    <>
      {Hero && (
        <Hero
          title="Feed your twin"
          illus="twin"
          sub="Contribute test results, measurements, medicines, symptoms, daily activities, diary reflections, and spoken updates to your evolving Digital Twin."
        />
      )}

      {/* MULTIMODAL AI QUICK-CAPTURE BAR */}
      <section
        className="card mx-multimodal-feed-card"
        aria-label="Tell, Speak, or Upload Anything"
      >
        <div className="sec">
          <div>
            <span className="mx-eyebrow">AI Multimodal Interpreter · Provenance Tracked</span>
            <h2>Tell, speak, or upload anything</h2>
          </div>
          <button
            type="button"
            className="link"
            disabled={interpreting}
            onClick={() => {
              setFreeformText(exampleSentence);
              void handleInterpretMultimodal({ overrideText: exampleSentence });
            }}
          >
            Try multi-entity example →
          </button>
        </div>

        <p className="note">
          Type or speak naturally in one sentence — your Twin separates symptoms, sleep, activities, measurements, medicines, and diary notes into their exact timelines with confidence and source provenance.
        </p>

        <textarea
          rows={3}
          className="mx-quick-feed-textarea"
          aria-label="Natural language update for your twin"
          placeholder={`e.g. "${exampleSentence}"`}
          value={freeformText}
          onChange={(e) => setFreeformText(e.target.value)}
        />

        <div className="mx-voice-btn-row">
          <button
            type="button"
            className="primary sm"
            disabled={!freeformText.trim() || interpreting}
            onClick={() => void handleInterpretMultimodal()}
          >
            {interpreting ? 'Interpreting…' : 'Interpret & structure'}
          </button>

          <button
            type="button"
            className={isRecordingQuickVoice ? 'primary sm' : 'secondary sm'}
            disabled={interpreting}
            onClick={() => void handleToggleQuickVoice()}
          >
            {isRecordingQuickVoice ? 'Stop & interpret speech' : 'Speak naturally'}
          </button>

          <label className="secondary sm mx-file-btn">
            <span>Upload image / note</span>
            <input
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              disabled={interpreting}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (f.type === 'application/pdf') {
                  setActiveCategory('test_results');
                  return;
                }
                const b64 = await fileToBase64(f);
                await handleInterpretMultimodal({
                  imageBase64: b64,
                  imageMime: inferMimeType(f),
                });
              }}
            />
          </label>
        </div>

        {interpretError && (
          <p className="note mx-err-note" role="alert">
            {interpretError}
          </p>
        )}

        {parsedItems.length > 0 && (
          <div className="mx-parsed-preview" data-testid="parsed-feed-preview">
            <div className="sec">
              <b>{parsedSummary}</b>
              <span className="note mx-tabular">
                {parsedItems.filter((i) => i.kept).length} of {parsedItems.length} selected
              </span>
            </div>

            <ul className="rs-rows mx-review-rows">
              {parsedItems.map((item) => (
                <li
                  key={item.id}
                  className={`mx-review-row${item.kept ? '' : ' is-unticked'}`}
                >
                  <label className="mx-review-check">
                    <input
                      type="checkbox"
                      checked={item.kept}
                      onChange={() =>
                        setParsedItems((prev) =>
                          prev.map((x) =>
                            x.id === item.id ? { ...x, kept: !x.kept } : x
                          )
                        )
                      }
                    />
                    <span className="mx-review-main">
                      <span className="mx-review-title-line">
                        <b>{item.title}</b>
                      </span>
                      <small className="mx-review-sub">
                        {categoryTitle(item.category)} ·{' '}
                        {host.formatDate(item.effective_date) || item.effective_date || todayIso()} ·{' '}
                        {PROVENANCE_LABELS[item.provenance] || item.provenance} ·{' '}
                        <span className="mx-tabular">
                          {Math.round(item.confidence * 100)}% confidence
                        </span>
                      </small>
                      {item.detail && <small className="mx-review-twin">{item.detail}</small>}
                    </span>
                  </label>
                </li>
              ))}
            </ul>

            <div className="mx-voice-btn-row">
              <button
                type="button"
                className="primary sm"
                disabled={parsedItems.every((i) => !i.kept)}
                onClick={handleCommitParsedItems}
              >
                Add selected to my twin
              </button>
              <button
                type="button"
                className="secondary sm"
                onClick={() => {
                  setParsedItems([]);
                  setParsedSummary(null);
                }}
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </section>

      {/* REPORT BRIEFING CARD */}
      {(briefingLoading || briefing || briefingError) && (
        <section className="card mx-briefing-card" aria-label="Your report briefing">
          <div className="sec">
            <div>
              <span className="mx-eyebrow">Longitudinal Report Briefing</span>
              <h2>What changed in your latest report</h2>
            </div>
            <span className="state warn">
              <i />
              Pending care-team check
            </span>
          </div>

          {briefingLoading ? (
            <p className="note" role="status">
              Preparing your plain-language longitudinal briefing…
            </p>
          ) : briefingError && !briefing ? (
            <p className="note">
              Your results were appended to your Twin timeline; briefing synthesis was temporarily unavailable.
            </p>
          ) : briefing ? (
            <>
              <p className="mx-briefing-body">{briefing.patient}</p>
              <div className="mx-briefing-foot">
                <span className="note">
                  {briefing.labName ? `${briefing.labName} · ` : ''}
                  {host.formatDate(briefing.date)} · {briefing.count} result
                  {briefing.count === 1 ? '' : 's'} added
                </span>
                <button
                  type="button"
                  className="link"
                  onClick={() => navigate('#/you/checkin:ask')}
                >
                  Ask your twin about these changes →
                </button>
              </div>
            </>
          ) : null}
        </section>
      )}

      {/* TWIN OPEN QUESTIONS */}
      {patientAsks.length > 0 && AskQuestions && (
        <section className="card feed-asks">
          <div className="sec">
            <h2>Your twin is asking</h2>
          </div>
          <AskQuestions b={b} />
        </section>
      )}

      {/* 8 COMPREHENSIVE PERSONAL DATA CATEGORIES */}
      <h2 className="feed-h">Contribute by category (8 domains)</h2>
      <div className="feed-kinds mx-feed-8grid" data-testid="feed-categories-grid">
        {FEED_CATEGORIES.map((cat) => {
          const count = entries.filter((e) => inferCategoryFromEntry(e) === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              className="card feed-kind"
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className="tb-ic" aria-hidden={true}>
                {Icon ? <Icon name={cat.icon} size={22} /> : null}
              </span>
              <span>
                <b>
                  {cat.title}
                  {count > 0 ? ` (${count})` : ''}
                </b>
                <small>{cat.subtitle}</small>
              </span>
              <span className="feed-plus" aria-hidden={true}>
                +
              </span>
            </button>
          );
        })}
      </div>

      {/* LONGITUDINAL PROVENANCE TIMELINE */}
      <section className="card feed-list">
        <div className="sec">
          <div>
            <h2>Longitudinal contributions to your twin</h2>
            <p className="note">
              Every record preserves its timestamp, source provenance, and verification state — prior records are never overwritten.
            </p>
          </div>
          <span className="note mx-tabular">
            {entries.length ? `${entries.length} recorded` : 'Nothing yet'}
          </span>
        </div>

        {entries.length > 0 && (
          <div className="mx-kg-filters" role="tablist" aria-label="Filter contributions by category">
            <button
              type="button"
              className={`mx-kg-chip${timelineFilter === 'all' ? ' is-active' : ''}`}
              onClick={() => setTimelineFilter('all')}
            >
              All ({entries.length})
            </button>
            {FEED_CATEGORIES.map((cat) => {
              const cnt = entries.filter((e) => inferCategoryFromEntry(e) === cat.id).length;
              if (!cnt) return null;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`mx-kg-chip${timelineFilter === cat.id ? ' is-active' : ''}`}
                  onClick={() => setTimelineFilter(cat.id)}
                >
                  {cat.title} ({cnt})
                </button>
              );
            })}
          </div>
        )}

        {!filteredEntries.length && (
          <p className="note">
            Contributions appear chronologically here with full provenance and care-team review tracking.
          </p>
        )}

        <ul className="rs-rows mx-added-rows">
          {filteredEntries.map((entry) => {
            const cat = inferCategoryFromEntry(entry);
            const prov = entry.provenance ? PROVENANCE_LABELS[entry.provenance] : 'User reported';
            const isPersonalContext =
              entry.reviewStatus === 'personal_context' ||
              cat === 'personal_diary' ||
              cat === 'daily_activities' ||
              cat === 'voice_conversations';

            return (
              <li key={entry.id}>
                <span>
                  <b title={entry.title}>{entry.title}</b>
                  <small>
                    {categoryTitle(cat)} · {host.formatDate(entry.date)} · {prov}
                    {entry.confidence != null
                      ? ` · ${Math.round(entry.confidence * 100)}% conf.`
                      : ''}
                    {entry.detail ? ` — ${entry.detail}` : ''}
                  </small>
                </span>
                <span className={`state ${isPersonalContext ? 'ok' : 'warn'}`}>
                  <i />
                  {isPersonalContext ? 'Saved to Twin' : 'Waiting for check'}
                </span>
                <button
                  type="button"
                  className="link"
                  onClick={() => handleRemove(entry.id)}
                  aria-label={`Remove ${entry.title}`}
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {InfoBanner && (
        <InfoBanner
          text="Clinical results, medicines, and measurements are reviewed by your care team before modifying medical rules; personal diary and daily notes enrich your Twin immediately."
          tone="info"
        />
      )}

      {activeCategory && Sheet && (
        <Sheet
          onClose={() => setActiveCategory(null)}
          label={categoryTitle(activeCategory)}
        >
          <h2>{categoryTitle(activeCategory)}</h2>
          <CategoryEntryForm
            category={activeCategory}
            bundle={b}
            host={host}
            onSave={handleSaveSingle}
            onAddReportRows={handleAddReportRows}
          />
        </Sheet>
      )}
    </>
  );
}
