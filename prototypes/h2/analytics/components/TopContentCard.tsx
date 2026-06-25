import { useAnalytics, useAnalyticsData } from '../analytics-context';
import { CHANNEL_LABEL, fmtInt } from '../mockData';
import { SectionCard, MoreLink } from './SectionCard';
import { RowButton, RowStatic } from './Row';
import { AssetTypeBadge } from './AssetTypeBadge';
import { Thumb } from './Thumb';
import { CellLabel, ColHead, Muted, Num } from './cells';

const COLS = '40px minmax(0,1fr) max-content 64px 48px';

/** The closed loop made visible: top Blaze-published assets and the traffic
 *  they drove. Rows open the asset detail panel; "View all" goes to Content. */
export function TopContentCard() {
  const { openAssetPanel } = useAnalytics();
  const rows = useAnalyticsData().assetRollups().slice(0, 5);
  const maxVisitors = Math.max(...rows.map((r) => r.visitors), 1);

  return (
    <SectionCard title="Top content" headerAction={<MoreLink to="/h2/analytics/content">View all</MoreLink>}>
      <RowStatic cols={COLS}>
        <span style={{ gridColumn: 'span 2' }}>
          <ColHead>Asset</ColHead>
        </span>
        <span />
        <ColHead align="right">Visitors</ColHead>
        <ColHead align="right">Leads</ColHead>
      </RowStatic>
      {rows.map((row) => (
        <RowButton key={row.asset.id} cols={COLS} bar={row.visitors / maxVisitors} onClick={() => openAssetPanel(row.asset.id)} align="center">
          <Thumb size={40} seed={row.asset.id} />
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <CellLabel>{row.asset.title}</CellLabel>
            <Muted>{row.channels.map((c) => CHANNEL_LABEL[c]).join(' · ')}</Muted>
          </span>
          <AssetTypeBadge type={row.asset.type} />
          <Num strong>{fmtInt(row.visitors)}</Num>
          <Num>{fmtInt(row.leads)}</Num>
        </RowButton>
      ))}
    </SectionCard>
  );
}
