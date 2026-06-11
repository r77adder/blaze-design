// Blaze AI-generated ad concepts — fully synthesized from the campaign topic
// and brand kit, with no organic post or competitor as the seed. Each card
// represents one creative angle Blaze produced; selecting it ships an ad
// using the adapted assets.
import type { CreativeFormat } from './competitor-creative';

export interface AiCreative {
  id: string;
  /** Short title for the creative angle Blaze is proposing. */
  concept: string;
  format: CreativeFormat;
  /** Preview image for the concept card. */
  image: string;
  /** One-line description of the creative angle. */
  hook: string;
  /** Why Blaze proposed this angle — short signal bullets. */
  whyItWorks: string[];
  /** The full generated ad. */
  adapted: {
    image: string;
    headline: string;
    primaryText: string;
    note: string;
  };
}

export const AI_CREATIVE: AiCreative[] = [
  {
    id: 'ai-warranty-lead',
    concept: 'Warranty as the lead',
    format: 'Static',
    image:
      'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=600&q=80',
    hook: 'A clean static that opens with the 2-year warranty and a single estimate CTA.',
    whyItWorks: [
      'Warranty answers the #1 trust objection in home services',
      'Static creative is cheapest to refresh — easy A/B follow-ups',
      'Single CTA structure tests best in your Austin set',
    ],
    adapted: {
      image:
        'https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=600&q=80',
      headline: 'Painted right — guaranteed for 2 years',
      primaryText:
        'Every CertaPro Austin job is backed by a 2-year warranty. Free in-home estimate, fixed-price quote, no upsell.',
      note: 'Static lead-with-warranty in your brand palette and editorial type.',
    },
  },
  {
    id: 'ai-spring-urgency',
    concept: 'Spring booking urgency',
    format: 'Reel',
    image:
      'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&q=80',
    hook: 'A 15-second reel about the closing spring window and the crew’s remaining slots.',
    whyItWorks: [
      'Urgency lifts CTR ~22% in Austin home-services this season',
      'Calendar visual gives concrete proof, not just a claim',
      'Pairs well with lead-form objective for fast capture',
    ],
    adapted: {
      image:
        'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=600&q=80',
      headline: 'Spring exterior slots close in 9 days',
      primaryText:
        'The CertaPro Austin spring schedule is filling fast. Book your free estimate this week and we’ll hold a crew for May.',
      note: 'Calendar-overlay reel with the spring window count-down.',
    },
  },
  {
    id: 'ai-owner-story',
    concept: 'Owner-led origin story',
    format: 'Reel',
    image:
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80',
    hook: 'John Bunnell, on camera, telling the founding-story angle in 25 seconds.',
    whyItWorks: [
      'Owner-on-camera lifts trust scores 2.3x over voiceover',
      'Origin-story format earns the highest save rate in your set',
      'Reuses existing brand voice — no new shoot needed',
    ],
    adapted: {
      image:
        'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80',
      headline: 'Why I started CertaPro Austin',
      primaryText:
        'John Bunnell on the 2008 decision to bring CertaPro to Austin, the 1,200 homes since, and the warranty he still backs personally.',
      note: 'Owner-led reel with archival photos and the warranty close.',
    },
  },
  {
    id: 'ai-neighbor-proof',
    concept: 'Neighborhood proof + map',
    format: 'Carousel',
    image:
      'https://images.unsplash.com/photo-1574359411659-15573a27fd0c?w=600&q=80',
    hook: 'A 4-frame carousel showing homes CertaPro has repainted near the viewer.',
    whyItWorks: [
      'Hyperlocal social proof is the single best CTR lever in your category',
      'Map-as-frame-1 stops the scroll above brand awareness',
      'Carousel earns swipe depth, which Meta then optimizes against',
    ],
    adapted: {
      image:
        'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=600&q=80',
      headline: 'We just painted 4 homes in your neighborhood',
      primaryText:
        'Cedar Park, Westlake, Tarrytown — see the latest CertaPro Austin exteriors near you. Tap to book a free estimate.',
      note: 'Map + before/after carousel keyed to the viewer’s ZIP.',
    },
  },
  {
    id: 'ai-color-anxiety',
    concept: 'Color-choice anxiety relief',
    format: 'Reel',
    image:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    hook: 'A 20-second reel showing the free color-consult flow with a 3D mockup reveal.',
    whyItWorks: [
      '“Stuck on color” is the #1 reason homeowners delay an estimate',
      '3D mockup reveal earns the highest watch-through in your set',
      'Pairs free-consult hook with low-commitment CTA',
    ],
    adapted: {
      image:
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
      headline: 'See your house in any color, free',
      primaryText:
        'Not sure on color? Our consultant brings a 3D mockup of your house in your top picks — free with any CertaPro Austin estimate.',
      note: '3D mockup reveal reel with the free-consult CTA.',
    },
  },
  {
    id: 'ai-pricing-transparency',
    concept: 'Transparent pricing tier',
    format: 'Static',
    image:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80',
    hook: 'A clean educational static showing the three common Austin exterior price tiers.',
    whyItWorks: [
      'Pricing transparency is the highest save-rate format Blaze sees',
      'Static is cheap to re-render per ZIP / square footage',
      'Earns trust before the estimate, raising show-rate on bookings',
    ],
    adapted: {
      image:
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80',
      headline: 'What an Austin exterior actually costs',
      primaryText:
        'Three honest price ranges for an Austin exterior repaint — from a small bungalow to a full Westlake build. No surprises at the estimate.',
      note: 'Educational static with the three Austin price tiers.',
    },
  },
];
