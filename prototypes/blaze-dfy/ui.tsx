import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { Text, Heading, Button, IconButton } from '@/components';
import { Select, TextField, Pill, Chip } from '@/staging';
import Plus from '@/icons/20/Plus';
import Trash2 from '@/icons/20/Trash2';
import Close from '@/icons/12/Close';
import styles from './ui.module.scss';

/** Native color picker restyled as a clean rounded color chip — no browser
 *  swatch border, rounded fill. */
export function ColorSwatch({ value, onChange, style }: { value: string; onChange: (hex: string) => void; style?: CSSProperties }) {
  return <input type="color" className={styles.colorSwatch} value={value} onChange={(e) => onChange(e.target.value)} style={style} />;
}

/* Inline-styled helpers for the DFY prototype (blaze-design has no Tailwind). */

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Text variant="secondary" color="var(--dark-80)">{label}</Text>
      {children}
      {hint && <Text variant="metadata" color="var(--dark-40)">{hint}</Text>}
    </label>
  );
}

/** Standard DS text input — the lib's `TextField`. Call sites keep an
 *  event-based `onChange`; we adapt it to TextField's value-first signature so
 *  none of them need to change. */
export function TextInput({ inputSize = 'md', onChange, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { inputSize?: 'sm' | 'md' | 'lg' }) {
  return (
    <TextField
      size={inputSize === 'sm' ? 'sm' : 'md'}
      fullWidth
      onChange={onChange ? (v) => (onChange as (e: { target: { value: string } }) => void)({ target: { value: v } }) : undefined}
      {...props}
    />
  );
}
/** Multi-line field — the lib has no standard textarea, so this stays a local
 *  field styled to match the TextField chrome. */
export function TextArea({ fullWidth = true, style, className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { fullWidth?: boolean }) {
  return (
    <textarea
      {...props}
      className={[styles.textArea, className].filter(Boolean).join(' ')}
      style={{ ...(fullWidth ? { width: '100%', boxSizing: 'border-box' as const } : null), minHeight: 88, ...style }}
    />
  );
}

/* ─── Common web/brand font choices for the font dropdown. ───────────────── */
export const FONT_FAMILIES = [
  'Inter', 'Söhne', 'Helvetica Neue', 'Arial', 'Georgia', 'Times New Roman',
  'Poppins', 'Montserrat', 'Playfair Display', 'Lora', 'Roboto', 'Open Sans',
  'Lato', 'Merriweather', 'Oswald', 'Raleway', 'Nunito', 'Work Sans',
];

/** Font family picker — a select rendered IN the chosen typeface so the user
 *  previews it, paired with the role. Falls back to including the current
 *  value if it isn't one of the presets. */
export function FontFamilySelect({ value, onChange, style, size }: { value: string; onChange: (v: string) => void; style?: CSSProperties; size?: 'sm' | 'md' | 'lg' }) {
  const fonts = FONT_FAMILIES.includes(value) || !value ? FONT_FAMILIES : [value, ...FONT_FAMILIES];
  return (
    <Select
      value={value}
      onChange={onChange}
      options={fonts.map((f) => ({ value: f, label: f }))}
      placeholder="Select a font…"
      fullWidth
      size={size}
      style={{ minWidth: 200, ...style }}
    />
  );
}

export function SectionHeading({ title, note, desc, right }: { title: string; note?: string; desc?: string; right?: ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Heading level={4} style={{ margin: 0 }}>{title}</Heading>
        {right}
      </div>
      {desc && <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginTop: 4 }}>{desc}</Text>}
      {note && <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginTop: 4 }}>{note}</Text>}
    </div>
  );
}

/** "Add row" action — secondary button that hugs its content (the flex wrapper
 *  stops the lib Button stretching in a flex-column list). Matches the Create flow. */
export function AddLink({ label, onClick, variant = 'secondary' }: { label: string; onClick: () => void; variant?: 'secondary' | 'tertiary' | 'ghost' }) {
  return <div style={{ display: 'flex' }}><Button variant={variant} frontIcon={Plus} onPress={onClick}>{label}</Button></div>;
}
/** Remove-row action — secondary trash IconButton. Matches the Create flow. */
export function RemoveX({ onClick, size = 'md', variant = 'secondary' }: { onClick: () => void; size?: 'sm' | 'md' | 'lg'; variant?: 'secondary' | 'tertiary' | 'ghost' }) {
  return <IconButton icon={Trash2} variant={variant} size={size} title="Remove" onPress={onClick} />;
}

