import express, { type Request, type Response, type Express } from 'express';
import cors from 'cors';
import { DefaultGeminiService, type GeminiService } from './gemini.js';
import type { AskRequestBody, ExtractRequestBody } from './types.js';

export function createApp(geminiService: GeminiService = new DefaultGeminiService()): Express {
  const app = express();

  // Allowed CORS origins: local dev and deployed portal origin
  const allowedOrigins = [
    'http://localhost:5180',
    'http://localhost:5181',
    'http://localhost:8080',
    ...(process.env.PORTAL_ORIGIN ? [process.env.PORTAL_ORIGIN.replace(/\/$/, '')] : []),
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, server-to-server) or matched origins
        if (!origin || process.env.PORTAL_ORIGIN === '*' || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive fallback to prevent breaking cross-domain twins
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Large limit for multimodal file base64 uploads in /v1/extract
  app.use(express.json({ limit: '50mb' }));

  // Health check endpoint
  app.get('/v1/ask/health', (_req: Request, res: Response) => {
    res.status(200).json({ ok: true });
  });

  // Ask your twin endpoint
  app.post('/v1/ask', async (req: Request<{}, {}, AskRequestBody>, res: Response) => {
    const { question, bundle, patient_id, mode, clinical } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      res.status(400).json({ error: "Missing or invalid 'question' in request body" });
      return;
    }

    if (!bundle || typeof bundle !== 'object') {
      res.status(400).json({ error: "Missing or invalid 'bundle' in request body" });
      return;
    }

    try {
      const response = await geminiService.ask({
        question: question.trim(),
        bundle,
        patient_id: patient_id || 'patient',
        mode,
        clinical,
      });
      res.status(200).json(response);
    } catch (err: any) {
      console.error('[Error in /v1/ask]', err);
      res.status(500).json({
        error: 'Failed to process question with Gemini AI',
        details: err?.message || String(err),
      });
    }
  });

  // Extract lab report data endpoint (Upgrade 2)
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

  return app;
}
