/**
 * Feed payload from Ivan's index.html. Microcopy preserved verbatim.
 */
// Collapsed from `'action' | 'alert' | 'insight'` — heads-up items were folded
// into the to-do (action) bucket. The KindBadge component still accepts 'alert'
// in its own KindBadgeKind union (other surfaces and the staging test matrix
// may depend on it), but H2's feed data no longer surfaces that variant.
export type FeedKind = 'action' | 'insight';

export type FeedSource =
  | 'reputation'
  | 'seo'
  | 'paid-search'
  | 'influencer'
  | 'email'
  | 'campaigns'
  | 'map'
  | 'landing'
  | 'organic'
  | 'paid-social';

/**
 * When present, the FeedItemModal renders a "Proposed solution" section
 * surfacing the agent's refresh proposal (typically for Creative Fatigue
 * detected items). Existing items leave this undefined — no rendering
 * change. See FeedItemModal.tsx for the rendering path.
 */
export interface ProposedSolution {
  reason: string;
  competitorResearch: string;
  bullets: string[];
}

export interface FeedItem {
  id: string;
  source: FeedSource;
  sourceLabel: string;
  href: string;
  kind: FeedKind;
  title: string;
  body: string;
  time: string;
  primary: string | null;
  secondary: string | null;
  thumbnails?: string[];
  proposedSolution?: ProposedSolution;
}