/** Editable token list — each value is a static DS `Pill` with an inline remove
 *  ×; adding opens an inline field and commits to a new pill. The pills are
 *  display tokens (not pressable), the "add" affordance is the DS add Chip.
 *  `readOnly` renders the pills with no remove × and no add affordance. */
export function TokenInput({ tokens, setTokens, placeholder, readOnly }: { tokens: string[]; setTokens: (t: string[]) => void; placeholder: string; readOnly?: boolean }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const add = () => {
    const t = draft.trim();
    if (t && !tokens.includes(t)) setTokens([...tokens, t]);
    setDraft('');
    setAdding(false);
  };
  const remove = (t: string) => setTokens(tokens.filter((x) => x !== t));
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
      {tokens.map((t) => (
        <Pill key={t} size="xl">
          {t}
          {!readOnly && (
            <span
              role="button"
              tabIndex={0}
              aria-label={`Remove ${t}`}
              onClick={() => remove(t)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); remove(t); } }}
              style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', marginLeft: 4, color: 'var(--dark-40)' }}
            >
              <Close size={14} />
            </span>
          )}
        </Pill>
      ))}
      {readOnly ? null : adding ? (
        <div style={{ width: 200 }}>
          <TextInput
            autoFocus
            inputSize="md"
            fullWidth
            value={draft}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={add}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); if (e.key === 'Escape') { setDraft(''); setAdding(false); } }}
          />
        </div>
      ) : (
        <Chip size="lg" variant="add" onClick={() => setAdding(true)}>{placeholder}</Chip>
      )}
    </div>
  );
}

/** Lightweight hover tooltip — wraps a trigger and shows a dark bubble on hover.
 *  For short explanatory text (e.g. a "?" help affordance). Wraps long copy. */
export function Tooltip({ label, children, width = 300, placement = 'below' }: { label: ReactNode; children: ReactNode; width?: number; placement?: 'above' | 'below' }) {
  const [show, setShow] = useState(false);
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            ...(placement === 'below' ? { top: 'calc(100% + 8px)' } : { bottom: 'calc(100% + 8px)' }),
            width,
            maxWidth: '80vw',
            background: 'var(--dark-90)',
            color: 'var(--light-100)',
            fontSize: 12,
            fontWeight: 400,
            lineHeight: 1.5,
            padding: '8px 10px',
            borderRadius: 6,
            zIndex: 40,
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
}

/** Footer action row for phase screens. */
export function Footer({ children }: { children: ReactNode }) {
  return <div style={{ position: 'sticky', bottom: 0, marginTop: 32, padding: '16px 0', borderTop: '1px solid var(--dark-8)', background: 'var(--light-100)', boxShadow: '0 -8px 16px rgba(15,23,42,0.05)', display: 'flex', justifyContent: 'space-between', gap: 16 }}>{children}</div>;
}

/* ─── Minimal markdown renderer (bullets, headings, **bold**). ───────────── */
function inlineMd(text: string, key: number): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return <span key={key}>{parts.map((p, i) => /^\*\*[^*]+\*\*$/.test(p) ? <strong key={i} style={{ fontWeight: 600 }}>{p.slice(2, -2)}</strong> : p)}</span>;
}

export function Markdown({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} style={{ margin: '4px 0', paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 4, listStyle: 'disc' }}>
          {list.map((li, i) => <li key={i} style={{ fontSize: 15, color: 'var(--dark-90)', lineHeight: 1.6 }}>{inlineMd(li, i)}</li>)}
        </ul>,
      );
      list = [];
    }
  };
  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (/^\s*[-*]\s+/.test(line)) list.push(line.replace(/^\s*[-*]\s+/, ''));
    else if (line.trim() === '') flush();
    else if (/^#{1,3}\s+/.test(line)) { flush(); blocks.push(<div key={`h-${i}`} style={{ marginTop: 4, fontSize: 15, fontWeight: 600, color: 'var(--dark-90)' }}>{line.replace(/^#{1,3}\s+/, '')}</div>); }
    else { flush(); blocks.push(<p key={`p-${i}`} style={{ margin: 0, fontSize: 15, color: 'var(--dark-90)', lineHeight: 1.6 }}>{inlineMd(line, i)}</p>); }
  });
  flush();
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{blocks}</div>;
}

