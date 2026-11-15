export type SourceKind = 'record' | 'finding' | 'kg' | 'web' | 'memory' | 'feed';

export interface SourceItem {
  kind: SourceKind;
  title: string;
  detail?: string;
  finding_id?: string;
  url?: string;
}

export interface IdentityMemoryItem {
  id: string;
  category: 'story' | 'values' | 'routine' | 'communication' | 'milestone' | 'diary';
  text: string;
  created_at: string;
  source: 'user_written' | 'user_spoken' | 'feed_linked';
  audio_attached?: boolean;
}

export interface AskRequestBody {
  patient_id?: string;
  question: string;
  bundle: any;
  mode?: 'cdss' | string;
  clinical?: any;
  synthesize_audio?: boolean;
  voice_profile?: Partial<VoicePersonaProfile>;
  identity_memories?: IdentityMemoryItem[];
  self_perspective?: boolean;
}

export interface AskResponse {
  answer: string;
  sources: SourceItem[];
  audio_wav_base64?: string | null;
  voice_used?: string;
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

export type VoiceAudioSourceKind =
  | 'recorded_audio'
  | 'uploaded_audio'
  | 'conversation_audio'
  | 'text_only';

export interface VoiceConsentState {
  granted: boolean;
  granted_at: string | null;
  allow_conversation_refinement: boolean;
  consent_statement: string;
  revoked_at?: string | null;
}

export interface VoiceRecordingClipMeta {
  id: string;
  recorded_at: string;
  source_kind: Exclude<VoiceAudioSourceKind, 'text_only'>;
  duration_sec: number;
  pitch_hz: number | null;
  snr_db: number;
  transcript: string;
  audio_data_url?: string;
}

export interface FormantBandProfile {
  low: number;
  mid: number;
  presence: number;
  air: number;
}

export interface VoicePersonaProfile {
  vocal_style: string;
  prebuilt_voice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  cadence_wpm: number;
  warmth: number;
  clarity: number;
  pitch_hz?: number;
  pitch_range_hz?: number;
  brightness?: number;
  vocal_register?: 'deep' | 'warm_mid' | 'clear_mid' | 'bright_high';
  accent?: string;
  speaking_pace?: 'calm' | 'natural' | 'brisk';
  formant_bands?: FormantBandProfile;
  completed_passages?: number[];
  signature_phrases: string[];
  sample_count: number;
  fidelity_score: number;
  summary: string;
  encrypted_at_rest?: boolean;
  consent_verified?: boolean;
  allow_conversation_refinement?: boolean;
  audio_sample_count?: number;
  used_real_audio?: boolean;
}

export interface VoiceTrainRequestBody {
  audio_base64?: string;
  mime_type?: string;
  source_kind?: VoiceAudioSourceKind;
  source_type?: VoiceAudioSourceKind;
  consent_verified?: boolean;
  allow_conversation_refinement?: boolean;
  transcript_hint?: string;
  patient_name?: string;
  sample_count?: number;
  measured_pitch_hz?: number;
  measured_pitch_range_hz?: number;
  measured_brightness?: number;
  measured_wpm?: number;
  formant_bands?: FormantBandProfile;
  vocal_register?: 'deep' | 'warm_mid' | 'clear_mid' | 'bright_high';
  accent?: string;
  speaking_pace?: 'calm' | 'natural' | 'brisk';
  passage_index?: number;
  existing_profile?: Partial<VoicePersonaProfile>;
}

export interface VoiceTrainResponse {
  transcript: string;
  profile: VoicePersonaProfile;
  used_real_audio: boolean;
}

export interface VoiceSynthesizeRequestBody {
  text: string;
  voice_profile?: Partial<VoicePersonaProfile>;
  patient_sex?: string;
}

export interface VoiceSynthesizeResponse {
  audio_wav_base64: string | null;
  voice_used: string;
  style_used: string;
  pitch_hz: number;
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
  nose_bridge?: number;
  lip_fullness?: number;
  eye_spacing?: number;
  hair_style: 'short' | 'medium' | 'long' | 'bun' | 'curly';
  facial_hair?: 'none' | 'stubble' | 'beard';
  glasses: boolean;
  likeness_score: number;
  likeness_summary: string;
}

export interface FaceAnalyzeRequestBody {
  image_base64: string;
  mime_type: string;
  photo_count?: number;
  angle?: 'front' | 'three_quarter' | 'profile';
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

// === 8-Category Expanded Feed Your Twin Multimodal Parsing ===
export type FeedCategory =
  | 'test_results'
  | 'measurements'
  | 'medicines'
  | 'symptoms'
  | 'daily_activities'
  | 'personal_diary'
  | 'voice_conversations'
  | 'additional_info';

export type FeedProvenance =
  | 'user_reported'
  | 'uploaded_document'
  | 'measured'
  | 'voice_recording'
  | 'imported_device'
  | 'ai_extracted';

export interface ParsedFeedItem {
  category: FeedCategory;
  legacy_kind: 'lab' | 'measure' | 'medicine' | 'symptom' | 'family' | 'lifestyle' | 'report';
  date: string;
  title: string;
  detail: string;
  provenance: FeedProvenance;
  confidence: number;
  requires_clinician_check: boolean;
  structured: Record<string, string | number | boolean | null>;
}

export interface InterpretFeedRequestBody {
  text?: string;
  audio_base64?: string;
  audio_mime_type?: string;
  image_base64?: string;
  image_mime_type?: string;
  reference_date?: string;
  patient_name?: string;
  bundle_summary?: {
    conditions?: string[];
    medicines?: string[];
  };
}

export interface InterpretFeedResponse {
  transcript: string;
  summary: string;
  items: ParsedFeedItem[];
  has_audio_recording: boolean;
}

// === Auth, Session & Encrypted Identity Vault ===
export type UserRole = 'member' | 'admin';

export interface AuthUserPublic {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  bound_patient_id: string;
  created_at: string;
}

export interface SignUpRequestBody {
  name: string;
  email: string;
  password: string;
  bound_patient_id?: string;
}

export interface SignInRequestBody {
  email: string;
  password: string;
}

export interface AuthSessionResponse {
  token: string;
  user: AuthUserPublic;
}

export interface PatientVaultPayload {
  patient_id: string;
  updated_at: string;
  face_profile?: FaceLikenessProfile | null;
  portrait_photos?: Array<{
    id: string;
    angle: 'front' | 'three_quarter' | 'profile';
    data_url: string;
    added_at: string;
  }>;
  voice_consent?: VoiceConsentState | null;
  voice_profile?: VoicePersonaProfile | null;
  voice_clips?: VoiceRecordingClipMeta[];
  identity_memories?: IdentityMemoryItem[];
  preserved_turns?: any[];
  feed_entries?: any[];
  preferences?: string[];
}
