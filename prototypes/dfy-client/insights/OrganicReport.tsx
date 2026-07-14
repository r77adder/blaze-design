import { InsightsReport, DataTable, Delta, GoodValue } from '../../h2/insights/shared';
import { ChartCard, LineChart, Bars, Legend, Stat, StatRow } from './charts';
import { NextSteps } from './narrative';
import { WEEKS, DAY_LABELS, Block, type ChannelProps } from './common';

const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=320&q=80&fit=crop`;
const TOP_POSTS = [
  { img: U('1581858726788-75bc0f6a952d'), cap: 'Before / after: Westlake hardwood install', eng: '1,240', tag: 'Reel' },
  { img: U('1562259949-e8e7689d7828'), cap: 'Crew spotlight: meet the install team', eng: '880', tag: 'Story' },
  { img: U('1513694203232-719a280e022f'), cap: 'Wide-plank oak refinish carousel', eng: '760', tag: 'Carousel' },
  { img: U('1600585154340-be6161a56a0c'), cap: '"Flooring near Mueller": finished LVP', eng: '690', tag: 'Reel' },
];

/** Organic Social, engagement-over-time line, reach-by-platform bars, top-posts row. */
export function OrganicReport({ editing, narrative, onNarrative }: ChannelProps) {
  return (
    <InsightsReport weeks={WEEKS.map((w, i) => (i === 0 ? { ...w, subtitle: '9 posts published across IG, FB & GBP' } : w))}>
      <StatRow>
        <Stat label="Reach" value="34.1k" delta="+18%" spark={[22, 24, 23, 27, 29, 31, 34]} sparkColor="var(--purple)" />
        <Stat label="Engagements" value="2,740" delta="+24%" spark={[1.7, 1.9, 2.0, 2.1, 2.3, 2.5, 2.74]} sparkColor="var(--purple)" />
        <Stat label="Followers" value="+312" delta="+9%" spark={[180, 210, 230, 250, 270, 290, 312]} sparkColor="var(--purple)" />
        <Stat label="Saves" value="410" delta="+31%" spark={[210, 250, 280, 300, 350, 380, 410]} sparkColor="var(--purple)" />
      </StatRow>

      <Block title="Engagement over time">
        <ChartCard>
          <Legend items={[{ label: 'This week', color: 'var(--purple)' }, { label: 'Previous', color: 'var(--purple)', dashed: true }]} />
          <LineChart color="var(--purple)" labels={DAY_LABELS}
            values={[280, 320, 410, 380, 520, 460, 370]}
            compare={[240, 260, 300, 290, 360, 340, 300]} />
        </ChartCard>
      </Block>

      <Block title="Reach by platform">
        <ChartCard>
          <Bars color="var(--purple)" data={[
            { label: 'Instagram', value: 16400, color: 'var(--purple)' },
            { label: 'Facebook', value: 11200, color: 'var(--blue-70)' },
            { label: 'Google Business', value: 6500, color: 'var(--green)' },
          ]} format={(n) => n.toLocaleString()} />
        </ChartCard>
      </Block>

      <Block title="Top posts this week">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
          {TOP_POSTS.map((p) => (
            <div key={p.cap} style={{ border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden', background: 'var(--light-100)' }}>
              <div style={{ position: 'relative', aspectRatio: '4 / 3', background: `var(--dark-4) center / cover no-repeat url(${p.img})` }}>
                <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 12, fontWeight: 500, letterSpacing: '0.04em', color: 'var(--light-100)', background: 'var(--dark-60)', borderRadius: 4, padding: '2px 6px' }}>{p.tag}</span>
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 14, lineHeight: 1.4, color: 'var(--dark-90)', marginBottom: 4 }}>{p.cap}</div>
                <div style={{ fontSize: 12, color: 'var(--dark-60)' }}><strong style={{ color: 'var(--purple)', fontWeight: 500 }}>{p.eng}</strong> engagements</div>
              </div>
            </div>
          ))}
        </div>
      </Block>

      <Block title="By format">
        <DataTable
          columns={[{ label: 'Format' }, { label: 'Posts' }, { label: 'Avg. engagement' }, { label: 'vs. last week' }]}
          rows={[
            ['Before/after install Reels', <GoodValue>3</GoodValue>, '1,040', <Delta value="+28%" tone="good" />],
            ['Showroom carousels', '3', '610', <Delta value="+12%" tone="good" />],
            ['Stories', '2', '430', <Delta value="+6%" tone="good" />],
            ['Product stills', '1', '210', <Delta value="−4%" tone="bad" />],
          ]} />
      </Block>

      <NextSteps editing={editing} items={narrative.next} onItems={(next) => onNarrative({ next })} />
    </InsightsReport>
  );
}
