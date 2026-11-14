import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { cleanLabUnit } from './lab-matching';
import { FEED_EVENT } from './feed';
import type { FeedEntry } from './types';

export type KgNodeGroup =
  | 'patient'
  | 'condition'
  | 'symptom'
  | 'treatment'
  | 'biomarker'
  | 'finding';

export interface KgNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  shortLabel: string;
  group: KgNodeGroup;
  detail: string;
  flagged?: boolean;
  isPendingReport?: boolean;
  findingId?: string;
}

export interface KgLink extends d3.SimulationLinkDatum<KgNode> {
  source: string | KgNode;
  target: string | KgNode;
  relation: string;
}

const GROUP_META: Record<
  KgNodeGroup,
  { label: string; color: string; bg: string; radius: number }
> = {
  patient: { label: 'Twin', color: '#0d1211', bg: '#e4e7e7', radius: 16 },
  condition: { label: 'Conditions', color: '#b42318', bg: '#fdecea', radius: 11 },
  symptom: { label: 'Symptoms', color: '#8a5300', bg: '#fff4e0', radius: 10 },
  treatment: { label: 'Treatments', color: '#17784a', bg: '#e6f4ec', radius: 10 },
  biomarker: { label: 'Biomarkers', color: '#0097b2', bg: '#e6f6f9', radius: 10 },
  finding: { label: 'Genes & KG', color: '#3f3073', bg: '#eef0f8', radius: 10 },
};

function truncateLabel(text: string, max = 18): string {
  const clean = text.replace(/\s*\([^)]*\)\s*/g, '').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trim() + '…';
}

