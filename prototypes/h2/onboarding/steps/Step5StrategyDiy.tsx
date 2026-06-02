import { useState, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Heading, Text } from '@/components';
import type { IconProps } from '@/icons/Types';
import ArrowRight from '@/icons/20/ArrowRight';
import { useToast } from '@/staging';
import { useDevState } from '../../dev-state-context';
import { useBrandKit } from '../../brand-kit/brand-kit-context';
import { ExpertUpsellBanner } from '../../pages/ExpertUpsellBanner';
import { useOnboarding } from '../onboarding-context';
import { DIY_PLANS, pickDiyPlan } from '../pricing-data';
import {
  DIY_ADDABLE_FEATURES,
  DFY_ONLY_FEATURES,
  type DfyFeatureId,
} from '../diy-features';
import { COLD_ON_FINISH } from './Step7Checkout';

/**
 * DIY step 5 — feature selection, split into two groups:
 *
 *   1. "Build your plan" — features the user can self-serve onto a Starter
 *      (≤3) or Growth (4+) plan. Toggle on/off; the whole card is the target.
 *   2. "Done-for-you only" — features that require a Done-For-You engagement.
 *      These don't toggle. Selecting ANY of them flips the footer to a single
 *      "Talk to a Strategist" CTA — you can't self-serve checkout with one
 *      selected.
 *
 * If the user keeps only group-1 features, the footer offers two paths:
 *   - "Start your trial with {Starter|Growth} Plan" → Home cold (7-day trial)
 *   - "Continue to checkout" → plan selection (pricing) → checkout
 */
export function Step5StrategyDiy() {
  const { diyFeatures, toggleDiyFeature, next, back, finish } = useOnboarding();
  const { setState: setDevState } = useDevState();
  const { reset: resetBrandKit } = useBrandKit();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // DFY-only interest is local to this screen — it diverts the flow but isn't
  // part of the (self-serve) plan, so it doesn't need to persist.
  const [dfyInterest, setDfyInterest] = useState<Set<DfyFeatureId>>(() => new Set());
  const toggleDfyInterest = (id: DfyFeatureId) =>
    setDfyInterest((prev) => {
      const nextSet = new Set(prev);
      if (nextSet.has(id)) nextSet.delete(id);
      else nextSet.add(id);
      return nextSet;
    });

  const addableCount = diyFeatures.length;
  const wantsDfy = dfyInterest.size > 0;
  const tier = pickDiyPlan(addableCount);
  const plan = DIY_PLANS[tier];

  const handleStartTrial = () => {
    // Flip every reachable feature path to cold so the user lands in a fresh
    // workspace, then finish onboarding + navigate Home.
    COLD_ON_FINISH.forEach((path) => setDevState(path, 'cold'));
    resetBrandKit();
    finish();
    navigate('/h2');
    showToast({ message: 'Trial started — 7 days, no card needed.' });
  };

  const handleTalkToStrategist = () => {
    showToast({
      message: 'Connecting you with a strategist to set up Done-For-You…',
    });
  };

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
        style={{ display: 'block', color: 'var(--dark-60)', fontSize: 16, marginBottom: 40 }}
      >
        Self-serve plans are priced per tier, not per feature — keep 3 or fewer for
        Starter, 4 or more for Growth. You can turn anything on later.
      </Text>

      {/* Section 1 — addable / self-serve */}
      <SectionHeader
        title="Build your plan"
        subtitle="Add any of these to a self-serve Starter or Growth plan."
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 12,
          marginBottom: 40,
        }}
      >
        {DIY_ADDABLE_FEATURES.map((f) => (
          <AddableCard
            key={f.id}
            label={f.label}
            description={f.description}
            icon={f.icon}
            selected={diyFeatures.includes(f.id)}
            onToggle={() => toggleDiyFeature(f.id)}
          />
        ))}
      </div>

      {/* Section 2 — Done-for-you only */}
      <SectionHeader
        title="Done-for-you only"
        subtitle="Our team runs these for you — available on a Done-For-You engagement."
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}
      >
        {DFY_ONLY_FEATURES.map((f) => (
          <DfyCard
            key={f.id}
            label={f.label}
            description={f.description}
            icon={f.icon}
            selected={dfyInterest.has(f.id)}
            onSelect={() => toggleDfyInterest(f.id)}
          />
        ))}
      </div>

      {/* Upsell banner — sits under the Done-for-you features */}
      <ExpertUpsellBanner
        heading="Want us to run all of it for you?"
        body="Done-For-You puts a growth specialist on your account — every channel above, managed end-to-end."
        ctaLabel="Talk to a strategist"
        onTalk={handleTalkToStrategist}
      />

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

        {wantsDfy ? (
          // A Done-for-you feature is selected → only path forward is a strategist.
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
            <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
              {dfyInterest.size} done-for-you feature{dfyInterest.size === 1 ? '' : 's'} selected
            </Text>
            <Button variant="primary" size="lg" onPress={handleTalkToStrategist} endIcon={ArrowRight}>
              Talk to a Strategist
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
              {addableCount} feature{addableCount === 1 ? '' : 's'} selected
            </Text>
            <Button
              variant="secondary"
              size="lg"
              isDisabled={addableCount === 0}
              onPress={next}
            >
              Continue to checkout
            </Button>
            <Button
              variant="primary"
              size="lg"
              isDisabled={addableCount === 0}
              onPress={handleStartTrial}
            >
              Start your trial with {plan.label} Plan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Heading level={4} style={{ margin: 0 }}>
        {title}
      </Heading>
      <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>
        {subtitle}
      </Text>
    </div>
  );
}

