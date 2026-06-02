/**
 * Static demo data for the H2 competitor-tracking prototype. The workspace
 * business is "CertaPro Painters of Austin" — a residential + commercial
 * painting contractor in Austin TX. Competitor lookup (color + initials)
 * drives Avatar fills; feed cards + alerts read from these fixtures.
 *
 * NOTE: The CompetitorKey union below ('proof' / 'bluenotary' / 'notarypro'
 * / 'industry') is kept verbatim from the original notary-domain prototype
 * because those keys are opaque identifiers wired throughout the codebase
 * (filters, modals, profile maps, route params). Only the human-readable
 * values were swapped to the painting domain.
 */

export type CompetitorKey = 'proof' | 'bluenotary' | 'notarypro' | 'industry';

export interface Competitor {
  key: CompetitorKey;
  name: string;
  short: string; // shown in nav chip
  initials: string;
  color: string;
  tag?: string;
}

export const COMPETITORS: Record<CompetitorKey, Competitor> = {
  proof: { key: 'proof', name: 'Five Star Painting of South Austin', short: 'Five Star', initials: 'FS', color: '#1A0DAB', tag: 'Category leader' },
  bluenotary: { key: 'bluenotary', name: 'Paper Moon Painting', short: 'Paper Moon', initials: 'PM', color: '#2563EB', tag: 'Digital challenger' },
  notarypro: { key: 'notarypro', name: 'WOW 1 DAY PAINTING Austin', short: 'WOW 1 DAY', initials: 'WD', color: '#92400E', tag: 'Direct local rival' },
  industry: { key: 'industry', name: 'Industry signal', short: 'Industry', initials: '🌐', color: '#1A535C' },
};

export type ChannelKey = 'instagram' | 'linkedin' | 'google' | 'meta';
export type CardType = 'organic-ig' | 'organic-li' | 'ad-google' | 'ad-meta';

export interface PerfSignal {
  tone: 'viral' | 'above' | 'typical' | 'below' | 'brand-hit';
  icon: string;
  label: string;
  value: string;
}

export interface FeedCard {
  id: string;
  competitor: CompetitorKey;
  channel: ChannelKey;
  type: CardType;
  caption: string;
  /** Engagement string ("22.4K"). Organic only. */
  engagement?: string;
  /** Engagement glyph ("♥" | "👍"). Organic only. */
  engagementGlyph?: string;
  /** "2.8%" rate or "142 comments". Organic only. */
  secondaryStat?: string;
  /** "Apr 19" — date shown on organic cards. */
  date?: string;
  /** LinkedIn body + hashtag (the white card text). */
  liBody?: string;
  liTag?: string;
  /** Google ad fields. */
  googleUrl?: string;
  googleHeadline?: string;
  googleDesc?: string;
  /** Meta ad fields (image emoji + CTA strip). */
  metaImage?: string; // emoji
  metaBrand?: string;
  metaSub?: string;
  metaCta?: string;
  /** Visual gradient class — 1 through 8. Used for IG and Meta image tiles. */
  grad?: number;
  /** Real photo for the thumb (organic-ig, ad-meta, organic-li). Painting-themed Unsplash photos.
   *  Falls back to the gradient + emoji block when missing. */
  imageUrl?: string;
  signals: [PerfSignal, PerfSignal];
}

