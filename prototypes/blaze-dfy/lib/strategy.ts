/**
 * AI-prefilled strategy + creative content, generated from each account's
 * profile. Stands in for real model output - tailored per account but
 * deterministic, and fully editable in the UI.
 */

import type {
  Account, BrandContext, CreativeGuidelines, Competitor, AuditDimension,
  Goals, CampaignTheme, GeneratedAsset, AssetType, SeoKeyword, WeekTheme,
  SwipeItem, Scorecard, ScorecardArea,
} from './types';

export const AUDIT_DIMENSIONS: AuditDimension[] = ['Awareness', 'Lead Gen', 'Website', 'Conversion', 'Reputation'];

export function brandContext(a: Account): BrandContext {
  const svc = servicesFor(a);
  return {
    businessOverview: `${a.name} is a ${a.industry.toLowerCase()} business based in ${a.location}. They've built a loyal local following on word-of-mouth and repeat work, and now want a consistent marketing engine to fill their pipeline without ${a.poc.name.split(' ')[0]} having to run it day-to-day. Their edge is craftsmanship, responsiveness, and deep roots in the ${a.location.split(',')[0]} community.`,
    customerSegments: [
      { name: 'Homeowners nearby', detail: `Residents within ~25 miles of ${a.location.split(',')[0]} researching ${a.industry.toLowerCase()} for the first time.` },
      { name: 'Repeat & referral', detail: 'Past customers and the people they refer - highest-intent, lowest-cost segment.' },
      { name: 'Local businesses', detail: 'Property managers and small commercial accounts needing recurring work.' },
    ],
    services: svc.map((s) => ({ name: s, detail: `Core offering - strong margin and clear demand in ${a.location.split(',')[0]}.` })),
    founderBio: `${a.poc.name}${a.poc.role ? ` (${a.poc.role})` : ''} started ${a.name} after years in the trade, frustrated by the gap between great work and great marketing. Hands-on, detail-obsessed, and proud of the team's reputation for showing up and doing it right.`,
  };
}

/** Brand context as editable markdown strings (one per field). */
export function brandContextMarkdown(a: Account): { overview: string; segments: string; services: string; bio: string } {
  const c = brandContext(a);
  return {
    overview: c.businessOverview,
    segments: c.customerSegments.map((s) => `- ${s.name} - ${s.detail}`).join('\n'),
    services: c.services.map((s) => `- ${s.name} - ${s.detail}`).join('\n'),
    bio: c.founderBio,
  };
}

function servicesFor(a: Account): string[] {
  const map: Record<string, string[]> = {
    'woody-creek': ['Garage floor coatings', 'Patio & deck resurfacing', 'Commercial epoxy', 'Concrete repair'],
    'myfitstrip': ['Group HIIT classes', 'Personal training', 'Nutrition coaching', 'Membership plans'],
    'magid-inc': ['Roof replacement', 'Kitchen & bath remodels', 'Storm damage repair', 'Additions'],
    'hollyfit': ['1:1 coaching', 'Small-group training', 'Online programs', 'Nutrition plans'],
    'grain-design-flooring': ['Hardwood installation', 'Luxury vinyl plank', 'Refinishing & restaining', 'Commercial flooring'],
    'hawaii-hideaways': ['Vacation rental management', 'Guest concierge', 'Cleaning & turnover', 'Owner reporting'],
    'clean-supplements': ['Daily greens', 'Protein blends', 'Subscriptions', 'Bundles'],
  };
  return map[a.id] ?? ['Core service', 'Add-on service', 'Maintenance plan'];
}

export function creativeGuidelines(a: Account): CreativeGuidelines {
  const city = a.location.split(',')[0];
  return {
    taglines: [
      `Done right, by ${city}'s own.`,
      `${a.name} - built on referrals.`,
      `Your project, handled.`,
    ],
    toneSummary: `Warm, confident, and local. Speak like a trusted neighbor who happens to be the best in town - never corporate, never hypey. Lead with proof (photos, reviews, years in business) over adjectives.`,
    toneExamples: [
      { do: `"We'll be there Tuesday at 8 - and we'll text when we're 20 minutes out."`, dont: `"Leveraging best-in-class solutions for optimal outcomes."` },
      { do: `"500+ ${city} driveways and counting."`, dont: `"Industry-leading quality you can trust!"` },
    ],
    vocabulary: [
      { term: city, meaning: 'Always name the town - local is the whole pitch.' },
      { term: 'Free estimate', meaning: 'Preferred CTA over "quote" or "consultation".' },
      { term: 'Crew', meaning: 'Use "crew"/"team", not "technicians" or "associates".' },
    ],
  };
}

