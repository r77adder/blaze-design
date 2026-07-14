import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Heading, Text, Button } from '@/components';
import { StatusPill, Pill, useToast } from '@/staging';
import ChevronUp from '@/icons/20/ChevronUp';
import ChevronDown from '@/icons/20/ChevronDown';
import HelpCircleContained from '@/icons/24/HelpCircleContained';
import Edit3 from '@/icons/20/Edit3';
import Check2 from '@/icons/20/Check2';
import { ClientShell, BackTitle } from './shell';

// ─── Account type (copied from blaze-dfy lib/types.ts, the parts the client
//     scorecard view + S.competitors actually read) ────────────────────────

type PhaseId = 1 | 2 | 3;
type AccountStatus = 'invited' | 'onboarding' | 'live';

interface POC {
  name: string;
  email: string;
  phone: string;
  role?: string;
}

interface AccountManager {
  name: string;
  initials: string;
}

interface BrandColor {
  hex: string;
  name: string;
}

interface BrandFont {
  family: string;
  role: 'Display' | 'Heading' | 'Body';
}

interface UploadDoc {
  id: string;
  label: string;
  kind: 'Brand guidelines' | 'Tone of voice' | 'Words to avoid' | 'Photos' | 'Target audiences';
  fileName?: string;
  status: 'empty' | 'uploaded';
}

interface BrandScan {
  logos: { id: string; bg: string; label: string; src?: string }[];
  fonts: BrandFont[];
  colors: BrandColor[];
  website: string;
  docs: UploadDoc[];
}

interface PhaseProgress {
  id: PhaseId;
  name: string;
  status: 'not_started' | 'in_progress' | 'complete';
}

type AuditDimension = 'Awareness' | 'Lead Gen' | 'Website' | 'Conversion' | 'Reputation';

interface Competitor {
  name: string;
  initials: string;
  color: string;
  note: string;
  scores: Record<AuditDimension, number>; // 0–100
}

