export type SourceKind = 'record' | 'finding' | 'kg' | 'web';

export interface SourceItem {
  kind: SourceKind;
  title: string;
  detail?: string;
  finding_id?: string;
  url?: string;
}

export interface AskRequestBody {
  patient_id?: string;
  question: string;
  bundle: any;
  mode?: 'cdss' | string;
  clinical?: any;
}

export interface AskResponse {
  answer: string;
  sources: SourceItem[];
}

export type ExtractMimeType = 'image/png' | 'image/jpeg' | 'application/pdf';

export interface ExtractRequestBody {
  file: string; // base64 string
  mime_type: ExtractMimeType;
}

export interface ExtractResultItem {
  name: string;
  value: number;
  unit: string;
  range: string | null;
  flag: 'high' | 'low' | null;
  date: string | null;
}

export interface ExtractResponse {
  report_date: string | null;
  lab: string | null;
  results: ExtractResultItem[];
}

export interface BriefingResultItem {
  name: string;
  value: number;
  unit: string;
  range?: string | null;
  flag?: 'high' | 'low' | null;
  date?: string | null;
  prev_value?: number | null;
  prev_unit?: string | null;
  prev_date?: string | null;
  pct_change?: number | null;
}

export interface BriefingRequestBody {
  bundle: any;
  new_results: BriefingResultItem[];
}

export interface BriefingResponse {
  patient: string;
  clinician: string;
}

export interface OnboardingGeneItem {
  gene: string;
  variant?: string;
  phenotype?: string;
  role?: string;
}

export interface CreateTwinRequestBody {
  path_type: 'membership' | 'snapshot';
  tier?: string;
  details: {
    name: string;
    dob: string;
    region?: string;
    country?: string;
    phone?: string;
  };
  questionnaire?: Record<string, any>;
  summary_lines?: {
    concern: string;
    top_goal: string;
    barrier: string;
    support: string;
  };
  uploaded_labs?: ExtractResultItem[];
  linked_records?: string[];
  genetics?: OnboardingGeneItem[];
  upsell_panels?: string[];
  consult?: {
    doctor: string;
    slot: string;
    paid?: boolean;
  } | null;
}

export interface CreateTwinResponse {
  id: string;
  index_entry: {
    id: string;
    name: string;
    age: number;
    sex: string;
    headline: string;
    tags: string[];
  };
  research_pipeline: Array<{
    stage: string;
    detail: string;
    status: 'done';
  }>;
  bundle: any;
  doctor_bundle: any;
}

export interface VoicePersonaProfile {
  vocal_style: string;
  prebuilt_voice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  cadence_wpm: number;
  warmth: number;
  clarity: number;
  signature_phrases: string[];
  sample_count: number;
  fidelity_score: number;
  summary: string;
}

export interface VoiceTrainRequestBody {
  audio_base64?: string;
  mime_type?: string;
  transcript_hint?: string;
  patient_name?: string;
  sample_count?: number;
  existing_profile?: Partial<VoicePersonaProfile>;
}

export interface VoiceTrainResponse {
  transcript: string;
  profile: VoicePersonaProfile;
}

export interface FaceLikenessProfile {
  skin_tone_hex: string;
  hair_color_hex: string;
  eye_color_hex: string;
  lip_color_hex: string;
  face_width_ratio: number;
  jaw_taper: number;
  cheek_prominence: number;
  brow_arch: number;
  hair_style: 'short' | 'medium' | 'long' | 'bun' | 'curly';
  glasses: boolean;
  likeness_score: number;
  likeness_summary: string;
}

export interface FaceAnalyzeRequestBody {
  image_base64: string;
  mime_type: string;
  photo_count?: number;
}

export interface PreserveSpeakRequestBody {
  prompt: string;
  patient_name?: string;
  bundle?: any;
  voice_profile?: Partial<VoicePersonaProfile>;
  memories?: string[];
}

export interface PreserveSpeakResponse {
  reply_text: string;
  audio_wav_base64: string | null;
  voice_used: string;
  style_used: string;
  updated_fidelity: number;
}

