import { useId, type ReactNode } from 'react';
import { Heading } from '@/components';

/**
 * Dependency-free inline-SVG chart toolkit for the client Insights dashboards.
 * Path math is borrowed from the H2 analytics TrendChart / Sparkline so the
 * line/area shapes match the rest of the product. Everything is token-colored;
 * chart accents pull from the H2 analytics palette (blue/purple/green/orange).
 *
 * Components: ChartCard (titled surface), LineChart (with optional comparison
 * series), Bars, SplitBar, Donut, Sparkline, Stat / StatRow, Legend.
 */

export const FONT = "'Sohne', sans-serif";
const track = (px: number) => `${(px * 0.02).toFixed(2)}px`;

/* ─── titled surface ─────────────────────────────────────────────────── */

export function ChartCard({
  title,
  right,
  children,
  pad = true,
}: {
  /** Optional single H3 headline rendered ABOVE the box (matching Block). Omit
   *  when an enclosing Block already supplies the section heading. */
  title?: string;
  right?: ReactNode;
  children: ReactNode;
  pad?: boolean;
}) {
  return (
    <div>
      {(title || right) && (
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, margin: '0 0 14px' }}>
          {title && <Heading level={3} style={{ margin: 0 }}>{title}</Heading>}
          {right}
        </div>
      )}
      <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, background: 'var(--light-100)', overflow: 'hidden', ...(pad ? { padding: 20 } : null) }}>
        {children}
      </div>
    </div>
  );
}

/* ─── legend ─────────────────────────────────────────────────────────── */

export function Legend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginBottom: 14 }}>
      {items.map((it) => (
        <span key={it.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={it.dashed
            ? { width: 14, height: 0, borderTop: `2px dotted ${it.color}`, opacity: 0.6 }
            : { width: 14, height: 2, borderRadius: 2, background: it.color }} />
          <span style={{ fontFamily: FONT, fontSize: 12, letterSpacing: track(12), color: 'var(--dark-60)' }}>{it.label}</span>
        </span>
      ))}
    </div>
  );
}

/* ─── line / area chart ──────────────────────────────────────────────── */

const W = 760;
const H = 220;
const TOP = 14;
const BOTTOM = H - 22;
const PLOT_H = BOTTOM - TOP;
const PAD_X = 6;

function buildPath(values: number[], min: number, max: number): { line: string; area: string } {
  const n = values.length;
  const span = max - min || 1;
  const x = (i: number) => PAD_X + (i / Math.max(n - 1, 1)) * (W - PAD_X * 2);
  const y = (v: number) => BOTTOM - ((v - min) / span) * PLOT_H;
  const line = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const area = `${line} L${x(n - 1).toFixed(1)} ${BOTTOM} L${x(0).toFixed(1)} ${BOTTOM} Z`;
  return { line, area };
}

/**
 * Line + area chart with an optional faded comparison series (previous period).
 * `invert` flips the fill direction for "lower is better" metrics like avg
 * search position — the axis still maps higher value = higher on screen unless
 * you pass invert, which reverses the y-scale so a downward trend reads as up.
 */
