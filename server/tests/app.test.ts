import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import type { GeminiService } from '../src/gemini.js';
import type { AskResponse, ExtractResponse } from '../src/types.js';

describe('Mutanex My Twin Server API', () => {
  const mockGeminiService: GeminiService = {
    ask: vi.fn(),
    extract: vi.fn(),
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

    it('returns structured answer and sources in patient mode', async () => {
      const expectedResponse: AskResponse = {
        answer: 'Your TSH was measured at 2.71 uIU/mL on 2026-10-07, which is within the normal reference range. You are currently taking levothyroxine 50 mcg daily. Ask your doctor about repeating the test in 3 months.',
        sources: [
          { kind: 'record', title: 'TSH 2.71 uIU/mL (2026-10-07)', detail: 'Latest blood test result' },
          { kind: 'finding', title: 'Levothyroxine absorption', finding_id: 'absorption' },
          { kind: 'kg', title: 'Clinical Practice Guidelines', detail: 'Thyroid management guidelines' },
        ],
      };

      vi.mocked(mockGeminiService.ask).mockResolvedValueOnce(expectedResponse);

      const payload = {
        patient_id: 'MX-SYN-T01',
        question: 'How is my thyroid doing?',
        bundle: {
          patient: { preferred_name: 'Maya' },
          labs: { TSH: [{ value: 2.71, unit: 'uIU/mL', date: '2026-10-07' }] },
          insights: [{ id: 'absorption', title: 'Levothyroxine absorption' }],
        },
      };

      const res = await request(app)
        .post('/v1/ask')
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(expectedResponse);
      expect(mockGeminiService.ask).toHaveBeenCalledWith({
        question: 'How is my thyroid doing?',
        bundle: payload.bundle,
        patient_id: 'MX-SYN-T01',
        mode: undefined,
        clinical: undefined,
      });
    });

    it('supports CDSS mode for physicians with clinical document', async () => {
      const cdssResponse: AskResponse = {
        answer: 'Findings: Patient has primary hypothyroidism on levothyroxine 50 mcg. TSH normalized at 2.71 uIU/mL. Considerations: Iron bisglycinate co-administration may impair absorption. Next tests: Re-evaluate TSH and Free T4 in 90 days. For physician review.',
        sources: [
          { kind: 'record', title: 'TSH: 2.71 uIU/mL', detail: '2026-10-07' },
          { kind: 'finding', title: 'Drug interaction: Iron & Levothyroxine', finding_id: 'absorption' },
        ],
      };

      vi.mocked(mockGeminiService.ask).mockResolvedValueOnce(cdssResponse);

      const payload = {
        patient_id: 'MX-SYN-T01',
        question: 'Summarize treatment options and interactions',
        bundle: { patient: { preferred_name: 'Maya' }, insights: [] },
        mode: 'cdss',
        clinical: { sections: [{ title: 'Treatment evidence', blocks: [] }] },
      };

      const res = await request(app)
        .post('/v1/ask')
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.answer).toContain('For physician review.');
      expect(mockGeminiService.ask).toHaveBeenCalledWith({
        question: payload.question,
        bundle: payload.bundle,
        patient_id: 'MX-SYN-T01',
        mode: 'cdss',
        clinical: payload.clinical,
      });
    });
  });

  describe('POST /v1/extract', () => {
    it('returns 400 when file is missing', async () => {
      const res = await request(app)
        .post('/v1/extract')
        .send({ mime_type: 'image/png' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('file');
    });

    it('returns 400 when mime_type is unsupported', async () => {
      const res = await request(app)
        .post('/v1/extract')
        .send({ file: 'base64string...', mime_type: 'application/json' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid \'mime_type\'');
    });

    it('extracts printed lab results from multimodal input', async () => {
      const extractResponse: ExtractResponse = {
        report_date: '2026-10-15',
        lab: 'Metropolis Reference Lab',
        results: [
          {
            name: 'Potassium',
            value: 4.8,
            unit: 'mmol/L',
            range: '3.5 - 5.1',
            flag: null,
            date: '2026-10-15',
          },
          {
            name: 'eGFR',
            value: 88,
            unit: 'mL/min/1.73m2',
            range: '> 60',
            flag: null,
            date: '2026-10-15',
          },
          {
            name: 'TSH',
            value: 5.4,
            unit: 'uIU/mL',
            range: '0.4 - 4.2',
            flag: 'high',
            date: '2026-10-15',
          },
        ],
      };

      vi.mocked(mockGeminiService.extract).mockResolvedValueOnce(extractResponse);

      const res = await request(app)
        .post('/v1/extract')
        .send({
          file: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAA=',
          mime_type: 'image/png',
        });

      expect(res.status).toBe(200);
      expect(res.body.report_date).toBe('2026-10-15');
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[2].flag).toBe('high');
      expect(mockGeminiService.extract).toHaveBeenCalledWith({
        file: expect.any(String),
        mime_type: 'image/png',
      });
    });
  });
});
