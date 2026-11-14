export type QuestionType = 'single' | 'multi' | 'scale' | 'text' | 'measure';

export interface MeasureField {
  key: string;
  label: string;
  placeholder?: string;
  unit?: string;
  numeric?: boolean;
}

export interface QuestionSpec {
  id: string;
  sectionIndex: number; // 1..9
  prompt: string;
  sub?: string;
  type: QuestionType;
  options?: string[] | ((answers: Record<string, any>) => string[]);
  exclusiveOptions?: string[];
  maxPicks?: number;
  allowPhoto?: boolean;
  measureFields?: MeasureField[];
  skipLabel?: string;
  visibleWhen?: (answers: Record<string, any>) => boolean;
  safetyStop?: (val: any) => 'urgent' | 'support' | null;
}

export interface SectionSpec {
  index: number;
  title: string;
  subtitle?: string;
  skippable: boolean;
}

export const SECTION_SKIPPED_SENTINEL = '__section_skipped__';
export const QUESTION_SKIPPED_SENTINEL = '__question_skipped__';

export const QUESTIONNAIRE_SECTIONS: SectionSpec[] = [
  { index: 1, title: 'About you', subtitle: 'Core context so we use the right reference ranges.', skippable: false },
  { index: 2, title: 'Safety check', subtitle: 'We ask everyone before building a twin.', skippable: false },
  { index: 3, title: 'Health conditions', subtitle: 'Diagnoses or areas being investigated.', skippable: true },
  { index: 4, title: 'Symptoms', subtitle: 'Anything you have noticed recently.', skippable: true },
  { index: 5, title: 'Medicines', subtitle: 'Prescriptions, supplements, and reactions.', skippable: true },
  { index: 6, title: 'Family', subtitle: "Parents, brothers, sisters or children. 'Not sure' is a fine answer.", skippable: true },
  { index: 7, title: 'Lifestyle', subtitle: 'Daily food, movement, sleep, and stress.', skippable: true },
  { index: 8, title: 'Measurements', subtitle: 'Whatever home numbers you already know.', skippable: true },
  { index: 9, title: 'Goals', subtitle: 'What matters most over the next 3–6 months.', skippable: true },
  { index: 10, title: 'Summary', subtitle: 'Review what will guide your Snapshot and doctor report.', skippable: false },
];

function hasNonExclusiveMulti(val: unknown, exclusives = ['None', 'No', 'None of these', 'Never stopped one', 'Not right now']): boolean {
  if (!Array.isArray(val) || val.length === 0) return false;
  return val.some((item) => typeof item === 'string' && !exclusives.includes(item) && item !== QUESTION_SKIPPED_SENTINEL);
}

