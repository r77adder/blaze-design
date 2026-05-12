/**
 * Feed payload from Ivan's index.html. Microcopy preserved verbatim.
 */
export type FeedKind = 'action' | 'alert' | 'insight';

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
}

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
    sourceLabel: 'SEO/AEO',
    href: 'seo-aeo.html',
    kind: 'action',
    title: '7 proposed actions waiting — 4 issue fixes + 3 new content pieces',
    body: 'Gemini is sourcing the wrong founding year, 12 high-intent comparison queries have no Blaze content, and a 2,200-word pillar can close 3 citation gaps.',
    time: '1h ago',
    primary: 'Open SEO/AEO',
    secondary: 'Approve all',
  },
  {
    id: 'ps-1',
    source: 'paid-search',
    sourceLabel: 'Paid Search',
    href: 'paid-search.html',
    kind: 'alert',
    title: 'CPC spike on "wellness supplements"',
    body: 'Daily Wellness Bundle campaign · CPC up 38% in the last 4 hours. Agent suggests pausing the keyword or lowering max bid to $1.40.',
    time: '2h ago',
    primary: 'Review',
    secondary: null,
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
    sourceLabel: 'Email & SMS',
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
    id: 'em-2',
    source: 'email',
    sourceLabel: 'Email & SMS',
    href: 'email&sms.html',
    kind: 'insight',
    title: 'A/B test won — Welcome Stack subject line variant B',
    body: '+9.2% open rate · auto-applied. The agent will test against the new winner next week.',
    time: 'Yesterday',
    primary: 'Open Welcome Stack',
    secondary: null,
  },
  {
    id: 'os-1',
    source: 'organic',
    sourceLabel: 'Organic Campaigns',
    href: 'organic-social.html',
    kind: 'action',
    title: 'Schedule 3 Reels for next week',
    body: 'Drafts ready across Instagram + TikTok. Two unscripted lifestyle moments and one 60-second routine demo.',
    time: 'Yesterday',
    primary: 'Schedule',
    secondary: 'Preview',
    thumbnails: [
      'https://picsum.photos/seed/os-reel-1/120/90',
      'https://picsum.photos/seed/os-reel-2/120/90',
      'https://picsum.photos/seed/os-reel-3/120/90',
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
    id: 'os-3',
    source: 'organic',
    sourceLabel: 'Organic Campaigns',
    href: 'organic-social.html',
    kind: 'insight',
    title: 'Carousel posts outperformed single-image by 1.8× last week',
    body: 'Agent will lean into carousel format for the next two weeks. Review the proposed cadence shift in the calendar.',
    time: '2d ago',
    primary: 'Open calendar',
    secondary: 'See breakdown',
    thumbnails: [
      'https://picsum.photos/seed/os-carousel-1/120/90',
      'https://picsum.photos/seed/os-carousel-2/120/90',
      'https://picsum.photos/seed/os-carousel-3/120/90',
    ],
  },
  {
    id: 'rep-2',
    source: 'reputation',
    sourceLabel: 'Reputation',
    href: 'reputation.html',
    kind: 'alert',
    title: 'Yelp billing complaint is escalating',
    body: 'Sentiment dropped 2 points overnight. The agent drafted an escalation reply and routed it to your inbox first.',
    time: '2d ago',
    primary: 'Open thread',
    secondary: null,
    thumbnails: ['https://picsum.photos/seed/rep-yelp-thread/120/90'],
  },
  {
    id: 'inf-2',
    source: 'influencer',
    sourceLabel: 'UGC Content',
    href: 'influencer-content.html',
    kind: 'insight',
    title: 'Sofia avatar is outperforming the rest by 2.3×',
    body: 'Lifestyle videos with Sofia driving 5.1% CTR — well above the 2.2% benchmark on Meta.',
    time: '2d ago',
    primary: 'Open Avatars',
    secondary: null,
    thumbnails: [
      'https://picsum.photos/seed/inf-sofia-still-1/120/90',
      'https://picsum.photos/seed/inf-sofia-still-2/120/90',
      'https://picsum.photos/seed/inf-sofia-still-3/120/90',
    ],
  },
  {
    id: 'cmp-2',
    source: 'campaigns',
    sourceLabel: 'Campaigns',
    href: 'campaigns.html',
    kind: 'action',
    title: 'Spring Sale 2026 — 2 posts to review before launch',
    body: 'Mar 1 – Apr 14 · Organic + Meta + Search + landing page. Brief is approved.',
    time: '2d ago',
    primary: 'Review posts',
    secondary: null,
    thumbnails: [
      'https://picsum.photos/seed/cmp-spring-1/120/90',
      'https://picsum.photos/seed/cmp-spring-2/120/90',
    ],
  },
  {
    id: 'aeo-1',
    source: 'seo',
    sourceLabel: 'SEO/AEO',
    href: 'seo-aeo.html',
    kind: 'insight',
    title: 'Lifestyle AI videos are driving 5.1% CTR on Instagram',
    body: 'Up from a 2.2% baseline. The agent will lean into this format on the next two campaigns.',
    time: '3d ago',
    primary: null,
    secondary: null,
  },
  {
    id: 'ps-2',
    source: 'paid-search',
    sourceLabel: 'Paid Search',
    href: 'paid-search.html',
    kind: 'insight',
    title: 'Daily Wellness Bundle is hitting $5.40 CPA — under your $8 target',
    body: '2h 14m live · 6 conversions · 187 clicks · agent will keep budget steady through tomorrow.',
    time: '3d ago',
    primary: 'Open campaign',
    secondary: null,
  },
];

// Source palette previously inlined here has moved to the lib's
// `--source-<name>-bg/-fg` tokens (src/tokens/colors.css), resolved by
// <SourcePill source="…">. FeedSource → SourceName mapping lives in
// FeedItem.tsx since the data uses short keys (seo, organic, …) while the
// component uses canonical keys (seoaeo, organicsocial, …).
