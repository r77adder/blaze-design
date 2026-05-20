import { useEffect, useRef } from 'react';
import ArrowRotateLeft2 from '@/icons/20/ArrowRotateLeft2';
import { Step1Website } from './steps/Step1Website';
import { Step2Loading } from './steps/Step2Loading';
import { Step3Basics } from './steps/Step3Basics';
import { Step4Scorecard } from './steps/Step4Scorecard';
import { Step5Strategy } from './steps/Step5Strategy';
import { Step6Pricing } from './steps/Step6Pricing';
import { Step7Checkout } from './steps/Step7Checkout';
import { useOnboarding } from './onboarding-context';

/**
 * Full-screen onboarding takeover. Mounted by `H2()` ahead of `<Routes>`
 * when `onboarding.active && !onboarding.complete && pathname === '/h2'`.
 * Owns no chrome of its own beyond a top progress bar + skip-out control;
 * each step renders its own headline and body.
 */
export function Onboarding() {
  const { step, skip, open } = useOnboarding();

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
      <ProgressBar step={step} />
      {step > 1 && <RestartButton onRestart={() => open({ reset: true })} />}
      <SkipButton onSkip={skip} />
      <div style={{ paddingTop: 8 }}>
        {step === 1 && <Step1Website />}
        {step === 2 && <Step2Loading />}
        {step === 3 && <Step3Basics />}
        {step === 4 && <Step4Scorecard />}
        {step === 5 && <Step5Strategy />}
        {step === 6 && <Step6Pricing />}
        {step === 7 && <Step7Checkout />}
      </div>
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  const pct = (step / 7) * 100;
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

function RestartButton({ onRestart }: { onRestart: () => void }) {
  return (
    <button
      type="button"
      onClick={onRestart}
      style={{
        position: 'fixed',
        top: 16,
        left: 24,
        zIndex: 6,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 13,
        color: 'var(--dark-60)',
        padding: '6px 10px',
        borderRadius: 6,
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
      <ArrowRotateLeft2 size={14} color="currentColor" />
      Start from beginning
    </button>
  );
}

function SkipButton({ onSkip }: { onSkip: () => void }) {
  return (
    <button
      type="button"
      onClick={onSkip}
      style={{
        position: 'fixed',
        top: 20,
        right: 24,
        zIndex: 6,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 13,
        color: 'var(--dark-60)',
        padding: '6px 10px',
        borderRadius: 6,
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
      Skip onboarding →
    </button>
  );
}
