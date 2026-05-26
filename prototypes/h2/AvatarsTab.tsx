import { useState, type CSSProperties, type ReactNode } from 'react';
import {
  Button,
  Heading,
  IconButton,
  Modal,
  ModalStack,
  Text,
  useModals,
} from '@/components';
import type { StackModalProps } from '@/components';
import { StatusPill } from '@/staging';
import Plus from '@/icons/20/Plus';
import PenEdit from '@/icons/16/PenEdit';
import MetaBrand from '@/icons/20/MetaBrand';
import Calendar1 from '@/icons/20/Calendar1';

/**
 * AvatarsTab — Content Preferences > Avatars.
 *
 * One unified grid of avatars (no preset/my split). Each avatar is a card
 * with a UGC-style image, name, short summary, and an edit IconButton.
 * Clicking the edit icon (or the card) opens a detail modal with the full
 * editable profile + enable toggle + delete action.
 *
 * Modal architecture:
 *  - Editing an existing avatar opens EditAvatarModal directly.
 *  - The "+ Add avatar" button opens a single CreateAvatarModal that
 *    manages its own internal two-step state (`step: 'select' | 'edit'`).
 *    This keeps the modal-stack flat (one entry instead of two stacked
 *    modals) and makes "Back" from step 2 a state change, not a pop.
 *  - The edit-step inside CreateAvatarModal shares its layout with
 *    EditAvatarModal via the AvatarEditor component.
 *
 * The modal pattern follows CrosspostWarningModal / OrganicSocial: this
 * file wraps its body in <ModalStack> and uses useModals().openModal(...).
 */

interface AvatarVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  /** Primary metric line, e.g. "1.2M views · 4.8% CTR". */
  metric: string;
  /** Signed delta percentage (-100..+100), shown as ↗ or ↘ next to the metric. */
  deltaPct: number;
  topPerformer?: boolean;
}

type CampaignChannel = 'paid' | 'organic';
type CampaignStatus = 'live' | 'scheduled' | 'ended';

interface AvatarCampaign {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  /** Date hint shown after the chip, e.g. "Started Mar 1 · ends Mar 31". */
  dateHint: string;
}

interface ExampleVideo {
  id: string;
  thumbnailUrl: string;
  duration: string;
}

interface AvatarProfile {
  id: string;
  name: string;
  imageUrl: string;
  summary: string;
  ethnicity: string;
  toneOfVoice: string;
  accent: string;
  visualDescription: string;
  personalCharacteristics: string;
  enabled: boolean;
  videos: AvatarVideo[];
  campaigns: AvatarCampaign[];
}

// ---------------------------------------------------------------------------
// Stock thumbnail pools — varied wellness / lifestyle / beauty / outdoors
// scenes, used to back the per-avatar Videos section and the example-videos
// strip in the create flow. Photos chosen to feel like vertical reel stills.
// ---------------------------------------------------------------------------

const THUMB_POOL = [
  // Interior painting work
  'https://images.unsplash.com/photo-1562259949-a4c54b78b16d?w=400&q=80',
  'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=400&q=80',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
  // Exteriors / home facades
  'https://images.unsplash.com/photo-1572125675722-238a4f1f8ea4?w=400&q=80',
  'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=400&q=80',
  'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400&q=80',
  // Paint detail / process
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80',
  'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80',
  'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&q=80',
  // Kitchens / cabinets
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
  'https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=400&q=80',
  'https://images.unsplash.com/photo-1556909114-44e3e9399a2d?w=400&q=80',
  // Crew in action
  'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=400&q=80',
  'https://images.unsplash.com/photo-1574607383476-c8ee45a07f5e?w=400&q=80',
  'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&q=80',
  // Modern interiors
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
  'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=400&q=80',
];

const thumb = (i: number) => THUMB_POOL[i % THUMB_POOL.length];

const buildVideos = (
  seeds: Array<{
    title: string;
    metric: string;
    deltaPct: number;
    topPerformer?: boolean;
    thumb: number;
  }>,
  avatarId: string,
): AvatarVideo[] =>
  seeds.map((s, idx) => ({
    id: `${avatarId}-vid-${idx}`,
    title: s.title,
    thumbnailUrl: thumb(s.thumb),
    metric: s.metric,
    deltaPct: s.deltaPct,
    topPerformer: s.topPerformer,
  }));

const buildCampaigns = (
  seeds: Array<Omit<AvatarCampaign, 'id'>>,
  avatarId: string,
): AvatarCampaign[] =>
  seeds.map((s, idx) => ({ id: `${avatarId}-camp-${idx}`, ...s }));

