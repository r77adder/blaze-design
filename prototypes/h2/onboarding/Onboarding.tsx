import { useEffect, useRef } from 'react';
import ArrowRotateLeft2 from '@/icons/20/ArrowRotateLeft2';
import { Step1Website } from './steps/Step1Website';
import { Step2Loading } from './steps/Step2Loading';
import { Step3Basics } from './steps/Step3Basics';
import { Step4Scorecard } from './steps/Step4Scorecard';
import { Step5Strategy } from './steps/Step5Strategy';
import { Step5StrategyDiy } from './steps/Step5StrategyDiy';
import { Step6Pricing } from './steps/Step6Pricing';
import { Step6PricingDiy } from './steps/Step6PricingDiy';
import { Step7Checkout } from './steps/Step7Checkout';
import { useOnboarding, type OnboardingTrack } from './onboarding-context';

/**
 * Full-screen onboarding takeover. Mounted by `H2()` ahead of `<Routes>`
 * when `onboarding.active && !onboarding.complete && pathname === '/h2'`.
 * Owns no chrome of its own beyond a top progress bar + skip-out control;
 * each step renders its own headline and body.
 */
export function Onboarding() {
  const { step, stepId, totalSteps, track, setTrack, skip, open } = useOnboarding();

  // Scroll to top on step change so the next screen always opens fresh.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    rootRef.current?.scrollTo({ top: 0 });
  }, [step]);

  return (
    <div
      ref={rootRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--light-100)',
        overflowY: 'auto',
        zIndex: 100,
      }}
    >
      <ProgressBar step={step} total={totalSteps} />
      <PrototypeBar
        canRestart={step > 1}
        onRestart={() => open({ reset: true })}
        track={track}
        onSetTrack={setTrack}
        onSkip={skip}
      />
      <div style={{ paddingTop: 8 }}>
        {stepId === 'website' && <Step1Website />}
        {stepId === 'loading' && <Step2Loading />}
        {stepId === 'basics' && <Step3Basics />}
        {stepId === 'scorecard' && <Step4Scorecard />}
        {stepId === 'strategy-dfy' && <Step5Strategy />}
        {stepId === 'strategy-diy' && <Step5StrategyDiy />}
        {stepId === 'pricing-dfy' && <Step6Pricing />}
        {stepId === 'pricing-diy' && <Step6PricingDiy />}
        {stepId === 'checkout' && <Step7Checkout />}
      </div>
    </div>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = total > 0 ? (step / total) * 100 : 0;
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 5,
        height: 3,
        background: 'var(--dark-4)',
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: 'var(--dark-90)',
          transition: 'width 280ms ease',
        }}
      />
    </div>
  );
}

/**
 * Single prototype-only control bar — NOT part of the onboarding visual
 * design. Floats top-right and bundles every scaffolding control designers
 * need while running the takeover:
 *   • Restart (start from beginning — only shown past step 1)
 *   • Flow switch (DFY ↔ DIY, swappable at any step)
 *   • Skip (close the takeover, leave selections as-is)
 *
 * Styled to blend with the H2 prototype's surface chrome: white background,
 * subtle dark-8 border, soft shadow, sentence-case labels. The active flow
 * uses a quiet dark-4 chip instead of a high-contrast badge so the control
 * reads as a peripheral tool, not a screaming dev panel.
 */
function PrototypeBar({
  canRestart,
  onRestart,
  track,
  onSetTrack,
  onSkip,
}: {
  canRestart: boolean;
  onRestart: () => void;
  track: OnboardingTrack;
  onSetTrack: (t: OnboardingTrack) => void;
  onSkip: () => void;
}) {
  return (
    <div
      role="group"
      aria-label="Prototype controls"
      style={{
        position: 'fixed',
        top: 16,
        right: 24,
        zIndex: 6,
        display: 'inline-flex',
        alignItems: 'stretch',
        padding: 4,
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 10,
        boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
        fontFamily: 'inherit',
      }}
    >
      {canRestart && (
        <>
          <BarButton onPress={onRestart} ariaLabel="Start from beginning">
            <ArrowRotateLeft2 size={14} color="currentColor" />
            <span>Restart</span>
          </BarButton>
          <BarDivider />
        </>
      )}

      <div
        role="group"
        aria-label="Prototype flow switch"
        style={{ display: 'inline-flex', alignItems: 'center', padding: '0 2px' }}
      >
        <FlowChip selected={track === 'dfy'} onPress={() => onSetTrack('dfy')}>
          DFY
        </FlowChip>
        <FlowChip selected={track === 'diy'} onPress={() => onSetTrack('diy')}>
          DIY
        </FlowChip>
      </div>

      <BarDivider />

      <BarButton onPress={onSkip} ariaLabel="Skip onboarding">
        <span>Skip</span>
        <span aria-hidden>→</span>
      </BarButton>
    </div>
  );
}

function BarButton({
  onPress,
  children,
  ariaLabel,
}: {
  onPress: () => void;
  children: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        background: 'transparent',
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 13,
        color: 'var(--dark-60)',
        transition: 'background 120ms ease, color 120ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--dark-4)';
        e.currentTarget.style.color = 'var(--dark-90)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--dark-60)';
      }}
    >
      {children}
    </button>
  );
}

function FlowChip({
  selected,
  onPress,
  children,
}: {
  selected: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-pressed={selected}
      style={{
        padding: '4px 10px',
        background: selected ? 'var(--dark-4)' : 'transparent',
        color: selected ? 'var(--dark-90)' : 'var(--dark-60)',
        border: 'none',
        borderRadius: 6,
        fontFamily: 'inherit',
        fontSize: 12,
        fontWeight: selected ? 500 : 400,
        letterSpacing: '0.2px',
        cursor: 'pointer',
        transition: 'background 120ms ease, color 120ms ease',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.color = 'var(--dark-90)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.color = 'var(--dark-60)';
        }
      }}
    >
      {children}
    </button>
  );
}

function BarDivider() {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: 1,
        background: 'var(--dark-8)',
        margin: '4px 4px',
        alignSelf: 'stretch',
      }}
    />
  );
}
