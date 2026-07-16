import { PAID_GROUPS, ARTICLES, STRATEGY_PILLARS, CONNECT_INTEGRATIONS } from './data';
import type { Decision } from './wizard';

/**
 * Scripted starting states for the review flow when it's reopened from a Home
 * that wasn't reached through a real submission (e.g. the dev-panel toggle).
 * Keys mirror the flow's stepStatus: `step:scorecard` / `step:website`, the
 * paid/article card ids, `strategy:<pillar>`, and connection ids.
 */

const PAID_IDS = [...PAID_GROUPS.flatMap((g) => g.items.map((i) => i.id)), 'paid:search-ads'];
const ARTICLE_IDS = ARTICLES.map((i) => i.id);
const STRATEGY_KEYS = STRATEGY_PILLARS.map((p) => `strategy:${p.id}`);
const ALL_CONNECTED: Record<string, boolean> = Object.fromEntries(CONNECT_INTEGRATIONS.map((c) => [c.id, true]));

function allApproved(): Record<string, Decision> {
  const d: Record<string, Decision> = {
    'step:scorecard': { status: 'approved' },
    'step:website': { status: 'approved' },
  };
  for (const k of [...PAID_IDS, ...ARTICLE_IDS, ...STRATEGY_KEYS]) d[k] = { status: 'approved' };
  return d;
}

/** Everything approved, all accounts connected — the Reviewed look. */
export const APPROVED_SEED = { decisions: allApproved(), connections: ALL_CONNECTED };

/** Two representative steps flagged "changes requested" (an SEO/AEO article +
 *  Get-found strategy), matching the notes on the mixed Home. */
export function changesSeed(notes: string[]): { decisions: Record<string, Decision>; connections: Record<string, boolean> } {
  const d = allApproved();
  if (ARTICLE_IDS.includes('seo:refinish-cost')) d['seo:refinish-cost'] = { status: 'changes', note: notes[0] };
  d['strategy:discovery'] = { status: 'changes', note: notes[1] ?? notes[0] };
  return { decisions: d, connections: ALL_CONNECTED };
}
