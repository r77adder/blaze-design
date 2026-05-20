import { useEffect, useState } from 'react';
import { Step1Assistant, type AssistantConfig, DEFAULT_ASSISTANT_CONFIG } from './steps/Step1Assistant';
import { Step2Tools, type IntegrationId } from './steps/Step2Tools';

/**
 * Two-step setup modal for the AI Receptionist. Opened from the SDR cold view's
 * primary CTA. Internal state for current step + assistant config + integration
 * connection state. No localStorage persistence — this is a one-time setup
 * flow, and when the user clicks "Finish setup" on step 2 the parent flips
 * `/h2/sdr`'s dev state to `steady` (so the SDR page reflows to its populated
 * view) and closes the modal.
 *
 * Visual shell: semi-transparent backdrop + centered white panel. We don't use
 * the lib's `Modal.Root` because:
 *   1. Setup is a single instance owned by the cold view (no stacking needs).
 *   2. We want full control over the multi-step layout, sticky footer height,
 *      and the wider panel (~720px) — easier to express inline than via the
 *      lib's `size` enum.
 */

interface AiReceptionistSetupModalProps {
  /** Closes the modal — called by Cancel on step 1, by the underlay press, or
   *  by ESC. Step 2 closes via `onFinish` instead. */
  onClose: () => void;
  /** Called when the user completes step 2. Parent flips the SDR dev state to
   *  `steady` and closes the modal. */
  onFinish: () => void;
}

export function AiReceptionistSetupModal({ onClose, onFinish }: AiReceptionistSetupModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [assistant, setAssistant] = useState<AssistantConfig>(DEFAULT_ASSISTANT_CONFIG);
  const [connected, setConnected] = useState<Set<IntegrationId>>(new Set());

  // ESC closes the modal (mirrors lib Modal behavior).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Lock body scroll while the modal is mounted.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.4)',
        padding: 32,
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="ai-receptionist-setup-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(720px, calc(100vw - 64px))',
          maxHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--light-100)',
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.18)',
        }}
      >
        {step === 1 ? (
          <Step1Assistant
            value={assistant}
            onChange={setAssistant}
            onCancel={onClose}
            onAdvance={() => setStep(2)}
          />
        ) : (
          <Step2Tools
            connected={connected}
            onConnectedChange={setConnected}
            onBack={() => setStep(1)}
            onFinish={onFinish}
          />
        )}
      </div>
    </div>
  );
}
