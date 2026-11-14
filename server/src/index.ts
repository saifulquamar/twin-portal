import { createApp } from './app.js';

const port = parseInt(process.env.PORT || '8080', 10);
const host = process.env.HOST || '0.0.0.0';

const app = createApp();

app.listen(port, host, () => {
  console.log('====================================================');
  console.log(` Mutanex My Twin AI Service (Express + @google/genai)`);
  console.log(` Port: ${port}`);
  console.log(` Gemini Key: ${process.env.GEMINI_API_KEY ? 'Configured' : 'NOT SET (set GEMINI_API_KEY)'}`);
  console.log(` Model: ${process.env.GEMINI_MODEL || 'gemini-2.0-flash'}`);
  console.log(` Portal Origin: ${process.env.PORTAL_ORIGIN || 'http://localhost:5180'}`);
  console.log('====================================================');
});
