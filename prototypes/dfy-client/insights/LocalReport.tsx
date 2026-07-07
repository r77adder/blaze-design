import { InsightsReport, GoodValue } from '../../h2/insights/shared';
import { ChartCard, LineChart, Bars, Legend, Stat, StatRow } from './charts';
import { NextSteps } from './narrative';
import { WEEKS, Block, Grid2, type ChannelProps } from './common';

const WEEK_LABELS = ['Apr', 'May 1', 'May 15', 'Jun 1', 'Now'];

/** Local Search — map-rank trend (lower=better), review-velocity bars, profile-action stats. */
export function LocalReport({ editing, narrative, onNarrative }: ChannelProps) {
  return (
    <InsightsReport weeks={WEEKS.map((w, i) => (i === 0 ? { ...w, subtitle: 'Map rank up to #2 this week' } : w))}>
      <Block title="Map rank for “flooring Austin”">
        <ChartCard>
          <Legend items={[{ label: 'Map rank (inverted)', color: 'var(--orange-70)' }]} />
          <LineChart color="var(--orange-70)" invert labels={WEEK_LABELS}
            values={[7, 6, 5, 3, 2]} />
        </ChartCard>
      </Block>

      <Block title="Profile actions">
        <StatRow>
          <Stat label="Map views" value="9,400" delta="+19%" spark={[6.2, 6.8, 7.4, 8.1, 8.7, 9.0, 9.4]} sparkColor="var(--orange-70)" />
          <Stat label="Direction requests" value="418" delta="+22%" spark={[260, 290, 320, 350, 380, 400, 418]} sparkColor="var(--orange-70)" />
          <Stat label="Calls from profile" value="163" delta="+9%" spark={[120, 130, 138, 145, 152, 158, 163]} sparkColor="var(--orange-70)" />
          <Stat label="Website clicks" value="612" delta="+14%" spark={[460, 490, 520, 540, 570, 595, 612]} sparkColor="var(--orange-70)" />
        </StatRow>
      </Block>

      <Grid2>
        <ChartCard title="Review velocity">
          <Bars color="var(--orange-70)" data={[
            { label: 'May 11–17', value: 6 },
            { label: 'May 18–24', value: 9 },
            { label: 'May 25–31', value: 14 },
            { label: 'Jun 1–7', value: 18 },
          ]} format={(n) => `${n}`} />
        </ChartCard>
        <ChartCard title="Profile actions split">
          <Bars color="var(--orange-70)" data={[
            { label: 'Directions', value: 418 },
            { label: 'Calls', value: 163 },
            { label: 'Website', value: 612 },
            { label: 'Messages', value: 74 },
          ]} format={(n) => `${n}`} />
        </ChartCard>
      </Grid2>

      <Block title="Citation health">
        <ChartCard>
          <Bars color="var(--orange-70)" data={[
            { label: 'Consistent', value: 41, color: 'var(--green)' },
            { label: 'Needs fixing', value: 3, color: 'var(--red-70)' },
          ]} format={(n) => `${n}`} />
          <div style={{ marginTop: 14, fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.5 }}>
            3 listings (Yelp, Bing, Apple Maps) still carry an old phone number — queued for correction.
          </div>
        </ChartCard>
      </Block>

      <NextSteps editing={editing} items={narrative.next} onItems={(next) => onNarrative({ next })} />
    </InsightsReport>
  );
}
