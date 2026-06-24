// Top-performing ads from the business's own past Meta campaigns. These are
// the strongest signal of "what already works for this brand" — reusing them
// in a new campaign drops the cold-start risk vs. a fresh creative.
import type { CreativeFormat } from './competitor-creative';

export interface ProvenAd {
  id: string;
  /** Original ad name inside the past campaign. */
  name: string;
  /** Past campaign the ad ran in. */
  campaignName: string;
  /** When it last ran, in human-friendly form ("3 months ago"). */
  ranAgo: string;
  format: CreativeFormat;
  /** Headline metric — what made it worth reusing. */
  metric: string;
  /** Preview image — same creative the ad served. */
  image: string;
  /** One-line description of the ad's hook. */
  hook: string;
  /** Why Blaze flags this one as worth replaying. */
  whyReuse: string[];
  /** Headline and primary text the ad shipped with. */
  headline: string;
  primaryText: string;
}

export const PROVEN_ADS: ProvenAd[] = [
  {
    id: 'proven-westlake-reel',
    name: 'Westlake Exterior — Reel A',
    campaignName: 'Spring 2024 Exterior Push',
    ranAgo: 'Ran 11 months ago',
    format: 'Reel',
    metric: 'Winner · 4.8% CTR',
    image:
      'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=600&q=80',
    hook: 'A 22-second reel that opened with the homes-painted stat and held 78% completion.',
    whyReuse: [
      'Top scroll-stop rate in any spring set',
      'Already brand-safe — no re-shoot or approval needed',
      'Audience overlap with new campaign is low — fresh impressions',
    ],
    headline: '1,200 Austin homes painted since 2008',
    primaryText:
      'John Bunnell on why CertaPro Austin crews show up on time, every time — and back it with a 2-year warranty. Free in-home estimate this week.',
  },
  {
    id: 'proven-owner-walkthrough',
    name: 'Owner walkthrough — Reel B',
    campaignName: 'Evergreen Trust',
    ranAgo: 'Still active',
    format: 'Reel',
    metric: '5.2% CTR · highest saves',
    image:
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80',
    hook: 'John walks a Westlake site, narrating the prep + warranty in 25 seconds.',
    whyReuse: [
      'Highest save-rate ad in your account, 14 months running',
      'Evergreen voice — fits any spring or fall objective',
      'Proven against cold audiences in 3 zip clusters',
    ],
    headline: 'A walkthrough of your repaint, before you book',
    primaryText:
      'John Bunnell takes you through a CertaPro Austin job from prep to walkthrough. No surprises, no upsell, no overspray.',
  },
  {
    id: 'proven-hoa-static',
    name: 'HOA Repaint — Static',
    campaignName: 'HOA Q3 Push',
    ranAgo: 'Ran 6 months ago',
    format: 'Static',
    metric: 'Winner · 4.1% CTR',
    image:
      'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=600&q=80',
    hook: 'Clean static with the 2-year warranty stamp + a single estimate CTA.',
    whyReuse: [
      'Cheapest CPM in your HOA set last summer',
      'Still beats peers on offer-led testing benchmarks',
      'Drop-in ready — works with any spring objective',
    ],
    headline: 'Painted right — guaranteed for 2 years',
    primaryText:
      'Every CertaPro Austin job is backed by a 2-year warranty. Fixed-price quote, free in-home estimate, no upsell.',
  },
  {
    id: 'proven-cabinet-carousel',
    name: 'Cabinet — Offer Carousel',
    campaignName: 'Q4 2023 Cabinet Refinish',
    ranAgo: 'Ran 14 months ago',
    format: 'Carousel',
    metric: '3.5x ROAS · top swiped',
    image:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    hook: 'Four-frame carousel leading with the $500-off offer and ending on the warranty.',
    whyReuse: [
      'Highest ROAS in your account history',
      'Offer-led framing reactivates well in spring',
      'Carousel swipe depth still beats your reels',
    ],
    headline: 'Save $500 on a full cabinet refinish',
    primaryText:
      'Swipe to see four Austin kitchens, refinished without a teardown. CertaPro Austin holds your $500 off through April.',
  },
  {
    id: 'proven-color-static',
    name: 'Color Consult — Static',
    campaignName: 'Spring 2024 Color',
    ranAgo: 'Ran 9 months ago',
    format: 'Static',
    metric: '4.4% CTR · low CPL',
    image:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    hook: 'A consultant on-site with a paint deck and a handwritten “free with estimate” note.',
    whyReuse: [
      'Pulled the lowest cost-per-lead in your spring-2024 set',
      'Free-consult hook still wins against peer offers',
      'Handwritten overlay earns saves and shares',
    ],
    headline: 'Free color consult with every estimate',
    primaryText:
      'Not sure on color? A CertaPro consultant walks your space and helps you pick — free with any Austin estimate. Book a 15-minute visit.',
  },
  {
    id: 'proven-tarrytown-carousel',
    name: 'Tarrytown Before/After — Carousel',
    campaignName: 'Winter 2023 Exterior',
    ranAgo: 'Ran 18 months ago',
    format: 'Carousel',
    metric: '5.6% CTR · best transformation set',
    image:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80',
    hook: 'Three-frame Tarrytown before-and-after, with the warranty close.',
    whyReuse: [
      'Highest CTR transformation ad in your account',
      'Hyperlocal proof — Tarrytown audiences still respond',
      'Frame-3 close converted well into spring estimates',
    ],
    headline: 'Faded Tarrytown siding to fresh, in one week',
    primaryText:
      'Swipe to see a Tarrytown home go from sun-bleached to brand-new. Same crew, two-year warranty, fixed price.',
  },
];
