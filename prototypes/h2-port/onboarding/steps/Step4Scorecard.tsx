import { useState } from 'react';
import { Button, Text } from '@/components';
import ArrowRight from '@/icons/20/ArrowRight';
import { ScanView } from '../../../scorecard/ScanView';
import { ResultsView } from '../../../scorecard/ResultsView';
import { useOnboarding } from '../onboarding-context';

/**
 * Step 4 — Business Scorecard. Two phases:
 *   1. `scan` — animated `<ScanView>` lifted from /scorecard
 *   2. `results` — `<ResultsView>` lifted from /scorecard, with every CTA
 *      (sidebar, recommendation card, sticky footer) routed to `next()`,
 *      which advances to Step 5 (Fixes & Gaps).
 * Only the results phase shows the sticky footer.
 */
export function Step4Scorecard() {
  const { next, back } = useOnboarding();
  const [phase, setPhase] = useState<'scan' | 'results'>('scan');

  if (phase === 'scan') {
    return (
      <div style={{ minHeight: 'calc(100vh - 3px)' }}>
        <ScanView onComplete={() => setPhase('results')} />
      </div>
    );
  }

  return (
    <div>
      <ResultsView onEditInputs={back} />

      {/* Sticky footer CTA — kept from the previous Step 4. */}
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
