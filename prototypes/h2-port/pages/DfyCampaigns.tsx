import { useState, useEffect } from 'react';
import { Button, Text } from '@/components';
import { StatusPill } from '@/staging';
import AlertTriangle from '@/icons/20/AlertTriangle';
import ArrowRefresh from '@/icons/20/ArrowRefresh';
import ArrowRight from '@/icons/20/ArrowRight';
import Check2 from '@/icons/20/Check2';
import CreditsSparkle from '@/icons/20/CreditsSparkle';
import Edit1 from '@/icons/20/Edit1';
import Plus from '@/icons/20/Plus';
import Stars from '@/icons/20/Stars';
import { H2Layout } from '../H2Layout';
import StillImageIcon from '../StillImageIcon';

// ─── TYPES ─────────────────────────────────────────────────────────

type Stage = 'brief' | 'generating' | 'review';
type Goal = 'awareness' | 'lead-gen' | 'engagement' | 'conversion';
type Platform = 'linkedin' | 'instagram' | 'facebook' | 'twitter' | 'tiktok';
type ContentType = 'still' | 'carousel' | 'short-video' | 'story';
type FlagType = 'copy-voice' | 'caption-platform' | 'visual-accuracy' | 'design-direction';

interface Variant {
  id: number;
  img: string;
  copy: string;
  caption: string;
  visualBrief: string;
}

interface Topic {
  id: string;
  headline: string;
  platform: Platform;
  contentType: ContentType;
  recommendedVariant: number;
  variants: [Variant, Variant, Variant];
  flagType?: FlagType;
  flagNote?: string;
}

interface TopicState {
  selectedVariant: number;
  accepted: boolean;
  showNote: boolean;
  note: string;
  regenerating: boolean;
}

// ─── DISPLAY MAPS ──────────────────────────────────────────────────

const PLATFORM_LABEL: Record<Platform, string> = {
  linkedin: 'LinkedIn', instagram: 'Instagram', facebook: 'Facebook', twitter: 'X', tiktok: 'TikTok',
};
const PLATFORM_COLOR: Record<Platform, string> = {
  linkedin: '#0A66C2', instagram: '#C13584', facebook: '#1877F2', twitter: '#111', tiktok: '#010101',
};
const CONTENT_LABEL: Record<ContentType, string> = {
  still: 'Still', carousel: 'Carousel', 'short-video': 'Reel', story: 'Story',
};
const FLAG_LABEL: Record<FlagType, string> = {
  'copy-voice': 'Brand voice', 'caption-platform': 'Caption fit',
  'visual-accuracy': 'Visual accuracy', 'design-direction': 'Design direction',
};
const GOAL_LABEL: Record<Goal, string> = {
  awareness: 'Awareness', 'lead-gen': 'Lead generation', engagement: 'Engagement', conversion: 'Conversion',
};
const ALL_PLATFORMS: Platform[] = ['linkedin', 'instagram', 'facebook', 'twitter', 'tiktok'];

// ─── PHOTOS ────────────────────────────────────────────────────────

const P = {
  house1: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=750&fit=crop',
  house2: 'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=600&h=750&fit=crop',
  house3: 'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=600&h=750&fit=crop',
  painter1: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=750&fit=crop',
  painter2: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=750&fit=crop',
  interior: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&h=750&fit=crop',
  exterior1: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&h=750&fit=crop',
  crew: 'https://images.unsplash.com/photo-1607400201515-c2c41c07d307?w=600&h=750&fit=crop',
};

// Drive media thumbnails
const DRIVE_THUMBS = [P.house1, P.painter1, P.house2, P.painter2];

// ─── MOCK DATA ─────────────────────────────────────────────────────

const THEME = {
  headline: 'Spring Refresh, Done Right',
  rationale: "Based on the Apr 28 call, Sarah emphasized the spring promotion window and wanted to lead with the prep process as a differentiator from DIY. The brand brain stresses local trust — not discounts or urgency hooks.",
  visualDirection: "Warm spring afternoon light, before/after exteriors, clean professional crew presence. Use the project photos from Drive — avoid anything that reads as stock.",
};

