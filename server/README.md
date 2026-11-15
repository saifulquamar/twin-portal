# Mutanex My Twin — AI Service

Node 20 + TypeScript + Express server that powers the **Ask your twin** and **Extract lab report** features of the Mutanex My Twin Portal. Uses the Google Gemini API (`@google/genai` SDK) for structured clinical answers and multimodal document extraction.

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | **Yes** | — | Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-4-hydrogen` | Gemini model to use |
| `PORT` | No | `3000` | HTTP listen port |
| `HOST` | No | `0.0.0.0` | HTTP listen host |
| `PORTAL_ORIGIN` | No | — | Deployed portal URL for CORS (e.g. `https://twin.example.com`). Set to `*` to allow all origins. |

## npm Scripts

```bash
npm run dev      # Start dev server with hot-reload (tsx watch)
npm run build    # Compile TypeScript → dist/
npm start        # Run production build (node dist/index.js)
npm test         # Run Vitest unit tests
```

## Local Development

```bash
cd server
npm install
export GEMINI_API_KEY="your-key-here"   # PowerShell: $env:GEMINI_API_KEY="your-key-here"
npm run dev
```

The server starts on `http://localhost:8080`. The portal at `http://localhost:5180` will auto-connect via `/v1/ask/health`.

## API Contract

### `GET /v1/ask/health`

Health check. Returns `200 { "ok": true }`.

### `POST /v1/ask`

Ask the digital twin a question using the patient's Knowledge Graph (bundle).

**Request:**
```json
{
  "patient_id": "MX-SYN-T01",
  "question": "How is my thyroid doing?",
  "bundle": { "patient": {}, "labs": {}, "insights": [], ... },
  "mode": "cdss",
  "clinical": { ... }
}
```

- `mode` (optional): `"cdss"` for physician-facing clinical decision support; omit for patient-facing plain language answers.
- `clinical` (optional): Additional clinical results document for CDSS mode.

**Response:**
```json
{
  "answer": "Your TSH was 2.71 uIU/mL on 2026-10-07 ...",
  "sources": [
    { "kind": "record", "title": "TSH 2.71 uIU/mL", "detail": "2026-10-07" },
    { "kind": "finding", "title": "Levothyroxine absorption", "finding_id": "absorption" },
    { "kind": "kg", "title": "Clinical Practice Guidelines" }
  ]
}
```

### `POST /v1/extract`

Extract lab results from a scanned/photographed report using Gemini multimodal.

**Request:**
```json
{
  "file": "<base64-encoded-image-or-pdf>",
  "mime_type": "image/png"
}
```

Supported MIME types: `image/png`, `image/jpeg`, `application/pdf`.

**Response:**
```json
{
  "report_date": "2026-10-15",
  "lab": "Metropolis Reference Lab",
  "results": [
    { "name": "Potassium", "value": 4.8, "unit": "mmol/L", "range": "3.5 - 5.1", "flag": null, "date": "2026-10-15" },
    { "name": "TSH", "value": 5.4, "unit": "uIU/mL", "range": "0.4 - 4.2", "flag": "high", "date": "2026-10-15" }
  ]
}
```

## Docker

```bash
cd server
docker build -t mytwin-server .
docker run -p 8080:8080 -e GEMINI_API_KEY="your-key" mytwin-server
```

## Deploy to Google Cloud Run

### Option A: gcloud CLI

```bash
cd server
gcloud run deploy mytwin-server \
  --source . \
  --region us-central1 \
  --set-env-vars GEMINI_API_KEY="your-key",PORTAL_ORIGIN="https://your-portal.example.com" \
  --allow-unauthenticated
```

### Option B: GitHub + Cloud Console

1. Push this repo to GitHub (already at `https://github.com/saifulquamar/twin-portal`).
2. Go to [Cloud Run Console](https://console.cloud.google.com/run) → **Create Service**.
3. Select **Continuously deploy from a repository** → Connect your GitHub repo.
4. Set Build Type to **Dockerfile**, path to `server/Dockerfile`.
5. Under **Variables & Secrets**, add `GEMINI_API_KEY` and `PORTAL_ORIGIN`.
6. Click **Create**.

Cloud Run will build from the Dockerfile and deploy automatically on every push.

## Architecture

```
POST /v1/ask  ──┐
                ├──▶  Express (app.ts)  ──▶  GeminiService (gemini.ts)  ──▶  Google Gemini API
POST /v1/extract┘                             ↑ structured output (response schema)
                                              ↑ system instruction with clinical rules
```

- **types.ts** — TypeScript interfaces for all request/response shapes
- **gemini.ts** — `GeminiService` interface + `DefaultGeminiService` using `@google/genai`
- **app.ts** — Express app factory with CORS, routes, and input validation
- **index.ts** — Entry point; reads env vars and starts the server
