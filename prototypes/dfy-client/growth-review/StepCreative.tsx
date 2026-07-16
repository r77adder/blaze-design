import { Button } from '@/components';
import Check2 from '@/icons/20/Check2';
import { ARTICLES, type CreativeItem } from './data';
import { CreativeCard } from './ui';
import { SearchAdsReview } from './SearchAdsReview';
import { PAGE_W } from './cardbody';
import { StepIntro, useWizard } from './wizard';

/* Steps 4 & 5: creative review. One flat grid of approvable content cards;
 * approve or request changes right on the card, or click to open the preview. */

const MAX = PAGE_W; // three fixed-width PR112 cards wide

/** Approves (or clears) the given decision keys in one click. Sits across from
 *  the page headline; the footer's Approve All & Continue is unchanged. */
function ApproveAllButton({ ids }: { ids: string[] }) {
  const { decisions, decide } = useWizard();
  const allApproved = ids.every((id) => decisions[id]?.status === 'approved');
  return (
    <Button
      size="md"
      variant={allApproved ? 'green' : 'secondary'}
      frontIcon={Check2}
      onPress={() => ids.forEach((id) => decide(id, allApproved ? null : { status: 'approved' }))}
    >
      {allApproved ? 'All approved' : 'Approve all'}
    </Button>
  );
}

function CreativeGrid({ items }: { items: CreativeItem[] }) {
  return (
    <div style={{ maxWidth: MAX, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center', alignItems: 'flex-start' }}>
      {items.map((item, i) => (
        <CreativeCard key={item.id} item={item} items={items} index={i} />
      ))}
    </div>
  );
}

export function StepPaidAds() {
  // The ticker hero, headline, and Approve-all all live inside SearchAdsReview
  // so the marquee can sit above the headline.
  return (
    <div style={{ padding: '24px 32px 48px' }}>
      <SearchAdsReview />
    </div>
  );
}

export function StepArticles() {
  const items = ARTICLES;
  return (
    <div style={{ padding: '0 32px 48px' }}>
      <StepIntro
        title="Your SEO & AEO articles"
        body="Buyer-education articles built to win both Google and AI search (ChatGPT, Gemini, Perplexity) for the questions homeowners actually ask. Approve each piece or request changes."
        maxWidth={MAX}
        action={<ApproveAllButton ids={items.map((i) => i.id)} />}
      />
      <CreativeGrid items={items} />
    </div>
  );
}
