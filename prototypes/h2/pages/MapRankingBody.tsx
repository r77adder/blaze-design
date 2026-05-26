import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Heading, Text } from '@/components';
import { StatusPill, useToast } from '@/staging';
import ArrowRightSm from '@/icons/16/ArrowRightSm';
import PhoneCall01 from '@/icons/16/PhoneCall01';
import EyeOpen from '@/icons/20/EyeOpen';
import Globe from '@/icons/20/Globe';
import Map02 from '@/icons/20/Map02';
import Marker03 from '@/icons/20/Marker03';
import Send1 from '@/icons/20/Send1';
import Share from '@/icons/20/Share';
import Star from '@/icons/20/Star';
import { useDevState } from '../dev-state-context';
import { FeedItem } from '../FeedItem';
import type { FeedItem as FeedItemData } from '../feed-data';

/**
 * Map Ranking experience body — extracted from the deleted `/h2/map-ranking`
 * route so it can be rendered inside the AEO page as a sub-tab. Does NOT
 * wrap in <H2Layout> — the host (AEO) owns the chrome.
 *
 * Two views gated on a localStorage flag:
 *   1. audit — single consolidated "Review your Google Business Profile"
 *              screen with 10 field cards (left) + Google preview (right).
 *              One click on "Looks good — continue" jumps to home.
 *   2. home  — steady state: metric cards, dismissable action card,
 *              competitor ladder, recent activity, profile strength.
 *
 * The host passes its own `pathname` so the dev-state context can key the
 * cold/steady toggle to the parent page (e.g. `/h2/seo-aeo`).
 *
 * On mount: if localStorage[STORAGE_KEY] is set, jumps straight to 'home'.
 * Otherwise renders 'audit'. Designers can replay the setup via the
 * `?reset=1` query param OR the "Reset setup" pill in the bottom-right.
 */

const STORAGE_KEY = 'h2-map-ranking:setup-complete';

type View = 'audit' | 'home';

// ─── DATA ─────────────────────────────────────────────────────────────

type FieldStatus = 'ok' | 'adjusted';
type FieldEditor = 'single' | 'multi' | 'hours' | 'none';

interface ProfileField {
  label: string;
  status: FieldStatus;
  /** Plain-text value used both for display and as the seed for the inline editor. */
  value: string;
  /** Which inline editor to render in edit mode. */
  editor: FieldEditor;
}

const SERVICES_DEFAULT =
  'Interior painting, Exterior painting, Cabinet refinishing, Color consultation, Deck & fence staining, Drywall repair, Power washing, Stucco repair, Wood rot repair';

const HOURS_DEFAULT =
  'Mon: 8 AM – 6 PM\nTue: 8 AM – 6 PM\nWed: 8 AM – 6 PM\nThu: 8 AM – 6 PM\nFri: 8 AM – 6 PM\nSat: 9 AM – 2 PM\nSun: Closed';

const PROFILE_FIELDS: ProfileField[] = [
  {
    label: 'Business name',
    status: 'ok',
    value: 'CertaPro Painters of Austin',
    editor: 'single',
  },
  {
    label: 'Description',
    status: 'adjusted',
    value:
      'Your local painters in Austin, TX. CertaPro Painters of Austin handles residential and commercial painting across the Austin metro — interior and exterior, cabinet refinishing, color consultation, and more. We make the process easy and convenient. Call (512) 323-9502 for a free estimate.',
    editor: 'multi',
  },
  {
    label: 'Primary category',
    status: 'adjusted',
    value: 'Painting contractor',
    editor: 'single',
  },
  {
    label: 'Additional categories',
    status: 'adjusted',
    value:
      'Painter, Commercial painter, House painter, Cabinet maker, Drywall contractor, Deck builder, Power washing service, Stucco contractor, Color consultant',
    editor: 'multi',
  },
  {
    label: 'Services',
    status: 'adjusted',
    value: SERVICES_DEFAULT,
    editor: 'multi',
  },
  {
    label: 'Hours',
    status: 'ok',
    value: HOURS_DEFAULT,
    editor: 'hours',
  },
  {
    label: 'Service areas',
    status: 'ok',
    value: 'Austin, Cedar Park, Round Rock, Lakeway, Westlake, Bee Cave, Pflugerville, Leander, Dripping Springs',
    editor: 'single',
  },
  {
    label: 'Phone',
    status: 'ok',
    value: '(512) 323-9502',
    editor: 'single',
  },
  {
    label: 'Website',
    status: 'ok',
    value: 'https://certapro.com/austin/',
    editor: 'single',
  },
  {
    label: 'Address',
    status: 'ok',
    value: '12444 Research Blvd, Austin, TX 78759',
    editor: 'single',
  },
];

