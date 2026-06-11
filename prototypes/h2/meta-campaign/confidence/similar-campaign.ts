// Deterministic "Similar to" matcher. Scores past campaigns against the
// current draft on objective match, format-mix similarity, audience scope, and
// budget tier, with a small recency boost. Returns the best match above a
// threshold, otherwise null.
import type { Campaign, Ad } from '../../pages/PaidSocial';
import type { MetaCampaignDraft, GeneratedAd } from '../meta-campaign-context';
import type { SimilarMatch } from './types';

const SCORE_THRESHOLD = 2.5;

/**
 * Score the new draft + ad slate against every past campaign in the pool and
 * return the highest-scoring match (above threshold), or null.
 *
 * `pool` is expected to be the merged list of seed CAMPAIGNS + this session's
 * createdCampaigns. Seed campaigns carry richer metrics so they tend to win.
 */
export function findSimilarCampaign(
  draft: MetaCampaignDraft,
  generatedAds: GeneratedAd[],
  pool: Campaign[],
): SimilarMatch | null {
  if (pool.length === 0) return null;

  const draftFormatCounts = countAdFormats(generatedAds);
  const newCampaignTokens = tokenize(draft.name + ' ' + draft.topic);

  let best: { match: SimilarMatch; recencyIdx: number } | null = null;

  pool.forEach((c, idx) => {
    let score = 0;
    const similarities: string[] = [];
    const differences: string[] = [];

    // Objective is a coarse signal but the strongest one we have on seed data.
    // Seed campaigns don't carry a direct objective field — we infer from the
    // status + budget profile, falling back to "Lead generation" since that's
    // the default in the prototype.
    const inferredObjective = inferObjective(c);
    if (inferredObjective === draft.objective) {
      score += 1.5;
      similarities.push(`objective (${humanObjective(draft.objective)})`);
    } else {
      differences.push(
        `objective (${humanObjective(inferredObjective)} → ${humanObjective(draft.objective)})`,
      );
    }

    // Budget tier — within ±30% counts as a match.
    const ratio = c.budget === 0 ? 0 : draft.dailyBudget / c.budget;
    if (ratio >= 0.7 && ratio <= 1.3) {
      score += 0.8;
      similarities.push(`budget tier (~$${c.budget}/day)`);
    } else {
      differences.push(`budget tier ($${c.budget}/day → $${draft.dailyBudget}/day)`);
    }

    // Format mix — cosine similarity over the (Reel, Static, Carousel, UGC)
    // vector. Seed campaign ads are typed; ads without `format` are skipped.
    const campaignFormatCounts = countAdFormats(c.ads ?? []);
    const formatSim = cosineSim(draftFormatCounts, campaignFormatCounts);
    if (formatSim >= 0.55) {
      score += 1 * formatSim;
      similarities.push('creative format mix');
    } else if (formatSim > 0) {
      differences.push('creative format mix');
    }

    // Name + topic token overlap — catches conceptual similarities (e.g.
    // "exterior" appearing in both names) that the structural signals miss.
    const campaignTokens = tokenize(c.name);
    const overlap = jaccard(newCampaignTokens, campaignTokens);
    score += overlap * 0.8;
    if (overlap >= 0.25) {
      similarities.push('topic/theme');
    }

    // Recency boost — most recent (highest index) gets a small bump so ties
    // resolve toward newer campaigns.
    score += (idx / Math.max(1, pool.length - 1)) * 0.3;

    if (score < SCORE_THRESHOLD) return;

    const match: SimilarMatch = {
      campaignId: c.id,
      campaignName: c.name,
      score: Math.round(score * 100) / 100,
      similarities,
      differences,
      metrics: {
        ctr: firstAdMetric(c, 'ctr'),
        costPerResult: c.costPerResult,
        impressions: firstAdMetric(c, 'impressions'),
        results: c.results,
        status: c.status,
      },
    };

    if (!best || score > best.match.score) {
      best = { match, recencyIdx: idx };
    } else if (score === best.match.score && idx > best.recencyIdx) {
      // Tiebreaker: more recent wins.
      best = { match, recencyIdx: idx };
    }
  });

  return best?.match ?? null;
}

// ─── Helpers ────────────────────────────────────────────────────────────

function countAdFormats(ads: Array<Ad | GeneratedAd>): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const ad of ads) {
    // Seed Ads don't have a `format` field; skip them. GeneratedAds do.
    const fmt = (ad as GeneratedAd).format;
    if (!fmt) continue;
    counts[fmt] = (counts[fmt] ?? 0) + 1;
  }
  return counts;
}

function firstAdMetric(c: Campaign, key: 'ctr' | 'impressions'): number | undefined {
  const ads = c.ads ?? [];
  if (ads.length === 0) return undefined;
  // Average across ads for the campaign-level metric. Filters zeros so a
  // single fresh ad doesn't drag the average to 0.
  const values = ads.map((a) => a[key]).filter((v) => v && v > 0);
  if (values.length === 0) return undefined;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function inferObjective(c: Campaign): MetaCampaignDraft['objective'] {
  // We don't store objective on seed Campaign records. For prototype purposes,
  // assume Lead generation across the board — matches the seed data's intent
  // and aligns with the wizard's default. If we ever add real objective data,
  // this is the seam to swap.
  void c;
  return 'lead-generation';
}

function humanObjective(o: MetaCampaignDraft['objective']): string {
  switch (o) {
    case 'lead-generation':
      return 'Lead generation';
    case 'estimate-requests':
      return 'Estimate requests';
    case 'awareness':
      return 'Brand awareness';
    case 'traffic':
      return 'Website traffic';
  }
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP_WORDS.has(w)),
  );
}

const STOP_WORDS = new Set([
  'the', 'and', 'with', 'this', 'that', 'from', 'your', 'their', 'for', 'campaign', 'meta', 'blaze',
]);

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  a.forEach((v) => {
    if (b.has(v)) inter++;
  });
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function cosineSim(a: Record<string, number>, b: Record<string, number>): number {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0;
  let magA = 0;
  let magB = 0;
  keys.forEach((k) => {
    const va = a[k] ?? 0;
    const vb = b[k] ?? 0;
    dot += va * vb;
    magA += va * va;
    magB += vb * vb;
  });
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