export const QUESTIONNAIRE_QUESTIONS: QuestionSpec[] = [
  // 1 · About you (not skippable)
  {
    id: 'sex',
    sectionIndex: 1,
    prompt: 'Sex assigned at birth',
    sub: 'So we use the right ranges.',
    type: 'single',
    options: ['Female', 'Male', 'Intersex'],
    skipLabel: 'Prefer not to say',
  },
  {
    id: 'hormones',
    sectionIndex: 1,
    prompt: 'Any of these right now?',
    type: 'multi',
    options: (a) =>
      a.sex === 'Male'
        ? ['Hormone therapy', 'None of these']
        : ['Pregnant', 'Breastfeeding', 'Trying to conceive', 'Hormone therapy', 'None of these'],
    exclusiveOptions: ['None of these'],
    skipLabel: 'Prefer not to say',
  },
  {
    id: 'work',
    sectionIndex: 1,
    prompt: 'Your work is mostly…',
    type: 'single',
    options: ['Sitting', 'Standing', 'Physically active', 'Not working now'],
  },
  {
    id: 'shifts',
    sectionIndex: 1,
    prompt: 'Night shifts or irregular hours?',
    type: 'single',
    options: ['Yes', 'No'],
  },
  {
    id: 'reason',
    sectionIndex: 1,
    prompt: 'What brings you to Mutanex?',
    sub: 'Pick any.',
    type: 'multi',
    options: [
      'A condition I manage',
      'Symptoms',
      'A recent test result',
      'Family history',
      'Prevention',
      'Checking my care is working',
      'Performance and longevity',
      'My doctor suggested it',
      'Curiosity',
      'Other',
    ],
  },

  // 2 · Safety check (not skippable — Yes stops questionnaire)
  {
    id: 'safety_now',
    sectionIndex: 2,
    prompt: 'We ask everyone. Recently, have you had any of these?',
    sub: 'Chest pain · Fainting · Severe breathlessness at rest · Sudden weakness or trouble speaking · Major bleeding',
    type: 'single',
    options: ['No', 'Yes'],
    safetyStop: (val) => (val === 'Yes' ? 'urgent' : null),
  },
  {
    id: 'safety_new',
    sectionIndex: 2,
    prompt: 'And any of these?',
    sub: "Told a test result needs prompt follow-up · Weight loss you can't explain · A fever that won't go away · A new lump · Yellowing of the skin or eyes",
    type: 'single',
    options: ['No', 'Yes'],
    safetyStop: (val) => (val === 'Yes' ? 'urgent' : null),
  },
  {
    id: 'feeling',
    sectionIndex: 2,
    prompt: 'In the past two weeks, have you had thoughts of hurting yourself?',
    type: 'single',
    options: ['No', 'Yes', "I'd rather talk to someone"],
    safetyStop: (val) => (val === 'Yes' || val === "I'd rather talk to someone" ? 'support' : null),
  },

  // 3 · Health conditions (skippable)
  {
    id: 'conditions',
    sectionIndex: 3,
    prompt: 'Do you manage any of these health conditions?',
    type: 'multi',
    options: [
      'Diabetes or prediabetes',
      'High blood pressure',
      'High cholesterol',
      'Heart condition',
      'Thyroid condition',
      'Kidney condition',
      'Liver condition',
      'Other',
      'None',
    ],
    exclusiveOptions: ['None'],
  },
  {
    id: 'condition_status',
    sectionIndex: 3,
    prompt: 'Has a doctor confirmed it?',
    type: 'single',
    options: ['Confirmed by a doctor', 'Suspected', 'Still being looked into'],
    skipLabel: 'Not sure',
    visibleWhen: (a) => hasNonExclusiveMulti(a.conditions),
  },
  {
    id: 'condition_year',
    sectionIndex: 3,
    prompt: 'Roughly when did it start?',
    type: 'text',
    skipLabel: "I don't know",
    visibleWhen: (a) => hasNonExclusiveMulti(a.conditions),
  },
  {
    id: 'condition_doctor',
    sectionIndex: 3,
    prompt: 'Seeing a doctor for it?',
    type: 'single',
    options: ['Yes', 'No'],
    visibleWhen: (a) => hasNonExclusiveMulti(a.conditions),
  },
  {
    id: 'hospital',
    sectionIndex: 3,
    prompt: 'Any major surgery or hospital stay?',
    sub: 'Yes or no is fine. Details can come later.',
    type: 'single',
    options: ['Yes', 'No'],
  },

  // 4 · Symptoms (skippable)
  {
    id: 'symptoms',
    sectionIndex: 4,
    prompt: 'Have you noticed any of these symptoms?',
    type: 'multi',
    options: [
      'Fatigue',
      'Pain',
      'Breathlessness',
      'Dizziness',
      'Sleep problems',
      'Digestive issues',
      'Swelling',
      'Weakness',
      'Numbness',
      'Weight changes',
      'Mood changes',
      'Other',
      'None',
    ],
    exclusiveOptions: ['None'],
  },
  {
    id: 'symptom_top',
    sectionIndex: 4,
    prompt: 'Which bother you most?',
    sub: 'Pick up to 2.',
    type: 'multi',
    maxPicks: 2,
    options: (a) =>
      Array.isArray(a.symptoms) ? a.symptoms.filter((x: string) => x !== 'None') : [],
    visibleWhen: (a) =>
      Array.isArray(a.symptoms) && a.symptoms.filter((x: string) => x !== 'None').length >= 2,
  },
  {
    id: 'symptom_since',
    sectionIndex: 4,
    prompt: 'How long have you had them?',
    type: 'single',
    options: ['Started recently', 'A long time'],
    visibleWhen: (a) => hasNonExclusiveMulti(a.symptoms),
  },
  {
    id: 'symptom_course',
    sectionIndex: 4,
    prompt: 'How are they changing?',
    type: 'single',
    options: ['Getting better', 'Getting worse', 'About the same'],
    visibleWhen: (a) => hasNonExclusiveMulti(a.symptoms),
  },
  {
    id: 'symptom_often',
    sectionIndex: 4,
    prompt: 'How often do you notice them?',
    type: 'single',
    options: ['Now and then', 'Several times a week', 'Almost every day'],
    visibleWhen: (a) => hasNonExclusiveMulti(a.symptoms),
  },
  {
    id: 'symptom_impact',
    sectionIndex: 4,
    prompt: 'How much do they affect your day?',
    sub: '0 is not at all, 10 is a lot',
    type: 'scale',
    visibleWhen: (a) => hasNonExclusiveMulti(a.symptoms),
  },
  {
    id: 'symptom_after',
    sectionIndex: 4,
    prompt: 'Did they start after any of these?',
    type: 'multi',
    options: ['A medicine change', 'An illness', 'A big lifestyle change', 'None of these'],
    exclusiveOptions: ['None of these'],
    visibleWhen: (a) => hasNonExclusiveMulti(a.symptoms),
  },

  // 5 · Medicines (skippable)
  {
    id: 'meds',
    sectionIndex: 5,
    prompt: 'Do you take prescription medicines?',
    type: 'single',
    options: ['Yes', 'No'],
  },
  {
    id: 'med_list',
    sectionIndex: 5,
    prompt: 'Which ones?',
    sub: 'Name, dose and how often, if you know.',
    type: 'text',
    allowPhoto: true,
    skipLabel: 'Add later',
    visibleWhen: (a) => a.meds === 'Yes',
  },
  {
    id: 'med_changes',
    sectionIndex: 5,
    prompt: 'Started, stopped or changed any recently?',
    type: 'single',
    options: ['Yes', 'No'],
    visibleWhen: (a) => a.meds === 'Yes',
  },
  {
    id: 'med_stopped',
    sectionIndex: 5,
    prompt: 'Ever stopped a medicine because…',
    type: 'multi',
    options: [
      'Side effects',
      "It didn't seem to work",
      'It was hard to get',
      'My doctor advised it',
      'Never stopped one',
    ],
    exclusiveOptions: ['Never stopped one'],
  },
  {
    id: 'reactions',
    sectionIndex: 5,
    prompt: 'Any unexpected reaction to a medicine?',
    type: 'multi',
    options: [
      'Rash',
      'Swelling',
      'Dizziness',
      'Stomach problems',
      'Muscle pain',
      'Something else',
      'No',
    ],
    exclusiveOptions: ['No'],
  },
  {
    id: 'supplements',
    sectionIndex: 5,
    prompt: 'Do you take any supplements?',
    type: 'multi',
    options: [
      'Vitamins',
      'Herbal products',
      'Protein powders',
      'Products bought online',
      'None',
    ],
    exclusiveOptions: ['None'],
  },
  {
    id: 'allergies',
    sectionIndex: 5,
    prompt: 'Any known allergies?',
    type: 'multi',
    options: ['Medicines', 'Foods', 'Latex', 'Contrast dye', 'None'],
    exclusiveOptions: ['None'],
  },

  // 6 · Family (skippable)
  {
    id: 'family',
    sectionIndex: 6,
    prompt: 'Any of these in parents, brothers, sisters or children?',
    sub: "'Not sure' is a fine answer.",
    type: 'multi',
    options: [
      'Diabetes',
      'Early heart disease or stroke',
      'High cholesterol',
      'Cancer',
      'Kidney disease',
      'An inherited condition',
      'None',
    ],
    exclusiveOptions: ['None'],
    skipLabel: 'Not sure',
  },
  {
    id: 'family_wider',
    sectionIndex: 6,
    prompt: 'And in grandparents, aunts or uncles?',
    type: 'multi',
    options: [
      'Diabetes',
      'Early heart disease or stroke',
      'High cholesterol',
      'Cancer',
      'Kidney disease',
      'An inherited condition',
      'None',
    ],
    exclusiveOptions: ['None'],
    skipLabel: 'Not sure',
  },
  {
    id: 'family_age',
    sectionIndex: 6,
    prompt: 'How old were they when it started?',
    type: 'single',
    options: ['Before 50', '50 or older'],
    skipLabel: 'Not sure',
    visibleWhen: (a) => hasNonExclusiveMulti(a.family) || hasNonExclusiveMulti(a.family_wider),
  },
  {
    id: 'family_variant',
    sectionIndex: 6,
    prompt: 'Has a family genetic test found an inherited variant?',
    type: 'single',
    options: ['Yes', 'No'],
    skipLabel: 'Not sure',
  },

  // 7 · Lifestyle (skippable)
  {
    id: 'diet',
    sectionIndex: 7,
    prompt: 'How would you describe your usual diet?',
    type: 'single',
    options: [
      'Mixed',
      'Vegetarian',
      'Vegan',
      'Low-carb or keto',
      'Intermittent fasting',
      'Medical or religious diet',
    ],
  },
  {
    id: 'veg',
    sectionIndex: 7,
    prompt: 'Fruit and vegetable servings a day',
    type: 'single',
    options: ['0–1', '2–3', '4 or more'],
  },
  {
    id: 'fried',
    sectionIndex: 7,
    prompt: 'Fried food, processed meat or sugary drinks',
    type: 'single',
    options: ['Rarely', 'A few times a week', 'Most days'],
  },
  {
    id: 'activity',
    sectionIndex: 7,
    prompt: 'Brisk activity in a typical week',
    type: 'single',
    options: ['Under 30 minutes', '30–149 minutes', '150+ minutes'],
    skipLabel: 'Not sure',
  },
  {
    id: 'strength',
    sectionIndex: 7,
    prompt: 'Strength training twice a week?',
    type: 'single',
    options: ['Yes', 'No', "Can't, because of a health limit"],
  },
  {
    id: 'steps',
    sectionIndex: 7,
    prompt: 'Track your steps on a phone or wearable?',
    type: 'single',
    options: ['Yes', 'No'],
  },
  {
    id: 'sleep',
    sectionIndex: 7,
    prompt: 'Sleep on most nights',
    type: 'single',
    options: ['Under 6 hours', '6–7 hours', '7–9 hours', 'Over 9 hours'],
  },
  {
    id: 'sleep_trouble',
    sectionIndex: 7,
    prompt: 'Trouble falling or staying asleep?',
    type: 'single',
    options: ['Yes', 'No'],
  },
  {
    id: 'snore',
    sectionIndex: 7,
    prompt: 'Do you snore loudly or wake gasping?',
    type: 'single',
    options: ['Yes', 'No'],
    skipLabel: 'Not sure',
  },
  {
    id: 'sleepy',
    sectionIndex: 7,
    prompt: 'Often sleepy during the day?',
    type: 'single',
    options: ['Yes', 'No'],
  },
  {
    id: 'sleep_aids',
    sectionIndex: 7,
    prompt: 'Alcohol or sleep medicines to fall asleep?',
    type: 'single',
    options: ['Yes', 'No'],
  },
  {
    id: 'stress',
    sectionIndex: 7,
    prompt: 'How is your stress level lately?',
    sub: '0 is none, 10 is extreme',
    type: 'scale',
  },
  {
    id: 'stress_health',
    sectionIndex: 7,
    prompt: 'Has stress or low mood made your health harder to manage?',
    type: 'single',
    options: ['Yes', 'No'],
    skipLabel: 'Prefer not to say',
  },
  {
    id: 'smoking',
    sectionIndex: 7,
    prompt: 'Smoking or tobacco use',
    type: 'single',
    options: ['Never', 'In the past', 'Yes, now'],
  },
  {
    id: 'alcohol',
    sectionIndex: 7,
    prompt: 'How often do you drink alcohol?',
    type: 'single',
    options: ['Never', 'Monthly or less', 'Weekly', 'Most days'],
  },
  {
    id: 'substances',
    sectionIndex: 7,
    prompt: 'Any recreational substances?',
    type: 'single',
    options: ['No', 'Sometimes', 'Often'],
    skipLabel: 'Prefer not to say',
  },
  {
    id: 'change_help',
    sectionIndex: 7,
    prompt: 'Want support changing any of these?',
    type: 'multi',
    options: ['Diet', 'Activity', 'Sleep', 'Stress', 'Smoking', 'Alcohol', 'Not right now'],
    exclusiveOptions: ['Not right now'],
  },

  // 8 · Measurements (skippable)
  {
    id: 'body',
    sectionIndex: 8,
    prompt: 'Body measurements',
    sub: 'Whatever you know.',
    type: 'measure',
    measureFields: [
      { key: 'height_in', label: 'Height (in)', placeholder: 'e.g. 65', numeric: true },
      { key: 'weight_lb', label: 'Weight (lb)', placeholder: 'e.g. 152', numeric: true },
      { key: 'waist_in', label: 'Waist (in)', placeholder: 'e.g. 34', numeric: true },
    ],
    skipLabel: "I don't know",
  },
  {
    id: 'bp_home',
    sectionIndex: 8,
    prompt: 'Measure blood pressure at home?',
    type: 'single',
    options: ['Yes', 'No'],
  },
  {
    id: 'bp_value',
    sectionIndex: 8,
    prompt: 'Latest home blood pressure',
    type: 'measure',
    measureFields: [
      { key: 'reading', label: 'Reading', placeholder: '120/80' },
      { key: 'when', label: 'Last measured', placeholder: 'e.g. last week' },
    ],
    skipLabel: "I don't know",
    visibleWhen: (a) => a.bp_home === 'Yes',
  },
  {
    id: 'glucose',
    sectionIndex: 8,
    prompt: 'Track blood sugar at home?',
    type: 'single',
    options: ['Glucose meter', 'Continuous monitor (CGM)', 'Neither'],
  },
  {
    id: 'wearable',
    sectionIndex: 8,
    prompt: 'Use a smartwatch or wearable?',
    type: 'single',
    options: ['Yes', 'No'],
  },
  {
    id: 'monitoring',
    sectionIndex: 8,
    prompt: 'Following a monitoring plan from your doctor?',
    type: 'single',
    options: ['Yes', 'No'],
  },
  {
    id: 'screenings',
    sectionIndex: 8,
    prompt: 'Any screenings or check-ups overdue?',
    type: 'single',
    options: ['Yes', 'No'],
    skipLabel: 'Not sure',
  },

  // 9 · Goals (skippable)
  {
    id: 'goals',
    sectionIndex: 9,
    prompt: 'What are your main health goals?',
    sub: 'Pick up to 3.',
    type: 'multi',
    maxPicks: 3,
    options: [
      "Bring my numbers closer to my doctor's targets",
      'Ease my symptoms',
      'See how my heart, kidneys and liver are doing',
      'Understand my test results',
      'Check my current care is working',
      'Build a routine for medicines and monitoring',
      'Improve diet, activity, sleep or weight',
      'Avoid complications and hospital stays',
      'More energy and easier movement',
      'Set a baseline and track change',
    ],
  },
  {
    id: 'top_goal',
    sectionIndex: 9,
    prompt: 'Which matters most?',
    type: 'single',
    options: (a) => (Array.isArray(a.goals) ? a.goals : []),
    visibleWhen: (a) => Array.isArray(a.goals) && a.goals.length >= 2,
  },
  {
    id: 'better',
    sectionIndex: 9,
    prompt: 'What would better look like in 3–6 months?',
    type: 'text',
    skipLabel: 'Skip',
  },
  {
    id: 'barriers',
    sectionIndex: 9,
    prompt: 'What makes managing your health hardest right now?',
    type: 'multi',
    options: [
      "I'm unsure what to do next",
      "I don't understand my results",
      'My symptoms make changes hard',
      'Sticking to treatment or monitoring',
      'Side effects of my current treatment',
      'Keeping up diet, exercise or sleep',
      'Limited time, money or access',
      'No clear plan or follow-up',
      'Other or not sure',
    ],
  },
  {
    id: 'measure_by',
    sectionIndex: 9,
    prompt: 'How would you like to track progress?',
    type: 'multi',
    options: [
      'A lab result or measurement',
      'Fewer or milder symptoms',
      'Steadier home readings',
      'Better energy, sleep or movement',
      'Sticking to my plan',
      'An overdue check-up done',
    ],
  },
  {
    id: 'help_first',
    sectionIndex: 9,
    prompt: 'Where would you like us to help first?',
    type: 'single',
    options: [
      'Understand where I stand',
      'Find missing tests',
      'A practical lifestyle plan',
      'Understand my results',
      'A summary for my doctor',
    ],
  },
  {
    id: 'support',
    sectionIndex: 9,
    prompt: 'What kind of support fits you best?',
    type: 'multi',
    options: [
      'Simple daily or weekly actions',
      'Reminders',
      'Help with test results',
      'Guidance that fits my routine',
      'Affordable next steps',
      'A report for my doctor',
    ],
  },
  {
    id: 'limits',
    sectionIndex: 9,
    prompt: 'Anything we should keep in mind when suggesting tests?',
    type: 'multi',
    options: [
      'Budget',
      'Time',
      'Getting to a lab',
      'Needle anxiety',
      "Tests I'd rather avoid",
      'None',
    ],
    exclusiveOptions: ['None'],
  },
];

