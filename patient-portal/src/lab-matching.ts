import type { ExtractedLabItem, LabPoint, MatchedLabRow } from './types';

function normalizeAnalyteToken(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const SYNONYM_GROUPS: string[][] = [
  ['egfr', 'estimated gfr', 'glomerular filtration rate', 'gfr', 'egfr ckd epi', 'ckd epi'],
  ['hba1c', 'hemoglobin a1c', 'haemoglobin a1c', 'glycated hemoglobin', 'glycated haemoglobin', 'a1c', 'glycosylated hemoglobin'],
  ['ldl', 'ldl c', 'ldl cholesterol', 'low density lipoprotein', 'direct ldl'],
  ['hdl', 'hdl c', 'hdl cholesterol', 'high density lipoprotein'],
  ['uacr', 'acr', 'urine acr', 'urine albumin', 'urine albumin creatinine ratio', 'urine albumin to creatinine ratio', 'albumin creatinine ratio', 'microalbumin creatinine ratio'],
  ['creatinine', 'serum creatinine', 'creatinine serum', 'creat', 'scr'],
  ['fasting glucose', 'glucose fasting', 'fasting plasma glucose', 'fasting blood sugar', 'fbs', 'fpg', 'blood glucose fasting'],
  ['crp', 'hs crp', 'hscrp', 'high sensitivity crp', 'high sensitivity c reactive protein', 'c reactive protein'],
  ['25 oh vitamin d', 'vitamin d', '25 hydroxyvitamin d', '25 oh vit d', 'vit d', 'cholecalciferol', 'vitamin d 25 oh'],
  ['total cholesterol', 'cholesterol total', 'serum cholesterol', 'cholesterol'],
  ['triglycerides', 'triglyceride', 'tg', 'trigs'],
  ['apob', 'apolipoprotein b', 'apo b'],
  ['lp a', 'lpa', 'lipoprotein a'],
  ['potassium', 'serum potassium', 'k', 'potassium serum'],
  ['sodium', 'serum sodium', 'na', 'sodium serum'],
  ['urate', 'uric acid', 'serum urate', 'serum uric acid'],
  ['calcium', 'serum calcium', 'total calcium'],
  ['alt', 'sgpt', 'alanine aminotransferase', 'alanine transaminase'],
  ['ast', 'sgot', 'aspartate aminotransferase', 'aspartate transaminase'],
  ['albumin serum', 'albumin', 'serum albumin'],
  ['alkaline phosphatase serum', 'alkaline phosphatase', 'alp'],
  ['tsh', 'thyroid stimulating hormone', 'thyrotropin'],
  ['free t4', 'ft4', 'free thyroxine', 'thyroxine free'],
  ['ferritin', 'serum ferritin'],
  ['transferrin saturation', 'tsat', 'iron saturation'],
  ['vitamin b12', 'vit b12', 'cobalamin', 'b12'],
  ['hemoglobin', 'haemoglobin', 'hb', 'hgb'],
  ['platelets', 'platelet count', 'plt'],
  ['white cell count blood', 'wbc', 'white blood cell count', 'leukocytes', 'total wbc'],
  ['cystatin c', 'serum cystatin c'],
  ['urea', 'blood urea', 'bun', 'blood urea nitrogen'],
  ['bicarbonate', 'hco3', 'co2 total', 'serum bicarbonate'],
  ['parathyroid hormone', 'pth', 'intact pth'],
  ['nt probnp', 'nt pro bnp', 'probnp'],
];

function findCanonicalGroupIndex(rawName: string): number {
  const norm = normalizeAnalyteToken(rawName);
  const compact = norm.replace(/\s+/g, '');

  for (let i = 0; i < SYNONYM_GROUPS.length; i++) {
    for (const alias of SYNONYM_GROUPS[i]) {
      const aliasNorm = normalizeAnalyteToken(alias);
      const aliasCompact = aliasNorm.replace(/\s+/g, '');
      if (norm === aliasNorm || compact === aliasCompact) {
        return i;
      }
    }
  }

  // Secondary check for prefix/contains on unambiguous multi-letter names (avoiding 'uacr' matching 'creatinine')
  for (let i = 0; i < SYNONYM_GROUPS.length; i++) {
    for (const alias of SYNONYM_GROUPS[i]) {
      const aliasNorm = normalizeAnalyteToken(alias);
      if (aliasNorm.length >= 4 && (norm.startsWith(aliasNorm + ' ') || norm.endsWith(' ' + aliasNorm))) {
        if (norm.includes('albumin') && aliasNorm === 'creatinine') continue;
        return i;
      }
    }
  }

  return -1;
}

export function cleanLabUnit(unit: string | null | undefined): string {
  if (!unit) return '';
  return unit
    .replace(/\{1\.73_m2\}/gi, '1.73m²')
    .replace(/mL\/min\/1\.73m2/gi, 'mL/min/1.73m²')
    .replace(/m\[IU\]\/L/gi, 'mIU/L')
    .replace(/mm\[Hg\]/gi, 'mmHg')
    .trim();
}

export function findLatestMatchingTwinLab(
  extractedName: string,
  labs: Record<string, LabPoint[]> | undefined | null
): { key: string; latest: LabPoint } | null {
  if (!labs || typeof labs !== 'object') return null;

  const entries = Object.entries(labs).filter(
    ([, arr]) => Array.isArray(arr) && arr.length > 0
  );
  if (entries.length === 0) return null;

  const targetLower = extractedName.trim().toLowerCase();
  const targetNorm = normalizeAnalyteToken(extractedName);
  const targetCompact = targetNorm.replace(/\s+/g, '');

  // 1. Exact case-insensitive or normalized match
  for (const [key, arr] of entries) {
    const keyNorm = normalizeAnalyteToken(key);
    if (
      key.trim().toLowerCase() === targetLower ||
      keyNorm === targetNorm ||
      keyNorm.replace(/\s+/g, '') === targetCompact
    ) {
      return { key, latest: arr[arr.length - 1] };
    }
  }

  // 2. Canonical clinical synonym group match (eGFR, HbA1c, LDL, uACR, CRP, etc.)
  const targetGroup = findCanonicalGroupIndex(extractedName);
  if (targetGroup !== -1) {
    for (const [key, arr] of entries) {
      if (findCanonicalGroupIndex(key) === targetGroup) {
        return { key, latest: arr[arr.length - 1] };
      }
    }
  }

  return null;
}

export function matchExtractedResultsToTwin(
  results: ExtractedLabItem[],
  labs: Record<string, LabPoint[]> | undefined | null,
  fallbackDate: string | null
): MatchedLabRow[] {
  return results.map((item, idx) => {
    const match = findLatestMatchingTwinLab(item.name, labs);
    const prevValue =
      match && typeof match.latest.value === 'number' && !Number.isNaN(match.latest.value)
        ? match.latest.value
        : null;
    const prevUnit = match?.latest.unit ?? null;
    const prevDate = match?.latest.date ?? null;

    let pctChange: number | null = null;
    let arrow: '↑' | '↓' | '→' | null = null;

    if (prevValue !== null && prevValue !== 0 && typeof item.value === 'number') {
      pctChange = ((item.value - prevValue) / Math.abs(prevValue)) * 100;
      if (Math.abs(pctChange) < 0.05) {
        arrow = '→';
      } else if (pctChange > 0) {
        arrow = '↑';
      } else {
        arrow = '↓';
      }
    }

    return {
      ...item,
      date: item.date || fallbackDate || null,
      id: `ext-${idx}-${item.name}`,
      kept: true,
      matchedLabKey: match?.key ?? null,
      prevValue,
      prevUnit,
      prevDate,
      pctChange,
      arrow,
    };
  });
}
