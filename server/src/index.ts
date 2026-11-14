import fs from 'node:fs';
import path from 'node:path';
import { createApp } from './app.ts';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq > 0) {
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
      if (key && process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  }
}

const parsedPort = Number.parseInt(process.env.PORT || '3000', 10);
const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 3000;
const host = '0.0.0.0';

const app = createApp();

const server = app.listen(port, host, () => {
  console.log('====================================================');
  console.log(` Mutanex My Twin AI Service (Express + @google/genai)`);
  console.log(` Listening: http://${host}:${port}`);
  console.log(` Gemini Key: ${process.env.GEMINI_API_KEY ? 'Configured' : 'NOT SET (using local KG fallback)'}`);
  console.log(` Model: gemini-4-hydrogen`);
  console.log('====================================================');
});

server.on('error', (err) => {
  console.error('[Fatal server listen error]', err);
  process.exit(1);
});