// Unsplash portrait URLs (publicly hostable). Sized via ?w= query param.
const AVATARS_SEED: AvatarProfile[] = [
  {
    id: 'brenna',
    name: 'Brenna Walsh',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',
    summary: 'Austin home + DIY creator',
    ethnicity: 'White American',
    toneOfVoice: 'Warm, trustworthy, conversational',
    accent: 'American (Texas)',
    visualDescription:
      'Mid-30s, blonde wavy hair, denim shirts, simple jewelry. Sunlit Austin homes, kitchens, and front porches.',
    personalCharacteristics:
      'Real Austin homeowner. Honest about what painting actually looks like — prep, drips, color-swatch indecision.',
    enabled: true,
    videos: buildVideos(
      [
        { title: 'Westlake exterior — before & after', metric: '1.4M views · 5.2% CTR', deltaPct: 18, topPerformer: true, thumb: 0 },
        { title: 'Painting our front door 5 times', metric: '820K views · 3.8% CTR', deltaPct: 7, thumb: 1 },
        { title: 'How to pick a Texas-heat paint', metric: '612K views · 4.1% CTR', deltaPct: -4, thumb: 2 },
        { title: 'Kitchen cabinet color swatch test', metric: '480K views · 2.9% CTR', deltaPct: 11, thumb: 9 },
        { title: 'Crew day 1 vs day 4 — exterior', metric: '390K views · 3.5% CTR', deltaPct: -12, thumb: 16 },
        { title: 'Color consult walkthrough', metric: '275K views · 2.4% CTR', deltaPct: 5, thumb: 11 },
      ],
      'brenna',
    ),
    campaigns: buildCampaigns(
      [
        { name: 'Spring Exterior Push 2026', channel: 'paid', status: 'live', dateHint: 'Started Mar 1 · ends Mar 31' },
        { name: 'Color Tip Series', channel: 'organic', status: 'live', dateHint: 'Started Mar 8 · ongoing' },
        { name: 'Summer Exterior Drop', channel: 'paid', status: 'scheduled', dateHint: 'Scheduled for Apr 14' },
        { name: 'Westlake Case Study', channel: 'organic', status: 'ended', dateHint: 'Ran Feb 12 – Feb 28' },
        { name: 'Owner POV Q1', channel: 'organic', status: 'ended', dateHint: 'Ran Jan 6 – Feb 4' },
      ],
      'brenna',
    ),
  },
  {
    id: 'marco',
    name: 'Marco Hayes',
    imageUrl:
      'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=600&q=80',
    summary: 'East Austin renovation storyteller',
    ethnicity: 'Black American',
    toneOfVoice: 'Punchy, confident, playful',
    accent: 'American (Texas)',
    visualDescription:
      'Late 20s, close-cropped fade, vintage tees, paint-stained denim. Always shot in front of fresh renovations or rooftop skylines.',
    personalCharacteristics:
      'Renovation tastemaker, knows every paint store and color trend in Austin. Opinionated and quick-witted.',
    enabled: true,
    videos: buildVideos(
      [
        { title: 'East Austin color trends — March', metric: '2.1M views · 6.1% CTR', deltaPct: 24, topPerformer: true, thumb: 15 },
        { title: 'My rental repaint walkthrough', metric: '1.0M views · 4.3% CTR', deltaPct: 9, thumb: 16 },
        { title: 'Paint store haul — Sherwin vs Behr', metric: '740K views · 3.7% CTR', deltaPct: -6, thumb: 12 },
        { title: 'Layered accent walls done right', metric: '510K views · 2.8% CTR', deltaPct: 14, thumb: 6 },
        { title: 'Cedar Park ranch repaint recap', metric: '430K views · 3.2% CTR', deltaPct: -3, thumb: 14 },
      ],
      'marco',
    ),
    campaigns: buildCampaigns(
      [
        { name: 'Spring Color Trend Drop', channel: 'paid', status: 'live', dateHint: 'Started Feb 26 · ends Apr 7' },
        { name: 'Austin Color of the Week', channel: 'organic', status: 'live', dateHint: 'Started Mar 4 · ongoing' },
        { name: 'East Austin Block Series', channel: 'organic', status: 'scheduled', dateHint: 'Scheduled for Apr 22' },
        { name: 'Paint Store Tour Collab', channel: 'paid', status: 'ended', dateHint: 'Ran Jan 20 – Feb 18' },
      ],
      'marco',
    ),
  },
  {
    id: 'tess',
    name: 'Tess Andersen',
    imageUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80',
    summary: 'Minimalist Austin interior stylist',
    ethnicity: 'White American',
    toneOfVoice: 'Calm, precise, understated',
    accent: 'American (Midwest)',
    visualDescription:
      'Early 30s, platinum blonde shoulder-length hair, neutral palette: cream knits, beige trousers, simple loafers. Shot in soft natural light, white-walled Austin interiors.',
    personalCharacteristics:
      'Methodical, design-literate, reserved warmth. Prefers a tight color palette over loud accents.',
    enabled: false,
    videos: buildVideos(
      [
        { title: 'A nine-color whole-house palette', metric: '980K views · 4.6% CTR', deltaPct: 16, topPerformer: true, thumb: 11 },
        { title: 'Cream-on-cream Cedar Park tour', metric: '720K views · 3.9% CTR', deltaPct: 8, thumb: 7 },
        { title: 'Trim color in three steps', metric: '540K views · 3.1% CTR', deltaPct: -5, thumb: 9 },
        { title: 'Quiet design — Austin picks', metric: '410K views · 2.7% CTR', deltaPct: 12, thumb: 6 },
        { title: 'Why I keep painting white', metric: '320K views · 2.2% CTR', deltaPct: -8, thumb: 5 },
      ],
      'tess',
    ),
    campaigns: buildCampaigns(
      [
        { name: 'Minimalist Spring Interior', channel: 'paid', status: 'live', dateHint: 'Started Mar 6 · ends Apr 20' },
        { name: 'Quiet Luxury Editorial', channel: 'organic', status: 'scheduled', dateHint: 'Scheduled for Apr 9' },
        { name: 'Cedar Park Home Edit', channel: 'organic', status: 'live', dateHint: 'Started Mar 10 · ongoing' },
        { name: 'Trim & Doors', channel: 'paid', status: 'ended', dateHint: 'Ran Feb 1 – Feb 28' },
      ],
      'tess',
    ),
  },
  {
    id: 'yuki',
    name: 'Yuki Tanaka',
    imageUrl:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80',
    summary: 'Quiet renovation diarist',
    ethnicity: 'Japanese American',
    toneOfVoice: 'Gentle, thoughtful, observational',
    accent: 'American Midwest',
    visualDescription:
      'Late 20s, shoulder-length straight black hair, soft pastels, oversized button-downs. Renovation diaries in sunlit kitchens and bookshop-quiet living rooms.',
    personalCharacteristics:
      'Introspective, detail-oriented, dry humor. Documents every step of her ongoing Austin home renovation.',
    enabled: true,
    videos: buildVideos(
      [
        { title: 'My library, painted in three colors', metric: '1.1M views · 4.9% CTR', deltaPct: 21, topPerformer: true, thumb: 7 },
        { title: 'Tea-and-paint ritual at sunrise', metric: '680K views · 3.6% CTR', deltaPct: 6, thumb: 1 },
        { title: 'Color-store-hopping in Austin', metric: '520K views · 3.0% CTR', deltaPct: -7, thumb: 16 },
        { title: 'Painting prompts for March', metric: '395K views · 2.6% CTR', deltaPct: 10, thumb: 8 },
        { title: 'Soft-pastel kitchen reveal', metric: '305K views · 2.3% CTR', deltaPct: -4, thumb: 9 },
        { title: 'Five colors that changed my home', metric: '240K views · 2.0% CTR', deltaPct: 3, thumb: 12 },
      ],
      'yuki',
    ),
    campaigns: buildCampaigns(
      [
        { name: 'Mindful Mornings Series', channel: 'organic', status: 'live', dateHint: 'Started Mar 3 · ongoing' },
        { name: 'Q2 Color Refresh Drop', channel: 'paid', status: 'scheduled', dateHint: 'Scheduled for Apr 1' },
        { name: 'Library Reveal Collab', channel: 'organic', status: 'live', dateHint: 'Started Mar 11 · ends Mar 31' },
        { name: 'Winter Interior Push', channel: 'paid', status: 'ended', dateHint: 'Ran Jan 8 – Feb 10' },
        { name: 'Renovation POV — Yuki', channel: 'organic', status: 'ended', dateHint: 'Ran Feb 5 – Feb 26' },
      ],
      'yuki',
    ),
  },
  {
    id: 'james',
    name: 'James Okafor',
    imageUrl:
      'https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=600&q=80',
    summary: 'Bold Austin neighborhood storyteller',
    ethnicity: 'Black American',
    toneOfVoice: 'Warm, authoritative, rhythmic',
    accent: 'American (Texas)',
    visualDescription:
      'Early 30s, deep brown skin, natural twist-out or braids, statement earrings, vivid prints. Outdoor Austin neighborhoods, sunlit homes, front-porch sittings.',
    personalCharacteristics:
      'Charismatic, community-minded, storyteller at heart. Knows every long-time homeowner on his block.',
    enabled: true,
    videos: buildVideos(
      [
        { title: 'East Austin front-porch repaint', metric: '2.4M views · 6.4% CTR', deltaPct: 28, topPerformer: true, thumb: 0 },
        { title: 'Neighborhood color tour', metric: '1.3M views · 4.5% CTR', deltaPct: 11, thumb: 2 },
        { title: 'Bold color fits for spring', metric: '910K views · 3.9% CTR', deltaPct: -6, thumb: 11 },
        { title: 'Hosting 12 in a freshly painted living room', metric: '780K views · 3.5% CTR', deltaPct: 15, thumb: 1 },
        { title: 'Stories from my grandmother\'s kitchen', metric: '560K views · 3.0% CTR', deltaPct: 4, thumb: 14 },
        { title: 'Family Sunday color playlist', metric: '410K views · 2.7% CTR', deltaPct: -2, thumb: 6 },
        { title: 'Outdoor patio paint tour', metric: '320K views · 2.4% CTR', deltaPct: 8, thumb: 13 },
      ],
      'james',
    ),
    campaigns: buildCampaigns(
      [
        { name: 'Spring Front-Porch Drop', channel: 'paid', status: 'live', dateHint: 'Started Mar 5 · ends Apr 5' },
        { name: 'Front Porch Story Series', channel: 'organic', status: 'live', dateHint: 'Started Feb 28 · ongoing' },
        { name: 'Mother\'s Day Kitchen Push', channel: 'paid', status: 'scheduled', dateHint: 'Scheduled for May 1' },
        { name: 'East Austin Storytelling', channel: 'organic', status: 'scheduled', dateHint: 'Scheduled for Apr 18' },
        { name: 'Holiday Hosting Recap', channel: 'organic', status: 'ended', dateHint: 'Ran Dec 5 – Dec 28' },
      ],
      'james',
    ),
  },
  {
    id: 'mateo',
    name: 'Mateo Reyes',
    imageUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80',
    summary: 'Quiet craftsman, Austin trades roots',
    ethnicity: 'Latino (Mexican American)',
    toneOfVoice: 'Soft-spoken, sincere, practical',
    accent: 'American Southwest with light Spanish lilt',
    visualDescription:
      'Mid-30s, warm tan skin, short beard, work shirts and aprons, paint-flecked hands. Workshops, garages, finished exteriors.',
    personalCharacteristics:
      'Patient, hands-on, deeply proud of craft. Says little, but every paint job he shows has been prepped to spec.',
    enabled: false,
    videos: buildVideos(
      [
        { title: 'Workshop tour — color mixing demo', metric: '730K views · 4.1% CTR', deltaPct: 13, topPerformer: true, thumb: 12 },
        { title: 'Caulking trim the right way', metric: '520K views · 3.4% CTR', deltaPct: 6, thumb: 13 },
        { title: 'Father\'s painting tools', metric: '410K views · 2.9% CTR', deltaPct: -5, thumb: 14 },
        { title: 'Quiet hands, slow brush', metric: '290K views · 2.5% CTR', deltaPct: 9, thumb: 6 },
        { title: 'Restoring a Round Rock porch', metric: '195K views · 2.0% CTR', deltaPct: -3, thumb: 5 },
      ],
      'mateo',
    ),
    campaigns: buildCampaigns(
      [
        { name: 'Maker Brand Partnership', channel: 'organic', status: 'live', dateHint: 'Started Mar 7 · ongoing' },
        { name: 'Spring Craft Repaints', channel: 'paid', status: 'scheduled', dateHint: 'Scheduled for Apr 11' },
        { name: 'Crew Open House', channel: 'organic', status: 'scheduled', dateHint: 'Scheduled for Apr 25' },
        { name: 'Holiday Gifting — Painted', channel: 'paid', status: 'ended', dateHint: 'Ran Nov 20 – Dec 15' },
      ],
      'mateo',
    ),
  },
];

