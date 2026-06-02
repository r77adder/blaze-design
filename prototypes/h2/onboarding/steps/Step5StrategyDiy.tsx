import { Button, Heading, Text } from '@/components';
import ArrowRight from '@/icons/20/ArrowRight';
import { ALL_TOOLS } from '../../tools-context';
import { useOnboarding } from '../onboarding-context';
import { DIY_PLANS, pickDiyPlan } from '../pricing-data';
import { FeatureCard } from './Step5Strategy';

/**
 * DIY variant of step 5 (feature selection). Same card grid as DFY, but the
 * footer doesn't talk about per-feature pricing — it tells the user which
 * self-serve plan tier their current selection puts them on (Starter for ≤3
 * features, Growth for 4+), and the primary CTA reflects the tier.
 *
 * The pricing math itself lives on the next step; here we only preview the
 * tier so the user understands what their selection implies.
 */
export function Step5StrategyDiy() {
  const { selectedTools, toggleTool, next, back, profile } = useOnboarding();
  const selectedCount = selectedTools.length;
  const tier = pickDiyPlan(selectedCount);
  const plan = DIY_PLANS[tier];

  return (
    <div style={{ padding: '64px 24px 140px', maxWidth: 900, margin: '0 auto' }}>
      <Heading
        level={1}
        style={{ fontSize: 32, letterSpacing: '-0.4px', lineHeight: 1.2, marginBottom: 8 }}
      >
        Pick the features you'll actually use.
      </Heading>
      <Text
        variant="primary"
        style={{ display: 'block', color: 'var(--dark-60)', fontSize: 16, marginBottom: 32 }}
      >
        Self-serve plans are priced per tier, not per feature — keep 3 or fewer for
        Starter, 4 or more for Growth. You can turn anything on later.
      </Text>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        {ALL_TOOLS.map((id) => (
          <FeatureCard
            key={id}
            id={id}
            selected={selectedTools.includes(id)}
            onToggle={() => toggleTool(id)}
          />
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '14px 24px',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
            {selectedCount} feature{selectedCount === 1 ? '' : 's'} selected
          </Text>
          <Button
            variant="primary"
            size="lg"
            isDisabled={selectedCount === 0}
            onPress={next}
            endIcon={ArrowRight}
          >
            Continue with {plan.label} plan
          </Button>
        </div>
      </div>

      {/* Helper line under the grid (so the empty-state CTA isn't a surprise) */}
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
          {selectedCount === 0
            ? 'Pick at least one feature to continue.'
            : `Heads up — your selection covers ${selectedCount} feature${
                selectedCount === 1 ? '' : 's'
              } for ${profile.name}.`}
        </Text>
      </div>
    </div>
  );
}

