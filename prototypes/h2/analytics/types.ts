/**
 * Website Analytics — data model.
 *
 * Philosophy: Plausible/Fathom, not GA4. One scannable page, depth one layer
 * down. The thing that makes this different from every other analytics tool:
 * Blaze PUBLISHES the ads, posts, and articles that drive much of this
 * traffic, so it auto-stamps the correct UTM parameters at publish time.
 * Attribution is therefore KNOWN, not guessed — every traffic source can link
 * back to the specific Blaze asset that produced it. That closed loop is the
 * structural center of this model: see `BlazeAsset.utm` and
 * `TrafficSource.sourceAsset`.
 */

/**
 * First-class, fixed channel enum. `ai_search` (AEO) is a real channel —
 * traffic from ChatGPT, Perplexity, Claude, Gemini, Copilot — surfaced on its
 * own, never buried inside Referral.
 */
export type Channel =
  | 'paid_social'
  | 'paid_search'
  | 'organic_search'
  | 'organic_social'
  | 'blog'
  | 'email'
  | 'direct'
  | 'referral'
  | 'ai_search';

export type AssetType =
  | 'ad'
  | 'social_post'
  | 'blog_article'
  | 'email_campaign'
  | 'landing_page';

/** UTM parameter set. For Blaze-published assets these are auto-stamped at
 *  publish time — that's what makes attribution known rather than guessed. */
export interface UTM {
  source: string;
  medium: string;
  campaign: string;
  content?: string;
  term?: string;
}

/**
 * An asset PUBLISHED BY Blaze. Because Blaze published it, the UTM set is
 * auto-stamped and known — this is the closed-loop key that lets any traffic
 * source resolve back to the exact thing that produced it.
 */
export interface BlazeAsset {
  id: string;
  type: AssetType;
  title: string;
  channel: Channel;
  /** ISO date the asset went live. */
  publishedAt: string;
  /** Auto-stamped at publish time — the closed-loop key. */
  utm: UTM;
  thumbnailUrl?: string;
}

/**
 * Aggregated traffic, per channel (and optionally per asset).
 *
 * - Channel-level rows leave `sourceAsset` undefined.
 * - Asset-level rows set `sourceAsset` to the Blaze asset that drove the
 *   traffic. When `sourceAsset` is absent on an asset-level breakdown the
 *   source is non-Blaze (pure organic, third-party referral) and must be
 *   shown distinctly — there is no asset to link to.
 */
export interface TrafficSource {
  channel: Channel;
  /** Present when Blaze drove it; absent for organic / external sources. */
  sourceAsset?: BlazeAsset;
  visitors: number;
  leads: number;
  clients: number;
  /** Per-point series for the row's mini sparkline. */
  trend: number[];
}

/** A single conversion (visitor → lead, or lead → client) with the channel
 *  that originally found them (firstTouch) and the most recent source before
 *  they converted (lastTouch). `selfReportedSource` captures the dark funnel. */
export interface ConversionEvent {
  id: string;
  stage: 'lead' | 'client';
  sessionId: string;
  firstTouch: Channel;
  lastTouch: Channel;
  /** Answer to "How did you hear about us?" — catches the dark funnel. */
  selfReportedSource?: string;
  value?: number;
}

export type FunnelStage = 'visitor' | 'lead' | 'client';

// ─── View-support shapes (not in the original spec, used by the UI) ────────

/** First touch = channel that originally found them. Last touch = most recent
 *  source before converting. The Funnel view toggles between the two. */
export type AttributionMode = 'first_touch' | 'last_touch';

/** One day (or bucket) of the hero trend. Three metrics share one axis. */
export interface TrendPoint {
  /** ISO date for the bucket. */
  date: string;
  visitors: number;
  leads: number;
  clients: number;
}

/** The only three metrics the hero chart ever plots (Fathom-style). */
export type TrendMetric = 'visitors' | 'leads' | 'clients';

/** Metrics the Overview StatTiles expose as chart selectors — the three trend
 *  metrics plus the derived conversion rate. */
export type OverviewMetric = TrendMetric | 'conversionRate';

/** Funnel stage totals across the selected range. */
export interface FunnelTotals {
  visitors: number;
  leads: number;
  clients: number;
}

/** One landing page's performance (Top Pages card). Pages are destinations,
 *  not a channel, so they don't carry a Blaze asset link here. */
export interface PageStat {
  path: string;
  title: string;
  visitors: number;
  conversionRate: number; // 0–1
}

/** One answer bucket for the self-reported "How did you hear about us?" field. */
export interface SelfReportedAnswer {
  label: string;
  count: number;
  /** Best-guess channel this answer maps to — used to frame the dark funnel
   *  (e.g. an "AI assistant" answer that arrived via direct/branded search). */
  mapsTo?: Channel;
}

/** Which AI engine sent AEO traffic (AI Search card breakdown). */
export interface AiEngineStat {
  engine: 'ChatGPT' | 'Perplexity' | 'Claude' | 'Gemini' | 'Copilot';
  visitors: number;
  leads: number;
}

// ─── Integration seam → Leads Inbox / AI Sales Rep ─────────────────────────
//
// The Lead that exits this funnel is the SAME lead the Leads Inbox / AI Sales
// Rep handles downstream. We type just enough attribution to thread it
// through the boundary — the originating Blaze asset plus first/last touch —
// so the inbox can show "this lead came from <asset> via <channel>".
//
// DO NOT build the inbox here. This is only the typed seam.

/** Attribution payload carried across the handoff boundary. */
export interface LeadSourceAttribution {
  firstTouch: Channel;
  lastTouch: Channel;
  /** The Blaze asset that first produced this lead, when known. */
  originatingAsset?: BlazeAsset;
  selfReportedSource?: string;
}

/** The lead object handed off to the Leads Inbox. Mirrors the shape the inbox
 *  already consumes; only `source` is contributed by analytics. */
export interface InboundLead {
  id: string;
  name: string;
  /** ISO timestamp the lead was captured. */
  capturedAt: string;
  stage: 'lead' | 'client';
  source: LeadSourceAttribution;
}

// → handoff to Leads Inbox: an `InboundLead` is what crosses this boundary.
//   `buildInboundLead()` in mockData.ts shows the mapping; the inbox itself
//   lives elsewhere and is intentionally out of scope.
