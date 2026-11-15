export type SourceKind = 'record' | 'finding' | 'kg' | 'web';

export interface AskSource {
  kind: SourceKind;
  title: string;
  detail?: string;
  finding_id?: string;
  url?: string;
}

export interface LabPoint {
  date: string;
  value: number;
  unit: string;
  lab?: string;
  flag?: 'high' | 'low' | string | null;
  rule_evaluated?: boolean;
}

export interface ExtractedLabItem {
  name: string;
  value: number;
  unit: string;
  range: string | null;
  flag: 'high' | 'low' | null;
  date: string | null;
}

export interface ExtractApiResponse {
  report_date: string | null;
  lab: string | null;
  results: ExtractedLabItem[];
}

export interface MatchedLabRow extends ExtractedLabItem {
  id: string;
  kept: boolean;
  matchedLabKey: string | null;
  prevValue: number | null;
  prevUnit: string | null;
  prevDate: string | null;
  pctChange: number | null;
  arrow: '↑' | '↓' | '→' | null;
}

export type FeedKind =
  | 'lab'
  | 'measure'
  | 'medicine'
  | 'symptom'
  | 'family'
  | 'lifestyle'
  | 'report'
  | 'diary'
  | 'voice_note'
  | 'personal_info';

export type FeedCategory =
  | 'test_results'
  | 'measurements'
  | 'medicines'
  | 'symptoms'
  | 'daily_activities'
  | 'personal_diary'
  | 'voice_conversations'
  | 'additional_personal_info';

export type FeedProvenance =
  | 'user_reported'
  | 'imported_record'
  | 'measured_device'
  | 'voice_spoken'
  | 'ai_extracted';

export interface ParsedFeedItem {
  category: FeedCategory;
  kind: FeedKind;
  title: string;
  detail: string;
  effective_date: string;
  confidence: number;
  provenance: FeedProvenance;
  structured?: Record<string, string | number | boolean | null>;
}

export interface FeedInterpretResponse {
  summary: string;
  transcript?: string;
  items: ParsedFeedItem[];
}

export interface FeedEntry {
  id: string;
  at: string;
  kind: FeedKind;
  category?: FeedCategory;
  provenance?: FeedProvenance;
  confidence?: number;
  reviewStatus?: 'pending_review' | 'personal_context' | 'verified';
  date: string;
  title: string;
  detail: string;
  structured?: Record<string, string | number | boolean | null>;
  extracted?: {
    name: string;
    value: number;
    unit: string;
    range: string | null;
    flag: 'high' | 'low' | null;
    date: string | null;
    prevValue: number | null;
    prevUnit: string | null;
    prevDate: string | null;
    pctChange: number | null;
  };
}

export type MemoryCategory =
  | 'life_story'
  | 'values'
  | 'habits'
  | 'communication_style'
  | 'milestone'
  | 'diary';

export interface IdentityMemoryItem {
  id: string;
  at: string;
  category: MemoryCategory;
  title?: string;
  text: string;
  source: 'written' | 'spoken' | 'diary_sync';
}

export interface VoiceConsentData {
  consented: boolean;
  consentedAt: string | null;
  allowConversationalRefinement: boolean;
  encryptedAtRest: boolean;
}

export interface VoiceClipMeta {
  id: string;
  at: string;
  sourceType: 'recorded_audio' | 'uploaded_audio' | 'conversation_audio';
  durationSec: number;
  snrDb: number;
  pitchHz: number | null;
  transcript: string;
  audioDataUrl?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: 'member' | 'admin';
  assignedPatientId: string;
  createdAt: string;
}

export interface StoredBriefing {
  patient: string;
  clinician: string;
  date: string;
  at: string;
  labName?: string | null;
  count: number;
}

export interface BriefingResultPayload {
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

export interface PortalHostBridge {
  getPatientId: () => string;
  switchPatient?: (id: string) => void;
  loadPatientIndex?: () => Promise<any[]>;
  readStore: <T>(key: string, fallback: T) => T;
  writeStore: (key: string, value: unknown) => void;
  formatDate: (dateStr: string) => string;
  calcAge?: (dob: string) => { years: number };
  useDoctor?: () => boolean;
  setDoctorMode?: (on: boolean) => void;
  DoctorToggle?: any;
  loadDoctorDoc?: () => Promise<any>;
  cdssPrompts?: string[];
  crisisRegex?: RegExp;
  CrisisBanner?: any;
  checkHealth?: () => Promise<boolean>;
  apiBase?: string;
  Hero?: any;
  PageHead?: any;
  SegmentedTabs?: any;
  InfoBanner?: any;
  Takeaway?: any;
  Ring?: any;
  CertaintyGrade?: any;
  Sheet?: any;
  Icon?: any;
  AskQuestions?: any;
  PatientTwin3D?: any;
  ResearchSourcesTab?: any;
  ResearchMethodTab?: any;
  ResearchGenesTab?: any;
  ResearchDossierTab?: any;
  ResearchFindingDetail?: any;
}
