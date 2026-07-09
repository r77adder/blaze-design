// ══════════════════════════════════════════════════════════════════════════
// Qualification criteria — question schema, validation, and prompt generation
//
// One source of truth drives three surfaces:
//   1. The Qualification Criteria builder on the Agent tab
//   2. The copyable system-prompt snippets (info collection + evaluation),
//      used across voice, SMS, and chat
//   3. The website prequalification form's field list
// ══════════════════════════════════════════════════════════════════════════

export type QuestionType = 'freeform' | 'multiple-choice';

export type ResponseFormat = 'text' | 'name' | 'phone' | 'email' | 'zip' | 'number' | 'currency';

export const RESPONSE_FORMATS: { id: ResponseFormat; label: string; placeholder: string }[] = [
  { id: 'name', label: 'Name', placeholder: 'e.g. Jordan Lee' },
  { id: 'phone', label: 'Phone number', placeholder: 'e.g. (512) 555-0148' },
  { id: 'email', label: 'Email address', placeholder: 'e.g. jordan@email.com' },
  { id: 'zip', label: 'Zip code', placeholder: 'e.g. 78701' },
  { id: 'currency', label: 'Dollar amount', placeholder: 'e.g. 7500' },
  { id: 'number', label: 'Number', placeholder: 'e.g. 3' },
  { id: 'text', label: 'Any text', placeholder: 'e.g. Not sure yet, still deciding' },
];

export type QualificationMode = 'all' | 'threshold' | 'allowed-list' | 'selected-options';

export type ThresholdOperator = '>' | '>=' | '<' | '<=' | '=';

export const THRESHOLD_OPERATORS: { id: ThresholdOperator; label: string; symbol: string }[] = [
  { id: '>', label: 'greater than', symbol: '>' },
  { id: '>=', label: 'at least', symbol: '≥' },
  { id: '<', label: 'less than', symbol: '<' },
  { id: '<=', label: 'at most', symbol: '≤' },
  { id: '=', label: 'equal to', symbol: '=' },
];

export interface QualificationRule {
  mode: QualificationMode;
  /** Used when mode === 'threshold'. */
  operator: ThresholdOperator;
  threshold: number;
  /** Used when mode === 'allowed-list' (e.g. zip codes in the service area). */
  allowedValues: string[];
  /** Used when mode === 'selected-options' (multiple-choice only). */
  qualifyingOptions: string[];
}

export interface QualificationQuestion {
  id: string;
  label: string;
  type: QuestionType;
  /** Only meaningful when type === 'freeform'. */
  responseFormat: ResponseFormat;
  /** Only meaningful when type === 'multiple-choice'. */
  options: string[];
  rule: QualificationRule;
}

export function slugify(label: string): string {
  const slug = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return slug || 'question';
}

function defaultRule(): QualificationRule {
  return { mode: 'all', operator: '>', threshold: 0, allowedValues: [], qualifyingOptions: [] };
}

export function blankQuestion(): QualificationQuestion {
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: '',
    type: 'freeform',
    responseFormat: 'text',
    options: [],
    rule: defaultRule(),
  };
}

export const DEFAULT_QUALIFICATION_QUESTIONS: QualificationQuestion[] = [
  {
    id: 'q-name', label: 'Full name', type: 'freeform', responseFormat: 'name', options: [],
    rule: defaultRule(),
  },
  {
    id: 'q-phone', label: 'Phone number', type: 'freeform', responseFormat: 'phone', options: [],
    rule: defaultRule(),
  },
  {
    id: 'q-zip', label: 'Zip code', type: 'freeform', responseFormat: 'zip', options: [],
    rule: {
      mode: 'allowed-list', operator: '>', threshold: 0, qualifyingOptions: [],
      allowedValues: ['78701', '78702', '78703', '78704', '78705', '78610', '78613', '78620', '78641', '78660', '78664', '78681'],
    },
  },
  {
    id: 'q-budget', label: 'Project budget', type: 'freeform', responseFormat: 'currency', options: [],
    rule: { mode: 'threshold', operator: '>', threshold: 5000, allowedValues: [], qualifyingOptions: [] },
  },
  {
    id: 'q-service', label: 'Primary service desired', type: 'multiple-choice', responseFormat: 'text',
    options: ['Hardwood floor', 'Laminate floor', 'Vinyl floor', 'Carpet'],
    rule: defaultRule(),
  },
];

