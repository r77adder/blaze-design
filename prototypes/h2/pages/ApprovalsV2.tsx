import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { H2Layout } from '../H2Layout';
import { useClientView } from '../client-view-context';
import { Button, Modal, ModalStack, useModals } from '@/components';
import { Toast } from '@/staging';
import { Approvals as ApprovalsIcon, Check2, EyeOpen, Edit3, ArrowLeft, ArrowRight, ArrowCurveLeftDown, XCircleContained, Globe, CalendarEdit, Settings, Star, Calendar1, Marker03, Cursor04, BarChartSquare, MessageChat01 } from '@/icons/20';
import { ChevronDown, ChevronRight } from '@/icons/16';

// ── Image assets (Figma + Unsplash fallbacks) ─────────────────────────────────
const IMG_AVATAR = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&auto=format&fit=crop&crop=faces';
// Unsplash — CertaPro Austin painting imagery
const U1 = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop'; // exterior after
const U2 = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop'; // painter at work
const U3 = 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&auto=format&fit=crop'; // interior living room
const U4 = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop'; // prep / blueprint
const U5 = 'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=600&auto=format&fit=crop'; // modern house
const U6 = 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&auto=format&fit=crop'; // styled interior
const U7 = 'https://images.unsplash.com/photo-1607400201515-c2c41c07d307?w=600&auto=format&fit=crop'; // crew
const U8 = 'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=600&auto=format&fit=crop'; // house exterior

// ── Tokens ────────────────────────────────────────────────────────────────────
const F = "'Sohne', sans-serif";
const dark90  = 'rgba(0,0,0,0.9)';
const dark80  = 'rgba(0,0,0,0.8)';
const dark60  = 'rgba(0,0,0,0.6)';
const dark40  = 'rgba(0,0,0,0.4)';
const dark15  = 'rgba(0,0,0,0.15)';
const dark8   = 'rgba(0,0,0,0.08)';
const dark4   = 'rgba(0,0,0,0.04)';
const dark2   = 'rgba(0,0,0,0.02)';
const green   = '#20a14f';
const green10 = 'rgba(32,161,79,0.1)';
const red     = '#ae2222';
const white   = '#ffffff';

// ── Types ─────────────────────────────────────────────────────────────────────
type Status = 'pending' | 'approved' | 'rejected' | 'declined';
type ContentType = 'still' | 'carousel' | 'story' | 'short' | 'feed-video' | 'email' | 'blog' | 'review' | 'comment' | 'local-seo' | 'paid-search-ad';

interface Post {
  id: number;
  type: ContentType;
  date: string;          // display label
  dateSort: string;      // ISO string for sorting
  caption: string;
  img?: string;
  slides?: number;
  // Paid search ad-specific (optional)
  adCampaignGoal?: string;      // "Driving estimate requests for..."
  adCampaignTarget?: string;    // "Homeowners 35–65, Austin metro"
  adUrl?: string;
  adVariants?: Array<{ label: string; headline: string; description: string }>;
  // Local SEO card-specific (optional)
  localSeoHeadline?: string;
  localSeoSubtitle?: string;
  localSeoGradient?: string;   // CSS gradient string
  // Reputation-specific (optional)
  reputationSource?: 'yelp' | 'reddit' | 'google' | 'instagram';
  reputationHandle?: string;
  reputationRating?: number;   // 1–5 stars; omit for non-review items
  reputationTitle?: string;
  reputationText?: string;
  aiDraft?: string;
  draftTone?: string;
  draftNeedsHumanReview?: boolean;
  confidence?: number;
  timeAgo?: string;
  engagementLabel?: string;
}

interface Campaign {
  id: number;
  name: string;
  dateRange: string;
  badge: string;
  endDate: string; // ISO date string for past/active logic
  posts: Post[];
}

// ── Data ──────────────────────────────────────────────────────────────────────
const CAMPAIGNS: Campaign[] = [
  {
    id: 0,
    name: 'Spring Exterior Refresh',
    dateRange: 'Sept 28 – Oct 18',
    badge: 'Organic Campaigns',
    endDate: '2026-10-18', // future — active
    posts: [
      { id:0, type:'still',      date:'Sep 25  10:00am', dateSort:'2025-09-25T10:00', img:U1, caption:'See the difference a fresh coat makes. This Westlake exterior went from sun-faded to showroom-ready in just four days — warm greige body, crisp white trim, and a bold front door to finish it off. Swipe by and tell us what you think. 🏡 #CertaProAustin' },
      { id:1, type:'story',      date:'Sep 25  10:00am', dateSort:'2025-09-25T10:01', img:U2, caption:'Meet the crew behind the transformation. Our Austin painters prep every surface by hand — scraping, sanding, and caulking — before a single drop of paint goes on. That attention to prep is exactly why the finish lasts season after season. 🎨' },
      { id:2, type:'feed-video', date:'Sep 25  10:00am', dateSort:'2025-09-25T10:02', img:U3, caption:'Watch a tired living room come back to life. Soft sage walls, refreshed trim, and a two-day turnaround with zero mess left behind. Interior season is here — book your free in-home color consult today. 🛋️ #BeforeAndAfter' },
      { id:3, type:'story',      date:'Sep 25  10:00am', dateSort:'2025-09-25T10:03', img:U4, caption:'Not sure where to start? Our free in-home color consultation pairs you with a designer who matches palettes to your light, your finishes, and your street. No pressure, no obligation — just expert eyes on your project. 🎨' },
      { id:4, type:'carousel',   date:'Sep 25  10:00am', dateSort:'2025-09-25T10:04', img:U5, slides:5, caption:'Swipe through our 5 most-requested exterior palettes this season — from classic Hill Country neutrals to bold modern contrasts. Tap each slide to see it on a real Austin home. Which one would you pick for your place? 🏠' },
      { id:5, type:'still',      date:'Sep 26  10:00am', dateSort:'2025-09-26T10:00', img:U6, caption:'A fresh coat does more than look good — it protects your siding and trim through every Texas summer and storm. Premium paint, expert prep, and a 2-year warranty on every project. Your home works hard; the finish should too. ☀️' },
      { id:6, type:'carousel',   date:'Sep 27  11:00am', dateSort:'2025-09-27T11:00', img:U7, slides:4, caption:'Four homes, four neighborhoods, one Austin crew. Swipe to see the exterior repaints we wrapped this month across Cedar Park, Round Rock, Lakeway, and Mueller. Tag a neighbor who\'s overdue for a refresh! 👋' },
      { id:7, type:'email',      date:'Sep 28  8:00am',  dateSort:'2025-09-28T08:00', img:U8, caption:'Book before October 31 and save $200 on any exterior project. Our fall calendar is filling fast — lock in your spot now and get a free color consult included. Reply here or call (512) 323-9502 to get started. 🍂' },
    ],
  },
  {
    id: 1,
    name: 'SEO Relevance Blogs',
    dateRange: 'Sept 28 – Oct 18',
    badge: 'SEO/AEO',
    endDate: '2026-10-18', // future — active
    posts: [
      { id:100, type:'blog', date:'Sep 25  10:00am', dateSort:'2025-09-25T10:00', img:U6, caption:'How to Choose Exterior Paint Colors That Fit Your Austin Neighborhood — a designer-backed guide to palettes that boost curb appeal without clashing with the street.' },
      { id:101, type:'blog', date:'Sep 26  10:00am', dateSort:'2025-09-26T10:00', img:U7, caption:'Interior vs. Exterior Painting: What Austin Homeowners Should Budget in 2026 — a practical breakdown of costs, timelines, and what actually drives the price of a quality repaint.' },
      { id:102, type:'blog', date:'Sep 27  10:00am', dateSort:'2025-09-27T10:00', img:U2, caption:'Why Answer Engine Optimization Is the Future of Local Search — as AI answers replace blue links, here\'s how Austin home-service businesses stay visible to nearby customers.' },
    ],
  },
  {
    id: 5,
    name: 'Needs Attention',
    dateRange: 'Oct 1 – Oct 15',
    badge: 'Reputation',
    endDate: '2026-10-15',
    posts: [
      {
        id: 500, type: 'review', date: 'Yesterday', dateSort: '2026-10-14T08:00',
        caption: 'Quoted price went up after the job started',
        reputationSource: 'yelp',
        reputationHandle: 'Devon R. · Round Rock, TX',
        reputationRating: 2,
        reputationTitle: 'Quoted price went up after the job started',
        reputationText: 'Estimate said $4,200 for the exterior. After two days the lead asked for another $900 for "extra prep." I would have appreciated a heads-up before they started.',
        aiDraft: 'Hi Devon — really sorry about the surprise on the wood rot. You\'re right that we should flag it before the crew starts spraying. John (the owner) is going to call you today to walk through the invoice and make this right. Thanks for letting us know how it landed.',
        draftTone: 'Apologetic',
        draftNeedsHumanReview: true,
        confidence: 71,
        timeAgo: 'Yesterday',
        engagementLabel: '2.4× normal · 24h',
      },
      {
        id: 501, type: 'comment', date: '5h ago', dateSort: '2026-10-15T04:00',
        caption: 'Any honest reviews of CertaPro Austin?',
        reputationSource: 'reddit',
        reputationHandle: 'u/cedar_park_carla',
        reputationTitle: 'Any honest reviews of CertaPro Austin?',
        reputationText: 'Getting bids from a few painters for a 2,400 sq ft exterior repaint. CertaPro came in middle of the pack on price — anyone here used them recently?',
        aiDraft: 'Hey Carla — John here, owner of CertaPro Painters of Austin. Happy to share a few recent Cedar Park references and walk you through how we handle prep + change orders. Drop me an email at john@certapro-austin.com or call (512) 323-9502 and I\'ll set it up.',
        draftTone: 'Helpful, direct',
        confidence: 78,
        timeAgo: '5h ago',
        engagementLabel: '3× normal · 6h',
      },
      {
        id: 502, type: 'review', date: '2h ago', dateSort: '2026-10-15T07:00',
        caption: 'Paint chipping after 6 months, no response',
        reputationSource: 'google',
        reputationHandle: 'Marissa K. · Austin, TX',
        reputationRating: 1,
        reputationTitle: 'Paint chipping after 6 months, no response',
        reputationText: 'Interior was painted in November. Three doorways are chipping already and I\'ve called twice with no callback. Disappointed — the crew itself was great.',
        timeAgo: '2h ago',
      },
      {
        id: 503, type: 'comment', date: '1d ago', dateSort: '2026-10-14T10:00',
        caption: 'Do you use low-VOC paint? Nothing on the site.',
        reputationSource: 'instagram',
        reputationHandle: '@hannahgoesgreen',
        reputationTitle: 'Do you use low-VOC paint? Nothing on the site.',
        reputationText: 'Hi! Trying to figure out if you use low-VOC paint for interior jobs — couldn\'t find anything in the FAQ.',
        aiDraft: 'Hi Hannah! Great question — we use low-VOC and zero-VOC interior paints from Sherwin-Williams and Benjamin Moore on request, at no extra charge. We\'ll mention it on the in-home estimate. Call (512) 323-9502 whenever you\'re ready and we\'ll get you on the calendar before August!',
        draftTone: 'Warm, factual',
        confidence: 94,
        timeAgo: '1d ago',
      },
      {
        id: 504, type: 'review', date: '3d ago', dateSort: '2026-10-12T09:00',
        caption: 'Best painters in Austin — highly recommend',
        reputationSource: 'google',
        reputationHandle: 'Tom B. · Cedar Park, TX',
        reputationRating: 5,
        reputationTitle: 'Best painters in Austin — highly recommend',
        reputationText: 'Crew was on time every single day, cleaned up after themselves, and the color matching was perfect. Already referring friends. John\'s team is the real deal.',
        aiDraft: 'Tom, thank you so much — this made our whole week! Color-matching is something we obsess over so it\'s great to hear it showed. We\'d love to help your friends too; just have them mention your name and we\'ll take great care of them. Thanks again! 🙏',
        draftTone: 'Warm, direct',
        confidence: 96,
        timeAgo: '3d ago',
      },
      {
        id: 505, type: 'comment', date: '4d ago', dateSort: '2026-10-11T14:00',
        caption: 'How long does an exterior job usually take?',
        reputationSource: 'instagram',
        reputationHandle: '@certapro_fan_atx',
        reputationTitle: 'How long does an exterior job usually take?',
        reputationText: 'Thinking about booking for next month. House is about 2,200 sq ft. Roughly how many days should I block off?',
        aiDraft: 'Great question! For a 2,200 sq ft exterior we typically plan 3–5 days depending on prep needs (power washing, caulking, any wood repair). We\'ll give you a firm timeline on the estimate visit. Ready when you are — you can book at certapro-austin.com or call (512) 323-9502!',
        draftTone: 'Helpful, friendly',
        confidence: 91,
        timeAgo: '4d ago',
      },
    ],
  },
  {
    id: 6,
    name: 'Fall Home Services — Meta',
    dateRange: 'Oct 5 – Oct 25',
    badge: 'Paid Social',
    endDate: '2026-10-25',
    posts: [
      { id:600, type:'still', date:'Oct 5  9:00am', dateSort:'2026-10-05T09:00', img:U3, caption:'Limited-time fall painting special — save $200 on any exterior project booked before October 31. Our Austin crews are booking fast. Click to claim your spot and get a free color consult included. 🍂' },
      { id:601, type:'feed-video', date:'Oct 12  10:00am', dateSort:'2026-10-12T10:00', img:U8, caption:'Watch how we transformed this Austin home in just 3 days. Full exterior repaint, trim detail work, and front door accent — the neighbors couldn\'t stop staring. DM us to get started on yours. 🎬 #BeforeAndAfter' },
      { id:602, type:'carousel', date:'Oct 19  11:00am', dateSort:'2026-10-19T11:00', img:U2, slides:4, caption:'Swipe through 4 Austin homes we painted this season. Every project is different — we tailor color palettes to your architecture, neighborhood, and lighting. Tap to see the full transformations and get inspired. 🏠' },
    ],
  },
  {
    id: 7,
    name: 'Exterior Painting — Google Ads',
    dateRange: 'Oct 1 – Oct 31',
    badge: 'Paid Search',
    endDate: '2026-10-31',
    posts: [
      {
        id: 700, type: 'paid-search-ad', date: 'Oct 1  8:00am', dateSort: '2026-10-01T08:00',
        caption: 'Exterior painting · Austin metro · Homeowners 35–65',
        adCampaignGoal: 'Driving estimate requests for',
        adCampaignTarget: 'Homeowners 35–65, Austin metro',
        adUrl: 'certapro.com/austin',
        adVariants: [
          {
            label: 'Variant A',
            headline: 'CertaPro Painters of Austin — Your Local Painters',
            description: 'Interior, exterior, and cabinet painting across Austin metro. Free in-home estimate. 2-year warranty. 187 5-star Google reviews.',
          },
          {
            label: 'Variant B',
            headline: 'Done in 4 Days. Painted to Last. — CertaPro Austin',
            description: 'Locally owned, professionally certified. Serving Austin, Cedar Park, Round Rock, and Lakeway. $0/month financing on projects $2,500+.',
          },
          {
            label: 'Variant C',
            headline: 'Trusted Austin Painters — 187 5-Star Reviews',
            description: 'Residential and commercial painting from the team Austin homeowners trust. Free color consultation with every estimate.',
          },
        ],
      },
      {
        id: 701, type: 'paid-search-ad', date: 'Oct 15  8:00am', dateSort: '2026-10-15T08:00',
        caption: 'Fall special · Save $200 · Interior repaint',
        adCampaignGoal: 'Promoting fall savings offer for',
        adCampaignTarget: 'Homeowners 30–60, Cedar Park & Round Rock',
        adUrl: 'certapro.com/austin/fall-offer',
        adVariants: [
          {
            label: 'Variant A',
            headline: 'Save $200 on Fall Painting — This Month Only',
            description: 'Book before October 31st and save $200 on any interior or exterior project. Free estimate. Same-week availability for most homes.',
          },
          {
            label: 'Variant B',
            headline: 'Fall Interior Painting Special — CertaPro Austin',
            description: 'Refresh your home before the holidays. Local Austin crews, 5-star rated. Use code FALL200 at booking. Limited slots remaining.',
          },
        ],
      },
    ],
  },
  // ── Past campaigns (end date has passed) ──────────────────────────────────
  {
    id: 2,
    name: 'Spring Exterior Kickoff',
    dateRange: 'Mar 15 – Apr 5',
    badge: 'Organic Campaigns',
    endDate: '2025-04-05', // past
    posts: [
      { id:200, type:'still',    date:'Mar 15  10:00am', dateSort:'2025-03-15T10:00', img:U1, caption:'Spring is prime painting season in Austin — book early and beat the summer heat.' },
      { id:201, type:'carousel', date:'Mar 18  9:00am',  dateSort:'2025-03-18T09:00', img:U3, slides:4, caption:'4 reasons to repaint your home\'s exterior this spring.' },
      { id:202, type:'email',    date:'Mar 22  8:00am',  dateSort:'2025-03-22T08:00', img:U8, caption:'Spring booking spots are filling up — reserve yours this week.' },
    ],
  },
  {
    id: 3,
    name: 'Winter Interior Refresh',
    dateRange: 'Feb 1 – Feb 14',
    badge: 'Organic Campaigns',
    endDate: '2025-02-14', // past
    posts: [
      { id:300, type:'still',      date:'Feb 1  10:00am', dateSort:'2025-02-01T10:00', img:U4, caption:'Beat the winter gray — refresh your interior with a warm new palette.' },
      { id:301, type:'story',      date:'Feb 7  9:00am',  dateSort:'2025-02-07T09:00', img:U5, caption:'Cozy season, fresh walls — limited winter interior slots open now.' },
      { id:302, type:'feed-video', date:'Feb 12  2:00pm', dateSort:'2025-02-12T14:00', img:U2, caption:'Behind the scenes of a two-day interior repaint in Cedar Park.' },
      { id:303, type:'email',      date:'Feb 13  8:00am', dateSort:'2025-02-13T08:00', img:U7, caption:'Last call — winter interior pricing ends this week.' },
    ],
  },
];

const TYPE_LABEL: Record<ContentType, string> = {
  still: 'Still Image', carousel: 'Carousel', story: 'Story',
  short: 'Short', 'feed-video': 'Feed Video', email: 'Email', blog: 'Blog',
  review: 'Review', comment: 'Comment', 'local-seo': 'Local SEO', 'paid-search-ad': 'Paid Search Ad',
};