export function LineChart({
  values,
  compare,
  labels,
  color = 'var(--blue-70)',
  invert = false,
  height = 220,
}: {
  values: number[];
  compare?: number[];
  labels?: string[];
  color?: string;
  invert?: boolean;
  height?: number;
}) {
  const gradId = useId();
  const all = [...values, ...(compare ?? [])];
  let min = Math.min(...all);
  let max = Math.max(...all);
  const pad = (max - min) * 0.12 || 1;
  min -= pad;
  max += pad;

  const project = invert ? (v: number) => max + min - v : (v: number) => v;
  const cur = buildPath(values.map(project), min, max);
  const pre = compare ? buildPath(compare.map(project), min, max) : null;

  const n = values.length;
  const lastX = PAD_X + (W - PAD_X * 2);
  const lastY = BOTTOM - ((project(values[n - 1]!) - min) / (max - min || 1)) * PLOT_H;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%', height: 'auto', maxHeight: height }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.12" />
            <stop offset="55%" stopColor={color} stopOpacity="0.04" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => {
          const y = TOP + (i / 3) * PLOT_H;
          return <line key={i} x1={0} y1={y} x2={W} y2={y} stroke="var(--dark-4)" strokeWidth={1} />;
        })}
        {pre && (
          <path d={pre.line} fill="none" stroke={color} strokeOpacity={0.28} strokeWidth={1.5} strokeDasharray="1 6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        )}
        <path d={cur.area} fill={`url(#${gradId})`} stroke="none" />
        <path d={cur.line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <circle cx={lastX} cy={lastY} r={3.5} fill={color} stroke="var(--light-100)" strokeWidth={2} />
      </svg>
      {labels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {labels.map((l, i) => (
            <span key={i} style={{ fontFamily: FONT, fontSize: 12, letterSpacing: track(11), color: 'var(--dark-60)' }}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── horizontal bars ────────────────────────────────────────────────── */

export function Bars({
  data,
  color = 'var(--purple)',
  format = (n: number) => n.toLocaleString(),
}: {
  data: { label: string; value: number; color?: string }[];
  color?: string;
  format?: (n: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {data.map((d) => (
        <div key={d.label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 64px', alignItems: 'center', gap: 14 }}>
          <span style={{ fontFamily: FONT, fontSize: 14, letterSpacing: track(13), color: 'var(--dark-80)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.label}</span>
          <div style={{ position: 'relative', height: 22, borderRadius: 4, overflow: 'hidden' }}>
            <span aria-hidden style={{ position: 'absolute', inset: 0, background: d.color ?? color, opacity: 0.08 }} />
            <span aria-hidden style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.max((d.value / max) * 100, 2)}%`, background: d.color ?? color, borderRadius: 4 }} />
          </div>
          <span style={{ fontFamily: FONT, fontSize: 14, textAlign: 'right', color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>{format(d.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── split / stacked bar ────────────────────────────────────────────── */

export function SplitBar({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', height: 28, borderRadius: 6, overflow: 'hidden' }}>
        {segments.map((s) => (
          <span key={s.label} aria-hidden style={{ width: `${(s.value / total) * 100}%`, background: s.color }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {segments.map((s) => (
          <span key={s.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <span aria-hidden style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
            <span style={{ fontFamily: FONT, fontSize: 14, letterSpacing: track(13), color: 'var(--dark-80)' }}>
              {s.label} <strong style={{ fontWeight: 500, color: 'var(--dark-90)' }}>{Math.round((s.value / total) * 100)}%</strong>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── donut ──────────────────────────────────────────────────────────── */

export function Donut({
  segments,
  size = 132,
  thickness = 18,
  centerLabel,
  centerSub,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSub?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--dark-4)" strokeWidth={thickness} />
            {segments.map((s) => {
              const len = (s.value / total) * c;
              const el = (
                <circle key={s.label} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={thickness}
                  strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} strokeLinecap="butt" />
              );
              offset += len;
              return el;
            })}
          </g>
        </svg>
        {(centerLabel || centerSub) && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            {centerLabel && <Heading level={2} style={{ lineHeight: 1 }}>{centerLabel}</Heading>}
            {centerSub && <span style={{ fontFamily: FONT, fontSize: 12, letterSpacing: track(11), color: 'var(--dark-60)' }}>{centerSub}</span>}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {segments.map((s) => (
          <span key={s.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span aria-hidden style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
            <span style={{ fontFamily: FONT, fontSize: 14, letterSpacing: track(13), color: 'var(--dark-80)' }}>
              {s.label} <strong style={{ fontWeight: 500, color: 'var(--dark-90)' }}>{Math.round((s.value / total) * 100)}%</strong>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── sparkline (compact) ────────────────────────────────────────────── */

export function Sparkline({
  data,
  width = 120,
  height = 34,
  stroke = 'var(--dark-40)',
  fill,
  invert = false,
}: {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  /** Area fill. Omit to derive it from `stroke` at 10% opacity (so the fill
   *  always matches the line color); pass e.g. "transparent" to override. */
  fill?: string;
  invert?: boolean;
}) {
  if (data.length < 2) return <svg width={width} height={height} aria-hidden />;
  // No explicit fill → tint the area with the line color at 10% opacity.
  const areaFill = fill ?? stroke;
  const areaOpacity = fill === undefined ? 0.1 : undefined;
  const pad = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * innerW;
    const norm = invert ? (max - v) / span : (v - min) / span;
    const y = pad + innerH - norm * innerH;
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1]![0].toFixed(1)} ${height} L${pts[0]![0].toFixed(1)} ${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden style={{ display: 'block' }}>
      <path d={area} fill={areaFill} fillOpacity={areaOpacity} stroke="none" />
      <path d={line} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ─── stat tiles ─────────────────────────────────────────────────────── */

export function Stat({
  label,
  value,
  delta,
  tone = 'good',
  spark,
  sparkColor = 'var(--dark-40)',
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  tone?: 'good' | 'bad' | 'neutral';
  spark?: number[];
  sparkColor?: string;
}) {
  const color = tone === 'good' ? 'var(--status-approved)' : tone === 'bad' ? 'var(--red-70)' : 'var(--dark-60)';
  const v = delta?.trim() ?? '';
  const up = v.startsWith('+');
  const down = v.startsWith('−') || v.startsWith('-');
  return (
    <div style={{ flex: '1 1 0', minWidth: 150, border: '1px solid var(--dark-8)', borderRadius: 12, background: 'var(--light-100)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontFamily: FONT, fontSize: 12, letterSpacing: track(12), color: 'var(--dark-60)' }}>{label}</span>
      <Heading level={2} style={{ lineHeight: 1, letterSpacing: '0.2px' }}>{value}</Heading>
      {delta && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: FONT, fontSize: 12, letterSpacing: track(12), fontWeight: 500, color }}>
          {(up || down) && <span aria-hidden style={{ fontSize: 12 }}>{up ? '▲' : '▼'}</span>}
          {delta}
        </span>
      )}
      {spark && <Sparkline data={spark} width={150} height={28} stroke={sparkColor} />}
    </div>
  );
}

export function StatRow({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>{children}</div>;
}