const COMP_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

export function competitors(a: Account): Competitor[] {
  const city = a.location.split(',')[0];
  const names: [string, string][] = [
    [`${city} Pro ${shortKind(a)}`, 'Established local leader with strong reviews.'],
    [`${shortKind(a)} Co.`, 'Aggressive on paid search, thin on organic.'],
    [`Bright ${shortKind(a)}`, 'Newer, heavy on social, weak website.'],
  ];
  return names.map(([name, note], i) => ({
    name,
    initials: name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase(),
    color: COMP_COLORS[i % COMP_COLORS.length],
    note,
    scores: {
      Awareness: [78, 64, 52][i],
      'Lead Gen': [70, 75, 40][i],
      Website: [82, 55, 38][i],
      Conversion: [68, 60, 45][i],
      Reputation: [88, 58, 62][i],
    },
  }));
}

/** "Us" baseline scores so the audit can show a comparison. */
export function ourScores(): Record<AuditDimension, number> {
  return { Awareness: 42, 'Lead Gen': 38, Website: 55, Conversion: 48, Reputation: 71 };
}

function shortKind(a: Account): string {
  const k = a.industry.split(/[&,]/)[0].trim();
  return k.split(' ').slice(-1)[0];
}

export function goals(a: Account): Goals {
  const city = a.location.split(',')[0];
  return {
    thirty: `Stand up always-on Meta + local SEO. Ship the first campaign and get 3+ reviews from recent jobs.`,
    sixty: `Double inbound estimate requests vs. baseline. Add email follow-up for every lead. Launch a second seasonal campaign.`,
    ninety: `Predictable pipeline: 20+ qualified leads/month from owned channels, with cost-per-lead trending down and a content calendar two months ahead.`,
    channels: channelsFor(a),
    drivingGrowth: 'Referrals and repeat work drive most revenue today; almost nothing is coming from paid or organic search yet.',
    worked: 'Word of mouth, truck/job-site visibility, and the occasional Facebook post that happened to take off.',
    notWorked: 'Boosted posts with no targeting, a stale website that doesn\'t rank, and inconsistent follow-up with leads.',
    companyEvents: [
      { date: '2026-07-04', label: 'Summer promo window' },
      { date: '2026-09-01', label: 'Fall booking push' },
    ],
    industryEvents: [
      { date: '2026-06-15', label: `Peak ${city} season begins` },
      { date: '2026-07-20', label: 'Mid-summer demand peak' },
      { date: '2026-09-08', label: 'Fall planning / back-to-business' },
      { date: '2026-11-28', label: 'Holiday / year-end demand' },
      { date: '2027-01-12', label: 'New-year home-improvement surge' },
      { date: '2027-03-15', label: 'Spring season ramp-up' },
      { date: '2027-05-10', label: 'Pre-summer booking rush' },
    ],
  };
}

function channelsFor(a: Account): string[] {
  const base = ['Meta Ads', 'Local SEO', 'Google Business Profile', 'Email'];
  if (a.industry.toLowerCase().includes('fitness') || a.id === 'hollyfit') return ['Instagram', 'Meta Ads', 'Email', 'Local SEO'];
  if (a.id === 'hawaii-hideaways') return ['Instagram', 'Airbnb/VRBO', 'Email', 'Paid Search'];
  if (a.id === 'clean-supplements') return ['Instagram', 'TikTok', 'Email', 'Paid Social'];
  return base;
}

