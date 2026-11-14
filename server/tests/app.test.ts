import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.ts';
import { DefaultGeminiService, buildKnowledgeGraphSummary, type GeminiService } from '../src/gemini.ts';
import type { AskResponse, BriefingResponse, ExtractResponse } from '../src/types.ts';

describe('Mutanex My Twin Server API', () => {
  const mockGeminiService: GeminiService = {
    ask: vi.fn(),
    extract: vi.fn(),
    briefing: vi.fn(),
    trainVoicePersona: vi.fn(),
    analyzeFaceLikeness: vi.fn(),
    speakPreservedTwin: vi.fn(),
  };

  const app = createApp(mockGeminiService);

  describe('GET /v1/ask/health', () => {
    it('returns 200 { ok: true }', async () => {
      const res = await request(app).get('/v1/ask/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
    });

    it('sets CORS headers for allowed origins', async () => {
      const res = await request(app)
        .get('/v1/ask/health')
        .set('Origin', 'http://localhost:5180');
      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5180');
    });
  });

  describe('POST /v1/ask', () => {
    it('returns 400 when question is missing', async () => {
      const res = await request(app)
        .post('/v1/ask')
        .send({ bundle: {} });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('question');
    });

    it('returns 400 when bundle is missing', async () => {
      const res = await request(app)
        .post('/v1/ask')
        .send({ question: 'How is my thyroid?' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('bundle');
    });

    it('returns structured answer and clickable web/KG sources in patient mode', async () => {
      const expectedResponse: AskResponse = {
        answer:
          'Your eGFR moved from 58 to 51 mL/min/1.73m2 (-12.1%) and uACR rose from 46 to 68 mg/g (+47.8%) on your newly uploaded report. Ask your doctor about repeating renal labs and reviewing losartan.',
        sources: [
          { kind: 'record', title: 'eGFR 51 mL/min/1.73m2', detail: 'from report, 2026-11-14' },
          { kind: 'finding', title: 'Your kidney filtering has drifted down over two years', finding_id: 'kidney_trend' },
          {
            kind: 'web',
            title: 'KDIGO 2024 Clinical Practice Guideline for CKD',
            detail: 'Google Search · kdigo.org',
            url: 'https://kdigo.org/guidelines/ckd-evaluation-and-management/',
          },
        ],
      };

      vi.mocked(mockGeminiService.ask).mockResolvedValueOnce(expectedResponse);

      const payload = {
        patient_id: 'MX-SYN-T02',
        question: 'What changed in my kidneys?',
        bundle: {
          patient: { preferred_name: 'Anika' },
          labs: { eGFR: [{ value: 58, unit: 'mL/min/{1.73_m2}', date: '2026-11-06' }] },
          insights: [{ id: 'kidney_trend', title: 'Your kidney filtering has drifted down over two years' }],
          pending_feed: [
            {
              kind: 'lab',
              date: '2026-11-14',
              title: 'eGFR 51 mL/min/1.73m2',
              detail: 'from report, 2026-11-14',
              extracted: { name: 'eGFR', value: 51, unit: 'mL/min/1.73m2', prevValue: 58, pctChange: -12.07 },
            },
          ],
        },
      };

      const res = await request(app).post('/v1/ask').send(payload);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(expectedResponse);
      expect(res.body.sources[2].kind).toBe('web');
      expect(res.body.sources[2].url).toContain('https://');
      expect(mockGeminiService.ask).toHaveBeenCalledWith({
        question: 'What changed in my kidneys?',
        bundle: payload.bundle,
        patient_id: 'MX-SYN-T02',
        mode: undefined,
        clinical: undefined,
      });
    });

    it('supports CDSS mode for physicians with clinical document', async () => {
      const cdssResponse: AskResponse = {
        answer:
          'Findings: Patient has CKD stage G3a A2 on losartan 50 mg with newly uploaded potassium 5.3 mmol/L and eGFR 51. Suggested Next Tests: Repeat BMP/potassium, cystatin C, urinalysis, and baseline CK prior to lipid therapy. For physician review.',
        sources: [
          { kind: 'record', title: 'Potassium: 5.3 mmol/L', detail: '2026-11-14' },
          { kind: 'finding', title: 'Statin PGx SLCO1B1', finding_id: 'statin_genes' },
        ],
      };

      vi.mocked(mockGeminiService.ask).mockResolvedValueOnce(cdssResponse);

      const payload = {
        patient_id: 'MX-SYN-T02',
        question: 'What should we check next?',
        bundle: { patient: { preferred_name: 'Anika' }, insights: [] },
        mode: 'cdss',
        clinical: { sections: [{ title: 'Biomarker profile', blocks: [] }] },
      };

      const res = await request(app).post('/v1/ask').send(payload);

      expect(res.status).toBe(200);
      expect(res.body.answer).toContain('For physician review.');
      expect(mockGeminiService.ask).toHaveBeenCalledWith({
        question: payload.question,
        bundle: payload.bundle,
        patient_id: 'MX-SYN-T02',
        mode: 'cdss',
        clinical: payload.clinical,
      });
    });
  });

  describe('POST /v1/extract', () => {
    it('returns 400 when file is missing', async () => {
      const res = await request(app).post('/v1/extract').send({ mime_type: 'image/png' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('file');
    });

    it('returns 400 when mime_type is unsupported', async () => {
      const res = await request(app)
        .post('/v1/extract')
        .send({ file: 'base64string...', mime_type: 'application/json' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Invalid 'mime_type'");
    });

    it('extracts printed lab results from multimodal input', async () => {
      const extractResponse: ExtractResponse = {
        report_date: '2026-11-14',
        lab: 'Metropolis Reference Lab',
        results: [
          {
            name: 'Potassium',
            value: 5.3,
            unit: 'mmol/L',
            range: '3.5 - 5.1',
            flag: 'high',
            date: '2026-11-14',
          },
          {
            name: 'eGFR',
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
      };

      vi.mocked(mockGeminiService.extract).mockResolvedValueOnce(extractResponse);

      const res = await request(app).post('/v1/extract').send({
        file: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAA=',
        mime_type: 'image/png',
      });

      expect(res.status).toBe(200);
      expect(res.body.report_date).toBe('2026-11-14');
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0].flag).toBe('high');
      expect(mockGeminiService.extract).toHaveBeenCalledWith({
        file: expect.any(String),
        mime_type: 'image/png',
      });
    });
  });

  describe('POST /v1/briefing', () => {
    it('returns 400 when bundle is missing', async () => {
      const res = await request(app)
        .post('/v1/briefing')
        .send({ new_results: [{ name: 'eGFR', value: 51, unit: 'mL/min/1.73m2' }] });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('bundle');
    });

    it('returns 400 when new_results is empty', async () => {
      const res = await request(app)
        .post('/v1/briefing')
        .send({ bundle: { patient: { preferred_name: 'Anika' } }, new_results: [] });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('new_results');
    });

    it('returns patient and clinician briefings within word limits', async () => {
      const expectedBriefing: BriefingResponse = {
        patient:
          'Your new report shows eGFR dipped from 58 to 51 and urine albumin rose from 46 to 68 mg/g, while LDL edged down from 144 to 136 mg/dL. These entries are marked waiting for your care team to check. Ask your doctor whether to repeat kidney and potassium tests soon and how this shapes your blood pressure plan.',
        clinician:
          'Uploaded report (2026-11-14, pending verification) for Anika: eGFR 51 mL/min/1.73m2 [LOW] vs 58 on 2026-11-06 (-12.1%); Creatinine 1.28 mg/dL [HIGH] vs 1.12 (+14.3%); uACR 68 mg/g [HIGH] vs 46 (+47.8%); Potassium 5.3 mmol/L [HIGH] vs 4.7 (+12.8%) on losartan 50 mg daily; LDL 136 mg/dL [HIGH] vs 144 (-5.6%). Confirm electrolytes/renal function and assess SGLT2i/lipid strategy. For physician review.',
      };

      vi.mocked(mockGeminiService.briefing!).mockResolvedValueOnce(expectedBriefing);

      const res = await request(app)
        .post('/v1/briefing')
        .send({
          bundle: { patient: { preferred_name: 'Anika' } },
          new_results: [
            {
              name: 'eGFR',
              value: 51,
              unit: 'mL/min/1.73m2',
              flag: 'low',
              date: '2026-11-14',
              prev_value: 58,
              prev_date: '2026-11-06',
              pct_change: -12.07,
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(expectedBriefing);
      expect(res.body.patient.split(/\s+/).length).toBeLessThanOrEqual(90);
      expect(res.body.clinician.split(/\s+/).length).toBeLessThanOrEqual(120);
    });

    it('enforces <=90 patient words and <=120 clinician words in DefaultGeminiService fallback', () => {
      const localSvc = new DefaultGeminiService('');
      const briefing = localSvc.generateLocalBriefing({
        bundle: {
          patient: { preferred_name: 'Anika' },
        },
        new_results: [
          { name: 'eGFR', value: 51, unit: 'mL/min/1.73m2', flag: 'low', date: '2026-11-14', prev_value: 58, prev_date: '2026-11-06', pct_change: -12.1 },
          { name: 'Creatinine', value: 1.28, unit: 'mg/dL', flag: 'high', date: '2026-11-14', prev_value: 1.12, prev_date: '2026-11-06', pct_change: 14.3 },
          { name: 'uACR', value: 68, unit: 'mg/g', flag: 'high', date: '2026-11-14', prev_value: 46, prev_date: '2026-11-06', pct_change: 47.8 },
          { name: 'Potassium', value: 5.3, unit: 'mmol/L', flag: 'high', date: '2026-11-14', prev_value: 4.7, prev_date: '2026-11-06', pct_change: 12.8 },
          { name: 'HbA1c', value: 5.8, unit: '%', flag: 'high', date: '2026-11-14', prev_value: 5.9, prev_date: '2026-11-06', pct_change: -1.7 },
          { name: 'LDL', value: 136, unit: 'mg/dL', flag: 'high', date: '2026-11-14', prev_value: 144, prev_date: '2026-11-06', pct_change: -5.6 },
        ],
      });

      expect(briefing.patient.split(/\s+/).length).toBeLessThanOrEqual(90);
      expect(briefing.clinician.split(/\s+/).length).toBeLessThanOrEqual(120);
      expect(briefing.clinician).toContain('eGFR');
    });

    it('includes pending_feed lab report entries in buildKnowledgeGraphSummary', () => {
      const summary = buildKnowledgeGraphSummary({
        patient: { preferred_name: 'Anika', conditions: ['CKD stage G3a A2'] },
        pending_feed: [
          {
            kind: 'lab',
            date: '2026-11-14',
            title: 'eGFR 51 mL/min/1.73m2',
            detail: 'from report, 2026-11-14',
            extracted: {
              name: 'eGFR',
              value: 51,
              unit: 'mL/min/1.73m2',
              flag: 'low',
              prevValue: 58,
              prevDate: '2026-11-06',
              pctChange: -12.1,
            },
          },
        ],
      });
      expect(summary).toContain('NEWLY ADDED PATIENT REPORT / FEED ENTRIES');
      expect(summary).toContain('eGFR: 51 mL/min/1.73m2 (LOW)');
      expect(summary).toContain('-12.1%');
    });
  });

  describe('POST /v1/onboarding/create-twin', () => {
    it('returns 400 when details.name is missing', async () => {
      const res = await request(app)
        .post('/v1/onboarding/create-twin')
        .send({ path_type: 'snapshot', details: { name: '', dob: '1988-04-12' } });
      expect(res.status).toBe(400);
    });

    it('synthesizes a complete twin and serves it dynamically from /patient-data', async () => {
      const res = await request(app)
        .post('/v1/onboarding/create-twin')
        .send({
          path_type: 'membership',
          tier: 'Complete Twin + Genetics',
          details: { name: 'Devika Patel', dob: '1984-07-19', region: 'California', country: 'US' },
          questionnaire: {
            sex: 'Female',
            conditions: ['High cholesterol'],
            symptoms: ['Fatigue'],
            diet: 'Vegetarian',
          },
          summary_lines: {
            concern: 'High cholesterol',
            top_goal: 'Understand my test results',
            barrier: 'Side effects of my current treatment',
            support: 'Help with test results',
          },
          uploaded_labs: [
            { name: 'LDL', value: 158, unit: 'mg/dL', range: '<100', flag: 'high', date: '2026-11-14' },
          ],
          linked_records: ['Quest Diagnostics'],
          genetics: [
            { gene: 'SLCO1B1', variant: '*1/*5', phenotype: 'Decreased function' },
          ],
          consult: { doctor: 'Dr. Meera Nair, MD', slot: 'Tomorrow · 10:30 AM', paid: true },
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toMatch(/^MX-ONB-/);
      expect(res.body.bundle.patient.preferred_name).toBe('Devika');
      expect(res.body.research_pipeline).toHaveLength(4);

      const newId = res.body.id;
      const listRes = await request(app).get('/patient-data/index.json');
      expect(listRes.status).toBe(200);
      expect(listRes.body.some((p: any) => p.id === newId)).toBe(true);

      const bundleRes = await request(app).get(`/patient-data/${newId}.json`);
      expect(bundleRes.status).toBe(200);
      expect(bundleRes.body.patient.preferred_name).toBe('Devika');
      expect(bundleRes.body.labs.LDL.at(-1).value).toBe(158);
    });
  });

  describe('Preserve Yourself AI Voice & 3D Likeness endpoints', () => {
    it('POST /v1/preserve/voice-train returns learned vocal persona and transcript', async () => {
      vi.mocked(mockGeminiService.trainVoicePersona!).mockResolvedValueOnce({
        transcript: 'Hi, I am Anika and I take things one calm step at a time.',
        profile: {
          vocal_style: 'warm, measured, reassuring',
          prebuilt_voice: 'Kore',
          cadence_wpm: 146,
          warmth: 88,
          clarity: 91,
          signature_phrases: ['one calm step at a time'],
          sample_count: 1,
          fidelity_score: 64,
          summary: 'Warm, clear conversational cadence matched to Kore.',
        },
      });

      const res = await request(app)
        .post('/v1/preserve/voice-train')
        .send({
          transcript_hint: 'Hi, I am Anika and I take things one calm step at a time.',
          patient_name: 'Anika',
          sample_count: 1,
        });

      expect(res.status).toBe(200);
      expect(res.body.profile.prebuilt_voice).toBe('Kore');
      expect(res.body.profile.fidelity_score).toBe(64);
    });

    it('POST /v1/preserve/face-analyze validates image_base64 and returns 3D likeness parameters', async () => {
      const badRes = await request(app).post('/v1/preserve/face-analyze').send({});
      expect(badRes.status).toBe(400);

      vi.mocked(mockGeminiService.analyzeFaceLikeness!).mockResolvedValueOnce({
        skin_tone_hex: '#c68b67',
        hair_color_hex: '#1c1716',
        eye_color_hex: '#3b281c',
        lip_color_hex: '#a55c55',
        face_width_ratio: 0.78,
        jaw_taper: 0.72,
        cheek_prominence: 0.68,
        brow_arch: 0.56,
        hair_style: 'medium',
        glasses: false,
        likeness_score: 84,
        likeness_summary: 'Warm medium-tan complexion, expressive dark-brown eyes, soft wavy dark hair.',
      });

      const okRes = await request(app).post('/v1/preserve/face-analyze').send({
        image_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAA=',
        mime_type: 'image/jpeg',
        photo_count: 1,
      });

      expect(okRes.status).toBe(200);
      expect(okRes.body.likeness_score).toBe(84);
      expect(okRes.body.skin_tone_hex).toBe('#c68b67');
    });

    it('POST /v1/preserve/speak returns first-person reply and TTS audio payload', async () => {
      vi.mocked(mockGeminiService.speakPreservedTwin!).mockResolvedValueOnce({
        reply_text: 'I am focusing on steady daily walks, watching my kidney numbers with my doctor, and keeping evenings calm.',
        audio_wav_base64: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=',
        voice_used: 'Kore',
        style_used: 'warm, measured, reassuring',
        updated_fidelity: 72,
      });

      const res = await request(app).post('/v1/preserve/speak').send({
        prompt: 'How am I taking care of my health right now?',
        patient_name: 'Anika',
        bundle: { patient: { preferred_name: 'Anika' } },
      });

      expect(res.status).toBe(200);
      expect(res.body.voice_used).toBe('Kore');
      expect(res.body.reply_text).toContain('steady daily walks');
      expect(res.body.audio_wav_base64).toContain('UklGR');
    });
  });
});

