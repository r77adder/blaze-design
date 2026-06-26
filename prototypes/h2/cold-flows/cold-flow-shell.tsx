import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { Button, Heading, IconButton, Text } from '@/components';
import { Textarea } from '../_ui';
import Plus from '@/icons/20/Plus';
import Trash2 from '@/icons/20/Trash2';
import Close from '@/icons/20/Close';
import Check2 from '@/icons/20/Check2';
import Edit1 from '@/icons/20/Edit1';

/**
 * Shared chrome + field helpers for the V2 cold-state flows (Strategy
 * onboarding, Creative review). These are launched as full-screen takeovers
 * from `HomeColdView`, mirroring the onboarding takeover pattern in
 * `Onboarding.tsx`.
 *
 * Ported from blaze-dfy's `ui.tsx`, retargeted to H2's token set. blaze-dfy's
 * flows lean organic-first; the copy that ships here leans paid-first (Paid
 * Social + Paid Search) per the V2 direction.
 */

// ─── Full-screen takeover shell ─────────────────────────────────────────────

export function FlowTakeover({
  step,
  totalSteps,
  onClose,
  children,
}: {
  /** 1-indexed step within the flow, for the progress bar. */
  step: number;
  totalSteps: number;
  onClose: () => void;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    rootRef.current?.scrollTo({ top: 0 });
  }, [step]);

  const pct = totalSteps > 0 ? (step / totalSteps) * 100 : 0;

  return (
    <div
      ref={rootRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--light-100)',
        overflowY: 'auto',
        zIndex: 120,
      }}
    >
      {/* progress bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 5, height: 3, background: 'var(--dark-4)' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: 'var(--dark-90)',
            transition: 'width 280ms ease',
          }}
        />
      </div>

      {/* close control — floats top-right, blends with the surface */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Save and close"
        style={{
          position: 'fixed',
          top: 16,
          right: 24,
          zIndex: 6,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 10,
          boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
          fontFamily: 'inherit',
          fontSize: 14,
          color: 'var(--dark-60)',
          cursor: 'pointer',
        }}
      >
        Save &amp; close
        <Close size={14} color="currentColor" />
      </button>

      {children}
    </div>
  );
}

/** Per-step heading block — eyebrow + title + optional subtitle. */
export function FlowHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      {eyebrow && (
        <Text
          variant="metadata"
          style={{ display: 'block', color: 'var(--dark-60)', fontSize: 12, fontWeight: 500, marginBottom: 8 }}
        >
          {eyebrow}
        </Text>
      )}
      <Heading level={1} style={{ fontSize: 30, letterSpacing: '-0.4px', lineHeight: 1.2, marginBottom: subtitle ? 8 : 0 }}>
        {title}
      </Heading>
      {subtitle && (
        <Text variant="primary" style={{ display: 'block', color: 'var(--dark-60)', fontSize: 16, lineHeight: 1.5, maxWidth: 640 }}>
          {subtitle}
        </Text>
      )}
    </div>
  );
}

/** Fixed bottom action bar — Back / Continue. */
export function FlowFooter({
  onBack,
  onNext,
  nextLabel = 'Continue',
  backLabel = 'Back',
  nextDisabled,
  note,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean;
  note?: ReactNode;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '14px 24px',
        background: 'var(--light-100)',
        borderTop: '1px solid var(--dark-8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        zIndex: 4,
        boxShadow: '0 -4px 16px rgba(0,0,0,0.04)',
      }}
    >
      <button
        type="button"
        onClick={onBack}
        style={{
          background: 'transparent',
          border: 'none',
          fontFamily: 'inherit',
          fontSize: 14,
          color: 'var(--dark-90)',
          cursor: 'pointer',
          padding: '8px 12px',
        }}
      >
        {backLabel}
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        {note && (
          <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
            {note}
          </Text>
        )}
        <Button variant="primary" size="lg" onPress={onNext} isDisabled={nextDisabled}>
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}

/** Width-constrained step body with bottom padding for the fixed footer. */
export function FlowBody({ children, maxWidth = 900 }: { children: ReactNode; maxWidth?: number }) {
  return <div style={{ maxWidth, margin: '0 auto', padding: '64px 24px 140px' }}>{children}</div>;
}

// ─── Field helpers ──────────────────────────────────────────────────────────

export function SectionHeading({ title, desc, note, right }: { title: string; desc?: string; note?: string; right?: ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Heading level={4} style={{ margin: 0 }}>
          {title}
        </Heading>
        {right}
      </div>
      {desc && (
        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>
          {desc}
        </Text>
      )}
      {note && (
        <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 2 }}>
          {note}
        </Text>
      )}
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Text variant="secondary" style={{ color: 'var(--dark-80)' }}>
        {label}
      </Text>
      {children}
      {hint && (
        <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>
          {hint}
        </Text>
      )}
    </label>
  );
}