export function campaignThemes(a: Account): CampaignTheme[] {
  const city = a.location.split(',')[0];
  const themes: Record<string, CampaignTheme[]> = {
    'woody-creek': [
      { id: 'garage-season', title: 'Garage Season', angle: 'Transform your garage floor before fall - one-day installs.', recommended: true },
      { id: 'patio-refresh', title: 'Patio Refresh', angle: 'Outdoor living upgrades for summer entertaining.' },
      { id: 'before-after', title: 'Before & After', angle: 'Real Woody Creek jobs, dramatic transformations.' },
    ],
  };
  return themes[a.id] ?? [
    { id: 'season-launch', title: `${city} Season Launch`, angle: `Kick off peak season with a local-first offer.`, recommended: true },
    { id: 'proof', title: 'Proof & Reviews', angle: 'Lead with real results and 5-star reviews.' },
    { id: 'new-customer', title: 'New Customer Offer', angle: 'First-time offer to convert nearby researchers.' },
  ];
}

/* ─── Phase 3 generated assets ───────────────────────────────────────────── */
const ASSET_PLAN: [AssetType, number][] = [
  ['Still Image', 3], ['Video', 3], ['Carousel', 3], ['Story', 3],
  ['Search Ad', 3], ['Meta Ad', 3], ['Blog Post', 3], ['Email', 3],
];

export function generatedAssets(a: Account, themeTitle: string): GeneratedAsset[] {
  const city = a.location.split(',')[0];
  const out: GeneratedAsset[] = [];
  let seed = 1;
  for (const [type, count] of ASSET_PLAN) {
    for (let i = 1; i <= count; i++) {
      out.push({
        id: `${type.replace(/\s/g, '-').toLowerCase()}-${i}`,
        type,
        topic: `${themeTitle}: ${topicFor(type, i, a)}`,
        caption: captionFor(type, a, city, themeTitle),
        overlay: overlayFor(type, i, city),
        seed: seed++,
      });
    }
  }
  return out;
}

function topicFor(type: AssetType, i: number, a: Account): string {
  const ideas = ['hero shot', 'customer story', 'before/after', 'team at work', 'offer spotlight', 'FAQ', 'tips', 'testimonial'];
  return `${type} - ${ideas[(i - 1) % ideas.length]}`;
}
function captionFor(type: AssetType, a: Account, city: string, theme: string): string {
  return `${theme} is here. ${a.name} brings ${city} the work it can count on - book your free estimate this week and see the difference a local crew makes.`;
}
function overlayFor(type: AssetType, i: number, city: string): string {
  const overlays = [`${city}'s #1 crew`, 'Free estimate', 'Book this week', 'Done in a day', '500+ jobs'];
  return overlays[(i - 1) % overlays.length];
}

export function seoKeywords(a: Account): SeoKeyword[] {
  const city = a.location.split(',')[0].toLowerCase();
  const kind = shortKind(a).toLowerCase();
  return [
    { keyword: `${kind} ${city}`, intent: 'Local', volume: '1.2k/mo', difficulty: 'Medium', why: 'Core local term with clear buying intent. You should own the map pack for this.' },
    { keyword: `${kind} near me`, intent: 'Local', volume: '3.4k/mo', difficulty: 'High', why: 'Highest-volume local search. Competitive, but the payoff is the biggest demand pool.' },
    { keyword: `best ${kind} ${city}`, intent: 'Commercial', volume: '480/mo', difficulty: 'Low', why: 'Low difficulty + comparison intent. A "best of" page can rank fast and convert.' },
    { keyword: `${kind} cost`, intent: 'Informational', volume: '2.1k/mo', difficulty: 'Medium', why: 'Top research question. A pricing-explainer post captures leads early in the journey.' },
    { keyword: `affordable ${kind}`, intent: 'Commercial', volume: '720/mo', difficulty: 'Low', why: 'Price-sensitive buyers ready to act; easy win that fills the funnel.' },
    { keyword: `${kind} reviews ${city}`, intent: 'Commercial', volume: '210/mo', difficulty: 'Low', why: 'Reputation-driven intent. Plays to your review strength from the audit.' },
  ];
}

