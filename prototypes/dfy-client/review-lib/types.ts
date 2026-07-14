/** Domain types for the Blaze DFY onboarding prototype. */

export type PhaseId = 1 | 2 | 3;

export type AccountStatus = 'invited' | 'onboarding' | 'live';

export interface POC {
  name: string;
  email: string;
  phone: string;
  role?: string;
}

/** Blaze-side account manager. */
export interface AccountManager {
  name: string;
  initials: string;
}

export interface BrandColor {
  hex: string;
  name: string;
}

export interface BrandFont {
  family: string;
  role: 'Display' | 'Heading' | 'Body';
}

export interface UploadDoc {
  id: string;
  label: string;
  kind: 'Brand guidelines' | 'Tone of voice' | 'Words to avoid' | 'Photos' | 'Target audiences';
  fileName?: string;
  status: 'empty' | 'uploaded';
}

/** Brand assets scanned from the web in Phase 1, editable by the AM. */
export interface BrandScan {
  logos: { id: string; bg: string; label: string; src?: string }[];
  fonts: BrandFont[];
  colors: BrandColor[];
  website: string;
  docs: UploadDoc[];
}

export interface PhaseProgress {
  id: PhaseId;
  name: string;
  status: 'not_started' | 'in_progress' | 'complete';
}

/* ─── Strategy (Phase 2) ─────────────────────────────────────────────────── */
export interface BrandContext {
  businessOverview: string;
  customerSegments: { name: string; detail: string }[];
  services: { name: string; detail: string }[];
  founderBio: string;
}

export interface CreativeGuidelines {
  taglines: string[];
  toneSummary: string;
  toneExamples: { do: string; dont: string }[];
  vocabulary: { term: string; meaning: string }[];
}

export type AuditDimension = 'Awareness' | 'Lead Gen' | 'Website' | 'Conversion' | 'Reputation';

export interface Competitor {
  name: string;
  initials: string;
  color: string;
  note: string;
  scores: Record<AuditDimension, number>; // 0–100
}

export interface Goals {
  thirty: string;
  sixty: string;
  ninety: string;
  channels: string[];
  drivingGrowth: string;
  worked: string;
  notWorked: string;
  companyEvents: { date: string; label: string }[];
  industryEvents: { date: string; label: string }[];
}

export interface CampaignTheme {
  id: string;
  title: string;
  angle: string;
  recommended?: boolean;
}

/* ─── Creative Review (Phase 3) ──────────────────────────────────────────── */
export type AssetType =
  | 'Still Image' | 'Video' | 'Carousel' | 'Story'
  | 'Search Ad' | 'Meta Ad' | 'Blog Post' | 'Email';

export interface GeneratedAsset {
  id: string;
  type: AssetType;
  topic: string;
  caption: string;
  overlay: string;
  seed: number;
}

export interface SeoKeyword {
  keyword: string;
  intent: 'Informational' | 'Commercial' | 'Local';
  volume: string;
  difficulty: 'Low' | 'Medium' | 'High';
  why: string;
}

export interface WeekTheme {
  week: string;
  title: string;
  description: string;
  season: string;
}

export interface SwipeItem {
  id: string;
  source: string;
  channel: string;
  headline: string;
  note: string;
  seed: number;
}

export type ScoreStatus = 'bad' | 'warn' | 'good';

export interface ScorecardCheck {
  status: ScoreStatus;
  title: string;
  pts: string;
  desc: string;
}

export interface ScorecardArea {
  number: number;
  eyebrow: string;
  title: string;
  platforms: string[];
  score: number;
  maxScore: number;
  status: ScoreStatus;
  checks: ScorecardCheck[];
}

export interface Scorecard {
  reviewed: number;
  needWork: number;
  overall: number;
  overallMax: number;
  areas: ScorecardArea[];
}

export interface Account {
  /** Slug used in routes, e.g. 'woody-creek'. */
  id: string;
  name: string;
  industry: string;
  location: string;
  website: string;
  domain: string;
  /** The client's own brand accent - colors their workspace, not Blaze chrome. */
  accent: string;
  poc: POC;
  am: AccountManager;
  status: AccountStatus;
  invitedDaysAgo: number;
  invitedDate: string;
  /** Current phase the account sits in (1–3). */
  phase: PhaseId;
  /** Human label for exactly where they are, e.g. "Strategy, Competitive audit". */
  stepLabel: string;
  /** Overall onboarding completion across all three phases (0–100). */
  progressPct: number;
  /** AI-suggested next action for the AM. */
  aiNextStep: string;
  phases: PhaseProgress[];
  brand: BrandScan;
  /** Signed contract term in months, set once a workspace goes live. */
  contractTerm?: 3 | 6 | 12;
  /** When the live contract ends (ISO date). Drives renewal warnings. */
  contractEndDate?: string;
}
