import fs from 'node:fs';
import path from 'node:path';
import type { CreateTwinRequestBody, CreateTwinResponse, ExtractResultItem } from './types.ts';

export interface StoredGeneratedTwin {
  id: string;
  indexEntry: CreateTwinResponse['index_entry'];
  bundle: any;
  doctorBundle: any;
}

const generatedTwins = new Map<string, StoredGeneratedTwin>();

function calculateAge(dob: string): number {
  if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return 42;
  const [y, m, d] = dob.split('-').map(Number);
  const now = new Date();
  let age = now.getFullYear() - y;
  const mo = now.getMonth() + 1 - m;
  if (mo < 0 || (mo === 0 && now.getDate() < d)) {
    age--;
  }
  return Math.max(18, Math.min(110, age));
}

function loadScaffoldJson(portalDir: string | null, relativePath: string): any {
  if (!portalDir) return {};
  const fullPath = path.join(portalDir, relativePath);
  try {
    if (fs.existsSync(fullPath)) {
      return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    }
  } catch {
    // ignore
  }
  return {};
}

export function getGeneratedTwinsList(): CreateTwinResponse['index_entry'][] {
  return Array.from(generatedTwins.values())
    .map((t) => t.indexEntry)
    .reverse();
}

export function getGeneratedTwinById(id: string): StoredGeneratedTwin | undefined {
  return generatedTwins.get(id);
}