/** Painting-themed Unsplash URL pattern (matches card themes — interior, exterior, cabinets, HOA, painter at work). */
const UNSPLASH = (id: string): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=60`;

const PERF = {
  viral: (label: string, value: string): PerfSignal => ({ tone: 'viral', icon: '🔥', label, value }),
  above: (label: string, value: string): PerfSignal => ({ tone: 'above', icon: '↑', label, value }),
  typical: (label: string, value: string): PerfSignal => ({ tone: 'typical', icon: '≈', label, value }),
  below: (label: string, value: string): PerfSignal => ({ tone: 'below', icon: '↓', label, value }),
  brand: (value: string): PerfSignal => ({ tone: 'brand-hit', icon: '🎯', label: 'For your brand', value }),
};

export const FEED_CARDS: FeedCard[] = [
  {
    id: 'cfc-1', competitor: 'proof', channel: 'instagram', type: 'organic-ig', grad: 2,
    caption: 'Refresh your Austin home’s curb appeal in 3 days — book a free color consult with Five Star.',
    engagement: '22.4K', engagementGlyph: '♥', secondaryStat: '2.8%', date: 'Apr 19',
    imageUrl: UNSPLASH('photo-1570129477492-45c003edd2be'),
    signals: [PERF.typical("vs Five Star's IG avg", '1.0×'), PERF.brand('Brand match')],
  },
  {
    id: 'cfc-2', competitor: 'proof', channel: 'google', type: 'ad-google',
    caption: '',
    googleUrl: 'www.fivestarpainting.com/south-austin',
    googleHeadline: 'Austin House Painters | Free Color Consult — Five Star Painting',
    googleDesc: 'Backed by Neighborly. 2-year workmanship warranty. Interior + exterior. Free estimate in 24 hrs.',
    imageUrl: UNSPLASH('photo-1564013799919-ab600027ffc6'),
    signals: [PERF.viral('Creative status', 'Workhorse'), PERF.brand('Brand match')],
  },
  {
    id: 'cfc-3', competitor: 'bluenotary', channel: 'instagram', type: 'organic-ig', grad: 1,
    caption: 'Cabinet refinishing transformation — Westlake kitchen, 2 days, no demo. Swipe to see the before.',
    engagement: '18.1K', engagementGlyph: '♥', secondaryStat: '4.9%', date: 'Apr 18',
    imageUrl: UNSPLASH('photo-1556909114-f6e7ad7d3136'),
    signals: [PERF.viral("vs Paper Moon's IG avg", '3.2×'), PERF.below('For your brand', 'Off-brand')],
  },
  {
    id: 'cfc-4', competitor: 'proof', channel: 'meta', type: 'ad-meta', grad: 3,
    caption: '"Selling your Austin home this spring? Repaint the exterior in a weekend. Five Star handles prep, paint, and cleanup."',
    metaImage: '🏠', metaBrand: 'fivestarpainting.com', metaSub: 'Free estimate', metaCta: 'Get quote',
    imageUrl: UNSPLASH('photo-1568605114967-8130f3a36994'),
    signals: [PERF.above('Creative status', 'Long-running'), PERF.brand('Brand match')],
  },
  {
    id: 'cfc-5', competitor: 'notarypro', channel: 'linkedin', type: 'organic-li',
    caption: 'Why HOAs in Austin call us instead of national franchises',
    liBody:
      "Last week we repainted 14 townhome exteriors in a Steiner Ranch HOA — start to finish, 5 days, zero touch-up complaints. National franchises subcontract the whole crew. We don't. Same painters every day means consistent color match and accountability the board can actually call.",
    liTag: '#AustinPainters #HOAPainting',
    engagement: '1.8K', engagementGlyph: '👍', secondaryStat: '142 comments', date: 'Apr 18',
    imageUrl: UNSPLASH('photo-1572120360610-d971b9d7767c'),
    signals: [PERF.viral("vs WOW 1 DAY's LI avg", '2.6×'), PERF.brand('Brand match')],
  },
  {
    id: 'cfc-6', competitor: 'bluenotary', channel: 'google', type: 'ad-google',
    caption: '',
    googleUrl: 'www.papermoonpainting.com/austin',
    googleHeadline: 'Paper Moon Painting Austin — Flat $499 Room Refresh | 1-Week Turnaround',
    googleDesc: 'No upcharges. No surprises. Licensed + insured. Trim, walls, ceilings included. Book online.',
    imageUrl: UNSPLASH('photo-1565182999561-18d7dc61c393'),
    signals: [PERF.above('Creative status', 'Long-running'), PERF.typical('For your brand', 'Neutral')],
  },
  {
    id: 'cfc-7', competitor: 'bluenotary', channel: 'linkedin', type: 'organic-li',
    caption: "Exterior repaint costs dropped 18% in Austin since 2024 — here's why labor is the real story.",
    liBody:
      "Exterior repaint averages in the Austin metro dropped from $4,800 to $3,950 in 18 months. That's not paint costs — that's labor consolidation. The bigger franchises are squeezing crew margins to win SEO. Good news for homeowners short-term. Bad news for paint quality and warranty follow-through.",
    liTag: '#AustinPainters #ResidentialPainting',
    engagement: '4.2K', engagementGlyph: '👍', secondaryStat: '287 comments', date: 'Apr 17',
    imageUrl: UNSPLASH('photo-1581235720704-06d3acfcb36f'),
    signals: [PERF.viral("vs Paper Moon's LI avg", '3.0×'), PERF.typical('For your brand', 'Neutral')],
  },
  {
    id: 'cfc-8', competitor: 'bluenotary', channel: 'meta', type: 'ad-meta', grad: 5,
    caption: '"Why pay $1,200+ for a single room when Paper Moon does it for $499 flat? Walls, trim, ceiling included."',
    metaImage: '🎨', metaBrand: 'papermoonpainting.com', metaSub: 'Save 50% — flat rate', metaCta: 'Book now',
    imageUrl: UNSPLASH('photo-1513694203232-719a280e022f'),
    signals: [PERF.typical('Creative status', 'Active'), PERF.below('For your brand', 'Off-brand')],
  },
  {
    id: 'cfc-9', competitor: 'notarypro', channel: 'instagram', type: 'organic-ig', grad: 7,
    caption:
      'We finished a 4-bedroom interior repaint in Cedar Park before the family flew back from spring break. Keys in hand by Sunday night. This is what 1-day painting actually means.',
    engagement: '8.4K', engagementGlyph: '♥', secondaryStat: '6.1%', date: 'Apr 15',
    imageUrl: UNSPLASH('photo-1521783593447-5702b9bfd267'),
    signals: [PERF.viral("vs WOW 1 DAY's IG avg", '4.8×'), PERF.brand('Brand match')],
  },
  {
    id: 'cfc-10', competitor: 'proof', channel: 'linkedin', type: 'organic-li',
    caption: "150,000 homes painted: what we've learned about color in hot-climate metros",
    liBody:
      "We just finished our 150,000th exterior in the Five Star network. Here's what 12 years of Sun-Belt repaints taught us: the colors that look 'safe' on a swatch fade fastest. Mid-tone greys with UV-stable pigments outlast trendy off-whites by 4-6 years on south-facing Austin walls.",
    liTag: '#ResidentialPainting #ExteriorPaint',
    engagement: '9.8K', engagementGlyph: '👍', secondaryStat: '421 comments', date: 'Apr 16',
    imageUrl: UNSPLASH('photo-1502672260266-1c1ef2d93688'),
    signals: [PERF.below("vs Five Star's LI avg", '0.7×'), PERF.typical('For your brand', 'Neutral')],
  },
  {
    id: 'cfc-11', competitor: 'notarypro', channel: 'meta', type: 'ad-meta', grad: 8,
    caption:
      '"Interior repaint · Done in 1 day · Move back in tonight · No mess left behind. The Austin family painters who finish before dinner."',
    metaImage: '🖌️', metaBrand: 'wow1day.com/austin', metaSub: 'Book 1-day repaint', metaCta: 'Call now',
    imageUrl: UNSPLASH('photo-1556909172-54557c7e4fb7'),
    signals: [PERF.typical('Creative status', 'Active'), PERF.brand('Brand match')],
  },
  {
    id: 'cfc-12', competitor: 'notarypro', channel: 'google', type: 'ad-google',
    caption: '',
    googleUrl: 'www.wow1day.com/austin/interior',
    googleHeadline: 'House Painters Near Me | 1-Day Interior Repaint — WOW 1 DAY',
    googleDesc: 'Interior · Exterior · Cabinets · Trim. Done in a day. Licensed crews. 5-star reviewed in Austin.',
    imageUrl: UNSPLASH('photo-1518780664697-55e3ad937233'),
    signals: [PERF.above('Creative status', 'Long-running'), PERF.brand('Brand match')],
  },
];

export interface CompetitorRow {
  key: CompetitorKey;
  totalReach: string;
  avgEng: string;
  postsPerWeek: string;
  activeAds: string;
  latestActivity: string;
}

/**
 * Ad-intel detail shown inside the CardDetailModal for Google/Meta ad cards.
 * Mirrors the source HTML's `adIntel` map (lines 7807+): hook pattern, hook
 * insight, finished assets, and the landing-page playbook.
 */
export interface AdIntel {
  hookPattern: string;
  hookLine: string;
  hookInsight: string;
  assets: { headline: string; body: string; cta: string };
  lp: {
    url: string;
    eyebrow: string;
    headline: string;
    subhead: string;
    cta: string;
    ctaColor: string;
    sections: string[];
  };
}

export const AD_INTEL: Record<string, AdIntel> = {
  'cfc-2': {
    hookPattern: 'Local-intent + free offer',
    hookLine: 'Austin House Painters | Free Color Consult',
    hookInsight:
      'Front-loads metro + service + zero-risk hook. Wins search intent from homeowners typing "house painters Austin" who haven\'t picked a contractor yet. Pairs local trust with a no-commitment opener that defuses the "I haven\'t decided on colors yet" objection.',
    assets: { headline: 'Austin House Painters | Free Color Consult — Five Star Painting', body: 'Backed by Neighborly. 2-year workmanship warranty. Interior + exterior. Free estimate in 24 hrs.', cta: 'Get free estimate' },
    lp: { url: 'fivestarpainting.com/south-austin', eyebrow: 'FIVE STAR PAINTING', headline: 'Austin homes repainted with a 2-year warranty.', subhead: 'Backed by Neighborly. 150,000+ homes painted nationwide. Free in-home color consult.', cta: 'Get free estimate', ctaColor: '#1A0DAB', sections: ['2-year warranty', 'Background-checked crews', 'UV-stable paint', 'Free color consult'] },
  },
  'cfc-4': {
    hookPattern: 'Real-estate urgency',
    hookLine: 'Selling your Austin home this spring?',
    hookInsight: 'Targets a deadline emotion (listing date) instead of a service feature. Best for Realtor referral traffic and sellers prepping the exterior before MLS photos. Pain-first framing — "spring closing" — converts harder than "we paint houses."',
    assets: { headline: 'Selling your Austin home this spring? Repaint the exterior in a weekend.', body: 'Five Star handles prep, paint, and cleanup. MLS-photo ready in 5 days.', cta: 'Get quote' },
    lp: { url: 'fivestarpainting.com/list-ready', eyebrow: 'FIVE STAR PAINTING', headline: 'Repaint, list, sell. We work to your closing date.', subhead: 'Exterior or interior turnarounds matched to your MLS timeline. Prep, paint, cleanup — done.', cta: 'Get quote', ctaColor: '#1A0DAB', sections: ['5-day turnaround', 'Listing-ready palette', 'Realtor referrals', 'Free walk-through'] },
  },
  'cfc-6': {
    hookPattern: 'Flat-price clarity',
    hookLine: 'Flat $499 Room Refresh | 1-Week Turnaround',
    hookInsight: 'Anchors against $1,200+ per-room quotes from custom contractors. "Flat" is the magic word — predictable pricing is the SMB unlock for homeowners burned by surprise change-orders.',
    assets: { headline: 'Paper Moon Painting Austin — Flat $499 Room Refresh | 1-Week Turnaround', body: 'No upcharges. No surprises. Licensed + insured. Walls, trim, ceiling included.', cta: 'Book online' },
    lp: { url: 'papermoonpainting.com/austin', eyebrow: 'PAPER MOON PAINTING', headline: 'Refresh any room for $499 flat. Booked online. Done in a week.', subhead: 'No upcharges. No surprises. Walls + trim + ceiling included.', cta: 'Book — $499', ctaColor: '#2563EB', sections: ['$499 flat', 'Walls + trim + ceiling', 'Licensed + insured', '60-sec online booking'] },
  },
  'cfc-8': {
    hookPattern: 'Price-comparison question',
    hookLine: 'Why pay $1,200+ for a single room when Paper Moon does it for $499 flat?',
    hookInsight: 'Names the typical custom-painter quote explicitly. Targets price-conscious homeowners already shopping multiple contractors who want to know if cheaper-is-worse.',
    assets: { headline: 'Why pay $1,200+ for a single room when Paper Moon does it for $499 flat?', body: 'Walls, trim, ceiling included. Licensed + insured Austin crews. Book online in 60 seconds.', cta: 'Book now' },
    lp: { url: 'papermoonpainting.com/save', eyebrow: 'PAPER MOON PAINTING', headline: 'Save 50% vs custom contractors.', subhead: '$499 flat per room. Walls + trim + ceiling. No quote calls.', cta: 'Book for $499', ctaColor: '#2563EB', sections: ['Save vs custom quotes', '$499 flat', 'Walls + trim + ceiling', 'Licensed + insured'] },
  },
  'cfc-11': {
    hookPattern: 'Edge-case moments',
    hookLine: 'Interior repaint · Done in 1 day · Move back in tonight',
    hookInsight: 'Lists specific situational triggers rather than features. Each phrase is a parent\'s anxiety query ("can we paint while we\'re at the lake house?"). Concrete > abstract.',
    assets: { headline: 'Interior repaint · Done in 1 day · Move back in tonight · No mess left behind.', body: 'The Austin family painters who finish before dinner.', cta: 'Call now' },
    lp: { url: 'wow1day.com/austin', eyebrow: 'WOW 1 DAY PAINTING', headline: 'Repaint in a day. Move back in tonight.', subhead: 'Interior repaints for Austin families. In by 8am, out by 6pm. No second-day mess.', cta: 'Book 1-day repaint', ctaColor: '#92400E', sections: ['1-day completion', 'Family-friendly', 'Insured + bonded', 'No second-day mess'] },
  },
  'cfc-12': {
    hookPattern: 'Local-intent stack',
    hookLine: 'House Painters Near Me | 1-Day Interior Repaint',
    hookInsight: 'Stacks three local-intent signals (near me, 1-day, interior) in the headline. Wins long-tail Austin searches like "house painters near me one day."',
    assets: { headline: 'House Painters Near Me | 1-Day Interior Repaint — WOW 1 DAY', body: 'Interior · Exterior · Cabinets · Trim. Done in a day. Licensed crews. 5-star reviewed in Austin.', cta: 'Book now' },
    lp: { url: 'wow1day.com/austin/interior', eyebrow: 'WOW 1 DAY PAINTING', headline: 'One crew, one day, one repainted home.', subhead: 'Interior, exterior, cabinets, trim — all in a single workday. Austin-local crews.', cta: 'Get started', ctaColor: '#92400E', sections: ['1-day completion', 'Multi-service', 'Cabinets + trim', '5-star Austin reviews'] },
  },
};

export const COMPETITOR_TABLE: CompetitorRow[] = [
  { key: 'proof', totalReach: '4.6M', avgEng: '4.1%', postsPerWeek: '14', activeAds: '20', latestActivity: 'New Google ad · 2h ago' },
  { key: 'bluenotary', totalReach: '1.2M', avgEng: '5.8%', postsPerWeek: '9', activeAds: '12', latestActivity: 'New Meta ad · 4h ago' },
  { key: 'notarypro', totalReach: '320K', avgEng: '6.3%', postsPerWeek: '6', activeAds: '4', latestActivity: 'Viral IG post · 5h ago' },
];

// ── Alerts ──────────────────────────────────────────────────────────────────

export type AlertPriority = 'high' | 'medium' | 'low';

export interface AlertAction {
  label: string;
  primary?: boolean;
}

export interface AlertItem {
  id: string;
  competitor: CompetitorKey;
  priority: AlertPriority;
  unread: boolean;
  typeIcon: string;
  typeLabel: string;
  time: string;
  headline: string;
  body: string;
  data: { label: string; tone?: 'up' | 'down' | 'flag' }[];
  actions: AlertAction[];
}

export const ALERTS: AlertItem[] = [
  {
    id: 'a1', competitor: 'proof', priority: 'high', unread: true,
    typeIcon: '💰', typeLabel: 'Pricing change', time: '2h ago',
    headline: 'Five Star launched a $1,499 whole-home interior promo for new Austin customers',
    body: "First time we've seen Five Star drop below $1,900 for a 3-bedroom interior. Their normal entry price is $2,400. This is an aggressive spring acquisition push — likely targeting move-in season homeowners who would otherwise compare to Paper Moon's per-room flat-rate.",
    data: [
      { label: 'Before: $2,400' },
      { label: 'Now: $1,499', tone: 'down' },
      { label: '-38% temporary', tone: 'flag' },
    ],
    actions: [
      { label: '→ Investigate', primary: true },
      { label: '🛡 Build counter-offer' },
      { label: 'Dismiss' },
    ],
  },
  {
    id: 'a2', competitor: 'notarypro', priority: 'high', unread: true,
    typeIcon: '📈', typeLabel: 'Performance spike', time: '5h ago',
    headline: '"Cedar Park repaint before spring break ended" post went viral — 4.8× their normal engagement',
    body: "WOW 1 DAY's IG post about finishing a 4-bedroom interior over spring break crossed 8,400 likes (their avg is 1,750). This deadline-driven storytelling format is exactly the territory you've been positioning to own. Cloning the structure could win for your brand.",
    data: [
      { label: 'Engagement: 4.8×', tone: 'up' },
      { label: '8.4K likes' },
      { label: '6.1% rate' },
    ],
    actions: [{ label: '↻ View & remix', primary: true }, { label: 'Dismiss' }],
  },
  {
    id: 'a3', competitor: 'bluenotary', priority: 'high', unread: true,
    typeIcon: '💬', typeLabel: 'Reputation', time: '1d ago',
    headline: "Paper Moon's Google rating jumped from 4.3 to 4.8 (146 new reviews this month)",
    body: "A 0.5-star jump in one month is unusual — they're either running a post-job review campaign or their crew quality genuinely improved. Worth investigating whether they've added an SMS review follow-up after final walk-through. Reviews are the #1 factor in 'painter near me' rankings.",
    data: [
      { label: 'Was: 4.3★' },
      { label: 'Now: 4.8★', tone: 'up' },
      { label: '+146 reviews', tone: 'up' },
    ],
    actions: [{ label: '→ Investigate', primary: true }, { label: 'Dismiss' }],
  },
  {
    id: 'a4', competitor: 'industry', priority: 'high', unread: true,
    typeIcon: '🌐', typeLabel: 'Category shift', time: '2d ago',
    headline: 'Sherwin-Williams just raised contractor pricing 6% — effective Austin distribution last Monday',
    body: "As of last Monday, Sherwin-Williams' contractor program added a 6% surcharge on premium exterior lines. National franchises (Five Star, WOW 1 DAY) absorb this with volume discounts. Local painters take the hit on margin. Worth reviewing whether you re-price exterior jobs or switch a tier to Benjamin Moore alternatives.",
    data: [
      { label: 'Affects: Austin market', tone: 'flag' },
      { label: 'Effective: Apr 28' },
    ],
    actions: [{ label: '🛡 Update pricing', primary: true }, { label: 'Dismiss' }],
  },
  {
    id: 'a5', competitor: 'proof', priority: 'medium', unread: true,
    typeIcon: '🚀', typeLabel: 'New ad launched', time: '3d ago',
    headline: 'Five Star launched a real-estate-listing Meta ad — first creative targeting Austin Realtors directly',
    body: '"Selling your Austin home this spring?" — a deadline-trigger hook aimed at Realtors prepping MLS photos. Different from their usual broad homeowner messaging. Already running 14 days with 3.6% CTR.',
    data: [
      { label: '410K impr' },
      { label: '3.6% CTR' },
      { label: '14d running' },
    ],
    actions: [{ label: '↻ View & remix', primary: true }, { label: 'Dismiss' }],
  },
  {
    id: 'a6', competitor: 'bluenotary', priority: 'medium', unread: true,
    typeIcon: '🏢', typeLabel: 'Org / hiring', time: '4d ago',
    headline: 'Paper Moon is hiring 12 new crew leads (Austin, Round Rock, Pflugerville, San Marcos)',
    body: "LinkedIn job listings posted last week. They're scaling crews across Central Texas — likely prepping for a summer demand push. Austin metro overlap with your service radius.",
    data: [
      { label: '12 roles' },
      { label: '4 metros', tone: 'flag' },
      { label: '$28/hr crew lead' },
    ],
    actions: [{ label: '→ Investigate', primary: true }, { label: 'Dismiss' }],
  },
  {
    id: 'a7', competitor: 'notarypro', priority: 'medium', unread: true,
    typeIcon: '📍', typeLabel: 'Google Business', time: '5d ago',
    headline: "WOW 1 DAY's Google Business rating climbed to 4.9★ (from 4.7★, +32 reviews in 30 days)",
    body: 'Direct local rival. They\'ve been actively requesting reviews same-day after job completion — visible in their recent reviews mentioning "asked if I\'d leave a review before they left." Worth replicating in your post-job follow-up.',
    data: [
      { label: 'Was: 4.7★' },
      { label: 'Now: 4.9★', tone: 'up' },
      { label: '+32 reviews', tone: 'up' },
    ],
    actions: [
      { label: '→ Investigate', primary: true },
      { label: '📝 Replicate flow' },
      { label: 'Dismiss' },
    ],
  },
  {
    id: 'a8', competitor: 'proof', priority: 'medium', unread: false,
    typeIcon: '💬', typeLabel: 'Sentiment shift', time: '6d ago',
    headline: "Five Star's brand sentiment dropped 8pp this week (3 negative NextDoor + Reddit threads)",
    body: 'Coverage focused on Five Star\'s subcontracted crews showing up with different painters mid-job. Negative chatter spiked in Austin NextDoor groups. Opportunity to position CertaPro as the "same crew, start to finish" alternative.',
    data: [
      { label: 'Was: 72% positive' },
      { label: 'Now: 64% positive', tone: 'down' },
      { label: '-8pp', tone: 'down' },
    ],
    actions: [
      { label: '📝 Draft counter-content', primary: true },
      { label: 'Dismiss' },
    ],
  },
  {
    id: 'a9', competitor: 'bluenotary', priority: 'low', unread: false,
    typeIcon: '🎯', typeLabel: 'Positioning shift', time: '1w ago',
    headline: 'Paper Moon added an /commercial landing page',
    body: "First time they've directly targeted commercial / property-management clients (was previously pure residential). Page promises dedicated account manager + after-hours scheduling + multi-property pricing. They're moving up-market — leaves the residential-with-HOA niche open.",
    data: [
      { label: 'New page: /commercial' },
      { label: 'Up-market move', tone: 'flag' },
    ],
    actions: [{ label: '🌐 View page', primary: true }, { label: 'Dismiss' }],
  },
  {
    id: 'a10', competitor: 'proof', priority: 'low', unread: false,
    typeIcon: '🔁', typeLabel: 'Creative refresh', time: '1w ago',
    headline: 'Five Star refreshed their Google ad headline — 3rd refresh this month, fastest in your set',
    body: 'New headline: "Austin House Painters | Free Color Consult." Their previous headline ("House Painters Austin | 2-Year Warranty") ran 14 days; the new one launched 6 days ago and is still active. Hook pattern is "local intent + free offer" — they\'re iterating fast, worth A/B testing a similar structure.',
    data: [
      { label: '3 refreshes / 30d', tone: 'flag' },
      { label: 'Prev creative: 14d' },
      { label: 'New creative: 6d active', tone: 'up' },
    ],
    actions: [{ label: '↻ View ad', primary: true }, { label: 'Dismiss' }],
  },
  {
    id: 'a11', competitor: 'industry', priority: 'low', unread: false,
    typeIcon: '🌐', typeLabel: 'Category shift', time: '1w ago',
    headline: 'Google rolling out "verified contractor" badges for licensed painters in Local Services Ads',
    body: "Google's Local Services program will now flag painters with verified license + insurance docs. Could affect ranking for \"painter near me\" search terms. Currently low-impact (Austin pilot only) but worth uploading your license + insurance before the rollout completes.",
    data: [
      { label: 'Austin pilot' },
      { label: 'Effective: Q3' },
    ],
    actions: [{ label: 'Dismiss' }],
  },
  {
    id: 'a12', competitor: 'notarypro', priority: 'low', unread: false,
    typeIcon: '🚀', typeLabel: 'New ad launched', time: '2w ago',
    headline: 'WOW 1 DAY launched a cabinet-refinishing Meta ad with 48-hour turnaround guarantee',
    body: '"Old kitchen, new cabinets — in 48 hours." Cabinet refinishing as a standalone bundle — matches your positioning. 7.4% CTR after 12 days, their highest-performing Meta ad to date.',
    data: [
      { label: '7.4% CTR' },
      { label: '84K impr' },
      { label: '12d running' },
    ],
    actions: [{ label: '↻ View & remix', primary: true }, { label: 'Dismiss' }],
  },
];

// ── Meta Ads competitor cards ──────────────────────────────────────────────

export interface MetaAdCard {
  id: string;
  competitor: CompetitorKey;
  body: string;
  image: string; // emoji glyph
  grad: number;
  brand: string;
  sub: string;
  cta: string;
  running: string; // "Running 32 days"
  signals: [PerfSignal, PerfSignal];
}

const PERF_M = {
  viral: (label: string, value: string): PerfSignal => ({ tone: 'viral', icon: '🔥', label, value }),
  above: (label: string, value: string): PerfSignal => ({ tone: 'above', icon: '↑', label, value }),
  typical: (label: string, value: string): PerfSignal => ({ tone: 'typical', icon: '≈', label, value }),
  below: (label: string, value: string): PerfSignal => ({ tone: 'below', icon: '↓', label, value }),
  brand: (value: string): PerfSignal => ({ tone: 'brand-hit', icon: '🎯', label: 'For your brand', value }),
};

export const META_AD_CARDS: MetaAdCard[] = [
  {
    id: 'mac-1', competitor: 'proof',
    body: 'Selling your Austin home this spring? Repaint the exterior in a weekend. Five Star handles prep, paint, and cleanup so you can list MLS-ready.',
    image: '🏠', grad: 3, brand: 'fivestarpainting.com', sub: 'Free estimate', cta: 'Get quote',
    running: 'Running 32 days',
    signals: [PERF_M.above('Creative status', 'Long-running'), PERF_M.brand('Brand match')],
  },
  {
    id: 'mac-2', competitor: 'bluenotary',
    body: '"Why pay $1,200+ for a single room when Paper Moon does it for $499 flat? Walls, trim, and ceiling all included."',
    image: '🎨', grad: 5, brand: 'papermoonpainting.com', sub: 'Save 50% — flat rate', cta: 'Book now',
    running: 'Running 21 days',
    signals: [PERF_M.typical('Creative status', 'Active'), PERF_M.below('For your brand', 'Off-brand')],
  },
  {
    id: 'mac-3', competitor: 'notarypro',
    body: '"Interior repaint · Done in 1 day · Move back in tonight · No mess left behind. The Austin family painters who finish before dinner."',
    image: '🖌️', grad: 8, brand: 'wow1day.com/austin', sub: 'Book 1-day repaint', cta: 'Call now',
    running: 'Running 28 days',
    signals: [PERF_M.typical('Creative status', 'Active'), PERF_M.brand('Brand match')],
  },
  {
    id: 'mac-4', competitor: 'proof',
    body: 'HOA board members: tired of explaining "the paint guy" to your neighbors? Five Star delivers community-wide repaints on a fixed timeline. Same color, every house, every time.',
    image: '🏘️', grad: 2, brand: 'fivestarpainting.com/hoa', sub: 'HOA portfolio', cta: 'Request bid',
    running: 'Running 14 days',
    signals: [PERF_M.typical('Creative status', 'Active'), PERF_M.brand('Brand match')],
  },
  {
    id: 'mac-5', competitor: 'bluenotary',
    body: '"Crew leads: earn $28/hr, set your own jobs, work close to home in the Austin metro. Apply in 60 seconds."',
    image: '🪜', grad: 6, brand: 'papermoonpainting.com/jobs', sub: 'Apply in 60 seconds', cta: 'Join now',
    running: 'Running 9 days',
    signals: [PERF_M.below('Creative status', 'Just launched'), PERF_M.below('For your brand', 'Off-brand')],
  },
  {
    id: 'mac-6', competitor: 'notarypro',
    body: '"Tired of your kitchen cabinets? We refinish in 48 hours flat — no demo, no new install. Cabinets + walls + trim, one Austin crew."',
    image: '🪵', grad: 7, brand: 'wow1day.com/cabinets', sub: 'Cabinet refinish', cta: 'Get a quote',
    running: 'Running 12 days',
    signals: [PERF_M.typical('Creative status', 'Active'), PERF_M.brand('Brand match')],
  },
];

// ── Google Ads competitor cards ────────────────────────────────────────────

export interface GoogleAdCard {
  id: string;
  competitor: CompetitorKey;
  url: string;
  headline: string;
  desc: string;
  sitelinks: string[];
  meta: string; // "Running 67 days · #1 spender in your space"
  signals: [PerfSignal, PerfSignal];
}

export const GOOGLE_AD_CARDS: GoogleAdCard[] = [
  {
    id: 'gcc-1', competitor: 'proof',
    url: 'www.fivestarpainting.com/south-austin',
    headline: 'Austin House Painters | Free Color Consult — Five Star Painting',
    desc: 'Backed by Neighborly. 2-year workmanship warranty. Interior + exterior. Free estimate in 24 hrs.',
    sitelinks: ['Pricing', 'Interior', 'Free estimate'],
    meta: 'Running 67 days · #1 spender in your space',
    signals: [PERF_M.viral('Creative status', 'Workhorse'), PERF_M.brand('Brand match')],
  },
  {
    id: 'gcc-2', competitor: 'bluenotary',
    url: 'www.papermoonpainting.com/austin',
    headline: 'Paper Moon Painting Austin — Flat $499 Room Refresh | 1-Week Turnaround',
    desc: 'No upcharges. No surprises. Licensed + insured. Walls, trim, ceiling included. Book online.',
    sitelinks: ['$499 flat', 'For commercial', 'Book now'],
    meta: 'Running 38 days · Best CTR in your space',
    signals: [PERF_M.above('Creative status', 'Long-running'), PERF_M.typical('For your brand', 'Neutral')],
  },
  {
    id: 'gcc-3', competitor: 'notarypro',
    url: 'www.wow1day.com/austin/interior',
    headline: 'House Painters Near Me | 1-Day Interior Repaint — WOW 1 DAY',
    desc: 'Interior · Exterior · Cabinets · Trim. Done in a day. Licensed crews. 5-star reviewed in Austin.',
    sitelinks: ['Interior repaint', 'Cabinets', 'Exterior'],
    meta: 'Running 41 days · Highest local intent CTR',
    signals: [PERF_M.above('Creative status', 'Long-running'), PERF_M.brand('Brand match')],
  },
];

// ── Own campaigns (Meta + Google) ─────────────────────────────────────────

export interface OwnMetaCampaign {
  name: string;
  budgetDaily: string;
  spend: string;
  results: string;
  cpr: string;
  status: 'Draft' | 'Live' | 'Paused';
}

export const OWN_META_CAMPAIGNS: OwnMetaCampaign[] = [
  { name: 'CertaPro Austin — Interior Repaint — 1778876374', budgetDaily: '$10', spend: '$--.--', results: 'n/a', cpr: '$--.--', status: 'Draft' },
  { name: 'CertaPro Austin — HOA Exterior — 1778876370', budgetDaily: '$10', spend: '$--.--', results: 'n/a', cpr: '$--.--', status: 'Draft' },
  { name: 'CertaPro Austin — Cabinet Refinish — 1778552792', budgetDaily: '$10', spend: '$--.--', results: 'n/a', cpr: '$--.--', status: 'Draft' },
];

export interface OwnGoogleCampaign {
  name: string;
  type: string;
  spend: string;
  clicks: string;
  conversions: string;
  rate: string;
  cpa: string;
  roas: string;
  status: 'Draft' | 'Live' | 'Paused';
}

export const OWN_GOOGLE_CAMPAIGNS: OwnGoogleCampaign[] = [
  { name: 'Interior Repaint — Austin', type: 'Search', spend: '$0', clicks: '0', conversions: '0', rate: '0% rate', cpa: '$0', roas: '0.0x', status: 'Draft' },
];

// ── Landscape: categories + diff cards ────────────────────────────────────

export interface LandscapeCompetitor {
  name: string;
  initials: string;
  color: string;
  desc: string;
}

export interface LandscapeCategory {
  title: string;
  sub: string;
  items: LandscapeCompetitor[];
}

export const LANDSCAPE_CATEGORIES: LandscapeCategory[] = [
  {
    title: 'National franchise leaders',
    sub: 'Multi-state brands winning on awareness and SEO.',
    items: [
      { name: 'Five Star Painting of South Austin', initials: 'FS', color: '#1A0DAB', desc: 'Neighborly-backed national franchise. 150,000+ homes painted. Strong on warranties + Realtor referrals.' },
      { name: 'WOW 1 DAY PAINTING Austin', initials: 'WD', color: '#92400E', desc: 'National franchise leaning on 1-day completion. Strong with families and time-pressed sellers.' },
      { name: 'CertaPro Painters (other metros)', initials: 'CP', color: '#10B981', desc: 'Your parent network in other markets. Sibling visibility you can borrow brand equity from.' },
      { name: 'Sherwin-Williams Paint Services', initials: 'SW', color: '#374151', desc: 'Manufacturer-led painting service piloting in Austin. Bundled with paint sales.' },
      { name: 'PaintZen / Handy partners', initials: 'PZ', color: '#0891B2', desc: 'Marketplace players matching homeowners with crews. Win on speed-to-quote, not relationship.' },
    ],
  },
  {
    title: 'Direct local rivals',
    sub: 'Austin painters with similar residential + commercial bundles.',
    items: [
      { name: 'Paper Moon Painting', initials: 'PM', color: '#2563EB', desc: 'Mid-size Austin local with strong IG presence. Flat-rate room pricing + cabinet refinish niche.' },
      { name: 'Spectrum Painting Austin', initials: 'SP', color: '#0EA5E9', desc: 'All-in-one residential brand. Interior + exterior + cabinets + deck staining.' },
      { name: 'Maverick Painting', initials: 'MP', color: '#7C2D12', desc: 'Hill Country–focused. Strong on McMansion exteriors and high-end interior repaints.' },
      { name: 'True Hue Painting', initials: 'TH', color: '#6B7280', desc: 'Small but well-reviewed. Custom color matching + boutique design partnerships.' },
    ],
  },
  {
    title: 'Adjacent substitutes',
    sub: 'Homeowners default to these when paint feels overwhelming.',
    items: [
      { name: 'Handyman services', initials: 'HM', color: '#D97706', desc: 'Casual labor for small touch-ups. Win when proximity and price are the only priorities.' },
      { name: 'DIY (Home Depot / Lowe\'s)', initials: 'DH', color: '#1E40AF', desc: 'Free if you have the weekend. Wins when budgets are tight or the job is small.' },
      { name: 'General contractors', initials: 'GC', color: '#7C3AED', desc: 'When a renovation is already in motion, the GC subcontracts the painting.' },
      { name: 'Pressure-wash + restore', initials: 'PW', color: '#EC4899', desc: 'Compete for "make-it-look-fresh" exterior money without a full repaint.' },
    ],
  },
];

export interface DiffCard {
  competitorName: string;
  initials: string;
  color: string;
  bullets: string[];
}

export const DIFF_CARDS: DiffCard[] = [
  {
    competitorName: 'Five Star Painting of South Austin',
    initials: 'FS', color: '#1A0DAB',
    bullets: [
      'Same-crew accountability — not the rotating subcontractors customers complain about.',
      'Local Austin ownership — neighbors hiring neighbors, not franchise call centers.',
      'Broader practical bundle: cabinet refinish, deck staining, HOA scopes, stucco patches.',
      'Higher-touch urgency: hot-weather scheduling, weekend MLS-photo turnarounds, evening commercial work.',
    ],
  },
  {
    competitorName: 'Paper Moon Painting',
    initials: 'PM', color: '#2563EB',
    bullets: [
      'Custom color matching and design-grade prep — not a one-size-flat-rate room.',
      'HOA + commercial credentialing they don\'t carry.',
      'Multi-property usefulness — one contact for the whole portfolio.',
    ],
  },
  {
    competitorName: 'WOW 1 DAY PAINTING Austin',
    initials: 'WD', color: '#92400E',
    bullets: [
      'Customers want a job that lasts — not a job rushed to fit a one-day promise.',
      'Same crew on day-one and day-two when scope grows mid-job.',
      'Quality cure time on south-facing Austin exteriors — UV-stable paint applied properly.',
    ],
  },
  {
    competitorName: 'Local multi-service operators',
    initials: 'MP', color: '#92400E',
    bullets: [
      'Sharper response time. Win the listing-deadline moment.',
      'Clearer pricing. "Painter near me" shoppers leave when quotes feel murky.',
      'Stronger reviews + tighter neighborhood density = better discoverability.',
      'Service mix that feels coherent — exterior, interior, cabinets, decks — not generic.',
    ],
  },
];

// ── Competitor Detail data ────────────────────────────────────────────────

export interface CompetitorProfile {
  domain: string;
  reach: string;
  trackingSince: string;
  description: string;
  kpi: { totalReach: string; avgEng: string; postsPerWeek: string; activeAds: string; trendReach: string; trendEng: string; trendPosts: string; trendAds: string };
  win: string;
  theirs: string;
  channels: { name: string; followers: string; activity: string; status: 'Live' | 'Watching' | 'Quiet' }[];
}

export const COMPETITOR_PROFILES: Record<CompetitorKey, CompetitorProfile> = {
  proof: {
    domain: 'fivestarpainting.com/south-austin',
    reach: '150,000+ homes painted · all channels',
    trackingSince: 'Tracking since Mar 12',
    description:
      'Neighborly-backed national painting franchise. South Austin location is one of their fastest-growing. Positions around a 2-year workmanship warranty, free color consults, Realtor partnerships, and franchise-wide quality controls.',
    kpi: { totalReach: '4.6M', avgEng: '4.1%', postsPerWeek: '14', activeAds: '20', trendReach: '↑ 8% mo/mo', trendEng: '↑ 0.3pp', trendPosts: '↑ 3 vs last month', trendAds: '↑ 4 since last week' },
    win: 'Same-crew accountability > franchise scale. Be the painter who shows up day-one and day-five with the same faces. Win on local Austin ownership, broader scope (cabinets + HOA + deck), and hot-weather scheduling expertise.',
    theirs: 'Franchise brand trust, warranty marketing, Realtor referral network, paid search dominance. Best when customers want a recognizable national name rather than a neighbor who runs the whole job.',
    channels: [
      { name: 'Instagram', followers: '397K followers', activity: 'Posts 4×/wk', status: 'Live' },
      { name: 'LinkedIn', followers: '88K followers', activity: 'Posts 5×/wk', status: 'Live' },
      { name: 'Google Ads', followers: '24 active ads', activity: 'Spending heavily', status: 'Live' },
      { name: 'Meta Ads', followers: '12 active ads', activity: 'Refreshed weekly', status: 'Live' },
    ],
  },
  bluenotary: {
    domain: 'papermoonpainting.com',
    reach: '1.2M monthly reach · 4 channels',
    trackingSince: 'Tracking since Mar 18',
    description:
      'Mid-size Austin upstart with strong Instagram presence. Wins on flat-rate per-room pricing ($499/room with walls + trim + ceiling) and a clean booking UX. Just opened a /commercial page — clearly pushing up-market.',
    kpi: { totalReach: '1.2M', avgEng: '5.8%', postsPerWeek: '9', activeAds: '12', trendReach: '↑ 14% mo/mo', trendEng: '↑ 0.6pp', trendPosts: '↑ 2 vs last month', trendAds: 'Steady' },
    win: 'Custom color match + design-grade prep work for jobs that aren\'t cookie-cutter. HOA + commercial credentialing they\'re still building. Multi-property usefulness for property managers.',
    theirs: 'Lowest-friction pricing for single-room jobs ($499 flat). Best for price-sensitive first-time customers who pre-decided that fast + cheap is fine.',
    channels: [
      { name: 'Instagram', followers: '142K followers', activity: 'Posts 3×/wk', status: 'Live' },
      { name: 'LinkedIn', followers: '54K followers', activity: 'Posts 2×/wk', status: 'Live' },
      { name: 'Google Ads', followers: '8 active ads', activity: 'New ad 4d ago', status: 'Live' },
      { name: 'Meta Ads', followers: '6 active ads', activity: 'Refreshed weekly', status: 'Live' },
    ],
  },
  notarypro: {
    domain: 'wow1day.com/austin',
    reach: '320K monthly reach · 4 channels',
    trackingSince: 'Tracking since Mar 22',
    description:
      'Direct local rival. National franchise built on the "done in a day" promise — interior, exterior, cabinets, trim. Strong organic storytelling about emotional family moments (spring break repaints, move-in deadlines).',
    kpi: { totalReach: '320K', avgEng: '6.3%', postsPerWeek: '6', activeAds: '4', trendReach: '↑ 22% mo/mo', trendEng: '↑ 1.2pp', trendPosts: 'Steady', trendAds: '↑ 1 since last week' },
    win: 'Sharper response time. Clearer pricing. Stronger reviews + tighter Austin density = better local discoverability. Service mix that feels coherent — and built around quality cure time, not a marketing deadline.',
    theirs: 'Authentic family storytelling about deadline-driven repaints (spring break, move-in, holidays). Strong local reputation in North + Northwest Austin. Hard to fake.',
    channels: [
      { name: 'Instagram', followers: '24K followers', activity: 'Viral post 5h ago', status: 'Live' },
      { name: 'LinkedIn', followers: '7K followers', activity: 'Posts 2×/wk', status: 'Live' },
      { name: 'Google Ads', followers: '2 active ads', activity: 'Steady', status: 'Live' },
      { name: 'Meta Ads', followers: '2 active ads', activity: 'New cabinet ad', status: 'Live' },
    ],
  },
  industry: {
    domain: '—',
    reach: '—',
    trackingSince: '—',
    description: 'Industry-wide signals — paint manufacturer pricing, regulatory shifts, search-engine changes, and category trends affecting every painter in the Austin metro.',
    kpi: { totalReach: '—', avgEng: '—', postsPerWeek: '—', activeAds: '—', trendReach: '—', trendEng: '—', trendPosts: '—', trendAds: '—' },
    win: '—',
    theirs: '—',
    channels: [],
  },
};

export const SUGGESTED_ADD_COMPETITORS: { key: string; name: string; initials: string; color: string }[] = [
  { key: 'proof', name: 'Five Star Painting of South Austin', initials: 'FS', color: '#1A0DAB' },
  { key: 'bluenotary', name: 'Paper Moon Painting', initials: 'PM', color: '#2563EB' },
  { key: 'spectrum', name: 'Spectrum Painting Austin', initials: 'SP', color: '#10B981' },
  { key: 'maverick', name: 'Maverick Painting', initials: 'MP', color: '#374151' },
  { key: 'truehue', name: 'True Hue Painting', initials: 'TH', color: '#0891B2' },
];