export function AddLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div style={{ display: 'flex' }}>
      <Button variant="secondary" frontIcon={Plus} onPress={onClick}>
        {label}
      </Button>
    </div>
  );
}

export function RemoveX({ onClick }: { onClick: () => void }) {
  return <IconButton icon={Trash2} variant="secondary" size="lg" title="Remove" onPress={onClick} />;
}

/**
 * A read-only-by-default section: H3 header + a tertiary Edit button that only
 * appears on hover (or while editing), separated from siblings by a divider.
 * `children` is a render-prop receiving the current `editing` state. Mirrors
 * the basics-step pattern so the editing behavior reads the same everywhere.
 */
export function EditSection({
  title,
  desc,
  first,
  children,
}: {
  title: string;
  desc?: string;
  first?: boolean;
  children: (editing: boolean) => ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <section style={{ padding: '20px 0', borderTop: first ? 'none' : '1px solid var(--dark-8)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div>
          <Heading level={3} style={{ margin: 0, fontSize: 18 }}>
            {title}
          </Heading>
          {desc && (
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>
              {desc}
            </Text>
          )}
        </div>
        <div style={{ flexShrink: 0 }}>
          <Button variant="secondary" size="sm" frontIcon={Edit1} onPress={() => setEditing((e) => !e)}>
            {editing ? 'Done' : 'Edit'}
          </Button>
        </div>
      </div>
      {children(editing)}
    </section>
  );
}

export function FieldCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: 'var(--dark-2)', border: '1px solid var(--dark-6)', borderRadius: 12, padding: 16, ...style }}>
      {children}
    </div>
  );
}

// ─── Minimal markdown (bullets, **bold**) + click-to-edit ───────────────────

function inlineMd(text: string, key: number): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span key={key}>
      {parts.map((p, i) =>
        /^\*\*[^*]+\*\*$/.test(p) ? (
          <strong key={i} style={{ fontWeight: 600 }}>
            {p.slice(2, -2)}
          </strong>
        ) : (
          p
        ),
      )}
    </span>
  );
}

export function Markdown({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      blocks.push(
        <ul
          key={`ul-${blocks.length}`}
          style={{ margin: '4px 0', paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 4, listStyle: 'disc' }}
        >
          {list.map((li, i) => (
            <li key={i} style={{ fontSize: 16, color: 'var(--dark-90)', lineHeight: 1.6 }}>
              {inlineMd(li, i)}
            </li>
          ))}
        </ul>,
      );
      list = [];
    }
  };
  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (/^\s*[-*]\s+/.test(line)) list.push(line.replace(/^\s*[-*]\s+/, ''));
    else if (line.trim() === '') flush();
    else {
      flush();
      blocks.push(
        <p key={`p-${i}`} style={{ margin: 0, fontSize: 16, color: 'var(--dark-90)', lineHeight: 1.6 }}>
          {inlineMd(line, i)}
        </p>,
      );
    }
  });
  flush();
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{blocks}</div>;
}

export function EditableMarkdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <Textarea
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        style={{ minHeight: 132 }}
      />
    );
  }
  return (
    <div
      onClick={() => setEditing(true)}
      title="Click to edit"
      style={{
        cursor: 'text',
        borderRadius: 8,
        border: '1px solid transparent',
        padding: '8px 10px',
        margin: '-8px -10px',
        transition: 'background 0.12s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dark-2)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <Markdown text={value} />
    </div>
  );
}

// ─── Swipe-file gradients ───────────────────────────────────────────────────

const GRADIENTS = [
  'linear-gradient(135deg,#A78BFA,#7C3AED)',
  'linear-gradient(135deg,#60A5FA,#2563EB)',
  'linear-gradient(135deg,#34D399,#059669)',
  'linear-gradient(135deg,#F472B6,#DB2777)',
  'linear-gradient(135deg,#FB923C,#EA580C)',
  'linear-gradient(135deg,#FBBF24,#D97706)',
  'linear-gradient(135deg,#FCA5A5,#DC2626)',
  'linear-gradient(135deg,#0EA5E9,#0369A1)',
];
export function gradientFor(seed: number) {
  return GRADIENTS[(seed - 1 + GRADIENTS.length) % GRADIENTS.length];
}

// ─── Scorecard gauge ring + header ──────────────────────────────────────────

export type ScoreStatus = 'good' | 'warn' | 'bad';
const ringColor = (s: ScoreStatus) => (s === 'bad' ? 'var(--red-70)' : s === 'warn' ? 'var(--status-review)' : 'var(--positive-50)');
const ringTrack = (s: ScoreStatus) => (s === 'bad' ? 'rgba(188,1,11,0.10)' : s === 'warn' ? 'rgba(237,182,44,0.16)' : 'rgba(19,167,69,0.12)');
const ringDisk = (s: ScoreStatus) => (s === 'bad' ? 'rgba(188,1,11,0.05)' : s === 'warn' ? 'rgba(237,182,44,0.07)' : 'rgba(19,167,69,0.06)');
const ringLabel = (s: ScoreStatus) => (s === 'bad' ? 'Poor' : s === 'warn' ? 'Fair' : 'Good');

export function GaugeRing({
  score,
  max,
  status,
  size = 48,
  stroke = 4,
  children,
}: {
  score: number;
  max: number;
  status: ScoreStatus;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, score / max));
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill={ringDisk(status)} stroke={ringTrack(status)} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ringColor(status)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
        />
      </svg>
      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</span>
    </span>
  );
}

