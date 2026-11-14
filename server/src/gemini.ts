import { GoogleGenAI, Type } from '@google/genai';
import type { AskRequestBody, AskResponse, ExtractRequestBody, ExtractResponse } from './types.js';

export interface GeminiService {
  ask(params: AskRequestBody): Promise<AskResponse>;
  extract(params: ExtractRequestBody): Promise<ExtractResponse>;
}

export class DefaultGeminiService implements GeminiService {
  private ai: GoogleGenAI;
  private model: string;

  constructor(apiKey = process.env.GEMINI_API_KEY || '', model = process.env.GEMINI_MODEL || 'gemini-2.0-flash') {
    this.ai = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  async ask(params: AskRequestBody): Promise<AskResponse> {
    const isCdss = params.mode === 'cdss';

    const systemInstruction = `You are the Mutanex Digital Twin AI clinical assistant.
Rules for your answer:
- Use ONLY facts in the patient bundle (and clinical results, when given). Quote exact values with their dates and units.
- If the record does not contain the answer, say so plainly. Never guess, diagnose or prescribe.
- mode "cdss": answer for a physician, concise, structured (findings, considerations, suggested next tests), and end with "For physician review."
- Otherwise answer the patient in plain language, at most 120 words, and suggest what to ask the doctor.
- Urgent values (for example potassium above 6, eGFR below 15) must be called out first.
- In the sources array, return the specific record items or finding ids you used (finding ids match bundle.insights[].id).`;

    const userPrompt = `Patient ID: ${params.patient_id || 'unknown'}
Mode: ${params.mode || 'patient'}
Question: ${params.question}

PATIENT BUNDLE:
${JSON.stringify(params.bundle, null, 2)}

${params.clinical ? `CLINICAL RESULTS:\n${JSON.stringify(params.clinical, null, 2)}` : ''}`;

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: [userPrompt],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            sources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  kind: { type: Type.STRING, enum: ['record', 'finding', 'kg'] },
                  title: { type: Type.STRING },
                  detail: { type: Type.STRING },
                  finding_id: { type: Type.STRING },
                },
                required: ['kind', 'title'],
              },
            },
          },
          required: ['answer', 'sources'],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return {
      answer: parsed.answer || "That isn't in your record yet, so I won't guess.",
      sources: Array.isArray(parsed.sources) ? parsed.sources : [],
    };
  }

  async extract(params: ExtractRequestBody): Promise<ExtractResponse> {
    const systemInstruction = `You are a medical document analyzer. Extract all laboratory test results printed on this report.
Rules:
- Return only values printed on the report; never fill gaps, extrapolate, or guess.
- Extract the report date and laboratory name if present.
- Extract individual test results with numeric values, units, reference ranges, and abnormal flags ("high" or "low").`;

    // Strip data URL prefix if present in the base64 string
    const cleanBase64 = params.file.replace(/^data:[^;]+;base64,/, '');

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: params.mime_type,
          },
        },
        'Extract all lab test results printed on this report. Return only values printed on the report; never fill gaps.',
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            report_date: { type: Type.STRING, nullable: true },
            lab: { type: Type.STRING, nullable: true },
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  range: { type: Type.STRING, nullable: true },
                  flag: { type: Type.STRING, enum: ['high', 'low'], nullable: true },
                  date: { type: Type.STRING, nullable: true },
                },
                required: ['name', 'value', 'unit'],
              },
            },
          },
          required: ['report_date', 'lab', 'results'],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return {
      report_date: parsed.report_date ?? null,
      lab: parsed.lab ?? null,
      results: Array.isArray(parsed.results) ? parsed.results : [],
    };
  }
}
