import { conversionRate, fmtInt, fmtPct } from '../mockData';
import { useAnalyticsData } from '../analytics-context';
import { TrendChart, type MetricTile } from '../components/TrendChart';
import { ChannelBreakdown } from '../components/ChannelBreakdown';
import { AiSearchCard } from '../components/AiSearchCard';
import { TopContentCard } from '../components/TopContentCard';
import { TopPagesCard } from '../components/TopPagesCard';

/**
 * Overview — the default view. KPI tiles up top double as the hero-chart metric
 * selector; the chart compares the selected metric to the previous period.
 * Below: channel breakdown (→ Source Drawer), AI Search highlight, Top Content
 * (the closed loop), and Top Pages.
 */
export function Overview() {
  const data = useAnalyticsData();
  const { visitors, leads, clients } = data.funnelTotals;
  const d = data.periodDeltas;

  const tiles: MetricTile[] = [
    { metric: 'visitors', label: 'Visitors', value: fmtInt(visitors), delta: d.visitors },
    { metric: 'leads', label: 'Leads', value: fmtInt(leads), delta: d.leads },
    { metric: 'clients', label: 'Clients', value: fmtInt(clients), delta: d.clients },
    {
      metric: 'conversionRate',
      label: 'Conversion rate',
      value: fmtPct(conversionRate(visitors, leads)),
      delta: d.conversionRate,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <TrendChart data={data.heroTrend} previous={data.heroTrendPrevious} tiles={tiles} rangeLabel={data.rangeLabel} />

      <style>{`
        .an-row { display: grid; gap: 28px; align-items: stretch; }
        .an-row-primary { grid-template-columns: 1fr 1fr; }
        .an-row-even { grid-template-columns: 1fr 1fr; }
        @media (max-width: 920px) {
          .an-row-primary, .an-row-even { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="an-row an-row-primary">
        <ChannelBreakdown />
        <AiSearchCard />
      </div>
      <div className="an-row an-row-even">
        <TopContentCard />
        <TopPagesCard />
      </div>
    </div>
  );
}