// ---------------------------------------------------------------------------
// "Choose an avatar" pool — used by the create flow's selection grid.
// First 3 entries are treated as Recommended.
// ---------------------------------------------------------------------------

type AvatarOption = Omit<AvatarProfile, 'id' | 'enabled' | 'videos' | 'campaigns'> & {
  id: string;
  /** Sample videos showcasing this avatar's style — shown under the image in the create flow. */
  exampleVideos: ExampleVideo[];
};

// Common pool of durations to vary the example tags.
const DURATIONS = ['0:15', '0:22', '0:30', '0:45', '0:18', '0:36'];

const buildExamples = (thumbIndices: number[], optionId: string): ExampleVideo[] =>
  thumbIndices.map((t, idx) => ({
    id: `${optionId}-ex-${idx}`,
    thumbnailUrl: thumb(t),
    duration: DURATIONS[idx % DURATIONS.length],
  }));

const AVATAR_OPTIONS: AvatarOption[] = [
  // --- Recommended (first 3) ---
  {
    id: 'opt-naomi',
    name: 'Naomi Carter',
    imageUrl:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80',
    summary: 'Confident editorial brand voice',
    ethnicity: 'Black American',
    toneOfVoice: 'Polished, warm, authoritative',
    accent: 'American (California)',
    visualDescription:
      'Early 30s, natural curls, tailored blazers over silk camisoles, gold hoops. Soft daylight in modern open offices.',
    personalCharacteristics:
      'Founder energy, thoughtful, direct. Talks like she writes — clean and certain.',
    exampleVideos: buildExamples([7, 9, 11, 16], 'opt-naomi'),
  },
  {
    id: 'opt-luca',
    name: 'Luca Bianchi',
    imageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80',
    summary: 'Charming European lifestyle host',
    ethnicity: 'Southern European (Italian)',
    toneOfVoice: 'Charismatic, expressive, playful',
    accent: 'Italian English',
    visualDescription:
      'Mid-30s, salt-and-pepper hair, linen shirts, espresso bars and seaside terraces. Sun-drenched palette.',
    personalCharacteristics:
      'Bon vivant, generous, story-driven. Always has a recommendation.',
    exampleVideos: buildExamples([0, 1, 16, 5], 'opt-luca'),
  },
  {
    id: 'opt-priya',
    name: 'Priya Shah',
    imageUrl:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80',
    summary: 'Wellness-forward founder voice',
    ethnicity: 'South Asian (Indian American)',
    toneOfVoice: 'Calm, grounded, optimistic',
    accent: 'American (Bay Area)',
    visualDescription:
      'Late 20s, long dark hair, neutral activewear, plants and matcha. Soft morning light.',
    personalCharacteristics:
      'Intentional, kind, articulate. Reads everything and shares the good parts.',
    exampleVideos: buildExamples([3, 5, 1, 7], 'opt-priya'),
  },
  // --- All others ---
  {
    id: 'opt-marcus',
    name: 'Marcus Bell',
    imageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    summary: 'Polished menswear editor',
    ethnicity: 'Black American',
    toneOfVoice: 'Refined, dry, observational',
    accent: 'American (East Coast)',
    visualDescription:
      'Late 30s, clean-cut, tailored suits and overcoats, weathered leather goods. Urban interiors.',
    personalCharacteristics:
      'Style-literate, low-key witty, quietly competitive about craft.',
    exampleVideos: buildExamples([6, 11, 15, 16], 'opt-marcus'),
  },
  {
    id: 'opt-hana',
    name: 'Hana Kim',
    imageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80',
    summary: 'Soft minimalist beauty creator',
    ethnicity: 'Korean American',
    toneOfVoice: 'Soft, gentle, reassuring',
    accent: 'American (West Coast)',
    visualDescription:
      'Late 20s, glass skin, neutral sweaters, ceramics and skincare flat-lays.',
    personalCharacteristics:
      'Detail-oriented, methodical, calmly enthusiastic about routines.',
    exampleVideos: buildExamples([9, 11, 7, 8], 'opt-hana'),
  },
  {
    id: 'opt-david',
    name: 'David Park',
    imageUrl:
      'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=600&q=80',
    summary: 'Tech-forward product reviewer',
    ethnicity: 'Korean American',
    toneOfVoice: 'Crisp, analytical, friendly',
    accent: 'American (Pacific Northwest)',
    visualDescription:
      'Late 20s, hoodie + light denim, desk setups, soft window light.',
    personalCharacteristics:
      'Curious, methodical, generous with explanations. Loves a spec sheet.',
    exampleVideos: buildExamples([8, 7, 6, 12], 'opt-david'),
  },
  {
    id: 'opt-ava',
    name: 'Ava Mitchell',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',
    summary: 'Warm Southern hospitality voice',
    ethnicity: 'White American (Southern)',
    toneOfVoice: 'Warm, expressive, sincere',
    accent: 'American (Texas)',
    visualDescription:
      'Early 30s, wavy blonde hair, linen dresses, golden-hour porch sittings.',
    personalCharacteristics:
      'Hospitable, generous, story-first. Calls everyone "y\'all".',
    exampleVideos: buildExamples([1, 0, 5, 11], 'opt-ava'),
  },
  {
    id: 'opt-kenji',
    name: 'Kenji Sato',
    imageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80',
    summary: 'Quiet craftsman, Japanese roots',
    ethnicity: 'Japanese',
    toneOfVoice: 'Spare, precise, contemplative',
    accent: 'Japanese English',
    visualDescription:
      'Early 40s, indigo workwear, woodworking studio, soft overcast light.',
    personalCharacteristics:
      'Patient, exacting, deeply present. Speaks rarely, observes constantly.',
    exampleVideos: buildExamples([12, 13, 14, 6], 'opt-kenji'),
  },
  {
    id: 'opt-zara',
    name: 'Zara Ahmed',
    imageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80',
    summary: 'Bold modest-fashion creator',
    ethnicity: 'Middle Eastern (Lebanese)',
    toneOfVoice: 'Confident, expressive, playful',
    accent: 'British English (London)',
    visualDescription:
      'Late 20s, statement hijabs, jewel tones, layered jewelry. Architectural backdrops.',
    personalCharacteristics:
      'Bold, opinionated, generous. Builds community everywhere she goes.',
    exampleVideos: buildExamples([11, 15, 7, 9], 'opt-zara'),
  },
  {
    id: 'opt-isabela',
    name: 'Isabela Costa',
    imageUrl:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80',
    summary: 'Sunny Latin American wellness coach',
    ethnicity: 'Latina (Brazilian)',
    toneOfVoice: 'Bright, encouraging, rhythmic',
    accent: 'Brazilian English',
    visualDescription:
      'Early 30s, sun-kissed skin, athleisure, beaches and rooftop yoga.',
    personalCharacteristics:
      'High-energy, motivating, deeply warm. Hugs everyone hello.',
    exampleVideos: buildExamples([3, 5, 11, 7], 'opt-isabela'),
  },
  {
    id: 'opt-noor',
    name: 'Noor Al-Amin',
    imageUrl:
      'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=600&q=80',
    summary: 'Thoughtful design editor',
    ethnicity: 'Middle Eastern',
    toneOfVoice: 'Measured, intellectual, generous',
    accent: 'International English',
    visualDescription:
      'Mid-30s, neat beard, fine-knit cardigans, museums and book-lined offices.',
    personalCharacteristics:
      'Erudite, kind, slow-spoken. Brings every conversation up a level.',
    exampleVideos: buildExamples([7, 12, 16, 6], 'opt-noor'),
  },
  {
    id: 'opt-emily',
    name: 'Emily Chen',
    imageUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80',
    summary: 'Bright millennial founder',
    ethnicity: 'Chinese American',
    toneOfVoice: 'Upbeat, candid, sharp',
    accent: 'American (New York)',
    visualDescription:
      'Late 20s, sleek bob, monochrome basics, co-working spaces and coffee shops.',
    personalCharacteristics:
      'Driven, direct, loves a good list. Ships fast.',
    exampleVideos: buildExamples([16, 8, 7, 11], 'opt-emily'),
  },
  {
    id: 'opt-omar',
    name: 'Omar Diallo',
    imageUrl:
      'https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=600&q=80',
    summary: 'Cosmopolitan travel storyteller',
    ethnicity: 'West African (Senegalese)',
    toneOfVoice: 'Vivid, lyrical, observational',
    accent: 'French-accented English',
    visualDescription:
      'Mid-30s, sharp coats and linen suits, marketplaces and rooftop bars worldwide.',
    personalCharacteristics:
      'Worldly, curious, generous with introductions and meals.',
    exampleVideos: buildExamples([15, 16, 5, 2], 'opt-omar'),
  },
  {
    id: 'opt-rachel',
    name: 'Rachel Stone',
    imageUrl:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80',
    summary: 'Sharp finance explainer',
    ethnicity: 'White American',
    toneOfVoice: 'Direct, analytical, occasionally wry',
    accent: 'American (Midwest)',
    visualDescription:
      'Early 40s, blazer and white tee, clean desk, second-screen energy.',
    personalCharacteristics:
      'No-nonsense, deeply read, allergic to jargon. Trusts spreadsheets.',
    exampleVideos: buildExamples([8, 7, 16, 6], 'opt-rachel'),
  },
  {
    id: 'opt-arman',
    name: 'Arman Petrosyan',
    imageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80',
    summary: 'Architecture-loving city walker',
    ethnicity: 'Armenian',
    toneOfVoice: 'Thoughtful, descriptive, gently funny',
    accent: 'European English',
    visualDescription:
      'Late 30s, wool coats, tortoise glasses, narrow streets and modernist interiors.',
    personalCharacteristics:
      'Quietly opinionated, walks everywhere, knows every good bakery.',
    exampleVideos: buildExamples([15, 16, 6, 12], 'opt-arman'),
  },
  {
    id: 'opt-sade',
    name: 'Sade Williams',
    imageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80',
    summary: 'Plant-forward food voice',
    ethnicity: 'Black British',
    toneOfVoice: 'Warm, expressive, sensorial',
    accent: 'British (London)',
    visualDescription:
      'Early 30s, locs, aprons, farmers-markets and bright kitchens.',
    personalCharacteristics:
      'Generous host, passionate about provenance, lives by the seasons.',
    exampleVideos: buildExamples([0, 2, 1, 13], 'opt-sade'),
  },
  {
    id: 'opt-tomas',
    name: 'Tomás Herrera',
    imageUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80',
    summary: 'Outdoor adventure brand voice',
    ethnicity: 'Latino (Chilean)',
    toneOfVoice: 'Energetic, plainspoken, motivating',
    accent: 'Latin American English',
    visualDescription:
      'Mid-30s, weathered jacket, mountains and trails. Cold-weather palette.',
    personalCharacteristics:
      'Action-first, generous teacher, allergic to fluff.',
    exampleVideos: buildExamples([5, 3, 6, 16], 'opt-tomas'),
  },
];

