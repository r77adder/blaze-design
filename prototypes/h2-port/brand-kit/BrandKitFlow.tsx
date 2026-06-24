import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Close from '@/icons/20/Close';
import { useBrandKit } from './brand-kit-context';
import { useDevState } from '../dev-state-context';
import { Step1Style } from './steps/Step1Style';
import { Step2Typeface } from './steps/Step2Typeface';
import { Step3Freedom } from './steps/Step3Freedom';
import { BrandKitSteady } from './BrandKitSteady';

/**
 * Brand Kit route handler — mounted at `/h2/brand-kit`.
 *
 * Behavior:
 *   - The dev panel's per-path Cold/Steady toggle is authoritative: if it
 *     reads 'steady', we always show the steady-state content surface.
 *   - Otherwise we fall back to the user's onboarding-completion flag
 *     (`done` from useBrandKit): false → 3-step setup takeover; true → steady.
 *
 * The takeover keeps its `position: fixed` layout; the steady state lets
 * H2Layout own the sidebar + topbar.
 */
export function BrandKitFlow() {
  const { getState } = useDevState();
  // The per-path dev state is the single source of truth for which view to
  // render. Consumers that need to flip between them (Home "Finalize" CTA,
  // brand-kit setup `finish()`, onboarding completion) explicitly set this
  // state so the flow stays predictable.
  const showSteady = getState('/h2/brand-kit') === 'steady';
  if (showSteady) {
    return <BrandKitSteady />;
  }
  return <BrandKitSetupTakeover />;
}

function BrandKitSetupTakeover() {
  const { step } = useBrandKit();
  const rootRef = useRef<HTMLDivElement>(null);

  // Reset scroll between steps so the next screen always opens at the top.
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
      <CloseButton />
      <div style={{ paddingTop: 16 }}>
        {step === 1 && <Step1Style />}
        {step === 2 && <Step2Typeface />}
        {step === 3 && <Step3Freedom />}
      </div>
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  const pct = (step / 3) * 100;
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

function CloseButton() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate('/h2')}
      aria-label="Close brand kit setup"
      style={{
        position: 'fixed',
        top: 16,
        right: 24,
        zIndex: 6,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        borderRadius: 8,
        color: 'var(--dark-60)',
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
      <Close size={18} color="currentColor" />
    </button>
  );
}
