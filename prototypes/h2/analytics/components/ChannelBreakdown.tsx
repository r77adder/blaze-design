import { Pill } from '@/staging';
import { useAnalytics, useAnalyticsData } from '../analytics-context';
import { CHANNEL_IS_BLAZE_DRIVEN, CHANNEL_LABEL, fmtInt, fmtPct } from '../mockData';
import ChevronRight from '@/icons/16/ChevronRight';
import { SectionCard } from './SectionCard';
import { RowButton, RowStatic } from './Row';
import { CellLabel, ColHead, Num } from './cells';

const COLS = 'minmax(0,1.5fr) 72px 52px 52px 16px';

/** Ranked channel rows — the primary drill-down. Clicking a row opens the
 *  Source Drawer for that channel. A subtle "Blaze" tag flags channels whose
 *  traffic traces back to Blaze-published assets (the closed loop). */
export function ChannelBreakdown() {
  const { openSourceDrawer } = useAnalytics();
  const data = useAnalyticsData();
  const rows = data.channelSources('last_touch');
  const totalVisitors = data.funnelTotals.visitors;
  const maxVisitors = Math.max(...rows.map((r) => r.visitors), 1);

  return (
    <SectionCard title="Traffic by channel">
      <RowStatic cols={COLS}>
        <ColHead>Channel</ColHead>
        <ColHead align="right">Visitors</ColHead>
        <ColHead align="right">Leads</ColHead>
        <ColHead align="right">Share</ColHead>
        <span />
      </RowStatic>
      {rows.map((row) => (
        <RowButton key={row.channel} cols={COLS} bar={row.visitors / maxVisitors} onClick={() => openSourceDrawer(row.channel)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
            <CellLabel>{CHANNEL_LABEL[row.channel]}</CellLabel>
            {CHANNEL_IS_BLAZE_DRIVEN[row.channel] && (
              <Pill size="xs" style={{ color: 'var(--purple)', flexShrink: 0 }}>
                Blaze
              </Pill>
            )}
          </span>
          <Num strong>{fmtInt(row.visitors)}</Num>
          <Num>{fmtInt(row.leads)}</Num>
          <Num>{fmtPct(row.visitors / totalVisitors, 0)}</Num>
          <span aria-hidden style={{ display: 'inline-flex', justifyContent: 'flex-end', color: 'var(--dark-40)' }}>
            <ChevronRight size={16} />
          </span>
        </RowButton>
      ))}
    </SectionCard>
  );
}