const PREVIEW_HOURS: { day: string; hours: string }[] = [
  { day: 'Mon', hours: '8 AM – 6 PM' },
  { day: 'Tue', hours: '8 AM – 6 PM' },
  { day: 'Wed', hours: '8 AM – 6 PM' },
  { day: 'Thu', hours: '8 AM – 6 PM' },
  { day: 'Fri', hours: '8 AM – 6 PM' },
  { day: 'Sat', hours: '9 AM – 2 PM' },
  { day: 'Sun', hours: 'Closed' },
];

const COMPETITORS = [
  { rank: 1, name: 'Five Star Painting of South Austin', reviews: 144, recent: '+4 this month', you: false },
  { rank: 2, name: 'CertaPro Painters of Austin (you)', reviews: 187, recent: '+6 this month', you: true },
  { rank: 3, name: 'Paper Moon Painting', reviews: 99, recent: '+2 this month', you: false },
  { rank: 4, name: 'WOW 1 Day Painting Austin', reviews: 68, recent: '+1 this month', you: false },
];

// Map Pack activity uses the same shape as the Home screen feed
// (`FeedItem` component + FeedItemData type) so the two surfaces read as
// one product, just scoped. Source is either 'map' (Google Business
// Profile edits, posts published, profile completeness) or 'reputation'
// (review activity).
const MAP_PACK_ACTIVITY: FeedItemData[] = [
  {
    id: 'mp-action-photos',
    source: 'map',
    sourceLabel: 'Google Profile',
    href: '#',
    kind: 'action',
    title: 'Add 5+ recent project photos',
    body: 'Biggest single boost · +12% to profile completeness. Tarrytown cabinet refinish, Lakeway exterior, and Round Rock HOA are ready to upload from your Brand Kit Media Library.',
    time: '12m ago',
    primary: 'Open uploader',
    secondary: null,
    thumbnails: [
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/cabinet-staining.jpg',
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2026/02/After-Pic.png',
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2024/12/After-3-scaled.jpeg',
    ],
  },
  {
    id: 'mp-action-qa',
    source: 'map',
    sourceLabel: 'Google Profile',
    href: '#',
    kind: 'action',
    title: 'Answer 3 homeowner questions',
    body: 'Drafts ready · 1-min review. Two on cabinet refinishing turnaround, one on exterior warranty length.',
    time: '38m ago',
    primary: 'Review Q&A',
    secondary: null,
  },
  {
    id: 'mp-action-reviews',
    source: 'reputation',
    sourceLabel: 'Reputation',
    href: '#',
    kind: 'action',
    title: 'Reply to 3 new reviews from Maria H. and 2 others',
    body: 'The agent drafted replies in your tone — calm, on-brand, and offering a same-week touch-up where Maria flagged a baseboard drip. Approve to publish or tap to edit.',
    time: '1h ago',
    primary: 'Review & reply',
    secondary: null,
    thumbnails: [
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2026/04/AfterIMG_0384-scaled.jpeg',
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2026/04/IMG_9426-scaled.jpeg',
    ],
  },
  {
    id: 'mp-action-hours',
    source: 'map',
    sourceLabel: 'Google Profile',
    href: '#',
    kind: 'action',
    title: 'Add holiday hours for Memorial Day',
    body: 'Coming up in 4 weeks · homeowners booking exterior jobs are already searching this weekend. Confirm Sat 9–2 closure or set a custom Memorial Day window.',
    time: '4h ago',
    primary: 'Add hours',
    secondary: null,
  },
  {
    id: 'mp-insight-review-daniel',
    source: 'reputation',
    sourceLabel: 'Reputation',
    href: '#',
    kind: 'insight',
    title: 'New 5-star review from Daniel K. — Cedar Park',
    body: '"Crew showed up on time and cleaned up perfectly. Highly recommend." Posted to your Google Business Profile 2h ago — auto-share to social is queued.',
    time: '2h ago',
    primary: null,
    secondary: null,
  },
  {
    id: 'mp-insight-post-cabinet',
    source: 'map',
    sourceLabel: 'Google Profile',
    href: '#',
    kind: 'insight',
    title: 'Post published to Google — Cabinet refinish reveal',
    body: 'Tarrytown kitchen before & after · 62 views in the first hour, 4 calls into the SDR line within 90 minutes of publish.',
    time: 'Yesterday',
    primary: null,
    secondary: null,
    thumbnails: [
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/cabinet-staining.jpg',
    ],
  },
  {
    id: 'mp-insight-reply-4star',
    source: 'reputation',
    sourceLabel: 'Reputation',
    href: '#',
    kind: 'insight',
    title: 'Replied to a 4-star review',
    body: 'Drafted by Blaze · Approved by John · Published. Auto-thank-you scheduled for the customer\'s next anniversary.',
    time: 'Yesterday',
    primary: null,
    secondary: null,
  },
  {
    id: 'mp-insight-hours-confirmed',
    source: 'map',
    sourceLabel: 'Google Profile',
    href: '#',
    kind: 'insight',
    title: 'Profile update: hours confirmed',
    body: 'Saturday hours updated to 9 AM – 2 PM across Google, Yelp, and the certapro.com/austin contact page.',
    time: 'Sat',
    primary: null,
    secondary: null,
  },
  {
    id: 'mp-insight-review-janelle',
    source: 'reputation',
    sourceLabel: 'Reputation',
    href: '#',
    kind: 'insight',
    title: 'New 5-star review from Janelle B. — Westlake',
    body: '"Painted our exterior in 4 days, on budget. John explained every step." Auto-reply queued; the agent referenced her color choice from the consultation file.',
    time: 'Apr 18',
    primary: null,
    secondary: null,
  },
  {
    id: 'mp-insight-post-hoa',
    source: 'map',
    sourceLabel: 'Google Profile',
    href: '#',
    kind: 'insight',
    title: 'Post published to Google — HOA project',
    body: '14 buildings over 6 weeks in Round Rock · 38 views, 1 inbound HOA inquiry within 24 hours.',
    time: 'Apr 16',
    primary: null,
    secondary: null,
    thumbnails: [
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2024/12/After-3-scaled.jpeg',
    ],
  },
];