export function applyMultiChoicePick(
  current: string[] | undefined,
  picked: string,
  exclusiveOptions: string[] = [],
  maxPicks?: number
): string[] {
  const prev = Array.isArray(current)
    ? current.filter((x) => x !== QUESTION_SKIPPED_SENTINEL)
    : [];

  if (prev.includes(picked)) {
    return prev.filter((x) => x !== picked);
  }

  if (exclusiveOptions.includes(picked)) {
    return [picked];
  }

  const withoutExclusives = prev.filter((x) => !exclusiveOptions.includes(x));
  const next = [...withoutExclusives, picked];
  if (maxPicks && next.length > maxPicks) {
    return next.slice(next.length - maxPicks);
  }
  return next;
}

export function isSectionSkipped(
  answers: Record<string, any>,
  sectionIndex: number
): boolean {
  return answers[`__skip_sec_${sectionIndex}`] === SECTION_SKIPPED_SENTINEL;
}

export function isQuestionAnswered(
  q: QuestionSpec,
  answers: Record<string, any>
): boolean {
  if (isSectionSkipped(answers, q.sectionIndex)) return true;
  const v = answers[q.id];
  if (v === QUESTION_SKIPPED_SENTINEL) return true;
  if (v === undefined || v === null) return false;
  if (q.type === 'multi') return Array.isArray(v) && v.length > 0;
  if (q.type === 'scale') return typeof v === 'number';
  if (q.type === 'measure') {
    return typeof v === 'object' && Object.values(v).some((val) => String(val || '').trim() !== '');
  }
  return String(v).trim() !== '';
}

