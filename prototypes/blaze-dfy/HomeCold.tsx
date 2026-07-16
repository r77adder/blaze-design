import { useState } from 'react';
import { Button, Heading, Text } from '@/components';
import { Card, StatusPill } from '@/staging';
import Target5 from '@/icons/20/Target5';
import ArrowRight from '@/icons/20/ArrowRight';
import type { Account } from './lib/types';
import { useDfyState } from './lib/dev-state';
import { useAmView } from './lib/am-view';
import { GrowthEngineReviewFlow } from '../dfy-client/growth-review/GrowthReview';
import { AccessChecklist } from '../dfy-client/growth-review/StepIntegrations';

/**
 * HomeCold, the AM-facing cold state. Mirrors the client's pre-go-live Home:
 * one Growth Engine Review to build, plus the account connections. The AM opens
 * the review in edit mode (Start) to build the scorecard, website, campaigns,
 * and strategy, then submits it to the client for sign-off.
 */
export function HomeCold({ account }: { account: Account; onOpenSection?: (section: string) => void }) {
  const { state, setState } = useDfyState();
  // The review's AM ⇄ Client side is driven by the dev panel's existing switch
  // (see AmViewProvider + DevStatePanel); we report open/closed back to it.
  const { side, setSide, reviewOpen, setReviewOpen } = useAmView();
  // `reviewed` = the client already returned the review with changes. The card
  // flips to "Changes requested" and the review reopens seeded with the notes.
  const reviewed = state === 'reviewed';
  const openReview = () => { setSide('am'); setReviewOpen(true); };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '8px 4px 60px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* section: intro */}
      <div>
        <Heading level={2} style={{ lineHeight: 1.15, letterSpacing: '-0.4px', margin: '0 0 10px' }}>
          {reviewed ? `${account.name} sent back changes.` : `Let’s get ${account.name} live.`}
        </Heading>
        <Text variant="primary" style={{ display: 'block', lineHeight: 1.55, color: 'var(--dark-90)', maxWidth: 560 }}>
          {reviewed
            ? `${account.name} reviewed the Growth Engine and asked for a few changes. Reopen it to see their notes on each step, make the edits, and resubmit.`
            : `Build the Growth Engine Review, connect the accounts, then submit it to ${account.name} for sign-off, then we’ll get them live.`}
        </Text>
      </div>

      {/* section: the Growth Engine Review — the single thing to build */}
      <section>
        <Heading level={3} style={{ margin: '0 0 12px' }}>{reviewed ? 'Back from the client' : 'Ready to build'}</Heading>
        <Card padding="none">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px' }}>
            <span aria-hidden style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: 'var(--dark-2)', color: 'var(--dark-90)' }}>
              <Target5 size={20} color="var(--dark-90)" />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Heading level={5} style={{ margin: 0 }}>Growth Engine Review</Heading>
                {reviewed && <StatusPill tone="warning" size="sm">Changes requested</StatusPill>}
              </div>
              <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 3, lineHeight: 1.45 }}>
                {reviewed
                  ? 'The client left notes on the website, paid ads, strategy, and one article. Open to address them.'
                  : `The competitive scorecard, new website, first paid campaigns, and strategy, all in one flow. Build it, then submit to ${account.name} for review.`}
              </Text>
            </div>
            <Button size="md" endIcon={ArrowRight} onPress={openReview}>{reviewed ? 'Open' : 'Start'}</Button>
          </div>
        </Card>
      </section>

      {/* section: connect the client's accounts (same component as the review's last step) */}
      <section>
        <Heading level={3} style={{ margin: '0 0 12px' }}>Connect the accounts</Heading>
        <AccessChecklist />
      </section>

      {reviewOpen && (
        <GrowthEngineReviewFlow
          mode={side}
          reviewed={reviewed}
          onExit={() => { setReviewOpen(false); setSide('am'); }}
          onComplete={() => {
            // Submitting to the client returns the review with their changes:
            // flip the workspace into the `reviewed` demo state.
            setReviewOpen(false);
            setSide('am');
            if (!reviewed) setState('reviewed');
          }}
        />
      )}
    </div>
  );
}
