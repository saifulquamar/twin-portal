// src/app.ts
import fs2 from "node:fs";
import path2 from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";

// src/gemini.ts
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
function capWords(text, maxWords) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const words = cleaned.split(" ");
  if (words.length <= maxWords) return cleaned;
  const sliced = words.slice(0, maxWords).join(" ");
  const lastSentenceEnd = Math.max(
    sliced.lastIndexOf(". "),
    sliced.lastIndexOf("? "),
    sliced.lastIndexOf("! ")
  );
  if (lastSentenceEnd > sliced.length * 0.6) {
    return sliced.slice(0, lastSentenceEnd + 1).trim();
  }
  return sliced.replace(/[,;:\-–—]+$/, "").trim() + ".";
}
function extractJsonObject(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      try {
        return JSON.parse(fenced[1].trim());
      } catch {
      }
    }
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}
function enrichSourceUrls(sources, bundle) {
  const insights = Array.isArray(bundle?.insights) ? bundle.insights : [];
  return sources.map((src) => {
    if (src.url) return src;
    const combined = `${src.title || ""} ${src.detail || ""}`;
    const pmidMatch = combined.match(/PMID:\s*(\d{5,10})/i);
    if (pmidMatch) {
      return {
        ...src,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmidMatch[1]}/`
      };
    }
    if (src.finding_id) {
      const matchedIns = insights.find((i) => i?.id === src.finding_id);
      const firstPmid = matchedIns?.evidence?.flatMap((ev) => Array.isArray(ev?.sources) ? ev.sources : [])?.find((s) => /^PMID:\d+/i.test(String(s)));
      if (firstPmid && src.kind === "kg") {
        const id = String(firstPmid).replace(/^PMID:/i, "").trim();
        return { ...src, url: `https://pubmed.ncbi.nlm.nih.gov/${id}/` };
      }
    }
    return src;
  });
}
function extractGroundingWebSources(response) {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!Array.isArray(chunks)) return [];
  const seen = /* @__PURE__ */ new Set();
  const webSources = [];
  for (const chunk of chunks) {
    const web = chunk?.web;
    const uri = typeof web?.uri === "string" ? web.uri.trim() : "";
    if (!uri || seen.has(uri)) continue;
    seen.add(uri);
    let host2 = "";
    try {
      host2 = new URL(uri).hostname.replace(/^www\./, "");
    } catch {
      host2 = uri;
    }
    const rawTitle = typeof web?.title === "string" && web.title.trim() ? web.title.trim() : host2 || "Clinical Web Reference";
    webSources.push({
      kind: "web",
      title: rawTitle.slice(0, 90),
      detail: host2 && host2 !== rawTitle ? `Google Search \xB7 ${host2}` : "Google Search grounded evidence",
      url: uri
    });
  }
  return webSources;
}
function buildKnowledgeGraphSummary(bundle, clinical) {
  const parts = [];
  const patient = bundle?.patient || {};
  parts.push(`PATIENT PROFILE: ${patient.preferred_name || "Patient"}`);
  parts.push(`- DOB: ${patient.date_of_birth || "unknown"}, Sex: ${patient.sex || "unknown"}`);
  if (Array.isArray(patient.conditions) && patient.conditions.length) {
    parts.push(`- Conditions: ${patient.conditions.join("; ")}`);
  }
  if (Array.isArray(patient.medicines) && patient.medicines.length) {
    parts.push(`- Active Medications: ${patient.medicines.join("; ")}`);
  }
  if (Array.isArray(patient.supplements) && patient.supplements.length) {
    parts.push(`- Active Supplements: ${patient.supplements.join("; ")}`);
  }
  if (Array.isArray(patient.allergies) && patient.allergies.length) {
    parts.push(`- Allergies: ${patient.allergies.join("; ")}`);
  }
  const pendingFeed = Array.isArray(bundle?.pending_feed) ? bundle.pending_feed : [];
  if (pendingFeed.length > 0) {
    parts.push("\nNEWLY ADDED PATIENT REPORT / FEED ENTRIES (Awaiting care-team verification):");
    for (const entry of pendingFeed.slice(0, 20)) {
      const ext = entry?.extracted;
      if (ext && typeof ext === "object") {
        const prevStr = ext.prevValue != null ? ` [Previous twin value: ${ext.prevValue} ${ext.prevUnit || ext.unit || ""} on ${ext.prevDate || "prior"}, Change: ${ext.pctChange != null ? `${ext.pctChange > 0 ? "+" : ""}${Number(ext.pctChange).toFixed(1)}%` : "n/a"}]` : " [No prior twin value]";
        const flagStr = ext.flag ? ` (${String(ext.flag).toUpperCase()})` : "";
        parts.push(
          `- ${ext.name}: ${ext.value} ${ext.unit || ""}${flagStr} on ${entry.date || ext.date || "recent report"}${ext.range ? `, ref ${ext.range}` : ""}${prevStr}`
        );
      } else {
        parts.push(`- [${entry.kind || "entry"}] ${entry.title} (${entry.date || ""}${entry.detail ? ` \xB7 ${entry.detail}` : ""})`);
      }
    }
  }
  if (bundle?.latest_briefing?.patient || bundle?.latest_briefing?.clinician) {
    parts.push("\nRECENT REPORT BRIEFING SUMMARY:");
    if (bundle.latest_briefing.clinician) {
      parts.push(`- Clinical summary: ${bundle.latest_briefing.clinician}`);
    } else if (bundle.latest_briefing.patient) {
      parts.push(`- Summary: ${bundle.latest_briefing.patient}`);
    }
  }
  const labs = bundle?.labs;
  if (labs && typeof labs === "object") {
    const labLines = [];
    for (const [labName, arr] of Object.entries(labs)) {
      if (Array.isArray(arr) && arr.length > 0) {
        const latest = arr[arr.length - 1];
        const flagStr = latest?.flag ? ` [${String(latest.flag).toUpperCase()}]` : "";
        if (arr.length > 1) {
          const historyStr = arr.map((pt) => `${pt.value} (${pt.date})`).join(" -> ");
          labLines.push(`- ${labName}: latest ${latest.value} ${latest.unit || ""} on ${latest.date}${flagStr} | trend: ${historyStr}`);
        } else {
          labLines.push(`- ${labName}: ${latest.value} ${latest.unit || ""} on ${latest.date}${flagStr}`);
        }
      }
    }
    if (labLines.length > 0) {
      parts.push("\nVERIFIED TWIN LABS & LONGITUDINAL TRENDS:");
      parts.push(...labLines);
    }
  }
  const insights = Array.isArray(bundle?.insights) ? bundle.insights : [];
  if (insights.length > 0) {
    parts.push("\nVERIFIED KNOWLEDGE GRAPH FINDINGS (bundle.insights):");
    for (const ins of insights) {
      const pmids = (ins.evidence || []).flatMap((e) => e?.sources || []).slice(0, 4).join(", ");
      parts.push(
        `- [finding_id="${ins.id}"] ${ins.title} (Grade ${ins.certainty || "n/a"}${pmids ? `, Sources: ${pmids}` : ""})
  Found: ${ins.found || ""}
  Why: ${ins.why || ""}
  Action: ${ins.do || ""}`
      );
    }
  }
  const panel = Array.isArray(bundle?.panel) ? bundle.panel : [];
  if (panel.length > 0) {
    parts.push("\nPERSONALISED TEST PANEL & RECOMMENDED NEXT CHECKS:");
    for (const item of panel) {
      parts.push(
        `- ${item.test} [tier: ${item.tier}, already in record: ${item.already_have}]: ${item.why}`
      );
    }
  }
  const retests = Array.isArray(bundle?.refresh?.retests) ? bundle.refresh.retests : [];
  if (retests.length > 0) {
    parts.push(
      `
RETEST SCHEDULE WINDOWS: ${retests.slice(0, 10).map((r) => `${r.name} (${r.min_days}-${r.max_days}d)`).join("; ")}`
    );
  }
  const genes = Array.isArray(bundle?.genetics?.genes) ? bundle.genetics.genes : [];
  if (genes.length > 0) {
    const patientGenes = genes.filter((g) => g.role === "patient_variant" || g.gene === "SLCO1B1");
    if (patientGenes.length > 0) {
      parts.push(
        `
GENETIC & PGx CONTEXT: ${patientGenes.map((g) => `${g.gene} (${g.role})`).join(", ")}`
      );
    }
  }
  if (clinical && typeof clinical === "object") {
    parts.push("\nPHYSICIAN CLINICAL DOSSIER (CDSS):");
    if (Array.isArray(clinical.priorities) && clinical.priorities.length > 0) {
      parts.push(`- Clinical Priorities: ${clinical.priorities.join("; ")}`);
    }
    if (clinical.stats) {
      parts.push(`- Dossier Stats: ${JSON.stringify(clinical.stats)}`);
    }
    const sections = Array.isArray(clinical.sections) ? clinical.sections : [];
    for (const sec of sections.slice(0, 8)) {
      const blockSummaries = [];
      for (const blk of (sec.blocks || []).slice(0, 4)) {
        if (blk.kind === "text" && blk.text) {
          blockSummaries.push(String(blk.text).replace(/<[^>]+>/g, "").slice(0, 240));
        } else if (blk.kind === "list" && Array.isArray(blk.items)) {
          blockSummaries.push(
            (blk.h ? `${blk.h}: ` : "") + blk.items.slice(0, 5).map((it) => String(it).replace(/<[^>]+>/g, "").slice(0, 140)).join(" | ")
          );
        } else if (blk.kind === "table" && Array.isArray(blk.rows)) {
          const sampleRows = blk.rows.slice(0, 5).map(
            (r) => r.map((c) => String(c).replace(/<[^>]+>/g, "").slice(0, 80)).join(": ")
          ).join(" | ");
          blockSummaries.push(`${blk.h || sec.title}: ${sampleRows}`);
        }
      }
      if (blockSummaries.length > 0) {
        parts.push(`- Section [${sec.title}]: ${blockSummaries.join(" // ")}`);
      }
    }
  }
  return parts.join("\n");
}
var DefaultGeminiService = class {
  ai;
  model;
  constructor(apiKey = process.env.GEMINI_API_KEY || "", model = "gemini-4-hydrogen") {
    const trimmedKey = String(apiKey || "").trim();
    if (trimmedKey) {
      try {
        this.ai = new GoogleGenAI({
          apiKey: trimmedKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build"
            }
          }
        });
      } catch (err) {
        console.error("[Gemini init fallback]", err);
        this.ai = null;
      }
    } else {
      this.ai = null;
    }
    this.model = model;
  }
  generateLocalKgAnswer(params) {
    const qLower = params.question.toLowerCase();
    const isCdss = params.mode === "cdss";
    const words = qLower.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2);
    const bundle = params.bundle || {};
    const patient = bundle.patient || {};
    const name = patient.preferred_name || "the patient";
    const insights = Array.isArray(bundle.insights) ? bundle.insights : [];
    const labs = bundle.labs && typeof bundle.labs === "object" ? bundle.labs : {};
    const pendingFeed = Array.isArray(bundle.pending_feed) ? bundle.pending_feed : [];
    const panel = Array.isArray(bundle.panel) ? bundle.panel : [];
    const answerParts = [];
    const sources = [];
    const kidneyTerms = ["kidney", "kidneys", "renal", "egfr", "creatinine", "uacr", "albumin", "potassium", "urate"];
    const asksKidney = kidneyTerms.some((t) => qLower.includes(t));
    const asksNext = /next|check|order|test|panel|follow.?up/i.test(qLower);
    const matchingFeed = pendingFeed.filter((entry) => {
      const text = `${entry?.title || ""} ${entry?.detail || ""} ${entry?.extracted?.name || ""}`.toLowerCase();
      if (asksKidney && kidneyTerms.some((k) => text.includes(k))) return true;
      return words.some((w) => w.length > 3 && text.includes(w));
    });
    if (isCdss && asksNext) {
      const essentialNext = panel.filter((p) => p.tier === "essential" || p.already_have === "No").slice(0, 5);
      const feedSummary = pendingFeed.slice(0, 4).map((f) => f.title).join("; ");
      answerParts.push(
        `Findings: ${name} has ${(patient.conditions || []).slice(0, 3).join(", ") || "active cardiometabolic/renal monitoring"}.${feedSummary ? ` Pending patient-uploaded results: ${feedSummary}.` : ""}
Suggested next tests: ${essentialNext.length > 0 ? essentialNext.map((p) => `${p.test} (${p.why})`).join("; ") : "Repeat serum creatinine, eGFR, cystatin C, urine ACR, potassium, HbA1c, and fasting lipid panel with ApoB; obtain baseline urinalysis and creatine kinase prior to lipid-lowering therapy."}
Considerations: Verify potassium and renal trajectory on losartan and factor SLCO1B1 genotype into lipid therapy. For physician review.`
      );
      for (const p of essentialNext.slice(0, 3)) {
        sources.push({
          kind: "record",
          title: p.test,
          detail: p.why
        });
      }
      for (const ins of insights.slice(0, 2)) {
        sources.push({
          kind: "finding",
          title: String(ins.title || "").slice(0, 60),
          detail: String(ins.found || "").slice(0, 100),
          finding_id: ins.id
        });
      }
      return { answer: answerParts.join(""), sources: enrichSourceUrls(sources, bundle) };
    }
    if (matchingFeed.length > 0) {
      const details = matchingFeed.map((entry) => {
        const ext = entry.extracted;
        if (ext && ext.prevValue != null) {
          const pct = ext.pctChange != null ? ` (${ext.pctChange > 0 ? "+" : ""}${Number(ext.pctChange).toFixed(1)}%)` : "";
          return `${ext.name} moved from ${ext.prevValue} to ${ext.value} ${ext.unit || ""}${pct} on ${entry.date || "your new report"}`;
        }
        return `${entry.title} (${entry.detail || entry.date || "new report"})`;
      });
      answerParts.push(
        `From your newly uploaded report (marked waiting for care-team check): ${details.join("; ")}.`
      );
      for (const entry of matchingFeed.slice(0, 4)) {
        sources.push({
          kind: "record",
          title: entry.title,
          detail: entry.detail || `Uploaded ${entry.date || ""}`
        });
      }
    }
    const matchedInsights = insights.filter((ins) => {
      const hay = `${ins?.id || ""} ${ins?.title || ""} ${ins?.found || ""} ${ins?.area || ""}`.toLowerCase();
      if (asksKidney && (ins?.area === "kidney" || hay.includes("kidney") || hay.includes("egfr"))) return true;
      return words.some((w) => w.length > 3 && hay.includes(w));
    });
    const matchedLabs = [];
    for (const [labName, values] of Object.entries(labs)) {
      if (!Array.isArray(values) || values.length === 0) continue;
      const lLow = labName.toLowerCase();
      if (qLower.includes(lLow) || asksKidney && ["egfr", "creatinine", "uacr", "potassium", "urate", "cystatin c"].includes(lLow) || words.some((w) => w.length > 3 && lLow.includes(w))) {
        matchedLabs.push([labName, values[values.length - 1]]);
      }
    }
    if (matchedInsights.length > 0) {
      const top = matchedInsights[0];
      answerParts.push(
        `${answerParts.length ? " " : ""}In ${name}'s verified Knowledge Graph: ${top.found || top.title} ${top.do ? `Recommended next step: ${top.do}` : ""}`
      );
      for (const ins of matchedInsights.slice(0, 3)) {
        sources.push({
          kind: "finding",
          title: String(ins.title || "").slice(0, 60),
          detail: String(ins.found || "").slice(0, 100),
          finding_id: ins.id
        });
      }
    } else if (matchedLabs.length > 0 && answerParts.length === 0) {
      const labStrs = matchedLabs.map(
        ([labName, val]) => `${labName}: ${val?.value} ${val?.unit || ""} (${val?.date || "recorded"})`
      );
      answerParts.push(`According to ${name}'s verified twin record: ${labStrs.join("; ")}. Ask your doctor how these values guide your next check.`);
      for (const [labName, val] of matchedLabs.slice(0, 4)) {
        sources.push({
          kind: "record",
          title: `${labName}: ${val?.value} ${val?.unit || ""}`.trim(),
          detail: `Recorded ${val?.date || ""}`
        });
      }
    } else if (answerParts.length === 0) {
      const meds = Array.isArray(patient.medicines) && patient.medicines.length > 0 ? patient.medicines.join(", ") : "None recorded";
      const conds = Array.isArray(patient.conditions) && patient.conditions.length > 0 ? patient.conditions.join(", ") : "None recorded";
      answerParts.push(
        `Mapped in ${name}'s Digital Twin Knowledge Graph \u2014 Conditions: ${conds}. Current Medications: ${meds}. Ask your doctor about any unassessed areas or upcoming panel tests.`
      );
      sources.push({
        kind: "record",
        title: `${name}'s Medical Profile`,
        detail: "Active conditions and medications in twin record"
      });
    }
    if (isCdss && !answerParts.join(" ").includes("For physician review.")) {
      answerParts.push(" For physician review.");
    }
    return {
      answer: answerParts.join(""),
      sources: enrichSourceUrls(sources, bundle)
    };
  }
  generateLocalBriefing(params) {
    const patientName = params.bundle?.patient?.preferred_name || "Your";
    const rows = Array.isArray(params.new_results) ? params.new_results : [];
    const summaries = rows.slice(0, 5).map((r) => {
      if (r.prev_value != null && r.pct_change != null) {
        const dir = r.pct_change > 0 ? "rose" : r.pct_change < 0 ? "fell" : "stayed steady";
        return `${r.name} ${dir} from ${r.prev_value} to ${r.value} ${r.unit}`;
      }
      return `${r.name} is ${r.value} ${r.unit}${r.flag ? ` (${r.flag})` : ""}`;
    });
    const patientText = capWords(
      `We read ${rows.length} result${rows.length === 1 ? "" : "s"} from your new report and marked them waiting for your care team's check: ${summaries.join(
        "; "
      )}. Your twin's confirmed record stays unchanged until reviewed. At your next visit, ask your doctor what these updated numbers mean for your kidney, heart, and medicine plan.`,
      90
    );
    const clinDetails = rows.slice(0, 6).map((r) => {
      const dt = r.date ? ` (${r.date})` : "";
      const flag = r.flag ? ` [${r.flag.toUpperCase()}]` : "";
      const delta = r.prev_value != null && r.pct_change != null ? ` vs prior ${r.prev_value}${r.prev_date ? ` on ${r.prev_date}` : ""} (${r.pct_change > 0 ? "+" : ""}${Number(r.pct_change).toFixed(1)}%)` : " (new baseline)";
      return `${r.name} ${r.value} ${r.unit}${flag}${dt}${delta}`;
    });
    const clinicianText = capWords(
      `Patient-uploaded lab report (${rows.length} analyte${rows.length === 1 ? "" : "s"}, pending verification) for ${patientName}: ${clinDetails.join(
        "; "
      )}. Review trajectory against active regimen and confirm repeat testing or dose adjustments. For physician review.`,
      120
    );
    return {
      patient: patientText,
      clinician: clinicianText
    };
  }
  async ask(params) {
    if (!this.ai) {
      return this.generateLocalKgAnswer(params);
    }
    const isCdss = params.mode === "cdss";
    const kgSummary = buildKnowledgeGraphSummary(params.bundle, params.clinical);
    const systemInstruction = `You are the Mutanex Digital Twin Clinical AI assistant, grounded in BOTH the patient's verified Knowledge Graph (bundle + pending uploaded lab reports + clinical dossier) AND live medical literature/guidelines via Google Search.
Rules for your answer:
- Always anchor patient-specific statements strictly in the provided Knowledge Graph & patient record. Quote exact lab values, previous vs new values (including any newly uploaded report entries marked pending check), units, and dates.
- Use Google Search to cross-reference current clinical practice guidelines (e.g. KDIGO, AHA/ACC, ADA, CPIC pharmacogenomics) relevant to the patient's findings, medications, genes, and next diagnostic steps.
- Never invent patient lab values, diagnoses, or prescriptions. If a measurement is missing from the record, state that plainly and note which test on their panel measures it.
- Urgent or notable shifts (e.g. falling eGFR, rising uACR, potassium > 5.0 mmol/L on ARB/losartan, potassium > 6, eGFR < 15) must be highlighted first.
- If mode is "cdss": write for a physician \u2014 concise, structured (Findings, Guideline & KG Synthesis, Suggested Next Tests), and end with "For physician review."
- Otherwise: write for the patient in clear, warm plain language (at most 130 words) and suggest what to ask their doctor.
- Return valid JSON matching:
  {
    "answer": "string",
    "sources": [
      { "kind": "record" | "finding" | "kg" | "web", "title": "string", "detail": "string", "finding_id": "optional matching bundle.insights[].id", "url": "optional https URL or PubMed link" }
    ]
  }`;
    const userPrompt = `Patient ID: ${params.patient_id || "unknown"}
Mode: ${isCdss ? "cdss" : "patient"}
Question: ${params.question}

PATIENT KNOWLEDGE GRAPH & CLINICAL CONTEXT:
${kgSummary}`;
    const askResponseSchema = {
      type: Type.OBJECT,
      properties: {
        answer: { type: Type.STRING },
        sources: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              kind: { type: Type.STRING, enum: ["record", "finding", "kg", "web"] },
              title: { type: Type.STRING },
              detail: { type: Type.STRING },
              finding_id: { type: Type.STRING },
              url: { type: Type.STRING }
            },
            required: ["kind", "title"]
          }
        }
      },
      required: ["answer", "sources"]
    };
    let response = null;
    const jsonPrompt = `${userPrompt}

Search current clinical practice guidelines (e.g., KDIGO, AHA/ACC, ADA, CPIC) where helpful to ground your response, then respond ONLY with a valid JSON object (no markdown code fences outside the JSON) matching {"answer": string, "sources": Array<{"kind": "record"|"finding"|"kg"|"web", "title": string, "detail"?: string, "finding_id"?: string, "url"?: string}>}.`;
    try {
      response = await this.ai.models.generateContent({
        model: this.model,
        contents: jsonPrompt,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });
    } catch (err1) {
      console.warn("[Gemini ask Tier 1 fallback]", err1?.message || err1);
      response = await this.ai.models.generateContent({
        model: this.model,
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: askResponseSchema,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });
    }
    const rawText = response.text || "";
    const parsed = extractJsonObject(rawText);
    const answerText = typeof parsed?.answer === "string" && parsed.answer.trim() ? parsed.answer.trim() : rawText.trim() || "That isn't in your record yet, so I won't guess.";
    const modelSources = Array.isArray(parsed?.sources) ? parsed.sources.filter((s) => s && typeof s.title === "string").map((s) => ({
      kind: ["record", "finding", "kg", "web"].includes(s.kind) ? s.kind : "kg",
      title: s.title,
      detail: typeof s.detail === "string" ? s.detail : void 0,
      finding_id: typeof s.finding_id === "string" ? s.finding_id : void 0,
      url: typeof s.url === "string" && /^https?:\/\//i.test(s.url) ? s.url : void 0
    })) : [];
    const webGroundingSources = extractGroundingWebSources(response);
    const mergedSources = [...modelSources];
    for (const ws of webGroundingSources) {
      if (!mergedSources.some((existing) => existing.url && existing.url === ws.url)) {
        mergedSources.push(ws);
      }
    }
    const insights = Array.isArray(params.bundle?.insights) ? params.bundle.insights : [];
    for (const ins of insights) {
      if (!ins?.id) continue;
      const idLow = String(ins.id).toLowerCase();
      const titleLow = String(ins.title || "").toLowerCase();
      if (params.question.toLowerCase().includes(idLow) || answerText.toLowerCase().includes(idLow) || titleLow.length > 8 && answerText.toLowerCase().includes(titleLow.slice(0, 24))) {
        if (!mergedSources.some((s) => s.finding_id === ins.id)) {
          mergedSources.push({
            kind: "finding",
            title: String(ins.title || ins.id).slice(0, 70),
            detail: String(ins.found || "").slice(0, 120),
            finding_id: ins.id
          });
        }
      }
    }
    return {
      answer: answerText,
      sources: enrichSourceUrls(mergedSources, params.bundle)
    };
  }
  async extract(params) {
    if (!this.ai) {
      throw new Error("GEMINI_API_KEY is not configured for multimodal lab report extraction");
    }
    const systemInstruction = `You are a medical document analyzer. Extract all laboratory test results printed on this report.
Rules:
- Return only values printed on the report; never fill gaps, extrapolate, or guess.
- Extract the report date (YYYY-MM-DD if possible) and laboratory name if present.
- Extract individual test results with numeric values, units, reference ranges, and abnormal flags ("high" or "low", or null if normal/unflagged).`;
    const cleanBase64 = params.file.replace(/^data:[^;]+;base64,/, "");
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: params.mime_type
          }
        },
        "Extract all lab test results printed on this report. Return only values printed on the report; never fill gaps."
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            report_date: { type: Type.STRING, nullable: true },
            lab: { type: Type.STRING, nullable: true },
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  range: { type: Type.STRING, nullable: true },
                  flag: { type: Type.STRING, enum: ["high", "low"], nullable: true },
                  date: { type: Type.STRING, nullable: true }
                },
                required: ["name", "value", "unit"]
              }
            }
          },
          required: ["report_date", "lab", "results"]
        }
      }
    });
    const text = response.text || "{}";
    const parsed = extractJsonObject(text) || {};
    return {
      report_date: parsed.report_date ?? null,
      lab: parsed.lab ?? null,
      results: Array.isArray(parsed.results) ? parsed.results : []
    };
  }
  async briefing(params) {
    if (!this.ai) {
      return this.generateLocalBriefing(params);
    }
    const patient = params.bundle?.patient || {};
    const labs = params.bundle?.labs || {};
    const existingLabsSummary = {};
    for (const [key, arr] of Object.entries(labs)) {
      if (Array.isArray(arr) && arr.length > 0) {
        existingLabsSummary[key] = arr[arr.length - 1];
      }
    }
    const systemInstruction = `You generate two concise clinical briefings when a patient adds new laboratory results to their Mutanex Digital Twin:
1. "patient": MAXIMUM 90 WORDS. Plain, calm, reassuring everyday language for the patient. State clearly what changed compared with their previous twin values (mention key numbers simply), remind them their care team checks new entries first, and suggest 1-2 specific questions to ask their doctor. Never diagnose or change medicines.
2. "clinician": MAXIMUM 120 WORDS. Concise physician-oriented clinical note summarizing the clinically relevant changes with exact old -> new values, units, percentage changes, abnormal flags, and dates, plus relevant medication/condition context (e.g. CKD stage, ARB/losartan potassium monitoring, statin/PGx context). End with "For physician review."`;
    const prompt = `PATIENT PROFILE:
Name: ${patient.preferred_name || "Patient"}
Conditions: ${(patient.conditions || []).join("; ") || "None listed"}
Medications: ${(patient.medicines || []).join("; ") || "None listed"}

PREVIOUS LATEST TWIN LABS:
${JSON.stringify(existingLabsSummary, null, 2)}

NEWLY ADDED REPORT RESULTS (KEPT BY PATIENT):
${JSON.stringify(params.new_results, null, 2)}`;
    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              patient: { type: Type.STRING },
              clinician: { type: Type.STRING }
            },
            required: ["patient", "clinician"]
          }
        }
      });
      const parsed = extractJsonObject(response.text || "{}");
      if (parsed?.patient && parsed?.clinician) {
        return {
          patient: capWords(String(parsed.patient), 90),
          clinician: capWords(String(parsed.clinician), 120)
        };
      }
    } catch (err) {
      console.warn("[Gemini briefing fallback]", err);
    }
    return this.generateLocalBriefing(params);
  }
  async trainVoicePersona(params) {
    const prevCount = params.existing_profile?.sample_count ?? 0;
    const nextCount = Math.max(prevCount + 1, params.sample_count ?? prevCount + 1);
    const progressiveFidelity = Math.min(98, Math.round(34 + Math.min(nextCount, 6) * 10.5));
    const defaultVoice = params.existing_profile?.prebuilt_voice || "Kore";
    let transcript = (params.transcript_hint || "").trim();
    if (this.ai && params.audio_base64) {
      const cleanAudio = params.audio_base64.replace(/^data:[^;]+;base64,/, "");
      const mimeType = params.mime_type || "audio/wav";
      try {
        const trRes = await this.ai.models.generateContent({
          model: "gemini-3.5-transcribe",
          contents: {
            parts: [
              { inlineData: { mimeType, data: cleanAudio } },
              { text: "Transcribe this spoken voice sample accurately." }
            ]
          }
        });
        if (trRes.text && trRes.text.trim()) {
          transcript = trRes.text.trim();
        }
      } catch (err) {
        console.warn("[gemini-3.5-transcribe fallback]", err);
      }
    }
    if (!transcript) {
      transcript = "When my family listens back years from now, I want them to hear calm warmth, steady optimism, and the small everyday stories that shaped us.";
    }
    if (this.ai) {
      try {
        const parts = [];
        if (params.audio_base64) {
          parts.push({
            inlineData: {
              mimeType: params.mime_type || "audio/wav",
              data: params.audio_base64.replace(/^data:[^;]+;base64,/, "")
            }
          });
        }
        parts.push({
          text: `Analyze this speaker's vocal & linguistic persona for ${params.patient_name || "the user"}'s Preserved Digital Twin.
Transcript: "${transcript}"
Previous profile: ${JSON.stringify(params.existing_profile || {})}
Sample #${nextCount}.
Return JSON describing their TTS Voice Design style prompt, best matching Gemini prebuilt voice ("Kore", "Puck", "Charon", "Fenrir", or "Zephyr"), cadence_wpm (105-165), warmth (0-100), clarity (0-100), up to 4 signature_phrases, and a 1-sentence summary.`
        });
        const res = await this.ai.models.generateContent({
          model: this.model,
          contents: [{ role: "user", parts }],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                vocal_style: { type: Type.STRING },
                prebuilt_voice: {
                  type: Type.STRING,
                  enum: ["Kore", "Puck", "Charon", "Fenrir", "Zephyr"]
                },
                cadence_wpm: { type: Type.NUMBER },
                warmth: { type: Type.NUMBER },
                clarity: { type: Type.NUMBER },
                signature_phrases: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                summary: { type: Type.STRING }
              },
              required: [
                "vocal_style",
                "prebuilt_voice",
                "cadence_wpm",
                "warmth",
                "clarity",
                "signature_phrases",
                "summary"
              ]
            }
          }
        });
        const parsed = extractJsonObject(res.text || "{}");
        if (parsed?.vocal_style) {
          const validVoices = ["Kore", "Puck", "Charon", "Fenrir", "Zephyr"];
          const pb = validVoices.includes(parsed.prebuilt_voice) ? parsed.prebuilt_voice : defaultVoice;
          return {
            transcript,
            profile: {
              vocal_style: String(parsed.vocal_style),
              prebuilt_voice: pb,
              cadence_wpm: Math.max(95, Math.min(180, Math.round(Number(parsed.cadence_wpm) || 132))),
              warmth: Math.max(50, Math.min(100, Math.round(Number(parsed.warmth) || 88))),
              clarity: Math.max(60, Math.min(100, Math.round(Number(parsed.clarity) || 91))),
              signature_phrases: Array.isArray(parsed.signature_phrases) ? parsed.signature_phrases.slice(0, 4).map(String) : ["Take one steady step at a time"],
              sample_count: nextCount,
              fidelity_score: progressiveFidelity,
              summary: String(parsed.summary || "Warm, reflective conversational cadence learned from voice samples.")
            }
          };
        }
      } catch (err) {
        console.warn("[trainVoicePersona fallback]", err);
      }
    }
    return {
      transcript,
      profile: {
        vocal_style: params.existing_profile?.vocal_style || "Warm, calm, articulate conversational tone with gentle cadence and thoughtful pauses",
        prebuilt_voice: defaultVoice,
        cadence_wpm: 132,
        warmth: 89,
        clarity: 92,
        signature_phrases: [
          ...params.existing_profile?.signature_phrases || [],
          transcript.split(/[.,!?]/)[0]?.slice(0, 48) || "Steady warmth and care"
        ].slice(-4),
        sample_count: nextCount,
        fidelity_score: progressiveFidelity,
        summary: `Learned from ${nextCount} voice recording${nextCount === 1 ? "" : "s"} \u2014 warm conversational timbre locked.`
      }
    };
  }
  async analyzeFaceLikeness(params) {
    const count = Math.max(1, params.photo_count ?? 1);
    const baseScore = Math.min(97, 62 + count * 11);
    if (this.ai && params.image_base64) {
      const cleanImg = params.image_base64.replace(/^data:[^;]+;base64,/, "");
      try {
        const res = await this.ai.models.generateContent({
          model: this.model,
          contents: [
            {
              inlineData: {
                mimeType: params.mime_type || "image/jpeg",
                data: cleanImg
              }
            },
            `Extract 3D avatar facial geometry ratios and appearance colors from this portrait photo so the 3D Digital Twin bust matches this person's likeness accurately.
Return valid JSON with hex colors (#RRGGBB) and normalized ratios around 1.0.`
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                skin_tone_hex: { type: Type.STRING },
                hair_color_hex: { type: Type.STRING },
                eye_color_hex: { type: Type.STRING },
                lip_color_hex: { type: Type.STRING },
                face_width_ratio: { type: Type.NUMBER },
                jaw_taper: { type: Type.NUMBER },
                cheek_prominence: { type: Type.NUMBER },
                brow_arch: { type: Type.NUMBER },
                hair_style: {
                  type: Type.STRING,
                  enum: ["short", "medium", "long", "bun", "curly"]
                },
                glasses: { type: Type.BOOLEAN },
                likeness_summary: { type: Type.STRING }
              },
              required: [
                "skin_tone_hex",
                "hair_color_hex",
                "eye_color_hex",
                "lip_color_hex",
                "face_width_ratio",
                "jaw_taper",
                "cheek_prominence",
                "brow_arch",
                "hair_style",
                "glasses",
                "likeness_summary"
              ]
            }
          }
        });
        const parsed = extractJsonObject(res.text || "{}");
        if (parsed?.skin_tone_hex) {
          const hexOr = (v, def) => typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v.trim()) ? v.trim() : def;
          const clamp = (n, lo, hi, def) => {
            const v = Number(n);
            return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : def;
          };
          const styles = ["short", "medium", "long", "bun", "curly"];
          return {
            skin_tone_hex: hexOr(parsed.skin_tone_hex, "#c68b67"),
            hair_color_hex: hexOr(parsed.hair_color_hex, "#1c191c"),
            eye_color_hex: hexOr(parsed.eye_color_hex, "#3b281c"),
            lip_color_hex: hexOr(parsed.lip_color_hex, "#a8645d"),
            face_width_ratio: clamp(parsed.face_width_ratio, 0.85, 1.15, 0.98),
            jaw_taper: clamp(parsed.jaw_taper, 0.78, 1.15, 0.94),
            cheek_prominence: clamp(parsed.cheek_prominence, 0.85, 1.22, 1.04),
            brow_arch: clamp(parsed.brow_arch, 0.85, 1.2, 1.02),
            hair_style: styles.includes(parsed.hair_style) ? parsed.hair_style : "medium",
            glasses: Boolean(parsed.glasses),
            likeness_score: baseScore,
            likeness_summary: String(
              parsed.likeness_summary || "Balanced facial symmetry, warm complexion, and expressive eye/brow contours mapped to 3D mesh."
            )
          };
        }
      } catch (err) {
        console.warn("[analyzeFaceLikeness fallback]", err);
      }
    }
    return {
      skin_tone_hex: "#c68b67",
      hair_color_hex: "#1c191c",
      eye_color_hex: "#3b281c",
      lip_color_hex: "#a8645d",
      face_width_ratio: 0.98,
      jaw_taper: 0.94,
      cheek_prominence: 1.04,
      brow_arch: 1.02,
      hair_style: "medium",
      glasses: false,
      likeness_score: baseScore,
      likeness_summary: "Warm complexion, shoulder-length dark hair, and gentle cheek contours mapped to 3D likeness."
    };
  }
  async speakPreservedTwin(params) {
    const name = params.patient_name || params.bundle?.patient?.preferred_name || "Anika";
    const validVoices = ["Kore", "Puck", "Charon", "Fenrir", "Zephyr"];
    const chosenVoice = params.voice_profile?.prebuilt_voice && validVoices.includes(params.voice_profile.prebuilt_voice) ? params.voice_profile.prebuilt_voice : params.bundle?.patient?.sex === "male" ? "Charon" : "Kore";
    const stylePrompt = params.voice_profile?.vocal_style || "Warm, calm, reflective, natural human cadence with gentle warmth";
    const prevFidelity = params.voice_profile?.fidelity_score ?? 45;
    const updatedFidelity = Math.min(99, prevFidelity + 4);
    let replyText = `Hi, it's ${name}. Hearing from you means so much\u2014remember to take things one calm step at a time, enjoy a brisk walk outdoors, and look after the people we love.`;
    if (this.ai) {
      try {
        const memoriesText = Array.isArray(params.memories) && params.memories.length ? params.memories.join(" | ") : "Loves family dinners, morning walks, yoga, home-cooked vegetarian meals, and teaching.";
        const phrasesText = (params.voice_profile?.signature_phrases || []).join("; ");
        const textRes = await this.ai.models.generateContent({
          model: this.model,
          contents: `User message to ${name}'s Preserved Digital Self: "${params.prompt}"

Memories & life notes: ${memoriesText}
Signature phrasing: ${phrasesText || "warm, grounded everyday speech"}`,
          config: {
            systemInstruction: `You are ${name}'s Preserved Digital Self speaking in the first person ("I"). Match ${name}'s vocal cadence (${stylePrompt}), warmth, and personal memories. Keep your spoken response natural, heartfelt, and concise (30 to 55 words) so it sounds completely authentic when spoken aloud. Plain spoken words only\u2014no markdown or stage tags.`
          }
        });
        if (textRes.text && textRes.text.trim()) {
          replyText = capWords(textRes.text.replace(/[*#_`]/g, "").trim(), 60);
        }
      } catch (err) {
        console.warn("[speakPreservedTwin text fallback]", err);
      }
      for (const ttsModel of ["gemini-3.8-flash-tts", "gemini-3.8-flash-lite-tts"]) {
        try {
          const ttsRes = await this.ai.models.generateContent({
            model: ttsModel,
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: replyText,
                    speechMetadata: {
                      style: stylePrompt
                    }
                  }
                ]
              }
            ],
            config: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: chosenVoice }
                }
              }
            }
          });
          const audioBase64 = ttsRes.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
          if (audioBase64) {
            return {
              reply_text: replyText,
              audio_wav_base64: audioBase64,
              voice_used: `${chosenVoice} (${ttsModel})`,
              style_used: stylePrompt,
              updated_fidelity: updatedFidelity
            };
          }
        } catch (ttsErr) {
          console.warn(`[TTS ${ttsModel} fallback]`, ttsErr?.message || ttsErr);
        }
      }
    }
    return {
      reply_text: replyText,
      audio_wav_base64: null,
      voice_used: chosenVoice,
      style_used: stylePrompt,
      updated_fidelity: updatedFidelity
    };
  }
};