export function buildPatientKnowledgeGraph(
  bundle: any,
  pendingFeed: FeedEntry[] = [],
  doc?: any
): { nodes: KgNode[]; links: KgLink[] } {
  const nodesMap = new Map<string, KgNode>();
  const links: KgLink[] = [];

  const addNode = (node: KgNode) => {
    if (!nodesMap.has(node.id)) {
      nodesMap.set(node.id, node);
    }
  };

  const addLink = (source: string, target: string, relation: string) => {
    if (!nodesMap.has(source) || !nodesMap.has(target) || source === target) return;
    if (
      !links.some(
        (l) =>
          (l.source === source && l.target === target) ||
          (l.source === target && l.target === source)
      )
    ) {
      links.push({ source, target, relation });
    }
  };

  const patientName = bundle?.patient?.preferred_name || 'Patient';
  const rootId = 'patient:self';
  addNode({
    id: rootId,
    label: `${patientName}'s Twin`,
    shortLabel: patientName,
    group: 'patient',
    detail: `Central Digital Twin entity · ${(bundle?.patient?.conditions || []).length} conditions, ${
      Object.keys(bundle?.labs || {}).length
    } lab series`,
  });

  // 1. Conditions
  const conditions: string[] = Array.isArray(bundle?.patient?.conditions)
    ? bundle.patient.conditions
    : [];
  conditions.slice(0, 6).forEach((cond, idx) => {
    const id = `cond:${idx}`;
    addNode({
      id,
      label: cond,
      shortLabel: truncateLabel(cond, 17),
      group: 'condition',
      detail: `Recorded condition: ${cond}`,
    });
    addLink(rootId, id, 'diagnosed_with');
  });

  // 2. Treatments (Medicines + Supplements + pending medicines)
  const meds: string[] = [
    ...(Array.isArray(bundle?.patient?.medicines) ? bundle.patient.medicines : []),
    ...(Array.isArray(bundle?.patient?.supplements)
      ? bundle.patient.supplements.slice(0, 2)
      : []),
  ];
  meds.slice(0, 5).forEach((med, idx) => {
    const id = `med:${idx}`;
    const medName = med.split(',')[0].trim();
    addNode({
      id,
      label: medName,
      shortLabel: truncateLabel(medName, 16),
      group: 'treatment',
      detail: `Active treatment: ${med}`,
    });
    addLink(rootId, id, 'treated_with');

    const mLow = med.toLowerCase();
    conditions.slice(0, 6).forEach((cond, cIdx) => {
      const cLow = cond.toLowerCase();
      if (
        ((mLow.includes('amlodipine') || mLow.includes('losartan')) &&
          (cLow.includes('blood pressure') || cLow.includes('hypertension') || cLow.includes('kidney'))) ||
        (mLow.includes('vitamin d') && (cLow.includes('vitamin d') || cLow.includes('osteopenia'))) ||
        (mLow.includes('levothyroxine') && cLow.includes('thyroid')) ||
        (mLow.includes('metformin') && (cLow.includes('diabetes') || cLow.includes('glucose'))) ||
        (mLow.includes('omega') && cLow.includes('cholesterol'))
      ) {
        addLink(id, `cond:${cIdx}`, 'targets');
      }
    });
  });

  // 3. Symptoms (from checkin/insights/doctor dossier + patient feed symptoms)
  const symptomSet = new Map<string, string>();
  const feedSymptoms = pendingFeed.filter((f) => f.kind === 'symptom');
  for (const fs of feedSymptoms) {
    symptomSet.set(fs.title, `Reported by patient (${fs.date}): ${fs.detail || 'awaiting check'}`);
  }

  // Extract symptoms from bundle insights & checkin cues
  const insights: any[] = Array.isArray(bundle?.insights) ? bundle.insights : [];
  for (const ins of insights) {
    const txt = `${ins.title || ''} ${ins.found || ''}`.toLowerCase();
    if (txt.includes('muscle ache') || txt.includes('myalgia')) {
      symptomSet.set('Statin muscle aches', 'Prior myalgia on atorvastatin linked to SLCO1B1 (*1/*5)');
    }
    if (txt.includes('short sleep') || txt.includes('low mood')) {
      symptomSet.set('Short sleep & fatigue', 'Average 6.3h sleep · mild PHQ-9/GAD-7 screening');
    }
  }
  const dailyCheckin: any[] = Array.isArray(bundle?.checkin?.daily) ? bundle.checkin.daily : [];
  for (const item of dailyCheckin) {
    if (/tiredness|energy/i.test(item.why || '')) {
      symptomSet.set('Fatigue', item.why);
    }
  }
  if (doc?.sections) {
    const ctxText = JSON.stringify(doc.sections[0] || '');
    if (ctxText.includes('Nocturia')) {
      symptomSet.set('Nocturia', 'HPO HP:0000017 · Linked to renal & fluid monitoring');
    }
  }
  if (symptomSet.size === 0) {
    symptomSet.set('Daily wellbeing check', 'Tracked via twin daily symptom & energy check-in');
  }

  Array.from(symptomSet.entries())
    .slice(0, 4)
    .forEach(([symName, symDetail], idx) => {
      const id = `sym:${idx}`;
      addNode({
        id,
        label: symName,
        shortLabel: truncateLabel(symName, 16),
        group: 'symptom',
        detail: symDetail,
      });
      addLink(rootId, id, 'experiences');

      const sLow = symName.toLowerCase();
      conditions.slice(0, 6).forEach((cond, cIdx) => {
        const cLow = cond.toLowerCase();
        if (
          (sLow.includes('nocturia') && cLow.includes('kidney')) ||
          (sLow.includes('muscle') && cLow.includes('cholesterol')) ||
          (sLow.includes('fatigue') && (cLow.includes('vitamin d') || cLow.includes('kidney') || cLow.includes('thyroid')))
        ) {
          addLink(id, `cond:${cIdx}`, 'associated_with');
        }
      });
    });

  // 4. Biomarkers (prioritize newly uploaded report labs + flagged/key twin labs)
  const addedLabIds = new Map<string, string>();
  const pendingLabs = pendingFeed.filter((f) => f.kind === 'lab');

  pendingLabs.slice(0, 6).forEach((entry, idx) => {
    const ext = entry.extracted;
    const rawName = ext?.name || entry.title.split(/\s+/)[0] || `Lab ${idx + 1}`;
    const keyLow = rawName.toLowerCase();
    if (addedLabIds.has(keyLow)) return;
    const id = `lab:new:${idx}`;
    addedLabIds.set(keyLow, id);

    const deltaText =
      ext?.prevValue != null && ext?.pctChange != null
        ? ` (was ${ext.prevValue}, ${ext.pctChange > 0 ? '+' : ''}${ext.pctChange.toFixed(1)}%)`
        : '';
    addNode({
      id,
      label: ext ? `${ext.name}: ${ext.value} ${cleanLabUnit(ext.unit)}` : entry.title,
      shortLabel: ext ? `${truncateLabel(ext.name, 10)} ${ext.value}` : truncateLabel(entry.title, 15),
      group: 'biomarker',
      flagged: Boolean(ext?.flag),
      isPendingReport: true,
      detail: `New report (${entry.date}, waiting for check): ${entry.title}${deltaText}`,
    });
    addLink(rootId, id, 'new_report_lab');
  });

  const labsObj: Record<string, any[]> =
    bundle?.labs && typeof bundle.labs === 'object' ? bundle.labs : {};
  const prioritizedLabs = Object.entries(labsObj)
    .filter(([k, arr]) => Array.isArray(arr) && arr.length > 0 && !addedLabIds.has(k.toLowerCase()))
    .sort(([, a], [, b]) => {
      const fa = a[a.length - 1]?.flag ? 1 : 0;
      const fb = b[b.length - 1]?.flag ? 1 : 0;
      return fb - fa;
    })
    .slice(0, Math.max(3, 8 - addedLabIds.size));

  prioritizedLabs.forEach(([labName, arr], idx) => {
    const latest = arr[arr.length - 1];
    const id = `lab:${idx}`;
    addedLabIds.set(labName.toLowerCase(), id);
    addNode({
      id,
      label: `${labName}: ${latest.value} ${cleanLabUnit(latest.unit)}`,
      shortLabel: `${truncateLabel(labName, 11)} ${latest.value}`,
      group: 'biomarker',
      flagged: Boolean(latest.flag),
      detail: `Latest verified (${latest.date}): ${latest.value} ${cleanLabUnit(latest.unit)}${
        latest.flag ? ` [${String(latest.flag).toUpperCase()}]` : ''
      }`,
    });
    addLink(rootId, id, 'measured');
  });

  // Connect biomarkers to conditions & medicines
  for (const [labKey, labNodeId] of addedLabIds.entries()) {
    conditions.slice(0, 6).forEach((cond, cIdx) => {
      const cLow = cond.toLowerCase();
      if (
        (/egfr|creatinin|uacr|potassium|urate/.test(labKey) && cLow.includes('kidney')) ||
        (/ldl|apob|lp\(a\)|cholesterol|triglycerid/.test(labKey) && cLow.includes('cholesterol')) ||
        (/hba1c|glucose/.test(labKey) && (cLow.includes('glucose') || cLow.includes('diabetes'))) ||
        (/vitamin d|calcium/.test(labKey) && (cLow.includes('vitamin d') || cLow.includes('osteopenia'))) ||
        (/systolic|bp|potassium/.test(labKey) && cLow.includes('blood pressure')) ||
        (/tsh|free t4/.test(labKey) && cLow.includes('thyroid'))
      ) {
        addLink(labNodeId, `cond:${cIdx}`, 'monitors');
      }
    });

    meds.slice(0, 5).forEach((med, mIdx) => {
      const mLow = med.toLowerCase();
      if (
        (mLow.includes('losartan') && /egfr|uacr|potassium|creatinin/.test(labKey)) ||
        (mLow.includes('vitamin d') && /vitamin d/.test(labKey)) ||
        (mLow.includes('levothyroxine') && /tsh/.test(labKey))
      ) {
        addLink(`med:${mIdx}`, labNodeId, 'modulates');
      }
    });
  }

  // 5. Verified KG Insights & Pharmacogenomic Genes
  insights.slice(0, 5).forEach((ins) => {
    const id = `ins:${ins.id}`;
    addNode({
      id,
      label: ins.title,
      shortLabel: truncateLabel(ins.title, 17),
      group: 'finding',
      findingId: ins.id,
      detail: `${ins.found || ''} ${ins.do ? `· Next: ${ins.do}` : ''}`.trim(),
    });

    const area = String(ins.area || '').toLowerCase();
    let linked = false;
    for (const [labKey, labNodeId] of addedLabIds.entries()) {
      if (
        (area === 'kidney' && /egfr|creatinin|uacr|urate/.test(labKey)) ||
        (area === 'heart' && /ldl|apob|lp\(a\)|crp/.test(labKey)) ||
        (area === 'metabolism' && /hba1c|glucose/.test(labKey)) ||
        (area === 'bones' && /vitamin d/.test(labKey))
      ) {
        addLink(id, labNodeId, 'evidenced_by');
        linked = true;
      }
    }
    if (!linked) {
      addLink(rootId, id, 'kg_finding');
    }
  });

  const genes: any[] = Array.isArray(bundle?.genetics?.genes) ? bundle.genetics.genes : [];
  const keyGenes = genes
    .filter((g) => g.role === 'patient_variant' || ['SLCO1B1', 'APOE', 'CYP2C19'].includes(g.gene))
    .slice(0, 3);
  keyGenes.forEach((g) => {
    const id = `gene:${g.gene}`;
    addNode({
      id,
      label: `Gene ${g.gene}`,
      shortLabel: g.gene,
      group: 'finding',
      detail: `${g.gene} (${g.role}): ${g.function || 'Genomic marker in twin KG'}`,
    });
    addLink(rootId, id, 'carries_variant');
    if (g.gene === 'SLCO1B1' && nodesMap.has('ins:statin_genes')) {
      addLink(id, 'ins:statin_genes', 'explains');
    }
  });

  return {
    nodes: Array.from(nodesMap.values()),
    links,
  };
}