const TOPICS: Topic[] = [
  {
    id: 't1', headline: 'The Before & After That Started It All',
    platform: 'instagram', contentType: 'still', recommendedVariant: 2,
    variants: [
      { id: 1, img: P.house1, copy: "Ready to fall in love with your home again? This Austin exterior went from dull to dazzling with CertaPro's spring color refresh. Professional prep, premium paint, and a team that treats your home like their own.", caption: "Transform your home this spring 🏡 Professional exterior painting by CertaPro Austin. #ExteriorPainting #AustinHomes #SpringRefresh", visualBrief: 'Split-panel before/after. Left: original dull beige. Right: fresh warm gray. Natural spring light.' },
      { id: 2, img: P.house2, copy: "Same house. Different story. Our Austin team handled everything — prep, prime, paint — in 3 days flat. The homeowners said they drove past their own house twice. That's the feeling we work for.", caption: "Same house. Different story. 🏡 Spring is the perfect time for an exterior refresh. CertaPro Austin delivers in 3 days. Book a free estimate via link in bio. #CertaProAustin #BeforeAndAfter", visualBrief: 'Use the Martinez project photos from Drive. Driveway-perspective before in background, after shot dominant in foreground.' },
      { id: 3, img: P.house3, copy: "Three days. One crew. A completely different home. This spring exterior refresh went from tired to timeless. If your home's been telling you it's ready for a change, we'd love to help.", caption: "From tired to timeless in 3 days 🌿 CertaPro Austin brought this spring refresh to life. Ready for yours? Free estimates now open. #SpringPainting #AustinPainters", visualBrief: 'Full-width after shot at golden hour. Crew members visible in background, slightly blurred.' },
    ],
  },
  {
    id: 't2', headline: 'Choosing Your Spring Color Palette',
    platform: 'instagram', contentType: 'carousel', recommendedVariant: 2,
    flagType: 'copy-voice',
    flagNote: "Variant 1 leans on emoji-heavy casual hooks — not consistent with CertaPro's brand voice (professional, direct, locally grounded). Variants 2 and 3 match better.",
    variants: [
      { id: 1, img: P.interior, copy: "Color obsessed? Same 😍 Swipe through our top spring picks for Austin homes — we're LOVING warm terracottas and soft sage greens this season. Which one is giving your home the glow-up it deserves?", caption: "Your spring palette inspo is here 🎨✨ Swipe to see our fave color picks! Drop yours in the comments 👇 #ColorInspiration #SpringPalette", visualBrief: 'Slide 1: color swatch grid. Slides 2–5: each color shown on a real Austin home.' },
      { id: 2, img: P.house1, copy: "The right exterior color does more than refresh your home — it reflects the neighborhood and the light. Austin's limestone palette and warm afternoons favor warm whites, muted terracottas, and deep sage. Here's how to choose with confidence.", caption: "Choosing an exterior color in Austin is a different game than most markets. Warm afternoon light, limestone architecture, and HOA expectations all factor in. Swipe for our 2026 spring color guide. #CertaProAustin #ExteriorColor", visualBrief: 'Carousel: headline slide with neutral bg, then 5 Austin homes showing featured colors. Use color swatch photos from Drive.' },
      { id: 3, img: P.exterior1, copy: "We've painted 500+ Austin homes. The palettes that consistently work here share three things: they read warm in afternoon light, hold up against Austin limestone, and age without looking dated.", caption: "500+ Austin homes painted. These are the exterior palettes that consistently work here. Swipe through our spring 2026 color guide. #AustinPainters #ExteriorColor #SpringRefresh", visualBrief: 'Lead with freshly painted Austin home. Follow with 4 color comparison slides using actual project photography.' },
    ],
  },
  {
    id: 't3', headline: 'Why Spring Is the Best Season to Paint',
    platform: 'linkedin', contentType: 'still', recommendedVariant: 1,
    variants: [
      { id: 1, img: P.painter1, copy: "Spring is the professional painter's favorite season — and not just because of the weather. Temperature stability between 50–85°F, lower humidity, and longer daylight hours create ideal conditions for latex-based paints to cure properly. In Austin, that window runs late March through mid-May.", caption: "Exterior paint performs best between 50–85°F with stable humidity — a window Austin gets reliably in spring. That's the professional case for acting now, not waiting until summer. CertaPro Austin | Free estimates open for April and May. #ExteriorPainting #AustinContractors", visualBrief: 'Clean editorial shot of crew painting an exterior on a bright spring morning. Uniforms visible, focused on work.' },
      { id: 2, img: P.house2, copy: "Spring isn't just the most popular time to paint — it's technically the best. Cooler temps, stable humidity, and longer days mean better adhesion, faster cure times, and fewer weather delays. Austin's window is open now.", caption: "Spring isn't just the most popular time to paint — it's technically the best. Stable temps, lower humidity, long drying days. Austin's window is open now. CertaPro | Free exterior estimates. #ExteriorPainting #HomeMaintenance", visualBrief: 'Wide shot of Austin home exterior, freshly painted, bright spring sky. Crew equipment in foreground.' },
      { id: 3, img: P.painter2, copy: "The paint jobs that last longest in Austin share one thing: they were applied in spring. Optimal temperatures, stable humidity, and longer drying windows aren't nice-to-haves — they determine how long your paint job actually lasts.", caption: "The paint jobs that last longest in Austin were applied in spring conditions. It's not just aesthetics — it's adhesion, cure time, and longevity. Book your spring estimate before our calendar fills. #PaintingContractors #ExteriorPaint", visualBrief: "Close-up of fresh paint application showing crisp edge work. Use the Thornberry St. project photos — best spring-light shots in Drive." },
    ],
  },
  {
    id: 't4', headline: 'Your Spring Exterior Transformation Starts Here',
    platform: 'facebook', contentType: 'still', recommendedVariant: 3,
    flagType: 'caption-platform',
    flagNote: 'All three captions are short and hashtag-heavy — Instagram format, not Facebook. Facebook performs better with longer conversational copy and a direct ask. The post copy is strong; captions need a rewrite for the platform.',
    variants: [
      { id: 1, img: P.house1, copy: "This Austin home went from worn to refreshed in a single spring week. New exterior paint, new curb appeal, same neighborhood. CertaPro handled prep, paint, and cleanup — the homeowners just had to come home to it.", caption: 'Spring exterior refresh 🌿 CertaPro Austin | Book your free estimate. #SpringPainting #AustinHomes', visualBrief: 'Full facade shot after the refresh. Warm spring afternoon. Looks clearly improved but realistic.' },
      { id: 2, img: P.house3, copy: "Spring is here and Austin homes are getting their refresh. Whether it's a full exterior repaint or a trim update, CertaPro's local team delivers professional results with zero headache. Free estimates still available for April.", caption: 'Spring is the perfect time to refresh your Austin exterior. Book now while April slots are open. #CertaPro #ExteriorPainting', visualBrief: 'Side-by-side comparison: worn exterior vs. freshly painted result. Include one crew member in the frame.' },
      { id: 3, img: P.painter1, copy: "Thinking about your home's exterior? Here's what the process actually looks like — from the first walk-through to the final cleanup. CertaPro's Austin team has done this 500+ times in this city. It's a 3–5 day job that changes how you feel about coming home.", caption: "If you've been putting off an exterior refresh, here's what the process actually looks like. It's a 3–5 day project — and it changes how you feel about pulling up to your own home. Free estimates open for April and May — drop a comment or message us to get started.", visualBrief: 'Editorial shot of crew doing the final walkthrough with the homeowner. Professional, warm, local. Pull from team photos in Drive.' },
    ],
  },
  {
    id: 't5', headline: 'The CertaPro Prep Difference',
    platform: 'linkedin', contentType: 'carousel', recommendedVariant: 1,
    flagType: 'visual-accuracy',
    flagNote: "The visual brief describes generic prep steps without referencing the 14 project photos available in Drive — specifically the power wash sequence and primer close-ups from the Lakeway project. Update to use those assets directly.",
    variants: [
      { id: 1, img: P.painter2, copy: "Most paint jobs fail because of inadequate prep — not the paint itself. CertaPro's process starts with a full exterior inspection, power washing, surface repair, and primer before a single drop of finish coat goes on. The work you don't see is what makes the work you do see last.", caption: "Most exterior paint failures trace back to one thing: inadequate prep. CertaPro's process covers inspection, power wash, surface repair, and primer before finish coat application. The prep is the job. CertaPro Austin | Free exterior estimates. #ExteriorPainting", visualBrief: 'Carousel: headline card → power wash (use Lakeway sequence from Drive) → primer close-ups (Drive) → finished result → crew portrait.' },
      { id: 2, img: P.painter1, copy: "The difference between a paint job that lasts 3 years and one that lasts 10 is almost always in the prep. At CertaPro Austin, we treat prep as the core of the job — not a step to rush through.", caption: "The paint is only as good as what's underneath it. At CertaPro Austin, prep isn't a step we rush — it's the foundation. #ExteriorPainting #AustinContractors", visualBrief: 'Process walkthrough carousel: 5 slides showing each prep stage. Text overlays labeling each step.' },
      { id: 3, img: P.exterior1, copy: "Shortcuts in prep are why paint jobs fail early. CertaPro's spec process doesn't allow them — every job follows the same preparation standards regardless of size.", caption: "Consistency is the CertaPro standard. Every job follows the same prep spec — inspection, washing, repair, primer, finish. CertaPro Austin. #QualityPainting", visualBrief: 'Single editorial shot of crew member doing surface inspection before priming. Pull from the Lakeway project crew shots in Drive.' },
    ],
  },
  {
    id: 't6', headline: 'Meet the Austin Team Behind Your Refresh',
    platform: 'instagram', contentType: 'still', recommendedVariant: 2,
    variants: [
      { id: 1, img: P.painter1, copy: "The crew you're trusting with your home has been working together for years. CertaPro Austin isn't a franchise that hires day labor — it's the same local team, project after project, building a reputation one street at a time.", caption: 'Behind every CertaPro project is a team that knows Austin. Same crew, same standards — project after project. #CertaProAustin #LocalCrew', visualBrief: 'Candid crew portrait in front of a recently completed project. Warm natural light. CertaPro uniforms.' },
      { id: 2, img: P.painter2, copy: "Behind every CertaPro job in Austin is a crew that shows up the same way every time — uniformed, prepared, and accountable. These aren't subcontractors rotated in by zip code. They're the same team our customers ask for by name.", caption: "These are the people who'll be at your home. Same crew. Same standards. Same accountability — every project. Meet us via the link in bio. #CertaProAustin #LocalTeam #ExteriorPainting", visualBrief: 'Use the lead crew portrait from Drive (in front of the Westlake job). Frame with Austin-area home recognizable in background. Natural light.' },
      { id: 3, img: P.house1, copy: "You're trusting someone with your biggest asset. We take that seriously. CertaPro Austin's team has been together long enough that customers know them by name — and they know the neighborhoods they've worked in.", caption: "You're trusting someone with your home. We don't take that lightly. CertaPro Austin's crew — same faces, same standards, same neighborhoods. #AustinPainters #TrustYourCrew", visualBrief: 'Action shot at work, mid-project, focused on craftsmanship. One team member facing camera with natural expression. From Drive.' },
    ],
  },
];

