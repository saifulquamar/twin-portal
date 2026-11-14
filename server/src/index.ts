import { createApp } from './app.js';

const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || '0.0.0.0';

const app = createApp();

app.listen(port, host, () => {
  console.log('====================================================');
  console.log(` Mutanex My Twin AI Service (Express + @google/genai)`);
  console.log(` Listening: http://${host}:${port}`);
  console.log(` Gemini Key: ${process.env.GEMINI_API_KEY ? 'Configured' : 'NOT SET (using local KG fallback)'}`);
  console.log(` Model: ${process.env.GEMINI_MODEL || 'gemini-4-hydrogen'}`);
  console.log('====================================================');
});
