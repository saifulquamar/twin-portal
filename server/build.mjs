import * as esbuild from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

await esbuild.build({
  entryPoints: [path.join(__dirname, 'src', 'index.ts')],
  outfile: path.join(__dirname, 'bundle.mjs'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: ['node20'],
  packages: 'external',
  sourcemap: false,
});

console.log('[server] Built server/bundle.mjs');
