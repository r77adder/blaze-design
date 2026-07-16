import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button, Heading, IconButton, ModalStack, Text, useModals } from '@/components';
import { Avatar, Select, StatusPill, TabChip } from '@/staging';
import ArrowLeft from '@/icons/20/ArrowLeft';
import ArrowUp from '@/icons/20/ArrowUp';
import ArrowDown from '@/icons/20/ArrowDown';
import Search from '@/icons/20/Search';
import Voice from '@/icons/20/Voice';
import MessageText2 from '@/icons/20/MessageText2';
import MessageChat01 from '@/icons/20/MessageChat01';
import Settings from '@/icons/20/Settings';
import MoreDots from '@/icons/20/MoreDots';
import Download from '@/icons/20/Download';
import Document from '@/icons/20/Document';
import { H2Layout } from '../H2Layout';
import { ExportLeadsModal } from '../ExportLeadsModal';
import {
  LEADS_GRID as KIT_LEADS_GRID,
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  DEFAULT_SCOPE,
  applyScope,
  applyFilters,
  sortLeads,
  matchesQuery,
  LeadsToolbar,
  LeadsHeaderRow,
  BookingsToolbar,
  applyBookingScope,
  applyBookingFilters,
  sortBookings,
  matchesBookingQuery,
  monthOptionsFor,
  DEFAULT_BOOKING_SCOPE,
  DEFAULT_BOOKING_FILTERS,
  type BookingScope,
  type BookingFilters,
  type LeadFilters,
  type LeadScope,
  type SortState,
} from '../leads-table-kit';
import type { ComponentType } from 'react';
import { useDevState } from '../dev-state-context';
import { SdrDetail, LeadDetailTitle, LeadDetailNav } from '../SdrDetail';
import { ContactHistory } from '../ContactHistory';
import { OutcomeSelect } from '../BookingOutcomeSelect';
import { SdrColdView } from './ColdViews';
import { SdrSettingsBody } from './SdrSettings';
import {
  SOURCE_LABELS,
  METHOD_LABELS,
  LEADS as RAW_LEADS,
  LEAD_NEEDS_SUMMARY,
  STATUS_STYLES,
  effectiveBookingOutcome,
  avatarColor,
  formatRelative,
  isUnread,
  relativeMinutesAgo,
  truncate,
  type Contact,
  type Lead,
  type Status,
  type BookingOutcome,
} from '../sdr-data';

// Blaze-style focus: on focus the border darkens to var(--dark-40) + a subtle
// ring; on blur it reverts to the default var(--dark-8). Spread onto raw
// inputs whose resting border is var(--dark-8).
const inputFocusProps = {
  onFocus: (e: { currentTarget: HTMLInputElement | HTMLTextAreaElement }) => {
    e.currentTarget.style.borderColor = 'var(--dark-40)';
    e.currentTarget.style.boxShadow = '0 0 0 3px var(--dark-4)';
  },
  onBlur: (e: { currentTarget: HTMLInputElement | HTMLTextAreaElement }) => {
    e.currentTarget.style.borderColor = 'var(--dark-8)';
    e.currentTarget.style.boxShadow = 'none';
  },
};

// ─── Contacts ────────────────────────────────────────────────────────
// One Contact per unique person in the CertaPro re-skin. contact_id is
// injected into each lead via the post-processing step below.

export const CONTACTS: Contact[] = [
  { id: 'c-priya',      name: 'Priya Patel',     phone: '+1 (512) 555-0148', email: 'priya.patel@gmail.com' },
  { id: 'c-david-lin',  name: 'David Lin',        phone: '+1 (512) 555-0193', email: 'd.lin@oakridgehoa.org' },
  { id: 'c-sara-lopez', name: 'Sara Lopez',       phone: '+1 (512) 555-0167', email: 'sara@lopezfamily.net' },
  { id: 'c-carlos',     name: 'Carlos Reyes',     phone: '+1 (512) 555-0142', email: 'carlos@reyeshome.net' },
  { id: 'c-janet',      name: 'Janet Bracken',    phone: '+1 (512) 555-0118', email: 'janet@brackenrealty.com' },
  { id: 'c-sara-bell',  name: 'Sara Bell',        phone: '+1 (512) 555-0144', email: 'sara.bell@gmail.com' },
  { id: 'c-noah',       name: 'Noah Okafor',      phone: '+1 (512) 555-0181', email: 'noah@helmsmanproperties.com' },
  { id: 'c-emily',      name: 'Emily Tran',       phone: '+1 (512) 555-0179', email: 'emily.tran@gmail.com' },
  { id: 'c-david-wu',   name: 'David Wu',         phone: '+1 (512) 555-0192', email: 'd.wu@handyworks.net' },
  { id: 'c-talia',      name: 'Talia Mendez',     phone: '+1 (512) 555-0136', email: 'talia@mendezfam.com' },
  { id: 'c-rohan',      name: 'Rohan Bhatt',      phone: '+1 (512) 555-0118', email: 'rohan@bhattfam.com' },
  { id: 'c-helena',     name: 'Helena Saunders',  phone: '+1 (512) 555-0511', email: 'helena@saundersfam.com' },
  { id: 'c-felix',      name: 'Felix Rosenthal',  phone: '+1 (512) 555-0102', email: 'felix@rosenthalfam.com' },
  { id: 'c-mia',        name: 'Mia Andersson',    phone: '+1 (512) 555-0177', email: 'mia@anderssonfam.com' },
];

