import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button, IconButton, ModalStack, Text } from '@/components';
import { Avatar, StatusPill, TabChip } from '@/staging';
import Filter from '@/icons/20/Filter';
import ArrowLeft from '@/icons/20/ArrowLeft';
import { H2Layout } from '../H2Layout';
import { GenerateReportButton } from '../GenerateReportButton';
import { useDevState } from '../dev-state-context';
import { ChannelGlyph, SdrDetail } from '../SdrDetail';
import { SdrColdView } from './ColdViews';
import { SdrSettingsBody } from './SdrSettings';
import {
  ALL_CHANNELS,
  ALL_STATUSES,
  CHANNEL_LABELS,
  LEADS as RAW_LEADS,
  STATUS_STYLES,
  formatRelative,
  relativeMinutesAgo,
  scoreColor,
  truncate,
  type Channel,
  type Lead,
  type Status,
} from '../sdr-data';

// CertaPro Painters of Austin — local re-skin of the imported LEADS for this
// prototype. We keep the underlying shape, scoring, channels, and transcripts
// intact so the inbox + detail UIs render identically — only the business
// content (names, companies, snippets, scorecards, tags, source URLs) changes.
const LEADS: Lead[] = [
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
];

/**
 * /h2/sdr — AI inbound-sales SDR.
 *
 * Two screens, one route:
 *   - Inbox (table) — default. A single "Filters" button opens a popover with
 *     all four filter groups (channel/status/date/score).
 *   - Detail (three-pane) — opened by clicking a row. Internal state, no
 *     router change. Back link returns to the inbox.
 *
 * Cold state shows a brief empty-state message — there's no separate
 * cold-page surface for SDR after this rebuild.
 */

type DateFilter = 'today' | '7d' | '30d' | 'all';
type ScoreFilter = 'top' | 'all' | 'bottom25';

const DATE_LABELS: Record<DateFilter, string> = {
  today: 'Today',
  '7d': '7d',
  '30d': '30d',
  all: 'All',
};

const SCORE_LABELS: Record<ScoreFilter, string> = {
  top: '60+ (Strong)',
  all: 'All',
  bottom25: 'Bottom 25%',
};

const DATE_DEFAULT: DateFilter = 'all';
const SCORE_DEFAULT: ScoreFilter = 'all';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
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

export function SdrRoute() {
  return (
    <ModalStack>
      <SdrInner />
    </ModalStack>
  );
}

type SdrTab = 'leads' | 'settings';

