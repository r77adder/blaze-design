import { fmtInt, fmtPct } from '../mockData';
import { useAnalyticsData } from '../analytics-context';
import { SectionCard } from './SectionCard';
import { RowStatic } from './Row';
import { CellLabel, ColHead, Muted, Num } from './cells';

const COLS = 'minmax(0,1fr) 72px 64px';

/** Top landing pages by visitors + conversion rate. */
export function TopPagesCard() {
  const pages = useAnalyticsData().topPages;
  const maxVisitors = Math.max(...pages.map((p) => p.visitors), 1);
  return (
    <SectionCard title="Top pages">
      <RowStatic cols={COLS}>
        <ColHead>Page</ColHead>
        <ColHead align="right">Visitors</ColHead>
        <ColHead align="right">CVR</ColHead>
      </RowStatic>
      {pages.map((page) => (
        <RowStatic key={page.path} cols={COLS} bar={page.visitors / maxVisitors}>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <CellLabel>{page.title}</CellLabel>
            <Muted>{page.path}</Muted>
          </span>
          <Num strong>{fmtInt(page.visitors)}</Num>
          <Num>{fmtPct(page.conversionRate)}</Num>
        </RowStatic>
      ))}
    </SectionCard>
  );
}