// Mini ring used in the home "Profile strength" card (no animation).
function MiniRing({ score, size = 72, stroke = 6 }: { score: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const ringColor =
    score < 50 ? '#EF6800' : score < 80 ? 'var(--dark-90)' : 'var(--status-approved)';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--dark-6)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 500,
          color: 'var(--dark-90)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {score}
      </div>
    </div>
  );
}

// ─── CONFIRM (cold-start consolidated screen) ─────────────────────────

type CadenceId = 'twice-week' | 'once-week' | 'twice-month';

interface CadenceOption {
  id: CadenceId;
  label: string;
  subtitle: string;
  footer: string;
  recommended?: boolean;
}

const CADENCE_OPTIONS: CadenceOption[] = [
  {
    id: 'twice-week',
    label: 'Twice a week',
    subtitle: 'Most active. Best for fast growth.',
    footer: '8 posts/mo',
  },
  {
    id: 'once-week',
    label: 'Once a week',
    subtitle: 'Keeps you fresh without overdoing it.',
    footer: '4 posts/mo',
    recommended: true,
  },
  {
    id: 'twice-month',
    label: 'Twice a month',
    subtitle: 'Light touch. Stay present without much effort.',
    footer: '2 posts/mo',
  },
];

interface ProposedPost {
  eyebrow: string;
  date: string;
  channel: string;
  title: string;
  excerpt: string;
  slot: number;
  /** Big headline that sits on top of the media block. Short, punchy. */
  mediaHeadline: string;
  /** One-line subhead under the headline. */
  mediaSubhead: string;
  /** Background gradient for the media block — picks the mood per post. */
  mediaGradient: string;
}

const PROPOSED_POSTS: ProposedPost[] = [
  {
    eyebrow: 'Color-trends',
    date: 'Wed, May 27',
    channel: 'Google Post',
    title: 'Exterior colors for Texas heat',
    excerpt:
      "Austin summers are brutal on exterior paint. Here are the four colors our crews are pulling most often this year — they reflect heat, hide dust, and hold up to UV.",
    slot: 1,
    mediaHeadline: 'Built for\nTexas heat.',
    mediaSubhead: 'Our 2026 exterior palette.',
    mediaGradient:
      'linear-gradient(160deg, #f6efe1 0%, #d9b98a 50%, #a6754a 100%)',
  },
  {
    eyebrow: 'Cabinet-refresh',
    date: 'Wed, Jun 3',
    channel: 'Google Post',
    title: 'Cabinet refinish — Tarrytown kitchen',
    excerpt:
      "A Tarrytown homeowner saved roughly 70% versus full replacement by refinishing instead of replacing. Here's the before, the prep, and the final result.",
    slot: 2,
    mediaHeadline: 'Cabinets that\nlook factory-fresh.',
    mediaSubhead: 'Refinish, don\'t replace.',
    mediaGradient:
      'linear-gradient(160deg, #f5f3ec 0%, #c8ddc8 50%, #6f8a76 100%)',
  },
  {
    eyebrow: 'Hoa-project',
    date: 'Wed, Jun 10',
    channel: 'Google Post',
    title: 'HOA repaint — 14 buildings in Round Rock',
    excerpt:
      'Our commercial crew repainted 14 buildings over six weeks for a Round Rock HOA — coordinated access, kept residents in the loop, and finished on schedule.',
    slot: 3,
    mediaHeadline: '14 buildings.\n6 weeks.',
    mediaSubhead: 'On schedule, on budget.',
    mediaGradient:
      'linear-gradient(160deg, #c9633a 0%, #a14a26 50%, #d6a86b 100%)',
  },
  {
    eyebrow: 'Crew-spotlight',
    date: 'Wed, Jun 17',
    channel: 'Google Post',
    title: 'Meet Matthew — prep + paint quality',
    excerpt:
      'Matthew Tims, our VP of Residential Services, walks through the prep steps that make a paint job last — and why we never skip them, even on tight timelines.',
    slot: 4,
    mediaHeadline: 'Prep is\neverything.',
    mediaSubhead: 'Why our paint lasts longer.',
    mediaGradient:
      'linear-gradient(160deg, #1d2c44 0%, #2f4769 50%, #ead8ba 100%)',
  },
];

