import { InsightsReport, GoodValue } from '../../h2/insights/shared';
import { ChartCard, LineChart, Donut, Legend, Stat, StatRow, FONT } from './charts';
import { NextSteps } from './narrative';
import { WEEKS, Block, Grid2, type ChannelProps } from './common';

const WEEK_LABELS = ['Apr', 'May 1', 'May 15', 'Jun 1', 'Now'];

const REVIEWS = [
  { name: 'Marcia D.', stars: 5, src: 'Google', text: 'Crew was on time, tidy, and the wide-plank oak looks flawless. Would hire again.' },
  { name: 'Tom R.', stars: 5, src: 'Google', text: 'Got three quotes — Grain was clear on scope and finished the install a day early.' },
  { name: 'Priya S.', stars: 4, src: 'Yelp', text: 'Beautiful tile work in the bath. Small grout touch-up needed but they came right back.' },
  { name: 'Devon W.', stars: 5, src: 'Facebook', text: 'They refinished our whole downstairs hardwood. Neighbors keep asking who did it.' },
];

function Stars({ n }: { n: number }) {
  return <span aria-hidden style={{ color: 'var(--brand)', letterSpacing: 1 }}>{'★'.repeat(n)}<span style={{ color: 'var(--dark-15)' }}>{'★'.repeat(5 - n)}</span></span>;
}

/** Reputation — rating-over-time line, sentiment split donut, recent reviews list. */
export function ReputationReport({ editing, narrative, onNarrative }: ChannelProps) {
  return (
    <InsightsReport weeks={WEEKS.map((w, i) => (i === 0 ? { ...w, subtitle: 'Review velocity tripled since the post-install ask' } : w))}>
      <StatRow>
        <Stat label="Avg. rating" value={<GoodValue>4.7★</GoodValue>} delta="+0.1" spark={[4.5, 4.5, 4.6, 4.6, 4.7, 4.7, 4.7]} sparkColor="var(--brand)" />
        <Stat label="New reviews" value="18" delta="+12" spark={[4, 5, 6, 9, 12, 15, 18]} sparkColor="var(--green)" />
        <Stat label="Response rate" value={<GoodValue>100%</GoodValue>} delta="+9pt" />
        <Stat label="Avg. reply time" value="4h" delta="−20h" spark={[24, 20, 16, 12, 9, 6, 4]} sparkColor="var(--green)" />
      </StatRow>

      <Block title="Rating over time">
        <ChartCard>
          <Legend items={[{ label: 'Avg. rating', color: 'var(--brand)' }]} />
          <LineChart color="var(--brand)" labels={WEEK_LABELS}
            values={[4.4, 4.5, 4.5, 4.6, 4.7]} />
        </ChartCard>
      </Block>

      <Grid2>
        <ChartCard title="Sentiment split">
          <Donut centerLabel="89%" centerSub="positive" segments={[
            { label: 'Positive', value: 89, color: 'var(--green)' },
            { label: 'Neutral', value: 8, color: 'var(--dark-40)' },
            { label: 'Negative', value: 3, color: 'var(--red-70)' },
          ]} />
        </ChartCard>
        <ChartCard title="Reviews by source">
          <Donut centerLabel="18" centerSub="this week" segments={[
            { label: 'Google', value: 11, color: 'var(--blue-70)' },
            { label: 'Yelp', value: 4, color: 'var(--red-70)' },
            { label: 'Facebook', value: 3, color: 'var(--purple)' },
          ]} />
        </ChartCard>
      </Grid2>

      <Block title="Recent reviews">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {REVIEWS.map((r) => (
            <div key={r.name} style={{ border: '1px solid var(--dark-8)', borderRadius: 12, background: 'var(--light-100)', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{r.name}</span>
                  <Stars n={r.stars} />
                </span>
                <span style={{ fontFamily: FONT, fontSize: 12, color: 'var(--dark-60)' }}>{r.src}</span>
              </div>
              <div style={{ fontFamily: FONT, fontSize: 14, lineHeight: 1.55, color: 'var(--dark-80)' }}>{r.text}</div>
            </div>
          ))}
        </div>
      </Block>

      <NextSteps editing={editing} items={narrative.next} onItems={(next) => onNarrative({ next })} />
    </InsightsReport>
  );
}
