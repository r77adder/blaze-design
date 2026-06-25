import { Pill, TabChip } from '@/staging';
import ChevronRight from '@/icons/16/ChevronRight';
import { useAnalytics, useAnalyticsData } from '../analytics-context';
import { CHANNEL_IS_BLAZE_DRIVEN, CHANNEL_LABEL, conversionRate, fmtInt, fmtPct } from '../mockData';
import type { AttributionMode } from '../types';
import { FONT, tracking } from '../format';
import { SectionCard } from './SectionCard';
import { RowButton, RowStatic } from './Row';
import { CellLabel, ColHead, Num } from './cells';

const COLS = 'minmax(0,1.5fr) 84px 72px 64px 60px 16px';

/** Source-by-stage table: channels × Visitors / Leads / Clients, under the
 *  chosen attribution model. Rows open the Source Drawer. */
export function SourceByStageTable({
  mode,
  onModeChange,
}: {
  mode: AttributionMode;
  onModeChange: (mode: AttributionMode) => void;
}) {
  const { openSourceDrawer } = useAnalytics();
  const rows = useAnalyticsData().channelSources(mode);
  const maxVisitors = Math.max(...rows.map((r) => r.visitors), 1);
  const totals = rows.reduce(
    (acc, r) => ({ visitors: acc.visitors + r.visitors, leads: acc.leads + r.leads, clients: acc.clients + r.clients }),
    { visitors: 0, leads: 0, clients: 0 },
  );

  return (
    <SectionCard
      title="Sources by stage"
      headerAction={
        <div style={{ display: 'flex', gap: 6 }}>
          <TabChip selected={mode === 'last_touch'} onSelect={() => onModeChange('last_touch')}>
            Last touch
          </TabChip>
          <TabChip selected={mode === 'first_touch'} onSelect={() => onModeChange('first_touch')}>
            First touch
          </TabChip>
        </div>
      }
    >
      <RowStatic cols={COLS}>
        <ColHead>Channel</ColHead>
        <ColHead align="right">Visitors</ColHead>
        <ColHead align="right">Leads</ColHead>
        <ColHead align="right">Clients</ColHead>
        <ColHead align="right">CVR</ColHead>
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
          <Num>{fmtInt(row.clients)}</Num>
          <Num>{fmtPct(conversionRate(row.visitors, row.leads))}</Num>
          <span aria-hidden style={{ display: 'inline-flex', justifyContent: 'flex-end', color: 'var(--dark-40)' }}>
            <ChevronRight size={16} />
          </span>
        </RowButton>
      ))}

      <div style={{ borderTop: '1px solid var(--dark-8)', marginTop: 4 }}>
        <RowStatic cols={COLS}>
          <span style={{ fontFamily: FONT, fontSize: 14, letterSpacing: tracking(14), fontWeight: 500, color: 'var(--dark-90)' }}>
            All channels
          </span>
          <Num strong>{fmtInt(totals.visitors)}</Num>
          <Num strong>{fmtInt(totals.leads)}</Num>
          <Num strong>{fmtInt(totals.clients)}</Num>
          <Num strong>{fmtPct(conversionRate(totals.visitors, totals.leads))}</Num>
          <span />
        </RowStatic>
      </div>
    </SectionCard>
  );
}