// CertaPro Painters of Austin — local re-skin of the imported LEADS for this
// prototype. We keep the underlying shape, scoring, channels, and transcripts
// intact so the inbox + detail UIs render identically — only the business
// content (names, companies, snippets, scorecards, tags, source URLs) changes.
const LEADS_RAW: Lead[] = [
  {
    ...RAW_LEADS[0],
    prospect: {
      ...RAW_LEADS[0].prospect,
      name: 'Priya Patel',
      company: 'Patel Family — Westlake',
      phone: '+1 (512) 555-0148',
      email: 'priya.patel@gmail.com',
      source_url: 'certapro.com/austin/exterior?utm_campaign=spring-exterior',
    },
    factors: ['Explicit budget', 'Owner has authority', 'Q3 deadline'],
    tags: ['Residential', 'Westlake', 'Hot lead 24h'],
    first_touch_source: 'Exterior painting landing page',
    scorecard: {
      budget: '$18–25k confirmed',
      timeline: 'Decide by end of month',
      need: 'Full exterior repaint — peeling on west side',
      decisionMaker: 'Yes — homeowner',
      custom: { 'Square footage': '3,400 sq ft, 2 stories' },
      reasoning: 'Strong fit — explicit budget, owner has authority, timeline this quarter.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Lead captured · Exterior painting landing page', timestamp: 'm:30' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Priya — thanks for reaching out about CertaPro's exterior painting. I see you mentioned a 3,400 sq ft Westlake home and noticed peeling on the west side. Quick question to send the right estimate: is this the first repaint since you bought, or has it been painted recently?", timestamp: 'm:29' },
      { id: 't3', role: 'prospect', type: 'text', content: "Last painted about 8 years ago by the previous owners. The west side is peeling badly and we want to get ahead of summer. Budget's $18–25k.", timestamp: 'm:25' },
      { id: 't4', role: 'ai', type: 'text', content: "Got it — 8 years is right on the Texas sun timeline. We'd do prep, caulk, and 2 coats with our 2-year warranty. Want me to schedule an in-home estimate? Matthew Tims, our VP of Residential, handles Westlake projects.", timestamp: 'm:24' },
      { id: 't5', role: 'prospect', type: 'text', content: "Yes please. We want to decide by end of month — anything before then?", timestamp: 'm:14' },
      { id: 't6', role: 'ai', type: 'text', content: "Perfect — Matthew can come out this Thursday afternoon or Friday morning. Which works better?", timestamp: 'm:13' },
      { id: 't7', role: 'prospect', type: 'text', content: "Thursday afternoon would be ideal. Send the confirmation!", timestamp: 'm:4' },
      { id: 't8', role: 'system', type: 'system', content: 'AI sent calendar invite · Thursday 3 PM with Matthew Tims', timestamp: 'm:3' },
    ],
  },
  {
    ...RAW_LEADS[1],
    prospect: {
      ...RAW_LEADS[1].prospect,
      name: 'David Lin',
      company: 'Oakridge HOA Board',
      phone: '+1 (512) 555-0193',
      email: 'd.lin@oakridgehoa.org',
      source_url: 'certapro.com/austin/commercial',
    },
    factors: ['Large project', 'No timeline yet', 'Needs board approval'],
    tags: ['HOA', 'Multi-building', 'Board approval'],
    first_touch_source: 'Inbound — phone tree, option 2',
    // Override the inherited (l-morgan-lee) action so the proposed reply matches
    // David Lin's HOA conversation rather than the original clinics scenario.
    suggested_next_action: {
      type: 'send-followup',
      summary: 'Send the phased estimate the board asked for',
      payload:
        "Hi David — putting the phased estimate together now: buildings A–G in year one, H–N in year two, so the board can spread it across both fiscal years. Want me to send it over before your call with Matthew?",
    },
    scorecard: {
      budget: 'Confidential — board approval',
      timeline: 'Tentatively Q4',
      need: 'Full repaint of 14-building HOA — 220 units total',
      decisionMaker: 'Needs board sign-off',
      custom: { 'Project size': '14 buildings · 220 units', 'Region': 'NW Austin' },
      reasoning: 'High intent, large potential value, but timeline ambiguity and board gate keep this from being a clean Hot.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Inbound call · option 2 (commercial)', timestamp: 'm:180' },
      { id: 't2', role: 'ai', type: 'call', content: 'AI handled inbound call · 3m 42s', call: { duration: '3m 42s', turns: [
        { speaker: 'Caller', line: "Hi, I'm calling about HOA repaints — saw you on the CertaPro website." },
        { speaker: 'AI', line: "Hi! Happy to help. Before we dive in — are you on the board, or evaluating for another HOA?" },
        { speaker: 'Caller', line: "Board president. We've got 14 buildings, about 220 units in NW Austin." },
        { speaker: 'AI', line: "Great scale — we've handled a few HOAs in that range. Quick question: when did the buildings last get painted?" },
        { speaker: 'Caller', line: "About 9 years ago. Some of the trim is peeling, board wants a full repaint quote." },
        { speaker: 'AI', line: "Got it. When does the board need a decision — and is there a budget envelope we should fit?" },
        { speaker: 'Caller', line: "Probably Q4. Budget I can't share over the phone, but it's board-approved as a line item." },
        { speaker: 'AI', line: "Understood. Let me get you on with Matthew Tims, our VP of Residential — he handles our HOA projects directly. Can I have him email you a slot picker?" },
        { speaker: 'Caller', line: "Yes please. d.lin@oakridgehoa.org." },
        { speaker: 'AI', line: "Confirmed. He'll follow up within the hour." },
      ] }, timestamp: 'm:179' },
      { id: 't3', role: 'system', type: 'system', content: 'Escalated to owner · commercial rules-engine triggered', timestamp: 'm:178' },
      { id: 't4', role: 'ai', type: 'text', content: 'Following up by email — David, thanks for the call earlier. As mentioned, Matthew will send a slot picker shortly. Attached is our HOA capabilities one-pager.', timestamp: 'm:170' },
      { id: 't5', role: 'prospect', type: 'text', content: "Thanks. Quick clarifying question: do you do phased rollouts? Board wants to spread across 2 fiscal years.", timestamp: 'm:90' },
      { id: 't6', role: 'ai', type: 'text', content: "Yes — we routinely phase HOA work across fiscal years. Typically buildings A-G first, H-N second. Want a phased estimate, or wait for the full call with Matthew?", timestamp: 'm:88' },
      { id: 't7', role: 'prospect', type: 'text', content: "Phased estimate would help — I want to share it with the board ahead of the call.", timestamp: 'm:30' },
      { id: 't8', role: 'system', type: 'system', content: 'AI paused for owner review · phased estimate generation', timestamp: 'm:14' },
    ],
  },
  {
    ...RAW_LEADS[2],
    prospect: {
      ...RAW_LEADS[2].prospect,
      name: 'Sara Lopez',
      company: 'Lopez Family — Cedar Park',
      phone: '+1 (512) 555-0167',
      email: 'sara@lopezfamily.net',
      source_url: 'certapro.com/austin/interior',
    },
    factors: ['Engaged via widget', 'Cabinet project', 'Likely fast-close'],
    tags: ['Residential', 'Cedar Park', 'Cabinets'],
    first_touch_source: 'Cabinet refinishing page chat widget',
    scorecard: {
      budget: '$4–6k ballpark',
      timeline: 'Within 2 weeks',
      need: 'Cabinet refinishing — full kitchen',
      decisionMaker: 'Yes — homeowner',
      custom: { 'Project size': 'Kitchen, ~28 cabinet doors' },
      reasoning: 'Fits the cabinet refresh service cleanly. Homeowner is the buyer and timeline is fast.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Chat widget opened · /austin/interior', timestamp: 'm:60' },
      { id: 't2', role: 'prospect', type: 'text', content: "Hi! Do you do cabinet refinishing? We've got a full Cedar Park kitchen.", timestamp: 'm:59' },
      { id: 't3', role: 'ai', type: 'text', content: "Hi Sara — yes, cabinet refinishing is one of our core services. For a full kitchen of about 28 doors, you're typically looking at $4–6k including spray-finish and a 2-year warranty. Curious what's driving the search — refresh, sale prep, or color change?", timestamp: 'm:58' },
      { id: 't4', role: 'prospect', type: 'text', content: "Color change — going from oak to a warm white. Need it done before we host in May.", timestamp: 'm:55' },
      { id: 't5', role: 'ai', type: 'text', content: "Hear you. We've done a lot of oak-to-white refreshes in Cedar Park. Most kitchens take 3 working days on-site. Are you the final decision-maker?", timestamp: 'm:54' },
      { id: 't6', role: 'prospect', type: 'text', content: "Yes — homeowner. Can we start in the next two weeks?", timestamp: 'm:48' },
      { id: 't7', role: 'ai', type: 'text', content: "Yes — cabinet jobs typically start within 5 business days. Want me to send a sample agreement and a calendar link for a 15-min walkthrough?", timestamp: 'm:47' },
      { id: 't8', role: 'prospect', type: 'text', content: "Yes please. And include the color samples — we're between Alabaster and Swiss Coffee.", timestamp: 'm:25' },
      { id: 't9', role: 'ai', type: 'text', content: "On it — sample agreement + color swatch samples coming through in a moment. I'll also drop a slot picker.", timestamp: 'm:24' },
    ],
  },
  {
    ...RAW_LEADS[3],
    prospect: {
      ...RAW_LEADS[3].prospect,
      name: 'Carlos Reyes',
      company: 'Reyes Family — Round Rock',
      phone: '+1 (512) 555-0142',
      email: 'carlos@reyeshome.net',
      source_url: 'certapro.com/austin/exterior',
    },
    factors: ['High-intent missed call', 'Decision-maker confirmed', 'Budget signaled'],
    tags: ['Residential', 'Round Rock', 'Exterior'],
    first_touch_source: 'Exterior painting landing page',
    suggested_next_action: {
      type: 'call-back',
      summary: 'Call Carlos back at the number on file — voicemail mentioned a May timeline',
      payload: "Carlos — sorry we missed you. Just listened to your voicemail. Free this afternoon or tomorrow morning to chat through your May exterior repaint?",
    },
    scorecard: {
      budget: '$12k confirmed range',
      timeline: 'May start',
      need: 'Exterior repaint — full house + trim',
      decisionMaker: 'Homeowner',
      custom: { 'Square footage': '2,200 sq ft, 1 story' },
      reasoning: 'High-signal voicemail referencing budget and timeline — call back ASAP.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Missed inbound call · voicemail captured', timestamp: 'm:300' },
      { id: 't2', role: 'system', type: 'call', content: 'Voicemail · 47s', call: { duration: '47s', turns: [
        { speaker: 'Caller', line: "Hey, this is Carlos Reyes in Round Rock. We're looking at exterior painting for our 2,200 sq ft single-story — saw your landing page." },
        { speaker: 'Caller', line: "Budget's around $12k, and we want to start in May before it gets too hot. Call me back at this number." },
      ] }, timestamp: 'm:299' },
      { id: 't3', role: 'system', type: 'system', content: 'Voicemail transcribed · qualification rules-engine: ESCALATE', timestamp: 'm:298' },
      { id: 't4', role: 'ai', type: 'text', content: "Hi Carlos — caught your voicemail and want to make sure you talk to the right person. Quick text: are you free this afternoon (3-5pm CT) or tomorrow morning for a 15-min call?", timestamp: 'm:295' },
      { id: 't5', role: 'prospect', type: 'text', content: "Tomorrow AM works. 9:30 CT?", timestamp: 'm:120' },
      { id: 't6', role: 'ai', type: 'text', content: "9:30 AM CT locked in. Sending a calendar invite now from matthew@certapro.com/austin.", timestamp: 'm:119', medium: 'email' },
      { id: 't7', role: 'prospect', type: 'text', content: "Great. One more thing — can you send a Round Rock case study before the call?", timestamp: 'm:60', medium: 'email' },
      { id: 't8', role: 'system', type: 'system', content: 'AI flagged for owner review · custom collateral request', timestamp: 'm:45' },
    ],
  },
  {
    ...RAW_LEADS[4],
    prospect: {
      ...RAW_LEADS[4].prospect,
      name: 'Janet Bracken',
      company: 'Bracken Realty — Lakeway',
      phone: '+1 (512) 555-0118',
      email: 'janet@brackenrealty.com',
      source_url: 'certapro.com/austin/blog/pre-listing-repaint',
    },
    factors: ['Re-engaged after cold drip', 'Repeat referral source', 'Exploratory'],
    tags: ['Realtor', 'Lakeway', 'Pre-listing'],
    first_touch_source: 'Pre-listing repaint blog post — gated download',
    scorecard: {
      budget: 'Not yet defined',
      timeline: 'Exploring for upcoming listings',
      need: 'Pre-listing repaints for Lakeway sellers',
      decisionMaker: 'Realtor influences, homeowners sign',
      reasoning: 'Re-engaged from a 6-month-old cold drip. Real interest, but listings cycle drives timing.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Cold drip · sequence #4, day 28', timestamp: 'm:120' },
      { id: 't2', role: 'ai', type: 'text', content: "Janet — sharing our pre-listing repaint guide you downloaded back in November. Got any Lakeway listings coming up where a quick refresh could lift the price?", timestamp: 'm:119' },
      { id: 't3', role: 'prospect', type: 'text', content: "Actually yes — got two coming up in April. Sellers asked about a quick interior refresh. Reading this now.", timestamp: 'm:90' },
      { id: 't4', role: 'ai', type: 'text', content: "Great timing. Our 5-day interior refresh is built for exactly that — neutral repaint of main rooms before listing. Page 4 of the guide has the timeline. Want a sample quote for a typical Lakeway 3-bed?", timestamp: 'm:89' },
      { id: 't5', role: 'prospect', type: 'text', content: "Yes — and what's the typical price? Sellers always ask.", timestamp: 'm:80' },
      { id: 't6', role: 'ai', type: 'text', content: "For a 3-bed/2-bath interior refresh in Lakeway, $3,800–$5,200 is the usual range, depending on prep. Want me to send a sample one-pager you can hand to sellers?", timestamp: 'm:79' },
      { id: 't7', role: 'prospect', type: 'text', content: "Yes, send the one-pager — and CC my partner, Mark Whitaker.", timestamp: 'm:75' },
    ],
  },
  {
    ...RAW_LEADS[5],
    prospect: {
      ...RAW_LEADS[5].prospect,
      name: 'Sara Bell',
      company: 'Bell Family — Bee Cave',
      phone: '+1 (512) 555-0144',
      email: 'sara.bell@gmail.com',
      source_url: 'certapro.com/austin',
    },
    factors: ['Form submitted minutes ago', 'No reply yet'],
    tags: ['Residential', 'Bee Cave'],
    first_touch_source: 'Home page estimate form',
    scorecard: {
      reasoning: 'Just arrived — qualification will run when prospect replies.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Lead captured · Home page estimate form', timestamp: 'm:30' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Sara — thanks for the inquiry. To send the right info, are you looking at interior, exterior, or cabinet work?", timestamp: 'm:29' },
    ],
  },
  {
    ...RAW_LEADS[6],
    prospect: {
      ...RAW_LEADS[6].prospect,
      name: 'Noah Okafor',
      company: 'Helmsman Properties',
      phone: '+1 (512) 555-0181',
      email: 'noah@helmsmanproperties.com',
      source_url: 'certapro.com/austin/case-studies/hoa-repaint',
    },
    factors: ['Browsed case studies', 'Property manager buyer', 'Asked for warranty details'],
    tags: ['Property mgmt', 'Multi-property'],
    first_touch_source: 'HOA case study page',
    scorecard: {
      budget: '$30–50k indicated',
      timeline: 'Next quarter',
      need: 'Repaint across 6 rental properties',
      decisionMaker: 'Yes — property manager',
      reasoning: 'Good fit. Wants concrete warranty + crew details before committing.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Chat widget opened · /case-studies/hoa-repaint', timestamp: 'm:90' },
      { id: 't2', role: 'prospect', type: 'text', content: "Just read your Oakridge HOA case study. The 6-week timeline — is that durable across multi-property jobs?", timestamp: 'm:89' },
      { id: 't3', role: 'ai', type: 'text', content: "Great question — Oakridge was 14 buildings in 6 weeks with two crews running parallel. Smaller portfolios stabilize at 1 building per week per crew. What's your portfolio look like?", timestamp: 'm:88' },
      { id: 't4', role: 'prospect', type: 'text', content: "6 rental homes across Pflugerville and Round Rock. All single-story, similar size. Trying to get them all painted before peak rental season.", timestamp: 'm:80' },
      { id: 't5', role: 'ai', type: 'text', content: "Understood. Two crews could finish 6 single-stories in ~3 weeks. Want me to share the warranty detail and a sample multi-property quote?", timestamp: 'm:78' },
      { id: 't6', role: 'prospect', type: 'text', content: "Yes, send it. Also need pricing for ~6 properties.", timestamp: 'm:60' },
      { id: 't7', role: 'ai', type: 'text', content: "Sending now. For 6 single-stories in your range, $34k is the typical envelope. I'll include a one-pager comparing exterior packages. Worth a 20-min call once you've reviewed?", timestamp: 'm:58' },
      { id: 't8', role: 'prospect', type: 'text', content: "Let me read first, then circle back tomorrow.", timestamp: 'm:55' },
    ],
  },
  {
    ...RAW_LEADS[7],
    prospect: {
      ...RAW_LEADS[7].prospect,
      name: 'Emily Tran',
      company: 'Tran Family — Pflugerville',
      phone: '+1 (512) 555-0179',
      email: 'emily.tran@gmail.com',
      source_url: 'certapro.com/austin/pricing',
    },
    factors: ['Booked discovery call', 'Confirmed budget', 'Sole decision-maker'],
    tags: ['Residential', 'Pflugerville', 'Booked'],
    first_touch_source: 'Inbound — phone tree, option 1',
    scorecard: {
      budget: '$8k confirmed',
      timeline: 'Start next month',
      need: 'Interior repaint — 3 bedrooms + living',
      decisionMaker: 'Yes — homeowner',
      custom: { 'Project size': '~1,400 sq ft interior' },
      reasoning: 'Already on the calendar with Matthew. Strong signals across the board.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Inbound call · qualified by AI', timestamp: 'm:240' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Emily — recapping our call: 3-bedroom Pflugerville home, interior repaint, $8k budget. Sending the in-home estimate slot picker now.", timestamp: 'm:200' },
      { id: 't3', role: 'prospect', type: 'text', content: "Got it — picking Thursday 11am.", timestamp: 'm:160' },
      { id: 't4', role: 'system', type: 'system', content: 'Estimate booked · Thursday 11:00 AM CT with Matthew Tims', timestamp: 'm:159' },
      { id: 't5', role: 'ai', type: 'text', content: "Confirmed! Matthew will text Wednesday afternoon to confirm. In the meantime, here's our interior color guide to skim.", timestamp: 'm:158' },
      { id: 't6', role: 'prospect', type: 'text', content: "Perfect, thanks.", timestamp: 'm:120' },
    ],
  },
  {
    ...RAW_LEADS[8],
    prospect: {
      ...RAW_LEADS[8].prospect,
      name: 'David Wu',
      company: 'Solo handyman',
      phone: '+1 (512) 555-0192',
      email: 'd.wu@handyworks.net',
      source_url: 'certapro.com/austin',
    },
    factors: ['Subcontractor inquiry', 'Out of ICP'],
    tags: ['Subcontractor', 'Out of ICP'],
    first_touch_source: 'Cold sequence · trade newsletter',
    scorecard: {
      reasoning: 'Solo handyman looking for subcontract work — we use W-2 crews only. Politely disqualified.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Cold drip · sequence #2, day 14', timestamp: 'm:400' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi David — CertaPro Austin handles residential and commercial painting. How big is your crew?", timestamp: 'm:399' },
      { id: 't3', role: 'prospect', type: 'text', content: "Just me — looking for subcontract work.", timestamp: 'm:300' },
      { id: 't4', role: 'ai', type: 'text', content: "Appreciate the reply! We use W-2 painters, not subcontractors. If you're looking for hourly work, our hiring page is the right place — I'll send the link.", timestamp: 'm:299' },
      { id: 't5', role: 'system', type: 'system', content: 'Auto-disqualified · subcontractor outside ICP', timestamp: 'm:200' },
    ],
  },
  {
    ...RAW_LEADS[9],
    prospect: {
      ...RAW_LEADS[9].prospect,
      name: 'Talia Mendez',
      company: 'Mendez Family — Dripping Springs',
      phone: '+1 (512) 555-0136',
      email: 'talia@mendezfam.com',
      source_url: 'certapro.com/austin/exterior',
    },
    factors: ['Past customer', 'Deal closed'],
    tags: ['Past customer', 'Won'],
    first_touch_source: 'Exterior page form',
    scorecard: {
      reasoning: 'Won — moved to scheduling. Closed in the AI Receptionist view.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Deal won · moved to project scheduling queue', timestamp: 'm:300' },
    ],
  },
  {
    ...RAW_LEADS[10],
    prospect: {
      ...RAW_LEADS[10].prospect,
      name: 'Rohan Bhatt',
      company: 'Bhatt Family — Leander',
      phone: '+1 (512) 555-0118',
      email: 'rohan@bhattfam.com',
      source_url: 'certapro.com/austin/exterior',
    },
    factors: ['Highly engaged chat', 'Homeowner', 'May deadline confirmed'],
    tags: ['Residential', 'Leander', 'Hot lead'],
    first_touch_source: 'Exterior page chat widget',
    scorecard: {
      budget: '$15k confirmed',
      timeline: 'Sign by end of April',
      need: 'Full exterior repaint — 2-story home',
      decisionMaker: 'Yes — homeowner',
      custom: { 'Square footage': '2,800 sq ft, 2 stories' },
      reasoning: 'Strong fit and high engagement velocity. Homeowner buyer, confirmed budget, fast timeline.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Chat widget opened · /austin/exterior', timestamp: 'm:120' },
      { id: 't2', role: 'prospect', type: 'text', content: "Need to repaint our Leander exterior — current paint is fading badly. 2-story, 2,800 sq ft.", timestamp: 'm:119' },
      { id: 't3', role: 'ai', type: 'text', content: "Got it — fading on west-facing walls is the #1 issue we see in Leander. Most homes are due every 7-9 years here. Are you the buyer?", timestamp: 'm:118' },
      { id: 't4', role: 'prospect', type: 'text', content: "Homeowner, yes. Budget around $15k. Want to sign before end of April.", timestamp: 'm:115' },
      { id: 't5', role: 'ai', type: 'text', content: "Perfect — that's clean fit for our standard exterior package. Sending a calendar link for a 20-min in-home estimate with Matthew Tims. Tomorrow morning work?", timestamp: 'm:114' },
      { id: 't6', role: 'prospect', type: 'text', content: "Yes. 10am CT ideal.", timestamp: 'm:101' },
      { id: 't7', role: 'system', type: 'system', content: 'Calendar invite sent · 10:00 AM CT with Matthew Tims', timestamp: 'm:100' },
    ],
  },
  {
    ...RAW_LEADS[11],
    prospect: {
      ...RAW_LEADS[11].prospect,
      name: 'Helena Saunders',
      company: 'Saunders Family — Pflugerville',
      phone: '+1 (512) 555-0511',
      email: 'helena@saundersfam.com',
      source_url: 'certapro.com/austin',
    },
    factors: ['New lead', 'No clear timeline'],
    tags: ['Residential', 'Pflugerville'],
    first_touch_source: 'Home page estimate form',
    scorecard: {
      reasoning: 'New lead — qualification pending. Pflugerville homeowners typically take longer to decide.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Lead captured · Home page estimate form', timestamp: 'm:60' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Helena — thanks for reaching out. Just to send the right info, are you looking at interior, exterior, or both?", timestamp: 'm:55' },
    ],
  },
  {
    ...RAW_LEADS[12],
    prospect: {
      ...RAW_LEADS[12].prospect,
      name: 'Felix Rosenthal',
      company: 'Rosenthal Family — Round Rock',
      phone: '+1 (512) 555-0102',
      email: 'felix@rosenthalfam.com',
      source_url: 'certapro.com/austin/interior',
    },
    factors: ['No reply after voicemail', 'Cooled off'],
    tags: ['Residential', 'Cooled'],
    first_touch_source: 'Interior page',
    scorecard: {
      reasoning: 'Voicemail not returned across 2 follow-up attempts. Auto-closed after 5 days of silence.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Missed inbound call · no voicemail', timestamp: 'm:360' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Felix — just missed your call. Free anytime today to chat?", timestamp: 'm:355' },
      { id: 't3', role: 'ai', type: 'text', content: "Following up — happy to share an interior pricing 1-pager if a call's not convenient.", timestamp: 'm:300' },
      { id: 't4', role: 'system', type: 'system', content: 'Auto-closed · no reply across 2 attempts', timestamp: 'm:240' },
    ],
  },
  {
    ...RAW_LEADS[13],
    prospect: {
      ...RAW_LEADS[13].prospect,
      name: 'Mia Andersson',
      company: 'Andersson Family — Westlake',
      phone: '+1 (512) 555-0177',
      email: 'mia@anderssonfam.com',
      source_url: 'certapro.com/austin/exterior',
    },
    factors: ['Westlake homeowner — fast buyer profile', 'Engaged immediately'],
    tags: ['Residential', 'Westlake'],
    first_touch_source: 'Exterior page estimate form',
    scorecard: {
      reasoning: 'Brand-new lead. Profile suggests a fast buyer — qualification continues.',
    },
    transcript: [
      { id: 't1', role: 'system', type: 'system', content: 'Lead captured · Exterior page estimate form', timestamp: 'm:20' },
      { id: 't2', role: 'ai', type: 'text', content: "Hi Mia — thanks for filling out the form. Quick question to point you at the right package: is this a full exterior or trim/touch-up only?", timestamp: 'm:18' },
    ],
  },
  // Priya Patel follow-up — second lead for c-priya (warranty claim after booking).
  // Demonstrates one contact → multiple leads in the contact history view.
  {
    id: 'l-priya-followup',
    created_at: 'm:120',
    last_activity_at: 'm:40',
    prospect: {
      name: 'Priya Patel',
      company: 'Patel Family — Westlake',
      phone: '+1 (512) 555-0148',
      email: 'priya.patel@gmail.com',
      source_url: 'certapro.com/austin',
    },
    channel: 'form',
    method: 'sms',
    status: 'human-handling' as const,
    score: 40,
    factors: ['Past customer', 'Warranty concern'],
    tags: ['Residential', 'Westlake', 'Warranty claim'],
    first_touch_source: 'Inbound SMS — warranty inquiry',
    first_seen: 'm:14400',
    hubspot_id: 'HS-39902',
    calendly_event_id: null,
    suggested_next_action: {
      type: 'reply',
      summary: 'Priya is reporting peeling paint 3 weeks after the exterior job. Needs owner callback — likely a warranty inspection.',
      payload: "Hi Priya — I'm sorry to hear that. Matthew will reach out today to schedule a warranty inspection.",
    },
    scorecard: {
      reasoning: 'Past customer reporting a quality issue. Warranty claim — owner must respond promptly.',
    },
    transcript: [
      { id: 'pf-t1', role: 'prospect' as const, type: 'text' as const, content: "Hi — we had our exterior done about 3 weeks ago. The west-side trim is already peeling in two spots. Not happy at all.", timestamp: 'm:14400' },
      { id: 'pf-t2', role: 'system' as const, type: 'system' as const, content: 'Warranty claim detected · Escalated to owner · Morning digest queued', timestamp: 'm:14399' },
      { id: 'pf-t3', role: 'ai' as const, type: 'text' as const, content: "Hi Priya — I'm really sorry to hear that. I've flagged this for Matthew right away. He'll review the job record and reach out today. Can you share a photo of the affected area if convenient?", timestamp: 'm:14395' },
      { id: 'pf-t4', role: 'prospect' as const, type: 'text' as const, content: "Here's a photo. It's on the north trim above the garage door.", timestamp: 'm:14380' },
      { id: 'pf-t5', role: 'system' as const, type: 'system' as const, content: 'AI paused for owner review · warranty inspection required', timestamp: 'm:7200' },
    ],
  },
  // Batch 2 — the 33 additional leads added to sdr-data.ts (indices 14–46).
  // These are already CertaPro-Austin branded so no re-skinning needed.
  ...RAW_LEADS.slice(14),
];

