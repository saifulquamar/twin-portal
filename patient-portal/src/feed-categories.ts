import type { FeedCategory, FeedEntry, FeedKind } from './types';

export interface CategorySpec {
  id: FeedCategory;
  kind: FeedKind;
  title: string;
  subtitle: string;
  icon: string;
}

export const FEED_CATEGORIES: CategorySpec[] = [
  {
    id: 'test_results',
    kind: 'report',
    title: 'Test Results',
    subtitle: 'Blood reports, genomics, imaging & lab values',
    icon: 'blood',
  },
  {
    id: 'measurements',
    kind: 'measure',
    title: 'Measurements',
    subtitle: 'Weight, height, BP, heart rate, glucose, sleep & body comp',
    icon: 'heart',
  },
  {
    id: 'medicines',
    kind: 'medicine',
    title: 'Medicines',
    subtitle: 'Prescriptions, supplements, dosages, changes & adherence',
    icon: 'lifestyle',
  },
  {
    id: 'symptoms',
    kind: 'symptom',
    title: 'Symptoms',
    subtitle: 'Severity, duration, frequency, triggers & progression',
    icon: 'checkin',
  },
  {
    id: 'daily_activities',
    kind: 'lifestyle',
    title: 'Daily Activities',
    subtitle: 'Exercise, nutrition, hydration, sleep & daily routines',
    icon: 'lifestyle',
  },
  {
    id: 'personal_diary',
    kind: 'diary',
    title: 'Personal Diary',
    subtitle: 'Daily notes, feelings, experiences & personal reflections',
    icon: 'preserve',
  },
  {
    id: 'voice_conversations',
    kind: 'voice_note',
    title: 'Voice & Conversations',
    subtitle: 'Spoken updates, voice recordings & personal stories',
    icon: 'checkin',
  },
  {
    id: 'additional_personal_info',
    kind: 'personal_info',
    title: 'Additional Personal Info',
    subtitle: 'Family history, allergies, surgeries, devices & life context',
    icon: 'dna',
  },
];

export function inferCategoryFromEntry(entry: FeedEntry): FeedCategory {
  if (entry.category) return entry.category;
  switch (entry.kind) {
    case 'lab':
    case 'report':
      return 'test_results';
    case 'measure':
      return 'measurements';
    case 'medicine':
      return 'medicines';
    case 'symptom':
      return 'symptoms';
    case 'lifestyle':
      return 'daily_activities';
    case 'diary':
      return 'personal_diary';
    case 'voice_note':
      return 'voice_conversations';
    case 'family':
    case 'personal_info':
    default:
      return 'additional_personal_info';
  }
}
