import { useEffect } from 'react';
import { ReviewProvider, useReview } from './review-lib/review';
import { GRAIN_ACCOUNT } from './review-lib/account';
import { ClientShell, BackTitle } from './shell';
import { ClientReview } from './ReviewStrategy';

/* ─── dfy-client route export + seed ─────────────────────────────────────────
 * Same pattern as ReviewStrategy.tsx: PR97 starts every packet as 'draft', so
 * a tiny mount effect shares the creative packet before rendering ClientReview.
 * ClientReview itself is phase-generic, StoryboardRead/CalendarRead already
 * cover the storyboard + calendar sections for phase="creative". */
function CreativeReviewBody() {
  const { packet, share } = useReview();
  useEffect(() => {
    if (packet('creative') === 'draft') share('creative');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <ClientReview account={GRAIN_ACCOUNT} phase="creative" />;
}

export function ReviewCreative() {
  return (
    <ClientShell section="review-creative" title={<BackTitle label="Review your creative" />}>
      <ReviewProvider>
        <CreativeReviewBody />
      </ReviewProvider>
    </ClientShell>
  );
}