// Post-process: inject contact_id + related_lead_ids from CONTACTS lookup.
const CONTACT_ID_BY_EMAIL: Record<string, string> = Object.fromEntries(
  CONTACTS.map((c) => [c.email, c.id]),
);

// The AI auto-handles most conversations, so only a few rows should surface a
// "new / waiting on us" dot. Human-handling rows always get a dot (they're the
// reason a human is looking at the inbox); we also let a couple of AI-handling
// rows show the dot so the AI section isn't visually quiet.
const KEEP_NEW_STATUSES = new Set<Status>(['human-handling']);
const MAX_AI_HANDLING_NEW = 2;
let aiHandlingNewLeft = MAX_AI_HANDLING_NEW;

// Seed a couple of bookings as unread so the Bookings tab also shows the blue-
// dot treatment. Picked by `last_activity_at` — the two most recent resolved
// leads.
const BOOKING_UNREAD_IDS = new Set<string>(['l-rohan-bhatt', 'l-emily-tran']);

// Seed outcomes on a few PAST bookings so the funnel metrics + outcome pills
// aren't empty on first load. Upcoming bookings are left to auto-derive
// ('scheduled'); past ones without a seed auto-derive to 'completed'.
const SEED_BOOKING_OUTCOMES: Record<string, BookingOutcome> = {
  'l-aria-chen': 'job-done',
  'l-talia-mendez': 'won',
  'l-maria-santos': 'lost',
  'l-lisa-kim': 'no-show',
};