// ── Validation ───────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  error?: string;
  normalized?: string;
}

export function validateResponse(question: QualificationQuestion, raw: string): ValidationResult {
  const value = raw.trim();
  if (!value) return { valid: false, error: 'A response is required.' };

  if (question.type === 'multiple-choice') {
    const match = question.options.find((o) => o.toLowerCase() === value.toLowerCase());
    return match
      ? { valid: true, normalized: match }
      : { valid: false, error: `Must be one of: ${question.options.filter(Boolean).join(', ') || '(no options set)'}.` };
  }

  switch (question.responseFormat) {
    case 'phone': {
      const digits = value.replace(/\D/g, '');
      const normalized = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
      return normalized.length === 10
        ? { valid: true, normalized }
        : { valid: false, error: 'Must be a valid 10-digit phone number.' };
    }
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? { valid: true, normalized: value.toLowerCase() }
        : { valid: false, error: 'Must be a valid email address.' };
    case 'zip': {
      const digits = value.replace(/\D/g, '').slice(0, 5);
      return /^\d{5}$/.test(digits)
        ? { valid: true, normalized: digits }
        : { valid: false, error: 'Must be a valid 5-digit zip code.' };
    }
    case 'number': {
      const n = Number(value.replace(/,/g, ''));
      return Number.isFinite(n)
        ? { valid: true, normalized: String(n) }
        : { valid: false, error: 'Must be a number.' };
    }
    case 'currency': {
      const n = Number(value.replace(/[$,]/g, ''));
      return Number.isFinite(n)
        ? { valid: true, normalized: String(n) }
        : { valid: false, error: 'Must be a dollar amount, e.g. 5000.' };
    }
    case 'name':
      return value.length >= 2
        ? { valid: true, normalized: value }
        : { valid: false, error: 'Must be at least 2 characters.' };
    default:
      return { valid: true, normalized: value };
  }
}

// ── Qualification evaluation ────────────────────────────────────────────────

export interface QualificationResult {
  qualifies: boolean;
  reason: string;
}

const THRESHOLD_COMPARATORS: Record<ThresholdOperator, (a: number, b: number) => boolean> = {
  '>': (a, b) => a > b,
  '>=': (a, b) => a >= b,
  '<': (a, b) => a < b,
  '<=': (a, b) => a <= b,
  '=': (a, b) => a === b,
};

export function evaluateQualification(question: QualificationQuestion, raw: string): QualificationResult {
  const validation = validateResponse(question, raw);
  if (!validation.valid) return { qualifies: false, reason: validation.error ?? 'Invalid response.' };
  const normalized = validation.normalized ?? raw.trim();
  const rule = question.rule;

  switch (rule.mode) {
    case 'all':
      return { qualifies: true, reason: 'All responses qualify.' };
    case 'threshold': {
      const n = Number(normalized);
      const pass = THRESHOLD_COMPARATORS[rule.operator](n, rule.threshold);
      const opLabel = THRESHOLD_OPERATORS.find((o) => o.id === rule.operator)?.symbol ?? rule.operator;
      return pass
        ? { qualifies: true, reason: `${n} is ${opLabel} ${rule.threshold}.` }
        : { qualifies: false, reason: `${n} is not ${opLabel} ${rule.threshold}.` };
    }
    case 'allowed-list': {
      const allowed = rule.allowedValues.map((v) => v.trim().toLowerCase()).filter(Boolean);
      const pass = allowed.includes(normalized.toLowerCase());
      return pass
        ? { qualifies: true, reason: `${normalized} is in the allowed list.` }
        : { qualifies: false, reason: `${normalized} is not in the allowed list.` };
    }
    case 'selected-options': {
      const pass = rule.qualifyingOptions.some((o) => o.toLowerCase() === normalized.toLowerCase());
      return pass
        ? { qualifies: true, reason: `"${normalized}" qualifies.` }
        : { qualifies: false, reason: `"${normalized}" does not qualify.` };
    }
  }
}

// ── Prompt generation ────────────────────────────────────────────────────────

