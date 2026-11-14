export type SourceKind = 'record' | 'finding' | 'kg';

export interface SourceItem {
  kind: SourceKind;
  title: string;
  detail?: string;
  finding_id?: string;
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