// src/twin-builder.ts
import fs from "node:fs";
import path from "node:path";
var generatedTwins = /* @__PURE__ */ new Map();
function calculateAge(dob) {
  if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return 42;
  const [y, m, d] = dob.split("-").map(Number);
  const now = /* @__PURE__ */ new Date();
  let age = now.getFullYear() - y;
  const mo = now.getMonth() + 1 - m;
  if (mo < 0 || mo === 0 && now.getDate() < d) {
    age--;
  }
  return Math.max(18, Math.min(110, age));
}
function loadScaffoldJson(portalDir, relativePath) {
  if (!portalDir) return {};
  const fullPath = path.join(portalDir, relativePath);
  try {
    if (fs.existsSync(fullPath)) {
      return JSON.parse(fs.readFileSync(fullPath, "utf8"));
    }
  } catch {
  }
  return {};
}
function getGeneratedTwinsList() {
  return Array.from(generatedTwins.values()).map((t) => t.indexEntry).reverse();
}
function getGeneratedTwinById(id) {
  return generatedTwins.get(id);
}
function buildOnboardingTwin(payload, portalDir) {
  const cleanName = (payload.details?.name || "Alex").trim();
  const firstName = cleanName.split(/\s+/)[0] || "Alex";
  const dob = payload.details?.dob || "1986-05-14";
  const age = calculateAge(dob);
  const q = payload.questionnaire || {};
  const rawSex = String(q.sex || "Female").toLowerCase();
  const sex = rawSex.includes("male") && !rawSex.includes("female") ? "male" : rawSex.includes("intersex") ? "intersex" : "female";
  const isSnapshot = payload.path_type === "snapshot";
  const uploadedLabs = Array.isArray(payload.uploaded_labs) ? payload.uploaded_labs : [];
  const linkedRecords = Array.isArray(payload.linked_records) ? payload.linked_records : [];
  const genetics = Array.isArray(payload.genetics) ? payload.genetics : [];
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const hasRenalOrLipidFlags = uploadedLabs.some((l) => Boolean(l.flag));
  const templateId = hasRenalOrLipidFlags ? "MX-SYN-T02" : "MX-SYN-T07";
  const baseBundle = JSON.parse(
    JSON.stringify(loadScaffoldJson(portalDir, `patient-data/${templateId}.json`))
  );
  const baseDoctor = JSON.parse(
    JSON.stringify(loadScaffoldJson(portalDir, `patient-data/doctor/${templateId}.json`))
  );
  const idSuffix = String(Date.now()).slice(-5);
  const newId = `MX-ONB-${idSuffix}`;
  const conditions = Array.isArray(q.conditions) ? q.conditions.filter((c) => c && c !== "None") : [];
  const symptoms = Array.isArray(q.symptoms) ? q.symptoms.filter((s) => s && s !== "None") : [];
  const medListText = typeof q.med_list === "string" && q.med_list.trim() ? q.med_list.trim() : "";
  const medicines = medListText ? medListText.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean) : q.meds === "No" ? [] : baseBundle?.patient?.medicines?.slice(0, 1) || [];
  const supplements = Array.isArray(q.supplements) ? q.supplements.filter((s) => s && s !== "None") : [];
  const tags = [
    isSnapshot ? "snapshot twin" : "full membership report",
    ...uploadedLabs.length > 0 ? ["lab report extracted"] : [],
    ...linkedRecords.length > 0 ? ["linked EHR"] : [],
    ...genetics.length > 0 ? ["genetics + PGx"] : []
  ];
  const mainConcern = payload.summary_lines?.concern && payload.summary_lines.concern !== "Not shared" ? payload.summary_lines.concern : conditions[0] || symptoms[0] || "Baseline wellness & prevention";
  const headline = isSnapshot ? `Snapshot twin: ${mainConcern.toLowerCase()}${uploadedLabs.length ? ` \xB7 ${uploadedLabs.length} lab values` : ""}` : `Full assessment twin: ${mainConcern.toLowerCase()}${genetics.length ? " \xB7 PGx & genomics" : ""}`;
  const mergedLabs = isSnapshot ? {} : { ...baseBundle.labs || {} };
  for (const item of uploadedLabs) {
    const key = item.name.trim();
    const existing = mergedLabs[key] || [];
    mergedLabs[key] = [
      ...existing,
      {
        date: item.date || today,
        value: item.value,
        unit: item.unit,
        lab: linkedRecords[0] || "Uploaded Lab Report",
        flag: item.flag,
        rule_evaluated: true
      }
    ];
  }
  if (Object.keys(mergedLabs).length === 0 && baseBundle.labs) {
    for (const [k, v] of Object.entries(baseBundle.labs).slice(0, 8)) {
      mergedLabs[k] = v;
    }
  }
  const customInsights = [];
  const flaggedLabs = uploadedLabs.filter((l) => l.flag === "high" || l.flag === "low");
  if (flaggedLabs.length > 0) {
    const topFlagged = flaggedLabs.slice(0, 3);
    customInsights.push({
      id: "onb_lab_flags",
      title: `${topFlagged.length} result${topFlagged.length > 1 ? "s" : ""} outside reference range on your uploaded report`,
      priority: 1,
      organ: topFlagged.some((l) => /egfr|creatinin|uacr/i.test(l.name)) ? "kidneyL" : "heart",
      area: topFlagged.some((l) => /egfr|creatinin|uacr/i.test(l.name)) ? "kidney" : "heart",
      found: topFlagged.map((l) => `${l.name}: ${l.value} ${l.unit} (${l.flag}${l.range ? `, ref ${l.range}` : ""})`).join("; "),
      why: "Values flagged outside the laboratory reference interval help focus your doctor consult and follow-up panel.",
      means: `Combined with your main concern (${mainConcern}), your twin highlights these biomarkers first.`,
      do: payload.consult?.doctor ? `Review these flagged results during your scheduled consult with ${payload.consult.doctor}.` : "Share this snapshot with your clinician and consider completing missing baseline tests.",
      expected: "Clear trend tracking once a second repeat measurement is added.",
      certainty: "B",
      evidence: [{ finding_id: "Onboarding Lab Rule", grade: "B", sources: ["PMID:38490803"] }],
      helps: "Turns a single report into a longitudinal twin baseline."
    });
  }
  if (genetics.length > 0) {
    const geneSummary = genetics.map((g) => `${g.gene}${g.variant ? ` (${g.variant})` : ""}${g.phenotype ? ` \u2014 ${g.phenotype}` : ""}`).join("; ");
    customInsights.push({
      id: "onb_pgx_profile",
      title: "Your uploaded pharmacogenomic & genetic variants are linked",
      priority: 1,
      organ: "liver",
      area: "medicines",
      found: `Uploaded genetic markers: ${geneSummary}.`,
      why: "Pharmacogenomic variants shape how enzymes and transporters handle statins, antiplatelets, PPIs, and antihypertensives.",
      means: "Your twin cross-checks future prescriptions against your uploaded genotype.",
      do: "Show your pharmacogenomic summary to your prescribing doctor before starting or changing doses.",
      expected: "Fewer side effects and better-matched medicine dosing.",
      certainty: "A",
      evidence: [{ finding_id: "CPIC PGx Guideline", grade: "A", sources: ["PMID:35150436"] }],
      helps: "Matches medicine choices to your genetics."
    });
  }
  if (payload.summary_lines?.top_goal && payload.summary_lines.top_goal !== "Not shared") {
    customInsights.push({
      id: "onb_goal_focus",
      title: `Priority goal: ${payload.summary_lines.top_goal}`,
      priority: 2,
      organ: "brain",
      area: "metabolism",
      found: `Main concern: ${mainConcern}. Support requested: ${payload.summary_lines.support || "Guided plan"}.`,
      why: payload.summary_lines.barrier && payload.summary_lines.barrier !== "Not shared" ? `You noted "${payload.summary_lines.barrier}" as a barrier, so your plan breaks next steps into manageable checks.` : "Aligning your biomarker panel to your personal goal keeps follow-ups focused.",
      means: isSnapshot ? "Your Snapshot Twin maps what is already known and which tests fill remaining gaps." : "Your Full Membership Twin tracks your goal across lab panels and physician reviews.",
      do: "Use Daily Check-in and Feed Your Twin whenever new home measurements or reports arrive.",
      expected: "Measurable progress over the next 3\u20136 months.",
      certainty: "B",
      evidence: [],
      helps: "Keeps your care team aligned with what matters most to you."
    });
  }
  const finalInsights = [
    ...customInsights,
    ...Array.isArray(baseBundle.insights) ? baseBundle.insights.slice(0, isSnapshot ? 3 : 6) : []
  ];
  const mergedGenes = [
    ...genetics.map((g) => ({
      gene: g.gene,
      protein: null,
      role: g.role || "patient_variant",
      function: g.phenotype ? `${g.variant ? `${g.variant}: ` : ""}${g.phenotype}` : "Uploaded during Mutanex onboarding genomic intake."
    })),
    ...Array.isArray(baseBundle?.genetics?.genes) ? baseBundle.genetics.genes.slice(0, 8) : []
  ];
  const researchPipeline = [
    {
      stage: "Questionnaire & phenotype mapping",
      detail: `Processed 10-section intake for ${firstName} (${conditions.length} conditions, ${symptoms.length} symptoms).`,
      status: "done"
    },
    {
      stage: "Lab extraction & EHR record linkage",
      detail: `${uploadedLabs.length} extracted lab biomarkers verified${linkedRecords.length ? `; linked ${linkedRecords.join(", ")}` : ""}.`,
      status: "done"
    },
    {
      stage: "Genomics & PGx variant annotation",
      detail: genetics.length ? `${genetics.length} uploaded genetic/PGx loci annotated against CPIC & ClinVar.` : "No VCF/PGx file attached yet \u2014 marked ready for future genomic unlock.",
      status: "done"
    },
    {
      stage: "Knowledge Graph & CDSS dossier synthesis",
      detail: isSnapshot ? "Snapshot completeness ranked and baseline twin published." : `Full twin + physician dossier prepared${payload.consult?.doctor ? ` with ${payload.consult.doctor}` : ""}.`,
      status: "done"
    }
  ];
  const bundle = {
    ...baseBundle,
    generated: (/* @__PURE__ */ new Date()).toISOString(),
    patient: {
      ...baseBundle.patient || {},
      preferred_name: firstName,
      date_of_birth: dob,
      age,
      sex,
      twin_created: today,
      conditions: conditions.length > 0 ? conditions : ["Baseline preventive assessment"],
      medicines,
      supplements,
      doctor: payload.consult?.doctor || (isSnapshot ? "Mutanex Snapshot Care Team" : "Mutanex Membership Physician"),
      headline,
      tags,
      synthetic: false,
      record_date: today
    },
    labs: mergedLabs,
    insights: finalInsights,
    genetics: {
      ...baseBundle.genetics || {},
      genes: mergedGenes
    },
    research_stages: researchPipeline.map((s) => ({
      name: s.stage,
      result: s.detail,
      status: "done"
    })),
    twin_versions: [
      {
        version: "Twin 1",
        name: isSnapshot ? "Onboarding Snapshot" : "Initial Full Assessment",
        date: today,
        status: "current",
        based_on: `${uploadedLabs.length || Object.keys(mergedLabs).length} lab biomarkers, 10-section intake${genetics.length ? `, ${genetics.length} genetic markers` : ""}`
      },
      {
        version: "Twin 2",
        name: "After follow-up panel",
        date: "",
        status: "waiting",
        based_on: (payload.upsell_panels || []).join(", ") || "Next personalised panel"
      }
    ],
    narrative: {
      ...baseBundle.narrative || {},
      biomarker_summary: uploadedLabs.length > 0 ? `Built from your uploaded lab report (${uploadedLabs.slice(0, 4).map((l) => `${l.name} ${l.value} ${l.unit}`).join(", ")}) and your 10-section health intake.` : `Built from your 10-section health intake and linked baseline records for ${firstName}.`,
      lifestyle_summary: `Diet: ${q.diet || "Mixed"}; activity: ${q.activity || "recorded"} min/wk; sleep: ${q.sleep || "recorded"} hrs; smoking: ${q.smoking || "Never"}.`
    }
  };
  const doctorBundle = {
    ...baseDoctor,
    id: newId,
    generated: today,
    priorities: [
      ...flaggedLabs.map((l) => `${l.name} (${l.value} ${l.unit}) outside reference interval`),
      ...genetics.map((g) => `PGx / Genomic review: ${g.gene} ${g.variant || ""} ${g.phenotype || ""}`.trim()),
      `Primary patient goal: ${payload.summary_lines?.top_goal || mainConcern}`
    ].slice(0, 8)
  };
  const indexEntry = {
    id: newId,
    name: firstName,
    age,
    sex,
    headline,
    tags
  };
  generatedTwins.set(newId, {
    id: newId,
    indexEntry,
    bundle,
    doctorBundle
  });
  return {
    id: newId,
    index_entry: indexEntry,
    research_pipeline: researchPipeline,
    bundle,
    doctor_bundle: doctorBundle
  };
}

