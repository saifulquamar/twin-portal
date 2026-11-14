#!/usr/bin/env python3
"""
Mutanex - My Twin Portal & AI Backend Server
Combines static asset serving for the portal with the /v1/ask AI assistant API
powered by the patient Knowledge Graph (currentKG) and Google Gemini (with Google Search grounding).

Ready for local use and Google Cloud Run deployment.
"""

import os
import sys
import json
import mimetypes
import urllib.request
import urllib.error
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Ensure critical MIME types are registered
mimetypes.init()
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/javascript", ".mjs")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("application/manifest+json", ".webmanifest")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("application/json", ".json")

PORT = int(os.environ.get("PORT", 8080))
HOST = os.environ.get("HOST", "0.0.0.0")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")

# Locate portal static files directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PORTAL_DIR = None
for candidate in [
    os.path.join(BASE_DIR, "portal"),
    os.path.join(BASE_DIR, "Mutanex_MyTwin", "portal"),
    os.path.join(os.getcwd(), "portal"),
    os.path.join(os.getcwd(), "Mutanex_MyTwin", "portal"),
]:
    if os.path.isdir(candidate):
        PORTAL_DIR = candidate
        break

if not PORTAL_DIR:
    PORTAL_DIR = BASE_DIR
print(f"[Server] Serving portal static files from: {PORTAL_DIR}")


def extract_kg_context(bundle, clinical=None):
    """Summarizes the patient's current Knowledge Graph (currentKG), record, and clinical data."""
    parts = []
    
    # Demographics and profile
    patient = bundle.get("patient", {})
    if patient:
        name = patient.get("preferred_name", "Patient")
        parts.append(f"PATIENT PROFILE: {name}")
        parts.append(f"- Age/DOB: {patient.get('date_of_birth')}, Sex: {patient.get('sex')}")
        if patient.get("conditions"):
            parts.append(f"- Diagnosed Conditions: {', '.join(patient['conditions'])}")
        if patient.get("medicines"):
            parts.append(f"- Current Medications: {', '.join(patient['medicines'])}")
        if patient.get("supplements"):
            parts.append(f"- Active Supplements: {', '.join(patient['supplements'])}")
        if patient.get("allergies"):
            parts.append(f"- Allergies: {', '.join(patient['allergies'])}")
    
    # Labs & Measurements
    labs = bundle.get("labs", {})
    if isinstance(labs, dict) and labs:
        parts.append("\nRECENT LAB VALUES & MEASUREMENTS:")
        for lab_name, measurements in labs.items():
            if isinstance(measurements, list) and measurements:
                latest = measurements[-1]
                flag_str = f" [{latest['flag'].upper()}]" if latest.get("flag") else ""
                parts.append(f"- {lab_name}: {latest.get('value')} {latest.get('unit', '')} (Tested: {latest.get('date')}){flag_str}")
    
    # Verified Insights (Twin Knowledge Graph Findings)
    insights = bundle.get("insights", [])
    if insights:
        parts.append("\nKNOWLEDGE GRAPH FINDINGS & CLINICAL INSIGHTS:")
        for ins in insights:
            ins_id = ins.get("id", "")
            title = ins.get("title", "")
            found = ins.get("found", "")
            action = ins.get("do", "")
            parts.append(f"- [{ins_id}] {title}")
            if found:
                parts.append(f"  Evidence: {found}")
            if action:
                parts.append(f"  Recommended Action: {action}")
    
    # Knowledge Graph Structure Metrics
    graph = bundle.get("graph", {})
    if isinstance(graph, dict) and graph:
        parts.append(f"\nKG METRICS: {graph.get('entities', 0)} entities, {graph.get('pairs_linked', 0)} linked associations, {graph.get('safety_pairs', 0)} safety pairs monitored.")
    
    # Action Plan
    action_plan = bundle.get("action_plan", {})
    if isinstance(action_plan, dict) and action_plan.get("priorities"):
        parts.append("\nCURRENT ACTION PLAN PRIORITIES:")
        for pri in action_plan["priorities"][:4]:
            parts.append(f"- {pri.get('title')}: {pri.get('detail')}")

    # Clinical Decision Support (CDSS) for Doctor View
    if clinical and isinstance(clinical, dict):
        sections = clinical.get("sections", [])
        if sections:
            parts.append("\nPHYSICIAN CLINICAL DECISION SUPPORT (CDSS) DATA:")
            for sec in sections:
                parts.append(f"- {sec.get('title')}: {sec.get('summary', '')}")
    
    return "\n".join(parts)