function FeatureIconChip({ icon: Icon }: { icon: ComponentType<IconProps> }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 8,
        background: 'var(--dark-4)',
        color: 'var(--dark-90)',
        flexShrink: 0,
      }}
    >
      <Icon size={20} color="var(--dark-90)" />
    </span>
  );
}

function AddableCard({
  label,
  description,
  icon,
  selected,
  onToggle,
}: {
  label: string;
  description: string;
  icon: ComponentType<IconProps>;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={selected}
      aria-label={`${label} — ${selected ? 'on' : 'off'}`}
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: 16,
        background: 'var(--light-100)',
        border: `1px solid ${selected ? 'var(--dark-15)' : 'var(--dark-8)'}`,
        borderRadius: 12,
        cursor: 'pointer',
        textAlign: 'left',
        font: 'inherit',
        color: 'inherit',
        width: '100%',
        transition: 'border-color 160ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = selected ? 'var(--dark-40)' : 'var(--dark-15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = selected ? 'var(--dark-15)' : 'var(--dark-8)';
      }}
    >
      <FeatureIconChip icon={icon} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Heading level={5} style={{ margin: 0, lineHeight: 1.3 }}>
          {label}
        </Heading>
        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4, lineHeight: 1.45 }}>
          {description}
        </Text>
      </div>
      <span
        aria-hidden
        style={{ flexShrink: 0, opacity: selected ? 1 : 0.4, transition: 'opacity 160ms ease' }}
      >
        <ToggleVisual on={selected} />
      </span>
    </button>
  );
}

function DfyCard({
  label,
  description,
  icon,
  selected,
  onSelect,
}: {
  label: string;
  description: string;
  icon: ComponentType<IconProps>;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`${label} — done-for-you`}
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: 16,
        background: selected ? 'rgba(1, 121, 207, 0.06)' : 'var(--light-100)',
        border: `1px solid ${selected ? 'var(--status-posting)' : 'var(--dark-8)'}`,
        borderRadius: 12,
        cursor: 'pointer',
        textAlign: 'left',
        font: 'inherit',
        color: 'inherit',
        width: '100%',
        transition: 'border-color 160ms ease, background 160ms ease',
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.borderColor = 'var(--dark-15)';
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.borderColor = 'var(--dark-8)';
      }}
    >
      <FeatureIconChip icon={icon} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Heading level={5} style={{ margin: 0, lineHeight: 1.3 }}>
          {label}
        </Heading>
        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4, lineHeight: 1.45 }}>
          {description}
        </Text>
      </div>
    </button>
  );
}

function ToggleVisual({ on }: { on: boolean }) {
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: 44,
        height: 24,
        borderRadius: 999,
        background: on ? 'var(--dark-90)' : 'var(--dark-15)',
        transition: 'background-color 160ms ease',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: on ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'var(--light-100)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
          transition: 'left 160ms ease',
        }}
      />
    </span>
  );
}