/** Click-to-edit block: shows rendered markdown (bullets etc.); click to edit
 *  raw text in a textarea, blur to render again. */
export function EditableMarkdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return <TextArea autoFocus value={value} onChange={(e) => onChange(e.target.value)} onBlur={() => setEditing(false)} style={{ minHeight: 132 }} />;
  }
  return (
    <div onClick={() => setEditing(true)} title="Click to edit"
      style={{ cursor: 'text', borderRadius: 8, border: '1px solid transparent', padding: '8px 10px', margin: '-8px -10px', transition: 'background 0.12s' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dark-2)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
      <Markdown text={value} />
    </div>
  );
}

/** Left-rail table of contents on one long page; rail scrolls + tracks scroll. */
export function SidePanel({ items, children }: { items: { key: string; label: string }[]; children: ReactNode }) {
  const [active, setActive] = useState(items[0]?.key);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = wrap.current?.closest('main, [class*="content"]') ?? null;
    const obs = new IntersectionObserver(
      (es) => { const v = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top); if (v[0]) setActive(v[0].target.id); },
      { root: root as Element | null, rootMargin: '0px 0px -65% 0px' },
    );
    items.forEach((it) => { const el = document.getElementById(it.key); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [items]);
  return (
    <div ref={wrap} style={{ display: 'grid', gridTemplateColumns: '200px minmax(0,1fr)', gap: 32 }}>
      <nav style={{ position: 'sticky', top: 8, alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((it) => {
          const on = it.key === active;
          return (
            <button key={it.key} onClick={() => document.getElementById(it.key)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              style={{ textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, background: on ? 'var(--dark-4)' : 'transparent', color: on ? 'var(--dark-90)' : 'var(--dark-60)', fontWeight: on ? 500 : 400 }}>{it.label}</button>
          );
        })}
      </nav>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 48, minWidth: 0 }}>{children}</div>
    </div>
  );
}

export function PanelSection({ id, children }: { id: string; children: ReactNode }) {
  return <section id={id} style={{ scrollMarginTop: 12 }}>{children}</section>;
}

const GRADIENTS = ['linear-gradient(135deg,#A78BFA,#7C3AED)', 'linear-gradient(135deg,#60A5FA,#2563EB)', 'linear-gradient(135deg,#34D399,#059669)', 'linear-gradient(135deg,#F472B6,#DB2777)', 'linear-gradient(135deg,#FB923C,#EA580C)', 'linear-gradient(135deg,#FBBF24,#D97706)', 'linear-gradient(135deg,#FCA5A5,#DC2626)', 'linear-gradient(135deg,#0EA5E9,#0369A1)'];
export function gradientFor(seed: number) { return GRADIENTS[(seed - 1) % GRADIENTS.length]; }

/* ─── Scorecard gauge ring + overall header (from the original mocks). ───── */
type ScoreStatus = 'good' | 'warn' | 'bad';
const ringColor = (s: ScoreStatus) => s === 'bad' ? 'var(--red-70)' : s === 'warn' ? 'var(--status-review)' : 'var(--status-approved)';
const ringTrack = (s: ScoreStatus) => s === 'bad' ? 'rgba(188,1,11,0.10)' : s === 'warn' ? 'rgba(237,182,44,0.16)' : 'rgba(4,175,0,0.12)';
const ringDisk = (s: ScoreStatus) => s === 'bad' ? 'rgba(188,1,11,0.05)' : s === 'warn' ? 'rgba(237,182,44,0.07)' : 'rgba(4,175,0,0.06)';
const ringLabel = (s: ScoreStatus) => s === 'bad' ? 'Poor' : s === 'warn' ? 'Fair' : 'Good';

export function GaugeRing({ score, max, status, size = 48, stroke = 4, children }: { score: number; max: number; status: ScoreStatus; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, score / max));
  return (
    <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0, alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill={ringDisk(status)} stroke={ringTrack(status)} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ringColor(status)} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} />
      </svg>
      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</span>
    </span>
  );
}

