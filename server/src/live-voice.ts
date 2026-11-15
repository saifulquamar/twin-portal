import type { Server as HttpServer } from 'node:http';
import { Modality, type LiveServerMessage } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import {
  buildKnowledgeGraphSummary,
  selectClosestPrebuiltVoiceByPitch,
  type GeminiService,
} from './gemini.ts';
import type { IdentityMemoryItem, VoicePersonaProfile } from './types.ts';

interface LiveInitPayload {
  type: 'init';
  patient_id?: string;
  patient_name?: string;
  patientName?: string;
  patient_sex?: string;
  bundle?: any;
  voice_profile?: Partial<VoicePersonaProfile> | null;
  voiceProfile?: Partial<VoicePersonaProfile> | null;
  identity_memories?: IdentityMemoryItem[];
  memories?: Array<string | IdentityMemoryItem>;
}

export function attachLiveVoiceWebSocket(
  httpServer: HttpServer,
  geminiService: GeminiService
): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    const urlPath = (request.url || '').split('?')[0];
    if (urlPath === '/v1/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (clientWs: WebSocket) => {
    let liveSessionPromise: Promise<any> | null = null;
    let closed = false;

    const safeSend = (payload: Record<string, unknown>) => {
      if (!closed && clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify(payload));
      }
    };

    const startGeminiLiveSession = (initMsg: LiveInitPayload) => {
      const liveAi = geminiService.getLiveClient?.() ?? null;
      if (!liveAi) {
        safeSend({
          type: 'error',
          message:
            'Real-time Gemini Live voice streaming requires GEMINI_API_KEY; using matched-voice turn mode.',
        });
        return;
      }

      const vp = initMsg.voice_profile ?? initMsg.voiceProfile ?? null;
      const validVoices = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'] as const;
      const defaultVoice =
        (initMsg.patient_sex || initMsg.bundle?.patient?.sex || '').toLowerCase() === 'male'
          ? 'Charon'
          : 'Kore';
      const chosenVoice =
        vp?.prebuilt_voice && validVoices.includes(vp.prebuilt_voice)
          ? vp.prebuilt_voice
          : selectClosestPrebuiltVoiceByPitch(vp?.pitch_hz, defaultVoice);

      const patientName =
        initMsg.patient_name ||
        initMsg.patientName ||
        initMsg.bundle?.patient?.preferred_name ||
        'Member';
      const accentPart = vp?.accent ? `, ${vp.accent.replace('_', ' ')} inflection` : '';
      const pacePart = vp?.speaking_pace ? `, ${vp.speaking_pace} cadence` : '';
      const vocalStyle =
        vp?.vocal_style ||
        `warm, calm, natural first-person conversational cadence${accentPart}${pacePart}`;

      const normalizedMemories: IdentityMemoryItem[] =
        initMsg.identity_memories && initMsg.identity_memories.length > 0
          ? initMsg.identity_memories
          : Array.isArray(initMsg.memories)
            ? initMsg.memories.map((m, idx) =>
                typeof m === 'string'
                  ? {
                      id: `mem-${idx}`,
                      category: 'story',
                      text: m,
                      created_at: new Date().toISOString(),
                      source: 'user_written',
                    }
                  : m
              )
            : [];

      const kgContext = initMsg.bundle
        ? buildKnowledgeGraphSummary(initMsg.bundle, undefined, normalizedMemories).slice(0, 9000)
        : `Patient: ${patientName}`;

      const systemInstruction = `You are ${patientName}'s Living Digital Twin speaking in real-time voice with ${patientName} in the first person ("I").
Voice & Persona Style: ${vocalStyle}.
Core Grounding Rules:
- Speak naturally, warmly, and concisely (2 to 4 spoken sentences per turn) as ${patientName}'s own Digital Twin reflecting on my health, sleep, medicines, symptoms, memories, and daily life.
- Ground every medical or personal statement strictly in the Digital Twin record below. Quote exact lab values, dates, and recent Feed Your Twin updates when asked questions like "How am I doing?", "What has changed in my health?", "How have I been sleeping?", or "What do you remember about me?".
- Never invent lab results, diagnoses, or memories. Remind ${patientName} that newly added clinical items are checked by their care team first.

DIGITAL TWIN RECORD & MEMORY VAULT:
${kgContext}`;

      liveSessionPromise = liveAi.live
        .connect({
          model: 'gemini-3.8-live',
          config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: chosenVoice },
              },
            },
            systemInstruction,
          },
          callbacks: {
            onopen: () => {
              safeSend({
                type: 'ready',
                voice_used: chosenVoice,
                pitch_hz: vp?.pitch_hz || null,
              });
            },
            onmessage: (message: LiveServerMessage) => {
              const content: any = message.serverContent;
              if (content?.inputTranscription?.text) {
                safeSend({
                  type: 'input_transcript',
                  text: content.inputTranscription.text,
                });
              }
              if (content?.outputTranscription?.text) {
                safeSend({
                  type: 'output_transcript',
                  text: content.outputTranscription.text,
                });
              }
              for (const part of content?.modelTurn?.parts ?? []) {
                if (part.inlineData?.data) {
                  safeSend({
                    type: 'audio',
                    audio: part.inlineData.data,
                  });
                }
              }
              if (content?.interrupted) {
                safeSend({ type: 'interrupted' });
              }
              if (content?.turnComplete) {
                safeSend({ type: 'turn_complete' });
              }
            },
            onerror: (err: any) => {
              safeSend({
                type: 'error',
                message: err?.message || 'Live voice stream encountered an error.',
              });
            },
            onclose: () => {
              safeSend({ type: 'closed' });
            },
          },
        })
        .catch((err: any) => {
          safeSend({
            type: 'error',
            message: err?.message || 'Could not open Gemini Live voice session.',
          });
          return null;
        });
    };

    clientWs.on('message', (rawData) => {
      try {
        const msg = JSON.parse(rawData.toString());
        if (msg.type === 'init') {
          startGeminiLiveSession(msg as LiveInitPayload);
          return;
        }
        if (msg.type === 'audio' && typeof msg.audio === 'string' && liveSessionPromise) {
          void liveSessionPromise.then((session) => {
            if (session && !closed) {
              session.sendRealtimeInput({
                audio: {
                  data: msg.audio,
                  mimeType: 'audio/pcm;rate=16000',
                },
              });
            }
          });
          return;
        }
        if (msg.type === 'text' && typeof msg.text === 'string' && liveSessionPromise) {
          void liveSessionPromise.then((session) => {
            if (session && !closed) {
              session.sendRealtimeInput({
                text: msg.text,
              });
            }
          });
        }
      } catch {
        // ignore malformed frame
      }
    });

    clientWs.on('close', () => {
      closed = true;
      if (liveSessionPromise) {
        void liveSessionPromise.then((session) => {
          try {
            session?.close?.();
          } catch {
            // ignore
          }
        });
      }
    });
  });

  return wss;
}