def call_google_gemini(question, kg_text, is_cdss=False, patient_name="Patient", api_key=""):
    """Calls Google Gemini API with Google Search grounding enabled."""
    if not api_key:
        api_key = GEMINI_API_KEY
    
    if not api_key:
        return None, []
    
    system_role = (
        "You are the Mutanex Digital Twin AI assistant. "
        "You provide accurate, compassionate, evidence-grounded health information directly based on the patient's "
        "verified Knowledge Graph (currentKG) and cross-referenced with medical evidence via Google Search. "
        "Always cite specific facts from their record (e.g. medications, labs, dates) where applicable. "
        "Do not invent fake lab values. Explain what tests can measure unassessed areas."
    )
    if is_cdss:
        system_role = (
            "You are the Mutanex Clinical Decision Support (CDSS) assistant for physician review. "
            "Synthesize the patient's verified Knowledge Graph (currentKG), pharmacogenomics, interactions, and "
            "therapeutic targets with current clinical research evidence via Google Search. For physician review only."
        )

    prompt = f"""{system_role}

PATIENT VERIFIED KNOWLEDGE GRAPH & HEALTH RECORD (currentKG):
{kg_text}

USER QUESTION:
{question}

Please provide:
1. A clear, direct, evidence-based answer referencing {patient_name}'s specific record/KG and current medical evidence from Google.
2. Maintain an objective, professional tone."""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={api_key}"
    
    # Request body with Google Search grounding
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}]
            }
        ],
        "tools": [
            {"google_search": {}}
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 1200
        }
    }

    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            
            # Extract answer text
            answer = ""
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                answer = "".join(p.get("text", "") for p in parts if "text" in p)
            
            # Extract Google Search grounding sources
            sources = []
            if candidates:
                grounding = candidates[0].get("groundingMetadata", {})
                chunks = grounding.get("groundingChunks", [])
                for chunk in chunks:
                    web = chunk.get("web", {})
                    if web.get("title") and web.get("uri"):
                        sources.append({
                            "kind": "kg",
                            "title": web["title"][:50],
                            "detail": web["uri"]
                        })
            
            return answer, sources
    except Exception as e:
        print(f"[Gemini API Error] {e}")
        # If gemini-2.0-flash failed with google_search tool (e.g. region or schema variation), retry without tool or standard
        try:
            payload_fallback = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.3, "maxOutputTokens": 1000}
            }
            req_fallback = urllib.request.Request(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}",
                data=json.dumps(payload_fallback).encode("utf-8"),
                headers=headers,
                method="POST"
            )
            with urllib.request.urlopen(req_fallback, timeout=20) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    return "".join(p.get("text", "") for p in parts if "text" in p), []
        except Exception as e2:
            print(f"[Gemini Fallback Error] {e2}")
            return None, []


def generate_local_kg_answer(question, bundle, clinical=None):
    """Fallback high-quality synthesizer using currentKG if no Gemini API key is configured."""
    q_lower = question.lower()
    patient = bundle.get("patient", {})
    name = patient.get("preferred_name", "the patient")
    insights = bundle.get("insights", [])
    labs = bundle.get("labs", {})
    
    matched_insights = []
    for ins in insights:
        title = ins.get("title", "").lower()
        found = ins.get("found", "").lower()
        ins_id = ins.get("id", "").lower()
        if any(w in title or w in found or w in ins_id for w in q_lower.split() if len(w) > 3):
            matched_insights.append(ins)
            
    matched_labs = []
    if isinstance(labs, dict):
        for lab_name, values in labs.items():
            if lab_name.lower() in q_lower or any(w in lab_name.lower() for w in q_lower.split() if len(w) > 3):
                if values:
                    matched_labs.append((lab_name, values[-1]))

    answer_parts = []
    sources = []

    if matched_insights:
        top_ins = matched_insights[0]
        answer_parts.append(f"Based on {name}'s verified Knowledge Graph: {top_ins.get('found', top_ins.get('title'))}")
        if top_ins.get("why"):
            answer_parts.append(f"\n{top_ins['why']}")
        if top_ins.get("do"):
            answer_parts.append(f"\nRecommended action: {top_ins['do']}")
        
        for ins in matched_insights[:3]:
            sources.append({
                "kind": "finding",
                "title": ins.get("title")[:45],
                "detail": ins.get("found", "")[:100],
                "finding_id": ins.get("id")
            })

    elif matched_labs:
        lab_strs = [f"{name}: {val.get('value')} {val.get('unit')} ({val.get('date')})" for name, val in matched_labs]
        answer_parts.append(f"According to {name}'s latest test records: {'; '.join(lab_strs)}.")
        for name_lab, val in matched_labs:
            sources.append({
                "kind": "record",
                "title": f"{name_lab} Result",
                "detail": f"{val.get('value')} {val.get('unit')} on {val.get('date')}"
            })
    else:
        # General response from profile & action plan
        meds = ", ".join(patient.get("medicines", [])) or "None recorded"
        conds = ", ".join(patient.get("conditions", [])) or "None recorded"
        answer_parts.append(
            f"Here is what is currently mapped in {name}'s Digital Twin Knowledge Graph:\n"
            f"• Conditions: {conds}\n"
            f"• Current Medications: {meds}\n"
            f"Your twin evaluates interactions, lab trends, and organ status. If this question relates to a body system not yet assessed, your personalised test panel is how we verify it."
        )
        sources.append({
            "kind": "record",
            "title": f"{name}'s Medical Profile",
            "detail": f"Active conditions and medications verified in twin"
        })

    # Note about Google Search / Gemini API Key
    answer_parts.append(
        "\n\n*(Note: To enable live Google Search grounding & full Gemini reasoning, configure the GEMINI_API_KEY environment variable.)*"
    )
    
    return "".join(answer_parts), sources