const RECOMMENDED_COUNT = 3;

// ---------------------------------------------------------------------------
// Tab body
// ---------------------------------------------------------------------------

export function AvatarsTab() {
  return (
    <ModalStack>
      <AvatarsTabBody />
    </ModalStack>
  );
}

function AvatarsTabBody() {
  const [avatars, setAvatars] = useState<AvatarProfile[]>(AVATARS_SEED);
  const { openModal } = useModals();

  const updateAvatar = (id: string, patch: Partial<AvatarProfile>) => {
    setAvatars((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeAvatar = (id: string) => {
    setAvatars((rows) => rows.filter((r) => r.id !== id));
  };

  const addAvatarToList = (avatar: AvatarProfile) => {
    setAvatars((rows) => [...rows, avatar]);
  };

  const openEdit = (avatar: AvatarProfile) => {
    openModal(EditAvatarModal, {
      avatar,
      onSave: (patch) => updateAvatar(avatar.id, patch),
      onDelete: () => removeAvatar(avatar.id),
    });
  };

  const openCreate = () => {
    openModal(CreateAvatarModal, {
      onAdd: addAvatarToList,
    });
  };

  return (
    <section style={{ marginBottom: 48 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          borderBottom: '1px solid var(--dark-8)',
          paddingBottom: 12,
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Heading level={3} style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.2px' }}>
            Avatars
          </Heading>
          <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
            People who appear and speak in your content. Toggle them on to include in your rotation,
            or edit their persona, look, and voice.
          </Text>
        </div>
        <div style={{ flexShrink: 0 }}>
          <Button variant="secondary" size="sm" frontIcon={Plus} onClick={openCreate}>
            Add avatar
          </Button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        {avatars.map((avatar) => (
          <AvatarCard
            key={avatar.id}
            avatar={avatar}
            onEdit={() => openEdit(avatar)}
          />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

function AvatarCard({ avatar, onEdit }: { avatar: AvatarProfile; onEdit: () => void }) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        opacity: avatar.enabled ? 1 : 0.6,
        transition: 'opacity 160ms ease',
      }}
      onClick={onEdit}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit();
        }
      }}
      aria-label={`Edit ${avatar.name}`}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 3',
          background: 'var(--dark-4)',
          overflow: 'hidden',
        }}
      >
        <img
          src={avatar.imageUrl}
          alt={avatar.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'var(--light-100)',
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            variant="ghost"
            size="sm"
            icon={PenEdit}
            title={`Edit ${avatar.name}`}
            onPress={onEdit}
          />
        </div>
        {!avatar.enabled && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              padding: '4px 8px',
              background: 'rgba(0, 0, 0, 0.6)',
              color: 'var(--light-100)',
              fontFamily: "'Sohne', sans-serif",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              borderRadius: 6,
            }}
          >
            Off
          </div>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          padding: '16px 16px 20px',
        }}
      >
        <Heading level={5} style={{ fontSize: 16, fontWeight: 500, color: 'var(--dark-90)' }}>
          {avatar.name}
        </Heading>
        <Text variant="secondary" style={{ color: 'var(--dark-60)', fontSize: 14 }}>
          {avatar.summary}
        </Text>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Edit modal (existing avatar) — two-column layout
// ---------------------------------------------------------------------------

interface EditAvatarModalProps {
  avatar: AvatarProfile;
  onSave: (patch: Partial<AvatarProfile>) => void;
  onDelete: () => void;
}

function EditAvatarModal({
  close,
  avatar,
  onSave,
  onDelete,
}: StackModalProps & EditAvatarModalProps) {
  const [draft, setDraft] = useState<AvatarProfile>(avatar);

  const save = () => {
    onSave({
      name: draft.name,
      imageUrl: draft.imageUrl,
      summary: draft.summary,
      ethnicity: draft.ethnicity,
      toneOfVoice: draft.toneOfVoice,
      accent: draft.accent,
      visualDescription: draft.visualDescription,
      personalCharacteristics: draft.personalCharacteristics,
      enabled: draft.enabled,
    });
    close();
  };

  const remove = () => {
    onDelete();
    close();
  };

  return (
    <Modal.Root size="lg" aria-labelledby="edit-avatar-title" data-testid="edit-avatar-modal">
      <Modal.Header title={draft.name || 'Edit avatar'} id="edit-avatar-title" onClose={close} />
      <Modal.Content>
        <AvatarEditor draft={draft} onChange={setDraft} onDelete={remove} />
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={save}>
            Save
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ---------------------------------------------------------------------------
// Create modal — two-step flow (select then edit) in a single modal
// ---------------------------------------------------------------------------

interface CreateAvatarModalProps {
  onAdd: (avatar: AvatarProfile) => void;
}

function CreateAvatarModal({
  close,
  onAdd,
}: StackModalProps & CreateAvatarModalProps) {
  const [step, setStep] = useState<'select' | 'edit'>('select');
  const [draft, setDraft] = useState<AvatarProfile | null>(null);
  // Hold the picked option's example videos so the edit step can show them
  // below the sticky image. New avatars start with empty videos/campaigns —
  // the example videos are samples, not real generated content.
  const [exampleVideos, setExampleVideos] = useState<ExampleVideo[]>([]);

  const handleSelect = (option: AvatarOption) => {
    const next: AvatarProfile = {
      id: `avatar-${Date.now()}`,
      name: option.name,
      imageUrl: option.imageUrl,
      summary: option.summary,
      ethnicity: option.ethnicity,
      toneOfVoice: option.toneOfVoice,
      accent: option.accent,
      visualDescription: option.visualDescription,
      personalCharacteristics: option.personalCharacteristics,
      enabled: true,
      videos: [],
      campaigns: [],
    };
    setDraft(next);
    setExampleVideos(option.exampleVideos);
    setStep('edit');
  };

  const handleBack = () => {
    setStep('select');
  };

  const handleAdd = () => {
    if (!draft) return;
    onAdd(draft);
    close();
  };

  if (step === 'select') {
    return (
      <Modal.Root
        size="lg"
        aria-labelledby="create-avatar-title"
        data-testid="create-avatar-modal"
      >
        <Modal.Header
          title="Choose an avatar"
          id="create-avatar-title"
          onClose={close}
        />
        <Modal.Content>
          <SelectionGrid options={AVATAR_OPTIONS} onSelect={handleSelect} />
        </Modal.Content>
        <Modal.Footer>
          <Modal.FooterContent slot="right">
            <Modal.FooterButton variant="ghost" onPress={close}>
              Cancel
            </Modal.FooterButton>
          </Modal.FooterContent>
        </Modal.Footer>
      </Modal.Root>
    );
  }

  // step === 'edit'
  return (
    <Modal.Root
      size="lg"
      aria-labelledby="create-avatar-edit-title"
      data-testid="create-avatar-modal"
    >
      <Modal.Header
        title={draft?.name || 'Edit avatar'}
        id="create-avatar-edit-title"
        onClose={close}
      />
      <Modal.Content>
        {draft && (
          <AvatarEditor
            draft={draft}
            onChange={setDraft}
            exampleVideos={exampleVideos}
            // No delete control inside the create flow.
          />
        )}
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={handleBack}>
            Back
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <div style={{ display: 'flex', gap: 8 }}>
            <Modal.FooterButton variant="ghost" onPress={close}>
              Cancel
            </Modal.FooterButton>
            <Modal.FooterButton variant="primary" onPress={handleAdd}>
              Add to my avatars
            </Modal.FooterButton>
          </div>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ---------------------------------------------------------------------------
// Selection grid (step 1 of create flow)
// ---------------------------------------------------------------------------

function SelectionGrid({
  options,
  onSelect,
}: {
  options: AvatarOption[];
  onSelect: (option: AvatarOption) => void;
}) {
  const recommended = options.slice(0, RECOMMENDED_COUNT);
  const rest = options.slice(RECOMMENDED_COUNT);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Recommended section */}
      <SelectionSection
        label="Recommended for you"
        sublabel="Hand-picked to match your brand voice and audience."
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 16,
          }}
        >
          {recommended.map((option) => (
            <OptionCard
              key={option.id}
              option={option}
              recommended
              onSelect={() => onSelect(option)}
            />
          ))}
        </div>
      </SelectionSection>

      <div style={{ height: 1, background: 'var(--dark-8)' }} />

      {/* All avatars section */}
      <SelectionSection label="All avatars">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 16,
          }}
        >
          {rest.map((option) => (
            <OptionCard
              key={option.id}
              option={option}
              onSelect={() => onSelect(option)}
            />
          ))}
        </div>
      </SelectionSection>
    </div>
  );
}