function collectionInstructionFor(q: QualificationQuestion): string {
  if (q.type === 'multiple-choice') {
    const options = q.options.filter(Boolean).join(', ') || '(no options set)';
    return `multiple choice — ask the caller to choose one: ${options}. If their answer doesn't clearly match one of these, ask a clarifying question.`;
  }
  switch (q.responseFormat) {
    case 'phone':
      return 'freeform — must be a valid phone number (10 digits, optionally with a country code). If incomplete or unclear, ask the caller to repeat it.';
    case 'email':
      return "freeform — must be a valid email address. If unclear, ask the caller to spell it out.";
    case 'zip':
      return 'freeform — must be a valid 5-digit US zip code. If unclear, ask the caller to repeat it.';
    case 'currency':
      return "freeform — a dollar amount. If the caller gives a range, use the midpoint. If they're unsure, ask for a rough estimate.";
    case 'number':
      return 'freeform — a number.';
    case 'name':
      return "freeform — the caller's name. Ask them to repeat or spell it if unclear.";
    default:
      return 'freeform — accept any reasonable response.';
  }
}

/** System-prompt snippet: what to ask and how to validate each answer. Paste
 *  into the information-collection section of the agent's system prompt. */
export function generateCollectionPrompt(questions: QualificationQuestion[]): string {
  if (questions.length === 0) return '';
  const lines = questions.map((q, i) => `${i + 1}. ${q.label || 'Untitled question'} — ${collectionInstructionFor(q)}`);
  return [
    'Collect the following information from every caller before proceeding. Ask one question at a time, in this order, and validate each response before moving on — if a response is invalid or unclear, ask the caller to repeat or clarify it rather than guessing:',
    '',
    ...lines,
    '',
    'Do not skip a question or move on to the next until you have a valid response for the current one.',
  ].join('\n');
}

function qualificationInstructionFor(q: QualificationQuestion): string {
  const rule = q.rule;
  switch (rule.mode) {
    case 'all':
      return 'always qualifies, regardless of the response.';
    case 'threshold': {
      const op = THRESHOLD_OPERATORS.find((o) => o.id === rule.operator);
      const amount = q.responseFormat === 'currency' ? `$${rule.threshold.toLocaleString()}` : String(rule.threshold);
      return `qualifies only if the value is ${op?.label ?? rule.operator} ${amount}. Otherwise this lead is NOT qualified on this criterion.`;
    }
    case 'allowed-list': {
      const list = rule.allowedValues.filter(Boolean).join(', ') || '(no values set)';
      return `qualifies only if the response matches one of: ${list}. Otherwise this lead is NOT qualified on this criterion.`;
    }
    case 'selected-options': {
      const qualifying = rule.qualifyingOptions.filter(Boolean).join(', ') || '(none selected)';
      const disqualifying = q.options.filter((o) => !rule.qualifyingOptions.includes(o)).join(', ');
      return `qualifies only if the caller selects one of: ${qualifying}.${disqualifying ? ` Selecting ${disqualifying} does NOT qualify.` : ''}`;
    }
  }
}

/** System-prompt snippet: how to decide whether a lead is qualified, based on
 *  the responses collected via `generateCollectionPrompt`. */
export function generateQualificationPrompt(questions: QualificationQuestion[]): string {
  if (questions.length === 0) return '';
  const lines = questions.map((q, i) => `${i + 1}. ${q.label || 'Untitled question'} — ${qualificationInstructionFor(q)}`);
  return [
    'After all responses above are collected, evaluate qualification using the rules below. A lead is QUALIFIED only if every rule passes:',
    '',
    ...lines,
    '',
    'If every rule passes, mark the lead as QUALIFIED and proceed to booking or next steps. If any rule fails, mark the lead as NOT QUALIFIED, politely explain why using the relevant criterion, and follow the disqualification flow instead of booking.',
  ].join('\n');
}

// ── Drift detection ──────────────────────────────────────────────────────
//
// The system prompt and the website form are both external artifacts that
// only reflect the questions above once someone pastes the snippet in (or
// hits Activate/Re-sync). Editing questions afterward doesn't retroactively
// update either one, so the UI needs to flag when they've drifted.

/** True once the agent's system prompt contains both generated snippets
 *  verbatim. False (out of sync) whenever a question changes after the
 *  snippet was pasted in — including on the very first render, since a
 *  freshly-written system prompt won't literally contain the snippet yet. */
export function systemPromptIsInSync(systemPrompt: string, questions: QualificationQuestion[]): boolean {
  const collection = generateCollectionPrompt(questions);
  const qualification = generateQualificationPrompt(questions);
  if (!collection || !qualification) return true;
  return systemPrompt.includes(collection) && systemPrompt.includes(qualification);
}
