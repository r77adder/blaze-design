import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Heading, IconButton, Text, useModals } from '@/components';
import { Chip, Select, StatusPill, useToast } from '@/staging';
import type { SelectOption } from '@/staging';
import ArrowRightSm from '@/icons/16/ArrowRightSm';
import AlertTriangle from '@/icons/20/AlertTriangle';
import ArrowRight from '@/icons/20/ArrowRight';
import ArrowRotateLeft2 from '@/icons/20/ArrowRotateLeft2';
import ArrowRotateRight from '@/icons/20/ArrowRotateRight';
import Check from '@/icons/16/Check';
import CheckboxLight from '@/icons/20/CheckboxLight';
import CheckboxChecked from '@/icons/20/CheckboxChecked';
import Plus from '@/icons/20/Plus';
import Trash2 from '@/icons/20/Trash2';
import PhoneCall01 from '@/icons/16/PhoneCall01';
import Camera from '@/icons/20/Camera';
import EyeOpen from '@/icons/20/EyeOpen';
import Globe from '@/icons/20/Globe';
import Search from '@/icons/20/Search';
import Heart01 from '@/icons/20/Heart01';
import Instagram from '@/icons/20/Instagram';
import Map02 from '@/icons/20/Map02';
import Marker03 from '@/icons/20/Marker03';
import Send1 from '@/icons/20/Send1';
import Share from '@/icons/20/Share';
import Star from '@/icons/20/Star';
import StarFilled from '@/icons/20/StarFilled';
import TikTok from '@/icons/20/TikTok';
import Twitter from '@/icons/20/Twitter';
import YouTube from '@/icons/20/YouTube';
import { useDevState } from '../dev-state-context';
import { ExpertUpsellBanner } from './ExpertUpsellBanner';
import { LocationPickerModal } from './LocationPickerModal';
import { LocationSwitcher } from './LocationSwitcher';
import { AUSTIN_LOCATIONS, fullAddress } from './locations';
import type { BusinessLocation } from './locations';

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
 * `?reset=1` query param OR the dev-state "Cold" toggle.
 */

const STORAGE_KEY = 'h2-map-ranking:setup-complete';

type View = 'connect' | 'auditing' | 'audit' | 'home';

// Profile-completeness arc: the live profile audits at AUDIT_START_SCORE
// (gaps found); once Blaze fills them it lands at AUDIT_FINAL_SCORE.
const AUDIT_START_SCORE = 58;
const AUDIT_FINAL_SCORE = 92;

// ─── DATA ─────────────────────────────────────────────────────────────

type FieldStatus = 'ok' | 'adjusted';
type FieldEditor = 'single' | 'multi' | 'hours' | 'none' | 'pills';

export interface ProfileField {
  label: string;
  status: FieldStatus;
  /** Plain-text value used both for display and as the seed for the inline editor. */
  value: string;
  /** Which inline editor to render in edit mode. */
  editor: FieldEditor;
  /** For the `pills` editor: comma-list items Blaze added, rendered with the
   *  accent (purple) treatment to match the "Adjusted by Blaze" status pill. */
  blazeAdded?: string[];
}

const SERVICES_DEFAULT =
  'Interior painting, Exterior painting, Cabinet refinishing, Color consultation, Deck & fence staining, Drywall repair, Power washing, Stucco repair, Wood rot repair';

const HOURS_DEFAULT =
  'Mon: 8 AM – 6 PM\nTue: 8 AM – 6 PM\nWed: 8 AM – 6 PM\nThu: 8 AM – 6 PM\nFri: 8 AM – 6 PM\nSat: 9 AM – 2 PM\nSun: Closed';