const INITIAL_TOPIC_STATES: Record<string, TopicState> = Object.fromEntries(
  TOPICS.map((t) => [t.id, {
    selectedVariant: t.recommendedVariant,
    accepted: false,
    showNote: false,
    note: '',
    regenerating: false,
  }])
);

// ─── CONTENT TYPE META ─────────────────────────────────────────────

const CT_META: Record<ContentType, { color: string; glyph: string }> = {
  still: { color: '#E03737', glyph: '' },
  carousel: { color: '#0095A8', glyph: '<path d="M8 3h13v13H8z" /><path d="M4 8v9a4 4 0 0 0 4 4h9" />' },
  'short-video': { color: '#E07000', glyph: '<path d="M3 3l18 9L3 21V3z" />' },
  story: { color: '#0059B3', glyph: '<rect x="6" y="3" width="12" height="18" rx="2" />' },
};

// ─── ATOMS ─────────────────────────────────────────────────────────

function PlatformDot({ platform }: { platform: Platform }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: PLATFORM_COLOR[platform] }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: PLATFORM_COLOR[platform], display: 'inline-block' }} />
      {PLATFORM_LABEL[platform]}
    </span>
  );
}

function ContentTypeBadge({ ct }: { ct: ContentType }) {
  const meta = CT_META[ct];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, color: 'var(--dark-60)' }}>
      {ct === 'still' ? (
        <StillImageIcon size={13} color={meta.color} />
      ) : (
        <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke={meta.color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: meta.glyph }} />
      )}
      {CONTENT_LABEL[ct]}
    </span>
  );
}

