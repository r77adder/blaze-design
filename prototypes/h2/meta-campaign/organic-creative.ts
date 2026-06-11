// The business's own top-performing organic social posts. In the campaign flow
// these sit alongside competitor creative as a second source — users can boost
// a post that already works for them rather than only copying competitors.

import type { CreativeFormat } from './competitor-creative';

export type OrganicPlatform = 'Instagram' | 'Facebook';

export interface OrganicCreative {
  id: string;
  platform: OrganicPlatform;
  format: CreativeFormat;
  /** The post's own image — promoted as-is into the ad. */
  image: string;
  /** Caption / one-line description of the post. */
  hook: string;
  /** Headline organic performance metric, e.g. "9.2% engagement · 18k views". */
  metric: string;
  postedAgo: string;
  /** Why Blaze flagged this post as worth putting spend behind. */
  whyBoost: string[];
  /** Ad copy Blaze generates around the existing post. */
  adapted: {
    headline: string;
    primaryText: string;
  };
}

export const ORGANIC_CREATIVE: OrganicCreative[] = [
  {
    id: 'organic-cabinet-timelapse',
    platform: 'Instagram',
    format: 'Reel',
    image:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    hook: 'Time-lapse of a full kitchen cabinet refinish, dull oak to matte white.',
    metric: '9.2% engagement',
    postedAgo: 'Posted 3 weeks ago',
    whyBoost: [
      'Your highest-saved Reel in the last 90 days',
      'Already proven with your audience — no guesswork',
      'Refinish keyword matches high-intent local search',
    ],
    adapted: {
      headline: 'Cabinets refinished in 3 days',
      primaryText:
        'The Reel Austin saved 400+ times — now it can find you customers. Free cabinet refinishing estimate this week.',
    },
  },
  {
    id: 'organic-tarrytown-beforeafter',
    platform: 'Instagram',
    format: 'Carousel',
    image:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80',
    hook: 'Before/after carousel of a Tarrytown exterior repaint in warm white.',
    metric: '240 saves',
    postedAgo: 'Posted 5 weeks ago',
    whyBoost: [
      'Before/after is your top-converting organic format',
      'Local Tarrytown reference builds neighborhood trust',
      'Strong saves signal high purchase intent',
    ],
    adapted: {
      headline: 'A Tarrytown exterior, transformed',
      primaryText:
        'Swipe through a real West Austin repaint your neighbors already loved. Book a free exterior estimate.',
    },
  },
  {
    id: 'organic-team-anniversary',
    platform: 'Facebook',
    format: 'Static',
    image:
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80',
    hook: 'Team photo celebrating 10 years painting in Austin.',
    metric: '1.2k reactions',
    postedAgo: 'Posted 2 months ago',
    whyBoost: [
      'Your most-shared post ever — built-in social proof',
      'Founder-and-crew framing drives trust for first-time buyers',
      'Anniversary angle pairs well with a limited offer',
    ],
    adapted: {
      headline: '10 years painting Austin homes',
      primaryText:
        'The same local crew your neighbors trust — now booking spring projects. Get a free estimate from CertaPro Austin.',
    },
  },
  {
    id: 'organic-fence-reveal',
    platform: 'Instagram',
    format: 'Reel',
    image:
      'https://images.unsplash.com/photo-1574359411659-15573a27fd0c?w=600&q=80',
    hook: 'Satisfying spray-paint reveal of a weathered backyard fence.',
    metric: '24k views',
    postedAgo: 'Posted 6 weeks ago',
    whyBoost: [
      'Your widest-reaching Reel — strong scroll-stop',
      'Satisfying-reveal format travels well in paid',
      'Opens a service line you under-advertise',
    ],
    adapted: {
      headline: 'Bring a tired fence back to life',
      primaryText:
        'The reveal 24k people watched — now working for you. Free fence and exterior estimate across Austin.',
    },
  },
  {
    id: 'organic-review-graphic',
    platform: 'Instagram',
    format: 'Static',
    image:
      'https://images.unsplash.com/photo-1542435503-956c469947f6?w=600&q=80',
    hook: 'Quote graphic of a five-star Cedar Park customer review.',
    metric: '410 saves',
    postedAgo: 'Posted 4 weeks ago',
    whyBoost: [
      'Pure social proof — converts cold audiences',
      'Cheap to refresh with new reviews on a schedule',
      'Cedar Park mention sharpens local targeting',
    ],
    adapted: {
      headline: 'What Cedar Park says about us',
      primaryText:
        'A real five-star review from a recent Austin job. See why homeowners pick CertaPro — free estimate.',
    },
  },
  {
    id: 'organic-color-picks',
    platform: 'Facebook',
    format: 'Carousel',
    image:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    hook: 'Carousel of this season’s most-requested exterior color palettes.',
    metric: '5.4% engagement',
    postedAgo: 'Posted 3 weeks ago',
    whyBoost: [
      'Educational carousel earns saves as a reference',
      'Color indecision is a top reason homeowners stall',
      'Natural lead-in to a free color consultation',
    ],
    adapted: {
      headline: 'This season’s top Austin exterior colors',
      primaryText:
        'The palettes Austin homeowners are asking for — plus a free color consult with every estimate.',
    },
  },
];
