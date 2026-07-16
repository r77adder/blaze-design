/**
 * Growth Engine Review: all content in one place.
 *
 * Sources (fetched 2026-07-08):
 *  - Scorecard: app.blaze.ai/dfy/scorecards/1DI3LwRLXQbOZf61Mj52Eg (live data)
 *  - Strategy: "GDF - Growth Strategy" Google Doc
 *  - Creative: Grain Design Flooring Figma boards (Paid Campaigns + Evergreen
 *    Organic), exported stills under ./assets/
 *  - Market reference: "GDF - Paid Competitor Review" + "GDF - Organic
 *    Competitor Review" Google Docs (qualitative audits, not numeric benchmarks)
 */

// ─── Assets ──────────────────────────────────────────────────────────────────

import websiteHero from './assets/website-hero.jpg';

import artRefinishCost from './assets/org-bts-sander.jpg';
import artEngineeredSolid from './assets/paid-brand-video.jpg';
import artNoSanding from './assets/org-reel-process.jpg';
import artLvpHardwood from './assets/paid-ugc-video.jpg';
import artRadiantHeat from './assets/org-bts-herringbone.jpg';
import artLifespan from './assets/org-reel-hallway.jpg';

import adSearchRefinish from './assets/org-bts-trowel.jpg';
import adSearchLvp from './assets/org-reel-timelapse.jpg';

export { websiteHero };

export const CLIENT_NAME = 'Grain Design Flooring';
export const AM_NAME = 'Dana Whitfield';
export const WEBSITE_URL = 'https://site-grain-design-flooring.blaze-dfy.workers.dev/';

// ─── Step 1: Scorecard (live data from app.blaze.ai) ─────────────────────────

export interface ScorecardSection {
  id: string;
  title: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  nextSteps: { label: string; effort: 'quick' | 'medium' | 'project' }[];
}

export interface ComparisonRow {
  name: string;
  isUs?: boolean;
  scores: { 'Paid Ads': number; Organic: number; Website: number; Reputation: number };
  overall: number;
}

export const SCORECARD_SUMMARY =
  'A fair foundation with real bright spots. Your reputation is outstanding and your website does the basics right, '
  + 'but paid ads and search visibility are holding you back. You rank 3rd of 5 local competitors and are hard to '
  + 'find unless someone already knows your name.';

export const COMPARISON_ROWS: ComparisonRow[] = [
  { name: "Buddy's Flooring America", scores: { 'Paid Ads': 100, Organic: 100, Website: 72, Reputation: 100 }, overall: 93 },
  { name: 'All About Floors', scores: { 'Paid Ads': 0, Organic: 50, Website: 89, Reputation: 100 }, overall: 67 },
  { name: 'Grain Design Flooring', isUs: true, scores: { 'Paid Ads': 30, Organic: 38, Website: 83, Reputation: 90 }, overall: 64 },
  { name: 'Lumber Liquidators', scores: { 'Paid Ads': 100, Organic: 50, Website: 79, Reputation: 44 }, overall: 63 },
  { name: 'Schmidt Flooring', scores: { 'Paid Ads': 0, Organic: 16, Website: 82, Reputation: 42 }, overall: 38 },
];

