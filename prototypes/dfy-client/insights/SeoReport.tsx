import { InsightsReport, DataTable, Delta, GoodValue } from '../../h2/insights/shared';
import { Heading } from '@/components';
import { ChartCard, LineChart, Legend, Stat, StatRow } from './charts';
import { NextSteps } from './narrative';
import { WEEKS, Block, type ChannelProps } from './common';

const WEEK_LABELS = ['Apr', 'May 1', 'May 15', 'Jun 1', 'Now'];

/** SEO / AEO — avg-position trend (lower=better), keyword-movers table, AI-citations stat. */
export function SeoReport({ editing, narrative, onNarrative }: ChannelProps) {
  return (
    <InsightsReport weeks={WEEKS.map((w, i) => (i === 0 ? { ...w, subtitle: 'First AI answer citations this week' } : w))}>
      <StatRow>
        <Stat label="Keywords in top 10" value={<GoodValue>34</GoodValue>} delta="+11" spark={[18, 21, 24, 27, 30, 32, 34]} sparkColor="var(--green)" />
        <Stat label="Organic clicks" value="1,880" delta="+27%" spark={[1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 1.88]} sparkColor="var(--green)" />
        <Stat label="AI answer citations" value={<GoodValue>12</GoodValue>} delta="new" tone="good" spark={[0, 0, 0, 2, 5, 9, 12]} sparkColor="var(--teal-70)" />
      </StatRow>

      <Block title="Average position over time">
        <ChartCard>
          <Legend items={[{ label: 'Avg. position (inverted)', color: 'var(--green)' }]} />
          {/* invert: a falling position number (10.5 → 8.4) reads as an upward trend */}
          <LineChart color="var(--green)" invert labels={WEEK_LABELS}
            values={[12.1, 11.4, 10.5, 9.2, 8.4]} />
        </ChartCard>
      </Block>

      <Block title="Keyword movers">
        <DataTable
          columns={[{ label: 'Keyword' }, { label: 'Position' }, { label: 'Change' }, { label: 'Monthly searches' }]}
          rows={[
            ['flooring austin', <GoodValue>4</GoodValue>, <Delta value="+6" tone="good" />, '2,400'],
            ['hardwood floor install austin', '7', <Delta value="+9" tone="good" />, '1,300'],
            ['lvp flooring near me', '9', <Delta value="+5" tone="good" />, '880'],
            ['hardwood refinishing cost', '11', <Delta value="+3" tone="good" />, '720'],
            ['tile installers austin', '14', <Delta value="−2" tone="bad" />, '480'],
          ]} />
      </Block>

      <Block title="AI answer engines">
        <ChartCard>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Heading level={2} color="var(--teal-70)" style={{ lineHeight: 1 }}>12</Heading>
              <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>citations across 3 engines</span>
            </div>
            <div style={{ flex: '1 1 220px' }}>
              <DataTable
                columns={[{ label: 'Engine' }, { label: 'Citations' }, { label: 'Top question' }]}
                rows={[
                  ['Google AI Overviews', '6', 'best flooring installers in Austin'],
                  ['Perplexity', '4', 'cost to install hardwood in a 2,000 sq ft home'],
                  ['Gemini', '2', 'refinish hardwood vs. replace with LVP'],
                ]} />
            </div>
          </div>
        </ChartCard>
      </Block>

      <NextSteps editing={editing} items={narrative.next} onItems={(next) => onNarrative({ next })} />
    </InsightsReport>
  );
}