function SelectionSection({
  label,
  sublabel,
  children,
}: {
  label: string;
  sublabel?: string;
  children: ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>
          {label}
        </Text>
        {sublabel && (
          <Text style={{ fontSize: 12, color: 'var(--dark-60)' }}>{sublabel}</Text>
        )}
      </div>
      {children}
    </div>
  );
}

function OptionCard({
  option,
  recommended = false,
  onSelect,
}: {
  option: AvatarOption;
  recommended?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        padding: 0,
        textAlign: 'left',
        font: 'inherit',
        color: 'inherit',
        transition: 'border-color 160ms ease, transform 160ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--dark-15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--dark-8)';
      }}
      aria-label={`Choose ${option.name}`}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          background: 'var(--dark-4)',
          overflow: 'hidden',
        }}
      >
        <img
          src={option.imageUrl}
          alt={option.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        {recommended && (
          <StatusPill
            tone="accent"
            size="sm"
            style={{ position: 'absolute', top: 8, left: 8 }}
          >
            Recommended
          </StatusPill>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          padding: 12,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--dark-90)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {option.name}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: 'var(--dark-60)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {option.summary}
        </Text>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// AvatarEditor — shared two-column editor for both Edit + Create flows
// ---------------------------------------------------------------------------

function AvatarEditor({
  draft,
  onChange,
  onDelete,
  exampleVideos,
}: {
  draft: AvatarProfile;
  onChange: (next: AvatarProfile) => void;
  onDelete?: () => void;
  /**
   * When provided (create flow), render an EXAMPLE VIDEOS strip under the
   * sticky image. These are *samples* — not yet generated by the user.
   */
  exampleVideos?: ExampleVideo[];
}) {
  const set = <K extends keyof AvatarProfile>(key: K, value: AvatarProfile[K]) => {
    onChange({ ...draft, [key]: value });
  };

  const hasVideos = draft.videos.length > 0;
  const hasCampaigns = draft.campaigns.length > 0;
  const hasExamples = !!exampleVideos && exampleVideos.length > 0;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '300px minmax(0, 1fr)',
        gap: 32,
        alignItems: 'start',
      }}
    >
      {/* LEFT — sticky image column (image + optional example-videos strip) */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div
          style={{
            width: '100%',
            aspectRatio: '3 / 4',
            borderRadius: 12,
            overflow: 'hidden',
            background: 'var(--dark-4)',
            border: '1px solid var(--dark-8)',
          }}
        >
          <img
            src={draft.imageUrl}
            alt={draft.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

        {hasExamples ? (
          <ExampleVideosStrip videos={exampleVideos!} />
        ) : (
          <Text style={{ fontSize: 12, color: 'var(--dark-60)' }}>
            Update the image by pasting a new URL in the right column.
          </Text>
        )}
      </div>

      {/* RIGHT — scrollable form column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <FieldGroup>
          <Field label="Name">
            <TextField value={draft.name} onChange={(v) => set('name', v)} />
          </Field>
          <Field label="Short summary" hint="Shown on the avatar card.">
            <TextField value={draft.summary} onChange={(v) => set('summary', v)} />
          </Field>
          <Field label="Image URL">
            <TextField value={draft.imageUrl} onChange={(v) => set('imageUrl', v)} />
          </Field>
          <Field label="Ethnicity">
            <TextField value={draft.ethnicity} onChange={(v) => set('ethnicity', v)} />
          </Field>
          <Field label="Tone of voice" hint="e.g. Warm, authoritative">
            <TextField value={draft.toneOfVoice} onChange={(v) => set('toneOfVoice', v)} />
          </Field>
          <Field label="Accent" hint="e.g. American Midwest, British RP">
            <TextField value={draft.accent} onChange={(v) => set('accent', v)} />
          </Field>
          <Field label="Visual description" hint="What they look like, what they wear.">
            <TextArea
              value={draft.visualDescription}
              onChange={(v) => set('visualDescription', v)}
              rows={3}
            />
          </Field>
          <Field label="Personal characteristics" hint="Personality traits, habits.">
            <TextArea
              value={draft.personalCharacteristics}
              onChange={(v) => set('personalCharacteristics', v)}
              rows={3}
            />
          </Field>
        </FieldGroup>

        {/* Enabled toggle row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '12px 16px',
            background: 'var(--dark-2)',
            border: '1px solid var(--dark-8)',
            borderRadius: 10,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>
              Include in content rotation
            </Text>
            <Text style={{ fontSize: 14, color: 'var(--dark-60)' }}>
              When off, this avatar will be skipped during generation.
            </Text>
          </div>
          <Toggle
            checked={draft.enabled}
            onChange={() => set('enabled', !draft.enabled)}
            label={`Enable ${draft.name}`}
          />
        </div>

        {/* Videos generated with this avatar — only on existing avatars. */}
        {hasVideos && <VideosSection videos={draft.videos} />}

        {/* Campaigns using this avatar — only on existing avatars. */}
        {hasCampaigns && <CampaignsSection campaigns={draft.campaigns} />}

        {/* Delete avatar — only shown when caller wires onDelete */}
        {onDelete && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              paddingTop: 8,
              borderTop: '1px solid var(--dark-8)',
            }}
          >
            <Button variant="ghost" size="sm" color="var(--red-70)" onPress={onDelete}>
              Delete avatar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Example videos strip — used in the create flow under the sticky image.
// Horizontally-scrollable row of 80px-tall thumbs with a duration tag.
// ---------------------------------------------------------------------------

function ExampleVideosStrip({ videos }: { videos: ExampleVideo[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Text
        variant="metadata"
        style={{
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--dark-60)',
        }}
      >
        Example videos
      </Text>
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
        }}
      >
        {videos.map((v) => (
          <div
            key={v.id}
            style={{
              position: 'relative',
              flex: '0 0 auto',
              width: 60,
              height: 80,
              borderRadius: 8,
              overflow: 'hidden',
              background: 'var(--dark-4)',
              border: '1px solid var(--dark-8)',
            }}
          >
            <img
              src={v.thumbnailUrl}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                padding: '2px 4px',
                background: 'rgba(0,0,0,0.65)',
                color: 'var(--light-100)',
                fontFamily: "'Sohne', sans-serif",
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.02em',
                borderRadius: 4,
                lineHeight: 1,
              }}
            >
              {v.duration}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Videos section (Section A) — 2-column grid of generated videos with tiny
// performance metric + trend arrow + optional "Top performer" pill.
// ---------------------------------------------------------------------------

function VideosSection({ videos }: { videos: AvatarVideo[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionHeader
        title="Videos generated"
        caption="Performance across the past 90 days"
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 12,
        }}
      >
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </div>
  );
}

function VideoCard({ video }: { video: AvatarVideo }) {
  const positive = video.deltaPct >= 0;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          background: 'var(--dark-4)',
        }}
      >
        <img
          src={video.thumbnailUrl}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {video.topPerformer && (
          <StatusPill
            tone="accent"
            size="sm"
            style={{ position: 'absolute', top: 8, left: 8 }}
          >
            Top performer
          </StatusPill>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          padding: '8px 12px 12px',
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--dark-90)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={video.title}
        >
          {video.title}
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 12, color: 'var(--dark-60)' }}>{video.metric}</Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: positive ? 'var(--status-approved)' : 'var(--red-70)',
              whiteSpace: 'nowrap',
            }}
          >
            {positive ? '↗' : '↘'} {Math.abs(video.deltaPct)}%
          </Text>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Campaigns section (Section B) — vertical list of campaigns with channel