export const SCORECARD_SECTIONS: ScorecardSection[] = [
  {
    id: 'paid',
    title: 'Paid Ads',
    score: 30,
    strengths: [
      "Your website already has conversion tracking set up, so the moment you launch ads, you'll be able to measure which clicks turn into real leads.",
      "Your Google Business Profile is verified, which is the foundation both Local Services Ads and the map pack are built on.",
    ],
    weaknesses: [
      "You have no Google Search ads running, so when someone in your area searches for your service right now, your competitors are showing up at the top and you're not.",
      "You have no Local Services Ads running, so you're missing the Google Guaranteed slots that sit above everything else on local searches, where the highest-intent homeowners look first.",
    ],
    nextSteps: [
      { label: 'Launch a basic Google Search ad campaign targeting your top 2 to 3 service keywords in your local area to start capturing high-intent customers who are actively searching right now.', effort: 'medium' },
      { label: 'Turn on Google Local Services Ads (the Google Guaranteed listings) so you appear above the search results for local queries and only pay per lead, not per click.', effort: 'medium' },
      { label: 'Expand into more high-intent keyword themes and neighborhoods once the first campaigns prove out, to grow lead volume beyond your core terms.', effort: 'project' },
    ],
  },
  {
    id: 'organic',
    title: 'Organic Presence',
    score: 38,
    strengths: [
      "You're active on 3 social media channels, giving you multiple places where potential customers can discover and follow you.",
      "You're posting frequently, 15 times in the last 30 days, which keeps your audience engaged and signals that your business is active.",
    ],
    weaknesses: [
      "When someone searches for your business by name on Google, you don't show up first, meaning a competitor or directory could be the first thing they see instead of you.",
      "You're not appearing in Google search results for your service category, so people searching for what you do in your area aren't finding you organically.",
      "You're averaging around position 6 in the Google Maps results for your local area, which puts you below the top 3 spots that get the vast majority of clicks and calls.",
    ],
    nextSteps: [
      { label: 'Claim and fully complete your Google Business Profile (add your business name, category, services, photos, and hours) to improve your chances of ranking in the top 3 of the Google Maps pack.', effort: 'medium' },
      { label: 'Publish SEO and AEO buyer-education articles and service pages targeting your core queries, so you begin showing up in both Google and AI search (ChatGPT, Gemini, Perplexity) results.', effort: 'project' },
      { label: 'Do a branded search audit: Google your exact business name and ensure your website and Google Business Profile are fully optimized so you rank first for your own name.', effort: 'quick' },
    ],
  },
  {
    id: 'website',
    title: 'Website & Conversion',
    score: 83,
    strengths: [
      'Visitors can tap your phone number directly from their phone, making it easy to call you in one touch.',
      'Your website has a clear main button or prompt that tells visitors exactly what to do next, no guessing required.',
      'Your site adjusts properly for phones and tablets, so it looks good and works well no matter what device someone uses.',
    ],
    weaknesses: [
      'Your site only has a couple of trust signals (things like license badges, certifications, award logos, or association memberships that help a first-time visitor feel confident hiring you), so some people may hesitate before reaching out.',
      'Your site loads slowly on phones, which can frustrate mobile visitors and cause some of them to leave before they even see what you offer.',
    ],
    nextSteps: [
      { label: 'Add at least 3 to 5 trust-building elements to your homepage (such as your contractor license number, industry association logos, or any awards) to reassure first-time visitors.', effort: 'quick' },
      { label: 'Improve your mobile load time to under 2.5 seconds by compressing large images and removing any unnecessary scripts.', effort: 'medium' },
      { label: "Audit and add a lead capture form (e.g. 'Get a Free Quote') so visitors who aren't ready to call still have a way to contact you.", effort: 'medium' },
    ],
  },
  {
    id: 'reputation',
    title: 'Reputation',
    score: 90,
    strengths: [
      'You carry a near-perfect 4.9-star rating, which is one of the strongest trust signals a local business can have.',
      'With 118 reviews, you have a large body of social proof that gives new customers confidence before they ever contact you.',
      "You're consistently earning new reviews (8 in the last 90 days), showing customers are actively and recently vouching for you.",
      'You have no unanswered negative reviews, meaning any criticism has been handled, which protects your reputation.',
      "Your reviews appear across 3 different platforms, so you're visible and credible wherever a potential customer looks.",
    ],
    weaknesses: [
      "You're only responding to about 4 in 10 reviews, which means most customers who took the time to leave feedback aren't hearing back from you, and prospective customers notice when owners are engaged versus silent.",
    ],
    nextSteps: [
      { label: 'Set aside 10 minutes each week to respond to every new review (a simple thank-you on positive ones and a professional reply on any negative ones), aiming to get your response rate above 80%.', effort: 'quick' },
    ],
  },
];

// How each dimension's 0–100 score is calculated, surfaced via the
// question-mark tooltip on each section header.
export const METHODOLOGY: Record<string, string> = {
  paid: 'Google Search ads active (+35) · Local Services Ads live (+35) · Conversion tracking (+20) · Branded keyword defense (+10)',
  organic: 'Posting cadence ≥ 8×/month (+35) · GBP photos + posts fresh (+30) · Active on 3+ platforms (+20) · Video/short-form present (+15)',
  website: 'Mobile LCP < 2.5 s (+30) · Strong CTA copy (+25) · Lead form ≤ 4 fields (+20) · Trust signals present (+25)',
  reputation: 'Avg rating × 20 (+40 max) · Review count tier ≥ 50 (+30) · ≥ 2 new reviews/month (+20) · Response rate ≥ 80% (+10)',
};

// ─── Step 2: Growth strategy (from the GDF Growth Strategy doc) ──────────────

export interface StrategyPillar {
  id: string;
  title: string;
  intro: string;
  items: { title: string; body: string; spend?: string }[];
  /** Digital-home pillar renders a website thumbnail alongside its items. */
  showWebsite?: boolean;
  proofPoints?: string[];
  /** Monthly price for this section, shown as a row under the pillar. */
  price?: string;
  /** Optional muted note under the price (e.g. what the price includes). */
  priceNote?: string;
}

/** Grand total across all strategy sections, shown at the bottom of the step. */
export const STRATEGY_TOTAL = '$4,200/mo';
export const STRATEGY_TOTAL_NOTE = 'includes ~$2,850/mo in ad spend';

