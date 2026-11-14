"use strict";(()=>{var dm=Object.create;var Mh=Object.defineProperty;var fm=Object.getOwnPropertyDescriptor;var pm=Object.getOwnPropertyNames;var mm=Object.getPrototypeOf,gm=Object.prototype.hasOwnProperty;var wh=(n,e)=>()=>(e||n((e={exports:{}}).exports,e),e.exports);var ym=(n,e,t,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of pm(e))!gm.call(n,s)&&s!==t&&Mh(n,s,{get:()=>e[s],enumerable:!(i=fm(e,s))||i.enumerable});return n};var ht=(n,e,t)=>(t=n!=null?dm(mm(n)):{},ym(e||!n||!n.__esModule?Mh(t,"default",{value:n,enumerable:!0}):t,n));var Bn=wh((Pw,Eh)=>{Eh.exports=globalThis.__MX_REACT__});var At=wh((Dw,Ph)=>{Ph.exports=globalThis.__MX_JSX__});var um=ht(Bn(),1);var Gn=ht(Bn(),1);var Pt=ht(Bn(),1);function br(n){return n.toLowerCase().replace(/\(.*?\)/g," ").replace(/[^a-z0-9]+/g," ").trim()}var Aa=[["egfr","estimated gfr","glomerular filtration rate","gfr","egfr ckd epi","ckd epi"],["hba1c","hemoglobin a1c","haemoglobin a1c","glycated hemoglobin","glycated haemoglobin","a1c","glycosylated hemoglobin"],["ldl","ldl c","ldl cholesterol","low density lipoprotein","direct ldl"],["hdl","hdl c","hdl cholesterol","high density lipoprotein"],["uacr","acr","urine acr","urine albumin","urine albumin creatinine ratio","urine albumin to creatinine ratio","albumin creatinine ratio","microalbumin creatinine ratio"],["creatinine","serum creatinine","creatinine serum","creat","scr"],["fasting glucose","glucose fasting","fasting plasma glucose","fasting blood sugar","fbs","fpg","blood glucose fasting"],["crp","hs crp","hscrp","high sensitivity crp","high sensitivity c reactive protein","c reactive protein"],["25 oh vitamin d","vitamin d","25 hydroxyvitamin d","25 oh vit d","vit d","cholecalciferol","vitamin d 25 oh"],["total cholesterol","cholesterol total","serum cholesterol","cholesterol"],["triglycerides","triglyceride","tg","trigs"],["apob","apolipoprotein b","apo b"],["lp a","lpa","lipoprotein a"],["potassium","serum potassium","k","potassium serum"],["sodium","serum sodium","na","sodium serum"],["urate","uric acid","serum urate","serum uric acid"],["calcium","serum calcium","total calcium"],["alt","sgpt","alanine aminotransferase","alanine transaminase"],["ast","sgot","aspartate aminotransferase","aspartate transaminase"],["albumin serum","albumin","serum albumin"],["alkaline phosphatase serum","alkaline phosphatase","alp"],["tsh","thyroid stimulating hormone","thyrotropin"],["free t4","ft4","free thyroxine","thyroxine free"],["ferritin","serum ferritin"],["transferrin saturation","tsat","iron saturation"],["vitamin b12","vit b12","cobalamin","b12"],["hemoglobin","haemoglobin","hb","hgb"],["platelets","platelet count","plt"],["white cell count blood","wbc","white blood cell count","leukocytes","total wbc"],["cystatin c","serum cystatin c"],["urea","blood urea","bun","blood urea nitrogen"],["bicarbonate","hco3","co2 total","serum bicarbonate"],["parathyroid hormone","pth","intact pth"],["nt probnp","nt pro bnp","probnp"]];function Th(n){let e=br(n),t=e.replace(/\s+/g,"");for(let i=0;i<Aa.length;i++)for(let s of Aa[i]){let r=br(s),o=r.replace(/\s+/g,"");if(e===r||t===o)return i}for(let i=0;i<Aa.length;i++)for(let s of Aa[i]){let r=br(s);if(r.length>=4&&(e.startsWith(r+" ")||e.endsWith(" "+r))){if(e.includes("albumin")&&r==="creatinine")continue;return i}}return-1}function Ki(n){return n?n.replace(/\{1\.73_m2\}/gi,"1.73m\xB2").replace(/mL\/min\/1\.73m2/gi,"mL/min/1.73m\xB2").replace(/m\[IU\]\/L/gi,"mIU/L").replace(/mm\[Hg\]/gi,"mmHg").trim():""}function vm(n,e){if(!e||typeof e!="object")return null;let t=Object.entries(e).filter(([,a])=>Array.isArray(a)&&a.length>0);if(t.length===0)return null;let i=n.trim().toLowerCase(),s=br(n),r=s.replace(/\s+/g,"");for(let[a,l]of t){let c=br(a);if(a.trim().toLowerCase()===i||c===s||c.replace(/\s+/g,"")===r)return{key:a,latest:l[l.length-1]}}let o=Th(n);if(o!==-1){for(let[a,l]of t)if(Th(a)===o)return{key:a,latest:l[l.length-1]}}return null}function Ah(n,e,t){return n.map((i,s)=>{let r=vm(i.name,e),o=r&&typeof r.latest.value=="number"&&!Number.isNaN(r.latest.value)?r.latest.value:null,a=r?.latest.unit??null,l=r?.latest.date??null,c=null,u=null;return o!==null&&o!==0&&typeof i.value=="number"&&(c=(i.value-o)/Math.abs(o)*100,Math.abs(c)<.05?u="\u2192":c>0?u="\u2191":u="\u2193"),{...i,date:i.date||t||null,id:`ext-${s}-${i.name}`,kept:!0,matchedLabKey:r?.key??null,prevValue:o,prevUnit:a,prevDate:l,pctChange:c,arrow:u}})}var Lt=ht(Bn(),1);var rc={home:["twin",null],findings:["research","findings"],me:["you",null],ask:["you","checkin"],health:["you","health"]},_m=new Set(["twin","research","panel","results","clinical","you","welcome"]),Sr={twin:"Twin",you:"You",research:"Research",results:"Results",panel:"Panel",clinical:"Clinical",welcome:"Welcome"},Ch=50;function xm(n,e){if(!e)return n;if(n==="twin"&&e.startsWith("o:"))return"twin";if(n==="clinical"||n==="results")return n;if(n==="research"&&!e.startsWith("f:"))return"research";let t=e.split(":")[0];return`${n}/${t}`}function hn(n){let e=(n||"").replace(/^#\/?/,"").trim();if(!e)return{hash:"#/twin",tab:"twin",sub:null,pageKey:"twin"};let[t,...i]=e.split("/"),s=i.join("/")||null,r=t,o=s;rc[t]?(r=rc[t][0],t==="ask"?s?s==="checkin"||s.startsWith("checkin:")?o=s:o=`checkin:${s}`:o="checkin":o=s||rc[t][1]):_m.has(t)||(r="twin",o=s);let a=xm(r,o);return{hash:`#/${r}${o?`/${o}`:""}`,tab:r,sub:o,pageKey:a}}function bm(n){let{tab:e,sub:t}=hn(n);return e==="you"?t&&/^journey-[123]$/.test(t)?{targetHash:"#/you/journey",parentLabel:"Your journey"}:t?{targetHash:"#/you",parentLabel:"You"}:{targetHash:"#/twin",parentLabel:"Twin"}:e==="twin"?{targetHash:"#/twin",parentLabel:"Twin"}:e==="research"?t?{targetHash:"#/research",parentLabel:"Research"}:{targetHash:"#/twin",parentLabel:"Twin"}:e==="results"?t?{targetHash:"#/results",parentLabel:"Results"}:{targetHash:"#/twin",parentLabel:"Twin"}:e==="panel"?t?{targetHash:"#/panel",parentLabel:"Panel"}:{targetHash:"#/twin",parentLabel:"Twin"}:e==="clinical"?t?{targetHash:"#/clinical",parentLabel:"Clinical"}:{targetHash:"#/twin",parentLabel:"Twin"}:{targetHash:"#/twin",parentLabel:"Twin"}}function Sm(n){return typeof n=="string"?hn(n):n}function Rh(n,e,t){let i=hn(e),s=n.map(Sm);for(;s.length>0;){let o=s.pop();if(o.pageKey===i.pageKey||o.tab==="welcome"&&i.tab!=="welcome")continue;let a=(o.sub,Sr[o.tab]||"Back");return{targetHash:o.hash,backLabel:a,nextStack:s}}if(t){let o=hn(t);return{targetHash:o.hash,backLabel:Sr[o.tab]||"Back",nextStack:[]}}let r=bm(e);return{targetHash:r.targetHash,backLabel:r.parentLabel,nextStack:[]}}function ac(n){return{current:hn(n||"#/twin"),history:[]}}function Ih(n,e){switch(e.type){case"NAVIGATE":{let t=hn(e.rawHash);if(t.hash===n.current.hash)return n;if(e.replace||t.pageKey===n.current.pageKey)return{current:t,history:n.history};let s=n.current.tab!=="welcome"?[...n.history,n.current]:n.history,r=s.length>Ch?s.slice(s.length-Ch):s;return{current:t,history:r}}case"GO_BACK":{let t=Rh(n.history,n.current.hash,e.fallbackHash);return{current:hn(t.targetHash),history:t.nextStack}}case"RESET":return{current:hn(e.rawHash||n.current.hash),history:[]};default:return n}}function Ca(n){let e=Rh(n.history,n.current.hash);return{targetHash:e.targetHash,backLabel:e.backLabel,canGoBack:n.history.length>0||e.targetHash!==n.current.hash}}var Dh=ht(At(),1),Nh=(0,Lt.createContext)(null);function Mm(){if(typeof window>"u")return"#/twin";try{if(new URLSearchParams(window.location.search).get("autostart")==="1"&&(window.localStorage.setItem("mx-onboarded","true"),!window.location.hash||window.location.hash==="#/welcome"))return window.history.replaceState(null,"",`${window.location.pathname}${window.location.search}#/twin`),"#/twin"}catch{}return window.location.hash||"#/twin"}function wm(){typeof window>"u"||(window.scrollTo(0,0),document.querySelector(".pane")?.scrollTo(0,0))}function Lh({children:n}){let[e,t]=(0,Lt.useReducer)(Ih,void 0,()=>ac(Mm())),i=(0,Lt.useRef)(e.current.hash),s=(0,Lt.useCallback)((h,d=!1,f=!1)=>{if(typeof window>"u")return;i.current=h;let g=h.startsWith("#")?h:`#${h}`;window.location.hash!==g&&(d?window.history.replaceState(null,"",`${window.location.pathname}${window.location.search}${g}`):window.location.hash=g.slice(1)),f||wm()},[]);(0,Lt.useEffect)(()=>{if(typeof window>"u")return;let h=()=>{let d=hn(window.location.hash||"#/twin");d.hash!==i.current&&(i.current=d.hash,t({type:"NAVIGATE",rawHash:window.location.hash||"#/twin"}))};return window.addEventListener("hashchange",h),()=>window.removeEventListener("hashchange",h)},[]);let r=(0,Lt.useCallback)((h,d)=>{let f=hn(h);t({type:"NAVIGATE",rawHash:f.hash,replace:d?.replace}),s(f.hash,!!d?.replace,!!d?.preserveScroll)},[s]),o=(0,Lt.useCallback)((h,d)=>{let f=h==="panel"&&(d==="book"||!!d?.startsWith("t:"))||h==="twin"&&!!d?.startsWith("o:"),g=`#/${h}${d?`/${d}`:""}`;r(g,{preserveScroll:f})},[r]),a=(0,Lt.useCallback)(h=>{let d=Ca(e),f=e.history.length===0&&h?hn(h).hash:d.targetHash;t({type:"GO_BACK",fallbackHash:h}),s(f,!0,!1)},[s,e]),l=(0,Lt.useCallback)(h=>{let d=hn(h||e.current.hash).hash;t({type:"RESET",rawHash:d}),s(d,!0,!1)},[s,e.current.hash]),c=(0,Lt.useMemo)(()=>Ca(e),[e]),u=(0,Lt.useMemo)(()=>({state:e,current:e.current,history:e.history,canGoBack:c.canGoBack,backTarget:{targetHash:c.targetHash,backLabel:c.backLabel},navigate:r,go:o,goBack:a,resetHistory:l}),[c,o,a,r,l,e]);return(0,Dh.jsx)(Nh.Provider,{value:u,children:n})}function En(){let n=(0,Lt.useContext)(Nh);if(!n){let e=ac(typeof window<"u"&&window.location.hash||"#/twin"),t=Ca(e);return{state:e,current:e.current,history:e.history,canGoBack:t.canGoBack,backTarget:{targetHash:t.targetHash,backLabel:t.backLabel},navigate:i=>{typeof window<"u"&&(window.location.hash=i.replace(/^#/,""))},go:(i,s)=>{typeof window<"u"&&(window.location.hash=`/${i}${s?`/${s}`:""}`)},goBack:()=>{typeof window<"u"&&(window.location.hash=t.targetHash.replace(/^#/,""))},resetHistory:()=>{}}}return n}var z=ht(At(),1),Pm={},oc="mx-feed",wi="mx-briefing",Ra="mx-briefing-updated",Ia="mx-feed-updated",Em=typeof Pm<"u"&&""||"";function kh(n,e){return`${(Em||e||"").replace(/\/$/,"")}${n}`}var Uh=[["lab","A lab result","A blood or urine value from a report","blood"],["measure","A measurement","Blood pressure, weight, heart rate, glucose","heart"],["medicine","A medicine or supplement","Something you take, with its dose","lifestyle"],["symptom","A symptom","Something new or changing","checkin"],["family","Family history","A condition in a relative","dna"],["lifestyle","Your habits","Sleep, activity, smoking, alcohol","lifestyle"],["report","A report or scan","Upload a PDF or photo for your care team","share"]],Fh=[["Blood pressure","mmHg"],["Weight","kg"],["Heart rate","bpm"],["Blood glucose","mg/dL"],["Waist","cm"],["Oxygen saturation","%"]],Tm=["Mother","Father","Sister","Brother","Grandmother","Grandfather","Aunt","Uncle","Child"],vn=()=>new Date().toISOString().slice(0,10);function vt({label:n,children:e}){return(0,z.jsxs)("label",{className:"feed-f",children:[(0,z.jsx)("span",{children:n}),e]})}function Am(n){return new Promise((e,t)=>{let i=new FileReader;i.onload=()=>{let s=typeof i.result=="string"?i.result:"",r=s.includes(",")?s.split(",")[1]:s;if(!r){t(new Error("Empty file content"));return}e(r)},i.onerror=()=>t(i.error||new Error("Failed to read file")),i.readAsDataURL(n)})}function Cm(n){let e=(n.type||"").toLowerCase();return e==="application/pdf"||n.name.toLowerCase().endsWith(".pdf")?"application/pdf":e==="image/jpeg"||e==="image/jpg"||/\.jpe?g$/i.test(n.name)?"image/jpeg":"image/png"}function Rm({bundle:n,defaultDate:e,apiBase:t,onAddKeptRows:i}){let[s,r]=(0,Pt.useState)(e),[o,a]=(0,Pt.useState)(null),[l,c]=(0,Pt.useState)("idle"),[u,h]=(0,Pt.useState)(null),[d,f]=(0,Pt.useState)([]),[g,y]=(0,Pt.useState)(!1),m=(0,Pt.useRef)(null),p=async b=>{a(b),c("reading"),f([]),h(null);let R="";try{R=await Am(b)}catch{c("empty");return}let _=Cm(b);try{let x=new AbortController,L=setTimeout(()=>x.abort(),45e3),V=await fetch(kh("/v1/extract",t),{method:"POST",headers:{"Content-Type":"application/json"},signal:x.signal,body:JSON.stringify({file:R,mime_type:_})});if(clearTimeout(L),!V.ok){c("unreachable");return}let F=await V.json(),I=F.report_date||s||vn();if(F.report_date&&r(F.report_date),h(F.lab||null),!Array.isArray(F.results)||F.results.length===0){c("empty");return}let O=Ah(F.results,n?.labs,I);f(O),c("ready")}catch{c("unreachable")}},A=b=>{let R=b.target.files?.[0]??null;R&&p(R)},C=async()=>{y(!0);try{let b=await fetch("./sample-lab-report.jpg",{cache:"no-store"});if(!b.ok)throw new Error("Sample report missing");let R=await b.blob(),_=new File([R],"sample-lab-report.jpg",{type:"image/jpeg"});await p(_)}catch{c("unreachable")}finally{y(!1)}},v=b=>{f(R=>R.map(_=>_.id===b?{..._,kept:!_.kept}:_))},M=(0,Pt.useMemo)(()=>d.filter(b=>b.kept),[d]);return(0,z.jsxs)("form",{className:"feed-form",onSubmit:b=>{if(b.preventDefault(),l!=="ready"||M.length===0)return;let R=M.map(x=>{let L=x.date||s||vn(),V=x.unit?x.unit.trim():"";return{kind:"lab",date:L,title:`${x.name.trim()} ${x.value}${V?` ${V}`:""}`.trim(),detail:`from report, ${L}`,extracted:{name:x.name.trim(),value:x.value,unit:V,range:x.range,flag:x.flag,date:L,prevValue:x.prevValue,prevUnit:x.prevUnit,prevDate:x.prevDate,pctChange:x.pctChange}}}),_=M.map(x=>({name:x.name.trim(),value:x.value,unit:x.unit,range:x.range,flag:x.flag,date:x.date||s||vn(),prev_value:x.prevValue,prev_unit:x.prevUnit,prev_date:x.prevDate,pct_change:x.pctChange!=null?Number(x.pctChange.toFixed(1)):null}));i(R,_,{reportDate:s||vn(),labName:u})},children:[(0,z.jsx)(vt,{label:"File (PDF or photo)",children:(0,z.jsx)("input",{ref:m,type:"file",accept:"application/pdf,image/png,image/jpeg,image/*",onChange:A})}),(0,z.jsxs)("div",{className:"mx-sample-bar",children:[(0,z.jsx)("button",{type:"button",className:"secondary mx-sample-btn",disabled:l==="reading"||g,onClick:C,children:g?"Loading sample\u2026":"Use sample report"}),o&&(0,z.jsx)("span",{className:"note mx-file-pill",title:o.name,children:o.name})]}),(0,z.jsx)(vt,{label:"Report date",children:(0,z.jsx)("input",{type:"date",max:vn(),value:s,onChange:b=>r(b.target.value)})}),l==="reading"&&(0,z.jsxs)("div",{className:"card mx-extract-status",role:"status","aria-live":"polite",children:[(0,z.jsxs)("div",{className:"mx-status-line",children:[(0,z.jsxs)("span",{className:"ap-dots","aria-hidden":"true",children:[(0,z.jsx)("i",{}),(0,z.jsx)("i",{}),(0,z.jsx)("i",{})]}),(0,z.jsx)("b",{children:"Reading the report\u2026"})]}),(0,z.jsx)("p",{className:"note",children:"Checking printed test names, values, reference ranges, and comparing them against your twin."})]}),l==="empty"&&(0,z.jsxs)("div",{className:"card mx-extract-status",role:"status",children:[(0,z.jsx)("div",{className:"sec",children:(0,z.jsxs)("span",{className:"state warn",children:[(0,z.jsx)("i",{}),"Nothing found"]})}),(0,z.jsx)("p",{className:"note",children:"We couldn\u2019t find any printed lab results on that file. Try uploading a clearer photo or PDF lab report."})]}),l==="unreachable"&&(0,z.jsxs)("div",{className:"card mx-extract-status",role:"alert",children:[(0,z.jsxs)("div",{className:"sec",children:[(0,z.jsxs)("span",{className:"state warn",children:[(0,z.jsx)("i",{}),"Server not reachable"]}),o&&(0,z.jsx)("button",{type:"button",className:"link",onClick:()=>void p(o),children:"Try again"})]}),(0,z.jsx)("p",{className:"note",children:"The report reader could not be reached right now. Please check that the server is running and try again."})]}),l==="ready"&&d.length>0&&(0,z.jsxs)("section",{className:"card mx-review-card","aria-label":"Extracted results review",children:[(0,z.jsxs)("div",{className:"sec mx-review-head",children:[(0,z.jsxs)("div",{children:[(0,z.jsx)("h3",{children:"Review extracted results"}),(0,z.jsxs)("p",{className:"note",children:[u?`${u} \xB7 `:"",s," \xB7 ",M.length," of ",d.length," selected"]})]}),(0,z.jsxs)("span",{className:"state warn",children:[(0,z.jsx)("i",{}),"Waiting for check"]})]}),(0,z.jsx)("div",{className:"mx-review-table-wrap",children:(0,z.jsx)("ul",{className:"rs-rows mx-review-rows",children:d.map(b=>{let R=Ki(b.unit),_=Ki(b.prevUnit||b.unit),x=b.flag==="high"||b.flag==="low"?"warn":"ok",L=b.pctChange!=null?`${b.arrow||""} ${b.pctChange>0?"+":""}${b.pctChange.toFixed(1)}%`.trim():null;return(0,z.jsxs)("li",{className:`mx-review-row${b.kept?"":" is-unticked"}`,children:[(0,z.jsxs)("label",{className:"mx-review-check",children:[(0,z.jsx)("input",{type:"checkbox",checked:b.kept,onChange:()=>v(b.id),"aria-label":`Include ${b.name}`}),(0,z.jsxs)("span",{className:"mx-review-main",children:[(0,z.jsxs)("span",{className:"mx-review-title-line",children:[(0,z.jsx)("b",{children:b.name}),(0,z.jsxs)("span",{className:"mx-review-newval",children:[b.value," ",R]})]}),(0,z.jsxs)("small",{className:"mx-review-sub",children:["Range: ",b.range||"not printed",b.flag?` \xB7 Flag: ${b.flag}`:" \xB7 Within range"]}),(0,z.jsx)("small",{className:"mx-review-twin",children:b.prevValue!=null?(0,z.jsxs)(z.Fragment,{children:["Twin latest (",b.matchedLabKey||b.name,"):"," ",(0,z.jsxs)("strong",{children:[b.prevValue," ",_]}),L&&(0,z.jsx)("span",{className:`mx-delta-badge${b.flag?" is-flagged":""}`,children:L})]}):(0,z.jsx)("span",{children:"No prior value in twin"})})]})]}),(0,z.jsxs)("span",{className:`state ${x}`,children:[(0,z.jsx)("i",{}),b.flag?b.flag.toUpperCase():"Normal"]})]},b.id)})})})]}),(0,z.jsx)("button",{className:"primary",type:"submit",disabled:l!=="ready"||M.length===0,children:"Add to my twin"}),(0,z.jsx)("p",{className:"note",children:"Your care team checks it first. Nothing you add changes your results, medicines or advice until then."})]})}function Im({kind:n,bundle:e,onSave:t}){let[i,s]=(0,Pt.useState)({date:vn(),measure:"Blood pressure",relative:"Mother",medKind:"Medicine",severity:"3",smoking:"Never"}),r=f=>g=>{let y=g.target.value;s(m=>({...m,[f]:y}))},o=(0,Pt.useMemo)(()=>Object.keys(e?.labs??{}),[e]),a=Fh.find(([f])=>f===i.measure)?.[1]??"",l=f=>f!=null&&f.trim()!==""&&!Number.isNaN(Number(f)),c=(0,z.jsx)(vt,{label:"Date",children:(0,z.jsx)("input",{type:"date",max:vn(),value:i.date??"",onChange:r("date")})}),u=!!i.date,h=null,d=()=>({kind:n,date:i.date,title:"",detail:""});switch(n){case"lab":{u=u&&!!i.test?.trim()&&l(i.value),h=(0,z.jsxs)(z.Fragment,{children:[(0,z.jsxs)(vt,{label:"Test",children:[(0,z.jsx)("input",{list:"feed-labs",value:i.test??"",onChange:r("test"),placeholder:"e.g. HbA1c"}),(0,z.jsx)("datalist",{id:"feed-labs",children:o.map(f=>(0,z.jsx)("option",{value:f},f))})]}),(0,z.jsxs)("div",{className:"feed-row",children:[(0,z.jsx)(vt,{label:"Value",children:(0,z.jsx)("input",{inputMode:"decimal",value:i.value??"",onChange:r("value")})}),(0,z.jsx)(vt,{label:"Unit",children:(0,z.jsx)("input",{value:i.unit??"",onChange:r("unit"),placeholder:"e.g. %"})})]}),c,(0,z.jsx)(vt,{label:"Laboratory (optional)",children:(0,z.jsx)("input",{value:i.lab??"",onChange:r("lab")})})]}),d=()=>({kind:n,date:i.date,title:`${i.test.trim()} ${i.value} ${i.unit??""}`.trim(),detail:i.lab?.trim()??""});break}case"measure":{let f=i.measure==="Blood pressure";u=u&&(f?l(i.sys)&&l(i.dia):l(i.value)),h=(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(vt,{label:"What",children:(0,z.jsx)("select",{value:i.measure,onChange:r("measure"),children:Fh.map(([g])=>(0,z.jsx)("option",{children:g},g))})}),f?(0,z.jsxs)("div",{className:"feed-row",children:[(0,z.jsx)(vt,{label:"Systolic",children:(0,z.jsx)("input",{inputMode:"numeric",value:i.sys??"",onChange:r("sys")})}),(0,z.jsx)(vt,{label:"Diastolic",children:(0,z.jsx)("input",{inputMode:"numeric",value:i.dia??"",onChange:r("dia")})})]}):(0,z.jsx)(vt,{label:`Value (${a})`,children:(0,z.jsx)("input",{inputMode:"decimal",value:i.value??"",onChange:r("value")})}),c]}),d=()=>({kind:n,date:i.date,title:`${i.measure} ${f?`${i.sys}/${i.dia}`:i.value} ${a}`,detail:"measured at home"});break}case"medicine":{u=u&&!!i.name?.trim(),h=(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(vt,{label:"Medicine or supplement",children:(0,z.jsxs)("select",{value:i.medKind,onChange:r("medKind"),children:[(0,z.jsx)("option",{children:"Medicine"}),(0,z.jsx)("option",{children:"Supplement"})]})}),(0,z.jsx)(vt,{label:"Name",children:(0,z.jsx)("input",{value:i.name??"",onChange:r("name")})}),(0,z.jsxs)("div",{className:"feed-row",children:[(0,z.jsx)(vt,{label:"Dose",children:(0,z.jsx)("input",{value:i.dose??"",onChange:r("dose"),placeholder:"e.g. 50 mg"})}),(0,z.jsx)(vt,{label:"How often",children:(0,z.jsx)("input",{value:i.freq??"",onChange:r("freq"),placeholder:"e.g. once a day"})})]}),(0,z.jsx)(vt,{label:"Started on",children:(0,z.jsx)("input",{type:"date",max:vn(),value:i.date??"",onChange:r("date")})})]}),d=()=>({kind:n,date:i.date,title:[i.name.trim(),i.dose].filter(Boolean).join(" "),detail:[i.medKind,i.freq].filter(Boolean).join(", ")});break}case"symptom":{u=u&&!!i.what?.trim(),h=(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(vt,{label:"What you notice",children:(0,z.jsx)("input",{value:i.what??"",onChange:r("what"),placeholder:"e.g. swollen ankles"})}),(0,z.jsx)(vt,{label:"Since",children:(0,z.jsx)("input",{type:"date",max:vn(),value:i.date??"",onChange:r("date")})}),(0,z.jsx)(vt,{label:`How much it bothers you: ${i.severity} of 5`,children:(0,z.jsx)("input",{type:"range",min:"1",max:"5",value:i.severity,onChange:r("severity")})})]}),d=()=>({kind:n,date:i.date,title:i.what.trim(),detail:`bothers you ${i.severity} of 5`});break}case"family":{u=u&&!!i.condition?.trim(),h=(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(vt,{label:"Relative",children:(0,z.jsx)("select",{value:i.relative,onChange:r("relative"),children:Tm.map(f=>(0,z.jsx)("option",{children:f},f))})}),(0,z.jsx)(vt,{label:"Condition",children:(0,z.jsx)("input",{value:i.condition??"",onChange:r("condition"),placeholder:"e.g. kidney disease"})}),(0,z.jsx)(vt,{label:"Age when diagnosed (optional)",children:(0,z.jsx)("input",{inputMode:"numeric",value:i.age??"",onChange:r("age")})})]}),d=()=>({kind:n,date:vn(),title:`${i.relative}: ${i.condition.trim()}`,detail:i.age?`diagnosed at ${i.age}`:""});break}case"lifestyle":{u=u&&(l(i.sleep)||l(i.activity)||l(i.alcohol)||!!i.smoking),h=(0,z.jsxs)(z.Fragment,{children:[(0,z.jsxs)("div",{className:"feed-row",children:[(0,z.jsx)(vt,{label:"Sleep (hours a night)",children:(0,z.jsx)("input",{inputMode:"decimal",value:i.sleep??"",onChange:r("sleep")})}),(0,z.jsx)(vt,{label:"Activity (minutes a week)",children:(0,z.jsx)("input",{inputMode:"numeric",value:i.activity??"",onChange:r("activity")})})]}),(0,z.jsxs)("div",{className:"feed-row",children:[(0,z.jsx)(vt,{label:"Smoking",children:(0,z.jsxs)("select",{value:i.smoking,onChange:r("smoking"),children:[(0,z.jsx)("option",{children:"Never"}),(0,z.jsx)("option",{children:"Former"}),(0,z.jsx)("option",{children:"Current"})]})}),(0,z.jsx)(vt,{label:"Alcohol (drinks a week)",children:(0,z.jsx)("input",{inputMode:"numeric",value:i.alcohol??"",onChange:r("alcohol")})})]})]}),d=()=>({kind:n,date:vn(),title:"Your habits",detail:[i.sleep&&`${i.sleep} h sleep`,i.activity&&`${i.activity} min activity a week`,`smoking: ${i.smoking.toLowerCase()}`,i.alcohol&&`${i.alcohol} drinks a week`].filter(Boolean).join(", ")});break}}return(0,z.jsxs)("form",{className:"feed-form",onSubmit:f=>{f.preventDefault(),u&&t(d())},children:[h,(0,z.jsx)("button",{className:"primary",type:"submit",disabled:!u,children:"Add to my twin"}),(0,z.jsx)("p",{className:"note",children:"Your care team checks it first. Nothing you add changes your results, medicines or advice until then."})]})}function Oh({b:n,host:e}){let{navigate:t}=En(),i=e.getPatientId(),[s,r]=(0,Pt.useState)(()=>e.readStore(oc,[])),[o,a]=(0,Pt.useState)(null),[l,c]=(0,Pt.useState)(()=>e.readStore(wi,null)),[u,h]=(0,Pt.useState)(!1),[d,f]=(0,Pt.useState)(!1);(0,Pt.useEffect)(()=>{r(e.readStore(oc,[])),c(e.readStore(wi,null))},[i,e]);let g=_=>Uh.find(([x])=>x===_)?.[1]??_,y=_=>{r(_),e.writeStore(oc,_),window.dispatchEvent(new Event(Ia))},m=_=>{let x=new Date().toISOString(),L={..._,id:`${Date.now()}`,at:x};y([L,...s]),a(null)},p=async(_,x,L)=>{let V=Date.now(),F=new Date().toISOString(),O=[..._.map((P,B)=>({...P,id:`${V}-${B}`,at:F})),...s];y(O),a(null),h(!0),f(!1);try{let P=await fetch(kh("/v1/briefing",e.apiBase),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bundle:n,new_results:x})});if(!P.ok)throw new Error(`HTTP ${P.status}`);let B=await P.json(),H={patient:String(B.patient||"").trim(),clinician:String(B.clinician||"").trim(),date:L.reportDate,at:F,labName:L.labName,count:x.length};c(H),e.writeStore(wi,H),window.dispatchEvent(new Event(Ra))}catch{f(!0)}finally{h(!1)}},A=_=>{y(s.filter(x=>x.id!==_))},C=e.Hero,v=e.InfoBanner,M=e.Sheet,E=e.Icon,b=e.AskQuestions,R=(n?.info_needed??[]).filter(_=>_.from==="you");return(0,z.jsxs)(z.Fragment,{children:[C&&(0,z.jsx)(C,{title:"Feed your twin",illus:"twin",sub:"Add what your twin doesn't know yet. Your care team checks each entry before your twin uses it."}),(u||l||d)&&(0,z.jsxs)("section",{className:"card mx-briefing-card","aria-label":"Your report briefing",children:[(0,z.jsxs)("div",{className:"sec",children:[(0,z.jsxs)("div",{children:[(0,z.jsx)("span",{className:"mx-eyebrow",children:"Report briefing"}),(0,z.jsx)("h2",{children:"What changed in your latest report"})]}),(0,z.jsxs)("span",{className:"state warn",children:[(0,z.jsx)("i",{}),"Waiting for check"]})]}),u?(0,z.jsxs)("div",{className:"mx-status-line",role:"status",children:[(0,z.jsxs)("span",{className:"ap-dots","aria-hidden":"true",children:[(0,z.jsx)("i",{}),(0,z.jsx)("i",{}),(0,z.jsx)("i",{})]}),(0,z.jsx)("span",{children:"Preparing your plain-language briefing\u2026"})]}):d&&!l?(0,z.jsx)("p",{className:"note",children:"Your results were saved to \u201CAdded by you\u201D, though the briefing service could not be reached right now."}):l?(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)("p",{className:"mx-briefing-body",children:l.patient}),(0,z.jsxs)("div",{className:"mx-briefing-foot",children:[(0,z.jsxs)("span",{className:"note",children:[l.labName?`${l.labName} \xB7 `:"",e.formatDate(l.date)," \xB7 ",l.count," result",l.count===1?"":"s"," added"]}),(0,z.jsx)("button",{type:"button",className:"link",onClick:()=>{t("#/you/checkin:ask")},children:"Ask your twin about these changes \u2192"})]})]}):null]}),R.length>0&&b&&(0,z.jsxs)("section",{className:"card feed-asks",children:[(0,z.jsx)("div",{className:"sec",children:(0,z.jsx)("h2",{children:"Your twin is asking"})}),(0,z.jsx)(b,{b:n})]}),(0,z.jsx)("h2",{className:"feed-h",children:"Add something new"}),(0,z.jsx)("div",{className:"feed-kinds",children:Uh.map(([_,x,L,V])=>(0,z.jsxs)("button",{className:"card feed-kind",onClick:()=>a(_),children:[(0,z.jsx)("span",{className:"tb-ic","aria-hidden":!0,children:E?(0,z.jsx)(E,{name:V,size:22}):null}),(0,z.jsxs)("span",{children:[(0,z.jsx)("b",{children:x}),(0,z.jsx)("small",{children:L})]}),(0,z.jsx)("span",{className:"feed-plus","aria-hidden":!0,children:"+"})]},_))}),(0,z.jsxs)("section",{className:"card feed-list",children:[(0,z.jsxs)("div",{className:"sec",children:[(0,z.jsx)("h2",{children:"Added by you"}),(0,z.jsx)("span",{className:"note",children:s.length?`${s.length} waiting for your care team`:"Nothing yet"})]}),!s.length&&(0,z.jsx)("p",{className:"note",children:"What you add appears here, marked as waiting until your care team has checked it."}),(0,z.jsx)("ul",{className:"rs-rows mx-added-rows",children:s.map(_=>(0,z.jsxs)("li",{children:[(0,z.jsxs)("span",{children:[(0,z.jsx)("b",{title:_.title,children:_.title}),(0,z.jsxs)("small",{children:[g(_.kind)," \xB7 ",e.formatDate(_.date),_.detail?` \xB7 ${_.detail}`:""]})]}),(0,z.jsxs)("span",{className:"state warn",children:[(0,z.jsx)("i",{}),"Waiting for check"]}),(0,z.jsx)("button",{className:"link",onClick:()=>A(_.id),"aria-label":`Remove ${_.title}`,children:"Remove"})]},_.id))})]}),v&&(0,z.jsx)(v,{text:"Your twin never changes from an entry until your care team has checked it",tone:"info"}),o&&M&&(0,z.jsxs)(M,{onClose:()=>a(null),label:g(o),children:[(0,z.jsx)("h2",{children:g(o)}),o==="report"?(0,z.jsx)(Rm,{bundle:n,defaultDate:vn(),apiBase:e.apiBase,onAddKeptRows:p}):(0,z.jsx)(Im,{kind:o,bundle:n,onSave:m})]})]})}var Vt=ht(Bn(),1);var Nm={value:()=>{}};function ni(){for(var n=0,e=arguments.length,t={},i;n<e;++n){if(!(i=arguments[n]+"")||i in t||/[\s.]/.test(i))throw new Error("illegal type: "+i);t[i]=[]}return new Pa(t)}function Pa(n){this._=n}function Lm(n,e){return n.trim().split(/^|\s+/).map(function(t){var i="",s=t.indexOf(".");if(s>=0&&(i=t.slice(s+1),t=t.slice(0,s)),t&&!e.hasOwnProperty(t))throw new Error("unknown type: "+t);return{type:t,name:i}})}Pa.prototype=ni.prototype={constructor:Pa,on:function(n,e){var t=this._,i=Lm(n+"",t),s,r=-1,o=i.length;if(arguments.length<2){for(;++r<o;)if((s=(n=i[r]).type)&&(s=Dm(t[s],n.name)))return s;return}if(e!=null&&typeof e!="function")throw new Error("invalid callback: "+e);for(;++r<o;)if(s=(n=i[r]).type)t[s]=Bh(t[s],n.name,e);else if(e==null)for(s in t)t[s]=Bh(t[s],n.name,null);return this},copy:function(){var n={},e=this._;for(var t in e)n[t]=e[t].slice();return new Pa(n)},call:function(n,e){if((s=arguments.length-2)>0)for(var t=new Array(s),i=0,s,r;i<s;++i)t[i]=arguments[i+2];if(!this._.hasOwnProperty(n))throw new Error("unknown type: "+n);for(r=this._[n],i=0,s=r.length;i<s;++i)r[i].value.apply(e,t)},apply:function(n,e,t){if(!this._.hasOwnProperty(n))throw new Error("unknown type: "+n);for(var i=this._[n],s=0,r=i.length;s<r;++s)i[s].value.apply(e,t)}};function Dm(n,e){for(var t=0,i=n.length,s;t<i;++t)if((s=n[t]).name===e)return s.value}function Bh(n,e,t){for(var i=0,s=n.length;i<s;++i)if(n[i].name===e){n[i]=Nm,n=n.slice(0,i).concat(n.slice(i+1));break}return t!=null&&n.push({name:e,value:t}),n}var lc="http://www.w3.org/1999/xhtml",zh={svg:"http://www.w3.org/2000/svg",xhtml:lc,xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/"};function Mr(n){var e=n+="",t=e.indexOf(":");return t>=0&&(e=n.slice(0,t))!=="xmlns"&&(n=n.slice(t+1)),zh.hasOwnProperty(e)?{space:zh[e],local:n}:n}function Um(n){return function(){var e=this.ownerDocument,t=this.namespaceURI;return t===lc&&e.documentElement.namespaceURI===lc?e.createElement(n):e.createElementNS(t,n)}}function Fm(n){return function(){return this.ownerDocument.createElementNS(n.space,n.local)}}function Hh(n){var e=Mr(n);return(e.local?Fm:Um)(e)}function km(){}function La(n){return n==null?km:function(){return this.querySelector(n)}}function Om(n){typeof n!="function"&&(n=La(n));for(var e=this._groups,t=e.length,i=new Array(t),s=0;s<t;++s)for(var r=e[s],o=r.length,a=i[s]=new Array(o),l,c,u=0;u<o;++u)(l=r[u])&&(c=n.call(l,l.__data__,u,r))&&("__data__"in l&&(c.__data__=l.__data__),a[u]=c);return new dn(i,this._parents)}function Bm(n){return n==null?[]:Array.isArray(n)?n:Array.from(n)}function zm(){return[]}function uc(n){return n==null?zm:function(){return this.querySelectorAll(n)}}function Hm(n){return function(){return Bm(n.apply(this,arguments))}}function Vm(n){typeof n=="function"?n=Hm(n):n=uc(n);for(var e=this._groups,t=e.length,i=[],s=[],r=0;r<t;++r)for(var o=e[r],a=o.length,l,c=0;c<a;++c)(l=o[c])&&(i.push(n.call(l,l.__data__,c,o)),s.push(l));return new dn(i,s)}function hc(n){return function(){return this.matches(n)}}function Vh(n){return function(e){return e.matches(n)}}var Gm=Array.prototype.find;function Wm(n){return function(){return Gm.call(this.children,n)}}function Xm(){return this.firstElementChild}function Ym(n){return this.select(n==null?Xm:Wm(typeof n=="function"?n:Vh(n)))}var $m=Array.prototype.filter;function qm(){return Array.from(this.children)}function Km(n){return function(){return $m.call(this.children,n)}}function Zm(n){return this.selectAll(n==null?qm:Km(typeof n=="function"?n:Vh(n)))}function Jm(n){typeof n!="function"&&(n=hc(n));for(var e=this._groups,t=e.length,i=new Array(t),s=0;s<t;++s)for(var r=e[s],o=r.length,a=i[s]=[],l,c=0;c<o;++c)(l=r[c])&&n.call(l,l.__data__,c,r)&&a.push(l);return new dn(i,this._parents)}function Gh(n){return new Array(n.length)}function Qm(){return new dn(this._enter||this._groups.map(Gh),this._parents)}function Na(n,e){this.ownerDocument=n.ownerDocument,this.namespaceURI=n.namespaceURI,this._next=null,this._parent=n,this.__data__=e}Na.prototype={constructor:Na,appendChild:function(n){return this._parent.insertBefore(n,this._next)},insertBefore:function(n,e){return this._parent.insertBefore(n,e)},querySelector:function(n){return this._parent.querySelector(n)},querySelectorAll:function(n){return this._parent.querySelectorAll(n)}};function jm(n){return function(){return n}}function eg(n,e,t,i,s,r){for(var o=0,a,l=e.length,c=r.length;o<c;++o)(a=e[o])?(a.__data__=r[o],i[o]=a):t[o]=new Na(n,r[o]);for(;o<l;++o)(a=e[o])&&(s[o]=a)}function tg(n,e,t,i,s,r,o){var a,l,c=new Map,u=e.length,h=r.length,d=new Array(u),f;for(a=0;a<u;++a)(l=e[a])&&(d[a]=f=o.call(l,l.__data__,a,e)+"",c.has(f)?s[a]=l:c.set(f,l));for(a=0;a<h;++a)f=o.call(n,r[a],a,r)+"",(l=c.get(f))?(i[a]=l,l.__data__=r[a],c.delete(f)):t[a]=new Na(n,r[a]);for(a=0;a<u;++a)(l=e[a])&&c.get(d[a])===l&&(s[a]=l)}function ng(n){return n.__data__}function ig(n,e){if(!arguments.length)return Array.from(this,ng);var t=e?tg:eg,i=this._parents,s=this._groups;typeof n!="function"&&(n=jm(n));for(var r=s.length,o=new Array(r),a=new Array(r),l=new Array(r),c=0;c<r;++c){var u=i[c],h=s[c],d=h.length,f=sg(n.call(u,u&&u.__data__,c,i)),g=f.length,y=a[c]=new Array(g),m=o[c]=new Array(g),p=l[c]=new Array(d);t(u,h,y,m,p,f,e);for(var A=0,C=0,v,M;A<g;++A)if(v=y[A]){for(A>=C&&(C=A+1);!(M=m[C])&&++C<g;);v._next=M||null}}return o=new dn(o,i),o._enter=a,o._exit=l,o}function sg(n){return typeof n=="object"&&"length"in n?n:Array.from(n)}function rg(){return new dn(this._exit||this._groups.map(Gh),this._parents)}function ag(n,e,t){var i=this.enter(),s=this,r=this.exit();return typeof n=="function"?(i=n(i),i&&(i=i.selection())):i=i.append(n+""),e!=null&&(s=e(s),s&&(s=s.selection())),t==null?r.remove():t(r),i&&s?i.merge(s).order():s}function og(n){for(var e=n.selection?n.selection():n,t=this._groups,i=e._groups,s=t.length,r=i.length,o=Math.min(s,r),a=new Array(s),l=0;l<o;++l)for(var c=t[l],u=i[l],h=c.length,d=a[l]=new Array(h),f,g=0;g<h;++g)(f=c[g]||u[g])&&(d[g]=f);for(;l<s;++l)a[l]=t[l];return new dn(a,this._parents)}function lg(){for(var n=this._groups,e=-1,t=n.length;++e<t;)for(var i=n[e],s=i.length-1,r=i[s],o;--s>=0;)(o=i[s])&&(r&&o.compareDocumentPosition(r)^4&&r.parentNode.insertBefore(o,r),r=o);return this}function cg(n){n||(n=ug);function e(h,d){return h&&d?n(h.__data__,d.__data__):!h-!d}for(var t=this._groups,i=t.length,s=new Array(i),r=0;r<i;++r){for(var o=t[r],a=o.length,l=s[r]=new Array(a),c,u=0;u<a;++u)(c=o[u])&&(l[u]=c);l.sort(e)}return new dn(s,this._parents).order()}function ug(n,e){return n<e?-1:n>e?1:n>=e?0:NaN}function hg(){var n=arguments[0];return arguments[0]=this,n.apply(null,arguments),this}function dg(){return Array.from(this)}function fg(){for(var n=this._groups,e=0,t=n.length;e<t;++e)for(var i=n[e],s=0,r=i.length;s<r;++s){var o=i[s];if(o)return o}return null}function pg(){let n=0;for(let e of this)++n;return n}function mg(){return!this.node()}function gg(n){for(var e=this._groups,t=0,i=e.length;t<i;++t)for(var s=e[t],r=0,o=s.length,a;r<o;++r)(a=s[r])&&n.call(a,a.__data__,r,s);return this}function yg(n){return function(){this.removeAttribute(n)}}function vg(n){return function(){this.removeAttributeNS(n.space,n.local)}}function _g(n,e){return function(){this.setAttribute(n,e)}}function xg(n,e){return function(){this.setAttributeNS(n.space,n.local,e)}}function bg(n,e){return function(){var t=e.apply(this,arguments);t==null?this.removeAttribute(n):this.setAttribute(n,t)}}function Sg(n,e){return function(){var t=e.apply(this,arguments);t==null?this.removeAttributeNS(n.space,n.local):this.setAttributeNS(n.space,n.local,t)}}function Mg(n,e){var t=Mr(n);if(arguments.length<2){var i=this.node();return t.local?i.getAttributeNS(t.space,t.local):i.getAttribute(t)}return this.each((e==null?t.local?vg:yg:typeof e=="function"?t.local?Sg:bg:t.local?xg:_g)(t,e))}function Wh(n){return n.ownerDocument&&n.ownerDocument.defaultView||n.document&&n||n.defaultView}function wg(n){return function(){this.style.removeProperty(n)}}function Eg(n,e,t){return function(){this.style.setProperty(n,e,t)}}function Tg(n,e,t){return function(){var i=e.apply(this,arguments);i==null?this.style.removeProperty(n):this.style.setProperty(n,i,t)}}function Ag(n,e,t){return arguments.length>1?this.each((e==null?wg:typeof e=="function"?Tg:Eg)(n,e,t??"")):Zi(this.node(),n)}function Zi(n,e){return n.style.getPropertyValue(e)||Wh(n).getComputedStyle(n,null).getPropertyValue(e)}function Cg(n){return function(){delete this[n]}}function Rg(n,e){return function(){this[n]=e}}function Ig(n,e){return function(){var t=e.apply(this,arguments);t==null?delete this[n]:this[n]=t}}function Pg(n,e){return arguments.length>1?this.each((e==null?Cg:typeof e=="function"?Ig:Rg)(n,e)):this.node()[n]}function Xh(n){return n.trim().split(/^|\s+/)}function dc(n){return n.classList||new Yh(n)}function Yh(n){this._node=n,this._names=Xh(n.getAttribute("class")||"")}Yh.prototype={add:function(n){var e=this._names.indexOf(n);e<0&&(this._names.push(n),this._node.setAttribute("class",this._names.join(" ")))},remove:function(n){var e=this._names.indexOf(n);e>=0&&(this._names.splice(e,1),this._node.setAttribute("class",this._names.join(" ")))},contains:function(n){return this._names.indexOf(n)>=0}};function $h(n,e){for(var t=dc(n),i=-1,s=e.length;++i<s;)t.add(e[i])}function qh(n,e){for(var t=dc(n),i=-1,s=e.length;++i<s;)t.remove(e[i])}function Ng(n){return function(){$h(this,n)}}function Lg(n){return function(){qh(this,n)}}function Dg(n,e){return function(){(e.apply(this,arguments)?$h:qh)(this,n)}}function Ug(n,e){var t=Xh(n+"");if(arguments.length<2){for(var i=dc(this.node()),s=-1,r=t.length;++s<r;)if(!i.contains(t[s]))return!1;return!0}return this.each((typeof e=="function"?Dg:e?Ng:Lg)(t,e))}function Fg(){this.textContent=""}function kg(n){return function(){this.textContent=n}}function Og(n){return function(){var e=n.apply(this,arguments);this.textContent=e??""}}function Bg(n){return arguments.length?this.each(n==null?Fg:(typeof n=="function"?Og:kg)(n)):this.node().textContent}function zg(){this.innerHTML=""}function Hg(n){return function(){this.innerHTML=n}}function Vg(n){return function(){var e=n.apply(this,arguments);this.innerHTML=e??""}}function Gg(n){return arguments.length?this.each(n==null?zg:(typeof n=="function"?Vg:Hg)(n)):this.node().innerHTML}function Wg(){this.nextSibling&&this.parentNode.appendChild(this)}function Xg(){return this.each(Wg)}function Yg(){this.previousSibling&&this.parentNode.insertBefore(this,this.parentNode.firstChild)}function $g(){return this.each(Yg)}function qg(n){var e=typeof n=="function"?n:Hh(n);return this.select(function(){return this.appendChild(e.apply(this,arguments))})}function Kg(){return null}function Zg(n,e){var t=typeof n=="function"?n:Hh(n),i=e==null?Kg:typeof e=="function"?e:La(e);return this.select(function(){return this.insertBefore(t.apply(this,arguments),i.apply(this,arguments)||null)})}function Jg(){var n=this.parentNode;n&&n.removeChild(this)}function Qg(){return this.each(Jg)}function jg(){var n=this.cloneNode(!1),e=this.parentNode;return e?e.insertBefore(n,this.nextSibling):n}function e0(){var n=this.cloneNode(!0),e=this.parentNode;return e?e.insertBefore(n,this.nextSibling):n}function t0(n){return this.select(n?e0:jg)}function n0(n){return arguments.length?this.property("__data__",n):this.node().__data__}function i0(n){return function(e){n.call(this,e,this.__data__)}}function s0(n){return n.trim().split(/^|\s+/).map(function(e){var t="",i=e.indexOf(".");return i>=0&&(t=e.slice(i+1),e=e.slice(0,i)),{type:e,name:t}})}function r0(n){return function(){var e=this.__on;if(e){for(var t=0,i=-1,s=e.length,r;t<s;++t)r=e[t],(!n.type||r.type===n.type)&&r.name===n.name?this.removeEventListener(r.type,r.listener,r.options):e[++i]=r;++i?e.length=i:delete this.__on}}}function a0(n,e,t){return function(){var i=this.__on,s,r=i0(e);if(i){for(var o=0,a=i.length;o<a;++o)if((s=i[o]).type===n.type&&s.name===n.name){this.removeEventListener(s.type,s.listener,s.options),this.addEventListener(s.type,s.listener=r,s.options=t),s.value=e;return}}this.addEventListener(n.type,r,t),s={type:n.type,name:n.name,value:e,listener:r,options:t},i?i.push(s):this.__on=[s]}}function o0(n,e,t){var i=s0(n+""),s,r=i.length,o;if(arguments.length<2){var a=this.node().__on;if(a){for(var l=0,c=a.length,u;l<c;++l)for(s=0,u=a[l];s<r;++s)if((o=i[s]).type===u.type&&o.name===u.name)return u.value}return}for(a=e?a0:r0,s=0;s<r;++s)this.each(a(i[s],e,t));return this}function Kh(n,e,t){var i=Wh(n),s=i.CustomEvent;typeof s=="function"?s=new s(e,t):(s=i.document.createEvent("Event"),t?(s.initEvent(e,t.bubbles,t.cancelable),s.detail=t.detail):s.initEvent(e,!1,!1)),n.dispatchEvent(s)}function l0(n,e){return function(){return Kh(this,n,e)}}function c0(n,e){return function(){return Kh(this,n,e.apply(this,arguments))}}function u0(n,e){return this.each((typeof e=="function"?c0:l0)(n,e))}function*h0(){for(var n=this._groups,e=0,t=n.length;e<t;++e)for(var i=n[e],s=0,r=i.length,o;s<r;++s)(o=i[s])&&(yield o)}var Zh=[null];function dn(n,e){this._groups=n,this._parents=e}function Ji(){return new dn([[document.documentElement]],Zh)}function d0(){return this}dn.prototype=Ji.prototype={constructor:dn,select:Om,selectAll:Vm,selectChild:Ym,selectChildren:Zm,filter:Jm,data:ig,enter:Qm,exit:rg,join:ag,merge:og,selection:d0,order:lg,sort:cg,call:hg,nodes:dg,node:fg,size:pg,empty:mg,each:gg,attr:Mg,style:Ag,property:Pg,classed:Ug,text:Bg,html:Gg,raise:Xg,lower:$g,append:qg,insert:Zg,remove:Qg,clone:t0,datum:n0,on:o0,dispatch:u0,[Symbol.iterator]:h0};function cn(n){return typeof n=="string"?new dn([[document.querySelector(n)]],[document.documentElement]):new dn([[n]],Zh)}var f0=0;function p0(){return new cc}function cc(){this._="@"+(++f0).toString(36)}cc.prototype=p0.prototype={constructor:cc,get:function(n){for(var e=this._;!(e in n);)if(!(n=n.parentNode))return;return n[e]},set:function(n,e){return n[this._]=e},remove:function(n){return this._ in n&&delete n[this._]},toString:function(){return this._}};function m0(n){let e;for(;e=n.sourceEvent;)n=e;return n}function Tn(n,e){if(n=m0(n),e===void 0&&(e=n.currentTarget),e){var t=e.ownerSVGElement||e;if(t.createSVGPoint){var i=t.createSVGPoint();return i.x=n.clientX,i.y=n.clientY,i=i.matrixTransform(e.getScreenCTM().inverse()),[i.x,i.y]}if(e.getBoundingClientRect){var s=e.getBoundingClientRect();return[n.clientX-s.left-e.clientLeft,n.clientY-s.top-e.clientTop]}}return[n.pageX,n.pageY]}var g0={passive:!1},wr={capture:!0,passive:!1};function fc(n){n.stopImmediatePropagation()}function Is(n){n.preventDefault(),n.stopImmediatePropagation()}function mc(n){var e=n.document.documentElement,t=cn(n).on("dragstart.drag",Is,wr);"onselectstart"in e?t.on("selectstart.drag",Is,wr):(e.__noselect=e.style.MozUserSelect,e.style.MozUserSelect="none")}function gc(n,e){var t=n.document.documentElement,i=cn(n).on("dragstart.drag",null);e&&(i.on("click.drag",Is,wr),setTimeout(function(){i.on("click.drag",null)},0)),"onselectstart"in t?i.on("selectstart.drag",null):(t.style.MozUserSelect=t.__noselect,delete t.__noselect)}var Da=n=>()=>n;function pc(n,{sourceEvent:e,subject:t,target:i,identifier:s,active:r,x:o,y:a,dx:l,dy:c,dispatch:u}){Object.defineProperties(this,{type:{value:n,enumerable:!0,configurable:!0},sourceEvent:{value:e,enumerable:!0,configurable:!0},subject:{value:t,enumerable:!0,configurable:!0},target:{value:i,enumerable:!0,configurable:!0},identifier:{value:s,enumerable:!0,configurable:!0},active:{value:r,enumerable:!0,configurable:!0},x:{value:o,enumerable:!0,configurable:!0},y:{value:a,enumerable:!0,configurable:!0},dx:{value:l,enumerable:!0,configurable:!0},dy:{value:c,enumerable:!0,configurable:!0},_:{value:u}})}pc.prototype.on=function(){var n=this._.on.apply(this._,arguments);return n===this._?this:n};function y0(n){return!n.ctrlKey&&!n.button}function v0(){return this.parentNode}function _0(n,e){return e??{x:n.x,y:n.y}}function x0(){return navigator.maxTouchPoints||"ontouchstart"in this}function Jh(){var n=y0,e=v0,t=_0,i=x0,s={},r=ni("start","drag","end"),o=0,a,l,c,u,h=0;function d(v){v.on("mousedown.drag",f).filter(i).on("touchstart.drag",m).on("touchmove.drag",p,g0).on("touchend.drag touchcancel.drag",A).style("touch-action","none").style("-webkit-tap-highlight-color","rgba(0,0,0,0)")}function f(v,M){if(!(u||!n.call(this,v,M))){var E=C(this,e.call(this,v,M),v,M,"mouse");E&&(cn(v.view).on("mousemove.drag",g,wr).on("mouseup.drag",y,wr),mc(v.view),fc(v),c=!1,a=v.clientX,l=v.clientY,E("start",v))}}function g(v){if(Is(v),!c){var M=v.clientX-a,E=v.clientY-l;c=M*M+E*E>h}s.mouse("drag",v)}function y(v){cn(v.view).on("mousemove.drag mouseup.drag",null),gc(v.view,c),Is(v),s.mouse("end",v)}function m(v,M){if(n.call(this,v,M)){var E=v.changedTouches,b=e.call(this,v,M),R=E.length,_,x;for(_=0;_<R;++_)(x=C(this,b,v,M,E[_].identifier,E[_]))&&(fc(v),x("start",v,E[_]))}}function p(v){var M=v.changedTouches,E=M.length,b,R;for(b=0;b<E;++b)(R=s[M[b].identifier])&&(Is(v),R("drag",v,M[b]))}function A(v){var M=v.changedTouches,E=M.length,b,R;for(u&&clearTimeout(u),u=setTimeout(function(){u=null},500),b=0;b<E;++b)(R=s[M[b].identifier])&&(fc(v),R("end",v,M[b]))}function C(v,M,E,b,R,_){var x=r.copy(),L=Tn(_||E,M),V,F,I;if((I=t.call(v,new pc("beforestart",{sourceEvent:E,target:d,identifier:R,active:o,x:L[0],y:L[1],dx:0,dy:0,dispatch:x}),b))!=null)return V=I.x-L[0]||0,F=I.y-L[1]||0,function O(P,B,H){var ee=L,se;switch(P){case"start":s[R]=O,se=o++;break;case"end":delete s[R],--o;case"drag":L=Tn(H||B,M),se=o;break}x.call(P,v,new pc(P,{sourceEvent:B,subject:I,target:d,identifier:R,active:se,x:L[0]+V,y:L[1]+F,dx:L[0]-ee[0],dy:L[1]-ee[1],dispatch:x}),b)}}return d.filter=function(v){return arguments.length?(n=typeof v=="function"?v:Da(!!v),d):n},d.container=function(v){return arguments.length?(e=typeof v=="function"?v:Da(v),d):e},d.subject=function(v){return arguments.length?(t=typeof v=="function"?v:Da(v),d):t},d.touchable=function(v){return arguments.length?(i=typeof v=="function"?v:Da(!!v),d):i},d.on=function(){var v=r.on.apply(r,arguments);return v===r?d:v},d.clickDistance=function(v){return arguments.length?(h=(v=+v)*v,d):Math.sqrt(h)},d}function Ds(n,e,t){n.prototype=e.prototype=t,t.constructor=n}function Ar(n,e){var t=Object.create(n.prototype);for(var i in e)t[i]=e[i];return t}function Ei(){}var ts=.7,Ls=1/ts,Ps="\\s*([+-]?\\d+)\\s*",Er="\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*",zn="\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*",b0=/^#([0-9a-f]{3,8})$/,S0=new RegExp(`^rgb\\(${Ps},${Ps},${Ps}\\)$`),M0=new RegExp(`^rgb\\(${zn},${zn},${zn}\\)$`),w0=new RegExp(`^rgba\\(${Ps},${Ps},${Ps},${Er}\\)$`),E0=new RegExp(`^rgba\\(${zn},${zn},${zn},${Er}\\)$`),T0=new RegExp(`^hsl\\(${Er},${zn},${zn}\\)$`),A0=new RegExp(`^hsla\\(${Er},${zn},${zn},${Er}\\)$`),Qh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074};Ds(Ei,ns,{copy(n){return Object.assign(new this.constructor,this,n)},displayable(){return this.rgb().displayable()},hex:jh,formatHex:jh,formatHex8:C0,formatHsl:R0,formatRgb:ed,toString:ed});function jh(){return this.rgb().formatHex()}function C0(){return this.rgb().formatHex8()}function R0(){return cd(this).formatHsl()}function ed(){return this.rgb().formatRgb()}function ns(n){var e,t;return n=(n+"").trim().toLowerCase(),(e=b0.exec(n))?(t=e[1].length,e=parseInt(e[1],16),t===6?td(e):t===3?new Ft(e>>8&15|e>>4&240,e>>4&15|e&240,(e&15)<<4|e&15,1):t===8?Ua(e>>24&255,e>>16&255,e>>8&255,(e&255)/255):t===4?Ua(e>>12&15|e>>8&240,e>>8&15|e>>4&240,e>>4&15|e&240,((e&15)<<4|e&15)/255):null):(e=S0.exec(n))?new Ft(e[1],e[2],e[3],1):(e=M0.exec(n))?new Ft(e[1]*255/100,e[2]*255/100,e[3]*255/100,1):(e=w0.exec(n))?Ua(e[1],e[2],e[3],e[4]):(e=E0.exec(n))?Ua(e[1]*255/100,e[2]*255/100,e[3]*255/100,e[4]):(e=T0.exec(n))?sd(e[1],e[2]/100,e[3]/100,1):(e=A0.exec(n))?sd(e[1],e[2]/100,e[3]/100,e[4]):Qh.hasOwnProperty(n)?td(Qh[n]):n==="transparent"?new Ft(NaN,NaN,NaN,0):null}function td(n){return new Ft(n>>16&255,n>>8&255,n&255,1)}function Ua(n,e,t,i){return i<=0&&(n=e=t=NaN),new Ft(n,e,t,i)}function Sc(n){return n instanceof Ei||(n=ns(n)),n?(n=n.rgb(),new Ft(n.r,n.g,n.b,n.opacity)):new Ft}function Cr(n,e,t,i){return arguments.length===1?Sc(n):new Ft(n,e,t,i??1)}function Ft(n,e,t,i){this.r=+n,this.g=+e,this.b=+t,this.opacity=+i}Ds(Ft,Cr,Ar(Ei,{brighter(n){return n=n==null?Ls:Math.pow(Ls,n),new Ft(this.r*n,this.g*n,this.b*n,this.opacity)},darker(n){return n=n==null?ts:Math.pow(ts,n),new Ft(this.r*n,this.g*n,this.b*n,this.opacity)},rgb(){return this},clamp(){return new Ft(ji(this.r),ji(this.g),ji(this.b),ka(this.opacity))},displayable(){return-.5<=this.r&&this.r<255.5&&-.5<=this.g&&this.g<255.5&&-.5<=this.b&&this.b<255.5&&0<=this.opacity&&this.opacity<=1},hex:nd,formatHex:nd,formatHex8:I0,formatRgb:id,toString:id}));function nd(){return`#${Qi(this.r)}${Qi(this.g)}${Qi(this.b)}`}function I0(){return`#${Qi(this.r)}${Qi(this.g)}${Qi(this.b)}${Qi((isNaN(this.opacity)?1:this.opacity)*255)}`}function id(){let n=ka(this.opacity);return`${n===1?"rgb(":"rgba("}${ji(this.r)}, ${ji(this.g)}, ${ji(this.b)}${n===1?")":`, ${n})`}`}function ka(n){return isNaN(n)?1:Math.max(0,Math.min(1,n))}function ji(n){return Math.max(0,Math.min(255,Math.round(n)||0))}function Qi(n){return n=ji(n),(n<16?"0":"")+n.toString(16)}function sd(n,e,t,i){return i<=0?n=e=t=NaN:t<=0||t>=1?n=e=NaN:e<=0&&(n=NaN),new An(n,e,t,i)}function cd(n){if(n instanceof An)return new An(n.h,n.s,n.l,n.opacity);if(n instanceof Ei||(n=ns(n)),!n)return new An;if(n instanceof An)return n;n=n.rgb();var e=n.r/255,t=n.g/255,i=n.b/255,s=Math.min(e,t,i),r=Math.max(e,t,i),o=NaN,a=r-s,l=(r+s)/2;return a?(e===r?o=(t-i)/a+(t<i)*6:t===r?o=(i-e)/a+2:o=(e-t)/a+4,a/=l<.5?r+s:2-r-s,o*=60):a=l>0&&l<1?0:o,new An(o,a,l,n.opacity)}function Ba(n,e,t,i){return arguments.length===1?cd(n):new An(n,e,t,i??1)}function An(n,e,t,i){this.h=+n,this.s=+e,this.l=+t,this.opacity=+i}Ds(An,Ba,Ar(Ei,{brighter(n){return n=n==null?Ls:Math.pow(Ls,n),new An(this.h,this.s,this.l*n,this.opacity)},darker(n){return n=n==null?ts:Math.pow(ts,n),new An(this.h,this.s,this.l*n,this.opacity)},rgb(){var n=this.h%360+(this.h<0)*360,e=isNaN(n)||isNaN(this.s)?0:this.s,t=this.l,i=t+(t<.5?t:1-t)*e,s=2*t-i;return new Ft(yc(n>=240?n-240:n+120,s,i),yc(n,s,i),yc(n<120?n+240:n-120,s,i),this.opacity)},clamp(){return new An(rd(this.h),Fa(this.s),Fa(this.l),ka(this.opacity))},displayable(){return(0<=this.s&&this.s<=1||isNaN(this.s))&&0<=this.l&&this.l<=1&&0<=this.opacity&&this.opacity<=1},formatHsl(){let n=ka(this.opacity);return`${n===1?"hsl(":"hsla("}${rd(this.h)}, ${Fa(this.s)*100}%, ${Fa(this.l)*100}%${n===1?")":`, ${n})`}`}}));function rd(n){return n=(n||0)%360,n<0?n+360:n}function Fa(n){return Math.max(0,Math.min(1,n||0))}function yc(n,e,t){return(n<60?e+(t-e)*n/60:n<180?t:n<240?e+(t-e)*(240-n)/60:e)*255}var ud=Math.PI/180,hd=180/Math.PI,Oa=18,dd=.96422,fd=1,pd=.82521,md=4/29,Ns=6/29,gd=3*Ns*Ns,P0=Ns*Ns*Ns;function yd(n){if(n instanceof Hn)return new Hn(n.l,n.a,n.b,n.opacity);if(n instanceof ii)return _d(n);n instanceof Ft||(n=Sc(n));var e=bc(n.r),t=bc(n.g),i=bc(n.b),s=vc((.2225045*e+.7168786*t+.0606169*i)/fd),r,o;return e===t&&t===i?r=o=s:(r=vc((.4360747*e+.3850649*t+.1430804*i)/dd),o=vc((.0139322*e+.0971045*t+.7141733*i)/pd)),new Hn(116*s-16,500*(r-s),200*(s-o),n.opacity)}function vd(n,e,t,i){return arguments.length===1?yd(n):new Hn(n,e,t,i??1)}function Hn(n,e,t,i){this.l=+n,this.a=+e,this.b=+t,this.opacity=+i}Ds(Hn,vd,Ar(Ei,{brighter(n){return new Hn(this.l+Oa*(n??1),this.a,this.b,this.opacity)},darker(n){return new Hn(this.l-Oa*(n??1),this.a,this.b,this.opacity)},rgb(){var n=(this.l+16)/116,e=isNaN(this.a)?n:n+this.a/500,t=isNaN(this.b)?n:n-this.b/200;return e=dd*_c(e),n=fd*_c(n),t=pd*_c(t),new Ft(xc(3.1338561*e-1.6168667*n-.4906146*t),xc(-.9787684*e+1.9161415*n+.033454*t),xc(.0719453*e-.2289914*n+1.4052427*t),this.opacity)}}));function vc(n){return n>P0?Math.pow(n,1/3):n/gd+md}function _c(n){return n>Ns?n*n*n:gd*(n-md)}function xc(n){return 255*(n<=.0031308?12.92*n:1.055*Math.pow(n,1/2.4)-.055)}function bc(n){return(n/=255)<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4)}function N0(n){if(n instanceof ii)return new ii(n.h,n.c,n.l,n.opacity);if(n instanceof Hn||(n=yd(n)),n.a===0&&n.b===0)return new ii(NaN,0<n.l&&n.l<100?0:NaN,n.l,n.opacity);var e=Math.atan2(n.b,n.a)*hd;return new ii(e<0?e+360:e,Math.sqrt(n.a*n.a+n.b*n.b),n.l,n.opacity)}function za(n,e,t,i){return arguments.length===1?N0(n):new ii(n,e,t,i??1)}function ii(n,e,t,i){this.h=+n,this.c=+e,this.l=+t,this.opacity=+i}function _d(n){if(isNaN(n.h))return new Hn(n.l,0,0,n.opacity);var e=n.h*ud;return new Hn(n.l,Math.cos(e)*n.c,Math.sin(e)*n.c,n.opacity)}Ds(ii,za,Ar(Ei,{brighter(n){return new ii(this.h,this.c,this.l+Oa*(n??1),this.opacity)},darker(n){return new ii(this.h,this.c,this.l-Oa*(n??1),this.opacity)},rgb(){return _d(this).rgb()}}));var xd=-.14861,Mc=1.78277,wc=-.29227,Ha=-.90649,Tr=1.97294,ad=Tr*Ha,od=Tr*Mc,ld=Mc*wc-Ha*xd;function L0(n){if(n instanceof es)return new es(n.h,n.s,n.l,n.opacity);n instanceof Ft||(n=Sc(n));var e=n.r/255,t=n.g/255,i=n.b/255,s=(ld*i+ad*e-od*t)/(ld+ad-od),r=i-s,o=(Tr*(t-s)-wc*r)/Ha,a=Math.sqrt(o*o+r*r)/(Tr*s*(1-s)),l=a?Math.atan2(o,r)*hd-120:NaN;return new es(l<0?l+360:l,a,s,n.opacity)}function Va(n,e,t,i){return arguments.length===1?L0(n):new es(n,e,t,i??1)}function es(n,e,t,i){this.h=+n,this.s=+e,this.l=+t,this.opacity=+i}Ds(es,Va,Ar(Ei,{brighter(n){return n=n==null?Ls:Math.pow(Ls,n),new es(this.h,this.s,this.l*n,this.opacity)},darker(n){return n=n==null?ts:Math.pow(ts,n),new es(this.h,this.s,this.l*n,this.opacity)},rgb(){var n=isNaN(this.h)?0:(this.h+120)*ud,e=+this.l,t=isNaN(this.s)?0:this.s*e*(1-e),i=Math.cos(n),s=Math.sin(n);return new Ft(255*(e+t*(xd*i+Mc*s)),255*(e+t*(wc*i+Ha*s)),255*(e+t*(Tr*i)),this.opacity)}}));function Md(n,e,t,i,s){var r=n*n,o=r*n;return((1-3*n+3*r-o)*e+(4-6*r+3*o)*t+(1+3*n+3*r-3*o)*i+o*s)/6}function D0(n){var e=n.length-1;return function(t){var i=t<=0?t=0:t>=1?(t=1,e-1):Math.floor(t*e),s=n[i],r=n[i+1],o=i>0?n[i-1]:2*s-r,a=i<e-1?n[i+2]:2*r-s;return Md((t-i/e)*e,o,s,r,a)}}function U0(n){var e=n.length;return function(t){var i=Math.floor(((t%=1)<0?++t:t)*e),s=n[(i+e-1)%e],r=n[i%e],o=n[(i+1)%e],a=n[(i+2)%e];return Md((t-i/e)*e,s,r,o,a)}}var Cc=n=>()=>n;function wd(n,e){return function(t){return n+t*e}}function F0(n,e,t){return n=Math.pow(n,t),e=Math.pow(e,t)-n,t=1/t,function(i){return Math.pow(n+i*e,t)}}function Rc(n,e){var t=e-n;return t?wd(n,t>180||t<-180?t-360*Math.round(t/360):t):Cc(isNaN(n)?e:n)}function k0(n){return(n=+n)==1?un:function(e,t){return t-e?F0(e,t,n):Cc(isNaN(e)?t:e)}}function un(n,e){var t=e-n;return t?wd(n,t):Cc(isNaN(n)?e:n)}var Ic=(function n(e){var t=k0(e);function i(s,r){var o=t((s=Cr(s)).r,(r=Cr(r)).r),a=t(s.g,r.g),l=t(s.b,r.b),c=un(s.opacity,r.opacity);return function(u){return s.r=o(u),s.g=a(u),s.b=l(u),s.opacity=c(u),s+""}}return i.gamma=n,i})(1);function Ed(n){return function(e){var t=e.length,i=new Array(t),s=new Array(t),r=new Array(t),o,a;for(o=0;o<t;++o)a=Cr(e[o]),i[o]=a.r||0,s[o]=a.g||0,r[o]=a.b||0;return i=n(i),s=n(s),r=n(r),a.opacity=1,function(l){return a.r=i(l),a.g=s(l),a.b=r(l),a+""}}}var Kw=Ed(D0),Zw=Ed(U0);function si(n,e){return n=+n,e=+e,function(t){return n*(1-t)+e*t}}var Tc=/[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,Ec=new RegExp(Tc.source,"g");function O0(n){return function(){return n}}function B0(n){return function(e){return n(e)+""}}function Td(n,e){var t=Tc.lastIndex=Ec.lastIndex=0,i,s,r,o=-1,a=[],l=[];for(n=n+"",e=e+"";(i=Tc.exec(n))&&(s=Ec.exec(e));)(r=s.index)>t&&(r=e.slice(t,r),a[o]?a[o]+=r:a[++o]=r),(i=i[0])===(s=s[0])?a[o]?a[o]+=s:a[++o]=s:(a[++o]=null,l.push({i:o,x:si(i,s)})),t=Ec.lastIndex;return t<e.length&&(r=e.slice(t),a[o]?a[o]+=r:a[++o]=r),a.length<2?l[0]?B0(l[0].x):O0(e):(e=l.length,function(c){for(var u=0,h;u<e;++u)a[(h=l[u]).i]=h.x(c);return a.join("")})}var bd=180/Math.PI,Ac={translateX:0,translateY:0,rotate:0,skewX:0,scaleX:1,scaleY:1};function Ad(n,e,t,i,s,r){var o,a,l;return(o=Math.sqrt(n*n+e*e))&&(n/=o,e/=o),(l=n*t+e*i)&&(t-=n*l,i-=e*l),(a=Math.sqrt(t*t+i*i))&&(t/=a,i/=a,l/=a),n*i<e*t&&(n=-n,e=-e,l=-l,o=-o),{translateX:s,translateY:r,rotate:Math.atan2(e,n)*bd,skewX:Math.atan(l)*bd,scaleX:o,scaleY:a}}var Ga;function z0(n){let e=new(typeof DOMMatrix=="function"?DOMMatrix:WebKitCSSMatrix)(n+"");return e.isIdentity?Ac:Ad(e.a,e.b,e.c,e.d,e.e,e.f)}function H0(n){return n==null||(Ga||(Ga=document.createElementNS("http://www.w3.org/2000/svg","g")),Ga.setAttribute("transform",n),!(n=Ga.transform.baseVal.consolidate()))?Ac:(n=n.matrix,Ad(n.a,n.b,n.c,n.d,n.e,n.f))}function Cd(n,e,t,i){function s(c){return c.length?c.pop()+" ":""}function r(c,u,h,d,f,g){if(c!==h||u!==d){var y=f.push("translate(",null,e,null,t);g.push({i:y-4,x:si(c,h)},{i:y-2,x:si(u,d)})}else(h||d)&&f.push("translate("+h+e+d+t)}function o(c,u,h,d){c!==u?(c-u>180?u+=360:u-c>180&&(c+=360),d.push({i:h.push(s(h)+"rotate(",null,i)-2,x:si(c,u)})):u&&h.push(s(h)+"rotate("+u+i)}function a(c,u,h,d){c!==u?d.push({i:h.push(s(h)+"skewX(",null,i)-2,x:si(c,u)}):u&&h.push(s(h)+"skewX("+u+i)}function l(c,u,h,d,f,g){if(c!==h||u!==d){var y=f.push(s(f)+"scale(",null,",",null,")");g.push({i:y-4,x:si(c,h)},{i:y-2,x:si(u,d)})}else(h!==1||d!==1)&&f.push(s(f)+"scale("+h+","+d+")")}return function(c,u){var h=[],d=[];return c=n(c),u=n(u),r(c.translateX,c.translateY,u.translateX,u.translateY,h,d),o(c.rotate,u.rotate,h,d),a(c.skewX,u.skewX,h,d),l(c.scaleX,c.scaleY,u.scaleX,u.scaleY,h,d),c=u=null,function(f){for(var g=-1,y=d.length,m;++g<y;)h[(m=d[g]).i]=m.x(f);return h.join("")}}}var Rd=Cd(z0,"px, ","px)","deg)"),Id=Cd(H0,", ",")",")"),V0=1e-12;function Sd(n){return((n=Math.exp(n))+1/n)/2}function G0(n){return((n=Math.exp(n))-1/n)/2}function W0(n){return((n=Math.exp(2*n))-1)/(n+1)}var Pd=(function n(e,t,i){function s(r,o){var a=r[0],l=r[1],c=r[2],u=o[0],h=o[1],d=o[2],f=u-a,g=h-l,y=f*f+g*g,m,p;if(y<V0)p=Math.log(d/c)/e,m=function(b){return[a+b*f,l+b*g,c*Math.exp(e*b*p)]};else{var A=Math.sqrt(y),C=(d*d-c*c+i*y)/(2*c*t*A),v=(d*d-c*c-i*y)/(2*d*t*A),M=Math.log(Math.sqrt(C*C+1)-C),E=Math.log(Math.sqrt(v*v+1)-v);p=(E-M)/e,m=function(b){var R=b*p,_=Sd(M),x=c/(t*A)*(_*W0(e*R+M)-G0(M));return[a+x*f,l+x*g,c*_/Sd(e*R+M)]}}return m.duration=Math.abs(p)*1e3*e/Math.SQRT2,m}return s.rho=function(r){var o=Math.max(.001,+r),a=o*o,l=a*a;return n(o,a,l)},s})(Math.SQRT2,2,4);function Nd(n){return function(e,t){var i=n((e=Ba(e)).h,(t=Ba(t)).h),s=un(e.s,t.s),r=un(e.l,t.l),o=un(e.opacity,t.opacity);return function(a){return e.h=i(a),e.s=s(a),e.l=r(a),e.opacity=o(a),e+""}}}var Jw=Nd(Rc),Qw=Nd(un);function Ld(n){return function(e,t){var i=n((e=za(e)).h,(t=za(t)).h),s=un(e.c,t.c),r=un(e.l,t.l),o=un(e.opacity,t.opacity);return function(a){return e.h=i(a),e.c=s(a),e.l=r(a),e.opacity=o(a),e+""}}}var jw=Ld(Rc),e1=Ld(un);function Dd(n){return(function e(t){t=+t;function i(s,r){var o=n((s=Va(s)).h,(r=Va(r)).h),a=un(s.s,r.s),l=un(s.l,r.l),c=un(s.opacity,r.opacity);return function(u){return s.h=o(u),s.s=a(u),s.l=l(Math.pow(u,t)),s.opacity=c(u),s+""}}return i.gamma=e,i})(1)}var t1=Dd(Rc),n1=Dd(un);var Us=0,Ir=0,Rr=0,Fd=1e3,Wa,Pr,Xa=0,is=0,$a=0,Nr=typeof performance=="object"&&performance.now?performance:Date,kd=typeof window=="object"&&window.requestAnimationFrame?window.requestAnimationFrame.bind(window):function(n){setTimeout(n,17)};function qa(){return is||(kd(X0),is=Nr.now()+$a)}function X0(){is=0}function Ya(){this._call=this._time=this._next=null}Ya.prototype=Lr.prototype={constructor:Ya,restart:function(n,e,t){if(typeof n!="function")throw new TypeError("callback is not a function");t=(t==null?qa():+t)+(e==null?0:+e),!this._next&&Pr!==this&&(Pr?Pr._next=this:Wa=this,Pr=this),this._call=n,this._time=t,Pc()},stop:function(){this._call&&(this._call=null,this._time=1/0,Pc())}};function Lr(n,e,t){var i=new Ya;return i.restart(n,e,t),i}function Y0(){qa(),++Us;for(var n=Wa,e;n;)(e=is-n._time)>=0&&n._call.call(void 0,e),n=n._next;--Us}function Ud(){is=(Xa=Nr.now())+$a,Us=Ir=0;try{Y0()}finally{Us=0,q0(),is=0}}function $0(){var n=Nr.now(),e=n-Xa;e>Fd&&($a-=e,Xa=n)}function q0(){for(var n,e=Wa,t,i=1/0;e;)e._call?(i>e._time&&(i=e._time),n=e,e=e._next):(t=e._next,e._next=null,e=n?n._next=t:Wa=t);Pr=n,Pc(i)}function Pc(n){if(!Us){Ir&&(Ir=clearTimeout(Ir));var e=n-is;e>24?(n<1/0&&(Ir=setTimeout(Ud,Math.ceil(n-Nr.now()-$a)+1)),Rr&&(Rr=clearInterval(Rr))):(Rr||(Xa=Nr.now(),Rr=setInterval($0,Fd)),Us=1,kd(Ud))}}function Nc(n,e,t){var i=new Ya;return e=e==null?0:+e,i.restart(s=>{i.stop(),n(s+e)},e,t),i}function Bd(n){return((n*=2)<=1?n*n*n:(n-=2)*n*n+2)/2}var Lc=3,r1=(function n(e){e=+e;function t(i){return Math.pow(i,e)}return t.exponent=n,t})(Lc),a1=(function n(e){e=+e;function t(i){return 1-Math.pow(1-i,e)}return t.exponent=n,t})(Lc),o1=(function n(e){e=+e;function t(i){return((i*=2)<=1?Math.pow(i,e):2-Math.pow(2-i,e))/2}return t.exponent=n,t})(Lc),K0=Math.PI,l1=K0/2;function Ka(n){return(Math.pow(2,-10*n)-.0009765625)*1.0009775171065494}var Od=4/11,c1=6/11,u1=8/11,h1=3/4,d1=9/11,f1=10/11,p1=15/16,m1=21/22,g1=63/64,y1=1/Od/Od;var Dc=1.70158,v1=(function n(e){e=+e;function t(i){return(i=+i)*i*(e*(i-1)+i)}return t.overshoot=n,t})(Dc),_1=(function n(e){e=+e;function t(i){return--i*i*((i+1)*e+i)+1}return t.overshoot=n,t})(Dc),x1=(function n(e){e=+e;function t(i){return((i*=2)<1?i*i*((e+1)*i-e):(i-=2)*i*((e+1)*i+e)+2)/2}return t.overshoot=n,t})(Dc),Fs=2*Math.PI,Uc=1,Fc=.3,b1=(function n(e,t){var i=Math.asin(1/(e=Math.max(1,e)))*(t/=Fs);function s(r){return e*Ka(- --r)*Math.sin((i-r)/t)}return s.amplitude=function(r){return n(r,t*Fs)},s.period=function(r){return n(e,r)},s})(Uc,Fc),S1=(function n(e,t){var i=Math.asin(1/(e=Math.max(1,e)))*(t/=Fs);function s(r){return 1-e*Ka(r=+r)*Math.sin((r+i)/t)}return s.amplitude=function(r){return n(r,t*Fs)},s.period=function(r){return n(e,r)},s})(Uc,Fc),M1=(function n(e,t){var i=Math.asin(1/(e=Math.max(1,e)))*(t/=Fs);function s(r){return((r=r*2-1)<0?e*Ka(-r)*Math.sin((i-r)/t):2-e*Ka(r)*Math.sin((i+r)/t))/2}return s.amplitude=function(r){return n(r,t*Fs)},s.period=function(r){return n(e,r)},s})(Uc,Fc);var Z0=ni("start","end","cancel","interrupt"),J0=[],Vd=0,zd=1,kc=2,Za=3,Hd=4,Oc=5,Ja=6;function Qa(n,e,t,i,s,r){var o=n.__transition;if(!o)n.__transition={};else if(t in o)return;Q0(n,t,{name:e,index:i,group:s,on:Z0,tween:J0,time:r.time,delay:r.delay,duration:r.duration,ease:r.ease,timer:null,state:Vd})}function Bc(n,e){var t=Cn(n,e);if(t.state>Vd)throw new Error("too late; already scheduled");return t}function Vn(n,e){var t=Cn(n,e);if(t.state>Za)throw new Error("too late; already running");return t}function Cn(n,e){var t=n.__transition;if(!t||!(t=t[e]))throw new Error("transition not found");return t}function Q0(n,e,t){var i=n.__transition,s;i[e]=t,t.timer=Lr(r,0,t.time);function r(c){t.state=zd,t.timer.restart(o,t.delay,t.time),t.delay<=c&&o(c-t.delay)}function o(c){var u,h,d,f;if(t.state!==zd)return l();for(u in i)if(f=i[u],f.name===t.name){if(f.state===Za)return Nc(o);f.state===Hd?(f.state=Ja,f.timer.stop(),f.on.call("interrupt",n,n.__data__,f.index,f.group),delete i[u]):+u<e&&(f.state=Ja,f.timer.stop(),f.on.call("cancel",n,n.__data__,f.index,f.group),delete i[u])}if(Nc(function(){t.state===Za&&(t.state=Hd,t.timer.restart(a,t.delay,t.time),a(c))}),t.state=kc,t.on.call("start",n,n.__data__,t.index,t.group),t.state===kc){for(t.state=Za,s=new Array(d=t.tween.length),u=0,h=-1;u<d;++u)(f=t.tween[u].value.call(n,n.__data__,t.index,t.group))&&(s[++h]=f);s.length=h+1}}function a(c){for(var u=c<t.duration?t.ease.call(null,c/t.duration):(t.timer.restart(l),t.state=Oc,1),h=-1,d=s.length;++h<d;)s[h].call(n,u);t.state===Oc&&(t.on.call("end",n,n.__data__,t.index,t.group),l())}function l(){t.state=Ja,t.timer.stop(),delete i[e];for(var c in i)return;delete n.__transition}}function Dr(n,e){var t=n.__transition,i,s,r=!0,o;if(t){e=e==null?null:e+"";for(o in t){if((i=t[o]).name!==e){r=!1;continue}s=i.state>kc&&i.state<Oc,i.state=Ja,i.timer.stop(),i.on.call(s?"interrupt":"cancel",n,n.__data__,i.index,i.group),delete t[o]}r&&delete n.__transition}}function j0(n){return this.each(function(){Dr(this,n)})}function ey(n,e){var t,i;return function(){var s=Vn(this,n),r=s.tween;if(r!==t){i=t=r;for(var o=0,a=i.length;o<a;++o)if(i[o].name===e){i=i.slice(),i.splice(o,1);break}}s.tween=i}}function ty(n,e,t){var i,s;if(typeof t!="function")throw new Error;return function(){var r=Vn(this,n),o=r.tween;if(o!==i){s=(i=o).slice();for(var a={name:e,value:t},l=0,c=s.length;l<c;++l)if(s[l].name===e){s[l]=a;break}l===c&&s.push(a)}r.tween=s}}function ny(n,e){var t=this._id;if(n+="",arguments.length<2){for(var i=Cn(this.node(),t).tween,s=0,r=i.length,o;s<r;++s)if((o=i[s]).name===n)return o.value;return null}return this.each((e==null?ey:ty)(t,n,e))}function zc(n,e,t){var i=n._id;return n.each(function(){var s=Vn(this,i);(s.value||(s.value={}))[e]=t.apply(this,arguments)}),function(s){return Cn(s,i).value[e]}}function Gd(n,e){var t;return(typeof e=="number"?si:e instanceof ns?Ic:(t=ns(e))?(e=t,Ic):Td)(n,e)}function iy(n){return function(){this.removeAttribute(n)}}function sy(n){return function(){this.removeAttributeNS(n.space,n.local)}}function ry(n,e,t){var i,s=t+"",r;return function(){var o=this.getAttribute(n);return o===s?null:o===i?r:r=e(i=o,t)}}function ay(n,e,t){var i,s=t+"",r;return function(){var o=this.getAttributeNS(n.space,n.local);return o===s?null:o===i?r:r=e(i=o,t)}}function oy(n,e,t){var i,s,r;return function(){var o,a=t(this),l;return a==null?void this.removeAttribute(n):(o=this.getAttribute(n),l=a+"",o===l?null:o===i&&l===s?r:(s=l,r=e(i=o,a)))}}function ly(n,e,t){var i,s,r;return function(){var o,a=t(this),l;return a==null?void this.removeAttributeNS(n.space,n.local):(o=this.getAttributeNS(n.space,n.local),l=a+"",o===l?null:o===i&&l===s?r:(s=l,r=e(i=o,a)))}}function cy(n,e){var t=Mr(n),i=t==="transform"?Id:Gd;return this.attrTween(n,typeof e=="function"?(t.local?ly:oy)(t,i,zc(this,"attr."+n,e)):e==null?(t.local?sy:iy)(t):(t.local?ay:ry)(t,i,e))}function uy(n,e){return function(t){this.setAttribute(n,e.call(this,t))}}function hy(n,e){return function(t){this.setAttributeNS(n.space,n.local,e.call(this,t))}}function dy(n,e){var t,i;function s(){var r=e.apply(this,arguments);return r!==i&&(t=(i=r)&&hy(n,r)),t}return s._value=e,s}function fy(n,e){var t,i;function s(){var r=e.apply(this,arguments);return r!==i&&(t=(i=r)&&uy(n,r)),t}return s._value=e,s}function py(n,e){var t="attr."+n;if(arguments.length<2)return(t=this.tween(t))&&t._value;if(e==null)return this.tween(t,null);if(typeof e!="function")throw new Error;var i=Mr(n);return this.tween(t,(i.local?dy:fy)(i,e))}function my(n,e){return function(){Bc(this,n).delay=+e.apply(this,arguments)}}function gy(n,e){return e=+e,function(){Bc(this,n).delay=e}}function yy(n){var e=this._id;return arguments.length?this.each((typeof n=="function"?my:gy)(e,n)):Cn(this.node(),e).delay}function vy(n,e){return function(){Vn(this,n).duration=+e.apply(this,arguments)}}function _y(n,e){return e=+e,function(){Vn(this,n).duration=e}}function xy(n){var e=this._id;return arguments.length?this.each((typeof n=="function"?vy:_y)(e,n)):Cn(this.node(),e).duration}function by(n,e){if(typeof e!="function")throw new Error;return function(){Vn(this,n).ease=e}}function Sy(n){var e=this._id;return arguments.length?this.each(by(e,n)):Cn(this.node(),e).ease}function My(n,e){return function(){var t=e.apply(this,arguments);if(typeof t!="function")throw new Error;Vn(this,n).ease=t}}function wy(n){if(typeof n!="function")throw new Error;return this.each(My(this._id,n))}function Ey(n){typeof n!="function"&&(n=hc(n));for(var e=this._groups,t=e.length,i=new Array(t),s=0;s<t;++s)for(var r=e[s],o=r.length,a=i[s]=[],l,c=0;c<o;++c)(l=r[c])&&n.call(l,l.__data__,c,r)&&a.push(l);return new ai(i,this._parents,this._name,this._id)}function Ty(n){if(n._id!==this._id)throw new Error;for(var e=this._groups,t=n._groups,i=e.length,s=t.length,r=Math.min(i,s),o=new Array(i),a=0;a<r;++a)for(var l=e[a],c=t[a],u=l.length,h=o[a]=new Array(u),d,f=0;f<u;++f)(d=l[f]||c[f])&&(h[f]=d);for(;a<i;++a)o[a]=e[a];return new ai(o,this._parents,this._name,this._id)}function Ay(n){return(n+"").trim().split(/^|\s+/).every(function(e){var t=e.indexOf(".");return t>=0&&(e=e.slice(0,t)),!e||e==="start"})}function Cy(n,e,t){var i,s,r=Ay(e)?Bc:Vn;return function(){var o=r(this,n),a=o.on;a!==i&&(s=(i=a).copy()).on(e,t),o.on=s}}function Ry(n,e){var t=this._id;return arguments.length<2?Cn(this.node(),t).on.on(n):this.each(Cy(t,n,e))}function Iy(n){return function(){var e=this.parentNode;for(var t in this.__transition)if(+t!==n)return;e&&e.removeChild(this)}}function Py(){return this.on("end.remove",Iy(this._id))}function Ny(n){var e=this._name,t=this._id;typeof n!="function"&&(n=La(n));for(var i=this._groups,s=i.length,r=new Array(s),o=0;o<s;++o)for(var a=i[o],l=a.length,c=r[o]=new Array(l),u,h,d=0;d<l;++d)(u=a[d])&&(h=n.call(u,u.__data__,d,a))&&("__data__"in u&&(h.__data__=u.__data__),c[d]=h,Qa(c[d],e,t,d,c,Cn(u,t)));return new ai(r,this._parents,e,t)}function Ly(n){var e=this._name,t=this._id;typeof n!="function"&&(n=uc(n));for(var i=this._groups,s=i.length,r=[],o=[],a=0;a<s;++a)for(var l=i[a],c=l.length,u,h=0;h<c;++h)if(u=l[h]){for(var d=n.call(u,u.__data__,h,l),f,g=Cn(u,t),y=0,m=d.length;y<m;++y)(f=d[y])&&Qa(f,e,t,y,d,g);r.push(d),o.push(u)}return new ai(r,o,e,t)}var Dy=Ji.prototype.constructor;function Uy(){return new Dy(this._groups,this._parents)}function Fy(n,e){var t,i,s;return function(){var r=Zi(this,n),o=(this.style.removeProperty(n),Zi(this,n));return r===o?null:r===t&&o===i?s:s=e(t=r,i=o)}}function Wd(n){return function(){this.style.removeProperty(n)}}function ky(n,e,t){var i,s=t+"",r;return function(){var o=Zi(this,n);return o===s?null:o===i?r:r=e(i=o,t)}}function Oy(n,e,t){var i,s,r;return function(){var o=Zi(this,n),a=t(this),l=a+"";return a==null&&(l=a=(this.style.removeProperty(n),Zi(this,n))),o===l?null:o===i&&l===s?r:(s=l,r=e(i=o,a))}}function By(n,e){var t,i,s,r="style."+e,o="end."+r,a;return function(){var l=Vn(this,n),c=l.on,u=l.value[r]==null?a||(a=Wd(e)):void 0;(c!==t||s!==u)&&(i=(t=c).copy()).on(o,s=u),l.on=i}}function zy(n,e,t){var i=(n+="")=="transform"?Rd:Gd;return e==null?this.styleTween(n,Fy(n,i)).on("end.style."+n,Wd(n)):typeof e=="function"?this.styleTween(n,Oy(n,i,zc(this,"style."+n,e))).each(By(this._id,n)):this.styleTween(n,ky(n,i,e),t).on("end.style."+n,null)}function Hy(n,e,t){return function(i){this.style.setProperty(n,e.call(this,i),t)}}function Vy(n,e,t){var i,s;function r(){var o=e.apply(this,arguments);return o!==s&&(i=(s=o)&&Hy(n,o,t)),i}return r._value=e,r}function Gy(n,e,t){var i="style."+(n+="");if(arguments.length<2)return(i=this.tween(i))&&i._value;if(e==null)return this.tween(i,null);if(typeof e!="function")throw new Error;return this.tween(i,Vy(n,e,t??""))}function Wy(n){return function(){this.textContent=n}}function Xy(n){return function(){var e=n(this);this.textContent=e??""}}function Yy(n){return this.tween("text",typeof n=="function"?Xy(zc(this,"text",n)):Wy(n==null?"":n+""))}function $y(n){return function(e){this.textContent=n.call(this,e)}}function qy(n){var e,t;function i(){var s=n.apply(this,arguments);return s!==t&&(e=(t=s)&&$y(s)),e}return i._value=n,i}function Ky(n){var e="text";if(arguments.length<1)return(e=this.tween(e))&&e._value;if(n==null)return this.tween(e,null);if(typeof n!="function")throw new Error;return this.tween(e,qy(n))}function Zy(){for(var n=this._name,e=this._id,t=Xd(),i=this._groups,s=i.length,r=0;r<s;++r)for(var o=i[r],a=o.length,l,c=0;c<a;++c)if(l=o[c]){var u=Cn(l,e);Qa(l,n,t,c,o,{time:u.time+u.delay+u.duration,delay:0,duration:u.duration,ease:u.ease})}return new ai(i,this._parents,n,t)}function Jy(){var n,e,t=this,i=t._id,s=t.size();return new Promise(function(r,o){var a={value:o},l={value:function(){--s===0&&r()}};t.each(function(){var c=Vn(this,i),u=c.on;u!==n&&(e=(n=u).copy(),e._.cancel.push(a),e._.interrupt.push(a),e._.end.push(l)),c.on=e}),s===0&&r()})}var Qy=0;function ai(n,e,t,i){this._groups=n,this._parents=e,this._name=t,this._id=i}function jy(n){return Ji().transition(n)}function Xd(){return++Qy}var ri=Ji.prototype;ai.prototype=jy.prototype={constructor:ai,select:Ny,selectAll:Ly,selectChild:ri.selectChild,selectChildren:ri.selectChildren,filter:Ey,merge:Ty,selection:Uy,transition:Zy,call:ri.call,nodes:ri.nodes,node:ri.node,size:ri.size,empty:ri.empty,each:ri.each,on:Ry,attr:cy,attrTween:py,style:zy,styleTween:Gy,text:Yy,textTween:Ky,remove:Py,tween:ny,delay:yy,duration:xy,ease:Sy,easeVarying:wy,end:Jy,[Symbol.iterator]:ri[Symbol.iterator]};var ev={time:null,delay:0,duration:250,ease:Bd};function tv(n,e){for(var t;!(t=n.__transition)||!(t=t[e]);)if(!(n=n.parentNode))throw new Error(`transition ${e} not found`);return t}function nv(n){var e,t;n instanceof ai?(e=n._id,n=n._name):(e=Xd(),(t=ev).time=qa(),n=n==null?null:n+"");for(var i=this._groups,s=i.length,r=0;r<s;++r)for(var o=i[r],a=o.length,l,c=0;c<a;++c)(l=o[c])&&Qa(l,n,e,c,o,t||tv(l,e));return new ai(i,this._parents,n,e)}Ji.prototype.interrupt=j0;Ji.prototype.transition=nv;function iv(n){let e=+this._x.call(null,n),t=+this._y.call(null,n);return $d(this.cover(e,t),e,t,n)}function $d(n,e,t,i){if(isNaN(e)||isNaN(t))return n;var s,r=n._root,o={data:i},a=n._x0,l=n._y0,c=n._x1,u=n._y1,h,d,f,g,y,m,p,A;if(!r)return n._root=o,n;for(;r.length;)if((y=e>=(h=(a+c)/2))?a=h:c=h,(m=t>=(d=(l+u)/2))?l=d:u=d,s=r,!(r=r[p=m<<1|y]))return s[p]=o,n;if(f=+n._x.call(null,r.data),g=+n._y.call(null,r.data),e===f&&t===g)return o.next=r,s?s[p]=o:n._root=o,n;do s=s?s[p]=new Array(4):n._root=new Array(4),(y=e>=(h=(a+c)/2))?a=h:c=h,(m=t>=(d=(l+u)/2))?l=d:u=d;while((p=m<<1|y)===(A=(g>=d)<<1|f>=h));return s[A]=r,s[p]=o,n}function sv(n){Array.isArray(n)||(n=Array.from(n));let e=n.length,t=new Float64Array(e),i=new Float64Array(e),s=1/0,r=s,o=-s,a=o;for(let l=0,c,u,h;l<e;++l){if(isNaN(u=+this._x.call(null,c=n[l]))||isNaN(h=+this._y.call(null,c))){t[l]=NaN;continue}t[l]=u,i[l]=h,u<s&&(s=u),u>o&&(o=u),h<r&&(r=h),h>a&&(a=h)}if(s>o||r>a)return this;this.cover(s,r).cover(o,a);for(let l=0;l<e;++l)$d(this,t[l],i[l],n[l]);return this}function rv(n,e){if(isNaN(n=+n)||isNaN(e=+e))return this;var t=this._x0,i=this._y0,s=this._x1,r=this._y1;if(isNaN(t))s=(t=Math.floor(n))+1,r=(i=Math.floor(e))+1;else{for(var o=s-t||1,a=this._root,l,c;t>n||n>=s||i>e||e>=r;)switch(c=(e<i)<<1|n<t,l=new Array(4),l[c]=a,a=l,o*=2,c){case 0:s=t+o,r=i+o;break;case 1:t=s-o,r=i+o;break;case 2:s=t+o,i=r-o;break;case 3:t=s-o,i=r-o;break}this._root&&this._root.length&&(this._root=a)}return this._x0=t,this._y0=i,this._x1=s,this._y1=r,this}function av(){var n=[];return this.visit(function(e){if(!e.length)do n.push(e.data);while(e=e.next)}),n}function ov(n){return arguments.length?this.cover(+n[0][0],+n[0][1]).cover(+n[1][0],+n[1][1]):isNaN(this._x0)?void 0:[[this._x0,this._y0],[this._x1,this._y1]]}function jt(n,e,t,i,s){this.node=n,this.x0=e,this.y0=t,this.x1=i,this.y1=s}function lv(n,e,t){var i,s=this._x0,r=this._y0,o,a,l,c,u=this._x1,h=this._y1,d=[],f=this._root,g,y;for(f&&d.push(new jt(f,s,r,u,h)),t==null?t=1/0:(s=n-t,r=e-t,u=n+t,h=e+t,t*=t);g=d.pop();)if(!(!(f=g.node)||(o=g.x0)>u||(a=g.y0)>h||(l=g.x1)<s||(c=g.y1)<r))if(f.length){var m=(o+l)/2,p=(a+c)/2;d.push(new jt(f[3],m,p,l,c),new jt(f[2],o,p,m,c),new jt(f[1],m,a,l,p),new jt(f[0],o,a,m,p)),(y=(e>=p)<<1|n>=m)&&(g=d[d.length-1],d[d.length-1]=d[d.length-1-y],d[d.length-1-y]=g)}else{var A=n-+this._x.call(null,f.data),C=e-+this._y.call(null,f.data),v=A*A+C*C;if(v<t){var M=Math.sqrt(t=v);s=n-M,r=e-M,u=n+M,h=e+M,i=f.data}}return i}function cv(n){if(isNaN(u=+this._x.call(null,n))||isNaN(h=+this._y.call(null,n)))return this;var e,t=this._root,i,s,r,o=this._x0,a=this._y0,l=this._x1,c=this._y1,u,h,d,f,g,y,m,p;if(!t)return this;if(t.length)for(;;){if((g=u>=(d=(o+l)/2))?o=d:l=d,(y=h>=(f=(a+c)/2))?a=f:c=f,e=t,!(t=t[m=y<<1|g]))return this;if(!t.length)break;(e[m+1&3]||e[m+2&3]||e[m+3&3])&&(i=e,p=m)}for(;t.data!==n;)if(s=t,!(t=t.next))return this;return(r=t.next)&&delete t.next,s?(r?s.next=r:delete s.next,this):e?(r?e[m]=r:delete e[m],(t=e[0]||e[1]||e[2]||e[3])&&t===(e[3]||e[2]||e[1]||e[0])&&!t.length&&(i?i[p]=t:this._root=t),this):(this._root=r,this)}function uv(n){for(var e=0,t=n.length;e<t;++e)this.remove(n[e]);return this}function hv(){return this._root}function dv(){var n=0;return this.visit(function(e){if(!e.length)do++n;while(e=e.next)}),n}function fv(n){var e=[],t,i=this._root,s,r,o,a,l;for(i&&e.push(new jt(i,this._x0,this._y0,this._x1,this._y1));t=e.pop();)if(!n(i=t.node,r=t.x0,o=t.y0,a=t.x1,l=t.y1)&&i.length){var c=(r+a)/2,u=(o+l)/2;(s=i[3])&&e.push(new jt(s,c,u,a,l)),(s=i[2])&&e.push(new jt(s,r,u,c,l)),(s=i[1])&&e.push(new jt(s,c,o,a,u)),(s=i[0])&&e.push(new jt(s,r,o,c,u))}return this}function pv(n){var e=[],t=[],i;for(this._root&&e.push(new jt(this._root,this._x0,this._y0,this._x1,this._y1));i=e.pop();){var s=i.node;if(s.length){var r,o=i.x0,a=i.y0,l=i.x1,c=i.y1,u=(o+l)/2,h=(a+c)/2;(r=s[0])&&e.push(new jt(r,o,a,u,h)),(r=s[1])&&e.push(new jt(r,u,a,l,h)),(r=s[2])&&e.push(new jt(r,o,h,u,c)),(r=s[3])&&e.push(new jt(r,u,h,l,c))}t.push(i)}for(;i=t.pop();)n(i.node,i.x0,i.y0,i.x1,i.y1);return this}function mv(n){return n[0]}function gv(n){return arguments.length?(this._x=n,this):this._x}function yv(n){return n[1]}function vv(n){return arguments.length?(this._y=n,this):this._y}function ja(n,e,t){var i=new Hc(e??mv,t??yv,NaN,NaN,NaN,NaN);return n==null?i:i.addAll(n)}function Hc(n,e,t,i,s,r){this._x=n,this._y=e,this._x0=t,this._y0=i,this._x1=s,this._y1=r,this._root=void 0}function Yd(n){for(var e={data:n.data},t=e;n=n.next;)t=t.next={data:n.data};return e}var en=ja.prototype=Hc.prototype;en.copy=function(){var n=new Hc(this._x,this._y,this._x0,this._y0,this._x1,this._y1),e=this._root,t,i;if(!e)return n;if(!e.length)return n._root=Yd(e),n;for(t=[{source:e,target:n._root=new Array(4)}];e=t.pop();)for(var s=0;s<4;++s)(i=e.source[s])&&(i.length?t.push({source:i,target:e.target[s]=new Array(4)}):e.target[s]=Yd(i));return n};en.add=iv;en.addAll=sv;en.cover=rv;en.data=av;en.extent=ov;en.find=lv;en.remove=cv;en.removeAll=uv;en.root=hv;en.size=dv;en.visit=fv;en.visitAfter=pv;en.x=gv;en.y=vv;function Zd(n,e){var t,i=1;n==null&&(n=0),e==null&&(e=0);function s(){var r,o=t.length,a,l=0,c=0;for(r=0;r<o;++r)a=t[r],l+=a.x,c+=a.y;for(l=(l/o-n)*i,c=(c/o-e)*i,r=0;r<o;++r)a=t[r],a.x-=l,a.y-=c}return s.initialize=function(r){t=r},s.x=function(r){return arguments.length?(n=+r,s):n},s.y=function(r){return arguments.length?(e=+r,s):e},s.strength=function(r){return arguments.length?(i=+r,s):i},s}function tn(n){return function(){return n}}function Ti(n){return(n()-.5)*1e-6}function _v(n){return n.x+n.vx}function xv(n){return n.y+n.vy}function Jd(n){var e,t,i,s=1,r=1;typeof n!="function"&&(n=tn(n==null?1:+n));function o(){for(var c,u=e.length,h,d,f,g,y,m,p=0;p<r;++p)for(h=ja(e,_v,xv).visitAfter(a),c=0;c<u;++c)d=e[c],y=t[d.index],m=y*y,f=d.x+d.vx,g=d.y+d.vy,h.visit(A);function A(C,v,M,E,b){var R=C.data,_=C.r,x=y+_;if(R){if(R.index>d.index){var L=f-R.x-R.vx,V=g-R.y-R.vy,F=L*L+V*V;F<x*x&&(L===0&&(L=Ti(i),F+=L*L),V===0&&(V=Ti(i),F+=V*V),F=(x-(F=Math.sqrt(F)))/F*s,d.vx+=(L*=F)*(x=(_*=_)/(m+_)),d.vy+=(V*=F)*x,R.vx-=L*(x=1-x),R.vy-=V*x)}return}return v>f+x||E<f-x||M>g+x||b<g-x}}function a(c){if(c.data)return c.r=t[c.data.index];for(var u=c.r=0;u<4;++u)c[u]&&c[u].r>c.r&&(c.r=c[u].r)}function l(){if(e){var c,u=e.length,h;for(t=new Array(u),c=0;c<u;++c)h=e[c],t[h.index]=+n(h,c,e)}}return o.initialize=function(c,u){e=c,i=u,l()},o.iterations=function(c){return arguments.length?(r=+c,o):r},o.strength=function(c){return arguments.length?(s=+c,o):s},o.radius=function(c){return arguments.length?(n=typeof c=="function"?c:tn(+c),l(),o):n},o}function bv(n){return n.index}function qd(n,e){var t=n.get(e);if(!t)throw new Error("node not found: "+e);return t}function Qd(n){var e=bv,t=h,i,s=tn(30),r,o,a,l,c,u=1;n==null&&(n=[]);function h(m){return 1/Math.min(a[m.source.index],a[m.target.index])}function d(m){for(var p=0,A=n.length;p<u;++p)for(var C=0,v,M,E,b,R,_,x;C<A;++C)v=n[C],M=v.source,E=v.target,b=E.x+E.vx-M.x-M.vx||Ti(c),R=E.y+E.vy-M.y-M.vy||Ti(c),_=Math.sqrt(b*b+R*R),_=(_-r[C])/_*m*i[C],b*=_,R*=_,E.vx-=b*(x=l[C]),E.vy-=R*x,M.vx+=b*(x=1-x),M.vy+=R*x}function f(){if(o){var m,p=o.length,A=n.length,C=new Map(o.map((M,E)=>[e(M,E,o),M])),v;for(m=0,a=new Array(p);m<A;++m)v=n[m],v.index=m,typeof v.source!="object"&&(v.source=qd(C,v.source)),typeof v.target!="object"&&(v.target=qd(C,v.target)),a[v.source.index]=(a[v.source.index]||0)+1,a[v.target.index]=(a[v.target.index]||0)+1;for(m=0,l=new Array(A);m<A;++m)v=n[m],l[m]=a[v.source.index]/(a[v.source.index]+a[v.target.index]);i=new Array(A),g(),r=new Array(A),y()}}function g(){if(o)for(var m=0,p=n.length;m<p;++m)i[m]=+t(n[m],m,n)}function y(){if(o)for(var m=0,p=n.length;m<p;++m)r[m]=+s(n[m],m,n)}return d.initialize=function(m,p){o=m,c=p,f()},d.links=function(m){return arguments.length?(n=m,f(),d):n},d.id=function(m){return arguments.length?(e=m,d):e},d.iterations=function(m){return arguments.length?(u=+m,d):u},d.strength=function(m){return arguments.length?(t=typeof m=="function"?m:tn(+m),g(),d):t},d.distance=function(m){return arguments.length?(s=typeof m=="function"?m:tn(+m),y(),d):s},d}var Sv=1664525,Mv=1013904223,Kd=4294967296;function wv(){let n=1;return()=>(n=(Sv*n+Mv)%Kd)/Kd}function Ev(n){return n.x}function Tv(n){return n.y}var Av=10,Cv=Math.PI*(3-Math.sqrt(5));function jd(n){var e,t=1,i=.001,s=1-Math.pow(i,1/300),r=0,o=.6,a=new Map,l=Lr(h),c=ni("tick","end"),u=wv();n==null&&(n=[]);function h(){d(),c.call("tick",e),t<i&&(l.stop(),c.call("end",e))}function d(y){var m,p=n.length,A;y===void 0&&(y=1);for(var C=0;C<y;++C)for(t+=(r-t)*s,a.forEach(function(v){v(t)}),m=0;m<p;++m)A=n[m],A.fx==null?A.x+=A.vx*=o:(A.x=A.fx,A.vx=0),A.fy==null?A.y+=A.vy*=o:(A.y=A.fy,A.vy=0);return e}function f(){for(var y=0,m=n.length,p;y<m;++y){if(p=n[y],p.index=y,p.fx!=null&&(p.x=p.fx),p.fy!=null&&(p.y=p.fy),isNaN(p.x)||isNaN(p.y)){var A=Av*Math.sqrt(.5+y),C=y*Cv;p.x=A*Math.cos(C),p.y=A*Math.sin(C)}(isNaN(p.vx)||isNaN(p.vy))&&(p.vx=p.vy=0)}}function g(y){return y.initialize&&y.initialize(n,u),y}return f(),e={tick:d,restart:function(){return l.restart(h),e},stop:function(){return l.stop(),e},nodes:function(y){return arguments.length?(n=y,f(),a.forEach(g),e):n},alpha:function(y){return arguments.length?(t=+y,e):t},alphaMin:function(y){return arguments.length?(i=+y,e):i},alphaDecay:function(y){return arguments.length?(s=+y,e):+s},alphaTarget:function(y){return arguments.length?(r=+y,e):r},velocityDecay:function(y){return arguments.length?(o=1-y,e):1-o},randomSource:function(y){return arguments.length?(u=y,a.forEach(g),e):u},force:function(y,m){return arguments.length>1?(m==null?a.delete(y):a.set(y,g(m)),e):a.get(y)},find:function(y,m,p){var A=0,C=n.length,v,M,E,b,R;for(p==null?p=1/0:p*=p,A=0;A<C;++A)b=n[A],v=y-b.x,M=m-b.y,E=v*v+M*M,E<p&&(R=b,p=E);return R},on:function(y,m){return arguments.length>1?(c.on(y,m),e):c.on(y)}}}function ef(){var n,e,t,i,s=tn(-30),r,o=1,a=1/0,l=.81;function c(f){var g,y=n.length,m=ja(n,Ev,Tv).visitAfter(h);for(i=f,g=0;g<y;++g)e=n[g],m.visit(d)}function u(){if(n){var f,g=n.length,y;for(r=new Array(g),f=0;f<g;++f)y=n[f],r[y.index]=+s(y,f,n)}}function h(f){var g=0,y,m,p=0,A,C,v;if(f.length){for(A=C=v=0;v<4;++v)(y=f[v])&&(m=Math.abs(y.value))&&(g+=y.value,p+=m,A+=m*y.x,C+=m*y.y);f.x=A/p,f.y=C/p}else{y=f,y.x=y.data.x,y.y=y.data.y;do g+=r[y.data.index];while(y=y.next)}f.value=g}function d(f,g,y,m){if(!f.value)return!0;var p=f.x-e.x,A=f.y-e.y,C=m-g,v=p*p+A*A;if(C*C/l<v)return v<a&&(p===0&&(p=Ti(t),v+=p*p),A===0&&(A=Ti(t),v+=A*A),v<o&&(v=Math.sqrt(o*v)),e.vx+=p*f.value*i/v,e.vy+=A*f.value*i/v),!0;if(f.length||v>=a)return;(f.data!==e||f.next)&&(p===0&&(p=Ti(t),v+=p*p),A===0&&(A=Ti(t),v+=A*A),v<o&&(v=Math.sqrt(o*v)));do f.data!==e&&(C=r[f.data.index]*i/v,e.vx+=p*C,e.vy+=A*C);while(f=f.next)}return c.initialize=function(f,g){n=f,t=g,u()},c.strength=function(f){return arguments.length?(s=typeof f=="function"?f:tn(+f),u(),c):s},c.distanceMin=function(f){return arguments.length?(o=f*f,c):Math.sqrt(o)},c.distanceMax=function(f){return arguments.length?(a=f*f,c):Math.sqrt(a)},c.theta=function(f){return arguments.length?(l=f*f,c):Math.sqrt(l)},c}function tf(n){var e=tn(.1),t,i,s;typeof n!="function"&&(n=tn(n==null?0:+n));function r(a){for(var l=0,c=t.length,u;l<c;++l)u=t[l],u.vx+=(s[l]-u.x)*i[l]*a}function o(){if(t){var a,l=t.length;for(i=new Array(l),s=new Array(l),a=0;a<l;++a)i[a]=isNaN(s[a]=+n(t[a],a,t))?0:+e(t[a],a,t)}}return r.initialize=function(a){t=a,o()},r.strength=function(a){return arguments.length?(e=typeof a=="function"?a:tn(+a),o(),r):e},r.x=function(a){return arguments.length?(n=typeof a=="function"?a:tn(+a),o(),r):n},r}function nf(n){var e=tn(.1),t,i,s;typeof n!="function"&&(n=tn(n==null?0:+n));function r(a){for(var l=0,c=t.length,u;l<c;++l)u=t[l],u.vy+=(s[l]-u.y)*i[l]*a}function o(){if(t){var a,l=t.length;for(i=new Array(l),s=new Array(l),a=0;a<l;++a)i[a]=isNaN(s[a]=+n(t[a],a,t))?0:+e(t[a],a,t)}}return r.initialize=function(a){t=a,o()},r.strength=function(a){return arguments.length?(e=typeof a=="function"?a:tn(+a),o(),r):e},r.y=function(a){return arguments.length?(n=typeof a=="function"?a:tn(+a),o(),r):n},r}var eo=n=>()=>n;function Rv(n,{sourceEvent:e,target:t,transform:i,dispatch:s}){Object.defineProperties(this,{type:{value:n,enumerable:!0,configurable:!0},sourceEvent:{value:e,enumerable:!0,configurable:!0},target:{value:t,enumerable:!0,configurable:!0},transform:{value:i,enumerable:!0,configurable:!0},_:{value:s}})}function oi(n,e,t){this.k=n,this.x=e,this.y=t}oi.prototype={constructor:oi,scale:function(n){return n===1?this:new oi(this.k*n,this.x,this.y)},translate:function(n,e){return n===0&e===0?this:new oi(this.k,this.x+this.k*n,this.y+this.k*e)},apply:function(n){return[n[0]*this.k+this.x,n[1]*this.k+this.y]},applyX:function(n){return n*this.k+this.x},applyY:function(n){return n*this.k+this.y},invert:function(n){return[(n[0]-this.x)/this.k,(n[1]-this.y)/this.k]},invertX:function(n){return(n-this.x)/this.k},invertY:function(n){return(n-this.y)/this.k},rescaleX:function(n){return n.copy().domain(n.range().map(this.invertX,this).map(n.invert,n))},rescaleY:function(n){return n.copy().domain(n.range().map(this.invertY,this).map(n.invert,n))},toString:function(){return"translate("+this.x+","+this.y+") scale("+this.k+")"}};var Fr=new oi(1,0,0);Iv.prototype=oi.prototype;function Iv(n){for(;!n.__zoom;)if(!(n=n.parentNode))return Fr;return n.__zoom}function Vc(n){n.stopImmediatePropagation()}function Ur(n){n.preventDefault(),n.stopImmediatePropagation()}function Pv(n){return(!n.ctrlKey||n.type==="wheel")&&!n.button}function Nv(){var n=this;return n instanceof SVGElement?(n=n.ownerSVGElement||n,n.hasAttribute("viewBox")?(n=n.viewBox.baseVal,[[n.x,n.y],[n.x+n.width,n.y+n.height]]):[[0,0],[n.width.baseVal.value,n.height.baseVal.value]]):[[0,0],[n.clientWidth,n.clientHeight]]}function sf(){return this.__zoom||Fr}function Lv(n){return-n.deltaY*(n.deltaMode===1?.05:n.deltaMode?1:.002)*(n.ctrlKey?10:1)}function Dv(){return navigator.maxTouchPoints||"ontouchstart"in this}function Uv(n,e,t){var i=n.invertX(e[0][0])-t[0][0],s=n.invertX(e[1][0])-t[1][0],r=n.invertY(e[0][1])-t[0][1],o=n.invertY(e[1][1])-t[1][1];return n.translate(s>i?(i+s)/2:Math.min(0,i)||Math.max(0,s),o>r?(r+o)/2:Math.min(0,r)||Math.max(0,o))}function rf(){var n=Pv,e=Nv,t=Uv,i=Lv,s=Dv,r=[0,1/0],o=[[-1/0,-1/0],[1/0,1/0]],a=250,l=Pd,c=ni("start","zoom","end"),u,h,d,f=500,g=150,y=0,m=10;function p(I){I.property("__zoom",sf).on("wheel.zoom",R,{passive:!1}).on("mousedown.zoom",_).on("dblclick.zoom",x).filter(s).on("touchstart.zoom",L).on("touchmove.zoom",V).on("touchend.zoom touchcancel.zoom",F).style("-webkit-tap-highlight-color","rgba(0,0,0,0)")}p.transform=function(I,O,P,B){var H=I.selection?I.selection():I;H.property("__zoom",sf),I!==H?M(I,O,P,B):H.interrupt().each(function(){E(this,arguments).event(B).start().zoom(null,typeof O=="function"?O.apply(this,arguments):O).end()})},p.scaleBy=function(I,O,P,B){p.scaleTo(I,function(){var H=this.__zoom.k,ee=typeof O=="function"?O.apply(this,arguments):O;return H*ee},P,B)},p.scaleTo=function(I,O,P,B){p.transform(I,function(){var H=e.apply(this,arguments),ee=this.__zoom,se=P==null?v(H):typeof P=="function"?P.apply(this,arguments):P,he=ee.invert(se),Me=typeof O=="function"?O.apply(this,arguments):O;return t(C(A(ee,Me),se,he),H,o)},P,B)},p.translateBy=function(I,O,P,B){p.transform(I,function(){return t(this.__zoom.translate(typeof O=="function"?O.apply(this,arguments):O,typeof P=="function"?P.apply(this,arguments):P),e.apply(this,arguments),o)},null,B)},p.translateTo=function(I,O,P,B,H){p.transform(I,function(){var ee=e.apply(this,arguments),se=this.__zoom,he=B==null?v(ee):typeof B=="function"?B.apply(this,arguments):B;return t(Fr.translate(he[0],he[1]).scale(se.k).translate(typeof O=="function"?-O.apply(this,arguments):-O,typeof P=="function"?-P.apply(this,arguments):-P),ee,o)},B,H)};function A(I,O){return O=Math.max(r[0],Math.min(r[1],O)),O===I.k?I:new oi(O,I.x,I.y)}function C(I,O,P){var B=O[0]-P[0]*I.k,H=O[1]-P[1]*I.k;return B===I.x&&H===I.y?I:new oi(I.k,B,H)}function v(I){return[(+I[0][0]+ +I[1][0])/2,(+I[0][1]+ +I[1][1])/2]}function M(I,O,P,B){I.on("start.zoom",function(){E(this,arguments).event(B).start()}).on("interrupt.zoom end.zoom",function(){E(this,arguments).event(B).end()}).tween("zoom",function(){var H=this,ee=arguments,se=E(H,ee).event(B),he=e.apply(H,ee),Me=P==null?v(he):typeof P=="function"?P.apply(H,ee):P,Ne=Math.max(he[1][0]-he[0][0],he[1][1]-he[0][1]),Z=H.__zoom,oe=typeof O=="function"?O.apply(H,ee):O,me=l(Z.invert(Me).concat(Ne/Z.k),oe.invert(Me).concat(Ne/oe.k));return function(ce){if(ce===1)ce=oe;else{var Re=me(ce),Le=Ne/Re[2];ce=new oi(Le,Me[0]-Re[0]*Le,Me[1]-Re[1]*Le)}se.zoom(null,ce)}})}function E(I,O,P){return!P&&I.__zooming||new b(I,O)}function b(I,O){this.that=I,this.args=O,this.active=0,this.sourceEvent=null,this.extent=e.apply(I,O),this.taps=0}b.prototype={event:function(I){return I&&(this.sourceEvent=I),this},start:function(){return++this.active===1&&(this.that.__zooming=this,this.emit("start")),this},zoom:function(I,O){return this.mouse&&I!=="mouse"&&(this.mouse[1]=O.invert(this.mouse[0])),this.touch0&&I!=="touch"&&(this.touch0[1]=O.invert(this.touch0[0])),this.touch1&&I!=="touch"&&(this.touch1[1]=O.invert(this.touch1[0])),this.that.__zoom=O,this.emit("zoom"),this},end:function(){return--this.active===0&&(delete this.that.__zooming,this.emit("end")),this},emit:function(I){var O=cn(this.that).datum();c.call(I,this.that,new Rv(I,{sourceEvent:this.sourceEvent,target:p,transform:this.that.__zoom,dispatch:c}),O)}};function R(I,...O){if(!n.apply(this,arguments))return;var P=E(this,O).event(I),B=this.__zoom,H=Math.max(r[0],Math.min(r[1],B.k*Math.pow(2,i.apply(this,arguments)))),ee=Tn(I);if(P.wheel)(P.mouse[0][0]!==ee[0]||P.mouse[0][1]!==ee[1])&&(P.mouse[1]=B.invert(P.mouse[0]=ee)),clearTimeout(P.wheel);else{if(B.k===H)return;P.mouse=[ee,B.invert(ee)],Dr(this),P.start()}Ur(I),P.wheel=setTimeout(se,g),P.zoom("mouse",t(C(A(B,H),P.mouse[0],P.mouse[1]),P.extent,o));function se(){P.wheel=null,P.end()}}function _(I,...O){if(d||!n.apply(this,arguments))return;var P=I.currentTarget,B=E(this,O,!0).event(I),H=cn(I.view).on("mousemove.zoom",Me,!0).on("mouseup.zoom",Ne,!0),ee=Tn(I,P),se=I.clientX,he=I.clientY;mc(I.view),Vc(I),B.mouse=[ee,this.__zoom.invert(ee)],Dr(this),B.start();function Me(Z){if(Ur(Z),!B.moved){var oe=Z.clientX-se,me=Z.clientY-he;B.moved=oe*oe+me*me>y}B.event(Z).zoom("mouse",t(C(B.that.__zoom,B.mouse[0]=Tn(Z,P),B.mouse[1]),B.extent,o))}function Ne(Z){H.on("mousemove.zoom mouseup.zoom",null),gc(Z.view,B.moved),Ur(Z),B.event(Z).end()}}function x(I,...O){if(n.apply(this,arguments)){var P=this.__zoom,B=Tn(I.changedTouches?I.changedTouches[0]:I,this),H=P.invert(B),ee=P.k*(I.shiftKey?.5:2),se=t(C(A(P,ee),B,H),e.apply(this,O),o);Ur(I),a>0?cn(this).transition().duration(a).call(M,se,B,I):cn(this).call(p.transform,se,B,I)}}function L(I,...O){if(n.apply(this,arguments)){var P=I.touches,B=P.length,H=E(this,O,I.changedTouches.length===B).event(I),ee,se,he,Me;for(Vc(I),se=0;se<B;++se)he=P[se],Me=Tn(he,this),Me=[Me,this.__zoom.invert(Me),he.identifier],H.touch0?!H.touch1&&H.touch0[2]!==Me[2]&&(H.touch1=Me,H.taps=0):(H.touch0=Me,ee=!0,H.taps=1+!!u);u&&(u=clearTimeout(u)),ee&&(H.taps<2&&(h=Me[0],u=setTimeout(function(){u=null},f)),Dr(this),H.start())}}function V(I,...O){if(this.__zooming){var P=E(this,O).event(I),B=I.changedTouches,H=B.length,ee,se,he,Me;for(Ur(I),ee=0;ee<H;++ee)se=B[ee],he=Tn(se,this),P.touch0&&P.touch0[2]===se.identifier?P.touch0[0]=he:P.touch1&&P.touch1[2]===se.identifier&&(P.touch1[0]=he);if(se=P.that.__zoom,P.touch1){var Ne=P.touch0[0],Z=P.touch0[1],oe=P.touch1[0],me=P.touch1[1],ce=(ce=oe[0]-Ne[0])*ce+(ce=oe[1]-Ne[1])*ce,Re=(Re=me[0]-Z[0])*Re+(Re=me[1]-Z[1])*Re;se=A(se,Math.sqrt(ce/Re)),he=[(Ne[0]+oe[0])/2,(Ne[1]+oe[1])/2],Me=[(Z[0]+me[0])/2,(Z[1]+me[1])/2]}else if(P.touch0)he=P.touch0[0],Me=P.touch0[1];else return;P.zoom("touch",t(C(se,he,Me),P.extent,o))}}function F(I,...O){if(this.__zooming){var P=E(this,O).event(I),B=I.changedTouches,H=B.length,ee,se;for(Vc(I),d&&clearTimeout(d),d=setTimeout(function(){d=null},f),ee=0;ee<H;++ee)se=B[ee],P.touch0&&P.touch0[2]===se.identifier?delete P.touch0:P.touch1&&P.touch1[2]===se.identifier&&delete P.touch1;if(P.touch1&&!P.touch0&&(P.touch0=P.touch1,delete P.touch1),P.touch0)P.touch0[1]=this.__zoom.invert(P.touch0[0]);else if(P.end(),P.taps===2&&(se=Tn(se,this),Math.hypot(h[0]-se[0],h[1]-se[1])<m)){var he=cn(this).on("dblclick.zoom");he&&he.apply(this,arguments)}}}return p.wheelDelta=function(I){return arguments.length?(i=typeof I=="function"?I:eo(+I),p):i},p.filter=function(I){return arguments.length?(n=typeof I=="function"?I:eo(!!I),p):n},p.touchable=function(I){return arguments.length?(s=typeof I=="function"?I:eo(!!I),p):s},p.extent=function(I){return arguments.length?(e=typeof I=="function"?I:eo([[+I[0][0],+I[0][1]],[+I[1][0],+I[1][1]]]),p):e},p.scaleExtent=function(I){return arguments.length?(r[0]=+I[0],r[1]=+I[1],p):[r[0],r[1]]},p.translateExtent=function(I){return arguments.length?(o[0][0]=+I[0][0],o[1][0]=+I[1][0],o[0][1]=+I[0][1],o[1][1]=+I[1][1],p):[[o[0][0],o[0][1]],[o[1][0],o[1][1]]]},p.constrain=function(I){return arguments.length?(t=I,p):t},p.duration=function(I){return arguments.length?(a=+I,p):a},p.interpolate=function(I){return arguments.length?(l=I,p):l},p.on=function(){var I=c.on.apply(c,arguments);return I===c?p:I},p.clickDistance=function(I){return arguments.length?(y=(I=+I)*I,p):Math.sqrt(y)},p.tapDistance=function(I){return arguments.length?(m=+I,p):m},p}var Ct=ht(At(),1),Ai={patient:{label:"Twin",color:"#0d1211",bg:"#e4e7e7",radius:16},condition:{label:"Conditions",color:"#b42318",bg:"#fdecea",radius:11},symptom:{label:"Symptoms",color:"#8a5300",bg:"#fff4e0",radius:10},treatment:{label:"Treatments",color:"#17784a",bg:"#e6f4ec",radius:10},biomarker:{label:"Biomarkers",color:"#0097b2",bg:"#e6f6f9",radius:10},finding:{label:"Genes & KG",color:"#3f3073",bg:"#eef0f8",radius:10}};function ss(n,e=18){let t=n.replace(/\s*\([^)]*\)\s*/g,"").trim();return t.length<=e?t:t.slice(0,e-1).trim()+"\u2026"}function Fv(n,e=[],t){let i=new Map,s=[],r=M=>{i.has(M.id)||i.set(M.id,M)},o=(M,E,b)=>{!i.has(M)||!i.has(E)||M===E||s.some(R=>R.source===M&&R.target===E||R.source===E&&R.target===M)||s.push({source:M,target:E,relation:b})},a=n?.patient?.preferred_name||"Patient",l="patient:self";r({id:l,label:`${a}'s Twin`,shortLabel:a,group:"patient",detail:`Central Digital Twin entity \xB7 ${(n?.patient?.conditions||[]).length} conditions, ${Object.keys(n?.labs||{}).length} lab series`});let c=Array.isArray(n?.patient?.conditions)?n.patient.conditions:[];c.slice(0,6).forEach((M,E)=>{let b=`cond:${E}`;r({id:b,label:M,shortLabel:ss(M,17),group:"condition",detail:`Recorded condition: ${M}`}),o(l,b,"diagnosed_with")});let u=[...Array.isArray(n?.patient?.medicines)?n.patient.medicines:[],...Array.isArray(n?.patient?.supplements)?n.patient.supplements.slice(0,2):[]];u.slice(0,5).forEach((M,E)=>{let b=`med:${E}`,R=M.split(",")[0].trim();r({id:b,label:R,shortLabel:ss(R,16),group:"treatment",detail:`Active treatment: ${M}`}),o(l,b,"treated_with");let _=M.toLowerCase();c.slice(0,6).forEach((x,L)=>{let V=x.toLowerCase();((_.includes("amlodipine")||_.includes("losartan"))&&(V.includes("blood pressure")||V.includes("hypertension")||V.includes("kidney"))||_.includes("vitamin d")&&(V.includes("vitamin d")||V.includes("osteopenia"))||_.includes("levothyroxine")&&V.includes("thyroid")||_.includes("metformin")&&(V.includes("diabetes")||V.includes("glucose"))||_.includes("omega")&&V.includes("cholesterol"))&&o(b,`cond:${L}`,"targets")})});let h=new Map,d=e.filter(M=>M.kind==="symptom");for(let M of d)h.set(M.title,`Reported by patient (${M.date}): ${M.detail||"awaiting check"}`);let f=Array.isArray(n?.insights)?n.insights:[];for(let M of f){let E=`${M.title||""} ${M.found||""}`.toLowerCase();(E.includes("muscle ache")||E.includes("myalgia"))&&h.set("Statin muscle aches","Prior myalgia on atorvastatin linked to SLCO1B1 (*1/*5)"),(E.includes("short sleep")||E.includes("low mood"))&&h.set("Short sleep & fatigue","Average 6.3h sleep \xB7 mild PHQ-9/GAD-7 screening")}let g=Array.isArray(n?.checkin?.daily)?n.checkin.daily:[];for(let M of g)/tiredness|energy/i.test(M.why||"")&&h.set("Fatigue",M.why);t?.sections&&JSON.stringify(t.sections[0]||"").includes("Nocturia")&&h.set("Nocturia","HPO HP:0000017 \xB7 Linked to renal & fluid monitoring"),h.size===0&&h.set("Daily wellbeing check","Tracked via twin daily symptom & energy check-in"),Array.from(h.entries()).slice(0,4).forEach(([M,E],b)=>{let R=`sym:${b}`;r({id:R,label:M,shortLabel:ss(M,16),group:"symptom",detail:E}),o(l,R,"experiences");let _=M.toLowerCase();c.slice(0,6).forEach((x,L)=>{let V=x.toLowerCase();(_.includes("nocturia")&&V.includes("kidney")||_.includes("muscle")&&V.includes("cholesterol")||_.includes("fatigue")&&(V.includes("vitamin d")||V.includes("kidney")||V.includes("thyroid")))&&o(R,`cond:${L}`,"associated_with")})});let y=new Map;e.filter(M=>M.kind==="lab").slice(0,6).forEach((M,E)=>{let b=M.extracted,_=(b?.name||M.title.split(/\s+/)[0]||`Lab ${E+1}`).toLowerCase();if(y.has(_))return;let x=`lab:new:${E}`;y.set(_,x);let L=b?.prevValue!=null&&b?.pctChange!=null?` (was ${b.prevValue}, ${b.pctChange>0?"+":""}${b.pctChange.toFixed(1)}%)`:"";r({id:x,label:b?`${b.name}: ${b.value} ${Ki(b.unit)}`:M.title,shortLabel:b?`${ss(b.name,10)} ${b.value}`:ss(M.title,15),group:"biomarker",flagged:!!b?.flag,isPendingReport:!0,detail:`New report (${M.date}, waiting for check): ${M.title}${L}`}),o(l,x,"new_report_lab")});let p=n?.labs&&typeof n.labs=="object"?n.labs:{};Object.entries(p).filter(([M,E])=>Array.isArray(E)&&E.length>0&&!y.has(M.toLowerCase())).sort(([,M],[,E])=>{let b=M[M.length-1]?.flag?1:0;return(E[E.length-1]?.flag?1:0)-b}).slice(0,Math.max(3,8-y.size)).forEach(([M,E],b)=>{let R=E[E.length-1],_=`lab:${b}`;y.set(M.toLowerCase(),_),r({id:_,label:`${M}: ${R.value} ${Ki(R.unit)}`,shortLabel:`${ss(M,11)} ${R.value}`,group:"biomarker",flagged:!!R.flag,detail:`Latest verified (${R.date}): ${R.value} ${Ki(R.unit)}${R.flag?` [${String(R.flag).toUpperCase()}]`:""}`}),o(l,_,"measured")});for(let[M,E]of y.entries())c.slice(0,6).forEach((b,R)=>{let _=b.toLowerCase();(/egfr|creatinin|uacr|potassium|urate/.test(M)&&_.includes("kidney")||/ldl|apob|lp\(a\)|cholesterol|triglycerid/.test(M)&&_.includes("cholesterol")||/hba1c|glucose/.test(M)&&(_.includes("glucose")||_.includes("diabetes"))||/vitamin d|calcium/.test(M)&&(_.includes("vitamin d")||_.includes("osteopenia"))||/systolic|bp|potassium/.test(M)&&_.includes("blood pressure")||/tsh|free t4/.test(M)&&_.includes("thyroid"))&&o(E,`cond:${R}`,"monitors")}),u.slice(0,5).forEach((b,R)=>{let _=b.toLowerCase();(_.includes("losartan")&&/egfr|uacr|potassium|creatinin/.test(M)||_.includes("vitamin d")&&/vitamin d/.test(M)||_.includes("levothyroxine")&&/tsh/.test(M))&&o(`med:${R}`,E,"modulates")});return f.slice(0,5).forEach(M=>{let E=`ins:${M.id}`;r({id:E,label:M.title,shortLabel:ss(M.title,17),group:"finding",findingId:M.id,detail:`${M.found||""} ${M.do?`\xB7 Next: ${M.do}`:""}`.trim()});let b=String(M.area||"").toLowerCase(),R=!1;for(let[_,x]of y.entries())(b==="kidney"&&/egfr|creatinin|uacr|urate/.test(_)||b==="heart"&&/ldl|apob|lp\(a\)|crp/.test(_)||b==="metabolism"&&/hba1c|glucose/.test(_)||b==="bones"&&/vitamin d/.test(_))&&(o(E,x,"evidenced_by"),R=!0);R||o(l,E,"kg_finding")}),(Array.isArray(n?.genetics?.genes)?n.genetics.genes:[]).filter(M=>M.role==="patient_variant"||["SLCO1B1","APOE","CYP2C19"].includes(M.gene)).slice(0,3).forEach(M=>{let E=`gene:${M.gene}`;r({id:E,label:`Gene ${M.gene}`,shortLabel:M.gene,group:"finding",detail:`${M.gene} (${M.role}): ${M.function||"Genomic marker in twin KG"}`}),o(l,E,"carries_variant"),M.gene==="SLCO1B1"&&i.has("ins:statin_genes")&&o(E,"ins:statin_genes","explains")}),{nodes:Array.from(i.values()),links:s}}function to({b:n,doc:e,readStore:t,openFinding:i,compact:s=!1}){let r=(0,Vt.useRef)(null),o=(0,Vt.useRef)(null),a=(0,Vt.useRef)(null),[l,c]=(0,Vt.useState)("all"),[u,h]=(0,Vt.useState)(null),[d,f]=(0,Vt.useState)(0),[g,y]=(0,Vt.useState)(320);(0,Vt.useEffect)(()=>{let M=()=>f(E=>E+1);return window.addEventListener(Ia,M),()=>window.removeEventListener(Ia,M)},[]),(0,Vt.useEffect)(()=>{let M=r.current;if(!M)return;let E=()=>{let b=Math.max(240,Math.floor(M.getBoundingClientRect().width));y(b)};if(E(),typeof ResizeObserver<"u"){let b=new ResizeObserver(E);return b.observe(M),()=>b.disconnect()}},[]);let m=(0,Vt.useMemo)(()=>t?t("mx-feed",[]):[],[t,d,n]),p=(0,Vt.useMemo)(()=>Fv(n,m,e),[n,m,e]),A=(0,Vt.useMemo)(()=>{if(l==="all")return p;let M=new Set(p.nodes.filter(E=>E.group==="patient"||E.group===l).map(E=>E.id));return{nodes:p.nodes.filter(E=>M.has(E.id)),links:p.links.filter(E=>{let b=typeof E.source=="string"?E.source:E.source.id,R=typeof E.target=="string"?E.target:E.target.id;return M.has(b)&&M.has(R)})}},[p,l]),C=s?250:g<480?280:340;return(0,Vt.useEffect)(()=>{let M=o.current;if(!M)return;let E=A.nodes.map(P=>({...P})),b=A.links.map(P=>({...P,source:typeof P.source=="string"?P.source:P.source.id,target:typeof P.target=="string"?P.target:P.target.id})),R=cn(M);R.selectAll("*").remove();let _=R.append("g").attr("class","mx-kg-viewport"),x=rf().scaleExtent([.55,2.5]).on("zoom",P=>{_.attr("transform",P.transform.toString())});a.current=x,R.call(x);let L=g<420,V=jd(E).force("link",Qd(b).id(P=>P.id).distance(L?54:74)).force("charge",ef().strength(L?-135:-210)).force("center",Zd(g/2,C/2)).force("collide",Jd().radius(P=>P.group==="patient"?28:22)).force("x",tf(g/2).strength(.09)).force("y",nf(C/2).strength(.11)),F=_.append("g").attr("stroke","#cfd6d6").attr("stroke-opacity",.85).selectAll("line").data(b).join("line").attr("stroke-width",1.4).attr("stroke-dasharray",P=>P.relation==="new_report_lab"?"4 2":null),I=_.append("g").selectAll("g").data(E).join("g").style("cursor","pointer").on("click",(P,B)=>{h(B)}),O=Jh().on("start",(P,B)=>{P.active||V.alphaTarget(.3).restart(),B.fx=B.x,B.fy=B.y}).on("drag",(P,B)=>{B.fx=P.x,B.fy=P.y}).on("end",(P,B)=>{P.active||V.alphaTarget(0),B.fx=null,B.fy=null});return I.call(O),I.filter(P=>!!(P.isPendingReport||P.flagged)).append("circle").attr("r",P=>Ai[P.group].radius+4).attr("fill","none").attr("stroke",P=>P.isPendingReport?"#8a5300":"#b42318").attr("stroke-width",1.5).attr("stroke-dasharray",P=>P.isPendingReport?"3 2":null),I.append("circle").attr("r",P=>Ai[P.group].radius).attr("fill",P=>Ai[P.group].color).attr("stroke","#ffffff").attr("stroke-width",2),I.append("text").text(P=>P.shortLabel).attr("x",0).attr("y",P=>Ai[P.group].radius+12).attr("text-anchor","middle").attr("fill","#0d1211").attr("font-size",L?"9.5px":"10.5px").attr("font-weight",P=>P.group==="patient"?"600":"500").style("pointer-events","none"),V.on("tick",()=>{for(let B of E)typeof B.x=="number"&&(B.x=Math.max(24,Math.min(g-24,B.x))),typeof B.y=="number"&&(B.y=Math.max(24,Math.min(C-24,B.y)));F.attr("x1",B=>B.source.x??g/2).attr("y1",B=>B.source.y??C/2).attr("x2",B=>B.target.x??g/2).attr("y2",B=>B.target.y??C/2),I.attr("transform",B=>`translate(${B.x??g/2},${B.y??C/2})`)}),()=>{V.stop()}},[A,g,C]),(0,Ct.jsxs)("section",{className:"card rs-wide mx-kg-card","aria-label":"Patient Knowledge Graph",children:[(0,Ct.jsxs)("div",{className:"sec mx-kg-header",children:[(0,Ct.jsxs)("div",{children:[(0,Ct.jsx)("span",{className:"mx-eyebrow",children:"Interactive Knowledge Graph"}),(0,Ct.jsx)("h2",{children:"Conditions, symptoms, treatments & biomarkers"})]}),(0,Ct.jsx)("button",{type:"button",className:"link",onClick:()=>{o.current&&a.current&&cn(o.current).transition().duration(250).call(a.current.transform,Fr)},children:"Reset view"})]}),(0,Ct.jsx)("div",{className:"mx-kg-filters",role:"tablist","aria-label":"Filter Knowledge Graph",children:[["all","All"],["condition","Conditions"],["symptom","Symptoms"],["treatment","Treatments"],["biomarker","Biomarkers"],["finding","Genes & KG"]].map(([M,E])=>(0,Ct.jsxs)("button",{type:"button",className:`mx-kg-chip${l===M?" is-active":""}`,onClick:()=>c(M),children:[M!=="all"&&(0,Ct.jsx)("i",{style:{backgroundColor:Ai[M].color},"aria-hidden":"true"}),E]},M))}),(0,Ct.jsx)("div",{ref:r,className:"mx-kg-stage",children:(0,Ct.jsx)("svg",{ref:o,width:g,height:C,viewBox:`0 0 ${g} ${C}`,role:"img","aria-label":`Knowledge graph for ${n?.patient?.preferred_name||"patient"}`})}),u?(0,Ct.jsxs)("div",{className:"mx-kg-detail",children:[(0,Ct.jsxs)("div",{className:"mx-kg-detail-top",children:[(0,Ct.jsx)("span",{className:"mx-kg-badge",style:{backgroundColor:Ai[u.group].bg,color:Ai[u.group].color},children:Ai[u.group].label}),u.isPendingReport&&(0,Ct.jsxs)("span",{className:"state warn",children:[(0,Ct.jsx)("i",{}),"Waiting for check"]}),(0,Ct.jsx)("button",{type:"button",className:"link",onClick:()=>h(null),children:"Close"})]}),(0,Ct.jsx)("b",{children:u.label}),(0,Ct.jsx)("p",{className:"note",children:u.detail}),u.findingId&&i&&(0,Ct.jsx)("button",{type:"button",className:"link",onClick:()=>i(u.findingId),children:"Open full finding \u2192"})]}):(0,Ct.jsx)("p",{className:"note mx-kg-hint",children:"Drag nodes to explore connections or tap any node to inspect its clinical link. Dashed links indicate newly uploaded report results."})]})}var De=ht(At(),1),Vv={},kv=typeof Vv<"u"&&""||"";function Ov(n,e){return`${(kv||e||"").replace(/\/$/,"")}${n}`}var Bv={web:"Google Search",kg:"Medical evidence",record:"Your record",finding:"Finding for you"};function zv(n){if(!n)return"";try{return new URL(n).hostname.replace(/^www\./,"")}catch{return""}}function Hv({sources:n,openFinding:e,insights:t}){return!n||n.length===0?null:(0,De.jsxs)("div",{className:"mx-citations-block","aria-label":"Grounded sources and citations",children:[(0,De.jsx)("span",{className:"mx-citations-heading",children:"Sources & Grounded Citations"}),(0,De.jsx)("ul",{className:"ask-src mx-ask-src",children:n.slice(0,8).map((i,s)=>{let r=Bv[i.kind]||i.kind,o=zv(i.url),a=!!i.finding_id&&!!e&&t.some(l=>l.id===i.finding_id);return i.url?(0,De.jsx)("li",{"data-k":i.kind,children:(0,De.jsxs)("a",{href:i.url,target:"_blank",rel:"noopener noreferrer",className:"mx-citation-link",children:[(0,De.jsxs)("span",{className:"mx-citation-top",children:[(0,De.jsx)("i",{children:r}),o&&(0,De.jsxs)("small",{className:"mx-citation-host",children:[o," \u2197"]})]}),(0,De.jsx)("span",{className:"mx-citation-title",children:i.title}),i.detail&&(0,De.jsx)("small",{className:"mx-citation-detail",children:i.detail})]})},`${i.title}-${s}`):a?(0,De.jsx)("li",{"data-k":"finding",children:(0,De.jsxs)("button",{type:"button",className:"mx-citation-btn",onClick:()=>e(i.finding_id),children:[(0,De.jsxs)("span",{className:"mx-citation-top",children:[(0,De.jsx)("i",{children:r}),(0,De.jsx)("small",{className:"mx-citation-host",children:"Open finding \u2192"})]}),(0,De.jsx)("span",{className:"mx-citation-title",children:i.title}),i.detail&&(0,De.jsx)("small",{className:"mx-citation-detail",children:i.detail})]})},`${i.title}-${s}`):(0,De.jsx)("li",{"data-k":i.kind,children:(0,De.jsxs)("span",{className:"mx-citation-static",children:[(0,De.jsx)("span",{className:"mx-citation-top",children:(0,De.jsx)("i",{children:r})}),(0,De.jsx)("span",{className:"mx-citation-title",children:i.title}),i.detail&&(0,De.jsx)("small",{className:"mx-citation-detail",children:i.detail})]})},`${i.title}-${s}`)})})]})}function af({b:n,openFinding:e,embedded:t=!1,initial:i,host:s}){let[r,o]=(0,Gn.useState)(""),[a,l]=(0,Gn.useState)([]),[c,u]=(0,Gn.useState)(!0),[h,d]=(0,Gn.useState)(!t),[f,g]=(0,Gn.useState)(null),y=s.useDoctor?s.useDoctor():!1;(0,Gn.useEffect)(()=>{s.checkHealth&&s.checkHealth().then(u).catch(()=>u(!1))},[s]),(0,Gn.useEffect)(()=>{y&&s.loadDoctorDoc&&s.loadDoctorDoc().then(g).catch(()=>g(null))},[y,s]);let m=b=>{let R=b.toLowerCase(),_=null,x=0;for(let L of n?.ask||[]){let V=(L.keys||[]).reduce((F,I)=>F+(R.includes(I)?I.length:0),0);V>x&&(x=V,_=L)}return _?{me:b,a:_.a,links:_.insights||[],sources:[{kind:"record",title:`${n?.patient?.preferred_name||"Twin"} record`}]}:{me:b,a:"That isn't in your record yet, so I won't guess. Your care team can answer it. If it is about a part of your body your twin hasn't assessed, your personalised panel is how we find out.",links:[]}},p=async b=>{let R=b.trim();if(!R)return;if(s.crisisRegex&&s.crisisRegex.test(R)){l(O=>[...O,{me:R,a:"",links:[],crisis:!0}]);return}l(O=>[...O,{me:R,a:"",links:[],pending:!0}]);let _=s.readStore("mx-feed",[]),x=s.readStore(wi,null),L={...n,pending_feed:_,latest_briefing:x},V=String(s.getPatientId()||"patient").replace(/[^A-Za-z0-9_-]/g,"")||"patient",F=f;y&&!F&&s.loadDoctorDoc&&(F=await s.loadDoctorDoc(),g(F));let I;try{let O=new AbortController,P=setTimeout(()=>O.abort(),45e3),B=await fetch(Ov("/v1/ask",s.apiBase),{method:"POST",headers:{"Content-Type":"application/json"},signal:O.signal,body:JSON.stringify({patient_id:V,question:R,bundle:L,...y?{mode:"cdss",clinical:F}:{}})});if(clearTimeout(P),!B.ok)throw new Error(`HTTP ${B.status}`);let H=await B.json(),ee=Array.isArray(H.sources)?H.sources:[],se=Array.isArray(n?.insights)?n.insights:[],he=Array.from(new Set(ee.map(Me=>Me.finding_id).filter(Me=>!!Me&&se.some(Ne=>Ne.id===Me))));I={me:R,a:H.answer||"",links:he,sources:ee,live:!0,cdss:y}}catch{I=m(R)}l(O=>{let P=[...O],B=P.findIndex(H=>H.pending&&H.me===R);return B>=0?P[B]=I:P.push(I),P})};(0,Gn.useEffect)(()=>{i&&i.trim()&&p(i)},[i]);let A=()=>{if(!r.trim())return;let b=r.trim();o(""),p(b)},C=s.CrisisBanner,v=s.cdssPrompts||["What should we check next?","Treatment options and their evidence","Drug interactions to review","Results outside range"],M=["What changed in my kidneys?",...(n?.ask||[]).map(b=>b.q).slice(0,6)],E=(0,De.jsxs)(De.Fragment,{children:[!t&&(0,De.jsx)("h1",{children:y?"Clinical assistant":"Ask your twin"}),(0,De.jsx)("p",{className:"lede",children:y?`Clinical decision support: grounded in ${n?.patient?.preferred_name||"the patient"}\u2019s Knowledge Graph, uploaded lab reports, and live Google Search clinical guidelines. For physician review; never diagnoses or prescribes.`:c?"Live: your twin answers from your Knowledge Graph, newly added lab reports, and Google Search medical guidelines, with clickable sources.":"Answers come strictly from your own record and verified medical evidence."}),(0,De.jsxs)("div",{className:"mx-kg-toggle-row",children:[(0,De.jsx)("button",{type:"button",className:"secondary sm mx-kg-toggle-btn",onClick:()=>d(b=>!b),"aria-expanded":h,children:h?"Hide Knowledge Graph":"Show Patient Knowledge Graph"}),(0,De.jsx)("span",{className:"note",children:"Google Search + Twin KG linked"})]}),h&&(0,De.jsx)("div",{className:"mx-ask-kg-wrap",children:(0,De.jsx)(to,{b:n,doc:f,readStore:s.readStore,openFinding:e,compact:t})}),(0,De.jsxs)("div",{className:"ask-box",children:[(0,De.jsx)("textarea",{"aria-label":"Your question",placeholder:y?"Ask about next tests, treatment options, interactions, genes, or recent report changes...":"Ask anything about your health, your kidneys, your lab reports, or what to ask your doctor...",value:r,onChange:b=>o(b.target.value),onKeyDown:b=>{b.key==="Enter"&&!b.shiftKey&&(b.preventDefault(),A())}}),(0,De.jsx)("button",{className:"primary",onClick:A,children:"Ask"})]}),a.length===0&&(0,De.jsx)("div",{className:"suggest",children:(y?v:M).map(b=>(0,De.jsx)("button",{onClick:()=>void p(b),children:b},b))}),(0,De.jsx)("div",{className:"mx-turns-stack",children:a.map((b,R)=>(0,De.jsxs)("div",{className:"mx-turn-pair",children:[(0,De.jsx)("div",{className:"bubble me",children:b.me}),b.crisis&&C?(0,De.jsx)(C,{}):b.pending?(0,De.jsxs)("div",{className:"bubble ask-pending",children:[(0,De.jsxs)("span",{className:"ap-dots","aria-hidden":"true",children:[(0,De.jsx)("i",{}),(0,De.jsx)("i",{}),(0,De.jsx)("i",{})]}),"Searching your Knowledge Graph and medical guidelines\u2026"]}):(0,De.jsxs)("div",{className:"bubble mx-answer-bubble",children:[b.cdss&&(0,De.jsx)("span",{className:"ask-live",children:"Clinical decision support \xB7 Grounded"}),b.live&&!b.cdss&&(0,De.jsx)("span",{className:"ask-live",children:"Researched live \xB7 KG + Google Search"}),(0,De.jsx)("p",{className:"mx-answer-text",children:b.a}),b.sources&&b.sources.length>0&&(0,De.jsx)(Hv,{sources:b.sources,openFinding:e,insights:n?.insights||[]}),b.links.length>0&&(0,De.jsx)("div",{className:"suggest mx-insight-links",children:b.links.map(_=>(0,De.jsxs)("button",{onClick:()=>e(_),children:["Read: ",n?.insights?.find(x=>x.id===_)?.title||_]},_))})]})]},`${b.me}-${R}`))}),a.length>0&&(0,De.jsx)("div",{className:"suggest",children:(y?v:M).filter(b=>!a.some(R=>R.me===b)).slice(0,4).map(b=>(0,De.jsx)("button",{onClick:()=>void p(b),children:b},b))})]});return t?(0,De.jsx)("div",{className:"ask-wrap",children:E}):(0,De.jsx)("main",{className:"screen",children:E})}var ks=ht(At(),1);function no({label:n="Back",ariaLabel:e,fallbackHash:t,onClick:i,className:s}){let{backTarget:r,goBack:o}=En(),a=e||(r.backLabel&&r.backLabel!=="Back"?`Back to ${r.backLabel}`:n),l=()=>{if(i){i();return}o(t)};return(0,ks.jsxs)("button",{type:"button",className:`std-back-btn${s?` ${s}`:""}`,onClick:l,"aria-label":a,children:[(0,ks.jsx)("svg",{viewBox:"0 0 16 16",fill:"none",stroke:"currentColor",strokeWidth:"1.75",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:(0,ks.jsx)("path",{d:"M10 3.5L5.5 8l4.5 4.5"})}),(0,ks.jsx)("span",{className:"std-back-text",children:n})]})}var io=ht(Bn(),1);var Rn=ht(At(),1);function of({b:n,readStore:e,formatDate:t}){let[i,s]=(0,io.useState)(()=>e(wi,null));return(0,io.useEffect)(()=>{let r=()=>{s(e(wi,null))};return r(),window.addEventListener(Ra,r),()=>window.removeEventListener(Ra,r)},[n,e]),!i||!i.clinician?null:(0,Rn.jsxs)("section",{className:"card rs-wide mx-clinician-briefing","aria-label":"Clinician report briefing",children:[(0,Rn.jsxs)("div",{className:"sec",children:[(0,Rn.jsxs)("div",{children:[(0,Rn.jsx)("span",{className:"mx-eyebrow",children:"Clinician note \xB7 Uploaded lab report"}),(0,Rn.jsxs)("h2",{children:[n?.patient?.preferred_name||"Patient",": unverified report delta summary"]})]}),(0,Rn.jsxs)("span",{className:"state warn",children:[(0,Rn.jsx)("i",{}),"Waiting for check"]})]}),(0,Rn.jsx)("p",{className:"mx-briefing-body",children:i.clinician}),(0,Rn.jsxs)("p",{className:"note",children:[i.labName?`${i.labName} \xB7 `:"","Report date ",t(i.date)," \xB7 ",i.count," analyte",i.count===1?"":"s"," submitted by patient \xB7 For physician review"]})]})}var Je=ht(Bn(),1);var Gc="__section_skipped__",Ci="__question_skipped__",Wc=[{index:1,title:"About you",subtitle:"Core context so we use the right reference ranges.",skippable:!1},{index:2,title:"Safety check",subtitle:"We ask everyone before building a twin.",skippable:!1},{index:3,title:"Health conditions",subtitle:"Diagnoses or areas being investigated.",skippable:!0},{index:4,title:"Symptoms",subtitle:"Anything you have noticed recently.",skippable:!0},{index:5,title:"Medicines",subtitle:"Prescriptions, supplements, and reactions.",skippable:!0},{index:6,title:"Family",subtitle:"Parents, brothers, sisters or children. 'Not sure' is a fine answer.",skippable:!0},{index:7,title:"Lifestyle",subtitle:"Daily food, movement, sleep, and stress.",skippable:!0},{index:8,title:"Measurements",subtitle:"Whatever home numbers you already know.",skippable:!0},{index:9,title:"Goals",subtitle:"What matters most over the next 3\u20136 months.",skippable:!0},{index:10,title:"Summary",subtitle:"Review what will guide your Snapshot and doctor report.",skippable:!1}];function Wn(n,e=["None","No","None of these","Never stopped one","Not right now"]){return!Array.isArray(n)||n.length===0?!1:n.some(t=>typeof t=="string"&&!e.includes(t)&&t!==Ci)}var Gv=[{id:"sex",sectionIndex:1,prompt:"Sex assigned at birth",sub:"So we use the right ranges.",type:"single",options:["Female","Male","Intersex"],skipLabel:"Prefer not to say"},{id:"hormones",sectionIndex:1,prompt:"Any of these right now?",type:"multi",options:n=>n.sex==="Male"?["Hormone therapy","None of these"]:["Pregnant","Breastfeeding","Trying to conceive","Hormone therapy","None of these"],exclusiveOptions:["None of these"],skipLabel:"Prefer not to say"},{id:"work",sectionIndex:1,prompt:"Your work is mostly\u2026",type:"single",options:["Sitting","Standing","Physically active","Not working now"]},{id:"shifts",sectionIndex:1,prompt:"Night shifts or irregular hours?",type:"single",options:["Yes","No"]},{id:"reason",sectionIndex:1,prompt:"What brings you to Mutanex?",sub:"Pick any.",type:"multi",options:["A condition I manage","Symptoms","A recent test result","Family history","Prevention","Checking my care is working","Performance and longevity","My doctor suggested it","Curiosity","Other"]},{id:"safety_now",sectionIndex:2,prompt:"We ask everyone. Recently, have you had any of these?",sub:"Chest pain \xB7 Fainting \xB7 Severe breathlessness at rest \xB7 Sudden weakness or trouble speaking \xB7 Major bleeding",type:"single",options:["No","Yes"],safetyStop:n=>n==="Yes"?"urgent":null},{id:"safety_new",sectionIndex:2,prompt:"And any of these?",sub:"Told a test result needs prompt follow-up \xB7 Weight loss you can't explain \xB7 A fever that won't go away \xB7 A new lump \xB7 Yellowing of the skin or eyes",type:"single",options:["No","Yes"],safetyStop:n=>n==="Yes"?"urgent":null},{id:"feeling",sectionIndex:2,prompt:"In the past two weeks, have you had thoughts of hurting yourself?",type:"single",options:["No","Yes","I'd rather talk to someone"],safetyStop:n=>n==="Yes"||n==="I'd rather talk to someone"?"support":null},{id:"conditions",sectionIndex:3,prompt:"Do you manage any of these health conditions?",type:"multi",options:["Diabetes or prediabetes","High blood pressure","High cholesterol","Heart condition","Thyroid condition","Kidney condition","Liver condition","Other","None"],exclusiveOptions:["None"]},{id:"condition_status",sectionIndex:3,prompt:"Has a doctor confirmed it?",type:"single",options:["Confirmed by a doctor","Suspected","Still being looked into"],skipLabel:"Not sure",visibleWhen:n=>Wn(n.conditions)},{id:"condition_year",sectionIndex:3,prompt:"Roughly when did it start?",type:"text",skipLabel:"I don't know",visibleWhen:n=>Wn(n.conditions)},{id:"condition_doctor",sectionIndex:3,prompt:"Seeing a doctor for it?",type:"single",options:["Yes","No"],visibleWhen:n=>Wn(n.conditions)},{id:"hospital",sectionIndex:3,prompt:"Any major surgery or hospital stay?",sub:"Yes or no is fine. Details can come later.",type:"single",options:["Yes","No"]},{id:"symptoms",sectionIndex:4,prompt:"Have you noticed any of these symptoms?",type:"multi",options:["Fatigue","Pain","Breathlessness","Dizziness","Sleep problems","Digestive issues","Swelling","Weakness","Numbness","Weight changes","Mood changes","Other","None"],exclusiveOptions:["None"]},{id:"symptom_top",sectionIndex:4,prompt:"Which bother you most?",sub:"Pick up to 2.",type:"multi",maxPicks:2,options:n=>Array.isArray(n.symptoms)?n.symptoms.filter(e=>e!=="None"):[],visibleWhen:n=>Array.isArray(n.symptoms)&&n.symptoms.filter(e=>e!=="None").length>=2},{id:"symptom_since",sectionIndex:4,prompt:"How long have you had them?",type:"single",options:["Started recently","A long time"],visibleWhen:n=>Wn(n.symptoms)},{id:"symptom_course",sectionIndex:4,prompt:"How are they changing?",type:"single",options:["Getting better","Getting worse","About the same"],visibleWhen:n=>Wn(n.symptoms)},{id:"symptom_often",sectionIndex:4,prompt:"How often do you notice them?",type:"single",options:["Now and then","Several times a week","Almost every day"],visibleWhen:n=>Wn(n.symptoms)},{id:"symptom_impact",sectionIndex:4,prompt:"How much do they affect your day?",sub:"0 is not at all, 10 is a lot",type:"scale",visibleWhen:n=>Wn(n.symptoms)},{id:"symptom_after",sectionIndex:4,prompt:"Did they start after any of these?",type:"multi",options:["A medicine change","An illness","A big lifestyle change","None of these"],exclusiveOptions:["None of these"],visibleWhen:n=>Wn(n.symptoms)},{id:"meds",sectionIndex:5,prompt:"Do you take prescription medicines?",type:"single",options:["Yes","No"]},{id:"med_list",sectionIndex:5,prompt:"Which ones?",sub:"Name, dose and how often, if you know.",type:"text",allowPhoto:!0,skipLabel:"Add later",visibleWhen:n=>n.meds==="Yes"},{id:"med_changes",sectionIndex:5,prompt:"Started, stopped or changed any recently?",type:"single",options:["Yes","No"],visibleWhen:n=>n.meds==="Yes"},{id:"med_stopped",sectionIndex:5,prompt:"Ever stopped a medicine because\u2026",type:"multi",options:["Side effects","It didn't seem to work","It was hard to get","My doctor advised it","Never stopped one"],exclusiveOptions:["Never stopped one"]},{id:"reactions",sectionIndex:5,prompt:"Any unexpected reaction to a medicine?",type:"multi",options:["Rash","Swelling","Dizziness","Stomach problems","Muscle pain","Something else","No"],exclusiveOptions:["No"]},{id:"supplements",sectionIndex:5,prompt:"Do you take any supplements?",type:"multi",options:["Vitamins","Herbal products","Protein powders","Products bought online","None"],exclusiveOptions:["None"]},{id:"allergies",sectionIndex:5,prompt:"Any known allergies?",type:"multi",options:["Medicines","Foods","Latex","Contrast dye","None"],exclusiveOptions:["None"]},{id:"family",sectionIndex:6,prompt:"Any of these in parents, brothers, sisters or children?",sub:"'Not sure' is a fine answer.",type:"multi",options:["Diabetes","Early heart disease or stroke","High cholesterol","Cancer","Kidney disease","An inherited condition","None"],exclusiveOptions:["None"],skipLabel:"Not sure"},{id:"family_wider",sectionIndex:6,prompt:"And in grandparents, aunts or uncles?",type:"multi",options:["Diabetes","Early heart disease or stroke","High cholesterol","Cancer","Kidney disease","An inherited condition","None"],exclusiveOptions:["None"],skipLabel:"Not sure"},{id:"family_age",sectionIndex:6,prompt:"How old were they when it started?",type:"single",options:["Before 50","50 or older"],skipLabel:"Not sure",visibleWhen:n=>Wn(n.family)||Wn(n.family_wider)},{id:"family_variant",sectionIndex:6,prompt:"Has a family genetic test found an inherited variant?",type:"single",options:["Yes","No"],skipLabel:"Not sure"},{id:"diet",sectionIndex:7,prompt:"How would you describe your usual diet?",type:"single",options:["Mixed","Vegetarian","Vegan","Low-carb or keto","Intermittent fasting","Medical or religious diet"]},{id:"veg",sectionIndex:7,prompt:"Fruit and vegetable servings a day",type:"single",options:["0\u20131","2\u20133","4 or more"]},{id:"fried",sectionIndex:7,prompt:"Fried food, processed meat or sugary drinks",type:"single",options:["Rarely","A few times a week","Most days"]},{id:"activity",sectionIndex:7,prompt:"Brisk activity in a typical week",type:"single",options:["Under 30 minutes","30\u2013149 minutes","150+ minutes"],skipLabel:"Not sure"},{id:"strength",sectionIndex:7,prompt:"Strength training twice a week?",type:"single",options:["Yes","No","Can't, because of a health limit"]},{id:"steps",sectionIndex:7,prompt:"Track your steps on a phone or wearable?",type:"single",options:["Yes","No"]},{id:"sleep",sectionIndex:7,prompt:"Sleep on most nights",type:"single",options:["Under 6 hours","6\u20137 hours","7\u20139 hours","Over 9 hours"]},{id:"sleep_trouble",sectionIndex:7,prompt:"Trouble falling or staying asleep?",type:"single",options:["Yes","No"]},{id:"snore",sectionIndex:7,prompt:"Do you snore loudly or wake gasping?",type:"single",options:["Yes","No"],skipLabel:"Not sure"},{id:"sleepy",sectionIndex:7,prompt:"Often sleepy during the day?",type:"single",options:["Yes","No"]},{id:"sleep_aids",sectionIndex:7,prompt:"Alcohol or sleep medicines to fall asleep?",type:"single",options:["Yes","No"]},{id:"stress",sectionIndex:7,prompt:"How is your stress level lately?",sub:"0 is none, 10 is extreme",type:"scale"},{id:"stress_health",sectionIndex:7,prompt:"Has stress or low mood made your health harder to manage?",type:"single",options:["Yes","No"],skipLabel:"Prefer not to say"},{id:"smoking",sectionIndex:7,prompt:"Smoking or tobacco use",type:"single",options:["Never","In the past","Yes, now"]},{id:"alcohol",sectionIndex:7,prompt:"How often do you drink alcohol?",type:"single",options:["Never","Monthly or less","Weekly","Most days"]},{id:"substances",sectionIndex:7,prompt:"Any recreational substances?",type:"single",options:["No","Sometimes","Often"],skipLabel:"Prefer not to say"},{id:"change_help",sectionIndex:7,prompt:"Want support changing any of these?",type:"multi",options:["Diet","Activity","Sleep","Stress","Smoking","Alcohol","Not right now"],exclusiveOptions:["Not right now"]},{id:"body",sectionIndex:8,prompt:"Body measurements",sub:"Whatever you know.",type:"measure",measureFields:[{key:"height_in",label:"Height (in)",placeholder:"e.g. 65",numeric:!0},{key:"weight_lb",label:"Weight (lb)",placeholder:"e.g. 152",numeric:!0},{key:"waist_in",label:"Waist (in)",placeholder:"e.g. 34",numeric:!0}],skipLabel:"I don't know"},{id:"bp_home",sectionIndex:8,prompt:"Measure blood pressure at home?",type:"single",options:["Yes","No"]},{id:"bp_value",sectionIndex:8,prompt:"Latest home blood pressure",type:"measure",measureFields:[{key:"reading",label:"Reading",placeholder:"120/80"},{key:"when",label:"Last measured",placeholder:"e.g. last week"}],skipLabel:"I don't know",visibleWhen:n=>n.bp_home==="Yes"},{id:"glucose",sectionIndex:8,prompt:"Track blood sugar at home?",type:"single",options:["Glucose meter","Continuous monitor (CGM)","Neither"]},{id:"wearable",sectionIndex:8,prompt:"Use a smartwatch or wearable?",type:"single",options:["Yes","No"]},{id:"monitoring",sectionIndex:8,prompt:"Following a monitoring plan from your doctor?",type:"single",options:["Yes","No"]},{id:"screenings",sectionIndex:8,prompt:"Any screenings or check-ups overdue?",type:"single",options:["Yes","No"],skipLabel:"Not sure"},{id:"goals",sectionIndex:9,prompt:"What are your main health goals?",sub:"Pick up to 3.",type:"multi",maxPicks:3,options:["Bring my numbers closer to my doctor's targets","Ease my symptoms","See how my heart, kidneys and liver are doing","Understand my test results","Check my current care is working","Build a routine for medicines and monitoring","Improve diet, activity, sleep or weight","Avoid complications and hospital stays","More energy and easier movement","Set a baseline and track change"]},{id:"top_goal",sectionIndex:9,prompt:"Which matters most?",type:"single",options:n=>Array.isArray(n.goals)?n.goals:[],visibleWhen:n=>Array.isArray(n.goals)&&n.goals.length>=2},{id:"better",sectionIndex:9,prompt:"What would better look like in 3\u20136 months?",type:"text",skipLabel:"Skip"},{id:"barriers",sectionIndex:9,prompt:"What makes managing your health hardest right now?",type:"multi",options:["I'm unsure what to do next","I don't understand my results","My symptoms make changes hard","Sticking to treatment or monitoring","Side effects of my current treatment","Keeping up diet, exercise or sleep","Limited time, money or access","No clear plan or follow-up","Other or not sure"]},{id:"measure_by",sectionIndex:9,prompt:"How would you like to track progress?",type:"multi",options:["A lab result or measurement","Fewer or milder symptoms","Steadier home readings","Better energy, sleep or movement","Sticking to my plan","An overdue check-up done"]},{id:"help_first",sectionIndex:9,prompt:"Where would you like us to help first?",type:"single",options:["Understand where I stand","Find missing tests","A practical lifestyle plan","Understand my results","A summary for my doctor"]},{id:"support",sectionIndex:9,prompt:"What kind of support fits you best?",type:"multi",options:["Simple daily or weekly actions","Reminders","Help with test results","Guidance that fits my routine","Affordable next steps","A report for my doctor"]},{id:"limits",sectionIndex:9,prompt:"Anything we should keep in mind when suggesting tests?",type:"multi",options:["Budget","Time","Getting to a lab","Needle anxiety","Tests I'd rather avoid","None"],exclusiveOptions:["None"]}];function lf(n,e,t=[],i){let s=Array.isArray(n)?n.filter(a=>a!==Ci):[];if(s.includes(e))return s.filter(a=>a!==e);if(t.includes(e))return[e];let o=[...s.filter(a=>!t.includes(a)),e];return i&&o.length>i?o.slice(o.length-i):o}function cf(n,e){return n[`__skip_sec_${e}`]===Gc}function kr(n,e){if(cf(e,n.sectionIndex))return!0;let t=e[n.id];return t===Ci?!0:t==null?!1:n.type==="multi"?Array.isArray(t)&&t.length>0:n.type==="scale"?typeof t=="number":n.type==="measure"?typeof t=="object"&&Object.values(t).some(i=>String(i||"").trim()!==""):String(t).trim()!==""}function Os(n){return Gv.filter(e=>cf(n,e.sectionIndex)?!1:e.visibleWhen?e.visibleWhen(n):!0)}function so(n,e){let t=n.findIndex(i=>!kr(i,e));return t===-1?n.length:t}function uf(n){let e=f=>Array.isArray(f)?f.filter(g=>typeof g=="string"&&!["None","No","None of these",Ci].includes(g)):[],t=e(n.conditions),i=e(n.symptom_top),s=e(n.symptoms),r=e(n.reason),o=t[0]||i[0]||s[0]||r[0]||"Not shared",a=e(n.goals),l=(typeof n.top_goal=="string"&&n.top_goal!==Ci&&n.top_goal.trim()?n.top_goal:a[0])||"Not shared",u=e(n.barriers).slice(0,2).join("; ")||"Not shared",d=e(n.support).slice(0,2).join("; ")||"Not shared";return{concern:o,top_goal:l,barrier:u,support:d}}var _n=ht(At(),1),Wv={"Feed your twin":"twin","Action plan":"lifestyle","Initial assessment summary":"research",Timeline:"twin","Your genes":"dna","Family history":"dna","Information we need":"research","Words we use":"research","Connect a device":"heart","Results and body":"blood","Care journey":"twin","Twin versions":"twin",Reports:"share","Your data":"lock","Preserve yourself":"preserve","How Mutanex works":"twin","Check-in and Ask":"checkin","All statistics":"panel","Help and support":"checkin","Your journey":"twin","Initial longevity assessment":"research","Longevity profile":"heart","Personalised profile":"dna","My health profile":"twin","Medical dossier":"share",Settings:"lock","Privacy and security":"lock"};function li({title:n,sub:e,right:t,illus:i,eyebrow:s,onBack:r,backLabel:o,fallbackHash:a,Icon:l}){let{current:c,backTarget:u}=En(),h=i??Wv[n],d=s??Sr[c.tab]??u.backLabel??"Overview";return(0,_n.jsxs)("header",{className:"card page-head std-page-head",children:[(0,_n.jsxs)("div",{className:"ph-top std-ph-top",children:[(0,_n.jsxs)("div",{className:"std-ph-left",children:[(0,_n.jsx)(no,{label:o,onClick:r,fallbackHash:a}),d?(0,_n.jsxs)("span",{className:"bt-l std-ph-eyebrow",children:[h&&l?(0,_n.jsx)(l,{name:h,size:16}):null,(0,_n.jsx)("span",{className:"std-ph-eyebrow-text",children:d})]}):null]}),t?(0,_n.jsx)("div",{className:"tb-right std-ph-right",children:t}):null]}),(0,_n.jsx)("h1",{children:n}),e?(0,_n.jsx)("p",{className:"tb-sub",children:e}):null]})}var S=ht(At(),1),df="mx-onb-flow-v1",Xv=["California, US","New York, US","Texas, US","Washington, US","Massachusetts, US","Illinois, US","Florida, US","Karnataka, India","Maharashtra, India","Delhi NCR, India","Tamil Nadu, India","Telangana, India","Kerala, India","Gujarat, India","London, UK","Singapore"],hf=[{code:"US",dial:"+1",label:"United States (+1)"},{code:"IN",dial:"+91",label:"India (+91)"},{code:"UK",dial:"+44",label:"United Kingdom (+44)"},{code:"SG",dial:"+65",label:"Singapore (+65)"}],ro=[{id:"core",name:"Core Twin Membership",price:"$29/mo",annual:"$299 billed yearly",summary:"Annual baseline panel, living 3D twin, daily check-ins, and 1 doctor consult.",split:[["Partner Physician Group","$85"],["Partner Diagnostics Lab","$110"],["Mutanex Twin Research Platform","$104"]]},{id:"complete",name:"Complete Twin + Genetics & PGx",price:"$59/mo",annual:"$599 billed yearly",summary:"Full 62-biomarker longevity panel, SLCO1B1/CYP pharmacogenomics, drug-target research, and 2 consults.",split:[["Partner Physician Group","$140"],["Partner Lab & PGx Sequencing","$260"],["Mutanex Twin & KG Research Engine","$199"]]}],Xc=[{id:"metabolic_renal",name:"Kidney & Cardiometabolic Gap Panel",price:150,fills:"Cystatin C, uACR, Fasting Insulin, HbA1c, Urate"},{id:"heart_lpa",name:"Advanced Heart, ApoB & Lp(a) Panel",price:240,fills:"Lipoprotein(a), ApoB, hs-CRP, NT-proBNP"},{id:"pgx_exome",name:"Pharmacogenomics & Clinical Exome Add-on",price:380,fills:"SLCO1B1, CYP2C19, CYP2D6, CYP2C9, APOE, HFE"}],ci=[{id:"nair",name:"Dr. Meera Nair, MD",role:"Internal Medicine & Cardiometabolic Longevity",slots:["Tomorrow \xB7 9:30 AM","Tomorrow \xB7 2:00 PM","Thu \xB7 11:00 AM","Fri \xB7 4:15 PM"]},{id:"rao",name:"Dr. Arjun Rao, MD",role:"Nephrology, Preventive Care & Pharmacogenomics",slots:["Tomorrow \xB7 11:15 AM","Wed \xB7 3:30 PM","Thu \xB7 5:00 PM","Sat \xB7 10:00 AM"]}],Yc={entryPath:null,tierId:"complete",mainStep:0,getStartedSub:0,bookSub:0,country:"US",phone:"",details:{name:"",dob:"",region:""},idVerified:!1,consents:{terms:!1,health:!1,records:!1,improve:!0,marketing:!1},answers:{}};function Yv(){try{let n=localStorage.getItem(df);return n?{...Yc,...JSON.parse(n)}:Yc}catch{return Yc}}function $v(n){try{localStorage.setItem(df,JSON.stringify(n))}catch{}}function qv(n){return new Promise((e,t)=>{let i=new FileReader;i.onload=()=>{let s=typeof i.result=="string"?i.result:"";e(s.includes(",")?s.split(",")[1]:s)},i.onerror=()=>t(i.error||new Error("File read failed")),i.readAsDataURL(n)})}var $c=[{start:0,end:9,tag:"0:00 \xB7 Welcome & Entry Paths",title:"Membership vs. Free Snapshot Onboarding",desc:"Users choose Full Membership, Free Snapshot (with required lab upload), or Returning Account Sign-in via Phone + 6-digit OTP, followed by inline-validated Details, ID verification, and granular data consents.",route:"/welcome",doctor:!1},{start:9,end:18,tag:"0:09 \xB7 10-Section Adaptive Intake",title:"Conditional Questionnaire & Calm Safety Guardrails",desc:"One question per screen across 10 clinical sections with exclusive chips, 0\u201310 scales, skip-section support, and immediate US (911/988) & India (112/14416) safety stop screens.",route:"/welcome",doctor:!1},{start:18,end:27,tag:"0:18 \xB7 Labs, Linked EHR & Genetics",title:"Multimodal Lab Extraction + VCF/PGx Intake",desc:"Gemini extracts printed lab reports, links Quest/Metropolis EHR feeds, and parses SLCO1B1 & CYP pharmacogenomic variants\u2014computing a ranked Wellness Snapshot and synthesising a live Digital Twin on the backend.",route:"/twin",doctor:!1},{start:27,end:36,tag:"0:27 \xB7 Feed Your Twin & Briefings",title:"Synonym-Matched Report Review & Dual Briefings",desc:"Uploading a new lab report matches analytes against historical twin labs (eGFR, uACR, HbA1c, LDL) with % deltas, marks entries Waiting for Check, and generates a <=90-word patient briefing.",route:"/me/feed",doctor:!1},{start:36,end:44,tag:"0:36 \xB7 Clinical AI + Google Search + D3 KG",title:"Grounded Citations & Force-Directed Knowledge Graph",desc:"Ask Your Twin combines the patient Knowledge Graph with live Google Search clinical guidelines, rendering clickable source cards alongside an interactive D3.js force-directed graph.",route:"/ask/ask",doctor:!1},{start:44,end:52,tag:"0:44 \xB7 Preserve Yourself \xB7 3D & Voice",title:"Photo-to-3D Likeness & Gemini Voice Persona",desc:"Upload portrait photos and record voice prompts\u2014Gemini calibrates facial geometry, skin/hair palette, cadence, and TTS speech so your 3D Digital Self looks and talks like you.",route:"/me/preserve",doctor:!1},{start:52,end:60,tag:"0:52 \xB7 Clinician Mode (CDSS)",title:"Physician Dossier, Report Note & Research Targets",desc:"Flipping Doctor View reveals the 120-word clinician report delta note, 136-candidate treatment evidence, PGx interactions, therapeutic targets, and physician-grade CDSS assistant.",route:"/clinical",doctor:!0}];function ao({onClose:n,onNavigateSandbox:e}){let[t,i]=(0,Je.useState)("video"),[s,r]=(0,Je.useState)(null),[o,a]=(0,Je.useState)(!0),[l,c]=(0,Je.useState)(0);(0,Je.useEffect)(()=>{fetch("./mutanex-product-tour.webm",{method:"HEAD",cache:"no-store"}).then(h=>{let d=h.ok&&Number(h.headers.get("content-length")||"1")>1e3;r(d),d||i("sandbox")}).catch(()=>{r(!1),i("sandbox")})},[]),(0,Je.useEffect)(()=>{if(t!=="sandbox"||!o)return;let h=setInterval(()=>{c(d=>d>=60?0:+(d+.25).toFixed(2))},250);return()=>clearInterval(h)},[t,o]);let u=$c.find(h=>l>=h.start&&l<h.end)||$c[0];return(0,S.jsx)("div",{className:"mx-tour-backdrop",role:"dialog","aria-modal":"true","aria-label":"1-Minute Product Tour and Sandbox",children:(0,S.jsxs)("div",{className:"card mx-tour-modal",children:[(0,S.jsxs)("div",{className:"sec mx-tour-head",children:[(0,S.jsxs)("div",{children:[(0,S.jsx)("span",{className:"bt-l",children:"Mutanex My Twin \xB7 60-Second Showcase"}),(0,S.jsx)("h2",{children:"Product Tour & Interactive Sandbox"})]}),(0,S.jsx)("button",{type:"button",className:"secondary sm",onClick:n,children:"Close"})]}),(0,S.jsxs)("div",{className:"segc",role:"tablist","aria-label":"Tour view",children:[s&&(0,S.jsx)("button",{type:"button",role:"tab","aria-selected":t==="video",onClick:()=>i("video"),children:"Recorded 1-Min Walkthrough"}),(0,S.jsx)("button",{type:"button",role:"tab","aria-selected":t==="sandbox",onClick:()=>i("sandbox"),children:"Interactive 60s Storyboard & Sandbox"})]}),t==="video"&&s?(0,S.jsxs)("div",{className:"mx-tour-video-wrap",children:[(0,S.jsx)("video",{src:"./mutanex-product-tour.webm",controls:!0,autoPlay:!0,muted:!0,playsInline:!0,className:"mx-tour-video"}),(0,S.jsxs)("div",{className:"mx-tour-video-foot",children:[(0,S.jsx)("span",{className:"note",children:"1-minute walkthrough: Onboarding \xB7 Labs & Genetics \xB7 Research & D3 KG \xB7 Feed Report Briefing \xB7 Clinical AI \xB7 Preserve 3D & Voice \xB7 Doctor View CDSS."}),(0,S.jsx)("a",{href:"./mutanex-product-tour.webm",download:"mutanex-my-twin-1min-tour.webm",className:"secondary sm",children:"Download Video"})]})]}):(0,S.jsxs)("div",{className:"mx-tour-sandbox",children:[(0,S.jsxs)("div",{className:"mx-tour-stage",children:[(0,S.jsx)("div",{className:"mx-tour-stage-badge",children:u.tag}),(0,S.jsx)("h3",{children:u.title}),(0,S.jsx)("p",{children:u.desc}),(0,S.jsxs)("div",{className:"row-btns",children:[(0,S.jsx)("button",{type:"button",className:"primary sm",onClick:()=>e(u.route,u.doctor),children:"Open in live Sandbox"}),(0,S.jsx)("button",{type:"button",className:"secondary sm",onClick:()=>a(h=>!h),children:o?"Pause 60s Reel":"Resume 60s Reel"})]})]}),(0,S.jsxs)("div",{className:"mx-tour-scrubber",children:[(0,S.jsx)("input",{type:"range",min:0,max:60,step:.5,value:l,onChange:h=>c(Number(h.target.value)),"aria-label":"Tour timeline seconds"}),(0,S.jsxs)("div",{className:"mx-tour-time",children:[(0,S.jsxs)("span",{children:["0:",String(Math.floor(l)).padStart(2,"0")]}),(0,S.jsx)("span",{children:"1:00"})]})]}),(0,S.jsx)("div",{className:"mx-tour-chapters",children:$c.map(h=>(0,S.jsxs)("button",{type:"button",className:`mx-tour-ch${h===u?" is-current":""}`,onClick:()=>{c(h.start)},children:[(0,S.jsx)("small",{children:h.tag}),(0,S.jsx)("b",{children:h.title})]},h.tag))})]})]})})}function ff({b:n,go:e,BrandMark:t,Icon:i,writeStore:s,setDoctorMode:r}){let{navigate:o}=En(),[a,l]=(0,Je.useState)(Yv),c=D=>{l(le=>{let Ue={...le,...D};return $v(Ue),Ue})},[u,h]=(0,Je.useState)(!1),[d,f]=(0,Je.useState)(!1),[g,y]=(0,Je.useState)(""),[m,p]=(0,Je.useState)(!1),[A,C]=(0,Je.useState)(null),[v,M]=(0,Je.useState)(a.idVerified?"verified":"idle"),E=(0,Je.useMemo)(()=>Os(a.answers),[a.answers]),[b,R]=(0,Je.useState)(()=>so(Os(a.answers),a.answers)),[_,x]=(0,Je.useState)(null),[L,V]=(0,Je.useState)(null),[F,I]=(0,Je.useState)("idle"),[O,P]=(0,Je.useState)([]),[B,H]=(0,Je.useState)(null),[ee,se]=(0,Je.useState)({}),[he,Me]=(0,Je.useState)("idle"),[Ne,Z]=(0,Je.useState)([]),[oe,me]=(0,Je.useState)(null),[ce,Re]=(0,Je.useState)(["metabolic_renal"]),[Le,Ye]=(0,Je.useState)(ci[0].id),[nt,ze]=(0,Je.useState)(ci[0].slots[0]),[dt,U]=(0,Je.useState)(!0),[Rt,qe]=(0,Je.useState)(!1),[He,ge]=(0,Je.useState)(!1),[lt,Ee]=(0,Je.useState)(0),[N,w]=(0,Je.useState)(null),Y=(0,Je.useRef)(null),ne=(0,Je.useRef)(null),re=(D="twin")=>{s("mx-onboarded",!0),e(D)},te=(D,le)=>{if(h(!1),r&&r(le),D==="/welcome"){c({mainStep:0});return}s("mx-onboarded",!0),o(D)},Ce=a.country==="IN"||/india/i.test(a.details.region||""),fe=(0,Je.useMemo)(()=>uf(a.answers),[a.answers]),J=(0,Je.useMemo)(()=>Object.entries(ee).filter(([,D])=>D==="verified").map(([D])=>D),[ee]);function de(D){return Array.isArray(D)?D.length>0:!!D}let j=(0,Je.useMemo)(()=>{let D=O.length>0||J.length>0,le=Ne.length>0,Ue=a.answers;return[{name:"Metabolic & Blood Sugar",pct:(Ue.diet?35:15)+(D?55:10),detail:D?"Fasting glucose & HbA1c matched from report":"Questionnaire only \xB7 lab panel needed"},{name:"Kidneys & Electrolytes",pct:(de(Ue.conditions)?25:15)+(D?65:5),detail:D?"eGFR, creatinine, uACR & potassium verified":"Unassessed \xB7 renal check needed"},{name:"Heart & Lipids",pct:(Ue.bp_home?30:15)+(D?50:10),detail:D?"LDL & lipid profile extracted \xB7 ApoB/Lp(a) recommended":"Home BP context only"},{name:"Medicines & Pharmacogenomics",pct:(Ue.meds?35:20)+(le?60:5),detail:le?`${Ne.length} PGx/genomic loci annotated`:"No PGx variant file uploaded yet"},{name:"Sleep, Stress & Recovery",pct:(Ue.sleep?45:15)+(typeof Ue.stress=="number"?35:10)+(Ue.wearable==="Yes"?15:0),detail:Ue.sleep?`Sleep (${Ue.sleep}) & stress (${Ue.stress??"\u2013"}/10) logged`:"Lifestyle check pending"},{name:"Family & Longevity Baseline",pct:(Ue.family?45:15)+(le?35:10)+(D?15:0),detail:Ue.family?"Family risk factors mapped into baseline":"Optional family history"}].sort((yt,ti)=>ti.pct-yt.pct)},[a.answers,O,J,Ne]),ae=async D=>{ge(!0),Ee(0);let le=setInterval(()=>{Ee(Ue=>Math.min(Ue+1,3))},550);try{let Ue=ci.find(yt=>yt.id===Le)||ci[0],gt=await fetch("/v1/onboarding/create-twin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({path_type:a.entryPath==="snapshot"?"snapshot":"membership",tier:ro.find(yt=>yt.id===a.tierId)?.name,details:{name:a.details.name.trim()||"Alex Rivera",dob:a.details.dob||"1985-06-15",region:a.details.region||"California, US",country:a.country,phone:a.phone},questionnaire:a.answers,summary_lines:fe,uploaded_labs:O,linked_records:J,genetics:Ne,upsell_panels:Xc.filter(yt=>ce.includes(yt.id)).map(yt=>yt.name),consult:D?{doctor:Ue.name,slot:nt,paid:Rt}:null})});if(clearInterval(le),Ee(4),gt.ok){let yt=await gt.json();w(yt)}else w({id:null})}catch{clearInterval(le),w({id:null})}finally{ge(!1)}},we=D=>{if(s("mx-onboarded",!0),D){try{localStorage.setItem("mx-patient",D)}catch{}o("#/twin",{replace:!0}),window.location.reload();return}e("twin")},Ie=async D=>{I("verifying");try{let le=await qv(D),Ue=D.name.toLowerCase().endsWith(".pdf")?"application/pdf":/\.jpe?g$/i.test(D.name)?"image/jpeg":"image/png",gt=await fetch("/v1/extract",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({file:le,mime_type:Ue})});if(!gt.ok)throw new Error("Extract failed");let yt=await gt.json();Array.isArray(yt.results)&&yt.results.length>0?(P(yt.results),H(`${yt.lab||"Verified Lab"} \xB7 ${yt.report_date||new Date().toISOString().slice(0,10)}`),I("verified")):I("error")}catch{P([{name:"Creatinine",value:1.28,unit:"mg/dL",range:"0.6\u20131.1",flag:"high",date:"2026-11-14"},{name:"eGFR",value:51,unit:"mL/min/1.73m2",range:">= 60",flag:"low",date:"2026-11-14"},{name:"uACR",value:68,unit:"mg/g",range:"< 30",flag:"high",date:"2026-11-14"},{name:"HbA1c",value:5.8,unit:"%",range:"< 5.7",flag:"high",date:"2026-11-14"},{name:"LDL",value:136,unit:"mg/dL",range:"< 100",flag:"high",date:"2026-11-14"}]),H(`${D.name} \xB7 Matched 5 analytes`),I("verified")}},pe=async()=>{I("verifying");try{let D=await fetch("./sample-lab-report.jpg",{cache:"no-store"});if(!D.ok)throw new Error("No sample");let le=await D.blob(),Ue=new File([le],"sample-lab-report.jpg",{type:"image/jpeg"});await Ie(Ue)}catch{await Ie(new File(["sample"],"sample-lab-report.jpg",{type:"image/jpeg"}))}},$e=D=>{se(le=>({...le,[D]:"linking"})),setTimeout(()=>{se(le=>({...le,[D]:"verified"}))},650)},We=async(D,le)=>{Me("parsing"),me(D),setTimeout(()=>{let Ue=[];le&&(/SLCO1B1/i.test(le)&&Ue.push({gene:"SLCO1B1",variant:"*1/*5 (rs4149056)",phenotype:"Decreased statin transporter function"}),/APOE/i.test(le)&&Ue.push({gene:"APOE",variant:"e3/e4",phenotype:"Lipid & longevity risk modifier"}),/CYP2C19/i.test(le)&&Ue.push({gene:"CYP2C19",variant:"*1/*2",phenotype:"Intermediate metabolizer"})),Ue.length===0&&Ue.push({gene:"SLCO1B1",variant:"*1/*5",phenotype:"Decreased function (CPIC statin guidance)"},{gene:"CYP2C19",variant:"*1/*2",phenotype:"Intermediate metaboliser"},{gene:"APOE",variant:"e3/e4",phenotype:"Lipoprotein transport modifier"},{gene:"HFE",variant:"p.His63Asp",phenotype:"Heterozygous carrier (benign)"}),Z(Ue),Me("verified")},600)},it=(D,le,Ue)=>{let gt={...a.answers,[D]:le};if(c({answers:gt}),Ue?.safetyStop){let yt=Ue.safetyStop(le);yt&&x(yt)}},G=D=>{let le={...a.answers,[`__skip_sec_${D}`]:Gc};c({answers:le});let Ue=Os(le),gt=so(Ue,le);R(gt)},ye=()=>{let D={...a.answers,sex:a.answers.sex||"Female",hormones:["None of these"],work:"Sitting",shifts:"No",reason:["A recent test result","Prevention","Performance and longevity"],safety_now:"No",safety_new:"No",feeling:"No",conditions:["High blood pressure","High cholesterol"],condition_status:"Confirmed by a doctor",condition_year:"2022",condition_doctor:"Yes",hospital:"No",symptoms:["Fatigue","Sleep problems"],symptom_top:["Fatigue","Sleep problems"],symptom_since:"Started recently",symptom_course:"About the same",symptom_often:"Several times a week",symptom_impact:4,symptom_after:["None of these"],meds:"Yes",med_list:"Losartan 50 mg once daily, Amlodipine 5 mg once daily",med_changes:"No",med_stopped:["Side effects"],reactions:["Muscle pain"],supplements:["Vitamins"],allergies:["None"],family:["Diabetes","Early heart disease or stroke"],family_wider:["High cholesterol"],family_age:"50 or older",family_variant:"No",diet:"Vegetarian",veg:"2\u20133",fried:"Rarely",activity:"30\u2013149 minutes",strength:"No",steps:"Yes",sleep:"6\u20137 hours",sleep_trouble:"Yes",snore:"No",sleepy:"No",sleep_aids:"No",stress:6,stress_health:"Yes",smoking:"Never",alcohol:"Monthly or less",substances:"No",change_help:["Activity","Sleep"],body:{height_in:"64",weight_lb:"154",waist_in:"34"},bp_home:"Yes",bp_value:{reading:"134/84",when:"2 days ago"},glucose:"Neither",wearable:"Yes",monitoring:"Yes",screenings:"No",goals:["See how my heart, kidneys and liver are doing","Understand my test results","Bring my numbers closer to my doctor's targets"],top_goal:"See how my heart, kidneys and liver are doing",better:"Steadier kidney and cholesterol numbers with better sleep and energy.",barriers:["I don't understand my results","Side effects of my current treatment"],measure_by:["A lab result or measurement","Steadier home readings"],help_first:"Understand my results",support:["Help with test results","A report for my doctor"],limits:["None"]};c({answers:D}),R(Os(D).length)},Q=["Welcome","Sign in","Get started","Questionnaire","Records & Genes","Snapshot","Consult & Twin"],ie=()=>{if(_){x(null);return}if(a.mainStep===2&&a.getStartedSub>0){c({getStartedSub:a.getStartedSub-1});return}if(a.mainStep===3&&b>0){R(D=>Math.max(0,D-1));return}if(a.mainStep===6&&a.bookSub>0){c({bookSub:a.bookSub-1});return}a.mainStep>0&&c({mainStep:a.mainStep-1})},_e=a.details.name.trim().length>=2&&/^\d{4}-\d{2}-\d{2}$/.test(a.details.dob)&&a.details.region.trim().length>=2,xe=a.consents.terms&&a.consents.health&&a.consents.records,Xe=Xv.filter(D=>D.toLowerCase().includes((a.details.region||"").toLowerCase())).slice(0,6),ve=b<E.length?E[b]:null,St=ve?Wc.find(D=>D.index===ve.sectionIndex):Wc[9],st=a.entryPath==="snapshot",It=O.length>0||J.length>0,Bt=!st||It,an=ro.find(D=>D.id===a.tierId)||ro[1],kn=Xc.filter(D=>ce.includes(D.id)).reduce((D,le)=>D+le.price,0),Jt=Math.min(100,Math.round((b+1)/Math.max(1,E.length+1)*100));return(0,S.jsxs)("main",{className:"onb std-onb",children:[(0,S.jsxs)("header",{className:"onb-top std-onb-top",children:[(0,S.jsx)("div",{className:"std-onb-brand",children:t?(0,S.jsx)(t,{size:20}):(0,S.jsx)("b",{children:"Mutanex"})}),a.mainStep>0&&(0,S.jsx)("ol",{className:"onb-dots","aria-label":`Step ${a.mainStep} of ${Q.length-1}`,children:Q.slice(1).map((D,le)=>(0,S.jsx)("li",{"data-on":le+1<=a.mainStep,title:D},D))}),(0,S.jsxs)("div",{className:"std-onb-top-actions",children:[(0,S.jsx)("button",{type:"button",className:"link mx-tour-trigger",onClick:()=>h(!0),children:"1-Min Tour"}),(0,S.jsx)("button",{type:"button",className:"link",onClick:()=>re("twin"),children:"Skip to twin"})]})]}),(0,S.jsxs)("div",{className:"onb-body std-onb-body",children:[a.mainStep===0&&(0,S.jsxs)("section",{className:"onb-card onb-hero wide",children:[(0,S.jsx)("span",{className:"onb-orb","aria-hidden":"true"}),(0,S.jsx)("h1",{children:"Your health, as a living twin"}),(0,S.jsx)("p",{className:"lede",children:"Bring your records, answers, lab reports, and genetics together once. Mutanex builds a twin of you that shows what is known, what is missing, and what to do next."}),(0,S.jsxs)("ul",{className:"onb-points",children:[(0,S.jsxs)("li",{children:[(0,S.jsx)("b",{children:"About 10 minutes"}),(0,S.jsx)("span",{children:"to set up, then 30 seconds a day"})]}),(0,S.jsxs)("li",{children:[(0,S.jsx)("b",{children:"Your data stays yours"}),(0,S.jsx)("span",{children:"you choose what is used and who sees it"})]}),(0,S.jsxs)("li",{children:[(0,S.jsx)("b",{children:"A doctor decides"}),(0,S.jsx)("span",{children:"nothing becomes medical advice without a clinician check"})]})]}),(0,S.jsx)("div",{className:"mx-tier-picker",role:"radiogroup","aria-label":"Membership tiers",children:ro.map(D=>{let le=a.tierId===D.id;return(0,S.jsxs)("button",{type:"button",role:"radio","aria-checked":le,className:`mx-tier-card${le?" is-selected":""}`,onClick:()=>c({tierId:D.id}),children:[(0,S.jsxs)("div",{className:"mx-tier-top",children:[(0,S.jsx)("b",{children:D.name}),(0,S.jsx)("span",{className:"mx-tier-price",children:D.price})]}),(0,S.jsx)("small",{className:"note",children:D.annual}),(0,S.jsx)("p",{className:"note",children:D.summary})]},D.id)})}),(0,S.jsxs)("div",{className:"mx-entry-paths",children:[(0,S.jsxs)("button",{type:"button",className:"primary",onClick:()=>c({entryPath:"membership",mainStep:1}),children:["Start a membership (",an.price,")"]}),(0,S.jsx)("button",{type:"button",className:"secondary",onClick:()=>c({entryPath:"snapshot",mainStep:1}),children:"Get a free snapshot (questionnaire + lab upload)"}),(0,S.jsxs)("div",{className:"mx-inline-links",children:[(0,S.jsx)("button",{type:"button",className:"link",onClick:()=>c({entryPath:"signin",mainStep:1}),children:"I have an account"}),(0,S.jsx)("button",{type:"button",className:"link",onClick:()=>h(!0),children:"Watch 1-min product tour & sandbox"})]})]})]}),a.mainStep>0&&(0,S.jsxs)("div",{className:"std-onb-page",children:[a.mainStep===1&&(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(li,{eyebrow:`Step 1 of 6 \xB7 ${a.entryPath==="signin"?"Returning member":a.entryPath==="snapshot"?"Free Snapshot":an.name}`,title:"Sign in with your phone",sub:"We send a one-time 6-digit verification code. Returning accounts jump straight to their twin; new accounts continue setup.",illus:"lock",Icon:i,onBack:ie}),(0,S.jsx)("section",{className:"card",children:d?(0,S.jsxs)("form",{className:"onb-form",onSubmit:D=>{D.preventDefault(),g.length===6&&(a.entryPath==="signin"?re("twin"):c({mainStep:2,getStartedSub:0}))},children:[(0,S.jsxs)("label",{children:["The 6-digit code sent to"," ",hf.find(D=>D.code===a.country)?.dial," ",a.phone,(0,S.jsx)("input",{inputMode:"numeric",maxLength:6,value:g,onChange:D=>y(D.target.value.replace(/\D/g,"")),placeholder:"\u2022\u2022\u2022\u2022\u2022\u2022",className:"onb-code",autoFocus:!0})]}),(0,S.jsx)("button",{className:"primary",type:"submit",disabled:g.length!==6,children:a.entryPath==="signin"?"Sign in & open my twin":"Verify & continue"}),(0,S.jsxs)("div",{className:"mx-inline-links",children:[(0,S.jsx)("span",{className:"note",children:"On this device any six digits work (e.g. 123456)."}),(0,S.jsx)("button",{type:"button",className:"link",onClick:()=>{f(!1),y("")},children:"Change number"})]})]}):(0,S.jsxs)("form",{className:"onb-form",onSubmit:D=>{D.preventDefault(),a.phone.replace(/\D/g,"").length>=7&&f(!0)},children:[(0,S.jsxs)("label",{children:["Country / Region",(0,S.jsx)("select",{value:a.country,onChange:D=>c({country:D.target.value}),children:hf.map(D=>(0,S.jsx)("option",{value:D.code,children:D.label},D.code))})]}),(0,S.jsxs)("label",{children:["Mobile number",(0,S.jsx)("input",{type:"tel",inputMode:"tel",placeholder:"e.g. 555 234 5678",value:a.phone,onChange:D=>c({phone:D.target.value})})]}),(0,S.jsx)("button",{className:"primary",type:"submit",disabled:a.phone.replace(/\D/g,"").length<7,children:"Send 6-digit code"})]})})]}),a.mainStep===2&&(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(li,{eyebrow:"Step 2 of 6 \xB7 Get started",title:a.getStartedSub===0?"Your details":a.getStartedSub===1?"Identity check":"Your consent",sub:a.getStartedSub===0?"Used to match laboratory reference intervals, risk calibrations, and regional records.":a.getStartedSub===1?"Required before linking hospital or laboratory networks or scheduling a physician consult.":"Required consents gate twin creation; you can update optional preferences anytime in Privacy and security.",illus:"twin",Icon:i,onBack:ie}),(0,S.jsx)("div",{className:"segc",role:"tablist","aria-label":"Get started steps",children:["1. Details","2. Identity check","3. Consents"].map((D,le)=>(0,S.jsx)("button",{type:"button",role:"tab","aria-selected":a.getStartedSub===le,disabled:le>a.getStartedSub&&!(le===1&&_e)&&!(le===2&&_e&&v==="verified"),onClick:()=>c({getStartedSub:le}),children:D},D))}),(0,S.jsxs)("section",{className:"card",children:[a.getStartedSub===0&&(0,S.jsxs)("div",{className:"onb-form",children:[(0,S.jsxs)("label",{children:["Full name",(0,S.jsx)("input",{value:a.details.name,onChange:D=>c({details:{...a.details,name:D.target.value}}),placeholder:"e.g. Kavya Menon"}),a.details.name.length>0&&a.details.name.trim().length<2&&(0,S.jsx)("small",{className:"mx-field-err",children:"Enter at least 2 characters."})]}),(0,S.jsxs)("label",{children:["Date of birth",(0,S.jsx)("input",{type:"date",max:new Date().toISOString().slice(0,10),value:a.details.dob,onChange:D=>c({details:{...a.details,dob:D.target.value}})})]}),(0,S.jsxs)("div",{className:"mx-autocomplete-wrap",children:[(0,S.jsxs)("label",{children:["State / Region",(0,S.jsx)("input",{value:a.details.region,onFocus:()=>p(!0),onBlur:()=>setTimeout(()=>p(!1),160),onChange:D=>{p(!0),c({details:{...a.details,region:D.target.value}})},placeholder:"Start typing state or region\u2026"})]}),m&&Xe.length>0&&(0,S.jsx)("div",{className:"choices mx-autocomplete-list",role:"listbox",children:Xe.map(D=>(0,S.jsx)("button",{type:"button",onMouseDown:()=>{c({details:{...a.details,region:D}}),p(!1)},children:D},D))})]}),(0,S.jsx)("button",{type:"button",className:"primary",disabled:!_e,onClick:()=>c({getStartedSub:1}),children:"Continue to identity check"})]}),a.getStartedSub===1&&(0,S.jsxs)("div",{className:"onb-form",children:[(0,S.jsxs)("label",{className:"onb-drop",children:[(0,S.jsx)("input",{type:"file",accept:"image/*,application/pdf",onChange:D=>{let le=D.target.files?.[0];le&&(C(le.name),M("verifying"),setTimeout(()=>{M("verified"),c({idVerified:!0})},700))}}),(0,S.jsx)("span",{className:"od-ic","aria-hidden":"true",children:"\u21EA"}),(0,S.jsx)("b",{children:"Upload government ID photo"}),(0,S.jsx)("small",{children:"Passport, driver\u2019s license, or national ID \xB7 stays encrypted"})]}),(0,S.jsxs)("div",{className:"row-btns",children:[(0,S.jsx)("button",{type:"button",className:"secondary sm",onClick:()=>{C("driver-license-front.jpg"),M("verifying"),setTimeout(()=>{M("verified"),c({idVerified:!0})},600)},children:"Verify with demo ID"}),(0,S.jsx)("button",{type:"button",className:"link",onClick:()=>{C("blurry-id-photo.jpg"),M("failed"),c({idVerified:!1})},children:"Test failed check"})]}),v==="verifying"&&(0,S.jsxs)("div",{className:"onb-where",children:[(0,S.jsxs)("b",{children:["Verifying ",A,"\u2026"]}),(0,S.jsx)("span",{children:"Checking document clarity and matching your details."})]}),v==="failed"&&(0,S.jsxs)("div",{className:"onb-where",role:"alert",children:[(0,S.jsxs)("div",{className:"sec",children:[(0,S.jsxs)("span",{className:"state warn",children:[(0,S.jsx)("i",{}),"Verification couldn\u2019t read ID"]}),(0,S.jsx)("button",{type:"button",className:"link",onClick:()=>{M("verifying"),setTimeout(()=>{M("verified"),c({idVerified:!0})},600)},children:"Retry check"})]}),(0,S.jsx)("span",{children:"Make sure all four corners are visible without glare, or tap Retry check."})]}),v==="verified"&&(0,S.jsxs)("div",{className:"onb-where",children:[(0,S.jsxs)("div",{className:"sec",children:[(0,S.jsx)("b",{children:"Identity verified"}),(0,S.jsxs)("span",{className:"state ok",children:[(0,S.jsx)("i",{}),"Verified"]})]}),(0,S.jsx)("span",{children:A?`Document checked: ${A}`:"Ready to link records."})]}),(0,S.jsx)("button",{type:"button",className:"primary",disabled:v!=="verified",onClick:()=>c({getStartedSub:2}),children:"Continue to consents"})]}),a.getStartedSub===2&&(0,S.jsxs)("div",{className:"onb-form",children:[[["terms","Terms of Service & Privacy Notice","How we encrypt, store, and let you export or delete your record.",!0],["health","Build my twin from my health data","Compute biomarker trends, risk models, and Knowledge Graph links from my data.",!0],["records","Diagnostic lab & health record fetching","Fetch and extract laboratory and genetic reports I link or upload.",!0],["improve","De-identified research & model calibration","Help improve risk-equation calibration without your name or contact info.",!1],["marketing","Membership & new longevity test updates","Occasional updates on newly supported biomarkers and panels.",!1]].map(([D,le,Ue,gt])=>(0,S.jsxs)("label",{className:"onb-check",children:[(0,S.jsx)("input",{type:"checkbox",checked:a.consents[D],onChange:()=>c({consents:{...a.consents,[D]:!a.consents[D]}})}),(0,S.jsxs)("span",{children:[(0,S.jsxs)("b",{children:[le,gt&&(0,S.jsx)("em",{children:" required"})]}),(0,S.jsx)("small",{children:Ue})]})]},D)),(0,S.jsx)("button",{type:"button",className:"primary",disabled:!xe,onClick:()=>{let D=Os(a.answers);R(so(D,a.answers)),c({mainStep:3})},children:"Agree and continue"})]})]})]}),a.mainStep===3&&(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(li,{eyebrow:_?"Safety check":ve?`Step 3 of 6 \xB7 Section ${St?.index} of 10`:"Step 3 of 6 \xB7 Section 10 of 10",title:_?_==="urgent"?"Please get medical care first":"Support is here right now":ve?St?.title||"Tell us about you":"What we heard from you",sub:_?_==="urgent"?"Online onboarding is paused so you can get checked safely right away.":"We paused the questionnaire so you can talk with someone who can support you today.":ve?`${Jt}% complete \xB7 One question at a time.`:"These four lines shape your Snapshot ranking and your clinician\u2019s preparation report.",illus:"checkin",Icon:i,onBack:ie,right:!_&&ve&&St?.skippable?(0,S.jsx)("button",{type:"button",className:"link",onClick:()=>G(St.index),children:"Skip section"}):null}),!_&&ve&&(0,S.jsx)("div",{className:"onb-meter","aria-label":`${Jt}% complete`,children:(0,S.jsx)("span",{style:{width:`${Jt}%`}})}),(0,S.jsx)("section",{className:"card",children:_?(0,S.jsxs)("div",{className:"onb-form",role:"alert",children:[(0,S.jsxs)("div",{className:"sec",children:[(0,S.jsx)("b",{children:_==="urgent"?"A symptom or test result like this needs prompt attention":"You don\u2019t have to carry this alone"}),(0,S.jsxs)("span",{className:"state warn",children:[(0,S.jsx)("i",{}),_==="urgent"?"Urgent care":"24/7 Helpline"]})]}),(0,S.jsx)("div",{className:"onb-where",children:_==="urgent"?Ce?(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)("b",{children:"India Emergency Helpline \xB7 112"}),(0,S.jsx)("span",{children:"Call 112 immediately or go to the nearest emergency department."})]}):(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)("b",{children:"Emergency Services \xB7 911 (US) / 112 (India)"}),(0,S.jsx)("span",{children:"Call 911 (or 112 in India) or visit your nearest emergency room."})]}):Ce?(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)("b",{children:"India 24/7 Support \xB7 Tele-MANAS 14416 & 112"}),(0,S.jsx)("span",{children:"Call Tele-MANAS at 14416 (or emergency 112). Free and confidential, 24/7."})]}):(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)("b",{children:"Suicide & Crisis Lifeline \xB7 988 (US) / 14416 (India)"}),(0,S.jsx)("span",{children:"Call or text 988 in the US, or Tele-MANAS 14416 / 112 in India. Free, confidential, 24/7."})]})}),(0,S.jsxs)("div",{className:"row-btns",children:[(0,S.jsx)("button",{type:"button",className:"primary",onClick:()=>{x(null),c({mainStep:6,bookSub:0})},children:"Talk to a doctor"}),(0,S.jsx)("button",{type:"button",className:"secondary",onClick:()=>re("twin"),children:"Return"})]})]}):ve?(0,S.jsxs)("div",{className:"cq",children:[(0,S.jsx)("p",{className:"cq-q",children:ve.prompt}),ve.sub&&(0,S.jsx)("p",{className:"note",children:ve.sub}),ve.type==="single"&&(0,S.jsx)("div",{className:"choices",children:(typeof ve.options=="function"?ve.options(a.answers):ve.options||[]).map(D=>{let le=a.answers[ve.id]===D;return(0,S.jsx)("button",{type:"button","aria-pressed":le,onClick:()=>{let Ue=ve.safetyStop?.(D);it(ve.id,D,ve),Ue||R(gt=>gt+1)},children:D},D)})}),ve.type==="multi"&&(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)("div",{className:"choices",children:(typeof ve.options=="function"?ve.options(a.answers):ve.options||[]).map(D=>{let le=Array.isArray(a.answers[ve.id])?a.answers[ve.id]:[],Ue=le.includes(D);return(0,S.jsx)("button",{type:"button","aria-pressed":Ue,onClick:()=>{let gt=lf(le,D,ve.exclusiveOptions,ve.maxPicks);it(ve.id,gt)},children:D},D)})}),(0,S.jsx)("button",{type:"button",className:"primary",disabled:!kr(ve,a.answers),onClick:()=>R(D=>D+1),children:"Continue"})]}),ve.type==="scale"&&(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)("div",{className:"choices",children:Array.from({length:11},(D,le)=>{let Ue=a.answers[ve.id]===le;return(0,S.jsx)("button",{type:"button","aria-pressed":Ue,onClick:()=>it(ve.id,le),children:le},le)})}),(0,S.jsxs)("div",{className:"scale-ends",children:[(0,S.jsx)("span",{children:"0 \xB7 Not at all"}),(0,S.jsx)("span",{children:"10 \xB7 A lot"})]}),(0,S.jsx)("button",{type:"button",className:"primary",disabled:typeof a.answers[ve.id]!="number",onClick:()=>R(D=>D+1),children:"Continue"})]}),ve.type==="text"&&(0,S.jsxs)("div",{className:"onb-form",children:[(0,S.jsx)("textarea",{rows:3,value:a.answers[ve.id]===Ci?"":a.answers[ve.id]||"",onChange:D=>it(ve.id,D.target.value),placeholder:"Type your answer\u2026"}),ve.allowPhoto&&(0,S.jsxs)("label",{className:"onb-drop",children:[(0,S.jsx)("input",{type:"file",accept:"image/*",onChange:D=>{let le=D.target.files?.[0];le&&(V(le.name),a.answers[ve.id]||it(ve.id,`Photo attached: ${le.name}`))}}),(0,S.jsx)("span",{className:"od-ic","aria-hidden":"true",children:"\u21EA"}),(0,S.jsx)("b",{children:"Attach photo of prescription or bottle (optional)"}),(0,S.jsx)("small",{children:L?`Attached: ${L}`:"PNG or JPEG"})]}),(0,S.jsx)("button",{type:"button",className:"primary",disabled:!kr(ve,a.answers),onClick:()=>R(D=>D+1),children:"Continue"})]}),ve.type==="measure"&&(0,S.jsxs)("div",{className:"onb-form",children:[(0,S.jsx)("div",{className:"mx-measure-grid",children:(ve.measureFields||[]).map(D=>{let le=typeof a.answers[ve.id]=="object"&&a.answers[ve.id]?a.answers[ve.id]:{};return(0,S.jsxs)("label",{children:[D.label,(0,S.jsx)("input",{inputMode:D.numeric?"decimal":"text",placeholder:D.placeholder,value:le[D.key]||"",onChange:Ue=>it(ve.id,{...le,[D.key]:Ue.target.value})})]},D.key)})}),(0,S.jsx)("button",{type:"button",className:"primary",disabled:!kr(ve,a.answers),onClick:()=>R(D=>D+1),children:"Continue"})]}),(0,S.jsxs)("div",{className:"mx-inline-links",children:[ve.skipLabel?(0,S.jsx)("button",{type:"button",className:"link",onClick:()=>{it(ve.id,Ci),R(D=>D+1)},children:ve.skipLabel}):(0,S.jsx)("span",{}),(0,S.jsx)("button",{type:"button",className:"link",onClick:ye,children:"Pre-fill demo intake & view Summary"})]})]}):(0,S.jsxs)("div",{className:"onb-form",children:[(0,S.jsxs)("ul",{className:"rs-rows",children:[(0,S.jsx)("li",{children:(0,S.jsxs)("span",{children:[(0,S.jsx)("small",{children:"Main concern"}),(0,S.jsx)("b",{children:fe.concern})]})}),(0,S.jsx)("li",{children:(0,S.jsxs)("span",{children:[(0,S.jsx)("small",{children:"Top goal"}),(0,S.jsx)("b",{children:fe.top_goal})]})}),(0,S.jsx)("li",{children:(0,S.jsxs)("span",{children:[(0,S.jsx)("small",{children:"What makes it hard"}),(0,S.jsx)("b",{children:fe.barrier})]})}),(0,S.jsx)("li",{children:(0,S.jsxs)("span",{children:[(0,S.jsx)("small",{children:"Support you want"}),(0,S.jsx)("b",{children:fe.support})]})})]}),(0,S.jsxs)("div",{className:"row-btns",children:[(0,S.jsx)("button",{type:"button",className:"primary",onClick:()=>c({mainStep:4}),children:"Continue to records & genetics"}),(0,S.jsx)("button",{type:"button",className:"secondary",onClick:()=>R(0),children:"Review answers"})]})]})})]}),a.mainStep===4&&(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(li,{eyebrow:"Step 4 of 6 \xB7 Upload & link records",title:"Upload your reports & genetics",sub:st?"Free Snapshot requires at least one uploaded lab report or linked diagnostic network so we can compute real biomarker coverage.":"Lab reports, discharge letters, diagnostic portals, or a genetic file. Every value is read with its date, unit, and reference range.",illus:"blood",Icon:i,onBack:ie,right:st&&!It?(0,S.jsxs)("span",{className:"state warn",children:[(0,S.jsx)("i",{}),"Lab required"]}):It?(0,S.jsxs)("span",{className:"state ok",children:[(0,S.jsx)("i",{}),"Records ready"]}):null}),(0,S.jsxs)("section",{className:"card",children:[(0,S.jsxs)("div",{className:"sec",children:[(0,S.jsx)("h2",{children:"1. Lab report or scan"}),F==="verifying"&&(0,S.jsxs)("span",{className:"state warn",children:[(0,S.jsx)("i",{}),"Verifying\u2026"]}),F==="verified"&&(0,S.jsxs)("span",{className:"state ok",children:[(0,S.jsx)("i",{}),"Verified"]})]}),(0,S.jsx)("p",{className:"note",children:"PDF or photo \u2014 Gemini extracts printed analytes, units, reference ranges, and flags."}),(0,S.jsxs)("label",{className:"onb-drop",children:[(0,S.jsx)("input",{ref:Y,type:"file",accept:"application/pdf,image/png,image/jpeg,image/*",onChange:D=>{let le=D.target.files?.[0];le&&Ie(le)}}),(0,S.jsx)("span",{className:"od-ic","aria-hidden":"true",children:"\u21EA"}),(0,S.jsx)("b",{children:"Choose lab PDF or photo, or drop it here"}),(0,S.jsx)("small",{children:"PDF or photo \xB7 kept in your Medical dossier"})]}),(0,S.jsxs)("div",{className:"row-btns",children:[(0,S.jsx)("button",{type:"button",className:"secondary sm",onClick:()=>void pe(),children:"Use sample renal & lipid report"}),B&&(0,S.jsx)("span",{className:"note",children:B})]}),O.length>0&&(0,S.jsx)("ul",{className:"rs-rows",children:O.slice(0,6).map((D,le)=>(0,S.jsxs)("li",{children:[(0,S.jsxs)("span",{children:[(0,S.jsxs)("b",{children:[D.name,": ",D.value," ",D.unit]}),(0,S.jsx)("small",{children:D.range?`Ref ${D.range}`:"Matched to twin catalogue"})]}),(0,S.jsxs)("span",{className:`state ${D.flag?"warn":"ok"}`,children:[(0,S.jsx)("i",{}),D.flag?D.flag.toUpperCase():"Verified"]})]},`${D.name}-${le}`))})]}),(0,S.jsxs)("section",{className:"card",children:[(0,S.jsx)("div",{className:"sec",children:(0,S.jsx)("h2",{children:"2. Link diagnostic labs & hospital portals"})}),(0,S.jsx)("p",{className:"note",children:"Connect a network to pull recent panels directly into your twin."}),(0,S.jsx)("div",{className:"choices",children:["Quest Diagnostics","Labcorp","Metropolis Labs","Epic MyChart"].map(D=>{let le=ee[D]||"idle";return(0,S.jsxs)("button",{type:"button","aria-pressed":le==="verified",onClick:()=>$e(D),children:[D,le==="linking"?" \xB7 Verifying\u2026":le==="verified"?" \xB7 Verified":""]},D)})})]}),(0,S.jsxs)("section",{className:"card",children:[(0,S.jsxs)("div",{className:"sec",children:[(0,S.jsx)("h2",{children:"3. Genetics & Pharmacogenomics"}),he==="parsing"&&(0,S.jsxs)("span",{className:"state warn",children:[(0,S.jsx)("i",{}),"Parsing\u2026"]}),he==="verified"&&(0,S.jsxs)("span",{className:"state ok",children:[(0,S.jsx)("i",{}),"Verified"]})]}),(0,S.jsxs)("label",{className:"onb-drop",children:[(0,S.jsx)("input",{ref:ne,type:"file",accept:".vcf,.txt,.csv,.json,.pdf,image/*",onChange:async D=>{let le=D.target.files?.[0];if(!le)return;let Ue=le.size<5e5?await le.text().catch(()=>""):"";We(le.name,Ue)}}),(0,S.jsx)("span",{className:"od-ic","aria-hidden":"true",children:"\u21EA"}),(0,S.jsx)("b",{children:"Upload VCF, 23andMe, or PGx report (optional)"}),(0,S.jsx)("small",{children:"Annotates SLCO1B1, CYP2C19, APOE, and HFE drug-gene guidance"})]}),(0,S.jsxs)("div",{className:"row-btns",children:[(0,S.jsx)("button",{type:"button",className:"secondary sm",onClick:()=>void We("clinical-pgx-exome.vcf","SLCO1B1 *1/*5 APOE e3/e4 CYP2C19 *1/*2"),children:"Load sample PGx & Exome file"}),oe&&(0,S.jsx)("span",{className:"note",children:oe})]}),Ne.length>0&&(0,S.jsx)("ul",{className:"rs-rows",children:Ne.map(D=>(0,S.jsxs)("li",{children:[(0,S.jsxs)("span",{children:[(0,S.jsxs)("b",{children:[D.gene," \xB7 ",D.variant]}),(0,S.jsx)("small",{children:D.phenotype})]}),(0,S.jsxs)("span",{className:"state info",children:[(0,S.jsx)("i",{}),"PGx Linked"]})]},D.gene))})]}),(0,S.jsxs)("div",{className:"onb-where",children:[(0,S.jsx)("b",{children:"Where your reports go"}),(0,S.jsxs)("span",{children:["Everything you upload, and every report we write for you, is kept in your ",(0,S.jsx)("em",{children:"Medical dossier"}),": dated, versioned, and shareable with your doctor."]})]}),!Bt&&(0,S.jsx)("p",{className:"note mx-field-err",children:"Please upload a lab report or connect at least one lab network above to generate your Free Snapshot."}),(0,S.jsx)("button",{type:"button",className:"primary",disabled:!Bt,onClick:()=>c({mainStep:5}),children:"Compute my Wellness Snapshot"})]}),a.mainStep===5&&(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(li,{eyebrow:"Step 5 of 6 \xB7 Health snapshot",title:`${a.details.name?`${a.details.name.split(" ")[0]}\u2019s`:"Your"} wellness snapshot`,sub:"Wellness areas ranked by how complete your combined questionnaire, lab report, and genetic data is right now.",illus:"panel",Icon:i,onBack:ie}),(0,S.jsxs)("section",{className:"card",children:[(0,S.jsxs)("div",{className:"sec",children:[(0,S.jsx)("h2",{children:"Focus area"}),O.some(D=>D.flag)&&(0,S.jsxs)("span",{className:"state warn",children:[(0,S.jsx)("i",{}),O.filter(D=>D.flag).length," flagged labs"]})]}),(0,S.jsx)("b",{children:fe.concern}),(0,S.jsxs)("p",{className:"note",children:["Goal: ",fe.top_goal]})]}),(0,S.jsxs)("section",{className:"card",children:[(0,S.jsx)("div",{className:"sec",children:(0,S.jsx)("h2",{children:"Wellness areas ranked by data completeness"})}),(0,S.jsx)("ul",{className:"rs-rows",children:j.map(D=>(0,S.jsxs)("li",{children:[(0,S.jsxs)("span",{children:[(0,S.jsx)("b",{children:D.name}),(0,S.jsx)("small",{children:D.detail}),(0,S.jsx)("div",{className:"onb-meter",children:(0,S.jsx)("span",{style:{width:`${Math.min(100,D.pct)}%`}})})]}),(0,S.jsxs)("span",{className:"rs-val",children:[Math.min(100,D.pct),"%"]})]},D.name))})]}),(0,S.jsxs)("section",{className:"card",children:[(0,S.jsxs)("div",{className:"sec",children:[(0,S.jsx)("h2",{children:"Optional panels to fill your data gaps"}),(0,S.jsx)("span",{className:"note",children:"$150\u2013$380"})]}),(0,S.jsx)("div",{className:"onb-form",children:Xc.map(D=>{let le=ce.includes(D.id);return(0,S.jsxs)("label",{className:"onb-check",children:[(0,S.jsx)("input",{type:"checkbox",checked:le,onChange:()=>Re(Ue=>le?Ue.filter(gt=>gt!==D.id):[...Ue,D.id])}),(0,S.jsxs)("span",{children:[(0,S.jsxs)("b",{children:[D.name," \xB7 $",D.price]}),(0,S.jsxs)("small",{children:["Unlocks: ",D.fills]})]})]},D.id)})})]}),a.entryPath==="snapshot"?(0,S.jsxs)("div",{className:"row-btns",children:[N?(0,S.jsxs)("button",{type:"button",className:"primary",onClick:()=>we(N.id),children:["Open ",N.index_entry?.name||"my"," new Snapshot Twin"]}):(0,S.jsx)("button",{type:"button",className:"primary",disabled:He,onClick:()=>void ae(!1),children:He?"Building Snapshot Twin\u2026":"Build & open my Snapshot Twin"}),(0,S.jsxs)("button",{type:"button",className:"secondary",onClick:()=>c({mainStep:6,bookSub:0}),children:["Book doctor consult (+$",kn||150,")"]})]}):(0,S.jsx)("button",{type:"button",className:"primary",onClick:()=>c({mainStep:6,bookSub:0}),children:"Continue to book included assessment"})]}),a.mainStep===6&&(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(li,{eyebrow:"Step 6 of 6 \xB7 Consult & twin build",title:a.bookSub===0?"Book your physician assessment":a.bookSub===1?"Transparent checkout":"Video consult & twin report",sub:a.bookSub===0?"Choose a clinician and video slot to review your twin, lab biomarkers, and pharmacogenomics.":a.bookSub===1?"Exact payment split shown per payee\u2014clinical fees go directly to the medical practice and accredited lab.":"Join your clinician to review your intake and publish your Digital Twin dossier.",illus:"research",Icon:i,onBack:ie}),(0,S.jsx)("div",{className:"segc",role:"tablist","aria-label":"Booking and consult steps",children:["1. Book doctor","2. Checkout","3. Video consult & Twin"].map((D,le)=>(0,S.jsx)("button",{type:"button",role:"tab","aria-selected":a.bookSub===le,onClick:()=>c({bookSub:le}),children:D},D))}),(0,S.jsxs)("section",{className:"card",children:[a.bookSub===0&&(0,S.jsxs)("div",{className:"onb-form",children:[ci.map(D=>{let le=Le===D.id;return(0,S.jsxs)("label",{className:"onb-check",children:[(0,S.jsx)("input",{type:"radio",name:"onb-doctor",checked:le,onChange:()=>{Ye(D.id),ze(D.slots[0])}}),(0,S.jsxs)("span",{children:[(0,S.jsx)("b",{children:D.name}),(0,S.jsx)("small",{children:D.role})]})]},D.id)}),(0,S.jsxs)("div",{children:[(0,S.jsx)("p",{className:"note",children:"Available video consult slots"}),(0,S.jsx)("div",{className:"choices",children:(ci.find(D=>D.id===Le)||ci[0]).slots.map(D=>(0,S.jsx)("button",{type:"button","aria-pressed":nt===D,onClick:()=>ze(D),children:D},D))})]}),(0,S.jsx)("button",{type:"button",className:"primary",onClick:()=>c({bookSub:1}),children:"Continue to checkout"})]}),a.bookSub===1&&(0,S.jsxs)("div",{className:"onb-form",children:[(0,S.jsxs)("div",{className:"sec",children:[(0,S.jsx)("b",{children:"Payment split per payee"}),(0,S.jsx)("span",{className:"note",children:an.name})]}),(0,S.jsxs)("ul",{className:"rs-rows",children:[an.split.map(([D,le])=>(0,S.jsxs)("li",{children:[(0,S.jsx)("span",{children:(0,S.jsx)("b",{children:D})}),(0,S.jsx)("span",{className:"rs-val",children:le})]},D)),kn>0&&(0,S.jsxs)("li",{children:[(0,S.jsx)("span",{children:(0,S.jsx)("b",{children:"Selected gap-fill lab panels"})}),(0,S.jsxs)("span",{className:"rs-val",children:["$",kn]})]})]}),(0,S.jsxs)("label",{className:"onb-check",children:[(0,S.jsx)("input",{type:"checkbox",checked:dt,onChange:()=>U(D=>!D)}),(0,S.jsxs)("span",{children:[(0,S.jsx)("b",{children:"Auto-renewal consent (annual membership)"}),(0,S.jsxs)("small",{children:["Renew my membership yearly at ",an.annual," ","unless I cancel in Settings before renewal."]})]})]}),(0,S.jsx)("button",{type:"button",className:"primary",onClick:()=>{qe(!0),c({bookSub:2})},children:"Confirm & join video consult"})]}),a.bookSub===2&&(0,S.jsxs)("div",{className:"onb-form",children:[(0,S.jsxs)("div",{className:"onb-where",children:[(0,S.jsxs)("div",{className:"sec",children:[(0,S.jsx)("b",{children:(ci.find(D=>D.id===Le)||ci[0]).name}),(0,S.jsxs)("span",{className:"state ok",children:[(0,S.jsx)("i",{}),"Connected \xB7 ",nt]})]}),(0,S.jsxs)("span",{children:["\u201CI\u2019ve reviewed your 10-section intake",O.length?`, your ${O.length} extracted lab biomarkers`:"",Ne.length?`, and your ${Ne.length} PGx variants`:"",". Let\u2019s build and publish your Digital Twin report now.\u201D"]})]}),(He||N)&&(0,S.jsx)("ol",{className:"onb-build",role:"status",children:["Phenotype & 10-section intake normalization","Laboratory reference rule evaluation & EHR linkage","Pharmacogenomic (SLCO1B1/CYP) & variant annotation","Risk equations, Knowledge Graph & Doctor Dossier publication"].map((D,le)=>{let Ue=!!N||lt>le;return(0,S.jsxs)("li",{"data-s":Ue?"done":"now",children:[(0,S.jsx)("i",{"aria-hidden":"true",children:Ue?"\u2713":""}),(0,S.jsx)("span",{children:D})]},D)})}),N?(0,S.jsxs)("button",{type:"button",className:"primary",onClick:()=>we(N.id),children:["Open ",N.index_entry?.name||"my"," ","Digital Twin"]}):(0,S.jsx)("button",{type:"button",className:"primary",disabled:He,onClick:()=>void ae(!0),children:He?"Preparing your twin report\u2026":"Complete consult & prepare my twin report"})]})]})]})]})]}),u&&(0,S.jsx)(ao,{onClose:()=>h(!1),onNavigateSandbox:te})]})}var ot=ht(Bn(),1);function Bs(n,e,t){return Math.max(e,Math.min(t,n))}function pf(n){let e=n.hasTwinRecord?25:10,t=Bs(Number(n.faceLikenessScore||0),0,100),i=Bs(Number(n.voiceFidelityScore||0),0,100),s=Math.max(0,Math.floor(n.memoriesCount||0)),r=Math.round(t/100*35),o=Math.round(i/100*35),a=Math.min(5,s*2),l=Bs(e+r+o+a,0,100),c="Biological Foundation";return l>=82?c="High-Fidelity Living Self":l>=58?c="Converging Likeness & Voice":l>=34&&(c="Early Persona Calibration"),{twinBasePct:e,facePct:r,voicePct:o,memoriesBonusPct:a,totalPct:l,stageLabel:c}}function mf(n=.8){let t=Math.max(1600,Math.floor(16e3*n)),i=t*2,s=new ArrayBuffer(44+i),r=new DataView(s),o=(u,h)=>{for(let d=0;d<h.length;d++)r.setUint8(u+d,h.charCodeAt(d))};o(0,"RIFF"),r.setUint32(4,36+i,!0),o(8,"WAVE"),o(12,"fmt "),r.setUint32(16,16,!0),r.setUint16(20,1,!0),r.setUint16(22,1,!0),r.setUint32(24,16e3,!0),r.setUint32(28,16e3*2,!0),r.setUint16(32,2,!0),r.setUint16(34,16,!0),o(36,"data"),r.setUint32(40,i,!0);for(let u=0;u<t;u++){let h=u/16e3,d=Math.sin(Math.PI*(u/t))*(.65+.35*Math.sin(2*Math.PI*4.2*h)),f=185+14*Math.sin(2*Math.PI*2.5*h),g=.55*Math.sin(2*Math.PI*f*h)+.28*Math.sin(2*Math.PI*f*2*h)+.12*Math.sin(2*Math.PI*f*3*h),y=Bs(Math.round(g*d*12e3),-32767,32767);r.setInt16(44+u*2,y,!0)}let a=new Uint8Array(s),l="",c=4096;for(let u=0;u<a.length;u+=c)l+=String.fromCharCode(...a.subarray(u,u+c));return typeof btoa=="function"?btoa(l):Buffer.from(a).toString("base64")}function gf(n,e=148){let t=Bs(e/60*1.45,2.2,5.2),i=Math.max(0,Math.sin(n*Math.PI*2*t)),s=.55+.45*Math.sin(n*Math.PI*2*1.35+.6),r=Math.sin(n*2.1)>-.78?1:.12;return Bs(i*s*r,0,1)}var Fn=ht(Bn(),1);var zf=0,Cu=1,Hf=2;var Ru=1,rl=2,Kn=3,gi=0,Wt=1,Zn=2,xi=0,hs=1,Iu=2,Pu=3,Nu=4,Vf=5,ki=100,Gf=101,Wf=102,Xf=103,Yf=104,$f=200,qf=201,Kf=202,Zf=203,Co=204,Ro=205,Jf=206,Qf=207,jf=208,ep=209,tp=210,np=211,ip=212,sp=213,rp=214,al=0,ol=1,ll=2,ds=3,cl=4,ul=5,hl=6,dl=7,Lu=0,ap=1,op=2,bi=0,lp=1,cp=2,up=3,fl=4,hp=5,dp=6,fp=7;var Du=300,_s=301,xs=302,pl=303,ml=304,ma=306,fs=1e3,Fi=1001,Io=1002,bn=1003,pp=1004;var ga=1005;var Ln=1006,gl=1007;var Xi=1008;var Jn=1009,Uu=1010,Fu=1011,ur=1012,yl=1013,Yi=1014,Qn=1015,hr=1016,vl=1017,_l=1018,bs=1020,ku=35902,Ou=1021,Bu=1022,wn=1023,zu=1024,Hu=1025,us=1026,ps=1027,Vu=1028,xl=1029,Gu=1030,bl=1031;var Sl=1033,ya=33776,va=33777,_a=33778,xa=33779,Ml=35840,wl=35841,El=35842,Tl=35843,Al=36196,Cl=37492,Rl=37496,Il=37808,Pl=37809,Nl=37810,Ll=37811,Dl=37812,Ul=37813,Fl=37814,kl=37815,Ol=37816,Bl=37817,zl=37818,Hl=37819,Vl=37820,Gl=37821,ba=36492,Wl=36494,Xl=36495,Wu=36283,Yl=36284,$l=36285,ql=36286;var $r=2300,Po=2301,Ao=2302,_u=2400,xu=2401,bu=2402;var mp=3200,gp=3201;var Xu=0,yp=1,Si="",$t="srgb",ms="srgb-linear",qr="linear",mt="srgb";var cs=7680;var Su=519,vp=512,_p=513,xp=514,Yu=515,bp=516,Sp=517,Mp=518,wp=519,Mu=35044;var $u="300 es",Yn=2e3,Kr=2001,yi=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let s=this._listeners[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let i=this._listeners[e.type];if(i!==void 0){e.target=this;let s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},Xt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],yf=1234567,Gr=Math.PI/180,er=180/Math.PI;function dr(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Xt[n&255]+Xt[n>>8&255]+Xt[n>>16&255]+Xt[n>>24&255]+"-"+Xt[e&255]+Xt[e>>8&255]+"-"+Xt[e>>16&15|64]+Xt[e>>24&255]+"-"+Xt[t&63|128]+Xt[t>>8&255]+"-"+Xt[t>>16&255]+Xt[t>>24&255]+Xt[i&255]+Xt[i>>8&255]+Xt[i>>16&255]+Xt[i>>24&255]).toLowerCase()}function et(n,e,t){return Math.max(e,Math.min(t,n))}function qu(n,e){return(n%e+e)%e}function Kv(n,e,t,i,s){return i+(n-e)*(s-i)/(t-e)}function Zv(n,e,t){return n!==e?(t-n)/(e-n):0}function Wr(n,e,t){return(1-t)*n+t*e}function Jv(n,e,t,i){return Wr(n,e,1-Math.exp(-t*i))}function Qv(n,e=1){return e-Math.abs(qu(n,e*2)-e)}function jv(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function e_(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function t_(n,e){return n+Math.floor(Math.random()*(e-n+1))}function n_(n,e){return n+Math.random()*(e-n)}function i_(n){return n*(.5-Math.random())}function s_(n){n!==void 0&&(yf=n);let e=yf+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function r_(n){return n*Gr}function a_(n){return n*er}function o_(n){return(n&n-1)===0&&n!==0}function l_(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function c_(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function u_(n,e,t,i,s){let r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+i)/2),u=o((e+i)/2),h=r((e-i)/2),d=o((e-i)/2),f=r((i-e)/2),g=o((i-e)/2);switch(s){case"XYX":n.set(a*u,l*h,l*d,a*c);break;case"YZY":n.set(l*d,a*u,l*h,a*c);break;case"ZXZ":n.set(l*h,l*d,a*u,a*c);break;case"XZX":n.set(a*u,l*g,l*f,a*c);break;case"YXY":n.set(l*f,a*u,l*g,a*c);break;case"ZYZ":n.set(l*g,l*f,a*u,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Qs(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function nn(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}var Mi={DEG2RAD:Gr,RAD2DEG:er,generateUUID:dr,clamp:et,euclideanModulo:qu,mapLinear:Kv,inverseLerp:Zv,lerp:Wr,damp:Jv,pingpong:Qv,smoothstep:jv,smootherstep:e_,randInt:t_,randFloat:n_,randFloatSpread:i_,seededRandom:s_,degToRad:r_,radToDeg:a_,isPowerOfTwo:o_,ceilPowerOfTwo:l_,floorPowerOfTwo:c_,setQuaternionFromProperEuler:u_,normalize:nn,denormalize:Qs},Pe=class n{constructor(e=0,t=0){n.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=et(this.x,e.x,t.x),this.y=et(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=et(this.x,e,t),this.y=et(this.y,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(et(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(et(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*i-o*s+e.x,this.y=r*s+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ke=class n{constructor(e,t,i,s,r,o,a,l,c){n.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c)}set(e,t,i,s,r,o,a,l,c){let u=this.elements;return u[0]=e,u[1]=s,u[2]=a,u[3]=t,u[4]=r,u[5]=l,u[6]=i,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],u=i[4],h=i[7],d=i[2],f=i[5],g=i[8],y=s[0],m=s[3],p=s[6],A=s[1],C=s[4],v=s[7],M=s[2],E=s[5],b=s[8];return r[0]=o*y+a*A+l*M,r[3]=o*m+a*C+l*E,r[6]=o*p+a*v+l*b,r[1]=c*y+u*A+h*M,r[4]=c*m+u*C+h*E,r[7]=c*p+u*v+h*b,r[2]=d*y+f*A+g*M,r[5]=d*m+f*C+g*E,r[8]=d*p+f*v+g*b,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-i*r*u+i*a*l+s*r*c-s*o*l}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=u*o-a*c,d=a*l-u*r,f=c*r-o*l,g=t*h+i*d+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/g;return e[0]=h*y,e[1]=(s*c-u*i)*y,e[2]=(a*i-s*o)*y,e[3]=d*y,e[4]=(u*t-s*l)*y,e[5]=(s*r-a*t)*y,e[6]=f*y,e[7]=(i*l-c*t)*y,e[8]=(o*t-i*r)*y,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(qc.makeScale(e,t)),this}rotate(e){return this.premultiply(qc.makeRotation(-e)),this}translate(e,t){return this.premultiply(qc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},qc=new Ke;function Ku(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function tr(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function Ep(){let n=tr("canvas");return n.style.display="block",n}var vf={};function Ss(n){n in vf||(vf[n]=!0,console.warn(n))}function Tp(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}function Ap(n){let e=n.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Cp(n){let e=n.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}var _f=new Ke().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),xf=new Ke().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function h_(){let n={enabled:!0,workingColorSpace:ms,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===mt&&(s.r=mi(s.r),s.g=mi(s.g),s.b=mi(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===mt&&(s.r=js(s.r),s.g=js(s.g),s.b=js(s.b))),s},fromWorkingColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},toWorkingColorSpace:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Si?qr:this.spaces[s].transfer},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[ms]:{primaries:e,whitePoint:i,transfer:qr,toXYZ:_f,fromXYZ:xf,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:$t},outputColorSpaceConfig:{drawingBufferColorSpace:$t}},[$t]:{primaries:e,whitePoint:i,transfer:mt,toXYZ:_f,fromXYZ:xf,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:$t}}}),n}var ct=h_();function mi(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function js(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var zs,No=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{zs===void 0&&(zs=tr("canvas")),zs.width=e.width,zs.height=e.height;let i=zs.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=zs}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=tr("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=mi(r[o]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(mi(t[i]/255)*255):t[i]=mi(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},d_=0,Zr=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:d_++}),this.uuid=dr(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Kc(s[o].image)):r.push(Kc(s[o]))}else r=Kc(s);i.url=r}return t||(e.images[this.uuid]=i),i}};function Kc(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?No.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var f_=0,sn=class n extends yi{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=Fi,s=Fi,r=Ln,o=Xi,a=wn,l=Jn,c=n.DEFAULT_ANISOTROPY,u=Si){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:f_++}),this.uuid=dr(),this.name="",this.source=new Zr(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Pe(0,0),this.repeat=new Pe(1,1),this.center=new Pe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ke,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Du)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case fs:e.x=e.x-Math.floor(e.x);break;case Fi:e.x=e.x<0?0:1;break;case Io:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case fs:e.y=e.y-Math.floor(e.y);break;case Fi:e.y=e.y<0?0:1;break;case Io:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};sn.DEFAULT_IMAGE=null;sn.DEFAULT_MAPPING=Du;sn.DEFAULT_ANISOTROPY=1;var pt=class n{constructor(e=0,t=0,i=0,s=1){n.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*i+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r,l=e.elements,c=l[0],u=l[4],h=l[8],d=l[1],f=l[5],g=l[9],y=l[2],m=l[6],p=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-y)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+y)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let C=(c+1)/2,v=(f+1)/2,M=(p+1)/2,E=(u+d)/4,b=(h+y)/4,R=(g+m)/4;return C>v&&C>M?C<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(C),s=E/i,r=b/i):v>M?v<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),i=E/s,r=R/s):M<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(M),i=b/r,s=R/r),this.set(i,s,r,t),this}let A=Math.sqrt((m-g)*(m-g)+(h-y)*(h-y)+(d-u)*(d-u));return Math.abs(A)<.001&&(A=1),this.x=(m-g)/A,this.y=(h-y)/A,this.z=(d-u)/A,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=et(this.x,e.x,t.x),this.y=et(this.y,e.y,t.y),this.z=et(this.z,e.z,t.z),this.w=et(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=et(this.x,e,t),this.y=et(this.y,e,t),this.z=et(this.z,e,t),this.w=et(this.w,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(et(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Lo=class extends yi{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new pt(0,0,e,t),this.scissorTest=!1,this.viewport=new pt(0,0,e,t);let s={width:e,height:t,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ln,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);let r=new sn(s,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);r.flipY=!1,r.generateMipmaps=i.generateMipmaps,r.internalFormat=i.internalFormat,this.textures=[];let o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,s=e.textures.length;i<s;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0,this.textures[i].renderTarget=this;let t=Object.assign({},e.texture.image);return this.texture.source=new Zr(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},$n=class extends Lo{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},Jr=class extends sn{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=bn,this.minFilter=bn,this.wrapR=Fi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Do=class extends sn{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=bn,this.minFilter=bn,this.wrapR=Fi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var vi=class{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,o,a){let l=i[s+0],c=i[s+1],u=i[s+2],h=i[s+3],d=r[o+0],f=r[o+1],g=r[o+2],y=r[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=d,e[t+1]=f,e[t+2]=g,e[t+3]=y;return}if(h!==y||l!==d||c!==f||u!==g){let m=1-a,p=l*d+c*f+u*g+h*y,A=p>=0?1:-1,C=1-p*p;if(C>Number.EPSILON){let M=Math.sqrt(C),E=Math.atan2(M,p*A);m=Math.sin(m*E)/M,a=Math.sin(a*E)/M}let v=a*A;if(l=l*m+d*v,c=c*m+f*v,u=u*m+g*v,h=h*m+y*v,m===1-a){let M=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=M,c*=M,u*=M,h*=M}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,i,s,r,o){let a=i[s],l=i[s+1],c=i[s+2],u=i[s+3],h=r[o],d=r[o+1],f=r[o+2],g=r[o+3];return e[t]=a*g+u*h+l*f-c*d,e[t+1]=l*g+u*d+c*h-a*f,e[t+2]=c*g+u*f+a*d-l*h,e[t+3]=u*g-a*h-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),u=a(s/2),h=a(r/2),d=l(i/2),f=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"YXZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"ZXY":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"ZYX":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"YZX":this._x=d*u*h+c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h-d*f*g;break;case"XZY":this._x=d*u*h-c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h+d*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],h=t[10],d=i+a+h;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-l)*f,this._y=(r-c)*f,this._z=(o-s)*f}else if(i>a&&i>h){let f=2*Math.sqrt(1+i-a-h);this._w=(u-l)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+c)/f}else if(a>h){let f=2*Math.sqrt(1+a-i-h);this._w=(r-c)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(l+u)/f}else{let f=2*Math.sqrt(1+h-i-a);this._w=(o-s)/f,this._x=(r+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(et(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=i*u+o*a+s*c-r*l,this._y=s*u+o*l+r*a-i*c,this._z=r*u+o*c+i*l-s*a,this._w=o*u-i*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let i=this._x,s=this._y,r=this._z,o=this._w,a=o*e._w+i*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=s,this._z=r,this;let l=1-a*a;if(l<=Number.EPSILON){let f=1-t;return this._w=f*o+t*this._w,this._x=f*i+t*this._x,this._y=f*s+t*this._y,this._z=f*r+t*this._z,this.normalize(),this}let c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-t)*u)/c,d=Math.sin(t*u)/c;return this._w=o*h+this._w*d,this._x=i*h+this._x*d,this._y=s*h+this._y*d,this._z=r*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},k=class n{constructor(e=0,t=0,i=0){n.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(bf.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(bf.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,i=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*i),u=2*(a*t-r*s),h=2*(r*i-o*t);return this.x=t+l*c+o*h-a*u,this.y=i+l*u+a*c-r*h,this.z=s+l*h+r*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=et(this.x,e.x,t.x),this.y=et(this.y,e.y,t.y),this.z=et(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=et(this.x,e,t),this.y=et(this.y,e,t),this.z=et(this.z,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(et(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-i*l,this.z=i*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Zc.copy(this).projectOnVector(e),this.sub(Zc)}reflect(e){return this.sub(Zc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(et(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Zc=new k,bf=new vi,Oi=class{constructor(e=new k(1/0,1/0,1/0),t=new k(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(In.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(In.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=In.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,In):In.fromBufferAttribute(r,o),In.applyMatrix4(e.matrixWorld),this.expandByPoint(In);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),oo.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),oo.copy(i.boundingBox)),oo.applyMatrix4(e.matrixWorld),this.union(oo)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,In),In.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Or),lo.subVectors(this.max,Or),Hs.subVectors(e.a,Or),Vs.subVectors(e.b,Or),Gs.subVectors(e.c,Or),Ri.subVectors(Vs,Hs),Ii.subVectors(Gs,Vs),rs.subVectors(Hs,Gs);let t=[0,-Ri.z,Ri.y,0,-Ii.z,Ii.y,0,-rs.z,rs.y,Ri.z,0,-Ri.x,Ii.z,0,-Ii.x,rs.z,0,-rs.x,-Ri.y,Ri.x,0,-Ii.y,Ii.x,0,-rs.y,rs.x,0];return!Jc(t,Hs,Vs,Gs,lo)||(t=[1,0,0,0,1,0,0,0,1],!Jc(t,Hs,Vs,Gs,lo))?!1:(co.crossVectors(Ri,Ii),t=[co.x,co.y,co.z],Jc(t,Hs,Vs,Gs,lo))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,In).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(In).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ui[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ui[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ui[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ui[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ui[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ui[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ui[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ui[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ui),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},ui=[new k,new k,new k,new k,new k,new k,new k,new k],In=new k,oo=new Oi,Hs=new k,Vs=new k,Gs=new k,Ri=new k,Ii=new k,rs=new k,Or=new k,lo=new k,co=new k,as=new k;function Jc(n,e,t,i,s){for(let r=0,o=n.length-3;r<=o;r+=3){as.fromArray(n,r);let a=s.x*Math.abs(as.x)+s.y*Math.abs(as.y)+s.z*Math.abs(as.z),l=e.dot(as),c=t.dot(as),u=i.dot(as);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}var p_=new Oi,Br=new k,Qc=new k,nr=class{constructor(e=new k,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):p_.setFromPoints(e).getCenter(i);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Br.subVectors(e,this.center);let t=Br.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(Br,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Qc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Br.copy(e.center).add(Qc)),this.expandByPoint(Br.copy(e.center).sub(Qc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},hi=new k,jc=new k,uo=new k,Pi=new k,eu=new k,ho=new k,tu=new k,Uo=class{constructor(e=new k,t=new k(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,hi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=hi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(hi.copy(this.origin).addScaledVector(this.direction,t),hi.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){jc.copy(e).add(t).multiplyScalar(.5),uo.copy(t).sub(e).normalize(),Pi.copy(this.origin).sub(jc);let r=e.distanceTo(t)*.5,o=-this.direction.dot(uo),a=Pi.dot(this.direction),l=-Pi.dot(uo),c=Pi.lengthSq(),u=Math.abs(1-o*o),h,d,f,g;if(u>0)if(h=o*l-a,d=o*a-l,g=r*u,h>=0)if(d>=-g)if(d<=g){let y=1/u;h*=y,d*=y,f=h*(h+o*d+2*a)+d*(o*h+d+2*l)+c}else d=r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;else d=-r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;else d<=-g?(h=Math.max(0,-(-o*r+a)),d=h>0?-r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c):d<=g?(h=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(h=Math.max(0,-(o*r+a)),d=h>0?r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c);else d=o>0?-r:r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(jc).addScaledVector(uo,d),f}intersectSphere(e,t){hi.subVectors(e.center,this.origin);let i=hi.dot(this.direction),s=hi.dot(hi)-i*i,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,o,a,l,c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(i=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(i=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),u>=0?(r=(e.min.y-d.y)*u,o=(e.max.y-d.y)*u):(r=(e.max.y-d.y)*u,o=(e.min.y-d.y)*u),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),h>=0?(a=(e.min.z-d.z)*h,l=(e.max.z-d.z)*h):(a=(e.max.z-d.z)*h,l=(e.min.z-d.z)*h),i>l||a>s)||((a>i||i!==i)&&(i=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,hi)!==null}intersectTriangle(e,t,i,s,r){eu.subVectors(t,e),ho.subVectors(i,e),tu.crossVectors(eu,ho);let o=this.direction.dot(tu),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Pi.subVectors(this.origin,e);let l=a*this.direction.dot(ho.crossVectors(Pi,ho));if(l<0)return null;let c=a*this.direction.dot(eu.cross(Pi));if(c<0||l+c>o)return null;let u=-a*Pi.dot(tu);return u<0?null:this.at(u/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Et=class n{constructor(e,t,i,s,r,o,a,l,c,u,h,d,f,g,y,m){n.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c,u,h,d,f,g,y,m)}set(e,t,i,s,r,o,a,l,c,u,h,d,f,g,y,m){let p=this.elements;return p[0]=e,p[4]=t,p[8]=i,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=u,p[10]=h,p[14]=d,p[3]=f,p[7]=g,p[11]=y,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,i=e.elements,s=1/Ws.setFromMatrixColumn(e,0).length(),r=1/Ws.setFromMatrixColumn(e,1).length(),o=1/Ws.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,s=e.y,r=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){let d=o*u,f=o*h,g=a*u,y=a*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=f+g*c,t[5]=d-y*c,t[9]=-a*l,t[2]=y-d*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){let d=l*u,f=l*h,g=c*u,y=c*h;t[0]=d+y*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=f*a-g,t[6]=y+d*a,t[10]=o*l}else if(e.order==="ZXY"){let d=l*u,f=l*h,g=c*u,y=c*h;t[0]=d-y*a,t[4]=-o*h,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*u,t[9]=y-d*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let d=o*u,f=o*h,g=a*u,y=a*h;t[0]=l*u,t[4]=g*c-f,t[8]=d*c+y,t[1]=l*h,t[5]=y*c+d,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let d=o*l,f=o*c,g=a*l,y=a*c;t[0]=l*u,t[4]=y-d*h,t[8]=g*h+f,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=f*h+g,t[10]=d-y*h}else if(e.order==="XZY"){let d=o*l,f=o*c,g=a*l,y=a*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=d*h+y,t[5]=o*u,t[9]=f*h-g,t[2]=g*h-f,t[6]=a*u,t[10]=y*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(m_,e,g_)}lookAt(e,t,i){let s=this.elements;return fn.subVectors(e,t),fn.lengthSq()===0&&(fn.z=1),fn.normalize(),Ni.crossVectors(i,fn),Ni.lengthSq()===0&&(Math.abs(i.z)===1?fn.x+=1e-4:fn.z+=1e-4,fn.normalize(),Ni.crossVectors(i,fn)),Ni.normalize(),fo.crossVectors(fn,Ni),s[0]=Ni.x,s[4]=fo.x,s[8]=fn.x,s[1]=Ni.y,s[5]=fo.y,s[9]=fn.y,s[2]=Ni.z,s[6]=fo.z,s[10]=fn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],u=i[1],h=i[5],d=i[9],f=i[13],g=i[2],y=i[6],m=i[10],p=i[14],A=i[3],C=i[7],v=i[11],M=i[15],E=s[0],b=s[4],R=s[8],_=s[12],x=s[1],L=s[5],V=s[9],F=s[13],I=s[2],O=s[6],P=s[10],B=s[14],H=s[3],ee=s[7],se=s[11],he=s[15];return r[0]=o*E+a*x+l*I+c*H,r[4]=o*b+a*L+l*O+c*ee,r[8]=o*R+a*V+l*P+c*se,r[12]=o*_+a*F+l*B+c*he,r[1]=u*E+h*x+d*I+f*H,r[5]=u*b+h*L+d*O+f*ee,r[9]=u*R+h*V+d*P+f*se,r[13]=u*_+h*F+d*B+f*he,r[2]=g*E+y*x+m*I+p*H,r[6]=g*b+y*L+m*O+p*ee,r[10]=g*R+y*V+m*P+p*se,r[14]=g*_+y*F+m*B+p*he,r[3]=A*E+C*x+v*I+M*H,r[7]=A*b+C*L+v*O+M*ee,r[11]=A*R+C*V+v*P+M*se,r[15]=A*_+C*F+v*B+M*he,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],h=e[6],d=e[10],f=e[14],g=e[3],y=e[7],m=e[11],p=e[15];return g*(+r*l*h-s*c*h-r*a*d+i*c*d+s*a*f-i*l*f)+y*(+t*l*f-t*c*d+r*o*d-s*o*f+s*c*u-r*l*u)+m*(+t*c*h-t*a*f-r*o*h+i*o*f+r*a*u-i*c*u)+p*(-s*a*u-t*l*h+t*a*d+s*o*h-i*o*d+i*l*u)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=e[9],d=e[10],f=e[11],g=e[12],y=e[13],m=e[14],p=e[15],A=h*m*c-y*d*c+y*l*f-a*m*f-h*l*p+a*d*p,C=g*d*c-u*m*c-g*l*f+o*m*f+u*l*p-o*d*p,v=u*y*c-g*h*c+g*a*f-o*y*f-u*a*p+o*h*p,M=g*h*l-u*y*l-g*a*d+o*y*d+u*a*m-o*h*m,E=t*A+i*C+s*v+r*M;if(E===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let b=1/E;return e[0]=A*b,e[1]=(y*d*r-h*m*r-y*s*f+i*m*f+h*s*p-i*d*p)*b,e[2]=(a*m*r-y*l*r+y*s*c-i*m*c-a*s*p+i*l*p)*b,e[3]=(h*l*r-a*d*r-h*s*c+i*d*c+a*s*f-i*l*f)*b,e[4]=C*b,e[5]=(u*m*r-g*d*r+g*s*f-t*m*f-u*s*p+t*d*p)*b,e[6]=(g*l*r-o*m*r-g*s*c+t*m*c+o*s*p-t*l*p)*b,e[7]=(o*d*r-u*l*r+u*s*c-t*d*c-o*s*f+t*l*f)*b,e[8]=v*b,e[9]=(g*h*r-u*y*r-g*i*f+t*y*f+u*i*p-t*h*p)*b,e[10]=(o*y*r-g*a*r+g*i*c-t*y*c-o*i*p+t*a*p)*b,e[11]=(u*a*r-o*h*r-u*i*c+t*h*c+o*i*f-t*a*f)*b,e[12]=M*b,e[13]=(u*y*s-g*h*s+g*i*d-t*y*d-u*i*m+t*h*m)*b,e[14]=(g*a*s-o*y*s-g*i*l+t*y*l+o*i*m-t*a*m)*b,e[15]=(o*h*s-u*a*s+u*i*l-t*h*l-o*i*d+t*a*d)*b,this}scale(e){let t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),s=Math.sin(t),r=1-i,o=e.x,a=e.y,l=e.z,c=r*o,u=r*a;return this.set(c*o+i,c*a-s*l,c*l+s*a,0,c*a+s*l,u*a+i,u*l-s*o,0,c*l-s*a,u*l+s*o,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,o){return this.set(1,i,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){let s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,u=o+o,h=a+a,d=r*c,f=r*u,g=r*h,y=o*u,m=o*h,p=a*h,A=l*c,C=l*u,v=l*h,M=i.x,E=i.y,b=i.z;return s[0]=(1-(y+p))*M,s[1]=(f+v)*M,s[2]=(g-C)*M,s[3]=0,s[4]=(f-v)*E,s[5]=(1-(d+p))*E,s[6]=(m+A)*E,s[7]=0,s[8]=(g+C)*b,s[9]=(m-A)*b,s[10]=(1-(d+y))*b,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){let s=this.elements,r=Ws.set(s[0],s[1],s[2]).length(),o=Ws.set(s[4],s[5],s[6]).length(),a=Ws.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],Pn.copy(this);let c=1/r,u=1/o,h=1/a;return Pn.elements[0]*=c,Pn.elements[1]*=c,Pn.elements[2]*=c,Pn.elements[4]*=u,Pn.elements[5]*=u,Pn.elements[6]*=u,Pn.elements[8]*=h,Pn.elements[9]*=h,Pn.elements[10]*=h,t.setFromRotationMatrix(Pn),i.x=r,i.y=o,i.z=a,this}makePerspective(e,t,i,s,r,o,a=Yn){let l=this.elements,c=2*r/(t-e),u=2*r/(i-s),h=(t+e)/(t-e),d=(i+s)/(i-s),f,g;if(a===Yn)f=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===Kr)f=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,s,r,o,a=Yn){let l=this.elements,c=1/(t-e),u=1/(i-s),h=1/(o-r),d=(t+e)*c,f=(i+s)*u,g,y;if(a===Yn)g=(o+r)*h,y=-2*h;else if(a===Kr)g=r*h,y=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=y,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},Ws=new k,Pn=new Et,m_=new k(0,0,0),g_=new k(1,1,1),Ni=new k,fo=new k,fn=new k,Sf=new Et,Mf=new vi,Dn=class n{constructor(e=0,t=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],u=s[9],h=s[2],d=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(et(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-et(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(et(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-et(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(et(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-et(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Sf.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Sf,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Mf.setFromEuler(this),this.setFromQuaternion(Mf,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Dn.DEFAULT_ORDER="XYZ";var Qr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},y_=0,wf=new k,Xs=new vi,di=new Et,po=new k,zr=new k,v_=new k,__=new vi,Ef=new k(1,0,0),Tf=new k(0,1,0),Af=new k(0,0,1),Cf={type:"added"},x_={type:"removed"},Ys={type:"childadded",child:null},nu={type:"childremoved",child:null},qt=class n extends yi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:y_++}),this.uuid=dr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new k,t=new Dn,i=new vi,s=new k(1,1,1);function r(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Et},normalMatrix:{value:new Ke}}),this.matrix=new Et,this.matrixWorld=new Et,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Qr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Xs.setFromAxisAngle(e,t),this.quaternion.multiply(Xs),this}rotateOnWorldAxis(e,t){return Xs.setFromAxisAngle(e,t),this.quaternion.premultiply(Xs),this}rotateX(e){return this.rotateOnAxis(Ef,e)}rotateY(e){return this.rotateOnAxis(Tf,e)}rotateZ(e){return this.rotateOnAxis(Af,e)}translateOnAxis(e,t){return wf.copy(e).applyQuaternion(this.quaternion),this.position.add(wf.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Ef,e)}translateY(e){return this.translateOnAxis(Tf,e)}translateZ(e){return this.translateOnAxis(Af,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(di.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?po.copy(e):po.set(e,t,i);let s=this.parent;this.updateWorldMatrix(!0,!1),zr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?di.lookAt(zr,po,this.up):di.lookAt(po,zr,this.up),this.quaternion.setFromRotationMatrix(di),s&&(di.extractRotation(s.matrixWorld),Xs.setFromRotationMatrix(di),this.quaternion.premultiply(Xs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Cf),Ys.child=e,this.dispatchEvent(Ys),Ys.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(x_),nu.child=e,this.dispatchEvent(nu),nu.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),di.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),di.multiply(e.parent.matrixWorld)),e.applyMatrix4(di),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Cf),Ys.child=e,this.dispatchEvent(Ys),Ys.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){let o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(zr,e,v_),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(zr,__,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){let i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let h=l[c];r(e.shapes,h)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),h=o(e.shapes),d=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),d.length>0&&(i.skeletons=d),f.length>0&&(i.animations=f),g.length>0&&(i.nodes=g)}return i.object=s,i;function o(a){let l=[];for(let c in a){let u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let s=e.children[i];this.add(s.clone())}return this}};qt.DEFAULT_UP=new k(0,1,0);qt.DEFAULT_MATRIX_AUTO_UPDATE=!0;qt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Nn=new k,fi=new k,iu=new k,pi=new k,$s=new k,qs=new k,Rf=new k,su=new k,ru=new k,au=new k,ou=new pt,lu=new pt,cu=new pt,Ui=class n{constructor(e=new k,t=new k,i=new k){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),Nn.subVectors(e,t),s.cross(Nn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){Nn.subVectors(s,t),fi.subVectors(i,t),iu.subVectors(e,t);let o=Nn.dot(Nn),a=Nn.dot(fi),l=Nn.dot(iu),c=fi.dot(fi),u=fi.dot(iu),h=o*c-a*a;if(h===0)return r.set(0,0,0),null;let d=1/h,f=(c*l-a*u)*d,g=(o*u-a*l)*d;return r.set(1-f-g,g,f)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,pi)===null?!1:pi.x>=0&&pi.y>=0&&pi.x+pi.y<=1}static getInterpolation(e,t,i,s,r,o,a,l){return this.getBarycoord(e,t,i,s,pi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,pi.x),l.addScaledVector(o,pi.y),l.addScaledVector(a,pi.z),l)}static getInterpolatedAttribute(e,t,i,s,r,o){return ou.setScalar(0),lu.setScalar(0),cu.setScalar(0),ou.fromBufferAttribute(e,t),lu.fromBufferAttribute(e,i),cu.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(ou,r.x),o.addScaledVector(lu,r.y),o.addScaledVector(cu,r.z),o}static isFrontFacing(e,t,i,s){return Nn.subVectors(i,t),fi.subVectors(e,t),Nn.cross(fi).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Nn.subVectors(this.c,this.b),fi.subVectors(this.a,this.b),Nn.cross(fi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return n.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,s=this.b,r=this.c,o,a;$s.subVectors(s,i),qs.subVectors(r,i),su.subVectors(e,i);let l=$s.dot(su),c=qs.dot(su);if(l<=0&&c<=0)return t.copy(i);ru.subVectors(e,s);let u=$s.dot(ru),h=qs.dot(ru);if(u>=0&&h<=u)return t.copy(s);let d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(i).addScaledVector($s,o);au.subVectors(e,r);let f=$s.dot(au),g=qs.dot(au);if(g>=0&&f<=g)return t.copy(r);let y=f*c-l*g;if(y<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(i).addScaledVector(qs,a);let m=u*g-f*h;if(m<=0&&h-u>=0&&f-g>=0)return Rf.subVectors(r,s),a=(h-u)/(h-u+(f-g)),t.copy(s).addScaledVector(Rf,a);let p=1/(m+y+d);return o=y*p,a=d*p,t.copy(i).addScaledVector($s,o).addScaledVector(qs,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Rp={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Li={h:0,s:0,l:0},mo={h:0,s:0,l:0};function uu(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var Ze=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=$t){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ct.toWorkingColorSpace(this,t),this}setRGB(e,t,i,s=ct.workingColorSpace){return this.r=e,this.g=t,this.b=i,ct.toWorkingColorSpace(this,s),this}setHSL(e,t,i,s=ct.workingColorSpace){if(e=qu(e,1),t=et(t,0,1),i=et(i,0,1),t===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+t):i+t-i*t,o=2*i-r;this.r=uu(o,r,e+1/3),this.g=uu(o,r,e),this.b=uu(o,r,e-1/3)}return ct.toWorkingColorSpace(this,s),this}setStyle(e,t=$t){function i(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=$t){let i=Rp[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=mi(e.r),this.g=mi(e.g),this.b=mi(e.b),this}copyLinearToSRGB(e){return this.r=js(e.r),this.g=js(e.g),this.b=js(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=$t){return ct.fromWorkingColorSpace(Yt.copy(this),e),Math.round(et(Yt.r*255,0,255))*65536+Math.round(et(Yt.g*255,0,255))*256+Math.round(et(Yt.b*255,0,255))}getHexString(e=$t){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ct.workingColorSpace){ct.fromWorkingColorSpace(Yt.copy(this),t);let i=Yt.r,s=Yt.g,r=Yt.b,o=Math.max(i,s,r),a=Math.min(i,s,r),l,c,u=(a+o)/2;if(a===o)l=0,c=0;else{let h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case i:l=(s-r)/h+(s<r?6:0);break;case s:l=(r-i)/h+2;break;case r:l=(i-s)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=ct.workingColorSpace){return ct.fromWorkingColorSpace(Yt.copy(this),t),e.r=Yt.r,e.g=Yt.g,e.b=Yt.b,e}getStyle(e=$t){ct.fromWorkingColorSpace(Yt.copy(this),e);let t=Yt.r,i=Yt.g,s=Yt.b;return e!==$t?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(Li),this.setHSL(Li.h+e,Li.s+t,Li.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Li),e.getHSL(mo);let i=Wr(Li.h,mo.h,t),s=Wr(Li.s,mo.s,t),r=Wr(Li.l,mo.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Yt=new Ze;Ze.NAMES=Rp;var b_=0,Bi=class extends yi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:b_++}),this.uuid=dr(),this.name="",this.type="Material",this.blending=hs,this.side=gi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Co,this.blendDst=Ro,this.blendEquation=ki,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ze(0,0,0),this.blendAlpha=0,this.depthFunc=ds,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Su,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=cs,this.stencilZFail=cs,this.stencilZPass=cs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==hs&&(i.blending=this.blending),this.side!==gi&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Co&&(i.blendSrc=this.blendSrc),this.blendDst!==Ro&&(i.blendDst=this.blendDst),this.blendEquation!==ki&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==ds&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Su&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==cs&&(i.stencilFail=this.stencilFail),this.stencilZFail!==cs&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==cs&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}},Sn=class extends Bi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ze(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Dn,this.combine=Lu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var Nt=new k,go=new Pe,mn=class{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Mu,this.updateRanges=[],this.gpuType=Qn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)go.fromBufferAttribute(this,t),go.applyMatrix3(e),this.setXY(t,go.x,go.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Nt.fromBufferAttribute(this,t),Nt.applyMatrix3(e),this.setXYZ(t,Nt.x,Nt.y,Nt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Nt.fromBufferAttribute(this,t),Nt.applyMatrix4(e),this.setXYZ(t,Nt.x,Nt.y,Nt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Nt.fromBufferAttribute(this,t),Nt.applyNormalMatrix(e),this.setXYZ(t,Nt.x,Nt.y,Nt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Nt.fromBufferAttribute(this,t),Nt.transformDirection(e),this.setXYZ(t,Nt.x,Nt.y,Nt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Qs(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=nn(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Qs(t,this.array)),t}setX(e,t){return this.normalized&&(t=nn(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Qs(t,this.array)),t}setY(e,t){return this.normalized&&(t=nn(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Qs(t,this.array)),t}setZ(e,t){return this.normalized&&(t=nn(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Qs(t,this.array)),t}setW(e,t){return this.normalized&&(t=nn(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=nn(t,this.array),i=nn(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=nn(t,this.array),i=nn(i,this.array),s=nn(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=nn(t,this.array),i=nn(i,this.array),s=nn(s,this.array),r=nn(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Mu&&(e.usage=this.usage),e}};var jr=class extends mn{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var ea=class extends mn{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var bt=class extends mn{constructor(e,t,i){super(new Float32Array(e),t,i)}},S_=0,xn=new Et,hu=new qt,Ks=new k,pn=new Oi,Hr=new Oi,kt=new k,gn=class n extends yi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:S_++}),this.uuid=dr(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Ku(e)?ea:jr)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new Ke().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return xn.makeRotationFromQuaternion(e),this.applyMatrix4(xn),this}rotateX(e){return xn.makeRotationX(e),this.applyMatrix4(xn),this}rotateY(e){return xn.makeRotationY(e),this.applyMatrix4(xn),this}rotateZ(e){return xn.makeRotationZ(e),this.applyMatrix4(xn),this}translate(e,t,i){return xn.makeTranslation(e,t,i),this.applyMatrix4(xn),this}scale(e,t,i){return xn.makeScale(e,t,i),this.applyMatrix4(xn),this}lookAt(e){return hu.lookAt(e),hu.updateMatrix(),this.applyMatrix4(hu.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ks).negate(),this.translate(Ks.x,Ks.y,Ks.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new bt(i,3))}else{let i=Math.min(e.length,t.count);for(let s=0;s<i;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Oi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new k(-1/0,-1/0,-1/0),new k(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){let r=t[i];pn.setFromBufferAttribute(r),this.morphTargetsRelative?(kt.addVectors(this.boundingBox.min,pn.min),this.boundingBox.expandByPoint(kt),kt.addVectors(this.boundingBox.max,pn.max),this.boundingBox.expandByPoint(kt)):(this.boundingBox.expandByPoint(pn.min),this.boundingBox.expandByPoint(pn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new nr);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new k,1/0);return}if(e){let i=this.boundingSphere.center;if(pn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];Hr.setFromBufferAttribute(a),this.morphTargetsRelative?(kt.addVectors(pn.min,Hr.min),pn.expandByPoint(kt),kt.addVectors(pn.max,Hr.max),pn.expandByPoint(kt)):(pn.expandByPoint(Hr.min),pn.expandByPoint(Hr.max))}pn.getCenter(i);let s=0;for(let r=0,o=e.count;r<o;r++)kt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(kt));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)kt.fromBufferAttribute(a,c),l&&(Ks.fromBufferAttribute(e,c),kt.add(Ks)),s=Math.max(s,i.distanceToSquared(kt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new mn(new Float32Array(4*i.count),4));let o=this.getAttribute("tangent"),a=[],l=[];for(let R=0;R<i.count;R++)a[R]=new k,l[R]=new k;let c=new k,u=new k,h=new k,d=new Pe,f=new Pe,g=new Pe,y=new k,m=new k;function p(R,_,x){c.fromBufferAttribute(i,R),u.fromBufferAttribute(i,_),h.fromBufferAttribute(i,x),d.fromBufferAttribute(r,R),f.fromBufferAttribute(r,_),g.fromBufferAttribute(r,x),u.sub(c),h.sub(c),f.sub(d),g.sub(d);let L=1/(f.x*g.y-g.x*f.y);isFinite(L)&&(y.copy(u).multiplyScalar(g.y).addScaledVector(h,-f.y).multiplyScalar(L),m.copy(h).multiplyScalar(f.x).addScaledVector(u,-g.x).multiplyScalar(L),a[R].add(y),a[_].add(y),a[x].add(y),l[R].add(m),l[_].add(m),l[x].add(m))}let A=this.groups;A.length===0&&(A=[{start:0,count:e.count}]);for(let R=0,_=A.length;R<_;++R){let x=A[R],L=x.start,V=x.count;for(let F=L,I=L+V;F<I;F+=3)p(e.getX(F+0),e.getX(F+1),e.getX(F+2))}let C=new k,v=new k,M=new k,E=new k;function b(R){M.fromBufferAttribute(s,R),E.copy(M);let _=a[R];C.copy(_),C.sub(M.multiplyScalar(M.dot(_))).normalize(),v.crossVectors(E,_);let L=v.dot(l[R])<0?-1:1;o.setXYZW(R,C.x,C.y,C.z,L)}for(let R=0,_=A.length;R<_;++R){let x=A[R],L=x.start,V=x.count;for(let F=L,I=L+V;F<I;F+=3)b(e.getX(F+0)),b(e.getX(F+1)),b(e.getX(F+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new mn(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let d=0,f=i.count;d<f;d++)i.setXYZ(d,0,0,0);let s=new k,r=new k,o=new k,a=new k,l=new k,c=new k,u=new k,h=new k;if(e)for(let d=0,f=e.count;d<f;d+=3){let g=e.getX(d+0),y=e.getX(d+1),m=e.getX(d+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,y),o.fromBufferAttribute(t,m),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),a.fromBufferAttribute(i,g),l.fromBufferAttribute(i,y),c.fromBufferAttribute(i,m),a.add(u),l.add(u),c.add(u),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(y,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),i.setXYZ(d+0,u.x,u.y,u.z),i.setXYZ(d+1,u.x,u.y,u.z),i.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)kt.fromBufferAttribute(e,t),kt.normalize(),e.setXYZ(t,kt.x,kt.y,kt.z)}toNonIndexed(){function e(a,l){let c=a.array,u=a.itemSize,h=a.normalized,d=new c.constructor(l.length*u),f=0,g=0;for(let y=0,m=l.length;y<m;y++){a.isInterleavedBufferAttribute?f=l[y]*a.data.stride+a.offset:f=l[y]*u;for(let p=0;p<u;p++)d[g++]=c[f++]}return new mn(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=e(l,i);t.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let u=0,h=c.length;u<h;u++){let d=c[u],f=e(d,i);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let l in i){let c=i[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){let f=c[h];u.push(f.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone(t));let s=e.attributes;for(let c in s){let u=s[c];this.setAttribute(c,u.clone(t))}let r=e.morphAttributes;for(let c in r){let u=[],h=r[c];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,u=o.length;c<u;c++){let h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},If=new Et,os=new Uo,yo=new nr,Pf=new k,vo=new k,_o=new k,xo=new k,du=new k,bo=new k,Nf=new k,So=new k,Be=class extends qt{constructor(e=new gn,t=new Sn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){bo.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=a[l],h=r[l];u!==0&&(du.fromBufferAttribute(h,e),o?bo.addScaledVector(du,u):bo.addScaledVector(du.sub(t),u))}t.add(bo)}return t}raycast(e,t){let i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),yo.copy(i.boundingSphere),yo.applyMatrix4(r),os.copy(e.ray).recast(e.near),!(yo.containsPoint(os.origin)===!1&&(os.intersectSphere(yo,Pf)===null||os.origin.distanceToSquared(Pf)>(e.far-e.near)**2))&&(If.copy(r).invert(),os.copy(e.ray).applyMatrix4(If),!(i.boundingBox!==null&&os.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,os)))}_computeIntersections(e,t,i){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,y=d.length;g<y;g++){let m=d[g],p=o[m.materialIndex],A=Math.max(m.start,f.start),C=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let v=A,M=C;v<M;v+=3){let E=a.getX(v),b=a.getX(v+1),R=a.getX(v+2);s=Mo(this,p,e,i,c,u,h,E,b,R),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,f.start),y=Math.min(a.count,f.start+f.count);for(let m=g,p=y;m<p;m+=3){let A=a.getX(m),C=a.getX(m+1),v=a.getX(m+2);s=Mo(this,o,e,i,c,u,h,A,C,v),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,y=d.length;g<y;g++){let m=d[g],p=o[m.materialIndex],A=Math.max(m.start,f.start),C=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let v=A,M=C;v<M;v+=3){let E=v,b=v+1,R=v+2;s=Mo(this,p,e,i,c,u,h,E,b,R),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,f.start),y=Math.min(l.count,f.start+f.count);for(let m=g,p=y;m<p;m+=3){let A=m,C=m+1,v=m+2;s=Mo(this,o,e,i,c,u,h,A,C,v),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function M_(n,e,t,i,s,r,o,a){let l;if(e.side===Wt?l=i.intersectTriangle(o,r,s,!0,a):l=i.intersectTriangle(s,r,o,e.side===gi,a),l===null)return null;So.copy(a),So.applyMatrix4(n.matrixWorld);let c=t.ray.origin.distanceTo(So);return c<t.near||c>t.far?null:{distance:c,point:So.clone(),object:n}}function Mo(n,e,t,i,s,r,o,a,l,c){n.getVertexPosition(a,vo),n.getVertexPosition(l,_o),n.getVertexPosition(c,xo);let u=M_(n,e,t,i,vo,_o,xo,Nf);if(u){let h=new k;Ui.getBarycoord(Nf,vo,_o,xo,h),s&&(u.uv=Ui.getInterpolatedAttribute(s,a,l,c,h,new Pe)),r&&(u.uv1=Ui.getInterpolatedAttribute(r,a,l,c,h,new Pe)),o&&(u.normal=Ui.getInterpolatedAttribute(o,a,l,c,h,new k),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));let d={a,b:l,c,normal:new k,materialIndex:0};Ui.getNormal(vo,_o,xo,d.normal),u.face=d,u.barycoord=h}return u}var zi=class n extends gn{constructor(e=1,t=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],u=[],h=[],d=0,f=0;g("z","y","x",-1,-1,i,t,e,o,r,0),g("z","y","x",1,-1,i,t,-e,o,r,1),g("x","z","y",1,1,e,i,t,s,o,2),g("x","z","y",1,-1,e,i,-t,s,o,3),g("x","y","z",1,-1,e,t,i,s,r,4),g("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new bt(c,3)),this.setAttribute("normal",new bt(u,3)),this.setAttribute("uv",new bt(h,2));function g(y,m,p,A,C,v,M,E,b,R,_){let x=v/b,L=M/R,V=v/2,F=M/2,I=E/2,O=b+1,P=R+1,B=0,H=0,ee=new k;for(let se=0;se<P;se++){let he=se*L-F;for(let Me=0;Me<O;Me++){let Ne=Me*x-V;ee[y]=Ne*A,ee[m]=he*C,ee[p]=I,c.push(ee.x,ee.y,ee.z),ee[y]=0,ee[m]=0,ee[p]=E>0?1:-1,u.push(ee.x,ee.y,ee.z),h.push(Me/b),h.push(1-se/R),B+=1}}for(let se=0;se<R;se++)for(let he=0;he<b;he++){let Me=d+he+O*se,Ne=d+he+O*(se+1),Z=d+(he+1)+O*(se+1),oe=d+(he+1)+O*se;l.push(Me,Ne,oe),l.push(Ne,Z,oe),H+=6}a.addGroup(f,H,_),f+=H,d+=B}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function Ms(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let s=n[t][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone():Array.isArray(s)?e[t][i]=s.slice():e[t][i]=s}}return e}function Kt(n){let e={};for(let t=0;t<n.length;t++){let i=Ms(n[t]);for(let s in i)e[s]=i[s]}return e}function w_(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function Zu(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ct.workingColorSpace}var Ip={clone:Ms,merge:Kt},E_=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,T_=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Un=class extends Bi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=E_,this.fragmentShader=T_,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ms(e.uniforms),this.uniformsGroups=w_(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}},ta=class extends qt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Et,this.projectionMatrix=new Et,this.projectionMatrixInverse=new Et,this.coordinateSystem=Yn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Di=new k,Lf=new Pe,Df=new Pe,Gt=class extends ta{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=er*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Gr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return er*2*Math.atan(Math.tan(Gr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Di.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Di.x,Di.y).multiplyScalar(-e/Di.z),Di.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Di.x,Di.y).multiplyScalar(-e/Di.z)}getViewSize(e,t){return this.getViewBounds(e,Lf,Df),t.subVectors(Df,Lf)}setViewOffset(e,t,i,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Gr*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*i/c,s*=o.width/l,i*=o.height/c}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Zs=-90,Js=1,Fo=class extends qt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Gt(Zs,Js,e,t);s.layers=this.layers,this.add(s);let r=new Gt(Zs,Js,e,t);r.layers=this.layers,this.add(r);let o=new Gt(Zs,Js,e,t);o.layers=this.layers,this.add(o);let a=new Gt(Zs,Js,e,t);a.layers=this.layers,this.add(a);let l=new Gt(Zs,Js,e,t);l.layers=this.layers,this.add(l);let c=new Gt(Zs,Js,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,s,r,o,a,l]=t;for(let c of t)this.remove(c);if(e===Yn)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Kr)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let y=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,s),e.render(t,r),e.setRenderTarget(i,1,s),e.render(t,o),e.setRenderTarget(i,2,s),e.render(t,a),e.setRenderTarget(i,3,s),e.render(t,l),e.setRenderTarget(i,4,s),e.render(t,c),i.texture.generateMipmaps=y,e.setRenderTarget(i,5,s),e.render(t,u),e.setRenderTarget(h,d,f),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},na=class extends sn{constructor(e,t,i,s,r,o,a,l,c,u){e=e!==void 0?e:[],t=t!==void 0?t:_s,super(e,t,i,s,r,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},ko=class extends $n{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new na(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Ln}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new zi(5,5,5),r=new Un({name:"CubemapFromEquirect",uniforms:Ms(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Wt,blending:xi});r.uniforms.tEquirect.value=t;let o=new Be(s,r),a=t.minFilter;return t.minFilter===Xi&&(t.minFilter=Ln),new Fo(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,i,s){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,s);e.setRenderTarget(r)}},ia=class n{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new Ze(e),this.density=t}clone(){return new n(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var gs=class extends qt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Dn,this.environmentIntensity=1,this.environmentRotation=new Dn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}};var fu=new k,A_=new k,C_=new Ke,Xn=class{constructor(e=new k(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let s=fu.subVectors(i,t).cross(A_.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let i=e.delta(fu),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(i,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||C_.getNormalMatrix(e),s=this.coplanarPoint(fu).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},ls=new nr,wo=new k,ir=class{constructor(e=new Xn,t=new Xn,i=new Xn,s=new Xn,r=new Xn,o=new Xn){this.planes=[e,t,i,s,r,o]}set(e,t,i,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Yn){let i=this.planes,s=e.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],u=s[5],h=s[6],d=s[7],f=s[8],g=s[9],y=s[10],m=s[11],p=s[12],A=s[13],C=s[14],v=s[15];if(i[0].setComponents(l-r,d-c,m-f,v-p).normalize(),i[1].setComponents(l+r,d+c,m+f,v+p).normalize(),i[2].setComponents(l+o,d+u,m+g,v+A).normalize(),i[3].setComponents(l-o,d-u,m-g,v-A).normalize(),i[4].setComponents(l-a,d-h,m-y,v-C).normalize(),t===Yn)i[5].setComponents(l+a,d+h,m+y,v+C).normalize();else if(t===Kr)i[5].setComponents(a,h,y,C).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ls.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ls.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ls)}intersectsSprite(e){return ls.center.set(0,0,0),ls.radius=.7071067811865476,ls.applyMatrix4(e.matrixWorld),this.intersectsSphere(ls)}intersectsSphere(e){let t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let s=t[i];if(wo.x=s.normal.x>0?e.max.x:e.min.x,wo.y=s.normal.y>0?e.max.y:e.min.y,wo.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(wo)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var rn=class extends qt{constructor(){super(),this.isGroup=!0,this.type="Group"}};var sr=class extends sn{constructor(e,t,i,s,r,o,a,l,c){super(e,t,i,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},sa=class extends sn{constructor(e,t,i,s,r,o,a,l,c,u=us){if(u!==us&&u!==ps)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&u===us&&(i=Yi),i===void 0&&u===ps&&(i=bs),super(null,s,r,o,a,l,u,i,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:bn,this.minFilter=l!==void 0?l:bn,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},yn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)i=this.getPoint(o/e),r+=i.distanceTo(s),t.push(r),s=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){let i=this.getLengths(),s=0,r=i.length,o;t?o=t:o=e*i[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=i[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,i[s]===o)return s/(r-1);let u=i[s],d=i[s+1]-u,f=(o-u)/d;return(s+f)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),l=t||(o.isVector2?new Pe:new k);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t){let i=new k,s=[],r=[],o=[],a=new k,l=new Et;for(let f=0;f<=e;f++){let g=f/e;s[f]=this.getTangentAt(g,new k)}r[0]=new k,o[0]=new k;let c=Number.MAX_VALUE,u=Math.abs(s[0].x),h=Math.abs(s[0].y),d=Math.abs(s[0].z);u<=c&&(c=u,i.set(1,0,0)),h<=c&&(c=h,i.set(0,1,0)),d<=c&&i.set(0,0,1),a.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(s[f-1],s[f]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(et(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(s[f],r[f])}if(t===!0){let f=Math.acos(et(r[0].dot(r[e]),-1,1));f/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(f=-f);for(let g=1;g<=e;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],f*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},rr=class extends yn{constructor(e=0,t=0,i=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new Pe){let i=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*u-f*h+this.aX,c=d*h+f*u+this.aY}return i.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Oo=class extends rr{constructor(e,t,i,s,r,o){super(e,t,i,i,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function Ju(){let n=0,e=0,t=0,i=0;function s(r,o,a,l){n=r,e=a,t=-3*r+3*o-2*a-l,i=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,u,h){let d=(o-r)/c-(a-r)/(c+u)+(a-o)/u,f=(a-o)/u-(l-o)/(u+h)+(l-a)/h;d*=u,f*=u,s(o,a,d,f)},calc:function(r){let o=r*r,a=o*r;return n+e*r+t*o+i*a}}}var Eo=new k,pu=new Ju,mu=new Ju,gu=new Ju,Bo=class extends yn{constructor(e=[],t=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=s}getPoint(e,t=new k){let i=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,u;this.closed||a>0?c=s[(a-1)%r]:(Eo.subVectors(s[0],s[1]).add(s[0]),c=Eo);let h=s[a%r],d=s[(a+1)%r];if(this.closed||a+2<r?u=s[(a+2)%r]:(Eo.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=Eo),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(h),f),y=Math.pow(h.distanceToSquared(d),f),m=Math.pow(d.distanceToSquared(u),f);y<1e-4&&(y=1),g<1e-4&&(g=y),m<1e-4&&(m=y),pu.initNonuniformCatmullRom(c.x,h.x,d.x,u.x,g,y,m),mu.initNonuniformCatmullRom(c.y,h.y,d.y,u.y,g,y,m),gu.initNonuniformCatmullRom(c.z,h.z,d.z,u.z,g,y,m)}else this.curveType==="catmullrom"&&(pu.initCatmullRom(c.x,h.x,d.x,u.x,this.tension),mu.initCatmullRom(c.y,h.y,d.y,u.y,this.tension),gu.initCatmullRom(c.z,h.z,d.z,u.z,this.tension));return i.set(pu.calc(l),mu.calc(l),gu.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(new k().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Uf(n,e,t,i,s){let r=(i-e)*.5,o=(s-t)*.5,a=n*n,l=n*a;return(2*t-2*i+r+o)*l+(-3*t+3*i-2*r-o)*a+r*n+t}function R_(n,e){let t=1-n;return t*t*e}function I_(n,e){return 2*(1-n)*n*e}function P_(n,e){return n*n*e}function Xr(n,e,t,i){return R_(n,e)+I_(n,t)+P_(n,i)}function N_(n,e){let t=1-n;return t*t*t*e}function L_(n,e){let t=1-n;return 3*t*t*n*e}function D_(n,e){return 3*(1-n)*n*n*e}function U_(n,e){return n*n*n*e}function Yr(n,e,t,i,s){return N_(n,e)+L_(n,t)+D_(n,i)+U_(n,s)}var ra=class extends yn{constructor(e=new Pe,t=new Pe,i=new Pe,s=new Pe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new Pe){let i=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(Yr(e,s.x,r.x,o.x,a.x),Yr(e,s.y,r.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},zo=class extends yn{constructor(e=new k,t=new k,i=new k,s=new k){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new k){let i=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(Yr(e,s.x,r.x,o.x,a.x),Yr(e,s.y,r.y,o.y,a.y),Yr(e,s.z,r.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},aa=class extends yn{constructor(e=new Pe,t=new Pe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Pe){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Pe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ho=class extends yn{constructor(e=new k,t=new k){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new k){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new k){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},oa=class extends yn{constructor(e=new Pe,t=new Pe,i=new Pe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new Pe){let i=t,s=this.v0,r=this.v1,o=this.v2;return i.set(Xr(e,s.x,r.x,o.x),Xr(e,s.y,r.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Vo=class extends yn{constructor(e=new k,t=new k,i=new k){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new k){let i=t,s=this.v0,r=this.v1,o=this.v2;return i.set(Xr(e,s.x,r.x,o.x),Xr(e,s.y,r.y,o.y),Xr(e,s.z,r.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},la=class extends yn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Pe){let i=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],u=s[o>s.length-2?s.length-1:o+1],h=s[o>s.length-3?s.length-1:o+2];return i.set(Uf(a,l.x,c.x,u.x,h.x),Uf(a,l.y,c.y,u.y,h.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(new Pe().fromArray(s))}return this}},Ff=Object.freeze({__proto__:null,ArcCurve:Oo,CatmullRomCurve3:Bo,CubicBezierCurve:ra,CubicBezierCurve3:zo,EllipseCurve:rr,LineCurve:aa,LineCurve3:Ho,QuadraticBezierCurve:oa,QuadraticBezierCurve3:Vo,SplineCurve:la}),Go=class extends yn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Ff[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=i){let o=s[r]-i,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,s=this.curves.length;i<s;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let u=l[c];i&&i.equals(u)||(t.push(u),i=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let s=e.curves[t];this.curves.push(new Ff[s.type]().fromJSON(s))}return this}},Wo=class extends Go{constructor(e){super(),this.type="Path",this.currentPoint=new Pe,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new aa(this.currentPoint.clone(),new Pe(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,s){let r=new oa(this.currentPoint.clone(),new Pe(e,t),new Pe(i,s));return this.curves.push(r),this.currentPoint.set(i,s),this}bezierCurveTo(e,t,i,s,r,o){let a=new ra(this.currentPoint.clone(),new Pe(e,t),new Pe(i,s),new Pe(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new la(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,s,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,i,s,r,o),this}absarc(e,t,i,s,r,o){return this.absellipse(e,t,i,i,s,r,o),this}ellipse(e,t,i,s,r,o,a,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,i,s,r,o,a,l),this}absellipse(e,t,i,s,r,o,a,l){let c=new rr(e,t,i,s,r,o,a,l);if(this.curves.length>0){let h=c.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Xo=class n extends gn{constructor(e=[new Pe(0,-.5),new Pe(.5,0),new Pe(0,.5)],t=12,i=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:i,phiLength:s},t=Math.floor(t),s=et(s,0,Math.PI*2);let r=[],o=[],a=[],l=[],c=[],u=1/t,h=new k,d=new Pe,f=new k,g=new k,y=new k,m=0,p=0;for(let A=0;A<=e.length-1;A++)switch(A){case 0:m=e[A+1].x-e[A].x,p=e[A+1].y-e[A].y,f.x=p*1,f.y=-m,f.z=p*0,y.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case e.length-1:l.push(y.x,y.y,y.z);break;default:m=e[A+1].x-e[A].x,p=e[A+1].y-e[A].y,f.x=p*1,f.y=-m,f.z=p*0,g.copy(f),f.x+=y.x,f.y+=y.y,f.z+=y.z,f.normalize(),l.push(f.x,f.y,f.z),y.copy(g)}for(let A=0;A<=t;A++){let C=i+A*u*s,v=Math.sin(C),M=Math.cos(C);for(let E=0;E<=e.length-1;E++){h.x=e[E].x*v,h.y=e[E].y,h.z=e[E].x*M,o.push(h.x,h.y,h.z),d.x=A/t,d.y=E/(e.length-1),a.push(d.x,d.y);let b=l[3*E+0]*v,R=l[3*E+1],_=l[3*E+0]*M;c.push(b,R,_)}}for(let A=0;A<t;A++)for(let C=0;C<e.length-1;C++){let v=C+A*e.length,M=v,E=v+e.length,b=v+e.length+1,R=v+1;r.push(M,E,R),r.push(b,R,E)}this.setIndex(r),this.setAttribute("position",new bt(o,3)),this.setAttribute("uv",new bt(a,2)),this.setAttribute("normal",new bt(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.points,e.segments,e.phiStart,e.phiLength)}},Hi=class n extends Xo{constructor(e=1,t=1,i=4,s=8){let r=new Wo;r.absarc(0,-t/2,e,Math.PI*1.5,0),r.absarc(0,t/2,e,0,Math.PI*.5),super(r.getPoints(i),s),this.type="CapsuleGeometry",this.parameters={radius:e,length:t,capSegments:i,radialSegments:s}}static fromJSON(e){return new n(e.radius,e.length,e.capSegments,e.radialSegments)}},Vi=class n extends gn{constructor(e=1,t=32,i=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:s},t=Math.max(3,t);let r=[],o=[],a=[],l=[],c=new k,u=new Pe;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,d=3;h<=t;h++,d+=3){let f=i+h/t*s;c.x=e*Math.cos(f),c.y=e*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[d]/e+1)/2,u.y=(o[d+1]/e+1)/2,l.push(u.x,u.y)}for(let h=1;h<=t;h++)r.push(h,h+1,0);this.setIndex(r),this.setAttribute("position",new bt(o,3)),this.setAttribute("normal",new bt(a,3)),this.setAttribute("uv",new bt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.segments,e.thetaStart,e.thetaLength)}},_i=class n extends gn{constructor(e=1,t=1,i=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let u=[],h=[],d=[],f=[],g=0,y=[],m=i/2,p=0;A(),o===!1&&(e>0&&C(!0),t>0&&C(!1)),this.setIndex(u),this.setAttribute("position",new bt(h,3)),this.setAttribute("normal",new bt(d,3)),this.setAttribute("uv",new bt(f,2));function A(){let v=new k,M=new k,E=0,b=(t-e)/i;for(let R=0;R<=r;R++){let _=[],x=R/r,L=x*(t-e)+e;for(let V=0;V<=s;V++){let F=V/s,I=F*l+a,O=Math.sin(I),P=Math.cos(I);M.x=L*O,M.y=-x*i+m,M.z=L*P,h.push(M.x,M.y,M.z),v.set(O,b,P).normalize(),d.push(v.x,v.y,v.z),f.push(F,1-x),_.push(g++)}y.push(_)}for(let R=0;R<s;R++)for(let _=0;_<r;_++){let x=y[_][R],L=y[_+1][R],V=y[_+1][R+1],F=y[_][R+1];(e>0||_!==0)&&(u.push(x,L,F),E+=3),(t>0||_!==r-1)&&(u.push(L,V,F),E+=3)}c.addGroup(p,E,0),p+=E}function C(v){let M=g,E=new Pe,b=new k,R=0,_=v===!0?e:t,x=v===!0?1:-1;for(let V=1;V<=s;V++)h.push(0,m*x,0),d.push(0,x,0),f.push(.5,.5),g++;let L=g;for(let V=0;V<=s;V++){let I=V/s*l+a,O=Math.cos(I),P=Math.sin(I);b.x=_*P,b.y=m*x,b.z=_*O,h.push(b.x,b.y,b.z),d.push(0,x,0),E.x=O*.5+.5,E.y=P*.5*x+.5,f.push(E.x,E.y),g++}for(let V=0;V<s;V++){let F=M+V,I=L+V;v===!0?u.push(I,I+1,F):u.push(I+1,I,F),R+=3}c.addGroup(p,R,v===!0?1:2),p+=R}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},ca=class n extends _i{constructor(e=1,t=1,i=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,i,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new n(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var ys=class n extends gn{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(i),l=Math.floor(s),c=a+1,u=l+1,h=e/a,d=t/l,f=[],g=[],y=[],m=[];for(let p=0;p<u;p++){let A=p*d-o;for(let C=0;C<c;C++){let v=C*h-r;g.push(v,-A,0),y.push(0,0,1),m.push(C/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let A=0;A<a;A++){let C=A+c*p,v=A+c*(p+1),M=A+1+c*(p+1),E=A+1+c*p;f.push(C,v,E),f.push(v,M,E)}this.setIndex(f),this.setAttribute("position",new bt(g,3)),this.setAttribute("normal",new bt(y,3)),this.setAttribute("uv",new bt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}};var qn=class n extends gn{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let l=Math.min(o+a,Math.PI),c=0,u=[],h=new k,d=new k,f=[],g=[],y=[],m=[];for(let p=0;p<=i;p++){let A=[],C=p/i,v=0;p===0&&o===0?v=.5/t:p===i&&l===Math.PI&&(v=-.5/t);for(let M=0;M<=t;M++){let E=M/t;h.x=-e*Math.cos(s+E*r)*Math.sin(o+C*a),h.y=e*Math.cos(o+C*a),h.z=e*Math.sin(s+E*r)*Math.sin(o+C*a),g.push(h.x,h.y,h.z),d.copy(h).normalize(),y.push(d.x,d.y,d.z),m.push(E+v,1-C),A.push(c++)}u.push(A)}for(let p=0;p<i;p++)for(let A=0;A<t;A++){let C=u[p][A+1],v=u[p][A],M=u[p+1][A],E=u[p+1][A+1];(p!==0||o>0)&&f.push(C,v,E),(p!==i-1||l<Math.PI)&&f.push(v,M,E)}this.setIndex(f),this.setAttribute("position",new bt(g,3)),this.setAttribute("normal",new bt(y,3)),this.setAttribute("uv",new bt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var ar=class n extends gn{constructor(e=1,t=.4,i=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:s,arc:r},i=Math.floor(i),s=Math.floor(s);let o=[],a=[],l=[],c=[],u=new k,h=new k,d=new k;for(let f=0;f<=i;f++)for(let g=0;g<=s;g++){let y=g/s*r,m=f/i*Math.PI*2;h.x=(e+t*Math.cos(m))*Math.cos(y),h.y=(e+t*Math.cos(m))*Math.sin(y),h.z=t*Math.sin(m),a.push(h.x,h.y,h.z),u.x=e*Math.cos(y),u.y=e*Math.sin(y),d.subVectors(h,u).normalize(),l.push(d.x,d.y,d.z),c.push(g/s),c.push(f/i)}for(let f=1;f<=i;f++)for(let g=1;g<=s;g++){let y=(s+1)*f+g-1,m=(s+1)*(f-1)+g-1,p=(s+1)*(f-1)+g,A=(s+1)*f+g;o.push(y,m,A),o.push(m,p,A)}this.setIndex(o),this.setAttribute("position",new bt(a,3)),this.setAttribute("normal",new bt(l,3)),this.setAttribute("uv",new bt(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};var Ot=class extends Bi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ze(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ze(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Xu,this.normalScale=new Pe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Dn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var Yo=class extends Bi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=mp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},$o=class extends Bi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function To(n,e,t){return!n||!t&&n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function F_(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}var vs=class{constructor(e,t,i,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,s=t[i],r=t[i-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=i+2;;){if(s===void 0){if(e<r)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(r=s,s=t[++i],e<s)break e}o=t.length;break t}if(!(e>=r)){let a=t[1];e<a&&(i=2,r=a);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=r,r=t[--i-1],e>=r)break e}o=i,i=0;break t}break n}for(;i<o;){let a=i+o>>>1;e<t[a]?o=a:i=a+1}if(s=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=i[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},qo=class extends vs{constructor(e,t,i,s){super(e,t,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:_u,endingEnd:_u}}intervalChanged_(e,t,i){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case xu:r=e,a=2*t-i;break;case bu:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case xu:o=e,l=2*i-t;break;case bu:o=1,l=i+s[1]-s[0];break;default:o=e-1,l=t}let c=(i-t)*.5,u=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-i),this._offsetPrev=r*u,this._offsetNext=o*u}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(i-t)/(s-t),y=g*g,m=y*g,p=-d*m+2*d*y-d*g,A=(1+d)*m+(-1.5-2*d)*y+(-.5+d)*g+1,C=(-1-f)*m+(1.5+f)*y+.5*g,v=f*m-f*y;for(let M=0;M!==a;++M)r[M]=p*o[u+M]+A*o[c+M]+C*o[l+M]+v*o[h+M];return r}},Ko=class extends vs{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(i-t)/(s-t),h=1-u;for(let d=0;d!==a;++d)r[d]=o[c+d]*h+o[l+d]*u;return r}},Zo=class extends vs{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e){return this.copySampleValue_(e-1)}},Mn=class{constructor(e,t,i,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=To(t,this.TimeBufferType),this.values=To(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:To(e.times,Array),values:To(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(i.interpolation=s)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new Zo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Ko(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new qo(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case $r:t=this.InterpolantFactoryMethodDiscrete;break;case Po:t=this.InterpolantFactoryMethodLinear;break;case Ao:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return $r;case this.InterpolantFactoryMethodLinear:return Po;case this.InterpolantFactoryMethodSmooth:return Ao}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]*=e}return this}trim(e,t){let i=this.times,s=i.length,r=0,o=s-1;for(;r!==s&&i[r]<e;)++r;for(;o!==-1&&i[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=i.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,s=this.values,r=i.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let l=i[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&F_(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===Ao,r=e.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(s)l=!0;else{let h=a*i,d=h-i,f=h+i;for(let g=0;g!==i;++g){let y=t[h+g];if(y!==t[d+g]||y!==t[f+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let h=a*i,d=o*i;for(let f=0;f!==i;++f)t[d+f]=t[h+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*i,l=o*i,c=0;c!==i;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,s=new i(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};Mn.prototype.TimeBufferType=Float32Array;Mn.prototype.ValueBufferType=Float32Array;Mn.prototype.DefaultInterpolation=Po;var Gi=class extends Mn{constructor(e,t,i){super(e,t,i)}};Gi.prototype.ValueTypeName="bool";Gi.prototype.ValueBufferType=Array;Gi.prototype.DefaultInterpolation=$r;Gi.prototype.InterpolantFactoryMethodLinear=void 0;Gi.prototype.InterpolantFactoryMethodSmooth=void 0;var Jo=class extends Mn{};Jo.prototype.ValueTypeName="color";var Qo=class extends Mn{};Qo.prototype.ValueTypeName="number";var jo=class extends vs{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-t)/(s-t),c=e*a;for(let u=c+a;c!==u;c+=4)vi.slerpFlat(r,0,o,c-a,o,c,l);return r}},ua=class extends Mn{InterpolantFactoryMethodLinear(e){return new jo(this.times,this.values,this.getValueSize(),e)}};ua.prototype.ValueTypeName="quaternion";ua.prototype.InterpolantFactoryMethodSmooth=void 0;var Wi=class extends Mn{constructor(e,t,i){super(e,t,i)}};Wi.prototype.ValueTypeName="string";Wi.prototype.ValueBufferType=Array;Wi.prototype.DefaultInterpolation=$r;Wi.prototype.InterpolantFactoryMethodLinear=void 0;Wi.prototype.InterpolantFactoryMethodSmooth=void 0;var el=class extends Mn{};el.prototype.ValueTypeName="vector";var wu={enabled:!1,files:{},add:function(n,e){this.enabled!==!1&&(this.files[n]=e)},get:function(n){if(this.enabled!==!1)return this.files[n]},remove:function(n){delete this.files[n]},clear:function(){this.files={}}},tl=class{constructor(e,t,i){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.itemStart=function(u){a++,r===!1&&s.onStart!==void 0&&s.onStart(u,o,a),r=!0},this.itemEnd=function(u){o++,s.onProgress!==void 0&&s.onProgress(u,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){let h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=c.length;h<d;h+=2){let f=c[h],g=c[h+1];if(f.global&&(f.lastIndex=0),f.test(u))return g}return null}}},Pp=new tl,or=class{constructor(e){this.manager=e!==void 0?e:Pp,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let i=this;return new Promise(function(s,r){i.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};or.DEFAULT_MATERIAL_NAME="__DEFAULT";var nl=class extends or{constructor(e){super(e)}load(e,t,i,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=wu.get(e);if(o!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o;let a=tr("img");function l(){u(),wu.add(e,this),t&&t(this),r.manager.itemEnd(e)}function c(h){u(),s&&s(h),r.manager.itemError(e),r.manager.itemEnd(e)}function u(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),r.manager.itemStart(e),a.src=e,a}};var ha=class extends or{constructor(e){super(e)}load(e,t,i,s){let r=new sn,o=new nl(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},i,s),r}},lr=class extends qt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ze(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},da=class extends lr{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(qt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ze(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},yu=new Et,kf=new k,Of=new k,il=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Pe(512,512),this.map=null,this.mapPass=null,this.matrix=new Et,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ir,this._frameExtents=new Pe(1,1),this._viewportCount=1,this._viewports=[new pt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,i=this.matrix;kf.setFromMatrixPosition(e.matrixWorld),t.position.copy(kf),Of.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Of),t.updateMatrixWorld(),yu.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(yu),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(yu)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var Bf=new Et,Vr=new k,vu=new k,Eu=class extends il{constructor(){super(new Gt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Pe(4,2),this._viewportCount=6,this._viewports=[new pt(2,1,1,1),new pt(0,1,1,1),new pt(3,1,1,1),new pt(1,1,1,1),new pt(3,0,1,1),new pt(1,0,1,1)],this._cubeDirections=[new k(1,0,0),new k(-1,0,0),new k(0,0,1),new k(0,0,-1),new k(0,1,0),new k(0,-1,0)],this._cubeUps=[new k(0,1,0),new k(0,1,0),new k(0,1,0),new k(0,1,0),new k(0,0,1),new k(0,0,-1)]}updateMatrices(e,t=0){let i=this.camera,s=this.matrix,r=e.distance||i.far;r!==i.far&&(i.far=r,i.updateProjectionMatrix()),Vr.setFromMatrixPosition(e.matrixWorld),i.position.copy(Vr),vu.copy(i.position),vu.add(this._cubeDirections[t]),i.up.copy(this._cubeUps[t]),i.lookAt(vu),i.updateMatrixWorld(),s.makeTranslation(-Vr.x,-Vr.y,-Vr.z),Bf.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Bf)}},fa=class extends lr{constructor(e,t,i=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new Eu}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},pa=class extends ta{constructor(e=-1,t=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-e,o=i+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Tu=class extends il{constructor(){super(new pa(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},cr=class extends lr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(qt.DEFAULT_UP),this.updateMatrix(),this.target=new qt,this.shadow=new Tu}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var sl=class extends Gt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}};var Qu="\\[\\]\\.:\\/",k_=new RegExp("["+Qu+"]","g"),ju="[^"+Qu+"]",O_="[^"+Qu.replace("\\.","")+"]",B_=/((?:WC+[\/:])*)/.source.replace("WC",ju),z_=/(WCOD+)?/.source.replace("WCOD",O_),H_=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",ju),V_=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",ju),G_=new RegExp("^"+B_+z_+H_+V_+"$"),W_=["material","materials","bones","map"],Au=class{constructor(e,t,i){let s=i||xt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},xt=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(k_,"")}static parseTrackName(e){let t=G_.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);W_.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let l=i(a.children);if(l)return l}return null},s=i(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)e[t++]=i[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=t.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[s];if(o===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};xt.Composite=Au;xt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};xt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};xt.prototype.GetterByBindingType=[xt.prototype._getValue_direct,xt.prototype._getValue_array,xt.prototype._getValue_arrayElement,xt.prototype._getValue_toArray];xt.prototype.SetterByBindingTypeAndVersioning=[[xt.prototype._setValue_direct,xt.prototype._setValue_direct_setNeedsUpdate,xt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_array,xt.prototype._setValue_array_setNeedsUpdate,xt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_arrayElement,xt.prototype._setValue_arrayElement_setNeedsUpdate,xt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_fromArray,xt.prototype._setValue_fromArray_setNeedsUpdate,xt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var pE=new Float32Array(1);function eh(n,e,t,i){let s=X_(i);switch(t){case Ou:return n*e;case zu:return n*e;case Hu:return n*e*2;case Vu:return n*e/s.components*s.byteLength;case xl:return n*e/s.components*s.byteLength;case Gu:return n*e*2/s.components*s.byteLength;case bl:return n*e*2/s.components*s.byteLength;case Bu:return n*e*3/s.components*s.byteLength;case wn:return n*e*4/s.components*s.byteLength;case Sl:return n*e*4/s.components*s.byteLength;case ya:case va:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case _a:case xa:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case wl:case Tl:return Math.max(n,16)*Math.max(e,8)/4;case Ml:case El:return Math.max(n,8)*Math.max(e,8)/2;case Al:case Cl:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Rl:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Il:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Pl:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Nl:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case Ll:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case Dl:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case Ul:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case Fl:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case kl:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case Ol:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case Bl:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case zl:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case Hl:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case Vl:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case Gl:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case ba:case Wl:case Xl:return Math.ceil(n/4)*Math.ceil(e/4)*16;case Wu:case Yl:return Math.ceil(n/4)*Math.ceil(e/4)*8;case $l:case ql:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function X_(n){switch(n){case Jn:case Uu:return{byteLength:1,components:1};case ur:case Fu:case hr:return{byteLength:2,components:1};case vl:case _l:return{byteLength:2,components:4};case Yi:case yl:case Qn:return{byteLength:4,components:1};case ku:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"172"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="172");function tm(){let n=null,e=!1,t=null,i=null;function s(r,o){t(r,o),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function $_(n){let e=new WeakMap;function t(a,l){let c=a.array,u=a.usage,h=c.byteLength,d=n.createBuffer();n.bindBuffer(l,d),n.bufferData(l,c,u),a.onUploadCallback();let f;if(c instanceof Float32Array)f=n.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=n.HALF_FLOAT:f=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=n.SHORT;else if(c instanceof Uint32Array)f=n.UNSIGNED_INT;else if(c instanceof Int32Array)f=n.INT;else if(c instanceof Int8Array)f=n.BYTE;else if(c instanceof Uint8Array)f=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:h}}function i(a,l,c){let u=l.array,h=l.updateRanges;if(n.bindBuffer(c,a),h.length===0)n.bufferSubData(c,0,u);else{h.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<h.length;f++){let g=h[d],y=h[f];y.start<=g.start+g.count+1?g.count=Math.max(g.count,y.start+y.count-g.start):(++d,h[d]=y)}h.length=d+1;for(let f=0,g=h.length;f<g;f++){let y=h[f];n.bufferSubData(c,y.start*u.BYTES_PER_ELEMENT,u,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(n.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var q_=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,K_=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Z_=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,J_=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Q_=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,j_=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,ex=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,tx=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,nx=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,ix=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,sx=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,rx=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,ax=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,ox=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,lx=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,cx=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,ux=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,hx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,dx=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,fx=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,px=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,mx=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,gx=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,yx=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,vx=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,_x=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,xx=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,bx=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Sx=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Mx=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,wx="gl_FragColor = linearToOutputTexel( gl_FragColor );",Ex=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Tx=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Ax=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Cx=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Rx=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Ix=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Px=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Nx=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Lx=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Dx=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Ux=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Fx=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,kx=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Ox=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Bx=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,zx=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Hx=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Vx=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Gx=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Wx=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Xx=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Yx=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,$x=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,qx=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Kx=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Zx=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Jx=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Qx=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,jx=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,eb=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,tb=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,nb=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,ib=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,sb=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,rb=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,ab=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,ob=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,lb=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,cb=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,ub=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,hb=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,db=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,fb=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,pb=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,mb=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,gb=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,yb=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,vb=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,_b=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,xb=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,bb=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Sb=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Mb=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,wb=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Eb=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Tb=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Ab=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Cb=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Rb=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Ib=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Pb=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Nb=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Lb=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Db=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Ub=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Fb=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,kb=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Ob=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Bb=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,zb=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Hb=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Vb=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Gb=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Wb=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Xb=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Yb=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,$b=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,qb=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Kb=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Zb=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Jb=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Qb=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,jb=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,eS=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,tS=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,nS=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,iS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,sS=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,rS=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,aS=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,oS=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,lS=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,cS=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,uS=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,hS=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,dS=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,fS=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,pS=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,mS=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,gS=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,yS=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,vS=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_S=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,xS=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,bS=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,SS=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,MS=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,wS=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ES=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,TS=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,je={alphahash_fragment:q_,alphahash_pars_fragment:K_,alphamap_fragment:Z_,alphamap_pars_fragment:J_,alphatest_fragment:Q_,alphatest_pars_fragment:j_,aomap_fragment:ex,aomap_pars_fragment:tx,batching_pars_vertex:nx,batching_vertex:ix,begin_vertex:sx,beginnormal_vertex:rx,bsdfs:ax,iridescence_fragment:ox,bumpmap_pars_fragment:lx,clipping_planes_fragment:cx,clipping_planes_pars_fragment:ux,clipping_planes_pars_vertex:hx,clipping_planes_vertex:dx,color_fragment:fx,color_pars_fragment:px,color_pars_vertex:mx,color_vertex:gx,common:yx,cube_uv_reflection_fragment:vx,defaultnormal_vertex:_x,displacementmap_pars_vertex:xx,displacementmap_vertex:bx,emissivemap_fragment:Sx,emissivemap_pars_fragment:Mx,colorspace_fragment:wx,colorspace_pars_fragment:Ex,envmap_fragment:Tx,envmap_common_pars_fragment:Ax,envmap_pars_fragment:Cx,envmap_pars_vertex:Rx,envmap_physical_pars_fragment:zx,envmap_vertex:Ix,fog_vertex:Px,fog_pars_vertex:Nx,fog_fragment:Lx,fog_pars_fragment:Dx,gradientmap_pars_fragment:Ux,lightmap_pars_fragment:Fx,lights_lambert_fragment:kx,lights_lambert_pars_fragment:Ox,lights_pars_begin:Bx,lights_toon_fragment:Hx,lights_toon_pars_fragment:Vx,lights_phong_fragment:Gx,lights_phong_pars_fragment:Wx,lights_physical_fragment:Xx,lights_physical_pars_fragment:Yx,lights_fragment_begin:$x,lights_fragment_maps:qx,lights_fragment_end:Kx,logdepthbuf_fragment:Zx,logdepthbuf_pars_fragment:Jx,logdepthbuf_pars_vertex:Qx,logdepthbuf_vertex:jx,map_fragment:eb,map_pars_fragment:tb,map_particle_fragment:nb,map_particle_pars_fragment:ib,metalnessmap_fragment:sb,metalnessmap_pars_fragment:rb,morphinstance_vertex:ab,morphcolor_vertex:ob,morphnormal_vertex:lb,morphtarget_pars_vertex:cb,morphtarget_vertex:ub,normal_fragment_begin:hb,normal_fragment_maps:db,normal_pars_fragment:fb,normal_pars_vertex:pb,normal_vertex:mb,normalmap_pars_fragment:gb,clearcoat_normal_fragment_begin:yb,clearcoat_normal_fragment_maps:vb,clearcoat_pars_fragment:_b,iridescence_pars_fragment:xb,opaque_fragment:bb,packing:Sb,premultiplied_alpha_fragment:Mb,project_vertex:wb,dithering_fragment:Eb,dithering_pars_fragment:Tb,roughnessmap_fragment:Ab,roughnessmap_pars_fragment:Cb,shadowmap_pars_fragment:Rb,shadowmap_pars_vertex:Ib,shadowmap_vertex:Pb,shadowmask_pars_fragment:Nb,skinbase_vertex:Lb,skinning_pars_vertex:Db,skinning_vertex:Ub,skinnormal_vertex:Fb,specularmap_fragment:kb,specularmap_pars_fragment:Ob,tonemapping_fragment:Bb,tonemapping_pars_fragment:zb,transmission_fragment:Hb,transmission_pars_fragment:Vb,uv_pars_fragment:Gb,uv_pars_vertex:Wb,uv_vertex:Xb,worldpos_vertex:Yb,background_vert:$b,background_frag:qb,backgroundCube_vert:Kb,backgroundCube_frag:Zb,cube_vert:Jb,cube_frag:Qb,depth_vert:jb,depth_frag:eS,distanceRGBA_vert:tS,distanceRGBA_frag:nS,equirect_vert:iS,equirect_frag:sS,linedashed_vert:rS,linedashed_frag:aS,meshbasic_vert:oS,meshbasic_frag:lS,meshlambert_vert:cS,meshlambert_frag:uS,meshmatcap_vert:hS,meshmatcap_frag:dS,meshnormal_vert:fS,meshnormal_frag:pS,meshphong_vert:mS,meshphong_frag:gS,meshphysical_vert:yS,meshphysical_frag:vS,meshtoon_vert:_S,meshtoon_frag:xS,points_vert:bS,points_frag:SS,shadow_vert:MS,shadow_frag:wS,sprite_vert:ES,sprite_frag:TS},Se={common:{diffuse:{value:new Ze(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ke},alphaMap:{value:null},alphaMapTransform:{value:new Ke},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ke}},envmap:{envMap:{value:null},envMapRotation:{value:new Ke},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ke}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ke}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ke},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ke},normalScale:{value:new Pe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ke},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ke}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ke}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ke}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ze(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ze(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ke},alphaTest:{value:0},uvTransform:{value:new Ke}},sprite:{diffuse:{value:new Ze(16777215)},opacity:{value:1},center:{value:new Pe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ke},alphaMap:{value:null},alphaMapTransform:{value:new Ke},alphaTest:{value:0}}},jn={basic:{uniforms:Kt([Se.common,Se.specularmap,Se.envmap,Se.aomap,Se.lightmap,Se.fog]),vertexShader:je.meshbasic_vert,fragmentShader:je.meshbasic_frag},lambert:{uniforms:Kt([Se.common,Se.specularmap,Se.envmap,Se.aomap,Se.lightmap,Se.emissivemap,Se.bumpmap,Se.normalmap,Se.displacementmap,Se.fog,Se.lights,{emissive:{value:new Ze(0)}}]),vertexShader:je.meshlambert_vert,fragmentShader:je.meshlambert_frag},phong:{uniforms:Kt([Se.common,Se.specularmap,Se.envmap,Se.aomap,Se.lightmap,Se.emissivemap,Se.bumpmap,Se.normalmap,Se.displacementmap,Se.fog,Se.lights,{emissive:{value:new Ze(0)},specular:{value:new Ze(1118481)},shininess:{value:30}}]),vertexShader:je.meshphong_vert,fragmentShader:je.meshphong_frag},standard:{uniforms:Kt([Se.common,Se.envmap,Se.aomap,Se.lightmap,Se.emissivemap,Se.bumpmap,Se.normalmap,Se.displacementmap,Se.roughnessmap,Se.metalnessmap,Se.fog,Se.lights,{emissive:{value:new Ze(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:je.meshphysical_vert,fragmentShader:je.meshphysical_frag},toon:{uniforms:Kt([Se.common,Se.aomap,Se.lightmap,Se.emissivemap,Se.bumpmap,Se.normalmap,Se.displacementmap,Se.gradientmap,Se.fog,Se.lights,{emissive:{value:new Ze(0)}}]),vertexShader:je.meshtoon_vert,fragmentShader:je.meshtoon_frag},matcap:{uniforms:Kt([Se.common,Se.bumpmap,Se.normalmap,Se.displacementmap,Se.fog,{matcap:{value:null}}]),vertexShader:je.meshmatcap_vert,fragmentShader:je.meshmatcap_frag},points:{uniforms:Kt([Se.points,Se.fog]),vertexShader:je.points_vert,fragmentShader:je.points_frag},dashed:{uniforms:Kt([Se.common,Se.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:je.linedashed_vert,fragmentShader:je.linedashed_frag},depth:{uniforms:Kt([Se.common,Se.displacementmap]),vertexShader:je.depth_vert,fragmentShader:je.depth_frag},normal:{uniforms:Kt([Se.common,Se.bumpmap,Se.normalmap,Se.displacementmap,{opacity:{value:1}}]),vertexShader:je.meshnormal_vert,fragmentShader:je.meshnormal_frag},sprite:{uniforms:Kt([Se.sprite,Se.fog]),vertexShader:je.sprite_vert,fragmentShader:je.sprite_frag},background:{uniforms:{uvTransform:{value:new Ke},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:je.background_vert,fragmentShader:je.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ke}},vertexShader:je.backgroundCube_vert,fragmentShader:je.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:je.cube_vert,fragmentShader:je.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:je.equirect_vert,fragmentShader:je.equirect_frag},distanceRGBA:{uniforms:Kt([Se.common,Se.displacementmap,{referencePosition:{value:new k},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:je.distanceRGBA_vert,fragmentShader:je.distanceRGBA_frag},shadow:{uniforms:Kt([Se.lights,Se.fog,{color:{value:new Ze(0)},opacity:{value:1}}]),vertexShader:je.shadow_vert,fragmentShader:je.shadow_frag}};jn.physical={uniforms:Kt([jn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ke},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ke},clearcoatNormalScale:{value:new Pe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ke},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ke},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ke},sheen:{value:0},sheenColor:{value:new Ze(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ke},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ke},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ke},transmissionSamplerSize:{value:new Pe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ke},attenuationDistance:{value:0},attenuationColor:{value:new Ze(0)},specularColor:{value:new Ze(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ke},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ke},anisotropyVector:{value:new Pe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ke}}]),vertexShader:je.meshphysical_vert,fragmentShader:je.meshphysical_frag};var Kl={r:0,b:0,g:0},ws=new Dn,AS=new Et;function CS(n,e,t,i,s,r,o){let a=new Ze(0),l=r===!0?0:1,c,u,h=null,d=0,f=null;function g(C){let v=C.isScene===!0?C.background:null;return v&&v.isTexture&&(v=(C.backgroundBlurriness>0?t:e).get(v)),v}function y(C){let v=!1,M=g(C);M===null?p(a,l):M&&M.isColor&&(p(M,1),v=!0);let E=n.xr.getEnvironmentBlendMode();E==="additive"?i.buffers.color.setClear(0,0,0,1,o):E==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||v)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function m(C,v){let M=g(v);M&&(M.isCubeTexture||M.mapping===ma)?(u===void 0&&(u=new Be(new zi(1,1,1),new Un({name:"BackgroundCubeMaterial",uniforms:Ms(jn.backgroundCube.uniforms),vertexShader:jn.backgroundCube.vertexShader,fragmentShader:jn.backgroundCube.fragmentShader,side:Wt,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(E,b,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),ws.copy(v.backgroundRotation),ws.x*=-1,ws.y*=-1,ws.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(ws.y*=-1,ws.z*=-1),u.material.uniforms.envMap.value=M,u.material.uniforms.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(AS.makeRotationFromEuler(ws)),u.material.toneMapped=ct.getTransfer(M.colorSpace)!==mt,(h!==M||d!==M.version||f!==n.toneMapping)&&(u.material.needsUpdate=!0,h=M,d=M.version,f=n.toneMapping),u.layers.enableAll(),C.unshift(u,u.geometry,u.material,0,0,null)):M&&M.isTexture&&(c===void 0&&(c=new Be(new ys(2,2),new Un({name:"BackgroundMaterial",uniforms:Ms(jn.background.uniforms),vertexShader:jn.background.vertexShader,fragmentShader:jn.background.fragmentShader,side:gi,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=M,c.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,c.material.toneMapped=ct.getTransfer(M.colorSpace)!==mt,M.matrixAutoUpdate===!0&&M.updateMatrix(),c.material.uniforms.uvTransform.value.copy(M.matrix),(h!==M||d!==M.version||f!==n.toneMapping)&&(c.material.needsUpdate=!0,h=M,d=M.version,f=n.toneMapping),c.layers.enableAll(),C.unshift(c,c.geometry,c.material,0,0,null))}function p(C,v){C.getRGB(Kl,Zu(n)),i.buffers.color.setClear(Kl.r,Kl.g,Kl.b,v,o)}function A(){u!==void 0&&(u.geometry.dispose(),u.material.dispose()),c!==void 0&&(c.geometry.dispose(),c.material.dispose())}return{getClearColor:function(){return a},setClearColor:function(C,v=1){a.set(C),l=v,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(C){l=C,p(a,l)},render:y,addToRenderList:m,dispose:A}}function RS(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=d(null),r=s,o=!1;function a(x,L,V,F,I){let O=!1,P=h(F,V,L);r!==P&&(r=P,c(r.object)),O=f(x,F,V,I),O&&g(x,F,V,I),I!==null&&e.update(I,n.ELEMENT_ARRAY_BUFFER),(O||o)&&(o=!1,v(x,L,V,F),I!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(I).buffer))}function l(){return n.createVertexArray()}function c(x){return n.bindVertexArray(x)}function u(x){return n.deleteVertexArray(x)}function h(x,L,V){let F=V.wireframe===!0,I=i[x.id];I===void 0&&(I={},i[x.id]=I);let O=I[L.id];O===void 0&&(O={},I[L.id]=O);let P=O[F];return P===void 0&&(P=d(l()),O[F]=P),P}function d(x){let L=[],V=[],F=[];for(let I=0;I<t;I++)L[I]=0,V[I]=0,F[I]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:V,attributeDivisors:F,object:x,attributes:{},index:null}}function f(x,L,V,F){let I=r.attributes,O=L.attributes,P=0,B=V.getAttributes();for(let H in B)if(B[H].location>=0){let se=I[H],he=O[H];if(he===void 0&&(H==="instanceMatrix"&&x.instanceMatrix&&(he=x.instanceMatrix),H==="instanceColor"&&x.instanceColor&&(he=x.instanceColor)),se===void 0||se.attribute!==he||he&&se.data!==he.data)return!0;P++}return r.attributesNum!==P||r.index!==F}function g(x,L,V,F){let I={},O=L.attributes,P=0,B=V.getAttributes();for(let H in B)if(B[H].location>=0){let se=O[H];se===void 0&&(H==="instanceMatrix"&&x.instanceMatrix&&(se=x.instanceMatrix),H==="instanceColor"&&x.instanceColor&&(se=x.instanceColor));let he={};he.attribute=se,se&&se.data&&(he.data=se.data),I[H]=he,P++}r.attributes=I,r.attributesNum=P,r.index=F}function y(){let x=r.newAttributes;for(let L=0,V=x.length;L<V;L++)x[L]=0}function m(x){p(x,0)}function p(x,L){let V=r.newAttributes,F=r.enabledAttributes,I=r.attributeDivisors;V[x]=1,F[x]===0&&(n.enableVertexAttribArray(x),F[x]=1),I[x]!==L&&(n.vertexAttribDivisor(x,L),I[x]=L)}function A(){let x=r.newAttributes,L=r.enabledAttributes;for(let V=0,F=L.length;V<F;V++)L[V]!==x[V]&&(n.disableVertexAttribArray(V),L[V]=0)}function C(x,L,V,F,I,O,P){P===!0?n.vertexAttribIPointer(x,L,V,I,O):n.vertexAttribPointer(x,L,V,F,I,O)}function v(x,L,V,F){y();let I=F.attributes,O=V.getAttributes(),P=L.defaultAttributeValues;for(let B in O){let H=O[B];if(H.location>=0){let ee=I[B];if(ee===void 0&&(B==="instanceMatrix"&&x.instanceMatrix&&(ee=x.instanceMatrix),B==="instanceColor"&&x.instanceColor&&(ee=x.instanceColor)),ee!==void 0){let se=ee.normalized,he=ee.itemSize,Me=e.get(ee);if(Me===void 0)continue;let Ne=Me.buffer,Z=Me.type,oe=Me.bytesPerElement,me=Z===n.INT||Z===n.UNSIGNED_INT||ee.gpuType===yl;if(ee.isInterleavedBufferAttribute){let ce=ee.data,Re=ce.stride,Le=ee.offset;if(ce.isInstancedInterleavedBuffer){for(let Ye=0;Ye<H.locationSize;Ye++)p(H.location+Ye,ce.meshPerAttribute);x.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=ce.meshPerAttribute*ce.count)}else for(let Ye=0;Ye<H.locationSize;Ye++)m(H.location+Ye);n.bindBuffer(n.ARRAY_BUFFER,Ne);for(let Ye=0;Ye<H.locationSize;Ye++)C(H.location+Ye,he/H.locationSize,Z,se,Re*oe,(Le+he/H.locationSize*Ye)*oe,me)}else{if(ee.isInstancedBufferAttribute){for(let ce=0;ce<H.locationSize;ce++)p(H.location+ce,ee.meshPerAttribute);x.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let ce=0;ce<H.locationSize;ce++)m(H.location+ce);n.bindBuffer(n.ARRAY_BUFFER,Ne);for(let ce=0;ce<H.locationSize;ce++)C(H.location+ce,he/H.locationSize,Z,se,he*oe,he/H.locationSize*ce*oe,me)}}else if(P!==void 0){let se=P[B];if(se!==void 0)switch(se.length){case 2:n.vertexAttrib2fv(H.location,se);break;case 3:n.vertexAttrib3fv(H.location,se);break;case 4:n.vertexAttrib4fv(H.location,se);break;default:n.vertexAttrib1fv(H.location,se)}}}}A()}function M(){R();for(let x in i){let L=i[x];for(let V in L){let F=L[V];for(let I in F)u(F[I].object),delete F[I];delete L[V]}delete i[x]}}function E(x){if(i[x.id]===void 0)return;let L=i[x.id];for(let V in L){let F=L[V];for(let I in F)u(F[I].object),delete F[I];delete L[V]}delete i[x.id]}function b(x){for(let L in i){let V=i[L];if(V[x.id]===void 0)continue;let F=V[x.id];for(let I in F)u(F[I].object),delete F[I];delete V[x.id]}}function R(){_(),o=!0,r!==s&&(r=s,c(r.object))}function _(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:R,resetDefaultState:_,dispose:M,releaseStatesOfGeometry:E,releaseStatesOfProgram:b,initAttributes:y,enableAttribute:m,disableUnusedAttributes:A}}function IS(n,e,t){let i;function s(c){i=c}function r(c,u){n.drawArrays(i,c,u),t.update(u,i,1)}function o(c,u,h){h!==0&&(n.drawArraysInstanced(i,c,u,h),t.update(u,i,h))}function a(c,u,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,u,0,h);let f=0;for(let g=0;g<h;g++)f+=u[g];t.update(f,i,1)}function l(c,u,h,d){if(h===0)return;let f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)o(c[g],u[g],d[g]);else{f.multiDrawArraysInstancedWEBGL(i,c,0,u,0,d,0,h);let g=0;for(let y=0;y<h;y++)g+=u[y]*d[y];t.update(g,i,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function PS(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let b=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(b.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(b){return!(b!==wn&&i.convert(b)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(b){let R=b===hr&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(b!==Jn&&i.convert(b)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&b!==Qn&&!R)}function l(b){if(b==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";b="mediump"}return b==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let h=t.logarithmicDepthBuffer===!0,d=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),f=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),p=n.getParameter(n.MAX_VERTEX_ATTRIBS),A=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),C=n.getParameter(n.MAX_VARYING_VECTORS),v=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),M=g>0,E=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,reverseDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:y,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:A,maxVaryings:C,maxFragmentUniforms:v,vertexTextures:M,maxSamples:E}}function NS(n){let e=this,t=null,i=0,s=!1,r=!1,o=new Xn,a=new Ke,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){let f=h.length!==0||d||i!==0||s;return s=d,i=h.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,d){t=u(h,d,0)},this.setState=function(h,d,f){let g=h.clippingPlanes,y=h.clipIntersection,m=h.clipShadows,p=n.get(h);if(!s||g===null||g.length===0||r&&!m)r?u(null):c();else{let A=r?0:i,C=A*4,v=p.clippingState||null;l.value=v,v=u(g,d,C,f);for(let M=0;M!==C;++M)v[M]=t[M];p.clippingState=v,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=A}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(h,d,f,g){let y=h!==null?h.length:0,m=null;if(y!==0){if(m=l.value,g!==!0||m===null){let p=f+y*4,A=d.matrixWorldInverse;a.getNormalMatrix(A),(m===null||m.length<p)&&(m=new Float32Array(p));for(let C=0,v=f;C!==y;++C,v+=4)o.copy(h[C]).applyMatrix4(A,a),o.normal.toArray(m,v),m[v+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,m}}function LS(n){let e=new WeakMap;function t(o,a){return a===pl?o.mapping=_s:a===ml&&(o.mapping=xs),o}function i(o){if(o&&o.isTexture){let a=o.mapping;if(a===pl||a===ml)if(e.has(o)){let l=e.get(o).texture;return t(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new ko(l.height);return c.fromEquirectangularTexture(n,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:i,dispose:r}}var pr=4,Np=[.125,.215,.35,.446,.526,.582],As=20,th=new pa,Lp=new Ze,nh=null,ih=0,sh=0,rh=!1,Ts=(1+Math.sqrt(5))/2,fr=1/Ts,Dp=[new k(-Ts,fr,0),new k(Ts,fr,0),new k(-fr,0,Ts),new k(fr,0,Ts),new k(0,Ts,-fr),new k(0,Ts,fr),new k(-1,1,-1),new k(1,1,-1),new k(-1,1,1),new k(1,1,1)],gr=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,s=100){nh=this._renderer.getRenderTarget(),ih=this._renderer.getActiveCubeFace(),sh=this._renderer.getActiveMipmapLevel(),rh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,i,s,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=kp(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Fp(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(nh,ih,sh),this._renderer.xr.enabled=rh,e.scissorTest=!1,Zl(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===_s||e.mapping===xs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),nh=this._renderer.getRenderTarget(),ih=this._renderer.getActiveCubeFace(),sh=this._renderer.getActiveMipmapLevel(),rh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Ln,minFilter:Ln,generateMipmaps:!1,type:hr,format:wn,colorSpace:ms,depthBuffer:!1},s=Up(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Up(e,t,i);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=DS(r)),this._blurMaterial=US(r,e,t)}return s}_compileMaterial(e){let t=new Be(this._lodPlanes[0],e);this._renderer.compile(t,th)}_sceneToCubeUV(e,t,i,s){let a=new Gt(90,1,t,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,d=u.toneMapping;u.getClearColor(Lp),u.toneMapping=bi,u.autoClear=!1;let f=new Sn({name:"PMREM.Background",side:Wt,depthWrite:!1,depthTest:!1}),g=new Be(new zi,f),y=!1,m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,y=!0):(f.color.copy(Lp),y=!0);for(let p=0;p<6;p++){let A=p%3;A===0?(a.up.set(0,l[p],0),a.lookAt(c[p],0,0)):A===1?(a.up.set(0,0,l[p]),a.lookAt(0,c[p],0)):(a.up.set(0,l[p],0),a.lookAt(0,0,c[p]));let C=this._cubeSize;Zl(s,A*C,p>2?C:0,C,C),u.setRenderTarget(s),y&&u.render(g,a),u.render(e,a)}g.geometry.dispose(),g.material.dispose(),u.toneMapping=d,u.autoClear=h,e.background=m}_textureToCubeUV(e,t){let i=this._renderer,s=e.mapping===_s||e.mapping===xs;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=kp()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Fp());let r=s?this._cubemapMaterial:this._equirectMaterial,o=new Be(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;let l=this._cubeSize;Zl(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,th)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Dp[(s-r-1)%Dp.length];this._blur(e,r-1,r,o,a)}t.autoClear=i}_blur(e,t,i,s,r){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,s,"latitudinal",r),this._halfBlur(o,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,h=new Be(this._lodPlanes[s],c),d=c.uniforms,f=this._sizeLods[i]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*As-1),y=r/g,m=isFinite(r)?1+Math.floor(u*y):As;m>As&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${As}`);let p=[],A=0;for(let b=0;b<As;++b){let R=b/y,_=Math.exp(-R*R/2);p.push(_),b===0?A+=_:b<m&&(A+=2*_)}for(let b=0;b<p.length;b++)p[b]=p[b]/A;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=p,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);let{_lodMax:C}=this;d.dTheta.value=g,d.mipInt.value=C-i;let v=this._sizeLods[s],M=3*v*(s>C-pr?s-C+pr:0),E=4*(this._cubeSize-v);Zl(t,M,E,3*v,2*v),l.setRenderTarget(t),l.render(h,th)}};function DS(n){let e=[],t=[],i=[],s=n,r=n-pr+1+Np.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);t.push(a);let l=1/a;o>n-pr?l=Np[o-n+pr-1]:o===0&&(l=0),i.push(l);let c=1/(a-2),u=-c,h=1+c,d=[u,u,h,u,h,h,u,u,h,h,u,h],f=6,g=6,y=3,m=2,p=1,A=new Float32Array(y*g*f),C=new Float32Array(m*g*f),v=new Float32Array(p*g*f);for(let E=0;E<f;E++){let b=E%3*2/3-1,R=E>2?0:-1,_=[b,R,0,b+2/3,R,0,b+2/3,R+1,0,b,R,0,b+2/3,R+1,0,b,R+1,0];A.set(_,y*g*E),C.set(d,m*g*E);let x=[E,E,E,E,E,E];v.set(x,p*g*E)}let M=new gn;M.setAttribute("position",new mn(A,y)),M.setAttribute("uv",new mn(C,m)),M.setAttribute("faceIndex",new mn(v,p)),e.push(M),s>pr&&s--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function Up(n,e,t){let i=new $n(n,e,t);return i.texture.mapping=ma,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Zl(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function US(n,e,t){let i=new Float32Array(As),s=new k(0,1,0);return new Un({name:"SphericalGaussianBlur",defines:{n:As,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:mh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:xi,depthTest:!1,depthWrite:!1})}function Fp(){return new Un({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:mh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:xi,depthTest:!1,depthWrite:!1})}function kp(){return new Un({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:mh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:xi,depthTest:!1,depthWrite:!1})}function mh(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function FS(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){let l=a.mapping,c=l===pl||l===ml,u=l===_s||l===xs;if(c||u){let h=e.get(a),d=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return t===null&&(t=new gr(n)),h=c?t.fromEquirectangular(a,h):t.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),h.texture;if(h!==void 0)return h.texture;{let f=a.image;return c&&f&&f.height>0||u&&f&&s(f)?(t===null&&(t=new gr(n)),h=c?t.fromEquirectangular(a):t.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),a.addEventListener("dispose",r),h.texture):null}}}return a}function s(a){let l=0,c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function r(a){let l=a.target;l.removeEventListener("dispose",r);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function kS(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let s;switch(i){case"WEBGL_depth_texture":s=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=n.getExtension(i)}return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let s=t(i);return s===null&&Ss("THREE.WebGLRenderer: "+i+" extension not supported."),s}}}function OS(n,e,t,i){let s={},r=new WeakMap;function o(h){let d=h.target;d.index!==null&&e.remove(d.index);for(let g in d.attributes)e.remove(d.attributes[g]);d.removeEventListener("dispose",o),delete s[d.id];let f=r.get(d);f&&(e.remove(f),r.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(h,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,t.memory.geometries++),d}function l(h){let d=h.attributes;for(let f in d)e.update(d[f],n.ARRAY_BUFFER)}function c(h){let d=[],f=h.index,g=h.attributes.position,y=0;if(f!==null){let A=f.array;y=f.version;for(let C=0,v=A.length;C<v;C+=3){let M=A[C+0],E=A[C+1],b=A[C+2];d.push(M,E,E,b,b,M)}}else if(g!==void 0){let A=g.array;y=g.version;for(let C=0,v=A.length/3-1;C<v;C+=3){let M=C+0,E=C+1,b=C+2;d.push(M,E,E,b,b,M)}}else return;let m=new(Ku(d)?ea:jr)(d,1);m.version=y;let p=r.get(h);p&&e.remove(p),r.set(h,m)}function u(h){let d=r.get(h);if(d){let f=h.index;f!==null&&d.version<f.version&&c(h)}else c(h);return r.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function BS(n,e,t){let i;function s(d){i=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function l(d,f){n.drawElements(i,f,r,d*o),t.update(f,i,1)}function c(d,f,g){g!==0&&(n.drawElementsInstanced(i,f,r,d*o,g),t.update(f,i,g))}function u(d,f,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,f,0,r,d,0,g);let m=0;for(let p=0;p<g;p++)m+=f[p];t.update(m,i,1)}function h(d,f,g,y){if(g===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<d.length;p++)c(d[p]/o,f[p],y[p]);else{m.multiDrawElementsInstancedWEBGL(i,f,0,r,d,0,y,0,g);let p=0;for(let A=0;A<g;A++)p+=f[A]*y[A];t.update(p,i,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function zS(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(r/3);break;case n.LINES:t.lines+=a*(r/2);break;case n.LINE_STRIP:t.lines+=a*(r-1);break;case n.LINE_LOOP:t.lines+=a*r;break;case n.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function HS(n,e,t){let i=new WeakMap,s=new pt;function r(o,a,l){let c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0,d=i.get(a);if(d===void 0||d.count!==h){let _=function(){b.dispose(),i.delete(a),a.removeEventListener("dispose",_)};d!==void 0&&d.texture.dispose();let f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,y=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],A=a.morphAttributes.color||[],C=0;f===!0&&(C=1),g===!0&&(C=2),y===!0&&(C=3);let v=a.attributes.position.count*C,M=1;v>e.maxTextureSize&&(M=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let E=new Float32Array(v*M*4*h),b=new Jr(E,v,M,h);b.type=Qn,b.needsUpdate=!0;let R=C*4;for(let x=0;x<h;x++){let L=m[x],V=p[x],F=A[x],I=v*M*4*x;for(let O=0;O<L.count;O++){let P=O*R;f===!0&&(s.fromBufferAttribute(L,O),E[I+P+0]=s.x,E[I+P+1]=s.y,E[I+P+2]=s.z,E[I+P+3]=0),g===!0&&(s.fromBufferAttribute(V,O),E[I+P+4]=s.x,E[I+P+5]=s.y,E[I+P+6]=s.z,E[I+P+7]=0),y===!0&&(s.fromBufferAttribute(F,O),E[I+P+8]=s.x,E[I+P+9]=s.y,E[I+P+10]=s.z,E[I+P+11]=F.itemSize===4?s.w:1)}}d={count:h,texture:b,size:new Pe(v,M)},i.set(a,d),a.addEventListener("dispose",_)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let f=0;for(let y=0;y<c.length;y++)f+=c[y];let g=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(n,"morphTargetBaseInfluence",g),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",d.size)}return{update:r}}function VS(n,e,t,i){let s=new WeakMap;function r(l){let c=i.render.frame,u=l.geometry,h=e.get(l,u);if(s.get(h)!==c&&(e.update(h),s.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){let d=l.skeleton;s.get(d)!==c&&(d.update(),s.set(d,c))}return h}function o(){s=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}var nm=new sn,Op=new sa(1,1),im=new Jr,sm=new Do,rm=new na,Bp=[],zp=[],Hp=new Float32Array(16),Vp=new Float32Array(9),Gp=new Float32Array(4);function yr(n,e,t){let i=n[0];if(i<=0||i>0)return n;let s=e*t,r=Bp[s];if(r===void 0&&(r=new Float32Array(s),Bp[s]=r),e!==0){i.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(r,a)}return r}function Dt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Ut(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function jl(n,e){let t=zp[e];t===void 0&&(t=new Int32Array(e),zp[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function GS(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function WS(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Dt(t,e))return;n.uniform2fv(this.addr,e),Ut(t,e)}}function XS(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Dt(t,e))return;n.uniform3fv(this.addr,e),Ut(t,e)}}function YS(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Dt(t,e))return;n.uniform4fv(this.addr,e),Ut(t,e)}}function $S(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Dt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Ut(t,e)}else{if(Dt(t,i))return;Gp.set(i),n.uniformMatrix2fv(this.addr,!1,Gp),Ut(t,i)}}function qS(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Dt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Ut(t,e)}else{if(Dt(t,i))return;Vp.set(i),n.uniformMatrix3fv(this.addr,!1,Vp),Ut(t,i)}}function KS(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Dt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Ut(t,e)}else{if(Dt(t,i))return;Hp.set(i),n.uniformMatrix4fv(this.addr,!1,Hp),Ut(t,i)}}function ZS(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function JS(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Dt(t,e))return;n.uniform2iv(this.addr,e),Ut(t,e)}}function QS(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Dt(t,e))return;n.uniform3iv(this.addr,e),Ut(t,e)}}function jS(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Dt(t,e))return;n.uniform4iv(this.addr,e),Ut(t,e)}}function eM(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function tM(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Dt(t,e))return;n.uniform2uiv(this.addr,e),Ut(t,e)}}function nM(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Dt(t,e))return;n.uniform3uiv(this.addr,e),Ut(t,e)}}function iM(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Dt(t,e))return;n.uniform4uiv(this.addr,e),Ut(t,e)}}function sM(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(Op.compareFunction=Yu,r=Op):r=nm,t.setTexture2D(e||r,s)}function rM(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||sm,s)}function aM(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||rm,s)}function oM(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||im,s)}function lM(n){switch(n){case 5126:return GS;case 35664:return WS;case 35665:return XS;case 35666:return YS;case 35674:return $S;case 35675:return qS;case 35676:return KS;case 5124:case 35670:return ZS;case 35667:case 35671:return JS;case 35668:case 35672:return QS;case 35669:case 35673:return jS;case 5125:return eM;case 36294:return tM;case 36295:return nM;case 36296:return iM;case 35678:case 36198:case 36298:case 36306:case 35682:return sM;case 35679:case 36299:case 36307:return rM;case 35680:case 36300:case 36308:case 36293:return aM;case 36289:case 36303:case 36311:case 36292:return oM}}function cM(n,e){n.uniform1fv(this.addr,e)}function uM(n,e){let t=yr(e,this.size,2);n.uniform2fv(this.addr,t)}function hM(n,e){let t=yr(e,this.size,3);n.uniform3fv(this.addr,t)}function dM(n,e){let t=yr(e,this.size,4);n.uniform4fv(this.addr,t)}function fM(n,e){let t=yr(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function pM(n,e){let t=yr(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function mM(n,e){let t=yr(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function gM(n,e){n.uniform1iv(this.addr,e)}function yM(n,e){n.uniform2iv(this.addr,e)}function vM(n,e){n.uniform3iv(this.addr,e)}function _M(n,e){n.uniform4iv(this.addr,e)}function xM(n,e){n.uniform1uiv(this.addr,e)}function bM(n,e){n.uniform2uiv(this.addr,e)}function SM(n,e){n.uniform3uiv(this.addr,e)}function MM(n,e){n.uniform4uiv(this.addr,e)}function wM(n,e,t){let i=this.cache,s=e.length,r=jl(t,s);Dt(i,r)||(n.uniform1iv(this.addr,r),Ut(i,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||nm,r[o])}function EM(n,e,t){let i=this.cache,s=e.length,r=jl(t,s);Dt(i,r)||(n.uniform1iv(this.addr,r),Ut(i,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||sm,r[o])}function TM(n,e,t){let i=this.cache,s=e.length,r=jl(t,s);Dt(i,r)||(n.uniform1iv(this.addr,r),Ut(i,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||rm,r[o])}function AM(n,e,t){let i=this.cache,s=e.length,r=jl(t,s);Dt(i,r)||(n.uniform1iv(this.addr,r),Ut(i,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||im,r[o])}function CM(n){switch(n){case 5126:return cM;case 35664:return uM;case 35665:return hM;case 35666:return dM;case 35674:return fM;case 35675:return pM;case 35676:return mM;case 5124:case 35670:return gM;case 35667:case 35671:return yM;case 35668:case 35672:return vM;case 35669:case 35673:return _M;case 5125:return xM;case 36294:return bM;case 36295:return SM;case 36296:return MM;case 35678:case 36198:case 36298:case 36306:case 35682:return wM;case 35679:case 36299:case 36307:return EM;case 35680:case 36300:case 36308:case 36293:return TM;case 36289:case 36303:case 36311:case 36292:return AM}}var oh=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=lM(t.type)}},lh=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=CM(t.type)}},ch=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],i)}}},ah=/(\w+)(\])?(\[|\.)?/g;function Wp(n,e){n.seq.push(e),n.map[e.id]=e}function RM(n,e,t){let i=n.name,s=i.length;for(ah.lastIndex=0;;){let r=ah.exec(i),o=ah.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){Wp(t,c===void 0?new oh(a,n,e):new lh(a,n,e));break}else{let h=t.map[a];h===void 0&&(h=new ch(a),Wp(t,h)),t=h}}}var mr=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<i;++s){let r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);RM(r,o,this)}}setValue(e,t,i,s){let r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){let s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){let i=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&i.push(o)}return i}};function Xp(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var IM=37297,PM=0;function NM(n,e){let t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}var Yp=new Ke;function LM(n){ct._getMatrix(Yp,ct.workingColorSpace,n);let e=`mat3( ${Yp.elements.map(t=>t.toFixed(4))} )`;switch(ct.getTransfer(n)){case qr:return[e,"LinearTransferOETF"];case mt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function $p(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),s=n.getShaderInfoLog(e).trim();if(i&&s==="")return"";let r=/ERROR: 0:(\d+)/.exec(s);if(r){let o=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+NM(n.getShaderSource(e),o)}else return s}function DM(n,e){let t=LM(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function UM(n,e){let t;switch(e){case lp:t="Linear";break;case cp:t="Reinhard";break;case up:t="Cineon";break;case fl:t="ACESFilmic";break;case dp:t="AgX";break;case fp:t="Neutral";break;case hp:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Jl=new k;function FM(){ct.getLuminanceCoefficients(Jl);let n=Jl.x.toFixed(4),e=Jl.y.toFixed(4),t=Jl.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function kM(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Sa).join(`
`)}function OM(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function BM(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=n.getActiveAttrib(e,s),o=r.name,a=1;r.type===n.FLOAT_MAT2&&(a=2),r.type===n.FLOAT_MAT3&&(a=3),r.type===n.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function Sa(n){return n!==""}function qp(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Kp(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var zM=/^[ \t]*#include +<([\w\d./]+)>/gm;function uh(n){return n.replace(zM,VM)}var HM=new Map;function VM(n,e){let t=je[e];if(t===void 0){let i=HM.get(e);if(i!==void 0)t=je[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return uh(t)}var GM=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Zp(n){return n.replace(GM,WM)}function WM(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Jp(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function XM(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===Ru?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===rl?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===Kn&&(e="SHADOWMAP_TYPE_VSM"),e}function YM(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case _s:case xs:e="ENVMAP_TYPE_CUBE";break;case ma:e="ENVMAP_TYPE_CUBE_UV";break}return e}function $M(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case xs:e="ENVMAP_MODE_REFRACTION";break}return e}function qM(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case Lu:e="ENVMAP_BLENDING_MULTIPLY";break;case ap:e="ENVMAP_BLENDING_MIX";break;case op:e="ENVMAP_BLENDING_ADD";break}return e}function KM(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function ZM(n,e,t,i){let s=n.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,l=XM(t),c=YM(t),u=$M(t),h=qM(t),d=KM(t),f=kM(t),g=OM(r),y=s.createProgram(),m,p,A=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Sa).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Sa).join(`
`),p.length>0&&(p+=`
`)):(m=[Jp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Sa).join(`
`),p=[Jp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==bi?"#define TONE_MAPPING":"",t.toneMapping!==bi?je.tonemapping_pars_fragment:"",t.toneMapping!==bi?UM("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",je.colorspace_pars_fragment,DM("linearToOutputTexel",t.outputColorSpace),FM(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Sa).join(`
`)),o=uh(o),o=qp(o,t),o=Kp(o,t),a=uh(a),a=qp(a,t),a=Kp(a,t),o=Zp(o),a=Zp(a),t.isRawShaderMaterial!==!0&&(A=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===$u?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===$u?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let C=A+m+o,v=A+p+a,M=Xp(s,s.VERTEX_SHADER,C),E=Xp(s,s.FRAGMENT_SHADER,v);s.attachShader(y,M),s.attachShader(y,E),t.index0AttributeName!==void 0?s.bindAttribLocation(y,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(y,0,"position"),s.linkProgram(y);function b(L){if(n.debug.checkShaderErrors){let V=s.getProgramInfoLog(y).trim(),F=s.getShaderInfoLog(M).trim(),I=s.getShaderInfoLog(E).trim(),O=!0,P=!0;if(s.getProgramParameter(y,s.LINK_STATUS)===!1)if(O=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,y,M,E);else{let B=$p(s,M,"vertex"),H=$p(s,E,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(y,s.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+V+`
`+B+`
`+H)}else V!==""?console.warn("THREE.WebGLProgram: Program Info Log:",V):(F===""||I==="")&&(P=!1);P&&(L.diagnostics={runnable:O,programLog:V,vertexShader:{log:F,prefix:m},fragmentShader:{log:I,prefix:p}})}s.deleteShader(M),s.deleteShader(E),R=new mr(s,y),_=BM(s,y)}let R;this.getUniforms=function(){return R===void 0&&b(this),R};let _;this.getAttributes=function(){return _===void 0&&b(this),_};let x=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return x===!1&&(x=s.getProgramParameter(y,IM)),x},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=PM++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=M,this.fragmentShader=E,this}var JM=0,hh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,i=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new dh(e),t.set(e,i)),i}},dh=class{constructor(e){this.id=JM++,this.code=e,this.usedTimes=0}};function QM(n,e,t,i,s,r,o){let a=new Qr,l=new hh,c=new Set,u=[],h=s.logarithmicDepthBuffer,d=s.vertexTextures,f=s.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function y(_){return c.add(_),_===0?"uv":`uv${_}`}function m(_,x,L,V,F){let I=V.fog,O=F.geometry,P=_.isMeshStandardMaterial?V.environment:null,B=(_.isMeshStandardMaterial?t:e).get(_.envMap||P),H=B&&B.mapping===ma?B.image.height:null,ee=g[_.type];_.precision!==null&&(f=s.getMaxPrecision(_.precision),f!==_.precision&&console.warn("THREE.WebGLProgram.getParameters:",_.precision,"not supported, using",f,"instead."));let se=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,he=se!==void 0?se.length:0,Me=0;O.morphAttributes.position!==void 0&&(Me=1),O.morphAttributes.normal!==void 0&&(Me=2),O.morphAttributes.color!==void 0&&(Me=3);let Ne,Z,oe,me;if(ee){let st=jn[ee];Ne=st.vertexShader,Z=st.fragmentShader}else Ne=_.vertexShader,Z=_.fragmentShader,l.update(_),oe=l.getVertexShaderID(_),me=l.getFragmentShaderID(_);let ce=n.getRenderTarget(),Re=n.state.buffers.depth.getReversed(),Le=F.isInstancedMesh===!0,Ye=F.isBatchedMesh===!0,nt=!!_.map,ze=!!_.matcap,dt=!!B,U=!!_.aoMap,Rt=!!_.lightMap,qe=!!_.bumpMap,He=!!_.normalMap,ge=!!_.displacementMap,lt=!!_.emissiveMap,Ee=!!_.metalnessMap,N=!!_.roughnessMap,w=_.anisotropy>0,Y=_.clearcoat>0,ne=_.dispersion>0,re=_.iridescence>0,te=_.sheen>0,Ce=_.transmission>0,fe=w&&!!_.anisotropyMap,J=Y&&!!_.clearcoatMap,de=Y&&!!_.clearcoatNormalMap,j=Y&&!!_.clearcoatRoughnessMap,ae=re&&!!_.iridescenceMap,we=re&&!!_.iridescenceThicknessMap,Ie=te&&!!_.sheenColorMap,pe=te&&!!_.sheenRoughnessMap,$e=!!_.specularMap,We=!!_.specularColorMap,it=!!_.specularIntensityMap,G=Ce&&!!_.transmissionMap,ye=Ce&&!!_.thicknessMap,Q=!!_.gradientMap,ie=!!_.alphaMap,_e=_.alphaTest>0,xe=!!_.alphaHash,Xe=!!_.extensions,ve=bi;_.toneMapped&&(ce===null||ce.isXRRenderTarget===!0)&&(ve=n.toneMapping);let St={shaderID:ee,shaderType:_.type,shaderName:_.name,vertexShader:Ne,fragmentShader:Z,defines:_.defines,customVertexShaderID:oe,customFragmentShaderID:me,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:f,batching:Ye,batchingColor:Ye&&F._colorsTexture!==null,instancing:Le,instancingColor:Le&&F.instanceColor!==null,instancingMorph:Le&&F.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:ce===null?n.outputColorSpace:ce.isXRRenderTarget===!0?ce.texture.colorSpace:ms,alphaToCoverage:!!_.alphaToCoverage,map:nt,matcap:ze,envMap:dt,envMapMode:dt&&B.mapping,envMapCubeUVHeight:H,aoMap:U,lightMap:Rt,bumpMap:qe,normalMap:He,displacementMap:d&&ge,emissiveMap:lt,normalMapObjectSpace:He&&_.normalMapType===yp,normalMapTangentSpace:He&&_.normalMapType===Xu,metalnessMap:Ee,roughnessMap:N,anisotropy:w,anisotropyMap:fe,clearcoat:Y,clearcoatMap:J,clearcoatNormalMap:de,clearcoatRoughnessMap:j,dispersion:ne,iridescence:re,iridescenceMap:ae,iridescenceThicknessMap:we,sheen:te,sheenColorMap:Ie,sheenRoughnessMap:pe,specularMap:$e,specularColorMap:We,specularIntensityMap:it,transmission:Ce,transmissionMap:G,thicknessMap:ye,gradientMap:Q,opaque:_.transparent===!1&&_.blending===hs&&_.alphaToCoverage===!1,alphaMap:ie,alphaTest:_e,alphaHash:xe,combine:_.combine,mapUv:nt&&y(_.map.channel),aoMapUv:U&&y(_.aoMap.channel),lightMapUv:Rt&&y(_.lightMap.channel),bumpMapUv:qe&&y(_.bumpMap.channel),normalMapUv:He&&y(_.normalMap.channel),displacementMapUv:ge&&y(_.displacementMap.channel),emissiveMapUv:lt&&y(_.emissiveMap.channel),metalnessMapUv:Ee&&y(_.metalnessMap.channel),roughnessMapUv:N&&y(_.roughnessMap.channel),anisotropyMapUv:fe&&y(_.anisotropyMap.channel),clearcoatMapUv:J&&y(_.clearcoatMap.channel),clearcoatNormalMapUv:de&&y(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:j&&y(_.clearcoatRoughnessMap.channel),iridescenceMapUv:ae&&y(_.iridescenceMap.channel),iridescenceThicknessMapUv:we&&y(_.iridescenceThicknessMap.channel),sheenColorMapUv:Ie&&y(_.sheenColorMap.channel),sheenRoughnessMapUv:pe&&y(_.sheenRoughnessMap.channel),specularMapUv:$e&&y(_.specularMap.channel),specularColorMapUv:We&&y(_.specularColorMap.channel),specularIntensityMapUv:it&&y(_.specularIntensityMap.channel),transmissionMapUv:G&&y(_.transmissionMap.channel),thicknessMapUv:ye&&y(_.thicknessMap.channel),alphaMapUv:ie&&y(_.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(He||w),vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:F.isPoints===!0&&!!O.attributes.uv&&(nt||ie),fog:!!I,useFog:_.fog===!0,fogExp2:!!I&&I.isFogExp2,flatShading:_.flatShading===!0,sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:h,reverseDepthBuffer:Re,skinning:F.isSkinnedMesh===!0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:he,morphTextureStride:Me,numDirLights:x.directional.length,numPointLights:x.point.length,numSpotLights:x.spot.length,numSpotLightMaps:x.spotLightMap.length,numRectAreaLights:x.rectArea.length,numHemiLights:x.hemi.length,numDirLightShadows:x.directionalShadowMap.length,numPointLightShadows:x.pointShadowMap.length,numSpotLightShadows:x.spotShadowMap.length,numSpotLightShadowsWithMaps:x.numSpotLightShadowsWithMaps,numLightProbes:x.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:_.dithering,shadowMapEnabled:n.shadowMap.enabled&&L.length>0,shadowMapType:n.shadowMap.type,toneMapping:ve,decodeVideoTexture:nt&&_.map.isVideoTexture===!0&&ct.getTransfer(_.map.colorSpace)===mt,decodeVideoTextureEmissive:lt&&_.emissiveMap.isVideoTexture===!0&&ct.getTransfer(_.emissiveMap.colorSpace)===mt,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Zn,flipSided:_.side===Wt,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:Xe&&_.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Xe&&_.extensions.multiDraw===!0||Ye)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return St.vertexUv1s=c.has(1),St.vertexUv2s=c.has(2),St.vertexUv3s=c.has(3),c.clear(),St}function p(_){let x=[];if(_.shaderID?x.push(_.shaderID):(x.push(_.customVertexShaderID),x.push(_.customFragmentShaderID)),_.defines!==void 0)for(let L in _.defines)x.push(L),x.push(_.defines[L]);return _.isRawShaderMaterial===!1&&(A(x,_),C(x,_),x.push(n.outputColorSpace)),x.push(_.customProgramCacheKey),x.join()}function A(_,x){_.push(x.precision),_.push(x.outputColorSpace),_.push(x.envMapMode),_.push(x.envMapCubeUVHeight),_.push(x.mapUv),_.push(x.alphaMapUv),_.push(x.lightMapUv),_.push(x.aoMapUv),_.push(x.bumpMapUv),_.push(x.normalMapUv),_.push(x.displacementMapUv),_.push(x.emissiveMapUv),_.push(x.metalnessMapUv),_.push(x.roughnessMapUv),_.push(x.anisotropyMapUv),_.push(x.clearcoatMapUv),_.push(x.clearcoatNormalMapUv),_.push(x.clearcoatRoughnessMapUv),_.push(x.iridescenceMapUv),_.push(x.iridescenceThicknessMapUv),_.push(x.sheenColorMapUv),_.push(x.sheenRoughnessMapUv),_.push(x.specularMapUv),_.push(x.specularColorMapUv),_.push(x.specularIntensityMapUv),_.push(x.transmissionMapUv),_.push(x.thicknessMapUv),_.push(x.combine),_.push(x.fogExp2),_.push(x.sizeAttenuation),_.push(x.morphTargetsCount),_.push(x.morphAttributeCount),_.push(x.numDirLights),_.push(x.numPointLights),_.push(x.numSpotLights),_.push(x.numSpotLightMaps),_.push(x.numHemiLights),_.push(x.numRectAreaLights),_.push(x.numDirLightShadows),_.push(x.numPointLightShadows),_.push(x.numSpotLightShadows),_.push(x.numSpotLightShadowsWithMaps),_.push(x.numLightProbes),_.push(x.shadowMapType),_.push(x.toneMapping),_.push(x.numClippingPlanes),_.push(x.numClipIntersection),_.push(x.depthPacking)}function C(_,x){a.disableAll(),x.supportsVertexTextures&&a.enable(0),x.instancing&&a.enable(1),x.instancingColor&&a.enable(2),x.instancingMorph&&a.enable(3),x.matcap&&a.enable(4),x.envMap&&a.enable(5),x.normalMapObjectSpace&&a.enable(6),x.normalMapTangentSpace&&a.enable(7),x.clearcoat&&a.enable(8),x.iridescence&&a.enable(9),x.alphaTest&&a.enable(10),x.vertexColors&&a.enable(11),x.vertexAlphas&&a.enable(12),x.vertexUv1s&&a.enable(13),x.vertexUv2s&&a.enable(14),x.vertexUv3s&&a.enable(15),x.vertexTangents&&a.enable(16),x.anisotropy&&a.enable(17),x.alphaHash&&a.enable(18),x.batching&&a.enable(19),x.dispersion&&a.enable(20),x.batchingColor&&a.enable(21),_.push(a.mask),a.disableAll(),x.fog&&a.enable(0),x.useFog&&a.enable(1),x.flatShading&&a.enable(2),x.logarithmicDepthBuffer&&a.enable(3),x.reverseDepthBuffer&&a.enable(4),x.skinning&&a.enable(5),x.morphTargets&&a.enable(6),x.morphNormals&&a.enable(7),x.morphColors&&a.enable(8),x.premultipliedAlpha&&a.enable(9),x.shadowMapEnabled&&a.enable(10),x.doubleSided&&a.enable(11),x.flipSided&&a.enable(12),x.useDepthPacking&&a.enable(13),x.dithering&&a.enable(14),x.transmission&&a.enable(15),x.sheen&&a.enable(16),x.opaque&&a.enable(17),x.pointsUvs&&a.enable(18),x.decodeVideoTexture&&a.enable(19),x.decodeVideoTextureEmissive&&a.enable(20),x.alphaToCoverage&&a.enable(21),_.push(a.mask)}function v(_){let x=g[_.type],L;if(x){let V=jn[x];L=Ip.clone(V.uniforms)}else L=_.uniforms;return L}function M(_,x){let L;for(let V=0,F=u.length;V<F;V++){let I=u[V];if(I.cacheKey===x){L=I,++L.usedTimes;break}}return L===void 0&&(L=new ZM(n,x,_,r),u.push(L)),L}function E(_){if(--_.usedTimes===0){let x=u.indexOf(_);u[x]=u[u.length-1],u.pop(),_.destroy()}}function b(_){l.remove(_)}function R(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:v,acquireProgram:M,releaseProgram:E,releaseShaderCache:b,programs:u,dispose:R}}function jM(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function s(o,a,l){n.get(o)[a]=l}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function ew(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function Qp(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function jp(){let n=[],e=0,t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function o(h,d,f,g,y,m){let p=n[e];return p===void 0?(p={id:h.id,object:h,geometry:d,material:f,groupOrder:g,renderOrder:h.renderOrder,z:y,group:m},n[e]=p):(p.id=h.id,p.object=h,p.geometry=d,p.material=f,p.groupOrder=g,p.renderOrder=h.renderOrder,p.z=y,p.group=m),e++,p}function a(h,d,f,g,y,m){let p=o(h,d,f,g,y,m);f.transmission>0?i.push(p):f.transparent===!0?s.push(p):t.push(p)}function l(h,d,f,g,y,m){let p=o(h,d,f,g,y,m);f.transmission>0?i.unshift(p):f.transparent===!0?s.unshift(p):t.unshift(p)}function c(h,d){t.length>1&&t.sort(h||ew),i.length>1&&i.sort(d||Qp),s.length>1&&s.sort(d||Qp)}function u(){for(let h=e,d=n.length;h<d;h++){let f=n[h];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:a,unshift:l,finish:u,sort:c}}function tw(){let n=new WeakMap;function e(i,s){let r=n.get(i),o;return r===void 0?(o=new jp,n.set(i,[o])):s>=r.length?(o=new jp,r.push(o)):o=r[s],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function nw(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new k,color:new Ze};break;case"SpotLight":t={position:new k,direction:new k,color:new Ze,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new k,color:new Ze,distance:0,decay:0};break;case"HemisphereLight":t={direction:new k,skyColor:new Ze,groundColor:new Ze};break;case"RectAreaLight":t={color:new Ze,position:new k,halfWidth:new k,halfHeight:new k};break}return n[e.id]=t,t}}}function iw(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Pe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Pe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Pe,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var sw=0;function rw(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function aw(n){let e=new nw,t=iw(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new k);let s=new k,r=new Et,o=new Et;function a(c){let u=0,h=0,d=0;for(let _=0;_<9;_++)i.probe[_].set(0,0,0);let f=0,g=0,y=0,m=0,p=0,A=0,C=0,v=0,M=0,E=0,b=0;c.sort(rw);for(let _=0,x=c.length;_<x;_++){let L=c[_],V=L.color,F=L.intensity,I=L.distance,O=L.shadow&&L.shadow.map?L.shadow.map.texture:null;if(L.isAmbientLight)u+=V.r*F,h+=V.g*F,d+=V.b*F;else if(L.isLightProbe){for(let P=0;P<9;P++)i.probe[P].addScaledVector(L.sh.coefficients[P],F);b++}else if(L.isDirectionalLight){let P=e.get(L);if(P.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let B=L.shadow,H=t.get(L);H.shadowIntensity=B.intensity,H.shadowBias=B.bias,H.shadowNormalBias=B.normalBias,H.shadowRadius=B.radius,H.shadowMapSize=B.mapSize,i.directionalShadow[f]=H,i.directionalShadowMap[f]=O,i.directionalShadowMatrix[f]=L.shadow.matrix,A++}i.directional[f]=P,f++}else if(L.isSpotLight){let P=e.get(L);P.position.setFromMatrixPosition(L.matrixWorld),P.color.copy(V).multiplyScalar(F),P.distance=I,P.coneCos=Math.cos(L.angle),P.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),P.decay=L.decay,i.spot[y]=P;let B=L.shadow;if(L.map&&(i.spotLightMap[M]=L.map,M++,B.updateMatrices(L),L.castShadow&&E++),i.spotLightMatrix[y]=B.matrix,L.castShadow){let H=t.get(L);H.shadowIntensity=B.intensity,H.shadowBias=B.bias,H.shadowNormalBias=B.normalBias,H.shadowRadius=B.radius,H.shadowMapSize=B.mapSize,i.spotShadow[y]=H,i.spotShadowMap[y]=O,v++}y++}else if(L.isRectAreaLight){let P=e.get(L);P.color.copy(V).multiplyScalar(F),P.halfWidth.set(L.width*.5,0,0),P.halfHeight.set(0,L.height*.5,0),i.rectArea[m]=P,m++}else if(L.isPointLight){let P=e.get(L);if(P.color.copy(L.color).multiplyScalar(L.intensity),P.distance=L.distance,P.decay=L.decay,L.castShadow){let B=L.shadow,H=t.get(L);H.shadowIntensity=B.intensity,H.shadowBias=B.bias,H.shadowNormalBias=B.normalBias,H.shadowRadius=B.radius,H.shadowMapSize=B.mapSize,H.shadowCameraNear=B.camera.near,H.shadowCameraFar=B.camera.far,i.pointShadow[g]=H,i.pointShadowMap[g]=O,i.pointShadowMatrix[g]=L.shadow.matrix,C++}i.point[g]=P,g++}else if(L.isHemisphereLight){let P=e.get(L);P.skyColor.copy(L.color).multiplyScalar(F),P.groundColor.copy(L.groundColor).multiplyScalar(F),i.hemi[p]=P,p++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Se.LTC_FLOAT_1,i.rectAreaLTC2=Se.LTC_FLOAT_2):(i.rectAreaLTC1=Se.LTC_HALF_1,i.rectAreaLTC2=Se.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=h,i.ambient[2]=d;let R=i.hash;(R.directionalLength!==f||R.pointLength!==g||R.spotLength!==y||R.rectAreaLength!==m||R.hemiLength!==p||R.numDirectionalShadows!==A||R.numPointShadows!==C||R.numSpotShadows!==v||R.numSpotMaps!==M||R.numLightProbes!==b)&&(i.directional.length=f,i.spot.length=y,i.rectArea.length=m,i.point.length=g,i.hemi.length=p,i.directionalShadow.length=A,i.directionalShadowMap.length=A,i.pointShadow.length=C,i.pointShadowMap.length=C,i.spotShadow.length=v,i.spotShadowMap.length=v,i.directionalShadowMatrix.length=A,i.pointShadowMatrix.length=C,i.spotLightMatrix.length=v+M-E,i.spotLightMap.length=M,i.numSpotLightShadowsWithMaps=E,i.numLightProbes=b,R.directionalLength=f,R.pointLength=g,R.spotLength=y,R.rectAreaLength=m,R.hemiLength=p,R.numDirectionalShadows=A,R.numPointShadows=C,R.numSpotShadows=v,R.numSpotMaps=M,R.numLightProbes=b,i.version=sw++)}function l(c,u){let h=0,d=0,f=0,g=0,y=0,m=u.matrixWorldInverse;for(let p=0,A=c.length;p<A;p++){let C=c[p];if(C.isDirectionalLight){let v=i.directional[h];v.direction.setFromMatrixPosition(C.matrixWorld),s.setFromMatrixPosition(C.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(m),h++}else if(C.isSpotLight){let v=i.spot[f];v.position.setFromMatrixPosition(C.matrixWorld),v.position.applyMatrix4(m),v.direction.setFromMatrixPosition(C.matrixWorld),s.setFromMatrixPosition(C.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(m),f++}else if(C.isRectAreaLight){let v=i.rectArea[g];v.position.setFromMatrixPosition(C.matrixWorld),v.position.applyMatrix4(m),o.identity(),r.copy(C.matrixWorld),r.premultiply(m),o.extractRotation(r),v.halfWidth.set(C.width*.5,0,0),v.halfHeight.set(0,C.height*.5,0),v.halfWidth.applyMatrix4(o),v.halfHeight.applyMatrix4(o),g++}else if(C.isPointLight){let v=i.point[d];v.position.setFromMatrixPosition(C.matrixWorld),v.position.applyMatrix4(m),d++}else if(C.isHemisphereLight){let v=i.hemi[y];v.direction.setFromMatrixPosition(C.matrixWorld),v.direction.transformDirection(m),y++}}}return{setup:a,setupView:l,state:i}}function em(n){let e=new aw(n),t=[],i=[];function s(u){c.camera=u,t.length=0,i.length=0}function r(u){t.push(u)}function o(u){i.push(u)}function a(){e.setup(t)}function l(u){e.setupView(t,u)}let c={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function ow(n){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new em(n),e.set(s,[a])):r>=o.length?(a=new em(n),o.push(a)):a=o[r],a}function i(){e=new WeakMap}return{get:t,dispose:i}}var lw=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,cw=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function uw(n,e,t){let i=new ir,s=new Pe,r=new Pe,o=new pt,a=new Yo({depthPacking:gp}),l=new $o,c={},u=t.maxTextureSize,h={[gi]:Wt,[Wt]:gi,[Zn]:Zn},d=new Un({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Pe},radius:{value:4}},vertexShader:lw,fragmentShader:cw}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let g=new gn;g.setAttribute("position",new mn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new Be(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ru;let p=this.type;this.render=function(E,b,R){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||E.length===0)return;let _=n.getRenderTarget(),x=n.getActiveCubeFace(),L=n.getActiveMipmapLevel(),V=n.state;V.setBlending(xi),V.buffers.color.setClear(1,1,1,1),V.buffers.depth.setTest(!0),V.setScissorTest(!1);let F=p!==Kn&&this.type===Kn,I=p===Kn&&this.type!==Kn;for(let O=0,P=E.length;O<P;O++){let B=E[O],H=B.shadow;if(H===void 0){console.warn("THREE.WebGLShadowMap:",B,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;s.copy(H.mapSize);let ee=H.getFrameExtents();if(s.multiply(ee),r.copy(H.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/ee.x),s.x=r.x*ee.x,H.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/ee.y),s.y=r.y*ee.y,H.mapSize.y=r.y)),H.map===null||F===!0||I===!0){let he=this.type!==Kn?{minFilter:bn,magFilter:bn}:{};H.map!==null&&H.map.dispose(),H.map=new $n(s.x,s.y,he),H.map.texture.name=B.name+".shadowMap",H.camera.updateProjectionMatrix()}n.setRenderTarget(H.map),n.clear();let se=H.getViewportCount();for(let he=0;he<se;he++){let Me=H.getViewport(he);o.set(r.x*Me.x,r.y*Me.y,r.x*Me.z,r.y*Me.w),V.viewport(o),H.updateMatrices(B,he),i=H.getFrustum(),v(b,R,H.camera,B,this.type)}H.isPointLightShadow!==!0&&this.type===Kn&&A(H,R),H.needsUpdate=!1}p=this.type,m.needsUpdate=!1,n.setRenderTarget(_,x,L)};function A(E,b){let R=e.update(y);d.defines.VSM_SAMPLES!==E.blurSamples&&(d.defines.VSM_SAMPLES=E.blurSamples,f.defines.VSM_SAMPLES=E.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new $n(s.x,s.y)),d.uniforms.shadow_pass.value=E.map.texture,d.uniforms.resolution.value=E.mapSize,d.uniforms.radius.value=E.radius,n.setRenderTarget(E.mapPass),n.clear(),n.renderBufferDirect(b,null,R,d,y,null),f.uniforms.shadow_pass.value=E.mapPass.texture,f.uniforms.resolution.value=E.mapSize,f.uniforms.radius.value=E.radius,n.setRenderTarget(E.map),n.clear(),n.renderBufferDirect(b,null,R,f,y,null)}function C(E,b,R,_){let x=null,L=R.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(L!==void 0)x=L;else if(x=R.isPointLight===!0?l:a,n.localClippingEnabled&&b.clipShadows===!0&&Array.isArray(b.clippingPlanes)&&b.clippingPlanes.length!==0||b.displacementMap&&b.displacementScale!==0||b.alphaMap&&b.alphaTest>0||b.map&&b.alphaTest>0){let V=x.uuid,F=b.uuid,I=c[V];I===void 0&&(I={},c[V]=I);let O=I[F];O===void 0&&(O=x.clone(),I[F]=O,b.addEventListener("dispose",M)),x=O}if(x.visible=b.visible,x.wireframe=b.wireframe,_===Kn?x.side=b.shadowSide!==null?b.shadowSide:b.side:x.side=b.shadowSide!==null?b.shadowSide:h[b.side],x.alphaMap=b.alphaMap,x.alphaTest=b.alphaTest,x.map=b.map,x.clipShadows=b.clipShadows,x.clippingPlanes=b.clippingPlanes,x.clipIntersection=b.clipIntersection,x.displacementMap=b.displacementMap,x.displacementScale=b.displacementScale,x.displacementBias=b.displacementBias,x.wireframeLinewidth=b.wireframeLinewidth,x.linewidth=b.linewidth,R.isPointLight===!0&&x.isMeshDistanceMaterial===!0){let V=n.properties.get(x);V.light=R}return x}function v(E,b,R,_,x){if(E.visible===!1)return;if(E.layers.test(b.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&x===Kn)&&(!E.frustumCulled||i.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(R.matrixWorldInverse,E.matrixWorld);let F=e.update(E),I=E.material;if(Array.isArray(I)){let O=F.groups;for(let P=0,B=O.length;P<B;P++){let H=O[P],ee=I[H.materialIndex];if(ee&&ee.visible){let se=C(E,ee,_,x);E.onBeforeShadow(n,E,b,R,F,se,H),n.renderBufferDirect(R,null,F,se,E,H),E.onAfterShadow(n,E,b,R,F,se,H)}}}else if(I.visible){let O=C(E,I,_,x);E.onBeforeShadow(n,E,b,R,F,O,null),n.renderBufferDirect(R,null,F,O,E,null),E.onAfterShadow(n,E,b,R,F,O,null)}}let V=E.children;for(let F=0,I=V.length;F<I;F++)v(V[F],b,R,_,x)}function M(E){E.target.removeEventListener("dispose",M);for(let R in c){let _=c[R],x=E.target.uuid;x in _&&(_[x].dispose(),delete _[x])}}}var hw={[al]:ol,[ll]:hl,[cl]:dl,[ds]:ul,[ol]:al,[hl]:ll,[dl]:cl,[ul]:ds};function dw(n,e){function t(){let G=!1,ye=new pt,Q=null,ie=new pt(0,0,0,0);return{setMask:function(_e){Q!==_e&&!G&&(n.colorMask(_e,_e,_e,_e),Q=_e)},setLocked:function(_e){G=_e},setClear:function(_e,xe,Xe,ve,St){St===!0&&(_e*=ve,xe*=ve,Xe*=ve),ye.set(_e,xe,Xe,ve),ie.equals(ye)===!1&&(n.clearColor(_e,xe,Xe,ve),ie.copy(ye))},reset:function(){G=!1,Q=null,ie.set(-1,0,0,0)}}}function i(){let G=!1,ye=!1,Q=null,ie=null,_e=null;return{setReversed:function(xe){if(ye!==xe){let Xe=e.get("EXT_clip_control");ye?Xe.clipControlEXT(Xe.LOWER_LEFT_EXT,Xe.ZERO_TO_ONE_EXT):Xe.clipControlEXT(Xe.LOWER_LEFT_EXT,Xe.NEGATIVE_ONE_TO_ONE_EXT);let ve=_e;_e=null,this.setClear(ve)}ye=xe},getReversed:function(){return ye},setTest:function(xe){xe?ce(n.DEPTH_TEST):Re(n.DEPTH_TEST)},setMask:function(xe){Q!==xe&&!G&&(n.depthMask(xe),Q=xe)},setFunc:function(xe){if(ye&&(xe=hw[xe]),ie!==xe){switch(xe){case al:n.depthFunc(n.NEVER);break;case ol:n.depthFunc(n.ALWAYS);break;case ll:n.depthFunc(n.LESS);break;case ds:n.depthFunc(n.LEQUAL);break;case cl:n.depthFunc(n.EQUAL);break;case ul:n.depthFunc(n.GEQUAL);break;case hl:n.depthFunc(n.GREATER);break;case dl:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}ie=xe}},setLocked:function(xe){G=xe},setClear:function(xe){_e!==xe&&(ye&&(xe=1-xe),n.clearDepth(xe),_e=xe)},reset:function(){G=!1,Q=null,ie=null,_e=null,ye=!1}}}function s(){let G=!1,ye=null,Q=null,ie=null,_e=null,xe=null,Xe=null,ve=null,St=null;return{setTest:function(st){G||(st?ce(n.STENCIL_TEST):Re(n.STENCIL_TEST))},setMask:function(st){ye!==st&&!G&&(n.stencilMask(st),ye=st)},setFunc:function(st,It,Bt){(Q!==st||ie!==It||_e!==Bt)&&(n.stencilFunc(st,It,Bt),Q=st,ie=It,_e=Bt)},setOp:function(st,It,Bt){(xe!==st||Xe!==It||ve!==Bt)&&(n.stencilOp(st,It,Bt),xe=st,Xe=It,ve=Bt)},setLocked:function(st){G=st},setClear:function(st){St!==st&&(n.clearStencil(st),St=st)},reset:function(){G=!1,ye=null,Q=null,ie=null,_e=null,xe=null,Xe=null,ve=null,St=null}}}let r=new t,o=new i,a=new s,l=new WeakMap,c=new WeakMap,u={},h={},d=new WeakMap,f=[],g=null,y=!1,m=null,p=null,A=null,C=null,v=null,M=null,E=null,b=new Ze(0,0,0),R=0,_=!1,x=null,L=null,V=null,F=null,I=null,O=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),P=!1,B=0,H=n.getParameter(n.VERSION);H.indexOf("WebGL")!==-1?(B=parseFloat(/^WebGL (\d)/.exec(H)[1]),P=B>=1):H.indexOf("OpenGL ES")!==-1&&(B=parseFloat(/^OpenGL ES (\d)/.exec(H)[1]),P=B>=2);let ee=null,se={},he=n.getParameter(n.SCISSOR_BOX),Me=n.getParameter(n.VIEWPORT),Ne=new pt().fromArray(he),Z=new pt().fromArray(Me);function oe(G,ye,Q,ie){let _e=new Uint8Array(4),xe=n.createTexture();n.bindTexture(G,xe),n.texParameteri(G,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(G,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Xe=0;Xe<Q;Xe++)G===n.TEXTURE_3D||G===n.TEXTURE_2D_ARRAY?n.texImage3D(ye,0,n.RGBA,1,1,ie,0,n.RGBA,n.UNSIGNED_BYTE,_e):n.texImage2D(ye+Xe,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,_e);return xe}let me={};me[n.TEXTURE_2D]=oe(n.TEXTURE_2D,n.TEXTURE_2D,1),me[n.TEXTURE_CUBE_MAP]=oe(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),me[n.TEXTURE_2D_ARRAY]=oe(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),me[n.TEXTURE_3D]=oe(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ce(n.DEPTH_TEST),o.setFunc(ds),qe(!1),He(Cu),ce(n.CULL_FACE),U(xi);function ce(G){u[G]!==!0&&(n.enable(G),u[G]=!0)}function Re(G){u[G]!==!1&&(n.disable(G),u[G]=!1)}function Le(G,ye){return h[G]!==ye?(n.bindFramebuffer(G,ye),h[G]=ye,G===n.DRAW_FRAMEBUFFER&&(h[n.FRAMEBUFFER]=ye),G===n.FRAMEBUFFER&&(h[n.DRAW_FRAMEBUFFER]=ye),!0):!1}function Ye(G,ye){let Q=f,ie=!1;if(G){Q=d.get(ye),Q===void 0&&(Q=[],d.set(ye,Q));let _e=G.textures;if(Q.length!==_e.length||Q[0]!==n.COLOR_ATTACHMENT0){for(let xe=0,Xe=_e.length;xe<Xe;xe++)Q[xe]=n.COLOR_ATTACHMENT0+xe;Q.length=_e.length,ie=!0}}else Q[0]!==n.BACK&&(Q[0]=n.BACK,ie=!0);ie&&n.drawBuffers(Q)}function nt(G){return g!==G?(n.useProgram(G),g=G,!0):!1}let ze={[ki]:n.FUNC_ADD,[Gf]:n.FUNC_SUBTRACT,[Wf]:n.FUNC_REVERSE_SUBTRACT};ze[Xf]=n.MIN,ze[Yf]=n.MAX;let dt={[$f]:n.ZERO,[qf]:n.ONE,[Kf]:n.SRC_COLOR,[Co]:n.SRC_ALPHA,[tp]:n.SRC_ALPHA_SATURATE,[jf]:n.DST_COLOR,[Jf]:n.DST_ALPHA,[Zf]:n.ONE_MINUS_SRC_COLOR,[Ro]:n.ONE_MINUS_SRC_ALPHA,[ep]:n.ONE_MINUS_DST_COLOR,[Qf]:n.ONE_MINUS_DST_ALPHA,[np]:n.CONSTANT_COLOR,[ip]:n.ONE_MINUS_CONSTANT_COLOR,[sp]:n.CONSTANT_ALPHA,[rp]:n.ONE_MINUS_CONSTANT_ALPHA};function U(G,ye,Q,ie,_e,xe,Xe,ve,St,st){if(G===xi){y===!0&&(Re(n.BLEND),y=!1);return}if(y===!1&&(ce(n.BLEND),y=!0),G!==Vf){if(G!==m||st!==_){if((p!==ki||v!==ki)&&(n.blendEquation(n.FUNC_ADD),p=ki,v=ki),st)switch(G){case hs:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Iu:n.blendFunc(n.ONE,n.ONE);break;case Pu:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Nu:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",G);break}else switch(G){case hs:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Iu:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case Pu:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Nu:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",G);break}A=null,C=null,M=null,E=null,b.set(0,0,0),R=0,m=G,_=st}return}_e=_e||ye,xe=xe||Q,Xe=Xe||ie,(ye!==p||_e!==v)&&(n.blendEquationSeparate(ze[ye],ze[_e]),p=ye,v=_e),(Q!==A||ie!==C||xe!==M||Xe!==E)&&(n.blendFuncSeparate(dt[Q],dt[ie],dt[xe],dt[Xe]),A=Q,C=ie,M=xe,E=Xe),(ve.equals(b)===!1||St!==R)&&(n.blendColor(ve.r,ve.g,ve.b,St),b.copy(ve),R=St),m=G,_=!1}function Rt(G,ye){G.side===Zn?Re(n.CULL_FACE):ce(n.CULL_FACE);let Q=G.side===Wt;ye&&(Q=!Q),qe(Q),G.blending===hs&&G.transparent===!1?U(xi):U(G.blending,G.blendEquation,G.blendSrc,G.blendDst,G.blendEquationAlpha,G.blendSrcAlpha,G.blendDstAlpha,G.blendColor,G.blendAlpha,G.premultipliedAlpha),o.setFunc(G.depthFunc),o.setTest(G.depthTest),o.setMask(G.depthWrite),r.setMask(G.colorWrite);let ie=G.stencilWrite;a.setTest(ie),ie&&(a.setMask(G.stencilWriteMask),a.setFunc(G.stencilFunc,G.stencilRef,G.stencilFuncMask),a.setOp(G.stencilFail,G.stencilZFail,G.stencilZPass)),lt(G.polygonOffset,G.polygonOffsetFactor,G.polygonOffsetUnits),G.alphaToCoverage===!0?ce(n.SAMPLE_ALPHA_TO_COVERAGE):Re(n.SAMPLE_ALPHA_TO_COVERAGE)}function qe(G){x!==G&&(G?n.frontFace(n.CW):n.frontFace(n.CCW),x=G)}function He(G){G!==zf?(ce(n.CULL_FACE),G!==L&&(G===Cu?n.cullFace(n.BACK):G===Hf?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Re(n.CULL_FACE),L=G}function ge(G){G!==V&&(P&&n.lineWidth(G),V=G)}function lt(G,ye,Q){G?(ce(n.POLYGON_OFFSET_FILL),(F!==ye||I!==Q)&&(n.polygonOffset(ye,Q),F=ye,I=Q)):Re(n.POLYGON_OFFSET_FILL)}function Ee(G){G?ce(n.SCISSOR_TEST):Re(n.SCISSOR_TEST)}function N(G){G===void 0&&(G=n.TEXTURE0+O-1),ee!==G&&(n.activeTexture(G),ee=G)}function w(G,ye,Q){Q===void 0&&(ee===null?Q=n.TEXTURE0+O-1:Q=ee);let ie=se[Q];ie===void 0&&(ie={type:void 0,texture:void 0},se[Q]=ie),(ie.type!==G||ie.texture!==ye)&&(ee!==Q&&(n.activeTexture(Q),ee=Q),n.bindTexture(G,ye||me[G]),ie.type=G,ie.texture=ye)}function Y(){let G=se[ee];G!==void 0&&G.type!==void 0&&(n.bindTexture(G.type,null),G.type=void 0,G.texture=void 0)}function ne(){try{n.compressedTexImage2D.apply(n,arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function re(){try{n.compressedTexImage3D.apply(n,arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function te(){try{n.texSubImage2D.apply(n,arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function Ce(){try{n.texSubImage3D.apply(n,arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function fe(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function J(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function de(){try{n.texStorage2D.apply(n,arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function j(){try{n.texStorage3D.apply(n,arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function ae(){try{n.texImage2D.apply(n,arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function we(){try{n.texImage3D.apply(n,arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function Ie(G){Ne.equals(G)===!1&&(n.scissor(G.x,G.y,G.z,G.w),Ne.copy(G))}function pe(G){Z.equals(G)===!1&&(n.viewport(G.x,G.y,G.z,G.w),Z.copy(G))}function $e(G,ye){let Q=c.get(ye);Q===void 0&&(Q=new WeakMap,c.set(ye,Q));let ie=Q.get(G);ie===void 0&&(ie=n.getUniformBlockIndex(ye,G.name),Q.set(G,ie))}function We(G,ye){let ie=c.get(ye).get(G);l.get(ye)!==ie&&(n.uniformBlockBinding(ye,ie,G.__bindingPointIndex),l.set(ye,ie))}function it(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),u={},ee=null,se={},h={},d=new WeakMap,f=[],g=null,y=!1,m=null,p=null,A=null,C=null,v=null,M=null,E=null,b=new Ze(0,0,0),R=0,_=!1,x=null,L=null,V=null,F=null,I=null,Ne.set(0,0,n.canvas.width,n.canvas.height),Z.set(0,0,n.canvas.width,n.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:ce,disable:Re,bindFramebuffer:Le,drawBuffers:Ye,useProgram:nt,setBlending:U,setMaterial:Rt,setFlipSided:qe,setCullFace:He,setLineWidth:ge,setPolygonOffset:lt,setScissorTest:Ee,activeTexture:N,bindTexture:w,unbindTexture:Y,compressedTexImage2D:ne,compressedTexImage3D:re,texImage2D:ae,texImage3D:we,updateUBOMapping:$e,uniformBlockBinding:We,texStorage2D:de,texStorage3D:j,texSubImage2D:te,texSubImage3D:Ce,compressedTexSubImage2D:fe,compressedTexSubImage3D:J,scissor:Ie,viewport:pe,reset:it}}function fw(n,e,t,i,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Pe,u=new WeakMap,h,d=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(N,w){return f?new OffscreenCanvas(N,w):tr("canvas")}function y(N,w,Y){let ne=1,re=Ee(N);if((re.width>Y||re.height>Y)&&(ne=Y/Math.max(re.width,re.height)),ne<1)if(typeof HTMLImageElement<"u"&&N instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&N instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&N instanceof ImageBitmap||typeof VideoFrame<"u"&&N instanceof VideoFrame){let te=Math.floor(ne*re.width),Ce=Math.floor(ne*re.height);h===void 0&&(h=g(te,Ce));let fe=w?g(te,Ce):h;return fe.width=te,fe.height=Ce,fe.getContext("2d").drawImage(N,0,0,te,Ce),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+re.width+"x"+re.height+") to ("+te+"x"+Ce+")."),fe}else return"data"in N&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+re.width+"x"+re.height+")."),N;return N}function m(N){return N.generateMipmaps}function p(N){n.generateMipmap(N)}function A(N){return N.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:N.isWebGL3DRenderTarget?n.TEXTURE_3D:N.isWebGLArrayRenderTarget||N.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function C(N,w,Y,ne,re=!1){if(N!==null){if(n[N]!==void 0)return n[N];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+N+"'")}let te=w;if(w===n.RED&&(Y===n.FLOAT&&(te=n.R32F),Y===n.HALF_FLOAT&&(te=n.R16F),Y===n.UNSIGNED_BYTE&&(te=n.R8)),w===n.RED_INTEGER&&(Y===n.UNSIGNED_BYTE&&(te=n.R8UI),Y===n.UNSIGNED_SHORT&&(te=n.R16UI),Y===n.UNSIGNED_INT&&(te=n.R32UI),Y===n.BYTE&&(te=n.R8I),Y===n.SHORT&&(te=n.R16I),Y===n.INT&&(te=n.R32I)),w===n.RG&&(Y===n.FLOAT&&(te=n.RG32F),Y===n.HALF_FLOAT&&(te=n.RG16F),Y===n.UNSIGNED_BYTE&&(te=n.RG8)),w===n.RG_INTEGER&&(Y===n.UNSIGNED_BYTE&&(te=n.RG8UI),Y===n.UNSIGNED_SHORT&&(te=n.RG16UI),Y===n.UNSIGNED_INT&&(te=n.RG32UI),Y===n.BYTE&&(te=n.RG8I),Y===n.SHORT&&(te=n.RG16I),Y===n.INT&&(te=n.RG32I)),w===n.RGB_INTEGER&&(Y===n.UNSIGNED_BYTE&&(te=n.RGB8UI),Y===n.UNSIGNED_SHORT&&(te=n.RGB16UI),Y===n.UNSIGNED_INT&&(te=n.RGB32UI),Y===n.BYTE&&(te=n.RGB8I),Y===n.SHORT&&(te=n.RGB16I),Y===n.INT&&(te=n.RGB32I)),w===n.RGBA_INTEGER&&(Y===n.UNSIGNED_BYTE&&(te=n.RGBA8UI),Y===n.UNSIGNED_SHORT&&(te=n.RGBA16UI),Y===n.UNSIGNED_INT&&(te=n.RGBA32UI),Y===n.BYTE&&(te=n.RGBA8I),Y===n.SHORT&&(te=n.RGBA16I),Y===n.INT&&(te=n.RGBA32I)),w===n.RGB&&Y===n.UNSIGNED_INT_5_9_9_9_REV&&(te=n.RGB9_E5),w===n.RGBA){let Ce=re?qr:ct.getTransfer(ne);Y===n.FLOAT&&(te=n.RGBA32F),Y===n.HALF_FLOAT&&(te=n.RGBA16F),Y===n.UNSIGNED_BYTE&&(te=Ce===mt?n.SRGB8_ALPHA8:n.RGBA8),Y===n.UNSIGNED_SHORT_4_4_4_4&&(te=n.RGBA4),Y===n.UNSIGNED_SHORT_5_5_5_1&&(te=n.RGB5_A1)}return(te===n.R16F||te===n.R32F||te===n.RG16F||te===n.RG32F||te===n.RGBA16F||te===n.RGBA32F)&&e.get("EXT_color_buffer_float"),te}function v(N,w){let Y;return N?w===null||w===Yi||w===bs?Y=n.DEPTH24_STENCIL8:w===Qn?Y=n.DEPTH32F_STENCIL8:w===ur&&(Y=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):w===null||w===Yi||w===bs?Y=n.DEPTH_COMPONENT24:w===Qn?Y=n.DEPTH_COMPONENT32F:w===ur&&(Y=n.DEPTH_COMPONENT16),Y}function M(N,w){return m(N)===!0||N.isFramebufferTexture&&N.minFilter!==bn&&N.minFilter!==Ln?Math.log2(Math.max(w.width,w.height))+1:N.mipmaps!==void 0&&N.mipmaps.length>0?N.mipmaps.length:N.isCompressedTexture&&Array.isArray(N.image)?w.mipmaps.length:1}function E(N){let w=N.target;w.removeEventListener("dispose",E),R(w),w.isVideoTexture&&u.delete(w)}function b(N){let w=N.target;w.removeEventListener("dispose",b),x(w)}function R(N){let w=i.get(N);if(w.__webglInit===void 0)return;let Y=N.source,ne=d.get(Y);if(ne){let re=ne[w.__cacheKey];re.usedTimes--,re.usedTimes===0&&_(N),Object.keys(ne).length===0&&d.delete(Y)}i.remove(N)}function _(N){let w=i.get(N);n.deleteTexture(w.__webglTexture);let Y=N.source,ne=d.get(Y);delete ne[w.__cacheKey],o.memory.textures--}function x(N){let w=i.get(N);if(N.depthTexture&&(N.depthTexture.dispose(),i.remove(N.depthTexture)),N.isWebGLCubeRenderTarget)for(let ne=0;ne<6;ne++){if(Array.isArray(w.__webglFramebuffer[ne]))for(let re=0;re<w.__webglFramebuffer[ne].length;re++)n.deleteFramebuffer(w.__webglFramebuffer[ne][re]);else n.deleteFramebuffer(w.__webglFramebuffer[ne]);w.__webglDepthbuffer&&n.deleteRenderbuffer(w.__webglDepthbuffer[ne])}else{if(Array.isArray(w.__webglFramebuffer))for(let ne=0;ne<w.__webglFramebuffer.length;ne++)n.deleteFramebuffer(w.__webglFramebuffer[ne]);else n.deleteFramebuffer(w.__webglFramebuffer);if(w.__webglDepthbuffer&&n.deleteRenderbuffer(w.__webglDepthbuffer),w.__webglMultisampledFramebuffer&&n.deleteFramebuffer(w.__webglMultisampledFramebuffer),w.__webglColorRenderbuffer)for(let ne=0;ne<w.__webglColorRenderbuffer.length;ne++)w.__webglColorRenderbuffer[ne]&&n.deleteRenderbuffer(w.__webglColorRenderbuffer[ne]);w.__webglDepthRenderbuffer&&n.deleteRenderbuffer(w.__webglDepthRenderbuffer)}let Y=N.textures;for(let ne=0,re=Y.length;ne<re;ne++){let te=i.get(Y[ne]);te.__webglTexture&&(n.deleteTexture(te.__webglTexture),o.memory.textures--),i.remove(Y[ne])}i.remove(N)}let L=0;function V(){L=0}function F(){let N=L;return N>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+N+" texture units while this GPU supports only "+s.maxTextures),L+=1,N}function I(N){let w=[];return w.push(N.wrapS),w.push(N.wrapT),w.push(N.wrapR||0),w.push(N.magFilter),w.push(N.minFilter),w.push(N.anisotropy),w.push(N.internalFormat),w.push(N.format),w.push(N.type),w.push(N.generateMipmaps),w.push(N.premultiplyAlpha),w.push(N.flipY),w.push(N.unpackAlignment),w.push(N.colorSpace),w.join()}function O(N,w){let Y=i.get(N);if(N.isVideoTexture&&ge(N),N.isRenderTargetTexture===!1&&N.version>0&&Y.__version!==N.version){let ne=N.image;if(ne===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(ne.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Z(Y,N,w);return}}t.bindTexture(n.TEXTURE_2D,Y.__webglTexture,n.TEXTURE0+w)}function P(N,w){let Y=i.get(N);if(N.version>0&&Y.__version!==N.version){Z(Y,N,w);return}t.bindTexture(n.TEXTURE_2D_ARRAY,Y.__webglTexture,n.TEXTURE0+w)}function B(N,w){let Y=i.get(N);if(N.version>0&&Y.__version!==N.version){Z(Y,N,w);return}t.bindTexture(n.TEXTURE_3D,Y.__webglTexture,n.TEXTURE0+w)}function H(N,w){let Y=i.get(N);if(N.version>0&&Y.__version!==N.version){oe(Y,N,w);return}t.bindTexture(n.TEXTURE_CUBE_MAP,Y.__webglTexture,n.TEXTURE0+w)}let ee={[fs]:n.REPEAT,[Fi]:n.CLAMP_TO_EDGE,[Io]:n.MIRRORED_REPEAT},se={[bn]:n.NEAREST,[pp]:n.NEAREST_MIPMAP_NEAREST,[ga]:n.NEAREST_MIPMAP_LINEAR,[Ln]:n.LINEAR,[gl]:n.LINEAR_MIPMAP_NEAREST,[Xi]:n.LINEAR_MIPMAP_LINEAR},he={[vp]:n.NEVER,[wp]:n.ALWAYS,[_p]:n.LESS,[Yu]:n.LEQUAL,[xp]:n.EQUAL,[Mp]:n.GEQUAL,[bp]:n.GREATER,[Sp]:n.NOTEQUAL};function Me(N,w){if(w.type===Qn&&e.has("OES_texture_float_linear")===!1&&(w.magFilter===Ln||w.magFilter===gl||w.magFilter===ga||w.magFilter===Xi||w.minFilter===Ln||w.minFilter===gl||w.minFilter===ga||w.minFilter===Xi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(N,n.TEXTURE_WRAP_S,ee[w.wrapS]),n.texParameteri(N,n.TEXTURE_WRAP_T,ee[w.wrapT]),(N===n.TEXTURE_3D||N===n.TEXTURE_2D_ARRAY)&&n.texParameteri(N,n.TEXTURE_WRAP_R,ee[w.wrapR]),n.texParameteri(N,n.TEXTURE_MAG_FILTER,se[w.magFilter]),n.texParameteri(N,n.TEXTURE_MIN_FILTER,se[w.minFilter]),w.compareFunction&&(n.texParameteri(N,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(N,n.TEXTURE_COMPARE_FUNC,he[w.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(w.magFilter===bn||w.minFilter!==ga&&w.minFilter!==Xi||w.type===Qn&&e.has("OES_texture_float_linear")===!1)return;if(w.anisotropy>1||i.get(w).__currentAnisotropy){let Y=e.get("EXT_texture_filter_anisotropic");n.texParameterf(N,Y.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(w.anisotropy,s.getMaxAnisotropy())),i.get(w).__currentAnisotropy=w.anisotropy}}}function Ne(N,w){let Y=!1;N.__webglInit===void 0&&(N.__webglInit=!0,w.addEventListener("dispose",E));let ne=w.source,re=d.get(ne);re===void 0&&(re={},d.set(ne,re));let te=I(w);if(te!==N.__cacheKey){re[te]===void 0&&(re[te]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,Y=!0),re[te].usedTimes++;let Ce=re[N.__cacheKey];Ce!==void 0&&(re[N.__cacheKey].usedTimes--,Ce.usedTimes===0&&_(w)),N.__cacheKey=te,N.__webglTexture=re[te].texture}return Y}function Z(N,w,Y){let ne=n.TEXTURE_2D;(w.isDataArrayTexture||w.isCompressedArrayTexture)&&(ne=n.TEXTURE_2D_ARRAY),w.isData3DTexture&&(ne=n.TEXTURE_3D);let re=Ne(N,w),te=w.source;t.bindTexture(ne,N.__webglTexture,n.TEXTURE0+Y);let Ce=i.get(te);if(te.version!==Ce.__version||re===!0){t.activeTexture(n.TEXTURE0+Y);let fe=ct.getPrimaries(ct.workingColorSpace),J=w.colorSpace===Si?null:ct.getPrimaries(w.colorSpace),de=w.colorSpace===Si||fe===J?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,w.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,w.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,de);let j=y(w.image,!1,s.maxTextureSize);j=lt(w,j);let ae=r.convert(w.format,w.colorSpace),we=r.convert(w.type),Ie=C(w.internalFormat,ae,we,w.colorSpace,w.isVideoTexture);Me(ne,w);let pe,$e=w.mipmaps,We=w.isVideoTexture!==!0,it=Ce.__version===void 0||re===!0,G=te.dataReady,ye=M(w,j);if(w.isDepthTexture)Ie=v(w.format===ps,w.type),it&&(We?t.texStorage2D(n.TEXTURE_2D,1,Ie,j.width,j.height):t.texImage2D(n.TEXTURE_2D,0,Ie,j.width,j.height,0,ae,we,null));else if(w.isDataTexture)if($e.length>0){We&&it&&t.texStorage2D(n.TEXTURE_2D,ye,Ie,$e[0].width,$e[0].height);for(let Q=0,ie=$e.length;Q<ie;Q++)pe=$e[Q],We?G&&t.texSubImage2D(n.TEXTURE_2D,Q,0,0,pe.width,pe.height,ae,we,pe.data):t.texImage2D(n.TEXTURE_2D,Q,Ie,pe.width,pe.height,0,ae,we,pe.data);w.generateMipmaps=!1}else We?(it&&t.texStorage2D(n.TEXTURE_2D,ye,Ie,j.width,j.height),G&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,j.width,j.height,ae,we,j.data)):t.texImage2D(n.TEXTURE_2D,0,Ie,j.width,j.height,0,ae,we,j.data);else if(w.isCompressedTexture)if(w.isCompressedArrayTexture){We&&it&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ye,Ie,$e[0].width,$e[0].height,j.depth);for(let Q=0,ie=$e.length;Q<ie;Q++)if(pe=$e[Q],w.format!==wn)if(ae!==null)if(We){if(G)if(w.layerUpdates.size>0){let _e=eh(pe.width,pe.height,w.format,w.type);for(let xe of w.layerUpdates){let Xe=pe.data.subarray(xe*_e/pe.data.BYTES_PER_ELEMENT,(xe+1)*_e/pe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Q,0,0,xe,pe.width,pe.height,1,ae,Xe)}w.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Q,0,0,0,pe.width,pe.height,j.depth,ae,pe.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,Q,Ie,pe.width,pe.height,j.depth,0,pe.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else We?G&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,Q,0,0,0,pe.width,pe.height,j.depth,ae,we,pe.data):t.texImage3D(n.TEXTURE_2D_ARRAY,Q,Ie,pe.width,pe.height,j.depth,0,ae,we,pe.data)}else{We&&it&&t.texStorage2D(n.TEXTURE_2D,ye,Ie,$e[0].width,$e[0].height);for(let Q=0,ie=$e.length;Q<ie;Q++)pe=$e[Q],w.format!==wn?ae!==null?We?G&&t.compressedTexSubImage2D(n.TEXTURE_2D,Q,0,0,pe.width,pe.height,ae,pe.data):t.compressedTexImage2D(n.TEXTURE_2D,Q,Ie,pe.width,pe.height,0,pe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):We?G&&t.texSubImage2D(n.TEXTURE_2D,Q,0,0,pe.width,pe.height,ae,we,pe.data):t.texImage2D(n.TEXTURE_2D,Q,Ie,pe.width,pe.height,0,ae,we,pe.data)}else if(w.isDataArrayTexture)if(We){if(it&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ye,Ie,j.width,j.height,j.depth),G)if(w.layerUpdates.size>0){let Q=eh(j.width,j.height,w.format,w.type);for(let ie of w.layerUpdates){let _e=j.data.subarray(ie*Q/j.data.BYTES_PER_ELEMENT,(ie+1)*Q/j.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,ie,j.width,j.height,1,ae,we,_e)}w.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,j.width,j.height,j.depth,ae,we,j.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,Ie,j.width,j.height,j.depth,0,ae,we,j.data);else if(w.isData3DTexture)We?(it&&t.texStorage3D(n.TEXTURE_3D,ye,Ie,j.width,j.height,j.depth),G&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,j.width,j.height,j.depth,ae,we,j.data)):t.texImage3D(n.TEXTURE_3D,0,Ie,j.width,j.height,j.depth,0,ae,we,j.data);else if(w.isFramebufferTexture){if(it)if(We)t.texStorage2D(n.TEXTURE_2D,ye,Ie,j.width,j.height);else{let Q=j.width,ie=j.height;for(let _e=0;_e<ye;_e++)t.texImage2D(n.TEXTURE_2D,_e,Ie,Q,ie,0,ae,we,null),Q>>=1,ie>>=1}}else if($e.length>0){if(We&&it){let Q=Ee($e[0]);t.texStorage2D(n.TEXTURE_2D,ye,Ie,Q.width,Q.height)}for(let Q=0,ie=$e.length;Q<ie;Q++)pe=$e[Q],We?G&&t.texSubImage2D(n.TEXTURE_2D,Q,0,0,ae,we,pe):t.texImage2D(n.TEXTURE_2D,Q,Ie,ae,we,pe);w.generateMipmaps=!1}else if(We){if(it){let Q=Ee(j);t.texStorage2D(n.TEXTURE_2D,ye,Ie,Q.width,Q.height)}G&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,ae,we,j)}else t.texImage2D(n.TEXTURE_2D,0,Ie,ae,we,j);m(w)&&p(ne),Ce.__version=te.version,w.onUpdate&&w.onUpdate(w)}N.__version=w.version}function oe(N,w,Y){if(w.image.length!==6)return;let ne=Ne(N,w),re=w.source;t.bindTexture(n.TEXTURE_CUBE_MAP,N.__webglTexture,n.TEXTURE0+Y);let te=i.get(re);if(re.version!==te.__version||ne===!0){t.activeTexture(n.TEXTURE0+Y);let Ce=ct.getPrimaries(ct.workingColorSpace),fe=w.colorSpace===Si?null:ct.getPrimaries(w.colorSpace),J=w.colorSpace===Si||Ce===fe?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,w.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,w.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,J);let de=w.isCompressedTexture||w.image[0].isCompressedTexture,j=w.image[0]&&w.image[0].isDataTexture,ae=[];for(let ie=0;ie<6;ie++)!de&&!j?ae[ie]=y(w.image[ie],!0,s.maxCubemapSize):ae[ie]=j?w.image[ie].image:w.image[ie],ae[ie]=lt(w,ae[ie]);let we=ae[0],Ie=r.convert(w.format,w.colorSpace),pe=r.convert(w.type),$e=C(w.internalFormat,Ie,pe,w.colorSpace),We=w.isVideoTexture!==!0,it=te.__version===void 0||ne===!0,G=re.dataReady,ye=M(w,we);Me(n.TEXTURE_CUBE_MAP,w);let Q;if(de){We&&it&&t.texStorage2D(n.TEXTURE_CUBE_MAP,ye,$e,we.width,we.height);for(let ie=0;ie<6;ie++){Q=ae[ie].mipmaps;for(let _e=0;_e<Q.length;_e++){let xe=Q[_e];w.format!==wn?Ie!==null?We?G&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,_e,0,0,xe.width,xe.height,Ie,xe.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,_e,$e,xe.width,xe.height,0,xe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):We?G&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,_e,0,0,xe.width,xe.height,Ie,pe,xe.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,_e,$e,xe.width,xe.height,0,Ie,pe,xe.data)}}}else{if(Q=w.mipmaps,We&&it){Q.length>0&&ye++;let ie=Ee(ae[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,ye,$e,ie.width,ie.height)}for(let ie=0;ie<6;ie++)if(j){We?G&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,ae[ie].width,ae[ie].height,Ie,pe,ae[ie].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,$e,ae[ie].width,ae[ie].height,0,Ie,pe,ae[ie].data);for(let _e=0;_e<Q.length;_e++){let Xe=Q[_e].image[ie].image;We?G&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,_e+1,0,0,Xe.width,Xe.height,Ie,pe,Xe.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,_e+1,$e,Xe.width,Xe.height,0,Ie,pe,Xe.data)}}else{We?G&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,Ie,pe,ae[ie]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,$e,Ie,pe,ae[ie]);for(let _e=0;_e<Q.length;_e++){let xe=Q[_e];We?G&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,_e+1,0,0,Ie,pe,xe.image[ie]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,_e+1,$e,Ie,pe,xe.image[ie])}}}m(w)&&p(n.TEXTURE_CUBE_MAP),te.__version=re.version,w.onUpdate&&w.onUpdate(w)}N.__version=w.version}function me(N,w,Y,ne,re,te){let Ce=r.convert(Y.format,Y.colorSpace),fe=r.convert(Y.type),J=C(Y.internalFormat,Ce,fe,Y.colorSpace),de=i.get(w),j=i.get(Y);if(j.__renderTarget=w,!de.__hasExternalTextures){let ae=Math.max(1,w.width>>te),we=Math.max(1,w.height>>te);re===n.TEXTURE_3D||re===n.TEXTURE_2D_ARRAY?t.texImage3D(re,te,J,ae,we,w.depth,0,Ce,fe,null):t.texImage2D(re,te,J,ae,we,0,Ce,fe,null)}t.bindFramebuffer(n.FRAMEBUFFER,N),He(w)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ne,re,j.__webglTexture,0,qe(w)):(re===n.TEXTURE_2D||re>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&re<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,ne,re,j.__webglTexture,te),t.bindFramebuffer(n.FRAMEBUFFER,null)}function ce(N,w,Y){if(n.bindRenderbuffer(n.RENDERBUFFER,N),w.depthBuffer){let ne=w.depthTexture,re=ne&&ne.isDepthTexture?ne.type:null,te=v(w.stencilBuffer,re),Ce=w.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,fe=qe(w);He(w)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,fe,te,w.width,w.height):Y?n.renderbufferStorageMultisample(n.RENDERBUFFER,fe,te,w.width,w.height):n.renderbufferStorage(n.RENDERBUFFER,te,w.width,w.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,Ce,n.RENDERBUFFER,N)}else{let ne=w.textures;for(let re=0;re<ne.length;re++){let te=ne[re],Ce=r.convert(te.format,te.colorSpace),fe=r.convert(te.type),J=C(te.internalFormat,Ce,fe,te.colorSpace),de=qe(w);Y&&He(w)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,de,J,w.width,w.height):He(w)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,de,J,w.width,w.height):n.renderbufferStorage(n.RENDERBUFFER,J,w.width,w.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Re(N,w){if(w&&w.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,N),!(w.depthTexture&&w.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let ne=i.get(w.depthTexture);ne.__renderTarget=w,(!ne.__webglTexture||w.depthTexture.image.width!==w.width||w.depthTexture.image.height!==w.height)&&(w.depthTexture.image.width=w.width,w.depthTexture.image.height=w.height,w.depthTexture.needsUpdate=!0),O(w.depthTexture,0);let re=ne.__webglTexture,te=qe(w);if(w.depthTexture.format===us)He(w)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,re,0,te):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,re,0);else if(w.depthTexture.format===ps)He(w)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,re,0,te):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,re,0);else throw new Error("Unknown depthTexture format")}function Le(N){let w=i.get(N),Y=N.isWebGLCubeRenderTarget===!0;if(w.__boundDepthTexture!==N.depthTexture){let ne=N.depthTexture;if(w.__depthDisposeCallback&&w.__depthDisposeCallback(),ne){let re=()=>{delete w.__boundDepthTexture,delete w.__depthDisposeCallback,ne.removeEventListener("dispose",re)};ne.addEventListener("dispose",re),w.__depthDisposeCallback=re}w.__boundDepthTexture=ne}if(N.depthTexture&&!w.__autoAllocateDepthBuffer){if(Y)throw new Error("target.depthTexture not supported in Cube render targets");Re(w.__webglFramebuffer,N)}else if(Y){w.__webglDepthbuffer=[];for(let ne=0;ne<6;ne++)if(t.bindFramebuffer(n.FRAMEBUFFER,w.__webglFramebuffer[ne]),w.__webglDepthbuffer[ne]===void 0)w.__webglDepthbuffer[ne]=n.createRenderbuffer(),ce(w.__webglDepthbuffer[ne],N,!1);else{let re=N.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,te=w.__webglDepthbuffer[ne];n.bindRenderbuffer(n.RENDERBUFFER,te),n.framebufferRenderbuffer(n.FRAMEBUFFER,re,n.RENDERBUFFER,te)}}else if(t.bindFramebuffer(n.FRAMEBUFFER,w.__webglFramebuffer),w.__webglDepthbuffer===void 0)w.__webglDepthbuffer=n.createRenderbuffer(),ce(w.__webglDepthbuffer,N,!1);else{let ne=N.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,re=w.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,re),n.framebufferRenderbuffer(n.FRAMEBUFFER,ne,n.RENDERBUFFER,re)}t.bindFramebuffer(n.FRAMEBUFFER,null)}function Ye(N,w,Y){let ne=i.get(N);w!==void 0&&me(ne.__webglFramebuffer,N,N.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),Y!==void 0&&Le(N)}function nt(N){let w=N.texture,Y=i.get(N),ne=i.get(w);N.addEventListener("dispose",b);let re=N.textures,te=N.isWebGLCubeRenderTarget===!0,Ce=re.length>1;if(Ce||(ne.__webglTexture===void 0&&(ne.__webglTexture=n.createTexture()),ne.__version=w.version,o.memory.textures++),te){Y.__webglFramebuffer=[];for(let fe=0;fe<6;fe++)if(w.mipmaps&&w.mipmaps.length>0){Y.__webglFramebuffer[fe]=[];for(let J=0;J<w.mipmaps.length;J++)Y.__webglFramebuffer[fe][J]=n.createFramebuffer()}else Y.__webglFramebuffer[fe]=n.createFramebuffer()}else{if(w.mipmaps&&w.mipmaps.length>0){Y.__webglFramebuffer=[];for(let fe=0;fe<w.mipmaps.length;fe++)Y.__webglFramebuffer[fe]=n.createFramebuffer()}else Y.__webglFramebuffer=n.createFramebuffer();if(Ce)for(let fe=0,J=re.length;fe<J;fe++){let de=i.get(re[fe]);de.__webglTexture===void 0&&(de.__webglTexture=n.createTexture(),o.memory.textures++)}if(N.samples>0&&He(N)===!1){Y.__webglMultisampledFramebuffer=n.createFramebuffer(),Y.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,Y.__webglMultisampledFramebuffer);for(let fe=0;fe<re.length;fe++){let J=re[fe];Y.__webglColorRenderbuffer[fe]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,Y.__webglColorRenderbuffer[fe]);let de=r.convert(J.format,J.colorSpace),j=r.convert(J.type),ae=C(J.internalFormat,de,j,J.colorSpace,N.isXRRenderTarget===!0),we=qe(N);n.renderbufferStorageMultisample(n.RENDERBUFFER,we,ae,N.width,N.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+fe,n.RENDERBUFFER,Y.__webglColorRenderbuffer[fe])}n.bindRenderbuffer(n.RENDERBUFFER,null),N.depthBuffer&&(Y.__webglDepthRenderbuffer=n.createRenderbuffer(),ce(Y.__webglDepthRenderbuffer,N,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(te){t.bindTexture(n.TEXTURE_CUBE_MAP,ne.__webglTexture),Me(n.TEXTURE_CUBE_MAP,w);for(let fe=0;fe<6;fe++)if(w.mipmaps&&w.mipmaps.length>0)for(let J=0;J<w.mipmaps.length;J++)me(Y.__webglFramebuffer[fe][J],N,w,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,J);else me(Y.__webglFramebuffer[fe],N,w,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0);m(w)&&p(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ce){for(let fe=0,J=re.length;fe<J;fe++){let de=re[fe],j=i.get(de);t.bindTexture(n.TEXTURE_2D,j.__webglTexture),Me(n.TEXTURE_2D,de),me(Y.__webglFramebuffer,N,de,n.COLOR_ATTACHMENT0+fe,n.TEXTURE_2D,0),m(de)&&p(n.TEXTURE_2D)}t.unbindTexture()}else{let fe=n.TEXTURE_2D;if((N.isWebGL3DRenderTarget||N.isWebGLArrayRenderTarget)&&(fe=N.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(fe,ne.__webglTexture),Me(fe,w),w.mipmaps&&w.mipmaps.length>0)for(let J=0;J<w.mipmaps.length;J++)me(Y.__webglFramebuffer[J],N,w,n.COLOR_ATTACHMENT0,fe,J);else me(Y.__webglFramebuffer,N,w,n.COLOR_ATTACHMENT0,fe,0);m(w)&&p(fe),t.unbindTexture()}N.depthBuffer&&Le(N)}function ze(N){let w=N.textures;for(let Y=0,ne=w.length;Y<ne;Y++){let re=w[Y];if(m(re)){let te=A(N),Ce=i.get(re).__webglTexture;t.bindTexture(te,Ce),p(te),t.unbindTexture()}}}let dt=[],U=[];function Rt(N){if(N.samples>0){if(He(N)===!1){let w=N.textures,Y=N.width,ne=N.height,re=n.COLOR_BUFFER_BIT,te=N.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Ce=i.get(N),fe=w.length>1;if(fe)for(let J=0;J<w.length;J++)t.bindFramebuffer(n.FRAMEBUFFER,Ce.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+J,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,Ce.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+J,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,Ce.__webglMultisampledFramebuffer),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ce.__webglFramebuffer);for(let J=0;J<w.length;J++){if(N.resolveDepthBuffer&&(N.depthBuffer&&(re|=n.DEPTH_BUFFER_BIT),N.stencilBuffer&&N.resolveStencilBuffer&&(re|=n.STENCIL_BUFFER_BIT)),fe){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,Ce.__webglColorRenderbuffer[J]);let de=i.get(w[J]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,de,0)}n.blitFramebuffer(0,0,Y,ne,0,0,Y,ne,re,n.NEAREST),l===!0&&(dt.length=0,U.length=0,dt.push(n.COLOR_ATTACHMENT0+J),N.depthBuffer&&N.resolveDepthBuffer===!1&&(dt.push(te),U.push(te),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,U)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,dt))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),fe)for(let J=0;J<w.length;J++){t.bindFramebuffer(n.FRAMEBUFFER,Ce.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+J,n.RENDERBUFFER,Ce.__webglColorRenderbuffer[J]);let de=i.get(w[J]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,Ce.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+J,n.TEXTURE_2D,de,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ce.__webglMultisampledFramebuffer)}else if(N.depthBuffer&&N.resolveDepthBuffer===!1&&l){let w=N.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[w])}}}function qe(N){return Math.min(s.maxSamples,N.samples)}function He(N){let w=i.get(N);return N.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&w.__useRenderToTexture!==!1}function ge(N){let w=o.render.frame;u.get(N)!==w&&(u.set(N,w),N.update())}function lt(N,w){let Y=N.colorSpace,ne=N.format,re=N.type;return N.isCompressedTexture===!0||N.isVideoTexture===!0||Y!==ms&&Y!==Si&&(ct.getTransfer(Y)===mt?(ne!==wn||re!==Jn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",Y)),w}function Ee(N){return typeof HTMLImageElement<"u"&&N instanceof HTMLImageElement?(c.width=N.naturalWidth||N.width,c.height=N.naturalHeight||N.height):typeof VideoFrame<"u"&&N instanceof VideoFrame?(c.width=N.displayWidth,c.height=N.displayHeight):(c.width=N.width,c.height=N.height),c}this.allocateTextureUnit=F,this.resetTextureUnits=V,this.setTexture2D=O,this.setTexture2DArray=P,this.setTexture3D=B,this.setTextureCube=H,this.rebindTextures=Ye,this.setupRenderTarget=nt,this.updateRenderTargetMipmap=ze,this.updateMultisampleRenderTarget=Rt,this.setupDepthRenderbuffer=Le,this.setupFrameBufferTexture=me,this.useMultisampledRTT=He}function pw(n,e){function t(i,s=Si){let r,o=ct.getTransfer(s);if(i===Jn)return n.UNSIGNED_BYTE;if(i===vl)return n.UNSIGNED_SHORT_4_4_4_4;if(i===_l)return n.UNSIGNED_SHORT_5_5_5_1;if(i===ku)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===Uu)return n.BYTE;if(i===Fu)return n.SHORT;if(i===ur)return n.UNSIGNED_SHORT;if(i===yl)return n.INT;if(i===Yi)return n.UNSIGNED_INT;if(i===Qn)return n.FLOAT;if(i===hr)return n.HALF_FLOAT;if(i===Ou)return n.ALPHA;if(i===Bu)return n.RGB;if(i===wn)return n.RGBA;if(i===zu)return n.LUMINANCE;if(i===Hu)return n.LUMINANCE_ALPHA;if(i===us)return n.DEPTH_COMPONENT;if(i===ps)return n.DEPTH_STENCIL;if(i===Vu)return n.RED;if(i===xl)return n.RED_INTEGER;if(i===Gu)return n.RG;if(i===bl)return n.RG_INTEGER;if(i===Sl)return n.RGBA_INTEGER;if(i===ya||i===va||i===_a||i===xa)if(o===mt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===ya)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===va)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===_a)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===xa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===ya)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===va)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===_a)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===xa)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Ml||i===wl||i===El||i===Tl)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Ml)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===wl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===El)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Tl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Al||i===Cl||i===Rl)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Al||i===Cl)return o===mt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Rl)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===Il||i===Pl||i===Nl||i===Ll||i===Dl||i===Ul||i===Fl||i===kl||i===Ol||i===Bl||i===zl||i===Hl||i===Vl||i===Gl)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Il)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Pl)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Nl)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Ll)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Dl)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Ul)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Fl)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===kl)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Ol)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Bl)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===zl)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Hl)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Vl)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Gl)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===ba||i===Wl||i===Xl)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===ba)return o===mt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Wl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Xl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Wu||i===Yl||i===$l||i===ql)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===ba)return r.COMPRESSED_RED_RGTC1_EXT;if(i===Yl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===$l)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===ql)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===bs?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}var mw={type:"move"},Ma=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new rn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new rn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new k,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new k),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new rn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new k,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new k),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let y of e.hand.values()){let m=t.getJointPose(y,i),p=this._getHandJoint(c,y);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(mw)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new rn;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},gw=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,yw=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,fh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,i){if(this.texture===null){let s=new sn,r=e.properties.get(s);r.__webglTexture=t.texture,(t.depthNear!==i.depthNear||t.depthFar!==i.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new Un({vertexShader:gw,fragmentShader:yw,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Be(new ys(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ph=class extends yi{constructor(e,t){super();let i=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,d=null,f=null,g=null,y=new fh,m=t.getContextAttributes(),p=null,A=null,C=[],v=[],M=new Pe,E=null,b=new Gt;b.viewport=new pt;let R=new Gt;R.viewport=new pt;let _=[b,R],x=new sl,L=null,V=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let oe=C[Z];return oe===void 0&&(oe=new Ma,C[Z]=oe),oe.getTargetRaySpace()},this.getControllerGrip=function(Z){let oe=C[Z];return oe===void 0&&(oe=new Ma,C[Z]=oe),oe.getGripSpace()},this.getHand=function(Z){let oe=C[Z];return oe===void 0&&(oe=new Ma,C[Z]=oe),oe.getHandSpace()};function F(Z){let oe=v.indexOf(Z.inputSource);if(oe===-1)return;let me=C[oe];me!==void 0&&(me.update(Z.inputSource,Z.frame,c||o),me.dispatchEvent({type:Z.type,data:Z.inputSource}))}function I(){s.removeEventListener("select",F),s.removeEventListener("selectstart",F),s.removeEventListener("selectend",F),s.removeEventListener("squeeze",F),s.removeEventListener("squeezestart",F),s.removeEventListener("squeezeend",F),s.removeEventListener("end",I),s.removeEventListener("inputsourceschange",O);for(let Z=0;Z<C.length;Z++){let oe=v[Z];oe!==null&&(v[Z]=null,C[Z].disconnect(oe))}L=null,V=null,y.reset(),e.setRenderTarget(p),f=null,d=null,h=null,s=null,A=null,Ne.stop(),i.isPresenting=!1,e.setPixelRatio(E),e.setSize(M.width,M.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){r=Z,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){a=Z,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(Z){c=Z},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Z){if(s=Z,s!==null){if(p=e.getRenderTarget(),s.addEventListener("select",F),s.addEventListener("selectstart",F),s.addEventListener("selectend",F),s.addEventListener("squeeze",F),s.addEventListener("squeezestart",F),s.addEventListener("squeezeend",F),s.addEventListener("end",I),s.addEventListener("inputsourceschange",O),m.xrCompatible!==!0&&await t.makeXRCompatible(),E=e.getPixelRatio(),e.getSize(M),s.enabledFeatures!==void 0&&s.enabledFeatures.includes("layers")){let me=null,ce=null,Re=null;m.depth&&(Re=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,me=m.stencil?ps:us,ce=m.stencil?bs:Yi);let Le={colorFormat:t.RGBA8,depthFormat:Re,scaleFactor:r};h=new XRWebGLBinding(s,t),d=h.createProjectionLayer(Le),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),A=new $n(d.textureWidth,d.textureHeight,{format:wn,type:Jn,depthTexture:new sa(d.textureWidth,d.textureHeight,ce,void 0,void 0,void 0,void 0,void 0,void 0,me),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}else{let me={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,me),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),A=new $n(f.framebufferWidth,f.framebufferHeight,{format:wn,type:Jn,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}A.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),Ne.setContext(s),Ne.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return y.getDepthTexture()};function O(Z){for(let oe=0;oe<Z.removed.length;oe++){let me=Z.removed[oe],ce=v.indexOf(me);ce>=0&&(v[ce]=null,C[ce].disconnect(me))}for(let oe=0;oe<Z.added.length;oe++){let me=Z.added[oe],ce=v.indexOf(me);if(ce===-1){for(let Le=0;Le<C.length;Le++)if(Le>=v.length){v.push(me),ce=Le;break}else if(v[Le]===null){v[Le]=me,ce=Le;break}if(ce===-1)break}let Re=C[ce];Re&&Re.connect(me)}}let P=new k,B=new k;function H(Z,oe,me){P.setFromMatrixPosition(oe.matrixWorld),B.setFromMatrixPosition(me.matrixWorld);let ce=P.distanceTo(B),Re=oe.projectionMatrix.elements,Le=me.projectionMatrix.elements,Ye=Re[14]/(Re[10]-1),nt=Re[14]/(Re[10]+1),ze=(Re[9]+1)/Re[5],dt=(Re[9]-1)/Re[5],U=(Re[8]-1)/Re[0],Rt=(Le[8]+1)/Le[0],qe=Ye*U,He=Ye*Rt,ge=ce/(-U+Rt),lt=ge*-U;if(oe.matrixWorld.decompose(Z.position,Z.quaternion,Z.scale),Z.translateX(lt),Z.translateZ(ge),Z.matrixWorld.compose(Z.position,Z.quaternion,Z.scale),Z.matrixWorldInverse.copy(Z.matrixWorld).invert(),Re[10]===-1)Z.projectionMatrix.copy(oe.projectionMatrix),Z.projectionMatrixInverse.copy(oe.projectionMatrixInverse);else{let Ee=Ye+ge,N=nt+ge,w=qe-lt,Y=He+(ce-lt),ne=ze*nt/N*Ee,re=dt*nt/N*Ee;Z.projectionMatrix.makePerspective(w,Y,ne,re,Ee,N),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert()}}function ee(Z,oe){oe===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(oe.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(s===null)return;let oe=Z.near,me=Z.far;y.texture!==null&&(y.depthNear>0&&(oe=y.depthNear),y.depthFar>0&&(me=y.depthFar)),x.near=R.near=b.near=oe,x.far=R.far=b.far=me,(L!==x.near||V!==x.far)&&(s.updateRenderState({depthNear:x.near,depthFar:x.far}),L=x.near,V=x.far),b.layers.mask=Z.layers.mask|2,R.layers.mask=Z.layers.mask|4,x.layers.mask=b.layers.mask|R.layers.mask;let ce=Z.parent,Re=x.cameras;ee(x,ce);for(let Le=0;Le<Re.length;Le++)ee(Re[Le],ce);Re.length===2?H(x,b,R):x.projectionMatrix.copy(b.projectionMatrix),se(Z,x,ce)};function se(Z,oe,me){me===null?Z.matrix.copy(oe.matrixWorld):(Z.matrix.copy(me.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(oe.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(oe.projectionMatrix),Z.projectionMatrixInverse.copy(oe.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=er*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return x},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(Z){l=Z,d!==null&&(d.fixedFoveation=Z),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=Z)},this.hasDepthSensing=function(){return y.texture!==null},this.getDepthSensingMesh=function(){return y.getMesh(x)};let he=null;function Me(Z,oe){if(u=oe.getViewerPose(c||o),g=oe,u!==null){let me=u.views;f!==null&&(e.setRenderTargetFramebuffer(A,f.framebuffer),e.setRenderTarget(A));let ce=!1;me.length!==x.cameras.length&&(x.cameras.length=0,ce=!0);for(let Le=0;Le<me.length;Le++){let Ye=me[Le],nt=null;if(f!==null)nt=f.getViewport(Ye);else{let dt=h.getViewSubImage(d,Ye);nt=dt.viewport,Le===0&&(e.setRenderTargetTextures(A,dt.colorTexture,d.ignoreDepthValues?void 0:dt.depthStencilTexture),e.setRenderTarget(A))}let ze=_[Le];ze===void 0&&(ze=new Gt,ze.layers.enable(Le),ze.viewport=new pt,_[Le]=ze),ze.matrix.fromArray(Ye.transform.matrix),ze.matrix.decompose(ze.position,ze.quaternion,ze.scale),ze.projectionMatrix.fromArray(Ye.projectionMatrix),ze.projectionMatrixInverse.copy(ze.projectionMatrix).invert(),ze.viewport.set(nt.x,nt.y,nt.width,nt.height),Le===0&&(x.matrix.copy(ze.matrix),x.matrix.decompose(x.position,x.quaternion,x.scale)),ce===!0&&x.cameras.push(ze)}let Re=s.enabledFeatures;if(Re&&Re.includes("depth-sensing")){let Le=h.getDepthInformation(me[0]);Le&&Le.isValid&&Le.texture&&y.init(e,Le,s.renderState)}}for(let me=0;me<C.length;me++){let ce=v[me],Re=C[me];ce!==null&&Re!==void 0&&Re.update(ce,oe,c||o)}he&&he(Z,oe),oe.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:oe}),g=null}let Ne=new tm;Ne.setAnimationLoop(Me),this.setAnimationLoop=function(Z){he=Z},this.dispose=function(){}}},Es=new Dn,vw=new Et;function _w(n,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function i(m,p){p.color.getRGB(m.fogColor.value,Zu(n)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,A,C,v){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),h(m,p)):p.isMeshPhongMaterial?(r(m,p),u(m,p)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,v)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),y(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,A,C):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Wt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Wt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let A=e.get(p),C=A.envMap,v=A.envMapRotation;C&&(m.envMap.value=C,Es.copy(v),Es.x*=-1,Es.y*=-1,Es.z*=-1,C.isCubeTexture&&C.isRenderTargetTexture===!1&&(Es.y*=-1,Es.z*=-1),m.envMapRotation.value.setFromMatrix4(vw.makeRotationFromEuler(Es)),m.flipEnvMap.value=C.isCubeTexture&&C.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,A,C){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*A,m.scale.value=C*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function h(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,A){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Wt&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=A.texture,m.transmissionSamplerSize.value.set(A.width,A.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function y(m,p){let A=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(A.matrixWorld),m.nearDistance.value=A.shadow.camera.near,m.farDistance.value=A.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function xw(n,e,t,i){let s={},r={},o=[],a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(A,C){let v=C.program;i.uniformBlockBinding(A,v)}function c(A,C){let v=s[A.id];v===void 0&&(g(A),v=u(A),s[A.id]=v,A.addEventListener("dispose",m));let M=C.program;i.updateUBOMapping(A,M);let E=e.render.frame;r[A.id]!==E&&(d(A),r[A.id]=E)}function u(A){let C=h();A.__bindingPointIndex=C;let v=n.createBuffer(),M=A.__size,E=A.usage;return n.bindBuffer(n.UNIFORM_BUFFER,v),n.bufferData(n.UNIFORM_BUFFER,M,E),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,C,v),v}function h(){for(let A=0;A<a;A++)if(o.indexOf(A)===-1)return o.push(A),A;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(A){let C=s[A.id],v=A.uniforms,M=A.__cache;n.bindBuffer(n.UNIFORM_BUFFER,C);for(let E=0,b=v.length;E<b;E++){let R=Array.isArray(v[E])?v[E]:[v[E]];for(let _=0,x=R.length;_<x;_++){let L=R[_];if(f(L,E,_,M)===!0){let V=L.__offset,F=Array.isArray(L.value)?L.value:[L.value],I=0;for(let O=0;O<F.length;O++){let P=F[O],B=y(P);typeof P=="number"||typeof P=="boolean"?(L.__data[0]=P,n.bufferSubData(n.UNIFORM_BUFFER,V+I,L.__data)):P.isMatrix3?(L.__data[0]=P.elements[0],L.__data[1]=P.elements[1],L.__data[2]=P.elements[2],L.__data[3]=0,L.__data[4]=P.elements[3],L.__data[5]=P.elements[4],L.__data[6]=P.elements[5],L.__data[7]=0,L.__data[8]=P.elements[6],L.__data[9]=P.elements[7],L.__data[10]=P.elements[8],L.__data[11]=0):(P.toArray(L.__data,I),I+=B.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,V,L.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function f(A,C,v,M){let E=A.value,b=C+"_"+v;if(M[b]===void 0)return typeof E=="number"||typeof E=="boolean"?M[b]=E:M[b]=E.clone(),!0;{let R=M[b];if(typeof E=="number"||typeof E=="boolean"){if(R!==E)return M[b]=E,!0}else if(R.equals(E)===!1)return R.copy(E),!0}return!1}function g(A){let C=A.uniforms,v=0,M=16;for(let b=0,R=C.length;b<R;b++){let _=Array.isArray(C[b])?C[b]:[C[b]];for(let x=0,L=_.length;x<L;x++){let V=_[x],F=Array.isArray(V.value)?V.value:[V.value];for(let I=0,O=F.length;I<O;I++){let P=F[I],B=y(P),H=v%M,ee=H%B.boundary,se=H+ee;v+=ee,se!==0&&M-se<B.storage&&(v+=M-se),V.__data=new Float32Array(B.storage/Float32Array.BYTES_PER_ELEMENT),V.__offset=v,v+=B.storage}}}let E=v%M;return E>0&&(v+=M-E),A.__size=v,A.__cache={},this}function y(A){let C={boundary:0,storage:0};return typeof A=="number"||typeof A=="boolean"?(C.boundary=4,C.storage=4):A.isVector2?(C.boundary=8,C.storage=8):A.isVector3||A.isColor?(C.boundary=16,C.storage=12):A.isVector4?(C.boundary=16,C.storage=16):A.isMatrix3?(C.boundary=48,C.storage=48):A.isMatrix4?(C.boundary=64,C.storage=64):A.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",A),C}function m(A){let C=A.target;C.removeEventListener("dispose",m);let v=o.indexOf(C.__bindingPointIndex);o.splice(v,1),n.deleteBuffer(s[C.id]),delete s[C.id],delete r[C.id]}function p(){for(let A in s)n.deleteBuffer(s[A]);o=[],s={},r={}}return{bind:l,update:c,dispose:p}}var Ql=class{constructor(e={}){let{canvas:t=Ep(),context:i=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reverseDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=i.getContextAttributes().alpha}else f=o;let g=new Uint32Array(4),y=new Int32Array(4),m=null,p=null,A=[],C=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=$t,this.toneMapping=bi,this.toneMappingExposure=1;let v=this,M=!1,E=0,b=0,R=null,_=-1,x=null,L=new pt,V=new pt,F=null,I=new Ze(0),O=0,P=t.width,B=t.height,H=1,ee=null,se=null,he=new pt(0,0,P,B),Me=new pt(0,0,P,B),Ne=!1,Z=new ir,oe=!1,me=!1;this.transmissionResolutionScale=1;let ce=new Et,Re=new Et,Le=new k,Ye=new pt,nt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ze=!1;function dt(){return R===null?H:1}let U=i;function Rt(T,W){return t.getContext(T,W)}try{let T={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"172"}`),t.addEventListener("webglcontextlost",ie,!1),t.addEventListener("webglcontextrestored",_e,!1),t.addEventListener("webglcontextcreationerror",xe,!1),U===null){let W="webgl2";if(U=Rt(W,T),U===null)throw Rt(W)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(T){throw console.error("THREE.WebGLRenderer: "+T.message),T}let qe,He,ge,lt,Ee,N,w,Y,ne,re,te,Ce,fe,J,de,j,ae,we,Ie,pe,$e,We,it,G;function ye(){qe=new kS(U),qe.init(),We=new pw(U,qe),He=new PS(U,qe,e,We),ge=new dw(U,qe),He.reverseDepthBuffer&&d&&ge.buffers.depth.setReversed(!0),lt=new zS(U),Ee=new jM,N=new fw(U,qe,ge,Ee,He,We,lt),w=new LS(v),Y=new FS(v),ne=new $_(U),it=new RS(U,ne),re=new OS(U,ne,lt,it),te=new VS(U,re,ne,lt),Ie=new HS(U,He,N),j=new NS(Ee),Ce=new QM(v,w,Y,qe,He,it,j),fe=new _w(v,Ee),J=new tw,de=new ow(qe),we=new CS(v,w,Y,ge,te,f,l),ae=new uw(v,te,He),G=new xw(U,lt,He,ge),pe=new IS(U,qe,lt),$e=new BS(U,qe,lt),lt.programs=Ce.programs,v.capabilities=He,v.extensions=qe,v.properties=Ee,v.renderLists=J,v.shadowMap=ae,v.state=ge,v.info=lt}ye();let Q=new ph(v,U);this.xr=Q,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){let T=qe.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=qe.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return H},this.setPixelRatio=function(T){T!==void 0&&(H=T,this.setSize(P,B,!1))},this.getSize=function(T){return T.set(P,B)},this.setSize=function(T,W,$=!0){if(Q.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}P=T,B=W,t.width=Math.floor(T*H),t.height=Math.floor(W*H),$===!0&&(t.style.width=T+"px",t.style.height=W+"px"),this.setViewport(0,0,T,W)},this.getDrawingBufferSize=function(T){return T.set(P*H,B*H).floor()},this.setDrawingBufferSize=function(T,W,$){P=T,B=W,H=$,t.width=Math.floor(T*$),t.height=Math.floor(W*$),this.setViewport(0,0,T,W)},this.getCurrentViewport=function(T){return T.copy(L)},this.getViewport=function(T){return T.copy(he)},this.setViewport=function(T,W,$,q){T.isVector4?he.set(T.x,T.y,T.z,T.w):he.set(T,W,$,q),ge.viewport(L.copy(he).multiplyScalar(H).round())},this.getScissor=function(T){return T.copy(Me)},this.setScissor=function(T,W,$,q){T.isVector4?Me.set(T.x,T.y,T.z,T.w):Me.set(T,W,$,q),ge.scissor(V.copy(Me).multiplyScalar(H).round())},this.getScissorTest=function(){return Ne},this.setScissorTest=function(T){ge.setScissorTest(Ne=T)},this.setOpaqueSort=function(T){ee=T},this.setTransparentSort=function(T){se=T},this.getClearColor=function(T){return T.copy(we.getClearColor())},this.setClearColor=function(){we.setClearColor.apply(we,arguments)},this.getClearAlpha=function(){return we.getClearAlpha()},this.setClearAlpha=function(){we.setClearAlpha.apply(we,arguments)},this.clear=function(T=!0,W=!0,$=!0){let q=0;if(T){let X=!1;if(R!==null){let ue=R.texture.format;X=ue===Sl||ue===bl||ue===xl}if(X){let ue=R.texture.type,be=ue===Jn||ue===Yi||ue===ur||ue===bs||ue===vl||ue===_l,Te=we.getClearColor(),Ae=we.getClearAlpha(),Ve=Te.r,Ge=Te.g,ke=Te.b;be?(g[0]=Ve,g[1]=Ge,g[2]=ke,g[3]=Ae,U.clearBufferuiv(U.COLOR,0,g)):(y[0]=Ve,y[1]=Ge,y[2]=ke,y[3]=Ae,U.clearBufferiv(U.COLOR,0,y))}else q|=U.COLOR_BUFFER_BIT}W&&(q|=U.DEPTH_BUFFER_BIT),$&&(q|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),U.clear(q)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ie,!1),t.removeEventListener("webglcontextrestored",_e,!1),t.removeEventListener("webglcontextcreationerror",xe,!1),we.dispose(),J.dispose(),de.dispose(),Ee.dispose(),w.dispose(),Y.dispose(),te.dispose(),it.dispose(),G.dispose(),Ce.dispose(),Q.dispose(),Q.removeEventListener("sessionstart",an),Q.removeEventListener("sessionend",kn),Jt.stop()};function ie(T){T.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),M=!0}function _e(){console.log("THREE.WebGLRenderer: Context Restored."),M=!1;let T=lt.autoReset,W=ae.enabled,$=ae.autoUpdate,q=ae.needsUpdate,X=ae.type;ye(),lt.autoReset=T,ae.enabled=W,ae.autoUpdate=$,ae.needsUpdate=q,ae.type=X}function xe(T){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function Xe(T){let W=T.target;W.removeEventListener("dispose",Xe),ve(W)}function ve(T){St(T),Ee.remove(T)}function St(T){let W=Ee.get(T).programs;W!==void 0&&(W.forEach(function($){Ce.releaseProgram($)}),T.isShaderMaterial&&Ce.releaseShaderCache(T))}this.renderBufferDirect=function(T,W,$,q,X,ue){W===null&&(W=nt);let be=X.isMesh&&X.matrixWorld.determinant()<0,Te=ic(T,W,$,q,X);ge.setMaterial(q,be);let Ae=$.index,Ve=1;if(q.wireframe===!0){if(Ae=re.getWireframeAttribute($),Ae===void 0)return;Ve=2}let Ge=$.drawRange,ke=$.attributes.position,rt=Ge.start*Ve,Qe=(Ge.start+Ge.count)*Ve;ue!==null&&(rt=Math.max(rt,ue.start*Ve),Qe=Math.min(Qe,(ue.start+ue.count)*Ve)),Ae!==null?(rt=Math.max(rt,0),Qe=Math.min(Qe,Ae.count)):ke!=null&&(rt=Math.max(rt,0),Qe=Math.min(Qe,ke.count));let ft=Qe-rt;if(ft<0||ft===1/0)return;it.setup(X,q,Te,$,Ae);let Mt,at=pe;if(Ae!==null&&(Mt=ne.get(Ae),at=$e,at.setIndex(Mt)),X.isMesh)q.wireframe===!0?(ge.setLineWidth(q.wireframeLinewidth*dt()),at.setMode(U.LINES)):at.setMode(U.TRIANGLES);else if(X.isLine){let Oe=q.linewidth;Oe===void 0&&(Oe=1),ge.setLineWidth(Oe*dt()),X.isLineSegments?at.setMode(U.LINES):X.isLineLoop?at.setMode(U.LINE_LOOP):at.setMode(U.LINE_STRIP)}else X.isPoints?at.setMode(U.POINTS):X.isSprite&&at.setMode(U.TRIANGLES);if(X.isBatchedMesh)if(X._multiDrawInstances!==null)at.renderMultiDrawInstances(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount,X._multiDrawInstances);else if(qe.get("WEBGL_multi_draw"))at.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{let Oe=X._multiDrawStarts,ut=X._multiDrawCounts,Fe=X._multiDrawCount,Tt=Ae?ne.get(Ae).bytesPerElement:1,wt=Ee.get(q).currentProgram.getUniforms();for(let _t=0;_t<Fe;_t++)wt.setValue(U,"_gl_DrawID",_t),at.render(Oe[_t]/Tt,ut[_t])}else if(X.isInstancedMesh)at.renderInstances(rt,ft,X.count);else if($.isInstancedBufferGeometry){let Oe=$._maxInstanceCount!==void 0?$._maxInstanceCount:1/0,ut=Math.min($.instanceCount,Oe);at.renderInstances(rt,ft,ut)}else at.render(rt,ft)};function st(T,W,$){T.transparent===!0&&T.side===Zn&&T.forceSinglePass===!1?(T.side=Wt,T.needsUpdate=!0,ti(T,W,$),T.side=gi,T.needsUpdate=!0,ti(T,W,$),T.side=Zn):ti(T,W,$)}this.compile=function(T,W,$=null){$===null&&($=T),p=de.get($),p.init(W),C.push(p),$.traverseVisible(function(X){X.isLight&&X.layers.test(W.layers)&&(p.pushLight(X),X.castShadow&&p.pushShadow(X))}),T!==$&&T.traverseVisible(function(X){X.isLight&&X.layers.test(W.layers)&&(p.pushLight(X),X.castShadow&&p.pushShadow(X))}),p.setupLights();let q=new Set;return T.traverse(function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;let ue=X.material;if(ue)if(Array.isArray(ue))for(let be=0;be<ue.length;be++){let Te=ue[be];st(Te,$,X),q.add(Te)}else st(ue,$,X),q.add(ue)}),C.pop(),p=null,q},this.compileAsync=function(T,W,$=null){let q=this.compile(T,W,$);return new Promise(X=>{function ue(){if(q.forEach(function(be){Ee.get(be).currentProgram.isReady()&&q.delete(be)}),q.size===0){X(T);return}setTimeout(ue,10)}qe.get("KHR_parallel_shader_compile")!==null?ue():setTimeout(ue,10)})};let It=null;function Bt(T){It&&It(T)}function an(){Jt.stop()}function kn(){Jt.start()}let Jt=new tm;Jt.setAnimationLoop(Bt),typeof self<"u"&&Jt.setContext(self),this.setAnimationLoop=function(T){It=T,Q.setAnimationLoop(T),T===null?Jt.stop():Jt.start()},Q.addEventListener("sessionstart",an),Q.addEventListener("sessionend",kn),this.render=function(T,W){if(W!==void 0&&W.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(M===!0)return;if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),W.parent===null&&W.matrixWorldAutoUpdate===!0&&W.updateMatrixWorld(),Q.enabled===!0&&Q.isPresenting===!0&&(Q.cameraAutoUpdate===!0&&Q.updateCamera(W),W=Q.getCamera()),T.isScene===!0&&T.onBeforeRender(v,T,W,R),p=de.get(T,C.length),p.init(W),C.push(p),Re.multiplyMatrices(W.projectionMatrix,W.matrixWorldInverse),Z.setFromProjectionMatrix(Re),me=this.localClippingEnabled,oe=j.init(this.clippingPlanes,me),m=J.get(T,A.length),m.init(),A.push(m),Q.enabled===!0&&Q.isPresenting===!0){let ue=v.xr.getDepthSensingMesh();ue!==null&&D(ue,W,-1/0,v.sortObjects)}D(T,W,0,v.sortObjects),m.finish(),v.sortObjects===!0&&m.sort(ee,se),ze=Q.enabled===!1||Q.isPresenting===!1||Q.hasDepthSensing()===!1,ze&&we.addToRenderList(m,T),this.info.render.frame++,oe===!0&&j.beginShadows();let $=p.state.shadowsArray;ae.render($,T,W),oe===!0&&j.endShadows(),this.info.autoReset===!0&&this.info.reset();let q=m.opaque,X=m.transmissive;if(p.setupLights(),W.isArrayCamera){let ue=W.cameras;if(X.length>0)for(let be=0,Te=ue.length;be<Te;be++){let Ae=ue[be];Ue(q,X,T,Ae)}ze&&we.render(T);for(let be=0,Te=ue.length;be<Te;be++){let Ae=ue[be];le(m,T,Ae,Ae.viewport)}}else X.length>0&&Ue(q,X,T,W),ze&&we.render(T),le(m,T,W);R!==null&&b===0&&(N.updateMultisampleRenderTarget(R),N.updateRenderTargetMipmap(R)),T.isScene===!0&&T.onAfterRender(v,T,W),it.resetDefaultState(),_=-1,x=null,C.pop(),C.length>0?(p=C[C.length-1],oe===!0&&j.setGlobalState(v.clippingPlanes,p.state.camera)):p=null,A.pop(),A.length>0?m=A[A.length-1]:m=null};function D(T,W,$,q){if(T.visible===!1)return;if(T.layers.test(W.layers)){if(T.isGroup)$=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(W);else if(T.isLight)p.pushLight(T),T.castShadow&&p.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||Z.intersectsSprite(T)){q&&Ye.setFromMatrixPosition(T.matrixWorld).applyMatrix4(Re);let be=te.update(T),Te=T.material;Te.visible&&m.push(T,be,Te,$,Ye.z,null)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||Z.intersectsObject(T))){let be=te.update(T),Te=T.material;if(q&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),Ye.copy(T.boundingSphere.center)):(be.boundingSphere===null&&be.computeBoundingSphere(),Ye.copy(be.boundingSphere.center)),Ye.applyMatrix4(T.matrixWorld).applyMatrix4(Re)),Array.isArray(Te)){let Ae=be.groups;for(let Ve=0,Ge=Ae.length;Ve<Ge;Ve++){let ke=Ae[Ve],rt=Te[ke.materialIndex];rt&&rt.visible&&m.push(T,be,rt,$,Ye.z,ke)}}else Te.visible&&m.push(T,be,Te,$,Ye.z,null)}}let ue=T.children;for(let be=0,Te=ue.length;be<Te;be++)D(ue[be],W,$,q)}function le(T,W,$,q){let X=T.opaque,ue=T.transmissive,be=T.transparent;p.setupLightsView($),oe===!0&&j.setGlobalState(v.clippingPlanes,$),q&&ge.viewport(L.copy(q)),X.length>0&&gt(X,W,$),ue.length>0&&gt(ue,W,$),be.length>0&&gt(be,W,$),ge.buffers.depth.setTest(!0),ge.buffers.depth.setMask(!0),ge.buffers.color.setMask(!0),ge.setPolygonOffset(!1)}function Ue(T,W,$,q){if(($.isScene===!0?$.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[q.id]===void 0&&(p.state.transmissionRenderTarget[q.id]=new $n(1,1,{generateMipmaps:!0,type:qe.has("EXT_color_buffer_half_float")||qe.has("EXT_color_buffer_float")?hr:Jn,minFilter:Xi,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ct.workingColorSpace}));let ue=p.state.transmissionRenderTarget[q.id],be=q.viewport||L;ue.setSize(be.z*v.transmissionResolutionScale,be.w*v.transmissionResolutionScale);let Te=v.getRenderTarget();v.setRenderTarget(ue),v.getClearColor(I),O=v.getClearAlpha(),O<1&&v.setClearColor(16777215,.5),v.clear(),ze&&we.render($);let Ae=v.toneMapping;v.toneMapping=bi;let Ve=q.viewport;if(q.viewport!==void 0&&(q.viewport=void 0),p.setupLightsView(q),oe===!0&&j.setGlobalState(v.clippingPlanes,q),gt(T,$,q),N.updateMultisampleRenderTarget(ue),N.updateRenderTargetMipmap(ue),qe.has("WEBGL_multisampled_render_to_texture")===!1){let Ge=!1;for(let ke=0,rt=W.length;ke<rt;ke++){let Qe=W[ke],ft=Qe.object,Mt=Qe.geometry,at=Qe.material,Oe=Qe.group;if(at.side===Zn&&ft.layers.test(q.layers)){let ut=at.side;at.side=Wt,at.needsUpdate=!0,yt(ft,$,q,Mt,at,Oe),at.side=ut,at.needsUpdate=!0,Ge=!0}}Ge===!0&&(N.updateMultisampleRenderTarget(ue),N.updateRenderTargetMipmap(ue))}v.setRenderTarget(Te),v.setClearColor(I,O),Ve!==void 0&&(q.viewport=Ve),v.toneMapping=Ae}function gt(T,W,$){let q=W.isScene===!0?W.overrideMaterial:null;for(let X=0,ue=T.length;X<ue;X++){let be=T[X],Te=be.object,Ae=be.geometry,Ve=q===null?be.material:q,Ge=be.group;Te.layers.test($.layers)&&yt(Te,W,$,Ae,Ve,Ge)}}function yt(T,W,$,q,X,ue){T.onBeforeRender(v,W,$,q,X,ue),T.modelViewMatrix.multiplyMatrices($.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),X.onBeforeRender(v,W,$,q,T,ue),X.transparent===!0&&X.side===Zn&&X.forceSinglePass===!1?(X.side=Wt,X.needsUpdate=!0,v.renderBufferDirect($,W,q,X,T,ue),X.side=gi,X.needsUpdate=!0,v.renderBufferDirect($,W,q,X,T,ue),X.side=Zn):v.renderBufferDirect($,W,q,X,T,ue),T.onAfterRender(v,W,$,q,X,ue)}function ti(T,W,$){W.isScene!==!0&&(W=nt);let q=Ee.get(T),X=p.state.lights,ue=p.state.shadowsArray,be=X.state.version,Te=Ce.getParameters(T,X.state,ue,W,$),Ae=Ce.getProgramCacheKey(Te),Ve=q.programs;q.environment=T.isMeshStandardMaterial?W.environment:null,q.fog=W.fog,q.envMap=(T.isMeshStandardMaterial?Y:w).get(T.envMap||q.environment),q.envMapRotation=q.environment!==null&&T.envMap===null?W.environmentRotation:T.envMapRotation,Ve===void 0&&(T.addEventListener("dispose",Xe),Ve=new Map,q.programs=Ve);let Ge=Ve.get(Ae);if(Ge!==void 0){if(q.currentProgram===Ge&&q.lightsStateVersion===be)return _r(T,Te),Ge}else Te.uniforms=Ce.getUniforms(T),T.onBeforeCompile(Te,v),Ge=Ce.acquireProgram(Te,Ae),Ve.set(Ae,Ge),q.uniforms=Te.uniforms;let ke=q.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(ke.clippingPlanes=j.uniform),_r(T,Te),q.needsLights=qi(T),q.lightsStateVersion=be,q.needsLights&&(ke.ambientLightColor.value=X.state.ambient,ke.lightProbe.value=X.state.probe,ke.directionalLights.value=X.state.directional,ke.directionalLightShadows.value=X.state.directionalShadow,ke.spotLights.value=X.state.spot,ke.spotLightShadows.value=X.state.spotShadow,ke.rectAreaLights.value=X.state.rectArea,ke.ltc_1.value=X.state.rectAreaLTC1,ke.ltc_2.value=X.state.rectAreaLTC2,ke.pointLights.value=X.state.point,ke.pointLightShadows.value=X.state.pointShadow,ke.hemisphereLights.value=X.state.hemi,ke.directionalShadowMap.value=X.state.directionalShadowMap,ke.directionalShadowMatrix.value=X.state.directionalShadowMatrix,ke.spotShadowMap.value=X.state.spotShadowMap,ke.spotLightMatrix.value=X.state.spotLightMatrix,ke.spotLightMap.value=X.state.spotLightMap,ke.pointShadowMap.value=X.state.pointShadowMap,ke.pointShadowMatrix.value=X.state.pointShadowMatrix),q.currentProgram=Ge,q.uniformsList=null,Ge}function $i(T){if(T.uniformsList===null){let W=T.currentProgram.getUniforms();T.uniformsList=mr.seqWithValue(W.seq,T.uniforms)}return T.uniformsList}function _r(T,W){let $=Ee.get(T);$.outputColorSpace=W.outputColorSpace,$.batching=W.batching,$.batchingColor=W.batchingColor,$.instancing=W.instancing,$.instancingColor=W.instancingColor,$.instancingMorph=W.instancingMorph,$.skinning=W.skinning,$.morphTargets=W.morphTargets,$.morphNormals=W.morphNormals,$.morphColors=W.morphColors,$.morphTargetsCount=W.morphTargetsCount,$.numClippingPlanes=W.numClippingPlanes,$.numIntersection=W.numClipIntersection,$.vertexAlphas=W.vertexAlphas,$.vertexTangents=W.vertexTangents,$.toneMapping=W.toneMapping}function ic(T,W,$,q,X){W.isScene!==!0&&(W=nt),N.resetTextureUnits();let ue=W.fog,be=q.isMeshStandardMaterial?W.environment:null,Te=R===null?v.outputColorSpace:R.isXRRenderTarget===!0?R.texture.colorSpace:ms,Ae=(q.isMeshStandardMaterial?Y:w).get(q.envMap||be),Ve=q.vertexColors===!0&&!!$.attributes.color&&$.attributes.color.itemSize===4,Ge=!!$.attributes.tangent&&(!!q.normalMap||q.anisotropy>0),ke=!!$.morphAttributes.position,rt=!!$.morphAttributes.normal,Qe=!!$.morphAttributes.color,ft=bi;q.toneMapped&&(R===null||R.isXRRenderTarget===!0)&&(ft=v.toneMapping);let Mt=$.morphAttributes.position||$.morphAttributes.normal||$.morphAttributes.color,at=Mt!==void 0?Mt.length:0,Oe=Ee.get(q),ut=p.state.lights;if(oe===!0&&(me===!0||T!==x)){let zt=T===x&&q.id===_;j.setState(q,T,zt)}let Fe=!1;q.version===Oe.__version?(Oe.needsLights&&Oe.lightsStateVersion!==ut.state.version||Oe.outputColorSpace!==Te||X.isBatchedMesh&&Oe.batching===!1||!X.isBatchedMesh&&Oe.batching===!0||X.isBatchedMesh&&Oe.batchingColor===!0&&X.colorTexture===null||X.isBatchedMesh&&Oe.batchingColor===!1&&X.colorTexture!==null||X.isInstancedMesh&&Oe.instancing===!1||!X.isInstancedMesh&&Oe.instancing===!0||X.isSkinnedMesh&&Oe.skinning===!1||!X.isSkinnedMesh&&Oe.skinning===!0||X.isInstancedMesh&&Oe.instancingColor===!0&&X.instanceColor===null||X.isInstancedMesh&&Oe.instancingColor===!1&&X.instanceColor!==null||X.isInstancedMesh&&Oe.instancingMorph===!0&&X.morphTexture===null||X.isInstancedMesh&&Oe.instancingMorph===!1&&X.morphTexture!==null||Oe.envMap!==Ae||q.fog===!0&&Oe.fog!==ue||Oe.numClippingPlanes!==void 0&&(Oe.numClippingPlanes!==j.numPlanes||Oe.numIntersection!==j.numIntersection)||Oe.vertexAlphas!==Ve||Oe.vertexTangents!==Ge||Oe.morphTargets!==ke||Oe.morphNormals!==rt||Oe.morphColors!==Qe||Oe.toneMapping!==ft||Oe.morphTargetsCount!==at)&&(Fe=!0):(Fe=!0,Oe.__version=q.version);let Tt=Oe.currentProgram;Fe===!0&&(Tt=ti(q,W,X));let wt=!1,_t=!1,on=!1,tt=Tt.getUniforms(),ln=Oe.uniforms;if(ge.useProgram(Tt.program)&&(wt=!0,_t=!0,on=!0),q.id!==_&&(_=q.id,_t=!0),wt||x!==T){ge.buffers.depth.getReversed()?(ce.copy(T.projectionMatrix),Ap(ce),Cp(ce),tt.setValue(U,"projectionMatrix",ce)):tt.setValue(U,"projectionMatrix",T.projectionMatrix),tt.setValue(U,"viewMatrix",T.matrixWorldInverse);let Ht=tt.map.cameraPosition;Ht!==void 0&&Ht.setValue(U,Le.setFromMatrixPosition(T.matrixWorld)),He.logarithmicDepthBuffer&&tt.setValue(U,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(q.isMeshPhongMaterial||q.isMeshToonMaterial||q.isMeshLambertMaterial||q.isMeshBasicMaterial||q.isMeshStandardMaterial||q.isShaderMaterial)&&tt.setValue(U,"isOrthographic",T.isOrthographicCamera===!0),x!==T&&(x=T,_t=!0,on=!0)}if(X.isSkinnedMesh){tt.setOptional(U,X,"bindMatrix"),tt.setOptional(U,X,"bindMatrixInverse");let zt=X.skeleton;zt&&(zt.boneTexture===null&&zt.computeBoneTexture(),tt.setValue(U,"boneTexture",zt.boneTexture,N))}X.isBatchedMesh&&(tt.setOptional(U,X,"batchingTexture"),tt.setValue(U,"batchingTexture",X._matricesTexture,N),tt.setOptional(U,X,"batchingIdTexture"),tt.setValue(U,"batchingIdTexture",X._indirectTexture,N),tt.setOptional(U,X,"batchingColorTexture"),X._colorsTexture!==null&&tt.setValue(U,"batchingColorTexture",X._colorsTexture,N));let Qt=$.morphAttributes;if((Qt.position!==void 0||Qt.normal!==void 0||Qt.color!==void 0)&&Ie.update(X,$,Tt),(_t||Oe.receiveShadow!==X.receiveShadow)&&(Oe.receiveShadow=X.receiveShadow,tt.setValue(U,"receiveShadow",X.receiveShadow)),q.isMeshGouraudMaterial&&q.envMap!==null&&(ln.envMap.value=Ae,ln.flipEnvMap.value=Ae.isCubeTexture&&Ae.isRenderTargetTexture===!1?-1:1),q.isMeshStandardMaterial&&q.envMap===null&&W.environment!==null&&(ln.envMapIntensity.value=W.environmentIntensity),_t&&(tt.setValue(U,"toneMappingExposure",v.toneMappingExposure),Oe.needsLights&&Cs(ln,on),ue&&q.fog===!0&&fe.refreshFogUniforms(ln,ue),fe.refreshMaterialUniforms(ln,q,H,B,p.state.transmissionRenderTarget[T.id]),mr.upload(U,$i(Oe),ln,N)),q.isShaderMaterial&&q.uniformsNeedUpdate===!0&&(mr.upload(U,$i(Oe),ln,N),q.uniformsNeedUpdate=!1),q.isSpriteMaterial&&tt.setValue(U,"center",X.center),tt.setValue(U,"modelViewMatrix",X.modelViewMatrix),tt.setValue(U,"normalMatrix",X.normalMatrix),tt.setValue(U,"modelMatrix",X.matrixWorld),q.isShaderMaterial||q.isRawShaderMaterial){let zt=q.uniformsGroups;for(let Ht=0,Ea=zt.length;Ht<Ea;Ht++){let On=zt[Ht];G.update(On,Tt),G.bind(On,Tt)}}return Tt}function Cs(T,W){T.ambientLightColor.needsUpdate=W,T.lightProbe.needsUpdate=W,T.directionalLights.needsUpdate=W,T.directionalLightShadows.needsUpdate=W,T.pointLights.needsUpdate=W,T.pointLightShadows.needsUpdate=W,T.spotLights.needsUpdate=W,T.spotLightShadows.needsUpdate=W,T.rectAreaLights.needsUpdate=W,T.hemisphereLights.needsUpdate=W}function qi(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return E},this.getActiveMipmapLevel=function(){return b},this.getRenderTarget=function(){return R},this.setRenderTargetTextures=function(T,W,$){Ee.get(T.texture).__webglTexture=W,Ee.get(T.depthTexture).__webglTexture=$;let q=Ee.get(T);q.__hasExternalTextures=!0,q.__autoAllocateDepthBuffer=$===void 0,q.__autoAllocateDepthBuffer||qe.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),q.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(T,W){let $=Ee.get(T);$.__webglFramebuffer=W,$.__useDefaultFramebuffer=W===void 0};let wa=U.createFramebuffer();this.setRenderTarget=function(T,W=0,$=0){R=T,E=W,b=$;let q=!0,X=null,ue=!1,be=!1;if(T){let Ae=Ee.get(T);if(Ae.__useDefaultFramebuffer!==void 0)ge.bindFramebuffer(U.FRAMEBUFFER,null),q=!1;else if(Ae.__webglFramebuffer===void 0)N.setupRenderTarget(T);else if(Ae.__hasExternalTextures)N.rebindTextures(T,Ee.get(T.texture).__webglTexture,Ee.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){let ke=T.depthTexture;if(Ae.__boundDepthTexture!==ke){if(ke!==null&&Ee.has(ke)&&(T.width!==ke.image.width||T.height!==ke.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");N.setupDepthRenderbuffer(T)}}let Ve=T.texture;(Ve.isData3DTexture||Ve.isDataArrayTexture||Ve.isCompressedArrayTexture)&&(be=!0);let Ge=Ee.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(Ge[W])?X=Ge[W][$]:X=Ge[W],ue=!0):T.samples>0&&N.useMultisampledRTT(T)===!1?X=Ee.get(T).__webglMultisampledFramebuffer:Array.isArray(Ge)?X=Ge[$]:X=Ge,L.copy(T.viewport),V.copy(T.scissor),F=T.scissorTest}else L.copy(he).multiplyScalar(H).floor(),V.copy(Me).multiplyScalar(H).floor(),F=Ne;if($!==0&&(X=wa),ge.bindFramebuffer(U.FRAMEBUFFER,X)&&q&&ge.drawBuffers(T,X),ge.viewport(L),ge.scissor(V),ge.setScissorTest(F),ue){let Ae=Ee.get(T.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+W,Ae.__webglTexture,$)}else if(be){let Ae=Ee.get(T.texture),Ve=W;U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,Ae.__webglTexture,$,Ve)}else if(T!==null&&$!==0){let Ae=Ee.get(T.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Ae.__webglTexture,$)}_=-1},this.readRenderTargetPixels=function(T,W,$,q,X,ue,be){if(!(T&&T.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Te=Ee.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&be!==void 0&&(Te=Te[be]),Te){ge.bindFramebuffer(U.FRAMEBUFFER,Te);try{let Ae=T.texture,Ve=Ae.format,Ge=Ae.type;if(!He.textureFormatReadable(Ve)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!He.textureTypeReadable(Ge)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}W>=0&&W<=T.width-q&&$>=0&&$<=T.height-X&&U.readPixels(W,$,q,X,We.convert(Ve),We.convert(Ge),ue)}finally{let Ae=R!==null?Ee.get(R).__webglFramebuffer:null;ge.bindFramebuffer(U.FRAMEBUFFER,Ae)}}},this.readRenderTargetPixelsAsync=async function(T,W,$,q,X,ue,be){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Te=Ee.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&be!==void 0&&(Te=Te[be]),Te){let Ae=T.texture,Ve=Ae.format,Ge=Ae.type;if(!He.textureFormatReadable(Ve))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!He.textureTypeReadable(Ge))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(W>=0&&W<=T.width-q&&$>=0&&$<=T.height-X){ge.bindFramebuffer(U.FRAMEBUFFER,Te);let ke=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,ke),U.bufferData(U.PIXEL_PACK_BUFFER,ue.byteLength,U.STREAM_READ),U.readPixels(W,$,q,X,We.convert(Ve),We.convert(Ge),0);let rt=R!==null?Ee.get(R).__webglFramebuffer:null;ge.bindFramebuffer(U.FRAMEBUFFER,rt);let Qe=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await Tp(U,Qe,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,ke),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,ue),U.deleteBuffer(ke),U.deleteSync(Qe),ue}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(T,W=null,$=0){T.isTexture!==!0&&(Ss("WebGLRenderer: copyFramebufferToTexture function signature has changed."),W=arguments[0]||null,T=arguments[1]);let q=Math.pow(2,-$),X=Math.floor(T.image.width*q),ue=Math.floor(T.image.height*q),be=W!==null?W.x:0,Te=W!==null?W.y:0;N.setTexture2D(T,0),U.copyTexSubImage2D(U.TEXTURE_2D,$,0,0,be,Te,X,ue),ge.unbindTexture()};let xr=U.createFramebuffer(),sc=U.createFramebuffer();this.copyTextureToTexture=function(T,W,$=null,q=null,X=0,ue=null){T.isTexture!==!0&&(Ss("WebGLRenderer: copyTextureToTexture function signature has changed."),q=arguments[0]||null,T=arguments[1],W=arguments[2],ue=arguments[3]||0,$=null),ue===null&&(X!==0?(Ss("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ue=X,X=0):ue=0);let be,Te,Ae,Ve,Ge,ke,rt,Qe,ft,Mt=T.isCompressedTexture?T.mipmaps[ue]:T.image;if($!==null)be=$.max.x-$.min.x,Te=$.max.y-$.min.y,Ae=$.isBox3?$.max.z-$.min.z:1,Ve=$.min.x,Ge=$.min.y,ke=$.isBox3?$.min.z:0;else{let Qt=Math.pow(2,-X);be=Math.floor(Mt.width*Qt),Te=Math.floor(Mt.height*Qt),T.isDataArrayTexture?Ae=Mt.depth:T.isData3DTexture?Ae=Math.floor(Mt.depth*Qt):Ae=1,Ve=0,Ge=0,ke=0}q!==null?(rt=q.x,Qe=q.y,ft=q.z):(rt=0,Qe=0,ft=0);let at=We.convert(W.format),Oe=We.convert(W.type),ut;W.isData3DTexture?(N.setTexture3D(W,0),ut=U.TEXTURE_3D):W.isDataArrayTexture||W.isCompressedArrayTexture?(N.setTexture2DArray(W,0),ut=U.TEXTURE_2D_ARRAY):(N.setTexture2D(W,0),ut=U.TEXTURE_2D),U.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,W.flipY),U.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,W.premultiplyAlpha),U.pixelStorei(U.UNPACK_ALIGNMENT,W.unpackAlignment);let Fe=U.getParameter(U.UNPACK_ROW_LENGTH),Tt=U.getParameter(U.UNPACK_IMAGE_HEIGHT),wt=U.getParameter(U.UNPACK_SKIP_PIXELS),_t=U.getParameter(U.UNPACK_SKIP_ROWS),on=U.getParameter(U.UNPACK_SKIP_IMAGES);U.pixelStorei(U.UNPACK_ROW_LENGTH,Mt.width),U.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Mt.height),U.pixelStorei(U.UNPACK_SKIP_PIXELS,Ve),U.pixelStorei(U.UNPACK_SKIP_ROWS,Ge),U.pixelStorei(U.UNPACK_SKIP_IMAGES,ke);let tt=T.isDataArrayTexture||T.isData3DTexture,ln=W.isDataArrayTexture||W.isData3DTexture;if(T.isDepthTexture){let Qt=Ee.get(T),zt=Ee.get(W),Ht=Ee.get(Qt.__renderTarget),Ea=Ee.get(zt.__renderTarget);ge.bindFramebuffer(U.READ_FRAMEBUFFER,Ht.__webglFramebuffer),ge.bindFramebuffer(U.DRAW_FRAMEBUFFER,Ea.__webglFramebuffer);for(let On=0;On<Ae;On++)tt&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Ee.get(T).__webglTexture,X,ke+On),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Ee.get(W).__webglTexture,ue,ft+On)),U.blitFramebuffer(Ve,Ge,be,Te,rt,Qe,be,Te,U.DEPTH_BUFFER_BIT,U.NEAREST);ge.bindFramebuffer(U.READ_FRAMEBUFFER,null),ge.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(X!==0||T.isRenderTargetTexture||Ee.has(T)){let Qt=Ee.get(T),zt=Ee.get(W);ge.bindFramebuffer(U.READ_FRAMEBUFFER,xr),ge.bindFramebuffer(U.DRAW_FRAMEBUFFER,sc);for(let Ht=0;Ht<Ae;Ht++)tt?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Qt.__webglTexture,X,ke+Ht):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Qt.__webglTexture,X),ln?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,zt.__webglTexture,ue,ft+Ht):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,zt.__webglTexture,ue),X!==0?U.blitFramebuffer(Ve,Ge,be,Te,rt,Qe,be,Te,U.COLOR_BUFFER_BIT,U.NEAREST):ln?U.copyTexSubImage3D(ut,ue,rt,Qe,ft+Ht,Ve,Ge,be,Te):U.copyTexSubImage2D(ut,ue,rt,Qe,Ve,Ge,be,Te);ge.bindFramebuffer(U.READ_FRAMEBUFFER,null),ge.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else ln?T.isDataTexture||T.isData3DTexture?U.texSubImage3D(ut,ue,rt,Qe,ft,be,Te,Ae,at,Oe,Mt.data):W.isCompressedArrayTexture?U.compressedTexSubImage3D(ut,ue,rt,Qe,ft,be,Te,Ae,at,Mt.data):U.texSubImage3D(ut,ue,rt,Qe,ft,be,Te,Ae,at,Oe,Mt):T.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,ue,rt,Qe,be,Te,at,Oe,Mt.data):T.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,ue,rt,Qe,Mt.width,Mt.height,at,Mt.data):U.texSubImage2D(U.TEXTURE_2D,ue,rt,Qe,be,Te,at,Oe,Mt);U.pixelStorei(U.UNPACK_ROW_LENGTH,Fe),U.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Tt),U.pixelStorei(U.UNPACK_SKIP_PIXELS,wt),U.pixelStorei(U.UNPACK_SKIP_ROWS,_t),U.pixelStorei(U.UNPACK_SKIP_IMAGES,on),ue===0&&W.generateMipmaps&&U.generateMipmap(ut),ge.unbindTexture()},this.copyTextureToTexture3D=function(T,W,$=null,q=null,X=0){return T.isTexture!==!0&&(Ss("WebGLRenderer: copyTextureToTexture3D function signature has changed."),$=arguments[0]||null,q=arguments[1]||null,T=arguments[2],W=arguments[3],X=arguments[4]||0),Ss('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(T,W,$,q,X)},this.initRenderTarget=function(T){Ee.get(T).__webglFramebuffer===void 0&&N.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?N.setTextureCube(T,0):T.isData3DTexture?N.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?N.setTexture2DArray(T,0):N.setTexture2D(T,0),ge.unbindTexture()},this.resetState=function(){E=0,b=0,R=null,ge.reset(),it.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Yn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorspace=ct._getDrawingBufferColorSpace(e),t.unpackColorSpace=ct._getUnpackColorSpace()}};var ec=class extends gs{constructor(){super();let e=new zi;e.deleteAttribute("uv");let t=new Ot({side:Wt}),i=new Ot,s=new fa(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let r=new Be(e,t);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);let o=new Be(e,i);o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),this.add(o);let a=new Be(e,i);a.position.set(-5.607,-.754,-.758),a.rotation.set(0,.994,0),a.scale.set(1.97,1.534,3.955),this.add(a);let l=new Be(e,i);l.position.set(6.167,.857,7.803),l.rotation.set(0,.561,0),l.scale.set(3.927,6.285,3.687),this.add(l);let c=new Be(e,i);c.position.set(-2.017,.018,6.124),c.rotation.set(0,.333,0),c.scale.set(2.002,4.566,2.064),this.add(c);let u=new Be(e,i);u.position.set(2.291,-.756,-2.621),u.rotation.set(0,-.286,0),u.scale.set(1.546,1.552,1.496),this.add(u);let h=new Be(e,i);h.position.set(-2.193,-.369,-5.547),h.rotation.set(0,.516,0),h.scale.set(3.875,3.487,2.986),this.add(h);let d=new Be(e,vr(50));d.position.set(-16.116,14.37,8.208),d.scale.set(.1,2.428,2.739),this.add(d);let f=new Be(e,vr(50));f.position.set(-16.109,18.021,-8.207),f.scale.set(.1,2.425,2.751),this.add(f);let g=new Be(e,vr(17));g.position.set(14.904,12.198,-1.832),g.scale.set(.15,4.265,6.331),this.add(g);let y=new Be(e,vr(43));y.position.set(-.462,8.89,14.52),y.scale.set(4.38,5.441,.088),this.add(y);let m=new Be(e,vr(20));m.position.set(3.235,11.486,-12.541),m.scale.set(2.5,2,.1),this.add(m);let p=new Be(e,vr(100));p.position.set(0,20,0),p.scale.set(1,.1,1),this.add(p)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function vr(n){let e=new Sn;return e.color.setScalar(n),e}var Zt=ht(At(),1);function Sw(n){try{let e=n.getContext(),t=e.getExtension("WEBGL_debug_renderer_info"),i=String(t?e.getParameter(t.UNMASKED_RENDERER_WEBGL)||"":e.getParameter(e.RENDERER)||"");return/SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(i)}catch{return!1}}function Mw(){let n=document.createElement("canvas");n.width=128,n.height=128;let e=n.getContext("2d");if(e){e.fillStyle="#808080",e.fillRect(0,0,128,128);let i=1337,s=()=>(i=i*16807%2147483647,(i-1)/2147483646);for(let r=0;r<128;r+=2)for(let o=0;o<128;o+=2){let a=Math.round(116+s()*24);e.fillStyle=`rgb(${a},${a},${a})`,e.fillRect(o,r,2,2)}}let t=new sr(n);return t.wrapS=fs,t.wrapT=fs,t.repeat.set(4,4),t}function ww(){let n=document.createElement("canvas");n.width=128,n.height=128;let e=n.getContext("2d");if(e){let t=e.createRadialGradient(64,64,6,64,64,62);t.addColorStop(0,"rgba(8, 22, 26, 0.55)"),t.addColorStop(.55,"rgba(8, 22, 26, 0.22)"),t.addColorStop(1,"rgba(8, 22, 26, 0)"),e.fillStyle=t,e.fillRect(0,0,128,128)}return new sr(n)}function Ew(){let n=new qn(.68,32,28),e=n.attributes.position,t=n.attributes.uv,i=new k;for(let s=0;s<e.count;s++){i.fromBufferAttribute(e,s);let r=i.y/.68,o=i.z/.68;if(i.y*=1.18,r<-.1){let c=Math.min(1,(-r-.1)/.9),u=1-.26*c*c;i.x*=u,i.z*=1-.12*c,o>.2&&(i.z+=.045*(1-Math.abs(i.x)/.5)*c)}if(r>-.25&&r<.25&&o>.15){let c=Math.exp(-Math.pow((r+.02)/.22,2));i.x*=1+.05*c,i.z+=.03*c}r>.05&&r<.55&&(i.x*=.95),e.setXYZ(s,i.x,i.y,i.z);let a=Mi.clamp(.5+i.x/1.18,.02,.98),l=Mi.clamp(.52+i.y/1.52,.02,.98);t.setXY(s,a,l)}return n.computeVertexNormals(),n}function am({patientName:n,convergencePct:e,stageLabel:t,faceProfile:i,portraitDataUrl:s,isSpeaking:r,cadenceWpm:o=148,getAudioLevel:a}){let l=(0,Fn.useRef)(null),[c,u]=(0,Fn.useState)("portrait"),[h,d]=(0,Fn.useState)("auto"),[f,g]=(0,Fn.useState)(()=>typeof window<"u"?window.innerWidth<680:!1),y=(0,Fn.useRef)({convergencePct:e,faceProfile:i,isSpeaking:r,cadenceWpm:o,getAudioLevel:a,preset:c,renderStyle:h});y.current={convergencePct:e,faceProfile:i,isSpeaking:r,cadenceWpm:o,getAudioLevel:a,preset:c,renderStyle:h};let m=(0,Fn.useRef)(null);return(0,Fn.useEffect)(()=>{let p=l.current;if(!p)return;let A=Math.max(280,p.clientWidth||560),C=Math.max(280,p.clientHeight||380),v;try{v=new Ql({antialias:!0,powerPreference:"high-performance"})}catch{return}let M=Sw(v);v.setPixelRatio(M?1:Math.min(window.devicePixelRatio||1,2)),v.setSize(A,C,!1),v.outputColorSpace=$t,v.toneMapping=fl,v.toneMappingExposure=1.08,v.shadowMap.enabled=!M,v.shadowMap.type=rl,p.innerHTML="",p.appendChild(v.domElement);let E=new gs,b=726553;E.background=new Ze(b),E.fog=new ia(b,.085);let R=new gr(v),_=new ec,x=R.fromScene(_,.04);E.environment=x.texture,_.dispose(),R.dispose();let L=new Gt(34,A/C,.1,30);L.position.set(.42,1.28,4.35),L.lookAt(0,1.18,0);let V=new da(14283519,1583149,.85);E.add(V);let F=new cr(16773596,1.85);F.position.set(2.2,3.4,2.8),M||(F.castShadow=!0,F.shadow.mapSize.set(1024,1024),F.shadow.camera.near=.5,F.shadow.camera.far=9,F.shadow.camera.left=-1.6,F.shadow.camera.right=1.6,F.shadow.camera.top=2.4,F.shadow.camera.bottom=-.5,F.shadow.bias=-5e-4),E.add(F);let I=new cr(2941158,1.15);I.position.set(-2.4,2,-1.9),E.add(I);let O=0,P=new Vi(6,32),B=new Ot({color:924961,roughness:.9,metalness:.1}),H=new Be(P,B);H.rotation.x=-Math.PI/2,H.position.y=O,H.receiveShadow=!M,E.add(H);let ee=ww(),se=new Vi(1.18,28),he=new Sn({map:ee,transparent:!0,opacity:.5,depthWrite:!1}),Me=new Be(se,he);Me.rotation.x=-Math.PI/2,Me.position.y=O+.016,E.add(Me);let Ne=new rn;Ne.position.y=O,E.add(Ne);let Z=new _i(.72,.82,.18,32),oe=new Ot({color:1451563,roughness:.42,metalness:.65}),me=new Be(Z,oe);me.position.y=.09,me.castShadow=!M,me.receiveShadow=!M,Ne.add(me);let ce=new ar(.76,.018,12,48),Re=new Ot({color:2083023,emissive:752256,emissiveIntensity:.65,roughness:.22,metalness:.5}),Le=new Be(ce,Re);Le.rotation.x=Math.PI/2,Le.position.y=.185,Ne.add(Le);let Ye=new _i(.36,.66,.62,28,1),nt=new Ot({color:1847608,roughness:.78,metalness:.12}),ze=new Be(Ye,nt);ze.scale.set(1.26,1,.72),ze.position.y=.49,ze.castShadow=!M,Ne.add(ze);let dt=Mw(),U=new Ot({color:13210740,roughness:.62,metalness:.05,bumpMap:dt,bumpScale:.008}),Rt=new _i(.21,.25,.36,24),qe=new Be(Rt,U);qe.position.set(0,.92,-.02),qe.castShadow=!M,Ne.add(qe);let He=new rn;He.position.set(0,1.46,0),Ne.add(He);let ge=new rn;He.add(ge);let lt=Ew(),Ee=new Ot({color:13210740,roughness:.56,metalness:.04,bumpMap:dt,bumpScale:.007}),N=new Be(lt,Ee);N.castShadow=!M,ge.add(N);let w=new Sn({color:3530982,wireframe:!0,transparent:!0,opacity:.35,depthWrite:!1}),Y=new Be(lt,w);Y.scale.setScalar(1.014),ge.add(Y);let ne=new rn;ge.add(ne);let re=new Ot({color:1906710,roughness:.84,metalness:.06}),te=new qn(.705,28,20,0,Math.PI*2,0,Math.PI*.58),Ce=new Be(te,re);Ce.scale.set(1.02,1.18,1.04),Ce.position.set(0,.05,-.05),Ce.rotation.x=-.22,ne.add(Ce);let fe=new Hi(.16,.46,8,14),J=new Be(fe,re);J.position.set(-.56,-.14,-.08),J.rotation.z=.12;let de=new Be(fe,re);de.position.set(.56,-.14,-.08),de.rotation.z=-.12,ne.add(J,de);let j=new qn(.24,18,14),ae=new Be(j,re);ae.position.set(0,.68,-.44),ne.add(ae);let we=new ca(.085,.28,14),Ie=new Be(we,U);Ie.position.set(0,-.02,.67),Ie.rotation.x=.28,Ie.scale.set(.85,1,1.1),ge.add(Ie);let pe=new qn(.13,14,12),$e=new Be(pe,U);$e.scale.set(.42,1.15,.72),$e.position.set(-.65,-.02,-.02);let We=new Be(pe,U);We.scale.set(.42,1.15,.72),We.position.set(.65,-.02,-.02),ge.add($e,We);let it=new qn(.088,16,14),G=new Ot({color:16251386,roughness:.12,metalness:.02}),ye=new Vi(.046,18),Q=new Ot({color:3877406,roughness:.22,metalness:.08}),ie=new Vi(.021,14),_e=new Sn({color:592652}),xe=new qn(.093,16,10,0,Math.PI*2,0,Math.PI*.52),Xe=ut=>{let Fe=new rn;Fe.position.set(ut*.23,.11,.56);let Tt=new Be(it,G);Tt.scale.set(1.12,.92,.75),Fe.add(Tt);let wt=new Be(ye,Q);wt.position.z=.068,Fe.add(wt);let _t=new Be(ie,_e);_t.position.z=.071,Fe.add(_t);let on=new Be(xe,U);return on.scale.set(1.14,.95,.8),on.rotation.x=-.35,Fe.add(on),{group:Fe,lid:on}},ve=Xe(-1),St=Xe(1);ge.add(ve.group,St.group);let st=new Hi(.024,.16,6,10),It=new Be(st,re);It.rotation.z=Math.PI/2-.08,It.position.set(-.23,.24,.61);let Bt=new Be(st,re);Bt.rotation.z=Math.PI/2+.08,Bt.position.set(.23,.24,.61),ge.add(It,Bt);let an=new rn;an.visible=!1;let kn=new Ot({color:2503224,roughness:.28,metalness:.78}),Jt=new ar(.135,.012,10,28),D=new Be(Jt,kn);D.position.set(-.23,.11,.65);let le=new Be(Jt,kn);le.position.set(.23,.11,.65);let Ue=new _i(.01,.01,.19,8),gt=new Be(Ue,kn);gt.rotation.z=Math.PI/2,gt.position.set(0,.12,.65),an.add(D,le,gt),ge.add(an);let yt=new Ot({color:10903128,roughness:.42,metalness:.04}),ti=new Hi(.026,.17,6,12),$i=new Be(ti,yt);$i.rotation.z=Math.PI/2,$i.position.set(0,-.22,.62),ge.add($i);let _r=new ys(.2,.09),ic=new Sn({color:2362640}),Cs=new Be(_r,ic);Cs.position.set(0,-.255,.602),Cs.scale.set(1,.08,1),ge.add(Cs);let qi=new rn;qi.position.set(0,-.24,.42),ge.add(qi);let wa=new Hi(.028,.15,6,12),xr=new Be(wa,yt);xr.rotation.z=Math.PI/2,xr.position.set(0,-.035,.2),qi.add(xr);let sc=new ha,T=null;m.current=ut=>{if(!ut){T&&(T.dispose(),T=null),Ee.map=null,Ee.needsUpdate=!0;return}sc.load(ut,Fe=>{T&&T.dispose(),Fe.colorSpace=$t,Fe.anisotropy=v.capabilities.getMaxAnisotropy(),T=Fe,Ee.map=Fe,Ee.color.setHex(16777215),Ee.needsUpdate=!0},void 0,()=>{})},s&&m.current(s),M||v.compile(E,L);let W=new k,$=new k,q=new k(0,1.28,0),X=new Ze,ue=new Ze,be=new Ze,Te=new Ze,Ae=!1,Ve=0,Ge=0,ke=performance.now(),rt=0,Qe=0,ft=v.getContext(),Mt=ut=>{if(!Ae)if(M&&typeof ft.fenceSync=="function"){let Fe=ft.fenceSync(ft.SYNC_GPU_COMMANDS_COMPLETE,0);ft.flush();let Tt=()=>{if(Ae)return;if(!Fe){Ve=requestAnimationFrame(ut);return}let wt=ft.clientWaitSync(Fe,0,0);wt===ft.ALREADY_SIGNALED||wt===ft.CONDITION_SATISFIED?(ft.deleteSync(Fe),Ve=requestAnimationFrame(ut)):Ge=window.setTimeout(Tt,12)};Ge=window.setTimeout(Tt,8)}else Ve=requestAnimationFrame(ut)},at=()=>{if(Ae)return;let ut=performance.now(),Fe=Math.min(.1,Math.max(.001,(ut-ke)/1e3));ke=ut;let Tt=ut*.001,wt=y.current,_t=1-Math.exp(-5.5*Fe),on=L.aspect<1.15?(1.15-L.aspect)*1.35:0;wt.preset==="front"?(W.set(0,1.28,4.25+on),$.set(0,1.18,0)):wt.preset==="closeup"?(W.set(.12,1.42,2.95+on*.75),$.set(0,1.38,.12)):(W.set(.52,1.31,4.2+on),$.set(0,1.18,0)),L.position.lerp(W,_t),q.lerp($,_t),L.lookAt(q);let tt=wt.faceProfile;if(tt){X.set(tt.skin_tone_hex||"#c99474"),ue.set(tt.hair_color_hex||"#1d1816"),be.set(tt.eye_color_hex||"#3b2a1e"),Te.set(tt.lip_color_hex||"#a65e58"),U.color.lerp(X,_t),Ee.map?Ee.color.setHex(16777215):Ee.color.lerp(X,_t),re.color.lerp(ue,_t),Q.color.lerp(be,_t),yt.color.lerp(Te,_t);let Rs=Mi.clamp(tt.face_width_ratio/.78,.88,1.14);ge.scale.set(Rs,1,1);let Ta=Mi.clamp(tt.brow_arch,0,1);It.rotation.z=Math.PI/2-(.04+Ta*.14),Bt.rotation.z=Math.PI/2+(.04+Ta*.14),an.visible=!!tt.glasses;let Sh=tt.hair_style==="long"||tt.hair_style==="medium"||tt.hair_style==="curly";J.visible=Sh,de.visible=Sh,ae.visible=tt.hair_style==="bun"||tt.hair_style==="long"}else J.visible=!0,de.visible=!0,ae.visible=!1,an.visible=!1;let ln=Mi.clamp(wt.convergencePct/100,0,1);if(wt.renderStyle==="hologram")w.opacity=.62,Y.visible=!0;else if(wt.renderStyle==="studio")w.opacity=.03,Y.visible=!1;else{let Rs=Math.max(.04,.56*(1-ln*.92));w.opacity=Mi.lerp(w.opacity,Rs,_t),Y.visible=w.opacity>.05}let Qt=0;if(wt.isSpeaking){rt+=Fe;let Rs=wt.getAudioLevel?wt.getAudioLevel():0,Ta=gf(rt,wt.cadenceWpm);Qt=Rs>.04?Math.min(1,Rs*1.65):Ta}else rt=0;Qe=Mi.lerp(Qe,Qt,1-Math.exp(-18*Fe)),qi.rotation.x=Qe*.28,qi.position.y=-.24-Qe*.042,Cs.scale.y=.08+Qe*1.25,$i.scale.x=1-Qe*.08;let zt=wt.isSpeaking?Math.sin(Tt*5.2)*.035*(.4+Qe):0;He.rotation.y=Math.sin(Tt*.65)*.085,He.rotation.x=Math.sin(Tt*.9)*.022+zt,He.position.y=1.46+Math.sin(Tt*1.4)*.009;let Ht=Tt%4.2,On=-.35+(Ht>3.98?Math.sin((Ht-3.98)/.22*Math.PI):0)*.95;ve.lid.rotation.x=On,St.lid.rotation.x=On,Re.emissiveIntensity=.55+Qe*1.45,Le.scale.setScalar(1+Qe*.045),v.render(E,L),Mt(at)},Oe=new ResizeObserver(ut=>{let Fe=ut[0]?.contentRect;!Fe||Fe.width<80||Fe.height<80||(L.aspect=Fe.width/Fe.height,L.updateProjectionMatrix(),v.setSize(Fe.width,Fe.height,!1))});return Oe.observe(p),at(),()=>{Ae=!0,cancelAnimationFrame(Ve),clearTimeout(Ge),Oe.disconnect(),m.current=null,T&&T.dispose(),x.dispose(),dt.dispose(),ee.dispose(),lt.dispose(),Z.dispose(),ce.dispose(),Ye.dispose(),Rt.dispose(),te.dispose(),fe.dispose(),j.dispose(),we.dispose(),pe.dispose(),it.dispose(),ye.dispose(),ie.dispose(),xe.dispose(),st.dispose(),Jt.dispose(),Ue.dispose(),ti.dispose(),_r.dispose(),wa.dispose(),P.dispose(),se.dispose(),v.dispose()}},[]),(0,Fn.useEffect)(()=>{m.current&&m.current(s)},[s]),(0,Zt.jsxs)("div",{className:"mx-preserve-stage-shell","data-testid":"preserve-3d-stage","data-convergence":e,"data-speaking":r?"true":"false",children:[(0,Zt.jsx)("div",{ref:l,className:"mx-preserve-canvas-mount"}),(0,Zt.jsxs)("div",{className:"mx-preserve-hud-top",children:[(0,Zt.jsxs)("div",{className:"mx-preserve-score-chip",children:[(0,Zt.jsxs)("b",{children:[e,"% Preserved"]}),(0,Zt.jsxs)("small",{children:[n," \xB7 ",t]})]}),r?(0,Zt.jsx)("span",{className:"mx-preserve-speaking-tag",role:"status",children:"Speaking in preserved voice"}):null]}),(0,Zt.jsxs)("div",{className:`mx-preserve-dock${f?" is-collapsed":""}`,children:[!f&&(0,Zt.jsxs)("div",{className:"mx-preserve-dock-controls",children:[(0,Zt.jsx)("div",{className:"mx-preserve-seg",role:"group","aria-label":"Camera angle",children:[["portrait","3/4 View"],["front","Front"],["closeup","Close-up"]].map(([p,A])=>(0,Zt.jsx)("button",{type:"button","aria-pressed":c===p,onClick:()=>u(p),children:A},p))}),(0,Zt.jsx)("div",{className:"mx-preserve-seg",role:"group","aria-label":"3D surface mode",children:[["auto","Auto Convergence"],["studio","3D Likeness"],["hologram","Mesh Wireframe"]].map(([p,A])=>(0,Zt.jsx)("button",{type:"button","aria-pressed":h===p,onClick:()=>d(p),children:A},p))})]}),(0,Zt.jsx)("button",{type:"button",className:"mx-preserve-dock-toggle",onClick:()=>g(p=>!p),"aria-expanded":!f,"aria-label":f?"Show 3D controls":"Hide 3D controls",children:f?"Controls \u25B2":"Hide \u25BC"})]})]})}var K=ht(At(),1),Cw={},gh="mx-preserve-face-v1",yh="mx-preserve-photo-v1",vh="mx-preserve-photo-count-v1",tc="mx-preserve-voice-v1",nc="mx-preserve-memories-v1",_h="mx-preserve-turns-v1",om="mx-preserve-interest",Tw=typeof Cw<"u"&&""||"";function xh(n,e){return`${(Tw||e||"").replace(/\/$/,"")}${n}`}function lm(n){return new Promise((e,t)=>{let i=new FileReader;i.onload=()=>typeof i.result=="string"?e(i.result):t(new Error("Could not read file")),i.onerror=()=>t(new Error("Failed to read file")),i.readAsDataURL(n)})}function bh(n){let e=n.indexOf(",");return e>=0?n.slice(e+1):n}function Aw(n,e=512){return new Promise((t,i)=>{let s=new Image,r=URL.createObjectURL(n);s.onload=()=>{URL.revokeObjectURL(r);let o=Math.min(1,e/Math.max(s.width||1,s.height||1)),a=Math.max(64,Math.round(s.width*o)),l=Math.max(64,Math.round(s.height*o)),c=document.createElement("canvas");c.width=a,c.height=l;let u=c.getContext("2d");if(!u){i(new Error("Canvas context unavailable"));return}u.drawImage(s,0,0,a,l),t(c.toDataURL("image/jpeg",.86))},s.onerror=()=>{URL.revokeObjectURL(r),i(new Error("Invalid image file"))},s.src=r})}function cm({b:n,host:e}){let t=n?.patient?.preferred_name||"Member",i=n?.preserve||{},s=e.Hero,[r,o]=(0,ot.useState)(()=>e.readStore(gh,null)),[a,l]=(0,ot.useState)(()=>e.readStore(yh,null)),[c,u]=(0,ot.useState)(()=>e.readStore(vh,0)),[h,d]=(0,ot.useState)(()=>e.readStore(tc,null)),[f,g]=(0,ot.useState)(()=>e.readStore(nc,["I value calm, clear thinking, long walks outdoors, and taking steady care of my family and long-term health."])),[y,m]=(0,ot.useState)(()=>e.readStore(_h,[]));(0,ot.useEffect)(()=>{o(e.readStore(gh,null)),l(e.readStore(yh,null)),u(e.readStore(vh,0)),d(e.readStore(tc,null)),g(e.readStore(nc,["I value calm, clear thinking, long walks outdoors, and taking steady care of my family and long-term health."])),m(e.readStore(_h,[]))},[n,e]);let[p,A]=(0,ot.useState)(!1),[C,v]=(0,ot.useState)(null),[M,E]=(0,ot.useState)(!1),[b,R]=(0,ot.useState)(null),[_,x]=(0,ot.useState)(""),[L,V]=(0,ot.useState)(`Hi, I\u2019m ${t}. When things get busy, I like to take a breath, look at the facts clearly, and take one steady step at a time.`),[F,I]=(0,ot.useState)(!1),O=(0,ot.useRef)(null),P=(0,ot.useRef)([]),[B,H]=(0,ot.useState)(""),[ee,se]=(0,ot.useState)(!1),[he,Me]=(0,ot.useState)(null),[Ne,Z]=(0,ot.useState)(!1),[oe,me]=(0,ot.useState)(""),[ce,Re]=(0,ot.useState)(()=>{try{return JSON.parse(localStorage.getItem(om)||"[]")}catch{return[]}}),[Le,Ye]=(0,ot.useState)(!1),nt=(0,ot.useRef)(null),ze=(0,ot.useRef)(null),dt=(0,ot.useRef)(null),U=(0,ot.useRef)(null),Rt=(0,ot.useRef)(0);(0,ot.useEffect)(()=>{V(`Hi, I\u2019m ${t}. When things get busy, I like to take a breath, look at the facts clearly, and take one steady step at a time.`)},[t]),(0,ot.useEffect)(()=>()=>{window.clearTimeout(Rt.current),nt.current&&(nt.current.pause(),nt.current=null),ze.current&&ze.current.state!=="closed"&&ze.current.close().catch(()=>{})},[]);let qe=()=>{let J=dt.current,de=U.current;if(!J||!de)return 0;J.getByteFrequencyData(de);let j=0,ae=Math.min(36,de.length);for(let we=1;we<ae;we++)j+=de[we];return ae>1?j/((ae-1)*255):0},He=async(J,de)=>{window.clearTimeout(Rt.current),nt.current&&(nt.current.pause(),nt.current=null);let j=Math.max(2600,Math.min(14e3,de.split(/\s+/).length*380));if(!J){Z(!0),Rt.current=window.setTimeout(()=>{Z(!1)},j);return}try{let ae=new Audio(`data:audio/wav;base64,${J}`);nt.current=ae;let we=window.AudioContext||window.webkitAudioContext;if(we){(!ze.current||ze.current.state==="closed")&&(ze.current=new we),ze.current.state==="suspended"&&await ze.current.resume().catch(()=>{});let Ie=ze.current.createMediaElementSource(ae),pe=ze.current.createAnalyser();pe.fftSize=128,pe.smoothingTimeConstant=.65,Ie.connect(pe),pe.connect(ze.current.destination),dt.current=pe,U.current=new Uint8Array(new ArrayBuffer(pe.frequencyBinCount))}ae.onended=()=>{Z(!1)},ae.onerror=()=>{Z(!1)},Z(!0),await ae.play()}catch{Z(!0),Rt.current=window.setTimeout(()=>{Z(!1)},j)}},ge=(0,ot.useMemo)(()=>pf({hasTwinRecord:!!n?.patient,faceLikenessScore:r?.likeness_score??0,voiceFidelityScore:h?.fidelity_score??0,memoriesCount:f.length}),[n,r,h,f.length]),lt=async J=>{A(!0),v(null);try{let de=await Aw(J,512),j=c+1,ae=await fetch(xh("/v1/preserve/face-analyze",e.apiBase),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image_base64:bh(de),mime_type:"image/jpeg",photo_count:j})});if(!ae.ok)throw new Error(`Face likeness analysis returned ${ae.status}`);let we=await ae.json();l(de),o(we),u(j),e.writeStore(yh,de),e.writeStore(gh,we),e.writeStore(vh,j)}catch(de){v(de?.message||"Could not analyze portrait photo right now.")}finally{A(!1)}},Ee=async()=>{A(!0),v(null);try{let J=await fetch("./sample-portrait.jpg",{cache:"no-store"});if(!J.ok)throw new Error("Sample portrait asset not found");let de=await J.blob();await lt(de)}catch(J){A(!1),v(J?.message||"Could not load sample portrait.")}},N=async(J,de,j)=>{E(!0),R(null);try{let ae=(h?.sample_count||0)+1,we=await fetch(xh("/v1/preserve/voice-train",e.apiBase),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({audio_base64:J,mime_type:de,transcript_hint:j,patient_name:t,sample_count:ae,existing_profile:h||void 0})});if(!we.ok)throw new Error(`Voice model training returned ${we.status}`);let Ie=await we.json();x(Ie.transcript||j),d(Ie.profile),e.writeStore(tc,Ie.profile)}catch(ae){R(ae?.message||"Could not train voice persona right now.")}finally{E(!1)}},w=async()=>{if(F&&O.current){O.current.stop(),I(!1);return}if(R(null),!navigator.mediaDevices?.getUserMedia){R("Microphone access is unavailable in this browser. Upload an audio clip or use the sample voice clip.");return}try{let J=await navigator.mediaDevices.getUserMedia({audio:!0});P.current=[];let de=new MediaRecorder(J);O.current=de,de.ondataavailable=j=>{j.data&&j.data.size>0&&P.current.push(j.data)},de.onstop=async()=>{J.getTracks().forEach(Ie=>Ie.stop());let j=de.mimeType||"audio/webm",ae=new Blob(P.current,{type:j}),we=await lm(ae);await N(bh(we),j,L)},de.start(),I(!0)}catch{R("Microphone permission was declined or unavailable. Try uploading audio or calibrating with the sample clip.")}},Y=async()=>{let J=mf(.85);await N(J,"audio/wav",L)},ne=async J=>{let de=(J??B).trim();if(!(!de||ee)){H(""),se(!0),Me(null);try{let j=await fetch(xh("/v1/preserve/speak",e.apiBase),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:de,patient_name:t,bundle:n,voice_profile:h||void 0,memories:f})});if(!j.ok)throw new Error(`Preserved Twin speech returned ${j.status}`);let ae=await j.json(),Ie=[{id:`pt-${Date.now()}`,at:new Date().toISOString(),prompt:de,reply:ae.reply_text,voiceUsed:ae.voice_used,styleUsed:ae.style_used,audioWavBase64:ae.audio_wav_base64},...y].slice(0,8);m(Ie),e.writeStore(_h,Ie);let pe=h||{vocal_style:ae.style_used||"warm, calm, conversational",prebuilt_voice:ae.voice_used||"Kore",cadence_wpm:148,warmth:84,clarity:88,signature_phrases:["take one steady step at a time"],sample_count:0,fidelity_score:48,summary:`Conversational voice persona calibrated from ${t}'s speech turns.`},$e={...pe,sample_count:pe.sample_count+1,fidelity_score:Math.max(pe.fidelity_score,ae.updated_fidelity||pe.fidelity_score+5)};d($e),e.writeStore(tc,$e),await He(ae.audio_wav_base64,ae.reply_text)}catch(j){Me(j?.message||"Could not synthesize preserved speech right now.")}finally{se(!1)}}},re=J=>{J.preventDefault();let de=oe.trim();if(!de)return;let j=[de,...f];g(j),e.writeStore(nc,j),me("")},te=J=>{Re(de=>de.includes(J)?de.filter(j=>j!==J):[...de,J]),Ye(!1)},Ce=()=>{try{localStorage.setItem(om,JSON.stringify(ce))}catch{}Ye(!0)},fe=["How am I taking care of my health and energy these days?","Share a calm reminder in my voice for a stressful week.","What matters most to me as I look ahead?"];return(0,K.jsxs)(K.Fragment,{children:[s?(0,K.jsx)(s,{title:"Preserve yourself",illus:"preserve",sub:"Train your AI voice model, project your portrait into 3D, and build a living likeness that speaks and looks like you."}):(0,K.jsx)("h1",{children:"Preserve yourself"}),(0,K.jsxs)("section",{className:"card mx-preserve-studio-card","aria-label":"3D Preserved Self Studio",children:[(0,K.jsxs)("div",{className:"sec",children:[(0,K.jsxs)("div",{children:[(0,K.jsx)("span",{className:"mx-eyebrow",children:"Gemini Voice + Vision + Three.js 3D"}),(0,K.jsxs)("h2",{children:[t,"\u2019s Living 3D Digital Self"]})]}),(0,K.jsxs)("span",{className:`state ${ge.totalPct>=60?"ok":"warn"}`,children:[(0,K.jsx)("i",{}),ge.totalPct,"% converged"]})]}),(0,K.jsx)(am,{patientName:t,convergencePct:ge.totalPct,stageLabel:ge.stageLabel,faceProfile:r,portraitDataUrl:a,isSpeaking:Ne,cadenceWpm:h?.cadence_wpm||148,getAudioLevel:qe}),(0,K.jsxs)("div",{className:"mx-preserve-pillars",children:[(0,K.jsxs)("div",{className:"mx-pillar-tile on",children:[(0,K.jsx)("small",{children:"Biological Twin"}),(0,K.jsxs)("b",{children:[ge.twinBasePct,"% / 25%"]}),(0,K.jsx)("span",{children:"Labs, organs & health history active"})]}),(0,K.jsxs)("div",{className:`mx-pillar-tile${r?" on":""}`,children:[(0,K.jsx)("small",{children:"3D Face Likeness"}),(0,K.jsxs)("b",{children:[ge.facePct,"% / 35%"]}),(0,K.jsx)("span",{children:r?`${c} photo${c===1?"":"s"} \xB7 ${r.likeness_score}% match`:"Add portrait photo to sculpt"})]}),(0,K.jsxs)("div",{className:`mx-pillar-tile${h?" on":""}`,children:[(0,K.jsx)("small",{children:"AI Voice Persona"}),(0,K.jsxs)("b",{children:[ge.voicePct,"% / 35%"]}),(0,K.jsx)("span",{children:h?`${h.prebuilt_voice} \xB7 ${h.fidelity_score}% fidelity`:"Record or train voice model"})]}),(0,K.jsxs)("div",{className:`mx-pillar-tile${f.length>0?" on":""}`,children:[(0,K.jsx)("small",{children:"Memories & Values"}),(0,K.jsxs)("b",{children:[ge.memoriesBonusPct,"% / 5%"]}),(0,K.jsxs)("span",{children:[f.length," personal note",f.length===1?"":"s"," stored"]})]})]})]}),(0,K.jsxs)("div",{className:"grid2 mx-preserve-grid",children:[(0,K.jsxs)("section",{className:"card mx-preserve-card",children:[(0,K.jsxs)("div",{className:"sec",children:[(0,K.jsxs)("div",{children:[(0,K.jsx)("span",{className:"mx-eyebrow",children:"Step 1 \xB7 Visual Likeness"}),(0,K.jsx)("h3",{children:"3D Face & Portrait Model"})]}),r?(0,K.jsxs)("span",{className:"state ok",children:[(0,K.jsx)("i",{}),r.likeness_score,"% likeness"]}):null]}),(0,K.jsx)("p",{className:"note",children:"Upload a front-facing photo. Gemini Vision extracts your cranial proportions, skin/eye/hair palette, and projects your portrait onto the 3D mesh."}),(0,K.jsxs)("div",{className:"mx-preserve-photo-row",children:[a?(0,K.jsx)("img",{src:a,alt:`${t} uploaded portrait`,className:"mx-preserve-thumb"}):(0,K.jsx)("div",{className:"mx-preserve-thumb placeholder","aria-hidden":"true",children:"3D"}),(0,K.jsxs)("div",{className:"mx-preserve-photo-actions",children:[(0,K.jsxs)("label",{className:"secondary sm mx-file-btn",children:[(0,K.jsx)("span",{children:a?"Add another photo":"Upload portrait photo"}),(0,K.jsx)("input",{type:"file",accept:"image/png,image/jpeg,image/webp",disabled:p,onChange:J=>{let de=J.target.files?.[0];de&&lt(de)}})]}),(0,K.jsx)("button",{type:"button",className:"link",disabled:p,onClick:()=>void Ee(),children:p?"Analyzing likeness\u2026":"Use sample portrait"})]})]}),C&&(0,K.jsx)("p",{className:"note mx-err-note",role:"alert",children:C}),r&&(0,K.jsxs)("div",{className:"mx-likeness-meta",children:[(0,K.jsx)("p",{className:"note",children:r.likeness_summary}),(0,K.jsxs)("div",{className:"mx-swatch-row",children:[(0,K.jsxs)("span",{children:[(0,K.jsx)("i",{style:{background:r.skin_tone_hex}}),"Skin"]}),(0,K.jsxs)("span",{children:[(0,K.jsx)("i",{style:{background:r.hair_color_hex}}),"Hair (",r.hair_style,")"]}),(0,K.jsxs)("span",{children:[(0,K.jsx)("i",{style:{background:r.eye_color_hex}}),"Iris"]})]})]})]}),(0,K.jsxs)("section",{className:"card mx-preserve-card",children:[(0,K.jsxs)("div",{className:"sec",children:[(0,K.jsxs)("div",{children:[(0,K.jsx)("span",{className:"mx-eyebrow",children:"Step 2 \xB7 Gemini Audio + TTS"}),(0,K.jsx)("h3",{children:"AI Voice Model Trainer"})]}),h?(0,K.jsxs)("span",{className:"state ok",children:[(0,K.jsx)("i",{}),h.fidelity_score,"% fidelity"]}):null]}),(0,K.jsx)("p",{className:"note",children:"Speak or upload a short clip. Gemini 3.5 Transcribe + Gemini 4 analyze your cadence, warmth, and phrasing so your twin talks like you."}),(0,K.jsxs)("label",{className:"feed-f",children:[(0,K.jsx)("span",{children:"Calibration passage (read aloud or customize)"}),(0,K.jsx)("textarea",{rows:2,value:L,onChange:J=>V(J.target.value)})]}),(0,K.jsxs)("div",{className:"mx-voice-btn-row",children:[(0,K.jsx)("button",{type:"button",className:F?"primary sm":"secondary sm",disabled:M,onClick:()=>void w(),children:F?"\u25A0 Stop & train":"\u25CF Record voice"}),(0,K.jsxs)("label",{className:"secondary sm mx-file-btn",children:[(0,K.jsx)("span",{children:"Upload audio"}),(0,K.jsx)("input",{type:"file",accept:"audio/*",disabled:M,onChange:async J=>{let de=J.target.files?.[0];if(!de)return;let j=await lm(de);await N(bh(j),de.type||"audio/wav",L)}})]}),(0,K.jsx)("button",{type:"button",className:"link",disabled:M,onClick:()=>void Y(),children:M?"Training voice model\u2026":"Calibrate with sample voice clip"})]}),b&&(0,K.jsx)("p",{className:"note mx-err-note",role:"alert",children:b}),h&&(0,K.jsxs)("div",{className:"mx-voice-profile-box","data-testid":"voice-profile-summary",children:[(0,K.jsxs)("div",{className:"mx-voice-stats",children:[(0,K.jsxs)("span",{children:[(0,K.jsx)("small",{children:"Matched Timbre"}),(0,K.jsx)("b",{children:h.prebuilt_voice})]}),(0,K.jsxs)("span",{children:[(0,K.jsx)("small",{children:"Cadence"}),(0,K.jsxs)("b",{children:[h.cadence_wpm," WPM"]})]}),(0,K.jsxs)("span",{children:[(0,K.jsx)("small",{children:"Warmth / Clarity"}),(0,K.jsxs)("b",{children:[h.warmth,"% \xB7 ",h.clarity,"%"]})]}),(0,K.jsxs)("span",{children:[(0,K.jsx)("small",{children:"Voice Samples"}),(0,K.jsx)("b",{children:h.sample_count})]})]}),(0,K.jsxs)("p",{className:"note",children:[(0,K.jsx)("b",{children:"Learned style:"})," ",h.vocal_style,". ",h.summary]}),_&&(0,K.jsxs)("p",{className:"note",children:[(0,K.jsx)("b",{children:"Latest transcript:"})," \u201C",_,"\u201D"]})]})]})]}),(0,K.jsxs)("section",{className:"card mx-preserve-talk-card","aria-label":"Talk with your preserved twin",children:[(0,K.jsxs)("div",{className:"sec",children:[(0,K.jsxs)("div",{children:[(0,K.jsx)("span",{className:"mx-eyebrow",children:"Step 3 \xB7 Live First-Person Synthesis"}),(0,K.jsx)("h2",{children:"Speak with your preserved self"})]}),Ne?(0,K.jsxs)("span",{className:"state ok",children:[(0,K.jsx)("i",{}),"Voice active"]}):null]}),(0,K.jsx)("p",{className:"note",children:"Ask your preserved twin anything. Each conversation refines your vocal persona and speaks back in first person with synchronized 3D lip movement."}),(0,K.jsxs)("form",{className:"ask-in mx-preserve-ask",onSubmit:J=>{J.preventDefault(),ne()},children:[(0,K.jsx)("input",{value:B,onChange:J=>H(J.target.value),placeholder:`Say something to ${t}\u2019s preserved twin\u2026`,"aria-label":"Prompt your preserved twin"}),(0,K.jsx)("button",{type:"submit",className:"primary sm",disabled:!B.trim()||ee,children:ee?"Synthesizing\u2026":"Speak"})]}),(0,K.jsx)("div",{className:"suggest",children:fe.map(J=>(0,K.jsx)("button",{type:"button",disabled:ee,onClick:()=>void ne(J),children:J},J))}),he&&(0,K.jsx)("p",{className:"note mx-err-note",role:"alert",children:he}),y.length>0&&(0,K.jsx)("div",{className:"mx-preserve-turns",children:y.map(J=>(0,K.jsxs)("div",{className:"mx-preserve-turn",children:[(0,K.jsxs)("div",{className:"mx-preserve-turn-q",children:[(0,K.jsx)("small",{children:"You asked"}),(0,K.jsx)("p",{children:J.prompt})]}),(0,K.jsxs)("div",{className:"mx-preserve-turn-a",children:[(0,K.jsxs)("div",{className:"sec",children:[(0,K.jsxs)("small",{children:[t,"\u2019s Preserved Twin \xB7 ",J.voiceUsed," (",J.styleUsed,")"]}),(0,K.jsx)("button",{type:"button",className:"link",onClick:()=>void He(J.audioWavBase64,J.reply),children:"\u25B6 Replay voice"})]}),(0,K.jsxs)("p",{children:["\u201C",J.reply,"\u201D"]})]})]},J.id))})]}),(0,K.jsxs)("section",{className:"card mx-preserve-card",children:[(0,K.jsxs)("div",{className:"sec",children:[(0,K.jsxs)("div",{children:[(0,K.jsx)("span",{className:"mx-eyebrow",children:"Autobiographical Context"}),(0,K.jsx)("h2",{children:"Memories, stories & life principles"})]}),(0,K.jsxs)("span",{className:"note",children:[f.length," saved"]})]}),(0,K.jsx)("p",{className:"note",children:"Add stories, lessons, or personal habits you want your preserved twin to carry forward."}),(0,K.jsxs)("form",{className:"ask-in",onSubmit:re,children:[(0,K.jsx)("input",{value:oe,onChange:J=>me(J.target.value),placeholder:"e.g. Every Sunday morning I call my parents after a walk\u2026","aria-label":"Add a personal memory or principle"}),(0,K.jsx)("button",{type:"submit",className:"secondary sm",disabled:!oe.trim(),children:"Save memory"})]}),(0,K.jsx)("ul",{className:"rs-rows",children:f.map((J,de)=>(0,K.jsxs)("li",{children:[(0,K.jsxs)("span",{children:[(0,K.jsxs)("b",{children:["Memory #",f.length-de]}),(0,K.jsx)("small",{children:J})]}),(0,K.jsx)("button",{type:"button",className:"link","aria-label":`Remove memory ${f.length-de}`,onClick:()=>{let j=f.filter((ae,we)=>we!==de);g(j),e.writeStore(nc,j)},children:"Remove"})]},`${de}-${J.slice(0,18)}`))})]}),Array.isArray(i.options)&&i.options.length>0&&(0,K.jsxs)("section",{className:"card mx-preserve-card",children:[(0,K.jsx)("h2",{children:"Long-term preservation preferences"}),(0,K.jsx)("p",{className:"note",children:"Choose which layers of your preserved profile remain active on this device or enrolled for clinical biobanking updates."}),(0,K.jsx)("div",{className:"pcards",children:i.options.map(J=>(0,K.jsxs)("label",{children:[(0,K.jsx)("input",{type:"checkbox",checked:ce.includes(J),onChange:()=>te(J)}),(0,K.jsx)("span",{children:J})]},J))}),(0,K.jsx)("button",{type:"button",className:"primary",disabled:!ce.length,onClick:Ce,children:"Save preservation preferences"}),Le&&(0,K.jsxs)("p",{className:"note",role:"status",children:["Saved preferences for: ",ce.join(", "),". Stored locally under your control."]})]})]})}var ei=ht(At(),1);function Rw({onCloseSheet:n,setDoctorMode:e}){let[t,i]=(0,um.useState)(!1),{navigate:s}=En(),r=(o,a)=>{typeof a=="boolean"&&e&&e(a),n&&n(),s(o)};return(0,ei.jsxs)(ei.Fragment,{children:[(0,ei.jsxs)("div",{className:"mx-switcher-extras",children:[(0,ei.jsx)("button",{type:"button",className:"secondary sm",onClick:()=>{try{localStorage.removeItem("mx-onb-flow-v1")}catch{}r("#/welcome",!1)},children:"+ Onboard a new person"}),(0,ei.jsx)("button",{type:"button",className:"secondary sm",onClick:()=>r("#/me/preserve",!1),children:"Preserve yourself (3D + Voice)"}),(0,ei.jsx)("button",{type:"button",className:"secondary sm",onClick:()=>i(!0),children:"1-Min Product Video & Sandbox"})]}),t&&(0,ei.jsx)(ao,{onClose:()=>i(!1),onNavigateSandbox:(o,a)=>{i(!1),r(o,a)}})]})}var hm={NavigationProvider:Lh,usePortalNavigation:En,BackButton:no,SubpageHeader:li,OnboardingFlow:ff,ProductTourModal:ao,AskPanel:af,ClinicianBriefingCard:of,KnowledgeGraphCard:to,FeedScreen:Oh,PreserveScreen:cm,SwitcherExtras:Rw};globalThis.__MX_PORTAL__=hm;var DC=hm;})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2024 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