// One representative item per FeedSource (10 total). Most are actions
// awaiting sign-off; map/landing surface insights because that's the most
// compelling signal those tools currently have. Paid Social and Paid
// Search slots are filled by their Creative Fatigue items (those with
// `proposedSolution`) — these get a distinct "Fatigue alert" badge in
// FeedItem.tsx instead of the generic "Needs sign-off" amber.
export const FEED_ITEMS: FeedItem[] = [
  {
    id: 'rep-1',
    source: 'reputation',
    sourceLabel: 'Reputation',
    href: 'reputation.html',
    kind: 'action',
    title: 'Reply to a 4-star review from Maria H.',
    body: 'The agent drafted a calm, on-brand reply. Most homeowners read responses before booking — approve to publish or tap to edit.',
    time: '12m ago',
    primary: 'Review & reply',
    secondary: 'Skip',
    thumbnails: [
      'https://picsum.photos/seed/rep-maria-1/120/90',
      'https://picsum.photos/seed/rep-maria-2/120/90',
    ],
  },
  {
    id: 'seo-1',
    source: 'seo',
    sourceLabel: 'AEO',
    href: 'aeo.html',
    kind: 'action',
    title: '3 content pieces waiting for your approval',
    body: 'Gemini and Perplexity have citation gaps on high-intent queries. A 2,200-word adaptogen pillar can close 3 of them at once.',
    time: '1h ago',
    primary: 'Open AEO',
    secondary: 'Approve all',
  },
  {
    id: 'inf-1',
    source: 'influencer',
    sourceLabel: 'UGC Content',
    href: 'influencer-content.html',
    kind: 'action',
    title: '5 AI avatar videos generated and ready',
    body: 'Sofia and Elise · Day Heel campaign · brand-safety check passed on 4. One has a tone flag for your eyes.',
    time: '3h ago',
    primary: 'Review',
    secondary: 'Approve all',
    thumbnails: [
      'https://picsum.photos/seed/ugc-sofia-1/120/90',
      'https://picsum.photos/seed/ugc-sofia-2/120/90',
      'https://picsum.photos/seed/ugc-elise-1/120/90',
      'https://picsum.photos/seed/ugc-elise-2/120/90',
      'https://picsum.photos/seed/ugc-day-heel/120/90',
    ],
  },
  {
    id: 'em-1',
    source: 'email',
    sourceLabel: 'SDR',
    href: 'email&sms.html',
    kind: 'action',
    title: '3 agent proposals waiting on Welcome Stack',
    body: 'New subject line for Step 3 · last-call SMS variant for Step 4 · timing tweak for Step 5.',
    time: '4h ago',
    primary: 'Open Welcome Stack',
    secondary: null,
  },
  {
    id: 'cmp-1',
    source: 'campaigns',
    sourceLabel: 'Campaigns',
    href: 'campaigns.html',
    kind: 'action',
    title: 'Tips & Tricks March — 15 posts ready for your review',
    body: 'Three-week organic + AEO push. Agent picked posting cadence; you sign off on copy.',
    time: '5h ago',
    primary: 'Review posts',
    secondary: null,
    thumbnails: [
      'https://picsum.photos/seed/cmp-tips-1/120/90',
      'https://picsum.photos/seed/cmp-tips-2/120/90',
      'https://picsum.photos/seed/cmp-tips-3/120/90',
      'https://picsum.photos/seed/cmp-tips-4/120/90',
      'https://picsum.photos/seed/cmp-tips-5/120/90',
      'https://picsum.photos/seed/cmp-tips-6/120/90',
    ],
  },
  {
    id: 'os-2',
    source: 'organic',
    sourceLabel: 'Organic Campaigns',
    href: 'organic-social.html',
    kind: 'action',
    title: '5 posts ready for next week — approve to schedule',
    body: 'Lifestyle grid for Mon/Wed/Fri + two carousels for Tue/Thu. Tone passes brand check. Posting times match your peak engagement window.',
    time: 'Yesterday',
    primary: 'Approve & schedule',
    secondary: 'Preview',
    thumbnails: [
      'https://picsum.photos/seed/os-post-mon/120/90',
      'https://picsum.photos/seed/os-post-tue/120/90',
      'https://picsum.photos/seed/os-post-wed/120/90',
      'https://picsum.photos/seed/os-post-thu/120/90',
    ],
  },
  {
    id: 'map-1',
    source: 'map',
    sourceLabel: 'Map Ranking',
    href: 'map-ranking.html',
    kind: 'insight',
    title: 'Up 2 spots this week — now ranked #2 for "roof repair austin"',
    body: 'Texas Star is still adding reviews fast. One more push and you could take #1 by month-end.',
    time: 'Yesterday',
    primary: 'Send review request',
    secondary: 'See full insight',
  },
  {
    id: 'lp-1',
    source: 'landing',
    sourceLabel: 'Landing Pages',
    href: 'landing-pages.html',
    kind: 'insight',
    title: 'CRM landing page is converting at 4.6% — above benchmark',
    body: 'Spring SEO Push · "Small Business CRM" page · 2 days live · agent recommends scaling traffic.',
    time: 'Yesterday',
    primary: 'Open page',
    secondary: null,
    thumbnails: ['https://picsum.photos/seed/lp-crm-hero/120/90'],
  },
  {
    id: 'pso-cf-1',
    source: 'paid-social',
    sourceLabel: 'Paid Social',
    href: 'paid-social.html',
    kind: 'action',
    title: 'Creative Fatigue detected — Hiring · Reel A',
    body: 'CTR dropped 32% over 7 days while spend held steady. A proposed refresh is ready to review.',
    time: '2h ago',
    primary: 'Review refresh',
    secondary: 'Snooze 7 days',
    proposedSolution: {
      reason: 'CTR dropped 32% over 7 days while spend held steady; CPM up 18%. Frequency hit 4.6 and Meta is widening delivery to weaker placements.',
      competitorResearch:
        'Three direct competitors switched to short-form vertical video with stat overlays in the past 14 days — NorthSun Wellness and Helia Botanicals are seeing 2.4–3.2x ROAS lifts.',
      bullets: [
        'Switch from carousel to a 15s vertical reel',
        'Move the stat hook from the caption to the first frame',
        'Add a Sofia avatar voice-over for the first 2 seconds',
      ],
    },
  },
  {
    id: 'ps-cf-1',
    source: 'paid-search',
    sourceLabel: 'Paid Search',
    href: 'paid-search.html',
    kind: 'action',
    title: 'Creative Fatigue detected — RSA · Daily Wellness Bundle Variant A',
    body: 'CTR dropped 28% over 7 days while impressions held steady. A proposed refresh is ready to review.',
    time: '5h ago',
    primary: 'Review refresh',
    secondary: 'Snooze 7 days',
    proposedSolution: {
      reason:
        'CTR is down 28% over 7 days while impressions held steady. Headline 1 has run unchanged for 21 days — asset rotation is exhausted.',
      competitorResearch:
        'Two competitors rotated to question-led headlines this week ("Tired by 3pm?" pattern) and lifted CTR ~30%. NorthSun Wellness added a free-shipping callout extension.',
      bullets: [
        'Rotate Headline 1 to a question-led variant',
        'Add a new "free shipping" callout extension',
        'Pin a freshness signal — "Updated for May" — in description 2',
      ],
    },
  },
];

// Source palette previously inlined here has moved to the lib's
// `--source-<name>-bg/-fg` tokens (src/tokens/colors.css), resolved by
// <SourcePill source="…">. FeedSource → SourceName mapping lives in
// FeedItem.tsx since the data uses short keys (seo, organic, …) while the
// component uses canonical keys (seoaeo, organicsocial, …).
