import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Button,
  Heading,
  Modal,
  ModalStack,
  Text,
  useModals,
} from '@/components';
import type { StackModalProps } from '@/components';
import { StatusPill } from '@/staging';
import type { StatusPillTone } from '@/staging';
import { AvatarCard } from './CreatePostFlow';
import Plus from '@/icons/20/Plus';
import MetaBrand from '@/icons/20/MetaBrand';
import Calendar1 from '@/icons/20/Calendar1';
import Shuffle from '@/icons/20/Shuffle';
import Help from '@/icons/16/Help';
import ChevronDown from '@/icons/20/ChevronDown';
import ChevronUp from '@/icons/20/ChevronUp';
import Check from '@/icons/16/Check';
import Upload from '@/icons/20/Upload';
import SmileyHappyPlus from '@/icons/20/SmileyHappyPlus';

/**
 * AvatarsTab — Content Preferences > Avatars.
 *
 * One unified grid of avatars (no preset/my split), rendered with the shared
 * tall AvatarCard from CreatePostFlow (the same portrait card used in the
 * create-flow "My Avatars" picker): a 3 / 4 image plus name + short summary.
 * Clicking a card opens a detail modal with the full editable profile +
 * enable toggle + delete action. A dashed "Add avatar" tile closes the grid.
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

type LogoPlacement = 'bottom' | 'floating';

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
  // --- Appearance / Behavior / Background settings (defaults applied via withDefaults) ---
  gender?: string;
  ageRange?: string;
  appearanceEthnicity?: string;
  outfit?: string;
  moreDetails?: string;
  behavior?: string;
  guidanceScale?: number;
  sceneType?: string;
  brandLogoUploaded?: boolean;
  logoPlacement?: LogoPlacement;
}

// Sensible defaults for the Appearance/Behavior/Background sections. Applied
// when an avatar (seed or freshly-picked option) doesn't carry these yet.
const SETTINGS_DEFAULTS = {
  gender: 'Male',
  ageRange: 'Young Adult',
  appearanceEthnicity: 'Caucasian',
  outfit: '',
  moreDetails: '',
  behavior: '',
  guidanceScale: 1.0,
  sceneType: '',
  brandLogoUploaded: false,
  logoPlacement: 'bottom' as LogoPlacement,
};

const withSettingsDefaults = (avatar: AvatarProfile): AvatarProfile => ({
  ...SETTINGS_DEFAULTS,
  ...avatar,
});

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary'];
const AGE_OPTIONS = ['Teen', 'Young Adult', 'Adult', 'Senior'];
const ETHNICITY_OPTIONS = [
  'Caucasian',
  'Black',
  'Hispanic',
  'Asian',
  'Middle Eastern',
  'South Asian',
];
const OUTFIT_PRESETS = [
  'Casual',
  'Formal',
  'Sporty',
  'Doctor',
  'Nurse',
  'Chef',
  'Worker',
  'Construction',
];

// ---------------------------------------------------------------------------
// Stock thumbnail pools — varied wellness / lifestyle / beauty / outdoors
// scenes, used to back the per-avatar Videos section and the example-videos
// strip in the create flow. Photos chosen to feel like vertical reel stills.
// ---------------------------------------------------------------------------

const THUMB_POOL = [
  // Interior painting work
  'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400&q=80',
  'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=400&q=80',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
  // Exteriors / home facades
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80',
  'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=400&q=80',
  'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400&q=80',
  // Paint detail / process
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80',
  'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80',
  'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&q=80',
  // Kitchens / cabinets
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
  'https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=400&q=80',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
  // Crew in action
  'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=400&q=80',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80',
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
  const [playing, setPlaying] = useState<string | null>(null);
  const playTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { openModal } = useModals();

  const togglePlay = (id: string) => {
    if (playTimer.current) clearTimeout(playTimer.current);
    setPlaying((cur) => {
      if (cur === id) return null;
      playTimer.current = setTimeout(() => setPlaying(null), 2200);
      return id;
    });
  };

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
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 14,
        }}
      >
        {avatars.map((avatar) => (
          <AvatarCard
            key={avatar.id}
            img={avatar.imageUrl}
            name={avatar.name}
            desc={avatar.summary}
            onClick={() => openEdit(avatar)}
            playing={playing === avatar.id}
            onPlay={() => togglePlay(avatar.id)}
          />
        ))}
        <AddAvatarTile onClick={openCreate} />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Add-avatar tile — a portrait-proportioned dashed tile that matches the
// height of the shared AvatarCard and opens the CreateAvatarModal.
// ---------------------------------------------------------------------------

function AddAvatarTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add avatar"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        minHeight: '100%',
        padding: 16,
        background: 'var(--dark-2)',
        border: '1px dashed var(--dark-15)',
        borderRadius: 8,
        cursor: 'pointer',
        font: 'inherit',
        color: 'inherit',
        textAlign: 'center',
        transition: 'border-color 160ms ease, background 160ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--dark-40)';
        e.currentTarget.style.background = 'var(--dark-4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--dark-15)';
        e.currentTarget.style.background = 'var(--dark-2)';
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Plus size={20} color="var(--dark-80)" />
      </div>
      <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>
        Add avatar
      </Text>
    </button>
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
  const [draft, setDraft] = useState<AvatarProfile>(() => withSettingsDefaults(avatar));

  const save = () => {
    onSave({ ...draft });
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
  // entry  → pick a path (browse our avatars vs. start blank / upload your own)
  // select → grid of pre-made avatars to choose from
  // edit   → the shared AvatarEditor
  const [step, setStep] = useState<'entry' | 'select' | 'edit'>('entry');
  const [draft, setDraft] = useState<AvatarProfile | null>(null);
  // Tracks how the user reached the edit step, so "Back" returns to the right
  // place (the entry chooser for an uploaded blank, the grid for a picked one).
  const [origin, setOrigin] = useState<'entry' | 'select'>('entry');
  // Hold the picked option's example videos so the edit step can show them
  // below the sticky image. New avatars start with empty videos/campaigns —
  // the example videos are samples, not real generated content.
  const [exampleVideos, setExampleVideos] = useState<ExampleVideo[]>([]);

  const handleSelect = (option: AvatarOption) => {
    const next = withSettingsDefaults({
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
    });
    setDraft(next);
    setExampleVideos(option.exampleVideos);
    setOrigin('select');
    setStep('edit');
  };

  // Start-blank path: a fresh, empty avatar the user uploads their own
  // video/photo for. No example videos — they bring their own footage.
  const handleStartBlank = () => {
    const next = withSettingsDefaults({
      id: `avatar-${Date.now()}`,
      name: '',
      imageUrl: '',
      summary: '',
      ethnicity: '',
      toneOfVoice: '',
      accent: '',
      visualDescription: '',
      personalCharacteristics: '',
      enabled: true,
      videos: [],
      campaigns: [],
    });
    setDraft(next);
    setExampleVideos([]);
    setOrigin('entry');
    setStep('edit');
  };

  const handleBack = () => {
    setStep(origin);
  };

  const handleAdd = () => {
    if (!draft) return;
    onAdd(draft);
    close();
  };

  if (step === 'entry') {
    return (
      <Modal.Root
        size="lg"
        aria-labelledby="create-avatar-entry-title"
        data-testid="create-avatar-modal"
      >
        <Modal.Header
          title="Add an avatar"
          id="create-avatar-entry-title"
          onClose={close}
        />
        <Modal.Content>
          <EntryChooser
            onBrowse={() => setStep('select')}
            onStartBlank={handleStartBlank}
          />
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
          <Modal.FooterContent slot="left">
            <Modal.FooterButton variant="ghost" onPress={() => setStep('entry')}>
              Back
            </Modal.FooterButton>
          </Modal.FooterContent>
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
        title={draft?.name || (origin === 'entry' ? 'New avatar' : 'Edit avatar')}
        id="create-avatar-edit-title"
        onClose={close}
      />
      <Modal.Content>
        {draft && (
          <AvatarEditor
            draft={draft}
            onChange={setDraft}
            exampleVideos={exampleVideos}
            // Blank/upload drafts have no source image yet → editor shows an
            // upload tile in the media column instead of a preview.
            isBlank={origin === 'entry'}
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
// Entry chooser (step 0 of create flow) — pick a creation path:
//  - Browse our avatars (the existing pre-made selection grid)
//  - Start blank: upload your own video/photo of the proposed avatar (mock)
// ---------------------------------------------------------------------------

function EntryChooser({
  onBrowse,
  onStartBlank,
}: {
  onBrowse: () => void;
  onStartBlank: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Text style={{ fontSize: 14, color: 'var(--dark-60)' }}>
        Pick a ready-made avatar to customize, or start blank and upload your own
        video or photo to build from.
      </Text>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        {/* Path 1 — browse our avatars */}
        <button
          type="button"
          onClick={onBrowse}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: 20,
            textAlign: 'left',
            background: 'var(--light-100)',
            border: '1px solid var(--dark-8)',
            borderRadius: 12,
            cursor: 'pointer',
            font: 'inherit',
            color: 'inherit',
            transition: 'border-color 160ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--dark-15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--dark-8)';
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'var(--dark-4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SmileyHappyPlus size={20} color="var(--dark-80)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>
              Choose from our avatars
            </Text>
            <Text style={{ fontSize: 12, color: 'var(--dark-60)' }}>
              Browse a library of ready-made avatars and tailor one to your brand.
            </Text>
          </div>
        </button>

        {/* Path 2 — start blank / upload your own */}
        <button
          type="button"
          onClick={onStartBlank}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: 20,
            textAlign: 'left',
            background: 'var(--light-100)',
            border: '1px dashed var(--dark-15)',
            borderRadius: 12,
            cursor: 'pointer',
            font: 'inherit',
            color: 'inherit',
            transition: 'border-color 160ms ease, background 160ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--dark-40)';
            e.currentTarget.style.background = 'var(--dark-2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--dark-15)';
            e.currentTarget.style.background = 'var(--light-100)';
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'var(--dark-4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Upload size={20} color="var(--dark-80)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>
              Start blank — upload your own
            </Text>
            <Text style={{ fontSize: 12, color: 'var(--dark-60)' }}>
              Upload a video or photo of the avatar you want, then describe it.
            </Text>
          </div>
        </button>
      </div>
    </div>
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
  isBlank = false,
}: {
  draft: AvatarProfile;
  onChange: (next: AvatarProfile) => void;
  onDelete?: () => void;
  /**
   * When provided (create flow), render an EXAMPLE VIDEOS strip under the
   * video preview. These are *samples* — not yet generated by the user.
   */
  exampleVideos?: ExampleVideo[];
  /**
   * Blank/upload drafts have no source media yet → the media column shows a
   * large dashed upload tile instead of a video preview.
   */
  isBlank?: boolean;
}) {
  const set = <K extends keyof AvatarProfile>(key: K, value: AvatarProfile[K]) => {
    onChange({ ...draft, [key]: value });
  };

  // Local-only mock: pretend the user uploaded their own clip. We reuse the
  // first thumb from the pool so the preview has something to show.
  const [uploadedMedia, setUploadedMedia] = useState<string | null>(null);
  const handleMockUpload = () => setUploadedMedia(thumb(0) ?? '');
  const previewUrl = draft.imageUrl || uploadedMedia || '';

  const handleOutfitPreset = (preset: string) => set('outfit', preset);
  const handleRandomizeOutfit = () => {
    const pick = OUTFIT_PRESETS[Math.floor(Math.random() * OUTFIT_PRESETS.length)];
    set('outfit', pick ?? 'Casual');
  };

  const hasVideos = draft.videos.length > 0;
  const hasCampaigns = draft.campaigns.length > 0;
  const hasExamples = !!exampleVideos && exampleVideos.length > 0;
  const showUploadTile = isBlank && !previewUrl;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '300px minmax(0, 1fr)',
        gap: 32,
        alignItems: 'start',
      }}
    >
      {/* LEFT — sticky media column (video preview + example-videos strip) */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {showUploadTile ? (
          <UploadMediaTile onUpload={handleMockUpload} />
        ) : (
          <VideoPreview imageUrl={previewUrl} label={draft.name} />
        )}

        {hasExamples ? (
          <ExampleVideosStrip videos={exampleVideos!} />
        ) : showUploadTile ? (
          <Text style={{ fontSize: 12, color: 'var(--dark-60)' }}>
            Upload a video or photo of your avatar to preview it here.
          </Text>
        ) : (
          <Text style={{ fontSize: 12, color: 'var(--dark-60)' }}>
            This is a preview of how your avatar will appear in generated videos.
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
          <Field label="Tone of voice" hint="e.g. Warm, authoritative">
            <TextField value={draft.toneOfVoice} onChange={(v) => set('toneOfVoice', v)} />
          </Field>
          <Field label="Accent" hint="e.g. American Midwest, British RP">
            <TextField value={draft.accent} onChange={(v) => set('accent', v)} />
          </Field>
          <Field label="Personal characteristics" hint="Personality traits, habits.">
            <TextArea
              value={draft.personalCharacteristics}
              onChange={(v) => set('personalCharacteristics', v)}
              rows={3}
            />
          </Field>
        </FieldGroup>

        {/* === Appearance ===================================================== */}
        <SettingsSection
          title="Appearance"
          description="Describe the appearance of your avatar."
        >
          {/* Basic Info — three side-by-side dropdowns */}
          <SubField label="Basic Info">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 12,
              }}
            >
              <SelectField
                label="Gender"
                value={draft.gender ?? SETTINGS_DEFAULTS.gender}
                options={GENDER_OPTIONS}
                onChange={(v) => set('gender', v)}
              />
              <SelectField
                label="Age"
                value={draft.ageRange ?? SETTINGS_DEFAULTS.ageRange}
                options={AGE_OPTIONS}
                onChange={(v) => set('ageRange', v)}
              />
              <SelectField
                label="Ethnicity"
                value={draft.appearanceEthnicity ?? SETTINGS_DEFAULTS.appearanceEthnicity}
                options={ETHNICITY_OPTIONS}
                onChange={(v) => set('appearanceEthnicity', v)}
              />
            </div>
          </SubField>

          {/* Outfit — textarea + preset chips */}
          <SubField label="Outfit" optional>
            <TextArea
              value={draft.outfit ?? ''}
              onChange={(v) => set('outfit', v)}
              placeholder="e.g. casual, formal, sporty, business, trendy, vintage…"
              rows={2}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              <PresetChip frontIcon={Shuffle} onClick={handleRandomizeOutfit}>
                Randomize
              </PresetChip>
              {OUTFIT_PRESETS.map((preset) => (
                <PresetChip
                  key={preset}
                  active={draft.outfit === preset}
                  onClick={() => handleOutfitPreset(preset)}
                >
                  {preset}
                </PresetChip>
              ))}
            </div>
          </SubField>

          {/* More details — textarea */}
          <SubField label="More details" optional>
            <TextArea
              value={draft.moreDetails ?? ''}
              onChange={(v) => set('moreDetails', v)}
              placeholder="e.g. hair, tattoo, beards, freckles…"
              rows={2}
            />
          </SubField>
        </SettingsSection>

        {/* === Behavior ====================================================== */}
        <SettingsSection
          title="Behavior"
          description="Describe the avatar's actions, expressions, or style."
        >
          <SubField>
            <TextArea
              value={draft.behavior ?? ''}
              onChange={(v) => set('behavior', v)}
              placeholder="e.g. confident gestures, warm smile, looks directly at the camera…"
              rows={2}
            />
          </SubField>

          <GuidanceScaleField
            value={draft.guidanceScale ?? SETTINGS_DEFAULTS.guidanceScale}
            onChange={(v) => set('guidanceScale', v)}
          />
        </SettingsSection>

        {/* === Background ==================================================== */}
        <SettingsSection
          title="Background"
          description="Describe the background scene of your avatar."
        >
          <SubField label="Scene type" optional>
            <TextArea
              value={draft.sceneType ?? ''}
              onChange={(v) => set('sceneType', v)}
              placeholder="e.g. living room, kitchen, gym, office, clinic, car, beach…"
              rows={2}
            />
          </SubField>

          <BrandingCard
            placement={draft.logoPlacement ?? SETTINGS_DEFAULTS.logoPlacement}
            onPlacementChange={(p) => set('logoPlacement', p)}
          />
        </SettingsSection>

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
// Play badge — circle + white triangle. Sized for both the main video preview
// (lg) and the small example thumbnails (sm).
// ---------------------------------------------------------------------------

function PlayBadge({ size = 'lg' }: { size?: 'lg' | 'sm' }) {
  const dim = size === 'lg' ? 48 : 22;
  const tri = size === 'lg' ? 14 : 7;
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim,
        height: dim,
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.55)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
      }}
    >
      <span
        style={{
          display: 'block',
          width: 0,
          height: 0,
          marginLeft: size === 'lg' ? 3 : 1,
          borderTop: `${tri}px solid transparent`,
          borderBottom: `${tri}px solid transparent`,
          borderLeft: `${tri * 1.4}px solid var(--light-100)`,
        }}
      />
    </span>
  );
}