export const STRATEGY_PILLARS: StrategyPillar[] = [
  {
    id: 'digital-home',
    title: 'Digital home',
    intro: 'The properties you own, all pointing at one action: booking.',
    showWebsite: true,
    items: [
      { title: 'Continually updated website', body: 'A full rebuild plus product and service landing pages, each wired to the AI receptionist and a single call to action.' },
      { title: 'Google Business Profile (GBP)', body: 'Claimed, fully optimized, and kept fresh with posts and job photos to climb the local map pack.' },
    ],
    proofPoints: ['4.9★ Google rating', 'NWFA & Bona certified', '2025 NWFA Wood Floor of the Year', 'Family-owned since 2013'],
    price: '$450/mo',
  },
  {
    id: 'discovery',
    title: 'Discovery engine',
    intro: 'How new homeowners find you, across paid, organic, and the reputation that makes them choose you.',
    items: [
      { title: 'Search ads', body: 'Local Services Ads ($50/day) in the Google Guaranteed slots plus Google Search text ads ($45/day) on your highest-intent terms, pointed at a free estimate. Pay-per-lead where it counts.', spend: '$95/day' },
      { title: 'SEO / AEO articles', body: 'Buyer-education articles and service pages built to win both Google and AI search (ChatGPT, Gemini, Perplexity) for the questions homeowners ask.', spend: '4 articles/mo' },
      { title: 'Reputation management', body: 'Automated review requests after every completed job, expect 8 to 12 new reviews a month, with every one answered.' },
    ],
    price: '$3,200/mo',
    priceNote: 'includes ~$2,850/mo ad spend',
  },
  {
    id: 'qualification',
    title: 'Lead qualification',
    intro: 'Every inquiry answered fast and captured, so no lead slips while interest is hot.',
    items: [
      { title: 'Inbound lead management', body: 'The AI receptionist answers every call and message in under 5 minutes, day or night, and books the consultation before interest cools.' },
      { title: 'Lead form', body: 'A short "Get a Free Quote" form for visitors who are not ready to call, so you still capture them.' },
    ],
    price: '$400/mo',
  },
  {
    id: 'reporting',
    title: 'Reporting & analytics',
    intro: 'Closed-loop visibility into what every dollar produced.',
    items: [
      { title: 'Closed-loop reporting', body: 'Every lead tied back to the ad, article, or channel that drove it, so you see cost per lead and know what to scale.' },
      { title: 'Monthly review', body: 'A clear monthly readout with your strategist on results, spend, and the next move. No jargon.' },
    ],
    price: '$150/mo',
  },
];

// ─── Step 3: Website ─────────────────────────────────────────────────────────

export const WEBSITE_HEADLINE = 'Your new website is ready!';
export const WEBSITE_SUBHEAD =
  'Your website and Google Business Profile, rebuilt to turn visitors into booked consultations, '
  + 'with your 4.9★ reputation front and center.';

// ─── Steps 4 & 5: Creative review ────────────────────────────────────────────

export type CreativeType = 'Video' | 'Meta Ad' | 'Still Image' | 'Photo' | 'Quote Card' | 'Paid Search' | 'Local Services Ad' | 'SEO Article';

export interface CreativeItem {
  id: string;
  type: CreativeType;
  title: string;
  caption: string;
  /** Clean hero the approval card renders (via CardBody). Absent for text ads. */
  img?: string;
  /** Paid Search / SEO Article: the blue headline line. LSA: the business name. */
  headline?: string;
  /** Local Services Ad: star rating, review count, and service area. */
  rating?: number;
  reviews?: number;
  area?: string;
  /** SEO / AEO article: the search / AI query the piece targets. */
  query?: string;
  /** SEO / AEO article: body sections (heading + paragraph) for the webpage preview. */
  sections?: { heading: string; body: string }[];
  /** Optional real video clip for Video items; falls back to a simulated reel player. */
  video?: string;
  /** Optional full composed asset (e.g. the in-feed FB ad) shown in the lightbox. */
  previewImg?: string;
  /** Portrait 9/16 for reels & video, 4/5 for FB wraps and photos, 1/1 for quote cards. */
  aspect?: string;
}

export interface CreativeGroup {
  id: string;
  title: string;
  why: string;
  items: CreativeItem[];
  reference?: { img: string; name: string; note: string; aspect: string };
}

// Local Services Ads were removed from the paid step; Google Search (below) is
// the whole paid story now.
export const PAID_GROUPS: CreativeGroup[] = [];

// ─── Google Search: Responsive Search Ad asset pool ──────────────────────────
// Google mixes and matches up to 15 headlines and 4 descriptions (plus images
// and URL paths) to assemble the best-performing ads, so the client reviews the
// assets, not finished ads.

export interface SearchAsset { id: string; text: string }
export interface SearchAdImage { id: string; label: string; img: string }
export interface SearchAdsData {
  finalUrl: string;
  displayPaths: SearchAsset[];
  headlines: SearchAsset[];
  descriptions: SearchAsset[];
  images: SearchAdImage[];
}