export function getVisibleQuestions(answers: Record<string, any>): QuestionSpec[] {
  return QUESTIONNAIRE_QUESTIONS.filter((q) => {
    if (isSectionSkipped(answers, q.sectionIndex)) return false;
    return q.visibleWhen ? q.visibleWhen(answers) : true;
  });
}

export function findFirstUnansweredIndex(
  visibleQuestions: QuestionSpec[],
  answers: Record<string, any>
): number {
  const idx = visibleQuestions.findIndex((q) => !isQuestionAnswered(q, answers));
  return idx === -1 ? visibleQuestions.length : idx;
}

export function computeQuestionnaireSummary(answers: Record<string, any>): {
  concern: string;
  top_goal: string;
  barrier: string;
  support: string;
} {
  const cleanMulti = (val: unknown) =>
    Array.isArray(val)
      ? val.filter(
          (x) =>
            typeof x === 'string' &&
            !['None', 'No', 'None of these', QUESTION_SKIPPED_SENTINEL].includes(x)
        )
      : [];

  const conds = cleanMulti(answers.conditions);
  const topSyms = cleanMulti(answers.symptom_top);
  const syms = cleanMulti(answers.symptoms);
  const reasons = cleanMulti(answers.reason);

  const concern =
    conds[0] || topSyms[0] || syms[0] || reasons[0] || 'Not shared';

  const goals = cleanMulti(answers.goals);
  const topGoal =
    (typeof answers.top_goal === 'string' &&
    answers.top_goal !== QUESTION_SKIPPED_SENTINEL &&
    answers.top_goal.trim()
      ? answers.top_goal
      : goals[0]) || 'Not shared';

  const barriers = cleanMulti(answers.barriers);
  const barrier = barriers.slice(0, 2).join('; ') || 'Not shared';

  const supports = cleanMulti(answers.support);
  const support = supports.slice(0, 2).join('; ') || 'Not shared';

  return {
    concern,
    top_goal: topGoal,
    barrier,
    support,
  };
}
