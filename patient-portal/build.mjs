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

  // 4. Replace Home Bento Panel (Oa) + make 3D stage twin-feed button a crisp "+" icon shortcut
  patched = replaceWholeFunction(
    patched,
    'function Oa({b:e,go:t,counts:n,open:r,onBio:i}){',
    'function Oa({b:e,go:t,counts:n,open:r,onBio:i}){return(0,S.jsx)(globalThis.__MX_PORTAL__.HomeBentoPanel,{b:e,go:t,counts:n,open:r,onBio:i,nextStepFn:Ca,panelUnlockCountFn:va,Ring:Te,Takeaway:Ee,Icon:J,readStore:R,formatDate:M})}',
    'HomeBentoPanel (Oa)'
  );

  const stageFeedBtnAnchor =
    'className:`twin-feed`,onClick:()=>t(`you`,`feed`),"aria-label":`Feed your twin: add a result, measurement, medicine or symptom`,children:[(0,S.jsx)(`span`,{"aria-hidden":!0,children:`+`}),(0,S.jsx)(`em`,{children:`Feed your twin`})]';
  patched = replaceUniqueSubstring(
    patched,
    stageFeedBtnAnchor,
    'className:`twin-feed mx-twin-feed-icon`,title:`Feed your twin`,onClick:()=>t(`you`,`feed`),"aria-label":`Feed your twin: add test results, measurements, medicines, symptoms or diary`,children:[(0,S.jsx)(`span`,{"aria-hidden":!0,children:`+`})]',
    'Home 3D stage twin-feed icon button'
  );

  // 5. Replace Ask / Clinical AI (di) with voice-first self-perspective AskPanel + 3D speaking Twin + D3 Knowledge Graph
  patched = replaceWholeFunction(
    patched,
    'function di({b:e,openFinding:t,embedded:n=!1,initial:r}){',
    'function di({b:e,openFinding:t,embedded:n=!1,initial:r}){return(0,S.jsx)(globalThis.__MX_PORTAL__.AskPanel,{b:e,openFinding:t,embedded:n,initial:r,host:{getPatientId:D,readStore:R,writeStore:z,formatDate:M,useDoctor:xi,loadDoctorDoc:ce,cdssPrompts:K,crisisRegex:ii,CrisisBanner:ai,checkHealth:li,apiBase:oi,PatientTwin3D:Og}})}',
    'AskPanel (di)'
  );

  // 6. Inject ClinicianBriefingCard + KnowledgeGraphCard on Doctor View Clinical Overview (Ai)
  const aiOverviewAnchor = 'function Ai({b:e,doc:t,setSeg:n}){';
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

  // 7. Replace Patient Switcher (zi) with role-gated PatientSwitcherModal + Admin Mode + 12-Twin roster
  patched = replaceWholeFunction(
    patched,
    'function zi({b:e,compact:t=!1}){',
    'function zi({b:e,compact:t=!1}){return(0,S.jsx)(globalThis.__MX_PORTAL__.PatientSwitcherModal,{b:e,compact:t,loadPatientIndex:k,getPatientId:D,switchPatient:O,DoctorToggle:Si,setDoctorMode:bi,Sheet:$r,SwitcherExtras:globalThis.__MX_PORTAL__.SwitcherExtras})}',
    'PatientSwitcherModal (zi)'
  );

  // 8. Expose SDF human body generator & replace Preserve yourself (gi) with twin4 layout
  const bodyFnAnchor = 'function vg(e=.011){return gg&&gg.h===e||(gg={h:e,geo:_g(hg(e))}),gg.geo}';
  patched = replaceUniqueSubstring(
    patched,
    bodyFnAnchor,
    `${bodyFnAnchor}globalThis.__MX_GET_BODY_RAW__=hg;`,
    'Expose SDF body generator (hg)'
  );

  patched = replaceWholeFunction(
    patched,
    'function gi({b:e}){',
    'function gi({b:e}){return(0,S.jsx)(globalThis.__MX_PORTAL__.PreserveScreen,{b:e,host:{getPatientId:D,readStore:R,writeStore:z,formatDate:M,Hero:_e,Icon:J,apiBase:oi,PatientTwin3D:Og}})}',
    'PreserveScreen (gi)'
  );

  const jgPreserveWrapAnchor = 'return t===`checkin`||t?.startsWith(`checkin`)?(0,S.jsx)(ra,';
  patched = replaceUniqueSubstring(
    patched,
    jgPreserveWrapAnchor,
    'return t===`preserve`?i:t===`checkin`||t?.startsWith(`checkin`)?(0,S.jsx)(ra,',
    'Direct twin4 layout for PreserveScreen in Jg'
  );

  // 8b. Replace #/twin bottom text chat bar (f_) with Voice-Only FloatingVoiceLauncher
  patched = replaceWholeFunction(
    patched,
    'function f_({b:e,go:t,show:n,doctor:r}){',
    'function f_({b:e,go:t,show:n,doctor:r}){return(0,S.jsx)(globalThis.__MX_PORTAL__.FloatingVoiceLauncher,{b:e,go:t,show:n,doctor:r,Sheet:$r,AskComp:di})}',
    'FloatingVoiceLauncher (f_)'
  );

  // 9. Replace Feed your twin (ma) with 8-Category Multimodal Feed System + AI Interpreter
  patched = replaceWholeFunction(
    patched,
    'function ma({b:e}){',
    'function ma({b:e}){return(0,S.jsx)(globalThis.__MX_PORTAL__.FeedScreen,{b:e,host:{getPatientId:D,readStore:R,writeStore:z,formatDate:M,Hero:_e,InfoBanner:Ee,Sheet:$r,Icon:J,AskQuestions:sa,apiBase:oi}})}',
    'FeedScreen (ma)'
  );

  // 10. Replace Research screen (Za) with interactive priority filters + restored Method tab + KnowledgeGraphCard
  patched = replaceWholeFunction(
    patched,
    'function Za({b:e,sub:t,go:n}){',
    'function Za({b:e,sub:t,go:n}){return(0,S.jsx)(globalThis.__MX_PORTAL__.ResearchScreen,{b:e,sub:t,go:n,PageHead:ve,SegmentedTabs:ye,ResearchSourcesTab:to,ResearchMethodTab:hi,ResearchGenesTab:Ha,ResearchDossierTab:Fa,ResearchFindingDetail:eo,Sheet:$r,Icon:J,CertaintyGrade:Y,Takeaway:Ee,readStore:R,priorityMapper:Ya,certaintyGrades:P,useDesktopQuery:Xa})}',
    'ResearchScreen (Za)'
  );

  // 11. Upgrade You screen (Jg): Preserve subtitle, compact Digital Identity Badge, remove "See the onboarding again", and mount Account/Auth footer
  const preserveMenuAnchor = '[`preserve`,`Preserve yourself`,`Join the waitlist`,`preserve`]';
  patched = replaceUniqueSubstring(
    patched,
    preserveMenuAnchor,
    '[`preserve`,`Preserve yourself`,`3D likeness, personal voice & memory`,`preserve`]',
    'Preserve menu subtitle (qg)'
  );

  const youProfileCardAnchor =
    '(0,S.jsxs)(`section`,{className:`profile-card`,children:[(0,S.jsxs)(`div`,{className:`pc-top`,children:[(0,S.jsx)(`span`,{className:`avatar lg`,children:e.patient.preferred_name[0]}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h1`,{children:R(`mx-profile`,{}).preferred_name||e.patient.preferred_name}),(0,S.jsxs)(`p`,{className:`note`,children:[i.years,` years · twin since `,M(e.patient.twin_created)]})]}),(0,S.jsx)(zi,{b:e})]}),(0,S.jsx)(`div`,{className:`pc-journey`,children:(e.journey_stages??[]).map((e,t)=>(0,S.jsxs)(`button`,{onClick:()=>n(`you`,`journey-${e.n}`),children:[(0,S.jsx)(Te,{value:e.done,total:e.total,size:40}),(0,S.jsxs)(`span`,{children:[(0,S.jsx)(`b`,{children:[`Assessment`,`Longevity`,`Personal`][t]}),(0,S.jsxs)(`small`,{children:[e.done,`/`,e.total]})]})]},e.n))}),(0,S.jsxs)(`div`,{className:`row-btns`,children:[(0,S.jsx)(`button`,{className:`primary sm`,onClick:()=>n(`you`,`profile`),children:`Edit profile`}),(0,S.jsx)(`button`,{className:`secondary sm`,onClick:()=>n(`you`,`journey`),children:`Your journey`})]})]})';
  patched = replaceUniqueSubstring(
    patched,
    youProfileCardAnchor,
    '(0,S.jsx)(globalThis.__MX_PORTAL__.YouIdentityBadge,{b:e,go:n,getPatientId:D,calcAge:N,formatDate:M,readStore:R,Ring:Te,Icon:J,PatientSwitcher:zi})',
    'YouIdentityBadge (Jg)'
  );

  const youFooterButtonsAnchor =
    ',(0,S.jsx)(`button`,{className:`secondary`,onClick:()=>n(`welcome`),children:`See the onboarding again`}),(0,S.jsx)(`button`,{className:`logout`,disabled:!0,title:`Sign-in arrives with your Mutanex account`,children:`Log out`}),(0,S.jsx)(`p`,{className:`note center`,children:`Sign-in, and so log out, arrive with your Mutanex account. Today your twin runs privately on this device.`})';
  patched = replaceUniqueSubstring(
    patched,
    youFooterButtonsAnchor,
    ',(0,S.jsx)(globalThis.__MX_PORTAL__.YouAccountFooter,{b:e,go:n})',
    'Remove See onboarding again + mount YouAccountFooter (Jg)'
  );

  // 11b. Clean production copy in Settings & Privacy
  patched = replaceUniqueSubstring(
    patched,
    'children:`Arrive with your account`',
    'children:`Encrypted`',
    'Settings security badge copy'
  );
  patched = replaceUniqueSubstring(
    patched,
    'Requests are recorded and completed within 30 days once accounts exist.',
    'Requests are recorded and completed within 30 days.',
    'Settings delete request copy'
  );
  patched = replaceUniqueSubstring(
    patched,
    'Care-team access is logged once accounts exist.',
    'Care-team access is logged automatically.',
    'Privacy access log copy'
  );
  patched = replaceUniqueSubstring(
    patched,
    'Only for the waitlist. Optional.',
    'Optional.',
    'Privacy preserve consent copy'
  );

  // 12. Ensure #/ask/ask routes straight to the Ask tab (checkin:ask) instead of Today check-in
  const askRouteAnchor = 'sub:n&&e!==`ask`?n:l_[e][1]';
  patched = replaceUniqueSubstring(
    patched,
    askRouteAnchor,
    'sub:e===`ask`&&n?`checkin:${n}`:n?n:l_[e][1]',
    'Ask route sub-tab resolver (u_)'
  );

  // 13. Wire root app d_() directly to AuthProvider + React-state NavigationProvider
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
    'children:(0,S.jsx)(globalThis.__MX_PORTAL__.AuthProvider,{children:(0,S.jsx)(globalThis.__MX_PORTAL__.NavigationProvider,{children:(0,S.jsx)(d_,{})})})',
    'AuthProvider + NavigationProvider root mount'
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