// icon, name, type chip, status dot, and date hint.
// ---------------------------------------------------------------------------

function CampaignsSection({ campaigns }: { campaigns: AvatarCampaign[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionHeader
        title="Campaigns using this avatar"
        caption="Active, scheduled, and recently ended."
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        {campaigns.map((c, idx) => (
          <CampaignRow
            key={c.id}
            campaign={c}
            isLast={idx === campaigns.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

const TYPE_CHIP: Record<CampaignChannel, { label: string; color: string }> = {
  paid: { label: 'Paid Social', color: 'var(--status-posting)' },
  organic: { label: 'Organic Social', color: 'var(--status-approved)' },
};

const STATUS_META: Record<CampaignStatus, { label: string; color: string }> = {
  live: { label: 'Live', color: 'var(--status-approved)' },
  scheduled: { label: 'Scheduled', color: 'var(--status-posting)' },
  ended: { label: 'Ended', color: 'var(--dark-60)' },
};

function CampaignRow({
  campaign,
  isLast,
}: {
  campaign: AvatarCampaign;
  isLast: boolean;
}) {
  const ChannelIcon = campaign.channel === 'paid' ? MetaBrand : Calendar1;
  const chip = TYPE_CHIP[campaign.channel];
  const status = STATUS_META[campaign.status];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--dark-8)',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'var(--dark-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChannelIcon size={20} color="var(--dark-80)" />
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--dark-90)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={campaign.name}
        >
          {campaign.name}
        </Text>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <TypeChip color={chip.color}>{chip.label}</TypeChip>
          <StatusDot color={status.color} label={status.label} />
          <Text style={{ fontSize: 12, color: 'var(--dark-60)' }}>
            · {campaign.dateHint}
          </Text>
        </div>
      </div>
    </div>
  );
}

function TypeChip({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        fontFamily: "'Sohne', sans-serif",
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: '0.02em',
        color,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        borderRadius: 999,
        lineHeight: 1.4,
      }}
    >
      {children}
    </span>
  );
}

function StatusDot({ color, label }: { color: string; label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontFamily: "'Sohne', sans-serif",
        fontSize: 12,
        fontWeight: 500,
        color,
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
        }}
      />
      {label}
    </span>
  );
}

function SectionHeader({ title, caption }: { title: string; caption: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        paddingTop: 8,
        borderTop: '1px solid var(--dark-8)',
      }}
    >
      <Heading level={5} style={{ fontSize: 16, fontWeight: 500, color: 'var(--dark-90)' }}>
        {title}
      </Heading>
      <Text variant="secondary" style={{ fontSize: 12, color: 'var(--dark-60)' }}>
        {caption}
      </Text>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form primitives (inline — small, prototype-only)
// ---------------------------------------------------------------------------

function FieldGroup({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>{children}</div>;
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{label}</Text>
      {hint && (
        <Text style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: -4 }}>
          {hint}
        </Text>
      )}
      {children}
    </div>
  );
}

const inputBaseStyle: CSSProperties = {
  width: '100%',
  padding: 12,
  border: '1px solid var(--dark-8)',
  borderRadius: 8,
  background: 'var(--light-100)',
  fontFamily: "'Sohne', sans-serif",
  fontSize: 14,
  color: 'var(--dark-90)',
  outline: 'none',
  boxSizing: 'border-box',
};

function TextField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={inputBaseStyle}
    />
  );
}

function TextArea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      style={{ ...inputBaseStyle, resize: 'vertical', lineHeight: 1.5 }}
    />
  );
}

// ---------------------------------------------------------------------------
// Toggle — duplicated from prototypes/h2/pages/Tools.tsx (with onChange wired in).
// Sharing felt like over-engineering for two callers.
// ---------------------------------------------------------------------------

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: 34,
        height: 20,
        flexShrink: 0,
        borderRadius: 999,
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        background: checked ? 'var(--dark-90)' : 'var(--dark-15)',
        transition: 'background-color 160ms ease',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 16 : 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: 'var(--light-100)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
          transition: 'left 160ms ease',
        }}
      />
    </button>
  );
}