// ── Badge icon helper ─────────────────────────────────────────────────────────
function BadgeIcon({ badge }: { badge: string }) {
  if (badge === 'Organic Campaigns') return <Calendar1 size={12} color={dark60} />;
  if (badge === 'Local SEO') return <Marker03 size={12} color={dark60} />;
  if (badge === 'SEO/AEO') return <Globe size={12} color={dark60} />;
  if (badge === 'Paid Social') return <Cursor04 size={12} color={dark60} />;
  if (badge === 'Paid Search') return <BarChartSquare size={12} color={dark60} />;
  if (badge === 'Reputation') return <Star size={12} color={dark60} />;
  return <Calendar1 size={12} color={dark60} />;
}

// ── Status pill ───────────────────────────────────────────────────────────────
const purple = '#7f24b7';

function StatusPill({ status, dontPostReasons, isPast, resubmitNote, tooltipPlacement = 'above', viewerMode }: { status: Status; dontPostReasons?: string[]; isPast?: boolean; resubmitNote?: string; tooltipPlacement?: 'above' | 'below'; viewerMode?: 'internal' | 'client' }) {
  const isDontPost = status === 'rejected';
  const isDeclined = status === 'declined';
  const isPosted  = isPast && status === 'approved';
  const isFailed  = isPast && status === 'pending';
  const isResubmitted = !isPast && status === 'pending' && resubmitNote !== undefined;
  const cfg =
    isPosted ? {
      bg: white, overlay: 'rgba(127,36,183,0.08)',
      border: 'rgba(127,36,183,0.25)', color: purple, label: 'Posted',
    } :
    isFailed ? {
      bg: white, overlay: dark4,
      border: dark15, color: dark60, label: 'Failed',
    } :
    status === 'approved' ? {
      bg: white, overlay: 'rgba(32,161,79,0.1)',
      border: 'rgba(32,161,79,0.25)', color: green, label: 'Approved',
    } :
    isDeclined ? {
      bg: white, overlay: 'rgba(174,34,34,0.08)',
      border: 'rgba(174,34,34,0.3)', color: '#ae2222', label: 'Declined',
    } :
    isDontPost ? {
      bg: white, overlay: 'rgba(174,34,34,0.08)',
      border: 'rgba(174,34,34,0.3)', color: '#ae2222', label: 'Changes Requested',
    } : isResubmitted ? {
      bg: white, overlay: 'rgba(255,174,0,0.3)',
      border: 'rgba(255,174,0,0.45)', color: '#7a4800', label: 'Review V2',
    } : {
      bg: white, overlay: 'rgba(255,174,0,0.3)',
      border: 'rgba(255,174,0,0.45)', color: '#7a4800', label: 'Review',
    };

  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap: 4,
      padding:'2px 6px', borderRadius:4,
      backgroundColor: cfg.bg,
      backgroundImage: `linear-gradient(${cfg.overlay}, ${cfg.overlay})`,
      border:`1px solid ${cfg.border}`,
      fontSize:11, fontWeight:400, color:cfg.color, fontFamily:F,
      letterSpacing:'0.22px', whiteSpace:'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}

// ── Type icons — exact SVG paths uploaded by designer ────────────────────────
function TypeIcon({ type, size = 14 }: { type: ContentType; size?: number }) {
  switch (type) {
    case 'still': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M4.29654 18.4715C4.10128 18.6667 4.10128 18.9833 4.29654 19.1786C4.49181 19.3738 4.80839 19.3738 5.00365 19.1786L4.6501 18.825L4.29654 18.4715ZM8.8501 14.625L9.20365 14.2715C9.00839 14.0762 8.69181 14.0762 8.49654 14.2715L8.8501 14.625ZM10.9501 16.725L10.5965 17.0786C10.7918 17.2738 11.1084 17.2738 11.3037 17.0786L10.9501 16.725ZM15.6751 12L16.0287 11.6465C15.8334 11.4512 15.5168 11.4512 15.3215 11.6465L15.6751 12ZM19.5215 16.5536C19.7168 16.7488 20.0334 16.7488 20.2287 16.5536C20.4239 16.3583 20.4239 16.0417 20.2287 15.8465L19.8751 16.2L19.5215 16.5536ZM4.6501 18.825L5.00365 19.1786L9.20365 14.9786L8.8501 14.625L8.49654 14.2715L4.29654 18.4715L4.6501 18.825ZM8.8501 14.625L8.49654 14.9786L10.5965 17.0786L10.9501 16.725L11.3037 16.3715L9.20365 14.2715L8.8501 14.625ZM10.9501 16.725L11.3037 17.0786L16.0287 12.3536L15.6751 12L15.3215 11.6465L10.5965 16.3715L10.9501 16.725ZM15.6751 12L15.3215 12.3536L19.5215 16.5536L19.8751 16.2L20.2287 15.8465L16.0287 11.6465L15.6751 12ZM6.7501 3.60001V4.10001H17.2501V3.60001V3.10001H6.7501V3.60001ZM20.4001 6.75001H19.9001V17.25H20.4001H20.9001V6.75001H20.4001ZM17.2501 20.4V19.9H6.7501V20.4V20.9H17.2501V20.4ZM3.6001 17.25H4.1001V6.75001H3.6001H3.1001V17.25H3.6001ZM6.7501 20.4V19.9C5.28654 19.9 4.1001 18.7136 4.1001 17.25H3.6001H3.1001C3.1001 19.2658 4.73426 20.9 6.7501 20.9V20.4ZM20.4001 17.25H19.9001C19.9001 18.7136 18.7137 19.9 17.2501 19.9V20.4V20.9C19.2659 20.9 20.9001 19.2658 20.9001 17.25H20.4001ZM17.2501 3.60001V4.10001C18.7137 4.10001 19.9001 5.28645 19.9001 6.75001H20.4001H20.9001C20.9001 4.73417 19.2659 3.10001 17.2501 3.10001V3.60001ZM6.7501 3.60001V3.10001C4.73426 3.10001 3.1001 4.73417 3.1001 6.75001H3.6001H4.1001C4.1001 5.28645 5.28654 4.10001 6.7501 4.10001V3.60001ZM9.9001 8.32501H9.4001C9.4001 8.91871 8.9188 9.40001 8.3251 9.40001V9.90001V10.4C9.47109 10.4 10.4001 9.471 10.4001 8.32501H9.9001ZM8.3251 9.90001V9.40001C7.73139 9.40001 7.2501 8.91871 7.2501 8.32501H6.7501H6.2501C6.2501 9.471 7.17911 10.4 8.3251 10.4V9.90001ZM6.7501 8.32501H7.2501C7.2501 7.7313 7.73139 7.25001 8.3251 7.25001V6.75001V6.25001C7.17911 6.25001 6.2501 7.17902 6.2501 8.32501H6.7501ZM8.3251 6.75001V7.25001C8.9188 7.25001 9.4001 7.7313 9.4001 8.32501H9.9001H10.4001C10.4001 7.17902 9.47109 6.25001 8.3251 6.25001V6.75001Z" fill="#FD4242"/>
      </svg>
    );
    case 'carousel': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M16.587 2.1565C17.4502 2.03277 18.2505 2.63469 18.3712 3.4983L18.5313 4.65162L22.1182 5.7151C22.8977 5.94639 23.3514 6.75697 23.1407 7.54225L19.6319 20.6028C19.4193 21.3924 18.6128 21.8665 17.8194 21.6682L11.2374 20.0227C11.1029 19.989 10.9944 19.9036 10.9288 19.7932L4.96686 20.6497C4.10357 20.7735 3.30333 20.1716 3.18268 19.3079L1.31842 5.93287C1.19893 5.07398 1.79691 4.2797 2.65534 4.1565L16.587 2.1565ZM19.1358 18.595C19.0594 18.6183 18.9809 18.638 18.8995 18.6497L13.1631 19.4729L18.0626 20.6985C18.3269 20.7643 18.5962 20.6061 18.6671 20.343L19.1358 18.595ZM12.2559 14.3596C12.0881 14.5818 11.7845 14.6516 11.5362 14.5256L8.99518 13.2346L4.32135 18.0823C4.28126 18.1238 4.23448 18.1551 4.18659 18.1819L4.32233 19.1497C4.35526 19.3823 4.57112 19.5453 4.80377 19.512L18.7354 17.512C18.9668 17.4787 19.1277 17.264 19.0958 17.0325L18.5176 12.886C18.4951 12.8743 18.4717 12.8628 18.4503 12.8479L15.1426 10.5335L12.2559 14.3596ZM16.751 3.29518L2.81842 5.29518C2.5869 5.32841 2.42505 5.54205 2.4571 5.77369L3.98932 16.7678L8.46295 12.1311L8.53327 12.0686C8.70617 11.9394 8.94061 11.9168 9.13776 12.0169L11.627 13.2825L14.5596 9.39772C14.7462 9.15101 15.0952 9.09636 15.3487 9.27369L18.3018 11.3411L17.2315 3.65748C17.199 3.42451 16.9839 3.26204 16.751 3.29518ZM20.0176 15.3128L22.1749 7.28346C22.2452 7.02174 22.0938 6.75129 21.834 6.67408L18.6837 5.73951L20.0176 15.3128ZM6.21002 7.2024C6.89628 7.10416 7.53221 7.58067 7.63092 8.26686C7.72935 8.95332 7.25291 9.59014 6.56647 9.68873C5.88003 9.78721 5.24328 9.31065 5.1446 8.62428C5.04606 7.93771 5.52345 7.30094 6.21002 7.2024Z" fill="#EF6800"/>
      </svg>
    );
    case 'story': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M14.875 14.25L11.5 13.125V8.42087M20.5 12C20.5 7.02944 16.4706 3 11.5 3C6.52944 3 2.5 7.02944 2.5 12C2.5 16.9706 6.52944 21 11.5 21C12.0768 21 12.6409 20.9457 13.1875 20.8421M15.4375 18.1875L17.125 19.875L21.625 15.375" stroke="#FF37CA" strokeOpacity="0.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    case 'short': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M10.3333 5H13.6667M6 4.5V19.5C6 20.8807 6.89543 22 8 22H16C17.1046 22 18 20.8807 18 19.5V4.50001C18 3.1193 17.1046 2.00002 16 2.00001L8 2C6.89543 2 6 3.11929 6 4.5Z" stroke="#00AAFF" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    case 'feed-video': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12.1055 8.83333H9.3555M15.8752 14.3867L20.5252 16.6771C21.0072 16.9705 21.513 16.7976 21.5 16.1856L21.4674 8.09104C21.4262 7.42667 21.0341 7.24539 20.4568 7.55242L15.8621 9.64057M5.25 18.5H13.6055C14.8481 18.5 15.8555 17.5051 15.8555 16.2778L15.8752 13.4275L15.8555 7.72222C15.8555 6.49492 14.8481 5.5 13.6055 5.5H5.25C4.00736 5.5 3 6.49492 3 7.72222V16.2778C3 17.5051 4.00736 18.5 5.25 18.5Z" stroke="#6A00FF" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    case 'email': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M4.6875 6.75L11.3596 11.5403C11.7449 11.8168 12.2551 11.8168 12.6404 11.5403L19.3125 6.75M5.25 19H18.75C19.9926 19 21 17.9553 21 16.6667V7.33333C21 6.04467 19.9926 5 18.75 5H5.25C4.00736 5 3 6.04467 3 7.33333V16.6667C3 17.9553 4.00736 19 5.25 19Z" stroke="#FFAE00" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    case 'blog': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M8.40033 7.20001H15.6003M8.40033 10.8H15.6003M8.40033 14.4H12.0003M6.60004 2.40001H17.4003C18.7258 2.40001 19.8003 3.47455 19.8003 4.80005L19.8 19.2001C19.8 20.5255 18.7254 21.6 17.4 21.6L6.59994 21.6C5.27446 21.5999 4.19994 20.5254 4.19995 19.1999L4.20004 4.8C4.20005 3.47452 5.27457 2.40001 6.60004 2.40001Z" stroke="#20A14F" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    default: return null;
  }
}