// src/app.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
function resolvePortalDir() {
  const candidates = [
    path2.resolve(process.cwd(), "Mutanex_MyTwin", "portal"),
    path2.resolve(process.cwd(), "..", "Mutanex_MyTwin", "portal"),
    path2.resolve(__dirname, "..", "Mutanex_MyTwin", "portal"),
    path2.resolve(__dirname, "..", "..", "Mutanex_MyTwin", "portal"),
    path2.resolve(__dirname, "..", "..", "..", "Mutanex_MyTwin", "portal")
  ];
  for (const candidate of candidates) {
    if (fs2.existsSync(candidate) && fs2.statSync(candidate).isDirectory()) {
      return candidate;
    }
  }
  return null;
}
function createApp(geminiService = new DefaultGeminiService()) {
  const app2 = express();
  const fallbackService = new DefaultGeminiService("");
  const portalDir = resolvePortalDir();
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5180",
    "http://localhost:5181",
    "http://localhost:8080"
  ];
  app2.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      credentials: true,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
    })
  );
  app2.use(express.json({ limit: "50mb" }));
  const healthHandler = (_req, res) => {
    res.status(200).json({ ok: true });
  };
  app2.get("/v1/ask/health", healthHandler);
  app2.get("/v1/health", healthHandler);
  app2.get("/health", healthHandler);
  app2.post("/v1/ask", async (req, res) => {
    const { question, bundle, patient_id, mode, clinical } = req.body;
    if (!question || typeof question !== "string" || !question.trim()) {
      res.status(400).json({ error: "Missing or invalid 'question' in request body" });
      return;
    }
    if (!bundle || typeof bundle !== "object") {
      res.status(400).json({ error: "Missing or invalid 'bundle' in request body" });
      return;
    }
    try {
      const response = await geminiService.ask({
        question: question.trim(),
        bundle,
        patient_id: patient_id || "patient",
        mode,
        clinical
      });
      res.status(200).json(response);
    } catch (err) {
      console.error("[Error in /v1/ask]", err);
      res.status(500).json({
        error: "Failed to process question with Gemini AI",
        details: err?.message || String(err)
      });
    }
  });
  app2.post("/v1/extract", async (req, res) => {
    const { file, mime_type } = req.body;
    if (!file || typeof file !== "string") {
      res.status(400).json({ error: "Missing or invalid base64 'file' in request body" });
      return;
    }
    const validMimes = ["image/png", "image/jpeg", "application/pdf"];
    if (!mime_type || !validMimes.includes(mime_type)) {
      res.status(400).json({
        error: `Invalid 'mime_type'. Supported: ${validMimes.join(", ")}`
      });
      return;
    }
    try {
      const response = await geminiService.extract({ file, mime_type });
      res.status(200).json(response);
    } catch (err) {
      console.error("[Error in /v1/extract]", err);
      res.status(500).json({
        error: "Failed to extract lab data with Gemini AI",
        details: err?.message || String(err)
      });
    }
  });
  app2.post("/v1/briefing", async (req, res) => {
    const { bundle, new_results } = req.body;
    if (!bundle || typeof bundle !== "object" || Array.isArray(bundle)) {
      res.status(400).json({ error: "Missing or invalid 'bundle' in request body" });
      return;
    }
    if (!Array.isArray(new_results) || new_results.length === 0) {
      res.status(400).json({ error: "Missing or empty 'new_results' array in request body" });
      return;
    }
    try {
      const response = geminiService.briefing ? await geminiService.briefing({ bundle, new_results }) : fallbackService.generateLocalBriefing({ bundle, new_results });
      res.status(200).json(response);
    } catch (err) {
      console.error("[Error in /v1/briefing]", err);
      res.status(500).json({
        error: "Failed to generate briefing with Gemini AI",
        details: err?.message || String(err)
      });
    }
  });
  app2.post(
    "/v1/onboarding/create-twin",
    async (req, res) => {
      const body = req.body;
      if (!body || !body.details || !body.details.name?.trim()) {
        res.status(400).json({ error: "Missing 'details.name' in onboarding payload" });
        return;
      }
      try {
        const created = buildOnboardingTwin(body, portalDir);
        res.status(201).json(created);
      } catch (err) {
        console.error("[Error in /v1/onboarding/create-twin]", err);
        res.status(500).json({
          error: "Failed to synthesize Digital Twin",
          details: err?.message || String(err)
        });
      }
    }
  );
  app2.post("/v1/preserve/voice-train", async (req, res) => {
    try {
      const result = geminiService.trainVoicePersona ? await geminiService.trainVoicePersona(req.body || {}) : await fallbackService.trainVoicePersona(req.body || {});
      res.status(200).json(result);
    } catch (err) {
      console.error("[Error in /v1/preserve/voice-train]", err);
      res.status(500).json({ error: "Voice training failed", details: err?.message || String(err) });
    }
  });
  app2.post("/v1/preserve/face-analyze", async (req, res) => {
    const { image_base64, mime_type, photo_count } = req.body || {};
    if (!image_base64 || typeof image_base64 !== "string") {
      res.status(400).json({ error: "Missing 'image_base64' in request body" });
      return;
    }
    try {
      const result = geminiService.analyzeFaceLikeness ? await geminiService.analyzeFaceLikeness({ image_base64, mime_type: mime_type || "image/jpeg", photo_count }) : await fallbackService.analyzeFaceLikeness({ image_base64, mime_type: mime_type || "image/jpeg", photo_count });
      res.status(200).json(result);
    } catch (err) {
      console.error("[Error in /v1/preserve/face-analyze]", err);
      res.status(500).json({ error: "Face analysis failed", details: err?.message || String(err) });
    }
  });
  app2.post("/v1/preserve/speak", async (req, res) => {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      res.status(400).json({ error: "Missing 'prompt' in request body" });
      return;
    }
    try {
      const result = geminiService.speakPreservedTwin ? await geminiService.speakPreservedTwin(req.body) : await fallbackService.speakPreservedTwin(req.body);
      res.status(200).json(result);
    } catch (err) {
      console.error("[Error in /v1/preserve/speak]", err);
      res.status(500).json({ error: "Preserved twin speech failed", details: err?.message || String(err) });
    }
  });
  if (portalDir) {
    app2.get("/patient-data/index.json", (_req, res) => {
      try {
        const staticIndexPath = path2.join(portalDir, "patient-data", "index.json");
        const staticList = fs2.existsSync(staticIndexPath) ? JSON.parse(fs2.readFileSync(staticIndexPath, "utf8")) : [];
        const dynamicList = getGeneratedTwinsList();
        res.status(200).json([...dynamicList, ...staticList]);
      } catch {
        res.status(200).json(getGeneratedTwinsList());
      }
    });
    app2.get("/patient-data/doctor/:id.json", (req, res, next) => {
      const generated = getGeneratedTwinById(String(req.params.id));
      if (generated) {
        res.status(200).json(generated.doctorBundle);
        return;
      }
      next();
    });
    app2.get("/patient-data/:id.json", (req, res, next) => {
      const generated = getGeneratedTwinById(String(req.params.id));
      if (generated) {
        res.status(200).json(generated.bundle);
        return;
      }
      next();
    });
    app2.get("/favicon.ico", (_req, res, next) => {
      const faviconCandidates = [
        path2.resolve(process.cwd(), "public", "favicon.ico"),
        path2.resolve(process.cwd(), "favicon.ico"),
        path2.resolve(__dirname, "..", "..", "public", "favicon.ico"),
        path2.resolve(__dirname, "..", "..", "favicon.ico"),
        path2.join(portalDir, "favicon.ico")
      ];
      for (const candidate of faviconCandidates) {
        if (fs2.existsSync(candidate) && fs2.statSync(candidate).isFile()) {
          res.sendFile(candidate);
          return;
        }
      }
      next();
    });
    app2.use(
      express.static(portalDir, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith(".webmanifest")) {
            res.setHeader("Content-Type", "application/manifest+json");
          }
        }
      })
    );
    app2.use((req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD" || req.path.startsWith("/v1/") || path2.extname(req.path)) {
        next();
        return;
      }
      res.sendFile(path2.join(portalDir, "index.html"));
    });
  }
  return app2;
}

// src/index.ts
var parsedPort = Number.parseInt(process.env.PORT || "3000", 10);
var port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 3e3;
var host = "0.0.0.0";
var app = createApp();
var server = app.listen(port, host, () => {
  console.log("====================================================");
  console.log(` Mutanex My Twin AI Service (Express + @google/genai)`);
  console.log(` Listening: http://${host}:${port}`);
  console.log(` Gemini Key: ${process.env.GEMINI_API_KEY ? "Configured" : "NOT SET (using local KG fallback)"}`);
  console.log(` Model: gemini-4-hydrogen`);
  console.log("====================================================");
});
server.on("error", (err) => {
  console.error("[Fatal server listen error]", err);
  process.exit(1);
});
