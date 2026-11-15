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
  patient_sex?: string;
  bundle?: any;
  voice_profile?: Partial<VoicePersonaProfile> | null;
  identity_memories?: IdentityMemoryItem[];
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

      const validVoices = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'] as const;
      const defaultVoice =
        initMsg.patient_sex?.toLowerCase() === 'male' ? 'Charon' : 'Kore';
      const chosenVoice =
        initMsg.voice_profile?.prebuilt_voice &&
        validVoices.includes(initMsg.voice_profile.prebuilt_voice)
          ? initMsg.voice_profile.prebuilt_voice
          : selectClosestPrebuiltVoiceByPitch(
              initMsg.voice_profile?.pitch_hz,
              defaultVoice
            );

      const patientName =
        initMsg.patient_name ||
        initMsg.bundle?.patient?.preferred_name ||
        'Member';
      const vocalStyle =
        initMsg.voice_profile?.vocal_style ||
        'warm, calm, natural conversational cadence';
      const kgContext = initMsg.bundle
        ? buildKnowledgeGraphSummary(
            initMsg.bundle,
            undefined,
            initMsg.identity_memories
          ).slice(0, 9000)
        : `Patient: ${patientName}`;

      const systemInstruction = `You are ${patientName}'s Living Digital Twin speaking in real-time voice with ${patientName}.
Voice & Persona Style: ${vocalStyle}.
Core Grounding Rules:
- Speak naturally, warmly, and concisely (2 to 4 spoken sentences per turn) as ${patientName}'s own Digital Twin reflecting on our shared health, sleep, medicines, symptoms, memories, and daily life.
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
                pitch_hz: initMsg.voice_profile?.pitch_hz || null,
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