export const LEADS: Lead[] = LEADS_RAW.map((l) => {
  // isUnread() derives from the transcript here since `l.unread` is still unset.
  const derivedUnread = isUnread(l);
  let unread = KEEP_NEW_STATUSES.has(l.status) && derivedUnread;
  if (!unread && l.status === 'ai-handling' && derivedUnread && aiHandlingNewLeft > 0) {
    unread = true;
    aiHandlingNewLeft--;
  }
  if (l.status === 'resolved' && BOOKING_UNREAD_IDS.has(l.id)) {
    unread = true;
  }
  const cid = CONTACT_ID_BY_EMAIL[l.prospect.email];
  const relatedIds =
    l.id === 'l-aria-chen' ? ['l-priya-followup']
    : l.id === 'l-priya-followup' ? ['l-aria-chen']
    : undefined;
  return {
    ...l,
    unread,
    ...(cid ? { contact_id: cid } : {}),
    ...(relatedIds ? { related_lead_ids: relatedIds } : {}),
    ...(SEED_BOOKING_OUTCOMES[l.id] ? { outcome: SEED_BOOKING_OUTCOMES[l.id] } : {}),
  };
});

/**
 * /h2/sdr — AI inbound-sales SDR.
 *
 * Two screens, one route:
 *   - Inbox (table) — default. Flat CRM-style table from the shared
 *     leads-table-kit: search + Filters popover, sortable columns.
 *   - Detail (three-pane) — opened by clicking a row. Internal state, no
 *     router change. Back link returns to the inbox.
 *
 * Cold state shows a brief empty-state message — there's no separate
 * cold-page surface for SDR after this rebuild.
 */

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

function requestType(lead: Lead): string {
  const src = lead.first_touch_source ?? '';
  if (/cabinet/i.test(src)) return 'Cabinet refinishing';
  if (/exterior/i.test(src)) return 'Exterior painting';
  if (/interior/i.test(src)) return 'Interior painting';
  if (/warranty/i.test(src)) return 'Warranty claim';
  if (/hoa|hoA/i.test(src)) return 'HOA project';
  if (/commercial|restaurant|healthcare/i.test(src)) return 'Commercial painting';
  if (/deck|fence/i.test(src)) return 'Deck & fence';
  if (/color/i.test(src)) return 'Color consultation';
  // Fall back to scorecard need
  const need = lead.scorecard.need ?? '';
  if (/cabinet/i.test(need)) return 'Cabinet refinishing';
  if (/exterior/i.test(need)) return 'Exterior painting';
  if (/interior/i.test(need)) return 'Interior painting';
  // Fall back to first meaningful tag
  const tag = lead.tags.find((t) => !/residential|westlake|cedar park|austin|pflugerville|leander|round rock|lakeway|bee cave|dripping|booked|hot lead|cooled/i.test(t));
  if (tag) return tag;
  return 'General inquiry';
}

function latestSnippet(lead: Lead): string {
  const turns = [...lead.transcript].reverse();
  for (const t of turns) {
    if (t.type === 'text' && t.content) return t.content;
    if (t.type === 'call' && t.call?.turns?.length) {
      return t.call.turns[t.call.turns.length - 1].line;
    }
  }
  if (lead.transcript.length) return lead.transcript[lead.transcript.length - 1].content;
  return '';
}

/** One-sentence "what's needed" summary for the inbox. Prefers the hand-
 *  authored per-lead summary (LEAD_NEEDS_SUMMARY), then the AI's suggested
 *  next-step, then the last message excerpt so the row never reads empty. */
function whatsNeeded(lead: Lead): string {
  return LEAD_NEEDS_SUMMARY[lead.id] ?? lead.suggested_next_action?.summary ?? latestSnippet(lead);
}

export function SdrRoute() {
  return (
    <ModalStack>
      <SdrInner />
    </ModalStack>
  );
}

type SdrTab = 'leads' | 'bookings' | 'settings';

function SdrInner() {
  const { getState } = useDevState();
  const { openModal } = useModals();
  const isCold = getState('/h2/sdr') === 'cold';
  const [leads, setLeads] = useState<Lead[]>(LEADS);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [tab, setTab] = useState<SdrTab>('leads');

  // Scope + filters + sort — the shared CRM table model (leads-table-kit).
  // Lives here so the Export modal opens seeded with exactly what the table
  // shows.
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<LeadScope>(DEFAULT_SCOPE);
  const [filters, setFilters] = useState<LeadFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);

  // Scope, filter, then sort — via the same helpers the export modal uses.
  // `filteredLeads` is also the display order behind prev/next navigation.
  const scopedLeads = useMemo(() => applyScope(leads, scope), [leads, scope]);
  const filteredLeads = useMemo(
    () => sortLeads(applyFilters(scopedLeads, filters).filter((l) => matchesQuery(l, query)), sort),
    [scopedLeads, filters, query, sort],
  );

  const updateLead = (next: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === next.id ? next : l)));
  };

  const activeLead = activeLeadId ? leads.find((l) => l.id === activeLeadId) ?? null : null;

  // count of leads per contact_id — used for inbox badge
  const contactLeadCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const l of leads) {
      if (l.contact_id) counts.set(l.contact_id, (counts.get(l.contact_id) ?? 0) + 1);
    }
    return counts;
  }, [leads]);

  const openContact = (contactId: string) => {
    setActiveContactId(contactId);
  };

  const tabStrip = (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      <TabChip selected={tab === 'leads'} onSelect={() => setTab('leads')}>Leads</TabChip>
      <TabChip selected={tab === 'bookings'} onSelect={() => setTab('bookings')}>Bookings</TabChip>
    </div>
  );

  // Settings is no longer a sub-tab — it opens as a separate full page from this
  // topbar button (mirrors the client-side Leads → Receptionist settings flow).
  const settingsButton = (
    <Button variant="tertiary" size="sm" frontIcon={Settings} onPress={() => setTab('settings')}>
      Settings
    </Button>
  );

  // Overflow "…" menu — Generate report + Export live here instead of as their
  // own topbar buttons.
  const moreMenu = (
    <MoreMenu
      onGenerateReport={() => { /* prototype: report generation is a no-op */ }}
      onExport={() => openModal(ExportLeadsModal, { leads, scope, filters, sort })}
    />
  );


  // ─── Bookings tab ──────────────────────────────────────────────────
  if (tab === 'bookings' && !activeLead) {
    return (
      <H2Layout topbarCenter={tabStrip} topbarRight={<>{moreMenu}{settingsButton}</>}>
        <BookingsTab
          leads={leads}
          contactLeadCounts={contactLeadCounts}
          onOpenLead={setActiveLeadId}
          onUpdateLead={updateLead}
        />
      </H2Layout>
    );
  }

  // ─── Settings (separate full page) ─────────────────────────────────
  // Opened from the topbar Settings button (not a sub-tab). SdrSettingsBody
  // renders its own H2Layout with a back button in the topbar title and the
  // "Add agent" action on the right.
  if (tab === 'settings' && !activeLead) {
    return <SdrSettingsBody onBack={() => setTab('leads')} />;
  }

  // ─── Cold view ─────────────────────────────────────────────────────
  // Renders the AI Receptionist setup CTA + 2-step modal. After "Finish setup"
  // the modal flips this route's dev state to `steady`, which re-renders the
  // populated inbox below.
  if (isCold) {
    return (
      <H2Layout>
        <SdrColdView />
      </H2Layout>
    );
  }

  // ─── Contact history view ──────────────────────────────────────────
  if (activeContactId) {
    const contact = CONTACTS.find((c) => c.id === activeContactId) ?? null;
    const contactLeads = leads.filter((l) => l.contact_id === activeContactId);
    return (
      <H2Layout
        title={
          contact ? (
            <ContactTitleCluster contact={contact} onBack={() => setActiveContactId(null)} />
          ) : (
            <span style={{ fontSize: 14, fontWeight: 500 }}>Contact history</span>
          )
        }
        topbarRight={moreMenu}
      >
        <ContactHistory
          contact={contact}
          leads={contactLeads}
          onOpenLead={(id) => {
            setActiveContactId(null);
            setActiveLeadId(id);
          }}
        />
      </H2Layout>
    );
  }

  // ─── Detail view ───────────────────────────────────────────────────
  if (activeLead) {
    const activeLeadIndex = filteredLeads.findIndex((l) => l.id === activeLeadId);
    const prevLead = activeLeadIndex > 0 ? (filteredLeads[activeLeadIndex - 1] ?? null) : null;
    const nextLead = activeLeadIndex >= 0 && activeLeadIndex < filteredLeads.length - 1 ? (filteredLeads[activeLeadIndex + 1] ?? null) : null;
    return (
      <H2Layout
        titleOverride={<LeadDetailTitle name={activeLead.prospect.name} status={activeLead.status} onBack={() => setActiveLeadId(null)} />}
        topbarCenter={
          <LeadDetailNav
            index={activeLeadIndex >= 0 ? activeLeadIndex + 1 : undefined}
            total={filteredLeads.length}
            onPrev={prevLead ? () => setActiveLeadId(prevLead.id) : undefined}
            onNext={nextLead ? () => setActiveLeadId(nextLead.id) : undefined}
          />
        }
        fullBleed
      >
        <SdrDetail
          lead={activeLead}
          onUpdateLead={updateLead}
          allLeads={leads}
          contacts={CONTACTS}
          onOpenContact={openContact}
          onSwitchToLead={(id) => setActiveLeadId(id)}
        />
      </H2Layout>
    );
  }

  // ─── Inbox view ────────────────────────────────────────────────────
  return (
    <H2Layout
      topbarCenter={tabStrip}
      topbarRight={<>{moreMenu}{settingsButton}</>}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* section: inbox — flat CRM table (shared kit): search + filters
            toolbar, sortable headers, status as a column */}
        <LeadsToolbar
          query={query}
          onQueryChange={setQuery}
          scope={scope}
          onScopeChange={setScope}
          filters={filters}
          onFiltersChange={setFilters}
          shownCount={filteredLeads.length}
          totalCount={scopedLeads.length}
        />
        <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
          <LeadsHeaderRow sort={sort} onSortChange={setSort} />
          {filteredLeads.map((lead, i) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              isLast={i === filteredLeads.length - 1}
              onOpen={() => setActiveLeadId(lead.id)}
              contactLeadCount={lead.contact_id ? (contactLeadCounts.get(lead.contact_id) ?? 1) : 1}
            />
          ))}
          {filteredLeads.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '48px 0' }}>
              <Text variant="secondary" color="var(--dark-60)">No leads match your filters.</Text>
              <Button variant="tertiary" size="sm" onPress={() => { setQuery(''); setFilters(DEFAULT_FILTERS); }}>Clear filters</Button>
            </div>
          )}
        </div>
      </div>
    </H2Layout>
  );
}

// The detail-view header (back + name cluster, prev/next switcher) is shared
// with the client via LeadDetailTitle / LeadDetailNav from ../SdrDetail.

// ─── Contact history title cluster ───────────────────────────────────

