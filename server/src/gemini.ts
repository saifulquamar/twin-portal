import { GoogleGenAI, Type } from '@google/genai';
import type { AskRequestBody, AskResponse, ExtractRequestBody, ExtractResponse, SourceItem } from './types.js';

export interface GeminiService {
  ask(params: AskRequestBody): Promise<AskResponse>;
  extract(params: ExtractRequestBody): Promise<ExtractResponse>;
}

export class DefaultGeminiService implements GeminiService {
  private ai: GoogleGenAI | null;
  private model: string;

  constructor(apiKey = process.env.GEMINI_API_KEY || '', model = process.env.GEMINI_MODEL || 'gemini-4-hydrogen') {
    const trimmedKey = apiKey.trim();
    this.ai = trimmedKey ? new GoogleGenAI({ apiKey: trimmedKey }) : null;
    this.model = model;
  }

  private generateLocalKgAnswer(params: AskRequestBody): AskResponse {
    const qLower = params.question.toLowerCase();
    const words = qLower.split(/\s+/).filter((w) => w.length > 3);
    const bundle = params.bundle || {};
    const patient = bundle.patient || {};
    const name = patient.preferred_name || 'the patient';
    const insights: any[] = Array.isArray(bundle.insights) ? bundle.insights : [];
    const labs: Record<string, any[]> = bundle.labs && typeof bundle.labs === 'object' ? bundle.labs : {};

    const matchedInsights = insights.filter((ins) => {
      const title = String(ins?.title || '').toLowerCase();
      const found = String(ins?.found || '').toLowerCase();
      const id = String(ins?.id || '').toLowerCase();
      return words.some((w) => title.includes(w) || found.includes(w) || id.includes(w));
    });

    const matchedLabs: Array<[string, any]> = [];
    for (const [labName, values] of Object.entries(labs)) {
      if (
        Array.isArray(values) &&
        values.length > 0 &&
        (qLower.includes(labName.toLowerCase()) || words.some((w) => labName.toLowerCase().includes(w)))
      ) {
        matchedLabs.push([labName, values[values.length - 1]]);
      }
    }

    const answerParts: string[] = [];
    const sources: SourceItem[] = [];

    if (matchedInsights.length > 0) {
      const top = matchedInsights[0];
      answerParts.push(`Based on ${name}'s verified Knowledge Graph: ${top.found || top.title}`);
      if (top.why) answerParts.push(`\n${top.why}`);
      if (top.do) answerParts.push(`\nRecommended action: ${top.do}`);

      for (const ins of matchedInsights.slice(0, 3)) {
        sources.push({
          kind: 'finding',
          title: String(ins.title || '').slice(0, 45),
          detail: String(ins.found || '').slice(0, 100),
          finding_id: ins.id,
        });
      }
    } else if (matchedLabs.length > 0) {
      const labStrs = matchedLabs.map(
        ([labName, val]) => `${labName}: ${val?.value} ${val?.unit || ''} (${val?.date || 'unknown date'})`
      );
      answerParts.push(`According to ${name}'s latest test records: ${labStrs.join('; ')}.`);
      for (const [labName, val] of matchedLabs) {
        sources.push({
          kind: 'record',
          title: `${labName} Result`,
          detail: `${val?.value} ${val?.unit || ''} on ${val?.date || 'unknown date'}`,
        });
      }
    } else {
      const meds = Array.isArray(patient.medicines) && patient.medicines.length > 0
        ? patient.medicines.join(', ')
        : 'None recorded';
      const conds = Array.isArray(patient.conditions) && patient.conditions.length > 0
        ? patient.conditions.join(', ')
        : 'None recorded';
      answerParts.push(
        `Here is what is currently mapped in ${name}'s Digital Twin Knowledge Graph:\n` +
          `• Conditions: ${conds}\n` +
          `• Current Medications: ${meds}\n` +
          `Your twin evaluates interactions, lab trends, and organ status. Ask about a specific lab, medicine, or insight in your record for details.`
      );
      sources.push({
        kind: 'record',
        title: `${name}'s Medical Profile`,
        detail: 'Active conditions and medications verified in twin',
      });
    }

    if (params.mode === 'cdss') {
      answerParts.push('\n\nFor physician review.');
    }

    return {
      answer: answerParts.join(''),
      sources,
    };
  }

  async ask(params: AskRequestBody): Promise<AskResponse> {
    if (!this.ai) {
      return this.generateLocalKgAnswer(params);
    }

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
    if (!this.ai) {
      throw new Error('GEMINI_API_KEY is not configured for multimodal lab report extraction');
    }

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
