/**
 * Website Analytics — mock data.
 *
 * Workspace: CertaPro Austin (a local painting franchise — matches the H2
 * shell's workspace name). One ~30-day window. Numbers are hand-tuned to be
 * internally coherent: per-channel rows sum to the funnel totals, AI Search is
 * deliberately low-volume / high-conversion, and the first-touch vs last-touch
 * split tells the dark-funnel story (AI discovery under-counted at last touch).
 *
 * Everything is deterministic — dates anchor to a fixed ANCHOR and trends use
 * a seeded generator — so reloads and screenshots stay stable.
 */

import type {
  AiEngineStat,
  AttributionMode,
  BlazeAsset,
  Channel,
  ConversionEvent,
  FunnelTotals,
  InboundLead,
  OverviewMetric,
  PageStat,
  SelfReportedAnswer,
  TrafficSource,
  TrendPoint,
} from './types';

// ─── Deterministic date + trend helpers ────────────────────────────────────

/** Fixed "today" so mock data never depends on the wall clock. */
const ANCHOR = '2026-06-24';
const RANGE_DAYS = 30;

function isoDaysAgo(n: number): string {
  const d = new Date(`${ANCHOR}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Seeded pseudo-random trend (no Math.random → stable across reloads). */
function seededTrend(seed: number, points: number, base: number, growth = 1): number[] {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    const drift = points > 1 ? 1 + (growth - 1) * (i / (points - 1)) : 1;
    const noise = 0.82 + rand() * 0.36; // 0.82–1.18
    out.push(Math.max(0, Math.round(base * drift * noise)));
  }
  return out;
}

const SPARK_POINTS = 12;

// ─── Date-range scaling ──────────────────────────────────────────────────────
//
// The header date-range filter scales every volume metric. Days per range drive
// a factor relative to the 30-day baseline (factor = days / 30), so a 7-day
// window shows ~¼ the traffic and a 90-day window ~3×. Conversion *rates* are
// ratios, so they stay put — only volumes (visitors / leads / clients) scale.

const RANGE_DAYS_BY_VALUE: Record<string, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  mtd: 24, // Jun 1 → Jun 24 (anchor)
  ytd: 175, // Jan 1 → Jun 24
};

/** Number of days in the selected range (defaults to the 30-day baseline). */
export const rangeDays = (value: string): number => RANGE_DAYS_BY_VALUE[value] ?? RANGE_DAYS;

/** Volume multiplier for the selected range, relative to the 30-day baseline. */
export const rangeFactor = (value: string): number => rangeDays(value) / RANGE_DAYS;

/** Round a baseline volume to its scaled value. */
const scaleInt = (n: number, factor: number): number => Math.round(n * factor);

/** Scale the volume fields of a traffic source, leaving channel/asset intact. */
function scaleSource(s: TrafficSource, factor: number): TrafficSource {
  return { ...s, visitors: scaleInt(s.visitors, factor), leads: scaleInt(s.leads, factor), clients: scaleInt(s.clients, factor) };
}

// ─── Channel metadata ───────────────────────────────────────────────────────

export const CHANNEL_ORDER: Channel[] = [
  'paid_search',
  'organic_search',
  'paid_social',
  'blog',
  'direct',
  'email',
  'organic_social',
  'referral',
  'ai_search',
];

export const CHANNEL_LABEL: Record<Channel, string> = {
  paid_social: 'Paid social',
  paid_search: 'Paid search',
  organic_search: 'Organic search',
  organic_social: 'Organic social',
  blog: 'Blog',
  email: 'Email',
  direct: 'Direct',
  referral: 'Referral',
  ai_search: 'AI search',
};

/** Whether Blaze publishes the assets that drive this channel (closed loop
 *  available) or the traffic is earned/external (no asset to link to). */
export const CHANNEL_IS_BLAZE_DRIVEN: Record<Channel, boolean> = {
  paid_social: true,
  paid_search: true,
  organic_social: true,
  blog: true,
  email: true,
  organic_search: false, // earned SEO (some Blaze content ranks too)
  direct: false,
  referral: false,
  ai_search: false, // earned AI citations (some cite Blaze content)
};

// ─── Blaze-published assets (auto-stamped UTMs = the closed-loop key) ────────

export const BLAZE_ASSETS: Record<string, BlazeAsset> = {
  ad_spring_refresh: {
    id: 'ad_spring_refresh',
    type: 'ad',
    title: 'Spring Refresh — Interior Painting',
    channel: 'paid_social',
    publishedAt: isoDaysAgo(26),
    utm: { source: 'facebook', medium: 'paid_social', campaign: 'spring_refresh_2026', content: 'carousel_a' },
  },
  ad_cabinet_glowup: {
    id: 'ad_cabinet_glowup',
    type: 'ad',
    title: 'Cabinet Refinishing — Before / After',
    channel: 'paid_social',
    publishedAt: isoDaysAgo(19),
    utm: { source: 'instagram', medium: 'paid_social', campaign: 'cabinet_glowup', content: 'reel_b' },
  },
  ad_brand_painters: {
    id: 'ad_brand_painters',
    type: 'ad',
    title: 'Austin House Painters — Free Estimate',
    channel: 'paid_search',
    publishedAt: isoDaysAgo(28),
    utm: { source: 'google', medium: 'cpc', campaign: 'brand_painters_atx', term: 'house painters austin' },
  },
  ad_cabinet_search: {
    id: 'ad_cabinet_search',
    type: 'ad',
    title: 'Cabinet Painting Austin',
    channel: 'paid_search',
    publishedAt: isoDaysAgo(21),
    utm: { source: 'google', medium: 'cpc', campaign: 'cabinet_painting_atx', term: 'cabinet painting near me' },
  },
  post_cabinet_timelapse: {
    id: 'post_cabinet_timelapse',
    type: 'social_post',
    title: 'Time-lapse: kitchen cabinet glow-up',
    channel: 'organic_social',
    publishedAt: isoDaysAgo(12),
    utm: { source: 'instagram', medium: 'organic_social', campaign: 'reels_evergreen', content: 'cabinet_timelapse' },
  },
  post_color_trends: {
    id: 'post_color_trends',
    type: 'social_post',
    title: '5 paint colors trending in Austin this spring',
    channel: 'organic_social',
    publishedAt: isoDaysAgo(8),
    utm: { source: 'facebook', medium: 'organic_social', campaign: 'color_trends' },
  },
  blog_cost_guide: {
    id: 'blog_cost_guide',
    type: 'blog_article',
    title: 'How much does it cost to paint a house in Austin?',
    channel: 'blog',
    publishedAt: isoDaysAgo(40),
    utm: { source: 'blog', medium: 'organic', campaign: 'cost_guide_2026' },
  },
  blog_durability: {
    id: 'blog_durability',
    type: 'blog_article',
    title: 'Interior vs. exterior paint: what actually lasts longer',
    channel: 'blog',
    publishedAt: isoDaysAgo(17),
    utm: { source: 'blog', medium: 'organic', campaign: 'paint_durability' },
  },
  email_estimate_ready: {
    id: 'email_estimate_ready',
    type: 'email_campaign',
    title: 'Your spring painting estimate is ready',
    channel: 'email',
    publishedAt: isoDaysAgo(14),
    utm: { source: 'sendgrid', medium: 'email', campaign: 'spring_estimate_nurture' },
  },
  email_newsletter: {
    id: 'email_newsletter',
    type: 'email_campaign',
    title: 'June newsletter — 10% off cabinet jobs',
    channel: 'email',
    publishedAt: isoDaysAgo(9),
    utm: { source: 'sendgrid', medium: 'email', campaign: 'june_newsletter' },
  },
  lp_free_estimate: {
    id: 'lp_free_estimate',
    type: 'landing_page',
    title: 'Free Estimate landing page',
    channel: 'paid_search',
    publishedAt: isoDaysAgo(34),
    utm: { source: 'google', medium: 'cpc', campaign: 'free_estimate_lp' },
  },
  lp_cabinet_offer: {
    id: 'lp_cabinet_offer',
    type: 'landing_page',
    title: 'Cabinet refinishing offer page',
    channel: 'paid_social',
    publishedAt: isoDaysAgo(22),
    utm: { source: 'instagram', medium: 'paid_social', campaign: 'cabinet_offer_lp' },
  },
};

export const BLAZE_ASSET_LIST: BlazeAsset[] = Object.values(BLAZE_ASSETS);

// ─── Channel-level traffic (the Channel Breakdown card + Funnel table) ───────
//
// Visitors are identical across attribution modes (a session entered once);
// leads/clients are redistributed. Last touch is the default. First touch
// shifts credit toward discovery channels — most visibly AI search, which
// originates far more than its last-touch number suggests (people discover via
// an AI assistant, then return via direct / branded search before converting).

interface ChannelRow {
  visitors: number;
  leadsLast: number;
  clientsLast: number;
  leadsFirst: number;
  clientsFirst: number;
  /** Seed + base for the row sparkline + slight growth factor. */
  spark: [seed: number, base: number, growth: number];
}

const CHANNEL_ROWS: Record<Channel, ChannelRow> = {
  paid_search:    { visitors: 2400, leadsLast: 120, clientsLast: 22, leadsFirst: 96,  clientsFirst: 16, spark: [11, 80, 1.15] },
  organic_search: { visitors: 3800, leadsLast: 76,  clientsLast: 11, leadsFirst: 70,  clientsFirst: 10, spark: [22, 124, 1.2] },
  paid_social:    { visitors: 3200, leadsLast: 96,  clientsLast: 14, leadsFirst: 104, clientsFirst: 15, spark: [33, 108, 1.1] },
  blog:           { visitors: 1900, leadsLast: 38,  clientsLast: 5,  leadsFirst: 52,  clientsFirst: 8,  spark: [44, 60, 1.25] },
  direct:         { visitors: 1700, leadsLast: 51,  clientsLast: 8,  leadsFirst: 34,  clientsFirst: 4,  spark: [55, 56, 1.05] },
  email:          { visitors: 900,  leadsLast: 54,  clientsLast: 9,  leadsFirst: 30,  clientsFirst: 4,  spark: [66, 30, 1.0] },
  organic_social: { visitors: 1500, leadsLast: 30,  clientsLast: 4,  leadsFirst: 44,  clientsFirst: 6,  spark: [77, 48, 1.18] },
  referral:       { visitors: 800,  leadsLast: 16,  clientsLast: 2,  leadsFirst: 22,  clientsFirst: 3,  spark: [88, 26, 1.08] },
  ai_search:      { visitors: 240,  leadsLast: 22,  clientsLast: 6,  leadsFirst: 51,  clientsFirst: 15, spark: [99, 6, 1.6] },
};

function channelSource(channel: Channel, mode: AttributionMode, factor: number): TrafficSource {
  const row = CHANNEL_ROWS[channel];
  const [seed, base, growth] = row.spark;
  return {
    channel,
    visitors: scaleInt(row.visitors, factor),
    leads: scaleInt(mode === 'first_touch' ? row.leadsFirst : row.leadsLast, factor),
    clients: scaleInt(mode === 'first_touch' ? row.clientsFirst : row.clientsLast, factor),
    trend: seededTrend(seed, SPARK_POINTS, base, growth),
  };
}

/** Channel-level rows, ranked by visitors (descending), for a given mode and
 *  date-range factor. */
export function channelSources(mode: AttributionMode = 'last_touch', factor = 1): TrafficSource[] {
  return CHANNEL_ORDER.map((c) => channelSource(c, mode, factor)).sort((a, b) => b.visitors - a.visitors);
}

// ─── Asset-level traffic (Top Content, Content table, Source Drawer) ─────────
//
// Each row attributes traffic to one Blaze asset within one channel. Note that
// blog_cost_guide appears in THREE channels (blog, organic_search, ai_search)
// — one article, multiple discovery paths — which is exactly the closed loop:
// the same Blaze asset is traceable wherever it surfaces.

interface AssetSourceSeed {
  assetId: keyof typeof BLAZE_ASSETS;
  channel: Channel;
  visitors: number;
  leads: number;
  clients: number;
  spark: [seed: number, base: number, growth: number];
}

const ASSET_SOURCE_SEEDS: AssetSourceSeed[] = [
  // paid_social (fully Blaze-published → assets sum to channel total)
  { assetId: 'ad_spring_refresh', channel: 'paid_social', visitors: 1850, leads: 52, clients: 8, spark: [101, 62, 1.1] },
  { assetId: 'ad_cabinet_glowup', channel: 'paid_social', visitors: 1350, leads: 44, clients: 6, spark: [102, 46, 1.2] },
  // paid_search
  { assetId: 'ad_brand_painters', channel: 'paid_search', visitors: 1500, leads: 78, clients: 14, spark: [103, 50, 1.12] },
  { assetId: 'ad_cabinet_search', channel: 'paid_search', visitors: 900, leads: 42, clients: 8, spark: [104, 30, 1.18] },
  // organic_social
  { assetId: 'post_cabinet_timelapse', channel: 'organic_social', visitors: 900, leads: 19, clients: 3, spark: [105, 30, 1.22] },
  { assetId: 'post_color_trends', channel: 'organic_social', visitors: 600, leads: 11, clients: 1, spark: [106, 20, 1.3] },
  // blog
  { assetId: 'blog_cost_guide', channel: 'blog', visitors: 1200, leads: 26, clients: 4, spark: [107, 38, 1.25] },
  { assetId: 'blog_durability', channel: 'blog', visitors: 700, leads: 12, clients: 1, spark: [108, 24, 1.2] },
  // email
  { assetId: 'email_estimate_ready', channel: 'email', visitors: 520, leads: 34, clients: 6, spark: [109, 18, 1.0] },
  { assetId: 'email_newsletter', channel: 'email', visitors: 380, leads: 20, clients: 3, spark: [110, 14, 1.05] },
  // closed loop in EARNED channels: the cost guide also drives organic + AI
  { assetId: 'blog_cost_guide', channel: 'organic_search', visitors: 800, leads: 18, clients: 3, spark: [111, 26, 1.3] },
  { assetId: 'blog_cost_guide', channel: 'ai_search', visitors: 90, leads: 9, clients: 3, spark: [112, 3, 1.8] },
];

export const ASSET_SOURCES: TrafficSource[] = ASSET_SOURCE_SEEDS.map((s) => ({
  channel: s.channel,
  sourceAsset: BLAZE_ASSETS[s.assetId],
  visitors: s.visitors,
  leads: s.leads,
  clients: s.clients,
  trend: seededTrend(s.spark[0], SPARK_POINTS, s.spark[1], s.spark[2]),
}));

/**
 * Named non-Blaze sources within a channel — earned / external traffic with no
 * asset to link to. The Source Drawer shows these distinctly from Blaze rows.
 */
export interface ExternalSource {
  channel: Channel;
  label: string;
  visitors: number;
  leads: number;
  clients: number;
}

export const EXTERNAL_SOURCES: ExternalSource[] = [
  { channel: 'organic_search', label: 'Google (unbranded keywords)', visitors: 2200, leads: 41, clients: 6 },
  { channel: 'organic_search', label: 'Google Business Profile', visitors: 800, leads: 17, clients: 2 },
  { channel: 'direct', label: 'Typed URL / bookmarks', visitors: 1700, leads: 51, clients: 8 },
  { channel: 'referral', label: 'yelp.com', visitors: 360, leads: 8, clients: 1 },
  { channel: 'referral', label: 'nextdoor.com', visitors: 280, leads: 6, clients: 1 },
  { channel: 'referral', label: 'houzz.com', visitors: 160, leads: 2, clients: 0 },
  { channel: 'ai_search', label: 'Direct AI mentions (no linked asset)', visitors: 150, leads: 13, clients: 3 },
];

/** Blaze asset rows for one channel (closed-loop, link to Content panel). */
export function blazeSourcesForChannel(channel: Channel, factor = 1): TrafficSource[] {
  return ASSET_SOURCES.filter((s) => s.channel === channel)
    .map((s) => scaleSource(s, factor))
    .sort((a, b) => b.visitors - a.visitors);
}

/** Named external rows for one channel (no asset link). */
export function externalSourcesForChannel(channel: Channel, factor = 1): ExternalSource[] {
  return EXTERNAL_SOURCES.filter((s) => s.channel === channel)
    .map((s) => ({ ...s, visitors: scaleInt(s.visitors, factor), leads: scaleInt(s.leads, factor), clients: scaleInt(s.clients, factor) }))
    .sort((a, b) => b.visitors - a.visitors);
}

// ─── Per-asset rollup (Top Content card + Content table) ─────────────────────

export interface AssetRollup {
  asset: BlazeAsset;
  visitors: number;
  leads: number;
  clients: number;
  /** Channels this asset drew traffic from (usually one, sometimes several). */
  channels: Channel[];
}

/** Sum every ASSET_SOURCES row by asset id → one row per asset, ranked by
 *  visitors. This is the closed loop made visible: each Blaze asset and the
 *  total traffic + conversions it produced across every channel. */
export function assetRollups(factor = 1): AssetRollup[] {
  const byId = new Map<string, AssetRollup>();
  for (const s of ASSET_SOURCES) {
    if (!s.sourceAsset) continue;
    const id = s.sourceAsset.id;
    const v = scaleInt(s.visitors, factor);
    const l = scaleInt(s.leads, factor);
    const c = scaleInt(s.clients, factor);
    const existing = byId.get(id);
    if (existing) {
      existing.visitors += v;
      existing.leads += l;
      existing.clients += c;
      if (!existing.channels.includes(s.channel)) existing.channels.push(s.channel);
    } else {
      byId.set(id, { asset: s.sourceAsset, visitors: v, leads: l, clients: c, channels: [s.channel] });
    }
  }
  return [...byId.values()].sort((a, b) => b.visitors - a.visitors);
}

/** Per-asset traffic for assets that don't appear as a channel source — the
 *  landing pages (destinations, not attributed channels). Kept separate so it
 *  never inflates the channel sums, but the Content view still lists them. */
const EXTRA_ASSET_STATS: Record<string, { visitors: number; leads: number; clients: number }> = {
  lp_free_estimate: { visitors: 1900, leads: 96, clients: 16 },
  lp_cabinet_offer: { visitors: 720, leads: 28, clients: 4 },
};

/** Every published asset with its aggregated performance — the Content view's
 *  table. Combines channel-attributed assets (assetRollups) with the landing
 *  pages, ranked by visitors. */
export function contentRows(factor = 1): AssetRollup[] {
  const base = assetRollups(factor);
  const seen = new Set(base.map((r) => r.asset.id));
  const extras: AssetRollup[] = Object.entries(EXTRA_ASSET_STATS)
    .filter(([id]) => !seen.has(id) && BLAZE_ASSETS[id])
    .map(([id, s]) => ({
      asset: BLAZE_ASSETS[id]!,
      visitors: scaleInt(s.visitors, factor),
      leads: scaleInt(s.leads, factor),
      clients: scaleInt(s.clients, factor),
      channels: [BLAZE_ASSETS[id]!.channel],
    }));
  return [...base, ...extras].sort((a, b) => b.visitors - a.visitors);
}

/** The channel-by-channel split for one asset (Content detail panel). Empty
 *  for landing pages, which aren't attributed per channel. */
export function assetChannelBreakdown(assetId: string, factor = 1): TrafficSource[] {
  return ASSET_SOURCES.filter((s) => s.sourceAsset?.id === assetId)
    .map((s) => scaleSource(s, factor))
    .sort((a, b) => b.visitors - a.visitors);
}

/** Where an asset's channel is managed in the H2 app — used to link the asset
 *  panel back to the Paid Social / Paid Search / Organic / etc. surface that
 *  produced it. Null for channels with no managing page (direct, referral). */
const CHANNEL_DESTINATION: Partial<Record<Channel, { href: string; label: string }>> = {
  paid_social: { href: '/h2/paid-social', label: 'Paid Social' },
  paid_search: { href: '/h2/paid-search', label: 'Paid Search' },
  organic_social: { href: '/h2/organic-social', label: 'Organic Campaigns' },
  blog: { href: '/h2/seo-aeo', label: 'SEO/AEO' },
  organic_search: { href: '/h2/seo-aeo', label: 'SEO/AEO' },
  ai_search: { href: '/h2/seo-aeo', label: 'SEO/AEO' },
  email: { href: '/h2/content-plan', label: 'Content Plan' },
  landing_page: { href: '/h2/landing-pages', label: 'Landing Pages' },
};

export function channelDestination(channel: Channel): { href: string; label: string } | null {
  return CHANNEL_DESTINATION[channel] ?? null;
}

/** Deterministic stock preview image URL for an asset (matches its thumbnail's
 *  seed, larger + wide). */
export function assetPreviewUrl(assetId: string, w = 640, h = 360): string {
  return `https://picsum.photos/seed/${encodeURIComponent(assetId)}/${w}/${h}`;
}

/** Mock "live" URL for the published asset — the direct link to the content
 *  itself (the ad permalink, blog post, landing page, …). */
export function assetContentUrl(asset: BlazeAsset): string {
  return `https://certapro-austin.com/${asset.type.replace(/_/g, '-')}/${asset.id}`;
}

// ─── Funnel totals + hero time-series ────────────────────────────────────────

export const FUNNEL_TOTALS: FunnelTotals = (() => {
  const rows = Object.values(CHANNEL_ROWS);
  return {
    visitors: rows.reduce((n, r) => n + r.visitors, 0),
    leads: rows.reduce((n, r) => n + r.leadsLast, 0),
    clients: rows.reduce((n, r) => n + r.clientsLast, 0),
  };
})();

/** Funnel totals scaled to the selected date-range factor. */
export function funnelTotals(factor = 1): FunnelTotals {
  return {
    visitors: scaleInt(FUNNEL_TOTALS.visitors, factor),
    leads: scaleInt(FUNNEL_TOTALS.leads, factor),
    clients: scaleInt(FUNNEL_TOTALS.clients, factor),
  };
}

/** Delta vs. the previous period, as a fraction (e.g. 0.124 = +12.4%).
 *  Conversion rate dips slightly — more top-of-funnel traffic, same closers. */
export const PERIOD_DELTAS: Record<'visitors' | 'leads' | 'clients' | 'conversionRate', number> = {
  visitors: 0.124,
  leads: 0.086,
  clients: 0.21,
  conversionRate: -0.028,
};

/** Scale a daily series so it sums to exactly `target` (keeps the chart legend
 *  consistent with the StatTiles), distributing rounding drift across days. */
function scaleSeries(vals: number[], target: number): number[] {
  const tot = vals.reduce((a, b) => a + b, 0) || 1;
  const rounded = vals.map((x) => Math.round((x * target) / tot));
  let diff = target - rounded.reduce((a, b) => a + b, 0);
  let i = rounded.length - 1;
  let guard = 0;
  while (diff !== 0 && guard < 100000) {
    const step = diff > 0 ? 1 : -1;
    if (rounded[i]! + step >= 0) {
      rounded[i] = rounded[i]! + step;
      diff -= step;
    }
    i = i === 0 ? rounded.length - 1 : i - 1;
    guard++;
  }
  return rounded;
}

/** Build a `days`-long daily trend ending `endDaysAgo` days back, with weekly
 *  seasonality + slight growth, scaled so each series hits the given totals. */
function buildTrend(seed: number, totals: FunnelTotals, endDaysAgo: number, days = RANGE_DAYS): TrendPoint[] {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const dates: string[] = [];
  const rawV: number[] = [];
  const rawL: number[] = [];
  const rawC: number[] = [];
  for (let i = 0; i < days; i++) {
    const date = isoDaysAgo(endDaysAgo + days - 1 - i);
    const dow = new Date(`${date}T00:00:00Z`).getUTCDay();
    const weekend = dow === 0 || dow === 6 ? 0.68 : 1;
    const growth = 1 + 0.18 * (days > 1 ? i / (days - 1) : 0);
    const v = (480 + rand() * 120) * weekend * growth;
    dates.push(date);
    rawV.push(v);
    rawL.push(v * (0.026 + rand() * 0.012));
    rawC.push(v * (0.026 + rand() * 0.012) * (0.14 + rand() * 0.06));
  }
  const vs = scaleSeries(rawV, totals.visitors);
  const ls = scaleSeries(rawL, totals.leads);
  const cs = scaleSeries(rawC, totals.clients);
  return dates.map((date, i) => ({ date, visitors: vs[i]!, leads: ls[i]!, clients: cs[i]! }));
}

/** Previous-period totals, back-derived from the period deltas. */
export const PREVIOUS_TOTALS: FunnelTotals = {
  visitors: Math.round(FUNNEL_TOTALS.visitors / (1 + PERIOD_DELTAS.visitors)),
  leads: Math.round(FUNNEL_TOTALS.leads / (1 + PERIOD_DELTAS.leads)),
  clients: Math.round(FUNNEL_TOTALS.clients / (1 + PERIOD_DELTAS.clients)),
};

/** Previous-period totals scaled to the selected date-range factor. */
export function previousTotals(factor = 1): FunnelTotals {
  return {
    visitors: scaleInt(PREVIOUS_TOTALS.visitors, factor),
    leads: scaleInt(PREVIOUS_TOTALS.leads, factor),
    clients: scaleInt(PREVIOUS_TOTALS.clients, factor),
  };
}

/** Current-period hero trend for the selected range (factor scales the totals,
 *  `days` sets the window length + date axis). */
export function heroTrend(factor = 1, days = RANGE_DAYS): TrendPoint[] {
  return buildTrend(20260624, funnelTotals(factor), 0, days);
}

/** The immediately-preceding period, for the faded comparison line. */
export function heroTrendPrevious(factor = 1, days = RANGE_DAYS): TrendPoint[] {
  return buildTrend(19990101, previousTotals(factor), days, days);
}

/** Current period at the 30-day baseline (kept for any non-range-aware caller). */
export const HERO_TREND: TrendPoint[] = heroTrend();
/** Previous period at the 30-day baseline. */
export const HERO_TREND_PREVIOUS: TrendPoint[] = heroTrendPrevious();

/** Pull one metric's daily series out of a trend. Conversion rate is derived
 *  per day (leads / visitors). */
export function trendSeries(data: TrendPoint[], metric: OverviewMetric): number[] {
  if (metric === 'conversionRate') return data.map((d) => (d.visitors ? d.leads / d.visitors : 0));
  return data.map((d) => d[metric]);
}

// ─── Top pages (landing pages by visitors + conversion rate) ─────────────────

export const TOP_PAGES: PageStat[] = [
  { path: '/', title: 'Home', visitors: 4200, conversionRate: 0.018 },
  { path: '/services/interior-painting', title: 'Interior Painting', visitors: 2600, conversionRate: 0.041 },
  { path: '/free-estimate', title: 'Free Estimate', visitors: 1900, conversionRate: 0.092 },
  { path: '/blog/how-much-does-painting-cost', title: 'Cost to paint a house in Austin', visitors: 1500, conversionRate: 0.028 },
  { path: '/services/cabinet-refinishing', title: 'Cabinet Refinishing', visitors: 1400, conversionRate: 0.035 },
  { path: '/about', title: 'About CertaPro Austin', visitors: 980, conversionRate: 0.012 },
];

/** Top pages with visitors scaled to the date-range factor (rates unchanged). */
export function topPages(factor = 1): PageStat[] {
  return TOP_PAGES.map((p) => ({ ...p, visitors: scaleInt(p.visitors, factor) }));
}

// ─── AI Search breakdown (AEO highlight card) ────────────────────────────────

export const AI_ENGINES: AiEngineStat[] = [
  { engine: 'ChatGPT', visitors: 118, leads: 12 },
  { engine: 'Perplexity', visitors: 52, leads: 5 },
  { engine: 'Gemini', visitors: 34, leads: 2 },
  { engine: 'Claude', visitors: 22, leads: 2 },
  { engine: 'Copilot', visitors: 14, leads: 1 },
];

/** AI engine rows scaled to the date-range factor. */
export function aiEngines(factor = 1): AiEngineStat[] {
  return AI_ENGINES.map((e) => ({ ...e, visitors: scaleInt(e.visitors, factor), leads: scaleInt(e.leads, factor) }));
}

// ─── Self-reported attribution ("How did you hear about us?") ─────────────────
//
// The dark-funnel module. Note the "AI assistant" answer (41) dwarfs AI
// search's 22 last-touch leads — because most AI-referred visitors return via
// direct / branded search before converting, so deterministic analytics
// under-counts AI. The self-report catches what UTMs can't.

export const SELF_REPORTED: SelfReportedAnswer[] = [
  { label: 'Google search', count: 132, mapsTo: 'organic_search' },
  { label: 'Saw your ad on Facebook / Instagram', count: 78, mapsTo: 'paid_social' },
  { label: 'Referred by a friend', count: 64, mapsTo: 'referral' },
  { label: 'Found you on Google Maps', count: 48, mapsTo: 'organic_search' },
  { label: 'ChatGPT / an AI assistant recommended you', count: 41, mapsTo: 'ai_search' },
  { label: "Don't remember / other", count: 35, mapsTo: 'direct' },
  { label: 'Email from you', count: 22, mapsTo: 'email' },
];

/** Self-reported answers with counts scaled to the date-range factor. */
export function selfReported(factor = 1): SelfReportedAnswer[] {
  return SELF_REPORTED.map((a) => ({ ...a, count: scaleInt(a.count, factor) }));
}

// ─── Sample conversion events (dark-funnel detail + handoff seam) ─────────────

export const CONVERSION_EVENTS: ConversionEvent[] = [
  { id: 'ev_01', stage: 'client', sessionId: 's_4821', firstTouch: 'ai_search', lastTouch: 'direct', selfReportedSource: 'ChatGPT / an AI assistant recommended you', value: 4200 },
  { id: 'ev_02', stage: 'lead', sessionId: 's_4822', firstTouch: 'paid_search', lastTouch: 'paid_search', selfReportedSource: 'Google search' },
  { id: 'ev_03', stage: 'client', sessionId: 's_4823', firstTouch: 'blog', lastTouch: 'email', selfReportedSource: 'Google search', value: 3100 },
  { id: 'ev_04', stage: 'lead', sessionId: 's_4824', firstTouch: 'ai_search', lastTouch: 'organic_search', selfReportedSource: 'ChatGPT / an AI assistant recommended you' },
  { id: 'ev_05', stage: 'lead', sessionId: 's_4825', firstTouch: 'paid_social', lastTouch: 'paid_social', selfReportedSource: 'Saw your ad on Facebook / Instagram' },
  { id: 'ev_06', stage: 'client', sessionId: 's_4826', firstTouch: 'referral', lastTouch: 'direct', selfReportedSource: 'Referred by a friend', value: 5600 },
  { id: 'ev_07', stage: 'lead', sessionId: 's_4827', firstTouch: 'organic_search', lastTouch: 'organic_search', selfReportedSource: 'Found you on Google Maps' },
  { id: 'ev_08', stage: 'lead', sessionId: 's_4828', firstTouch: 'ai_search', lastTouch: 'direct', selfReportedSource: 'ChatGPT / an AI assistant recommended you' },
];

// ─── Integration seam → Leads Inbox / AI Sales Rep ───────────────────────────

/**
 * Map a conversion event to the lead object the Leads Inbox / AI Sales Rep
 * consumes. This is the ONLY thing that crosses the boundary — analytics owns
 * the attribution (`source`), the inbox owns everything else.
 *
 * The originating asset is resolved from first touch: whatever Blaze asset
 * first drove that channel. Returns `undefined` originatingAsset for earned
 * channels (organic / direct / referral / AI) with no linked asset.
 */
export function buildInboundLead(event: ConversionEvent, name: string): InboundLead {
  const originating = ASSET_SOURCES.find((s) => s.channel === event.firstTouch)?.sourceAsset;
  return {
    id: event.id,
    name,
    capturedAt: `${isoDaysAgo(3)}T15:04:00Z`,
    stage: event.stage,
    source: {
      firstTouch: event.firstTouch,
      lastTouch: event.lastTouch,
      originatingAsset: originating,
      selfReportedSource: event.selfReportedSource,
    },
  };
}

// → handoff to Leads Inbox: the inbox imports `InboundLead` + `buildInboundLead`
//   and renders the rest. We do not build it here.

// ─── Header controls ─────────────────────────────────────────────────────────

export const DATE_RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'mtd', label: 'Month to date' },
  { value: 'ytd', label: 'Year to date' },
];

