import { useState, useEffect } from 'react';
import { Button } from '@/components';
import { TabChip } from '@/staging';
import Edit1 from '@/icons/20/Edit1';
import EyeOpen from '@/icons/20/EyeOpen';
import BarChartSquare from '@/icons/20/BarChartSquare';
import { PaidSocialInsightsView } from '../h2/insights/PaidSocialInsights';
import { PaidSearchInsightsView } from '../h2/insights/PaidSearchInsights';
import { ClientShell } from './shell';
import { ColdState } from './ColdState';
import { useClientState } from './dev-state';
import { AccountHealthReport } from './insights/AccountHealthReport';
import { OrganicReport } from './insights/OrganicReport';
import { SeoReport } from './insights/SeoReport';
import { LocalReport } from './insights/LocalReport';
import { WebsiteReport } from './insights/WebsiteReport';
import { ReputationReport } from './insights/ReputationReport';
import type { Narrative } from './insights/common';

/**
 * Client Insights for Grain Design Flooring (premium flooring, Austin TX).
 *
 * The FIRST tab, "Account health", is the central overview: it owns the
 * account-level narrative, an AM-authored central goal, a cross-channel KPI
 * summary, and the single "what we're doing next" list. The per-channel tabs
 * (Organic Social, Paid Social, Paid Search, SEO/AEO, Local Search, Website,
 * Reputation) are now purely METRICS, charts and tables, no narrative block.
 *
 * The product switcher is a single horizontally-scrollable TabChip row so it
 * never overflows the topbar. `sub` (from /insights/:sub) sets the default tab.
 * `health`/`overview` both resolve to the central tab.
 *
 * AM-EDIT MODE: a topbar toggle flips the central goal + the account-health
 * headline/summary into editable inputs, simulating the account manager
 * editing what the (read-only) client sees. Default OFF.
 */
type ProductKey = 'health' | 'organic' | 'paid-social' | 'paid-search' | 'seo' | 'local' | 'website' | 'reputation';
const PRODUCTS: { key: ProductKey; label: string }[] = [
  { key: 'health', label: 'Business Health' },
  { key: 'organic', label: 'Organic Social' },
  { key: 'paid-social', label: 'Paid Social' },
  { key: 'paid-search', label: 'Paid Search' },
  { key: 'seo', label: 'SEO / AEO' },
  { key: 'local', label: 'Local Search' },
  { key: 'website', label: 'Website' },
  { key: 'reputation', label: 'Reputation' },
];

/** `sub` aliases that resolve to the central Account health tab. */
const resolveSub = (sub?: string): ProductKey => {
  if (sub === 'overview' || sub === 'health') return 'health';
  return (PRODUCTS.find((p) => p.key === sub)?.key ?? 'health') as ProductKey;
};

/** The AM-authored central goal for the engagement. */
const DEFAULT_GOAL = 'Get more booked design consults from homeowners across the Austin metro.';

/** Default narrative copy per tab (the AM can edit `health` in edit mode). */
type NarrativeKey = 'health' | 'organic' | 'seo' | 'local' | 'website' | 'reputation';
const NARRATIVES: Record<NarrativeKey, Narrative> = {
  health: {
    headline: 'Strong month. Leads up 14% and the install pipeline is filling from organic + local.',
    body: 'Demand is climbing across the board: before/after install Reels are driving social reach, "flooring near me" searches are converting on the consult-request page, and a #2 map rank is feeding the showroom. The estimate-to-install funnel is healthy: 81 new clients this period at a 4.7★ rating.',
    next: [
      'Push paid budget toward the highest-intent flooring searches (install + refinish).',
      'Ship mobile speed fixes so the consult-request page stops losing visitors.',
      'Scale the before/after install Reels that are out-reaching every other format.',
    ],
  },
  organic: {
    headline: 'Steady growth. Reach up 18%, carried by before/after install content.',
    body: '9 posts went out on schedule. Before/after install Reels did the heavy lifting (2.4× the engagement of stills), and posts that named the neighborhood in the first line out-reached the rest by ~30%.',
    next: [
      'Shift two static posts/week to before/after install Reels.',
      'Add a weekly "review of the week" carousel across IG + FB.',
      'Test a crew-spotlight Story series for Tue/Thu.',
    ],
  },
  seo: {
    headline: 'Two priority keywords broke into the top 10, and AI answers started citing you.',
    body: 'The flooring cost/pricing explainer is pulling the most qualified organic traffic, and you now appear in Gemini & Perplexity answers for 12 buyer questions, a brand-new channel.',
    next: [
      'Publish the "flooring near me" comparison page to push from pos 11 → top 5.',
      'Add FAQ schema to the install & refinish pages for more answer-engine coverage.',
    ],
  },
  local: {
    headline: 'Map rank up to #2 for "flooring Austin"; profile actions up 19%.',
    body: 'Weekly Google Business posts plus fresh install photos correlate with the map-rank jump. Three directory listings still carry an old phone number and are worth fixing.',
    next: [
      'Fix the 3 inconsistent citations (Yelp, Bing, Apple Maps).',
      'Add 10 geotagged install photos to reinforce service-area relevance.',
    ],
  },
  website: {
    headline: 'Traffic up 12% and the consult-request page is converting above benchmark.',
    body: 'The dedicated consult-request landing page is converting 2.3× the homepage. Mobile page speed is still the main drag: about 30% of visitors bounce before the page loads.',
    next: [
      'Ship the mobile speed fixes to cut the load-time bounce.',
      'Route more paid traffic to the consult-request page over the homepage.',
    ],
  },
  reputation: {
    headline: '4.7★ holding steady; review velocity tripled since the post-install ask launched.',
    body: 'Every new review got an on-brand reply within hours, which lifts conversion on profile visits ~11%. The post-install text ask is the single biggest driver of the new review volume.',
    next: [
      'Route unhappy feedback to a private form before it reaches public review sites.',
      'Feature the 5 best new reviews as social proof on the consult-request page.',
    ],
  },
};

