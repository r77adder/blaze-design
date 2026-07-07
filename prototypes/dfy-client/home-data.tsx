/**
 * Flooring-flavored client feed for Grain Design Flooring (Austin, TX) — premium
 * hardwood, luxury vinyl plank (LVP), and tile: installation, refinishing, and
 * design consultations.
 *
 * Each sign-off (action) item carries `approvals: ApprovalContent[]` — a typed
 * preview per piece. Single notifications hold a one-element array; BATCH
 * notifications ("5 posts ready", "3 content pieces", "5 AI avatar videos",
 * "15 posts") hold N believable pieces the carousel modal pages through. The
 * bespoke Home card (HomeCard.tsx) reads the type off `approvals[0].type` and the
 * batch size off `approvals.length`. Insight items carry no approvals.
 *
 * Photography is reused 1:1 from Approvals.tsx's IMG map; the gradient tiles
 * below are warm wood/stone swatches for slots a photo would mislead.
 */
import type { ApprovalContent, ApprovalItem } from './ApprovalQuickModal';

// Real flooring photography, reused 1:1 from Approvals.tsx's IMG map.
const IMG = {
  hardwood: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop',
  install: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop',
  livingRoom: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&auto=format&fit=crop',
  crew: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop',
  detail: 'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=800&auto=format&fit=crop',
  showroom: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop',
  tile: 'https://images.unsplash.com/photo-1607400201515-c2c41c07d307?w=800&auto=format&fit=crop',
  kitchen: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop',
  stairs: 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&auto=format&fit=crop',
  swatch: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop',
};