// ---------------------------------------------------------------------------
// VideoPreview — portrait (9:16-ish) thumbnail that reads like a video: image
// with a centered play badge. A mock — no real playback.
// ---------------------------------------------------------------------------

function VideoPreview({ imageUrl, label }: { imageUrl: string; label: string }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '9 / 16',
        borderRadius: 12,
        overflow: 'hidden',
        background: 'var(--dark-4)',
        border: '1px solid var(--dark-8)',
      }}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={label}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PlayBadge size="lg" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// UploadMediaTile — large dashed tile for the start-blank / upload-your-own
// path. Mock only: clicking pretends a file was chosen.
// ---------------------------------------------------------------------------

function UploadMediaTile({ onUpload }: { onUpload: () => void }) {
  return (
    <button
      type="button"
      onClick={onUpload}
      style={{
        width: '100%',
        aspectRatio: '9 / 16',
        borderRadius: 12,
        border: '1px dashed var(--dark-15)',
        background: 'var(--dark-2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        cursor: 'pointer',
        padding: 16,
        textAlign: 'center',
        font: 'inherit',
        color: 'inherit',
        transition: 'border-color 160ms ease, background 160ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--dark-40)';
        e.currentTarget.style.background = 'var(--dark-4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--dark-15)';
        e.currentTarget.style.background = 'var(--dark-2)';
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Upload size={20} color="var(--dark-80)" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>
          Upload a video or photo of your avatar
        </Text>
        <Text style={{ fontSize: 12, color: 'var(--dark-60)' }}>
          MP4, MOV, JPG or PNG
        </Text>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Example videos strip — used under the video preview. Horizontally-scrollable
// row of 80px-tall thumbs, each with a tiny play badge + duration tag.
// ---------------------------------------------------------------------------

function ExampleVideosStrip({ videos }: { videos: ExampleVideo[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Text style={{ fontSize: 12, fontWeight: 500, color: 'var(--dark-60)' }}>
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
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PlayBadge size="sm" />
            </div>
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

// Channel + status meta both render via StatusPill (design system). Tones map
// the channel/status concept to a sensible semantic color — no hand-rolled hex.
const TYPE_CHIP: Record<CampaignChannel, { label: string; tone: StatusPillTone }> = {
  paid: { label: 'Paid Social', tone: 'info' },
  organic: { label: 'Organic Social', tone: 'success' },
};

const STATUS_META: Record<CampaignStatus, { label: string; tone: StatusPillTone }> = {
  live: { label: 'Live', tone: 'success' },
  scheduled: { label: 'Scheduled', tone: 'info' },
  ended: { label: 'Ended', tone: 'neutral' },
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
          <StatusPill tone={chip.tone} size="sm">
            {chip.label}
          </StatusPill>
          <StatusPill tone={status.tone} size="sm">
            {status.label}
          </StatusPill>
          <Text style={{ fontSize: 12, color: 'var(--dark-60)' }}>
            · {campaign.dateHint}
          </Text>
        </div>
      </div>
    </div>
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
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      style={{ ...inputBaseStyle, resize: 'vertical', lineHeight: 1.5 }}
    />
  );
}

// ---------------------------------------------------------------------------
// Settings section — bold title + muted one-line description, then children.
// Used for the Appearance / Behavior / Background groups in the editor.
// ---------------------------------------------------------------------------

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        paddingTop: 16,
        borderTop: '1px solid var(--dark-8)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Text style={{ fontSize: 16, fontWeight: 500, color: 'var(--dark-90)' }}>
          {title}
        </Text>
        <Text style={{ fontSize: 14, color: 'var(--dark-60)' }}>{description}</Text>
      </div>
      {children}
    </div>
  );
}

// A labeled sub-field inside a settings section. When `optional`, the label
// reads "<label>" in normal weight with "(optional)" muted alongside it.
function SubField({
  label,
  optional = false,
  children,
}: {
  label?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && (
        <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>
          {label}
          {optional && (
            <span style={{ fontWeight: 400, color: 'var(--dark-60)' }}> (optional)</span>
          )}
        </Text>
      )}
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SelectField — labeled native <select> styled to match the text inputs.
// (Matches the file's existing "inline native control" convention.)
// ---------------------------------------------------------------------------

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Text style={{ fontSize: 12, color: 'var(--dark-60)' }}>{label}</Text>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            ...inputBaseStyle,
            appearance: 'none',
            WebkitAppearance: 'none',
            paddingRight: 32,
            cursor: 'pointer',
          }}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'inline-flex',
            pointerEvents: 'none',
          }}
        >
          <ChevronDown size={16} color="var(--dark-60)" />
        </span>
      </div>
    </label>
  );
}

