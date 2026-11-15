import test from 'node:test';
import assert from 'node:assert/strict';
import { matchExtractedResultsToTwin } from './lab-matching';
import {
  createInitialNavigationState,
  getLogicalParentHash,
  getNavigationBackTarget,
  navigationReducer,
  parsePortalHash,
  resolveBackTarget,
} from './navigation';
import {
  computePreservationScore,
  computeSyntheticSpeechMouthOpen,
  createSampleVoiceWavBase64,
} from './preserve-math';
import {
  applyMultiChoicePick,
  computeQuestionnaireSummary,
  getVisibleQuestions,
} from './questionnaire-spec';

test('navigation: parsePortalHash groups sub-tabs and normalizes aliases', () => {
  const askSub = parsePortalHash('#/ask/ask');
  assert.equal(askSub.tab, 'you');
  assert.equal(askSub.sub, 'checkin:ask');
  assert.equal(askSub.pageKey, 'you/checkin');

  const checkinToday = parsePortalHash('#/you/checkin:today');
  const checkinAsk = parsePortalHash('#/you/checkin:ask');
  assert.equal(checkinToday.pageKey, 'you/checkin');
  assert.equal(checkinAsk.pageKey, 'you/checkin');

  const twinOrgan = parsePortalHash('#/twin/o:kidneys');
  assert.equal(twinOrgan.pageKey, 'twin');
});

test('navigation: resolveBackTarget skips same-page sub-tabs and welcome, and falls back on deep links', () => {
  // Deep link with empty history goes to logical parent (#/you)
  const deepLinkRes = resolveBackTarget(['#/me/preserve'], '#/me/preserve');
  assert.equal(deepLinkRes.targetHash, '#/you');
  assert.equal(deepLinkRes.backLabel, 'You');

  // Navigating Twin -> Check-in Today -> Check-in Ask -> Back returns straight to Twin
  const subTabRes = resolveBackTarget(
    ['#/welcome', '#/twin', '#/you/checkin:today', '#/you/checkin:ask'],
    '#/you/checkin:ask'
  );
  assert.equal(subTabRes.targetHash, '#/twin');
  assert.equal(subTabRes.backLabel, 'Twin');

  // Stats subpage under Twin returns to Twin
  const statsParent = getLogicalParentHash('#/twin/stats');
  assert.equal(statsParent.targetHash, '#/twin');
});

test('navigation: React-state navigationReducer tracks multi-step history, replaces same-screen sub-tabs, and pops cleanly on GO_BACK', () => {
  let state = createInitialNavigationState('#/twin');
  assert.equal(state.current.hash, '#/twin');
  assert.equal(state.history.length, 0);

  // Navigate Twin -> You -> Journey -> Stage 1
  state = navigationReducer(state, { type: 'NAVIGATE', rawHash: '#/you' });
  state = navigationReducer(state, { type: 'NAVIGATE', rawHash: '#/you/journey' });
  state = navigationReducer(state, { type: 'NAVIGATE', rawHash: '#/you/journey-1' });
  assert.equal(state.current.hash, '#/you/journey-1');
  assert.equal(state.history.length, 3);

  // GO_BACK #1 -> returns to #/you/journey
  state = navigationReducer(state, { type: 'GO_BACK' });
  assert.equal(state.current.hash, '#/you/journey');
  assert.equal(state.history.length, 2);

  // GO_BACK #2 -> returns to #/you
  state = navigationReducer(state, { type: 'GO_BACK' });
  assert.equal(state.current.hash, '#/you');
  assert.equal(state.history.length, 1);

  // Navigate to Check-in Today, then switch sub-tab to Ask (in-place update, no duplicate stack entry)
  state = navigationReducer(state, { type: 'NAVIGATE', rawHash: '#/you/checkin:today' });
  const lenAfterCheckin = state.history.length;
  state = navigationReducer(state, { type: 'NAVIGATE', rawHash: '#/you/checkin:ask' });
  assert.equal(state.current.hash, '#/you/checkin:ask');
  assert.equal(state.history.length, lenAfterCheckin);

  // GO_BACK from #/you/checkin:ask skips Today sub-tab and returns to #/you
  const backPreview = getNavigationBackTarget(state);
  assert.equal(backPreview.targetHash, '#/you');
  state = navigationReducer(state, { type: 'GO_BACK' });
  assert.equal(state.current.hash, '#/you');
});

