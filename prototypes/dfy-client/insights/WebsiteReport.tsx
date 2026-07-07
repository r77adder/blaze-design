import { InsightsReport, DataTable, Delta, GoodValue } from '../../h2/insights/shared';
import { ChartCard, LineChart, Legend, Stat, StatRow, FONT } from './charts';
import { NextSteps } from './narrative';
import { WEEKS, DAY_LABELS, Block, type ChannelProps } from './common';

/** A single funnel stage row: label · colored track · count, mirroring H2's FunnelStages. */
function Stage({ label, count, share, color }: { label: string; count: string; share: number; color: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '92px 1fr 88px', alignItems: 'center', gap: 16 }}>
      <span style={{ fontFamily: FONT, fontSize: 14, color: 'var(--dark-80)' }}>{label}</span>
      <div style={{ position: 'relative', height: 24, borderRadius: 4, overflow: 'hidden' }}>
        <span aria-hidden style={{ position: 'absolute', inset: 0, background: color, opacity: 0.08 }} />
        <span aria-hidden style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.max(share * 100, 1.5)}%`, background: color, borderRadius: 4 }} />
      </div>
      <span style={{ fontFamily: FONT, fontSize: 20, textAlign: 'right', color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>{count}</span>
    </div>
  );
}

function Step({ rate, label }: { rate: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--dark-60)', fontFamily: FONT, fontSize: 14 }}>
      <span aria-hidden style={{ fontSize: 12 }}>↓</span>
      <span><strong style={{ fontWeight: 500, fontSize: 16, color: 'var(--dark-90)' }}>{rate}</strong> {label}</span>
    </div>
  );
}

/** Website — traffic line (this period vs previous), conversion funnel, traffic-by-channel table. */
export function WebsiteReport({ editing, narrative, onNarrative }: ChannelProps) {
  return (
    <InsightsReport weeks={WEEKS.map((w, i) => (i === 0 ? { ...w, subtitle: 'Consult-request page converting above benchmark' } : w))}>
      <StatRow>
        <Stat label="Visitors" value="16.4k" delta="+12.4%" spark={[12, 13, 13.5, 14, 15, 15.8, 16.4]} sparkColor="var(--blue-70)" />
        <Stat label="Leads" value="503" delta="+8.6%" spark={[420, 440, 450, 470, 485, 495, 503]} sparkColor="var(--purple)" />
        <Stat label="Conversion rate" value="3.1%" delta="−2.8%" tone="bad" spark={[3.3, 3.2, 3.2, 3.1, 3.0, 3.1, 3.1]} sparkColor="var(--dark-40)" />
        <Stat label="New clients" value={<GoodValue>81</GoodValue>} delta="+21%" spark={[52, 58, 63, 68, 72, 77, 81]} sparkColor="var(--green)" />
      </StatRow>

      <Block title="Traffic this period vs. previous">
        <ChartCard>
          <Legend items={[{ label: 'This week', color: 'var(--blue-70)' }, { label: 'Previous', color: 'var(--blue-70)', dashed: true }]} />
          <LineChart color="var(--blue-70)" labels={DAY_LABELS}
            values={[2100, 2400, 2600, 2300, 2800, 1900, 1700]}
            compare={[1900, 2100, 2200, 2150, 2400, 1750, 1600]} />
        </ChartCard>
      </Block>

      <Block title="Conversion funnel">
        <ChartCard pad={false}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '18px 20px' }}>
            <Stage label="Visitors" count="16,440" share={1} color="var(--blue-70)" />
            <Step rate="3.1%" label="of visitors become leads" />
            <Stage label="Leads" count="503" share={503 / 16440} color="var(--purple)" />
            <Step rate="16.1%" label="of leads become clients" />
            <Stage label="Clients" count="81" share={81 / 16440} color="var(--green)" />
          </div>
        </ChartCard>
      </Block>

      <Block title="Traffic by channel">
        <DataTable
          columns={[{ label: 'Channel' }, { label: 'Visitors' }, { label: 'Leads' }, { label: 'Share' }]}
          rows={[
            ['Organic search', '3,800', '76', '23%'],
            ['Paid social', '3,200', '96', '19%'],
            ['Paid search', '2,400', '120', '15%'],
            ['Blog', '1,900', '38', '12%'],
            ['Direct', '1,700', '51', '10%'],
            ['Organic social', '1,500', '30', '9%'],
          ]} />
      </Block>

      <NextSteps editing={editing} items={narrative.next} onItems={(next) => onNarrative({ next })} />
    </InsightsReport>
  );
}