export const SEARCH_ADS: SearchAdsData = {
  finalUrl: 'graindesignflooring.com',
  displayPaths: [
    { id: 'path1', text: 'Hardwood-Refinishing' },
    { id: 'path2', text: 'Austin' },
  ],
  headlines: [
    { id: 'h1', text: 'Hardwood Floor Refinishing' },
    { id: 'h2', text: 'Austin Flooring Experts' },
    { id: 'h3', text: 'Free In-Home Estimate' },
    { id: 'h4', text: 'Dust-Free Sanding' },
    { id: 'h5', text: '10-Year Finish Warranty' },
    { id: 'h6', text: 'NWFA-Certified Installers' },
    { id: 'h7', text: 'Luxury Vinyl Plank Install' },
    { id: 'h8', text: 'Custom Hardwood Installs' },
    { id: 'h9', text: '4.9 Stars, 400+ Reviews' },
    { id: 'h10', text: 'Family-Owned Since 2013' },
    { id: 'h11', text: 'Fixed Quote in 24 Hours' },
    { id: 'h12', text: 'Waterproof, Pet-Proof Floors' },
    { id: 'h13', text: 'Herringbone & Chevron' },
    { id: 'h14', text: 'Book a Free Consultation' },
    { id: 'h15', text: 'Serving Greater Austin' },
  ],
  descriptions: [
    { id: 'd1', text: 'Dust-free sanding, custom stains, and a 10-year finish warranty. Book your free estimate today.' },
    { id: 'd2', text: 'From wood-look plank to solid hardwood, installed by our own NWFA-certified crew.' },
    { id: 'd3', text: 'Trusted by 400+ Austin homeowners. 4.9-star rating and a free in-home consultation.' },
    { id: 'd4', text: 'Family-owned since 2013. Fixed quotes in 48 hours, no surprises and no pressure.' },
  ],
  images: [
    { id: 'img1', label: 'Refinished white oak', img: adSearchRefinish },
    { id: 'img2', label: 'Herringbone install', img: artEngineeredSolid },
    { id: 'img3', label: 'Wide-plank living room', img: adSearchLvp },
  ],
};

// ─── Sitelinks: the extra links shown under a Search ad ──────────────────────
// Each is a short title + a two-part supporting line, pointing at a page URL.

export interface Sitelink { id: string; title: string; desc: string; url: string }

export const SITELINKS: Sitelink[] = [
  { id: 'sl1', title: 'Free In-Home Estimate', desc: 'Book in 60 seconds · No fees, no pressure', url: 'graindesignflooring.com/estimate' },
  { id: 'sl2', title: 'Hardwood Refinishing', desc: 'Dust-free sanding · 10-year finish warranty', url: 'graindesignflooring.com/refinishing' },
  { id: 'sl3', title: 'Our Reviews', desc: '4.9 stars · 400+ Austin homeowners', url: 'graindesignflooring.com/reviews' },
  { id: 'sl4', title: 'Financing Options', desc: '0% for 12 months · Apply online', url: 'graindesignflooring.com/financing' },
  { id: 'sl5', title: 'Service Areas', desc: 'Serving greater Austin · Same-week slots', url: 'graindesignflooring.com/service-areas' },
  { id: 'sl6', title: 'Project Gallery', desc: 'Real installs · Before & after photos', url: 'graindesignflooring.com/gallery' },
];

// ─── SEO / AEO articles (new content step) ───────────────────────────────────