// ---------------------------------------------------------------------------
// PresetChip — small pill button used for the Outfit presets row.
// ---------------------------------------------------------------------------

function PresetChip({
  children,
  onClick,
  active = false,
  frontIcon: FrontIcon,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  frontIcon?: (props: { size?: number; color?: string }) => ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 999,
        border: `1px solid ${active ? 'var(--dark-90)' : 'var(--dark-8)'}`,
        background: active ? 'var(--dark-90)' : 'var(--light-100)',
        color: active ? 'var(--light-100)' : 'var(--dark-80)',
        fontFamily: "'Sohne', sans-serif",
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'border-color 160ms ease, background 160ms ease',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.borderColor = 'var(--dark-15)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.borderColor = 'var(--dark-8)';
      }}
    >
      {FrontIcon && (
        <FrontIcon size={16} color={active ? 'var(--light-100)' : 'var(--dark-60)'} />
      )}
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// GuidanceScaleField — label + help icon, slider (0–2, step 0.1), numeric
// readout. All on one row.
// ---------------------------------------------------------------------------

function GuidanceScaleField({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>
          Guidance scale
        </Text>
        <span
          title="How closely the avatar follows your description. Higher values stay closer; lower values allow more variety."
          style={{ display: 'inline-flex', cursor: 'help' }}
        >
          <Help size={16} color="var(--dark-40)" />
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input
          type="range"
          min={0}
          max={2}
          step={0.1}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--dark-90)', cursor: 'pointer' }}
        />
        <input
          type="number"
          min={0}
          max={2}
          step={0.1}
          value={value.toFixed(1)}
          onChange={(e) => {
            const next = parseFloat(e.target.value);
            if (!Number.isNaN(next)) onChange(Math.min(2, Math.max(0, next)));
          }}
          style={{
            ...inputBaseStyle,
            width: 64,
            flexShrink: 0,
            padding: '8px 10px',
            textAlign: 'center',
          }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BrandingCard — collapsible card (caret toggle, expanded by default) with a
// logo upload tile + two logo-placement option cards.
// ---------------------------------------------------------------------------

function BrandingCard({
  placement,
  onPlacementChange,
}: {
  placement: LogoPlacement;
  onPlacementChange: (p: LogoPlacement) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const Caret = expanded ? ChevronUp : ChevronDown;

  return (
    <div
      style={{
        border: '1px solid var(--dark-8)',
        borderRadius: 10,
        background: 'var(--light-100)',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '12px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          font: 'inherit',
          color: 'inherit',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>
            Branding
          </Text>
          <Text style={{ fontSize: 12, color: 'var(--dark-60)' }}>
            Show your Brand Kit logo on this avatar's videos.
          </Text>
        </div>
        <Caret size={20} color="var(--dark-60)" />
      </button>

      {expanded && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: '0 16px 16px',
          }}
        >
          {/* Logo placement — logo comes from the Brand Kit, not uploaded here. */}
          <SubField label="Logo placement">
            <Text style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: -4 }}>
              Uses your Brand Kit logo. Update it in Brand Kit settings.
            </Text>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 12,
              }}
            >
              <PlacementOption
                variant="bottom"
                label="Near the avatar"
                selected={placement === 'bottom'}
                onSelect={() => onPlacementChange('bottom')}
              />
              <PlacementOption
                variant="floating"
                label="Floating above"
                selected={placement === 'floating'}
                onSelect={() => onPlacementChange('floating')}
              />
            </div>
          </SubField>
        </div>
      )}
    </div>
  );
}