interface Account {
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

// ─── Competitor generation (copied from blaze-dfy lib/strategy.ts, only the
//     pieces buildScorecardData() reads via S.competitors) ─────────────────

const COMP_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

function competitors(a: Account): Competitor[] {
  const city = a.location.split(',')[0];
  const names: [string, string][] = [
    [`${city} Pro ${shortKind(a)}`, 'Established local leader with strong reviews.'],
    [`${shortKind(a)} Co.`, 'Aggressive on paid search, thin on organic.'],
    [`Bright ${shortKind(a)}`, 'Newer, heavy on social, weak website.'],
  ];
  return names.map(([name, note], i) => ({
    name,
    initials: name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase(),
    color: COMP_COLORS[i % COMP_COLORS.length],
    note,
    scores: {
      Awareness: [78, 64, 52][i],
      'Lead Gen': [70, 75, 40][i],
      Website: [82, 55, 38][i],
      Conversion: [68, 60, 45][i],
      Reputation: [88, 58, 62][i],
    },
  }));
}

function shortKind(a: Account): string {
  const k = a.industry.split(/[&,]/)[0].trim();
  return k.split(' ').slice(-1)[0];
}

const S = { competitors };

// ─── Types ──────────────────────────────────────────────────────────────────

interface ScorecardSection {
  id: string;
  title: string;
  score: number; // 0–100, see METHODOLOGY below
  strengths: string[];
  weaknesses: string[];
  nextSteps: { label: string; effort: 'quick' | 'medium' | 'project' }[];
}

interface LocalCompetitor {
  id: string;
  name: string;
  website: string;
  gbp: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  source: 'gbp' | 'manual';
  note: string;
  scores: { 'Paid Ads': number; 'Organic': number; 'Website': number; 'Reputation': number };
}

interface ScorecardData {
  sections: ScorecardSection[];
  competitors: LocalCompetitor[];
  ourName: string;
  ourScores: { 'Paid Ads': number; 'Organic': number; 'Website': number; 'Reputation': number };
  overallRank: number;
  summary: string;
}

// ─── Score methodology ───────────────────────────────────────────────────────
//
// Each section is scored 0–100 from publicly visible signals:
//
//   Paid Ads (0–100)
//     • Active Google Search ads detected:     +35 pts
//     • Active Meta/social ads in last 90 days: +35 pts
//     • Conversion tracking configured:         +20 pts
//     • Branded keyword defense:                +10 pts
//
//   Organic Presence (0–100)
//     • Posting ≥ 8×/month across channels:    +35 pts (scaled by cadence)
//     • GBP: photos + posts updated ≤ 30 days: +30 pts
//     • Active on 3+ platforms:                +20 pts
//     • Has video / short-form content:         +15 pts
//
//   Website & Conversion (0–100)
//     • Mobile LCP < 2.5 s (Core Web Vitals):  +30 pts
//     • Strong primary CTA ("Free estimate"):   +25 pts
//     • Lead form ≤ 4 fields:                   +20 pts
//     • Trust signals (reviews, badges):        +25 pts
//
//   Reputation (0–100)
//     • Avg rating × 20 (max 5★ = 100):        +40 pts
//     • Review count tier (≥50 = full):         +30 pts (scaled)
//     • ≥2 new reviews/month:                   +20 pts
//     • Owner response rate ≥ 80%:              +10 pts
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── Data generation ────────────────────────────────────────────────────────

function buildScorecardData(account: Account): ScorecardData {
  const city = account.location.split(',')[0];
  const comp = S.competitors(account);

  const sections: ScorecardSection[] = [
    {
      id: 'paid',
      title: 'Paid Ads',
      score: 12,
      strengths: [
        'Conversion tracking is partially installed, analytics are live',
        'Website has a phone number in the header, so paid traffic has a clear exit',
      ],
      weaknesses: [
        `No active Google Search campaigns. Competitors in ${city} are bidding on high-intent terms right now`,
        'Zero Meta ad spend in the last 90 days while competitors run always-on local reels',
        'No branded keyword protection. A competitor may be intercepting your name searches',
      ],
      nextSteps: [
        { label: 'Launch a "free estimate" Google Search campaign targeting local keywords', effort: 'quick' },
        { label: 'Set up a retargeting audience from existing website traffic', effort: 'quick' },
        { label: 'Configure conversion events (form submit, click-to-call) in GA4', effort: 'medium' },
      ],
    },
    {
      id: 'organic',
      title: 'Organic Presence',
      score: 34,
      strengths: [
        'Business is established on both Facebook and Instagram',
        `Google Business Profile is claimed and shows up in ${city} map results`,
        'Past posts with before/after content drove strong organic reach',
      ],
      weaknesses: [
        'Posting cadence has stalled. Last social post was 30+ days ago',
        'Google Business Profile is missing recent photos and has no posts in months',
        'Organic reach is limited by single-channel distribution, no TikTok or YouTube Shorts',
        'No local SEO content targeting city + service keywords',
      ],
      nextSteps: [
        { label: 'Post 2× per week minimum. Before/after photos and crew shots perform best in this category', effort: 'quick' },
        { label: 'Add 5+ fresh photos to Google Business Profile and publish a monthly GBP post', effort: 'quick' },
        { label: 'Build a "best [service] in [city]" landing page targeting local search intent', effort: 'project' },
      ],
    },
    {
      id: 'website',
      title: 'Website & Conversion',
      score: 58,
      strengths: [
        'Click-to-call is visible on every page, critical for a services business',
        'Reviews, licensing badges, and "insured" signals are present above the fold',
        'The site is mobile-responsive and loads correctly on small screens',
      ],
      weaknesses: [
        '"Contact us" is the primary CTA. "Get a free estimate" converts 30–60% better',
        'Mobile LCP is slow. Around 30% of visitors likely bounce before the page loads',
        'Lead form has too many fields; trimming to name, phone, ZIP, and project type reduces drop-off',
      ],
      nextSteps: [
        { label: 'Swap the hero CTA copy from "Contact us" to "Get a free estimate"', effort: 'quick' },
        { label: 'Compress hero images and enable lazy-load on below-fold assets to fix LCP', effort: 'medium' },
        { label: 'Trim the lead form to 4 fields and A/B test a floating call button', effort: 'medium' },
      ],
    },
    {
      id: 'reputation',
      title: 'Reputation',
      score: 72,
      strengths: [
        '4.7★ average rating across Google, Yelp, and Facebook, the strongest asset in the market',
        'Owner is responding to most reviews. Response rate lifts conversion ~11%',
        'Review quality is high; several mention specific crew members by name',
      ],
      weaknesses: [
        `Behind the top ${city} competitors on total review count. Volume is a ranking signal`,
        'New review velocity has slowed. Less than 2 new reviews/month recently',
        '3 unanswered negative reviews are visible on Google. Each can deter 30 potential customers',
      ],
      nextSteps: [
        { label: 'Respond to the 3 unanswered Google reviews this week', effort: 'quick' },
        { label: 'Add a post-job review ask via text (SMS link) for every completed project', effort: 'medium' },
        { label: 'Set a goal of 5 new reviews/month and track it in your monthly report', effort: 'medium' },
      ],
    },
  ];

  const ourScores = { 'Paid Ads': 12, 'Organic': 34, 'Website': 58, 'Reputation': 72 };

  const competitors: LocalCompetitor[] = comp.slice(0, 3).map((c, i) => ({
    id: `c${i}`,
    name: c.name,
    website: '',
    gbp: '',
    source: 'gbp',
    note: c.note,
    scores: {
      'Paid Ads': [68, 55, 22][i],
      'Organic': [72, 45, 58][i],
      'Website': [65, 40, 35][i],
      'Reputation': [82, 60, 55][i],
    },
  }));

  const ourOverall = Math.round(Object.values(ourScores).reduce((a, b) => a + b, 0) / 4);
  const allScores = [ourOverall, ...competitors.map((c) => Math.round(Object.values(c.scores).reduce((a, b) => a + b, 0) / 4))].sort((a, b) => b - a);
  const rank = allScores.indexOf(ourOverall) + 1;
  const total = allScores.length;

  const topSection = [...sections].sort((a, b) => b.score - a.score)[0];
  const bottomSection = [...sections].sort((a, b) => a.score - b.score)[0];

  const summary = `${account.name} scores ${ourOverall}/100 overall, ranking #${rank} of ${total} businesses in ${city}. `
    + `The strongest area is ${topSection.title.toLowerCase()} (${topSection.score}/100): ${topSection.strengths[0].toLowerCase()}. `
    + `The biggest opportunity is ${bottomSection.title.toLowerCase()} (${bottomSection.score}/100): ${bottomSection.weaknesses[0].toLowerCase()}.`;

  return { sections, competitors, ourName: account.name, ourScores, overallRank: rank, summary };
}

// ─── Step 3: Scorecard view ──────────────────────────────────────────────────

const publishedAccounts = new Set<string>(['grain-design-flooring']);

/** Whether the competitive scorecard has been published to the client portal.
 *  The cold-home onboarding step reads this to flip itself to "done". */
export function isScorecardPublished(accountId: string): boolean {
  return publishedAccounts.has(accountId);
}

const EFFORT_LABELS = { quick: 'Quick win', medium: 'Medium lift', project: 'Bigger project' } as const;
const EFFORT_TONE = { quick: 'success', medium: 'warning', project: 'accent' } as const;

/** Score → StatusPill tone: good (green) / fair (orange) / poor (red). */
const scoreTone = (s: number): 'success' | 'warning' | 'danger' => (s >= 65 ? 'success' : s >= 40 ? 'warning' : 'danger');

/** Score badge: DS StatusPill; the tone carries the good/fair/poor meaning. */
function ScorePill({ score }: { score: number }) {
  return <StatusPill tone={scoreTone(score)} size="md">{score}/100</StatusPill>;
}

/** Effort badge: DS StatusPill keyed to the effort level. */
function EffortPill({ effort }: { effort: keyof typeof EFFORT_LABELS }) {
  return <StatusPill tone={EFFORT_TONE[effort]} size="sm">{EFFORT_LABELS[effort]}</StatusPill>;
}

function scoreColor(score: number) {
  if (score >= 65) return 'var(--status-approved)';
  if (score >= 40) return 'var(--status-review)';
  return 'var(--red-70)';
}

// ─── Client-facing scorecard (read-only) ─────────────────────────────────────

export function ScorecardClientView({ account }: { account: Account }) {
  const data = buildScorecardData(account);
  const isPublished = publishedAccounts.has(account.id);

  if (!isPublished) {
    return (
      <div style={{ maxWidth: 640, margin: '80px auto', textAlign: 'center' }}>
        <Heading level={2} style={{ margin: '0 0 12px' }}>Scorecard coming soon</Heading>
        <Text style={{ display: 'block', fontSize: 16, color: 'var(--dark-60)', lineHeight: 1.6 }}>
          Your account manager is finishing up your competitive scorecard. Check back soon.
        </Text>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <Heading level={2} style={{ margin: '0 0 28px' }}>{account.name}</Heading>

      <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, padding: 28, marginBottom: 32, background: 'var(--light-100)' }}>
        <Text style={{ display: 'block', fontSize: 16, color: 'var(--dark-80)', lineHeight: 1.7 }}>{data.summary}</Text>
      </div>

      <ComparisonTable data={data} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, margin: '40px 0 0' }}>
        {data.sections.map((section) => (
          <ClientSectionCard key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}

// How each dimension's 0–100 score is calculated, surfaced to the client via
// the question-mark tooltip on each section header.
const METHODOLOGY: Record<string, string> = {
  'Paid Ads': 'Google Search ads active (+35) · Meta ads in last 90 days (+35) · Conversion tracking (+20) · Branded keyword defense (+10)',
  'Organic': 'Posting cadence ≥ 8×/month (+35) · GBP photos + posts fresh (+30) · Active on 3+ platforms (+20) · Video/short-form present (+15)',
  'Website': 'Mobile LCP < 2.5 s (+30) · Strong CTA copy (+25) · Lead form ≤ 4 fields (+20) · Trust signals present (+25)',
  'Reputation': 'Avg rating × 20 (+40 max) · Review count tier ≥ 50 (+30) · ≥ 2 new reviews/month (+20) · Response rate ≥ 80% (+10)',
};

/** Hover tooltip (copied from blaze-dfy ui.tsx), explains how a score is built. */
function Tooltip({ label, children, width = 300, placement = 'below' }: { label: ReactNode; children: ReactNode; width?: number; placement?: 'above' | 'below' }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span
          role="tooltip"
          style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            ...(placement === 'below' ? { top: 'calc(100% + 8px)' } : { bottom: 'calc(100% + 8px)' }),
            width, maxWidth: '80vw', background: 'var(--dark-90)', color: 'var(--light-100)', fontSize: 12,
            fontWeight: 400, lineHeight: 1.5, padding: '8px 10px', borderRadius: 6, zIndex: 40,
            pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
}

function ClientSectionCard({ section }: { section: ScorecardSection }) {
  const [open, setOpen] = useState(true);
  const dimKey = section.title.replace(' & Conversion', '').replace('Organic Presence', 'Organic') as keyof typeof METHODOLOGY;

  return (
    <div>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, cursor: 'pointer' }}
      >
        <Heading level={3} style={{ margin: 0 }}>{section.title}</Heading>
        <ScorePill score={section.score} />
        <Tooltip label={METHODOLOGY[dimKey] ?? METHODOLOGY['Paid Ads']}>
          <span onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex', cursor: 'help' }} aria-label="How this score is calculated">
            <HelpCircleContained size={18} color="var(--dark-60)" />
          </span>
        </Tooltip>
        <span style={{ flex: 1 }} />
        <span style={{ color: 'var(--dark-40)', display: 'inline-flex' }}>{open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
      </div>

      {open && (
        <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, padding: 32, background: 'var(--light-100)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 26 }}>
            <ReadOnlyBullets label="Strengths" color="var(--status-approved)" icon="✓" items={section.strengths} />
            <ReadOnlyBullets label="Weaknesses" color="var(--red-70)" icon="!" items={section.weaknesses} />
          </div>

          <div style={{ borderTop: '1px solid var(--dark-6)', paddingTop: 18 }}>
            <Heading level={5} style={{ margin: '0 0 16px' }}>Suggested next steps</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {section.nextSteps.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 99, background: 'var(--dark-8)', color: 'var(--dark-60)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 400, flexShrink: 0 }}>{i + 1}</span>
                  <Text style={{ flex: 1, fontSize: 15, color: 'var(--dark-80)', lineHeight: 1.5 }}>{step.label}</Text>
                  <EffortPill effort={step.effort} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReadOnlyBullets({ label, color, icon, items }: { label: string; color: string; icon: string; items: string[] }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
        <span style={{ width: 20, height: 20, borderRadius: 99, background: color, color: 'var(--light-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{icon}</span>
        <Heading level={5} style={{ margin: 0, color }}>{label}</Heading>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ width: 5, height: 5, borderRadius: 99, background: 'var(--dark-40)', flexShrink: 0, marginTop: 9 }} />
            <Text style={{ fontSize: 15, color: 'var(--dark-80)', lineHeight: 1.5 }}>{item}</Text>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonTable({ data }: { data: ScorecardData }) {
  const dims: Array<keyof typeof data.ourScores> = ['Paid Ads', 'Organic', 'Website', 'Reputation'];
  const overall = (scores: typeof data.ourScores) => Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 4);
  const rows = [
    { name: data.ourName, scores: data.ourScores, isUs: true },
    ...data.competitors.map((c) => ({ name: c.name, scores: c.scores, isUs: false })),
  ];

  return (
    <div>
      <Heading level={3} style={{ margin: '0 0 4px' }}>How you compare locally</Heading>
      <Text style={{ display: 'block', marginBottom: 14, fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.5 }}>
        Scores are estimated from publicly visible signals: ad library activity, social presence, website audit, and review data. Open any section below to see exactly how each score is calculated.
      </Text>

      <div style={{ borderRadius: 12, border: '1px solid var(--dark-8)', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--dark-6)' }}>
              <th style={{ padding: '10px 22px', textAlign: 'left', fontSize: 12, fontWeight: 400, color: 'var(--dark-40)' }}>Business</th>
              {dims.map((d) => (
                <th key={d} style={{ padding: '10px 14px', textAlign: 'center', fontSize: 12, fontWeight: 400, color: 'var(--dark-40)' }}>{d}</th>
              ))}
              <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 12, fontWeight: 400, color: 'var(--dark-40)' }}>Overall</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const ov = overall(row.scores);
              return (
                <tr key={i} style={{ background: row.isUs ? 'var(--dark-2)' : 'transparent', borderBottom: '1px solid var(--dark-4)' }}>
                  <td style={{ padding: '14px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontWeight: row.isUs ? 600 : 400, color: row.isUs ? 'var(--dark-90)' : 'var(--dark-80)', fontSize: 15 }}>{row.name}</Text>
                      {row.isUs && <Pill size="sm">You</Pill>}
                    </div>
                  </td>
                  {dims.map((d) => {
                    const s = row.scores[d];
                    return <td key={d} style={{ padding: '14px', textAlign: 'center' }}><span style={{ fontWeight: 400, fontSize: 16, color: scoreColor(s) }}>{s}</span></td>;
                  })}
                  <td style={{ padding: '14px', textAlign: 'center' }}><span style={{ fontWeight: 400, fontSize: 16, color: scoreColor(ov) }}>{ov}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}

// ─── grain-design-flooring account (copied verbatim from blaze-dfy
//     lib/fixtures/accounts.ts) ───────────────────────────────────────────────

const emptyDocs = (): BrandScan['docs'] => [
  { id: 'guidelines', label: 'Brand guidelines', kind: 'Brand guidelines', status: 'empty' },
  { id: 'tone', label: 'Tone of voice', kind: 'Tone of voice', status: 'empty' },
  { id: 'avoid', label: 'Words / phrases to avoid', kind: 'Words to avoid', status: 'empty' },
  { id: 'photos', label: 'Photos', kind: 'Photos', status: 'empty' },
  { id: 'audiences', label: 'Target audiences', kind: 'Target audiences', status: 'empty' },
];

function phases(current: PhaseId, status: 'not_started' | 'in_progress' | 'complete'): PhaseProgress[] {
  const names: Record<PhaseId, string> = {
    1: 'Registration',
    2: 'Strategy',
    3: 'Creative Review',
  };
  return ([1, 2, 3] as PhaseId[]).map((id) => ({
    id,
    name: names[id],
    status:
      id < current ? 'complete' : id > current ? 'not_started' : status,
  }));
}

const GRAIN_ACCOUNT: Account = {
  id: 'grain-design-flooring',
  name: 'Grain Design Flooring',
  industry: 'Hardwood & luxury vinyl flooring',
  location: 'Naperville, IL',
  website: 'graindesignflooring.com',
  domain: 'graindesignflooring.com',
  accent: '#8B6914',
  poc: { name: 'Tyler Novak', email: 'tyler@graindesignflooring.com', phone: '(630) 555-0187', role: 'Owner' },
  am: { name: 'Dana Whitfield', initials: 'DW' },
  status: 'onboarding',
  invitedDaysAgo: 4,
  invitedDate: '2026-06-25',
  phase: 2,
  stepLabel: 'Strategy, Competitive scorecard',
  progressPct: 30,
  aiNextStep: 'Complete the competitive scorecard setup for Tyler: website, GBP, and confirm the local competitors.',
  phases: phases(2, 'in_progress'),
  brand: {
    website: 'graindesignflooring.com',
    logos: [{ id: 'primary', bg: '#8B6914', label: 'Primary' }],
    fonts: [
      { family: 'Playfair Display', role: 'Display' },
      { family: 'Inter', role: 'Body' },
    ],
    colors: [
      { hex: '#8B6914', name: 'Walnut' },
      { hex: '#2C2317', name: 'Espresso' },
      { hex: '#F5EFE6', name: 'Birch' },
      { hex: '#9E8B7D', name: 'Driftwood' },
    ],
    docs: emptyDocs().map((d) =>
      d.id === 'photos' ? { ...d, fileName: 'showroom-photos.zip', status: 'uploaded' } : d,
    ),
  },
};

// ─── Export: renders the copied client view inside the dfy-client shell ─────

export function Scorecard() {
  const { showToast } = useToast();
  const [approved, setApproved] = useState(false);
  const [reqOpen, setReqOpen] = useState(false);
  const [note, setNote] = useState('');
  const anchorRef = useRef<HTMLSpanElement>(null);

  // Close the request-changes popover on any click outside its anchor.
  useEffect(() => {
    if (!reqOpen) return;
    const onDown = (e: MouseEvent) => {
      if (anchorRef.current && !anchorRef.current.contains(e.target as Node)) setReqOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [reqOpen]);

  const approve = () => { setApproved(true); showToast({ variant: 'success', message: 'Scorecard approved' }); };
  const sendRequest = () => { setReqOpen(false); setNote(''); showToast({ message: 'Change request sent. Your account manager will follow up.' }); };

  return (
    <ClientShell section="scorecard" title={<BackTitle label="Scorecard" />}>
      <div style={{ height: 'calc(100% + 48px)', margin: -24, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px 24px 32px' }}>
          <ScorecardClientView account={GRAIN_ACCOUNT} />
        </div>

        <div style={{ flexShrink: 0, borderTop: '1px solid var(--dark-8)', background: 'var(--light-100)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <Text variant="secondary" color="var(--dark-60)">
            {approved ? 'You approved this scorecard.' : 'Does this scorecard look right?'}
          </Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span ref={anchorRef} style={{ position: 'relative', display: 'inline-flex' }}>
              <Button variant="secondary" size="md" frontIcon={Edit3} onPress={() => setReqOpen((o) => !o)}>Request changes</Button>
              {reqOpen && (
                <div
                  style={{
                    position: 'absolute', bottom: 'calc(100% + 8px)', right: 0, zIndex: 30, width: 340,
                    background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.16)', padding: 16,
                    display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left',
                  }}
                >
                  <Text variant="metadata" style={{ color: 'var(--dark-60)', lineHeight: 1.5 }}>
                    What looks off about your scorecard? Your account manager will follow up.
                  </Text>
                  <textarea
                    autoFocus
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Describe the change…"
                    style={{ width: '100%', minHeight: 80, borderRadius: 10, border: '1px solid var(--dark-8)', padding: '10px 12px', fontFamily: "'Sohne', sans-serif", fontSize: 14, letterSpacing: '0.28px', color: 'var(--dark-90)', lineHeight: 1.5, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button variant="ghost" size="sm" onPress={() => { setReqOpen(false); setNote(''); }}>Cancel</Button>
                    <Button variant="primary" size="sm" isDisabled={!note.trim()} onPress={sendRequest}>Send request</Button>
                  </div>
                </div>
              )}
            </span>
            <Button variant="primary" size="md" frontIcon={Check2} isDisabled={approved} onPress={approve}>
              {approved ? 'Approved' : 'Approve'}
            </Button>
          </div>
        </div>
      </div>
    </ClientShell>
  );
}
