import type { ToolId } from '../tools-context';

/**
 * Per-tool "the gap we found" + "how Blaze fixes it" narrative.
 * Shared between the Step 5 Strategy screen and the PDF proposal.
 *
 * Copy tuned against the demo scorecard data; rewrite if the demo numbers
 * change so the gap stays believable.
 */
export interface GapAndFix {
  gap: string;
  fix: string;
}

export const GAP_AND_FIX: Record<ToolId, GapAndFix> = {
  'Organic Campaigns': {
    gap: 'You post 1x / week. Competitors average 4x / week and are on 2 more platforms than you.',
    fix: 'Auto-generate a 30-day calendar from your brand profile and schedule across IG, TikTok, LinkedIn, Facebook, X, and YouTube.',
  },
  SEO: {
    gap: 'You rank on the front page for 1 of 6 customer searches. Competitors rank for 4 on average.',
    fix: 'Publish 4 topic-cluster blog posts per month targeting the searches you\'re missing — written by AI, edited by humans.',
  },
  AEO: {
    gap: 'ChatGPT, Perplexity, and Gemini never mention you when your customers ask.',
    fix: 'Structured citations and answer-engine optimization across all major LLMs. Be the cited authority, not the also-ran.',
  },
  'UGC Content': {
    gap: 'You have zero creator-style content. Modern campaigns convert 3× better with UGC than studio assets.',
    fix: 'A pack of 8 AI-avatar UGC videos every 4 months — scripted, voiced, captioned, ready to post or sponsor.',
  },
  'Paid Social': {
    gap: 'You\'re running 0 paid social ads. Competitors run 12 on average and dominate the feed your customers scroll.',
    fix: 'Launch your first 3 Meta + TikTok campaigns within a week. Daily bid management and weekly creative rotation.',
  },
  'Paid Search': {
    gap: 'You run 2 Google Ads. Competitors average 10 — most of your high-intent traffic goes to them.',
    fix: 'Daily keyword + bid management on the searches that actually convert. We A/B test landing pages too.',
  },
  'Landing Pages': {
    gap: 'Your site has 3 of 8 best-practice conversion elements. Hero CTA, lead form, and social proof are missing.',
    fix: 'A new high-converting page per campaign, with A/B-tested hero, form, and proof variants — deployed to your domain.',
  },
  SDR: {
    gap: 'Inbound leads wait 6+ hours for a reply. Conversion drops 80% after the first hour.',
    fix: 'AI Receptionist replies in < 2 minutes via email, SMS, and chat. Qualifies leads, books meetings, hands off the warm ones.',
  },
  Reputation: {
    gap: 'You lead on response rate but have half the review volume of top competitors.',
    fix: 'Auto-drafted responses to every review within an hour + drip campaigns to ask happy customers for reviews.',
  },
};