function ConfirmStep({ onConfirm }: { onConfirm: () => void }) {
  // Lifted: per-field edited values. Each card reads/writes its own slot,
  // initialized lazily from the canonical PROFILE_FIELDS seeds.
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(PROFILE_FIELDS.map((f) => [f.label, f.value])),
  );
  const updateField = (label: string, next: string) =>
    setFieldValues((prev) => ({ ...prev, [label]: next }));

  const [cadence, setCadence] = useState<CadenceId>('once-week');

  return (
    <>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '32px 28px 120px',
        }}
      >
        {/* section: header */}
        <div style={{ marginBottom: 28, maxWidth: 720 }}>
          <Heading level={1} style={{ marginBottom: 8 }}>
            Review your Google Business Profile.
          </Heading>
          <Text variant="secondary">
            Here&apos;s what we have for each field. Edit anything before continuing — nothing publishes yet.
          </Text>
        </div>

        {/* section: two-column grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 380px)',
            gap: 28,
            alignItems: 'start',
          }}
        >
          {/* LEFT — field cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
            {PROFILE_FIELDS.map((f) => (
              <ProfileFieldCard
                key={f.label}
                field={f}
                value={fieldValues[f.label]}
                onSave={(next) => updateField(f.label, next)}
              />
            ))}
          </div>

          {/* RIGHT — sticky Google preview */}
          <div style={{ position: 'sticky', top: 24, minWidth: 0 }}>
            <GooglePreview />
          </div>
        </div>

        {/* section: posting plan */}
        <PostingPlanSection cadence={cadence} onCadenceChange={setCadence} />
      </div>

      {/* sticky primary CTA */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 238,
          right: 0,
          background: 'var(--light-100)',
          borderTop: '1px solid var(--dark-8)',
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 12,
          zIndex: 10,
        }}
      >
        <Button variant="primary" size="lg" endIcon={ArrowRightSm} onPress={onConfirm}>
          Looks good — continue
        </Button>
      </div>
    </>
  );
}

function ProfileFieldCard({
  field,
  value,
  onSave,
}: {
  field: ProfileField;
  value: string;
  onSave: (next: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const startEdit = () => {
    setDraft(value);
    setIsEditing(true);
  };
  const cancel = () => {
    setDraft(value);
    setIsRegenerating(false);
    setIsEditing(false);
  };
  const save = () => {
    onSave(draft);
    setIsRegenerating(false);
    setIsEditing(false);
  };
  const regenerate = () => {
    // Visual-only — show a brief "Regenerating…" state then close. No real LLM call.
    setIsRegenerating(true);
    window.setTimeout(() => {
      setIsRegenerating(false);
      setIsEditing(false);
    }, 600);
  };

  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        padding: '14px 16px',
      }}
    >
      {/* header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--dark-90)',
              letterSpacing: '0.05px',
            }}
          >
            {field.label}
          </span>
          {field.status === 'ok' ? (
            <StatusPill tone="success" size="sm">Looks good</StatusPill>
          ) : (
            <StatusPill tone="accent" size="sm">Adjusted by Blaze</StatusPill>
          )}
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={startEdit}
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--dark-60)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            Edit
          </button>
        )}
      </div>

      {/* body — display OR inline editor */}
      {isEditing ? (
        <InlineEditor
          editor={field.editor}
          value={draft}
          onChange={setDraft}
          onSave={save}
          onCancel={cancel}
          onRegenerate={regenerate}
          isRegenerating={isRegenerating}
        />
      ) : (
        <FieldDisplay editor={field.editor} value={value} />
      )}
    </div>
  );
}

/** Read-only renderer for a field's value. Hours gets a stacked layout;
 *  everything else renders as plain text. */
