import { Button, Heading, Paragraph, Text } from '@/components';
import { Pill } from '@/staging';
import AlertTriangle from '@/icons/20/AlertTriangle';

const STEPS = [
  {
    tag: 'Start here',
    month: 'Months 1–3',
    name: 'Organic DFY Base',
    work: 'Social, SEO blogs, email, GBP. Baseline presence so you stop disappearing between jobs.',
    price: '$999/mo',
    featured: true,
  },
  {
    tag: null,
    month: 'Month 4+',
    name: 'Reputation DFY',
    work: 'Review-ask automation, owner-voice responses, Angi profile setup. Close the velocity + response gap.',
    price: '$999/mo',
    featured: false,
  },
  {
    tag: null,
    month: 'Month 4+',
    name: 'Paid Ads Base',
    work: '1 platform + branded keyword defense. Stop competitors from stealing customers searching your name.',
    price: '$999/mo',
    featured: false,
  },
  {
    tag: null,
    month: 'Month 6+',
    name: 'Conversion DFY',
    work: 'Landing page rebuilds, lead-form rework, page-speed fix.',
    price: '$999/mo',
    featured: false,
  },
];

// Purple accent surface — used only on the "your recommended path" panel
// to set it apart from the rest of the scorecard.
const PURPLE_BG = 'linear-gradient(180deg, #F4F1FF 0%, #E9E4FF 100%)';
const PURPLE_BORDER = 'rgba(124, 92, 252, 0.18)';

export function RecCard() {
  return (
    <div
      id="recommendation"
      style={{
        background: PURPLE_BG,
        border: `1px solid ${PURPLE_BORDER}`,
        borderRadius: 14,
        padding: 28,
      }}
    >
      <Text
        variant="label"
        color="var(--purple)"
        style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}
      >
        Your recommended path
      </Text>

      <Heading level={2} style={{ margin: '0 0 10px' }}>
        Here's the path back to a healthy score.
      </Heading>

      <Paragraph color="var(--dark-60)" style={{ margin: '0 0 24px', maxWidth: 640, fontSize: 16, lineHeight: 1.55 }}>
        Tackle every gap above in the right order — without spending a dollar on paid ads in month one. A US-based strategist runs each layer with you.
      </Paragraph>

      {/* roadmap grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {STEPS.map((step) => (
          <div
            key={step.name}
            style={{
              background: step.featured ? 'var(--purple)' : 'rgba(255, 255, 255, 0.7)',
              border: `1px solid ${step.featured ? 'var(--purple)' : PURPLE_BORDER}`,
              borderRadius: 14,
              padding: 16,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {step.tag && (
              <div style={{ position: 'absolute', top: 12, right: 12 }}>
                <Pill
                  size="xs"
                  style={
                    step.featured
                      ? { background: 'rgba(255, 255, 255, 0.2)', color: 'var(--light-100)', border: 'none' }
                      : undefined
                  }
                >
                  {step.tag}
                </Pill>
              </div>
            )}
            <Text
              variant="label"
              color={step.featured ? 'rgba(255, 255, 255, 0.9)' : 'var(--purple)'}
              style={{ textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block' }}
            >
              {step.month}
            </Text>
            <Heading
              level={5}
              color={step.featured ? 'var(--light-100)' : 'var(--dark-90)'}
              style={{ marginBottom: 0, lineHeight: 1.25 }}
            >
              {step.name}
            </Heading>
            <Text
              variant="label"
              color={step.featured ? 'rgba(255, 255, 255, 0.85)' : 'var(--dark-60)'}
              style={{ lineHeight: 1.45, display: 'block', marginTop: 6 }}
            >
              {step.work}
            </Text>
            <div
              style={{
                marginTop: 'auto',
                paddingTop: 10,
                borderTop: `1px solid ${step.featured ? 'rgba(255,255,255,0.25)' : PURPLE_BORDER}`,
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Text
                variant="label"
                color={step.featured ? 'var(--light-100)' : 'var(--dark-90)'}
                style={{ fontWeight: 500 }}
              >
                {step.price}
              </Text>
            </div>
          </div>
        ))}
      </div>

      {/* urgency line */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 14px',
          marginBottom: 20,
          background: 'rgba(188, 1, 11, 0.06)',
          border: '1px solid rgba(188, 1, 11, 0.18)',
          borderRadius: 10,
        }}
      >
        <span style={{ color: 'var(--red-70)', flexShrink: 0, display: 'inline-flex' }}>
          <AlertTriangle size={18} />
        </span>
        <Text style={{ fontSize: 14, color: 'var(--dark-90)', lineHeight: 1.5 }}>
          <span style={{ fontWeight: 500 }}>Your competitors are running active campaigns in your zip code right now.</span>
          {' '}Every week without a plan is more ground lost.
        </Text>
      </div>

      {/* CTA row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button variant="primary" size="xl">Book a 30-min call with a strategist →</Button>
        <Button variant="secondary" size="xl">Email me this scorecard</Button>
        <Text variant="label" color="var(--dark-40)">No credit card. No pitch deck.</Text>
      </div>
    </div>
  );
}
