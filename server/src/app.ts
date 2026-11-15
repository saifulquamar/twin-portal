import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type Request, type Response, type Express } from 'express';
import cors from 'cors';
import { PortalAuthAndVaultStore } from './auth-store.ts';
import { DefaultGeminiService, type GeminiService } from './gemini.ts';
import {
  buildOnboardingTwin,
  getGeneratedTwinById,
  getGeneratedTwinsList,
} from './twin-builder.ts';
import type {
  AskRequestBody,
  BriefingRequestBody,
  CreateTwinRequestBody,
  ExtractRequestBody,
  InterpretFeedRequestBody,
  PatientVaultPayload,
  SignInRequestBody,
  SignUpRequestBody,
  VoiceSynthesizeRequestBody,
} from './types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolvePortalDir(): string | null {
  const candidates = [
    path.resolve(process.cwd(), 'Mutanex_MyTwin', 'portal'),
    path.resolve(process.cwd(), '..', 'Mutanex_MyTwin', 'portal'),
    path.resolve(__dirname, '..', 'Mutanex_MyTwin', 'portal'),
    path.resolve(__dirname, '..', '..', 'Mutanex_MyTwin', 'portal'),
    path.resolve(__dirname, '..', '..', '..', 'Mutanex_MyTwin', 'portal'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }
  }
  return null;
}

function setSessionCookie(res: Response, token: string): void {
  res.setHeader(
    'Set-Cookie',
    `mx_session=${encodeURIComponent(token)}; Path=/; Max-Age=${60 * 60 * 24 * 14}; SameSite=Lax`
  );
}

function clearSessionCookie(res: Response): void {
  res.setHeader(
    'Set-Cookie',
    'mx_session=; Path=/; Max-Age=0; SameSite=Lax'
  );
}

