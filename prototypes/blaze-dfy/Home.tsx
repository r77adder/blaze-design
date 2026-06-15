import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Heading, Modal, Paragraph, Text, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { Avatar, Callout, Card, Checkbox, Pill, Select, StatusPill, TabChip, Tabs, useToast } from '@/staging';
import { TextInput, TextArea } from './ui';
import Approvals from '@/icons/20/Approvals';
import CalendarPost from '@/icons/20/CalendarPost';
import Clock1 from '@/icons/20/Clock1';
import Cursor04 from '@/icons/20/Cursor04';
import Globe from '@/icons/20/Globe';
import Marker03 from '@/icons/20/Marker03';
import Star from '@/icons/20/Star';
import Check2 from '@/icons/20/Check2';
import ChevronDown from '@/icons/20/ChevronDown';
import ChevronUp from '@/icons/20/ChevronUp';
import Comment from '@/icons/20/Comment';
import Edit1 from '@/icons/20/Edit1';
import EyeClosed from '@/icons/20/EyeClosed';
import EyeOpen from '@/icons/20/EyeOpen';
import File from '@/icons/20/File';
import Play3 from '@/icons/20/Play3';
import Send1 from '@/icons/20/Send1';
import Stars from '@/icons/20/Stars';
import Video from '@/icons/20/Video';
import Voice from '@/icons/20/Voice';
import styles from './Home.module.scss';

/** Pending posts surfaced on the approvals tile (demo count). */
const APPROVAL_PENDING_COUNT = 6;

// ─── PEOPLE ────────────────────────────────────────────────────────

type PersonId = 'sarah' | 'tom' | 'alex' | 'petar';

const PEOPLE: Record<PersonId, { name: string; short: string; role: string; img: string; isClient: boolean }> = {
  sarah: { name: 'Sarah Johnson', short: 'Sarah', role: 'CertaPro · Owner', img: 'https://i.pravatar.cc/64?img=47', isClient: true },
  tom: { name: 'Tom Hutchins', short: 'Tom', role: 'CertaPro · Ops', img: 'https://i.pravatar.cc/64?img=59', isClient: true },
  alex: { name: 'Alex Rivera', short: 'Alex', role: 'Blaze · Account Manager', img: 'https://i.pravatar.cc/64?img=12', isClient: false },
  petar: { name: 'Petar Kovač', short: 'Petar', role: 'Blaze · Designer', img: 'https://i.pravatar.cc/64?img=33', isClient: false },
};

// ─── MEETINGS ──────────────────────────────────────────────────────

type MeetingType = 'kickoff' | 'check-in' | 'creative-review';

interface Meeting {
  id: string;
  type: MeetingType;
  date: string;
  duration: string;
  attendees: PersonId[];
  /** Drafted by the agent from the Fathom transcript, not yet published to the client. */
  pending?: boolean;
  summary: string[];
  decisions?: string[];
  /** Kickoff-only: the foundational "cold" content captured once. */
  foundation?: { label: string; body: string }[];
  /** AM-only note — never rendered in client view. */
  internalNote?: string;
  /** Apr 28: embed the campaign that was shared for review on this call. */
  campaignEmbed?: boolean;
  /** Jun 3: the agent drafted a new campaign from this call. AM-only. */
  campaignDraft?: boolean;
  actions?: { text: string; owner: PersonId; done: boolean }[];
}

const MEETING_META: Record<MeetingType, { label: string; color: string; bg: string }> = {
  kickoff: { label: 'Kickoff', color: 'var(--focus-50)', bg: 'var(--focus-10)' },
  'check-in': { label: 'Check-in', color: 'var(--dark-60)', bg: 'var(--dark-6)' },
  'creative-review': { label: 'Creative review', color: 'var(--magenta-70)', bg: 'color-mix(in srgb, var(--magenta-70) 12%, transparent)' },
};

const MEETINGS: Meeting[] = [
  {
    id: 'm-jun3', type: 'check-in', date: 'Jun 3', duration: '32 min', attendees: ['sarah', 'alex'],
    pending: true,
    summary: [
      'June planning: the wave leads with the team-intro post, then the interior-season teaser mid-month.',
      'Sarah will send final color picks for the June palette by Friday.',
      'Spring Wave 2 performing well — estimate requests up 18% month over month.',
    ],
    decisions: [
      'June wave = 6 posts, team-intro post runs first',
      'Hold TikTok for now — revisit in July',
    ],
    campaignDraft: true,
    actions: [
      { text: 'Send final June color picks', owner: 'sarah', done: false },
      { text: 'Upload team + kitchen interior photos to Drive', owner: 'sarah', done: false },
      { text: 'Share June wave for client review', owner: 'alex', done: false },
    ],
    internalNote: "Sarah hesitated when TikTok came up — don't push it again next call unless she raises it.",
  },
  {
    id: 'm-apr28', type: 'creative-review', date: 'Apr 28', duration: '47 min', attendees: ['sarah', 'tom', 'alex', 'petar'],
    summary: [
      'Reviewed the spring wave drafts — Sarah approved 5 of 6 on the call.',
      'Sarah emphasized the spring promotion window and leading with the prep process as the differentiator from DIY.',
      'Palette direction for summer: warm neutrals anchored by sage green.',
    ],
    decisions: [
      'Lead all spring content with the prep-process story',
      'Summer palette: warm neutrals + sage green',
      'Reuse the Lakeway project photos across the wave',
    ],
    campaignEmbed: true,
    actions: [
      { text: 'Share spring wave for client review', owner: 'alex', done: true },
      { text: 'Send the Lakeway photo set', owner: 'sarah', done: true },
    ],
  },
  {
    id: 'm-apr2', type: 'check-in', date: 'Apr 2', duration: '28 min', attendees: ['sarah', 'alex'],
    summary: [
      'Confirmed the April promo window — spring exterior wave kicked off Apr 15.',
      'Growing interest in cabinet refinishing — candidate for a June teaser.',
      'Sarah asked for more before/after content; project photography prioritized.',
    ],
    decisions: [
      'Spring exterior wave starts Apr 15',
      'Pause blog content through spring',
    ],
    actions: [
      { text: 'Kick off spring exterior wave', owner: 'alex', done: true },
      { text: 'Schedule project photography', owner: 'sarah', done: true },
    ],
  },
  {
    id: 'm-kickoff', type: 'kickoff', date: 'Mar 12', duration: '61 min', attendees: ['sarah', 'tom', 'alex'],
    summary: [
      'Aligned on goals, brand direction, and the 2026 content approach.',
      'Positioning: prep process + crew accountability, locally grounded.',
      'Cadence agreed: monthly check-ins plus a creative review per campaign wave.',
    ],
    foundation: [
      { label: 'Goals', body: '25 exterior estimate requests/month through spring–summer · grow Instagram in West Austin neighborhoods' },
      { label: 'Brand direction', body: 'Professional, direct, locally grounded. No discount framing, no urgency hooks.' },
      { label: 'Services', body: 'Exterior repaints (primary) · cabinet refinishing (secondary) · commercial repaints (occasional)' },
      { label: 'Audience', body: 'Homeowners 35–65 in West Austin, Lakeway, Westlake — HOA-conscious, value trust over price' },
      { label: 'Off-limits', body: 'Competitor comparisons, price callouts, stock photography' },
    ],
    actions: [
      { text: 'Connect Google Drive media folder', owner: 'sarah', done: true },
      { text: 'Set up the brand brain from kickoff notes', owner: 'alex', done: true },
    ],
  },
];

// ─── AGENT CAMPAIGN DRAFT (from the Jun 3 call) ────────────────────

const CAMPAIGN_DRAFT = {
  title: 'June Wave — Team & Interiors',
  meta: '6 posts · Instagram, Facebook, LinkedIn · starts Jun 16',
  theme: '“The Crew Behind the Paint” — team-intro post leads, interior-season teaser mid-month, prep-process proof points throughout.',
  matched: 9,
  total: 12,
  thumbs: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1607400201515-c2c41c07d307?w=200&h=200&fit=crop',
  ],
  missing: ['Team photos — new uniforms', 'Lakeway kitchen interiors'],
};

// ─── AGENT TASKS (right rail — the agent's own work queue) ─────────
// Each task carries its own plan; the AM reviews and approves them
// one at a time. Nothing runs before its plan is approved.

type AgentTaskStatus = 'review' | 'running' | 'done' | 'revising';

interface AgentTask {
  id: string;
  text: string;
  detail: string;
  plan: string[];
  status: AgentTaskStatus;
  /** Team member who owns approving this plan (and reviewing its output). */
  assignee: PersonId;
  /** Which product surface the work lands in. */
  source: string;
  /** The stakes — why this needs approval now, what it blocks. */
  why: string;
  /** Where the finished work lands — surfaces as a "review output" CTA
   *  on the done task so the team member can inspect what was produced. */
  output?: { label: string; to: string };
}

const SEED_AGENT_TASKS: AgentTask[] = [
  {
    id: 'p1', text: 'Draft the 6 June wave posts', status: 'review', assignee: 'alex',
    source: 'Organic Campaigns', why: 'June wave starts Jun 16 — drafts need to reach Sarah by Jun 10.',
    output: { label: 'Review the 6 drafts', to: '/h2/dfy-campaigns' },
    detail: 'Copy, platform captions and visual briefs from the “Crew Behind the Paint” theme.',
    plan: [
      'Pull theme and voice from the brand brain + Jun 3 call notes',
      'Write copy and platform-specific captions for all 6 posts',
      'Write visual briefs referencing the matched Drive assets',
      'Run a quality pass against the 4 failure modes before review',
    ],
  },
  {
    id: 'p2', text: 'Match Drive assets to each post', status: 'review', assignee: 'petar',
    source: 'Organic Campaigns', why: 'Posts can’t finalize without assets — blocks drafting and scheduling.',
    output: { label: 'Review asset matches', to: '/h2/campaigns?campaign=jw' },
    detail: '9 of 12 matched so far — the 3 gaps need client photos.',
    plan: [
      'Scan the CertaPro Drive folder (12 assets, synced)',
      'Pair best-fit photos to each post’s visual brief',
      'Flag the gaps and draft the asset request for Sarah',
    ],
  },
  {
    id: 'p3', text: 'Apply Wave 2 change requests', status: 'review', assignee: 'petar',
    source: 'Client approvals', why: 'Sarah’s change notes wait on this — turnaround target is 24h.',
    output: { label: 'Review reworked posts', to: '/h2/approvals' },
    detail: 'Rework anything Sarah flags in client approvals.',
    plan: [
      'Watch client approvals for incoming change notes',
      'Rework flagged posts using the note as direction',
      'Resubmit to approvals with a changelog for Sarah',
    ],
  },
  {
    id: 'p4', text: 'Schedule approved Wave 2 posts', status: 'review', assignee: 'alex',
    source: 'Organic Campaigns', why: 'The Jun 6 and Jun 9 slots only hold until Thursday.',
    output: { label: 'View the calendar', to: '/h2/content-plan' },
    detail: 'Fill the Jun 6 and Jun 9 calendar slots.',
    plan: [
      'Pick the best open slots from the posting calendar',
      'Stage platform-specific captions per slot',
      'Queue the posts and confirm in the calendar',
    ],
  },
  {
    id: 'p5', text: 'Refresh Overview + doc after publish', status: 'review', assignee: 'alex',
    source: 'Living Doc', why: 'Keeps what Sarah sees in sync after every publish.',
    detail: 'Keep the living doc current for CertaPro.',
    plan: [
      'Update the Overview section after each publish',
      'Append new next steps from approvals and calls',
      'Log every change to the activity feed',
    ],
  },
];