/* ─── Phase 3 campaign calendar ──────────────────────────────────────────── */
export const POST_TYPES = ['Still Image', 'Video', 'Carousel', 'Story', 'Blog Post', 'Email'] as const;
export const CHANNELS = ['Instagram', 'Facebook', 'Meta Ads', 'Google', 'Email', 'TikTok'] as const;
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export function seasonalThemes(a: Account): WeekTheme[] {
  const city = a.location.split(',')[0] || 'town';
  return [
    { week: 'Jun 8', title: 'Kickoff & meet the crew', description: `Introduce ${a.name} to ${city} - who we are, what we do, and a first-week offer to drive early estimate requests.`, season: 'Early summer' },
    { week: 'Jun 15', title: 'Before & after spotlight', description: 'Lead with a dramatic transformation from a recent job. Carousel + reel; strongest proof content of the month.', season: 'Early summer' },
    { week: 'Jun 22', title: 'Customer review roundup', description: 'Turn 5-star reviews into shareable social proof. Pair quotes with the work they reference.', season: 'Summer' },
    { week: 'Jun 29', title: 'July 4th promo window', description: 'Holiday-timed limited offer with urgency. Heaviest paid push of the two months.', season: 'Holiday' },
    { week: 'Jul 6', title: 'Education / FAQ series', description: `Answer the top questions ${city} customers ask before buying - builds trust and captures search intent.`, season: 'Summer' },
    { week: 'Jul 13', title: 'Limited-time summer offer', description: 'Mid-summer conversion push. Retarget engaged viewers from the first three weeks.', season: 'Summer' },
    { week: 'Jul 20', title: 'Behind the scenes with the team', description: 'Humanize the brand - crew at work, day-in-the-life, the care that goes into each job.', season: 'Summer' },
    { week: 'Jul 27', title: 'Fall booking pre-launch', description: 'Tee up the fall season with an early-bird booking incentive to smooth the pipeline.', season: 'Late summer' },
  ];
}

/* ─── Swipe file - competitor/benchmark references to react to ───────────── */
export function swipeFile(a: Account): SwipeItem[] {
  const comps = competitors(a);
  const city = a.location.split(',')[0] || 'your market';
  const items: SwipeItem[] = [
    { id: 'sw1', source: comps[0].name, channel: 'Instagram', headline: 'Before/after carousel - driveway transformation', note: 'Clean split layout, bold result, one-line caption. Posts ~12×/mo.', seed: 1 },
    { id: 'sw2', source: comps[1].name, channel: 'Meta Ad', headline: '"Free estimate this week" lead ad', note: 'Strong offer + urgency. Runs continuously in ' + city + '.', seed: 5 },
    { id: 'sw3', source: comps[2].name, channel: 'TikTok', headline: 'Day-in-the-life crew reel', note: 'High-reach format; authentic, unpolished. Worth testing.', seed: 3 },
    { id: 'sw4', source: comps[0].name, channel: 'Website', headline: 'Hero: "Book a free consultation"', note: 'Single clear CTA above the fold + review stars.', seed: 8 },
  ];
  return items;
}

/** Synthesized creative preferences - what we learned from client feedback.
 *  These persist to the Brand Kit and steer future generations. */
export function creativePreferences(a: Account): { learned: string[]; avoid: string[] } {
  const city = a.location.split(',')[0] || 'town';
  return {
    learned: [
      'Lead with real before/after photos over stock imagery.',
      'Shorter, punchier captions - one clear idea per post.',
      `Always name ${city} and include a “free estimate” call-to-action.`,
      'Show the crew and the work in progress, not just finished results.',
    ],
    avoid: [
      'Corporate or hype-y language ("best-in-class", "synergy").',
      'Busy graphics with more than one message.',
    ],
  };
}

