import { useEffect } from 'react';
import { ReviewProvider, useReview } from './review-lib/review';
import { GRAIN_ACCOUNT } from './review-lib/account';
import { ClientShell, BackTitle } from './shell';
import { ClientReview } from './ReviewStrategy';
import { useClientState } from './dev-state';

/* ─── dfy-client route export + seed ─────────────────────────────────────────
 * Same pattern as ReviewStrategy.tsx: PR97 starts every packet as 'draft', so
 * a tiny mount effect shares the goals packet before rendering ClientReview.
 * ClientReview itself is phase-generic, no goals-specific rendering needed. */
function GoalsReviewBody() {
  const { packet, share, setItem, feedback } = useReview();
  const { state } = useClientState();
  useEffect(() => {
    if (packet('goals') === 'draft') share('goals');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Home's "Mixed" state tells the client they already asked for changes on
  // their goals and are waiting on a reply, seed that same request here so
  // the section it applies to (and the note itself) are visible on the page.
  useEffect(() => {
    if (state === 'mixed' && feedback('goals').plan === undefined) {
      setItem('goals', 'plan', {
        status: 'changes',
        comment: "Can we swap Paid Search for more Local SEO for now? We're not ready to commit ad spend yet, but want to build up organic first.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  return <ClientReview account={GRAIN_ACCOUNT} phase="goals" />;
}

export function ReviewGoals() {
  return (
    <ClientShell section="review-goals" title={<BackTitle label="Review your goals" />}>
      <ReviewProvider>
        <GoalsReviewBody />
      </ReviewProvider>
    </ClientShell>
  );
}
