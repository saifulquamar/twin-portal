import React, { useEffect, useMemo, useRef, useState } from 'react';
import { cleanLabUnit, matchExtractedResultsToTwin } from './lab-matching';
import { usePortalNavigation } from './navigation-context';
import type {
  BriefingResultPayload,
  ExtractApiResponse,
  FeedEntry,
  FeedKind,
  MatchedLabRow,
  PortalHostBridge,
  StoredBriefing,
} from './types';

const FEED_STORAGE_KEY = 'mx-feed';
export const BRIEFING_STORAGE_KEY = 'mx-briefing';
export const BRIEFING_EVENT = 'mx-briefing-updated';
export const FEED_EVENT = 'mx-feed-updated';

const VITE_ASK_URL: string =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_ASK_URL) || '';

function resolveApiUrl(path: string, hostApiBase?: string): string {
  const base = (VITE_ASK_URL || hostApiBase || '').replace(/\/$/, '');
  return `${base}${path}`;
}

const FEED_KINDS: Array<[FeedKind, string, string, string]> = [
  ['lab', 'A lab result', 'A blood or urine value from a report', 'blood'],
  ['measure', 'A measurement', 'Blood pressure, weight, heart rate, glucose', 'heart'],
  ['medicine', 'A medicine or supplement', 'Something you take, with its dose', 'lifestyle'],
  ['symptom', 'A symptom', 'Something new or changing', 'checkin'],
  ['family', 'Family history', 'A condition in a relative', 'dna'],
  ['lifestyle', 'Your habits', 'Sleep, activity, smoking, alcohol', 'lifestyle'],
  ['report', 'A report or scan', 'Upload a PDF or photo for your care team', 'share'],
];

const MEASURE_UNITS: Array<[string, string]> = [
  ['Blood pressure', 'mmHg'],
  ['Weight', 'kg'],
  ['Heart rate', 'bpm'],
  ['Blood glucose', 'mg/dL'],
  ['Waist', 'cm'],
  ['Oxygen saturation', '%'],
];

