import { useNavigate } from 'react-router-dom';
import { Button, Heading, Text } from '@/components';
import ArrowRight from '@/icons/20/ArrowRight';
import Check2 from '@/icons/20/Check2';
import { useDevState } from '../../dev-state-context';
import { useBrandKit } from '../../brand-kit/brand-kit-context';
import { ExpertUpsellBanner } from '../../pages/ExpertUpsellBanner';
import { StatusPill, useToast } from '@/staging';
import { useOnboarding, type Term } from '../onboarding-context';
import { diyFeatureById, type DiyFeatureId } from '../diy-features';
import {
  DIY_PLANS,
  DIY_TERMS,
  DIY_TERM_CARD_LABEL,
  diyDiscountPct,
  fmtUsd,
  pickDiyPlan,
} from '../pricing-data';
import { COLD_ON_FINISH } from './Step7Checkout';

/**
 * DIY pricing step. Five term cards (Monthly / 3 / 6 / 12 / 18) priced flat
 * per plan tier, a "what's included" rundown with no per-feature pricing
 * (DIY plans don't bill per feature), a competitive-savings strip, and the
 * ExpertUpsellBanner styled as the DFY upsell ("we can run it for you").
 *
 * Footer carries the two CTAs from the spec:
 *   - Primary  → "Start your 7-day trial" → lands on /h2 cold home, finishes onboarding.
 *   - Secondary → "Continue to checkout" → step 7 (DIY checkout variant).
 */
export function Step6PricingDiy() {
  const { diyFeatures, term, setTerm, next, back, finish } = useOnboarding();
  const { setState: setDevState } = useDevState();
  const { reset: resetBrandKit } = useBrandKit();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const tier = pickDiyPlan(diyFeatures.length);
  const plan = DIY_PLANS[tier];
  const monthly = plan.monthlyByTerm[term];
  const termMonths = term === 1 ? 1 : term;
  const termTotal = monthly * termMonths;

  const handleStartTrial = () => {
    // Flip every reachable feature path into its cold view so the user lands
    // in a fresh-out-of-onboarding workspace, then finish + navigate.
    COLD_ON_FINISH.forEach((path) => setDevState(path, 'cold'));
    resetBrandKit();
    finish();
    navigate('/h2');
    showToast({ message: 'Trial started — 7 days, no card needed.' });
  };

  return (
    <div style={{ padding: '64px 24px 140px', maxWidth: 1040, margin: '0 auto' }}>
      <Heading
        level={1}
        style={{ fontSize: 32, letterSpacing: '-0.4px', lineHeight: 1.2, marginBottom: 8 }}
      >
        Your {plan.label} plan
      </Heading>
      <Text
        variant="primary"
        style={{ display: 'block', color: 'var(--dark-60)', fontSize: 16, marginBottom: 32 }}
      >
        {plan.description} Pick a term — longer terms unlock a deeper discount.
      </Text>

      {/* Term selector — 5 cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 12,
          marginBottom: 32,
        }}
      >
        {DIY_TERMS.map((t) => (
          <TermCard
            key={t}
            term={t}
            selected={term === t}
            monthlyAtTerm={plan.monthlyByTerm[t]}
            discountPct={diyDiscountPct(plan, t)}
            termTotal={(t === 1 ? 1 : t) * plan.monthlyByTerm[t]}
            onPress={() => setTerm(t)}
          />
        ))}
      </div>

      {/* What's included */}
      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 14,
          overflow: 'hidden',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--dark-8)',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 24,
          }}
        >
          <div>
            <Heading level={4}>What's included</Heading>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>
              {diyFeatures.length} feature{diyFeatures.length === 1 ? '' : 's'} on the {plan.label} plan
            </Text>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 28, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.4px' }}>
                {fmtUsd(monthly)}
              </span>
              <span style={{ fontSize: 13, color: 'var(--dark-60)' }}>/ mo</span>
            </div>
            <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-40)', fontSize: 12, marginTop: 2 }}>
              {term === 1
                ? 'Billed monthly, cancel any time'
                : `${fmtUsd(termTotal)} total over ${term} months`}
            </Text>
          </div>
        </div>
        <div>
          {diyFeatures.map((id) => (
            <IncludedRow key={id} featureId={id} />
          ))}
        </div>
      </div>

      {/* Competitive savings strip */}
      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 14,
          padding: '20px 24px',
          marginBottom: 24,
        }}
      >
        <Heading level={5} style={{ marginBottom: 12 }}>
          What you'd pay elsewhere
        </Heading>
        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginBottom: 16 }}>
          The same coverage stitched together from other tools — or a human running it for you.
        </Text>
        <div style={{ display: 'grid' }}>
          {plan.competitiveSavings.map((c, i) => {
            const savings = Math.max(0, c.theyChargeMonthly - monthly);
            const pct = Math.round((savings / c.theyChargeMonthly) * 100);
            return (
              <div
                key={c.competitor}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  alignItems: 'center',
                  gap: 16,
                  padding: '14px 0',
                  borderTop: i === 0 ? 'none' : '1px solid var(--dark-4)',
                }}
              >
                <Text variant="primary" style={{ color: 'var(--dark-90)' }}>
                  {c.competitor}
                </Text>
                <Text
                  variant="metadata"
                  style={{
                    color: 'var(--dark-60)',
                    fontSize: 13,
                    fontVariantNumeric: 'tabular-nums',
                    textDecoration: 'line-through',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {fmtUsd(c.theyChargeMonthly)}/mo
                </Text>
                <StatusPill tone="success" size="md">
                  Save {fmtUsd(savings)}/mo · {pct}% off
                </StatusPill>
              </div>
            );
          })}
        </div>
      </div>

      {/* DFY upsell — uses the recurring ExpertUpsellBanner pattern. */}
      <div style={{ marginBottom: 24 }}>
        <ExpertUpsellBanner
          heading="Want us to run it for you?"
          body="Switch to Done For You — our growth specialist owns every channel end-to-end."
          ctaLabel="Talk to a growth specialist"
          onTalk={() => showToast({ message: 'Connecting you with a growth specialist…' })}
        />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
            {fmtUsd(monthly)}/mo · {DIY_TERM_CARD_LABEL[term]}
          </Text>
          <Button variant="secondary" size="lg" onPress={next} endIcon={ArrowRight}>
            Continue to checkout
          </Button>
          <Button variant="primary" size="lg" onPress={handleStartTrial}>
            Start your 7-day trial
          </Button>
        </div>
      </div>
    </div>
  );
}

