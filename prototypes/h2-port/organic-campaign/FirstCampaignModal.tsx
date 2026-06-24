import { useEffect } from 'react';
import { Button } from '@/components';
import Close from '@/icons/20/Close';
import { useFirstCampaign } from './first-campaign-context';
import { Step1Details } from './steps/Step1Details';
import { Step2Channels } from './steps/Step2Channels';
import { Step3ContentMix } from './steps/Step3ContentMix';
import { Step4Generating } from './steps/Step4Generating';
import { Step5ReviewTopics } from './steps/Step5ReviewTopics';
import { Step6SourceMaterials } from './steps/Step6SourceMaterials';
import { Step7Ready } from './steps/Step7Ready';

/**
 * Modal shell for the 7-step first-campaign-creation flow. Renders three
 * regions: a top header with a single X close button, a scrollable step body,
 * and a sticky footer with Back + Continue. Step 4 is the auto-advancing
 * loading state and renders no footer.
 *
 * Mount as a sibling at the route level — it lives outside any provider that
 * resets on cold→steady transitions, so flipping the dev state at finish()
 * still lets the modal close cleanly before the route re-renders.
 */
export function FirstCampaignModal() {
  const { open, step, back, next, finish, close } = useFirstCampaign();

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open) return null;

  const isLoading = step === 4;
  const continueLabel =
    step === 3 ? 'Start with this amount' : step === 7 ? 'Continue' : 'Continue';

  const handleContinue = () => {
    if (step === 7) {
      finish();
      return;
    }
    next();
  };

  const handleBack = () => {
    if (step === 1) {
      close();
      return;
    }
    back();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create your first campaign"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
      }}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(1100px, calc(100vw - 64px))',
          height: 'min(800px, calc(100vh - 64px))',
          background: 'var(--light-100)',
          borderRadius: 18,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.32)',
        }}
      >
        {/* Header: just a close button in the top-right */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '16px 20px 0',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 6,
              cursor: 'pointer',
              color: 'var(--dark-60)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
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
            <Close size={18} color="currentColor" />
          </button>
        </div>

        {/* Scrollable body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 56px 32px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {step === 1 && <Step1Details />}
          {step === 2 && <Step2Channels />}
          {step === 3 && <Step3ContentMix />}
          {step === 4 && <Step4Generating />}
          {step === 5 && <Step5ReviewTopics />}
          {step === 6 && <Step6SourceMaterials />}
          {step === 7 && <Step7Ready />}
        </div>

        {/* Footer */}
        {!isLoading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 32px',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={handleBack}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '8px 4px',
                color: 'var(--dark-90)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 14,
                letterSpacing: '0.28px',
              }}
            >
              {step === 1 ? 'Close' : 'Back'}
            </button>

            <Button variant="primary" size="lg" onPress={handleContinue}>
              {continueLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
