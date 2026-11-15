import React, { useEffect, useMemo, useState } from 'react';
import { usePortalAuth } from './auth-context';
import { FEED_EVENT } from './feed';
import { KnowledgeGraphCard } from './kg-graph';
import {
  FACE_STORE_KEY,
  MEMORIES_STORE_KEY,
  PHOTO_STORE_KEY,
} from './preserve';
import {
  computePreservationScore,
  computeTwinCompleteness,
  type FaceLikenessData,
  type VoicePersonaData,
} from './preserve-math';
import type { FeedEntry } from './types';
import { SHARED_VOICE_STORE_KEY, VOICE_UPDATED_EVENT } from './voice-engine';

const EVIDENCE_COLORS: Record<string, string> = {
  A: '#00708A',
  B: '#05B7B9',
  C: '#69D4D5',
  D: '#B2ACC7',
  E: '#D8D6E3',
};

function pickPrimaryBiomarker(bundle: any, formatDate: (d: string) => string) {
  const labsObj: Record<string, any[]> = bundle?.labs || {};
  const labEntries = Object.entries(labsObj).filter(
    ([, pts]) => Array.isArray(pts) && pts.length > 0
  );
  if (labEntries.length === 0) return null;

  // Prefer an analyte with a tracked change or flagged latest point so every one of the 12 patients renders their true clinical signal
  const changes: any[] = Array.isArray(bundle?.changes) ? bundle.changes : [];
  let chosen =
    labEntries.find(([name]) => changes.some((c) => c.analyte === name)) ||
    labEntries.find(([, pts]) => pts[pts.length - 1]?.flag) ||
    labEntries[0];

  const [labName, points] = chosen;
  const latest = points[points.length - 1];
  const changeRec = changes.find((c) => c.analyte === labName);

  // Map lab name to relevant organ if available
  const lower = labName.toLowerCase();
  let organKey = 'heart';
  let iconName = 'blood';
  if (lower.includes('tsh') || lower.includes('t4') || lower.includes('thyroid')) {
    organKey = 'thyroid';
    iconName = 'thyroid';
  } else if (lower.includes('egfr') || lower.includes('creatinine') || lower.includes('uacr')) {
    organKey = 'kidneys';
    iconName = 'kidneys';
  } else if (lower.includes('alt') || lower.includes('ast') || lower.includes('ggt')) {
    organKey = 'liver';
    iconName = 'liver';
  } else if (lower.includes('ldl') || lower.includes('apob') || lower.includes('chol')) {
    organKey = 'heart';
    iconName = 'heart';
  } else if (lower.includes('hba1c') || lower.includes('glucose') || lower.includes('insulin')) {
    organKey = 'pancreas';
    iconName = 'blood';
  }

  const organObj = bundle?.organs?.[organKey];
  const needsAttention = organObj?.state === 'attention' || Boolean(latest?.flag);

  const safeLogs = points.map((p: any) => Math.log10(Math.max(0.001, Number(p.value) || 1)));
  const minLog = Math.min(...safeLogs);
  const maxLog = Math.max(...safeLogs);
  const sparkPath =
    points.length > 1
      ? points
          .map((p: any, idx: number) => {
            const lv = Math.log10(Math.max(0.001, Number(p.value) || 1));
            const x = (idx / Math.max(1, points.length - 1)) * 120;
            const y = 31 - ((lv - minLog) / Math.max(0.01, maxLog - minLog)) * 28;
            return `${idx ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(' ')
      : 'M0,18 L120,18';

  const subLabel = changeRec?.from?.[0]
    ? `${Math.round(changeRec.pct)}% since ${formatDate(changeRec.from[0])
        .split(' ')
        .slice(1)
        .join(' ')}`
    : `${latest.unit || ''}`.trim();

  return {
    labName,
    latest,
    organKey,
    organLabel: organObj?.label || labName,
    iconName,
    needsAttention,
    sparkPath,
    subLabel,
  };
}

/**
 * Upgraded Home Bento Panel (`Oa`):
 * - Removes the duplicate wide descriptive "Feed your twin" card (since `+` Feed icon lives on the 3D Twin stage)
 * - Adds a prominent "Preserve your twin" shortcut card + "Ask your twin ('How am I doing?')" shortcut
 * - Dynamically adapts biomarker sparklines & LE8 scores across all 12 patient profiles
 */
export function HomeBentoPanel({
  b,
  go,
  counts,
  open,
  onBio,
  nextStepFn,
  panelUnlockCountFn,
  Ring,
  Takeaway,
  Icon,
  readStore,
  formatDate,
}: {
  b: any;
  go: (tab: string, sub?: string | null) => void;
  counts: { knows: number; changed: number; unknown: number; sources: number };
  open: (sheet: string) => void;
  onBio: () => void;
  nextStepFn: (b: any) => { title: string; why: string; label: string; to: [string, string?] };
  panelUnlockCountFn: (b: any) => number;
  Ring: any;
  Takeaway: any;
  Icon: any;
  readStore: <T>(key: string, fallback: T) => T;
  formatDate: (d: string) => string;
}) {
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const bump = () => setRefreshTick((v) => v + 1);
    window.addEventListener(VOICE_UPDATED_EVENT, bump);
    window.addEventListener(FEED_EVENT, bump);
    return () => {
      window.removeEventListener(VOICE_UPDATED_EVENT, bump);
      window.removeEventListener(FEED_EVENT, bump);
    };
  }, []);

  const nextStep = nextStepFn(b);
  const faceProfile = readStore<FaceLikenessData | null>(FACE_STORE_KEY, null);
  const voiceProfile = readStore<VoicePersonaData | null>(SHARED_VOICE_STORE_KEY, null);
  const memories = readStore<string[]>(MEMORIES_STORE_KEY, []);
  const feedEntries = readStore<FeedEntry[]>('mx-feed', []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const preservation = useMemo(
    () =>
      computePreservationScore({
        hasTwinRecord: Boolean(b?.patient),
        faceLikenessScore: faceProfile?.likeness_score ?? 0,
        voiceFidelityScore: voiceProfile?.used_real_audio ? voiceProfile.fidelity_score : 0,
        memoriesCount: memories.length,
      }),
    [b?.patient, faceProfile, voiceProfile, memories.length, refreshTick]
  );

  const primaryBio = useMemo(() => pickPrimaryBiomarker(b, formatDate), [b, formatDate]);

  const phq9 = (b?.wellbeing || []).find((w: any) => w.instrument === 'PHQ-9');
  const gad7 = (b?.wellbeing || []).find((w: any) => w.instrument === 'GAD-7');
  const fmtWellbeing = (w: any) =>
    w ? (w.total_low === w.total_high ? `${w.total_low}` : `${w.total_low}-${w.total_high}`) : '-';

  const domains: any[] = b?.domains || [];
  const assessedDomains = domains.filter((d) => d.status !== 'none').length;

  const vit = b?.vitals?.[0];
  const bmi =
    vit?.height_cm && vit?.weight_kg
      ? (vit.weight_kg / (vit.height_cm / 100) ** 2).toFixed(1)
      : null;

  const statTile = (label: string) =>
    b?.stats?.tiles?.find((t: any) => t.label === label)?.value ?? '-';

  const scoredLe8 = (b?.le8 || []).filter((x: any) => x.points != null);
  const avgLe8 =
    scoredLe8.length > 0
      ? Math.round(
          scoredLe8.reduce((acc: number, item: any) => acc + Number(item.points || 0), 0) /
            scoredLe8.length
        )
      : null;

  const planDone = readStore<string[]>('mx-plan-done', []).length;

  return (
    <div className="bento">
      {/* 1. Primary clinical next step */}
      <button
        type="button"
        className="bt wide next"
        onClick={() => go(nextStep.to[0], nextStep.to[1] ?? null)}
      >
        <span className="bt-l">Your next step</span>
        <b>{nextStep.title}</b>
        <small>{nextStep.why}</small>
        <span className="bt-cta">{nextStep.label} ›</span>
      </button>

      {/* 2. Prominent Preserve Your Twin shortcut (replaces duplicate wide Feed Your Twin card) */}
      <button
        type="button"
        className="bt wide mx-bento-preserve"
        onClick={() => go('you', 'preserve')}
      >
        <span className="bt-l">
          <Icon name="preserve" size={18} />
          Preserve your twin
        </span>
        <b>
          {preservation.totalPct >= 58
            ? `${preservation.totalPct}% preserved · ${preservation.stageLabel}`
            : '3D likeness, your own voice & personal memory vault'}
        </b>
        <small>
          {voiceProfile?.used_real_audio && faceProfile
            ? `3D portrait + ${voiceProfile.prebuilt_voice} (${voiceProfile.pitch_hz || 175} Hz) voice active`
            : 'Build a permanent digital representation with your face, voice, and life story'}
        </small>
        <span className="bt-cta">Open 3D &amp; Voice Studio ›</span>
      </button>

      {/* 3. Voice-first Ask Your Twin ("How am I doing?") shortcut */}
      <button
        type="button"
        className="bt wide mx-bento-ask"
        onClick={() => go('you', 'checkin:ask')}
      >
        <span className="bt-l">
          <Icon name="checkin" size={18} />
          Ask your twin · Voice &amp; 3D
        </span>
        <b>“How am I doing overall right now?”</b>
        <small>
          Speak to yourself in your own voice — grounded in {counts.knows} clinical facts
          {feedEntries.length > 0 ? ` + ${feedEntries.length} personal updates` : ''}
        </small>
        <span className="bt-cta">Speak with Twin ›</span>
      </button>

      {/* 4. Dynamic primary biomarker sparkline for ANY of the 12 patients */}
      {primaryBio && (
        <button
          type="button"
          className={`bt${primaryBio.needsAttention ? ' attention' : ''}`}
          onClick={() =>
            b?.organs?.[primaryBio.organKey]
              ? go('twin', `o:${primaryBio.organKey}`)
              : go('you', 'health')
          }
        >
          <span className="bt-l">
            <Icon name={primaryBio.iconName} size={18} />
            {primaryBio.labName}
          </span>
          <b className="bt-v mx-tabular">{primaryBio.latest.value}</b>
          {primaryBio.needsAttention && (
            <Takeaway text={`${primaryBio.organLabel} needs attention`} tone="attention" />
          )}
          <svg className="spark" viewBox="0 0 120 34" aria-hidden="true">
            <path d={primaryBio.sparkPath} fill="none" stroke="#05B7B9" strokeWidth="2" />
          </svg>
          <small>{primaryBio.subLabel}</small>
        </button>
      )}

      {/* 5. Health areas */}
      <button type="button" className="bt" onClick={() => go('panel')}>
        <span className="bt-l">
          <Icon name="twin" size={18} />
          Health areas
        </span>
        <span className="bt-ring">
          <Ring value={assessedDomains} total={Math.max(1, domains.length)} size={46} />
          <b className="bt-v mx-tabular">
            {assessedDomains}
            <small>/{domains.length}</small>
          </b>
        </span>
        <small>with data · panel adds {panelUnlockCountFn(b)}</small>
      </button>

      {/* 6. Mood & Worry (when present in bundle) */}
      {phq9 && (
        <button type="button" className="bt" onClick={() => go('twin', 'o:brain')}>
          <span className="bt-l">
            <Icon name="mind" size={18} />
            Mood
          </span>
          <b className="bt-v mx-tabular">{fmtWellbeing(phq9)}</b>
          <small>PHQ-9 · {phq9.band_high}</small>
        </button>
      )}

      {gad7 && (
        <button type="button" className="bt" onClick={() => go('twin', 'o:brain')}>
          <span className="bt-l">
            <Icon name="mind" size={18} />
            Worry
          </span>
          <b className="bt-v mx-tabular">{fmtWellbeing(gad7)}</b>
          <small>
            GAD-7 · {gad7.band_low}
            {gad7.band_high !== gad7.band_low ? ` to ${gad7.band_high}` : ''}
          </small>
        </button>
      )}

      {/* 7. Biological age */}
      <button type="button" className="bt wide bio-t" onClick={onBio}>
        <span className="bt-l">
          <Icon name="twin" size={18} />
          Biological age
        </span>
        {b?.biological_age?.value == null ? (
          <>
            <b>Calculated after your panel</b>
            <small>
              Needs {b?.biological_age?.inputs_missing?.length ?? 0} blood results. We never guess
              it.
            </small>
          </>
        ) : (
          <>
            <b className="mx-tabular">{b.biological_age.value} years</b>
            <small>
              From {String(b.biological_age.model || '').split(' (')[0]} blood results
              {b.biological_age.research_only ? ' · research use' : ''}
            </small>
          </>
        )}
      </button>

      {/* 8. Findings & BMI */}
      <button type="button" className="bt" onClick={() => go('research', 'findings')}>
        <span className="bt-l">
          <Icon name="research" size={18} />
          Findings for you
        </span>
        <b className="bt-v mx-tabular">{b?.insights?.length ?? 0}</b>
        <small>
          {b?.research?.verified_findings
            ? `from ${b.research.verified_findings} checked`
            : 'from your record'}
        </small>
      </button>

      {bmi && (
        <button type="button" className="bt" onClick={() => go('you', 'health')}>
          <span className="bt-l">
            <Icon name="heart" size={18} />
            BMI
          </span>
          <b className="bt-v mx-tabular">{bmi}</b>
          <small>height and weight</small>
        </button>
      )}

      {/* 9. Provenance tiles */}
      <button type="button" className="bt" onClick={() => open('knows')}>
        <span className="bt-l">
          <Icon name="checkin" size={18} />
          Facts it knows
        </span>
        <b className="bt-v mx-tabular">{counts.knows + feedEntries.length}</b>
        <small>each with its source</small>
      </button>

      <button type="button" className="bt" onClick={() => open('unknown')}>
        <span className="bt-l">
          <Icon name="panel" size={18} />
          Still to measure
        </span>
        <b className="bt-v mx-tabular">{counts.unknown}</b>
        <small>shown, never guessed</small>
      </button>

      <button type="button" className="bt" onClick={() => open('changed')}>
        <span className="bt-l">
          <Icon name="research" size={18} />
          Changes
        </span>
        <b className="bt-v mx-tabular">{counts.changed}</b>
        <small>over time</small>
      </button>

      <button type="button" className="bt" onClick={() => open('sources')}>
        <span className="bt-l">
          <Icon name="share" size={18} />
          Sources
        </span>
        <b className="bt-v mx-tabular">{counts.sources}</b>
        <small>where it came from</small>
      </button>

      {/* 10. Research summary */}
      <button type="button" className="bt wide research-t" onClick={() => go('research', null)}>
        <span className="bt-l">
          <Icon name="research" size={18} />
          Research on your record
        </span>
        <span className="bt-row">
          <span>
            <b className="mx-tabular">{statTile('verified findings')}</b>
            <small>checked findings</small>
          </span>
        </span>
      </button>

      {/* 11. Accurate LE8 Heart Habits across all 12 patients */}
      <button type="button" className="bt" onClick={() => go('twin', 'stats')}>
        <span className="bt-l">
          <Icon name="heart" size={18} />
          Heart habits
        </span>
        <b className="bt-v mx-tabular">
          {scoredLe8.length}
          <small>/8</small>
        </b>
        <small>
          {avgLe8 !== null ? `scored · avg ${avgLe8}/100` : 'complete check-in to score'}
        </small>
      </button>

      {/* 12. Action plan */}
      <button type="button" className="bt" onClick={() => go('you', 'plan')}>
        <span className="bt-l">
          <Icon name="lifestyle" size={18} />
          Action plan
        </span>
        <b className="bt-v mx-tabular">
          {planDone}
          <small>/{b?.action_plan?.length ?? 0}</small>
        </b>
        <small>steps done</small>
      </button>

      <button type="button" className="bt wide link-t" onClick={() => go('twin', 'stats')}>
        All your numbers ›
      </button>
    </div>
  );
}

type PriorityFilter = 'all' | 'act' | 'follow' | 'info';

const RESEARCH_TABS: Array<[string, string]> = [
  ['findings', 'Overview'],
  ['dossier', 'Your dossier'],
  ['how', 'Method'],
  ['sources', 'Sources'],
  ['genes', 'Genes'],
];

const RESEARCH_TAB_ALIASES: Record<string, string> = {
  overview: 'findings',
  evidence: 'sources',
  analysis: 'how',
  genetics: 'genes',
};

/**
 * Upgraded Research Screen (`Za`):
 * - Restores the previously hidden/disabled `Method` (`how`) tab using existing `ResearchMethodTab` (`hi`)
 * - Makes the 4 top metric summary buttons (`findings for you`, `act on this`, `worth following`, `good to know`)
 *   real interactive priority filters with active state & reset
 * - Integrates interactive D3 `KnowledgeGraphCard` and preserves desktop side-panel / mobile sheet detail
 */
export function ResearchScreen({
  b,
  sub,
  go,
  PageHead,
  SegmentedTabs,
  ResearchSourcesTab,
  ResearchMethodTab,
  ResearchGenesTab,
  ResearchDossierTab,
  ResearchFindingDetail,
  Sheet,
  Icon,
  CertaintyGrade,
  Takeaway,
  readStore,
  priorityMapper,
  certaintyGrades,
  useDesktopQuery,
}: {
  b: any;
  sub: string | null;
  go: (tab: string, sub?: string | null) => void;
  PageHead: any;
  SegmentedTabs: any;
  ResearchSourcesTab: any;
  ResearchMethodTab: any;
  ResearchGenesTab: any;
  ResearchDossierTab: any;
  ResearchFindingDetail: any;
  Sheet: any;
  Icon: any;
  CertaintyGrade: any;
  Takeaway: any;
  readStore: <T>(key: string, fallback: T) => T;
  priorityMapper: (ins: any) => [string, string];
  certaintyGrades: Record<string, string>;
  useDesktopQuery: () => boolean;
}) {
  const findingFromSub = sub?.startsWith('f:') ? sub.slice(2) : null;
  const activeTab = findingFromSub
    ? 'findings'
    : RESEARCH_TABS.some(([id]) => id === sub)
      ? (sub as string)
      : (sub && RESEARCH_TAB_ALIASES[sub]) || 'findings';

  const [selectedId, setSelectedId] = useState<string | null>(findingFromSub);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');

  useEffect(() => {
    if (findingFromSub) setSelectedId(findingFromSub);
  }, [findingFromSub]);

  // Reset filter when switching patient
  useEffect(() => {
    setPriorityFilter('all');
  }, [b?.patient?.preferred_name]);

  const isDesktop = useDesktopQuery();
  const insights: any[] = Array.isArray(b?.insights) ? b.insights : [];
  const selectedInsight = insights.find((x) => x.id === selectedId) || null;

  const sortedInsights = useMemo(
    () => [...insights].sort((a, c) => (a.priority ?? 9) - (c.priority ?? 9)),
    [insights]
  );

  const filteredInsights = useMemo(() => {
    if (priorityFilter === 'act') return sortedInsights.filter((x) => x.priority <= 1);
    if (priorityFilter === 'follow') return sortedInsights.filter((x) => x.priority === 2);
    if (priorityFilter === 'info') return sortedInsights.filter((x) => x.priority > 2);
    return sortedInsights;
  }, [sortedInsights, priorityFilter]);

  const countWhere = (fn: (x: any) => boolean) => insights.filter(fn).length;

  const gradeCounts = Object.keys(certaintyGrades || {})
    .filter((k) => /^[A-E]$/.test(k))
    .sort()
    .map((g) => [g, countWhere((x) => x.certainty === g)] as [string, number]);
  const totalGrades = Math.max(
    1,
    gradeCounts.reduce((acc, [, n]) => acc + n, 0)
  );

  const areaLabel = (areaId: string) =>
    (b?.areas || []).find((pair: [string, string]) => pair[0] === areaId)?.[1] ?? 'Other';

  const areaCounts = Object.entries(
    insights.reduce((acc: Record<string, number>, item: any) => {
      const lbl = areaLabel(item.area);
      acc[lbl] = (acc[lbl] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, c) => c[1] - a[1])
    .slice(0, 6);
  const maxAreaCount = Math.max(1, ...areaCounts.map(([, n]) => n));

  const filterButtons: Array<{ id: PriorityFilter; count: number; label: string }> = [
    { id: 'all', count: insights.length, label: 'findings for you' },
    { id: 'act', count: countWhere((x) => x.priority <= 1), label: 'act on this' },
    { id: 'follow', count: countWhere((x) => x.priority === 2), label: 'worth following' },
    { id: 'info', count: countWhere((x) => x.priority > 2), label: 'good to know' },
  ];

  return (
    <main
      className={`screen wide research4${
        selectedInsight && isDesktop && activeTab === 'findings' ? ' with-panel' : ''
      }`}
    >
      <PageHead
        eyebrow="Research"
        title="What we found"
        sub={
          b?.research?.verified_findings
            ? `${insights.length} things that matter for you, from ${b.research.verified_findings} checked research findings.`
            : `${insights.length} things that matter for you, from your record and the medical evidence.`
        }
      />

      <SegmentedTabs
        label="Research sections"
        value={activeTab}
        onChange={(nextTab: string) => go('research', nextTab)}
        items={RESEARCH_TABS}
      />

      {activeTab === 'findings' && (
        <div className="rf-wrap">
          <div className="rf-list">
            <div className="ana">
              <div className="ana-nums" role="group" aria-label="Filter findings by priority">
                {filterButtons.map((btn) => {
                  const isActive = priorityFilter === btn.id;
                  return (
                    <button
                      key={btn.id}
                      type="button"
                      aria-pressed={isActive}
                      className={isActive ? 'mx-ana-filter-active' : undefined}
                      onClick={() =>
                        setPriorityFilter((prev) =>
                          prev === btn.id && btn.id !== 'all' ? 'all' : btn.id
                        )
                      }
                    >
                      <b className="mx-tabular">{btn.count}</b>
                      <small>{btn.label}</small>
                    </button>
                  );
                })}
              </div>

              <div className="ana-card">
                <div className="sec">
                  <h3>How strong the evidence is</h3>
                  <span className="note mx-tabular">{insights.length} findings</span>
                </div>
                <div className="stack" aria-label="Evidence strength">
                  {gradeCounts
                    .filter(([, cnt]) => cnt > 0)
                    .map(([grade, cnt]) => (
                      <i
                        key={grade}
                        style={{
                          width: `${(cnt / totalGrades) * 100}%`,
                          background: EVIDENCE_COLORS[grade] || '#05B7B9',
                        }}
                        title={`${certaintyGrades[grade]}: ${cnt}`}
                      />
                    ))}
                </div>
                <div className="stack-key">
                  {gradeCounts.map(([grade, cnt]) => (
                    <span key={grade}>
                      <i style={{ background: EVIDENCE_COLORS[grade] || '#05B7B9' }} />
                      {String(certaintyGrades[grade] || grade).replace(' evidence', '')} {cnt}
                    </span>
                  ))}
                </div>
              </div>

              <div className="ana-card">
                <div className="sec">
                  <h3>What your findings cover</h3>
                  <span className="note mx-tabular">{areaCounts.length} areas</span>
                </div>
                <div className="bars wide-label">
                  {areaCounts.map(([lbl, cnt]) => (
                    <div key={lbl}>
                      <span>{lbl}</span>
                      <i style={{ width: `${(cnt / maxAreaCount) * 100}%` }} />
                      <b className="mx-tabular">{cnt}</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <KnowledgeGraphCard b={b} readStore={readStore} openFinding={setSelectedId} />

            <div className="sec mx-findings-filter-head">
              <h2 className="rf-h">
                {priorityFilter === 'all'
                  ? 'Your findings'
                  : `Filtered findings (${filteredInsights.length})`}
              </h2>
              {priorityFilter !== 'all' && (
                <button
                  type="button"
                  className="secondary sm"
                  onClick={() => setPriorityFilter('all')}
                >
                  Show all {insights.length} findings
                </button>
              )}
            </div>

            {filteredInsights.length === 0 ? (
              <div className="card">
                <p className="note">No findings in this priority group for this Twin.</p>
                <button
                  type="button"
                  className="secondary sm"
                  onClick={() => setPriorityFilter('all')}
                >
                  Show all findings
                </button>
              </div>
            ) : (
              <div className="fgrid">
                {filteredInsights.map((ins, idx) => {
                  const [sigClass, sigLabel] = priorityMapper(ins);
                  const isTop = priorityFilter === 'all' && idx === 0;
                  return (
                    <button
                      key={ins.id}
                      type="button"
                      className={`fcard${selectedId === ins.id ? ' sel' : ''}${
                        isTop ? ' attention' : ''
                      }`}
                      onClick={() => setSelectedId(ins.id)}
                    >
                      {isTop && <Takeaway text="Most important for you" tone="attention" />}
                      <span className="fc-top">
                        <span className="fc-ic">
                          <Icon name={ins.area ?? 'research'} size={24} />
                        </span>
                        <span className="fc-cat">{areaLabel(ins.area)}</span>
                        <span className={`sig ${sigClass}`}>{sigLabel}</span>
                      </span>
                      <b className="fc-t">{ins.title}</b>
                      {ins.helps && <span className="fc-h">{ins.helps}</span>}
                      <span className="fc-foot">
                        <CertaintyGrade grade={ins.certainty} />
                        {ins.evidence?.length > 0 ? (
                          <span className="fc-src mx-tabular">
                            {ins.evidence.length} source{ins.evidence.length > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="fc-src">from your record</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedInsight && isDesktop && (
            <aside className="rf-panel" aria-label={selectedInsight.title}>
              <ResearchFindingDetail
                b={b}
                ins={selectedInsight}
                go={go}
                onClose={() => setSelectedId(null)}
              />
            </aside>
          )}
        </div>
      )}

      {activeTab === 'sources' && <ResearchSourcesTab b={b} />}
      {activeTab === 'how' && (
        <div className="mx-method-wrap" aria-label="Mutanex Twin research methodology">
          <div className="card">
            <span className="mx-eyebrow">Deterministic Rules + Grounded Evidence</span>
            <h2>How your Twin evaluates medical evidence</h2>
            <p className="note">
              Every finding in {b?.patient?.preferred_name || 'your'}’s Twin is generated through four auditable stages. Unmeasured biomarkers are explicitly marked rather than estimated, and every claim carries an A–E certainty grade.
            </p>
          </div>

          <div className="grid2 mx-method-grid">
            <section className="card">
              <span className="mx-eyebrow">Stage 01 · Provenance &amp; Ingestion</span>
              <h3>Longitudinal Record Assembly</h3>
              <p className="note">
                Lab results, clinical vitals, medications, genomics, and Feed Your Twin updates are timestamped with strict source provenance (imported lab report, device measurement, spoken update, or personal diary) without overwriting historical values.
              </p>
              <small className="note mx-tabular">
                Active record: {Object.keys(b?.labs || {}).length} lab analytes ·{' '}
                {(b?.domains || []).filter((d: any) => d.status !== 'none').length}/
                {(b?.domains || []).length} health domains assessed
              </small>
            </section>

            <section className="card">
              <span className="mx-eyebrow">Stage 02 · Clinical Rule Engine</span>
              <h3>Deterministic Biomarker &amp; Organ Evaluation</h3>
              <p className="note">
                Age- and sex-calibrated reference intervals, rate-of-change thresholds, and organ-state rules run deterministically before any language model summarizes your Twin.
              </p>
              <small className="note mx-tabular">
                {(b?.changes || []).length} tracked longitudinal shifts ·{' '}
                {Object.values(b?.organs || {}).filter((o: any) => o?.state === 'attention').length}{' '}
                organ systems flagged for review
              </small>
            </section>

            <section className="card">
              <span className="mx-eyebrow">Stage 03 · Evidence Grading (A–E)</span>
              <h3>Medical Literature &amp; Knowledge Graph Matching</h3>
              <p className="note">
                Each finding links your biomarkers and genotypes to peer-reviewed studies and clinical guidelines ({b?.research?.verified_findings || insights.length} checked findings), graded from Grade A (established guideline consensus) through Grade E (emerging research).
              </p>
              <div className="stack-key">
                {gradeCounts.map(([grade, cnt]) => (
                  <span key={grade}>
                    <i style={{ background: EVIDENCE_COLORS[grade] || '#05B7B9' }} />
                    Grade {grade}: {String(certaintyGrades[grade] || grade).replace(' evidence', '')} ({cnt})
                  </span>
                ))}
              </div>
            </section>

            <section className="card">
              <span className="mx-eyebrow">Stage 04 · Safety &amp; Care-Team Loop</span>
              <h3>Physician Review &amp; Self-Perspective Grounding</h3>
              <p className="note">
                Your Twin never diagnoses or prescribes autonomously. Newly contributed results and symptoms enter a care-team verification queue while immediately informing grounded first-person answers in Ask Your Twin.
              </p>
              <div className="row-btns">
                <button
                  type="button"
                  className="secondary sm"
                  onClick={() => go('research', 'sources')}
                >
                  Inspect {Object.keys(b?.science || {}).length || insights.length} cited sources →
                </button>
                <button
                  type="button"
                  className="secondary sm"
                  onClick={() => go('research', 'findings')}
                >
                  Back to findings →
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
      {activeTab === 'genes' && <ResearchGenesTab b={b} bare />}
      {activeTab === 'dossier' && <ResearchDossierTab b={b} go={go} />}

      {selectedInsight && !isDesktop && activeTab === 'findings' && (
        <Sheet onClose={() => setSelectedId(null)} label={selectedInsight.title}>
          <ResearchFindingDetail b={b} ins={selectedInsight} go={go} />
        </Sheet>
      )}
    </main>
  );
}

/**
 * Compact Digital Identity Badge replacing the oversized profile card in `You` (`Jg`).
 */
export function YouIdentityBadge({
  b,
  go,
  getPatientId,
  calcAge,
  formatDate,
  readStore,
  Ring,
  Icon,
  PatientSwitcher,
}: {
  b: any;
  go: (tab: string, sub?: string | null) => void;
  getPatientId: () => string;
  calcAge: (dob: string) => { years: number };
  formatDate: (d: string) => string;
  readStore: <T>(key: string, fallback: T) => T;
  Ring: any;
  Icon: any;
  PatientSwitcher: any;
}) {
  const { user, isAdmin } = usePortalAuth();
  const [, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((v) => v + 1);
    window.addEventListener(VOICE_UPDATED_EVENT, bump);
    window.addEventListener(FEED_EVENT, bump);
    return () => {
      window.removeEventListener(VOICE_UPDATED_EVENT, bump);
      window.removeEventListener(FEED_EVENT, bump);
    };
  }, []);

  const profileOverrides = readStore<Record<string, string>>('mx-profile', {});
  const displayName =
    profileOverrides.preferred_name || b?.patient?.preferred_name || 'Member';
  const ageYears = calcAge(b?.patient?.date_of_birth).years;
  const twinId = getPatientId();

  const portraitUrl = readStore<string | null>(PHOTO_STORE_KEY, null);
  const faceProfile = readStore<FaceLikenessData | null>(FACE_STORE_KEY, null);
  const voiceProfile = readStore<VoicePersonaData | null>(SHARED_VOICE_STORE_KEY, null);
  const memories = readStore<string[]>(MEMORIES_STORE_KEY, []);
  const feedEntries = readStore<FeedEntry[]>('mx-feed', []);

  const completeness = computeTwinCompleteness({
    bundle: b,
    feedCount: feedEntries.length,
    hasFace: Boolean(faceProfile || portraitUrl),
    hasVoice: Boolean(voiceProfile?.used_real_audio),
    memoriesCount: memories.length,
  });

  return (
    <section className="card mx-identity-badge" aria-label="Digital Twin Identity Badge">
      <div className="mx-id-badge-top">
        <div className="mx-id-avatar-wrap">
          {portraitUrl ? (
            <img
              src={portraitUrl}
              alt={`${displayName} portrait`}
              referrerPolicy="no-referrer"
              className="mx-id-avatar-img"
            />
          ) : (
            <span className="avatar mx-id-avatar-fallback" aria-hidden="true">
              {displayName[0]}
            </span>
          )}
        </div>

        <div className="mx-id-meta">
          <div className="mx-id-title-row">
            <h1>{displayName}</h1>
            <span className={`mx-id-role-tag${isAdmin ? ' is-admin' : ''}`}>
              {isAdmin ? 'Admin · Multi-Twin' : user ? 'Verified Member' : 'Local Twin'}
            </span>
          </div>
          <p className="note mx-tabular">
            {ageYears} yrs · ID <code>{twinId}</code> · since {formatDate(b?.patient?.twin_created)}
          </p>
          <small className="mx-id-status-line">{completeness.statusLabel}</small>
        </div>

        <div className="mx-id-completeness" title="Overall Clinical & Digital Self Completeness">
          <Ring value={completeness.totalPct} total={100} size={46} />
          <div className="mx-id-comp-text">
            <b className="mx-tabular">{completeness.totalPct}%</b>
            <small>Twin ready</small>
          </div>
        </div>
      </div>

      <div className="mx-id-pillars-strip">
        <button
          type="button"
          className={`mx-id-chip${completeness.hasFace ? ' is-ready' : ''}`}
          onClick={() => go('you', 'preserve')}
        >
          <Icon name="preserve" size={15} />
          <span>3D Face: {completeness.hasFace ? 'Active' : 'Add photo'}</span>
        </button>

        <button
          type="button"
          className={`mx-id-chip${completeness.hasVoice ? ' is-ready' : ''}`}
          onClick={() => go('you', 'preserve')}
        >
          <Icon name="checkin" size={15} />
          <span>
            Voice:{' '}
            {completeness.hasVoice
              ? `${voiceProfile?.prebuilt_voice} (${voiceProfile?.pitch_hz || 175} Hz)`
              : 'Record'}
          </span>
        </button>

        <button
          type="button"
          className={`mx-id-chip${completeness.memoriesCount > 0 ? ' is-ready' : ''}`}
          onClick={() => go('you', 'preserve')}
        >
          <Icon name="research" size={15} />
          <span className="mx-tabular">Memories: {completeness.memoriesCount}</span>
        </button>

        <button
          type="button"
          className="mx-id-chip"
          onClick={() => go('you', 'journey')}
        >
          <Icon name="twin" size={15} />
          <span className="mx-tabular">
            Domains: {completeness.assessedDomains}/{completeness.totalDomains}
          </span>
        </button>
      </div>

      <div className="mx-id-actions-bar">
        <div className="row-btns">
          <button
            type="button"
            className="primary sm"
            onClick={() => go('you', 'preserve')}
          >
            Preserve yourself
          </button>
          <button
            type="button"
            className="secondary sm"
            onClick={() => go('you', 'profile')}
          >
            Edit profile
          </button>
          <button
            type="button"
            className="secondary sm"
            onClick={() => go('you', 'journey')}
          >
            Journey
          </button>
        </div>

        <PatientSwitcher b={b} compact />
      </div>
    </section>
  );
}

/**
 * Production-grade Account & Session Footer replacing the disabled `Log out` stub in `You` (`Jg`).
 */
export function YouAccountFooter({
  b,
  go,
}: {
  b: any;
  go: (tab: string, sub?: string | null) => void;
}) {
  const { user, isAdmin, openAuthModal, signOut } = usePortalAuth();
  const [statusNote, setStatusNote] = useState<string | null>(null);

  return (
    <section className="card mx-account-footer" aria-label="Account and Clinical Admin Session">
      <div className="mx-account-summary">
        <div>
          <span className="mx-eyebrow">Account &amp; Vault Session</span>
          {user ? (
            <>
              <b>
                Signed in as {user.displayName} ({user.email})
              </b>
              <p className="note">
                Role: {isAdmin ? 'Clinical Admin (all 12 Twins + Onboarding)' : `Member (${user.assignedPatientId})`} · AES-256-GCM vault sync active.
              </p>
            </>
          ) : (
            <>
              <b>Running in private device mode ({b?.patient?.preferred_name})</b>
              <p className="note">
                Sign in or create an encrypted Mutanex account to lock your Twin session, sync your preserved voice &amp; memories, or enable Clinical Admin Mode.
              </p>
            </>
          )}
        </div>

        <div className="row-btns">
          {user ? (
            <>
              {!isAdmin && (
                <button
                  type="button"
                  className="secondary sm"
                  onClick={() =>
                    openAuthModal(
                      'admin',
                      'Switch to Clinical Admin Mode to browse all 12 Twins and onboard new patients.'
                    )
                  }
                >
                  Switch to Admin Mode
                </button>
              )}
              <button
                type="button"
                className="secondary sm"
                onClick={async () => {
                  await signOut();
                  setStatusNote('Signed out cleanly. Session token revoked.');
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="primary sm"
                onClick={() => openAuthModal('signin')}
              >
                Sign in
              </button>
              <button
                type="button"
                className="secondary sm"
                onClick={() => openAuthModal('signup')}
              >
                Create account
              </button>
              <button
                type="button"
                className="secondary sm"
                onClick={() => openAuthModal('admin')}
              >
                Admin Mode (12 Twins)
              </button>
            </>
          )}
        </div>
      </div>

      {statusNote && (
        <p className="note" role="status">
          {statusNote}
        </p>
      )}
    </section>
  );
}

/**
 * Permission-gated Patient Switcher & Clinical Admin Modal (`zi` replacement):
 * - Enforces isolated single-patient lock when signed in as a dedicated Member (`role === 'member'`)
 * - Allows full 12-Twin switching (`MX-SYN-T01..T10`, `MX-DEID-A`, `MX-DEID-B`), Doctor View toggle,
 *   and new Twin onboarding when in Admin Mode or unlocked clinical preview.
 */
export function PatientSwitcherModal({
  b,
  compact = false,
  loadPatientIndex,
  getPatientId,
  switchPatient,
  DoctorToggle,
  setDoctorMode,
  Sheet,
  SwitcherExtras,
}: {
  b: any;
  compact?: boolean;
  loadPatientIndex: () => Promise<any[]>;
  getPatientId: () => string;
  switchPatient: (id: string) => void;
  DoctorToggle: any;
  setDoctorMode: (on: boolean) => void;
  Sheet: any;
  SwitcherExtras: any;
}) {
  const { user, isAdmin, enableAdminDemo, openAuthModal } = usePortalAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    loadPatientIndex()
      .then((list) => setPatients(Array.isArray(list) ? list : []))
      .catch(() => setPatients([]));
  }, [loadPatientIndex, open]);

  if (patients.length < 2) return null;

  const currentId = getPatientId();
  const lockedToMember = Boolean(user && user.role === 'member');

  return (
    <>
      <button
        type="button"
        className={`pswitch${compact ? ' compact' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Switch patient or Admin Twin roster"
      >
        <span className="ps-av" aria-hidden="true">
          {b?.patient?.preferred_name?.[0] || 'M'}
        </span>
        <span className="ps-t">
          <small>{isAdmin ? 'Admin Roster' : lockedToMember ? 'Member Twin' : 'Viewing'}</small>
          <b>{b?.patient?.preferred_name}</b>
        </span>
        <span className="ps-go" aria-hidden="true">
          ⇄
        </span>
      </button>

      {open && (
        <Sheet onClose={() => setOpen(false)} label="Twin Roster & Clinical Admin">
          <div className="mx-switcher-head">
            <div>
              <span className="mx-eyebrow">
                {isAdmin
                  ? 'Clinical Admin Mode · All 12 Twins Unlocked'
                  : lockedToMember
                    ? `Isolated Member Session · ${user?.email}`
                    : 'Twin Roster & Clinical Preview'}
              </span>
              <h2>{lockedToMember ? 'Your Isolated Twin Session' : 'Switch Twin Profile'}</h2>
            </div>

            {!isAdmin && (
              <button
                type="button"
                className="secondary sm"
                disabled={unlocking}
                onClick={async () => {
                  setUnlocking(true);
                  try {
                    await enableAdminDemo();
                  } catch {
                    openAuthModal('admin');
                  } finally {
                    setUnlocking(false);
                  }
                }}
              >
                {unlocking ? 'Activating…' : 'Enable Admin Mode'}
              </button>
            )}
          </div>

          {lockedToMember ? (
            <div className="card mx-member-isolation-box">
              <p className="note">
                You are signed in as <b>{user?.displayName}</b> (<code>{user?.assignedPatientId}</code>).
                To protect patient privacy, member accounts only access their own Digital Twin and encrypted vault.
              </p>
              <div className="row-btns">
                <button
                  type="button"
                  className="primary sm"
                  disabled={unlocking}
                  onClick={async () => {
                    setUnlocking(true);
                    try {
                      await enableAdminDemo();
                    } finally {
                      setUnlocking(false);
                    }
                  }}
                >
                  Switch to Clinical Admin Mode (All 12 Twins)
                </button>
                <button
                  type="button"
                  className="secondary sm"
                  onClick={() => {
                    setOpen(false);
                    openAuthModal('signin');
                  }}
                >
                  Sign in as another user
                </button>
              </div>
            </div>
          ) : (
            <>
              <SwitcherExtras
                onCloseSheet={() => setOpen(false)}
                setDoctorMode={setDoctorMode}
              />

              <div className="dv-sheet-toggle">
                <DoctorToggle />
                <small>
                  Adds the Clinical tab: treatment evidence, interactions, drug discovery and every
                  research result.
                </small>
              </div>

              <p className="note">
                {patients.some((p) => p.deidentified)
                  ? 'Synthetic profiles (MX-SYN-T01..T10) are fictional; profiles marked De-identified Real Record (MX-DEID-A, MX-DEID-B) have all personal identifiers removed.'
                  : 'Every patient here is fictional.'}
              </p>

              <ul className="ps-list">
                {patients.map((p) => {
                  const isCurrent = p.id === currentId;
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        aria-current={isCurrent ? 'true' : undefined}
                        onClick={() => {
                          if (isCurrent) {
                            setOpen(false);
                          } else {
                            setOpen(false);
                            switchPatient(p.id);
                          }
                        }}
                      >
                        <span className="ps-av" aria-hidden="true">
                          {p.name?.[0] || 'T'}
                        </span>
                        <span className="ps-main">
                          <b>
                            {p.name}
                            {p.age ? `, ${p.age}` : ''}{' '}
                            <small className="mx-ps-id">
                              ({p.deidentified ? 'De-identified' : 'Synthetic'} · {p.id})
                            </small>
                          </b>
                          <small>{p.headline}</small>
                          {!!p.tags?.length && (
                            <span className="ps-tags">
                              {p.tags.slice(0, 3).map((tag: string) => (
                                <i key={tag}>{tag}</i>
                              ))}
                            </span>
                          )}
                        </span>
                        <span className="ps-now">{isCurrent ? 'Open now' : 'Open'}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </Sheet>
      )}
    </>
  );
}
