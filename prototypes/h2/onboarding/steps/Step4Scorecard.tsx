import { Button, Heading, Text } from '@/components';
import ArrowRight from '@/icons/20/ArrowRight';
import { BusinessScorecardBody, HeroScoreRing } from '../../pages/BusinessScorecard';
import { OVERALL_DELTA, OVERALL_SCORE } from '../../business-scorecard-data';
import { useOnboarding } from '../onboarding-context';

/**
 * Step 4 — promotional Business Scorecard. Reuses the existing
 * <BusinessScorecardBody> in `promotional` mode: it skips its own HeroCard
 * (we render a consolidated hero here) and suppresses per-section CTAs
 * (the sticky footer below owns the next action).
 */
export function Step4Scorecard() {
  const { profile, next, back } = useOnboarding();
  return (
    <div style={{ minHeight: 'calc(100vh - 3px)', paddingBottom: 100 }}>
      {/* Unified promo hero: chip + headline + score ring + climb message,
          all sitting on one gradient surface. */}
      <div
        style={{
          background:
            'linear-gradient(135deg, rgba(124, 92, 252, 0.08) 0%, rgba(252, 183, 40, 0.08) 100%)',
          borderBottom: '1px solid var(--dark-8)',
          padding: '48px 0 40px',
        }}
      >
        <div
          style={{
            maxWidth: 920,
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 48,
            flexWrap: 'wrap',
          }}
        >
          {/* Left: copy column */}
          <div style={{ flex: '1 1 460px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Heading
              level={1}
              style={{
                fontSize: 36,
                letterSpacing: '-0.5px',
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              Here's where {profile.name} stands today.
            </Heading>
            <Text
              variant="primary"
              style={{
                display: 'block',
                fontSize: 17,
                color: 'var(--dark-90)',
                lineHeight: 1.55,
              }}
            >
              Reputation and SEO are your strongest plays. Paid social and AEO are wide open — Blaze closes both inside 90 days.
            </Text>
          </div>

          {/* Right: score ring */}
          <div
            style={{
              flex: '0 0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Text
              variant="metadata"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--dark-60)',
                letterSpacing: '0.2px',
              }}
            >
              Business Score
            </Text>
            <HeroScoreRing value={OVERALL_SCORE} delta={OVERALL_DELTA} promotional />
          </div>
        </div>
      </div>

      <BusinessScorecardBody promotional />

      {/* Sticky footer CTA */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 24px',
          background: 'var(--light-100)',
          borderTop: '1px solid var(--dark-8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          zIndex: 4,
          boxShadow: '0 -4px 16px rgba(0,0,0,0.04)',
        }}
      >
        <button
          type="button"
          onClick={back}
          style={{
            background: 'transparent',
            border: 'none',
            fontFamily: 'inherit',
            fontSize: 14,
            color: 'var(--dark-90)',
            cursor: 'pointer',
            padding: '8px 12px',
          }}
        >
          Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Text variant="secondary" style={{ color: 'var(--dark-60)', display: 'none' }}>
            Ready to see how Blaze closes these gaps?
          </Text>
          <Button variant="primary" size="lg" onPress={next} endIcon={ArrowRight}>
            See how Blaze fixes this
          </Button>
        </div>
      </div>
    </div>
  );
}