/* ─── Business scorecard (audit) ─────────────────────────────────────────── */
export function scorecard(a: Account): Scorecard {
  const city = a.location.split(',')[0] || 'your area';
  const comp = competitors(a)[0].name;
  const areas: ScorecardArea[] = [
    {
      number: 1, eyebrow: 'Presence & Awareness', title: 'Show up where your customers already are',
      platforms: ['IG', 'FB', 'Google', 'TikTok'], score: 9, maxScore: 25, status: 'bad',
      checks: [
        { status: 'bad', title: 'Social posting cadence', pts: '1 / 5 pts', desc: `Last post 30+ days ago. Healthy ${city} accounts post 8–12×/month.` },
        { status: 'warn', title: 'Cross-platform coverage', pts: '2 / 5 pts', desc: 'Active on one channel. Missing the formats driving reach in your category.' },
        { status: 'bad', title: 'Google Business Profile', pts: '2 / 5 pts', desc: 'Incomplete profile, few photos, no posts - hurts local map ranking.' },
        { status: 'warn', title: 'Content variety', pts: '2 / 5 pts', desc: 'Mostly static photos. Before/after carousels + short video get 3× the reach.' },
        { status: 'bad', title: 'Branded search', pts: '2 / 5 pts', desc: `Directory sites outrank ${a.domain} for your own name.` },
      ],
    },
    {
      number: 2, eyebrow: 'Paid Ads', title: "Pour fuel on what's already working",
      platforms: ['Google', 'Meta'], score: 4, maxScore: 25, status: 'bad',
      checks: [
        { status: 'bad', title: 'Active Google Search ads', pts: '0 / 6 pts', desc: `None detected. ${comp} and others are bidding on high-intent ${city} terms now.` },
        { status: 'bad', title: 'Active Meta ads', pts: '0 / 6 pts', desc: 'Zero campaigns in the last 90 days. Competitors run always-on local reels.' },
        { status: 'bad', title: 'Branded keyword defense', pts: '0 / 5 pts', desc: "A competitor may be bidding on your business name - losing you ready-to-buy clicks." },
        { status: 'warn', title: 'Conversion tracking', pts: '4 / 8 pts', desc: 'Analytics installed but no conversion events - can\'t measure paid ROI yet.' },
      ],
    },
    {
      number: 3, eyebrow: 'Conversion', title: 'Turn more of the visitors you already have',
      platforms: ['Website', 'Lead forms'], score: 16, maxScore: 25, status: 'warn',
      checks: [
        { status: 'good', title: 'Click-to-call visible', pts: '4 / 4 pts', desc: 'Phone is in the header on every page - great for a services business.' },
        { status: 'warn', title: 'Hero CTA strength', pts: '2 / 5 pts', desc: '"Contact us" is vague. "Get a free estimate" converts 30–60% better.' },
        { status: 'bad', title: 'Mobile page speed', pts: '1 / 5 pts', desc: 'Slow LCP on mobile; ~30% of visitors bounce before the page loads.' },
        { status: 'warn', title: 'Lead form length', pts: '3 / 5 pts', desc: 'Too many fields. Trim to name, phone, ZIP, project type.' },
        { status: 'good', title: 'Trust signals', pts: '6 / 6 pts', desc: 'Reviews, licensing, and "insured" badges are visible. Solid.' },
      ],
    },
    {
      number: 4, eyebrow: 'Reputation', title: 'Make every customer your loudest salesperson',
      platforms: ['Google', 'Yelp', 'Facebook'], score: 18, maxScore: 25, status: 'warn',
      checks: [
        { status: 'good', title: 'Average rating', pts: '6 / 6 pts', desc: '4.7★ across platforms - the foundation everything else builds on.' },
        { status: 'warn', title: 'Review volume', pts: '3 / 5 pts', desc: `Behind the top ${city} competitors on total reviews - a ranking signal.` },
        { status: 'bad', title: 'Review velocity', pts: '1 / 5 pts', desc: 'Few new reviews/month. A post-job ask flow could 3× this in 60 days.' },
        { status: 'warn', title: 'Owner response rate', pts: '4 / 5 pts', desc: 'Responding to most but not all reviews - replies lift conversion ~11%.' },
      ],
    },
  ];
  const overall = areas.reduce((s, a2) => s + a2.score, 0);
  const overallMax = areas.reduce((s, a2) => s + a2.maxScore, 0);
  const checksTotal = areas.reduce((s, a2) => s + a2.checks.length, 0);
  const needWork = areas.reduce((s, a2) => s + a2.checks.filter((c) => c.status !== 'good').length, 0);
  return { reviewed: checksTotal, needWork, overall, overallMax, areas };
}