export const DEFAULT_DATE_RANGE = '30d';

/** Human label for a range value (e.g. '7d' → 'Last 7 days') for the chart legend. */
export const rangeLabel = (value: string): string =>
  DATE_RANGE_OPTIONS.find((o) => o.value === value)?.label ?? value;

/** "N visitors right now" pill. */
export const LIVE_VISITORS = 18;

/** Websites this workspace tracks — the analytics site switcher. Switching is
 *  visual-only in the prototype (data doesn't reslice per site). */
export interface Website {
  id: string;
  domain: string;
  name: string;
}

export const WEBSITES: Website[] = [
  { id: 'austin', domain: 'certapro-austin.com', name: 'CertaPro Austin' },
  { id: 'round-rock', domain: 'certapro-roundrock.com', name: 'CertaPro Round Rock' },
  { id: 'san-marcos', domain: 'certapro-sanmarcos.com', name: 'CertaPro San Marcos' },
];

export const DEFAULT_WEBSITE_ID = 'austin';

// ─── Small shared helpers ────────────────────────────────────────────────────

export const sum = (ns: number[]): number => ns.reduce((a, b) => a + b, 0);

/** Visitor → lead conversion rate as a fraction. */
export const conversionRate = (visitors: number, leads: number): number =>
  visitors > 0 ? leads / visitors : 0;

export const fmtInt = (n: number): string => n.toLocaleString('en-US');

export const fmtPct = (frac: number, digits = 1): string => `${(frac * 100).toFixed(digits)}%`;

/** Signed delta for StatTile sublabels, e.g. +12.4% / −2.8%. */
export const fmtDelta = (frac: number, digits = 1): string =>
  `${frac >= 0 ? '+' : '−'}${Math.abs(frac * 100).toFixed(digits)}%`;