const RELATIVES = [
  'Mother',
  'Father',
  'Sister',
  'Brother',
  'Grandmother',
  'Grandfather',
  'Aunt',
  'Uncle',
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
      const response = await fetch(resolveApiUrl('/v1/extract', apiBase), {
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
        date: effectiveDate,
        title: `${row.name.trim()} ${row.value}${cleanUnit ? ` ${cleanUnit}` : ''}`.trim(),
        detail: `from report, ${effectiveDate}`,
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
      <FieldLabel label="File (PDF or photo)">
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
          className="secondary mx-sample-btn"
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
          <div className="mx-status-line">
            <span className="ap-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <b>Reading the report…</b>
          </div>
          <p className="note">
            Checking printed test names, values, reference ranges, and comparing them against your twin.
          </p>
        </div>
      )}

      {extractState === 'empty' && (
        <div className="card mx-extract-status" role="status">
          <div className="sec">
            <span className="state warn">
              <i />
              Nothing found
            </span>
          </div>
          <p className="note">
            We couldn’t find any printed lab results on that file. Try uploading a clearer photo or PDF lab report.
          </p>
        </div>
      )}

      {extractState === 'unreachable' && (
        <div className="card mx-extract-status" role="alert">
          <div className="sec">
            <span className="state warn">
              <i />
              Server not reachable
            </span>
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
          <p className="note">
            The report reader could not be reached right now. Please check that the server is running and try again.
          </p>
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
              Waiting for check
            </span>
          </div>

          <div className="mx-review-table-wrap">
            <ul className="rs-rows mx-review-rows">
              {rows.map((row) => {
                const displayUnit = cleanLabUnit(row.unit);
                const prevDisplayUnit = cleanLabUnit(row.prevUnit || row.unit);
                const flagTone =
                  row.flag === 'high' || row.flag === 'low' ? 'warn' : 'ok';
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
                              Twin latest ({row.matchedLabKey || row.name}):{' '}
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
                            <span>No prior value in twin</span>
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
        Add to my twin
      </button>

      <p className="note">
        Your care team checks it first. Nothing you add changes your results, medicines or advice until then.
      </p>
    </form>
  );
}

interface StandardFeedFormProps {
  kind: Exclude<FeedKind, 'report'>;
  bundle: any;
  onSave: (entry: Omit<FeedEntry, 'id' | 'at'>) => void;
}

function StandardFeedForm({ kind, bundle, onSave }: StandardFeedFormProps) {
  const [form, setForm] = useState<Record<string, string>>({
    date: todayIso(),
    measure: 'Blood pressure',
    relative: 'Mother',
    medKind: 'Medicine',
    severity: '3',
    smoking: 'Never',
  });

  const setField =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const labSuggestions = useMemo(() => Object.keys(bundle?.labs ?? {}), [bundle]);
  const measureUnit =
    MEASURE_UNITS.find(([m]) => m === form.measure)?.[1] ?? '';
  const isNumeric = (v?: string) =>
    v != null && v.trim() !== '' && !Number.isNaN(Number(v));

  const dateInput = (
    <FieldLabel label="Date">
      <input
        type="date"
        max={todayIso()}
        value={form.date ?? ''}
        onChange={setField('date')}
      />
    </FieldLabel>
  );

  let valid = Boolean(form.date);
  let fields: React.ReactNode = null;
  let buildEntry = (): Omit<FeedEntry, 'id' | 'at'> => ({
    kind,
    date: form.date,
    title: '',
    detail: '',
  });

  switch (kind) {
    case 'lab': {
      valid = valid && Boolean(form.test?.trim()) && isNumeric(form.value);
      fields = (
        <>
          <FieldLabel label="Test">
            <input
              list="feed-labs"
              value={form.test ?? ''}
              onChange={setField('test')}
              placeholder="e.g. HbA1c"
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
                placeholder="e.g. %"
              />
            </FieldLabel>
          </div>
          {dateInput}
          <FieldLabel label="Laboratory (optional)">
            <input value={form.lab ?? ''} onChange={setField('lab')} />
          </FieldLabel>
        </>
      );
      buildEntry = () => ({
        kind,
        date: form.date,
        title: `${form.test.trim()} ${form.value} ${form.unit ?? ''}`.trim(),
        detail: form.lab?.trim() ?? '',
      });
      break;
    }
    case 'measure': {
      const isBp = form.measure === 'Blood pressure';
      valid = valid && (isBp ? isNumeric(form.sys) && isNumeric(form.dia) : isNumeric(form.value));
      fields = (
        <>
          <FieldLabel label="What">
            <select value={form.measure} onChange={setField('measure')}>
              {MEASURE_UNITS.map(([m]) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </FieldLabel>
          {isBp ? (
            <div className="feed-row">
              <FieldLabel label="Systolic">
                <input
                  inputMode="numeric"
                  value={form.sys ?? ''}
                  onChange={setField('sys')}
                />
              </FieldLabel>
              <FieldLabel label="Diastolic">
                <input
                  inputMode="numeric"
                  value={form.dia ?? ''}
                  onChange={setField('dia')}
                />
              </FieldLabel>
            </div>
          ) : (
            <FieldLabel label={`Value (${measureUnit})`}>
              <input
                inputMode="decimal"
                value={form.value ?? ''}
                onChange={setField('value')}
              />
            </FieldLabel>
          )}
          {dateInput}
        </>
      );
      buildEntry = () => ({
        kind,
        date: form.date,
        title: `${form.measure} ${isBp ? `${form.sys}/${form.dia}` : form.value} ${measureUnit}`,
        detail: 'measured at home',
      });
      break;
    }
    case 'medicine': {
      valid = valid && Boolean(form.name?.trim());
      fields = (
        <>
          <FieldLabel label="Medicine or supplement">
            <select value={form.medKind} onChange={setField('medKind')}>
              <option>Medicine</option>
              <option>Supplement</option>
            </select>
          </FieldLabel>
          <FieldLabel label="Name">
            <input value={form.name ?? ''} onChange={setField('name')} />
          </FieldLabel>
          <div className="feed-row">
            <FieldLabel label="Dose">
              <input
                value={form.dose ?? ''}
                onChange={setField('dose')}
                placeholder="e.g. 50 mg"
              />
            </FieldLabel>
            <FieldLabel label="How often">
              <input
                value={form.freq ?? ''}
                onChange={setField('freq')}
                placeholder="e.g. once a day"
              />
            </FieldLabel>
          </div>
          <FieldLabel label="Started on">
            <input
              type="date"
              max={todayIso()}
              value={form.date ?? ''}
              onChange={setField('date')}
            />
          </FieldLabel>
        </>
      );
      buildEntry = () => ({
        kind,
        date: form.date,
        title: [form.name.trim(), form.dose].filter(Boolean).join(' '),
        detail: [form.medKind, form.freq].filter(Boolean).join(', '),
      });
      break;
    }
    case 'symptom': {
      valid = valid && Boolean(form.what?.trim());
      fields = (
        <>
          <FieldLabel label="What you notice">
            <input
              value={form.what ?? ''}
              onChange={setField('what')}
              placeholder="e.g. swollen ankles"
            />
          </FieldLabel>
          <FieldLabel label="Since">
            <input
              type="date"
              max={todayIso()}
              value={form.date ?? ''}
              onChange={setField('date')}
            />
          </FieldLabel>
          <FieldLabel label={`How much it bothers you: ${form.severity} of 5`}>
            <input
              type="range"
              min="1"
              max="5"
              value={form.severity}
              onChange={setField('severity')}
            />
          </FieldLabel>
        </>
      );
      buildEntry = () => ({
        kind,
        date: form.date,
        title: form.what.trim(),
        detail: `bothers you ${form.severity} of 5`,
      });
      break;
    }
    case 'family': {
      valid = valid && Boolean(form.condition?.trim());
      fields = (
        <>
          <FieldLabel label="Relative">
            <select value={form.relative} onChange={setField('relative')}>
              {RELATIVES.map((rel) => (
                <option key={rel}>{rel}</option>
              ))}
            </select>
          </FieldLabel>
          <FieldLabel label="Condition">
            <input
              value={form.condition ?? ''}
              onChange={setField('condition')}
              placeholder="e.g. kidney disease"
            />
          </FieldLabel>
          <FieldLabel label="Age when diagnosed (optional)">
            <input
              inputMode="numeric"
              value={form.age ?? ''}
              onChange={setField('age')}
            />
          </FieldLabel>
        </>
      );
      buildEntry = () => ({
        kind,
        date: todayIso(),
        title: `${form.relative}: ${form.condition.trim()}`,
        detail: form.age ? `diagnosed at ${form.age}` : '',
      });
      break;
    }
    case 'lifestyle': {
      valid =
        valid &&
        (isNumeric(form.sleep) ||
          isNumeric(form.activity) ||
          isNumeric(form.alcohol) ||
          Boolean(form.smoking));
      fields = (
        <>
          <div className="feed-row">
            <FieldLabel label="Sleep (hours a night)">
              <input
                inputMode="decimal"
                value={form.sleep ?? ''}
                onChange={setField('sleep')}
              />
            </FieldLabel>
            <FieldLabel label="Activity (minutes a week)">
              <input
                inputMode="numeric"
                value={form.activity ?? ''}
                onChange={setField('activity')}
              />
            </FieldLabel>
          </div>
          <div className="feed-row">
            <FieldLabel label="Smoking">
              <select value={form.smoking} onChange={setField('smoking')}>
                <option>Never</option>
                <option>Former</option>
                <option>Current</option>
              </select>
            </FieldLabel>
            <FieldLabel label="Alcohol (drinks a week)">
              <input
                inputMode="numeric"
                value={form.alcohol ?? ''}
                onChange={setField('alcohol')}
              />
            </FieldLabel>
          </div>
        </>
      );
      buildEntry = () => ({
        kind,
        date: todayIso(),
        title: 'Your habits',
        detail: [
          form.sleep && `${form.sleep} h sleep`,
          form.activity && `${form.activity} min activity a week`,
          `smoking: ${form.smoking.toLowerCase()}`,
          form.alcohol && `${form.alcohol} drinks a week`,
        ]
          .filter(Boolean)
          .join(', '),
      });
      break;
    }
  }

  return (
    <form
      className="feed-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSave(buildEntry());
      }}
    >
      {fields}
      <button className="primary" type="submit" disabled={!valid}>
        Add to my twin
      </button>
      <p className="note">
        Your care team checks it first. Nothing you add changes your results, medicines or advice until then.
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
  const [activeKind, setActiveKind] = useState<FeedKind | null>(null);
  const [briefing, setBriefing] = useState<StoredBriefing | null>(() =>
    host.readStore<StoredBriefing | null>(BRIEFING_STORAGE_KEY, null)
  );
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [briefingError, setBriefingError] = useState(false);

  // Sync when patient switches
  useEffect(() => {
    setEntries(host.readStore<FeedEntry[]>(FEED_STORAGE_KEY, []));
    setBriefing(host.readStore<StoredBriefing | null>(BRIEFING_STORAGE_KEY, null));
  }, [patientId, host]);

  const kindLabel = (k: FeedKind) =>
    FEED_KINDS.find(([id]) => id === k)?.[1] ?? k;

  const persistEntries = (next: FeedEntry[]) => {
    setEntries(next);
    host.writeStore(FEED_STORAGE_KEY, next);
    window.dispatchEvent(new Event(FEED_EVENT));
  };

  const handleSaveSingle = (entry: Omit<FeedEntry, 'id' | 'at'>) => {
    const now = new Date().toISOString();
    const created: FeedEntry = {
      ...entry,
      id: `${Date.now()}`,
      at: now,
    };
    persistEntries([created, ...entries]);
    setActiveKind(null);
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
    setActiveKind(null);

    // Immediately generate patient + clinician briefing via POST /v1/briefing
    setBriefingLoading(true);
    setBriefingError(false);
    try {
      const res = await fetch(resolveApiUrl('/v1/briefing', host.apiBase), {
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

  const Hero = host.Hero;
  const InfoBanner = host.InfoBanner;
  const Sheet = host.Sheet;
  const Icon = host.Icon;
  const AskQuestions = host.AskQuestions;
  const patientAsks = (b?.info_needed ?? []).filter((x: any) => x.from === 'you');

  return (
    <>
      {Hero && (
        <Hero
          title="Feed your twin"
          illus="twin"
          sub="Add what your twin doesn't know yet. Your care team checks each entry before your twin uses it."
        />
      )}

      {(briefingLoading || briefing || briefingError) && (
        <section
          className="card mx-briefing-card"
          aria-label="Your report briefing"
        >
          <div className="sec">
            <div>
              <span className="mx-eyebrow">Report briefing</span>
              <h2>What changed in your latest report</h2>
            </div>
            <span className="state warn">
              <i />
              Waiting for check
            </span>
          </div>

          {briefingLoading ? (
            <div className="mx-status-line" role="status">
              <span className="ap-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span>Preparing your plain-language briefing…</span>
            </div>
          ) : briefingError && !briefing ? (
            <p className="note">
              Your results were saved to “Added by you”, though the briefing service could not be reached right now.
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
                  onClick={() => {
                    navigate('#/you/checkin:ask');
                  }}
                >
                  Ask your twin about these changes →
                </button>
              </div>
            </>
          ) : null}
        </section>
      )}

      {patientAsks.length > 0 && AskQuestions && (
        <section className="card feed-asks">
          <div className="sec">
            <h2>Your twin is asking</h2>
          </div>
          <AskQuestions b={b} />
        </section>
      )}

      <h2 className="feed-h">Add something new</h2>
      <div className="feed-kinds">
        {FEED_KINDS.map(([kindId, title, subtitle, iconName]) => (
          <button
            key={kindId}
            className="card feed-kind"
            onClick={() => setActiveKind(kindId)}
          >
            <span className="tb-ic" aria-hidden={true}>
              {Icon ? <Icon name={iconName} size={22} /> : null}
            </span>
            <span>
              <b>{title}</b>
              <small>{subtitle}</small>
            </span>
            <span className="feed-plus" aria-hidden={true}>
              +
            </span>
          </button>
        ))}
      </div>

      <section className="card feed-list">
        <div className="sec">
          <h2>Added by you</h2>
          <span className="note">
            {entries.length
              ? `${entries.length} waiting for your care team`
              : 'Nothing yet'}
          </span>
        </div>
        {!entries.length && (
          <p className="note">
            What you add appears here, marked as waiting until your care team has checked it.
          </p>
        )}
        <ul className="rs-rows mx-added-rows">
          {entries.map((entry) => (
            <li key={entry.id}>
              <span>
                <b title={entry.title}>{entry.title}</b>
                <small>
                  {kindLabel(entry.kind)} · {host.formatDate(entry.date)}
                  {entry.detail ? ` · ${entry.detail}` : ''}
                </small>
              </span>
              <span className="state warn">
                <i />
                Waiting for check
              </span>
              <button
                className="link"
                onClick={() => handleRemove(entry.id)}
                aria-label={`Remove ${entry.title}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      {InfoBanner && (
        <InfoBanner
          text="Your twin never changes from an entry until your care team has checked it"
          tone="info"
        />
      )}

      {activeKind && Sheet && (
        <Sheet
          onClose={() => setActiveKind(null)}
          label={kindLabel(activeKind)}
        >
          <h2>{kindLabel(activeKind)}</h2>
          {activeKind === 'report' ? (
            <ReportScanForm
              bundle={b}
              defaultDate={todayIso()}
              apiBase={host.apiBase}
              onAddKeptRows={handleAddReportRows}
            />
          ) : (
            <StandardFeedForm
              kind={activeKind}
              bundle={b}
              onSave={handleSaveSingle}
            />
          )}
        </Sheet>
      )}
    </>
  );
}