test('lab-matching: matches synonyms case-insensitively and computes % delta and arrows', () => {
  const bundleLabs = {
    'eGFR (CKD-EPI)': [{ date: '2026-11-06', value: 58, unit: 'mL/min/1.73m2' }],
    'Urine albumin-to-creatinine ratio': [{ date: '2026-11-06', value: 46, unit: 'mg/g' }],
    'LDL cholesterol': [{ date: '2026-11-06', value: 144, unit: 'mg/dL' }],
  };

  const rows = matchExtractedResultsToTwin(
    [
      {
        name: 'egfr',
        value: 51,
        unit: 'mL/min/1.73m2',
        range: '>= 90',
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
    ],
    bundleLabs,
    '2026-11-14'
  );

  assert.equal(rows.length, 2);
  assert.equal(rows[0].prevValue, 58);
  assert.equal(rows[0].arrow, '↓');
  assert.ok(rows[0].pctChange !== null && rows[0].pctChange < -12);

  assert.equal(rows[1].prevValue, 46);
  assert.equal(rows[1].arrow, '↑');
  assert.ok(rows[1].pctChange !== null && rows[1].pctChange > 47);
});

test('questionnaire-spec: conditional visibility, exclusive multi-select, and summary lines', () => {
  // Exclusive "None of these" clears prior selections
  const picks1 = applyMultiChoicePick([], 'Diabetes or pre-diabetes', ['None of these']);
  assert.deepEqual(picks1, ['Diabetes or pre-diabetes']);
  const picks2 = applyMultiChoicePick(picks1, 'None of these', ['None of these']);
  assert.deepEqual(picks2, ['None of these']);

  // Conditional follow-up question appears only when non-exclusive conditions are picked
  const withCondVisible = getVisibleQuestions({ conditions: ['High blood pressure'] });
  const noneCondVisible = getVisibleQuestions({ conditions: ['None'] });
  assert.equal(withCondVisible.some((q) => q.id === 'condition_doctor'), true);
  assert.equal(noneCondVisible.some((q) => q.id === 'condition_doctor'), false);

  const summary = computeQuestionnaireSummary({
    conditions: ['High blood pressure'],
    goals: ['Heart & blood pressure'],
    barriers: ['Busy travel schedule'],
    support: ['Help with test results'],
  });
  assert.ok(summary.concern.includes('High blood pressure'));
  assert.ok(summary.top_goal.includes('Heart & blood pressure'));
  assert.ok(summary.barrier.includes('Busy travel schedule'));
});

test('preserve-math: convergence score, valid RIFF WAV header, and lip-sync envelope', () => {
  const base = computePreservationScore({
    hasTwinRecord: true,
    faceLikenessScore: 0,
    voiceFidelityScore: 0,
    memoriesCount: 0,
  });
  assert.equal(base.totalPct, 25);

  const trained = computePreservationScore({
    hasTwinRecord: true,
    faceLikenessScore: 86,
    voiceFidelityScore: 84,
    memoriesCount: 3,
  });
  assert.ok(trained.totalPct >= 85);
  assert.equal(trained.stageLabel, 'High-Fidelity Living Self');

  const wavB64 = createSampleVoiceWavBase64(0.2);
  const raw = Buffer.from(wavB64, 'base64');
  assert.equal(raw.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(raw.subarray(8, 12).toString('ascii'), 'WAVE');

  const mouthOpen = computeSyntheticSpeechMouthOpen(0.18, 150);
  assert.ok(mouthOpen >= 0 && mouthOpen <= 1);
});

test('preserve-math: F0 vocal pitch autocorrelation and spectral brightness detection', async () => {
  const { estimateAutocorrelationPitchHz, estimateSpectralBrightness } = await import(
    './preserve-math'
  );

  // Synthesize a pure 160 Hz voiced harmonic signal at 16 kHz and verify autocorrelation F0 detection
  const sampleRate = 16000;
  const durationSec = 0.5;
  const totalSamples = sampleRate * durationSec;
  const pcm = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    pcm[i] =
      0.6 * Math.sin(2 * Math.PI * 160 * t) +
      0.25 * Math.sin(2 * Math.PI * 320 * t);
  }
  const detectedHz = estimateAutocorrelationPitchHz(pcm, sampleRate);
  assert.ok(detectedHz !== null && Math.abs(detectedHz - 160) <= 3);

  const brightness = estimateSpectralBrightness(pcm, sampleRate);
  assert.ok(brightness >= 25 && brightness <= 95);
});

test('preserve-math: computeTwinCompleteness, buildSelfPerspectivePrompts, and analyzeAudioSamplesQuality', async () => {
  const {
    analyzeAudioSamplesQuality,
    buildSelfPerspectivePrompts,
    computeTwinCompleteness,
  } = await import('./preserve-math');
  const { FEED_CATEGORIES, inferCategoryFromEntry } = await import('./feed-categories');

  assert.equal(FEED_CATEGORIES.length, 8);
  assert.equal(
    inferCategoryFromEntry({
      id: '1',
      at: '2026-11-14',
      kind: 'diary',
      date: '2026-11-14',
      title: 'Evening reflection',
      detail: 'Felt energized after walk',
    }),
    'personal_diary'
  );

  const sampleBundle = {
    patient: {
      preferred_name: 'Anika',
      medicines: ['Levothyroxine 50 mcg'],
      supplements: ['Vitamin D3'],
    },
    domains: [
      { id: 'heart', status: 'checked' },
      { id: 'kidneys', status: 'attention' },
      { id: 'genes', status: 'none' },
    ],
    labs: { TSH: [{ date: '2026-11-01', value: 4.8, unit: 'mIU/L' }] },
    le8: [{ name: 'Sleep health', points: 80 }],
    organs: { kidneys: { label: 'Kidneys', state: 'attention' } },
  };

  const completeness = computeTwinCompleteness({
    bundle: sampleBundle,
    feedCount: 2,
    hasFace: true,
    hasVoice: true,
    memoriesCount: 3,
  });
  assert.ok(completeness.totalPct >= 65 && completeness.totalPct <= 100);
  assert.equal(completeness.assessedDomains, 2);
  assert.equal(completeness.totalDomains, 3);
  assert.equal(completeness.statusLabel, '3D likeness & personal voice preserved');

  const prompts = buildSelfPerspectivePrompts(sampleBundle, 2, 2);
  assert.equal(prompts[0], 'How am I doing overall right now?');
  assert.equal(
    prompts.some((p) => /how are you doing/i.test(p)),
    false,
    'Prompts must strictly use first-person self-perspective ("How am I doing?"), never "How are you doing?"'
  );
  assert.equal(
    prompts.some((p) => /medicines and supplements am I taking/i.test(p)),
    true
  );

  // Clean synthetic speech-like signal with quiet start/end frames -> high SNR, zero clipping
  const sr = 16000;
  const signal = new Float32Array(sr);
  for (let i = 0; i < sr; i++) {
    signal[i] = i > 2500 && i < 13500 ? 0.35 * Math.sin((2 * Math.PI * 180 * i) / sr) : 0.001;
  }
  const quality = analyzeAudioSamplesQuality(signal, sr);
  assert.equal(quality.clipping, false);
  assert.ok(quality.snrDb >= 20);
  assert.equal(quality.qualityLabel, 'Studio Clear');
});