function ContactTitleCluster({ contact, onBack }: { contact: Contact; onBack: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <IconButton
        variant="ghost"
        size="sm"
        icon={ArrowLeft}
        aria-label="Back to inbox"
        onPress={onBack}
      />
      <span aria-hidden style={{ width: 1, height: 16, background: 'var(--dark-15)' }} />
      <Text variant="largeList" style={{ color: 'var(--dark-90)', fontWeight: 500 }}>
        {contact.name}
      </Text>
      <Text variant="secondary" style={{ fontSize: 13, color: 'var(--dark-60)' }}>
        Contact history
      </Text>
    </div>
  );
}

// ─── Overflow "…" menu ────────────────────────────────────────────────
// A small tertiary icon button that opens a BDS-style dropdown of page
// actions (Generate report / Export). Anchored to the trigger with
// position: fixed so no ancestor overflow/stacking can clip it.

function MoreMenu({
  onGenerateReport,
  onExport,
}: {
  onGenerateReport: () => void;
  onExport: () => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(null);
  const MENU_WIDTH = 208;
  const PAD = 16;

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setAnchor({ top: r.bottom + 8, right: Math.max(window.innerWidth - r.right, PAD) });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const runAndClose = (fn: () => void) => { setOpen(false); fn(); };

  return (
    <div ref={triggerRef} style={{ display: 'inline-flex' }}>
      <IconButton
        variant="tertiary"
        size="sm"
        icon={MoreDots}
        aria-label="More actions"
        active={open}
        onPress={() => setOpen((o) => !o)}
      />
      {open && anchor && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9 }} />
          <div
            role="menu"
            style={{
              position: 'fixed',
              top: anchor.top,
              right: anchor.right,
              width: MENU_WIDTH,
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 10,
              boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
              padding: 6,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <MenuItem icon={Document} label="Generate report" onClick={() => runAndClose(onGenerateReport)} />
            <MenuItem icon={Download} label="Export" onClick={() => runAndClose(onExport)} />
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick }: { icon: ComponentType<{ size?: number; color?: string }>; label: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '8px 10px',
        borderRadius: 7,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 14,
        color: 'var(--dark-90)',
        textAlign: 'left',
        background: hovered ? 'var(--dark-4)' : 'transparent',
        transition: 'background-color 100ms ease',
      }}
    >
      <Icon size={20} color="var(--dark-60)" />
      {label}
    </button>
  );
}

// ─── Lead row ─────────────────────────────────────────────────────────

// Column template comes from the shared leads-table-kit (5 cols incl. the
// Status pill) so the AM and client tables stay identical.
const LEADS_GRID = KIT_LEADS_GRID;

// Column template for the BookingsTab table. 5 cols: prospect (hugs like
// LEADS_GRID), call reason, scheduled, location (stretches), outcome (pill).
const BOOKINGS_GRID = '300px 170px 180px minmax(150px, 1fr) 172px';

// Drop the leading +1 country code for compact display in table sub-lines.
const localPhone = (phone: string) => phone.replace(/^\+1\s*/, '');

interface LeadRowProps {
  lead: Lead;
  isLast: boolean;
  onOpen: () => void;
  contactLeadCount?: number;
}

