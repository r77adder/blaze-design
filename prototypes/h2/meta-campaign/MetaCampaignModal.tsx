import { useMemo } from 'react';
import { Modal } from '@/components';
import MetaBrand from '@/icons/20/MetaBrand';
import { useMetaCampaign } from './meta-campaign-context';
import { Stage1Campaign } from './steps/Stage1Campaign';
import { Stage2AdSet } from './steps/Stage2AdSet';
import { Stage3Ads } from './steps/Stage3Ads';
import { Stage4Review } from './steps/Stage4Review';

/** Progress-rail labels, one per stage. Indexes align with step - 1. */
const STAGES = ['Campaign', 'Ad set', 'Ads', 'Review'];

/**
 * AI-guided Meta campaign wizard, built on the vetted Modal component
 * (Modal.Root + Header/Content/Footer) as a full-viewport takeover.
 *
 * Layout: the Root is a full-height flex column. Header + Content live inside
 * one scroll region, so the header scrolls away with the body; the Footer
 * sits outside that region as a flex child, pinned to the bottom of the
 * viewport. The body stretches the full viewport width before it scrolls.
 *
 * Open/close/step are driven by the meta-campaign context, so the modal
 * renders only while `open`.
 */
export function MetaCampaignModal() {
  const {
    open,
    step,
    close,
    next,
    back,
    finish,
    concepts,
    launchBlocked,
    pendingSafetyNet,
  } = useMetaCampaign();

  const includedCount = useMemo(
    () => concepts.reduce((sum, c) => sum + c.variants.filter((v) => v.included).length, 0),
    [concepts],
  );

  if (!open) return null;

  const continueLabel =
    step === 3 ? 'Continue to review' : step === 4 ? 'Launch campaign' : 'Continue';

  const continueDisabled =
    (step === 3 && includedCount === 0) || (step === 4 && launchBlocked);

  const handleContinue = () => {
    if (step === 4) {
      finish(pendingSafetyNet ?? undefined);
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

  const activeStage = step - 1;

  return (
    <Modal.Root
      size="fullscreen"
      height="100vh"
      onClose={close}
      onPressOutside={close}
      aria-label="Create a Meta campaign"
    >
      {/* Scroll region — header + body scroll together so the header scrolls
          away; the footer (below, outside this region) stays pinned. Kept a
          plain block (not flex) so Modal.Content grows to its content height
          and the whole region scrolls, rather than Content scrolling alone. */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
        }}
      >
        <Modal.Header onClose={close} compact={false}>
          {/* Meta + Blaze framing on the left, 4-stage progress rail centered. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <span style={{ display: 'inline-flex' }}>
                <MetaBrand size={20} />
              </span>
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark-90)' }}>
                New Meta campaign
              </span>
            </div>

            {/* Progress rail */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, margin: '0 auto' }}>
              {STAGES.map((label, i) => {
                const done = i < activeStage;
                const current = i === activeStage;
                return (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 13,
                        fontWeight: current ? 500 : 400,
                        color: current
                          ? 'var(--dark-90)'
                          : done
                            ? 'var(--dark-60)'
                            : 'var(--dark-40)',
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          background: current
                            ? 'var(--dark-90)'
                            : done
                              ? 'var(--status-approved)'
                              : 'var(--dark-8)',
                          color: current || done ? 'var(--light-100)' : 'var(--dark-60)',
                        }}
                      >
                        {done ? '✓' : i + 1}
                      </span>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal.Header>

        <Modal.Content compact={false}>
          {step === 1 && <Stage1Campaign />}
          {step === 2 && <Stage2AdSet />}
          {step === 3 && <Stage3Ads />}
          {step === 4 && <Stage4Review />}
        </Modal.Content>
      </div>

      {/* Footer — pinned to the bottom of the viewport (outside the scroll region). */}
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={handleBack}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={handleContinue} isDisabled={continueDisabled}>
            {continueLabel}
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}