export function Insights({ sub }: { sub?: string }) {
  const { state } = useClientState();
  const [product, setProduct] = useState<ProductKey>(resolveSub(sub));
  const [editing, setEditing] = useState(false);
  const [narratives, setNarratives] = useState(NARRATIVES);
  const [goal, setGoal] = useState(DEFAULT_GOAL);

  // Keep the active tab in sync when the URL channel changes while already on
  // Insights (deep links + back/forward), not just on first mount.
  useEffect(() => {
    setProduct(resolveSub(sub));
  }, [sub]);

  const patch = (key: NarrativeKey) => (p: Partial<Narrative>) =>
    setNarratives((prev) => ({ ...prev, [key]: { ...prev[key], ...p } }));

  // COLD, pre-go-live: no metrics yet. Skip the product tab strip + AM-edit
  // topbar controls entirely and show the shared explanatory empty state.
  if (state !== 'steady') {
    return (
      <ClientShell section="insights">
        <ColdState
          icon={BarChartSquare}
          title="Insights light up once your campaigns are running."
          description="When you're live, this becomes your results dashboard: reach, leads, clients, and reputation across every channel Blaze runs for you."
          points={[
            'Cross-channel KPIs: reach, leads, clients, conversion',
            'Per-channel reports: organic, paid, SEO/AEO, local, website, reputation',
            'A weekly summary from your strategist',
          ]}
        />
      </ClientShell>
    );
  }

  // Single horizontally-scrollable row, never wraps / overflows the topbar.
  const topbarCenter = (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', width: 'max-content', maxWidth: 'calc(100vw - 380px)', padding: '2px 2px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
      <style>{`.dfy-tabs::-webkit-scrollbar{display:none}`}</style>
      <div className="dfy-tabs" style={{ display: 'flex', gap: 6 }}>
        {PRODUCTS.map((p) => (
          <span key={p.key} style={{ flexShrink: 0 }}>
            <TabChip selected={product === p.key} onSelect={() => setProduct(p.key)}>{p.label}</TabChip>
          </span>
        ))}
      </div>
    </div>
  );

  const topbarRight = (
    <Button
      variant={editing ? 'primary' : 'secondary'}
      size="sm"
      frontIcon={editing ? EyeOpen : Edit1}
      onPress={() => setEditing((e) => !e)}
    >
      {editing ? 'Preview' : 'AM edit'}
    </Button>
  );

  return (
    <ClientShell section="insights" topbarCenter={topbarCenter} topbarRight={topbarRight}>
      {product === 'health' && <AccountHealthReport editing={editing} goal={goal} onGoal={setGoal} narrative={narratives.health} onNarrative={patch('health')} onNavigate={setProduct} />}
      {product === 'paid-social' && <PaidSocialInsightsView hideEyebrow />}
      {product === 'paid-search' && <PaidSearchInsightsView hideEyebrow />}
      {product === 'organic' && <OrganicReport editing={editing} narrative={narratives.organic} onNarrative={patch('organic')} />}
      {product === 'seo' && <SeoReport editing={editing} narrative={narratives.seo} onNarrative={patch('seo')} />}
      {product === 'local' && <LocalReport editing={editing} narrative={narratives.local} onNarrative={patch('local')} />}
      {product === 'website' && <WebsiteReport editing={editing} narrative={narratives.website} onNarrative={patch('website')} />}
      {product === 'reputation' && <ReputationReport editing={editing} narrative={narratives.reputation} onNarrative={patch('reputation')} />}
    </ClientShell>
  );
}
