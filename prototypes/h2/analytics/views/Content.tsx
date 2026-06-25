import { useMemo } from 'react';
import { useAnalytics, useAnalyticsData } from '../analytics-context';
import { conversionRate, fmtInt, fmtPct } from '../mockData';
import { StatTile } from '../components/StatTile';
import { ContentTable } from '../components/ContentTable';

/**
 * Content — performance of Blaze-published assets (the closed loop). KPI cards
 * across the top, then the asset table (sliced by the type filter that lives in
 * the header). Rows open a focused panel (mounted app-level) with auto-stamped
 * UTMs + attribution.
 */
export function Content() {
  const { contentType, openAssetPanel } = useAnalytics();
  const data = useAnalyticsData();

  const all = useMemo(() => data.contentRows(), [data]);
  const rows = useMemo(
    () => (contentType === 'all' ? all : all.filter((r) => r.asset.type === contentType)),
    [all, contentType],
  );

  const { visitors, leads, clients } = data.funnelTotals;
  const d = data.periodDeltas;
  const tiles = [
    { label: 'Visitors', value: fmtInt(visitors), delta: d.visitors },
    { label: 'Leads', value: fmtInt(leads), delta: d.leads },
    { label: 'Clients', value: fmtInt(clients), delta: d.clients },
    { label: 'Conversion rate', value: fmtPct(conversionRate(visitors, leads)), delta: d.conversionRate },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {tiles.map((t) => (
          <StatTile key={t.label} label={t.label} value={t.value} delta={t.delta} />
        ))}
      </div>

      <ContentTable rows={rows} onSelect={openAssetPanel} />
    </div>
  );
}