function TermCard({
  term,
  selected,
  monthlyAtTerm,
  discountPct,
  termTotal,
  onPress,
}: {
  term: Term;
  selected: boolean;
  monthlyAtTerm: number;
  discountPct: number;
  termTotal: number;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        position: 'relative',
        textAlign: 'left',
        padding: '18px 16px 16px',
        background: 'var(--light-100)',
        border: `1.5px solid ${selected ? 'var(--dark-90)' : 'var(--dark-8)'}`,
        borderRadius: 14,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'border-color 120ms ease, box-shadow 120ms ease',
        boxShadow: selected ? '0 6px 16px rgba(0,0,0,0.05)' : 'none',
      }}
      aria-pressed={selected}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--dark-90)',
          marginBottom: 8,
        }}
      >
        {DIY_TERM_CARD_LABEL[term]}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 26, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.4px' }}>
          {fmtUsd(monthlyAtTerm)}
        </span>
        <span style={{ fontSize: 13, color: 'var(--dark-60)' }}>/mo</span>
      </div>
      <Text
        variant="metadata"
        style={{
          display: 'block',
          color: 'var(--dark-40)',
          fontSize: 12,
          marginTop: 6,
          minHeight: 16,
        }}
      >
        {term === 1 ? ' ' : `${fmtUsd(termTotal)} total`}
      </Text>
      {discountPct > 0 && (
        <div style={{ marginTop: 10 }}>
          <StatusPill tone="success" size="sm">
            {discountPct}% off
          </StatusPill>
        </div>
      )}
    </button>
  );
}

function IncludedRow({ featureId }: { featureId: DiyFeatureId }) {
  const feature = diyFeatureById(featureId);
  if (!feature) return null;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '24px 1fr',
        gap: 16,
        alignItems: 'flex-start',
        padding: '14px 24px',
        borderBottom: '1px solid var(--dark-4)',
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'rgba(4,175,0,0.12)',
          color: '#04af00',
          marginTop: 2,
        }}
      >
        <Check2 size={14} color="#04af00" />
      </span>
      <div style={{ minWidth: 0 }}>
        <Text variant="smallList" style={{ color: 'var(--dark-90)', fontWeight: 500 }}>
          {feature.label}
        </Text>
        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 2 }}>
          {feature.description}
        </Text>
      </div>
    </div>
  );
}