// ── Paid Search Ad card — Google search result preview ────────────────────────
function PaidSearchCard({
  post, internalStatus, onMarkReady, onReview,
  mode = 'internal', clientStatus, onApprove, onRemoveApproval,
}: {
  post: Post; internalStatus: InternalStatus;
  onMarkReady: () => void; onReview: () => void;
  mode?: 'internal' | 'client';
  clientStatus?: Status; onApprove?: () => void; onRemoveApproval?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isReady    = internalStatus === 'readyForClient';
  const isApproved = clientStatus === 'approved';
  const dimmed     = mode === 'client' ? isApproved : isReady;
  const variants   = post.adVariants ?? [];

  return (
    <div
      style={{
        position: 'relative', width: 330, flexShrink: 0,
        background: white, border: `1px solid ${dark8}`, borderRadius: 10,
        overflow: 'hidden', cursor: 'pointer',
        opacity: dimmed ? 0.65 : 1, transition: 'opacity 0.2s',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header: campaign goal + target */}
      <div style={{ padding: '14px 14px 10px' }}>
        <p style={{ margin: '0 0 2px', fontSize: 12, color: dark60, fontFamily: F, lineHeight: 1.4 }}>
          {post.adCampaignGoal}
        </p>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: dark90, fontFamily: F, lineHeight: 1.4 }}>
          {post.adCampaignTarget}
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: dark8, margin: '0 14px' }} />

      {/* Ad variants — compact */}
      <div style={{ padding: '10px 14px 46px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: dark60, fontFamily: F, letterSpacing: '0.2px' }}>
          {variants.length} variant{variants.length !== 1 ? 's' : ''} being tested
        </p>
        {variants.map(v => (
          <div key={v.label} style={{ borderLeft: `2px solid ${dark8}`, paddingLeft: 10 }}>
            <p style={{ margin: '0 0 2px', fontSize: 13, color: '#1a73e8', fontFamily: F, lineHeight: 1.4, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.headline}</p>
            <p style={{ margin: 0, fontSize: 12, color: dark60, fontFamily: F, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{v.description}</p>
          </div>
        ))}
      </div>

      {/* Status pill — bottom left */}
      <div style={{ position: 'absolute', bottom: 10, left: 12, zIndex: 5 }}>
        {mode === 'internal'
          ? <InternalStatusPill status={internalStatus} />
          : <StatusPill status={clientStatus ?? 'pending'} viewerMode="client" />}
      </div>

      {/* Hover overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', opacity: hovered && !dimmed ? 1 : 0, transition: 'opacity 0.18s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, pointerEvents: hovered && !dimmed ? 'all' : 'none' }}>
        <div style={{ transform: hovered && !dimmed ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(4px)', transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {mode === 'internal' ? (
            <>
              <Button variant="green" size="sm" frontIcon={Check2} onClick={(e) => { e.stopPropagation(); onMarkReady(); }}>
                Ready for Client
              </Button>
              <Button variant="secondary" size="sm" frontIcon={Edit3} onClick={(e) => { e.stopPropagation(); onReview(); }}>
                Edit
              </Button>
            </>
          ) : (
            <>
              {!isApproved && (
                <Button variant="green" size="sm" frontIcon={Check2} onClick={(e) => { e.stopPropagation(); onApprove?.(); }}>
                  Approve
                </Button>
              )}
              {isApproved && (
                <Button variant="secondary" size="sm" frontIcon={ApprovalsIcon} onClick={(e) => { e.stopPropagation(); onRemoveApproval?.(); }}>
                  Remove approval
                </Button>
              )}
              <Button variant="secondary" size="sm" frontIcon={Edit3} onClick={(e) => { e.stopPropagation(); onReview(); }}>
                Edit
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Reputation source badge + icons ──────────────────────────────────────────
function SourceBadge({ source }: { source: Post['reputationSource'] }) {
  const cfg: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    yelp:      { label: 'Yelp',      color: '#d32323', bg: 'rgba(211,35,35,0.08)', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="#d32323"><path d="M20.16 12.73l-5.15 1.54a1.55 1.55 0 0 1-1.91-1.5V5.5a1.55 1.55 0 0 1 1.74-1.54l5.47.82a1.55 1.55 0 0 1 1.2 2.1l-1.82 4.04a1.55 1.55 0 0 1 .47 1.81zM10.5 3.96l1.06 5.33a1.55 1.55 0 0 1-1.3 1.82l-.24.02a1.55 1.55 0 0 1-1.58-1.1L6.8 4.52A1.55 1.55 0 0 1 8 2.6l1.06.12a1.55 1.55 0 0 1 1.44 1.24zM8.47 13.03a1.55 1.55 0 0 1 .07 2.18l-3.7 3.89a1.55 1.55 0 0 1-2.55-.63l-.42-1.45a1.55 1.55 0 0 1 .92-1.88l4.5-1.54a1.55 1.55 0 0 1 1.18.43zm4.58 2.55l-.42 5.26a1.55 1.55 0 0 1-1.88 1.37l-1.43-.34a1.55 1.55 0 0 1-1.06-2.07l2.15-4.78a1.55 1.55 0 0 1 2.64.56z"/></svg> },
    reddit:    { label: 'r/Austin',  color: '#ff4500', bg: 'rgba(255,69,0,0.08)',   icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff4500"><path d="M12 0C5.37 0 0 5.37 0 12c0 6.63 5.37 12 12 12s12-5.37 12-12S18.63 0 12 0zm5.94 13.5c.03.26.05.52.05.78 0 3.99-4.65 7.22-10.38 7.22S2.23 18.27 2.23 14.28c0-.26.02-.52.05-.78a1.87 1.87 0 0 1-1.1-1.7c0-1.04.84-1.88 1.88-1.88.5 0 .95.2 1.28.52 1.26-.9 3-1.48 4.94-1.54l.84-3.94a.37.37 0 0 1 .44-.29l2.78.59A1.38 1.38 0 0 1 14.7 6.5a1.38 1.38 0 1 1-1.4 1.38c-.38 0-.72-.16-.97-.41l-2.47-.52-.74 3.49c1.9.08 3.62.66 4.87 1.55a1.85 1.85 0 0 1 1.27-.5c1.04 0 1.88.84 1.88 1.88 0 .75-.44 1.4-1.1 1.63zM8.75 14.28a1.13 1.13 0 1 0 2.25 0 1.13 1.13 0 0 0-2.25 0zm6.5 0a1.13 1.13 0 1 0-2.25 0 1.13 1.13 0 0 0 2.25 0zm-4.88 3c.73.73 2.02.73 2.75 0a.38.38 0 0 0-.53-.53c-.46.46-1.22.46-1.69 0a.38.38 0 0 0-.53.53z"/></svg> },
    google:    { label: 'Google Reviews', color: '#4285f4', bg: 'rgba(66,133,244,0.08)', icon: <svg width="12" height="12" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> },
    instagram: { label: 'Instagram comment', color: '#c13584', bg: 'rgba(193,53,132,0.08)', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig)" strokeWidth="1.8"/><circle cx="12" cy="12" r="4.5" stroke="url(#ig)" strokeWidth="1.8"/><circle cx="17.5" cy="6.5" r="1" fill="#c13584"/><defs><linearGradient id="ig" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse"><stop stopColor="#f09433"/><stop offset="0.25" stopColor="#e6683c"/><stop offset="0.5" stopColor="#dc2743"/><stop offset="0.75" stopColor="#cc2366"/><stop offset="1" stopColor="#bc1888"/></linearGradient></defs></svg> },
  };
  const c = cfg[source ?? 'google'] ?? cfg.google;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:c.bg, borderRadius:5, padding:'2px 7px', fontSize:12, fontFamily:F, color:c.color, fontWeight:500, flexShrink:0 }}>
      {c.icon}{c.label}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ display:'inline-flex', gap:1 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill={i <= rating ? '#ffb400' : dark15}>
          <path d="M6 1l1.24 2.54L10 4.01l-2 1.95.47 2.76L6 7.4 3.53 8.72 4 5.96 2 4.01l2.76-.47L6 1z"/>
        </svg>
      ))}
    </span>
  );
}

// ── Reputation card — full-width row, matches "Needs attention" Figma ────────
function ReputationCard({
  post, internalStatus, onMarkReady, onReview,
  mode = 'internal', clientStatus, onApprove, onRemoveApproval,
}: {
  post: Post; internalStatus: InternalStatus;
  onMarkReady: () => void; onReview: () => void;
  mode?: 'internal' | 'client';
  clientStatus?: Status; onApprove?: () => void; onRemoveApproval?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isReady    = internalStatus === 'readyForClient';
  const isApproved = clientStatus === 'approved';
  const dimmed     = mode === 'client' ? isApproved : isReady;

  return (
    <div
      style={{
        position: 'relative', width: 330, flexShrink: 0,
        background: white, border: `1px solid ${dark8}`, borderRadius: 10,
        overflow: 'hidden', cursor: 'pointer',
        opacity: dimmed ? 0.65 : 1, transition: 'opacity 0.2s',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header: source badge + time */}
      <div style={{ padding: '12px 12px 8px', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <SourceBadge source={post.reputationSource} />
        {post.reputationRating !== undefined && <StarRating rating={post.reputationRating} />}
        <span style={{ fontSize: 11, color: dark40, fontFamily: F, marginLeft: 'auto' }}>{post.timeAgo}</span>
      </div>

      {/* Handle */}
      <div style={{ padding: '0 12px 8px' }}>
        <span style={{ fontSize: 11, color: dark60, fontFamily: F }}>{post.reputationHandle}</span>
        {post.engagementLabel && (
          <span style={{ fontSize: 11, color: dark40, fontFamily: F }}> · {post.engagementLabel}</span>
        )}
      </div>

      {/* Review title + body */}
      <div style={{ padding: '0 12px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: dark90, fontFamily: F, lineHeight: 1.4 }}>
          {post.reputationTitle ?? post.caption}
        </p>
        <p style={{ margin: 0, fontSize: 12, color: dark80, fontFamily: F, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
          {post.reputationText ?? post.caption}
        </p>
      </div>

      {/* AI draft (if any) */}
      {post.aiDraft && (
        <div style={{ margin: '0 10px 10px', background: 'rgba(124,92,252,0.05)', border: '1px solid rgba(124,92,252,0.15)', borderRadius: 7, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 500, fontFamily: F, display: 'flex', alignItems: 'center', gap: 3,
            color: post.draftNeedsHumanReview ? '#8a6800' : '#5c3fc4' }}>
            {post.draftNeedsHumanReview
              ? <><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#8a6800" strokeWidth="1.2"/><path d="M6 4v2.5" stroke="#8a6800" strokeWidth="1.2" strokeLinecap="round"/><circle cx="6" cy="9" r="0.7" fill="#8a6800"/></svg> Needs human review · {post.draftTone}</>
              : <><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5.5L4.2 7.5L8 3" stroke="#5c3fc4" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> AI draft · {post.draftTone}</>
            }
          </span>
          <p style={{ margin: 0, fontSize: 11, color: dark80, fontFamily: F, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
            "{post.aiDraft}"
          </p>
        </div>
      )}

      {/* Spacer so bottom pills don't overlap content */}
      <div style={{ height: 36 }} />

      {/* Status pill — bottom left */}
      <div style={{ position: 'absolute', bottom: 10, left: 12, zIndex: 5 }}>
        {mode === 'internal'
          ? <InternalStatusPill status={internalStatus} />
          : <StatusPill status={clientStatus ?? 'pending'} viewerMode="client" />}
      </div>

      {/* Confidence pill — bottom right (internal mode only) */}
      {mode === 'internal' && post.confidence !== undefined && (
        <div style={{ position: 'absolute', bottom: 10, right: 12, zIndex: 5 }}>
          <span style={{ fontSize: 11, color: dark60, fontFamily: F, background: dark4, borderRadius: 4, padding: '2px 7px' }}>
            Confidence {post.confidence}%
          </span>
        </div>
      )}

      {/* Hover overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', opacity: hovered ? 1 : 0, transition: 'opacity 0.18s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, pointerEvents: hovered ? 'all' : 'none' }}>
        <div style={{ transform: hovered ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(4px)', transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {mode === 'internal' ? (
            <>
              <Button variant="green" size="sm" frontIcon={Check2} onClick={(e) => { e.stopPropagation(); onMarkReady(); }}>
                Ready for Client
              </Button>
              <Button variant="secondary" size="sm" frontIcon={Edit3} onClick={(e) => { e.stopPropagation(); onReview(); }}>
                Edit
              </Button>
            </>
          ) : (
            <>
              {!isApproved && (
                <Button variant="green" size="sm" frontIcon={Check2} onClick={(e) => { e.stopPropagation(); onApprove?.(); }}>
                  Approve
                </Button>
              )}
              {isApproved && (
                <Button variant="secondary" size="sm" frontIcon={ApprovalsIcon} onClick={(e) => { e.stopPropagation(); onRemoveApproval?.(); }}>
                  Remove approval
                </Button>
              )}
              <Button variant="secondary" size="sm" frontIcon={Edit3} onClick={(e) => { e.stopPropagation(); onReview(); }}>
                Edit
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Content card — 245×378px, dark-2 bg, Figma spec ─────────────────────────
function ContentCard({
  post, status, dontPostReasons, resubmitNote, isPast, onApprove, onRemoveApproval, onReview,
}: {
  post: Post; status: Status; dontPostReasons?: string[]; resubmitNote?: string; isPast?: boolean;
  onApprove: () => void; onRemoveApproval: () => void; onReview: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isApproved = status === 'approved';
  const isDraft    = status === 'rejected' || status === 'declined';

  // Specialized card types use their own components (same look as internal view, client-mode hover)
  if (post.type === 'paid-search-ad') {
    return (
      <PaidSearchCard
        post={post}
        internalStatus="readyForClient"
        onMarkReady={() => {}}
        onReview={onReview}
        mode="client"
        clientStatus={status}
        onApprove={onApprove}
        onRemoveApproval={onRemoveApproval}
      />
    );
  }
  if (post.type === 'local-seo') {
    return (
      <LocalSEOCard
        post={post}
        internalStatus="readyForClient"
        onMarkReady={() => {}}
        onReview={onReview}
        mode="client"
        clientStatus={status}
        onApprove={onApprove}
        onRemoveApproval={onRemoveApproval}
      />
    );
  }
  if (post.type === 'review' || post.type === 'comment') {
    return (
      <ReputationCard
        post={post}
        internalStatus="readyForClient"
        onMarkReady={() => {}}
        onReview={onReview}
        mode="client"
        clientStatus={status}
        onApprove={onApprove}
        onRemoveApproval={onRemoveApproval}
      />
    );
  }

  const isBlog     = post.type === 'blog';

  // Header height: pt-12 + icon(14) + pb-2 = ~34px
  // Caption area: ~58px (2 lines × 18px + 10px top + 8px bottom)
  const CARD_H   = 378;
  const HEADER_H = 36;
  // Portrait types fill the card with just the image (no caption section)
  const isPortrait = post.type === 'story' || post.type === 'short' || post.type === 'feed-video';
  // Landscape types (still/carousel): grouped caption+image with shadow
  const isLandscape = post.type === 'still' || post.type === 'carousel';

  return (
    <div
      style={{
        position: 'relative', width: 245, height: CARD_H, flexShrink: 0,
        background: dark2, border: `1px solid ${dark4}`,
        borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        opacity: isApproved ? 0.65 : 1, transition: 'opacity 0.2s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Header: icon + type + date ── */}
      <div style={{ height: HEADER_H, display:'flex', alignItems:'center', gap:4, padding:'12px 12px 2px', flexShrink:0 }}>
        <TypeIcon type={post.type} size={14} />
        <span style={{ fontSize:12, color:dark60, fontFamily:F, flex:1, letterSpacing:'0.24px' }}>{TYPE_LABEL[post.type]}</span>
        <span style={{ fontSize:11, color:dark40, fontFamily:F, letterSpacing:'0.22px', whiteSpace:'nowrap' }}>{post.date}</span>
      </div>

      {isBlog ? (
        /* ── Blog layout — white inner card with shadow ── */
        <div style={{ flex:1, padding:'0 10px 32px', display:'flex', flexDirection:'column' }}>
          <div style={{
            flex:1, display:'flex', flexDirection:'column', overflow:'hidden',
            background: white, borderRadius:8,
            boxShadow:'0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
          }}>
            {/* Image — top, edge-to-edge within inner card */}
            <div style={{ height: 126, flexShrink:0, background:'#c8c0b4', overflow:'hidden', borderRadius:'8px 8px 0 0' }}>
              {post.img && <img src={post.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
            </div>
            {/* Text content */}
            <div style={{ flex:1, padding:'10px 12px 10px', overflow:'hidden', display:'flex', flexDirection:'column', gap:5 }}>
              <p style={{ margin:0, fontSize:16, fontWeight:400, color:dark90, fontFamily:F, lineHeight:1.3,
                display:'-webkit-box', WebkitLineClamp:4, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>
                {post.caption}
              </p>
              <p style={{ margin:0, fontSize:11, color:dark40, fontFamily:F }}>July 8, 2025</p>
              <p style={{ margin:0, fontSize:12, color:dark60, fontFamily:F, lineHeight:1.55, letterSpacing:'0.24px',
                display:'-webkit-box', WebkitLineClamp:6, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>
                A fresh coat of paint is one of the highest-return improvements you can make to your home — protecting siding and trim from the Texas sun while instantly lifting curb appeal. The secret is in the prep: power-washing, scraping, sanding, and caulking every surface before the first coat is what makes a CertaPro finish last for years, not months.
              </p>
            </div>
          </div>
        </div>

      ) : isPortrait ? (
        /* ── Portrait 9:16 — fit to frame height, centered, 9:16 leaves side space ── */
        <div style={{ flex:1, minHeight:0, padding:'6px 10px 10px', display:'flex', justifyContent:'center', overflow:'hidden' }}>
          <div style={{ position:'relative', height:'100%', aspectRatio:'9/16', borderRadius:8, overflow:'hidden', background:'#1a1a1a' }}>
            {post.img && <img src={post.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
            {post.type === 'feed-video' && (
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ width:44, height:44, borderRadius:99, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="14" height="16" viewBox="0 0 16 18" fill="white"><path d="M2 2L14 9L2 16V2Z"/></svg>
                </div>
              </div>
            )}
          </div>
        </div>

      ) : isLandscape ? (
        /* ── Landscape layout (still / carousel) — caption + image grouped with shadow ── */
        <div style={{ flex:1, padding:'0 10px 10px', display:'flex', flexDirection:'column' }}>
          <div style={{
            flex:1, display:'flex', flexDirection:'column', overflow:'hidden',
            background: white, borderRadius:8,
            boxShadow:'0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
          }}>
            {/* Caption inside the white group */}
            <div style={{ padding:'10px 12px 8px', flexShrink:0 }}>
              <p style={{
                margin:0, fontSize:12, color:dark80, fontFamily:F, lineHeight:1.55, letterSpacing:'0.24px',
                display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const, overflow:'hidden',
              }}>
                {post.caption}
                {post.caption.length > 55 && <span style={{ color:dark40 }}> ...mo...</span>}
              </p>
            </div>
            {/* Image fills remaining space in the group */}
            <div style={{ flex:1, position:'relative', background:'#c8c0b4', overflow:'hidden' }}>
              {post.img && <img src={post.img} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
              {/* Carousel slide badge */}
              {post.type === 'carousel' && post.slides && (
                <div style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,0.55)', borderRadius:4, padding:'2px 6px', display:'flex', alignItems:'center', gap:3 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="2" stroke="white" strokeWidth="1.6"/><path d="M2 7v10M22 7v10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
                  <span style={{ fontSize:10, color:'white', fontFamily:F }}>{post.slides}</span>
                </div>
              )}
            </div>
          </div>
        </div>

      ) : (
        /* ── Email / other — white inner card: title + image + body ── */
        <div style={{ flex:1, padding:'0 10px 32px', display:'flex', flexDirection:'column' }}>
          <div style={{
            flex:1, display:'flex', flexDirection:'column', overflow:'hidden',
            background: white, borderRadius:8,
            boxShadow:'0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
          }}>
            {/* Subject / headline */}
            <div style={{ padding:'10px 12px 8px', flexShrink:0 }}>
              <p style={{ margin:0, fontSize:13, fontWeight:500, color:dark90, fontFamily:F, lineHeight:1.4, textAlign:'center',
                display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>
                {post.caption}
              </p>
            </div>
            {/* Image */}
            <div style={{ height:110, flexShrink:0, background:'#c8c0b4', overflow:'hidden' }}>
              {post.img && <img src={post.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
            </div>
            {/* Body copy */}
            <div style={{ flex:1, padding:'8px 12px 10px', overflow:'hidden' }}>
              <p style={{ margin:0, fontSize:11, color:dark60, fontFamily:F, lineHeight:1.55, letterSpacing:'0.22px',
                display:'-webkit-box', WebkitLineClamp:7, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>
                A fresh coat of paint is one of the highest-return improvements you can make to your home — protecting siding and trim from the Texas sun while instantly lifting curb appeal. The secret is in the prep: power-washing, scraping, sanding, and caulking every surface before the first coat is what makes a CertaPro finish last for years, not months.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Status pill — always anchored bottom-left 10px ── */}
      <div style={{ position:'absolute', bottom:10, left:12, zIndex:5 }}>
        <StatusPill status={status} dontPostReasons={dontPostReasons} resubmitNote={resubmitNote} isPast={isPast} viewerMode="client" />
      </div>

      {/* ── Hover overlay ── */}
      <div style={{
        position:'absolute', inset:0,
        background:'rgba(0,0,0,0.35)',
        opacity: hovered ? 1 : 0, transition:'opacity 0.18s',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8,
        pointerEvents: hovered ? 'all' : 'none',
      }}>
        <div style={{
          transform: hovered ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(4px)',
          transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          display:'flex', flexDirection:'column', alignItems:'center', gap:8,
        }}>
          {!isPast && !isDraft && (
            <Button
              variant={isApproved ? 'secondary' : 'green'}
              size="sm"
              frontIcon={isApproved ? ApprovalsIcon : Check2}
              onPress={(e) => { (e as any).continuePropagation?.(); }}
              onClick={(e) => { e.stopPropagation(); isApproved ? onRemoveApproval() : onApprove(); }}
            >
              {isApproved ? 'Remove approval' : 'Approve'}
            </Button>
          )}
          <Button variant="secondary" size="sm" frontIcon={EyeOpen}
            onClick={(e) => { e.stopPropagation(); onReview(); }}>
            {isPast ? 'View' : 'Review'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Campaign section ──────────────────────────────────────────────────────────
function CampaignSection({
  campaign, statuses, dontPostReasons, resubmitNotes, onApprove, onRemoveApproval, onReview, onApproveAll, justCompleted, defaultCollapsed, isPast,
}: {
  campaign: Campaign;
  statuses: Record<number, Status>;
  dontPostReasons: Record<number, string[]>;
  resubmitNotes?: Record<number, string>;
  onApprove: (id: number) => void;
  onRemoveApproval: (id: number) => void;
  onReview: (id: number) => void;
  onApproveAll: () => void;
  justCompleted?: boolean;
  defaultCollapsed?: boolean;
  isPast?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed ?? false);
  const [animState, setAnimState] = useState<'idle' | 'animating' | 'collapsed'>('idle');
  const [approvedSectionCollapsed, setApprovedSectionCollapsed] = useState(false);

  useEffect(() => {
    if (!justCompleted) return;
    // Short delay so the modal starts opening simultaneously
    const t1 = setTimeout(() => setAnimState('animating'), 80);
    // After animation completes, snap to collapsed
    const t2 = setTimeout(() => { setAnimState('collapsed'); setCollapsed(true); }, 680);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [justCompleted]);

  const pending  = campaign.posts.filter(p => statuses[p.id] !== 'approved').sort((a,b) => a.dateSort.localeCompare(b.dateSort));
  const approved = campaign.posts.filter(p => statuses[p.id] === 'approved').sort((a,b) => a.dateSort.localeCompare(b.dateSort));

  const totalReviewed = campaign.posts.filter(p => statuses[p.id] !== 'pending').length;
  const totalPosts    = campaign.posts.length;
  const approvedCount = approved.length;
  const rejectedCount = campaign.posts.filter(p => statuses[p.id] === 'rejected' || statuses[p.id] === 'declined').length;
  const pendingCount  = campaign.posts.filter(p => statuses[p.id] === 'pending').length;

  const approvedW = Math.round((approvedCount / totalPosts) * 111);
  const rejectedW = Math.round((rejectedCount / totalPosts) * 111);
  const pendingW  = 111 - approvedW - rejectedW;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Campaign header row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {/* Collapse chevron */}
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', width:20, height:20, border:'none', background:'transparent', cursor:'pointer', padding:0, flexShrink:0 }}
            aria-label={collapsed ? 'Expand campaign' : 'Collapse campaign'}
          >
            {collapsed
              ? <ChevronRight size={16} color={dark40} />
              : <ChevronDown  size={16} color={dark40} />}
          </button>
          <span style={{ fontSize:18, fontWeight:400, color:dark80, fontFamily:F, letterSpacing:'-0.36px' }}>{campaign.name}</span>
          <span style={{ fontSize:14, color:dark60, fontFamily:F, letterSpacing:'0.14px' }}>{campaign.dateRange}</span>
          {/* Badge — icon matches the sidebar nav icon for the badge type */}
          <span style={{
            display:'inline-flex', alignItems:'center', gap:4,
            background:dark2, borderRadius:4,
            padding:'2px 6px', fontSize:12, color:dark90, fontFamily:F, letterSpacing:'0.24px',
          }}>
            <BadgeIcon badge={campaign.badge} />
            {campaign.badge}
          </span>
          {/* Arrow button */}
          <button style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8, border:'none', background:'transparent', cursor:'pointer', padding:0 }}>
            <ArrowRight size={16} color={dark60} />
          </button>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {isPast ? (
            /* Past campaign: just show total post count, no bar or Approve All */
            <span style={{ fontSize:12, color:dark60, fontFamily:F, whiteSpace:'nowrap', letterSpacing:'0.12px' }}>
              {totalPosts} posts
            </span>
          ) : (
            <>
              {/* Progress bar + label */}
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ display:'flex', borderRadius:99, overflow:'hidden' }}>
                  {approvedW > 0 && <div style={{ width:approvedW, height:2, background:green }} />}
                  {rejectedW > 0 && <div style={{ width:rejectedW, height:2, background:red }} />}
                  {pendingCount > 0 && pendingW > 0 && <div style={{ width:pendingW, height:2, background:dark8 }} />}
                </div>
                <span style={{ fontSize:12, color:dark60, fontFamily:F, whiteSpace:'nowrap', letterSpacing:'0.12px' }}>
                  {totalReviewed} of {totalPosts} reviewed
                </span>
                {totalReviewed === totalPosts && (
                  <ApprovalsIcon size={14} color={green} />
                )}
              </div>

              {/* Vertical divider + Approve All — only for active campaigns */}
              {pendingCount > 0 && <div style={{ width:1, height:16, background:dark8 }} />}
              {pendingCount > 0 && (
                <button
                  onClick={onApproveAll}
                  style={{
                    display:'flex', alignItems:'center', gap:5,
                    padding:'6px 8px', borderRadius:8, border:'none',
                    background:'transparent', cursor:'pointer',
                    fontSize:14, fontWeight:400, color:dark90, fontFamily:F, letterSpacing:'0.14px',
                  }}
                >
                  <ApprovalsIcon size={15} color={dark90} />
                  Approve All
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Cards ── */}
      {!collapsed && (
        <div style={{
          display:'flex', flexDirection:'column', gap:18,
          opacity:   animState === 'animating' ? 0 : 1,
          transform: animState === 'animating' ? 'translateY(24px)' : 'translateY(0)',
          maxHeight: animState === 'animating' ? 0 : 'none',
          overflow:  animState === 'animating' ? 'hidden' : 'visible',
          transition: animState === 'animating'
            ? 'opacity 0.45s ease, transform 0.45s cubic-bezier(0.4,0,1,1), max-height 0.55s ease'
            : 'none',
        }}>
          {isPast ? (
            /* Past campaigns — flat grid with Posted/Don't Post/Failed pills */
            <div style={{ display:'flex', flexWrap:'wrap', gap:18 }}>
              {campaign.posts.map(post => (
                <ContentCard
                  key={post.id} post={post}
                  status={statuses[post.id]}
                  dontPostReasons={dontPostReasons[post.id]}
                  resubmitNote={resubmitNotes?.[post.id]}
                  isPast
                  onApprove={() => onApprove(post.id)}
                  onRemoveApproval={() => onRemoveApproval(post.id)}
                  onReview={() => onReview(post.id)}
                />
              ))}
            </div>
          ) : (
            <>
              {/* Pending grid */}
              {pending.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:18 }}>
                  {pending.map(post => (
                    <ContentCard
                      key={post.id} post={post}
                      status={statuses[post.id]}
                      dontPostReasons={dontPostReasons[post.id]}
                      resubmitNote={resubmitNotes?.[post.id]}
                      onApprove={() => onApprove(post.id)}
                      onRemoveApproval={() => onRemoveApproval(post.id)}
                      onReview={() => onReview(post.id)}
                    />
                  ))}
                </div>
              )}
              {/* Approved section */}
              {approved.length > 0 && (() => {
                const allDone = pending.length === 0;
                if (allDone) {
                  return (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:18 }}>
                      {approved.map(post => (
                        <ContentCard
                          key={post.id} post={post} status={statuses[post.id]}
                          onApprove={() => onApprove(post.id)}
                          onRemoveApproval={() => onRemoveApproval(post.id)}
                          onReview={() => onReview(post.id)}
                        />
                      ))}
                    </div>
                  );
                }
                return (
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, paddingTop:4 }}>
                      <div style={{ flex:1, height:1, background:dark8 }} />
                      <button
                        onClick={() => setApprovedSectionCollapsed(c => !c)}
                        style={{ display:'flex', alignItems:'center', gap:5, background:'transparent', border:'none', cursor:'pointer', padding:'2px 0', flexShrink:0 }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" width="13" height="13">
                          <circle cx="12" cy="12" r="9" stroke={green} strokeWidth="1.5"/>
                          <path d="M8.5 12L11 14.5L15.5 9.5" stroke={green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style={{ fontSize:12, fontWeight:500, color:green, fontFamily:F, whiteSpace:'nowrap' }}>
                          Approved ({approved.length})
                        </span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          style={{ transform: approvedSectionCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition:'transform 0.2s' }}>
                          <path d="M6 9l6 6 6-6" stroke={dark40} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <div style={{ flex:1, height:1, background:dark8 }} />
                    </div>
                    {!approvedSectionCollapsed && (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:18 }}>
                        {approved.map(post => (
                          <ContentCard
                            key={post.id} post={post} status={statuses[post.id]}
                            onApprove={() => onApprove(post.id)}
                            onRemoveApproval={() => onRemoveApproval(post.id)}
                            onReview={() => onReview(post.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Social platform icons ─────────────────────────────────────────────────────
const SocialIcon = ({ platform, active }: { platform: string; active?: boolean }) => {
  const opacity = active ? 1 : 0.4;
  const size = 28;
  const icons: Record<string, React.ReactNode> = {
    instagram: (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <defs>
          <radialGradient id="ig-g" cx="30%" cy="107%" r="150%">
            <stop offset="0%" stopColor="#fdf497"/>
            <stop offset="10%" stopColor="#fdf497"/>
            <stop offset="30%" stopColor="#fd5949"/>
            <stop offset="55%" stopColor="#d6249f"/>
            <stop offset="70%" stopColor="#285AEB"/>
          </radialGradient>
        </defs>
        <rect width="28" height="28" rx="7" fill="url(#ig-g)"/>
        <rect x="7" y="7" width="14" height="14" rx="4" stroke="white" strokeWidth="1.4"/>
        <circle cx="14" cy="14" r="4" stroke="white" strokeWidth="1.4"/>
        <circle cx="19" cy="9" r="1" fill="white"/>
      </svg>
    ),
    facebook: (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="7" fill="#1877F2"/>
        <path d="M16.5 9h-2a1 1 0 00-1 1v2h3l-.5 3H13.5v7H10.5v-7H9v-3h1.5v-2a4 4 0 014-4h2v3z" fill="white"/>
      </svg>
    ),
    linkedin: (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="7" fill="#0A66C2"/>
        <path d="M9 11.5h2.5v8H9v-8zm1.25-1a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zM13.5 11.5H16v1.1c.4-.7 1.3-1.3 2.5-1.3 2.2 0 3 1.5 3 3.5v4.7H19v-4.4c0-1-.4-1.6-1.3-1.6-1.1 0-1.7.7-1.7 1.8v4.2H13.5v-8z" fill="white"/>
      </svg>
    ),
    x: (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="7" fill="#000"/>
        <path d="M8 8h4l2.5 3.5L17 8h3l-4.5 6L20 20h-4l-2.8-3.8L10 20H7l5-6.5L8 8z" fill="white"/>
      </svg>
    ),
    google: (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="7" fill="white" stroke="#e0e0e0" strokeWidth="1"/>
        <path d="M20.8 14.2c0-.5 0-1-.1-1.5H14v2.8h3.8a3.2 3.2 0 01-1.4 2.1v1.8h2.3c1.3-1.2 2.1-3 2.1-5.2z" fill="#4285F4"/>
        <path d="M14 21c1.9 0 3.5-.6 4.7-1.7l-2.3-1.8c-.6.4-1.4.7-2.4.7-1.9 0-3.4-1.3-4-3H7.7v1.8A7 7 0 0014 21z" fill="#34A853"/>
        <path d="M10 15.2a4.2 4.2 0 010-2.4v-1.8H7.7A7 7 0 007 14c0 1.1.3 2.2.7 3.2L10 15.2z" fill="#FBBC04"/>
        <path d="M14 10.6c1 0 2 .4 2.7 1.1l2-2C17.5 8.5 15.9 8 14 8a7 7 0 00-6.3 3.8l2.3 1.8c.6-1.7 2.1-3 4-3z" fill="#EA4335"/>
      </svg>
    ),
  };
  return <span style={{ opacity, cursor: 'pointer', display: 'flex' }}>{icons[platform]}</span>;
};

// Agency contact managing this client's content — shown in the client "Request Changes" flow
const AGENCY_NAME = 'Sarah';
const AGENCY_AVATAR = 'https://randomuser.me/api/portraits/women/44.jpg';

// ── Don't Post feedback modal ─────────────────────────────────────────────────
const DONT_POST_OPTIONS = [
  'Image', 'Wrong language', 'Amount of text', 'Caption text',
  'Layout', 'Writing quality', 'Inaccurate', 'Missing text',
  'Colors and fonts', 'Other',
];

// ── Resubmit confirmation modal ───────────────────────────────────────────────
// ── Edit AI Draft modal (Reputation) ─────────────────────────────────────────
function EditAIDraftModal({ close, post }: { close: () => void; post: Post }) {
  const [draft, setDraft] = useState(post.aiDraft ?? '');
  return (
    <Modal.Root size="lg" onClose={close}>
      <Modal.Header title="Edit AI draft" onClose={close} />
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 0' }}>
          <p style={{ margin: 0, fontSize: 14, color: dark60, fontFamily: F, lineHeight: 1.6 }}>
            Tweak the agent's reply before sending. Your changes don't change the agent's tone for future replies.
          </p>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={8}
            style={{
              width: '100%', boxSizing: 'border-box',
              fontSize: 14, color: dark90, fontFamily: F, lineHeight: 1.6,
              border: `1px solid ${dark15}`, borderRadius: 8, padding: '12px 14px',
              resize: 'vertical', outline: 'none',
            }}
          />
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent>
          <Modal.FooterButton variant="tertiary" onPress={close}>Cancel</Modal.FooterButton>
          <Modal.FooterButton variant="primary" onPress={close}>Save changes</Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ── Paid Search launch modal ──────────────────────────────────────────────────
function PaidSearchLaunchModal({ close, post }: { close: () => void; post: Post }) {
  const variants = post.adVariants ?? [];
  return (
    <Modal.Root size="lg" onClose={close}>
      <Modal.Header title="Your campaign is ready to launch" onBack={close} onClose={close} />
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Approval needed pill + description */}
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 500, color: '#b45309', fontFamily: F, background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: 6, padding: '2px 8px', marginBottom: 8 }}>
              Approval needed
            </span>
            <p style={{ margin: 0, fontSize: 14, color: dark60, fontFamily: F, lineHeight: 1.6 }}>
              {post.adCampaignGoal}{' '}
              <strong style={{ fontWeight: 600, color: dark90 }}>Exterior painting — Austin metro</strong>
              {post.adCampaignTarget ? ` · ${post.adCampaignTarget}` : ''}
            </p>
          </div>

          {/* Ad variants */}
          <div style={{ border: `1px solid ${dark8}`, borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px 10px', borderBottom: `1px solid ${dark8}` }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: dark90, fontFamily: F }}>
                Ads being tested · {variants.length} variant{variants.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {variants.map(v => (
                <div key={v.label} style={{ border: `1px solid ${dark8}`, borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: dark60, fontFamily: F, background: dark4, border: `1px solid ${dark8}`, borderRadius: 5, padding: '2px 7px', letterSpacing: '0.4px' }}>{v.label}</span>
                    <span style={{ fontSize: 12, color: dark60, fontFamily: F }}>Sponsored</span>
                    <span style={{ fontSize: 12, color: dark40, fontFamily: F }}>·</span>
                    <span style={{ fontSize: 12, color: dark60, fontFamily: F }}>{post.adUrl}</span>
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: 15, color: '#1a73e8', fontFamily: F, lineHeight: 1.4, cursor: 'pointer' }}>{v.headline}</p>
                  <p style={{ margin: 0, fontSize: 13, color: dark80, fontFamily: F, lineHeight: 1.6 }}>{v.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Expected results */}
          <div style={{ border: `1px solid ${dark8}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: dark90, fontFamily: F }}>Expected results</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: dark90, fontFamily: F, lineHeight: 1 }}>3</span>
              <span style={{ fontSize: 14, color: dark60, fontFamily: F }}>estimate requests / day</span>
              <div style={{ flex: 1, height: 4, background: dark8, borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: '30%', height: '100%', background: '#1a73e8', borderRadius: 99 }} />
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: dark60, fontFamily: F }}>
              Backed by <strong style={{ color: dark90 }}>$40/day</strong> · ~$13.33 per estimate request · 28.6k impressions
            </p>
          </div>

          {/* Agent prep */}
          <p style={{ margin: 0, fontSize: 13, color: dark60, fontFamily: F }}>
            Agent also prepared:{' '}
            <span style={{ color: '#1a73e8', textDecoration: 'underline', cursor: 'pointer' }}>47 keywords</span>
            {' · '}
            <span style={{ color: '#1a73e8', textDecoration: 'underline', cursor: 'pointer' }}>Maximize Conversions bid</span>
            {' · '}
            <span style={{ color: '#1a73e8', textDecoration: 'underline', cursor: 'pointer' }}>45 negative keywords</span>
          </p>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent>
          <Modal.FooterButton variant="tertiary" onPress={close}>Save as draft</Modal.FooterButton>
          <Modal.FooterButton variant="primary" onPress={close}>Launch — $40/day</Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function ResubmitModal({ close, onConfirm, onReviewFirst }: {
  close: () => void;
  onConfirm: (note: string) => void;
  onReviewFirst?: () => void;
}) {
  const [note, setNote] = useState('');
  return (
    <Modal.Root size="sm" onClose={close}>
      <Modal.Header onClose={close}>
        <span style={{ fontSize: 17, fontWeight: 500, color: dark90, fontFamily: F }}>
          Resubmit to Client?
        </span>
      </Modal.Header>
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, fontSize: 14, color: dark60, fontFamily: F, lineHeight: 1.65 }}>
            Have you revised this post? The client will be notified to review it again.
          </p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note for the client (optional)"
            style={{
              width: '100%', minHeight: 80, resize: 'vertical',
              border: `1px solid ${dark15}`, borderRadius: 8,
              padding: '10px 12px', fontSize: 13, color: dark90,
              fontFamily: F, lineHeight: 1.5, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </Modal.Content>
      <Modal.Footer>
        {onReviewFirst && (
          <Modal.FooterContent slot="left">
            <Modal.FooterButton variant="secondary" onPress={() => { close(); onReviewFirst(); }}>
              Review Post First
            </Modal.FooterButton>
          </Modal.FooterContent>
        )}
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={() => { onConfirm(note.trim()); close(); }}>
            Yes, Resubmit
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function DontPostModal({ close, onConfirm }: { close: () => void; onConfirm: (reasons: string[]) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [otherText, setOtherText] = useState('');
  const otherSelected = selected.has('Other');

  const toggle = (opt: string) => setSelected(prev => {
    const next = new Set(prev);
    next.has(opt) ? next.delete(opt) : next.add(opt);
    return next;
  });

  const buildReasons = () => {
    const reasons = Array.from(selected).filter(r => r !== 'Other');
    if (otherSelected) reasons.push('Other');
    if (otherText.trim()) reasons.push(otherText.trim());
    return reasons;
  };

  return (
    <Modal.Root size="sm" onClose={close}>
      <Modal.Header onClose={close}>
        <span style={{ fontSize: 17, fontWeight: 500, color: dark90, fontFamily: F }}>
          What could be improved?
        </span>
      </Modal.Header>
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DONT_POST_OPTIONS.map(opt => {
              const active = selected.has(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggle(opt)}
                  style={{
                    padding: '6px 12px', borderRadius: 99,
                    border: `1.5px solid ${active ? dark90 : dark15}`,
                    background: active ? dark4 : white,
                    fontSize: 13, fontWeight: active ? 500 : 400,
                    color: dark90, fontFamily: F, cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <textarea
            value={otherText}
            onChange={e => setOtherText(e.target.value)}
            placeholder="Tell us more"
            style={{
              width: '100%', minHeight: 88, resize: 'vertical',
              border: `1px solid ${dark15}`, borderRadius: 8,
              padding: '10px 12px', fontSize: 13, color: dark90,
              fontFamily: F, lineHeight: 1.5, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={() => { onConfirm(buildReasons()); close(); }}>
            Send Feedback
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ── Content review page (full-page overlay) ───────────────────────────────────
type CommentMsg = { id: number; author: 'client' | 'staff'; text: string; time: string; system?: boolean };
function ReviewPage({ post, status, allPosts, allStatuses, onClose, onApprove, onRemoveApproval, onDontPost, onNavigate,
  mode, internalStatus, onMarkReady, onUndoReady, onResubmit, onRequestChanges, onDecline, dontPostReasons, resubmitNotes, isPast,
}: {
  post: Post; status: Status;
  allPosts: Post[]; allStatuses: Record<number, Status>;
  onClose: () => void; onApprove: () => void; onRemoveApproval: () => void;
  onDontPost: (reasons: string[]) => void; onNavigate: (id: number) => void;
  mode?: 'internal' | 'client';
  internalStatus?: InternalStatus;
  onMarkReady?: () => void;
  onUndoReady?: () => void;
  onResubmit?: (note: string) => void;
  onRequestChanges?: (text: string) => void;
  onDecline?: (text: string) => void;
  dontPostReasons?: Record<number, string[]>;
  resubmitNotes?: Record<number, string>;
  isPast?: boolean;
}) {
  const isReturned = status === 'rejected' || status === 'declined';
  const isDeclined = status === 'declined';
  // Posts with an existing conversation open straight into the Feedback panel
  const hasThread = (dontPostReasons?.[post.id]?.length ?? 0) > 0 || resubmitNotes?.[post.id] !== undefined;
  // Staff post sent to the client and awaiting their action — locked (no edit tools/tab)
  const isAwaitingClient = mode === 'internal' && internalStatus === 'readyForClient' && status === 'pending';
  // The right panel stays open at all times in the content preview
  const [focusMode, setFocusMode] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [rightTab, setRightTab] = useState<'edit' | 'comment'>(mode !== 'internal' || hasThread ? 'comment' : 'edit');
  const [commentInput, setCommentInput] = useState('');
  const [feedbackMode, setFeedbackMode] = useState<'request' | 'decline'>('request');
  const CAPTION_LIMIT = 100;
  const { openModal } = useModals();
  const handleDontPost = () => openModal(DontPostModal, { onConfirm: (reasons: string[]) => onDontPost(reasons) });

  const isApproved = status === 'approved';
  const isInternal = mode === 'internal';

  // Conversation thread — seeded from real client feedback + staff resubmit notes, extended locally
  const seedThread = (): CommentMsg[] => {
    const msgs: CommentMsg[] = [];
    const fb = dontPostReasons?.[post.id];
    if (fb && fb.length) msgs.push({ id: 1, author: 'client', text: fb.join('\n'), time: '2 days ago' });
    const note = resubmitNotes?.[post.id];
    if (note !== undefined) msgs.push({ id: 2, author: 'staff', text: note || 'Resubmitted the post with the requested updates.', time: '1 day ago' });
    return msgs;
  };
  const [thread, setThread] = useState<CommentMsg[]>(seedThread);
  useEffect(() => {
    setThread(seedThread());
    // Panel stays open; clients default to Feedback, staff to Feedback when there's a thread
    setRightTab(mode !== 'internal' || (hasThread && status !== 'approved') ? 'comment' : 'edit');
  }, [post.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const openCommentMode = () => setRightTab('comment');
  const openEditMode = () => setRightTab('edit');
  const sendComment = () => {
    if (!commentInput.trim()) return;
    const text = commentInput.trim();
    setThread(t => [...t, { id: t.length + 100, author: isInternal ? 'staff' : 'client', text, time: 'just now' }]);
    if (!isInternal) onRequestChanges?.(text);
    setCommentInput('');
  };
  // Client: submit feedback — either request changes or decline
  const submitClientFeedback = () => {
    const text = commentInput.trim();
    const label = feedbackMode === 'decline' ? 'Declined this post.' : 'Requested changes.';
    setThread(t => [...t, { id: t.length + 100, author: 'client', text: text || label, time: 'just now' }]);
    if (feedbackMode === 'decline') onDecline?.(text); else onRequestChanges?.(text);
    setCommentInput('');
  };
  // Staff: resubmit to client, using whatever was typed as the note. Stays on the preview.
  const resubmitWithComment = () => {
    const note = commentInput.trim();
    setThread(t => {
      const next = [...t];
      if (note) next.push({ id: t.length + 100, author: 'staff', text: note, time: 'just now' });
      next.push({ id: t.length + 200, author: 'staff', text: 'V2 submitted to client', time: 'just now', system: true });
      return next;
    });
    onResubmit?.(note);
    setCommentInput('');
  };
  const isReadyForClient = internalStatus === 'readyForClient';
  // Staff: resubmit composer when the post is returned. Client: feedback selector while
  // the post is still in review (pending).
  const showComposer = isInternal ? (status === 'rejected' && !isAwaitingClient) : status === 'pending';
  const currentIdx = allPosts.findIndex(p => p.id === post.id);
  const prevPost = allPosts[currentIdx - 1];
  const nextPost = allPosts[currentIdx + 1];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: '#f4f5f5',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* ── Top bar ── */}
      <div style={{
        height: 52, flexShrink: 0,
        background: white, borderBottom: `1px solid ${dark8}`,
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px',
      }}>
        {/* Left: back + title + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <Button variant="ghost" size="sm" square frontIcon={ArrowLeft} onPress={onClose} />
          <span style={{ fontSize: 14, fontWeight: 400, color: dark80, fontFamily: F, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
            {post.caption.slice(0, 48)}{post.caption.length > 48 ? '…' : ''}
          </span>
          {isInternal ? (() => {
              if (isPast) return <StatusPill status={status} isPast dontPostReasons={dontPostReasons?.[post.id]} />;
              if (isReturned && isReadyForClient) return <StatusPill status={status} dontPostReasons={dontPostReasons?.[post.id]} />;
              if (status === 'approved' && isReadyForClient) return <StatusPill status="approved" />;
              return <InternalStatusPill status={internalStatus ?? 'internalReview'} />;
            })()
            : <StatusPill status={status} dontPostReasons={dontPostReasons?.[post.id]} resubmitNote={resubmitNotes?.[post.id]} isPast={isPast} tooltipPlacement="below" viewerMode="client" />}
          <Button variant="ghost" size="sm" square>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="1.5" fill={dark60}/><circle cx="12" cy="12" r="1.5" fill={dark60}/><circle cx="19" cy="12" r="1.5" fill={dark60}/></svg>
          </Button>
        </div>

        {/* Center: Prev / Don't Post / primary CTA / Next */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Button
            variant="ghost" size="sm" frontIcon={ArrowLeft}
            isDisabled={!prevPost}
            onPress={() => prevPost && onNavigate(prevPost.id)}
          >
            Previous
          </Button>
          {isInternal && !isApproved && !isAwaitingClient && !isReturned && (
            <Button variant="secondary" size="sm" frontIcon={Edit3} forceActive={!focusMode && rightTab === 'edit'} onPress={openEditMode}>
              Edit
            </Button>
          )}
          {isInternal ? (
            isReturned ? null : isReadyForClient ? (
              <Button variant="secondary" size="sm" frontIcon={ApprovalsIcon} onPress={() => { onUndoReady?.(); }}>
                Undo
              </Button>
            ) : (
              <Button variant="green" size="sm" frontIcon={Check2} onPress={() => { onMarkReady?.(); }}>
                Ready for Client
              </Button>
            )
          ) : (
            isApproved ? (
              <Button variant="secondary" size="sm" frontIcon={ApprovalsIcon} onPress={() => { onRemoveApproval(); }}>
                Remove approval
              </Button>
            ) : isReturned ? null : (
              <Button variant="green" size="sm" frontIcon={Check2} onPress={() => { onApprove(); }}>
                Approve
              </Button>
            )
          )}
          <Button
            variant="ghost" size="sm" endIcon={ArrowRight}
            isDisabled={!nextPost}
            onPress={() => nextPost && onNavigate(nextPost.id)}
          >
            Next
          </Button>
        </div>

        {/* Right: credits + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'flex-end' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: dark90, fontFamily: F }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zM5 16l.8 2.2L8 19l-2.2.8L5 22l-.8-2.2L2 19l2.2-.8L5 16z" fill={dark90}/></svg>
            82 Credits
          </span>
          <div style={{ width: 28, height: 28, borderRadius: 99, overflow: 'hidden', flexShrink: 0 }}>
            <img src={IMG_AVATAR} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* Center — post preview */}
        <div style={{
          flex: 1, position: 'relative', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24,
          overflowY: 'auto',
        }}>

          {/* Post card wrapper — relative so "View as" can sit to the left */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            {/* View as label + social icons — pinned left of post card */}
            <div style={{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: dark40, fontFamily: F, letterSpacing: '0.22px' }}>View as</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                {(['instagram','facebook','linkedin','x','google'] as const).map((p, i) => (
                  <SocialIcon key={p} platform={p} active={i === 0} />
                ))}
              </div>
            </div>
            {/* Post card — Instagram style */}
            <div style={{
              width: focusMode ? 460 : 440, background: white, borderRadius: 12,
              boxShadow: '0 4px 24px rgba(0,0,0,0.1)', overflow: 'hidden',
              transition: 'width 0.3s ease',
            }}>
              {/* Header row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px',
              }}>
                {/* Avatar circle with person icon */}
                <div style={{ width: 32, height: 32, borderRadius: 99, background: dark8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke={dark40} strokeWidth="1.5"/>
                    <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke={dark40} strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: dark90, fontFamily: F, lineHeight: 1.2 }}>Account Not Connected</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 12, color: dark60, fontFamily: F }}>Jun 26 at 3:30</span>
                    {/* Lock/visibility icon */}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke={dark40} strokeWidth="1.5"/>
                      <path d="M7 11V7a5 5 0 0110 0v4" stroke={dark40} strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
                {/* More button ⋯ */}
                <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: dark80, padding: '2px 4px', display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="1.5" fill={dark60}/><circle cx="12" cy="12" r="1.5" fill={dark60}/><circle cx="19" cy="12" r="1.5" fill={dark60}/></svg>
                </button>
              </div>
              {/* Image — square */}
              <div style={{ aspectRatio: '1/1', background: '#c8c0b4', overflow: 'hidden' }}>
                {post.img && <img src={post.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              </div>
              {/* Action bar */}
              <div style={{ padding: '10px 14px 6px', display: 'flex', alignItems: 'center', gap: 24 }}>
                {/* Like */}
                <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: 0, color: dark80, fontSize: 12, fontFamily: F }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" stroke={dark80} strokeWidth="1.5" strokeLinejoin="round"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" stroke={dark80} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Like
                </button>
                {/* Comment */}
                <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: 0, color: dark80, fontSize: 12, fontFamily: F }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={dark80} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Comment
                </button>
                {/* Share */}
                <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: 0, color: dark80, fontSize: 12, fontFamily: F }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke={dark80} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Share
                </button>
              </div>
              {/* Caption */}
              <div style={{ padding: '0 14px 14px' }}>
                <p style={{ margin: 0, fontSize: 13, color: dark90, fontFamily: F, lineHeight: 1.5 }}>
                  <strong style={{ fontWeight: 500 }}>Account Not Connected</strong>{' '}
                  <span style={{ color: dark80 }}>
                    {captionExpanded || post.caption.length <= CAPTION_LIMIT
                      ? post.caption
                      : post.caption.slice(0, CAPTION_LIMIT) + '…'}
                  </span>
                  {post.caption.length > CAPTION_LIMIT && (
                    <span
                      onClick={() => setCaptionExpanded(e => !e)}
                      style={{ color: dark40, cursor: 'pointer', marginLeft: 4 }}
                    >
                      {captionExpanded ? 'See less' : 'See more'}
                    </span>
                  )}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Right panel — posting details (overlay, doesn't push center) */}
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: 300, zIndex: 30,
          transform: focusMode ? 'translateX(100%)' : 'translateX(0)',
          overflow: 'hidden',
          background: white, borderLeft: `1px solid ${dark8}`,
          boxShadow: focusMode ? 'none' : '-4px 0 24px rgba(0,0,0,0.08)',
          transition: 'transform 0.3s ease',
        }}>
          <div style={{ width: 300, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            {/* Segment control: Feedback / Edit */}
            <div style={{ padding: '12px 16px', flexShrink: 0, borderBottom: `1px solid ${dark8}` }}>
              <div style={{ display: 'flex', background: dark4, borderRadius: 8, padding: 2 }}>
                {([['comment', 'Feedback', MessageChat01], ['edit', 'Edit', Edit3]] as const).map(([t, label, TabIcon]) => {
                  const disabled = t === 'edit' && isAwaitingClient;
                  const tabColor = disabled ? dark15 : rightTab === t ? dark90 : dark60;
                  return (
                  <button key={t} disabled={disabled} onClick={() => !disabled && setRightTab(t)} style={{
                    flex: 1, padding: '6px 0', border: 'none', borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    fontSize: 13, fontWeight: 500, fontFamily: F,
                    background: rightTab === t ? white : 'transparent',
                    color: tabColor,
                    boxShadow: rightTab === t ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s',
                  }}><TabIcon size={15} color={tabColor} />{label}</button>
                  );
                })}
              </div>
            </div>

            {rightTab === 'edit' ? (
            <div style={{ flex: 1, padding: '20px 16px', overflowY: 'auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Posting on */}
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 11, color: dark40, fontFamily: F, letterSpacing: '0.22px' }}>Posting on</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: dark90, fontFamily: F, flex: 1 }}>{post.date}</p>
                <button style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke={dark40} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>

            {/* Posting to */}
            <div>
              <p style={{ margin: '0 0 10px', fontSize: 11, color: dark40, fontFamily: F, letterSpacing: '0.22px' }}>Posting to</p>
              {[
                { name: 'Instagram', platform: 'instagram', connected: false },
                { name: 'Facebook', platform: 'facebook', connected: true },
                { name: 'LinkedIn', platform: 'linkedin', connected: true },
                { name: 'X/Twitter', platform: 'x', connected: true },
                { name: 'Google Business', platform: 'google', connected: true },
              ].map(acct => (
                <div key={acct.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <SocialIcon platform={acct.platform} active={acct.connected} />
                  <span style={{ fontSize: 13, color: dark90, fontFamily: F, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acct.name}</span>
                  {acct.connected
                    ? <div style={{ width: 18, height: 18, borderRadius: 99, background: dark4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke={dark40} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                    : <Button variant="secondary" size="xs" onPress={() => {}}>Connect</Button>
                  }
                </div>
              ))}
            </div>

            {/* Campaign */}
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 11, color: dark40, fontFamily: F, letterSpacing: '0.22px' }}>Campaign</p>
              <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 500, color: dark90, fontFamily: F }}>Spring Exterior Refresh</p>
              <p style={{ margin: 0, fontSize: 12, color: dark60, fontFamily: F }}>🏡 Home Services Content</p>
            </div>

            {/* Quick Edits */}
            <div>
              <p style={{ margin: '0 0 10px', fontSize: 11, color: dark40, fontFamily: F, letterSpacing: '0.22px' }}>Quick Edits</p>
              {[
                {
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={dark60} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={dark60} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                  label: 'Adjust caption',
                },
                {
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={dark60} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={dark60} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                  label: 'Change design elements',
                },
                {
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke={dark60} strokeWidth="1.5"/><rect x="14" y="3" width="7" height="7" rx="1" stroke={dark60} strokeWidth="1.5"/><rect x="3" y="14" width="7" height="7" rx="1" stroke={dark60} strokeWidth="1.5"/><rect x="14" y="14" width="7" height="7" rx="1" stroke={dark60} strokeWidth="1.5"/></svg>,
                  label: 'Add more in Designer',
                },
              ].map(item => (
                <button key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 4 }}>
                  {item.icon}
                  <span style={{ fontSize: 13, color: dark90, fontFamily: F }}>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Redesign */}
            <div>
              <p style={{ margin: '0 0 10px', fontSize: 11, color: dark40, fontFamily: F, letterSpacing: '0.22px' }}>Redesign</p>
              {[
                { icon: '↻', label: 'Regenerate Design', sub: 'Blaze will generate new design' },
                { icon: '🖼', label: 'Replace with Image', sub: 'Swap design with your own' },
              ].map(item => (
                <button key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 8, textAlign: 'left' }}>
                  <span style={{ fontSize: 16, lineHeight: 1.2 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, color: dark90, fontFamily: F }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: dark40, fontFamily: F }}>{item.sub}</div>
                  </div>
                </button>
              ))}
            </div>
            </div>
            ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {/* Comment panel — conversation thread */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {thread.length === 0 && (
                  <p style={{ margin: 0, fontSize: 13, color: dark40, fontFamily: F, textAlign: 'center', padding: '24px 0', lineHeight: 1.5 }}>
                    No feedback yet.
                  </p>
                )}
                {thread.map(m => {
                  if (m.system) {
                    return (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '2px 0' }}>
                        <div style={{ flex: 1, height: 1, background: dark8 }} />
                        <span style={{ fontSize: 11, color: dark40, fontFamily: F, whiteSpace: 'nowrap' }}>✓ {m.text}</span>
                        <div style={{ flex: 1, height: 1, background: dark8 }} />
                      </div>
                    );
                  }
                  const isClient = m.author === 'client';
                  const name = isClient ? 'Client' : AGENCY_NAME;
                  const avatar = isClient ? IMG_AVATAR : AGENCY_AVATAR;
                  return (
                    <div key={m.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 99, overflow: 'hidden', flexShrink: 0 }}>
                        <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: dark90, fontFamily: F }}>{name}</span>
                          <span style={{ fontSize: 11, color: dark40, fontFamily: F }}>{m.time}</span>
                        </div>
                        <div style={{
                          fontSize: 13, color: dark80, fontFamily: F, lineHeight: 1.5,
                          background: isClient ? dark4 : 'rgba(124,92,252,0.08)',
                          borderRadius: 8, padding: '8px 10px', whiteSpace: 'pre-wrap',
                        }}>{m.text}</div>
                      </div>
                    </div>
                  );
                })}
                {!isInternal && thread[thread.length - 1]?.author === 'client' && (
                  <p style={{ margin: '0 0 0 38px', fontSize: 11, color: dark40, fontFamily: F, lineHeight: 1.5 }}>
                    {status === 'declined'
                      ? 'Your feedback is sent to the team.'
                      : "Your feedback is sent to the team. They'll get back to you shortly."}
                  </p>
                )}
              </div>
              {/* Composer */}
              {showComposer && (isInternal ? (
              /* Staff — resubmit composer */
              <div style={{ flexShrink: 0, borderTop: `1px solid ${dark8}`, padding: '12px 16px 16px' }}>
                <div style={{ border: `1px solid ${dark15}`, borderRadius: 8, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <textarea
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    placeholder="Add a note for the client — optional"
                    rows={3}
                    style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', fontSize: 13, color: dark90, fontFamily: F, lineHeight: 1.5, boxSizing: 'border-box', background: 'transparent' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="green" size="sm" frontIcon={Check2} onPress={resubmitWithComment}>
                      Resubmit to client
                    </Button>
                  </div>
                </div>
                <p style={{ margin: '8px 2px 0', fontSize: 11, color: dark40, fontFamily: F, lineHeight: 1.5 }}>
                  Make sure you've updated the content before resubmitting.
                </p>
              </div>
              ) : (
              /* Client — feedback intent selector */
              <div style={{ flexShrink: 0, borderTop: `1px solid ${dark8}`, padding: '14px 16px 16px' }}>
                <p style={{ margin: '0 0 8px', fontSize: 11, color: dark40, fontFamily: F, letterSpacing: '0.22px' }}>I want to</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  {([
                    { value: 'request', title: 'Request changes', sub: 'Ask for revisions before approving', Icon: ArrowCurveLeftDown },
                    { value: 'decline', title: 'Decline this post', sub: "This isn't the right direction", Icon: XCircleContained },
                  ] as const).map(opt => {
                    const sel = feedbackMode === opt.value;
                    return (
                      <button key={opt.value} onClick={() => setFeedbackMode(opt.value)} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left',
                        padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                        border: `1.5px solid ${sel ? dark90 : dark8}`,
                        background: sel ? dark4 : white, transition: 'all 0.15s',
                      }}>
                        <span style={{ marginTop: 1, flexShrink: 0, display: 'flex' }}>
                          <opt.Icon size={18} color={sel ? dark90 : dark40} />
                        </span>
                        <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: dark90, fontFamily: F }}>{opt.title}</span>
                          <span style={{ fontSize: 12, color: dark60, fontFamily: F }}>{opt.sub}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p style={{ margin: '0 0 6px', fontSize: 12, color: dark60, fontFamily: F }}>
                  {feedbackMode === 'decline' ? 'Reason (optional)' : 'Comment (optional)'}
                </p>
                <textarea
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  placeholder={feedbackMode === 'decline' ? 'Help the team understand why…' : 'What needs to change?'}
                  rows={3}
                  style={{ width: '100%', resize: 'none', boxSizing: 'border-box', border: `1px solid ${dark15}`, borderRadius: 8, padding: '10px 12px', fontSize: 13, color: dark90, fontFamily: F, lineHeight: 1.5, outline: 'none', marginBottom: 12 }}
                />
                <p style={{ margin: '0 0 10px', fontSize: 11, color: dark40, fontFamily: F, lineHeight: 1.5 }}>
                  {feedbackMode === 'decline'
                    ? 'The team will be notified. No further revisions will be requested.'
                    : 'The team will be notified and can submit a revised version for your review.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="primary" size="sm" onPress={submitClientFeedback}>
                    {feedbackMode === 'decline' ? 'Decline post' : 'Send change request'}
                  </Button>
                </div>
              </div>
              ))}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch" aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: 40, height: 24, borderRadius: 99, border: 'none', padding: 2,
        background: on ? dark90 : dark15,
        cursor: 'pointer', flexShrink: 0, position: 'relative',
        transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 19 : 3,
        width: 18, height: 18, borderRadius: 99, background: white,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left 0.2s',
        display: 'block',
      }} />
    </button>
  );
}

// ── Approval Settings modal ───────────────────────────────────────────────────
const CONTENT_TYPES = [
  { key: 'campaigns',  label: 'Organic Campaigns',           desc: 'Scheduled social posts across all connected platforms.',   defaultOn: false },
  { key: 'seo-blogs',  label: 'SEO / AEO Blogs',             desc: 'Long-form content published to your website or blog.',     defaultOn: false },
  { key: 'reputation', label: 'Reputation',                  desc: 'Review responses and reputation management content.',      defaultOn: true  },
  { key: 'paid-ads',   label: 'Paid Ads',                    desc: 'Search and display ad copy before going to ad networks.',  defaultOn: true  },
  { key: 'paid-social',label: 'Paid Search',                 desc: 'Google Search ad copy before going live on search networks.',        defaultOn: true },
];

function TurnOffConfirmModal({ close, onConfirm }: { close: () => void; onConfirm: () => void }) {
  return (
    <Modal.Root size="sm" onClose={close}>
      <Modal.Header onClose={close}>
        <span style={{ fontSize: 17, fontWeight: 500, color: dark90, fontFamily: F }}>Turn off Approvals?</span>
      </Modal.Header>
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, fontSize: 14, color: dark60, fontFamily: F, lineHeight: 1.65 }}>
            All content types will bypass client review and publish automatically after agent review.
          </p>
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            background: 'rgba(255,174,0,0.1)', border: '1px solid rgba(255,174,0,0.4)',
            borderRadius: 8, padding: '10px 12px',
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
            <p style={{ margin: 0, fontSize: 13, color: '#7a4800', fontFamily: F, lineHeight: 1.55 }}>
              Any content currently awaiting client approval will be auto-approved and scheduled to post.
            </p>
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="secondary" onPress={close}>Cancel</Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={() => { onConfirm(); close(); }}>Turn Off</Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function ApprovalSettingsModal({ close }: { close: () => void }) {
  const { openModal } = useModals();
  const [approvalsOn, setApprovalsOn] = useState(true);
  const [types, setTypes] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CONTENT_TYPES.map(t => [t.key, t.defaultOn]))
  );

  const handleMasterToggle = (val: boolean) => {
    if (!val) {
      openModal(TurnOffConfirmModal, { onConfirm: () => setApprovalsOn(false) });
    } else {
      setApprovalsOn(true);
    }
  };

  const clientRequiredCount = Object.values(types).filter(Boolean).length;

  return (
    <Modal.Root size="sm" onClose={close}>
      <Modal.Header onClose={close}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 17, fontWeight: 500, color: dark90, fontFamily: F }}>Approval Settings</span>
          <span style={{ fontSize: 13, color: dark60, fontFamily: F, lineHeight: 1.5 }}>
            Control which content types require client sign-off before publishing.
          </span>
        </div>
      </Modal.Header>
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* Master toggle */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingBottom: 16 }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: dark90, fontFamily: F }}>Approvals</p>
              <p style={{ margin: 0, fontSize: 13, color: dark60, fontFamily: F, lineHeight: 1.55 }}>
                Require client sign-off before content goes live. When off, agent-reviewed content publishes automatically.
              </p>
            </div>
            <Toggle on={approvalsOn} onChange={handleMasterToggle} />
          </div>

          {/* Per-type list — only when approvals is on */}
          {approvalsOn && (
            <>
              <div style={{ height: 1, background: dark8, margin: '0 0 16px' }} />
              <div style={{ paddingLeft: 20, borderLeft: `2px solid ${dark8}` }}>
              <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 500, color: dark40, fontFamily: F, letterSpacing: '0.8px' }}>
                Approval required per content type
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {CONTENT_TYPES.map((ct, i) => (
                  <div key={ct.key} style={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
                    paddingTop: i === 0 ? 0 : 14, paddingBottom: 14,
                    borderBottom: i < CONTENT_TYPES.length - 1 ? `1px solid ${dark8}` : 'none',
                  }}>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 400, color: dark90, fontFamily: F }}>
                        {ct.label}
                      </p>
                      <p style={{ margin: '0 0 6px', fontSize: 12, color: dark60, fontFamily: F, lineHeight: 1.5 }}>{ct.desc}</p>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 99,
                        fontSize: 11, fontFamily: F,
                        background: types[ct.key] ? 'rgba(32,161,79,0.08)' : dark4,
                        color: types[ct.key] ? green : dark60,
                        border: `1px solid ${types[ct.key] ? 'rgba(32,161,79,0.25)' : dark15}`,
                      }}>
                        {types[ct.key] ? 'Client approval required' : 'Agent review only'}
                      </span>
                    </div>
                    <Toggle on={types[ct.key]} onChange={v => setTypes(prev => ({ ...prev, [ct.key]: v }))} />
                  </div>
                ))}
              </div>
              </div>
            </>
          )}
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <span style={{ fontSize: 12, color: dark60, fontFamily: F }}>
            {approvalsOn
              ? `${clientRequiredCount} of ${CONTENT_TYPES.length} content types require client approval`
              : 'Approvals disabled — all content publishes automatically'}
          </span>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={close}>Save settings</Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ── Celebration modal ─────────────────────────────────────────────────────────
interface CelebrationModalProps {
  close: () => void; index: number; isOpen?: boolean;
  campaignName?: string; postCount?: number; dateRange?: string;
}

function CelebrationModal({ close, campaignName = 'Campaign', postCount = 0, dateRange = '' }: CelebrationModalProps) {
  return (
    <Modal.Root size="sm" onClose={close}>
      <Modal.Header onClose={close}>
        <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
          <div style={{
            width:48, height:48, borderRadius:99,
            background:green10,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke={green} strokeWidth="1.6"/>
              <path d="M8 12.5l2.5 2.5 5-5.5" stroke={green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize:22, fontWeight:500, color:dark90, fontFamily:F, lineHeight:1.2 }}>
            You're all set!
          </span>
        </div>
      </Modal.Header>

      <Modal.Content>
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <p style={{ margin:0, fontSize:15, fontWeight:400, color:dark60, fontFamily:F, lineHeight:1.65, letterSpacing:'0.3px' }}>
            <strong style={{ color:dark90, fontWeight:500 }}>{campaignName}</strong> has been approved and ready to publish. Your posts will go live according to their scheduled times for the accounts that you have connected.
          </p>
          <div style={{
            display:'flex', alignItems:'center', gap:24,
            padding:'14px 20px', background:dark2, borderRadius:10,
            border:`1px solid ${dark4}`,
          }}>
            <div>
              <div style={{ fontSize:11, color:dark40, fontFamily:F, letterSpacing:'0.22px', marginBottom:2 }}>Campaign</div>
              <div style={{ fontSize:14, fontWeight:500, color:dark90, fontFamily:F, maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{campaignName}</div>
            </div>
            <div style={{ width:1, height:32, background:dark8 }} />
            <div>
              <div style={{ fontSize:11, color:dark40, fontFamily:F, letterSpacing:'0.22px', marginBottom:2 }}>Schedule</div>
              <div style={{ fontSize:14, fontWeight:500, color:dark90, fontFamily:F }}>{dateRange}</div>
            </div>
            <div style={{ width:1, height:32, background:dark8 }} />
            <div>
              <div style={{ fontSize:11, color:dark40, fontFamily:F, letterSpacing:'0.22px', marginBottom:2 }}>Posts approved</div>
              <div style={{ fontSize:14, fontWeight:500, color:green, fontFamily:F }}>{postCount} posts</div>
            </div>
          </div>
        </div>
      </Modal.Content>

      <Modal.Footer>
        <Modal.FooterContent slot="right">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Modal.FooterButton variant="secondary" onPress={close}>
              View Calendar
            </Modal.FooterButton>
            <Modal.FooterButton variant="primary" onPress={close}>
              Done
            </Modal.FooterButton>
          </div>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ── Internal status pill ──────────────────────────────────────────────────────
type InternalStatus = 'internalReview' | 'readyForClient';

function InternalStatusPill({ status }: { status: InternalStatus }) {
  const cfg = status === 'readyForClient'
    ? { bg: white, overlay: 'rgba(32,161,79,0.1)', border: 'rgba(32,161,79,0.25)', color: green, label: 'In client review' }
    : { bg: white, overlay: 'rgba(106,0,255,0.08)', border: 'rgba(106,0,255,0.2)', color: '#6a00ff', label: 'Internal Review' };
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', padding:'2px 6px', borderRadius:4,
      backgroundColor: cfg.bg,
      backgroundImage: `linear-gradient(${cfg.overlay}, ${cfg.overlay})`,
      border: `1px solid ${cfg.border}`,
      fontSize:11, fontWeight:400, color:cfg.color, fontFamily:F,
      letterSpacing:'0.22px', whiteSpace:'nowrap',
    }}>{cfg.label}</span>
  );
}

// ── Local SEO card ────────────────────────────────────────────────────────────
const GoogleG = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function LocalSEOCard({
  post, internalStatus, onMarkReady, onReview,
  mode = 'internal', clientStatus, onApprove, onRemoveApproval,
}: {
  post: Post; internalStatus: InternalStatus;
  onMarkReady: () => void; onReview: () => void;
  mode?: 'internal' | 'client';
  clientStatus?: Status; onApprove?: () => void; onRemoveApproval?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isReady    = internalStatus === 'readyForClient';
  const isApproved = clientStatus === 'approved';
  const dimmed     = mode === 'client' ? isApproved : isReady;
  const CARD_H = 378;

  return (
    <div
      style={{
        position: 'relative', width: 245, height: CARD_H, flexShrink: 0,
        background: dark2, border: `1px solid ${dark4}`, borderRadius: 10,
        overflow: 'hidden', cursor: 'pointer',
        opacity: dimmed ? 0.65 : 1, transition: 'opacity 0.2s',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div style={{ height: 36, display: 'flex', alignItems: 'center', gap: 4, padding: '12px 12px 2px', flexShrink: 0 }}>
        {GoogleG}
        <span style={{ fontSize: 12, color: dark60, fontFamily: F, flex: 1, letterSpacing: '0.24px' }}>Business Profile</span>
        <span style={{ fontSize: 11, color: dark40, fontFamily: F, letterSpacing: '0.22px', whiteSpace: 'nowrap' }}>{post.date}</span>
      </div>

      {/* Caption + Learn more + image */}
      <div style={{ flex: 1, padding: '0 10px 10px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: white, borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '10px 12px 6px', flexShrink: 0 }}>
            <p style={{ margin: '0 0 6px', fontSize: 12, color: dark80, fontFamily: F, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
              {post.caption}
            </p>
            <span style={{ fontSize: 12, color: '#1a73e8', fontFamily: F, fontWeight: 500 }}>Learn more →</span>
          </div>
          <div style={{ flex: 1, position: 'relative', background: '#c8c0b4', overflow: 'hidden' }}>
            {post.img && <img src={post.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
          </div>
        </div>
      </div>

      {/* Status pill — bottom left */}
      <div style={{ position: 'absolute', bottom: 10, left: 12, zIndex: 5 }}>
        {mode === 'internal'
          ? <InternalStatusPill status={internalStatus} />
          : <StatusPill status={clientStatus ?? 'pending'} viewerMode="client" />}
      </div>

      {/* Hover overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', opacity: hovered ? 1 : 0, transition: 'opacity 0.18s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, pointerEvents: hovered ? 'all' : 'none' }}>
        <div style={{ transform: hovered ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(4px)', transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {mode === 'internal' ? (
            <>
              <Button variant="green" size="sm" frontIcon={Check2} onClick={(e) => { e.stopPropagation(); onMarkReady(); }}>
                Ready for Client
              </Button>
              <Button variant="secondary" size="sm" frontIcon={EyeOpen} onClick={(e) => { e.stopPropagation(); onReview(); }}>
                Review
              </Button>
            </>
          ) : (
            <>
              {!isApproved && (
                <Button variant="green" size="sm" frontIcon={Check2} onClick={(e) => { e.stopPropagation(); onApprove?.(); }}>
                  Approve
                </Button>
              )}
              {isApproved && (
                <Button variant="secondary" size="sm" frontIcon={ApprovalsIcon} onClick={(e) => { e.stopPropagation(); onRemoveApproval?.(); }}>
                  Remove approval
                </Button>
              )}
              <Button variant="secondary" size="sm" frontIcon={EyeOpen} onClick={(e) => { e.stopPropagation(); onReview(); }}>
                Review
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Internal content card ─────────────────────────────────────────────────────
function InternalCard({
  post, internalStatus, onMarkReady, onUndo, onReview, onEdit, isPast,
  returnedByClient, approvedByClient, dontPostReasons, onResubmit, pastClientStatus, clientStatus,
}: {
  post: Post; internalStatus: InternalStatus; isPast?: boolean;
  onMarkReady: () => void; onUndo: () => void; onReview: () => void; onEdit?: () => void;
  returnedByClient?: boolean;
  approvedByClient?: boolean;
  dontPostReasons?: string[];
  onResubmit?: (note: string) => void;
  pastClientStatus?: Status;
  clientStatus?: Status;
}) {
  const [hovered, setHovered] = useState(false);
  const isReady = internalStatus === 'readyForClient';

  // Reputation posts render as vertical grid cards (3-4 per row)
  const isReputation = post.type === 'review' || post.type === 'comment';
  if (isReputation) {
    return (
      <ReputationCard
        post={post}
        internalStatus={internalStatus}
        onMarkReady={onMarkReady}
        onReview={onEdit ?? onReview}
      />
    );
  }

  // Paid search ads render as vertical grid cards
  if (post.type === 'paid-search-ad') {
    return (
      <PaidSearchCard
        post={post}
        internalStatus={internalStatus}
        onMarkReady={onMarkReady}
        onReview={onEdit ?? onReview}
      />
    );
  }

  // Local SEO posts
  if (post.type === 'local-seo') {
    return (
      <LocalSEOCard
        post={post}
        internalStatus={internalStatus}
        onMarkReady={onMarkReady}
        onReview={onReview}
      />
    );
  }

  const isBlog  = post.type === 'blog';
  const isPortrait = post.type === 'story' || post.type === 'short' || post.type === 'feed-video';
  const isLandscape = post.type === 'still' || post.type === 'carousel';

  const CARD_H   = 378;
  const HEADER_H = 36;

  return (
    <div
      style={{
        position:'relative', width:245, height:CARD_H, flexShrink:0,
        background:dark2, border:`1px solid ${dark4}`, borderRadius:10,
        overflow:'hidden', cursor:'pointer',
        opacity: returnedByClient ? 1 : isReady ? 0.65 : 1, transition:'opacity 0.2s',
        display:'flex', flexDirection:'column',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div style={{ height:HEADER_H, display:'flex', alignItems:'center', gap:4, padding:'12px 12px 2px', flexShrink:0 }}>
        <TypeIcon type={post.type} size={14} />
        <span style={{ fontSize:12, color:dark60, fontFamily:F, flex:1, letterSpacing:'0.24px' }}>{TYPE_LABEL[post.type]}</span>
        <span style={{ fontSize:11, color:dark40, fontFamily:F, letterSpacing:'0.22px', whiteSpace:'nowrap' }}>{post.date}</span>
      </div>

      {isBlog ? (
        <div style={{ flex:1, padding:'0 10px 32px', display:'flex', flexDirection:'column' }}>
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:white, borderRadius:8, boxShadow:'0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ height:126, flexShrink:0, background:'#c8c0b4', overflow:'hidden', borderRadius:'8px 8px 0 0' }}>
              {post.img && <img src={post.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
            </div>
            <div style={{ flex:1, padding:'10px 12px 10px', overflow:'hidden', display:'flex', flexDirection:'column', gap:5 }}>
              <p style={{ margin:0, fontSize:16, fontWeight:400, color:dark90, fontFamily:F, lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:4, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>{post.caption}</p>
              <p style={{ margin:0, fontSize:11, color:dark40, fontFamily:F }}>July 8, 2025</p>
              <p style={{ margin:0, fontSize:12, color:dark60, fontFamily:F, lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:6, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>A fresh coat of paint is one of the highest-return improvements you can make to your home — protecting siding and trim from the Texas sun while instantly lifting curb appeal.</p>
            </div>
          </div>
        </div>
      ) : isPortrait ? (
        /* ── Portrait 9:16 — fit to frame height, centered, 9:16 leaves side space ── */
        <div style={{ flex:1, minHeight:0, padding:'6px 10px 10px', display:'flex', justifyContent:'center', overflow:'hidden' }}>
          <div style={{ position:'relative', height:'100%', aspectRatio:'9/16', borderRadius:8, overflow:'hidden', background:'#1a1a1a' }}>
            {post.img && <img src={post.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
            {post.type === 'feed-video' && (
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ width:44, height:44, borderRadius:99, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="14" height="16" viewBox="0 0 16 18" fill="white"><path d="M2 2L14 9L2 16V2Z"/></svg>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : isLandscape ? (
        <div style={{ flex:1, padding:'0 10px 10px', display:'flex', flexDirection:'column' }}>
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:white, borderRadius:8, boxShadow:'0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ padding:'10px 12px 8px', flexShrink:0 }}>
              <p style={{ margin:0, fontSize:12, color:dark80, fontFamily:F, lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>
                {post.caption}{post.caption.length > 55 && <span style={{ color:dark40 }}> ...mo...</span>}
              </p>
            </div>
            <div style={{ flex:1, position:'relative', background:'#c8c0b4', overflow:'hidden' }}>
              {post.img && <img src={post.img} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
              {post.type === 'carousel' && post.slides && (
                <div style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,0.55)', borderRadius:4, padding:'2px 6px', display:'flex', alignItems:'center', gap:3 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="2" stroke="white" strokeWidth="1.6"/><path d="M2 7v10M22 7v10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
                  <span style={{ fontSize:10, color:'white', fontFamily:F }}>{post.slides}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ── Email / other — white inner card: headline + image + body ── */
        <div style={{ flex:1, padding:'0 10px 32px', display:'flex', flexDirection:'column' }}>
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:white, borderRadius:8, boxShadow:'0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ padding:'10px 12px 8px', flexShrink:0 }}>
              <p style={{ margin:0, fontSize:13, fontWeight:500, color:dark90, fontFamily:F, lineHeight:1.4, textAlign:'center', display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>{post.caption}</p>
            </div>
            <div style={{ height:110, flexShrink:0, background:'#c8c0b4', overflow:'hidden' }}>
              {post.img && <img src={post.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
            </div>
            <div style={{ flex:1, padding:'8px 12px 10px', overflow:'hidden' }}>
              <p style={{ margin:0, fontSize:11, color:dark60, fontFamily:F, lineHeight:1.55, letterSpacing:'0.22px', display:'-webkit-box', WebkitLineClamp:7, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>
                A fresh coat of paint is one of the highest-return improvements you can make to your home — protecting siding and trim from the Texas sun while instantly lifting curb appeal. The secret is in the prep: power-washing, scraping, sanding, and caulking every surface before the first coat is what makes a CertaPro finish last for years, not months.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status pill */}
      <div style={{ position:'absolute', bottom:10, left:12, zIndex:5 }}>
        {isPast && pastClientStatus !== undefined
          ? <StatusPill status={pastClientStatus} dontPostReasons={dontPostReasons} isPast />
          : returnedByClient
            ? <StatusPill status={clientStatus === 'declined' ? 'declined' : 'rejected'} dontPostReasons={dontPostReasons} />
            : approvedByClient
              ? <StatusPill status="approved" />
              : <InternalStatusPill status={internalStatus} />}
      </div>

      {/* Hover overlay */}
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.35)', opacity:hovered?1:0, transition:'opacity 0.18s', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, pointerEvents:hovered?'all':'none' }}>
        <div style={{ transform:hovered?'scale(1) translateY(0)':'scale(0.9) translateY(4px)', transition:'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
          {isPast ? (
            <Button variant="secondary" size="sm" frontIcon={EyeOpen} onClick={(e) => { e.stopPropagation(); onReview(); }}>
              View
            </Button>
          ) : returnedByClient ? (
            <Button variant="secondary" size="sm" frontIcon={EyeOpen}
              onClick={(e) => { e.stopPropagation(); onReview(); }}>
              Review
            </Button>
          ) : approvedByClient ? (
            <Button variant="secondary" size="sm" frontIcon={EyeOpen} onClick={(e) => { e.stopPropagation(); onReview(); }}>
              Review
            </Button>
          ) : (
            <>
              <Button
                variant={isReady ? 'secondary' : 'green'}
                size="sm"
                frontIcon={isReady ? ApprovalsIcon : Check2}
                onClick={(e) => { e.stopPropagation(); isReady ? onUndo() : onMarkReady(); }}
              >
                {isReady ? 'Undo' : 'Ready for Client'}
              </Button>
              <Button variant="secondary" size="sm" frontIcon={EyeOpen} onClick={(e) => { e.stopPropagation(); onReview(); }}>
                Review
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Internal campaign section (proper component so useState works) ───────────
function InternalCampaignSection({
  campaign, internalStatuses, statuses, dontPostReasons, today, isPast: isPastProp,
  onMarkReady, onUndo, onMarkAllReady, onReview, onEdit, onResubmit,
  defaultCollapsed,
}: {
  campaign: Campaign;
  internalStatuses: Record<number, InternalStatus>;
  statuses: Record<number, Status>;
  dontPostReasons: Record<number, string[]>;
  today: string;
  isPast?: boolean;
  onMarkReady: (id: number) => void;
  onUndo: (id: number) => void;
  onMarkAllReady: () => void;
  onReview: (post: Post) => void;
  onEdit: (post: Post) => void;
  onResubmit: (id: number, note: string) => void;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed ?? false);
  const [returnedCollapsed, setReturnedCollapsed] = useState(false);
  const [approvedCollapsed, setApprovedCollapsed] = useState(false);

  const posts = campaign.posts;
  const isReturned    = (p: Post) => (statuses[p.id] === 'rejected' || statuses[p.id] === 'declined') && internalStatuses[p.id] === 'readyForClient';
  const isApproved    = (p: Post) => statuses[p.id] === 'approved'  && internalStatuses[p.id] === 'readyForClient';
  const returnedPosts      = posts.filter(isReturned);
  const approvedByClient   = posts.filter(isApproved);
  const activePosts        = posts.filter(p => !isReturned(p) && !isApproved(p));
  const readyCount  = activePosts.filter(p => internalStatuses[p.id] === 'readyForClient').length;
  const totalCount  = activePosts.length;
  const allReady    = totalCount > 0 && readyCount === totalCount;
  const isPastCamp  = isPastProp ?? campaign.endDate < today;
  const cardGrid = (children: React.ReactNode) =>
    <div style={{ display:'flex', flexWrap:'wrap', gap:18 }}>{children}</div>;


  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Campaign header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', width:20, height:20, border:'none', background:'transparent', cursor:'pointer', padding:0, flexShrink:0 }}
            aria-label={collapsed ? 'Expand campaign' : 'Collapse campaign'}
          >
            {collapsed ? <ChevronRight size={16} color={dark40} /> : <ChevronDown size={16} color={dark40} />}
          </button>
          <span style={{ fontSize:18, fontWeight:400, color:dark80, fontFamily:F, letterSpacing:'-0.36px' }}>{campaign.name}</span>
          <span style={{ fontSize:14, color:dark60, fontFamily:F }}>{campaign.dateRange}</span>
          <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:dark2, borderRadius:4, padding:'2px 6px', fontSize:12, color:dark90, fontFamily:F }}>
            <BadgeIcon badge={campaign.badge} />
            {campaign.badge}
          </span>
          <button style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8, border:'none', background:'transparent', cursor:'pointer', padding:0 }}>
            <ArrowRight size={16} color={dark60} />
          </button>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {isPastCamp ? (
            <span style={{ fontSize:12, color:dark60, fontFamily:F }}>{posts.length} posts</span>
          ) : (() => {
            const clientRejectedCount = posts.filter(p => statuses[p.id] === 'rejected' || statuses[p.id] === 'declined').length;
            const clientApprovedCount = posts.filter(p => statuses[p.id] === 'approved').length;
            const hasClientFeedback = clientRejectedCount > 0 || clientApprovedCount > 0;
            return (
              <>
                {/* Total count */}
                <span style={{ fontSize:12, color:dark60, fontFamily:F, whiteSpace:'nowrap' }}>
                  {posts.length} posts
                </span>

                {/* Client feedback counters */}
                {hasClientFeedback && (
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    {clientRejectedCount > 0 && (
                      <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:12, color:red, fontFamily:F, fontWeight:500 }}>
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7" stroke={red} strokeWidth="1.4"/>
                          <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke={red} strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                        {clientRejectedCount}
                      </span>
                    )}
                    {clientApprovedCount > 0 && (
                      <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:12, color:green, fontFamily:F, fontWeight:500 }}>
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7" stroke={green} strokeWidth="1.4"/>
                          <path d="M5 8.5l2 2 4-4" stroke={green} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {clientApprovedCount}
                      </span>
                    )}
                  </div>
                )}

                {/* All Ready for Client */}
                {!allReady && totalCount > 0 && (
                  <>
                    <div style={{ width:1, height:16, background:dark8 }} />
                    <button onClick={onMarkAllReady}
                      style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 8px', borderRadius:8, border:'none', background:'transparent', cursor:'pointer', fontSize:14, fontWeight:400, color:dark90, fontFamily:F }}>
                      <ApprovalsIcon size={15} color={dark90} />
                      All Ready for Client
                    </button>
                  </>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Cards grid */}
      {!collapsed && (
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

          {/* Past campaigns — flat grid with Posted/Don't Post/Failed */}
          {isPastCamp ? (
            cardGrid(posts.map(post => (
              <InternalCard
                key={post.id} post={post}
                internalStatus={internalStatuses[post.id]}
                isPast
                pastClientStatus={statuses[post.id]}
                dontPostReasons={dontPostReasons[post.id]}
                onMarkReady={() => onMarkReady(post.id)}
                onUndo={() => onUndo(post.id)}
                onReview={() => onReview(post)}
                onEdit={() => onEdit(post)}
              />
            )))
          ) : (
          <>
          {/* 1 — Active posts */}
          {activePosts.length > 0 && cardGrid(activePosts.map(post => (
            <InternalCard
              key={post.id} post={post}
              internalStatus={internalStatuses[post.id]}
              onMarkReady={() => onMarkReady(post.id)}
              onUndo={() => onUndo(post.id)}
              onReview={() => onReview(post)}
              onEdit={() => onEdit(post)}
            />
          )))}

          {/* 2 — Returned by Client (below active, full opacity) */}
          {returnedPosts.length > 0 && (
            <div data-returned-section style={{ display:'flex', flexDirection:'column', gap:14, scrollMarginTop:80 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ flex:1, height:1, background:dark8 }} />
                <button
                  onClick={() => setReturnedCollapsed(c => !c)}
                  style={{ display:'flex', alignItems:'center', gap:5, background:'transparent', border:'none', cursor:'pointer', padding:'2px 0', flexShrink:0 }}
                >
                  <svg viewBox="0 0 24 24" fill="none" width="13" height="13">
                    <circle cx="12" cy="12" r="9" stroke={red} strokeWidth="1.5"/>
                    <path d="M9 9l6 6M15 9l-6 6" stroke={red} strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize:12, fontWeight:500, color:red, fontFamily:F, whiteSpace:'nowrap' }}>
                    Returned by client ({returnedPosts.length})
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    style={{ transform: returnedCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition:'transform 0.2s' }}>
                    <path d="M6 9l6 6 6-6" stroke={dark40} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div style={{ flex:1, height:1, background:dark8 }} />
              </div>
              {!returnedCollapsed && cardGrid(returnedPosts.map(post => (
                <InternalCard
                  key={post.id} post={post}
                  internalStatus={internalStatuses[post.id]}
                  returnedByClient clientStatus={statuses[post.id]} isPast={isPastCamp} dontPostReasons={dontPostReasons[post.id]}
                  onMarkReady={() => onMarkReady(post.id)}
                  onUndo={() => onUndo(post.id)}
                  onReview={() => onReview(post)}
                  onEdit={() => onEdit(post)}
                  onResubmit={(note) => onResubmit(post.id, note)}
                />
              )))}
            </div>
          )}

          {/* 3 — Approved by Client (bottom, dimmed, collapsible) */}
          {approvedByClient.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ flex:1, height:1, background:dark8 }} />
                <button
                  onClick={() => setApprovedCollapsed(c => !c)}
                  style={{ display:'flex', alignItems:'center', gap:5, background:'transparent', border:'none', cursor:'pointer', padding:'2px 0', flexShrink:0 }}
                >
                  <svg viewBox="0 0 24 24" fill="none" width="13" height="13">
                    <circle cx="12" cy="12" r="9" stroke={green} strokeWidth="1.5"/>
                    <path d="M8.5 12L11 14.5L15.5 9.5" stroke={green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize:12, fontWeight:500, color:green, fontFamily:F, whiteSpace:'nowrap' }}>
                    Approved by Client ({approvedByClient.length})
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    style={{ transform: approvedCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition:'transform 0.2s' }}>
                    <path d="M6 9l6 6 6-6" stroke={dark40} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div style={{ flex:1, height:1, background:dark8 }} />
              </div>
              {!approvedCollapsed && cardGrid(approvedByClient.map(post => (
                <InternalCard
                  key={post.id} post={post}
                  internalStatus={internalStatuses[post.id]}
                  approvedByClient
                  onMarkReady={() => onMarkReady(post.id)}
                  onUndo={() => onUndo(post.id)}
                  onReview={() => onReview(post)}
                  onEdit={() => onEdit(post)}
                />
              )))}
            </div>
          )}
          </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Merged filter dropdown — content type + status, in one sectioned menu ────
function FilterMenu({
  typeOptions, typeValue, onTypeChange, typeCount,
  statusOptions, statusValue, onStatusChange, statusCount,
  onClear,
}: {
  typeOptions: { label: string; value: string }[];
  typeValue: string;
  onTypeChange: (v: string) => void;
  typeCount: (v: string) => number;
  statusOptions: { label: string; value: string | null }[];
  statusValue: string | null;
  onStatusChange: (v: string | null) => void;
  statusCount: (v: string | null) => number;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const typeLabel = typeOptions.find(o => o.value === typeValue)?.label ?? 'All types';
  const statusLabel = statusOptions.find(o => o.value === statusValue)?.label ?? 'All';
  const typeActive = typeValue !== 'all';
  const statusActive = statusValue !== null;
  const activeCount = (typeActive ? 1 : 0) + (statusActive ? 1 : 0);
  const summary = activeCount === 0
    ? 'Filter'
    : [typeActive ? typeLabel : null, statusActive ? statusLabel : null].filter(Boolean).join(' · ');

  const rowStyle = (selected: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
    padding: '7px 8px', borderRadius: 8, border: 'none',
    background: selected ? dark4 : 'transparent', cursor: 'pointer',
    fontFamily: F, textAlign: 'left',
  });
  const sectionLabelStyle: React.CSSProperties = {
    margin: '0 0 2px', padding: '6px 8px 2px', fontSize: 11, color: dark40,
    fontFamily: F, letterSpacing: '0.22px',
  };
  const renderRow = (
    key: string, label: string, selected: boolean, count: number,
    onClick: () => void, redBadge = false,
  ) => (
    <button key={key} onClick={onClick} style={rowStyle(selected)}>
      <span style={{ fontSize: 14, color: selected ? dark90 : dark80, fontWeight: selected ? 500 : 400, whiteSpace: 'nowrap' }}>{label}</span>
      {redBadge && count > 0
        ? <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 16, height: 16, borderRadius: 99, background: red, color: white, fontSize: 10, fontWeight: 600, padding: '0 5px', lineHeight: 1 }}>{count}</span>
        : <span style={{ fontSize: 11, color: dark40 }}>{count}</span>}
      <span style={{ flex: 1 }} />
      <span style={{ width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: dark90 }}>
        {selected && <Check2 size={15} />}
      </span>
    </button>
  );

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '7px 12px', borderRadius: 8,
          border: `1px solid ${open || activeCount ? dark15 : dark8}`,
          background: white, color: activeCount ? dark90 : dark60,
          fontSize: 14, fontWeight: activeCount ? 500 : 400, fontFamily: F,
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        <span>{summary}</span>
        {activeCount > 0 && (
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 16, height: 16, borderRadius: 99, background: dark90, color: white, fontSize: 10, fontWeight: 600, padding: '0 5px', lineHeight: 1 }}>{activeCount}</span>
        )}
        <ChevronDown />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 60,
          minWidth: 224, background: white, border: `1px solid ${dark8}`,
          borderRadius: 12, boxShadow: '0 10px 32px rgba(0,0,0,0.14)', padding: 6,
        }}>
          <p style={sectionLabelStyle}>Content type</p>
          {typeOptions.map(o => renderRow(o.value, o.label, o.value === typeValue, typeCount(o.value), () => onTypeChange(o.value)))}
          <div style={{ height: 1, background: dark8, margin: '6px 4px' }} />
          <p style={sectionLabelStyle}>Status</p>
          {statusOptions.map(o => renderRow(o.label, o.label, o.value === statusValue, statusCount(o.value), () => onStatusChange(o.value), o.value === 'returned'))}
          {activeCount > 0 && (
            <>
              <div style={{ height: 1, background: dark8, margin: '6px 4px' }} />
              <button onClick={onClear} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 8px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: F, color: dark60, fontSize: 14 }}>
                <span style={{ width: 16, display: 'inline-block' }} />
                Clear all filters
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Inner app (needs ModalStack context) ─────────────────────────────────────
function ApprovalV2Inner() {
  const allPosts = CAMPAIGNS.flatMap(c => c.posts);
  const today = '2026-06-03';
  const { clientView, setClientView } = useClientView();
  const tab: 'internal' | 'client' = clientView ? 'client' : 'internal';
  const [filterBadge, setFilterBadge] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Internal statuses — all start as internalReview (past campaigns pre-mixed)
  const [internalStatuses, setInternalStatuses] = useState<Record<number, InternalStatus>>(() => {
    const initial: Record<number, InternalStatus> = {};
    CAMPAIGNS.forEach(c => {
      const isPast = c.endDate < today;
      c.posts.forEach((p, i) => {
        initial[p.id] = isPast ? (i % 2 === 0 ? 'readyForClient' : 'internalReview') : 'internalReview';
      });
    });
    return initial;
  });

  const [statuses, setStatuses] = useState<Record<number, Status>>(() => {
    const initial: Record<number, Status> = {};
    CAMPAIGNS.forEach(c => {
      const isPast = c.endDate < today;
      c.posts.forEach((p, i) => {
        // Past campaigns: alternate approved / rejected, no pending
        initial[p.id] = isPast ? (i % 2 === 0 ? 'approved' : 'rejected') : 'pending';
      });
    });
    return initial;
  });

  const [reviewPost, setReviewPost] = useState<Post | null>(null);
  const [showFeedbackToast, setShowFeedbackToast] = useState(false);
  const triggerFeedbackToast = () => {
    setShowFeedbackToast(true);
    setTimeout(() => setShowFeedbackToast(false), 3500);
  };
  const [completingCampaignId, setCompletingCampaignId] = useState<number | null>(null);
  const [dontPostReasons, setDontPostReasons] = useState<Record<number, string[]>>({});
  const [resubmitNotes, setResubmitNotes] = useState<Record<number, string>>({});

  // Display status used by the status filter pills
  const TODAY = '2026-06-03';
  const pastPostIds = new Set(CAMPAIGNS.filter(c => c.endDate < TODAY).flatMap(c => c.posts.map(p => p.id)));
  const getDisplayStatus = (id: number): string => {
    if (pastPostIds.has(id)) {
      if (statuses[id] === 'approved') return 'posted';
      if (statuses[id] === 'declined') return 'declined';
      if (statuses[id] === 'rejected') return 'changesRequested';
      return 'failed';
    }
    if (statuses[id] === 'approved') return 'approved';
    if (statuses[id] === 'declined') return 'declined';
    if (statuses[id] === 'rejected') return 'changesRequested';
    if (internalStatuses[id] === 'readyForClient') return 'inClientReview';
    return 'internalReview';
  };
  // 'returned' is a meta-filter matching both changes-requested and declined
  const displayMatches = (ds: string, v: string | null) =>
    v === null ? true : v === 'returned' ? (ds === 'changesRequested' || ds === 'declined') : ds === v;
  const matchesStatus = (id: number) => displayMatches(getDisplayStatus(id), statusFilter);

  const { openModal } = useModals();

  const triggerCelebration = (campaignId: number) => {
    const campaign = CAMPAIGNS.find(c => c.id === campaignId)!;
    setCompletingCampaignId(campaignId);
    setTimeout(() => openModal(CelebrationModal, {
      campaignName: campaign.name,
      postCount:    campaign.posts.length,
      dateRange:    campaign.dateRange,
    }), 150);
    setTimeout(() => setCompletingCampaignId(null), 800);
  };

  const approve = (id: number, campaignId: number) => {
    setStatuses(prev => {
      const next = { ...prev, [id]: 'approved' as Status };
      const campaign = CAMPAIGNS.find(c => c.id === campaignId)!;
      if (campaign.posts.every(p => next[p.id] === 'approved')) triggerCelebration(campaignId);
      return next;
    });
  };

  const removeApproval = (id: number) => {
    setStatuses(prev => ({ ...prev, [id]: 'pending' }));
  };

  const rejectPost = (id: number) => {
    setStatuses(prev => ({ ...prev, [id]: 'rejected' }));
  };
  const declinePost = (id: number) => {
    setStatuses(prev => ({ ...prev, [id]: 'declined' }));
  };

  const resubmitPost = (id: number, note: string) => {
    setStatuses(prev => ({ ...prev, [id]: 'pending' }));
    // Keep the client's original feedback so the V2 thread shows the full conversation.
    // Always record the resubmission (empty string = no note) so the pill can show "Review V2"
    setResubmitNotes(prev => ({ ...prev, [id]: note ?? '' }));
  };

  // Internal handlers
  const markReadyForClient = (id: number) => {
    setInternalStatuses(prev => ({ ...prev, [id]: 'readyForClient' }));
  };
  const undoReady = (id: number) => {
    setInternalStatuses(prev => ({ ...prev, [id]: 'internalReview' }));
  };
  const markAllReadyForClient = (campaign: Campaign) => {
    setInternalStatuses(prev => {
      const next = { ...prev };
      campaign.posts.forEach(p => { next[p.id] = 'readyForClient'; });
      return next;
    });
  };

  const approveAll = (campaign: Campaign) => {
    setStatuses(prev => {
      const next = { ...prev };
      campaign.posts.forEach(p => { next[p.id] = 'approved'; });
      triggerCelebration(campaign.id);
      return next;
    });
  };

  // Header title: Approvals + Settings
  const headerTitle = (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <span style={{ fontSize:16, fontWeight:500, color:dark90, fontFamily:F }}>Approvals</span>
      <Button variant="tertiary" size="sm" frontIcon={Settings} onPress={() => openModal(ApprovalSettingsModal, {})}>Settings</Button>
    </div>
  );

  // ── Filter options + counts (consumed by the topbar FilterMenu) ──
  const STATUS_FILTERS = clientView
    ? [
        { label: 'All', value: null },
        { label: 'Review', value: 'inClientReview' },
        { label: 'Changes requested', value: 'changesRequested' },
        { label: 'Declined', value: 'declined' },
        { label: 'Approved', value: 'approved' },
        { label: 'Posted', value: 'posted' },
        { label: 'Failed', value: 'failed' },
      ]
    : [
        { label: 'All', value: null },
        { label: 'Internal review', value: 'internalReview' },
        { label: 'In client review', value: 'inClientReview' },
        { label: 'Returned by Client', value: 'returned' },
        { label: 'Approved', value: 'approved' },
        { label: 'Posted', value: 'posted' },
        { label: 'Failed', value: 'failed' },
      ];
  const CAMPAIGN_TYPE_OPTIONS = [
    { label: 'All types', value: 'all' },
    { label: 'Organic Campaigns', value: 'Organic Campaigns' },
    { label: 'SEO/AEO', value: 'SEO/AEO' },
    { label: 'Reputation', value: 'Reputation' },
    { label: 'Paid Social', value: 'Paid Social' },
    { label: 'Paid Search', value: 'Paid Search' },
  ];
  // Status counts honor the current type filter + view scope
  const scopedPosts = CAMPAIGNS
    .filter(c => !filterBadge || c.badge === filterBadge)
    .flatMap(c => c.posts)
    .filter(p => !clientView || internalStatuses[p.id] === 'readyForClient');
  const statusCount = (v: string | null) =>
    scopedPosts.filter(p => displayMatches(getDisplayStatus(p.id), v)).length;
  // Type counts honor view scope only (independent of the status filter)
  const typeScopedPosts = CAMPAIGNS
    .flatMap(c => c.posts)
    .filter(p => !clientView || internalStatuses[p.id] === 'readyForClient');
  const typeCount = (v: string) =>
    v === 'all'
      ? typeScopedPosts.length
      : CAMPAIGNS.filter(c => c.badge === v)
          .flatMap(c => c.posts)
          .filter(p => !clientView || internalStatuses[p.id] === 'readyForClient').length;

  const filterMenu = (
    <FilterMenu
      typeOptions={CAMPAIGN_TYPE_OPTIONS}
      typeValue={filterBadge ?? 'all'}
      onTypeChange={v => setFilterBadge(v === 'all' ? null : v)}
      typeCount={typeCount}
      statusOptions={STATUS_FILTERS}
      statusValue={statusFilter}
      onStatusChange={setStatusFilter}
      statusCount={statusCount}
      onClear={() => { setFilterBadge(null); setStatusFilter(null); }}
    />
  );

  return (
    <H2Layout
      title={headerTitle}
      topbarRight={
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, color:dark90, fontFamily:F }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zM5 16l.8 2.2L8 19l-2.2.8L5 22l-.8-2.2L2 19l2.2-.8L5 16z" fill={dark90}/></svg>
            82 Credits
          </span>
          {filterMenu}
          <Button
            variant={clientView ? 'primary' : 'secondary'}
            size="sm"
            frontIcon={EyeOpen}
            onPress={() => { setClientView(!clientView); setStatusFilter(null); }}
          >
            {clientView ? 'Exit client view' : 'View as client'}
          </Button>
        </div>
      }
    >
      {/* Client view banner */}
      {clientView && (
        <div style={{ display:'flex', alignItems:'center', gap:10, background:dark90, color:white, borderRadius:10, padding:'10px 14px', marginBottom:16, fontFamily:F }}>
          <EyeOpen size={16} color={white} />
          <span style={{ fontSize:13, flex:1 }}>
            Viewing as <strong style={{ fontWeight:600 }}>Client</strong> — only content marked ready for client is visible.
          </span>
          <button onClick={() => setClientView(false)} style={{ background:'rgba(255,255,255,0.14)', border:'none', color:white, fontSize:12.5, fontWeight:600, padding:'5px 12px', borderRadius:7, cursor:'pointer', fontFamily:F }}>
            Exit
          </button>
        </div>
      )}

      {tab === 'internal' ? (
        /* ── Internal Review tab ── */
        (() => {
          const SectionHeader = ({ label, count }: { label: string; count: number }) => (
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:13, fontWeight:500, color:dark40, fontFamily:F, letterSpacing:'0.26px', whiteSpace:'nowrap' }}>
                {label} <span style={{ fontWeight:400 }}>({count})</span>
              </span>
              <div style={{ flex:1, height:1, background:dark8 }} />
            </div>
          );

          const isAllReady = (c: Campaign) => c.posts.every(p => internalStatuses[p.id] === 'readyForClient');
          const byBadge = filterBadge ? CAMPAIGNS.filter(c => c.badge === filterBadge) : CAMPAIGNS;
          const filtered = byBadge
            .map(c => ({ ...c, posts: c.posts.filter(p => matchesStatus(p.id)) }))
            .filter(c => c.posts.length > 0);
          const activeCampaigns = filtered.filter(c => c.endDate >= today);
          const pastCampaigns   = filtered.filter(c => c.endDate < today);

          const renderIC = (c: Campaign, opts?: { defaultCollapsed?: boolean; isPast?: boolean }) => (
            <InternalCampaignSection
              key={c.id}
              campaign={c}
              internalStatuses={internalStatuses}
              statuses={statuses}
              dontPostReasons={dontPostReasons}
              resubmitNotes={resubmitNotes}
              today={today}
              isPast={opts?.isPast}
              defaultCollapsed={opts?.defaultCollapsed}
              onMarkReady={markReadyForClient}
              onUndo={undoReady}
              onMarkAllReady={() => markAllReadyForClient(c)}
              onReview={setReviewPost}
              onEdit={(post) => {
                if (post.type === 'review' || post.type === 'comment') openModal(EditAIDraftModal, { post });
                else if (post.type === 'paid-search-ad') openModal(PaidSearchLaunchModal, { post });
                else setReviewPost(post);
              }}
              onResubmit={resubmitPost}
            />
          );

          const readyCampaigns = activeCampaigns.filter(isAllReady);
          const activePending  = activeCampaigns.filter(c => !isAllReady(c));

          return (
            <div style={{ display:'flex', flexDirection:'column', gap:40 }}>
              {activePending.map(c => renderIC(c))}
              {readyCampaigns.length > 0 && (
                <>
                  <SectionHeader label="Ready for Client" count={readyCampaigns.length} />
                  {readyCampaigns.map(c => renderIC(c))}
                </>
              )}
              {pastCampaigns.length > 0 && (
                <>
                  <SectionHeader label="Past campaigns" count={pastCampaigns.length} />
                  {pastCampaigns.map(c => renderIC(c, { defaultCollapsed: true, isPast: true }))}
                </>
              )}
            </div>
          );
        })()
      ) : (
        /* ── Client Approval tab ── */
        (() => {
        const today = '2026-06-03';
        const isAllApproved = (c: Campaign) => c.posts.every(p => statuses[p.id] === 'approved');
        const isPast        = (c: Campaign) => c.endDate < today && !isAllApproved(c);
        const isActive      = (c: Campaign) => !isAllApproved(c) && !isPast(c);

        const filteredClient = filterBadge ? CAMPAIGNS.filter(c => c.badge === filterBadge) : CAMPAIGNS;
        const active   = filteredClient.filter(isActive);
        const approved = filteredClient.filter(isAllApproved);
        const past     = filteredClient.filter(isPast);

        const renderCampaign = (campaign: Campaign, opts?: { defaultCollapsed?: boolean; isPast?: boolean }) => {
          // Only expose posts the internal team has marked Ready for Client
          const visiblePosts = campaign.posts.filter(p => internalStatuses[p.id] === 'readyForClient' && matchesStatus(p.id));
          if (visiblePosts.length === 0) return null;
          const clientCampaign = { ...campaign, posts: visiblePosts };
          return (
            <CampaignSection
              key={campaign.id}
              campaign={clientCampaign}
              statuses={statuses}
              dontPostReasons={dontPostReasons}
              resubmitNotes={resubmitNotes}
              onApprove={(id) => approve(id, campaign.id)}
              onRemoveApproval={removeApproval}
              onReview={(id) => { setReviewPost(campaign.posts.find(p => p.id === id)!); }}
              onApproveAll={() => approveAll(clientCampaign)}
              justCompleted={completingCampaignId === campaign.id}
              defaultCollapsed={opts?.defaultCollapsed}
              isPast={opts?.isPast}
            />
          );
        };

        const SectionHeader = ({ label, count }: { label: string; count: number }) => (
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:13, fontWeight:500, color:dark40, fontFamily:F, letterSpacing:'0.26px', whiteSpace:'nowrap' }}>
              {label} <span style={{ fontWeight:400 }}>({count})</span>
            </span>
            <div style={{ flex:1, height:1, background:dark8 }} />
          </div>
        );

        // Nothing to approve = no active campaign has any readyForClient+pending post
        const hasAnythingToApprove = active.some(c =>
          c.posts.some(p => internalStatuses[p.id] === 'readyForClient' && statuses[p.id] === 'pending')
        );

        return (
          <div style={{ display:'flex', flexDirection:'column', gap:40 }}>
            {/* ── Empty state ── */}
            {!hasAnythingToApprove && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:'40px 0 20px' }}>
                <div style={{ width:56, height:56, borderRadius:99, background:'rgba(32,161,79,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" stroke={green} strokeWidth="1.5"/>
                    <path d="M8 12.5l2.5 2.5 5.5-5.5" stroke={green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p style={{ margin:0, fontSize:22, fontWeight:500, color:dark90, fontFamily:F, textAlign:'center' }}>
                  All Set! Nothing to Approve just yet.
                </p>
                <div style={{ display:'flex', gap:10 }}>
                  <Button variant="secondary" size="sm" frontIcon={CalendarEdit}>Open Campaigns</Button>
                  <Button variant="secondary" size="sm" frontIcon={CalendarEdit}>Go to Calendar</Button>
                </div>
              </div>
            )}

            {/* ── Active campaigns ── */}
            {active.map(renderCampaign)}

            {/* ── Approved section ── */}
            {approved.length > 0 && (
              <>
                <SectionHeader label="Approved" count={approved.length} />
                {approved.map(renderCampaign)}
              </>
            )}

            {/* ── Past (unapproved) section ── */}
            {past.length > 0 && (
              <>
                <SectionHeader label="Past campaigns" count={past.length} />
                {past.map(c => renderCampaign(c, { defaultCollapsed: true, isPast: true }))}
              </>
            )}
          </div>
        );
      })()
      )}

      {/* Full-page review */}
      {reviewPost && (
        <ReviewPage
          post={reviewPost}
          status={statuses[reviewPost.id]}
          allPosts={CAMPAIGNS.flatMap(c => c.posts)}
          allStatuses={statuses}
          onClose={() => setReviewPost(null)}
          onApprove={() => {
            const c = CAMPAIGNS.find(c => c.posts.some(p => p.id === reviewPost.id))!;
            approve(reviewPost.id, c.id);
          }}
          onRemoveApproval={() => removeApproval(reviewPost.id)}
          onDontPost={(reasons) => { rejectPost(reviewPost.id); setDontPostReasons(prev => ({ ...prev, [reviewPost.id]: reasons })); setReviewPost(null); triggerFeedbackToast(); }}
          onRequestChanges={(text) => { rejectPost(reviewPost.id); setDontPostReasons(prev => ({ ...prev, [reviewPost.id]: [...(prev[reviewPost.id] ?? []), text] })); }}
          onDecline={(text) => { declinePost(reviewPost.id); setDontPostReasons(prev => ({ ...prev, [reviewPost.id]: [...(prev[reviewPost.id] ?? []), text || 'Declined'] })); }}
          onNavigate={(id) => setReviewPost(CAMPAIGNS.flatMap(c => c.posts).find(p => p.id === id) ?? null)}
          mode={tab}
          internalStatus={internalStatuses[reviewPost.id]}
          onMarkReady={() => markReadyForClient(reviewPost.id)}
          onUndoReady={() => undoReady(reviewPost.id)}
          onResubmit={(note) => { resubmitPost(reviewPost.id, note); }}
          dontPostReasons={dontPostReasons}
          resubmitNotes={resubmitNotes}
          isPast={CAMPAIGNS.find(c => c.posts.some(p => p.id === reviewPost.id))?.endDate < today}
        />
      )}

      {/* Feedback submitted toast */}
      {showFeedbackToast && createPortal(
        <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
          <Toast variant="success" onDismiss={() => setShowFeedbackToast(false)}>
            Feedback submitted. Agent is notified for revision.
          </Toast>
        </div>,
        document.body
      )}
    </H2Layout>
  );
}

// ── Route ───────────────────────────────────────────────────────────────────
// Cloned from prototypes/approval-v2 (the PR #51 redesign) and adapted for the
// h2 tree: PrototypeShell → H2Layout, local client-view state → shared
// useClientView() context, data re-themed to CertaPro Austin. Wired into the
// H2 sidebar as its own "Approvals" entry (below Home).

/** Surfaced on the Living Doc approvals tile — pending posts in active campaigns. */
export const APPROVAL_PENDING_COUNT = CAMPAIGNS
  .filter(c => c.endDate >= '2026-06-03')
  .flatMap(c => c.posts).length;

export function ClientApprovalsRoute() {
  return (
    <ModalStack>
      <ApprovalV2Inner />
    </ModalStack>
  );
}
