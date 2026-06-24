// Competitor market-intelligence corpus that drives creative selection in the
// Meta campaign-creation flow. Each entry is a top-performing ad Blaze observed
// running for an Austin-area painting competitor, paired with a brand-adapted
// version Blaze would generate for CertaPro Austin.

export type CreativeFormat = 'Reel' | 'Carousel' | 'Static' | 'UGC';

export interface CompetitorCreative {
  id: string;
  /** Competitor the winning ad was observed running for. */
  peer: string;
  /** Headline performance metric, e.g. "3.4x ROAS" or "4.8% CTR". */
  metric: string;
  format: CreativeFormat;
  /** The competitor's observed creative. */
  observedImage: string;
  /** One-line description of the competitor's creative hook. */
  hook: string;
  /** Why Blaze flagged this as worth copying — short signal bullets. */
  whyItWorks: string[];
  /** The CertaPro-adapted version Blaze would generate. */
  adapted: {
    image: string;
    headline: string;
    primaryText: string;
    /** Short note on how the style was translated to the brand. */
    note: string;
  };
}

export const COMPETITOR_CREATIVE: CompetitorCreative[] = [
  {
    id: 'five-star-reel',
    peer: 'Five Star Painting of South Austin',
    metric: '3.4x ROAS',
    format: 'Reel',
    observedImage:
      'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=600&q=80',
    hook: 'Owner-led testimonial leading with a review-count stat in the first 2 seconds.',
    whyItWorks: [
      'Review-count hook stops the scroll before the pitch',
      'Hand-held, daylight delivery reads as authentic, not an ad',
      'Top 8% scroll-stop rate in the Austin home-services set',
    ],
    adapted: {
      image:
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80',
      headline: '1,200 Austin homes painted since 2008',
      primaryText:
        'John Bunnell on why CertaPro Austin crews show up on time, every time — and back it with a 2-year warranty. Free estimate this week.',
      note: 'Owner-led testimonial in your brand palette, opening on the homes-painted stat.',
    },
  },
  {
    id: 'paper-moon-carousel',
    peer: 'Paper Moon Painting',
    metric: '4.8% CTR',
    format: 'Carousel',
    observedImage:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80',
    hook: 'Split-screen before/after exterior repaint carousel with the offer on slide 1.',
    whyItWorks: [
      'Before/after transformation is the #1 converting format in the category',
      'Offer-first framing lifts click-through ~30% vs. offer-last',
      'Carousel swipe depth averages 3.1 of 4 frames',
    ],
    adapted: {
      image:
        'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=600&q=80',
      headline: 'Faded siding to fresh in one weekend',
      primaryText:
        'Swipe to see a West Austin exterior go from sun-bleached to brand-new. Save $500 on a full exterior repaint — booking spring slots now.',
      note: 'Three-frame before/after re-shot on a local home, offer on frame 1.',
    },
  },
  {
    id: 'wow-1day-timeline',
    peer: 'WOW 1 DAY PAINTING Austin',
    metric: '2.9x ROAS',
    format: 'Reel',
    observedImage:
      'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&q=80',
    hook: 'Narrative reel walking through a day-by-day repaint timeline with overlays.',
    whyItWorks: [
      'Timeline framing answers the #1 objection: "how long will it take?"',
      'Editorial pacing keeps 6-second view rate above 62%',
      'Calm soundtrack over quick cuts boosts completion',
    ],
    adapted: {
      image:
        'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=600&q=80',
      headline: 'Your exterior repaint, day by day',
      primaryText:
        'Matthew Tims walks the 4-day CertaPro Austin exterior schedule — prep, prime, paint, walkthrough. No surprises, no overspray.',
      note: 'Day-by-day timeline reel narrated by your VP of Residential.',
    },
  },
  {
    id: 'college-pro-ugc',
    peer: 'College Pro Painters',
    metric: '5.6% CTR',
    format: 'UGC',
    observedImage:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    hook: 'UGC compilation stitching five short customer clips under one caption.',
    whyItWorks: [
      'Highest CTR format in the set — social proof at volume',
      'Burnt-in captions hold view time with sound off',
      'Real customers outperform staged talent on trust metrics',
    ],
    adapted: {
      image:
        'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80',
      headline: 'What 5 Austin homeowners said after',
      primaryText:
        'A 20-second stitch of your five highest-rated Google reviews, captioned and set to brand-safe music. Real Cedar Park and Westlake jobs.',
      note: 'UGC-style compilation built from your top Google reviews.',
    },
  },
  {
    id: 'austin-custom-consult',
    peer: 'Austin Custom Painting',
    metric: '3.1x ROAS',
    format: 'Reel',
    observedImage:
      'https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=600&q=80',
    hook: 'Color-consultant walkthrough with a handwritten "free with estimate" overlay.',
    whyItWorks: [
      'Free-consult hook lowers the barrier to the first conversion',
      'Single-take, soft-light style feels like advice, not a sell',
      'Handwritten overlay lifts saves and shares',
    ],
    adapted: {
      image:
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
      headline: 'Free color consult with every estimate',
      primaryText:
        'Not sure on color? A CertaPro consultant walks your space and helps you choose — free with any Austin estimate. Book a 15-minute visit.',
      note: 'In-home color-consult reel with your free-with-estimate offer.',
    },
  },
  {
    id: 'sw-pro-static',
    peer: 'Sherwin-Williams Pro Painters',
    metric: '4.1% CTR',
    format: 'Static',
    observedImage:
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80',
    hook: 'Single static paint-chip diagram with hand-drawn arrows and a strong CTA.',
    whyItWorks: [
      'Educational static is cheap to produce and refresh',
      'Diagram framing earns saves as a reference',
      'Strong single CTA keeps the click intent clear',
    ],
    adapted: {
      image:
        'https://images.unsplash.com/photo-1574359411659-15573a27fd0c?w=600&q=80',
      headline: 'Best exterior paints for Texas heat',
      primaryText:
        'A quick CertaPro Austin guide to the finishes that survive 100° summers — with the one we recommend most. Tap for a free estimate.',
      note: 'Educational paint-chip static in your editorial style.',
    },
  },
];