// ─── TEAM FLAGS (right rail — what the agent can't resolve alone) ──
// Escalations the agent raises while working: hard blockers it cannot
// resolve itself, and judgment calls that need a human owner's review.
// Each flag has one named owner on the team. Never client-visible.

type FlagKind = 'blocked' | 'review';

interface TeamFlag {
  id: string;
  kind: FlagKind;
  text: string;
  owner: PersonId;
  source: string;
  /** Where the owner goes to actually resolve it. */
  cta: { label: string; to: string };
  resolved: boolean;
}

const SEED_TEAM_FLAGS: TeamFlag[] = [
  { id: 'f1', kind: 'blocked', text: 'No reel template for “Crew Day in the Life” — can’t assemble the reel without one', owner: 'petar', source: 'June wave draft', cta: { label: 'Open reel post', to: '/h2/campaigns?campaign=jw' }, resolved: false },
  { id: 'f2', kind: 'review', text: 'Crew photos show two new hires — confirm photo releases before featuring them', owner: 'alex', source: 'June wave draft', cta: { label: 'Review crew photos', to: '/h2/campaigns?campaign=jw' }, resolved: false },
  { id: 'f3', kind: 'review', text: 'Sage green conflict: brand kit #A3B18A vs the Apr 28 call direction — confirm which wins', owner: 'petar', source: 'quality check', cta: { label: 'Open brand kit', to: '/h2/brand-kit' }, resolved: false },
  // Already cleared — the agent detected the fix and closed its own flag.
  { id: 'f4', kind: 'blocked', text: 'Lakeway exterior photos were low-res — Sarah re-uploaded originals to Drive', owner: 'alex', source: 'June wave draft', cta: { label: 'View in Drive', to: '/h2/living-doc' }, resolved: true },
];

const FLAG_META: Record<FlagKind, { label: string; color: string; bg: string }> = {
  blocked: { label: 'Blocked', color: 'var(--negative-60)', bg: 'var(--negative-10)' },
  review: { label: 'Needs review', color: 'var(--yellow-80)', bg: 'color-mix(in srgb, var(--brand) 18%, transparent)' },
};

// ─── ACCOUNT WORK (Workstream tab) ─────────────────────────────────
// Cross-product items — everything moving across the Blaze products
// configured in Meta Strategy (organic, Local SEO, reputation, paid…),
// each with an assignee so the team can filter to their own queue.

type AccountKind = 'signoff' | 'insight' | 'flag';

interface AccountWorkItem {
  id: string;
  kind: AccountKind;
  sourceLabel: string;
  icon: React.ComponentType;
  assignee: PersonId;
  title: string;
  body: string;
  time: string;
  cta: { label: string; to: string };
  /** What you're being asked to judge — the draft itself. */
  excerpt?: string;
  /** What the draft responds to (e.g. the review being replied to). */
  quote?: string;
  /** Visual preview of the items in question. */
  thumbs?: string[];
  /** Stakes / what happens next — deadline, slot, consequence. */
  statusLine?: string;
  /** Label for an inline approve action — sign-off without leaving the feed. */
  approveLabel?: string;
  /** Item is waiting on the client — surface a nudge instead of an approve. */
  remind?: boolean;
}

const ACCOUNT_WORK: AccountWorkItem[] = [
  {
    id: 'w1', kind: 'signoff', sourceLabel: 'Local SEO', icon: Marker03, assignee: 'alex', time: 'Today',
    title: '4 June Google Business posts drafted',
    body: 'Adapted from the June wave — service-area copy, no hashtags, booking link on each.',
    excerpt: '“Spring booked up fast — June exterior slots are open now. One local crew, from first walkthrough to final coat. Book a free estimate.”',
    statusLine: 'Publishes to the Jun 6 GBP slot once approved',
    approveLabel: 'Approve all 4',
    cta: { label: 'Review each', to: '/h2/organic-profile' },
  },
  {
    id: 'w2', kind: 'signoff', sourceLabel: 'Reputation', icon: Star, assignee: 'alex', time: 'Today',
    title: 'Reply drafted for a new 5★ review',
    body: '',
    quote: '“The crew’s prep work was unreal — best paint job we’ve had.” — ★★★★★ · Lakeway homeowner',
    excerpt: 'Thank you — prep is where good paint jobs are won, and that crew treats every home that way. Enjoy the new look!',
    statusLine: 'Replying within 24h keeps local ranking momentum',
    approveLabel: 'Approve reply',
    cta: { label: 'Edit reply', to: '/h2/reputation' },
  },
  {
    id: 'w3', kind: 'signoff', sourceLabel: 'Client approvals', icon: Approvals, assignee: 'sarah', time: 'Jun 1',
    title: '6 items waiting on Sarah',
    body: 'Stills, carousels, a reel and the June newsletter.',
    thumbs: [
      'https://images.unsplash.com/photo-1607400201515-c2c41c07d307?w=120&h=120&fit=crop',
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=120&h=120&fit=crop',
      'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=120&h=120&fit=crop',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=120&h=120&fit=crop',
    ],
    statusLine: '2 of 6 opened since Jun 1 — June schedule slips if not approved by Jun 9',
    remind: true,
    cta: { label: 'Open approvals', to: '/h2/approvals' },
  },
  {
    id: 'w4', kind: 'flag', sourceLabel: 'Paid Social', icon: Cursor04, assignee: 'alex', time: 'Yesterday',
    title: 'Meta token expires Jun 10 — boosts will pause',
    body: 'The connected ad account needs a reconnect before the Wave 2 boost schedule continues. Takes about two minutes.',
    statusLine: 'Boosts pause in 6 days — $240/wk of scheduled spend stops',
    cta: { label: 'Reconnect Meta', to: '/h2/paid-social' },
  },
  {
    id: 'w5', kind: 'insight', sourceLabel: 'SEO/AEO', icon: Globe, assignee: 'alex', time: 'Yesterday',
    title: '“exterior painting austin” climbed to #4',
    body: 'Up 3 spots since the spring wave started — first-page traffic up 22% month over month. No action needed; worth mentioning on the Jun 16 call.',
    cta: { label: 'Open rankings', to: '/h2/seo-aeo' },
  },
];

// ─── THREADS ───────────────────────────────────────────────────────

interface Attachment { name: string; thumb?: string }
interface ThreadMsg { author: PersonId; time: string; text: string; attachments?: Attachment[] }
interface Thread { id: string; meetingId: string; root: ThreadMsg; replies: ThreadMsg[]; resolved: boolean }

const SEED_THREADS: Thread[] = [
  {
    id: 'th1', meetingId: 'm-apr28', resolved: false,
    root: {
      author: 'sarah', time: 'May 30',
      text: "Love the sage direction! Can the color carousel lead with the sage exterior from the Lakeway house? That's exactly the look we want for summer.",
      attachments: [{ name: 'lakeway-sage.jpg', thumb: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=120&h=120&fit=crop' }],
    },
    replies: [],
  },
];

// Mock pool the paperclip cycles through — stands in for a real file picker.
const SAMPLE_ATTACHMENTS: Attachment[] = [
  { name: 'sage-exterior-ref.jpg', thumb: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=120&h=120&fit=crop' },
  { name: 'kitchen-before.jpg', thumb: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=120&h=120&fit=crop' },
  { name: 'june-color-picks.pdf' },
];

// ─── NEXT STEPS (right rail) ───────────────────────────────────────

interface NextStep { id: string; text: string; owner: PersonId; due: string; source: string; fromPending: boolean; done: boolean }

// Asset requests come from the agent's Drive scan, NOT the unpublished call
// notes — so they're client-visible immediately (fromPending: false). Steps
// sourced from the Jun 3 notes stay hidden from the client until publish.
const SEED_STEPS: NextStep[] = [
  { id: 's1', text: 'Send final June color picks', owner: 'sarah', due: 'Jun 6', source: 'Jun 3 call', fromPending: true, done: false },
  { id: 's2', text: 'Upload new-uniform team photos to Drive', owner: 'sarah', due: 'Jun 9', source: 'asset request', fromPending: false, done: false },
  { id: 's3', text: 'Upload Lakeway kitchen interior photos', owner: 'sarah', due: 'Jun 9', source: 'asset request', fromPending: false, done: false },
  { id: 's4', text: 'Share June wave for client review', owner: 'alex', due: 'Jun 10', source: 'Jun 3 call', fromPending: true, done: false },
  { id: 's5', text: 'Confirm Wave 2 boost budget', owner: 'alex', due: 'Jun 5', source: 'Apr 28 call', fromPending: false, done: true },
];

// ─── ACTIVITY (right rail) ─────────────────────────────────────────

type ActivityKind = 'agent' | 'fathom' | 'comment' | 'publish' | 'posted' | 'review';

/** Kinds the client is allowed to see — content lifecycle + conversation,
 *  never the AM/agent production process. */
const CLIENT_VISIBLE_KINDS: ActivityKind[] = ['posted', 'review', 'comment'];

interface ActivityItem { id: string; kind: ActivityKind; text: string; time: string; sub?: string }

const SEED_ACTIVITY: ActivityItem[] = [
  { id: 'a1', kind: 'agent', text: 'Agent drafted Jun 3 notes, a June campaign draft + 3 next steps', time: 'Yesterday', sub: 'Waiting for your review' },
  { id: 'a1b', kind: 'agent', text: 'Agent flagged 3 items for the team — 1 blocking', time: 'Yesterday' },
  { id: 'a1c', kind: 'agent', text: 'Agent cleared its Lakeway photo flag — re-uploaded originals detected', time: 'Yesterday' },
  { id: 'a2', kind: 'fathom', text: 'Fathom synced the Jun 3 check-in (32 min)', time: 'Yesterday' },
  { id: 'a3', kind: 'posted', text: '3 Wave 2 posts went live on Instagram & Facebook', time: 'Jun 2' },
  { id: 'a4', kind: 'comment', text: 'Sarah commented on the Apr 28 creative review', time: 'May 30' },
  { id: 'a5', kind: 'review', text: 'Wave 2 week-4 posts ready for client review', time: 'May 28' },
  { id: 'a6', kind: 'agent', text: 'Agent updated Overview after the creative review', time: 'Apr 28' },
  { id: 'a7', kind: 'publish', text: 'Alex published Apr 28 notes to the client', time: 'Apr 28' },
  { id: 'a8', kind: 'fathom', text: 'Fathom synced the Apr 28 creative review (47 min)', time: 'Apr 28' },
];

const ACTIVITY_STYLE: Record<ActivityKind, { bg: string; color: string }> = {
  agent: { bg: 'var(--focus-10)', color: 'var(--focus-50)' },
  fathom: { bg: 'color-mix(in srgb, var(--magenta-70) 12%, transparent)', color: 'var(--magenta-70)' },
  comment: { bg: 'color-mix(in srgb, var(--brand) 18%, transparent)', color: 'var(--yellow-80)' },
  publish: { bg: 'var(--positive-10)', color: 'var(--positive-60)' },
  posted: { bg: 'var(--positive-10)', color: 'var(--positive-60)' },
  review: { bg: 'color-mix(in srgb, var(--brand) 18%, transparent)', color: 'var(--yellow-80)' },
};

function ActivityGlyph({ kind }: { kind: ActivityKind }) {
  const s = ACTIVITY_STYLE[kind];
  return (
    <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: s.bg, color: s.color }}>
      {kind === 'agent' ? <Stars size={13} />
        : kind === 'fathom' ? <Voice size={13} />
        : kind === 'comment' ? <Comment size={13} />
        : kind === 'posted' ? <CalendarPost size={13} />
        : kind === 'review' ? <Approvals size={13} />
        : <Send1 size={13} />}
    </span>
  );
}

// ─── CAMPAIGN EMBED THUMBS (Apr 28) ────────────────────────────────

const EMBED_THUMBS = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&h=250&fit=crop',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=250&fit=crop',
  'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=200&h=250&fit=crop',
];

// ─── SMALL PIECES ──────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text variant="label" color="var(--dark-40)" style={{ display: 'block', marginBottom: 7 }}>
      {children}
    </Text>
  );
}