export function ScorecardHeader({
  data,
  accountName,
}: {
  data: { overall: number; overallMax: number; reviewed: number; needWork: number };
  accountName: string;
}) {
  const ratio = data.overall / data.overallMax;
  const status: ScoreStatus = ratio < 0.4 ? 'bad' : ratio < 0.7 ? 'warn' : 'good';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: 20,
        borderRadius: 14,
        border: '1px solid var(--dark-8)',
        background: ringDisk(status),
        marginBottom: 24,
      }}
    >
      <GaugeRing score={data.overall} max={data.overallMax} status={status} size={76} stroke={6}>
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
          <span style={{ fontSize: 26, fontWeight: 400, color: 'var(--dark-90)' }}>{data.overall}</span>
          <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>/ {data.overallMax}</span>
        </span>
      </GaugeRing>
      <div style={{ minWidth: 0 }}>
        <Heading level={3} style={{ display: 'block' }}>
          {accountName} — marketing scorecard
        </Heading>
        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 2 }}>
          <strong style={{ color: ringColor(status) }}>{ringLabel(status)}</strong> overall. {data.reviewed} things reviewed, {data.needWork} need work.
        </Text>
      </div>
    </div>
  );
}

export function statusGlyphColor(s: ScoreStatus) {
  return ringColor(s);
}

// ─── Intro / done screens ───────────────────────────────────────────────────

export function IntroScreen({
  eyebrow,
  title,
  intro,
  steps,
  action,
}: {
  eyebrow?: string;
  title: string;
  intro: string;
  steps: { label: string; desc: string }[];
  action: ReactNode;
}) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '72px 24px 60px' }}>
      {eyebrow && (
        <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
          {eyebrow}
        </Text>
      )}
      <Heading level={2} style={{ marginTop: 0, fontSize: 30, letterSpacing: '-0.4px' }}>
        {title}
      </Heading>
      <Text variant="primary" style={{ display: 'block', color: 'var(--dark-60)', margin: '8px 0 24px', lineHeight: 1.6 }}>
        {intro}
      </Text>
      <div style={{ borderRadius: 12, background: 'var(--light-100)', border: '1px solid var(--dark-8)' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderTop: i > 0 ? '1px solid var(--dark-6)' : 'none' }}>
            <span
              style={{
                width: 28,
                height: 28,
                flexShrink: 0,
                borderRadius: 99,
                background: 'var(--dark-6)',
                color: 'var(--dark-90)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {i + 1}
            </span>
            <div>
              <Text variant="smallList" style={{ display: 'block', color: 'var(--dark-90)', fontWeight: 500 }}>
                {s.label}
              </Text>
              <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 2 }}>
                {s.desc}
              </Text>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 28 }}>{action}</div>
    </div>
  );
}

export function DoneScreen({
  title,
  body,
  stored,
  action,
}: {
  title: string;
  body: string;
  stored: { label: string; where: string }[];
  action: ReactNode;
}) {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', padding: '88px 24px 60px' }}>
      <div
        style={{
          width: 64,
          height: 64,
          margin: '0 auto 20px',
          borderRadius: '50%',
          background: 'var(--positive-50)',
          color: 'var(--light-100)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Check2 size={30} color="var(--light-100)" />
      </div>
      <Heading level={2} style={{ marginTop: 0, fontSize: 30, letterSpacing: '-0.4px' }}>
        {title}
      </Heading>
      <Text variant="primary" style={{ display: 'block', color: 'var(--dark-60)', margin: '8px 0 24px', lineHeight: 1.6 }}>
        {body}
      </Text>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left', marginBottom: 28 }}>
        {stored.map((s, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 10,
              background: 'var(--dark-2)',
              border: '1px solid var(--dark-6)',
            }}
          >
            <Check2 size={16} color="var(--positive-50)" />
            <div style={{ flex: 1 }}>
              <Text variant="smallList" style={{ color: 'var(--dark-90)' }}>
                {s.label}
              </Text>
            </div>
            <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>
              saved to {s.where}
            </Text>
          </div>
        ))}
      </div>
      {action}
    </div>
  );
}