function SdrInner() {
  const { getState } = useDevState();
  const isCold = getState('/h2/sdr') === 'cold';
  const [leads, setLeads] = useState<Lead[]>(LEADS);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [tab, setTab] = useState<SdrTab>('leads');

  // Filters
  const [channels, setChannels] = useState<Set<Channel>>(new Set());
  const [statuses, setStatuses] = useState<Set<Status>>(new Set());
  const [dateFilter, setDateFilter] = useState<DateFilter>(DATE_DEFAULT);
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>(SCORE_DEFAULT);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const sortedLeads = useMemo(() => {
    return [...leads].sort(
      (a, b) => relativeMinutesAgo(a.last_activity_at) - relativeMinutesAgo(b.last_activity_at),
    );
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return sortedLeads.filter((lead) => {
      if (channels.size > 0 && !channels.has(lead.channel)) return false;
      if (statuses.size > 0 && !statuses.has(lead.status)) return false;

      const minsAgo = relativeMinutesAgo(lead.last_activity_at);
      if (dateFilter === 'today' && minsAgo > 24 * 60) return false;
      if (dateFilter === '7d' && minsAgo > 7 * 24 * 60) return false;
      if (dateFilter === '30d' && minsAgo > 30 * 24 * 60) return false;

      if (scoreFilter === 'top' && lead.score < 60) return false;
      if (scoreFilter === 'bottom25' && lead.score >= 25) return false;
      return true;
    });
  }, [sortedLeads, channels, statuses, dateFilter, scoreFilter]);

  const activeFilterCount =
    channels.size +
    statuses.size +
    (dateFilter !== DATE_DEFAULT ? 1 : 0) +
    (scoreFilter !== SCORE_DEFAULT ? 1 : 0);

  const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const updateLead = (next: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === next.id ? next : l)));
  };

  const activeLead = activeLeadId ? leads.find((l) => l.id === activeLeadId) ?? null : null;

  const tabStrip = (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      <TabChip selected={tab === 'leads'} onSelect={() => setTab('leads')}>Leads</TabChip>
      <TabChip selected={tab === 'settings'} onSelect={() => setTab('settings')}>Settings</TabChip>
    </div>
  );

  // ─── Settings tab ──────────────────────────────────────────────────
  if (tab === 'settings' && !activeLead) {
    return (
      <H2Layout topbarCenter={tabStrip}>
        <SdrSettingsBody />
      </H2Layout>
    );
  }

  // ─── Cold view ─────────────────────────────────────────────────────
  // Renders the AI Receptionist setup CTA + 2-step modal. After "Finish setup"
  // the modal flips this route's dev state to `steady`, which re-renders the
  // populated inbox below.
  if (isCold) {
    return (
      <H2Layout topbarCenter={tabStrip} topbarRight={<GenerateReportButton />}>
        <SdrColdView />
      </H2Layout>
    );
  }

  // ─── Detail view ───────────────────────────────────────────────────
  if (activeLead) {
    return (
      <H2Layout
        title={<DetailTitleCluster lead={activeLead} onBack={() => setActiveLeadId(null)} />}
        topbarRight={<GenerateReportButton />}
        fullBleed
      >
        <SdrDetail lead={activeLead} onUpdateLead={updateLead} />
      </H2Layout>
    );
  }

  // ─── Inbox view ────────────────────────────────────────────────────
  const filtersButton = (
    <FiltersPopoverButton
      count={activeFilterCount}
      open={filtersOpen}
      onToggle={() => setFiltersOpen((v) => !v)}
      onClose={() => setFiltersOpen(false)}
    >
      <FilterGroup label="Channel">
        {ALL_CHANNELS.map((c) => (
          <TabChip
            key={c}
            selected={channels.has(c)}
            onSelect={() => setChannels((prev) => toggle(prev, c))}
          >
            {CHANNEL_LABELS[c]}
          </TabChip>
        ))}
      </FilterGroup>
      <FilterGroup label="Status">
        {ALL_STATUSES.map((s) => (
          <TabChip
            key={s}
            selected={statuses.has(s)}
            onSelect={() => setStatuses((prev) => toggle(prev, s))}
          >
            {STATUS_STYLES[s].label}
          </TabChip>
        ))}
      </FilterGroup>
      <FilterGroup label="Date">
        {(Object.keys(DATE_LABELS) as DateFilter[]).map((d) => (
          <TabChip key={d} selected={dateFilter === d} onSelect={() => setDateFilter(d)}>
            {DATE_LABELS[d]}
          </TabChip>
        ))}
      </FilterGroup>
      <FilterGroup label="Score">
        {(Object.keys(SCORE_LABELS) as ScoreFilter[]).map((s) => (
          <TabChip key={s} selected={scoreFilter === s} onSelect={() => setScoreFilter(s)}>
            {SCORE_LABELS[s]}
          </TabChip>
        ))}
      </FilterGroup>
    </FiltersPopoverButton>
  );

  return (
    <H2Layout
      topbarCenter={tabStrip}
      topbarRight={
        <>
          {filtersButton}
          <GenerateReportButton />
        </>
      }
    >
      <div style={{ padding: '20px 28px 60px', maxWidth: 1320, margin: '0 auto' }}>
        {/* section: inbox table */}
        <div
          style={{
            background: 'var(--light-100)',
            border: '1px solid var(--dark-8)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '220px 140px minmax(280px, 2fr) 64px 116px',
              borderBottom: '1px solid var(--dark-8)',
              padding: '6px 20px',
              gap: 20,
              fontSize: 12,
              color: 'var(--dark-60)',
              fontWeight: 400,
            }}
          >
            <span>Prospect</span>
            <span>Channel</span>
            <span>Last activity</span>
            <span>Score</span>
            <span>Status</span>
          </div>

          {filteredLeads.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <Text variant="secondary">No leads match these filters.</Text>
            </div>
          )}

          {filteredLeads.map((lead, i) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              isLast={i === filteredLeads.length - 1}
              onOpen={() => setActiveLeadId(lead.id)}
            />
          ))}
        </div>

        <div style={{ marginTop: 12 }}>
          <Text variant="secondary" style={{ fontSize: 12 }}>
            {filteredLeads.length} of {leads.length} leads · sorted by last activity
          </Text>
        </div>
      </div>
    </H2Layout>
  );
}

// ─── Detail-view title cluster (back · name · status pill) ────────────
// Sits left-aligned in the topbar's title slot (where the "SDR" string
// normally lives). Icon-only back button — no text — so the cluster stays
// compact and lets the lead name read as the page identity.

function DetailTitleCluster({ lead, onBack }: { lead: Lead; onBack: () => void }) {
  const ss = STATUS_STYLES[lead.status];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <IconButton
        variant="ghost"
        size="sm"
        icon={ArrowLeft}
        aria-label="Back to inbox"
        onPress={onBack}
      />
      <span
        aria-hidden
        style={{ width: 1, height: 16, background: 'var(--dark-15)' }}
      />
      <Text variant="largeList" style={{ color: 'var(--dark-90)', fontWeight: 500 }}>
        {lead.prospect.name}
        <span style={{ color: 'var(--dark-60)', fontWeight: 400 }}>
          {' · '}
          {lead.prospect.company}
        </span>
      </Text>
      <StatusPill tone={ss.tone} size="md">{ss.label}</StatusPill>
    </div>
  );
}