export function KnowledgeGraphCard({
  b,
  doc,
  readStore,
  openFinding,
  compact = false,
}: {
  b: any;
  doc?: any;
  readStore?: <T>(key: string, fallback: T) => T;
  openFinding?: (id: string) => void;
  compact?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [filterGroup, setFilterGroup] = useState<'all' | KgNodeGroup>('all');
  const [selectedNode, setSelectedNode] = useState<KgNode | null>(null);
  const [feedTick, setFeedTick] = useState(0);
  const [width, setWidth] = useState<number>(320);

  useEffect(() => {
    const onFeed = () => setFeedTick((v) => v + 1);
    window.addEventListener(FEED_EVENT, onFeed);
    return () => window.removeEventListener(FEED_EVENT, onFeed);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      const w = Math.max(240, Math.floor(el.getBoundingClientRect().width));
      setWidth(w);
    };
    updateSize();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(updateSize);
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, []);

  const pendingFeed = useMemo<FeedEntry[]>(() => {
    void feedTick;
    return readStore ? readStore<FeedEntry[]>('mx-feed', []) : [];
  }, [readStore, feedTick, b]);

  const fullGraph = useMemo(
    () => buildPatientKnowledgeGraph(b, pendingFeed, doc),
    [b, pendingFeed, doc]
  );

  const filteredGraph = useMemo(() => {
    if (filterGroup === 'all') return fullGraph;
    const allowedIds = new Set(
      fullGraph.nodes
        .filter((n) => n.group === 'patient' || n.group === filterGroup)
        .map((n) => n.id)
    );
    return {
      nodes: fullGraph.nodes.filter((n) => allowedIds.has(n.id)),
      links: fullGraph.links.filter((l) => {
        const s = typeof l.source === 'string' ? l.source : l.source.id;
        const t = typeof l.target === 'string' ? l.target : l.target.id;
        return allowedIds.has(s) && allowedIds.has(t);
      }),
    };
  }, [fullGraph, filterGroup]);

  const height = compact ? 250 : width < 480 ? 280 : 340;

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const nodes: KgNode[] = filteredGraph.nodes.map((n) => ({ ...n }));
    const links: KgLink[] = filteredGraph.links.map((l) => ({
      ...l,
      source: typeof l.source === 'string' ? l.source : l.source.id,
      target: typeof l.target === 'string' ? l.target : l.target.id,
    }));

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const gRoot = svg.append('g').attr('class', 'mx-kg-viewport');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.55, 2.5])
      .on('zoom', (event) => {
        gRoot.attr('transform', event.transform.toString());
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    const isNarrow = width < 420;
    const simulation = d3
      .forceSimulation<KgNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<KgNode, KgLink>(links)
          .id((d) => d.id)
          .distance(isNarrow ? 54 : 74)
      )
      .force('charge', d3.forceManyBody().strength(isNarrow ? -135 : -210))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'collide',
        d3.forceCollide<KgNode>().radius((d) => (d.group === 'patient' ? 28 : 22))
      )
      .force('x', d3.forceX(width / 2).strength(0.09))
      .force('y', d3.forceY(height / 2).strength(0.11));

    const linkSel = gRoot
      .append('g')
      .attr('stroke', '#cfd6d6')
      .attr('stroke-opacity', 0.85)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.4)
      .attr('stroke-dasharray', (d) => (d.relation === 'new_report_lab' ? '4 2' : null));

    const nodeSel = gRoot
      .append('g')
      .selectAll<SVGGElement, KgNode>('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        setSelectedNode(d);
      });

    const dragBehavior = d3
      .drag<SVGGElement, KgNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeSel.call(dragBehavior);

    // Outer halo for newly uploaded report biomarkers or flagged nodes
    nodeSel
      .filter((d) => Boolean(d.isPendingReport || d.flagged))
      .append('circle')
      .attr('r', (d) => GROUP_META[d.group].radius + 4)
      .attr('fill', 'none')
      .attr('stroke', (d) => (d.isPendingReport ? '#8a5300' : '#b42318'))
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', (d) => (d.isPendingReport ? '3 2' : null));

    nodeSel
      .append('circle')
      .attr('r', (d) => GROUP_META[d.group].radius)
      .attr('fill', (d) => GROUP_META[d.group].color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    nodeSel
      .append('text')
      .text((d) => d.shortLabel)
      .attr('x', 0)
      .attr('y', (d) => GROUP_META[d.group].radius + 12)
      .attr('text-anchor', 'middle')
      .attr('fill', '#0d1211')
      .attr('font-size', isNarrow ? '9.5px' : '10.5px')
      .attr('font-weight', (d) => (d.group === 'patient' ? '600' : '500'))
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      const pad = 24;
      for (const n of nodes) {
        if (typeof n.x === 'number') {
          n.x = Math.max(pad, Math.min(width - pad, n.x));
        }
        if (typeof n.y === 'number') {
          n.y = Math.max(pad, Math.min(height - pad, n.y));
        }
      }

      linkSel
        .attr('x1', (d) => (d.source as KgNode).x ?? width / 2)
        .attr('y1', (d) => (d.source as KgNode).y ?? height / 2)
        .attr('x2', (d) => (d.target as KgNode).x ?? width / 2)
        .attr('y2', (d) => (d.target as KgNode).y ?? height / 2);

      nodeSel.attr('transform', (d) => `translate(${d.x ?? width / 2},${d.y ?? height / 2})`);
    });

    return () => {
      simulation.stop();
    };
  }, [filteredGraph, width, height]);

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(250)
        .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  return (
    <section className="card rs-wide mx-kg-card" aria-label="Patient Knowledge Graph">
      <div className="sec mx-kg-header">
        <div>
          <span className="mx-eyebrow">Interactive Knowledge Graph</span>
          <h2>Conditions, symptoms, treatments &amp; biomarkers</h2>
        </div>
        <button type="button" className="link" onClick={handleResetZoom}>
          Reset view
        </button>
      </div>

      <div className="mx-kg-filters" role="tablist" aria-label="Filter Knowledge Graph">
        {(
          [
            ['all', 'All'],
            ['condition', 'Conditions'],
            ['symptom', 'Symptoms'],
            ['treatment', 'Treatments'],
            ['biomarker', 'Biomarkers'],
            ['finding', 'Genes & KG'],
          ] as Array<['all' | KgNodeGroup, string]>
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`mx-kg-chip${filterGroup === key ? ' is-active' : ''}`}
            onClick={() => setFilterGroup(key)}
          >
            {key !== 'all' && (
              <i
                style={{ backgroundColor: GROUP_META[key].color }}
                aria-hidden="true"
              />
            )}
            {label}
          </button>
        ))}
      </div>

      <div ref={containerRef} className="mx-kg-stage">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Knowledge graph for ${b?.patient?.preferred_name || 'patient'}`}
        />
      </div>

      {selectedNode ? (
        <div className="mx-kg-detail">
          <div className="mx-kg-detail-top">
            <span
              className="mx-kg-badge"
              style={{
                backgroundColor: GROUP_META[selectedNode.group].bg,
                color: GROUP_META[selectedNode.group].color,
              }}
            >
              {GROUP_META[selectedNode.group].label}
            </span>
            {selectedNode.isPendingReport && (
              <span className="state warn">
                <i />
                Waiting for check
              </span>
            )}
            <button
              type="button"
              className="link"
              onClick={() => setSelectedNode(null)}
            >
              Close
            </button>
          </div>
          <b>{selectedNode.label}</b>
          <p className="note">{selectedNode.detail}</p>
          {selectedNode.findingId && openFinding && (
            <button
              type="button"
              className="link"
              onClick={() => openFinding(selectedNode.findingId!)}
            >
              Open full finding →
            </button>
          )}
        </div>
      ) : (
        <p className="note mx-kg-hint">
          Drag nodes to explore connections or tap any node to inspect its clinical link. Dashed links indicate newly uploaded report results.
        </p>
      )}
    </section>
  );
}
