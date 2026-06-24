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
    title: 'Reply to a 4-star review from Maria H. in Westlake',
    body: 'Maria praised the crew but noted a small drip on a baseboard. The agent drafted a calm, on-brand reply offering a same-week touch-up. Approve to publish or tap to edit.',
    time: '12m ago',
    primary: 'Review & reply',
    secondary: 'Skip',
    thumbnails: [
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2026/04/AfterIMG_0384-scaled.jpeg',
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2026/04/IMG_9426-scaled.jpeg',
    ],
  },
  {
    id: 'seo-1',
    source: 'seo',
    sourceLabel: 'AEO',
    href: 'aeo.html',
    kind: 'action',
    title: '3 content pieces waiting for your approval',
    body: 'Gemini and Perplexity miss CertaPro on "commercial painters Austin" and "HOA painters Austin." A 1,800-word HOA project pillar can close both gaps at once.',
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
    body: 'Matthew (VP of Residential) and Marci · Tarrytown cabinet refinish reveal · brand-safety check passed on 4. One has a tone flag for your eyes.',
    time: '3h ago',
    primary: 'Review',
    secondary: 'Approve all',
    thumbnails: [
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/cabinet-staining.jpg',
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2026/04/AfterIMG_0384-scaled.jpeg',
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/power-washing-2.jpg',
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/deck-staining-1.jpg',
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/color_consultation_certapro_preview-686x353.jpg',
    ],
  },
  {
    id: 'em-1',
    source: 'email',
    sourceLabel: 'AI Receptionist',
    href: 'email&sms.html',
    kind: 'action',
    title: '3 agent proposals waiting on Estimate Follow-up Stack',
    body: 'New subject line for the 48-hour nudge · SMS variant for "we missed you at the walkthrough" · timing tweak for the post-estimate thank-you.',
    time: '4h ago',
    primary: 'Open follow-up stack',
    secondary: null,
  },
  {
    id: 'cmp-1',
    source: 'campaigns',
    sourceLabel: 'Campaigns',
    href: 'campaigns.html',
    kind: 'action',
    title: 'Exterior season March — 15 posts ready for your review',
    body: 'Three-week organic + AEO push around exterior painting in Texas heat. Agent picked posting cadence; you sign off on copy.',
    time: '5h ago',
    primary: 'Review posts',
    secondary: null,
    thumbnails: [
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2026/02/After-Pic.png',
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2022/03/white-painted-brick-home-686x353.jpg',
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/siding-painting.jpg',
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2025/01/After-4-rotated.jpeg',
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2022/09/shutterstock_266405144-686x353.jpg',
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/power-washing-2.jpg',
    ],
  },
  {
    id: 'os-2',
    source: 'organic',
    sourceLabel: 'Organic Campaigns',
    href: 'organic-social.html',
    kind: 'action',
    title: '5 posts ready for next week — approve to schedule',
    body: 'Before/after grid for Mon/Wed/Fri + two crew-spotlight carousels for Tue/Thu. Tone passes brand check. Posting times match Austin homeowners\' peak engagement window.',
    time: 'Yesterday',
    primary: 'Approve & schedule',
    secondary: 'Preview',
    thumbnails: [
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/cabinet-staining.jpg',
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2026/02/After-Pic.png',
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/power-washing-2.jpg',
      'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/color_consultation_certapro_preview-686x353.jpg',
    ],
  },
  {
    id: 'map-1',
    source: 'map',
    sourceLabel: 'Map Ranking',
    href: 'map-ranking.html',
    kind: 'insight',
    title: 'Up 2 spots this week — now ranked #2 for "house painters Austin TX"',
    body: 'WOW 1 DAY PAINTING is still adding reviews fast. One more push from happy Westlake clients and you could take #1 by month-end.',
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
    title: 'Cabinet refinishing landing page is converting at 5.2% — above benchmark',
    body: 'Spring SEO push · "Cabinet refinishing Austin" page · 3 days live · agent recommends scaling traffic via Paid Search.',
    time: 'Yesterday',
    primary: 'Open page',
    secondary: null,
    thumbnails: ['https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/cabinet-staining.jpg'],
  },
  {
    id: 'pso-cf-1',
    source: 'paid-social',
    sourceLabel: 'Paid Social',
    href: 'paid-social.html',
    kind: 'action',
    title: 'Creative Fatigue detected — Exterior Season · Reel A',
    body: 'CTR dropped 32% over 7 days while spend held steady. A proposed refresh is ready to review.',
    time: '2h ago',
    primary: 'Review refresh',
    secondary: 'Snooze 7 days',
    proposedSolution: {
      reason: 'CTR dropped 32% over 7 days while spend held steady; CPM up 18%. Frequency hit 4.6 and Meta is widening delivery to weaker neighborhood placements.',
      competitorResearch:
        'Two direct competitors switched to time-lapse exterior reveals in the past 14 days — WOW 1 DAY PAINTING and Five Star are seeing 2.4–3.2x ROAS lifts on the new format.',
      bullets: [
        'Switch from carousel to a 15s vertical before/after reel',
        'Move the "4-day finish" claim from the caption to the first frame',
        'Add a Matthew (VP of Residential) voice-over for the first 2 seconds',
      ],
    },
  },
  {
    id: 'ps-cf-1',
    source: 'paid-search',
    sourceLabel: 'Paid Search',
    href: 'paid-search.html',
    kind: 'action',
    title: 'Creative Fatigue detected — RSA · Interior Painting Estimate Variant A',
    body: 'CTR dropped 28% over 7 days while impressions held steady. A proposed refresh is ready to review.',
    time: '5h ago',
    primary: 'Review refresh',
    secondary: 'Snooze 7 days',
    proposedSolution: {
      reason:
        'CTR is down 28% over 7 days while impressions held steady. Headline 1 has run unchanged for 21 days — asset rotation is exhausted.',
      competitorResearch:
        'Two competitors rotated to question-led headlines this week ("Need painters by next month?" pattern) and lifted CTR ~30%. Five Star added a free-color-consultation callout extension.',
      bullets: [
        'Rotate Headline 1 to a question-led variant',
        'Add a new "free color consultation" callout extension',
        'Pin a freshness signal — "Booking May projects now" — in description 2',
      ],
    },
  },
];

// Source palette previously inlined here has moved to the lib's
// `--source-<name>-bg/-fg` tokens (src/tokens/colors.css), resolved by
// <SourcePill source="…">. FeedSource → SourceName mapping lives in
// FeedItem.tsx since the data uses short keys (seo, organic, …) while the
// component uses canonical keys (seoaeo, organicsocial, …).