export const PROFILE_FIELDS: ProfileField[] = [
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
    editor: 'pills',
    blazeAdded: ['Cabinet maker', 'Deck builder', 'Color consultant'],
  },
  {
    label: 'Services',
    status: 'adjusted',
    value: SERVICES_DEFAULT,
    editor: 'pills',
    blazeAdded: ['Color consultation', 'Deck & fence staining', 'Wood rot repair'],
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

// Mini ring — profile completeness score indicator (no animation).
export function MiniRing({ score, size = 72, stroke = 6 }: { score: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const ringColor =
    score < 50 ? '#EF6800' : score < 80 ? 'var(--dark-90)' : 'var(--status-approved)';
  const labelSize = Math.max(10, Math.round(size * 0.25));
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--dark-4)" strokeWidth={stroke} />
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
          fontSize: labelSize,
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

// ─── LANDING (cold-start intro screen) ───────────────────────────────

function LandingView({ onConnect }: { onConnect: () => void }) {
  const { showToast } = useToast();
  return (
    <>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 28px 64px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            background: 'var(--dark-4)',
            border: '1px solid var(--dark-8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <Marker03 size={28} color="var(--dark-60)" />
        </div>
        <Heading level={1} style={{ marginBottom: 12 }}>
          Rank higher on Google Maps and Search
        </Heading>
        <Text
          variant="secondary"
          style={{ display: 'block', maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}
        >
          Map Pack runs against your live Google Business Profile listing. Connect one to see your audit, suggestions, and ranking.
        </Text>
        <div style={{ marginTop: 24 }}>
          <Button variant="primary" size="lg" endIcon={ArrowRightSm} onPress={onConnect}>
            Connect Google Business Profile
          </Button>
        </div>
      </div>

      {/* How we do it */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--dark-60)',
            textAlign: 'center',
            marginBottom: 16,
            letterSpacing: '0.02em',
          }}
        >
          How Blaze does it
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {(
            [
              {
                icon: Globe,
                title: 'Set up your business profile',
                desc: 'We review and optimize every field in your Google Business Profile so it ranks for the right searches.',
              },
              {
                icon: Send1,
                title: 'Post consistently on Google',
                desc: 'Blaze drafts and schedules Google Business Posts to keep your profile active and signal relevance.',
              },
              {
                icon: Star,
                title: 'Respond to every review',
                desc: 'Our AI drafts replies in your tone, then you approve with one click. Fast replies boost your ranking.',
              },
            ] as { icon: typeof Globe; title: string; desc: string }[]
          ).map(({ icon: Ic, title, desc }) => (
            <div
              key={title}
              style={{
                background: 'var(--light-100)',
                border: '1px solid var(--dark-8)',
                borderRadius: 12,
                padding: '20px 18px',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'var(--dark-4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <Ic size={18} color="var(--dark-60)" />
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--dark-90)',
                  marginBottom: 6,
                  lineHeight: 1.3,
                }}
              >
                {title}
              </div>
              <div style={{ fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Upsell — DFY */}
      <ExpertUpsellBanner onTalk={() => showToast({ message: 'Connecting you with a marketing expert…' })} />
      </div>
    </>
  );
}

// ─── CONFIRM (cold-start consolidated screen) ─────────────────────────

type PostStatus = 'needs-review' | 'scheduled' | 'published';

interface ProposedPost {
  eyebrow: string;
  date: string;
  channel: string;
  title: string;
  excerpt: string;
  slot: number;
  status: PostStatus;
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
    status: 'needs-review',
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
    status: 'needs-review',
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
    status: 'scheduled',
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
    status: 'scheduled',
    mediaHeadline: 'Prep is\neverything.',
    mediaSubhead: 'Why our paint lasts longer.',
    mediaGradient:
      'linear-gradient(160deg, #1d2c44 0%, #2f4769 50%, #ead8ba 100%)',
  },
];

// ─── AUDITING (loading state after connecting the profile) ───────────

function AuditingView({ onDone }: { onDone: () => void }) {
  // Every profile field, in the same order as the Review page. ok fields read
  // "Looks good" (green); adjusted fields read "Suggested" (purple) to match
  // the status pills on the Review page.
  const steps = PROFILE_FIELDS.map((f) => ({
    field: f.label,
    result: f.status === 'ok' ? 'Looks good' : 'Suggested',
    suggested: f.status !== 'ok',
  }));
  const [done, setDone] = useState(0);

  useEffect(() => {
    const stepMs = 650;
    const timers = steps.map((_, i) =>
      window.setTimeout(() => setDone(i + 1), 600 + i * stepMs),
    );
    const finish = window.setTimeout(onDone, 600 + steps.length * stepMs + 1300);
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(finish);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const score = Math.round(
    AUDIT_START_SCORE + (done / steps.length) * (AUDIT_FINAL_SCORE - AUDIT_START_SCORE),
  );

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '64px 28px' }}>
      <style>{`@keyframes audit-spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 28 }}>
        <div style={{ marginBottom: 20 }}>
          <MiniRing score={score} size={72} stroke={6} />
        </div>
        <Heading level={2} style={{ marginBottom: 8 }}>Auditing your Google Business Profile</Heading>
        <Text variant="secondary" style={{ color: 'var(--dark-60)', maxWidth: 420 }}>
          Blaze is reviewing your live profile and filling in what&apos;s missing.
        </Text>
      </div>

      <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden', background: 'var(--light-100)' }}>
        {steps.map((s, i) => {
          const isDone = i < done;
          const isActive = i === done;
          return (
            <div
              key={s.field}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderBottom: i < steps.length - 1 ? '1px solid var(--dark-4)' : 'none',
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  flexShrink: 0,
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: '1.5px',
                  borderStyle: 'solid',
                  borderColor: isDone ? 'var(--status-approved)' : isActive ? 'var(--brand)' : 'var(--dark-15)',
                  borderTopColor: isActive ? 'transparent' : isDone ? 'var(--status-approved)' : 'var(--dark-15)',
                  background: isDone ? 'var(--status-approved)' : 'transparent',
                  animation: isActive ? 'audit-spin 0.8s linear infinite' : 'none',
                }}
              >
                {isDone && <Check size={11} color="var(--light-100)" />}
              </span>
              <Text variant="secondary" style={{ flex: 1, fontWeight: 500, color: isDone || isActive ? 'var(--dark-90)' : 'var(--dark-60)' }}>
                {s.field}
              </Text>
              <Text variant="metadata" style={{ color: isDone ? (s.suggested ? 'var(--purple)' : 'var(--status-approved)') : 'var(--dark-60)' }}>
                {isDone ? s.result : isActive ? 'Checking…' : ''}
              </Text>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConfirmStep({ onConfirm }: { onConfirm: () => void }) {
  // Lifted: per-field edited values. Each card reads/writes its own slot,
  // initialized lazily from the canonical PROFILE_FIELDS seeds.
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(PROFILE_FIELDS.map((f) => [f.label, f.value])),
  );
  // Which connected location is being reviewed. Switching swaps the Google
  // preview; the field cards below are the inline editing surface for it.
  const [locationId, setLocationId] = useState(AUSTIN_LOCATIONS[0].id);
  const location = AUSTIN_LOCATIONS.find((l) => l.id === locationId) ?? AUSTIN_LOCATIONS[0];
  const updateField = (label: string, next: string) =>
    setFieldValues((prev) => ({ ...prev, [label]: next }));

  const handleFieldSave = (label: string, next: string) => {
    updateField(label, next);
  };

  return (
    <>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '32px 28px 120px',
        }}
      >
        {/* section: header with completeness score */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 28, maxWidth: 760 }}>
          <MiniRing score={AUDIT_FINAL_SCORE} size={80} stroke={7} />
          <div>
            <Heading level={1} style={{ marginBottom: 6 }}>
              Review your Google Business Profile.
            </Heading>
            <Text variant="secondary">
              Blaze filled in the fields that were missing — your profile is now {AUDIT_FINAL_SCORE}% complete. Review and edit anything before continuing; nothing publishes yet.
            </Text>
            <div style={{ marginTop: 14 }}>
              <LocationSwitcher value={locationId} onChange={setLocationId} onEdit={() => {}} />
            </div>
          </div>
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
                onSave={(next) => handleFieldSave(f.label, next)}
              />
            ))}
          </div>

          {/* RIGHT — sticky Google preview */}
          <div style={{ position: 'sticky', top: 24, minWidth: 0, maxHeight: 'calc(100vh - 48px)', overflowY: 'auto' }}>
            <GooglePreview location={location} />
          </div>
        </div>

        {/* section: first posts */}
        <PostingPlanSection />
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

export function ProfileFieldCard({
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
            <StatusPill tone="accent" size="sm">Suggested</StatusPill>
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
        field.editor === 'pills' ? (
          <PillEditor
            value={draft}
            onChange={setDraft}
            onSave={save}
            onCancel={cancel}
            blazeAdded={field.blazeAdded ?? []}
          />
        ) : field.editor === 'hours' ? (
          <HoursEditor
            value={draft}
            onChange={setDraft}
            onSave={save}
            onCancel={cancel}
          />
        ) : (
          <InlineEditor
            editor={field.editor}
            value={draft}
            onChange={setDraft}
            onSave={save}
            onCancel={cancel}
            onRegenerate={regenerate}
            isRegenerating={isRegenerating}
          />
        )
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
    const rows = value
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const idx = line.indexOf(':');
        return {
          day: idx >= 0 ? line.slice(0, idx).trim() : line.trim(),
          hours: idx >= 0 ? line.slice(idx + 1).trim() : '',
        };
      });
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 14, lineHeight: 1.5 }}>
        {rows.map(({ day, hours }) => (
          <div key={day} style={{ display: 'flex', gap: 12 }}>
            <span style={{ width: 44, flexShrink: 0, color: 'var(--dark-90)' }}>{day}</span>
            <span style={{ color: 'var(--dark-80)' }}>{hours}</span>
          </div>
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

/** Comma-list edit control — each item is a removable pill; Blaze-suggested
 *  items get the accent (purple) treatment. "+ Add" appends new ones;
 *  "Remove suggestions" strips all the Blaze-suggested pills. */
function PillEditor({
  value,
  onChange,
  onSave,
  onCancel,
  blazeAdded,
}: {
  value: string;
  onChange: (next: string) => void;
  onSave: () => void;
  onCancel: () => void;
  blazeAdded: string[];
}) {
  const items = value.split(',').map((s) => s.trim()).filter(Boolean);
  const blazeSet = new Set(blazeAdded);
  const hasSuggestions = items.some((s) => blazeSet.has(s));
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const remove = (s: string) => onChange(items.filter((x) => x !== s).join(', '));
  const removeSuggestions = () => onChange(items.filter((s) => !blazeSet.has(s)).join(', '));
  const restoreSuggestions = () =>
    onChange([...items, ...blazeAdded.filter((b) => !items.includes(b))].join(', '));
  const commitAdd = () => {
    const v = draft.trim();
    if (v && !items.some((s) => s.toLowerCase() === v.toLowerCase())) {
      onChange([...items, v].join(', '));
    }
    setDraft('');
    setAdding(false);
  };

  // Pill metrics per the design-system Figma spec: 28px tall, 10px before the
  // text and 6px after (so the × lands ~9px from the right edge). These pills
  // always have a delete and no leading icon, so the asymmetry is correct.
  const pillStyle: React.CSSProperties = { height: 28, padding: '0 6px 0 10px' };
  // Suggested (Blaze-added) pills get the accent purple treatment; everything
  // else uses the Chip's default variant.
  const blazeStyle: React.CSSProperties = {
    ...pillStyle,
    background: 'color-mix(in srgb, var(--purple) 10%, transparent)',
    borderColor: 'color-mix(in srgb, var(--purple) 22%, transparent)',
    color: 'var(--purple)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {items.map((s) => {
          const blaze = blazeSet.has(s);
          return (
            <Chip
              key={s}
              size="md"
              selected={false}
              deletable
              onDelete={() => remove(s)}
              style={blaze ? blazeStyle : pillStyle}
            >
              {s}
            </Chip>
          );
        })}

        {adding ? (
          <input
            autoFocus
            type="text"
            value={draft}
            placeholder="Add item"
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitAdd}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitAdd();
              if (e.key === 'Escape') {
                setDraft('');
                setAdding(false);
              }
            }}
            style={{
              height: 28,
              padding: '0 10px',
              fontSize: 14,
              fontFamily: 'inherit',
              border: '1px solid var(--dark-15)',
              borderRadius: 6,
              outline: 'none',
              color: 'var(--dark-90)',
              minWidth: 120,
            }}
          />
        ) : (
          <Chip size="md" variant="add" onClick={() => setAdding(true)} style={{ height: 28, padding: '0 8px' }}>
            Add
          </Chip>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div>
          {blazeAdded.length > 0 &&
            (hasSuggestions ? (
              <Button variant="secondary" size="sm" frontIcon={ArrowRotateLeft2} onPress={removeSuggestions}>
                Remove suggestions
              </Button>
            ) : (
              <Button variant="secondary" size="sm" endIcon={ArrowRotateRight} onPress={restoreSuggestions}>
                Restore suggestions
              </Button>
            ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="tertiary" size="sm" onPress={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onPress={onSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── HOURS EDITOR ─────────────────────────────────────────────────────

interface HoursRange {
  /** "9:00 AM", or "24 hours" (open all day — no close time). */
  open: string;
  close: string;
}
interface DayHours {
  day: string;
  closed: boolean;
  ranges: HoursRange[];
}

/** Half-hour time options for the Opens/Closes selects, plus a leading
 *  "24 hours" option for all-day on the Opens select. */
const TIME_OPTIONS: SelectOption[] = (() => {
  const opts: SelectOption[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const period = h < 12 ? 'AM' : 'PM';
      const hr12 = h % 12 === 0 ? 12 : h % 12;
      const label = `${hr12}:${m === 0 ? '00' : '30'} ${period}`;
      opts.push({ value: label, label });
    }
  }
  return opts;
})();
const OPEN_OPTIONS: SelectOption[] = [{ value: '24 hours', label: '24 hours' }, ...TIME_OPTIONS];

/** "8 AM" → "8:00 AM"; leaves "8:30 AM" / "24 hours" untouched. */
function normalizeTime(t: string): string {
  const m = t.trim().match(/^(\d{1,2})\s*(AM|PM)$/i);
  if (m) return `${m[1]}:00 ${m[2].toUpperCase()}`;
  return t.trim();
}

function parseHours(value: string): DayHours[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [day, ...rest] = line.split(':');
      const body = rest.join(':').trim();
      if (/^closed$/i.test(body)) return { day: day.trim(), closed: true, ranges: [] };
      const ranges = body.split(',').map((seg) => {
        const t = seg.trim();
        if (/^24 hours$/i.test(t)) return { open: '24 hours', close: '' };
        const [open, close] = t.split(/–|-/).map((x) => normalizeTime(x));
        return { open: open ?? '9:00 AM', close: close ?? '6:00 PM' };
      });
      return { day: day.trim(), closed: false, ranges: ranges.length ? ranges : [{ open: '9:00 AM', close: '6:00 PM' }] };
    });
}

function serializeHours(days: DayHours[]): string {
  return days
    .map((d) => {
      if (d.closed || d.ranges.length === 0) return `${d.day}: Closed`;
      const body = d.ranges.map((r) => (r.open === '24 hours' ? '24 hours' : `${r.open} – ${r.close}`)).join(', ');
      return `${d.day}: ${body}`;
    })
    .join('\n');
}

/** Per-day hours editor modeled on the Google Business Profile control:
 *  a "Closed" checkbox per day, Opens/Closes time selects, and +/trash to
 *  add or remove time ranges. Built from Blaze Select / IconButton / icons. */
function HoursEditor({
  value,
  onChange,
  onSave,
  onCancel,
}: {
  value: string;
  onChange: (next: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [days, setDays] = useState<DayHours[]>(() => parseHours(value));

  const commit = (next: DayHours[]) => {
    setDays(next);
    onChange(serializeHours(next));
  };
  const mutateDay = (i: number, fn: (d: DayHours) => DayHours) =>
    commit(days.map((d, idx) => (idx === i ? fn(d) : d)));

  const toggleClosed = (i: number) =>
    mutateDay(i, (d) =>
      d.closed
        ? { ...d, closed: false, ranges: d.ranges.length ? d.ranges : [{ open: '9:00 AM', close: '6:00 PM' }] }
        : { ...d, closed: true },
    );
  const setRange = (i: number, ri: number, key: keyof HoursRange, val: string) =>
    mutateDay(i, (d) => ({ ...d, ranges: d.ranges.map((r, idx) => (idx === ri ? { ...r, [key]: val } : r)) }));
  const addRange = (i: number) =>
    mutateDay(i, (d) => ({ ...d, ranges: [...d.ranges, { open: '9:00 AM', close: '5:00 PM' }] }));
  const removeRange = (i: number, ri: number) =>
    mutateDay(i, (d) => ({ ...d, ranges: d.ranges.filter((_, idx) => idx !== ri) }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {days.map((d, i) => {
        // Day name + Closed checkbox — rendered on the first range row so it
        // aligns with that row (not centered across multiple ranges). Width
        // matches the spacer below for alignment.
        const dayLabel = (
          <>
            <div style={{ width: 44, flexShrink: 0, fontSize: 14, color: 'var(--dark-90)' }}>{d.day}</div>
            <button
              type="button"
              onClick={() => toggleClosed(i)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                width: 92,
                flexShrink: 0,
                background: 'none',
                border: 'none',
                padding: 0,
                fontFamily: 'inherit',
                fontSize: 14,
                color: 'var(--dark-80)',
                cursor: 'pointer',
              }}
            >
              {d.closed ? <CheckboxChecked size={20} /> : <CheckboxLight size={20} />}
              Closed
            </button>
          </>
        );

        return (
          <div key={d.day} style={{ padding: '7px 0' }}>
            {d.closed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 34 }}>
                {dayLabel}
                <span style={{ fontSize: 14, color: 'var(--dark-60)' }}>Closed all day</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {d.ranges.map((r, ri) => (
                  <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 34 }}>
                    {ri === 0 ? dayLabel : <div style={{ width: 144, flexShrink: 0 }} />}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Select
                        value={r.open}
                        onChange={(v) => setRange(i, ri, 'open', v)}
                        options={OPEN_OPTIONS}
                        size="sm"
                        style={{ width: 94 }}
                      />
                      {r.open !== '24 hours' && (
                        <>
                          <span style={{ color: 'var(--dark-60)', fontSize: 14 }}>–</span>
                          <Select
                            value={r.close}
                            onChange={(v) => setRange(i, ri, 'close', v)}
                            options={TIME_OPTIONS}
                            size="sm"
                            style={{ width: 94 }}
                          />
                        </>
                      )}
                    </div>
                    {ri === 0 ? (
                      <IconButton icon={Plus} variant="tertiary" size="md" aria-label="Add hours" onPress={() => addRange(i)} />
                    ) : (
                      <IconButton icon={Trash2} variant="tertiary" size="md" aria-label="Remove hours" onPress={() => removeRange(i, ri)} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
        <Button variant="tertiary" size="sm" onPress={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onPress={onSave}>
          Save
        </Button>
      </div>
    </div>
  );
}

// ─── POSTING PLAN ─────────────────────────────────────────────────────

/** The "first 4 posts" Blaze drafts for the profile — shown at the bottom of
 *  the audit. (The posting-cadence selector was removed.) */
function PostingPlanSection() {
  return (
    <div style={{ marginTop: 40 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <Heading level={3}>Your first 4 posts</Heading>
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
  );
}

function PostStatusBadge({ status }: { status: PostStatus }) {
  const styles: Record<PostStatus, { label: string; bg: string; color: string; border: string }> = {
    'needs-review': {
      label: 'Needs review',
      bg: 'rgba(239,104,0,0.08)',
      color: '#EF6800',
      border: 'rgba(239,104,0,0.2)',
    },
    scheduled: {
      label: 'Scheduled',
      bg: 'var(--dark-4)',
      color: 'var(--dark-60)',
      border: 'var(--dark-8)',
    },
    published: {
      label: 'Published',
      bg: 'rgba(4,175,0,0.08)',
      color: 'var(--status-approved)',
      border: 'rgba(4,175,0,0.2)',
    },
  };
  const s = styles[status];
  return (
    <span
      style={{
        flexShrink: 0,
        fontSize: 12,
        fontWeight: 500,
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 5,
        padding: '2px 6px',
        lineHeight: 1.4,
      }}
    >
      {s.label}
    </span>
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
          <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>
            {post.date}
          </span>
        </div>
        <PostStatusBadge status={post.status} />
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
              fontSize: 12,
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
            fontSize: 12,
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
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      C
    </span>
  );
}

export function GooglePreview({ location }: { location?: BusinessLocation } = {}) {
  const addressLine = location ? fullAddress(location) : '12444 Research Blvd, Austin, TX 78759';
  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      {/* Photos strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 148, gap: 2 }}>
        <img
          src="https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/cabinet-staining.jpg"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <img
          src="https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2026/02/After-Pic.png"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      <div style={{ padding: '16px 16px 20px' }}>
        {/* Business name */}
        <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--dark-90)', lineHeight: 1.2, marginBottom: 6 }}>
          CertaPro Painters of Austin
        </div>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 500, color: 'var(--dark-90)', fontSize: 14 }}>4.7</span>
          <span style={{ display: 'inline-flex', gap: 1, color: '#F5B400' }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <StarFilled key={i} size={14} />
            ))}
          </span>
          <span style={{ fontSize: 14, color: '#1A73E8' }}>187 reviews</span>
        </div>

        {/* Category */}
        <div style={{ fontSize: 14, color: 'var(--dark-60)', marginBottom: 10 }}>Painting contractor</div>

        {/* Verified badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#E8F0FE',
            borderRadius: 20,
            padding: '5px 12px',
            marginBottom: 14,
          }}
        >
          <Check size={13} color="#1A73E8" />
          <span style={{ fontSize: 12, color: '#1A73E8', fontWeight: 500 }}>You manage this Business Profile</span>
        </div>

        {/* Action chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          {(
            [
              { icon: Globe, label: 'Website' },
              { icon: Map02, label: 'Directions' },
              { icon: Heart01, label: 'Save' },
              { icon: Share, label: 'Share' },
            ] as { icon: typeof Globe; label: string }[]
          ).map(({ icon: Ic, label }) => (
            <div
              key={label}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'var(--dark-4)',
                border: '1px solid var(--dark-8)',
                borderRadius: 20,
                padding: '7px 13px',
                fontSize: 14,
                color: 'var(--dark-80)',
                cursor: 'pointer',
              }}
            >
              <Ic size={14} />
              {label}
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--dark-8)', marginBottom: 14 }} />

        {/* Address */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div style={{ flexShrink: 0, marginTop: 1 }}>
            <Marker03 size={15} color="var(--dark-60)" />
          </div>
          <div style={{ fontSize: 14 }}>
            <div style={{ color: 'var(--dark-80)' }}>{addressLine}</div>
            <div style={{ color: '#1A73E8', marginTop: 3 }}>Edit your business information</div>
          </div>
        </div>

        {/* Missing info */}
        <div style={{ fontSize: 12, color: 'var(--dark-60)', paddingLeft: 25, marginBottom: 14 }}>
          Add missing information:
          <span style={{ color: '#1A73E8', marginLeft: 4 }}>Phone number</span>
          <span style={{ color: 'var(--dark-60)', margin: '0 4px' }}>·</span>
          <span style={{ color: '#1A73E8' }}>Business hours</span>
        </div>

        <div style={{ borderTop: '1px solid var(--dark-8)', marginBottom: 14 }} />

        {/* Reviews */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 10 }}>Reviews</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <span style={{ fontSize: 40, fontWeight: 700, color: 'var(--dark-90)', lineHeight: 1 }}>4.7</span>
            <div>
              <div style={{ display: 'inline-flex', gap: 2, color: '#F5B400', marginBottom: 4 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <StarFilled key={i} size={15} />
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--dark-60)' }}>187 Google reviews</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              style={{
                background: 'var(--dark-4)',
                border: '1px solid var(--dark-8)',
                borderRadius: 8,
                padding: '9px 0',
                fontSize: 14,
                color: 'var(--dark-80)',
                cursor: 'pointer',
              }}
            >
              Get more reviews
            </button>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                background: 'var(--dark-4)',
                border: '1px solid var(--dark-8)',
                borderRadius: 8,
                padding: '9px 0',
                fontSize: 14,
                color: 'var(--dark-80)',
                cursor: 'pointer',
              }}
            >
              <Camera size={13} /> Add a photo
            </button>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--dark-8)', marginBottom: 14 }} />

        {/* Description */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--dark-60)', marginBottom: 5 }}>From CertaPro Painters of Austin</div>
          <div style={{ fontSize: 14, color: 'var(--dark-80)', lineHeight: 1.55 }}>
            Your local painters in Austin, TX. CertaPro Painters of Austin handles residential and commercial
            painting across the Austin metro — interior and exterior, cabinet refinishing, color consultation,
            and more.
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--dark-8)', marginBottom: 14 }} />

        {/* Update your customers */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 4 }}>
            Update your customers
          </div>
          <div style={{ fontSize: 12, color: 'var(--dark-60)', marginBottom: 10 }}>
            Share news, offers, and updates about your business
          </div>

          {/* Scheduled posts from the Dashboard posting plan */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
            {PROPOSED_POSTS.map((post) => (
              <div
                key={post.slot}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  background: 'var(--dark-2)',
                  border: '1px solid var(--dark-4)',
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: post.mediaGradient,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--dark-90)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {post.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--dark-60)' }}>
                    Scheduled · {post.date}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            style={{
              background: 'var(--dark-4)',
              border: '1px solid var(--dark-8)',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 14,
              color: 'var(--dark-80)',
              cursor: 'pointer',
            }}
          >
            📣 Add update
          </button>
        </div>

        <div style={{ borderTop: '1px solid var(--dark-8)', marginBottom: 14 }} />

        {/* Profiles */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 12 }}>Profiles</div>
          <div style={{ display: 'flex', gap: 20 }}>
            {(
              [
                { Icon: YouTube, label: 'YouTube', bg: '#FF0000' },
                { Icon: TikTok, label: 'TikTok', bg: '#010101' },
                { Icon: Twitter, label: 'X', bg: '#000000' },
                { Icon: Instagram, label: 'Instagram', bg: '#C13584' },
              ] as { Icon: typeof Globe; label: string; bg: string }[]
            ).map(({ Icon: Ic, label, bg }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  <Ic size={22} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GOOGLE MAPS PACK PREVIEW ─────────────────────────────────────────

const PACK_BUSINESSES = [
  { name: 'Five Star Painting of South Austin', rating: 4.8, reviews: 144, years: '25+', open: 'Open now', isYou: false, isSponsored: true },
  { name: 'Paper Moon Painting', rating: 4.6, reviews: 99, years: '10+', open: 'Open now', isYou: false, isSponsored: false },
  { name: 'CertaPro Painters of Austin', rating: 4.7, reviews: 187, years: '15+', open: 'Open now', isYou: true, isSponsored: false },
  { name: 'WOW 1 Day Painting Austin', rating: 4.4, reviews: 68, years: '8+', open: 'Closes 7 PM', isYou: false, isSponsored: false },
];

function GoogleMapsPackPreview() {
  const sponsored = PACK_BUSINESSES.filter((b) => b.isSponsored);
  const organic   = PACK_BUSINESSES.filter((b) => !b.isSponsored);

  return (
    <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden', fontSize: 14 }}>
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--dark-4)' }}>
        <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--dark-90)' }}>
          &quot;Painters austin&quot; — Google Maps Pack
        </span>
        <div style={{ flexShrink: 0 }}>
          <Button variant="secondary" size="lg">Change query</Button>
        </div>
      </div>

      {/* Sponsored entry */}
      {sponsored.map((b) => (
        <div key={b.name} style={{ padding: '10px 12px', background: '#FAFAFA', borderBottom: '1px solid var(--dark-8)' }}>
          <div style={{ fontSize: 12, color: 'var(--dark-60)', marginBottom: 4 }}>Sponsored</div>
          <div style={{ fontWeight: 500, color: 'var(--dark-90)', marginBottom: 3 }}>{b.name}</div>
          <div style={{ fontSize: 12, color: 'var(--dark-60)', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            <span style={{ color: '#F5B400' }}>★</span>
            <span>{b.rating}</span>
            <span style={{ color: 'var(--dark-60)' }}>({b.reviews})</span>
            <span style={{ color: 'var(--dark-60)' }}>·</span>
            <span style={{ color: 'var(--status-approved)' }}>{b.open}</span>
          </div>
          <div style={{ display: 'flex', gap: 5, marginTop: 7 }}>
            {(['Get quote', 'Book', 'Directions'] as const).map((a) => (
              <button key={a} style={{ fontSize: 12, padding: '3px 8px', background: 'var(--dark-4)', border: '1px solid var(--dark-8)', borderRadius: 12, color: 'var(--dark-80)', cursor: 'pointer', fontFamily: 'inherit' }}>{a}</button>
            ))}
          </div>
        </div>
      ))}

      {/* Businesses section: listings + map */}
      <div style={{ display: 'flex' }}>
        {/* Listings */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-60)', padding: '10px 14px 8px', borderBottom: '1px solid var(--dark-4)' }}>
            Businesses
          </div>
          {organic.map((b, i) => (
            <div
              key={b.name}
              style={{
                padding: '12px 14px',
                borderBottom: i < organic.length - 1 ? '1px solid var(--dark-4)' : 'none',
                background: b.isYou ? 'rgba(26,115,232,0.04)' : 'transparent',
                borderLeft: `2px solid ${b.isYou ? '#1A73E8' : 'transparent'}`,
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
              }}
            >
              <span style={{ fontSize: 14, color: b.isYou ? '#1A73E8' : 'var(--dark-60)', fontWeight: 500, minWidth: 18, flexShrink: 0, lineHeight: 1.5, fontVariantNumeric: 'tabular-nums' }}>
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                <div style={{ fontWeight: b.isYou ? 500 : 400, color: 'var(--dark-90)', fontSize: 16, lineHeight: 1.3 }}>
                  {b.name}
                  {b.isYou && <span style={{ fontSize: 14, color: '#1A73E8', fontWeight: 400, marginLeft: 6 }}>You</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--dark-60)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {b.years} years in business
                </div>
              </div>
              <div style={{ fontSize: 14, color: 'var(--dark-60)', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                <span style={{ color: '#F5B400' }}>★</span>
                <span>{b.rating}</span>
                <span style={{ color: 'var(--dark-60)' }}>({b.reviews})</span>
                <span style={{ color: 'var(--dark-60)' }}>·</span>
                <span style={{ color: b.open.startsWith('Open') ? 'var(--status-approved)' : 'var(--dark-60)' }}>{b.open}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {(['Website', 'Directions'] as const).map((a) => (
                  <button key={a} style={{ fontSize: 12, padding: '4px 10px', background: 'var(--dark-4)', border: '1px solid var(--dark-8)', borderRadius: 14, color: 'var(--dark-80)', cursor: 'pointer', fontFamily: 'inherit' }}>{a}</button>
                ))}
              </div>
              </div>
            </div>
          ))}
          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--dark-4)' }}>
            <button style={{ fontSize: 14, color: '#1A73E8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
              View on Google →
            </button>
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1, minWidth: 0, alignSelf: 'stretch', position: 'relative', overflow: 'hidden', minHeight: 280 }}>
          <svg
            viewBox="0 0 156 360"
            preserveAspectRatio="xMidYMid slice"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          >
            {/* Land background */}
            <rect width="156" height="360" fill="#F5F1E8"/>

            {/* ─── Block / parcel fills (irregular, varied tones) ─── */}
            {/* Top-left quadrant */}
            <polygon points="0,0 44,0 46,32 42,68 0,72" fill="#EBE4D1"/>
            <polygon points="52,0 96,0 98,28 94,54 50,52" fill="#E6DFC9"/>
            <polygon points="102,0 156,0 156,38 130,46 104,42" fill="#EBE4D1"/>
            <polygon points="104,46 156,42 156,82 132,86 102,76" fill="#E2DCC2"/>
            {/* Mid-upper */}
            <polygon points="0,82 38,80 44,118 38,140 0,142" fill="#E6DFC9"/>
            <polygon points="52,80 96,82 96,118 78,124 52,120" fill="#EBE4D1"/>
            <polygon points="80,122 96,120 98,160 82,162 78,142" fill="#E2DCC2"/>
            {/* Mid */}
            <polygon points="102,90 156,84 156,140 134,148 104,142" fill="#EBE4D1"/>
            <polygon points="0,150 42,148 46,196 40,222 0,224" fill="#E6DFC9"/>
            <polygon points="52,148 96,150 98,196 80,210 52,200" fill="#E2DCC2"/>
            <polygon points="104,150 156,148 156,200 130,210 104,196" fill="#EBE4D1"/>
            {/* Lower */}
            <polygon points="0,234 56,232 60,250 4,252" fill="#E6DFC9"/>
            <polygon points="78,232 156,236 156,250 80,250" fill="#EBE4D1"/>
            {/* Below river */}
            <polygon points="0,286 48,284 52,330 0,332" fill="#E6DFC9"/>
            <polygon points="56,286 98,288 100,330 58,330" fill="#EBE4D1"/>
            <polygon points="104,284 156,286 156,332 108,332" fill="#E2DCC2"/>
            <polygon points="0,338 52,336 56,360 0,360" fill="#EBE4D1"/>
            <polygon points="58,336 100,338 102,360 60,360" fill="#E6DFC9"/>
            <polygon points="106,336 156,338 156,360 108,360" fill="#EBE4D1"/>

            {/* Parks — richer greens */}
            <polygon points="14,18 32,16 36,30 30,46 12,44" fill="#C5E1A5"/>
            <polygon points="62,160 78,158 80,178 64,180" fill="#A5D6A7"/>
            <polygon points="120,168 142,166 144,188 122,190" fill="#C5E1A5"/>
            <polygon points="10,302 28,300 32,322 12,324" fill="#A5D6A7"/>
            <polygon points="124,300 146,302 146,326 126,324" fill="#C5E1A5"/>

            {/* ─── Water: Lady Bird Lake — organic curving river ─── */}
            <path
              d="M0,258 C20,250 32,266 50,260 C68,254 82,272 100,266 C118,260 134,274 156,262 L156,284 C134,296 118,282 100,288 C82,294 68,278 50,284 C32,290 20,272 0,280 Z"
              fill="#A8C9E0"
            />
            {/* River subtle inner highlight */}
            <path
              d="M0,266 C20,260 32,274 50,268 C68,262 82,280 100,274 C118,268 134,282 156,270"
              stroke="#BDD6E6"
              strokeWidth="1"
              fill="none"
              opacity="0.7"
            />

            {/* ─── Road shadow/border layer (gray under whites) ─── */}
            {/* Primary N-S */}
            <rect x="100" y="0" width="14" height="360" fill="#D8D2BF" opacity="0.6"/>
            {/* Primary E-W */}
            <rect x="0" y="74" width="156" height="12" fill="#D8D2BF" opacity="0.6"/>
            <rect x="0" y="142" width="156" height="11" fill="#D8D2BF" opacity="0.6"/>
            {/* Other major N-S shadow */}
            <rect x="46" y="0" width="10" height="360" fill="#D8D2BF" opacity="0.6"/>

            {/* ─── Major roads (white) ─── */}
            {/* Primary highway (I-35 style) — bolder vertical */}
            <rect x="102" y="0" width="10" height="360" fill="#FFFFFF"/>
            {/* Secondary major N-S (Lamar style) */}
            <rect x="47" y="0" width="8" height="360" fill="#FFFFFF"/>
            {/* Primary E-W (MLK style) */}
            <rect x="0" y="75" width="156" height="9" fill="#FFFFFF"/>
            {/* Primary E-W (Cesar Chavez style) */}
            <rect x="0" y="143" width="156" height="8" fill="#FFFFFF"/>

            {/* ─── Diagonal artery (Congress Ave) ─── */}
            <path
              d="M140,0 C134,40 128,80 122,124 C118,160 114,200 108,244 C102,288 96,328 90,360"
              stroke="#E5DFCB"
              strokeWidth="6"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M140,0 C134,40 128,80 122,124 C118,160 114,200 108,244 C102,288 96,328 90,360"
              stroke="#FFFFFF"
              strokeWidth="4"
              fill="none"
            />

            {/* ─── Secondary streets (thin white grid) ─── */}
            {/* N-S secondaries */}
            <rect x="8"   y="0" width="1.5" height="360" fill="#FFFFFF"/>
            <rect x="20"  y="0" width="1.8" height="360" fill="#FFFFFF"/>
            <rect x="32"  y="0" width="1.5" height="360" fill="#FFFFFF"/>
            <rect x="64"  y="0" width="1.8" height="360" fill="#FFFFFF"/>
            <rect x="78"  y="0" width="2"   height="360" fill="#FFFFFF"/>
            <rect x="90"  y="0" width="1.5" height="360" fill="#FFFFFF"/>
            <rect x="120" y="0" width="1.8" height="360" fill="#FFFFFF"/>
            <rect x="132" y="0" width="2"   height="360" fill="#FFFFFF"/>
            <rect x="146" y="0" width="1.5" height="360" fill="#FFFFFF"/>
            {/* E-W secondaries */}
            <rect x="0" y="16"  width="156" height="1.5" fill="#FFFFFF"/>
            <rect x="0" y="32"  width="156" height="1.8" fill="#FFFFFF"/>
            <rect x="0" y="50"  width="156" height="1.5" fill="#FFFFFF"/>
            <rect x="0" y="62"  width="156" height="1.8" fill="#FFFFFF"/>
            <rect x="0" y="98"  width="156" height="1.8" fill="#FFFFFF"/>
            <rect x="0" y="112" width="156" height="2"   fill="#FFFFFF"/>
            <rect x="0" y="126" width="156" height="1.5" fill="#FFFFFF"/>
            <rect x="0" y="164" width="156" height="1.8" fill="#FFFFFF"/>
            <rect x="0" y="180" width="156" height="1.5" fill="#FFFFFF"/>
            <rect x="0" y="196" width="156" height="2"   fill="#FFFFFF"/>
            <rect x="0" y="214" width="156" height="1.5" fill="#FFFFFF"/>
            <rect x="0" y="298" width="156" height="1.8" fill="#FFFFFF"/>
            <rect x="0" y="316" width="156" height="1.5" fill="#FFFFFF"/>
            <rect x="0" y="338" width="156" height="1.8" fill="#FFFFFF"/>

            {/* ─── Building footprints (tiny cream rects) ─── */}
            <rect x="4"   y="6"   width="6" height="4" fill="#EFE9D8"/>
            <rect x="14"  y="6"   width="4" height="6" fill="#EFE9D8"/>
            <rect x="26"  y="8"   width="5" height="5" fill="#EFE9D8"/>
            <rect x="38"  y="6"   width="6" height="7" fill="#EFE9D8"/>
            <rect x="58"  y="6"   width="4" height="5" fill="#EFE9D8"/>
            <rect x="68"  y="8"   width="6" height="5" fill="#EFE9D8"/>
            <rect x="82"  y="6"   width="5" height="6" fill="#EFE9D8"/>
            <rect x="106" y="6"   width="4" height="4" fill="#EFE9D8"/>
            <rect x="116" y="8"   width="5" height="5" fill="#EFE9D8"/>
            <rect x="138" y="6"   width="6" height="6" fill="#EFE9D8"/>
            <rect x="6"   y="36"  width="5" height="6" fill="#EFE9D8"/>
            <rect x="24"  y="38"  width="6" height="5" fill="#EFE9D8"/>
            <rect x="36"  y="36"  width="4" height="5" fill="#EFE9D8"/>
            <rect x="58"  y="38"  width="5" height="5" fill="#EFE9D8"/>
            <rect x="84"  y="36"  width="4" height="6" fill="#EFE9D8"/>
            <rect x="124" y="38"  width="6" height="5" fill="#EFE9D8"/>
            <rect x="140" y="36"  width="4" height="5" fill="#EFE9D8"/>
            <rect x="6"   y="92"  width="5" height="4" fill="#EFE9D8"/>
            <rect x="22"  y="90"  width="5" height="5" fill="#EFE9D8"/>
            <rect x="34"  y="92"  width="4" height="4" fill="#EFE9D8"/>
            <rect x="58"  y="90"  width="5" height="5" fill="#EFE9D8"/>
            <rect x="84"  y="92"  width="4" height="4" fill="#EFE9D8"/>
            <rect x="120" y="90"  width="6" height="5" fill="#EFE9D8"/>
            <rect x="138" y="92"  width="5" height="4" fill="#EFE9D8"/>
            <rect x="8"   y="172" width="5" height="5" fill="#EFE9D8"/>
            <rect x="24"  y="170" width="4" height="5" fill="#EFE9D8"/>
            <rect x="36"  y="172" width="5" height="4" fill="#EFE9D8"/>
            <rect x="84"  y="172" width="4" height="5" fill="#EFE9D8"/>
            <rect x="124" y="170" width="6" height="5" fill="#EFE9D8"/>
            <rect x="140" y="172" width="4" height="4" fill="#EFE9D8"/>
            <rect x="6"   y="306" width="5" height="5" fill="#EFE9D8"/>
            <rect x="22"  y="308" width="4" height="4" fill="#EFE9D8"/>
            <rect x="36"  y="306" width="5" height="5" fill="#EFE9D8"/>
            <rect x="62"  y="306" width="4" height="5" fill="#EFE9D8"/>
            <rect x="84"  y="308" width="5" height="4" fill="#EFE9D8"/>
            <rect x="122" y="306" width="5" height="5" fill="#EFE9D8"/>
            <rect x="138" y="308" width="4" height="4" fill="#EFE9D8"/>

            {/* ─── Tiny intersection / transit dots ─── */}
            <circle cx="20"  cy="32"  r="0.8" fill="#666"/>
            <circle cx="78"  cy="75"  r="0.8" fill="#666"/>
            <circle cx="106" cy="143" r="1"   fill="#666"/>
            <circle cx="50"  cy="143" r="0.8" fill="#666"/>
            <circle cx="132" cy="196" r="0.8" fill="#666"/>

            {/* ─── Low-opacity labels ─── */}
            <text x="56" y="276" fontSize="3.2" fill="#4A6B7E" opacity="0.65" fontFamily="sans-serif" fontStyle="italic">
              Lady Bird Lake
            </text>
            <text
              x="112"
              y="200"
              fontSize="3"
              fill="#7A6F4F"
              opacity="0.55"
              fontFamily="sans-serif"
              transform="rotate(82 112 200)"
            >
              Congress Ave
            </text>

            {/* ─── Pins (kept at original positions) ─── */}
            {/* Pin 1 — Five Star */}
            <circle cx="63"  cy="50"  r="5.5" fill="#000" opacity="0.18"/>
            <circle cx="63"  cy="50"  r="5"   fill="#EA4335"/>
            <circle cx="63"  cy="50"  r="1.8" fill="white"/>
            {/* Pin 2 — CertaPro (you) — slightly larger */}
            <circle cx="118" cy="96"  r="6.2" fill="#000" opacity="0.2"/>
            <circle cx="118" cy="96"  r="5.6" fill="#EA4335"/>
            <circle cx="118" cy="96"  r="2"   fill="white"/>
            {/* Pin 3 — Paper Moon */}
            <circle cx="36"  cy="118" r="5.5" fill="#000" opacity="0.18"/>
            <circle cx="36"  cy="118" r="5"   fill="#EA4335"/>
            <circle cx="36"  cy="118" r="1.8" fill="white"/>
            {/* Pin 4 — WOW */}
            <circle cx="88"  cy="172" r="5.5" fill="#000" opacity="0.18"/>
            <circle cx="88"  cy="172" r="5"   fill="#EA4335"/>
            <circle cx="88"  cy="172" r="1.8" fill="white"/>
          </svg>
          <button
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              fontSize: 12,
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 4,
              padding: '4px 8px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
              color: 'var(--dark-80)',
            }}
          >
            Open in Maps
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── REVIEWS SECTION ──────────────────────────────────────────────────

interface PendingReview {
  id: string;
  author: string;
  location: string;
  stars: number;
  body: string;
  time: string;
  aiReply: string;
}

const PENDING_REVIEWS: PendingReview[] = [
  {
    id: 'r1',
    author: 'Maria H.',
    location: 'Austin, TX',
    stars: 5,
    body: "Incredible job on our exterior! The crew was professional, thorough, and left the property spotless. The color came out exactly as we'd imagined.",
    time: '2h ago',
    aiReply: "Thank you so much, Maria! We're thrilled the color turned out just right — enjoy it! Don't hesitate to reach out if you ever need a touch-up.",
  },
  {
    id: 'r2',
    author: 'Kevin O.',
    location: 'Cedar Park, TX',
    stars: 3,
    body: "Paint looks good but they were about an hour late on day two and didn't mention it. A quick heads-up would have been nice.",
    time: '5h ago',
    aiReply: "Hi Kevin, we're glad the finish met your expectations and we're sorry about the communication gap on day two — that's on us. We've flagged this with our crew lead and will do better. Thanks for the honest feedback.",
  },
  {
    id: 'r3',
    author: 'Janelle B.',
    location: 'Westlake, TX',
    stars: 5,
    body: 'Painted our exterior in 4 days, on budget. John explained every step of the process and was super easy to work with.',
    time: 'Yesterday',
    aiReply: "We love hearing this, Janelle! John will be thrilled. Thanks for trusting us with your home — enjoy the fresh look!",
  },
];

function StarRow({ count }: { count: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarFilled key={i} size={12} color={i <= count ? '#F5B400' : 'var(--dark-8)'} />
      ))}
    </span>
  );
}

function ReviewCard({ review }: { review: PendingReview }) {
  const [approved, setApproved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(review.aiReply);
  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: review.stars >= 4 ? '#4285F4' : '#EF6800',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            {review.author[0]}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', lineHeight: 1.2 }}>{review.author}</div>
            <div style={{ fontSize: 12, color: 'var(--dark-60)', lineHeight: 1.2 }}>{review.location} · {review.time}</div>
          </div>
        </div>
        <StarRow count={review.stars} />
      </div>

      {/* Review body */}
      <div style={{ fontSize: 14, color: 'var(--dark-80)', lineHeight: 1.55 }}>{review.body}</div>

      {/* AI reply */}
      <div style={{ background: 'var(--dark-2)', border: '1px solid var(--dark-4)', borderRadius: 8, padding: '10px 12px' }}>
        <div style={{ fontSize: 12, color: 'var(--dark-60)', fontWeight: 500, marginBottom: 5 }}>Blaze draft reply</div>
        {editing ? (
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              fontSize: 14,
              fontFamily: 'inherit',
              background: 'var(--light-100)',
              border: '1px solid var(--dark-15)',
              borderRadius: 8,
              padding: '8px 10px',
              color: 'var(--dark-90)',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
              lineHeight: 1.5,
            }}
          />
        ) : (
          <div style={{ fontSize: 14, color: 'var(--dark-80)', lineHeight: 1.55 }}>{draft}</div>
        )}
      </div>

      {/* Actions */}
      {approved ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--status-approved)' }}>
          <Check size={13} color="var(--status-approved)" /> Reply published
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {editing ? (
            <>
              <Button variant="tertiary" size="sm" onPress={() => setEditing(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onPress={() => { setEditing(false); setApproved(true); }}>Publish reply</Button>
            </>
          ) : (
            <>
              <Button variant="tertiary" size="sm" onPress={() => setEditing(true)}>Edit</Button>
              <Button variant="secondary" size="sm" onPress={() => setApproved(true)}>Approve &amp; publish</Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewsSection({ onViewAll }: { onViewAll: () => void }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Heading level={3} style={{ margin: 0 }}>
          Reviews to reply to
        </Heading>
        <Button variant="tertiary" size="sm" onPress={onViewAll}>
          View all in Reputation →
        </Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, alignItems: 'start' }}>
        {PENDING_REVIEWS.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
      </div>
    </div>
  );
}

// ─── HOME (steady state) ──────────────────────────────────────────────

function HomeView() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  return (
    <div style={{ padding: '24px 28px 40px', maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
      {/* Action needed callout */}
      <div style={{ borderRadius: 12, background: 'var(--dark-2)', border: '1px solid var(--dark-4)', overflow: 'hidden', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--dark-4)' }}>
          <AlertTriangle size={16} color="var(--status-connect)" />
          <Text variant="secondary" style={{ fontWeight: 500, color: 'var(--dark-90)' }}>
            Improve how your profile appears on Google
          </Text>
        </div>
        {[
          { title: 'Review your profile', desc: '5 things to fix on your Google Business Profile', action: () => navigate('/h2/organic-profile?tab=profile-preview') },
          { title: 'Add posts to your campaign', desc: 'You have 0 posts — add some to your Organic Campaign', action: () => navigate('/h2/organic-social') },
        ].map((item, i, arr) => (
          <button
            key={item.title}
            type="button"
            onClick={item.action}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: i < arr.length - 1 ? '1px solid var(--dark-4)' : 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left',
              width: '100%',
              transition: 'background-color 120ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--dark-4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Text variant="secondary" style={{ color: 'var(--dark-90)', fontWeight: 500, flexShrink: 0 }}>
              {item.title}
            </Text>
            <Text variant="metadata" style={{ color: 'var(--dark-60)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.desc}
            </Text>
            <ArrowRight size={16} color="var(--dark-40)" />
          </button>
        ))}
      </div>

      {/* Metric strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 32 }}>
        <MetricCard
          icon={Marker03}
          label="Google Maps rank"
          value="#2"
          delta="↑ 2"
          deltaKind="up"
          foot={'"painters austin" · last month'}
        />
        <MetricCard
          icon={Search}
          label="Google Search rank"
          value="#7"
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
          delta="5 scheduled"
          deltaKind="flat"
          foot="Next: Friday at 10 AM"
        />
      </div>

      {/* Maps Pack — full width */}
      <div style={{ marginBottom: 48 }}>
        <GoogleMapsPackPreview />
      </div>

      {/* Expert upsell banner — full width */}
      <div style={{ marginBottom: 32 }}>
        <ExpertUpsellBanner onTalk={() => showToast({ message: 'Connecting you with a marketing expert…' })} />
      </div>

      {/* Upcoming posts — empty state */}
      <div style={{ marginBottom: 32 }}>
        <Heading level={3} style={{ margin: 0, marginBottom: 12 }}>
          Upcoming posts
        </Heading>
        <div
          style={{
            border: '1px solid var(--dark-8)',
            borderRadius: 12,
            background: 'var(--dark-2)',
            padding: '40px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--dark-4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send1 size={18} color="var(--dark-60)" />
          </div>
          <Text variant="secondary" style={{ color: 'var(--dark-60)', maxWidth: 340 }}>
            Your upcoming posts will appear here once Blaze gets to work.
          </Text>
          <Button
            variant="secondary"
            size="sm"
            endIcon={ArrowRightSm}
            onPress={() => navigate('/h2/organic-social')}
          >
            Add posts to your campaign
          </Button>
        </div>
      </div>

      {/* Reviews section */}
      <ReviewsSection onViewAll={() => navigate('/h2/reputation')} />
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
          fontWeight: 400,
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
      <div style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: 4 }}>{foot}</div>
    </div>
  );
}

// ─── BODY ─────────────────────────────────────────────────────────────

export interface MapRankingBodyProps {
  onProfileConsistency?: () => void;
  /** Pathname used as the dev-state key. The Map Ranking experience reads
   *  cold/steady from this key so the dev panel toggle on the host page
   *  controls the audit-vs-home jump. */
  devStatePath: string;
}

export function MapRankingBody({ devStatePath, onProfileConsistency }: MapRankingBodyProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, setState: setDevState } = useDevState();
  const { openModal } = useModals();
  const devState = getState(devStatePath);

  // Initial view derives from localStorage on first render. The `?reset=1`
  // query param wipes that flag and forces the disconnected 'connect' step.
  const [view, setView] = useState<View>(() => {
    if (typeof window === 'undefined') return 'connect';
    if (searchParams.get('reset') === '1') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore quota / private-mode errors */
      }
      return 'connect';
    }
    try {
      return window.localStorage.getItem(STORAGE_KEY) === '1' ? 'home' : 'connect';
    } catch {
      return 'connect';
    }
  });

  // Sync dev-state toggle → view. Cold lands on the disconnected 'connect'
  // step; steady jumps to 'home'.
  useEffect(() => {
    setView((prev) => {
      if (devState === 'cold') return 'connect';
      if (prev === 'connect' || prev === 'auditing' || prev === 'audit') return 'home';
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

  return (
    <>
      {view === 'connect' && (
        <LandingView
          onConnect={() =>
            openModal(LocationPickerModal, { onConfirm: () => setView('auditing') })
          }
        />
      )}
      {view === 'auditing' && <AuditingView onDone={() => setView('audit')} />}
      {view === 'audit' && <ConfirmStep onConfirm={handleConfirm} />}
      {view === 'home' && <HomeView />}
    </>
  );
}
