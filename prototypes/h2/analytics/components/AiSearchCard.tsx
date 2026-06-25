import { Button } from '@/components';
import { useAnalytics, useAnalyticsData } from '../analytics-context';
import { conversionRate, fmtInt, fmtPct } from '../mockData';
import { FONT, tracking } from '../format';
import ChevronRight from '@/icons/16/ChevronRight';
import { SectionCard } from './SectionCard';
import { RowStatic } from './Row';
import { CellLabel, ColHead, Num } from './cells';

const ENGINE_COLS = 'minmax(0,1fr) 64px 48px';

function StatChevron() {
  return (
    <span aria-hidden style={{ display: 'inline-flex', alignSelf: 'flex-end', paddingBottom: 2, color: 'var(--dark-40)' }}>
      <ChevronRight size={16} />
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontFamily: FONT, fontSize: 12, letterSpacing: tracking(12), color: 'var(--dark-60)' }}>{label}</span>
      <span style={{ fontFamily: FONT, fontSize: 24, fontWeight: 400, lineHeight: 1, color: 'var(--dark-90)' }}>{value}</span>
    </div>
  );
}

/**
 * AEO highlight. AI search is low-volume / high-intent — its own card because
 * it's the channel SMBs can't otherwise see, and because the self-reported
 * count dwarfs the measured one (the dark funnel: AI-referred visitors return
 * via direct / branded search before converting).
 */
export function AiSearchCard() {
  const { openSourceDrawer } = useAnalytics();
  const data = useAnalyticsData();
  const ai = data.channelSources('last_touch').find((c) => c.channel === 'ai_search')!;
  const aiCvr = conversionRate(ai.visitors, ai.leads);
  const siteCvr = conversionRate(data.funnelTotals.visitors, data.funnelTotals.leads);
  const ratio = (aiCvr / siteCvr).toFixed(1);
  const selfReportedAi = data.selfReported.find((a) => a.mapsTo === 'ai_search')?.count ?? 0;
  const engines = data.aiEngines;
  const maxEngine = Math.max(...engines.map((e) => e.visitors), 1);

  const viewSources = (
    <Button variant="tertiary" size="sm" onClick={() => openSourceDrawer('ai_search')}>
      View sources
    </Button>
  );

  return (
    <SectionCard title="AI search (AEO)" headerAction={viewSources}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 18 }}>
          <MiniStat label="Visitors" value={fmtInt(ai.visitors)} />
          <StatChevron />
          <MiniStat label="Leads" value={fmtInt(ai.leads)} />
          <StatChevron />
          <MiniStat label="Conversion" value={fmtPct(aiCvr)} />
        </div>

        <p style={{ margin: 0, fontFamily: FONT, fontSize: 13, lineHeight: 1.5, letterSpacing: tracking(13), color: 'var(--dark-60)' }}>
          Low volume, high intent — AI search converts at{' '}
          <strong style={{ fontWeight: 500, color: 'var(--dark-90)' }}>≈{ratio}×</strong> the site-wide rate.{' '}
          {selfReportedAi} leads said an AI assistant referred them — more than we can measure directly.
        </p>

        <div>
          <RowStatic cols={ENGINE_COLS}>
            <ColHead>Engine</ColHead>
            <ColHead align="right">Visitors</ColHead>
            <ColHead align="right">Leads</ColHead>
          </RowStatic>
          {engines.map((e) => (
            <RowStatic key={e.engine} cols={ENGINE_COLS} bar={e.visitors / maxEngine}>
              <CellLabel size={13}>{e.engine}</CellLabel>
              <Num strong>{fmtInt(e.visitors)}</Num>
              <Num>{fmtInt(e.leads)}</Num>
            </RowStatic>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