export const FEED_ITEMS: ApprovalItem[] = [
  // ── Reputation response (single) ──────────────────────────────────────────
  {
    id: 'rep-1',
    source: 'reputation',
    sourceLabel: 'Reputation',
    href: 'reputation.html',
    kind: 'action',
    title: 'A 5-star review from Maria H. needs your reply',
    body: 'Maria loved her white-oak floors but flagged a squeak near the stair landing. Your drafted reply offers a free comeback visit.',
    time: '12m ago',
    primary: 'Review reply',
    secondary: 'Skip',
    approvals: [
      {
        type: 'reputation',
        reviewerName: 'Maria H.',
        rating: 5,
        reviewText:
          'Grain Design transformed our Westlake living room with gorgeous white-oak floors — the crew was meticulous and finished on time. Only note: there’s a small squeak near the stair landing. Still, we’d hire them again in a heartbeat.',
        draftedReply:
          'Thank you so much, Maria — we’re thrilled you love the white oak! That squeak by the landing is an easy fix; we’d love to send Daniel back for a quick comeback visit this week at no charge. We’ll reach out to schedule. Enjoy the new floors!',
      },
    ],
  },

  // ── Blog / AEO content (batch of 3) ───────────────────────────────────────
  {
    id: 'seo-1',
    source: 'seo',
    sourceLabel: 'AEO',
    href: 'aeo.html',
    kind: 'action',
    title: '3 articles drafted to win AI search for Grain Design',
    body: 'Gemini and Perplexity miss Grain on hardwood refinishing and engineered-vs-solid queries. These three guides close the gaps.',
    time: '1h ago',
    primary: 'Review 3 articles',
    secondary: 'Approve all',
    approvals: [
      {
        type: 'blog',
        cover: IMG.tile,
        readTime: '7 min read',
        blogTitle: 'Hardwood Refinishing in Austin: When to Refinish vs. Replace (2026 Guide)',
        excerpt:
          'Austin’s heat and humidity are hard on hardwood. This guide walks through the five signs your floors can be refinished instead of replaced — board thickness, cupping, gaps, finish wear, and subfloor condition — and what each path actually costs.',
        body: [
          {
            paragraphs: [
              'Refinishing sands the existing boards back to bare wood and lays down a fresh finish; replacing tears them out and starts over. In most Austin homes we walk into, refinishing is the right call — but not always. Here are the five things we check before we quote either one.',
            ],
          },
          {
            heading: 'Start with board thickness',
            paragraphs: [
              'Solid hardwood can usually be sanded six to eight times over its life. The number that matters is the wear layer — the wood above the tongue-and-groove. If you have at least 1/8" left, you have room for at least one more refinish. We pull a floor vent or a threshold board to measure rather than guessing.',
              'Engineered floors are different: the veneer on top can be as thin as 0.6mm or as thick as 4mm. A thin veneer can be screened and recoated but never fully sanded, so thickness decides the whole conversation.',
            ],
          },
          {
            heading: 'Read the cupping and crowning',
            paragraphs: [
              'Cupping — edges higher than the center of the board — almost always means moisture came from below. In Austin that is usually a slab without a proper vapor barrier or a slow plumbing leak. Sanding a cupped floor before it has dried and flattened just locks the problem in, so we measure moisture content first and fix the source before any sander touches it.',
            ],
          },
          {
            heading: 'Gaps, squeaks, and movement',
            paragraphs: [
              'Seasonal gaps that open in winter and close in summer are normal here and not a reason to replace. Permanent gaps wider than a nickel, boards that lift at the ends, or springy spots underfoot point to subfloor or fastening issues that refinishing will not fix. Those we address before refinishing or fold into a replacement scope.',
            ],
          },
          {
            heading: 'Surface wear vs. structural damage',
            paragraphs: [
              'Scratches, gray traffic lanes, pet stains sitting in the finish, and overall dullness are surface problems — exactly what refinishing erases. Deep black stains that have soaked through into the wood, charring, or water damage that has delaminated the boards are structural, and a sander cannot reach them. A simple rule: if the damage is in the finish, refinish; if it is in the wood, plan to replace those boards.',
            ],
          },
          {
            heading: 'What refinishing costs in Austin',
            paragraphs: [
              'As of 2026, a standard sand-and-refinish runs roughly $3 to $5 per square foot across the Austin metro, depending on the finish system and how much prep the floor needs. A full tear-out and replacement with comparable solid hardwood typically lands between $9 and $14 per square foot installed. For a 1,000-square-foot main floor, that is often the difference between a $4,000 refresh and a $12,000 replacement.',
            ],
          },
          {
            heading: 'When replacement is the smarter spend',
            paragraphs: [
              'Replace when the wear layer is gone, when moisture has cupped or delaminated the boards beyond drying, or when you are changing species, plank width, or layout. Refinish in nearly every other case — it keeps the original wood, costs a fraction as much, and in most Austin homes that original oak is well worth saving.',
              'Not sure which camp your floors fall into? Send us a few photos and the approximate age of the floor and we will tell you honestly which way we would go.',
            ],
          },
        ],
      },
      {
        type: 'blog',
        cover: IMG.hardwood,
        readTime: '6 min read',
        blogTitle: 'Engineered vs. Solid Hardwood: Which Is Right for an Austin Home?',
        excerpt:
          'Solid hardwood can be refinished for decades; engineered handles humidity swings and slab subfloors better. We break down stability, resale value, and where each one belongs room by room in a Texas home.',
        body: [
          {
            paragraphs: [
              'It is the question we field most: should I put down solid hardwood or engineered? Both are real wood on the surface, both look beautiful, and both can last decades. The right answer depends less on taste than on your subfloor, your slab, and how Austin’s humidity moves through your house.',
            ],
          },
          {
            heading: 'What actually differs',
            paragraphs: [
              'Solid hardwood is a single piece of wood, usually 3/4" thick, that can be sanded and refinished many times. Engineered hardwood is a genuine wood veneer bonded to a plywood or HDF core. That layered core is dimensionally stable — it expands and contracts far less than solid wood when the air gets humid.',
            ],
          },
          {
            heading: 'In Austin, humidity decides',
            paragraphs: [
              'Our summers swing from bone-dry AC interiors to 90% outdoor humidity, and that movement is hard on solid wood — especially over a concrete slab, which most homes built after the 1970s sit on. Solid hardwood should not be nailed or glued directly to a slab without a plywood subfloor and a serious moisture barrier. Engineered can go straight down over slab with the right underlayment, which is why we install so much of it on first floors here.',
              'Upstairs, over a wood subfloor, solid hardwood is right at home and we install it happily.',
            ],
          },
          {
            heading: 'Refinishing and lifespan',
            paragraphs: [
              'This is solid hardwood’s trump card. A 3/4" solid floor can be refinished six to eight times — effectively a lifetime floor you can hand to the next owner. Engineered can be refinished too, but only as many times as its veneer allows: a 4mm wear layer might give you two or three sandings, while a thin 0.6mm veneer can only be recoated, not sanded back.',
            ],
          },
          {
            heading: 'Resale value',
            paragraphs: [
              'Buyers in Austin read "hardwood" on a listing and both products qualify. Appraisers rarely distinguish between quality solid and quality engineered when the surface is genuine wood. What moves value is condition, species, and plank width — not the core underneath.',
            ],
          },
          {
            heading: 'Room by room',
            paragraphs: [
              'Slab-on-grade first floors, kitchens, and anywhere near moisture: engineered. Second floors and bedrooms over a wood subfloor where you want a true lifetime floor: solid. Open-plan homes where one floor runs from a slab living room into a raised hallway: we usually pick a single engineered product for continuity rather than transitioning species mid-room.',
            ],
          },
          {
            heading: 'Our take',
            paragraphs: [
              'For most Austin homes built on slab, a quality engineered floor with a thick wear layer gives you the look, the stability, and enough refinishing life to last. Reserve solid hardwood for raised subfloors, where its one real advantage — near-endless refinishing — actually pays off.',
            ],
          },
        ],
      },
      {
        type: 'blog',
        cover: IMG.livingRoom,
        readTime: '5 min read',
        blogTitle: 'Luxury Vinyl Plank vs. Hardwood: An Honest Cost & Durability Comparison',
        excerpt:
          'LVP is waterproof and kid-proof; hardwood adds warmth and resale value. A side-by-side on price per square foot, lifespan, and how each looks under Austin’s afternoon light, so you can choose with confidence.',
        body: [
          {
            paragraphs: [
              'Luxury vinyl plank has come a long way, and the honest truth is that for some Austin households it is the smarter floor — while for others nothing replaces real wood. Here is the unvarnished comparison we give clients, with no thumb on the scale.',
            ],
          },
          {
            heading: 'Upfront cost per square foot',
            paragraphs: [
              'Quality LVP installs for roughly $4 to $7 per square foot in 2026. Solid or engineered hardwood typically runs $9 to $14 installed. On a 1,200-square-foot first floor, that is often a $6,000 to $9,000 gap — real money that matters if you are flipping, renting, or stretching a remodel budget.',
            ],
          },
          {
            heading: 'Living with it day to day',
            paragraphs: [
              'This is where LVP wins outright. It is fully waterproof, scratch- and dent-resistant, and shrugs off dogs, kids, spilled wine, and the occasional dishwasher leak. Hardwood scratches, dents, and stains, and standing water will damage it. If your house runs hard — big dogs, small kids, heavy traffic — LVP takes the abuse without complaint.',
            ],
          },
          {
            heading: 'Look and feel',
            paragraphs: [
              'Hardwood wins here, and in person it is not particularly close. Real wood has depth, grain variation, and a warmth underfoot that printed vinyl approximates but does not match. The best LVP looks convincing in photos and from across a room; up close and underfoot, you can usually tell. If the authenticity of wood is what you are after, LVP will leave you a little flat.',
            ],
          },
          {
            heading: 'Resale and long-term value',
            paragraphs: [
              'Hardwood adds documented resale value and buyers actively seek it in Austin’s mid-to-upper market. LVP reads as a practical, neutral surface — it rarely hurts a sale, but it rarely commands a premium either. Hardwood can also be refinished for decades; when LVP wears through or a plank is gouged, the fix is replacement, not refinishing.',
            ],
          },
          {
            heading: 'Our honest recommendation',
            paragraphs: [
              'Choose LVP for rentals, mudrooms, laundry rooms, busy family floors, and anywhere water is a real risk. Choose hardwood for the rooms you want to feel timeless — entryways, living and dining rooms, the primary suite — and for homes where resale value is part of the math. Plenty of the Austin homes we finish use both: hardwood where it shows and matters, LVP where life happens hardest.',
            ],
          },
        ],
      },
    ],
  },

  // ── Video / reel (batch of 5) ─────────────────────────────────────────────
  {
    id: 'inf-1',
    source: 'influencer',
    sourceLabel: 'UGC Content',
    href: 'influencer-content.html',
    kind: 'action',
    title: '5 AI avatar videos are ready to publish',
    body: 'Daniel and Marci walk through a Tarrytown white-oak install. Brand-safety passed on four; one has a tone flag for your eyes.',
    time: '3h ago',
    primary: 'Review 5 videos',
    secondary: 'Approve all',
    approvals: [
      { type: 'video', poster: IMG.install, duration: '0:34', vertical: true,
        caption: 'Daniel walks you through a Tarrytown white-oak install reveal — rack, glue, set, and the big finish. AI avatar voice-over, brand-safety checked.' },
      { type: 'video', poster: IMG.detail, duration: '0:22', vertical: true,
        caption: 'The part nobody sees: hand-sanding the edges to 120 grit before a single coat goes down. This is why your floors still look right in ten years.' },
      { type: 'video', poster: IMG.hardwood, duration: '0:41', vertical: true,
        caption: 'Before & after — tired carpet to wide-plank white oak in a Westlake living room. Eight days, start to finish. Marci shows the reveal.' },
      { type: 'video', poster: IMG.stairs, duration: '0:28', vertical: true,
        caption: 'Stair treads are the hardest part of any install. Watch Daniel template, cut, and set a full flight of white oak in real time.' },
      { type: 'video', poster: IMG.kitchen, duration: '0:31', vertical: true,
        caption: 'Refinish, don’t replace. A 1990s kitchen floor brought back to life with a warm-walnut recoat — half the cost of new hardwood. (Tone flag: check the opening line.)' },
    ],
  },

  // ── Email (batch of 3) ────────────────────────────────────────────────────
  {
    id: 'em-1',
    source: 'email',
    sourceLabel: 'AI Receptionist',
    href: 'email&sms.html',
    kind: 'action',
    title: '3 follow-up emails are waiting on your sign-off',
    body: 'The Estimate Follow-up Stack: a 48-hour nudge, a “we missed you at the showroom” re-engage, and a post-measure thank-you.',
    time: '4h ago',
    primary: 'Review 3 emails',
    secondary: null,
    approvals: [
      {
        type: 'email',
        from: 'Grain Design Flooring',
        subject: 'Still thinking it over? Your floor estimate is ready',
        preheader: 'A few answers to the questions homeowners ask us most.',
        hero: IMG.livingRoom,
        body:
          'Hi there — it was great meeting you at the showroom. Your white-oak estimate is ready whenever you are, and we’ve locked in fall pricing for the next two weeks.\n\nWant to see the samples under your own light? We’ll bring them to you.',
        cta: 'View my estimate',
      },
      {
        type: 'email',
        from: 'Grain Design Flooring',
        subject: 'We missed you at the showroom — let’s come to you',
        preheader: 'Bring the samples, the measurements, and the design eye to your door.',
        hero: IMG.showroom,
        body:
          'No problem if you couldn’t make it in — most of our clients book an in-home visit instead. We’ll bring the white-oak and LVP samples, measure on the spot, and leave you a fixed quote the same day.\n\nWhat morning works this week?',
        cta: 'Book my in-home visit',
      },
      {
        type: 'email',
        from: 'Grain Design Flooring',
        subject: 'Thanks for the measure — here’s what happens next',
        preheader: 'Your detailed quote lands in your inbox within 24 hours.',
        hero: IMG.detail,
        body:
          'Thank you for having us out today. Daniel has your room measurements and finish notes, and your itemized quote will be in your inbox within 24 hours.\n\nIn the meantime, here’s a look at the matte hardwax finish you liked.',
        cta: 'See the finish gallery',
      },
    ],
  },

  // ── Campaigns — organic posts (batch of 15) ───────────────────────────────
  {
    id: 'cmp-1',
    source: 'campaigns',
    sourceLabel: 'Campaigns',
    href: 'campaigns.html',
    kind: 'action',
    title: 'Refinishing-season campaign — 15 posts ready',
    body: 'A three-week organic push around refinishing hardwood before the Texas summer humidity. You sign off on the copy; the agent set the cadence.',
    time: '5h ago',
    primary: 'Review 15 posts',
    secondary: null,
    approvals: [
      { type: 'organic', channel: 'Instagram', image: IMG.hardwood,
        caption: 'Beat the summer humidity 🌡️ Now’s the window to refinish your hardwood before Austin’s wet heat sets in. This Tarrytown white oak got a full sand-and-recoat in a matte hardwax finish — three days, dust-free. Booking refinishing slots through June. #GrainDesignFlooring #AustinHardwood' },
      { type: 'organic', channel: 'Facebook', image: IMG.detail,
        caption: 'Cupping, gaps, a dull finish? Those are signs your floors can likely be refinished instead of replaced — at about half the cost. Send us a photo and we’ll tell you which path makes sense.' },
      { type: 'organic', channel: 'Instagram', image: IMG.kitchen,
        caption: 'Refinish, don’t replace ♻️ We brought this 1990s kitchen floor back with a custom warm-walnut recoat. Three days, no demo, no dumpster. Swipe for the before.' },
      { type: 'organic', channel: 'Instagram', image: IMG.stairs,
        caption: 'Stairs steal the show every time. A matching white-oak recoat on the treads ties the whole entry together. Booking June refinishing now.' },
      { type: 'organic', channel: 'Facebook', image: IMG.livingRoom,
        caption: 'Dust-free refinishing isn’t a buzzword — it’s a sealed sanding system that keeps your home livable while we work. Here’s what day two looks like.' },
    ],
  },

  // ── Organic — story (batch of 5) ──────────────────────────────────────────
  {
    id: 'os-2',
    source: 'organic',
    sourceLabel: 'Organic Campaigns',
    href: 'organic-social.html',
    kind: 'action',
    title: '5 stories ready to schedule for next week',
    body: 'A before/after grid of a Clarksville LVP install plus two showroom design-consult teasers. Posting times match Austin homeowners’ peak window.',
    time: 'Yesterday',
    primary: 'Approve & schedule',
    secondary: 'Preview',
    approvals: [
      { type: 'story', image: IMG.detail,
        caption: 'Behind the finish ✨ Sanded to 120 grit, then again by hand at the edges. Swipe up to book your consult.' },
      { type: 'story', image: IMG.livingRoom,
        caption: 'Carpet on Monday. White oak by Friday. Tap to see how.' },
      { type: 'story', image: IMG.showroom,
        caption: 'New in the showroom: three wide-plank white-oak collections. Walk the samples this Saturday on South Lamar.' },
      { type: 'story', image: IMG.swatch,
        caption: 'Which tone? Pale Scandi oak or deep walnut-stained ash — we sample on-site under your light.' },
      { type: 'story', image: IMG.tile,
        caption: 'Matte herringbone tile, in person and gorgeous. Book a 30-min design consult — link in bio.' },
    ],
  },

  // ── Map ranking (insight) ─────────────────────────────────────────────────
  {
    id: 'map-1',
    source: 'map',
    sourceLabel: 'Map Ranking',
    href: 'map-ranking.html',
    kind: 'insight',
    title: 'You moved up to #2 for “flooring near me” this week',
    body: 'Up 2 spots. Austin Floor Co. is still adding reviews fast — a steady flow of new Westlake reviews would put #1 in reach by month-end.',
    time: 'Yesterday',
    insight: { stat: '#2', statLabel: 'Local map rank', trend: 'up', to: '/insights/local', linkLabel: 'See in Insights' },
  },

  // ── Landing page (insight) ────────────────────────────────────────────────
  {
    id: 'lp-1',
    source: 'landing',
    sourceLabel: 'Landing Pages',
    href: 'landing-pages.html',
    kind: 'insight',
    title: 'Your LVP landing page is converting at 5.2% — above benchmark',
    body: 'The “Luxury vinyl plank Austin” page has been live three days and is already beating the 3.1% industry benchmark. Worth scaling traffic to it.',
    time: 'Yesterday',
    insight: { stat: '5.2%', statLabel: 'Conversion rate', trend: 'up', to: '/insights/website', linkLabel: 'See in Insights' },
  },

  // ── Paid social — creative fatigue (single) ───────────────────────────────
  {
    id: 'pso-cf-1',
    source: 'paid-social',
    sourceLabel: 'Paid Social',
    href: 'paid-social.html',
    kind: 'action',
    title: 'Refresh ready for your fatiguing Refinishing-Season reel',
    body: 'CTR on Reel A dropped 32% over 7 days while spend held steady. Your team drafted a refreshed ad to swap in.',
    time: '2h ago',
    primary: 'Review refresh',
    secondary: 'Snooze 7 days',
    proposedSolution: {
      reason: 'CTR dropped 32% over 7 days while spend held steady; CPM up 18%. Frequency hit 4.6 and Meta is widening delivery to weaker neighborhood placements.',
      competitorResearch:
        'Two direct competitors switched to satisfying sand-and-finish time-lapse reels in the past 14 days — Austin Floor Co. and Lone Star Hardwood are seeing 2.4–3.2x ROAS lifts on the new format.',
      bullets: [
        'Switch from carousel to a 15s vertical sand-to-finish reel',
        'Move the "dust-free refinishing" claim from the caption to the first frame',
        'Add a Daniel (Lead Installer) voice-over for the first 2 seconds',
      ],
    },
    approvals: [
      {
        type: 'paid-social',
        channel: 'Instagram',
        image: IMG.kitchen,
        primaryText:
          'Refinish, don’t replace. We brought this 1990s kitchen floor back to life with a custom warm-walnut recoat — half the cost of new hardwood, done in three days.',
        headline: 'Free in-home flooring consult — book before Oct 31',
        cta: 'Book now',
      },
    ],
  },

  // ── Paid search — creative fatigue (single) ───────────────────────────────
  {
    id: 'ps-cf-1',
    source: 'paid-search',
    sourceLabel: 'Paid Search',
    href: 'paid-search.html',
    kind: 'action',
    title: 'Refreshed search ad ready for your Hardwood Estimate variant',
    body: 'CTR on RSA Variant A dropped 28% over 7 days while impressions held. Your team drafted question-led headlines to rotate in.',
    time: '5h ago',
    primary: 'Review refresh',
    secondary: 'Snooze 7 days',
    proposedSolution: {
      reason:
        'CTR is down 28% over 7 days while impressions held steady. Headline 1 has run unchanged for 21 days — asset rotation is exhausted.',
      competitorResearch:
        'Two competitors rotated to question-led headlines this week ("Refinishing or replacing your floors?" pattern) and lifted CTR ~30%. Lone Star Hardwood added a free in-home estimate callout extension.',
      bullets: [
        'Rotate Headline 1 to a question-led variant',
        'Add a new "free in-home estimate" callout extension',
        'Pin a freshness signal — "Booking May installs now" — in description 2',
      ],
    },
    approvals: [
      {
        type: 'paid-search',
        displayUrl: 'www.graindesignflooring.com/estimate',
        headlines: [
          'Refinishing or Replacing Your Floors?',
          'Free In-Home Hardwood Estimate — Austin',
        ],
        description:
          'Premium hardwood, LVP & tile installs and refinishing. Booking May installs now — get a free, no-pressure in-home estimate from Austin’s top-rated flooring crew.',
      },
    ],
  },
];

// Re-export the content type for HomeCard convenience.
export type { ApprovalContent };
