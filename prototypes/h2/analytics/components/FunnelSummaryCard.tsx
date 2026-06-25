import { FUNNEL_TOTALS, conversionRate, fmtInt, fmtPct } from '../mockData';
import { FONT, tracking } from '../format';
import { SectionCard, MoreLink } from './SectionCard';

function Stage({ label, count }: { label: string; count: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 0', minWidth: 0 }}>
      <span style={{ fontFamily: FONT, fontSize: 26, fontWeight: 500, lineHeight: 1, color: 'var(--dark-90)' }}>
        {fmtInt(count)}
      </span>
      <span style={{ fontFamily: FONT, fontSize: 13, letterSpacing: tracking(13), color: 'var(--dark-60)' }}>{label}</span>
    </div>
  );
}

function Step({ rate }: { rate: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0, padding: '0 4px' }}>
      <span aria-hidden style={{ fontFamily: FONT, fontSize: 16, color: 'var(--dark-40)' }}>
        →
      </span>
      <span style={{ fontFamily: FONT, fontSize: 11, letterSpacing: tracking(11), color: 'var(--dark-60)', fontVariantNumeric: 'tabular-nums' }}>
        {fmtPct(rate)}
      </span>
    </div>
  );
}

/** Compact Visitor → Lead → Client summary with step conversion rates; links
 *  to the full Funnel view. */
export function FunnelSummaryCard() {
  const { visitors, leads, clients } = FUNNEL_TOTALS;
  return (
    <SectionCard title="Funnel" subtitle="Visitor → Lead → Client" footer={<MoreLink to="/h2/analytics/funnel">View full funnel</MoreLink>}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingTop: 8 }}>
        <Stage label="Visitors" count={visitors} />
        <Step rate={conversionRate(visitors, leads)} />
        <Stage label="Leads" count={leads} />
        <Step rate={conversionRate(leads, clients)} />
        <Stage label="Clients" count={clients} />
      </div>
    </SectionCard>
  );
}