interface ScorecardLike { overall: number; overallMax: number; reviewed: number; needWork: number }
export function ScorecardHeader({ data, accountName }: { data: ScorecardLike; accountName: string }) {
  const ratio = data.overall / data.overallMax;
  const status: ScoreStatus = ratio < 0.4 ? 'bad' : ratio < 0.7 ? 'warn' : 'good';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: 20, borderRadius: 14, border: '1px solid var(--dark-8)', background: ringDisk(status), marginBottom: 24 }}>
      <GaugeRing score={data.overall} max={data.overallMax} status={status} size={76} stroke={6}>
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
          <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--dark-90)' }}>{data.overall}</span>
          <span style={{ fontSize: 10, color: 'var(--dark-40)' }}>/ {data.overallMax}</span>
        </span>
      </GaugeRing>
      <div style={{ minWidth: 0 }}>
        <Heading level={3} style={{ display: 'block' }}>{accountName} — marketing scorecard</Heading>
        <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginTop: 2 }}>
          <strong style={{ color: ringColor(status) }}>{ringLabel(status)}</strong> overall. {data.reviewed} things reviewed, {data.needWork} need work.
        </Text>
      </div>
    </div>
  );
}

/** Light-grey rounded box wrapping an editable field group. */
export function FieldCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ background: 'var(--dark-2)', border: '1px solid var(--dark-6)', borderRadius: 12, padding: 16, ...style }}>{children}</div>;
}

/** Input that looks like plain text until hovered/focused, then reveals a
 *  field outline — used for in-place editing of titles & descriptions. */
export function HoverInput({ value, onChange, placeholder, multiline, style }: { value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean; style?: CSSProperties }) {
  const [hot, setHot] = useState(false);
  const shared: CSSProperties = {
    width: '100%', fontFamily: 'inherit', color: 'var(--dark-90)', outline: 'none',
    background: hot ? 'var(--light-100)' : 'transparent', borderRadius: 7, padding: '6px 8px',
    border: hot ? '1px solid var(--dark-12)' : '1px solid transparent', transition: 'background 0.1s, border 0.1s',
    ...style,
  };
  const handlers = { onFocus: () => setHot(true), onBlur: () => setHot(false), onMouseEnter: () => setHot(true), onMouseLeave: () => setHot(false) };
  return multiline
    ? <textarea value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} {...handlers} style={{ ...shared, resize: 'vertical', lineHeight: 1.5 }} />
    : <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} {...handlers} style={shared} />;
}

/** Intro / "what you'll do" screen shown at the top of an onboarding phase. */
export function IntroPage({ title, intro, steps, action }: { title: string; intro: string; steps: { label: string; desc: string }[]; action: ReactNode }) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <Heading level={2} style={{ marginTop: 0 }}>{title}</Heading>
      <Text variant="primary" color="var(--dark-60)" style={{ display: 'block', margin: '8px 0 24px', lineHeight: 1.6 }}>{intro}</Text>
      <div style={{ borderRadius: 12, background: 'var(--light-100)', border: '1px solid var(--dark-8)' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderTop: i > 0 ? '1px solid var(--dark-6)' : 'none' }}>
            <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 99, background: 'var(--dark-6)', color: 'var(--dark-90)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>{i + 1}</span>
            <div>
              <Text variant="largeList" style={{ display: 'block' }}>{s.label}</Text>
              <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginTop: 2 }}>{s.desc}</Text>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>{action}</div>
    </div>
  );
}

/** Success / "saved" screen shown at the end of an onboarding phase. */
export function SuccessState({ title, body, stored, action }: { title: string; body: string; stored: { label: string; where: string }[]; action?: ReactNode }) {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', padding: '32px 0' }}>
      <div style={{ width: 56, height: 56, margin: '0 auto 16px', borderRadius: 99, background: 'var(--positive-10)', color: 'var(--positive-60)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>✓</div>
      <Heading level={2} style={{ marginTop: 0 }}>{title}</Heading>
      <Text variant="primary" color="var(--dark-60)" style={{ display: 'block', margin: '8px 0 24px', lineHeight: 1.6 }}>{body}</Text>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left', marginBottom: 28 }}>
        {stored.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: 'var(--dark-2)', border: '1px solid var(--dark-6)' }}>
            <span style={{ color: 'var(--positive-60)', fontWeight: 700 }}>✓</span>
            <div style={{ flex: 1 }}><Text variant="largeList">{s.label}</Text></div>
            <Text variant="metadata" color="var(--dark-60)">saved to {s.where}</Text>
          </div>
        ))}
      </div>
      {action}
    </div>
  );
}