function FlagChip({ type }: { type: FlagType }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#8a5a00', backgroundImage: 'linear-gradient(rgba(252,183,40,0.22), rgba(252,183,40,0.22)), linear-gradient(var(--light-100), var(--light-100))', border: '1px solid rgba(252,183,40,0.4)', padding: '2px 7px', borderRadius: 5 }}>
      <AlertTriangle />
      {FLAG_LABEL[type]}
    </span>
  );
}

function SpinnerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: 'dfy-spin 0.85s linear infinite' }}>
      <style>{`@keyframes dfy-spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 14" />
    </svg>
  );
}

// ─── POST CARD ─────────────────────────────────────────────────────

function PostCard({ topic, state, onSelectVariant, onAccept, onToggleNote, onNoteChange, onRegenerate }: {
  topic: Topic;
  state: TopicState;
  onSelectVariant: (v: number) => void;
  onAccept: () => void;
  onToggleNote: () => void;
  onNoteChange: (n: string) => void;
  onRegenerate: () => void;
}) {
  const variant = topic.variants.find((v) => v.id === state.selectedVariant)!;
  const isFlagged = !!topic.flagType && !state.accepted;

  return (
    <div style={{
      background: 'var(--light-100)',
      border: `1.5px solid ${state.accepted ? 'rgba(4,175,0,0.35)' : isFlagged ? 'rgba(252,183,40,0.45)' : 'var(--dark-8)'}`,
      borderRadius: 12,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      transition: 'border-color 0.2s ease',
    }}>

      {/* Card header */}
      <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid var(--dark-6)' }}>
        <PlatformDot platform={topic.platform} />
        <span style={{ color: 'var(--dark-20)', fontSize: 12 }}>·</span>
        <ContentTypeBadge ct={topic.contentType} />
        <div style={{ flex: 1 }} />
        {isFlagged && <FlagChip type={topic.flagType!} />}
        {state.accepted && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--positive-60)' }}>
            <Check2 /> Accepted
          </span>
        )}
      </div>

      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '4 / 5', background: `center/cover url('${variant.img}'), var(--dark-4)`, backgroundImage: `url('${variant.img}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {state.regenerating && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
            <SpinnerIcon />
            <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>Regenerating…</span>
          </div>
        )}
      </div>

      {/* Caption */}
      <div style={{ padding: '10px 12px 8px', fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.45 }}>
        {variant.caption.length > 90 ? variant.caption.slice(0, 88).replace(/\s+\S*$/, '') + ' …' : variant.caption}
        {variant.caption.length > 90 && <span style={{ color: 'var(--dark-40)' }}> more</span>}
      </div>

      {/* Quality note */}
      {isFlagged && topic.flagNote && (
        <div style={{ margin: '0 12px 8px', padding: '8px 10px', borderRadius: 7, background: 'rgba(252,183,40,0.1)', border: '1px solid rgba(252,183,40,0.35)', fontSize: 12, color: 'var(--dark-70)', lineHeight: 1.5 }}>
          {topic.flagNote}
        </div>
      )}

      {/* Regeneration note input */}
      {state.showNote && (
        <div style={{ margin: '0 12px 8px' }}>
          <textarea
            value={state.note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Describe the correction — the agent will apply it and regenerate..."
            style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 7, border: '1.5px solid var(--action-40)', background: 'var(--action-5)', fontSize: 12, color: 'var(--dark-90)', lineHeight: 1.5, resize: 'vertical', minHeight: 60, fontFamily: 'inherit', outline: 'none' }}
          />
        </div>
      )}

      {/* Variant selector + actions */}
      <div style={{ padding: '8px 12px 12px', display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid var(--dark-6)' }}>
        {/* Variant tabs */}
        <div style={{ display: 'flex', gap: 3, marginRight: 4 }}>
          {([1, 2, 3] as const).map((v) => {
            const isRec = v === topic.recommendedVariant;
            const isSel = v === state.selectedVariant;
            return (
              <button key={v} onClick={() => onSelectVariant(v)} style={{
                width: 26, height: 26, borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: isSel ? 700 : 500,
                background: isSel ? 'var(--action-50)' : isRec ? 'var(--action-10)' : 'var(--dark-8)',
                color: isSel ? 'white' : isRec ? 'var(--action-60)' : 'var(--dark-40)',
                position: 'relative', fontFamily: 'inherit', transition: 'background 0.12s',
              }}>
                {v}
                {isRec && !isSel && <span style={{ position: 'absolute', top: -2, right: -2, width: 5, height: 5, borderRadius: '50%', background: 'var(--action-50)', border: '1.5px solid var(--light-100)' }} />}
              </button>
            );
          })}
        </div>

        {!state.accepted && (
          <>
            <Button variant="primary" size="xs" frontIcon={Check2} onPress={onAccept}>Accept</Button>
            {state.showNote ? (
              <Button variant="secondary" size="xs" frontIcon={ArrowRefresh} onPress={onRegenerate} isDisabled={state.regenerating}>
                {state.regenerating ? 'Regenerating…' : 'Regenerate'}
              </Button>
            ) : (
              <button onClick={onToggleNote} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--dark-40)', cursor: 'pointer', fontFamily: 'inherit', padding: '4px 6px', borderRadius: 5 }}>
                Regenerate with note
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── AGENT STEP ────────────────────────────────────────────────────

function AgentStep({ label, detail, status }: { label: string; detail: string; status: 'pending' | 'running' | 'done' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', opacity: status === 'pending' ? 0.38 : 1, transition: 'opacity 0.3s' }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: status === 'done' ? 'var(--positive-50)' : status === 'running' ? 'var(--action-10)' : 'var(--dark-8)', color: status === 'done' ? 'white' : status === 'running' ? 'var(--action-60)' : 'var(--dark-20)' }}>
        {status === 'done' ? <Check2 /> : status === 'running' ? <SpinnerIcon /> : <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'block' }} />}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--dark-40)', marginTop: 1 }}>{detail}</div>
      </div>
    </div>
  );
}

// ─── STAGE INDICATOR ───────────────────────────────────────────────

function StageIndicator({ stage }: { stage: Stage }) {
  const STAGES: { id: Stage; label: string }[] = [
    { id: 'brief', label: 'Context & inputs' },
    { id: 'generating', label: 'Generating' },
    { id: 'review', label: 'Review' },
  ];
  const activeIdx = STAGES.findIndex((s) => s.id === stage);
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {STAGES.map((s, i) => (
        <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: i < activeIdx ? 'var(--positive-50)' : i === activeIdx ? 'var(--action-50)' : 'var(--dark-10)', color: i <= activeIdx ? 'white' : 'var(--dark-30)', transition: 'all 0.2s' }}>
              {i < activeIdx ? <Check2 /> : i + 1}
            </div>
            <span style={{ fontSize: 13, fontWeight: i === activeIdx ? 600 : 400, color: i === activeIdx ? 'var(--dark-90)' : i < activeIdx ? 'var(--dark-50)' : 'var(--dark-30)' }}>{s.label}</span>
          </div>
          {i < STAGES.length - 1 && <div style={{ width: 20, height: 1, background: i < activeIdx ? 'var(--positive-50)' : 'var(--dark-10)', margin: '0 8px', transition: 'background 0.2s' }} />}
        </div>
      ))}
    </div>
  );
}

