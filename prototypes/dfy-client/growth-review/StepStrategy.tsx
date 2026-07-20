import { Heading, Text } from '@/components';
import { STRATEGY_PILLARS, STRATEGY_TOTAL, STRATEGY_TOTAL_NOTE, websiteHero, type StrategyPillar } from './data';
import { GradientHeadline, ReviewSectionHeader } from './ui';

const CONTAINER: React.CSSProperties = {
  border: '1px solid var(--dark-8)', borderRadius: 12, background: 'var(--light-100)', padding: '24px 28px',
};

/** Step 2: the growth strategy, presented like /dfy-client/review-strategy:
 *  one section per pillar with Approve / Request Changes verdicts, sections
 *  separated by dividers. */
export function StepStrategy() {
  return (
    <div style={{ padding: '0 32px 48px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 0 28px' }}>
        <GradientHeadline level={2}>Your plan to book more consultations</GradientHeadline>
      </div>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        {STRATEGY_PILLARS.map((pillar, idx) => (
          <section
            key={pillar.id}
            style={{ paddingTop: idx === 0 ? 8 : 44, paddingBottom: 44, borderTop: idx === 0 ? 'none' : '1px solid var(--dark-8)' }}
          >
            <ReviewSectionHeader decisionKey={`strategy:${pillar.id}`} title={pillar.title} subtitle={pillar.intro} hideActions />
            {pillar.showWebsite ? (
              <WebsiteBody pillar={pillar} />
            ) : (
              <div style={CONTAINER}>
                <BulletItems items={pillar.items} />
              </div>
            )}
          </section>
        ))}

        {/* Grand total across every section */}
        <div style={{ marginTop: 8, paddingTop: 24, borderTop: '2px solid var(--dark-8)', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <Heading level={4} style={{ margin: 0 }}>Total</Heading>
          <div style={{ textAlign: 'right' }}>
            <Text style={{ fontSize: 26, fontWeight: 600, color: 'var(--dark-90)', letterSpacing: '0.2px' }}>{STRATEGY_TOTAL}</Text>
            <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginTop: 2 }}>{STRATEGY_TOTAL_NOTE}</Text>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Bulleted list of {title, body, spend?} items. Items carrying a spend show
 *  it as a pill on the right of the title. */
function BulletItems({ items }: { items: { title: string; body: string; spend?: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {items.map((item) => (
        <div key={item.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--dark-40)', flexShrink: 0, marginTop: 9 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 2 }}>
              <Text style={{ fontWeight: 500 }}>{item.title}</Text>
            </div>
            <Text style={{ display: 'block', fontSize: 15, color: 'var(--dark-80)', lineHeight: 1.6 }}>{item.body}</Text>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Digital-home section: website thumbnail on the left, the pillar's items +
 *  proof pills on the right. */
function WebsiteBody({ pillar }: { pillar: StrategyPillar }) {
  return (
    <div style={CONTAINER}>
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--dark-8)', background: 'var(--light-100)' }}>
          <div style={{ height: 20, display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px', borderBottom: '1px solid var(--dark-8)', background: 'var(--dark-2)' }}>
            <span style={{ width: 5, height: 5, borderRadius: 99, background: 'var(--dark-8)' }} />
            <span style={{ width: 5, height: 5, borderRadius: 99, background: 'var(--dark-8)' }} />
            <span style={{ width: 5, height: 5, borderRadius: 99, background: 'var(--dark-8)' }} />
          </div>
          <img src={websiteHero} alt="Your new website" style={{ width: '100%', display: 'block' }} />
        </div>
        <div>
          <BulletItems items={pillar.items} />
        </div>
      </div>
    </div>
  );
}
