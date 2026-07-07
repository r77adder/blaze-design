/**
 * Creative Review — sample-wave planning + generation model.
 *
 * The AM plans what to generate (PlanRow[]), generates samples in waves, marks
 * the ones worth the customer's time (`includeInReview`), and those flow into
 * the Visual review step. Also holds the inferred-taste / brand-guidelines
 * seeds surfaced in the Feedback summary.
 */
import type { Account, AssetType, GeneratedAsset } from './types';

/* ─── Sample / wave model ────────────────────────────────────────────────── */

/** A generated (or uploaded) sample. Extends GeneratedAsset so it renders in the
 *  existing visual-review AssetCard unchanged. */
export interface SampleItem extends GeneratedAsset {
  /** Target channel slug, e.g. 'instagram_post'. */
  channel: string;
  status: 'generating' | 'done';
  /** Marked by the AM to appear in the customer's visual review. */
  includeInReview: boolean;
  /** True when the AM uploaded their own asset instead of generating it. */
  custom?: boolean;
  /** The client's per-piece verdict once they've reviewed (Reviewed state). */
  reviewStatus?: 'approved' | 'changes';
  reviewNote?: string;
}

/** One generation pass. Each "Generate" / "Regenerate all" appends a wave. */
export interface Wave {
  id: string;
  label: string;
  /** Free-text guidance the AM gave for this wave (warmer tones, bigger logo…). */
  guidance?: string;
  items: SampleItem[];
}

/** A row in the planning table — "generate N of <type> about <topic> for <channel>". */
export interface PlanRow {
  id: string;
  type: AssetType;
  count: number;
  topic: string;
  channel: string;
}

/** Formats offered in the planner (subset of AssetType that maps to a channel). */
export const SAMPLE_TYPES: AssetType[] = ['Still Image', 'Video', 'Carousel', 'Story', 'Blog Post', 'Email'];

/** Channel options for the planner Select (value + human label). */
export const CHANNELS: { value: string; label: string }[] = [
  { value: 'instagram_post', label: 'Instagram post' },
  { value: 'instagram_story', label: 'Instagram story' },
  { value: 'instagram_reel', label: 'Instagram reel' },
  { value: 'facebook_post', label: 'Facebook post' },
  { value: 'blog', label: 'Blog' },
  { value: 'email', label: 'Email' },
];

/** Sensible default channel for a format. */
export const CHANNEL_FOR_TYPE: Record<string, string> = {
  'Still Image': 'instagram_post',
  Video: 'instagram_reel',
  Carousel: 'instagram_post',
  Story: 'instagram_story',
  'Blog Post': 'blog',
  Email: 'email',
};

let rowSeq = 1;
export const newRowId = () => `row-${rowSeq++}`;

/** Seeded plan, loosely themed off the account — the AM tweaks before generating. */
export function defaultPlan(account: Account): PlanRow[] {
  const seeds: [AssetType, string][] = [
    ['Still Image', 'Local focus, signature work'],
    ['Still Image', 'Why customers choose us'],
    ['Carousel', '3 things to know before you book'],
    ['Story', `${account.industry} — a day on the job`],
    ['Video', 'Before & after, in motion'],
  ];
  return seeds.map(([type, topic]) => ({
    id: newRowId(),
    type,
    count: 1,
    topic,
    channel: CHANNEL_FOR_TYPE[type] ?? 'instagram_post',
  }));
}

let waveSeq = 1;
/** Build a fresh wave from the plan. Items start `generating` — the UI flips
 *  them to `done` after a short delay to mimic the model working. */
export function waveFromPlan(plan: PlanRow[], account: Account, guidance?: string): Wave {
  const idx = waveSeq++;
  const items: SampleItem[] = [];
  plan.forEach((row, ri) => {
    for (let i = 0; i < Math.max(1, row.count); i++) {
      items.push({
        id: `w${idx}-r${ri}-${i}`,
        type: row.type,
        topic: row.topic,
        caption: `${row.topic}. ${account.name} — book your free estimate this week and see the difference a local crew makes.`,
        overlay: row.topic,
        seed: idx * 1000 + ri * 10 + i,
        channel: row.channel,
        status: 'generating',
        includeInReview: true,
      });
    }
  });
  return { id: `wave-${idx}`, label: idx === 1 ? 'First wave' : `Wave ${idx}`, guidance, items };
}