export function buildOnboardingTwin(
  payload: CreateTwinRequestBody,
  portalDir: string | null
): CreateTwinResponse {
  const cleanName = (payload.details?.name || 'Alex').trim();
  const firstName = cleanName.split(/\s+/)[0] || 'Alex';
  const dob = payload.details?.dob || '1986-05-14';
  const age = calculateAge(dob);
  const q = payload.questionnaire || {};
  const rawSex = String(q.sex || 'Female').toLowerCase();
  const sex = rawSex.includes('male') && !rawSex.includes('female')
    ? 'male'
    : rawSex.includes('intersex')
      ? 'intersex'
      : 'female';

  const isSnapshot = payload.path_type === 'snapshot';
  const uploadedLabs: ExtractResultItem[] = Array.isArray(payload.uploaded_labs)
    ? payload.uploaded_labs
    : [];
  const linkedRecords = Array.isArray(payload.linked_records) ? payload.linked_records : [];
  const genetics = Array.isArray(payload.genetics) ? payload.genetics : [];
  const today = new Date().toISOString().slice(0, 10);

  // Pick rich base template depending on whether renal/metabolic labs were uploaded
  const hasRenalOrLipidFlags = uploadedLabs.some((l) => Boolean(l.flag));
  const templateId = hasRenalOrLipidFlags ? 'MX-SYN-T02' : 'MX-SYN-T07';
  const baseBundle = JSON.parse(
    JSON.stringify(loadScaffoldJson(portalDir, `patient-data/${templateId}.json`))
  );
  const baseDoctor = JSON.parse(
    JSON.stringify(loadScaffoldJson(portalDir, `patient-data/doctor/${templateId}.json`))
  );

  const idSuffix = String(Date.now()).slice(-5);
  const newId = `MX-ONB-${idSuffix}`;

  const conditions: string[] = Array.isArray(q.conditions)
    ? q.conditions.filter((c: string) => c && c !== 'None')
    : [];
  const symptoms: string[] = Array.isArray(q.symptoms)
    ? q.symptoms.filter((s: string) => s && s !== 'None')
    : [];
  const medListText = typeof q.med_list === 'string' && q.med_list.trim() ? q.med_list.trim() : '';
  const medicines = medListText
    ? medListText
        .split(/[,;\n]+/)
        .map((s: string) => s.trim())
        .filter(Boolean)
    : q.meds === 'No'
      ? []
      : baseBundle?.patient?.medicines?.slice(0, 1) || [];

  const supplements: string[] = Array.isArray(q.supplements)
    ? q.supplements.filter((s: string) => s && s !== 'None')
    : [];

  const tags: string[] = [
    isSnapshot ? 'snapshot twin' : 'full membership report',
    ...(uploadedLabs.length > 0 ? ['lab report extracted'] : []),
    ...(linkedRecords.length > 0 ? ['linked EHR'] : []),
    ...(genetics.length > 0 ? ['genetics + PGx'] : []),
  ];

  const mainConcern =
    payload.summary_lines?.concern && payload.summary_lines.concern !== 'Not shared'
      ? payload.summary_lines.concern
      : conditions[0] || symptoms[0] || 'Baseline wellness & prevention';

  const headline = isSnapshot
    ? `Snapshot twin: ${mainConcern.toLowerCase()}${uploadedLabs.length ? ` · ${uploadedLabs.length} lab values` : ''}`
    : `Full assessment twin: ${mainConcern.toLowerCase()}${genetics.length ? ' · PGx & genomics' : ''}`;

  // Merge uploaded labs into bundle.labs
  const mergedLabs: Record<string, any[]> = isSnapshot ? {} : { ...(baseBundle.labs || {}) };
  for (const item of uploadedLabs) {
    const key = item.name.trim();
    const existing = mergedLabs[key] || [];
    mergedLabs[key] = [
      ...existing,
      {
        date: item.date || today,
        value: item.value,
        unit: item.unit,
        lab: linkedRecords[0] || 'Uploaded Lab Report',
        flag: item.flag,
        rule_evaluated: true,
      },
    ];
  }

  // Ensure at least baseline labs if linked records were connected
  if (Object.keys(mergedLabs).length === 0 && baseBundle.labs) {
    for (const [k, v] of Object.entries(baseBundle.labs).slice(0, 8)) {
      mergedLabs[k] = v as any[];
    }
  }

  // Build personalized insights from uploaded labs + genetics + questionnaire
  const customInsights: any[] = [];
  const flaggedLabs = uploadedLabs.filter((l) => l.flag === 'high' || l.flag === 'low');
  if (flaggedLabs.length > 0) {
    const topFlagged = flaggedLabs.slice(0, 3);
    customInsights.push({
      id: 'onb_lab_flags',
      title: `${topFlagged.length} result${topFlagged.length > 1 ? 's' : ''} outside reference range on your uploaded report`,
      priority: 1,
      organ: topFlagged.some((l) => /egfr|creatinin|uacr/i.test(l.name)) ? 'kidneyL' : 'heart',
      area: topFlagged.some((l) => /egfr|creatinin|uacr/i.test(l.name)) ? 'kidney' : 'heart',
      found: topFlagged
        .map((l) => `${l.name}: ${l.value} ${l.unit} (${l.flag}${l.range ? `, ref ${l.range}` : ''})`)
        .join('; '),
      why: 'Values flagged outside the laboratory reference interval help focus your doctor consult and follow-up panel.',
      means: `Combined with your main concern (${mainConcern}), your twin highlights these biomarkers first.`,
      do: payload.consult?.doctor
        ? `Review these flagged results during your scheduled consult with ${payload.consult.doctor}.`
        : 'Share this snapshot with your clinician and consider completing missing baseline tests.',
      expected: 'Clear trend tracking once a second repeat measurement is added.',
      certainty: 'B',
      evidence: [{ finding_id: 'Onboarding Lab Rule', grade: 'B', sources: ['PMID:38490803'] }],
      helps: 'Turns a single report into a longitudinal twin baseline.',
    });
  }

  if (genetics.length > 0) {
    const geneSummary = genetics
      .map((g) => `${g.gene}${g.variant ? ` (${g.variant})` : ''}${g.phenotype ? ` — ${g.phenotype}` : ''}`)
      .join('; ');
    customInsights.push({
      id: 'onb_pgx_profile',
      title: 'Your uploaded pharmacogenomic & genetic variants are linked',
      priority: 1,
      organ: 'liver',
      area: 'medicines',
      found: `Uploaded genetic markers: ${geneSummary}.`,
      why: 'Pharmacogenomic variants shape how enzymes and transporters handle statins, antiplatelets, PPIs, and antihypertensives.',
      means: 'Your twin cross-checks future prescriptions against your uploaded genotype.',
      do: 'Show your pharmacogenomic summary to your prescribing doctor before starting or changing doses.',
      expected: 'Fewer side effects and better-matched medicine dosing.',
      certainty: 'A',
      evidence: [{ finding_id: 'CPIC PGx Guideline', grade: 'A', sources: ['PMID:35150436'] }],
      helps: 'Matches medicine choices to your genetics.',
    });
  }

  if (payload.summary_lines?.top_goal && payload.summary_lines.top_goal !== 'Not shared') {
    customInsights.push({
      id: 'onb_goal_focus',
      title: `Priority goal: ${payload.summary_lines.top_goal}`,
      priority: 2,
      organ: 'brain',
      area: 'metabolism',
      found: `Main concern: ${mainConcern}. Support requested: ${payload.summary_lines.support || 'Guided plan'}.`,
      why: payload.summary_lines.barrier && payload.summary_lines.barrier !== 'Not shared'
        ? `You noted "${payload.summary_lines.barrier}" as a barrier, so your plan breaks next steps into manageable checks.`
        : 'Aligning your biomarker panel to your personal goal keeps follow-ups focused.',
      means: isSnapshot
        ? 'Your Snapshot Twin maps what is already known and which tests fill remaining gaps.'
        : 'Your Full Membership Twin tracks your goal across lab panels and physician reviews.',
      do: 'Use Daily Check-in and Feed Your Twin whenever new home measurements or reports arrive.',
      expected: 'Measurable progress over the next 3–6 months.',
      certainty: 'B',
      evidence: [],
      helps: 'Keeps your care team aligned with what matters most to you.',
    });
  }

  const finalInsights = [
    ...customInsights,
    ...(Array.isArray(baseBundle.insights) ? baseBundle.insights.slice(0, isSnapshot ? 3 : 6) : []),
  ];

  // Merge genetics into bundle.genetics
  const mergedGenes = [
    ...genetics.map((g) => ({
      gene: g.gene,
      protein: null,
      role: g.role || 'patient_variant',
      function: g.phenotype
        ? `${g.variant ? `${g.variant}: ` : ''}${g.phenotype}`
        : 'Uploaded during Mutanex onboarding genomic intake.',
    })),
    ...(Array.isArray(baseBundle?.genetics?.genes) ? baseBundle.genetics.genes.slice(0, 8) : []),
  ];

  const researchPipeline: CreateTwinResponse['research_pipeline'] = [
    {
      stage: 'Questionnaire & phenotype mapping',
      detail: `Processed 10-section intake for ${firstName} (${conditions.length} conditions, ${symptoms.length} symptoms).`,
      status: 'done',
    },
    {
      stage: 'Lab extraction & EHR record linkage',
      detail: `${uploadedLabs.length} extracted lab biomarkers verified${
        linkedRecords.length ? `; linked ${linkedRecords.join(', ')}` : ''
      }.`,
      status: 'done',
    },
    {
      stage: 'Genomics & PGx variant annotation',
      detail: genetics.length
        ? `${genetics.length} uploaded genetic/PGx loci annotated against CPIC & ClinVar.`
        : 'No VCF/PGx file attached yet — marked ready for future genomic unlock.',
      status: 'done',
    },
    {
      stage: 'Knowledge Graph & CDSS dossier synthesis',
      detail: isSnapshot
        ? 'Snapshot completeness ranked and baseline twin published.'
        : `Full twin + physician dossier prepared${payload.consult?.doctor ? ` with ${payload.consult.doctor}` : ''}.`,
      status: 'done',
    },
  ];

  const bundle = {
    ...baseBundle,
    generated: new Date().toISOString(),
    patient: {
      ...(baseBundle.patient || {}),
      preferred_name: firstName,
      date_of_birth: dob,
      age,
      sex,
      twin_created: today,
      conditions: conditions.length > 0 ? conditions : ['Baseline preventive assessment'],
      medicines,
      supplements,
      doctor: payload.consult?.doctor || (isSnapshot ? 'Mutanex Snapshot Care Team' : 'Mutanex Membership Physician'),
      headline,
      tags,
      synthetic: false,
      record_date: today,
    },
    labs: mergedLabs,
    insights: finalInsights,
    genetics: {
      ...(baseBundle.genetics || {}),
      genes: mergedGenes,
    },
    research_stages: researchPipeline.map((s) => ({
      name: s.stage,
      result: s.detail,
      status: 'done',
    })),
    twin_versions: [
      {
        version: 'Twin 1',
        name: isSnapshot ? 'Onboarding Snapshot' : 'Initial Full Assessment',
        date: today,
        status: 'current',
        based_on: `${uploadedLabs.length || Object.keys(mergedLabs).length} lab biomarkers, 10-section intake${
          genetics.length ? `, ${genetics.length} genetic markers` : ''
        }`,
      },
      {
        version: 'Twin 2',
        name: 'After follow-up panel',
        date: '',
        status: 'waiting',
        based_on: (payload.upsell_panels || []).join(', ') || 'Next personalised panel',
      },
    ],
    narrative: {
      ...(baseBundle.narrative || {}),
      biomarker_summary:
        uploadedLabs.length > 0
          ? `Built from your uploaded lab report (${uploadedLabs
              .slice(0, 4)
              .map((l) => `${l.name} ${l.value} ${l.unit}`)
              .join(', ')}) and your 10-section health intake.`
          : `Built from your 10-section health intake and linked baseline records for ${firstName}.`,
      lifestyle_summary: `Diet: ${q.diet || 'Mixed'}; activity: ${q.activity || 'recorded'} min/wk; sleep: ${
        q.sleep || 'recorded'
      } hrs; smoking: ${q.smoking || 'Never'}.`,
    },
  };

  const doctorBundle = {
    ...baseDoctor,
    id: newId,
    generated: today,
    priorities: [
      ...(flaggedLabs.map((l) => `${l.name} (${l.value} ${l.unit}) outside reference interval`)),
      ...(genetics.map((g) => `PGx / Genomic review: ${g.gene} ${g.variant || ''} ${g.phenotype || ''}`.trim())),
      `Primary patient goal: ${payload.summary_lines?.top_goal || mainConcern}`,
    ].slice(0, 8),
  };

  const indexEntry: CreateTwinResponse['index_entry'] = {
    id: newId,
    name: firstName,
    age,
    sex,
    headline,
    tags,
  };

  generatedTwins.set(newId, {
    id: newId,
    indexEntry,
    bundle,
    doctorBundle,
  });

  return {
    id: newId,
    index_entry: indexEntry,
    research_pipeline: researchPipeline,
    bundle,
    doctor_bundle: doctorBundle,
  };
}
