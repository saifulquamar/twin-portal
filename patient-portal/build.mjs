import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const baseBundlePath = path.join(__dirname, 'vendor', 'portal-base.js');
const targetAssetsDir = path.join(repoRoot, 'Mutanex_MyTwin', 'portal', 'assets');
const targetEnhancementsPath = path.join(targetAssetsDir, 'portal-enhancements.js');
const targetMainBundlePath = path.join(targetAssetsDir, 'index-BxZuYt8a.js');

// Plugin redirecting react & react/jsx-runtime to the host portal's single React 19 instance
const sharedReactPlugin = {
  name: 'shared-portal-react',
  setup(build) {
    build.onResolve({ filter: /^react$/ }, () => ({
      path: 'react',
      namespace: 'mx-shared-react',
    }));
    build.onResolve({ filter: /^react\/jsx(-dev)?-runtime$/ }, () => ({
      path: 'react/jsx-runtime',
      namespace: 'mx-shared-jsx',
    }));

    build.onLoad({ filter: /.*/, namespace: 'mx-shared-react' }, () => ({
      contents: `module.exports = globalThis.__MX_REACT__;`,
      loader: 'js',
    }));
    build.onLoad({ filter: /.*/, namespace: 'mx-shared-jsx' }, () => ({
      contents: `module.exports = globalThis.__MX_JSX__;`,
      loader: 'js',
    }));
  },
};