// ─── BRIEF VIEW ────────────────────────────────────────────────────

function BriefView({ goal, setGoal, platforms, togglePlatform, volume, setVolume, onGenerate }: {
  goal: Goal; setGoal: (g: Goal) => void;
  platforms: Set<Platform>; togglePlatform: (p: Platform) => void;
  volume: number; setVolume: (v: number) => void;
  onGenerate: () => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', paddingBottom: 40 }}>

      {/* LEFT: Context sources */}
      <div style={{ flex: '1 1 0', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dark-90)' }}>Client context</div>
          <button style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--dark-40)', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowRefresh /> Refresh
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Brand brain */}
          <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-90)' }}>Brand brain</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--dark-40)' }}>Updated May 28</span>
                <span style={{ color: 'var(--positive-60)', display: 'inline-flex' }}><Check2 /></span>
                <button style={{ background: 'none', border: 'none', color: 'var(--dark-30)', cursor: 'pointer', display: 'inline-flex', padding: 0 }}><Edit1 /></button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[
                { label: 'Voice', value: 'Professional, direct, locally grounded' },
                { label: 'Differentiator', value: 'Prep process + crew accountability' },
                { label: 'Tone', value: 'Confident without being salesy' },
                { label: 'Avoid', value: 'Discount framing, urgency hooks' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                  <span style={{ color: 'var(--dark-40)', width: 96, flexShrink: 0 }}>{label}</span>
                  <span style={{ color: 'var(--dark-80)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Campaign doc */}
          <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-90)' }}>Campaign doc</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--dark-40)' }}>Edited 2h ago</span>
                <span style={{ color: 'var(--positive-60)', display: 'inline-flex' }}><Check2 /></span>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-80)', marginBottom: 6 }}>Spring 2026 Exterior Campaign</div>
            <div style={{ fontSize: 12, color: 'var(--dark-40)', marginBottom: 8 }}>3 sections · Shared with Sarah Johnson</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {['Campaign brief', 'Client feedback — Apr 28', 'Reference posts'].map((s) => (
                <div key={s} style={{ fontSize: 12, color: 'var(--dark-60)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--dark-30)', flexShrink: 0, display: 'inline-block' }} />
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Drive media */}
          <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-90)' }}>Drive media</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--dark-40)' }}>14 assets</span>
                <span style={{ color: 'var(--positive-60)', display: 'inline-flex' }}><Check2 /></span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {DRIVE_THUMBS.map((src, i) => (
                <div key={i} style={{ width: 52, height: 52, borderRadius: 6, backgroundImage: `url('${src}')`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
              ))}
              <div style={{ width: 52, height: 52, borderRadius: 6, background: 'var(--dark-6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--dark-40)', flexShrink: 0 }}>+10</div>
              <span style={{ fontSize: 12, color: 'var(--dark-40)', marginLeft: 4 }}>CertaPro / Spring 2026</span>
            </div>
          </div>

          {/* Meeting summary */}
          <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-90)' }}>Meeting summary</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--dark-40)' }}>Apr 28 · Fathom</span>
                <span style={{ color: 'var(--positive-60)', display: 'inline-flex' }}><Check2 /></span>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.55 }}>
              "Spring window is the priority. Lead with the prep process story — not discounts. HOA neighborhoods are the key target this cycle. The Lakeway before/after is Sarah's anchor asset. She wants the team visible in at least 2 posts."
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT: Campaign inputs + generate */}
      <div style={{ width: 280, flexShrink: 0, position: 'sticky', top: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dark-90)', marginBottom: 20 }}>Campaign</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Goal */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--dark-50)', marginBottom: 8 }}>Goal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {(Object.keys(GOAL_LABEL) as Goal[]).map((g) => (
                <button key={g} onClick={() => setGoal(g)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, border: `1.5px solid ${goal === g ? 'var(--action-50)' : 'transparent'}`, background: goal === g ? 'var(--action-5)' : 'var(--dark-4)', color: goal === g ? 'var(--action-60)' : 'var(--dark-60)', fontSize: 13, fontWeight: goal === g ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.12s' }}>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${goal === g ? 'var(--action-50)' : 'var(--dark-20)'}`, background: goal === g ? 'var(--action-50)' : 'transparent', flexShrink: 0 }} />
                  {GOAL_LABEL[g]}
                </button>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--dark-50)', marginBottom: 8 }}>Platforms</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {ALL_PLATFORMS.map((p) => {
                const active = platforms.has(p);
                return (
                  <button key={p} onClick={() => togglePlatform(p)} style={{ padding: '4px 10px', borderRadius: 7, border: `1.5px solid ${active ? PLATFORM_COLOR[p] : 'var(--dark-10)'}`, background: active ? `${PLATFORM_COLOR[p]}14` : 'transparent', color: active ? PLATFORM_COLOR[p] : 'var(--dark-50)', fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }}>
                    {PLATFORM_LABEL[p]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--dark-50)', marginBottom: 8 }}>Posts</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {['−', '+'].map((sign, i) => (
                <button key={sign} onClick={() => setVolume(sign === '−' ? Math.max(2, volume - 1) : Math.min(20, volume + 1))} style={{ width: 30, height: 30, borderRadius: 7, border: '1.5px solid var(--dark-10)', background: 'var(--light-100)', cursor: 'pointer', fontSize: 16, color: 'var(--dark-60)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>{sign}</button>
              ))}
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--dark-90)', minWidth: 20, textAlign: 'center' }}>{volume}</span>
              <span style={{ fontSize: 12, color: 'var(--dark-40)' }}>{volume * 3} variants</span>
            </div>
          </div>

          {/* Products */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--dark-50)', marginBottom: 8 }}>Products to feature</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {['Exterior repaints', 'Color consultations', 'Prep service'].map((prod) => (
                <span key={prod} style={{ padding: '4px 10px', borderRadius: 7, background: 'var(--dark-6)', border: '1px solid var(--dark-8)', fontSize: 12, color: 'var(--dark-60)' }}>{prod}</span>
              ))}
              <button style={{ padding: '4px 10px', borderRadius: 7, border: '1.5px dashed var(--dark-20)', background: 'transparent', fontSize: 12, color: 'var(--dark-40)', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Plus /> Add
              </button>
            </div>
          </div>

          <div style={{ paddingTop: 4 }}>
            <Button variant="primary" size="md" endIcon={ArrowRight} onPress={onGenerate} style={{ width: '100%' }}>
              Generate campaign
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GENERATING VIEW ───────────────────────────────────────────────

function GeneratingView({ step, generatedTheme, onCancel }: {
  step: number;
  generatedTheme: boolean;
  onCancel: () => void;
}) {
  const steps = [
    { label: 'Assembling context', detail: 'Brand brain, Apr 28 meeting summary, 14 Drive assets' },
    { label: 'Theme agent', detail: 'Writing campaign theme and visual direction' },
    { label: 'Topic and content agents', detail: `${TOPICS.length} topics · ${TOPICS.length * 3} variants generating in parallel` },
    { label: 'Quality review', detail: 'Checking brand voice, captions, and visual accuracy across all variants' },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 48, gap: 32 }}>
      <div style={{ width: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--action-10)', color: 'var(--action-60)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditsSparkle />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dark-90)' }}>Generating your campaign</div>
            <div style={{ fontSize: 12, color: 'var(--dark-40)' }}>CertaPro Painters of Austin · Spring 2026</div>
          </div>
        </div>

        <div style={{ background: 'var(--light-100)', borderRadius: 12, border: '1px solid var(--dark-8)', padding: '2px 20px', marginBottom: 16 }}>
          {steps.map((s, i) => {
            const status = i < step ? 'done' : i === step ? 'running' : 'pending';
            return (
              <div key={i} style={{ borderBottom: i < steps.length - 1 ? '1px solid var(--dark-5)' : 'none' }}>
                <AgentStep label={s.label} detail={s.detail} status={status} />
              </div>
            );
          })}
        </div>

        <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--dark-40)', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
          Cancel
        </button>
      </div>

      {/* Live theme preview — appears when theme agent completes */}
      {generatedTheme && (
        <div style={{ width: 340, background: 'var(--light-100)', borderRadius: 12, border: '1px solid var(--dark-8)', padding: '16px 18px', opacity: generatedTheme ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Stars style={{ color: 'var(--action-50)' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--dark-40)', letterSpacing: 0.3 }}>THEME DRAFT</span>
          </div>
          <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--dark-90)', letterSpacing: '-0.2px', marginBottom: 10 }}>{THEME.headline}</div>
          <div style={{ fontSize: 12, color: 'var(--dark-50)', lineHeight: 1.55 }}>{THEME.rationale}</div>
        </div>
      )}
    </div>
  );
}

// ─── REVIEW VIEW ───────────────────────────────────────────────────

function ReviewView({ topicStates, onSelectVariant, onAccept, onAcceptAll, onToggleNote, onNoteChange, onRegenerate }: {
  topicStates: Record<string, TopicState>;
  onSelectVariant: (id: string, v: number) => void;
  onAccept: (id: string) => void;
  onAcceptAll: () => void;
  onToggleNote: (id: string) => void;
  onNoteChange: (id: string, note: string) => void;
  onRegenerate: (id: string) => void;
}) {
  const flaggedCount = TOPICS.filter((t) => t.flagType && !topicStates[t.id]?.accepted).length;
  const acceptedCount = Object.values(topicStates).filter((s) => s.accepted).length;
  const allAccepted = acceptedCount === TOPICS.length;

  return (
    <div style={{ paddingBottom: 40 }}>

      {/* Campaign theme */}
      <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, padding: '18px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
          <Stars style={{ color: 'var(--action-50)' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--dark-40)', letterSpacing: 0.3 }}>CAMPAIGN THEME</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--dark-90)', letterSpacing: '-0.3px', marginBottom: 12 }}>{THEME.headline}</div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--dark-30)', letterSpacing: 0.3, marginBottom: 4 }}>RATIONALE</div>
            <div style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.55 }}>{THEME.rationale}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--dark-30)', letterSpacing: 0.3, marginBottom: 4 }}>VISUAL DIRECTION</div>
            <div style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.55 }}>{THEME.visualDirection}</div>
          </div>
          <button style={{ background: 'none', border: 'none', color: 'var(--dark-30)', cursor: 'pointer', alignSelf: 'flex-start', display: 'inline-flex' }}><Edit1 /></button>
        </div>
      </div>

      {/* Quality / completion banner */}
      {!allAccepted && flaggedCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderRadius: 10, backgroundImage: 'linear-gradient(rgba(252,183,40,0.12), rgba(252,183,40,0.12)), linear-gradient(var(--light-100), var(--light-100))', border: '1px solid rgba(252,183,40,0.4)', marginBottom: 20, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle style={{ color: '#8a5a00', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--dark-80)' }}>
              <strong>{flaggedCount} of {TOPICS.length} topics</strong> have quality notes from the review agent.
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <Button variant="secondary" size="sm" frontIcon={ArrowRefresh}>Regenerate all flagged</Button>
            <Button variant="tertiary" size="sm" onPress={onAcceptAll}>Accept all</Button>
          </div>
        </div>
      )}

      {allAccepted && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderRadius: 10, background: 'rgba(4,175,0,0.08)', border: '1px solid rgba(4,175,0,0.3)', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Check2 style={{ color: 'var(--positive-60)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--dark-80)' }}>All {TOPICS.length} posts accepted. Ready to push to the client doc.</span>
          </div>
          <Button variant="primary" size="sm" endIcon={ArrowRight}>Push to client doc</Button>
        </div>
      )}

      {/* Progress dots */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: 'var(--dark-50)' }}>{acceptedCount} of {TOPICS.length} accepted</span>
        <div style={{ display: 'flex', gap: 5 }}>
          {TOPICS.map((t) => (
            <div key={t.id} style={{ width: 22, height: 4, borderRadius: 2, background: topicStates[t.id]?.accepted ? 'var(--positive-50)' : t.flagType ? 'rgba(252,183,40,0.6)' : 'var(--dark-10)', transition: 'background 0.2s' }} />
          ))}
        </div>
      </div>

      {/* Post grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'start' }}>
        {TOPICS.map((topic) => (
          <PostCard
            key={topic.id}
            topic={topic}
            state={topicStates[topic.id]}
            onSelectVariant={(v) => onSelectVariant(topic.id, v)}
            onAccept={() => onAccept(topic.id)}
            onToggleNote={() => onToggleNote(topic.id)}
            onNoteChange={(note) => onNoteChange(topic.id, note)}
            onRegenerate={() => onRegenerate(topic.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────

export function DfyCampaignsRoute() {
  const [stage, setStage] = useState<Stage>('brief');
  const [generatingStep, setGeneratingStep] = useState(0);
  const [generatedTheme, setGeneratedTheme] = useState(false);
  const [goal, setGoal] = useState<Goal>('awareness');
  const [platforms, setPlatforms] = useState<Set<Platform>>(new Set(['linkedin', 'instagram', 'facebook']));
  const [volume, setVolume] = useState(TOPICS.length);
  const [topicStates, setTopicStates] = useState<Record<string, TopicState>>(INITIAL_TOPIC_STATES);

  // Auto-advance generating animation
  useEffect(() => {
    if (stage !== 'generating') return;
    if (generatingStep >= 4) {
      const t = setTimeout(() => setStage('review'), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      if (generatingStep === 1) setGeneratedTheme(true);
      setGeneratingStep((s) => s + 1);
    }, 1400);
    return () => clearTimeout(t);
  }, [stage, generatingStep]);

  function togglePlatform(p: Platform) {
    setPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(p) && next.size > 1) next.delete(p); else next.add(p);
      return next;
    });
  }

  function handleGenerate() {
    setGeneratingStep(0);
    setGeneratedTheme(false);
    setStage('generating');
  }

  function updateTopic(id: string, patch: Partial<TopicState>) {
    setTopicStates((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  function handleRegenerate(id: string) {
    updateTopic(id, { regenerating: true });
    setTimeout(() => updateTopic(id, { regenerating: false, showNote: false }), 2400);
  }

  const acceptedCount = Object.values(topicStates).filter((s) => s.accepted).length;

  const topbarRight = stage === 'review' ? (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button variant="secondary" size="md" frontIcon={ArrowRefresh}>Regenerate all flagged</Button>
      <Button variant="primary" size="md" endIcon={ArrowRight}>Push to client doc</Button>
    </div>
  ) : stage === 'brief' ? (
    <StatusPill tone="neutral" size="sm">CertaPro Painters of Austin</StatusPill>
  ) : null;

  return (
    <H2Layout
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--dark-90)' }}>DFY Campaign</span>
          <StageIndicator stage={stage} />
        </div>
      }
      topbarRight={topbarRight}
    >
      {stage === 'brief' && (
        <BriefView
          goal={goal} setGoal={setGoal}
          platforms={platforms} togglePlatform={togglePlatform}
          volume={volume} setVolume={setVolume}
          onGenerate={handleGenerate}
        />
      )}
      {stage === 'generating' && (
        <GeneratingView step={generatingStep} generatedTheme={generatedTheme} onCancel={() => setStage('brief')} />
      )}
      {stage === 'review' && (
        <ReviewView
          topicStates={topicStates}
          onSelectVariant={(id, v) => updateTopic(id, { selectedVariant: v })}
          onAccept={(id) => updateTopic(id, { accepted: true, showNote: false })}
          onAcceptAll={() => setTopicStates((prev) => Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, { ...v, accepted: true, showNote: false }])))}
          onToggleNote={(id) => updateTopic(id, { showNote: !topicStates[id].showNote })}
          onNoteChange={(id, note) => updateTopic(id, { note })}
          onRegenerate={handleRegenerate}
        />
      )}
    </H2Layout>
  );
}