export const ARTICLES: CreativeItem[] = [
  {
    id: 'seo:refinish-cost', type: 'SEO Article', img: artRefinishCost, query: 'hardwood floor refinishing cost austin',
    title: 'How Much Does Hardwood Floor Refinishing Cost in Austin? (2026)',
    headline: 'How Much Does Hardwood Floor Refinishing Cost in Austin? (2026)',
    caption: 'A plain-English breakdown of what hardwood refinishing costs in Austin per square foot, the factors that push the number up or down, and how to tell when refinishing is the smarter call than a full replacement. If you have been putting off a quote because you are not sure what is fair, this is the guide to read first.',
    sections: [
      { heading: 'What refinishing costs in Austin', body: 'Most Austin homes run $3 to $5 per square foot for a standard sand-and-finish, or about $1,200 to $2,500 for a living room and hallway. Whole-home projects usually land between $3,500 and $7,000 depending on square footage and layout. Those numbers assume solid wood in good structural shape and a straightforward floor plan without a lot of tight corners.' },
      { heading: 'What is included in a fair quote', body: 'A complete refinishing quote should cover dust-containment sanding, edging and detail work along the walls, filling minor gaps and nail holes, and at least two to three coats of finish. Ask whether furniture moving, shoe-molding removal, and the final cleanup are included, because those line items are where surprise charges tend to hide. A written scope beats a round number every time.' },
      { heading: 'What moves the price up', body: 'Stairs are the single biggest add-on because each tread and riser is sanded and finished by hand. Heavy pet damage, gray or black water stains, custom stain matching, and border or medallion inlays all add labor. Premium finishes like Bona Traffic HD cost more up front but shrug off Austin foot traffic for years longer than a builder-grade coat.' },
      { heading: 'Oil vs. water-based finish', body: 'Oil-based polyurethane is cheaper and gives that warm amber tone, but it yellows over time and takes days to cure. Water-based finishes dry fast, stay clear, and let you move furniture back sooner, at a modest premium. For families and pets, the faster cure and lower odor usually justify the extra cost.' },
      { heading: 'Refinish or replace?', body: 'If the boards are solid with enough wear layer left, refinishing is almost always cheaper than replacement. Once boards cup, crack, or have been sanded past the tongue too many times, replacement becomes the better spend. A quick probe with a moisture meter and a look at board thickness tells the story fast.' },
      { heading: 'How to save without cutting corners', body: 'Refinish connected rooms together to avoid mobilization fees, book in the slower winter months, and clear and clean the space yourself before the crew arrives. Skipping the sand entirely to save money almost always backfires; a proper sand is what makes the finish last.' },
    ],
  },
  {
    id: 'seo:engineered-vs-solid', type: 'SEO Article', img: artEngineeredSolid, query: 'engineered vs solid hardwood texas',
    title: 'Engineered vs. Solid Hardwood: Which Is Right for a Texas Home?',
    headline: 'Engineered vs. Solid Hardwood: Which Is Right for a Texas Home?',
    caption: 'A homeowner guide to choosing between engineered and solid hardwood in the Texas climate: how humidity and slab foundations affect each, which one fits which room, and what the choice means for resale. Both are real wood on the surface, so the right answer comes down to your subfloor, your climate, and how long you plan to stay.',
    sections: [
      { heading: 'How Texas humidity changes the math', body: 'Central Texas swings from dry winters to humid summers, which makes solid hardwood expand and contract across the seasons. That movement can open gaps in winter and cause cupping in summer if the wood was not acclimated properly. Engineered planks are built from cross-layered plies, so they are more dimensionally stable and ride out that movement better.' },
      { heading: 'Slab vs. pier-and-beam', body: 'Most Austin homes built after the 1970s sit on concrete slabs, where engineered flooring can be glued or floated directly over a moisture barrier. Solid hardwood generally needs a plywood subfloor or a pier-and-beam foundation to nail into. Trying to force solid wood onto a slab usually means adding a plywood layer, which raises floor height and cost.' },
      { heading: 'Where each one shines, room by room', body: 'Engineered is the safer pick for ground floors, kitchens, and anywhere over a slab or radiant heat. Solid hardwood is a great fit for upstairs bedrooms and living areas on a wood subfloor, where humidity is steadier. Neither belongs in a full bathroom or laundry room, where tile or vinyl still wins.' },
      { heading: 'Refinishing and repairs', body: 'Solid hardwood can be sanded and refinished many times over its life, so a scratched or dated floor can be reborn rather than replaced. Engineered floors can be refinished too, but only as many times as the wear layer allows, from once to several times. A thick 4mm-plus wear layer is what separates a lifetime engineered floor from a disposable one.' },
      { heading: 'Resale and appraisals', body: 'Real hardwood, solid or engineered, reads as a premium feature to Austin buyers and appraisers, especially compared with carpet or laminate. Solid still carries a slight edge in listing language, but a quality engineered floor closes most of that gap. What buyers actually notice is condition and consistency across rooms, not the construction underneath.' },
      { heading: 'Our default recommendation', body: 'For most Austin homes on a slab, we recommend a quality engineered white oak with a thick wear layer: it is stable, refinishable, and looks identical to solid once installed. We reserve solid hardwood for pier-and-beam homes and upstairs spaces where the subfloor and climate cooperate.' },
    ],
  },
  {
    id: 'seo:refinish-no-sanding', type: 'SEO Article', img: artNoSanding, query: 'refinish hardwood without sanding',
    title: 'Can You Refinish Hardwood Floors Without Sanding?',
    headline: 'Can You Refinish Hardwood Floors Without Sanding?',
    caption: 'When a no-sand screen-and-recoat actually works, when floors truly need a full sand to bare wood, and why dust-free sanding is not the same thing as skipping the sanding step. Getting this call right saves money on floors that only need a refresh, and saves heartache on floors that need more.',
    sections: [
      { heading: 'When a recoat works', body: 'If the finish is worn but the wood underneath is sound and unstained, a screen-and-recoat can refresh the floor in a single day. The crew lightly abrades the existing finish so a fresh topcoat bonds, then rolls on one or two new coats. It is the fastest, cheapest way to restore sheen and protection on a floor that is just tired, not damaged.' },
      { heading: 'When you need a full sand', body: 'Deep scratches that reach bare wood, gray or black water stains, pet damage, and any spot where the finish has worn through all mean the floor has to go back to raw wood. A recoat over that kind of damage just seals the problem under a shiny layer. Sanding to bare wood is also the only way to change the stain color.' },
      { heading: 'How to test your floor at home', body: 'Dab a little mineral spirits on a worn area: if it darkens and looks good, the wood is sound and a recoat may be enough. In a hidden corner, scratch lightly with a coin; if you reach bare wood fast, the finish is nearly gone. Water beading up is a good sign, water soaking in means the finish has failed.' },
      { heading: 'Dust-free is not no-sanding', body: 'Dustless systems still sand the floor; they attach to a vacuum that captures dust at the tool instead of letting it drift through your home. What changes is the cleanup and air quality, not the process itself. Some crews market dust-free as if it skips sanding, which it does not.' },
      { heading: 'What each option costs', body: 'A screen-and-recoat typically runs about $1 to $2 per square foot, while a full sand-and-finish is closer to $3 to $5. The recoat is a smart maintenance move every few years to postpone a full refinish. If the floor already needs a full sand, paying for a recoat first is money wasted.' },
    ],
  },
  {
    id: 'seo:lvp-vs-hardwood', type: 'SEO Article', img: artLvpHardwood, query: 'lvp vs hardwood cost',
    title: 'Luxury Vinyl Plank vs. Hardwood: Cost, Durability, and Resale',
    headline: 'Luxury Vinyl Plank vs. Hardwood: Cost, Durability, and Resale',
    caption: 'An honest side-by-side of luxury vinyl plank and hardwood on cost, durability, water resistance, and resale, so families can weigh the upfront budget against long-term value and pick the right floor. Neither is the right answer for every room, and the smartest homes often use both.',
    sections: [
      { heading: 'Upfront cost', body: 'Luxury vinyl plank runs roughly $4 to $9 per square foot installed, while site-finished hardwood is often $8 to $15. LVP is the budget-friendlier starting point, especially for large open floor plans. The gap narrows once you factor in how long each floor lasts before it needs real work.' },
      { heading: 'Durability and water', body: 'LVP is fully waterproof and shrugs off scratches, pets, and dropped toys, which makes it hard to beat in kitchens, mudrooms, and baths. Hardwood is more scratch and moisture sensitive and does not belong in standing-water zones. The trade-off is that a damaged LVP plank has to be swapped, while hardwood can be sanded smooth again.' },
      { heading: 'Comfort, feel, and sound', body: 'Hardwood feels solid and warm underfoot and adds real acoustic warmth to a room. LVP is softer and quieter to walk on but can sound hollow over an uneven subfloor without a quality underlayment. In bedrooms and living rooms, most people still prefer the feel of real wood.' },
      { heading: 'Resale value', body: 'Real hardwood still commands a premium with Austin buyers and appraisers and is frequently called out in listings. LVP is widely accepted but rarely adds to appraised value the way hardwood does. For a forever home, hardwood is an investment; for a rental or a quick flip, LVP protects the budget.' },
      { heading: 'Which to pick, room by room', body: 'Put hardwood in the living room, dining room, hallways, and bedrooms where it shows and lasts. Use LVP in the kitchen, laundry, bathrooms, and basement playroom where water and abuse are constant. Matching the plank color across the two keeps the whole house feeling cohesive.' },
    ],
  },
  {
    id: 'seo:radiant-heat', type: 'SEO Article', img: artRadiantHeat, query: 'radiant heat hardwood floors',
    title: 'Radiant Heat and Hardwood: What You Can and Cannot Install',
    headline: 'Radiant Heat and Hardwood: What You Can and Cannot Install',
    caption: 'Which wood species and constructions are safe over in-floor radiant heat, the moisture readings to check before installing, and the common mistakes that crack boards or void the warranty. Wood over radiant heat can be beautiful and comfortable, but only if the details are handled right from the start.',
    sections: [
      { heading: 'Species that behave', body: 'Quartersawn and riftsawn white oak, walnut, and most engineered constructions handle radiant heat well because they move less as they warm and cool. Wide-plank and moisture-sensitive species like hard maple, hickory, and beech are riskier and more prone to gapping. Narrower boards and engineered cores are your friends here.' },
      { heading: 'Solid vs. engineered over heat', body: 'Engineered flooring is almost always the better choice over radiant heat thanks to its stable cross-layered core. Solid wood can work in narrow widths with a careful installer, but the risk of gapping and cupping climbs. Most manufacturers only warranty their engineered lines for radiant applications.' },
      { heading: 'Get the moisture right', body: 'Acclimate the wood on site for several days, run the heating system before installation to stabilize the slab, and keep the subfloor and wood moisture content within a few points of each other. Skipping acclimation is the single biggest cause of gapping over radiant heat. A moisture meter reading is not optional on these jobs.' },
      { heading: 'Mistakes that void warranties', body: 'Pushing past the surface-temperature cap, usually around 80 degrees Fahrenheit, or ramping the heat up too fast in the first weeks will crack boards and void most manufacturer warranties. Area rugs that trap heat can create hot spots that damage the finish. Always follow the maker written radiant-heat guidelines to the letter.' },
      { heading: 'Living with a heated wood floor', body: 'Raise and lower the temperature gradually, ideally no more than a few degrees per day at the start of the season. A whole-home humidifier helps hold the indoor humidity steady through dry Texas winters. Done right, a heated wood floor stays flat, quiet, and comfortable for decades.' },
    ],
  },
  {
    id: 'seo:lifespan', type: 'SEO Article', img: artLifespan, query: 'how long do refinished floors last',
    title: 'How Long Do Refinished Hardwood Floors Last?',
    headline: 'How Long Do Refinished Hardwood Floors Last?',
    caption: 'How many times a hardwood floor can be refinished, what wears it down the fastest, and the simple upkeep that can stretch a single sand-and-finish well past a decade. With the right care, one good refinish can outlast several sets of carpet in the same home.',
    sections: [
      { heading: 'How many refinishes you get', body: 'A solid three-quarter-inch floor can typically be sanded four to six times over its life before it reaches the tongue-and-groove. Engineered floors depend entirely on wear-layer thickness, ranging from a single recoat to several full sands. A skilled crew removes only what is needed, which stretches how many refinishes remain.' },
      { heading: 'How long a refinish lasts', body: 'In a typical Austin family home, a quality sand-and-finish looks great for seven to ten years before it needs attention. High-traffic entries and kitchens show wear first, while bedrooms can go much longer. The finish you choose matters: a commercial-grade waterborne topcoat outlasts a basic polyurethane by years.' },
      { heading: 'What wears a floor down', body: 'Grit tracked in from outside acts like sandpaper underfoot and does the most damage of anything. Unprotected furniture, pet nails, rolling chairs, and direct sun all take their toll too. The good news is that most of the wear is to the finish, not the wood itself, which is exactly what refinishing renews.' },
      { heading: 'Signs it is time to refinish', body: 'Watch for a dull traffic path that will not clean up, bare or graying wood at doorways, and water that soaks in rather than beads. Catching it at the finish stage means a light recoat instead of a full sand. Waiting until bare wood shows lets moisture and stains reach the board itself.' },
      { heading: 'Stretching a refinish past a decade', body: 'Felt pads under furniture, entry mats at every door, quick spill cleanup, and a no-shoes habit all protect the finish. A maintenance recoat every three to five years renews the top layer before wear reaches the wood. That simple rhythm can keep a single sand-and-finish looking good for well over ten years.' },
    ],
  },
];