function FieldDisplay({ editor, value }: { editor: FieldEditor; value: string }) {
  if (editor === 'hours') {
    const lines = value.split('\n').filter(Boolean);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 14, color: 'var(--dark-80)', lineHeight: 1.5 }}>
        {lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>
    );
  }
  return (
    <div style={{ fontSize: 14, color: 'var(--dark-80)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
      {value}
    </div>
  );
}

/** Inline editor with Save / Regenerate / Cancel. Hours uses a plain textarea
 *  with one line per day — same control as `multi`, just larger. */
function InlineEditor({
  editor,
  value,
  onChange,
  onSave,
  onCancel,
  onRegenerate,
  isRegenerating,
}: {
  editor: FieldEditor;
  value: string;
  onChange: (next: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}) {
  const inputBaseStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    fontFamily: 'inherit',
    background: 'var(--light-100)',
    border: '1px solid var(--dark-15)',
    borderRadius: 10,
    color: 'var(--dark-90)',
    outline: 'none',
    boxSizing: 'border-box',
    lineHeight: 1.5,
    resize: 'vertical',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {editor === 'single' ? (
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputBaseStyle}
        />
      ) : (
        <textarea
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={editor === 'hours' ? 6 : 3}
          style={inputBaseStyle}
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button variant="tertiary" size="sm" onPress={onCancel}>
          Cancel
        </Button>
        <Button variant="secondary" size="sm" onPress={onRegenerate}>
          {isRegenerating ? 'Regenerating…' : 'Regenerate'}
        </Button>
        <Button variant="primary" size="sm" onPress={onSave}>
          Save
        </Button>
      </div>
    </div>
  );
}

// ─── POSTING PLAN ─────────────────────────────────────────────────────

function PostingPlanSection({
  cadence,
  onCadenceChange,
}: {
  cadence: CadenceId;
  onCadenceChange: (id: CadenceId) => void;
}) {
  return (
    <div style={{ marginTop: 40 }}>
      <Heading level={3} style={{ marginBottom: 16 }}>
        Posting plan
      </Heading>

      {/* Cadence */}
      <div style={{ marginBottom: 32 }}>
        <Text
          variant="smallList"
          style={{ display: 'block', color: 'var(--dark-90)', fontWeight: 500, marginBottom: 12 }}
        >
          Posting cadence
        </Text>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {CADENCE_OPTIONS.map((opt) => {
            const selected = cadence === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onCadenceChange(opt.id)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 6,
                  padding: 16,
                  background: 'var(--light-100)',
                  border: `1.5px solid ${selected ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                  borderRadius: 10,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'border-color 120ms ease',
                  fontFamily: 'inherit',
                }}
              >
                {opt.recommended && (
                  <span style={{ position: 'absolute', top: 12, right: 12 }}>
                    <StatusPill tone="success" size="sm">Recommended</StatusPill>
                  </span>
                )}
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: 'var(--dark-90)',
                    letterSpacing: '0.05px',
                  }}
                >
                  {opt.label}
                </span>
                <span style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.45 }}>
                  {opt.subtitle}
                </span>
                <span
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: 'var(--dark-60)',
                    background: 'var(--dark-4)',
                    padding: '4px 8px',
                    borderRadius: 6,
                  }}
                >
                  {opt.footer}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* First 4 posts */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <Text
            variant="smallList"
            style={{ color: 'var(--dark-90)', fontWeight: 500 }}
          >
            Your first 4 posts
          </Text>
          <Button variant="tertiary" size="sm">
            Regenerate
          </Button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 12,
          }}
        >
          {PROPOSED_POSTS.map((p) => (
            <PostCard key={p.slot} post={p} />
          ))}
        </div>

        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--dark-60)' }}>
          Drafted by Blaze · May 21, 2:34 PM
        </div>
      </div>
    </div>
  );
}

function PostCard({ post }: { post: ProposedPost }) {
  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* account header — avatar + business name + scheduled date */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px 6px',
        }}
      >
        <Avatar />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, lineHeight: 1.25 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--dark-90)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            CertaPro Austin
          </span>
          <span style={{ fontSize: 11, color: 'var(--dark-60)' }}>
            Scheduled · {post.date}
          </span>
        </div>
      </div>

      {/* caption — sits above the media, like a real post. Clamped to 2 lines
          with ellipsis so narrow 4-up cards stay tidy. The outer wrapper
          enforces an exact max-height equal to 2× line-box (2.9em) so the
          3rd line can never peek through under the media block — the
          line-clamp alone leaves a sliver on some browsers / zoom levels. */}
      <div style={{ padding: '0 12px 10px' }}>
        <div
          style={{
            fontSize: 12,
            color: 'var(--dark-90)',
            lineHeight: 1.45,
            maxHeight: '2.9em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {post.excerpt}
        </div>
      </div>

      {/* media block — full-bleed with overlaid headline + subhead */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '4 / 5',
          background: post.mediaGradient,
          color: 'var(--light-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '14px 16px',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* soft inner vignette so the type always has enough contrast */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(0,0,0,0.35) 100%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span
            style={{
              fontFamily: '"Times New Roman", Georgia, serif',
              fontSize: 18,
              fontWeight: 500,
              lineHeight: 1.15,
              letterSpacing: '-0.3px',
              whiteSpace: 'pre-line',
              textShadow: '0 1px 8px rgba(0,0,0,0.25)',
            }}
          >
            {post.mediaHeadline}
          </span>
          <span
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.85)',
              letterSpacing: '0.05px',
            }}
          >
            {post.mediaSubhead}
          </span>
        </div>
      </div>

      {/* CTA strip — "Learn more" + edit affordance, like the real GBP post footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderTop: '1px solid var(--dark-4)',
        }}
      >
        <button
          type="button"
          style={{
            border: 'none',
            background: 'transparent',
            padding: 0,
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: 500,
            color: '#2871d6',
            cursor: 'pointer',
          }}
        >
          Learn more →
        </button>
        <button
          type="button"
          style={{
            border: 'none',
            background: 'transparent',
            padding: 0,
            fontFamily: 'inherit',
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--dark-60)',
            cursor: 'pointer',
          }}
        >
          Edit
        </button>
      </div>
    </div>
  );
}

function Avatar() {
  // Brand-yellow disk + dark monogram, sits to the left of the business name
  // in each post card header. Matches the reference screenshot's circular
  // social-style avatar.
  return (
    <span
      aria-hidden
      style={{
        width: 26,
        height: 26,
        borderRadius: '50%',
        background: 'var(--brand)',
        color: 'var(--dark-90)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Times New Roman", Georgia, serif',
        fontSize: 14,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      C
    </span>
  );
}

function GooglePreview() {
  const chips: { icon: Icon; label: string }[] = [
    { icon: Globe, label: 'Website' },
    { icon: Map02, label: 'Directions' },
    { icon: PhoneCall01, label: 'Call' },
    { icon: Share, label: 'Share' },
  ];
  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 14,
        padding: '20px 20px 24px',
      }}
    >
      {/* eyebrow row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#fff',
            border: '1px solid var(--dark-8)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--dark-80)',
            letterSpacing: '-0.2px',
          }}
        >
          G
        </span>
        <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>
          Preview · how this looks on Google
        </span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--dark-40)', marginBottom: 10 }}>
        Map Pack · Austin, 78759
      </div>

      {/* title */}
      <div
        style={{
          fontSize: 18,
          fontWeight: 500,
          color: 'var(--dark-90)',
          letterSpacing: '-0.1px',
          lineHeight: 1.3,
          marginBottom: 8,
        }}
      >
        CertaPro Painters of Austin
      </div>

      {/* rating row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          color: 'var(--dark-80)',
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ display: 'inline-flex', gap: 1, color: '#F5B400' }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={14} />
          ))}
        </span>
        <span style={{ fontWeight: 500, color: 'var(--dark-90)' }}>4.7</span>
        <span style={{ color: 'var(--dark-60)' }}>(187)</span>
        <span style={{ color: 'var(--dark-40)' }}>·</span>
        <span style={{ color: 'var(--dark-60)' }}>Painting contractor</span>
      </div>

      {/* action chips */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
          marginBottom: 20,
        }}
      >
        {chips.map((c) => {
          const Ic = c.icon;
          return (
            <div
              key={c.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'var(--dark-4)',
                  color: 'var(--dark-90)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ic size={16} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--dark-80)' }}>{c.label}</span>
            </div>
          );
        })}
      </div>

      {/* description */}
      <div
        style={{
          fontSize: 13,
          color: 'var(--dark-80)',
          lineHeight: 1.55,
          paddingBottom: 16,
          marginBottom: 16,
          borderBottom: '1px solid var(--dark-4)',
        }}
      >
        Your local painters in Austin, TX. CertaPro Painters of Austin handles residential and commercial
        painting across the Austin metro — interior and exterior, cabinet refinishing, color consultation,
        and more. We make the process easy and convenient. Call (512) 323-9502 for a free estimate.
      </div>

      {/* hours */}
      <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--dark-4)' }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--dark-90)',
            marginBottom: 6,
          }}
        >
          Hours
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {PREVIEW_HOURS.map((h) => (
            <div
              key={h.day}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                color: 'var(--dark-80)',
              }}
            >
              <span style={{ color: 'var(--dark-60)' }}>{h.day}</span>
              <span>{h.hours}</span>
            </div>
          ))}
        </div>
      </div>

      {/* service area */}
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--dark-90)',
            marginBottom: 6,
          }}
        >
          Service area
        </div>
        <div style={{ fontSize: 13, color: 'var(--dark-80)' }}>Austin metro · 50+ ZIP codes</div>
      </div>
    </div>
  );
}

// ─── HOME (steady state) ──────────────────────────────────────────────

function HomeView({ onReset }: { onReset: () => void }) {
  const { showToast } = useToast();
  return (
    <div style={{ padding: '24px 28px 40px', maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
      {/* Inline "View on Google" action — preserved from the standalone page's
       *  topbar action, now lives in the body since AEO owns the topbar. */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Button
          variant="secondary"
          size="sm"
          onPress={() => showToast({ message: 'Open Google Business Profile' })}
        >
          View on Google
        </Button>
      </div>

      {/* Metric strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
        <MetricCard
          icon={Marker03}
          label="Map Pack rank"
          value="#2"
          delta="↑ 2"
          deltaKind="up"
          foot={'"painters austin" · last month'}
        />
        <MetricCard
          icon={EyeOpen}
          label="Profile views"
          value="1,284"
          delta="+12.3%"
          deltaKind="up"
          foot="vs last month"
        />
        <MetricCard
          icon={Star}
          label="New reviews"
          value="6"
          unit="★ 4.7"
          foot="2 responded today"
        />
        <MetricCard
          icon={Send1}
          label="Posts published"
          value="4"
          delta="On schedule"
          deltaKind="flat"
          foot="Next: Friday at 10 AM"
        />
      </div>

      {/* Nudge + competitor ladder */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: 28,
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 14,
          padding: '24px 24px',
          marginBottom: 32,
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: 'var(--status-approved)',
              fontWeight: 500,
              marginBottom: 8,
            }}
          >
            <span
              style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-approved)' }}
            />
            <span>You&apos;re climbing</span>
          </div>
          <h2
            style={{
              fontSize: 19,
              fontWeight: 500,
              color: 'var(--dark-90)',
              letterSpacing: '-0.05px',
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            Up 2 spots this week — let&apos;s keep the momentum going.
          </h2>
          <p style={{ fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.55, marginBottom: 16, maxWidth: 480 }}>
            You moved from #4 → #2 for &quot;painters austin.&quot; Five Star Painting is still adding reviews
            fast. One more push and you could take #1 by month-end.
          </p>
          {/* Inline profile-strength stat — folded in from the standalone
              "Profile strength" card to keep the nudge as the single canonical
              "what to do next" surface. The 2 improvement actions that used to
              live here moved into the Recent activity feed. */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px 10px 10px',
              background: 'var(--dark-2)',
              border: '1px solid var(--dark-4)',
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <MiniRing score={78} size={44} stroke={4} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)' }}>
                Profile 78% complete
              </span>
              <span style={{ fontSize: 12, color: 'var(--dark-60)', lineHeight: 1.4 }}>
                Almost fully optimized — 2 quick fixes left in your activity feed.
              </span>
            </div>
          </div>
        </div>
        <div
          style={{
            background: 'var(--dark-2)',
            border: '1px solid var(--dark-4)',
            borderRadius: 10,
            padding: '12px 4px',
            alignSelf: 'start',
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: 'var(--dark-40)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 500,
              padding: '0 12px 8px',
              marginBottom: 4,
              borderBottom: '1px solid var(--dark-4)',
            }}
          >
            &quot;Painters austin&quot; — top 5
          </div>
          {COMPETITORS.map((c) => (
            <div
              key={c.rank}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr auto',
                gap: 8,
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 8,
                background: c.you ? 'var(--light-100)' : undefined,
                boxShadow: c.you ? '0 0 0 1px var(--dark-8)' : undefined,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: c.you ? 'var(--dark-90)' : 'var(--dark-40)',
                  fontWeight: 500,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                #{c.rank}
              </div>
              <div>
                <div style={{ fontSize: 14, color: 'var(--dark-90)', fontWeight: c.you ? 500 : 400 }}>
                  {c.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--dark-60)' }}>{c.recent}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--dark-60)' }}>★ {c.reviews}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Posts up for review — Google Business Profile post drafts the agent
          has queued. Same PostCard component used in the cold-state Confirm
          screen, just scoped under a "up for review" header here. Surfaced
          above the activity feed because approving drafts is the next action
          most operators take after scanning the metrics + nudge. */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <h3
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--dark-90)',
              margin: 0,
              letterSpacing: '0.05px',
            }}
          >
            Posts up for review
          </h3>
          <Button
            variant="tertiary"
            size="sm"
            onPress={() => showToast({ message: 'All 4 drafts approved and scheduled' })}
          >
            Approve all
          </Button>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 12,
          }}
        >
          {PROPOSED_POSTS.map((p) => (
            <PostCard key={p.slot} post={p} />
          ))}
        </div>
      </div>

      {/* Recent activity — same FeedItem card shape as the Home screen feed,
          scoped to Map Pack / Google Business Profile / reputation. The two
          surfaces read as one product just filtered to this tab. */}
      <div>
        <h3
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--dark-90)',
            margin: '0 0 12px',
            letterSpacing: '0.05px',
          }}
        >
          Recent activity
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MAP_PACK_ACTIVITY.map((item) => (
            <FeedItem
              key={item.id}
              item={item}
              onAction={(label) => showToast({ message: `${label} — opened` })}
            />
          ))}
        </div>
      </div>

      {/* Reset affordance — fixed bottom-right so designers can replay setup. */}
      <button
        type="button"
        onClick={onReset}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          padding: '8px 12px',
          background: 'var(--light-100)',
          border: '1px solid var(--dark-15)',
          borderRadius: 999,
          fontFamily: 'inherit',
          fontSize: 12,
          color: 'var(--dark-60)',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          zIndex: 50,
        }}
      >
        Reset setup
      </button>
    </div>
  );
}

// ─── METRIC CARD ──────────────────────────────────────────────────────

interface MetricCardProps {
  icon: Icon;
  label: string;
  value: string;
  delta?: string;
  deltaKind?: 'up' | 'down' | 'flat';
  unit?: string;
  foot: string;
}

function MetricCard({ icon: Ic, label, value, delta, deltaKind, unit, foot }: MetricCardProps) {
  const deltaStyle: Record<NonNullable<MetricCardProps['deltaKind']>, { bg: string; color: string }> = {
    up: { bg: 'var(--green-10)', color: 'var(--status-approved)' },
    down: { bg: 'var(--red-10)', color: 'var(--red-70)' },
    flat: { bg: 'var(--dark-4)', color: 'var(--dark-60)' },
  };
  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        padding: '16px 16px',
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: 'var(--dark-60)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          marginBottom: 8,
          letterSpacing: '0.02em',
        }}
      >
        <Ic size={12} />
        {label}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 500,
          color: 'var(--dark-90)',
          letterSpacing: '-0.4px',
          fontVariantNumeric: 'tabular-nums',
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
        }}
      >
        {value}
        {delta && deltaKind && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 5,
              lineHeight: 1,
              background: deltaStyle[deltaKind].bg,
              color: deltaStyle[deltaKind].color,
            }}
          >
            {delta}
          </span>
        )}
        {unit && <span style={{ fontSize: 12, color: 'var(--dark-60)', fontWeight: 400 }}>{unit}</span>}
      </div>
      <div style={{ fontSize: 12, color: 'var(--dark-40)', marginTop: 4 }}>{foot}</div>
    </div>
  );
}

// ─── BODY ─────────────────────────────────────────────────────────────

export interface MapRankingBodyProps {
  /** Pathname used as the dev-state key. The Map Ranking experience reads
   *  cold/steady from this key so the dev panel toggle on the host page
   *  controls the audit-vs-home jump. */
  devStatePath: string;
}

export function MapRankingBody({ devStatePath }: MapRankingBodyProps) {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, setState: setDevState } = useDevState();
  const devState = getState(devStatePath);

  // Initial view derives from localStorage on first render. The `?reset=1`
  // query param wipes that flag and forces 'audit'.
  const [view, setView] = useState<View>(() => {
    if (typeof window === 'undefined') return 'audit';
    if (searchParams.get('reset') === '1') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore quota / private-mode errors */
      }
      return 'audit';
    }
    try {
      return window.localStorage.getItem(STORAGE_KEY) === '1' ? 'home' : 'audit';
    } catch {
      return 'audit';
    }
  });

  // Sync dev-state toggle → view. Cold lands on 'audit'; steady on 'home'.
  useEffect(() => {
    setView((prev) => {
      if (devState === 'cold') return 'audit';
      if (prev === 'audit') return 'home';
      return prev;
    });
  }, [devState]);

  // Strip `?reset=1` after consuming it so refresh doesn't re-reset on every load.
  useEffect(() => {
    if (searchParams.get('reset') === '1') {
      const next = new URLSearchParams(searchParams);
      next.delete('reset');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleConfirm = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setView('home');
    setDevState(devStatePath, 'steady');
  };

  const handleReset = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setView('audit');
    setDevState(devStatePath, 'cold');
    showToast({ message: 'Setup reset — starting from the audit' });
  };

  return (
    <>
      {view === 'audit' && <ConfirmStep onConfirm={handleConfirm} />}
      {view === 'home' && <HomeView onReset={handleReset} />}
    </>
  );
}