class TwinPortalHandler(SimpleHTTPRequestHandler):
    """Custom HTTP handler serving the portal frontend and the /v1/ask API."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PORTAL_DIR, **kwargs)

    def do_GET(self):
        # Health check endpoint for the frontend Ask AI and Cloud Run
        if self.path in ("/v1/health", "/health", "/v1/ask/health"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            resp = {
                "ok": True,
                "status": "healthy",
                "service": "mutanex-twin-portal",
                "gemini_configured": bool(GEMINI_API_KEY)
            }
            self.wfile.write(json.dumps(resp).encode("utf-8"))
            return
        
        # Check if requested path exists; if not (and not an asset file with extension), fallback to /index.html (SPA routing)
        clean_path = self.path.split("?")[0].split("#")[0].lstrip("/")
        local_target = os.path.join(PORTAL_DIR, clean_path)
        if clean_path and not os.path.exists(local_target) and not os.path.splitext(clean_path)[1]:
            self.path = "/index.html"

        # Standard static file serving
        return super().do_GET()

    def do_POST(self):
        if self.path == "/v1/ask":
            content_length = int(self.headers.get("Content-Length", 0))
            body_bytes = self.rfile.read(content_length)
            
            try:
                payload = json.loads(body_bytes.decode("utf-8"))
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"Invalid JSON: {e}"}).encode("utf-8"))
                return

            question = payload.get("question", "").strip()
            bundle = payload.get("bundle", {})
            clinical = payload.get("clinical", None)
            mode = payload.get("mode", "")
            is_cdss = (mode == "cdss")

            if not question:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(json.dumps({"error": "No question provided"}).encode("utf-8"))
                return

            patient_name = bundle.get("patient", {}).get("preferred_name", "Patient")
            kg_text = extract_kg_context(bundle, clinical)

            # Check if API key is provided in request headers (e.g. X-Gemini-Key) or environment
            api_key = self.headers.get("X-Gemini-Key") or GEMINI_API_KEY

            answer = None
            sources = []

            # 1. Try Google Gemini with Google Search grounding
            if api_key:
                answer, sources = call_google_gemini(question, kg_text, is_cdss, patient_name, api_key)

            # 2. Fallback to smart local KG synthesis if Gemini was unavailable or not configured
            if not answer:
                answer, local_sources = generate_local_kg_answer(question, bundle, clinical)
                if not sources:
                    sources = local_sources

            # Also cross-link any finding_id mentioned in bundle insights
            insights = bundle.get("insights", [])
            for ins in insights:
                ins_id = ins.get("id")
                if ins_id and (ins_id.lower() in question.lower() or ins.get("title", "").lower() in answer.lower()):
                    if not any(s.get("finding_id") == ins_id for s in sources):
                        sources.append({
                            "kind": "finding",
                            "title": ins.get("title")[:45],
                            "detail": ins.get("found", "")[:100],
                            "finding_id": ins_id
                        })

            response_data = {
                "answer": answer,
                "sources": sources
            }

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Gemini-Key")
            self.end_headers()
            self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

    def do_OPTIONS(self):
        """Handle CORS pre-flight requests."""
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Gemini-Key")
        self.end_headers()


def run():
    server_address = (HOST, PORT)
    httpd = HTTPServer(server_address, TwinPortalHandler)
    print(f"==================================================")
    print(f" Mutanex My Twin Portal & AI Server running")
    print(f" Host: http://localhost:{PORT}")
    print(f" Static files: {PORTAL_DIR}")
    print(f" Gemini API Key Configured: {'YES' if GEMINI_API_KEY else 'NO (Set GEMINI_API_KEY for live Google grounding)'}")
    print(f"==================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()


if __name__ == "__main__":
    run()
