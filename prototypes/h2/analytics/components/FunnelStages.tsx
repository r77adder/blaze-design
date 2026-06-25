import ArrowDown from '@/icons/20/ArrowDown';
import { conversionRate, fmtInt, fmtPct } from '../mockData';
import { useAnalyticsData } from '../analytics-context';
import { FONT, tracking } from '../format';
import { SectionCard } from './SectionCard';

const STAGES = [
  { label: 'Visitors', color: 'var(--blue-70)' },
  { label: 'Leads', color: 'var(--purple)' },
  { label: 'Clients', color: 'var(--status-approved)' },
] as const;

/** One funnel stage as a single row: label · colored bar · count. The filled
 *  portion of the bar is the stage's share; the rest of the track is the same
 *  color at low opacity (so the bar is always visible and the drop-off reads
 *  clearly). Keeping each stage to one row lets the step connectors sit
 *  centered between the colored bars. */
function StageBar({ label, count, share, color }: { label: string; count: number; share: number; color: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '92px 1fr 88px', alignItems: 'center', gap: 16 }}>
      <span style={{ fontFamily: FONT, fontSize: 14, letterSpacing: tracking(14), color: 'var(--dark-80)' }}>{label}</span>
      <div style={{ position: 'relative', height: 24, borderRadius: 4, overflow: 'hidden' }}>
        <span aria-hidden style={{ position: 'absolute', inset: 0, background: color, opacity: 0.08 }} />
        <span
          aria-hidden
          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.max(share * 100, 1.5)}%`, background: color, borderRadius: 4 }}
        />
      </div>
      <span style={{ fontFamily: FONT, fontSize: 20, fontWeight: 400, textAlign: 'right', color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>
        {fmtInt(count)}
      </span>
    </div>
  );
}

function StepConnector({ rate, label }: { rate: number; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <span aria-hidden style={{ display: 'inline-flex', color: 'var(--dark-40)' }}>
        <ArrowDown size={20} />
      </span>
      <span style={{ fontFamily: FONT, fontSize: 13, letterSpacing: tracking(13), color: 'var(--dark-60)' }}>
        <strong style={{ fontWeight: 500, fontSize: 16, color: 'var(--dark-90)' }}>{fmtPct(rate)}</strong> {label}
      </span>
    </div>
  );
}

/**
 * The full Visitor → Lead → Client funnel. Each stage is a colored bar whose
 * fill is its share of visitors; step conversion rates are called out between
 * stages. Totals are attribution-independent; only the source split below
 * changes with the toggle.
 */
export function FunnelStages() {
  const { visitors, leads, clients } = useAnalyticsData().funnelTotals;
  return (
    <SectionCard title="Conversion funnel" bodyPad={false}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 20px' }}>
        <StageBar label={STAGES[0].label} count={visitors} share={1} color={STAGES[0].color} />
        <StepConnector rate={conversionRate(visitors, leads)} label="of visitors become leads" />
        <StageBar label={STAGES[1].label} count={leads} share={leads / visitors} color={STAGES[1].color} />
        <StepConnector rate={conversionRate(leads, clients)} label="of leads become clients" />
        <StageBar label={STAGES[2].label} count={clients} share={clients / visitors} color={STAGES[2].color} />
      </div>
    </SectionCard>
  );
}
