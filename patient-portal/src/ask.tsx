import React, { useEffect, useState } from 'react';
import { BRIEFING_STORAGE_KEY } from './feed';
import { KnowledgeGraphCard } from './kg-graph';
import type { AskSource, FeedEntry, PortalHostBridge, StoredBriefing } from './types';

const VITE_ASK_URL: string =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_ASK_URL) || '';

function resolveApiUrl(path: string, hostApiBase?: string): string {
  const base = (VITE_ASK_URL || hostApiBase || '').replace(/\/$/, '');
  return `${base}${path}`;
}

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
  live?: boolean;
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
  const [question, setQuestion] = useState('');
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [serverLive, setServerLive] = useState(true);
  const [showKg, setShowKg] = useState(!embedded);
  const [doctorDoc, setDoctorDoc] = useState<any>(null);

  const isDoctor = host.useDoctor ? host.useDoctor() : false;

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

  const localFallbackAnswer = (q: string): ChatTurn => {
    const qLow = q.toLowerCase();
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
        sources: [{ kind: 'record', title: `${b?.patient?.preferred_name || 'Twin'} record` }],
      };
    }
    return {
      me: q,
      a: "That isn't in your record yet, so I won't guess. Your care team can answer it. If it is about a part of your body your twin hasn't assessed, your personalised panel is how we find out.",
      links: [],
    };
  };

  const askQuestion = async (rawQ: string) => {
    const trimmed = rawQ.trim();
    if (!trimmed) return;

    if (host.crisisRegex && host.crisisRegex.test(trimmed)) {
      setTurns((prev) => [...prev, { me: trimmed, a: '', links: [], crisis: true }]);
      return;
    }

    setTurns((prev) => [...prev, { me: trimmed, a: '', links: [], pending: true }]);

    const pendingFeed = host.readStore<FeedEntry[]>('mx-feed', []);
    const latestBriefing = host.readStore<StoredBriefing | null>(BRIEFING_STORAGE_KEY, null);
    const enrichedBundle = {
      ...b,
      pending_feed: pendingFeed,
      latest_briefing: latestBriefing,
    };

    const patientId =
      String(host.getPatientId() || 'patient').replace(/[^A-Za-z0-9_-]/g, '') || 'patient';

    let clinicalDoc = doctorDoc;
    if (isDoctor && !clinicalDoc && host.loadDoctorDoc) {
      clinicalDoc = await host.loadDoctorDoc();
      setDoctorDoc(clinicalDoc);
    }

    let resolvedTurn: ChatTurn;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 45000);
      const res = await fetch(resolveApiUrl('/v1/ask', host.apiBase), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          patient_id: patientId,
          question: trimmed,
          bundle: enrichedBundle,
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
        live: true,
        cdss: isDoctor,
      };
    } catch {
      resolvedTurn = localFallbackAnswer(trimmed);
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
  const patientSuggestions: string[] = [
    'What changed in my kidneys?',
    ...((b?.ask || []).map((x: any) => x.q) as string[]).slice(0, 6),
  ];

  const content = (
    <>
      {!embedded && <h1>{isDoctor ? 'Clinical assistant' : 'Ask your twin'}</h1>}
      <p className="lede">
        {isDoctor
          ? `Clinical decision support: grounded in ${
              b?.patient?.preferred_name || 'the patient'
            }’s Knowledge Graph, uploaded lab reports, and live Google Search clinical guidelines. For physician review; never diagnoses or prescribes.`
          : serverLive
            ? 'Live: your twin answers from your Knowledge Graph, newly added lab reports, and Google Search medical guidelines, with clickable sources.'
            : 'Answers come strictly from your own record and verified medical evidence.'}
      </p>

      <div className="mx-kg-toggle-row">
        <button
          type="button"
          className="secondary sm mx-kg-toggle-btn"
          onClick={() => setShowKg((v) => !v)}
          aria-expanded={showKg}
        >
          {showKg ? 'Hide Knowledge Graph' : 'Show Patient Knowledge Graph'}
        </button>
        <span className="note">
          Google Search + Twin KG linked
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
              : 'Ask anything about your health, your kidneys, your lab reports, or what to ask your doctor...'
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
          Ask
        </button>
      </div>

      {turns.length === 0 && (
        <div className="suggest">
          {(isDoctor ? cdssSuggestions : patientSuggestions).map((prompt) => (
            <button key={prompt} onClick={() => void askQuestion(prompt)}>
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
            ) : turn.pending ? (
              <div className="bubble ask-pending">
                <span className="ap-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                Searching your Knowledge Graph and medical guidelines…
              </div>
            ) : (
              <div className="bubble mx-answer-bubble">
                {turn.cdss && (
                  <span className="ask-live">Clinical decision support · Grounded</span>
                )}
                {turn.live && !turn.cdss && (
                  <span className="ask-live">Researched live · KG + Google Search</span>
                )}

                <p className="mx-answer-text">{turn.a}</p>

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
                      <button key={fid} onClick={() => openFinding(fid)}>
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
              <button key={q} onClick={() => void askQuestion(q)}>
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
