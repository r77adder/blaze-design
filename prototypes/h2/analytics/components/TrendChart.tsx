import { useId, useState } from 'react';
import type { OverviewMetric, TrendPoint } from '../types';
import { fmtDelta, fmtInt, fmtPct, sum, trendSeries } from '../mockData';
import { FONT, formatShortDate, tracking } from '../format';

export const METRIC_META: Record<OverviewMetric, { label: string; color: string; isPct: boolean }> = {
  visitors: { label: 'Visitors', color: 'var(--blue-70)', isPct: false },
  leads: { label: 'Leads', color: 'var(--purple)', isPct: false },
  clients: { label: 'Clients', color: 'var(--status-approved)', isPct: false },
  conversionRate: { label: 'Conversion rate', color: 'var(--dark-90)', isPct: true },
};

export interface MetricTile {
  metric: OverviewMetric;
  label: string;
  value: string;
  delta: number;
}

const W = 760;
const H = 220;
const TOP = 14;
const BOTTOM = H - 18;
const PLOT_H = BOTTOM - TOP;
const PAD_X = 4;

function pathFor(values: number[], max: number): { line: string; area: string } {
  const n = values.length;
  const x = (i: number) => PAD_X + (i / (n - 1)) * (W - PAD_X * 2);
  const y = (v: number) => BOTTOM - (v / (max || 1)) * PLOT_H;
  const line = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const area = `${line} L${x(n - 1).toFixed(1)} ${BOTTOM} L${x(0).toFixed(1)} ${BOTTOM} Z`;
  return { line, area };
}

function metricTotal(data: TrendPoint[], metric: OverviewMetric): number {
  if (metric === 'conversionRate') {
    const v = sum(data.map((d) => d.visitors));
    return v ? sum(data.map((d) => d.leads)) / v : 0;
  }
  return sum(trendSeries(data, metric));
}

/** One KPI tab at the top of the chart container. Clicking it plots that metric
 *  below; the selected tab carries an accent underline + value color. */
function MetricTab({
  tile,
  selected,
  isLast,
  onSelect,
}: {
  tile: MetricTile;
  selected: boolean;
  isLast: boolean;
  onSelect: () => void;
}) {
  const accent = METRIC_META[tile.metric].color;
  const up = tile.delta >= 0;
  return (
    <button
      type="button"
      className="an-metric-tab"
      onClick={onSelect}
      style={{
        position: 'relative',
        appearance: 'none',
        border: 'none',
        borderRight: isLast ? 'none' : '1px solid var(--dark-8)',
        background: 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        padding: '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        font: 'inherit',
      }}
    >
      <span style={{ fontFamily: FONT, fontSize: 14, letterSpacing: tracking(14), color: 'var(--dark-60)' }}>{tile.label}</span>
      <span style={{ fontFamily: FONT, fontSize: 28, fontWeight: 400, lineHeight: 1, letterSpacing: '0.2px', color: 'var(--dark-90)' }}>
        {tile.value}
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: FONT, fontSize: 14, letterSpacing: tracking(14), fontWeight: 500, color: up ? 'var(--status-approved)' : 'var(--red-70)' }}>
        <span aria-hidden style={{ fontSize: 10 }}>{up ? '▲' : '▼'}</span>
        {fmtDelta(tile.delta)}
        <span style={{ color: 'var(--dark-60)', fontWeight: 400 }}>vs. previous</span>
      </span>
      {selected && <span aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: accent }} />}
    </button>
  );
}

/**
 * Hero metrics + trend. The 4 KPI tiles live at the top of the container and
 * act as tabs: the selected metric is plotted below — current period as a bold
 * line + area, previous period as a faded dashed line on the same axis.
 */
export function TrendChart({
  data,
  previous,
  tiles,
  rangeLabel = 'Last 30 days',
}: {
  data: TrendPoint[];
  previous: TrendPoint[];
  tiles: MetricTile[];
  rangeLabel?: string;
}) {
  const gradId = useId();
  const [metric, setMetric] = useState<OverviewMetric>(tiles[0]?.metric ?? 'visitors');
  const meta = METRIC_META[metric];
  const fmt = (n: number) => (meta.isPct ? fmtPct(n) : fmtInt(n));

  const current = trendSeries(data, metric);
  const prev = trendSeries(previous, metric);
  const max = Math.max(...current, ...prev, meta.isPct ? 0.0001 : 1);

  const cur = pathFor(current, max);
  const pre = pathFor(prev, max);
  const lastX = PAD_X + (W - PAD_X * 2);
  const lastY = BOTTOM - ((current[current.length - 1] ?? 0) / (max || 1)) * PLOT_H;
  const midIndex = Math.floor(data.length / 2);

  return (
    <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, background: 'var(--light-100)', overflow: 'hidden' }}>
      <style>{`.an-metric-tab:hover { background: var(--dark-2); }`}</style>

      {/* KPI tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tiles.length}, 1fr)`, borderBottom: '1px solid var(--dark-8)' }}>
        {tiles.map((t, i) => (
          <MetricTab key={t.metric} tile={t} selected={metric === t.metric} isLast={i === tiles.length - 1} onSelect={() => setMetric(t.metric)} />
        ))}
      </div>

      {/* chart */}
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 18, marginBottom: 14 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 14, height: 2, borderRadius: 2, background: meta.color }} />
            <span style={{ fontFamily: FONT, fontSize: 12, letterSpacing: tracking(12), color: 'var(--dark-90)', fontWeight: 500 }}>{rangeLabel} {fmt(metricTotal(data, metric))}</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 14, height: 0, borderTop: `2px dotted ${meta.color}`, opacity: 0.45 }} />
            <span style={{ fontFamily: FONT, fontSize: 12, letterSpacing: tracking(12), color: 'var(--dark-60)' }}>Previous period {fmt(metricTotal(previous, metric))}</span>
          </span>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%', height: 'auto' }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={meta.color} stopOpacity="0.1" />
              <stop offset="40%" stopColor={meta.color} stopOpacity="0.04" />
              <stop offset="100%" stopColor={meta.color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3].map((i) => {
            const y = TOP + (i / 3) * PLOT_H;
            return <line key={i} x1={0} y1={y} x2={W} y2={y} stroke="var(--dark-4)" strokeWidth={1} />;
          })}

          <path d={pre.line} fill="none" stroke={meta.color} strokeOpacity={0.22} strokeWidth={1.5} strokeDasharray="0.5 6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={cur.area} fill={`url(#${gradId})`} stroke="none" />
          <path d={cur.line} fill="none" stroke={meta.color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <circle cx={lastX} cy={lastY} r={3.5} fill={meta.color} stroke="var(--light-100)" strokeWidth={2} />
        </svg>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {[data[0]!, data[midIndex]!, data[data.length - 1]!].map((d, i) => (
            <span key={i} style={{ fontFamily: FONT, fontSize: 11, letterSpacing: tracking(11), color: 'var(--dark-40)' }}>
              {formatShortDate(d.date)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