/** 3px separator dot for inline meta rows. */
function MetaDot() {
  return <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--dark-20)', flexShrink: 0, display: 'inline-block' }} />;
}

function AvatarStack({ ids, size = 20 }: { ids: PersonId[]; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {ids.map((id, i) => (
        <span key={id} style={{ marginLeft: i === 0 ? 0 : -6, borderRadius: '50%', border: '1.5px solid var(--light-100)', display: 'inline-flex' }} title={`${PEOPLE[id].name} — ${PEOPLE[id].role}`}>
          <Avatar src={PEOPLE[id].img} fallback={PEOPLE[id].short.slice(0, 2)} size={size} />
        </span>
      ))}
    </span>
  );
}

function AttachmentChip({ att }: { att: Attachment }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid var(--dark-10)', borderRadius: 7, padding: att.thumb ? 3 : '4px 9px', background: 'var(--light-100)' }}>
      {att.thumb ? (
        <span style={{ width: 26, height: 26, borderRadius: 5, backgroundImage: `url('${att.thumb}')`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
      ) : (
        <span style={{ color: 'var(--dark-40)', display: 'inline-flex' }}><File /></span>
      )}
      <Text variant="metadata" color="var(--dark-70)" style={{ paddingRight: att.thumb ? 7 : 0 }}>{att.name}</Text>
    </span>
  );
}

// ─── THREADS ───────────────────────────────────────────────────────

function ThreadMessage({ msg, isRoot }: { msg: ThreadMsg; isRoot?: boolean }) {
  const p = PEOPLE[msg.author];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginTop: isRoot ? 0 : 10 }}>
      <Avatar src={p.img} fallback={p.short.slice(0, 2)} size={24} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Text variant="smallList">{p.name}</Text>
          {p.isClient && <Pill size="xs">Client</Pill>}
          <Text variant="metadata" color="var(--dark-40)">{msg.time}</Text>
        </div>
        <Text variant="secondary" color="var(--dark-80)" style={{ display: 'block', lineHeight: 1.55, marginTop: 4 }}>{msg.text}</Text>
        {msg.attachments && msg.attachments.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 7, flexWrap: 'wrap' }}>
            {msg.attachments.map((a, i) => <AttachmentChip key={i} att={a} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function ThreadCard({ thread, viewer, onReply, onResolve }: {
  thread: Thread;
  viewer: PersonId;
  onReply: (text: string) => void;
  onResolve: () => void;
}) {
  const [reply, setReply] = useState('');
  if (thread.resolved) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: 'var(--positive-60)', display: 'inline-flex' }}><Check2 /></span>
        <Text variant="metadata" color="var(--dark-40)">
          Thread resolved · {thread.root.text.slice(0, 52).replace(/\s+\S*$/, '')}…
        </Text>
      </div>
    );
  }
  return (
    <div style={{ border: '1px solid color-mix(in srgb, var(--brand) 40%, transparent)', background: 'color-mix(in srgb, var(--brand) 6%, transparent)', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <ThreadMessage msg={thread.root} isRoot />
        </div>
        <Button variant="secondary" size="xs" frontIcon={Check2} onPress={onResolve}>Resolve</Button>
      </div>
      <div style={{ paddingLeft: 4 }}>
        {thread.replies.map((r, i) => <ThreadMessage key={i} msg={r} />)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <Avatar src={PEOPLE[viewer].img} fallback={PEOPLE[viewer].short.slice(0, 2)} size={24} />
        <TextInput
          inputSize="sm"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && reply.trim()) {
              onReply(reply.trim());
              setReply('');
            }
          }}
          placeholder="Reply…"
          style={{ flex: 1 }}
        />
      </div>
    </div>
  );
}

/** "New thread" affordance — collapsed to a ghost button, expands to a
 *  composer with mock attachment support. Works for both AM and client. */
function ThreadComposer({ viewer, onPost }: { viewer: PersonId; onPost: (text: string, attachments: Attachment[]) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const reset = () => { setOpen(false); setText(''); setAttachments([]); };

  if (!open) {
    return (
      <div>
        <Button variant="secondary" size="xs" frontIcon={Comment} onPress={() => setOpen(true)}>New thread</Button>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid var(--dark-10)', borderRadius: 10, padding: '12px 14px', background: 'var(--light-100)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
        <Avatar src={PEOPLE[viewer].img} fallback={PEOPLE[viewer].short.slice(0, 2)} size={24} />
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start a thread — questions, direction, feedback…"
          autoFocus
          fullWidth={false}
          style={{ flex: 1, minHeight: 52 }}
        />
      </div>
      {attachments.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 9, marginLeft: 33, flexWrap: 'wrap' }}>
          {attachments.map((a, i) => <AttachmentChip key={i} att={a} />)}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, marginLeft: 33 }}>
        <Button
          variant="ghost"
          size="xs"
          frontIcon={File}
          onPress={() => setAttachments((prev) => [...prev, SAMPLE_ATTACHMENTS[prev.length % SAMPLE_ATTACHMENTS.length]])}
        >
          Attach
        </Button>
        <span style={{ flex: 1 }} />
        <Button variant="secondary" size="xs" onPress={reset}>Cancel</Button>
        <Button
          variant="primary" size="xs" frontIcon={Send1} isDisabled={!text.trim()}
          onPress={() => { onPost(text.trim(), attachments); reset(); }}
        >
          Post
        </Button>
      </div>
    </div>
  );
}

// ─── AGENT CAMPAIGN DRAFT CARD (AM-only) ───────────────────────────