// ─── Step 6: Accounts to connect ─────────────────────────────────────────────

export type ConnectIconKey = 'instagram' | 'facebook' | 'google' | 'globe' | 'calendar' | 'mail' | 'meta' | 'marker';

export interface ConnectStep {
  text: string;
  note?: string;
  /** Optional inline mockup rendered under the step (only 'instagram' today). */
  mockup?: 'instagram';
  /** When set, a "See Setup Guide" button renders after this step. */
  guideLabel?: string;
}

export interface ConnectIntegration {
  id: string;
  name: string;
  icon: ConnectIconKey;
  purpose: string;
  modalTitle: string;
  steps: ConnectStep[];
  ctaLabel: string;
}

export const CONNECT_INTEGRATIONS: ConnectIntegration[] = [
  {
    id: 'connect:google-business',
    id: 'gbp',
    name: 'Google Business Profile',
    purpose: 'Local posts, review replies, and map ranking.',
    icon: 'globe',
    purpose: 'Power Local Services Ads and the Maps pack.',
    modalTitle: 'Connect Google Business Profile',
    ctaLabel: 'Go to Google Business',
    steps: [
      {
        text: 'Confirm your Google Business Profile is claimed and verified for Grain Design Flooring, and that you\'re listed as an owner or manager. This is what powers your ranking in the local Maps pack.',
        note: 'If the profile isn\'t verified yet, Google will mail a postcard with a code. Start that early.',
        guideLabel: 'See Setup Guide',
      },
      { text: 'Proceed below to sign in with the Google account that manages the profile. We\'ll request access to read and post to your listing.' },
    ],
  },
  {
    id: 'connect:google-ads',
    name: 'Google Ads',
    icon: 'google',
    purpose: 'Run paid search on your top service keywords.',
    modalTitle: 'Connect Google Ads',
    ctaLabel: 'Go to Google Ads',
    steps: [
      {
        text: 'Have your Google Ads account ID ready (or let us create one for you). Blaze needs manager access so we can launch and optimize your search campaigns.',
        note: 'New to Google Ads? Skip ahead, we\'ll spin up a fresh account during onboarding.',
        guideLabel: 'See Setup Guide',
      },
      { text: 'Proceed below to sign in with Google and grant Blaze manager access to your Google Ads account.' },
    ],
  },
  {
    id: 'connect:outlook',
    name: 'Outlook Calendar',
    icon: 'mail',
    purpose: 'Book consultations into Outlook (Microsoft 365).',
    modalTitle: 'Connect Outlook Calendar',
    ctaLabel: 'Go to Microsoft 365',
    steps: [
      {
        text: 'Sign in with the Microsoft 365 account that owns the calendar your sales consultations should land on. Make sure that account can create events on the calendar you book into.',
        note: 'Personal Outlook.com accounts work too, but a Microsoft 365 business account keeps availability accurate across your team.',
        guideLabel: 'See Setup Guide',
      },
      { text: 'Proceed below to authenticate with Microsoft. We\'ll request permission to read availability and create booking events, nothing else.' },
    ],
  },
  {
    id: 'connect:google-calendar',
    name: 'Google Calendar',
    icon: 'calendar',
    purpose: 'Book consultations into Google Calendar.',
    modalTitle: 'Connect Google Calendar',
    ctaLabel: 'Go to Google',
    steps: [
      {
        text: 'Sign in with the Google account that owns your booking calendar, and confirm you can create events on it. This is where booked consultations will appear.',
        note: 'Connect only if your team runs on Google Calendar rather than Outlook, no need to connect both.',
        guideLabel: 'See Setup Guide',
      },
      { text: 'Proceed below to sign in with Google. We\'ll request permission to read availability and create booking events only.' },
    ],
  },
];