// ─── Filters popover ──────────────────────────────────────────────────

function FiltersPopoverButton({
  count,
  open,
  onToggle,
  onClose,
  children,
}: {
  count: number;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const triggerRef = useRef<HTMLDivElement | null>(null);
  // Anchor the popover to the trigger's viewport rect (position: fixed). Now
  // that the Filters button lives in the topbar, an ancestor's stacking or
  // overflow could clip a position: absolute popover — fixed sidesteps that.
  const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(null);
  const POPOVER_WIDTH = 360;
  const VIEWPORT_PADDING = 16;

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // Right-align the popover under the trigger, but clamp so it doesn't
      // bleed off the left edge of the viewport on narrow widths.
      const desiredRight = window.innerWidth - r.right;
      const maxRight = window.innerWidth - POPOVER_WIDTH - VIEWPORT_PADDING;
      setAnchor({ top: r.bottom + 8, right: Math.min(desiredRight, maxRight) });
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div ref={triggerRef} style={{ display: 'inline-flex' }}>
      <Button variant="secondary" size="md" frontIcon={Filter} onPress={onToggle}>
        {count > 0 ? `Filters · ${count}` : 'Filters'}
      </Button>
      {open && anchor && (
        <>
          {/* outside-click catcher */}
          <div
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 9 }}
          />
          <div
            role="dialog"
            aria-label="Filters"
            style={{
              position: 'fixed',
              top: anchor.top,
              right: Math.max(anchor.right, VIEWPORT_PADDING),
              width: POPOVER_WIDTH,
              maxWidth: `calc(100vw - ${VIEWPORT_PADDING * 2}px)`,
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 12,
              boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
              padding: 16,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Text
        variant="metadata"
        style={{ textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--dark-40)' }}
      >
        {label}
      </Text>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{children}</div>
    </div>
  );
}

// ─── Lead row ─────────────────────────────────────────────────────────

interface LeadRowProps {
  lead: Lead;
  isLast: boolean;
  onOpen: () => void;
}

function LeadRow({ lead, isLast, onOpen }: LeadRowProps) {
  const ss = STATUS_STYLES[lead.status];
  const sc = scoreColor(lead.score);
  const snippet = latestSnippet(lead);

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
        gridTemplateColumns:
          '220px 140px minmax(280px, 2fr) 64px 116px',
        gap: 20,
        padding: '12px 20px',
        borderBottom: isLast ? 'none' : '1px solid var(--dark-4)',
        alignItems: 'center',
        cursor: 'pointer',
        background: 'var(--light-100)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dark-2)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--light-100)')}
    >
      {/* Prospect — blue dot at the row's left edge signals fresh activity.
          Absolute-positioned so it never shifts column widths. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minWidth: 0,
          position: 'relative',
        }}
      >
        {relativeMinutesAgo(lead.last_activity_at) <= 20 && (
          <span
            aria-label="New activity"
            style={{
              position: 'absolute',
              left: -16,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--status-posting)',
            }}
          />
        )}
        <Avatar
          src={lead.prospect.avatarUrl}
          fallback={initials(lead.prospect.name)}
          size={32}
        />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Text
            style={{
              fontWeight: 500,
              color: 'var(--dark-90)',
              fontSize: 14,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {lead.prospect.name}
          </Text>
          <Text
            variant="secondary"
            style={{
              fontSize: 12,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {lead.prospect.company}
          </Text>
        </div>
      </div>

      {/* Channel */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <ChannelGlyph channel={lead.channel} size={16} />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Text style={{ fontSize: 12, color: 'var(--dark-90)' }}>
            {CHANNEL_LABELS[lead.channel]}
          </Text>
          {lead.channel === 'missed-call' && (
            <Text style={{ fontSize: 12, color: 'var(--red-70)', fontWeight: 500 }}>
              missed
            </Text>
          )}
        </div>
      </div>

      {/* Last activity — snippet on top, relative timestamp underneath. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <Text
          style={{
            fontSize: 12,
            color: 'var(--dark-90)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.4,
          }}
        >
          {truncate(snippet, 60)}
        </Text>
        <Text style={{ fontSize: 12, color: 'var(--dark-60)' }}>
          {formatRelative(lead.last_activity_at)}
        </Text>
      </div>

      {/* Score — color-coded number. */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: sc.fg,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {lead.score}
        </Text>
      </div>

      {/* Status */}
      <div>
        <StatusPill tone={ss.tone} size="sm">{ss.label}</StatusPill>
      </div>
    </div>
  );
}