let customSeq = 1;
/** An AM-uploaded asset, dropped straight into a wave as a finished sample. */
export function customSample(type: AssetType = 'Still Image'): SampleItem {
  const n = customSeq++;
  return {
    id: `custom-${n}`,
    type,
    topic: 'Your upload',
    caption: 'Uploaded by your team.',
    overlay: 'Your upload',
    seed: 90000 + n,
    channel: CHANNEL_FOR_TYPE[type] ?? 'instagram_post',
    status: 'done',
    includeInReview: true,
    custom: true,
  };
}

/** All samples across every wave the AM marked for the customer to review. */
export const reviewItems = (waves: Wave[]): SampleItem[] =>
  waves.flatMap((w) => w.items).filter((it) => it.includeInReview);

/** A finished, already-reviewed wave for the "Reviewed" demo state — every piece
 *  is done + included, with a per-piece client verdict (a realistic mix of
 *  approved and changes-requested). */
export function reviewedWave(account: Account): Wave {
  const wave = waveFromPlan(defaultPlan(account), account);
  const verdicts: { status: 'approved' | 'changes'; note?: string }[] = [
    { status: 'approved' },
    { status: 'approved' },
    { status: 'changes', note: 'Love the concept — warm up the tone and cut the caption in half.' },
    { status: 'approved' },
    { status: 'changes', note: 'Lead with the finished floor, not the install process.' },
  ];
  return {
    ...wave,
    label: 'First wave',
    items: wave.items.map((it, i) => ({
      ...it,
      status: 'done' as const,
      includeInReview: true,
      reviewStatus: verdicts[i]?.status ?? 'approved',
      reviewNote: verdicts[i]?.note,
    })),
  };
}

/* ─── Feedback summary: inferred taste + editable brand guidelines ────────── */

export interface BrandTaste {
  summary: string;
  liked: string[];
  tone: string;
  taglines: string[];
  doList: string[];
  dontList: string[];
  visualNotes: string[];
}

/** What the model inferred the customer likes, from this round's approvals. */
export function inferredTaste(account: Account): BrandTaste {
  return {
    summary: `${account.name} consistently approved content with a confident, aspirational tone and visually striking imagery — concise, professional captions and a darker, sophisticated aesthetic.`,
    liked: [
      'Short, sweet, professional captions',
      'Contrasting / dichotomous themes',
      'Dark, moody visual themes',
      'Aspirational, empowering messaging',
    ],
    tone: 'Empowering, aspirational, and sophisticated.',
    taglines: ['Elevate your journey.', 'Style that moves with purpose.', 'Unleash your potential.'],
    doList: [
      'Use professional, concise language.',
      'Highlight empowerment and aspiration.',
      'Create engaging dichotomies in messaging.',
    ],
    dontList: [
      'Include overly casual or lengthy descriptions.',
      'Focus on mundane or uninspiring aspects.',
      'Present bland, one-dimensional concepts.',
    ],
    visualNotes: [
      'Dark, moody color palettes.',
      'Urban / on-location backdrops.',
      'Active, confident individuals.',
      'Motion blur to convey dynamism.',
      'Clear, prominent text overlays.',
    ],
  };
}

export interface BrandGuidelinesData {
  tone: string[];
  leanInto: string[];
  avoid: string[];
  visual: string[];
}

/** Editable guidelines that steer every future generation. Pre-filled from the
 *  brand kit + this round's learnings; editing here "replaces" the Brand Kit. */
export function defaultGuidelines(account: Account): BrandGuidelinesData {
  return {
    tone: [
      `${account.name} speaks with a confident, inspiring voice — innovation, performance, and style for a dynamic, active audience.`,
      'Empowering, aspirational, and sophisticated.',
    ],
    leanInto: [
      'Highlight performance and craft in every message.',
      'Incorporate motivation and empowerment.',
      'Use professional, concise language.',
      'Create engaging dichotomies in messaging.',
    ],
    avoid: [
      'Overly technical jargon.',
      'Disconnecting from the local community.',
      'Unsubstantiated claims.',
      'Overly casual or lengthy descriptions.',
      'Bland, one-dimensional concepts.',
    ],
    visual: [
      'Dark, moody color palettes.',
      'On-location / cityscape backdrops.',
      'Active, confident individuals.',
    ],
  };
}