export function createApp(
  geminiService: GeminiService = new DefaultGeminiService(),
  authStore: PortalAuthAndVaultStore = new PortalAuthAndVaultStore()
): Express {
  const app = express();
  const fallbackService = new DefaultGeminiService('');
  const portalDir = resolvePortalDir();

  app.use(
    cors({
      origin: (origin, callback) => {
        callback(null, origin || true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Large limit for multimodal base64 uploads (lab reports, portraits, voice recordings)
  app.use(express.json({ limit: '50mb' }));

  // Health check endpoints
  const healthHandler = (_req: Request, res: Response) => {
    res.status(200).json({ ok: true });
  };
  app.get('/v1/ask/health', healthHandler);
  app.get('/v1/health', healthHandler);
  app.get('/health', healthHandler);

  // === Authentication, Session Isolation & Role-Gated Admin Mode ===
  app.post('/v1/auth/signup', (req: Request<{}, {}, SignUpRequestBody>, res: Response) => {
    try {
      const session = authStore.signUp(req.body || ({} as SignUpRequestBody));
      setSessionCookie(res, session.token);
      res.status(201).json(session);
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'Could not create account.' });
    }
  });

  app.post('/v1/auth/signin', (req: Request<{}, {}, SignInRequestBody>, res: Response) => {
    try {
      const session = authStore.signIn(req.body || ({} as SignInRequestBody));
      setSessionCookie(res, session.token);
      res.status(200).json(session);
    } catch (err: any) {
      res.status(401).json({ error: err?.message || 'Invalid credentials.' });
    }
  });

  app.post(
    '/v1/auth/admin-demo',
    (req: Request<{}, {}, { patient_id?: string }>, res: Response) => {
      try {
        const session = authStore.signInAdminDemo(req.body?.patient_id);
        setSessionCookie(res, session.token);
        res.status(200).json(session);
      } catch (err: any) {
        res.status(500).json({ error: err?.message || 'Could not activate Admin mode.' });
      }
    }
  );

  app.post('/v1/auth/signout', (req: Request, res: Response) => {
    const token = authStore.extractTokenFromRequest(req);
    authStore.signOut(token);
    clearSessionCookie(res);
    res.status(200).json({ ok: true });
  });

  app.get('/v1/auth/me', (req: Request, res: Response) => {
    const token = authStore.extractTokenFromRequest(req);
    const resolved = authStore.getSessionUser(token);
    if (!resolved) {
      res.status(200).json({
        authenticated: false,
        user: null,
        active_patient_id: null,
      });
      return;
    }
    res.status(200).json({
      authenticated: true,
      user: resolved.user,
      active_patient_id: resolved.active_patient_id,
    });
  });

  app.post(
    '/v1/auth/bind-patient',
    (req: Request<{}, {}, { patient_id?: string }>, res: Response) => {
      const token = authStore.extractTokenFromRequest(req);
      const patientId = String(req.body?.patient_id || '').trim();
      if (!token || !patientId) {
        res.status(400).json({ error: "Missing session token or 'patient_id'." });
        return;
      }
      const updatedUser = authStore.bindMemberPatient(token, patientId);
      if (!updatedUser) {
        res.status(401).json({ error: 'Session expired or invalid.' });
        return;
      }
      res.status(200).json({ user: updatedUser });
    }
  );

  // === Encrypted Identity & Voice Preservation Vault (AES-256-GCM) ===
  app.get('/v1/preserve/vault/:patientId', (req: Request, res: Response) => {
    const patientId = String(req.params.patientId || '');
    const token = authStore.extractTokenFromRequest(req);
    if (!authStore.canAccessPatient(token, patientId)) {
      res.status(403).json({
        error: 'Access denied: your account is isolated to your own Digital Twin.',
      });
      return;
    }
    const vault = authStore.getPatientVault(patientId);
    res.status(200).json(vault);
  });

  app.put(
    '/v1/preserve/vault/:patientId',
    (req: Request<{ patientId: string }, {}, Partial<PatientVaultPayload>>, res: Response) => {
      const patientId = String(req.params.patientId || '');
      const token = authStore.extractTokenFromRequest(req);
      if (!authStore.canAccessPatient(token, patientId)) {
        res.status(403).json({
          error: 'Access denied: your account is isolated to your own Digital Twin.',
        });
        return;
      }
      const updated = authStore.updatePatientVault(patientId, req.body || {});
      res.status(200).json(updated);
    }
  );

  app.delete('/v1/preserve/vault/:patientId', (req: Request, res: Response) => {
    const patientId = String(req.params.patientId || '');
    const token = authStore.extractTokenFromRequest(req);
    if (!authStore.canAccessPatient(token, patientId)) {
      res.status(403).json({
        error: 'Access denied: your account is isolated to your own Digital Twin.',
      });
      return;
    }
    const rawScope = String(req.query.scope || 'all');
    const scope: 'voice' | 'appearance' | 'all' =
      rawScope === 'voice' || rawScope === 'appearance' ? rawScope : 'all';
    const purged = authStore.purgePatientVoiceAndIdentity(patientId, scope);
    res.status(200).json(purged);
  });

  // === Ask your twin / Clinical AI endpoint ===
  app.post('/v1/ask', async (req: Request<{}, {}, AskRequestBody>, res: Response) => {
    const {
      question,
      bundle,
      patient_id,
      mode,
      clinical,
      synthesize_audio,
      voice_profile,
      identity_memories,
      self_perspective,
    } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      res.status(400).json({ error: "Missing or invalid 'question' in request body" });
      return;
    }

    if (!bundle || typeof bundle !== 'object') {
      res.status(400).json({ error: "Missing or invalid 'bundle' in request body" });
      return;
    }

    try {
      const trimmedQuestion = question.trim();
      const askParams: AskRequestBody = {
        question: trimmedQuestion,
        bundle,
        patient_id: patient_id || 'patient',
        mode,
        clinical,
      };
      if (identity_memories !== undefined) {
        askParams.identity_memories = identity_memories;
      }
      if (self_perspective !== undefined) {
        askParams.self_perspective = self_perspective;
      }

      const askRes = await geminiService.ask(askParams);

      let audioPayload: { audio_wav_base64?: string | null; voice_used?: string } = {};
      if (synthesize_audio && askRes.answer) {
        const synthFn =
          geminiService.synthesizeSpeech?.bind(geminiService) ||
          fallbackService.synthesizeSpeech.bind(fallbackService);
        const spoken = await synthFn({
          text: askRes.answer,
          voice_profile,
          patient_sex: bundle?.patient?.sex,
        }).catch(() => null);
        if (spoken) {
          audioPayload = {
            audio_wav_base64: spoken.audio_wav_base64,
            voice_used: spoken.voice_used,
          };
        }
      }

      res.status(200).json({
        ...askRes,
        ...audioPayload,
      });
    } catch (err: any) {
      console.error('[Error in /v1/ask]', err);
      res.status(500).json({
        error: 'Failed to process question with Gemini AI',
        details: err?.message || String(err),
      });
    }
  });

  // === Extract lab report data endpoint ===
  app.post('/v1/extract', async (req: Request<{}, {}, ExtractRequestBody>, res: Response) => {
    const { file, mime_type } = req.body;

    if (!file || typeof file !== 'string') {
      res.status(400).json({ error: "Missing or invalid base64 'file' in request body" });
      return;
    }

    const validMimes = ['image/png', 'image/jpeg', 'application/pdf'];
    if (!mime_type || !validMimes.includes(mime_type)) {
      res.status(400).json({
        error: `Invalid 'mime_type'. Supported: ${validMimes.join(', ')}`,
      });
      return;
    }

    try {
      const response = await geminiService.extract({ file, mime_type });
      res.status(200).json(response);
    } catch (err: any) {
      console.error('[Error in /v1/extract]', err);
      res.status(500).json({
        error: 'Failed to extract lab data with Gemini AI',
        details: err?.message || String(err),
      });
    }
  });

  // === 8-Category Multimodal Feed Interpretation (Natural Language + Spoken + Image) ===
  app.post(
    '/v1/feed/interpret',
    async (req: Request<{}, {}, InterpretFeedRequestBody>, res: Response) => {
      const body = req.body || {};
      const hasText = typeof body.text === 'string' && body.text.trim().length > 0;
      const hasAudio = typeof body.audio_base64 === 'string' && body.audio_base64.length > 32;
      const hasImage = typeof body.image_base64 === 'string' && body.image_base64.length > 32;

      if (!hasText && !hasAudio && !hasImage) {
        res.status(400).json({
          error: 'Provide natural-language text, spoken audio, or an image to interpret.',
        });
        return;
      }

      try {
        const interpretFn =
          geminiService.interpretFeedInput?.bind(geminiService) ||
          fallbackService.interpretFeedInput.bind(fallbackService);
        const result = await interpretFn(body);
        res.status(200).json(result);
      } catch (err: any) {
        console.error('[Error in /v1/feed/interpret]', err);
        res.status(500).json({
          error: 'Failed to interpret Feed input',
          details: err?.message || String(err),
        });
      }
    }
  );

  // === Generate patient & clinician briefing after adding extracted lab results ===
  app.post('/v1/briefing', async (req: Request<{}, {}, BriefingRequestBody>, res: Response) => {
    const { bundle, new_results } = req.body;

    if (!bundle || typeof bundle !== 'object' || Array.isArray(bundle)) {
      res.status(400).json({ error: "Missing or invalid 'bundle' in request body" });
      return;
    }

    if (!Array.isArray(new_results) || new_results.length === 0) {
      res.status(400).json({ error: "Missing or empty 'new_results' array in request body" });
      return;
    }

    try {
      const response = geminiService.briefing
        ? await geminiService.briefing({ bundle, new_results })
        : fallbackService.generateLocalBriefing({ bundle, new_results });

      res.status(200).json(response);
    } catch (err: any) {
      console.error('[Error in /v1/briefing]', err);
      res.status(500).json({
        error: 'Failed to generate briefing with Gemini AI',
        details: err?.message || String(err),
      });
    }
  });

  // === Matched-Voice TTS Synthesis (speaks any text output in the user's matched voice) ===
  app.post(
    '/v1/voice/synthesize',
    async (req: Request<{}, {}, VoiceSynthesizeRequestBody>, res: Response) => {
      const { text, voice_profile, patient_sex } = req.body || {};
      if (!text || typeof text !== 'string' || !text.trim()) {
        res.status(400).json({ error: "Missing or invalid 'text' in request body" });
        return;
      }
      try {
        const synthFn =
          geminiService.synthesizeSpeech?.bind(geminiService) ||
          fallbackService.synthesizeSpeech.bind(fallbackService);
        const result = await synthFn({ text: text.trim(), voice_profile, patient_sex });
        res.status(200).json(result);
      } catch (err: any) {
        console.error('[Error in /v1/voice/synthesize]', err);
        res.status(500).json({
          error: 'Matched-voice synthesis failed',
          details: err?.message || String(err),
        });
      }
    }
  );

  // === Create a new Digital Twin (Snapshot or Full Membership) ===
  app.post(
    '/v1/onboarding/create-twin',
    async (req: Request<{}, {}, CreateTwinRequestBody>, res: Response) => {
      const body = req.body;
      if (!body || !body.details || !body.details.name?.trim()) {
        res.status(400).json({ error: "Missing 'details.name' in onboarding payload" });
        return;
      }

      try {
        const created = buildOnboardingTwin(body, portalDir);
        res.status(201).json(created);
      } catch (err: any) {
        console.error('[Error in /v1/onboarding/create-twin]', err);
        res.status(500).json({
          error: 'Failed to synthesize Digital Twin',
          details: err?.message || String(err),
        });
      }
    }
  );

  // === Preserve Yourself: Train AI Voice Persona from voice recording / speech ===
  app.post('/v1/preserve/voice-train', async (req: Request, res: Response) => {
    try {
      const result = geminiService.trainVoicePersona
        ? await geminiService.trainVoicePersona(req.body || {})
        : await fallbackService.trainVoicePersona(req.body || {});
      res.status(200).json(result);
    } catch (err: any) {
      console.error('[Error in /v1/preserve/voice-train]', err);
      res.status(500).json({
        error: 'Voice training failed',
        details: err?.message || String(err),
      });
    }
  });

  // === Preserve Yourself: Analyze uploaded portrait photo for 3D Avatar Likeness ===
  app.post('/v1/preserve/face-analyze', async (req: Request, res: Response) => {
    const { image_base64, mime_type, photo_count, angle } = req.body || {};
    if (!image_base64 || typeof image_base64 !== 'string') {
      res.status(400).json({ error: "Missing 'image_base64' in request body" });
      return;
    }
    try {
      const payload = {
        image_base64,
        mime_type: mime_type || 'image/jpeg',
        photo_count,
        angle,
      };
      const result = geminiService.analyzeFaceLikeness
        ? await geminiService.analyzeFaceLikeness(payload)
        : await fallbackService.analyzeFaceLikeness(payload);
      res.status(200).json(result);
    } catch (err: any) {
      console.error('[Error in /v1/preserve/face-analyze]', err);
      res.status(500).json({
        error: 'Face analysis failed',
        details: err?.message || String(err),
      });
    }
  });

  // === Preserve Yourself: Speak with Preserved Digital Self ===
  app.post('/v1/preserve/speak', async (req: Request, res: Response) => {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: "Missing 'prompt' in request body" });
      return;
    }
    try {
      const result = geminiService.speakPreservedTwin
        ? await geminiService.speakPreservedTwin(req.body)
        : await fallbackService.speakPreservedTwin(req.body);
      res.status(200).json(result);
    } catch (err: any) {
      console.error('[Error in /v1/preserve/speak]', err);
      res.status(500).json({
        error: 'Preserved twin speech failed',
        details: err?.message || String(err),
      });
    }
  });

  // Dynamic patient-data routes: merge newly onboarded twins seamlessly with existing static twins
  if (portalDir) {
    app.get('/patient-data/index.json', (_req: Request, res: Response) => {
      try {
        const staticIndexPath = path.join(portalDir, 'patient-data', 'index.json');
        const staticList = fs.existsSync(staticIndexPath)
          ? JSON.parse(fs.readFileSync(staticIndexPath, 'utf8'))
          : [];
        const dynamicList = getGeneratedTwinsList();
        res.status(200).json([...dynamicList, ...staticList]);
      } catch {
        res.status(200).json(getGeneratedTwinsList());
      }
    });

    app.get('/patient-data/doctor/:id.json', (req: Request, res: Response, next) => {
      const generated = getGeneratedTwinById(String(req.params.id));
      if (generated) {
        res.status(200).json(generated.doctorBundle);
        return;
      }
      next();
    });

    app.get('/patient-data/:id.json', (req: Request, res: Response, next) => {
      const generated = getGeneratedTwinById(String(req.params.id));
      if (generated) {
        res.status(200).json(generated.bundle);
        return;
      }
      next();
    });

    app.get('/favicon.ico', (_req: Request, res: Response, next) => {
      const faviconCandidates = [
        path.resolve(process.cwd(), 'public', 'favicon.ico'),
        path.resolve(process.cwd(), 'favicon.ico'),
        path.resolve(__dirname, '..', '..', 'public', 'favicon.ico'),
        path.resolve(__dirname, '..', '..', 'favicon.ico'),
        path.join(portalDir, 'favicon.ico'),
      ];
      for (const candidate of faviconCandidates) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          res.sendFile(candidate);
          return;
        }
      }
      next();
    });

    app.use(
      express.static(portalDir, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.webmanifest')) {
            res.setHeader('Content-Type', 'application/manifest+json');
          }
        },
      })
    );

    app.use((req: Request, res: Response, next) => {
      if (
        (req.method !== 'GET' && req.method !== 'HEAD') ||
        req.path.startsWith('/v1/') ||
        path.extname(req.path)
      ) {
        next();
        return;
      }
      res.sendFile(path.join(portalDir, 'index.html'));
    });
  }

  return app;
}