function CampaignDraftCard() {
  const navigate = useNavigate();
  return (
    <Card padding="none" style={{ border: '1px solid var(--focus-20)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', background: 'var(--focus-5)', borderBottom: '1px solid var(--focus-10)' }}>
        <span style={{ color: 'var(--focus-50)', display: 'inline-flex' }}><Stars /></span>
        <Text variant="smallList" style={{ flex: 1 }}>Agent drafted a campaign from this call</Text>
        <Text variant="label" color="var(--dark-40)" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <EyeClosed /> AM only — hidden from client
        </Text>
      </div>
      <div style={{ padding: '13px 14px' }}>
        <Text variant="largeList" style={{ display: 'block' }}>{CAMPAIGN_DRAFT.title}</Text>
        <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block', marginTop: 2 }}>{CAMPAIGN_DRAFT.meta}</Text>
        <Text variant="secondary" color="var(--dark-70)" style={{ display: 'block', lineHeight: 1.55, marginTop: 8 }}>{CAMPAIGN_DRAFT.theme}</Text>

        {/* Assets: matched from Drive + flagged gaps */}
        <div style={{ marginTop: 12 }}>
          <Text variant="smallList" color="var(--dark-70)" style={{ display: 'block', marginBottom: 7 }}>
            Assets — {CAMPAIGN_DRAFT.matched} of {CAMPAIGN_DRAFT.total} matched from Drive
          </Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {CAMPAIGN_DRAFT.thumbs.map((src, i) => (
              <span key={i} style={{ width: 40, height: 40, borderRadius: 6, backgroundImage: `url('${src}')`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
            ))}
            <span style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--dark-6)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Text variant="label" color="var(--dark-40)">+5</Text>
            </span>
            {CAMPAIGN_DRAFT.missing.map((m) => (
              <span key={m} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--yellow-80)', background: 'color-mix(in srgb, var(--brand) 16%, transparent)', border: '1px solid color-mix(in srgb, var(--brand) 40%, transparent)', padding: '5px 9px', borderRadius: 6 }}>
                <Text variant="label" color="var(--yellow-80)">Needs: {m}</Text>
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 13 }}>
          <Button variant="primary" size="xs" onPress={() => navigate('/h2/campaigns?campaign=jw')}>Open draft campaign</Button>
          <Text variant="metadata" color="var(--positive-60)" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Check2 /> Asset request sent — in Sarah's next steps
          </Text>
        </div>
      </div>
    </Card>
  );
}

// ─── MEETING ENTRY ─────────────────────────────────────────────────

function MeetingEntry({ meeting, expanded, published, clientView, threads, onToggle, onPublish, onNewThread, onReply, onResolve, sectionRef }: {
  meeting: Meeting;
  expanded: boolean;
  published: boolean;
  clientView: boolean;
  threads: Thread[];
  onToggle: () => void;
  onPublish: () => void;
  onNewThread: (text: string, attachments: Attachment[]) => void;
  onReply: (threadId: string, text: string) => void;
  onResolve: (threadId: string) => void;
  sectionRef: (el: HTMLDivElement | null) => void;
}) {
  const { showToast } = useToast();
  const meta = MEETING_META[meeting.type];
  const isDraft = !!meeting.pending && !published;
  const viewer: PersonId = clientView ? 'sarah' : 'alex';
  const openThreads = threads.filter((t) => !t.resolved).length;

  return (
    <Card
      ref={sectionRef}
      padding="none"
      style={{
        scrollMarginTop: 16,
        border: isDraft ? '1.5px solid var(--focus-20)' : '1px solid var(--dark-8)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {/* Draft banner — the agent wrote this, the AM gates it */}
      {isDraft && !clientView && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: 'var(--focus-5)', borderBottom: '1px solid var(--focus-10)' }}>
          <span style={{ color: 'var(--focus-50)', display: 'inline-flex' }}><Stars /></span>
          <Text variant="secondary" color="var(--dark-80)" style={{ flex: 1 }}>
            <strong style={{ fontWeight: 600 }}>Drafted by agent</strong> from the Fathom transcript — updates Overview, drafts the June campaign, and adds 3 next steps. Notes not visible to the client yet.
          </Text>
          <Button variant="secondary" size="xs" frontIcon={Edit1} onPress={() => showToast({ message: 'Opens the entry in the doc editor' })}>Edit</Button>
          <Button variant="primary" size="xs" frontIcon={Send1} onPress={onPublish}>Publish to client</Button>
        </div>
      )}

      {/* Header — date anchors the scan; logistics drop to a quiet meta line */}
      <button
        onClick={onToggle}
        style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 5, padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
          <Text variant="smallList" color="var(--dark-100)">{meeting.date}</Text>
          <Text variant="secondary" color="var(--dark-50)">{meta.label}</Text>
          <span style={{ flex: 1 }} />
          <span style={{ color: 'var(--dark-30)', display: 'inline-flex' }}>{expanded ? <ChevronUp /> : <ChevronDown />}</span>
        </span>
        <Text variant="metadata" color="var(--dark-40)" style={{ display: 'flex', alignItems: 'center', gap: 7, paddingLeft: 16 }}>
          {meeting.duration}
          <MetaDot />
          <AvatarStack ids={meeting.attendees} size={16} />
          <MetaDot />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: 'var(--magenta-70)', display: 'inline-flex' }}><Voice /></span> Fathom
          </span>
          <MetaDot />
          <span
            role="link"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); showToast({ message: 'Opening the Fathom recording…' }); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); showToast({ message: 'Opening the Fathom recording…' }); } }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
          >
            <Play3 /> Recording
          </span>
          {openThreads > 0 && (
            <>
              <MetaDot />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600, color: 'var(--yellow-80)' }}>
                <Comment /> {openThreads} open
              </span>
            </>
          )}
        </Text>
      </button>

      {/* Collapsed preview — aligned to the title text column */}
      {!expanded && (
        <Text variant="secondary" color="var(--dark-40)" lineClamp={1} style={{ display: 'block', padding: '0 16px 13px 32px' }}>
          {meeting.foundation ? 'Goals, brand direction, audience and more — the foundation this account runs on.' : meeting.summary[0]}
        </Text>
      )}

      {/* Expanded body — same text column as the title */}
      {expanded && (
        <div style={{ padding: '2px 16px 16px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Summary */}
          <div>
            <SectionLabel>Summary</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {meeting.summary.map((s, i) => (
                <Text key={i} variant="secondary" color="var(--dark-80)" style={{ display: 'flex', gap: 9, lineHeight: 1.55 }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--dark-30)', flexShrink: 0, marginTop: 8 }} />
                  {s}
                </Text>
              ))}
            </div>
          </div>

          {/* Kickoff foundation — the cold content, captured once */}
          {meeting.foundation && (
            <Card padding="none" style={{ borderRadius: 10, padding: '13px 15px', background: 'var(--dark-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <SectionLabel>Foundation</SectionLabel>
                <Text variant="label" color="var(--focus-50)" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 7 }}>
                  <Stars /> Feeds the brand brain
                </Text>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {meeting.foundation.map(({ label, body }) => (
                  <div key={label} style={{ display: 'flex', gap: 12 }}>
                    <Text variant="smallList" color="var(--dark-40)" style={{ width: 110, flexShrink: 0 }}>{label}</Text>
                    <Text variant="secondary" color="var(--dark-80)" style={{ lineHeight: 1.5 }}>{body}</Text>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Decisions */}
          {meeting.decisions && (
            <div>
              <SectionLabel>Decisions</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {meeting.decisions.map((d, i) => (
                  <Text key={i} variant="secondary" color="var(--dark-80)" style={{ display: 'flex', gap: 8, lineHeight: 1.5, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--positive-60)', display: 'inline-flex', marginTop: 2 }}><Check2 /></span>
                    {d}
                  </Text>
                ))}
              </div>
            </div>
          )}

          {/* Agent campaign draft — the production process. NEVER client-visible. */}
          {meeting.campaignDraft && !clientView && (
            <CampaignDraftCard />
          )}

          {/* Embedded campaign — content shared for client review on this call.
              The client sees the reference; only the AM gets the link into the pipeline. */}
          {meeting.campaignEmbed && (
            <EmbeddedCampaign clientView={clientView} />
          )}

          {/* Action items captured on this call */}
          {meeting.actions && (
            <div>
              <SectionLabel>Action items</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {meeting.actions.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <Checkbox checked={a.done} disabled onChange={() => {}} />
                    <Text variant="secondary" color={a.done ? 'var(--dark-40)' : 'var(--dark-80)'} style={{ textDecoration: a.done ? 'line-through' : 'none', flex: 1 }}>{a.text}</Text>
                    <Avatar src={PEOPLE[a.owner].img} fallback={PEOPLE[a.owner].short.slice(0, 2)} size={18} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Internal note — AM-only, never client-visible */}
          {meeting.internalNote && !clientView && (
            <div style={{ border: '1px dashed var(--dark-20)', borderRadius: 10, padding: '10px 13px', display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--dark-40)', display: 'inline-flex', marginTop: 1 }}><EyeClosed /></span>
              <div>
                <Text variant="label" color="var(--dark-40)" style={{ display: 'block', marginBottom: 3 }}>Internal — hidden from client</Text>
                <Text variant="secondary" color="var(--dark-70)" style={{ display: 'block', lineHeight: 1.5 }}>{meeting.internalNote}</Text>
              </div>
            </div>
          )}

          {/* Threads — shared conversation, both sides can start one */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {threads.length > 0 && <SectionLabel>Threads</SectionLabel>}
            {threads.map((t) => (
              <ThreadCard
                key={t.id}
                thread={t}
                viewer={viewer}
                onReply={(text) => onReply(t.id, text)}
                onResolve={() => onResolve(t.id)}
              />
            ))}
            <ThreadComposer viewer={viewer} onPost={onNewThread} />
          </div>
        </div>
      )}
    </Card>
  );
}

function EmbeddedCampaign({ clientView }: { clientView: boolean }) {
  const navigate = useNavigate();
  return (
    <Card padding="none" style={{ borderRadius: 10, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {EMBED_THUMBS.map((src, i) => (
          <div key={i} style={{ width: 44, height: 55, borderRadius: 5, backgroundImage: `url('${src}')`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
        ))}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text variant="smallList" style={{ display: 'block' }}>Spring Refresh, Done Right</Text>
        <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block', marginTop: 2 }}>6 posts · reviewed on this call</Text>
      </div>
      {clientView ? (
        <Text variant="metadata" color="var(--positive-60)" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Check2 /> Approved Apr 28
        </Text>
      ) : (
        <Button variant="secondary" size="xs" onPress={() => navigate('/h2/dfy-campaigns')}>Open campaign</Button>
      )}
    </Card>
  );
}

// ─── AGENT PLAN PIECES ─────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ animation: 'ld-spin 0.85s linear infinite' }}>
      <style>{`@keyframes ld-spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 14" />
    </svg>
  );
}

/** One task's plan — the AM reviews it here, approves to start the agent
 *  on just this task, or sends a change request back. */
function AgentTaskModal({ close, task, onApprove, onRequestChanges }: StackModalProps & {
  task: AgentTask;
  onApprove: () => void;
  onRequestChanges: (note: string) => void;
}) {
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  const actionable = task.status === 'review';

  return (
    <Modal.Root size="md" aria-labelledby="agent-task-title">
      <Modal.Header title={task.text} id="agent-task-title" onClose={close} />
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', background: 'var(--focus-5)', border: '1px solid var(--focus-10)', borderRadius: 10, padding: '11px 13px' }}>
            <span style={{ color: 'var(--focus-50)', display: 'inline-flex', marginTop: 1 }}><Stars /></span>
            <Text variant="secondary" color="var(--dark-80)" style={{ lineHeight: 1.55 }}>{task.detail}</Text>
          </div>

          <div>
            <Text variant="label" color="var(--dark-40)" style={{ display: 'block', marginBottom: 8 }}>Plan</Text>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {task.plan.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 11, padding: '8px 2px', borderBottom: i < task.plan.length - 1 ? '1px solid var(--dark-6)' : 'none' }}>
                  <span style={{ width: 19, height: 19, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark-6)', color: 'var(--dark-50)' }}>
                    <Text variant="label" color="var(--dark-50)">{i + 1}</Text>
                  </span>
                  <Text variant="secondary" color="var(--dark-80)" style={{ lineHeight: 1.5 }}>{step}</Text>
                </div>
              ))}
            </div>
          </div>

          <Text variant="metadata" color="var(--dark-40)" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Avatar src={PEOPLE[task.assignee].img} fallback={PEOPLE[task.assignee].short.slice(0, 2)} size={16} />
            <span>
              Approval owned by <strong style={{ fontWeight: 600, color: 'var(--dark-60)' }}>{PEOPLE[task.assignee].short}</strong> · created from the Jun 3 call · nothing client-facing runs before approval
            </span>
          </Text>

          {showNote && (
            <TextArea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What should the agent do differently on this task?"
              autoFocus
              style={{ border: '1.5px solid var(--focus-20)', background: 'var(--focus-5)', minHeight: 64 }}
            />
          )}
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          {actionable && (
            showNote ? (
              <Modal.FooterButton variant="secondary" size="md" isDisabled={!note.trim()} onPress={() => onRequestChanges(note.trim())}>
                Send change request
              </Modal.FooterButton>
            ) : (
              <Modal.FooterButton variant="ghost" size="md" onPress={() => setShowNote(true)}>
                Request changes
              </Modal.FooterButton>
            )
          )}
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          {actionable ? (
            <Modal.FooterButton variant="primary" size="md" frontIcon={Check2} onPress={onApprove}>
              Approve & start
            </Modal.FooterButton>
          ) : (
            <Modal.FooterButton variant="secondary" size="md" onPress={close}>Close</Modal.FooterButton>
          )}
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ─── PROJECT BRAIN (Overview tab, AM-only) ─────────────────────────
// Replaces the DFY team's Claude project. One curated file per client —
// brand voice, content preferences, products, audience, materials, and
// every call conversation — that every agent run reads from. The agent
// keeps it current; the team edits and approves changes.

const BRAIN_VOICE = [
  { label: 'Voice', value: 'Professional, direct, locally grounded' },
  { label: 'Differentiator', value: 'Prep process + crew accountability' },
  { label: 'Tone', value: 'Confident without being salesy' },
  { label: 'Avoid', value: 'Discount framing, urgency hooks' },
];

const BRAIN_PREFERENCES = [
  { label: 'Platforms', value: 'Instagram · Facebook · LinkedIn (TikTok on hold — Jun 3 call)' },
  { label: 'Formats', value: 'Stills, carousels, reels · 4:5 for feed' },
  { label: 'Cadence', value: '6 posts per wave · 2 waves per month' },
  { label: 'Off-limits', value: 'Competitor comparisons, price callouts, stock photography' },
];

const BRAIN_AUDIENCE = 'Homeowners 35–65 in West Austin, Lakeway and Westlake — HOA-conscious, value trust over price. Secondary: property managers for occasional commercial repaints.';

interface BrainProduct { name: string; priority: string }

const SEED_BRAIN_PRODUCTS: BrainProduct[] = [
  { name: 'Exterior repaints', priority: 'Primary' },
  { name: 'Cabinet refinishing', priority: 'Occasional' },
  { name: 'Commercial repaints', priority: 'Occasional' },
];

const BRAIN_MATERIALS = [
  { name: 'CertaPro / 2026 Media', meta: 'Drive folder · 14 assets · synced', thumbs: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=120&h=120&fit=crop',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=120&h=120&fit=crop',
    'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=120&h=120&fit=crop',
    'https://picsum.photos/seed/certapro-a/120/120',
    'https://picsum.photos/seed/certapro-b/120/120',
    'https://picsum.photos/seed/certapro-c/120/120',
    'https://picsum.photos/seed/certapro-d/120/120',
    'https://picsum.photos/seed/certapro-e/120/120',
    'https://picsum.photos/seed/certapro-f/120/120',
    'https://picsum.photos/seed/certapro-g/120/120',
    'https://picsum.photos/seed/certapro-h/120/120',
    'https://picsum.photos/seed/certapro-i/120/120',
  ] },
  { name: 'spring-brief.pdf', meta: 'Campaign brief · uploaded Apr 12' },
  { name: 'certapro.com/austin', meta: 'Website · crawled weekly' },
];

function BrainCard({ title, prov, onEdit, headerAction, children }: { title: string; prov?: string; onEdit?: () => void; headerAction?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card padding="none" style={{ borderRadius: 10, padding: '13px 15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 9 }}>
        <Heading level={5} style={{ margin: 0 }}>{title}</Heading>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
          {prov && <Text variant="label" color="var(--dark-40)">{prov}</Text>}
          {headerAction ?? (onEdit ? (
            <Button variant="ghost" size="xs" square frontIcon={Edit1} onPress={onEdit} aria-label={`Edit ${title}`} />
          ) : null)}
        </span>
      </div>
      {children}
    </Card>
  );
}

// ─── DFY TEAM (Overview tab, client view) ──────────────────────────
// The client's view of who's on their account — the humans plus the
// agent, with how each one shows up for them.

const DFY_TEAM: { id: PersonId; blurb: string; canBook?: boolean }[] = [
  { id: 'alex', blurb: 'Your main point of contact — plans campaigns with you and reviews everything before it ships.', canBook: true },
  { id: 'petar', blurb: 'Designs your visual style and builds the templates your content is made from.' },
];

// ─── INSIGHTS (tab content) ────────────────────────────────────────

const INSIGHT_STATS = [
  { label: 'Estimate requests', value: '31', delta: '+18%', caption: 'May · vs April' },
  { label: 'Posts published', value: '12', delta: '100%', caption: 'May · on schedule' },
  { label: 'Approval turnaround', value: '1.4d', delta: '−0.6d', caption: 'avg · vs April' },
  { label: 'Instagram reach', value: '24.3k', delta: '+9%', caption: 'May · vs April' },
];

const REPORTS = [
  { id: 'r1', title: 'May performance report', meta: 'Sent Jun 1 · opened by Sarah twice' },
  { id: 'r2', title: 'April performance report', meta: 'Sent May 2 · opened by Sarah & Tom' },
  { id: 'r3', title: 'March performance report', meta: 'Sent Apr 1 · opened by Sarah' },
];

// ─── PAGE ──────────────────────────────────────────────────────────

type DocTab = 'overview' | 'meetings' | 'work' | 'insights';

/** Initial tab counts (seed-derived) for the Home tab strip rendered in the
 *  workspace topbar. Mirrors the in-component `openThreadCount` / `needsTeam`. */
export const HOME_TAB_COUNTS = {
  meetings: SEED_THREADS.filter((t) => !t.resolved).length,
  work:
    SEED_AGENT_TASKS.filter((t) => t.status === 'review').length +
    SEED_TEAM_FLAGS.filter((f) => !f.resolved).length +
    ACCOUNT_WORK.filter((w) => w.kind !== 'insight').length,
};

/** Meeting browser — call summaries, decisions and comment threads. Lives as a
 *  Brand Kit tab; self-contained (owns its own publish / thread / expand state). */
export function MeetingsView({ clientView }: { clientView: boolean }) {
  const { showToast } = useToast();
  const [published, setPublished] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['m-jun3', 'm-apr28']));
  const [threads, setThreads] = useState<Thread[]>(SEED_THREADS);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const publish = () => {
    setPublished(true);
    showToast({ message: 'Jun 3 notes are now visible to CertaPro' });
  };
  const addThread = (meetingId: string, text: string, attachments: Attachment[]) => {
    const author: PersonId = clientView ? 'sarah' : 'alex';
    setThreads((prev) => [
      ...prev,
      { id: `th-${prev.length + 1}`, meetingId, resolved: false, root: { author, time: 'Just now', text, attachments: attachments.length ? attachments : undefined }, replies: [] },
    ]);
  };
  const replyToThread = (threadId: string, text: string) => {
    const author: PersonId = clientView ? 'sarah' : 'alex';
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, replies: [...t.replies, { author, time: 'Just now', text }] } : t)));
  };
  const resolveThread = (threadId: string) => {
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, resolved: true } : t)));
    showToast({ message: 'Thread resolved' });
  };
  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const visibleMeetings = MEETINGS.filter((m) => !(clientView && m.pending && !published));

  return (
    <div style={{ maxWidth: 880 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12, padding: '0 2px' }}>
        <Heading level={4} style={{ margin: 0 }}>Meetings</Heading>
        <Text variant="metadata" color="var(--dark-40)">
          {clientView ? 'Synced automatically from every call' : 'Drafted by agent · published by you'}
        </Text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visibleMeetings.map((m) => (
          <MeetingEntry
            key={m.id}
            meeting={m}
            expanded={expanded.has(m.id)}
            published={published}
            clientView={clientView}
            threads={threads.filter((t) => t.meetingId === m.id)}
            onToggle={() => toggleExpanded(m.id)}
            onPublish={publish}
            onNewThread={(text, atts) => addThread(m.id, text, atts)}
            onReply={replyToThread}
            onResolve={resolveThread}
            sectionRef={(el) => { sectionRefs.current[m.id] = el; }}
          />
        ))}
      </div>
    </div>
  );
}

export function Home({ clientView, tab, onTabChange }: { clientView: boolean; tab: string; onTabChange: (t: string) => void }) {
  const { showToast } = useToast();
  const { openModal, closeModal } = useModals();
  const navigate = useNavigate();
  const setTab = onTabChange;
  const [materialsTab, setMaterialsTab] = useState<'sources' | 'media'>('sources');
  const [workFilter, setWorkFilter] = useState<'all' | 'plans' | 'signoffs' | 'flags' | 'insights'>('all');
  const [personFilter, setPersonFilter] = useState<'all' | PersonId>('all');
  const [published, setPublished] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['m-jun3', 'm-apr28']));
  const [steps, setSteps] = useState<NextStep[]>(SEED_STEPS);
  const [activity, setActivity] = useState<ActivityItem[]>(SEED_ACTIVITY);
  const [threads, setThreads] = useState<Thread[]>(SEED_THREADS);
  const [agentTasks, setAgentTasks] = useState<AgentTask[]>(SEED_AGENT_TASKS);
  const [teamFlags] = useState<TeamFlag[]>(SEED_TEAM_FLAGS);
  const [brainProducts, setBrainProducts] = useState<BrainProduct[]>(SEED_BRAIN_PRODUCTS);
  const [approvedWork, setApprovedWork] = useState<Set<string>>(new Set());
  const [reminded, setReminded] = useState(false);
  // Agent-suggested brain update: promote cabinet refinishing (Apr 2 + Jun 3 signals).
  const [productSuggestion, setProductSuggestion] = useState<'open' | 'accepted' | 'dismissed'>('open');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const publish = () => {
    setPublished(true);
    setActivity((a) => [{ id: `a-${a.length + 1}`, kind: 'publish', text: 'You published Jun 3 notes to the client', time: 'Just now' }, ...a]);
    showToast({ message: 'Jun 3 notes are now visible to CertaPro' });
  };

  /** Inline sign-off on a cross-product item — no page hop needed. */
  const approveWorkItem = (w: AccountWorkItem) => {
    setApprovedWork((prev) => new Set(prev).add(w.id));
    setActivity((a) => [{ id: `a-${a.length + 1}`, kind: 'publish', text: `Approved: ${w.title}`, time: 'Just now' }, ...a]);
    showToast({ message: 'Approved — publishing on schedule' });
  };

  const remindClient = () => {
    setReminded(true);
    setActivity((a) => [{ id: `a-${a.length + 1}`, kind: 'review', text: 'Reminder sent to Sarah — 6 items awaiting approval', time: 'Just now' }, ...a]);
    showToast({ message: 'Reminder sent to Sarah' });
  };

  const acceptProductSuggestion = () => {
    setProductSuggestion('accepted');
    setBrainProducts((ps) => ps.map((p) => (p.name === 'Cabinet refinishing' ? { ...p, priority: 'Secondary' } : p)));
    setActivity((a) => [{ id: `a-${a.length + 1}`, kind: 'agent', text: 'Brain updated — cabinet refinishing promoted to secondary focus', time: 'Just now' }, ...a]);
    showToast({ message: 'Brain updated — the agent uses this on its next run' });
  };

  const addThread =(meetingId: string, text: string, attachments: Attachment[]) => {
    const author: PersonId = clientView ? 'sarah' : 'alex';
    setThreads((prev) => [
      ...prev,
      { id: `th-${prev.length + 1}`, meetingId, resolved: false, root: { author, time: 'Just now', text, attachments: attachments.length ? attachments : undefined }, replies: [] },
    ]);
    setActivity((a) => [{ id: `a-${a.length + 1}`, kind: 'comment', text: `${PEOPLE[author].short} started a thread`, time: 'Just now' }, ...a]);
  };

  const replyToThread = (threadId: string, text: string) => {
    const author: PersonId = clientView ? 'sarah' : 'alex';
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, replies: [...t.replies, { author, time: 'Just now', text }] } : t)));
  };

  const resolveThread = (threadId: string) => {
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, resolved: true } : t)));
    showToast({ message: 'Thread resolved' });
  };

  /** Approve one task's plan — the agent starts on just that task. */
  const approveTask = (id: string) => {
    const task = SEED_AGENT_TASKS.find((t) => t.id === id)!;
    closeModal();
    setAgentTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status: 'running' as const } : t)));
    setActivity((a) => [{ id: `a-${a.length + 1}`, kind: 'agent', text: `Agent started: “${task.text}”`, time: 'Just now' }, ...a]);
    showToast({ message: `Agent is on it — ${task.text.toLowerCase()}` });
    // Prototype-only: the task visibly completes a moment later.
    setTimeout(() => {
      setAgentTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status: 'done' as const } : t)));
      if (task.output) {
        setActivity((a) => [{ id: `a-${a.length + 1}`, kind: 'review', text: `“${task.text}” finished — output ready for review`, time: 'Just now' }, ...a]);
      }
    }, 2800);
  };

  const requestTaskChanges = (id: string, note: string) => {
    const task = SEED_AGENT_TASKS.find((t) => t.id === id)!;
    closeModal();
    setAgentTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status: 'revising' as const } : t)));
    setActivity((a) => [{ id: `a-${a.length + 1}`, kind: 'agent', text: `Change request on “${task.text}” — agent revising the plan`, time: 'Just now' }, ...a]);
    showToast({ message: 'Sent — the agent will revise this task’s plan' });
  };

  const openTaskModal = (task: AgentTask) => {
    openModal(AgentTaskModal, {
      task,
      onApprove: () => approveTask(task.id),
      onRequestChanges: (note: string) => requestTaskChanges(task.id, note),
    });
  };

  /** Approve every plan still in review — agent works through them in order. */
  const approveAllTasks = () => {
    const ids = agentTasks.filter((t) => t.status === 'review').map((t) => t.id);
    if (ids.length === 0) return;
    setAgentTasks((ts) => ts.map((t) => (t.status === 'review' ? { ...t, status: 'running' as const } : t)));
    setActivity((a) => [{ id: `a-${a.length + 1}`, kind: 'agent', text: `${ids.length} plans approved — agent working through the queue`, time: 'Just now' }, ...a]);
    showToast({ message: `${ids.length} plans approved — agent is off to work` });
    // Prototype-only: tasks complete one after another so the rail visibly works.
    ids.forEach((id, i) => {
      setTimeout(() => {
        setAgentTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status: 'done' as const } : t)));
        const task = SEED_AGENT_TASKS.find((t) => t.id === id)!;
        if (task.output) {
          setActivity((a) => [{ id: `a-${a.length + 1}-${id}`, kind: 'review', text: `“${task.text}” finished — output ready for review`, time: 'Just now' }, ...a]);
        }
      }, 2200 + i * 1100);
    });
  };

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // What the client can see right now
  const visibleMeetings = MEETINGS.filter((m) => !(clientView && m.pending && !published));
  const clientSteps = steps.filter((s) => s.owner === 'sarah' && !(s.fromPending && !published));
  const visibleActivity = clientView ? activity.filter((a) => CLIENT_VISIBLE_KINDS.includes(a.kind)) : activity;
  const openClientSteps = clientSteps.filter((s) => !s.done).length;
  const agentDone = agentTasks.filter((t) => t.status === 'done').length;
  const tasksToReview = agentTasks.filter((t) => t.status === 'review').length;
  const openFlags = teamFlags.filter((f) => !f.resolved).length;
  const hasBlocked = teamFlags.some((f) => !f.resolved && f.kind === 'blocked');

  const overviewText = published
    ? 'June planning kicked off on the Jun 3 call — the next wave leads with the team-intro post, with the interior-season teaser mid-month. Awaiting Sarah’s final color picks (due Jun 6). Spring Exterior — Wave 2 runs through Jun 13, with estimate requests up 18% month over month.'
    : 'Spring Exterior — Wave 2 is live through Jun 13 — six posts approved on the Apr 28 review, performing ahead of the spring benchmark. The summer palette direction is locked: warm neutrals anchored by sage green, built on the Lakeway photo set.';

  const openThreadCount = threads.filter((t) => !t.resolved).length;
  const outputsReady = agentTasks.filter((t) => t.status === 'done' && t.output).length;
  const needsTeam = tasksToReview + openFlags + ACCOUNT_WORK.filter((w) => w.kind !== 'insight').length;

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', paddingBottom: 48 }}>

        {/* Client view banner — shown on every tab */}
        {clientView && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--dark-90)', color: 'var(--light-100)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
            <EyeOpen />
            <Text variant="secondary" color="var(--light-100)" style={{ flex: 1 }}>
              Viewing as <strong style={{ fontWeight: 600 }}>Sarah Johnson</strong> — drafts, internal notes and production activity are hidden.
            </Text>
          </div>
        )}

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 0', minWidth: 0, maxWidth: 780, paddingTop: 15 }}>

          {/* Doc header — identity + health for the AM, reassurance for the client */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Heading level={2} style={{ margin: 0 }}>
                CertaPro Painters of Austin
              </Heading>
              <StatusPill tone="success" size="sm">On track</StatusPill>
              <span style={{ flex: 1 }} />
              <Text variant="metadata" color="var(--dark-40)">
                Updated by agent · after the {published ? 'Jun 3 check-in' : 'Apr 28 review'}
              </Text>
            </div>
          </div>

          {/* Where things stand */}
          <div>
            <Paragraph variant="primary" color="var(--dark-80)" style={{ lineHeight: 1.6, margin: '0 0 14px' }}>{overviewText}</Paragraph>

            <div style={{ display: 'flex', gap: 10 }}>

              {/* Client approvals — first: the most actionable thing on the page */}
              <Card padding="none" style={{ flex: 1, borderRadius: 9, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Text variant="label" color="var(--dark-40)">{clientView ? 'Your approvals' : 'Client approvals'}</Text>
                <Text variant="smallList" style={{ lineHeight: 1.35 }}>
                  {APPROVAL_PENDING_COUNT} item{APPROVAL_PENDING_COUNT === 1 ? '' : 's'} {clientView ? 'need your approval' : 'waiting on CertaPro'}
                </Text>
                <div style={{ marginTop: 'auto', paddingTop: 7 }}>
                  <Button variant="secondary" size="xs" frontIcon={Approvals} onPress={() => navigate('/h2/approvals')}>
                    {clientView ? 'Review & approve' : 'Open approvals'}
                  </Button>
                </div>
              </Card>

              {/* Next call — meeting logistics */}
              <Card padding="none" style={{ flex: 1, borderRadius: 9, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Text variant="label" color="var(--dark-40)">Next call</Text>
                <Text variant="smallList" style={{ lineHeight: 1.35 }}>Creative review — Mon, Jun 16</Text>
                <Text variant="metadata" color="var(--dark-50)">10:00–10:45 AM CT · Zoom</Text>
                <div style={{ marginTop: 'auto', paddingTop: 7 }}>
                  <Button variant="secondary" size="xs" frontIcon={Video} onPress={() => showToast({ message: 'Opening Zoom…' })}>Join</Button>
                </div>
              </Card>
            </div>
          </div>

          {/* ── PROJECT BRAIN — the client's curated context file. AM-only:
                this replaces the team's Claude project. ── */}
          {!clientView && (
            <>
              <div style={{ height: 32 }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <Heading level={4} style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Project brain
                  <StatusPill tone="success" size="sm">Agent-ready</StatusPill>
                </Heading>
                <Text variant="metadata" color="var(--dark-40)">Read by every agent run</Text>
              </div>
              <Text variant="secondary" color="var(--dark-50)" style={{ display: 'block', margin: '0 0 14px', lineHeight: 1.5 }}>
                Replaces the Claude project — one curated file with everything the agents work from: voice, preferences, products, audience, materials and every conversation.
              </Text>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <BrainCard title="Brand voice" prov="Kickoff · refined Apr 28" onEdit={() => showToast({ message: 'Opens in the brain editor — agents re-read on the next run' })}>
                  {BRAIN_VOICE.map(({ label, value }) => (
                    <div key={label} style={{ marginBottom: 10 }}>
                      <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block', marginBottom: 2 }}>{label}</Text>
                      <Text variant="secondary" color="var(--dark-80)" style={{ display: 'block', lineHeight: 1.45 }}>{value}</Text>
                    </div>
                  ))}
                </BrainCard>

                <BrainCard title="Content preferences" prov="Updated Jun 3" onEdit={() => showToast({ message: 'Opens in the brain editor — agents re-read on the next run' })}>
                  {BRAIN_PREFERENCES.map(({ label, value }) => (
                    <div key={label} style={{ marginBottom: 10 }}>
                      <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block', marginBottom: 2 }}>{label}</Text>
                      <Text variant="secondary" color="var(--dark-80)" style={{ display: 'block', lineHeight: 1.45 }}>{value}</Text>
                    </div>
                  ))}
                </BrainCard>

                <BrainCard title="Products & services" prov="Reviewed Mar 12" onEdit={() => showToast({ message: 'Opens in the brain editor — agents re-read on the next run' })}>
                  {brainProducts.map((p) => (
                    <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Text variant="secondary" color="var(--dark-80)" style={{ flex: 1 }}>{p.name}</Text>
                      <StatusPill tone={p.priority === 'Primary' ? 'info' : 'neutral'} size="sm">{p.priority}</StatusPill>
                    </div>
                  ))}
                  {productSuggestion === 'open' && (
                    <div style={{ background: 'var(--focus-5)', border: '1px solid var(--focus-10)', borderRadius: 8, padding: '9px 11px', marginTop: 9 }}>
                      <Text variant="secondary" color="var(--dark-80)" style={{ display: 'block', lineHeight: 1.5 }}>Agent suggests promoting cabinet refinishing to secondary focus — interest raised on the Apr 2 and Jun 3 calls.</Text>
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        <Button variant="primary" size="xs" frontIcon={Check2} onPress={acceptProductSuggestion}>Accept</Button>
                        <Button variant="secondary" size="xs" onPress={() => setProductSuggestion('dismissed')}>Dismiss</Button>
                      </div>
                    </div>
                  )}
                  {productSuggestion === 'accepted' && (
                    <Text variant="metadata" color="var(--positive-60)" style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
                      <Check2 /> Updated — agent reads this on its next run
                    </Text>
                  )}
                </BrainCard>

                <BrainCard title="Audience" prov="From kickoff" onEdit={() => showToast({ message: 'Opens in the brain editor — agents re-read on the next run' })}>
                  <Text variant="secondary" color="var(--dark-80)" style={{ display: 'block', lineHeight: 1.55 }}>{BRAIN_AUDIENCE}</Text>
                </BrainCard>
              </div>

              {/* Materials + Conversations — side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10, alignItems: 'start' }}>
                <BrainCard title="Materials" prov="3 sources connected" onEdit={() => showToast({ message: 'Manage connected sources' })}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    <TabChip selected={materialsTab === 'sources'} onSelect={() => setMaterialsTab('sources')}>Source materials</TabChip>
                    <TabChip selected={materialsTab === 'media'} onSelect={() => setMaterialsTab('media')}>Media</TabChip>
                  </div>
                  {materialsTab === 'sources' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                      {BRAIN_MATERIALS.filter((m) => !m.thumbs).map((m) => (
                        <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ color: 'var(--dark-40)', display: 'inline-flex' }}><File /></span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Text variant="smallList" style={{ display: 'block' }}>{m.name}</Text>
                            <Text variant="label" color="var(--dark-40)" style={{ display: 'block' }}>{m.meta}</Text>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {BRAIN_MATERIALS.filter((m) => m.thumbs).map((m) => (
                        <div key={m.name}>
                          <div style={{ display: 'flex', gap: 5, marginBottom: 6, flexWrap: 'wrap' }}>
                            {m.thumbs!.map((src, i) => (
                              <span key={i} style={{ width: 40, height: 40, borderRadius: 6, backgroundImage: `url('${src}')`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ marginTop: 10 }}>
                    <Button variant="ghost" size="xs" onPress={() => showToast({ message: 'Connect a Drive folder, upload files, or add a URL' })}>
                      + Add material
                    </Button>
                  </div>
                </BrainCard>

                <BrainCard title="Conversations" prov={`${MEETINGS.length} calls ingested · latest Jun 3`}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {MEETINGS.map((m) => (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <Text variant="smallList" color="var(--dark-90)">{m.date}</Text>
                        <Text variant="secondary" color="var(--dark-50)" style={{ flex: 1 }}>{MEETING_META[m.type].label} · {m.duration}</Text>
                      </div>
                    ))}
                  </div>
                </BrainCard>
              </div>
            </>
          )}

          {/* ── YOUR BLAZE TEAM — client view: who's on the account ── */}
          {clientView && (
            <>
              <div style={{ height: 32 }} />

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
                <Heading level={4} style={{ margin: 0 }}>Your Blaze team</Heading>
                <Text variant="metadata" color="var(--dark-40)">On CertaPro every week</Text>
              </div>
              <Text variant="secondary" color="var(--dark-50)" style={{ display: 'block', margin: '0 0 14px', lineHeight: 1.5 }}>
                Two people and an agent — questions land with Alex, creative direction with Petar.
              </Text>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {DFY_TEAM.map((m) => {
                  const p = PEOPLE[m.id];
                  return (
                    <Card key={m.id} padding="none" style={{ borderRadius: 10, padding: '14px 15px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <Avatar src={p.img} fallback={p.short.slice(0, 2)} size={36} />
                        <div>
                          <Text variant="smallList" style={{ display: 'block' }}>{p.name}</Text>
                          <Text variant="metadata" color="var(--dark-50)" style={{ display: 'block' }}>{p.role.replace('Blaze · ', '')}</Text>
                        </div>
                      </div>
                      <Text variant="secondary" color="var(--dark-70)" style={{ display: 'block', lineHeight: 1.5, flex: 1 }}>{m.blurb}</Text>
                      <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                        <Button variant="secondary" size="xs" frontIcon={Comment} onPress={() => showToast({ message: `Opens a thread with ${p.short}` })}>Message</Button>
                        {m.canBook && (
                          <Button variant="secondary" size="xs" frontIcon={Video} onPress={() => showToast({ message: `Opening ${p.short}’s calendar…` })}>Book time</Button>
                        )}
                      </div>
                    </Card>
                  );
                })}

                {/* The agent — always-on third member, human-reviewed */}
                <Card padding="none" style={{ border: '1px solid var(--focus-10)', background: 'var(--focus-5)', borderRadius: 10, padding: '14px 15px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--focus-10)', color: 'var(--focus-50)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Stars />
                    </span>
                    <div>
                      <Text variant="smallList" style={{ display: 'block' }}>CertaPro Agent</Text>
                      <Text variant="metadata" color="var(--focus-50)" style={{ display: 'block' }}>Always on</Text>
                    </div>
                  </div>
                  <Text variant="secondary" color="var(--dark-70)" style={{ display: 'block', lineHeight: 1.5, flex: 1 }}>
                    Drafts your content, preps call notes and keeps this page current — everything is reviewed by Alex before it reaches you.
                  </Text>
                </Card>
              </div>
            </>
          )}
        </div>

        {/* Overview right rail */}
        <div style={{ width: 312, flexShrink: 0, position: 'sticky', top: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Insights — at-a-glance metrics, moved out of the doc body */}
          <Card padding="none" style={{ borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Heading level={5} style={{ margin: 0 }}>Insights</Heading>
              <Button variant="ghost" size="xs" onPress={() => setTab('insights')}>See all →</Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { value: '31', delta: '+18%', label: 'Estimate requests · May' },
                { value: '12', delta: '100% on time', label: 'Posts published · May' },
                { value: 'Jun 16', delta: undefined, label: 'June wave starts' },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <Text variant="largeList" color="var(--dark-100)">{s.value}</Text>
                    {s.delta && <Text variant="label" color="var(--positive-60)">{s.delta}</Text>}
                  </div>
                  <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block', marginTop: 1 }}>{s.label}</Text>
                </div>
              ))}
            </div>
          </Card>

          {/* AM: compact agent summary pointing into the Agent tab */}
          {!clientView && (
            <Card padding="none" style={{ borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <Heading level={5} style={{ margin: 0 }}>Agent</Heading>
                <StatusPill tone={tasksToReview > 0 || hasBlocked ? 'warning' : 'success'} size="sm">
                  {tasksToReview + openFlags > 0 ? `${tasksToReview + openFlags} need you` : 'Running clean'}
                </StatusPill>
              </div>
              <Text variant="secondary" color="var(--dark-70)" style={{ display: 'block', lineHeight: 1.55 }}>
                {tasksToReview} plan{tasksToReview === 1 ? '' : 's'} to review · {openFlags} open flag{openFlags === 1 ? '' : 's'}{hasBlocked ? ' (1 blocking)' : ''}{outputsReady > 0 ? ` · ${outputsReady} output${outputsReady === 1 ? '' : 's'} ready` : ''}
              </Text>
              <div style={{ marginTop: 10 }}>
                <Button variant="secondary" size="xs" onPress={() => setTab('work')}>Open workstream</Button>
              </div>
            </Card>
          )}

          {/* Client to-dos — what's waiting on CertaPro, both views */}
          <Card padding="none" style={{ borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Heading level={5} style={{ margin: 0 }}>{clientView ? 'Your next steps' : 'Waiting on CertaPro'}</Heading>
              <StatusPill tone="info" size="sm">{openClientSteps} open</StatusPill>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {clientSteps.map((s) => (
                <div key={s.id} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                  <span style={{ marginTop: 2, display: 'inline-flex' }}>
                    <Checkbox
                      checked={s.done}
                      onChange={() => setSteps((prev) => prev.map((p) => (p.id === s.id ? { ...p, done: !p.done } : p)))}
                    />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="secondary" color={s.done ? 'var(--dark-40)' : 'var(--dark-90)'} style={{ display: 'block', textDecoration: s.done ? 'line-through' : 'none', lineHeight: 1.4 }}>{s.text}</Text>
                    <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block', marginTop: 3 }}>Due {s.due} · {s.source}</Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Client view gets the content-lifecycle activity here */}
          {clientView && (
            <Card padding="none" style={{ borderRadius: 12, padding: '14px 16px' }}>
              <Heading level={5} style={{ margin: '0 0 12px' }}>Activity</Heading>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                {visibleActivity.map((a) => (
                  <div key={a.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <ActivityGlyph kind={a.kind} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text variant="secondary" color="var(--dark-80)" style={{ display: 'block', lineHeight: 1.45 }}>{a.text}</Text>
                      <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block', marginTop: 2 }}>{a.time}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
        </div>
        )}

        {/* Meetings moved to a Brand Kit tab (see MeetingsView). */}

        {/* ── WORKSTREAM TAB — everything moving across the account, one
              filterable feed (old-Home card anatomy) + activity timeline. ── */}
        {tab === 'work' && !clientView && (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', justifyContent: 'center', padding: '8px 4px 60px' }}>
        <div style={{ flex: '1 1 0', minWidth: 0, maxWidth: 720 }}>

          {/* Hero — mirrors old Home's greeting block */}
          <div style={{ padding: '16px 0 20px' }}>
            <Heading level={3} style={{ margin: 0, lineHeight: 1.2 }}>
              Everything moving on CertaPro.
            </Heading>
            <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginTop: 6, lineHeight: 1.5 }}>
              {needsTeam} item{needsTeam === 1 ? '' : 's'} need someone — across organic, Local SEO, reputation and paid. The agent handles the rest ({agentDone}/{agentTasks.length} queue tasks done).
            </Text>
          </div>

          {/* Filters — kind + assignee consolidated into one dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <Select
              size="sm"
              placeholder="Filters"
              style={{ minWidth: 170 }}
              value={personFilter !== 'all' ? `person:${personFilter}` : workFilter !== 'all' ? workFilter : ''}
              onChange={(v) => {
                if (v === 'all') { setWorkFilter('all'); setPersonFilter('all'); }
                else if (v.startsWith('person:')) { setPersonFilter(v.slice(7) as PersonId); setWorkFilter('all'); }
                else { setWorkFilter(v as 'all' | 'plans' | 'signoffs' | 'flags' | 'insights'); setPersonFilter('all'); }
              }}
              options={[
                { value: 'all', label: 'All items' },
                { value: 'plans', label: `Agent plans · ${agentTasks.length}` },
                { value: 'signoffs', label: `Sign-offs · ${ACCOUNT_WORK.filter((w) => w.kind === 'signoff').length}` },
                { value: 'flags', label: `Flags · ${teamFlags.length + ACCOUNT_WORK.filter((w) => w.kind === 'flag').length}` },
                { value: 'insights', label: `Insights · ${ACCOUNT_WORK.filter((w) => w.kind === 'insight').length}` },
                { value: 'person:alex', label: 'Assigned to Alex' },
                { value: 'person:petar', label: 'Assigned to Petar' },
                { value: 'person:sarah', label: 'Assigned to Sarah' },
              ]}
            />
            <span style={{ flex: 1 }} />
            {tasksToReview > 0 && (workFilter === 'all' || workFilter === 'plans') && (
              <Button variant="primary" size="sm" frontIcon={Check2} className={styles.approveBtn} onPress={approveAllTasks}>
                Approve all plans ({tasksToReview})
              </Button>
            )}
          </div>

          {/* THE feed — plans, flags, cross-product items, each with its own tag */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* Agent plans — each has a named approval owner */}
            {(workFilter === 'all' || workFilter === 'plans') && agentTasks.filter((t) => personFilter === 'all' || t.assignee === personFilter).map((t) => {
              const doneWithOutput = t.status === 'done' && t.output;
              return (
                <Card
                  key={t.id}
                  padding="none"
                  interactive
                  onClick={() => openTaskModal(t)}
                  className={styles.taskItem}
                  style={{ border: '1px solid var(--dark-4)', borderRadius: 14, padding: '18px 20px' }}
                >
                  {/* meta: status is the pill; source carries the ✦ agent mark;
                      assignee is just the avatar (name in tooltip) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    {t.status !== 'review' && (
                      <StatusPill tone={t.status === 'done' ? 'success' : t.status === 'running' ? 'info' : 'warning'} size="sm">
                        {t.status === 'running' ? 'Running' : t.status === 'revising' ? 'Revising' : doneWithOutput ? 'Done — review output' : 'Done'}
                      </StatusPill>
                    )}
                    <Text variant="metadata" color="var(--dark-60)" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {t.source}
                    </Text>
                    <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      {t.status === 'running' && <span style={{ color: 'var(--focus-50)', display: 'inline-flex' }}><SpinnerIcon /></span>}
                      <Avatar src={PEOPLE[t.assignee].img} fallback={PEOPLE[t.assignee].short.slice(0, 2)} size={16} />
                      <Text variant="metadata" color="var(--dark-40)" style={{ fontVariantNumeric: 'tabular-nums' }}>Yesterday</Text>
                    </span>
                  </div>
                  <Text variant="largeList" style={{ display: 'block', lineHeight: 1.35, letterSpacing: '-0.1px', marginBottom: 6 }}>{t.text}</Text>
                  <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', lineHeight: 1.55 }}>{t.detail}</Text>

                  {/* the plan itself — what you're actually approving */}
                  {(t.status === 'review' || t.status === 'revising') && (
                    <div style={{ marginTop: 10, borderLeft: '2px solid var(--dark-8)', paddingLeft: 11, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {t.plan.slice(0, 3).map((s, si) => (
                        <Text key={si} variant="secondary" color="var(--dark-60)" style={{ display: 'block', lineHeight: 1.45 }}>
                          <span style={{ color: 'var(--dark-40)', fontVariantNumeric: 'tabular-nums' }}>{si + 1}.</span> {s}
                        </Text>
                      ))}
                      {t.plan.length > 3 && (
                        <Text variant="metadata" color="var(--dark-40)">+{t.plan.length - 3} more step{t.plan.length - 3 === 1 ? '' : 's'} — open for the full plan</Text>
                      )}
                    </div>
                  )}

                  {/* stakes — why this matters now */}
                  <Text variant="metadata" color="var(--dark-50)" style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 9 }}>
                    <span style={{ color: 'var(--dark-40)', display: 'inline-flex' }}><Clock1 /></span> {t.why}
                  </Text>

                  {(t.status === 'review' || doneWithOutput) && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }} onClick={(e) => e.stopPropagation()}>
                      {t.status === 'review' ? (
                        <>
                          <Button variant="secondary" size="sm" onPress={() => openTaskModal(t)}>Details</Button>
                          <Button variant="primary" size="sm" frontIcon={Check2} className={styles.approveBtn} onPress={() => approveTask(t.id)}>Approve & start</Button>
                        </>
                      ) : (
                        <Button variant="secondary" size="sm" onPress={() => navigate(t.output!.to)}>{t.output!.label}</Button>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}

            {/* Team flags */}
            {(workFilter === 'all' || workFilter === 'flags') && teamFlags.filter((f) => personFilter === 'all' || f.owner === personFilter).map((f) => {
              const fm = FLAG_META[f.kind];
              return (
                <Card key={f.id} padding="none" style={{ border: '1px solid var(--dark-4)', borderRadius: 14, padding: '18px 20px', opacity: f.resolved ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                    {f.resolved ? (
                      <StatusPill tone="success" size="sm">Resolved</StatusPill>
                    ) : (
                      <StatusPill tone={f.kind === 'blocked' ? 'danger' : 'warning'} size="sm">{fm.label}</StatusPill>
                    )}
                    <Text variant="metadata" color="var(--dark-60)">{f.source}</Text>
                    <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <Avatar src={PEOPLE[f.owner].img} fallback={PEOPLE[f.owner].short.slice(0, 2)} size={16} />
                      <Text variant="metadata" color="var(--dark-40)" style={{ fontVariantNumeric: 'tabular-nums' }}>Yesterday</Text>
                    </span>
                  </div>
                  <Text variant="largeList" color={f.resolved ? 'var(--dark-50)' : 'var(--dark-90)'} style={{ display: 'block', lineHeight: 1.35, letterSpacing: '-0.1px', textDecoration: f.resolved ? 'line-through' : 'none' }}>
                    {f.text}
                  </Text>
                  {!f.resolved && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                      <Button variant="secondary" size="sm" onPress={() => navigate(f.cta.to)}>{f.cta.label}</Button>
                    </div>
                  )}
                </Card>
              );
            })}

            {/* Cross-product items — Local SEO, reputation, paid, approvals, SEO */}
            {ACCOUNT_WORK
              .filter((w) => workFilter === 'all' || (workFilter === 'signoffs' && w.kind === 'signoff') || (workFilter === 'flags' && w.kind === 'flag') || (workFilter === 'insights' && w.kind === 'insight'))
              .filter((w) => personFilter === 'all' || w.assignee === personFilter)
              .map((w) => {
                const WIcon = w.icon;
                const isApproved = approvedWork.has(w.id);
                return (
                  <Card key={w.id} padding="none" style={{ border: '1px solid var(--dark-4)', borderRadius: 14, padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      {isApproved ? (
                        <StatusPill tone="success" size="sm">Approved</StatusPill>
                      ) : w.kind === 'signoff' ? (
                        <StatusPill tone="warning" size="sm">{w.remind ? 'With client' : 'Needs sign-off'}</StatusPill>
                      ) : w.kind === 'flag' ? (
                        <StatusPill tone="danger" size="sm">Blocked</StatusPill>
                      ) : (
                        <StatusPill tone="info" size="sm">Insight</StatusPill>
                      )}
                      <Text variant="metadata" color="var(--dark-60)" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <WIcon /> {w.sourceLabel}
                      </Text>
                      <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <Avatar src={PEOPLE[w.assignee].img} fallback={PEOPLE[w.assignee].short.slice(0, 2)} size={16} />
                        <Text variant="metadata" color="var(--dark-40)" style={{ fontVariantNumeric: 'tabular-nums' }}>{w.time}</Text>
                      </span>
                    </div>
                    <Text variant="largeList" style={{ display: 'block', lineHeight: 1.35, letterSpacing: '-0.1px', marginBottom: w.body ? 6 : 0 }}>{w.title}</Text>
                    {w.body && <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', lineHeight: 1.55 }}>{w.body}</Text>}

                    {/* what the draft responds to */}
                    {w.quote && (
                      <div style={{ marginTop: 10, background: 'var(--dark-4)', borderRadius: 8, padding: '9px 12px' }}>
                        <Text variant="secondary" color="var(--dark-70)" style={{ display: 'block', lineHeight: 1.5 }}>{w.quote}</Text>
                      </div>
                    )}

                    {/* the draft itself — judge it right here */}
                    {w.excerpt && (
                      <div style={{ marginTop: 10, borderLeft: '2px solid var(--focus-20)', paddingLeft: 11 }}>
                        <Text variant="label" color="var(--dark-40)" style={{ display: 'block', marginBottom: 3 }}>Draft</Text>
                        <Text variant="secondary" color="var(--dark-70)" style={{ display: 'block', lineHeight: 1.5 }}>{w.excerpt}</Text>
                      </div>
                    )}

                    {/* visual preview */}
                    {w.thumbs && (
                      <div style={{ display: 'flex', gap: 5, marginTop: 10 }}>
                        {w.thumbs.map((src, ti) => (
                          <span key={ti} style={{ width: 40, height: 40, borderRadius: 6, backgroundImage: `url('${src}')`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                        ))}
                        <span style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--dark-6)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Text variant="label" color="var(--dark-40)">+2</Text>
                        </span>
                      </div>
                    )}

                    {/* stakes */}
                    {w.statusLine && (
                      <Text variant="metadata" color="var(--dark-50)" style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 9 }}>
                        <span style={{ color: 'var(--dark-40)', display: 'inline-flex' }}><Clock1 /></span> {w.statusLine}
                      </Text>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
                      {isApproved ? (
                        <Text variant="metadata" color="var(--positive-60)" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Check2 /> Approved — publishing on schedule
                        </Text>
                      ) : (
                        <>
                          {w.remind && (
                            reminded ? (
                              <Text variant="metadata" color="var(--positive-60)" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 'auto' }}>
                                <Check2 /> Reminder sent
                              </Text>
                            ) : (
                              <Button variant="secondary" size="sm" onPress={remindClient}>Remind Sarah</Button>
                            )
                          )}
                          <Button variant="secondary" size="sm" onPress={() => navigate(w.cta.to)}>{w.cta.label}</Button>
                          {w.approveLabel && (
                            <Button variant="primary" size="sm" frontIcon={Check2} className={styles.approveBtn} onPress={() => approveWorkItem(w)}>{w.approveLabel}</Button>
                          )}
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>

        {/* RR — activity as a timeline */}
        <div style={{ width: 320, flexShrink: 0, position: 'sticky', top: 12 }}>
          <Card padding="none" style={{ borderRadius: 12, padding: '16px 16px 8px' }}>
            <Text variant="smallList" style={{ display: 'block', marginBottom: 14 }}>Activity</Text>
            <div>
              {activity.map((a, i) => (
                <div key={a.id} style={{ display: 'flex', gap: 11 }}>
                  {/* glyph + connector line */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <ActivityGlyph kind={a.kind} />
                    {i < activity.length - 1 && <div style={{ width: 1.5, flex: 1, background: 'var(--dark-8)', margin: '3px 0' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, paddingBottom: i < activity.length - 1 ? 16 : 8 }}>
                    <Text variant="secondary" color="var(--dark-80)" style={{ display: 'block', lineHeight: 1.45 }}>{a.text}</Text>
                    <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block', marginTop: 2 }}>
                      {a.time}
                      {a.sub && !published && <span style={{ color: 'var(--focus-50)', fontWeight: 500 }}> · {a.sub}</span>}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        </div>
        )}

        {/* ── INSIGHTS TAB — performance + reporting, client-safe ── */}
        {tab === 'insights' && (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
            {INSIGHT_STATS.map((s) => (
              <Card key={s.label} padding="none" style={{ borderRadius: 12, padding: '14px 16px' }}>
                <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block' }}>{s.label}</Text>
                <Heading level={2} style={{ margin: '4px 0 0' }}>{s.value}</Heading>
                <Text variant="metadata" style={{ display: 'block', marginTop: 2 }}>
                  <span style={{ color: 'var(--positive-60)', fontWeight: 600 }}>{s.delta}</span>
                  <span style={{ color: 'var(--dark-40)' }}> · {s.caption}</span>
                </Text>
              </Card>
            ))}
          </div>
          <Card padding="none" style={{ borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text variant="smallList">Reports</Text>
              {!clientView && (
                <Button variant="primary" size="xs" onPress={() => showToast({ message: 'June report queued — the agent assembles it from campaign results' })}>
                  Generate June report
                </Button>
              )}
            </div>
            <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block', marginBottom: 8 }}>
              Assembled by the agent monthly · shared with CertaPro from here
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {REPORTS.map((r, i) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < REPORTS.length - 1 ? '1px solid var(--dark-6)' : 'none' }}>
                  <span style={{ color: 'var(--dark-40)', display: 'inline-flex' }}><File /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="smallList" style={{ display: 'block' }}>{r.title}</Text>
                    <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block', marginTop: 1 }}>{r.meta}</Text>
                  </div>
                  <Button variant="secondary" size="xs" onPress={() => showToast({ message: `Opening ${r.title.toLowerCase()}…` })}>View</Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
        )}
      </div>
  );
}