// A single logo-placement option card with a mock illustration. Selected state
// uses a dark border (NOT purple) and a check badge.
function PlacementOption({
  variant,
  label,
  selected,
  onSelect,
}: {
  variant: LogoPlacement;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 8,
        borderRadius: 10,
        border: `2px solid ${selected ? 'var(--dark-90)' : 'var(--dark-8)'}`,
        background: 'var(--light-100)',
        cursor: 'pointer',
        font: 'inherit',
        color: 'inherit',
        textAlign: 'left',
        transition: 'border-color 160ms ease',
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.borderColor = 'var(--dark-15)';
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.borderColor = 'var(--dark-8)';
      }}
    >
      {selected && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'var(--dark-90)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check size={16} color="var(--light-100)" />
        </span>
      )}
      <PlacementMock variant={variant} />
      <Text style={{ fontSize: 12, color: 'var(--dark-80)' }}>{label}</Text>
    </button>
  );
}

// Simple gray placeholder illustration depicting where the logo sits relative
// to the avatar. A circle = avatar head, rounded rect = logo chip.
function PlacementMock({ variant }: { variant: LogoPlacement }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '4 / 3',
        borderRadius: 8,
        background: 'var(--dark-4)',
        overflow: 'hidden',
      }}
    >
      {/* avatar silhouette */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 8,
          transform: 'translateX(-50%)',
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'var(--dark-15)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: -8,
          transform: 'translateX(-50%)',
          width: 40,
          height: 26,
          borderRadius: '20px 20px 0 0',
          background: 'var(--dark-15)',
        }}
      />
      {/* logo chip */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          ...(variant === 'bottom'
            ? { bottom: 6 }
            : { top: 8 }),
          width: 26,
          height: 10,
          borderRadius: 3,
          background: 'var(--dark-40)',
        }}
      />
    </div>
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
