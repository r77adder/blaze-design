import { Card } from '@/staging';
import { CHANNEL_LABEL, conversionRate, fmtInt, fmtPct } from '../mockData';
import type { AssetRollup } from '../mockData';
import { FONT, campaignName, formatShortDate } from '../format';
import { AssetTypeBadge } from './AssetTypeBadge';
import { RowButton, RowStatic } from './Row';
import { Thumb } from './Thumb';
import { CellLabel, ColHead, Muted, Num } from './cells';

const COLS = '40px minmax(0,1.5fr) 104px 140px 84px 64px 52px 52px 56px';

/** The Content view's asset table: every Blaze-published asset and what it
 *  drove. Rows open the focused AssetPanel. */
export function ContentTable({ rows, onSelect }: { rows: AssetRollup[]; onSelect: (assetId: string) => void }) {
  const maxVisitors = Math.max(...rows.map((r) => r.visitors), 1);

  return (
    <Card padding="none">
      <div style={{ padding: '0 12px 10px' }}>
        <RowStatic cols={COLS}>
          <span style={{ gridColumn: 'span 2' }}>
            <ColHead>Asset</ColHead>
          </span>
          <ColHead>Type</ColHead>
          <ColHead>Channel</ColHead>
          <ColHead>Published</ColHead>
          <ColHead align="right">Visitors</ColHead>
          <ColHead align="right">Leads</ColHead>
          <ColHead align="right">Clients</ColHead>
          <ColHead align="right">CVR</ColHead>
        </RowStatic>

        {rows.length === 0 && (
          <div style={{ padding: '24px 8px', fontFamily: FONT, fontSize: 14, color: 'var(--dark-60)' }}>
            No assets match this filter.
          </div>
        )}

        {rows.map((row) => {
        const extraChannels = row.channels.length - 1;
        return (
          <RowButton key={row.asset.id} cols={COLS} bar={row.visitors / maxVisitors} onClick={() => onSelect(row.asset.id)}>
            <Thumb size={40} seed={row.asset.id} />
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <CellLabel>{row.asset.title}</CellLabel>
              <Muted>{campaignName(row.asset.utm.campaign)}</Muted>
            </span>
            <span><AssetTypeBadge type={row.asset.type} /></span>
            <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4, minWidth: 0 }}>
              <CellLabel size={13}>{CHANNEL_LABEL[row.asset.channel]}</CellLabel>
              {extraChannels > 0 && <Muted>+{extraChannels}</Muted>}
            </span>
            <Muted size={13}>{formatShortDate(row.asset.publishedAt)}</Muted>
            <Num strong>{fmtInt(row.visitors)}</Num>
            <Num>{fmtInt(row.leads)}</Num>
            <Num>{fmtInt(row.clients)}</Num>
            <Num>{fmtPct(conversionRate(row.visitors, row.leads))}</Num>
          </RowButton>
        );
      })}
      </div>
    </Card>
  );
}