// ─── Step 6: Access the team needs (Growth Engine Review integrations) ────────
// A plain checklist of the access grants onboarding needs, each with a short
// how-to shown behind a question-mark hover.

export interface AccessField {
  label: string;
  placeholder: string;
}

/** A value the client copies and pastes into the provider (our team email, a
 *  manager ID, etc.). Rendered with a one-click copy button. */
export interface AccessCopyable {
  label: string;
  value: string;
}

export interface AccessItem {
  id: string;
  name: string;
  icon: ConnectIconKey;
  /** Short line shown on the client Home connect list. */
  purpose: string;
  steps: string[];
  copyables?: AccessCopyable[];
  fields: AccessField[];
}

// Values the client pastes into each provider to grant Blaze access.
const BLAZE_EMAIL = 'access@blaze.ai';
const BLAZE_MCC_ID = '742-318-9065';
const BLAZE_META_PARTNER_ID = '478120095513402';

export const ACCESS_ITEMS: AccessItem[] = [
  {
    id: 'domain',
    name: 'Domain host access for the website',
    purpose: 'So we can point your domain at the new website.',
    icon: 'globe',
    steps: [
      'Sign in to your domain registrar (GoDaddy, Namecheap, Google Domains, etc.).',
      'Open the account settings and find "Delegate access" or "Invite a user".',
      'Add your strategist as a delegate, or securely share a login with them.',
      'Add your registrar and login below so we know where to look.',
    ],
    fields: [
      { label: 'Registrar / host', placeholder: 'GoDaddy, Namecheap, Google Domains…' },
      { label: 'Login email or username', placeholder: 'you@graindesignflooring.com' },
    ],
  },
  {
    id: 'gbp',
    name: 'Google Business Profile',
    purpose: 'Local posts, review replies, and map ranking.',
    icon: 'marker',
    steps: [
      'Open your Business Profile and go to Settings.',
      'Choose "People and access".',
      'Click "Add", paste our email, and set the role to Manager.',
      'Send, then drop your account email below so we can confirm.',
    ],
    copyables: [{ label: 'Invite this email as a Manager', value: BLAZE_EMAIL }],
    fields: [
      { label: 'Google account email that manages the profile', placeholder: 'you@graindesignflooring.com' },
    ],
  },
  {
    id: 'analytics',
    name: 'Google Analytics',
    purpose: 'Track conversions and the leads your marketing drives.',
    icon: 'google',
    steps: [
      'In Google Analytics, click Admin (the gear, bottom left).',
      'Under your property, open "Property access management".',
      'Click the +, paste our email, and give it Editor access.',
      'Add your GA4 property ID below so we grab the right property.',
    ],
    copyables: [{ label: 'Add this email with Editor access', value: BLAZE_EMAIL }],
    fields: [
      { label: 'GA4 property ID', placeholder: 'e.g. 123456789' },
      { label: 'Account email', placeholder: 'you@graindesignflooring.com' },
    ],
  },
  {
    id: 'google-ads',
    name: 'Google Ads account',
    purpose: 'Paid search runs and optimizes against your goals.',
    icon: 'google',
    steps: [
      'In Google Ads, open Admin, then "Access and security".',
      'Go to the Managers tab and click the + to link a manager account.',
      'Enter our manager (MCC) ID below and send the request.',
      'Add your Customer ID below, then approve the link when it arrives.',
    ],
    copyables: [
      { label: 'Our manager (MCC) ID', value: BLAZE_MCC_ID },
    ],
    fields: [
      { label: 'Customer ID (CID)', placeholder: '000-000-0000' },
    ],
  },
  {
    id: 'gtm',
    name: 'Google Tag Manager',
    purpose: 'Fire conversion and analytics tags on your site.',
    icon: 'google',
    steps: [
      'In Tag Manager, open Admin.',
      'Under Container, choose "User Management".',
      'Click the +, paste our email, and grant Publish rights.',
      'Add your container ID below so we confirm the right one.',
    ],
    copyables: [{ label: 'Invite this email with Publish rights', value: BLAZE_EMAIL }],
    fields: [
      { label: 'Container ID', placeholder: 'GTM-XXXXXXX' },
      { label: 'Account email', placeholder: 'you@graindesignflooring.com' },
    ],
  },
  {
    id: 'lsa',
    name: 'Google Local Services Ads (if you have one)',
    purpose: 'Run pay-per-lead Local Services Ads.',
    icon: 'marker',
    steps: [
      'Open the Local Services Ads dashboard (or the Local Services app).',
      'Go to Settings, then "Account access".',
      'Share access with your strategist, or link it from your Google Ads manager.',
      'Drop your LSA account email below. Skip this if you do not run LSA yet.',
    ],
    fields: [
      { label: 'LSA account email', placeholder: 'you@graindesignflooring.com' },
    ],
  },
  {
    id: 'meta',
    name: 'Meta Business partner access',
    purpose: 'Organic posts and paid social publish here.',
    icon: 'meta',
    steps: [
      'Open Meta Business Suite and go to Business settings.',
      'Under Users, choose "Partners", then click "Add".',
      'Pick "Give a partner access to your assets" and enter our Business ID below.',
      'Assign your Page and ad account, then send. Add your own Business ID below too.',
    ],
    copyables: [{ label: 'Our partner Business ID', value: BLAZE_META_PARTNER_ID }],
    fields: [
      { label: 'Your Business Manager ID', placeholder: 'e.g. 100000000000000' },
    ],
  },
];

// The client-portal Home "Connect your accounts" list is the same set of
// accounts as the review's last step (Integrations), derived from ACCESS_ITEMS.
export const HOME_CONNECT_INTEGRATIONS: ConnectIntegration[] = ACCESS_ITEMS.map((a) => ({
  id: a.id,
  name: a.name,
  icon: a.icon,
  purpose: a.purpose,
  modalTitle: a.name,
  ctaLabel: 'Continue',
  steps: a.steps.map((text) => ({ text })),
}));