function findFunctionEnd(src, startIdx) {
  const openParen = src.indexOf('(', startIdx);
  let parenDepth = 0;
  let bodyOpenBrace = -1;
  let inStr = null;
  let esc = false;

  for (let i = openParen; i < src.length; i++) {
    const ch = src[i];
    if (esc) {
      esc = false;
      continue;
    }
    if (inStr) {
      if (ch === '\\') esc = true;
      else if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inStr = ch;
      continue;
    }
    if (ch === '(') parenDepth++;
    else if (ch === ')') {
      parenDepth--;
      if (parenDepth === 0) {
        bodyOpenBrace = src.indexOf('{', i);
        break;
      }
    }
  }

  if (bodyOpenBrace === -1) {
    throw new Error(`Could not locate opening brace for function at ${startIdx}`);
  }

  let depth = 0;
  inStr = null;
  esc = false;
  for (let i = bodyOpenBrace; i < src.length; i++) {
    const ch = src[i];
    if (esc) {
      esc = false;
      continue;
    }
    if (inStr) {
      if (ch === '\\') esc = true;
      else if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inStr = ch;
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  throw new Error(`Unbalanced braces for function starting at ${startIdx}`);
}

function assertUniqueAnchor(src, anchor, label) {
  const first = src.indexOf(anchor);
  const last = src.lastIndexOf(anchor);
  if (first === -1) {
    throw new Error(`Missing anchor [${label}]: ${anchor}`);
  }
  if (first !== last) {
    throw new Error(`Non-unique anchor [${label}] at ${first} and ${last}`);
  }
  return first;
}

function replaceWholeFunction(src, signature, replacementFnSource, label) {
  const start = assertUniqueAnchor(src, signature, label);
  const end = findFunctionEnd(src, start);
  return src.slice(0, start) + replacementFnSource + src.slice(end);
}

function replaceUniqueSubstring(src, anchor, replacement, label) {
  const start = assertUniqueAnchor(src, anchor, label);
  return src.slice(0, start) + replacement + src.slice(start + anchor.length);
}

async function main() {
  const result = await esbuild.build({
    entryPoints: [path.join(__dirname, 'src', 'index.tsx')],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2022'],
    minify: true,
    write: false,
    plugins: [sharedReactPlugin],
    define: {
      'import.meta.env.VITE_ASK_URL': JSON.stringify(process.env.VITE_ASK_URL || ''),
    },
  });

  const enhancementsCode = result.outputFiles[0].text;
  fs.mkdirSync(targetAssetsDir, { recursive: true });
  fs.writeFileSync(targetEnhancementsPath, enhancementsCode, 'utf8');

  let patched = fs.readFileSync(baseBundlePath, 'utf8');

  // 1. Expose shared React 19 (_) & jsx-runtime (S), and evaluate enhancements synchronously
  const reactAnchor = 'S=o(((e,t)=>{t.exports=x()}))();';
  patched = replaceUniqueSubstring(
    patched,
    reactAnchor,
    `${reactAnchor}globalThis.__MX_REACT__=_;globalThis.__MX_JSX__=S;${enhancementsCode}\n`,
    'React & JSX export'
  );

  // 2. Replace SubpageHeader (_e) across all 20+ subpages with standard header + deterministic Back navigation
  patched = replaceWholeFunction(
    patched,
    'function _e({title:e,sub:t,right:n,illus:r}){',
    'function _e(p){return(0,S.jsx)(globalThis.__MX_PORTAL__.SubpageHeader,{...p,Icon:J})}',
    'SubpageHeader (_e)'
  );

  // 3. Replace Onboarding screen (te) with 7-step OnboardingFlow matching existing portal UI
  patched = replaceWholeFunction(
    patched,
    'function te({b:e,go:t}){',
    'function te({b:e,go:t}){return(0,S.jsx)(globalThis.__MX_PORTAL__.OnboardingFlow,{b:e,go:t,BrandMark:w,Icon:J,writeStore:z,setDoctorMode:bi})}',
    'OnboardingFlow (te)'
  );

  // 4. Replace Ask / Clinical AI (di) with grounded AskPanel + clickable citations + D3 Knowledge Graph
  patched = replaceWholeFunction(
    patched,
    'function di({b:e,openFinding:t,embedded:n=!1,initial:r}){',
    'function di({b:e,openFinding:t,embedded:n=!1,initial:r}){return(0,S.jsx)(globalThis.__MX_PORTAL__.AskPanel,{b:e,openFinding:t,embedded:n,initial:r,host:{getPatientId:D,readStore:R,writeStore:z,formatDate:M,useDoctor:xi,loadDoctorDoc:ce,cdssPrompts:K,crisisRegex:ii,CrisisBanner:ai,checkHealth:li,apiBase:oi}})}',
    'AskPanel (di)'
  );

  // 5. Inject ClinicianBriefingCard + KnowledgeGraphCard on Doctor View Clinical Overview (Ai)
  const aiOverviewAnchor =
    'function Ai({b:e,doc:t,setSeg:n}){';
  const aiIdx = assertUniqueAnchor(patched, aiOverviewAnchor, 'Clinical Overview (Ai)');
  const aiGridSubAnchor = 'return(0,S.jsxs)(`div`,{className:`rs-grid`,children:[';
  const gridPos = patched.indexOf(aiGridSubAnchor, aiIdx);
  if (gridPos === -1 || gridPos - aiIdx > 2500) {
    throw new Error('Could not find rs-grid return inside Ai');
  }
  patched =
    patched.slice(0, gridPos) +
    'return(0,S.jsxs)(`div`,{className:`rs-grid`,children:[(0,S.jsx)(globalThis.__MX_PORTAL__.ClinicianBriefingCard,{b:e,doc:t,readStore:R,formatDate:M}),(0,S.jsx)(`div`,{className:`rs-wide`,children:(0,S.jsx)(globalThis.__MX_PORTAL__.KnowledgeGraphCard,{b:e,doc:t,readStore:R,openFinding:id=>{location.hash=`/research/f:${id}`}})}),' +
    patched.slice(gridPos + aiGridSubAnchor.length);

  // 6. Inject SwitcherExtras in Patient Switcher sheet (zi)
  const switcherAnchor = '(0,S.jsx)(`h2`,{children:`Switch patient`}),';
  patched = replaceUniqueSubstring(
    patched,
    switcherAnchor,
    `${switcherAnchor}(0,S.jsx)(globalThis.__MX_PORTAL__.SwitcherExtras,{onCloseSheet:()=>a(!1),setDoctorMode:bi}),`,
    'Switch patient sheet (zi)'
  );

  // 7. Replace Preserve yourself (gi) with Three.js 3D + Gemini Voice & Face Studio
  patched = replaceWholeFunction(
    patched,
    'function gi({b:e}){',
    'function gi({b:e}){return(0,S.jsx)(globalThis.__MX_PORTAL__.PreserveScreen,{b:e,host:{getPatientId:D,readStore:R,writeStore:z,formatDate:M,Hero:_e,Icon:J,apiBase:oi}})}',
    'PreserveScreen (gi)'
  );

  // 8. Replace Feed your twin (ma) with upgraded ReportScanForm + Patient Briefing card
  patched = replaceWholeFunction(
    patched,
    'function ma({b:e}){',
    'function ma({b:e}){return(0,S.jsx)(globalThis.__MX_PORTAL__.FeedScreen,{b:e,host:{getPatientId:D,readStore:R,writeStore:z,formatDate:M,Hero:_e,InfoBanner:Ee,Sheet:$r,Icon:J,AskQuestions:sa,apiBase:oi}})}',
    'FeedScreen (ma)'
  );

  // 9. Inject interactive D3 KnowledgeGraphCard on Research findings screen (Za)
  const researchAnchor =
    '(0,S.jsxs)(`div`,{className:`rf-list`,children:[(0,S.jsx)($a,{b:e,go:n}),';
  patched = replaceUniqueSubstring(
    patched,
    researchAnchor,
    `${researchAnchor}(0,S.jsx)(globalThis.__MX_PORTAL__.KnowledgeGraphCard,{b:e,readStore:R,openFinding:o}),`,
    'Research findings list (Za)'
  );

  // 10. Ensure #/ask/ask routes straight to the Ask tab (checkin:ask) instead of Today check-in
  const askRouteAnchor = 'sub:n&&e!==`ask`?n:l_[e][1]';
  patched = replaceUniqueSubstring(
    patched,
    askRouteAnchor,
    'sub:e===`ask`&&n?`checkin:${n}`:n?n:l_[e][1]',
    'Ask route sub-tab resolver (u_)'
  );

  // 11. Wire root app d_() directly to React-state NavigationProvider & usePortalNavigation
  const rootNavAnchor =
    '[{tab:i,sub:a},o]=(0,_.useState)(u_),s=xi()&&!0;(0,_.useEffect)(()=>{Qg({...Zg,...R(`mx-prefs`,{})})},[]),(0,_.useEffect)(()=>{A().then(t,e=>r(String(e.message||e)))},[]),(0,_.useEffect)(()=>{let e=()=>o(u_());return window.addEventListener(`hashchange`,e),()=>window.removeEventListener(`hashchange`,e)},[]);let c=(e,t)=>{let n=e===`panel`&&(t===`book`||t?.startsWith(`t:`))||e===`twin`&&t?.startsWith(`o:`);location.hash=`/${e}${t?`/${t}`:``}`,n||(window.scrollTo(0,0),document.querySelector(`.pane`)?.scrollTo(0,0))};';
  patched = replaceUniqueSubstring(
    patched,
    rootNavAnchor,
    '{current:{tab:i,sub:a},go:c}=globalThis.__MX_PORTAL__.usePortalNavigation(),s=xi()&&!0;(0,_.useEffect)(()=>{Qg({...Zg,...R(`mx-prefs`,{})})},[]),(0,_.useEffect)(()=>{A().then(t,e=>r(String(e.message||e)))},[]);',
    'Root app React-state navigation hook (d_)'
  );

  const rootMountAnchor = 'children:(0,S.jsx)(d_,{})';
  patched = replaceUniqueSubstring(
    patched,
    rootMountAnchor,
    'children:(0,S.jsx)(globalThis.__MX_PORTAL__.NavigationProvider,{children:(0,S.jsx)(d_,{})})',
    'NavigationProvider root mount'
  );

  fs.writeFileSync(targetMainBundlePath, patched, 'utf8');
  console.log(
    `[patient-portal] Built portal-enhancements.js (${(enhancementsCode.length / 1024).toFixed(1)} kB) and updated index-BxZuYt8a.js (${(patched.length / 1024).toFixed(1)} kB)`
  );
}

main().catch((err) => {
  console.error('[patient-portal] Build failed:', err);
  process.exit(1);
});