function LeadRow({ lead, isLast, onOpen, contactLeadCount = 1 }: LeadRowProps) {
  const unread = isUnread(lead);
  const ss = STATUS_STYLES[lead.status];
  // Rows with nothing new (already replied / read) recede onto a dark-2 tint;
  // rows with a fresh prospect message stay bright white.
  const baseBg = unread ? 'var(--light-100)' : 'var(--dark-2)';
  const hoverBg = unread ? 'var(--dark-2)' : 'var(--dark-4)';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{
        display: 'grid',
        gridTemplateColumns: LEADS_GRID,
        gap: 12,
        padding: '12px 28px',
        borderBottom: isLast ? 'none' : '1px solid var(--dark-4)',
        alignItems: 'center',
        cursor: 'pointer',
        background: baseBg,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
      onMouseLeave={(e) => (e.currentTarget.style.background = baseBg)}
    >
      {/* Prospect — blue dot signals prospect's message is waiting for reply */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, position: 'relative' }}>
        {unread && (
          <span
            aria-label="Unread"
            style={{
              position: 'absolute',
              left: -18,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--status-posting)',
            }}
          />
        )}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Avatar src={lead.prospect.avatarUrl} fallback={initials(lead.prospect.name)} size={32} style={{ background: avatarColor(lead.prospect.name) }} />
          {contactLeadCount > 1 && (
            <span
              aria-label={`${contactLeadCount} leads`}
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 16,
                height: 16,
                borderRadius: 999,
                background: 'var(--dark-60)',
                color: 'var(--light-100)',
                fontSize: 10,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
                border: '1.5px solid var(--light-100)',
              }}
            >
              {contactLeadCount}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Text style={{ fontWeight: 500, color: 'var(--dark-90)', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lead.prospect.name}
          </Text>
          <Text variant="secondary" style={{ fontSize: 14, color: 'var(--dark-60)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {localPhone(lead.prospect.phone)}
          </Text>
        </div>
      </div>

      {/* Method */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        {lead.method === 'call' && <Voice size={14} color="var(--dark-60)" />}
        {lead.method === 'sms' && <MessageText2 size={14} color="var(--dark-60)" />}
        {lead.method === 'other' && <MessageChat01 size={14} color="var(--dark-60)" />}
        <Text variant="secondary" color="var(--dark-60)" style={{ fontSize: 14 }}>
          {METHOD_LABELS[lead.method]}
        </Text>
      </div>

      {/* Request type */}
      <div style={{ minWidth: 0 }}>
        <Text variant="secondary" color="var(--dark-60)" style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {requestType(lead)}
        </Text>
      </div>

      {/* Status */}
      <div>
        <StatusPill tone={ss.tone} size="sm">{ss.label}</StatusPill>
      </div>

      {/* Time */}
      <div style={{ fontSize: 12, color: 'var(--dark-60)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {formatRelative(lead.last_activity_at)}
      </div>
    </div>
  );
}

// ─── Booking row ──────────────────────────────────────────────────────
//
// Variant of LeadRow used by the BookingsTab. Columns: Prospect · Call
// reason · Scheduled · Location · Outcome. Keeps LeadRow's unread visuals
// (blue dot to the left of the avatar + dark-2 row tint when nothing new) so
// the table reads identically to the Leads inbox even though the layout is
// different. LeadRow is left untouched because it's still used by the
// 5-column Leads inbox.
function BookingRow({ lead, isLast, onOpen, onSetOutcome, contactLeadCount = 1 }: LeadRowProps & { onSetOutcome: (o: BookingOutcome | null) => void }) {
  const unread = isUnread(lead);
  const baseBg = unread ? 'var(--light-100)' : 'var(--dark-2)';
  const hoverBg = unread ? 'var(--dark-2)' : 'var(--dark-4)';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{
        display: 'grid',
        gridTemplateColumns: BOOKINGS_GRID,
        gap: 12,
        padding: '12px 28px',
        borderBottom: isLast ? 'none' : '1px solid var(--dark-4)',
        alignItems: 'center',
        cursor: 'pointer',
        background: baseBg,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
      onMouseLeave={(e) => (e.currentTarget.style.background = baseBg)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, position: 'relative' }}>
        {unread && (
          <span
            aria-label="Unread"
            style={{
              position: 'absolute',
              left: -18,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--status-posting)',
            }}
          />
        )}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Avatar src={lead.prospect.avatarUrl} fallback={initials(lead.prospect.name)} size={32} style={{ background: avatarColor(lead.prospect.name) }} />
          {contactLeadCount > 1 && (
            <span
              aria-label={`${contactLeadCount} leads`}
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 16,
                height: 16,
                borderRadius: 999,
                background: 'var(--dark-60)',
                color: 'var(--light-100)',
                fontSize: 10,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
                border: '1.5px solid var(--light-100)',
              }}
            >
              {contactLeadCount}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Text style={{ fontWeight: 500, color: 'var(--dark-90)', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lead.prospect.name}
          </Text>
          <Text variant="secondary" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {localPhone(lead.prospect.phone)}&nbsp;&nbsp;{lead.prospect.company}
          </Text>
        </div>
      </div>

      <div style={{ minWidth: 0 }}>
        <Text variant="secondary" color="var(--dark-60)" style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {requestType(lead)}
        </Text>
      </div>

      <div style={{ minWidth: 0 }}>
        <Text
          variant="secondary"
          color="var(--dark-60)"
          style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
        >
          {lead.scheduled_at ?? '—'}
        </Text>
      </div>

      <div style={{ minWidth: 0, overflow: 'hidden' }}>
        <Text
          variant="secondary"
          color="var(--dark-60)"
          style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {lead.location ?? '—'}
        </Text>
      </div>

      {/* Outcome — selectable pill (auto scheduled/completed, else override) */}
      <div style={{ minWidth: 0, display: 'flex', justifyContent: 'flex-start' }}>
        <OutcomeSelect lead={lead} onSetOutcome={onSetOutcome} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// DASHBOARD TAB — Funnel KPI strip + recent activity summary
// ═══════════════════════════════════════════════════════════════════════

// Timeframe windows for the summary-metrics filter. `maxDays` is compared
// against each lead's `last_activity_at` (minutes-ago) via relativeMinutesAgo.
const DASHBOARD_TIMEFRAMES: { value: string; label: string; maxDays: number }[] = [
  { value: '2d', label: 'Last two days', maxDays: 2 },
  { value: '7d', label: 'Last 7 days', maxDays: 7 },
  { value: '2w', label: 'Last two weeks', maxDays: 14 },
  { value: '1m', label: 'Last month', maxDays: 30 },
  { value: 'all', label: 'All time', maxDays: Infinity },
];

function SdrDashboard({ leads, isCold, onViewLeads, onOpenLead }: { leads: Lead[]; isCold: boolean; onViewLeads: () => void; onOpenLead: (id: string) => void }) {
  const [timeframe, setTimeframe] = useState('all');

  // Leads whose last activity falls inside the selected window — drives the
  // summary stats so the metric cards recompute as the timeframe narrows.
  const scopedLeads = useMemo(() => {
    const maxDays = DASHBOARD_TIMEFRAMES.find((t) => t.value === timeframe)?.maxDays ?? Infinity;
    if (maxDays === Infinity) return leads;
    const maxMinutes = maxDays * 1440;
    return leads.filter((l) => relativeMinutesAgo(l.last_activity_at) <= maxMinutes);
  }, [leads, timeframe]);

  // Summary stats (simplified — no funnel/conversion math).
  const inboundRequests = scopedLeads.length;
  const needsReview = scopedLeads.filter((l) => l.status === 'human-handling').length;
  const resolved = scopedLeads.filter((l) => l.status === 'resolved').length;
  const aiHandled = scopedLeads.filter((l) => l.status !== 'human-handling').length;
  const booked = scopedLeads.filter((l) => l.status === 'resolved' && l.scheduled_at).length;

  // Leads needing owner action (needs-review or has a suggested next action)
  const actionLeads = leads
    .filter((l) => l.status === 'human-handling' || l.suggested_next_action != null)
    .sort((a, b) => relativeMinutesAgo(a.last_activity_at) - relativeMinutesAgo(b.last_activity_at))
    .slice(0, 5);

  if (isCold) return <ColdDashboard onViewLeads={onViewLeads} />;

  return (
    <div style={{ padding: '20px 28px 60px', maxWidth: 1320, margin: '0 auto' }}>
      {/* section: summary stats */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingLeft: 2 }}>
          <Heading level={4}>Summary</Heading>
          <Select
            size="sm"
            value={timeframe}
            onChange={setTimeframe}
            options={DASHBOARD_TIMEFRAMES.map(({ value, label }) => ({ value, label }))}
          />
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { label: 'Requests', value: inboundRequests, sub: 'came in' },
            { label: 'Handled by AI', value: aiHandled, sub: 'no human needed' },
            { label: 'Resolved', value: resolved, sub: `${booked} booked` },
            { label: 'Needs review', value: needsReview, sub: 'waiting on you' },
          ].map((m) => (
            <div
              key={m.label}
              style={{
                flex: 1,
                background: 'var(--light-100)',
                border: '1px solid var(--dark-8)',
                borderRadius: 12,
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <Text variant="secondary" style={{ fontSize: 12 }}>{m.label}</Text>
              <span style={{ fontSize: 32, fontWeight: 400, color: 'var(--dark-90)', letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {m.value}
              </span>
              <Text variant="secondary" style={{ fontSize: 12 }}>{m.sub}</Text>
            </div>
          ))}
        </div>
      </div>

      {/* section: bottom summary — needs attention + bookings (left), breakdowns (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 32, alignItems: 'start' }}>
        {/* left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
          <DashboardSection
            title="Needs attention"
            action={
              <Button variant="tertiary" size="sm" onPress={onViewLeads}>
                View leads
              </Button>
            }
          >
            {actionLeads.length === 0 ? (
              <div style={{ padding: '8px 0' }}>
                <Text variant="secondary" style={{ fontSize: 13 }}>No leads need attention right now.</Text>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {actionLeads.map((lead, i, arr) => {
                  const unread = isUnread(lead);
                  return (
                    <div
                      key={lead.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpenLead(lead.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onOpenLead(lead.id);
                        }
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dark-4)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 8px',
                        margin: '0 -8px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        background: 'transparent',
                        borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--dark-4)',
                      }}
                    >
                      <span aria-hidden style={{ width: 6, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                        {unread && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-posting)' }} />}
                      </span>
                      <Avatar
                        src={lead.prospect.avatarUrl}
                        fallback={lead.prospect.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
                        size={32}
                        style={{ background: avatarColor(lead.prospect.name) }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: unread ? 600 : 500, color: 'var(--dark-90)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lead.prospect.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {localPhone(lead.prospect.phone)} · {requestType(lead)}
                        </div>
                      </div>
                      <Text variant="secondary" style={{ fontSize: 12, color: 'var(--dark-60)', whiteSpace: 'nowrap', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                        {formatRelative(lead.last_activity_at)}
                      </Text>
                    </div>
                  );
                })}
              </div>
            )}
          </DashboardSection>

          <DashboardSection title="Recent bookings">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {leads
                .filter((l) => l.status === 'resolved' && l.scheduled_at && typeof l.scheduled_when === 'number')
                .sort((a, b) => (b.scheduled_when ?? 0) - (a.scheduled_when ?? 0))
                .slice(0, 4)
                .map((lead, i, arr) => {
                  const ss = STATUS_STYLES[lead.status];
                  return (
                    <div
                      key={lead.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpenLead(lead.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onOpenLead(lead.id);
                        }
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dark-4)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '10px 8px',
                        margin: '0 -8px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        background: 'transparent',
                        borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--dark-4)',
                      }}
                    >
                      <Avatar
                        src={lead.prospect.avatarUrl}
                        fallback={lead.prospect.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
                        size={32}
                        style={{ background: avatarColor(lead.prospect.name) }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lead.prospect.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lead.scheduled_at}
                        </div>
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        <StatusPill tone={ss.tone} size="sm">{ss.label}</StatusPill>
                      </div>
                    </div>
                  );
                })}
            </div>
          </DashboardSection>
        </div>

        {/* right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
          <DashboardSection title="Request type breakdown">
            <RequestTypeBreakdownRows leads={leads} />
          </DashboardSection>
          <DashboardSection title="Lead status snapshot">
            <StatusSnapshotRows leads={leads} />
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}

// ── Cold / empty state dashboard ──────────────────────────────────────────

function ColdDashboard({ onViewLeads }: { onViewLeads: () => void }) {
  return (
    <div style={{ padding: '20px 28px 60px', maxWidth: 1320, margin: '0 auto' }}>
      {/* section: upsell CTA — uses the expert-upsell-banner palette (soft blue
          gradient + dark text), not the legacy black/yellow treatment. */}
      <div
        style={{
          background: 'linear-gradient(100deg, #b9d9f4 0%, #d6e9f8 55%, #e7f1fa 100%)',
          borderRadius: 16,
          padding: '40px 48px',
          display: 'flex',
          alignItems: 'center',
          gap: 48,
          marginBottom: 24,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            role="img"
            aria-label="Blaze marketing expert"
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              marginBottom: 16,
              backgroundImage: 'url("https://cdn.prod.website-files.com/64cd367074be316f3359db61/69fa1e7f4a1bab3f0a963897_image%20771-p-1600.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: '90% 50%',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--status-posting)',
              letterSpacing: '0.4px',
              marginBottom: 12,
            }}
          >
            Expert setup
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: 'var(--dark-90)',
              lineHeight: 1.3,
              marginBottom: 12,
              letterSpacing: '-0.3px',
            }}
          >
            Let our team set this up for you
          </div>
          <div
            style={{
              fontSize: 15,
              color: 'var(--dark-80)',
              lineHeight: 1.6,
              maxWidth: 480,
              marginBottom: 28,
            }}
          >
            Most businesses see their first qualified lead within 48 hours of go-live.
            A Blaze marketing expert handles AI configuration, voice training, and channel setup — start to finish.
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Button variant="secondary" size="xl" onPress={() => {}}>
              Talk to a marketing expert
            </Button>
            <button
              type="button"
              onClick={onViewLeads}
              style={{
                fontSize: 14,
                color: 'var(--dark-60)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                padding: 0,
              }}
            >
              Or set it up myself →
            </button>
          </div>
        </div>

        {/* Right: checklist of what's included */}
        <div
          style={{
            flexShrink: 0,
            width: 260,
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: 12,
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--dark-60)', marginBottom: 2 }}>
            What's included
          </div>
          {[
            'AI receptionist configuration',
            'Phone number provisioning',
            'Voice & script training',
            'Channel setup (SMS + email)',
            'Ongoing monitoring',
          ].map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ color: 'var(--status-posting)', fontSize: 14, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>✓</span>
              <span style={{ fontSize: 13, color: 'var(--dark-80)', lineHeight: 1.4 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* section: setup steps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { step: '1', title: 'Connect your phone', body: 'Provision a local number or forward your existing line to the AI.', done: false },
          { step: '2', title: 'Configure the agent', body: "Define the AI's persona, goals, and escalation rules in Settings.", done: false },
          { step: '3', title: 'Go live', body: 'Flip the switch. Your AI receptionist starts handling inbound requests immediately.', done: false },
        ].map(({ step, title, body, done }) => (
          <div
            key={step}
            style={{
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 12,
              padding: '20px 20px',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: done ? 'var(--status-approved)' : 'var(--dark-8)',
                color: done ? 'var(--light-100)' : 'var(--dark-40)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 14,
              }}
            >
              {step}
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 6 }}>{title}</div>
            <div style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.5 }}>{body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ minWidth: 0 }}>
      {/* heading lives outside the bordered card. The action is positioned
          out of flow so the header height (and thus the heading→card gap) is
          identical across every section, whether or not it has an action. */}
      <div style={{ position: 'relative', marginBottom: 12, paddingLeft: 2 }}>
        <Heading level={4} style={{ lineHeight: 1.2 }}>{title}</Heading>
        {action && (
          <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}>{action}</div>
        )}
      </div>
      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 12,
          padding: '6px 16px',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ChannelBreakdownRows({ leads }: { leads: Lead[] }) {
  const total = leads.length || 1;
  const callCount = leads.filter((l) => l.channel === 'inbound-call').length;
  const formCount = leads.filter((l) => l.channel === 'form').length;
  const chatCount = leads.filter((l) => l.channel === 'chat').length;
  const rows = [
    { label: 'Inbound call', count: callCount, pct: Math.round((callCount / total) * 100), color: 'var(--status-posting)' },
    { label: 'SMS / form', count: formCount, pct: Math.round((formCount / total) * 100), color: 'var(--purple)' },
    { label: 'Chat widget', count: chatCount, pct: Math.round((chatCount / total) * 100), color: 'var(--brand)' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {rows.map((r) => (
        <div key={r.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 13, color: 'var(--dark-90)' }}>{r.label}</Text>
            <Text style={{ fontSize: 13, color: 'var(--dark-60)', fontVariantNumeric: 'tabular-nums' }}>
              {r.count} · {r.pct}%
            </Text>
          </div>
          <div
            style={{
              height: 6,
              borderRadius: 999,
              background: 'var(--dark-8)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${r.pct}%`,
                height: '100%',
                borderRadius: 999,
                background: r.color,
                transition: 'width 600ms ease',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// All four simplified statuses are filterable — nothing to hide.
const HIDDEN_STATUSES = new Set<Status>();

function RequestTypeBreakdownRows({ leads }: { leads: Lead[] }) {
  const total = leads.length || 1;
  const counts = new Map<string, number>();
  for (const lead of leads) {
    const rt = requestType(lead);
    counts.set(rt, (counts.get(rt) ?? 0) + 1);
  }
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '6px 0' }}>
      {rows.map(([label, count]) => {
        const pct = Math.round((count / total) * 100);
        return (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text variant="secondary" style={{ fontSize: 13 }}>{label}</Text>
              <Text variant="secondary" style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
                {count} · {pct}%
              </Text>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: 'var(--dark-4)', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: 'var(--dark-60)', transition: 'width 600ms ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const STATUS_FUNNEL_ORDER: Status[] = [
  'human-handling',
  'ai-handling',
  'resolved',
  'opted-out',
];

function StatusSnapshotRows({ leads }: { leads: Lead[] }) {
  const counts: Partial<Record<Status, { label: string; tone: string; count: number }>> = {};
  for (const lead of leads) {
    const ss = STATUS_STYLES[lead.status];
    if (!counts[lead.status]) counts[lead.status] = { label: ss.label, tone: ss.tone, count: 0 };
    counts[lead.status]!.count++;
  }
  const rows = STATUS_FUNNEL_ORDER.filter((s) => counts[s]).map((s) => ({ status: s, ...counts[s]! }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {rows.map(({ status, label, tone, count }, i) => (
        <div
          key={status}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '12px 0',
            borderBottom: i === rows.length - 1 ? 'none' : '1px solid var(--dark-4)',
          }}
        >
          <StatusPill tone={tone as any} size="sm">{label}</StatusPill>
          <Text style={{ fontSize: 14, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>
            {count}
          </Text>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ACTIVITY TAB — Calls · SMS · Booking Requests + search
// ═══════════════════════════════════════════════════════════════════════

type ActivityTab = 'calls' | 'sms' | 'bookings';

interface CallRecord {
  id: string;
  contact: string;
  company: string;
  duration: string;
  when: string;
  outcome: 'qualified' | 'escalated' | 'booked' | 'missed' | 'disqualified';
  channel: 'inbound-call' | 'missed-call';
}

interface SmsRecord {
  id: string;
  contact: string;
  company: string;
  preview: string;
  when: string;
  direction: 'inbound' | 'outbound';
  unread?: boolean;
}

interface BookingRecord {
  id: string;
  contact: string;
  company: string;
  requestType: string;
  service: string;
  scheduledFor: string;
  bookedAt: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

const CALL_RECORDS: CallRecord[] = [
  { id: 'cr1', contact: 'David Lin', company: 'Oakridge HOA Board', duration: '3m 42s', when: '2h ago', outcome: 'escalated', channel: 'inbound-call' },
  { id: 'cr2', contact: 'Emily Tran', company: 'Tran Family — Pflugerville', duration: '5m 10s', when: '4h ago', outcome: 'booked', channel: 'inbound-call' },
  { id: 'cr3', contact: 'Carlos Reyes', company: 'Reyes Family — Round Rock', duration: '0m 47s', when: '6h ago', outcome: 'missed', channel: 'missed-call' },
  { id: 'cr4', contact: 'Rohan Bhatt', company: 'Bhatt Family — Leander', duration: '4m 02s', when: 'Yesterday', outcome: 'booked', channel: 'inbound-call' },
  { id: 'cr5', contact: 'Noah Okafor', company: 'Helmsman Properties', duration: '2m 15s', when: 'Yesterday', outcome: 'qualified', channel: 'inbound-call' },
  { id: 'cr6', contact: 'David Wu', company: 'Solo handyman', duration: '1m 30s', when: '2 days ago', outcome: 'disqualified', channel: 'inbound-call' },
  { id: 'cr7', contact: 'Felix Rosenthal', company: 'Rosenthal Family — Round Rock', duration: '0m 0s', when: '3 days ago', outcome: 'missed', channel: 'missed-call' },
];

const SMS_RECORDS: SmsRecord[] = [
  { id: 'sr1', contact: 'Priya Patel', company: 'Patel Family — Westlake', preview: 'Thursday afternoon would be ideal. Send the confirmation!', when: '1h ago', direction: 'inbound', unread: true },
  { id: 'sr2', contact: 'Sara Lopez', company: 'Lopez Family — Cedar Park', preview: 'Yes, include the color samples — between Alabaster and Swiss Coffee.', when: '3h ago', direction: 'inbound', unread: true },
  { id: 'sr3', contact: 'Mia Andersson', company: 'Andersson Family — Westlake', preview: 'Is this for full exterior or trim/touch-up only?', when: '5h ago', direction: 'outbound' },
  { id: 'sr4', contact: 'Carlos Reyes', company: 'Reyes Family — Round Rock', preview: "Sorry we missed you. Free this afternoon or tomorrow morning to chat?", when: '6h ago', direction: 'outbound' },
  { id: 'sr5', contact: 'Janet Bracken', company: 'Bracken Realty — Lakeway', preview: 'Got two April listings. Sellers asked about a quick interior refresh.', when: 'Yesterday', direction: 'inbound' },
  { id: 'sr6', contact: 'Helena Saunders', company: 'Saunders Family — Pflugerville', preview: 'Are you looking at interior, exterior, or both?', when: 'Yesterday', direction: 'outbound' },
  { id: 'sr7', contact: 'Sara Bell', company: 'Bell Family — Bee Cave', preview: 'Hi Sara — are you looking at interior, exterior, or cabinet work?', when: '2 days ago', direction: 'outbound' },
];

const BOOKING_RECORDS: BookingRecord[] = [
  { id: 'br1', contact: 'Priya Patel', company: 'Patel Family — Westlake', requestType: 'Exterior painting', service: 'In-home estimate — exterior', scheduledFor: 'Thu, May 29 · 3:00 PM', bookedAt: '1h ago', status: 'confirmed' },
  { id: 'br2', contact: 'Emily Tran', company: 'Tran Family — Pflugerville', requestType: 'Interior painting', service: 'In-home estimate — interior', scheduledFor: 'Thu, May 29 · 11:00 AM', bookedAt: '4h ago', status: 'confirmed' },
  { id: 'br3', contact: 'Rohan Bhatt', company: 'Bhatt Family — Leander', requestType: 'Exterior painting', service: 'In-home estimate — exterior', scheduledFor: 'Wed, May 28 · 10:00 AM', bookedAt: 'Yesterday', status: 'confirmed' },
  { id: 'br4', contact: 'Sara Lopez', company: 'Lopez Family — Cedar Park', requestType: 'Cabinet refinishing', service: 'In-home estimate — cabinets', scheduledFor: 'Fri, May 30 · 9:00 AM', bookedAt: 'Yesterday', status: 'pending' },
  { id: 'br5', contact: 'Talia Mendez', company: 'Mendez Family — Dripping Springs', requestType: 'Exterior painting', service: 'In-home estimate — exterior', scheduledFor: 'Mon, May 19 · 2:00 PM', bookedAt: '8 days ago', status: 'confirmed' },
  { id: 'br6', contact: 'Noah Okafor', company: 'Helmsman Properties', requestType: 'Commercial painting', service: 'Commercial walkthrough', scheduledFor: 'Tue, May 27 · 1:00 PM', bookedAt: '2 days ago', status: 'pending' },
];

const OUTCOME_STYLES: Record<CallRecord['outcome'], { label: string; color: string }> = {
  qualified:    { label: 'Qualified',    color: 'var(--status-posting)' },
  escalated:    { label: 'Escalated',   color: '#edb62c' },
  booked:       { label: 'Booked',      color: 'var(--status-approved)' },
  missed:       { label: 'Missed',      color: 'var(--red-70)' },
  disqualified: { label: 'Disqualified', color: 'var(--dark-40)' },
};

const BOOKING_STATUS_STYLES: Record<BookingRecord['status'], { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  confirmed: { label: 'Confirmed', tone: 'success' },
  pending:   { label: 'Pending owner', tone: 'warning' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

function SdrActivity() {
  const [actTab, setActTab] = useState<ActivityTab>('calls');
  const [query, setQuery] = useState('');

  const filteredCalls = CALL_RECORDS.filter(
    (r) =>
      r.contact.toLowerCase().includes(query.toLowerCase()) ||
      r.company.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredSms = SMS_RECORDS.filter(
    (r) =>
      r.contact.toLowerCase().includes(query.toLowerCase()) ||
      r.company.toLowerCase().includes(query.toLowerCase()) ||
      r.preview.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredBookings = BOOKING_RECORDS.filter(
    (r) =>
      r.contact.toLowerCase().includes(query.toLowerCase()) ||
      r.company.toLowerCase().includes(query.toLowerCase()) ||
      r.service.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div style={{ padding: '20px 28px 60px', maxWidth: 1320, margin: '0 auto' }}>
      {/* section: search + sub-tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--dark-40)',
              display: 'flex',
              pointerEvents: 'none',
            }}
          >
            <Search size={16} />
          </span>
          <input
            {...inputFocusProps}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts, messages…"
            style={{
              height: 36,
              paddingLeft: 32,
              paddingRight: 12,
              borderRadius: 8,
              border: '1px solid var(--dark-8)',
              background: 'var(--light-100)',
              color: 'var(--dark-90)',
              fontFamily: 'inherit',
              fontSize: 14,
              outline: 'none',
              width: 260,
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <TabChip selected={actTab === 'calls'} onSelect={() => setActTab('calls')}>
            Calls
          </TabChip>
          <TabChip selected={actTab === 'sms'} onSelect={() => setActTab('sms')}>
            SMS
          </TabChip>
          <TabChip selected={actTab === 'bookings'} onSelect={() => setActTab('bookings')}>
            Booking Requests
          </TabChip>
        </div>
      </div>

      {/* section: activity list */}
      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {actTab === 'calls' && (
          <>
            <ActivityListHeader columns={['Contact', 'Duration', 'When', 'Outcome']} />
            {filteredCalls.length === 0 && <ActivityEmptyState />}
            {filteredCalls.map((r, i) => (
              <div
                key={r.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 100px 120px 140px',
                  gap: 16,
                  padding: '12px 20px',
                  alignItems: 'center',
                  borderBottom: i === filteredCalls.length - 1 ? 'none' : '1px solid var(--dark-4)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: r.channel === 'missed-call' ? 'rgba(188,1,11,0.08)' : 'var(--dark-4)',
                      flexShrink: 0,
                    }}
                  >
                    <Voice size={16} color={r.channel === 'missed-call' ? 'var(--red-70)' : 'var(--dark-60)'} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', display: 'block' }}>
                      {r.contact}
                    </Text>
                    <Text style={{ fontSize: 12, color: 'var(--dark-60)' }}>{r.company}</Text>
                  </div>
                </div>
                <Text style={{ fontSize: 13, color: 'var(--dark-60)', fontVariantNumeric: 'tabular-nums' }}>
                  {r.duration}
                </Text>
                <Text style={{ fontSize: 13, color: 'var(--dark-60)' }}>{r.when}</Text>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    color: OUTCOME_STYLES[r.outcome].color,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: OUTCOME_STYLES[r.outcome].color,
                      flexShrink: 0,
                    }}
                  />
                  {OUTCOME_STYLES[r.outcome].label}
                </span>
              </div>
            ))}
          </>
        )}

        {actTab === 'sms' && (
          <>
            <ActivityListHeader columns={['Contact', 'Last message', 'When', 'Direction']} />
            {filteredSms.length === 0 && <ActivityEmptyState />}
            {filteredSms.map((r, i) => (
              <div
                key={r.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '200px 1fr 120px 110px',
                  gap: 16,
                  padding: '12px 20px',
                  alignItems: 'center',
                  borderBottom: i === filteredSms.length - 1 ? 'none' : '1px solid var(--dark-4)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  {r.unread && (
                    <span
                      aria-label="Unread"
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: 'var(--status-posting)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {!r.unread && <span style={{ width: 7, flexShrink: 0 }} />}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: 'var(--dark-4)',
                      flexShrink: 0,
                    }}
                  >
                    <MessageText2 size={16} color="var(--dark-60)" />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: r.unread ? 600 : 500,
                        color: 'var(--dark-90)',
                        display: 'block',
                      }}
                    >
                      {r.contact}
                    </Text>
                    <Text style={{ fontSize: 12, color: 'var(--dark-60)' }}>{r.company}</Text>
                  </div>
                </div>
                <Text
                  style={{
                    fontSize: 13,
                    color: 'var(--dark-60)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: r.unread ? 500 : 400,
                  }}
                >
                  {r.preview}
                </Text>
                <Text style={{ fontSize: 13, color: 'var(--dark-60)' }}>{r.when}</Text>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 12,
                    color: r.direction === 'inbound' ? 'var(--status-posting)' : 'var(--dark-40)',
                  }}
                >
                  {r.direction === 'inbound' ? '↙' : '↗'}{' '}
                  {r.direction === 'inbound' ? 'Inbound' : 'Outbound'}
                </span>
              </div>
            ))}
          </>
        )}

        {actTab === 'bookings' && (
          <>
            <ActivityListHeader columns={['Contact', 'Service', 'Scheduled for', 'Status']} />
            {filteredBookings.length === 0 && <ActivityEmptyState />}
            {filteredBookings.map((r, i) => {
              const bs = BOOKING_STATUS_STYLES[r.status];
              return (
                <div
                  key={r.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 200px 160px',
                    gap: 16,
                    padding: '12px 20px',
                    alignItems: 'center',
                    borderBottom: i === filteredBookings.length - 1 ? 'none' : '1px solid var(--dark-4)',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', display: 'block' }}>
                      {r.contact}
                    </Text>
                    <Text style={{ fontSize: 12, color: 'var(--dark-60)' }}>{r.company}</Text>
                  </div>
                  <Text style={{ fontSize: 13, color: 'var(--dark-90)' }}>{r.service}</Text>
                  <div>
                    <Text style={{ fontSize: 13, color: 'var(--dark-90)', display: 'block' }}>
                      {r.scheduledFor}
                    </Text>
                    <Text style={{ fontSize: 12, color: 'var(--dark-40)' }}>booked {r.bookedAt}</Text>
                  </div>
                  <StatusPill tone={bs.tone} size="sm">{bs.label}</StatusPill>
                </div>
              );
            })}
          </>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <Text variant="secondary" style={{ fontSize: 12 }}>
          {actTab === 'calls' && `${filteredCalls.length} call${filteredCalls.length !== 1 ? 's' : ''}`}
          {actTab === 'sms' && `${filteredSms.length} conversation${filteredSms.length !== 1 ? 's' : ''}`}
          {actTab === 'bookings' && `${filteredBookings.length} booking request${filteredBookings.length !== 1 ? 's' : ''}`}
          {query ? ` matching "${query}"` : ' · sorted by most recent'}
        </Text>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// BOOKINGS TAB — single-table list of resolved leads, reusing the inbox row
// visual. Click a row → opens the same SdrDetail used by Leads. Replaces the
// old Outcomes screen (which had a search input + Bookings/Messages sub-tabs).
// ═══════════════════════════════════════════════════════════════════════

// One funnel-metric card for the Bookings tab summary strip.
function BookingMetric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ flex: '1 1 0', minWidth: 140, background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, padding: '14px 16px' }}>
      <Text variant="secondary" style={{ fontSize: 12, color: 'var(--dark-60)' }}>{label}</Text>
      <div style={{ marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <Text style={{ fontSize: 24, fontWeight: 500, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>{value}</Text>
        {sub && <Text variant="secondary" style={{ fontSize: 12, color: 'var(--dark-40)', fontVariantNumeric: 'tabular-nums' }}>{sub}</Text>}
      </div>
    </div>
  );
}

function BookingsTab({
  leads,
  contactLeadCounts,
  onOpenLead,
  onUpdateLead,
}: {
  leads: Lead[];
  contactLeadCounts: Map<string, number>;
  onOpenLead: (id: string) => void;
  onUpdateLead: (lead: Lead) => void;
}) {
  // Only resolved leads that actually have a scheduled time appear as bookings.
  const bookings = useMemo(
    () => leads.filter((l) => l.status === 'resolved' && l.scheduled_at && typeof l.scheduled_when === 'number'),
    [leads],
  );

  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<BookingScope>(DEFAULT_BOOKING_SCOPE);
  const [filters, setFilters] = useState<BookingFilters>(DEFAULT_BOOKING_FILTERS);

  // Scope, filter, then sort — via the shared kit helpers (same model as the
  // client portal bookings and the leads inbox).
  const scoped = useMemo(() => applyBookingScope(bookings, scope), [bookings, scope]);
  const rows = useMemo(
    () => sortBookings(applyBookingFilters(scoped, filters).filter((b) => matchesBookingQuery(b, query)), scope),
    [scoped, filters, query, scope],
  );

  // Funnel conversion metrics across every booking (unaffected by scope /
  // filters), computed from each booking's effective outcome. Pending
  // (scheduled, future) bookings sit outside every rate denominator since
  // they have no result yet.
  const stats = useMemo(() => {
    const eff = bookings.map(effectiveBookingOutcome);
    const n = (set: BookingOutcome[]) => eff.filter((o) => set.includes(o)).length;
    const showed = n(['completed', 'estimate-sent', 'won', 'job-done', 'lost']);
    const noShow = n(['no-show']);
    const quoted = n(['estimate-sent', 'won', 'job-done', 'lost']);
    const won = n(['won', 'job-done']);
    const decided = n(['won', 'job-done', 'lost']);
    const rate = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : '—');
    return {
      total: eff.length,
      show: rate(showed, showed + noShow), showSub: `${showed}/${showed + noShow}`,
      quote: rate(quoted, showed), quoteSub: `${quoted}/${showed}`,
      close: rate(won, decided), closeSub: `${won}/${decided}`,
    };
  }, [bookings]);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {bookings.length === 0 ? (
        <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, padding: 40, textAlign: 'center' }}>
          <Text variant="secondary">No bookings yet.</Text>
        </div>
      ) : (
        <>
          {/* Funnel metrics — recompute live as outcomes are set on the rows below */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <BookingMetric label="Bookings" value={String(stats.total)} />
            <BookingMetric label="Show rate" value={stats.show} sub={stats.showSub} />
            <BookingMetric label="Quote rate" value={stats.quote} sub={stats.quoteSub} />
            <BookingMetric label="Close rate" value={stats.close} sub={stats.closeSub} />
          </div>

          <BookingsToolbar
            query={query}
            onQueryChange={setQuery}
            scope={scope}
            onScopeChange={setScope}
            filters={filters}
            onFiltersChange={setFilters}
            monthOptions={monthOptionsFor(bookings)}
            shownCount={rows.length}
            totalCount={scoped.length}
          />
          <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: BOOKINGS_GRID, borderBottom: '1px solid var(--dark-8)', padding: '8px 28px', gap: 12, fontSize: 12, color: 'var(--dark-60)', fontWeight: 400 }}>
              <span>Prospect</span>
              <span>Call reason</span>
              <span>Scheduled</span>
              <span>Location</span>
              <span>Outcome</span>
            </div>
            {rows.map((lead, i) => (
              <BookingRow
                key={lead.id}
                lead={lead}
                isLast={i === rows.length - 1}
                onOpen={() => onOpenLead(lead.id)}
                onSetOutcome={(o) => onUpdateLead({ ...lead, outcome: o })}
                contactLeadCount={lead.contact_id ? (contactLeadCounts.get(lead.contact_id) ?? 1) : 1}
              />
            ))}
            {rows.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '48px 0' }}>
                <Text variant="secondary" color="var(--dark-60)">No bookings match your filters.</Text>
                <Button variant="tertiary" size="sm" onPress={() => { setQuery(''); setFilters(DEFAULT_BOOKING_FILTERS); }}>Clear filters</Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// LEGACY OUTCOMES TAB — kept temporarily as dead code; replaced by BookingsTab
// above. Safe to delete after the new tab has been verified.
// ═══════════════════════════════════════════════════════════════════════

function SdrBookingsPage() {
  const [query, setQuery] = useState('');
  const [outcomeTab, setOutcomeTab] = useState<'bookings' | 'messages'>('bookings');

  const filteredBookings = BOOKING_RECORDS.filter(
    (r) =>
      r.contact.toLowerCase().includes(query.toLowerCase()) ||
      r.company.toLowerCase().includes(query.toLowerCase()) ||
      r.service.toLowerCase().includes(query.toLowerCase()) ||
      r.requestType.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredMessages = SMS_RECORDS.filter(
    (r) =>
      r.direction === 'inbound' &&
      (r.contact.toLowerCase().includes(query.toLowerCase()) ||
      r.company.toLowerCase().includes(query.toLowerCase()) ||
      r.preview.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div style={{ padding: '20px 28px 60px', maxWidth: 1320, margin: '0 auto' }}>
      {/* section: search + sub-tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <span aria-hidden style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dark-40)', display: 'flex', pointerEvents: 'none' }}>
            <Search size={16} />
          </span>
          <input
            {...inputFocusProps}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search outcomes…"
            style={{ height: 36, paddingLeft: 32, paddingRight: 12, borderRadius: 8, border: '1px solid var(--dark-8)', background: 'var(--light-100)', color: 'var(--dark-90)', fontFamily: 'inherit', fontSize: 14, outline: 'none', width: 260 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <TabChip selected={outcomeTab === 'bookings'} onSelect={() => setOutcomeTab('bookings')}>
            Bookings
          </TabChip>
          <TabChip selected={outcomeTab === 'messages'} onSelect={() => setOutcomeTab('messages')}>
            Messages
          </TabChip>
        </div>
      </div>

      {/* section: bookings table */}
      {outcomeTab === 'bookings' && (
        <>
          <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '200px 160px minmax(180px,1fr) 220px', gap: 16, padding: '8px 20px', borderBottom: '1px solid var(--dark-8)', background: 'var(--dark-2)' }}>
              {['Contact', 'Request type', 'Service', 'Scheduled for'].map((c) => (
                <span key={c} style={{ fontSize: 12, color: 'var(--dark-60)', fontWeight: 400 }}>{c}</span>
              ))}
            </div>
            {filteredBookings.length === 0 && <ActivityEmptyState />}
            {filteredBookings.map((r, i) => (
              <div
                key={r.id}
                style={{ display: 'grid', gridTemplateColumns: '200px 160px minmax(180px,1fr) 220px', gap: 16, padding: '12px 20px', alignItems: 'center', borderBottom: i === filteredBookings.length - 1 ? 'none' : '1px solid var(--dark-4)' }}
              >
                <div style={{ minWidth: 0 }}>
                  <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.contact}</Text>
                  <Text style={{ fontSize: 12, color: 'var(--dark-60)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.company}</Text>
                </div>
                <Text style={{ fontSize: 13, color: 'var(--dark-80)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.requestType}</Text>
                <Text style={{ fontSize: 13, color: 'var(--dark-90)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.service}</Text>
                <div>
                  <Text style={{ fontSize: 13, color: 'var(--dark-90)', display: 'block' }}>{r.scheduledFor}</Text>
                  <Text style={{ fontSize: 12, color: 'var(--dark-40)' }}>booked {r.bookedAt}</Text>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <Text variant="secondary" style={{ fontSize: 12 }}>
              {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
              {query ? ` matching "${query}"` : ' · sorted by most recent'}
            </Text>
          </div>
        </>
      )}

      {/* section: messages table */}
      {outcomeTab === 'messages' && (
        <>
          <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 120px 110px', gap: 16, padding: '8px 20px', borderBottom: '1px solid var(--dark-8)', background: 'var(--dark-2)' }}>
              {['Contact', 'Last message', 'When', 'Direction'].map((c) => (
                <span key={c} style={{ fontSize: 12, color: 'var(--dark-60)', fontWeight: 400 }}>{c}</span>
              ))}
            </div>
            {filteredMessages.length === 0 && <ActivityEmptyState />}
            {filteredMessages.map((r, i) => (
              <div
                key={r.id}
                style={{ display: 'grid', gridTemplateColumns: '200px 1fr 120px 110px', gap: 16, padding: '12px 20px', alignItems: 'center', borderBottom: i === filteredMessages.length - 1 ? 'none' : '1px solid var(--dark-4)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  {r.unread && <span aria-label="Unread" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--status-posting)', flexShrink: 0 }} />}
                  {!r.unread && <span style={{ width: 7, flexShrink: 0 }} />}
                  <div style={{ minWidth: 0 }}>
                    <Text style={{ fontSize: 14, fontWeight: r.unread ? 600 : 500, color: 'var(--dark-90)', display: 'block' }}>{r.contact}</Text>
                    <Text style={{ fontSize: 12, color: 'var(--dark-60)' }}>{r.company}</Text>
                  </div>
                </div>
                <Text style={{ fontSize: 13, color: 'var(--dark-60)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: r.unread ? 500 : 400 }}>
                  {r.preview}
                </Text>
                <Text style={{ fontSize: 13, color: 'var(--dark-60)' }}>{r.when}</Text>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: r.direction === 'inbound' ? 'var(--status-posting)' : 'var(--dark-40)' }}>
                  {r.direction === 'inbound' ? '↙' : '↗'}{' '}{r.direction === 'inbound' ? 'Inbound' : 'Outbound'}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <Text variant="secondary" style={{ fontSize: 12 }}>
              {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
              {query ? ` matching "${query}"` : ' · sorted by most recent'}
            </Text>
          </div>
        </>
      )}
    </div>
  );
}

function ActivityListHeader({ columns }: { columns: string[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: columns.length === 4 ? '1fr 1fr 200px 160px' : '1fr 100px 120px 140px',
        gap: 16,
        padding: '8px 20px',
        borderBottom: '1px solid var(--dark-8)',
        background: 'var(--dark-2)',
      }}
    >
      {columns.map((c) => (
        <span key={c} style={{ fontSize: 12, color: 'var(--dark-60)', fontWeight: 400 }}>
          {c}
        </span>
      ))}
    </div>
  );
}

function ActivityEmptyState() {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <Text variant="secondary">No results found.</Text>
    </div>
  );
}
